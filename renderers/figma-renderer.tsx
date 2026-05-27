import * as path from 'path'
import { templates } from '../templates/registry'
import { brand } from '../brand'
import type { AssetSpec } from '../types'
import type { LayoutIntent, Region } from '../templates/shared/layout-intent'

// figma-renderer: AssetSpec -> { fileName, screenshotsToUpload, pluginCode }.
// Pure function. Does NOT call Figma MCP. Agent picks up the plan and runs the
// real upload/create steps via mcp__figma__create_new_file, upload_assets, use_figma.
//
// Plugin code shape: an async function body string that expects a global
// `IMAGE_HASHES: Record<string, string>` injected by the caller. Caller maps
// each path from `screenshotsToUpload` -> hash returned by upload_assets, then
// runs the plugin code inside Figma plugin context (use_figma).

const LOGO_DIR = path.resolve(__dirname, '../assets/logos')
const DECOR_DIR = path.resolve(__dirname, '../assets/decor')

export interface FigmaRenderPlan {
  fileName: string
  screenshotsToUpload: string[]
  pluginCode: string
  intent: LayoutIntent
  canvas: { width: number; height: number }
}

export interface IntentRenderInput {
  intent: LayoutIntent
  size: { width: number; height: number }
  fileName: string
  frameName?: string
}

// Phase 1 intent-first entry point. Caller supplies LayoutIntent + canvas size
// + fileName directly, bypassing template registry lookup. Used by slot-author
// files in slots/ folder and by Phase 3 recipe-driven generation.
export function buildFigmaRenderPlanFromIntent(
  input: IntentRenderInput,
  opts: { minify?: boolean } = { minify: true },
): FigmaRenderPlan {
  const uploads = collectUploads(input.intent)
  const frameName = input.frameName ?? input.fileName
  let pluginCode = emitPluginCode(input.intent, input.size, frameName)
  if (opts.minify !== false) {
    pluginCode = minifyPluginCode(pluginCode)
  }
  return {
    fileName: input.fileName,
    screenshotsToUpload: uploads,
    pluginCode,
    intent: input.intent,
    canvas: { width: input.size.width, height: input.size.height },
  }
}

export function buildFigmaRenderPlan(
  spec: AssetSpec,
  opts: { minify?: boolean } = { minify: true },
): FigmaRenderPlan {
  const tpl = templates[spec.templateId]
  if (!tpl) {
    throw new Error(
      `Unknown templateId: ${spec.templateId}. Known: ${Object.keys(templates).join(', ')}`,
    )
  }
  if (!tpl.variations.includes(spec.variation)) {
    throw new Error(
      `Unknown variation '${spec.variation}' for template '${spec.templateId}'. Known: ${tpl.variations.join(', ')}`,
    )
  }
  const intent = tpl.buildIntent(spec, brand)
  return buildFigmaRenderPlanFromIntent(
    {
      intent,
      size: { width: spec.size.width, height: spec.size.height },
      fileName: `pagefly-${spec.templateId}-${spec.variation}-${spec.theme}`,
      frameName: `pagefly-${spec.templateId}-${spec.variation}`,
    },
    opts,
  )
}

// Reduce plugin code size before passing to use_figma. Strips line comments,
// trailing whitespace, and collapses blank lines. Preserves all functional code
// since Figma plugin code is just JS executed top-level.
function minifyPluginCode(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const trimmed = line.replace(/\s+$/, '')
      const commentOnly = trimmed.match(/^(\s*)\/\/.*$/)
      if (commentOnly) return ''
      return trimmed
    })
    .filter((line, idx, arr) => {
      if (line !== '') return true
      return idx > 0 && arr[idx - 1] !== ''
    })
    .join('\n')
    .replace(/\n+$/, '')
}

