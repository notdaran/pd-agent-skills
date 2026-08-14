import * as fs from 'fs'
import * as path from 'path'
import { renderPng } from '../renderers/playwright-renderer'
import { templates } from '../templates/registry'
import { parseSize } from './agent-entry'
import type { AssetSpec, Size } from '../types'

// CLI (named flags, order-independent):
//   tsx run-render.tsx <mode> --template=<id> --variation=<v> \
//     --screenshots=<path1,path2,...> --theme=<dark|light> \
//     --heading="..." --bullets="a,b,c" --size=<WxH|preset>
//
// mode = png | figma | paper (first positional, default png).
// --screenshots: comma-separated paths -> overlapping flat panels (max 3).
// --bullets: comma-separated text -> max 3 pills.
// --size: WIDTHxHEIGHT (e.g. 1200x675) or a preset name (see SIZE_PRESETS).
// All flags optional - fall back to hero-split / left / sample screenshot and
// the default PageFly heading/bullets/size below.

const rawArgs = process.argv.slice(2)
const mode = (rawArgs.find((a) => !a.startsWith('--')) ?? 'png') as 'png' | 'figma' | 'paper'

const flags: Record<string, string> = {}
for (const a of rawArgs) {
  if (!a.startsWith('--')) continue
  const eq = a.indexOf('=')
  if (eq === -1) flags[a.slice(2)] = 'true'
  else flags[a.slice(2, eq)] = a.slice(eq + 1)
}

const templateId = flags.template ?? 'hero-split'
const variation = flags.variation ?? 'left'

const defaultScreenshot = path.resolve(__dirname, '../assets/placeholder-screenshot.png')
const screenshotPaths = (flags.screenshots ?? defaultScreenshot)
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean)
  .slice(0, 3)

const theme = ((flags.theme as 'dark' | 'light' | undefined) ?? 'dark') as 'dark' | 'light'
const pairMode = flags.pair === 'beside' ? 'beside' : 'overlap'
const headingOverride = flags.heading
const bulletsOverride = flags.bullets
  ?.split(',')
  .map((b) => b.trim())
  .filter(Boolean)
  .slice(0, 3)

// Size presets map a destination (what the asset is FOR) to the right canvas,
// so the agent passes intent (--size=modal) instead of hardcoding dimensions.
// Explicit WIDTHxHEIGHT still works for one-off sizes.
const SIZE_PRESETS: Record<string, Size> = {
  'app-store': { width: 1600, height: 900, label: 'app-store-16x9' },
  hero: { width: 1600, height: 900, label: 'app-store-16x9' },
  modal: { width: 1200, height: 675, label: 'whats-new-modal-16x9' },
  'whats-new': { width: 1200, height: 675, label: 'whats-new-modal-16x9' },
  social: { width: 1080, height: 1080, label: 'social-1x1' },
  square: { width: 1080, height: 1080, label: 'social-1x1' },
}

function resolveSize(raw?: string): Size {
  if (!raw) return SIZE_PRESETS['app-store']
  const preset = SIZE_PRESETS[raw.toLowerCase()]
  if (preset) return preset
  return parseSize(raw, `custom-${raw.toLowerCase()}`)
}

const size = resolveSize(flags.size)
const isSquare = size.width === size.height

// Square 1:1 hard rule: only hero-stack/top keeps a screenshot uncropped on a
// square canvas (hero-split / product-card crop at square width). Force it here
// so a mis-picked template can never ship a cropped square asset. Square also
// caps copy at exactly 1 bullet so the screenshot keeps the vertical room.
let effTemplate = templateId
let effVariation = variation
if (isSquare && templateId !== 'hero-stack') {
  console.warn(
    `[feature-demo] square canvas ${size.width}x${size.height} -> forcing hero-stack/top (was ${templateId}/${variation})`,
  )
  effTemplate = 'hero-stack'
  effVariation = 'top'
}

const resolvedBullets =
  bulletsOverride && bulletsOverride.length > 0
    ? bulletsOverride
    : ['Real screenshots, never redrawn', 'On-brand in one command', 'Pixel-perfect on every device']
const effBullets = isSquare ? resolvedBullets.slice(0, 1) : resolvedBullets

const spec: AssetSpec = {
  size,
  mode: mode === 'figma' ? 'figma' : mode === 'paper' ? 'paper' : 'png',
  theme,
  heading: headingOverride ?? 'Your feature, beautifully framed',
  bullets: effBullets,
  screenshots: screenshotPaths.map((p) => ({ path: p })),
  templateId: effTemplate,
  variation: effVariation,
  pairMode,
}

const outDir = path.resolve(__dirname, '../outputs')
fs.mkdirSync(outDir, { recursive: true })

async function main() {
  if (mode === 'png') {
    const t0 = Date.now()
    const png = await renderPng(spec)
    const dt = Date.now() - t0
    const stackTag = screenshotPaths.length > 1 ? `-stack${screenshotPaths.length}` : ''
    const pairTag = screenshotPaths.length === 2 ? `-${pairMode}` : ''
    const sizeTag = `${size.width}x${size.height}`
    const outPath = path.join(outDir, `${effTemplate}-${effVariation}-${theme}-${sizeTag}${stackTag}${pairTag}.png`)
    fs.writeFileSync(outPath, png)
    console.log(`Rendered ${outPath} in ${dt}ms (${png.length} bytes)`)
    return
  }
  if (mode === 'figma') {
    const { buildFigmaRenderPlan } = await import('../renderers/figma-renderer')
    const plan = buildFigmaRenderPlan(spec)
    const sizeTag = `${size.width}x${size.height}`
    const planPath = path.join(outDir, `${effTemplate}-${effVariation}-${theme}-${sizeTag}-figma-plan.json`)
    fs.writeFileSync(
      planPath,
      JSON.stringify(
        {
          fileName: plan.fileName,
          canvas: plan.canvas,
          screenshotsToUpload: plan.screenshotsToUpload,
          intent: plan.intent,
        },
        null,
        2,
      ),
    )
    const codePath = path.join(outDir, `${effTemplate}-${effVariation}-${theme}-${sizeTag}-figma-plugin.js`)
    fs.writeFileSync(codePath, plan.pluginCode)
    console.log(`Figma plan: ${planPath}`)
    console.log(`Plugin code: ${codePath}`)
    console.log(`Uploads needed: ${plan.screenshotsToUpload.length}`)
    return
  }
  if (mode === 'paper') {
    const { buildPaperRenderPlan } = await import('../renderers/paper-renderer')
    buildPaperRenderPlan(spec)
    return
  }
  throw new Error(`Unknown mode: ${mode}`)
}

main().catch((err) => {
  console.error('Render failed:', err)
  process.exit(1)
})

// Suppress unused import warning - templates only used for validation in renderer.
void templates
