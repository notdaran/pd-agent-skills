import type { AssetSpec } from '../types'

// paper-renderer: placeholder for future "paper" output mode.
// Not configured yet - throws explicit error so callers get a clear signal
// instead of silent fallback to PNG or Figma.

export interface PaperRenderPlan {
  fileName: string
  notes: string
}

export function buildPaperRenderPlan(_spec: AssetSpec): PaperRenderPlan {
  throw new Error(
    'paper renderer not configured. Phase 02 ships figma + png only. ' +
      'Roadmap: print-ready PDF/SVG export with bleed + crop marks - pending.',
  )
}
