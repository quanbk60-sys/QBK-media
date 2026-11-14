// Chương D · CRT ASCII Terminal (Lemo-Opuscar): màn hình hổ phách bật lên, nhật ký hành trình gõ ra từng dòng,
// chữ "CHỮ" dựng bằng ký tự rồi phóng vào tới từng điểm sáng, cuốn sách bằng ký tự, lời mời theo dõi (màu thứ hai duy nhất)
import { initTerm, glyph, makeRamp, pick, cellsFromImage } from './term.js';
import { makeCRT } from './crt.js';
import { W, H, CH, capsOf, capAt, seg, ease } from '../shared/timeline.js';

export const DUR = +(CH.d[1] - CH.d[0]).toFixed(2);
export let EV = [];
const CAPS = capsOf('d');
const T = { on0: 0, on1: .5, log0: .6, clr: 2.95, word: 3.05, push0: 3.9, push1: 6.0, book: 6.1, cta: 7.4, off: 99 };
const LOG = [['> hanh_trinh_chu.log', 0], ['', 0], ['105   GIẤY ......... OK', 1], ['868   KHẮC GỖ ...... OK', 1], ['1450  CHỮ RỜI ...... OK', 1], ['NAY   MÀN HÌNH ..... ', 1]];
const LV = { ox: 96, oy: 300, cw: 36, rk: 2.7 };             // lưới nhật ký: 25 cột
const STRIP = { y: 1490, cw: 21 };                   // dải LOG (phụ đề)
let out, crt, scene, g, RAMP, WORD, BOOK;

const R = a => `rgba(255,0,0,${Math.min(1, a)})`;   // kênh đỏ = độ sáng phosphor hổ phách; kênh xanh lá = màu thứ hai
function begin() { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'lighter'; }
// đặt một chuỗi lên lưới đơn cách, từng ký tự một ô (chữ Việt có dấu nên vẽ thẳng bằng font VT323)
function cells(str, col, row, v, a = 1, chan = 0, n = Infinity) {
  g.font = `${v.cw / .4}px VT323`; g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
  g.fillStyle = chan ? `rgba(0,255,0,${Math.min(1, a)})` : R(a);
  for (let i = 0; i < Math.min(str.length, n); i++) if (str[i] !== ' ') g.fillText(str[i], v.ox + (col + i) * v.cw, v.oy + row * v.cw * (v.rk ?? 2) + v.cw * 1.6);
}
function cursorAt(col, row, v, a) { g.globalAlpha = 1; g.fillStyle = R(a); g.fillRect(v.ox + col * v.cw + v.cw * .08, v.oy + row * v.cw * (v.rk ?? 2) + v.cw * .3, v.cw * .84, v.cw * 1.5); }
const blink = (t, p = .5) => (Math.floor(t / p) % 2 === 0 ? 1 : .08);

// tranh xám → ô ký tự (đúng quy trình của engine: âm bản khớp lưới, trung bình mỗi ô, chọn ký tự theo mật độ)
function picture(cols, rows, sx, sy, paint) {
  const cv = document.createElement('canvas'); cv.width = cols * sx; cv.height = rows * sy;
  const q = cv.getContext('2d', { willReadFrequently: true }); q.fillStyle = '#000'; q.fillRect(0, 0, cv.width, cv.height); paint(q, cv.width, cv.height);
  return cellsFromImage(q.getImageData(0, 0, cv.width, cv.height).data, cv.width, cols, rows, sx, sy);
}
function drawPicture(P, ox, oy, cw, { rowsShown = 1e9, gain = 1, minA = 0 } = {}) {
  for (let j = 0; j < Math.min(P.rows, rowsShown); j++) for (let i = 0; i < P.cols; i++) {
    const x = ox + i * cw, y = oy + j * cw * 2; if (x < -cw || x > W || y < -2 * cw || y > H) continue;
    const L = Math.pow(P.A[j * P.cols + i], 1.25) * gain; if (L < .06) continue;
    const l = pick(RAMP, L, i, j); glyph(g, l.ch, x, y, cw, Math.max(minA, l.a));
  }
}

export async function init() {
  out = document.createElement('canvas'); out.width = W; out.height = H; crt = makeCRT(out);
  scene = document.createElement('canvas'); scene.width = W; scene.height = H; g = scene.getContext('2d');
  await initTerm(); RAMP = makeRamp(' .:-=+*#%@');
  // chữ "CHỮ" dày 100 cột (ô 9px)
  WORD = picture(100, 64, 4, 8, (q, w, h) => {
    q.fillStyle = '#fff'; q.textAlign = 'center'; q.font = `700 ${h * .34}px "EB Garamond VN"`; q.fillText('CHƯ', w / 2, h * .68);
    // dấu ngã vẽ dày để còn đọc được ở độ phân giải ô ký tự
    const tw = q.measureText('CHƯ').width, ux = w / 2 + tw / 2 - tw * .2; q.strokeStyle = '#fff'; q.lineWidth = h * .028; q.lineCap = 'round';
    q.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20, x = ux - 34 + u * 68, y = h * .4 - Math.sin(u * Math.PI * 2) * 9; k ? q.lineTo(x, y) : q.moveTo(x, y); } q.stroke();
    const gr = q.createRadialGradient(w / 2, h * .5, 10, w / 2, h * .5, w * .55); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.fillRect(0, 0, w, h);
  });
  // cuốn sách mở: hai trang sáng, dòng chữ là vạch tối, gáy tối, viền sáng
  BOOK = picture(72, 36, 4, 8, (q, w, h) => {
    const page = (s) => { q.save(); q.translate(w / 2, h * .22); q.scale(s, 1);
      q.beginPath(); q.moveTo(0, 6); q.quadraticCurveTo(w * .2, -10, w * .44, 0); q.lineTo(w * .46, h * .7); q.quadraticCurveTo(w * .22, h * .62, 0, h * .72); q.closePath();
      const gr = q.createLinearGradient(0, 0, w * .45, 0); gr.addColorStop(0, '#555'); gr.addColorStop(.25, '#ddd'); gr.addColorStop(1, '#fff'); q.fillStyle = gr; q.fill();
      q.fillStyle = '#222'; for (let k = 0; k < 8; k++) q.fillRect(w * .07, h * .1 + k * h * .068, w * (.3 - (k === 7 ? .12 : 0)), h * .022);
      q.restore(); };
    page(1); page(-1);
    q.fillStyle = '#fff'; q.fillRect(w * .03, h * .94, w * .94, h * .03);
  });
  EV = [{ t: T.on0, type: 'poweron' }, { t: T.log0, type: 'type', dur: 2.2 }, { t: T.clr, type: 'clear' }, { t: T.push0, type: 'zoom', dur: 2.1 },
    { t: T.book, type: 'scan', dur: 1.1 }, { t: T.cta, type: 'type', dur: .9 }, { t: T.cta + 1.0, type: 'bel' }];
}

