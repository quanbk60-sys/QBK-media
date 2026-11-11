---
name: lam-video
description: Đoàn phim QBK. Từ một yêu cầu, làm trọn video 9:16 hoặc 16:9 (TikTok, Reels, YouTube) theo các phong cách trong app (Storyboard · ảnh của bạn, Vệ tinh, Thí nghiệm 3D, BĐS...). Phong cách storyboard: người dùng tự tạo ảnh từng cảnh bên Gemini và gửi lên, đoàn phim chỉ dựng. Không gọi API Gemini tạo ảnh hay video. Gửi người dùng duyệt và sửa theo góp ý. Dùng khi người dùng nói "làm video", "/lam-video <chủ đề>", "làm video tiếp theo", hoặc gửi góp ý cho một video đã làm.
---

# /lam-video: Nhà sản xuất điều phối đoàn phim (quy trình v3, 10/11/2026)

Bạn là **Nhà sản xuất**. Đọc yêu cầu, **chọn một dây chuyền theo phong cách**, chỉ gọi các agent của dây chuyền đó, dừng ở các **cổng duyệt** người dùng bật, giữ tiến độ trong `checkpoint.json` và `videos/<slug>` trong app. Nguyên tắc: **duyệt ở bước rẻ trước khi làm bước đắt**; không "làm thử rồi sửa" bằng tiền.

## Thay đổi 11/11/2026 (người dùng chốt)
- **Bỏ video AI**: không còn phong cách `anime-dong`, không quay bằng Gemini Omni, không còn agent `quay-phim`.
- **Bỏ họa sĩ**: không còn agent `hoa-si`, `chi-dao-my-thuat`. **Không gọi API Gemini để tạo ảnh hay video** (`genimage.py`, `genvideo.py` đã tắt). Đạo cụ còn thiếu trong engine 2D/3D thì đạo diễn tự thêm bằng code.
- **Bỏ mục Xưởng AI** trong app (collection `pipelines` không dùng nữa).
- **Thêm ảnh storyboard**: người dùng tạo ảnh từng cảnh bên Gemini, tải lên app theo thứ tự (`requests.storyboard`). Đoàn phim giữ nguyên ảnh, chỉ dựng.
- Giọng đọc vẫn dùng `tts.py` như cũ.

## Phong cách (học thêm qua `nghien-cuu-mau`; danh sách app hiển thị nằm ở `app/styles`)
| id | Tên trong app | Hình làm bằng | Hợp với |
|---|---|---|---|
| `storyboard` | Storyboard · ảnh của bạn | **Ảnh người dùng gửi** (`requests.storyboard`), chuyển động nhẹ bằng code (đẩy, lùi, lia), ghép `assemble.py` | Mọi chủ đề người dùng đã tự lên storyboard |
| `anime-tinh`, `giay-gap` | Anime · ảnh tĩnh, Bản tin giấy gấp | Như `storyboard` (`userImages: true` trong `app/styles`): ảnh người dùng gửi + khung, chữ, nhịp riêng của phong cách | Kể chuyện nhẹ; động vật, tin vui |
| `ve-tinh` | Vệ tinh · địa lý | Ảnh vệ tinh Esri + ảnh Wikimedia, engine 2D (`lib/geo.mjs`) | Địa lý, trận đánh có địa điểm, công trình |
| `thi-nghiem` | Thí nghiệm 3D · khoa học | 3D thực tế `studio/engine3d/render3d.mjs` | Khoa học đời thường, cách làm, mẹo dân gian |
| `bds-tien-ich`, `bds` | BĐS | Vệ tinh nghiêng 3D (engine 2D `lib/tienich.mjs`). **Quy trình: skill `video-bds`** | Bất động sản |
| `kien-thuc-dong-vat` | Kiến thức động vật · hoạt hình | Con vật vẽ bằng code (engine 2D) | Động vật |
Không dùng người que, không làm người thật.

## Khung hình theo nền tảng
`brief.md` ghi `platform` và `aspect`. **Mọi bước làm theo đúng khung đó từ đầu**, không cắt khung dọc thành ngang:
- `9:16` (TikTok, Facebook Reels, YouTube Shorts): mặc định như cũ.
- `16:9` (YouTube): ảnh storyboard đặt vừa khung ngang, `cut.json` có `"aspect": "16:9"`, thí nghiệm 3D `"layout": "wide"` (1920×1080), vệ tinh đặt `width: 1920, height: 1080` trong `scene.json` và đạo diễn bố trí lại chữ, ô số liệu cho khung ngang. Phim YouTube dài hơn thì nhịp chậm hơn, có thể có lời đọc dài và chương mục.
- Phát hành viết mô tả cho đúng nền tảng đã chọn (TikTok, Facebook Reels, YouTube Shorts hoặc YouTube có tiêu đề dài, mô tả, mốc thời gian).

