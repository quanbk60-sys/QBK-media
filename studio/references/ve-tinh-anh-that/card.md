# Vệ tinh ảnh thật (mẫu người dùng gửi 09/11/2026)

- Mẫu: video 65 s, 576×1024, quảng cáo dự án lấn biển Cần Giờ (TikTok @lopphovlog), do Claude dựng. Ảnh khung: `contact.png` (1 khung/3 s).
- Phong cách engine: **`ve-tinh`** (`lib/geo.mjs`). Phim đầu tiên: `projects/bach-dang-ve-tinh/`.

## Đặc trưng
- Nền **ảnh vệ tinh thật** (Esri World Imagery, ghi "Esri, Maxar, Earthstar Geographics" góc trên phải), hơi tối và nhạt. Mở bằng **địa cầu xoay**, zoom liền mạch xuống địa điểm. Có mây trắng trôi ở mức zoom trung bình.
- Chữ: **dòng nhỏ cam nghiêng** (kicker) và **tiêu đề lớn trắng siêu đậm**, căn trái ở khoảng y = 250–400 (khung 1920). Dòng phụ cam đậm. Tiêu đề **gõ từng chữ** ("S" rồi "SINGAPORE").
- Ghim trắng hình giọt nước kèm **nhãn hộp trắng chữ đen** viết hoa.
- **Thẻ ảnh thật kiểu polaroid**: viền trắng, nghiêng nhẹ, đổ bóng, bay lên; dòng nhỏ dưới ảnh ghi tác giả và giấy phép (Wikimedia, CC BY-SA).
- **Ô số liệu**: ô vuông cam bo góc chứa icon trắng, số lớn trắng, nhãn xám viết hoa. Hiện lần lượt.
- **Đường đi màu cam phát sáng** tự vẽ dần. Tuyến dự kiến màu xanh. Nhãn hộp màu trên đường.
- Khối 3D cam mọc lên (tòa nhà): engine chưa có.
- Chú thích nhỏ "*Theo…" ở đáy. Cuối video có khung kêu gọi bình luận.
- Video mẫu **không có phụ đề**. Video QBK vẫn giữ phụ đề (y = 1450, chữ trắng viền đen, font Inter Display Black).

## Cách làm trong QBK
1. Tải ảnh vệ tinh: `python3 studio/tools/satmap.py <dự án>/sat --level 4:world --level Z:LAT,LON:WxH ...`, mỗi mức zoom cách nhau 2 (xem `projects/bach-dang-ve-tinh/fetch_sat.sh`). Mức có kích thước W×H phải phủ được khung nhìn: ở zoom z, khung cần khoảng 1080×1920 px nhân 2^(Z_level − z).
2. Dò tọa độ: `python3 studio/tools/satgrid.py <sat>/satmap.json Z out.jpg --step 0.01 --crop ...`.
3. Ảnh thật: `python3 studio/tools/commons.py <dự án>/photos "File:…"`, rồi điền **tác giả và giấy phép** vào `commons.json` (khi API Commons bị 429 thì tra bằng tìm kiếm web trang File:). Chỉ dùng ảnh CC0, PD, CC BY, CC BY-SA. Không rõ giấy phép thì bỏ.
4. Phân cảnh: shot có `view` (lat, lon, zoom theo thời gian), không dùng `camera`. Xem SCENE_FORMAT.md, mục "Phong cách vệ tinh".

## Còn thiếu
- Khối 3D mọc lên (tòa nhà, công trình).
- Đường sông và bờ biển lấy từ OpenStreetMap (Overpass chập chờn; hiện đang dò tay trên ảnh).
- Chuyển cảnh lia ngang giữa hai địa điểm xa nhau (hiện dùng zoom ra rồi zoom vào).
