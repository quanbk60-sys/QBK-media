---
name: video-bds
description: Quy trình làm video bất động sản (phong cách bds-tien-ich, bds) như một đoàn phim chuyên nghiệp - nhận yêu cầu và tư liệu từ app (ảnh, flycam, quy hoạch, video), phân loại và dùng đúng chỗ, đối chiếu vệ tinh, dựng cảnh, kết bằng zoom vào lô và khoanh diện tích, ghi nguồn mọi con số. Nhạy bén nhưng không bịa. Dùng cho mọi video BĐS, mọi vòng sửa, và khi người dùng gửi thêm ảnh hoặc video cho một video BĐS.
---

# Video bất động sản

Hai phong cách: `bds-tien-ich` (bản đồ tiện ích kiểu CapCut, `lib/tienich.mjs`, mẫu `projects/bds-can-tho/`) và `bds` (giới thiệu dự án có ảnh thật, cảnh quay cầm tay từ ảnh, thẻ thông số, dựng bằng `studio/tools/bds_build.py`, mẫu `projects/gioi-thieu-can-ho/`). Chọn theo tư liệu: có nhiều ảnh căn hộ/nội thất thì `bds`; nặng về vị trí, tiện ích, lô đất thì `bds-tien-ich`; trộn phần tử của cả hai trong một scene được.

Đọc kèm: `studio/lessons.md` (mục BĐS), `.claude/skills/doi-chieu-ve-tinh/SKILL.md`, `studio/engine/SCENE_FORMAT.md` (mục "Phong cách BĐS"). Mẫu đã làm: `projects/bds-can-tho/build_scene.py`.

## 1. Tinh thần làm việc
- **Nhạy bén:** tự nhìn ra điều người xem cần (đi đâu mất bao lâu, cạnh cái gì, hiện trạng ra sao), tự tìm tư liệu, tự chọn cảnh đẹp nhất trong video người dùng gửi, tự đề xuất cách làm hay hơn. Không chờ được dặn từng bước.
- **Không bịa:** mỗi chữ, mỗi con số trên hình thuộc một trong ba loại, và phải ghi đúng loại:
  | Loại | Ví dụ | Cách ghi |
  |---|---|---|
  | Đã kiểm chứng (có nguồn trong `sources.md`) | tên dự án, 43,8 ha, ngày cất nóc | ghi thẳng |
  | Ước tính bằng công cụ | km, phút (OSRM); diện tích đo trên vệ tinh | thêm "ước tính", "≈", hoặc dấu * kèm chú thích |
  | Minh họa | vị trí tạm, quy hoạch lệch, ảnh phối cảnh | ghi "minh họa", "ảnh phối cảnh" |
- **Không bao giờ** tự ghi giá, pháp lý (sổ hồng, sổ đỏ), tiến độ bàn giao, lợi nhuận, cam kết thuê nếu người dùng không đưa và không có nguồn chính thức.
- **Khi nào hỏi người dùng:** chỉ khi một điều chặn độ chính xác (tọa độ rơi giữa nhiều lô, hai nguồn mâu thuẫn về con số sẽ hiện trên hình, tư liệu không rõ có được phép dùng). Còn lại cứ làm và ghi vào báo cáo trong app những gì đã tự quyết.

## 2. Đầu vào từ app
- `requests/<id>`: yêu cầu (`brief` hoặc `topic`, `must`, `avoid`, `links`, `style`, `length`, `platform`), `attachments` = tệp đính kèm `[{id, name, kind: image|video|doc, role, note}]`.
  - `role`: `dung` (đưa vào video), `mau` (mẫu phong cách: chỉ học, không đưa vào), `tu-lieu` (tư liệu nội dung: dùng để hiểu và đối chiếu, đưa vào video khi hợp lý).
  - Tải tệp: `Artifact` action `read`, `url` của app, `path` = `id` của tệp. Lưu vào `projects/<slug>/user/` (ảnh nhỏ thì commit; video thì để trong `cache/` hoặc `user/` có .gitignore, không commit file trên 20MB).
  - `note` của người dùng (ví dụ "flycam lô A, quay tháng 9") là thông tin quý: ghi vào `sources.md` là "theo người dùng".
- Góp ý (`feedback`): sửa đúng mốc thời gian người dùng chỉ. Góp ý dùng chung cho mọi video BĐS thì thêm vào `studio/lessons.md`.
- Người dùng gửi thêm tư liệu cho video đã làm: đây là một vòng sửa. Xem tư liệu mới thay được cảnh nào (thường là cảnh hiện trạng hoặc cảnh kết), làm lại đúng cảnh đó, giữ nguyên phần đã duyệt.

