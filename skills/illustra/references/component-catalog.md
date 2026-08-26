# Illustra Component Catalog

Reusable vector "lego" parts for PageFly marketing illustrations, mined from the Website-2024
Figma `illustration` frame (see `plans/260603-1022-illustra-skill/figma-refs.md`). Each is a
self-contained snippet in `components/<name>.html`: copy it into the canvas (`#stage`) and adapt inline.

## Hard contract (every snippet)
- **Brand vars only** - no hardcoded colors / radii / shadows (style-guide rule 1). Rebrand = swap brand.css.
- **Carries its own surface** if it needs contrast (rule 3). White "inset" parts use `--inset-*`; dark-glass parts use `--glass-*` / `--surface`.
- **`il-` class prefix** to avoid collisions when parts share a canvas.
- **Leading HTML comment**: name, tier, purpose, params, usage.

## Screenshot-vs-vector (asset-type) classification
Per style-guide intake rule 2, not everything is a vector part. Classify each part before drawing:
- **Vector OK** (primitives / overlays / concept / decoration): image-placeholder, drag-insert,
  cursor, selection-frame, screenshot-frame (the frame only), wireframe-page, concept-page-column,
  bento-grid, glow-orb, concentric-rings, badges/pills, status-tag, connectors, sparkle.
- **Screenshot-crop - do NOT vector-redraw** (distinctive Shopify/Polaris app screens):
  inspector-panel, code-editor. Build these from real screenshot crops composited in a floating
  panel; never draw the app UI in HTML.