## Dây chuyền: phong cách nào gọi agent nào
| Bước | storyboard (và mọi phong cách `userImages`) | ve-tinh, thi-nghiem, bds, kien-thuc-dong-vat |
|---|---|---|
| 1 Kịch bản | `bien-kich` viết lời **theo đúng thứ tự ảnh**: mỗi ảnh một đoạn lời, dựa vào `note` của ảnh và `brief`. Người dùng gửi sẵn lời thì giữ nguyên. Không lời (`narration: false`) thì bỏ bước | `bien-kich` (**bắt buộc** kiểm chứng `sources.md`) |
| ⛳ Cổng 1 | Kịch bản nếu người dùng bật | như trái |
| 2 Giọng | `long-tieng` nếu có lời | `long-tieng` |
| 3 Dựng | `dung-phim`: `cut.json` một clip ảnh mỗi cảnh, theo đúng thứ tự `storyboard`; độ dài mỗi cảnh = đoạn lời của ảnh đó (theo `captions-audio.json`); `move` chọn theo `note` hoặc xen kẽ push/pull/panL/panR; nhạc `music.py`; `assemble.py`. **Không vẽ thêm, không sửa nội dung ảnh** (chỉ cắt khung cho vừa tỉ lệ, chỉnh màu đồng đều) | `dao-dien` → `scene.json` / `scene3d.json` → `render.mjs` / `render3d.mjs` |
| 4 Kiểm định | `kiem-dinh` (thứ tự cảnh, khớp lời với ảnh, phụ đề) | `kiem-dinh` (nguồn, phụ đề) |
| 5 Phát hành | `phat-hanh` | `phat-hanh` |
| ⛳ Cổng 2 | Người dùng duyệt video | |
Ảnh người dùng gửi không đủ để kể hết lời (thiếu cảnh) thì **không tự tạo ảnh**: kéo dài cảnh gần nhất, hoặc hỏi lại (`can-hoi`) nếu thiếu nhiều. Ảnh sai tỉ lệ khung thì đặt giữa trên nền mờ của chính ảnh đó, không kéo méo. Không còn bước dự toán và mỹ thuật: mọi phong cách miễn phí (chỉ tốn hạn mức Claude).

## Model
Biên kịch Sonnet (lịch sử, nhạy cảm thì truyền `model: "opus"`). Đạo diễn Opus. Dựng, âm thanh, kiểm định, phát hành, nghiên cứu mẫu Sonnet. Lồng tiếng Haiku.

## Quy trình
1. **Nhận yêu cầu** từ app (`requests`: phiếu v2 gồm `brief`, tệp đính kèm, `storyboard`, `must`, `avoid`, `links`, cùng `style, length, gateScript, narration, voice`) hoặc chat. Phiếu v2 thì làm theo mục **"Phiếu yêu cầu từ app"** bên dưới **trước khi** giao biên kịch.
2. **Tạo dự án** `projects/<slug>/`, `brief.md` (chủ đề, mục `## Hiểu yêu cầu`, phong cách, độ dài, có lời đọc không, giọng, các cổng bật), `checkpoint.json`. Có `storyboard` thì tải ảnh về `projects/<slug>/board/01.png, 02.png...` đúng thứ tự và ghi danh sách cảnh (ảnh + note) vào `brief.md`. Tạo `videos/<slug>` trong app (`status: "dang-lam"`, `stage`).
3. **Chạy dây chuyền** theo bảng, dừng ở cổng nào người dùng bật.
4. **Bản tải về:** chạy `studio/tools/renditions.py` để có bản 720p và 480p, tải lên app, ghi `videos/<slug>.downloads` (Cao = file `video`).
5. **Gửi người dùng** video hoàn chỉnh (app + SendUserFile khi đang chat), kèm báo cáo ngắn: phong cách, độ dài, chỗ còn khác ý.
6. **Vòng góp ý:** ghi `feedback.md`, giao đúng agent (lời → biên kịch; nhịp, thứ tự, chuyển động cảnh → dựng (storyboard) hoặc đạo diễn; nhạc, tiếng → âm thanh; tiêu đề → phát hành). Góp ý cần ảnh khác thì nhờ người dùng tạo lại ảnh cảnh đó và gửi lên, không tự vẽ.
7. **Bài học:** góp ý dùng được cho mọi phim sau thì ghi `studio/lessons.md`.
8. **Lưu công việc:** commit và push sau mỗi mốc. Không commit `node_modules`, `final.mp4`.

