// Phong cách "ty-phu": ô hình thật ở trên (ảnh, ảnh ghép đôi, clip video), tiêu đề cố định có từ khóa vàng,
// nền navy có biểu tượng QBK mờ (đồ thị đi lên + đồng xu), bộ đếm số tài sản, dòng thời gian năm.
// Học từ mẫu studio/references/ty-phu-anh-that/card.md. Định dạng: SCENE_FORMAT.md, mục "Phong cách tỉ phú".
// Vẽ thẳng lên canvas (raster), không qua Recorder.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadImage} from '@napi-rs/canvas';
import {clamp, ease, backOut} from './math.mjs';

export const GOLD = '#F5C842', NAVY = '#1F3150', NAVY_DEEP = '#121D30', PANEL_H = 1080;
export const TP_TYPES = ['panel', 'counter', 'timeline', 'chip'];
const F = {black: 'QBKBlack', bold: 'QBKBold', italic: 'QBKItalic'};
const VIDEO = /\.(mp4|webm|mov|m4v|ogv)$/i;
const local = (e, t) => t - (e.from ?? 0);
const fadeIn = (e, t, d = 0.25) => (e.enter === 'none' ? 1 : clamp(local(e, t) / (e.enterDur ?? d))) * (e.to !== undefined && e.exit !== 'none' ? clamp((e.to - t) / 0.25) : 1);

// ---------- assets: ảnh tải trước; clip được cắt thành chuỗi JPEG trong RAM rồi giải mã từng khung ----------
const items = e => e.paths ? e.paths.map(p => typeof p === 'string' ? {path: p} : p) : e.path ? [{path: e.path, focus: e.focus, credit: e.credit, seek: e.seek, speed: e.speed, kenburns: e.kenburns}] : [];
export async function preloadTyPhu(s) {
  s._tp = {img: new Map(), clip: new Map()};
  for (const sh of s.shots) for (const e of sh.elements || []) {
    if (e.type !== 'panel') continue;
    for (const it of items(e)) {
      const f = path.join(s.base, it.path);
      if (VIDEO.test(it.path)) {
        const key = `${it.path}@${it.seek ?? 0}`; if (s._tp.clip.has(key)) continue;
        const dur = (sh.end - sh.start) * (it.speed ?? 1) + 0.5;
        const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', `${it.seek ?? 0}`, '-t', `${dur}`, '-i', f, '-an', '-vf', `fps=${s.fps / (it.speed ?? 1)},scale=1080:-2`, '-q:v', '3', '-f', 'image2pipe', '-c:v', 'mjpeg', '-'], {maxBuffer: 1 << 30});
        if (r.status !== 0) throw new Error(`clip ${it.path}: ${r.stderr}`);
        const buf = r.stdout, frames = []; let st = -1;
        for (let i = 0; i < buf.length - 1; i++) { if (buf[i] === 0xFF && buf[i + 1] === 0xD8 && st < 0) st = i; else if (buf[i] === 0xFF && buf[i + 1] === 0xD9 && st >= 0) { frames.push(buf.subarray(st, i + 2)); st = -1; i++; } }
        if (!frames.length) throw new Error(`clip ${it.path}: không đọc được khung nào`);
        s._tp.clip.set(key, {frames, last: -1, dec: new Map()});
      } else if (!s._tp.img.has(it.path)) s._tp.img.set(it.path, await loadImage(f));
    }
  }
}
export function validateTyPhu(s, e, where, err) {
  if (!TP_TYPES.includes(e.type)) return false;
  if (e.type === 'panel') for (const it of items(e)) if (!fs.existsSync(path.join(s.base, it.path))) err(`${where}: missing ${it.path}`);
  if (e.type === 'panel' && items(e).length > 1 && !e.split) err(`${where}: panel nhiều ảnh cần "split": "v" | "h"`);
  if (e.type === 'counter' && typeof e.value !== 'number') err(`${where}: counter cần value (số)`);
  return true;
}
function frameOf(s, it, t) {
  if (!VIDEO.test(it.path)) return s._tp.img.get(it.path);
  const c = s._tp.clip.get(`${it.path}@${it.seek ?? 0}`), i = Math.min(c.frames.length - 1, Math.max(0, Math.floor(t * s.fps + 1e-6)));
  return c.dec.get(i) || c.dec.get(c.last) || null;
}
// Giải mã JPEG là bất đồng bộ: render.mjs gọi hàm này trước mỗi khung để khung clip cần vẽ đã sẵn sàng (giữ vài khung gần nhất).
export async function prepareTyPhu(s, T) {
  if (!s._tp?.clip.size) return;
  const sh = s.shots.find(x => T >= x.start && T < x.end) || s.shots.at(-1), t = T - sh.start;
  for (const e of sh.elements || []) {
    if (e.type !== 'panel' || t < (e.from ?? 0)) continue;
    for (const it of items(e)) {
      if (!VIDEO.test(it.path)) continue;
      const c = s._tp.clip.get(`${it.path}@${it.seek ?? 0}`), i = Math.min(c.frames.length - 1, Math.max(0, Math.floor((t - (e.from ?? 0)) * s.fps + 1e-6)));
      if (!c.dec.has(i)) c.dec.set(i, await loadImage(c.frames[i]));
      c.last = i; for (const k of c.dec.keys()) if (k < i - 2 || k > i + 2) c.dec.delete(k);
    }
  }
}

