---
name: anima
description: Use when creating a short on-brand PageFly motion piece - an intro / teaser / announcement video ("New in PageFly: …"), a single animated illustration, or an animated hero. Orchestrates HyperFrames and layers on PF brand + motion gu + a kit of on-brand motion blocks, composed freely per case. Calls illustra when it needs a static PNG. Not for: static marketing images (use illustra / feature-demo); non-PF brands (swap the preset).
---

# anima

## Overview
One piece = a short on-brand motion artifact: an intro / teaser / announcement video, a single
animated illustration, or an animated hero. **HyperFrames makes the motion; anima makes it
look like PageFly.** This is a **design system, not a template library**: the reusable thing is
not one `index.html`, it is three composition-independent layers - brand tokens
(`references/brand.css`, with shared identity in `_pf-brand/`), motion gu
(`references/style-guide.md`), and a kit of on-brand motion blocks (`components/`) - composed
freely per case on `templates/canvas.html`. The Page Checkup intro is the first worked example
(`examples/before-after/`). Same model as `illustra` (kit + freeform compose + style-guide +
governance), ported from static art to motion. anima and illustra stay separate skills -
anima CALLS illustra when a case needs a static PNG; neither absorbs the other.

## Orchestrates HyperFrames - does not reinvent it
> Video machinery (composition structure, timeline contract, scene transitions,
> lint/inspect/validate, render): follow the **hyperframes** skill. This skill adds ONLY:
> brand preset (`references/brand.css`), motion gu (`references/style-guide.md`), component
> kit (`components/`).

No HyperFrames authoring rules are duplicated here (DRY - avoids drift on HF upgrades).

## When to use
- Producing a short on-brand PageFly motion piece:
  - an **intro / teaser / announcement** ("New in PageFly: ..."),
  - a single **animated illustration** (one concept animating),
  - an **animated hero** (a hero section in motion), or
  - a **footage piece**: an on-brand title card cutting to an existing real recording
    (screen capture, product demo).

  The first three are 1600x900 seamless loops. A footage piece is **1920x1080 and linear** -
  see `references/style-guide.md` -> Footage pieces before authoring one.
- The case has clear beats: an intro hold, an optional before/after morph, a single-feature hold.
  For an animated illustration / hero, the intro title-card (scene 1) is often dropped.

**Not for:** static marketing images (use `illustra` / `feature-demo`); a non-PF brand (swap
`references/brand.css` instead - the engine is brand-neutral, PF is just the default preset).

## Prerequisites (two tiers)
- **To render / re-skin a finished example:** npm `hyperframes` (via `npx`, auto-fetched on
  first run) + Node >= 22 + FFmpeg. **First action:** run `npx hyperframes doctor` and report
  any missing dependency before going further.
- **To author a NEW piece:** additionally the **hyperframes skill family** (authoring knowledge -
  timeline contract, transitions, QA). Those skills are user-global at `~/.claude/skills/` and are
  **NOT bundled in this repo** - cloning PageFly does not get you them. anima carries enough
  PF convention to proceed without them, but it defers ALL machinery rules to them, so author
  quality drops sharply if they are missing.

### First-time setup on a new machine
Run once per machine. Safe to re-run - all steps are idempotent.

```bash
npx hyperframes doctor                                   # 1. Node >= 22, FFmpeg, Chrome, memory
cd /tmp && npx hyperframes init hf-bootstrap \
             --example blank --non-interactive           # 2. installs the HF skill family
ls ~/.claude/skills/hyperframes                          # 3. verify: SKILL.md + references/
rm -rf /tmp/hf-bootstrap                                 # 4. throwaway scaffold, delete it
```

Notes:
- There is no dedicated "install skills" command. `init` scaffolds a project **and** installs the
  skills - per its own `--skip-skills` help text, *"init always checks AI skills against GitHub"*
  (verified on CLI v0.7.108; `HYPERFRAMES_SKIP_SKILLS=1` opts out). Hence the throwaway dir.
  Do NOT run `init` inside this repo - it would scatter a scaffold into the skills tree.
- `init` takes a project NAME, not a path - `cd` to the parent dir first, as above.
- It installs ~15 skills in one batch: `hyperframes`, `hyperframes-cli`, `hyperframes-media`,
  `hyperframes-registry`, plus the animation-library adapters (`gsap`, `animejs`, `css-animations`,
  `lottie`, `three`, `typegpu`, `waapi`, `tailwind`) and `website-to-hyperframes`.
- HyperFrames is **not** a Claude plugin - do not look for it in a marketplace.
- **Rendering needs network.** GSAP is loaded from `cdn.jsdelivr.net` (pinned 3.14.2) in
  `templates/canvas.html` and every example, matching the upstream hyperframes pattern. Offline
  renders fail.

## Workflow
1. **Intake the intent (ask first, then plan).** Before generating, ask the member a short
   brief - *what kind* (teaser / animated illustration / animated hero), *which scenes / beats*,
   *layout*, *transitions* - then show a one-paragraph plan to OK. If they say "just try it",
   skip the brief and proceed. The **intro title-card (scene 1) is optional** - drop it for an
   animated illustration / hero unless the case wants the "New in PageFly" framing.
2. **Understand the case** -> the message + which beats it needs (intro? before/after morph?
   single feature?). State it in one sentence: what is new and why it matters.
