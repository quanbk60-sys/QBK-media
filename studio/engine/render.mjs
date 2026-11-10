#!/usr/bin/env node
// Render a scene JSON to MP4 (+ SRT + contact sheet).
// node render.mjs path/to/scene.json [--from S] [--to S] [--out DIR] [--name NAME]
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {loadScene, makeRenderer, fitCaptions, preloadImages} from './lib/scene.mjs';
import {mixTrack, writeWav, SR} from './lib/audio.mjs';
import {prepareClips} from './lib/tienich.mjs';

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const file = args.find(a => a.endsWith('.json')); if (!file) { console.error('usage: node render.mjs scene.json [--from S] [--to S] [--out DIR] [--name NAME]'); process.exit(2); }
const s = loadScene(file); fitCaptions(s); await preloadImages(s);
const from = Number(opt('--from', 0)), to = Math.min(Number(opt('--to', s.duration)), s.duration);
const out = path.resolve(opt('--out', path.join(s.base, 'output'))); fs.mkdirSync(out, {recursive: true});
const name = opt('--name', from > 0 || to < s.duration ? 'preview' : 'final');
const tmpV = path.join(out, `.${name}.video.mp4`), tmpA = path.join(out, `.${name}.sfx.wav`), mp4 = path.join(out, `${name}.mp4`);

const R = makeRenderer(s), frames = Math.round((to - from) * s.fps), drawFlags = [];
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${s.width}x${s.height}`, '-r', `${s.fps}`, '-i', '-', ...(s.outHeight ? ['-vf', `split[a][b];[a]scale=${s.width}:${s.outHeight}:force_original_aspect_ratio=increase,crop=${s.width}:${s.outHeight},boxblur=60:2,eq=brightness=-0.08:saturation=0.9[bg];[bg][b]overlay=0:${(s.outHeight - s.height) / 2}`] : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', tmpV], {stdio: ['pipe', 'inherit', 'inherit']});
const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  const T = from + i / s.fps; await prepareClips(s, T); const r = R.frame(T); drawFlags.push(r.drawing);
  if (!ff.stdin.write(R.cv.data())) await new Promise(res => ff.stdin.once('drain', res));
}
ff.stdin.end(); await new Promise(res => ff.on('close', res));

// sound: explicit shot sfx + auto events (steps, hammer) + pen scribble while drawing
const events = [];
for (const sh of s.shots) for (const x of sh.sfx || []) events.push({...x, t: sh.start + x.t - from});
for (const e of R.events) events.push({...e, t: e.t - from});
let runStart = null;
drawFlags.forEach((d, i) => { if (d && runStart === null) runStart = i; if ((!d || i === drawFlags.length - 1) && runStart !== null) { events.push({t: runStart / s.fps, kind: 'scribble', dur: (i - runStart) / s.fps, gain: s.scribbleGain ?? 0}); runStart = null; } });
writeWav(tmpA, mixTrack(to - from, events.filter(e => e.t < to - from)));

const inputs = ['-i', tmpV, '-i', tmpA], filters = [];
let mixIn = '[1:a]';
if (s.narration?.path) {
  const lead = s.narration.lead ?? 0, start = Math.max(0, from - lead), delay = Math.max(0, lead - from);
  inputs.push('-ss', `${start}`, '-i', path.join(s.base, s.narration.path));
  filters.push(`[2:a]aresample=${SR},adelay=${Math.round(delay * 1000)}:all=1,volume=${s.narration.gain ?? 1}[nar]`, `[1:a][nar]amix=inputs=2:duration=first:normalize=0[mix]`); mixIn = '[mix]';
}
if (s.music?.path) {
  const idx = inputs.filter(x => x === '-i').length; inputs.push('-stream_loop', '-1', '-i', path.join(s.base, s.music.path));
  filters.push(`[${idx}:a]aresample=${SR},volume=${s.music.gain ?? 0.08}[mus]`, `${mixIn}[mus]amix=inputs=2:duration=first:normalize=0[mix2]`); mixIn = '[mix2]';
}
const fargs = filters.length ? ['-filter_complex', filters.join(';'), '-map', '0:v', '-map', mixIn] : ['-map', '0:v', '-map', '1:a'];
const res = spawnSync('ffmpeg', ['-v', 'error', '-y', ...inputs, ...fargs, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', `${to - from}`, mp4], {stdio: 'inherit'});
if (res.status !== 0) process.exit(1);
fs.rmSync(tmpV); fs.rmSync(tmpA);

// subtitles sidecar + contact sheet
const fmt = x => { const ms = Math.round(x * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const cues = s.captionItems.filter(c => c.end > from && c.start < to);
fs.writeFileSync(path.join(out, `${name}.srt`), cues.map((c, i) => `${i + 1}\n${fmt(Math.max(0, c.start - from))} --> ${fmt(Math.min(to, c.end) - from)}\n${c.text}\n`).join('\n'));
const n = Math.min(12, Math.max(4, Math.round((to - from) / 2)));
spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', `fps=${n}/${to - from},scale=270:480,tile=${Math.min(n, 6)}x${Math.ceil(n / 6)}`, '-frames:v', '1', path.join(out, `${name}-contact.png`)]);
console.log(JSON.stringify({output: mp4, seconds: +(to - from).toFixed(2), frames, render_s: +((Date.now() - t0) / 1000).toFixed(1), captions: cues.length, sfx_events: events.length}));
