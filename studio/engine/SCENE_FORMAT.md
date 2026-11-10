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

## Phong cách (`style`)
`"style": "giay-muc"` (mặc định) | `bang-phan` | `ban-ve` | `so-tay` | `pop` | `dan-gian` | `phim-cam` | `phac-thao` | `ban-do-toi` | `ve-tinh` (ảnh vệ tinh thật + ảnh thật, xem mục cuối) | `bds` (giới thiệu bất động sản: vệ tinh nghiêng 3D, tuyến đường, ảnh dự án; xem mục "Phong cách BĐS") | `thi-nghiem` (khung 16:9 giữa màn trên nền mờ, chữ 2–3 từ có từ khóa vàng; khung vẽ 1080×608, render tự ghép 1080×1920; từ khóa chọn bằng `*từ*` trong phụ đề; thẻ `studio/references/thi-nghiem-co/card.md`).

Phong cách tự đổi nền, màu mực, màu thân nhân vật, bảng màu tên (`red`, `navy`…), độ dày nét, kiểu chữ tiêu đề, phụ đề và bộ lọc màu (đen trắng, sepia). Không cần đổi gì trong nhân vật hay đạo cụ. Định nghĩa nằm trong `lib/styles.mjs`; thêm phong cách mới thì thêm một mục vào `STYLES`.

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
| `finishLine` (vạch đích ô cờ trên đất + hai cột + băng đích) | `w` (700), `h` cột (330), `broken` 0..1 (băng đứt, hai nửa rủ xuống; tạo hoạt hình bằng `ptrack`), `tape: false` (chỉ vạch), `tapeColor`, `label` (chữ trên bảng ngang, vd. "ĐÍCH"), `labelColor`, `labelSize`, `rows` |
| `startLine` (vạch xuất phát ô cờ, không cột) | `w`, `rows`, `label` (chữ sơn trước vạch), `labelColor`, `labelSize` |
| `checkerFlag` = `finishFlag` (cờ ô cờ cắm đất, tự bay) | `h` cán (420), `size` rộng cờ (200), `wind` biên độ (1) |
| `zzz` (chữ Z bay lên, mờ dần, lặp). Neo ngay trên đầu người ngủ | `size` (1), `color` (navy), `speed` (1) |
| `dust` (bụi + vệt tốc độ sau người chạy, tự hoạt hình). Neo ở chân người chạy; cho `track` chạy cùng `x` với nhân vật | `dir` (1 = người chạy nhìn sang phải, bụi bay sang trái; -1 ngược lại), `size`, `n` số cụm (5), `progress` 0..1 độ mạnh, `lines: false` bỏ vệt tốc độ, `color` |
| `thought` = `thoughtBubble` (bóng nghĩ). Neo gần đầu người nghĩ | `dx`, `dy` tâm bóng (170, -260), `w`, `h`, `text`, `size`, `color`, `icon: "pillow"` (hình gối), `iconColor`, `progress` 0..1 (chấm rồi bóng hiện ra) |
| `infoPanel` (bảng thông tin nền tối cho video bản đồ; neo = GIỮA CẠNH TRÊN, cao tự tính; dùng màu theo style) | `w` (760), `label` (nhãn nhỏ viết hoa, vàng), `title` (`\n` tách dòng), `titleSize`, `big` (số lớn), `bigSize`, `bigColor`, `strike` (gạch đỏ qua số ngộ nhận), `bars` [{`label`, `value` 0..1, `color`, `text`}] (tối đa 4), `progress` 0..1 (thanh mọc dần, so le), `source` (tự thêm "NGUỒN: ") |
| `southAmericaMap` (Nam Mỹ MINH HỌA, đơn giản hóa, không chính xác địa lý; neo tâm, ~600x880) | `fill` 0..1 (Amazon loang dần, mặc định 1), `lost` 0..1 (mép đông nam đỏ gạch), `color`, `land`, `label` (mặc định "BẢN ĐỒ MINH HỌA", "" để ẩn) |
| `pin` (chấm định vị + vòng lan + nhãn; neo = điểm cần chỉ) | `label`, `color` (gold), `side` (1 phải / -1 trái / 0 trên), `size`, `progress` |
| `riverPath` (sông uốn nhìn từ trên, to dần về cửa sông, 2 nhánh phụ; ~560x900) | `progress` 0..1 (vẽ dần), `w` (44), `color` (waterDeep), `branches: false` |
| `vaporFlow` ("sông bay": đường cong nét đứt trôi theo t) | `strength` 0..1 (yếu thì mờ và đứt đoạn), `dx`, `dy` (hướng, 700/-250), `n` (4), `gap` (46), `progress`, `color` (navy) |
| `jungleTree` (cây nhiệt đới cao, tán nhiều tầng, dây leo; neo gốc), `stump` (gốc cây bị chặt, không lửa/cưa), `parrot` (vẹt bay ngang, vỗ cánh) | `h`, `color`, `sway` / `size`, `color` / `dir`, `size`, `color` |

