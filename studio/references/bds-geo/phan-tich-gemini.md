Dưới đây là bản phân tích kỹ thuật chi tiết để tái lập video bằng mã nguồn (Remotion/CapCut/AE scripting):

---

### 1. ÂM THANH

*   **Giọng đọc (Voiceover):** Giọng nam miền Nam (hoặc pha Nam Bộ chuẩn, truyền thông thương mại), tốc độ ~140-150 từ/phút, âm điệu tự tin, rõ ràng.
*   **Transcript & Timestamps:**
    *   `00:00.0 - 00:04.2`: "Lô đất cực đẹp, tọa lạc tại xã Ninh Phụng, thị xã Ninh Hòa, tỉnh Khánh Hòa."
    *   `00:04.3 - 00:13.5`: "Đây là một trong 7 xã của Ninh Hòa được phê duyệt lên phường trong giai đoạn 2021 đến 2030, với mục tiêu quy hoạch và phát triển thị xã Ninh Hòa trở thành đô thị công nghiệp của tỉnh."
    *   `00:14.0 - 00:24.0`: "Lô đất nằm trong khu dân cư hiện hữu đông đúc, với tổng diện tích 324 mét vuông trong đó có 60 mét vuông thổ cư, 21 mét mặt tiền đường bê tông rộng 3,2 mét quy hoạch 6 mét."
    *   `00:24.5 - 00:28.5`: "Chỉ 150 mét di chuyển ra đường bê tông liên xã."
    *   `00:29.0 - 00:38.0`: "Trong bán kính 8 phút di chuyển sẽ tiếp cận được các tiện ích như: Chợ Ninh Đông, Trường THCS Trần Quang Khải, Trường Tiểu học Ninh Phụng 2, và nhiều hàng quán, cà phê xung quanh đất."
    *   `00:38.2 - 00:48.5`: "Cách Quốc lộ 26 3km, đây cũng là trung tâm xã Ninh Phụng với đầy đủ các tiện ích như: UBND xã Ninh Phụng, Chợ Ninh Phụng, Trạm y tế xã Ninh Phụng, Trường mầm non, Trường tiểu học."
    *   `00:49.0 - 00:52.0`: "Cách trung tâm thị xã Ninh Hòa 5km."
    *   `00:52.5 - 00:59.0`: "Toàn bộ khu đất được quy hoạch đất ở đô thị, sổ hồng sẵn. Hãy liên hệ với chúng tôi để biết thêm thông tin về lô đất."
*   **Nhạc nền:** Nhạc corporate/tech-beat phong cách tài chính/bất động sản, Tempo ~120 BPM, năng động, đều đặn, không có cao trào giật cục.
*   **Hiệu ứng âm thanh (SFX):**
    *   `00:00 - 00:04`: Tiếng Whoosh sâu khi zoom camera bản đồ vệ tinh.
    *   `00:06.5`: Pop sound khi hiện bài báo quy hoạch.
    *   `00:14.0`: Drone soundscape/whoosh nhẹ chuyển cảnh.
    *   `00:17.5, 00:21.0, 00:25.5`: Ping/Ding/Pop nhẹ khi bung các tag kích thước và pin vị trí.
    *   `00:31.0 - 00:36.0`: Radar sweeping sound + pop-pop-pop liên hoàn khi hiện icon tiện ích.
    *   `00:39.0, 00:49.5`: Riser / Whoosh khi vẽ đường đo khoảng cách.
    *   `00:54.0`: Camera shutter/thud khi hiện hình sổ hồng.

---

### 2. TIMELINE CÁC CẢNH & CHUYỂN ĐỘNG CAMERA

