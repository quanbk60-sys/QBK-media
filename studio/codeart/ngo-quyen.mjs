// Code-drawn Ngô Quyền: hand-with-pen draws every stroke, then colour fills, then idle motion.
// Usage: node ngo-quyen.mjs OUT_DIR   → OUT_DIR/ngo-quyen.mp4 (1080x1920, 30fps, ~10s)
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] || 'out');
fs.mkdirSync(OUT, {recursive: true});
const W = 1080, H = 1920, FPS = 30, DUR = 10.5;
GlobalFonts.registerFromPath(new URL('./PatrickHand-Regular.ttf', import.meta.url).pathname, 'Hand');

const PAPER = '#F3EADB', INK = '#2A2723', RED = '#D9442E', SKIN = '#FFFFFF', WOOD = '#9A6B3F', STEEL = '#C9CCD1';

// ---------- geometry helpers (deterministic wobble for a hand-drawn feel) ----------
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;
const wob = (pts, a = 1.6) => pts.map(([x, y], i) => i === 0 || i === pts.length - 1 ? [x, y] : [x + rnd() * a, y + rnd() * a]);
const lerp = (a, b, t) => a + (b - a) * t;
const line = (a, b, n = 12) => Array.from({length: n + 1}, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
const bez = (p0, p1, p2, p3, n = 28) => Array.from({length: n + 1}, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]];
});
const ell = (cx, cy, rx, ry, a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2, n = 64) =>
  Array.from({length: n + 1}, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const len = pts => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

// ---------- the character (design space = output pixels) ----------
const C = {hx: 540, hy: 640, hr: 125};
const strokes = [];      // drawn in order by the pen
const fills = [];        // [{pts, color, after: strokeIndex}] painted under the ink in this order
const S = (pts, w = 6, extra = {}) => { strokes.push({pts: wob(pts), w, ...extra}); return strokes.length - 1; };

// head
const sHead = S(ell(C.hx, C.hy, C.hr, C.hr, -Math.PI * 0.75), 6);
// headband (upper + lower edge), knot, two tails
const bandTop = bez([418, 598], [480, 568], [600, 568], [662, 598]);
const bandBot = bez([424, 646], [485, 618], [597, 618], [658, 646]);
const sBand1 = S(bandTop, 5), sBand2 = S(bandBot, 5);
const sKnot = S(ell(672, 624, 16, 15), 5);
const tailA = t => bez([684, 618], [730 + 6 * Math.sin(t * 7), 640], [760 + 10 * Math.sin(t * 7 + 1), 690], [790 + 14 * Math.sin(t * 7 + 1.6), 735]);
const tailB = t => bez([680, 636], [712 + 5 * Math.sin(t * 6.2 + 2), 680], [728 + 9 * Math.sin(t * 6.2 + 3), 730], [742 + 12 * Math.sin(t * 6.2 + 3.6), 790]);
const sTailA = S(tailA(0), 5, {dyn: tailA}), sTailB = S(tailB(0), 5, {dyn: tailB});
// face: brows, eyes, mouth
S(line([468, 628], [516, 646], 6), 7);
S(line([612, 628], [564, 646], 6), 7);
const sEyeL = S(ell(496, 672, 9, 13), 5, {eye: true}), sEyeR = S(ell(584, 672, 9, 13), 5, {eye: true});
S(bez([514, 718], [530, 712], [550, 712], [566, 716], 10), 6);
// neck + torso
S(line([540, 765], [540, 800], 4), 6);
const sTorso = S(ell(540, 960, 95, 170, -Math.PI / 2), 6);
// crossed sashes (two bands) + belt
const sSashA1 = S(line([478, 828], [612, 1046], 10), 5), sSashA2 = S(line([500, 812], [632, 1024], 10), 5);
const sSashB1 = S(line([602, 828], [468, 1046], 10), 5), sSashB2 = S(line([580, 812], [448, 1024], 10), 5);
const sBelt1 = S(bez([463, 1060], [500, 1068], [580, 1068], [617, 1060]), 5), sBelt2 = S(bez([482, 1096], [515, 1102], [565, 1102], [598, 1096]), 5);
// spear (shaft as two lines, then head)
const shaftL = line([380, 1560], [362, 476], 24), shaftR = line([392, 1560], [374, 476], 24);
const sShaft1 = S(shaftL, 4), sShaft2 = S(shaftR, 4);
const spearHead = [[368, 478], [392, 432], [366, 362], [342, 434], [368, 478]];
const sSpear = S(spearHead, 5);
// arms + hands (left hand grips spear)
S(bez([462, 880], [430, 920], [400, 960], [392, 1040], 18), 6);
const sHandL = S(ell(384, 1064, 24, 22), 6);
S(bez([618, 880], [652, 930], [680, 990], [688, 1080], 18), 6);
const sHandR = S(ell(692, 1098, 22, 20), 6);
// legs, feet, ground
S(line([506, 1124], [488, 1468], 16), 6);
S(line([574, 1124], [594, 1468], 16), 6);
const sFootL = S(ell(468, 1484, 32, 16), 6), sFootR = S(ell(618, 1484, 32, 16), 6);
S(bez([300, 1512], [450, 1506], [640, 1518], [790, 1508], 30), 3, {ground: true});

// fills (under ink), in z-order
const poly = (...parts) => parts.flat();
fills.push({pts: ell(C.hx, C.hy, C.hr, C.hr), color: SKIN});
fills.push({pts: poly(bandTop, [...bandBot].reverse()), color: RED});
fills.push({pts: ell(672, 624, 16, 15), color: RED});
fills.push({dyn: t => poly(tailA(t), [[790, 735], [700, 640]]), color: RED});
fills.push({dyn: t => poly(tailB(t), [[742, 790], [690, 650]]), color: RED});
fills.push({pts: ell(540, 960, 95, 170), color: SKIN});
fills.push({pts: poly(line([478, 828], [612, 1046]), line([632, 1024], [500, 812])), color: RED});
fills.push({pts: poly(line([602, 828], [468, 1046]), line([448, 1024], [580, 812])), color: RED});
fills.push({pts: poly(bez([463, 1060], [500, 1068], [580, 1068], [617, 1060]), [...bez([482, 1096], [515, 1102], [565, 1102], [598, 1096])].reverse()), color: RED});
fills.push({pts: poly(shaftL, [...shaftR].reverse()), color: WOOD});
fills.push({pts: spearHead, color: STEEL});
fills.push({pts: ell(384, 1064, 24, 22), color: SKIN});
fills.push({pts: ell(692, 1098, 22, 20), color: SKIN});
fills.push({pts: ell(496, 672, 9, 13), color: INK, eye: true});
fills.push({pts: ell(584, 672, 9, 13), color: INK, eye: true});

// ---------- timeline ----------
const SPEED = 2700, GAP = 0.045, T0 = 0.3;
let t = T0;
for (const s of strokes) { s.len = len(s.pts); s.t0 = t; s.t1 = t + Math.max(0.1, s.len / SPEED); t = s.t1 + GAP; }
const DRAW_END = t;
const FILL0 = DRAW_END + 0.1, FILL_STEP = 0.06, FILL_DUR = 0.3;
fills.forEach((f, i) => { f.t0 = FILL0 + i * FILL_STEP; });
const FILL_END = FILL0 + fills.length * FILL_STEP + FILL_DUR;
const IDLE = FILL_END;            // tails flutter + blink after this
const TITLE = FILL_END - 0.2;
console.error(`draw ${DRAW_END.toFixed(2)}s, fills done ${FILL_END.toFixed(2)}s, total ${DUR}s`);

// ---------- drawing ----------
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
const K = 1.25, X = ([x, y]) => [540 + (x - 540) * K, 1000 + (y - 936) * K];
function pathOf(pts, upto = Infinity) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let acc = 0, tip = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= upto) { const f = (upto - acc) / seg; tip = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; ctx.lineTo(tip[0], tip[1]); return tip; }
    acc += seg; ctx.lineTo(pts[i][0], pts[i][1]); tip = pts[i];
  }
  return tip;
}
function hand(x, y, tt) {   // pen tip at (x, y); hand + sleeve trail down-right
  const bob = Math.sin(tt * 30) * 1.5;
  ctx.save(); ctx.translate(x, y + bob); ctx.rotate(-0.62);
  ctx.fillStyle = 'rgba(0,0,0,.10)'; ctx.beginPath(); ctx.ellipse(18, 205, 70, 150, 0, 0, Math.PI * 2); ctx.fill();
  // pen
  ctx.fillStyle = '#1d1d1f'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-7, 26); ctx.lineTo(7, 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2d2d31'; ctx.fillRect(-9, 26, 18, 150);
  ctx.fillStyle = '#e8e8ea'; ctx.fillRect(-9, 60, 18, 8);
  // hand (skin) holding pen
  ctx.fillStyle = '#F2C9A1'; ctx.strokeStyle = INK; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(10, 120, 46, 60, 0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-26, 84, 16, 24, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();   // thumb
  ctx.beginPath(); ctx.ellipse(28, 76, 14, 22, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();    // index finger
  // sleeve
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(-38, 168, 100, 260, 10); ctx.fill(); ctx.stroke();
  ctx.restore();
}
function blinkScale(tt) {
  for (const b of [IDLE + 0.6, IDLE + 2.4]) { const d = Math.abs(tt - b); if (d < 0.09) return Math.max(0.1, d / 0.09); }
  return 1;
}

function frame(tt) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  const idle = tt > IDLE ? tt - IDLE : 0;
  const breathe = tt > IDLE ? Math.sin(idle * 2.2) * 4 : 0;
  ctx.save(); ctx.translate(0, breathe * 0.5); ctx.translate(540, 1000); ctx.scale(K, K); ctx.translate(-540, -936);
  // fills
  for (const f of fills) {
    if (tt < f.t0) continue;
    const a = Math.min(1, (tt - f.t0) / FILL_DUR);
    let pts = f.dyn ? f.dyn(idle) : f.pts;
    if (f.eye) { const k = blinkScale(tt); pts = pts.map(([x, y]) => [x, 672 + (y - 672) * k]); }
    ctx.globalAlpha = a; ctx.fillStyle = f.color; pathOf(pts); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  }
  // ink
  let tip = null;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const s of strokes) {
    if (tt < s.t0) break;
    let pts = s.dyn ? s.dyn(idle) : s.pts;
    if (s.eye) { const k = blinkScale(tt); pts = pts.map(([x, y]) => [x, 672 + (y - 672) * k]); }
    ctx.strokeStyle = s.ground ? 'rgba(42,39,35,.55)' : INK; ctx.lineWidth = s.w;
    const upto = tt >= s.t1 ? Infinity : s.len * (tt - s.t0) / (s.t1 - s.t0);
    const p = pathOf(pts, upto); ctx.stroke();
    if (tt < s.t1) tip = p;
  }
  // between strokes: glide the pen to the next start
  if (!tip && tt < DRAW_END) {
    const i = strokes.findIndex(s => s.t0 > tt), prev = strokes[i - 1], next = strokes[i];
    if (prev && next) { const f = (tt - prev.t1) / (next.t0 - prev.t1); const a = prev.pts.at(-1), b = next.pts[0]; tip = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; }
    else if (next) tip = next.pts[0];
  }
  ctx.restore();
  // title
  if (tt > TITLE) {
    const a = Math.min(1, (tt - TITLE) / 0.4), dy = (1 - a) * 30;
    ctx.globalAlpha = a; ctx.fillStyle = RED; ctx.font = '150px Hand'; ctx.textAlign = 'center';
    ctx.fillText('NGÔ QUYỀN', W / 2, 230 + dy);
    ctx.fillStyle = INK; ctx.font = '70px Hand'; ctx.fillText('Bạch Đằng · 938', W / 2, 1850 + dy);
    ctx.globalAlpha = 1;
  }
  // pen hand (leaves the frame after drawing)
  if (tip) tip = X(tip);
  if (tip) hand(tip[0], tip[1], tt);
  else if (tt < DRAW_END + 0.6) { const f = (tt - DRAW_END) / 0.6; const last = X(strokes.at(-1).pts.at(-1)); hand(lerp(last[0], 1250, f), lerp(last[1], 2100, f), tt); }
  return {drawing: !!tip && tt < DRAW_END};
}

