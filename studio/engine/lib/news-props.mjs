// Icon nét vẽ cho phong cách "ban-tin" (bản tin vẽ tay): nét mực mảnh, điểm đỏ cam và xanh, tô nhạt.
// Vẽ qua Recorder nên có hiệu ứng nét hiện dần (draw). Gốc tọa độ ở TÂM icon. Chỉ dùng lệnh Recorder hỗ trợ.
// Học từ mẫu studio/references/ai-beat-tin-tuc/card.md.
const INK = '#1C1C1E', RED = '#FC5636', BLUE = '#2464EC', RED_F = '#F7D0C4', BLUE_F = '#C9D5F2';
const col = c => ({red: RED, blue: BLUE, ink: INK, redFill: RED_F, blueFill: BLUE_F}[c] || c);
const W = 6.5; // nét mực đo từ mẫu: khoảng 6 px ở khung 1080
function L(ctx, pts, w = W, c = INK) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineWidth = w; ctx.strokeStyle = col(c); ctx.stroke(); }
function R(ctx, x, y, w, h, {fill, c = INK, lw = W, r = 0} = {}) { ctx.beginPath(); r ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); if (fill) { ctx.fillStyle = col(fill); ctx.fill(); } ctx.lineWidth = lw; ctx.strokeStyle = col(c); ctx.stroke(); }
function C(ctx, x, y, r, {fill, c = INK, lw = W} = {}) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = col(fill); ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = col(c); ctx.stroke(); } }
function T(ctx, text, x, y, size = 40, c = INK, align = 'center') { ctx.font = `${size}px Hand`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col(c); ctx.fillText(text, x, y); }

