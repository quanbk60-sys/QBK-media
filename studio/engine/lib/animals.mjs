// Chibi animal cast (big head, two legs, xianxia robes). Same call shape as drawCharacter so scene.json can use it:
// a cast entry with `species` ("xucxich" | "meo" | "ga" | "rua" | "khi" | "cua") is drawn by drawAnimal.
// Reuses the pose fields (fu ff bu bf ft fk bt bk lean nod lie bob) and EXPR of character.mjs.
// Only Recorder-compatible Canvas calls (no clip, no gradients, no dashes). Origin = ground point between the feet.
import {lerp, clamp, color} from './math.mjs';
import {EXPR} from './character.mjs';

const INK = '#2A2723', LW = 5.5, K = 1.15;
const D = {thigh: 44, shin: 40, upper: 54, fore: 48};
const segp = (p, a, L) => [p[0] + L * Math.sin(a), p[1] + L * Math.cos(a)];

export const SPECIES = {
  xucxich: {hr: 118, name: 'Xúc Xích', head: 'dog', fur: '#B3B9C1', furShade: '#8A9099', dark: '#3E4249', tan: '#CB8B3C', tanShade: '#A86D2B', leg: '#CB8B3C', paw: '#D9A055',
    robe: '#E9F3F7', robeShade: '#B7D0DF', trim: '#6F93B3', sash: '#8FB0CC', bw: 1, hunch: 0, hy: 72, hx: 12},
  meo: {hr: 104, name: 'Mèo Con', head: 'cat', fur: '#E9A24F', furShade: '#C98233', dark: '#B3681F', tan: '#F8E0B5', tanShade: '#E3C58F', leg: '#E9A24F', paw: '#F8E0B5',
    robe: '#B9A07E', robeShade: '#94805F', trim: '#7A6446', sash: '#8B6B4A', bw: 0.78, hunch: 0.04, hy: 66, hx: 8, patched: true},
  ga: {hr: 98, name: 'Gà Thiếu Gia', head: 'rooster', fur: '#FBF4E6', furShade: '#E6D8BC', dark: '#C8372D', tan: '#F2A93B', tanShade: '#D98A1F', leg: '#F2A93B', paw: '#F2A93B',
    robe: '#7C4A8F', robeShade: '#5A3169', trim: '#E7B93A', sash: '#E7B93A', bw: 1.05, hunch: -0.04, hy: 66, hx: 6, brocade: true},
  rua: {hr: 100, name: 'Rùa Trưởng Lão', head: 'turtle', fur: '#92BC74', furShade: '#6E9A56', dark: '#4F7A42', tan: '#D9E7B8', tanShade: '#B7C890', leg: '#92BC74', paw: '#92BC74',
    robe: '#DCCBA0', robeShade: '#B8A57B', trim: '#8A6B3F', sash: '#9A7A4B', bw: 1.05, hunch: 0.1, hy: 60, hx: 26, shell: true, prop: 'staff'},
  khi: {hr: 100, name: 'Khỉ Tạp Dịch', head: 'monkey', fur: '#9C6B3F', furShade: '#7A4F2B', dark: '#5B3A20', tan: '#EBCCA2', tanShade: '#D2AE80', leg: '#9C6B3F', paw: '#EBCCA2',
    robe: '#A7A198', robeShade: '#847E75', trim: '#6B665E', sash: '#C9A66B', bw: 0.92, hunch: 0.05, hy: 66, hx: 8, prop: 'broom'},
  cua: {name: 'Cua', crab: true, shell: '#D9503A', shellShade: '#B13A28', light: '#F08B6E', dark: '#8E2A1E'},
};
export const SPECIES_NAMES = Object.keys(SPECIES);

// ---------- small drawing helpers ----------
function ell(ctx, x, y, rx, ry, fill, w = LW, rot = 0, alpha) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = color(fill); if (alpha !== undefined) { ctx.save(); ctx.globalAlpha *= alpha; ctx.fill(); ctx.restore(); } else ctx.fill(); }
  if (w) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
}
function poly(ctx, pts, fill, w = LW, alpha) {
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  if (fill) { ctx.fillStyle = color(fill); if (alpha !== undefined) { ctx.save(); ctx.globalAlpha *= alpha; ctx.fill(); ctx.restore(); } else ctx.fill(); }
  if (w) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); }
}
function stroke(ctx, pts, w = LW, c = INK) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }
// soft shadow crescent hugging the edge of an ellipse (always inside the shape)
function shade(ctx, cx, cy, rx, ry, a0, a1, depth, col, alpha = 0.5) {
  const am = (a0 + a1) / 2, p0 = [cx + rx * Math.cos(a0), cy + ry * Math.sin(a0)], p1 = [cx + rx * Math.cos(a1), cy + ry * Math.sin(a1)];
  const mi = [cx + rx * Math.cos(am) * (1 - depth), cy + ry * Math.sin(am) * (1 - depth)];
  const c = [2 * mi[0] - (p0[0] + p1[0]) / 2, 2 * mi[1] - (p0[1] + p1[1]) / 2];
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, a1); ctx.quadraticCurveTo(c[0], c[1], p0[0], p0[1]); ctx.closePath();
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color(col); ctx.fill(); ctx.restore();
}
function spots(ctx, list, col, alpha = 1) { for (const [x, y, rx, ry, r] of list) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, r || 0, 0, Math.PI * 2); ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = col; ctx.fill(); ctx.restore(); } }
function drop(ctx, x, y, s, fill = '#9FD3F2') { ctx.beginPath(); ctx.moveTo(x, y - 16 * s); ctx.quadraticCurveTo(x + 12 * s, y, x, y + 8 * s); ctx.quadraticCurveTo(x - 12 * s, y, x, y - 16 * s); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }

