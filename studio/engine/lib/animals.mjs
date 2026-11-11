// Cartoon savanna animals drawn in code (for the "giai-thich" explainer styles, usable in any style).
// Side view, facing right (facing: -1 flips), anchor = ground under the body centre. Height ≈ 300–560 px at scale 1.
// Common params: facing, expr (neutral | lazy | sleepy | happy | surprised | angry | scared | smug), talk (mouth flaps),
// walk (legs swing), look (-1..1 pupils), eyes ("bulge" = big bulging eyes; default from style), tone (soft | vivid; default from style).
// Palette and eye type follow the scene style automatically (p._st = style, injected by scene.mjs).
const INK = '#2A2723';
const TONES = {
  soft:  {lion: '#E2B474', lionLight: '#F3D7A6', mane: '#B0743F', tiger: '#E7A15C', stripe: '#4A3022', ostrich: '#7A6656', ostrichLight: '#E9E1D6', leg: '#E3B9AE', beak: '#F0A15A',
          zebra: '#F7F3EA', zstripe: '#3E352F', hyena: '#CDAE7E', spot: '#8C6B45', leaf: '#9DB27A', leafDark: '#80985F', trunk: '#8E6A4B', nose: '#5A3A2A', mouth: '#8A3B34', tongue: '#E59A8E', white: '#FFFDF6', blush: 'rgba(230,140,130,.35)'},
  vivid: {lion: '#F5A623', lionLight: '#FFD27A', mane: '#C2410C', tiger: '#FF7A00', stripe: '#111111', ostrich: '#4A3326', ostrichLight: '#FFFFFF', leg: '#FF9E9E', beak: '#FF8A00',
          zebra: '#FFFFFF', zstripe: '#111111', hyena: '#D9A441', spot: '#7A4A12', leaf: '#2DB84B', leafDark: '#168A33', trunk: '#7A3E12', nose: '#3B1C0E', mouth: '#7A0F0F', tongue: '#FF5C7A', white: '#FFFFFF', blush: 'rgba(255,90,120,.4)'}};

const tone = p => TONES[p.tone || p._st?.animalTone || 'soft'];
function shape(ctx, draw, fill, w = 5) { ctx.beginPath(); draw(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (w) { ctx.lineWidth = w; ctx.strokeStyle = INK; ctx.stroke(); } }
const ell = (ctx, x, y, rx, ry, fill, w = 5, rot = 0) => shape(ctx, () => ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2), fill, w);
function stroke(ctx, pts, w = 5, c = INK) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }
function curve(ctx, x0, y0, cx, cy, x1, y1, w = 5, c = INK) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(); }

// leg: rounded column from hip (x, y0) to the ground with a swing angle; foot pad at the bottom
function leg(ctx, x, y0, len, wd, swing, fill, foot) {
  ctx.save(); ctx.translate(x, y0); ctx.rotate(swing);
  shape(ctx, () => { ctx.moveTo(-wd / 2, 0); ctx.lineTo(-wd * 0.42, len - wd * 0.3); ctx.quadraticCurveTo(-wd * 0.5, len, 0, len); ctx.quadraticCurveTo(wd * 0.75, len, wd * 0.5, len - wd * 0.35); ctx.lineTo(wd / 2, 0); }, fill);
  if (foot) foot(len); ctx.restore();
}
const swingOf = (p, t, ph) => p.walk ? Math.sin(t * 9 + ph) * 0.38 : 0;

