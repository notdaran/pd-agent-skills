# Illustra Style Guide

## What an Illustra illustration is
The art *inside* one bento/App-Store card: real product screenshots blended with
hand-drawn vector UI mockups (editor panels, selection frames, score rings, A/B cards,
analytics charts, drag-insert lines). One illustration per invocation.

## Visual language - two modes
The mode is chosen at intake (rule 1), driven by where the illustration will live. Each mode uses
its own token subset from `references/brand.css`.

### Mode A - light website-card (PF marketing feature cards)
Lavender/light card bg, white floating panels, muted, soft shadow, Polaris-soft. **The default for
the PF marketing website feature cards.**
- **Surfaces:** light card bg (`--grad-hero-light`, preview/card only); white floating panels
  (`--inset-bg` / `--inset-bg-2`) with `--inset-border` + soft `--inset-shadow-soft`.
- **Text:** `--inset-text-strong` / `--inset-text` / `--inset-text-soft`.
- **Vector primitives:** `--skeleton` / `--skeleton-accent`, `--wire-block`, `--placeholder-bg` /
  `--placeholder-glyph`.
- **Accents VERY sparing:** green = positive / Live, blue = link, periwinkle/purple = selection / AI.
- **Real app UI = screenshot crops** (intake rule 2), never vector-redrawn.
- **Concept-illus vs UI-sim - the translucent-blend / solid-pop split (the Mode-A separator).** A
  dummy / skeleton / wireframe mock (a "page being built", a device viewport, abstract blocks) is
  CONCEPT art: draw its panel TRANSLUCENT (`--concept-panel`, white ~40%, **NO shadow**) so it
  RECEDES into the lavender card - the periwinkle bars (`--concept-bar` / `-2` / `-faint` / `-strong`
  / `-deep`, image block `--concept-img`, mint `--concept-mint`) carry the shape. A mock that
  simulates REAL in-app UI (a settings / score / perf panel) stays SOLID white (`--inset-bg`) with a
  **soft** shadow (`--inset-shadow-soft`, never the strong `--inset-shadow`) so it POPS forward. On
  one card that mixes both, this 40%-vs-100% + no-shadow-vs-soft-shadow contrast is exactly what
  tells "what's the illustration" from "what's the UI" (the failure: every panel solid white with a
  shadow -> member couldn't tell UI from illus, "ko tách bạch đc cnao là UI cnao là illus"). Skeleton
  / concept panels NEVER carry a shadow.
  - **Scope: the translucent-40% panel is MODE-A (light) ONLY.** Mode B keeps its existing pattern -
    concept = `--mkdark-*` skeleton bars on its own dark surface, and the real-UI side is usually a
    REAL app screenshot (member: "UI t dùng luôn screenshot từ app"), not a white panel. What carries
    across BOTH modes is the *principle*: a concept/dummy surface and a real-UI surface must be told
    apart by a deliberate palette/treatment split, never rendered the same.

### Mode B - dark-glass (App Store screenshots)
Dark navy, glass, glow.
- **Surfaces:** `--bg-page`, `--surface` / `--surface-2` / `--surface-deep`, glass panels
  (`--glass-*` + `backdrop-filter: blur(8px)`), `--grad-canvas`. Large soft shadows (`--shadow-lg`).
- **Semantic accents, sparing:** `--accent-*` - blue=primary/links, green=success/winner,
  red/orange/yellow=severity, purple=AI, cyan=highlight, peach=decorative glow.
- **Glow, not flat:** elements lift with `--glow-*`; AI/score elements get gradient fills.
- **Marketing-dark sub-palette (dark website cards) - REQUIRED there.** Illustrations living on the
  DARK marketing site (SSE-151 CRO landing, "The AI That Does the CRO Work For You" section) draw
  their vector pages/UI from the `--mkdark-*` group (member-directed; sampled from Figma node
  289:2701, the A/B card art), NOT the generic `--accent-*` set: page bg `--mkdark-page`
  (`--mkdark-page-plum` alt), nav `--mkdark-nav-grad`, skeleton bars `--mkdark-bar` / `-dim`,
  line/squiggle/glyph `--mkdark-line`, positive/CTA `--mkdark-mint`, feature highlight
  `--mkdark-purple`. Badges on these pages are light **frost chips** (`--chip-frost-*`, the
  "26.8% CR" language - light pill, dark text), NOT dark glow-pills.
  - **Dual-view palette roles (config -> output) - member-confirmed pattern.** When ONE dark-card
    illustration shows BOTH an **in-app config/settings** surface AND a **live storefront/output**
    surface (Smart Cart = Cross-sell Widget settings + the shopper's cart drawer; AI Translator =
    translate menu/settings + the translated page), split the palette by SEMANTIC ROLE - do NOT tone
    both the same: **in-app config/settings = light/white** (`--inset-*`, Polaris), **live
    storefront/output = dark** (`--mkdark-*`). The light/dark contrast IS the "configure in the app
    -> the shopper sees it live" metaphor, and it mirrors the diagnose-fix card (white Page Checkup
    panel + dark tablet page). Frost chips / badges still sit on the DARK surfaces (low contrast on
    the white panel).

