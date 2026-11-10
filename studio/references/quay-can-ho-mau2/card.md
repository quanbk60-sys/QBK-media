# Cảnh mẫu gimbal liền một cú (người dùng gửi 10/11/2026)

- Mẫu: video 24,8 s (khoảng 19 s cảnh + màn kết TikTok), 576×1024, tài khoản nội thất có watermark TikTok. Ảnh khung: `contact.png`, số đo `analysis.json`.
- Áp dụng vào: `bds`, ảnh nội thất bằng `"cam"` (camwalk.py).

## Đặc trưng
- **Một cú máy liền**, không cắt: hành lang → phòng khách (quay sang sofa) → bàn ăn → bếp.
- Gimbal **rất êm**: không rung, không nhún bước; tiến đều, vừa đi vừa xoay theo đường cong.
- Ống kính góc rộng, máy ngang ngực, hơi chúc xuống. Nhạc nền, không lời.

## Thông số camwalk tương ứng
- `hand` 0,15, `bob` 0, `ease` linear; `fwd` 0,3–0,45 kèm `side` ±0,06–0,12 (đi cong); ảnh ngang `yaw` ±15°.
- `walk.xfade` 1,1 s để các ảnh nhòa liền như một cú.
- Không đặt tiếng hiệu ứng (`"sfx": false`): người dùng chê "tiếng rẹt rẹt".
