# _pf-brand

Not a skill - no `SKILL.md`, nothing to invoke. This is the shared brand
identity that [`illustra`](../illustra) and [`anima`](../anima) read from, kept
as a sibling folder so both can reference it by the same relative path.

| File | What it holds |
|---|---|
| `brand-identity.css` | Identity tokens: accent colours, font families and weights, the badge palette, radii |
| `badges.html` | A renderable catalogue of badge styles - three families (Tint / Ghost / Solid) across five colours plus neutral |
| `label-rules.md` | Seven rules for labels, eyebrows and badges - what to use when, and which dated patterns to avoid |

Edit identity and badge colours **here**, not in a per-skill copy.

## Changing a colour

These tokens are not read at runtime by the skills that use them, so one edit
here does not reach everywhere:

- **anima inlines them twice.** It copies them into its own
  `references/brand.css`, and again into each composition's `:root`, because the
  HyperFrames renderer needs the tokens inlined in the HTML it renders.
- **illustra keeps its own copy** of the same values in its
  `references/brand.css`.
- **`badges.html` renders through illustra**, via
  `../illustra/scripts/render.mjs`.

So after changing a colour here, grep for its hex value across `skills/` and
update every hit.

## Using a different brand

The visual skills are brand-neutral engines with PageFly as the default preset,
not PageFly-only tools. Swap `references/brand.css` inside the skill you are
using. [`feature-demo`](../feature-demo) works differently: it selects a preset
from `presets/` by environment variable, and ships a brand-agnostic `neutral`
one.

The PageFly logo in the skill example folders belongs to its owner. Remove it if
you are not authorised to use it.
