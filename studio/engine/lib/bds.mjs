// Bộ phần tử "bản đồ bất động sản" cho 4 phong cách học từ mẫu TikTok BĐS (thẻ: studio/references/bds-*/card.md):
//   bds-drone  (flycam + kẻ đường neon + ghim vàng + thẻ ảnh khung trắng nhãn xanh)
//   bds-capcut (vệ tinh tối + tiêu đề trắng vàng + tia laser xanh + nhãn đường + khu đất xanh có số đo)
//   bds-navy   (bản đồ vector xanh navy nghiêng 3D + thẻ ảnh kính + mũi tên xanh lá + chữ sông lớn)
//   bds-geo    (vệ tinh sáng kiểu Geolayers + ranh giới neon xanh lá + bán kính radar + nhãn đỏ + mũi tên khúc trắng)
// Toạ độ điểm: "geo": [lat, lon] (bản đồ), "ip": [u, v] (phân số trên ảnh nền bgphoto, bám theo ảnh khi ảnh trôi), hoặc "x","y" (màn hình).
// Đường / vùng: "path" [[lat,lon]…] | "ipts" [[u,v]…] | "pts" [[x,y]…].  Định dạng chi tiết: SCENE_FORMAT.md, mục "Phong cách BĐS".
import path from 'node:path';
import {createCanvas, loadImage} from '@napi-rs/canvas';
import {clamp, ease, easeOut, backOut, sampleTrack} from './math.mjs';
import {project, metersPx, sampleView, local, fadeA, grow, rr, chaikin, partial} from './geo.mjs';

export const BDS_TYPES = ['sky', 'bgphoto', 'neon', 'pin', 'card', 'tagbox', 'btext', 'arrow', 'ring', 'lot', 'boundary', 'icon', 'tint'];
const FONT = {M900: 'BDSM900', M800: 'BDSM800', M800i: 'BDSM800i', M500i: 'BDSM500i', RC: 'BDSRC', inter: 'QBKBold', black: 'QBKBlack'};
const fnt = (f, size) => `${Math.round(size)}px ${FONT[f] || f || FONT.M800}`;

// ---------- assets ----------
export async function preloadBds(s) {
  s._bdsImg ||= new Map();
  for (const sh of s.shots) for (const e of sh.elements || []) for (const p of [e.type === 'bgphoto' || e.type === 'card' ? e.path : null, e.type === 'tint' ? null : e.image].filter(Boolean))
    if (!s._bdsImg.has(p)) s._bdsImg.set(p, await loadImage(path.join(s.base, p)));
}
export function validateBds(s, e, where, err) {
  if (!BDS_TYPES.includes(e.type)) return false;
  if ((e.type === 'bgphoto' || (e.type === 'card' && e.variant !== 'label')) && !e.path) err(`${where}: ${e.type} cần "path" (ảnh)`);
  if (['neon', 'arrow'].includes(e.type) && !(e.path || e.pts || e.ipts)) err(`${where}: ${e.type} cần path | pts | ipts`);
  if (['lot', 'boundary'].includes(e.type) && !(e.path || e.pts || e.ipts || e.polys)) err(`${where}: ${e.type} cần path | pts | ipts | polys`);
  return true;
}

// ---------- coordinates ----------
function pt(s, v, e, p, kind) { // one point of a path
  if (kind === 'path') return project(v, s, p[0], p[1]);
  if (kind === 'ipts') { const b = s._bgXf; return b ? [b.x + p[0] * b.w, b.y + p[1] * b.h] : [p[0] * s.width, p[1] * s.height]; }
  return p;
}
function pts(s, v, e) { const kind = e.path ? 'path' : e.ipts ? 'ipts' : 'pts'; return (e[kind] || []).map(p => pt(s, v, e, p, kind)); }
function at(s, v, e, t) {
  const tr = sampleTrack(e.track, t, ['x', 'y']); let x, y;
  if (e.geo && v) [x, y] = project(v, s, e.geo[0], e.geo[1]);
  else if (e.ip) [x, y] = pt(s, v, e, e.ip, 'ipts');
  else { x = tr.x ?? e.x ?? s.width / 2; y = tr.y ?? e.y ?? s.height / 2; }
  return [x + (e.dx0 || 0), y + (e.dy0 || 0)];
}
const pathLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
function pointAt(P, u) { const L = pathLen(P) * clamp(u); let acc = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (acc + d >= L) { const k = (L - acc) / (d || 1); return {x: P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k, y: P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k, ang: Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])}; } acc += d; } const n = P.length; return {x: P[n - 1][0], y: P[n - 1][1], ang: Math.atan2(P[n - 1][1] - P[n - 2][1], P[n - 1][0] - P[n - 2][0])}; }
function sub(P, u0, u1) { const a = partial(P, clamp(u1)).pts; if (u0 <= 0) return a; const L = pathLen(P) * u0; let acc = 0; const out = []; for (let i = 1; i < a.length; i++) { const d = Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]); if (!out.length && acc + d >= L) { const k = (L - acc) / (d || 1); out.push([a[i - 1][0] + (a[i][0] - a[i - 1][0]) * k, a[i - 1][1] + (a[i][1] - a[i - 1][1]) * k]); } if (out.length) out.push(a[i]); acc += d; } return out; }
const stroke = (ctx, P, close) => { ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); if (close) ctx.closePath(); ctx.stroke(); };
const fillP = (ctx, P) => { ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); };
const enterK = (e, t, d = 0.4) => clamp((local(e, t) - (e.delay ?? 0)) / (e.enterDur ?? d));
const alpha = (e, t) => fadeA({...e, enter: 'none'}, t);

// text with stroke + shadow; *word* = keyColor
function richText(ctx, text, x, y, o) {
  const parts = String(text).split(/(\*[^*]+\*)/).filter(Boolean).map(p => p.startsWith('*') ? {t: p.slice(1, -1), k: true} : {t: p, k: false});
  ctx.font = fnt(o.font, o.size); const ls = o.letter ?? 0;
  const wOf = str => ctx.measureText(str).width + ls * str.length;
  const W = parts.reduce((a, p) => a + wOf(p.t), 0); let cx = o.align === 'left' ? x : o.align === 'right' ? x - W : x - W / 2;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (const p of parts) {
    if (o.shadow !== false) { ctx.save(); ctx.shadowColor = o.shadowColor || 'rgba(0,0,0,.55)'; ctx.shadowBlur = o.shadowBlur ?? o.size * 0.18; ctx.shadowOffsetY = o.shadowY ?? o.size * 0.05; ctx.fillStyle = o.shadowColor || 'rgba(0,0,0,.55)'; if (!o.strokeW) ctx.fillText(p.t, cx, y); else { ctx.lineWidth = o.strokeW; ctx.strokeStyle = o.stroke || '#111'; ctx.strokeText(p.t, cx, y); } ctx.restore(); }
    if (o.strokeW) { ctx.lineWidth = o.strokeW; ctx.strokeStyle = o.stroke || '#111'; if (ls) for (let i = 0, xx = cx; i < p.t.length; i++) { ctx.strokeText(p.t[i], xx, y); xx += ctx.measureText(p.t[i]).width + ls; } else ctx.strokeText(p.t, cx, y); }
    ctx.fillStyle = p.k ? (o.keyColor || '#FFD21F') : (o.color || '#FFFFFF');
    if (ls) for (let i = 0, xx = cx; i < p.t.length; i++) { ctx.fillText(p.t[i], xx, y); xx += ctx.measureText(p.t[i]).width + ls; } else ctx.fillText(p.t, cx, y);
    cx += wOf(p.t);
  }
  return W;
}

