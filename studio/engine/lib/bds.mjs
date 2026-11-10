// Phong cách "bds": video giới thiệu bất động sản. Phần vị trí học từ skill map-location-video
// (studio/references/vi-tri-ket-noi-bds): nền vệ tinh nghiêng 3D (view.tilt, vẽ ở geo.mjs), tuyến đường OSRM,
// ghim + nhãn kim loại tự né, thẻ địa điểm km/phút, thanh tiến trình, thẻ kết. Phần giới thiệu BĐS: ảnh thật
// của dự án (cover hoặc khung trên nền mờ), tiêu đề ảnh, thẻ thông số, chip tiện ích.
// Mọi kích thước viết theo khung 576 px của skill gốc rồi nhân K = width/576 (1080 → 1,875).
// Mỗi khung, các nhãn/thẻ ghi hình chữ nhật vào s._rects để né nhau và để check_layout.mjs kiểm tra.
import path from 'node:path';
import fs from 'node:fs';
import {createCanvas, loadImage, Image} from '@napi-rs/canvas';
import {clamp, ease, backOut} from './math.mjs';
import {project} from './geo.mjs';

export const BDS_TYPES = ['bdsShade', 'bdsRoute', 'bdsPin', 'bdsCard', 'bdsBar', 'bdsHeadline', 'bdsOutro', 'bdsFooter', 'bdsPhoto', 'bdsCaption', 'bdsSpecs', 'bdsChips', 'bdsClip'];
export const STY = {
  gold: {m: ['#fff7c9', '#ffd94f', '#d9a31c', '#85560a', '#f6cf63'], flat: '#ffc247', txt: '#2a1a00'},
  blue: {m: ['#eaf5ff', '#8fc6ff', '#3b7bdc', '#16367a', '#9bcaff'], flat: '#5fa8ff', txt: '#04122e'},
  ruby: {m: ['#ffe6ea', '#ff8d9f', '#dc304a', '#6f0f24', '#ffb3bf'], flat: '#ff5d73', txt: '#2a0510'},
  green: {m: ['#eafff0', '#8ff0b0', '#2fbf6a', '#0d5a2c', '#a6f5c4'], flat: '#4fd98a', txt: '#03200f'},
  violet: {m: ['#f3ebff', '#c6a6ff', '#7d4fdc', '#33187a', '#d4bdff'], flat: '#a57bff', txt: '#14062e'},
};
const F = {bold: 'QBKBold', black: 'QBKBlack'};
const K = s => s.width / 576;
// layout (khung 576×1024 của skill gốc): lề 36, đáy thẻ cách đáy 84, thẻ cao 108, thẻ kết cao 176
export const LAYOUT = s => { const k = K(s), M = 36 * k, CARD_B = s.height - 84 * k; return {k, M, CARD_B, CARD_TOP: CARD_B - 108 * k, OUT_TOP: CARD_B - 176 * k, GAP: 14 * k, TOP: s.captionStyle && s.captionStyle.y < s.height / 2 ? s.captionStyle.y + s.captionStyle.size * 0.6 + 14 : 100 * k}; };
const sty = n => STY[n] || STY.gold;
const local = (e, t) => t - (e.from ?? 0);
const font = (ctx, size, fam = F.bold) => { ctx.font = `${Math.round(size)}px ${fam}`; };
function fit(ctx, text, size, min, maxW, fam = F.bold) { let s = size; font(ctx, s, fam); while (ctx.measureText(text).width > maxW && s > min) { s -= 1; font(ctx, s, fam); } return s; }
const mg = (ctx, n, y0, y1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); [0, 0.3, 0.55, 0.8, 1].forEach((o, i) => g.addColorStop(o, sty(n).m[i])); return g; };
const rect = (s, kind, x0, y0, x1, y1, extra = {}) => { (s._rects ||= []).push({kind, x0, y0, x1, y1, ...extra}); };
const ovl = (a, b, pad = 4) => a.x0 < b.x1 + pad && a.x1 > b.x0 - pad && a.y0 < b.y1 + pad && a.y1 > b.y0 - pad;
const strip = x => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

// ---------- ảnh ----------
export async function preloadBds(s) {
  s._bdsImg ||= new Map();
  for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'bdsPhoto' && !s._bdsImg.has(e.path)) {
    const im = await loadImage(path.join(s.base, e.path));
    const bw = 54, bh = Math.round(bw * im.height / im.width), b = createCanvas(bw, Math.max(1, bh)); b.getContext('2d').drawImage(im, 0, 0, bw, bh); // nền mờ: thu nhỏ rồi phóng to
    s._bdsImg.set(e.path, {im, blur: b});
  }
}
export function validateBds(s, e, where, err) {
  if (e.type === 'bdsPhoto' && !e.path) err(`${where}: bdsPhoto cần path`);
  if (e.type === 'bdsClip' && !fs.existsSync(path.join(s.base, e.dir || '', 'clip.json'))) err(`${where}: bdsClip thiếu ${e.dir}/clip.json (chạy camwalk.py / bds_build.py)`);
  if (e.type === 'bdsRoute' && !(e.path?.length >= 2)) err(`${where}: bdsRoute cần path [[lat,lon],...]`);
  if (e.type === 'bdsPin' && !e.geo) err(`${where}: bdsPin cần geo [lat, lon]`);
}

