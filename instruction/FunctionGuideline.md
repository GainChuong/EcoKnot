# EcoKnot Gifting – Đặc tả tính năng website

**Phiên bản:** 1.0  
**Ngày:** 2026-06-26  
**Mục tiêu:** Tài liệu mô tả chi tiết toàn bộ tính năng website EcoKnot Gifting, phục vụ đội phát triển (Antigravity) triển khai trên nền tảng Wix (có tùy chỉnh code nếu cần).

\---

## 1\. Tổng quan định hướng trải nghiệm

Website được thiết kế theo ba trụ cột khác biệt:

* **AI‑first Experience:** Onboarding thông minh, cá nhân hóa toàn diện và có khả năng giải thích.
* **Transparency‑first:** Minh bạch về cách AI đưa ra đề xuất, quyền kiểm soát dữ liệu và nguồn gốc sản phẩm.
* **Sustainability‑first:** Tra cứu tác động môi trường qua Digital Product Passport và Sustainability Dashboard cá nhân.

\---

## 2\. Các chức năng cốt lõi (Core Functions)

### 2.1 Công cụ tùy biến hộp quà (Customization Tool)

* **Mô tả:** Trang/giao diện trực quan cho phép khách hàng tự xây dựng Gift Box theo từng bước.
* **Tính năng chi tiết:**

  * Chọn sản phẩm từ danh mục (quà, bao bì, thiệp, phụ kiện xanh).
  * Tải lên ảnh cá nhân (in lên thiệp/hộp).
  * Nhập lời nhắn cá nhân hoá (hỗ trợ font chữ, màu sắc cơ bản).
  * Xem trước thiết kế (Preview) thời gian thực.
  * Đối với B2B: thêm logo, bảng màu thương hiệu, chọn số lượng lớn và lưu thành mẫu riêng.
  * Lưu thiết kế vào giỏ hàng thông minh (xem 2.3).
* **Yêu cầu kỹ thuật:** Kéo thả hoặc chọn theo bước, tích hợp thư viện ảnh, render trước (mockup) phía client.

### 2.2 Hồ sơ sản phẩm điện tử (Digital Product Passport)

* **Mục tiêu:** Minh bạch nguồn gốc, thành phần và chỉ số môi trường của từng sản phẩm.
* \- Mỗi trang sản phẩm phải có một khối nhỏ hiển thị các chỉ số tham khảo:



* &#x20; - \*\*Recycled Content (%)\*\* – Tỷ lệ vật liệu tái chế hoặc tái sử dụng.  
* &#x20;   `= (Khối lượng thành phần tái chế / Tổng khối lượng sản phẩm) × 100%`



* &#x20; - \*\*Recyclability Rate (%)\*\* – Tỷ lệ khối lượng sản phẩm có thể tái chế về mặt kỹ thuật.  
* &#x20;   `= (Khối lượng thành phần có thể tái chế / Tổng khối lượng sản phẩm) × 100%`



* &#x20; - \*\*Reusable Packaging (%)\*\* – Tỷ lệ bao bì có khả năng tái sử dụng.  
* &#x20;   `= (Khối lượng bao bì tái sử dụng được / Tổng khối lượng bao bì) × 100%`
* 
* &#x20; - \*\*Renewable Material Content (%)\*\* – Tỷ lệ nguyên liệu có nguồn gốc tái tạo.  
* &#x20;   `= (Khối lượng thành phần tái tạo / Tổng khối lượng sản phẩm) × 100%`
* 
* &#x20; - \*\*Virgin Plastic Reduction\*\* – Mức giảm tuyệt đối nhựa nguyên sinh so với sản phẩm truyền thống tương đương.  
* &#x20;   `= Khối lượng nhựa nguyên sinh của sản phẩm tham chiếu – Khối lượng nhựa nguyên sinh của sản phẩm EcoKnot (gram)`
* 
* &#x20; - \*\*Carbon Footprint Avoided (kg CO₂e)\*\* – Lượng phát thải khí nhà kính ước tính cắt giảm được.  
* &#x20;   `= (EF\_reference – EF\_EcoKnot) × Số lượng sản phẩm`  
* &#x20;   với `EF` là cường độ phát thải (kg CO₂e / đơn vị), so sánh giữa hộp quà truyền thống và sản phẩm EcoKnot.
* 
* \- \*\*Thiết kế:\*\* Dùng thanh tiến trình (progress bar) hoặc biểu đồ mini, màu xanh Sage Green làm điểm nhấn. Kèm dòng chú thích nhỏ: \*“Số liệu tham khảo nội bộ, chưa qua kiểm định
* **Vị trí:** Trang chi tiết sản phẩm (tab “Passport”) hoặc pop‑up khi nhấn vào “nhãn xanh”.

