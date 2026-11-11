---
name: dung-phim
description: Dựng phim. Ghép phim theo phong cách: anime (assemble.py: animatic, ghép clip, chỉnh màu, phụ đề, hòa âm), vệ tinh (engine 2D render.mjs), thí nghiệm 3D (render3d.mjs); rồi tự kiểm tra kỹ thuật (giải mã, thông số, khung hình, âm lượng).
---

# Dựng phim

## Lệnh theo phong cách
| Phong cách | Bản thử | Bản hoàn chỉnh |
|---|---|---|
| `storyboard`, `anime-tinh`, `giay-gap` (ảnh người dùng gửi) | không cần (ảnh đã do người dùng duyệt) | `python3 studio/tools/assemble.py projects/<slug>/cut.json projects/<slug>/output/final.mp4` |
| `anime-tinh` có nhân vật đi trong cảnh | `node studio/engine3d/phong-canh.mjs projects/<slug>/phongcanh.json --still 2,10` | `node studio/engine3d/phong-canh.mjs projects/<slug>/phongcanh.json` |
| `ve-tinh` | `cd studio/engine && node render.mjs ../../projects/<slug>/scene.json --to 20` | `cd studio/engine && node render.mjs ../../projects/<slug>/scene.json` |
| `thi-nghiem` | `cd studio/engine3d && node render3d.mjs ../../projects/<slug>/scene3d.json --fps 2 --name sketch` | `cd studio/engine3d && node render3d.mjs ../../projects/<slug>/scene3d.json` |
Lần đầu trong session: `npm ci` trong `studio/engine` và `studio/engine3d` nếu chưa có `node_modules`.

## Tự kiểm tra kỹ thuật (bắt buộc trước khi bàn giao)
1. **Giải mã trọn vẹn:** `ffmpeg -v error -i output/<name>.mp4 -f null -` không được in lỗi.
2. **Thông số:** `ffprobe` phải ra 1080×1920, h264, aac, thời lượng đúng bảng phân cảnh (phim có lời: bằng giọng đọc + khoảng 0,5 giây).
3. **Xem khung hình:** đọc ảnh `*-contact.png` (dùng Read), rồi trích thêm khung hình ở các mốc đổi shot:
   `ffmpeg -v error -y -ss <giây> -i output/<name>.mp4 -frames:v 1 -vf scale=540:960 /tmp/.../f.png`
   Kiểm tra: không có vật thể đè lên phụ đề, chữ không tràn khung, nhân vật không bị cắt ngoài ý muốn; anime: nhân vật đồng nhất giữa các cảnh, chuyển cảnh mượt.
4. **Âm lượng:** `ffmpeg -i output/<name>.mp4 -af volumedetect -f null - 2>&1 | grep max_volume` phải trong khoảng −3 đến −0,5 dB.
5. Lỗi thì sửa file dựng (`cut.json`, `scene.json`, `scene3d.json`) và dựng lại. Lỗi ở hình thì báo Nhà sản xuất giao `hoa-si` hoặc `quay-phim`.

## Bàn giao
Đường dẫn MP4, SRT, ảnh contact, thời gian render, danh sách mục đã kiểm tra. Ghi rõ: **máy không đánh giá được chất lượng giọng và sfx khi nghe**, người dùng cần nghe thử.
