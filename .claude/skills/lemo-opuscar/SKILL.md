---
name: lemo-opuscar
description: Làm video QBK bằng thư viện mã nguồn mở Lemo-Opuscar (99 phong cách phim vẽ bằng code: thủy mặc, khắc gỗ, khắc đồng, màn hình CRT, phim câm, pixel RPG, bản đồ 3D...). Dùng khi người dùng chọn một phong cách có nhãn "Lemo" trong app QBK Studio (`engine: "lemo"` trong `app/styles`), nói "làm theo phong cách Lemo", "phong cách repo trên TikTok", hoặc gọi tên một phong cách của thư viện. Kết hợp với quy trình `lam-video` (kịch bản, giọng Gemini, kiểm định, phát hành giữ nguyên).
---

# Lemo-Opuscar trong QBK

Thư viện: https://github.com/lemomo-ai/lemo-opuscar (Lemomo / LemoLab). Mỗi phong cách có `styles/<slug>/STYLE.md` (luật bất biến của phong cách) và một phim demo dựng hoàn toàn bằng code. Trang có `window.render(t)` được Chrome headless chụp từng khung, rồi trộn tiếng và xuất MP4.

QBK dùng thư viện như **một engine thứ ba**, bên cạnh `studio/engine` (2D người que) và `studio/engine3d`. Kịch bản, giọng đọc, phụ đề, kiểm định và bộ đăng bài vẫn theo skill `lam-video`. Chỉ phần **hình và âm thanh nền** làm theo thư viện.

## 1. Cài (mỗi container một lần, khoảng 1 phút)
```bash
sh .claude/skills/lemo-opuscar/scripts/install.sh      # in LIB=... và PLAYWRIGHT_CHROME=...
export LIB=$HOME/lemo-opuscar PLAYWRIGHT_CHROME=<đường dẫn in ra>
```
- Thư viện nằm ở `~/lemo-opuscar`, **không commit vào repo QBK**: tài liệu của thư viện theo giấy phép CC BY-NC 4.0, chỉ được dùng để làm phim, không được phát tán lại. Code của thư viện theo MIT nên được chép vào thư mục dự án.
- Container này không có GPU. WebGL chạy phần mềm (SwiftShader): phong cách 2D và phong cách có compositor WebGL nhẹ mất 0,2–1 giây mỗi khung. Phong cách 3D nặng (three.js, DOF) chậm hơn nhiều, nên render thử vài khung trước khi chọn.
- Phong cách có dấu ✦ cần máy tạo ảnh. QBK không có, nên **không chọn** các phong cách đó.

## 2. Chọn phong cách
- Danh sách đầy đủ: `$LIB/styles/README.md` và trang https://lemomo-ai.github.io/lemo-opuscar/. Phong cách đã có trong app QBK: xem `app/styles` (mục có `engine: "lemo"`, `lemo: "<slug>"`).
- Chủ đề nhiều thời kỳ thì dùng **mỗi thời kỳ một phong cách** (ví dụ `projects/hanh-trinh-chu-in`: thủy mặc → khắc gỗ → khắc đồng → CRT).
- Đọc `$LIB/AGENTS.md` (phần Style and story, Workflow), `$LIB/DIRECTOR.md`, `$LIB/TECHNIQUE.md`, rồi `STYLE.md` của phong cách đã chọn. **STYLE.md là luật cứng**: màu, nét, cách hiện hình, chuyển cảnh, phụ đề, âm thanh. Mọi thứ khác (cấu trúc, cảnh, nhịp) do đoàn phim tự đạo diễn theo chủ đề.

