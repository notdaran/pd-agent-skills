---
name: illustra
description: Use when creating a marketing illustration for a single bento / App-Store / feature card - blends real product screenshots with hand-drawn vector UI mockups (editor panels, score rings, drag-insert lines, A/B cards) as pure HTML/CSS/SVG on a swappable brand preset, exported as a transparent retina PNG. Not for full page layouts, animation (HyperFrames), or AI image generation.
---

# Illustra

## Overview
One illustration = the art *inside* one card. Pure HTML / CSS / SVG, driven by a swappable brand
preset (`references/brand.css`), mixing real screenshots with hand-drawn vector UI parts, exported
as a transparent retina PNG. Standalone-ready (swap brand.css to rebrand) and animation-ready (clean
HTML upgrades cheaply to HyperFrames later).

## When to use
Producing the visual for ONE marketing/feature/App-Store card: a screenshot framed + annotated, or a
vector UI mock (editor panel, selection frame, score ring, drag-insert, A/B card, chart, partner orb).

**Not for:** multi-card page layouts; animated sequences (use HyperFrames); photoreal or AI-generated
imagery (Illustra is vector + framed real screenshots only).

## Workflow
The detailed intake gates, composition rules, hard rules and sizing all live in
`references/style-guide.md`; SKILL.md carries the flow + the rule index. Read the style-guide before
composing (step 4).

0. **Destination & asset intake (MANDATORY - first).** The member is non-tech: ask conversationally,
   do NOT use AskUserQuestion. Three gates (full text: style-guide "intake rules"):
   - **Gate 0 - CONCEPT.** Name the feature's function in ONE sentence + the ONE thing the art must
     prove; the art depicts THAT. The neighbor screenshot is **context** (palette, motif), **never a
     template to clone** - relabeling a neighbor's composition reads as that neighbor, not the feature.
     Two cards in a section share VISUAL LANGUAGE but differ in CONCEPT; if you can't name what makes
     this art distinct from its neighbors, rethink before drawing.
   - **Rule 1 - MODE.** Where will it live? Capture a neighbor reference, pick **Mode A** (light
     website-card) or **Mode B** (dark-glass). Destination-driven, no fixed default. Dark
     marketing-site cards use the `--mkdark-*` palette + frost-chip badges. A **dual-view** (one illus
     showing in-app config AND live storefront) splits palette by role: config = light/white,
     storefront = dark.
   - **Rule 2 - ASSET-TYPE per element.** Real app UI = a **real screenshot crop, NEVER
     vector-redrawn** (request the capture if missing; exception: a bugged/uncapturable real screen
     MAY be a member-directed vector sim kept in the solid-white UI palette). Storefront/product = real
     photo, framed. Abstract / connective tissue / decoration = vector.
1. **Lock the asset mix.** Pure vector / framed screenshots / hybrid, and how many of each (consistent
   with the asset-type call). When an element could be screenshot-only OR screenshot + vector overlay,
   don't silently pick - **offer both and render BOTH** for the member (R6).
2. **Pick parts** from `references/component-catalog.md`; note any bespoke part to draw.
3. **Gather + crop screenshots.** For distinctive app UI: find crop coords (PIL ruler pass), crop the
   pieces with Pillow **cutting on a whitespace gutter** (R2), save to `outputs/assets/`, embed each
   via `<img>` in a `floating-panel`. Screenshots pass through untouched - never AI-redraw or recolor.
4. **Compose & draw.** Copy `templates/canvas.html`, set `#stage` W x H, pull component snippets and
   adapt inline. **Producing a SET?** Decide each illustration's SKELETON up front and make adjacent
   ones differ (R17) - mirror the axis, invert the hierarchy, or flip the cascade. Deciding this after
   the fact means rebuilding a card. Apply the **composition rules** (index below; full text + the load-bearing gotchas in
   style-guide "Composition" + "Sizing"). Run the R9 edge self-audit as you place.
