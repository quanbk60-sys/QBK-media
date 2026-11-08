---
name: ve-bang-code
description: Họa sĩ vẽ bằng code. Thiết kế nhân vật (trang phục, màu nhận diện), thêm tư thế, biểu cảm, đạo cụ, bối cảnh mới vào engine QBK Studio (studio/engine/lib) và kiểm tra bằng render thử. Dùng cho vai họa sĩ hoặc khi engine thiếu đạo cụ, động tác.
---

# Họa sĩ: xưởng vẽ bằng code

## Thiết kế dàn nhân vật (`cast` trong `scene.json`)
- Mỗi nhân vật có **một màu nhận diện** (khăn, đai, mũ) và một phụ kiện nổi bật. Ví dụ: Ngô Quyền khăn và đai đỏ, cầm giáo; Kiều Công Tiễn đai xanh lá; quân Nam Hán dùng màu navy.
- Trang phục phải phù hợp thời đại. Không dùng biểu tượng sai lịch sử như khiên huy hiệu châu Âu ở Việt Nam thế kỷ 10.
- Ghi bảng nhân vật vào `script.md`: id, vai, trang phục, màu.

## Thêm tư thế (`studio/engine/lib/character.mjs`, mục `POSES`)
- Góc tính bằng radian. **0 là chi thõng thẳng xuống, số dương là xoay về hướng nhân vật đang nhìn.** Các trường: `fu` và `ff` (cánh tay trước, phần trên và cẳng tay), `bu` và `bf` (cánh tay sau), `ft` và `fk` (đùi và gối chân trước), `bt` và `bk` (chân sau), `lean` (độ nghiêng thân), `sp` (góc đạo cụ cầm tay: 0 là chĩa lên; `null` là đi theo cẳng tay).
- Gối gập ra sau dùng giá trị âm. Engine tự nâng cơ thể sao cho bàn chân thấp nhất chạm đất.
- Muốn có động tác lặp mới, thêm vào `applyCycle`.

## Thêm đạo cụ (`studio/engine/lib/props.mjs`, mục `PROPS`)
- Hàm có dạng `(ctx, p, t)`. Gốc tọa độ đặt **ở chân, chạm mặt đất** với đồ vật, hoặc ở tâm với biểu tượng. `p` là tham số, `t` là thời gian để làm cờ bay, sóng chạy.
- **Chỉ dùng các lệnh Canvas mà `Recorder` hỗ trợ**: `beginPath/moveTo/lineTo/quadraticCurveTo/bezierCurveTo/arc/ellipse/rect/roundRect/closePath/fill/stroke/fillRect/strokeRect/fillText/save/restore/translate/rotate/scale`, `globalAlpha`. **Không dùng `clip`, gradient, ảnh.**
- Phong cách: viền mực `#2A2723` dày 5–6px, tô màu phẳng theo bảng màu `COLORS`, chi tiết vừa phải để còn nhìn rõ trên điện thoại.
- Vẽ theo thứ tự tự nhiên của người vẽ tay (khối lớn trước, chi tiết sau), vì hiệu ứng vẽ tay sẽ đi theo đúng thứ tự lệnh.
- Dữ kiện địa lý thật (bản đồ chính xác) không được bịa. Dùng sơ đồ minh họa và ghi rõ "minh họa".

## Kiểm tra
```bash
cd studio/engine
node catalog.mjs                      # tên mới đã xuất hiện chưa
node render.mjs <scene_thu.json> --to 4 --name test-prop
```
Tạo một `scene` thử ngắn chỉ có đạo cụ hoặc tư thế mới, có `draw` để xem thứ tự nét. Kiểm tra ảnh `*-contact.png`.

## Sau khi thêm
Cập nhật bảng đạo cụ và tư thế trong `studio/engine/SCENE_FORMAT.md`. Báo tên và tham số mới cho đạo diễn.
