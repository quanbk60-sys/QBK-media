# Bài học của đoàn phim QBK

Mọi agent **đọc file này trước khi làm việc**. Nhà sản xuất thêm bài học mới sau mỗi vòng góp ý của người dùng. Mỗi dòng là một quy tắc ngắn, ghi kèm nguồn.

## Giọng đọc
- Video quảng cáo hoặc nội dung trẻ trung: thu thử 2–3 giọng với `--style` (ví dụ "hyped Gen Z TikTok food reviewer, Southern accent"), cho Gemini nghe và chấm, rồi chọn. Quán Cóc chọn **Laomedeia** (giọng nữ) thay cho Puck, người dùng chê Puck chưa đủ trẻ trung. Tempo 1,05 vì giọng có chỉ dẫn đã nhanh. *(Quán Cóc vòng 1)*
- Chỉ dẫn kiểu "hyped, super energetic" làm giọng gấp và giả. Người dùng thích **thư thả, như trò chuyện với bạn, không phải MC**, không tăng tốc; nếu bản thu có khoảng lặng dài thì rút xuống khoảng 0,5 s thay vì tăng tempo. Lời ít dấu chấm than. *(Quán Cóc vòng 2)*
- **`tts.py --style` có thể bị đọc thành lời ở đầu file** (Aoede, Sulafat, cả Despina ở vòng 4 Quán Cóc: 7,6 s tiếng Anh lọt tới tay người dùng, làm lệch luôn toàn bộ phụ đề). Soát bằng cách nhờ Gemini **chép nguyên văn kèm mốc giây**, không nhờ nó "đánh giá" (lúc đánh giá nó báo sai là không có). Có thì cắt tới khoảng lặng sau câu chỉ dẫn rồi mới chạy align.py. Luôn chép lại bằng Gemini để soát trước khi dùng; Laomedeia không bị. *(Quán Cóc vòng 3)*
- Laomedeia bị người dùng chê "khó nghe" (vòng 4). Giọng nữ êm, ấm đang dùng: **Despina**; giọng nam dự phòng: Umbriel. Chỉ dẫn `--style` nên ngắn (một câu) để giảm rủi ro bị đọc thành lời. *(Quán Cóc vòng 4)*
- Giọng Gemini Bodi ở tốc độ gốc **quá chậm**. Mặc định tăng tốc **1,2 lần** bằng `studio/tools/retime.py` (giữ cao độ). *(Rùa và Thỏ, góp ý của người dùng)*

## Âm thanh
- **Không dùng sfx tổng hợp từ tiếng ồn** (`whoosh`, `cheer`, `crack`, `splash`, `wind`): người dùng nghe thành "xẹt xẹt khó chịu". Dùng `pop`, `chime`, thỉnh thoảng `drum`. Muốn có nhịp thì thêm nhạc nền tự tổng hợp không có tiếng ồn (mẫu `projects/quan-coc/make_music.py`, gain 0,16). *(Quán Cóc vòng 1)*
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

## Phong cách phải khác nhau thật (người dùng, 09/11/2026)
- "Các phong cách giống hệt nhau, chỉ khác nền" là lỗi. Mỗi phong cách có ngữ pháp riêng (nét, cách tô, cách hiện hình, chuyển cảnh, phụ đề), xem SCENE_FORMAT.md, mục "Ngữ pháp phong cách". Đạo diễn còn phải đổi cả bố cục và nhịp cho hợp phong cách.
- Học từ mẫu 3D thực tế thì dựng bằng `studio/engine3d/`, không thay bằng nét vẽ trên giấy. Video làm đá bản nét vẽ đã bị người dùng chê "khác hoàn toàn mẫu".

## Vận hành
- **Tiết kiệm hạn mức:** dựng video ở session mới (do app gọi), không trong chat dài. Biên kịch dùng Sonnet (Opus chỉ cho chủ đề nhạy cảm), đạo diễn kiêm dựng phim, kiểm định nhẹ, họa sĩ chỉ khi thiếu đồ. *(Người dùng, 08/11/2026)*

## Quảng cáo quán ăn, quán nhậu
- Giới thiệu món: ảnh món toàn khung, zoom chậm, tên món chữ lớn. Người dùng chê kiểu sticker tách nền bay nhảy, cắt quá nhanh. Không gắn nhãn thừa lên video quay thật ("Tới rồi đó!"). *(Quán Cóc vòng 2)*
- Người dùng bỏ hẳn các dòng cảnh báo rượu bia trên video quảng cáo của quán mình (vòng 2, vòng 3). Vẫn nhắc người dùng một lần về luật, rồi làm theo yêu cầu. *(Quán Cóc)*
- Người dùng có video quay thật thì **dựng xoay quanh video**, ảnh chỉ để chèn. Phong cách chill: chữ hiện mờ dần, không sticker, video phủ màu ấm (`tint` + `vignette`), nhạc lo-fi tự tổng hợp (`projects/quan-coc/make_music_chill.py`, gain 0,28), không sfx. *(Quán Cóc vòng 3)*
- Lời đọc nói về món và quà, không rủ "đi nhậu"; luôn có cảnh báo "Người dưới 18 tuổi không sử dụng rượu bia · Đã uống rượu bia không lái xe". Mẫu: `projects/quan-coc/`. *(Quán Cóc, 24/11/2026)*
- Người dùng muốn giọng "không như AI": viết lời như nói chuyện (nè, nha, hen; câu ngắn; có câu đùa) và dùng `tts.py --style` để chỉ dẫn cách nói. Chép lại bằng Gemini để soát trước khi dựng. *(Quán Cóc)*
