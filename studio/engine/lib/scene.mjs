// Scene evaluation: turns a declarative scene JSON into frames (see studio/engine/SCENE_FORMAT.md).
import fs from 'node:fs';
import path from 'node:path';
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {clamp, ease, backOut, sampleTrack, color, lerp, rng} from './math.mjs';
import {Recorder, play} from './recorder.mjs';
import {drawCharacter, blendPose, applyCycle, POSES, EXPR} from './character.mjs';
import {PROPS} from './props.mjs';
import {drawHand} from './hand.mjs';
import {SFX_KINDS} from './audio.mjs';
import {getStyle, paintBackground, paintOverlay} from './styles.mjs';
import {GEO_TYPES, validateGeo, drawGeo, sampleView, project, credit, preloadGeo, shade} from './geo.mjs';
import {prepareBds} from './bds.mjs';
import {GROUND_TYPES, preloadOverlays, preloadClips, prepareClips} from './tienich.mjs';

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/PatrickHand-Regular.ttf'), 'Hand');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/NotoSans.ttf'), 'Sans');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/InterDisplay-Black.otf'), 'QBKBlack');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/InterDisplay-ExtraBoldItalic.otf'), 'QBKItalic');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/Inter-Bold.otf'), 'QBKBold');

export function loadScene(file) {
  const base = path.dirname(path.resolve(file));
  const s = JSON.parse(fs.readFileSync(file, 'utf8'));
  s.base = base; s.width ||= 1080; s.height ||= 1920; s.fps ||= 30; s.cast ||= {};
  s.shots ||= [];
  // captions
  const cap = s.captions || {};
  let items = cap.items || (cap.path ? JSON.parse(fs.readFileSync(path.join(base, cap.path), 'utf8')) : []);
  const lead = cap.lead ?? s.narration?.lead ?? 0;
  s.styleDef = getStyle(s.style);
  // blurband layout: draw a 16:9 band; render.mjs places it in the middle of the 9:16 frame over a blurred enlarged copy
  if (s.styleDef.layout === 'blurband') { s.outHeight = s.height; s.height = Math.round(s.width * 9 / 16 / 2) * 2; }
  s.captionStyle = {y: cap.y ?? (s.outHeight ? s.height - 62 : Math.round(s.height * 0.73)), size: cap.size ?? (s.outHeight ? 46 : 58), color: cap.color || '#2A2723', maxWidth: s.width - 120};
  s.captionItems = items.map(c => ({start: c.start + lead, end: c.end + lead, text: c.text}));
  if (!s.duration) s.duration = Math.max(...s.shots.map(x => x.end), ...s.captionItems.map(c => c.end + 0.4), 1);
  validate(s);
  return s;
}

export function validate(s) {
  const err = m => { throw new Error(`Scene: ${m}`); };
  let prevEnd = 0;
  s.shots.forEach((sh, i) => {
    if (!(sh.end > sh.start)) err(`shot ${i} end must be > start`);
    if (Math.abs(sh.start - prevEnd) > 0.001) err(`shot ${i} starts at ${sh.start}, expected ${prevEnd} (no gaps/overlaps)`);
    prevEnd = sh.end;
    for (const [j, e] of (sh.elements || []).entries()) {
      const where = `shot ${i} element ${j}`;
      if (e.type === 'actor') { if (!s.cast[e.cast]) err(`${where}: unknown cast "${e.cast}"`); for (const k of e.acting || []) { if (k.pose && !POSES[k.pose]) err(`${where}: unknown pose "${k.pose}"`); if (k.expr && !EXPR[k.expr]) err(`${where}: unknown expr "${k.expr}"`); } }
      else if (e.type === 'prop') { if (!PROPS[e.name]) err(`${where}: unknown prop "${e.name}"`); }
      else if (e.type === 'text') { if (!e.text) err(`${where}: text required`); }
      else if (validateGeo(s, e, where, err)) {}
      else if (e.type === 'image') { if (!fs.existsSync(path.join(s.base, e.path))) err(`${where}: missing image ${e.path}`); }
      else err(`${where}: unknown type "${e.type}"`);
    }
    for (const x of sh.sfx || []) if (!SFX_KINDS.includes(x.kind)) err(`shot ${i}: unknown sfx "${x.kind}"`);
  });
}

