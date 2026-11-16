// Phong cách "ban-tin" (bản tin vẽ tay), học từ studio/references/ai-beat-tin-tuc/card.md.
// Phần tử vẽ thẳng lên canvas (không qua Recorder): tiêu đề gõ chữ + dòng nguồn, thẻ ảnh dán băng keo, thẻ chữ,
// con dấu đỏ đập xuống, huy hiệu tròn, bóng thoại viền xanh, số chạy, nhãn gõ chữ, hộp đỏ nhạt, hộp câu hỏi.
// Nền giấy, vạch tiến độ trên cùng và phụ đề karaoke nằm trong styles.mjs / scene.mjs.
// Thời gian đo từ mẫu: mỗi yếu tố bật ra trong 100–250 ms, chữ gõ khoảng 30 ký tự/giây, cảnh cắt cứng.
import fs from 'node:fs';
import path from 'node:path';
import {loadImage} from '@napi-rs/canvas';
import {clamp, ease, easeOut, backOut, rng} from './math.mjs';

export const NEWS = {ink: '#1C1C1E', red: '#FC5636', blue: '#2464EC', gray: '#8C867D', redFill: 'rgba(252,86,54,.2)', blueFill: 'rgba(36,100,236,.16)', card: '#FFFFFF', tape: 'rgba(240,205,110,.78)'};
export const NEWS_TYPES = ['headline', 'card', 'stamp', 'badge', 'bubble', 'counter', 'label', 'box', 'qbox'];
const col = c => NEWS[c] || c || NEWS.ink;
const HAND = 'Hand', SRC = 'QBKBold';

export function validateNews(s, e, where, err) {
  if (!NEWS_TYPES.includes(e.type)) return false;
  if (e.type === 'card' && e.path && s.base && !fs.existsSync(path.join(s.base, e.path))) err(`${where}: missing card image ${e.path}`);
  if (e.type === 'card' && e.path && !e.credit) err(`${where}: card with a photo needs "credit" (tác giả · giấy phép · nguồn)`);
  if (['headline', 'stamp', 'label', 'bubble'].includes(e.type) && !e.text) err(`${where}: ${e.type} needs "text"`);
  return true;
}

export async function preloadNews(s) {
  s._newsImg ||= new Map();
  for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'card' && e.path && !s._newsImg.has(e.path)) s._newsImg.set(e.path, await loadImage(path.join(s.base, e.path)));
}

const local = (e, t) => t - (e.from ?? 0);
const typed = (text, k, cps = 30) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor(k * cps + 1e-6))));
// entrance used by most elements: scale 0.82 → 1 with ease-out and fade, `dur` seconds (measured 0.2–0.25 s)
const pop = (k, dur = 0.22) => { const q = clamp(k / dur); return {a: clamp(q * 1.6), sc: 0.82 + 0.18 * easeOut(q)}; };
const exitA = (e, t) => (e.exit === 'fade' && e.to !== undefined ? clamp((e.to - t) / 0.25) : 1);

function fitText(ctx, text, maxW) { if (!maxW) return text; let c = text; while (ctx.measureText(c).width > maxW && c.length > 4) c = c.slice(0, -2) + '…'; return c; }
function wrap(ctx, text, maxW) { const out = []; for (const para of String(text).split('\n')) { let line = ''; for (const w of para.split(' ')) { const tryL = line ? line + ' ' + w : w; if (ctx.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; } out.push(line); } return out; }

function headline(ctx, e, t, s) {
  const k = local(e, t), x = e.x ?? 100, y = e.y ?? 282, size = e.size ?? 57, a = clamp(k / 0.1) * exitA(e, t);
  ctx.globalAlpha = a; ctx.font = `${size}px ${HAND}`; ctx.textAlign = e.align || 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = col(e.color);
  ctx.fillText(e.typing === false ? e.text : typed(e.text, k, e.cps ?? 34), x, y);
  if (e.source) { const ks = k - (e.sourceAt ?? 0.23); if (ks > 0) { ctx.globalAlpha = a * clamp(ks / 0.12); ctx.font = `${e.sourceSize ?? 22}px ${SRC}`; ctx.fillStyle = NEWS.gray; ctx.fillText(e.source, x, y + size * 0.9); } }
}

function tape(ctx, x, y, w, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = NEWS.tape; ctx.fillRect(-w / 2, -18, w, 36); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-w / 2, -16, w, 6); ctx.restore(); }