| Thời gian | Cảnh & Nền | Chuyển động Camera | Hoạt ảnh đồ họa |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:04** | Bản đồ vệ tinh toàn cảnh Khánh Hòa $\to$ Ninh Hòa $\to$ Ninh Phụng | Zoom in cực nhanh (Ease-in-out), xoay nhẹ góc nghiêng sang top-down | Viền neon xanh lá vẽ ranh giới tỉnh/huyện/xã; Pin đỏ "Vị trí lô đất" gắn sẵn |
| **00:04 - 00:13** | Zoom out vệ tinh thị xã Ninh Hòa + Pop-up văn bản | Camera drift chậm; Sau đó lùi xa hiển thị 7 xã quy hoạch | Viền xanh ranh giới 7 xã scale-in. 00:06.5 bài báo/văn bản fade-in + highlight vàng tự động, sau đó zoom out hiển thị mô hình 3D công nghiệp |
| **00:14 - 00:24** | Drone thực tế top-down/high angle lô đất | Bay thấp dần (dolly forward/down) | Đa giác vàng highlight ranh giới đất (Stroke draw $\to$ fill 0.3 opacity). Nhãn diện tích (324m²), đường kích thước 21m và đường bê tông 3.2m quy hoạch 6m chạy dọc ngõ vào |
| **00:24 - 00:28** | Drone flycam góc nghiêng 45 độ | Camera bay lùi (dolly back) bao quát ngõ ra đường chính | Ghim 3D đỏ cắm tại đất; Đường cyan phát sáng vẽ từ đất ra đường liên xã (độ dài 150m) |
| **00:29 - 00:38** | Bản đồ vệ tinh top-down | Camera xoay quét nhẹ quanh tâm lô đất | Vòng tròn quét radar vàng bán kính 8 phút bung ra (scale up); Các pin tiện ích (trường, chợ, cafe) đồng loạt pop-up |
| **00:38 - 00:48** | Bản đồ vệ tinh 2.5D nghiêng | Lia theo hướng mũi tên từ lô đất dọc về QL26 | Mũi tên nét đứt màu trắng chạy dài 3km; Các điểm tiện ích trung tâm xã (UBND, chợ, trường...) thả pin đỏ lần lượt |
| **00:49 - 00:52** | Bản đồ vệ tinh top-down rộng | Lia thẳng theo hướng Nam về trung tâm TX | Mũi tên đứt nét to màu trắng vẽ thẳng tới marker TX Ninh Hòa (5km) |
| **00:53 - 00:59** | Drone thực tế (giống cảnh 00:24) $\to$ overlay sổ đỏ | Camera tĩnh hoặc bay cực chậm | Khuôn đất đổi màu hồng (quy hoạch đất ở đô thị ONT/ODT); Ảnh trích lục sổ hồng trượt từ dưới lên (Slide Up + Fade in) |

---

### 3. ĐỒ HỌA CHI TIẾT (DESIGN SYSTEM)

*   **Bảng màu (Hex Codes):**
    *   Ranh giới / Viền xã, huyện: `#00FF66` (Neon Green), glow 8px.
    *   Ranh giới lô đất cảnh 1: `#FFFF00` (Yellow Neon), opacity fill `0.3`.
    *   Quy hoạch đất ở (cảnh cuối): `#FF007F` / `#E6007E` (Hồng đậm quy hoạch ONT).
    *   Tuyến đường kết nối: `#00FFFF` (Cyan Neon) hoặc `#FFFFFF` (Nét đứt trắng, shadow đen).
    *   Pin / Marker chính: `#E60000` (Đỏ cờ) phối viền trắng `#FFFFFF`.
    *   Vòng quét radar: `#FFFF00` (Yellow), viền solid, fill gradient radial alpha 0.2 $\to$ 0.
*   **Typography:**
    *   Font: Sans-serif hình học hiện đại, đậm (tương tự Montserrat ExtraBold, Be Vietnam Pro Black, hoặc SVN-Gotham).
    *   Màu chữ: `#FFFFFF`, viền stroke đen `#000000` (độ dày 2-4px) hoặc drop-shadow sâu `rgba(0,0,0,0.8)` 4px để chống chìm trên nền vệ tinh.
    *   Kích thước relative (Canvas 1080x1920):
        *   Tên đơn vị hành chính lớn: ~42px - 50px.
        *   Nhãn thông số đất (`324m²`): ~60px.
        *   Nhãn khoảng cách/đường đi: ~30px - 36px.
*   **Ghim & Marker Elements:**
    *   Ghim vị trí đất: Pin tròn 3D đỏ bóng, tâm trắng chấm đỏ, cắm trực tiếp vào mặt đất với hiệu ứng neo (tracking match-move).
    *   Pin tiện ích: Dạng thẻ ngang bo góc (Pill/Tag), nền đỏ/trắng, chữ trắng/đỏ tương phản.
*   **Hiệu ứng ranh giới:** Dùng kỹ thuật Stroke Dashoffset để tạo hiệu ứng vẽ viền bao quanh các xã và thửa đất; Glow bán kính 10-15px.

---

### 4. NỘI DUNG CHỮ TRÊN MÀN HÌNH (ON-SCREEN TEXT)

