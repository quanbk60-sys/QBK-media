# QA final: Rùa và Thỏ (toàn phim)

- **File kiểm:** `output/final.mp4` (60,97 s), `output/final.srt`, `scene.json` (29 shot), `narration.txt`, `captions-audio.json`, `sources.md`
- **Khung đã xem:** 58 khung (đầu shot +0,12 s và giữa shot) từ 0,12 đến 60,29 s, ghép thành 12 tờ. Soát nhanh 0–20 s (đã duyệt), soát kỹ 20 s đến hết.

## Kết luận: **CẦN SỬA** (lỗi nhỏ, 2 chỗ, cùng một nguyên nhân)

## Bảng kiểm

| Hạng mục | Kết quả | Chi tiết | Giao cho |
|---|---|---|---|
| 1. Dữ kiện có nguồn | ĐẠT | Lời đọc không đổi so với bản đã duyệt. Xuất xứ "tương truyền của Ê-dốp" là "Đã xác nhận". Cốt truyện, bài học, chi tiết kể thêm là "Hư cấu". Không có số liệu, ngày tháng, trích dẫn. Chữ trên hình lặp lại lời đọc ("KIÊU = THUA" đã duyệt). | – |
| 2. Chính tả, phụ đề | ĐẠT | Ghép 48 cụm `captions-audio.json` (bỏ khoảng trắng) trùng `narration.txt`. `final.srt` có 48 cụm, cụm cuối 59,09–60,29 s. Dấu tiếng Việt đúng ở mọi chữ trên hình. | – |
| 3a. Vật đè phụ đề (y 1370–1470) | **LỖI** | **F1:** khoảng **30,8–31,5 s** (shot 14, bàn tay vẽ cây/gốc cây): tay và ống tay áo che chữ "một chút" của "Chợp mắt một chút đã." (khung 30,9 s). **F2:** khoảng **44,5–45,2 s** (shot 21, bàn tay vẽ cổng đích): ống tay che chữ "rồi!" của "Nhưng quá muộn rồi!" (khung 44,61 s). Cả hai đều do tay vẽ ở đáy khung, y khoảng 1400–1470. | dao-dien (dời vị trí vẽ lên cao hơn y 1350, hoặc `draw.hand:false` cho hai prop này) |
| 3b. Chữ tràn, đè nhân vật | ĐẠT | Chữ lớn đều trong khung. Chấm đuôi bóng nghĩ ở 11,9 s đã nằm trên đầu Thỏ (L2 vòng 1 đã sửa). | – |
| 3c. Nhân vật bị cắt, đúng trang phục | ĐẠT | Thỏ, Rùa, khán giả nhất quán. Thỏ bị cắt ở lề trái ở 43,3 s và 7,49 s chỉ là lúc đang chạy vào khung. | – |
| 3d. Đứng yên > 2,5 s | ĐẠT | Shot dài nhất 3,38 s (shot 3) và 3,34 s (shot 9), đều có thành phần xuất hiện/bụi/chữ đổi. Các shot 2,5–2,9 s có thay đổi giữa shot. | – |
| 3e. Hook 3 s | ĐẠT | "CHẬM RÌ" cỡ lớn hiện từ 0 s kèm tay vẽ, rồi Thỏ vào, chữ "NHANH". | – |
| 3f. Khớp hình–lời sau khi co 1,2x | ĐẠT | Đối chiếu mốc đổi shot với cụm phụ đề: lệch tối đa khoảng 0,3 s. Shot 15 (33,55 s, "KHÔNG DỪNG") vào sớm 0,25 s so với "Còn Rùa" (33,8 s). Shot 16 (34,83 s) trễ 0,3 s so với "Không chơi" (34,53 s). Chấp nhận được. | – |
| 4a. Âm lượng | ĐẠT | `volumedetect`: max −2,2 dB, mean −23,1 dB. Nằm trong −3…−0,5 dB. | – |
| 4b. Tiếng bút | Ngoại lệ có duyệt | Không có tiếng bút (`scribbleGain` 0) theo yêu cầu người dùng khi duyệt preview. Không tính lỗi. | – |
| 4c. Chất lượng giọng | Chưa kiểm được | Máy không nghe được ngữ điệu, phát âm. Người dùng cần nghe thử giọng 1,2x, nhất là "Ê-dốp" và các câu thoại. | long-tieng |
| 5. Kỹ thuật | ĐẠT | Giải mã không lỗi. 1080×1920, 30 fps, h264 + aac. Thời lượng 60,97 s (trong mục tiêu 60–90 s, dưới 3 phút), khớp lời đọc 60,29 s cộng đuôi. Có `final.srt`. | – |

## Ghi chú (không chặn)

- **G1:** Shot 18 (38,74 s): chữ Z của Thỏ ngủ chồng lên đầu Rùa khi Rùa đi qua. Thẩm mỹ. (dao-dien)
- **G2:** Cây ở mép phải shot 4 (7,49–9,07 s) bị cắt sát lề phải, vùng nút TikTok. Chỉ là phông. (dao-dien)
- **G3:** Từ 56,6 s (shot 27) khung hình "RÙA hay THỎ?" bố cục lệch trái, nửa phải trống tới gần cuối shot. Thẩm mỹ. (dao-dien)
- **G4:** Các ghi chú vòng 1 về bóng nghĩ thay bóng nói, khán giả là người que cho "khu rừng" vẫn còn, tùy đạo diễn. Nội dung chi tiết kể thêm ("ngoái lại", "reo hò"...) nên bổ sung vào dòng "Chi tiết thêm" của `sources.md` cho chặt. (bien-kich)

## Việc cần làm

| # | Bộ phận | Việc |
|---|---|---|
| F1 | dao-dien | Shot 14, 30,8–31,5 s: tay vẽ không đè phụ đề "một chút". |
| F2 | dao-dien | Shot 21, 44,5–45,2 s: tay vẽ không đè phụ đề "rồi!". |
| – | dung-phim | Render lại final và cập nhật contact sheet sau khi sửa. |