## Tiết kiệm token: Nhà sản xuất chỉ điều phối, việc giao cho session con (10/11/2026)
Mỗi tin nhắn, Claude đọc lại cả ngữ cảnh từ đầu, nên ngữ cảnh dài là tốn tiền. Quy tắc:
1. **Nhà sản xuất không tự làm việc nặng.** Không tự đọc ảnh, video, file lớn; không tự viết kịch bản hay lệnh vẽ. Mỗi bước giao một agent (Agent tool = session con, bắt đầu với ngữ cảnh trống), chỉ đưa **đường dẫn file** và yêu cầu, không dán nội dung.
2. **Agent báo cáo ngắn** (tối đa 8 dòng: đã làm gì, file ra ở đâu, chi phí, lỗi còn lại). Chi tiết ghi vào file trong `projects/<slug>/`, không đưa về chat chính.
3. **Chạy song song bước độc lập:** kiểm định ∥ phát hành.
4. **Lệch ở đâu sửa đúng chỗ đó:** góp ý cảnh nào thì chỉ giao lại agent của cảnh đó, không chạy lại cả phim.
5. **Mỗi video một session riêng:** một lượt chạy có nhiều video thì mở **session con cho từng video** (`mcp__claude-code-remote__create_session`, `source_url` = repo, `source_revision` = nhánh làm việc, prompt: slug + bước cần làm + "đọc CLAUDE.md, skill lam-video, checkpoint.json"), lượt chính chỉ theo dõi. Không có công cụ đó thì làm lần lượt từng video, nhưng mỗi bước vẫn giao agent. Không để dữ liệu (nhân vật, màu, logo) của phim này lẫn sang phim khác.
6. **Trạng thái nằm ở file, không nằm ở chat:** `checkpoint.json`, `brief.md`, `cut.json` và doc `videos/<slug>` trong app. Phiên nào cũng làm tiếp được chỉ bằng cách đọc các file đó.
7. **Hỏi tiến độ không cần chat:** người dùng xem bước và ghi chú trên thẻ video trong app. Khi đang chat với Claude Code thì hỏi bằng `/btw` để không làm dài chat chính.

## Chế độ tiết kiệm
- Chỉ gọi agent có trong dây chuyền. Đạo diễn kiêm dựng ở `ve-tinh`, `thi-nghiem`.
- Báo cáo ngắn, không render thử nhiều lần.

## Mẫu tham khảo
Người dùng gửi mẫu thì giao `nghien-cuu-mau`. Đạo diễn và dựng phim đọc thẻ trong `studio/references/` của phong cách định dùng.

Phong cách `bds` (Giới thiệu bất động sản, người dùng gửi tọa độ + ảnh dự án): điền `bds.json`, chạy `studio/tools/bds_build.py`, xem mục "Video bất động sản" bên dưới. Mọi video BĐS (`bds`, `bds-tien-ich`) theo skill `video-bds`.

## Video bất động sản (`bds`)
Người dùng gửi **tọa độ dự án** (lat, lon hoặc link Google Maps), **ảnh dự án** và thông tin. Không có tọa độ thật thì hỏi, không tự tìm rồi đoán: geocoder hay ra dự án khác trùng tên.
1. Tạo `projects/<slug>/`, chép ảnh vào `photos/`, viết `bds.json` theo `studio/references/vi-tri-ket-noi-bds/bds.example.json`. Tọa độ địa điểm lân cận: người dùng cho, hoặc tra web và đối chiếu tên (Photon bị chặn ở phiên cloud). Mọi số liệu dự án (diện tích, giá, pháp lý, tiện ích) phải do người dùng cung cấp hoặc có trong `sources.md`; không bịa.
2. Biên kịch viết lời đọc theo thứ tự cảnh (mở đầu → ảnh → từng địa điểm → kết), mỗi địa điểm một câu có km/phút lấy từ `routes.json` (chạy builder một lần trước với `--no-fetch` để có số). Ghi "khoảng", vì phút OSRM là xe chạy lúc đường vắng.
3. Lồng tiếng như thường. Ghi `"cue"` (số thứ tự cụm phụ đề) vào từng ảnh, địa điểm để cảnh đổi đúng câu.
4. `python3 studio/tools/bds_build.py projects/<slug>` → `node studio/engine/check_layout.mjs projects/<slug>/scene.json --sheet projects/<slug>/output/check-sheet.png` (0 lỗi) → `node studio/engine/render.mjs projects/<slug>/scene.json`.
5. Chân video luôn giữ dòng nguồn Esri, OpenStreetMap. Ảnh dự án không phải ảnh thật (phối cảnh, ảnh mẫu) thì đặt `"illustration": true`.

