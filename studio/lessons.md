# Bài học của đoàn phim QBK

Mọi agent **đọc file này trước khi làm việc**. Nhà sản xuất thêm bài học mới sau mỗi vòng góp ý của người dùng. Mỗi dòng là một quy tắc ngắn, ghi kèm nguồn.

## Giọng đọc
- Giọng Gemini Bodi ở tốc độ gốc **quá chậm**. Mặc định tăng tốc **1,2 lần** bằng `studio/tools/retime.py` (giữ cao độ). *(Rùa và Thỏ, góp ý của người dùng)*

## Âm thanh
- **Không dùng tiếng bút sột soạt** khi bàn tay vẽ (engine đã mặc định `scribbleGain: 0`). *(Rùa và Thỏ)*
- Tiếng `pop` không được đặt trùng đầu câu thoại quan trọng. Đặt sớm hơn khoảng 0,15 giây. *(QA Rùa và Thỏ)*

## Hình ảnh
- Bàn tay vẽ không được che phụ đề. Engine tự lật bàn tay khi vẽ ở thấp, nhưng đạo diễn vẫn nên tránh vẽ trong vùng y 1100–1470. *(QA Rùa và Thỏ)*
- Keyframe camera đầu tiên phải ghi rõ `x`, `y`. *(QA Rùa và Thỏ)*
- Đuôi bóng nghĩ hoặc bóng nói không được chạm mặt nhân vật. Đặt bóng cao và lệch hẳn khỏi đầu. *(QA Rùa và Thỏ)*
- Nhân vật và khán giả cách lề tối thiểu 40px. *(QA Rùa và Thỏ)*

## Nội dung
- Truyện ngụ ngôn: đọc tên tác giả theo phiên âm tiếng Việt (Ê-dốp), nói "tương truyền", không khẳng định. *(Rùa và Thỏ)*

## Phong cách vệ tinh (`ve-tinh`)
- Người dùng chọn "Vệ tinh · ảnh thật" trong app thì **không vẽ người que**. Dùng ảnh vệ tinh Esri (`studio/tools/satmap.py`) và ảnh thật Wikimedia (`studio/tools/commons.py`). Làm theo `studio/references/ve-tinh-anh-that/card.md`, mẫu `projects/bach-dang-ve-tinh/build_scene.py`. *(Người dùng, 09/11/2026)*
- Đường sông, đường tiến quân, ghim phải **dò lại trên ảnh vệ tinh** (`satgrid.py`, chồng đường lên ảnh z14) trước khi render. Bản đầu Bạch Đằng vẽ đường cắt ngang đất liền. *(Bạch Đằng ve-tinh)*
- Ảnh thật chỉ dùng khi rõ tác giả và giấy phép (CC0, PD, CC BY, CC BY-SA), ghi ngay dưới ảnh và trong publish.md. API Commons hay báo 429 thì tra trang File: bằng tìm kiếm web, tải ảnh từ upload.wikimedia.org. *(Bạch Đằng ve-tinh)*
- Vị trí không có nguồn chính xác (bãi cọc, hướng tiến quân) thì ghi "minh họa" hoặc "gần đúng" trên hình. *(Bạch Đằng ve-tinh)*
- Bản đăng: nén lại khoảng 1,65 Mbps và chuẩn hóa âm lượng về −14 LUFS (ảnh vệ tinh làm file gốc nặng 70MB). Không commit file gốc. *(Bạch Đằng ve-tinh)*
- Mô tả đăng bài không được nói quá kịch bản (ví dụ "cả ba trận đều dùng cọc" là sai). *(Bạch Đằng ve-tinh)*

## Phong cách phải khác nhau thật (người dùng, 09/11/2026)
- "Các phong cách giống hệt nhau, chỉ khác nền" là lỗi. Mỗi phong cách có ngữ pháp riêng (nét, cách tô, cách hiện hình, chuyển cảnh, phụ đề), xem SCENE_FORMAT.md, mục "Ngữ pháp phong cách". Đạo diễn còn phải đổi cả bố cục và nhịp cho hợp phong cách.
- Học từ mẫu 3D thực tế thì dựng bằng `studio/engine3d/`, không thay bằng nét vẽ trên giấy. Video làm đá bản nét vẽ đã bị người dùng chê "khác hoàn toàn mẫu".

## Vận hành
- **Tiết kiệm hạn mức:** dựng video ở session mới (do app gọi), không trong chat dài. Biên kịch dùng Sonnet (Opus chỉ cho chủ đề nhạy cảm), đạo diễn kiêm dựng phim, kiểm định nhẹ, họa sĩ chỉ khi thiếu đồ. *(Người dùng, 08/11/2026)*

- **Cảnh chuyển động tới trước (đạp xe, đi bộ, bay):** mọi chi tiết trên mặt đất phải trôi theo phối cảnh. Không để lớp nền có họa tiết đứng yên dưới vật đang chạy, nếu không vật trông như trượt trên nền (góp ý phong cách phong-canh-3d, 09/11/2026). Vật mọc trên đất cần bóng dưới gốc.
- **Nhân vật ảnh AI phải cử động đúng việc đang làm** (góp ý 09/11/2026: người đạp xe mà chân đứng yên). Ảnh AI là ảnh tĩnh: tách lớp (thân trên, xe) và vẽ phần chuyển động bằng code ở giữa (chân đạp, tay vẫy), cùng màu với ảnh. Xem `drawLegs` trong `studio/engine3d/phong-canh.mjs`, lớp `cyclist-top.png`, `cyclist-bike.png`.
- **Không đổi phong cách của mẫu sang người que** (09/11/2026: mẫu "Người thật" là người thật nói chuyện, một phiên đã thay bằng người que, người dùng rất không hài lòng). Mẫu người thật hoặc ảnh AI thì dựng bằng ảnh AI Gemini với nhân vật studio tự tạo, code lo chuyển động. Làm không đủ thì nói rõ, không lặng lẽ thay phong cách.
- **Kênh không làm người thật** (người dùng chốt 09/11/2026). Nhân vật người luôn vẽ kiểu anime, kể cả khi mẫu là người thật. Phong cách người dẫn như thật đã gỡ.
