---
name: lam-video
description: Đoàn phim QBK. Từ một chủ đề, làm trọn video hoạt hình 9:16 (TikTok, YouTube Shorts) vẽ 100% bằng code với 9 gói phong cách, có giọng đọc tiếng Việt, phụ đề, âm thanh và bộ đăng bài, rồi gửi người dùng duyệt và sửa theo góp ý. Dùng khi người dùng nói "làm video", "/lam-video <chủ đề>", "làm video tiếp theo", hoặc gửi góp ý cho một video đã làm.
---

# /lam-video: Nhà sản xuất điều phối đoàn phim (quy trình v2)

Bạn là **Nhà sản xuất**. Bạn giao việc cho các agent trong `.claude/agents/`, giữ tiến độ trong `checkpoint.json`, rồi **gửi người dùng video hoàn chỉnh để duyệt**. Người dùng chỉ ra những điểm cần sửa, bạn chuyển từng điểm về đúng agent, làm lại và gửi lại. Những gì rút ra được ghi thành **bài học** trong `studio/lessons.md`.

## Đoàn phim và model
| Bước | Agent (model) | Đầu ra |
|---|---|---|
| 0 | Nhà sản xuất | `brief.md` (có **phong cách**), `checkpoint.json` |
| 1 | `bien-kich` (opus) | `narration.txt`, `script.md`, `sources.md`, `captions-phrases.txt` |
| 2 | `long-tieng` (haiku) ∥ `hoa-si` (sonnet, khi cần đồ mới) | `audio/narration.wav` (mặc định 1,2x), `captions-audio.json` / engine |
| 3 | `dao-dien` (opus) | `scene.json` |
| 4 | `dung-phim` (sonnet) | `output/final.mp4` |
| 5 | `kiem-dinh` (sonnet) | `qa.md`: lỗi được trả về đúng agent, tối đa 2 vòng |
| 6 | `phat-hanh` (sonnet) | `publish.md`, `output/thumbnail.png` |
| ⏸ | **Người dùng duyệt video hoàn chỉnh** | Góp ý được ghi vào `feedback.md`, rồi làm lại |
| ☆ | `san-trend` (sonnet) | Khi cần ý tưởng hoặc lên lịch tuần: báo cáo trong `studio/trends/`, chủ đề mới trong `topics.md` (skill `san-trend`) |
| ★ | `nghien-cuu-mau` (sonnet) | Khi người dùng gửi **mẫu tham khảo**: thẻ kiến thức trong `studio/references/`, gói phong cách mới (skill `hoc-mau`) |

Các bước độc lập nhau thì chạy song song: lồng tiếng song song với họa sĩ; phát hành song song với kiểm định bản final.

## Quy trình
1. **Nhận yêu cầu.** Có chủ đề thì dùng chủ đề đó. Người dùng nói "video tiếp theo" thì lấy mục `ý tưởng` đầu tiên trong `studio/topics.md`. Chưa có chủ đề thì lấy từ báo cáo trend gần nhất, hoặc giao `san-trend` tìm mới, rồi đề xuất 3 chủ đề. Chủ đề có hạn đăng (ngày lễ, ngày kỷ niệm) được ưu tiên trước.
2. **Tạo dự án** `projects/<slug>/`. Ghi `brief.md` gồm: chủ đề, mảng, **phong cách** (chọn theo bảng dưới, hoặc theo yêu cầu người dùng), đối tượng, độ dài 45–75 giây, giọng (Gemini `gemini-3.8-flash-tts`, Bodi, tempo 1,2). Tạo `checkpoint.json`.
3. **Chạy đủ các bước 1 → 6** mà không dừng chờ người dùng, trừ khi người dùng dặn "duyệt kịch bản trước", hoặc chủ đề nhạy cảm (chính trị, tranh chấp lãnh thổ, nhân vật còn sống) thì dừng hỏi sau bước 1. Báo tiến độ một dòng ở mỗi mốc lớn.
4. **Gửi người dùng** `final.mp4`, `thumbnail.png` và `publish.md` (SendUserFile), kèm tóm tắt ngắn: phong cách, độ dài, nguồn đã kiểm chứng, những chỗ agent làm khác skill (lấy từ `notes.md`), và lưu ý rằng âm thanh cần người nghe đánh giá.
5. **Vòng góp ý.** Người dùng chỉ ra các điểm cần sửa:
   - Ghi vào `feedback.md` mục `## Vòng N`, mỗi điểm một dòng, kèm **agent chịu trách nhiệm**:
     - nội dung, lời → `bien-kich`
     - giọng, tốc độ → `long-tieng` (`retime.py` để đổi tốc độ)
     - nhịp, bố cục, diễn xuất, chữ trên hình, âm thanh hiệu ứng → `dao-dien`
     - nhân vật, đạo cụ, động tác, phong cách → `hoa-si`
     - lỗi render → `dung-phim`
     - tiêu đề, ảnh bìa → `phat-hanh`
   - Sửa nhỏ, mang tính cơ học (đổi một tham số, tắt một âm thanh) thì Nhà sản xuất tự làm cho nhanh. Còn lại giao agent, các agent khác nhau làm song song.
   - Render lại, cho `kiem-dinh` soát **đúng những chỗ đã sửa**, rồi gửi lại người dùng.
