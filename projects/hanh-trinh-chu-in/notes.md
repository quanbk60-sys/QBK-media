# Ghi chú sản xuất · Hành trình của chữ in

- Nguồn yêu cầu: link TikTok @ai_thu_vi (video 7704681602042875144) giới thiệu repo Lemo-Opuscar. Đọc bằng `studio/tools/tiktok.py --download`, đọc link GitHub ở khung cuối.
- Lựa chọn sáng tạo: "phong cách là thời đại". Mỗi thời kỳ của chữ in dùng phong cách của đúng thời kỳ đó (thủy mặc → khắc gỗ → khắc đồng → CRT). Lý do và 3 cấu trúc ứng viên: `TREATMENT.md`.
- Engine: chép engine của 4 demo (MIT) vào `lemo/`, sửa hằng kích thước sang 1080×1920. Mỗi chương là một trang `?ch=a|b|c|d`, render riêng rồi nối.
- Tiếng Việt: thay font của STYLE.md bằng font có dấu (Cormorant Garamond, EB Garamond, VT323, Pinyon dự phòng). Bodoni Moda thiếu dấu. Atlas ASCII của `ascii-crt` không có chữ Việt, nên chữ Việt đặt từng ký tự lên lưới bằng fillText. Dấu ngã của "CHỮ" trong tranh ký tự được vẽ dày tay để không đọc thành "CHỨ".
- Thời gian render (4 nhân, WebGL phần mềm): A 189 giây (thủy mặc, compositor nặng), B 79 giây, C 10 giây, D 47 giây.
- Âm thanh: `lemo/mix.py` dùng sfx.py của thư viện theo `window.EV`. Nền: dây gảy ngũ cung (A), drone dây trầm + trống gỗ (B), harpsichord (C), pad saw (D). Giọng nén, nền nhún xuống khi có lời.
- Master: `mux.sh` cần ffmpeg 7, container có 6.1, nên dùng loudnorm 2 lượt thủ công: −14,1 LUFS, 43,6 giây, 11,5 MB.
- Lệnh dựng lại: xem skill `lemo-opuscar` mục 3.
