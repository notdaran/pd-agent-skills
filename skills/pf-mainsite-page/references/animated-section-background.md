# Animated section background — the one sanctioned `<script>`

**Status: paste-tested on a real PageFly page 2026-09-03** (`/pages/shopify-markets`, block 4).
Written the same day from a mock; this file and `assets/flicker-grid-section.html` have since been
corrected from the test. Rules 1, 3, 4 and 5 held as written. **Rule 2 did not** - the CSS as first
shipped lost to the editor's own styling and produced exactly the unreadable case rule 2 exists to
prevent, while looking like the rule had been followed. That correction, and one the file was
missing entirely (the section's own ground), are marked **[from the paste-test]** below.

Still one build's worth of evidence. Keep correcting it.

This is **one option**, not a house style. A `Custom.HTML` block that is a table, a spec strip,
an image or a video needs none of it — go back to Step 5 of `SKILL.md`.

---

## When to reach for it

Use when a section is **text-dense, image-free, and reads as a wall**: a benefit block of four
short cards, a "why this exists" block, a comparison intro. The ambient layer gives the section
a floor without competing for attention.

Do **not** use it when:

- the section already carries an image, a video or a chart — it is loud enough,
- the section is the hero — the hero has the video slot,
- more than one section on the page would use it. One per page. Two makes the page feel like a
  screensaver, and the second one stops being a signal.

---

## The rules

These are the load-bearing ones. Each was a mistake first. Rules 1-5 come from the design round;
rule 6 came out of the paste-test.

### 1. The animation belongs to the **section**, not to the cards

Putting the layer on each card means every line of card text sits on moving texture. It was
measurably hard to read and the operator rejected it twice.

Put one layer behind the whole section; let the cards sit on top of it. The effect is the same,
and it also costs less: one canvas per section instead of one per card.

### 2. Anything holding text must be **opaque**

A card at `background: rgba(255,255,255,.05)` — the default fill on this store's tiles — lets the
layer straight through. That *is* the unreadable case from rule 1, arriving by a different door.

Give every card a solid background (`#0A0E1A` on the dark ground) and raise it on hover with a
solid value, not an alpha.

**[from the paste-test] Declaring it is not enough — it needs `!important`.** On the real page the
cards computed to `rgba(255,255,255,.3)` with the fragment's rule sitting right there in the DOM.
`.pf-why-card{background:#0A0E1A}` lost. `.pf-fgrid-section .pf-why-card{...}` — two classes,
beating any single-class rule — also lost. Only `!important` won.

The competing declaration was never identified: walking `document.styleSheets` and testing
`element.matches(rule.selectorText)` returned zero matching background rules, including the
fragment's own, so it lives in a sheet that walk cannot read. Do not repeat the guess that it is
styled-components injection order; that was inferred, not measured. What is measured is the
outcome — **two classes lose, `!important` wins** — and it is now in the asset.

**Verify by computed value, never by the rule existing.** This is the whole check:

```js
getComputedStyle(document.querySelector('.pf-why-card')).backgroundColor   // must be opaque
```

The general form of this mechanic — a fragment styling PageFly's own elements rather than its own
markup — is in `pagefly-editor-mechanics.md`. It is not specific to this effect.

### 3. Layer order: **above the section background, below the text**

`isolation: isolate` on the section, `z-index: -1` on the layer.

Without `isolation`, `z-index:-1` escapes the section and disappears behind the page. With
`isolation` but no negative z-index, the layer is a positioned descendant and paints **over** the
text. Both were hit.

This rule holds for any decorative layer behind text, including a CSS-only one — it is not
specific to canvas.

### 4. Density and rate are **two knobs**, not one

Thinning the grid made the motion vanish, which reads as "increase the density" when the thing that
actually needed raising was the flicker rate. Each cell was only changing every ~3 s.

- Density → the gap between cells.
- Perceived liveliness → how often a cell changes.

Tune them separately or you will chase your tail.

### 5. A rotated shape under ~6px reads as a circle

A 3.6px square rotated 45° is anti-aliased on all four corners and the eye resolves it as a dot.
Two rounds were spent on "make it a diamond" before this was understood.

If a shape has to read as a shape at that size, keep it axis-aligned. If it has to be rotated,
it has to be bigger.

### 6. [from the paste-test] The fragment owns the section's **ground** too, not just the cards

The file originally assumed the host section already sat on the store's dark `#030712`. On the real
build it did not: block 4 was created by duplicating the **light** block above it, so it inherited a
light gradient as a `background-image` with a transparent `background-color`. The grid ran, the
cards went dark, and the section stayed light. The effect was designed for a ground that was not
there.

Three properties, not one, and the asset now sets all three:

```css
.pf-fgrid-section{ background-color:#030712 !important; background-image:none !important }
.pf-fgrid-section h1,.pf-fgrid-section h2,
.pf-fgrid-section h3,.pf-fgrid-section h4{ color:rgba(255,255,255,.96) !important }
.pf-fgrid-section p{ color:rgba(255,255,255,.64) !important }
```

- **`background-image:none` is the one that gets forgotten.** A donor gradient survives a
  `background-color` change, and a probe that reads only `backgroundColor` reports
  `rgba(0, 0, 0, 0)` and looks clean. See anti-pattern #24.
- **Text colour comes with the ground.** Flip a section to dark without it and you get dark text on
  a dark ground - it was dark-on-dark on the first pass here.
- If the host section is *already* on `#030712`, this block is a no-op and can be deleted. It is the
  first block in the asset's `<style>` for exactly that reason. The asset carries no comments
  (Step 5), so this is the only place that says so.
- It does mean the section's appearance now lives in a `Custom.HTML` element rather than its own
  inspector settings. **Say so in the build order**, or the next person changes the background in
  the Styling tab and finds it does not take.

---

## Values that survived review

Reviewed against this store's dark ground (`#030712`) with body copy over it:

| | Value | Why |
|---|---|---|
| Square | 4px | Magic UI's default; crisp, axis-aligned |
| Gap | 9px | 14px killed the motion, 6px was too busy under headings |
| Max opacity | 0.10 | 0.18 made the section lead hard to read |
| Colour | `140,146,255` | brand-tinted rather than neutral white |
| Flicker rate | 1.2 | average changes per cell per second, ≈ 0.8 s apart |

The heading and lead of the section sit **directly on the layer** — they are not in a card. They
are the readability constraint, not the cards. Judge opacity against them.

---

## The `<script>` exception — four conditions

`SKILL.md` Step 5 says no `<script>`. This is the one approved exception, and it stays approved
only while all four hold.

1. **No `//` comments. Semicolons everywhere.** The HTML/Liquid element collapses the script to a
   single line when saved; either of those kills it silently, with no error.
2. **One HTML/Liquid element for the whole section**, driving existing PageFly elements through
   CSS classes (`pf-fgrid-section` on the section, `pf-why-card` on the cards). Never one custom
   block per card — that takes the cards out of the editor's reach and out of the merchant-visible
   element tree.

   **[from the paste-test] The element does not have to be inside that section.** The script does
   `document.querySelectorAll('.pf-fgrid-section')`, so it finds its target from anywhere on the
   page. This matters more than it sounds: a browser agent **cannot drag in a new element**
   (see `automating-the-editor.md`), so on an automated build the only available host is a
   `Custom.HTML` element the page already has — which will usually be in a different section. That
   is what happened here, and it worked. A section holding nothing but this fragment renders **0px**
   tall, so the leftover host costs no layout. Do not delete it for tidiness; you cannot replace it.
3. **Verified in Preview, never in the editor.** The editor does not execute scripts, so a correct
   block looks dead on the canvas. Do not "fix" it there.
4. **`prefers-reduced-motion` branch present**, disabling the flicker and the hover transform.

Anything else wanting a `<script>` gets its own review. Do not generalise from this one.

---

## Paste-ready

`assets/flicker-grid-section.html` — `<style>` plus `<script>`, nothing else. Drop it into one
HTML/Liquid element inside the section. It carries **no comments**, deliberately: Step 5 bans them
in a fragment, because the fragment is served verbatim on a public page. The knobs live here.

### Setting it up

1. Section gets the class `pf-fgrid-section` (Advanced → CSS class).
2. The four cards get `pf-why-card`.
3. One HTML/Liquid element holds the whole file — inside that section if you can drag one in,
   any existing one on the page if you cannot (exception condition 2).
4. Save, then open **Preview**. The canvas will show nothing — that is rule 3 of the exception, not
   a fault.

### Knobs, all at the top of the script

| Name | Does | Note |
|---|---|---|
| `MAX_OPACITY` | how visible the layer is | the one to reach for first |
| `GAP` | spacing between squares | density only — does not change liveliness |
| `CHANCE` | average changes per cell per second | liveliness only — does not change density |
| `SQ` | square edge in px | keep axis-aligned; see rule 5 |
| `COLOR` | `'r,g,b'` | `'140,146,255'` brand-tinted, `'255,255,255'` neutral |

The card background is in the `<style>` block and **must stay opaque** — rule 2.

---

## Open questions

- ~~Never paste-tested on PageFly.~~ **Answered 2026-09-03** — paste-tested on
  `/pages/shopify-markets`. The script survived the single-line collapse, the canvas was created and
  sized correctly at `dpr` 2, Preview showed the effect and the editor canvas showed nothing (rule 3
  of the exception, as predicted). Rules 1, 3, 4, 5 held. Rule 2 needed `!important`; rule 6 was
  missing entirely. Still one build's worth of evidence — rules 4-5 remain specific to flickering
  square grids and may not generalise to another effect.
- **Not yet seen on the published page.** The test was Preview only; the page is saved, not
  published. The theme's own stylesheets load on preview, so a bare-tag collision would already have
  shown - but the published route has not been exercised.
- Cost of one canvas + `requestAnimationFrame` on a marketing page not measured. If it shows up
  in a Lighthouse run, the loop should stop when the section is off-screen.
