# anima motion style-guide (the PF "gu")

> **TRAINING LEDGER.** This is the living record of PageFly motion taste. Every refine
> session appends here: new eases, glow recipes, pacing tricks, and what "modern PF"
> means now. Refinement compounds into this file - never into a throwaway.
>
> **Scope:** this file is PF *taste* only. Video *machinery* (composition structure,
> timeline contract, scene-transition mechanics, lint/inspect/validate) lives in the
> **hyperframes** skill - follow it, do not duplicate it here.

Values below are extracted from the proven worked example, the Page Checkup intro
(`examples/before-after/index.html`). When you invent a new value that works, add it here.

## Pacing / rhythm

- **Loop pieces: 10s seamless loop, 1600x900.** Four beats: intro hold -> "before" state ->
  fix-moment morph -> loop tail back to navy. (A **footage piece** is 1920x1080 and linear -
  see Footage pieces below.)
- Beat anchors (from the example): scene 2 enters **~2.3s** (`T2`), fix moment **~4.6s**
  (`TF`), loop-tail veil **~9.3s**. A single-feature teaser can drop the morph beat and
  hold one feature 2.5-6s instead.
- Offset the first tween **0.1-0.3s**, never `t=0` (avoids a hard pop on frame 0).
- **Stagger vs beat - two different rules, do not mix them up:**
  - a **group of like elements** (markers, rings, chips): stagger **<=0.14s**;
  - a **sentence split across lines** (a two-line title): **0.35-0.45s** between the lines.
    This is NOT a stagger group. At 0.14s line 2 punches in before line 1 has settled and
    reads as a jolt. Measured on `outputs/checkup-sharper` - 0.14s was rejected, **0.40s** shipped.
- Keep the total entrance of a scene under ~1.2s (a two-line title pushes this to ~1.9s - fine,
  the extra time is the beat above, not sluggish entrances).
- **Hold to read.** After the last text element of a scene finishes entering, it must sit still
  for **>= 2.5s** before the transition. Measured on `outputs/checkup-sharper`: a 1.55s hold drew
  "it disappeared the moment it appeared"; 3.35s read fine. Derive the transition time
  **backwards** from this - never fix the cut first and then squeeze the copy in.
  (Evidence limit: one measurement, one ~40-character subhead line. Not a validated formula.)

## Eases - vary at least 3 per scene

| Role | Eases used | Where |
| --- | --- | --- |
| Entrances | `power3.out`, `expo.out`, `power2.out` | logo/page/drawer slide-ins, title reveal |
| Emphasis (pop) | `back.out(1.6)` .. `back.out(2)` | markers, score ring, delta chip, state chip |
| Breathing | `sine.inOut` | glow scale yoyo, ring pulse, beam sweep |
| Bars / dividers | `power4.inOut`, `power3.inOut` | accent bar scaleX, divider scaleX |
| Crossfade / morph | `power2.out`, `power2.inOut` | scene transition, before->after image swap |

Never reuse one entrance pattern twice within a scene; change ease AND direction.

## Glow treatment

- Diffuse purple/blue **radial** glows, `border-radius:50%`, `filter: blur(150-175px)`,
  low fill opacity (**0.18-0.30**) via `--glow-accent` / `--glow-blue`. Depth comes from
  glow, not heavy box-shadow. (Avoid full-screen linear gradients on navy - H.264 banding.)
- Every glow **breathes**: `scale` yoyo, `repeat: 1`, `sine.inOut`, 2-3.4s. Finite repeats
  only (never `repeat: -1`).
- Scene-1 glows **start hidden** (`opacity:0` inline) and fade in ~0.1s, so the loop seam
  (t=10 -> t=0) lands on pure navy. Concentric `--brand-accent-soft` rings at 0.07-0.12
  opacity add depth behind the lockup.

## Loop-seam technique (anima's signature, not in hyperframes)

- A full-bleed `#loopveil` (`background: var(--bg)`, `opacity:0`, `z-index:50`) fades
  `opacity 0->1` at **~T-0.7s** (`duration ~0.55, ease power2.in`) so the final frame is
  pure navy == frame 0. Combined with glows starting hidden, the loop is seamless.
- The canvas ships this veil inert; wire its tail tween once the scene has content.

## Typography

- **Poppins**, literal display weights: **700** (titles ~142px, brand names 600), **200**
  for light display (subhead). Body 400/500.
- **JetBrains Mono** + `font-variant-numeric: tabular-nums` for **numeric readouts only**
  (the score digits, stat values). NEVER for eyebrows / kicker labels / chips / badges - those
  are Poppins soft badges per `_pf-brand/label-rules.md`. Mono is code / number only; the dated
  mono-caps eyebrow is killed.
- **Fonts use literal family names** (`"Poppins"`, `"JetBrains Mono"`), NOT `var(--font-*)`.
  The HyperFrames renderer auto-resolves literal names but cannot resolve a CSS variable,
  so `var(--font-body)` silently falls back to a generic font in the render. Colors use
  `var(--...)`; fonts stay literal. (Keep literal rules in sync with `--font-*` on rebrand.)

## Labels & badges

Text labels, eyebrows, and chips follow the shared kit - do not re-invent inline:
- **Rules:** `_pf-brand/label-rules.md` (source of truth). Poppins, sentence case, normal
  tracking, soft 8px radius. No UPPERCASE+tracked labels, no mono eyebrows, no metallic pills.
