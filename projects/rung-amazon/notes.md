# Ghi chú sáng tạo: Rừng Amazon

## Biên kịch
- **Hook bằng nghịch lý thay vì con số:** mở bằng "không phải lá phổi", con số 20% đến ngay câu thứ hai. Vì câu "lá phổi xanh" quen tai với khán giả Việt, phủ định nó gây tò mò mạnh hơn một con số khô. Câu hỏi kết quay lại đúng ngộ nhận đó, tạo vòng khép kín và dễ khơi bình luận ("mình cũng từng tin").
- **Bỏ tên Antonio Nobre khỏi lời đọc**, nói "theo một ước tính khoa học", tên ông ghi ở dòng NGUỒN trên hình: đỡ 8 âm tiết, tránh giọng TTS phát âm sai, mà vẫn nói rõ đây là ước tính.
- **Tính "Amazon" là 3 âm tiết** khi đếm (A-ma-dôn). Đề nghị lồng tiếng nghe thử xem Bodi đọc "Amazon" thế nào, nếu đọc kiểu tiếng Anh thì vẫn chấp nhận được.
- Lồng tiếng: giọng gốc 56,7s, sau 1,2x còn 47,25s (ngắn hơn mục tiêu 60s khoảng 21%). Nhà sản xuất giữ 1,2x theo bài học tốc độ; video ngắn vẫn hợp TikTok/Shorts.

## Đạo diễn
- **Sửa engine (opt-in, không ảnh hưởng phim cũ):** chữ vẽ bằng `fillText` bỏ qua camera (camera chỉ tác động lên nét và mảng màu), nên khi lia/phóng, chữ trong `infoPanel` trượt khỏi thanh và khung. Thêm cờ cấp scene `"textFollowsCamera": true` (lib/recorder.mjs, lib/scene.mjs, ghi trong SCENE_FORMAT.md). Mặc định tắt vì `rua-va-tho` có 8 shot dùng camera kèm chữ; bật mặc định sẽ làm phim đó khác đi khi render lại.
- **Font thiếu ký tự `≈ ≥ →`** (hiện ô vuông). Đã thay bằng `~0`, `ÍT NHẤT 10%`, `~1/5`, bỏ mũi tên. Nên tránh các ký tự này cho đến khi có font đủ.
- **Hook đưa "20% Ô-XY" bị gạch + NGỘ NHẬN vào ngay 0–2,5s**, trước khi lời đọc nói tới 20% (theo chỉ đạo của Nhà sản xuất): người xem thấy ngay con số bị bác bỏ, lời đọc "không phải lá phổi" giải thích sau.
- **Nhãn "BẢN ĐỒ MINH HỌA"**: ẩn nhãn tích hợp của `southAmericaMap` (nằm ở góc dưới phải, rơi vào vùng phụ đề khi camera phóng 1,1x) và đặt nhãn riêng bên trái mũi Nam Mỹ.
- **Sông bay trên bản đồ** ghép hai đoạn `vaporFlow`: đoạn 1 từ Đại Tây Dương sang tây qua Amazon (cong lên bắc), đoạn 2 vòng xuống nam dọc sườn Andes, vẽ nối tiếp. Đuôi có `cloud` + chữ MƯA.
- `stump` dùng ở shot "Mất cây" (không lửa, không cưa); vùng mất rừng trên bản đồ là `lost` đỏ gạch.
- Scene được sinh từ `projects/rung-amazon/build_scene.py` (tọa độ bản đồ tính theo kinh/vĩ độ minh họa). Sửa script rồi chạy lại để đổi scene.json.
