# Thư viện mẫu tham khảo QBK

Người dùng gửi video, ảnh hoặc link mẫu. Agent `nghien-cuu-mau` (skill `hoc-mau`) phân tích rồi lưu thành **kiến thức** để cả đoàn phim dùng.

## Cấu trúc
- `index.md`: bảng tất cả mẫu: phong cách, thể loại, trạng thái học (đã ghi nhận, đã đưa vào engine).
- `<slug>/card.md`: thẻ kiến thức (hình, chuyển động, âm thanh, engine đã có gì và còn thiếu gì, hợp thể loại nào, đề xuất).
- `<slug>/analysis.json`, `contact.png`, `frames/`: số đo và ảnh do `studio/tools/analyze_ref.py` tạo.

## Ai dùng
- **Đạo diễn:** đọc thẻ của phong cách định dùng trước khi phân cảnh (nhịp, bố cục, camera).
- **Họa sĩ:** làm các mục "Còn thiếu" để đưa phong cách vào engine.
- **Biên kịch:** học giọng kể và cấu trúc của mẫu.
- **Nhà sản xuất:** chọn phong cách theo thể loại dựa vào `index.md`.