// one eye: white, pupil, highlight, lids by expression
function eye(ctx, x, y, r, p, t, lidColor, side = 1) {
  const e = p.expr || 'neutral', bulge = (p.eyes || p._st?.animalEyes) === 'bulge';
  const blink = !['sleepy'].includes(e) && ((t + (p.seed || 0)) % 3.7) < 0.12;
  const R = r * (bulge ? 1.3 : 1) * (e === 'surprised' || e === 'scared' ? 1.18 : 1), ry = R * (bulge ? 1.15 : 1.08);
  if (blink || e === 'sleepy') { ell(ctx, x, y, R, ry * 0.3, lidColor, 0); curve(ctx, x - R, y, x, y + R * 0.5, x + R, y, 5); return; }
  ell(ctx, x, y, R, ry, tone(p).white, bulge ? 6 : 5);
  const look = p.look ?? 0.25, pr = R * (e === 'surprised' || e === 'scared' ? 0.32 : bulge ? 0.42 : 0.5);
  const px = x + look * R * 0.45, py = y + (e === 'lazy' ? R * 0.28 : R * 0.08);
  ell(ctx, px, py, pr, pr * 1.08, INK, 0); ell(ctx, px + pr * 0.35, py - pr * 0.4, pr * 0.32, pr * 0.32, '#FFFFFF', 0);
  if (e === 'lazy' || e === 'smug') { // heavy half-closed eyelid
    shape(ctx, () => { ctx.ellipse(x, y, R + 2, ry + 2, 0, Math.PI, Math.PI * 2); ctx.lineTo(x + R + 2, y + ry * 0.05); ctx.quadraticCurveTo(x, y + ry * 0.2, x - R - 2, y + ry * 0.05); ctx.closePath(); }, lidColor, 0);
    curve(ctx, x - R, y + ry * 0.05, x, y + ry * 0.22, x + R, y + ry * 0.05, 5);
  }
  if (e === 'angry') stroke(ctx, [[x - R * 1.1 * side, y - ry * 1.25], [x + R * 0.9 * side, y - ry * 0.75]], 7);
  if (e === 'scared' || e === 'surprised') curve(ctx, x - R * 0.9, y - ry * 1.35, x, y - ry * 1.75, x + R * 0.9, y - ry * 1.35, 5);
}

// mouth by expression; talk toggles open/close
function mouth(ctx, x, y, w, p, t, T) {
  const e = p.expr || 'neutral', open = p.talk ? (Math.sin(t * 22) > -0.1 ? 0.5 + 0.5 * Math.abs(Math.sin(t * 11)) : 0.1) : 0;
  if (e === 'surprised' || e === 'scared' || open > 0.2) { const h = w * (e === 'surprised' || e === 'scared' ? 0.75 : 0.25 + open * 0.45);
    ell(ctx, x, y + h * 0.4, w * 0.42, h * 0.6, T.mouth, 5); ell(ctx, x, y + h * 0.75, w * 0.24, h * 0.2, T.tongue, 0); return; }
  if (e === 'happy') { shape(ctx, () => { ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x, y + w * 0.9, x + w / 2, y); ctx.closePath(); }, T.mouth); return; }
  if (e === 'angry') { shape(ctx, () => { ctx.moveTo(x - w / 2, y + w * 0.2); ctx.lineTo(x + w / 2, y + w * 0.2); ctx.lineTo(x + w * 0.4, y + w * 0.45); ctx.lineTo(x - w * 0.4, y + w * 0.45); ctx.closePath(); }, '#FFFFFF');
    for (let i = -1; i <= 1; i++) stroke(ctx, [[x + i * w * 0.22, y + w * 0.2], [x + i * w * 0.22, y + w * 0.45]], 3); return; }
  if (e === 'sleepy' || e === 'lazy') { curve(ctx, x - w * 0.35, y + w * 0.1, x, y + w * 0.05, x + w * 0.35, y + w * 0.12, 5); return; }
  if (e === 'smug') { curve(ctx, x - w * 0.4, y + w * 0.05, x + w * 0.1, y + w * 0.35, x + w * 0.5, y - w * 0.1, 5); return; }
  curve(ctx, x - w * 0.35, y, x, y + w * 0.3, x + w * 0.35, y, 5);
}

function begin(ctx, p, t) { ctx.save(); if ((p.facing ?? 1) < 0) ctx.scale(-1, 1); if (!p.walk) ctx.translate(0, Math.sin(t * 2.4) * 2); }
function zzz(ctx, x, y, t) { for (let i = 0; i < 3; i++) { const k = ((t * 0.6 + i / 3) % 1); ctx.save(); ctx.globalAlpha = 1 - k; ctx.font = `bold ${28 + i * 10}px Sans`; ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.fillText('z', x + k * 50 + i * 18, y - k * 110 - i * 20); ctx.restore(); } }