// acting track → pose/expr/cycle at local time t
function acting(e, t) {
  const keys = e.acting?.length ? e.acting : [{t: 0, pose: 'stand'}];
  let i = keys.findLastIndex(k => k.t <= t); if (i < 0) i = 0;
  const cur = keys[i], prev = keys[i - 1] || cur, bt = cur.blend ?? 0.3;
  let pose = POSES[cur.pose || prev.pose || 'stand'];
  if (prev !== cur && t - cur.t < bt) pose = blendPose(prev.pose || 'stand', cur.pose || prev.pose || 'stand', (cur.snap ? backOut : ease)((t - cur.t) / bt));
  else pose = blendPose(pose, pose, 0);
  const expr = keys.slice(0, i + 1).reverse().find(k => k.expr)?.expr || 'neutral';
  const cyc = cur.cycle, ck = cyc ? clamp((t - cur.t) / 0.25) : 0;
  return {pose: applyCycle(pose, cyc, t, ck), expr, cycle: cyc};
}

function transform(e, t) {
  const tr = sampleTrack(e.track, t, ['x', 'y', 'scale', 'rotate', 'alpha']);
  let x = tr.x ?? e.x ?? 540, y = tr.y ?? e.y ?? 1500;
  if (e.geo && e._view) [x, y] = project(e._view, e._s, e.geo[0], e.geo[1]).map((v, i) => v + ((i ? e.dy : e.dx) || 0));
  let sc = tr.scale ?? e.scale ?? 1, rot = tr.rotate ?? e.rotate ?? 0, a = tr.alpha ?? e.alpha ?? 1;
  const from = e.from ?? 0, k = (t - from) / (e.enterDur ?? 0.4);
  if (e.enter === 'pop') { sc *= 0.6 + 0.4 * backOut(k); a *= clamp(k * 2); }
  else if (e.enter === 'fade') a *= ease(k);
  else if (e.enter === 'slide-left') { x -= (1 - ease(k)) * 400; a *= ease(k * 1.5); }
  else if (e.enter === 'slide-right') { x += (1 - ease(k)) * 400; a *= ease(k * 1.5); }
  else if (e.enter === 'drop') { y -= (1 - backOut(k)) * 500; a *= clamp(k * 3); }
  if (e.exit === 'fade' && e.to !== undefined) a *= clamp((e.to - t) / 0.3);
  if (e.motion === 'rock') rot += Math.sin(t * 1.8) * 0.02;
  if (e.motion === 'bob') y += Math.sin(t * 2.2) * 8;
  if (e.motion === 'shake') x += Math.sin(t * 60) * 4;
  return {x, y, sc, rot, a};
}

const images = new Map();
async function img(s, p) { const { loadImage } = await import('@napi-rs/canvas'); const f = path.join(s.base, p); if (!images.has(f)) images.set(f, await loadImage(f)); return images.get(f); }

export async function preloadImages(s) { await preloadGeo(s); await preloadOverlays(s); await preloadClips(s); for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'image') await img(s, e.path); }

function recordElement(s, e, t, sceneT) {
  const R = new Recorder(); const {x, y, sc, rot} = transform(e, t);
  R.translate(x, y); R.rotate(rot); R.scale(sc, sc);
  if (e.type === 'actor') {
    const A = acting(e, t);
    const blinkAt = e.blinks || [1.3, 4.1, 7.2];
    R._actor = drawCharacter(R, {costume: {...s.cast[e.cast], ...(e.costume || {})}, pose: A.pose, expr: A.expr, facing: e.facing ?? 1, t: sceneT, blink: blinkAt.some(b => Math.abs(t - b) < 0.07), wind: e.wind ?? ({run: 2.5, sprint: 3.2, walk: 1.8, jump: 1.8}[A.cycle] || 1)});
    R._contact = A.pose.contact; R._cycle = A.cycle; R._impact = A.pose.impact;
  } else if (e.type === 'prop') {
    const params = {...(e.params || {}), ...sampleTrack(e.ptrack, t, Object.keys(Object.assign({}, ...(e.ptrack || [{}]))).filter(k => k !== 't' && k !== 'ease'))};
    PROPS[e.name](R, params, sceneT);
  } else if (e.type === 'text') {
    const sans = e.font ? e.font === 'sans' : s.styleDef.titleFont === 'Sans';
    R.font = `${e.bold || sans ? 'bold ' : ''}${Math.round((e.size || 120) * (sans && !e.font ? 0.82 : 1))}px ${sans ? 'Sans' : 'Hand'}`; R.textAlign = e.align || 'center'; R.textBaseline = 'middle'; R.fillStyle = color(e.color || 'ink'); R.fillText(e.text, 0, 0);
  }
  return R;
}

