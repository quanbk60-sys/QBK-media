# Bài học của đoàn phim QBK

Mọi agent **đọc file này trước khi làm việc**. Nhà sản xuất thêm bài học mới sau mỗi vòng góp ý của người dùng. Mỗi dòng là một quy tắc ngắn, ghi kèm nguồn.

## Giọng đọc
- Giọng Gemini Bodi ở tốc độ gốc **quá chậm**. Mặc định tăng tốc **1,2 lần** bằng `studio/tools/retime.py` (giữ cao độ). *(Rùa và Thỏ, góp ý của người dùng)*

## Âm thanh
- **Không dùng tiếng bút sột soạt** khi bàn tay vẽ (engine đã mặc định `scribbleGain: 0`). *(Rùa và Thỏ)*
- Tiếng `pop` không được đặt trùng đầu câu thoại quan trọng. Đặt sớm hơn khoảng 0,15 giây. *(QA Rùa và Thỏ)*

## Hình ảnh
- Bàn tay vẽ không được che phụ đề. Engine tự lật bàn tay khi vẽ ở thấp, nhưng đạo diễn vẫn nên tránh vẽ trong vùng y 1100–1470. *(QA Rùa và Thỏ)*
- Keyframe camera đầu tiên phải ghi rõ `x`, `y`. *(QA Rùa và Thỏ)*
- Đuôi bóng nghĩ hoặc bóng nói không được chạm mặt nhân vật. Đặt bóng cao và lệch hẳn khỏi đầu. *(QA Rùa và Thỏ)*
- Nhân vật và khán giả cách lề tối thiểu 40px. *(QA Rùa và Thỏ)*

## Nội dung
- Truyện ngụ ngôn: đọc tên tác giả theo phiên âm tiếng Việt (Ê-dốp), nói "tương truyền", không khẳng định. *(Rùa và Thỏ)*

## Phong cách vệ tinh (`ve-tinh`)
- Người dùng chọn "Vệ tinh · ảnh thật" trong app thì **không vẽ người que**. Dùng ảnh vệ tinh Esri (`studio/tools/satmap.py`) và ảnh thật Wikimedia (`studio/tools/commons.py`). Làm theo `studio/references/ve-tinh-anh-that/card.md`, mẫu `projects/bach-dang-ve-tinh/build_scene.py`. *(Người dùng, 09/11/2026)*
- Đường sông, đường tiến quân, ghim phải **dò lại trên ảnh vệ tinh** (`satgrid.py`, chồng đường lên ảnh z14) trước khi render. Bản đầu Bạch Đằng vẽ đường cắt ngang đất liền. *(Bạch Đằng ve-tinh)*
- Ảnh thật chỉ dùng khi rõ tác giả và giấy phép (CC0, PD, CC BY, CC BY-SA), ghi ngay dưới ảnh và trong publish.md. API Commons hay báo 429 thì tra trang File: bằng tìm kiếm web, tải ảnh từ upload.wikimedia.org. *(Bạch Đằng ve-tinh)*
- Vị trí không có nguồn chính xác (bãi cọc, hướng tiến quân) thì ghi "minh họa" hoặc "gần đúng" trên hình. *(Bạch Đằng ve-tinh)*
- Bản đăng: nén lại khoảng 1,65 Mbps và chuẩn hóa âm lượng về −14 LUFS (ảnh vệ tinh làm file gốc nặng 70MB). Không commit file gốc. *(Bạch Đằng ve-tinh)*
- Mô tả đăng bài không được nói quá kịch bản (ví dụ "cả ba trận đều dùng cọc" là sai). *(Bạch Đằng ve-tinh)*

## Bất động sản (`bds-tien-ich`, `bds`) (người dùng, 10/11/2026)
- **Không dùng tiếng hiệu ứng** (người dùng gọi là "sẹt sẹt", "rẹt rẹt": cả `whoosh` lẫn `pop`). Video BĐS mặc định không thuyết minh, chỉ **nhạc nền** (`studio/tools/music.py`, nhạc tự sáng tác). *(video mẫu BĐS + Giới thiệu căn hộ vòng 5, 6)*
- **Đoạn kết luôn zoom vào dự án hoặc lô đất và khoanh vùng diện tích** (vệ tinh z18, `area` phát sáng, nhãn diện tích). *(video mẫu BĐS)*
- Ảnh vệ tinh Esri có thể cũ; tìm ảnh quy hoạch, flycam trên web và **đối chiếu** trước khi dựng (skill `doi-chieu-ve-tinh`). Lô A Cần Thơ ban đầu bị gọi nhầm là "nhà phố", đối chiếu flycam mới ra là chung cư nhà ở xã hội. *(bds-can-tho)*
- Diện tích tự đo trên vệ tinh phải ghi "≈ … m²*, đo ước tính". Km, phút ghi "ước tính OSRM". *(bds-can-tho)*
- Người dùng gửi thêm ảnh hoặc video: làm theo skill `video-bds` (phân loại, dùng đúng cảnh, làm lại đúng cảnh đó). *(người dùng, 10/11/2026)*

