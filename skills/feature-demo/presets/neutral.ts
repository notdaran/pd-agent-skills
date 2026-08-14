import type { BrandTokens } from '../types'

// Neutral default brand preset.
// Brand-agnostic slate + blue palette so the skill works out of the box for
// anyone. No logo mark (logo: null). Ships with Poppins (SIL OFL, free to
// redistribute) as the default font.
//
// To use your own brand: copy this file to presets/<yourbrand>.ts, edit the
// tokens, drop your logo PNGs into assets/logos/, then run with
// FEATURE_DEMO_BRAND=<yourbrand>. See README.

export const neutral: BrandTokens = {
  palette: {
    bg: '#FFFFFF',
    bgDark: '#0F172A',
    surface: '#F8FAFC',
    surfaceAlt: '#1E293B',
    accentPrimary: '#2563EB',
    accentSecondary: '#60A5FA',
    accentCyan: '#22D3EE',
    text: '#0F172A',
    textOnDark: 'rgba(255, 255, 255, 0.96)',
    textMuted: '#64748B',
    border: '#E2E8F0',
  },
  fonts: {
    heading: 'Poppins',
    body: 'Poppins',
  },
  // Neutral brand ships without a logo mark.
  logo: null,
  fontWeights: {
    extraLight: 200,
    regular: 400,
    medium: 500,
    bold: 700,
  },
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
    heroBgDark: '#0F172A',
    heroBgLight: '#EFF6FF',
    heroBgLightGradient: 'linear-gradient(135deg, #DBEAFE 0%, #E0F2FE 100%)',
    glow: '0 3px 6px -4px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08), 0 9px 28px 8px rgba(0,0,0,0.05)',
    accentBar: '#2563EB',
  },
  glowPalette: [
    '#2563EB', // blue
    '#60A5FA', // light blue
    '#22D3EE', // cyan
    '#1E3A8A', // deep blue
    '#22C55E', // green
    '#0EA5E9', // sky blue
    '#8B5CF6', // violet
  ],
}