// thẻ ảnh (polaroid) hoặc thẻ chụp màn hình/ghi chú. path (ảnh) hoặc lines (chữ), label, tape, frame
function card(ctx, e, t, s) {
  const k = local(e, t), {a, sc} = pop(k, e.enterDur ?? 0.25), im = e.path ? s._newsImg.get(e.path) : null;
  const frame = e.frame || (im ? 'polaroid' : 'screen'), w = e.w ?? 400, ratio = e.ratio ?? (im ? im.height / im.width : 0.75), h = w * ratio;
  const B = frame === 'polaroid' ? (e.border ?? 16) : 0, LB = frame === 'polaroid' ? (e.label ? 72 : B) : 0;
  const slide = e.enter === 'slide-up' ? (1 - easeOut(clamp(k / 0.3))) * 120 : 0;
  ctx.globalAlpha = a * exitA(e, t); ctx.translate(e.x ?? 540, (e.y ?? 800) + slide); ctx.rotate(e.rotate ?? 0); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(40,30,20,.22)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.fillStyle = NEWS.card; ctx.fillRect(-w / 2 - B, -h / 2 - B, w + 2 * B, h + B + LB); ctx.shadowColor = 'transparent';
  ctx.lineWidth = frame === 'screen' ? 3 : 1.5; ctx.strokeStyle = frame === 'screen' ? '#2B2B2E' : 'rgba(0,0,0,.18)'; ctx.strokeRect(-w / 2 - B, -h / 2 - B, w + 2 * B, h + B + LB);
  if (im) { ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.clip(); const z = Math.max(w / im.width, h / im.height) * (1 + 0.04 * clamp(k / 6)), iw = im.width * z, ih = im.height * z, fx = e.focus?.[0] ?? 0.5, fy = e.focus?.[1] ?? 0.4;
    ctx.drawImage(im, -w / 2 + (w - iw) * fx, -h / 2 + (h - ih) * fy, iw, ih); ctx.restore(); }
  else { // thẻ chữ kiểu bài báo: dòng đầu đậm, các dòng sau, chữ xanh = liên kết; *từ* gạch chân đỏ
    const pad = 26; let y = -h / 2 + pad + 16; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    if (e.site) { ctx.font = `20px ${SRC}`; ctx.fillStyle = NEWS.gray; ctx.fillText(e.site, -w / 2 + pad, y); y += 36; }
    if (e.title) { ctx.font = `bold ${e.titleSize ?? 32}px Sans`; ctx.fillStyle = NEWS.ink; for (const l of wrap(ctx, e.title, w - 2 * pad)) { ctx.fillText(l, -w / 2 + pad, y); y += (e.titleSize ?? 32) * 1.25; } y += 8; }
    // body: one paragraph; words between *…* get a red underline drawn after markAt
    const ts = e.textSize ?? 24; ctx.font = `${ts}px Sans`;
    let hi = false; const words = (e.lines || []).join(' ').split(/\s+/).filter(Boolean).map(w => { const open = w.startsWith('*'), close = w.replace(/[.,;:!?]+$/, '').endsWith('*'); const on = hi || open; if (open) hi = true; if (close) hi = false; return {w: w.replace(/\*/g, ''), hi: on}; });
    const sp = ctx.measureText(' ').width, maxX = w / 2 - pad, q = clamp((k - (e.markAt ?? 0.8)) / 0.35); let x = -w / 2 + pad;
    for (const wd of words) { const ww = ctx.measureText(wd.w).width; if (x + ww > maxX && x > -w / 2 + pad) { x = -w / 2 + pad; y += ts * 1.45; } if (y > h / 2 - ts * 0.6) break;
      ctx.fillStyle = wd.hi ? NEWS.ink : '#3A3A3D'; ctx.fillText(wd.w, x, y);
      if (wd.hi && q > 0) { ctx.strokeStyle = NEWS.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 2, y + ts * 0.62); ctx.lineTo(x + (ww + sp) * q, y + ts * 0.64); ctx.stroke(); }
      x += ww + sp; }
  }
  if (e.label) { ctx.font = `${e.labelSize ?? 40}px ${HAND}`; ctx.fillStyle = NEWS.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(fitText(ctx, e.label, w), 0, h / 2 + LB / 2); }
  if (e.credit) { ctx.font = `17px ${SRC}`; ctx.fillStyle = NEWS.gray; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText(fitText(ctx, e.credit, w + 2 * B), w / 2 + B, h / 2 + LB + 8); }
  if (e.tape !== false) tape(ctx, e.tapeX ?? 0, -h / 2 - B, e.tapeW ?? Math.min(150, w * 0.32), e.tapeRot ?? -0.04);
}

