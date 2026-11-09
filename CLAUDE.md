# QBK Media: xưởng video ngắn

Repo này là **đoàn phim thu nhỏ**, tổ chức như một xưởng phim thật (biên kịch, đạo diễn, chỉ đạo mỹ thuật, họa sĩ, quay phim, âm thanh, dựng, kiểm định...). Nó tạo video 9:16 cho TikTok và YouTube Shorts. **Không làm người thật**: nhân vật người vẽ kiểu anime. Không dùng người que.

## Bắt đầu
- Làm video: `/lam-video <chủ đề>`. Skill `.claude/skills/lam-video` (quy trình v3): **4 phong cách**, mỗi phong cách một **dây chuyền** chỉ gọi đúng các agent cần, có **cổng duyệt** (kịch bản, dự toán, animatic) trước các bước tốn tiền.
- Phong cách: `anime-dong` (Anime · hoạt hình động, clip Gemini Omni), `anime-tinh` (Anime · ảnh tĩnh, khung Gemini + chuyển động code), `ve-tinh` (Vệ tinh · địa lý), `thi-nghiem` (Thí nghiệm 3D · khoa học). Phong cách khác học sau qua `nghien-cuu-mau`.
- 12 agent trong `.claude/agents/`: bien-kich, du-toan, dao-dien, chi-dao-my-thuat, hoa-si, quay-phim, long-tieng, am-thanh, dung-phim, kiem-dinh, phat-hanh, nghien-cuu-mau.
- Đoàn phim làm **trọn video** rồi gửi người dùng duyệt; góp ý chuyển về đúng agent; bài học chung ghi `studio/lessons.md`.
- Agent được tự sáng tạo ngoài skill, ghi lý do vào `notes.md`. Luật cứng giữ nguyên.

## App QBK Studio
- App trên điện thoại: https://claude.ai/artifact/2J5Sxe49ijwPqjBbP3nccx (mã nguồn `studio/app/qbk-studio.html`). Người dùng giao chủ đề, duyệt, góp ý trong app. Cách đọc và ghi dữ liệu: mục "App QBK Studio" trong skill `lam-video`.

## Cấu trúc
- `studio/engine/`: engine hoạt hình (Node + @napi-rs/canvas + ffmpeg). `render.mjs`, `catalog.mjs`, `SCENE_FORMAT.md`. Lần đầu chạy `npm ci` trong thư mục này.
- `studio/tools/`: `tts.py` (Gemini TTS), `align.py` (căn phụ đề), `retime.py` (đổi tốc độ giọng), `analyze_ref.py` (phân tích mẫu), `cutout.py` (xóa nền ảnh ngoài), `satmap.py` + `satgrid.py` (ảnh vệ tinh Esri), `commons.py` (ảnh Wikimedia), `tiktok.py` (đọc link TikTok), `genimage.py` (ảnh Gemini có phí, trần trong `studio/budget.json`, sổ chi `studio/costs.jsonl`), `keyout.py` (xóa nền magenta), `genvideo.py` (video Gemini Omni, chỉ chạy trong trần dự toán đã duyệt), `estimate.py` (dự toán chi phí), `assemble.py` (ghép phim, animatic, phụ đề, hòa âm).
- `studio/ai-art/`: thư viện hình AI dùng lại cho nhiều video (tranh nền, vật thể đã xóa nền).
- `studio/references/`: thư viện mẫu tham khảo (thẻ kiến thức về phong cách). Người dùng gửi mẫu thì agent `nghien-cuu-mau` học theo skill `hoc-mau`.
- `studio/topics.md`: danh sách chủ đề. `studio/lessons.md`: bài học từ góp ý (mọi agent đọc trước khi làm).
- `projects/<slug>/`: mỗi video một thư mục (brief, script, sources, audio, scene.json, output, publish, checkpoint).
- `.claude/skills/directing-stickman-videos/`: skill gốc của bên thứ ba (MIT), dùng cho cách làm bằng ảnh AI. Có sửa nhỏ, xem UPSTREAM.md.

## Quy tắc
- **Trung thành với mẫu.** Làm đúng phong cách người dùng gửi. **Không dùng người que** trừ khi người dùng chọn đúng phong cách người que. **Không làm người thật** (ảnh, video người như thật, người dẫn như thật). Nhân vật người luôn **vẽ kiểu anime** (người dùng chốt 09/11/2026). Mẫu có người thật thì làm bản anime cùng bố cục, nhịp, không khí; mẫu là tranh AI thì dựng bằng ảnh AI Gemini (`studio/tools/genimage.py`, trong trần `studio/budget.json`) với nhân vật **do studio tự tạo**, code lo chuyển động. Phần nào công cụ hiện có không làm được (ví dụ khẩu hình mượt như video AI) thì làm bản gần nhất có thể và ghi rõ, hoặc đặt `status: "loi"` kèm phương án; **không bao giờ lặng lẽ đổi sang phong cách khác**.
- Không bịa dữ kiện. Mọi khẳng định phải có trong `sources.md`.
- Miễn phí trước. Gọi dịch vụ trả phí chỉ khi người dùng đồng ý và đã báo chi phí. Đã duyệt: ảnh Gemini qua `genimage.py` trong trần `studio/budget.json`; video Gemini Omni qua `genvideo.py` chỉ sau khi người dùng duyệt dự toán của phim (`video_projects` trong `studio/budget.json`).
- API key do proxy của môi trường tự gắn (Network secrets). Không hỏi, không dán key.
- Không tự đăng lên mạng xã hội.
- Commit và push lên nhánh làm việc sau mỗi mốc. Không commit `node_modules`.