// ---------- eyes, brows, mouths (shared by all species) ----------
// eye: {x, y, r, inner: +1|-1 (side facing the nose)}, F: {iris, lid (fur colour), look: [dx, dy] fraction}
function drawEye(ctx, eye, E, F, blink) {
  const {x, y, r} = eye, s = eye.inner, look = F.look || [0.18, 0.05];
  const kind = blink < 1 && E.eye !== 'shut' ? 'blink' : E.eye;
  if (kind === 'blink' || kind === 'shut') {
    if (E.mouth === 'shout' || E.mouth === 'wail' || E.tears) { // squeezed > < (pain / crying)
      stroke(ctx, [[x - s * r * 0.9, y - r * 0.55], [x + s * r * 0.7, y + r * 0.05], [x - s * r * 0.9, y + r * 0.6]], 7);
    } else if (E.laugh) { ctx.beginPath(); ctx.moveTo(x - r, y + r * 0.35); ctx.quadraticCurveTo(x, y - r * 0.95, x + r, y + r * 0.35); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(x - r, y - r * 0.1); ctx.quadraticCurveTo(x, y + r * 0.75, x + r, y - r * 0.1); ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.stroke(); }
    return;
  }
  const wide = kind === 'wide', rx = r * (wide ? 1.14 : 1), ry = r * (wide ? 1.3 : 1.1);
  ell(ctx, x, y, rx, ry, '#fff', 4.5);
  let px = x + look[0] * r, py = y + look[1] * r, pr = r * 0.66;
  if (kind === 'side') px = x + r * 0.42;
  if (wide) pr = E.dazed ? r * 0.2 : r * 0.3;
  if (E.dazed) { px = x + s * -r * 0.15; py = y - r * 0.25; }
  if (kind === 'side') { pr = r * 0.6; }
  if (wide) { px = x + (E.dazed ? 0 : look[0] * r * 0.5); }
  ell(ctx, px, py, pr, pr * 1.05, '#3A2418', 0);
  if (!wide || !E.dazed) ell(ctx, px, py, pr * 0.62, pr * 0.66, F.iris || '#5A3A22', 0);
  ell(ctx, px, py, pr * 0.34, pr * 0.36, '#1B1210', 0);
  if (!wide || pr > r * 0.25) { ell(ctx, px - pr * 0.32, py - pr * 0.38, pr * 0.3, pr * 0.3, '#fff', 0); ell(ctx, px + pr * 0.34, py + pr * 0.36, pr * 0.14, pr * 0.14, '#fff', 0); }
  // eyelids drawn as fur-coloured caps with an ink edge
  const cap = frac => { const yy = y - ry + 2 * ry * frac; ctx.beginPath(); ctx.moveTo(x - rx - 3, y - ry - 6); ctx.lineTo(x + rx + 3, y - ry - 6); ctx.lineTo(x + rx + 3, yy); ctx.lineTo(x - rx - 3, yy); ctx.closePath(); ctx.fillStyle = F.lid; ctx.fill(); stroke(ctx, [[x - rx - 1, yy], [x + rx + 1, yy]], 6); };
  const slant = (hi, lo) => { // angry lid: outer edge high, inner edge low
    ctx.beginPath(); ctx.moveTo(x - rx - 3, y - ry - 8); ctx.lineTo(x + rx + 3, y - ry - 8);
    const yo = y - ry + 2 * ry * hi, yi = y - ry + 2 * ry * lo;
    if (s > 0) { ctx.lineTo(x + rx + 3, yi); ctx.lineTo(x - rx - 3, yo); } else { ctx.lineTo(x + rx + 3, yo); ctx.lineTo(x - rx - 3, yi); }
    ctx.closePath(); ctx.fillStyle = F.lid; ctx.fill();
    stroke(ctx, s > 0 ? [[x - rx - 2, yo], [x + rx + 2, yi]] : [[x - rx - 2, yi], [x + rx + 2, yo]], 6); };
  if (kind === 'squint') cap(0.5); else if (kind === 'half') cap(0.55);
  else if (E.brow >= 0.9 && kind === 'dot') slant(0.12, 0.5);
  else if (E.brow >= 0.65 && kind === 'dot') slant(0.05, 0.3);
  else if (E.brow >= 0.55 && kind === 'side') cap(0.38);
  else if (E.brow <= -0.55 && kind === 'dot') slant(0.28, 0.02); // sad droopy upper lid
}
function drawBrow(ctx, eye, E, ink = INK, rise = 1.55) {
  const {x, y, r} = eye, s = eye.inner, b = E.brow || 0;
  if (Math.abs(b) < 0.25 && !E.dazed) return;
  let ob = -b * 5, ib = b * 16; if (E.dazed && s < 0) { ob = -14; ib = -12; } else if (E.dazed) { ob = 4; ib = 2; }
  stroke(ctx, [[x - s * r * 1.15, y - r * rise + ob], [x + s * r * 1.05, y - r * (rise - 0.1) + ib]], 8, ink);
}
// mouth around anchor (mx,my); s = size
function mouth(ctx, kind, mx, my, s = 1) {
  const dark = '#7A2A2A', tongue = '#EF7C84';
  ctx.lineWidth = 5.5; ctx.strokeStyle = INK;
  const tg = (x, y, rx, ry) => ell(ctx, x, y, rx, ry, tongue, 3.5);
  switch (kind) {
    case 'smile': ctx.beginPath(); ctx.moveTo(mx - 24 * s, my - 4 * s); ctx.quadraticCurveTo(mx, my + 16 * s, mx + 24 * s, my - 4 * s); ctx.stroke(); break;
    case 'grin': case 'laugh': { const big = kind === 'laugh' ? 1.25 : 1; ctx.beginPath(); ctx.moveTo(mx - 28 * s, my - 8 * s); ctx.quadraticCurveTo(mx, my + 40 * s * big, mx + 28 * s, my - 8 * s); ctx.closePath(); ctx.fillStyle = dark; ctx.fill(); ctx.stroke(); tg(mx, my + 14 * s * big, 13 * s, 7 * s * big); break; }
    case 'frown': ctx.beginPath(); ctx.moveTo(mx - 22 * s, my + 7 * s); ctx.quadraticCurveTo(mx, my - 10 * s, mx + 22 * s, my + 7 * s); ctx.stroke(); break;
    case 'shout': { ctx.beginPath(); ctx.ellipse(mx, my + 8 * s, 22 * s, 28 * s, 0, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill(); ctx.stroke(); tg(mx, my + 22 * s, 13 * s, 8 * s); break; }
    case 'o': ell(ctx, mx, my + 4 * s, 11 * s, 14 * s, dark, 4.5); break;
    case 'wobble': ctx.beginPath(); ctx.moveTo(mx - 24 * s, my); for (let i = 1; i <= 8; i++) ctx.lineTo(mx - 24 * s + i * 6 * s, my + (i % 2 ? -5 : 5) * s); ctx.stroke(); break;
    case 'smirk': ctx.beginPath(); ctx.moveTo(mx - 20 * s, my + 5 * s); ctx.quadraticCurveTo(mx + 6 * s, my + 10 * s, mx + 26 * s, my - 10 * s); ctx.stroke(); break;
    case 'wail': { ctx.beginPath(); ctx.moveTo(mx - 30 * s, my - 2 * s); ctx.quadraticCurveTo(mx, my - 22 * s, mx + 30 * s, my - 2 * s); ctx.quadraticCurveTo(mx + 26 * s, my + 36 * s, mx, my + 36 * s); ctx.quadraticCurveTo(mx - 26 * s, my + 36 * s, mx - 30 * s, my - 2 * s); ctx.fillStyle = dark; ctx.fill(); ctx.stroke(); tg(mx, my + 28 * s, 15 * s, 8 * s); break; }
    case 'snarl': { ctx.beginPath(); ctx.moveTo(mx - 28 * s, my + 4 * s); ctx.quadraticCurveTo(mx, my - 14 * s, mx + 28 * s, my + 4 * s); ctx.lineTo(mx + 22 * s, my + 24 * s); ctx.quadraticCurveTo(mx, my + 14 * s, mx - 22 * s, my + 24 * s); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); stroke(ctx, [[mx - 8 * s, my + 2 * s], [mx - 8 * s, my + 18 * s]], 3); stroke(ctx, [[mx + 8 * s, my + 2 * s], [mx + 8 * s, my + 18 * s]], 3); break; }
    default: ctx.beginPath(); ctx.moveTo(mx - 18 * s, my); ctx.lineTo(mx + 18 * s, my - 2 * s); ctx.stroke();
  }
}
function extras(ctx, E, hx, hy, R, face) { // sweat, blush, tears, anger vein, ? marks
  if (E.sweat) { drop(ctx, hx - R * 0.72, hy - R * 0.5, 1.4); drop(ctx, hx - R * 0.95, hy - R * 0.12, 1); }
  if (E.blush) for (const [x, y] of face.cheeks) ell(ctx, x, y, 22, 12, '#F08A8A', 0, 0, 0.7);
  if (E.tears) for (const e of face.eyes) {
    const sx = e.x + e.inner * -4, y0 = e.y + e.r * 0.8;
    ctx.beginPath(); ctx.moveTo(sx - 9, y0); ctx.bezierCurveTo(sx - 20, y0 + 40, sx - 6, y0 + 70, sx - 14, y0 + 100); ctx.lineTo(sx + 8, y0 + 100); ctx.bezierCurveTo(sx + 12, y0 + 70, sx + 20, y0 + 40, sx + 9, y0); ctx.closePath();
    ctx.fillStyle = '#9FD3F2'; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke(); ell(ctx, sx - 2, y0 + 104, 12, 7, '#9FD3F2', 3.5);
  } else if (E.tear) { const e = face.eyes[1]; drop(ctx, e.x - e.inner * 6, e.y + e.r * 1.5, 1.5); }
  if (E.vein) { const vx = hx + R * 0.55, vy = hy - R * 0.92; ctx.lineWidth = 7; ctx.strokeStyle = '#D6322A';
    for (const [a, b, c, d] of [[-24, -8, -8, -8], [8, -8, 8, -24], [8, 8, 24, 8], [-8, 8, -8, 24]]) { ctx.beginPath(); ctx.moveTo(vx + a, vy + b); ctx.quadraticCurveTo(vx + (a + c) / 2 + (a < 0 || c < 0 ? -6 : 6), vy + (b + d) / 2, vx + c, vy + d); ctx.stroke(); } }
  if (E.dazed) { ctx.save(); ctx.fillStyle = INK; ctx.font = '70px Hand'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', hx + R * 0.95, hy - R * 0.75); ctx.restore(); }
}

// ---------- heads (local coords: head centre = 0,0, facing right) ----------
function ear(ctx, bx, by, rot, len, wid, fill, shadeCol, spotCol, spotList) {
  ctx.save(); ctx.translate(bx, by); ctx.rotate(rot);
  const L = len / 170, W = wid / 80;
  ctx.beginPath(); ctx.moveTo(-26 * W, 0); ctx.bezierCurveTo(-54 * W, 40 * L, -56 * W, 120 * L, -30 * W, 170 * L); ctx.quadraticCurveTo(0, 192 * L, 28 * W, 160 * L); ctx.bezierCurveTo(48 * W, 110 * L, 46 * W, 40 * L, 28 * W, 0); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (spotList) spots(ctx, spotList.map(([x, y, rx, ry, r]) => [x * W, y * L, rx * W, ry * L, r]), spotCol);
  // inner shade on the back edge
  ctx.beginPath(); ctx.moveTo(-26 * W, 0); ctx.bezierCurveTo(-54 * W, 40 * L, -56 * W, 120 * L, -30 * W, 170 * L); ctx.quadraticCurveTo(-12 * W, 180 * L, -8 * W, 150 * L); ctx.bezierCurveTo(-20 * W, 110 * L, -16 * W, 50 * L, -10 * W, 0); ctx.closePath();
  ctx.save(); ctx.globalAlpha *= 0.45; ctx.fillStyle = shadeCol; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(-26 * W, 0); ctx.bezierCurveTo(-54 * W, 40 * L, -56 * W, 120 * L, -30 * W, 170 * L); ctx.quadraticCurveTo(0, 192 * L, 28 * W, 160 * L); ctx.bezierCurveTo(48 * W, 110 * L, 46 * W, 40 * L, 28 * W, 0); ctx.closePath();
  ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
}

function headDog(ctx, sp, o) {
  const {E, blink, t, swing} = o, R = 118, F = {iris: '#6A4326', lid: sp.fur};
  const eyes = [{x: -16, y: -8, r: 26, inner: 1}, {x: 62, y: -10, r: 24, inner: -1}];
  const earSpots = [[-4, 34, 15, 11, 0.4], [14, 80, 13, 17, -0.3], [-12, 112, 11, 9, 0], [8, 14, 9, 8, 0]];
  // far ear (behind the head)
  ear(ctx, 70, -80, -0.62 - swing * 0.6, 140, 66, '#8E949C', sp.furShade, sp.dark, [[2, 40, 14, 10, 0.2], [10, 96, 12, 15, 0]]);
  // head
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = sp.fur; ctx.fill();
  shade(ctx, 0, 0, R, R, 0.2, 1.9, 0.12, sp.furShade, 0.55);
  // dapple: black blotches
  spots(ctx, [[-26, -78, 26, 17, 0.5], [34, -72, 20, 14, -0.4], [78, -44, 15, 12, 0.3], [-72, -36, 17, 24, 0.2], [6, -40, 11, 8, 0], [-58, 4, 12, 10, 0], [92, -2, 10, 8, 0]], sp.dark);
  spots(ctx, [[-8, -100, 12, 9, 0], [58, -88, 10, 8, 0], [-90, -64, 10, 8, 0.7]], sp.furShade);
  // tan lower face (cheek + jaw)
  ctx.beginPath(); ctx.arc(0, 0, R, 0.16, 2.78); ctx.quadraticCurveTo(10, 28, Math.cos(0.16) * R, Math.sin(0.16) * R); ctx.closePath(); ctx.fillStyle = sp.tan; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // tan brow spots
  for (const e of eyes) ell(ctx, e.x + e.inner * 2, e.y - e.r * 1.62 + (E.brow || 0) * 3, 17, 11, sp.tan, 0);
  // muzzle (long snout)
  ctx.save(); ctx.translate(98, 38); ctx.rotate(0.1);
  ctx.beginPath(); ctx.ellipse(0, 0, 80, 44, 0, 0, Math.PI * 2); ctx.fillStyle = sp.tan; ctx.fill();
  shade(ctx, 0, 0, 80, 44, 0.3, 2.9, 0.22, sp.tanShade, 0.7);
  ctx.beginPath(); ctx.ellipse(0, 0, 80, 44, 0, Math.PI * 1.07, Math.PI * 1.95); ctx.quadraticCurveTo(0, -27, -76, -20); ctx.closePath(); ctx.fillStyle = sp.dark; ctx.globalAlpha *= 0.8; ctx.fill(); ctx.globalAlpha /= 0.8;
  ctx.beginPath(); ctx.ellipse(0, 0, 80, 44, 0, 0, Math.PI * 2); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
  // nose
  const sw = o.c.swollen;
  if (sw) { ell(ctx, 168, 10, 40, 34, '#EE5A66', 5.5); ell(ctx, 168, 10, 40, 34, null, 0); shade(ctx, 168, 10, 40, 34, 0.3, 2.3, 0.3, '#B7283A', 0.55); ell(ctx, 156, -2, 11, 7, '#FFC2C6', 0, -0.4); }
  else { ell(ctx, 168, 12, 27, 21, '#24201D', 5, -0.15); ell(ctx, 160, 5, 9, 5, '#fff', 0, -0.4, 0.85); }
  // eyes
  const face = {eyes, cheeks: [[40, 52], [120, 66]]};
  for (const e of eyes) drawEye(ctx, e, E, F, blink);
  for (const e of eyes) drawBrow(ctx, e, E, '#4A2E14', 1.5);
  // mouth: on the muzzle, below the nose
  const m = E.mouth, mx = 120, my = 52;
  if (m === 'shout' || m === 'wail' || m === 'grin' || m === 'laugh') {
    ctx.save(); mouthOpen(ctx, m, mx + 8, my + 6); ctx.restore();
  } else mouth(ctx, m, mx + 10, my + 2, 0.82);
  // near ear (in front, hangs on the left)
  ear(ctx, -74, -66, 0.1 + swing, 178, 84, sp.fur, sp.furShade, sp.dark, earSpots);
  extras(ctx, E, 0, 0, R, face);
  if (o.c.swollen) { stroke(ctx, [[182, -34], [194, -48]], 5); stroke(ctx, [[206, -14], [222, -20]], 5); stroke(ctx, [[208, 14], [224, 18]], 5); }
}
function mouthOpen(ctx, m, mx, my) { // open mouths for the long snout: jaw drops below the muzzle
  const dark = '#7A2A2A', big = m === 'shout' || m === 'wail' || m === 'laugh' ? 1 : 0.7, w = 44, h = 38 * big;
  ctx.beginPath(); ctx.moveTo(mx - w * 0.75, my - 6); ctx.quadraticCurveTo(mx, my - 14, mx + w * 0.8, my - 8); ctx.quadraticCurveTo(mx + w * 0.75, my + h, mx, my + h); ctx.quadraticCurveTo(mx - w * 0.7, my + h, mx - w * 0.75, my - 6); ctx.closePath();
  ctx.fillStyle = dark; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  ell(ctx, mx + 2, my + h * 0.72, w * 0.42, h * 0.3, '#EF7C84', 3.5);
}

function headCat(ctx, sp, o) {
  const {E, blink, swing} = o, R = 102, F = {iris: '#4F9A5A', lid: sp.fur};
  const eyes = [{x: -4, y: 2, r: 27, inner: 1}, {x: 62, y: 2, r: 27, inner: -1}];
  // ears (triangles)
  for (const [x, rot, sc] of [[-52, -0.15 + swing * 0.2, 1], [58, 0.28 - swing * 0.2, 0.94]]) {
    ctx.save(); ctx.translate(x, -70); ctx.rotate(rot); ctx.scale(sc, sc);
    poly(ctx, [[-44, 10], [-10, -92], [46, 8]], sp.fur, LW); poly(ctx, [[-26, 0], [-10, -62], [28, -2]], '#F4A5A0', 0);
    ctx.restore();
  }
  ctx.beginPath(); ctx.ellipse(0, 6, R + 8, R - 4, 0, 0, Math.PI * 2); ctx.fillStyle = sp.fur; ctx.fill();
  shade(ctx, 0, 6, R + 8, R - 4, 0.3, 1.9, 0.12, sp.furShade, 0.55);
  // stripes on forehead
  for (const [x, a] of [[-18, -0.15], [14, 0], [46, 0.15]]) { ctx.save(); ctx.translate(x, -88); ctx.rotate(a); spots(ctx, [[0, 0, 7, 16, 0]], sp.dark); ctx.restore(); }
  spots(ctx, [[-100, 6, 12, 7, 0.2], [-98, 34, 12, 6, 0.4], [108, 6, 10, 6, 0]], sp.dark);
  ctx.beginPath(); ctx.ellipse(0, 6, R + 8, R - 4, 0, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // muzzle patch
  ell(ctx, 38, 52, 46, 32, sp.tan, 0);
  for (const e of eyes) drawEye(ctx, e, E, F, blink);
  for (const e of eyes) drawBrow(ctx, e, E, INK, 1.4);
  poly(ctx, [[28, 30], [50, 30], [39, 44]], '#EF8D93', 4);
  mouth(ctx, E.mouth, 39, 54, 0.75);
  for (const s of [1, -1]) for (const dy of [-8, 6]) stroke(ctx, [[39 + s * 50, 46 + dy * 0.4], [39 + s * 108, 40 + dy * 2.2]], 3.2);
  extras(ctx, E, 0, 0, R, {eyes, cheeks: [[-22, 46], [90, 46]]});
  if (o.c.patched !== false && sp.patched) { poly(ctx, [[-58, -52], [-30, -64], [-24, -38], [-52, -28]], '#E8D9B5', 3.5); stroke(ctx, [[-54, -44], [-30, -52]], 2.5); } // plaster
}

function headRooster(ctx, sp, o) {
  const {E, blink, t} = o, R = 98, F = {iris: '#7A3A12', lid: sp.fur};
  const eyes = [{x: 0, y: -10, r: 21, inner: 1}, {x: 56, y: -12, r: 20, inner: -1}];
  // neck hackle (feather ruff) behind the head
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + i * 0.113); ell(ctx, Math.cos(a) * 92 - 4, 56 + Math.sin(a) * 66, 30, 24, i % 2 ? '#F2A93B' : '#E27B2C', 5); }
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = sp.fur; ctx.fill();
  shade(ctx, 0, 0, R, R, 0.3, 1.9, 0.12, sp.furShade, 0.6);
  // feather tuft on the crown
  for (const [x, y, rot] of [[-50, -84, -0.7], [-22, -98, -0.25]]) ell(ctx, x, y, 12, 28, sp.fur, 5, rot);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // comb: big scalloped crest leaning forward
  const lobes = [[-34, -102, 26], [-4, -128, 31], [34, -128, 30], [62, -102, 26], [82, -72, 19]];
  for (const [x, y, r] of lobes) ell(ctx, x + Math.sin(t * 3) * 1.5, y, r, r * 1.05, '#E03A32', 5.5);
  ell(ctx, 24, -88, 70, 26, '#E03A32', 0); for (const [x, y, r] of lobes) ell(ctx, x, y, r * 0.35, r * 0.28, '#F58C84', 0, -0.4);
  ctx.beginPath(); ctx.arc(0, 0, R, Math.PI * 1.18, Math.PI * 1.7); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // red cheek + wattle
  ell(ctx, 26, 44, 20, 12, '#F58C84', 0, 0, 0.8);
  // beak (opens with the mouth)
  const open = {shout: 1, wail: 1, laugh: 1, grin: 0.8, o: 0.5, snarl: 0.7}[E.mouth] || 0;
  poly(ctx, [[84, 8], [150, 26 - open * 2], [88, 36 - open * 2]], '#F2A93B', 5.5);
  if (open) { poly(ctx, [[88, 34 + open * 4], [138, 32 + open * 18], [90, 40 + open * 32]], '#F2A93B', 5.5); poly(ctx, [[96, 36 + open * 4], [128, 36 + open * 14], [98, 38 + open * 24]], '#7A2A2A', 0); ell(ctx, 108, 36 + open * 22, 11, 6, '#EF7C84', 0); }
  ctx.beginPath(); ctx.moveTo(98, 50 + open * 34); ctx.quadraticCurveTo(114, 110 + open * 12, 90, 118 + open * 8); ctx.quadraticCurveTo(70, 100, 82, 50 + open * 28); ctx.closePath(); ctx.fillStyle = '#E03A32'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  if (E.mouth === 'smirk' || E.mouth === 'smile') stroke(ctx, [[90, 34], [132, 30]], 4);
  for (const e of eyes) drawEye(ctx, e, E, F, blink);
  for (const e of eyes) drawBrow(ctx, e, E, INK, 1.6);
  if (E.proud) for (const e of eyes) stroke(ctx, [[e.x - 22, e.y - 36], [e.x + 24, e.y - 42]], 7);
  extras(ctx, E, 0, 0, R, {eyes, cheeks: [[26, 44], [60, 56]]});
}

