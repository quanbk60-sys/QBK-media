# Hoạt hình tu tiên vietsub (mẫu TikTok @suavietsubtv, người dùng gửi 10/11/2026)

- Mẫu chính: "Sư phụ của các Đại tiên nhân – Tập 1", 313 s, 1024×576 (16:9), kênh Sữa Vietsub TV. 425 nghìn lượt xem, 13,7 nghìn lượt thích (đọc lúc 10/11/2026).
- Đây là **bản vietsub đăng lại** từ hoạt hình gốc Trung Quốc (góc hình ghi 原创 @鸽神, logo kênh dịch "UyểnNhiTBVietsub").
- Mẫu cùng loại người dùng gửi trước đó: YouTube "Ta Thật Sự Không Muốn Tu Tiên (Tập 1–25)", kênh Panda Vietsub, 3 giờ 8 phút, 16:9. Mạng của phiên này chặn YouTube, nên Gemini xem hộ và chỉ đọc được thông tin chung.
- Ảnh khung: `contact.jpg`, `frames/`. Số đo máy: `analysis.json`. Lời đọc và cách kể: Gemini phân tích bản tải về (ngày 10/11/2026).

## Đặc trưng mẫu
- **Thể loại:** truyện tu tiên hài, có "hệ thống" (sư tôn bá đạo giả làm người thường, điểm danh nhận thưởng, thu đồ đệ bị khinh thường rồi lật kèo). Phim bộ, mỗi tập khoảng 5 phút, kết bằng nút thắt mở sang tập sau.
- **Hình:** nhân vật chibi 2D mặc áo tiên hiệp, nhiều nhân vật bị **dán mặt meme gấu trúc** (mặt người chụp, viền tròn trắng, tai đen) để gây cười. Bối cảnh vẽ kỹ: rừng trúc, thư viện, sân đá, hoa đào, quán trà. Màu dịu và hơi xám (độ rực màu 0,10, độ sáng 0,54). Bảng màu đo được: `#C3B1A3 #4A4C43 #8A827B #527D5F #94A296 #D7D3D1`.
- **Chuyển động:** kiểu **cắt ghép ảnh tĩnh**: trượt, rung, phóng to thu nhỏ nhân vật. Miệng không mấp máy, mỗi câu đổi một biểu cảm. Có hiệu ứng kiếm khí, sét, lửa hào quang, **bảng hệ thống khung vàng** bật lên khi nhận nhiệm vụ hoặc phần thưởng.
- **Nhịp:** 81 lần cắt trong 313 s, trung bình 4 s một cảnh. Đoạn đánh nhau cắt nhanh hơn nhiều.
- **Âm thanh:** **một giọng AI nữ** đọc suốt, đọc cả lời dẫn lẫn thoại của mọi nhân vật, không phân vai. Có nhạc nền tiên hiệp đổi theo cảnh, sfx vung kiếm, sét, "ting" nhận thưởng. Tỉ lệ có tiếng 95%.
- **Phụ đề:** **mỗi câu một dòng, đặt trong ngoặc kép**, chữ đỏ viền sáng, giữa đáy khung. Câu rất ngắn, kết bằng dấu chấm than.
- **Cách kể:** hook là "phô trương thế lực" ("Ở Nam Du có một thế lực tuyệt đối không thể trêu vào! Thảo Đường!"), điểm mặt từng đại đệ tử, rồi tung câu đùa: "Ta chẳng có gì ghê gớm… chỉ là sư tôn của chúng mà thôi!"

## Các bước làm video kiểu này (mẫu gốc, đoán từ hình)
1. Kịch bản phim bộ hoặc chuyển thể từ truyện chữ, chia tập 3–5 phút.
2. Vẽ sẵn thư viện nhân vật chibi tách lớp, bộ mặt meme và bối cảnh (Photoshop hoặc Illustrator).
3. Dựng kiểu cắt ghép (After Effects, Moho hoặc CapCut): trượt, rung, phóng to, thêm VFX.
4. Lồng một giọng TTS, chèn nhạc, sfx và phụ đề.
5. Kênh vietsub chỉ dịch, thay giọng Việt và phụ đề rồi đăng lại.