// con dấu: chữ đỏ in hoa trong khung bo góc, đập xuống (1.7 → 1 trong 0.14 s)
function stamp(ctx, e, t) {
  const k = local(e, t), q = clamp(k / (e.enterDur ?? 0.14)), sc = 1 + 0.7 * (1 - easeOut(q)), size = e.size ?? 48, c = col(e.color || 'red');
  ctx.globalAlpha = clamp(q * 2) * 0.92 * exitA(e, t); ctx.translate(e.x ?? 540, e.y ?? 800); ctx.rotate(e.rotate ?? -0.32); ctx.scale(sc, sc);
  ctx.font = `${size}px ${HAND}`; const txt = e.text.toUpperCase(), tw = ctx.measureText(txt).width, pw = tw + size * 0.8, ph = size * 1.45;
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 10); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = c; ctx.stroke(); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 3);
}

// huy hiệu tròn đặc: r, text (trắng), color
function badge(ctx, e, t) {
  const k = local(e, t), q = clamp(k / 0.25), sc = backOut(q), r = e.r ?? 72;
  ctx.globalAlpha = clamp(q * 3) * exitA(e, t); ctx.translate(e.x ?? 540, e.y ?? 800); ctx.rotate(e.rotate ?? 0); ctx.scale(sc, sc);
  ctx.fillStyle = col(e.color || 'red'); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  if (e.text) { ctx.font = `${e.size ?? r * 0.62}px ${HAND}`; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e.text, 0, 3); }
}

// bóng thoại: khung bo tròn viền xanh, chữ viết tay, đuôi nhọn về phía tail [dx, dy]
function bubble(ctx, e, t) {
  const k = local(e, t), {a, sc} = pop(k, 0.22), size = e.size ?? 38, c = col(e.color || 'blue');
  ctx.globalAlpha = a * exitA(e, t); ctx.translate(e.x ?? 540, e.y ?? 800); ctx.rotate(e.rotate ?? 0); ctx.scale(sc, sc);
  ctx.font = `${size}px ${HAND}`; const lines = wrap(ctx, e.text, e.w ?? 520), tw = Math.max(...lines.map(l => ctx.measureText(l).width)), pw = tw + size * 1.2, ph = lines.length * size * 1.25 + size * 0.8;
  ctx.fillStyle = '#FBF9F4'; ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 18); ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = c; ctx.stroke();
  if (e.tail) { const [dx, dy] = e.tail; ctx.beginPath(); ctx.moveTo(-14, ph / 2 - 2); ctx.lineTo(dx, dy); ctx.lineTo(14, ph / 2 - 2); ctx.fillStyle = '#FBF9F4'; ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = col(e.textColor || 'blue'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, 0, -ph / 2 + size * 0.4 + size * 0.62 + i * size * 1.25));
}

