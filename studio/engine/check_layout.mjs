#!/usr/bin/env node
// Kiểm tra bố cục tự động (học từ skill map-location-video) + xuất bảng khung hình.
// node check_layout.mjs scene.json [--step 0.2] [--sheet out.png] [--at 1.8,7,12.5]
// Mỗi khung, các phần tử bds ghi hình chữ nhật vào s._rects. Báo lỗi khi:
//   NGANG  chữ, nhãn, thẻ tràn lề trái phải (lề 36/576 khung)
//   TREN   nhãn đè vùng phụ đề phía trên
//   GAP    nhãn cách thẻ dưới < 14/576
//   CHONG  hai nhãn chồng nhau, hoặc nhãn đè thân ghim khác
import fs from 'node:fs';
import {createCanvas} from '@napi-rs/canvas';
import {loadScene, makeRenderer, fitCaptions, preloadImages} from './lib/scene.mjs';
import {LAYOUT} from './lib/bds.mjs';

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const file = args.find(a => a.endsWith('.json')); if (!file) { console.error('usage: node check_layout.mjs scene.json [--step 0.2] [--sheet out.png] [--at t1,t2]'); process.exit(2); }
const s = loadScene(file); fitCaptions(s); await preloadImages(s);
const R = makeRenderer(s), L = LAYOUT(s), step = Number(opt('--step', 0.2)), bad = [], modes = {};
const ov = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
for (let T = 0; T < s.duration; T += step) {
  await R.prepare(T); R.frame(T); const rs = s._rects || [], at = T.toFixed(1);
  for (const r of rs) {
    if (r.kind !== 'body' && (r.x0 < L.M - 1 || r.x1 > s.width - L.M + 1)) bad.push(`NGANG t=${at} ${r.kind} ${r.x0.toFixed(0)}..${r.x1.toFixed(0)}`);
    if (r.kind === 'label') { modes[r.mode] = (modes[r.mode] || 0) + 1; if (r.y0 < L.TOP - 1) bad.push(`TREN t=${at} nhãn "${r.id}" y0=${r.y0.toFixed(0)} < ${L.TOP.toFixed(0)}`); }
    if (r.kind === 'label' && r.full && r.y1 > r.bottom + 1) bad.push(`GAP t=${at} nhãn "${r.id}" y1=${r.y1.toFixed(0)} > ${r.bottom.toFixed(0)}`);
  }
  const lab = rs.filter(r => r.kind === 'label' && r.full), body = rs.filter(r => r.kind === 'body'), cards = rs.filter(r => r.kind === 'card');
  for (let i = 0; i < lab.length; i++) {
    for (let j = i + 1; j < lab.length; j++) if (ov(lab[i], lab[j])) bad.push(`CHONG t=${at} nhãn "${lab[i].id}" / "${lab[j].id}"`);
    for (const b of body) if (b.id !== lab[i].id && ov(lab[i], b)) bad.push(`CHONG t=${at} nhãn "${lab[i].id}" đè ghim "${b.id}"`);
    for (const c of cards) if (ov(lab[i], c)) bad.push(`CHONG t=${at} nhãn "${lab[i].id}" đè thẻ`);
  }
}
const out = {seconds: s.duration, checkedEvery: step, violationCount: bad.length, violations: bad.slice(0, 30), labelModes: modes};
const sheetF = opt('--sheet');
if (sheetF) {
  const times = opt('--at') ? opt('--at').split(',').map(Number) : s.shots.map(sh => +(sh.start + Math.min(sh.end - sh.start - 0.15, (sh.end - sh.start) * 0.85)).toFixed(2));
  const cols = Math.min(5, times.length), rows = Math.ceil(times.length / cols), tw = 324, th = Math.round(tw * s.height / s.width);
  const sheet = createCanvas(cols * tw, rows * th), sc = sheet.getContext('2d');
  for (const [i, T] of times.entries()) { await R.prepare(T); R.frame(T); const ox = (i % cols) * tw, oy = Math.floor(i / cols) * th; sc.drawImage(R.cv, ox, oy, tw, th);
    sc.save(); sc.strokeStyle = 'rgba(255,0,200,.85)'; sc.setLineDash([4, 3]); sc.strokeRect(ox + L.M * tw / s.width, oy + 2, (s.width - 2 * L.M) * tw / s.width, th - 4); sc.fillStyle = '#fff'; sc.font = '16px QBKBold'; sc.fillText(`${T}s`, ox + 6, oy + th - 8); sc.restore(); }
  fs.writeFileSync(sheetF, sheet.toBuffer('image/png')); out.sheet = sheetF; out.sheetTimes = times;
}
console.log(JSON.stringify(out, null, 1));
process.exit(bad.length ? 1 : 0);
