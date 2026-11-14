// Chương A · Chinese Ink Wash (Lemo-Opuscar): bút lông viết chữ 字 → vết mực loang → vỏ cây, sợi gai, giẻ, lưới hóa thành tờ giấy (Thái Luân, năm 105)
import { mk, draw, drawSeq, mass, blot, TONE } from './ink.js';
import { makeComp, layerSet } from './comp.js';
import { mountainLayer, ridgeFn } from './land.js';
import { W, H, CH, capsOf, capAt, seg, ease } from '../shared/timeline.js';
import { mulberry, vnoise } from '/core/lib.js';

export const DUR = +(CH.a[1] - CH.a[0]).toFixed(2);
export let EV = [];
const CAPS = capsOf('a');
const VERM = [176, 46, 34];
const T_BLOOM = [3.05, 3.85];            // vết mực loang sang cảnh 2

let out, comp, A, B, far, near, ZI, BARK, HEMP, RAG, NET, PAPER_EDGE;

// chữ 字 (6 nét, theo thứ tự viết) trong ô (x, y, s)
function ziStrokes(x, y, s) {
  const P = a => a.map(([u, v, p]) => [x + u * s, y + v * s, p ?? 1]);
  return [
    mk(P([[.47, .02, .6], [.53, .1, 1], [.55, .14, .8]]), { w: s * .085, tone: TONE.jiao, dry: .2, wet: .35, prof: 'dot', seed: 11 }),
    mk(P([[.17, .2, .9], [.155, .27, 1], [.14, .34, .5]]), { w: s * .07, tone: TONE.jiao, dry: .3, wet: .3, prof: 'nail', seed: 12 }),
    mk(P([[.17, .21, .7], [.5, .19, .9], [.82, .17, 1], [.8, .26, .9], [.74, .33, .4]]), { w: s * .07, tone: TONE.jiao, dry: .35, wet: .3, prof: 'press', seed: 13 }),
    mk(P([[.3, .44, .7], [.5, .42, .9], [.68, .4, 1], [.6, .48, .8], [.52, .55, .7]]), { w: s * .068, tone: TONE.jiao, dry: .3, wet: .3, prof: 'press', seed: 14 }),
    mk(P([[.52, .55, 1], [.53, .72, 1], [.52, .9, .9], [.47, .93, .6], [.41, .89, .3]]), { w: s * .078, tone: TONE.jiao, dry: .4, wet: .3, prof: 'press', seed: 15 }),
    mk(P([[.1, .67, .6], [.5, .655, 1], [.9, .64, .8]]), { w: s * .072, tone: TONE.jiao, dry: .45, wet: .3, prof: 'na', seed: 16 }),
  ];
}

export async function init(g) {
  out = document.createElement('canvas'); out.width = W; out.height = H; comp = makeComp(out);
  A = layerSet(W, H); B = layerSet(W, H);
  far = mountainLayer({ W, H, ridge: ridgeFn([[250, 230, 260], [700, 320, 300], [1000, 180, 200]], 560, 2, 22), depth: 260, tone: .2, rim: .5, mist: 1.1, seed: 2 });
  near = mountainLayer({ W, H, ridge: ridgeFn([[120, 120, 200], [900, 150, 240]], 1350, 5, 26), depth: 220, tone: .32, rim: .7, mist: .9, seed: 5 });
  ZI = ziStrokes(300, 640, 480);
  // cảnh 2: bốn nguyên liệu, mỗi thứ vài nét, chảy vào giữa
  const R = mulberry(7);
  BARK = [mk([[150, 760, .7], [260, 700, 1], [380, 690, 1], [470, 720, .6]], { w: 44, tone: .82, dry: .55, wet: .5, side: .8, darkDir: [0, -1], brWet: true, body: .5, prof: 'press', seed: 31 }),
    mk([[250, 708], [230, 650], [205, 620]], { w: 9, tone: .85, dry: .5, prof: 'tip', seed: 32 }),
    mk([[360, 692], [380, 640]], { w: 7, tone: .85, dry: .5, prof: 'tip', seed: 33 })];
  HEMP = Array.from({ length: 6 }, (_, i) => mk([[620 + i * 14, 640], [680 + i * 10, 700 + R() * 20], [760 + i * 6, 780], [860, 800 + i * 9]], { w: 4, tone: .7, dry: .75, prof: 'tip', seed: 40 + i }));
  RAG = { poly: [[170, 1010], [300, 960], [420, 990], [450, 1080], [360, 1140], [220, 1120]], fold: mk([[200, 1040], [300, 1030], [410, 1060]], { w: 10, tone: .8, dry: .5, wet: .4, prof: 'lens', seed: 51 }) };
  NET = [];
  for (let i = 0; i < 6; i++) NET.push(mk([[640, 960 + i * 30], [760, 950 + i * 34], [900, 970 + i * 30]], { w: 2.6, tone: .78, dry: .55, prof: 'even', seed: 60 + i }));
  for (let i = 0; i < 7; i++) NET.push(mk([[650 + i * 40, 950], [660 + i * 38, 1030], [655 + i * 40, 1130]], { w: 2.6, tone: .78, dry: .55, prof: 'even', seed: 70 + i }));
  PAPER_EDGE = mk([[300, 1210, .5], [540, 1200, 1], [780, 1212, .5]], { w: 10, tone: .5, dry: .7, prof: 'tip', seed: 80 });
  EV = [{ t: .25, type: 'brush', n: 6, dur: 2.2 }, { t: 2.65, type: 'seal' }, { t: T_BLOOM[0], type: 'drop' },
    { t: 3.6, type: 'brush', n: 2, dur: .6 }, { t: 4.6, type: 'brush', n: 4, dur: 3.2 }, { t: 7.9, type: 'wash' }, { t: 9.0, type: 'seal' }];
}

