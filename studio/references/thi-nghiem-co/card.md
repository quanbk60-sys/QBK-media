# Thí nghiệm cổ (mẫu TikTok @larumlken, người dùng giao qua app 09/11/2026)

- Mẫu: "Cách làm băng bằng diêm tiêu từ tường nhà…", 104 s, 576×1024, kênh Khoa Học Kỳ Thú. Ảnh khung: `contact.png`. Bản QBK: `qbk-demo.png`.
- Phong cách engine: **`thi-nghiem`** (`layout: "blurband"` trong `lib/styles.mjs`).

## Đặc trưng mẫu
- Hình **3D thực tế** (chậu gỗ, chảo gang, sân lát đá, hàng rào), dựng trên nền sáng, ánh sáng mềm. Camera đẩy và lia chậm, mỗi cảnh khoảng 8–9 s.
- Bố cục: **khung 16:9 nằm giữa màn 9:16**, phần trên và dưới là chính khung đó **phóng to và làm mờ**.
- Phụ đề **2–3 từ một lúc**, chữ trắng in hoa viền đen, **một từ khóa tô vàng**, đặt ở đáy khung giữa.
- Giọng kể đều, nhạc nền nhẹ, có watermark nhỏ.

## QBK làm thế nào
- Engine 2D không dựng được 3D thực tế. QBK giữ **bố cục và cách viết chữ** (đặc trưng dễ nhận ra nhất), còn hình bên trong khung thì dùng:
  - **ảnh thật** (`photo` với `full: true`, có `kenburns`), lấy từ Wikimedia bằng `studio/tools/commons.py`, ghi tác giả và giấy phép;
  - hoặc **hình vẽ bằng code** của engine (đạo cụ, người que) trên nền sáng (`background: "paper"`), có camera đẩy chậm.
- Khung vẽ là 1080×608. Mọi tọa độ trong shot tính theo khung này (giữa khung là 540, 304). render.mjs tự ghép thành 1080×1920.
- Phụ đề tự tách 2–3 từ một cụm. Từ khóa mặc định là từ dài nhất không phải hư từ. Muốn chọn từ khác thì viết `*từ*` trong `captions-audio.json`.

## Còn thiếu
- Đồ vật 3D, ánh sáng và đổ bóng thật (cần engine 3D hoặc ảnh AI, mà ảnh AI tốn phí).
- Watermark kênh (chưa cần).
