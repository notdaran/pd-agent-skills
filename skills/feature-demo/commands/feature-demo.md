---
description: Generate feature-demo asset (PNG hoặc Figma) với brand preset, dùng screenshot thật.
argument-hint: <feature-spec-path> <screenshot-path> [--size WIDTHxHEIGHT]
---

# /feature-demo

Activate the `feature-demo` skill (`.claude/skills/feature-demo/`) to generate a brand-consistent demo asset for a feature. Brand comes from the active preset (`FEATURE_DEMO_BRAND`, default `neutral`).

<args>$ARGUMENTS</args>

## Usage

```
/feature-demo <feature-spec-path> <screenshot-path> [--size WIDTHxHEIGHT]
```

Examples:

```
/feature-demo plans/features/auto-translate.md screenshots/auto-translate.png
/feature-demo plans/features/auto-translate.md screenshots/auto-translate.png --size 1080x1080
```

## Behavior (mandatory order)

1. **Read** feature spec from `<feature-spec-path>`.
2. **Validate** screenshot path exists. If multiple comma-separated paths, max 3.
2b. **View the screenshot(s)** with the `Read` tool (they are image files). Assess: orientation (desktop/landscape vs mobile/portrait), how many real surfaces there are, and WHERE the feature being demoed lives in the frame (top bar, center, a side panel). This visual read drives template + variation choice in step 6 and tells you what must stay visible after framing. Viewing the image to decide composition is allowed - the rendered output still embeds the original pixels unchanged (see Hard constraints).
3. **Parse user message for shortcuts** (skip subsequent steps if found):
   - Output mode keyword (png / ảnh / figma)
   - Figma file URL (figma.com/file/... or figma.com/design/...) -> parse via `parseFigmaFileKey()`
   - Template name + variation
   - Explicit heading + bullets
4. **Ask user output mode** via `AskUserQuestion` ONLY if not parsed from step 3 - choices: `figma`, `png`, `paper`.
   - If user chose `paper` -> explain "Paper MCP chưa cấu hình", offer to fall back to `figma` or `png`.
   - If user chose `figma`: check `readFigmaSession()` for cached `fileKey`. If exists, ask "Dùng file cũ <fileUrl> hay tạo file mới?". If user provided URL in message, use that directly (skip ask).
5. **Handle size**: infer the size from where the asset will be used (its destination), so the user does not type dimensions. Map intent -> preset keyword passed to `--size`: in-app What's New modal -> `modal` (1200x675), App Store hero -> `app-store` (1600x900), social tile -> `social` (1080x1080). If no destination is given and cannot infer from spec, do NOT ask - default to 16:9 `app-store` (1600x900), render, and tell the user which size was used so they can correct it (reversible). Only ask if the message is genuinely ambiguous between two specific destinations. For a one-off size, pass explicit `--size=WIDTHxHEIGHT`.
6. **Pick ONE template + variation**: SKIP if user provided template + variation in step 3. Otherwise use `.claude/skills/feature-demo/prompts/pick-template.md` system prompt, informed by what you actually saw in step 2b (orientation, surface count, where the feature sits). Commit to a single best layout - do NOT generate several options for the user to choose from.
   - **Square 1:1 canvas (e.g. 1080x1080)**: always pick `hero-stack --variation=top`. It is the only template whose image frame sizes to the screenshot's own aspect ratio, so portrait AND landscape stay fully visible. `hero-split` and `product-card` crop at square width; `hero-stack --variation=bottom` pushes copy off-canvas with a tall portrait. Do not use them for square.
   - Screenshot composition (PNG) is automatic and orientation-aware: the renderer reads each image's real aspect ratio. A desktop (landscape) + mobile (portrait) pair auto-becomes a "device duo". In a duo the landscape shot is shown BIG (never shrunk) and may bleed off a canvas edge; the portrait shot overlaps in front and ALWAYS stays fully visible (never cropped - keep its key content intact). Same-orientation pairs cascade / sit side-by-side. Just pass the paths via `--screenshots` in any order.
   - Single screenshot (`hero-split`): shown fully contained, centered, with padding on both sides - never flush to the canvas edge. All four corners rounded. If a single landscape's detail is too small to read when contained, prefer pairing it with a second shot (duo, which bleeds to zoom) rather than cramming one shot flush to the edge.
   - When the input is a clear desktop + mobile pair, DEFAULT to ONE `hero-stack --variation=top` device-duo render: text on top, the big desktop below bleeding off the bottom, the mobile floating front-right. This top-bottom layout is the preferred answer for landscape+portrait pairs. Only use `hero-split` (text left, desktop bleeding off the right, mobile floating front-left) when the user asks for a side-by-side look or the mobile shot is very tall and reads better large in a side column. Do not spam alternatives - pick one.
   - Duo layout has two modes via `--pair`: `overlap` (default) = portrait sits in front of the landscape, top corners rounded, bottom bleeds off-canvas; `beside` = landscape + portrait side by side, equal height, a gap between, neither overlapping. Both give the portrait a vertical gradient ring + shadow. Pick `overlap` for a denser hero, `beside` when both shots must read cleanly with nothing covered.