## Phong cách phải khác nhau thật (người dùng, 09/11/2026)
- "Các phong cách giống hệt nhau, chỉ khác nền" là lỗi. Mỗi phong cách có ngữ pháp riêng (nét, cách tô, cách hiện hình, chuyển cảnh, phụ đề), xem SCENE_FORMAT.md, mục "Ngữ pháp phong cách". Đạo diễn còn phải đổi cả bố cục và nhịp cho hợp phong cách.
- Học từ mẫu 3D thực tế thì dựng bằng `studio/engine3d/`, không thay bằng nét vẽ trên giấy. Video làm đá bản nét vẽ đã bị người dùng chê "khác hoàn toàn mẫu".

## Vận hành
- **Tiết kiệm hạn mức:** dựng video ở session mới (do app gọi), không trong chat dài. Biên kịch dùng Sonnet (Opus chỉ cho chủ đề nhạy cảm), đạo diễn kiêm dựng phim, kiểm định nhẹ, họa sĩ chỉ khi thiếu đồ. *(Người dùng, 08/11/2026)*

- **Cảnh chuyển động tới trước (đạp xe, đi bộ, bay):** mọi chi tiết trên mặt đất phải trôi theo phối cảnh. Không để lớp nền có họa tiết đứng yên dưới vật đang chạy, nếu không vật trông như trượt trên nền (góp ý phong cách phong-canh-3d, 09/11/2026). Vật mọc trên đất cần bóng dưới gốc.
- **Nhân vật ảnh AI phải cử động đúng việc đang làm** (góp ý 09/11/2026: người đạp xe mà chân đứng yên). Ảnh AI là ảnh tĩnh: tách lớp (thân trên, xe) và vẽ phần chuyển động bằng code ở giữa (chân đạp, tay vẫy), cùng màu với ảnh. Xem `drawLegs` trong `studio/engine3d/phong-canh.mjs`, lớp `cyclist-top.png`, `cyclist-bike.png`.
- **Không đổi phong cách của mẫu sang người que** (09/11/2026: mẫu "Người thật" là người thật nói chuyện, một phiên đã thay bằng người que, người dùng rất không hài lòng). Mẫu người thật hoặc ảnh AI thì dựng bằng ảnh AI Gemini với nhân vật studio tự tạo, code lo chuyển động. Làm không đủ thì nói rõ, không lặng lẽ thay phong cách.
- **Kênh không làm người thật** (người dùng chốt 09/11/2026). Nhân vật người luôn vẽ kiểu anime, kể cả khi mẫu là người thật. Phong cách người dẫn như thật đã gỡ.
- **Phong cách động thì video phải động** (09/11/2026, video "Cô bé và chú thỏ" ra 6 ảnh tĩnh chỉ zoom/lia, người dùng không chấp nhận). Phong cảnh anime phải dựng bằng `studio/engine3d/phong-canh.mjs`: nhân vật đi trong thế giới chuyển động, tay chân cử động bằng code. Tranh AI chỉ là nguyên liệu (nền, nhân vật tách lớp), không phải từng khung hình.
- **Quy trình v3 (10/11/2026):** 4 phong cách, mỗi phong cách một dây chuyền, chỉ gọi đúng agent cần. Duyệt ở bước rẻ (kịch bản, dự toán, bản dựng thô) trước bước đắt (quay Omni). Không làm thử bằng tiền.
- **Duyệt dự toán phải kéo theo nâng trần** (09/11/2026: phim Cô bé và chú thỏ đã được duyệt 4,97 USD nhưng bị dừng ở bước Mỹ thuật vì trần ảnh cũ 1,06 USD). Ngay khi người dùng duyệt chi phí, cập nhật `studio/budget.json` theo dự toán.
- **Chat càng dài càng tốn** (video @ainativelab, 10/11/2026): Nhà sản xuất chỉ điều phối, giao từng phần cho session con, agent báo cáo ngắn, sửa đúng phần lệch, mỗi video một session.
- **Chủ đề "cách làm X" thì kịch bản là các bước làm, theo đúng khuôn video mẫu**, không phải bài giải thích (09/11/2026, "Làm penicillin bằng quả quýt": hai bản kịch bản giải thích liên miên vì sao không nên làm, người dùng chê). Khuôn của mẫu "Làm đá thời cổ đại": câu móc (thời gian, nơi chốn, điều lạ) → câu hỏi "họ làm bằng cách nào?" → **Bước 1, 2, 3, 4** (mỗi bước một hành động thấy được trên hình 3D) → kết quả bằng con số → một câu hỏi kết. Chủ đề có rủi ro (thuốc, hóa chất) thì kể cách phòng thí nghiệm hoặc người xưa đã làm, theo đúng khuôn đó; chỗ nào cần đính chính thì gói trong **một mệnh đề** ngay ở bước đó; cảnh báo an toàn **một câu** ở cuối. Không bỏ chủ đề người dùng giao, không đổi sang chủ đề "vì sao không được".

