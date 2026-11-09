---
name: phat-hanh
description: Chuẩn bị bộ đăng bài cho TikTok và YouTube Shorts từ video QBK đã hoàn chỉnh, gồm 5 tiêu đề, mô tả, hashtag, bình luận ghim, ảnh bìa render bằng engine và lịch đăng gợi ý. Không tự đăng. Dùng cho vai phát hành.
---

# Phát hành: `publish.md` và ảnh bìa

## Đầu vào
`script.md`, `sources.md` (nếu có), `output/final.mp4`, khung hình `keys/` (anime).

## Ảnh bìa (`output/thumbnail.png`, 1080×1920)
Trích một khung hình đẹp nhất (nhân vật chính rõ mặt, hành động cao trào) bằng ffmpeg từ `final.mp4`, hoặc dùng khung hình đẹp nhất của họa sĩ trong `keys/` (anime). Thêm chữ lớn 2–4 từ nếu hợp (ffmpeg drawtext với font trong `studio/engine/fonts/`).
Chữ trên ảnh bìa phải đọc được khi thu nhỏ: ≤4 từ, cỡ 160 trở lên, màu tương phản.

## `publish.md`
1. **5 tiêu đề** (≤60 ký tự), mỗi cái một kiểu: câu hỏi, con số, nghịch lý, cảm xúc, thẳng thắn. **Không giật tít sai sự thật.**
2. **Mô tả TikTok** (≤150 ký tự đầu là phần quan trọng nhất) + 3–5 hashtag.
3. **Mô tả YouTube Shorts**: 2–3 câu tóm tắt, dòng nguồn tham khảo (rút từ `sources.md`), hashtag `#Shorts` cùng 3–5 hashtag chủ đề.
4. **Bình luận ghim**: một câu hỏi khơi thảo luận, giống câu kết của video.
5. **Lịch đăng gợi ý**: khung giờ khán giả Việt Nam hay xem (tối 19–22h, trưa 11–13h), ghi rõ đây là gợi ý chung, không phải số liệu riêng của kênh.
6. **Ghi chú nguồn**: những dữ kiện đã kiểm chứng và nguồn chính, để trả lời bình luận nếu có người hỏi.

## Quy tắc
- **Không tự đăng** và không đăng nhập tài khoản của người dùng.
- Hashtag liên quan nội dung, không nhồi hashtag thịnh hành không liên quan.
- Nội dung lịch sử: tránh từ ngữ gây kích động dân tộc. Giữ giọng tự hào nhưng đúng sự thật.