function logStrip(t) {     // phụ đề = dòng xuất của máy, gõ từng từ khớp lời đọc
  const v = { ox: 70, oy: STRIP.y, cw: STRIP.cw };
  g.globalAlpha = 1; g.fillStyle = R(.28); g.fillRect(60, STRIP.y - 18, W - 120, 3);
  // thẻ đảo màu
  g.fillStyle = R(.9); g.fillRect(70, STRIP.y + 4, STRIP.cw * 5, STRIP.cw * 1.9);
  g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.font = `${STRIP.cw / .4}px VT323`; g.fillText(' LOG', 70, STRIP.y + STRIP.cw * 1.6); g.globalCompositeOperation = 'lighter';
  const cp = capAt(CAPS, t);
  if (!cp) { cursorAt(6, 0, v, blink(t) * .8); return; }
  const lines = cp.lines.map(s => s.toUpperCase()), total = lines.join(' ').length;
  const n = Math.floor(total * seg(t, cp.t0, cp.t0 + (cp.t1 - cp.t0) * .72));
  const words = lines.join(' ').slice(0, n), cut = words.lastIndexOf(' ') + 1, shown = n >= total ? total : cut;   // từng từ
  let used = 0;
  lines.forEach((l, i) => { const k = Math.max(0, Math.min(l.length, shown - used)); cells(l, i ? 6 : 6, i * 1.25, v, 1, 0, k); used += l.length + 1; });
  if (shown >= total) { const ll = lines[lines.length - 1]; cursorAt(6 + ll.length + 1, (lines.length - 1) * 1.25, v, blink(t)); }
}

export function render(gOut, t) {
  begin();
  if (t < T.clr) {
    // nhật ký: máy gõ đều, nhanh
    let budget = Math.floor(Math.max(0, t - T.log0) / .022), row = 0;
    for (const [s] of LOG) { const k = Math.min(s.length, budget); cells(s, 0, row, LV, s.startsWith('>') ? 1 : .85, 0, k); budget -= s.length + 6; if (budget < 0 && k < s.length) { cursorAt(k, row, LV, 1); break; } row++; }
    if (budget >= 0) { const last = LOG[LOG.length - 1][0]; cursorAt(last.length, LOG.length - 1, LV, blink(t, .4)); }
    // vạch tiến trình
    const pr = seg(t, T.log0, 2.8); cells('[' + '#'.repeat(Math.round(pr * 20)).padEnd(20, '.') + ']', 0, 7, LV, .6);
  } else if (t < T.book) {
    // "CHỮ" bằng ký tự → đẩy cỡ ô (camera = cỡ chữ) vào nét chữ cho tới khi chỉ còn từng điểm sáng
    const u = ease(seg(t, T.push0, T.push1)), cw = 9 * Math.exp(Math.log(9) * u);    // 9 → 81 px
    const fx = 36.5, fy = 36, ox0 = (W - 100 * 9) / 2, oy0 = 300;          // ô tâm: mép thân chữ H
    const sx0 = ox0 + fx * 9, sy0 = oy0 + fy * 18, sx = sx0 + (W / 2 - sx0) * u, sy = sy0 + (760 - sy0) * u;
    const OX = sx - fx * cw, OY = sy - fy * cw * 2;
    const reveal = seg(t, T.word, T.word + .5);
    g.save(); g.beginPath(); g.rect(0, 0, W, 1440); g.clip();
    drawPicture(WORD, OX, OY, cw, { rowsShown: Math.floor(reveal * 64) }); g.restore();
  } else {
    // cuốn sách quét từ trên xuống, rồi lời mời: QBK sáng bằng màu thứ hai (lần duy nhất)
    const rows = Math.floor(seg(t, T.book, T.book + 1.1) * 36);
    drawPicture(BOOK, (W - 72 * 13) / 2, 300, 13, { rowsShown: rows });
    const v = { ox: 150, oy: 1300, cw: 32 };
    const s = '> theo dõi ', n = Math.floor(seg(t, T.cta, T.cta + .55) * s.length);
    cells(s, 0, 0, v, 1, 0, n);
    if (t > T.cta + .6) { cells('QBK', s.length, 0, v, 1, 1, Math.floor(seg(t, T.cta + .6, T.cta + .85) * 3)); }
    if (t > T.cta + .9) cursorAt(s.length + 4, 0, v, blink(t));
  }
  logStrip(t);
  const P = { power: seg(t, T.on0, T.on1), curv: .035 };
  if (t < T.on0 + .01) P.expo = 0;
  crt.render(scene, Math.round(t * 24), P);
  gOut.drawImage(out, 0, 0);
}
