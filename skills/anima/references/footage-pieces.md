# Footage pieces - the playbook

A **footage piece** cuts on-brand animated scenes together with an existing screen recording.
It breaks assumptions the rest of `style-guide.md` makes, so its rules live here.

**Two shapes live here, and they are not the same job:**

| | **footage piece** | **feature explainer** |
|---|---|---|
| shape | one title card -> one continuous recording | intro -> [explainer -> footage] x N -> outro |
| scenes | 2 | 13 on `checkup-hero` |
| the animated part | *introduces* | *teaches*; the footage *proves* |
| unit of composition | the scene | the **beat pair** (claim + evidence) |
| worked source | `checkup-sharper` (not shipped, ~44MB media) | `outputs/checkup-hero` |

Everything below applies to both unless it says otherwise; sections 2 and 7 are explainer-only.
`checkup-hero` was rebuilt three times - almost every rule here is a mistake that shipped once.

---

## 1. Intake - settle these BEFORE cutting anything

Three of this case's three rebuilds were caused by skipping one of these.

**Which claims are durable?** `checkup-hero` v2 led on "free" - intro subhead, an outro card,
an explainer line. The member killed all of it: *"t ko muon USP cua toan vid nay la free scan -
vi sap toi co the se charge o scan thi lai phai lam lai vid."* A price is the single most likely
thing to change and the one claim that invalidates the **whole cut** rather than one line.
Ask which claims survive the next two quarters, and lead on what the product *does*.

**What must be hidden, exactly?** Do not infer this. The member's answer was narrower than
assumed: *"cat de nen van con vien trang cung duoc, mien la hide duoc cai tab bar ca nhan di."*
Only the personal browser tab strip had to go - the OS window backdrop was fine. v1 assumed
"crop to the app" and cut a real inspector panel out of the shot.

**What is the hero action of each beat, and where does it sit in frame?** Find it in the source
before choosing a cut. v2's drag-and-drop beat was framed on the panel, so the actual drop
happened in a bottom corner and was gone in a blink: *"action chinh nam len len o goc viewport
va xhien + bien mat qua nhanh."*

**A reference the member sends is a REFERENCE, not a copy target.** `checkup-15s` r2 was handed
three stills of the member's own prototype to explain a *loop mechanism*, and the card's copy was
lifted off them verbatim - tracked-uppercase eyebrow, two-line subhead, four category chips. The
member rejected all of it:

> "cái ảnh intro t gửi m là ref thôi, đừng có đổi text theo nó, trông busy nhiều text quá, cái cũ
> đang ổn mà"

Ask what the reference is a reference *for* - the mechanism, the layout, the tone - and change only
that. Copy that already shipped and was not complained about is a decision, not a placeholder. (It
also cost a self-inflicted rule conflict: the lifted eyebrow violated `_pf-brand/label-rules.md`,
which had to be flagged as an exception until the revert retired it.)

**Duration.** Do not quote a ceiling from the footage alone. v2 reported "the footage only
supports ~28s, 40-45s is not achievable" - true for a bare footage chain, wrong for the piece
that actually shipped, because explainer scenes are what buy the runtime. Budget the whole
structure first: `checkup-hero` = 26.1s footage + 18.2s animated - 12 crossfades = 40.7s.

## 2. Structure - a raw footage chain has no context

The Instant / GemPages shape (straight into the product UI, no cards) is what members ask for
first, and it is a trap for a dense app. `checkup-hero` shipped that way and came back:

> "nhay thang vao screenshot man hinh bi ko co context ... dap vao mat user 1 chuoi footage nhu
> huong dan su dung ma thuc chat cha huong dan gi"

Those references work because **each recording is preceded by a simple animated beat that says
what is about to happen**, and because their own UI is sparse. A three-panel editor is not.
When a member cites a reference, analyse *why* it works and say so before building - do not
copy its surface shape.

**Shape that worked:** `intro -> [explainer -> footage] x N -> outro`, blur-crossfaded throughout.