// ---------- painters ----------
function cover(ctx, im, x, y, w, h, it, kb) {
  const sc = Math.max(w / im.width, h / im.height) * kb, iw = im.width * sc, ih = im.height * sc, fx = it.focus?.[0] ?? 0.5, fy = it.focus?.[1] ?? 0.5;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.drawImage(im, x + (w - iw) * fx, y + (h - ih) * fy, iw, ih); ctx.restore();
}
function creditPill(ctx, text, x, y) {
  ctx.save(); ctx.font = `19px ${F.bold}`; const w = ctx.measureText(text).width + 22;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.roundRect(x, y - 15, w, 30, 15); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(text, x + 11, y + 1); ctx.restore();
}
// panel: ô hình trên cùng. path (ảnh hoặc video), paths + split ("v" trên–dưới, "h" trái–phải), bg (ô trống cho cảnh vẽ bằng code)
function panel(ctx, e, t, s) {
  const H = e.h ?? PANEL_H, W = s.width, k = local(e, t), dur = (e.to ?? e._shotDur ?? 4) - (e.from ?? 0), list = items(e);
  ctx.save(); ctx.globalAlpha = fadeIn({...e, enter: e.enter ?? 'none'}, t);
  ctx.fillStyle = e.bg || '#0B111C'; ctx.fillRect(0, 0, W, H);
  const n = list.length, gap = n > 1 ? 6 : 0, credits = [];
  list.forEach((it, i) => {
    const im = frameOf(s, it, k); if (!im) return;
    const kbEnd = it.kenburns ?? e.kenburns ?? (VIDEO.test(it.path) ? 1 : 1.1), kb = 1 + (kbEnd - 1) * ease(clamp(k / Math.max(1, dur)));
    const r = e.split === 'h' ? {x: i * (W + gap) / n, y: 0, w: (W - gap * (n - 1)) / n, h: H} : {x: 0, y: i * (H + gap) / n, w: W, h: (H - gap * (n - 1)) / n};
    const q = n > 1 ? clamp((k - i * (e.stagger ?? 0.35)) / 0.3) : 1; if (q <= 0) return;
    ctx.save(); ctx.globalAlpha *= q; cover(ctx, im, r.x, r.y, r.w, r.h, it, kb); ctx.restore();
    if (it.credit) credits.push([it.credit, r.x + 18, r.y + r.h - 30]);
  });
  if (n > 1) { ctx.fillStyle = GOLD; if (e.split === 'h') ctx.fillRect(W / 2 - gap / 2, 0, gap, H); else ctx.fillRect(0, H / 2 - gap / 2, W, gap); }
  // viền dưới: dải tối mờ + đường vàng mảnh ngăn với vùng navy
  const g = ctx.createLinearGradient(0, H - 120, 0, H); g.addColorStop(0, 'rgba(18,29,48,0)'); g.addColorStop(1, 'rgba(18,29,48,.55)'); ctx.fillStyle = g; ctx.fillRect(0, H - 120, W, 120);
  ctx.fillStyle = GOLD; ctx.fillRect(0, H - 3, W, 3);
  for (const [c, x, y] of credits) creditPill(ctx, c, x, y);
  ctx.restore();
}
const fmtNum = (v, dec) => { const [a, b] = v.toFixed(dec).split('.'); return a.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (b ? ',' + b : ''); };
// counter: số đếm nhảy (tài sản, số lần thất bại…). value, from0 (mặc định 0), prefix, suffix, decimals, dur, label, size, color
function counter(ctx, e, t, s) {
  const k = local(e, t), q = ease(clamp(k / (e.dur ?? 1.2))), v = (e.start ?? 0) + (e.value - (e.start ?? 0)) * q, a = fadeIn(e, t);
  const x = e.x ?? s.width / 2, y = e.y ?? 1385, size = e.size ?? 120, pop = 1 + 0.08 * Math.sin(Math.PI * clamp((k - (e.dur ?? 1.2)) / 0.25));
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(pop, pop); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const txt = `${e.prefix ?? ''}${fmtNum(v, e.decimals ?? 0)}${e.suffix ?? ''}`; ctx.font = `${size}px ${F.black}`;
  ctx.shadowColor = 'rgba(245,200,66,.45)'; ctx.shadowBlur = 30; ctx.fillStyle = e.color === 'red' ? '#FF5A4E' : e.color || GOLD; ctx.fillText(txt, 0, 0); ctx.shadowBlur = 0;
  if (e.label) { ctx.font = `${Math.round(size * 0.26)}px ${F.bold}`; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText(e.label.toUpperCase(), 0, size * 0.42); }
  ctx.restore();
}
// timeline: dòng năm, chấm vàng chạy tới mốc `at` (chỉ số). years: [2002, 2006, 2008], labels tùy chọn
function timeline(ctx, e, t, s) {
  const ys = e.years || [], n = ys.length, k = local(e, t), a = fadeIn(e, t), x0 = e.x0 ?? 110, x1 = e.x1 ?? s.width - 110, y = e.y ?? 1350, at = e.at ?? n - 1;
  const p = ease(clamp((k - 0.2) / (e.dur ?? 1))), head = n > 1 ? at / (n - 1) * p : 0, X = i => x0 + (x1 - x0) * (n > 1 ? i / (n - 1) : 0.5);
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.strokeStyle = GOLD; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * head, y); ctx.stroke();
  ys.forEach((yr, i) => {
    const on = n > 1 ? i / (n - 1) <= head + 1e-6 : true, cur = i === at && p >= 1;
    ctx.fillStyle = on ? GOLD : '#3A4A66'; ctx.beginPath(); ctx.arc(X(i), y, cur ? 16 : 11, 0, Math.PI * 2); ctx.fill();
    ctx.font = `${cur ? 52 : 38}px ${F.black}`; ctx.textAlign = 'center'; ctx.fillStyle = on ? (cur ? GOLD : '#FFFFFF') : 'rgba(255,255,255,.4)'; ctx.fillText(String(yr), X(i), y - 40);
    if (e.labels?.[i]) { ctx.font = `24px ${F.bold}`; ctx.fillStyle = on ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.35)'; ctx.fillText(e.labels[i].toUpperCase(), X(i), y + 52); }
  });
  ctx.restore();
}
// chip: nhãn nhỏ (năm, "MINH HỌA", tên người) đặt trong ô hình. text, x, y, bg ("gold" | "dark" | "red"), align
function chip(ctx, e, t, s) {
  const k = local(e, t), q = backOut(clamp(k / 0.35)), size = e.size ?? 30;
  ctx.save(); ctx.globalAlpha = fadeIn(e, t); ctx.font = `${size}px ${F.black}`; const txt = e.text.toUpperCase(), w = ctx.measureText(txt).width + size * 0.9, h = size * 1.5;
  const x = e.align === 'right' ? (e.x ?? s.width - 40) - w : e.align === 'center' ? (e.x ?? s.width / 2) - w / 2 : e.x ?? 40, y = e.y ?? 60;
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(0.6 + 0.4 * q, 0.6 + 0.4 * q);
  const bg = {gold: GOLD, dark: 'rgba(10,16,28,.82)', red: '#D7263D'}[e.bg || 'gold'] || e.bg;
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 8); ctx.fill(); if (e.bg === 'dark') { ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.fillStyle = (e.bg || 'gold') === 'gold' ? '#111' : '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
  ctx.restore();
}
const PAINT = {panel, counter, timeline, chip};
export function drawTyPhu(ctx, e, t, s, shotDur) { e._shotDur = shotDur; PAINT[e.type](ctx, e, t, s); }

