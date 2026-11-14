# Tượng đá cà khịa (mẫu TikTok của kênh QBK60, người dùng gửi 12/11/2026)

- Mẫu: https://vt.tiktok.com/ZSp9dNMjt/ (id 7707241521149496577), 144 s, 576×1024, âm thanh gốc. Không lưu video gốc. Ảnh khung: `contact.png`, số đo: `analysis.json`. Bản QBK: `qbk-demo.png`, cảnh mẫu `studio/engine/examples/styles/10-tuong-da.json`.
- Phong cách engine: **`tuong-da`** (`lib/styles.mjs`), đạo cụ `bust`, `column`, `trident`, `bolt`, `cardSign` (`lib/props.mjs`).

## Đặc trưng mẫu
- **Hình:** tượng thần Hy Lạp bán thân bằng cẩm thạch hoặc đá bazan đen (ảnh AI chân thực), đeo **tai nghe** podcast, cầm đinh ba, tia sét, micro, thẻ đen. Đồ hiện đại chen vào đồ cổ cho buồn cười: kính pixel "deal with it", biển neon, wifi mất sóng, tim hồng bay.
- **Màu đo được:** nâu đen `#191410` (23%), nâu đất `#977656`, `#4A392B`, be cẩm thạch `#BDA98B`, `#E5D0AE`, đỏ gạch `#89452E`. Độ sáng 0,40, độ rực 0,19 (trầm, ấm), điểm nhấn đỏ, cam, xanh, hồng rất rực trên nền trầm.
- **Chất liệu cắt dán:** tường đá khối, cột Hy Lạp, bìa carton, giấy nhàu, **dấu mộc đỏ hoặc trắng bị mòn** ("VIP", "SCIENCE PLEASE"), sticker vẽ tay vàng (tia sét, tia sáng). Khung hình **bo góc tối như ảnh in cũ**, hạt phim, viền tối.
- **Bố cục:** một tượng chính giữa khung, chiếm 60–70% chiều cao; cảnh đối đầu chia đôi khung (hai tượng nhìn nhau, vạch nứt giữa). Chữ to xiên, đặt chồng lên nhân vật như con dấu.
- **Nhịp:** cắt cứng đều **8 s một cảnh** (24 lần cắt, trung bình 5,8 s), trong cảnh có camera đẩy, rung, vật bay vào. Đoạn 124–125 s cắt dồn 5 lần liền (cú sốc).
- **Âm thanh:** tiếng nói 85% thời gian, độ lớn trung bình −25 dB. **Nhiều giọng nam đóng nhiều vai** (Hermes trẻ lém lỉnh, Zeus già gắt, Poseidon cà khịa, Hades trầm lạnh). Nhạc trap vui, đổi sang bí ẩn khi Hades xuất hiện. SFX dày: sấm, quẹt thẻ, tạt nước, chó sủa, rung chấn, tiếng chặn.
- **Cách kể:** hook kiểu dẫn podcast ("check var xem ai là cá mập"), thân là màn đọ của leo thang giữa hai nhân vật bằng tiếng lóng hiện đại (sổ đỏ, cash flow, black card, cấm vận), **cú lật** khi nhân vật thứ ba điềm tĩnh dẹp loạn và hóa ra giàu nhất, kết bằng một câu chốt ("tui block nha") và thẻ "To be continued".

## Đã có trong engine (sau lần học này)
- Gói `tuong-da`: nền **tường đá khối** có ánh sáng từ trên giữa, lớp phủ màu ấm, hạt phim, vệt xước, **khung bo góc tối**; nét vector dày có bóng đổ đen (`fill: drop`), vật **bật ra** (`drawMode: pop`), chuyển cảnh `flash`.
- **Phụ đề dấu mộc đỏ** (`captionBox: "stamp"`): nền giấy be, hai viền đỏ, chữ đỏ QBKBlack có vết mòn, nghiêng nhẹ khác nhau mỗi câu.
- Đạo cụ **`bust`** (tượng bán thân trên bệ, vẽ bằng code): `tone` marble|basalt, `hair` curls|laurel|coral|hood|bald, `beard`, `mouth` closed|open|grin|shout, `talk` (miệng mấp máy), `brows` calm|angry|smug|sad, `eyes` blank|look, `headphones` (màu), `glasses` (kính pixel), `crack` (vết nứt), `hold` trident|bolt|mic|scroll|card.
- `column` (cột Hy Lạp), `trident` (đinh ba), `bolt` (tia sét nhấp nháy), `cardSign` (bảng bìa carton có chữ, dùng cho tên nhân vật và thẻ "CÒN TIẾP...").

