---
name: am-thanh
description: Thiết kế âm thanh cho video QBK, gồm sfx tổng hợp không lo bản quyền, mức âm lượng so với giọng đọc, và quy tắc dùng nhạc nền có giấy phép. Dùng khi đạo diễn hoặc dựng phim đặt sfx, nhạc.
---

# Âm thanh

## SFX có sẵn (tổng hợp bằng code, không lo bản quyền)
`pop, tap, whoosh, step, drum, gong, splash, crack, scribble, chime, thud, wind, hammer, cheer`

Đặt trong shot: `{"t": giây_trong_shot, "kind": "...", "gain": 0.2–0.6, "dur": (wind/scribble)}`.

| Khoảnh khắc | SFX gợi ý | gain |
|---|---|---|
| Hook, mốc năm, chữ lớn bật ra | `drum` hoặc `pop` | 0,4–0,5 |
| Chữ phụ hiện | `pop` | 0,3 |
| Vung, đâm, lướt nhanh | `whoosh` | 0,3–0,4 |
| Ngã, vật rơi | `thud` | 0,5 |
| Nước, thủy triều | `splash`, `wind` | 0,3–0,45 |
| Gỗ vỡ, thuyền va cọc | `crack` | 0,5 |
| Đóng cọc | `hammer` (tự động khi `cycle: hammer`) | |
| Chiến thắng, lên ngôi | `gong` hoặc `cheer` | 0,3–0,5 |
| Kết, câu hỏi cuối | `chime` | 0,3 |

**Tự động có:** tiếng bút khi bàn tay vẽ (chỉnh bằng `scribbleGain` ở cấp scene, mặc định 0 = tắt vì người dùng QBK không thích; muốn bật thì đặt 0,1–0,2), tiếng bước chân khi `walk` hoặc `run`, tiếng búa khi `hammer`.

## Quy tắc trộn
- **Giọng đọc luôn nổi bật nhất.** SFX không trùng lên chữ quan trọng của câu.
- Mỗi shot 0–2 sfx. Không rải sfx đều cho có.
- Sau khi render, kiểm tra độ lớn: `ffmpeg -i output/preview.mp4 -af volumedetect -f null - 2>&1 | grep -E "mean|max"`. Mức `max_volume` nên trong khoảng −3 đến −0,5 dB. Nếu đạt 0 dB (vỡ tiếng) thì giảm gain.

## Nhạc nền (tùy chọn)
- Chỉ dùng nhạc có giấy phép rõ ràng: tự tạo, YouTube Audio Library (đọc điều khoản từng bài), Pixabay Music (kiểm tra giấy phép từng file). **Không** lấy nhạc thịnh hành trên TikTok hay nhạc có bản quyền.
- Đặt file vào `projects/<slug>/audio/`, ghi nguồn và giấy phép vào `sources.md`. Khai báo `"music": {"path": "audio/x.mp3", "gain": 0.04–0.08}`.
- TikTok và Shorts cho phép người dùng tự thêm nhạc khi đăng. Mặc định **không có nhạc nền** trong file.