// ---------- icon ----------
function glyphKind(cat) {
  const c = strip(cat);
  if (/y te|benh vien|phong kham|suc khoe/.test(c)) return 'cross';
  if (/mua sam|cho|sieu thi|trung tam thuong mai|tttm/.test(c)) return 'bag';
  if (/giao duc|truong|dai hoc|hoc/.test(c)) return 'cap';
  if (/cong vien|xanh|ho |song|bien/.test(c)) return 'tree';
  if (/giai tri|vui choi|the thao/.test(c)) return 'star';
  if (/hanh chinh|ubnd|van phong/.test(c)) return 'building';
  if (/metro|ga /.test(c)) return 'train';
  return 'arrow';
}
const GLYPH = {
  cross: c => { c.fillRect(-4, -13, 8, 26); c.fillRect(-13, -4, 26, 8); },
  bag: c => { c.beginPath(); c.moveTo(-13, -3); c.lineTo(13, -3); c.lineTo(9, 12); c.lineTo(-9, 12); c.closePath(); c.fill(); c.lineWidth = 3; c.beginPath(); c.arc(0, -3, 8, Math.PI, 0); c.stroke(); },
  cap: c => { c.beginPath(); c.moveTo(-15, -3); c.lineTo(0, -11); c.lineTo(15, -3); c.lineTo(0, 5); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-8, 1); c.lineTo(-8, 8); c.quadraticCurveTo(0, 14, 8, 8); c.lineTo(8, 1); c.fill(); c.lineWidth = 2; c.beginPath(); c.moveTo(13, -2); c.lineTo(13, 9); c.stroke(); },
  tree: c => { c.beginPath(); c.arc(0, -4, 10, 0, Math.PI * 2); c.fill(); c.fillRect(-2.5, 4, 5, 10); },
  star: c => { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); },
  building: c => { c.fillRect(-11, -13, 22, 26); c.save(); c.globalCompositeOperation = 'destination-out'; for (const y of [-8, -1, 6]) for (const x of [-6, 2]) c.fillRect(x, y, 4, 4); c.restore(); },
  train: c => { c.beginPath(); c.roundRect(-10, -13, 20, 22, 5); c.fill(); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-7, 9); c.lineTo(-11, 14); c.moveTo(7, 9); c.lineTo(11, 14); c.stroke(); },
  arrow: c => { c.beginPath(); c.moveTo(14, -14); c.lineTo(-14, -3); c.lineTo(-4, 2); c.lineTo(-1, 13); c.closePath(); c.fill(); },
};
function glyph(ctx, cat, cx, cy, n, scale) { ctx.save(); ctx.translate(cx, cy); ctx.scale(scale, scale); const g = mg(ctx, n, -15, 15); ctx.fillStyle = g; ctx.strokeStyle = g; ctx.lineCap = 'round'; GLYPH[glyphKind(cat)](ctx); ctx.restore(); }
const SPEC = { // icon thông số, nét 2,5, khung ±14
  area: c => { c.strokeRect(-12, -12, 24, 24); c.beginPath(); c.moveTo(-12, 4); c.lineTo(4, -12); c.moveTo(-4, 12); c.lineTo(12, -4); c.stroke(); },
  bed: c => { c.beginPath(); c.moveTo(-14, 10); c.lineTo(-14, -8); c.moveTo(-14, 4); c.lineTo(14, 4); c.lineTo(14, 10); c.stroke(); c.fillRect(-10, -4, 8, 6); c.beginPath(); c.roundRect(-1, -3, 15, 7, 2); c.fill(); },
  bath: c => { c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(10, 10); c.lineTo(-10, 10); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-10, 0); c.lineTo(-10, -11); c.lineTo(-4, -11); c.stroke(); },
  money: c => { c.beginPath(); c.arc(0, 0, 13, 0, Math.PI * 2); c.stroke(); c.font = 'bold 18px QBKBold'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('₫', 0, 1); },
  key: c => { c.beginPath(); c.arc(-6, 0, 7, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(1, 0); c.lineTo(14, 0); c.moveTo(10, 0); c.lineTo(10, 6); c.moveTo(14, 0); c.lineTo(14, 5); c.stroke(); },
  doc: c => { c.strokeRect(-10, -13, 20, 26); c.beginPath(); for (const y of [-6, 0, 6]) { c.moveTo(-5, y); c.lineTo(5, y); } c.stroke(); },
  building: c => { c.strokeRect(-10, -13, 20, 26); for (const y of [-8, -1, 6]) for (const x of [-5, 2]) c.fillRect(x, y, 3, 3); },
  compass: c => { c.beginPath(); c.arc(0, 0, 13, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(0, -9); c.lineTo(4, 0); c.lineTo(0, 9); c.lineTo(-4, 0); c.closePath(); c.fill(); },
  car: c => { c.beginPath(); c.moveTo(-14, 6); c.lineTo(-14, -1); c.lineTo(-9, -9); c.lineTo(9, -9); c.lineTo(14, -1); c.lineTo(14, 6); c.closePath(); c.stroke(); c.beginPath(); c.arc(-8, 7, 3.5, 0, Math.PI * 2); c.arc(8, 7, 3.5, 0, Math.PI * 2); c.fill(); },
  calendar: c => { c.strokeRect(-12, -10, 24, 22); c.beginPath(); c.moveTo(-12, -3); c.lineTo(12, -3); c.moveTo(-6, -14); c.lineTo(-6, -7); c.moveTo(6, -14); c.lineTo(6, -7); c.stroke(); },
  pool: c => { for (const dy of [-2, 7]) { c.beginPath(); c.moveTo(-14, dy); for (let i = 0; i < 4; i++) c.quadraticCurveTo(-14 + i * 7 + 3.5, dy + (i % 2 ? 4 : -4), -14 + (i + 1) * 7, dy); c.stroke(); } c.beginPath(); c.moveTo(-6, -4); c.lineTo(-6, -13); c.moveTo(6, -4); c.lineTo(6, -13); c.stroke(); },
  pin: c => { c.beginPath(); c.arc(0, -4, 9, Math.PI, 0); c.lineTo(0, 14); c.closePath(); c.fill(); },
  star: c => GLYPH.star(c),
};

// ---------- bản đồ ----------
function bdsShade(ctx, e, t, s) {
  const W = s.width, H = s.height, cy = H / 2, top = Math.round(H * 0.127);
  ctx.fillStyle = `rgba(4,8,22,${e.dim ?? 0.16})`; ctx.fillRect(0, 0, W, H);
  let g = ctx.createLinearGradient(0, top - 20, 0, cy - 75); g.addColorStop(0, 'rgba(10,15,28,1)'); g.addColorStop(0.35, 'rgba(10,15,28,.55)'); g.addColorStop(1, 'rgba(10,15,28,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, cy - 75);
  ctx.fillStyle = 'rgba(10,15,28,1)'; ctx.fillRect(0, 0, W, top - 18);
  g = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createLinearGradient(0, H - 640, 0, H); g.addColorStop(0, 'rgba(3,6,16,0)'); g.addColorStop(1, 'rgba(3,6,16,.8)'); ctx.fillStyle = g; ctx.fillRect(0, H - 640, W, 640);
}
function routePts(e, s, v) { return e.path.map(p => project(v, s, p[0], p[1])); }
function cut(P, p) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); const target = L.at(-1) * p, out = [P[0]];
  for (let i = 1; i < P.length; i++) { if (L[i] <= target) { out.push(P[i]); continue; } const u = (target - L[i - 1]) / ((L[i] - L[i - 1]) || 1); out.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u]); break; } return out; }
