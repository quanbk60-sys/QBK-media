# Nguồn · nam-long-2-earth (demo bds-hanh-trinh)

## Dự án (chép từ projects/bds-can-tho/sources.md, kiểm chứng 10/11/2026)
- Nam Long II Central Lake, 43,8 ha, phường Hưng Thạnh, quận Cái Răng, Cần Thơ, chủ đầu tư Nam Long: https://cafeland.vn/du-an/nam-long-ii-central-lake-du-an-khu-dan-cu-tai-can-tho-4401.html
- Hồ trung tâm: quy hoạch 1/500 và ảnh vệ tinh (bds-can-tho/notes.md).
- Khu nhà ở xã hội EHomeS trong dự án: https://e.vnexpress.net/news/business/nam-long-breaks-ground-on-671-ehomes-social-housing-units-in-can-tho-4908683.html
- Ranh khu: 4 góc bản quy hoạch 1/500 đã nắn khớp vệ tinh (rmse 45 m), gần đúng. Khối EHomeS: dò trên ảnh vệ tinh Esri z18.

## Tọa độ điểm đến
- Chợ nổi Cái Răng (10.0040, 105.7468), Đại học Cần Thơ cổng B (10.02989, 105.76968), Bến Ninh Kiều (10.03490, 105.78903): bds-can-tho/sources.md (đã đối chiếu ảnh Esri z17 và OpenStreetMap).
- Bảo tàng Cần Thơ (10.0352, 105.7867): Wikidata, qua trang Commons "Category:Can Tho Museum" (truy cập 16/11/2026).
- Sân bay quốc tế Cần Thơ (10.085277, 105.711944): Wikidata, qua trang Commons "Category:Can Tho International Airport" (truy cập 16/11/2026).
- Đã bỏ Cầu Cần Thơ: tọa độ giữa sông, OSRM cho tuyến vòng 13,6 km (bất thường).
- Chưa có điểm y tế: chưa tra được tọa độ bệnh viện có nguồn (OpenStreetMap, Wikipedia bị chặn từ máy này).

## Khoảng cách, thời gian
- `routes.json`: OSRM driving (router.project-osrm.org, dữ liệu © OpenStreetMap), từ tâm ranh khu (9.995905, 105.782672), truy vấn 16/11/2026. Ước tính lúc đường vắng; ghi trên hình "ước tính theo OpenStreetMap (OSRM)".
  Chợ nổi Cái Răng 5,7 km 9 phút · Đại học Cần Thơ 6,1 km 8 phút · Bảo tàng Cần Thơ 6,2 km 8 phút · Bến Ninh Kiều 6,5 km 9 phút · Sân bay quốc tế Cần Thơ 15,3 km 20 phút.
- "Trong vòng 10 phút": cả 4 điểm gần đều ≤ 9 phút theo OSRM.

## Hình, tiếng
- Ảnh vệ tinh: Esri World Imagery (Esri, Maxar, Earthstar Geographics), studio/tools/satmap.py.
- Giọng: Gemini TTS, giọng Charon, 1,15x. Nhạc: studio/tools/music.py (tự sáng tác). Font: Oswald, Dancing Script (SIL OFL).
