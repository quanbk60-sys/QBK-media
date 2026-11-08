---
name: san-trend
description: Săn trend cho kênh QBK. Tìm xu hướng, sự kiện và ngày lễ sắp tới, chủ đề đang được quan tâm ở Việt Nam và thế giới, chấm điểm theo độ hợp với kênh và độ dễ dựng bằng engine, viết báo cáo vào studio/trends/ và thêm chủ đề vào studio/topics.md. Dùng khi cần ý tưởng mới, lên lịch tuần, hoặc người dùng hỏi "đang có trend gì".
---

# Săn trend

## Nguồn (theo thứ tự ưu tiên)
1. **Lịch sự kiện 2–6 tuần tới:** ngày lễ Việt Nam (âm lịch và dương lịch), ngày kỷ niệm lịch sử (ngày sinh, ngày mất, ngày chiến thắng…), sự kiện quốc tế, mùa thi, mùa du lịch. Đây là nguồn **chắc chắn nhất**: kiểm chứng ngày bằng WebSearch.
2. **Xu hướng đang nổi:** dùng WebSearch tìm các bài báo hoặc bài tổng hợp "xu hướng TikTok tháng …", "trending YouTube Shorts Việt Nam", Google Trends Việt Nam, hashtag nổi bật. Thử WebFetch các trang như TikTok Creative Center hay Google Trends. Mạng của session có thể chặn những trang này: nếu bị chặn thì ghi rõ trong báo cáo, **không đoán số liệu**.
3. **Chủ đề luôn được xem (evergreen)** hợp với các mảng của kênh: lịch sử, khoa học "vì sao", ngụ ngôn, tâm lý, hoạt hình vui.
4. **Dữ liệu của chính kênh** (khi đã có `studio/stats`): thể loại hay phong cách nào đang được xem nhiều.

## Nguồn đã kiểm tra được trong môi trường QBK-media (08/11/2026)
- **Google Trends VN (đọc được):** `curl -s "https://trends.google.com/trending/rss?geo=VN"`. RSS gồm từ khóa và `ht:approx_traffic`. Lọc bỏ bóng đá, showbiz và chính trị.
- **TikTok, từng video (đọc được):** `https://www.tiktok.com/oembed?url=<link video>` trả về tiêu đề, tác giả, ảnh bìa. Dùng khi người dùng dán link trend.
- **TikTok Creative Center (chưa đọc được):** mở bằng trình duyệt Chromium thì trả về trang trống, có thể do TikTok chặn truy cập tự động. Ghi "không có dữ liệu", không đoán.

## Chấm điểm mỗi ý tưởng (thang 1–5)
| Tiêu chí | Ý nghĩa |
|---|---|
| Độ nóng | Đang được quan tâm hoặc sắp đến ngày (có nguồn) |
| Hợp kênh | Đúng mảng nội dung, kể được bằng người que, thân thiện mọi lứa tuổi |
| Dễ dựng | Engine đã có nhân vật, đạo cụ, phong cách cần dùng (đối chiếu với `node studio/engine/catalog.mjs`) |
| An toàn | Không chính trị đương thời, không tranh cãi tôn giáo hay lãnh thổ, không bôi nhọ người thật, dữ kiện kiểm chứng được |
**Tổng điểm = nóng + hợp + dễ + an toàn.** Ý tưởng có An toàn ≤ 2 thì **loại**, ghi lý do.

## Đầu ra
1. `studio/trends/<YYYY-MM-DD>.md` gồm:
   - Tóm tắt 3 dòng.
   - Bảng ý tưởng: chủ đề, góc kể (hook), mảng, phong cách gợi ý, thời điểm nên đăng, điểm, **nguồn** (link).
   - Danh sách đã loại kèm lý do.
   - Nguồn nào truy cập được, nguồn nào bị chặn.
2. Thêm **3–5 ý tưởng điểm cao nhất** vào `studio/topics.md` (trạng thái `ý tưởng`, ghi "trend <ngày>" trong cột góc kể), không trùng chủ đề đã có. Chủ đề gắn với một ngày cụ thể thì ghi hạn đăng.

## Quy tắc
- **Không bịa trend hay số liệu** (lượt xem, % tăng). Chỉ ghi điều có nguồn. Không có số liệu thì nói "không có số liệu".
- Không sao chép video hay ý tưởng nguyên bản của kênh khác. Lấy **chủ đề và góc kể riêng** cho QBK.
- Trend tiếng nước ngoài thì phải điều chỉnh cho khán giả Việt Nam.
- Chủ đề lịch sử, khoa học vẫn phải qua biên kịch kiểm chứng như bình thường. Săn trend chỉ đề xuất.
