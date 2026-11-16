// Phần tử "clip": đoạn video thật (tải bằng studio/tools/clips.py) chiếu trong khung hoặc làm nền toàn màn,
// người que, đạo cụ, chữ vẫn vẽ đè lên. Mỗi clip có một tiến trình ffmpeg giải mã tuần tự đúng kích thước khung
// (không giữ cả video trong RAM). render.mjs gọi R.prepare(T) (bất đồng bộ) trước R.frame(T) để nạp khung hình.
// Định dạng: SCENE_FORMAT.md, mục "clip".
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createCanvas, ImageData} from '@napi-rs/canvas';
import {clamp, ease, backOut} from './math.mjs';

export const TONES = {
  none: '',
  bw: 'hue=s=0,eq=contrast=1.08',
  sepia: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,eq=contrast=1.05',
  paper: 'eq=saturation=0.55:contrast=1.06:brightness=0.02,colorbalance=rs=.06:gs=.03:bs=-.06', // dịu màu, ấm, hợp nền giấy
  vivid: 'eq=saturation=1.25:contrast=1.05',
  night: 'eq=brightness=-0.12:saturation=0.7,colorbalance=bs=.08:bm=.05',
  old: 'hue=s=0,eq=contrast=1.15,noise=alls=18:allf=t', // phim cũ: đen trắng có hạt
};
export const FRAMES = ['polaroid', 'film', 'rounded', 'none'];

export function probeClip(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', file], {encoding: 'utf8'});
  const j = JSON.parse(r.stdout || '{}'), v = (j.streams || []).find(x => x.codec_type === 'video') || {};
  return {w: v.width || 16, h: v.height || 9, duration: Number(j.format?.duration) || 0, audio: (j.streams || []).some(x => x.codec_type === 'audio')};
}

export function validateClip(s, e, where, err) {
  if (e.type !== 'clip') return false;
  if (!e.path) err(`${where}: clip needs "path"`);
  if (s.base && !fs.existsSync(path.join(s.base, e.path))) err(`${where}: missing clip ${e.path}`);
  if (!e.credit) err(`${where}: clip needs "credit" (tác giả · giấy phép · nguồn, xem clips.json)`);
  if (e.tone && !(e.tone in TONES)) err(`${where}: unknown clip tone "${e.tone}" (${Object.keys(TONES).join(', ')})`);
  if (e.frame && !FRAMES.includes(e.frame)) err(`${where}: unknown clip frame "${e.frame}" (${FRAMES.join(', ')})`);
  return true;
}

// box geometry in scene pixels: W×H shown, decoded at (W×H)·kb so the Ken Burns push never upsamples
export function clipBox(s, e) {
  const f = path.join(s.base, e.path); e._meta ||= probeClip(f);
  const fill = e.full && e.full !== 'fit'; // full: true = cover the frame; full: "fit" = whole video in a band over a blurred copy
  const W = fill ? s.width : (e.w ?? (e.full ? s.width : 900)), H = fill ? s.height : Math.round(W * (e.ratio ?? e._meta.h / e._meta.w));
  const kb = Math.max(1, e.kenburns ?? (e.full ? 1.06 : 1));
  const even = x => Math.max(2, Math.round(x / 2) * 2);
  return {W, H, kb, dw: even(W * kb), dh: even(H * kb)};
}

