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
import { readImageMeta } from './shared/image-meta'

// hero-stack: text block centered top, screenshot row at bottom.
// Variations:
//  - top:    text top  / image row bottom (heading-led)
//  - bottom: image row top / text bottom (image-led)
// Dark default per Daran. No tilt. Multi-screenshot uses 'row' stack variant.

type Variation = 'top' | 'bottom'

const id = 'hero-stack'
const label = 'Hero stack (text + screenshot row stacked vertically)'
const variations: Variation[] = ['top', 'bottom']

function fontScale(
  size: AssetSpec['size'],
  headingLen: number,
  compact: boolean,
  square: boolean,
): { h: number; b: number } {
  const k = size.height / 900
  // Square 1:1: the screenshot and copy share one vertical column with almost no
  // spare room, so the heading must stay small (the screenshot keeps ~70% of the
  // canvas). Use a tighter budget than the 16:9 path - text was too big before.
  if (square) {
    const hBase = headingLen <= 24 ? 50 : headingLen <= 40 ? 44 : 38
    return { h: Math.round(hBase * k), b: Math.round(20 * k) }
  }
  // 'compact' = bottom variation: shorter text block, smaller heading budget so it
  // pairs naturally with horizontal bullet row underneath.
  // Heading budget kept modest: text band is height-capped so the screenshot
  // always gets >=50% of the canvas. Horizontal bullets sit under the heading,
  // so the heading must not eat the whole band.
  const hBase = compact
    ? headingLen <= 24 ? 80 : headingLen <= 40 ? 64 : 54
    : headingLen <= 22 ? 76 : headingLen <= 38 ? 62 : headingLen <= 54 ? 52 : 44
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
    textMuted: 'rgba(255,255,255,0.7)',
    accent: brand.palette.accentSecondary,
    border: 'rgba(255,255,255,0.08)',
    glowA,
    glowB,
  }
}

