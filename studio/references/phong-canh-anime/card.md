# Phong cảnh anime · đạp xe đổ dốc

- **Mẫu:** https://vt.tiktok.com/ZSpDC6Ceu/ (@trendingsongschannel, 15 giây, 1,6 triệu lượt xem, video AI, nhạc "Late Night")
- **Phong cách engine:** `phong-canh-3d` → `studio/engine3d/phong-canh.mjs` (canvas, phối cảnh giả 3D, không cần trình duyệt)
- **Thể loại:** thư giãn, chill, "một chút bình yên"; nền cho trích dẫn, tâm sự, nhạc

## Mẫu có gì
- Camera bám sau lưng người đạp xe, từ trên cao khoảng 4 m, đi thẳng xuống dốc, rung nhẹ.
- Nhân vật nhỏ ở giữa khung (khoảng 45–78% chiều cao): nón cói rộng vành, áo xanh dương, ba lô vải nâu nhạt, quần kaki, túi đỏ ở giá sau. Bóng đổ ngả về sau bên trái (nắng trước bên phải).
- Đường lát đá chữ nhật, khe cỏ, hội tụ ở khoảng 42% chiều cao, rồi mặt đất "rơi" khỏi tầm nhìn: phía sau là biển, bãi cát, sóng bạc đầu, thị trấn chi chít mái nhà, đồi cây.
- Đường chân trời ở 15% chiều cao, trời xanh đậm bão hòa, mây tích trắng đáy phẳng xếp ở chân trời.
- Hai bên đường: cỏ dày, hoa trắng, hồng, tím; tiền cảnh mờ chuyển động hướng tâm. Cây lớn, nhà gỗ lướt qua.
- Cảnh 2 (sau ~11 giây): đường đá men sườn núi, hoa cúc cam, thung lũng có thị trấn, núi xanh xa.
- Không chữ, không lời đọc, chỉ nhạc lo-fi.

## QBK làm được
- Toàn bộ bố cục, màu, nhịp, camera, nhân vật, đường đá, hoa, cây, nhà, mây, biển, thị trấn, hai cảnh `bien` và `nui`, chuyển cảnh mờ chồng.
- Âm thanh tự tổng hợp: gió, chim, vòng hợp âm I–vi–IV–V và nốt gảy (không dùng nhạc gốc vì có bản quyền).

## Bài học khi làm lại (góp ý người dùng)
- Mọi chi tiết trên mặt đất phải chạy theo phối cảnh. Lớp cỏ vẽ sẵn đứng yên làm hoa trông như trượt trên nền: nay thảm cỏ là từng hàng gắn với độ sâu z, hoa có bóng dưới gốc.
- Cây tán xòe (cụm lá ở đầu cành) đặt sát đường, lướt qua to; camera nghiêng theo khúc cua; vật sát ống kính nhòe theo độ sâu.

## Thay thế / còn thiếu
- Nét vẽ phẳng hơn tranh AI của mẫu (mẫu có độ chi tiết vẽ tay rất cao). Cây là cụm lá tròn, chưa có tán xòe tự nhiên.
- Chưa có dây điện, cột điện, chậu cây, bậc thềm nhà.
- Nhân vật chỉ nhìn từ sau.

## Cách dùng
```bash
node studio/engine3d/phong-canh.mjs projects/<slug>/phongcanh.json --still 2,10   # xem nhanh 2 khung
node studio/engine3d/phong-canh.mjs projects/<slug>/phongcanh.json                # ~7 s máy cho 1 s phim
```
Ví dụ: `projects/_mau/phong-canh-3d/phongcanh.json`.
