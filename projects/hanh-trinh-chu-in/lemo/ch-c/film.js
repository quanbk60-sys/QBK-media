// Chương C · Copperplate Engraving (Lemo-Opuscar): bảng minh họa kiểu bảo tàng, một con chữ kim loại rời được khắc dần,
// roundel phóng to mặt chữ khắc ngược, hàng chữ được xếp, rồi tô màu nước một lần (Mainz, khoảng 1450)
import { B, engraveShape, Wash, drawSheet, engraveText, writeScript, roundelFrame, leader, borderInk } from './engine/index.js';
import { W, H, CH, capsOf, capAt, seg, ease } from '../shared/timeline.js';

export const DUR = +(CH.c[1] - CH.c[0]).toFixed(2);
export let EV = [];
const CAPS = capsOf('c');
const PLATE = [50, 150, 1030, 1370];
const RO = { x: 815, y: 650, r: 158 };              // roundel
let ink, gInk, wash, glyphs;

export async function init() {
  glyphs = await (await fetch(new URL('./glyphs.json', import.meta.url))).json();
  ink = new B.Ink();
  borderInk(ink.group('bd'), [PLATE[0] + 22, PLATE[1] + 22, PLATE[2] - 22, PLATE[3] - 22]);
  const L = [-0.6, -0.7];
  // con chữ: mặt trước, mặt bên (quay khỏi ánh sáng), mặt trên
  const front = engraveShape('M210 640 H530 V1110 H210 Z', { ink, g: 'f', light: L, spacing: 4.2, angle: 1.45, base: .18, wMax: 1.7 });
  engraveShape('M530 640 L640 560 V1030 L530 1110 Z', { ink, g: 's', light: L, spacing: 3.8, angle: -.75, base: .55, wMax: 1.9, seed: 3 });
  engraveShape('M210 640 L320 560 H640 L530 640 Z', { ink, g: 't', light: L, spacing: 4.6, angle: .1, base: .02, wMax: 1.2, seed: 5 });
  engraveShape('M350 585 L380 563 H500 L470 585 Z', { ink, g: 'r', light: L, spacing: 3, angle: .1, base: .5, wMax: 1.4, seed: 7 });   // khối mặt chữ nổi
  ink.group('nk'); B.stroke(ink, [[214, 1010], [528, 1010]], 1.6); B.stroke(ink, [[214, 1030], [528, 1030]], 1.1);                 // rãnh khía
  // hàng chữ được xếp
  for (let i = 0; i < 9; i++) engraveShape(`M${118 + i * 94} 1190 h78 v108 h-78 Z`, { ink, g: 'row', light: L, spacing: 3.6, angle: 1.45, base: .3, wMax: 1.3, seed: 20 + i });
  ink.schedule('bd', 0, .6, { conc: 2 });
  ink.schedule(['fol', 'sol', 'tol', 'rol'], .35, 1.5, { conc: 3 });
  ink.schedule(['fh1', 'sh1', 'th1', 'rh1'], 1.1, 2.4, { conc: 40 });
  ink.schedule(['fh2', 'sh2', 'th2', 'rh2'], 2.0, 3.0, { conc: 40 });
  ink.schedule(['fh3', 'sh3', 'th3', 'rh3', 'nk'], 2.6, 3.4, { conc: 40 });
  ink.schedule(['rowol', 'rowh1', 'rowh2', 'rowh3'], 4.2, 5.3, { conc: 30 });
  ink.build();
  // chữ G khắc ngược trong roundel (ink riêng, vẽ trong vùng cắt tròn)
  gInk = new B.Ink();
  engraveShape(glyphs.Gm, { ink: gInk, g: 'g', at: B.xf(RO.x, RO.y, 250), light: L, spacing: 3.4, angle: -.6, base: .3, wMax: 1.6, style: 'contour' });
  gInk.schedule(['gol'], 3.05, 3.7, { conc: 3 }); gInk.schedule(['gh1', 'gh2', 'gh3'], 3.4, 4.3, { conc: 40 }); gInk.build();
  wash = new Wash({ scale: 1.2 });
  wash.add({ path: front.shape.path, polys: front.shape.polys, color: '#9a8a62', origin: [300, 700], t0: 5.5, dur: 1.2, alpha: .7 });
  EV = [{ t: .35, type: 'burin', dur: 3.1 }, { t: 2.9, type: 'scribe' }, { t: 3.05, type: 'burin', dur: 1.2 }, { t: 4.2, type: 'clack', n: 9, dur: 1.1 },
    { t: 5.45, type: 'press' }, { t: 6.4, type: 'tick', dur: .8 }];
}

