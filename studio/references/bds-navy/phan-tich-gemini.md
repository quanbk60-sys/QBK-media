Dưới đây là bản phân tích kỹ thuật chi tiết của video để tái lập trình:

---

### 1. ÂM THANH

* **Lời đọc (Voiceover):**
  * `00:00.0 - 00:07.3`: *"Symphony Nam sở hữu vị trí tâm điểm, ngay mặt tiền sông Hàn, cách Cầu Rồng chỉ 1,5 km và biển Mỹ Khê 2,5 km."*
  * `00:07.3 - 00:13.3`: *"Ngoài ra, dự án nằm gần các cung đường quan trọng như Lê Văn Duyệt, Trần Hưng Đạo, Vân Đồn, Trần Thánh Tông, Ngô Quyền."*
  * `00:13.3 - 00:20.8`: *"Đây là các tuyến đường huyết mạch đóng vai trò kết nối xuyên suốt trung tâm thành phố Đà Nẵng như bán đảo Sơn Trà, chùa Linh Ứng, biển Mỹ Khê, sân bay Đà Nẵng."*
  * `00:20.8 - 00:23.8`: *"Mở ra tiềm năng đầu tư sinh lời vượt trội trong tương lai gần."*
  * `00:23.8 - 00:26.5`: *"Hãy liên hệ với mình để nhận file dự án này."*
* **Đặc tính giọng:** Giọng nam miền Bắc (AI/TTS chất lượng cao), tốc độ vừa phải (~150 từ/phút), âm sắc tự tin, rõ ràng, dứt khoát.
* **Nhạc nền:** Nhạc điện tử / Corporate Tech hiện đại, tiết tấu dồn dập nhẹ, BPM ~120, âm lượng -18dB so với voiceover.
* **Hiệu ứng âm thanh (SFX):**
  * `00:00.0`: Whoosh trầm khi zoom nhanh từ vệ tinh vào bản đồ.
  * `00:03.0`, `00:05.2`: Swoosh/Laser ngắn khi mũi tên đo khoảng cách bắn ra.
  * `00:09.5 - 00:12.5`: Click / Pop liên tục khi từng nhãn tên đường xuất hiện.
  * `00:16.0 - 00:21.0`: Pop / Ding khi các thẻ tiện ích (Sơn Trà, Linh Ứng, Sân bay) nảy lên; tiếng máy bay rít nhẹ ở `00:21.5`.

---

### 2. TIMELINE & CHUYỂN ĐỘNG CAMERA

| Mốc TG | Nền bản đồ | Chuyển động Camera | Đồ họa & Hoạt ảnh |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:01** | Ảnh vệ tinh Đà Nẵng -> Vector Dark Blue | Zoom-in cực nhanh (Hyper-zoom), easing `ease-out`, chuyển sang vector ở 00:00.8 | Model 3D dự án + mặt bằng phân lô hiện lên ở trung tâm. |
| **00:01 - 00:07** | Vector tối màu (Sông Hàn xanh lơ) | Góc nhìn nghiêng 3D ~45°, camera giữ cận cảnh dự án | • `00:02`: Chữ "SÔNG HÀN" trượt dọc lòng sông.<br>• `00:03`: Mũi tên xanh lá bắn từ dự án đến Cầu Rồng, pop-up thẻ Cầu Rồng + nhãn "1.5KM".<br>• `00:05`: Mũi tên thứ hai bắn ra Biển Mỹ Khê + nhãn "2.5KM". |
| **00:07 - 00:13** | Vector đô thị | Camera xoay nhẹ góc nhìn nghiêng, lia theo các tuyến phố | Lần lượt vẽ đường phát sáng và hiện nhãn: Lê Văn Duyệt, Trần Hưng Đạo, Vân Đồn, Trần Thánh Tông, Ngô Quyền (animation: scale-up kèm nảy). |
| **00:13 - 00:20** | Vector toàn cảnh TP Đà Nẵng | Camera zoom-out từ từ, nâng cao góc nhìn bao quát | Các thẻ tiện ích bật lên bằng hiệu ứng pop-up nảy (overshoot): Cầu Rồng, Pháo Hoa DIFF, Biển Mỹ Khê, Bán đảo Sơn Trà, Chùa Linh Ứng. |
| **00:20 - 00:26** | Vector nghiêng góc Tây sang Đông | Camera lia ngang sang phía Sân bay Đà Nẵng rồi dừng lại | Vùng Sân bay Đà Nẵng phát sáng viền neon xanh, icon máy bay 3D bay nhẹ, giữ tĩnh hiển thị toàn bộ hệ sinh thái đến hết video. |

