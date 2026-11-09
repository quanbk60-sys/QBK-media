# Quảng cáo QBK Studio (09/11/2026)
- Yêu cầu: video quảng cáo app, con trỏ bấm trên app qua các bước làm video "Làm đá thời cổ đại" và các chức năng, có thuyết minh.
- Cách làm: `record_ad.mjs` chạy app thật (`studio/app/qbk-studio.html`) trong Chromium với dữ liệu mô phỏng (`mockdb/`, lấy từ dữ liệu app thật), đồng hồ giả của Playwright, kịch bản bấm theo mốc phụ đề, ghép vào khung điện thoại 1080×1920 có phụ đề và màn kết.
- Giọng: Gemini `gemini-3.8-flash-lite-tts`, Puck (mô hình chính hết lượt hôm nay). Phụ đề căn bằng align.py.
- Chạy lại: `node record_ad.mjs` (khoảng 2 phút).
