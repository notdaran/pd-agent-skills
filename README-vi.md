# pd-agent-skills

Bộ agent skill mình dùng cho công việc phát triển sản phẩm.

Một skill là một thư mục chứa hướng dẫn - kèm renderer nếu cần - để agent nạp
vào khi dùng tới. Chúng viết cho Claude Code, nhưng phần hướng dẫn là Markdown
thuần nên agent nào đọc được thư mục thì dùng được.

Điểm chung của chúng: mỗi skill gói lại một phần "gu" mà nếu không có thì lần
nào cũng phải giải thích lại từ đầu. Không phải kiểu "vẽ cho tôi một cái ảnh",
mà là mười sáu quy tắc bố cục, con số thời lượng đã đo thật, quy tắc không bao
giờ để model vẽ lại một ảnh chụp thật.

[English](./README.md) · Tiếng Việt

## Các skill

| Skill | Làm ra | |
|---|---|---|
| [`feature-demo`](./skills/feature-demo) | Ảnh chụp giao diện thật đặt trong khung brand: hero App Store, ảnh social, header blog | [readme](./skills/feature-demo/README-vi.md) |
| [`illustra`](./skills/illustra) | Phần minh hoạ bên trong một thẻ marketing: ảnh chụp đóng khung trộn với UI vector vẽ tay, xuất ra PNG nền trong suốt | [readme](./skills/illustra/README-vi.md) |
| [`anima`](./skills/anima) | Một đoạn motion ngắn đúng brand: teaser, video thông báo, hero động | [readme](./skills/anima/README-vi.md) |

[`_pf-brand`](./skills/_pf-brand) không phải skill - đó là phần nhận diện dùng
chung mà các skill hình ảnh đọc vào.

Ba cái có chỗ giáp ranh nhau, nên nói ngắn gọn cho dễ nhớ: ảnh chụp đặt vào
khung là `feature-demo`; vẽ thêm xung quanh ảnh chụp là `illustra`; cái gì
chuyển động là `anima`.

## Cài đặt

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

`install.sh` tạo symlink từng skill vào `~/.claude/skills/` và copy các lệnh
slash vào `~/.claude/commands/`. Vì là symlink nên `git pull` ở đây là các skill
đã cài tự cập nhật theo. Không bao giờ ghi đè cái đang có - thứ gì đã tồn tại
thì báo ra rồi bỏ qua.

Mỗi skill cần một bước chuẩn bị trước lần dùng đầu, readme của từng cái có ghi
và `install.sh` cũng nhắc lại:

```bash
cd skills/feature-demo && npm install && npx playwright install chromium
cd skills/illustra && npm install && npx playwright install chromium-headless-shell
npx hyperframes doctor             # anima: can Node >= 22 va FFmpeg
```

## Brand

Các skill hình ảnh là bộ máy không gắn brand, PageFly chỉ là preset mặc định
chứ không phải điều kiện bắt buộc. Muốn dùng brand của bạn thì đổi preset bên
trong skill: `presets/` với `feature-demo`, `references/brand.css` với
`illustra` và `anima`.

Chuyện này ở `feature-demo` đã đi xa hơn, nó có sẵn preset `neutral` chọn bằng
biến môi trường; còn hai skill kia hiện mới chỉ có bộ giá trị PageFly.
[`_pf-brand`](./skills/_pf-brand) ghi rõ chỗ nào đang bị trùng lặp.

## Giấy phép và tài nguyên

Phần code theo giấy phép MIT - xem [LICENSE](./LICENSE).

Logo PageFly và ảnh chụp sản phẩm trong các thư mục ví dụ thuộc về chủ sở hữu
của chúng, để đó làm ví dụ minh hoạ. Hãy xoá đi nếu bạn không được phép dùng.
