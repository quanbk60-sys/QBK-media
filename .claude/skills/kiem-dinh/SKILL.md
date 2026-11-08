---
name: kiem-dinh
description: Kiểm định chất lượng video QBK trước khi giao người dùng, gồm đối chiếu dữ kiện với nguồn, chính tả phụ đề và chữ trên hình, bố cục và vùng an toàn TikTok/Shorts, nhịp hình, âm thanh, thông số file. Ghi qa.md và trả lỗi về đúng bộ phận. Dùng cho vai kiểm định.
---

# Kiểm định: `qa.md`

Ghi `projects/<slug>/qa.md` gồm bảng `Hạng mục | Kết quả (ĐẠT/LỖI) | Chi tiết | Giao cho`. Kết luận chung: **ĐẠT** hoặc **CẦN SỬA**.

## 1. Nội dung, sử liệu → `bien-kich`
- Mỗi câu khẳng định trong `narration.txt` phải có dòng tương ứng trong `sources.md`, trạng thái "Đã xác nhận" hoặc "Hư cấu".
- Không có số liệu, ngày tháng hay trích dẫn nào nằm ngoài `sources.md`.
- Chữ trên hình (`text` trong `scene.json`) không được thêm dữ kiện mới chưa kiểm chứng.
- Hình ảnh không sai thời đại (trang phục, vũ khí, biểu tượng).

## 2. Chính tả, ngôn ngữ → `bien-kich` hoặc `dao-dien`
- Đọc toàn bộ `captions-audio.json` và mọi `text`: dấu tiếng Việt, tên riêng viết hoa đúng.
- Phụ đề ghép lại phải khớp `narration.txt`.

## 3. Hình ảnh, bố cục → `dao-dien` (hoặc `hoa-si` nếu lỗi do engine)
Trích khung hình ở **mỗi lần đổi shot**, cộng 1 khung giữa mỗi shot dài hơn 3 giây, rồi xem từng khung:
- Không vật thể nào đè lên phụ đề (y 1370–1470). Không đặt nội dung quan trọng dưới y 1550 hay sát lề phải.
- Chữ trên hình không tràn mép, không đè nhân vật.
- Nhân vật đúng trang phục ở mọi cảnh.
- Không cảnh nào đứng yên quá 2,5 giây (so `scene.json` với lời đọc).
- Hook 3 giây đầu có chữ lớn và chuyển động.

## 4. Âm thanh → `dung-phim` hoặc `long-tieng`
- `volumedetect`: max trong khoảng −3 đến −0,5 dB, không bị vỡ tiếng.
- SFX không trùng chữ quan trọng. Có tiếng bút khi bàn tay vẽ.
- Ghi chú rõ là máy không nghe được chất lượng giọng đọc, cần người nghe thử.

## 5. Kỹ thuật → `dung-phim`
- Giải mã không lỗi. 1080×1920, 30fps, h264 và aac.
- Thời lượng khớp giọng đọc. TikTok và Shorts nên dưới 3 phút; mục tiêu kênh là 60–90 giây.
- Có file `.srt` đi kèm.

## Quy tắc
- Chỉ báo lỗi có bằng chứng (khung hình, mốc thời gian, dòng file). Không sửa thay bộ phận khác.
- Tối đa 2 vòng sửa. Sau 2 vòng mà vẫn lỗi thì báo Nhà sản xuất để hỏi người dùng.
