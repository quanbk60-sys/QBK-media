#!/usr/bin/env node
// Dựng video 3D thực tế từ scene3d.json (three.js trong Chromium headless, miễn phí).
// node render3d.mjs ../../projects/<slug>/scene3d.json [--from S] [--to S] [--name preview] [--fps 30]
// Bố cục mặc định "blurband": khung 16:9 (1080x608) giữa màn 9:16, trên dưới là hình mờ phóng to (như mẫu TikTok 3D).
// "layout": "full" thì dựng thẳng 1080x1920; "wide" dựng ngang 1920x1080 cho YouTube.
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {mixTrack, writeWav, SR, SFX_KINDS} from '../engine/lib/audio.mjs';
const require = createRequire(import.meta.url), {chromium} = require('playwright');
const ROOT = path.dirname(new URL(import.meta.url).pathname), FONTS = path.join(ROOT, '../engine/fonts');

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const file = args.find(a => a.endsWith('.json')); if (!file) { console.error('usage: node render3d.mjs scene3d.json [--from S] [--to S]'); process.exit(2); }
const base = path.dirname(path.resolve(file)), s = JSON.parse(fs.readFileSync(file, 'utf8'));
const fps = Number(opt('--fps', s.fps || 30)), wide = s.layout === 'wide', full = s.layout === 'full' || wide, OW = wide ? 1920 : 1080, OH = wide ? 1080 : 1920, W = OW, H = wide ? 1080 : full ? 1920 : 608; // wide: YouTube ngang 1920x1080
// captions: [{start,end,text}] + lead, split into chunks of <= 3 words (proportional timing)
const lead = s.captions?.lead ?? s.narration?.lead ?? 0.15;
const capsRaw = s.captions?.items || (s.captions?.path ? JSON.parse(fs.readFileSync(path.join(base, s.captions.path), 'utf8')) : []);
s.captionItems = capsRaw.flatMap(c => { const w = c.text.split(' '), parts = []; const N = s.captionWords || 3; for (let i = 0; i < w.length; i += N) parts.push(w.slice(i, i + N).join(' '));
  const tot = parts.reduce((a, p) => a + p.length, 0); let t = c.start + lead; return parts.map(p => { const d = (c.end - c.start) * p.length / tot, r = {start: t, end: t + d, text: p}; t += d; return r; }); });
let prev = 0; for (const [i, sh] of s.shots.entries()) { if (Math.abs(sh.start - prev) > 0.001) throw new Error(`shot ${i} starts at ${sh.start}, expected ${prev}`); prev = sh.end; for (const x of sh.sfx || []) if (!SFX_KINDS.includes(x.kind)) throw new Error(`shot ${i}: unknown sfx ${x.kind}`); }
const dur = s.duration || s.shots.at(-1).end, from = Number(opt('--from', 0)), to = Math.min(Number(opt('--to', dur)), dur);
const name = opt('--name', from > 0 || to < dur ? 'preview' : 'final'), out = path.join(base, 'output'); fs.mkdirSync(out, {recursive: true});
const tmpV = path.join(out, `.${name}.v.mp4`), tmpA = path.join(out, `.${name}.sfx.wav`), mp4 = path.join(out, `${name}.mp4`);

const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const page = await browser.newPage({viewport: {width: W, height: H}});
const MIME = {'.js': 'text/javascript', '.html': 'text/html', '.otf': 'font/otf', '.ttf': 'font/ttf'};
await page.route('http://qbk.local/**', r => { const u = new URL(r.request().url()); let f = u.pathname;
  f = f.startsWith('/three/') ? path.join(ROOT, 'node_modules', f) : f.startsWith('/fonts/') ? path.join(FONTS, f.slice(7)) : path.join(ROOT, f);
  if (!fs.existsSync(f)) return r.fulfill({status: 404}); r.fulfill({body: fs.readFileSync(f), contentType: MIME[path.extname(f)] || 'application/octet-stream'}); });
page.on('pageerror', e => { console.error('page error:', e.message); });
await page.goto(`http://qbk.local/page.html?w=${W}&h=${H}`);
await page.waitForFunction(() => window.__ready === true, null, {timeout: 60000});
await page.evaluate(sc => window.__setup(sc), s); await page.evaluate(() => document.fonts.ready);

const vf = full ? [] : ['-vf', `split[a][b];[a]scale=${OW}:${OH}:force_original_aspect_ratio=increase,crop=${OW}:${OH},boxblur=60:2,eq=brightness=-0.06:saturation=0.9[bg];[bg][b]overlay=0:${(OH - H) / 2}`];
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', `${fps}`, '-i', '-', ...vf, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', tmpV], {stdio: ['pipe', 'inherit', 'inherit']});
const frames = Math.round((to - from) * fps), t0 = Date.now();
for (let i = 0; i < frames; i++) {
  await page.evaluate(T => window.__frame(T), from + i / fps);
  const jpg = await page.screenshot({type: 'jpeg', quality: 92});
  if (!ff.stdin.write(jpg)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 150 === 0) process.stderr.write(`  ${i}/${frames} khung, ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();

// sound: shot sfx + narration (+ optional music)
const events = []; for (const sh of s.shots) for (const x of sh.sfx || []) events.push({...x, t: sh.start + x.t - from});
writeWav(tmpA, mixTrack(to - from, events.filter(e => e.t >= 0 && e.t < to - from)));
const inputs = ['-i', tmpV, '-i', tmpA], filters = []; let mixIn = '[1:a]';
if (s.narration?.path) { const l = s.narration.lead ?? lead, st = Math.max(0, from - l), dl = Math.max(0, l - from); inputs.push('-ss', `${st}`, '-i', path.join(base, s.narration.path));
  filters.push(`[2:a]aresample=${SR},adelay=${Math.round(dl * 1000)}:all=1,volume=${s.narration.gain ?? 1}[nar]`, `[1:a][nar]amix=inputs=2:duration=first:normalize=0[mix]`); mixIn = '[mix]'; }
if (s.music?.path) { const idx = inputs.filter(x => x === '-i').length; inputs.push('-stream_loop', '-1', '-i', path.join(base, s.music.path)); filters.push(`[${idx}:a]aresample=${SR},volume=${s.music.gain ?? 0.08}[mus]`, `${mixIn}[mus]amix=inputs=2:duration=first:normalize=0[mix2]`); mixIn = '[mix2]'; }
const fargs = filters.length ? ['-filter_complex', filters.join(';'), '-map', '0:v', '-map', mixIn] : ['-map', '0:v', '-map', '1:a'];
const res = spawnSync('ffmpeg', ['-v', 'error', '-y', ...inputs, ...fargs, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', `${to - from}`, mp4], {stdio: 'inherit'});
if (res.status !== 0) process.exit(1); fs.rmSync(tmpV); fs.rmSync(tmpA);
const n = Math.min(12, Math.max(4, Math.round((to - from) / 2)));
spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', `fps=${n}/${to - from},scale=270:480,tile=${Math.min(n, 6)}x${Math.ceil(n / 6)}`, '-frames:v', '1', path.join(out, `${name}-contact.png`)]);
console.log(JSON.stringify({output: mp4, seconds: +(to - from).toFixed(2), frames, render_s: +((Date.now() - t0) / 1000).toFixed(1)}));
