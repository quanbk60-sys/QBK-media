---
name: tai-lieu-cat-dan
description: Phim tài liệu cắt dán giấy kiểu Vox cho kênh QBK, gồm lời đọc kiểu Fern (mở bằng ngày, địa điểm, một hành động nhỏ; kết bằng câu treo), chia nhịp 2–3 giây, dựng hình bằng phong cách engine `cat-dan` (ảnh thật halftone cắt kéo, giấy báo, dấu mộc, dây đỏ, một màu đỏ nhấn) và ảnh bìa cùng chất liệu. Dùng khi brief chọn phong cách `cat-dan`, hoặc người dùng nói "kiểu Vox", "tài liệu cắt dán", "phim tài liệu vụ án / bí ẩn / lịch sử".
---

# Tài liệu cắt dán (Vox) cho QBK

Chuyển từ bộ prompt "Crime Documentary Paper Engine v1.0" (người dùng gửi, bản gốc và thẻ phân tích ở `studio/references/vox-tai-lieu/`) sang quy trình của đoàn phim:

| Bản gốc | QBK |
|---|---|
| Ảnh AI 16:9 cho từng nhịp, rồi AI tạo video | Engine vẽ bằng code, khung **9:16**, style `"cat-dan"` (`studio/engine/lib/collage.mjs`). Ảnh thật lấy từ Wikimedia Commons (`studio/tools/commons.py`), engine tự in halftone và cắt viền |
| ElevenLabs | Gemini TTS (`long-tieng`), giọng trầm, đều, kiểu đọc tài liệu |
| Hỏi người dùng từng bước (state 0–9) | Đoàn phim làm trọn video rồi gửi duyệt (quy trình v2 trong `lam-video`) |
| Tiếng Anh, 2,5 từ/giây | Tiếng Việt, khoảng 3,0–3,3 âm tiết/giây ở tốc độ gốc |

Luật cứng của QBK giữ nguyên: không bịa, mọi dữ kiện có trong `sources.md`, không tự đăng, miễn phí trước.

## 1. Chọn đề tài (Nhà sản xuất, `san-trend`)
Mảng hợp: vụ án và bí ẩn có thật, lịch sử, tiền và quyền lực, thảm họa và sống sót, công nghệ, thể thao. Tên video theo các khuôn:
"Chuyện gì đã xảy ra với …", "Cuộc truy lùng …", "Người đã …", "Vì sao … lại …", "… giải thích trong 60 giây", "Câu chuyện kỳ lạ về …".
Mỗi tên phải có **một mốc cụ thể** (ngày, tên, con số hoặc địa điểm). Không giật tít. Gợi ý nhiều ý tưởng một lúc thì không để hai ý cùng một tiểu mảng (một vụ cướp, một vụ mất tích, một vụ lừa đảo…).

## 2. Lời đọc kiểu Fern (`bien-kich`, skill `viet-kich-ban`)
- **Lời kể liền mạch.** Không tiêu đề chương, không chỉ dẫn máy quay trong lời.
- **Mở lạnh (3–4 câu đầu, khoảng 35–45 âm tiết):** ngày chính xác, địa điểm có tên, một hành động nhỏ cụ thể. Không "Bạn có biết", không "Hãy tưởng tượng", không câu hỏi tu từ. Ví dụ khuôn: *"Ngày 24 tháng 11 năm 1971. Sân bay Portland. Một người đàn ông mặc vest tối trả tiền mặt mua vé một chiều."*
- **Giọng điềm tĩnh, chính xác.** Phần lớn là câu khẳng định ngắn, mỗi đoạn có một câu dài giải thích. Người kể không bình luận, không cảm thán, không nói với người xem. Căng thẳng đến từ dữ kiện xếp liền nhau, không từ tính từ.
- **Từ nối thời gian và nhân quả:** rồi, sáng hôm sau, ba ngày sau, trong vòng một giờ, vì thế, nghĩa là, điều không ai biết là.
- **Mỗi câu một ý, kết bằng dấu chấm**, vì mỗi câu (hoặc mỗi vế của câu dài) thành một nhịp hình. Câu không hình dung được thì viết lại.
- **Chuyện có thương vong thật:** không máu me, không cận cảnh đau đớn, không giễu nạn nhân. Căng thẳng nằm ở đồ vật, giấy tờ, bản đồ, tiền, thời tiết và thời gian.
- **Chi tiết còn tranh cãi:** viết vòng ("FBI tin rằng", "nhân chứng mô tả"), không bịa tên, ngày, số.
- **Không kêu gọi theo dõi, không lời chào cuối.** QBK thường kết bằng câu hỏi khơi bình luận; với phong cách này thì **câu treo thay cho câu hỏi**.
- **Câu kết bắt buộc là câu treo, tối đa khoảng 15 âm tiết**, kết ở một danh từ, một cái tên, một mốc thời gian hoặc một câu khẳng định ngắn. Chọn một trong năm khuôn:
  1. *Vật còn đó:* "Chiếc dù chưa bao giờ được tìm thấy."
  2. *Nhảy tới một ngày sau:* "Rồi năm 1980, một cậu bé tìm thấy số tiền."
  3. *Mảnh còn thiếu:* "Họ có cà vạt của hắn. Không bao giờ có tên hắn."
  4. *Mâu thuẫn lặng lẽ:* "Người ngồi ghế 18C chưa từng tồn tại."
  5. *Cái giá:* "Những bức tranh vẫn trị giá nửa tỷ đô la."