// số chạy: from → to trong dur giây; trong lúc chạy các chữ số nhảy ngẫu nhiên (như mẫu), rồi dừng ở to
function counter(ctx, e, t, s) {
  const k = local(e, t), dur = e.dur ?? 0.9, size = e.size ?? 112, q = clamp(k / dur), fno = Math.round(t * s.fps);
  let v; if (q >= 1) v = e.to; else { const r = rng(fno * 31 + 7)(); v = Math.round(e.from + (e.to - e.from) * (q < 0.25 ? r * 0.2 : q * (0.8 + r * 0.25))); }
  const num = (e.decimals ? Number(v).toFixed(e.decimals) : Math.round(v).toLocaleString('vi-VN'));
  ctx.globalAlpha = clamp(k / 0.1) * exitA(e, t); ctx.font = `${size}px ${HAND}`; ctx.textAlign = e.align || 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col(e.color || 'red');
  ctx.fillText(`${e.prefix ?? ''}${num}${e.suffix ?? ''}`, e.x ?? 540, e.y ?? 700);
}

// nhãn chữ viết tay gõ dần; underline: true kẻ nguệch ngoạc đỏ bên dưới sau khi gõ xong
function label(ctx, e, t) {
  const k = local(e, t), size = e.size ?? 52; ctx.globalAlpha = exitA(e, t);
  ctx.font = `${size}px ${e.font === 'sans' ? 'Sans' : HAND}`; ctx.textAlign = e.align || 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col(e.color);
  const lines = String(e.text).split('\n'), cps = e.cps ?? 34; let used = 0;
  lines.forEach((l, i) => { const shown = e.typing === false ? l : typed(l, Math.max(0, k - used / cps), cps); used += l.length; ctx.fillText(shown, e.x ?? 540, (e.y ?? 700) + i * size * 1.2); });
  if (e.underline) { const tw = Math.max(...lines.map(l => ctx.measureText(l).width)), q = clamp((k - String(e.text).length / cps - 0.05) / 0.3); if (q > 0) {
    const x0 = (e.x ?? 540) - (ctx.textAlign === 'center' ? tw / 2 : ctx.textAlign === 'right' ? tw : 0), y = (e.y ?? 700) + size * 0.62 + (lines.length - 1) * size * 1.2;
    ctx.strokeStyle = col(e.underlineColor || 'red'); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 24 * q; i++) { const x = x0 - 10 + i / 24 * (tw + 20), yy = y + Math.sin(i * 1.1) * 3; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); } }
}

// hộp tô nhạt viền màu (số liệu nổi bật): w, h, text (to, màu), sub (nhỏ, mực), color
function box(ctx, e, t) {
  const k = local(e, t), w = e.w ?? 690, h = e.h ?? 200, c = col(e.color || 'red'), q = clamp(k / 0.3);
  ctx.globalAlpha = exitA(e, t); ctx.translate(e.x ?? 540, e.y ?? 900);
  ctx.fillStyle = e.color === 'blue' ? NEWS.blueFill : NEWS.redFill; ctx.fillRect(-w / 2, -h / 2, w, h * easeOut(q));
  ctx.lineWidth = 6.5; ctx.strokeStyle = c; ctx.beginPath(); const per = 2 * (w + h), L = per * easeOut(q); // viền vẽ dần quanh hộp
  const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]]; let left = L; ctx.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && left > 0; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), f = Math.min(1, left / d); ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f); left -= d; } ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (e.text) { ctx.font = `${e.size ?? 80}px ${HAND}`; ctx.fillStyle = c; ctx.fillText(typed(e.text, k - 0.15, e.cps ?? 34), 0, e.sub ? -h * 0.14 : 0); }
  if (e.sub) { ctx.font = `${e.subSize ?? 40}px ${HAND}`; ctx.fillStyle = NEWS.ink; ctx.fillText(typed(e.sub, k - 0.35, e.cps ?? 40), 0, h * 0.27); }
}