---

### 3. ĐỒ HỌA & STYLE CHI TIẾT

* **Màu sắc chủ đạo:**
  * Nền bản đồ: Xanh hải quân đậm (`#0e2038` - `#162b47`), mặt nước `#0b1a2d`.
  * Sông Hàn: Xanh lục bảo neon nhạt (`#48cae4` / `#00b4d8`).
  * Đường giao thông: Xanh thép nhạt (`#2a4365`), đường kích hoạt phát sáng trắng (`#ffffff`).
  * Mũi tên khoảng cách: Xanh lá dạ quang (`#00ff88` đến `#10b981`), viền phát sáng (outer glow).
* **Thẻ hình ảnh (Info Cards):**
  * Cấu trúc: Khung chữ nhật bo góc `8px`, viền gradient vàng cam neon (`#ffaa00`), nền kính mờ (blur glassmorphism). Chân ghim thẳng đứng nối xuống mặt đất có vòng tròn định vị phát xung (pulsing dot).
* **Font chữ & Typography:**
  * Font: Sans-serif hình học hiện đại (tương đương Montserrat / Be Vietnam Pro, Bold & ExtraBold).
  * Chữ trên nhãn: Nền đen bo tròn `pill-box`, viền trắng/vàng, chữ màu trắng in hoa.

---

### 4. NỘI DUNG CHỮ TRÊN KHUNG HÌNH

* **Watermark:** `ZIN MEDIA` (màu trắng, opacity ~50%, góc trên/giữa).
* **Dự án chính:** `Sun Symphony` kèm logo & số hiệu phân khu.
* **Địa danh / Tên đường:**
  * `SÔNG HÀN` (dọc theo dòng chảy).
  * `LÊ VĂN DUYỆT`, `TRẦN HƯNG ĐẠO`, `VÂN ĐỒN`, `TRẦN THÁNH TÔNG`, `NGÔ QUYỀN`.
* **Tiện ích & Điểm mốc:**
  * `CẦU RỒNG`
  * `PHÁO HOA DIFF`
  * `BIỂN MỸ KHÊ`
  * `BÁN ĐẢO SƠN TRÀ`
  * `CHÙA LINH ỨNG`
  * `SÂN BAY ĐÀ NẴNG`
* **Chỉ số:** `1.5KM`, `2.5KM`.

---

### 5. CHUYỂN CẢNH & HIỆU ỨNG TOÀN KHUNG

* **Motion Blur:** Bật liên tục trên camera khi zoom và xoay góc để tạo cảm giác mượt mà 60fps.
* **Glow/Bloom:** Áp dụng hiệu ứng phát sáng neon cho các tuyến đường, mũi tên và chấm tọa độ.
* **Depth of Field (DoF):** Làm mờ nhẹ hậu cảnh ở các góc nghiêng cận cảnh nhằm hướng tiêu điểm vào chân ghim dự án.

---

### 6. CẤU TRÚC KỂ CHUYỆN (STORYTELLING)

1. **Định vị vĩ mô (0-2s):** Bắt đầu từ không gian vũ trụ, zoom thẳng vào lõi trung tâm Đà Nẵng.
2. **Vị trí vi mô & Khoảng cách (2-7s):** Nhấn mạnh tọa độ ven sông Hàn và cự ly ngắn tới các biểu tượng du lịch (Cầu Rồng, Biển Mỹ Khê).
3. **Hạ tầng giao thông (7-13s):** Chỉ mặt điểm tên 5 trục đường huyết mạch kết nối quanh dự án.
4. **Liên kết vùng toàn diện (13-20s):** Mở rộng góc máy ra toàn bộ hệ thống danh thắng & đầu mối giao thông (Sân bay, Sơn Trà).
5. **Call To Action (20-26s):** Khẳng định tiềm năng sinh lời và kêu gọi liên hệ nhận tài liệu dự án.