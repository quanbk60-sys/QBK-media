# Bản tin vẽ tay (mẫu TikTok @aibeat.thucchien, người dùng gửi trong chat 16/11/2026)

- Mẫu: bản tin công nghệ 146,1 s, 576×1024, 30 fps, kênh "AI Beat - Tin AI thực chiến". Ảnh khung: `contact.png`. So sánh với bản QBK: `so-sanh.png` (hàng trên là mẫu, hàng dưới là QBK).
- Phong cách engine: **`ban-tin`** (`lib/styles.mjs`, phần tử trong `lib/news.mjs`, icon nét trong `lib/news-props.mjs`). Phim demo: `projects/_demo-ban-tin/`.
- Số đo thô: `analysis.json` (màu, độ sáng, âm), `timeline-frames.json` (mốc đổi tiêu đề, đổi dòng phụ đề, từng yếu tố hình mới, đo theo từng khung 33 ms), `audio-structure-gemini.json` (giọng, nhạc, cấu trúc, lời thoại có mốc; Gemini nghe video; mốc hiệu ứng sau 146 s là sai, bỏ qua).
- **Chỉ học phong cách.** Nội dung mẫu (tin Jensen Huang rời Nvidia) chưa kiểm chứng; không dùng lại nội dung, ảnh hay câu chữ của mẫu.

## Số đo (khung 1080×1920, đổi từ 576×1024 theo hệ số 1,875)
| Thành phần | Số đo |
|---|---|
| Nền | giấy kem `#F1EDE3`, giữa sáng hơn (`#F5F1E9`), mép `#EFE9E0`; không hoa văn; độ sáng 0,86, độ rực màu 0,06 |
| Mực | `#1C1C1E`; nét icon khoảng 6 px, hơi run, không "sôi" (đứng yên sau khi vẽ xong) |
| Màu nhấn | đỏ cam `#FC5636` (con số, mũi tên giảm, con dấu, huy hiệu), xanh `#2464EC` (vi mạch, trục thời gian, bóng thoại); tô nhạt đỏ khoảng 20%, xanh khoảng 16% |
| Vạch tiến độ | trên cùng, cao 8 px, rãnh `#E4DED5` suốt chiều ngang; phần chạy là dải màu cố định đỏ `#FF6946` → tím → xanh `#3F73F5`, **tuyến tính theo thời gian** (3,94 px/s ở 576, khớp đúng 146 s) |
| Tiêu đề cảnh | góc trên trái, x ≈ 100, y ≈ 282; font viết tay (Patrick Hand) khoảng 57 px, mực; **gõ từng chữ** khoảng 30–35 ký tự/giây; dòng "Nguồn: … · ngày" xám `#8C867D` cỡ khoảng 22 px hiện sau 230 ms |
| Vùng nội dung | y 345–1210, rộng tới 90% khung; mỗi cảnh 2–5 yếu tố |
| Phụ đề | tâm y ≈ 1340; font tròn đậm viết tay (gần nhất: **Mali Bold**) khoảng 46 px; chữ mực `#232326`, viền giấy 7 px và bóng đổ (2, 3); **karaoke từng ký tự**: phần đã đọc chuyển đỏ `#F0553A` từ trái sang phải; mỗi dòng 3–7 từ, rộng ≤ 700 px |
| Âm thanh | giọng nam AI, khoảng 211 âm tiết/phút, nghỉ 150–350 ms giữa câu; nhạc nền lo-fi rất nhỏ (khoảng -40 dB lúc ngừng nói); tổng khoảng -17,5 dB; có pop, đóng dấu, whoosh khi yếu tố hiện |

