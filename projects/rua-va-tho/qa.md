# QA: Rùa và Thỏ, bản xem thử (vòng 1)

- **File kiểm:** `output/preview.mp4` (0–20 s của phim 73,03 s), `output/preview.srt`, `scene.json`, `narration.txt`, `captions-audio.json`, `sources.md`
- **Phạm vi:** nội dung, sử liệu và chính tả kiểm **toàn bộ** (narration, captions, mọi `text`/`label` trong 29 shot). Hình, âm thanh và kỹ thuật kiểm **20 giây đầu** (shot 0–7).
- **Khung đã xem:** 0.2, 0.9, 1.6, 1.85, 2.4, 3.6, 3.85, 3.95, 4.0, 4.6, 4.9, 5.9, 6.0, 6.2, 6.5, 6.8, 7.0, 8.0, 8.7, 9.0, 10.4, 11.9, 12.4, 13.4, 15.2, 15.6, 15.7, 15.8, 17.2, 18.5, 18.8, 19.9 s

## Kết luận: **CẦN SỬA**

Có 3 lỗi hình, đều nhỏ và sửa nhanh được. Nội dung, chính tả, âm lượng và thông số kỹ thuật đều ĐẠT.

## Bảng kiểm

| Hạng mục | Kết quả | Chi tiết | Giao cho |
|---|---|---|---|
| 1a. Lời đọc có nguồn | ĐẠT | Câu xuất xứ "tương truyền của Ê-dốp" khớp dòng "Đã xác nhận". Cốt truyện, bài học và các chi tiết kể thêm đều được ghi "Hư cấu". Không có số liệu, năm tháng hay trích dẫn nguyên văn. | bien-kich |
| 1b. Chữ trên hình không thêm dữ kiện | ĐẠT | Đã đọc 44 chuỗi `text`/`label`, tất cả lặp lại lời đọc. "KIÊU = THUA" người dùng đã duyệt (checkpoint `script_v1`). | bien-kich |
| 1c. Đúng thời đại | ĐẠT | Truyện ngụ ngôn không có bối cảnh lịch sử. Xem ghi chú G3 về khán giả. | – |
| 2a. Chính tả phụ đề và chữ trên hình | ĐẠT | Dấu tiếng Việt đúng. "Rùa", "Thỏ", "Ê-dốp" viết hoa nhất quán. Chữ hiển thị trong khung đúng dấu (ví dụ "CHẬM RÌ", "NHANH NHẤT", "THI CHẠY!"). | – |
| 2b. Phụ đề khớp narration | ĐẠT | Ghép 48 cụm của `captions-audio.json` (bỏ khác biệt khoảng trắng) thì trùng hoàn toàn với `narration.txt`. Các cụm nối liền, không hở. `preview.srt` đã cộng lead 0,15 s. | – |
| 3a. Không vật đè phụ đề | **LỖI** | **L1:** khoảng **5,9–6,6 s** (shot 3), bàn tay vẽ cây (`tree`, x 150, `draw.at` 1.2) nằm đè lên phụ đề "Đây là truyện ngụ ngôn". Thấy rõ ở khung 6.2 s và 6.5 s: tay và bút che chữ "Đây là truyện". | dao-dien |
| 3b. Chữ/vật không đè nhân vật | **LỖI** | **L2:** **12,9–15,6 s** (shot 5), các chấm đuôi bóng nghĩ "Chậm thế!" (`thought`, x 300, y 940, `dy` −330) rơi đúng lên tai và trán Thỏ, trông như đeo kính một mắt (khung 13.4 s). | dao-dien |
| 3c. Bố cục ổn định giữa các shot | **LỖI** | **L3:** đường đất nhảy ở hai lần cắt. Tại **3,87 s** (shot 1→2) đất từ y 1333 lên y 1293. Tại **15,64 s** (shot 5→6) đất từ y 1333 lên y 1242, trong khi bố cục hai shot gần như giống nhau. Nguyên nhân: keyframe camera đầu thiếu `x`/`y`, nên `sampleTrack` (`studio/engine/lib/math.mjs` dòng 18–20) lấy luôn `y` của keyframe sau (1000 và 1050) cho cả shot. Camera vì thế bị lệch từ khung đầu thay vì lia dần. Ví dụ camera trong `SCENE_FORMAT.md` dòng 123 cũng viết thiếu như vậy. | dao-dien (thêm `"x":540,"y":960` vào keyframe t=0 của shot 2 và 6). Báo hoa-si: engine nên mặc định x 540, y 960 cho keyframe thiếu, hoặc sửa ví dụ trong tài liệu. |
| 3d. Vùng an toàn | ĐẠT | Không có nội dung dưới y 1550. Chữ lớn đều nằm trong khung. Xem ghi chú G2. | – |
| 3e. Trang phục nhân vật | ĐẠT | Thỏ (tai thỏ, đai đỏ chéo) và Rùa (mai, băng đô xanh) giống nhau ở mọi khung. | – |
| 3f. Không đứng yên quá 2,5 s | ĐẠT | Shot dài nhất là shot 3 (4,06 s), có các thành phần xuất hiện so le ở t 0.9, 1.2, 1.9, 2.6, 2.8 và mây trôi. Shot 4, 5, 6 có đổi tư thế hoặc zoom trong mỗi khoảng 1,2 s. | – |
| 3g. Hook 3 s | ĐẠT | "CHẬM RÌ" cỡ 230 hiện từ 0 s, có tay vẽ Rùa và zoom. Từ 1,7 s Thỏ lao vào kèm mũi tên và chữ "NHANH NHƯ GIÓ". | – |
| 4a. Âm lượng | ĐẠT | `volumedetect` của preview: max −1,1 dB, mean −22,0 dB (nằm trong −3 đến −0,5 dB). Giọng gốc max −2,2 dB. | – |
| 4b. SFX và tiếng bút | ĐẠT (cần nghe) | Engine tự thêm tiếng bút khi có `draw` (render.mjs dòng 27–32). Hai tiếng pop rơi sát chữ quan trọng: 6,73 s ngay đầu "Rùa và Thỏ" và 17,01 s ngay đầu câu thoại "Vậy ta thi chạy nhé!". Âm lượng thấp (0,45), nhưng cần người nghe xác nhận chữ không bị lấp. | dung-phim (nếu nghe thấy lấp) |
| 4c. Chất lượng giọng | Chưa kiểm được | Máy không nghe được ngữ điệu và cách phát âm. **Người dùng cần nghe thử**, nhất là "Ê-dốp" và hai câu thoại. | long-tieng |
| 5a. Giải mã, thông số | ĐẠT | Giải mã toàn bộ không lỗi. 1080×1920, 30 fps, h264 + aac (44,1 kHz mono). | – |
| 5b. Thời lượng | ĐẠT | Preview 20,000 s. Phim đủ dài 73,03 s, khớp giọng 72,48 s + lead 0,15 s, nằm trong mục tiêu 60–90 s. Các shot nối liền, không hở. | – |
| 5c. File `.srt` | ĐẠT | Có `output/preview.srt` (15 cụm). Bản phim cuối cần có `.srt` đầy đủ. | dung-phim (bản cuối) |