7. **Write heading + bullets**: SKIP if user provided heading + bullets in step 3. Otherwise use `.claude/skills/feature-demo/prompts/write-copy.md`. Pass `size` so the prompt can apply its Square rule: at a square 1:1 canvas, output a SHORT heading (≤28 chars) + EXACTLY 1 bullet, leaving vertical room for the screenshot.
7b. **Fit check (advise before rendering broken results)**: the user is often a dev who can't picture the layout and may send inputs that don't fit the chosen dimension. Compare the copy length (step 7) and screenshot orientation/count (step 2b) against the target size. If they clearly conflict, DON'T silently render a cramped asset - surface a short advisory (2-3 lines) with the specific fix, then let the user pick (adjust input, or proceed with the safe fallback). Typical mismatches:
   - Square 1:1 + long copy (heading >28 chars or >1 bullet) → advise shortening the copy.
   - Square 1:1 + a tall portrait screenshot → the image eats the height and crams the copy; advise a landscape/contained shot or a portrait canvas.
   - 16:9 hero + only a tall portrait screenshot → the wide canvas is left mostly empty; advise adding a desktop shot or switching to a square/portrait canvas.
   - Heading >60 chars → advise trimming (Zod rejects it anyway).
   The engine self-protects at square (forces `hero-stack/top` + trims to 1 bullet), so if the user says "just render", proceed and note what was auto-trimmed.
8. **Build AssetSpec** matching `AssetSpecSchema` from `.claude/skills/feature-demo/types.ts`. Validate with Zod - if fails, retry copy generation once with tighter constraints.
9. **Render** by mode:
   - `png`: run `npx tsx .claude/skills/feature-demo/scripts/run-render.tsx png --template=<id> --variation=<v> --screenshots=<path-comma-list> --theme=<dark|light> --heading="<heading>" --bullets="<b1,b2,b3>" --size=<preset|WIDTHxHEIGHT> [--pair=overlap|beside]`. **Run this command directly, starting with `npx tsx`, with the screenshot path(s) inlined into `--screenshots=`. Do NOT wrap it in `cd …` or `IMG=…` (that re-triggers the permission prompt).** Flags are order-independent and all optional. `--pair` only applies to a desktop+mobile duo (default `overlap`). Pass heading/bullets from step 7 and the size preset from step 5 (`app-store` | `modal` | `social`, or explicit `1200x675`). Returns PNG path in `.claude/skills/feature-demo/outputs/`. **Render exactly ONE option** - a single `--template`/`--variation`. Only call this more than once with different templates when the user EXPLICITLY asks to compare layouts; never fan out by default. Never write throwaway driver `.tsx` files in `outputs/`.
   - `figma`: orchestrate Figma MCP calls per the sequence in `.claude/skills/feature-demo/SKILL.md` § "Figma orchestration". Use cached `planKey` from session if present (skip `whoami`). Use cached/user-provided `fileKey` if present (skip `create_new_file`). DO NOT call `get_metadata` / `get_screenshot` unless user asks for verify. After success: call `writeFigmaSession({ fileKey, fileUrl, planKey })`.
10. **Self-verify (png mode only)**: `Read` the rendered PNG and check the feature/key UI is actually visible and well-framed - not cropped off, not lost in a panel, the part you identified in step 2b is readable. If it reads poorly, adjust ONCE (different template/variation, fewer screenshots, or theme) and re-render before showing the user. Then stop adjusting. Skip this for figma mode (never call `get_screenshot` unless the user asks).
11. **Show output** path/URL to user as a single result, with a one-line note on the layout you chose and why. Invite the user to refine (copy/template/variation/size).
12. **Wait for feedback**. Classify via `.claude/skills/feature-demo/prompts/classify-feedback.md`:
    - `DONE` -> stop.
    - `CHANGE_TEMPLATE` -> re-pick (exclude current templateId), re-render.
    - `CHANGE_VARIATION` -> same template, pick other variation, re-render.
    - `CHANGE_COPY` -> re-fill heading/bullets per user delta, re-render.
    - `CHANGE_MODE` -> switch renderer with same AssetSpec, re-render.
    - `CHANGE_SIZE` -> re-build spec.size, re-render.
    - `REJECT_BRAND` -> REJECT politely. Reply: "Brand tokens locked. Sửa `.claude/skills/feature-demo/brand.ts` nếu cần update brand."
    - `UNCLEAR` -> ask user to clarify.

## Hard constraints

- Screenshot is `<img>` pass-through: the output embeds the original pixels unchanged. You MAY view the image yourself to decide composition/framing (steps 2b, 10), but never feed it to a model to recreate, regenerate, or redraw it.
- Device-duo framing exception: a landscape shot MAY be scaled up so part of it bleeds off a canvas edge (it is positioned, not redrawn - pixels stay original). The portrait shot MUST remain fully visible with its key content intact - never crop the portrait.
- Render exactly ONE option by default. Multiple renders only on an explicit user request to compare.
- Brand tokens locked in `brand.ts`. Never edit.
- Never auto-retry render. User drives the loop. (The single step-10 self-correction in png mode is not a retry loop - at most one adjustment, then show the user.)
- Never default the output mode. Always ask in step 4 unless parsed from user message.
- Never call Figma verify steps (`get_metadata`, `get_screenshot`) unless user explicitly asks.

## Context-saving notes

- Plugin code is minified by default in `buildFigmaRenderPlan()` to reduce `use_figma` payload size.
- Session cache (`outputs/.figma-session.json`) persists `fileKey` + `planKey` across renders. Reuse to skip `whoami` and `create_new_file`.
- When user provides template / variation / heading / bullets in natural language, SKIP `pick-template` + `write-copy` LLM calls.
- After verifying render works in early sessions, do not re-verify in subsequent renders.

## Files referenced

- Skill: `.claude/skills/feature-demo/SKILL.md`
- Prompts: `.claude/skills/feature-demo/prompts/{pick-template,write-copy,classify-feedback}.md`
- Schemas: `.claude/skills/feature-demo/types.ts`
- Renderer CLI: `.claude/skills/feature-demo/scripts/run-render.tsx`
- Orchestrator helpers: `.claude/skills/feature-demo/scripts/agent-entry.tsx` (incl. `parseFigmaFileKey`, `readFigmaSession`, `writeFigmaSession`)
- Session cache: `.claude/skills/feature-demo/outputs/.figma-session.json` (gitignored)