- **Độ dài:** 30 giây khoảng 95 âm tiết, 60 giây khoảng 190, 90 giây khoảng 280 (đo lại sau khi thu giọng, `retime.py` nếu cần).

`script.md` vẫn có bảng phân đoạn như thường lệ, cột "Ý hình" ghi **một vật chính** cho mỗi nhịp (mục 3).

## 3. Chia nhịp và dựng hình (`dao-dien`, skill `phan-canh`)
**Nhịp:** mỗi nhịp 2–3 giây lời đọc. Câu ngắn là một nhịp, câu dài tách ở dấu phẩy hoặc giữa các vế. 60 giây khoảng 22–30 nhịp. **Mỗi nhịp là một shot** trong `scene.json`, cắt thẳng (`transition: "cut"`, mặc định của style). Shot mở một chương mới có thể dùng `"transition": "tear"` (tờ giấy bị xé lên).

**Luật bố cục (mỗi shot):**
- **Một vật chính** chiếm khoảng 70% sức nặng thị giác, **tối đa 2–3 vật phụ**, còn lại là giấy trống. Không trang trí: mảnh giấy, dấu mộc, sợi dây nào cũng phải có lý do trong lời đọc.
- **Chữ trên hình mặc định là không có.** Nhịp có ngày, tên hoặc con số quan trọng thì được **một nhãn 1–4 chữ** (dải đánh máy `strip`, dấu mộc `stampbox`, giấy xé `scrap` hoặc tiêu đề `headline`).
- **Một màu đỏ nhấn**, vàng mù tạt là màu phụ dùng tiết kiệm. Còn lại là nâu giấy, đen mực, xám halftone.
- **Vật, người, nơi lặp lại** giữa các nhịp thì dùng **cùng một ảnh, cùng kiểu cắt, cùng màu** để cả phim liền một mạch.
- **Người thật được nhắc gián tiếp** (nghi phạm vô danh, người còn sống không nêu tên) thì dùng `censor` (dải đen che mắt) hoặc `silhouette`. Nhân vật lịch sử có tên thì không che.
- **Camera đứng yên** trong mỗi shot (không `camera`). Chuyển động là các mảnh giấy vào cảnh lần lượt từ sau ra trước theo thứ tự câu chuyện: nền, rồi vật chính trượt vào, vật phụ thả xuống hoặc ghim lên, băng dính dán, dải chữ trượt vào, dấu mộc đập, dây đỏ tự kéo, nét bút đỏ vẽ sau cùng. Engine tự làm nhịp stop-motion 12 hình/giây, tự rung nhẹ khi đã nằm yên, tự thêm tiếng giấy.
- Mỗi phần tử vào cảnh cách nhau khoảng 0,15–0,4 s (`from`). Mọi thứ phải vào xong trước khi hết khoảng 60% shot để người xem kịp đọc.
- Giữ vật chính trong vùng y 300–1340, phụ đề ở y ≈ 1440 (`captions.y`), để trống góc phải dưới cho giao diện TikTok.

