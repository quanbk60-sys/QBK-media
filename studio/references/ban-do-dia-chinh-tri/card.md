# Mẫu: Bản đồ dữ liệu địa chính trị

- **Nguồn:** Video bình luận địa chính trị, quay màn hình (người dùng gửi, 08/11/2026). Video gốc không lưu trong repo, chỉ giữ phần phân tích và ảnh khung hình.
- **Đo bằng máy** (`analysis.json`): 25.18s · 1080x1708 · cắt cảnh 0 lần · trung bình 25.18s/cảnh · độ sáng 0.28 · độ rực màu 0.12 · có tiếng 97%
- **Bảng màu đo được:** `#040D16` `#5D4140` `#23272E` `#0F1C25` `#7A725C` `#D0CDC9`
- Ảnh tổng hợp: `contact.png` · khung chính: `frames/`

**Hình:** nền xanh than gần đen (`#040D16`, `#0F1C25`). **Bản đồ thật:** vùng đỏ gạch (`#5D4140` khi tối, đỏ khi sáng) đối lập với vùng vàng nghệ. Biển màu xanh lam đậm. Có **bảng thông tin** gồm nhãn nhỏ viết hoa ("HAI CÁCH NHÌN"), tiêu đề đậm hai dòng, thanh so sánh hai bên, câu kết luận, và dòng **"NGUỒN: …"** chữ nhỏ.
**Chuyển động:** không cắt cứng. Camera **lia và phóng to** trên bản đồ, vùng đổi màu dần, tuyến đường vẽ dần kèm chấm định vị và nhãn địa danh viết hoa.
**Âm thanh:** giọng bình luận liên tục (97%), có nhạc nền trầm. Đỉnh âm sát 0 dB (hơi to).
**Đã có trong engine:** phong cách `ban-do-toi` (nền, màu), `arrow`, camera, chữ Sans.
**Còn thiếu:** **dữ liệu bản đồ thật** (Natural Earth qua npm), đạo cụ `infoPanel` (nhãn, tiêu đề, gạch đầu dòng, thanh so sánh, dòng nguồn), `pin` (chấm và nhãn địa danh), tuyến đường vẽ dần theo tọa độ.
**Hợp với:** địa lý, chiến tranh, hiệp ước, kinh tế, "vì sao nước X…".
**Lưu ý:** biên giới vùng tranh chấp rất nhạy cảm; chủ đề loại này phải dừng hỏi người dùng sau bước kịch bản.