// ---------- icons (centered, ~±16 units) ----------
const IC = {
  house: c => { c.beginPath(); c.moveTo(-15, -1); c.lineTo(0, -15); c.lineTo(15, -1); c.lineTo(11, -1); c.lineTo(11, 13); c.lineTo(3, 13); c.lineTo(3, 4); c.lineTo(-3, 4); c.lineTo(-3, 13); c.lineTo(-11, 13); c.lineTo(-11, -1); c.closePath(); c.fill(); },
  school: c => { c.beginPath(); c.moveTo(-16, -4); c.lineTo(0, -13); c.lineTo(16, -4); c.lineTo(0, 5); c.closePath(); c.fill(); c.fillRect(-10, 0, 20, 9); c.fillRect(13, -4, 2.5, 12); },
  book: c => { c.beginPath(); c.moveTo(0, -9); c.quadraticCurveTo(-8, -14, -16, -11); c.lineTo(-16, 11); c.quadraticCurveTo(-8, 8, 0, 13); c.quadraticCurveTo(8, 8, 16, 11); c.lineTo(16, -11); c.quadraticCurveTo(8, -14, 0, -9); c.fill(); },
  cart: c => { c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-16, -12); c.lineTo(-11, -12); c.lineTo(-7, 6); c.lineTo(11, 6); c.lineTo(15, -7); c.lineTo(-9, -7); c.stroke(); c.beginPath(); c.arc(-5, 12, 3, 0, 7); c.arc(9, 12, 3, 0, 7); c.fill(); },
  food: c => { c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-7, -15); c.lineTo(-7, 15); c.moveTo(-12, -15); c.lineTo(-12, -5); c.quadraticCurveTo(-7, 0, -2, -5); c.lineTo(-2, -15); c.moveTo(8, 15); c.lineTo(8, -15); c.stroke(); c.beginPath(); c.moveTo(8, -15); c.quadraticCurveTo(15, -8, 13, 2); c.lineTo(8, 2); c.fill(); },
  cross: c => { c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-11, -11); c.lineTo(11, 11); c.moveTo(11, -11); c.lineTo(-11, 11); c.stroke(); },
  bowl: c => { c.beginPath(); c.moveTo(-16, -2); c.lineTo(16, -2); c.quadraticCurveTo(14, 13, 0, 13); c.quadraticCurveTo(-14, 13, -16, -2); c.fill(); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(-3, -11, -6, -15); c.moveTo(2, -6); c.quadraticCurveTo(5, -11, 2, -15); c.stroke(); },
  coffee: c => { c.fillRect(-13, -6, 20, 16); c.lineWidth = 3; c.beginPath(); c.arc(9, 2, 5, -1.4, 1.4); c.stroke(); c.lineWidth = 2.5; c.beginPath(); c.moveTo(-7, -9); c.quadraticCurveTo(-4, -13, -7, -16); c.moveTo(1, -9); c.quadraticCurveTo(4, -13, 1, -16); c.stroke(); },
  building: c => { c.fillRect(-10, -15, 20, 30); c.globalCompositeOperation = 'destination-out'; for (let y = -11; y < 10; y += 6) for (const x of [-6, 2]) c.fillRect(x, y, 4, 3.5); c.globalCompositeOperation = 'source-over'; },
  hotel: c => { c.fillRect(-14, -2, 28, 9); c.fillRect(-14, -12, 3.5, 25); c.fillRect(10.5, 2, 3.5, 11); c.beginPath(); c.arc(-4, -6, 4, 0, 7); c.fill(); c.fillRect(1, -9, 13, 6); },
  plane: c => { c.beginPath(); c.moveTo(16, 0); c.quadraticCurveTo(16, -2.5, 12, -2.5); c.lineTo(3, -2.5); c.lineTo(-5, -15); c.lineTo(-9, -15); c.lineTo(-4, -2.5); c.lineTo(-11, -2.5); c.lineTo(-14, -7); c.lineTo(-16, -7); c.lineTo(-14, 0); c.lineTo(-16, 7); c.lineTo(-14, 7); c.lineTo(-11, 2.5); c.lineTo(-4, 2.5); c.lineTo(-9, 15); c.lineTo(-5, 15); c.lineTo(3, 2.5); c.lineTo(12, 2.5); c.quadraticCurveTo(16, 2.5, 16, 0); c.fill(); },
  hospital: c => { c.fillRect(-4, -14, 8, 28); c.fillRect(-14, -4, 28, 8); },
  star: c => { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 16, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); },
  person: c => { c.beginPath(); c.arc(0, -10, 5, 0, 7); c.fill(); c.beginPath(); c.moveTo(-7, 15); c.lineTo(-5, -3); c.quadraticCurveTo(0, -6, 5, -3); c.lineTo(7, 15); c.closePath(); c.fill(); },
  tree: c => { c.beginPath(); c.arc(0, -4, 11, 0, 7); c.fill(); c.fillRect(-2.5, 4, 5, 11); },
  court: c => { c.beginPath(); c.moveTo(-16, -6); c.lineTo(0, -15); c.lineTo(16, -6); c.closePath(); c.fill(); for (const x of [-11, -4, 3, 10]) c.fillRect(x, -4, 3.5, 13); c.fillRect(-16, 10, 32, 4); },
};
export function drawIcon(ctx, name, size, color) { ctx.save(); ctx.fillStyle = ctx.strokeStyle = color; ctx.scale(size / 32, size / 32); (IC[name] || IC.house)(ctx); ctx.restore(); }

// ---------- background photo (flycam stand-in) ----------
function bgphoto(ctx, e, t, s) {
  const im = s._bdsImg.get(e.path), tr = sampleTrack(e.track, t, ['zoom', 'fx', 'fy']), z = tr.zoom ?? e.zoom ?? 1, fx = tr.fx ?? e.fx ?? 0.5, fy = tr.fy ?? e.fy ?? 0.5;
  const sc = Math.max(s.width / im.width, s.height / im.height) * z, w = im.width * sc, h = im.height * sc, x = (s.width - w) * fx, y = (s.height - h) * fy;
  ctx.save(); ctx.globalAlpha = alpha(e, t); ctx.drawImage(im, x, y, w, h);
  if (e.grade) { const g = e.grade; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.globalAlpha = alpha(e, t) * (e.gradeAlpha ?? 0.18); ctx.fillRect(0, 0, s.width, s.height); }
  ctx.restore(); s._bgXf = {x, y, w, h};
}

