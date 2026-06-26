# EcoKnot Gifting – Brand Guideline cho Thiết kế Website
**Tài liệu dành cho đội ngũ UI/UX & Developer (Antigravity)**
**Phiên bản:** 1.0 | **Ngày:** 2026-06-26

---

## Tổng quan
Brand Guideline này quy chuẩn hóa toàn bộ nhận diện thương hiệu EcoKnot Gifting khi áp dụng lên nền tảng website (dự kiến xây dựng trên Wix). Mọi quyết định thiết kế phải đồng thời thể hiện ba trụ cột định vị:
- **Cá nhân hóa trải nghiệm**
- **Tiêu dùng xanh (Sustainability-first)**
- **Thương mại điện tử hiện đại**

Tài liệu bao gồm các nguyên tắc về màu sắc, hình ảnh, trải nghiệm người dùng (UX), các thành phần giao diện đặc thù, và giọng điệu nội dung.

---

## 1. Định hướng Giao diện Thị giác (UI Design Direction)

### 1.1 Phong cách tổng thể
- **Tinh thần:** Mộc mạc, tinh tế, minh bạch – tránh bóng bẩy (glossy), neon hay hiệu ứng kính (glassmorphism).
- **Nguyên tắc:** Thiết kế phẳng (flat design), nhiều khoảng trắng, lấy cảm hứng từ vật liệu tự nhiên. Các nút bấm, khung viền được giữ đơn giản, hạn chế đổ bóng dày để đồng bộ với cam kết “không màng nhựa cán bóng” của sản phẩm vật lý.

### 1.2 Bảng màu (Color Palette)
Màu sắc được chuyển hóa trực tiếp từ chất liệu thân thiện môi trường mà EcoKnot sử dụng.

| Vai trò | Tên màu | Mã HEX gợi ý | Cảm hứng |
|--------|---------|---------------|----------|
| Nền chính (Background) | Natural Beige | `#F7F3ED` | Vải cotton, sợi bông tự nhiên |
| Điểm nhấn, nút CTA | Sage Green | `#8FAD88` | Hệ sinh thái xanh, lá cây |
| Khối phân cách, viền | Earthy Brown | `#B0927A` | Giấy kraft, carton tái chế |
| Văn bản chính | Charcoal | `#3E3E3E` | Mực in thân thiện |
| Nền phụ (nếu cần) | Soft White | `#FFFFFF` | Tương phản nhẹ, sạch |

> *Lưu ý: Mã màu trên là giá trị khởi tạo, đội thiết kế có thể tinh chỉnh sắc độ để đảm bảo tương phản và accessibility (WCAG 2.1 AA).*

### 1.3 Hình ảnh (Imagery)
- **Định dạng:** Ưu tiên ảnh chụp sản phẩm thực tế, độ phân giải cao, ánh sáng tự nhiên.
- **Nội dung bắt buộc:** Mỗi ảnh sản phẩm phải làm nổi bật chi tiết đóng gói xanh (giấy tổ ong, dây đay, giấy vụn tái chế) – không dùng màng xốp nổ trong ảnh.
- **Video:** Tích hợp video unbox ngắn (tối đa 15s) cho sản phẩm chủ lực, hiển thị ngay trong khu vực trưng bày.

### 1.4 Typography (Gợi ý)
- **Tiêu đề (Heading):** Sans-serif, dáng thanh mảnh, hiện đại (ví dụ: *Montserrat*, *Work Sans*). Ưu tiên độ dễ đọc.
- **Văn bản thân (Body):** Sans-serif, cỡ chữ tối thiểu 16px trên mobile, tương phản tốt (ví dụ: *Inter*, *Lato*).
- **Giọng chữ:** Thân thiện, gần gũi nhưng không mất đi sự chuyên nghiệp.

---

## 2. Trải nghiệm Người dùng Cốt lõi (UX Guidelines)

### 2.1 Mobile‑First & Frictionless
- Giao diện được thiết kế ưu tiên trải nghiệm trên điện thoại, sau đó mở rộng lên desktop.
- Giảm thiểu số bước thao tác để hoàn tất một đơn hàng. Các form nhập liệu tối giản, hỗ trợ autofill.
- Tốc độ tải trang (load time) phải đảm bảo dưới 3 giây trên mạng 4G.

### 2.2 Luồng mua sắm theo cảm xúc (Emotion‑based Shopping)
- Trang chủ **không** chỉ liệt kê danh mục sản phẩm khô khan.
- Phải có một khu vực cho phép khách hàng bắt đầu hành trình từ mục đích tặng quà: *“Cảm ơn”*, *“Xin lỗi”*, *“Động viên”*, *“Sinh nhật”*… Mỗi lựa chọn dẫn đến bộ sưu tập phù hợp.
- Thiết kế các “card” cảm xúc với icon/hình ảnh đại diện, ngôn ngữ nhẹ nhàng.

### 2.3 Trải nghiệm Tùy biến Trực quan (Customization Tool UX)
Đây là **“trái tim”** của website, không đơn thuần là nút “Thêm vào giỏ hàng”.

- **Luồng bắt buộc:**
  1. Chọn hộp quà (kích cỡ, chất liệu).
  2. Chọn sản phẩm bên trong (theo danh mục hoặc gợi ý của AI).
  3. Nhập lời nhắn, chọn font chữ, màu mực.
  4. Tải ảnh cá nhân (nếu muốn in lên thiệp/hộp).
  5. **Xem trước thiết kế (Live Preview)** trước khi thêm vào giỏ.
- Preview phải hiển thị chân thực nhất có thể (mockup 3D hoặc ảnh sản phẩm được overlay thông tin). Không cho phép bỏ qua bước Preview.

