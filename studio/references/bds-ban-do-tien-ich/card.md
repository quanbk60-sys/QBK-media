# BĐS: bản đồ tiện ích kiểu CapCut (2 mẫu người dùng gửi 10/11/2026)

- **Mẫu 1:** 28,7 s, 576×1024, "Biểu diễn tiện ích trên Map bằng CapCut" (kênh môi giới BĐS). Ảnh khung: `contact-1.jpg`, số đo `analysis-1.json`.
- **Mẫu 2:** 20,8 s, 576×1024, "Kẻ đường và ghim vị trí trên CapCut trong 30 giây" (kênh môi giới BĐS). Ảnh khung: `contact-2.jpg`, số đo `analysis-2.json`.
- Phong cách engine: **`bds-tien-ich`** (`lib/tienich.mjs` + `lib/geo.mjs`). Demo: `projects/_mau-bds-tien-ich/`.

## Đặc trưng
- **Nền:** mẫu 1 là ảnh vệ tinh nhìn thẳng (Google Earth), hơi tối (độ sáng 0,21, gần như không màu). Mẫu 2 là **flycam thật** nhìn nghiêng thấy chân trời, trời xanh mây trắng (độ sáng 0,40).
- **Ghim vàng kim loại** hình giọt nước, giữa là đĩa trắng có **icon** (nhà, chợ, trường học, siêu thị, nhà hàng, khách sạn, cây cầu). Nhãn **chữ vàng viết hoa, viền tối**, nằm ngay trên ghim (CĂN NHÀ, TRƯỜNG HỌC, SIÊU THỊ, NHÀ HÀNG, CHỢ, CÂY CẦU). Ghim **rơi xuống và nảy** khi hiện.
- **Đường neon phát sáng:** vàng (mẫu 1) hoặc xanh ngọc (mẫu 2), kẻ dọc theo đường thật, chạy từ mép khung vào. **Tên đường viết dọc theo đường** ("TRẦN ĐẠI NGHĨA"), chữ trắng to có quầng.
- **Vòng tròn mờ** quanh vị trí (bán kính tiện ích).
- **Khối 3D xanh mọc lên** trên lô đất, ghi diện tích "200m²" và vạch kích thước (mẫu 1, cận cảnh zoom sát).
- **Thẻ ảnh nhỏ** viền trắng có dải tên xanh ("Bar", "Chợ", "Tòa án", "Khách sạn") nối về điểm trên bản đồ bằng **đường nét đứt** hoặc đường mảnh.
- **Tên địa danh lớn** ("SÔNG CỔ CÒ") chữ trắng to có quầng vàng, hiện lên rồi tắt.
- Tiêu đề trên cùng 2 dòng trắng, **từ khóa vàng** (Map, CapCut, 30). Không phụ đề lời đọc (chỉ nhạc).
- **Nhịp:** gần như không cắt (1 cảnh dài 14–20 s), các lớp hiện dần theo nhịp nhạc, mỗi 1–2 s thêm một ghim. Mẫu 1 có đúng 1 cú zoom sát vào lô đất rồi zoom ra.
- **Âm thanh:** nhạc điện tử sôi động, bass mạnh, tiếng búng tay; không lời.

## Đã có trong engine (phong cách `bds-tien-ich`)
- Ghim kim loại có icon: phần tử `poi` (vàng, xanh, đỏ ruby, xanh lá, tím, xanh ngọc, cam, bạc; 20 icon), rơi và nảy, sóng lan, nhãn vàng viền tối có dòng phụ "cách dự án … km". Nhãn tự né mép khung.
- Đường neon: `route` với `neon: true` (quầng, thân màu, lõi trắng, vệt sáng chạy dọc), `name` viết tên đường dọc theo đường.
- Vòng bán kính: `rings` (theo km thật, tự tính theo mức zoom).
- Khối 3D lô đất: `block` (theo đa giác tọa độ hoặc kích thước m), nhãn diện tích, vạch kích thước.
- Thẻ ảnh có đường dẫn nét đứt: `pcard` (ảnh Wikimedia có ghi tác giả, hoặc icon khi không có ảnh).
- **Camera nghiêng 3D** (`tilt`) thay cho flycam: nhìn ảnh vệ tinh theo phối cảnh, có sương chân trời.

## Còn thiếu
- Flycam thật (mẫu 2): engine chỉ có ảnh vệ tinh. Thay bằng camera nghiêng 40–50°. Nếu người dùng có video flycam của dự án, cần thêm phần tử nền video và căn điểm bằng tay (chưa làm).
- Mây và trời xanh ở chân trời khi nghiêng mạnh (hiện là sương xanh nhạt).
- Hiệu ứng "đường chạy từ mép khung vào" đã có (grow), nhưng chưa có đường **dày dần theo phối cảnh** (đường gần to, xa nhỏ): hiện đường vẽ trên lớp mặt đất nên đã to nhỏ theo phối cảnh khi nghiêng.

## Hợp với
Giới thiệu dự án, lô đất, căn nhà: vị trí, tiện ích quanh nhà, đường lớn gần nhà, khoảng cách tới chợ, trường, bệnh viện.

## Lưu ý
- Không chép logo, tên kênh, watermark TikTok của mẫu.
- Ảnh vệ tinh Esri phải ghi nguồn (tự hiện góc trên phải). Tuyến đường từ OSRM ghi "© OpenStreetMap".
- **Không bịa vị trí, diện tích, khoảng cách.** Tọa độ từ người dùng hoặc nguồn kiểm chứng; km và phút lấy từ OSRM và ghi "ước tính". Vị trí tạm phải ghi "vị trí minh họa" trên video.
- Quảng cáo BĐS: không hứa lợi nhuận, không nói "sổ hồng", "pháp lý chuẩn" khi người dùng chưa đưa giấy tờ.

## Đề xuất làm đẹp (chưa làm, chờ người dùng chọn)
1. **Trời và mây ở chân trời** khi nghiêng mạnh (thay sương xanh nhạt), giống flycam mẫu 2. Công: nhỏ.
2. **Nhạc nền điện tử tự sáng tác** khớp nhịp ghim rơi (mẫu dùng nhạc bass + búng tay); mỗi ghim rơi đúng phách. Công: vừa.
3. **Bay qua từng tiện ích:** camera lia và nghiêng theo tuyến đường tới từng điểm rồi quay về dự án (hiện camera đứng yên ở dự án). Công: vừa.
4. **Ảnh thật của tiện ích** trong `pcard` (Wikimedia có ghi tác giả) thay cho icon. Công: nhỏ mỗi video.
5. **Tự tìm tiện ích quanh dự án** (trường, chợ, bệnh viện, metro) bằng Overpass: cần người dùng mở mạng tới `overpass-api.de`. Công: vừa.
6. **Nền flycam thật** khi người dùng gửi video dự án: chèn video làm nền, ghim và đường neon căn bằng tay theo vài điểm mốc. Công: lớn.
7. **Bộ nhận diện riêng** (màu kim loại, logo, font chủ đầu tư) theo từng dự án; kho icon riêng của người dùng thay cho icon vẽ code. Công: nhỏ khi có tư liệu.
