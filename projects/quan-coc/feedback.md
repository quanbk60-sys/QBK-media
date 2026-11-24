# Góp ý: Quán Cóc

## Vòng 1 (24/11/2026)
- "Xẹt xẹt khó chịu quá" → âm thanh (Nhà sản xuất): bỏ hết sfx tổng hợp từ tiếng ồn (whoosh, cheer, crack); chỉ giữ pop, chime, một tiếng drum; thêm nhạc nền tự tổng hợp không có tiếng ồn (`make_music.py`).
- "Đổi giọng hay hơn, trẻ trung, năng động" → lồng tiếng: thu thử Laomedeia, Fenrir, Zephyr với chỉ dẫn "Gen Z food reviewer"; chọn Laomedeia (giọng nữ), tempo 1,05.
- Tư liệu mới (7 ảnh món nền xám, 3 video) → đạo diễn: ảnh tách nền viền trắng kiểu sticker bay vào nền màu; video ban ngày cho câu "Tới rồi đó!", video đêm cho câu giới thiệu quán, video khách ngồi quán đêm mưa cho câu "Rủ cạ cứng".

## Vòng 2 (24/11/2026)
- "Mấy cái giới thiệu món ăn thì làm lại" → đạo diễn: bỏ kiểu sticker tách nền bay nhảy; mỗi món một ảnh toàn khung (nền xám studio người dùng gửi), zoom chậm, tên món chữ lớn trắng + dòng phụ vàng ở khoảng trống phía trên.
- "Khoai cao chiên nước mắm" → biên kịch + đạo diễn: đổi tên món (trước ghi khoai môn chiên).
- "Bỏ phần uống không lái xe" → bỏ câu đọc và ô trên màn kết; dòng nhỏ chỉ còn "Người dưới 18 tuổi không sử dụng rượu bia".
- "Bỏ nhãn tới rồi đó" → bỏ sticker trên video.
- "Giọng chậm lại xíu, đọc tự nhiên hơn" → lồng tiếng: thu lại Laomedeia với chỉ dẫn "trò chuyện với bạn, thư thả, không phải MC", không tăng tốc, rút khoảng lặng dài hơn 0,5 s. Lời bớt dấu chấm than, "tin nóng" thành "có tin vui".

## Vòng 3 (24/11/2026)
- "Bỏ luôn dòng dưới 18 tuổi" → bỏ hẳn mọi dòng cảnh báo trên video (theo yêu cầu người dùng; Nhà sản xuất đã báo luật quảng cáo bia yêu cầu cảnh báo, người dùng tự quyết).
- "Đổi thành phong cách chill" → đạo diễn + lồng tiếng + âm thanh: lời viết lại kiểu rủ rê nhẹ nhàng; giọng Laomedeia với chỉ dẫn chill; nhạc lo-fi tự tổng hợp 76 BPM (`make_music_chill.py`), không sfx; chữ hiện mờ dần, không gõ chữ, không sticker; video phủ màu ấm + viền tối.
- "Xoay quanh mấy video mình gửi nhiều hơn" → đạo diễn: sau phần vệ tinh, toàn bộ phần sau dựng trên 3 video: đi tới quán (ban ngày), mặt tiền đêm, khách ngồi quán mưa (làm nền cho dàn món, rồi sáng lên ở câu "nghe mưa"), vỉa hè ban ngày làm nền khuyến mãi, mặt tiền đêm cho màn kết.

## Vòng 4 (24/11/2026)
- "Bỏ giới thiệu món đi" → bỏ câu đọc dàn món và cảnh ảnh món; video giờ chỉ còn chỉ đường, quán, mưa, khuyến mãi, kết.
- "Giọng khó nghe quá, đổi giọng khác" → thu thử Despina, Callirrhoe, Umbriel, Achird (chỉ dẫn ngắn: thư thả, ấm, như kể bạn nghe); chọn **Despina** (nữ, êm, ấm). Dự phòng giọng nam: Umbriel.
- Màn kết đổi sang khúc sau của video khách ngồi quán đêm mưa, để không lặp đoạn video đêm.

## Vòng 5 (24/11/2026)
- "Sao đoạn đầu lại tiếng Anh" → lồng tiếng: Despina đọc luôn câu chỉ dẫn `--style` (0–7,6 s); bước soát vòng 4 nhờ Gemini chấm nên không phát hiện. Đã cắt bỏ, chép nguyên văn toàn bộ (khớp kịch bản), căn lại phụ đề (trước đó lệch khoảng 8 s), render lại. Video 38,8 s. Sửa gốc: tts.py in cảnh báo khi dùng --style; lessons.md ghi cách soát bằng chép nguyên văn.