export const NEWS_PROPS = {
  // vi mạch: ô vuông có chân, p.label, p.color (blue), p.size (200)
  chip(ctx, p) {
    const s = p.size ?? 240, h = s / 2, c = p.color || 'blue', n = 6;
    R(ctx, -h, -h, s, s, {fill: c === 'blue' ? 'blueFill' : c === 'red' ? 'redFill' : null, c, lw: W});
    for (let i = 0; i < n; i++) { const k = -h + (i + 0.5) * s / n; L(ctx, [[k, -h], [k, -h - 26]], W - 1.5, c); L(ctx, [[k, h], [k, h + 26]], W - 1.5, c); }
    if (p.inner) R(ctx, -h * 0.45, -h * 0.45, s * 0.45, s * 0.45, {c, lw: W});
    if (p.label) T(ctx, p.label, 0, 0, s * 0.2, c);
  },
  // nhóm người: p.n (3), p.size (60 = cỡ đầu)
  people(ctx, p) {
    const n = p.n ?? 3, s = p.size ?? 84, gap = s * 1.25;
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * gap, y = i % 2 ? -s * 0.35 : 0;
      C(ctx, x, y - s * 0.55, s * 0.42); ctx.beginPath(); ctx.arc(x, y + s * 0.55, s * 0.62, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = W; ctx.strokeStyle = INK; ctx.stroke(); }
  },
  // biểu đồ đường trong khung: p.trend 'down'|'up', p.w (460), p.h (300), p.color (red)
  lineChart(ctx, p) {
    const w = p.w ?? 740, h = p.h ?? 430, c = p.color || 'red', up = p.trend === 'up';
    R(ctx, -w / 2, -h / 2, w, h, {fill: p.paper === false ? null : '#FBF8F2', lw: W});
    for (let i = 1; i < 4; i++) L(ctx, [[-w / 2 + 20, -h / 2 + i * h / 4], [w / 2 - 20, -h / 2 + i * h / 4]], 2.5, '#BDB8AF');
    const pts = []; for (let i = 0; i <= 10; i++) { const x = -w / 2 + 30 + i * (w - 60) / 10, base = up ? h * 0.25 - i * h * 0.05 : -h * 0.2 + (i > 6 ? (i - 6) ** 1.6 * h * 0.07 : 0); pts.push([x, base + Math.sin(i * 2.1) * h * 0.04]); }
    L(ctx, pts.slice(0, up ? 4 : 7), W + 1, INK); L(ctx, pts.slice(up ? 3 : 6), W + 2, c);
    const [ex, ey] = pts.at(-1), [px, py] = pts.at(-2), an = Math.atan2(ey - py, ex - px); L(ctx, [[ex - 28 * Math.cos(an - 0.5), ey - 28 * Math.sin(an - 0.5)], [ex, ey], [ex - 28 * Math.cos(an + 0.5), ey - 28 * Math.sin(an + 0.5)]], W + 1, c); C(ctx, ex, ey, 13, {fill: INK, lw: 0});
    if (p.value) T(ctx, p.value, -w / 2 + 36, up ? -h * 0.18 : h * 0.08, h * 0.2, c, 'left'); if (p.note) T(ctx, p.note, -w / 2 + 40, h / 2 - 40, h * 0.085, '#6B665E', 'left');
  },
  // biểu đồ cột tăng dần: p.values [0..1], p.w, p.h, p.color, p.labels
  barChart(ctx, p) {
    const v = p.values || [0.15, 0.3, 0.55, 1], w = p.w ?? 640, h = p.h ?? 420, c = p.color || 'blue', bw = w / v.length * 0.6;
    L(ctx, [[-w / 2, h / 2], [w / 2, h / 2]], W);
    v.forEach((k, i) => { const x = -w / 2 + (i + 0.5) * w / v.length - bw / 2, bh = k * h; R(ctx, x, h / 2 - bh, bw, bh, {fill: i === v.length - 1 ? (c === 'red' ? 'redFill' : 'blueFill') : null, c: i === v.length - 1 ? c : INK});
      if (p.labels?.[i]) T(ctx, p.labels[i], x + bw / 2, h / 2 + 44, 42, INK); });
  },
  // vòng phần trăm: p.pct (0..1), p.r (130), p.color (red), p.label ("80%")
  donut(ctx, p) {
    const r = p.r ?? 170, pct = p.pct ?? 0.8, c = p.color || 'red';
    C(ctx, 0, 0, r, {lw: 36, c: '#E3DED6'});
    ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct); ctx.lineWidth = 36; ctx.strokeStyle = col(c); ctx.stroke();
    C(ctx, 0, 0, r - 27, {lw: 3.5, c: INK}); C(ctx, 0, 0, r + 27, {lw: 3.5, c: INK});
    if (p.label) T(ctx, p.label, 0, 4, r * 0.48, c);
  },
  // trục thời gian: p.w (700), p.from, p.to (nhãn), p.progress (0..1 đoạn xanh), p.flag (cờ đỏ ở cuối)
  timeline(ctx, p) {
    const w = p.w ?? 760, n = p.ticks ?? 10, pr = p.progress ?? 1;
    L(ctx, [[-w / 2, 0], [w / 2, 0]], W);
    if (pr > 0) L(ctx, [[-w / 2, 0], [-w / 2 + w * pr, 0]], W + 4, 'blue');
    for (let i = 0; i <= n; i++) { const x = -w / 2 + i * w / n; L(ctx, [[x, -13], [x, 13]], 4); }
    C(ctx, -w / 2 + w * pr, 0, 15, {fill: INK, lw: 0});
    if (p.flag !== false) { const x = w / 2; L(ctx, [[x, 0], [x, -84]], W); ctx.beginPath(); ctx.moveTo(x, -84); ctx.lineTo(x + 52, -70); ctx.lineTo(x, -54); ctx.closePath(); ctx.fillStyle = RED; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = RED; ctx.stroke(); }
    if (p.from) T(ctx, p.from, -w / 2, 62, 50); if (p.to) T(ctx, p.to, w / 2, 62, 50);
  },
  // tòa nhà cột kiểu ngân hàng: p.w (420), p.label
  bank(ctx, p) {
    const w = p.w ?? 520, h = w * 0.75;
    ctx.beginPath(); ctx.moveTo(-w / 2 - 20, -h * 0.42); ctx.lineTo(0, -h * 0.72); ctx.lineTo(w / 2 + 20, -h * 0.42); ctx.closePath(); ctx.lineWidth = W; ctx.strokeStyle = INK; ctx.stroke();
    L(ctx, [[-w / 2, -h * 0.36], [w / 2, -h * 0.36]]);
    for (let i = 0; i < 5; i++) { const x = -w / 2 + 30 + i * (w - 60) / 4; R(ctx, x - 14, -h * 0.3, 28, h * 0.62); }
    R(ctx, -w / 2 - 10, h * 0.32, w + 20, 24); R(ctx, -w / 2 - 30, h * 0.32 + 24, w + 60, 22);
    if (p.label) T(ctx, p.label, 0, -h * 0.5, 34, 'blue');
  },
  // cửa sổ trò chuyện: p.w (520), các bóng chữ trái/phải
  chatWindow(ctx, p) {
    const w = p.w ?? 640, h = w * 0.78;
    R(ctx, -w / 2, -h / 2, w, h, {fill: '#FBF8F2', r: 18});
    L(ctx, [[-w / 2, -h / 2 + 50], [w / 2, -h / 2 + 50]], 3);
    for (const [i, cx] of [[0, -w / 2 + 34], [1, -w / 2 + 62], [2, -w / 2 + 90]]) C(ctx, cx, -h / 2 + 25, 8, {fill: i === 0 ? RED : null, lw: 3});
    R(ctx, -w / 2 + 30, -h / 2 + 80, w * 0.55, 56, {r: 22, lw: 3.5});
    R(ctx, w / 2 - 30 - w * 0.5, -h / 2 + 160, w * 0.5, 56, {r: 22, lw: 3.5, fill: 'blueFill', c: 'blue'});
    R(ctx, -w / 2 + 30, -h / 2 + 240, w * 0.62, 56, {r: 22, lw: 3.5});
    R(ctx, -w / 2 + 30, h / 2 - 70, w - 60, 46, {r: 23, lw: 3});
    for (const [y, k] of [[-h / 2 + 108, 0.4], [-h / 2 + 268, 0.48]]) L(ctx, [[-w / 2 + 52, y], [-w / 2 + 52 + w * k, y]], 3, '#9E978C');
  },
  // tờ lịch: p.top (dòng trên, vd "THÁNG 11"), p.day ("30"), p.w (220)
  calendar(ctx, p) {
    const w = p.w ?? 280, h = w * 1.05;
    R(ctx, -w / 2, -h / 2, w, h, {fill: '#FBF8F2', r: 10}); R(ctx, -w / 2, -h / 2, w, h * 0.26, {fill: 'redFill', c: 'red', r: 10});
    for (const x of [-w * 0.25, w * 0.25]) L(ctx, [[x, -h / 2 - 18], [x, -h / 2 + 14]], W + 1);
    if (p.top) T(ctx, p.top, 0, -h / 2 + h * 0.13, w * 0.15, 'red');
    if (p.day) T(ctx, p.day, 0, h * 0.13, w * 0.42, INK);
  },
  // dấu tích: p.size (90), p.color (blue)
  check(ctx, p) { const s = p.size ?? 120; L(ctx, [[-s * 0.5, 0], [-s * 0.12, s * 0.38], [s * 0.55, -s * 0.42]], W + 3, p.color || 'blue'); },
  // mũi tên cong (nét đứt nếu p.dashed): từ (0,0) tới (p.dx, p.dy), cong p.bend (0.3), p.color
  arrowCurve(ctx, p) {
    const dx = p.dx ?? 320, dy = p.dy ?? 0, b = p.bend ?? 0.3, c = p.color || 'blue', mx = dx / 2 - dy * b, my = dy / 2 + dx * b, n = 24;
    const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([2 * u * t * mx + t * t * dx, 2 * u * t * my + t * t * dy]); }
    if (p.dashed) for (let i = 0; i < n; i += 2) L(ctx, [pts[i], pts[i + 1]], W, c); else L(ctx, pts, W, c);
    const [ax, ay] = pts[n], [bx, by] = pts[n - 2], a = Math.atan2(ay - by, ax - bx), k = 26;
    L(ctx, [[ax - k * Math.cos(a - 0.5), ay - k * Math.sin(a - 0.5)], [ax, ay], [ax - k * Math.cos(a + 0.5), ay - k * Math.sin(a + 0.5)]], W, c);
  },
  // ngọn lửa: p.size (200)
  flame(ctx, p) {
    const s = p.size ?? 260;
    for (const [k, c, f] of [[1, 'red', 'redFill'], [0.55, 'red', null]]) { ctx.beginPath(); ctx.moveTo(0, s * 0.5 * k); ctx.bezierCurveTo(-s * 0.55 * k, s * 0.45 * k, -s * 0.5 * k, -s * 0.1 * k, -s * 0.12 * k, -s * 0.55 * k);
      ctx.bezierCurveTo(-s * 0.05 * k, -s * 0.2 * k, s * 0.1 * k, -s * 0.15 * k, s * 0.18 * k, -s * 0.4 * k); ctx.bezierCurveTo(s * 0.55 * k, -s * 0.05 * k, s * 0.5 * k, s * 0.45 * k, 0, s * 0.5 * k);
      if (f) { ctx.fillStyle = RED_F; ctx.fill(); } ctx.lineWidth = W; ctx.strokeStyle = col(c); ctx.stroke(); }
  },
  // máy tính xách tay: p.w (420), p.screen ("AI")
  laptop(ctx, p) {
    const w = p.w ?? 520, h = w * 0.62;
    R(ctx, -w / 2, -h, w, h, {fill: '#FBF8F2', r: 12}); R(ctx, -w / 2 + 20, -h + 20, w - 40, h - 40, {lw: 3});
    ctx.beginPath(); ctx.moveTo(-w / 2 - 40, 0); ctx.lineTo(w / 2 + 40, 0); ctx.lineTo(w / 2 + 10, 26); ctx.lineTo(-w / 2 - 10, 26); ctx.closePath(); ctx.lineWidth = W; ctx.strokeStyle = INK; ctx.stroke();
    if (p.screen) T(ctx, p.screen, 0, -h / 2, h * 0.32, 'blue');
  },
  // tiền / hộp đô la: p.w (220)
  money(ctx, p) {
    const w = p.w ?? 280, h = w * 0.5;
    for (let i = 2; i >= 0; i--) R(ctx, -w / 2 + i * 10, -h / 2 - i * 14, w, h, {fill: i ? '#FBF8F2' : 'blueFill', c: i ? INK : 'blue', r: 8});
    C(ctx, 0, 0, h * 0.3, {c: 'blue'}); T(ctx, '$', 0, 2, h * 0.42, 'blue');
  },
  // vòng nguệch ngoạc đỏ quanh một vùng: p.w, p.h
  scribbleCircle(ctx, p) {
    const w = p.w ?? 300, h = p.h ?? 120, pts = [];
    for (let i = 0; i <= 60; i++) { const a = -Math.PI * 0.6 + i / 60 * Math.PI * 2.15, k = 1 + 0.06 * Math.sin(i * 0.7); pts.push([Math.cos(a) * w / 2 * k, Math.sin(a) * h / 2 * k]); }
    L(ctx, pts, W, p.color || 'red');
  },
  // gạch chân nguệch ngoạc: p.w (300)
  underline(ctx, p) { const w = p.w ?? 300, pts = []; for (let i = 0; i <= 20; i++) pts.push([-w / 2 + i * w / 20, Math.sin(i * 1.3) * 3 + (i / 20) * 4]); L(ctx, pts, W + 1, p.color || 'red'); },
  // dấu hỏi to: p.size (140), p.color
  qmark(ctx, p) { T(ctx, '?', 0, 0, p.size ?? 140, p.color || 'red'); },
  // biển chỉ đường hai mũi tên (ngã rẽ): p.w (300)
  signpost(ctx, p) {
    const w = p.w ?? 300; L(ctx, [[0, -w * 0.55], [0, w * 0.6]], W + 1);
    ctx.beginPath(); ctx.moveTo(-w * 0.55, -w * 0.3); ctx.lineTo(-w * 0.05, -w * 0.3); ctx.lineTo(-w * 0.05, -w * 0.12); ctx.lineTo(-w * 0.55, -w * 0.12); ctx.lineTo(-w * 0.65, -w * 0.21); ctx.closePath(); ctx.lineWidth = W; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.05, w * 0.02); ctx.lineTo(w * 0.55, w * 0.02); ctx.lineTo(w * 0.65, w * 0.11); ctx.lineTo(w * 0.55, w * 0.2); ctx.lineTo(w * 0.05, w * 0.2); ctx.closePath(); ctx.fillStyle = BLUE_F; ctx.fill(); ctx.strokeStyle = BLUE; ctx.stroke();
    T(ctx, '?', -w * 0.32, -w * 0.21, w * 0.14, 'red'); T(ctx, '?', w * 0.32, w * 0.11, w * 0.14, 'blue');
  },
  // tên lửa: p.size (240)
  rocket(ctx, p) {
    const s = p.size ?? 300;
    ctx.beginPath(); ctx.moveTo(0, -s / 2); ctx.bezierCurveTo(s * 0.22, -s * 0.3, s * 0.2, s * 0.15, s * 0.14, s * 0.3); ctx.lineTo(-s * 0.14, s * 0.3); ctx.bezierCurveTo(-s * 0.2, s * 0.15, -s * 0.22, -s * 0.3, 0, -s / 2); ctx.fillStyle = '#FBF8F2'; ctx.fill(); ctx.lineWidth = W; ctx.strokeStyle = INK; ctx.stroke();
    C(ctx, 0, -s * 0.12, s * 0.07, {fill: BLUE_F, c: 'blue'});
    for (const k of [-1, 1]) L(ctx, [[k * s * 0.15, s * 0.1], [k * s * 0.3, s * 0.34], [k * s * 0.14, s * 0.3]]);
    for (const [x, l] of [[-s * 0.06, 0.18], [0, 0.26], [s * 0.06, 0.18]]) L(ctx, [[x, s * 0.34], [x, s * (0.34 + l)]], W, 'red');
  },
};