### `text`
`{"type": "text", "text": "938", "x": 540, "y": 330, "size": 300, "color": "red", "font": "hand"|"sans", "enter": "pop"}`

### `image` (tùy chọn, khi buộc phải dùng ảnh ngoài)
`{"type": "image", "path": "art/x.png", "x": 540, "y": 900, "w": 800}` (neo ở tâm).

## Trang phục (`cast`)
`headband`, `hat` (`official` | `crown` | `helmet` | `cone` | `cap`), `hatColor`, `beard`, `sash` (+ `sashX: false` để chỉ có một dải đai), `belt`, `cape`, `robe`, `robeTrim`, `body`, `shoes`, `prop` (`spear` | `sword` | `dagger` | `hammer` | `oar` | `flag` | `scroll` | `seal`), `propColor`.

Hóa trang con vật (v2):
- `ears: "bunny"` (hoặc `"rabbit"`): tai thỏ dài, lòng hồng (`earColor`), nhúc nhích theo `wind` khi chạy. **Tự cụp** theo biểu cảm: `sad` 0,9, `asleep` 0,75, `scared` 0,7, `pain` 0,6, `sleepy` 0,55, `embarrassed` 0,5, `yawn` 0,3. `earsDown: 0..1` (hoặc `true`) ghi đè; `earsDown: 0` giữ tai dựng. Đặt trong `costume` của element để đổi theo cảnh.
- `tail: "bunny"`: đuôi bông tròn sau hông (`tailColor`, mặc định trắng).
- `shell: "turtle"` (hoặc một màu, vd. `"#7A5A30"`): mai rùa vòm sau lưng, vân lục giác, viền mai sẫm; nghiêng theo thân. `shellColor` ghi đè màu. Mặc định xanh lá `#6E9B45`.
- Ví dụ: Thỏ `{"body": "white", "ears": "bunny", "tail": "bunny", "sash": "red"}`, Rùa `{"body": "green", "shell": "turtle", "headband": "green"}`.

Màu có thể là tên: `ink`, `paper`, `red`, `navy`, `gold`, `green`, `wood`, `steel`, `water`, `waterDeep`, `white`, `skin`, `sky`, hoặc mã hex.

## Tư thế, biểu cảm, động tác lặp
Chạy `node catalog.mjs` để xem danh sách mới nhất. Bản v1:
- **pose:** stand, carry, raise, ready, thrust, point, cheer, scared, fall, bow, kneel, plead, crossed, think, hammerUp, hammerDown, rowA, rowB, waveA, waveB, sad
- **expr:** neutral, happy, grin, determined, angry, shout, scared, surprised, sad, smug, sly, pain, calm
- **cycle:** walk, run, shake, hammer, row, wave, breathe

