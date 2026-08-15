# anima

Một **skill** cho Claude / agent, làm ra một đoạn motion ngắn đúng brand: video
giới thiệu hoặc thông báo tính năng, một minh hoạ động, một hero động.

Nó không tự dựng lại bộ máy làm video. Toàn bộ phần đó - hợp đồng timeline,
chuyển cảnh, lint, render - giao cho
[HyperFrames](https://www.npmjs.com/package/hyperframes). Thứ anima thêm vào là
phần HyperFrames không thể biết: brand preset, gu chuyển động, và một bộ khối
dựng sẵn vốn đã chạy đúng nhịp.

[English](./README.md) · Tiếng Việt

---

## Trông như thế nào

![Thẻ tiêu đề đúng brand cắt sang bản quay màn hình thật](./preview/checkup-sharper.gif)

Đây là một footage piece: thẻ tiêu đề dựng từ các khối trong kit trên brand
preset, rồi crossfade mờ sang một đoạn quay màn hình thật mà không ra khỏi khung
PF. Ảnh GIF là chín giây đầu ở 12fps - [bản render đầy đủ](./preview/checkup-sharper.mp4)
mượt hơn và cho thấy trọn cú cắt.

## Ba lớp nó thêm vào

- **Brand preset** (`references/brand.css`) - token nhận diện, bảng màu badge,
  và bảng màu nền video. Đổi file này là đổi brand.
- **Gu chuyển động** (`references/style-guide.md`) - đây là sổ ghi kết quả huấn
  luyện chứ không phải sách hướng dẫn. Mỗi con số thời lượng trong đó đều là số
  đo từ một piece thật, kèm luôn con số đã bị loại: 0.14s bị chê là giật, chốt
  0.40s. Giữ khung dưới 2.5s thì mắt người xem rời đi trước khi cắt cảnh.
- **Bộ khối** (`components/`) - mười khối chuyển động mang sẵn cái gu đó: logo
  lockup, thẻ reveal, morph trước-sau, vòng điểm, tia quét, thanh nhấn, nền
  glow, cảnh footage, và mối nối loop-tail giúp video lặp lại mà không thấy chỗ
  cắt.

Có hai ví dụ hoàn chỉnh chạy được trong `examples/`.

## Không dùng cho

Ảnh marketing tĩnh - dùng [`illustra`](../illustra) cho phần minh hoạ trong một
thẻ, hoặc [`feature-demo`](../feature-demo) cho ảnh chụp đặt trong khung brand.

## Yêu cầu

- Node.js >= 22 và FFmpeg
- `hyperframes` qua `npx` (tự tải lần chạy đầu)

```bash
npx hyperframes doctor
```

Chạy cái này trước, nó báo ngay thiếu gì trước khi bạn mất công.

**Nếu muốn dựng piece mới** thì nên có thêm bộ skill HyperFrames, nơi chứa kiến
thức dựng mà anima giao lại. Bộ đó không đi kèm repo này. Cài một lần cho mỗi
máy, bằng cách tạo tạm một project rồi xoá:

```bash
cd /tmp && npx hyperframes init hf-bootstrap --example blank --non-interactive
ls ~/.claude/skills/hyperframes && rm -rf /tmp/hf-bootstrap
```

anima mang đủ quy ước để chạy được khi thiếu bộ đó, nhưng vì nó giao lại toàn bộ
luật máy móc, nên chất lượng sẽ giảm thấy rõ nếu không có.

## Cài đặt

Nằm trong bộ [pd-agent-skills](../../README-vi.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Render

```bash
npx hyperframes render <thu-muc>        # thu muc phai co index.html
npx hyperframes inspect <thu-muc> --at 1.5,4,7.25
```

Bắt đầu từ `templates/canvas.html` - khung trắng đã đúng brand. Lưu bản đang làm
thành `index.html` và để nguyên file template.

## Brand

Màu và font lấy từ `references/brand.css`; lớp nhận diện dùng chung nằm ở
[`_pf-brand`](../_pf-brand). Có một điểm riêng của skill này: renderer của
HyperFrames cần token nằm inline trong HTML của composition, nên preset được
chép vào `:root` của từng composition chứ không link tới. Đổi brand ở đây là
thao tác tay, không phải bật tắt bằng config.

## Ghi chú về khối footage

`components/footage-scene.html` dùng để cắt từ thẻ tiêu đề sang một đoạn quay
màn hình thật. Bản render hoàn chỉnh của piece dùng để đo ra các luật đó nằm ở
[`preview/`](./preview/checkup-sharper.mp4), nhưng composition chạy được thì
không đi kèm - riêng đoạn clip nguồn đã 27MB. Mọi thứ cần để tự dựng đều nằm
trong phần chú thích đầu file khối đó và mục "Footage pieces" của style guide.