## Còn thiếu
- **Hình chân thực:** mẫu là ảnh AI. Bản vẽ bằng code giữ bố cục, bảng màu, chất liệu và đồ vật nhưng nét hoạt hình, không giống ảnh tượng thật. Muốn sát hơn thì làm biến thể "ảnh của bạn" (người dùng tạo tượng bên Gemini, đoàn phim dựng dấu mộc, hạt phim, khung bo, nhịp cắt) như `giay-gap`.
- **Giọng riêng từng nhân vật:** `tts.py` thu một giọng. Cần thu từng câu với giọng khác nhau (`--voice`) rồi ghép, hoặc dùng chế độ nhiều người nói của Gemini. Việc của `long-tieng`, công vừa.
- Tay tượng cử động (hiện chỉ có nắm tay cầm đồ), xoay đầu, mắt đảo; cảnh chia đôi có vạch nứt; tim hồng bay, biển neon, biểu tượng wifi; cảnh cắt dồn nhanh. Giao `hoa-si` theo nhu cầu.
- Nhạc trap: kênh chưa có nhạc có giấy phép (xem skill `am-thanh`).

## Biến thể ảnh của bạn (`tuong-da-anh` trong app, 14/11/2026)
Người dùng muốn **y hệt** mẫu. Mẫu gốc là **video AI tạo từ ảnh** (tượng mấp máy miệng, giơ tay, thẻ lấp lánh), không phải ảnh tĩnh. Cách miễn phí gần nhất:
- **Hình:** người dùng tạo ảnh bên Gemini theo `gemini-anh.md`. Mỗi cảnh có nói thì 2 ảnh: `NN-ten.png` (miệng ngậm) và `NN-ten-noi.png` (miệng mở, còn lại y hệt).
- **Giọng:** `studio/tools/thoai.py` thu mỗi vai một giọng, ra `talk.json`.
- **Dựng:** style `tuong-da`, mỗi cảnh một `photo` `full: true`, `dim: 0`, `shade: false`, `enterDur: 0.01`, `talkPath` + `talk` (từ `talk.json` cộng `lead`). Trên ảnh: `cardSign` (tên), `stampText` (câu chốt đóng dấu), `rays` (tia vàng vẽ tay). Phụ đề dấu mộc tự có. Máy quay đẩy chậm khi nói, giật zoom và `motion: shake` ở câu gắt, cắt cứng mỗi câu, kết bằng `cardSign` "CÒN TIẾP...".
- Đã thử bằng khung hình lấy từ video của kênh (không lưu vào repo): miệng mấp máy khớp lời, hai giọng Puck và Charon phân biệt rõ.
- **Không làm được bằng ảnh tĩnh:** tay vung, vật bay, nước bắn. Muốn có thì cần video AI (tốn phí, người dùng đã tắt video AI ngày 11/11), phải hỏi và báo giá trước.

## Hợp với
Thần thoại Hy Lạp, La Mã, Bắc Âu; lịch sử thế giới kể hài (các hoàng đế, triết gia đọ tài); "ai giàu nhất, ai mạnh nhất"; đối đáp nhiều nhân vật; giải thích kinh tế bằng chuyện cãi nhau (đất đai so với tiền mặt).

## Đề xuất
- Dùng `tuong-da` cho loạt "Thần thoại cà khịa": mỗi tập 60–90 s, 3 nhân vật, mỗi câu thoại một cảnh 4–8 s, tên nhân vật trên bảng carton, câu chốt trong dấu mộc, kết bằng "CÒN TIẾP...".
- Kịch bản viết dạng **thoại** (ghi tên người nói từng dòng), đạo diễn đổi tượng theo người nói, `talk: true` cho người đang nói.

## Lưu ý
- Không chép lời thoại, tên kênh hay hình của mẫu. Chỉ học phong cách và cách kể.
- Thần thoại thì dữ kiện vẫn phải đúng (Zeus trị bầu trời và Olympus, Poseidon trị biển, Hades trị âm phủ và của cải dưới lòng đất), ghi vào `sources.md`. Phần cà khịa là hư cấu, ghi rõ trong mô tả.
- Tiếng lóng nhẹ, tránh chửi thề và xúc phạm tôn giáo đang thờ phụng.