## Gấp giấy, cách làm (người dùng, 10/11/2026)
- Video gấp giấy phải **mô phỏng gấp thật bằng code** (`studio/engine3d`, đồ vật `origami`), không dùng ảnh AI minh họa "bước gấp". Lời đọc phải khớp đúng từng nếp trên hình. Vòng 1 chim giấy dùng 5 ảnh AI, các bước gấp không có thật, nên bị yêu cầu làm lại.
- Video dạy gấp: chèn khoảng lặng khoảng 1 giây sau mỗi bước (xem `projects/chim-giay-bay/pad_audio.py`), giọng 1,2x không kịp cho người xem nhìn nếp.

## Bất động sản (`bds`, phiên Giới thiệu căn hộ)
- (10/11/2026, Giới thiệu căn hộ) Video bất động sản: người dùng gửi tọa độ thì **phải có ảnh vệ tinh** (phong cách `bds`, mở đầu và kết trên bản đồ, ghim đúng tọa độ). Plus Code rút gọn (XQVM+VRH) phải giải mã theo ô gần thành phố đã nêu.
- (10/11/2026, Giới thiệu căn hộ) Ảnh thật không được chỉ lia/phóng phẳng ("chỉ là ảnh"): dùng `move` của `bdsPhoto` để ra cảm giác cảnh quay (máy tiến vào phòng, vật gần trôi nhanh hơn, ảnh ngang lia hết bề ngang, rung tay nhẹ).
- (10/11/2026, Giới thiệu căn hộ vòng 4) Cảnh trong nhà phải như **cầm máy quay đi trong nhà**, không phải lia/phóng ảnh, và **không được làm cong tường, cổng vòm**. Dùng `"cam"` (camwalk.py: chiều sâu MiDaS, máy quay ảo 3D), không dùng `move` cho ảnh nội thất.
- (10/11/2026, Giới thiệu căn hộ vòng 5) Video BĐS **không dùng tiếng hiệu ứng** (whoosh, pop: người dùng gọi là "tiếng rẹt rẹt") → `"sfx": false` trong bds.json. Máy quay nội thất kiểu gimbal: êm, không rung, không nhún (`hand` 0,15, `bob` 0), đi cong.
- (10/11/2026, Giới thiệu căn hộ vòng 6) Video căn hộ: người dùng muốn **không thuyết minh, chỉ nhạc nền** (`"narration": false`, `"music": {"generate": true}` → `studio/tools/music.py` tự sáng tác). Cảnh trong nhà phải **mượt, không rung**: camwalk mặc định `hand` 0.
- (10/11/2026, Giới thiệu căn hộ vòng 7) Người dùng muốn đoàn phim **tự tìm tiện ích** (không hỏi lại). Khi Overpass hỏng: quét OSRM `nearest` lấy tên đường/cầu/cổng trường, rồi soi ảnh vệ tinh z17 để xác nhận. Cảnh tiện ích: `poiMode: zoom` (ghim → lao xuống nhìn 3D → kéo ra). Đừng làm nhiều vòng tốn hạn mức: hỏi rõ trước khi làm việc nặng.
