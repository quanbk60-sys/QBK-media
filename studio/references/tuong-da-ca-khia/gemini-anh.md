# Tượng đá cà khịa · ảnh Gemini: hướng dẫn tạo ảnh

Phong cách app: **"Tượng đá · ảnh của bạn"** (id `tuong-da-anh`). Bạn tạo ảnh bên Gemini (miễn phí, ngoài app) rồi tải lên. Đoàn phim lo phần còn lại: giọng riêng từng nhân vật, miệng mấp máy theo lời, tên trên bảng carton, phụ đề dấu mộc đỏ, chữ đóng dấu, hạt phim, khung bo góc, máy quay đẩy và rung, âm thanh, thẻ "CÒN TIẾP...".

## Mỗi cảnh cần 2 ảnh
1. **Ảnh A: miệng ngậm.**
2. **Ảnh B: y hệt ảnh A, chỉ khác là miệng mở.** Trong Gemini, gửi lại ảnh A rồi gõ câu sửa ở dưới. Đoàn phim đổi qua lại A và B lúc nhân vật nói, nên tượng trông như đang nói.

Cảnh không ai nói (tượng đứng nhìn, cảnh phản ứng) thì chỉ cần ảnh A.

Đặt tên hoặc tải lên theo thứ tự: `01-zeus.png`, `01-zeus-noi.png`, `02-poseidon.png`, `02-poseidon-noi.png`, ... (chữ `-noi` là ảnh miệng mở).

## Bước 1: tạo nhân vật (làm một lần, dùng cho mọi tập)
Mỗi nhân vật tạo **một ảnh chân dung gốc** rồi giữ lại. Mỗi lần tạo cảnh mới, gửi kèm ảnh gốc này để Gemini vẽ đúng mặt.

Câu mẫu (dán vào Gemini, đổi phần trong ngoặc vuông):

```
Ảnh dọc 9:16, chụp chân thực. Tượng bán thân thần [Zeus] bằng đá cẩm thạch trắng cũ, có vết nứt và rêu nhẹ,
[râu tóc xoăn dày, vương miện nguyệt quế], đeo tai nghe podcast chụp tai to màu [xám bạc], tay cầm [tia sét vàng].
Tượng có khớp tay như mô hình đồ chơi. Biểu cảm [cau có, ngạo mạn], miệng ngậm.
Nền: tường đá khối tối màu và cột Hy Lạp cổ, ánh sáng ấm từ trên xuống, tông nâu sepia, viền tối.
Phong cách ảnh cắt dán vui nhộn, chất liệu đá thật, rất chi tiết. Không có chữ, không logo.
```

Gợi ý từng nhân vật (giữ đúng thần thoại):
| Nhân vật | Chất liệu | Đặc điểm | Màu tai nghe | Đồ cầm |
|---|---|---|---|---|
| Zeus | cẩm thạch trắng | râu dài xoăn, nguyệt quế, mặt cau có | xám bạc | tia sét vàng |
| Poseidon | cẩm thạch trắng ngà, mặt nạ sứ | san hô đỏ cam hai bên đầu, môi đỏ | vàng đồng | đinh ba gỉ sét, thẻ đen |
| Hades | đá bazan đen rỗ | mũ trùm, cánh dơi kim loại, răng nanh | da nâu, đinh tán | đầu lâu, chìa khóa |
| Hermes | cẩm thạch trắng | mặt trẻ, nghịch ngợm, mũ có cánh | đỏ | micro, điện thoại |

## Bước 2: tạo ảnh từng cảnh
Gửi ảnh gốc của nhân vật kèm câu:

```
Giữ nguyên nhân vật trong ảnh này (cùng khuôn mặt, chất liệu, tai nghe). Tạo ảnh dọc 9:16 mới:
[Poseidon giơ tấm thẻ đen lấp lánh trước ngực, cười khẩy], miệng ngậm.
Nền [tường đá và mây đá xoắn]. Cùng tông sepia, ánh sáng ấm, viền tối. Không có chữ.
```

Cảnh hai người đối đầu: "hai tượng đặt hai bên, nhìn nhau, vạch nứt dọc ở giữa ảnh".

## Bước 3: ảnh miệng mở (ảnh B)
Gửi lại ảnh A kèm câu:

```
Sửa ảnh này: giữ nguyên tuyệt đối mọi thứ (bố cục, ánh sáng, tay, đồ vật, nền).
Chỉ mở miệng tượng ra như đang nói to, thấy răng. Không thay đổi gì khác.
```

Nếu Gemini đổi luôn tay hoặc nền thì bảo lại: "giữ nguyên tay và nền như ảnh gốc, chỉ sửa miệng".

## Lưu ý
- **Không có chữ trong ảnh.** Đoàn phim tự thêm tên, dấu mộc và phụ đề tiếng Việt cho đúng chính tả.
- Mỗi tập khoảng 8–14 cảnh, tức 15–25 ảnh.
- Ảnh tĩnh không làm được tay vung hay vật bay như video AI của mẫu. Đoàn phim bù bằng máy quay đẩy, rung, bật chữ, tia vẽ tay và âm thanh. Muốn cử động thật thì phải dùng video AI (tốn phí), đoàn phim sẽ báo giá trước.