Bổ sung v2 (Rùa và Thỏ):
- **pose:** `sleep` (ngồi bệt tựa lưng, chân co chân duỗi, đầu gục; đặt ngay trước thân `tree` để tựa gốc cây), `lie` (nằm ngửa trên đất, đầu về phía sau), `crouch` (khom thấp, chuẩn bị bật), `celebrate` (hai tay giơ chữ V, gối chùng; dùng với `cycle: jump`), `scratch` = `scratchHead` (tay sau gãi sau đầu, cùi chỏ ló sau gáy, đầu hơi cúi; dùng với `cycle: scratch`). Tư thế có thể có trường tùy chọn `nod` (đầu gục về phía mặt) và `lie` (thân chạm đất).
- **expr:** `sleepy` (mắt lim dim), `asleep` (mắt nhắm, miệng chữ o), `yawn` (ngáp), `embarrassed` (má hồng, mồ hôi, miệng méo).
- **cycle:** `crawl` (đi rất chậm, khom người, bước ngắn; cho `x` chạy `linear` khoảng 55–60 px/s ở scale 0,55), `sprint` (chạy nước rút, thân đổ mạnh; khoảng 600–700 px/s ở scale 0,5; ghép prop `dust`), `jump` (nhảy tại chỗ, chu kỳ 0,62 s; dùng với `celebrate` hoặc `cheer`), `doze` (thở khi ngủ, đầu gật nhẹ; dùng với `sleep`/`lie`), `scratch` (gãi đầu; dùng với `scratch`). `crawl` và `sprint` tự có tiếng bước chân.
- **Thức dậy (`wakeUp`)**: không cần tư thế riêng, dùng key `{"t": …, "pose": "scared", "expr": "surprised", "snap": true, "blend": 0.25}` ngay sau `sleep`.
- Scene mẫu: `examples/rua-tho-kit.json`.

## Âm thanh (`sfx`)
`{"t": 0.3, "kind": "drum", "gain": 0.5}` với `kind` thuộc: pop, tap, whoosh, step, drum, gong, splash, crack, scribble, chime, thud, wind, hammer, cheer (`dur` cho wind và scribble).

Một số âm được tạo **tự động**: tiếng bút khi bàn tay vẽ, tiếng bước chân khi `walk` hoặc `run`, tiếng búa khi `hammer`.

## Camera
`"camera": [{"t": 0, "zoom": 1}, {"t": 3, "zoom": 1.15, "x": 540, "y": 1000}]`: thiếu `x`, `y`, `zoom` ở keyframe đầu thì mặc định là tâm khung (540, 960) và zoom 1, camera lia dần từ đó: phóng to hoặc lia về một điểm.
- `"textFollowsCamera": true` (cấp scene, nên bật cho phim mới): chữ bên trong đạo cụ và phần tử `text` đi theo camera như mọi nét vẽ khác. Mặc định `false` để giữ nguyên các phim cũ (trước đây chữ bỏ qua camera nên lệch khỏi khung `infoPanel` khi phóng to/lia).

## Ngữ pháp phong cách (styles.mjs)
Mỗi phong cách không chỉ đổi màu. Nó còn đổi cách vẽ, và engine tự áp dụng cho mọi nhân vật và đạo cụ:
| Thuộc tính | Giá trị |
|---|---|
| `stroke` | `wobble` (nét run tay) · `chalk` (phấn, đứt quãng nhiều lớp) · `pencil` (chì nhiều nét mảnh) · `marker` (bút dạ) · `woodcut` (khắc gỗ đậm) · `plotter` (nét kỹ thuật mảnh, đều) · `clean` (vector dày) · `neon` (phát sáng) |
| `fill` | phẳng (mặc định) · `offset` (màu in lệch) · `drop` (bóng đổ đen) · `ghost` (tô mờ) · `chalk` · `hatch` (gạch chì) · `grain` (vân giấy dó) |
| `boil`, `boilEvery` | nét rung nhẹ theo khung (cảm giác vẽ tay sống động) |
| `drawMode` | mặc định là bàn tay vẽ · `pop` (bật ra) · `fade` (hiện dần). `hand: false` thì vẽ nét mà không hiện bàn tay |
| `transition` | chuyển cảnh đầu mỗi shot: `fade` · `flash` · `wipe` · `scan` · `iris` · `page` · `smudge` · `cut` (`transitionDur`). Shot có thể ghi đè bằng `transition` |
| `captionBox` | `note` (giấy nhớ vàng) · `sticker` · `intertitle` (khung phim câm) · `tag` (nhãn bản vẽ), kèm `captionTypewriter` |
Đạo diễn nên dựng cảnh khác nhau theo phong cách (bố cục, nhịp, kiểu chữ), không chỉ đổi `style`. Video cần đồ vật như thật thì dùng `studio/engine3d/`.

## Phong cách vệ tinh (`ve-tinh`, `lib/geo.mjs`)
Nền ảnh vệ tinh thật, không người que. Thẻ kiến thức: `studio/references/ve-tinh-anh-that/card.md`. Phim mẫu: `projects/bach-dang-ve-tinh/` (`build_scene.py`).