// ---------- nền và tiêu đề cố định ----------
// Nền navy + biểu tượng riêng của QBK: đồ thị đi lên nét mảnh trong vòng tròn đồng xu (không dùng quả địa cầu của mẫu).
export function paintTyPhuBg(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, NAVY); g.addColorStop(1, NAVY_DEEP); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H - 300, R = 150; ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, R - 14, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(cx - R * 0.7, cy + i * 40); ctx.lineTo(cx + R * 0.7, cy + i * 40); ctx.globalAlpha = 0.45; ctx.stroke(); } ctx.globalAlpha = 1;
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(245,200,66,.22)'; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const P = [[-0.72, 0.5], [-0.35, 0.2], [-0.1, 0.35], [0.2, -0.1], [0.42, 0.02], [0.72, -0.5]]; ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(cx + x * R, cy + y * R) : ctx.moveTo(cx + x * R, cy + y * R)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 0.72 * R - 28, cy - 0.5 * R + 2); ctx.lineTo(cx + 0.72 * R, cy - 0.5 * R); ctx.lineTo(cx + 0.72 * R - 4, cy - 0.5 * R + 28); ctx.stroke();
  ctx.restore();
}
// headline: chuỗi, từ khóa viết *như thế này* tô vàng; tự xuống tối đa 2–3 dòng, in hoa. Cấp scene: "headline" hoặc {text, y, size}
export function paintHeadline(ctx, s, hl) {
  const o = typeof hl === 'string' ? {text: hl} : hl, size0 = o.size ?? 54, maxW = s.width - 110, y0 = o.y ?? PANEL_H + 60;
  const toks = []; let hot = false; for (const raw of o.text.toUpperCase().split(' ')) { const st = raw.startsWith('*'), en = /\*[.,!?:;…]*$/.test(raw); if (st) hot = true; toks.push({w: raw.replace(/\*/g, ''), hot}); if (en) hot = false; }
  let size = size0, lines;
  for (; size > 30; size -= 2) { ctx.font = `${size}px ${F.black}`; const sp = ctx.measureText(' ').width; lines = [[]]; let lw = 0;
    for (const tk of toks) { const w = ctx.measureText(tk.w).width; if (lw && lw + sp + w > maxW) { lines.push([]); lw = 0; } lines.at(-1).push({...tk, width: w}); lw += (lw ? sp : 0) + w; }
    if (lines.length <= (o.maxLines ?? 2)) break; }
  ctx.save(); ctx.font = `${size}px ${F.black}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; const sp = ctx.measureText(' ').width;
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  lines.forEach((ln, j) => { const tw = ln.reduce((a, x) => a + x.width, 0) + sp * (ln.length - 1); let x = (s.width - tw) / 2; const y = y0 + j * size * 1.16;
    for (const tk of ln) { ctx.fillStyle = tk.hot ? GOLD : '#FFFFFF'; ctx.fillText(tk.w, x, y); x += tk.width + sp; } });
  ctx.restore();
}
