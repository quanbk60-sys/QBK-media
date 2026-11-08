---
name: phan-canh
description: Đạo diễn. Biến kịch bản và giọng đọc đã căn thời gian thành scene.json cho engine vẽ bằng code QBK Studio, gồm phân cảnh, diễn xuất nhân vật, đạo cụ, chữ trên hình, camera, hiệu ứng vẽ tay và sfx. Dùng cho vai đạo diễn của đoàn phim.
---

# Đạo diễn: phân cảnh thành `scene.json`

**Đọc trước:** `studio/engine/SCENE_FORMAT.md` (định dạng đầy đủ) và kết quả của `node studio/engine/catalog.mjs` (danh sách tư thế, biểu cảm, đạo cụ, sfx hiện có).
**Đầu vào:** `script.md`, `captions-audio.json` (thời gian thật của từng cụm lời), `audio/narration.wav`.
**Đầu ra:** `projects/<slug>/scene.json`.
**Mẫu tham khảo:** `projects/bach-dang-938/scene.json`.

## Cách chia shot
1. Lấy mốc thời gian từ `captions-audio.json`. **Ranh giới shot đặt đúng chỗ ngừng hoặc đầu một cụm lời.** Thời gian shot = thời gian giọng đọc + `lead` (0,15).
2. Mỗi shot dài khoảng 1,5–4 giây. Các shot nối liền nhau từ 0 đến hết giọng đọc + 0,4 giây.
3. **Không để hình đứng yên quá 2,5 giây.** Mỗi shot phải có ít nhất một chuyển động có nghĩa: nhân vật đổi tư thế, đi, đạo cụ di chuyển, chữ bật ra, hoặc bàn tay vẽ.
4. **Hook (0–3 giây)** phải mạnh: chữ lớn kèm hình gây tò mò, có sfx `drum` hoặc `pop`.

## Bố cục 9:16
- Chữ trên hình ở y 200–560, ngắn (≤3 từ), cỡ 110–300.
- Nhân vật và đạo cụ ở vùng y 600–1350, **mặt đất chuẩn y = 1330**.
- Phụ đề tự vẽ ở y khoảng 1420. **Không đặt vật thể chính ở 1370–1470.**
- Dưới y 1550 và lề phải x > 960 bị giao diện TikTok che, nên không đặt thông tin quan trọng ở đó.
- Nhân vật chính dùng scale 0,6–0,75, nhân vật phụ hoặc đám đông 0,4–0,5. Nhân vật đứng với `y: 1330`.

## Diễn xuất
- Dùng `acting` với các mốc khớp lời đọc. Ví dụ đúng chữ "giết" thì chuyển sang `thrust`.
- Đổi biểu cảm theo cảm xúc của câu.
- Đi lại: `cycle: walk` kèm track `x` với `ease: linear`, tốc độ khoảng 300 px/s ở scale 0,6. Chạy: `run`, khoảng 550 px/s.
- Động tác quan trọng dùng `snap: true` cho có độ nảy.
- Nhân vật phản diện và chính diện phân biệt bằng màu (theo `cast`), không chỉ bằng biểu cảm.
- `facing: -1` khi hai nhân vật đối mặt nhau.

## Hiệu ứng vẽ tay (`draw`)
- Dùng cho khoảng 20–40% số shot, nhất là lúc giới thiệu nhân vật hoặc đạo cụ mới, hay khi giải thích (bản đồ, mặt cắt).
- `dur` khoảng 1–2 giây. Nếu shot có lời đọc dồn dập, dùng `enter: pop` thay vì `draw`.

## Âm thanh
Xem skill `am-thanh`. Mỗi shot nên có 0–2 sfx, đặt **đúng khoảnh khắc hành động**.

## Liên tục giữa các cảnh
Giữ nguyên `cast` cho cả phim: trang phục là bản nhận diện của nhân vật. Hướng di chuyển giữ thống nhất, ví dụ quân ta tiến sang phải, giặc từ phải sang trái.

## Khi engine thiếu thứ cần dùng
Nếu cần tư thế hoặc đạo cụ chưa có: ghi danh sách cụ thể (tên, mô tả, tham số) vào `art-requests.md` và báo Nhà sản xuất để giao `hoa-si`. Trong lúc chờ, tạm dùng phương án gần nhất để phim vẫn dựng được.

## Tự kiểm tra trước khi bàn giao
```bash
cd studio/engine && node render.mjs ../../projects/<slug>/scene.json --to 6 --name check
```
Lệnh này cũng kiểm tra định dạng: lỗi tên tư thế, đạo cụ hay shot bị hở sẽ báo ngay. Xem `output/check-contact.png`, sửa chỗ chồng lấn rồi mới bàn giao.
