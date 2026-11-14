// Procedural props. Each draws with origin at its anchor (ground-centre for objects, centre for icons).
// Signature: (ctx, p = params, t = seconds) — must only use the Recorder-compatible Canvas API.
import {color} from './math.mjs';

const INK = '#2A2723';
function poly(ctx, pts, fill, w = 5, stroke = INK) { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); if (fill) { ctx.fillStyle = color(fill); ctx.fill(); } if (w) { ctx.lineWidth = w; ctx.strokeStyle = stroke; ctx.stroke(); } }
function line(ctx, pts, w = 5, c = INK) { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.lineWidth = w; ctx.strokeStyle = color(c); ctx.stroke(); }
function wavyLine(ctx, x0, x1, y, amp, len, phase, w = 4, c = INK) { ctx.beginPath(); for (let x = x0; x <= x1; x += 8) { const yy = y + Math.sin((x / len) * Math.PI * 2 + phase) * amp; x === x0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.lineWidth = w; ctx.strokeStyle = color(c); ctx.stroke(); }

export const PROPS = {
  // Southern Han war junk (side view, bow to the right). p.sail = sail colour
  warship(ctx, p, t) {
    const sail = p.sail || 'navy', W = 760;
    poly(ctx, [[-W / 2, -150], [W / 2 + 30, -170], [W / 2 - 40, -20], [-W / 2 + 60, -10]], 'white', 6);          // hull
    for (let i = 0; i < 3; i++) line(ctx, [[-W / 2 + 30, -120 + i * 34], [W / 2 + 10, -138 + i * 34]], 3);
    poly(ctx, [[-W / 2 - 10, -150], [-W / 2 + 120, -150], [-W / 2 + 120, -220], [-W / 2 - 20, -210]], 'white', 5);  // stern castle
    for (const [x, h, w] of [[-170, 430, 170], [40, 520, 200], [230, 400, 150]]) {
      line(ctx, [[x, -150], [x, -150 - h]], 6);
      ctx.save(); ctx.translate(x, -150 - h * 0.15);
      poly(ctx, [[-w * 0.15, 0], [w * 0.85, 0], [w * 0.75, -h * 0.75], [-w * 0.05, -h * 0.8]], 'white', 5);
      for (let k = 1; k < 6; k++) { const y = -h * 0.8 * k / 6; line(ctx, [[-w * 0.13, y], [w * 0.83 - k * 2, y]], 7, sail); }
      ctx.restore();
      const fl = Math.sin(t * 6 + x) * 8; poly(ctx, [[x, -150 - h], [x + 70, -150 - h + 12 + fl], [x, -150 - h + 30]], sail, 3);
    }
    for (let i = 0; i < 7; i++) { const x = -W / 2 + 120 + i * 85, sw = Math.sin(t * 4 + i * 0.3) * 18; line(ctx, [[x, -60], [x - 50 + sw, 30]], 6, 'wood'); }
    for (let i = 0; i < 6; i++) { const x = -W / 2 + 140 + i * 95; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, -178, 14, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); poly(ctx, [[x - 18, -188], [x, -206], [x + 18, -188]], sail, 3); }
  },
  // small Vietnamese boat with rowers (bow right)
  boat(ctx, p, t) {
    const col = p.color || 'red', W = 380;
    poly(ctx, [[-W / 2, -70], [W / 2 + 20, -80], [W / 2 - 30, 0], [-W / 2 + 40, 0]], 'white', 6);
    line(ctx, [[-W / 2 + 10, -50], [W / 2, -58]], 8, col);
    for (let i = 0; i < 3; i++) { const x = -120 + i * 110, sw = Math.sin(t * 7 + i) * 0.5;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, -120, 22, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      line(ctx, [[x - 22, -128], [x + 22, -128]], 8, col); line(ctx, [[x, -98], [x, -72]], 5);
      line(ctx, [[x + 10, -90], [x + 10 - 60 * Math.cos(sw), 30 + 30 * Math.sin(sw)]], 6, 'wood'); }
  },
  // band of animated waves, width p.w, rows p.rows
  waves(ctx, p, t) {
    const w = p.w || 1200, rows = p.rows || 3, sp = p.speed ?? 1;
    if (p.fill !== false) poly(ctx, [[-w / 2, 0], [w / 2, 0], [w / 2, rows * 50 + 40], [-w / 2, rows * 50 + 40]], p.fill || 'water', 0);
    for (let r = 0; r < rows; r++) wavyLine(ctx, -w / 2, w / 2, r * 50, 10, 140 - r * 15, t * 2.5 * sp + r, 5 - r, r ? 'waterDeep' : INK);
  },
  // row of iron-tipped stakes; p.n count, p.h height, p.spacing
  stakes(ctx, p) {
    const n = p.n || 7, h = p.h || 260, s = p.spacing || 110;
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * s, lean = (i % 2 ? 1 : -1) * 0.12 + 0.25;
      ctx.save(); ctx.translate(x, 0); ctx.rotate(lean);
      poly(ctx, [[-16, 0], [16, 0], [14, -h + 40], [-14, -h + 40]], 'wood', 5);
      poly(ctx, [[-14, -h + 40], [14, -h + 40], [0, -h - 20]], 'steel', 5);
      ctx.restore(); }
  },
  // river cross-section: bed, stakes, water level (p.level 0..1 = low..high)
  riverSection(ctx, p, t) {
    const w = p.w || 1000, depth = 520, lvl = p.level ?? 1;
    poly(ctx, [[-w / 2, -depth], [-w / 2 + 120, 0], [w / 2 - 120, 0], [w / 2, -depth], [w / 2, 60], [-w / 2, 60]], '#D9C7A3', 5);
    const wy = -depth + 40 + (1 - lvl) * 330;
    PROPS.stakes(ctx, {n: 6, h: 300, spacing: 120}, t);
    ctx.globalAlpha = 0.55; poly(ctx, [[-w / 2 + 20, wy], [w / 2 - 20, wy], [w / 2 - 120, 0], [-w / 2 + 120, 0]], 'water', 0); ctx.globalAlpha = 1;
    wavyLine(ctx, -w / 2 + 30, w / 2 - 30, wy, 8, 120, t * 3, 5, 'waterDeep');
  },
  seal(ctx, p, t) { poly(ctx, [[-110, -60], [110, -60], [110, 120], [-110, 120]], 'gold', 6); poly(ctx, [[-40, -60], [40, -60], [30, -120], [-30, -120]], 'gold', 5); ctx.beginPath(); ctx.arc(0, -130, 26, 0, Math.PI * 2); ctx.fillStyle = color('gold'); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); },
  scroll(ctx, p) { poly(ctx, [[-160, -100], [160, -100], [160, 100], [-160, 100]], '#F6EBCF', 5); for (const x of [-170, 170]) poly(ctx, [[x - 14, -116], [x + 14, -116], [x + 14, 116], [x - 14, 116]], 'wood', 5); for (let i = 0; i < 4; i++) line(ctx, [[-110, -50 + i * 34], [110, -50 + i * 34]], 4, '#9b8f75'); },
  // Cổ Loa: three concentric spiral ramparts seen from above-ish
  citadel(ctx, p) {
    for (const [rx, ry] of [[420, 170], [300, 120], [180, 72]]) { ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0.2, Math.PI * 2 - 0.2); ctx.lineWidth = 26; ctx.strokeStyle = color('#B9A27A'); ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.ellipse(0, 0, rx + 13, ry + 13, 0, 0.2, Math.PI * 2 - 0.2); ctx.stroke(); }
    poly(ctx, [[-60, -10], [60, -10], [60, -80], [0, -120], [-60, -80]], 'red', 5);
  },
  sun(ctx, p, t) { ctx.fillStyle = color(p.color || 'gold'); ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * 0.3; line(ctx, [[Math.cos(a) * 120, Math.sin(a) * 120], [Math.cos(a) * 160, Math.sin(a) * 160]], 6, 'gold'); } },
  cloud(ctx, p, t) { ctx.fillStyle = '#fff'; ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-150, 30); ctx.bezierCurveTo(-190, -40, -100, -80, -60, -40); ctx.bezierCurveTo(-40, -110, 70, -100, 70, -40); ctx.bezierCurveTo(140, -70, 190, 20, 130, 30); ctx.closePath(); ctx.fill(); ctx.stroke(); },
  tree(ctx, p, t) { const sw = Math.sin(t * 1.5) * 6; poly(ctx, [[-22, 0], [22, 0], [14, -230], [-14, -230]], 'wood', 5); ctx.fillStyle = color(p.color || 'green'); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-150, -230); ctx.bezierCurveTo(-200 + sw, -340, -90, -460, 0 + sw, -440); ctx.bezierCurveTo(100, -470, 200 + sw, -350, 150, -230); ctx.closePath(); ctx.fill(); ctx.stroke(); },
  grass(ctx, p) { for (let i = -3; i <= 3; i++) line(ctx, [[i * 14, 0], [i * 18, -30 - (i % 2) * 14]], 5, 'green'); },
  house(ctx, p) { poly(ctx, [[-150, 0], [150, 0], [150, -180], [-150, -180]], 'white', 6); poly(ctx, [[-190, -170], [0, -320], [190, -170]], p.roof || '#B5653B', 6); poly(ctx, [[-35, 0], [35, 0], [35, -110], [-35, -110]], 'wood', 5); },
  mountain(ctx, p) { poly(ctx, [[-420, 0], [-120, -420], [40, -230], [180, -360], [420, 0]], p.color || '#A9B79A', 6); },
  hill(ctx, p) { ctx.fillStyle = color(p.color || '#B9CC9C'); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(-600, 0); ctx.quadraticCurveTo(0, -260, 600, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); },
  ground(ctx, p) { line(ctx, [[-(p.w || 1000) / 2, 0], [(p.w || 1000) / 2, 4]], 3, 'rgba(42,39,35,.55)'); },
  // curved (optionally dashed) arrow from (0,0) to (p.dx, p.dy); p.progress 0..1
  arrow(ctx, p) {
    const dx = p.dx ?? 300, dy = p.dy ?? -200, bend = p.bend ?? 0.3, pr = p.progress ?? 1, c = p.color || 'navy';
    const cx = dx / 2 - dy * bend, cy = dy / 2 + dx * bend, pts = [];
    for (let i = 0; i <= 40 * pr; i++) { const u = i / 40, v = 1 - u; pts.push([2 * v * u * cx + u * u * dx, 2 * v * u * cy + u * u * dy]); }
    if (p.dashed) for (let i = 0; i + 2 < pts.length; i += 4) line(ctx, [pts[i], pts[i + 2]], 8, c); else line(ctx, pts, 8, c);
    if (pr > 0.97) { const a = Math.atan2(dy - cy, dx - cx); poly(ctx, [[dx, dy], [dx - 40 * Math.cos(a - 0.45), dy - 40 * Math.sin(a - 0.45)], [dx - 40 * Math.cos(a + 0.45), dy - 40 * Math.sin(a + 0.45)]], c, 0); }
  },
  stamp(ctx, p) { ctx.save(); ctx.rotate(-0.2); poly(ctx, [[-130, -100], [130, -100], [130, 100], [-130, 100]], null, 10, color('red')); line(ctx, [[-90, -70], [90, 70]], 16, 'red'); line(ctx, [[90, -70], [-90, 70]], 16, 'red'); ctx.restore(); },
  panel(ctx, p) { poly(ctx, [[-150, -150], [150, -150], [150, 150], [-150, 150]], p.fill || 'white', 6); },
  question(ctx, p) { ctx.fillStyle = color(p.color || 'red'); ctx.font = `${p.size || 220}px Hand`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0); },
  map(ctx, p) {  // stylised coastline panel (not a geographic claim): land left, sea right, river mouth
    poly(ctx, [[-380, -300], [380, -300], [380, 300], [-380, 300]], '#EAF1F6', 6);
    poly(ctx, [[-380, -300], [80, -300], [40, -150], [120, -40], [60, 80], [140, 200], [80, 300], [-380, 300]], '#E6D7AE', 5);
    line(ctx, [[-300, -120], [-120, -60], [0, 20], [80, 80]], 10, 'waterDeep');
  },

  // --- v2 (Rùa và Thỏ) ---
  // finish line: checkered strip on the ground + two posts with a tape. p.w width, p.h post height, p.broken 0..1 (tape snaps and falls),
  // p.tape (false = no posts/tape), p.tapeColor, p.label (text on a banner across the posts, e.g. "ĐÍCH")
  finishLine(ctx, p, t) {
    const w = p.w || 700, h = p.h || 330, br = Math.max(0, Math.min(1, p.broken ?? 0)), tape = p.tape !== false, tc = p.tapeColor || 'red';
    checkerStrip(ctx, w, p.rows || 2);
    if (!tape) return;
    for (const x of [-w / 2, w / 2]) { poly(ctx, [[x - 11, 4], [x + 11, 4], [x + 9, -h], [x - 9, -h]], 'white', 5); for (let k = 1; k < 4; k++) poly(ctx, [[x - 10, -h * k / 4], [x + 10, -h * k / 4], [x + 10, -h * k / 4 + 24], [x - 10, -h * k / 4 + 24]], 'red', 3); }
    if (p.label) { poly(ctx, [[-w / 2 - 20, -h - 90], [w / 2 + 20, -h - 90], [w / 2 + 20, -h - 10], [-w / 2 - 20, -h - 10]], 'white', 6);
      ctx.fillStyle = color(p.labelColor || 'red'); ctx.font = `bold ${p.labelSize || 64}px Hand`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.label, 0, -h - 48); }
    const ty = -h * 0.55, half = w / 2, flut = Math.sin(t * 5) * 6;
    if (br <= 0) { // taut, slight sag + flutter
      const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20, x = -half + u * w; pts.push([x, ty + Math.sin(u * Math.PI) * (14 + flut)]); }
      ribbon(ctx, pts, 22, tc);
    } else { // two halves swing down from their posts
      for (const s of [-1, 1]) { const ang = br * 1.35, L = half * (1 - 0.15 * br), pts = [];
        for (let i = 0; i <= 12; i++) { const u = i / 12, a = ang * (0.6 + 0.4 * u) + Math.sin(t * 7 + u * 3) * 0.06 * br; pts.push([s * half - s * u * L * Math.cos(a), ty + u * L * Math.sin(a)]); }
        ribbon(ctx, pts, 22, tc); }
    }
  },
  // start line: checkered strip only (no posts). p.w, p.rows, p.label (painted text in front of the strip)
  startLine(ctx, p) {
    checkerStrip(ctx, p.w || 700, p.rows || 2);
    if (p.label) { ctx.fillStyle = color(p.labelColor || 'ink'); ctx.font = `bold ${p.labelSize || 54}px Hand`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.label, 0, 70); }
  },
  // chequered flag planted in the ground, waving. p.h pole height, p.size flag width, p.wind amplitude (default 1)
  checkerFlag(ctx, p, t) {
    const h = p.h || 420, W = p.size || 200, H = W * 0.7, nx = 5, ny = 4, amp = 14 * (p.wind ?? 1);
    poly(ctx, [[-30, 6], [30, 6], [20, -10], [-20, -10]], '#9b8f75', 4);
    const pt = (u, v) => [8 + u * W, -h + v * H + Math.sin(t * 6 - u * 3.2) * amp * u + u * 6];
    const pts = []; for (let i = 0; i <= nx; i++) pts.push(pt(i / nx, 0)); for (let i = nx; i >= 0; i--) pts.push(pt(i / nx, 1));
    poly(ctx, pts, 'white', 6);
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) if ((i + j) % 2 === 0) {
      const a = pt(i / nx, j / ny), b = pt((i + 1) / nx, j / ny), c = pt((i + 1) / nx, (j + 1) / ny), d = pt(i / nx, (j + 1) / ny);
      poly(ctx, [a, b, c, d], INK, 0); }
    poly(ctx, pts, null, 6);
    poly(ctx, [[-8, 0], [8, 0], [8, -h - 10], [-8, -h - 10]], 'wood', 5);
    ctx.beginPath(); ctx.arc(0, -h - 20, 14, 0, Math.PI * 2); ctx.fillStyle = color('gold'); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  },
  // "Z z z" rising and fading in a loop. Origin = just above the sleeper's head. p.size (default 1), p.color, p.speed
  zzz(ctx, p, t) {
    const sz = p.size ?? 1, col = color(p.color || 'navy'), per = 2.4 / (p.speed ?? 1);
    for (let i = 0; i < 3; i++) {
      const u = ((t / per + i / 3) % 1), s = (34 + 46 * u) * sz, x = (20 + u * 120 + Math.sin(u * 6 + i) * 18) * sz, y = -u * 260 * sz;
      ctx.save(); ctx.globalAlpha = Math.min(1, u * 5) * (1 - Math.pow(u, 3)); ctx.translate(x, y); ctx.rotate(-0.15 + Math.sin(t * 2 + i) * 0.1);
      line(ctx, [[-s / 2, -s / 2], [s / 2, -s / 2], [-s / 2, s / 2], [s / 2, s / 2]], 16 * sz * (0.6 + 0.4 * u) + 6, INK);
      line(ctx, [[-s / 2, -s / 2], [s / 2, -s / 2], [-s / 2, s / 2], [s / 2, s / 2]], 8 * sz * (0.6 + 0.4 * u), col);
      ctx.restore();
    }
  },
  // dust puffs + speed lines kicked up behind a runner. Origin = runner's feet on the ground.
  // p.dir 1 = runner faces right (dust trails to the left), -1 opposite; p.size; p.n puffs; p.progress 0..1 intensity (default 1); p.lines (false = no speed lines)
  dust(ctx, p, t) {
    const dir = p.dir ?? 1, sz = p.size ?? 1, n = p.n || 5, pr = p.progress ?? 1, per = 0.7;
    if (pr <= 0) return;
    for (let i = 0; i < n; i++) {
      const u = (t / per + i / n) % 1, r = (34 + 56 * u) * sz * (0.5 + 0.5 * pr), x = -dir * (50 + u * 320 * pr) * sz, y = -(18 + u * 80 + (i % 2) * 20) * sz;
      ctx.save(); ctx.globalAlpha = Math.min(1, 1.6 * (1 - u)); puff(ctx, x, y, r, p.color || '#DCC8A2'); ctx.restore();
    }
    if (p.lines !== false) for (let k = 0; k < 3; k++) { const y = -(90 + k * 70) * sz, L = (130 + 50 * ((k * 7 + Math.floor(t * 12)) % 3)) * pr * sz, x0 = -dir * (90 + k * 30) * sz;
      line(ctx, [[x0, y], [x0 - dir * L, y]], 6, 'rgba(42,39,35,.6)'); }
  },
  // thought bubble: cloud with trailing dots toward the origin (put the origin near the thinker's head).
  // p.dx, p.dy bubble centre offset (default 170, -260); p.w, p.h; p.text, p.size, p.color; p.icon 'pillow'; p.progress 0..1 (dots then cloud appear)
  thought(ctx, p) {
    const dx = p.dx ?? 170, dy = p.dy ?? -260, W = p.w || 300, H = p.h || 200, pr = p.progress ?? 1;
    for (let i = 0; i < 3; i++) { if (pr < (i + 1) * 0.15) break; const u = (i + 1) / 4; ctx.beginPath(); ctx.arc(dx * u * 0.8, dy * u * 0.75, 10 + i * 7, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
    if (pr < 0.5) return;
    ctx.save(); ctx.translate(dx, dy); const k = Math.min(1, (pr - 0.5) * 2); ctx.scale(k, k);
    ctx.beginPath(); const n = 9;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, b = (i + 0.5) / n * Math.PI * 2, a2 = (i + 1) / n * Math.PI * 2;
      if (!i) ctx.moveTo(W / 2 * Math.cos(a), H / 2 * Math.sin(a));
      ctx.quadraticCurveTo(W / 2 * 1.28 * Math.cos(b), H / 2 * 1.32 * Math.sin(b), W / 2 * Math.cos(a2), H / 2 * Math.sin(a2)); }
    ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    if (p.icon === 'pillow') {
      ctx.beginPath(); ctx.moveTo(-90, -40); ctx.quadraticCurveTo(0, -60, 90, -40); ctx.quadraticCurveTo(110, 0, 90, 40); ctx.quadraticCurveTo(0, 60, -90, 40); ctx.quadraticCurveTo(-110, 0, -90, -40); ctx.closePath();
      ctx.fillStyle = color(p.iconColor || '#BFD7EA'); ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
      line(ctx, [[-60, -10], [-30, 4]], 4); line(ctx, [[40, 10], [62, -6]], 4);
    }
    if (p.text) { ctx.fillStyle = color(p.color || 'ink'); ctx.font = `bold ${p.size || 56}px Hand`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, 0, p.icon ? 75 : 0); }
    ctx.restore();
  },
  // --- v3 (bản đồ dữ liệu: Rừng Amazon) ---
  // Bảng thông tin. Neo = GIỮA CẠNH TRÊN; chiều cao tự tính. p.w (760), p.label (nhãn nhỏ viết hoa, vàng), p.title ("\n" tách dòng),
  // p.big (số lớn), p.bigColor, p.strike (gạch ngang đỏ qua số), p.bars [{label,value 0..1,color,text}], p.progress 0..1 (thanh mọc dần),
  // p.source (dòng nguồn; tự thêm "NGUỒN: " nếu thiếu), p.titleSize, p.bigSize
  infoPanel(ctx, p) {
    const w = p.w || 760, pad = 36, inner = w - pad * 2, pr = Math.max(0, Math.min(1, p.progress ?? 1));
    const tl = p.title ? String(p.title).split('\n') : [];
    const tsz = Math.min(p.titleSize || 50, inner / (Math.max(1, ...tl.map(s => s.length)) * 0.56));
    const big = p.big != null ? String(p.big) : '', bsz = Math.min(p.bigSize || 140, inner / (Math.max(1, big.length) * 0.6));
    const bars = (p.bars || []).slice(0, 4);
    let src = p.source ? String(p.source) : ''; if (src) src = /^ngu[oồ]n\s*:/i.test(src) ? src.replace(/^ngu[oồ]n/i, 'NGUỒN') : 'NGUỒN: ' + src;
    const sl = src ? wrapText(src, Math.floor(inner / (26 * 0.54))) : [];
    let h = pad;
    if (p.label) h += 44; if (tl.length) h += tl.length * tsz * 1.2 + 14; if (big) h += bsz * 1.1 + 10; h += bars.length * 84; if (sl.length) h += sl.length * 30 + 10;
    h += pad - 6; if (h < 120) h = 120;
    ctx.beginPath(); ctx.roundRect(-w / 2, 0, w, h, 20); ctx.globalAlpha = 0.92; ctx.fillStyle = color('paper'); ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.globalAlpha = 0.75; ctx.stroke(); ctx.globalAlpha = 1;
    const L = -w / 2 + pad; let y = pad;
    if (p.label) { line(ctx, [[L, y + 2], [L + 10, y + 2]], 5, 'gold'); sansText(ctx, p.label, L + 22, y - 10, 30, 'gold'); y += 44; }
    for (const s of tl) { sansText(ctx, s, L, y, tsz, INK); y += tsz * 1.2; }
    if (tl.length) y += 14;
    if (big) {
      sansText(ctx, big, L, y, bsz, p.bigColor || INK);
      if (p.strike) { const bw = big.length * bsz * 0.58; line(ctx, [[L - 12, y + bsz * 0.52], [L + bw + 12, y + bsz * 0.5]], 14, 'red'); }
      y += bsz * 1.1 + 10;
    }
    bars.forEach((b, i) => {
      const k = Math.max(0, Math.min(1, pr * (1 + 0.3 * (bars.length - 1)) - 0.3 * i)), v = Math.max(0, Math.min(1, b.value ?? 0.5)) * k;
      sansText(ctx, b.label || '', L, y, 30, INK);
      if (b.text) sansText(ctx, b.text, L + inner, y, 30, b.color || 'gold', 'right');
      ctx.beginPath(); ctx.roundRect(L, y + 40, inner, 26, 13); ctx.globalAlpha = 0.25; ctx.fillStyle = INK; ctx.fill(); ctx.globalAlpha = 1;
      if (v > 0.002) { ctx.beginPath(); ctx.roundRect(L, y + 40, Math.max(26, inner * v), 26, 13); ctx.fillStyle = color(b.color || 'gold'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
      y += 84;
    });
    sl.forEach((s, i) => { ctx.globalAlpha = 0.65; sansText(ctx, s, L, y + 6 + i * 30, 26, INK); ctx.globalAlpha = 1; });
  },
  // Bản đồ Nam Mỹ MINH HỌA (đường bờ đơn giản hóa, không chính xác địa lý). Neo = tâm (~600x880 px).
  // p.fill 0..1 (vùng Amazon loang dần, mặc định 1), p.lost 0..1 (mép đông nam chuyển đỏ gạch), p.label (nhãn góc, mặc định "BẢN ĐỒ MINH HỌA"; "" để ẩn),
  // p.land (màu đất liền), p.color (màu Amazon, mặc định green)
  southAmericaMap(ctx, p) {
    const fill = Math.max(0, Math.min(1, p.fill ?? 1)), lost = Math.max(0, Math.min(1, p.lost ?? 0));
    blobPath(ctx, SA_COAST.map(saP)); ctx.fillStyle = color(p.land || 'white'); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    if (fill > 0.01) {
      const c = saP(-63, -4), k = Math.max(0.05, fill);
      ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(k, k); ctx.translate(-c[0], -c[1]);
      ctx.globalAlpha = Math.min(1, fill * 3); blobPath(ctx, SA_AMAZON.map(saP)); ctx.fillStyle = color(p.color || 'green'); ctx.fill(); ctx.lineWidth = 4 / k; ctx.strokeStyle = INK; ctx.stroke();
      if (lost > 0.01) {
        const E = SA_LOST_E.map(saP), I = SA_LOST_I.map(saP), inner = E.map((e, i) => [e[0] + (I[i][0] - e[0]) * lost, e[1] + (I[i][1] - e[1]) * lost]).reverse();
        ctx.beginPath(); [...E, ...inner].forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fillStyle = color('red'); ctx.fill(); ctx.lineWidth = 3 / k; ctx.stroke();
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }
    const lb = p.label ?? 'BẢN ĐỒ MINH HỌA';
    if (lb) { ctx.globalAlpha = 0.7; sansText(ctx, lb, 300, 400, 26, INK, 'right'); ctx.globalAlpha = 1; }
  },
  // Ghim địa danh: neo = đúng điểm cần chỉ. p.label (chữ, nên viết hoa), p.color (gold), p.side 1 = nhãn bên phải / -1 trái / 0 phía trên (mặc định 1), p.size (1), p.progress 0..1 (hiện dần)
  pin(ctx, p, t) {
    const pr = Math.max(0, Math.min(1, p.progress ?? 1)), sz = p.size ?? 1, c = p.color || 'gold', side = p.side ?? 1;
    if (pr <= 0) return;
    ctx.save(); ctx.scale(sz, sz); ctx.globalAlpha = Math.min(1, pr * 2);
    const ph = (t * 0.9) % 1; ctx.beginPath(); ctx.arc(0, 0, 22 + ph * 26, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = color(c); ctx.globalAlpha = Math.min(1, pr * 2) * (1 - ph); ctx.stroke(); ctx.globalAlpha = Math.min(1, pr * 2);
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fillStyle = color(c); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    if (p.label && pr > 0.4) {
      const fs = 34, tw = String(p.label).length * fs * 0.6 + 28, x0 = side > 0 ? 34 : side < 0 ? -34 - tw : -tw / 2, y0 = side === 0 ? -34 - 52 : -26;
      ctx.beginPath(); ctx.roundRect(x0, y0, tw, 52, 12); ctx.globalAlpha = 0.9; ctx.fillStyle = color('paper'); ctx.fill(); ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
      sansText(ctx, p.label, x0 + tw / 2, y0 + 7, fs, INK, 'center');
    }
    ctx.restore();
  },
  // Sông uốn lượn nhìn từ trên, từ góc trên-trái xuống góc dưới-phải (~560x900), to dần về cửa sông, có 2 nhánh phụ.
  // p.progress 0..1 (vẽ dần), p.w bề rộng ở cửa sông (44), p.color (waterDeep), p.branches (false = bỏ nhánh)
  riverPath(ctx, p) {
    const pr = Math.max(0, Math.min(1, p.progress ?? 1)), W = p.w || 44, c = p.color || 'waterDeep', N = 70;
    const main = []; for (let i = 0; i <= N; i++) { const u = i / N; main.push([-250 + 500 * u + 90 * Math.sin(u * Math.PI * 5) * (1 - 0.25 * u), -450 + 900 * u]); }
    const wd = u => W * (0.25 + 0.75 * u);
    const paths = [{pts: main, k: pr, w0: 0.25, w1: 1}];
    if (p.branches !== false) for (const [uj, sx, sy] of [[0.35, 230, -300], [0.62, -290, 60]]) {
      const J = main[Math.round(uj * N)], pts = []; for (let i = 0; i <= 24; i++) { const u = i / 24, bx = sx + (J[0] - sx) * u, by = sy + (J[1] - sy) * u; pts.push([bx + 40 * Math.sin(u * 9) * (1 - u), by + 30 * Math.cos(u * 7) * (1 - u)]); }
      paths.push({pts, k: Math.max(0, Math.min(1, pr / uj)), w0: 0.18, w1: 0.45});
    }
    for (const pass of [0, 1]) for (const b of paths) {
      const n = Math.floor((b.pts.length - 1) * b.k);
      for (let i = 0; i < n; i++) { const u = i / (b.pts.length - 1), w = W * (b.w0 + (b.w1 - b.w0) * u) * (b === paths[0] ? 1 : 1);
        line(ctx, [b.pts[i], b.pts[i + 1]], pass ? w : w + 10, pass ? c : INK); }
    }
  },
  // "Sông bay": vài đường cong nét đứt song song trôi dọc theo hướng (dx,dy). p.strength 0..1 (yếu thì mờ và đứt đoạn),
  // p.dx, p.dy (hướng, mặc định 700,-250), p.n số đường (4), p.gap khoảng cách (46), p.color (navy), p.progress 0..1 (dài ra dần)
  vaporFlow(ctx, p, t) {
    const dx = p.dx ?? 700, dy = p.dy ?? -250, st = Math.max(0, Math.min(1, p.strength ?? 1)), n = p.n || 4, gap = p.gap ?? 46, pr = Math.max(0, Math.min(1, p.progress ?? 1)), c = p.color || 'navy';
    const L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, per = 0.045, ph = (t * 0.35) % 1;
    for (let r = 0; r < n; r++) {
      const off = (r - (n - 1) / 2) * gap, bend = 0.22 + (r % 2) * 0.06;
      const P = u => { const bx = dx * u, by = dy * u, a = Math.sin(u * Math.PI) * L * bend; return [bx + nx * (off + a), by + ny * (off + a)]; };
      for (let k = -1; k < 1 / (per * 2) + 1; k++) {
        const u0 = (k + ph) * per * 2, u1 = u0 + per;
        if (u0 < 0 || u1 > pr) continue;
        const hsh = Math.abs(Math.sin((k + r * 7 + Math.floor(t * 0.35)) * 12.9898 + r * 78.233)) % 1;
        if (st < 1 && hsh > 0.25 + 0.75 * st) continue;
        const pts = []; for (let j = 0; j <= 4; j++) pts.push(P(u0 + (u1 - u0) * j / 4));
        ctx.globalAlpha = 0.3 + 0.7 * st; line(ctx, pts, 12, INK); line(ctx, pts, 7, c);
        if (k % 3 === 0 && st > 0.3) { const q = P(u0 + per * 0.3); ctx.beginPath(); ctx.arc(q[0] + nx * 18, q[1] + ny * 18, 6, 0, Math.PI * 2); ctx.fillStyle = color(c); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    }
  },
  // Cây rừng nhiệt đới cao, tán nhiều tầng, dây leo. Neo = gốc. p.h chiều cao thân (520), p.color (green), p.sway (1)
  jungleTree(ctx, p, t) {
    const h = p.h || 520, c = p.color || 'green', sw = Math.sin(t * 1.2) * 7 * (p.sway ?? 1);
    poly(ctx, [[-62, 0], [-24, -90], [-16, -h], [18, -h], [26, -90], [66, 0]], 'wood', 5);
    line(ctx, [[-8, -60], [-6, -h * 0.5]], 3, '#6b4a2b'); line(ctx, [[12, -80], [10, -h * 0.7]], 3, '#6b4a2b');
    const tier = (x, y, rx, ry, col) => { ctx.beginPath(); ctx.ellipse(x + sw * (-y / h), y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = color(col); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); };
    tier(-60, -h * 0.62, 150, 62, '#3F6B34'); tier(70, -h * 0.78, 140, 58, '#3F6B34');
    tier(0, -h * 0.9, 210, 80, c); tier(-30, -h - 40, 150, 62, c);
    for (const [x, y0, l] of [[-120, -h * 0.9 + 40, 200], [90, -h * 0.9 + 50, 260], [-30, -h * 0.62 + 40, 170]]) {
      const pts = []; for (let i = 0; i <= 6; i++) pts.push([x + Math.sin(i + x) * 8 + sw * 0.3, y0 + l * i / 6]); line(ctx, pts, 5, '#3F6B34');
      for (let i = 2; i <= 6; i += 2) poly(ctx, [[pts[i][0], pts[i][1]], [pts[i][0] + 18, pts[i][1] + 8], [pts[i][0] + 4, pts[i][1] + 24]], c, 3);
    }
  },
  // Gốc cây bị chặt (không lửa, không cưa máy). Neo = chân. p.size (1), p.color (wood)
  stump(ctx, p) {
    const s = p.size ?? 1, c = p.color || 'wood'; ctx.save(); ctx.scale(s, s);
    poly(ctx, [[-120, 6], [-70, -40], [-62, -120], [62, -120], [70, -40], [120, 6], [60, 12], [-60, 12]], c, 5);
    line(ctx, [[-30, -30], [-26, -100]], 3, '#6b4a2b'); line(ctx, [[34, -34], [30, -96]], 3, '#6b4a2b');
    ctx.beginPath(); ctx.ellipse(0, -120, 62, 22, 0, 0, Math.PI * 2); ctx.fillStyle = '#E3C08D'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    for (const k of [0.62, 0.3]) { ctx.beginPath(); ctx.ellipse(0, -120, 62 * k, 22 * k, 0, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.stroke(); }
    ctx.restore();
  },
  // Vẹt đuôi dài bay ngang (đỏ/vàng/xanh). Neo = tâm thân. p.dir 1 = bay sang phải, p.size (1), p.color (red)
  parrot(ctx, p, t) {
    const dir = p.dir ?? 1, s = p.size ?? 1, flap = Math.sin(t * 9) * 0.5; ctx.save(); ctx.scale(dir * s, s);
    poly(ctx, [[-40, 0], [-190, 36], [-230, 62], [-226, 90], [-190, 82], [-200, 112], [-160, 104], [-50, 38]], 'navy', 5);
    ctx.beginPath(); ctx.ellipse(0, 0, 70, 38, -0.25, 0, Math.PI * 2); ctx.fillStyle = color(p.color || 'red'); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.save(); ctx.translate(-5, -10); ctx.rotate(-0.4 - flap); poly(ctx, [[0, 0], [-50, -70], [-100, -80], [-60, -20], [-30, 10]], 'gold', 5); ctx.restore();
    ctx.beginPath(); ctx.arc(62, -30, 28, 0, Math.PI * 2); ctx.fillStyle = color(p.color || 'red'); ctx.fill(); ctx.stroke();
    poly(ctx, [[84, -42], [112, -28], [96, -6], [86, -14]], 'gold', 4);
    ctx.beginPath(); ctx.arc(66, -38, 6, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
    ctx.restore();
  },
  // --- Tượng đá cà khịa (style tuong-da): marble bust on a pedestal, ground-centre anchor, ~760 px tall.
  // p.tone marble|basalt · p.hair curls|laurel|coral|hood|bald · p.beard · p.mouth closed|open|grin|shout · p.talk (mouth moves)
  // p.brows calm|angry|smug|sad · p.eyes blank|look · p.headphones colour · p.glasses (pixel shades) · p.crack · p.hold trident|bolt|mic|scroll|card · p.holdColor
  bust(ctx, p, t) {
    const basalt = p.tone === 'basalt', M = basalt ? '#5A534B' : '#E9DCC4', MS = basalt ? '#3F3933' : '#C9B79A', hr = hash(p.seed || 3);
    poly(ctx, [[-170, 0], [170, 0], [150, -50], [-150, -50]], MS, 6); poly(ctx, [[-80, -50], [80, -50], [60, -115], [-60, -115]], M, 6); poly(ctx, [[-150, -115], [150, -115], [135, -150], [-135, -150]], MS, 6);
    ctx.beginPath(); ctx.moveTo(-215, -150); ctx.bezierCurveTo(-260, -230, -270, -340, -205, -395); ctx.quadraticCurveTo(-120, -440, -55, -430); ctx.lineTo(55, -430); ctx.quadraticCurveTo(120, -440, 205, -395); ctx.bezierCurveTo(270, -340, 260, -230, 215, -150); ctx.closePath();
    ctx.fillStyle = M; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    line(ctx, [[-150, -300], [-60, -270], [0, -295], [60, -270], [150, -300]], 4, MS); line(ctx, [[0, -295], [0, -190]], 3, MS);
    poly(ctx, [[-52, -425], [52, -425], [48, -485], [-48, -485]], M, 6);
    const hy = -575, talk = p.talk ? Math.abs(Math.sin(t * 13)) : 0;
    if (p.hair === 'hood') { ctx.beginPath(); ctx.moveTo(-170, -420); ctx.bezierCurveTo(-190, -620, -120, -730, 0, -735); ctx.bezierCurveTo(120, -730, 190, -620, 170, -420); ctx.closePath(); ctx.fillStyle = '#2E2925'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.beginPath(); ctx.ellipse(0, hy, 102, 128, 0, 0, Math.PI * 2); ctx.fillStyle = M; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = hr() * Math.PI * 2, rr = Math.sqrt(hr()); ctx.beginPath(); ctx.arc(Math.cos(a) * 85 * rr, hy + Math.sin(a) * 110 * rr, 1.5 + hr() * 2, 0, Math.PI * 2); ctx.fillStyle = basalt ? '#4A443D' : '#D3C3A6'; ctx.fill(); }
    if (p.beard) { ctx.beginPath(); ctx.moveTo(-100, hy + 10); ctx.bezierCurveTo(-120, hy + 150, -60, hy + 215, 0, hy + 230); ctx.bezierCurveTo(60, hy + 215, 120, hy + 150, 100, hy + 10); ctx.quadraticCurveTo(60, hy + 90, 0, hy + 85); ctx.quadraticCurveTo(-60, hy + 90, -100, hy + 10); ctx.closePath(); ctx.fillStyle = M; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      for (let i = 0; i < 7; i++) { const x = -75 + i * 25; line(ctx, [[x, hy + 100 + (i % 2) * 15], [x * 0.8, hy + 150 + (i % 3) * 18], [x * 0.55, hy + 195]], 3, MS); } }
    if (p.hair === 'curls' || p.hair === 'laurel' || !p.hair) for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * 0.112); puffC(ctx, Math.cos(a) * 98, hy + Math.sin(a) * 118, 30, M); }
    if (p.hair === 'laurel') for (let i = 0; i < 10; i++) { const a = Math.PI * (1.0 + i * 0.11), x = Math.cos(a) * 112, y = hy - 10 + Math.sin(a) * 118; ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2); ctx.beginPath(); ctx.ellipse(0, 0, 11, 24, 0.5, 0, Math.PI * 2); ctx.fillStyle = color('gold'); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    if (p.hair === 'coral') for (const sx of [-1, 1]) { const c = color(p.hairColor || 'red'); line(ctx, [[sx * 70, hy - 90], [sx * 140, hy - 190]], 16, c); line(ctx, [[sx * 105, hy - 140], [sx * 175, hy - 150]], 13, c); line(ctx, [[sx * 125, hy - 165], [sx * 120, hy - 235]], 12, c); line(ctx, [[sx * 95, hy - 70], [sx * 170, hy - 90]], 12, c); }
    if (p.headphones) { const c = color(p.headphones); ctx.beginPath(); ctx.arc(0, hy - 10, 132, Math.PI * 1.05, Math.PI * 1.95); ctx.lineWidth = 26; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 16; ctx.strokeStyle = c; ctx.stroke();
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 112, hy + 5, 36, 58, 0, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.ellipse(sx * 100, hy + 5, 14, 34, 0, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); } }
    const br = p.brows || 'calm', by = hy - 30, tilt = br === 'angry' ? 18 : br === 'sad' ? -14 : br === 'smug' ? 8 : 0;
    line(ctx, [[-70, by - (br === 'smug' ? 10 : 0)], [-22, by + tilt]], 9); line(ctx, [[70, by], [22, by + tilt]], 9);
    if (p.glasses) { ctx.fillStyle = '#0B0B0B'; ctx.fillRect(-95, hy - 22, 190, 18); for (const sx of [-1, 1]) { ctx.fillRect(sx > 0 ? 14 : -84, hy - 4, 70, 26); ctx.fillRect(sx > 0 ? 24 : -74, hy + 22, 50, 12); ctx.fillStyle = '#F4F4F4'; ctx.fillRect(sx > 0 ? 24 : -74, hy, 12, 12); ctx.fillStyle = '#0B0B0B'; } }
    else for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * 42, hy + 2, 22, 13, 0, 0, Math.PI * 2); ctx.fillStyle = basalt ? '#7A7168' : '#F6EEDD'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
      if (p.eyes === 'look') { ctx.beginPath(); ctx.arc(sx * 42 + 6, hy + 3, 7, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); } }
    line(ctx, [[0, hy + 5], [-14, hy + 50], [6, hy + 56]], 4);
    const mo = p.mouth || 'closed', my = hy + 80, open = mo === 'shout' ? 0.75 + talk * 0.25 : mo === 'open' ? 0.4 + talk * 0.5 : talk * 0.6;
    if (mo === 'grin') { ctx.beginPath(); ctx.moveTo(-48, my - 10); ctx.quadraticCurveTo(0, my + 38, 48, my - 10); ctx.closePath(); ctx.fillStyle = '#F6F0E2'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); line(ctx, [[-40, my], [40, my]], 3); }
    else if (open > 0.05) { const w = mo === 'shout' ? 46 : 32; ctx.beginPath(); ctx.ellipse(0, my + open * 12, w, 6 + open * 40, 0, 0, Math.PI * 2); ctx.fillStyle = '#2A1612'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
      if (open > 0.35) { ctx.fillStyle = '#F2EAD8'; ctx.fillRect(-w * 0.7, my + open * 12 - 6 - open * 36, w * 1.4, 10); } }
    else line(ctx, [[-30, my], [0, my + (br === 'smug' ? -6 : 3)], [32, my - (br === 'smug' ? 12 : 0)]], 6);
    if (p.crack) { line(ctx, [[-20, hy - 128], [-30, hy - 80], [-8, hy - 55], [-34, hy - 20]], 4, '#9E3B2A'); line(ctx, [[60, hy - 110], [48, hy - 70], [70, hy - 40]], 3, '#9E3B2A'); }
    if (p.hold) { ctx.save(); ctx.translate(190, -250); const hc = p.holdColor;
      if (p.hold === 'trident') PROPS.trident(ctx, {color: hc, h: 620}, t);
      else if (p.hold === 'bolt') { ctx.save(); ctx.translate(0, -150); ctx.rotate(0.15); PROPS.bolt(ctx, {color: hc}, t); ctx.restore(); }
      else if (p.hold === 'mic') { line(ctx, [[0, 30], [0, -140]], 16, '#3A3530'); ctx.beginPath(); ctx.ellipse(0, -170, 30, 42, 0, 0, Math.PI * 2); ctx.fillStyle = '#8C8C8C'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
      else if (p.hold === 'scroll') { ctx.save(); ctx.translate(-30, -140); ctx.scale(0.55, 0.75); PROPS.scroll(ctx, {}, t); ctx.restore(); }
      else if (p.hold === 'card') { ctx.save(); ctx.rotate(-0.25); poly(ctx, [[-70, -150], [70, -150], [70, -60], [-70, -60]], hc || '#151515', 5); line(ctx, [[-45, -125], [-15, -125]], 10, 'gold'); ctx.restore(); }
      ctx.beginPath(); ctx.roundRect(-42, -30, 84, 66, 22); ctx.fillStyle = M; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); for (let i = 1; i < 4; i++) line(ctx, [[-42 + i * 21, -28], [-42 + i * 21, -6]], 3); ctx.restore(); }
  },
  column(ctx, p) { const h = p.h || 900, w = p.w || 130, c = p.color || '#D8C8AA', s = '#A8977A';
    poly(ctx, [[-w * 0.85, 0], [w * 0.85, 0], [w * 0.75, -50], [-w * 0.75, -50]], s, 6); poly(ctx, [[-w / 2, -50], [w / 2, -50], [w * 0.45, -h + 70], [-w * 0.45, -h + 70]], c, 6);
    for (let i = 1; i < 5; i++) { const x = -w / 2 + i * w / 5; line(ctx, [[x, -60], [x * 0.9, -h + 80]], 3, s); }
    poly(ctx, [[-w * 0.6, -h + 70], [w * 0.6, -h + 70], [w * 0.9, -h + 20], [-w * 0.9, -h + 20]], c, 6); poly(ctx, [[-w, -h + 20], [w, -h + 20], [w, -h], [-w, -h]], s, 6);
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * w * 0.75, -h + 45, 18, 0, Math.PI * 2); ctx.fillStyle = color(c); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); } },
  trident(ctx, p) { const h = p.h || 700, c = p.color || '#8A5A3C';
    line(ctx, [[0, 60], [0, -h]], 22, INK); line(ctx, [[0, 60], [0, -h]], 12, c);
    ctx.beginPath(); ctx.moveTo(-70, -h - 110); ctx.lineTo(-70, -h); ctx.quadraticCurveTo(0, -h + 40, 70, -h); ctx.lineTo(70, -h - 110); ctx.moveTo(0, -h); ctx.lineTo(0, -h - 140); ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 12; ctx.strokeStyle = color(c); ctx.stroke();
    for (const x of [-70, 0, 70]) poly(ctx, [[x - 20, -h - (x ? 105 : 135)], [x + 20, -h - (x ? 105 : 135)], [x, -h - (x ? 150 : 185)]], c, 5); },
  bolt(ctx, p, t) { poly(ctx, [[20, -170], [-60, 10], [0, 10], [-30, 170], [70, -30], [10, -30], [50, -170]], p.color || 'gold', 7);
    if (Math.sin(t * 9) > 0) { line(ctx, [[-90, -40], [-130, -60]], 8, 'gold'); line(ctx, [[90, 20], [130, 0]], 8, 'gold'); line(ctx, [[-70, 90], [-110, 110]], 8, 'gold'); } },
  // Big rubber-stamp text slapped over the picture (centre anchor). p.text (\n splits), p.color (default red), p.size, p.wear (speckle colour, optional), p.seed
  stampText(ctx, p) { const lines = String(p.text || 'VIP').split('\n'), sz = p.size || 120, c = color(p.color || 'red'), hr = hash(p.seed || 9);
    ctx.font = `bold ${sz}px Sans`; const w = Math.max(...lines.map(l => l.length)) * sz * 0.62 + sz * 0.9, h = lines.length * sz * 1.05 + sz * 0.6;
    ctx.save(); ctx.rotate(p.rotate0 ?? -0.12); ctx.lineWidth = sz * 0.1; ctx.strokeStyle = c; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, sz * 0.18); ctx.stroke();
    ctx.lineWidth = sz * 0.035; ctx.beginPath(); ctx.roundRect(-w / 2 + sz * 0.16, -h / 2 + sz * 0.16, w - sz * 0.32, h - sz * 0.32, sz * 0.1); ctx.stroke();
    ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * sz * 1.05 + sz * 0.04));
    if (p.wear) for (let i = 0; i < 120; i++) { ctx.fillStyle = p.wear; ctx.beginPath(); ctx.arc((hr() - 0.5) * w, (hr() - 0.5) * h, 1 + hr() * sz * 0.03, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); },
  // Hand-drawn chalky rays bursting around the anchor (centre). p.color (gold), p.r inner radius, p.len, p.n
  rays(ctx, p, t) { const n = p.n || 14, r0 = p.r || 260, L = p.len || 160, c = p.color || 'gold', hr = hash(p.seed || 4), wob = Math.sin(t * 10) * 0.02;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + (hr() - 0.5) * 0.25 + wob, r1 = r0 + hr() * 40, r2 = r1 + L * (0.6 + hr() * 0.6);
      line(ctx, [[Math.cos(a) * r1, Math.sin(a) * r1], [Math.cos(a + 0.02) * (r1 + r2) / 2, Math.sin(a + 0.02) * (r1 + r2) / 2], [Math.cos(a) * r2, Math.sin(a) * r2]], 12 + hr() * 6, c); } },
  cardSign(ctx, p) { const w = p.w || 640, h = p.h || 260, hr = hash(11);
    const pts = []; for (let x = -w / 2; x <= w / 2; x += 32) pts.push([x, -h / 2 + (hr() - 0.5) * 14]); for (let y = -h / 2; y <= h / 2; y += 32) pts.push([w / 2 + (hr() - 0.5) * 14, y]);
    for (let x = w / 2; x >= -w / 2; x -= 32) pts.push([x, h / 2 + (hr() - 0.5) * 14]); for (let y = h / 2; y >= -h / 2; y -= 32) pts.push([-w / 2 + (hr() - 0.5) * 14, y]);
    poly(ctx, pts, p.color || '#B8946A', 6); poly(ctx, [[-w / 2 + 30, -h / 2 + 30], [w / 2 - 30, -h / 2 + 30], [w / 2 - 30, h / 2 - 30], [-w / 2 + 30, h / 2 - 30]], null, 4, '#5C4630');
    const lines = String(p.text || 'CÒN TIẾP...').split('\n'), sz = p.size || Math.min(90, h / (lines.length + 0.8));
    lines.forEach((l, i) => { ctx.font = `bold ${sz}px Sans`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2A1E14'; ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * sz * 1.1); }); },
};
PROPS.finishFlag = PROPS.checkerFlag;
PROPS.thoughtBubble = PROPS.thought;

function checkerStrip(ctx, w, rows) { // checkered band lying on the ground (slightly wider at the front)
  const top = -20, bot = 26, n = Math.max(2, Math.round(w / 40)), hw = y => w / 2 + 12 * (y - top) / (bot - top), X = (i, y) => (-1 + 2 * i / n) * hw(y);
  const edge = [[-hw(top), top], [hw(top), top], [hw(bot), bot], [-hw(bot), bot]];
  poly(ctx, edge, 'white', 0);
  for (let r = 0; r < rows; r++) { const y0 = top + (bot - top) * r / rows, y1 = top + (bot - top) * (r + 1) / rows;
    for (let i = 0; i < n; i++) if ((i + r) % 2 === 0) poly(ctx, [[X(i, y0), y0], [X(i + 1, y0), y0], [X(i + 1, y1), y1], [X(i, y1), y1]], INK, 0); }
  poly(ctx, edge, null, 5);
}
function hash(seed) { let x = seed * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); }
function puffC(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
function ribbon(ctx, pts, wd, col) { line(ctx, pts, wd + 10, INK); line(ctx, pts, wd, col); }
function puff(ctx, x, y, r, fill) {
  ctx.beginPath(); const n = 6;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, b = (i + 0.5) / n * Math.PI * 2, a2 = (i + 1) / n * Math.PI * 2;
    if (!i) ctx.moveTo(x + r * Math.cos(a), y + r * 0.8 * Math.sin(a));
    ctx.quadraticCurveTo(x + r * 1.35 * Math.cos(b), y + r * 1.1 * Math.sin(b), x + r * Math.cos(a2), y + r * 0.8 * Math.sin(a2)); }
  ctx.closePath(); ctx.fillStyle = color(fill); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
}
function sansText(ctx, s, x, y, size, c, align = 'left') { ctx.font = `bold ${Math.round(size)}px Sans`; ctx.textAlign = align; ctx.textBaseline = 'top'; ctx.fillStyle = color(c); ctx.fillText(String(s), x, y); }
function wrapText(s, max) { const out = []; let cur = ''; for (const w of s.split(/\s+/)) { if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; }
function blobPath(ctx, pts) { const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; ctx.beginPath(); const m0 = mid(pts[n - 1], pts[0]); ctx.moveTo(m0[0], m0[1]); for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } ctx.closePath(); }
const saP = (lon, lat) => Array.isArray(lon) ? saP(lon[0], lon[1]) : [(lon + 58) * 13, -(lat + 22) * 13];
const SA_COAST = [[-77, 8.5], [-75.5, 10.8], [-72, 12], [-71.5, 10.5], [-68, 10.7], [-64, 10.6], [-61, 10.5], [-60, 8.5], [-57, 6], [-52, 5], [-50, 1.5], [-50, 0], [-47, -1], [-44, -2.5], [-40, -3], [-37, -5], [-35, -7], [-35, -9], [-37.5, -12], [-39, -15], [-39.5, -18], [-41, -22], [-44, -23], [-48, -26], [-48.7, -28.5], [-51, -31], [-53, -34], [-56, -34.8], [-58, -34.5], [-57, -36.5], [-62, -39], [-65, -41], [-64.5, -43], [-67, -46], [-66, -48], [-69, -51], [-68.5, -53], [-66, -55], [-70, -55], [-73, -53], [-75, -50], [-74, -46], [-73.5, -42], [-73.5, -37], [-71.5, -32], [-71.5, -28], [-70.5, -23], [-70.3, -18], [-76, -14], [-78, -10], [-81, -6], [-80, -3], [-80.5, -1], [-79.5, 2], [-77.5, 4]];
const SA_AMAZON = [[-77, 1], [-73, 3], [-67, 4.5], [-61, 5.5], [-56, 3], [-51, 1.5], [-49.5, -1.5], [-49, -5], [-52, -8], [-56, -10.5], [-61, -12.5], [-66, -12], [-70, -11.5], [-74, -9.5], [-77, -5], [-78, -1.5]];
const SA_LOST_E = [[-49, -5], [-52, -8], [-56, -10.5], [-61, -12.5], [-66, -12]], SA_LOST_I = [[-53, -3.5], [-55, -6], [-58, -8], [-62, -9], [-66, -8.5]];
export const PROP_NAMES = Object.keys(PROPS);
