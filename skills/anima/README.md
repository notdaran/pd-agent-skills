# anima

A Claude / agent **skill** that makes a short on-brand motion piece: an intro or
announcement video, a single animated illustration, an animated hero.

It does not reinvent video machinery. All of that - timeline contract, scene
transitions, lint, render - is delegated to
[HyperFrames](https://www.npmjs.com/package/hyperframes). What anima adds on top
is the part HyperFrames cannot know: a brand preset, a motion taste, and a kit
of blocks that already move the right way.

English · [Tiếng Việt](./README-vi.md)

---

## The three layers it adds

- **Brand preset** (`references/brand.css`) - identity tokens, badge palette,
  and the video surface palette. Swap the file to rebrand.
- **Motion taste** (`references/style-guide.md`) - a training ledger, not a
  manual. Every timing in it is a measurement from a real piece, with the
  rejected value recorded next to the shipped one: 0.14s read as a jolt, 0.40s
  shipped. A hold under 2.5s drew the eye away before the cut.
- **Block kit** (`components/`) - ten motion blocks that carry the taste with
  them: logo lockup, reveal card, before/after morph, score ring, scan beam,
  emphasis bar, glow background, footage scene, and the loop-tail seam that
  makes a piece loop without a visible cut.

Two worked examples ship in `examples/`, both runnable.

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

## A note on the footage block

`components/footage-scene.html` cuts from a title card to a real screen
recording. The piece its rules were measured on is not shipped - its media
weighs about 44MB. Everything needed to build one is in the block's own header
comment and the "Footage pieces" section of the style guide.
