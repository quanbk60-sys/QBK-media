// Chương B · Woodcut Print (Lemo-Opuscar): khắc ván gỗ → bóc giấy ra chữ xuôi → Kinh Kim Cương 868 → mộc bản triều Nguyễn
import * as WC from './engine/index.js';
import { curl, peelState } from './trans.js';
import { W, H, CH, capsOf, capAt, seg, ease } from '../shared/timeline.js';
import { mulberry } from '/core/lib.js';

export const DUR = +(CH.b[1] - CH.b[0]).toFixed(2);
export let EV = [];
const CAPS = capsOf('b');
const BX = 60, BY = 250, BW = 960, BH = 1080;          // khối ván / vùng in
const RED = '#A8322A';                                 // bản màu duy nhất: son đỏ (dấu di sản)
const T_PEEL = [2.95, 3.75], T_P2 = 4.0, T_P3 = 8.15, T_SEAL = 11.3;

let TIPS = [], M, m, C, c, P, F1, F2, F3, RAYS, frameCuts, cvUp, cvDown, blockPoly;

function off(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return [cv, cv.getContext('2d')]; }
function raggedRect(x, y, w, h, seed) {
  const r = mulberry(seed), P = [], n = 60;
  const side = (ax, ay, bx, by) => { for (let i = 0; i < n; i++) { const u = i / n; P.push([ax + (bx - ax) * u + (r() - .5) * 3, ay + (by - ay) * u + (r() - .5) * 3]); } };
  side(x, y, x + w, y); side(x + w, y, x + w, y + h); side(x + w, y + h, x, y + h); side(x, y + h, x, y);
  return P;
}

