import * as React from 'react'
import type { AssetSpec, BrandTokens, Theme } from '../types'
import type { LayoutIntent, Region, TemplateModule } from './shared/layout-intent'
import {
  Heading,
  PFLogo,
  Starfield,
  CornerGlow,
  pickGlows,
} from './shared/render-helpers'
import { readImageMeta } from './shared/image-meta'
import * as fs from 'fs'
import * as path from 'path'

// product-card: app-store-style showcase. Single product window-frame on one
// side with chrome (title bar + 3 dots), text + chip bullets on the other.
// Variations:
//  - left:  text left, window-frame right
//  - right: text right, window-frame left
// Multi-screenshot: shown as horizontal mini frames inside the stage. Max 3.

type Variation = 'left' | 'right'

const id = 'product-card'
const label = 'Product card (window-framed showcase + chip bullets)'
const variations: Variation[] = ['left', 'right']

function isLeft(v: string): boolean {
  return v === 'left'
}

function fontScale(size: AssetSpec['size'], headingLen: number): { h: number; b: number } {
  const k = size.height / 900
  const hBase = headingLen <= 28 ? 88 : headingLen <= 44 ? 68 : headingLen <= 60 ? 56 : 48
  return {
    h: Math.round(hBase * k),
    b: Math.round(20 * k),
  }
}

interface ThemeColors {
  bg: string
  text: string
  textMuted: string
  accent: string
  border: string
  chipBg: string
  chipText: string
  frameChrome: string
  stageA: string
  stageB: string
  glowA: string
  glowB: string
}

function themeColors(brand: BrandTokens, theme: Theme, seed: string): ThemeColors {
  const [glowA, glowB] = pickGlows(brand.glowPalette, seed)
  if (theme === 'light') {
    return {
      bg: brand.flourishes.heroBgLightGradient,
      text: brand.palette.text,
      textMuted: brand.palette.textMuted,
      accent: brand.palette.accentPrimary,
      border: brand.palette.border,
      chipBg: 'rgba(83,90,247,0.08)',
      chipText: brand.palette.text,
      frameChrome: '#F1F3F5',
      stageA: glowA,
      stageB: glowB,
      glowA,
      glowB,
    }
  }
  return {
    bg: brand.palette.bgDark,
    text: brand.palette.textOnDark,
    textMuted: 'rgba(255,255,255,0.72)',
    accent: brand.palette.accentSecondary,
    border: 'rgba(255,255,255,0.1)',
    chipBg: 'rgba(255,255,255,0.08)',
    chipText: 'rgba(255,255,255,0.92)',
    frameChrome: 'rgba(255,255,255,0.06)',
    stageA: glowA,
    stageB: glowB,
    glowA,
    glowB,
  }
}

// Inline image loader (helpers' toDataUri is private). Returns empty string
// when missing so renderer surfaces blank instead of crashing.
function toDataUri(src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src
  }
  const abs = path.isAbsolute(src) ? src : path.resolve(process.cwd(), src)
  if (!fs.existsSync(abs)) return ''
  const ext = path.extname(abs).slice(1).toLowerCase()
  const mime =
    ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'webp'
        ? 'image/webp'
        : 'image/png'
  const b64 = fs.readFileSync(abs).toString('base64')
  return `data:${mime};base64,${b64}`
}

