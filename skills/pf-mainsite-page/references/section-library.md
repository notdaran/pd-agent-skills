# A worked example: the named section library on pagefly.io

**This is the one inventory the skill deliberately carries, and it doubles as a worked example.**
It is a real library from a real store - eight named, published global sections that cover the whole
feature-page skeleton, built on purpose by the team that runs the site. Every layout below is
measured off public pages, so you can open pagefly.io and check any of it.

Your store's library will not be these eight. Read this for the *shape* of a good one - which
columns earn their place, what stays true, what has to be re-read every build - then build yours the
same way. For the store this skill was written against it also does its literal job: re-deriving
"which layouts exist" by measuring the homepage every time is wasted work now.

**Last read: 2026-08-27** (leftovers + Custom.HTML padding re-measured same day, `/pages/aeo` build;
`Hero with explainer video` added same day from the operator's own build), from PageFly App → Sections.

## What is durable vs what must be re-read

| Durable | Re-read every build |
|---|---|
| The **names** and what layout each one is. These were chosen by the team and are stable. | **Status** and **Used on**. Both move. |
| The known leftovers each one drags along (below). | Whether a new section has been added to the library. |

A name in this table that you cannot find in the app is not a reason to guess - open Sections and
look. Rule 0 still applies to the two right-hand columns; it no longer applies to the names.

## The library

| Name | Layout | Harvested from | Status @ 27/08 | Used on @ 27/08 |
|---|---|---|---|---|
| `Dark hero` | Dark `#030712`. Heading, lead, 3-stat row, 2 visible buttons | Homepage `pf-31c1` | Published | 0 |
| `Hero with explainer video` | Dark. Heading, lead, 2-button row, then a full-width `HTML video` below. **No stat row** | Built in the editor, not harvested off a page | Published | - |
| `Dark 3 col with icons` | Dark. 3 equal cards, 387px, icon badge at card top | Homepage `pf-e453` | Published | 0 |
| `Light bento 2+3` | Light. Row of 2 (590/590), then row of 3 (387×3) | Homepage `pf-df6f` | Published | 0 |
| `Dark bento 2+2` | Dark. Two rows of 2 cards, 590 each | Homepage `pf-a80d` | Published | 0 |
| `Review + FAQ` | 3 review cards + `Accordion3` with 6 items | Pricing `pf-4cca` | Published | 0 |
| `[New Website] CTA section` | Site-wide closing CTA | pre-existing | Published | **88** |
| `[Website 2024] Review section` | Review block | pre-existing | Published | 9 |

The five harvested ones read `0 page` because every page that uses them **unsyncs** on insert -
that is the intended pattern, not a sign they are unused.

### Which hero a page gets

Decide on what the page actually has, not on taste. Neither hero degrades gracefully when its
signature slot is empty.

- **`Hero with explainer video`** - the page has a real explainer video. The `HTML video` element
  wants a hosted video URL; leaving Page Checkup's video in place ships the wrong product's demo.
  **It also needs a block of page custom CSS every time** - see the section below; without it the
  video has square corners and the wrong aspect ratio.
  Its 2-button row is `Learn more` (secondary, deep-links a help.pagefly.io article, opens in a new
  tab) + `Try PageFly free` (primary). Both URLs are per-page and must be rewritten.
- **`Dark hero`** - no video, and three stats worth showing. Costs the cleanup in the leftovers
  table below: 2 dead buttons and a hidden 3rd stat pair.
- **Neither** - there is no third hero. Do not strip the video out of this one to fake one; an
  empty `HTML video` leaves a hole the section's spacing was built around.

## Leftovers each one carries — budget deletion time

Measured from the live source pages, 27/08. If the section was cleaned at save time some rows are
already gone; check before deleting.

| Section | Drags along |
|---|---|
| `Dark hero` | **2 dead buttons** (`Open live editor`, `Try demo`) beside the 2 visible ones. Re-measured 2026-08-27 at 390px: they are `display:none` at **every** breakpoint, not mobile-only, and the 2nd has no click action at all - delete them rather than rewriting them. Also a **3rd stat pair** (`#1` / `Shopify page builder`) hidden the same way, so the stat row only shows 2 of its 3 slots until you un-hide it. Plus `New: Explore AI Page Builder & CRO Platform`, `Introducing: AI sales page`, `Trusted by the best Shopify Plus merchants` + logo strip, and possibly 2 `Custom.HTML` |
| `Hero with explainer video` | **Clean** - the outline is exactly Heading / Paragraph / Flex block (2 Buttons) / `HTML video`, nothing hidden, no dead buttons. What it does drag along is *content*, not elements: the placeholder copy, the video file and both button links are all AI Page Checkup's. Swap all four |
| `Dark 3 col with icons` | `Brands using PageFly` line. Icon badge is an `Image4`, not an `Icon2` |
| `Light bento 2+3` | **The dirty one.** ~29 elements of `Tabs3` / `TabsMenu3` / 5 × `TabHeader3` / 5 × `TabsContent3` and their inner heading + paragraph + button. Plus a stray `Try PageFly Free` button |
| `Dark bento 2+2` | Clean. 4 tiles, 4 headings, 4 paragraphs |
| `Review + FAQ` | Content only, no stray elements: every review card and all 6 accordion items hold the Pricing page's copy. Swap all of them |
| `[New Website] CTA section` | **Never unsync.** 88 pages point at it |

## Page custom CSS some sections require

Two sections do not render correctly on their own. The CSS below goes in the editor's
**`</>` Custom code panel → CSS tab** (left rail, near the bottom), not in a `Custom.HTML` element.
The panel takes bare CSS - **no `<style>` tags**, as its own hint says.

It is **per page**: both snippets share the same box on the same page, and inserting either section
on a *new* page means pasting its CSS again. A global section does not carry page CSS along, so this
is the step that gets forgotten and the reason the section then looks broken on the new page only.

### `Hero with explainer video` — mandatory

Give the video element the class `pf-hero-video`, then paste:

```css
.__pf .pf-hero-video {
  --pf-aspect-ratio-value: 1624/854 !important;
  overflow: hidden;
  border-radius: 20px;
}
.__pf .pf-hero-video video,
.__pf .pf-hero-video .pf-video-cover-image {
  border-radius: 20px;
}
```

**`1624/854` is this video's ratio, not a constant. Re-measure it for the replacement video.**
A ratio that does not match the file leaves transparent letterbox bands inside the element, and the
20px radius then clips the *band* instead of the picture - so the corners read as "not rounded" and
the CSS looks broken when it is not. Get the real number from the file itself
(`videoWidth`/`videoHeight`), before touching any CSS.

### `Review + FAQ` — whenever the FAQ is used

```css
.pf-accordions details {
  border-radius: 12px;
  background: rgba(255, 255, 255, .3);
}
```

Given without a `.__pf` scope, unlike the hero rule above - paste it as written rather than
"correcting" it, since that is what is running on the pages that look right.

## Copy budget per slot — measured 2026-08-27

The layout was designed around the words that were in it. Copy at twice the length breaks the
block's rhythm even when every token is right. Treat these as a budget, not a suggestion.

| Section | Slot | Words the original holds |
|---|---|---|
| `Dark hero` | lead under the H1 | **19** |
| `Hero with explainer video` | H1 | **14** (wraps to 2 lines at 1440px) |
| `Hero with explainer video` | lead under the H1 | **24** (one line at 1440px) |
| `Dark 3 col with icons` | section lead | **11** |
| `Dark 3 col with icons` | each column body | **18** |
| `Dark bento 2+2` | section lead | **18** |
| `Dark bento 2+2` | each tile body | **9 - 15** |
| `Light bento 2+3` | section lead | **20** |
| `Light bento 2+3` | large tile | **18** |
| `Light bento 2+3` | small tile | **6 - 15** |

**Unconstrained**, because they are not part of a harvested layout: the FAQ accordion body (it is
collapsed until opened) and any `Custom.HTML` block. The 40-60 word paragraph an LLM will quote
belongs in one of those two, never in a section lead.

**There is no slot for a one-line closing fact per section.** Adding one costs a hand-dragged
element per section. Put the fact in the FAQ or the `Custom.HTML` block instead.

## What the library does NOT have

- **No comparison-table section.** The whole store has zero `<table>` elements. A real data table
  is the one case that justifies `Custom.HTML`.
- **No FAQ section other than `Review + FAQ`.** Four sections named "FAQ" exist and all are dead
  (0 pages); do not revive them.
- **Two heroes, no banner, no header, no footer** - header and footer live in the theme.

## What this means for Steps 1 and 2

A new feature page normally needs **no measuring and no harvesting**. Pick from the table, insert,
unsync, rewrite. Measure only in the two cases named in Step 1.

Harvest only when the block list genuinely needs a layout the table does not have - and then add
the new section to this file with the date.