function headTurtle(ctx, sp, o) {
  const {E, blink} = o, rx = 104, ry = 88, F = {iris: '#3A2A14', lid: sp.fur};
  const eyes = [{x: -6, y: -4, r: 18, inner: 1}, {x: 54, y: -6, r: 17, inner: -1}];
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = sp.fur; ctx.fill();
  shade(ctx, 0, 0, rx, ry, 0.3, 1.9, 0.12, sp.furShade, 0.6);
  spots(ctx, [[-52, -48, 11, 8, 0.4], [-20, -66, 9, 7, 0], [-70, -6, 8, 6, 0]], sp.furShade, 0.8);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // snout + beak
  ell(ctx, 86, 28, 40, 30, sp.tan, 5);
  stroke(ctx, [[66, 40], [124, 38]], 4.5);
  ell(ctx, 112, 12, 5, 4, INK, 0);
  for (const e of eyes) drawEye(ctx, e, E, F, blink);
  // wrinkles under eyes
  for (const e of eyes) { stroke(ctx, [[e.x - 14, e.y + e.r + 8], [e.x + 12, e.y + e.r + 10]], 3); stroke(ctx, [[e.x - 10, e.y + e.r + 16], [e.x + 8, e.y + e.r + 18]], 3); }
  // long bushy white brows (flow back)
  for (const e of eyes) {
    const b = (E.brow || 0), y = e.y - e.r * 1.5 - b * 4, tilt = e.inner * b * 12;
    ctx.beginPath(); ctx.moveTo(e.x + e.inner * 22, y + tilt + 4); ctx.quadraticCurveTo(e.x, y - 14, e.x - e.inner * 52, y + 10 - tilt); ctx.quadraticCurveTo(e.x - e.inner * 20, y + 16, e.x + e.inner * 22, y + tilt + 4); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
  }
  mouth(ctx, E.mouth === 'flat' ? 'flat' : E.mouth, 92, 46, 0.7);
  // white goatee flowing down
  ctx.beginPath(); ctx.moveTo(52, 56); ctx.bezierCurveTo(44, 120, 56, 170, 40, 214); ctx.bezierCurveTo(78, 196, 108, 150, 118, 66); ctx.quadraticCurveTo(90, 74, 52, 56); ctx.closePath();
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
  stroke(ctx, [[70, 84], [66, 150]], 3); stroke(ctx, [[92, 84], [84, 160]], 3);
  extras(ctx, E, 0, 0, 96, {eyes, cheeks: [[20, 30], [60, 40]]});
}

