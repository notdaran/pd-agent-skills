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
  fix-moment morph -> loop tail back to navy. (A **footage piece / feature explainer** is linear, and takes its canvas from the footage -
  see Footage pieces below.)
- Beat anchors (from the example): scene 2 enters **~2.3s** (`T2`), fix moment **~4.6s**
  (`TF`), loop-tail veil **~9.3s**. A single-feature teaser can drop the morph beat and
  hold one feature 2.5-6s instead.
- Offset the first tween **0.1-0.3s**, never `t=0` (avoids a hard pop on frame 0).
- **Stagger vs beat - three different rules, do not mix them up:**
  - a **group of like elements** (markers, rings, chips): stagger **<=0.14s**;
  - a **sentence split across lines** (a two-line title): **0.35-0.45s** between the lines.
    This is NOT a stagger group. At 0.14s line 2 punches in before line 1 has settled and
    reads as a jolt. Measured on `outputs/checkup-sharper` - 0.14s was rejected, **0.40s** shipped.
  - a **cluster travelling as a unit** (a card + its headline + its subhead entering together):
    stagger its children **0.04-0.07s** (3-4 frames @60). See below.

### Overlap / follow-through - a cluster must never travel as one rigid block

Raised by the member on `outputs/checkup-15s`, against a cluster whose three parts flew in on a
single tween of their shared parent:

> "trong motion graphic có rules là overlap animation principle í, thì t thấy khi xhien 3 element
> này nên xhien cách nhau 1 vài frame để tự nhiên thay vì đi vào cả cục"

A block move reads as a *slide transition*; a staggered one reads as objects with mass. The fix is
structural, not a tuning value: **tween the cluster's CHILDREN, never the wrapper.**

```js
tl.set("#e1-in > *", { x: -1750 }, 0);                                   // park off-frame at t=0
tl.to("#e1-in > *", { x: 0, duration: 0.66, ease: "power3.out", stagger: 0.07 }, 1.95);
tl.to("#card-in > *", { x: -1750, duration: 0.65, ease: "power2.in", stagger: 0.04 }, 1.55);
```

- **The `set()` at t=0 is mandatory.** Tweening children instead of the wrapper means each child
  sits at its resting position until *its own* tween starts - so without parking them, the headline
  is visible dead-centre while the card is still flying in.
- **Exits stagger too**, and slightly tighter than entrances (0.04 vs 0.07): an exit is leaving, not
  arriving, and does not want to be studied. Staggering entrances but not exits inside one piece
  reads as an oversight.
- **Widen the clip window when you add an exit stagger** - the last child now leaves
  `(n-1) x stagger` later, and a window that ends on the old time clips it mid-travel.
- Verify by sampling ~4 frames across the entrance (0.10s apart), not by watching: at speed a
  missing stagger looks merely "fast", and only adjacent frames show the parts moving in lockstep.
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
- **Measured on `--bg` navy** (re-measure if you swap Layer B - the light preset's severity chips
  measured 4/4 AA as tints, the opposite result): a **Tint** purple badge (`--badge-purple`) lands at **3.7:1** -
  it FAILS WCAG AA (needs 4.5:1). A **Solid** badge passes. So on navy default to **Solid**;
  reserve Tint for lighter surfaces. Verify with `npx hyperframes check`, do not eyeball it.
- **Element by function - no decorative badges.** A badge flags STATUS / category bound to a
  title or item ("New", "Beta", "Early access"); a label that names / describes nearby or
  below content (a view-state label, caption, field name) is **plain text**, not a pill / box.
  Reserve the badge for status; describe with plain text. See `_pf-brand/label-rules.md` rule 7.
  (Worked example: heatmap-reveal keeps "New" as a Solid badge by the title, but "Page view" /
  "Heatmap" - which name the view shown below - are plain Poppins text.)

## Transitions

Applies to ANY multi-scene piece - a pure motion-graphics explainer with no recording in it at
all, an explainer whose evidence is a screen capture, a teaser. Terms below: a **claim** scene
says what is coming; an **evidence** scene shows it (vector demo *or* footage - the grammar does
not care which).

### The handoff - move the eye, don't dissolve the frame