function bdsRoute(ctx, e, t, s, v) {
  if (!v) return; const g = e.grow, p = g ? ease(clamp((local(e, t) - (g.at ?? 0)) / (g.dur ?? 2.6))) : 1; if (p <= 0) return;
  const k = K(s) * (e.width ?? 1), P = cut(routePts(e, s, v).filter(q => q[1] > -9999), p), c = sty(e.sty).flat, a = (e.alpha ?? 1) * (e.to !== undefined ? clamp((e.to - t) / 0.3) : 1);
  const line = () => { ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = c;
  ctx.globalAlpha = a * 0.22; ctx.lineWidth = 14 * k; line(); ctx.globalAlpha = a * 0.55; ctx.lineWidth = 7 * k; line();
  ctx.globalAlpha = a; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2 * k; line();
  if (e.head !== false && p < 0.97) { const [hx, hy] = P.at(-1); ctx.beginPath(); ctx.arc(hx, hy, 7 * k, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 3 * k; ctx.stroke(); }
  ctx.restore();
}
function pinBody(ctx, x, y, n, sc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.ellipse(0, 2, 10, 3.5, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-4, -8, -14, -14, -14, -24); ctx.arc(0, -24, 14, Math.PI, 0); ctx.bezierCurveTo(14, -14, 4, -8, 0, 0); ctx.closePath();
  ctx.fillStyle = mg(ctx, n, -38, 0); ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -24, 5.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.93)'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = sty(n).m[3]; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-6, -32, 3.2, 6, -0.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fill(); ctx.restore();
}
// nhãn: trên đầu ghim; tràn phải → bên trái; tràn trái → bên phải; né nhãn/thân ghim khác; hết cách → center* dịch vào trong
function placeLabel(ctx, s, x, y, sc, label, avoid, top, bottom) {
  const {M} = LAYOUT(s); font(ctx, 13 * sc); const w = ctx.measureText(label).width + 22 * sc, h = 24 * sc, hb = 14 * sc, gS = 12 * sc, gC = 14 * sc;
  const C = {center: {x0: x - w / 2, y0: y - 38 * sc - gC - h, x1: x + w / 2, y1: y - 38 * sc - gC},
    left: {x0: x - hb - gS - w, y0: y - 24 * sc - h / 2, x1: x - hb - gS, y1: y - 24 * sc + h / 2},
    right: {x0: x + hb + gS, y0: y - 24 * sc - h / 2, x1: x + hb + gS + w, y1: y - 24 * sc + h / 2}};
  const ok = c => c.x0 >= M && c.x1 <= s.width - M && c.y0 >= top && c.y1 <= bottom && !avoid.some(a => ovl(c, a));
  const order = C.center.x1 > s.width - M ? ['left', 'center', 'right'] : C.center.x0 < M ? ['right', 'center', 'left'] : ['center', 'left', 'right'];
  for (const m of order) if (ok(C[m])) return {mode: m, rect: C[m]};
  const c = C.center; let sh = 0; if (c.x0 < M) sh = M - c.x0; else if (c.x1 > s.width - M) sh = s.width - M - c.x1;
  return {mode: 'center*', rect: {x0: c.x0 + sh, y0: c.y0, x1: c.x1 + sh, y1: c.y1}};
}
function drawLabel(ctx, rc, label, n, sc, gold) {
  const w = rc.x1 - rc.x0, h = rc.y1 - rc.y0; ctx.beginPath(); ctx.roundRect(rc.x0, rc.y0, w, h, h / 2);
  if (gold) { ctx.fillStyle = mg(ctx, 'gold', rc.y0, rc.y1); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = sc / 1.875; ctx.stroke(); ctx.fillStyle = STY.gold.txt; }
  else { ctx.fillStyle = 'rgba(8,14,30,.92)'; ctx.fill(); ctx.strokeStyle = mg(ctx, n, rc.y0, rc.y1); ctx.lineWidth = 1.8 * sc / 1.875 * 1.6; ctx.stroke(); ctx.fillStyle = '#fff'; }
  font(ctx, 13 * sc); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, (rc.x0 + rc.x1) / 2, (rc.y0 + rc.y1) / 2 + sc * 0.5);
}
function bdsPin(ctx, e, t, s, v) {
  if (!v) return; const [x, y, depth] = project(v, s, e.geo[0], e.geo[1]); if (y < -9000 || x < -60 || x > s.width + 60 || y < 0 || y > s.height + 80) return;
  const L = LAYOUT(s), k = local(e, t), pop = e.pop === false ? 1 : ease(clamp(k / 0.35));
  const sc = L.k * (e.size ?? (e.project ? 1.15 : 1)) * clamp(depth, e.project ? 0.8 : 0.8, 1.15) * (0.4 + 0.6 * pop);
  const a = e.to !== undefined ? clamp((e.to - t) / 0.3) : 1;
  ctx.save(); ctx.globalAlpha = a; pinBody(ctx, x, y, e.sty || 'gold', sc);
  const body = {x0: x - 14 * sc, y0: y - 38 * sc, x1: x + 14 * sc, y1: y};
  rect(s, 'body', body.x0, body.y0, body.x1, body.y1, {id: e.id || e.label || 'pin'});
  if (e.label && pop >= 1) {
    const avoid = e.avoid === false ? [] : (s._rects || []).filter(r => r.kind === 'label' || r.kind === 'body' || r.kind === 'logo').filter(r => r.id !== (e.id || e.label || 'pin'));
    const pl = placeLabel(ctx, s, x, y, sc, e.label, avoid, e.top ?? L.TOP, e.bottom ?? L.CARD_TOP - L.GAP);
    if (pl.rect.y0 < (e.top ?? L.TOP) - 1 || pl.rect.y1 > (e.bottom ?? L.CARD_TOP - L.GAP) + 1) { ctx.restore(); return; } // không đặt được nhãn trong vùng cho phép: tạm ẩn
    const la = e.labelFade === false || e.pop === false ? 1 : clamp((k - 0.35) / 0.25); ctx.globalAlpha = a * la;
    drawLabel(ctx, pl.rect, e.label, e.sty || 'gold', sc, !!e.project);
    rect(s, 'label', pl.rect.x0, pl.rect.y0, pl.rect.x1, pl.rect.y1, {id: e.id || e.label, mode: pl.mode, full: la >= 1 && a >= 1, bottom: e.bottom ?? L.CARD_TOP - L.GAP});
  }
  ctx.restore();
}
function chip(ctx, k, x, y, text, n) { font(ctx, 14 * k); const w = ctx.measureText(text).width + 24 * k; ctx.beginPath(); ctx.roundRect(x, y, w, 28 * k, 14 * k); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill(); ctx.strokeStyle = mg(ctx, n, y, y + 28 * k); ctx.lineWidth = 1.8 * k; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 12 * k, y + 15 * k); return w + 8 * k; }
const km = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',') + ' km';
function bdsCard(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k, u = clamp(local(e, t) / 0.5), q = ease(u), cw = s.width - 2 * L.M, ch = 108 * k, x = L.M, y = L.CARD_TOP + (1 - q) * 50 * k, n = e.sty || 'gold';
  const a = q * (e.to !== undefined ? clamp((e.to - t) / 0.3) : 1); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 18 * k); ctx.fillStyle = 'rgba(9,16,38,.93)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = k; ctx.stroke();
  const icx = x + 44 * k, icy = y + ch / 2; ctx.beginPath(); ctx.arc(icx, icy, 28 * k, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill(); ctx.strokeStyle = mg(ctx, n, icy - 28 * k, icy + 28 * k); ctx.lineWidth = 3 * k; ctx.stroke();
  glyph(ctx, e.cat, icx, icy, n, k);
  const tx = x + 88 * k, maxW = cw - 106 * k; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const total = e.total ?? 1, idx = (e.index ?? 0) + 1, pad = i => String(i).padStart(2, '0');
  font(ctx, 12 * k); ctx.fillStyle = sty(n).flat; ctx.fillText(`${String(e.cat || '').toUpperCase()} · ${pad(idx)}/${pad(total)}`, tx, y + 26 * k);
  fit(ctx, e.name, 20 * k, 13 * k, maxW); ctx.fillStyle = '#fff'; ctx.fillText(e.name, tx, y + 52 * k); const nw = ctx.measureText(e.name).width;
  let cx = tx; if (e.km != null) cx += chip(ctx, k, cx, y + 66 * k, km(e.km), n); if (e.min != null) cx += chip(ctx, k, cx, y + 66 * k, `${Math.max(1, Math.round(e.min))} phút`, n); if (e.extra) cx += chip(ctx, k, cx, y + 66 * k, e.extra, n);
  ctx.restore();
  if (u >= 1) { rect(s, 'card', x, y, x + cw, y + ch); rect(s, 'text', tx, y + 40 * k, tx + nw, y + 64 * k); rect(s, 'text', tx, y + 66 * k, cx - 8 * k, y + 94 * k); }
}
function bdsBar(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k, W = s.width;
  let g = ctx.createLinearGradient(0, 0, 0, 170 * k); g.addColorStop(0, 'rgba(3,6,16,.8)'); g.addColorStop(1, 'rgba(3,6,16,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 170 * k);
  ctx.textBaseline = 'middle'; const half = (W - 2 * L.M) / 2 - 8 * k;
  fit(ctx, '● ' + (e.name || ''), 12 * k, 9 * k, half); ctx.textAlign = 'left'; ctx.fillStyle = STY.gold.flat; ctx.fillText('● ' + (e.name || ''), L.M, 64 * k);
  fit(ctx, e.area || '', 12 * k, 9 * k, half); ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(e.area || '', W - L.M, 64 * k);
  const cols = e.colors || [], N = cols.length; if (!N) return; const gap = 6 * k, sw = (W - 2 * L.M - (N - 1) * gap) / N, act = e.active ?? 0, f = clamp(t / (e.fillDur ?? e._shotDur ?? 5.5));
  for (let i = 0; i < N; i++) { const x = L.M + i * (sw + gap); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x, 82 * k, sw, 4 * k);
    const ff = i < act ? 1 : i === act ? f : 0; if (ff > 0) { ctx.fillStyle = sty(cols[i]).flat; ctx.fillRect(x, 82 * k, sw * ff, 4 * k); } }
}
function bdsHeadline(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k, end = e.to ?? e._shotDur ?? 3.5, a = ease((local(e, t) - 0.2) / 0.7) * (1 - ease((t - (end - 0.5)) / 0.5)); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 14 * k; const mw = s.width - 2 * L.M - 20 * k, y0 = e.y ?? 200 * k;
  const lines = e.lines || [], rows = [[lines[0], 52, 26, '#fff', 0, F.black], [lines[1], 52, 26, STY.gold.flat, 62, F.black], [e.sub, 22, 14, '#fff', 118, F.bold]];
  for (const [txt, sz, mn, c, dy, fam] of rows) { if (!txt) continue; const fs = fit(ctx, txt, sz * k, mn * k, mw, fam); ctx.fillStyle = c; ctx.fillText(txt, s.width / 2, y0 + dy * k); const hw = ctx.measureText(txt).width / 2; rect(s, 'text', s.width / 2 - hw, y0 + dy * k - fs / 2, s.width / 2 + hw, y0 + dy * k + fs / 2); }
  ctx.restore();
}
function bdsOutro(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k, u = ease(clamp((local(e, t) - 0) / 0.8)); if (u <= 0) return;
  const ch = 176 * k, x = L.M, cw = s.width - 2 * L.M, y = L.OUT_TOP + (1 - u) * 60 * k, W = s.width;
  ctx.save(); ctx.globalAlpha = u; ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 20 * k); ctx.fillStyle = 'rgba(9,16,38,.94)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = k; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const mw = cw - 40 * k;
  fit(ctx, e.name || '', 26 * k, 16 * k, mw, F.black); ctx.fillStyle = '#fff'; ctx.fillText(e.name || '', W / 2, y + 36 * k);
  fit(ctx, e.tagline || '', 13 * k, 10 * k, mw); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(e.tagline || '', W / 2, y + 66 * k);
  ctx.beginPath(); ctx.roundRect(x + 28 * k, y + 90 * k, cw - 56 * k, 48 * k, 24 * k); ctx.fillStyle = mg(ctx, 'gold', y + 90 * k, y + 138 * k); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.stroke();
  fit(ctx, e.cta || '', 16 * k, 11 * k, cw - 80 * k, F.black); ctx.fillStyle = STY.gold.txt; ctx.fillText(e.cta || '', W / 2, y + 115 * k);
  fit(ctx, e.note || '', 10 * k, 8 * k, mw); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillText(e.note || '', W / 2, y + 158 * k); ctx.restore();
  if (u >= 1) rect(s, 'card', x, y, x + cw, y + ch);
}
function bdsFooter(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k; ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (e.text) { fit(ctx, e.text, 13 * k, 9 * k, s.width - 2 * L.M); ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillText(e.text, s.width / 2, s.height - 59 * k); }
  if (e.credit) { fit(ctx, e.credit, 9 * k, 7 * k, s.width - 2 * L.M); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillText(e.credit, s.width / 2, s.height - 41 * k); }
  ctx.restore();
}

