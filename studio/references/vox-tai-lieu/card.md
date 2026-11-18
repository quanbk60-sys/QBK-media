# Tài liệu cắt dán kiểu Vox (người dùng gửi file "Vox Style", 18/11/2026)

- Gốc: bộ prompt "Crime Documentary Paper Engine v1.0" (`goc/engine-prompt.txt`) và tài liệu nguồn của nó (`goc/source-material.pdf`): cách viết kiểu Fern, chia nhịp, hệ phong cách cắt dán, prompt mẫu, prompt video chung, quy tắc ElevenLabs, DNA ảnh bìa. Ảnh tham khảo: `goc/thumbnail-dna.jpg` (chuẩn ảnh bìa), `goc/vox-visual-styles.jpg` (bảng 18 kiểu cắt dán + 12 chất liệu hoạt hình).
- Phong cách engine: **`cat-dan`** (`studio/engine/lib/collage.mjs`). Skill: **`tai-lieu-cat-dan`**. Phim mẫu: `projects/_demo-cat-dan/` (13 s, ảnh Bạch Đằng từ Wikimedia). Khung mẫu: `demo-frames.jpg`.

## Đặc trưng
- **Chất liệu duy nhất:** cắt dán giấy tài liệu. Giấy báo ngả vàng, bản đồ lưu trữ, ảnh đen trắng in halftone cắt kéo thô, có nét màu lệch phía sau, mép giấy xé, băng dính, dải chữ đánh máy, dấu mộc, ghim và dây đỏ khi câu chuyện cần nối các mảnh.
- **Bảng màu:** nâu giấy, đen mực, xám halftone, **một màu đỏ nóng** làm tín hiệu, vàng mù tạt là màu phụ dùng tiết kiệm. Ánh sáng phẳng, bóng đổ mềm dưới mỗi lớp giấy.
- **Bố cục:** một vật chính khoảng 70% sức nặng, 2–3 vật phụ, nhiều khoảng trống. Mặc định không có chữ; có ngày, tên hoặc số thì một nhãn 1–4 chữ.
- **Chuyển động:** camera khóa. Khung mở trên nền trống, các mảnh giấy vào lần lượt từ sau ra trước theo thứ tự kể (vật chính trượt vào, vật phụ thả xuống, băng dính dán, dải chữ trượt, dấu mộc đập, dây đỏ tự kéo, nét bút vẽ sau cùng), nhịp stop-motion "quay đôi" có khựng 2–3 hình, rồi đứng yên như poster sống.
- **Âm thanh:** chỉ tiếng giấy (trượt, gõ, dán băng dính, đập dấu, kéo dây, ghim) và tiếng phòng nhẹ, giọng đọc lồng riêng.
- **Lời kể (Fern):** liền mạch, mở lạnh bằng ngày + địa điểm + một hành động nhỏ, câu khẳng định ngắn, từ nối thời gian và nhân quả, mỗi câu một ý, kết bằng câu treo (5 khuôn). Kiềm chế với bi kịch thật.
- **Ảnh bìa:** cùng chất liệu nhưng gắt hơn: một chủ thể halftone lớn (dải đen che mắt nếu là người được ám chỉ), tối đa 2 khối chữ 3 chữ viết hoa cô đặc trên dải đỏ hoặc vàng, một vòng bút đỏ.

## QBK làm thế nào
| Bản gốc | QBK |
|---|---|
| Ảnh AI 16:9 mỗi nhịp, AI biến ảnh thành video 10 s | Engine vẽ bằng code, 9:16, mỗi nhịp một shot. Ảnh thật từ Wikimedia (`commons.py`) được engine **tự in halftone, cắt viền, thêm nét màu lệch**. Thiếu ảnh thì dùng hình bóng, hình hình học, tài liệu, lưới biểu tượng |
| Hiệu ứng lắp ráp do AI video tạo | `enter` (`slide`, `drop`, `stamp`, `pop`) với thời gian bước 1/12 s, nảy nhẹ khi đáp, bóng đổ nhấc lên khi đang bay, rung nhẹ khi đã nằm yên |
| Tiếng giấy ASMR | Tổng hợp trong `audio.mjs` (`paper`, `tape`), tự gắn khi phần tử vào cảnh |
| ElevenLabs | Gemini TTS, giọng trầm đều |
| Hỏi người dùng từng bước | Làm trọn video rồi gửi duyệt |
| Chữ tiếng Anh | Oswald Bold (cô đặc) và IBM Plex Mono (đánh máy), đều có đủ dấu tiếng Việt (giấy phép OFL, trong `studio/engine/fonts/`) |

Bảng 18 kiểu của Vox đều dựng được bằng phần tử engine: 1 cutout collage (`cutout` + `scribble arrow`), 2 archival duotone poster (`shape triangle` đỏ + `cutout` + `censor`), 3–4 data collage và annotated data viz (`chart`, `bigstat`), 5 archival timeline (`timeline`), 6–7 evidence board (`plate cork`/`white` + `yarn`), 8 document forensics (`doc`), 9 desk flat-lay (`plate grid`), 10–11 route map và map graphic (`plate map` + `scribble` + `tack`), 13 halftone portrait (`cutout` `tone: "red"`), 14 kinetic typography (`headline`), 15 vintage newsprint chaos (nhiều `scrap color: "news"`), 16 grid & scale (`icons`).

## Hợp thể loại
Vụ án và bí ẩn có thật, lịch sử (nhất là lịch sử thế giới cận đại), tiền và quyền lực, thảm họa, công nghệ, giải thích một sự kiện. Không hợp ngụ ngôn và hoạt hình vui (dùng người que).

## Còn thiếu
- Kiểu 12 (flat vector), 17 (khung điện thoại), 18 (sơ đồ 3D tách lớp) và các chất liệu M1–M11: chưa làm, chưa cần.
- Bản đồ địa lý thật: `plate: "map"` chỉ là bản đồ cổ trang trí. Cần bản đồ thật thì ghép với `ve-tinh` hoặc ảnh bản đồ cũ trên Commons làm `cutout`.
- Tách nền ảnh người tự động (để có viền trắng ôm dáng) cần ảnh PNG đã tách nền sẵn.
