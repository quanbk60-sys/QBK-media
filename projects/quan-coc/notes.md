# Ghi chú làm phim: Quán Cóc

- Dựng ngay trong chat chính, không qua session mới của app: ảnh người dùng gửi chỉ có trong session này, và người dùng đã duyệt kế hoạch ở đây.
- Nhà sản xuất làm trọn các khâu (kịch bản, giọng, phân cảnh, dựng, kiểm định nhẹ) để tiết kiệm, vì video ngắn và dữ kiện ít.
- Phần 2 cần "phong cách khác", nhưng scene chỉ có một `style`. Em giữ `ve-tinh` (để phụ đề chữ đen viền dày đọc rõ trên nền màu) và thêm 4 phần tử mới vào `lib/geo.mjs`: `backdrop` (nền màu có tia, sọc, chấm; vào bằng `wipe`), `sticker` (hộp, bầu dục, nổ sao; lắc), `coupon` (phiếu quà), `confetti`. `photo` có thêm `frameColor` và `slide`. Màu lấy theo bảng hiệu: vàng Habeco, đỏ, xanh lá bảng Cóc.
- Giọng: thêm `--style` vào `tts.py` (câu chỉ dẫn cách nói đặt trước lời đọc). Dùng Puck với chỉ dẫn "trẻ, miền Tây, như rủ bạn đi ăn, không phải phát thanh viên". Đã chép lại bằng Gemini để soát: không đọc câu chỉ dẫn, đọc đúng "Cóc", "mười sáu", "tô nghêu".
- Tempo 1,1 thay vì 1,2: bản gốc có chỉ dẫn đã nhanh sẵn (46 giây).
- Luật rượu bia: đổi "đi nhậu" thành "lai rai"; mỗi cảnh phần 2 có dòng cảnh báo nhỏ ở đáy; màn kết có ô "Đã uống rượu bia không lái xe" và câu đọc "có uống thì đừng lái xe".
- Chiều quán "bên tay phải" suy ra từ ảnh người dùng (đứng ở quán nhìn về đèn đường Hòa Bình thì quán bên trái).
