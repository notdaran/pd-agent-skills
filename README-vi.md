# feature-demo-skill

Skill cho Claude / agent, biến screenshot UI thật thành ảnh demo feature có
brand-frame chỉn chu: App Store hero, social tile, modal "What's New", blog
header. Skill đặt screenshot vào một khung thiết kế sẵn kèm heading, bullet
pills, glow nền, và logo (tuỳ chọn).

**Screenshot là pass-through pixel** - nhúng nguyên gốc, không đổi. Agent được
*xem* ảnh để quyết bố cục, nhưng KHÔNG bao giờ đưa ảnh qua model để vẽ lại / tái
tạo. Cái bạn xuất ra là UI thật.

Render 2 kiểu:

- **PNG** qua Playwright (Chromium headless) - có file ngay.
- **Figma** qua Figma MCP - ra node chỉnh được trong Figma.

[English](./README.md) · Tiếng Việt

---

## Trông như thế nào

4 template (`hero-stack`, `hero-split`, `feature-callout`, `product-card`) ×
theme (dark / light) × size (16:9 hero, 1:1 social, 16:9 modal). Một cặp
screenshot desktop + mobile tự thành "device duo". Chạy thử rồi xem trong
`outputs/`.

## Yêu cầu

- Node.js >= 18
- Tải Chromium cho Playwright 1 lần (cho mode PNG)
- Kết nối Figma MCP (chỉ cần cho mode Figma - tuỳ chọn)

## Cài đặt

### Cách A - cài như skill của Claude Code (khuyến nghị)

Copy repo vào thư mục skills để có lệnh `/feature-demo`:

```bash
git clone https://github.com/notdaran/feature-demo-skill.git
mkdir -p ~/.claude/skills/feature-demo
cp -r feature-demo-skill/* ~/.claude/skills/feature-demo/
cp feature-demo-skill/commands/feature-demo.md ~/.claude/commands/feature-demo.md

cd ~/.claude/skills/feature-demo
npm install
npx playwright install chromium
```

Trong Claude Code: `/feature-demo <duong-dan-spec> <duong-dan-screenshot>`.

Nếu bạn dùng CLI [`skills`](https://www.npmjs.com/package/skills) và repo này để
public, có thể chạy:

```bash
npx skills add notdaran/feature-demo-skill
```

### Cách B - chạy độc lập (chỉ renderer, không cần agent)

```bash
git clone https://github.com/notdaran/feature-demo-skill.git
cd feature-demo-skill
npm install
npx playwright install chromium
```

## Cách dùng (CLI trực tiếp)

```bash
npx tsx scripts/run-render.tsx png \
  --template=hero-stack --variation=top \
  --screenshots=path/to/desktop.png,path/to/mobile.png \
  --theme=dark \
  --heading="Tieu de cua ban" \
  --bullets="Y mot,Y hai,Y ba" \
  --size=1600x900
```

- `mode` (arg đầu): `png` | `figma` | `paper`
- `--template`: `hero-stack` | `hero-split` | `feature-callout` | `product-card`
- `--variation`: `top` / `bottom` / `left` / `right` / `upper` / `lower` (theo template)
- `--screenshots`: nhiều path cách nhau bằng dấu phẩy (tối đa 3)
- `--theme`: `dark` | `light`
- `--size`: `WIDTHxHEIGHT` hoặc preset (`app-store` 1600x900, `modal` 1200x675, `social` 1080x1080)
- `--pair`: `overlap` (mặc định) | `beside` - chỉ áp dụng cho cặp desktop+mobile

Kết quả nằm trong `outputs/` (đã gitignore).

## Brand presets

Branding nằm trong **preset**. Mặc định là `neutral` (palette slate + xanh
trung tính, không logo) để ai cũng dùng được ngay. Đổi preset bằng env
`FEATURE_DEMO_BRAND`:

```bash
FEATURE_DEMO_BRAND=pagefly npx tsx scripts/run-render.tsx png ...
```

### Dùng brand của riêng bạn

1. Copy `presets/neutral.ts` thành `presets/<brand-cua-ban>.ts`, sửa màu, font,
   radii, và `glowPalette`.
2. Thêm logo: bỏ `logo-light.png` + `logo-dark.png` vào `assets/logos/` rồi đặt
   `logo: { light: 'logo-light.png', dark: 'logo-dark.png' }` trong preset. Để
   `logo: null` nếu không muốn logo.
3. Đăng ký preset trong `brand.ts` (thêm vào map `presets`).
4. Chạy với `FEATURE_DEMO_BRAND=<brand-cua-ban>`.

> Font: repo kèm sẵn Poppins (SIL OFL, được redistribute tự do). Muốn đổi font
> khác thì thay file `.woff2` trong `assets/fonts/` và cập nhật phần
> `@font-face` / `fonts.check` ở `renderers/shared/html-shell.ts` và
> `renderers/playwright-renderer.tsx`.

## Kiến trúc

```
brand.ts          -> chọn preset theo FEATURE_DEMO_BRAND (mặc định: neutral)
presets/          -> bộ brand token (neutral, pagefly, brand của bạn)
types.ts          -> Zod schema (AssetSpec, BrandTokens, ...)
templates/        -> 4 layout recipe (component PNG + intent builder cho Figma)
renderers/        -> playwright (PNG), figma (plan MCP), paper (stub)
scripts/          -> run-render.tsx (CLI), agent-entry.tsx (helper cho agent)
prompts/          -> sub-prompt agent dùng (pick template, write copy, ...)
assets/           -> font, logo, decor, screenshot placeholder
commands/         -> lệnh slash /feature-demo cho Claude Code
SKILL.md          -> manifest skill cho agent đọc
```

## Giấy phép

MIT (xem [LICENSE](./LICENSE)). Poppins theo SIL Open Font License 1.1. Logo
PageFly trong `assets/logos/` thuộc về chủ sở hữu, chỉ là preset `pagefly` tuỳ
chọn - gỡ đi nếu bạn không có quyền dùng.