function headMonkey(ctx, sp, o) {
  const {E, blink, swing} = o, R = 100, F = {iris: '#4A2C14', lid: sp.tan};
  const eyes = [{x: 6, y: -6, r: 22, inner: 1}, {x: 60, y: -8, r: 21, inner: -1}];
  // ears: big round
  ell(ctx, -88, 6 + swing * 6, 34, 38, sp.fur, 5.5); ell(ctx, -88, 6 + swing * 6, 20, 24, sp.tan, 0);
  ell(ctx, 92, -20, 26, 30, sp.furShade, 5.5);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = sp.fur; ctx.fill();
  shade(ctx, 0, 0, R, R, 0.3, 1.9, 0.12, sp.furShade, 0.6);
  // hair tuft
  for (const [x, y, rot] of [[-14, -98, -0.5], [10, -104, 0], [34, -96, 0.5]]) ell(ctx, x, y, 11, 24, sp.fur, 5, rot);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // face mask (heart shape): two brow lobes + muzzle
  ell(ctx, 8, -6, 32, 34, sp.tan, 0); ell(ctx, 62, -8, 30, 33, sp.tan, 0);
  ctx.beginPath(); ctx.ellipse(36, 34, 56, 50, 0, 0, Math.PI * 2); ctx.fillStyle = sp.tan; ctx.fill();
  shade(ctx, 36, 34, 56, 50, 0.4, 2.8, 0.18, sp.tanShade, 0.6);
  stroke(ctx, [[-20, -20], [-18, 14], [4, 44]], 0);
  for (const e of eyes) drawEye(ctx, e, E, F, blink);
  for (const e of eyes) drawBrow(ctx, e, E, '#4A2C14', 1.5);
  ell(ctx, 28, 24, 4.5, 6, INK, 0); ell(ctx, 48, 24, 4.5, 6, INK, 0);
  mouth(ctx, E.mouth, 40, 54, 0.82);
  extras(ctx, E, 0, 0, R, {eyes, cheeks: [[-4, 48], [86, 44]]});
}