## Đối chiếu với quy trình QBK
| Bước mẫu | QBK đã có | Ghi chú |
|---|---|---|
| Kịch bản phim bộ | `bien-kich`, skill `viet-kich-ban` | Hiện viết 60–90 s, chưa có khung "phim bộ nhiều tập" |
| Giọng đọc | `long-tieng` (Gemini TTS, một giọng) | Khớp mẫu: mẫu cũng một giọng đọc suốt |
| Phụ đề một dòng | Engine tự căn | Chưa có kiểu "ngoặc kép, chữ đỏ" |
| Nhân vật chibi + mặt meme | Người que vẽ bằng code | **Khác nhiều nhất**, xem "Còn thiếu" |
| Bối cảnh tiên hiệp | Có vài nền chung | Chưa có rừng trúc, đình đài, sân tông môn |
| Cắt ghép trượt, rung, phóng to | Camera, `shake`, chuyển cảnh | Đã làm được |
| Bảng hệ thống, kiếm khí, sét | Chưa có | Cần họa sĩ thêm |
| Nhạc, sfx | Skill `am-thanh` (sfx tổng hợp) | Chưa có sfx kiếm, "ting" |
| Khung 16:9 | `layout: "blurband"` (phong cách `thi-nghiem`) | Dùng được nếu muốn giữ hình 16:9 trong video 9:16 |

## Đã có trong engine
- Người que diễn xuất, nhiều biểu cảm, camera đẩy và lia, rung, chuyển cảnh cứng.
- Bố cục khung 16:9 giữa màn 9:16 (`blurband`).
- Giọng Gemini TTS, căn phụ đề, sfx tổng hợp.

## Còn thiếu
- **Đầu "mặt meme"**: đầu tròn to, mặt biểu cảm phóng đại (mắt lé, miệng méo, mồ hôi) vẽ bằng code. Đây là thứ tạo tiếng cười của thể loại. **Không** dùng mặt gấu trúc hay ảnh mặt người của mẫu, phải tự thiết kế.
- Trang phục tiên hiệp: áo dài tay rộng, đai lưng, búi tóc, tóc bạc dài, nón lá, kiếm, phất trần, quạt.
- Bối cảnh: rừng trúc, đình gỗ, sân đá tông môn, núi mây, hoa đào.
- Hiệu ứng: kiếm khí (vệt sáng), sét, vòng hào quang lửa, **bảng hệ thống khung vàng** (tiêu đề, dòng thông số, phần thưởng), chữ bật lên kiểu "+500 năm tu vi".
- Phong cách phụ đề "thoại": một dòng, ngoặc kép, chữ đỏ viền sáng.
- Sfx: vung kiếm, sét, "ting" hệ thống.
- Khung kịch bản phim bộ: nhân vật cố định qua các tập, kết bằng nút thắt.

## Hợp với
Truyện hài kiểu "hệ thống", tu tiên, xuyên không; truyện cười dân gian kể theo kiểu phim bộ; truyện có nhân vật chính "giả heo ăn thịt hổ".

## Đề xuất
1. **Gói phong cách mới `tien-hiep`** (công vừa): nền màu dịu xanh xám như mẫu, nét mực sạch, phụ đề kiểu thoại, bảng hệ thống, sfx kiếm. Dùng khung 9:16 đầy màn (hợp TikTok hơn 16:9 của mẫu).
2. **Đầu mặt meme cho người que** (công vừa, giao `hoa-si`): 6–8 biểu cảm phóng đại, dùng chung cho mọi gói phong cách hài.
3. **Phim bộ 60–90 s mỗi tập** (công nhỏ): `bien-kich` viết bible nhân vật một lần, mỗi tập một mạch "khoe, bị coi thường, lật kèo, nút thắt". Mẫu dài 5 phút, nhưng TikTok của QBK nên giữ 60–90 s.
4. Giọng: giữ một giọng đọc như mẫu. Thoại đặt trong ngoặc kép để người xem phân biệt với lời dẫn.

## Lưu ý
- Mẫu là **bản đăng lại có bản quyền của tác giả gốc**. QBK chỉ học cách kể và kỹ thuật. **Không** dùng tên nhân vật (Hạ Trường Sinh, Diệp Thu Bạch, Thảo Đường), cốt truyện, mặt meme gấu trúc hay hình của mẫu. Truyện phải do QBK tự viết.
- Không lưu video gốc trong repo. Khung hình ở đây đã thu nhỏ, chỉ để nghiên cứu.
- Truyện hư cấu không cần nguồn dữ kiện, nhưng nếu nhắc đến điển tích hay sách thật thì vẫn phải ghi vào `sources.md`.
