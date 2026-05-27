---
name: feature-demo
description: Sinh ảnh demo feature có brand-frame (App Store hero, social tile, blog header) từ screenshot UI thật. Render qua Figma MCP hoặc Playwright PNG. Screenshot UI thật là pass-through, không qua model nào tái tạo. Brand qua preset (mặc định neutral; pagefly là preset có sẵn). Dùng khi user muốn demo feature với screenshot thật + brand frame.
---

# Feature Demo Skill

Entry point: `/feature-demo` slash command → `commands/feature-demo.md` (copy vào `~/.claude/commands/` khi cài).

Cài đặt + chạy: xem `README.md`.

## Brand presets

Brand đọc qua `brand.ts` (selector). Mặc định preset `neutral` (brand-agnostic, không logo). Đổi preset bằng env `FEATURE_DEMO_BRAND`:

```
FEATURE_DEMO_BRAND=pagefly npx tsx scripts/run-render.tsx png ...
```

Tự thêm brand: tạo `presets/<name>.ts` export `BrandTokens`, đăng ký trong `brand.ts`, bỏ logo PNG vào `assets/logos/`, chạy với `FEATURE_DEMO_BRAND=<name>`.

## Files

- `types.ts` - DevInput / AssetSpec / BrandTokens schemas (Zod)
- `brand.ts` - Brand preset selector (đọc env `FEATURE_DEMO_BRAND`)
- `presets/` - Brand token presets (`neutral` mặc định, `pagefly`)
- `templates/` - Template recipes (4 templates: hero-split, hero-stack, feature-callout, product-card)
- `renderers/` - Figma + Playwright + Paper stub
- `prompts/` - System prompts cho pick-template / write-copy / classify-feedback
- `scripts/agent-entry.tsx` - Orchestrator helpers (pure Node, Zod-validated)
- `scripts/run-render.tsx` - CLI render tool (PNG/Figma plan)
- `assets/fonts/` - Poppins woff2 local (SIL OFL, redistributable)
- `outputs/` - Render artifacts (gitignored)

## Intent-first architecture (Phase 1)

Two render entry points trong `renderers/figma-renderer.tsx`:

- `buildFigmaRenderPlan(spec)` - template-routed. Caller picks `templateId` + `variation`, registry resolves intent.
- `buildFigmaRenderPlanFromIntent({ intent, size, fileName, frameName? })` - intent-first. Caller supplies `LayoutIntent` directly. Use for slot files / Phase 3 recipes.

Slot pattern (`slots/slot-N-*.ts`):
- Owns its own `spec` + `config` (fileName, size).
- Exports `slotNIntent: LayoutIntent` + `slotNConfig`.
- Phase 1 soft-migration: slot file still calls `templates[id].buildIntent(spec, brand)`. To deviate from template, edit slot file: replace template call with hand-authored regions or future recipe call (Phase 3).
- Driver script imports slot, calls `buildFigmaRenderPlanFromIntent`, writes outputs. Driver stays thin.

Region schema (`templates/shared/layout-intent.ts`) reserves `z?: number` + `anchor?: { ref, edge, offset }` for Phase 3 overlay anchoring. Phase 1 renderer ignores these (bounds are absolute).

## Prompts

Cả 3 prompt files dưới đây dùng khi main agent gọi sub-LLM trong `/feature-demo` loop:

- `prompts/pick-template.md` - Pick template + variation từ feature spec.
- `prompts/write-copy.md` - Sinh heading + bullets từ feature spec (Zod-bounded).
- `prompts/classify-feedback.md` - Phân loại user feedback thành 1 trong 8 intent (`DONE`, `CHANGE_TEMPLATE`, `CHANGE_VARIATION`, `CHANGE_COPY`, `CHANGE_MODE`, `CHANGE_SIZE`, `REJECT_BRAND`, `UNCLEAR`).

## Orchestrator entry

`scripts/agent-entry.tsx` expose pure-Node helpers cho slash command:

