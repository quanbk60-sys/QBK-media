// Renders the character sheets: node build-sheets.mjs   (needs npm ci in studio/engine)
import path from 'node:path';
import fs from 'node:fs';
import {createCanvas, GlobalFonts, loadImage} from '/home/user/QBK-media/studio/engine/node_modules/@napi-rs/canvas/index.js';
import {Recorder, play} from '/home/user/QBK-media/studio/engine/lib/recorder.mjs';
import {drawAnimal, SPECIES} from '/home/user/QBK-media/studio/engine/lib/animals.mjs';
import {POSES, EXPR, blendPose} from '/home/user/QBK-media/studio/engine/lib/character.mjs';
import {PROPS} from '/home/user/QBK-media/studio/engine/lib/props.mjs';

const ENG = '/home/user/QBK-media/studio/engine', HERE = path.dirname(new URL(import.meta.url).pathname);
GlobalFonts.registerFromPath(path.join(ENG, 'fonts/NotoSans.ttf'), 'Sans');
GlobalFonts.registerFromPath(path.join(ENG, 'fonts/PatrickHand-Regular.ttf'), 'Hand');
const BG = '#F1ECE0';

function actor(ctx, species, x, y, scale, pose = 'stand', expr = 'neutral', extra = {}) {
  const R = new Recorder(); R.translate(x, y);
  drawAnimal(R, {costume: {species, ...(extra.costume || {})}, pose: blendPose(pose, pose, 0), expr, scale, facing: extra.facing ?? 1, t: extra.t ?? 0.4, blink: false, wind: 1});
  play(ctx, R.ops);
}
function label(ctx, text, x, y, size = 40, col = '#2A2723') { ctx.save(); ctx.font = `bold ${size}px Sans`; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(text, x, y); ctx.restore(); }
function bg(ctx, w, h) { ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h); }
function card(ctx, x, y, w, h) { ctx.save(); ctx.fillStyle = '#FBF8F0'; ctx.strokeStyle = '#D9D0BC'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.fill(); ctx.stroke(); ctx.restore(); }

async function xucxichSheet() {
  const W = 1800, H = 2960, cv = createCanvas(W, H), ctx = cv.getContext('2d'); bg(ctx, W, H);
  label(ctx, 'XÚC XÍCH  ·  chó lạp xưởng đốm  ·  bảng nhân vật', W / 2, 90, 58);
  card(ctx, 60, 140, 1000, 900);
  actor(ctx, 'xucxich', 480, 980, 1.7, 'stand', 'happy', {t: 0.35});
  const ref = await loadImage(path.join(HERE, '../ref/cho-mau.png'));
  const crops = [[60, 400, 540, 270, 'Ảnh mẫu'], [60, 680, 540, 270, 'Ảnh mẫu: mũi bị cua kẹp']];
  crops.forEach(([sx, sy, sw, sh, cap], i) => { const dx = 1100, dy = 160 + i * 440, dw = 640, dh = dw * sh / sw; ctx.save(); ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 20); ctx.clip(); ctx.drawImage(ref, sx, sy, sw, sh, dx, dy, dw, dh); ctx.restore(); ctx.strokeStyle = '#2A2723'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 20); ctx.stroke(); label(ctx, cap, dx + dw / 2, dy + dh + 44, 32); });
  label(ctx, 'Lông xám bạc đốm đen  ·  mày, má, mõm, chân vàng nâu  ·  tai dài cụp  ·  mũi đen', W / 2, 1100, 34);
  label(ctx, 'Vòng cổ đỏ thẻ hình xương  ·  áo tiên hiệp trắng xanh, tay áo rộng  ·  đuôi', W / 2, 1146, 34);
  label(ctx, 'BIỂU CẢM', W / 2, 1230, 46);
  const SW = {swollen: true};
  const ex = [['happy', 'Vui'], ['proud', 'Vênh váo'], ['scared', 'Hoảng', SW], ['cry', 'Khóc', SW], ['laugh', 'Cười lớn'], ['dazed', 'Ngơ ngác', SW], ['angry', 'Giận'], ['fury', 'Giận dữ']];
  ex.forEach(([k, n, cs], i) => { const cx = 225 + (i % 4) * 450, cy = 1260 + Math.floor(i / 4) * 500; card(ctx, cx - 210, cy, 420, 470); actor(ctx, 'xucxich', cx - 36, cy + 400, 0.85, 'stand', k, {costume: cs || {}}); label(ctx, n + (cs ? ' (mũi sưng)' : ''), cx, cy + 450, 30); });
  label(ctx, 'TƯ THẾ', W / 2, 2300, 46);
  const poses = [['stand', 'Đứng', 'smug'], ['point', 'Chỉ tay', 'proud'], ['crossed', 'Khoanh tay', 'smug'], ['sit', 'Ngồi', 'calm']];
  poses.forEach(([k, n, e], i) => { const cx = 225 + i * 450, cy = 2330; card(ctx, cx - 210, cy, 420, 280); actor(ctx, 'xucxich', cx - 30, cy + 235, 0.5, k, e); label(ctx, n, cx, cy + 268, 26); });
  const poses2 = [['lounge', 'Nằm lười', 'calm'], ['cheer', 'Reo', 'laugh'], ['think', 'Nghĩ', 'dazed'], ['plead', 'Van xin', 'sad']];
  poses2.forEach(([k, n, e], i) => { const cx = 225 + i * 450, cy = 2630; card(ctx, cx - 210, cy, 420, 300); const pk = k; actor(ctx, 'xucxich', cx - 30, cy + 255, 0.5, pk, e, {t: 0.3}); label(ctx, n, cx, cy + 288, 26); });
  fs.writeFileSync(path.join(HERE, 'xuc-xich-sheet.png'), cv.toBuffer('image/png'));
}