// ---------- neon road / laser / highway ----------
function neon(ctx, e, t, s, v) {
  let P = pts(s, v, e); if (P.length < 2) return; if (e.smooth) P = chaikin(chaikin(P));
  const g = grow(e, t), a = alpha(e, t), variant = e.variant || 'neon'; if (g <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (variant === 'laser') { // tapered blue beam with white core, sweeping in (bds-capcut)
    const c = e.color || '#2E8BFF', w = e.width ?? 14, Q = sub(P, Math.max(0, g - (e.len ?? 1.2)), g); if (Q.length < 2) { ctx.restore(); return; }
    const L = pathLen(Q), n = Math.max(12, Math.round(L / 14)), body = [];
    for (let i = 0; i <= n; i++) { const u = i / n, p = pointAt(Q, u), tap = Math.sin(Math.PI * Math.pow(u, 0.9)) ** 0.6; body.push([p.x, p.y, p.ang, tap]); }
    const shape = k => { ctx.beginPath(); body.forEach(([x, y, an, tp], i) => { const r = w * k * tp; const px = x - Math.sin(an) * r, py = y + Math.cos(an) * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }); for (let i = body.length - 1; i >= 0; i--) { const [x, y, an, tp] = body[i], r = w * k * tp; ctx.lineTo(x + Math.sin(an) * r, y - Math.cos(an) * r); } ctx.closePath(); ctx.fill(); };
    ctx.shadowColor = c; ctx.shadowBlur = w * 3; ctx.fillStyle = c; ctx.globalAlpha = a * 0.55; shape(1.6); ctx.globalAlpha = a; shape(0.95);
    ctx.shadowBlur = w; ctx.shadowColor = '#BFE3FF'; ctx.fillStyle = '#E8F6FF'; shape(0.38); ctx.shadowBlur = 0;
    const flare = pointAt(Q, 0.5 + 0.35 * Math.sin(local(e, t) * 2.2)), fg = ctx.createRadialGradient(flare.x, flare.y, 0, flare.x, flare.y, w * 5); fg.addColorStop(0, 'rgba(255,255,255,.9)'); fg.addColorStop(0.3, 'rgba(120,190,255,.35)'); fg.addColorStop(1, 'rgba(46,139,255,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(flare.x, flare.y, w * 5, 0, 7); ctx.fill();
    ctx.restore(); return;
  }
  const c = e.color || (variant === 'road' ? '#86F4F2' : '#2DF5C6'), w = e.width ?? (variant === 'road' ? 9 : 7), Q = partial(P, g).pts;
  if (variant === 'road') { ctx.shadowColor = c; ctx.shadowBlur = w * 1.2; ctx.strokeStyle = c; ctx.lineWidth = w; stroke(ctx, Q); ctx.restore(); return; }
  // neon (bds-drone): soft wide glow, bright core, light pulses running along the road
  ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = w * 4; ctx.globalAlpha = a * 0.35; ctx.lineWidth = w * 3.2; stroke(ctx, Q);
  ctx.globalAlpha = a * 0.85; ctx.shadowBlur = w * 2; ctx.lineWidth = w; stroke(ctx, Q);
  ctx.shadowBlur = 0; ctx.globalAlpha = a * 0.9; ctx.strokeStyle = '#E9FFFA'; ctx.lineWidth = w * 0.35; stroke(ctx, Q);
  if (e.flow !== false) { const L = pathLen(Q), sp = e.flowSpeed ?? 0.55, k = local(e, t); for (let j = 0; j < (e.pulses ?? 2); j++) { const u = ((k * sp + j / (e.pulses ?? 2)) % 1), R = sub(Q, Math.max(0, u - 160 / Math.max(L, 1)), u); if (R.length < 2) continue; ctx.globalAlpha = a; ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = w * 3; ctx.strokeStyle = '#F4FFFD'; ctx.lineWidth = w * 1.1; stroke(ctx, R); } }
  if (g < 1) { const hd = Q.at(-1); ctx.globalAlpha = a; ctx.shadowColor = '#fff'; ctx.shadowBlur = 30; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hd[0], hd[1], w * 0.9, 0, 7); ctx.fill(); }
  ctx.restore();
}

// ---------- pins ----------
function teardrop(ctx, r) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-r * 0.35, -r * 0.9, -r, -r * 1.35, -r, -r * 2.2); ctx.arc(0, -r * 2.2, r, Math.PI, 0); ctx.bezierCurveTo(r, -r * 1.35, r * 0.35, -r * 0.9, 0, 0); ctx.closePath(); }
function pin(ctx, e, t, s, v) {
  const [x, y] = at(s, v, e, t), k = enterK(e, t, 0.45), a = alpha(e, t) * clamp(k * 3), V = e.variant || 'yellow', sz = e.size ?? 1;
  if (a <= 0) return;
  const lt = local(e, t), pop = backOut(k);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
  if (V === 'target') { // white disc + red dot (bds-geo "Vị trí lô đất")
    const r = 26 * sz, ph = (lt * 0.8) % 1;
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r * (1.9 + 0.5 * ph), 0, 7); ctx.globalAlpha = a * (0.7 - 0.5 * ph); ctx.stroke(); ctx.globalAlpha = a;
    ctx.scale(pop, pop); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 12; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r * 1.15, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#E3131B'; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, 7); ctx.fill();
    if (e.label) { ctx.scale(1 / pop, 1 / pop); ctx.globalAlpha = a * clamp((lt - 0.15) / 0.3); richText(ctx, e.label, e.labelDx ?? 0, -r * 2.1 - (e.labelDy ?? 0), {font: e.labelFont || 'inter', size: e.labelSize ?? 40, color: '#FFFFFF', shadowColor: 'rgba(0,0,0,.75)', shadowBlur: 10, shadowY: 2}); }
    ctx.restore(); return;
  }
  const r = (V === 'red' ? 21 : V === 'orange' ? 19 : 40) * sz, drop = (1 - pop) * -50;
  // ground rings
  if (e.ground !== false) {
    ctx.save(); ctx.strokeStyle = V === 'gold' ? 'rgba(255,190,60,.9)' : 'rgba(255,255,255,.85)'; ctx.lineWidth = V === 'red' ? 2.5 : 2;
    const rings = V === 'red' ? [2.1, 1.35] : V === 'orange' ? [] : [1.05];
    for (const m of rings) { ctx.beginPath(); ctx.ellipse(0, 0, r * m * pop, r * m * 0.34 * pop, 0, 0, 7); ctx.stroke(); }
    if (e.ripple !== false && V !== 'orange') { const ph = (lt * 0.9) % 1; ctx.globalAlpha = a * (1 - ph) * 0.8; ctx.beginPath(); ctx.ellipse(0, 0, r * (1 + 1.6 * ph), r * (1 + 1.6 * ph) * 0.34, 0, 0, 7); ctx.stroke(); }
    ctx.restore();
  }
  ctx.translate(0, drop); ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop);
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  const grd = ctx.createLinearGradient(-r, -r * 3.2, r, 0);
  if (V === 'gold') { grd.addColorStop(0, '#FFF3A8'); grd.addColorStop(0.35, '#F7C534'); grd.addColorStop(0.7, '#E09A12'); grd.addColorStop(1, '#B9770A'); }
  else if (V === 'yellow') { grd.addColorStop(0, '#FFF27A'); grd.addColorStop(0.5, '#FFE53A'); grd.addColorStop(1, '#E8C40C'); }
  else if (V === 'red') { grd.addColorStop(0, '#FF5A5F'); grd.addColorStop(0.45, '#E0161E'); grd.addColorStop(1, '#9E0B10'); }
  else { grd.addColorStop(0, '#FFD27A'); grd.addColorStop(0.5, '#F7A928'); grd.addColorStop(1, '#D9840C'); }
  ctx.fillStyle = grd; teardrop(ctx, r); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  if (V === 'gold' || V === 'yellow') { ctx.strokeStyle = V === 'gold' ? '#A66C06' : '#C9A400'; ctx.lineWidth = 1.5; ctx.stroke(); }
  const hy = -r * 2.2;
  if (V === 'red') { ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(0, hy, r * 0.32, 0, 7); ctx.fill(); }
  else {
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = r * 0.11; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, hy, r * 0.66, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(0, hy); drawIcon(ctx, e.icon || 'house', r * 0.9, V === 'gold' ? '#B07A0C' : V === 'orange' ? '#E08A10' : '#8A8F98'); ctx.restore();
  }
  ctx.restore();
  // label
  if (e.label && V !== 'red') {
    ctx.save(); ctx.globalAlpha = a * clamp((lt - 0.2) / 0.3); const ly = y + drop - r * 3.2 * (0.6 + 0.4 * pop) - (e.labelSize ?? 30) * 0.55 - (e.labelDy ?? 0);
    richText(ctx, e.label.toUpperCase(), x + (e.labelDx ?? 0), ly, V === 'gold' ? {font: 'M800i', size: e.labelSize ?? 30, color: '#FFD21F', strokeW: 4, stroke: '#3B2A00', shadowBlur: 8} : {font: 'M800', size: e.labelSize ?? 30, color: '#FFE93B', strokeW: 5, stroke: '#1A1A1A', shadowBlur: 6});
    ctx.restore();
  }
  if (e.label && V === 'red') redBox(ctx, x + (e.labelDx ?? 0), y - r * 3.4 - (e.labelDy ?? 0), e.label, {size: e.labelSize ?? 28, a: a * clamp((lt - 0.15) / 0.3), anchor: 'bottom'});
}
function redBox(ctx, x, y, text, o) {
  const lines = String(text).toUpperCase().split('\n'), sz = o.size ?? 28; ctx.save(); ctx.globalAlpha = o.a ?? 1; ctx.font = fnt('RC', sz);
  const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + sz * 0.9, h = lines.length * sz * 1.08 + sz * 0.45, by = o.anchor === 'bottom' ? y - h : y - h / 2;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 8; ctx.fillStyle = '#B5121B'; ctx.fillRect(x - w / 2, by, w, h); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(x - w / 2 + 2.5, by + 2.5, w - 5, h - 5);
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lines.forEach((l, i) => ctx.fillText(l, x, by + sz * 0.22 + sz * 1.08 * (i + 0.5) + 1)); ctx.restore();
}

