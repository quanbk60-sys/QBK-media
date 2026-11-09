#!/usr/bin/env node
// Quay video quảng cáo QBK Studio: chạy app thật (studio/app/qbk-studio.html) trong Chromium với dữ liệu mô phỏng,
// con trỏ bấm theo kịch bản thời gian khớp lời đọc, ghép vào khung điện thoại 9:16 có phụ đề.
// node record_ad.mjs [--to S]
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.join(HERE, '../..');
const require = createRequire(import.meta.url), {chromium} = require('playwright');
const {createCanvas, loadImage, GlobalFonts} = await import(path.join(ROOT, 'studio/engine/node_modules/@napi-rs/canvas/index.js'));
const {mixTrack, writeWav, SR} = await import(path.join(ROOT, 'studio/engine/lib/audio.mjs'));
for (const [f, n] of [['InterDisplay-Black.otf', 'Blk'], ['Inter-Bold.otf', 'Bld'], ['InterDisplay-ExtraBoldItalic.otf', 'Itl']]) GlobalFonts.registerFromPath(path.join(ROOT, 'studio/engine/fonts', f), n);
for (const w of [600, 700]) GlobalFonts.registerFromPath(path.join(HERE, `fonts/be-vietnam-pro-vietnamese-${w}-normal.woff2`), 'BVP');

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FPS = 30, LEAD = 0.3, OW = 1080, OH = 1920, VW = 390, VH = 692, DSF = 2, PX = (OW - VW * DSF) / 2, PY = 170;
const caps = JSON.parse(fs.readFileSync(path.join(HERE, 'captions-audio.json'), 'utf8')).map(c => ({...c, start: c.start + LEAD, end: c.end + LEAD}));
const C = i => caps[i].start;                      // video time where caption i starts
const END_CARD = C(25) - 0.2, DUR = Number(opt('--to', caps.at(-1).end + 1.6));

// ---------- mock data ----------
const rd = p => JSON.parse(fs.readFileSync(path.join(HERE, 'mockdb', p), 'utf8'));
const DOCS = {'app/styles': rd('app/styles.json'), 'app/voices': rd('app/voices.json'), 'app/trends': rd('app/trends.json'), 'app/crew': rd('app/crew.json'), 'app/stats': rd('app/stats.json')};
const dh = rd('videos/tranh-dong-ho.json'), bd = rd('videos/bach-dang-ve-tinh.json'), ld = rd('videos/lam-da-co-dai.json');
DOCS['videos/tranh-dong-ho'] = {...dh, status: 'da-dang', updatedAt: '2026-11-09T07:00:00Z'};
DOCS['videos/bach-dang-ve-tinh'] = {...bd, status: 'da-duyet', updatedAt: '2026-11-09T06:00:00Z'};
DOCS['tiktokLinks/a1'] = {url: 'https://vt.tiktok.com/ZSpDYNF5W/', fullUrl: 'https://www.tiktok.com/@larumlken/video/7667234116882107671', title: 'Cách làm băng bằng diêm tiêu từ tường nhà (phương pháp cổ đại)', author: 'Khoa Học Kỳ Thú · 104 giây · 2.994 lượt xem', status: 'da-doc', createdAt: '2026-11-09T07:28:31Z'};
DOCS['styleRequests/s1'] = {name: 'Khoa học thí nghiệm cổ', url: 'https://www.tiktok.com/@larumlken/video/7667234116882107671', status: 'xong', result: 'Đã thêm phong cách "Thí nghiệm cổ · 3D" vào app.', createdAt: '2026-11-09T07:38:39Z'};
const NEWV = {title: 'Làm đá thời cổ đại', genre: 'Khoa học', style: 'thi-nghiem', round: 0, createdAt: '2026-11-09T10:00:00Z'};
const STEPS = [['Kịch bản', 'Biên kịch đang viết lời và kiểm chứng nguồn'], ['Giọng', 'Lồng tiếng giọng Charon, căn phụ đề'], ['Phân cảnh', 'Đạo diễn dựng cảnh 3D: chậu, hồ băng, nhà vòm'], ['Dựng', 'Đang render 3D'], ['Kiểm định', 'Soát nguồn, chính tả, âm lượng']];

