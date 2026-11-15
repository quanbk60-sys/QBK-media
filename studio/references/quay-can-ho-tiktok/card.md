# Quay căn hộ một mạch (mẫu TikTok người dùng gửi 10/11/2026)

- Mẫu: TikTok @canhogiarer (video 7493861165588630792), 82 s, 576×1024, nhạc nền, không lời đọc. Ảnh khung: `contact.png`. Số đo: `analysis.json` (3 lần cắt, cảnh trung bình 20,6 s, sáng 0,55, màu nhạt).
- Phong cách engine: `bds`, phần ảnh căn hộ (`bdsPhoto.move` + `walk` trong `bds.json`).

## Đặc trưng
- Quay gimbal góc rộng, **đi bộ liền một mạch** qua các phòng: tiến chậm đều, quay ngang sang phòng bên, gần như không cắt.
- Bắt đầu ở phòng khách nhìn ra cửa kính, đi qua bếp, hành lang, phòng ngủ, nhà tắm, kết ở **cửa sổ nhìn ra ngoài** (hồ bơi, các tòa chung cư).
- Chữ chỉ có ở đầu: giá + loại căn (chữ vàng có viền). Không phụ đề.

## Cách làm trong QBK (chỉ có ảnh tĩnh)
- Mỗi ảnh: `move` với `ease: "linear"` (máy tiến đều như đi bộ), `push` 0,24–0,3, ảnh ngang thì `pan` ±0,5–0,6 để lia hết bề ngang, `shake` 0,6 (gimbal, rung rất nhẹ), `vp` đặt ở cửa hoặc cuối phòng.
- `"walk": {"xfade": 0.8}`: ảnh trước vẫn trôi tiếp rồi nhòa vào ảnh sau, không có khoảng tối, nên trông như một cú máy dài.
- Mở đầu theo yêu cầu người dùng: vệ tinh → (tiện ích lân cận) → `descend` bay xuống sát mái khu chung cư (zoom 18,5, nghiêng 50°) → ảnh đầu tiên "lao vào" từ bản đồ (`dive`).
- QBK vẫn giữ lời đọc và phụ đề.

## Còn thiếu
- Chiều sâu thật (mô hình đo chiều sâu) để máy đi xuyên phòng: cần mở host tải mô hình từ huggingface.
- Ống kính góc rộng thật: ảnh chụp thường không có.
