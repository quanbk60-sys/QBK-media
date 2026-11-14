# Hành trình của chữ in — treatment (Lemo-Opuscar, 4 phong cách)

Demo skill `lemo-opuscar` trong QBK: một video 9:16, 43,6 giây, lời đọc Gemini (Bodi, 1,2x). Mỗi chương một phong cách của thư viện Lemo-Opuscar, đúng thời đại của chữ: **phong cách là thời đại**.

## Ba cấu trúc ứng viên
1. **Cuộn tranh liền một mạch**: một cảnh quay ngang xuyên 4 chất liệu, chất liệu sau "ăn" chất liệu trước. Đẹp nhưng 4 compositor trong một trang, rủi ro cao.
2. **Bốn tấm bản in độc lập** (wordless-novel): mỗi chương là một "tấm" trọn vẹn với ngữ pháp riêng của phong cách, cắt bằng chuyển cảnh của chính phong cách đó (vết mực loang, bóc giấy, ép bản, bật màn hình).
3. **Một chữ "CHỮ" đi qua bốn chất liệu**: cùng một chữ được viết bằng bút lông, khắc gỗ, khắc đồng, rồi hiện bằng ký tự phát sáng. Gọn, nhưng nghèo hình cho các dữ kiện.

**Chọn 2 + mô-típ của 3**: bốn tấm độc lập, mỗi tấm kết bằng một chữ "CHỮ" (hoặc con chữ) để nối sang tấm sau.

## Chương
| # | Thời gian | Phong cách | Nội dung hình |
|---|---|---|---|
| A | 0–9,87 | `ink-wash` Chinese Ink Wash | Giấy dó trắng, nét bút lông vẽ núi xa, một cành cây, rồi tờ giấy thành hình; dấu triện son. Câu hỏi mở đầu viết dạng đề từ (题跋) ở khoảng giấy trống. |
| B | 9,87–25,17 | `woodcut` Woodcut Print | Tấm ván đen, dao khắc hiện ra chữ ngược; bóc giấy ra chữ xuôi (native move "mirrored block → true print"). Tấm thứ hai: chồng ván mộc bản, số 34.000+ và 2009 in ở lề. Một màu: đỏ son chỉ cho dấu UNESCO / triện. |
| C | 25,17–33,2 | `engraving` Copperplate Engraving | Tấm bản khắc đồng kiểu bảng minh họa bảo tàng: một con chữ kim loại (type sort) được khắc dần bằng nét swell, roundel phóng to mặt chữ, nhãn "MAINZ · c. 1450", cuối cùng tô màu nước. |
| D | 33,2–43,6 | `ascii-crt` CRT ASCII Terminal | Màn hình hổ phách bật lên (chấm → vạch → khung), chữ gõ ra, hình cuốn sách bằng ký tự, câu kết, cursor nhấp nháy. |

## Phụ đề
Mỗi chương phụ đề theo đúng phong cách (đề từ nghiêng, chữ in lề, chữ viết trên mảnh giấy, dòng LOG). Font hỗ trợ tiếng Việt.

## Âm thanh
Tổng hợp bằng code từ sự kiện `EV` (sfx.py của Lemo): giọt mực, dao khắc gỗ, tiếng burin, phím gõ; nền mỗi chương một drone nhẹ, nhỏ hơn giọng ~10 dB.

## Kỹ thuật
4 trang `index.html` riêng (`ch-a … ch-d`), render 1080×1920 bằng `core/render/video.mjs`, nối lại, mix với giọng, `mux.sh` −14 LUFS.
