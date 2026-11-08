---
name: dung-phim
description: Dựng phim. Render scene.json bằng engine QBK Studio thành bản xem thử và bản hoàn chỉnh MP4 9:16 có phụ đề, âm thanh, rồi tự kiểm tra kỹ thuật (giải mã, khung hình, chồng lấn, âm lượng). Dùng cho vai dựng phim của đoàn phim.
---

# Dựng phim

## Chuẩn bị (lần đầu trong một session)
```bash
cd studio/engine && [ -d node_modules ] || npm ci
```

## Bản xem thử (khoảng 20 giây đầu, hoặc trọn đoạn mở đầu)
```bash
cd studio/engine && node render.mjs ../../projects/<slug>/scene.json --to 20
```
→ `projects/<slug>/output/preview.mp4`, `preview.srt`, `preview-contact.png`

## Bản hoàn chỉnh (chỉ sau khi người dùng duyệt bản xem thử)
```bash
cd studio/engine && node render.mjs ../../projects/<slug>/scene.json
```
→ `output/final.mp4`, `final.srt`, `final-contact.png`

## Tự kiểm tra kỹ thuật (bắt buộc trước khi bàn giao)
1. **Giải mã trọn vẹn:** `ffmpeg -v error -i output/<name>.mp4 -f null -` không được in lỗi.
2. **Thông số:** `ffprobe` phải ra 1080×1920, h264, aac, thời lượng bằng giọng đọc + 0,15 + khoảng 0,4 giây.
3. **Xem khung hình:** đọc ảnh `*-contact.png` (dùng Read), rồi trích thêm khung hình ở các mốc đổi shot:
   `ffmpeg -v error -y -ss <giây> -i output/<name>.mp4 -frames:v 1 -vf scale=540:960 /tmp/.../f.png`
   Kiểm tra: không có vật thể đè lên phụ đề, chữ trên hình không tràn khung, nhân vật không bị cắt ngoài ý muốn, đạo cụ (như mũi giáo) không ra ngoài khung.
4. **Âm lượng:** `ffmpeg -i output/<name>.mp4 -af volumedetect -f null - 2>&1 | grep max_volume` phải trong khoảng −3 đến −0,5 dB.
5. Phát hiện lỗi thì sửa `scene.json` (vị trí, scale, thời gian) và render lại. Lỗi nằm ở engine thì báo Nhà sản xuất để giao `hoa-si`.

## Bàn giao
Đường dẫn MP4, SRT, ảnh contact, thời gian render, danh sách mục đã kiểm tra. Ghi rõ: **máy không đánh giá được chất lượng giọng và sfx khi nghe**, người dùng cần nghe thử.