- Cấp scene: `"satmap": "sat/satmap.json"` (tạo bằng `studio/tools/satmap.py`). Dòng ghi nguồn Esri tự hiện ở góc trên phải khi shot có `satmap` hoặc `globe`.
- Cấp shot: `"view": [{"t": 0, "lat": 20.9, "lon": 106.77, "zoom": 11}, {"t": 3, "lat": …, "lon": …, "zoom": 13, "ease": "ease"}]`. Zoom theo thang Web Mercator (2 ≈ cả Trái Đất, 6 ≈ Việt Nam, 12 ≈ một con sông, 14 ≈ một phường). Khi zoom vào, điểm đích trôi mượt về giữa khung; khi zoom ra, điểm gốc trôi mượt. Shot vệ tinh **không dùng `camera`**.
- Mọi phần tử có thể đặt theo tọa độ: `"geo": [lat, lon]` (+ `dx`, `dy`) thay cho `x`, `y`.

| Phần tử (`type`) | Thuộc tính |
|---|---|
| `satmap` | nền vệ tinh theo `view`. `dim` 0..1, `shade: false` bỏ dải tối trên/dưới |
| `stars`, `globe` | nền sao; quả địa cầu theo cùng `view` (zoom ≤ ~5,5, rồi cắt sang `satmap` cùng tâm và zoom là liền mạch). Cần mức `world` trong satmap |
| `marker` | ghim trắng + vòng lan, `geo`, `label`, `side` (1 phải, -1 trái, 0 trên), `color`, `size` |
| `tag` | nhãn hộp: `text`, `geo` hoặc `x,y`, `align`, `size`, `icon: true` (ghim nhỏ), `bg` (white/orange/blue/red), `color` |
| `route` | đường đi phát sáng: `path` [[lat,lon],…] (tự làm mượt), `color`, `width`, `dashed`, `head` (`arrow`/`dot`), `grow: {at, dur}` vẽ dần, `label`, `labelAt` 0..1, `labelDx`, `labelDy`, `track` (alpha) |
| `area` | vùng khoanh: `path`, `color`, `fillAlpha`, `pulse`, `dashed`, `width` (0 = không viền) |
| `dots` | chấm (cọc, điểm): `points` [[lat,lon]…], `size`, `stagger`, `color` |
| `title` | `kicker` (cam nghiêng), `title` (trắng siêu đậm, gõ từng chữ; `typing: false` tắt), `sub` (cam), `badge`, `x`, `y`, `size` (108), `align` |
| `photo` | thẻ polaroid bay lên: `path`, `x`, `y`, `w`, `ratio` (cắt khung), `focus` [fx,fy], `rotate`, `kenburns` (1,08), `credit` (**bắt buộc** tác giả · giấy phép), `caption`. `full: true` → ảnh nền toàn khung, `dim` |
| `stats` | ô số liệu: `items` [{`icon`, `value`, `label`}], `y`, `w`, `stagger`, `valueSize`. Icon: calendar, ship, stake, water, sword, crown, clock, pin, people, flag, area, ruler |
| `clouds` | mây trôi: `n`, `y0`, `y1`, `speed`, `opacity` |
| `note` | chú thích nhỏ ("*minh họa"): `text`, `x`, `y` |
| `shade` | dải tối trên/dưới thêm: `top`, `bottom` |

Phụ đề của `ve-tinh`: chữ trắng Inter Display Black viền đen. Nên đặt `captions.y` = 1450; giữ ô số liệu và nhãn trên y ≈ 1340.
Render nặng hơn vẽ tay (địa cầu tính từng điểm ảnh): khoảng 4–5 s máy cho 1 s phim.

## Phong cách BĐS (`bds`, `lib/bds.mjs`)
Video giới thiệu bất động sản: mở đầu trên ảnh vệ tinh → ảnh thật của dự án (thông số, tiện ích) → từng địa điểm lân cận có tuyến đường, km, phút → thẻ kêu gọi. Phần vị trí học từ skill `map-location-video` (thẻ `studio/references/vi-tri-ket-noi-bds/card.md`).
**Không viết tay scene này**: điền `projects/<slug>/bds.json` (mẫu `studio/references/vi-tri-ket-noi-bds/bds.example.json`) rồi chạy `python3 studio/tools/bds_build.py projects/<slug>`. Builder lấy tuyến OSRM, tính zoom, tải ảnh vệ tinh, viết `scene.json`. Kiểm tra: `node studio/engine/check_layout.mjs scene.json --sheet sheet.png` (phải 0 lỗi).