- **Explainers are mock UI, not typography.** Draw the one idea in CSS/SVG - a page card with a
  beam sweeping it, a score counting up, a two-bubble chat - then a headline under it. A
  text-only card reads as a slide; a drawn one reads as product.
- **An explainer is a promise the next cut must keep.** v2's second explainer showed findings
  being *ranked*; the footage after it showed a fix landing and the score moving. Close enough
  to write, wrong enough to notice. Write each explainer **from its cut**, not from the feature
  list.
- **Mirror the real product** in the mock: real finding titles, the real Critical/Warning chips,
  the real status chip. The explainer should visually rhyme with the footage that follows.
- **Don't spoil the payoff** the footage is about to deliver - the scan explainer shows the *act*
  of scanning, not a score.
- **Explainers replace captions over footage.** Once each beat is introduced, a chip riding on
  the recording is redundant - and it was the only thing that needed an exit tween. Dropping
  captions put the piece back inside "entrances only" with no exception.
- **Intro / outro may be navy while the explainers stay light** (member-chosen here): brand
  punch at the ends, and no hard contrast jump into the light app UI in the middle.

## 3. Framing - never leave a partial border

**The rule (member):** a cut may show the capture's window backdrop on **two opposite sides, or
on none** - never three sides with the fourth bleeding off, which reads as a mistake:

> "full bleed thi no co the co vien trang nma vien 2 ben HOAC tren duoi chu k vien 3 ben de 1
> ben cat nnay ... zoom to ra ti de cat cham 2 dau tren duoi cho deu"

**Use `scripts/solve-crop.py`.** It computes, per cut, the intersection over that cut's whole
duration of the non-backdrop content box, insets 20px (clearing the window's grey rail and its
rounded corners), and returns the largest canvas-aspect rect inside it - zero backdrop on any
edge, by construction. `--bias` places it vertically (0 top, 1 bottom); raise it when the hero
action sits low. Then `verify` each cut before composing.

Three traps it encodes, each of which shipped once:

1. **Test CHROMA, not brightness.** The backdrop is (238,244,246) - G-R=6, B-R=8 - while the
   editor's own white panels are (253,253,253), neutral. A level-only test merges them, calls
   the app's panels "background", and crops real UI away. This bug bit twice: once in the
   original hand-rolled crop, and again in the first version of the script itself, whose
   corner auto-detect accepted white and returned a box 40% too small.
2. **Measure the WORST CASE across the cut, not one sample.** Recorders like Screen Studio bake
   auto-zoom into the pixels, so the tab strip sits at a different depth per moment. Sampling
   mid-shot left the strip on **frame 0** of three cuts while every mid-cut sample said clean.
   Cuts must also never straddle a zoom move.
3. **Test RUN LENGTH on each edge, not a pixel count.** Scattered matches are the app's own pale
   UI; a contiguous run of 40+ is a real border. A loose tolerance flagged 66 clean frames.

**Verify cuts, not the composed render.** A finished piece containing light card scenes will
false-positive: a *designed* pale background is genuinely indistinguishable from a window
backdrop at the frame edge.

**Let the footage pick the canvas, not the reverse.** `checkup-hero` is **1624x854** because that
is the capture's own usable geometry; cuts land at 1.09-1.27x. Forcing 1920x1080 or 16:9 would
have centre-cropped panels out. (`checkup-sharper`, a single-clip piece, is 1920x1080 for the
same reason - its capture was 1920 wide. Neither number is a rule; the source is.)

**Need a closer look at one panel? Push in, don't crop.** A GSAP `scale` tween on the `<video>`
with `transform-origin` at the panel keeps full context on the incoming frame and still lands
readable. Cropping to that panel is what got v1 rejected.

## 4. Mechanics

- **`data-fps` MUST match the source.** HyperFrames defaults to 30; captures are usually 60, and
  nothing lints it - the render silently discards half the smoothness. Check both ends:
  `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 <src>` and
  `... stream=nb_frames ... <output>`. Evidence: `checkup-sharper`'s first render made 585 frames
  for 19.5s (= 30fps) from a 60fps source, silently.