// asset id -> local file
const BLOB = {}; for (const f of fs.readdirSync(path.join(HERE, 'mockdb/blobs'))) BLOB[f.split('.')[0]] = path.join(HERE, 'mockdb/blobs', f);
for (const s of DOCS['app/styles'].list) BLOB[s.thumb] = path.join(ROOT, 'studio/app/style-previews', s.id.replace(/^thi-nghiem$/, 'thi-nghiem') + '.jpg');
const FONTCSS = ['400', '500', '600', '700'].map(w => ['latin', 'vietnamese'].map(sub => `@font-face{font-family:'Be Vietnam Pro';font-weight:${w};src:url(http://qbk.local/fonts/be-vietnam-pro-${sub}-${w}-normal.woff2) format('woff2')}`).join('')).join('') + `@font-face{font-family:'Patrick Hand';src:url(http://qbk.local/fonts/PatrickHand-Regular.ttf)}`;

// ---------- browser ----------
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport: {width: VW, height: VH}, deviceScaleFactor: DSF, colorScheme: 'light'});
const page = await ctx.newPage();
page.on('pageerror', e => console.error('page error:', e.message));
await ctx.route('**/*', r => { const u = new URL(r.request().url());
  if (u.hostname === 'fonts.googleapis.com') return r.fulfill({body: FONTCSS, contentType: 'text/css'});
  if (u.hostname !== 'qbk.local') return r.abort();
  if (u.pathname === '/app.html') return r.fulfill({body: fs.readFileSync(path.join(ROOT, 'studio/app/qbk-studio.html')), contentType: 'text/html; charset=utf-8'});
  if (u.pathname.startsWith('/fonts/')) return r.fulfill({body: fs.readFileSync(path.join(HERE, u.pathname)), contentType: u.pathname.endsWith('woff2') ? 'font/woff2' : 'font/ttf'});
  if (u.pathname.startsWith('/_blob/')) { const f = BLOB[u.pathname.slice(7)]; if (!f || !fs.existsSync(f)) return r.fulfill({status: 404});
    return r.fulfill({body: fs.readFileSync(f), contentType: f.endsWith('.webm') ? 'video/webm' : f.endsWith('.png') ? 'image/png' : 'image/jpeg'}); }
  r.fulfill({status: 404}); });
await page.clock.install({time: new Date('2026-11-09T10:00:00Z')});
await page.addInitScript(docs => {
  const D = {...docs}, L = [];
  const coll = (q) => Object.entries(D).filter(([p]) => p.startsWith(q.name + '/') && p.split('/').length === q.name.split('/').length + 1)
    .sort((a, b) => !q.ord ? 0 : (String(a[1][q.ord[0]] ?? '') < String(b[1][q.ord[0]] ?? '') ? -1 : 1) * (q.ord[1] === 'desc' ? -1 : 1)).slice(0, q.lim || 1e9);
  const fire = l => l.t === 'c' ? l.cb({docs: coll(l.q).map(([p, d]) => ({id: p.split('/').pop(), data: () => d}))}) : l.cb({exists: !!D[l.p], data: () => D[l.p]});
  const put = (p, d) => { if (d === null) delete D[p]; else D[p] = d; L.forEach(fire); };
  const db = {
    collection(name) { const q = {name, ord: null, lim: null, orderBy(f, dir) { q.ord = [f, dir || 'asc']; return q; }, limit(n) { q.lim = n; return q; },
      onSnapshot(cb) { const l = {t: 'c', q, cb}; L.push(l); setTimeout(() => fire(l)); return () => {}; },
      add(d) { const id = 'n' + Object.keys(D).length; put(name + '/' + id, d); return Promise.resolve({id}); }, doc: id => db.doc(name + '/' + id)}; return q; },
    doc(p) { return {onSnapshot(cb) { const l = {t: 'd', p, cb}; L.push(l); setTimeout(() => fire(l)); return () => {}; },
      update(d) { put(p, {...D[p], ...d}); return Promise.resolve(); }, set(d) { put(p, d); return Promise.resolve(); }, delete() { put(p, null); return Promise.resolve(); }}; },
  };
  window.__put = put; window.__D = D;
  const caps = {db, mcp: {callTool: async () => ({})}};
  window.claude = {use: async n => caps[n] ?? null};
  window.Audio = class { constructor() {} play() { setTimeout(() => this.onended && this.onended(), 1900); return Promise.resolve(); } pause() {} };
}, DOCS);
await page.goto('http://qbk.local/app.html#home');
await page.clock.runFor(800);
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({content: `#__cur{position:fixed;left:0;top:0;z-index:99999;pointer-events:none;width:30px;height:30px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
 #__rip{position:fixed;z-index:99998;pointer-events:none;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(217,68,46,.35);border:2px solid rgba(217,68,46,.8);opacity:0}
 ::-webkit-scrollbar{display:none} [hidden]{display:none!important}`});