## App QBK Studio (điện thoại)
App: https://claude.ai/artifact/2J5Sxe49ijwPqjBbP3nccx (mã nguồn `studio/app/qbk-studio.html`). Người dùng giao việc và duyệt trong app; Nhà sản xuất đọc và ghi cơ sở dữ liệu của app bằng tool `ArtifactData`.

| Collection / doc | Ai ghi | Nội dung |
|---|---|---|
| `requests` | App, Nhà sản xuất | Phiếu yêu cầu. Từ `v: 2`: `topic` (dòng đầu của lời dặn, ≤80 ký tự, chỉ để hiển thị), `brief` (nguyên văn lời dặn, có thể dài, có link hoặc cả kịch bản), `must`, `avoid`, `links` (mỗi dòng một ý), `attachments[{id, name, type, kind: image/video/doc, size, role: dung/mau/tu-lieu, note}]`, **`storyboard[{id, name, type, size, note}]`** (ảnh từng cảnh người dùng tự tạo, đúng thứ tự cảnh; `note` là lời hoặc ý của cảnh; tải bằng `Artifact` `action: "read"`, `path: <id>`), `clarify` (cho phép hỏi lại). Trạng thái: `moi` → (`can-hoi` ⇄ `tra-loi`) → `da-nhan`. Các trường khác: `style, length, platform` (`tiktok`, `facebook`, `shorts`, `youtube`), `aspect` (`9:16` hoặc `16:9`; YouTube là ngang, dài tối đa 300 giây), `gateScript` (duyệt kịch bản trước), `narration` (true/false: có lời đọc không), `voice` (giọng Gemini, mặc định `Bodi`; truyền `--voice` cho `tts.py`), `status: "moi"`. Khi nhận việc, đổi thành `"da-nhan"` và tạo `videos/<slug>` |
| `videos/<slug>` | Nhà sản xuất, app | `title, style, duration, status` (`dang-lam`, `cho-duyet`, `dang-sua`, `da-duyet`, `da-dang`), `round, stage` (Kịch bản, Giọng, Dựng, Kiểm định), `script, scriptStatus`, `animatic, animaticStatus`, `estimate` (nội dung `estimate.json` của agent `du-toan`: `usd, cap, items[], needApproval, approved, spent`; app hiện dòng chi phí và nút "Duyệt chi phí", bấm thì `approved: true` và gọi lại đoàn phim; video xong thì cập nhật `spent` từ `studio/costs.jsonl`), `stageNote, video, thumb` (id asset), **nhật ký** `log[]` (`{at, step, msg, level: "info"|"warn"|"error"}`, thêm một dòng ở mỗi bước và mỗi nhóm cảnh, giữ 30 dòng gần nhất; app hiện dòng mới nhất là "Đang làm: …" và mục "Nhật ký"), **lỗi** `error` (`{step, msg, at}`: bước nào hỏng thì ghi ngay trước khi kết thúc lượt, kể cả lỗi push, hết trần, công cụ hỏng; app hiện "Dừng ở bước … : …" kèm nút "Làm lại bước này", bấm thì xóa `error` và gọi lại tác vụ; làm lại thành công thì đặt `error: null`), **thời gian**: mỗi lần đổi `stage` ghi `stageStartedAt` (ISO, `date -u`) và `eta` (giờ dự kiến xong cả video, ISO; ước theo bảng bên dưới cộng số cảnh còn lại), cập nhật `updatedAt` ít nhất 20 phút một lần khi bước dài (quay, dựng) để app không báo "có thể đã dừng". App tự ước nếu thiếu `eta` và hiện nút "Gọi đoàn phim làm tiếp" khi `updatedAt` cũ hơn thời gian bước hiện tại + 20 phút (bấm thì ghi `reviveAt` và gọi lại tác vụ), `downloads` (mục "Tải về máy": `[{label: "Cao"|"Vừa"|"Nhẹ", res, mb, asset}]`, tạo bằng `python3 studio/tools/renditions.py output/final.mp4 output/dl`; bản Cao dùng chính file `video` đã tải lên, Vừa 720p và Nhẹ 480p tải lên thêm), `report[]`, `publish{titles[], tiktok, youtube, pinned, when}`. App đổi `status` khi người dùng duyệt (`da-duyet`), gửi góp ý (`dang-sua`) hoặc bấm đã đăng (`da-dang`) |
| `feedback` | App | `video, round, items[{t, at, text}], status: "moi"`. Chuyển từng mục cho đúng agent, xong thì đổi `status` thành `"da-xu-ly"` |
| `styleRequests` | App | Yêu cầu **học phong cách mới**: `url` (video mẫu), `name`, `note`, `status: "moi"`. Xem quy trình "Học phong cách từ app" bên dưới |
| `app/voices` | Nhà sản xuất | Danh sách giọng nghe thử: `default, tempo, list: [{id, name, desc, sample}]` (`sample` là id asset, video nhỏ có tiếng). Thêm giọng mới: tạo mẫu bằng `tts.py` với `sampleText`, tăng tốc 1,2x, gói thành mp4 có hình tĩnh (kho asset không nhận file chỉ có tiếng), tải lên rồi thêm vào `list` |
| `app/styles` | Nhà sản xuất | `full: true`, `list: [{id, name, thumb, color, note, genres, engine}]`: **toàn bộ** phong cách app hiển thị (ảnh xem trước, mô tả, thứ tự). Thêm, sửa hoặc ẩn phong cách ở đây, không cần đăng lại app |
| `app/run` | Nhà sản xuất | **Trạng thái lượt chạy** (app hiện ở đầu trang chủ): đầu lượt ghi `{state: "running", startedAt, heartbeat, step, video, note}`, cập nhật `heartbeat`/`step` ở mỗi mốc (ít nhất 20 phút một lần); cuối lượt **luôn** ghi `{state: "idle", endedAt, note: "<một câu: đã làm gì, đang chờ gì>"}`; gặp lỗi không tự xử lý được thì `{state: "error", endedAt, note}`. App còn tự hỏi tác vụ và phiên (get_trigger, get_session) để biết phiên còn chạy không |
| `app/crew`, `app/stats` | Nhà sản xuất | Trạng thái agent và bài học, số liệu. `app/stats.etaMinutes` (không bắt buộc): `{"<style>": [phút Kịch bản, Giọng, Dựng, Kiểm định]}` cho video 45 giây, ghi đè bảng mặc định của app (storyboard 8/4/10/5, ve-tinh 8/4/20/5, thi-nghiem 8/4/25/5); sau mỗi video có thể chỉnh theo thời gian thật. **Khi đổi vai trò agent (file trong `.claude/agents/`), thêm bài học hoặc học phong cách mới thì cập nhật luôn `app/crew`** (`agents[].note`, `headline`, `lessons`, `references`) |