// --- tranh xám (sculpt) cho từng tấm, rồi woodcutFilter biến thành nét dao theo hình ---
function plate1Art(mirror) {
  const [cv, q] = off(BW, BH);
  q.fillStyle = '#000'; q.fillRect(0, 0, BW, BH);
  q.save(); if (mirror) { q.translate(BW, 0); q.scale(-1, 1); }
  q.fillStyle = '#fff'; q.textAlign = 'center'; q.textBaseline = 'alphabetic';
  q.font = '800 330px "EB Garamond VN"'; q.fillText('CHỮ', BW / 2, 640);
  q.font = '800 92px "EB Garamond VN"'; q.fillText('KHẮC NGƯỢC', BW / 2, 830);
  q.restore();
  // vân sáng nhẹ dưới chữ để dao có hướng
  const gr = q.createRadialGradient(BW / 2, 520, 50, BW / 2, 520, 520); gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  q.fillStyle = gr; q.fillRect(0, 0, BW, BH);
  return cv;
}
function plate2Art() {                                   // cuộn kinh trải ngang + số 868
  const [cv, q] = off(BW, BH);
  q.fillStyle = '#000'; q.fillRect(0, 0, BW, BH);
  q.fillStyle = '#fff'; q.textAlign = 'center';
  q.font = '800 300px "EB Garamond VN"'; q.fillText('868', BW / 2, 360);
  q.font = 'italic 800 92px "EB Garamond VN"'; q.fillText('Kinh Kim Cương', BW / 2, 490);
  // cuộn giấy: thân sáng, hai lõi tròn ở hai đầu, các cột chữ là vạch tối
  const y0 = 560, y1 = 960, x0 = 90, x1 = BW - 90;
  const gr = q.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#d8d8d8'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(1, '#bdbdbd');
  q.fillStyle = gr; q.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (const xx of [x0, x1]) { const g2 = q.createLinearGradient(xx - 30, 0, xx + 30, 0); g2.addColorStop(0, '#555'); g2.addColorStop(.5, '#fff'); g2.addColorStop(1, '#444'); q.fillStyle = g2; q.fillRect(xx - 28, y0 - 30, 56, y1 - y0 + 60); }
  const r = mulberry(8); q.fillStyle = '#111';
  for (let x = x1 - 70; x > x0 + 300; x -= 34) for (let y = y0 + 40; y < y1 - 40; y += 30 + r() * 10) q.fillRect(x, y, 14, 16 + r() * 8);
  // trang đầu (tranh minh họa): khung tối có vòng hào quang sáng
  q.fillStyle = '#222'; q.fillRect(x0 + 40, y0 + 30, 230, y1 - y0 - 60);
  const g3 = q.createRadialGradient(x0 + 155, y0 + 170, 10, x0 + 155, y0 + 170, 110); g3.addColorStop(0, '#fff'); g3.addColorStop(1, 'rgba(255,255,255,0)');
  q.fillStyle = g3; q.fillRect(x0 + 40, y0 + 30, 230, 300);
  return cv;
}
function plate3Art() {                                   // chồng ván mộc bản + 34.000+
  const [cv, q] = off(BW, BH);
  q.fillStyle = '#000'; q.fillRect(0, 0, BW, BH);
  q.fillStyle = '#fff'; q.textAlign = 'center';
  q.font = '800 210px "EB Garamond VN"'; q.fillText('34.000+', BW / 2, 250);
  q.font = '800 84px "EB Garamond VN"'; q.fillText('MỘC BẢN', BW / 2, 350);
  // năm tấm ván xếp chồng, nhìn chéo: mặt trên sáng, cạnh tối có thớ
  for (let i = 0; i < 5; i++) {
    const y = 900 - i * 92, x = 150 + (i % 2) * 26, w = 640, d = 70;
    q.fillStyle = '#9a9a9a'; q.fillRect(x, y, w, 46);                      // cạnh trước
    q.fillStyle = '#505050'; for (let k = 0; k < 6; k++) q.fillRect(x + 8, y + 6 + k * 7, w - 16, 2);   // thớ gỗ
    q.beginPath(); q.moveTo(x, y); q.lineTo(x + d, y - d * .55); q.lineTo(x + w + d, y - d * .55); q.lineTo(x + w, y); q.closePath();
    const gt = q.createLinearGradient(x, y - d, x + w, y); gt.addColorStop(0, '#ffffff'); gt.addColorStop(1, '#cfcfcf'); q.fillStyle = gt; q.fill();
    q.beginPath(); q.moveTo(x + w, y); q.lineTo(x + w + d, y - d * .55); q.lineTo(x + w + d, y - d * .55 + 46); q.lineTo(x + w, y + 46); q.closePath(); q.fillStyle = '#3a3a3a'; q.fill();
    if (i === 4) { q.fillStyle = '#222'; const r = mulberry(4); for (let cx = x + 60; cx < x + w - 20; cx += 26) for (let k = 0; k < 2; k++) q.fillRect(cx + k * 20 * .55, y - 52 + k * 12 + r() * 4, 9, 10); }
  }
  return cv;
}

export async function init() {
  [M, m] = WC.canvas(W, H); [C, c] = WC.canvas(W, H); P = WC.makePrinter(W, H);
  blockPoly = raggedRect(BX, BY, BW, BH, 3);
  const rect = [BX, BY, BW, BH];
  F1 = WC.woodcutFilter(plate1Art(true), { rect, sp: 6, black: .08, white: .7, seed: 3, reveal: { t0: .15, t1: 2.1, mode: 'light' } });
  F2 = WC.woodcutFilter(plate2Art(), { rect, sp: 6, black: .08, white: .75, seed: 5, reveal: { t0: T_P2 + .05, t1: T_P2 + 2.4, mode: 'down' } });
  F3 = WC.woodcutFilter(plate3Art(), { rect, sp: 6, black: .08, white: .75, seed: 7, reveal: { t0: T_P3 + .05, t1: T_P3 + 2.6, mode: 'light' } });
  RAYS = WC.rays(BX + BW / 2, BY + 820, { n: 30, r0: 150, r1: [260, 420], w: 12, seed: 6, a0: Math.PI * 1.05, a1: Math.PI * 1.95, reveal: { t0: T_SEAL, t1: T_SEAL + .6 } });
  frameCuts = WC.cutAlong(WC.rect(BX + 26, BY + 26, BW - 52, BH - 52), { closed: true, w: 3, kind: 'k', seed: 9 });
  // tờ giấy lúc bóc: mặt trên = giấy với vết thấm ngược, mặt dưới = bản in xuôi
  const trueMask = WC.canvas(W, H); drawMask(trueMask[1], 99, 1, true);
  cvDown = document.createElement('canvas'); cvDown.width = W; cvDown.height = H;
  cvDown.getContext('2d').drawImage(P.render(trueMask[0], null, { seed: 4, inkSeed: 4 }), 0, 0);
  cvUp = document.createElement('canvas'); cvUp.width = W; cvUp.height = H;
  const u = cvUp.getContext('2d'); u.fillStyle = '#EFE8D8'; u.fillRect(0, 0, W, H);
  u.globalAlpha = .13; u.translate(W, 0); u.scale(-1, 1); u.drawImage(cvDown, 0, 0); u.setTransform(1, 0, 0, 1, 0, 0); u.globalAlpha = 1;
  // sự kiện âm thanh (trộn bằng mix.py)
  EV = [{ t: .15, type: 'carve', dur: 2.0 }, { t: 2.2, type: 'brayer' }, { t: 2.7, type: 'paper' }, { t: T_PEEL[0], type: 'peel' },
    { t: T_P2, type: 'impress' }, { t: T_P2 + .05, type: 'carve', dur: 2.3 }, { t: T_P3, type: 'impress' }, { t: T_P3 + .05, type: 'carve', dur: 2.5 },
    { t: T_SEAL, type: 'stamp' }];
}

