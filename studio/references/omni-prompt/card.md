# Cách viết lệnh cho Gemini Omni (quay phim anime)

Rút từ tài liệu "Omni Flash Production Prompt Contract" của bộ skill Stickman Video Director (MIT, bản gốc và giấy phép ở cùng thư mục: `upstream-omni-flash-prompt-contract.md`, `LICENSE-upstream.txt`). Phần riêng cho người que đã bỏ; dưới đây là nguyên tắc dùng chung, viết lại cho anime của QBK. Agent `quay-phim` đọc thẻ này trước khi viết lệnh; `dao-dien` và `chi-dao-my-thuat` đọc để chuẩn bị đầu vào đúng dạng.

## 1. Mỗi lệnh phải tự đứng được
Omni không nhớ clip trước. **Mỗi lệnh lặp lại đầy đủ** mọi thứ cần giữ: tỉ lệ khung, phong cách, mô tả nhân vật, bảng màu, ánh sáng, âm thanh. Không viết "same character as before", "nhân vật như clip 1".

## 2. Thứ tự một lệnh (tiếng Anh)
1. **Thông số:** khoảng N giây, 9:16, 720p.
2. **Bối cảnh của cảnh:** nơi chốn, giờ trong ngày, ánh sáng (lấy từ `storyboard.md`). Cảnh mới thì tả như một nơi mới, không lặp một căn phòng cho cả phim.
3. **Khóa nhân vật:** dán nguyên văn mô tả nhân vật trong `art-bible.md` (tuổi, tóc, trang phục, màu nhận diện, đạo cụ) + "keep the character exactly as in the input image". Đổi nơi chốn hay biểu cảm không được đổi thiết kế nhân vật.
4. **Bảng màu:** chỉ dùng tên màu thường (vivid yellow, warm gold). **Không dùng mã màu** (#hex, RGB): model có thể vẽ chữ mã đó lên hình.
5. **Bố cục 9:16:** nhân vật ở đâu trong khung, cỡ cảnh, góc máy.
6. **Trạng thái khung đầu:** nối từ khung cuối của cảnh trước (tư thế, hướng nhìn, đạo cụ đang cầm).
7. **Ba nhịp có mốc thời gian:** `[0–2s]` thiết lập, `[2–5s]` hành động chính, `[5–8s]` cao trào và chuẩn bị nối cảnh sau (co giãn theo độ dài clip).
8. **Âm thanh:** nhạc nền, tiếng động khớp hành động. QBK thường **ghép giọng đọc và nhạc ở hậu kỳ** (`assemble.py`), nên trong lệnh ghi "no dialogue, no voiceover", chỉ xin tiếng môi trường, hoặc tắt hẳn (`keepClipAudio: false`).
9. **Trạng thái khung cuối:** để cảnh sau nối vào.
10. **Điều cấm** (mục 6).

## 3. Chuyển động mượt, không giật
- Tạo chuyển động bằng **hành động cụ thể** của nhân vật: bước đi, cúi xuống, nhặt, ôm, quay đầu, chạy, mở cửa.
- **Tránh biến hình trừu tượng** (cầu thang tan thành đồng hồ, vật thể chảy thành vật khác): dễ rung hình, rớt khung.
- Không để nhân vật đứng yên hay nhìn chằm camera nhiều giây.
- Muốn nhiều sự kiện mà không lệch nét vẽ thì viết: "frequent visual events while preserving an identical character design and strict temporal consistency". **Không viết "rapid style changes"**: model sẽ đổi luôn nét vẽ.

## 4. Không chữ trong hình
Mặc định mọi clip **không có chữ, số, phụ đề, logo, watermark, bong bóng thoại**. Chữ cần hiện (tên cảnh, phụ đề) thì thêm ở hậu kỳ.

## 5. Nối cảnh (cho dựng phim)
Liệt kê các clip theo thứ tự; mỗi chỗ nối ghi rõ trạng thái cuối nối sang trạng thái đầu, hoặc ghi rõ là chuyển nơi chốn, thời gian có chủ ý. Xem clip thật ở chỗ nối, đừng tin rằng model đã làm đúng.

## 6. Điều cấm mẫu (dán cuối lệnh)
```
Negative: no photorealistic people, no real human skin, no change to the character's face, hair, outfit or proportions, no extra limbs or fingers, no malformed hands, no unintended characters, no visible text, letters, numbers, captions, subtitles, logos, watermarks or speech bubbles, no abstract morphing, no flicker.
```

## 7. Mẫu lệnh một cảnh
```
About 6 seconds, vertical 9:16, 720p. Hand-painted anime style of classic Japanese animation films, warm summer light, painterly backgrounds.
Setting: a sunlit forest path in the morning, tall mossy trees, soft god rays, ferns and small wildflowers.
Character (keep exactly as in the input image): a 7-year-old girl with a short black bob, straw hat with a red band, bright yellow hooded jacket, brown canvas backpack, dark green shorts, brown boots.
Palette: fresh greens, warm gold light, bright yellow accent on the girl.
Composition: medium shot from a low angle at the side, the girl in the lower middle third.
First frame: the girl is walking along the path, looking ahead.
[0–2s] she walks forward, her hat and backpack bouncing gently with each step.
[2–4s] she slows down and turns her head to the right toward a rustling bush.
[4–6s] she crouches down slowly, curious, one hand reaching toward the bush.
Audio: soft birdsong and leaves rustling, no dialogue, no voiceover, no music.
Last frame: the girl crouching beside the bush, hand reaching in.
Negative: (dán mục 6)
```

## 8. Kiểm tra trước khi chạy (quay phim tự soát)
- Lệnh có đủ 10 phần, có mô tả nhân vật đầy đủ, không có "same as before".
- Không mã màu, không xin chữ trong hình.
- Ba nhịp đều là hành động cụ thể, khung đầu khớp khung cuối cảnh trước.
- Lệnh trung tính, không mô tả gợi cảm hay bạo lực; không tìm cách lách bộ lọc.
