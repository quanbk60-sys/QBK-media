// Phong cách "bds-tien-ich" (bất động sản): bản đồ vị trí và tiện ích trên nền ảnh vệ tinh, học từ mẫu người dùng gửi 10/11/2026
// (studio/references/bds-ban-do-tien-ich, bds-ban-do-ha-tang, skill map-location-video).
// Bổ sung phần tử cho geo.mjs: poi (ghim kim loại có icon), project (ghim dự án + vòng radar + hộp tên), rings (vòng bán kính km),
// block (khối 3D lô đất), pcard (thẻ ảnh + đường dẫn), info (thẻ km/phút), checklist, legend, chapter (tiêu đề chương), cta.
// Camera nghiêng 3D: shot có "tilt" (scene.mjs dựng lớp mặt đất rồi chiếu phối cảnh). Định dạng: SCENE_FORMAT.md, mục "Phong cách BĐS".
import fs from 'node:fs';
import path from 'node:path';
import {loadImage} from '@napi-rs/canvas';
import {clamp, ease, backOut} from './math.mjs';
import {GEO_TYPES, PAINT, F, WHITE, DARK, col, local, grow, fadeA, pos, rr, fitFont, project, mpp, merc, worldPx} from './geo.mjs';

export const BDS_TYPES = ['overlay', 'poi', 'project', 'rings', 'block', 'pcard', 'info', 'checklist', 'legend', 'chapter', 'cta'];
// phần tử nằm trên mặt đất: khi shot nghiêng, vẽ vào lớp mặt đất rồi chiếu phối cảnh cùng ảnh vệ tinh
export const GROUND_TYPES = new Set(['satmap', 'overlay', 'route', 'area', 'dots', 'rings']);

// kim loại: [sáng, giữa, tối]
export const METAL = {
  gold: ['#FFF1B8', '#F6C33B', '#A86A08'], blue: ['#BDF0FF', '#2E9BF0', '#0E4F94'], ruby: ['#FFC2C9', '#E5364B', '#7E0F20'],
  green: ['#C6F7CF', '#2FBF5A', '#0F6A2C'], purple: ['#EBD1FF', '#A05CF0', '#4F2192'], teal: ['#C2FFF6', '#19C3B1', '#086E66'],
  orange: ['#FFD9B0', '#FF8A1F', '#A04A00'], silver: ['#FFFFFF', '#C9D1DA', '#6B7682'],
};
const metal = c => METAL[c] || METAL.gold;
const SAFE = 40; // lề an toàn trái phải (khung 1080)