The strongest joins are not transitions between *scenes* at all. They are one element handing the
viewer's attention to the next, using **position and scale only - no opacity**. Worked reference,
Instant's intro at 0:11-0:13, a single unbroken move across what are nominally three scenes:

1. the phone mockup **slides down and out of the bottom** of the frame (position only);
2. the moment it clears, a wave emoji **launches upward from that same bottom edge** - the eye is
   already looking there, so it catches the new subject with zero search time;
3. the emoji rises to centre and settles, large;
4. it **shrinks and slides left** into a gap the incoming headline has already reserved for it -
   landing as a glyph inside "Say hello (wave) to";
5. three avatars **fly in from three corners** and the headline swaps to "instant agents".

Not one opacity tween in the whole sequence. The principles, in the order they matter:

- **Exit direction sets entry direction.** Wherever the outgoing element leaves is where the
  viewer is looking - launch the next one from exactly there. This is the whole trick. A fade
  makes the viewer re-find the subject; a handoff never lets them lose it.
- **Move, don't fade.** `x/y/scale` are the verbs. Opacity is what you use when two things have
  **no spatial relationship** - it is the absence of choreography, not a style choice.
- **One element may cross scenes and change role.** The emoji is a hero object, then a glyph
  inside a sentence. While it persists there is no cut at all: the scene changed and the thread
  never broke. Look for the element that can legitimately carry over *before* designing two scenes -
  this is a storyboard decision, not something you can add at timeline time.
- **Reserve the landing slot in advance.** The headline lays out *with the hole already in it* so
  the travelling element decelerates into a pre-existing gap. If the text reflows to make room on
  arrival, the illusion dies. Author the gap as real layout (a fixed-width empty span), not as
  something that appears.
- **Overlap the moves, don't queue them.** The emoji starts rising before the mockup has finished
  leaving. Sequential reads as a slideshow; a small overlap reads as cause and effect.
- **Enter from outside the frame, on several vectors.** Three corners at once fills the frame with
  energy and still needs no fade.

```js
/* handoff shape - outgoing exits toward the next entry point, incoming launches from it.
   No opacity anywhere; the overlap is what makes it read as one move, not two. */
tl.to("#mock",   { y: 620, duration: 0.55, ease: "power2.in" }, T);                       // leaves downward
tl.from("#hand", { y: 640, scale: 0.6, duration: 0.70, ease: "power3.out" }, T + 0.35);   // overlap
tl.to("#hand",   { y: 0, scale: 0.34, duration: 0.60, ease: "power2.inOut" }, T + 1.25);  // into the reserved gap
```

A handoff needs an **exit** tween, which the kit's "entrances only" rule forbids - that rule is
loop-only, see SKILL.md hard rule 3. What stays banned everywhere is the *decorative* fade-out
that exists only to clear the screen.

**The one place a handoff cannot be complete: a join into a real recording.** Footage is fixed -
nothing inside it can be moved. Do the half that is available (see `footage-pieces.md`).

### The match cut

When an element in one scene has a counterpart in the next, **place it at that counterpart's
position and scale in frame** so the join reads as the first *becoming* the second. Instant does
this deliberately: the mock "Build this Figma" pill sits where the real pill appears in the shot
that follows. `checkup-hero` does the opposite - a score card centred at one size, cutting to an
editor where the score lives in a left panel at another - so its join is only a fade. Costs
nothing at author time; it is the difference between "slide, then demo" and one continuous idea.

### Crossfade - the fallback, and how to tier it

Use a blur crossfade only where no spatial relationship exists (typically evidence -> evidence
across two unrelated recordings). Even then it should not be one uniform tween: a multi-beat piece
has four kinds of join and they must not feel alike.

| join | intent | suggested treatment |
|---|---|---|
| evidence -> evidence **inside one beat** | one continuous action; the cut exists only because the camera moved | fastest, lightest: ~0.18s, blur ~6px, **no scale** - near-subliminal |
| claim -> **its** evidence | the promise being kept; stepping into the product | ~0.32s **push in** (incoming `scale 1.03 -> 1`), moderate blur |
| evidence -> **next** claim | chapter break; the viewer needs to exhale | ~0.45s **pull back** (incoming `scale 0.985 -> 1`), plus a held beat of stillness before the incoming content animates |
| intro -> first claim, last evidence -> outro | brand bookends | largest move, ~0.5s |