// Pull every image region's content path. Logo regions reference relative
// filenames (pagefly-white.png) which we resolve against LOGO_DIR; screenshots
// already arrive as absolute paths from AssetSpec.
function collectUploads(intent: LayoutIntent): string[] {
  const seen = new Set<string>()
  for (const r of intent.regions) {
    const carriesImage =
      r.type === 'image' || r.type === 'decor-bg' || r.type === 'screenshot-frame'
    if (!carriesImage || !r.content) continue
    const resolved = resolveAssetPath(r.content)
    if (resolved) seen.add(resolved)
  }
  return Array.from(seen)
}

function resolveAssetPath(content: string): string {
  if (content.startsWith('/')) return content
  if (brand.logo && (content === brand.logo.light || content === brand.logo.dark)) {
    return path.join(LOGO_DIR, content)
  }
  if (content.startsWith('starfield-')) {
    return path.join(DECOR_DIR, content)
  }
  return content
}

// Emit top-level plugin code. Figma's use_figma runs top-level await but does
// NOT await fire-and-forget async IIFEs - wrapping in `(async () => {})()`
// causes the tool to return before nodes are created. Keep everything flat.
// Caller must define IMAGE_HASHES (path -> hash) on the global scope first.
function emitPluginCode(
  intent: LayoutIntent,
  size: { width: number; height: number },
  frameName: string,
): string {
  const { width, height } = size
  const lines: string[] = []
  lines.push(`// PageFly feature-demo asset: ${frameName}`)
  lines.push(`// Expects globals: figma, IMAGE_HASHES (Record<string,string>)`)
  lines.push(`// Top-level await - do NOT wrap in async IIFE (use_figma won't wait).`)
  lines.push(`const W = ${width};`)
  lines.push(`const H = ${height};`)
  lines.push(`const FONTS = [`)
  lines.push(`  { family: 'Poppins', style: 'ExtraLight' },`)
  lines.push(`  { family: 'Poppins', style: 'Regular' },`)
  lines.push(`  { family: 'Poppins', style: 'Medium' },`)
  lines.push(`  { family: 'Poppins', style: 'Bold' },`)
  lines.push(`];`)
  lines.push(`for (const f of FONTS) { await figma.loadFontAsync(f); }`)
  lines.push(``)
  lines.push(`const frame = figma.createFrame();`)
  lines.push(`frame.name = ${JSON.stringify(frameName)};`)
  lines.push(`frame.resize(W, H);`)
  lines.push(`frame.clipsContent = true;`)
  lines.push(`frame.fills = [${emitBackgroundFill(intent.background)}];`)
  lines.push(``)
  lines.push(`const pctX = (p) => Math.round((p / 100) * W);`)
  lines.push(`const pctY = (p) => Math.round((p / 100) * H);`)
  lines.push(``)

  for (let i = 0; i < intent.regions.length; i++) {
    lines.push(`// region: ${intent.regions[i].id}`)
    lines.push(emitRegion(intent.regions[i], i))
    lines.push(``)
  }

  lines.push(`figma.viewport.scrollAndZoomIntoView([frame]);`)
  lines.push(`figma.currentPage.selection = [frame];`)
  return lines.join('\n')
}

function emitBackgroundFill(bg: LayoutIntent['background']): string {
  // Only a hex value can become a SOLID fill; gradient strings (e.g. light-theme
  // heroBgLightGradient) would choke hexToRgb, so route them to the fallback.
  if (bg.type === 'solid' && bg.value.startsWith('#')) {
    return `{ type: 'SOLID', color: ${hexToRgb(bg.value)} }`
  }
  // gradient / non-hex: full gradient fills aren't emitted yet (Phase 02) - emit a
  // light solid fallback so the value never blows up Figma.
  return `{ type: 'SOLID', color: ${hexToRgb('#D9EBFD')} }`
}