// ---------- photo cards ----------
function card(ctx, e, t, s, v) {
  const [gx, gy] = at(s, v, e, t), V = e.variant || 'navy', lt = local(e, t) - (e.delay ?? 0), a = alpha(e, t), im = e.path ? s._bdsImg.get(e.path) : null;
  if (lt < 0) return;
  const cover = (W, H, x, y) => { const sc = Math.max(W / im.width, H / im.height), fx = e.focus?.[0] ?? 0.5, fy = e.focus?.[1] ?? 0.5; ctx.drawImage(im, x + (W - im.width * sc) * fx, y + (H - im.height * sc) * fy, im.width * sc, im.height * sc); };
  ctx.save(); ctx.globalAlpha = a;
  if (V === 'bracket') { // bds-drone: leader line → white frame → photo → blue name bar
    const W = e.w ?? 230, H = e.h ?? 165, cx = gx + (e.dx ?? 120), cy = gy + (e.dy ?? -260), x0 = cx - W / 2, y0 = cy - H / 2, side = (e.dx ?? 120) >= 0 ? -1 : 1;
    const corner = [cx + side * W / 2, cy + H / 2 + 20], k1 = clamp(lt / 0.3);
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.5; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 4; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + (corner[0] - gx) * k1, gy + (corner[1] - gy) * k1); ctx.stroke();
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(gx, gy, 6, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.5; ctx.stroke();
    const k2 = clamp((lt - 0.2) / 0.35); if (k2 > 0) { ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; const per = [[x0, y0 + H], [x0, y0], [x0 + W, y0], [x0 + W, y0 + H], [x0, y0 + H]]; stroke(ctx, partial(per, ease(k2)).pts); }
    const k3 = clamp((lt - 0.45) / 0.3); if (k3 > 0) { ctx.save(); ctx.globalAlpha = a * k3; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 16; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x0 - 5, y0 - 5, W + 10, H + 10); ctx.shadowBlur = 0; ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip(); cover(W, H, x0, y0); ctx.restore(); }
    const k4 = clamp((lt - 0.35) / 0.3); if (k4 > 0 && e.label) { const bh = e.barH ?? 34, bw = (W + 10) * easeOut(k4); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(cx - bw / 2 - 2, y0 + H - bh + 5 - 2, bw + 4, bh + 4); ctx.fillStyle = '#1463DC'; ctx.fillRect(cx - bw / 2, y0 + H - bh + 5, bw, bh); ctx.save(); ctx.beginPath(); ctx.rect(cx - bw / 2, y0 + H - bh + 5, bw, bh); ctx.clip(); richText(ctx, e.label.toUpperCase(), cx, y0 + H - bh / 2 + 6, {font: 'M800', size: e.labelSize ?? 24, color: '#FFFFFF', shadow: false}); ctx.restore(); }
  } else if (V === 'bubble') { // bds-capcut: round photo with a white tail
    const R = e.r ?? 150, tail = e.tail ?? 120, cx = gx + (e.dx ?? 0), cy = gy - tail - R + (e.dy ?? 0), k = backOut(clamp(lt / 0.45));
    ctx.translate(gx, gy); ctx.scale(k, k); ctx.translate(-gx, -gy); ctx.globalAlpha = a * clamp(lt / 0.2);
    const tg = ctx.createLinearGradient(0, cy, 0, gy); tg.addColorStop(0, 'rgba(255,255,255,.95)'); tg.addColorStop(1, 'rgba(255,255,255,.25)'); ctx.fillStyle = tg;
    ctx.beginPath(); ctx.moveTo(cx - R * 0.55, cy + R * 0.6); ctx.lineTo(gx, gy); ctx.lineTo(cx + R * 0.55, cy + R * 0.6); ctx.closePath(); ctx.fill();
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx, cy, R + 3, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); const kb = 1 + 0.06 * clamp(lt / 6); ctx.translate(cx, cy); ctx.scale(kb, kb); ctx.translate(-cx, -cy); cover(2 * R, 2 * R, cx - R, cy - R); ctx.restore();
  } else if (V === 'doc') { // bds-geo: document / certificate photo, red border, slides up
    const W = e.w ?? 760, H = W * (e.ratio ?? im.height / im.width), cx = gx, k = easeOut(clamp(lt / 0.5)), cy = gy + (1 - k) * 300;
    ctx.globalAlpha = a * clamp(lt / 0.3); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.fillStyle = '#D8232A'; ctx.fillRect(cx - W / 2 - 5, cy - H / 2 - 5, W + 10, H + 10); ctx.shadowBlur = 0; cover(W, H, cx - W / 2, cy - H / 2);
  } else { // navy (bds-navy): glass photo card on a glowing stick
    const W = e.w ?? 205, H = e.h ?? 108, stick = e.stick ?? 120, k = backOut(clamp(lt / 0.45)), rise = (1 - k) * 40, frame = e.frame || '#A8E2FF', textC = e.textColor || '#FFE14D';
    const cx = gx + (e.dx ?? 0), bottom = gy - stick + rise, stripH = e.label ? (e.stripH ?? 26) : 0, y0 = bottom - stripH - H;
    ctx.globalAlpha = a * clamp(lt / 0.25);
    const sg = ctx.createLinearGradient(0, bottom, 0, gy); sg.addColorStop(0, 'rgba(255,255,255,.95)'); sg.addColorStop(1, 'rgba(255,255,255,.35)'); ctx.strokeStyle = sg; ctx.lineWidth = 3; ctx.shadowColor = '#9FE6FF'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(gx, bottom); ctx.lineTo(gx, gy); ctx.stroke();
    const ph = (lt * 0.8) % 1; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(gx, gy, 6, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(200,240,255,.8)'; ctx.lineWidth = 2; ctx.globalAlpha = a * (1 - ph); ctx.beginPath(); ctx.ellipse(gx, gy, 10 + 26 * ph, (10 + 26 * ph) * 0.45, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = a * clamp(lt / 0.25);
    ctx.shadowColor = frame; ctx.shadowBlur = 14; ctx.fillStyle = e.bg || 'rgba(8,30,58,.88)'; rr(ctx, cx - W / 2 - 4, y0 - 4, W + 8, H + stripH + 8, 8); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = frame; ctx.lineWidth = 1.8; ctx.stroke();
    ctx.save(); rr(ctx, cx - W / 2, y0, W, H, 5); ctx.clip(); cover(W, H, cx - W / 2, y0); ctx.restore();
    if (e.badge) { ctx.save(); richText(ctx, e.badge, cx + W / 2 - 16, y0 + H - 22, {font: 'M900', size: 30, color: '#FFE14D', shadowBlur: 6}); ctx.restore(); }
    if (e.label) { richText(ctx, e.label.toUpperCase(), cx, bottom - stripH / 2 - 1, {font: 'M800', size: e.labelSize ?? 15, color: textC, shadowBlur: 3, letter: 0.5}); ctx.strokeStyle = 'rgba(160,230,255,.9)'; ctx.lineWidth = 1.5; ctx.shadowColor = '#7FD8FF'; ctx.shadowBlur = 6; ctx.beginPath(); ctx.moveTo(cx - W * 0.42, bottom + 5); ctx.lineTo(cx + W * 0.42, bottom + 5); ctx.stroke(); }
  }
  ctx.restore();
}

