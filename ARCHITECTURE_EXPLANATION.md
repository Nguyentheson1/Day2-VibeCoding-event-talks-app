# Giải thích Kiến trúc Dự án (Architecture Explanation)

Tài liệu này được viết theo ngôn ngữ đời thường, sử dụng **"Ví dụ về một Nhà hàng"** để giúp những người không chuyên về lập trình (Front-end / Back-end) có thể hiểu được cách ứng dụng BigQuery Release Notes này hoạt động.

---

## 1. Bức tranh tổng thể: Phòng Ăn và Nhà Bếp

Một ứng dụng web giống hệt như một nhà hàng. Chúng ta chia ứng dụng ra làm hai khu vực chính: **Phòng ăn (Front-end)** và **Nhà bếp (Back-end)**.

### 🍽️ Phòng Ăn (Giao diện người dùng / Front-end)
Đây là nơi khách hàng (là bạn) trực tiếp ngồi và tương tác. Phòng ăn được tạo nên từ 3 vật liệu:

1. **HTML (Bộ khung):** Giống như tường, cửa, và bàn ghế. Nó quy định chỗ nào đặt nút bấm, chỗ nào để thanh tìm kiếm, chỗ nào để văn bản.
2. **CSS (Trang trí):** Giống như màu sơn, ánh sáng, và khăn trải bàn. Nó làm cho nút bấm có màu xanh, các thẻ bài viết tự động có bóng mờ, và chuyển đổi mượt mà giữa màu tối và màu sáng.
3. **JavaScript (Người phục vụ):** Đây là phần quan trọng nhất ở phòng ăn. Trình duyệt web không tự biết phải làm gì. JavaScript là một "anh bồi bàn" lanh lẹ. Khi bạn bấm nút "Refresh", anh bồi bàn sẽ chạy đi lấy dữ liệu. Khi bạn gõ vào thanh tìm kiếm, anh ta lập tức lọc các bài viết trên bàn để hiển thị đúng thứ bạn cần.

### 👨‍🍳 Nhà Bếp (Máy chủ / Back-end)
Đây là nơi xử lý dữ liệu, nằm khuất sau bức tường mà khách hàng không nhìn thấy. Nhà bếp của chúng ta được vận hành bởi một anh Bếp trưởng có tên là **Python (Flask)**.

**Tại sao chúng ta lại cần Nhà bếp?**
Dữ liệu các bản cập nhật gốc thực chất nằm trong một "kho nguyên liệu" khổng lồ của Google (dưới định dạng thô gọi là XML). Vì lý do bảo mật của trình duyệt web (CORS), "kho" của Google không cho phép anh bồi bàn (JavaScript) chạy thẳng từ phòng ăn tới kho để nhặt nguyên liệu.

Do đó, ta phải có một Bếp trưởng (Python):
* Bếp trưởng có đặc quyền đi đến kho của Google để xin nguyên liệu (dữ liệu XML thô).
* Khi mang về bếp, Bếp trưởng sẽ nhặt bỏ rác, thái nhỏ, nhào nặn nguyên liệu thô đó thành một món ăn hoàn chỉnh, gọn gàng (gọi là dữ liệu chuẩn JSON).
* Cuối cùng, Bếp trưởng đặt món ăn qua cửa sổ để anh bồi bàn mang lên cho khách.

---

## 2. Các thành phần kết nối với nhau như thế nào?

Gạch (HTML), sơn (CSS) và người phục vụ (JavaScript) không thể nằm rời rạc mà phải có **"cáp kết nối"** và **"bản lề"** để gắn chặt vào nhau. 

### HTML kết nối với CSS (Làm sao cái ghế biết phải sơn màu xanh?)
Chúng ta dùng **Thẻ tên (Class / ID)**.
* Khi bạn tạo một nút bấm trong HTML, bạn sẽ đeo cho nó một cái thẻ tên, ví dụ: `<button class="nút-màu-xanh"></button>`
* Ở bên trong file CSS, bạn chỉ cần gọi đúng cái tên đó ra lệnh: *"Cái nào tên là nút-màu-xanh thì đổi thành màu xanh nước biển cho tôi"*.
* **Kết nối:** Ở file HTML, ta cắm một sợi cáp: `<link href="style.css">`. Câu lệnh này báo cho HTML biết "khi nào cần trang trí, hãy đọc file style.css".

### HTML kết nối với JavaScript (Làm sao người phục vụ biết bàn nào gọi món?)
JavaScript cũng sử dụng **Thẻ tên (ID)** để tóm lấy các bộ phận của HTML.
* Trong HTML, bạn đánh dấu: `<button id="nut-refresh">Làm mới</button>`
* Ở file HTML, ta cắm một sợi cáp khác: `<script src="app.js"></script>` để gọi anh bồi bàn vào làm việc.
* Trong `app.js` sẽ có một câu lệnh là `document.getElementById("nut-refresh")`. Có nghĩa là: *"Hãy tìm xem cái nào có tên là nut-refresh thì nắm lấy nó cho tôi"*. 
* Khi đã nắm được nút bấm, JavaScript gắn thêm một "bộ lắng nghe" (EventListener). Nó giống như cái chuông cửa, hễ có ai click chuột vào nút đó là chuông reo lên, báo cho JavaScript bắt đầu chạy lệnh.

### JavaScript kết nối với Python (Làm sao phục vụ gọi vào bếp?)
Chúng kết nối với nhau qua **Đường dẫn API (API Endpoint)**. Nó giống như một "ô cửa sổ giao đồ ăn" giữa phòng ăn và nhà bếp.
* Trong Python (Bếp), ta tạo một ô cửa sổ có địa chỉ là `/api/notes`.
* Trong JavaScript (Phòng ăn), ta dùng lệnh `fetch('/api/notes')`. 
* Lệnh `fetch` này giống hệt như việc gõ cửa báo: *"Bếp ơi, cho tôi một phần dữ liệu ở ô cửa /api/notes"*. Python sẽ nghe thấy tiếng gõ, xử lý dữ liệu, rồi đẩy qua khe cửa sổ lại cho JavaScript.

---

## 3. Tổng hợp: Vòng đời của một Yêu cầu (Request)

1. Máy chủ **Python** nhận được yêu cầu mở trang web -> Nó gửi bản thiết kế **HTML** cho trình duyệt của bạn.
2. Trình duyệt đọc **HTML**, thấy có cắm cáp **CSS** -> Tự động tô màu cho đẹp.
3. Trình duyệt thấy có cắm cáp **JavaScript** -> Đánh thức anh phục vụ dậy, anh ta lập tức bám vào các nút bấm.
4. Khi bạn nhấn nút Refresh -> Phục vụ **JS** gọi qua cửa sổ `/api/notes` -> **Python** lấy dữ liệu từ Google, chế biến và trả về -> **JS** tự động nặn ra các cục HTML mới (các thẻ bài viết) và dán lên màn hình cho bạn xem.
