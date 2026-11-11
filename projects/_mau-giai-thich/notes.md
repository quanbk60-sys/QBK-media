# Bản thử preset "Hoạt hình giải thích" (11/11/2026)

Học từ 2 video mẫu người dùng gửi (chỉ học bố cục, màu và nhịp; không dùng lại hình hay nội dung của mẫu).

| | A `giai-thich-kraft` | B `giai-thich-hong` |
|---|---|---|
| Nền | giấy kraft be có vân | gradient hồng nhạt → hồng mận |
| Tiêu đề | 2 dòng đứng yên, chữ có chân in hoa; dòng 2 chữ đỏ đô trên nhãn trắng bo góc | 2 dòng đứng yên, in hoa đậm; dòng 2 chữ đen trên khối vàng `#FFF200` |
| Khung | 16:9 (1080×608) y 576–1184 | như A |
| Phụ đề | karaoke 2–3 chữ, dưới khung | karaoke 2–3 chữ in hoa, đè đáy khung |
| Hình | con vật vẽ bằng code (`lib/animals.mjs`), nét nâu mảnh, màu phấn | nét đen dày, màu rực, mắt lồi |

Cắt cứng, mỗi cảnh 2–4 giây. Miễn phí (người dùng: "k tốn phí").
Prompt ảnh (lưu trong `styles.mjs` → `imagePrompt`, chỉ dùng khi người dùng đồng ý trả phí ảnh AI):
- A: flat 2D cartoon, thin dark-brown outlines, soft muted pastel colors, savanna, goofy expressive animal, big eyes, lazy half-closed eyelids, 16:9, no text
- B: classic TV cartoon, thick black outlines, highly saturated colors, cobalt sky, orange-yellow ground, exaggerated expressions, bulging eyes, 16:9, no text

Lời đọc mẫu chỉ mô tả phong cách (không có dữ kiện cần nguồn).
Render: `cd studio/engine && node render.mjs ../../projects/_mau-giai-thich/scene-a.json --name mau-a`.
