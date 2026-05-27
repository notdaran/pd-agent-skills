import type { BrandTokens } from '../types'

// PageFly brand preset.
// SOURCE: pagefly.io homepage live inspection on 2026-05-13.
// Method: chrome-devtools getComputedStyle + :root CSS vars.
//
// Mapping CSS var -> token:
//   --color-primary  #535af7  -> palette.accentPrimary
//   --color-secondary #a6acff -> palette.accentSecondary
//   --color-cyan     #67DCF9  -> palette.accentCyan
//   --color-dark     #16171a  -> palette.text
//   --color-black    #1E222B  -> palette.surfaceAlt (dark surface)
//   --color-gray     #73747b  -> palette.textMuted
//   --color-border   #f0f0f0  -> palette.border
//   --color-pastel   #f0f2ff  -> flourishes.heroBgLight
//   hero section bg #030712   -> palette.bgDark / flourishes.heroBgDark
//   --font-secondary Poppins  -> fonts.heading / fonts.body
//   Button radius 8px         -> radii.md

export const pagefly: BrandTokens = {
  palette: {
    bg: '#FFFFFF',
    bgDark: '#030712',
    surface: '#F9F9F9',
    surfaceAlt: '#1E222B',
    accentPrimary: '#535AF7',
    accentSecondary: '#A6ACFF',
    accentCyan: '#67DCF9',
    text: '#16171A',
    textOnDark: 'rgba(255, 255, 255, 0.96)',
    textMuted: '#73747B',
    border: '#F0F0F0',
  },
  fonts: {
    heading: 'Poppins',
    body: 'Poppins',
  },
  // Light theme uses the blue mark; dark theme uses the white mark.
  logo: { light: 'pagefly-blue.png', dark: 'pagefly-white.png' },
  fontWeights: {
    extraLight: 200,
    regular: 400,
    medium: 500,
    bold: 700,
  },
  // Font sizes / line heights deliberately OUT of brand tokens.
  // Per-asset, per-template decision. Template recipe decides px by canvas size.
  radii: {
    sm: 4,
    md: 8,
    lg: 16,
    pill: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 32,
    xl: 64,
    xxl: 128,
  },
  flourishes: {
    heroBgDark: '#030712',
    heroBgLight: '#F0F2FF',
    // Light-theme canvas background: soft purple -> blue diagonal gradient.
    heroBgLightGradient: 'linear-gradient(135deg, #CED0FD 0%, #D9EBFD 100%)',
    glow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)',
    accentBar: '#535AF7',
  },
  // Background glow palette for dark-theme templates. Templates pick 2 colors
  // deterministically (seeded by spec content) so renders vary per asset but
  // stay stable for the same input.
  glowPalette: [
    '#535AF7', // brand purple
    '#A6ACFF', // light purple
    '#67DCF9', // cyan
    '#3B1E72', // deep purple
    '#22C55E', // green
    '#0EA5E9', // sky blue
    '#8B5CF6', // violet
  ],
}