- **Each cut IS a scene:** `<video class="scene clip" data-start data-duration data-track-index>`,
  `muted playsinline`, `data-media-start` trims into the source. No wrapper div - no second clip
  window to keep in sync. Audio is always a separate `<audio>` on its own track.
- **One `data-track-index` per scene.** Same-track clips cannot overlap and a crossfade *is* an
  overlap; alternating 0/1 also trips `timeline_track_too_dense` once there are ~15 scenes.
- **Every card scene needs an opaque background.** Give the light scenes the gradient itself, not
  a transparent div over a shared bed - otherwise a crossfade stacks two scenes and reads muddy.
- **Pre-cut in ffmpeg, don't crop in CSS.** Exact pixels, smaller files, and each cut is then
  independently verifiable.
- **A light piece needs a recoloured logo.** `assets/pf-logo.svg` is white - built for navy, and
  invisible on a pale ground. Split it by path x-coordinate (mark vs wordmark) and recolour to
  `--brand-accent` + `--text`; `checkup-hero/assets/pf-logo-dark.svg` + `pf-mark.svg` are the
  worked result. Put logos in as **CSS backgrounds, not `<img>`**: three `<img>` sharing one src
  trips `duplicate_media_discovery_risk`.
- **Count-ups stay deterministic**: tween a plain proxy object and write the value in `onUpdate`.
  No `Math.random()` / `Date.now()`.
- **ffmpeg cannot rasterise SVG** - don't try to preview a logo through it; check it in the render.
- **Linear by default - but looping is available, and is usually the better choice.** Left linear,
  the closing veil fires at `duration - 0.7` for a clean tail and frame 0 need not match the final
  frame; match the veil colour to frame 0's ground so an autoplay loop at least restarts cleanly.
  **A veil cannot save a seam when the two ends differ** (e.g. the piece opens light and closes
  navy - no veil colour fixes that). For anything that will autoplay on a landing page, build it to
  loop instead: **section 10**, no veil at all. SKILL.md hard rule 6 carries both recipes.

## 5. Light surface palette (Layer B variant)

**Scope, corrected: this is a rule about DISSOLVES, not about footage.** Use it when a navy card
*cross-fades* into a white editor - the two grounds mix on screen and the join flashes. If every
navy<->footage join is a **slide** with a hard edge, the brightnesses never blend, there is no
flash, and the light palette is not needed at all. `outputs/checkup-15s` r4 is the worked case:
the member asked for the claim scenes to go dark -

> "để nó nền dark với blur glow như intro -> vừa dễ transition và vừa giữ đc style"

- and it is *better*, because the whole piece then rides one continuous branded ground instead of
strobing light/dark/light. **Pick the transition first, then the palette.** Slide -> navy is free
and preferable. Dissolve -> you still need the light preset below.

Layer A identity is untouched either way.

```css
--bg:#EFF3F8; --surface:#FFF; --border:rgba(14,18,32,.10);
--text:#0E1220; --text-muted:#5C6377; --placeholder:#E1E6EF;
--sem-critical:#D92D20; --sem-warning:#DC6803; --sem-success:#039855;
```

Tune `--bg` to the capture's window backdrop (here #EEF4F6). A second light piece has now been
built (`outputs/checkup-15s`), so this palette is confirmed and should be promoted into
`references/brand.css`.

**Severity chips - the recipe below is CORRECTED.** This file previously said an 11% tint with
the *solid* token as text measured 4/4 AA. That is wrong, and `checkup-15s` failed on it:
`hyperframes check` measured **Critical 4.09:1** and **Warning 3.06:1** against the 4.5:1 AA
floor. (The earlier "4/4" was never a measurement of severity chips - `checkup-hero` renders no
severity chip anywhere; its only chips are neutral `--text` on white.) The solid semantic tokens
are simply too light to sit on their own tint. Darken the ink toward `--text`, still derived from
the token so a rebrand still works:

```css
.chip-critical { color: color-mix(in srgb, var(--sem-critical) 68%, var(--text));
                 background: color-mix(in srgb, var(--sem-critical) 12%, var(--surface)); }
.chip-warning  { color: color-mix(in srgb, var(--sem-warning) 52%, var(--text));
                 background: color-mix(in srgb, var(--sem-warning) 12%, var(--surface)); }
/* an amber banner needs it too: 46% warning / 54% text on a 9% tint */
```