### 2.3 Giỏ hàng thông minh đa định dạng

* Lưu toàn bộ thông tin cá nhân hoá (ảnh, lời nhắn, màu sắc, kiểu hộp, danh sách sản phẩm) của từng Gift Box.
* Cho phép sửa lại từng món trong giỏ mà không cần làm lại từ đầu.
* Hỗ trợ nhiều Gift Box trong cùng một đơn hàng, mỗi box có thông tin riêng.

### 2.4 Thanh toán \& Báo giá tự động

* **B2C:** Tích hợp đa cổng thanh toán (thẻ quốc tế/nội địa, ví điện tử, COD, chuyển khoản).
* **B2B:**

  * Form báo giá tự động theo số lượng và yêu cầu tuỳ chỉnh.
  * Xuất hóa đơn điện tử (tích hợp với hệ thống nội bộ hoặc bên thứ ba).
  * Hỗ trợ thanh toán theo hợp đồng (chuyển khoản, công nợ).

### 2.5 Quản lý \& Tracking đơn hàng

* Cung cấp mã vận đơn cho từng kiện hàng.
* Trang “Theo dõi đơn hàng” hiển thị trạng thái: Đã xác nhận → Đang đóng gói → Đã giao cho vận chuyển → Đang vận chuyển → Đã giao.
* Đối với doanh nghiệp: quản lý danh sách nhiều địa chỉ nhận quà, theo dõi trạng thái từng địa chỉ.

### 2.6 AI Cá nhân hóa \& Automated Marketing (có sẵn)

* AI gợi ý sản phẩm dựa trên lịch sử duyệt, mua hàng và hồ sơ sở thích.
* Tự động gửi email nhắc nhở giỏ hàng bỏ quên, email chúc mừng dịp lễ/sinh nhật đã lưu.
* Trong 30 ngày đầu sau đăng ký, AI ưu tiên học nhanh sở thích từ tương tác.

### 2.7 AI‑powered Onboarding \& Preference Profiling (MỚI)

*Đây là bước đăng ký mới thay thế form đăng ký cơ bản.*

**Luồng:**

1. Người dùng truy cập “Đăng ký”.
2. Nhập email + mật khẩu (hoặc đăng nhập qua Google/Facebook).
3. Hệ thống chuyển sang **Onboarding Survey** gồm 3–6 câu hỏi (theo phong cách TikTok/Canva):

   **Câu 1: Bạn thường mua quà cho ai?** (chọn nhiều)

   * Bạn bè
   * Người yêu
   * Gia đình
   * Đồng nghiệp
   * Khách hàng
   * Đối tác doanh nghiệp

   **Câu 2: Bạn quan tâm điều gì nhất khi chọn quà?** (chọn nhiều)

   * Thiết kế đẹp
   * Ý nghĩa
   * Cá nhân hóa
   * Thân thiện môi trường
   * Giá cả
   * Giao nhanh

   **Câu 3: Ngân sách thường sử dụng cho một hộp quà?** (chọn một)

   * <300.000đ
   * 300.000 – 500.000đ
   * 500.000 – 1.000.000đ
   * >1.000.000đ  

   **Câu 4: Những dịp bạn thường mua quà?** (chọn nhiều)

   * Sinh nhật
   * Noel
   * Valentine
   * Tết
   * Kỷ niệm
   * Cảm ơn
   * Xin lỗi
   * Corporate Gift

   **Câu 5: Bạn thích phong cách nào?** (chọn một)

   * Minimal
   * Vintage
   * Luxury
   * Eco
   * Cute
   * Modern

   *(Có thể thêm câu hỏi phụ nếu người dùng chọn “Đối tác doanh nghiệp” → số lượng thường đặt, quy mô công ty)*

