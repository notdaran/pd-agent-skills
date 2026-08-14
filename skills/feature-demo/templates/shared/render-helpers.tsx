import * as React from 'react'
import * as fs from 'fs'
import * as path from 'path'
import type { BrandTokens, Theme } from '../../types'
import { brand } from '../../brand'
import { readImageMeta, type ImageMeta } from './image-meta'

// Sub-components for templates. Style inline (html-shell injects brand reset + font-face).
// Theme-aware: helpers do NOT pick colors implicitly - template owns color decisions.

const LOGO_DIR = path.resolve(__dirname, '../../assets/logos')

export function logoSrc(theme: Theme): string | null {
  if (!brand.logo) return null
  const file = theme === 'dark' ? brand.logo.dark : brand.logo.light
  return toDataUri(path.join(LOGO_DIR, file))
}

export const Heading: React.FC<{
  text: string
  brand: BrandTokens
  fontSize: number
  color: string
  weight?: 200 | 400 | 500 | 700
  align?: 'left' | 'center' | 'right'
}> = ({ text, brand, fontSize, color, weight = 700, align = 'left' }) => (
  <h1
    style={{
      fontFamily: brand.fonts.heading,
      fontWeight: weight,
      fontSize: `${fontSize}px`,
      lineHeight: 1.12,
      color,
      letterSpacing: '-0.02em',
      margin: 0,
      textAlign: align,
    }}
  >
    {text}
  </h1>
)

export const SubHeading: React.FC<{
  text: string
  brand: BrandTokens
  fontSize: number
  color: string
}> = ({ text, brand, fontSize, color }) => (
  <p
    style={{
      fontFamily: brand.fonts.body,
      fontWeight: brand.fontWeights.regular,
      fontSize: `${fontSize}px`,
      lineHeight: 1.5,
      color,
      margin: 0,
    }}
  >
    {text}
  </p>
)

