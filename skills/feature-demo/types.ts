import { z } from 'zod'

export const SizeSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  label: z.string().optional(),
})
export type Size = z.infer<typeof SizeSchema>

export const OutputModeSchema = z.enum(['figma', 'png', 'paper'])
export type OutputMode = z.infer<typeof OutputModeSchema>

export const MoodSchema = z.enum(['showcase', 'comparison', 'tutorial']).optional()
export type Mood = z.infer<typeof MoodSchema>

// Theme: dark default per Daran 2026-05-13. Light only when user explicit asks.
export const ThemeSchema = z.enum(['dark', 'light']).default('dark')
export type Theme = z.infer<typeof ThemeSchema>

export const DevInputSchema = z.object({
  feature: z.string().min(1).max(50),
  oneLiner: z.string().min(10).max(120),
  screenshot: z.string().min(1),
  size: SizeSchema,
  mode: OutputModeSchema,
  mood: MoodSchema,
  theme: ThemeSchema.optional(),
})
export type DevInput = z.infer<typeof DevInputSchema>

export const AssetSpecSchema = z.object({
  size: SizeSchema,
  mode: OutputModeSchema,
  theme: ThemeSchema,
  heading: z.string().min(1).max(60),
  bullets: z.array(z.string().max(40)).min(2).max(3),
  // tilt kept for opt-in only - templates default to 0 (no rotation) per Daran feedback.
  screenshots: z
    .array(z.object({ path: z.string(), tilt: z.number().min(-30).max(30).optional() }))
    .min(1)
    .max(3),
  templateId: z.string(),
  variation: z.string(),
  // Device-duo (desktop+mobile) composition mode. overlap = portrait sits in front
  // of the landscape; beside = side by side with a gap, equal height. Default overlap.
  pairMode: z.enum(['overlap', 'beside']).optional(),
})
export type AssetSpec = z.infer<typeof AssetSpecSchema>

export interface BrandTokens {
  palette: {
    bg: string
    bgDark: string
    surface: string
    surfaceAlt: string
    accentPrimary: string
    accentSecondary: string
    accentCyan: string
    text: string
    textOnDark: string
    textMuted: string
    border: string
  }
  fonts: {
    heading: string
    body: string
  }
  // Logo asset filenames (resolved against assets/logos/). `null` = no logo
  // (neutral brand renders without a logo mark). `light`/`dark` map to theme.
  logo: { light: string; dark: string } | null
  fontWeights: {
    extraLight: 200
    regular: 400
    medium: 500
    bold: 700
  }
  // Font sizes deliberately NOT in brand tokens.
  // Per-asset / per-template decision (xem AssetSpec hoặc template recipe).
  // Brand locked: font family + weight set + line-height ratio guidance ở template.
  radii: {
    sm: number
    md: number
    lg: number
    pill: number
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
  flourishes: {
    heroBgDark: string
    heroBgLight: string
    heroBgLightGradient: string
    glow: string
    accentBar: string
  }
  glowPalette: string[]
}
