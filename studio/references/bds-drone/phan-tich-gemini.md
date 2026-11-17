### 1. ÂM THANH

* **Lời đọc (Voiceover):** Không có.
* **Nhạc nền (BGM):**
  * Thể loại: Modern Upbeat EDM / Tech House.
  * Nhịp độ: ~125 BPM.
  * Cấu trúc: Nhịp trống điện tử dồn dập từ đầu, giữ nhịp đều đặn và giảm âm lượng (fade-out) ở 00:15.0 - 00:16.0.
* **Hiệu ứng âm thanh (SFX):**
  * `00:01.8 - 00:02.5`: SFX Laser / Neon Whoosh (âm thanh tia laser phóng khi kẻ vạch đường neon).
  * `00:03.2`: SFX Pop / Whoosh nhẹ (thẻ "TÒA ÁN" nảy lên).
  * `00:04.5`: SFX Pop / Whoosh nhẹ (thẻ "KHÁCH SẠN" nảy lên).
  * `00:06.5`: SFX Whoosh chuyển cảnh ngắn (thẻ hình ảnh biến mất).
  * `00:07.5`, `00:08.2`, `00:08.8`: SFX "Pop / Blip" vui nhộn lần lượt khi từng ghim vị trí xuất hiện.

---

### 2. TIMELINE CÁC CẢNH & HIỆU ỨNG

* **Nền chung toàn video:** Video drone góc nhìn trên cao hướng dọc trục đại lộ đô thị, máy bay giữ vị trí tương đối tĩnh (chỉ trôi nhẹ về trước, không xoay/nghiêng).
* **00:00.0 - 00:01.8:**
  * Tiêu đề hook xuất hiện giữa màn hình.
  * Ghim "CĂN NHÀ" đã hiện diện sẵn tại tọa độ nhà mục tiêu, nhún nhảy nhẹ (idle bounce).
* **00:01.8 - 00:03.0:**
  * Tiêu đề chính biến mất (Fade out).
  * Kẻ đường neon (Trim Paths từ 0% -> 100%, thời lượng ~1.2s, easing Out-Cubic) chạy dọc đại lộ và rẽ vào các nhánh phụ.
* **00:03.2 - 00:06.5 (Cụm tiện ích dạng Thẻ hình ảnh):**
  * `00:03.2 - 00:03.6`: Điểm ghim + đường dóng 3D + Thẻ "TÒA ÁN" xuất hiện (Scale Pop 0% -> 100%, kèm hiệu ứng trượt nhẹ).
  * `00:04.5 - 00:04.9`: Thẻ "KHÁCH SẠN" bên trái xuất hiện tương tự.
  * `00:06.5 - 00:07.0`: Cả 2 thẻ co lại biến mất (Scale 100% -> 0% hoặc Fade out nhanh).
* **00:07.2 - 00:15.0 (Cụm tiện ích dạng Ghim Vector):**
  * `00:07.5`: Ghim "SIÊU THỊ" nảy ra kèm vòng tròn xung kích (Ripple ring) tỏa dưới chân.
  * `00:08.2`: Ghim "TRƯỜNG HỌC" nảy ra tương tự.
  * `00:08.8`: Ghim "NHÀ HÀNG" nảy ra tương tự.
  * `00:09.0 - 00:15.0`: Tất cả ghim và đường neon duy trì hiển thị, vạch neon có hiệu ứng luồng sáng chạy liên tục.
* **00:15.0 - 00:16.0:**
  * Video và toàn bộ đồ họa mờ dần về đen (Fade to black).

---

### 3. THÔNG SỐ ĐỒ HỌA CHI TIẾT (Khung chuẩn: 1080 x 1920 px)

#### A. Đường kẻ giao thông Neon (Road Paths)
* **Màu sắc:** Xanh Neon / Cyan (`#00FFA3` đến `#00F5D4`), có dải sáng trắng ở lõi (`#FFFFFF`).
* **Độ dày:** Lõi chính ~6px - 8px, dải sáng lan tỏa (Outer Glow) bán kính ~20px - 30px.
* **Hiệu ứng:** Đường chạy phối cảnh 3D theo mặt đường thực tế, vệt sáng chạy lặp (Dash offset loop).

#### B. Ghim vị trí (Location Pins)
* **Hình dạng:** Giọt nước ngược / bản đồ, đầu tròn chứa icon vector, đuôi nhọn trỏ đúng vị trí mái nhà/khu đất.
* **Màu sắc:** 
  * Thân ghim: Vàng cam gradient (`#FFB703` -> `#FB8500`), viền trắng 2px.
  * Vòng tròn chứa icon: Màu xanh than sẫm (`#023047`) làm nền cho icon màu trắng.