// Camera nghiêng (phong cách bds-tien-ich, học từ skill map-location-video): vẽ phần tử mặt đất lên canvas phụ lớn hơn khung,
// rồi chiếu phối cảnh từng dải ngang. Phần tử đứng (ghim, nhãn, khối 3D) dùng s._tilt trong project() để bám đúng chỗ.
const groundCanvases = new Map();
function tiltGround(ctx, s, sh, view, t, deg) {
  const W = s.width, H = s.height, th = deg * Math.PI / 180, sn = Math.sin(th), cs = Math.cos(th), D = s.tiltDistance ?? H * 1.6, cx = W / 2, cy = sh.tiltY ?? H * 0.5;
  const f = yp => yp * D / (cs * D + yp * sn), gyTop = f(-cy), gyBot = f(H - cy), scTop = D / (D - gyTop * sn);
  const SW = Math.ceil(W / scTop / 64) * 64 + 64, SH = Math.ceil(Math.max(-gyTop, gyBot) / 32) * 64 + 64, key = `${SW}x${SH}`;
  if (!groundCanvases.has(key)) { if (groundCanvases.size > 6) groundCanvases.clear(); const c = createCanvas(SW, SH); groundCanvases.set(key, c); }
  const gcv = groundCanvases.get(key), g = gcv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05080C'; g.fillRect(0, 0, SW, SH);
  const sG = Object.create(s); sG.width = SW; sG.height = SH; sG._tilt = null;
  let shadeTop = false;
  for (const e of sh.elements || []) {
    if (!GROUND_TYPES.has(e.type) || t < (e.from ?? 0) || (e.to !== undefined && t >= e.to)) continue;
    const e2 = e.type === 'satmap' ? (shadeTop = e.shade !== false, {...e, shade: false}) : e;
    g.save(); drawGeo(g, e2, t, sG, view, sh.end - sh.start); g.restore();
  }
  // chiếu từng hàng điểm ảnh (nội suy song tuyến); drawImage từ canvas phụ trong napi-rs quá chậm
  const src = g.getImageData(0, 0, SW, SH).data;
  if (!s._tiltOut || s._tiltOut.width !== W || s._tiltOut.height !== H) s._tiltOut = ctx.createImageData(W, H);
  const out = s._tiltOut, o = out.data;
  for (let y = 0; y < H; y++) {
    const gy = f(y + 0.5 - cy), sc = D / (D - gy * sn), fy = Math.min(SH - 1.001, Math.max(0, SH / 2 + gy - 0.5)), y0 = fy | 0, wy = fy - y0, r0 = y0 * SW, r1 = (y0 + 1) * SW;
    for (let x = 0, q = y * W * 4; x < W; x++, q += 4) {
      const fx = Math.min(SW - 1.001, Math.max(0, SW / 2 + (x + 0.5 - cx) / sc - 0.5)), x0 = fx | 0, wx = fx - x0;
      const p00 = (r0 + x0) * 4, p01 = p00 + 4, p10 = (r1 + x0) * 4, p11 = p10 + 4;
      const w00 = (1 - wx) * (1 - wy), w01 = wx * (1 - wy), w10 = (1 - wx) * wy, w11 = wx * wy;
      o[q] = src[p00] * w00 + src[p01] * w01 + src[p10] * w10 + src[p11] * w11;
      o[q + 1] = src[p00 + 1] * w00 + src[p01 + 1] * w01 + src[p10 + 1] * w10 + src[p11 + 1] * w11;
      o[q + 2] = src[p00 + 2] * w00 + src[p01 + 2] * w01 + src[p10 + 2] * w10 + src[p11 + 2] * w11;
      o[q + 3] = 255;
    }
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.putImageData(out, 0, 0);
  // sương mù phía chân trời cho chiều sâu
  const k = Math.min(1, deg / 40), hz = ctx.createLinearGradient(0, 0, 0, H * 0.32); hz.addColorStop(0, `rgba(185,210,235,${0.42 * k})`); hz.addColorStop(1, 'rgba(185,210,235,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H * 0.32);
  ctx.restore();
  if (shadeTop) shade(ctx, {top: 0.35}, t, s);
  s._tilt = {th, D, cx, cy};
}

export function makeRenderer(s) {
  const cv = createCanvas(s.width, s.height), ctx = cv.getContext('2d');
  const events = []; let lastContact = new Map();
  function frame(T) {
    const sh = s.shots.find(x => T >= x.start && T < x.end) || s.shots.at(-1);
    const t = T - sh.start;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const ST = s.styleDef, fno = Math.round(T * s.fps); ST._fno = fno;
    if (sh.background || s.background) { ctx.fillStyle = ST.map(color(sh.background || s.background)); ctx.fillRect(0, 0, s.width, s.height); } else paintBackground(ctx, ST, s.width, s.height, fno);
    const camKeys = sh.camera?.length ? [{zoom: 1, x: s.width / 2, y: s.height / 2, ...sh.camera[0]}, ...sh.camera.slice(1)] : null; // missing fields on the first key default to the frame centre
    const cam = sampleTrack(camKeys, t, ['zoom', 'x', 'y']);
    const z = cam.zoom ?? 1, cx = cam.x ?? s.width / 2, cy = cam.y ?? s.height / 2;
    ctx.setTransform(z, 0, 0, z, s.width / 2 - cx * z, s.height / 2 - cy * z);
    let pen = null, drawing = false; s._rects = [];
    const view = sampleView(sh.view, t);
    const tiltDeg = view && sh.tilt ? (typeof sh.tilt === 'number' ? sh.tilt : sampleTrack(sh.tilt, t, ['deg']).deg ?? 0) : 0;
    if (tiltDeg > 0.5) tiltGround(ctx, s, sh, view, t, tiltDeg); // lớp mặt đất chiếu phối cảnh, đặt s._tilt cho phần tử đứng
    for (const [idx, e] of (sh.elements || []).entries()) {
      if (t < (e.from ?? 0) || (e.to !== undefined && t >= e.to)) continue;
      if (s._tilt && GROUND_TYPES.has(e.type)) continue;
      if (GEO_TYPES.includes(e.type)) { ctx.save(); drawGeo(ctx, e, t, s, view, sh.end - sh.start); ctx.restore(); continue; }
      if (e.geo) { e._view = view; e._s = s; }
      if (e.draw && (ST.drawMode === 'pop' || ST.drawMode === 'fade') && !e._dm) { const at = e.draw.at ?? e.from ?? 0; e._dm = true; e.enter = e.enter || ST.drawMode; e.enterDur = e.enterDur || (ST.drawMode === 'pop' ? 0.45 : 0.7); e.from = Math.max(e.from ?? 0, at); delete e.draw; }
      if (e.type === 'image') {
        const im = images.get(path.join(s.base, e.path)); const {x, y, sc, rot, a} = transform(e, t); const w = (e.w || im.width) * sc, h = w * im.height / im.width;
        ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore(); continue;
      }
      const R = recordElement(s, e, t, T);
      const {a} = transform(e, t);
      ctx.save(); ctx.globalAlpha = a;
      if (e.draw) {
        const at = e.draw.at ?? e.from ?? 0, dur = e.draw.dur ?? 1.5;
        const ink = clamp((t - at) / (dur * 0.78)), fill = clamp((t - at - dur * 0.72) / (dur * 0.28));
        const tip = play(ctx, R.ops, {ink, fill}, s.styleDef, s.textFollowsCamera);
        if (ink > 0 && ink < 1 && e.draw.hand !== false && ST.hand !== false) { pen = tip; drawing = true; }
      } else play(ctx, R.ops, undefined, s.styleDef, s.textFollowsCamera);
      ctx.restore();
      // auto footsteps / hammer hits
      const key = `${sh.start}:${idx}`;
      if (['walk', 'run', 'crawl', 'sprint'].includes(R._cycle)) { const c = Math.sign(R._contact || 0), p = lastContact.get(key); if (p !== undefined && c !== p && c !== 0) events.push({t: T, kind: 'step', gain: R._cycle === 'crawl' ? 0.25 : 0.35}); lastContact.set(key, c); }
      if (R._cycle === 'hammer') { const c = Math.sign(R._impact || 0), p = lastContact.get(key); if (p === 1 && c === -1) events.push({t: T, kind: 'hammer', gain: 0.4}); lastContact.set(key, c); }
    }
    s._tilt = null;
    if (pen) { const [px, py] = ctx.getTransform().transformPoint ? [ctx.getTransform().a * pen[0] + ctx.getTransform().e, ctx.getTransform().d * pen[1] + ctx.getTransform().f] : pen; drawHand(ctx, pen[0], pen[1], T, 1, py > s.captionStyle.y - 470); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    paintOverlay(ctx, ST, s.width, s.height, fno);
    const cr = sh.credit ?? s.credit ?? (s._sat && sh.elements?.some(e => e.type === 'satmap' || e.type === 'globe') ? s._sat.credit : null); if (cr) credit(ctx, s, cr);
    // shot transition (style grammar): drawn over the first `td` seconds of every shot except the first
    const tr = sh.transition ?? ST.transition, td = sh.transitionDur ?? ST.transitionDur ?? 0.45;
    if (tr && tr !== 'cut' && sh.start > 0 && t < td) {
      const k = clamp(t / td), W = s.width, H = s.height, bgc = ST.bg; ctx.save();
      if (tr === 'fade') { ctx.globalAlpha = 1 - ease(k); ctx.fillStyle = bgc; ctx.fillRect(0, 0, W, H); }
      else if (tr === 'flash') { ctx.globalAlpha = (1 - k) * 0.9; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); }
      else if (tr === 'wipe') { ctx.fillStyle = bgc; ctx.fillRect(W * ease(k), 0, W, H); ctx.fillStyle = ST.ink; ctx.globalAlpha = 0.5; ctx.fillRect(W * ease(k) - 3, 0, 6, H); }
      else if (tr === 'scan') { const y = H * ease(k); ctx.fillStyle = bgc; ctx.fillRect(0, y, W, H - y); ctx.strokeStyle = ST.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      else if (tr === 'iris') { ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(W / 2, H * 0.45, Math.hypot(W, H) * 0.6 * ease(k), 0, Math.PI * 2, true); ctx.fill('evenodd'); }
      else if (tr === 'page') { const x = W * (1 - ease(k)) * 1.3; ctx.fillStyle = bgc; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(x - 260, H); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#000'; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 260, H); ctx.stroke(); }
      else if (tr === 'smudge') { const r = rng(fno); ctx.globalAlpha = 1 - k; ctx.fillStyle = bgc; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = (1 - k) * 0.5; ctx.fillStyle = ST.ink; for (let i = 0; i < 40; i++) ctx.fillRect(r() * W, r() * H, 80 + r() * 200, 3); }
      ctx.restore();
    }
    // captions (screen space)
    const cue = s.captionItems.find(c => T >= c.start && T < c.end);
    if (cue && ST.captionBox) { const st = s.captionStyle; const cy = ST.captionOnBar ? s.height - 190 : st.y, fs = ST.captionBox === 'intertitle' ? st.size * 0.9 : st.size;
      ctx.font = ST.captionFont ? ST.captionFont.replace('{size}', fs) : `600 ${fs}px Sans`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(cue.text).width, bw = tw + fs * 1.1, bh = fs * 1.7; ctx.save(); ctx.translate(s.width / 2, cy);
      if (ST.captionBox === 'note') { ctx.rotate(((cue.start * 7) % 3 - 1) * 0.015); ctx.fillStyle = '#FFF2A8'; ctx.shadowColor = 'rgba(0,0,0,.18)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.shadowBlur = 0; ctx.fillStyle = '#1F2A44'; }
      else if (ST.captionBox === 'sticker') { ctx.rotate(((cue.start * 13) % 3 - 1) * 0.03); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(-bw / 2 + 6, -bh / 2 + 6, bw, bh, 14); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 14); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#111'; ctx.stroke(); ctx.fillStyle = '#111'; }
      else if (ST.captionBox === 'intertitle') { ctx.fillStyle = '#0c0c0c'; ctx.fillRect(-s.width * 0.42, -bh * 0.75, s.width * 0.84, bh * 1.5); ctx.strokeStyle = '#d9d9d9'; ctx.lineWidth = 3; ctx.strokeRect(-s.width * 0.42 + 12, -bh * 0.75 + 12, s.width * 0.84 - 24, bh * 1.5 - 24); ctx.fillStyle = '#efefef'; }
      else if (ST.captionBox === 'tag') { ctx.fillStyle = 'rgba(15,40,80,.9)'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.strokeStyle = ST.ink; ctx.lineWidth = 2; ctx.strokeRect(-bw / 2 + 6, -bh / 2 + 6, bw - 12, bh - 12); ctx.fillStyle = '#ffffff'; }
      const shown = ST.captionTypewriter ? cue.text.slice(0, Math.ceil(clamp((T - cue.start) / Math.min(0.6, (cue.end - cue.start) * 0.6)) * cue.text.length)) : cue.text;
      ctx.fillText(shown, ST.captionTypewriter ? -tw / 2 + ctx.measureText(shown).width / 2 : 0, 2); ctx.restore(); }
    else
    if (cue) { const st = s.captionStyle; ctx.font = ST.captionFont ? ST.captionFont.replace('{size}', st.size) : `600 ${st.size}px Sans`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = ST.captionStrokeW ?? 10; ctx.lineJoin = 'round'; ctx.strokeStyle = ST.caption?.stroke || 'rgba(243,234,219,.9)'; const cy = ST.captionOnBar ? s.height - 190 : st.y; const fill = (s.captions?.color) || ST.caption?.color || st.color;
      if (ST.captionHighlight) { // word by word, the longest word (the keyword) in highlight colour
        const text = ST.captionWords ? cue.text.toUpperCase() : cue.text, words = text.split(' '), sp = ctx.measureText(' ').width;
        // keyword: a word written *like this* in the captions file, otherwise the longest non-filler word
        const STOP = new Set(['ĐƯỢC','THÌ','LÀ','VÀ','CỦA','NHỮNG','MỘT','CÁC','CHO','VỚI','NÀY','ĐÓ','KHI','ĐÃ','SẼ','ĐANG','RỒI','CŨNG','NHƯNG','MÀ','NÊN','VÌ','BẠN','NÓ','TA','RA','VÀO','LÊN','XUỐNG','HẲN','RẤT','CÒN','NHƯ','TỪ','TRONG','TRÊN','DƯỚI','ĐỂ','CÓ']);
        const bare = w => w.replace(/[^\p{L}\p{N}]/gu, '');
        let key = words.findIndex(w => /^\*.*\*[.,!?:;]*$/.test(w));
        if (key < 0) key = words.reduce((k, w, i) => { const sc = x => STOP.has(bare(x)) ? 0 : bare(x).length; return sc(w) > sc(words[k]) ? i : k; }, 0);
        words.forEach((w, i) => { words[i] = w.replace(/\*/g, ''); });
        const ws = words.map(w => ctx.measureText(w).width);
        let x = s.width / 2 - (ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1)) / 2; ctx.textAlign = 'left';
        words.forEach((w, i) => { ctx.strokeText(w, x, cy); ctx.fillStyle = i === key && words.length > 1 ? ST.captionHighlight : fill; ctx.fillText(w, x, cy); x += ws[i] + sp; });
      } else { ctx.strokeText(cue.text, s.width / 2, cy); ctx.fillStyle = fill; ctx.fillText(cue.text, s.width / 2, cy); } }
    return {drawing};
  }
  const prepare = async T => { await prepareBds(s, T); await prepareClips(s, T); };
  return {cv, ctx, frame, prepare, events};
}

// Split captions that would wrap into two timed halves at the space nearest the middle (proportional timing).
export function fitCaptions(s) {
  const cv = createCanvas(10, 10), ctx = cv.getContext('2d'); ctx.font = s.styleDef.captionFont ? s.styleDef.captionFont.replace('{size}', s.captionStyle.size) : `600 ${s.captionStyle.size}px Sans`;
  const out = [];
  const push = c => {
    if (ctx.measureText(c.text).width <= s.captionStyle.maxWidth || !c.text.includes(' ')) return out.push(c);
    const words = c.text.split(' '), mid = c.text.length / 2; let best = 1, bd = Infinity, acc = 0;
    words.forEach((w, i) => { acc += w.length + 1; if (i < words.length - 1 && Math.abs(acc - mid) < bd) { bd = Math.abs(acc - mid); best = i + 1; } });
    const a = words.slice(0, best).join(' '), b = words.slice(best).join(' '), split = c.start + (c.end - c.start) * a.length / c.text.length;
    push({start: c.start, end: split, text: a}); push({start: split, end: c.end, text: b});
  };
  let items = s.captionItems;
  const N = s.styleDef.captionWords;
  if (N) items = items.flatMap(c => { const w = c.text.split(' '), parts = []; for (let i = 0; i < w.length; i += N) parts.push(w.slice(i, i + N).join(' '));
    const tot = parts.reduce((a, p) => a + p.length, 0); let t = c.start; return parts.map(p => { const d = (c.end - c.start) * p.length / tot, r = {start: t, end: t + d, text: p}; t += d; return r; }); });
  items.forEach(push); s.captionItems = out;
}