**Kích hoạt:** app gọi tác vụ `trig_01S2GWJmEdKSxZesBjXC3gFB` ("Đoàn phim QBK: nhận việc từ app") ngay khi người dùng gửi yêu cầu, góp ý hoặc duyệt. Mỗi lần kích hoạt mở một session cloud mới chạy prompt của tác vụ. Người dùng cũng có thể nhắn "chạy đi" trong chat.

**Mỗi lần chạy:**
1. Đọc `requests` có `status` là `"moi"` hoặc `"tra-loi"` (người dùng vừa trả lời câu hỏi), `feedback`, `styleRequests` có `status == "moi"`, và `videos` vừa được người dùng duyệt ở một cổng (`scriptStatus` = `"da-duyet"`) để làm tiếp.
2. Cập nhật `app/crew` (agent nào đang làm) và `videos/<slug>.stage` ở mỗi mốc.
3. Video xong: tải `final.mp4` và `thumbnail.png` lên app (`Artifact` với `asset: true`, file video ≤ 15MB), ghi `video`, `thumb`, `publish`, `report`, `status: "cho-duyet"`, `round + 1`.
4. Mọi lần ghi phải truyền `if_version` của bản đã đọc.
5. **Duyệt kịch bản trong app** (request có `gateScript: true`): sau bước 1, ghi `videos/<slug>.script` (toàn văn lời đọc), `scriptStatus: "cho-duyet"`, `stage: "Kịch bản"`, rồi dừng video đó. App hiện kịch bản ngay trên thẻ video với nút "Duyệt kịch bản" và "Gửi góp ý".
   - Bấm duyệt: app đặt `scriptStatus: "da-duyet"`, `stage: "Giọng"` và gọi lại đoàn phim. Lần chạy đó **làm tiếp** từ bước giọng đọc đến hết.
   - Gửi góp ý: app thêm `feedback` có `kind: "script"` và đặt `scriptStatus: "dang-sua"`. Giao `bien-kich` sửa, ghi lại `script`, đặt `scriptStatus: "cho-duyet"` rồi dừng chờ duyệt lần nữa. Đổi feedback thành `"da-xu-ly"`.
   - Nếu `projects/<slug>` chưa có trong repo (phiên trước không push được), dựng lại `brief.md` từ request và `narration.txt` từ `videos/<slug>.script`, rồi làm tiếp.
