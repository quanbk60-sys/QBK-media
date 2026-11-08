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

## Vận hành
- **Tiết kiệm hạn mức:** dựng video ở session mới (do app gọi), không trong chat dài. Biên kịch dùng Sonnet (Opus chỉ cho chủ đề nhạy cảm), đạo diễn kiêm dựng phim, kiểm định nhẹ, họa sĩ chỉ khi thiếu đồ. *(Người dùng, 08/11/2026)*
