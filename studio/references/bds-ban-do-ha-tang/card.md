# BĐS: skill "bản đồ hạ tầng" (video mẫu người dùng gửi 10/11/2026)

- Mẫu: 106 s, 576×1024, một người giới thiệu skill AI làm video bản đồ hạ tầng quanh một dự án ở Nam Từ Liêm (Hà Nội), có quay màn hình Claude Code và video kết quả. Ảnh khung: `contact.jpg`, số đo `analysis.json`.
- Skill trong video không công khai (người đăng xin bình luận "SKILL" để nhận). QBK **dựng lại cách làm** bằng engine của mình: phong cách **`bds-tien-ich`**, công cụ `studio/tools/osrm.py`. Skill gần giống người dùng gửi kèm: `.claude/skills/map-location-video/`.

## Lời thoại (chép lại bằng máy, tóm tắt)
"Chỉ với một cú click, AI làm video dạng bản đồ: dự án nằm ở đâu, gần ga metro nào, ra sân bay có thuận tiện không… Gọi skill bản đồ hạ tầng, đưa vị trí dự án (số 1 Lê Quang Đạo, Mỹ Trì, Nam Từ Liêm), bấm chạy, đợi khoảng 20 phút. AI tự nhận ra Đại lộ Thăng Long, Cung Hữu nghị, sân vận động Mỹ Đình, Vành đai 3 – Phạm Hùng, bến xe Mỹ Đình, Keangnam, metro (Nhổn, ga Phùng Khoang), đường tới trung tâm thương mại, đường ra sân bay."

## Quy trình của skill (đọc từ màn hình)
1. Người dùng gọi skill và nhập địa chỉ dự án.
2. AI tìm hạ tầng quanh dự án từ **OpenStreetMap** (Overpass: đường lớn, tuyến metro, ga, cầu, sân bay, trung tâm thương mại), lấy hình học tuyến.
3. Chia video thành **chương** (mỗi chương 4–6 s): *Ngay cửa nhà* → *Vành đai 3 · Phạm Hùng* → *Metro đang chạy* → *Trung tâm thương mại* → *Cầu & sân bay*.
4. Render 1080×1920, khoảng 27 s, tự soát khung hình (bảng 9 khung), tự ghi bài học vào SKILL.md.

## Đặc trưng hình
- Nền vệ tinh nhìn thẳng, tối và nhạt. **Tiêu đề chương** chữ vàng to, viền tối, ở trên.
- Nhãn dự án: **hộp trắng chữ xanh than** ("The Matrix One") + chấm đỏ.
- **Mỗi tuyến một màu:** vàng (đại lộ), đỏ (đường nội khu), tím (vành đai), xanh dương và xanh ngọc (metro), xanh lá (đường tới TTTM), cam (đường ra cầu, sân bay). Ghim tròn màu có icon (bus, tàu, máy bay).
- **Nhãn địa điểm** chữ màu viết hoa viền trắng + dòng nhỏ "cách The Matrix One · 3,2 km".
- **Vòng bán kính 5 – 10 – 20 km** nét đứt khi nói về sân bay (zoom ra).
- **Chú giải** (legend) hộp trắng 2 cột ở cuối: màu từng tuyến + tên.
- Đoạn giới thiệu cách làm: tiêu đề viên thuốc đỏ "CÁCH LÀM" và **danh sách tích xanh** (Gọi skill / Nhập vị trí / Bấm chạy / Đợi AI dựng video); "AI TỰ NHẬN RA" + danh sách tích xanh; nút "BÌNH LUẬN: SKILL".

## Đã có trong engine (phong cách `bds-tien-ich`)
- Tiêu đề chương `chapter`, ghim dự án + hộp tên `project`, ghim có icon `poi` (dòng phụ "cách … km"), tuyến nhiều màu `route` (`neon`), vòng bán kính `rings`, chú giải `legend`, danh sách tích xanh `checklist`, nút kêu gọi `cta`, thẻ km và phút `info`.
- Tuyến đường thật và km/phút: `studio/tools/osrm.py` (OSRM công cộng, miễn phí).

## Còn thiếu
- **Tự tìm hạ tầng quanh dự án** (Overpass): máy chủ Overpass, Nominatim, Photon đang bị chặn từ máy cloud. Hiện phải lấy danh sách địa điểm và tọa độ từ người dùng, Wikipedia, hoặc dò trên ảnh vệ tinh (`satgrid.py`). Muốn tự động: mở mạng tới `overpass-api.de` (người dùng thêm trong cài đặt môi trường).
- Hình học **tuyến metro, vành đai** (không phải đường lái xe) cũng cần Overpass; OSRM chỉ cho đường đi.

## Hợp với
Video dự án căn hộ, khu đô thị: kết nối giao thông, metro, vành đai, sân bay; video so sánh vị trí.

## Lưu ý
- Không chép tên dự án, khuôn mặt, tên kênh của mẫu.
- Không nói "AI tự nhận ra" nếu dữ liệu do người dùng nhập. Không bịa tuyến đang thi công là "đang chạy": phải có nguồn.
