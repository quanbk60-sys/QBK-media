# BĐS vệ tinh Geolayers (mẫu TikTok @thienminh2808, người dùng gửi 17/11/2026)

- Mẫu: "Một phút giới thiệu đầy đủ về tiện ích và thông tin lô đất", 59,3 s, 576×1024, **60 fps**, 100 nghìn lượt xem, 1.462 lượt chia sẻ. Dựng bằng After Effects + GEOlayers 3. Ảnh khung: `contact.png`; đo máy: `analysis.json`; Gemini: `phan-tich-gemini.md` (có chép lời đọc).
- Phong cách engine: **`bds-geo`**. Scene mẫu: `studio/engine/examples/bds/build_scenes.py` (hàm `geo`).

## Đặc trưng mẫu
- **Nền**: ảnh vệ tinh **sáng, tươi** (xanh rừng, nâu ruộng), zoom từ cả nước xuống tỉnh → thị xã → xã, **nhòe hướng tâm** mạnh khi zoom nhanh.
- **Ranh giới hành chính**: viền **xanh neon #3DFF63** phát sáng, vẽ dần; vùng thị xã tô **xanh ngọc trong** (#3FD2B0 ~50%) chữ trắng to "TX. NINH HÒA"; xã đích viền **vàng chanh** + **gạch chéo vàng** + chữ trắng "X. NINH PHỤNG"; các xã cùng lên phường viền xanh lá có tên.
- **Ghim chính** "Vị trí lô đất": **đĩa trắng chấm đỏ** + vòng mờ, chữ trắng thường (Roboto/Arial đậm) có bóng.
- **Bài báo/văn bản** quy hoạch hiện trên nền mờ, câu quan trọng **tô vàng** như bút dạ.
- **Cảnh flycam** (14–28 s): ranh lô **vàng** tô 35%, diện tích **cyan nghiêng** "324m²" + **hồng** "60m² TC", nhãn đường **vàng xoay** theo đường, đường **cyan** viền ngõ; ghim **đỏ 3D**; hộp tối "VỊ TRÍ LÔ ĐẤT".
- **Bán kính**: vòng **vàng** viền sáng, vùng vàng trong, **quạt quét kiểu radar**, chữ cong "Bán kính 8 phút" theo mép.
- **Tiện ích**: **hộp đỏ #B5121B chữ trắng in hoa** (Roboto Condensed, 2 dòng) trên **ghim đỏ** có 2 vòng elip trắng; quán ăn là **ghim cam** nhỏ icon trắng.
- **Khoảng cách**: **mũi tên khúc trắng dày viền đen**, chữ **vàng** "3km", "5km" xoay theo mũi tên; quốc lộ **cyan** + nhãn vàng "QUỐC LỘ 26"; trung tâm thị xã là **ngôi sao xanh neon**.
- **Kết**: lô đổi **hồng** (đất ở đô thị), ảnh **sổ hồng** viền đỏ trượt lên.
- **Âm thanh**: **có lời đọc**, giọng nam (Gemini nghe là miền Nam, cần người nghe lại), ~145 từ/phút, quảng cáo tự tin. Nhạc corporate ~120 BPM đều. Whoosh khi zoom, pop/ding khi nhãn hiện, tiếng quét radar, tiếng "cạch" khi hiện sổ.
- **Cấu trúc 60 s**: vị trí hành chính → tiềm năng quy hoạch (có dẫn chứng báo) → thông số lô (flycam) → đường vào → bán kính tiện ích → khoảng cách tới quốc lộ, trung tâm xã, trung tâm thị xã → pháp lý (sổ) → kêu gọi liên hệ.

## QBK làm thế nào
- Vệ tinh Esri `--grade 1.02,1.18,1.06` (sáng, rực). Ranh giới thật từ OpenStreetMap qua Nominatim (`polygon_geojson`), chợ/trường/quốc lộ cũng từ OSM. Lưu ý ranh giới sau sáp nhập 2025 khác trước: ghi "(cũ)" khi dùng ranh cũ.
- Cảnh flycam thay bằng vệ tinh zoom 18 (chưa có flycam). Có flycam thật thì dùng `bgphoto` + `ipts`.

## Đã có trong engine
`bds-geo`, `boundary` (glow, fill, hatch, label, grow), `pin` target/red/orange, `ring` radar, `arrow` dash, `neon` road, `tagbox` yellow/dark/red, `lot` yellow/magenta, `card` doc, `icon` star, `zoomBlur`.

## Còn thiếu
- Thẻ "bài báo tô vàng" (trang văn bản trên nền mờ với dòng highlight). Làm được bằng `card` doc với ảnh chụp bài báo, nhưng chưa có hiệu ứng tô dạ quang động.
- Ghim đỏ **3D** (mẫu có khối, bóng). Engine vẽ ghim 2D bóng gradient.
- Flycam thật và mặt cắt ruộng 3D.

## Hợp với
Đất nền tỉnh, đất vườn, lô đất cần giải thích quy hoạch, pháp lý. 45–60 s, có lời đọc.

## Lưu ý
Thông tin quy hoạch, sổ đỏ là dữ kiện nhạy cảm pháp lý: chỉ dùng văn bản và giấy tờ người dùng cung cấp, che số sổ, tên chủ. Không tự khẳng định "sắp lên phường" khi không có văn bản.