// big cat body shared by lion and tiger
function bigCat(ctx, p, t, T, kind) {
  const body = kind === 'tiger' ? T.tiger : T.lion, lie = p.pose === 'lie';
  begin(ctx, p, t);
  const by = lie ? -95 : -190;
  // tail
  const sw = Math.sin(t * 2.2) * 18; curve(ctx, -140, by - 10, -230, by - 60 + sw, -250, by - 140 + sw, 12, INK); curve(ctx, -140, by - 10, -230, by - 60 + sw, -250, by - 140 + sw, 6, body);
  if (kind === 'lion') ell(ctx, -252, by - 150 + sw, 20, 26, T.mane, 5);
  if (!lie) { leg(ctx, -95, by + 20, 170, 46, swingOf(p, t, Math.PI), body); leg(ctx, 85, by + 20, 170, 46, swingOf(p, t, 0), body); }
  ell(ctx, 0, by, 165, lie ? 70 : 88, body);
  if (kind === 'tiger') for (let i = -3; i <= 3; i++) { const x = i * 40; curve(ctx, x - 10, by - (lie ? 66 : 84), x + 14, by - 30, x - 4, by + 10, 9, T.stripe); }
  ell(ctx, 10, by + (lie ? 30 : 40), 110, 32, T.lionLight, 0);
  if (!lie) { leg(ctx, -60, by + 30, 165, 48, swingOf(p, t, 0), body); leg(ctx, 120, by + 30, 165, 48, swingOf(p, t, Math.PI), body); }
  else { ell(ctx, 150, -22, 70, 24, body); ell(ctx, 40, -20, 60, 22, body); }
  // head
  const hx = lie ? 175 : 165, hy = lie ? by - 70 : by - 95, nod = Math.sin(t * 1.3) * 3;
  ctx.save(); ctx.translate(hx, hy + nod);
  if (kind === 'lion') { const n = 16; shape(ctx, () => { for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, r = i % 2 ? 98 : 118; const x = Math.cos(a) * r, y = Math.sin(a) * r * 1.02; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }, T.mane); }
  else { ell(ctx, -55, -62, 22, 22, body); ell(ctx, 50, -66, 22, 22, body); }
  ell(ctx, 0, 0, 82, 76, body);
  if (kind === 'tiger') { for (const s of [-1, 1]) { stroke(ctx, [[s * 80, -10], [s * 52, -4]], 7, T.stripe); stroke(ctx, [[s * 78, 16], [s * 54, 14]], 7, T.stripe); } stroke(ctx, [[-12, -70], [0, -48], [12, -70]], 7, T.stripe); }
  if (kind === 'lion') { ell(ctx, -60, -60, 18, 18, body); ell(ctx, 60, -60, 18, 18, body); }
  ell(ctx, 4, 32, 48, 34, T.lionLight, 4);
  if (p.blush || p.expr === 'happy') { ell(ctx, -48, 24, 16, 9, T.blush, 0); ell(ctx, 56, 24, 16, 9, T.blush, 0); }
  eye(ctx, -26, -16, 19, p, t, body, -1); eye(ctx, 32, -16, 19, p, t, body, 1);
  shape(ctx, () => { ctx.moveTo(-10, 14); ctx.lineTo(18, 14); ctx.lineTo(4, 28); ctx.closePath(); }, T.nose, 3);
  mouth(ctx, 4, 40, 40, p, t, T);
  ctx.restore();
  if (p.expr === 'sleepy' && p.zzz !== false) zzz(ctx, hx + 60, hy - 80, t);
  ctx.restore();
}