const HEADS = {dog: headDog, cat: headCat, rooster: headRooster, turtle: headTurtle, monkey: headMonkey};

// ---------- back items & body extras ----------
function backItems(ctx, sp, o) {
  const {t, wind} = o, w = Math.sin(t * 9) * 10 * wind;
  if (sp.head === 'dog') { // tail: tapered, wagging
    const wag = Math.sin(t * 10) * 12 * Math.min(2, wind);
    ctx.beginPath(); ctx.moveTo(-52, 6); ctx.bezierCurveTo(-96, 8, -112 + wag, -34, -110 + wag, -78); ctx.bezierCurveTo(-96 + wag, -60, -84, -20, -52, -16); ctx.closePath();
    ctx.fillStyle = sp.fur; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke(); spots(ctx, [[-80, -8, 9, 6, 0.2], [-102 + wag, -50, 6, 8, 0]], sp.dark);
    ctx.beginPath(); ctx.moveTo(-110 + wag, -78); ctx.bezierCurveTo(-96 + wag, -60, -92, -50, -88 + wag * 0.8, -48); ctx.lineTo(-108 + wag, -50); ctx.closePath(); ctx.fillStyle = sp.tan; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-52, 6); ctx.bezierCurveTo(-96, 8, -112 + wag, -34, -110 + wag, -78); ctx.bezierCurveTo(-96 + wag, -60, -84, -20, -52, -16); ctx.closePath(); ctx.stroke();
  } else if (sp.head === 'cat') {
    const sw = Math.sin(t * 4) * 8;
    ctx.beginPath(); ctx.moveTo(-40, 6); ctx.bezierCurveTo(-110, 16, -130 + sw, -40, -100 + sw, -90); ctx.lineWidth = 24; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, 6); ctx.bezierCurveTo(-110, 16, -130 + sw, -40, -100 + sw, -90); ctx.lineWidth = 14; ctx.strokeStyle = sp.fur; ctx.stroke();
    ctx.lineWidth = 15; ctx.strokeStyle = sp.dark; for (const [x, y] of [[-100, 0], [-122, -36]]) { ctx.beginPath(); ctx.moveTo(x - 4, y - 6); ctx.lineTo(x + 4, y + 8); ctx.lineWidth = 6; ctx.stroke(); }
  } else if (sp.head === 'rooster') { // plume of tail feathers
    for (const [rot, col, len] of [[-1.5, '#2E8C86', 150], [-1.2, '#E03A32', 160], [-0.9, '#E7B93A', 150], [-0.62, '#2E8C86', 130]]) {
      ctx.save(); ctx.translate(-40, -10); ctx.rotate(rot + Math.sin(t * 3 + rot) * 0.05); ell(ctx, 0, -len * 0.55, 30, len * 0.62, col, 5.5); ell(ctx, 0, -len * 0.78, 12, 15, '#fff', 3.5, 0, 0.85); ctx.restore();
    }
  } else if (sp.head === 'monkey') { // long curly tail
    const sw = Math.sin(t * 5) * 6;
    const pts = []; for (let i = 0; i <= 18; i++) { const u = i / 18, a = u * 5.2 + 0.4; pts.push([-48 - Math.sin(u * 3) * 30 - u * 50 + Math.cos(a) * 14 * u, 4 - u * 130 + Math.sin(a) * 14 * u + sw * u]); }
    stroke(ctx, pts, 24); stroke(ctx, pts, 14, sp.fur);
  }
  if (sp.shell) { // turtle shell: dome on the back
    ctx.beginPath(); ctx.moveTo(14, -122); ctx.bezierCurveTo(-110, -150, -196, -70, -184, 16); ctx.bezierCurveTo(-176, 70, -110, 90, 14, 70); ctx.closePath();
    ctx.fillStyle = '#6D9A52'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, 70); ctx.bezierCurveTo(-110, 82, -174, 60, -184, 16); ctx.bezierCurveTo(-160, 46, -100, 60, -30, 52); ctx.closePath(); ctx.fillStyle = '#4F7A42'; ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
    const hex = (x, y, r) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; i ? ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) : ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); ctx.fillStyle = '#9CCB78'; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke(); };
    hex(-96, -78, 28); hex(-124, -14, 30); hex(-92, 40, 26);
  }
}