- **Direction carries meaning.** Push in when entering the product, pull back when returning to a
  card. A push-in on *every* incoming scene (what `checkup-hero` v3 does) means the piece only ever
  moves forward and never rests.
- **Timeline math stops being uniform.** Starts are no longer `prev + dur - 0.30`; compute them
  from a per-join overlap table, and re-derive whenever a scene's length changes.
- **The rest matters as much as the move.** If every scene's content starts animating the instant
  it appears, the piece never breathes.
- **Reserve one slow move per piece.** `checkup-hero` earns one: a 5.2s `scale 1 -> 1.28` easing
  onto the FlyMate answer so it becomes readable without cropping. It works because nothing else
  moves like that; two or three would cancel out.
- **A slow push on a video will collide with the join's own scale tween.** `hyperframes lint`
  catches it (`overlapping_gsap_tweens`): start the slow move *after* the incoming crossfade's
  scale lands, not at the cut. Measured on `checkup-15s` - the push had to move 8.90 -> 9.14.

### Hold-to-read under a hard duration ceiling

The >=2.5s hold above is derived from a loose piece. Under a hard ceiling (a member asking for
"max 15s") it stops being payable on every scene, and the honest move is to buy back what you can
rather than pretend: on `checkup-15s` (14.9s, 2 claim scenes + 2 cuts + outro) the holds land at
**2.0s / 1.8s**. Two things make that read acceptable instead of rushed:

- **Cap the copy to the hold you can afford** - headline <=30 chars, subhead <=48. The rule was
  measured on a ~40-char subhead; halve the reading load and a 2s hold behaves like a 2.5s one.
- **Land the text EARLY and let the mock keep animating under it.** Convention says mock first,
  then headline. Inverting it - headline at +0.36, subhead at +0.52, dial count-up running to
  +1.6 as ambient motion - costs nothing and buys ~0.5s of hold, because the hold rule counts
  only *text* stillness, not stillness everywhere.

### Other

- Legacy default for a simple loop piece, still fine where nothing is being handed off: incoming
  scene `fromTo({opacity:0, scale:1.04, filter:"blur(16px)"}, {opacity:1, scale:1,
  filter:"blur(0px)", 0.6, power2.out})`, ground opaque underneath - no jump cuts (hyperframes
  hard rule).
- The **scan-beam** (cyan `--brand-cyan` gradient, `box-shadow` glow, `opacity:0` at rest) sweeps
  across to mark the "fix"/reveal moment, then fades out. Cyan is for the beam only.

## Footage pieces -> `references/footage-pieces.md`

A piece that cuts animated scenes together with a real screen recording (an app demo, a capture)
breaks several assumptions this file makes: it is linear rather than a loop, the canvas comes
from the footage instead of the kit, and the framing/de-chroming of the capture is its own craft.
**Read `references/footage-pieces.md` before authoring one**, and use `scripts/solve-crop.py` to
work out each cut's crop rather than eyeballing it. `components/footage-scene.html` is the block.

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

- DO keep the ground opaque on every scene (navy for kit pieces, the light Layer B for a piece
  over a light app UI); the score/feature is the hero of its beat.
- DO animate IN every element (`gsap.from`/`fromTo`); in a LOOP piece exit tweens live only on
  the final beat (the loop tail). A **linear** piece needs choreographed exits - see
  Transitions -> The handoff, below. Defer the full scene-transition contract to hyperframes.
- DON'T use emoji. Severity = CSS dots (`.mk-dot`, glowing red); "fixed" = a **drawn SVG
  check** path; success = green pill. Iconography is hand-drawn, never an emoji glyph.
- DON'T animate the same property on one element from two tweens (color-only vs scale-only
  are separate tweens on the ring - that's the pattern, not a violation).
- DON'T hardcode hex - reference `var(--...)`. (Fonts are the one literal exception above.)
- DON'T use `Math.random()` / `Date.now()` or `repeat:-1` - renders must be deterministic.
