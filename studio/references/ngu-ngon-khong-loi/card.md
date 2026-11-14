# Ngụ ngôn không lời (mẫu TikTok @nhueit "Nhuệ youtube", người dùng gửi 14/11/2026)

- Mẫu: https://vt.tiktok.com/ZSp4U9NBM/ (id 7688198623586209031), "KẾT CỤC... của những người làm YouTube view ngoại", 46 s, **1024×576 (ngang 16:9)**, 70 nghìn lượt xem. Không lưu video gốc. Ảnh khung: `contact.png`, số đo: `analysis.json`. Bản QBK: `qbk-demo.png`, cảnh mẫu `studio/engine/examples/ngu-ngon-trang/` (`build.py` → `scene.json`, nhạc `music.wav` tự tổng hợp).
- Phong cách engine: **`ngu-ngon-trang`**.

## Đặc trưng mẫu
- **Hình:** video AI, nét đen xám trên **nền trắng tinh** (độ sáng 0,94, độ rực 0). Người que **một nét** (đầu tròn to, mặt biểu cảm rõ, thân là một đường), nhân vật chính đội **mũ phớt**, vác **rìu**. Phong cảnh vẽ đường nét chi tiết: sông, bờ đất, vách đá, rừng cây, cỏ, sỏi, đồi xa.
- **Một cảnh có màu duy nhất:** tấm bản đồ giấy cổ ("Bản đồ YouTube view ngoại", lộ trình 8 chặng) ở khoảng 20 s, đóng vai lời kêu gọi (tài liệu tự học của tác giả).
- **Cách kể: ẩn dụ bằng hình, không lời.** Biển "YOUTUBE VIEW NGOẠI" bên bờ sông. Đám đông lao xuống sông thì chết đuối, những người còn lại cười chỉ trỏ anh mũ phớt. Anh quan sát, suy nghĩ (bong bóng có đồng hồ, túi tiền, hồng tâm), xem bản đồ, chặt cây, đóng bè. Một người khác lao xuống thì chết đuối, anh chống bè qua sông trong ánh mắt sững sờ của đám đông. Kết bằng chữ nhỏ ở cuối.
- **Nhịp:** gần như **một cảnh liền**, máy quay lia và chuyển hình mềm (chỉ 2 lần cắt cứng ở 19,9 s và 21,5 s quanh tấm bản đồ). Mỗi "ý" khoảng 2–4 s.
- **Âm thanh:** chỉ có nhạc (âm thanh mượn từ kênh khác) và một tiếng "hửm" hoạt hình. Không thuyết minh, không phụ đề.

## Đã có trong engine (sau lần học này)
- Gói `ngu-ngon-trang`: nền trắng, nét đen mảnh (`lineScale` 0,72), bảng màu ép về trắng (cây, gỗ, nước đều là nét), hiện hình mờ dần, chuyển cảnh mờ 0,9 s, không phụ đề. **Tự bật người que một nét** (`castDefaults: {stick: true}`).
- Khung **ngang 16:9**: đặt `"width": 1920, "height": 1080`.
- Nhân vật: `stick: true` (thân một nét, tay chân mảnh, chấm tay), mũ `fedora`, đồ cầm `axe`.
- Đạo cụ: `river` (dòng sông có sóng chạy), `drowner` (người chới với, vẫy tay), `lineTree` (cây nét, tán lượn, đung đưa), `meadow` (đồi xa, cỏ, sỏi), `log`, `raft` (bè, `float` nhấp nhô), `signpost` (biển gỗ hai chân có chữ), `cliff` (bờ đá), `thinkIcons` (bong bóng suy nghĩ có biểu tượng clock, money, target, flag).
- Nhạc tự tổng hợp miễn phí: `studio/tools/nhac.py OUT.wav GIÂY --mood vui|tram|hoi-hop`.

## Còn thiếu
- Hình AI của mẫu chi tiết hơn (vách đá, rừng dày, bóng nước). Bản code gọn và sạch hơn, kém "giàu" hơn.
- Chuyển cảnh **biến hình liền mạch** (morph) như video AI: engine chỉ có mờ chéo và lia máy.
- Người nhảy xuống nước: hiện là ngã rồi đổi sang `drowner`; chưa có tia nước bắn lớn. Chặt cây: chưa có cây đổ nghiêng (dùng `stump` + `log` rơi xuống).
- Tấm bản đồ giấy cổ có màu: dùng ảnh (`image`/`photo`) hoặc vẽ thêm đạo cụ `treasureMap` khi cần.
- Nếu muốn giống hình AI hơn: làm biến thể "ảnh của bạn" (người dùng tạo tranh nét bên Gemini, đoàn phim dựng chuyển động, nhạc), như `tuong-da-anh`.

## Hợp với
Ngụ ngôn ẩn dụ về làm nghề, kinh doanh, kiếm tiền online, học tập, kỷ luật ("đám đông lao vào, người khôn đi đường chậm mà chắc"); video cho người xem không cần nghe tiếng (lướt không bật loa).

## Đề xuất
- Cấu trúc 5 nhịp: **cám dỗ** (biển hiệu + đám đông lao vào) → **hậu quả** (chết đuối, thất bại) → **người khác biệt** bị chê cười → **chuẩn bị** (suy nghĩ, công cụ, lao động) → **vượt qua** trong ánh mắt sững sờ, chữ chốt ngắn.
- 20–45 s, không thuyết minh. Chữ duy nhất là biển hiệu và một câu chốt. Nhạc vui nhẹ, sfx đúng hành động (nước bắn, chặt, búa).
- Vẫn có thể ra bản 9:16 bằng cách đặt khung ngang vào giữa (như `thi-nghiem`) nếu kênh cần dọc.

## Lưu ý
- Không chép nội dung mẫu (biển "YouTube view ngoại", bản đồ của tác giả). Bản QBK dùng ẩn dụ riêng ("Làm giàu nhanh").
- Ẩn dụ phải rõ và không chê bai một nhóm người cụ thể; tránh nhắc tên dịch vụ, cá nhân thật.
