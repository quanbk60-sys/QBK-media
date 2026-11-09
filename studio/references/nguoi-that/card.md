# Người thật nói chuyện trong phòng thu (`phong-thu`)

- **Mẫu:** https://vt.tiktok.com/ZSpDTdtXW/ (@gocvuivemoingay, "AI ngồi nói chuyện như thật", 29 giây, video AI)
- **Mẫu có gì:** một người như thật (do AI tạo) ngồi nói trước micro, phòng thu tường xám tối, dải LED ấm trên trần, đèn ống xanh trắng, kệ có cây, biển đèn nhỏ, ghế đen, mặt bàn nỉ xám. Camera tĩnh, không cắt cảnh, khẩu hình khớp lời, đầu hơi nghiêng và chớp mắt tự nhiên.

## QBK làm thế nào
- **Không dùng người que** (bản người que trước đó đã gỡ, xem `studio/lessons.md`).
- Ảnh người dẫn **do studio tự tạo** bằng Gemini (`studio/ai-art/phong-thu/presenter-base.png`), không sao chép người trong mẫu. Thêm 3 biến thể cùng khung bằng `--ref`: miệng hé, miệng mở, nhắm mắt.
- `studio/tools/talking.py` căn khớp các biến thể về ảnh gốc (ECC), ghép riêng vùng miệng và mắt, cho miệng mở theo độ lớn giọng đọc, chớp mắt mỗi 2,5–5 giây, camera đẩy vào rất chậm. Có `--blur` để che logo nhãn hiệu nếu ảnh vẽ ra.
- Chi phí lập bộ: 0,40 USD (4 ảnh 2K). Video sau dùng lại người dẫn, chỉ tốn giọng đọc (miễn phí).

## Còn khác mẫu
- Đầu chưa quay, nghiêng; vai chưa cử động.
- Khẩu hình chỉ 3 mức theo độ lớn giọng, chưa khớp từng âm như video AI.
- Muốn giống hẳn cần mô hình làm khẩu hình (lip-sync). Phương án: mở mạng tới huggingface.co và download.pytorch.org để chạy mô hình miễn phí trên máy (chậm), hoặc dịch vụ trả phí (HeyGen, D-ID, Veo) khi người dùng đồng ý.

## Cách dùng
```bash
A=studio/ai-art/phong-thu
python3 studio/tools/talking.py --base $A/presenter-base.png --half $A/mouth-half.png --open $A/mouth-open.png --blink $A/blink.png \
  --audio projects/<slug>/audio/narration.wav --out projects/<slug>/output/final.mp4 \
  --mouth 0.533,0.47 --eyes 0.523,0.411 --blur 0.87,0.49,0.995,0.53     # --still 1,2 để xem nhanh
```
Giọng nữ mẫu: `tts.py --voice Kore`, tăng tốc 1,12x. Ví dụ: `projects/_mau/phong-thu/`.