class Reader {
  constructor(file, opts) {
    const {dw, dh, fps, start, speed, loop, tone} = opts;
    this.size = dw * dh * 4; this.n = -1; this.buf = []; this.len = 0; this.done = false; this.waiters = [];
    const vf = [`setpts=PTS/${speed}`, `fps=${fps}`, `scale=${dw}:${dh}:force_original_aspect_ratio=increase`, `crop=${dw}:${dh}`, TONES[tone] || ''].filter(Boolean).join(',');
    this.p = spawn('ffmpeg', ['-v', 'error', ...(loop ? ['-stream_loop', '-1'] : []), '-ss', `${start}`, '-i', file, '-an', '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], {stdio: ['ignore', 'pipe', 'inherit']});
    this.p.stdout.on('data', c => { this.buf.push(c); this.len += c.length; if (this.len > this.size * 4) this.p.stdout.pause(); this.wake(); });
    this.p.stdout.on('end', () => { this.done = true; this.wake(); });
    this.p.on('error', () => { this.done = true; this.wake(); });
  }
  wake() { const w = this.waiters; this.waiters = []; w.forEach(f => f()); }
  async next() { // one decoded frame (Buffer) or null at end of file
    while (this.len < this.size && !this.done) { this.p.stdout.resume(); await new Promise(r => this.waiters.push(r)); }
    if (this.len < this.size) return null;
    const all = this.buf.length === 1 ? this.buf[0] : Buffer.concat(this.buf), out = all.subarray(0, this.size), rest = all.subarray(this.size);
    this.buf = rest.length ? [rest] : []; this.len = rest.length; this.n++;
    if (this.len < this.size * 2) this.p.stdout.resume();
    return Buffer.from(out);
  }
  close() { try { this.p.kill('SIGKILL'); } catch {} }
}

// load the frame for local shot time t into e._cv (canvas). Sequential rendering only reads forward;
// a backward jump (rendering --from, or reusing an element) restarts the decoder at the right place.
export async function prepareClip(s, e, t) {
  const b = e._box ||= clipBox(s, e), speed = e.speed ?? 1, fps = s.fps;
  const want = Math.max(0, Math.floor(((t - (e.from ?? 0)) + 1e-6) * fps));
  if (!e._reader || want < e._reader.n || want - e._reader.n > fps * 4) {
    e._reader?.close();
    const start = (e.in ?? 0) + (want / fps) * speed, loop = e.loop ?? true;
    e._reader = new Reader(path.join(s.base, e.path), {dw: b.dw, dh: b.dh, fps, start: loop && e._meta.duration ? start % e._meta.duration : start, speed, loop, tone: e.tone ?? 'none'});
    e._reader.n = want - 1;
    (s._readers ||= new Set()).add(e._reader);
  }
  let frame = null;
  while (e._reader.n < want) { const f = await e._reader.next(); if (!f) break; frame = f; }
  if (frame) {
    e._cv ||= createCanvas(b.dw, b.dh);
    e._cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(frame.buffer, frame.byteOffset, frame.length), b.dw, b.dh), 0, 0);
  }
}

export function closeClips(s) { for (const r of s._readers || []) r.close(); s._readers?.clear(); }

const roundRect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

