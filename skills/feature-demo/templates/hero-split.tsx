import * as React from 'react'
import type { AssetSpec, BrandTokens, Theme } from '../types'
import type { LayoutIntent, Region, TemplateModule } from './shared/layout-intent'
import {
  Heading,
  Bullets,
  ScreenshotStack,
  PFLogo,
  Starfield,
  CornerGlow,
  pickGlows,
} from './shared/render-helpers'

// hero-split: heading + bullets one side, screenshot other side.
// Variation:
//  - left:  text left, screenshot right (no tilt)
//  - right: text right, screenshot left (no tilt)
// Theme default = dark per Daran.

type Variation = 'left' | 'right'

const id = 'hero-split'
const label = 'Hero split (text + screenshot side-by-side)'
const variations: Variation[] = ['left', 'right']

function isLeft(v: string): boolean {
  return v === 'left'
}

function fontScale(size: AssetSpec['size'], headingLen: number): { h: number; b: number } {
  // Anchor canvas height 900. Heading size shrinks for longer text so it fits column nicely.
  const k = size.height / 900
  const hBase = headingLen <= 28 ? 96 : headingLen <= 44 ? 76 : headingLen <= 60 ? 60 : 52
  return {
    h: Math.round(hBase * k),
    b: Math.round(24 * k),
  }
}

interface ThemeColors {
  bg: string
  text: string
  textMuted: string
  accent: string
  border: string
  glowA: string
  glowB: string
}

function themeColors(brand: BrandTokens, theme: Theme, seed: string): ThemeColors {
  if (theme === 'light') {
    return {
      bg: brand.flourishes.heroBgLightGradient,
      text: brand.palette.text,
      textMuted: brand.palette.textMuted,
      accent: brand.palette.accentPrimary,
      border: brand.palette.border,
      glowA: brand.flourishes.heroBgLight,
      glowB: brand.flourishes.heroBgLight,
    }
  }
  // Dark theme: pick 2 distinct glow colors from brand palette, seeded by spec
  // content so each asset gets varied (but stable) accent color set.
  const [glowA, glowB] = pickGlows(brand.glowPalette, seed)
  return {
    bg: brand.palette.bgDark,
    text: brand.palette.textOnDark,
    textMuted: 'rgba(255,255,255,0.7)',
    accent: brand.palette.accentSecondary,
    border: 'rgba(255,255,255,0.08)',
    glowA,
    glowB,
  }
}

const Component: React.FC<{ spec: AssetSpec; brand: BrandTokens }> = ({ spec, brand }) => {
  const left = isLeft(spec.variation)
  const f = fontScale(spec.size, spec.heading.length)
  const theme = spec.theme
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, theme, seed)
  const screenshotPaths = spec.screenshots.map((s) => s.path)
  const logoH = Math.round(44 * (spec.size.height / 900))

  const textCol = (
    <div
      style={{
        flex: '0 0 46%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: `${brand.spacing.lg}px`,
        padding: `${brand.spacing.xl}px ${brand.spacing.xl}px ${brand.spacing.xl}px ${brand.spacing.xxl}px`,
        position: 'relative',
        zIndex: 2,
      }}
    >
      <PFLogo theme={theme} height={logoH} />
      <Heading text={spec.heading} brand={brand} fontSize={f.h} color={c.text} weight={700} />
      <Bullets
        items={spec.bullets}
        brand={brand}
        fontSize={f.b}
        color={c.textMuted}
        dotColor={c.accent}
        weight={400}
        theme={spec.theme}
      />
    </div>
  )

  // A single contained screenshot must NOT sit flush to the canvas edge: center
  // it and pad both sides so there is a clear gutter. Multi-screenshot keeps the
  // edge-hugging layout because the device-duo / cluster intentionally bleeds a
  // landscape shot off the canvas edge (those square corners are off-canvas).
  const single = screenshotPaths.length === 1
  const imageCol = (
    <div
      style={{
        flex: '0 0 54%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: single ? 'center' : left ? 'flex-end' : 'flex-start',
        padding: single ? `${brand.spacing.xl}px ${brand.spacing.xl}px` : `${brand.spacing.xl}px 0`,
        position: 'relative',
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: single ? '100%' : '92%',
          height: '82%',
        }}
      >
        <ScreenshotStack
          paths={screenshotPaths}
          brand={brand}
          width="100%"
          height="100%"
          border={`1px solid ${c.border}`}
          variant="cluster"
        />
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
            size="55%"
            intensity={0.7}
          />
          <CornerGlow
            corner={left ? 'bottom-left' : 'bottom-right'}
            color={c.glowB}
            size="50%"
            intensity={0.55}
          />
        </>
      )}
      {left ? textCol : imageCol}
      {left ? imageCol : textCol}
    </div>
  )
}

