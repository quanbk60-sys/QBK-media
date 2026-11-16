---
name: doi-chieu-ve-tinh
description: Tìm thông tin và hình ảnh của một địa điểm hoặc dự án bất động sản trên web (quy hoạch 1/500, mặt bằng phân lô, phối cảnh, ảnh flycam tiến độ, bài báo), rồi đối chiếu với ảnh vệ tinh để xác định đúng lô, đúng công trình và hiện trạng mới nhất. Nắn ảnh quy hoạch khớp vệ tinh bằng studio/tools/georef.py để phủ lên bản đồ trong video. Dùng khi người dùng gửi tọa độ hoặc tên dự án, khi ảnh vệ tinh đã cũ, hoặc trước khi làm video phong cách bds / bds-tien-ich.
---

# Tìm thông tin địa điểm và đối chiếu với vệ tinh

Người làm: **biên kịch** (tra cứu, ghi nguồn) và **đạo diễn** (nắn ảnh, dùng trong scene). Ví dụ đã làm: `projects/bds-can-tho/`.

## 1. Xem điểm trên vệ tinh
```bash
python3 studio/tools/satmap.py projects/<slug>/sat --level 18:LAT,LON:1400x1400 --level 16:LAT,LON:2000x2000 --level 13:LAT,LON:2000x2400
python3 studio/tools/satgrid.py projects/<slug>/sat/satmap.json 16 out.jpg --step 0.002 --crop LAT0,LON0,LAT1,LON1
```
- Tọa độ người dùng gửi thường rơi trên mép đường: đánh dấu các lô quanh điểm (A, B, C…) và **hỏi người dùng chọn**, đừng đoán.
- Tên đường gần nhất (miễn phí): `curl "https://router.project-osrm.org/nearest/v1/driving/LON,LAT?number=3"` (trường `name`, dữ liệu © OpenStreetMap).

## 2. Tìm thông tin và ảnh trên web
- `WebSearch` với: tên khu hoặc dự án + "quy hoạch 1/500", "mặt bằng phân lô", "flycam", "hình ảnh thực tế", "tiến độ" + năm hiện tại. Tìm cả công trình trong khu (nhà ở xã hội, trường, tiện ích).
- Tải trang bằng `curl -L -A 'Mozilla/5.0'` (chỉ được với trang đã mở mạng; xem bên dưới). Lấy đường dẫn ảnh từ thẻ `<img>` và chú thích (`alt`, `title`, dòng chữ ngay sau ảnh).
- **Mẹo cafeland.vn:** ảnh nằm ở `static1.cafeland.vn` (chưa mở mạng) nhưng tải được qua máy chủ chính: `https://cafeland.vn/image-data/<rộng>-<cao>/static1.cafeland.vn/<đường dẫn ảnh>` (đặt rộng, cao bằng 2 lần kích thước ghi trong thẻ `img` để lấy ảnh nét, giữ đúng tỉ lệ).
- Trang đang mở mạng (môi trường QBK-media): cafeland.vn, znews.vn, vneconomy.vn, news.laodong.vn, www.namlongvn.com, thuvienphapluat.vn, batdongsan.com.vn, guland.vn. Trang khác bị chặn thì **xin mở mạng** (update_environment, đúng tên máy chủ), không tự đi đường vòng.
- Lưu ảnh tìm được vào `projects/<slug>/ref/`, ghi vào `sources.md`: URL trang, URL ảnh, chú thích, ngày đăng, ai giữ bản quyền.

## 3. Phân loại ảnh và đối chiếu
| Loại ảnh | Dùng để | Cách đối chiếu |
|---|---|---|
| Quy hoạch 1/500, mặt bằng phân lô, ảnh chụp **thẳng từ trên** | Tên khu, mã lô, ranh, chức năng đất | Nắn bằng `georef.py` (bước 4), xem ảnh `-check.jpg` |
| Flycam, ảnh chụp nghiêng | **Hiện trạng** (đã xây gì, đến tầng mấy), so tuổi ảnh vệ tinh | Bằng mắt: tìm 3–4 mốc chung (hồ, ngã tư, công trình lớn) rồi chỉ ra lô trên ảnh |
| Phối cảnh 3D, mẫu nhà | Minh họa sản phẩm | Không đối chiếu được; luôn ghi "ảnh phối cảnh" |
- **So tuổi ảnh:** công trình có trên ảnh này mà không có trên ảnh kia cho biết ảnh nào mới hơn. Ghi kết luận vào `notes.md` (ví dụ: "vệ tinh Esri mới hơn flycam cafeland vì đã có 4 tháp đang xây").
- **Quy hoạch có thể khác thực tế** (bản điều chỉnh, hồ xây khác bản vẽ). Lệch nhiều thì tin ảnh vệ tinh và flycam cho hiện trạng, chỉ dùng quy hoạch để gọi tên.

## 4. Nắn ảnh quy hoạch khớp vệ tinh
```bash
python3 studio/tools/georef.py projects/<slug>/ref/quy-hoach.jpg projects/<slug>/sat/satmap.json 16 projects/<slug>/geo \
  --name quy-hoach --key-white --pt PX,PY:LAT,LON --pt ... (≥ 4 điểm, nên 6: góc ranh khu, ngã tư lớn, đầu hồ)
```
- Điểm mốc rõ nhất: góc ranh khu (đường bao), ngã tư đường lớn, đầu cầu, mép kênh. 4 điểm thì khớp tuyệt đối (không biết sai số); thêm điểm để có `rmse_m`.
- `rmse_m` dưới ~5 m: dùng được tới cấp lô. 5–15 m: cấp khu. Lớn hơn: chọn lại điểm, hoặc kết luận bản vẽ khác thực tế (ghi rõ).
- Trong scene: phần tử `overlay` (`path`: `geo/quy-hoach.json`, `alpha`, `reveal`) phủ quy hoạch lên bản đồ, nghiêng theo `tilt`. Xem SCENE_FORMAT.md.
- Muốn biết điểm nằm ở đâu trên bản vẽ: dùng ma trận nghịch (xem `fit`, `apply` trong georef.py) để đổi tọa độ ra pixel bản vẽ, cắt vùng quanh đó để đọc mã lô.

## 5. Báo người dùng (kèm ảnh)
- Lô hoặc công trình là gì, theo nguồn nào; ảnh nào mới nhất; ảnh vệ tinh cũ hay mới so với flycam.
- Ảnh nào **dùng được trong video**: ảnh của chủ đầu tư hoặc báo có bản quyền. Chỉ đưa vào video khi người dùng xác nhận có quyền dùng (ví dụ môi giới được chủ đầu tư cấp tư liệu); nếu không thì chỉ dùng để đối chiếu, video dùng vệ tinh Esri và hình vẽ code.
- Không ghi lên video điều gì chưa có nguồn (giá, pháp lý, tiến độ bàn giao).