await page.evaluate(() => { const c = document.createElement('div'); c.id = '__cur'; c.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 2l15 9-6.5 1.5L16 20l-3 1.5-3.4-7.4L4 18z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg>'; document.body.appendChild(c);
  const r = document.createElement('div'); r.id = '__rip'; document.body.appendChild(r); });

// ---------- timeline ----------
let cur = {x: 200, y: 520}, mv = null, scr = null, typing = null, rip = -9, sfx = [];
const center = async (sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top + scrollY, h: r.height}; }, sel);
const A = [];   // {t, fn}
const at = (t, fn) => A.push({t, fn});
const moveTo = (t, sel, dur = 0.55, dx = 0, dy = 0) => at(t, async T => { const c = await center(sel); if (!c) return console.error('missing', sel); mv = {t0: T, dur, from: {...cur}, to: {x: c.x + dx, y: c.y + dy}}; });
const click = (t, sel) => at(t, async T => { rip = T; sfx.push({t: T, kind: 'tap', gain: 0.5}); await page.evaluate(s => document.querySelector(s)?.click(), sel); });
const scrollTo = (t, sel, dur = 0.6, off = 0.35) => at(t, async T => { const c = await center(sel); if (!c) return console.error('missing', sel); const y0 = await page.evaluate(() => scrollY); const y1 = Math.max(0, c.top - VH * off); scr = {t0: T, dur, y0, y1}; });
const scrollBy = (t, dy, dur = 0.6) => at(t, async T => { const y0 = await page.evaluate(() => scrollY); scr = {t0: T, dur, y0, y1: Math.max(0, y0 + dy)}; });
const type = (t, sel, text, dur) => at(t, async T => { typing = {t0: T, dur, sel, text}; });
const put = (t, p, d) => at(t, async () => page.evaluate(([p, d]) => window.__put(p, d), [p, d]));
const whoosh = t => at(t, async T => sfx.push({t: T, kind: 'whoosh', gain: 0.18}));