// ---------- giới thiệu BĐS ----------

// ---------- "cảnh quay" từ ảnh tĩnh ----------
// move: {push, pan, tilt, vp:[x,y], shake}. Không có bản đồ chiều sâu thật: coi điểm tụ vp (cửa, cuối phòng) là xa nhất,
// càng ra mép càng gần. Máy tiến (push) thì vật gần phóng to nhanh hơn vật xa; lia (pan/tilt) thì vật gần trôi nhiều hơn.
// Ánh xạ ngược từng điểm ảnh, không gập ảnh khi push ≤ 0,35. Ảnh nguồn cắt sẵn rộng hơn khung để lia không lộ mép.
function cameraShot(e, A, W, H, u, tl, s) {
  const m = e.move, push = m.push ?? 0.18, pan = m.pan ?? 0, tilt = m.tilt ?? 0, vp = m.vp || e.focus || [0.5, 0.45];
  const key = [e.path, push, pan, tilt, vp, e.focus].join('|'); s._camCache ||= new Map(); if (!e._cam && s._camCache.has(key)) e._cam = s._camCache.get(key);
  if (!e._cam) {
    const im = A.im, need = 1 + Math.abs(pan) + 0.06, needV = 1 + Math.abs(tilt) + 0.06;
    const sc = Math.max(W * need / im.width, H * needV / im.height), sw = Math.round(Math.min(im.width * sc, W * Math.max(need, needV) * 2.2)), sh = Math.round(Math.min(im.height * sc, H * Math.max(need, needV) * 2.2));
    const c = createCanvas(sw, sh), x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    const f = e.focus || [0.5, 0.5], dw = im.width * sc, dh = im.height * sc; x.drawImage(im, (sw - dw) * f[0], (sh - dh) * f[1], dw, dh);
    const near = new Float32Array(W * H), vx = vp[0] * W, vy = vp[1] * H, R = Math.hypot(Math.max(vx, W - vx), Math.max(vy, H - vy));
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) near[y * W + xx] = Math.pow(Math.min(1, Math.hypot(xx - vx, (y - vy) * 0.8) / R), 1.15);
    e._cam = {src: x.getImageData(0, 0, sw, sh).data, sw, sh, near, out: createCanvas(W, H)}; s._camCache.set(key, e._cam);
  }
  const C = e._cam, ctx = C.out.getContext('2d'), img = ctx.createImageData(W, H), o = img.data, S = C.src, sw = C.sw, sh = C.sh;
  const q = m.ease === 'linear' ? Math.min(u, 1.3) : ease(clamp(u)), dz = m.dive ? 1 + (m.dive - 1) * (1 - ease(clamp(tl / (m.diveDur ?? 1.2)))) : 1, a = push * q, base = Math.min(sw / (W * (1 + Math.abs(pan) + 0.06)), sh / (H * (1 + Math.abs(tilt) + 0.06))), vx = vp[0] * W, vy = vp[1] * H;
  const shk = m.shake ?? 1, jx = shk * (Math.sin(tl * 1.7) * 2.2 + Math.sin(tl * 3.1 + 1) * 1.1), jy = shk * (Math.sin(tl * 1.3 + 2) * 1.8 + Math.sin(tl * 2.7) * 0.9);
  const px = pan * (q - 0.5) * W, py = tilt * (q - 0.5) * H, cx = sw / 2, cy = sh / 2;
  for (let y = 0, q4 = 0; y < H; y++) for (let x = 0; x < W; x++, q4 += 4) {
    const n = C.near[y * W + x], z = (1 + a * (0.3 + 0.7 * n)) * dz, par = 0.35 + 0.65 * n;
    const dx = vx + (x - vx) / z - px * par + jx, dy = vy + (y - vy) / z - py * par + jy;
    let fx = cx + (dx - W / 2) * base, fy = cy + (dy - H / 2) * base;
    fx = fx < 0 ? 0 : fx > sw - 1.001 ? sw - 1.001 : fx; fy = fy < 0 ? 0 : fy > sh - 1.001 ? sh - 1.001 : fy;
    const x0 = fx | 0, y0 = fy | 0, wx = fx - x0, wy = fy - y0, p00 = (y0 * sw + x0) * 4, p10 = p00 + sw * 4;
    const a00 = (1 - wx) * (1 - wy), a01 = wx * (1 - wy), a10 = (1 - wx) * wy, a11 = wx * wy;
    o[q4] = S[p00] * a00 + S[p00 + 4] * a01 + S[p10] * a10 + S[p10 + 4] * a11;
    o[q4 + 1] = S[p00 + 1] * a00 + S[p00 + 5] * a01 + S[p10 + 1] * a10 + S[p10 + 5] * a11;
    o[q4 + 2] = S[p00 + 2] * a00 + S[p00 + 6] * a01 + S[p10 + 2] * a10 + S[p10 + 6] * a11;
    o[q4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0); return C.out;
}
// bdsPhoto: mode "cover" (phủ kín khung, cắt theo focus) hoặc "card" (cả ảnh trong khung bo góc viền vàng, nền là bản mờ của chính ảnh).
// Ken Burns: zoom [đầu, cuối], focus → focusTo (0..1).
function bdsPhoto(ctx, e, t, s) {
  const A = s._bdsImg?.get(e.path); if (!A) return; const {im, blur} = A, W = s.width, H = s.height, k = K(s), dur = e.to ?? e._shotDur ?? 4, u = clamp(local(e, t) / Math.max(0.1, dur));
  const z = (e.zoom?.[0] ?? 1) + ((e.zoom?.[1] ?? 1.1) - (e.zoom?.[0] ?? 1)) * u, f0 = e.focus || [0.5, 0.5], f1 = e.focusTo || f0, fx = f0[0] + (f1[0] - f0[0]) * u, fy = f0[1] + (f1[1] - f0[1]) * u;
  const a = (e.enterDur === 0 ? 1 : clamp(local(e, t) / (e.enterDur ?? 0.35))) * (e.alpha ?? 1) * (e.fadeOut && e.to !== undefined ? 1 - ease(clamp((t - (e.to - e.fadeOut)) / e.fadeOut)) : 1);
  ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingQuality = 'high';
  const cover = (img, bx, by, bw, bh, zz) => { const sc = Math.max(bw / img.width, bh / img.height) * zz, w = img.width * sc, h = img.height * sc; ctx.drawImage(img, bx + (bw - w) * fx, by + (bh - h) * fy, w, h); };
  const mode = e.mode || (im.width > im.height * 1.05 ? 'card' : 'cover');
  if (mode === 'cover' && e.move) ctx.drawImage(cameraShot(e, A, W, H, local(e, t) / Math.max(0.1, e.dur ?? dur), local(e, t), s), 0, 0);
  else if (mode === 'cover') cover(im, 0, 0, W, H, z);
  else {
    cover(blur, 0, 0, W, H, 1.15); ctx.fillStyle = 'rgba(5,9,20,.45)'; ctx.fillRect(0, 0, W, H);
    const bw = W - 2 * 30 * k * 0.6, top = 330, bh = Math.min(H * 0.62, e.bottom ? e.bottom - top : Infinity, bw * (e.ratio ?? im.height / im.width)), bx = (W - bw) / 2, by = e.bottom && e.y == null ? Math.max(top, (top + e.bottom) / 2 - bh / 2) : (e.y ?? H * 0.47) - bh / 2;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 22); ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 22); ctx.clip(); cover(im, bx, by, bw, bh, z); ctx.restore();
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 22); ctx.strokeStyle = mg(ctx, 'gold', by, by + bh); ctx.lineWidth = 4; ctx.stroke();
  }
  if (e.overlay === false) { ctx.restore(); return; }
  if (e.dim !== 0) { ctx.fillStyle = `rgba(0,0,0,${e.dim ?? 0.12})`; ctx.fillRect(0, 0, W, H); }
  let g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, 'rgba(3,6,16,.75)'); g.addColorStop(1, 'rgba(3,6,16,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
  g = ctx.createLinearGradient(0, H * 0.55, 0, H); g.addColorStop(0, 'rgba(3,6,16,0)'); g.addColorStop(1, 'rgba(3,6,16,.88)'); ctx.fillStyle = g; ctx.fillRect(0, H * 0.55, W, H * 0.45);
  ctx.restore();
  if (e.illustration) { const L = LAYOUT(s); ctx.save(); ctx.globalAlpha = a * 0.8; font(ctx, 9 * k); ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(e.illustration === true ? 'Ảnh minh họa' : e.illustration, W - L.M, 112 * k); ctx.restore(); }
}
// bdsCaption: nhãn kim loại nhỏ (kicker) + tiêu đề lớn + dòng phụ, căn trái, neo đáy ở y (mặc định trên chân trang)
function bdsCaption(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k, q = ease(clamp(local(e, t) / 0.5)), a = q * (e.to !== undefined ? clamp((e.to - t) / 0.3) : 1); if (a <= 0) return;
  const x = L.M, maxW = s.width - 2 * L.M, n = e.sty || 'gold'; let y = (e.y ?? L.CARD_B - 10 * k) + (1 - q) * 30 * k;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const rows = [];
  if (e.sub) { const fs = fit(ctx, e.sub, 15 * k, 10 * k, maxW); rows.push(['sub', e.sub, fs]); }
  if (e.title) { const fs = fit(ctx, e.title.toUpperCase(), 34 * k, 18 * k, maxW, F.black); rows.push(['title', e.title.toUpperCase(), fs]); }
  if (e.kicker) rows.push(['kicker', e.kicker.toUpperCase(), 12 * k]);
  let x1 = x;
  for (const [kind, txt, fs] of rows) { // từ dưới lên
    if (kind === 'sub') { font(ctx, fs); ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 10; ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillText(txt, x, y); x1 = Math.max(x1, x + ctx.measureText(txt).width); y -= fs * 1.55; }
    else if (kind === 'title') { font(ctx, fs, F.black); ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 16; ctx.fillStyle = '#fff'; ctx.fillText(txt, x, y); x1 = Math.max(x1, x + ctx.measureText(txt).width); y -= fs * 1.12; }
    else { ctx.shadowBlur = 0; font(ctx, fs); const w = ctx.measureText(txt).width + 26 * k, h = 26 * k, by = y - h + 4 * k; ctx.beginPath(); ctx.roundRect(x, by, w, h, h / 2); ctx.fillStyle = mg(ctx, n, by, by + h); ctx.fill(); ctx.fillStyle = sty(n).txt; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + 13 * k, by + h / 2 + 1); ctx.textBaseline = 'alphabetic'; y = by - 12 * k; x1 = Math.max(x1, x + w); }
  }
  ctx.restore(); if (q >= 1) rect(s, 'text', x, y, x1, (e.y ?? L.CARD_B - 10 * k) + 6 * k);
}
// bdsSpecs: thẻ kính các dòng thông số {icon, label, value}, hiện lần lượt
function bdsSpecs(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k, items = e.items || [], rowH = 44 * k, head = e.title ? 40 * k : 12 * k, ch = head + items.length * rowH + 12 * k, x = L.M, cw = s.width - 2 * L.M;
  const yb = e.y ?? L.CARD_B, y = yb - ch, q = ease(clamp(local(e, t) / 0.5)), a = q * (e.to !== undefined ? clamp((e.to - t) / 0.3) : 1); if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - q) * 40 * k);
  ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 18 * k); ctx.fillStyle = 'rgba(9,16,38,.9)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = k; ctx.stroke();
  ctx.textBaseline = 'middle';
  if (e.title) { fit(ctx, e.title.toUpperCase(), 14 * k, 10 * k, cw - 40 * k, F.black); ctx.fillStyle = STY.gold.flat; ctx.textAlign = 'left'; ctx.fillText(e.title.toUpperCase(), x + 20 * k, y + 24 * k); }
  items.forEach((it, i) => {
    const r = clamp((local(e, t) - 0.3 - i * (e.stagger ?? 0.25)) / 0.35); if (r <= 0) return; const ry = y + head + i * rowH + rowH / 2, n = it.sty || e.sty || 'gold';
    ctx.save(); ctx.globalAlpha = a * r; ctx.translate((1 - ease(r)) * 30 * k, 0);
    if (i) { ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x + 20 * k, ry - rowH / 2, cw - 40 * k, k * 0.6); }
    const icx = x + 38 * k; ctx.beginPath(); ctx.arc(icx, ry, 15 * k, 0, Math.PI * 2); ctx.strokeStyle = mg(ctx, n, ry - 15 * k, ry + 15 * k); ctx.lineWidth = 2 * k; ctx.stroke();
    ctx.save(); ctx.translate(icx, ry); ctx.scale(0.62 * k, 0.62 * k); const g = mg(ctx, n, -15, 15); ctx.fillStyle = g; ctx.strokeStyle = g; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; (SPEC[it.icon] || SPEC.pin)(ctx); ctx.restore();
    font(ctx, 13 * k); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.textAlign = 'left'; ctx.fillText(it.label || '', x + 64 * k, ry);
    fit(ctx, String(it.value ?? ''), 17 * k, 11 * k, cw * 0.55, F.black); ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.fillText(String(it.value ?? ''), x + cw - 20 * k, ry + k);
    ctx.restore();
  });
  ctx.restore(); if (q >= 1) rect(s, 'card', x, y, x + cw, y + ch);
}
// bdsChips: các chip tiện ích tự xuống dòng, hiện lần lượt
function bdsChips(ctx, e, t, s) {
  const L = LAYOUT(s), k = L.k, items = e.items || [], maxX = s.width - L.M, n = e.sty || 'gold', h = 34 * k, gap = 8 * k; font(ctx, 14 * k);
  const pos = []; let x = L.M, row = 0; for (const it of items) { const w = ctx.measureText(it).width + 30 * k; if (x + w > maxX && x > L.M) { row++; x = L.M; } pos.push([x, row, w]); x += w + gap; }
  const rows = row + 1, y0 = (e.y ?? L.CARD_B) - rows * h - row * gap;
  ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  items.forEach((it, i) => { const r = clamp((local(e, t) - i * (e.stagger ?? 0.12)) / 0.3); if (r <= 0) return; const [cx, rw, w] = pos[i], cy = y0 + rw * (h + gap), sc = backOut(r);
    ctx.save(); ctx.globalAlpha = clamp(r * 2) * (e.to !== undefined ? clamp((e.to - t) / 0.3) : 1); ctx.translate(cx + w / 2, cy + h / 2); ctx.scale(sc, sc); ctx.translate(-(cx + w / 2), -(cy + h / 2));
    ctx.beginPath(); ctx.roundRect(cx, cy, w, h, h / 2); ctx.fillStyle = 'rgba(9,16,38,.85)'; ctx.fill(); ctx.strokeStyle = mg(ctx, n, cy, cy + h); ctx.lineWidth = 1.8 * k; ctx.stroke();
    font(ctx, 14 * k); ctx.fillStyle = '#fff'; ctx.fillText(it, cx + 15 * k, cy + h / 2 + k); ctx.restore(); });
  ctx.restore(); rect(s, 'text', L.M, y0, maxX, y0 + rows * h + row * gap);
}