3. **Start from a stage.** Freeform new case -> copy `templates/canvas.html` (blank on-brand
   1600x900 stage, brand.css inlined, loop veil wired inert). A before/after -> start from
   `examples/before-after/` instead. Save the working file as **`index.html`** in the case's own
   dir (the HF CLI runs a dir's `index.html`; keep the committed `canvas.html` pristine).
4. **Pick blocks** from `components/` (index: `references/component-catalog.md`). Paste each
   block's markup into a scene and its `<!-- Timeline recipe -->` into the single `tl` timeline,
   rebasing offsets to the scene's enter time. Note any bespoke part you must build. Blocks that
   show assets (`logo-lockup`, `before-after-card`) expect an `assets/` dir beside your
   `index.html` - create it and copy the PF logo from `examples/before-after/assets/pf-logo.svg`,
   plus your own screenshot crops.
5. **Apply the gu** (`references/style-guide.md`): eases (vary >= 3 per scene), breathing glows,
   the loop-seam veil, pacing / beat anchors. Labels, eyebrows, and badges follow the shared kit
   (`_pf-brand/label-rules.md` + `_pf-brand/badges.html`) - Poppins, sentence case, soft badges via
   `var(--badge-*)`; never mono-caps eyebrows or metallic pills. Defer structural and timeline
   rules to the hyperframes skill.
6. **QA:** `npx hyperframes lint && npx hyperframes validate && npx hyperframes inspect`. Fix
   overflow, contrast, and H.264 banding. Use `npx hyperframes inspect --at 4.6,5.3` to pin
   specific beats.
7. **Render:** `npx hyperframes render`. Then **harvest** reusable parts - run the governance
   scan below.

## Hard rules
Mirror `references/style-guide.md`; defer the full video-machinery list to the hyperframes skill.
1. **Brand vars only.** Never hardcode a brand color / radius / shadow - always `var(--...)`;
   derive alpha tints from solid tokens via `color-mix(in srgb, var(--token) N%, transparent)`
   (glow tokens ship pre-baked), so swapping `brand.css` rebrands. Literal exceptions (per
   style-guide): fonts `"Poppins"` / `"JetBrains Mono"` (the
   renderer cannot resolve `var(--font-*)`); GSAP color tweens; SVG `stroke`; neutrals.
2. **Navy opaque on every scene.** No jump cuts - scene-to-scene is a blur crossfade over the
   opaque `--bg` (a hyperframes hard rule).
3. **Entrances only**, except the final beat. Animate IN every element (`gsap.from` / `fromTo`);
   exit tweens live solely on the loop tail.
4. **No emoji.** Iconography is hand-drawn - CSS dots, a drawn SVG check path, a green pill -
   never an emoji glyph.
5. **Deterministic.** No `Math.random()` / `Date.now()`; finite repeats only (never
   `repeat: -1`) - renders must be reproducible.
6. **Seamless loop (loop pieces only).** For a teaser / animated illustration / hero: glows start
   hidden and `#loopveil` fades to navy near T-end, so the final frame == frame 0. **A footage
   piece is linear, not a loop** - it still closes on the veil for a clean tail, but frame 0 and
   the final frame are not required to match.

## File map
| Path | Role |
|---|---|
| `.claude/skills/_pf-brand/` | **Source of truth** for brand identity tokens + badge palette + label rules (`brand-identity.css`, `badges.html`, `label-rules.md`). It is a SIBLING skill dir, not a subdir of anima - every bare `_pf-brand/` in this skill resolves to this path. Layer A + badges are synced from here into `references/brand.css`. Consumed by anima today; illustra still keeps its own fork at `illustra/references/brand.css` and does NOT read this file. |
| `references/brand.css` | Brand preset: Layer A identity + badge palette (synced from `_pf-brand/`) + Layer B video surface palette. **Swap to rebrand.** |
| `references/style-guide.md` | Motion gu: pacing, eases, glow, loop-seam, transitions, labels / badges, do/don't. **Training ledger** - append every refine. |
| `references/component-catalog.md` | Kit index + promotion governance + built-parts log. |
| `components/*.html` | Self-contained motion blocks (`pf-` prefixed): leading comment + scoped `<style>` + markup + a `<!-- Timeline recipe -->`. Paste into the case timeline. |
| `templates/canvas.html` | Blank on-brand 1600x900 HF stage; brand.css inlined, loop veil ready. Start here for a freeform case. |
| `examples/before-after/` | Page Checkup intro = worked example, parametrized via `data-composition-variables`. Start here for a before/after. |

Rendering is `npx hyperframes render` directly - no bespoke render script (unlike illustra's
`render.mjs` for Playwright PNGs).

## Governance - the training model ("don't redo it each time")
Every refine compounds into the shared layers, never into a throwaway file:
- tweak a brand color / glow -> `references/brand.css` (identity + badge palette live in `_pf-brand/`)
- change a label / badge taste -> `_pf-brand/label-rules.md` + `_pf-brand/badges.html`
- lock a new ease / pacing / technique ("modern PF") -> `references/style-guide.md`
- a block hand-built a second time -> **promote it into `components/`** via suggest + approve.

After each piece, scan what you hand-built against 3 criteria:
1. **Reusable** - a generic motion concept, not specific to this case's content. ("Would I
   plausibly build this again for a different feature?")
2. **Self-contained & parameterizable** - own markup + scoped CSS + a clean timeline recipe;
   accepts text / color / size.
3. **On-brand & clean** - var-only, follows the style-guide.

All 3 -> **PROPOSE** promoting it: a new `components/<name>.html` + a `component-catalog.md`
built-parts row (yes/no to the member; never auto-add, never ask them to judge technicals).
**Strong signal:** a part built a 2nd time almost always promotes. Keep the kit lean (YAGNI) -
do not seed a part until a real case needs it. Each use thickens kit + gu, so the next piece is
less work. Default gate = suggest + approve.