export const ANIMALS = {
  lion(ctx, p, t) { bigCat(ctx, p, t, tone(p), 'lion'); },
  tiger(ctx, p, t) { bigCat(ctx, p, t, tone(p), 'tiger'); },

  ostrich(ctx, p, t) {
    const T = tone(p); begin(ctx, p, t);
    leg(ctx, -30, -250, 250, 20, swingOf(p, t, 0), T.leg, len => { ell(ctx, 18, len - 4, 34, 10, T.leg, 4); });
    leg(ctx, 25, -250, 250, 20, swingOf(p, t, Math.PI), T.leg, len => { ell(ctx, 18, len - 4, 34, 10, T.leg, 4); });
    // fluffy body: scalloped outline
    const cx = 0, cy = -290, n = 14; shape(ctx, () => { for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, x = cx + Math.cos(a) * 125, y = cy + Math.sin(a) * 80;
      if (!i) { ctx.moveTo(x, y); continue; } const am = (i - 0.5) / n * Math.PI * 2; ctx.quadraticCurveTo(cx + Math.cos(am) * 142, cy + Math.sin(am) * 94, x, y); } ctx.closePath(); }, T.ostrich);
    for (let i = 0; i < 3; i++) ell(ctx, -130 - i * 6, -320 + i * 16, 30, 14, T.ostrichLight, 4, -0.4);
    for (let i = 0; i < 4; i++) curve(ctx, -60 + i * 35, cy - 30, -40 + i * 35, cy + 10, -70 + i * 35, cy + 40, 3, 'rgba(255,255,255,.35)');
    // neck + head
    const sw = Math.sin(t * 1.8) * 8; ctx.save();
    curve(ctx, 85, -330, 120 + sw, -450, 100 + sw, -560, 26, INK); curve(ctx, 85, -330, 120 + sw, -450, 100 + sw, -560, 18, T.leg);
    ctx.translate(100 + sw, -580);
    ell(ctx, 0, 0, 40, 34, T.ostrichLight);
    for (let i = 0; i < 5; i++) curve(ctx, -20 + i * 9, -30, -24 + i * 10, -48, -18 + i * 11, -54, 3);
    shape(ctx, () => { ctx.moveTo(20, 6); ctx.quadraticCurveTo(72, 4, 80, 16); ctx.quadraticCurveTo(60, 30, 18, 22); ctx.closePath(); }, T.beak, 4);
    if (p.talk) { const o = Math.abs(Math.sin(t * 14)) * 10; curve(ctx, 24, 18, 50, 22 + o, 74, 18, 4); } else curve(ctx, 24, 15, 50, 18, 76, 16, 3);
    eye(ctx, -12, -4, 15, p, t, T.ostrichLight, -1); eye(ctx, 16, -6, 15, p, t, T.ostrichLight, 1);
    if (p.expr === 'sleepy' && p.zzz !== false) zzz(ctx, 30, -50, t);
    ctx.restore(); ctx.restore();
  },

  zebra(ctx, p, t) {
    const T = tone(p); begin(ctx, p, t); const by = -200;
    const stripedLeg = (x, ph) => leg(ctx, x, by + 20, 180, 34, swingOf(p, t, ph), T.zebra, len => { for (let k = 1; k < 5; k++) stroke(ctx, [[-15, k * 34], [15, k * 34 - 4]], 7, T.zstripe); shape(ctx, () => ctx.rect(-17, len - 22, 34, 22), T.zstripe, 0); });
    const sw = Math.sin(t * 2.6) * 0.25; curve(ctx, -150, by - 20, -185, by + 20 + sw * 40, -175, by + 80, 9);
    stripedLeg(-100, Math.PI); stripedLeg(80, 0);
    ell(ctx, 0, by, 160, 72, T.zebra);
    for (let i = -3; i <= 3; i++) { const x = i * 42; curve(ctx, x - 8, by - 70, x + 18, by - 20, x - 2, by + 40, 10, T.zstripe); }
    stripedLeg(-60, 0); stripedLeg(115, Math.PI);
    // neck and head
    shape(ctx, () => { ctx.moveTo(100, by - 50); ctx.lineTo(150, by - 190); ctx.lineTo(210, by - 170); ctx.lineTo(165, by - 10); ctx.closePath(); }, T.zebra);
    for (let i = 1; i <= 4; i++) { const u = i / 5, L = [100 + 50 * u, by - 50 - 140 * u], Rr = [165 + 45 * u, by - 10 - 160 * u]; stroke(ctx, [[L[0] + 4, L[1]], [L[0] + (Rr[0] - L[0]) * 0.75, L[1] + (Rr[1] - L[1]) * 0.75]], 9, T.zstripe); }
    for (let i = 0; i < 6; i++) { const u = (i + 0.5) / 6, x = 100 + 50 * u, y = by - 50 - 140 * u; stroke(ctx, [[x, y], [x - 16, y - 8]], 9, T.zstripe); } // mane
    ctx.save(); ctx.translate(205, by - 190);
    shape(ctx, () => { ctx.moveTo(-10, -20); ctx.ellipse(-25, -58, 12, 26, -0.3, 0, Math.PI * 2); }, T.zebra);
    shape(ctx, () => { ctx.moveTo(-40, -30); ctx.quadraticCurveTo(10, -50, 80, 10); ctx.quadraticCurveTo(95, 50, 60, 60); ctx.quadraticCurveTo(0, 60, -40, 20); ctx.closePath(); }, T.zebra);
    ell(ctx, 66, 38, 30, 24, T.zstripe, 4); ell(ctx, 74, 32, 5, 4, T.zebra, 0);
    eye(ctx, 0, -12, 16, p, t, T.zebra, -1); eye(ctx, 30, -14, 16, p, t, T.zebra, 1);
    mouth(ctx, 50, 54, 26, p, t, T);
    ctx.restore(); ctx.restore();
  },

  hyena(ctx, p, t) {
    const T = tone(p); begin(ctx, p, t); const by = -190;
    const sw = Math.sin(t * 3) * 10; curve(ctx, -130, by + 10, -175, by + 30 + sw, -170, by + 90, 10);
    leg(ctx, -90, by + 25, 165, 38, swingOf(p, t, Math.PI), T.hyena); leg(ctx, 80, by, 190, 40, swingOf(p, t, 0), T.hyena);
    ell(ctx, 0, by, 150, 74, T.hyena, 5, -0.12);
    for (const [x, y] of [[-80, -10], [-40, 20], [0, -25], [40, 10], [80, -30], [-100, 25], [20, 40]]) ell(ctx, x, by + y, 12, 10, T.spot, 0);
    leg(ctx, -55, by + 30, 160, 40, swingOf(p, t, 0), T.hyena); leg(ctx, 115, by, 190, 42, swingOf(p, t, Math.PI), T.hyena);
    ctx.save(); ctx.translate(175, by - 85);
    ell(ctx, -30, -60, 22, 26, T.hyena); ell(ctx, 25, -62, 22, 26, T.hyena);
    ell(ctx, 0, 0, 72, 62, T.hyena); ell(ctx, 30, 26, 52, 32, T.lionLight || T.hyena, 4);
    ell(ctx, 66, 14, 14, 11, T.nose, 3);
    eye(ctx, -18, -14, 17, p, t, T.hyena, -1); eye(ctx, 22, -16, 17, p, t, T.hyena, 1);
    mouth(ctx, 30, 36, 46, {...p, expr: p.expr || 'smug'}, t, T);
    ctx.restore(); ctx.restore();
  },

  // flat-topped acacia (umbrella tree); anchor = trunk base
  acacia(ctx, p, t) {
    const T = tone(p), h = p.h || 300, w = p.w || 380, sw = Math.sin(t * 1.2) * 4;
    shape(ctx, () => { ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-6, -h * 0.5, -40, -h * 0.85); ctx.lineTo(-26, -h * 0.88); ctx.quadraticCurveTo(4, -h * 0.6, 8, -h * 0.55); ctx.quadraticCurveTo(20, -h * 0.75, 50, -h * 0.9); ctx.lineTo(62, -h * 0.86); ctx.quadraticCurveTo(26, -h * 0.5, 16, 0); ctx.closePath(); }, T.trunk);
    for (const [dx, dy, s, c] of [[-w * 0.18, -h * 0.9, 0.62, T.leafDark], [w * 0.2, -h * 0.92, 0.6, T.leafDark], [0 + sw, -h * 0.98, 1, T.leaf]]) {
      shape(ctx, () => { const rw = w / 2 * s, rh = 52 * (0.7 + s * 0.4); ctx.moveTo(dx - rw, dy + rh * 0.5); for (let i = 0; i <= 8; i++) { const x = dx - rw + i * rw / 4; ctx.quadraticCurveTo(x - rw / 8, dy - rh * 1.3, x, dy - rh * 0.6 + (i % 2) * 6); } ctx.quadraticCurveTo(dx + rw * 1.1, dy + rh * 0.4, dx + rw * 0.8, dy + rh * 0.55); ctx.lineTo(dx - rw * 0.8, dy + rh * 0.55); ctx.closePath(); }, c);
    }
  },
};