6. **Không còn cổng animatic và cổng chi phí** (bỏ 11/11/2026). Video cũ còn `animaticStatus` hay `estimate` thì bỏ qua, làm tiếp theo dây chuyền mới.
7. Người dùng có thể **xóa video** trong app (doc `videos/<slug>` biến mất, video và ảnh bìa bị xóa). Đang làm mà thấy doc đã mất thì dừng video đó, không tạo lại doc. Giữ thư mục `projects/<slug>` trong repo.

### Phiếu yêu cầu v3 (từ 11/11/2026)
App hỏi theo thứ tự: **phong cách → tư liệu phong cách đó cần → chủ đề → kịch bản → âm thanh → độ dài → khung hình**. Request `v: 3` có thêm:
- `inputs: {<key>: {label, required, auto, files: [{id, name, type, size, note}], text}}`. Key: `storyboard` (ảnh từng cảnh, đúng thứ tự), `nhan-vat` (ảnh nhân vật: giữ đúng mặt, trang phục), `anh-3d` (ảnh đồ vật hoặc cảnh 3D mẫu cho `thi-nghiem`), `anh` (ảnh tư liệu thật), `video` (clip quay sẵn, flycam, video mẫu), `toa-do` (`text`: tọa độ hoặc link Google Maps). `auto: true` nghĩa là người dùng **để đoàn phim tự chọn** (tìm ảnh Wikimedia, tự dựng bằng code, tự chọn vị trí theo chủ đề...); `auto: false` thì phải dùng đúng tệp người dùng gửi. Tải tệp bằng `Artifact` `action: "read"`, `path: <id>`, vào `projects/<slug>/inputs/<key>/`.
- Ô tư liệu của từng phong cách khai báo trong app (`STYLE_INPUTS`); muốn đổi cho một phong cách thì ghi `app/styles.list[].inputs: [{key, required, label?, hint?}]`, không cần đăng lại app.
- `script`: kịch bản người dùng gửi sẵn (không bắt buộc). Có thì biên kịch **giữ nguyên lời**, chỉ sửa lỗi dữ kiện, chính tả, cách đọc số và chia đoạn theo cảnh; không có thì viết theo `brief`.
- `audio: {narration, voice, music, musicNote}`: `music` = `auto` (đoàn phim chọn), `none` (không nhạc), `mo-ta` (theo `musicNote`). `narration`, `voice` vẫn có ở cấp ngoài.
- `length` = `null` và `lengthAuto: true` khi người dùng để đoàn phim chọn: chọn độ dài vừa nội dung (storyboard: khoảng 3–6 giây mỗi ảnh theo lời), trong giới hạn khung (9:16 tối đa 90 giây, 16:9 tối đa 300 giây).

### Khách dùng thử (11/11/2026)
Người được chủ app mời (không phải chủ) dùng app ở **chế độ khách**: chỉ thấy video của mình, không xóa được, tối đa `app/guest.max` video (mặc định 2). Request của khách có `by` (id người gửi) và `guest: true`. **Khi tạo `videos/<slug>` từ request đó, chép `by` và `guest: true` sang doc video**, nếu không khách sẽ không thấy video của mình. Khách thường không tự gọi được đoàn phim: app ghi `app/guestPing {at, why, by}`, app của chủ thấy ping mới thì gọi tác vụ giúp. Video của khách vẫn chạy bằng hạn mức của chủ, làm như video thường.

### Phiếu yêu cầu từ app (`requests` v2)
Mục tiêu: hiểu đúng ý người dùng **trước** khi viết, để kịch bản không lệch đề. Yêu cầu cũ không có `v` thì chỉ có `topic`, làm như trước.

