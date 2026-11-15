# BĐS · Google Earth tối (mẫu người dùng gửi 15/11/2026)

- **Mẫu:** TikTok @vuotaiai (7708243052363631890), 84 s, 576×1024: giới thiệu một khu đô thị ở TP.HCM bằng ảnh vệ tinh kiểu Google Earth, lời đọc nam. 12 s đầu là cảnh người thật nói (không học phần này). Ảnh khung: `contact.jpg`, số đo `analysis.json` (độ sáng 0,28, độ bão hòa 0,07, gần như không cắt cứng: 3 cắt / 84 s).
- **Phong cách engine:** `bds-earth` (`studio/engine/lib/earth.mjs` + chuyển cảnh `zoomblur` trong `lib/scene.mjs`). Demo: `projects/_mau-bds-earth/`.

## Đặc trưng
- **Nền:** ảnh vệ tinh nhìn thẳng, **tối và gần như không màu**, ngả xanh rêu, viền tối quanh khung. Mọi màu nổi đều đến từ đồ họa.
- **Viền neon tự chạy:** viền dự án xanh lá chạy dọc ranh giới, đầu là chấm trắng như sao chổi, quầng nhiều lớp. Ranh quận màu bạc hà, tiện ích khác màu hồng (một màu cho mỗi đối tượng), công viên bên trong màu vàng chanh.
- **Biển tên dự án:** thẻ trắng bo góc đứng trên cột mảnh, chân cột là chấm phát sáng.
- **Thẻ nhãn tối** "• TÊN" chữ hoa nhỏ, nối về điểm bằng đường mảnh, điểm có chấm sáng và vòng trắng.
- **Thẻ ảnh** bo góc viền tối bật lên phía trên bản đồ (ảnh thật của địa điểm). Có cảnh **hai thẻ ảnh trên nền mờ** cho phần tiện ích nội khu.
- **Chữ:** tiêu đề chữ đậm giãn rộng màu trắng, dòng phụ nhỏ màu xanh chanh. Từ khóa chương ("TRỤC GIAO THÔNG", "TIỆN ÍCH", "KẾT NỐI THUẬN TIỆN") chữ trắng to ở 2/3 dưới khung. **Số liệu**: nhãn nhỏ trắng + số lớn xanh chanh ("QUY MÔ 82,6 HA"), vòng phần trăm cho mật độ xây dựng.
- **Đường giao thông:** vệt vàng dày tự chạy, có thẻ nhãn tên đường. Mũi tên vàng và mũi tên trắng nét đứt chỉ hướng tới các quận.
- **Chuyển cảnh:** **zoom nhòe phóng tâm** như cú bay Google Earth (bay ra để thấy vùng rộng, bay vào để thấy chi tiết). Trong cảnh, camera đẩy hoặc lia rất chậm.
- **Âm thanh:** lời đọc nam năng động, nhạc nền nhẹ. **Không có phụ đề**: chữ to trên hình đóng vai trò từ khóa.

## Đã có trong engine (`bds-earth`)
- `grade` (chỉnh màu tối kiểu Google Earth), `outline` (viền neon tự chạy có đầu sao chổi, `fill` mờ), `etag` (thẻ nhãn tối có đường dẫn), `sign` (biển tên trên cột), `ecard` (thẻ ảnh bo góc), `ebig` (chữ to nhiều dòng, mỗi dòng một màu), `estat` (số liệu đếm lên), chuyển cảnh `zoomblur` (`blurDir` 1 vào, −1 ra).
- Dùng chung mọi phần tử của `ve-tinh` và `bds-tien-ich`: `route` neon (đường vàng), `rings`, `poi`, `photo`...

## Còn thiếu (làm khi cần)
- Vòng phần trăm (mật độ xây dựng) và cảnh hai thẻ ảnh trên nền mờ: chưa có phần tử riêng.
- Mũi tên trắng nét đứt: dùng `route` với `dashed: true`, `head: 'arrow'`.
- Ranh quận/phường: cần đa giác ranh giới (OpenStreetMap). Chưa có công cụ tải tự động.

## Hợp với
Giới thiệu dự án, khu đô thị, căn hộ: vị trí, ranh giới, giao thông, tiện ích quanh khu, quy mô. Lời đọc ngắn, dứt khoát.

## Lưu ý
- Không chép logo, tên kênh, watermark của mẫu; logo chủ đầu tư chỉ dùng khi người dùng gửi và có quyền.
- **Không bịa:** quy mô, mật độ, khoảng cách phải có nguồn trong `sources.md`; km lấy từ OSRM thì ghi "ước tính"; ranh giới dò tay thì ghi "gần đúng".
- Ảnh vệ tinh Esri ghi nguồn (tự hiện góc trên). Ảnh thật trong thẻ ảnh: Wikimedia có tác giả, giấy phép, ghi ngay dưới thẻ.