## Ghi chú (không chặn duyệt)

- **G1:** Lời đọc là "Thỏ cười Rùa: ...", tức Thỏ nói thành tiếng, nhưng hình dùng bóng **nghĩ** (`thought`). Catalog chưa có bóng **nói**. Có thể giữ nguyên, hoặc nhờ hoa-si thêm prop `speech`. (dao-dien / hoa-si)
- **G2:** Khung 19,9 s: khán giả `khan1` (x 70) bị cắt ở lề trái, `khan3` và `khan4` (x 870–960) sát lề phải, nằm trong vùng nút bấm TikTok. Đây là vai phụ nên chấp nhận được, nhưng nên dịch vào trong khoảng 40–60 px. (dao-dien)
- **G3:** Lời đọc nói "Cả khu rừng kéo đến xem", nhưng khán giả là người que đội mũ lưỡi trai và nón lá, không phải con vật. Không sai sử liệu, chỉ hơi lệch ý. Tùy đạo diễn. (dao-dien)
- **G4:** Shot 3: tán cây (x 150) bị cuộn giấy che mất nửa bên phải. Các đường kẻ trên cuộn giấy cắt qua chân chữ "ngụ ngôn" (khung 8,0 s). Chỉ là chi tiết thẩm mỹ. (dao-dien)
- **G5:** Một số chi tiết kể thêm như "ngoái lại", "nửa đường", "bụi bay mù mịt", "reo hò", "qua đồi, qua cỏ" không được liệt kê từng cái trong dòng "Chi tiết thêm" của `sources.md`. Chúng vẫn nằm trong cốt truyện đã ghi "Hư cấu", nên không tính là lỗi. Nếu muốn chặt chẽ thì biên kịch bổ sung vào danh sách. (bien-kich)

## Việc cần làm (vòng sửa 1/2)

| # | Bộ phận | Việc |
|---|---|---|
| L1 | dao-dien | Shot 3: dời thời điểm hoặc vị trí vẽ cây, hoặc đặt `tree.draw.hand: false`, để tay không đè phụ đề y 1370–1470 trong khoảng 5,9–6,6 s. |
| L2 | dao-dien | Shot 5: đặt điểm neo `thought` cao hơn đầu Thỏ (ví dụ y khoảng 820, `dy` khoảng −220) để chấm đuôi không nằm trên mặt hay tai. |
| L3 | dao-dien (hoa-si nếu sửa engine) | Thêm `"x":540,"y":960` vào keyframe camera t=0 của shot 2 và shot 6. Hoặc hoa-si cho `sampleTrack` của camera dùng mặc định tâm khung. |
