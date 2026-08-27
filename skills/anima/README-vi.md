# anima

Một **skill** cho Claude / agent, làm ra một đoạn motion ngắn đúng brand: video
giới thiệu hoặc thông báo tính năng, một minh hoạ động, một hero động, hoặc một
video giải thích tính năng nhiều nhịp dựng cùng bản quay màn hình thật.

Nó không tự dựng lại bộ máy làm video. Toàn bộ phần đó - hợp đồng timeline,
chuyển cảnh, lint, render - giao cho
[HyperFrames](https://www.npmjs.com/package/hyperframes). Thứ anima thêm vào là
phần HyperFrames không thể biết: brand preset, gu chuyển động, và một bộ khối
dựng sẵn vốn đã chạy đúng nhịp.

[English](./README.md) · Tiếng Việt

---

## Trông như thế nào

Hai dạng, cùng một bộ kit.

### Video giải thích tính năng, lặp liền mạch

![Video giải thích sản phẩm lặp liền mạch: thẻ brand, bảng lỗi tìm được, footage editor thật, điểm nhảy từ 84 lên 91](./preview/loop-ground.gif)

Mười lăm giây, năm nhịp, và nó lặp - khung hình cuối *chính là* khung hình đầu,
không cần tối màn để giấu chỗ nối. Chạy được:
[`examples/loop-ground/`](./examples/loop-ground) ·
[bản render đầy đủ](./preview/loop-ground.mp4).

### Footage piece

![Thẻ tiêu đề đúng brand cắt sang bản quay màn hình thật](./preview/checkup-sharper.gif)

Một thẻ tiêu đề cắt sang một đoạn quay màn hình.
[Bản render đầy đủ](./preview/checkup-sharper.mp4).

## Ba lớp nó thêm vào

- **Brand preset** (`references/brand.css`) - token nhận diện, bảng màu badge,
  và bảng màu nền video. Đổi file này là đổi brand.
- **Gu chuyển động** (`references/style-guide.md`) - đây là sổ ghi kết quả huấn
  luyện chứ không phải sách hướng dẫn. Mỗi con số thời lượng trong đó đều là số
  đo từ một piece thật, kèm luôn con số đã bị loại: 0.14s bị chê là giật, chốt
  0.40s. Giữ khung dưới 2.5s thì mắt người xem rời đi trước khi cắt cảnh.
- **Bộ khối** (`components/`) - mười hai khối chuyển động mang sẵn cái gu đó:
  logo lockup, thẻ reveal, morph trước-sau, vòng điểm, đồng hồ điểm, dòng lỗi đã
  gạch, tia quét, thanh nhấn, nền glow, cảnh footage, mối nối loop-tail, và
  `loop-ground` - cái này không phải một khối mà là bộ khung của cả composition,
  thứ giúp một video có footage lặp lại được.

Có ba ví dụ hoàn chỉnh chạy được trong `examples/`.

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

## Làm việc với footage thật

Dựng các nhịp hoạt hoạ cùng một bản quay màn hình là một nghề riêng, và đây là
chỗ mà làm bằng mắt gần như chắc chắn tốn nguyên những lần render. Toàn bộ nằm
trong `references/footage-pieces.md`: cách cắt khung sao cho không lòi nền cửa sổ
hay tab trình duyệt cá nhân, vì sao cảnh dẫn giữa hai đoạn quay phải ngắn và
không được nhắc lại điều đoạn quay trước đã chứng minh, và làm sao để một video
có footage lặp lại được.

`scripts/solve-crop.py` lo phần tính khung - `solve` tính ra vùng cắt sạch viền
trên toàn bộ độ dài của cú cắt (xét sắc độ chứ không xét độ sáng, vì các panel
trắng của chính app không phải là nền cửa sổ), còn `verify` chứng minh cú cắt đã
xong không lòi mép nào. Dùng cả hai; contact sheet không bắt được những thứ chúng
bắt được.

[`examples/loop-ground/`](./examples/loop-ground) chạy được và có kèm clip.
`components/footage-scene.html` vẫn là khối hai cảnh đơn giản hơn; piece dùng để
đo ra luật của nó nằm ở [`preview/`](./preview/checkup-sharper.mp4) nhưng không
chạy được ở đây - riêng clip nguồn đã 27MB.
