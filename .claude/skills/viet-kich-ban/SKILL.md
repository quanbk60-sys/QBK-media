---
name: viet-kich-ban
description: Viết kịch bản lời đọc tiếng Việt cho video ngắn 9:16 (60–90 giây) và kiểm chứng dữ kiện. Tạo script.md, narration.txt, sources.md, captions-phrases.txt trong projects/<slug>/. Dùng cho vai biên kịch của đoàn phim.
---

# Biên kịch và kiểm chứng

## Đầu vào
`projects/<slug>/brief.md`. Nếu brief có mục **Hiểu yêu cầu** (phiếu từ app), đó là cam kết với người dùng:
- Mọi ý **Bắt buộc có** phải có trong lời đọc hoặc ý hình. Ý nào sai sự thật hoặc không kiểm chứng được thì không đưa vào và báo lại Nhà sản xuất, không âm thầm bỏ.
- Không viết gì thuộc **Không được có**.
- Kiểm chứng theo **Nguồn nên dùng** và tệp trong `inputs/` trước.
- Người dùng dán kịch bản có sẵn thì giữ lời của họ; chỉ sửa lỗi dữ kiện, độ dài, cách đọc số, và liệt kê từng chỗ sửa.
- Có tệp "đưa vào video" thì viết ý hình dùng đúng tệp đó ở cảnh người dùng dặn.

## Đầu ra (trong `projects/<slug>/`)
1. **`narration.txt`**: lời đọc chính xác từng chữ, dùng để thu giọng. Mỗi câu một dòng, không ghi chú.
2. **`script.md`**: bảng phân đoạn gồm cột `# | Lời đọc | Ý hình (nhân vật, hành động, đạo cụ) | Chữ trên hình (≤3 từ)`, cùng danh sách nhân vật kèm trang phục gợi ý.
3. **`sources.md`**: bảng `Dữ kiện | Trạng thái (Đã xác nhận / Cần đối chiếu / Hư cấu) | Nguồn`, kèm mục **"Cố ý KHÔNG đưa vào"**.
4. **`captions-phrases.txt`**: lời đọc tách thành các cụm phụ đề, **mỗi dòng một cụm, tối đa khoảng 30 ký tự**, ngắt ở chỗ ngừng tự nhiên (dấu phẩy, dấu chấm, giữa các vế). Nối các cụm lại phải ra đúng `narration.txt`.

## Độ dài
Tiếng Việt đọc khoảng **3,0–3,3 âm tiết mỗi giây**. 60 giây cần khoảng 190 âm tiết, 90 giây khoảng 280. Con số như "938" đọc thành nhiều âm tiết.

## Cấu trúc
1. **Hook (0–4 giây):** nghịch lý, câu hỏi hoặc tình huống. Không mở đầu bằng "Xin chào các bạn".
2. **Bối cảnh:** ai, ở đâu, khi nào. Ngắn gọn.
3. **Xung đột hoặc bí mật:** điều người xem chưa biết.
4. **Cao trào:** hành động có thể dựng thành hình (bắt buộc với lịch sử và hoạt hình).
5. **Kết:** một câu đọng lại, hoặc **một câu hỏi để khơi bình luận**.

Câu ngắn, động từ mạnh, dễ hình dung. Mỗi 2–3 giây phải có một hình ảnh mới để đạo diễn dựng.

## Kiểm chứng (bắt buộc với lịch sử, khoa học, số liệu)
- Tìm bằng WebSearch. Nếu mạng cho phép, đọc Wikipedia hoặc nguồn chính thống bằng WebFetch.
- Một dữ kiện có từ 2 nguồn độc lập trở lên, hoặc từ sử liệu gốc, thì ghi "Đã xác nhận".
- Số liệu không chắc như số quân, số thuyền, ngày tháng cụ thể: **bỏ đi**, ghi vào mục "Cố ý KHÔNG đưa vào".
- Câu nói của nhân vật lịch sử: chỉ dùng khi có nguồn. Nếu là diễn giải thì không được viết như trích dẫn nguyên văn.
- Phân biệt nhận định của sử gia với sự kiện.
- Với nội dung hư cấu (hoạt hình vui, ngụ ngôn): ghi "Hư cấu" và không gán cho người thật.

## Trước khi bàn giao
- Có mục Hiểu yêu cầu thì thêm vào `script.md` mục `## Đối chiếu yêu cầu`: mỗi ý bắt buộc → câu số mấy; mỗi điều cần tránh → "không có".
- Đếm âm tiết so với thời lượng mục tiêu.
- Kiểm tra chính tả tiếng Việt và dấu.
- Không còn chữ viết tắt mà giọng đọc dễ đọc sai. Ví dụ viết "Thế kỷ mười", không viết "TK X".
- Trả lời Nhà sản xuất gồm: lời đọc đầy đủ, số âm tiết và thời lượng ước tính, tóm tắt bảng sử liệu.