Measured after the change: **28/28 text checks pass**. Never eyeball a tint-on-tint chip - the
failure is invisible at thumbnail size and `npx hyperframes check` is free.

## 6. Approve before rendering

Renders are ~2.5 minutes and every framing or copy mistake costs a full one. `checkup-hero`
burned five. Before the first render, put in front of the member:

1. a **contact sheet of the first frame of every cut** (framing + what each beat shows), and
2. the **copy list** - intro, each explainer headline/subhead, outro.

Both are cheap to produce and are where all three rebuilds originated.


## 7. Joins into a recording - the half-handoff

The transition grammar is **not footage-specific** and does not live here: read
`style-guide.md` -> Transitions (the handoff, the match cut, the crossfade tiers). It applies
identically to a piece that is 100% vector with no recording in it at all. Only the constraint
below is particular to footage.

**A recording is fixed geometry.** Nothing inside it can be moved, so a join *into* footage can
never be a full handoff - there is no incoming element to launch from the outgoing one's exit
point. Do the half that is available:

- give the outgoing mock element a real **travel** to the position and scale its counterpart
  occupies in the incoming cut's **first frame** (measure it - don't eyeball), then
- bring the footage scene in from that same transform rather than from a neutral `scale 1.02`.

That converts a dissolve into a near-handoff, which is the best the material allows. A join *out
of* footage into a vector claim scene has the same limit in reverse: choreograph the incoming
element to launch from wherever the footage's last frame left the eye (the cursor, the panel that
just changed), which you *can* control.

**`checkup-hero` v3 does none of this** - all 12 of its joins are one uniform 0.30s crossfade
(`scale 1.022 -> 1, blur 13px -> 0, power2.out` applied in a single `forEach`), so a cut inside a
beat feels identical to a chapter break between beats. Known gap, not a bug; it is a timeline-only
fix that needs no re-cutting.

**`outputs/checkup-15s` closes the tiering half of that gap** - it ships three *different* joins
(push in 0.32s into evidence, pull back 0.45s into a claim) rather than one uniform crossfade.
Copy its join table, not `checkup-hero`'s.

**Do NOT redraw the app to force a match cut into footage. Tried, rejected, do not retry.**
`checkup-15s` r1 mocked the editor chrome at f2's measured geometry (top bar 0..96, icon rail
x 8..64, Page Checkup panel x 80..556) so the mock would *become* the product across the cut. It
half-worked - the panel, rail and top bar do land on their real counterparts - and the member
killed it anyway, on two grounds that generalise:

> "vốn vẽ lại nó cũng không khớp đc rồi ý" - a redraw can never *actually* match. Close is worse
> than different: the r1 join renders "Flymate" twice, ~45px apart, because the mock's top bar and
> the real one disagree by that much. The eye reads a near-miss as a defect; it reads an honest
> dissolve as a cut.