function buildIntent(spec: AssetSpec, brand: BrandTokens): LayoutIntent {
  const left = isLeft(spec.variation)
  const f = fontScale(spec.size, spec.heading.length)
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, spec.theme, seed)
  const textX = left ? 4 : 50
  const imgColX = left ? 50 : 4
  const imgColW = 46
  const isDark = spec.theme === 'dark'

  const regions: Region[] = []

  // Layer 0: starfield decor bg (dark theme only)
  if (isDark) {
    regions.push({
      id: 'decor-starfield',
      type: 'decor-bg',
      bounds: { x: 0, y: 0, w: 100, h: 100 },
      content: 'starfield-1600x900.png',
    })
    // Layer 1-2: glows (positioned past canvas edges; Figma frame clips, blur halo enters)
    regions.push({
      id: 'glow-a',
      type: 'glow',
      bounds: left
        ? { x: 60, y: -10, w: 50, h: 50 }
        : { x: -10, y: -10, w: 50, h: 50 },
      style: { fill: c.glowA, blur: 300 },
    })
    regions.push({
      id: 'glow-b',
      type: 'glow',
      bounds: left
        ? { x: -10, y: 55, w: 45, h: 50 }
        : { x: 60, y: 55, w: 45, h: 50 },
      style: { fill: c.glowB, blur: 300 },
    })
  }

  // Logo
  if (brand.logo) {
    regions.push({
      id: 'logo',
      type: 'image',
      bounds: { x: textX, y: 12, w: 14, h: 6 },
      content: isDark ? brand.logo.dark : brand.logo.light,
    })
  }

  // Heading
  regions.push({
    id: 'heading',
    type: 'text',
    bounds: { x: textX, y: 26, w: 42, h: 28 },
    content: spec.heading,
    style: { fontSize: f.h, fontWeight: 700, color: c.text, align: 'left' },
  })

  // Pill bullets
  spec.bullets.forEach((text, i) => {
    regions.push({
      id: `bullet-${i + 1}`,
      type: 'pill',
      bounds: { x: textX, y: 60 + i * 9, w: 38, h: 7 },
      content: text,
      style: {
        fontSize: f.b,
        fontWeight: 500,
        color: c.text,
        fill: isDark ? 'rgba(255,255,255,0.06)' : '#F1F3F8',
        dotColor: c.accent,
      },
    })
  })

  // Screenshot frames (stack)
  const slots = stackSlotsForCount(spec.screenshots.length)
  slots.forEach((slot, i) => {
    regions.push({
      id: `screenshot-${i + 1}`,
      type: 'screenshot-frame',
      bounds: {
        x: imgColX + (slot.x / 100) * imgColW,
        y: 14 + (slot.y / 100) * 72,
        w: (slot.w / 100) * imgColW,
        h: (slot.h / 100) * 72,
      },
      content: spec.screenshots[i].path,
      style: { radius: brand.radii.lg, framePadding: 36 },
    })
  })

  return {
    background: { type: 'solid', value: c.bg },
    regions,
  }
}

// Stack slot table for Figma intent. Must mirror clusterLayout() in render-helpers.
function stackSlotsForCount(n: number): { x: number; y: number; w: number; h: number }[] {
  if (n <= 1) return [{ x: 0, y: 0, w: 100, h: 100 }]
  if (n === 2) {
    return [
      { x: 0, y: 4, w: 78, h: 86 },
      { x: 42, y: 38, w: 56, h: 58 },
    ]
  }
  return [
    { x: 8, y: 10, w: 70, h: 78 },
    { x: 50, y: 0, w: 48, h: 42 },
    { x: 0, y: 56, w: 50, h: 42 },
  ]
}

export const heroSplit: TemplateModule = {
  id,
  label,
  variations,
  Component,
  buildIntent,
}