4. Sau khi hoàn thành:

   * Hệ thống tạo **Gift Preference Profile** (lưu trong CSDL khách hàng).
   * Giao diện homepage, danh mục đề xuất, thứ tự sản phẩm được cá nhân hoá ngay lập tức.
   * Hiển thị thông báo: “Hồ sơ của bạn đã sẵn sàng! Bạn có thể chỉnh sửa bất kỳ lúc nào trong My Account → My Preference Profile.”
   * Cho phép bỏ qua survey (skip) nhưng khuyến khích hoàn thành để nhận ưu đãi.

   ### 2.8 AI Transparency Center (MỚI)

   *Tính năng minh bạch về cách AI cá nhân hóa đề xuất.*

* Bên cạnh mỗi khối đề xuất AI (trên homepage, trang danh mục, trang sản phẩm) sẽ có biểu tượng **“Tại sao AI đề xuất sản phẩm này?”** (icon i hoặc nút hỏi).
* Khi nhấn vào, hiển thị pop‑up hoặc slide‑in giải thích:

  > \*Ví dụ:\*  
  > \*\*AI đề xuất Gift Box này vì:\*\*  
  > ✓ Bạn ưu tiên sản phẩm thân thiện môi trường  
  > ✓ Bạn thường chọn ngân sách khoảng 500.000đ  
  > ✓ Bạn từng mua quà sinh nhật  
  > ✓ Dịp sắp tới: Father’s Day  

* Dưới phần giải thích có dòng:

  > \*AI chỉ sử dụng những dữ liệu bạn cho phép. Bạn có thể thay đổi hoặc xóa Preference Profile bất cứ lúc nào.\* (kèm link đến My Preference Profile).  

* **Yêu cầu:** Hệ thống phải ghi log các yếu tố góp phần vào mỗi đề xuất (các thẻ: sustainability\_score, budget\_match, occasion\_match, style\_match, v.v.) để có thể render văn bản giải thích động, bao gồm cách tính, tại sao lại tính như vậy.

  ### 2.9 Sustainability Dashboard (trong My Account) – MỚI

  *Xem chi tiết tại mục 3.2.3*

  \---

  ## 3\. Cấu trúc website chi tiết

  ### 3.1 Header

* Logo EcoKnot Gifting (góc trái).
* Navigation menu:

  * Trang chủ
  * Tạo hộp quà (Build a Gift Box) – link tới Customization Tool.
  * Cửa hàng (Shop) – dropdown:

    * Quà theo mùa/lễ (Seasonal)
    * Quà thường nhật (Daily: cảm ơn, xin lỗi, động viên)
    * Premium Custom Gift Box
  * Quà tặng doanh nghiệp (Corporate B2B)
  * Câu chuyện bền vững (Sustainability)
  * Blog
  * Theo dõi đơn hàng (Track Order)
* Thanh tìm kiếm (Search Bar).
* Icon giỏ hàng (kèm số lượng).
* Icon tài khoản (My Account) hoặc nút Đăng nhập/Đăng ký.

  ### 3.2 My Account (Hồ sơ khách hàng)

  *Mở rộng so với tài khoản thông thường. Menu trong My Account gồm:*

  #### 3.2.1 Thông tin cá nhân \& Địa chỉ

  (các trường cơ bản)

  #### 3.2.2 Đơn hàng của tôi