function slip(g, t) {   // phụ đề: chữ viết tay trên mảnh giấy rìa xơ, giữa đáy
  const cp = capAt(CAPS, t); if (!cp) return;
  const a = Math.min(seg(t, cp.t0 - .1, cp.t0 + .05), 1 - seg(t, cp.t1 - .15, cp.t1));
  const y = 1440, h = cp.lines.length > 1 ? 170 : 105;
  g.save(); g.globalAlpha = a; g.fillStyle = '#f6efdc'; g.shadowColor = 'rgba(60,40,20,.25)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
  g.beginPath(); const x0 = 70, x1 = W - 70; g.moveTo(x0, y);
  for (let x = x0; x <= x1; x += 18) g.lineTo(x, y + (B.noise1(x * .05, 3) - .5) * 5);
  for (let x = x1; x >= x0; x -= 18) g.lineTo(x, y + h + (B.noise1(x * .05, 9) - .5) * 5);
  g.closePath(); g.fill(); g.restore();
  const p = seg(t, cp.t0, cp.t0 + .45);
  cp.lines.forEach((l, i) => writeScript(g, l, W / 2, y + 66 + i * 70, { size: 56, font: 'EB Garamond VN', weight: 500, p: Math.min(1, p * 1.2 - i * .2), alpha: a }));
}

export function render(g, t) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  drawSheet(g, { W, H, plate: PLATE });
  wash.draw(g, t);
  ink.draw(g, t);
  // tiêu đề khắc từng chữ
  engraveText(g, 'MAINZ · c. 1450', W / 2, 250, { size: 60, font: 'EB Garamond VN', weight: 700, track: .12, p: seg(t, .3, 1.4) });
  engraveText(g, 'Gutenberg · con chữ kim loại rời', W / 2, 312, { size: 36, font: 'EB Garamond VN', italic: true, weight: 500, p: seg(t, 1.0, 2.0) });
  // roundel phóng to: vạch vòng, nền trắng, chữ G ngược được khắc vào
  const rp = seg(t, 2.85, 3.3);
  if (rp > 0) {
    g.save(); g.beginPath(); g.arc(RO.x, RO.y, RO.r - 6, 0, Math.PI * 2); g.fillStyle = 'rgba(244,236,214,.96)'; g.fill(); g.clip();
    gInk.draw(g, t); g.restore();
    roundelFrame(g, RO.x, RO.y, RO.r, { p: rp, w: 2.6 });
    leader(g, [430, 575], [RO.x - RO.r * .92, RO.y - RO.r * .38], { p: seg(t, 3.0, 3.4), num: 'I', numP: seg(t, 3.3, 3.6) });
    engraveText(g, 'mặt chữ: khắc ngược', RO.x, RO.y + RO.r + 46, { size: 30, font: 'EB Garamond VN', italic: true, p: seg(t, 3.5, 4.3) });
  }
  engraveText(g, 'xếp thành trang', W / 2, 1345, { size: 30, font: 'EB Garamond VN', italic: true, p: seg(t, 4.9, 5.6) });
  engraveText(g, 'IN HÀNG LOẠT', W / 2, 1150, { size: 40, font: 'EB Garamond VN', weight: 700, track: .2, p: seg(t, 6.4, 7.1) });
  slip(g, t);
}
