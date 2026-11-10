# QBK Media: xưởng video ngắn vẽ bằng code

Repo này là **đoàn phim thu nhỏ**. Nó tạo video hoạt hình người que 9:16 cho TikTok và YouTube Shorts: lời đọc tiếng Việt, phụ đề, âm thanh, toàn bộ hình **vẽ bằng code** (miễn phí, không giới hạn, nhân vật cử động được).

## Bắt đầu
- Làm video: `/lam-video <chủ đề>` hoặc "làm video tiếp theo". Skill `.claude/skills/lam-video` điều phối 9 agent trong `.claude/agents/`: bien-kich, long-tieng, dao-dien, hoa-si, dung-phim, kiem-dinh, phat-hanh, nghien-cuu-mau, san-trend.
- Quy trình v2: đoàn phim làm **trọn video** rồi gửi người dùng duyệt. Người dùng chỉ ra các điểm cần sửa, Nhà sản xuất chuyển về đúng agent, làm lại và gửi lại. Góp ý dùng được cho mọi video sau được ghi vào `studio/lessons.md`.
- 11 gói phong cách (mới nhất: `bds-tien-ich`, bất động sản) (`"style"` trong scene.json), gợi ý theo thể loại trong skill `lam-video`.
- Agent được tự sáng tạo ngoài skill, ghi lý do vào `notes.md`. Luật cứng giữ nguyên.

## App QBK Studio
- App trên điện thoại: https://claude.ai/artifact/2J5Sxe49ijwPqjBbP3nccx (mã nguồn `studio/app/qbk-studio.html`). Người dùng giao chủ đề, duyệt, góp ý trong app. Cách đọc và ghi dữ liệu: mục "App QBK Studio" trong skill `lam-video`.

## Cấu trúc
- `studio/engine/`: engine hoạt hình (Node + @napi-rs/canvas + ffmpeg). `render.mjs`, `catalog.mjs`, `SCENE_FORMAT.md`. Lần đầu chạy `npm ci` trong thư mục này.
- `studio/tools/`: `tts.py` (Gemini TTS), `align.py` (căn phụ đề), `retime.py` (đổi tốc độ giọng), `analyze_ref.py` (phân tích mẫu), `cutout.py` (xóa nền ảnh ngoài), `satmap.py` + `satgrid.py` (ảnh vệ tinh Esri), `osrm.py` (tuyến đường, km, phút), `georef.py` (nắn ảnh quy hoạch khớp vệ tinh; skill `doi-chieu-ve-tinh`), `commons.py` (ảnh Wikimedia), `tiktok.py` (đọc link TikTok).
- `studio/references/`: thư viện mẫu tham khảo (thẻ kiến thức về phong cách). Người dùng gửi mẫu thì agent `nghien-cuu-mau` học theo skill `hoc-mau`.
- `studio/trends/`: báo cáo săn trend (agent `san-trend`).
- `studio/topics.md`: danh sách chủ đề. `studio/lessons.md`: bài học từ góp ý (mọi agent đọc trước khi làm).
- `projects/<slug>/`: mỗi video một thư mục (brief, script, sources, audio, scene.json, output, publish, checkpoint).
- `.claude/skills/directing-stickman-videos/`: skill gốc của bên thứ ba (MIT), dùng cho cách làm bằng ảnh AI. Có sửa nhỏ, xem UPSTREAM.md.

## Quy tắc
- Không bịa dữ kiện. Mọi khẳng định phải có trong `sources.md`.
- Miễn phí trước. Gọi dịch vụ trả phí chỉ khi người dùng đồng ý và đã báo chi phí.
- API key do proxy của môi trường tự gắn (Network secrets). Không hỏi, không dán key.
- Không tự đăng lên mạng xã hội.
- Commit và push lên nhánh làm việc sau mỗi mốc. Không commit `node_modules`.