// hộp câu hỏi đánh số (kết video): n, text
function qbox(ctx, e, t) {
  const k = local(e, t), {a, sc} = pop(k, 0.22), w = e.w ?? 820, h = e.h ?? 160, size = e.size ?? 48;
  ctx.globalAlpha = a * exitA(e, t); ctx.translate(e.x ?? 540, e.y ?? 900); ctx.scale(sc, sc);
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 6; ctx.strokeStyle = NEWS.ink; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.lineWidth = 5; ctx.strokeStyle = NEWS.red; ctx.beginPath(); ctx.arc(-w / 2 + 56, 0, 32, 0, Math.PI * 2); ctx.stroke();
  ctx.font = `${size}px ${HAND}`; ctx.fillStyle = NEWS.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(e.n ?? 1), -w / 2 + 56, 2);
  ctx.fillStyle = NEWS.ink; ctx.textAlign = 'left'; const lines = wrap(ctx, e.text || '', w - 130); lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, -w / 2 + 110, (i - (Math.min(2, lines.length) - 1) / 2) * size * 1.15 + 2));
}

const PAINT = {headline, card, stamp, badge, bubble, counter, label, box, qbox};
export function drawNews(ctx, e, t, s) { ctx.save(); PAINT[e.type](ctx, e, t, s); ctx.restore(); }

// ---- style pieces used by styles.mjs / scene.mjs ----
// paper: warm off-white, lighter in the middle (#F5F1E9 centre → #EFE9E0 edges, measured)
export function paintPaper(ctx, W, H) {
  ctx.fillStyle = '#F1EDE3'; ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.05, W / 2, H * 0.45, H * 0.8); for (let i = 0; i <= 10; i++) { const u = i / 10; g.addColorStop(u, u < 0.55 ? `rgba(255,253,248,${(0.26 * (1 - u / 0.55) ** 2).toFixed(3)})` : `rgba(200,190,172,${(0.22 * ((u - 0.55) / 0.45) ** 2).toFixed(3)})`); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = rng(11); for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(${r() < 0.5 ? '120,105,85' : '255,255,255'},${(r() * 0.05).toFixed(3)})`; ctx.fillRect(r() * W, r() * H, 1.5 + r() * 2, 1.5 + r() * 2); }
}
// progress bar: 8 px track #E4DED5 across the top; the fill reveals a fixed red→blue gradient left to right (linear in time)
export function paintProgress(ctx, W, p) {
  ctx.fillStyle = '#E4DED5'; ctx.fillRect(0, 0, W, 8);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#FF6946'); g.addColorStop(0.35, '#E8686A'); g.addColorStop(0.7, '#8C6FC0'); g.addColorStop(1, '#3F73F5');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W * clamp(p), 8);
}
// karaoke caption: dark text with a paper-coloured outline and soft shadow; spoken part wiped to red, char by char
export function karaokeCaption(ctx, text, x, y, k, {size = 46, font = 'QBKCaption', ink = '#232326', hi = '#F0553A', maxW = 960} = {}) {
  ctx.save(); ctx.font = `${size}px ${font}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  let tw = ctx.measureText(text).width; if (tw > maxW) { ctx.font = `${Math.floor(size * maxW / tw)}px ${font}`; tw = maxW; }
  const x0 = x - tw / 2;
  ctx.shadowColor = 'rgba(60,45,30,.35)'; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3; ctx.shadowBlur = 2;
  ctx.lineWidth = 7; ctx.strokeStyle = '#F8F4EC'; ctx.strokeText(text, x0, y); ctx.shadowColor = 'transparent';
  ctx.fillStyle = ink; ctx.fillText(text, x0, y);
  const n = Math.round(clamp(k) * text.length); if (n > 0) { const wHi = ctx.measureText(text.slice(0, n)).width; ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size, wHi + 10, size * 2); ctx.clip(); ctx.fillStyle = hi; ctx.fillText(text, x0, y); ctx.restore(); }
  ctx.restore();
}