// ---------- render video + pen-scratch audio ----------
const frames = Math.round(DUR * FPS), env = [];
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', path.join(OUT, 'video.mp4')], {stdio: ['pipe', 'inherit', 'inherit']});
for (let i = 0; i < frames; i++) {
  const r = frame(i / FPS); env.push(r.drawing ? 1 : 0);
  const buf = cv.data();
  if (!ff.stdin.write(buf)) await new Promise(res => ff.stdin.once('drain', res));
}
ff.stdin.end(); await new Promise(res => ff.on('close', res));

// audio: filtered noise gated by the drawing envelope + soft pop on each fill
const SR = 44100, N = Math.round(DUR * SR), pcm = new Int16Array(N);
let lp = 0, hp = 0, prev = 0; seed = 99;
const fillTimes = fills.map(f => f.t0);
for (let n = 0; n < N; n++) {
  const tt = n / SR, fi = Math.min(frames - 1, Math.floor(tt * FPS));
  const e = env[fi] * (0.55 + 0.45 * Math.abs(Math.sin(tt * 23)));
  const white = rnd() * 2; lp += 0.35 * (white - lp); hp = lp - prev; prev = lp;
  let v = hp * e * 0.22;
  for (const ft of fillTimes) { const d = tt - ft; if (d >= 0 && d < 0.08) v += Math.sin(2 * Math.PI * 520 * d) * Math.exp(-d * 60) * 0.05; }
  pcm[n] = Math.max(-1, Math.min(1, v)) * 32767;
}
const head = Buffer.alloc(44); head.write('RIFF'); head.writeUInt32LE(36 + N * 2, 4); head.write('WAVEfmt ', 8); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22); head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 2, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34); head.write('data', 36); head.writeUInt32LE(N * 2, 40);
fs.writeFileSync(path.join(OUT, 'audio.wav'), Buffer.concat([head, Buffer.from(pcm.buffer)]));
await new Promise(res => spawn('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OUT, 'video.mp4'), '-i', path.join(OUT, 'audio.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', path.join(OUT, 'ngo-quyen.mp4')], {stdio: 'inherit'}).on('close', res));
console.error('done', path.join(OUT, 'ngo-quyen.mp4'));