// 0. Home
moveTo(C(1), 'a.btn.primary.big', 0.9);
click(C(2) + 1.2, 'a.btn.primary.big'); whoosh(C(2) + 1.2);
// 1. Topic
moveTo(C(3) - 0.1, '#topic', 0.5);
click(C(3) + 0.45, '#topic');
type(C(4) - 0.2, '#topic', 'Làm đá thời cổ đại như thế nào?', 1.5);
// 2. Genre + style
moveTo(C(5) - 0.2, '[data-genre="Khoa học"]', 0.45); click(C(5) + 0.3, '[data-genre="Khoa học"]');
scrollTo(C(5) + 0.6, '.styles', 0.7, 0.18);
moveTo(C(6), '[data-style="giay-muc"]', 0.45);
moveTo(C(6) + 0.75, '[data-style="ve-tinh"]', 0.4);
moveTo(C(7) - 0.05, '[data-style="thi-nghiem"]', 0.4); click(C(7) + 0.45, '[data-style="thi-nghiem"]');
// 3. Voice
scrollTo(C(8) - 0.2, '[data-voice="Charon"]', 0.6, 0.45);
moveTo(C(8) + 0.35, '[data-play="Charon"]', 0.45); click(C(8) + 0.85, '[data-play="Charon"]');
moveTo(C(9) + 0.4, '[data-voice="Charon"]', 0.4, 60, 0); click(C(9) + 0.85, '[data-voice="Charon"]');
// 4. Submit -> crew works
scrollTo(C(10) - 0.35, '#newf button[type=submit]', 0.45, 0.6);
moveTo(C(10) + 0.05, '#newf button[type=submit]', 0.4); click(C(10) + 0.5, '#newf button[type=submit]'); whoosh(C(10) + 0.5);
at(C(10) + 0.9, async () => page.evaluate(() => { for (const [p, d] of Object.entries(window.__D)) if (p.startsWith('requests/')) window.__put(p, {...d, status: 'da-nhan'}); }));
put(C(10) + 0.95, 'videos/lam-da-co-dai', {...NEWV, status: 'dang-lam', stage: STEPS[0][0], stageNote: STEPS[0][1], updatedAt: '2026-11-09T10:01:00Z'});
const stepT = [C(11) + 0.6, C(12), C(12) + 0.8, C(13) + 0.2];
stepT.forEach((t, i) => put(t, 'videos/lam-da-co-dai', {...NEWV, status: 'dang-lam', stage: STEPS[i + 1][0], stageNote: STEPS[i + 1][1], updatedAt: '2026-11-09T10:01:00Z'}));
moveTo(C(11) + 0.2, '.steps', 0.6, 0, 26);
put(C(14) - 0.05, 'videos/lam-da-co-dai', {...ld, ...NEWV, round: 1, status: 'cho-duyet', stage: 'Kiểm định', stageNote: '', updatedAt: '2026-11-09T10:20:00Z'});
// 5. Review
at(C(14) + 0.1, async () => sfx.push({t: C(14) + 0.1, kind: 'chime', gain: 0.3}));
moveTo(C(14) + 0.15, 'a[href="#review"]', 0.45); click(C(14) + 0.75, 'a[href="#review"]'); whoosh(C(14) + 0.75);
let vidOn = null; at(C(14) + 0.8, async T => { vidOn = T; });
moveTo(C(16) - 0.25, '#fbt', 0.45); click(C(16) + 0.2, '#fbt');
type(C(17) - 0.1, '#fbt', 'Cho khối băng to hơn một chút', 1.3);
moveTo(C(17) + 1.0, '#fbf button', 0.35); click(C(17) + 1.35, '#fbf button');
// 6. Approve -> post kit
scrollTo(C(18) + 0.4, '#approve', 0.5, 0.6);
moveTo(C(18) + 0.9, '#approve', 0.45); click(C(19) - 0.05, '#approve'); whoosh(C(19) - 0.05);
at(C(19), async () => { vidOn = null; });
scrollBy(C(20) - 0.1, 260, 1.2);
moveTo(C(20) + 0.3, '[data-copy="t0"]', 0.5);
// 7. Trend, TikTok links, learn style
moveTo(C(21) - 0.25, 'a.tab[href="#trend"]', 0.45); click(C(21) + 0.2, 'a.tab[href="#trend"]'); whoosh(C(21) + 0.2);
scrollTo(C(22) - 0.2, '[data-learn]', 0.9, 0.5);
moveTo(C(23) - 0.15, '[data-learn]', 0.45); click(C(23) + 0.35, '[data-learn]'); whoosh(C(23) + 0.35);
moveTo(C(24) - 0.2, '#lname', 0.4); click(C(24) + 0.15, '#lname'); type(C(24) + 0.3, '#lname', 'Khoa học thí nghiệm cổ', 1.0);
A.sort((a, b) => a.t - b.t);

