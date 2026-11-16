# BĐS · Hành trình tiện ích (mẫu người dùng gửi 16/11/2026)

- **Mẫu:** TikTok @phandinh_phuc (7706782326990081288), 190,4 s, 576×1024, 30 fps. Giới thiệu dự án Norton Park (Bình Dương) theo câu hỏi "giá có đắt không": trả lời bằng số phút đi tới từng tiện ích, đo trên bản đồ thật.
- **Số đo máy** (`analysis.json`): độ sáng 0,23, độ bão hòa 0,08 (rất tối, gần như không màu), âm thanh có ở 99% thời lượng (lời đọc liên tục), −17,5 dB trung bình. **Chỉ 2 điểm cắt** trong 190 s (13,3 s và 186 s): cả video là **một chuyến bay liên tục** trên ảnh vệ tinh.
- **Ảnh khung:** `khung-00-48s.jpg` … `khung-144-190s.jpg` (mỗi 2 s một khung), `chi-tiet-1.jpg`, `chi-tiet-2.jpg` (độ phân giải gốc).
- **Phong cách engine:** `bds-hanh-trinh` (`studio/engine/lib/hanhtrinh.mjs`). Demo: `projects/nam-long-2-earth/`.

## 1. Cấu trúc kể chuyện (190 s)
| Thời gian | Phần | Nội dung hình |
|---|---|---|
| 0–13 s | Mở | Lao từ trên cao (nhòe phóng tâm) xuống dự án. Tên dự án **chữ đậm hẹp vàng cam** trên cùng, 2 chip địa chỉ (pill tối viền mảnh), tên phường viết nghiêng trắng trên **viền phường xanh lá**. Ghim nhà màu cam. |
| 13–30 s | Liền kề, đối diện | Viền xanh dương (AEON Mall) và viền xanh lá (sân golf) quanh dự án; thẻ thông tin dưới: "LIỀN KỀ DỰ ÁN · AEON MALL… · 120 m". Câu dẫn chữ viết tay "giá trị chính" + chữ đậm xanh lá "TẦM NHÌN & MẢNG XANH". |
| 30–48 s | Chương 1 · VIỆC LÀM (xanh dương) | Chữ dẫn viết tay "từ Norton Park đến" + chữ đậm "VIỆC LÀM & KHÁCH SẠN". **Thanh chuyên mục** xuất hiện trên cùng. Tuyến đường xanh dương chạy tới từng điểm. |
| 48–72 s | Chương 2 · MUA SẮM (cam) | Lotte Mart, vườn trái cây, chợ, MM Mega Market. |
| 72–96 s | Chương 3 · Y TẾ (đỏ hồng) | 3 bệnh viện, mỗi bệnh viện có dòng phụ (địa chỉ, quy mô 1.200 giường). |
| 96–140 s | Chương 4 · GIÁO DỤC (xanh lá) | Mầm non đến đại học, 9 điểm. |
| 140–165 s | Chương 5 · KẾT NỐI XA (tím) | Sân vận động, trung tâm hành chính, khu du lịch, sân bay Tân Sơn Nhất, chợ Bến Thành. |
| 165–178 s | Tổng kết | "TỪ 66 TRIỆU" (giá), rồi **vòng tròn vàng** quanh dự án, ngoài vòng tối đen; danh sách 4 dòng (thanh màu bên trái, nhãn trắng, số phút màu) và các ghim "COLUMBIA · 6 PHÚT"; chữ dẫn + "TRONG VÒNG 10 PHÚT". |
| 178–190 s | Kết | Camera **nghiêng 3D** nhìn dự án, chữ dẫn "con số khả thi chỉ một nhu cầu sống tốt" + "ĐƯỢC ĐO THẬT" + dòng nhỏ "không phải số trên bản đồ phối cảnh". |

Mỗi điểm đến là một nhịp 5–9 s: camera lùi (zoom out) cho vừa cả dự án và điểm đến → ghim điểm đến bật lên → **đường đi chạy từ dự án tới** → thẻ thông tin **đếm km theo độ dài đường đã chạy** → khi tới nơi, hiện số phút và dòng phụ → camera bay sang điểm kế (zoom nhòe khi đổi tầm xa).

