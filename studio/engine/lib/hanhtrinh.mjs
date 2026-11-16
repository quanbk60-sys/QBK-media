// Phong cách "bds-hanh-trinh" (BĐS · Hành trình tiện ích): học từ mẫu người dùng gửi 16/11/2026
// (studio/references/bds-hanh-trinh-tien-ich/card.md). Một chuyến bay liên tục trên vệ tinh tối, đèn rọi theo tuyến đường,
// ghim dự án cam, ghim điểm đến theo màu chuyên mục, thẻ thông tin đếm km/phút, thanh chuyên mục, chữ chương (viết tay + chữ đậm hẹp),
// vòng tổng kết "trong vòng 10 phút". Định dạng: SCENE_FORMAT.md, mục "Phong cách BĐS Hành trình tiện ích".
import {createCanvas} from '@napi-rs/canvas';
import {clamp, ease, backOut} from './math.mjs';
import {GEO_TYPES, PAINT, F, project, chaikin, partial, local, fadeA, rr} from './geo.mjs';
import {POI_ICONS} from './tienich.mjs';

export const HT_TYPES = ['spot', 'homepin', 'catpin', 'infocard', 'tabs', 'chaptitle', 'ringzone', 'legend', 'chips', 'titleglow'];
export const CAT = {du: '#FF8A3D', mua: '#FF8A3D', viec: '#4FC3FF', van: '#4FC3FF', y: '#FF4D6D', giao: '#4CE36B', ket: '#D266FF', ring: '#E8F04A', amber: '#FFC23A'};
const cc = c => CAT[c] || c || CAT.amber;
const COND = 'HTCond', SCRIPT = 'HTScript';
const hexA = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const P = (v, s, g) => project(v, s, g[0], g[1]);

// đèn rọi: phủ tối cả khung, khoét sáng mềm quanh các điểm (geo) và dọc tuyến đường đang chạy (routes: [{path, grow:{at,dur}, from}])
let _spot = null;
function spot(ctx, e, t, s, v) {
  if (!v) return; const W = s.width, H = s.height; if (!_spot || _spot.width !== W) _spot = createCanvas(W, H);
  const m = _spot.getContext('2d'), a = fadeA({...e, enter: e.enter ?? 'none'}, t);
  m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.fillStyle = `rgba(0,0,0,${e.dark ?? 0.62})`; m.fillRect(0, 0, W, H);
  m.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, k = 1) => { const g = m.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${k})`); g.addColorStop(0.55, `rgba(0,0,0,${0.75 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); m.fillStyle = g; m.beginPath(); m.arc(x, y, r, 0, Math.PI * 2); m.fill(); };
  for (const g of e.points || []) { const [x, y] = P(v, s, g.geo || g); hole(x, y, g.r ?? e.r ?? 330); }
  for (const R of e.routes || []) {
    const lt = local(e, t) - (R.from ?? 0), p = clamp((lt - (R.grow?.at ?? 0)) / (R.grow?.dur ?? 1)); if (p <= 0) continue;
    const pts = partial(R.path.map(q => P(v, s, q)), p).pts; let acc = 0;
    for (let i = 0; i < pts.length; i++) { if (i) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (i === 0 || i === pts.length - 1 || acc > 70) { hole(pts[i][0], pts[i][1], R.r ?? e.routeR ?? 230, 0.9); acc = 0; } }
  }
  ctx.save(); ctx.globalAlpha = a; ctx.drawImage(_spot, 0, 0); ctx.restore();
}

function pinLabel(ctx, x, y, text, color, size = 24) {
  ctx.font = `${size}px ${F.black}`; ctx.letterSpacing = '1px'; const tw = ctx.measureText(text).width, w = tw + size * 1.1, h = size * 1.6;
  const x0 = Math.max(24, Math.min(1056 - w, x - w / 2));
  ctx.fillStyle = 'rgba(14,16,24,.9)'; rr(ctx, x0, y - h / 2, w, h, h / 2); ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x0 + w / 2, y + 1);
}
function disc(ctx, x, y, r, color, icon) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.18, color); g.addColorStop(1, hexA(color, 1));
  ctx.shadowColor = color; ctx.shadowBlur = 26; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = g; ctx.globalAlpha *= 0.55; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha /= 0.55;
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.save(); ctx.translate(x, y); ctx.scale(r / 26, r / 26); ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; (POI_ICONS[icon] || POI_ICONS.star)(ctx); ctx.restore();
}