// ---------- icon trắng/đen trong ô ~32×32, tâm (0,0) ----------
export const POI_ICONS = {
  home: c => { c.beginPath(); c.moveTo(-14, -1); c.lineTo(0, -14); c.lineTo(14, -1); c.lineTo(10, -1); c.lineTo(10, 13); c.lineTo(3, 13); c.lineTo(3, 5); c.lineTo(-3, 5); c.lineTo(-3, 13); c.lineTo(-10, 13); c.lineTo(-10, -1); c.closePath(); c.fill(); },
  school: c => { c.beginPath(); c.moveTo(-16, -4); c.lineTo(0, -12); c.lineTo(16, -4); c.lineTo(0, 4); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-9, 0); c.lineTo(-9, 8); c.quadraticCurveTo(0, 14, 9, 8); c.lineTo(9, 0); c.lineTo(0, 5); c.closePath(); c.fill(); c.fillRect(13, -4, 2.5, 12); },
  cart: c => { c.beginPath(); c.moveTo(-16, -11); c.lineTo(-11, -11); c.lineTo(-7, 5); c.lineTo(11, 5); c.lineTo(15, -6); c.lineTo(-9, -6); c.stroke(); c.beginPath(); c.arc(-5, 11, 3, 0, 7); c.arc(9, 11, 3, 0, 7); c.fill(); },
  hospital: c => { c.fillRect(-4.5, -14, 9, 28); c.fillRect(-14, -4.5, 28, 9); },
  food: c => { c.beginPath(); c.moveTo(-8, -14); c.lineTo(-8, 14); c.moveTo(-13, -14); c.lineTo(-13, -4); c.quadraticCurveTo(-8, 2, -3, -4); c.lineTo(-3, -14); c.moveTo(9, 14); c.lineTo(9, -14); c.quadraticCurveTo(15, -8, 13, 2); c.lineTo(9, 2); c.stroke(); },
  plane: c => { c.beginPath(); c.moveTo(0, -16); c.quadraticCurveTo(3, -14, 3, -8); c.lineTo(3, -3); c.lineTo(16, 4); c.lineTo(16, 7); c.lineTo(3, 3); c.lineTo(2, 10); c.lineTo(6, 13); c.lineTo(6, 15); c.lineTo(0, 13); c.lineTo(-6, 15); c.lineTo(-6, 13); c.lineTo(-2, 10); c.lineTo(-3, 3); c.lineTo(-16, 7); c.lineTo(-16, 4); c.lineTo(-3, -3); c.lineTo(-3, -8); c.quadraticCurveTo(-3, -14, 0, -16); c.fill(); },
  train: c => { c.beginPath(); c.roundRect(-11, -15, 22, 23, 5); c.fill(); c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(-7, -11, 14, 7); c.beginPath(); c.arc(-5.5, 2.5, 2.2, 0, 7); c.arc(5.5, 2.5, 2.2, 0, 7); c.fill(); c.restore(); c.beginPath(); c.moveTo(-8, 9); c.lineTo(-13, 16); c.moveTo(8, 9); c.lineTo(13, 16); c.stroke(); },
  bus: c => { c.beginPath(); c.roundRect(-13, -14, 26, 24, 4); c.fill(); c.save(); c.globalCompositeOperation = 'destination-out'; c.fillRect(-10, -10, 20, 9); c.restore(); c.beginPath(); c.arc(-7, 12, 3, 0, 7); c.arc(7, 12, 3, 0, 7); c.fill(); },
  park: c => { c.beginPath(); c.arc(0, -6, 10, 0, 7); c.arc(-7, 0, 7, 0, 7); c.arc(7, 0, 7, 0, 7); c.fill(); c.fillRect(-2, 3, 4, 13); },
  mall: c => { c.beginPath(); c.moveTo(-12, -6); c.lineTo(12, -6); c.lineTo(14, 15); c.lineTo(-14, 15); c.closePath(); c.fill(); c.beginPath(); c.arc(0, -6, 6, Math.PI, 0); c.stroke(); },
  bank: c => { c.beginPath(); c.moveTo(-15, -6); c.lineTo(0, -15); c.lineTo(15, -6); c.closePath(); c.fill(); for (const x of [-10, -3.5, 3.5, 10]) c.fillRect(x - 1.8, -4, 3.6, 13); c.fillRect(-15, 10, 30, 4); },
  building: c => { c.fillRect(-11, -15, 14, 30); c.fillRect(5, -5, 8, 20); c.save(); c.globalCompositeOperation = 'destination-out'; for (let y = -11; y < 10; y += 6) for (const x of [-8, -2]) c.fillRect(x, y, 3, 3); c.restore(); },
  coffee: c => { c.beginPath(); c.moveTo(-12, -6); c.lineTo(8, -6); c.lineTo(6, 12); c.lineTo(-10, 12); c.closePath(); c.fill(); c.beginPath(); c.arc(9, 2, 5, -1.3, 1.3); c.stroke(); },
  bridge: c => { c.beginPath(); c.moveTo(-16, 4); c.lineTo(16, 4); c.moveTo(-16, 4); c.quadraticCurveTo(0, -18, 16, 4); for (const x of [-9, 0, 9]) { c.moveTo(x, 4); c.lineTo(x, x === 0 ? -7 : -3); } c.moveTo(-12, 4); c.lineTo(-12, 13); c.moveTo(12, 4); c.lineTo(12, 13); c.stroke(); },
  road: c => { c.beginPath(); c.moveTo(-6, -15); c.lineTo(-13, 15); c.moveTo(6, -15); c.lineTo(13, 15); c.stroke(); c.setLineDash([5, 5]); c.beginPath(); c.moveTo(0, -15); c.lineTo(0, 15); c.stroke(); c.setLineDash([]); },
  water: c => { for (const dy of [-7, 2, 11]) { c.beginPath(); c.moveTo(-15, dy); for (let i = 0; i <= 3; i++) c.quadraticCurveTo(-15 + i * 8 + 4, dy + (i % 2 ? 5 : -5), -15 + (i + 1) * 8, dy); c.stroke(); } },
  stadium: c => { c.beginPath(); c.ellipse(0, 0, 15, 10, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(0, 0, 8, 4.5, 0, 0, 7); c.fill(); },
  star: c => { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6.5 : 15, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); },
  gov: c => { c.beginPath(); c.moveTo(-14, -4); c.lineTo(0, -13); c.lineTo(14, -4); c.closePath(); c.fill(); c.fillRect(-12, -2, 24, 3); for (const x of [-8, 0, 8]) c.fillRect(x - 2, 2, 4, 9); c.fillRect(-14, 12, 28, 3); },
};
export function drawIcon(ctx, name, color, scale = 1) {
  ctx.save(); ctx.scale(scale, scale); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  (POI_ICONS[name] || POI_ICONS.star)(ctx); ctx.restore();
}