- `view` nhận thêm `tilt` (độ, 0 = nhìn thẳng). Có `tilt` thì `satmap` nghiêng 3D (tâm khung luôn là tâm view) và mọi phần tử `geo` chiếu theo phối cảnh. Dùng được cho cả `ve-tinh`.
- Scene đặt `"credit": ""` để tắt dòng Esri góc trên; nguồn nằm trong `bdsFooter`.
- Kích thước viết theo khung 576 px của skill gốc nhân 1,875. Lề 36 (67 px), đáy thẻ cách đáy 84 (158 px). Phụ đề ở trên: `captions.y` = 250.

| Phần tử | Thuộc tính |
|---|---|
| `bdsShade` | lớp tối, sương ở xa, viền tối (đặt ngay sau `satmap` có `shade: false`). `dim` |
| `bdsRoute` | `path` [[lat,lon]…], `sty`, `grow {at, dur}`, `alpha`, `head` (chấm đầu khi đang vẽ), `width` |
| `bdsPin` | ghim kim loại: `geo`, `sty` (gold, blue, ruby, green, violet), `label`, `project: true` (nhãn vàng, to 1,15), `size`, `pop: false` (hiện ngay), `id`, `bottom`/`top` (giới hạn nhãn). Nhãn tự đặt trên/trái/phải, né nhãn và ghim vẽ trước trong cùng khung → đặt ghim dự án trước |
| `bdsCard` | thẻ địa điểm dưới: `cat`, `name`, `km`, `min`, `extra` (chip thứ ba), `sty`, `index`, `total` |
| `bdsBar` | thanh trên: `name`, `area`, `colors` [sty…], `active` (đoạn đang chạy, đầy dần theo cảnh) |
| `bdsHeadline` | chữ mở đầu: `lines` [dòng trắng, dòng vàng], `sub`, `y` |
| `bdsOutro` | thẻ kết: `name`, `tagline`, `cta` (nút vàng), `note` |
| `bdsFooter` | chân: `text`, `credit` |
| `bdsPhoto` | ảnh dự án: `path`, `mode` (`cover` phủ kín; `card` ảnh nguyên trong khung viền vàng trên nền mờ; mặc định ảnh ngang → `card`), `zoom` [1, 1.1], `focus`, `focusTo`, `dim`, `bottom` (đáy khung `card`), `illustration` (true hoặc chữ: ghi "Ảnh minh họa") |
| `bdsCaption` | `kicker` (nhãn kim loại), `title`, `sub`, `sty`, `y` (neo đáy) |
| `bdsSpecs` | thẻ thông số: `title`, `items` [{`icon`, `label`, `value`}], `y` (đáy). Icon: area, bed, bath, money, key, doc, building, compass, car, calendar, pool, pin, star |
| `bdsChips` | chip tiện ích: `items` [chữ…], `y` (đáy), `sty` |

Icon thẻ địa điểm chọn theo `cat`: y tế/bệnh viện (chữ thập), mua sắm/chợ/siêu thị (túi), giáo dục/trường (mũ), công viên/hồ/sông (cây), giải trí/thể thao (sao), hành chính (tòa nhà), metro/ga (tàu), còn lại (mũi tên).

## Mở rộng engine
- Tư thế mới: thêm vào `POSES` trong `lib/character.mjs` (góc tính bằng radian, 0 là thõng xuống, số dương là xoay về hướng mặt).
- Đạo cụ mới: thêm hàm vào `PROPS` trong `lib/props.mjs`. **Chỉ dùng các lệnh Canvas mà `Recorder` hỗ trợ**: path, arc, ellipse, rect, roundRect, fill, stroke, fillText, save/restore, translate/rotate/scale. **Không dùng `clip`.**
- Sau khi thêm, chạy `node catalog.mjs` và render thử một shot.