// bdsClip: cảnh quay dựng sẵn bằng studio/tools/camwalk.py (thư mục khung f0000.jpg…, clip.json). Đọc đúng khung theo thời gian.
// dive/diveDur: phóng đều rồi thu về (lao vào từ bản đồ). enterDur, fadeOut, overlay như bdsPhoto.
function bdsClip(ctx, e, t, s) {
  const dir = path.join(s.base, e.dir); e._meta ||= JSON.parse(fs.readFileSync(path.join(dir, 'clip.json'), 'utf8'));
  const W = s.width, H = s.height, tl = local(e, t), n = Math.max(0, Math.min(e._meta.frames - 1, Math.floor(tl * (e._meta.fps || 30) + 1e-6)));
  const im = s._clipFrames?.get(path.join(dir, `f${String(n).padStart(4, '0')}.jpg`)); if (!im) throw new Error(`bdsClip: khung chưa nạp (gọi renderer.prepare(T) trước frame): ${e.dir} #${n}`);
  const a = (e.enterDur === 0 ? 1 : clamp(tl / (e.enterDur ?? 0.35))) * (e.alpha ?? 1) * (e.fadeOut && e.to !== undefined ? 1 - ease(clamp((t - (e.to - e.fadeOut)) / e.fadeOut)) : 1);
  const dz = e.dive ? 1 + (e.dive - 1) * (1 - ease(clamp(tl / (e.diveDur ?? 1.2)))) : 1;
  ctx.save(); ctx.globalAlpha = a; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, W / 2 - W * dz / 2, H / 2 - H * dz / 2, W * dz, H * dz);
  if (e.overlay !== false) {
    if (e.dim !== 0) { ctx.fillStyle = `rgba(0,0,0,${e.dim ?? 0.08})`; ctx.fillRect(0, 0, W, H); }
    let g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, 'rgba(3,6,16,.6)'); g.addColorStop(1, 'rgba(3,6,16,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420);
    g = ctx.createLinearGradient(0, H * 0.7, 0, H); g.addColorStop(0, 'rgba(3,6,16,0)'); g.addColorStop(1, 'rgba(3,6,16,.6)'); ctx.fillStyle = g; ctx.fillRect(0, H * 0.7, W, H * 0.3);
  }
  ctx.restore();
}

