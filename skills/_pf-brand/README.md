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

## Known rough edges

Being honest about the current state rather than describing an intended one:

- **anima syncs by hand, illustra forks.** anima copies these tokens into its
  own `references/brand.css` and again into each composition's `:root`, because
  the HyperFrames renderer needs them inlined. illustra does not read this file
  at all yet - it keeps its own copy of the same values. So the same accent
  colour currently lives in several places, and nothing enforces that they
  match.
- **`badges.html` renders via illustra.** Regenerating the badge catalogue uses
  `../illustra/scripts/render.mjs`, so the two folders are not independent.

Both are on the list to fix. Until then, if you change a colour here, grep for
its hex value before assuming the change reached everything.

## Using a different brand

The visual skills are brand-neutral by design - PageFly is the default preset,
not a hard dependency. Swap `references/brand.css` inside the skill you are
using. A neutral preset is not written yet; [`feature-demo`](../feature-demo)
already has one (`presets/neutral.ts`) and is the pattern the others will
follow.

The PageFly logo in the skill example folders belongs to its owner. Remove it if
you are not authorised to use it.