## 3. Phân loại tư liệu và dùng vào đâu
| Tư liệu | Kiểm tra trước | Dùng vào |
|---|---|---|
| Tọa độ, link Google Maps | xem trên vệ tinh, đánh dấu lô nếu mơ hồ | ghim dự án, tâm camera, đoạn kết |
| Quy hoạch 1/500, mặt bằng phân lô (nhìn thẳng) | nắn bằng `georef.py`, xem `rmse_m` | phần tử `overlay` phủ dần lên vệ tinh; mã lô, tên khu |
| Flycam video | `ffprobe` (độ dài, khung hình), `python3 studio/tools/analyze_ref.py <video> <thư mục tạm>` xem ảnh khung và điểm cắt | phần tử `clip`: chọn 2–4 đoạn 2–4 s đẹp nhất (bay qua dự án, lộ hồ, lộ đúng lô); đoạn chuyển động chậm, không rung |
| Flycam ảnh, ảnh thực tế | xác định lô trên ảnh bằng mốc chung với vệ tinh | `photo` (full, kenburns) + `frame` khoanh lô |
| Ảnh phối cảnh, mẫu nhà | là phối cảnh, không phải ảnh thật | `pcard` hoặc `photo` có chữ "ảnh phối cảnh" |
| Video quay nhà, nội thất | chọn đoạn sáng, không có mặt người lạ | `clip` `fit: band` hoặc cover; cảnh giới thiệu sản phẩm |
| Bảng giá, tài liệu pháp lý | chỉ dùng khi người dùng muốn đưa lên | thẻ `info` hoặc `checklist`, ghi "theo chủ đầu tư" |
- Video ngang 16:9: `fit: 'band'` khi muốn thấy cả khung (nền mờ tự tạo); `fit: 'cover'` + `focus` khi muốn phủ kín (cắt hai bên, đặt `focus` vào lô).
- `frame` là khung tĩnh: trên `clip` đang bay, chỉ đặt khung ở đoạn camera gần như đứng yên, hoặc thêm `to` để khung tắt trước khi lệch.
- Không tìm được tư liệu: tự tìm theo `doi-chieu-ve-tinh` (quy hoạch, flycam, báo). Không có thì dựng hoàn toàn bằng vệ tinh, không bịa hình.

## 4. Cấu trúc video mặc định (20–35 s, không lời đọc trừ khi người dùng muốn)
1. Mở: từ trên cao bay xuống khu (vệ tinh, `tilt` 12° → 40°), tên dự án và khu vực.
2. Quy hoạch hoặc tổng thể: `overlay` quy hoạch (nếu có) và ghim dự án.
3. Hiện trạng: flycam (`clip`) hoặc ảnh flycam (`photo`), khoanh lô bằng `frame`.
4. Kết nối: đường neon tới 3–4 tiện ích thật (OSRM), nhãn km và phút, `checklist`.
5. **Kết (bắt buộc): zoom sát vào lô hoặc dự án** (vệ tinh z18, `tilt` 45–52°), **khoanh vùng** bằng `area` phát sáng (đa giác dò trên vệ tinh hoặc từ quy hoạch đã nắn), nhãn diện tích (số của người dùng, hoặc "≈ … m²*" đo ước tính), `cta`.
- Mỗi cảnh 3–7 s. Chữ trong vùng an toàn (cách mép 40 px, phụ đề và thẻ trong y 1150–1600).
- Âm thanh: **không dùng tiếng hiệu ứng** (`whoosh`, `pop`… người dùng gọi là "sẹt sẹt", "rẹt rẹt"); không thuyết minh trừ khi người dùng muốn. **Nhạc nền tự sáng tác** bằng `studio/tools/music.py` (xem cách dùng trong file), trộn vào bản dựng.

## 5. Ghi nguồn và bản quyền
- `sources.md`: mọi chữ trên hình, mọi con số, mọi ảnh và video (ai giữ bản quyền, tải từ đâu, ngày).
- Ảnh, video của người dùng: ghi "theo người dùng". Của chủ đầu tư, báo, kênh khác: ghi nguồn nhỏ trên hình và **hỏi người dùng có quyền dùng** trước khi đưa vào bản đăng (nếu người dùng đã xác nhận một lần cho dự án đó thì ghi vào `notes.md` và không hỏi lại).
- Không tải video từ YouTube, TikTok của người khác để đưa vào video.

## 6. Kiểm tra trước khi gửi duyệt
- Xem 6–8 khung (mỗi cảnh một khung, thêm khung cuối): nhãn không đè nhau, không tràn mép, khung `frame` đúng lô, `area` đúng khối nhà.
- Mọi con số trên hình có trong `sources.md` hoặc có chữ "ước tính".
- Tải lên app (`videos/<slug>`), `report` ghi: đã tự quyết điều gì, con số nào là ước tính, tư liệu nào chưa rõ quyền dùng.