- **Review (member call):** section-picker-card, content-card - screenshot-crop or vector?
Heuristic: "does this exist as a real, screenshot-able app screen?" Yes -> screenshot crop. No -> vector.
Mis-built vector app-UI parts are marked below (not deleted yet) - do not reuse them as vector.
**check-row-panel = a UI SIM, member-directed only.** It renders app-UI chrome in HTML, so it falls under
the exception below, not under "vector OK": use it when the member has explicitly approved a vector sim
(or the screen cannot be captured). Where a real capture exists, the read-out is a screenshot crop.
**Bugged / uncapturable real UI (member-directed exception):** when a real app screen can't yield a clean capture
(a bug shows it blank / with `--`, or it's pre-release), the member may direct a vector SIM of it - keep it solid
white + real labels + soft shadow so it still reads as UI (style-guide intake rule 2 exception). Not a default.

## Token-mapping note
Every token is documented inline in `brand.css`; pick by mode. The token GROUPS:
- **Mode A light-inset** (white floating UI on the lavender card): `--inset-*`, `--placeholder-*`,
  `--skeleton` / `-accent`, `--wire-block`, `--inset-shadow-soft` (light-on-light), `--glow-orb`.
- **Mode A concept sub-palette** (a dummy/skeleton mock that should BLEND): `--concept-panel`
  (translucent ~40%, **NO shadow**) / `-soft` / `-firm` / `--concept-edge`, bars `--concept-bar*`,
  `--concept-img`, `--concept-mint`. The 40%-translucent-concept vs 100%-solid-`--inset-bg`-UI split
  is the Mode-A "concept blends / real-UI pops" separator (style-guide Mode A + R14).
- **Mode B dark-glass**: `--surface*`, `--glass-*`, `--accent-*`, `--glow-*`, `--grad-canvas`.
- **Mode B marketing-dark** (REQUIRED for dark-site illustrations, not the generic `--accent-*`):
  `--mkdark-page` / `-plum` / `-nav-grad` / `-line` / `-bar` / `-dim` / `-mint` / `-purple` /
  `-mint-ink`; light badges `--chip-frost-*` / `-blush-*`; free-standing money badge `--chip-revenue-*`
  (see `revenue-chip`).
- **Composition tokens**: `--stroke-gradient` (R5 ring), `--mask-fade-bottom` / `-right` (R4),
  `--drop-frame-dark` (R15 dark-strip shadow on an outer wrapper). **R10 edge separation:** no-fade ->
  `--panel-matte-ring` (white matte + slate line, a box-shadow); has-fade -> `--panel-edge-soft` as a
  direct `border` (a fade-mask CLIPS the matte-ring box-shadow, so the masked panel must use a border).
- **Rounding:** `--r-xround` (28px panels), `--r-xxl` (blocks) so corners don't read square at card scale.

## Tier A (built - the website-illustration core)

### image-placeholder
- **Purpose:** atomic "image" token - gray rounded box + mountain/sun glyph.
- **Params:** size (inline w/h); `--placeholder-bg`, `--placeholder-glyph`.
- **Use when:** any image slot; building block of section-picker-card, wireframe-page, inspector thumbnail.
- **File:** components/image-placeholder.html

### bento-grid
- **Purpose:** the "page being built" - dark section blocks, one filled hero + empty slots.
- **Params:** add/remove `.il-bento__block`; `.is-hero` marks the filled block; width inline.
- **Use when:** the canvas/background layer of an editor illustration (overlay drag-insert + cursor).
- **File:** components/bento-grid.html

### drag-insert
- **Purpose:** drop indicator - green insert line + circular "+" handle.
- **Params:** width inline; handle centered.
- **Use when:** showing where a dragged section lands between bento blocks; pair with cursor.
- **File:** components/drag-insert.html

### cursor
- **Purpose:** UI cursor marks - arrow pointer + open-hand "grab".
- **Params:** `.il-cursor--grab` for the hand (use over light cards); position absolutely.
- **Use when:** near a drag-insert, or on a draggable section-picker-card.
- **File:** components/cursor.html

### section-picker-card
- **Classification: REVIEW** (member call - screenshot-crop or vector).
- **Purpose:** the signature PF "drag a section" white floating card (3 thumbs + skeleton bars + chevrons).
- **Params:** `.is-active` (green glow) / `.is-active--purple`; thumbs via `.il-picker__item`.
- **Use when:** the element a cursor drags onto the canvas. Composes image-placeholder.
- **File:** components/section-picker-card.html

### wireframe-page
- **Purpose:** light "page being built" preview - periwinkle skeleton bars + light-blue image blocks.
- **Params:** inner `.il-wire__bar` (text) / `.il-wire__img` (image block); width inline.
- **Use when:** the storefront / page result shown next to the editor.
- **File:** components/wireframe-page.html

### selection-frame
- **Purpose:** editor selection overlay - blue dashed border + label tag + corner handles.
- **Params:** label text; wrap any element (screenshot-frame / block) as a child.
- **Use when:** marking a screenshot as the selected / editable element.
- **File:** components/selection-frame.html

### screenshot-frame
- **Purpose:** rounded container for a REAL screenshot (passes through untouched - rule 2).
- **Params:** img src + alt; size inline; `--r` override.
- **Use when:** embedding a product / page capture; wrap with selection-frame to mark selected.
- **File:** components/screenshot-frame.html

### inspector-panel
- **Classification: SCREENSHOT-CROP - do NOT vector-redraw** (distinctive Polaris settings panel).
  Build from a real screenshot crop; the existing vector snippet is a layout reference only.
- **Purpose:** editor settings panel - the "customization" workhorse.
- **Sub-parts:** header, thumbnail + dropdown row, segmented-toggle (Yes/No), slider, segmented-chips (Original/Square/Custom), radio-list.
- **Params:** swap labels; reorder/remove rows; `.is-on` marks active segment/radio.
- **Use when:** the right-hand controls beside a selected element. Dark-glass surface.
- **File:** components/inspector-panel.html

### glow-orb
- **Purpose:** gradient glowing sphere - partner / stat hub; optional centered content.
- **Params:** size inline; swap center content (stat number / logo mark); `--glow-orb` tint.
- **Use when:** focal point of a "reach / partners / scale" illustration; pair with concentric-rings.
- **File:** components/glow-orb.html

### concentric-rings
- **Purpose:** radar / sonar arc rings around a focal point.
- **Params:** ring count (`.il-rings__r` with `--s` size %, `--o` opacity); container size inline.
- **Use when:** behind a glow-orb / logo-pin to imply reach & signal.
- **File:** components/concentric-rings.html

### floating-panel
- **Purpose:** the white rounded screenshot-frame that lifts a real app-UI crop off a light (Mode A) card - the Mode-A workhorse (drawn 3x in Page Checkup alone, was re-inlined every illustration).
- **Params:** width/height inline; `.bleed-bottom` / `.bleed-right` square a bled edge (R3b); inline `mask-image: var(--mask-fade-bottom|right)` fades a base layer toward its bleed edge (R4); `.il-matte` adds the white matte + visible outer hairline so a screenshot reads a defined edge on the light card instead of washing out (R10) - but ONLY on a panel with NO fade-mask: a mask clips the matte's box-shadow, so a masked panel uses a soft `border: var(--panel-edge-soft)` instead (R10b).
- **Use when:** any Mode-A composite of real screenshot crops; layer 2-3 in a staggered cascade - offset on both axes, vary sizes, overlap only at a corner (~20-30%) so each panel keeps its own shadow + corners (R1); never equal-size flush on a shared edge. Stacked on another white panel -> add `accent-stroke-ring` (R5).
- **File:** components/floating-panel.html

### accent-stroke-ring
- **Purpose:** R5 purple fade-to-transparent gradient border (`9D6CFF 100%` top -> `7476FF 0%` bottom, ~150deg) - separates a white panel stacked on another white panel without a heavy line; the bottom fade hands separation over to the soft shadow.
- **Params:** `--stroke-gradient`; ring thickness via `::after` padding (default 2.5px); inherits host border-radius. **Host must drop its own border (`border: none`)** - a 1px panel border shows as a white rim OUTSIDE the ring.
- **Use when:** a foreground floating-panel sits ON another white panel. NOT when it sits only on the lavender card bg (soft shadow there - R5). Pure-CSS mask-composite ring (HyperFrames-friendly).
- **File:** components/accent-stroke-ring.html

### metric-spark-chip
- **Purpose:** small white stat chip - muted label + pill (up-arrow + value) + brand-accent area sparkline trending up. The "metric improving" decoration (conversion rate, score, sales).
- **Params:** label text; pill value; sparkline path `d`; width inline (default 230px); `--brand-accent` / `--brand-accent-wash`.
- **Use when:** a decorative satellite beside a main panel (Mode A). Keep SMALL - decoration, never a rival of the primary (R1); bridge or sit close to the cluster (R7); edges must clear any divider/line beneath by >=20px (R9). On a white panel -> add `il-accent-stroke` (R5).
- **File:** components/metric-spark-chip.html

### scan-overlay
- **Purpose:** "scan in progress" motif - tinted veil over the already-scanned region + glowing beam at the scan front.
- **Params:** `--scan-y` inline (beam y from top); colors ride `--mkdark-line` / `--mkdark-mint` / `--mkdark-purple`.
- **Use when:** any AI-scanning story. Drop INSIDE the scanned surface (host = `relative` + `overflow:hidden`); anchor a frost-chip at the beam y so the label reads as the scan front.
- **File:** components/scan-overlay.html

### frost-chip
- **Purpose:** light "frost" status pill on a dark marketing page - the SSE-151 badge language ("26.8% CR" / "Page Checkup is scanning..."). Icon tile + short label.
- **Params:** label; optional icon tile (gradient `--mkdark-line` -> `--mkdark-purple`); `--chip-frost-*` colors.
- **Use when:** flagging status on a dark-site illustration (scanning, winner, CR stat). Status flag anchored to what it flags - never free-floating decoration. R1 small, R9 edge clearance.
- **File:** components/frost-chip.html

### tablet-frame
- **Purpose:** tablet device shell holding a skeleton page / screen content on the dark marketing site - compact page when a screenshot panel must stay primary.
- **Params:** width/height inline (370x540 portrait default); children go in `__screen` (relative + clipped, bg `--mkdark-page`).
- **Use when:** the vector page is the satellite (<=~85% of primary width, R1). Float fully in-frame - a device cut by the stage edge reads amputated (R3 guard).
- **File:** components/tablet-frame.html

### ai-prompt-panel
- **Purpose:** white in-app "describe -> generate" prompt card (the AI Smart Page input) - gradient AI tile + title, field label, a textarea with the REAL prompt the merchant types, and a mint action button. The config/INPUT half of a dark-marketing dual-view.
- **Params:** title; field label; prompt text (REAL copy, NOT skeleton bars - R12; no fabricated brand names); button label; width/height inline (332x296). AI tile `--mkdark-line` -> `--mkdark-purple`; button `--mkdark-mint` + `--mkdark-mint-ink` text (swap `--brand-accent` / `--text-100` for a Mode-A card).
- **Use when:** the SATELLITE config side of a dual-view dark-marketing card (pairs with generating-block / a built page). Keep <=~85% of the output primary's width (R1); overlap it at a corner (R1/R7). Distinct from widget-settings-panel (sliders/dropdowns) - this is a describe->generate input.
- **File:** components/ai-prompt-panel.html

### generating-block
- **Purpose:** a storefront section being generated by AI right now - the "build in progress" moment. Glow-mint border + assembly beam on the top edge + forming image tile + copy lines being written (last with a typing cursor). The OUTPUT/build half of a dual-view.
- **Params:** width/height inline (424x134); bright top line MAY hold real generated copy (R12); colors ride `--mkdark-*`. Drop INSIDE a dark built-page (`relative` + `overflow:hidden`), as the LAST/newest section below solid ones.
- **Use when:** the BUILD moment of an "AI builds the page" card - solid sections above, this one forming. Differs from scan-overlay (REVEALS a static page; this ASSEMBLES one section). Anchor a "Writing your copy..." frost-chip at its top edge (R11).
- **File:** components/generating-block.html

### revenue-chip
- **Purpose:** green "revenue glow" value badge that POPS standalone on a dark hero/section - the money/growth metric callout ("+26.8% revenue", "+$682K"). Up-arrow + bold value + unit label. The FREE-STANDING focal-stat sibling of frost-chip (anchored light status pill) / blush-chip (B-variant).
- **Params:** value (bold) + label (unit, droppable for a number-only money badge); optional leading up-arrow; `--chip-revenue-grad` / `-border` / `-text` / `-glow`; radius `--r-lg`.
- **Use when:** ONE headline outcome metric floating on a DARK illustration (revenue / sales / conversion uplift). Keep it the single brightest accent so it stays the focal stat (R1); give the halo ~40px clearance from the stage edge or it clips (R8). LIGHT Mode-A card -> use frost-chip + soft shadow instead (the green glow is a dark-bg device).
- **File:** components/revenue-chip.html

### check-row-panel
- **Purpose:** the white "audit result" panel - title + count badge, then N rows of
  [status glyph | label | right-hand value]. Turns "an illustration of a page" into "an illustration
  of the page BEING CHECKED"; the Mode-A read-out workhorse.
- **Params:** title; header count (drop the `<span>` if nothing to count); rows via `.il-crp__row`;
  width/height inline (~330x236 on a 720 stage, ~268x196 on a 580 one); glyph `--ok` / `--warn`;
  `.is-warn` tints the value amber.
- **Use when:** the REAL-UI half of a Mode-A card - solid white + soft shadow so it POPS against a
  translucent `concept-page-column`. Keep <=~85% of the primary's width (R1); cross the concept page
  DECISIVELY, never landing ~10px off an image block's edge (R9). Values stay CONCRETE (R11/R12).
- **File:** components/check-row-panel.html

### status-tag
- **Purpose:** small white status pill that STRADDLES a host panel's edge - glyph + one short line.
  The light-card sibling of `frost-chip`; the Mode-A annotation workhorse (names WHAT was found and
  pins it to WHERE).
- **Params:** label (nowrap); leading svg glyph (tick / bang / eye / sparkle) or a `__swatch` colour
  dot; position by `left`/`top` OR `right`/`top` (use `right` in a mirrored composition - R11/R17).
- **Use when:** flagging a finding on a Mode-A illustration. Straddle the host edge ~30-40px (R11);
  stagger multiple tags on both axes, never a straight column (R1); >=30px from panel edges above and
  below (R9) and >=~25px off every stage edge so the shadow is not clipped (R3).
- **File:** components/status-tag.html

### concept-page-column
- **Purpose:** the TRANSLUCENT storefront/page column that is the SUBJECT of a Mode-A audit or preview
  card - nav, hero, heading + copy bars, product row (image / price / buy button), closing block,
  running off the bottom edge. The surface everything else annotates.
- **Params:** width/height inline (overshoot the stage by 50-80px so the bleed is deliberate - R3);
  bars `.il-cpc__b` + `.d` / `.s` / `.k` / `.f`; image blocks `.il-cpc__im`; real copy via the
  `.copy*` weights (R12). Mirrored variant: `.is-mirrored` + inline `padding-left` + `.il-cpc__bleed`
  on the chrome (R17).
- **Use when:** any Mode-A "this page is being checked / previewed" card. Stays translucent with **NO
  shadow** so it recedes while the white UI panel pops (the Mode-A concept-vs-UI split); a shadow here
  collapses that read. Keep must-read content >=20px clear of any overlay (R8). Dark page ->
  `tablet-frame` instead.
- **File:** components/concept-page-column.html

## Tier B backlog (build on demand - YAGNI until a card needs it)
logo-grid, logo-pin, code-editor, swatch-row, dotted-world-map, testimonial-bubble, content-card,
device-frame-mobile, analytics-chart, countdown-timer, font-specimen, stat-badge.
(Reference nodes mapped in figma-refs.md "Per-part Figma nodes".)
**Asset-type (intake rule 2):** code-editor = SCREENSHOT-CROP when built (do NOT vector-redraw);
content-card = review.

## Drawn-parts log (Phase 5 governance - a 2nd draw = promotion signal)
| part | seeded in (illustrations) | drawn again? | notes |
|---|---|---|---|
| image-placeholder | simple&intuitive, drag-drop, +many | (seed) | atomic; reused inside picker/wireframe/inspector |
| section-picker-card | simple&intuitive, drag-drop | (seed ×2) | strong reuse - promoted to Tier A |
| inspector-panel | powerful-custom, metafields | (seed ×2) | strong reuse - promoted to Tier A |
| cursor | simple&intuitive, drag-drop | (seed ×2) | arrow + grab |
| glow-orb | our-partners, 100+collab | (seed ×2) | with/without centered stat |
| concentric-rings | our-partners, 100+collab | (seed) | sonar arcs |
| bento-grid | simple&intuitive | (seed) | dark section layout |
| drag-insert | simple&intuitive | (seed) | green line + "+" |
| wireframe-page | drag-drop | (seed) | light skeleton page |
| selection-frame | powerful-custom | (seed) | dashed + label tag |
| screenshot-frame | powerful-custom | (seed) | real `<img>` container |
| score-gauge | page-checkup v1/v2 (vector) | superseded | v3 switched to real-UI **screenshot crops** (pc-scorecard.png) per intake rule 2 -> the vector gauge is a layout ref only, **NOT promoted** (real app UI is never vector-redrawn) |
| fix-row | page-checkup v1/v2 (vector) | superseded | = phase-04 "prescription-card". v3 = screenshot crop (pc-hero/pc-faq.png). **NOT promoted** - real Page Checkup UI is a screenshot, not vector |
| ai-badge | page-checkup v1/v2 (vector) | superseded | gradient pill + sparkle "AI" marker; lives inside the real UI now captured as a crop. **NOT promoted** as a vector part |
| floating-panel | page-checkup (×3) | promoted -> Tier A | white rounded screenshot-frame for Mode-A real-UI crops; was re-inlined every illustration. Host for R1 overlap / R3 edge / R4 fade |
| accent-stroke-ring | page-checkup | promoted -> Tier A | R5 mask-composite ring; v4 spec: purple fade-to-transparent (9D6CFF -> 7476FF@0, ~150deg), 2.5px, host `border:none` |
| metric-spark-chip | page-checkup v4 | promoted -> Tier A | member-approved; generic "metric improving" deco chip (label + pill + rising sparkline), born replacing the orphan FAQ card |
| scan-overlay | anima heatmap-reveal, diagnose-fix | promoted -> Tier A | 2nd draw of the scan motif (animated, then static); veil + beam, `--scan-y` param |
| frost-chip | diagnose-fix | promoted -> Tier A | member-approved; SSE-151 light badge on dark page; supersedes the dark glow-pill draft of the same badge |
| tablet-frame | diagnose-fix | promoted -> Tier A | member-approved; compact device shell so the screenshot panel stays primary |
| tooltip-callout | drag-drop-hero | no | white bubble + diamond tail; vector annotation re-stating a real UI tooltip, anchored above a dragged element; text param. Promotion proposed (pending member) |
| language-menu | localize-ai-translator | no | white dropdown: flag-dot rows + active check + count; the "pick any language, one click" localization device. Reusable candidate - hold (member) |
| language-switcher | localize-ai-translator | no | glass pill on a dark page nav: globe + active-lang + caret. Sibling of switcher-style controls; hold |
| widget-settings-panel | smart-cart-recover | no | WHITE in-app config (title field / dropdown / slider+value-pill / discount). **Coming-soon vector ONLY** - do NOT promote / reuse for REAL settings UI (that is a screenshot crop, see inspector-panel); vector was allowed here only because Smart Cart has no screenshot-able screen yet |
| cart-drawer | smart-cart-recover | no | DARK live-storefront cart: line item + "You May Also Like" AI cross-sell + ADD + strike price + checkout. Content-specific; hold |
| ai-prompt-panel | launch-pages-faster | promoted -> Tier A | member-approved; WHITE AI describe->generate input (tile+title / field label / REAL-text textarea / mint generate btn). Born the dual-view INPUT half; distinct from widget-settings-panel (config sliders). Carries R12 (real prompt text, not skeleton bars). Added `--mkdark-mint-ink` token for the mint-button text |
| generating-block | launch-pages-faster | promoted -> Tier A | member-approved; DARK "section building now" (glow border + top assembly beam + forming img + copy lines + typing cursor). The build-MOMENT counterpart to scan-overlay (reveal); pairs with ai-prompt-panel as the OUTPUT half |
| concept-device-viewport | loads-fast (desktop + phone) | no | TRANSLUCENT skeleton "page across devices" panel (`--concept-panel`, no shadow -> blends; periwinkle `--concept-*` bars). Two drawn (desktop landscape + phone portrait) but as ONE peer concept block (R14). Reusable Mode-A "responsive page" device candidate - hold (member); the Mode-A light counterpart to the dark-only tablet-frame |
| core-web-vitals-card | loads-fast | no | WHITE UI-sim: Mobile/Desktop toggle + half-arc perf gauge + score + "Loads in 0.6s". Member-directed vector sim of a BUGGED real screen (intake rule 2 exception); solid white + soft shadow so it pops as UI. Promotion PROPOSED (pending member) as a generic perf/score gauge card - note prior `score-gauge` was NOT promoted (real UI = screenshot); this differs as an explicit sim for an uncapturable screen |
| revenue-chip | drag-drop-hero | promoted -> Tier A | member-approved; green money/growth glow badge for a STANDALONE headline metric on dark (sibling of frost-chip / blush-chip). Added `--chip-revenue-*` tokens (grad / border / text / glow). Distinct from frost-chip (anchored status pill) - this FREE-FLOATS as the focal stat; light-bg counterpart = frost-chip |
| check-row-panel | page-audit set: structure, shopper-sees, unfinished (x3) | promoted -> Tier A | member-approved; white title + count + glyph/label/value rows. Born as the "what the check found" read-out; the UI half of the Mode-A concept-vs-UI split |
| status-tag | page-audit set, all 4 page cards (x8) | promoted -> Tier A | member-approved; light-card sibling of frost-chip. Straddling annotation pill; supports `right:` anchoring for a mirrored composition (R17) |
| concept-page-column | page-audit set, all 5 cards (x5) | promoted -> Tier A | member-approved; translucent bleeding page column, the SUBJECT surface of a Mode-A audit card. Carries the `.is-mirrored` + `.il-cpc__bleed` variant so a mirrored twin card keeps its copy clear of the overlay |
| scroll-depth-gutter | page-audit: visitor-behavior | no | vertical red->cold gradient rail docked to a page's left edge = how far visitors scroll; pairs with a dashed drop-off rule at the cold transition. Reusable "engagement over page depth" candidate - hold (member) |
| benchmark-distribution | page-audit: industry-benchmark | no | histogram of comparable stores + dashed median line + one bar highlighted as "this page"; bar index and line position must AGREE with the axis they claim. Hold |
| funnel-bars | page-audit: visitor-behavior | no | label + count + proportional progress bar, 3 stages narrowing to the goal. Close cousin of check-row-panel's row (same panel chrome, bar instead of glyph) - if drawn again, consider a `check-row-panel` variant rather than a new part. Hold |
| ghost-section | page-audit: unfinished-content | no | dashed outline block with a centred "Section N - untouched" label, top-aligned so the label survives a bottom bleed (R8). Hold |
> Add a row each time a NEW bespoke part is drawn in an illustration; a 3rd appearance = promote to a kit file.

**Phase 6 smoke test (simple & intuitive):** rebuilt end-to-end from `bento-grid` + `drag-insert` +
`cursor` + `section-picker-card` (-> `image-placeholder`). No new bespoke part drawn -> governance
proposed nothing; kit sufficed for this card. Output: `outputs/simple-intuitive-illustration.{html,png}`.
