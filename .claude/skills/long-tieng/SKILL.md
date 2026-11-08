---
name: long-tieng
description: Thu giọng đọc tiếng Việt bằng Gemini TTS và căn thời gian phụ đề theo giọng thật. Tạo audio/narration.wav và captions-audio.json. Dùng cho vai lồng tiếng của đoàn phim.
---

# Lồng tiếng và phụ đề

## Đầu vào
`narration.txt`, `captions-phrases.txt`, phần giọng đọc trong `brief.md`.

## Thu giọng
```bash
mkdir -p projects/<slug>/audio
python3 studio/tools/tts.py projects/<slug>/narration.txt projects/<slug>/audio/narration.wav --model gemini-3.8-flash-tts --voice Bodi
ffprobe -v error -show_entries format=duration -of csv=p=0 projects/<slug>/audio/narration.wav
```
- **Key do proxy của môi trường tự gắn vào**, nên không cần và không được hỏi key, cũng không dán key vào lệnh.
- Gặp lỗi **429 Free Tier**: TTS thường vẫn còn hạn mức miễn phí. Đợi một lúc, hoặc thử model `gemini-3.8-flash-lite-tts`, hoặc báo Nhà sản xuất. **Không** tự chuyển sang dịch vụ trả phí.
- Không thêm chỉ dẫn diễn cảm vào văn bản. Dùng đúng giọng đã chọn.
- Ghi vào `checkpoint.json`: model, giọng, thời lượng, và số token nếu có trong phần `usage`.
- Nếu thời lượng lệch mục tiêu quá 20%, báo Nhà sản xuất để biên kịch chỉnh lời. **Không** kéo giãn hay nén giọng.

## Căn phụ đề
```bash
python3 studio/tools/align.py projects/<slug>
```
- Mỗi cụm trong `captions-phrases.txt` phải ≤ khoảng 30 ký tự. Engine tự tách cụm quá rộng làm hai, nhưng tách sẵn ở chỗ ngừng tự nhiên vẫn đẹp hơn.
- Script không dùng forced aligner. Nó ngắt cụm đúng các khoảng lặng thật trong giọng và giữ tốc độ đọc đều. Xem kết quả: các cụm kết thúc bằng dấu câu nên rơi đúng khoảng lặng.
- Nếu môi trường đã cài Whisper và tải được model, có thể căn chính xác hơn. Khi đó vẫn xuất ra cùng định dạng `[{start, end, text}]`.

## Bàn giao
Báo lại Nhà sản xuất: thời lượng giọng đọc, số cụm phụ đề, và cảnh báo nếu có (ví dụ đoạn đọc quá nhanh).