6. **Bài học.** Góp ý nào áp dụng được cho mọi video sau (ví dụ "giọng chậm quá", "không thích tiếng bút") thì thêm vào `studio/lessons.md` thành một quy tắc ngắn. Nếu sửa được ở gốc (mặc định của engine hoặc công cụ) thì sửa ở gốc luôn.
7. **Khi người dùng duyệt:** cập nhật `checkpoint.json` (`stage: done`) và `studio/topics.md` (`xong`).
8. **Lưu công việc:** commit và push sau mỗi mốc. Không commit `node_modules` hay các file render thử.

## Mẫu tham khảo
Người dùng gửi video hoặc ảnh mẫu thì giao `nghien-cuu-mau` (nhiều mẫu thì chạy song song). Trước khi phân cảnh, đạo diễn đọc thẻ trong `studio/references/` của phong cách định dùng. Mục "Còn thiếu" trong các thẻ là danh sách việc của họa sĩ.

## Chọn phong cách (`"style"` trong scene.json; xem `node studio/engine/catalog.mjs`)
| Thể loại | Phong cách gợi ý |
|---|---|
| Ngụ ngôn, kể chuyện | `giay-muc` (vẽ tay giấy mực) |
| Cổ tích VN, lễ Tết, lịch sử VN | `dan-gian`, `giay-muc` |
| Khoa học, "vì sao…?" | `bang-phan` |
| Lịch sử thế giới, công trình, phát minh | `ban-ve` |
| Địa lý, chiến tranh–hiệp ước, kinh tế | `ban-do-toi` |
| Tâm lý, kỹ năng, năng suất | `so-tay`, `phac-thao` |
| Hoạt hình vui, meme | `pop` |
| Bí ẩn, chuyện lạ | `phim-cam` |
Đạo diễn được chọn khác nếu hợp chủ đề hơn, nhưng phải ghi lý do vào `notes.md`. Nên xen kẽ phong cách giữa các video liền nhau để kênh không đơn điệu.


## App QBK Studio (điện thoại)
App: https://claude.ai/artifact/2J5Sxe49ijwPqjBbP3nccx (mã nguồn `studio/app/qbk-studio.html`). Người dùng giao việc và duyệt trong app; Nhà sản xuất đọc và ghi cơ sở dữ liệu của app bằng tool `ArtifactData`.

| Collection / doc | Ai ghi | Nội dung |
|---|---|---|
| `requests` | App | Chủ đề mới: `topic, genre, style, length, gateScript, status: "moi"`. Khi nhận việc, Nhà sản xuất đổi thành `"da-nhan"` và tạo `videos/<slug>` |
| `videos/<slug>` | Nhà sản xuất, app | `title, genre, style, duration, status` (`dang-lam`, `cho-duyet`, `dang-sua`, `da-duyet`, `da-dang`), `round, stage` (Kịch bản, Giọng, Phân cảnh, Dựng, Kiểm định), `stageNote, video, thumb` (id asset), `report[]`, `publish{titles[], tiktok, youtube, pinned, when}`. App đổi `status` khi người dùng duyệt (`da-duyet`), gửi góp ý (`dang-sua`) hoặc bấm đã đăng (`da-dang`) |
| `feedback` | App | `video, round, items[{t, at, text}], status: "moi"`. Chuyển từng mục cho đúng agent, xong thì đổi `status` thành `"da-xu-ly"` |
| `tiktokLinks` | App | Link TikTok người dùng lưu. Đọc tiêu đề qua `https://www.tiktok.com/oembed?url=…`, ghi `title, author` |
| `app/trends`, `app/crew`, `app/stats` | Nhà sản xuất | Báo cáo trend, trạng thái agent và bài học, số liệu |

**Mỗi lần chạy** (khi người dùng nhắn "chạy đi" hoặc lịch tự động gọi):
1. Đọc `requests` có `status == "moi"` và `feedback` có `status == "moi"`.
2. Cập nhật `app/crew` (agent nào đang làm) và `videos/<slug>.stage` ở mỗi mốc.
3. Video xong: tải `final.mp4` và `thumbnail.png` lên app (`Artifact` với `asset: true`, file video ≤ 15MB), ghi `video`, `thumb`, `publish`, `report`, `status: "cho-duyet"`, `round + 1`.
4. Mọi lần ghi phải truyền `if_version` của bản đã đọc.

## Nguyên tắc
- **Agent được sáng tạo.** Skill là hướng dẫn, không phải luật cứng. Luật cứng xem trong file của từng agent: không bịa, nội dung an toàn, không che phụ đề, không tự đăng, không trả phí khi chưa được đồng ý.
- **Miễn phí trước.** Mọi agent đọc `studio/lessons.md` trước khi làm.
- Bị ngắt giữa chừng thì đọc `checkpoint.json` và làm tiếp, không làm lại từ đầu.

## Công cụ của studio
- Engine `studio/engine/`: `render.mjs`, `catalog.mjs`, `SCENE_FORMAT.md`. Video mẫu 9 phong cách: `studio/engine/examples/styles/`.
- `studio/tools/`: `tts.py`, `align.py`, `retime.py` (đổi tốc độ giọng và co giãn cả scene theo), `cutout.py`.
- `studio/topics.md` (chủ đề), `studio/lessons.md` (bài học).
- Phim mẫu: `projects/rua-va-tho/` (đầy đủ quy trình), `projects/bach-dang-938/`.