export const BDS_PAINT = {bdsClip, bdsShade, bdsRoute, bdsPin, bdsCard, bdsBar, bdsHeadline, bdsOutro, bdsFooter, bdsPhoto, bdsCaption, bdsSpecs, bdsChips};

// nạp trước các khung bdsClip cần cho thời điểm T (giải mã ảnh là bất đồng bộ)
export async function prepareBds(s, T) {
  const sh = s.shots.find(x => T >= x.start && T < x.end) || s.shots.at(-1), t = T - sh.start, want = new Set();
  for (const e of sh.elements || []) {
    if (e.type !== 'bdsClip' || t < (e.from ?? 0) || (e.to !== undefined && t >= e.to)) continue;
    const dir = path.join(s.base, e.dir); e._meta ||= JSON.parse(fs.readFileSync(path.join(dir, 'clip.json'), 'utf8'));
    const n = Math.max(0, Math.min(e._meta.frames - 1, Math.floor((t - (e.from ?? 0)) * (e._meta.fps || 30) + 1e-6)));
    want.add(path.join(dir, `f${String(n).padStart(4, '0')}.jpg`));
  }
  s._clipFrames ||= new Map();
  for (const k of [...s._clipFrames.keys()]) if (!want.has(k)) s._clipFrames.delete(k);
  for (const f of want) if (!s._clipFrames.has(f)) s._clipFrames.set(f, await loadImage(f));
}
