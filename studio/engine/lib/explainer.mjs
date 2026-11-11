// Layout "explainer" (Hoạt hình giải thích): 1080×1920 page, static 2-line title on top, a 16:9 cartoon frame
// in the middle (y ≈ 30% → 62%), karaoke captions (2–3 words, current word highlighted) below or over the frame bottom.
import {createCanvas} from '@napi-rs/canvas';
import {rng} from './math.mjs';

export const PAGE = {w: 1080, h: 1920, frameY: 576};   // frame = 1080×608 → y 576…1184 (30%…62%)

export function setupExplainer(s) {
  s.page = {...PAGE, frameH: s.height};
  const st = s.styleDef, cap = s.captions || {}, size = cap.size ?? 64;
  const y = cap.y ?? (st.captionPlace === 'overlay' ? s.page.frameY + s.height - size * 0.95 : s.page.frameY + s.height + 86);
  s.captionStyle = {y, size, color: '#FFFFFF', maxWidth: PAGE.w - 120};
}

// static background + title, painted once
export function paintPage(s) {
  const {w: W, h: H} = PAGE, st = s.styleDef, cv = createCanvas(W, H), ctx = cv.getContext('2d'), r = rng(11);
  if (st.page === 'pink') {
    const g = ctx.createLinearGradient(0, 0, W * 0.25, H); g.addColorStop(0, '#FFD6E4'); g.addColorStop(0.55, '#F08DB3'); g.addColorStop(1, '#9E2C63');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1600; i++) { ctx.fillStyle = `rgba(255,255,255,${(r() * 0.05).toFixed(3)})`; ctx.fillRect(r() * W, r() * H, 2, 2); }
  } else { // kraft paper: beige base, mottling, fibres, specks
    ctx.fillStyle = '#D3C6A8'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * H, rad = 40 + r() * 160, g = ctx.createRadialGradient(x, y, 0, x, y, rad), d = r() < 0.5;
      g.addColorStop(0, d ? 'rgba(120,85,45,.07)' : 'rgba(255,240,210,.08)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    ctx.lineWidth = 1.2; for (let i = 0; i < 2200; i++) { const x = r() * W, y = r() * H, a = r() * Math.PI, l = 6 + r() * 26;
      ctx.strokeStyle = r() < 0.6 ? `rgba(95,62,30,${(0.05 + r() * 0.12).toFixed(3)})` : `rgba(255,245,220,${(0.06 + r() * 0.12).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * l / 2 + (r() - 0.5) * 6, y + Math.sin(a) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke(); }
    for (let i = 0; i < 3500; i++) { ctx.fillStyle = `rgba(70,45,20,${(r() * 0.22).toFixed(3)})`; ctx.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(70,40,10,.22)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  // title: 2 fixed lines above the frame (scene.title = ["dòng 1", "dòng 2"] or "dòng 1\ndòng 2")
  const lines = (Array.isArray(s.title) ? s.title : String(s.title || '').split('\n')).filter(Boolean).slice(0, 2).map(t => st.titleUpper ? t.toUpperCase() : t);
  const face = st.titleFace || 'QBKBlack', fit = (t, size, max) => { ctx.font = `${size}px ${face}`; const w = ctx.measureText(t).width; return w > max ? Math.floor(size * max / w) : size; };
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  const bottom = PAGE.frameY - 40, l2 = lines[1], s2 = l2 ? fit(l2, st.title2Size || 84, W - 200) : 0, h2 = s2 * 1.5, y2 = bottom - h2 / 2;
  const l1 = lines[0], s1 = l1 ? fit(l1, st.title1Size || 78, W - 120) : 0, y1 = l2 ? y2 - h2 / 2 - s1 * 0.85 : bottom - s1;
  if (l1) { ctx.font = `${s1}px ${face}`; if (st.titleStroke) { ctx.lineWidth = 12; ctx.strokeStyle = st.titleStroke; ctx.strokeText(l1, W / 2, y1); } ctx.fillStyle = st.titleColor; ctx.fillText(l1, W / 2, y1); }
  if (l2) {
    ctx.font = `${s2}px ${face}`; const tw = ctx.measureText(l2).width, bw = tw + s2 * 1.1, bx = W / 2 - bw / 2, by = y2 - h2 / 2;
    ctx.save();
    if (st.titleBox === 'block') { ctx.fillStyle = '#111'; ctx.fillRect(bx + 9, by + 9, bw, h2); ctx.fillStyle = st.title2Bg; ctx.fillRect(bx, by, bw, h2); ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.strokeRect(bx, by, bw, h2); }
    else { ctx.shadowColor = 'rgba(60,35,10,.28)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.fillStyle = st.title2Bg; ctx.beginPath(); ctx.roundRect(bx, by, bw, h2, h2 * 0.32); ctx.fill(); }
    ctx.restore(); ctx.fillStyle = st.title2Color; ctx.fillText(l2, W / 2, y2 + s2 * 0.04);
  }
  return cv;
}

// compose one output frame: page, frame (inner canvas) with border, karaoke caption
export function composeFrame(s, out, page, inner, T) {
  const ctx = out.getContext('2d'), st = s.styleDef, {frameY} = s.page, fh = s.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(page, 0, 0); ctx.drawImage(inner, 0, frameY);
  if (st.frameBorderW) { ctx.lineWidth = st.frameBorderW; ctx.strokeStyle = st.frameBorder; ctx.beginPath(); ctx.moveTo(0, frameY); ctx.lineTo(PAGE.w, frameY); ctx.moveTo(0, frameY + fh); ctx.lineTo(PAGE.w, frameY + fh); ctx.stroke(); }
  const cue = s.captionItems.find(c => T >= c.start && T < c.end); if (!cue) return;
  const cs = s.captionStyle, words = (st.captionUpper ? cue.text.toUpperCase() : cue.text).split(' ').filter(Boolean);
  ctx.font = st.captionFont.replace('{size}', cs.size); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = st.captionStrokeW ?? 12; ctx.strokeStyle = st.caption.stroke;
  // karaoke: Vietnamese words are single syllables, so each word gets an equal share of the cue (weighted a little by length)
  const wt = words.map(w => 2 + w.length), tot = wt.reduce((a, b) => a + b, 0); let acc = 0, cur = words.length - 1;
  for (let i = 0; i < words.length; i++) { acc += wt[i] / tot; if (T < cue.start + (cue.end - cue.start) * acc) { cur = i; break; } }
  const sp = ctx.measureText(' ').width * 1.35, ws = words.map(w => ctx.measureText(w).width), full = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const k = full > cs.maxWidth ? cs.maxWidth / full : 1; ctx.save(); ctx.translate(PAGE.w / 2, cs.y); ctx.scale(k, k);
  let x = -full / 2; words.forEach((w, i) => { ctx.strokeText(w, x, 0); ctx.fillStyle = i === cur ? st.captionHighlight : st.caption.color; ctx.fillText(w, x, 0); x += ws[i] + sp; });
  ctx.restore();
}

// 2–3 words per caption: groups of 3, a would-be single leftover word turns the last 3+1 into 2+2
export function karaokeChunks(items) {
  return items.flatMap(c => {
    const w = c.text.split(' ').filter(Boolean), sizes = [];
    let n = w.length; while (n > 0) { if (n === 4 || n === 2) { sizes.push(2); n -= 2; } else if (n === 1) { sizes.push(1); n = 0; } else { sizes.push(3); n -= 3; } }
    const parts = []; let i = 0; for (const z of sizes) { parts.push(w.slice(i, i + z).join(' ')); i += z; }
    const wt = p => p.split(' ').reduce((a, x) => a + 2 + x.length, 0), tot = parts.reduce((a, p) => a + wt(p), 0);
    let t = c.start; return parts.map(p => { const d = (c.end - c.start) * wt(p) / tot, r = {start: t, end: t + d, text: p}; t += d; return r; });
  });
}