export const Bullets: React.FC<{
  items: string[]
  brand: BrandTokens
  fontSize: number
  color: string
  dotColor?: string
  weight?: 200 | 400 | 500 | 700
  direction?: 'row' | 'column'
  theme?: Theme
}> = ({ items, brand, fontSize, color, dotColor, weight = 400, direction = 'column', theme = 'dark' }) => {
  const isRow = direction === 'row'
  // Glassmorphism pill: translucent fill + 1px stroke + backdrop blur (blurs the
  // starfield/glow behind). Theme-aware so it reads on both dark and light bg.
  const isDark = theme !== 'light'
  const pillFill = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)'
  const pillBorder = isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid #F1F5FE'
  const pillHighlight = isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.6)'
  const padV = Math.round(fontSize * 0.55)
  const padH = Math.round(fontSize * 1.05)
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: isRow ? 'row' : 'column',
        flexWrap: isRow ? 'wrap' : 'nowrap',
        justifyContent: isRow ? 'center' : 'flex-start',
        alignItems: isRow ? 'center' : 'flex-start',
        gap: isRow ? `${brand.spacing.lg}px` : `${brand.spacing.md}px`,
      }}
    >
      {items.map((it, i) => (
        <li
          key={i}
          style={{
            fontFamily: brand.fonts.body,
            fontSize: `${fontSize}px`,
            lineHeight: 1.4,
            fontWeight: weight,
            color,
            display: 'flex',
            alignItems: 'center',
            gap: `${brand.spacing.sm}px`,
            // hug content in column mode (pills sized to text, not full-width)
            alignSelf: isRow ? 'auto' : 'flex-start',
            padding: `${padV}px ${padH}px`,
            borderRadius: brand.radii.pill,
            background: pillFill,
            border: pillBorder,
            boxShadow: pillHighlight,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: brand.radii.pill,
              background: dotColor ?? brand.palette.accentPrimary,
              flexShrink: 0,
            }}
          />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

export const AccentBar: React.FC<{
  brand: BrandTokens
  width?: number
  height?: number
  color?: string
}> = ({ brand, width = 64, height = 4, color }) => (
  <div
    style={{
      width: `${width}px`,
      height: `${height}px`,
      background: color ?? brand.flourishes.accentBar,
      borderRadius: brand.radii.pill,
    }}
  />
)

export const ScreenshotCard: React.FC<{
  src: string
  brand: BrandTokens
  width?: number | string
  height?: number | string
  // number -> px on all corners. string -> raw CSS (e.g. per-corner '16px 16px 0 0').
  radius?: number | string
  // true -> brand glow. string -> raw CSS box-shadow. false -> none.
  shadow?: boolean | string
  border?: string
  fit?: 'cover' | 'contain'
  align?: 'top' | 'center'
}> = ({
  src,
  brand,
  width = '100%',
  height = 'auto',
  radius,
  shadow = true,
  border,
  fit = 'cover',
  align = 'top',
}) => {
  const dataUri = toDataUri(src)
  const borderRadius = typeof radius === 'string' ? radius : `${radius ?? brand.radii.lg}px`
  const boxShadow =
    shadow === true ? brand.flourishes.glow : typeof shadow === 'string' ? shadow : undefined
  return (
    <div
      style={{
        boxShadow,
        borderRadius,
        overflow: 'hidden',
        border: border ?? `1px solid rgba(255,255,255,0.08)`,
        background: brand.palette.surface,
        width,
        height,
        display: 'flex',
        alignItems: align === 'top' ? 'flex-start' : 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={dataUri}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          objectPosition: align === 'top' ? 'top center' : 'center',
          display: 'block',
        }}
      />
    </div>
  )
}

// Vertical gradient used as the portrait's separating ring: opaque violet at the
// top fading to transparent indigo at the bottom. CSS borders can't be a gradient
// on rounded corners, so we paint it as the BACKGROUND of a 2px-padded wrapper and
// clip the image card inside it (the standard "gradient border" technique).
const GRADIENT_BORDER = 'linear-gradient(180deg, #9D6CFF 0%, rgba(116,118,255,0) 100%)'

// Portrait card with a 2px vertical-gradient ring + drop shadow, used in the
// device-duo composition to lift the mobile shot off the screenshot behind it.
// `radius` is a raw CSS corner string so callers pick top-only (overlap, bottom
// bleeds off canvas) vs all-corners (beside, fully on-canvas).
const GradientRingCard: React.FC<{
  meta: ImageMeta
  brand: BrandTokens
  radius: string
}> = ({ meta, brand, radius }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      padding: '2px',
      borderRadius: radius,
      background: GRADIENT_BORDER,
      boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
    }}
  >
    <ScreenshotCard
      src={meta.path}
      brand={brand}
      width="100%"
      height="100%"
      border="none"
      fit="contain"
      align="center"
      radius={radius}
      shadow={false}
    />
  </div>
)

function toDataUri(src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src
  }
  const abs = path.isAbsolute(src) ? src : path.resolve(process.cwd(), src)
  if (!fs.existsSync(abs)) {
    return ''
  }
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

// PageFly logo natural aspect ratio. Locked from asset files (323x80 px).
// Setting explicit width prevents global `img { max-width: 100% }` from
// clamping width while the inline height stays, which would distort the mark.
const PF_LOGO_ASPECT = 323 / 80

export const PFLogo: React.FC<{
  theme: Theme
  height?: number
}> = ({ theme, height = 40 }) => {
  const src = logoSrc(theme)
  if (!src) return null
  return (
    <img
      src={src}
      alt="logo"
      style={{
        height: `${height}px`,
        width: `${Math.round(height * PF_LOGO_ASPECT)}px`,
        maxWidth: 'none',
        display: 'block',
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  )
}

// Deterministic starfield background for dark theme. Seeded RNG so render stable.
export const Starfield: React.FC<{
  width: number
  height: number
  density?: number
  seed?: number
}> = ({ width, height, density = 0.00015, seed = 42 }) => {
  const count = Math.round(width * height * density)
  const rng = mulberry32(seed)
  const stars = Array.from({ length: count }, (_, i) => {
    const x = rng() * width
    const y = rng() * height
    const size = rng() < 0.85 ? 1 : 2
    const opacity = 0.3 + rng() * 0.7
    return { i, x, y, size, opacity }
  })
  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {stars.map((s) => (
        <circle key={s.i} cx={s.x} cy={s.y} r={s.size / 2} fill={`rgba(255,255,255,${s.opacity})`} />
      ))}
    </svg>
  )
}

// Hash arbitrary string -> uint32. Used to seed deterministic color/layout picks
// per spec so renders vary per input but stay stable for same input.
export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Pick 2 distinct colors from brand.glowPalette. Stable for same seed.
export function pickGlows(palette: string[], seed: string): [string, string] {
  if (palette.length < 2) {
    const c = palette[0] ?? '#535AF7'
    return [c, c]
  }
  const a = hashSeed(seed) % palette.length
  let b = hashSeed(seed + '|salt') % palette.length
  if (b === a) b = (b + 1) % palette.length
  return [palette[a], palette[b]]
}

// ScreenshotStack: render 1-3 screenshots as panels sized to each image's REAL
// aspect ratio (frames hug the image, no internal crop).
//   N=1: single card best-fit inside the container, preserving ratio.
//   N=2: orientation-aware pair. A desktop (landscape) + mobile (portrait) shot
//        becomes a "device duo": landscape shown BIG (may bleed off a canvas edge),
//        portrait overlapping front + ALWAYS fully visible. `variant='row'` (wide
//        host band) bleeds landscape off the bottom; otherwise off the right.
//        Same-orientation pairs cascade / sit side-by-side.
//   N=3: legacy cluster/cascade/row layout (cover) - unchanged.
type StackVariant = 'cluster' | 'cascade' | 'row'

// Treat square shots as landscape-ish for pairing decisions.
function isPortrait(m: ImageMeta): boolean {
  return m.orientation === 'mobile'
}

export const ScreenshotStack: React.FC<{
  paths: string[]
  brand: BrandTokens
  width?: number | string
  height?: number | string
  border?: string
  variant?: StackVariant
  pairMode?: 'overlap' | 'beside'
  // Vertical anchor of a SINGLE screenshot inside its band. Lets a stacked layout
  // pull a short (landscape) shot toward the copy instead of centering it (which
  // leaves a big gap between text and image). No effect on multi-shot layouts.
  vAlign?: 'start' | 'center' | 'end'
}> = ({
  paths,
  brand,
  width = '100%',
  height = '100%',
  border,
  variant = 'cluster',
  pairMode = 'overlap',
  vAlign = 'center',
}) => {
  const items = paths.slice(0, 3)
  if (items.length === 0) return null

  if (items.length === 1) {
    const alignItems =
      vAlign === 'start' ? 'flex-start' : vAlign === 'end' ? 'flex-end' : 'center'
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems,
          justifyContent: 'center',
        }}
      >
        <RatioCard meta={readImageMeta(items[0])} brand={brand} border={border} fitMode="best" />
      </div>
    )
  }

  if (items.length === 2) {
    return (
      <div style={{ width, height, position: 'relative' }}>
        <ScreenshotPair
          a={readImageMeta(items[0])}
          b={readImageMeta(items[1])}
          brand={brand}
          border={border}
          wide={variant === 'row'}
          pairMode={pairMode}
        />
      </div>
    )
  }

  const layout =
    variant === 'cascade'
      ? cascadeLayout(items.length)
      : variant === 'row'
        ? rowLayout(items.length)
        : clusterLayout(items.length)

  return (
    <div style={{ width, height, position: 'relative' }}>
      {items.map((src, i) => {
        const slot = layout[i]
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
              src={src}
              brand={brand}
              width="100%"
              height="100%"
              border={border}
              fit="cover"
              align="top"
              radius={brand.radii.lg}
            />
          </div>
        )
      })}
    </div>
  )
}