* **Kích thước:** Chiều cao ~140px, rộng ~100px (ghim ở xa tự động scale nhỏ theo phối cảnh ~60-70%).
* **Vòng tròn chân ghim (Anchor Ripple):** 2-3 vòng elip đồng tâm nằm phẳng theo mặt đất (`transform: rotateX(60deg)`), màu xanh cyan mờ, scale phóng to từ 0 đến 1.5 rồi mờ dần (`opacity: 1 -> 0`).

#### C. Thẻ ảnh tiện ích 3D (Billboard Cards - Tòa án, Khách sạn)
* **Cấu trúc:** 
  * Đường dẫn (Leader line): Đường kẻ xiên 3D màu cyan nối từ điểm thực tế lên thẻ.
  * Khung thẻ: Hình chữ nhật bo góc nhẹ (~10px), viền gradient cyan/trắng, đổ bóng (Drop Shadow) đen mờ.
  * Nội dung: Hình chụp tòa nhà thực tế bên trên, nhãn tên nền xanh đậm viền trắng bo tròn bên dưới.

#### D. Typography & Nhãn
* **Font chữ:** Sans-serif hình học, nét dày dặn, in hoa (Tương tự *Montserrat Black* hoặc *Be Vietnam Pro ExtraBold*).
* **Nhãn trên đầu ghim:**
  * Màu chữ: Vàng cam (`#FFD166`), viền đen (Stroke 4-6px), đổ bóng đậm để tương phản trên nền trời.
  * Cỡ chữ: ~48px - 56px (tỷ lệ chuẩn trên khung 1080p).

---

### 4. TẤT CẢ CHỮ TRÊN MÀN HÌNH

1. **Tiêu đề mở đầu (00:00 - 00:02):**
   * Vị trí: Giữa - trên (y ≈ 20%).
   * Nội dung:
     * Dòng 1: `Kẻ Đường Và Ghim Vị Trí` (Màu vàng `#FFE600`, viền đen).
     * Dòng 2: `Trên CapCut` (Màu trắng `#FFFFFF`, viền đen).
     * Dòng 3: `Trong 30 Giây ???` (Màu vàng `#FFE600`, viền đen).
2. **Watermark tác giả:**
   * Vị trí: Góc dưới bên trái (y ≈ 85%, x ≈ 15%).
   * Nội dung: `HBN MEDIA` (Màu trắng mờ, font bold).
3. **Nhãn các địa điểm:**
   * `CĂN NHÀ` (Vàng, viền đen - trên ghim nhà mục tiêu).
   * `TÒA ÁN` (Trắng, nền tab xanh cyan - dưới thẻ ảnh tòa án).
   * `KHÁCH SẠN` (Trắng, nền tab xanh cyan - dưới thẻ ảnh khách sạn).
   * `SIÊU THỊ` (Vàng, viền đen - trên ghim siêu thị góc xa).
   * `TRƯỜNG HỌC` (Vàng, viền đen - trên ghim trường học bên trái).
   * `NHÀ HÀNG` (Vàng, viền đen - trên ghim nhà hàng góc gần bên trái).

---

### 5. CHUYỂN CẢNH & HIỆU ỨNG TOÀN KHUNG

* **Hiệu ứng camera:** Giữ chuyển động bay tự nhiên của drone (không can thiệp warp/speed ramp camera).
* **Hiệu ứng đồ họa (Post-processing):**
  * Áp dụng chế độ hòa trộn `Add` hoặc `Screen` cho tất cả các đường neon để đạt hiệu ứng phát sáng chân thực trên mặt đường.
  * Các layer ghim và thẻ được gán theo điểm bám bề mặt (Point Tracking / Planar Tracking) để cố định chính xác với khung hình drone đang trôi.
* **Kết thúc video:** `Fade to Black` trong vòng 0.8 giây cuối.

---

### 6. CẤU TRÚC KỂ CHUYỆN (NARRATIVE FLOW)

1. **Mở đầu (Hook):** Đưa ra vấn đề/thử thách bằng câu hỏi ("Kẻ đường và ghim vị trí... trong 30 giây?"). Định vị ngay bất động sản trọng tâm ("CĂN NHÀ").
2. **Khai thác kết nối (Hạ tầng giao thông):** Bật sáng các tuyến đường neon thể hiện kết nối giao thông huyết mạch đi qua khu đất.
3. **Nổi bật tiện ích lớn (Proof of Life):** Hiện thẻ ảnh minh họa trực quan các tiện ích hành chính, lưu trú quy mô lớn gần đó (Tòa án, Khách sạn).
4. **Mở rộng tiện ích dân sinh:** Hiện hàng loạt ghim định vị các nhu cầu thiết yếu hàng ngày xung quanh (Siêu thị, Trường học, Nhà hàng) nhằm chứng minh giá trị sống tiện lợi của bất động sản.