5. **Render & preview-on-card.** `node scripts/render.mjs <canvas.html> outputs/<name>.png --width W
   --height H` (from skill root). Drop the PNG on a copy of the destination card and run the
   **match-neighbors review** (intake rule 3). **For a SET: build the destination preview grid FIRST**
   (all N at their real display width, one page) and re-render it after every pass - then NAME each
   illustration's skeleton aloud and check no two adjacent ones match (R17). **Render a rough pass
   early instead of solving the geometry analytically** - R3/R9 quote specific margins, which tempts a
   long arithmetic layout pass; a throwaway render answers in seconds what the arithmetic cannot. + the **R9 edge self-audit** (every adjacent edge pair =
   a clear gap OR a decisive overlap, never a near-parallel sliver - the member may not spot a sliver,
   so Illustra owns this). The DELIVERABLE is the transparent PNG(s), not the on-card composite, unless
   the member asks.
6. **Harvest.** Run the kit-governance scan; propose any reusable bespoke part.

## Composition rule index (R1-R16)
Apply during step 4. Each is a compressed directive; **full text + the failure each prevents is in
`references/style-guide.md` "Composition"** - consult it for the rule you're applying.

| R | Directive |
|---|---|
| R1 | Staggered cascade: offset both axes, vary sizes, overlap only at a corner (~20-30%) so each panel keeps its own shadow + corners - never a fused flush block. Exactly ONE primary; a satellite >~85% of the primary's width inverts the hierarchy. |
| R2 | Cut a screenshot crop on a whitespace gutter, never flush against a control or text. |
| R3 | Per panel pick ONE frame relationship: float in-frame (4 round corners + shadow) / bleed off an edge (drop radius AND border on the cut side) / middle-float. Containment guard: keep the full shadow inside the stage (~50px margin) OR bleed deep + fade - never a shallow sliver overhang. |
| R4 | A base panel that bleeds may fade toward the bleed edge (`mask-image: var(--mask-fade-*)`). |
| R5 | A white panel stacked on another white panel gets the `accent-stroke-ring` (host drops its own border); a panel on the lavender card alone gets soft shadow only, no ring. |
| R6 | Screenshot-only vs screenshot + vector overlay: offer both, render BOTH - don't silently pick. |
| R7 | No orphan satellites: every element overlaps or sits within ~30-40px of the cluster. Moving an element OFF a subject = re-dock it to its source/anchor, never set it adrift. |
| R8 | Content-safe cuts: MEASURE underlying text extents (PIL scan) before overlapping (>=20px clearance); the stage edge must not chop a control even under a fade mask. |
| R9 | No near-parallel rails: an edge must not run within ~20px parallel of any line beneath - clear it (>=20-25px) or cross decisively. SELF-AUDIT every adjacent edge pair, for EVERY visible element (decorative strips / gutters / rules / chips, not just panels), including each edge-vs-stage-edge; grow a sliver-short panel to bleed the edge. "Too close to the edge" = a negative-space complaint -> GROW THE STAGE, never nudge the element into its neighbour. |
| R10 | A screenshot needs a defined edge against the light card. No fade-mask -> `--panel-matte-ring` (white matte + slate line). Has a fade-mask -> a soft `border` `--panel-edge-soft`, NEVER the matte-ring (a mask clips box-shadow, erasing the ring). |
| R11 | Stat/outcome chip: EARN it, default NONE (omit if the screenshots already show the number or there's no clean spot). When earned, STRADDLE the host corner (~30-40px overhang) with a CONCRETE number ("Built in 30s") - never edge-flush, never a vague hedge. |
| R12 | A surface that demonstrates the feature (the prompt the merchant types, the generated copy) shows REAL representative text - not skeleton bars, no fabricated brand names. |
| R13 | Full-bleed host (no clean page gap): dock the overlay onto another panel's dead corner (UI-on-UI), don't pixel-hunt page negative space. A direction word names a DESTINATION, not a nudge size; on a directive-vs-geometry conflict, render the brackets (R6). |
| R14 | A concept surface and a real-UI surface differ by a palette/treatment split (both modes). Mode A: dummy/skeleton = translucent `--concept-panel` (~40%, NO shadow); real-UI sim = solid white `--inset-bg` + soft shadow. Co-equal peers depicting ONE idea sit side-by-side as a tight block; the proof/UI element overlaps it in the distinct treatment. |
| R15 | Wide-short strip: run the screenshots FULL-HEIGHT + fade the bottom (on a dark strip the shadow goes on an OUTER wrapper via `--drop-frame-dark`, since a mask clips box-shadow), grouped into ~2 overlapping clusters with a clear gap - never an evenly-spaced row over a dead band. |
| R16 | A too-rich capture: STACK a panel on the fuller screenshot so the key parts peek out - never crop it down to a single-label fragment. |
| R17 | A SET of illustrations must differ in COMPOSITION, not only content: adjacent cards may NOT share a skeleton (same side primary / same side satellite / same tag slots). Vary by mirroring the axis (mirror the panel's internal alignment too), inverting the hierarchy, or flipping the cascade direction. Gate 0 = concept distinct, intake rule 3 = visual language shared, R17 = composition distinct. |
| R18 | A chip / micro-label sitting ON a line (divider, fold rule, axis, connector) needs an OPAQUE background - a wash lets the rule run through the text. Use `color-mix(... var(--brand-accent) 11%, var(--inset-bg))`, don't lower alpha. |

**Sizing** (full in style-guide "Sizing"): author at logical px, render at 2x; crop the stage **tight**
to the content (a few px margin; bento-card illus run small, e.g. ~732x540, not 1200x900); **round
generously** (`--r-xround` panels, `--r-xxl` blocks) so corners don't read square at card scale.

## Hard rules
Full text in `references/style-guide.md` "Hard rules":
1. **Brand vars only** - `var(--...)`, never hardcode a color/radius/shadow.
2. **Screenshots pass through untouched** - `<img>`, framed, never AI-redrawn or recolored.
3. **Components carry their own surface** (the canvas is transparent).
4. **Compose, don't template** - pull kit parts in and adapt inline.
5. **Keep it HyperFrames-friendly** - clean semantic HTML.
6. **Keep the authored `.html` in `outputs/`** beside the PNG, so it stays re-editable.

## File map
| Path | Role |
|---|---|
| `references/brand.css` | Brand preset: Layer A identity (shared) + Mode A light + Mode B dark-glass. **Swap to rebrand.** Every token documented inline. |
| `references/style-guide.md` | Mode A/B visual language, the 3 intake rules, the full composition rules R1-R16, hard rules, sizing. |
| `references/component-catalog.md` | The kit index: Tier-A parts, asset-type classification, Tier-B backlog, drawn-parts log. |
| `components/*.html` | Self-contained vector "lego" snippets (`il-` prefixed). Copy into the canvas. |
| `templates/canvas.html` | Starting point: transparent `#stage`, brand.css + Poppins wired. |
| `scripts/render.mjs` | Playwright HTML -> retina PNG (`#stage` shot, `deviceScaleFactor 2`, transparent). |
| `outputs/` | Authored `.html` + rendered `.png` live here. |

## Kit governance - "suggest + approve"
After each illustration, scan the parts you drew against 3 criteria:
1. **Reusable** - a generic UI concept, not specific to this card's content.
2. **Self-contained & parameterizable** - stands alone, accepts text/color/size.
3. **On-brand & clean** - built on brand vars, tidy HTML.

All 3 -> **PROPOSE** promoting it to `components/` + a `component-catalog.md` drawn-parts-log row
(yes/no to the member). The member only approves; never auto-add. **Strong signal:** a part
hand-drawn a 2nd time almost always recurs -> promote. Log every new bespoke part so recurrence is
visible. Default gate = suggest + approve.