// ghim dự án: đĩa cam icon nhà, nhãn vàng cam phát sáng phía trên, vòng trắng mảnh đánh dấu lô phía dưới
function homepin(ctx, e, t, s, v) {
  const [x, y] = P(v, s, e.geo), k = local(e, t), a = fadeA({...e, enter: 'none'}, t), pop = e.instant ? 1 : backOut(clamp(k / 0.45)); if (pop <= 0) return;
  const r = (e.size ?? 30) * pop, by = y - (e.lift ?? 58);
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, (e.ring ?? 34) * pop, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = CAT.amber; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, by + r); ctx.stroke();
  disc(ctx, x, by, r, '#FF9A2A', 'home');
  if (e.label) { ctx.font = `${e.labelSize ?? 34}px ${COND}`; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.shadowColor = '#FF9A2A'; ctx.shadowBlur = 18; ctx.fillStyle = '#FFD36A'; ctx.fillText(e.label.toUpperCase(), x, by - r - 12); ctx.shadowBlur = 0; }
  ctx.restore();
}
// ghim điểm đến: đĩa màu chuyên mục + icon, cuống, nhãn pill tối viền màu
function catpin(ctx, e, t, s, v) {
  const [x, y] = P(v, s, e.geo), k = local(e, t), a = fadeA({...e, enter: 'none'}, t), pop = backOut(clamp(k / 0.4)); if (pop <= 0) return;
  const c = cc(e.color), r = (e.size ?? 24) * pop, by = y - 40;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, by + r); ctx.stroke();
  ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
  disc(ctx, x, by, r, c, e.icon);
  if (e.label) { ctx.globalAlpha = a * clamp((k - 0.2) / 0.3); const below = e.side === 'below'; pinLabel(ctx, x + (e.ldx ?? 0), below ? y + 40 : by - r - 30, e.label.toUpperCase(), c, e.labelSize ?? 24); }
  ctx.restore();
}