**Chọn hình cho nhịp (nghĩ ý, không minh họa từng chữ):**
| Nhịp nói về | Dựng bằng |
|---|---|
| Ngày, năm | `scrap` trắng chữ lớn (tờ lịch xé) + `tape` + có thể `stampbox` |
| Địa điểm | `plate: map` + `cutout` ảnh nơi đó + `tack` + `scribble circle` + `strip` tên nơi |
| Người | `cutout` ảnh chân dung (`focus` vào mặt), `offset: "red"`; nhân vật chính có thể đặt trên `shape triangle` đỏ (poster duotone) |
| Đồ vật, giấy tờ | `cutout` ảnh vật, hoặc `doc` (tài liệu, một dòng tô vàng) |
| Liên hệ, nghi vấn | `plate: cork` + 2–3 `cutout` nhỏ + `yarn` (dây đỏ) + `stampbox` |
| Số liệu | `bigstat` (số đếm lên + nhãn), `chart` (một đường đỏ hoặc cột, cột nổi bật màu đỏ), `icons` (lưới người, vài người đỏ: "3 trên 10") |
| Diễn biến nhiều mốc | `timeline` (đường chấm, năm đỏ so le) |
| Câu chốt, tên chương | `headline` (chữ cô đặc khổng lồ, dải vàng hoặc đỏ quét sau) |
Gợi ý từ bảng "Vox visual styles": dữ liệu đi với 3–4 (mixed-media, annotated data viz), giấy tờ với 8 (document forensics), lịch sử với 5 hoặc 15 (archival timeline, vintage newsprint chaos), câu chốt với 14 (kinetic typography).

**Ảnh thật:** tải bằng `python3 studio/tools/commons.py projects/<slug>/photos "File:…"`, điền tác giả và giấy phép vào `commons.json`, ghi `credit` cho mọi `cutout` dùng ảnh (engine in nhỏ dưới mép ảnh). Không có ảnh phù hợp thì dùng `silhouette`, `shape`, `doc`, `icons` thay vì bịa hình. Ảnh người đã tách nền (PNG có alpha) thì `shape: "alpha"` để có viền trắng ôm dáng.

Định dạng chi tiết các phần tử: `studio/engine/SCENE_FORMAT.md`, mục "Phong cách cắt dán". Phim mẫu: `projects/_demo-cat-dan/scene.json`.

## 4. Giọng đọc (`long-tieng`)
Giọng nam trầm vừa, đều, hơi nghiêm, ít lên xuống cảm xúc, như người dẫn phim tài liệu. Câu mở lạnh là đoạn quan trọng nhất: nghe lại kỹ, thu lại nếu đọc vội. Tempo mặc định 1,2 của QBK có thể giảm còn 1,1 nếu thấy mất vẻ điềm tĩnh (ghi vào `notes.md`). Âm thanh: chỉ tiếng giấy tự động của engine và tiếng phòng nhẹ; nhạc nền nếu có thì rất nhỏ (gain ≤ 0,05).

## 5. Ảnh bìa (`phat-hanh`)
Cùng thế giới giấy báo nhưng **to và gắt hơn**, đọc được khi chỉ rộng 200 px. Dựng một scene 1 shot rồi render 1 khung, hoặc dùng `--from/--to` trên phim:
- Một `cutout` chủ thể lớn, tương phản mạnh (`contrast` 1,6), `offset: "red"`, dải đen che mắt nếu là người vô danh.
- Tối đa **2 khối chữ, mỗi khối tối đa 3 chữ**, viết hoa cô đặc khổng lồ (`headline` với `bg: "red"` hoặc `"yellow"`, và một `stampbox`). Chữ lấy từ hook: "MẤT TÍCH", "LỘ DIỆN", "TÌM THẤY", năm, số tiền.
- Một điểm nhấn đỏ hoặc vàng: vòng bút dạ (`scribble circle`), khung dấu mộc hoặc gạch chân.
- Nền giấy báo, mảnh xé tràn mép khung, không chi tiết nhỏ, không logo, không watermark.

## 6. Kiểm định thêm cho phong cách này (`kiem-dinh`)
- Mở lạnh có đủ ngày, địa điểm, hành động; câu cuối là câu treo theo một trong năm khuôn.
- Mỗi shot đúng một vật chính, nhãn chữ không quá 4 chữ, chỉ một màu đỏ nhấn.
- Mọi `cutout` dùng ảnh thật có `credit` khớp `commons.json`.
- Không có hình ảnh gây sốc hoặc chế giễu nạn nhân.