// vẽ mặt nạ (đen = gỗ chưa khắc, trắng = đã khắc / giấy) cho tấm `which` tại thời điểm t
function drawMask(g, t, which, trueText = false) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  WC.fillPoly(g, [blockPoly], '#000');
  WC.drawStrokes(g, frameCuts, { t: 1e9 });
  if (which === 1) {
    if (trueText) { const F = trueF(); WC.drawStrokes(g, F.strokes, { t: 1e9 }); }
    else { TIPS = []; WC.drawStrokes(g, F1.strokes, { t, tips: TIPS }); }
  } else if (which === 2) WC.drawStrokes(g, F2.strokes, { t });
  else { WC.drawStrokes(g, F3.strokes, { t }); if (t > T_SEAL) { WC.drawStrokes(g, RAYS, { t }); sealMask(g, t); } }
}
let _trueF; function trueF() { return _trueF || (_trueF = WC.woodcutFilter(plate1Art(false), { rect: [BX, BY, BW, BH], sp: 6, black: .08, white: .7, seed: 3 })); }

function caption(g, t) {
  const cp = capAt(CAPS, t); if (!cp) return;
  const a = Math.min(seg(t, cp.t0, cp.t0 + .1), 1 - seg(t, cp.t1 - .15, cp.t1));
  g.save(); g.globalAlpha = a; g.fillStyle = '#000'; g.textAlign = 'center'; g.font = '500 46px "EB Garamond VN"';
  cp.lines.forEach((l, i) => g.fillText(l, W / 2, 1440 + i * 60));
  g.restore();
}
function credit(g) {   // dòng nhỏ kiểu ghi chú bản in ở lề trên
  g.save(); g.fillStyle = '#000'; g.textAlign = 'center'; g.font = 'italic 500 34px "EB Garamond VN"';
  g.fillText('Bản II · In khắc gỗ', W / 2, 200); g.restore();
}

function sealGeom(t) { const u = ease(seg(t, T_SEAL, T_SEAL + .35)), s = 150 * (1.25 - .25 * u); return { u, cx: BX + BW / 2, cy: BY + 820, s }; }
function sealMask(g, t) {   // ô dấu khắc trắng, chữ để đen (gỗ không khắc)
  const { u, cx, cy, s } = sealGeom(t); if (u <= 0) return;
  g.save(); g.fillStyle = '#fff'; g.fillRect(cx - s, cy - s * .62, s * 2, s * 1.24);
  g.fillStyle = '#000'; g.textAlign = 'center'; g.font = `800 ${s * .62}px "EB Garamond VN"`; g.fillText('2009', cx, cy + s * .05);
  g.font = `700 ${s * .26}px "EB Garamond VN"`; g.fillText('UNESCO', cx, cy + s * .42);
  g.lineWidth = s * .05; g.strokeStyle = '#000'; g.strokeRect(cx - s * .88, cy - s * .52, s * 1.76, s * 1.04); g.restore();
}
function seal(c, t) {     // dấu son: chỉ hiện ở chỗ đã khắc trắng (hào quang + ô dấu khắc trắng)
  const { u, cx, cy, s } = sealGeom(t); if (u <= 0) return;
  WC.plate(c, [WC.rect(cx - s, cy - s * .62, s * 2, s * 1.24)], u);
}

