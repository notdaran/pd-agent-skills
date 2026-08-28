# pagefly-browser-tester

Một **skill** cho Claude / agent để chạy kiểm thử end-to-end trên trình duyệt với
một app nhúng trong Shopify - loại app hiển thị bên trong Shopify admin, nằm sau
hai đến ba lớp iframe lồng nhau, đôi khi còn nằm trong một overlay max-modal phủ
lên trên tất cả.

Đây là một tấm bản đồ viết sẵn, không phải một framework. Chỉ một file markdown:
chọn công cụ nào và tại sao, sơ đồ các lớp frame, những cái bẫy tốn hàng giờ nếu
phải tự mò ra,
và một mẫu ghi tiến độ cho những lượt chạy đủ dài để đốt hết context.

[English](./README.md) · Tiếng Việt

---

## Quyết định quan trọng nhất

**Dùng chrome-devtools MCP. Đừng dùng Playwright** cho bề mặt này.

Cả hai công cụ đều với tới được mọi lớp frame. Khác biệt nằm ở chỗ khác, và đo
được:

- **Tốc độ.** Playwright MCP qua relay tiện ích trình duyệt mất **2 đến 6 phút
  cho mỗi lần đọc DOM**. Cùng thao tác đó chrome-devtools chỉ mất vài giây.
- **Click không bao giờ ổn định.** Mọi click gốc đều timeout ở mốc 5 giây tại
  bước "chờ phần tử đứng yên", buộc phải tự phát sự kiện chuột bằng tay cho tất cả.
- **`take_snapshot` xuyên qua cả ba lớp iframe** và trả về uid bấm được. Đây là
  năng lực duy nhất khiến quy trình này khả thi.

**Cách nhận biết:** hai triệu chứng đi cùng nhau - click timeout vì chờ ổn định,
đọc DOM tính bằng phút - nghĩa là relay là nút thắt. Đổi công cụ, đừng ngồi tinh
chỉnh nó.

## Bản đồ gồm những gì

| Chủ đề | Nội dung |
|---|---|
| **Sơ đồ frame** | Hai dạng: app iframe thường, và overlay max-modal mà các màn hình kiểu editor mở ra |
| **Điều hướng** | Vì sao reload hoặc dán URL sẽ giết WebSocket của tunnel và để lại trang trắng, cùng cách bấm xuyên qua thay thế |
| **Chuỗi hộp thoại** | Hộp thoại unsaved changes, khi nào nó bung, và luồng bấm nút nào tránh được |
| **Gọi API khác origin** | `evaluate_script` không gọi được API của app từ frame cha. Cách vòng: đọc `id_token` từ `src` của iframe rồi fetch bằng nó |
| **Độ tươi của snapshot** | uid hết hạn sau bất kỳ click hay điều hướng nào, mọi lượt chạy, không báo trước |
| **Bảng lỗi** | Mười một triệu chứng ánh xạ sang nguyên nhân, gồm cả những cái trông như chờ tải mà không phải |
| **Nối tiếp phiên** | Mẫu file tiến độ để một lượt chạy dài có thể tiếp tục ở phiên mới thay vì làm lại từ đầu |

## Yêu cầu

- Chrome khởi động kèm `--remote-debugging-port=9222`
- MCP server chrome-devtools
- Một development store Shopify đã cài app, và dev server đang chạy

Không cần package Node, không có bước build.

## Cài đặt riêng

Chép `config.example.md` thành `config.local.md` rồi điền store handle, app
handle, lệnh chạy dev server, tên database local và danh sách sản phẩm test.
Skill đọc file đó trước rồi thay vào các placeholder.

`config.local.md` nằm trong gitignore. Không có gì thuộc về môi trường riêng
được phép nằm trong `SKILL.md`.

Một điều đáng ghi vào đó: một store có thể có nhiều bản cài của cùng một app, mỗi
bản ứng với một dev app config, và chỉ bản nào có `client_id` khớp với thứ dev
server đang chạy mới nạp code local của bạn.

## Cài

Đi kèm bộ [pd-agent-skills](../../README.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Không dùng cho

Kiểm thử storefront. Skill này nói về bề mặt nhúng trong admin: frame lồng nhau,
App Bridge cướp phím tắt, overlay modal. Storefront công khai không có mấy vấn đề
đó, và Playwright dùng ở đấy hoàn toàn ổn.

## Dữ liệu

Không có gì thuộc về store cụ thể nằm trong skill này. Không store handle, không
app handle, không URL admin, không thông tin đăng nhập, không tên sản phẩm - tất
cả đều là placeholder, lấy giá trị từ `config.local.md` của chính bạn.