// ---------- the main drawing function ----------
export function drawAnimal(ctx, opts) {
  const c = opts.costume || {}, sp0 = SPECIES[c.species];
  if (!sp0) throw new Error(`Unknown species "${c.species}"`);
  const sp = {...sp0, ...Object.fromEntries(['robe', 'robeShade', 'trim', 'sash', 'fur', 'prop'].filter(k => c[k] !== undefined && k !== 'prop').map(k => [k, c[k]]))};
  const P = opts.pose, E = EXPR[opts.expr || 'neutral'] || EXPR.neutral, t = opts.t || 0;
  if (sp.crab) return drawCrab(ctx, opts, sp, P, E, t);
  const wind = opts.wind ?? 1, blink = opts.blink ? 0.12 : 1;
  const lean = (P.lean || 0) + sp.hunch, nod = (P.nod || 0) + (E.proud ? -0.12 : 0) + (E.brow < -0.7 ? 0.08 : 0);
  const hipF = [14, 0], hipB = [-14, 0];
  const kF = segp(hipF, P.ft, D.thigh), fF = segp(kF, P.ft + P.fk, D.shin), kB = segp(hipB, P.bt, D.thigh), fB = segp(kB, P.bt + P.bk, D.shin);
  let lift = Math.max(fF[1], fB[1]) + 12 - (P.bob || 0);
  if (P.lie) lift = lerp(lift, Math.max(lift, 36 - (P.bob || 0)), clamp(P.lie));
  ctx.save(); ctx.scale((opts.scale || 1) * K); ctx.scale(opts.facing === -1 ? -1 : 1, 1); ctx.translate(0, -lift);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK;
  // ground shadow
  ctx.save(); ctx.translate(0, lift); ctx.fillStyle = 'rgba(42,39,35,.13)'; ctx.beginPath(); ctx.ellipse((fF[0] + fB[0]) / 2 - 6, 2, 104, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  const up = (dx, dy) => [dx * Math.cos(lean) - dy * Math.sin(lean), dx * Math.sin(lean) + dy * Math.cos(lean)];
  const leg = (a, b, cc, paw) => { stroke(ctx, [a, b, cc], 38); stroke(ctx, [a, b, cc], 27, sp.leg); ell(ctx, cc[0] + 11, cc[1] + 3, 26, 15, sp.paw, LW); stroke(ctx, [[cc[0] + 4, cc[1] - 4], [cc[0] + 4, cc[1] + 8]], 0); };
  leg(hipB, kB, fB); leg(hipF, kF, fF);

  const SH = -92, NECK_Y = -114, shF = [56 * sp.bw, SH], shB = [-56 * sp.bw, SH];
  const reach = a => 1 + 0.3 * Math.max(0, Math.sin(a)) + 0.5 * Math.max(0, -Math.cos(a)); // raised arms stretch a little so paws clear the big head
  const hang = a => clamp(1 - Math.abs(a) / 0.8);          // 1 = hanging straight down
  const fu = P.fu + 0.22 * hang(P.fu), bu = P.bu - 0.22 * hang(P.bu); // hanging arms swing slightly outward
  const crossedArms = P.ff < -1.2 && P.bf > 1.2;           // forearms cross in front of the belly
  const eF = segp(shF, fu, D.upper * reach(fu)), hF = segp(eF, P.ff, D.fore * (crossedArms ? 1.55 : reach(P.ff)));
  const eB = segp(shB, bu, D.upper * reach(bu)), hB = segp(eB, P.bf, D.fore * (crossedArms ? 1.55 : reach(P.bf)));
  // soft jointed sleeve: capsule upper arm, forearm that widens toward the wrist, elliptical cuff opening, round paw
  const arm = (s, e, h, back) => {
    const dv = [h[0] - e[0], h[1] - e[1]], L = Math.hypot(...dv) || 1, d = [dv[0] / L, dv[1] / L], n = [-d[1], d[0]];
    const col = back ? sp.robeShade : sp.robe, k = sp.bw > 0.85 ? 1 : 0.88, W = L + 2;
    const at = (u, v) => [e[0] + d[0] * u + n[0] * v * k, e[1] + d[1] * u + n[1] * v * k];
    stroke(ctx, [s, e], 38); stroke(ctx, [s, e], 27, col);
    ctx.beginPath(); ctx.moveTo(...at(0, 15)); ctx.bezierCurveTo(...at(W * 0.35, 17), ...at(W * 0.72, 22), ...at(W, 30)); ctx.lineTo(...at(W, -30)); ctx.bezierCurveTo(...at(W * 0.72, -22), ...at(W * 0.35, -17), ...at(0, -15)); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.moveTo(...at(0, -15)); ctx.bezierCurveTo(...at(W * 0.35, -17), ...at(W * 0.72, -22), ...at(W, -30)); ctx.lineTo(...at(W, -12)); ctx.bezierCurveTo(...at(W * 0.7, -9), ...at(W * 0.35, -6), ...at(0, -5)); ctx.closePath();
    ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = sp.robeShade; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(...at(0, 15)); ctx.bezierCurveTo(...at(W * 0.35, 17), ...at(W * 0.72, 22), ...at(W, 30)); ctx.lineTo(...at(W, -30)); ctx.bezierCurveTo(...at(W * 0.72, -22), ...at(W * 0.35, -17), ...at(0, -15)); ctx.closePath();
    ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke();
    ell(ctx, e[0], e[1], 15, 15, col, 0);
    stroke(ctx, [at(W * 0.18, -2), at(W * 0.42, 6), at(W * 0.62, 4)], 2.8, sp.robeShade);
    const wc = at(W, 0), rot = Math.atan2(n[1], n[0]);
    // cuff opening: ellipse whose long axis lies along the normal (rotated frame)
    ctx.save(); ctx.translate(wc[0], wc[1]); ctx.rotate(rot); ctx.beginPath(); ctx.ellipse(0, 0, 31 * k, 11, 0, 0, Math.PI * 2); ctx.fillStyle = sp.trim; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 22 * k, 6, 0, 0, Math.PI * 2); ctx.fillStyle = '#3B3238'; ctx.fill(); ctx.restore();
    const pc = [wc[0] + d[0] * 9, wc[1] + d[1] * 9];
    ell(ctx, pc[0], pc[1], 15, 15, sp.paw, LW);
    if (sp.head === 'dog' || sp.head === 'cat' || sp.head === 'khi') for (const j of [-1, 1]) stroke(ctx, [[pc[0] + d[0] * 6 + n[0] * j * 5, pc[1] + d[1] * 6 + n[1] * j * 5], [pc[0] + d[0] * 13 + n[0] * j * 5, pc[1] + d[1] * 13 + n[1] * j * 5]], 3);
  };
  // draw order: far arm behind the body (unless it crosses in front), near arm in front of the body but behind the chin
  const headC = [4 + sp.hx, NECK_Y - sp.hy], inHead = h => Math.hypot(h[0] - headC[0], h[1] - headC[1]) < sp.hr * 0.95;
  const thinkLike = P.ff < -2.4 && P.fu > 1.5 && P.fu < 2.2 && P.bu > 0;   // paw on chin: deliberate
  const frontAfterHead = h => h[1] < -75 && (!inHead(h) || thinkLike || P.fu > 2.4);  // hands raised high go over the head
  const backAfterHead = P.bu < -2.4 && hB[1] < -75;
  const backInFront = hB[0] > -34 && hB[1] > -75 && !backAfterHead;

  ctx.save(); ctx.rotate(lean);
  const co = {t, wind, E, blink, c, swing: Math.sin(t * (2.5 + wind * 2)) * 0.05 * wind + (E.brow < -0.6 ? 0.1 : 0) + (E.proud ? -0.02 : 0)};
  backItems(ctx, sp, co);
  if (!backInFront && !backAfterHead) arm(shB, eB, hB, true);
  // robe body (A-line) with shading, hem trim, lapel, sash
  const bw = sp.bw;
  ctx.save(); ctx.scale(bw, 1);
  const robePath = () => { ctx.beginPath(); ctx.moveTo(-44, -122); ctx.bezierCurveTo(-60, -90, -72, -20, -74, 30); ctx.quadraticCurveTo(0, 46, 74, 30); ctx.bezierCurveTo(72, -20, 60, -90, 44, -122); ctx.quadraticCurveTo(0, -134, -44, -122); ctx.closePath(); };
  robePath(); ctx.fillStyle = sp.robe; ctx.fill();
  // back-side shade
  ctx.beginPath(); ctx.moveTo(-44, -122); ctx.bezierCurveTo(-60, -90, -72, -20, -74, 30); ctx.quadraticCurveTo(-50, 36, -34, 36); ctx.bezierCurveTo(-46, -20, -34, -90, -26, -124); ctx.closePath(); ctx.save(); ctx.globalAlpha *= 0.55; ctx.fillStyle = sp.robeShade; ctx.fill(); ctx.restore();
  // hem trim (or torn hem for the patched robe)
  if (sp.patched) { ctx.beginPath(); ctx.moveTo(-73, 12); ctx.lineTo(-74, 30); for (let i = 0; i <= 8; i++) ctx.lineTo(-74 + i * 18.5, 30 + (i % 2 ? 8 : 24) - Math.sin(i) * 2); ctx.lineTo(73, 12); ctx.closePath(); ctx.fillStyle = sp.robeShade; ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(-72, 14); ctx.quadraticCurveTo(0, 28, 72, 14); ctx.lineTo(74, 30); ctx.quadraticCurveTo(0, 46, -74, 30); ctx.closePath(); ctx.fillStyle = sp.trim; ctx.fill(); }
  if (sp.brocade) for (const [x, y] of [[-30, -60], [0, -40], [30, -60], [-40, -8], [40, -8], [0, 10]]) { ell(ctx, x, y, 9, 9, null, 0); ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = sp.trim; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = sp.trim; ctx.fill(); }
  if (sp.patched) { poly(ctx, [[-34, -66], [-6, -72], [-2, -42], [-32, -38]], '#8EA987', 3.5); poly(ctx, [[20, 0], [50, -6], [54, 20], [24, 24]], '#B9795F', 3.5); for (const [x0, y0, x1, y1] of [[-30, -62, -10, -66], [24, 4, 46, 0]]) stroke(ctx, [[x0, y0], [x1, y1]], 2.2); }
  robePath(); ctx.lineWidth = LW + 0.5; ctx.strokeStyle = INK; ctx.stroke();
  ctx.restore();
  // chest V (fur) + cross-collar lapels
  const cv = sp.head === 'dog' || sp.head === 'cat' || sp.head === 'rooster' || sp.head === 'monkey' || sp.head === 'turtle' ? sp.tan : sp.tan;
  poly(ctx, [[-30 * bw, -126], [34 * bw, -126], [4, -66]], cv, 0);
  ctx.beginPath(); ctx.moveTo(-34 * bw, -122); ctx.lineTo(4, -64); ctx.lineTo(38 * bw, -122); ctx.lineWidth = 15; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34 * bw, -122); ctx.lineTo(4, -64); ctx.lineTo(38 * bw, -122); ctx.lineWidth = 8; ctx.strokeStyle = sp.trim; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34 * bw, -122); ctx.lineTo(4, -64); ctx.lineTo(38 * bw, -122); ctx.lineWidth = 15; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34 * bw, -122); ctx.lineTo(4, -64); ctx.lineTo(38 * bw, -122); ctx.lineWidth = 8; ctx.strokeStyle = sp.trim; ctx.stroke();
  // sash
  const sw = 62 * bw;
  ctx.beginPath(); ctx.moveTo(-sw, -36); ctx.quadraticCurveTo(0, -28, sw, -36); ctx.lineTo(sw + 2, -12); ctx.quadraticCurveTo(0, -4, -sw - 2, -12); ctx.closePath(); ctx.fillStyle = sp.sash; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke();
  poly(ctx, [[14 * bw, -22], [30 * bw, 26], [10 * bw, 22], [0, -14]], sp.sash, 4.5); poly(ctx, [[10 * bw, -20], [-2 * bw, 30], [-18 * bw, 22], [-6 * bw, -16]], sp.trim, 4.5);
  ell(ctx, 8 * bw, -22, 14, 12, sp.sash, 4.5);
  ctx.restore(); // end of robe (lean still applies below via save)

  // -- arms in front of the robe, then head (lean + nod)
  ctx.save(); ctx.rotate(lean);
  if (backInFront) arm(shB, eB, hB, true);
  const prop = c.prop === undefined ? sp.prop : c.prop;
  if (!frontAfterHead(hF)) { if (prop === 'staff' || prop === 'broom') drawPlanted(ctx, prop, hF, lean, lift, sp); arm(shF, eF, hF, false); if (prop === 'fan') drawFan(ctx, hF); }
  const neck = [4, NECK_Y];
  ctx.save(); ctx.translate(neck[0], neck[1]); ctx.rotate(nod); ctx.translate(sp.hx, -sp.hy);
  const R = 118;
  // collar (dog): drawn on the neck before the head so the chin overlaps it
  ctx.restore();
  ctx.save(); ctx.translate(neck[0], neck[1]); ctx.rotate(nod); ctx.translate(sp.hx, -sp.hy);
  HEADS[sp.head](ctx, sp, co);
  ctx.restore();
  if (sp.head === 'dog') drawCollar(ctx, sp, neck, nod);
  if (sp.head === 'monkey') { /* head cloth */ ctx.save(); ctx.translate(neck[0], neck[1]); ctx.rotate(nod); ctx.translate(sp.hx, -sp.hy); const hc = '#B25A3F'; ctx.beginPath(); ctx.moveTo(-92, -42); ctx.quadraticCurveTo(0, -86, 96, -48); ctx.lineTo(96, -22); ctx.quadraticCurveTo(0, -62, -92, -18); ctx.closePath(); ctx.fillStyle = hc; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); poly(ctx, [[-90, -34], [-128, -12], [-112, 10]], hc, 4.5); ctx.restore(); }
  if (sp.head === 'cat') { /* headband strip of cloth */ }
  ctx.restore();
  if (backAfterHead) arm(shB, eB, hB, true);
  if (frontAfterHead(hF)) { if (prop === 'staff' || prop === 'broom') drawPlanted(ctx, prop, hF, lean, lift, sp); arm(shF, eF, hF, false); if (prop === 'fan') drawFan(ctx, hF); }
  ctx.restore();
  const handW = up(hF[0], hF[1]);
  return {hand: handW, head: up(neck[0] + sp.hx, neck[1] - sp.hy), contact: P.contact};
}