### 2.4 Phân luồng B2C và B2B Rõ ràng
- **Giao diện B2B riêng biệt**: Trang “Quà tặng Doanh nghiệp” phải có giao diện tối ưu cho nhu cầu số lượng lớn.
- Cho phép tải lên logo, chọn bảng màu thương hiệu, xem trước mẫu hộp quà có branding.
- Cung cấp form báo giá tự động, hiển thị ước tính chi phí theo số lượng.
- Khu vực quản lý đơn hàng B2B hỗ trợ nhập/xuất danh sách nhiều địa chỉ nhận.

---

## 3. Các Thành phần Giao diện Đặc thù (Special Components)

### 3.1 Digital Product Passport (Hồ sơ sản phẩm điện tử)
- **Vị trí:** Dưới mô tả sản phẩm hoặc trong tab riêng (không ẩn trong pop‑up phức tạp).
- **Hiển thị tối thiểu:**
  - Nguồn gốc xuất xứ (vùng nguyên liệu, nhà cung cấp).
  - Thành phần vật liệu chính.
  - Loại bao bì & khả năng phân hủy/tái sử dụng.
  - Các chứng nhận (FSC, organic…) dưới dạng icon nhỏ.
- **Giao diện:** Bố cục dạng thẻ (card) với các biểu tượng trực quan, tông màu Earthy Brown nhẹ.

### 3.2 Eco-metrics Dashboard (Bảng chỉ số môi trường cho từng sản phẩm)
- Mỗi trang sản phẩm phải có một khối nhỏ hiển thị các chỉ số tham khảo:
  - Tỷ lệ vật liệu tái chế (%).
  - Khả năng tái sử dụng của bao bì (cao/trung bình/thấp).
  - Lượng CO₂ ước tính cắt giảm so với hộp quà truyền thống (gram hoặc kg).
- **Thiết kế:** Dùng thanh tiến trình (progress bar) hoặc biểu đồ mini, màu xanh Sage Green làm điểm nhấn. Kèm dòng chú thích nhỏ: *“Số liệu tham khảo nội bộ, chưa qua kiểm định.”*

### 3.3 Smart Cart (Giỏ hàng thông minh)
- Giao diện giỏ hàng **không** chỉ hiển thị tên sản phẩm và số lượng.
- Phải hiển thị rõ từng mục đã tùy chỉnh:
  - Hình ảnh preview nhỏ của thiết kế đã hoàn thiện.
  - Lời nhắn, ảnh tải lên (nếu có).
  - Màu sắc hộp, kiểu dây buộc.
- Cho phép chỉnh sửa từng mục ngay trong giỏ hàng (quay lại bước tùy chỉnh) mà không cần xóa và làm lại.

### 3.4 Order Tracking UI (Theo dõi đơn hàng)
- Trang tra cứu cho cả khách vãng lai và thành viên.
- Hiển thị trực quan bằng **timeline dọc**, mỗi bước có icon trạng thái (đã hoàn thành/đang xử lý/chờ). Các bước mẫu:
  - Thiết kế hoàn tất → Đang đóng gói → Đã giao cho vận chuyển → Đang vận chuyển → Đã giao hàng.
- Cho phép xem chi tiết từng bước (ngày giờ, ghi chú).
- Đối với B2B, hiển thị trạng thái của từng địa chỉ nhận riêng.

---

## 4. Giọng điệu Bản sao & Thông điệp (Copywriting & Brand Voice)

### 4.1 Nguyên tắc chung
- **Minh bạch & Trung thực:** Tuyệt đối không dùng từ ngữ phóng đại, “xanh” chung chung. Luôn giải thích cụ thể tại sao sản phẩm này bền vững.
- **Cá nhân & Cảm xúc:** Nói với khách hàng như một người bạn tinh tế, tránh ngôn ngữ thương mại khô cứng.

### 4.2 Call‑to‑Action (CTA)
- Thay vì “Mua ngay”, hãy sử dụng:
  - *“Tạo dấu ấn riêng của bạn”*
  - *“Bắt đầu món quà độc bản”*
  - *“Gửi lời cảm ơn theo cách của bạn”*
- Các nút CTA phải nổi bật bằng màu Sage Green, chữ trắng, bo góc nhẹ.

### 4.3 Hiển thị Social Proof (UGC)
- Thiết kế một khu vực “Cộng đồng yêu thích” ngay trên trang chủ, hiển thị video unbox, đánh giá thực từ khách hàng.
- Cho phép khách hàng upload ảnh/video gắn hashtag của EcoKnot; hiển thị dạng lưới (grid) tối giản.
- Nội dung đánh giá phải có xác thực (ví dụ: “Đã mua hàng tại EcoKnot”) để tăng niềm tin.

---

## 5. Ứng dụng trên Nền tảng Wix (Ghi chú kỹ thuật)
- Với các component đặc thù (Customization Tool, Smart Cart, Order Tracking), đội phát triển có thể sử dụng **Velo by Wix** để tạo custom interactions và kết nối cơ sở dữ liệu.
- Đảm bảo tất cả thành phần responsive, ưu tiên mobile breakpoint 375px, 414px, 768px.
- Sử dụng bảng màu và font chữ đã được phê duyệt trong Wix Design Manager để duy trì tính đồng bộ.

---

*Tài liệu này là một phần của bộ nhận diện thương hiệu tổng thể. Mọi sáng tạo phải bám sát các nguyên tắc trên để đảm bảo trải nghiệm người dùng nhất quán và truyền tải đúng giá trị cốt lõi của EcoKnot Gifting.*