const Component: React.FC<{ spec: AssetSpec; brand: BrandTokens }> = ({ spec, brand }) => {
  const textTop = spec.variation === 'top'
  const compact = !textTop
  const square = Math.abs(spec.size.width - spec.size.height) < 1
  const f = fontScale(spec.size, spec.heading.length, compact, square)
  const theme = spec.theme
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, theme, seed)
  const screenshotPaths = spec.screenshots.map((s) => s.path)
  const logoH = Math.round(40 * (spec.size.height / 900))

  // Text-band height fraction. Single source of truth: drives both the textBlock
  // flex below AND the screenshot fit decision here, so they can't drift apart.
  const textFraction = square ? 0.26 : compact ? 0.32 : 0.36
  const bandH = spec.size.height * (1 - textFraction)

  // Gap between the copy and the screenshot on their shared boundary. Scales with
  // canvas height but clamps to 40-60px: tight enough that short copy still reads
  // as one group with the shot, loose enough that they never touch. Applied to the
  // text side of the boundary (the image side stays flush to its canvas edge).
  const textImageGap = Math.round(Math.min(60, Math.max(40, spec.size.height * 0.06)))

  // Fit a single landscape screenshot. Compare its natural (width-bound) height
  // against the image band:
  //  - slack (e.g. square 1:1): natural height fits inside the band with room to
  //    spare, so a fixed band + centered content would float the copy far from the
  //    shot. Instead size the box to its real height and center the whole
  //    text+image cluster -> short copy hugs the screenshot, group stays balanced.
  //  - tight (e.g. 16:9): natural height OVERFLOWS the band, so width-binding clips
  //    the shot. Bind the box by HEIGHT instead -> it fills the band height exactly,
  //    width derives narrower, no clip.
  // Portrait / multi-shot keep plain band-fill (a portrait already fills the band;
  // a duo bleeds intentionally).
  const singleMeta = screenshotPaths.length === 1 ? readImageMeta(screenshotPaths[0]) : null
  const singleLandscape = !!singleMeta && singleMeta.ratio >= 1
  const imgNaturalH = singleMeta ? (spec.size.width * 0.92) / singleMeta.ratio : 0
  const centerCluster = singleLandscape && imgNaturalH <= bandH
  const heightBound = singleLandscape && !centerCluster

  const textBlock = (
    <div
      style={{
        // Text band is height-capped (never 'auto') so the screenshot band keeps
        // >=50% of the canvas. Square 1:1 shrinks the band to ~26% so the tight
        // square canvas hands the screenshot ~70%; top variation gets a touch
        // more room than the image-led bottom (compact) variation.
        flex: centerCluster ? '0 0 auto' : `0 0 ${textFraction * 100}%`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Anchor the text toward the shared border with the image so short copy
        // hugs the screenshot instead of floating in the middle of its band.
        // top variation: text on top -> hug bottom; bottom variation: hug top.
        justifyContent: textTop ? 'flex-end' : 'flex-start',
        gap: `${brand.spacing.md}px`,
        // The padding facing the screenshot (bottom for top-variation, top for
        // bottom-variation) is the controlled text-image gap; the canvas-edge side
        // keeps its brand spacing.
        padding: compact
          ? `${textImageGap}px ${brand.spacing.xl}px ${brand.spacing.lg}px`
          : `${brand.spacing.lg}px ${brand.spacing.xl}px ${textImageGap}px`,
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
      }}
    >
      {!compact && <PFLogo theme={theme} height={logoH} />}
      <Heading
        text={spec.heading}
        brand={brand}
        fontSize={f.h}
        color={c.text}
        weight={700}
        align="center"
      />
      <div style={{ maxWidth: '90%' }}>
        <Bullets
          items={spec.bullets}
          brand={brand}
          fontSize={f.b}
          color={c.textMuted}
          dotColor={c.accent}
          weight={400}
          direction="row"
          theme={theme}
        />
      </div>
    </div>
  )

  const imageBlock = (
    <div
      style={{
        flex: centerCluster ? '0 0 auto' : '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${brand.spacing.md}px`,
        // The screenshot stays flush to its canvas edge; the gap toward the copy is
        // owned by textBlock (textImageGap). top variation: image hugs canvas
        // bottom (paddingBottom 0). bottom variation: image hugs canvas top, its
        // bottom edge (facing copy) is 0 so only textImageGap separates them.
        padding: compact
          ? `${brand.spacing.lg}px ${brand.spacing.xl}px 0`
          : `0 ${brand.spacing.xl}px 0`,
        position: 'relative',
        zIndex: 2,
      }}
    >
      {compact && <PFLogo theme={theme} height={logoH} />}
      <div
        style={
          centerCluster
            ? { width: '92%', aspectRatio: String(singleMeta!.ratio) }
            : heightBound
              ? // Bind by a DEFINITE px height (the band height), not height:'100%':
                // a percentage height on a child of a flex:1-1-auto item resolves to
                // auto, leaving aspectRatio nothing to derive width from (it then
                // width-binds and clips). A px height resolves cleanly.
                {
                  height: `${Math.floor(bandH)}px`,
                  aspectRatio: String(singleMeta!.ratio),
                  maxWidth: '92%',
                }
              : { width: '92%', flex: '1 1 auto', minHeight: 0 }
        }
      >
        <ScreenshotStack
          paths={screenshotPaths}
          brand={brand}
          width="100%"
          height="100%"
          border={`1px solid ${c.border}`}
          variant="row"
          pairMode={spec.pairMode}
          vAlign={textTop ? 'start' : 'end'}
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
        flexDirection: 'column',
        // Center the text+image group when the cluster is content-sized (single
        // landscape) so the breathing room splits evenly above and below.
        justifyContent: centerCluster ? 'center' : 'flex-start',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {theme === 'dark' && (
        <>
          <Starfield width={spec.size.width} height={spec.size.height} />
          <CornerGlow corner="top-left" color={c.glowA} size="55%" intensity={0.7} />
          <CornerGlow corner="bottom-right" color={c.glowB} size="50%" intensity={0.55} />
        </>
      )}
      {textTop ? textBlock : imageBlock}
      {textTop ? imageBlock : textBlock}
    </div>
  )
}