> The beat was **redundant**. The footage before it already showed the fix landing ("footage trước
> đã cắt rất tốt đoạn move element vào như 1 dạng fix rồi"). A claim scene that re-states what the
> previous cut just proved is dead time however well it is drawn.

The replacement is the rule: **a claim scene between two cuts should be SHORT and should carry the
one thing the footage cannot say.** `checkup-15s`'s bridge is 2.2s, has no chrome at all, and says
only "the finding is now closed, so scan again" - which is precisely the promise the next cut keeps.
Match cuts still belong in the kit for *vector-to-vector* joins; against a real recording, prefer an
honest crossfade plus a short, non-redundant claim.

## 8. The kit's rules were written loop-first - re-check them against a linear piece

Three times now a rule stated as universal turned out to be loop-only, and each was found by
shipping something wrong rather than by reading:

| rule as written | what a linear piece actually needs |
|---|---|
| "navy opaque on every scene" | the ground may be the light Layer B when the footage is a light app UI |
| "entrances only; exits on the loop tail" | choreographed **exits are required** - they are half of a handoff |
| "footage piece is 1920x1080" | the canvas comes from the capture; 1920 was one case, not a rule |

Before authoring, read the hard rules in SKILL.md and `style-guide.md` asking *"was this written
for a 10s seamless loop?"* of each one. Fix any you find here rather than working around it -
the loop assumptions are exactly the ones that look harmless until the piece is on screen.

## 9. One continuous ground - clusters travel, footage slides

The alternative to a light preset (section 5), and the better default when the piece is
brand-first. `outputs/checkup-15s` r4 is the reference.

**The model.** A single navy `#ground` scene spans the whole composition and owns the two blur
glows. Every animated beat is a *transparent cluster* on that ground. Only the footage is opaque.

- **Footage moves VERTICALLY** - slides up from the bottom to cover, back down to uncover.
- **Clusters move laterally, or off the footage's exit edge, and NEVER fade.** The ground is
  already correct underneath them, so there is nothing to fade between; a cluster swap is pure
  travel. Keep the two axes separate or the joins start reading alike.
- **Honour the handoff on cluster swaps** (style-guide -> Transitions): the card exits by the LEFT
  edge and the findings enter from the LEFT 0.40s later; f1 exits DOWNWARD and the bridge launches
  from BELOW. Same edge, small delay - the eye never has to re-find the subject.

**This deliberately breaks SKILL.md hard rule 2** ("give each card scene the ground itself, never a
transparent div over a shared bed"). That rule exists because a *crossfade* between transparent
scenes stacks two of them and reads muddy. No cluster here is ever crossfaded, so the failure it
prevents cannot occur - and a shared ground is the only way glows can **travel across a beat
boundary** instead of restarting at it. Do not "fix" it back; check whether anything crossfades first.

**Glow choreography is loop-critical.** Arrangements must return to the first one by the end.
`checkup-15s` uses three: A at frame 0, A->B *on screen* during the first cluster swap (this is the
member's "2 cục glow đổi vị trí"), then B->C behind f1 and C->A behind f2 - both **free, because
footage is covering the ground**. Only one glow move costs screen time; the rest hide inside cuts.

**Re-measure chips after a palette swap, never port the recipe.** On the light preset the severity
ink had to be *darkened* toward the text colour; on navy the same chips need it *lightened* toward
white over a deeper tint (`color-mix(sem 40%, #FFF)` on `color-mix(sem 22%, --navy-surface)`).
Same idea, opposite direction. Both were measured with `hyperframes check`, not eyeballed.

**Tween a cluster's CHILDREN, never the wrapper - and `set()` them off-frame at t=0.** A cluster
that travels as one rigid block reads as a slide transition instead of as objects with mass; the
children stagger 0.04-0.07s. Because each child then sits at its resting position until its own
tween fires, they must be parked off-frame from frame 0 or the headline is visible dead-centre
while the card is still flying in. Full rule, both traps and the exit case:
`style-guide.md` -> Overlap / follow-through.

**A cluster you translate must BE the stage, not be wrapped in one.** Wrapping the lockup as
`.stage > #card-in > .stage` made the inner absolutely-positioned stage a child of a shrink-to-fit
flex item; it lost its width and the lockup rendered as a narrow wrapped column *only while
exiting*. Static frames looked perfect. Give the translated element `class="stage"` directly.

## 10. Looping without a veil - return to frame 0's state

A linear piece ends on a dead frame. Section 4 says a footage piece "is linear, not a loop" and
that frame 0 need not match the last frame - **that is a limitation, not a law**. The member's
brief:

> "để cảnh outro kiểu này xong nó cũng lấn lên open thành intro -> thì video sẽ loop đc"

**The principle.** Open on a card that is completely STATIC, take it away, bring it back untouched,
and land every travelling thing - the glows above all - back on its opening arrangement. The last
frame is then the first frame and the piece loops forever, with no `loop-tail` veil anywhere.

**The mechanism is section 9** (one ground, transparent clusters, footage sliding). Build it from
there and from `components/loop-ground.html`; this section is only the four things that make the
SEAM hold, each of which cost a render on `outputs/checkup-15s`.

1. **The card must be TWO clip-windowed twins, not one long scene.** A single scene spanning the
   whole piece sits under the footage for most of the runtime and `check` *errors* on it (sustained
   occlusion - the kit's own "every scene a later scene covers needs a clip window" rule biting).
   Two static twins with identical markup, windowed to the open and the close, keep the seam exact
   and the checker quiet.
2. **Both twins go BEFORE the footage in the DOM.** Placed after it, the close twin paints on TOP
   of the falling clip and the card *pops in* rather than being revealed. Caught at t=13.75, where
   the card was already whole while the payoff cut still had 0.57s of clip window left.
3. **Nothing on the card may animate - not even a breathing glow.** Across two twins any tween
   would have to be at an identical phase in both for the seam to hold; static is the only version
   of that which is provable. Spend the motion budget on the clusters instead.
4. **The travel IS the incoming beat's entrance.** Give an arriving cluster fade-in tweens and they
   fire *after* it lands, so the move reveals an empty panel - the exact opposite of the intent.
   Draw it fully and let the travel carry it; animate only what should look alive (a dial still
   counting up as the panel arrives). "Move, don't fade", applied to a whole beat rather than one
   element.

**Proving the seam.** Do not eyeball it. Export frame 0 and the final frame and measure:

```bash
ffmpeg -i out.mp4 -vf "select=eq(n\,0)" -frames:v 1 -y f0.png
ffmpeg -sseof -0.02 -i out.mp4 -frames:v 1 -y fN.png
ffmpeg -i f0.png -i fN.png -lavfi psnr -f null -    # expect >40dB
```

`examples/loop-ground/` lands at **48.6 dB**, i.e. H.264 dithering on the navy gradient and nothing
else. Anything below ~40 dB means something really did move.

**Budget the card honestly.** It is on screen twice, and only the loop makes that add up: 1.55s at
the head plus ~0.45s at the tail reads as ~2.0s of continuous card *once it loops*, but a
first-time viewer only ever gets the 1.55s. Cap the card's copy to what 1.55s buys - a lockup, not
a paragraph.

### Superseded: the sliding "deck"

The first working version parked EVERY content scene in one `#deck` wrapper that slid up over a
static card and back down. It loops correctly and the four rules above were learned on it, but it
is **replaced by section 9 and should not be rebuilt**: a single deck forces every beat to share
one ground-relative position, so the glows cannot travel between beats, and the moment any beat
wants the same navy ground as the card the slide becomes invisible (navy over navy, with the card's
text clipped by an edge that is not there). Section 9's ground does the same job without either
limit.

## 11. Never push in on the payoff cut

`checkup-15s` r1 eased the final cut from `scale 1 -> 1.09` over the 91 reveal, on the style-guide's
"reserve one slow move per piece". It was the wrong shot to spend it on:

> "đừng có zoom in tự dưng cái điểm neo ng dùng đang đọc bị thay đổi do khung hình phóng to lên
> trông kì vãi ... đừng zoom in scene cuối trông slop lắm"

A slow push is for a shot the viewer is *scanning* (checkup-hero pushes onto a FlyMate answer to
make it readable). The payoff shot is one the viewer is *reading a number off* - moving the frame
drags the anchor out from under them. **Hold it dead still and let the number land.**

Holding costs footage you may not have: the source gave only 1.73s after the score flipped. Buy the
rest with a clone-freeze rather than cutting the hold short, and put the freeze on a shot where
nothing but the cursor moves:

```bash
-vf "crop=...,scale=...,tpad=stop_mode=clone:stop_duration=1.10"
```
## 12. Open scope - audio

`checkup-hero` is silent, which is correct for its placement: a landing-page hero autoplays muted.
The same cut reused on YouTube, LinkedIn or in-app would need a music bed and probably VO, and the
beat boundaries above are where music cues belong. HyperFrames handles both (`hyperframes-media`
for TTS); nothing about this structure precludes it. Decide placement before assuming silence.

