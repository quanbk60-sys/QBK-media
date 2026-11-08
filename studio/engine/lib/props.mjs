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
};
export const PROP_NAMES = Object.keys(PROPS);
