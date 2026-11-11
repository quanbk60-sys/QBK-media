# QBK Media: xưởng video ngắn

Repo này là **đoàn phim thu nhỏ**, tổ chức như một xưởng phim thật (biên kịch, đạo diễn, chỉ đạo mỹ thuật, họa sĩ, quay phim, âm thanh, dựng, kiểm định...). Nó tạo video 9:16 cho TikTok và YouTube Shorts. **Không làm người thật**: nhân vật người vẽ kiểu anime. Không dùng người que.

## Bắt đầu
- Làm video: `/lam-video <chủ đề>`. Skill `.claude/skills/lam-video` (quy trình v3): **4 phong cách**, mỗi phong cách một **dây chuyền** chỉ gọi đúng các agent cần, có **cổng duyệt** (kịch bản, dự toán, animatic) trước các bước tốn tiền.
- Phong cách: `storyboard` (Storyboard · ảnh của bạn: người dùng tự tạo ảnh từng cảnh bên Gemini, gửi qua app, đoàn phim chỉ dựng; `anime-tinh`, `giay-gap` cũng làm theo cách này), `ve-tinh` (Vệ tinh · địa lý), `thi-nghiem` (Thí nghiệm 3D · khoa học), `bds` (Giới thiệu bất động sản: ảnh thật dự án, cảnh quay cầm tay, `studio/tools/bds_build.py`), `bds-tien-ich` (BĐS · bản đồ tiện ích). Video BĐS theo skill `video-bds`. Phong cách khác học sau qua `nghien-cuu-mau`.
- 9 agent trong `.claude/agents/`: bien-kich, du-toan, dao-dien, long-tieng, am-thanh, dung-phim, kiem-dinh, phat-hanh, nghien-cuu-mau.
- **Tiết kiệm token:** Nhà sản xuất chỉ điều phối; mỗi bước, mỗi nhóm cảnh, mỗi video giao một session con (agent hoặc session mới); agent báo cáo tối đa 8 dòng; trạng thái nằm trong file và app, không nằm trong chat.
- Đoàn phim làm **trọn video** rồi gửi người dùng duyệt; góp ý chuyển về đúng agent; bài học chung ghi `studio/lessons.md`.
- Agent được tự sáng tạo ngoài skill, ghi lý do vào `notes.md`. Luật cứng giữ nguyên.

## App QBK Studio
- App trên điện thoại: https://claude.ai/artifact/2J5Sxe49ijwPqjBbP3nccx (mã nguồn `studio/app/qbk-studio.html`). Người dùng giao chủ đề, duyệt, góp ý trong app. Cách đọc và ghi dữ liệu: mục "App QBK Studio" trong skill `lam-video`.

## Cấu trúc
- `studio/engine/`: engine 2D (Node + @napi-rs/canvas + ffmpeg) dùng cho phong cách vệ tinh: `render.mjs`, `lib/geo.mjs`, `SCENE_FORMAT.md`. `studio/engine3d/`: thí nghiệm 3D (`render3d.mjs`) và cảnh anime có nhân vật đi (`phong-canh.mjs`). Lần đầu chạy `npm ci` trong hai thư mục này.
- `studio/tools/`: `tts.py` (Gemini TTS), `align.py` (căn phụ đề), `retime.py` (đổi tốc độ giọng), `analyze_ref.py` (phân tích mẫu), `cutout.py` (xóa nền ảnh ngoài), `satmap.py` + `satgrid.py` (ảnh vệ tinh Esri), `osrm.py` (tuyến đường, km, phút), `georef.py` (nắn ảnh quy hoạch khớp vệ tinh; skill `doi-chieu-ve-tinh`), `bds_build.py` (dựng video `bds` từ `bds.json`), `camwalk.py` (cảnh quay cầm tay từ ảnh), `music.py` (nhạc nền tự sáng tác), `commons.py` (ảnh Wikimedia), `tiktok.py` (đọc link TikTok), `genimage.py` (ảnh Gemini có phí, trần trong `studio/budget.json`, sổ chi `studio/costs.jsonl`), `keyout.py` (xóa nền magenta), `genvideo.py` (video Gemini Omni, chỉ chạy trong trần dự toán đã duyệt), `estimate.py` (dự toán chi phí), `assemble.py` (ghép phim, animatic, phụ đề, hòa âm), `renditions.py` (bản tải về Cao/Vừa/Nhẹ cho app).
- `studio/ai-art/`: thư viện hình AI dùng lại cho nhiều video (tranh nền, vật thể đã xóa nền).
- `studio/references/`: thư viện mẫu tham khảo (thẻ kiến thức về phong cách). Người dùng gửi mẫu thì agent `nghien-cuu-mau` học theo skill `hoc-mau`.
- `studio/topics.md`: danh sách chủ đề. `studio/lessons.md`: bài học từ góp ý (mọi agent đọc trước khi làm).
- `projects/<slug>/`: mỗi video một thư mục (brief, script, sources, audio, scene.json, output, publish, checkpoint).

## Quy tắc
- **Trung thành với mẫu.** Làm đúng phong cách người dùng gửi. **Không dùng người que.** **Không làm người thật** (ảnh, video người như thật, người dẫn như thật). Nhân vật người luôn **vẽ kiểu anime** (người dùng chốt 09/11/2026). Mẫu có người thật thì làm bản anime cùng bố cục, nhịp, không khí; mẫu là tranh AI thì dựng bằng ảnh AI Gemini (`studio/tools/genimage.py`, trong trần `studio/budget.json`) với nhân vật **do studio tự tạo**, code lo chuyển động. Phần nào công cụ hiện có không làm được (ví dụ khẩu hình mượt như video AI) thì làm bản gần nhất có thể và ghi rõ, hoặc đặt `status: "loi"` kèm phương án; **không bao giờ lặng lẽ đổi sang phong cách khác**.
- Không bịa dữ kiện. Mọi khẳng định phải có trong `sources.md`.
- Miễn phí trước. Gọi dịch vụ trả phí chỉ khi người dùng đồng ý và đã báo chi phí. **Không gọi API Gemini tạo ảnh hay video** (người dùng chốt 11/11/2026; `genimage.py`, `genvideo.py` đã tắt; agent họa sĩ, chỉ đạo mỹ thuật, quay phim đã bỏ). Ảnh do người dùng tự tạo và gửi qua mục "Ảnh storyboard" của app.
- API key do proxy của môi trường tự gắn (Network secrets). Không hỏi, không dán key.
- Không tự đăng lên mạng xã hội.
- Commit và push lên nhánh làm việc sau mỗi mốc. Không commit `node_modules`.