// ---------- render ----------
const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, cl = x => Math.max(0, Math.min(1, x));
const cv = createCanvas(OW, OH), g = cv.getContext('2d');
const bg = (() => { const c = createCanvas(OW, OH), x = c.getContext('2d'); const gr = x.createLinearGradient(0, 0, 0, OH); gr.addColorStop(0, '#F6EEDF'); gr.addColorStop(1, '#EAD9BE'); x.fillStyle = gr; x.fillRect(0, 0, OW, OH);
  for (const [cx, cy, r, col] of [[120, 260, 260, 'rgba(217,68,46,.10)'], [980, 1480, 340, 'rgba(34,48,107,.08)'], [900, 300, 180, 'rgba(201,143,30,.12)']]) { const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, OW, OH); } return c; })();
const vtmp = path.join(HERE, 'output/.ad.v.mp4'), atmp = path.join(HERE, 'output/.ad.sfx.wav'); fs.mkdirSync(path.join(HERE, 'output'), {recursive: true});
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${OW}x${OH}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', vtmp], {stdio: ['pipe', 'inherit', 'inherit']});
const frames = Math.round(DUR * FPS), t0 = Date.now(); let ai = 0, last = null;
function wrap(text, maxW) { const w = text.split(' '), lines = ['']; for (const x of w) { const t = (lines.at(-1) + ' ' + x).trim(); if (g.measureText(t).width > maxW && lines.at(-1)) lines.push(x); else lines[lines.length - 1] = t; } return lines; }
for (let i = 0; i < frames; i++) {
  const T = i / FPS;
  while (ai < A.length && A[ai].t <= T) { await A[ai].fn(T); ai++; }
  if (mv) { const k = ease(cl((T - mv.t0) / mv.dur)); cur = {x: mv.from.x + (mv.to.x - mv.from.x) * k, y: mv.from.y + (mv.to.y - mv.from.y) * k}; if (k >= 1) mv = null; }
  const st = {cx: cur.x, cy: cur.y, rip: T - rip, sy: scr ? scr.y0 + (scr.y1 - scr.y0) * ease(cl((T - scr.t0) / scr.dur)) : null, ty: typing ? {sel: typing.sel, v: typing.text.slice(0, Math.ceil(typing.text.length * cl((T - typing.t0) / typing.dur)))} : null, vt: vidOn !== null ? T - vidOn : null};
  if (scr && T - scr.t0 >= scr.dur) scr = null; if (typing && T - typing.t0 >= typing.dur) typing = null;
  if (T < END_CARD + 0.6) {
    await page.evaluate(async s => {
      const c = document.getElementById('__cur'); c.style.transform = `translate(${s.cx - 5}px,${s.cy - 3}px)`;
      const r = document.getElementById('__rip'); const k = s.rip / 0.45; r.style.opacity = k >= 0 && k < 1 ? String(1 - k) : '0'; r.style.left = s.cx + 'px'; r.style.top = s.cy + 'px'; r.style.transform = `scale(${0.4 + Math.min(1, Math.max(0, k)) * 0.9})`;
      if (s.sy !== null) window.scrollTo(0, s.sy);
      if (s.ty) { const e = document.querySelector(s.ty.sel); if (e && e.value !== s.ty.v) { e.value = s.ty.v; e.dispatchEvent(new Event('input', {bubbles: true})); } }
      const v = document.getElementById('vid'); if (v && s.vt !== null) { const tt = Math.min(13, 0.5 + s.vt); if (Math.abs(v.currentTime - tt) > 0.02) { v.currentTime = tt; await new Promise(res => { const h = () => { v.removeEventListener('seeked', h); res(); }; v.addEventListener('seeked', h); setTimeout(res, 300); }); } }
    }, st);
    await page.clock.runFor(1000 / FPS);
    last = await loadImage(await page.screenshot({type: 'png'}));
  }
  // composite
  g.drawImage(bg, 0, 0);
  const endK = cl((T - END_CARD) / 0.6);
  if (endK < 1) {
    g.save(); g.globalAlpha = 1 - endK; const sc = 1 - endK * 0.08, pw = VW * DSF * sc, ph = VH * DSF * sc, px = (OW - pw) / 2, py = PY + (VH * DSF - ph) / 2;
    g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.roundRect(px - 14 + 10, py - 14 + 18, pw + 28, ph + 28, 64); g.fill();
    g.fillStyle = '#16120F'; g.beginPath(); g.roundRect(px - 16, py - 16, pw + 32, ph + 32, 66); g.fill();
    g.save(); g.beginPath(); g.roundRect(px, py, pw, ph, 50); g.clip(); g.drawImage(last, px, py, pw, ph); g.restore();
    g.fillStyle = '#16120F'; g.beginPath(); g.roundRect(OW / 2 - 70, py - 6, 140, 26, 13); g.fill();
    g.restore();
    g.save(); g.globalAlpha = 1 - endK; g.font = '40px Itl'; g.fillStyle = '#D9442E'; g.textAlign = 'center'; g.fillText('QBK STUDIO', OW / 2, 112); g.restore();
    const cue = caps.find(c => T >= c.start && T < c.end && c.start < END_CARD);
    if (cue) { g.font = '54px Bld'; g.textAlign = 'center'; g.textBaseline = 'middle'; const lines = wrap(cue.text, 900), y0 = PY + VH * DSF + 92;
      lines.forEach((ln, j) => { const w = g.measureText(ln).width + 44, y = y0 + j * 74; g.fillStyle = '#2A2723'; g.beginPath(); g.roundRect(OW / 2 - w / 2, y - 37, w, 74, 18); g.fill(); g.fillStyle = '#FFFFFF'; g.fillText(ln, OW / 2, y + 2); }); }
  }
  if (endK > 0) {
    const k = ease(endK); g.save(); g.globalAlpha = k; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#D9442E'; g.beginPath(); g.roundRect(OW / 2 - 110, 560 - 110 + (1 - k) * 60, 220, 220, 52); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); const ix = OW / 2 + 8, iy = 560 + (1 - k) * 60; g.moveTo(ix - 34, iy - 48); g.lineTo(ix + 52, iy); g.lineTo(ix - 34, iy + 48); g.closePath(); g.fill();
    g.fillStyle = '#2A2723'; g.font = '150px Blk'; g.fillText('QBK', OW / 2, 820); g.fillStyle = '#D9442E'; g.fillText('STUDIO', OW / 2, 965);
    const T2 = T - END_CARD; g.font = '58px Bld'; g.fillStyle = '#2A2723';
    if (T2 > C(26) - END_CARD - 0.1) g.fillText('Bạn có ý tưởng,', OW / 2, 1160);
    if (T2 > C(27) - END_CARD - 0.1) { g.fillStyle = '#D9442E'; g.fillText('đoàn phim lo phần còn lại.', OW / 2, 1250); }
    g.font = '36px Bld'; g.fillStyle = '#6B6259'; g.fillText('Video ngắn 9:16 · vẽ tay · vệ tinh · 3D · giọng đọc tiếng Việt', OW / 2, 1420);
    g.restore();
  }
  if (!ff.stdin.write(cv.data())) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 150 === 0) process.stderr.write(`  ${i}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
writeWav(atmp, mixTrack(DUR, sfx));
const out = path.join(HERE, 'output/quang-cao-qbk-studio.mp4');
const res = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', vtmp, '-i', atmp, '-i', path.join(HERE, 'audio/narration.wav'), '-filter_complex', `[2:a]aresample=${SR},adelay=${LEAD * 1000}:all=1[n];[1:a][n]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5[a]`, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', `${DUR}`, '-movflags', '+faststart', out], {stdio: 'inherit'});
if (res.status === 0) { fs.rmSync(vtmp); fs.rmSync(atmp); }
console.log(JSON.stringify({output: out, seconds: DUR, frames, render_s: (Date.now() - t0) / 1000}));