// WindowFrame: rounded card with chrome bar + 3 dots + screenshot inside.
// Used per panel. Frame border + soft shadow read as "real product window".
const WindowFrame: React.FC<{
  src: string
  width: string
  height: string
  brand: BrandTokens
  c: ThemeColors
}> = ({ src, width, height, brand, c }) => {
  const dataUri = toDataUri(src)
  return (
    <div
      style={{
        width,
        height,
        borderRadius: brand.radii.lg,
        background: c.frameChrome,
        border: `1px solid ${c.border}`,
        boxShadow: brand.flourishes.glow,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 32,
          background: c.frameChrome,
          borderBottom: `1px solid ${c.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 14px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#FF5F57',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#FEBC2E',
            display: 'inline-block',
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#28C840',
            display: 'inline-block',
          }}
        />
      </div>
      <div style={{ flex: '1 1 auto', minHeight: 0, background: brand.palette.surface }}>
        <img
          src={dataUri}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

// Chip: pill bullet with subtle background fill. Replaces dot-list to give
// product-card a distinct marketing-card feel vs hero-split's plain bullets.
const Chip: React.FC<{
  text: string
  brand: BrandTokens
  fontSize: number
  bg: string
  color: string
  accent: string
}> = ({ text, brand, fontSize, bg, color, accent }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: brand.spacing.sm,
      padding: `${brand.spacing.sm}px ${brand.spacing.md}px`,
      borderRadius: brand.radii.pill,
      background: bg,
      border: `1px solid ${accent}33`,
      fontFamily: brand.fonts.body,
      fontSize,
      fontWeight: 500,
      color,
      lineHeight: 1.2,
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: accent,
        flexShrink: 0,
      }}
    />
    {text}
  </span>
)

// Stage backdrop: soft gradient panel behind the window frame so the product
// feels "lifted" off the canvas. Color seeded from glowPalette per spec.
const Stage: React.FC<{ c: ThemeColors; radius: number }> = ({ c, radius }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: radius,
      background: `radial-gradient(circle at 30% 20%, ${c.stageA}33, transparent 60%), radial-gradient(circle at 80% 80%, ${c.stageB}33, transparent 65%)`,
      pointerEvents: 'none',
    }}
  />
)

const Component: React.FC<{ spec: AssetSpec; brand: BrandTokens }> = ({ spec, brand }) => {
  const left = isLeft(spec.variation)
  const f = fontScale(spec.size, spec.heading.length)
  const theme = spec.theme
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, theme, seed)
  const logoH = Math.round(40 * (spec.size.height / 900))
  const shots = spec.screenshots.slice(0, 3)

  const textCol = (
    <div
      style={{
        flex: '0 0 42%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: `${brand.spacing.lg}px`,
        padding: `${brand.spacing.xl}px ${brand.spacing.xxl}px`,
        position: 'relative',
        zIndex: 2,
      }}
    >
      <PFLogo theme={theme} height={logoH} />
      <Heading text={spec.heading} brand={brand} fontSize={f.h} color={c.text} weight={700} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: `${brand.spacing.sm}px`,
        }}
      >
        {spec.bullets.map((b, i) => (
          <Chip
            key={i}
            text={b}
            brand={brand}
            fontSize={f.b}
            bg={c.chipBg}
            color={c.chipText}
            accent={c.accent}
          />
        ))}
      </div>
    </div>
  )

  const imageCol = (
    <div
      style={{
        flex: '0 0 58%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${brand.spacing.xl}px ${brand.spacing.xl}px`,
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '94%',
          height: '86%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stage c={c} radius={brand.radii.lg} />
        <FrameLayout shots={shots} brand={brand} c={c} size={spec.size} />
      </div>
    </div>
  )

  return (
    <div
      style={{
        width: `${spec.size.width}px`,
        height: `${spec.size.height}px`,
        background: c.bg,
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {theme === 'dark' && (
        <>
          <Starfield width={spec.size.width} height={spec.size.height} />
          <CornerGlow
            corner={left ? 'top-right' : 'top-left'}
            color={c.glowA}
            size="50%"
            intensity={0.7}
          />
          <CornerGlow
            corner={left ? 'bottom-left' : 'bottom-right'}
            color={c.glowB}
            size="48%"
            intensity={0.55}
          />
        </>
      )}
      {left ? textCol : imageCol}
      {left ? imageCol : textCol}
    </div>
  )
}

// FrameLayout: place 1-3 window frames. Single = one big centered frame.
// Multi = horizontal row of slightly smaller frames with subtle overlap.
const FrameLayout: React.FC<{
  shots: { path: string }[]
  brand: BrandTokens
  c: ThemeColors
  size: AssetSpec['size']
}> = ({ shots, brand, c, size }) => {
  if (shots.length === 0) return null
  if (shots.length === 1) {
    // Size the frame to the screenshot's real aspect ratio so the image fills
    // its body edge-to-edge (no letterbox white bands). The leftover room falls
    // on the stage gradient backdrop, reading as a product window floating in
    // the scene. Bound by definite px (a percentage height on a flex child
    // collapses to auto, leaving aspectRatio nothing to resolve against).
    const ratio = readImageMeta(shots[0].path).ratio
    const { w, h } = fitSingleFrame(size, brand.spacing.xl, ratio)
    return <WindowFrame src={shots[0].path} width={`${w}px`} height={`${h}px`} brand={brand} c={c} />
  }
  const slots = frameSlots(shots.length)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {shots.map((s, i) => {
        const slot = slots[i]
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.w}%`,
              height: `${slot.h}%`,
              zIndex: slot.z,
            }}
          >
            <WindowFrame src={s.path} width="100%" height="100%" brand={brand} c={c} />
          </div>
        )
      })}
    </div>
  )
}

// Chrome bar height (matches WindowFrame's title-bar). Body = frameH - this.
const FRAME_CHROME_H = 32

// Compute a window-frame size (px) whose BODY matches the screenshot ratio, so
// `objectFit:contain` fills it with no letterbox. Fractions mirror the imageCol
// stage layout in Component (col 58%, xl padding, stage 94%x86%, wrapper 92%x94%).
// Picks width- or height-binding so the frame never overflows the stage box.
function fitSingleFrame(
  size: AssetSpec['size'],
  xl: number,
  ratio: number,
): { w: number; h: number } {
  const colW = size.width * 0.58 - 2 * xl
  const colH = size.height - 2 * xl
  const wrapW = colW * 0.94 * 0.92
  const wrapH = colH * 0.86 * 0.94
  const slotH = wrapH - FRAME_CHROME_H
  const slotRatio = wrapW / slotH
  let bodyW: number
  let bodyH: number
  if (ratio >= slotRatio) {
    bodyW = wrapW
    bodyH = wrapW / ratio
  } else {
    bodyH = slotH
    bodyW = slotH * ratio
  }
  return { w: Math.floor(bodyW), h: Math.floor(bodyH + FRAME_CHROME_H) }
}

interface FrameSlot {
  x: number
  y: number
  w: number
  h: number
  z: number
}

// Horizontal row of frames, center frame slightly larger + above.
// Mirrors row stack vibe but with hard window-chrome treatment.
function frameSlots(n: number): FrameSlot[] {
  if (n === 2) {
    return [
      { x: 2, y: 8, w: 54, h: 84, z: 1 },
      { x: 46, y: 4, w: 54, h: 88, z: 2 },
    ]
  }
  return [
    { x: 0, y: 10, w: 38, h: 80, z: 1 },
    { x: 31, y: 0, w: 38, h: 96, z: 3 },
    { x: 62, y: 10, w: 38, h: 80, z: 2 },
  ]
}

function buildIntent(spec: AssetSpec, brand: BrandTokens): LayoutIntent {
  const left = isLeft(spec.variation)
  const f = fontScale(spec.size, spec.heading.length)
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, spec.theme, seed)
  const isDark = spec.theme === 'dark'

  // Column layout in canvas %. Text column ~42% wide, image column ~58%.
  const textX = left ? 4 : 50
  const imgColX = left ? 46 : 4
  const imgColW = 50
  // Stage box (where window frames live inside image column).
  const stageX = imgColX + 4
  const stageY = 10
  const stageW = imgColW - 6
  const stageH = 80

  const regions: Region[] = []

  if (isDark) {
    regions.push({
      id: 'decor-starfield',
      type: 'decor-bg',
      bounds: { x: 0, y: 0, w: 100, h: 100 },
      content: 'starfield-1600x900.png',
    })
    // Glows on opposite corners of the text column to add depth without
    // washing out the window frames.
    regions.push({
      id: 'glow-a',
      type: 'glow',
      bounds: left
        ? { x: -10, y: -10, w: 45, h: 50 }
        : { x: 60, y: -10, w: 50, h: 50 },
      style: { fill: c.glowA, blur: 300 },
    })
    regions.push({
      id: 'glow-b',
      type: 'glow',
      bounds: left
        ? { x: -10, y: 60, w: 40, h: 50 }
        : { x: 65, y: 55, w: 45, h: 50 },
      style: { fill: c.glowB, blur: 300 },
    })
  }

  // Window-framed screenshots. Use screenshot-frame for chrome-bar treatment
  // matching the Component's WindowFrame look.
  const slots =
    spec.screenshots.length === 1
      ? [{ x: 4, y: 4, w: 92, h: 92 }]
      : frameSlots(spec.screenshots.length).map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }))

  slots.forEach((slot, i) => {
    if (!spec.screenshots[i]) return
    regions.push({
      id: `frame-${i + 1}`,
      type: 'screenshot-frame',
      bounds: {
        x: stageX + (slot.x / 100) * stageW,
        y: stageY + (slot.y / 100) * stageH,
        w: (slot.w / 100) * stageW,
        h: (slot.h / 100) * stageH,
      },
      content: spec.screenshots[i].path,
      style: { radius: brand.radii.lg, framePadding: 32 },
    })
  })

  // Logo (top of text column).
  if (brand.logo) {
    regions.push({
      id: 'logo',
      type: 'image',
      bounds: { x: textX, y: 14, w: 12, h: 5 },
      content: isDark ? brand.logo.dark : brand.logo.light,
    })
  }

  // Heading (left-aligned, wide column).
  regions.push({
    id: 'heading',
    type: 'text',
    bounds: { x: textX, y: 28, w: 40, h: 26 },
    content: spec.heading,
    style: { fontSize: f.h, fontWeight: 700, color: c.text, align: 'left' },
  })

  // Chip bullets as pills (2-column grid mirrors Component flex-wrap layout).
  spec.bullets.forEach((text, i) => {
    regions.push({
      id: `chip-${i + 1}`,
      type: 'pill',
      bounds: {
        x: textX + (i % 2) * 20,
        y: 64 + Math.floor(i / 2) * 8,
        w: 19,
        h: 6,
      },
      content: text,
      style: {
        fontSize: f.b,
        fontWeight: 500,
        color: c.chipText,
        fill: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(83,90,247,0.08)',
        dotColor: c.accent,
      },
    })
  })

  return {
    background: { type: 'solid', value: c.bg },
    regions,
  }
}

export const productCard: TemplateModule = {
  id,
  label,
  variations,
  Component,
  buildIntent,
}
