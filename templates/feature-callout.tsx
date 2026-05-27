import * as React from 'react'
import type { AssetSpec, BrandTokens, Theme } from '../types'
import type { LayoutIntent, Region, TemplateModule } from './shared/layout-intent'
import {
  Heading,
  Bullets,
  ScreenshotCard,
  PFLogo,
  Starfield,
  CornerGlow,
  pickGlows,
} from './shared/render-helpers'

// feature-callout: panels on one half + text block on the other half.
// Inspired by EComposer-style "supercharged by AI" hero (Daran ref 2026-05-13).
// Variations:
//  - lower: text bottom-center, panels fill upper half
//  - upper: text top-center, panels fill lower half
// Dark default. All panels flat (no tilt). Text and panels never overlap.

type Variation = 'lower' | 'upper'

const id = 'feature-callout'
const label = 'Feature callout (text on one half + panels on the other)'
const variations: Variation[] = ['lower', 'upper']

function fontScale(size: AssetSpec['size'], headingLen: number): { h: number; b: number } {
  // Heading goes bigger here since it owns center stage. Subtitle (bullets) small.
  const k = size.height / 900
  const hBase = headingLen <= 24 ? 112 : headingLen <= 40 ? 84 : headingLen <= 56 ? 64 : 52
  return {
    h: Math.round(hBase * k),
    b: Math.round(22 * k),
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
  const [glowA, glowB] = pickGlows(brand.glowPalette, seed)
  return {
    bg: brand.palette.bgDark,
    text: brand.palette.textOnDark,
    textMuted: 'rgba(255,255,255,0.72)',
    accent: brand.palette.accentSecondary,
    border: 'rgba(255,255,255,0.08)',
    glowA,
    glowB,
  }
}

interface OrbitSlot {
  x: number
  y: number
  w: number
  h: number
  z: number
}

// Slot tables. Positions in % of canvas. Panels and text live on opposite
// halves so they can never overlap regardless of heading length.
//  - lower variation: text occupies Y 58-94, panels fit inside Y 4-52
//  - upper variation: text occupies Y 6-42, panels fit inside Y 48-96
function orbitSlots(variation: Variation, n: number): OrbitSlot[] {
  const lower = variation === 'lower'
  const baseY = lower ? 4 : 48
  // Middle panel pokes slightly toward the text block (taller) to add depth.
  const midOffset = lower ? -4 : 4

  if (n === 1) return [{ x: 30, y: baseY, w: 40, h: 48, z: 1 }]
  if (n === 2)
    return [
      { x: 2, y: baseY, w: 40, h: 48, z: 1 },
      { x: 58, y: baseY, w: 40, h: 48, z: 2 },
    ]
  return [
    { x: 1, y: baseY + 2, w: 33, h: 44, z: 1 },
    { x: 33, y: baseY + midOffset, w: 34, h: 52, z: 3 },
    { x: 66, y: baseY + 2, w: 33, h: 44, z: 2 },
  ]
}

function textBlockPos(variation: Variation): React.CSSProperties {
  if (variation === 'lower') {
    return {
      position: 'absolute',
      left: '8%',
      right: '8%',
      bottom: '6%',
      textAlign: 'center',
    }
  }
  return {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '6%',
    textAlign: 'center',
  }
}

const Component: React.FC<{ spec: AssetSpec; brand: BrandTokens }> = ({ spec, brand }) => {
  const variation = spec.variation as Variation
  const f = fontScale(spec.size, spec.heading.length)
  const theme = spec.theme
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, theme, seed)
  const logoH = Math.round(40 * (spec.size.height / 900))
  const panels = orbitSlots(variation, spec.screenshots.length)

  return (
    <div
      style={{
        width: `${spec.size.width}px`,
        height: `${spec.size.height}px`,
        background: c.bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {theme === 'dark' && (
        <>
          <Starfield width={spec.size.width} height={spec.size.height} />
          <CornerGlow corner="top-left" color={c.glowA} size="60%" intensity={0.7} />
          <CornerGlow corner="bottom-right" color={c.glowB} size="55%" intensity={0.55} />
        </>
      )}

      {/* Orbit panels */}
      {spec.screenshots.map((s, i) => {
        const slot = panels[i]
        if (!slot) return null
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
            <ScreenshotCard
              src={s.path}
              brand={brand}
              width="100%"
              height="100%"
              border={`1px solid ${c.border}`}
              fit="cover"
              align="top"
              radius={brand.radii.lg}
            />
          </div>
        )
      })}

      {/* Center / lower text block */}
      <div
        style={{
          ...textBlockPos(variation),
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${brand.spacing.md}px`,
        }}
      >
        <PFLogo theme={theme} height={logoH} />
        <Heading
          text={spec.heading}
          brand={brand}
          fontSize={f.h}
          color={c.text}
          weight={700}
          align="center"
        />
        <div style={{ maxWidth: '88%' }}>
          <Bullets
            items={spec.bullets}
            brand={brand}
            fontSize={f.b}
            color={c.textMuted}
            dotColor={c.accent}
            weight={400}
            direction="row"
            theme={spec.theme}
          />
        </div>
      </div>
    </div>
  )
}

function buildIntent(spec: AssetSpec, brand: BrandTokens): LayoutIntent {
  const variation = spec.variation as Variation
  const lower = variation === 'lower'
  const f = fontScale(spec.size, spec.heading.length)
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, spec.theme, seed)
  const isDark = spec.theme === 'dark'
  const panels = orbitSlots(variation, spec.screenshots.length)

  // Text-band zones mirror Component textBlockPos(): lower = bottom 60-92,
  // upper = top 6-38. Logo above heading, bullets row below.
  const logoY = lower ? 62 : 8
  const headingY = lower ? 68 : 14
  const bulletsY = lower ? 86 : 32

  const regions: Region[] = []

  if (isDark) {
    regions.push({
      id: 'decor-starfield',
      type: 'decor-bg',
      bounds: { x: 0, y: 0, w: 100, h: 100 },
      content: 'starfield-1600x900.png',
    })
    // Glows positioned so they bleed behind the text band on its half - gives
    // the callout copy depth + masks contrast with panels behind.
    regions.push({
      id: 'glow-a',
      type: 'glow',
      bounds: lower
        ? { x: -10, y: -10, w: 55, h: 55 }
        : { x: -10, y: 55, w: 55, h: 55 },
      style: { fill: c.glowA, blur: 300 },
    })
    regions.push({
      id: 'glow-b',
      type: 'glow',
      bounds: lower
        ? { x: 55, y: 55, w: 55, h: 55 }
        : { x: 55, y: -10, w: 55, h: 55 },
      style: { fill: c.glowB, blur: 300 },
    })
  }

  // Screenshot panels (orbit). Use screenshot-frame so each panel reads as a
  // "real product window" in Figma, matching the chrome treatment Daran liked
  // for hero-split.
  panels.forEach((slot, i) => {
    if (!spec.screenshots[i]) return
    regions.push({
      id: `panel-${i + 1}`,
      type: 'screenshot-frame',
      bounds: { x: slot.x, y: slot.y, w: slot.w, h: slot.h },
      content: spec.screenshots[i].path,
      style: { radius: brand.radii.lg, framePadding: 32 },
    })
  })

  // Logo (centered horizontally above heading).
  if (brand.logo) {
    regions.push({
      id: 'logo',
      type: 'image',
      bounds: { x: 46, y: logoY, w: 8, h: 4 },
      content: isDark ? brand.logo.dark : brand.logo.light,
    })
  }

  // Heading - big and centered. Wide column for long text wrapping.
  regions.push({
    id: 'heading',
    type: 'text',
    bounds: { x: 8, y: headingY, w: 84, h: 16 },
    content: spec.heading,
    style: { fontSize: f.h, fontWeight: 700, color: c.text, align: 'center' },
  })

  // Pill bullets in a horizontal row, centered. Match Component direction='row'.
  const n = spec.bullets.length
  const pillW = n === 2 ? 26 : 22
  const gap = 2
  const totalW = n * pillW + (n - 1) * gap
  const startX = (100 - totalW) / 2
  spec.bullets.forEach((text, i) => {
    regions.push({
      id: `bullet-${i + 1}`,
      type: 'pill',
      bounds: { x: startX + i * (pillW + gap), y: bulletsY, w: pillW, h: 6 },
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

  return {
    background: { type: 'solid', value: c.bg },
    regions,
  }
}

export const featureCallout: TemplateModule = {
  id,
  label,
  variations,
  Component,
  buildIntent,
}
