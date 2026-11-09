# engine3d: dựng cảnh 3D thực tế (three.js trong Chromium, miễn phí)

Dùng cho phong cách **`thi-nghiem`** (mẫu TikTok 3D "làm băng bằng diêm tiêu") và mọi video cần đồ vật như thật: chất liệu gỗ, sắt, đất nung, gạch bùn, nước, băng, lửa, ánh sáng mặt trời và bóng đổ.

```bash
cd studio/engine3d && npm ci                       # lần đầu (chỉ cài three)
node render3d.mjs ../../projects/<slug>/scene3d.json --fps 2 --name sketch   # bản phác nhanh để soát bố cục
node render3d.mjs ../../projects/<slug>/scene3d.json                         # bản cuối (~0,7 s máy cho mỗi khung)
```

## scene3d.json
```json
{"fps": 30, "layout": "blurband", "narration": {"path": "audio/narration.wav", "lead": 0.15},
 "captions": {"path": "captions-audio.json", "lead": 0.15},
 "sets": {"san": [{"type": "ground", "material": "stone"}]},
 "shots": [{"start": 0, "end": 3.2, "time": "day", "set": "san",
   "objects": [{"type": "tub", "at": [0, 0, 0], "water": 0.6, "track": [{"t": 0, "water": 0.2}, {"t": 2, "water": 0.8}]}],
   "camera": [{"t": 0, "pos": [3, 3, 4], "target": [0, 0.4, 0]}, {"t": 3.2, "pos": [2.5, 2.6, 3.2], "target": [0, 0.4, 0]}],
   "texts": [{"type": "label", "text": "CHẬU GỖ", "at": [0, 1.1, 0], "from": 0.3}, {"type": "title", "text": "Bước 1", "kicker": "…"}],
   "sfx": [{"t": 0.2, "kind": "splash"}]}]}
```
- `layout`: `blurband` (khung 1080×608 giữa màn, trên dưới là hình mờ phóng to) hoặc `full` (1080×1920).
- `time`: `day` | `dusk` | `night` (trời sao, ánh trăng) | `studio` (nền sáng như phòng chụp).
- Đơn vị là mét, trục y hướng lên. `at` là vị trí, `rot` tính bằng độ, `scale` là tỉ lệ. `track` gồm các keyframe `{t, at, rot, scale, visible}` và tham số riêng của đồ vật: `water`, `level`, `freeze`, `grow`, `on`, `flow`.
- `texts`: `label` (nhãn trắng gắn vào điểm 3D), `title` (kicker vàng + tiêu đề lớn), `note` (ghi chú nhỏ góc dưới), `credit`.
- Phụ đề tự tách 2–3 từ, từ khóa tô vàng (viết `*từ*` để chọn từ khóa).

## Đồ vật (`type`)
| Đồ vật | Tham số |
|---|---|
| `ground` | `material` (sand, stone, dirt, grass, planks…), `size`, `tile`, `hole` (khoét lỗ tròn) |
| `box`, `cylinder` | `size` / `r`, `r2`, `h`, `material` (wood, planks, iron, copper, steel, clay, mudbrick, plaster, stone, rock, sand, straw, water, ice, cloth hoặc mã màu) |
| `tub` | chậu gỗ có đai sắt: `r`, `h`, `water` 0..1 |
| `wok` | chảo gang trên kiềng đá: `r`, `fire`, `level`, `liquid` (màu) |
| `fire`, `steam` | lửa có ánh sáng chập chờn; hơi nước: `on`, `w`, `h`, `size` |
| `ice` | khối băng trong: `size`, `grow` 0..1 |
| `pool` | hồ nông: `size`, `depth`, `freeze` 0..1, `water` |
| `channel` | kênh nước chảy: `length`, `width`, `flow` |
| `dome` | nhà vòm bậc (Yakhchal): `r`, `h`, `steps`, `door` |
| `wall`, `section` | tường; mặt cắt tường dày có thước vàng |
| `pit` | hầm tròn (dùng chung với `ground` có `hole`) |
| `dune`, `rock`, `tree` (`kind: cypress`), `hay`, `jar`, `fence`, `board` (bàn gỗ), `bowl` (`fill`, `ice`, `topping`), `pile` (đống vật liệu), `egg`, `stars`, `moon` | |

Thêm đồ vật mới: viết hàm vào `LIB` trong `lib3d.js`. Hàm trả về `THREE.Group`, và có thể gắn `userData.update(q, t)` để tham số chuyển động được.
Phim mẫu: `projects/lam-da-co-dai/build_scene3d.py`.
