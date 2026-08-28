# anima

A Claude / agent **skill** that makes a short on-brand motion piece: an intro or
announcement video, a single animated illustration, an animated hero, or a
multi-beat feature explainer cut against real screen recordings.

It does not reinvent video machinery. All of that - timeline contract, scene
transitions, lint, render - is delegated to
[HyperFrames](https://www.npmjs.com/package/hyperframes). What anima adds on top
is the part HyperFrames cannot know: a brand preset, a motion taste, and a kit
of blocks that already move the right way.

---

## What it looks like

Two shapes, same kit.

### A looping feature explainer

![A product explainer that loops: brand card, findings panel, real editor footage, a score moving 84 to 91](./preview/loop-ground.gif)

Fifteen seconds, five beats, and it loops - the last frame *is* the first frame,
with no fade-to-black hiding the seam. Runnable:
[`examples/loop-ground/`](./examples/loop-ground) ·
[full render](./preview/loop-ground.mp4).

### A footage piece

![An on-brand title card cutting into a real screen recording](./preview/checkup-sharper.gif)

One title card cutting into one screen recording.
[Full render](./preview/checkup-sharper.mp4).

## The three layers it adds

- **Brand preset** (`references/brand.css`) - identity tokens, badge palette,
  and the video surface palette. Swap the file to rebrand.
- **Motion taste** (`references/style-guide.md`) - a training ledger, not a
  manual. Every timing in it is a measurement from a real piece, with the
  rejected value recorded next to the shipped one: 0.14s read as a jolt, 0.40s
  shipped. A hold under 2.5s drew the eye away before the cut.
- **Block kit** (`components/`) - twelve motion blocks that carry the taste with
  them: logo lockup, reveal card, before/after morph, score ring, health dial,
  struck finding, scan beam, emphasis bar, glow background, footage scene, the
  loop-tail seam, and `loop-ground` - which is not a block but a whole
  composition skeleton, the one that makes a piece with footage in it loop.

Three worked examples ship in `examples/`, all runnable.

## Not for

Static marketing images - use [`illustra`](../illustra) for the art inside a
card, or [`feature-demo`](../feature-demo) for a screenshot in a brand frame.

## Requirements

- Node.js >= 22 and FFmpeg
- `hyperframes` via `npx` (fetched on first run)

```bash
npx hyperframes doctor
```

Run that first - it reports anything missing before you waste time.

**To author a new piece** you also want the HyperFrames skill family, which
carries the authoring knowledge anima defers to. It is not bundled here. Install
it once per machine as a side effect of scaffolding a throwaway project:

```bash
cd /tmp && npx hyperframes init hf-bootstrap --example blank --non-interactive
ls ~/.claude/skills/hyperframes && rm -rf /tmp/hf-bootstrap
```

anima carries enough convention to work without it, but it defers every
machinery rule to those skills, so output quality drops noticeably if they are
missing.

## Install

Ships as part of [pd-agent-skills](../../README.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Render

```bash
npx hyperframes render <dir>        # the dir must contain index.html
npx hyperframes inspect <dir> --at 1.5,4,7.25
```

Start from `templates/canvas.html` - a blank on-brand stage. Save your working
composition as `index.html` and leave the template alone.

## Brand

Colours and fonts come from `references/brand.css`; the shared identity layer
lives in [`_pf-brand`](../_pf-brand). One caveat specific to this skill: the
HyperFrames renderer needs tokens inlined in the composition HTML, so the
preset is copied into each composition's `:root` rather than linked. Swapping a
brand is a manual edit, not a config switch.

## Working with real footage

Cutting animated beats against a screen recording has its own craft, and it is
the one place where doing it by eye reliably costs you whole renders. It lives
in `references/footage-pieces.md`: how to frame a cut so it never leaks the
window backdrop or your own browser tabs, why the claim scene between two cuts
must be short and must not restate what the last cut proved, and how a piece
with footage in it can loop at all.

`scripts/solve-crop.py` does the framing arithmetic - `solve` computes a
border-free crop across a cut's whole duration (testing chroma, not brightness,
because an app's own white panels are not the window backdrop), and `verify`
proves a finished cut has no leak on any edge. Use both; a contact sheet will
not catch what they catch.

[`examples/loop-ground/`](./examples/loop-ground) is runnable and ships its
clips. `components/footage-scene.html` is the simpler block for a piece that is
one title card cutting into one recording.

## Data

Nothing environment-specific lives in this skill - no paths, no credentials, no
project identifiers. The exception is deliberate: `examples/` and `preview/`
ship real PageFly screen recordings and the PageFly logo as worked examples.
Those belong to their owner. Remove them if you are not authorised to use them.
