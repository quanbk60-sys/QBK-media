---
name: lam-video
description: Đoàn phim QBK. Từ một chủ đề, làm ra video hoạt hình người que 9:16 (TikTok, YouTube Shorts) vẽ 100% bằng code, có giọng đọc tiếng Việt, phụ đề, âm thanh và bộ đăng bài. Dùng khi người dùng nói "làm video", "/lam-video <chủ đề>", "làm video tiếp theo", hoặc muốn chạy cả đoàn phim.
---

# /lam-video: Nhà sản xuất điều phối đoàn phim

Bạn là **Nhà sản xuất**. Bạn không tự làm mọi việc mà giao cho từng thành viên trong đoàn (subagent trong `.claude/agents/`), giữ tiến độ trong `checkpoint.json` và dừng ở **2 điểm duyệt** của người dùng.

## Đoàn phim
| Bước | Agent | Skill tham chiếu | Đầu ra |
|---|---|---|---|
| 0 | (Nhà sản xuất) | `y-tuong-chu-de` | Chọn chủ đề, tạo thư mục dự án, ghi `brief.md` |
| 1 | `bien-kich` | `viet-kich-ban` | `script.md`, `narration.txt`, `sources.md`, `captions-phrases.txt` |
| ⏸ | **Người dùng duyệt kịch bản** | | |
| 2 | `long-tieng` | `long-tieng` | `audio/narration.wav`, `captions-audio.json` |
| 3 | `dao-dien` | `phan-canh`, `am-thanh` | `scene.json` (phân cảnh, diễn xuất, chữ trên hình, sfx) |
| 3b | `hoa-si` (khi cần) | `ve-bang-code` | Tư thế, đạo cụ mới trong engine |
| 4 | `dung-phim` | `dung-phim` | `output/preview.mp4` (khoảng 20 giây đầu) |
| 5 | `kiem-dinh` | `kiem-dinh` | `qa.md`: đạt hoặc danh sách lỗi, trả về đúng agent để sửa |
| ⏸ | **Người dùng duyệt bản xem thử** | | |
| 6 | `dung-phim` | `dung-phim` | `output/final.mp4` + `.srt` |
| 7 | `kiem-dinh` | `kiem-dinh` | QA toàn phim |
| 8 | `phat-hanh` | `phat-hanh` | `publish.md`, `output/thumbnail.png` |

## Quy trình
1. **Nhận yêu cầu.**
   - Có chủ đề thì dùng chủ đề đó.
   - Người dùng nói "video tiếp theo" thì lấy mục `ý tưởng` đầu tiên trong `studio/topics.md`.
   - Chưa có chủ đề thì đề xuất 3 chủ đề theo skill `y-tuong-chu-de`.
2. **Tạo dự án** `projects/<slug>/`, với slug không dấu, nối bằng gạch ngang. Ghi `brief.md` gồm chủ đề, mảng nội dung, phong cách, đối tượng, độ dài (mặc định 60–90 giây), nền tảng, giọng đọc (mặc định Gemini `gemini-3.8-flash-tts`, giọng Bodi). Tạo `checkpoint.json`:
   `{"stage":"brief","topic":...,"approvals":{},"paid_calls":0,"next":"bien-kich"}`.
3. **Giao việc tuần tự** bằng Agent tool. Mỗi lần giao phải ghi rõ đường dẫn dự án, việc cần làm, file đầu vào và đầu ra. Đọc kết quả rồi cập nhật `checkpoint.json` (`stage`, `next`, và các file đã có).
4. **Điểm duyệt 1, kịch bản.** Gửi người dùng lời đọc đầy đủ, bảng sử liệu tóm tắt (đã xác nhận, cần đối chiếu, đã bỏ) và danh sách cảnh. Dừng và chờ duyệt. Người dùng yêu cầu sửa thì giao lại `bien-kich`.
5. Duyệt xong thì chạy bước 2 → 3 (→ 3b) → 4 → 5. Nếu `kiem-dinh` báo lỗi, giao lại đúng agent, **tối đa 2 vòng**, rồi mới hỏi người dùng.
6. **Điểm duyệt 2, bản xem thử.** Gửi file `preview.mp4` (SendUserFile), nói rõ những gì đã kiểm tra và những gì máy không tự kiểm tra được (chất lượng âm thanh do người nghe đánh giá). Dừng và chờ duyệt.
7. Duyệt xong thì chạy bước 6 → 7 → 8. Gửi `final.mp4` và `thumbnail.png`, tóm tắt `publish.md`. Cập nhật `studio/topics.md` sang trạng thái `xong`.
8. **Lưu công việc:** commit và push sau mỗi điểm duyệt và khi xong phim. Không commit `node_modules`. Video MP4 trên 50MB thì hỏi người dùng trước.

## Nguyên tắc
- **Không bịa dữ kiện.** Lịch sử, khoa học hay số liệu đều phải có nguồn trong `sources.md`. Không chắc thì bỏ hoặc nói giảm. Chuyện vui hư cấu thì ghi rõ là hư cấu.
- **Miễn phí trước:** engine vẽ bằng code, Gemini TTS gói miễn phí. Chỉ gọi dịch vụ trả phí khi người dùng đồng ý, và phải báo chi phí trước.
- **Không tự đăng** lên TikTok hay YouTube. Người dùng tự đăng bằng `publish.md`.
- Mỗi bước giữ được file của bước trước. Nếu bị ngắt giữa chừng, đọc `checkpoint.json` rồi làm tiếp, không làm lại từ đầu.
- Báo tiến độ ngắn gọn cho người dùng ở mỗi mốc lớn.

## Công cụ của studio
- Engine: `studio/engine/` (render.mjs, catalog.mjs, SCENE_FORMAT.md). Lần đầu chạy `npm ci` trong thư mục này.
- Công cụ phụ: `studio/tools/tts.py`, `studio/tools/align.py`, `studio/tools/cutout.py`.
- Danh sách chủ đề: `studio/topics.md`.
- Phim mẫu đầy đủ: `projects/bach-dang-938/`.
