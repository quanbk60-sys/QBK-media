// Hành trình của chữ in · một dòng thời gian chung cho cả bốn chương (giây, theo audio/narration.wav 1,2x)
export const W = 1080, H = 1920;
export const CH = { a: [0, 9.87], b: [9.87, 25.17], c: [25.17, 33.2], d: [33.2, 43.6] };
// phụ đề: [t0, t1, dòng 1, dòng 2?]  (khớp captions-audio.json + khoảng lặng thật)
export const CAPS = [
  [0.00, 2.69, 'Một trang chữ phải đi qua', 'bao nhiêu thế kỷ mới đến được tay bạn?'],
  [3.37, 6.31, 'Theo sử cũ, năm 105,', 'quan Thái Luân dâng vua'],
  [6.31, 9.80, 'cách làm giấy từ vỏ cây,', 'sợi gai, giẻ rách và lưới cá.'],
  [10.20, 13.55, 'Rồi người ta khắc chữ ngược', 'lên ván gỗ, phết mực, ép giấy.'],
  [13.70, 17.90, 'Kinh Kim Cương in năm 868 là cuốn', 'sách in có ghi năm sớm nhất còn lại.'],
  [18.10, 20.89, 'Ở Việt Nam, hơn 34.000 tấm', 'mộc bản triều Nguyễn'],
  [20.89, 25.10, 'được UNESCO công nhận năm 2009, là di sản', 'tư liệu thế giới đầu tiên của nước ta.'],
  [25.63, 27.90, 'Khoảng năm 1450, ở Mainz,'],
  [27.90, 31.40, 'Gutenberg đúc từng con chữ kim loại rời,', 'xếp thành trang rồi ép bằng máy.'],
  [31.70, 33.20, 'Sách bắt đầu được in hàng loạt.'],
  [33.53, 36.60, 'Còn hôm nay, mỗi chữ bạn đang đọc', 'chỉ là những điểm sáng trên màn hình.'],
  [36.83, 40.20, 'Từ vỏ cây đến điểm sáng,', 'chữ chưa bao giờ ngừng lên đường.'],
  [40.55, 43.60, 'Theo dõi QBK để xem tiếp nhé.'],
];
// phụ đề của một chương, theo giờ địa phương của chương
export function capsOf(ch) {
  const [a, b] = CH[ch];
  return CAPS.filter(c => c[0] < b && c[1] > a).map(([t0, t1, ...l]) => ({ t0: Math.max(0, t0 - a), t1: Math.min(b, t1) - a, lines: l }));
}
export const capAt = (caps, t) => caps.find(c => t >= c.t0 && t < c.t1);
export const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
export const ease = u => u * u * (3 - 2 * u);