// ghim giọt nước kim loại; đầu nhọn tại (0,0). Trả về tâm đầu ghim (y âm).
function metalPin(ctx, size, color, icon) {
  const [hi, mid, lo] = metal(color), r = 26 * size, hy = -r * 1.95;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 16 * size; ctx.shadowOffsetY = 6 * size;
  const g = ctx.createLinearGradient(-r, hy - r, r, hy + r); g.addColorStop(0, hi); g.addColorStop(0.38, mid); g.addColorStop(0.62, lo); g.addColorStop(0.8, mid); g.addColorStop(1, hi);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-r * 0.35, -r * 0.8, -r, -r * 1.2, -r, hy); ctx.arc(0, hy, r, Math.PI, 0); ctx.bezierCurveTo(r, -r * 1.2, r * 0.35, -r * 0.8, 0, 0); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.lineWidth = 2 * size; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
  // mặt đĩa trắng + icon tối
  const gi = ctx.createRadialGradient(-r * 0.2, hy - r * 0.25, r * 0.1, 0, hy, r * 0.74); gi.addColorStop(0, '#FFFFFF'); gi.addColorStop(1, '#E9EDF2');
  ctx.fillStyle = gi; ctx.beginPath(); ctx.arc(0, hy, r * 0.72, 0, 7); ctx.fill(); ctx.strokeStyle = lo; ctx.lineWidth = 2.5 * size; ctx.stroke();
  // vệt bóng loáng
  ctx.globalAlpha *= 0.55; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(-r * 0.5, hy - r * 0.62, r * 0.28, r * 0.12, -0.6, 0, 7); ctx.fill(); ctx.globalAlpha /= 0.55;
  ctx.translate(0, hy); drawIcon(ctx, icon, lo, size * 0.82 * (r / 26 / size));
  ctx.restore(); return hy;
}
// chữ nhãn kiểu video BĐS: chữ màu viền tối, có dòng phụ trắng nhỏ
function glowLabel(ctx, x, y, text, sub, o = {}) {
  const size = o.size ?? 36, ss = Math.max(22, Math.round(size * 0.66)), maxW = 1080 - 2 * SAFE; ctx.save(); ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const T = text.toUpperCase(); const sz = fitFont(ctx, T, F.black, size, maxW); const tw = ctx.measureText(T).width;
  ctx.font = `${ss}px ${F.bold}`; const sw = sub ? ctx.measureText(sub).width : 0, W = Math.max(tw, sw);
  let align = o.align || 'center', ax = x; // tự né mép
  if (align === 'center' && x + W / 2 > 1080 - SAFE) align = 'right'; if (align === 'center' && x - W / 2 < SAFE) align = 'left';
  if (align === 'right') ax = Math.max(SAFE + W, x); if (align === 'left') ax = Math.min(1080 - SAFE - W, x);
  ctx.textAlign = align; const ly = sub ? y - ss * 1.1 : y;
  ctx.font = `${sz}px ${F.black}`; ctx.lineWidth = Math.max(6, sz * 0.22); ctx.strokeStyle = 'rgba(10,12,16,.85)'; ctx.strokeText(T, ax, ly);
  ctx.shadowColor = o.glow || 'rgba(0,0,0,.4)'; ctx.shadowBlur = 12; ctx.fillStyle = o.color || '#FFD54A'; ctx.fillText(T, ax, ly); ctx.shadowBlur = 0;
  if (sub) { ctx.font = `${ss}px ${F.bold}`; ctx.lineWidth = 6; ctx.strokeText(sub, ax, y + 6); ctx.fillStyle = '#FFFFFF'; ctx.fillText(sub, ax, y + 6); }
  ctx.restore();
}