## 2. Thành phần hình
- **Nền:** ảnh vệ tinh tối, giảm màu mạnh. **Đèn rọi (spotlight):** vùng quanh dự án và tuyến đường đang chạy sáng hơn, phần còn lại tối đi. Đây là thủ pháp chính, giúp mắt theo kịp đường đi.
- **Ghim dự án:** tròn cam ánh kim, icon nhà trắng, quầng cam; nhãn "NORTON PARK" chữ hoa vàng cam phát sáng ngay trên; dưới ghim là **vòng trắng mảnh** đánh dấu đúng lô; ranh lô viền cam.
- **Ghim điểm đến:** tròn màu chuyên mục, icon trắng (bệnh viện chữ thập, trường mũ tốt nghiệp, mua sắm túi, tòa nhà…), cuống nhỏ; nhãn pill tối viền màu chuyên mục, chữ hoa trắng ("COLUMBIA ASIA", "BV HẠNH PHÚC").
- **Thẻ thông tin** (dưới, rộng ~92% khung, y ≈ 62–83% chiều cao): nền xanh than gần đen trong suốt, **viền 2 px màu chuyên mục + quầng cùng màu**, bo góc ~14 px. Dòng 1: tên chuyên mục chữ hoa nhỏ giãn chữ, màu chuyên mục. Dòng 2: tên địa điểm **chữ đậm hẹp trắng viết hoa** (xuống 2 dòng khi dài). Dòng 3 (không bắt buộc): dòng phụ xám nhỏ. Dòng 4: **số km to màu chuyên mục** (đếm lên) + "KM" nhỏ trắng, vạch dọc mảnh, rồi **số phút** + "PHÚT".
- **Thanh chuyên mục** trên cùng: 5 pill "VIỆC LÀM · MUA SẮM · Y TẾ · GIÁO DỤC · KẾT NỐI", pill đang xem sáng màu chuyên mục, pill khác nền màu đó rất tối.
- **Chữ chương:** dòng viết tay trắng nhỏ ("mua gì, ở đâu", "khi cần", "cho con đi học", "đi xa hơn") + **chữ đậm hẹp to màu chuyên mục, quầng cùng màu**.
- **Tuyến đường:** đường sáng màu chuyên mục, lõi trắng, đầu là chấm trắng; chạy dọc đường thật (OpenStreetMap).
- **Vòng tổng kết:** vòng tròn vàng chanh phát sáng, ngoài vòng phủ tối gần đen; danh sách 4 dòng có thanh màu bên trái.
- **Ghi nguồn** dòng rất nhỏ ở đáy: "Tiles © Esri … Data © OpenStreetMap".

## 3. Màu chuyên mục
| Chuyên mục | Màu |
|---|---|
| Dự án, tiêu đề | vàng cam `#FFC23A` → cam `#FF9A2A` |
| Việc làm | xanh dương `#4FC3FF` |
| Mua sắm | cam `#FF8A3D` |
| Y tế | đỏ hồng `#FF4D6D` |
| Giáo dục | xanh lá `#4CE36B` |
| Kết nối xa | tím `#D266FF` |
| Vòng tổng kết | vàng chanh `#E8F04A` |

## 4. Chữ
- Tiêu đề, tên địa điểm, số: **chữ đậm hẹp** kiểu Bebas/Anton (engine dùng **Oswald** OFL, đủ dấu tiếng Việt).
- Chữ dẫn: **chữ viết tay** (engine dùng **Dancing Script** OFL).
- Chip, nhãn ghim: chữ không chân đậm (Inter Bold có sẵn).

## 5. Âm thanh
- Lời đọc nam, giọng trò chuyện, chậm rãi, liên tục suốt video. **Không phụ đề**: chữ trên hình là từ khóa và số liệu. Nhạc nền rất nhỏ (gần như không nghe).

## 6. Đã có trong engine (`bds-hanh-trinh`)
`spot` (đèn rọi theo điểm và tuyến đường), `homepin` (ghim dự án + nhãn + vòng lô), `catpin` (ghim điểm đến + nhãn pill), `infocard` (thẻ thông tin, đếm km theo tuyến), `tabs` (thanh chuyên mục), `chaptitle` (dòng viết tay + chữ đậm phát sáng), `ringzone` (vòng tổng kết, ngoài vòng tối), `legend` (danh sách có thanh màu), `chips` (chip địa chỉ), `titleglow` (tiêu đề vàng cam). Dùng chung `route` neon, `outline` (viền neon), chuyển cảnh `zoomblur`, camera nghiêng `tilt`.

## 7. Còn khác mẫu
- Ranh phường: chưa có công cụ tải đa giác ranh giới (OpenStreetMap bị chặn trên máy này).
- Mẫu đổi camera mượt giữa các điểm trong một cảnh liền; engine ghép nhiều shot nối tiếp cùng view nên nhìn liền, nhưng không lia cong theo đường.

## 8. Lưu ý khi làm
- **Số km, số phút:** tính bằng `studio/tools/osrm.py` (đường xe, lúc đường vắng), ghi "ước tính theo OpenStreetMap" trên hình.
- **Tọa độ** chỉ lấy từ nguồn kiểm chứng (người dùng, Wikidata qua Commons, dò trên vệ tinh), ghi vào `sources.md`. Không có tọa độ thì bỏ điểm đó, không đoán.
- **Giá, pháp lý, tiến độ:** chỉ nói khi người dùng đưa hoặc có nguồn chính thức. Mẫu nói giá "từ 66 triệu/m²"; demo không nói giá.
- Không chép tên kênh, logo, watermark của mẫu.
