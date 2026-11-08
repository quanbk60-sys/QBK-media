# QBK Studio: định dạng kịch bản dựng (`scene.json`)

Engine vẽ **100% bằng code**, gồm nhân vật có khung xương, đạo cụ, hiệu ứng bàn tay vẽ, phụ đề và âm thanh tổng hợp. Không cần AI tạo ảnh.

```bash
cd studio/engine && npm ci                                    # lần đầu
node catalog.mjs                                              # danh sách tư thế/biểu cảm/đạo cụ/sfx hiện có
node render.mjs ../../projects/<slug>/scene.json --to 20      # bản xem thử 20s → projects/<slug>/output/preview.mp4
node render.mjs ../../projects/<slug>/scene.json              # cả phim → output/final.mp4 (+ .srt, -contact.png)
```

## Khung và vùng an toàn (9:16, 1080×1920 px)

| Vùng | y (px) | Dùng cho |
|---|---|---|
| Tiêu đề | 200–560 | Chữ lớn trên hình (`text`) |
| Hành động | 600–1350 | Nhân vật, đạo cụ. **Mặt đất chuẩn: y = 1330** |
| Phụ đề | ~1420 | Tự vẽ từ `captions`. Không đặt vật thể chính ở 1370–1470 |
| UI TikTok/Shorts | > 1550, x > 960 | Để trống (mô tả, nút bấm che) |

## Cấu trúc

```json
{
  "width": 1080, "height": 1920, "fps": 30,
  "narration": {"path": "audio/narration.wav", "lead": 0.15},
  "captions": {"path": "captions-audio.json", "lead": 0.15, "y": 1420, "size": 58},
  "music": {"path": "audio/music.mp3", "gain": 0.06},
  "cast": { "<id>": { costume } },
  "shots": [ { "start": 0, "end": 1.9, "background": "paper", "camera": [...], "elements": [...], "sfx": [...] } ]
}
```

- **Thời gian `shots` tính theo giây của video**, tức thời gian giọng đọc cộng `lead`. Các shot phải nối liền nhau, không hở và không chồng.
- Thời gian **bên trong** một shot (`from`, `to`, `t` của track, acting, sfx) tính tương đối từ đầu shot.
- `captions-audio.json` là mảng `[{start, end, text}]` theo thời gian giọng đọc. Engine tự cộng `lead` và tự tách câu quá dài làm hai.

## Phần tử (`elements`): thuộc tính chung

| Thuộc tính | Ý nghĩa |
|---|---|
| `x`, `y`, `scale`, `rotate`, `alpha` | Vị trí neo: nhân vật và đồ vật neo **ở chân hoặc mặt đất**, chữ neo ở tâm |
| `track: [{t, x, y, scale, rotate, alpha, ease}]` | Chuyển động theo keyframe. `ease`: `ease` \| `linear` \| `out` \| `back` |
| `from`, `to` | Thời điểm hiện và ẩn trong shot |
| `enter` | `pop` \| `fade` \| `slide-left` \| `slide-right` \| `drop` (`enterDur` mặc định 0,4s) |
| `exit: "fade"` | Mờ dần trước `to` |
| `motion` | `rock` (chòng chành) \| `bob` (nhấp nhô) \| `shake` |
| `draw: {at, dur, hand}` | **Hiệu ứng bàn tay vẽ:** vẽ nét trong 78% thời lượng, sau đó tô màu. `hand: false` thì vẽ mà không hiện bàn tay |

### `actor`: nhân vật
```json
{"type": "actor", "cast": "ngoquyen", "x": 540, "y": 1330, "scale": 0.62, "facing": 1,
 "costume": {"prop": "scroll"},
 "track": [{"t": 0, "x": -100}, {"t": 2.2, "x": 600, "ease": "linear"}],
 "acting": [{"t": 0, "pose": "carry", "expr": "determined", "cycle": "walk"},
            {"t": 2.2, "pose": "raise", "expr": "shout", "snap": true, "blend": 0.4}]}
```
- `acting`: từ mốc `t`, nhân vật chuyển sang `pose` trong khoảng `blend` giây (mặc định 0,3). `snap: true` cho động tác có độ nảy. `expr` giữ nguyên cho đến khi đổi. `cycle` là động tác lặp.
- `facing: -1` lật nhân vật sang trái. `scale` 0,6 cao khoảng 500px; 0,45 dùng cho nhân vật phụ hoặc đám đông.
- Khi đi bằng `cycle: walk`, phải cho `x` chạy với `ease: linear` để bước chân khớp tốc độ, khoảng 300 px/s ở scale 0,6.
- `blinks: [giây…]`: các thời điểm chớp mắt.

