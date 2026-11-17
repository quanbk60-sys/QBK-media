# BĐS bản đồ navy 3D (mẫu TikTok @zinmediabds, người dùng gửi 17/11/2026)

- Mẫu: "Sun Symphony 5 – Bản đồ mô tả tiện ích BĐS!", 27,2 s, 576×1024, 30 fps, 13,8 nghìn lượt xem, 173 lượt chia sẻ. Ảnh khung: `contact.png`; đo máy: `analysis.json`; Gemini: `phan-tich-gemini.md`.
- Phong cách engine: **`bds-navy`**. Scene mẫu: `studio/engine/examples/bds/build_scenes.py` (hàm `navy`).

## Đặc trưng mẫu
- **Mở đầu** 0–1 s: ảnh vệ tinh toàn vùng zoom cực nhanh rồi hoà sang **bản đồ vector xanh navy**.
- **Bản đồ**: nước **#105283** (sáng hơn đất), đất **#063360**, đường phố mảnh xanh thép #2F577E–#3D6690, khối nhà nhạt hơn đất chút. Không có chữ của bản đồ. Toàn video **không cắt**: camera bay liên tục, **nghiêng 3D ~35–45°**, xoay, zoom ra vào mượt.
- **Dự án**: ảnh tòa nhà (cắt nền) trong **thẻ kính viền xanh lá + logo + số "5"** vàng, cột trắng xuống mặt bằng phân lô nổi khối trắng.
- **Tên sông** "SÔNG HÀN" **rất lớn** (Montserrat Black nghiêng, trắng), xoay theo dòng sông, trượt vào.
- **Mũi tên khoảng cách**: thân **trắng → xanh lá #27E45A**, đầu tam giác xanh, quầng sáng; nhãn "1.5KM", "2.5KM" trắng nghiêng chạy dọc mũi tên.
- **Cầu Rồng** vẽ bằng **đường neon cyan có thanh ngang** (như cái thang phát sáng).
- **Thẻ ảnh tiện ích**: ảnh thật trong khung bo góc viền sáng, **chữ vàng in hoa nhỏ** trên dải kính tối dưới ảnh, vạch sáng, **cột sáng trắng** xuống **chấm trắng có vòng lan** trên mặt đất. Nảy lên từ dưới.
- **Nhãn chữ** ("BIỂN MỸ KHÊ"): hộp kính navy viền cyan phát sáng, chữ trắng in hoa giãn chữ, cột sáng xuống chấm.
- **Sân bay**: vùng tô **xanh lá đậm**, **máy bay vàng chanh phát sáng** to, nhãn kính.
- Watermark "ZIN MEDIA" trắng mờ giữa khung.
- **Âm thanh**: **có lời đọc**, giọng nam miền Bắc (TTS chất lượng cao), ~150 từ/phút, tự tin, rõ. Nhạc corporate tech ~120 BPM thấp hơn giọng ~18 dB. Whoosh khi zoom, swoosh khi mũi tên bắn, pop khi thẻ hiện. Lời đọc khớp từng phần tử (nói "Cầu Rồng 1,5 km" đúng lúc mũi tên tới Cầu Rồng). Kết bằng câu kêu gọi liên hệ.

## QBK làm thế nào
- Bản đồ navy: `satmap.py --source navy` lấy nền Esri World Dark Gray, **tự xóa chữ in sẵn**, tô lại đúng bảng màu mẫu. Cần mức zoom 16 cho cảnh gần.
- Nghiêng/xoay: `view.tilt`, `view.rot`; engine tái lấy mẫu phối cảnh từng điểm ảnh, phần tử theo `geo` bám đúng.
- Cầu, sân bay, bãi biển, tên đường: hình học thật từ OpenStreetMap (Nominatim). Khoảng cách trên mũi tên tính từ toạ độ (haversine), không ước lượng.

## Đã có trong engine
`bds-navy`, `--source navy`, `tilt/rot`, `card` navy (có `frame`, `badge`), `tagbox` glass, `arrow` green, `boundary` (`rungs` cho cầu, vùng sân bay), `icon` plane, `btext` + `along`.

## Còn thiếu
- Mặt bằng phân lô và tòa nhà **nổi khối 3D** của dự án (mẫu dùng ảnh render của chủ đầu tư). Thay bằng ảnh thật/ảnh dự án người dùng cung cấp trong thẻ.
- Lớp chuyển từ vệ tinh sang navy (hoà 2 satmap). Hiện scene dùng một satmap; muốn có thì thêm satmap thứ hai.

## Hợp với
Dự án căn hộ, khu đô thị: "vị trí tâm điểm + cách X km + tuyến đường kết nối + tiện ích vùng". 25–40 s, có lời đọc.

## Lưu ý
Tên dự án, logo, ảnh phối cảnh là tài sản của chủ đầu tư: chỉ dùng khi người dùng cung cấp và có quyền. Khoảng cách phải có nguồn hoặc tính từ toạ độ và ghi rõ "đường chim bay".
