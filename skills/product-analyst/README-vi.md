# product-analyst

Một **skill** cho Claude / agent, dùng cho vòng lặp làm sản phẩm: biến một mục
tiêu còn mơ hồ thành chỉ số, theo dõi chúng, nhận ra khi có gì đó hỏng, tìm ra
hỏng ở đâu và vì sao, chọn cái nào sửa trước, và quyết định xem mức chắc chắn
cho quyết định đó có đáng bỏ tiền mua hay không.

Đây là một phương pháp, không phải một bộ render. Không cần build, không phụ
thuộc gì cả - sáu file reference chia theo giai đoạn, agent nạp từng file một,
kèm các mẫu truy vấn để điều khiển Mixpanel khi có kết nối. Không có Mixpanel
thì mọi thứ vẫn chạy trên số liệu dán thẳng vào chat.

[English](./README.md) · Tiếng Việt

---

## Sáu giai đoạn

Skill này định tuyến: nó nhận ra yêu cầu đang cần giai đoạn nào rồi chỉ nạp
đúng file đó, thay vì đổ ra toàn bộ framework nó biết.

| Giai đoạn | Trả lời câu hỏi |
|---|---|
| **0 Khung mục tiêu** | North Star là gì, cái gì làm nó dịch chuyển, cái gì không được phép tụt |
| **1 Theo dõi** | "Bình thường" trông ra sao, và ngưỡng nào thì phải đi kiểm tra |
| **2 Phát hiện** | Cú tụt này là thật, hay chỉ là lỗi tracking |
| **3 Chẩn đoán** | Hỏng ở đâu: nhóm người dùng nào, bước nào |
| **4 Ưu tiên** | Vấn đề nào mới thật sự lớn nhất, tính theo số người tuyệt đối |
| **5 Kiểm chứng** | Ở đây bằng chứng có đáng giá không, và nếu có thì phương pháp nào chạy nổi |

## Nó hơn một câu prompt ở chỗ nào

Tám điều bất di bất dịch được áp dụng ở mọi giai đoạn. Bốn cái làm đổi kết luận
nhiều nhất:

- **North Star là số tuyệt đối, không bao giờ là phần trăm.** Tỉ lệ chuyển đổi
  90% trên 10 người tệ hơn 30% trên 100.000 người. Skill không cho phép một tỉ
  lệ đứng thay cho giá trị thật đã tạo ra.
- **Loại trừ lỗi tracking trước khi tin bất kỳ cú tụt nào.** Giai đoạn 2 mang
  theo một danh mục những chuyện bất khả thi về mặt logic: WAU lớn hơn MAU, tỉ
  lệ chuyển đổi trên 100%, một bước phễu đông hơn bước trước nó, một phân khúc
  con lớn hơn tổng. Mỗi cái là một lỗi tracking cho đến khi chứng minh được
  ngược lại, và không được phép kể câu chuyện nguyên nhân nào trước khi con số
  sống sót qua vòng này.
- **Xếp hạng theo số lượng, không theo tỉ lệ.** Hỏng 60% trên 400 người là mất
  240 người; hỏng 12% trên 100.000 người là mất 12.000. Cái nghe kém kịch tính
  hơn thắng gấp 50 lần. Giai đoạn 4 quy mọi tỉ lệ về số tuyệt đối trước khi xếp
  hạng.
- **Quyết định CÓ nên đo hay không, trước khi quyết định đo bằng gì.** Xem dưới.

## Hai cái cổng đặt trước A/B test

Phần lớn lời khuyên về analytics coi việc chạy thí nghiệm là đích đến. Giai đoạn
5 dựng hai cái cổng chặn trước nó, vì thất bại thường gặp không phải chọn nhầm
kiểm định, mà là chạy một thí nghiệm vốn dĩ chẳng bao giờ trả lời được gì.

**Cổng 0 - ước lượng nhân quả ở đây có đáng mua không?** Nếu thay đổi này đảo
ngược được, sai thì rẻ, và kết quả cũng không làm bạn đổi bước tiếp theo, thì
câu trả lời đúng là *ship đi, nêu tên guardrail, đặt ngày review lại* - và nói
thẳng ra là mình đã chủ động chọn không đo. Đó là một câu trả lời hợp lệ, và
skill sẽ đưa ra câu đó.

**Cổng 1 - cổng cỡ mẫu.** Trước khi được phép nêu tên A/B, phải tính ra lượng
người dùng cần phơi nhiễm:

```
n mỗi nhánh  ~=  16 x p x (1 - p) / d^2      (power 80%, 95% hai phía)
```

Với baseline 0,5%, muốn phát hiện mức tăng tương đối 20% thì cần khoảng
**80.000 người mỗi nhánh**. Nếu sản phẩm không cung cấp nổi 160.000 lượt phơi
nhiễm trong khoảng thời gian chấp nhận được thì A/B **bị loại khỏi bàn** - không
phải "khó hơn", mà là loại. Skill nói thẳng điều đó thay vì đề xuất một thí
nghiệm mà sáu tuần sau kết thúc bằng một cái nhún vai.

Qua được hai cổng đó mới tới bảng phương pháp, xếp theo độ mạnh của bằng chứng
chứ không theo độ tiện: A/B, dừng tuần tự hoặc Bayesian, holdout và staged
rollout, difference-in-differences, interrupted time series, synthetic control,
và propensity score matching xếp cuối. Mỗi hàng đều phải nêu điểm chết của
chính nó - DiD vô hiệu nếu không vẽ giai đoạn trước đó ra và thấy hai đường đi
song song; PSM chỉ khử được confounder mà bạn quan sát được, và ghép cặp theo
propensity score có thể làm mất cân bằng nặng hơn chứ không nhẹ đi.

Nằm cạnh chúng là những cách thay thế rẻ tiền mà một thí nghiệm đủ mạnh hay lấn
át một cách vô lý: năm buổi usability test, một cái cửa giả, một ngày tự dùng
sản phẩm của mình.

## Không dùng cho

Điều tra tracking ở mức chi tiết - event nào bắn, bắn từ đâu, bắn mấy lần.
Skill này quyết định có nên tin một con số hay không; truy con số đó về tận chỗ
nó được bắn ra là việc khác.

Nó cũng không thiết kế sản phẩm hộ bạn. Số liệu chọn ra **cái gì** cần sửa; còn
**sửa thế nào** thì đến từ nghiên cứu định tính, và skill sẽ nhắc lại điều đó
liên tục.

## Yêu cầu

Không có. Không cần cài gì, không cần Node, không cần package nào.

Mixpanel MCP là tuỳ chọn. Có kết nối thì skill đề xuất đúng truy vấn cho từng
giai đoạn và hỏi trước khi chạy. Không có thì nó xin bạn dán số liệu vào rồi áp
dụng đúng phương pháp đó.

## Cài đặt

Đi kèm trong [pd-agent-skills](../../README-vi.md):

```bash
git clone https://github.com/notdaran/pd-agent-skills.git
cd pd-agent-skills
./install.sh
```

## Dữ liệu

Trong skill này không có gì gắn với một môi trường cụ thể. Không project ID,
không board ID, không domain, không con số thật - mọi ví dụ đều là bịa ra và
không gắn với sản phẩm nào. Thứ gì riêng của hệ thống bạn thì để trong config
nằm ngoài thư mục skill.
