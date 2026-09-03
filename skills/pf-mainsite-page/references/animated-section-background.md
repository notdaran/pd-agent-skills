# Animated section background — the one sanctioned `<script>`

**Status: written 2026-09-03 from a single build. Never run on a real PageFly page.**
Everything here is derived from one implementation, reviewed in an Artifact mock, and approved
on the understanding that it gets its first real paste-test at build time. Treat a first use as
a test, not as a routine. Correct this file from what that test shows.

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

## The five rules

These are the load-bearing ones. Each was a mistake first.

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
3. One HTML/Liquid element anywhere inside that section holds the whole file.
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

- Never paste-tested on PageFly. Rules 1–3 should hold anywhere; rules 4–5 are about flickering
  square grids specifically and may not generalise to another effect.
- Cost of one canvas + `requestAnimationFrame` on a marketing page not measured. If it shows up
  in a Lighthouse run, the loop should stop when the section is off-screen.