// tr = transform(e, t) from scene.mjs (x, y, sc, rot, a with enter/exit animations)
export function drawClip(ctx, e, t, s, tr, shotDur) {
  const b = e._box, cv = e._cv; if (!b) return;
  const dur = (e.to ?? shotDur) - (e.from ?? 0), k = clamp((t - (e.from ?? 0)) / Math.max(0.5, dur));
  // Ken Burns: show a (1/z) window of the decoded frame, z going 1 → kb (or kb → 1 with kenburnsOut)
  const z = 1 + (b.kb - 1) * (e.kenburnsOut ? 1 - ease(k) : ease(k));
  const cw = b.dw / z, ch = b.dh / z, fx = e.focus?.[0] ?? 0.5, fy = e.focus?.[1] ?? 0.5, sx = (b.dw - cw) * fx, sy = (b.dh - ch) * fy;
  ctx.save();
  if (e.full) {
    ctx.globalAlpha = tr.a * (e.from ? clamp((t - e.from) / (e.enterDur ?? 0.4)) : 1); // fades in when it starts mid-shot
    if (!cv) { ctx.fillStyle = '#111'; ctx.fillRect(0, 0, s.width, s.height); }
    else if (e.full === 'fit') { // blurred, darkened cover copy behind; the whole video sharp in a band at y
      const sc = Math.max(s.width / cw, s.height / ch), bw = cw * sc, bh = ch * sc;
      ctx.save(); ctx.filter = `blur(${e.blur ?? 28}px)`; ctx.drawImage(cv, sx, sy, cw, ch, (s.width - bw) / 2 - 40, (s.height - bh) / 2 - 40, bw + 80, bh + 80); ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(0, 0, s.width, s.height);
      ctx.drawImage(cv, sx, sy, cw, ch, (s.width - b.W) / 2, tr.y - b.H / 2, b.W, b.H);
    } else ctx.drawImage(cv, sx, sy, cw, ch, 0, 0, s.width, s.height);
    const dim = e.dim ?? (e.full === 'fit' ? 0 : 0.15); if (dim) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(0, 0, s.width, s.height); }
    if (e.vignette ?? e.full !== 'fit') { const g = ctx.createRadialGradient(s.width / 2, s.height / 2, s.height * 0.3, s.width / 2, s.height / 2, s.height * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = g; ctx.fillRect(0, 0, s.width, s.height); }
    ctx.restore();
    creditText(ctx, e.credit, 40, s.height - 330, 'left', 'rgba(255,255,255,.75)', s.width - 80);
    return;
  }
  const frame = e.frame ?? 'polaroid', W = b.W, H = b.H;
  const q = clamp((t - (e.from ?? 0)) / 0.55), fly = e.enter ? 0 : 1; // default entrance: rises and settles like a dropped photo
  const y = tr.y + fly * (1 - backOut(q)) * 220, rot = tr.rot + (frame === 'polaroid' ? (e.rotate === undefined ? -0.025 : 0) : 0) + fly * (1 - ease(q)) * 0.1;
  ctx.globalAlpha = tr.a * (fly ? clamp(q * 2.5) : 1); ctx.translate(tr.x, y); ctx.rotate(rot); ctx.scale(tr.sc, tr.sc);
  const B = frame === 'polaroid' ? (e.border ?? 16) : frame === 'film' ? 34 : 0, CB = frame === 'polaroid' ? 48 : B;
  ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
  if (frame === 'polaroid') { ctx.fillStyle = '#F7F5F0'; ctx.fillRect(-W / 2 - B, -H / 2 - B, W + 2 * B, H + B + CB); }
  else if (frame === 'film') { ctx.fillStyle = '#141414'; ctx.fillRect(-W / 2 - 14, -H / 2 - B, W + 28, H + 2 * B); }
  else { ctx.fillStyle = '#000'; roundRect(ctx, -W / 2, -H / 2, W, H, frame === 'rounded' ? 28 : 0); ctx.fill(); }
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  if (frame === 'film') { ctx.fillStyle = '#EDEAE2'; const n = Math.max(6, Math.round(W / 70)); for (let i = 0; i < n; i++) { const x = -W / 2 + (i + 0.5) * W / n - 9; for (const yy of [-H / 2 - B + 9, H / 2 + B - 25]) { roundRect(ctx, x, yy, 18, 16, 3); ctx.fill(); } } }
  ctx.save(); roundRect(ctx, -W / 2, -H / 2, W, H, frame === 'rounded' ? 28 : 0); ctx.clip();
  if (cv) ctx.drawImage(cv, sx, sy, cw, ch, -W / 2, -H / 2, W, H); else { ctx.fillStyle = '#222'; ctx.fillRect(-W / 2, -H / 2, W, H); }
  ctx.restore();
  if (frame === 'polaroid') creditText(ctx, e.credit, -W / 2, H / 2 + CB / 2, 'left', '#6B6B6B', W);
  else creditText(ctx, e.credit, W / 2 - 14, H / 2 + (frame === 'film' ? B + 22 : 26), 'right', e.creditColor || 'rgba(60,60,60,.85)', W);
  ctx.restore();
}

function creditText(ctx, text, x, y, align, colorStr, maxW) {
  if (!text) return;
  ctx.save(); ctx.font = '20px QBKBold'; ctx.fillStyle = colorStr; ctx.textAlign = align; ctx.textBaseline = 'middle';
  let c = text; while (ctx.measureText(c).width > maxW && c.length > 8) c = c.slice(0, -2) + '…';
  ctx.fillText(c, x, y); ctx.restore();
}

// clip audio (volume > 0) for render.mjs: [{file, in, at (scene seconds), dur, volume}]
export function clipAudio(s) {
  const out = [];
  for (const sh of s.shots) for (const e of sh.elements || []) if (e.type === 'clip' && (e.volume ?? 0) > 0) {
    const m = e._meta ||= probeClip(path.join(s.base, e.path)); if (!m.audio) continue;
    const from = e.from ?? 0, to = Math.min(e.to ?? Infinity, sh.end - sh.start);
    out.push({file: path.join(s.base, e.path), in: e.in ?? 0, at: sh.start + from, dur: to - from, volume: e.volume, loop: e.loop ?? true});
  }
  return out;
}
