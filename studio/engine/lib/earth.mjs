// Phong cách "bds-earth" (BĐS · Google Earth tối): học từ mẫu người dùng gửi 15/11/2026 (studio/references/bds-google-earth-toi).
// Ảnh vệ tinh làm tối, ngả xanh, viền neon tự chạy có đầu sao chổi, thẻ nhãn "• TÊN" có đường dẫn, biển tên dự án trên cột,
// thẻ ảnh bo góc, chữ to giãn chữ (trắng + xanh chanh), số liệu đếm lên. Chuyển cảnh "zoomblur" (scene.mjs) như cú bay Google Earth.
// Định dạng: SCENE_FORMAT.md, mục "Phong cách BĐS Google Earth tối".
import {clamp, ease, backOut} from './math.mjs';
import {GEO_TYPES, PAINT, F, project, chaikin, partial, local, fadeA, rr} from './geo.mjs';

export const EARTH_TYPES = ['grade', 'outline', 'etag', 'sign', 'ecard', 'ebig', 'estat'];
export const EC = {lime: '#9BE85A', chanh: '#C9EC4A', mint: '#A9F2D9', magenta: '#FF4FCF', yellow: '#F3EE3C', white: '#FFFFFF', cyan: '#5CE1FF'};
const ec = c => EC[c] || c || EC.lime;
const W0 = 1080;

// chỉnh màu toàn khung sau satmap: giảm bão hòa, tối, ngả xanh rêu, viền tối
function grade(ctx, e, t, s) {
  const W = s.width, H = s.height, a = fadeA({...e, enter: e.enter ?? 'none'}, t);
  ctx.save(); ctx.globalAlpha = a;
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${e.desat ?? 0.62})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = e.tint || 'rgb(178,186,166)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  const v = ctx.createRadialGradient(W / 2, H * 0.47, H * 0.22, W / 2, H * 0.5, H * 0.72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,0,${e.vignette ?? 0.5})`);
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); ctx.restore();
}