// ---------- tag boxes ----------
function tagbox(ctx, e, t, s, v) {
  const [gx, gy] = at(s, v, e, t), V = e.variant || 'glass', lt = local(e, t) - (e.delay ?? 0), a = alpha(e, t); if (lt < 0) return;
  const k = backOut(clamp(lt / 0.4)), text = V === 'road' ? e.text : String(e.text).toUpperCase(), lines = text.split('\n');
  const sz = e.size ?? ({glass: 22, road: 30, red: 28, yellow: 24, dark: 30}[V]), f = {glass: 'M800', road: 'M800', red: 'RC', yellow: 'RC', dark: 'RC'}[V];
  ctx.save(); ctx.globalAlpha = a * clamp(lt / 0.2); ctx.font = fnt(f, sz);
  const stick = e.stick ?? (V === 'glass' ? 70 : V === 'road' ? 110 : 0), tw = Math.max(...lines.map(l => ctx.measureText(l).width)) + (V === 'glass' || V === 'dark' ? lines[0].length * 1.5 : 0);
  const padX = sz * (V === 'road' ? 0.55 : 0.6), w = tw + padX * 2 + (V === 'road' ? 10 : 0), h = lines.length * sz * 1.1 + sz * (V === 'road' ? 0.5 : 0.55);
  if (stick) { // leader / stick to the ground point
    const sg = ctx.createLinearGradient(0, gy - stick, 0, gy); sg.addColorStop(0, 'rgba(255,255,255,.95)'); sg.addColorStop(1, `rgba(255,255,255,${V === 'glass' ? 0.3 : 0.95})`);
    ctx.strokeStyle = sg; ctx.lineWidth = V === 'road' ? 3.5 : 2.5; if (V === 'glass') { ctx.shadowColor = '#9FE6FF'; ctx.shadowBlur = 8; } ctx.beginPath(); ctx.moveTo(gx, gy - stick * clamp(lt / 0.3)); ctx.lineTo(gx, gy); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(gx, gy, V === 'road' ? 7 : 4.5, 0, 7); ctx.fill();
  }
  const cx = gx + (e.dx ?? 0), cy = gy - stick - h / 2 + (e.dy ?? 0);
  ctx.translate(cx, cy); if (e.rotate) ctx.rotate(e.rotate * Math.PI / 180); ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
  if (V === 'glass') { ctx.shadowColor = '#57C8FF'; ctx.shadowBlur = 14; ctx.fillStyle = 'rgba(10,38,72,.9)'; rr(ctx, -w / 2, -h / 2, w, h, 4); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(140,220,255,.95)'; ctx.lineWidth = 1.5; ctx.stroke(); }
  else if (V === 'road') { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0; ctx.fillStyle = '#1A47C8'; ctx.fillRect(-w / 2, -h / 2, 9, h); ctx.fillRect(w / 2 - 4, -h / 2, 4, h); }
  else if (V === 'red') { ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 8; ctx.fillStyle = '#B5121B'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5); }
  else if (V === 'yellow') { ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 6; ctx.fillStyle = '#FFE600'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0; }
  else { ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 8; ctx.fillStyle = 'rgba(38,70,58,.92)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(200,230,215,.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(-w / 2, -h / 2, w, h); }
  ctx.fillStyle = V === 'road' ? '#1A3FB0' : V === 'yellow' ? '#111111' : '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => { const y = (i - (lines.length - 1) / 2) * sz * 1.1 + 1; if (V === 'glass' || V === 'dark') { let xx = -tw / 2; ctx.textAlign = 'left'; for (const ch of l) { ctx.fillText(ch, xx, y); xx += ctx.measureText(ch).width + 1.5; } ctx.textAlign = 'center'; } else ctx.fillText(l, V === 'road' ? 3 : 0, y); });
  ctx.restore();
}

// ---------- free text (titles, river names, distances, watermark) ----------
function btext(ctx, e, t, s, v) {
  const [x, y] = at(s, v, e, t), lt = local(e, t) - (e.delay ?? 0), a = alpha(e, t); if (lt < 0) return;
  const en = e.enter || 'fade', k = clamp(lt / (e.enterDur ?? 0.4)), lines = String(e.text).split('\n'), size = e.size ?? 60;
  ctx.save(); ctx.globalAlpha = a * (en === 'none' ? 1 : en === 'pop' ? clamp(k * 3) : ease(k)); ctx.translate(x, y);
  if (e.along && v) { const p0 = project(v, s, e.along[0][0], e.along[0][1]), p1 = project(v, s, e.along[1][0], e.along[1][1]); let an = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]); if (an > Math.PI / 2) an -= Math.PI; if (an < -Math.PI / 2) an += Math.PI; ctx.rotate(an + (e.rotate ?? 0) * Math.PI / 180); } else if (e.rotate) ctx.rotate(e.rotate * Math.PI / 180);
  if (en === 'pop') { const q = backOut(k); ctx.scale(0.5 + 0.5 * q, 0.5 + 0.5 * q); }
  if (en === 'slide') ctx.translate((1 - easeOut(k)) * (e.slideX ?? -120), (1 - easeOut(k)) * (e.slideY ?? 0));
  if (en === 'rise') ctx.translate(0, (1 - easeOut(k)) * 40);
  lines.forEach((ln, i) => { let txt = e.upper ? ln.toUpperCase() : ln; if (en === 'type') { const n = Math.floor(clamp(lt / (e.enterDur ?? 0.6)) * txt.replace(/\*/g, '').length); let c = 0, out = ''; for (const ch of txt) { if (ch === '*') { out += ch; continue; } if (c++ < n) out += ch; } if ((out.match(/\*/g) || []).length % 2) out += '*'; txt = out; }
    richText(ctx, txt, 0, (i - (lines.length - 1) / 2) * size * (e.lineH ?? 1.18), {font: e.font || 'M900', size, color: e.color || '#FFFFFF', keyColor: e.keyColor, strokeW: e.strokeW, stroke: e.stroke, shadow: e.shadow, shadowColor: e.shadowColor, shadowBlur: e.shadowBlur, letter: e.letter, align: e.align}); });
  ctx.restore();
}

