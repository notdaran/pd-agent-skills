# PageFly label + badge rules

Source of truth for text labels, eyebrows, chips, and badges across PageFly visuals
(video + static). Goal: match the live PF mainsite, not 2015-era landing pages.

## The dated look we are killing

These read as outdated and do NOT appear on the PF mainsite:

- UPPERCASE labels with wide letter-spacing (the "cinematic" tracked-out look) -
  e.g. `NEW IN PAGEFLY`, `HEALTH SCORE`, `PAGE VIEW`, `BEFORE` / `AFTER`.
- Mono-font eyebrows (JetBrains Mono caps) used as decorative labels.
- Pills with metallic gold / green outlines.
- Oversized, full-pill, heavy-weight chips that clash with their neighbors.

## The rules

1. **Font.** Poppins for all labels, eyebrows, badges. Mono (`--font-mono`) is for
   real code blocks ONLY - never an eyebrow, label, or badge.
2. **Case.** Sentence case for labels and eyebrows ("New in PageFly", "Health score",
   "Page view"). No ALL-CAPS labels.
3. **Tracking.** Normal letter-spacing (0). No wide / "tracked-out" labels.
4. **Eyebrows.** Replace the mono-uppercase-tracked eyebrow with either plain sentence-case
   small text, or a soft badge (Tint / Ghost from the badge kit). Mainsite uses soft pills
   like "Built for Shopify", "New feature: ..." - sentence case, soft, rounded.
5. **Badges / chips.** Use the shared badge kit (`badges.html`): families Tint / Ghost / Solid,
   colors purple / gray / green / blue / yellow / neutral. Poppins, sentence case, soft 8px.
   No metallic outlines. Do not re-invent badge styles inline.
   - **Pick by contrast.** Choose the family + color that stands out cleanly from whatever is
     behind it. Never same-hue-on-hue (no red chip on a red hero - switch family/color).
   - **Stay consistent.** Error + success chips in one piece share the same family + size,
     differing only by color. No oversized green vs tiny red.
6. **What stays big.** Hero / feature titles stay large and bold ("Heatmaps") in Poppins,
   Title or sentence case, as on the mainsite hero. This is NOT the dated look - keep it.
7. **Use the element for its function, not its looks. No decorative badges.** A badge is a
   STATUS / CATEGORY flag bound to a title or item ("New", "Beta", "Early access", "Built for
   Shopify") - it earns the pill because it flags state. A label that NAMES or DESCRIBES nearby /
   below content (a view-state label like "Page view" / "Heatmap", a section caption, a field
   name) is NOT a badge - render it as plain text (Poppins, sentence case, muted or accent
   color), never a pill / box. Pick by function: status flag on a title -> badge; describing or
   naming content -> plain text. Do not sprinkle badges for decoration. Exception: the member
   explicitly asks for a decorative pill.

## Quick before -> after

| Dated | Fixed |
| --- | --- |
| `NEW IN PAGEFLY` (mono, caps, tracked) | `New in PageFly` (Poppins, sentence) or a soft Tint badge |
| `HEALTH SCORE` (caps, wide tracking) | `Health score` (sentence, normal tracking) |
| `PAGE VIEW` (caps, outlined box) | `Page view` Ghost/Tint badge |
| `BEFORE` / `AFTER` (caps, gold/green border) | `Before` / `After` soft Solid or Tint pills |
| Red chip on red hero (low contrast) | neutral/white Solid badge, or move off the red area |
| Big bold green pill vs tiny red dot | both same family + size, only color differs |
| `Heatmap` pill labeling the view below (decorative badge) | `Heatmap` plain text - it describes content, not a status |
| Badge used as a caption / section label | plain text; reserve badges for status / category flags |