* Danh sách đơn hàng, trạng thái, chi tiết.

  #### 3.2.3 Sustainability Dashboard (MỚI)

  *Dashboard thống kê tác động môi trường cá nhân (chỉ số tham khảo nội bộ).*

  *- Mỗi trang sản phẩm phải có một khối nhỏ hiển thị các chỉ số tham khảo:*



  &#x20; *- \*\*Recycled Content (%)\*\* – Tỷ lệ vật liệu tái chế hoặc tái sử dụng.*  

  &#x20;   *`= (Khối lượng thành phần tái chế / Tổng khối lượng sản phẩm) × 100%`*



  &#x20; *- \*\*Recyclability Rate (%)\*\* – Tỷ lệ khối lượng sản phẩm có thể tái chế về mặt kỹ thuật.*  

  &#x20;   *`= (Khối lượng thành phần có thể tái chế / Tổng khối lượng sản phẩm) × 100%`*



  &#x20; *- \*\*Reusable Packaging (%)\*\* – Tỷ lệ bao bì có khả năng tái sử dụng.*  

  &#x20;   *`= (Khối lượng bao bì tái sử dụng được / Tổng khối lượng bao bì) × 100%`*



  &#x20; *- \*\*Renewable Material Content (%)\*\* – Tỷ lệ nguyên liệu có nguồn gốc tái tạo.*  

  &#x20;   *`= (Khối lượng thành phần tái tạo / Tổng khối lượng sản phẩm) × 100%`*



  &#x20; *- \*\*Virgin Plastic Reduction\*\* – Mức giảm tuyệt đối nhựa nguyên sinh so với sản phẩm truyền thống tương đương.*  

  &#x20;   *`= Khối lượng nhựa nguyên sinh của sản phẩm tham chiếu – Khối lượng nhựa nguyên sinh của sản phẩm EcoKnot (gram)`*



  &#x20; *- \*\*Carbon Footprint Avoided (kg CO₂e)\*\* – Lượng phát thải khí nhà kính ước tính cắt giảm được.*  

  &#x20;   *`= (EF\_reference – EF\_EcoKnot) × Số lượng sản phẩm`*  

  &#x20;   *với `EF` là cường độ phát thải (kg CO₂e / đơn vị), so sánh giữa hộp quà truyền thống và sản phẩm EcoKnot.*



  *- \*\*Thiết kế:\*\* Dùng thanh tiến trình (progress bar) hoặc biểu đồ mini, màu xanh Sage Green làm điểm nhấn. Kèm dòng chú thích nhỏ: \*“Số liệu tham khảo nội bộ, chưa qua kiểm định*

  #### 3.2.4 My Preference Profile (MỚI)

* Cho phép xem và chỉnh sửa trực tiếp các thông tin từ onboarding:

  * Người nhận quà yêu thích
  * Dịp tặng phổ biến
  * Màu sắc yêu thích (nếu thu thập thêm)
  * Phong cách
  * Khoảng ngân sách
  * Mức độ quan tâm đến Sustainability (slider 1-5)
* Nút “Lưu thay đổi” → cập nhật Preference Profile, AI sẽ áp dụng ngay trong phiên tiếp theo.

  #### 3.2.5 AI Personalization Settings (MỚI)

* **Bật/Tắt AI Recommendation:** on/off toggle.
* **Đặt lại hồ sơ AI:** Xoá toàn bộ lịch sử học, đưa về trạng thái mặc định (người dùng sẽ được mời làm lại survey nếu muốn).
* **Xem AI đã học gì về mình:** Hiển thị bản tóm tắt các sở thích, tag mà AI suy luận (không hiển thị dữ liệu thô).
* **Xóa lịch sử cá nhân hóa:** Xóa dữ liệu tương tác (lượt xem, click, thời gian trên trang) dùng để cá nhân hóa.
* **Tải xuống dữ liệu cá nhân:** Xuất file JSON/CSV toàn bộ dữ liệu cá nhân (thông tin tài khoản, đơn hàng, preference, dữ liệu tương tác nếu có).

  ### 3.3 Body – Trang chủ (Homepage)

  *Các section theo thứ tự hiển thị (có thể cuộn):*

1. **Hero Banner:**

   * Hình ảnh/video sản phẩm xanh.
   * Dòng tiêu đề: “Tạo món quà độc bản của riêng bạn”.
   * CTA nút “Bắt đầu tạo hộp quà” → dẫn tới Customization Tool.