// ---------- arrows ----------
function arrow(ctx, e, t, s, v) {
  let P = pts(s, v, e); if (P.length < 2) return; if (e.smooth) P = chaikin(chaikin(P));
  const g = grow(e, t), a = alpha(e, t), V = e.variant || 'green'; if (g <= 0) return;
  const Q = partial(P, g).pts, hd = pointAt(Q, 1); ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
  if (V === 'green') { // bds-navy: white→green gradient shaft, green head, glow
    const w = e.width ?? 11, p0 = Q[0], gr = ctx.createLinearGradient(p0[0], p0[1], hd.x, hd.y); gr.addColorStop(0, 'rgba(255,255,255,.15)'); gr.addColorStop(0.45, 'rgba(225,255,225,.85)'); gr.addColorStop(1, e.color || '#27E45A');
    ctx.shadowColor = e.color || '#27E45A'; ctx.shadowBlur = 14; ctx.strokeStyle = gr; ctx.lineWidth = w; const L = pathLen(Q); stroke(ctx, sub(Q, 0, Math.max(0.01, 1 - w * 1.6 / Math.max(L, 1))));
    ctx.fillStyle = e.color || '#27E45A'; ctx.translate(hd.x, hd.y); ctx.rotate(hd.ang); ctx.beginPath(); ctx.moveTo(w * 1.6, 0); ctx.lineTo(-w * 1.4, -w * 1.5); ctx.lineTo(-w * 1.4, w * 1.5); ctx.closePath(); ctx.fill();
  } else if (V === 'dash') { // bds-geo: chunky white dashes with dark edge, white head
    const w = e.width ?? 13; ctx.setLineDash([w * 1.5, w * 0.9]); ctx.strokeStyle = 'rgba(20,20,20,.85)'; ctx.lineWidth = w + 5; stroke(ctx, Q); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = w; stroke(ctx, Q); ctx.setLineDash([]);
    if (e.head !== false) { ctx.translate(hd.x, hd.y); ctx.rotate(hd.ang); ctx.beginPath(); ctx.moveTo(w * 2.2, 0); ctx.lineTo(-w * 0.6, -w * 1.6); ctx.lineTo(-w * 0.6, w * 1.6); ctx.closePath(); ctx.lineWidth = 3; ctx.strokeStyle = '#1A1A1A'; ctx.stroke(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); }
  } else { // ydash (bds-capcut): thin yellow dashes
    const w = e.width ?? 5; ctx.setLineDash([w * 2.6, w * 2]); ctx.strokeStyle = e.color || '#FFE600'; ctx.lineWidth = w; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 4; stroke(ctx, Q);
  }
  ctx.restore();
  if (e.label && g > 0.5) { const m = pointAt(P, e.labelAt ?? 0.5); let an = m.ang; if (an > Math.PI / 2) an -= Math.PI; if (an < -Math.PI / 2) an += Math.PI; ctx.save(); ctx.globalAlpha = a * clamp((g - 0.5) / 0.3); ctx.translate(m.x - Math.sin(m.ang) * (e.labelOff ?? 34), m.y + Math.cos(m.ang) * (e.labelOff ?? 34)); ctx.rotate(e.labelRotate ?? an);
    richText(ctx, e.label, 0, 0, V === 'dash' ? {font: 'M800', size: e.labelSize ?? 34, color: '#FFE600', strokeW: 4, stroke: '#1A1A1A'} : {font: 'M800i', size: e.labelSize ?? 34, color: '#FFFFFF', shadowBlur: 8}); ctx.restore(); }
}