### `prop`: đạo cụ, bối cảnh
```json
{"type": "prop", "name": "riverSection", "x": 540, "y": 1250, "params": {"w": 1000},
 "ptrack": [{"t": 0, "level": 1}, {"t": 2.6, "level": 0.05}]}
```
`ptrack` dùng để tạo chuyển động cho tham số số (ví dụ `level`, `progress`).

| Đạo cụ | Tham số |
|---|---|
| `warship` (thuyền Nam Hán, mũi bên phải) | `sail` |
| `boat` (thuyền nhỏ có người chèo) | `color` |
| `waves` | `w`, `rows`, `speed`, `fill` |
| `stakes` (cọc bịt sắt) | `n`, `h`, `spacing` |
| `riverSection` (mặt cắt sông có bãi cọc) | `w`, `level` 0..1 |
| `seal`, `scroll`, `citadel` (Cổ Loa), `sun`, `cloud`, `tree`, `grass`, `house`, `mountain`, `hill`, `ground` | `color`, `roof`, `w` |
| `arrow` | `dx`, `dy`, `bend`, `dashed`, `progress`, `color` |
| `stamp` (dấu X đỏ), `panel`, `question`, `map` (minh họa, không phải bản đồ địa lý thật) | |

### `text`
`{"type": "text", "text": "938", "x": 540, "y": 330, "size": 300, "color": "red", "font": "hand"|"sans", "enter": "pop"}`

### `image` (tùy chọn, khi buộc phải dùng ảnh ngoài)
`{"type": "image", "path": "art/x.png", "x": 540, "y": 900, "w": 800}` (neo ở tâm).

## Trang phục (`cast`)
`headband`, `hat` (`official` | `crown` | `helmet` | `cone` | `cap`), `hatColor`, `beard`, `sash` (+ `sashX: false` để chỉ có một dải đai), `belt`, `cape`, `robe`, `robeTrim`, `body`, `shoes`, `prop` (`spear` | `sword` | `dagger` | `hammer` | `oar` | `flag` | `scroll` | `seal`), `propColor`.

Màu có thể là tên: `ink`, `paper`, `red`, `navy`, `gold`, `green`, `wood`, `steel`, `water`, `waterDeep`, `white`, `skin`, `sky`, hoặc mã hex.

## Tư thế, biểu cảm, động tác lặp
Chạy `node catalog.mjs` để xem danh sách mới nhất. Bản v1:
- **pose:** stand, carry, raise, ready, thrust, point, cheer, scared, fall, bow, kneel, plead, crossed, think, hammerUp, hammerDown, rowA, rowB, waveA, waveB, sad
- **expr:** neutral, happy, grin, determined, angry, shout, scared, surprised, sad, smug, sly, pain, calm
- **cycle:** walk, run, shake, hammer, row, wave, breathe

## Âm thanh (`sfx`)
`{"t": 0.3, "kind": "drum", "gain": 0.5}` với `kind` thuộc: pop, tap, whoosh, step, drum, gong, splash, crack, scribble, chime, thud, wind, hammer, cheer (`dur` cho wind và scribble).

Một số âm được tạo **tự động**: tiếng bút khi bàn tay vẽ, tiếng bước chân khi `walk` hoặc `run`, tiếng búa khi `hammer`.

## Camera
`"camera": [{"t": 0, "zoom": 1}, {"t": 3, "zoom": 1.15, "x": 540, "y": 1000}]`: phóng to hoặc lia về một điểm.

## Mở rộng engine
- Tư thế mới: thêm vào `POSES` trong `lib/character.mjs` (góc tính bằng radian, 0 là thõng xuống, số dương là xoay về hướng mặt).
- Đạo cụ mới: thêm hàm vào `PROPS` trong `lib/props.mjs`. **Chỉ dùng các lệnh Canvas mà `Recorder` hỗ trợ**: path, arc, ellipse, rect, roundRect, fill, stroke, fillText, save/restore, translate/rotate/scale. **Không dùng `clip`.**
- Sau khi thêm, chạy `node catalog.mjs` và render thử một shot.
