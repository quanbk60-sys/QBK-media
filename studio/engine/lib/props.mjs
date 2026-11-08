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
function ribbon(ctx, pts, wd, col) { line(ctx, pts, wd + 10, INK); line(ctx, pts, wd, col); }
function puff(ctx, x, y, r, fill) {
  ctx.beginPath(); const n = 6;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, b = (i + 0.5) / n * Math.PI * 2, a2 = (i + 1) / n * Math.PI * 2;
    if (!i) ctx.moveTo(x + r * Math.cos(a), y + r * 0.8 * Math.sin(a));
    ctx.quadraticCurveTo(x + r * 1.35 * Math.cos(b), y + r * 1.1 * Math.sin(b), x + r * Math.cos(a2), y + r * 0.8 * Math.sin(a2)); }
  ctx.closePath(); ctx.fillStyle = color(fill); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
}
export const PROP_NAMES = Object.keys(PROPS);