// ---------- radius ring / radar ----------
function ring(ctx, e, t, s, v) {
  const [x, y] = at(s, v, e, t), lt = local(e, t) - (e.delay ?? 0), a = alpha(e, t); if (lt < 0) return;
  const R0 = e.radiusM && v ? e.radiusM * metersPx(v, e.geo[0]) : (e.r ?? 400), k = easeOut(clamp(lt / (e.enterDur ?? 0.6))), R = R0 * k, sq = e.squash ?? (v?.tilt ? Math.cos(v.tilt * Math.PI / 180) : 1);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(1, sq);
  if ((e.variant || 'thin') === 'radar') {
    ctx.fillStyle = 'rgba(255,240,40,.17)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
    const an = (e.sweepStart ?? -2.2) + lt * (e.sweepSpeed ?? 1.1), wd = e.sweepWidth ?? 0.95; ctx.fillStyle = 'rgba(255,245,60,.33)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, an, an + wd); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,248,120,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(an + wd) * R, Math.sin(an + wd) * R); ctx.stroke();
    ctx.shadowColor = '#FFF200'; ctx.shadowBlur = 12; ctx.strokeStyle = '#F4F43C'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke(); ctx.shadowBlur = 0;
    if (e.label && k > 0.6) { ctx.globalAlpha = a * clamp((k - 0.6) / 0.3); ctx.font = fnt('inter', e.labelSize ?? 34); const txt = e.label, ang0 = (e.labelAngle ?? 128) * Math.PI / 180, rad = R - (e.labelSize ?? 34) * 0.85; let tot = 0; for (const ch of txt) tot += ctx.measureText(ch).width; let an2 = ang0 + tot / rad / 2;
      ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 8; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; for (const ch of txt) { const cw = ctx.measureText(ch).width; an2 -= cw / rad / 2; ctx.save(); ctx.rotate(an2); ctx.translate(rad, 0); ctx.rotate(-Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore(); an2 -= cw / rad / 2; } }
  } else { ctx.shadowColor = 'rgba(255,230,90,.7)'; ctx.shadowBlur = 6; ctx.strokeStyle = e.color || 'rgba(238,214,80,.9)'; ctx.lineWidth = e.width ?? 2.5; if (e.dashed) ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke(); }
  ctx.restore();
}

// ---------- land lot ----------
function lot(ctx, e, t, s, v) {
  const P = pts(s, v, e); if (P.length < 3) return; const lt = local(e, t) - (e.delay ?? 0), a = alpha(e, t), V = e.variant || 'blue'; if (lt < 0) return;
  const kS = clamp(lt / 0.5), kF = clamp((lt - 0.25) / 0.35), kT = clamp((lt - 0.5) / 0.35); const cx = P.reduce((q, p) => q + p[0], 0) / P.length, cy = P.reduce((q, p) => q + p[1], 0) / P.length;
  const C = {blue: ['#8FEAFF', '#00C8FF'], yellow: ['#FFE600', '#FFE600'], magenta: ['#FF5BE6', '#FF2BD6']}[V];
  ctx.save(); ctx.globalAlpha = a * kF;
  if (V === 'blue') { const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(...P.map(p => Math.hypot(p[0] - cx, p[1] - cy)))); gr.addColorStop(0, 'rgba(70,170,255,.55)'); gr.addColorStop(1, 'rgba(25,120,255,.8)'); ctx.fillStyle = gr; }
  else ctx.fillStyle = V === 'yellow' ? 'rgba(255,226,0,.36)' : 'rgba(255,40,210,.5)';
  fillP(ctx, P); ctx.globalAlpha = a; ctx.lineJoin = 'round';
  const per = [...P, P[0]], Q = partial(per, ease(kS)).pts; ctx.strokeStyle = C[0]; ctx.shadowColor = C[1]; ctx.shadowBlur = V === 'blue' ? 26 : 8; ctx.lineWidth = V === 'blue' ? 6 : 3.5; stroke(ctx, Q); if (V === 'blue') stroke(ctx, Q); ctx.shadowBlur = 0;
  if (e.area && kT > 0) { const q = backOut(kT); ctx.save(); ctx.translate(cx + (e.textDx ?? 0), cy + (e.textDy ?? 0)); if (e.textRotate) ctx.rotate(e.textRotate * Math.PI / 180); ctx.scale(q, q); ctx.globalAlpha = a * clamp(kT * 3);
    if (V === 'blue') richText(ctx, e.area, 0, 0, {font: 'M900', size: e.areaSize ?? 82, color: '#FFE23A', strokeW: 5, stroke: '#2A2400', shadowBlur: 10});
    else richText(ctx, e.area, 0, 0, {font: 'M800i', size: e.areaSize ?? 54, color: '#5FE6FF', strokeW: 5, stroke: '#0B2550', shadowBlur: 6});
    if (e.sub) richText(ctx, e.sub, 0, (e.areaSize ?? 54) * 0.95, {font: 'M800i', size: (e.areaSize ?? 54) * 0.68, color: '#FF35DA', strokeW: 4, stroke: '#2A0626', shadowBlur: 4});
    ctx.restore(); }
  (e.dims || []).forEach((d, i) => { const kd = clamp((lt - 0.8 - i * 0.45) / 0.35); if (kd <= 0) return; const A = P[d.edge], B = P[(d.edge + 1) % P.length], an = Math.atan2(B[1] - A[1], B[0] - A[0]), nx = Math.sin(an), ny = -Math.cos(an), off = (d.off ?? 28) * (d.side ?? 1);
    const a1 = [A[0] + nx * off, A[1] + ny * off], b1 = [B[0] + nx * off, B[1] + ny * off], m = [(a1[0] + b1[0]) / 2, (a1[1] + b1[1]) / 2], h = ease(kd);
    ctx.save(); ctx.globalAlpha = a * clamp(kd * 2); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 4;
    const p0 = [m[0] + (a1[0] - m[0]) * h, m[1] + (a1[1] - m[1]) * h], p1 = [m[0] + (b1[0] - m[0]) * h, m[1] + (b1[1] - m[1]) * h]; stroke(ctx, [p0, p1]);
    for (const p of [p0, p1]) stroke(ctx, [[p[0] - nx * 9, p[1] - ny * 9], [p[0] + nx * 9, p[1] + ny * 9]]);
    let ta = an; if (ta > Math.PI / 2) ta -= Math.PI; if (ta < -Math.PI / 2) ta += Math.PI; ctx.translate(m[0] + nx * (d.textOff ?? 30) * (d.side ?? 1), m[1] + ny * (d.textOff ?? 30) * (d.side ?? 1)); ctx.rotate(ta);
    richText(ctx, d.text, 0, 0, {font: 'M900', size: d.size ?? 38, color: '#FFFFFF', strokeW: 4, stroke: '#151515', shadowBlur: 6}); ctx.restore(); });
  ctx.restore();
}

// ---------- boundaries / zones / neon shapes ----------
function boundary(ctx, e, t, s, v) {
  const polys = e.polys ? e.polys.map(p => p.map(q => pt(s, v, e, q, e.polysKind || 'path'))) : [pts(s, v, e)];
  const lt = local(e, t) - (e.delay ?? 0), a = alpha(e, t); if (lt < 0) return;
  const g = e.grow ? clamp((lt - (e.grow.at ?? 0)) / (e.grow.dur ?? 1)) : 1, kF = e.fill ? clamp((lt - (e.fillAt ?? (e.grow ? (e.grow.at ?? 0) + (e.grow.dur ?? 1) * 0.7 : 0))) / 0.4) : 0, c = e.color || '#3DFF63';
  ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  for (const P0 of polys) { const P = e.smooth === false ? P0 : chaikin(P0); if (P.length < 2) continue;
    if (kF > 0) { ctx.save(); ctx.globalAlpha = a * kF * (e.fillAlpha ?? 0.45); ctx.fillStyle = e.fill; if (e.innerGlow) { ctx.shadowColor = '#FFFFFF'; ctx.shadowBlur = 30; } fillP(ctx, P); ctx.restore();
      if (e.hatch) { ctx.save(); ctx.globalAlpha = a * kF * 0.55; ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.clip(); ctx.strokeStyle = e.hatchColor || c; ctx.lineWidth = 1.5; const xs = P.map(p => p[0]), ys = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys); for (let d = x0 - (y1 - y0); d < x1; d += e.hatch === true ? 9 : e.hatch) { ctx.beginPath(); ctx.moveTo(d, y1); ctx.lineTo(d + (y1 - y0), y0); ctx.stroke(); } ctx.restore(); } }
    const Q = partial(e.open ? P : [...P, P[0]], g).pts; if (e.width === 0) continue;
    ctx.strokeStyle = c; if (e.glow !== false) { ctx.shadowColor = c; ctx.shadowBlur = e.glowBlur ?? 16; ctx.globalAlpha = a * 0.5; ctx.lineWidth = (e.width ?? 5) * 2.2; stroke(ctx, Q); ctx.globalAlpha = a; }
    ctx.lineWidth = e.width ?? 5; stroke(ctx, Q); ctx.shadowBlur = 0;
    if (e.core) { ctx.strokeStyle = e.core; ctx.lineWidth = (e.width ?? 5) * 0.35; stroke(ctx, Q); }
    if (e.rungs && P0.length >= 4 && g >= 1) { const [A, B, C, D] = P0; ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8; ctx.lineWidth = Math.max(1.5, (e.width ?? 5) * 0.45); for (let i = 1; i < e.rungs; i++) { const u = i / e.rungs; stroke(ctx, [[A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u], [D[0] + (C[0] - D[0]) * u, D[1] + (C[1] - D[1]) * u]]); } }
  }
  if (e.label) { const k = clamp((lt - (e.labelAt ?? 0.3)) / 0.4); if (k > 0) { let x, y; if (e.labelGeo && v) [x, y] = project(v, s, e.labelGeo[0], e.labelGeo[1]); else { const P = polys[0]; x = P.reduce((q, p) => q + p[0], 0) / P.length; y = P.reduce((q, p) => q + p[1], 0) / P.length; }
    ctx.globalAlpha = a * k; richText(ctx, e.label, x + (e.labelDx ?? 0), y + (e.labelDy ?? 0), {font: e.labelFont || 'M900', size: e.labelSize ?? 48, color: e.labelColor || '#FFFFFF', strokeW: e.labelStroke ?? 0, stroke: '#0E2A1E', shadowColor: 'rgba(0,0,0,.6)', shadowBlur: 10}); } }
  ctx.restore();
}