*   `00:00 - 00:04`: `Vị trí lô đất` (kèm pin đỏ) | `X. NINH PHỤNG` | `TX. NINH HÒA`.
*   `00:05 - 00:13`: Nhãn 7 xã: `NINH SIM`, `NINH XUÂN`, `NINH BÌNH`, `NINH QUANG`, `NINH AN`, `NINH THỌ`, `X. NINH PHỤNG`.
*   `00:15 - 00:23`:
    *   `324m²` (vàng, to nhất)
    *   `60m² TC` (hồng tím)
    *   `21m` (kích thước mặt tiền đỏ)
    *   `Đường bê tông 3,2m - QH 6m` (hộp chữ nhật nền đen/xanh).
*   `00:25 - 00:28`: `VỊ TRÍ LÔ ĐẤT` | `150m` | `ĐƯỜNG LIÊN XÃ`.
*   `00:29 - 00:37`:
    *   `Bán kính 8 phút` (chạy theo mép vòng cung vàng).
    *   Các tag: `CHỢ NINH ĐÔNG`, `TRƯỜNG THCS TRẦN QUANG KHẢI`, `TRƯỜNG TIỂU HỌC NINH PHỤNG 2`.
*   `00:39 - 00:48`:
    *   `3Km` (nằm giữa mũi tên trắng đứt nét).
    *   `QUỐC LỘ 26`.
    *   Các tag: `UBND XÃ NINH PHỤNG`, `CHỢ NINH PHỤNG`, `TRẠM Y TẾ XÃ NINH PHỤNG`, `TRƯỜNG MẦM NON NINH PHỤNG`, `TRƯỜNG TIỂU HỌC NINH PHỤNG`.
*   `00:49 - 00:52`: `5Km` | `Trung tâm TX. Ninh Hòa` (ngôi sao xanh neon).
*   `00:53 - 00:59`: `VỊ TRÍ LÔ ĐẤT` | Bản scan sổ hồng hiển thị thông tin thửa đất và tọa độ góc ranh.

---

### 5. CHUYỂN CẢNH & HIỆU ỨNG HÌNH ẢNH (TRANSITIONS & VFX)

*   **Chuyển cảnh giữa các cảnh:**
    *   Vệ tinh $\to$ Drone thực tế: Zoom blur / Dissolve nhanh kết hợp phóng to qua tầng mây (Hyperspace/Zoom transition).
    *   Cảnh thực tế $\to$ Vệ tinh: Zoom out blur kết hợp fade.
    *   Cắt thẳng (Hard cut) giữa cảnh flycam cận sang flycam trung.
*   **Motion Tracking:**
    *   Ghim và viền ranh đất ở cảnh quay Drone được match-move (3D camera tracking) bám chắc vào bề mặt địa hình thực tế khi drone di chuyển.
*   **VFX:**
    *   Glow/Neon bloom trên các đường path ranh giới.
    *   Hiệu ứng quét radar tỏa sóng bán kính 8 phút.
    *   Tô màu quy hoạch đổi từ xanh/vàng sang hồng tím (color cycle overlay).

---

### 6. CẤU TRÚC KỂ CHUYỆN (STORYBOARD FLOW)

1.  **Mở đầu (00:00 - 00:04) - Định vị vĩ mô:** Định vị khu vực từ tỉnh Khánh Hòa $\to$ Thị xã $\to$ Xã để tạo niềm tin địa lý.
2.  **Đòn bẩy tăng giá (00:04 - 00:13) - Tiềm năng quy hoạch:** Đưa dẫn chứng xã sắp lên phường + mục tiêu đô thị công nghiệp để kích thích tâm lý đầu tư.
3.  **Chi tiết tài sản (00:14 - 00:28) - Thông số vi mô:** Drone cận cảnh hiển thị ranh giới rõ ràng, diện tích, thổ cư, mặt tiền và đường vào.
4.  **Hạ tầng & Tiện ích lân cận (00:29 - 00:52) - Liên kết vùng:** Đo khoảng cách thực tế (bán kính 8 phút, 150m ra đường lớn, 3km đến chợ/UBND/QL26, 5km về trung tâm thị xã).
5.  **Chốt pháp lý & Kêu gọi hành động (00:53 - 00:59):** Khẳng định đất ở đô thị, đưa sổ hồng thật chứng minh tính an toàn $\to$ Kêu gọi liên hệ.