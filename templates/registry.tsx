import type { TemplateModule } from './shared/layout-intent'
import { heroSplit } from './hero-split'
import { heroStack } from './hero-stack'
import { featureCallout } from './feature-callout'
import { productCard } from './product-card'

// All registered template modules. Phase 02 batch complete:
// - heroSplit (text + screenshot side-by-side)
// - heroStack (text + screenshot row stacked vertically)
// - featureCallout (text on one half + panels on the other)
// - productCard (window-framed showcase + chip bullets)
// Renderer guards unknown templateId with explicit error.

export const templates: Record<string, TemplateModule> = {
  [heroSplit.id]: heroSplit,
  [heroStack.id]: heroStack,
  [featureCallout.id]: featureCallout,
  [productCard.id]: productCard,
}

export const templateIds = Object.keys(templates)