// ---------- big icon (plane, star) ----------
function icon(ctx, e, t, s, v) {
  const [x, y] = at(s, v, e, t), k = backOut(enterK(e, t, 0.45)), a = alpha(e, t) * clamp(enterK(e, t, 0.45) * 3), sz = e.size ?? 90;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate((e.rotate ?? 0) * Math.PI / 180); ctx.scale(k, k);
  if (e.glow !== false) { ctx.shadowColor = e.glowColor || e.color || '#E6FF3A'; ctx.shadowBlur = sz * 0.3; }
  if (e.outline) { ctx.save(); ctx.scale(1.12, 1.12); drawIcon(ctx, e.icon, sz, e.outline); ctx.restore(); }
  drawIcon(ctx, e.icon || 'plane', sz, e.color || '#E6FF3A'); ctx.restore();
  if (e.label) { ctx.save(); ctx.globalAlpha = a * clamp((local(e, t) - 0.25) / 0.3); richText(ctx, e.label, x + (e.labelDx ?? sz * 0.7), y + (e.labelDy ?? 0), {font: e.labelFont || 'inter', size: e.labelSize ?? 34, color: e.labelColor || '#FFE600', align: 'left', strokeW: 0, shadowColor: 'rgba(0,0,0,.8)', shadowBlur: 8}); ctx.restore(); }
}

// ---------- full-frame colour / fade ----------
function tint(ctx, e, t, s) { const tr = sampleTrack(e.track, t, ['alpha']); ctx.save(); ctx.globalAlpha = (tr.alpha ?? e.alpha ?? 0.2) * (e.from !== undefined || e.to !== undefined ? fadeA({...e, alpha: 1}, t) : 1); ctx.globalCompositeOperation = e.blend || 'source-over'; ctx.fillStyle = e.color || '#000'; ctx.fillRect(0, 0, s.width, s.height); ctx.restore(); }

// ---------- sky + haze above a tilted map horizon (pseudo-flycam for bds-drone) ----------
function sky(ctx, e, t, s, v) {
  const hz = e.horizon ?? v?.horizon ?? 560, W = s.width, k = local(e, t);
  ctx.save(); ctx.globalAlpha = alpha(e, t);
  let g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, e.top || '#3E86C8'); g.addColorStop(0.55, e.mid || '#7FB6E0'); g.addColorStop(1, e.low || '#CFE3EE'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz);
  // cumulus clouds: many soft puffs with a flat, slightly grey base, drifting slowly
  let r = 7 + (e.seed ?? 3); const R = () => (r = (r * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < (e.clouds ?? 7); i++) {
    const base = 140 + R() * (hz - 200), sz = 90 + R() * 150, cx = ((R() * (W + 600) + k * (e.drift ?? 6) * (0.5 + R())) % (W + 600)) - 300, n = 26 + (R() * 14 | 0);
    ctx.save(); ctx.beginPath(); ctx.rect(cx - sz * 3, base - sz * 2.2, sz * 6, sz * 2.2 + sz * 0.12); ctx.clip();
    for (let j = 0; j < n; j++) { const u = R() * 2 - 1, ox = u * sz * 1.6, hgt = (1 - u * u) * sz * 0.9, oy = -R() * hgt - sz * 0.05, rad = sz * (0.16 + R() * 0.26) * (1 - Math.abs(u) * 0.4);
      const shade = clamp(1 + oy / (sz * 0.9)), gg = ctx.createRadialGradient(cx + ox - rad * 0.25, base + oy - rad * 0.35, rad * 0.05, cx + ox, base + oy, rad);
      const c0 = `rgba(${255 - 30 * shade | 0},${255 - 24 * shade | 0},${255 - 16 * shade | 0},`; gg.addColorStop(0, c0 + '.95)'); gg.addColorStop(0.55, c0 + '.75)'); gg.addColorStop(1, c0 + '0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx + ox, base + oy, rad, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  // distant haze over the far city, fading down
  const hzH = e.haze ?? 420; g = ctx.createLinearGradient(0, hz - 60, 0, hz + hzH); g.addColorStop(0, 'rgba(207,227,238,0)'); g.addColorStop(60 / (hzH + 60), 'rgba(207,227,238,.9)'); g.addColorStop(120 / (hzH + 60), 'rgba(203,223,235,.55)'); g.addColorStop(240 / (hzH + 60), 'rgba(198,218,232,.25)'); g.addColorStop(1, 'rgba(190,210,225,0)'); ctx.fillStyle = g; ctx.fillRect(0, hz - 60, W, hzH + 60);
  ctx.restore();
}

const PAINT = {sky, bgphoto, neon, pin, card, tagbox, btext, arrow, ring, lot, boundary, icon, tint};
export function drawBds(ctx, e, t, s, v) { PAINT[e.type](ctx, e, t, s, v); }

// ---------- motion blur on fast map zooms / explicit blur track (shot.zoomBlur, shot.blur) ----------
let tmpCv = null;
export function postFx(ctx, cv, s, sh, t) {
  let amt = 0;
  if (sh.zoomBlur && sh.view) { const dt = 1 / s.fps, z0 = sampleView(sh.view, Math.max(0, t - dt))?.zoom ?? 0, z1 = sampleView(sh.view, t + dt)?.zoom ?? 0; amt = clamp(Math.abs(z1 - z0) / (2 * dt) * 0.018 * (sh.zoomBlur === true ? 1 : sh.zoomBlur), 0, 0.14); }
  const bt = sampleTrack(sh.blur, t, ['amount']); if (bt.amount) amt = Math.max(amt, bt.amount);
  if (amt < 0.004) return;
  if (!tmpCv || tmpCv.width !== s.width || tmpCv.height !== s.height) tmpCv = createCanvas(s.width, s.height);
  const tc = tmpCv.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.drawImage(cv, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const n = 7;
  for (let i = 1; i <= n; i++) { const sc = 1 + amt * i / n; ctx.globalAlpha = 0.9 / (i + 1); ctx.drawImage(tmpCv, s.width / 2 * (1 - sc), s.height / 2 * (1 - sc), s.width * sc, s.height * sc); }
  ctx.restore();
}