// RatioCard: a screenshot framed in a box whose aspect ratio matches the image,
// so fit:contain shows the whole image with no crop and no letterbox gap.
//   fitMode 'best'  -> box best-fits its parent (bind the limiting dimension).
//   fitMode 'width' -> box spans given width, height derived from ratio.
//   fitMode 'height'-> box spans given height, width derived from ratio.
const RatioCard: React.FC<{
  meta: ImageMeta
  brand: BrandTokens
  border?: string
  fitMode: 'best' | 'width' | 'height'
  span?: string // % used as the bound dimension for 'width' / 'height'
}> = ({ meta, brand, border, fitMode, span = '100%' }) => {
  // Box dimensions. aspect-ratio keeps the shape; max-* clamps to the parent so
  // a tall/wide shot can never overflow while preserving ratio.
  const bindWidth =
    fitMode === 'width' || (fitMode === 'best' && meta.ratio >= 1)
  const boxStyle: React.CSSProperties = {
    aspectRatio: String(meta.ratio),
    maxWidth: '100%',
    maxHeight: '100%',
    width: bindWidth ? span : 'auto',
    height: bindWidth ? 'auto' : span,
  }
  return (
    <div style={boxStyle}>
      <ScreenshotCard
        src={meta.path}
        brand={brand}
        width="100%"
        height="100%"
        border={border}
        fit="contain"
        align="center"
        radius={brand.radii.lg}
      />
    </div>
  )
}