- `readFeatureSpec(path, repoRoot)` - đọc spec, validate path trong repo.
- `resolveScreenshots(paths, repoRoot)` - check exist, max 3.
- `parseSize(str)` - parse "WIDTHxHEIGHT" → `Size`.
- `buildAssetSpec(inputs)` - build + Zod-validate `AssetSpec`.
- `renderByMode(spec, outDir)` - dispatch PNG/Figma/Paper renderer.
- `PROMPT_PATHS` - hằng số trỏ tới 3 file prompt trên.
- `DEFAULT_OUTPUT_DIR` - mặc định `.claude/skills/feature-demo/outputs/`.

File **không** gọi LLM hoặc MCP. Mọi LLM call + MCP orchestration do main agent thực hiện trong slash command context.

## Hard rules

1. Screenshot UI thật phải là `<img>` pass-through: output nhúng nguyên pixel gốc. Agent ĐƯỢC tự xem ảnh để quyết định bố cục/khung hình, nhưng KHÔNG bao giờ đưa ảnh qua model để tái tạo/vẽ lại.
   - **1 screenshot ngang (single landscape)**: mặc định hiện ĐẦY ĐỦ, có khoảng đệm (padding) với mép canvas - KHÔNG để sát viền. Bo góc cả 4 góc. (Engine tự center + pad khi chỉ có 1 screenshot trong `hero-split`.)
   - **Cần zoom to chi tiết -> cho ảnh tràn mép**: nếu ảnh ngang cần phóng to tràn 1 mép để đọc rõ chi tiết, thì các góc CHẠM mép đó KHÔNG bo góc (cắt vuông) cho tự nhiên; góc còn lại vẫn bo. Cẩn thận không cắt mất content quan trọng. Đây là hành vi sẵn có của device-duo (phần tràn mép = cắt vuông off-canvas).
   - Device-duo (desktop+mobile): ảnh ngang ĐƯỢC phóng to tràn mép canvas (chỉ định vị, không vẽ lại - pixel vẫn gốc); ảnh dọc PHẢI hiện đầy đủ, không cắt phần quan trọng. Default cặp landscape+portrait = `hero-stack --variation=top` (trên-dưới); `hero-split` là phương án phụ khi user muốn trái-phải.
   - **Canvas vuông 1:1 (vd 1080x1080)**: LUÔN dùng `hero-stack --variation=top` (template duy nhất khung ảnh tự ôm theo tỉ lệ ảnh -> không crop portrait hay landscape). Copy phải NGẮN: heading ≤28 ký tự + ĐÚNG 1 bullet, font nhỏ vừa đủ để chừa ~70% canvas cho ảnh. KHÔNG dùng `hero-split` / `product-card` (crop ở bề ngang vuông) hay `hero-stack --variation=bottom` (ảnh dọc cao đẩy copy ra ngoài canvas). Engine tự ép `hero-stack/top` + cắt bullets còn 1 khi canvas vuông (an toàn nếu agent lỡ chọn sai).
2. Brand tokens immutable từ phía agent code. Chỉ human edit `brand.ts`.
3. Schema-validated I/O ở mọi step.
4. Agent hỏi output mode trước khi render. Không default.
5. Sau render: chờ user feedback, không auto-retry.
6. Mặc định render đúng 1 option. Agent tự chốt layout tốt nhất, KHÔNG fan-out nhiều phương án cho user chọn. Chỉ render nhiều khi user nói rõ muốn so sánh.
7. **Fit-check trước khi render (user thường là dev, không hình dung được layout)**: so input thực tế (độ dài copy + orientation/số lượng screenshot vừa xem) với dimension đích. Nếu lệch rõ ràng, KHÔNG render ra kết quả chật chội rồi thôi - tư vấn user 1 fix cụ thể trước. Các case điển hình:
   - Vuông 1:1 nhưng copy dài (heading >28 ký tự hoặc >1 bullet) -> tư vấn rút gọn copy.
   - Vuông 1:1 nhưng screenshot là ảnh dọc cao -> ảnh sẽ chiếm hết chiều cao, copy bị ép; tư vấn dùng ảnh ngang/contained hoặc đổi sang canvas dọc.
   - Hero 16:9 nhưng chỉ có 1 ảnh dọc cao -> canvas ngang sẽ trống nhiều; tư vấn thêm ảnh desktop hoặc đổi canvas vuông/dọc.
   - Heading quá dài ở mọi size -> tư vấn cắt (Zod chặn >60 ký tự).
   Nêu 2-3 dòng advisory + fix cụ thể, rồi để user chọn (sửa input hay cứ render với fallback an toàn). Không tự ý render khi mismatch rõ mà chưa báo user.

