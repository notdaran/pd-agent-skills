import type { BrandTokens } from './types'
import { neutral } from './presets/neutral'
import { pagefly } from './presets/pagefly'

// Brand preset selector. Default is the brand-agnostic `neutral` preset so the
// skill works out of the box for anyone. Switch presets with the env var:
//
//   FEATURE_DEMO_BRAND=pagefly npx tsx scripts/run-render.tsx png ...
//
// Add your own: create presets/<name>.ts exporting a BrandTokens object,
// register it below, then run with FEATURE_DEMO_BRAND=<name>.

const presets: Record<string, BrandTokens> = {
  neutral,
  pagefly,
}

const active = process.env.FEATURE_DEMO_BRAND ?? 'neutral'

export const brand: BrandTokens = presets[active] ?? neutral