// ScreenshotPair: orientation-aware 2-up composition.
// Mixed (desktop + mobile) -> "device duo": the landscape shot is shown BIG (sized
// by one dimension, never shrunk to fit) and is allowed to bleed off a canvas edge;
// the portrait shot overlaps in front and ALWAYS stays fully visible (never cropped).
// `wide` picks the bleed direction based on the host container shape:
//   wide=true  (hero-stack text-top band): landscape spans the width, bleeds off
//              the bottom; portrait floats front-right.
//   wide=false (hero-split side column):   landscape fills the height, bleeds off
//              the right; portrait floats front-left.
// Each device is an absolutely-positioned block sized via aspect-ratio off a single
// definite dimension - no flex wrapper and no max-* clamp, so the box keeps the
// image's true ratio (fit:contain = whole image) while overflow past the canvas is
// clipped by the root frame's overflow:hidden.
const ScreenshotPair: React.FC<{
  a: ImageMeta
  b: ImageMeta
  brand: BrandTokens
  border?: string
  wide?: boolean
  pairMode?: 'overlap' | 'beside'
}> = ({ a, b, brand, border, wide = false, pairMode = 'overlap' }) => {
  const aPortrait = isPortrait(a)
  const bPortrait = isPortrait(b)

  if (aPortrait !== bPortrait) {
    const land = aPortrait ? b : a
    const port = aPortrait ? a : b
    const card = (meta: ImageMeta) => (
      <ScreenshotCard
        src={meta.path}
        brand={brand}
        width="100%"
        height="100%"
        border={border}
        fit="contain"
        align="center"
        radius={brand.radii.lg}
      />
    )

    // beside: landscape + portrait sit side by side, both anchored to the bottom,
    // EQUAL height, a gap between them, neither overlapping. Portrait keeps all four
    // corners rounded (fully on-canvas) and wears the gradient ring.
    if (pairMode === 'beside') {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: `${brand.spacing.lg}px`,
            paddingBottom: '1%',
          }}
        >
          <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <RatioCard meta={land} brand={brand} border={border} fitMode="height" span="100%" />
          </div>
          <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ height: '100%', aspectRatio: String(port.ratio) }}>
              <GradientRingCard meta={port} brand={brand} radius={`${brand.radii.lg}px`} />
            </div>
          </div>
        </div>
      )
    }

    if (wide) {
      // hero-stack band: landscape spans the width and bleeds off the BOTTOM, so
      // its visible height == the band height. The portrait is anchored to the
      // SAME bottom and given the full band height, so it stands as tall as the
      // landscape's in-frame portion (never floating) while staying fully visible.
      // Top corners rounded only - the bottom is cut square as it bleeds off-canvas.
      return (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '94%',
              aspectRatio: String(land.ratio),
              zIndex: 1,
            }}
          >
            {card(land)}
          </div>
          <div
            style={{
              position: 'absolute',
              right: '2%',
              top: '-6%',
              height: '116%',
              aspectRatio: String(port.ratio),
              zIndex: 2,
            }}
          >
            <GradientRingCard
              meta={port}
              brand={brand}
              radius={`${brand.radii.lg}px ${brand.radii.lg}px 0 0`}
            />
          </div>
        </>
      )
    }

    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '7%',
            transform: 'translateY(-50%)',
            height: '84%',
            aspectRatio: String(land.ratio),
            zIndex: 1,
          }}
        >
          {card(land)}
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            height: '88%',
            aspectRatio: String(port.ratio),
            zIndex: 2,
          }}
        >
          {card(port)}
        </div>
      </>
    )
  }

  // Both portrait -> stand side by side.
  if (aPortrait && bPortrait) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${brand.spacing.lg}px`,
        }}
      >
        <div style={{ height: '94%', display: 'flex', alignItems: 'center' }}>
          <RatioCard meta={a} brand={brand} border={border} fitMode="height" span="100%" />
        </div>
        <div style={{ height: '94%', display: 'flex', alignItems: 'center' }}>
          <RatioCard meta={b} brand={brand} border={border} fitMode="height" span="100%" />
        </div>
      </div>
    )
  }

  // Both landscape + beside -> equal-height panels side by side, a gap between,
  // neither overlapping, both fully visible. Used to showcase two finished assets.
  if (pairMode === 'beside') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${brand.spacing.lg}px`,
        }}
      >
        {[a, b].map((meta, i) => (
          <div key={i} style={{ height: '94%', display: 'flex', alignItems: 'center' }}>
            <RatioCard meta={meta} brand={brand} border={border} fitMode="height" span="100%" />
          </div>
        ))}
      </div>
    )
  }

  // Both landscape -> diagonal cascade, each panel keeping its ratio.
  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '74%', zIndex: 1 }}>
        <RatioCard meta={a} brand={brand} border={border} fitMode="width" span="100%" />
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: '74%', zIndex: 2 }}>
        <RatioCard meta={b} brand={brand} border={border} fitMode="width" span="100%" />
      </div>
    </>
  )
}