function buildIntent(spec: AssetSpec, brand: BrandTokens): LayoutIntent {
  const textTop = spec.variation === 'top'
  const compact = !textTop
  const square = Math.abs(spec.size.width - spec.size.height) < 1
  const f = fontScale(spec.size, spec.heading.length, compact, square)
  const seed = `${spec.templateId}|${spec.variation}|${spec.heading}`
  const c = themeColors(brand, spec.theme, seed)
  const isDark = spec.theme === 'dark'

  // Layout zones in canvas %. Mirror Component: text occupies ~46% vertical band,
  // screenshot row the remaining ~50%. Logo sits above heading inside text band.
  const textY = textTop ? 6 : 56
  const imgY = textTop ? 52 : 4
  const imgH = 44
  const logoY = textTop ? textY + 2 : textY + 2
  const headingY = textTop ? textY + 9 : textY + 7
  const bulletsY = textTop ? textY + 28 : textY + 26

  const regions: Region[] = []

  if (isDark) {
    regions.push({
      id: 'decor-starfield',
      type: 'decor-bg',
      bounds: { x: 0, y: 0, w: 100, h: 100 },
      content: 'starfield-1600x900.png',
    })
    regions.push({
      id: 'glow-a',
      type: 'glow',
      bounds: { x: -10, y: -10, w: 50, h: 50 },
      style: { fill: c.glowA, blur: 300 },
    })
    regions.push({
      id: 'glow-b',
      type: 'glow',
      bounds: { x: 60, y: 60, w: 50, h: 50 },
      style: { fill: c.glowB, blur: 300 },
    })
  }

  // Logo centered horizontally.
  if (brand.logo) {
    regions.push({
      id: 'logo',
      type: 'image',
      bounds: { x: 46, y: logoY, w: 8, h: 4 },
      content: isDark ? brand.logo.dark : brand.logo.light,
    })
  }

  // Heading centered. Wide column so long text wraps inside band.
  regions.push({
    id: 'heading',
    type: 'text',
    bounds: { x: 10, y: headingY, w: 80, h: 18 },
    content: spec.heading,
    style: { fontSize: f.h, fontWeight: 700, color: c.text, align: 'center' },
  })

  // Pill bullets. Top variation = vertical centered list. Bottom variation =
  // horizontal row centered (compact). Pill width tuned so 3 fit across.
  const n = spec.bullets.length
  if (textTop) {
    const pillW = 30
    const pillX = (100 - pillW) / 2
    spec.bullets.forEach((text, i) => {
      regions.push({
        id: `bullet-${i + 1}`,
        type: 'pill',
        bounds: { x: pillX, y: bulletsY + i * 7, w: pillW, h: 6 },
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
  } else {
    const pillW = n === 2 ? 28 : 22
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
  }

  // Screenshot frames (row layout, mirrors ScreenshotStack variant='row').
  const slots = rowSlotsForCount(spec.screenshots.length)
  slots.forEach((slot, i) => {
    regions.push({
      id: `screenshot-${i + 1}`,
      type: 'screenshot-frame',
      bounds: {
        x: 4 + (slot.x / 100) * 92,
        y: imgY + (slot.y / 100) * imgH,
        w: (slot.w / 100) * 92,
        h: (slot.h / 100) * imgH,
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

// Mirror rowLayout() in render-helpers.tsx so Figma intent matches PNG.
function rowSlotsForCount(n: number): { x: number; y: number; w: number; h: number }[] {
  if (n <= 1) return [{ x: 0, y: 0, w: 100, h: 100 }]
  if (n === 2) {
    return [
      { x: 0, y: 4, w: 58, h: 92 },
      { x: 46, y: 0, w: 56, h: 92 },
    ]
  }
  return [
    { x: 0, y: 8, w: 42, h: 84 },
    { x: 30, y: 0, w: 42, h: 92 },
    { x: 60, y: 8, w: 42, h: 84 },
  ]
}

export const heroStack: TemplateModule = {
  id,
  label,
  variations,
  Component,
  buildIntent,
}
