# anima Component Catalog

Reusable on-brand **motion blocks** for PageFly motion pieces (teasers, animated illustrations, heroes), extracted from the proven
worked example (`examples/before-after/index.html`, the Page Checkup intro). Each is a
self-contained fragment in `components/<name>.html`: paste its markup into a scene on
`templates/canvas.html`, then paste its **Timeline recipe** into the single composition timeline.

## Delivery decision: inline snippets, NOT HyperFrames sub-compositions

A teaser is one tightly-choreographed timeline. Nesting independent sub-timelines per block fights
cross-block choreography (the scan beam, the synchronized BEFORE->AFTER morph, the loop seam all
span blocks). So each component is a documented **HTML + scoped CSS fragment plus a `<!-- Timeline
recipe -->`** - the exact `gsap.from/to/fromTo` lines and suggested time offsets - that the author
pastes into the case's one `tl` timeline and rebases to the scene's enter time.

## Hard contract (every snippet)

- **Brand-hued color via `var(--...)` only** - never a brand hex. Alpha tints use
  `color-mix(in srgb, var(--token) N%, transparent)` so a rebrand (swap `brand.css`) flows through.
- **Three documented literal exceptions** (style-guide): (1) **fonts** stay literal `"Poppins"` /
  `"JetBrains Mono"` - the renderer can't resolve `var(--font-*)`; (2) **GSAP color tweens**
  (`borderColor`, `color`, `boxShadow`) keep literal hex - GSAP can't tween to a CSS var;
  (3) **SVG `stroke`** keeps literal hex. **Neutrals** (black shadows/dims, white backing,
  the AA-contrast `#15803d` fill) stay literal rgba/hex - they are not brand tokens.
- **`pf-` class/id prefix** so blocks don't collide when several share a canvas.
- **Self-contained**: each file carries its own `<style>` + a leading comment (purpose, source, vars,
  placement, params) + the timeline recipe. Geometry (left/top/size) is case-specific - adjust inline.
- **Entrances only** in recipes (`from`/`fromTo`); exits live on the final beat (the loop tail), per style-guide.
- **Labels & badges from the shared kit** - never re-invent inline. Style per `_pf-brand/label-rules.md`;
  badge families / colors per `_pf-brand/badges.html` via `var(--badge-*)`. Poppins, sentence case, soft 8px;
  no mono-caps eyebrows, no metallic pills.

## Index

| Component | Purpose | Source node |
| --- | --- | --- |
| [glow-bg](../components/glow-bg.html) | breathing purple/blue radial glows + concentric rings (navy depth) | `#s1-glow-*`, `.s1-ring` |
| [logo-lockup](../components/logo-lockup.html) | centered intro lockup: logo + kicker + title + accent bar + subhead | `.s1-center` |
| [before-after-card](../components/before-after-card.html) | screenshot card morphing BEFORE->AFTER with red issue / green fixed markers | `#s2-page` |
| [reveal-card](../components/reveal-card.html) | single screenshot card; crossfades a clean state to a revealed one (e.g. page -> heatmap) | `#hm-card` |
| [score-ring](../components/score-ring.html) | gauge halo, pulses amber then turns green on the fix | `#s2-ring` |
| [emphasis-bar](../components/emphasis-bar.html) | bottom stat bar: label + count-up score + delta chip + status pill | `#s2-emphasis` |
| [scan-beam](../components/scan-beam.html) | cyan beam sweep that marks the reveal / fix moment | `#s2-beam` / `#hm-beam` |
| [footage-scene](../components/footage-scene.html) | an existing real recording as a full-bleed scene, blur-crossfaded in from a title card | `#s2` / `#s2-video` |
| [loop-tail](../components/loop-tail.html) | full-bleed veil fading to navy so the loop seam is invisible | `#loopveil` |

`footage-scene` belongs to a different shape - a **footage piece** (title card -> real recording), which is
1920x1080 and linear rather than a 1600x900 loop. Read `../references/style-guide.md` -> Footage pieces first.

These six compose the whole Page Checkup teaser: `glow-bg` + `logo-lockup` (scene 1), then
`glow-bg` + `before-after-card` + `score-ring` + `emphasis-bar` (scene 2), closed by `loop-tail`.

## Governance (when to promote a new block into the kit)

After each new teaser, scan what was hand-built for parts that are **(a) reusable** across cases,
**(b) self-contained** (own markup + scoped CSS + a clean recipe), and **(c) on-brand** (var-only,
follows the style-guide). If all three hold -> propose it, get approval, and add a `components/<name>.html`
+ a row below. **A block hand-built a second time is almost always a promote.** Keep the kit lean
(YAGNI): don't seed a part until a real case needs it.

## Built-parts log (a 2nd build = promotion signal)

| part | seeded in | built again? | notes |
| --- | --- | --- | --- |
| glow-bg | page-checkup intro | (seed) | scene-agnostic depth layer; used in both scenes |
| logo-lockup | page-checkup intro | (seed) | scene-1 brand statement |
| before-after-card | page-checkup intro | (seed) | the morph hero; most complex block |
| score-ring | page-checkup intro | (seed) | amber->green gauge halo |
| emphasis-bar | page-checkup intro | (seed) | count-up score + status pill |
| loop-tail | page-checkup intro | (seed) | seamless-loop seam (anima signature) |
| footage-scene | checkup-sharper | (1st) | first non-loop piece; carries the 1920x1080 + data-fps root setup |
> Add a row each time a NEW bespoke block is built in a teaser; a 2nd appearance = promote to a kit file.