interface StackSlot {
  x: number
  y: number
  w: number
  h: number
  z: number
}

function clusterLayout(n: number): StackSlot[] {
  if (n === 2) {
    return [
      { x: 0, y: 4, w: 78, h: 86, z: 1 }, // main back-left
      { x: 42, y: 38, w: 56, h: 58, z: 2 }, // floater front-right
    ]
  }
  // n === 3
  return [
    { x: 8, y: 10, w: 70, h: 78, z: 1 }, // main center-back
    { x: 50, y: 0, w: 48, h: 42, z: 3 }, // top-right small
    { x: 0, y: 56, w: 50, h: 42, z: 2 }, // bottom-left small
  ]
}

// Row layout: panels arranged horizontally, slight overlap for visual depth.
// Used by hero-stack (text top, image row bottom).
function rowLayout(n: number): StackSlot[] {
  if (n === 2) {
    return [
      { x: 0, y: 4, w: 58, h: 92, z: 1 }, // left main
      { x: 46, y: 0, w: 56, h: 92, z: 2 }, // right floats over
    ]
  }
  // n === 3
  return [
    { x: 0, y: 8, w: 42, h: 84, z: 1 }, // left back
    { x: 30, y: 0, w: 42, h: 92, z: 3 }, // center front
    { x: 60, y: 8, w: 42, h: 84, z: 2 }, // right back
  ]
}

function cascadeLayout(n: number): StackSlot[] {
  if (n === 2) {
    return [
      { x: 0, y: 0, w: 70, h: 70, z: 1 },
      { x: 30, y: 30, w: 70, h: 70, z: 2 },
    ]
  }
  return [
    { x: 0, y: 0, w: 64, h: 64, z: 1 },
    { x: 18, y: 18, w: 64, h: 64, z: 2 },
    { x: 36, y: 36, w: 64, h: 64, z: 3 },
  ]
}

function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Corner glow vignette (purple). Used on dark theme for cinematic depth.
export const CornerGlow: React.FC<{
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color: string
  size?: string
  intensity?: number
}> = ({ corner, color, size = '60%', intensity = 0.35 }) => {
  const pos = corner.split('-') as ['top' | 'bottom', 'left' | 'right']
  return (
    <div
      style={{
        position: 'absolute',
        [pos[0]]: '-20%',
        [pos[1]]: '-20%',
        width: size,
        height: size,
        background: color,
        borderRadius: '50%',
        filter: 'blur(300px)',
        opacity: intensity,
        pointerEvents: 'none',
      }}
    />
  )
}
