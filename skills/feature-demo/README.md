# feature-demo

A Claude / agent **skill** that turns a real UI screenshot into a polished,
brand-framed feature-demo image: an App Store hero, a social tile, a "What's
New" modal, a blog header. It picks the layout, writes the heading and bullet
pills, and renders the screenshot inside a designed frame with a background glow
and an optional logo.

**The screenshot is pass-through pixels.** It is embedded unchanged. The agent
*looks* at the image to decide the layout, but never feeds it through a model to
redraw or regenerate it. What you ship is your real UI.

---

## What it looks like

![Analytics + AI translation, side-by-side device duo](./preview/analytics-translation-duo.png)

![Heatmaps hero with overlapping device duo](./preview/heatmaps-device-duo.png)

Four templates (`hero-stack`, `hero-split`, `feature-callout`, `product-card`)
× theme (dark / light) × size (16:9 hero, 1:1 social, 16:9 modal). A desktop +
mobile screenshot pair automatically becomes a "device duo".

> The examples above use the `pagefly` preset. The default `neutral` preset
> renders with a brand-agnostic palette and no logo.

## What makes it more than a prompt

Three things the skill applies every time, which is where the difference between
a usable asset and a cramped one actually lives:

- **A fit-check before rendering, not after.** The usual failure is a render
  that technically succeeded and is unusable: a 1:1 tile whose heading needed
  twenty-eight characters and got sixty, a 16:9 hero holding one tall portrait
  screenshot with half the canvas dead. The skill compares the real copy length
  and screenshot orientation against the target size first and names a specific
  fix, rather than shipping the cramped version and letting you discover it.
- **Framing rules per screenshot shape, already decided.** A single landscape
  shot renders contained and padded with all four corners rounded. A shot
  enlarged to bleed off an edge drops the radius on that edge only, so the cut
  reads as deliberate. A square canvas forces `hero-stack --variation=top`, the
  one template whose image frame follows the image's own aspect ratio, so
  neither a portrait nor a landscape source gets cropped.
- **One option, not a fan-out.** The agent commits to a layout and gives one
  reason for it, instead of rendering four variants and handing the judgement
  back to you. You drive the iteration from there.

## Not for

Art drawn *around* a screenshot - vector panels, score rings, annotation lines.
That is [`illustra`](../illustra), which draws the illustration inside a card.
Anything that moves is [`anima`](../anima). And nothing here generates imagery:
the screenshot is yours, the frame is code.

## Requirements

- Node.js >= 18
- One Playwright Chromium download, for PNG mode
- A Figma MCP connection, only for Figma mode and optional

## Install

Ships as part of [pd-agent-skills](../../README.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

Then this skill's renderer dependencies:

```bash
cd skills/feature-demo
npm install
npx playwright install chromium
```

In Claude Code: `/feature-demo <feature-spec-path> <screenshot-path>`.

## Render

Two ways out:

- **PNG** via Playwright headless Chromium - a file, instantly.
- **Figma** via the Figma MCP - editable nodes you can fine-tune by hand.

Driving the CLI directly, without an agent:

```bash
npx tsx scripts/run-render.tsx png \
  --template=hero-stack --variation=top \
  --screenshots=path/to/desktop.png,path/to/mobile.png \
  --theme=dark \
  --heading="Your headline" \
  --bullets="First point,Second point,Third point" \
  --size=1600x900
```

- `mode` (first arg): `png` | `figma` | `paper`
- `--template`: `hero-stack` | `hero-split` | `feature-callout` | `product-card`
- `--variation`: `top` / `bottom` / `left` / `right` / `upper` / `lower`, per template
- `--screenshots`: comma-separated paths, max 3
- `--theme`: `dark` | `light`
- `--size`: `WIDTHxHEIGHT` or a preset (`app-store` 1600x900, `modal` 1200x675, `social` 1080x1080)
- `--pair`: `overlap` (default) | `beside`, only for a desktop + mobile duo

Output lands in `outputs/`, which is gitignored.

## Brand

Branding lives in **presets**, selected by the `FEATURE_DEMO_BRAND` environment
variable. The default is `neutral`: a brand-agnostic slate and blue palette with
no logo, so the skill works for anyone out of the box.

```bash
FEATURE_DEMO_BRAND=pagefly npx tsx scripts/run-render.tsx png ...
```

To add your own:

1. Copy `presets/neutral.ts` to `presets/<yourbrand>.ts` and edit the colours,
   fonts, radii and `glowPalette`.
2. For a logo, drop two PNGs into `assets/logos/` and point at them:
   `logo: { light: 'yours-blue.png', dark: 'yours-white.png' }`. Leave
   `logo: null` for none.
3. Register the preset in the `presets` map in `brand.ts`.
4. Run with `FEATURE_DEMO_BRAND=<yourbrand>`.

Fonts: the repo ships Poppins, under the SIL Open Font License and free to
redistribute. To use another, replace the `.woff2` files in `assets/fonts/` and
update the `@font-face` and `fonts.check` references in
`renderers/shared/html-shell.ts` and `renderers/playwright-renderer.tsx`.

## Layout

```
brand.ts       picks a preset from FEATURE_DEMO_BRAND (default: neutral)
presets/       brand token sets - neutral, pagefly, your own
types.ts       Zod schemas (AssetSpec, BrandTokens, ...)
templates/     the 4 layout recipes (PNG component + Figma intent builder)
renderers/     playwright (PNG), figma (MCP plan), paper (stub)
scripts/       run-render.tsx (CLI), agent-entry.tsx (agent helpers)
prompts/       the sub-prompts: pick a template, write the copy, read feedback
assets/        fonts, logos, decor, a placeholder screenshot
commands/      the /feature-demo slash command
```

## Data

Nothing environment-specific lives in this skill - no paths, no credentials, no
project identifiers. The exception is deliberate: `assets/logos/` and the images
in `preview/` are real PageFly material, kept as the worked example behind the
optional `pagefly` preset. They belong to their owner. Remove them if you are
not authorised to use them. Poppins, in `assets/fonts/`, is under the SIL Open
Font License 1.1 and ships freely.