export function render(g, t) {
  const inBlock = t < T_PEEL[0];
  if (t < T_P2) {
    // tấm I: ván gỗ, dao khắc chữ ngược; lăn mực; đặt giấy; bóc ra
    drawMask(m, t, 1); c.clearRect(0, 0, W, H);
    const wetX = t < 2.15 ? -1 : t < 2.65 ? BX - 60 + (BW + 120) * seg(t, 2.15, 2.65) : W + 200;
    if (inBlock) {
      g.drawImage(P.render(M, C, { mode: 'block', sheen: .15, wetX, grainAng: .02 }), 0, 0);
      bench(g);
      if (t > 2.65) {                                       // giấy hạ xuống
        const k = ease(seg(t, 2.65, 2.92)); g.save(); g.globalAlpha = k; g.drawImage(cvUp, 0, -60 * (1 - k)); g.restore();
      }
      if (t > 2.15 && t < 2.68) brayer(g, wetX);
      if (t < 2.1) knifeTip(g, t);
    } else if (t < T_PEEL[1]) {
      g.drawImage(P.render(M, C, { mode: 'block', sheen: .18, wetX: W + 200, grainAng: .02 }), 0, 0); bench(g);
      const { xf, r } = peelState(seg(t, ...T_PEEL), 190); curl(g, cvUp, cvDown, xf, r, { F: 2400 });
    } else { g.drawImage(cvDown, 0, 0); }
  } else {
    const which = t < T_P3 ? 2 : 3, t0 = which === 2 ? T_P2 : T_P3;
    drawMask(m, t, which); c.clearRect(0, 0, W, H); if (which === 3) seal(c, t);
    const fresh = t - t0 < 2 / 24, reg = fresh ? [9, -6] : [3, 2];       // ấn mới: hai khung lệch bản
    g.drawImage(P.render(M, C, { seed: 4 + which, inkSeed: 4 + which + Math.floor(t * 12) % 3, reg, plate: RED }), 0, 0);
  }
  if (!inBlock || t >= T_PEEL[1]) { credit(g); caption(g, t); }
  else captionBlock(g, t);
}
function captionBlock(g, t) {   // lúc còn là ván gỗ: phụ đề in lên dải giấy lề dưới
  g.save(); g.fillStyle = '#EFE8D8'; g.fillRect(0, 1370, W, 260); g.restore(); caption(g, t);
}
function bench(g) {   // mặt bàn thợ khắc quanh khối ván
  g.save(); g.fillStyle = '#2b1d12'; g.beginPath(); g.rect(0, 0, W, H); g.rect(BX - 6, BY - 6, BW + 12, BH + 12); g.fill('evenodd');
  g.fillStyle = 'rgba(255,230,190,.05)'; for (let y = 0; y < H; y += 14) g.fillRect(0, y, W, 2); g.restore();
}
function brayer(g, x) {
  g.save(); g.fillStyle = '#151515'; g.fillRect(x - 26, BY - 30, 52, BH + 60);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x - 12, BY - 30, 6, BH + 60);
  g.fillStyle = '#6b4a2a'; g.fillRect(x - 10, BY - 140, 20, 110); g.restore();
}
function knifeTip(g, t) {   // mũi dao theo nét đang khắc
  const tip = TIPS[TIPS.length - 1]; if (!tip) return;
  WC.chip(g, tip, 1, '#d8c29c');
  g.save(); g.translate(tip.x, tip.y); g.rotate(-.9);
  g.fillStyle = '#c9c4ba'; g.beginPath(); g.moveTo(0, 0); g.lineTo(10, -60); g.lineTo(-6, -60); g.closePath(); g.fill();
  g.fillStyle = '#7a5532'; g.fillRect(-9, -190, 22, 132); g.restore();
}
