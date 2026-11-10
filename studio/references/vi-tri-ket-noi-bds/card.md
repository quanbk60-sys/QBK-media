# Vị trí & kết nối dự án (skill `map-location-video`, người dùng gửi 10/11/2026)

- Nguồn: skill zip người dùng gửi, lưu nguyên văn trong `skill-goc/` (SKILL.md, 3 file JS). Skill này chạy trong **trình duyệt tích hợp của app Claude desktop** (canvas + MediaRecorder → WebM), không chạy trong phiên cloud của QBK.
- Phong cách engine gần nhất: **`ve-tinh`** (`lib/geo.mjs`). Thể loại: giới thiệu vị trí dự án, quán, trường, điểm du lịch: "xung quanh có gì, đi mất bao lâu".

## Cấu trúc video (576×1024, 30 fps, T = 3,5 + 5,5·N + 3,5 s; N = 3–6 địa điểm)
1. **Mở 3,5 s**: camera nghiêng dần 15° → 40°, zoom 12,8 → 15. Chữ 2 dòng (dòng 2 vàng) + câu phụ, rồi mờ đi.
2. **Mỗi địa điểm 5,5 s**: camera lùi đến khi cả tuyến vừa khung → tuyến OSRM vẽ dần (3 lớp: quầng 14 px mờ, 7 px màu, lõi trắng 2,2 px, đầu chấm trắng) → ghim địa điểm bật lên → label → thẻ dưới: icon tròn, `LOẠI · 01/04`, tên, 2 chip `x,y km` và `n phút`.
3. **Kết 3,5 s**: lùi xa thấy mọi tuyến (mờ 60%), thẻ lớn: tên, tagline, nút CTA vàng kim loại, ghi chú "tham khảo".
- Thanh trên y=64 (tên dự án trái, khu vực phải), thanh tiến trình N đoạn ở y=82, mỗi đoạn màu của địa điểm.
- Chân: dòng chính + dòng nguồn "Ảnh vệ tinh: Esri, Maxar · Đường: © OpenStreetMap · Số liệu ước tính" (bắt buộc giữ).

## Điểm kỹ thuật đáng học
- **Camera nghiêng 3D giả** (strip warp): vẽ bản đồ phẳng lên canvas phụ, rồi chép từng dải ngang 1–2 px lên khung với độ rộng theo phối cảnh. Ghim dự án luôn ở tâm (y=500).
- **Zoom tự động**: lùi z từ 16,2 xuống 0,02 mỗi bước đến khi mọi điểm tuyến nằm trong x 80..W−80, y 215..(đỉnh thẻ − 44).
- **Ghim kim loại**: gradient 5 nấc. gold = dự án, mua sắm; blue = kết nối (sân bay, giao thông); ruby = y tế.
- **Đặt label 3 hướng**: trên (mặc định) / trái (nếu tràn phải) / phải (nếu tràn trái), né logo + thân ghim dự án, cách thẻ ≥ 14 px; hết đường thì `center*` dịch vào trong.
- **Tự kiểm tra bố cục**: dựng mỗi 0,2 s, ghi hình chữ nhật mọi chữ/label/thẻ, báo vi phạm lề 36 px, label chồng nhau, label đè icon, label sát thẻ. Phải bằng 0 mới ghi.
- Dữ liệu: tuyến + km + phút từ **OSRM** (router.project-osrm.org, xe hơi, không có kẹt xe → ghi "ước tính"), tọa độ từ Photon, đối chiếu tên để không lấy nhầm dự án trùng tên. Không có tọa độ thật thì ghi rõ "vị trí tạm".

## So với QBK hiện có
| Skill gốc có | Engine `ve-tinh` hiện có |
|---|---|
| Nghiêng 3D 40° | Chỉ nhìn thẳng từ trên (chưa có) |
| Tuyến OSRM thật | `route` có, nhưng path dò tay |
| Ghim + label kim loại, tự né | `marker`, `tag` (trắng/cam/xanh/đỏ), không tự né |
| Thẻ địa điểm km/phút, tiến trình | `stats` gần giống, chưa có thẻ đúng kiểu |
| Kiểm tra va chạm tự động | `dung-phim` có soát chồng lấn, chưa ở mức từng label |
| Không giọng đọc, không phụ đề, WebM | QBK có giọng Gemini, phụ đề, sfx, MP4 1080×1920 |

Mạng phiên cloud (kiểm 10/11/2026): Esri tile 200, OSRM 200, Photon **bị chặn**. Tọa độ địa điểm phải lấy cách khác (người dùng cung cấp, tra web, hoặc dò trên ảnh bằng `satgrid.py`).

## Đề xuất đưa vào engine (chưa làm)
1. `studio/tools/osrm.py`: lấy tuyến, km, phút cho danh sách điểm → JSON dùng trực tiếp cho `route.path`.
2. Phần tử `poiCard` (thẻ dưới) + `progress` (thanh N đoạn) + biến thể `marker` kim loại gold/blue/ruby.
3. Thuộc tính `tilt` cho `view` (strip warp như skill gốc).
4. Bộ đặt label tự né + kiểm tra va chạm trong `dung-phim`.
