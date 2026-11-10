# Mục lục mẫu tham khảo

| Mẫu | Phong cách engine | Thể loại | Đặc trưng nhịp | Trạng thái |
|---|---|---|---|---|
| [Vẽ tay bút chì màu](ve-tay-but-chi/card.md) | `giay-muc` (+ đề xuất `chi-mau`, chuyển cảnh `wipe`) | Ngụ ngôn, cổ tích, thiếu nhi | Không cắt, vẽ hết cảnh rồi xóa | Ghi nhận · một phần đã có trong engine |
| [Bản đồ dữ liệu địa chính trị](ban-do-dia-chinh-tri/card.md) | `ban-do-toi` (+ cần bản đồ thật, infoPanel, pin) | Địa lý, chiến tranh, kinh tế | Lia và phóng to liên tục | Ghi nhận · có nền và màu, thiếu bản đồ |
| [Phác thảo điện ảnh sepia](phac-thao-sepia/card.md) | `phac-thao` (+ cần nội thất, tư thế ngồi và nằm) | Tâm lý, đời sống | Cảnh dài khoảng 6,6s, camera đẩy chậm | Ghi nhận · có tông màu, thiếu bối cảnh |
| [Vệ tinh ảnh thật](ve-tinh-anh-that/card.md) | `ve-tinh` (ảnh vệ tinh Esri + ảnh Wikimedia) | Địa lý, lịch sử chiến trận, công trình, dự án | Zoom liền mạch từ địa cầu, cảnh 2–4 s, chữ gõ, thẻ ảnh bay lên | Đã làm · thiếu khối 3D |
| [Vị trí & kết nối dự án](vi-tri-ket-noi-bds/card.md) | `bds` (vệ tinh nghiêng 3D, tuyến OSRM, thẻ km/phút, nhãn tự né, ảnh dự án) | Bất động sản, giới thiệu địa điểm | Mở 3,5 s, ảnh 3–4,5 s, mỗi địa điểm 5,5 s, kết 4 s | Đã làm · `bds_build.py` |
| [Quay căn hộ một mạch](quay-can-ho-tiktok/card.md) | `bds` (ảnh căn hộ: `move` linear + `walk`, bay từ vệ tinh vào phòng) | Bất động sản, căn hộ | Gần như không cắt, đi bộ liền một mạch | Đã làm · từ ảnh tĩnh |
| [Gimbal liền một cú](quay-can-ho-mau2/card.md) | `bds` (ảnh nội thất `cam`: êm, đi cong, không rung) | Bất động sản, nội thất | Không cắt | Đã làm · từ ảnh tĩnh |
| [Thí nghiệm cổ](thi-nghiem-co/card.md) | `thi-nghiem` (khung 16:9 giữa + nền mờ, chữ 2–3 từ có từ khóa vàng) | Khoa học đời thường, cách làm, mẹo dân gian | Cảnh 8–9 s, camera đẩy chậm | Đã làm bố cục · thiếu 3D thật |
| [BĐS: bản đồ tiện ích kiểu CapCut](bds-ban-do-tien-ich/card.md) (2 mẫu) | `bds-tien-ich` (ghim kim loại có icon, đường neon có tên, khối 3D lô đất, thẻ ảnh, camera nghiêng) | Bất động sản: vị trí, tiện ích | Một cảnh dài, lớp hiện dần theo nhạc | Đã làm · thiếu flycam thật |
| [BĐS: skill bản đồ hạ tầng](bds-ban-do-ha-tang/card.md) | `bds-tien-ich` (chương, tuyến nhiều màu, vòng km, chú giải, checklist) + `osrm.py`; skill `map-location-video` | Bất động sản: hạ tầng, kết nối | Chương 4–6 s | Đã làm · thiếu tự tìm hạ tầng (Overpass bị chặn) |
| [Phong cảnh anime · đạp xe](phong-canh-anime/card.md) | `phong-canh-3d` (`engine3d/phong-canh.mjs`, phối cảnh giả 3D) | Thư giãn, chill | Camera bám sau đổ dốc liên tục, 2 cảnh, chuyển cảnh mờ | Đã làm · nét phẳng hơn tranh AI |
| [Cách viết lệnh Omni](omni-prompt/card.md) | công cụ cho `anime-dong` (quay phim) | Mọi phim anime động | Clip 4–8 giây, ba nhịp có mốc giờ | Tài liệu tham khảo (MIT, rút từ Stickman Video Director) |
| [Hoạt hình tu tiên vietsub](hoat-hinh-tu-tien-vietsub/card.md) | chưa có (đề xuất `tien-hiep` + đầu mặt meme) | Truyện hài "hệ thống", tu tiên, phim bộ | Cắt ghép ảnh tĩnh, cảnh 4 s, một giọng đọc suốt, phụ đề ngoặc kép | Ghi nhận · thiếu trang phục, bối cảnh, hiệu ứng |
| Slide "Stickman Video Director" (ảnh, đầu cuộc trò chuyện) | 10 phong cách A1–B4 của skill gốc | Đa thể loại | | Tham khảo cho các gói phong cách |
