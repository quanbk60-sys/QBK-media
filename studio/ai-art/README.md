# Thư viện hình AI (Gemini) dùng lại

Tạo bằng `studio/tools/genimage.py` (có phí, xem `studio/costs.jsonl`). Vật thể vẽ trên nền magenta rồi xóa nền bằng `studio/tools/keyout.py`; file `*-raw.png` là ảnh gốc. **Dùng lại trước khi tạo mới.**

## `phong-canh/` (phong cách `phong-canh-3d`)
Câu phong cách chung: "Hand-painted anime background art style of classic Japanese animation films, bright summer sunlight from the upper right, vivid saturated greens, painterly brush detail."

| File | Nội dung | Ghi chú |
|---|---|---|
| `bien-1.png` | Tranh nền 2K: đồi cao nhìn xuống thị trấn ven biển, cảng, bãi cát, mây tích | `horizon` 0.322, dùng `yH` 420 |
| `nui-1.png` | Tranh nền 2K: thung lũng có thị trấn, ruộng, núi xanh, mây tích | `horizon` 0.29, dùng `yH` 400 |
| `tree-1.png`, `tree-2.png` | Cây tán rộng; cây cao thân mảnh | |
| `house.png` | Nhà gỗ hai tầng kiểu Nhật | |
| `bush.png` | Bụi cây tròn | |
| `flowers-white.png` | Bụi hoa cúc trắng, cánh bướm hồng, hoa tím | |
| `flowers-orange.png` | Bụi cúc vạn thọ cam vàng | |
| `cyclist.png` | Người đạp xe nhìn từ sau: nón cói, áo xanh, ba lô nâu, túi đỏ | nhân vật chính |
| `cyclist-top.png`, `cyclist-bike.png` | Tách từ `cyclist.png`: thân trên (mờ dần ở hông) và xe (bỏ chân) | engine vẽ chân đạp bằng code giữa hai lớp |
| `stone.png` | Vân đá sa thạch (vuông) | phủ lên từng viên đá đường |

Chi phí lập bộ này: 0,87 USD (12 ảnh, kể cả 2 ảnh làm lại).

## `phong-thu/` (phong cách `phong-thu`, người thật nói chuyện)
| File | Nội dung | Ghi chú |
|---|---|---|
| `presenter-base.png` | Người dẫn "Lan" (nhân vật của kênh) ngồi trước micro, phòng thu tối, 2K | miệng 0.533,0.47; mắt 0.523,0.411; logo micro cần `--blur 0.87,0.49,0.995,0.53` |
| `mouth-half.png`, `mouth-open.png`, `blink.png` | Biến thể cùng khung: miệng hé, miệng mở, nhắm mắt | tạo bằng `--ref presenter-base.png`; `talking.py` tự căn khớp |

Chi phí: 0,40 USD (4 ảnh 2K).