function seal(L, x, y, s, a, seed) {    // ấn son 白文: ô đỏ hơi méo, nét khắc trắng
  if (a <= 0) return;
  const c = L.cc; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y);
  c.beginPath(); for (let i = 0; i < 24; i++) { const t = i / 24 * 4, sd = Math.floor(t), u = t - sd; let px = [u, 1, 1 - u, 0][sd] * s, py = [0, u, 1, 1 - u][sd] * s; px += (vnoise(seed + i) - .5) * s * .04; py += (vnoise(seed + 40 + i) - .5) * s * .04; i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.closePath(); c.fillStyle = `rgba(${VERM},${a})`; c.fill();
  c.globalCompositeOperation = 'destination-out'; c.strokeStyle = '#000'; c.lineWidth = s * .09; c.lineCap = 'round';
  c.beginPath(); c.moveTo(s * .25, s * .22); c.lineTo(s * .75, s * .22); c.moveTo(s * .5, s * .22); c.lineTo(s * .5, s * .8); c.lineTo(s * .38, s * .72); c.moveTo(s * .22, s * .52); c.lineTo(s * .78, s * .5); c.stroke();
  c.restore();
}
function caption(L, t) {   // đề từ (题跋): chữ nghiêng màu mực, ô son nhỏ đầu dòng, hiện ướt rồi khô
  const cp = capAt(CAPS, t); if (!cp) return;
  const a = Math.min(seg(t, cp.t0, cp.t0 + .25), 1 - seg(t, cp.t1 - .2, cp.t1)), wetK = 1 - seg(t, cp.t0, cp.t0 + .35);
  const size = 54, y0 = 1470;
  for (const [ctx, k] of [[L.cw, wetK * .8], [L.cd, 1 - wetK * .5]]) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = Math.max(0, a * k * .92); ctx.fillStyle = '#000'; ctx.textAlign = 'center';
    ctx.font = `italic 600 ${size}px "Cormorant VN"`;
    cp.lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * size * 1.25)); ctx.restore();
  }
  const c = L.cc; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a * .9; c.fillStyle = `rgb(${VERM})`;
  c.font = `italic 600 ${size}px "Cormorant VN"`; const w0 = c.measureText(cp.lines[0]).width; c.fillRect(W / 2 - w0 / 2 - 34, y0 - 30, 16, 16); c.restore();
}