function emitRegion(region: Region, idx: number): string {
  const v = `node_${idx}`
  const lines: string[] = []
  if (region.type === 'text') {
    const fontStyle = pickFontStyle(region.style?.fontWeight ?? 400)
    lines.push(`const ${v} = figma.createText();`)
    lines.push(`${v}.fontName = { family: 'Poppins', style: ${JSON.stringify(fontStyle)} };`)
    lines.push(`${v}.characters = ${JSON.stringify(region.content ?? '')};`)
    if (region.style?.fontSize) {
      lines.push(`${v}.fontSize = ${region.style.fontSize};`)
    }
    if (region.style?.color) {
      lines.push(`${v}.fills = [{ type: 'SOLID', color: ${hexToRgb(region.style.color)} }];`)
    }
    if (region.style?.align) {
      lines.push(`${v}.textAlignHorizontal = ${JSON.stringify(region.style.align.toUpperCase())};`)
    }
    lines.push(`${v}.x = pctX(${region.bounds.x});`)
    lines.push(`${v}.y = pctY(${region.bounds.y});`)
    lines.push(`${v}.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}));`)
    lines.push(`frame.appendChild(${v});`)
    return lines.join('\n')
  }
  if (region.type === 'image') {
    const assetPath = region.content ? resolveAssetPath(region.content) : ''
    lines.push(`const ${v} = figma.createRectangle();`)
    lines.push(`${v}.x = pctX(${region.bounds.x});`)
    lines.push(`${v}.y = pctY(${region.bounds.y});`)
    lines.push(`${v}.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}));`)
    if (region.style?.radius) {
      lines.push(`${v}.cornerRadius = ${region.style.radius};`)
    }
    lines.push(`{`)
    lines.push(`  const hash = IMAGE_HASHES[${JSON.stringify(assetPath)}];`)
    lines.push(`  if (hash) {`)
    lines.push(`    ${v}.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: hash }];`)
    lines.push(`  } else {`)
    lines.push(`    ${v}.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.12, b: 0.18 } }];`)
    lines.push(`  }`)
    lines.push(`}`)
    lines.push(`frame.appendChild(${v});`)
    return lines.join('\n')
  }
  if (region.type === 'glow') {
    lines.push(`const ${v} = figma.createEllipse();`)
    lines.push(`${v}.name = ${JSON.stringify(region.id)};`)
    lines.push(`${v}.x = pctX(${region.bounds.x});`)
    lines.push(`${v}.y = pctY(${region.bounds.y});`)
    lines.push(`${v}.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}));`)
    if (region.style?.fill) {
      lines.push(`${v}.fills = [{ type: 'SOLID', color: ${hexToRgb(region.style.fill)} }];`)
    }
    lines.push(`${v}.opacity = 0.45;`)
    lines.push(
      `${v}.effects = [{ type: 'LAYER_BLUR', radius: ${region.style?.blur ?? 300}, visible: true }];`,
    )
    lines.push(`frame.appendChild(${v});`)
    return lines.join('\n')
  }
  if (region.type === 'decor-bg') {
    const assetPath = region.content ? resolveAssetPath(region.content) : ''
    lines.push(`const ${v} = figma.createRectangle();`)
    lines.push(`${v}.name = ${JSON.stringify(region.id)};`)
    lines.push(`${v}.x = pctX(${region.bounds.x});`)
    lines.push(`${v}.y = pctY(${region.bounds.y});`)
    lines.push(`${v}.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}));`)
    lines.push(`{`)
    lines.push(`  const hash = IMAGE_HASHES[${JSON.stringify(assetPath)}];`)
    lines.push(`  if (hash) ${v}.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: hash }];`)
    lines.push(`}`)
    lines.push(`frame.appendChild(${v});`)
    return lines.join('\n')
  }
  if (region.type === 'pill') {
    const fontStyle = pickFontStyle(region.style?.fontWeight ?? 400)
    const text = JSON.stringify(region.content ?? '')
    const dotCol = region.style?.dotColor ?? '#FFFFFF'
    const fillCol = region.style?.fill ?? '#1A1A2E'
    const textCol = region.style?.color ?? '#FFFFFF'
    const fontSize = region.style?.fontSize ?? 24
    lines.push(`const ${v} = figma.createFrame();`)
    lines.push(`${v}.name = ${JSON.stringify(region.id)};`)
    lines.push(`${v}.x = pctX(${region.bounds.x});`)
    lines.push(`${v}.y = pctY(${region.bounds.y});`)
    lines.push(`${v}.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}));`)
    const fillAlpha = parseAlpha(fillCol)
    lines.push(
      `${v}.fills = [{ type: 'SOLID', color: ${hexToRgb(fillCol)}, opacity: ${fillAlpha} }];`,
    )
    lines.push(`${v}.cornerRadius = pctY(${region.bounds.h}) / 2;`)
    lines.push(`${v}.clipsContent = false;`)
    lines.push(`{`)
    lines.push(`  const dot = figma.createEllipse();`)
    lines.push(`  dot.name = 'pill-dot';`)
    lines.push(`  const dotSize = Math.round(pctY(${region.bounds.h}) * 0.28);`)
    lines.push(`  dot.resize(dotSize, dotSize);`)
    lines.push(`  dot.x = Math.round(pctY(${region.bounds.h}) * 0.36);`)
    lines.push(`  dot.y = Math.round((pctY(${region.bounds.h}) - dotSize) / 2);`)
    lines.push(`  dot.fills = [{ type: 'SOLID', color: ${hexToRgb(dotCol)} }];`)
    lines.push(`  ${v}.appendChild(dot);`)
    lines.push(`}`)
    lines.push(`{`)
    lines.push(`  const txt = figma.createText();`)
    lines.push(`  txt.name = 'pill-text';`)
    lines.push(`  txt.fontName = { family: 'Poppins', style: ${JSON.stringify(fontStyle)} };`)
    lines.push(`  txt.fontSize = ${fontSize};`)
    lines.push(`  txt.characters = ${text};`)
    lines.push(`  txt.fills = [{ type: 'SOLID', color: ${hexToRgb(textCol)} }];`)
    lines.push(`  txt.x = Math.round(pctY(${region.bounds.h}) * 0.9);`)
    lines.push(`  txt.y = Math.round((pctY(${region.bounds.h}) - ${fontSize}) / 2);`)
    lines.push(`  ${v}.appendChild(txt);`)
    lines.push(`}`)
    lines.push(`frame.appendChild(${v});`)
    return lines.join('\n')
  }
  if (region.type === 'screenshot-frame') {
    const assetPath = region.content ? resolveAssetPath(region.content) : ''
    const chromeH = region.style?.framePadding ?? 36
    const radius = region.style?.radius ?? 12
    lines.push(`const ${v} = figma.createFrame();`)
    lines.push(`${v}.name = ${JSON.stringify(region.id)};`)
    lines.push(`${v}.x = pctX(${region.bounds.x});`)
    lines.push(`${v}.y = pctY(${region.bounds.y});`)
    lines.push(`${v}.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}));`)
    lines.push(`${v}.cornerRadius = ${radius};`)
    lines.push(`${v}.clipsContent = true;`)
    lines.push(`${v}.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.94, b: 0.96 } }];`)
    lines.push(`{`)
    lines.push(`  const bar = figma.createRectangle();`)
    lines.push(`  bar.name = 'chrome-bar';`)
    lines.push(`  bar.resize(pctX(${region.bounds.w}), ${chromeH});`)
    lines.push(`  bar.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.94, b: 0.96 } }];`)
    lines.push(`  ${v}.appendChild(bar);`)
    lines.push(`}`)
    const dotColors: [string, [number, number, number]][] = [
      ['red', [1.0, 0.37, 0.36]],
      ['yellow', [1.0, 0.74, 0.18]],
      ['green', [0.16, 0.78, 0.45]],
    ]
    for (let di = 0; di < 3; di++) {
      const [name, [r, g, b]] = dotColors[di]
      lines.push(`{`)
      lines.push(`  const dot = figma.createEllipse();`)
      lines.push(`  dot.name = 'chrome-dot-${name}';`)
      lines.push(`  const ds = Math.round(${chromeH} * 0.32);`)
      lines.push(`  dot.resize(ds, ds);`)
      lines.push(`  dot.x = ${12 + di * 22};`)
      lines.push(`  dot.y = Math.round((${chromeH} - ds) / 2);`)
      lines.push(`  dot.fills = [{ type: 'SOLID', color: { r: ${r}, g: ${g}, b: ${b} } }];`)
      lines.push(`  ${v}.appendChild(dot);`)
      lines.push(`}`)
    }
    lines.push(`{`)
    lines.push(`  const sb = figma.createRectangle();`)
    lines.push(`  sb.name = 'chrome-searchbar';`)
    lines.push(`  const sbH = Math.round(${chromeH} * 0.55);`)
    lines.push(`  sb.resize(Math.round(pctX(${region.bounds.w}) * 0.42), sbH);`)
    lines.push(`  sb.x = Math.round(pctX(${region.bounds.w}) * 0.29);`)
    lines.push(`  sb.y = Math.round((${chromeH} - sbH) / 2);`)
    lines.push(`  sb.cornerRadius = Math.round(sbH / 2);`)
    lines.push(`  sb.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];`)
    lines.push(`  ${v}.appendChild(sb);`)
    lines.push(`}`)
    lines.push(`{`)
    lines.push(`  const img = figma.createRectangle();`)
    lines.push(`  img.name = 'screenshot-image';`)
    lines.push(`  img.y = ${chromeH};`)
    lines.push(`  img.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}) - ${chromeH});`)
    lines.push(`  const hash = IMAGE_HASHES[${JSON.stringify(assetPath)}];`)
    lines.push(`  if (hash) img.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: hash }];`)
    lines.push(`  else img.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.97 } }];`)
    lines.push(`  ${v}.appendChild(img);`)
    lines.push(`}`)
    lines.push(`frame.appendChild(${v});`)
    return lines.join('\n')
  }
  // rect
  lines.push(`const ${v} = figma.createRectangle();`)
  lines.push(`${v}.x = pctX(${region.bounds.x});`)
  lines.push(`${v}.y = pctY(${region.bounds.y});`)
  lines.push(`${v}.resize(pctX(${region.bounds.w}), pctY(${region.bounds.h}));`)
  if (region.style?.fill) {
    lines.push(`${v}.fills = [{ type: 'SOLID', color: ${hexToRgb(region.style.fill)} }];`)
  }
  if (region.style?.radius) {
    lines.push(`${v}.cornerRadius = ${region.style.radius};`)
  }
  lines.push(`frame.appendChild(${v});`)
  return lines.join('\n')
}