## Output modes

| Mode | Use case | Status |
|---|---|---|
| `figma` | Fine-tune trong Figma | Phase 02 |
| `png` | Dev cần ảnh nhanh | Phase 02 |
| `paper` | Future | Stub - throw "not configured" |

## Workflow

1. User cung cấp feature spec + screenshot path.
2. Agent hỏi output mode (figma / png).
3. Agent **tự xem screenshot** (Read tool) để biết orientation + feature nằm đâu trong khung.
4. Agent chốt 1 template + variation + viết copy theo brand (dựa trên những gì vừa thấy ở bước 3).
5. Render đúng 1 option -> output path.
6. (png) Agent tự mở output kiểm tra feature có hiện rõ / không bị crop; chỉnh tối đa 1 lần nếu cần, rồi mới show user.
7. Show 1 kết quả duy nhất + 1 dòng lý do chọn layout. Chờ user feedback. User drive iteration.

## Figma orchestration (for /feature-demo implementation in Phase 03)

Figma renderer là pure function: `buildFigmaRenderPlan(spec)` trả về `{ fileName, screenshotsToUpload, pluginCode, intent, canvas }` (pluginCode đã được minified để giảm token cost khi truyền vào `use_figma`). MCP calls phải chạy trong main agent context (subagent không có MCP).

### Session cache (giảm token cost)

Agent đọc `.claude/skills/feature-demo/outputs/.figma-session.json` qua `readFigmaSession()` từ `agent-entry.tsx`:

- `fileKey` + `fileUrl` - file Figma đã dùng lần trước
- `planKey` - team plan (không đổi giữa các render)

Hỏi user: dùng lại file cũ hay tạo mới? Nếu user cung cấp URL Figma trong natural language ("gen vào file ABC https://figma.com/file/XYZ"), parse qua `parseFigmaFileKey()` rồi save vào session.

Sau mỗi orchestration thành công: gọi `writeFigmaSession({ fileKey, fileUrl, planKey })`.

### MCP sequence

1. `mcp__figma__whoami` → lấy `planKey`. **SKIP** nếu session đã có `planKey`.
2. `mcp__figma__create_new_file({ fileName, planKey, editorType: 'design' })` → `{ file_key, file_url }`. **SKIP** nếu user dùng file có sẵn (session.fileKey hoặc URL từ user).
3. `mcp__figma__upload_assets({ fileKey, count: N })` → trả về N `submitUrl`. Với mỗi path trong `screenshotsToUpload`, POST file lên submitUrl tương ứng (multipart `file` field preferred); response chứa `imageHash`.
4. Build `IMAGE_HASHES = { [absPath]: hash, ... }`, prepend dạng `const IMAGE_HASHES = {...};` vào `pluginCode`. Optionally cleanup placeholder nodes mà `upload_assets` auto-create (node ids `1:2`, `2:2`, `3:2`...) bằng `figma.getNodeByIdAsync(id).remove()`.
5. `mcp__figma__use_figma({ fileKey, code: prepended, description })` → execute plugin. Limit 50K char.
6. **DO NOT call verify steps by default**: `mcp__figma__get_metadata` và `mcp__figma__get_screenshot` trả về response rất nặng (5-20K tokens). Chỉ gọi khi user explicitly yêu cầu verify hoặc render fail. User xem kết quả trực tiếp trong Figma file.
7. Return `file_url` cho user + gọi `writeFigmaSession()`.

### Natural language input

User không cần nhớ flag. Agent parse natural language để extract:

- Output mode: "png" / "ảnh" / "figma" / "vào figma"
- Figma file URL: bất kỳ link `figma.com/file/...` hoặc `figma.com/design/...` trong message
- Template: "hero stack", "hero split", "feature callout", "product card"
- Variation: "top/bottom/left/right/upper/lower"
- Heading + bullets: nếu user cung cấp text rõ ràng

Khi user cung cấp ĐỦ template + variation + heading + bullets, **SKIP** `pick-template` + `write-copy` LLM calls. Build AssetSpec trực tiếp.

Reference impl: Phase 02b Task 5 chạy manual cho hero-split verification (commit `ac1ade2`).