// ---------- painters ----------
function poi(ctx, e, t, s, v) {
  const [x, y] = pos(e, t, s, v), k = e.instant ? 9 + local(e, t) : local(e, t), a = fadeA({...e, enter: 'none'}, t), drop = clamp(k / 0.5), size = (e.size ?? 1) * (s._tilt ? clamp(project(v, s, e.geo?.[0] ?? 0, e.geo?.[1] ?? 0)[2] ?? 1, 0.75, 1.25) : 1);
  if (k < 0) return; const [hi, mid] = metal(e.color);
  ctx.save(); ctx.globalAlpha = a * clamp(drop * 3);
  // bóng + sóng lan trên mặt đất
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y, 16 * size * (0.4 + 0.6 * drop), 6 * size * (0.4 + 0.6 * drop), 0, 0, 7); ctx.fill();
  if (e.pulse !== false) for (const off of [0, 0.5]) { const ph = ((k * 0.8) + off) % 1; ctx.globalAlpha = a * (1 - ph) * 0.7; ctx.strokeStyle = mid; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y, (14 + 60 * ph) * size, (14 + 60 * ph) * size * 0.4, 0, 0, 7); ctx.stroke(); }
  ctx.globalAlpha = a * clamp(drop * 3);
  const dy = -(1 - backOut(drop)) * 120; ctx.translate(x, y + dy); const hy = metalPin(ctx, size, e.color, e.icon || 'star'); ctx.translate(-x, -(y + dy));
  if (e.label) { const q = clamp((k - 0.3) / 0.3); ctx.globalAlpha = a * q; const side = e.side ?? 0, top = y + dy + hy;
    if (side === 'below') glowLabel(ctx, x, y + 46 + (e.labelDy ?? 0) + (e.sub ? 30 : 0), e.label, e.sub, {size: e.labelSize, color: e.labelColor ? col(e.labelColor) : hi === '#FFF1B8' ? '#FFD54A' : hi});
    else if (side === 0) glowLabel(ctx, x, top - 34 * size - (e.labelDy ?? 0), e.label, e.sub, {size: e.labelSize, color: e.labelColor ? col(e.labelColor) : hi === '#FFF1B8' ? '#FFD54A' : hi});
    else glowLabel(ctx, x + side * 36 * size, top + 12, e.label, e.sub, {size: e.labelSize, align: side > 0 ? 'left' : 'right', color: e.labelColor ? col(e.labelColor) : hi === '#FFF1B8' ? '#FFD54A' : hi}); }
  ctx.restore();
}
function projectPin(ctx, e, t, s, v) {
  const [x, y] = pos(e, t, s, v), k = local(e, t), a = fadeA({...e, enter: 'none'}, t), sz = e.size ?? 1.25, [, mid, lo] = metal(e.color || 'gold');
  ctx.save(); ctx.globalAlpha = a;
  for (const off of [0, 0.33, 0.66]) { const ph = ((k * 0.5) + off) % 1; ctx.globalAlpha = a * (1 - ph) * 0.85; ctx.strokeStyle = mid; ctx.lineWidth = 4; ctx.shadowColor = mid; ctx.shadowBlur = 12; ctx.beginPath(); ctx.ellipse(x, y, 30 + 150 * ph, (30 + 150 * ph) * (s._tilt ? 0.42 : 1), 0, 0, 7); ctx.stroke(); }
  ctx.shadowBlur = 0; ctx.globalAlpha = a * clamp(k / 0.25);
  const drop = clamp(k / 0.55), dy = -(1 - backOut(drop)) * 160; ctx.translate(x, y + dy); const hy = metalPin(ctx, sz, e.color || 'gold', e.icon || 'home'); ctx.translate(-x, -(y + dy));
  if (e.label) { // hộp tên dự án: trắng, chữ xanh than, viền kim loại
    const q = backOut(clamp((k - 0.35) / 0.35)); if (q > 0) {
      const T = e.label, size = e.labelSize ?? 40; ctx.font = `${size}px ${F.black}`; const tw = ctx.measureText(T).width; ctx.font = `${Math.round(size * 0.48)}px ${F.bold}`; const sw = e.sub ? ctx.measureText(e.sub.toUpperCase()).width : 0;
      const w = Math.max(tw, sw) + size * 1.1, h = size * (e.sub ? 2.05 : 1.5), bx = clamp(x - w / 2, SAFE, 1080 - SAFE - w), by = y + dy + hy - 26 * sz * 1.35 - h - 12;
      ctx.save(); ctx.translate(x, by + h); ctx.scale(q, q); ctx.translate(-x, -(by + h)); ctx.globalAlpha = a * clamp(q);
      ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18; ctx.fillStyle = '#FFFFFF'; rr(ctx, bx, by, w, h, 14); ctx.fill(); ctx.shadowBlur = 0;
      const g = ctx.createLinearGradient(bx, by, bx + w, by + h); const [h1, m1, l1] = metal(e.color || 'gold'); g.addColorStop(0, h1); g.addColorStop(0.5, m1); g.addColorStop(1, l1); ctx.strokeStyle = g; ctx.lineWidth = 4; rr(ctx, bx, by, w, h, 14); ctx.stroke();
      ctx.fillStyle = '#16233F'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${size}px ${F.black}`; ctx.fillText(T, bx + w / 2, by + (e.sub ? h * 0.38 : h / 2 + 2));
      if (e.sub) { ctx.font = `${Math.round(size * 0.48)}px ${F.bold}`; ctx.fillStyle = lo; ctx.fillText(e.sub.toUpperCase(), bx + w / 2, by + h * 0.76); }
      ctx.restore(); } }
  ctx.restore();
}
function rings(ctx, e, t, s, v) {
  if (!v || !e.geo) return; const [x, y] = project(v, s, e.geo[0], e.geo[1]), k = local(e, t), a = fadeA(e, t), m = mpp(e.geo[0], v.zoom), c = col(e.color || 'white');
  ctx.save(); (e.km || [1, 3, 5]).forEach((km, i) => {
    const q = ease(clamp((k - i * (e.stagger ?? 0.25)) / 0.8)); if (q <= 0) return; const R = km * 1000 / m * q;
    ctx.globalAlpha = a * 0.9; ctx.strokeStyle = c; ctx.lineWidth = e.width ?? 3; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = a * 0.08; ctx.fillStyle = c; ctx.fill();
    const an = e.labelAngle ?? -0.55, lx = x + Math.cos(an) * R, ly = y + Math.sin(an) * R; ctx.globalAlpha = a * q;
    ctx.font = `${e.labelSize ?? 30}px ${F.black}`; const lab = `${String(km).replace('.', ',')} km`, tw = ctx.measureText(lab).width;
    ctx.fillStyle = 'rgba(10,14,20,.75)'; rr(ctx, lx - tw / 2 - 12, ly - 22, tw + 24, 44, 22); ctx.fill(); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab, lx, ly + 1);
  }); ctx.restore();
}
// khối 3D lô đất/tòa nhà: path [[lat,lon],…] hoặc geo + size [rộng m, sâu m] (+ rot độ); height px; grow {at,dur}
function block(ctx, e, t, s, v) {
  if (!v) return; const k = local(e, t), a = fadeA(e, t);
  let base;
  if (e.path) base = e.path.map(p => project(v, s, p[0], p[1]));
  else { const [w, d] = e.size || [20, 10], rot = (e.rot ?? 0) * Math.PI / 180, m = merc(e.geo[0], e.geo[1]), W = worldPx(v.zoom), pm = mpp(e.geo[0], v.zoom) * W;
    base = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([px, py]) => { const rx = px * Math.cos(rot) - py * Math.sin(rot), ry = px * Math.sin(rot) + py * Math.cos(rot); return [m[0] + rx / pm, m[1] + ry / pm]; })
      .map(([mx, my]) => { const lat = Math.atan(Math.sinh(Math.PI * (1 - 2 * my))) * 180 / Math.PI, lon = mx * 360 - 180; return project(v, s, lat, lon); }); }
  const g = e.grow ? grow(e, t) : ease(clamp(k / 0.9)), H = (e.height ?? 90) * backOut(g) * (base[0][2] ?? 1), [hi, mid, lo] = metal(e.color || 'blue');
  const top = base.map(([x, y]) => [x, y - H]);
  ctx.save(); ctx.globalAlpha = a;
  // nền phát sáng
  ctx.fillStyle = mid; ctx.globalAlpha = a * 0.35; ctx.shadowColor = mid; ctx.shadowBlur = 30; poly(ctx, base); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = a;
  // mặt bên: vẽ từ cạnh xa (y nhỏ) đến gần
  const sides = base.map((p, i) => [p, base[(i + 1) % base.length], i]).sort((A, B) => (A[0][1] + A[1][1]) - (B[0][1] + B[1][1]));
  for (const [p, q, i] of sides) { const tq = top[(i + 1) % base.length], tp = top[i]; const lit = (q[0] - p[0]) > 0 ? 0.92 : 0.7;
    const gr = ctx.createLinearGradient(0, Math.min(p[1], q[1]) - H, 0, Math.max(p[1], q[1])); gr.addColorStop(0, hexA(mid, 0.95 * lit)); gr.addColorStop(1, hexA(lo, 0.95 * lit));
    ctx.fillStyle = gr; poly(ctx, [p, q, tq, tp]); ctx.fill(); ctx.strokeStyle = hexA(hi, 0.8); ctx.lineWidth = 2; ctx.stroke(); }
  const gt = ctx.createLinearGradient(top[0][0], top[0][1], top[2][0], top[2][1]); gt.addColorStop(0, hexA(hi, 0.95)); gt.addColorStop(1, hexA(mid, 0.95));
  ctx.fillStyle = gt; poly(ctx, top); ctx.fill(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.stroke();
  if (e.label && g > 0.6) { const cx = top.reduce((S, p) => S + p[0], 0) / top.length, cy = top.reduce((S, p) => S + p[1], 0) / top.length;
    ctx.globalAlpha = a * clamp((g - 0.6) / 0.3); ctx.font = `${e.labelSize ?? 40}px ${F.black}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.strokeStyle = hexA(lo, 0.9); ctx.strokeText(e.label, cx, cy); ctx.fillStyle = '#FFFFFF'; ctx.fillText(e.label, cx, cy); }
  if (e.dims && g > 0.8) { // vạch kích thước dọc cạnh trước
    const [p, q] = sides.at(-1), off = 26; ctx.globalAlpha = a * clamp((g - 0.8) / 0.2); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; const nx = 0, ny = off;
    ctx.beginPath(); ctx.moveTo(p[0] + nx, p[1] + ny); ctx.lineTo(q[0] + nx, q[1] + ny); ctx.moveTo(p[0], p[1] + ny - 10); ctx.lineTo(p[0], p[1] + ny + 10); ctx.moveTo(q[0], q[1] + ny - 10); ctx.lineTo(q[0], q[1] + ny + 10); ctx.stroke();
    ctx.font = `26px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.strokeText(e.dims, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + ny + 8); ctx.fillText(e.dims, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + ny + 8); }
  ctx.restore();
}
function poly(ctx, P) { ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }

// thẻ ảnh nhỏ có dải tên + đường dẫn nét đứt về điểm trên bản đồ (path tùy chọn; không có ảnh thì dùng icon)
function pcard(ctx, e, t, s, v) {
  const [ax, ay] = pos(e, t, s, v), k = local(e, t), a = fadeA(e, t), q = backOut(clamp(k / 0.45)); if (k < 0) return;
  const W = e.w ?? 230, im = e.path ? s._photos.get(e.path) : null, H = W * (e.ratio ?? 0.72), B = 7, SH = 44, [hi, mid, lo] = metal(e.color || 'blue');
  const cx = clamp(ax + (e.cdx ?? 0), SAFE + W / 2 + B, 1080 - SAFE - W / 2 - B), cyB = ay + (e.cdy ?? -110); // đáy thẻ
  ctx.save(); ctx.globalAlpha = a;
  // đường dẫn vẽ dần
  const lp = clamp(k / 0.35); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + (cx - ax) * lp, ay + (cyB - ay) * lp); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ax, ay, 7, 0, 7); ctx.fill(); ctx.fillStyle = mid; ctx.beginPath(); ctx.arc(ax, ay, 4, 0, 7); ctx.fill();
  if (q > 0) { ctx.translate(cx, cyB); ctx.scale(q, q); ctx.globalAlpha = a * clamp(q * 2);
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-W / 2 - B, -H - SH - 2 * B, W + 2 * B, H + SH + 2 * B); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (im) { ctx.save(); ctx.beginPath(); ctx.rect(-W / 2, -H - SH - B, W, H); ctx.clip(); const sc = Math.max(W / im.width, H / im.height) * (1 + 0.06 * clamp(k / 4)), iw = im.width * sc, ih = im.height * sc; ctx.drawImage(im, -iw / 2, -H / 2 - SH - B - ih / 2, iw, ih); ctx.restore(); }
    else { const g = ctx.createLinearGradient(0, -H - SH - B, 0, -SH - B); g.addColorStop(0, hi); g.addColorStop(1, mid); ctx.fillStyle = g; ctx.fillRect(-W / 2, -H - SH - B, W, H); ctx.save(); ctx.translate(0, -H / 2 - SH - B); drawIcon(ctx, e.icon || 'building', '#FFFFFF', H / 48); ctx.restore(); }
    ctx.fillStyle = lo; ctx.fillRect(-W / 2, -SH - B, W, SH); ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; fitFont(ctx, (e.label || '').toUpperCase(), F.black, 28, W - 16); ctx.fillText((e.label || '').toUpperCase(), 0, -SH / 2 - B + 1);
    if (e.credit) { ctx.font = `15px ${F.bold}`; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'left'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.7)'; let c = e.credit; while (ctx.measureText(c).width > W + 2 * B && c.length > 8) c = c.slice(0, -2); ctx.strokeText(c, -W / 2 - B, 14); ctx.fillText(c, -W / 2 - B, 14); } }
  ctx.restore();
}
// thẻ thông tin dưới: loại (chip màu), tên, km, phút
function info(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: 'none'}, t), q = ease(clamp(k / 0.45)); if (q <= 0) return;
  const W = 1080 - 2 * (SAFE + 14), x = (1080 - W) / 2, H = 200, y = (e.y ?? 1200) + (1 - q) * 80, [hi, mid, lo] = metal(e.color || 'gold');
  ctx.save(); ctx.globalAlpha = a * q;
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(12,16,24,.82)'; rr(ctx, x, y, W, H, 26); ctx.fill(); ctx.shadowBlur = 0;
  const g = ctx.createLinearGradient(x, y, x + W, y); g.addColorStop(0, hi); g.addColorStop(0.5, mid); g.addColorStop(1, lo); ctx.strokeStyle = g; ctx.lineWidth = 3; rr(ctx, x, y, W, H, 26); ctx.stroke();
  // icon tròn kim loại
  ctx.save(); ctx.translate(x + 92, y + H / 2); const gi = ctx.createLinearGradient(-50, -50, 50, 50); gi.addColorStop(0, hi); gi.addColorStop(0.5, mid); gi.addColorStop(1, lo); ctx.fillStyle = gi; ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.fill(); drawIcon(ctx, e.icon || 'star', '#FFFFFF', 1.7); ctx.restore();
  const tx = x + 180; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  if (e.cat) { ctx.font = `24px ${F.black}`; const cw = ctx.measureText(e.cat.toUpperCase()).width + 26; ctx.fillStyle = mid; rr(ctx, tx, y + 26, cw, 38, 19); ctx.fill(); ctx.fillStyle = '#0D1117'; ctx.fillText(e.cat.toUpperCase(), tx + 13, y + 54); }
  fitFont(ctx, e.name || '', F.black, 48, W - 200); ctx.fillStyle = '#FFFFFF'; ctx.fillText(e.name || '', tx, y + 118);
  ctx.font = `34px ${F.black}`; let sx = tx; const stat = (txt, ic) => { ctx.save(); ctx.translate(sx + 16, y + 158); drawIcon(ctx, ic, hi, 0.75); ctx.restore(); ctx.fillStyle = hi; ctx.fillText(txt, sx + 40, y + 171); sx += 40 + ctx.measureText(txt).width + 40; };
  if (e.km !== undefined) stat(`${String(e.km).replace('.', ',')} km`, 'road'); if (e.min !== undefined) stat(`${e.min} phút`, 'clock');
  ctx.restore();
}
POI_ICONS.clock = c => { c.beginPath(); c.arc(0, 0, 14, 0, 7); c.moveTo(0, -8); c.lineTo(0, 0); c.lineTo(6, 5); c.stroke(); };
// danh sách tích xanh với tiêu đề viên thuốc đỏ cam
function checklist(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: 'none'}, t), items = e.items || [], W = e.w ?? 620, x = e.x ?? (1080 - W) / 2, y0 = e.y ?? 1180, rh = 66, st = e.stagger ?? 0.35;
  ctx.save();
  if (e.title) { const q = backOut(clamp(k / 0.35)); if (q > 0) { ctx.globalAlpha = a * clamp(q); ctx.font = `38px ${F.black}`; const tw = ctx.measureText(e.title.toUpperCase()).width + 56, hx = x + W / 2;
    ctx.save(); ctx.translate(hx, y0); ctx.scale(q, q); const g = ctx.createLinearGradient(0, -30, 0, 30); g.addColorStop(0, '#FF7A45'); g.addColorStop(1, '#E02D2D'); ctx.shadowColor = 'rgba(255,80,40,.6)'; ctx.shadowBlur = 22; ctx.fillStyle = g; rr(ctx, -tw / 2, -32, tw, 64, 16); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e.title.toUpperCase(), 0, 2); ctx.restore(); } }
  items.forEach((it, i) => { const q = clamp((k - 0.3 - i * st) / 0.3); if (q <= 0) return; const y = y0 + 58 + i * (rh + 12);
    ctx.globalAlpha = a * q; ctx.save(); ctx.translate((1 - ease(q)) * -60, 0);
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 12; ctx.fillStyle = 'rgba(255,255,255,.96)'; rr(ctx, x, y, W, rh, 14); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#22B455'; rr(ctx, x + 14, y + 13, 40, 40, 9); ctx.fill(); const cq = clamp((k - 0.4 - i * st) / 0.25); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x + 24, y + 34); ctx.lineTo(x + 31, y + 41); if (cq > 0.3) ctx.lineTo(x + 31 + 13 * (cq - 0.3) / 0.7, y + 41 - 17 * (cq - 0.3) / 0.7); ctx.stroke();
    fitFont(ctx, it, F.black, 34, W - 90); ctx.fillStyle = '#16233F'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(it, x + 70, y + rh / 2 + 1); ctx.restore(); });
  ctx.restore();
}
function legend(ctx, e, t, s) {
  const a = fadeA(e, t), items = e.items || [], cols = e.cols ?? 2, W = e.w ?? 1080 - 2 * SAFE, x = e.x ?? (1080 - W) / 2, y = e.y ?? 150, rh = 46, rows = Math.ceil(items.length / cols), H = rows * rh + 28;
  ctx.save(); ctx.globalAlpha = a * ease(clamp(local(e, t) / 0.4)); ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(255,255,255,.94)'; rr(ctx, x, y, W, H, 18); ctx.fill(); ctx.shadowBlur = 0;
  items.forEach((it, i) => { const c = Math.floor(i / rows), r = i % rows, ix = x + 22 + c * (W - 30) / cols, iy = y + 14 + r * rh + rh / 2;
    ctx.strokeStyle = col(it.color); ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + 38, iy); ctx.stroke();
    fitFont(ctx, it.text, F.bold, 26, (W - 30) / cols - 60); ctx.fillStyle = '#16233F'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(it.text, ix + 52, iy + 1); });
  ctx.restore();
}
// tiêu đề chương: chữ vàng viền tối, bật lên (kiểu "Ngay cửa nhà")
function chapter(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: 'none'}, t), q = backOut(clamp(k / 0.4)); if (q <= 0) return;
  const y = e.y ?? 290, size = e.size ?? 86, x = 540; ctx.save(); ctx.globalAlpha = a * clamp(q * 2); ctx.translate(x, y); ctx.scale(0.6 + 0.4 * q, 0.6 + 0.4 * q);
  const T = e.text || ''; const sz = fitFont(ctx, T, F.black, size, 1080 - 2 * SAFE - 20); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  ctx.lineWidth = sz * 0.2; ctx.strokeStyle = 'rgba(20,14,4,.9)'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6; ctx.strokeText(T, 0, 0); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  const g = ctx.createLinearGradient(0, -sz * 0.8, 0, 0); const [hi, mid, lo] = metal(e.color || 'gold'); g.addColorStop(0, hi); g.addColorStop(0.55, mid); g.addColorStop(1, lo); ctx.fillStyle = g; ctx.fillText(T, 0, 0);
  if (e.sub) { const ss = Math.round(sz * 0.42), qq = clamp((k - 0.25) / 0.3); ctx.globalAlpha = a * qq; fitFont(ctx, e.sub.toUpperCase(), F.black, ss, 1080 - 2 * SAFE); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.strokeText(e.sub.toUpperCase(), 0, ss * 1.5); ctx.fillStyle = '#FFFFFF'; ctx.fillText(e.sub.toUpperCase(), 0, ss * 1.5); }
  ctx.restore();
}
// nút kêu gọi: "BÌNH LUẬN: | TỪ KHÓA" hoặc một nút đơn
function cta(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: 'none'}, t), q = backOut(clamp(k / 0.4)); if (q <= 0) return; const y = e.y ?? 1240, pul = 1 + 0.035 * Math.sin(k * 6);
  ctx.save(); ctx.globalAlpha = a * clamp(q * 2); ctx.translate(540, y); ctx.scale(q * pul, q * pul);
  const L = (e.text || 'LIÊN HỆ NGAY').toUpperCase(), K = e.key ? e.key.toUpperCase() : ''; ctx.font = `40px ${F.black}`; const lw = ctx.measureText(L).width; ctx.font = `46px ${F.black}`; const kw = K ? ctx.measureText(K).width + 60 : 0;
  const W = 96 + lw + (K ? 26 + kw : 30), H = 92, x0 = -W / 2;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 24; ctx.fillStyle = '#FFFFFF'; rr(ctx, x0, -H / 2, W, H, H / 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#FF7A1F'; ctx.beginPath(); ctx.arc(x0 + 48, 0, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(x0 + 32, -14, 32, 22, 6); ctx.fill(); ctx.beginPath(); ctx.moveTo(x0 + 38, 6); ctx.lineTo(x0 + 36, 16); ctx.lineTo(x0 + 46, 7); ctx.fill();
  ctx.fillStyle = '#16233F'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `40px ${F.black}`; ctx.fillText(L, x0 + 92, 2);
  if (K) { const kx = x0 + 92 + lw + 22; const g = ctx.createLinearGradient(0, -36, 0, 36); g.addColorStop(0, '#FF6B4A'); g.addColorStop(1, '#D9232E'); ctx.fillStyle = g; rr(ctx, kx, -36, kw, 72, 20); ctx.fill(); ctx.fillStyle = '#FFFFFF'; ctx.font = `46px ${F.black}`; ctx.textAlign = 'center'; ctx.fillText(K, kx + kw / 2, 3); }
  ctx.restore();
}

// ảnh dự án đã nắn về lưới vệ tinh bằng studio/tools/georef.py (quy hoạch 1/500, mặt bằng phân lô): `path` = file .json của georef.
// alpha, reveal: {at, dur} (hiện dần từ trái sang phải theo trục chéo), enterDur.
const overlays = new Map();
export async function preloadOverlays(s) {
  for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'overlay' && !overlays.has(e.path)) {
    const f = path.join(s.base, e.path), meta = JSON.parse(fs.readFileSync(f, 'utf8')); meta.img = await loadImage(path.join(path.dirname(f), meta.file)); overlays.set(e.path, meta); }
}
function overlay(ctx, e, t, s, v) {
  const m = overlays.get(e.path); if (!m || !v) return; const Wv = worldPx(v.zoom), Wz = worldPx(m.z), k = Wv / Wz;
  const dx = s.width / 2 + (m.x0 / Wz - v.c[0]) * Wv, dy = s.height / 2 + (m.y0 / Wz - v.c[1]) * Wv, w = m.w * k, h = m.h * k;
  ctx.save(); ctx.globalAlpha = fadeA(e, t) * (e.alpha ?? 0.8);
  if (e.reveal) { const q = ease(clamp((local(e, t) - (e.reveal.at ?? 0)) / (e.reveal.dur ?? 1.2))); ctx.beginPath(); ctx.rect(dx, dy, w * q, h); ctx.clip(); }
  ctx.drawImage(m.img, dx, dy, w, h); ctx.restore();
}

Object.assign(PAINT, {overlay, poi, project: projectPin, rings, block, pcard, info, checklist, legend, chapter, cta});
for (const ty of BDS_TYPES) if (!GEO_TYPES.includes(ty)) GEO_TYPES.push(ty);