### Shared (both modes)
- **Rounded:** `--r-xl` / `--r-xxl` for cards, `--r-pill` for chips/badges.
- **Poppins:** `--fw-medium` for labels, `--fw-bold` for numbers/headlines,
  `--fw-extralight` / `--fw-regular` for body.

## Composition - layering, overlap & edges
How the floating panels relate to each other and to the card frame. A cluster must read as
**distinct layers cascading in depth - never a fused block of equal tiles.** (These came from
matching the live PF marketing feature cards.)

- **R1 - Staggered cascade (distinct layers, never a fused block).** When 2+ panels cluster, they
  must read as separate cards stacked in depth, not one segmented slab. The failure to avoid: two
  panels the same width, edge-aligned, butted flush - they fuse into "one weird block split by a
  line."
  - **Offset on BOTH axes.** Each panel steps down AND across from the one beneath (roughly
    30-60px each way), like cascading windows. **Never share a full edge** - equal width + same left
    (or same top) fuses them; forbidden.
  - **Vary the size.** Stacked panels must differ in width/height. Equal-size + edge-aligned is the
    "one block" failure.
  - **Overlap at a corner, not flush.** Panels overlap by a **corner / partial region (~20-30%)** so
    each panel's outer corners + its **own soft shadow** stay visible. That shadow gap between layers
    is what reads as depth; a full-width flush stack hides every edge -> one card with a divider.
  - **Connected, not floating-loose.** Still overlap enough to relate (the old "panel floating in
    mid-air, near but not touching" mistake stays banned) - but connection = a corner overlap with
    visible depth, NOT fusing along a shared edge.
  - **Small accents keep breathing room from each other.** When several small elements sit on one
    main panel (badges, chips, mini-cards, chat bubbles), stagger them with a visible gap/offset
    *between each other* - never jam them edge-to-edge in a straight line.
  - **One PRIMARY, small satellites.** The cluster has exactly ONE dominant element; every other
    panel must be unmistakably subordinate. A secondary at >~85% of the primary's width reads as a
    rival, not a satellite (the failure: a 568px fix card next to a 468px scorecard - hierarchy
    inverted). Decoration chips stay far smaller still. Three distinct sizes also feed the
    stagger-vary rule above.
- **R2 - Crop breathing room.** When a screenshot crop ends inside the card, cut it on a **whitespace
  gutter** (the UI's own inner padding), never flush against a button, input, or line of text. The
  crop edge should look like the panel's natural bottom padding, not an amputation. If the only clean
  cut sits tight under a control, include a sliver of the padding below it.
- **R3 - Edge treatment (pick ONE relationship to the frame per panel).**
  - **(a) Float in-frame** - all 4 corners rounded + soft shadow (`--inset-shadow-soft`); the panel
    sits wholly inside the card.
  - **(b) Bleed off an edge** - the panel runs past the card edge; **drop the border-radius AND the
    border on the cut side** (square corners via `.bleed-bottom` / `.bleed-right`; plus
    `border-bottom: none` etc.) so it reads as *continuing past the frame*, not a rounded card
    awkwardly clipped. A border line drawn ON the edge that touches the stage / the card's bottom
    padding reads as the card STOPPING there, which kills the continues-past illusion (member: "đã
    chạm padding đáy thì ko border"). A bled side = no radius AND no border; content must end above
    the cut with a little breathing room.
  - **(c) Middle-float** - no fade, no cut; only when the cluster is already clean (no awkward gaps).
  - **Containment guard (no accidental clip).** A panel that is NOT a deliberate bleed must sit
    wholly inside the stage **including its shadow spread** - keep a safe margin equal to the shadow
    blur (~50px) off every stage edge. A panel that overhangs the frame by only a sliver (~10-20px)
    has its outer shadow + corners clipped by the stage `overflow:hidden`, so it looks **flatly
    amputated, not bled**. Choose ONE: fully in-frame (full shadow + radius) OR a **deep, intentional
    bleed** with squared corners (R3b) + fade (R4). Never a shallow accidental overhang.
- **R4 - Base-layer fade.** A base panel that bleeds off-frame, or sits behind foreground accents,
  MAY fade to transparent toward its bleed edge (`mask-image: var(--mask-fade-bottom)` /
  `var(--mask-fade-right)`), so the small overlaid panels pop and the bleed doesn't end in a hard
  rectangle of unrelated UI.
- **R5 - Gradient stroke on stacked accents.** A foreground panel sitting **on top of another white
  panel** gets the accent ring (`--stroke-gradient`, via the `accent-stroke-ring` part): purple
  **full-alpha at the top fading to FULLY transparent at the bottom** (`9D6CFF 100% -> 7476FF 0%`,
  ~150deg), **~2.5px** thick - the fade-out is what keeps it light/natural (a stroke that stays
  semi-transparent all the way around reads as a washed-out box instead). **The host panel must drop
  its own border (`border: none`)**: the ring's `::after` is laid against the padding box, so any
  1px panel border shows as a white rim OUTSIDE the purple ring. A panel sitting only on the
  lavender card background relies on its soft shadow - **no stroke** (a stroke there would read heavy).
- **R7 - Cluster cohesion (no orphan islands).** Every panel and deco element must visibly belong
  to the cluster: overlap a neighbor at a corner, or sit within ~30-40px of one. An element parked
  in empty canvas far from the group reads as a separate illustration, not a satellite (the failure:
  a stat chip floating ~180px right of everything - instantly flagged as detached from the whole).
  - **Move-off = re-dock to the anchor, never set adrift.** When asked to move an element off a focal
    subject ("the dragged card covers the product"), relocate it ONTO its semantic anchor - the surface
    it belongs to (the panel it is dragged from; the host it badges) - not into the nearest empty gap.
    "Uncover X" and "stay cohesive" resolve TOGETHER by docking to the source: park the element on the
    source panel's low-value dead corner so it clears X while still reading as one unit with its origin.
    The failure: to clear the product, the dragged card was dropped into open page space - product
    cleared, but the card orphaned from its panel and the drag story broke; the fix was to dock it onto
    the panel's bottom-left corner (see R13).
- **R8 - Content-safe cuts (measure, don't eyeball).** No cut may slice through the middle of
  visible UI content:
  - **Frame edge:** a panel may bleed past the stage only where its fade (R4) has already reached
    ~zero opacity, or where the cropped region is whitespace. A fade mask does NOT license chopping
    a button or text mid-body (the failure: enlarging the scorecard until the stage edge chopped the
    Re-run button at half opacity). Size the panel so content ends before the cut.
  - **Panel overlap:** before a panel covers a screenshot beneath it, MEASURE the underlying
    text/content extents (PIL pixel scan of the asset - rightmost/bottom non-white px per band) and
    keep **>=20px clearance**; overlap only true whitespace. Eyeballing finds out after the render.
- **R9 - Edge-line clearance (no near-parallel rails).** An overlapping panel's edge must not run
  near-parallel within **~20px** of any line in the screenshot beneath it (dividers, box edges,
  card edges) - two almost-coincident lines read as a misregistered double-rail (the failure: a chip
  bottom landing 2px from the scorecard's divider). Either clear the line by >=20-25px or cross it
  decisively mid-band. Check ALL 4 edges of every overlapping panel - and the same logic applies
  between two panel edges (e.g. a chip top edge hovering 10px below the stage-top of another card).
  - **Run it as a dedicated self-audit before done - do NOT wait to be told.** This sliver / double-rail
    defect is easy to miss and a non-designer member usually will NOT spot it or have a word for it, so
    Illustra must catch it itself. After the layout is placed, walk EVERY pair of adjacent edges - panel
    / panel, panel / hero (background screenshot), dragged-element / panel, chip / host, and any panel
    edge vs a line inside the screenshot beneath - and classify each pair as exactly ONE of: a clear gap
    (>=20-25px) OR a decisive overlap / cross (mid-band). Anything in between - a thin near-parallel
    sliver, two edges almost-but-not-quite aligned, a hairline strip of canvas between elements that
    look like they should touch - IS the defect; fix by pushing to a decisive overlap or opening a clear
    gap. The recurring trap: fixing the one boundary that got flagged while the same defect still sits
    on another pair (it surfaced first at card / panel, then again at panel / hero).
  - **Walk EVERY visible element, not just panels.** The pairs include decorative strips, gutters,
    rules, chips, glyph blocks - anything with a straight edge. A 10px gap between a decorative bar
    and the stage edge is the SAME defect as a panel doing it (the failure: the scroll-depth gutter
    parked 8px off the stage's left edge - member: "thanh nhiệt bên trái đang bị sát viền quá").
    Auditing only the big panels is how this slips through a pass that otherwise ran.
  - **The stage edge is a rail too -> reach it or clear it.** Include "every panel edge vs each stage /
    strip edge" in the walk. A floating panel whose edge lands a thin sliver (~5-15px) SHORT of the
    stage edge pairs the panel edge with the strip edge as an almost-touching double-rail (member: the
    funnel "too close to the bottom... 2 lines almost touch"). Resolve it identically: either pull back
    to a clear margin (the R3 ~50px containment), or push the panel to **reach / bleed off** that edge -
    extend it past the stage so the bled side squares its corners (R3b) and, if it is a base layer,
    fades (R4). A panel that naturally settles a few px from an edge should be GROWN to bleed it, never
    left hovering a hairline away.
  - **"Too close to the edge" is a NEGATIVE-SPACE complaint, not only a rail one -> grow the stage.**
    A member reporting an element "sát viền quá" is asking for breathing room on that side, so the fix
    is to WIDEN the stage and shift the cluster inward - never to nudge the element sideways into its
    neighbour (that just trades an edge defect for an overlap defect). Growing the stage a few percent
    is cheap; the illustration is placed at a set display width anyway.
- **R10 - Screenshot/background separation (no washed-out edges).** A screenshot panel must read as
  lifted off the card with a **defined edge**, never blended into it. The danger case: a screenshot
  sitting on the lavender card whose edge melts into the bg so the whole thing looks washed out
  ("loè loè"). Two failure modes, both real:
  - The lavender is a *light* periwinkle, so the default 1px `--inset-border` (slate at 0.08) is far
    too faint - it disappears against the card.
  - A **white matte alone is NOT a fix** where the screenshot's own edge pixels are white (a white
    chat/editor panel): white-on-white is invisible, so the edge still has no line.
  The separator method depends on whether the panel carries a fade-mask (R4 bleed):
  - **No fade-mask -> `--panel-matte-ring` (box-shadow).** A `box-shadow` of a ~3px white matte
    (breathing room on gray/coloured edges) + a ~2px frame line at its outer edge (slate at ~0.5),
    layered BEFORE `--inset-shadow-soft`. The white matte buffers the screenshot from the line, so
    the line can be a dark 0.5 without looking heavy. The soft shadow alone can't carry separation
    (almost no left/right-edge definition, and it gets clipped near a stage edge) - the line must.
  - **Has a fade-mask (R4) -> a soft `border`, NEVER the matte-ring.** A CSS `mask-image` clips any
    `box-shadow`: the mask's coverage area is the border-box, and the matte-ring's rings sit OUTSIDE
    the border-box, so the mask erases the ENTIRE ring - it never renders. (This silently ate several
    iterations: "có viền đâu".) Use a real `border` instead - it lives ON the border-box edge, inside
    mask coverage, so it stays solid on the top + sides and dissolves at the bottom with the
    screenshot. Because a direct border has NO white matte buffer (it sits right on the screenshot
    edge), it must be FAR softer than the 0.5 matte-ring line - 0.5 as a direct border reads as a
    heavy black frame ("đen sì"). Use `--panel-edge-soft` (slate ~0.2, ~1.5px): just darker than the
    lavender card, separates without a hard frame.
  (A panel stacked on another white panel uses the R5 accent-stroke-ring instead; R10 is for a
  screenshot on the card background.)
- **R11 - Stat/outcome chip: straddle the corner, carry a concrete value.** The family's outcome
  badge (the "+21% AOV" / "26.8% CR" / "Health Score 55" / "Built in 30s" pill) is a *status flag on
  its host*, so:
  - **Earn the chip - default to NONE.** A stat/outcome chip is optional garnish, not a required
    element. Add one ONLY when it surfaces a headline number that is NOT already legible in the
    screenshots AND there is clean space for it to straddle a corner. If the real captures already show
    the figures (a conversion funnel showing its stage %s, a dashboard showing the rate) or the strip
    is full with nowhere clean for the chip to sit, OMIT it - a redundant glowing chip competes with
    the art, reads poorly on a busy dark strip, and messes up the layout (member removed BOTH the
    "+21% CR" and "+$5.9K/week" chips for exactly this). When the screenshots ARE the proof (R12), let
    them carry it; do not staple on a number they already display.
  - **Straddle, don't edge-align.** Anchor it OVERHANGING the host panel's corner (~30-40px past the
    edge - anchor by the overhanging side, e.g. `right:` so it's text-width-independent) so the panel
    edge passes THROUGH the chip. A chip whose own edge sits flush-aligned with the host's edge reads
    as an accidental mis-registration, not a deliberate badge (the failure: "Built in seconds"
    right-edge lined up dead-flush with the page's right edge - member: "sát mé align thẳng").
  - **Concrete value, not a vague hedge.** Use a specific number in the family's numeric language
    ("Built in 30s", not "Built in seconds") - a qualitative phrase reads weaker and off-family. If
    you lack the real figure, render a believable placeholder AND flag it for the member to confirm;
    never ship a vague phrase just to avoid "fabricating" (the family's chips are ALL concrete numbers).
- **R12 - Real content where the demo IS the content (not skeleton bars).** Skeleton bars are for
  PERIPHERAL chrome (nav dots, side bars, footer). The surface that *demonstrates the feature* - the
  input it consumes (a prompt / description the merchant types) or the output it produces (a generated
  hero headline / body copy) - must show REAL representative text, because that text IS the proof.
  Dummy bars exactly where the member looks to read the feature dilute it (member: "nhìn dummy quá";
  the localize card already did this right with real "春の大セール" hero copy). Keep it believable and
  generic - **no fabricated brand names / facts** (use a plausible product, e.g. "Insulated stainless
  steel water bottle, 24 oz."). Pair a typing caret with the active line so it reads as "being written".
- **R13 - Floating overlay on a full-bleed host: dock to a panel's dead corner, don't hunt for page
  negative space.** When the destination element is a **full-bleed product / page screenshot** (a hero
  mockup that fills its frame edge-to-edge), there is **no clean empty area on the page** to float an
  overlay (a dragged element, a callout + cursor cluster, a badge): every apparent "gap" is actually
  over the product or over live UI text. Do NOT pixel-hunt for negative space that does not exist (the
  failure: 3 wasted passes trying to fit a dragged "1/2" layout card into the slivers between the title,
  the product, and the chat input). Instead **anchor the overlay onto the low-value DEAD CORNER of
  another floating panel** in the scene (e.g. the Elements panel's bottom-left corner) - a deliberate
  UI-on-UI overlap. One move satisfies three rules at once: it clears the product (the overlay sits on
  the panel, not the page), it keeps cohesion (R7 - the overlay touches its source), and it removes the
  boundary sliver (R9 - a decisive overlap, not a near-touch). A panel's dead corners (an empty
  list-tail, an unused header margin) carry no content, so overlapping them genuinely "covers nothing".
  - **A direction word names a DESTINATION, not a nudge size.** "Move it down and left" + a stated
    reason ("it covers the product") means *send it to the spot that satisfies that reason*, not shift
    it a few px in that direction. If a small nudge cannot satisfy the reason (the product is
    dead-center, so any small move still covers it), the move is large - read the directive as "go to
    <the landmark that resolves the reason>" and let the geometry (which surface is clean) pick the
    landmark. Re-nudging around the origin burns the member's review cycles.
  - **Directive vs geometry conflict -> render the brackets early (R6).** When the member's direction
    cannot fully satisfy their stated reason given what is clean (their words pull one way, the only
    clean spot another), render the 2 bracketing placements and let them choose by eye - reach that fork
    as soon as the conflict is visible, not after several solo coordinate attempts.
- **R14 - Peer concept pieces = one tight block; the proof/UI element overlaps it, visibly distinct.**
  When several pieces illustrate ONE idea *together* (desktop + phone viewport = "responsive across
  devices"; before/after; multi-device), sit them SIDE-BY-SIDE as one tight, aligned block (small
  gap, **peer sizing** - they are co-equals depicting one concept, not a primary + satellite) so they
  read as "the same thing across X". The element that PROVES / measures the idea (a perf-score card,
  a stat panel) then overlaps the block's lower-centre in a **distinct treatment** (the mode's
  concept-vs-UI palette split - in Mode A solid-white UI-sim over the translucent concept block + a
  different accent, e.g. a green score over periwinkle skeletons; in Mode B its own dark patterns /
  a real screenshot) - so it separates cleanly as "the UI, over the illustration".
  The failure: three same-palette panels piled atop each other read as one indistinct blob with no
  logic - you can't tell concept from UI and the overlap looks accidental ("các card đè lên nhau ko
  theo logic thông thường"). This RELAXES R1's "exactly one primary" for the special case of
  co-equal peers depicting one concept: hierarchy then lives between the concept BLOCK and the proof
  element, not within the block.
- **R15 - Wide-short strip: fill the height with full-height fades + groups, never an evenly-spaced
  row.** A wide-short marketing band (a pricing / feature strip, ~3-4:1) tempts the "line a few small
  panels up in a row" layout - which reads as *things spaced in a row* with a dead band of empty
  canvas above and below them, not a designed illustration (member: "just put things horizontally...
  not really layout them like an illustration should"). Instead:
  - **Run the screenshots FULL-HEIGHT of the strip and fade the bottom** (`mask-image:
    var(--mask-fade-bottom)`). Tall captures - A/B storefront variants, the Page Checkup drawer, an
    analytics dashboard - then use the limited vertical space, and the soft bottom fade buys breathing
    room instead of a hard cut ("more vertical space" out of the same band). On a DARK strip the depth
    shadow can NOT be a `box-shadow` (the mask clips it - R10): put the shadow on an OUTER wrapper via
    `filter: var(--drop-frame-dark)` so it follows the faded alpha, while the inner element carries the
    radius + mask. (filter runs before mask on one element, so a shadow on the masked element is
    erased too - it must live on a parent.)
  - **Group into 2 deliberate clusters, not N spaced tiles.** Overlap tightly WITHIN a cluster (R1
    cascade); leave a clear gap BETWEEN clusters so they read as distinct tool-groups. Even spacing
    across the full width is the "row of stuff" failure.
  - A satellite that belongs with a panel (a heatmap beside the Page Checkup card) **overlaps that
    panel and is sized to read** - not shrunk into an isolated corner (R7 cohesion; a tiny lone
    satellite reads as weak + detached). "Make it bigger and overlap" beats "tuck it in small".
- **R16 - Stack to reveal, don't crop to a fragment.** When a rich screenshot (a full dashboard) is
  too big to show whole, do NOT crop it down to a sliver of one element - a hard crop that leaves only
  a fragment of a single label reads as broken (member: analytics "cut so hard I cannot see anything
  except a cut part of atc rate"). Instead show the **fuller capture as a base** and **stack another
  panel ON TOP** that hides the less-important regions, placed so the KEY parts the member named (a
  headline metric, the traffic-source list) keep peeking out at the edge. Partial occlusion by a
  foreground panel reads as intentional depth; a fragment-crop reads as an accident. The base fades at
  its bleed edge (R4); the overlay is a real cascade (R1 - offset both axes, its own corners + shadow).
- **R17 - A SET of illustrations must differ in COMPOSITION, not only in content.** When one
  invocation produces 2+ illustrations for cards that sit side by side, the composition SKELETON has
  to differ - not just what is inside it. Two cards built on the same skeleton (same side holds the
  primary, same side holds the satellite, tags in the same slots) read as **one layout printed
  twice**, even when their concepts are genuinely distinct and every other rule passes (the failure:
  Structure and What-a-shopper-sees both came out page-column-left + white-panel-right + two
  straddling tags - member: "layout gần như y hệt, chỉ khác nội dung bên trong ... nó ko đa dạng và
  interesting cho tổng thể bento layout"). Vary by at least ONE of:
  - **mirror the axis** - primary left <-> primary right. Mirror the panel's INTERNAL alignment too
    (flip the nav, indent or right-align the copy, let the image block full-bleed): a naive
    horizontal flip either buries the copy under the overlay or reads as a mirrored screenshot.
  - **invert the hierarchy** - concept surface primary <-> real-UI panel primary (R1 still holds, the
    roles just swap).
  - **change the cascade direction** - top-left-to-bottom-right vs bottom-left-to-top-right.
  Adjacent cards are where this is mandatory; a card two rows away may reuse a skeleton. This is the
  THIRD leg of the distinctness contract and neither of the other two catches it: **gate 0 keeps the
  CONCEPT distinct, intake rule 3 pulls the VISUAL LANGUAGE together, R17 keeps the COMPOSITION
  distinct.** A set can pass gate 0 and rule 3 perfectly and still be the same layout twice.
- **R18 - A label crossing a line must be OPAQUE.** Any chip / micro-label sitting ON a divider, fold
  rule, chart axis or connector needs a fully opaque background; a translucent wash (e.g.
  `--brand-accent-wash` at ~10%) lets the rule run straight through the text and reads as a printing
  error rather than a label (the failure: the dashed fold rule showing through "THE FOLD" - member:
  "divider đang đè lên the fold"). Keep the intended colour at full opacity with
  `color-mix(in srgb, var(--brand-accent) 11%, var(--inset-bg))` instead of lowering alpha. A
  wash-backed chip is fine only where it sits on a flat surface with nothing running beneath it.
- **R19 - Destination clips the corners: on a PageFly-built section, bleed ONE edge only.** An
  illustration dropped into a section built in the **PageFly editor** sits in a flex container, and
  the image element there **cannot be clipped by the card's border-radius**. So art that runs to the
  frame on **three sides (left + right + bottom)** paints opaque pixels into the card's rounded
  bottom corners: the card renders with **square white corners** while its neighbours stay rounded
  (member: "cơ chế của pf đang là flex container ko cắt được border radius cho ảnh full bleed"). This
  is a DESTINATION constraint, not a taste call - it does not show up in the illustration itself, only
  once the PNG is placed.
  - **The cap: at most ONE bled edge, in practice the bottom.** Every other edge keeps a transparent
    margin - big enough for the panel's own soft shadow (**>=25-30px** logical). One bled edge is safe
    because what the card has to round is the CORNERS, not the edge: with side margins intact, both
    corners next to the bled edge stay transparent and the card's radius still reads.
  - **A panel that "wants" to bleed a side instead ends inside the frame** with its full radius +
    shadow on that side (R3a). Pull the cluster in and let panels overlap deeper to keep cohesion -
    do not shrink everything until the composition goes weak.
  - **Containment is not a bleed.** A drawer sheet filling the inner width of a phone frame shares
    that frame's vertical edges on purpose (UI inside UI) - that is correct, and unrelated to this
    rule, which is only about art touching the STAGE edge.
  - **Verify by measuring the alpha channel, never by eye** - a faint shadow reaching the edge is
    invisible in review and still fills the corner:
    ```python
    from PIL import Image
    im = Image.open(f).convert('RGBA'); w, h = im.size; a = im.getchannel('A')
    left  = next(x for x in range(w)      if max(a.getpixel((x, y)) for y in range(h)) > 8)
    right = next(x for x in range(w-1,-1,-1) if max(a.getpixel((x, y)) for y in range(h)) > 8)
    top   = next(y for y in range(h)      if max(a.getpixel((x, y)) for x in range(w)) > 8)
    ```
    Report the three margins + which edge bleeds; anything at 0 on a PF destination is the defect.
  - **A hand-coded destination (or one whose wrapper clips with `overflow:hidden`) is exempt** - there
    a multi-edge bleed is still the R3b/R4 look. The gate is intake rule 1: ASK how the section is
    built before composing (the whole cart-drawer set had to be re-laid out afterwards because it was
    not asked).

## The 3 intake rules (decide BEFORE composing)
Run these at intake (SKILL workflow step 0). They are why v1/v2 went wrong: no mode gate ->
defaulted dark on a light card; no asset-type gate -> fabricated app UI in HTML.

0. **CONCEPT (the gate the v1s kept missing - decide FIRST).** Name the feature's core function in
   ONE sentence, and the ONE thing the art must show to prove it; the composition depicts THAT. The
   destination / neighbor screenshot is **context** (palette, panel motif, where it lives) - **never
   a template to clone.** Relabeling a neighbor card's art (dressing the A/B-test split up as
   "localize" or "smart cart"; reusing its diagonal split / corner badges) reads as that neighbor,
   not the feature - the member's recurring reject ("dựa quá nhiều vào ref ban đầu", "bản sao của A/B
   test"). Two cards in the same section must share VISUAL LANGUAGE but differ in CONCEPT. If you
   cannot name what makes this card's art distinct from its neighbors, stop and rethink the concept
   before drawing. (Distinct from rule 3 below: rule 3 keeps the VISUAL fit, gate 0 keeps the CONCEPT
   distinct - matching the look while cloning the idea is exactly the v1 failure.)
1. **MODE + how the destination is BUILT.** Determine where the illustration will live, capture a
   neighbor reference screenshot, then pick Mode A (light website-card) or Mode B (dark-glass).
   Destination-driven; no fixed default. In the same breath ask **how that section is built**: a
   section built in the **PageFly editor** caps the art at ONE bled edge (R19 - its flex container
   cannot clip the card's border-radius, so a 3-side bleed squares off the card's rounded corners).
   Answer it BEFORE composing; retro-fitting the cap means re-laying out every illustration in the set.
2. **ASSET-TYPE per depicted element.** Classify each thing shown:
   - **Real app UI** (distinctive Shopify/Polaris screens: editor panels, drawers, inspectors, code
     editor, the Page Checkup drawer) -> **real screenshot, cut into pieces, composited. NEVER
     vector-redraw real Polaris/app UI in HTML.** Request the screenshot from the member if not captured.
     - **Exception (member-directed): real UI that can't be cleanly captured.** If the screen EXISTS
       but yields no usable capture - a known bug renders it blank / with `--` placeholders, or it is
       experimental / pre-release - the member may direct a **vector HTML sim** of it. Keep it in the
       UI palette (solid white, real labels - R12, soft shadow - the Mode-A split) so it still reads
       as actual product UI, and fill believable values (flag them to confirm). A member-directed
       override of "never vector-redraw app UI", NOT a default - default stays screenshot. (The Core
       Web Vitals card on the loads-fast illustration: the real in-app gauge was bugged showing no
       score, so it was simmed.)
   - **Storefront / product output** -> **real photo**, framed (browser/device frame).
   - **Abstract concept / wireframe / connective tissue / decoration** -> **vector** (skeleton bars,
     image-placeholder glyphs, selection frames, cursors, connectors, sparkles, glow-orbs, dotted
     maps, bento blocks).
   - Heuristic: "does this exist as a real, screenshot-able app screen?" Yes -> screenshot crop.
     No / abstract -> vector.
   - **R6 - Pure vs hybrid (offer, don't silently pick).** When an element could be
     **screenshot-only** OR **screenshot + a vector overlay** (e.g. a chart = screenshot table +
     redrawn bars/line; a framed screenshot + vector callouts), don't quietly commit to one. Surface
     the choice in plain language and **offer to render BOTH** so the member can see the combo and
     pick - devs can't picture the hybrid in advance.
3. **MATCH-NEIGHBORS review (before declaring done).** Compare the render against the
   destination/neighbor screenshot on: card bg, color restraint, floating-panel motif, layered
   depth + bleed, type, saturation - match the neighbors' **visual language, NOT their
   concept/composition** (cloning the idea is the gate-0 trap). Do a render-vs-destination
   side-by-side BEFORE done.
   - **For a SET (2+ illustrations in one run): lay them all on the destination grid at once and NAME
     each one's skeleton out loud** ("concept page left, UI panel right, two straddling tags"). Two
     adjacent cards that produce the SAME sentence fail R17 - fix before done. Building the preview
     grid is NOT the check; stating the skeletons explicitly is. (This session had the grid rendered
     and still shipped the repeat, because the comparison was never made out loud.)

## Hard rules
1. **Brand vars only.** Never hardcode a color/radius/shadow - always `var(--...)`.
   Rebrand = swap brand.css, so a hardcoded hex breaks that promise.
2. **Screenshots pass through untouched.** Real captures are embedded via `<img>` and
   never AI-redrawn or repainted. Frame them with `screenshot-frame`, don't recolor them.
3. **Components carry their own surface.** Because the canvas is transparent, a dark-themed
   part (white-alpha text) must sit on its own `--surface`/glass panel - never rely on the
   canvas background for contrast.
4. **Compose, don't template.** Pull kit parts into the canvas and adapt inline. Diversity
   lives in the arrangement (grid/flex/absolute), not in rigid layouts.
5. **Keep it HyperFrames-friendly:** clean semantic HTML, no timeline-hostile hacks, so a
   future animated version is a cheap upgrade.

## Asset mix (decide per card, guided by intake rule 2)
- Pure vector (abstract concept cards: a score ring + prescription cards)
- 1-2 screenshots framed + vector annotations (selection frame, insert line, callouts)
- Hybrid composition (real app-UI screenshot crops composited with vector connective tissue)

## Sizing
- Author at logical px; render at 2x. Common stage sizes: 1200x900, 1080x1080, 1440x900.
- Match render.mjs `--width/--height` to `#stage`.
- **Crop tight to the content.** Size `#stage` to HUG the composition with only a few px of margin
  (just enough that no shadow / border clips). Excess transparent margin around the art becomes dead
  space that's hard to place on the page - the member has to fight surrounding whitespace ("cho lên
  page sẽ bị thừa không gian xquanh khó xử lý"). The art's bounding box, not a fixed canvas, sets the
  stage size; bento-card illus run small (e.g. ~732x540, not 1200x900). A bled edge (R3b) has ZERO
  margin - it runs to the stage edge; on a PageFly-built destination only ONE edge may do that, and
  every other edge keeps >=25-30px of transparent margin (R19).
- **Round more at small display size.** Card illustrations render small on the page, so default radii
  (`--r-md` 8px) look near-square there. Use generous rounding on panels (`--r-xround` 28px) and bump
  inner image/blocks to `--r-xxl` (14px) so corners read as intentionally rounded at the displayed
  scale, matching the neighbours ("bo góc đang hơi vuông so với các card khác").