## Nhịp (từ `timeline-frames.json`)
- **31 lần đổi tiêu đề trong 146 s**, cảnh trung bình **4,7 s** (trung vị 4,5 s). Đổi cảnh là **cắt cứng trong 1 khung (33 ms)**, cảnh mới bắt đầu từ giấy trống.
- **111 lần đổi dòng phụ đề**, mỗi dòng trung bình **1,30 s**.
- **91 yếu tố hình mới**; khoảng cách giữa hai yếu tố: trung vị 1,0 s, 25% dưới 0,4 s. Thời gian xuất hiện: trung vị 167 ms; ảnh và thẻ bật ra (phóng 0,82 → 1, mờ → rõ) trong **200–250 ms**; icon nét **vẽ dần 0,5–1,5 s**; chữ gõ dần; con số **nhảy ngẫu nhiên rồi dừng** (khoảng 0,6–1,2 s).
- Mở đầu: khung 0 trống, tiêu đề hiện trong 100 ms, thẻ logo bật lên trong 200 ms, ảnh thứ nhất trượt lên từ dưới thẻ, dòng nguồn hiện ở 233 ms. Từ 1,0 đến 4,6 s lần lượt: con dấu đỏ đập xuống, ảnh thứ hai, bóng thoại, huy hiệu "CEO?", mũi tên đứt nét.
- Cấu trúc: hook 0–15 s (tin + câu hỏi) → bối cảnh 15–65 s → diễn biến 65–93 s → phản ứng 93–111 s → phân tích 111–127 s → kết 127–137 s → CTA 137–146 s (hai hộp câu hỏi đánh số).

## Ngữ pháp hình
- Thẻ ảnh polaroid viền trắng, băng keo vàng trong ở mép trên, chữ viết tay dưới ảnh, xoay nhẹ ±3°, bóng mềm.
- Thẻ chụp màn hình (bài báo, tweet, Wikipedia) viền mực mảnh, một cụm chữ được **gạch chân đỏ** sau khi thẻ hiện.
- Con dấu đỏ chữ in hoa trong khung, xoay khoảng -18°; huy hiệu tròn đỏ chữ trắng; bóng thoại viền xanh, chữ xanh.
- Icon nét: biểu đồ đường có đoạn cuối đỏ cắm xuống kèm mũi tên, vòng phần trăm, vi mạch xanh, nhóm người, trục thời gian xanh có cờ đỏ, tòa nhà cột, ngọn lửa, hộp tiền, dấu tích, biển chỉ đường, dấu hỏi.
- Hộp số liệu tô đỏ nhạt viền đỏ: số to + dòng giải thích nhỏ.
- Không có camera lia hay zoom: khung tĩnh như trang sổ.

## Đã có trong engine (`ban-tin`)
- Nền giấy, vạch tiến độ, phụ đề karaoke Mali Bold, cắt cứng, nét `sketch` vẽ dần không hiện bàn tay.
- Phần tử: `headline`, `card` (ảnh hoặc thẻ chữ có gạch chân), `stamp`, `badge`, `bubble`, `counter`, `label` (gõ chữ, gạch chân), `box`, `qbox`. Ghép được với `clip` (video thật), `photo`/`image`.
- Icon: `chip`, `people`, `lineChart` (`value`, `note`), `barChart`, `donut`, `timeline`, `bank`, `chatWindow`, `calendar`, `check`, `arrowCurve`, `flame`, `laptop`, `money`, `scribbleCircle`, `underline`, `qmark`, `signpost`, `rocket`.

## Còn thiếu
- Chụp màn hình thật của bài báo, tweet (mẫu dùng rất nhiều). QBK không làm giả ảnh chụp: dùng thẻ chữ ghi rõ "(tóm tắt)" kèm nguồn, hoặc ảnh chụp thật nếu có quyền dùng.
- Font phụ đề của mẫu chưa xác định được chính xác; Mali Bold là bản gần nhất trong các font miễn phí.
- Hiệu ứng âm "đóng dấu" riêng (đang dùng `pop` to hơn).
- Logo công ty (mẫu dùng logo NVIDIA): nhãn hiệu, QBK không dùng.

## Hợp với
Tin tức, công nghệ, kinh tế, giải thích sự kiện, tiểu sử doanh nhân, "chuyện gì vừa xảy ra". Video 60–150 s, cảnh 4–5 s.

## Lưu ý
- Mọi con số trên hình phải có trong `sources.md`; ghi dòng nguồn ở `headline.source` mỗi cảnh, như mẫu.
- Không vẽ biểu đồ với số liệu bịa: chỉ vẽ dạng minh họa khi không có số, hoặc đúng tỉ lệ số thật (xem cảnh so sánh 2 tháng, 9 tháng, 2,5 năm trong demo).
- Tin nóng chưa kiểm chứng (như chính mẫu này) không làm.