function scene1(L, t) {
  L.clear();
  const k = ease(seg(t, 0, .9));                               // núi xa loang ra từ màn sương
  L.cw.globalAlpha = k; L.cw.drawImage(far, 0, -40); L.cw.globalAlpha = 1;
  drawSeq(L.ink, ZI, seg(t, .25, 2.55), 1, .1);                  // viết chữ 字 theo thứ tự nét
  seal(L, 735, 1065, 74, ease(seg(t, 2.65, 2.85)), 3);
  caption(L, t);
}
function scene2(L, t) {
  L.clear();
  L.cw.globalAlpha = .8; L.cw.drawImage(near, 0, 0); L.cw.globalAlpha = 1;
  // "105": đề số lớn trên khoảng giấy trống, ướt rồi khô
  const a = ease(seg(t, 3.6, 4.1)), wetK = 1 - seg(t, 3.6, 4.2);
  for (const [ctx, kk] of [[L.cw, wetK], [L.cd, 1 - wetK * .5]]) { ctx.save(); ctx.globalAlpha = a * kk; ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.font = 'italic 700 230px "Cormorant VN"'; ctx.fillText('105', W / 2, 420); ctx.font = 'italic 500 56px "Cormorant VN"'; ctx.fillText('Thái Luân · nhà Hán', W / 2, 510); ctx.restore(); }
  seal(L, 800, 300, 64, ease(seg(t, 4.1, 4.3)), 9);
  // nguyên liệu hiện theo lời đọc: vỏ cây · sợi gai · giẻ rách · lưới cá
  const gather = ease(seg(t, 8.0, 9.2));                        // cuối: cuộn vào giữa thành tờ giấy
  const fadeMat = 1 - gather;
  if (fadeMat > 0) {
    for (const s of BARK) draw(L.ink, s, seg(t, 4.7, 5.6), fadeMat);
    for (const s of HEMP) draw(L.ink, s, seg(t, 5.8, 6.7), fadeMat);
    mass(L.cw, RAG.poly, .3 * ease(seg(t, 6.7, 7.1)) * fadeMat, 10, 3, [170, 960, 450, 1140, .5, 1]); draw(L.ink, RAG.fold, seg(t, 6.8, 7.2), fadeMat);
    NET.forEach((s, i) => draw(L.ink, s, seg(t, 7.1 + i * .04, 7.7 + i * .04), fadeMat));
  }
  // "khoảng trống là vật chất": nước mực loang quanh một hình chữ nhật trắng → tờ giấy
  if (gather > 0) {
    const cx = W / 2, cy = 930, pw = 420 * (.4 + .6 * gather), ph = 540 * (.4 + .6 * gather);
    const c = L.cw; c.save(); c.globalAlpha = gather;
    const gr = c.createRadialGradient(cx, cy, 200, cx, cy, 470); gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(.7, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.beginPath();
    for (let i = 0; i < 160; i++) { const an = i / 160 * Math.PI * 2, r = (330 + 300 * gather) * (1 + (vnoise(i * .09 + 3) - .5) * .35 + (vnoise(i * .4 + 9) - .5) * .08); i ? c.lineTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r) : c.moveTo(cx + Math.cos(an) * r, cy + Math.sin(an) * r); }
    c.closePath(); c.fill();
    c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1; c.beginPath();
    const q = mulberry(9), pts = [[cx - pw / 2, cy - ph / 2], [cx + pw / 2, cy - ph / 2], [cx + pw / 2, cy + ph / 2], [cx - pw / 2, cy + ph / 2]];
    pts.forEach(([x, y], i) => { const nx = pts[(i + 1) % 4]; for (let k = 0; k < 12; k++) { const u = k / 12; const X = x + (nx[0] - x) * u + (q() - .5) * 6, Y = y + (nx[1] - y) * u + (q() - .5) * 6; (i || k) ? c.lineTo(X, Y) : c.moveTo(X, Y); } });
    c.closePath(); c.fill(); c.restore();
    seal(L, cx + pw / 2 - 70, cy + ph / 2 - 80, 44, ease(seg(t, 9.0, 9.2)), 21);
  }
  caption(L, t);
}

export function render(g, t) {
  const paper = [0, 0, 1];
  if (t < T_BLOOM[0]) { scene1(A, t); comp(A, null, { paper, bleed: 5, rim: .8, vig: .25 }); }
  else if (t < T_BLOOM[1]) {
    scene1(A, t); scene2(B, t);
    const u = ease(seg(t, ...T_BLOOM));
    comp(A, B, { paper, paperB: paper, bleed: 5, bleedB: 5, trans: [W / 2, 900, 20 + 2300 * u, 1], vig: .25 });
  } else { scene2(A, t); comp(A, null, { paper, bleed: 5, rim: .8, vig: .25 }); }
  g.drawImage(out, 0, 0);
}
