---
name: hoc-mau
description: Học từ mẫu tham khảo. Khi người dùng gửi video, ảnh hoặc link mẫu về phong cách hay cách kể, phân tích bằng máy (nhịp cắt, bảng màu, độ sáng, âm thanh) và bằng mắt (khung hình), viết thẻ kiến thức vào studio/references/, cập nhật mục lục, đề xuất hoặc tạo gói phong cách mới cho engine. Dùng khi người dùng nói "tham khảo mẫu này", "học phong cách này", hoặc gửi video mẫu.
---

# Học từ mẫu tham khảo

## 1. Đo bằng máy
```bash
python3 studio/tools/analyze_ref.py <video> studio/references/<slug> [--crop top,bottom]
```
- Video quay màn hình điện thoại thì cắt bớt thanh trạng thái và nút bên dưới, ví dụ `--crop 0.06,0.2`. Xem ảnh `contact.png` để chọn mức cắt cho đúng.
- Kết quả: `analysis.json` (thời lượng, số lần cắt, độ dài trung bình mỗi cảnh, bảng màu, độ sáng, độ rực màu, tỉ lệ có tiếng, độ lớn âm), `contact.png`, `frames/`.
- **Không lưu video gốc vào repo** (nặng, có thể có bản quyền). Chỉ giữ phần phân tích và ảnh khung hình nhỏ.
- Ảnh tĩnh thì bỏ qua script, xem trực tiếp. Link web thì chỉ dùng được nếu mạng cho phép; nếu không, nhờ người dùng tải về rồi gửi.

## 2. Nhìn và nghe (dùng Read để xem `contact.png` và các ảnh trong `frames/`)
Ghi lại cụ thể:
- **Hình:** nền, bảng màu (dùng mã màu đo được), kiểu nét (dày mỏng, đều hay run tay), cách tô màu, mức chi tiết, nhân vật trông thế nào, kiểu chữ trên hình.
- **Bố cục:** nhân vật đặt ở đâu, chữ ở đâu, có khung hay dải đen không, phụ đề nằm ở đâu.
- **Chuyển động:** kiểu cắt cảnh (cứng, liền mạch, vẽ tay, camera lia), nhịp (số giây mỗi cảnh), động tác nổi bật.
- **Âm thanh:** giọng nói (có tiếng bao nhiêu phần trăm thời gian), nhạc, hiệu ứng.
- **Cách kể:** hook, cấu trúc, cách kết (nếu nghe hoặc đọc được).

## 3. Viết thẻ kiến thức `studio/references/<slug>/card.md`
Theo mẫu các thẻ đã có. Bắt buộc có các mục:
- **Đã có trong engine:** phong cách, đạo cụ, tính năng nào đang dùng được.
- **Còn thiếu:** cụ thể từng đạo cụ, tư thế, hiệu ứng, phong cách.
- **Hợp với:** thể loại.
- **Đề xuất:** gói phong cách mới, hoặc điều chỉnh gói đang có.
- **Lưu ý:** bản quyền, chủ đề nhạy cảm, điểm khác với quy tắc chung của đoàn phim.

Sau đó thêm một dòng vào `studio/references/index.md`.

## 4. Biến thành năng lực của đoàn phim
- **Điều chỉnh nhỏ** (đổi màu, độ dày nét, nền của một phong cách có sẵn): sửa `studio/engine/lib/styles.mjs`.
- **Nguyên tắc:** **Trung thành với mẫu.** Làm đúng phong cách người dùng gửi. **Không dùng người que.** **Không làm người thật** (ảnh, video người như thật, người dẫn như thật). Nhân vật người luôn **vẽ kiểu anime** (người dùng chốt 09/11/2026). Mẫu có người thật thì làm bản anime cùng bố cục, nhịp, không khí; mẫu là tranh AI thì dựng bằng ảnh AI Gemini (`studio/tools/genimage.py`, trong trần `studio/budget.json`) với nhân vật **do studio tự tạo**, code lo chuyển động. Phần nào công cụ hiện có không làm được (ví dụ khẩu hình mượt như video AI) thì làm bản gần nhất có thể và ghi rõ, hoặc đặt `status: "loi"` kèm phương án; **không bao giờ lặng lẽ đổi sang phong cách khác**.
- **Mẫu là ảnh AI hoặc người thật:** tạo phong cách `userImages: true` (engine `anh`): người dùng tự tạo ảnh bên Gemini và gửi qua mục Ảnh storyboard; thẻ phong cách ghi câu lệnh gợi ý để người dùng dán vào Gemini, code lo khung, chữ, chuyển động. Không gọi API Gemini.
- **Phong cách mới:** thêm một mục vào `STYLES`, kèm nền và lớp phủ nếu cần. Render một scene mẫu ngắn trong `studio/engine/examples/styles/` để so với mẫu gốc.
- **Đạo cụ, tư thế, bộ bối cảnh mới:** ghi vào `art-requests.md` của thư viện; đạo diễn thêm bằng code.
- **Quy tắc kể chuyện hay nhịp** rút ra được: thêm vào `studio/lessons.md` (mục "Phong cách") và bảng chọn phong cách trong skill `lam-video`.
- **Không sao chép** nhân vật, logo, chữ ký, watermark hay nội dung có bản quyền của mẫu. Chỉ học **phong cách và kỹ thuật**.

## 5. Báo lại
Báo người dùng ngắn gọn: mẫu thuộc phong cách gì, engine đã làm được gì, còn thiếu gì, đề xuất làm gì tiếp (và ước tính công: nhỏ, vừa hay lớn). Gửi kèm ảnh so sánh nếu đã render thử.