## 3. Làm phim (khớp với `lam-video`)
1. **Kịch bản, nguồn, giọng**: như thường lệ (`bien-kich`, `long-tieng`). Giọng Gemini tăng tốc 1,2x, phụ đề theo `captions-audio.json` và khoảng lặng thật.
2. **TREATMENT.md** trong `projects/<slug>/`: 3 cấu trúc ứng viên rồi chọn một, **trước khi** mở demo. Sau đó mới lấy mã demo để học kỹ thuật: `sh .claude/skills/lemo-opuscar/scripts/demo.sh <slug>`. Không dựng lại câu chuyện, cảnh hay đạo cụ của demo.
3. **Trang dựng hình** ở `projects/<slug>/lemo/`: `index.html` + `main.js` (+ `film.js` cho mỗi chương nếu nhiều phong cách). Chép engine cần dùng (MIT) từ `demo/` vào dự án. Trang nạp thư viện bằng URL tuyệt đối `/core/lib.js` (dự án được phục vụ ở `/@film/`).
   - Khổ 9:16: luôn truyền `--size 1080x1920` và vẽ theo 1080×1920. Engine của demo mặc định 1920×1080, nên truyền kích thước khi tạo canvas/compositor (`makePrinter(W,H)`, `layerSet(W,H)`...) và sửa hằng `W, H` trong file chép về.
   - **Tiếng Việt**: font trong STYLE.md thường thiếu dấu (IM Fell, Bodoni Moda). Thay bằng font OFL cùng tinh thần có đủ dấu: Cormorant Garamond, EB Garamond, VT323 (đủ dấu), Pinyon Script. Kiểm tra bằng fontTools trước khi dùng. Atlas ký tự của `ascii-crt` chỉ có ASCII: chữ Việt đặt từng ký tự lên lưới bằng `fillText`.
   - Phụ đề vẽ trong trang, đúng kiểu của phong cách (đề từ, chữ in lề, mảnh giấy, dòng LOG...), tránh vùng giao diện TikTok ở đáy (đặt khoảng y 1400–1650).
4. **Xem thử**: `cd $LIB && node core/render/still.mjs <dự án>/lemo 1 3 5 --size 1080x1920 --q ch=a --out <thư mục>`. Ghép tờ tiếp xúc, soi từng khung theo STYLE.md (mục Pitfalls).
5. **Render**: `node core/render/video.mjs <dự án>/lemo --size 1080x1920 --fps 24 --workers 4 --q ch=a --out <dự án>/lemo/out/ch-a.mp4` và `node core/render/events.mjs ... --out out/ev-a.json` cho sự kiện âm thanh.
6. **Âm thanh**: `mix.py` trong dự án dùng `$LIB/core/audio/sfx.py` (tổng hợp, không bản quyền) theo `window.EV`, nền nhạc theo bảng nhạc cụ của STYLE.md, giọng cao hơn nền khoảng 10 dB. Chạy bằng `$LIB/.venv/bin/python`.
7. **Ghép và master**: nối các chương (`ffmpeg concat`), rồi `sh $LIB/core/render/mux.sh video.mp4 mix.wav final.mp4 24` (−14 LUFS). Phong cách nét mảnh, giấy, pixel: không thêm grain.
8. Kiểm định, phát hành, tải lên app như mọi video (`lam-video`, mục App QBK Studio).

## 4. Ghi công
- Trong `publish.md` và `notes.md`: "Phong cách dựng theo Lemo-Opuscar của Lemomo (LemoLab), github.com/lemomo-ai/lemo-opuscar". Phim tự làm là của người dùng, kể cả đăng kiếm tiền, không bắt buộc ghi công. Ghi công chỉ để minh bạch.
- Code chép từ demo giữ nguyên dòng bản quyền MIT ở đầu file nếu có. Nhân vật Clawd và giao diện sản phẩm của bên thứ ba trong một số demo **không** được cấp phép: không dùng.
- Không chép `STYLE.md`, `DEMO.md` hay tài liệu `.md` khác của thư viện vào repo QBK. Thẻ kiến thức trong `studio/references/` chỉ viết lại bằng lời của mình, ngắn gọn.

## 5. Ví dụ đã làm
`projects/hanh-trinh-chu-in/`: 43,6 giây, 4 phong cách (`ink-wash`, `woodcut`, `engraving`, `ascii-crt`). Xem `TREATMENT.md`, `lemo/` (trang, engine đã chỉnh sang 9:16, `mix.py`) và `notes.md`.
