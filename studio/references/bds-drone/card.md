# BĐS flycam neon (mẫu TikTok @hbnmediabds1, người dùng gửi 17/11/2026)

- Mẫu: "Kẻ đường và ghim vị trí trên CapCut trong 30 giây ???", 16,8 s, 576×1024, 30 fps, 10,5 nghìn lượt xem. Dựng bằng CapCut. Ảnh khung: `contact.png`; đo máy: `analysis.json`; Gemini nghe và xem: `phan-tich-gemini.md`.
- Phong cách engine: **`bds-drone`** (`lib/bds.mjs`). Scene mẫu: `studio/engine/examples/bds/build_drone.py`.

## Đặc trưng mẫu (đo trên từng khung)
- **Nền**: một cảnh flycam liền, không cắt (0 lần cắt), máy bay chếch ~55°, nhìn dọc một đại lộ có dải phân cách chạy thẳng lên chân trời ở giữa khung. Trời xanh mây tích chiếm ~32% trên. Máy trôi rất chậm về trước. Sau 1,8 s cả hình ngả xanh lạnh (phủ lớp xanh nhẹ).
- **Tiêu đề hook** (0–1,8 s): Montserrat Black chữ hoa đầu từ, 3 dòng giữa khung ở y ≈ 23–31%, từ khóa **vàng #FFD21F**, còn lại trắng, viền tối mảnh + bóng. Câu hỏi kết bằng "???". Mờ đi lúc 1,8 s.
- **Kẻ đường neon**: xanh ngọc #2DF5C6, quầng sáng rộng ~3 lần nét, lõi gần trắng, có **luồng sáng trắng chạy dọc** liên tục. Vẽ dần từ chân khung lên (1,8 → 3,0 s): đại lộ giữa + 2 đường chéo hai bên.
- **Ghim "CĂN NHÀ"** có từ đầu: giọt nước **vàng ánh kim** (gradient vàng nhạt → vàng cam → nâu vàng), lõi tròn trắng có icon nhà, vòng elip cam dưới chân. Nhãn **vàng nghiêng** đậm, viền nâu sẫm, đặt trên đỉnh ghim.
- **Thẻ ảnh tiện ích** (3,2 s và 4,5 s): chấm trắng ở mặt đất → đường dẫn trắng mảnh chéo lên → **khung trắng mở dần** (viền 3 px) → ảnh thật hiện → **thanh tên xanh #1463DC** chữ trắng in hoa, viền trắng, nằm đè đáy ảnh. Hai thẻ cùng thu lại lúc 6,5 s.
- **Ghim tiện ích** (7,5 / 8,2 / 8,8 s, cách nhau ~0,6 s): giọt nước **vàng phẳng #FFE53A**, lõi trắng icon xám (giỏ hàng, trường, dao nĩa), elip trắng dưới chân, nảy lên (back-out) kèm vòng lan. Nhãn vàng in hoa viền đen. Ghim xa nhỏ hơn (~70%).
- **Watermark** "HBN MEDIA" trắng đậm nhỏ ở trái, y ≈ 80%. Kết bằng **mờ về đen** 15 → 16 s.
- **Âm thanh**: không lời đọc. Nhạc EDM/tech house ~125 BPM. Whoosh laser khi kẻ đường, pop khi thẻ và ghim hiện.

## QBK làm thế nào
- Không có flycam: **dựng góc nhìn flycam từ ảnh vệ tinh Esri nghiêng** (`view.tilt` 55, `rot` để đại lộ chạy thẳng lên, `pivot` 500, `horizon` 540) + phần tử `sky` (trời, mây tích, sương xa). Ghim và đường neon bám toạ độ thật nên khớp đường phố. Có ảnh flycam thật (người dùng gửi, hoặc ảnh CC) thì dùng `bgphoto` + toạ độ `ip`/`ipts`.
- Phủ xanh lạnh và mờ về đen bằng `tint` với `track`.
- Watermark đổi thành "QBK MEDIA".

## Đã có trong engine
`bds-drone`, `sky`, `bgphoto`, `neon` (neon), `pin` gold/yellow, `card` bracket, `btext`, `tint`, phối cảnh `tilt/rot/pivot/horizon`.

## Còn thiếu
- Tòa nhà nổi khối 3D (vệ tinh nghiêng vẫn phẳng; nhìn kỹ thấy mái nhà "dán" xuống đất). Muốn giống tuyệt đối cần flycam thật.
- Ảnh flycam Việt Nam giấy phép mở: Wikimedia có "Một góc Đà Nẵng nhìn từ trên cao" (CC BY 2.0) nhưng tải bị chặn 429 khi làm thẻ này.
- Nhạc nền có giấy phép (engine chỉ có sfx tổng hợp).

## Hợp với
Nhà phố, đất nền trong đô thị, căn hộ gần trục đường lớn; video 15–30 s kiểu "vị trí + tiện ích quanh".

## Lưu ý
- Nhãn tiện ích (TRƯỜNG HỌC, SIÊU THỊ…) phải đúng công trình thật, có nguồn (OSM, Google Maps của chủ đầu tư) trong `sources.md`. Scene mẫu dùng nhãn chung chung để minh hoạ phong cách.
- Không dùng logo, watermark của kênh mẫu.