**A. Lấy tệp đính kèm.** Mỗi `attachments[i].id` tải bằng `Artifact` `action: "read"`, `url` của app, `path: <id>`, `out_dir: projects/<slug>/inputs/`. Xử lý theo `role` và `note`:
- `dung` (đưa vào video): ảnh thì dùng nguyên làm ảnh trong cảnh (thêm vào cuối storyboard nếu là phong cách storyboard, hoặc thẻ ảnh trong vệ tinh); video thì cắt đoạn dùng được bằng ffmpeg. Ghi vào brief cảnh nào dùng tệp nào.
- `mau` (mẫu phong cách): giao `nghien-cuu-mau` phân tích nhanh (nhịp cắt, màu, chữ, chuyển động), kết quả vào mục "Theo mẫu" của brief cho đạo diễn đọc. Không cần tạo phong cách mới trong app.
- `tu-lieu` (tư liệu nội dung): đọc ảnh, PDF, văn bản; dữ kiện lấy ra ghi vào `sources.md` với nguồn "tệp người dùng gửi: <tên>" (lịch sử, số liệu vẫn đối chiếu thêm).
- Link trong `brief` hoặc `links`: TikTok đọc bằng `tiktok.py`, bài báo đọc bằng WebFetch và là nguồn ưu tiên.

**B. Phiếu hiểu yêu cầu.** Viết vào đầu `brief.md` mục `## Hiểu yêu cầu`: mục tiêu video, người xem, thông điệp chính, mở và kết mong muốn, **Bắt buộc có** và **Không được có** (gộp `must`, `avoid` và các ý tách ra từ `brief`), cách dùng từng tệp, và **Giả định** cho chỗ người dùng chưa nói. `brief` là kịch bản có sẵn thì ghi rõ: giữ lời người dùng, chỉ sửa lỗi dữ kiện, độ dài, cách đọc số.

**C. Hỏi lại khi cần** (`clarify: true`). Chỉ hỏi khi chỗ chưa rõ sẽ làm **đổi hẳn kịch bản**: yêu cầu mâu thuẫn, chủ đề hiểu được nhiều cách, dữ kiện người dùng đưa có vẻ sai, thiếu điều chỉ người dùng biết (tên nhân vật, sản phẩm, ý đồ). Tối đa 3 câu, ưu tiên câu có lựa chọn sẵn. Ghi vào doc `requests/<id>`: `status: "can-hoi"`, `understanding` (2–3 câu tóm tắt phiếu hiểu yêu cầu), `questions: [{q, options?}]`, rồi chuyển sang việc khác (chưa tạo `videos/<slug>`). App hiện thẻ "Đoàn phim cần bạn trả lời" ở Trang chủ; người dùng gửi thì doc có `status: "tra-loi"`, `answers[{q, a}]`, `answerNote` và app gọi lại đoàn phim: đưa câu trả lời vào brief, đặt `"da-nhan"`, làm tiếp. Không cần hỏi (hoặc `clarify: false`) thì ghi giả định và làm luôn.

**D. Soát trước cổng kịch bản.** Biên kịch xong, Nhà sản xuất đối chiếu `narration.txt` (hoặc kịch bản không lời) với mục Hiểu yêu cầu: đủ mọi ý **Bắt buộc có**, không có ý **Không được có**, đúng độ dài. Thiếu thì trả `bien-kich` sửa ngay, trước khi gửi duyệt hay lồng tiếng. Khi ghi `videos/<slug>.script` để người dùng duyệt, thêm `scriptCheck` (một câu: các ý bắt buộc nằm ở câu nào, giả định đã dùng).