function drawCollar(ctx, sp, neck, nod) {
  // red collar under the chin, bone tag on the chest
  ctx.save(); ctx.translate(neck[0], neck[1]); ctx.rotate(nod * 0.6);
  ctx.beginPath(); ctx.moveTo(-34, -12); ctx.quadraticCurveTo(26, 20, 82, -12); ctx.lineWidth = 30; ctx.strokeStyle = INK; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34, -12); ctx.quadraticCurveTo(26, 20, 82, -12); ctx.lineWidth = 19; ctx.strokeStyle = '#D6372E'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-34, -17); ctx.quadraticCurveTo(26, 14, 82, -17); ctx.lineWidth = 4; ctx.strokeStyle = '#F0766B'; ctx.stroke();
  // bone tag hanging from the collar
  ctx.save(); ctx.translate(30, 40); ctx.rotate(-0.12);
  ell(ctx, 0, -14, 5, 6, '#E8C24A', 3);
  const bone = () => { ctx.beginPath(); ctx.rect(-22, -9, 44, 18); for (const [x, y] of [[-23, -10], [-23, 10], [23, -10], [23, 10]]) ctx.arc(x, y, 11, 0, Math.PI * 2); };
  ctx.beginPath(); for (const [x, y] of [[-23, -9], [-23, 9], [23, -9], [23, 9]]) { ctx.moveTo(x + 11, y); ctx.arc(x, y, 11, 0, Math.PI * 2); } ctx.rect(-23, -10, 46, 20);
  ctx.lineWidth = 11; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = '#FFF6DC'; ctx.fill();
  ctx.beginPath(); ctx.arc(-14, -4, 0.1, 0, 0.1); ctx.stroke();
  ctx.restore(); ctx.restore();
}