// thẻ thông tin dưới: chuyên mục, tên (đậm hẹp, xuống dòng), dòng phụ, km đếm lên theo tuyến, phút hiện sau
function wrap(ctx, text, maxW) { const w = text.split(' '), lines = []; let cur = ''; for (const x of w) { const tst = cur ? cur + ' ' + x : x; if (ctx.measureText(tst).width > maxW && cur) { lines.push(cur); cur = x; } else cur = tst; } if (cur) lines.push(cur); return lines; }
function infocard(ctx, e, t, s) {
  const k = local(e, t), a = fadeA(e, t), c = cc(e.color), W = s.width, x0 = e.x ?? 46, w = e.w ?? W - 92, y0 = e.y ?? 1190;
  const nameSize = e.nameSize ?? 64; ctx.save(); ctx.font = `${nameSize}px ${COND}`; ctx.letterSpacing = '1px'; const lines = wrap(ctx, e.name.toUpperCase(), w - 64).slice(0, 2);
  const h = 70 + lines.length * nameSize * 1.08 + (e.sub ? 40 : 0) + 120, rise = (1 - ease(clamp(k / 0.35))) * 40;
  ctx.globalAlpha = a; ctx.translate(0, rise);
  ctx.shadowColor = c; ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(9,11,20,.9)'; rr(ctx, x0, y0, w, h, 18); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.stroke();
  let y = y0 + 48; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = `24px ${F.black}`; ctx.letterSpacing = '4px'; ctx.fillStyle = c; ctx.fillText((e.cat || '').toUpperCase(), x0 + 32, y);
  ctx.font = `${nameSize}px ${COND}`; ctx.letterSpacing = '1px'; ctx.fillStyle = '#FFFFFF';
  for (const L of lines) { y += nameSize * 1.05; ctx.fillText(L, x0 + 32, y); }
  if (e.sub) { y += 40; ctx.font = `24px ${F.bold}`; ctx.letterSpacing = '0px'; ctx.fillStyle = '#B9BEC9'; ctx.fillText(e.sub, x0 + 32, y); }
  y += 104;
  if (e.km !== undefined) {
    const q = ease(clamp((k - (e.countAt ?? 0.3)) / (e.countDur ?? 1.0))), dec = String(e.km).includes('.') ? String(e.km).split('.')[1].length : 0;
    const val = (e.km * q).toFixed(dec).replace('.', ',');
    ctx.font = `104px ${COND}`; ctx.letterSpacing = '0px'; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 16; ctx.fillText(val, x0 + 30, y); ctx.shadowBlur = 0;
    let x = x0 + 30 + ctx.measureText(val).width + 12; ctx.font = `30px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText(e.unit || 'KM', x, y - 4); x += ctx.measureText(e.unit || 'KM').width + 28;
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 80); ctx.lineTo(x, y + 6); ctx.stroke(); x += 28;
    const mk = clamp((k - (e.minAt ?? (e.countAt ?? 0.3) + (e.countDur ?? 1.0) + 0.1)) / 0.3);
    if (e.min !== undefined && mk > 0) { ctx.globalAlpha = a * mk; ctx.font = `104px ${COND}`; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 16; ctx.fillText(String(e.min), x, y); ctx.shadowBlur = 0; x += ctx.measureText(String(e.min)).width + 12; ctx.font = `30px ${F.black}`; ctx.fillStyle = '#FFFFFF'; ctx.fillText('PHÚT', x, y - 4); }
  }
  ctx.restore();
}

// thanh chuyên mục: pill đang xem sáng màu, pill khác tối
function tabs(ctx, e, t, s) {
  const a = fadeA(e, t), items = e.items || [], y = e.y ?? 236, gap = 12, size = 24; ctx.save(); ctx.globalAlpha = a; ctx.font = `${size}px ${F.black}`; ctx.letterSpacing = '1px';
  const ws = items.map(it => ctx.measureText(it.text.toUpperCase()).width + 44), tot = ws.reduce((p, q) => p + q, 0) + gap * (items.length - 1), sc = Math.min(1, (s.width - 60) / tot);
  let x = (s.width - tot * sc) / 2; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  items.forEach((it, i) => { const w = ws[i] * sc, h = 46, c = cc(it.color), on = it.key === e.active;
    ctx.fillStyle = on ? c : hexA(c.startsWith('#') ? c : '#888888', 0.22); rr(ctx, x, y - h / 2, w, h, h / 2); ctx.fill();
    if (on) { ctx.shadowColor = c; ctx.shadowBlur = 16; ctx.fill(); ctx.shadowBlur = 0; }
    ctx.fillStyle = on ? '#FFFFFF' : 'rgba(255,255,255,.82)'; ctx.font = `${Math.round(size * sc)}px ${F.black}`; ctx.fillText(it.text.toUpperCase(), x + w / 2, y + 1); x += w + gap * sc; });
  ctx.restore();
}

// chữ chương: dòng viết tay trắng + chữ đậm hẹp to màu, quầng
function chaptitle(ctx, e, t, s) {
  const k = local(e, t), a = fadeA(e, t), c = cc(e.color), x = e.x ?? s.width / 2, y = e.y ?? 880; ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (e.lead) { const q = clamp(k / 0.5); ctx.globalAlpha = a * q; ctx.font = `${e.leadSize ?? 54}px ${SCRIPT}`; ctx.letterSpacing = '0px'; ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 12; ctx.fillText(e.lead, x, y - (e.size ?? 120) * 0.92); }
  const q = clamp((k - 0.25) / 0.45); ctx.globalAlpha = a * q; const sz = (e.size ?? 120) * (0.9 + 0.1 * backOut(q));
  ctx.font = `${Math.round(sz)}px ${COND}`; ctx.letterSpacing = '2px'; const txt = e.text.toUpperCase();
  ctx.shadowColor = c; ctx.shadowBlur = 34; ctx.fillStyle = c; ctx.fillText(txt, x, y); ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.fillText(txt, x, y);
  if (e.tail) { ctx.font = `${e.tailSize ?? 46}px ${SCRIPT}`; ctx.letterSpacing = '0px'; ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 12; ctx.globalAlpha = a * clamp((k - 0.6) / 0.4); ctx.fillText(e.tail, x, y + (e.tailSize ?? 46) * 1.3); }
  ctx.restore();
}

// vòng tổng kết: vòng vàng chanh phát sáng quanh dự án, ngoài vòng tối gần đen
function ringzone(ctx, e, t, s, v) {
  const [x, y] = e.geo && v ? P(v, s, e.geo) : [e.x ?? 540, e.y ?? 720], k = local(e, t), a = fadeA({...e, enter: 'none'}, t), q = ease(clamp(k / 0.8)), r = (e.r ?? 440) * (0.7 + 0.3 * q), c = cc(e.color || 'ring');
  ctx.save(); ctx.globalAlpha = a * q; ctx.fillStyle = `rgba(0,0,0,${e.dark ?? 0.82})`; ctx.beginPath(); ctx.rect(0, 0, s.width, s.height); ctx.arc(x, y, r, 0, Math.PI * 2, true); ctx.fill('evenodd');
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r); g.addColorStop(0, 'rgba(232,240,74,0)'); g.addColorStop(1, 'rgba(232,240,74,.16)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.shadowColor = c; ctx.shadowBlur = 28; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(clamp(k / 0.9))); ctx.stroke();
  ctx.restore();
}
// danh sách tổng kết: thanh màu bên trái, nhãn trắng, số phút màu
function legend(ctx, e, t, s) {
  const k = local(e, t), a = fadeA(e, t), x0 = e.x ?? 40, w = e.w ?? s.width - 80, y0 = e.y ?? 1260, rh = e.rowH ?? 70; ctx.save();
  (e.items || []).forEach((it, i) => { const q = clamp((k - i * (e.stagger ?? 0.5)) / 0.35); if (q <= 0) return; const c = cc(it.color), y = y0 + i * rh;
    ctx.globalAlpha = a * q; const sx = (1 - ease(q)) * -40;
    ctx.fillStyle = 'rgba(10,12,20,.78)'; rr(ctx, x0 + sx, y, w, rh - 12, 8); ctx.fill(); ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 10; rr(ctx, x0 + sx, y, 8, rh - 12, 4); ctx.fill(); ctx.shadowBlur = 0;
    ctx.font = `32px ${F.bold}`; ctx.letterSpacing = '0px'; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(it.text, x0 + sx + 30, y + (rh - 12) / 2 + 2);
    ctx.textAlign = 'right'; ctx.font = `24px ${F.black}`; ctx.fillText('PHÚT', x0 + sx + w - 22, y + (rh - 12) / 2 + 6); const pw = ctx.measureText('PHÚT').width;
    ctx.font = `56px ${COND}`; ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 12; ctx.fillText(String(it.value), x0 + sx + w - 34 - pw, y + (rh - 12) / 2 + 2); ctx.shadowBlur = 0; });
  ctx.restore();
}
// chip địa chỉ: pill tối viền mảnh, xếp dọc giữa khung
function chips(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: 'none'}, t); let y = e.y ?? 420; ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  (e.items || []).forEach((txt, i) => { const q = clamp((k - i * 0.25) / 0.35); if (q > 0) { ctx.globalAlpha = a * q; ctx.font = `34px ${F.bold}`; ctx.letterSpacing = '0px'; const w = ctx.measureText(txt).width + 50, h = 58;
    ctx.fillStyle = 'rgba(12,14,20,.85)'; rr(ctx, s.width / 2 - w / 2, y - h / 2, w, h, h / 2); ctx.fill(); ctx.strokeStyle = 'rgba(255,214,120,.55)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#FFFFFF'; ctx.fillText(txt, s.width / 2, y + 2); } y += 74; });
  ctx.restore();
}
// tiêu đề dự án: chữ đậm hẹp vàng cam phát sáng
function titleglow(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: 'none'}, t), q = clamp(k / 0.5), y = e.y ?? 330, sz = (e.size ?? 150) * (1.15 - 0.15 * ease(q));
  ctx.save(); ctx.globalAlpha = a * q; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = `${Math.round(sz)}px ${COND}`; ctx.letterSpacing = '2px';
  const txt = e.text.toUpperCase(); let fs = sz; while (ctx.measureText(txt).width > s.width - 70 && fs > 60) { fs -= 4; ctx.font = `${Math.round(fs)}px ${COND}`; }
  const g = ctx.createLinearGradient(0, y - fs, 0, y); g.addColorStop(0, '#FFE07A'); g.addColorStop(1, '#FF9A2A');
  ctx.shadowColor = '#FF8A1F'; ctx.shadowBlur = 40; ctx.fillStyle = g; ctx.fillText(txt, s.width / 2, y); ctx.shadowBlur = 0; ctx.fillText(txt, s.width / 2, y);
  ctx.restore();
}

Object.assign(PAINT, {spot, homepin, catpin, infocard, tabs, chaptitle, ringzone, legend, chips, titleglow});
for (const ty of HT_TYPES) if (!GEO_TYPES.includes(ty)) GEO_TYPES.push(ty);
