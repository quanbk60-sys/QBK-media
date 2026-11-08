// Scene evaluation: turns a declarative scene JSON into frames (see studio/engine/SCENE_FORMAT.md).
import fs from 'node:fs';
import path from 'node:path';
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {clamp, ease, backOut, sampleTrack, color, lerp} from './math.mjs';
import {Recorder, play} from './recorder.mjs';
import {drawCharacter, blendPose, applyCycle, POSES, EXPR} from './character.mjs';
import {PROPS} from './props.mjs';
import {drawHand} from './hand.mjs';
import {SFX_KINDS} from './audio.mjs';

const ROOT = path.dirname(path.dirname(new URL(import.meta.url).pathname));
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/PatrickHand-Regular.ttf'), 'Hand');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/NotoSans.ttf'), 'Sans');

export function loadScene(file) {
  const base = path.dirname(path.resolve(file));
  const s = JSON.parse(fs.readFileSync(file, 'utf8'));
  s.base = base; s.width ||= 1080; s.height ||= 1920; s.fps ||= 30; s.cast ||= {};
  s.shots ||= [];
  // captions
  const cap = s.captions || {};
  let items = cap.items || (cap.path ? JSON.parse(fs.readFileSync(path.join(base, cap.path), 'utf8')) : []);
  const lead = cap.lead ?? s.narration?.lead ?? 0;
  s.captionStyle = {y: cap.y ?? Math.round(s.height * 0.73), size: cap.size ?? 58, color: cap.color || '#2A2723', maxWidth: s.width - 120};
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
  let x = tr.x ?? e.x ?? 540, y = tr.y ?? e.y ?? 1500, sc = tr.scale ?? e.scale ?? 1, rot = tr.rotate ?? e.rotate ?? 0, a = tr.alpha ?? e.alpha ?? 1;
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

export async function preloadImages(s) { for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'image') await img(s, e.path); }

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
    R.font = `${e.bold ? 'bold ' : ''}${e.size || 120}px ${e.font === 'sans' ? 'Sans' : 'Hand'}`; R.textAlign = e.align || 'center'; R.textBaseline = 'middle'; R.fillStyle = color(e.color || 'ink'); R.fillText(e.text, 0, 0);
  }
  return R;
}

export function makeRenderer(s) {
  const cv = createCanvas(s.width, s.height), ctx = cv.getContext('2d');
  const events = []; let lastContact = new Map();
  function frame(T) {
    const sh = s.shots.find(x => T >= x.start && T < x.end) || s.shots.at(-1);
    const t = T - sh.start;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = color(sh.background || s.background || 'paper'); ctx.fillRect(0, 0, s.width, s.height);
    const cam = sampleTrack(sh.camera, t, ['zoom', 'x', 'y']);
    const z = cam.zoom ?? 1, cx = cam.x ?? s.width / 2, cy = cam.y ?? s.height / 2;
    ctx.setTransform(z, 0, 0, z, s.width / 2 - cx * z, s.height / 2 - cy * z);
    let pen = null, drawing = false;
    for (const [idx, e] of (sh.elements || []).entries()) {
      if (t < (e.from ?? 0) || (e.to !== undefined && t >= e.to)) continue;
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
        const tip = play(ctx, R.ops, {ink, fill});
        if (ink > 0 && ink < 1 && e.draw.hand !== false) { pen = tip; drawing = true; }
      } else play(ctx, R.ops);
      ctx.restore();
      // auto footsteps / hammer hits
      const key = `${sh.start}:${idx}`;
      if (['walk', 'run', 'crawl', 'sprint'].includes(R._cycle)) { const c = Math.sign(R._contact || 0), p = lastContact.get(key); if (p !== undefined && c !== p && c !== 0) events.push({t: T, kind: 'step', gain: R._cycle === 'crawl' ? 0.25 : 0.35}); lastContact.set(key, c); }
      if (R._cycle === 'hammer') { const c = Math.sign(R._impact || 0), p = lastContact.get(key); if (p === 1 && c === -1) events.push({t: T, kind: 'hammer', gain: 0.4}); lastContact.set(key, c); }
    }
    if (pen) { drawHand(ctx, pen[0], pen[1], T); }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // captions (screen space)
    const cue = s.captionItems.find(c => T >= c.start && T < c.end);
    if (cue) { const st = s.captionStyle; ctx.font = `600 ${st.size}px Sans`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(243,234,219,.9)'; ctx.strokeText(cue.text, s.width / 2, st.y); ctx.fillStyle = st.color; ctx.fillText(cue.text, s.width / 2, st.y); }
    return {drawing};
  }
  return {cv, ctx, frame, events};
}

// Split captions that would wrap into two timed halves at the space nearest the middle (proportional timing).
export function fitCaptions(s) {
  const cv = createCanvas(10, 10), ctx = cv.getContext('2d'); ctx.font = `600 ${s.captionStyle.size}px Sans`;
  const out = [];
  const push = c => {
    if (ctx.measureText(c.text).width <= s.captionStyle.maxWidth || !c.text.includes(' ')) return out.push(c);
    const words = c.text.split(' '), mid = c.text.length / 2; let best = 1, bd = Infinity, acc = 0;
    words.forEach((w, i) => { acc += w.length + 1; if (i < words.length - 1 && Math.abs(acc - mid) < bd) { bd = Math.abs(acc - mid); best = i + 1; } });
    const a = words.slice(0, best).join(' '), b = words.slice(best).join(' '), split = c.start + (c.end - c.start) * a.length / c.text.length;
    push({start: c.start, end: split, text: a}); push({start: split, end: c.end, text: b});
  };
  s.captionItems.forEach(push); s.captionItems = out;
}