function drawPlanted(ctx, prop, hF, lean, lift, sp) {
  const wy = hF[0] * Math.sin(lean) + hF[1] * Math.cos(lean), down = lift - wy - 6;
  ctx.save(); ctx.translate(hF[0] + 16, hF[1] - 6); ctx.rotate(-lean);
  if (prop === 'staff') {
    stroke(ctx, [[0, -170], [0, down]], 15); stroke(ctx, [[0, -170], [0, down]], 8, '#A9743F');
    ctx.beginPath(); ctx.arc(14, -184, 20, Math.PI * 0.55, Math.PI * 2.3); ctx.lineWidth = 15; ctx.strokeStyle = INK; ctx.stroke(); ctx.beginPath(); ctx.arc(14, -184, 20, Math.PI * 0.55, Math.PI * 2.3); ctx.lineWidth = 8; ctx.strokeStyle = '#A9743F'; ctx.stroke();
    for (const y of [-120, -60]) stroke(ctx, [[-6, y], [6, y + 2]], 4);
  } else {
    stroke(ctx, [[0, -230], [0, down - 40]], 14); stroke(ctx, [[0, -230], [0, down - 40]], 7, '#B58B52');
    poly(ctx, [[-6, down - 44], [6, down - 44], [34, down + 4], [-34, down + 4]], '#D8B66A', 5);
    for (const x of [-18, -6, 8, 20]) stroke(ctx, [[x * 0.5, down - 36], [x, down]], 2.5);
    stroke(ctx, [[-22, down - 30], [22, down - 30]], 6, '#8A6B3F');
  }
  ctx.restore();
}
function drawFan(ctx, h) {
  ctx.save(); ctx.translate(h[0] + 30, h[1] - 8); ctx.rotate(-0.7);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 96, -Math.PI * 0.82, -Math.PI * 0.18); ctx.closePath(); ctx.fillStyle = '#E7B93A'; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke();
  for (let i = 1; i < 6; i++) { const a = -Math.PI * 0.82 + (Math.PI * 0.64) * i / 6; stroke(ctx, [[0, 0], [Math.cos(a) * 96, Math.sin(a) * 96]], 2.5); }
  ctx.beginPath(); ctx.arc(0, 0, 70, -Math.PI * 0.82, -Math.PI * 0.18); ctx.lineWidth = 6; ctx.strokeStyle = '#C8372D'; ctx.stroke();
  ctx.restore();
}

// ---------- the crab ----------
function drawCrab(ctx, opts, sp, P, E, t) {
  const blink = opts.blink ? 0.12 : 1, S = (opts.scale || 1) * 1.05;
  ctx.save(); ctx.scale(S); ctx.scale(opts.facing === -1 ? -1 : 1, 1);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const bob = (P.bob || 0) * 0.5, step = Math.sin((P.ft || 0) * 7) * 0.5;
  ctx.fillStyle = 'rgba(42,39,35,.13)'; ctx.beginPath(); ctx.ellipse(0, 2, 150, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.translate(0, -34 + bob);
  // legs (3 per side)
  for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
    const ph = (P.ft || 0) * 2.2 * (i % 2 ? 1 : -1) * side, x0 = side * (56 + i * 22), y0 = -8 + i * 12;
    const knee = [x0 + side * (46 + i * 8), y0 - 30 + ph * 20], foot = [x0 + side * (66 + i * 16), y0 + 40 + 8 * Math.sin(ph * 3)];
    stroke(ctx, [[x0, y0], knee, foot], 15); stroke(ctx, [[x0, y0], knee, foot], 8, sp.shell);
  }
  // claws (arms use pose angles: front = right claw, back = left claw)
  const open = {shout: 0.55, snarl: 0.5, grin: 0.4, wail: 0.5, laugh: 0.45, o: 0.3}[E.mouth] ?? 0.12;
  const claw = (sx, ang, rot, flip) => {
    const sh = [sx, -34], el = segp(sh, ang[0], 58), h = segp(el, ang[1], 52);
    stroke(ctx, [sh, el, h], 30); stroke(ctx, [sh, el, h], 19, sp.shell);
    const a = Math.atan2(Math.cos(ang[1]), Math.sin(ang[1])), pulse = Math.sin(t * 12) * (E.mouth === 'shout' ? 0.08 : 0);
    ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(a);
    // two pincer jaws
    for (const sgn of [-1, 1]) { ctx.save(); ctx.rotate(sgn * (open + pulse) * (sgn < 0 ? 1 : 0.7)); ctx.beginPath(); ctx.moveTo(-4, sgn * 4); ctx.bezierCurveTo(10, sgn * 36, 60, sgn * 34, 74, sgn * 6); ctx.bezierCurveTo(52, sgn * 12, 34, sgn * 8, 18, sgn * 2); ctx.closePath(); ctx.fillStyle = sp.shell; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    ell(ctx, 6, 0, 30, 26, sp.shell, LW); shade(ctx, 6, 0, 30, 26, 0.4, 2.4, 0.3, sp.shellShade, 0.6);
    ctx.restore();
  };
  // claws rest raised (guard pose); strongly raised/pointing poses use the raw pose angles
  const mf = clamp((P.fu - 0.4) / 0.8), mb = clamp((Math.abs(P.bu) - 0.4) / 0.8), wob = Math.sin(t * 5) * 0.06;
  claw(-74, [lerp(-1.35 - wob, P.bu, mb), lerp(-2.25 + wob, P.bf, mb)], 0); claw(74, [lerp(1.35 + wob, P.fu, mf), lerp(2.25 - wob, P.ff, mf)], 0);
  // body shell
  ctx.beginPath(); ctx.ellipse(0, -34, 108, 66, 0, 0, Math.PI * 2); ctx.fillStyle = sp.shell; ctx.fill();
  shade(ctx, 0, -34, 108, 66, 0.2, 2.9, 0.16, sp.shellShade, 0.65);
  shade(ctx, 0, -34, 108, 66, 3.4, 5.1, 0.18, sp.light, 0.35);
  spots(ctx, [[-52, -52, 14, 9, 0.3], [40, -60, 12, 8, -0.3], [-10, -76, 10, 6, 0], [68, -26, 9, 7, 0]], sp.shellShade, 0.7);
  ctx.beginPath(); ctx.ellipse(0, -34, 108, 66, 0, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
  // eyes on stalks
  const eyes = [{x: -34, y: -138, r: 22, inner: 1}, {x: 34, y: -138, r: 22, inner: -1}];
  for (const e of eyes) { stroke(ctx, [[e.x * 0.8, -88], [e.x, -118]], 18); stroke(ctx, [[e.x * 0.8, -88], [e.x, -118]], 9, sp.shell); }
  for (const e of eyes) drawEye(ctx, e, E, {iris: '#3A1A10', lid: sp.shell, look: [e.inner * -0.05 + 0.1, 0]}, blink);
  for (const e of eyes) drawBrow(ctx, e, E, INK, 1.3);
  mouth(ctx, E.mouth === 'flat' ? 'smirk' : E.mouth, 0, -34, 0.8);
  extras(ctx, E, 0, -74, 90, {eyes, cheeks: [[-66, -26], [66, -26]]});
  ctx.restore();
  return {hand: [74 * S, -70 * S], head: [0, -140 * S], contact: P.contact};
}
