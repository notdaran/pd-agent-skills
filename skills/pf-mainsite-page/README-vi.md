# pf-mainsite-page

Một **skill** cho Claude / agent để dựng trang marketing bên trong một trình dựng
trang trực quan - lắp từ thư viện section mà site đã có sẵn, thay vì đo lại từ
đầu hay viết tay thành một khối HTML.

Đây là một phương pháp kèm một ví dụ thật. Không có bước build, không phụ thuộc
gì: một quy trình, năm file tham chiếu, và một thư viện section thật in ra đầy đủ
để bạn thấy một thư viện tốt trông như thế nào.

[English](./README.md) · Tiếng Việt

---

## Một trang dựng theo cách này

**[pagefly.io/pages/heatmap](https://pagefly.io/pages/heatmap)**

188 element gốc trải trên 7 section, một hero có video giới thiệu, và đúng một
khối custom HTML - khối đó chứa bảng so sánh, tức là trường hợp duy nhất skill
này cho phép dùng nó. Ngoài bảng đó ra, không phần nào của trang được viết tay
bằng markup.

---

## Ba kiểu hỏng mà nó sinh ra để chặn

**1. Trang ship dưới dạng một khối custom HTML to đùng.** Nó không thừa hưởng gì
từ site nên lạc thương hiệu. Không ai sửa được một chữ nếu không mở code. Không
phần nào tái dùng được. Hai trang trên store mà skill này viết cho đúng nghĩa đen
chỉ là một lớp bọc layout ôm hai khối HTML, trong khi trang chủ ngay bên cạnh
dựng từ hàng trăm element gốc.

**2. Trang nói sai về sản phẩm.** Copy marketing khẳng định một năng lực không tồn
tại, hoặc chép lại một comment code đã cũ như thể là luật hiện hành, hoặc lấy giá
trị seed của feature flag làm giá trị đang chạy thật. Trên một chợ ứng dụng thì đó
là rủi ro chính sách, không phải lỗi chính tả.

**3. Trang ship xong mà không có gì trỏ tới.** Những trang dựng kiểu đó gần như
không có lượt truy cập trong tuần sạch đầu tiên, không một click chuyển đổi, chỉ
vì không có link nội bộ nào. Việc gắn link tốn năm phút mà không ai xếp lịch.

## Quy tắc 0

**Mọi danh sách trong skill này đều là ảnh chụp một thời điểm; chỉ phương pháp là
bền.** Một skill ship kèm bản kiểm kê cũ còn tệ hơn skill không ship gì, vì người
đọc sẽ tin nó. Có đúng một ngoại lệ, và nó được ghi rõ là ngoại lệ.

## Quy trình

Mười chặng, mỗi chặng có người chịu trách nhiệm, đi từ "nội dung qua được lớp
content" tới danh sách khối, ánh xạ section, kiểm chứng khẳng định, spec, lắp
ráp, và link trỏ vào. Hai cổng chặn nằm trước bước lắp ráp, vì mọi sai lầm đắt
tiền đều xảy ra trước khi kéo thả bất cứ thứ gì lên canvas.

Vài điểm chính:

- **Mở thư viện trước khi đo bất cứ thứ gì.** Đo là để phục vụ đúng một trường
  hợp không thừa hưởng gì từ site: khối HTML viết tay. Không phải để dựng một
  trang lắp từ section có sẵn.
- **Nhận dạng layout bằng hình học, đừng đếm element.** Đếm chỉ cho biết section
  *chứa* gì. Cách đếm đã đọc nhầm một section cột icon thành bento, và một bento
  thành bảng so sánh, trong cùng một phiên làm việc.
- **Kiểm mọi khẳng định về sản phẩm ngược lại code**, và nhớ rằng comment trong
  code là ảnh chụp chứ không phải luật: xem nó viết khi nào và sau đó đã ship gì.
- **Viết đúng độ dài của chuỗi mà bạn đang thay.** Layout được thiết kế quanh
  đúng những chữ nằm trong nó; copy dài gấp đôi sẽ phá nhịp của khối kể cả khi mọi
  design token đều đúng.
- **Link trỏ vào là một phần của sản phẩm giao**, và cửa sổ đo bắt đầu từ ngày
  link lên sống, không phải ngày trang được publish.

## Thư viện section, dưới dạng ví dụ mẫu

Một file tham chiếu in nguyên một thư viện thật: tám section có tên, layout và số
đo của từng cái, những thứ thừa mà mỗi cái kéo theo khi chèn, khối CSS trang mà
hai trong số đó cần, và ngân sách số từ đo được cho từng ô chữ.

Thư viện của bạn sẽ không phải tám cái này. Nó nằm đó để bạn thấy cái khung: cột
nào xứng đáng có mặt, cái gì bền, cái gì phải đọc lại mỗi lần dựng. Mọi số đo
trong đó đều lấy từ các trang công khai.

## Trường hợp duy nhất vẫn cần custom HTML

Một bảng dữ liệu thật. Ngoài ra tất cả, và file nói rất kỹ chuyện này, đều nên
làm bằng element gốc, vì custom HTML rò CSS theo cả hai chiều, phớt lờ hệ thiết
kế, và không ai không biết code sửa được. Bộ quy tắc cho lúc buộc phải dùng nó
rất chặt, đáng đọc kể cả khi bạn không bao giờ dùng tới.

## Yêu cầu

- MCP server chrome-devtools, để điều khiển editor
- Quyền truy cập trình dựng trang và store mà bạn đang dựng

Không cần package Node, không có bước build. Đi cặp với `pagefly-browser-tester`,
skill giữ các quy tắc tự động hoá trình duyệt mà skill này dựa vào.

## Cài

Đi kèm bộ [pd-agent-skills](../../README.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Không dùng cho

UI bên trong app nhúng của Shopify admin: bề mặt khác, hệ component khác, luật
khác. Ảnh marketing, việc đó của `illustra` và `feature-demo`. Copy, giọng điệu,
nhắm ICP và lớp SEO/AEO, những thứ đó thuộc về lớp content mà bạn đang dùng:
skill này giả định copy đã được viết xong, và chỉ kiểm rằng các khẳng định trong
đó truy được về code.

## Dữ liệu

Không có thông tin đăng nhập, không URL admin, không số liệu truy cập. Thư viện
ví dụ có nêu tên section và layout của một trang marketing công khai, tất cả đều
đo lại được bằng cách mở chính trang đó.
