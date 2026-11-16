# Demo phong cách `ban-tin` (bản tin vẽ tay)
- Học từ mẫu `studio/references/ai-beat-tin-tuc/card.md`. Nội dung riêng (ChatGPT 100 triệu người dùng), dữ kiện trong `sources.md`.
- Giọng Gemini **Charon** (nam, kiểu bản tin), tăng tốc 1,09 lần để khớp tốc độ mẫu (khoảng 210 âm tiết/phút). Lý do không dùng Bodi: mẫu là giọng nam trẻ, đọc nhanh, kiểu bản tin.
- Nhạc nền `audio/bed.wav` tổng hợp bằng code trong `build_scene.py` (không bản quyền), gain 0,07.
- Cảnh so sánh 2 tháng, 9 tháng, 2,5 năm vẽ thanh **đúng tỉ lệ** (30 tháng = 860 px).
- Không dùng logo OpenAI, TikTok, Instagram (nhãn hiệu). Thẻ Reuters là **bản tóm tắt** ghi rõ "(tóm tắt)", không giả ảnh chụp.
- Dựng lại: `python3 build_scene.py && node ../../studio/engine/render.mjs scene.json`.