- **Badge styles:** `_pf-brand/badges.html` - families Tint / Ghost / Solid x colors
  purple / gray / green / blue / yellow / neutral. Use `var(--badge-*)` from `brand.css`.
- **Pick by contrast**, never same-hue-on-hue (no red chip on a red hero). Error + success
  chips in one piece share family + size, differ only by color.
- **Measured on `--bg` navy:** a **Tint** purple badge (`--badge-purple`) lands at **3.7:1** -
  it FAILS WCAG AA (needs 4.5:1). A **Solid** badge passes. So on navy default to **Solid**;
  reserve Tint for lighter surfaces. Verify with `npx hyperframes check`, do not eyeball it.
- **Element by function - no decorative badges.** A badge flags STATUS / category bound to a
  title or item ("New", "Beta", "Early access"); a label that names / describes nearby or
  below content (a view-state label, caption, field name) is **plain text**, not a pill / box.
  Reserve the badge for status; describe with plain text. See `_pf-brand/label-rules.md` rule 7.
  (Worked example: heatmap-reveal keeps "New" as a Solid badge by the title, but "Page view" /
  "Heatmap" - which name the view shown below - are plain Poppins text.)

## Transitions

- Scene-to-scene = **blur crossfade**: incoming scene `fromTo({opacity:0, scale:1.04,
  filter:"blur(16px)"}, {opacity:1, scale:1, filter:"blur(0px)", 0.6, power2.out})`.
  Navy stays opaque underneath - no jump cuts (hyperframes hard rule).
- The **scan-beam** (cyan `--brand-cyan` gradient, `box-shadow` glow, `opacity:0` at rest)
  sweeps across to mark the "fix"/reveal moment, then fades out. Cyan is for the beam only.

## Footage pieces (title card + a real recording)

A piece that cuts from an on-brand title card to an existing capture (screen recording, product
demo) breaks three assumptions the rest of this file makes. The rules below were measured on
`checkup-sharper`, a footage piece that is NOT shipped with this skill (its media weighs ~44MB) -
everything needed to build one is in this section plus `components/footage-scene.html`.

**Canvas is 1920x1080, not 1600x900.** Squeezing a 1920-wide capture into a 1600-wide canvas
softens the UI text inside the recording. Author the root at native size and keep kit geometry
untouched by wrapping scene 1 in a scaled stage:

```css
.stage16 { position:absolute; top:50%; left:50%;
           width:1600px; height:900px; margin:-450px 0 0 -800px;
           transform: scale(1.2); }
```

Paste kit blocks inside `.stage16`, not straight into `.scene`. Not a single kit number changes.

**`data-fps` on the root MUST match the source footage.** HyperFrames defaults to 30; captures
are usually 60. Nothing lints this - the render silently throws away half the source's smoothness.
Check by hand, on both ends:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 <source>  # before authoring
ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames   -of csv=p=0 <output>   # after render
```

Evidence: the first `checkup-sharper` render produced 585 frames for 19.5s (= 30fps) from a 60fps
source, with zero warnings.

**Duration is title card + clip length - it is not gated to 10s, and it does not loop.** The
closing veil still fires at `duration - 0.7` for a clean tail (see Loop-seam above), but frame 0
and the final frame need not match. This is the exemption named in SKILL.md hard rule 6.

**Clip mechanics:** the `<video>` must be `muted playsinline`; audio is always a separate
`<audio>` element; `data-media-start` trims into the source. Use the `footage-scene` block.

## QA gotchas

- **Every scene that a later scene covers needs a clip window.** A bare `<div class="scene">`
  stays in the DOM for the whole composition, so the checker keeps measuring its text against
  whatever the covering scene is painting - producing occlusion errors and phantom contrast
  failures at timestamps where that text is not even visible. Give it
  `class="scene clip" data-start data-duration data-track-index`, where `data-duration` = the
  crossfade end plus a frame of slack. Measured: this one line took `examples/before-after`
  from **12 errors to 0**. The GSAP `fromTo` that fades the scene in does NOT do this - it
  controls opacity, not clip lifetime.
- **`data-layout-allow-occlusion` silences the contrast check too**, not just the occlusion
  notice. Measured on `outputs/checkup-sharper`: adding it took `hyperframes check` from **4/4**
  text checks to **0/0**; removing it restored 4/4. Text sitting under the incoming scene during
  a crossfade is intentional and only reports at **info** level - so **leave the notice standing**
  and write a comment explaining it. Do not reach for the attribute.

## Do / Don't

- DO keep navy opaque on every scene; the score/feature is the hero of its beat.
- DO animate IN every element (`gsap.from`/`fromTo`); exit tweens only on the final beat
  (the loop tail). Defer the full scene-transition contract to the hyperframes skill.
- DON'T use emoji. Severity = CSS dots (`.mk-dot`, glowing red); "fixed" = a **drawn SVG
  check** path; success = green pill. Iconography is hand-drawn, never an emoji glyph.
- DON'T animate the same property on one element from two tweens (color-only vs scale-only
  are separate tweens on the ring - that's the pattern, not a violation).
- DON'T hardcode hex - reference `var(--...)`. (Fonts are the one literal exception above.)
- DON'T use `Math.random()` / `Date.now()` or `repeat:-1` - renders must be deterministic.