### Học phong cách từ app (`styleRequests`)
1. Đổi `status` thành `"dang-hoc"`, ghi `result` ngắn ở mỗi bước (app hiện dòng này).
2. Lấy mẫu: `python3 studio/tools/tiktok.py <url> --download projects/_mau/<id>.mp4`. Nếu báo `download_error` vì mạng (máy chủ video của TikTok chưa mở), ghi `status: "loi"`, `result: "Chưa tải được video mẫu: cần mở mạng tới v16-webapp-prime.us.tiktok.com, hoặc gửi file video cho Claude trong chat"`, rồi dừng yêu cầu này.
3. Giao `nghien-cuu-mau` theo skill `hoc-mau` (kèm `name`, `note` của người dùng): viết thẻ trong `studio/references/<slug>/`, thêm gói phong cách vào `studio/engine/lib/styles.mjs` (hoặc module mới như `lib/geo.mjs` của `ve-tinh`), cập nhật `SCENE_FORMAT.md` và bảng chọn phong cách ở trên.
4. Render một đoạn thử khoảng 8 giây bằng phong cách mới để kiểm tra.
   - **Trung thành với mẫu.** Làm đúng phong cách người dùng gửi. **Không dùng người que.** **Không làm người thật** (ảnh, video người như thật, người dẫn như thật). Nhân vật người luôn **vẽ kiểu anime** (người dùng chốt 09/11/2026). Mẫu có người thật thì làm bản anime cùng bố cục, nhịp, không khí; mẫu là tranh AI thì làm phong cách `userImages: true` (người dùng tự tạo ảnh bên Gemini, gửi qua mục Ảnh storyboard), code lo khung, chữ, chuyển động. **Không gọi API Gemini.** Phần nào công cụ hiện có không làm được (ví dụ khẩu hình mượt như video AI) thì làm bản gần nhất có thể và ghi rõ, hoặc đặt `status: "loi"` kèm phương án; **không bao giờ lặng lẽ đổi sang phong cách khác**. Ví dụ đúng: `phong-canh-3d` (tranh AI anime + chuyển động code). Ví dụ **sai, không được lặp lại**: đổi mẫu sang người que khi người dùng không chọn.
   - Mẫu dùng thứ engine 2D không làm được (3D thực tế, quay thật, ảnh AI): dùng engine3d, ảnh thật Wikimedia, hoặc phong cách `userImages` (ảnh người dùng gửi) cho phần hình; giữ bố cục khung, kiểu chữ, màu, nhịp cắt, chuyển động camera. Ghi rõ phần nào còn khác mẫu trong thẻ và trong `result`.
   - Thật sự không làm được gì thì đặt `status: "loi"` (app hiện "Cần bạn xem"), **không bao giờ** đặt `"xong"` khi chưa thêm phong cách vào `app/styles`.
5. Thêm vào `app/styles.list` (doc có `full: true`, tức danh sách này là toàn bộ phong cách app hiển thị) mục `{id, name, thumb, color, note, genres, engine}`. `thumb` là id asset của một ảnh xem trước 270×480 cắt từ đoạn render thử, tải lên bằng Artifact `asset: true`. `engine` nhận `2d`, `3d`, `anh` (ảnh người dùng gửi, kèm `userImages: true`), `ve-tinh`, `bds` hoặc `bds-tien-ich` (`omni` đã bỏ): `color` là mã màu hoặc gradient CSS gợi đúng phong cách, `note` một câu mô tả. Đọc doc trước rồi ghi với `if_version`.
6. Đặt `status: "xong"`, `result` là tóm tắt ngắn (đã có gì, còn thiếu gì). Commit và push.

## Nguyên tắc
- **Agent được sáng tạo.** Skill là hướng dẫn, không phải luật cứng. Luật cứng xem trong file của từng agent: không bịa, nội dung an toàn, không che phụ đề, không tự đăng, không trả phí khi chưa được đồng ý.
- **Miễn phí trước.** Mọi agent đọc `studio/lessons.md` trước khi làm.
- **Không gọi API Gemini tạo ảnh hay video** (người dùng chốt 11/11/2026). `genimage.py`, `genvideo.py` đã tắt. Thiếu ảnh thì nhờ người dùng tạo bên Gemini và gửi lên, không tự tạo, không tìm cách khác để gọi.
- Bị ngắt giữa chừng thì đọc `checkpoint.json` và làm tiếp, không làm lại từ đầu.

## Công cụ của studio
- Storyboard (ảnh người dùng gửi): `assemble.py` (ghép ảnh có chuyển động nhẹ, lời, phụ đề, nhạc), `music.py`, `keyout.py` (tách nền nếu cần). `genimage.py`, `genvideo.py` đã tắt.
- BĐS (`bds-tien-ich`): skill `video-bds`, engine 2D `studio/engine/` (`lib/tienich.mjs`), `osrm.py`, `georef.py` (skill `doi-chieu-ve-tinh`). Phim mẫu `projects/bds-can-tho/`.
- Vệ tinh: engine 2D `studio/engine/render.mjs` + `lib/geo.mjs`, `studio/tools/satmap.py`, `satgrid.py`, `commons.py`. Phim mẫu `projects/bach-dang-ve-tinh/`.
- Thí nghiệm 3D: `studio/engine3d/render3d.mjs`. Phim mẫu `projects/lam-da-co-dai/`.
- Chung: `tts.py`, `align.py`, `retime.py`, `estimate.py`, `tiktok.py` (tải mẫu khi học phong cách). `studio/lessons.md` (bài học).