function pickFontStyle(weight: 200 | 400 | 500 | 700): string {
  if (weight === 200) return 'ExtraLight'
  if (weight === 500) return 'Medium'
  if (weight === 700) return 'Bold'
  return 'Regular'
}

// Parse alpha channel from rgba() string. Returns 1 for non-rgba inputs.
// Used by pill emit so semi-transparent fills (e.g. rgba(255,255,255,0.06))
// render in Figma at the same opacity as the PNG renderer's CSS.
function parseAlpha(input: string): number {
  const m = input.trim().match(/^rgba\(([^)]+)\)$/i)
  if (!m) return 1
  const parts = m[1].split(',').map((s) => parseFloat(s.trim()))
  const a = parts[3]
  return Number.isFinite(a) ? a : 1
}

// Figma color = 0-1 floats. Accept #RRGGBB, #RGB, or rgba()/rgb() strings.
// Unknown formats fall back to black so the plugin code never throws on parse.
function hexToRgb(input: string): string {
  const trimmed = input.trim()
  const rgba = trimmed.match(/^rgba?\(([^)]+)\)$/i)
  if (rgba) {
    const parts = rgba[1].split(',').map((s) => parseFloat(s.trim()))
    const [r, g, b] = parts
    return `{ r: ${(r / 255).toFixed(4)}, g: ${(g / 255).toFixed(4)}, b: ${(b / 255).toFixed(4)} }`
  }
  let hex = trimmed.replace('#', '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (hex.length !== 6) {
    return `{ r: 0, g: 0, b: 0 }`
  }
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  return `{ r: ${r.toFixed(4)}, g: ${g.toFixed(4)}, b: ${b.toFixed(4)} }`
}