2. **Mua sắm theo Cảm xúc / Dịp lễ:**

   * Các card: “Cảm ơn”, “Xin lỗi”, “Sinh nhật”, “Valentine”, “Tết”, …
   * Mỗi card dẫn vào bộ sưu tập tương ứng.
3. **Hệ sinh thái Sản phẩm Xanh:**

   * Carousel sản phẩm nổi bật, mỗi sản phẩm có “nhãn xanh” → nhấn vào mở Digital Product Passport thu gọn.
4. **Giải pháp Doanh nghiệp (B2B):**

   * Banner tĩnh: “Quà tặng đối tác, khách hàng – In logo, tuỳ chỉnh số lượng lớn”.
   * Nút “Yêu cầu báo giá” → form B2B.
5. **Social Proof / UGC:**

   * Lưới video ngắn (unbox, review) từ khách hàng hoặc micro‑influencer.
   * Tích hợp TikTok/Instagram embed hoặc video upload trực tiếp.
6. **Why EcoKnot AI? (Section MỚI):**

   * Tiêu đề: “Cá nhân hóa minh bạch, khác biệt xanh”.
   * 4 cột/icon:

     * **Minh bạch trong từng đề xuất:** AI chỉ sử dụng dữ liệu bạn cho phép.
     * **Bạn luôn biết lý do:** Mỗi gợi ý đều có giải thích cụ thể.
     * **Kiểm soát hoàn toàn:** Chỉnh sửa hồ sơ sở thích bất cứ lúc nào.
     * **Bảo mật tuyệt đối:** Không bán dữ liệu cá nhân cho bên thứ ba.

   ### 3.4 Footer

* Thông tin liên hệ: Địa chỉ, Hotline, Email CSKH.
* Các chính sách:

  * Chính sách bảo mật dữ liệu khách hàng.
  * Chính sách đổi trả/hoàn tiền.
  * Chính sách vận chuyển.
* Quick Links: Về chúng tôi, Cửa hàng, FAQ.
* Đăng ký Newsletter (ô nhập email).
* Biểu tượng mạng xã hội: Facebook, Instagram, TikTok, LinkedIn.

  \---

  ## 4\. Yêu cầu phi chức năng \& Tương tác AI

* **Bảo mật dữ liệu cá nhân:** Tất cả ảnh tải lên, lời nhắn, preference profile phải được mã hóa lưu trữ. Quyền truy cập của nhân viên bị giới hạn.
* **Hiệu suất AI:** Giải thích đề xuất không được làm chậm quá 200ms so với load trang.
* **Tuân thủ quy định:** Có cơ chế xóa tài khoản và toàn bộ dữ liệu (Right to be forgotten).
* **Responsive:** Tất cả các tính năng hoạt động tốt trên mobile, tablet, desktop.
* **Wix compatibility:** Với các phần động như AI Transparency Center, Preference Profile, Sustainability Dashboard có thể cần custom code (Velo by Wix) hoặc iframe đến ứng dụng bên ngoài nếu Wix không hỗ trợ database phức tạp. Ưu tiên giải pháp tích hợp sẵn nhưng đảm bảo đủ các trường dữ liệu.

  \---

  ## 5\. Phụ lục – So sánh cạnh tranh (định hướng truyền thông)

  *Dùng cho nội bộ để thống nhất thông điệp, không nhất thiết hiển thị trên web.*

* So với các web quà tặng thông thường, EcoKnot khác biệt nhờ:

  * Trải nghiệm AI‑first ngay từ bước đăng ký.
  * Minh bạch cách thức cá nhân hóa.
  * Hồ sơ bền vững của từng sản phẩm và tổng kết tác động cá nhân.

  \---

  *Tài liệu này là đặc tả chức năng, không bao gồm thiết kế đồ họa chi tiết. Các wireframe và mockup sẽ được cung cấp riêng sau khi thống nhất cấu trúc trên.*