// viền neon theo tọa độ: tự chạy từ điểm đầu (đầu sao chổi trắng), quầng nhiều lớp
function outline(ctx, e, t, s, v) {
  if (!v || !e.path?.length) return;
  let P = e.path.map(p => project(v, s, p[0], p[1]));
  if (e.closed !== false) P.push(P[0]);
  for (let i = 0; i < (e.smooth ?? 2); i++) P = chaikin(P);
  const d = e.draw || {}, at = d.at ?? 0, dur = d.dur ?? 1.4, k = clamp((local(e, t) - at) / dur), p = ease(k);
  if (p <= 0) return;
  const {pts} = partial(P, p), c = ec(e.color), w = e.width ?? 7, a = fadeA({...e, enter: e.enter ?? 'none'}, t);
  const stroke = (lw, al, blur, col) => { ctx.globalAlpha = a * al; ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.stroke(); };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (e.fill && p >= 1) { ctx.globalAlpha = a * e.fill * clamp((local(e, t) - at - dur) / 0.5); ctx.fillStyle = c; ctx.beginPath(); P.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.fill(); }
  stroke(w * 4.5, 0.18, 46, c); stroke(w * 2.2, 0.45, 24, c); stroke(w, 1, 10, c);
  ctx.shadowBlur = 0; stroke(Math.max(1.5, w * 0.3), 0.55, 0, '#FFFFFF');
  if (k < 1 && e.head !== false) { // đầu sao chổi
    const [hx, hy] = pts.at(-1), g = ctx.createRadialGradient(hx, hy, 0, hx, hy, w * 4.5);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, w * 4.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

const anchor = (e, s, v) => e.geo && v ? project(v, s, e.geo[0], e.geo[1]) : [e.x ?? 540, e.y ?? 960];

// thẻ nhãn tối "• TÊN", nối về điểm bằng đường mảnh, chấm sáng ở điểm
function etag(ctx, e, t, s, v) {
  const [px, py] = anchor(e, s, v), k = local(e, t), a = fadeA({...e, enter: 'none'}, t);
  const bx = px + (e.dx ?? 60), by = py + (e.dy ?? -70), size = e.size ?? 22, txt = '•  ' + e.text.toUpperCase();
  ctx.save(); ctx.globalAlpha = a;
  const dot = backOut(clamp(k / 0.3)); ctx.fillStyle = ec(e.color || 'chanh'); ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(px, py, 7 * dot, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(px, py, 13 * dot, 0, Math.PI * 2); ctx.stroke();
  const lk = clamp((k - 0.15) / 0.3); if (lk > 0 && (e.dx || e.dy || e.line !== false)) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (bx - px) * lk, py + (by - py) * lk); ctx.stroke(); }
  const bk = clamp((k - 0.35) / 0.3);
  if (bk > 0) {
    ctx.font = `${size}px ${F.black}`; ctx.letterSpacing = '2px'; const tw = ctx.measureText(txt).width, w = tw + size * 1.2, h = size * 1.75;
    let x0 = e.align === 'right' ? bx - w : e.align === 'center' ? bx - w / 2 : bx; x0 = Math.max(30, Math.min(s.width - 30 - w, x0));
    ctx.globalAlpha = a * bk; ctx.fillStyle = 'rgba(12,16,13,.88)'; rr(ctx, x0, by - h / 2, w, h, 6); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#F4F6EF'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x0 + size * 0.6, by + 1);
  }
  ctx.restore();
}

// biển tên dự án: thẻ trắng bo góc trên cột mảnh, chấm phát sáng ở chân
function sign(ctx, e, t, s, v) {
  const [px, py] = anchor(e, s, v), k = local(e, t), a = fadeA({...e, enter: 'none'}, t), pop = backOut(clamp(k / 0.45));
  const stick = e.stick ?? 80, name = (e.name || '').toUpperCase(), sub = (e.sub || '').toUpperCase();
  ctx.save(); ctx.globalAlpha = a * clamp(k / 0.15);
  ctx.fillStyle = ec(e.color || 'chanh'); ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 18; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
  const top = py - stick * pop; ctx.strokeStyle = ec(e.color || 'chanh'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, top); ctx.stroke();
  ctx.translate(px, top); ctx.scale(0.4 + 0.6 * pop, 0.4 + 0.6 * pop);
  ctx.font = `${e.size ?? 34}px ${F.black}`; ctx.letterSpacing = '3px'; const w1 = ctx.measureText(name).width;
  ctx.font = `${Math.round((e.size ?? 34) * 0.45)}px ${F.bold}`; ctx.letterSpacing = '3px'; const w2 = ctx.measureText(sub).width;
  const w = Math.max(w1, w2) + 60, h = (e.size ?? 34) * (sub ? 2.3 : 1.7);
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 22; ctx.shadowOffsetY = 6; ctx.fillStyle = '#FBFCF8'; rr(ctx, -w / 2, -h, w, h, 10); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'rgba(40,70,40,.25)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${e.size ?? 34}px ${F.black}`; ctx.letterSpacing = '3px'; ctx.fillStyle = e.ink || '#2F6B2A';
  ctx.fillText(name, 0, sub ? -h * 0.62 : -h / 2);
  if (sub) { ctx.font = `${Math.round((e.size ?? 34) * 0.45)}px ${F.bold}`; ctx.fillStyle = '#6E7A6A'; ctx.fillText(sub, 0, -h * 0.26); }
  ctx.restore();
}

// thẻ ảnh bo góc, viền tối, bật lên
function ecard(ctx, e, t, s) {
  const im = s._photos?.get(e.path); if (!im) return;
  const k = local(e, t), a = fadeA(e, t), pop = backOut(clamp(k / 0.4)), w = e.w ?? 420, h = w / (e.ratio ?? im.width / im.height), x = e.x ?? 540, y = e.y ?? 420;
  ctx.save(); ctx.globalAlpha = a * clamp(k / 0.2); ctx.translate(x, y); ctx.scale(0.86 + 0.14 * pop, 0.86 + 0.14 * pop);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10; ctx.fillStyle = '#1A1F1B'; rr(ctx, -w / 2 - 7, -h / 2 - 7, w + 14, h + 14, 16); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.save(); rr(ctx, -w / 2, -h / 2, w, h, 11); ctx.clip();
  const sc = Math.max(w / im.width, h / im.height) * (1 + 0.05 * clamp(k / 5)), iw = im.width * sc, ih = im.height * sc;
  ctx.drawImage(im, -iw * (e.focus?.[0] ?? 0.5), -ih * (e.focus?.[1] ?? 0.5), iw, ih); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; rr(ctx, -w / 2, -h / 2, w, h, 11); ctx.stroke();
  if (e.credit) { ctx.font = `15px ${F.bold}`; ctx.letterSpacing = '0px'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText(e.credit, w / 2, h / 2 + 12); }
  ctx.restore();
}

// chữ to giãn chữ: mỗi dòng một màu, trồi lên lần lượt
function ebig(ctx, e, t, s) {
  const k = local(e, t), a = fadeA({...e, enter: 'none'}, t), x = e.x ?? s.width / 2;
  let y = e.y ?? 1340; ctx.save(); ctx.textAlign = e.align || 'center'; ctx.textBaseline = 'middle';
  (e.lines || []).forEach((L, i) => {
    const sz = L.size ?? (i === 0 ? 62 : 40), q = clamp((k - i * (e.stagger ?? 0.25)) / 0.45);
    if (q > 0) {
      ctx.font = `${sz}px ${L.font === 'bold' ? F.bold : F.black}`; ctx.letterSpacing = `${Math.round(sz * (L.spacing ?? 0.09))}px`;
      ctx.globalAlpha = a * q; const yy = y + (1 - ease(q)) * 28, txt = L.text.toUpperCase();
      ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 18; ctx.fillStyle = ec(L.color || 'white'); ctx.fillText(txt, x, yy);
      if (L.color && L.color !== 'white') { ctx.shadowColor = ec(L.color); ctx.shadowBlur = 16; ctx.globalAlpha = a * q * 0.5; ctx.fillText(txt, x, yy); }
      ctx.shadowBlur = 0;
    }
    y += sz * (L.gap ?? 1.35);
  });
  ctx.restore();
}

// số liệu: nhãn nhỏ + số lớn xanh chanh đếm lên (giữ dấu phẩy thập phân kiểu Việt)
function estat(ctx, e, t, s) {
  const k = local(e, t), a = fadeA(e, t), x = e.x ?? s.width / 2, y = e.y ?? 1330, q = ease(clamp(k / (e.count ?? 1.0)));
  const m = String(e.value).match(/^([\d.,]+)(.*)$/); let txt = String(e.value);
  if (m && e.count !== 0) { const dec = (m[1].split(',')[1] || '').length, n = parseFloat(m[1].replace(/\./g, '').replace(',', '.')) * q; txt = n.toFixed(dec).replace('.', ',') + m[2]; }
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (e.label) { ctx.font = `${e.labelSize ?? 34}px ${F.black}`; ctx.letterSpacing = '4px'; ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 14; ctx.fillText(e.label.toUpperCase(), x, y - (e.size ?? 110) * 0.78); }
  ctx.font = `${e.size ?? 110}px ${F.black}`; ctx.letterSpacing = '3px'; ctx.fillStyle = ec(e.color || 'chanh'); ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 20; ctx.fillText(txt.toUpperCase(), x, y);
  ctx.shadowColor = ec(e.color || 'chanh'); ctx.shadowBlur = 24; ctx.globalAlpha = a * 0.45; ctx.fillText(txt.toUpperCase(), x, y);
  if (e.note) { ctx.globalAlpha = a * 0.85; ctx.shadowBlur = 0; ctx.font = `20px ${F.bold}`; ctx.letterSpacing = '1px'; ctx.fillStyle = '#D9DED3'; ctx.fillText(e.note, x, y + (e.size ?? 110) * 0.68); }
  ctx.restore();
}

Object.assign(PAINT, {grade, outline, etag, sign, ecard, ebig, estat});
for (const ty of EARTH_TYPES) if (!GEO_TYPES.includes(ty)) GEO_TYPES.push(ty);
