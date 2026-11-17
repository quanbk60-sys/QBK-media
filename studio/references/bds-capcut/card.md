# BĐS vệ tinh CapCut (mẫu TikTok @zinmediabds, người dùng gửi 17/11/2026)

- Mẫu: "Vẽ Map BĐS trên CapCut quá dễ với học viên của Zin Media!", 28,4 s, 576×1024, 30 fps, 14,7 nghìn lượt xem. Ảnh khung: `contact.png`; đo máy: `analysis.json`; Gemini: `phan-tich-gemini.md`.
- Phong cách engine: **`bds-capcut`**. Scene mẫu: `studio/engine/examples/bds/build_scenes.py` (hàm `capcut`).

## Đặc trưng mẫu
- **Nền**: ảnh vệ tinh kiểu Google Earth, **tối và nhạt màu** (độ sáng 0,35, độ rực 0,07), có nhãn địa điểm nhỏ của bản đồ. Một mảng **làm mờ** cố định ở giữa dưới (che nguồn bản đồ).
- **Tiêu đề cố định suốt video** ở đỉnh: dòng 1 Montserrat Black in hoa y ≈ 12% ("VẼ **MAP** TRÊN **CAPCUT**", từ khóa vàng #FFD21F), dòng 2 Montserrat nghiêng mảnh, to gần bằng, trắng ("Bài tập học viên"), bóng mờ.
- **Nhịp** (5 đoạn): zoom cực nhanh từ toàn thành phố vào khu đất có nhòe chuyển động (0–2 s) → ghim + đường + vòng bán kính + tiện ích (2–10,5 s) → **crash zoom** xuống thửa đất (10,5–12 s) → khu đất xanh + số đo (12–16,5 s) → zoom ra, đường nét đứt tới 2 ảnh tròn (16,5–25 s) → zoom ra toàn vùng.
- **Ghim "VỊ TRÍ ĐẤT"**: giọt nước vàng ánh kim lõi trắng; nhãn vàng **nghiêng** phía trên.
- **Tia laser** dọc trục đường chính: thon hai đầu, lõi trắng, quầng **xanh dương #2E8BFF**, có chớp sáng. Quét vào từ trái (0,4 s).
- **Nhãn tên đường**: hộp trắng, chữ xanh đậm (Montserrat ExtraBold, chữ thường), **vạch xanh bên trái**, cột trắng dẫn xuống đường.
- **Vòng bán kính**: elip/vòng vàng mảnh #EED650, quầng nhẹ, bung từ tâm 0,5 s.
- **Ghim tiện ích** vàng nhỏ, lõi trắng icon xám, nhãn vàng in hoa viền tối; hiện cách nhau ~0,2–0,5 s.
- **Thửa đất**: hình chữ nhật xanh #1E7BFF trong suốt, viền **cyan phát sáng** rất mạnh; **diện tích vàng to** (Montserrat Black ~80 px) ở giữa; **đường kích thước** trắng có vạch chặn hai đầu, số "5m" dưới đáy, "23m" dọc cạnh phải (xoay 90°). Ảnh nền ở mức zoom này nhòe (phóng quá độ phân giải), mẫu vẫn để vậy.
- **Ảnh tròn**: ảnh thật trong vòng tròn viền trắng, **đuôi trắng hình phễu** mờ dần trỏ xuống địa điểm; nối từ ghim bằng **nét đứt vàng** cong.
- **Âm thanh**: không lời đọc. Glitch-hop/trap ~118 BPM, whoosh khi zoom, ding khi ghim, tick khi hiện số đo.

## QBK làm thế nào
- Ảnh vệ tinh Esri (`satmap.py --grade 0.78,0.9,1.12` cho tông tối nhạt), không có nhãn bản đồ (sạch hơn mẫu). Không thêm mảng mờ (mẫu dùng để che nguồn, QBK ghi nguồn Esri).
- Zoom nhanh dùng `ease: "in"` + `zoomBlur`. Đường lấy đúng toạ độ trục đường (dò trên ảnh), tiện ích đặt theo vị trí thật.

## Đã có trong engine
`bds-capcut`, `neon` laser, `tagbox` road, `ring` thin, `pin` gold/yellow, `lot` blue + `dims`, `card` bubble, `arrow` ydash, `btext` (tiêu đề 2 dòng), `zoomBlur`.

## Còn thiếu
- Nhãn địa danh nhỏ của bản đồ (Google). Esri World Imagery không có; có thể thêm lớp nhãn Esri Reference nếu cần.
- Video trong ảnh tròn (mẫu chạy video máy bay, Cầu Rồng phun lửa); engine dùng ảnh tĩnh có Ken Burns.

## Hợp với
Đất nền, nhà phố trong phố: vị trí + tiện ích bán kính + kích thước thửa + khoảng cách tới điểm nổi tiếng. 20–30 s.

## Lưu ý
Số đo thửa (diện tích, mặt tiền, chiều sâu) phải lấy từ sổ hoặc chủ nhà, ghi trong `sources.md`. Scene mẫu dùng số minh hoạ.