async function castSheet() {
  const W = 2160, H = 1500, cv = createCanvas(W, H), ctx = cv.getContext('2d'); bg(ctx, W, H);
  label(ctx, 'ĐOÀN VẬT TÔNG MÔN XÚC XÍCH', W / 2, 84, 60);
  const cast = [['xucxich', 'smug', 'stand'], ['meo', 'determined', 'stand'], ['ga', 'proud', 'stand'], ['rua', 'calm', 'stand'], ['khi', 'grin', 'stand'], ['cua', 'angry', 'point']];
  cast.forEach(([k, e, p], i) => { const cx = 380 + (i % 3) * 700, cy = 140 + Math.floor(i / 3) * 690; card(ctx, cx - 335, cy, 670, 650); actor(ctx, k, cx, cy + 540, 1.0, p, e); label(ctx, SPECIES[k].name, cx, cy + 614, 42); });
  fs.writeFileSync(path.join(HERE, 'cast.png'), cv.toBuffer('image/png'));
}

async function poseCheck() { // every pose x 5 species (arm / face overlap check)
  const names = Object.keys(POSES), cols = 8, rows = Math.ceil(names.length / cols), W = cols * 300, H = rows * 330 + 20, cv = createCanvas(W, H), ctx = cv.getContext('2d'); bg(ctx, W, H);
  names.forEach((k, i) => { const cx = 150 + (i % cols) * 300, cy = 10 + Math.floor(i / cols) * 330; card(ctx, cx - 140, cy, 280, 320); actor(ctx, 'xucxich', cx - 18, cy + 270, 0.42, k, 'happy', {t: 0.3}); label(ctx, k, cx, cy + 308, 22); });
  fs.writeFileSync(path.join(HERE, 'pose-check.png'), cv.toBuffer('image/png'));
}
async function extraSheet() { // supporting cast expression grids (for review)
  const W = 2000, H = 2300, cv = createCanvas(W, H), ctx = cv.getContext('2d'); bg(ctx, W, H);
  const ex = ['neutral', 'proud', 'scared', 'cry', 'laugh', 'dazed', 'angry'];
  ['meo', 'ga', 'rua', 'khi', 'cua'].forEach((k, r) => {
    label(ctx, SPECIES[k].name, 90, 60 + r * 450 + 30, 30);
    ex.forEach((e, i) => { const cx = 150 + i * 270, cy = 60 + r * 450; card(ctx, cx - 125, cy + 40, 250, 370); actor(ctx, k, cx, cy + 380, 0.5, k === 'cua' && i === 6 ? 'point' : 'stand', e); label(ctx, e, cx, cy + 406, 22); });
  });
  fs.writeFileSync(path.join(HERE, 'support-expressions.png'), cv.toBuffer('image/png'));
}

const which = process.argv[2] || 'all';
if (which === 'all' || which === 'xx') await xucxichSheet();
if (which === 'all' || which === 'cast') await castSheet();
if (which === 'all' || which === 'extra') await extraSheet();
if (which === 'all' || which === 'poses') await poseCheck();
console.log('ok');
