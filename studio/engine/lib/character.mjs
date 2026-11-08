// Rigged stick figure. Angles: 0 = limb hanging straight down, + = rotated toward the facing direction.
// Prop angle `sp`: 0 = pointing up, + = tilting toward facing direction; null = along the forearm.
import {lerp, clamp, color} from './math.mjs';

export const DIM = {thigh: 165, shin: 165, upper: 120, fore: 110, head: 100, torsoRx: 80, torsoRy: 150};

export const POSES = {
  stand:   {fu: 0.15, ff: 0.1, bu: -0.15, bf: -0.1, ft: 0.06, fk: 0, bt: -0.06, bk: 0, lean: 0, sp: 0},
  carry:   {fu: 0.25, ff: 2.25, bu: -0.12, bf: -0.05, ft: 0.06, fk: 0, bt: -0.06, bk: 0, lean: 0.03, sp: 0},
  raise:   {fu: 2.75, ff: 2.95, bu: -0.9, bf: -0.4, ft: 0.12, fk: 0, bt: -0.12, bk: 0, lean: -0.05, sp: 0.35},
  ready:   {fu: 1.2, ff: 1.75, bu: -0.7, bf: -1.6, ft: 0.32, fk: -0.25, bt: -0.25, bk: -0.12, lean: 0.03, sp: 1.45},
  thrust:  {fu: 1.62, ff: 1.6, bu: -1.0, bf: -1.2, ft: 0.4, fk: -0.3, bt: -0.32, bk: -0.1, lean: 0.15, sp: 1.57},
  point:   {fu: 1.5, ff: 1.55, bu: -0.15, bf: -0.1, ft: 0.08, fk: 0, bt: -0.08, bk: 0, lean: 0.04, sp: 1.5},
  cheer:   {fu: 2.7, ff: 2.95, bu: -2.7, bf: -2.95, ft: 0.15, fk: 0, bt: -0.15, bk: 0, lean: -0.04, sp: 0.15},
  scared:  {fu: 2.3, ff: -2.49, bu: -2.3, bf: 2.49, ft: -0.12, fk: -0.25, bt: 0.12, bk: -0.25, lean: -0.03, sp: 0},
  fall:    {fu: 2.6, ff: 2.9, bu: -2.4, bf: -2.8, ft: 0.7, fk: -0.4, bt: 0.25, bk: -0.2, lean: -0.55, sp: 0.8},
  bow:     {fu: 0.25, ff: 0.15, bu: -0.05, bf: 0.1, ft: 0.05, fk: 0, bt: -0.05, bk: 0, lean: 0.6, sp: 0},
  kneel:   {fu: 1.3, ff: 1.0, bu: -0.1, bf: 0.2, ft: 1.5, fk: -1.5, bt: -0.25, bk: -1.35, lean: 0.1, sp: 0.2},
  plead:   {fu: 2.0, ff: 2.25, bu: 1.75, bf: 2.15, ft: 0.25, fk: -0.1, bt: -0.35, bk: -0.3, lean: 0.16, sp: 0.6},
  crossed: {fu: 0.75, ff: -1.45, bu: -0.75, bf: 1.45, ft: 0.08, fk: 0, bt: -0.1, bk: 0, lean: -0.02, sp: 0},
  think:   {fu: 2.0, ff: -2.75, bu: 0.6, bf: -1.3, ft: 0.06, fk: 0, bt: -0.06, bk: 0, lean: 0, sp: 0},
  hammerUp:   {fu: 2.9, ff: 3.05, bu: 0.9, bf: 1.4, ft: 0.25, fk: -0.1, bt: -0.25, bk: -0.1, lean: -0.05, sp: null},
  hammerDown: {fu: 1.25, ff: 0.95, bu: 0.9, bf: 1.0, ft: 0.25, fk: -0.25, bt: -0.25, bk: -0.2, lean: 0.25, sp: null},
  rowA:    {fu: 1.4, ff: 1.3, bu: 1.2, bf: 1.25, ft: 0.9, fk: -1.3, bt: 0.7, bk: -1.2, lean: 0.25, sp: -2.5},
  rowB:    {fu: 0.5, ff: 0.9, bu: 0.4, bf: 0.85, ft: 0.9, fk: -1.3, bt: 0.7, bk: -1.2, lean: -0.15, sp: -2.2},
  waveA:   {fu: 2.5, ff: 2.6, bu: -0.15, bf: -0.1, ft: 0.06, fk: 0, bt: -0.06, bk: 0, lean: 0, sp: 0},
  waveB:   {fu: 2.5, ff: 3.3, bu: -0.15, bf: -0.1, ft: 0.06, fk: 0, bt: -0.06, bk: 0, lean: 0, sp: 0},
  sad:     {fu: 0.08, ff: 0.05, bu: -0.08, bf: -0.05, ft: 0.03, fk: 0, bt: -0.03, bk: 0, lean: 0.12, sp: 0},
};
const FIELDS = ['fu', 'ff', 'bu', 'bf', 'ft', 'fk', 'bt', 'bk', 'lean'];

export function blendPose(a, b, t) {
  const A = typeof a === 'string' ? POSES[a] : a, B = typeof b === 'string' ? POSES[b] : b;
  if (!A || !B) throw new Error(`Unknown pose ${!A ? a : b}`);
  const out = {};
  for (const f of FIELDS) out[f] = lerp(A[f], B[f], t);
  out.sp = A.sp === null || B.sp === null ? (t < 0.5 ? A.sp : B.sp) : lerp(A.sp, B.sp, t);
  return out;
}

// Cyclic actions layered on a pose (time-based)
export function applyCycle(p, cycle, t, k = 1) {
  if (!cycle || k <= 0) return p;
  const q = {...p};
  if (cycle === 'walk' || cycle === 'run') {
    const run = cycle === 'run', per = run ? 0.55 : 0.9, amp = (run ? 0.55 : 0.32) * k, ph = t / per * Math.PI * 2;
    q.ft = amp * Math.sin(ph); q.bt = -amp * Math.sin(ph);
    q.fk = -Math.max(0, Math.sin(ph + Math.PI / 2)) * (run ? 0.9 : 0.5) * k; q.bk = -Math.max(0, Math.sin(ph - Math.PI / 2)) * (run ? 0.9 : 0.5) * k;
    if (p.fu < 0.6) q.fu = p.fu - amp * 1.1 * Math.sin(ph);
    q.bu = p.bu + amp * 1.1 * Math.sin(ph);
    if (run) { q.lean = p.lean + 0.2 * k; q.ff = p.fu < 0.6 ? 1.6 : p.ff; q.bf = q.bu + 1.4; }
    q.bob = -Math.abs(Math.sin(ph)) * (run ? 22 : 12) * k; q.contact = Math.sin(ph);
  } else if (cycle === 'shake') {
    const s = Math.sin(t * 55) * 0.05 * k; q.lean = p.lean + s; q.fk = p.fk - Math.abs(s) * 2; q.bk = p.bk - Math.abs(s) * 2;
  } else if (cycle === 'hammer' || cycle === 'row' || cycle === 'wave') {
    const [a, b, per] = {hammer: ['hammerUp', 'hammerDown', 0.7], row: ['rowA', 'rowB', 1.2], wave: ['waveA', 'waveB', 0.5]}[cycle];
    const u = (Math.sin(t / per * Math.PI * 2) + 1) / 2;
    Object.assign(q, blendPose(a, b, cycle === 'hammer' ? Math.pow(u, 3) : u));
    q.impact = cycle === 'hammer' ? Math.sin(t / per * Math.PI * 2) : 0;
  } else if (cycle === 'breathe') {
    q.fu = p.fu + Math.sin(t * 2.4) * 0.03;
  }
  return q;
}

export const EXPR = {
  neutral:    {brow: 0, eye: 'dot', mouth: 'flat'},
  happy:      {brow: -0.3, eye: 'dot', mouth: 'smile'},
  grin:       {brow: -0.2, eye: 'dot', mouth: 'grin'},
  determined: {brow: 0.7, eye: 'dot', mouth: 'flat'},
  angry:      {brow: 1, eye: 'dot', mouth: 'frown'},
  shout:      {brow: 1, eye: 'dot', mouth: 'shout'},
  scared:     {brow: -1, eye: 'wide', mouth: 'wobble', sweat: true},
  surprised:  {brow: -0.8, eye: 'wide', mouth: 'o'},
  sad:        {brow: -0.7, eye: 'dot', mouth: 'frown', tear: true},
  smug:       {brow: 0.4, eye: 'squint', mouth: 'smirk'},
  sly:        {brow: 0.6, eye: 'side', mouth: 'smirk'},
  pain:       {brow: -0.6, eye: 'shut', mouth: 'shout'},
  calm:       {brow: -0.1, eye: 'shut', mouth: 'smile'},
};

const segp = (p, a, L) => [p[0] + L * Math.sin(a), p[1] + L * Math.cos(a)];

// Draw onto ctx (real canvas or Recorder). Origin = point on the ground between the feet.
// opts: {costume, pose(object), expr(name), facing(1|-1), t, scale, blink, wind}
export function drawCharacter(ctx, opts) {
  const c = opts.costume || {}, P = opts.pose, E = EXPR[opts.expr || 'neutral'] || EXPR.neutral, t = opts.t || 0;
  const D = DIM, ink = color(c.ink || 'ink'), body = color(c.body || 'white'), lw = 6;
  // skeleton (hip at 0,0), then lift so the lowest foot touches the ground
  const lean = P.lean || 0;
  const up = (dx, dy) => [dx * Math.cos(lean) - dy * Math.sin(lean), dx * Math.sin(lean) + dy * Math.cos(lean)];
  const hipF = [16, 0], hipB = [-16, 0];
  const kF = segp(hipF, P.ft, D.thigh), fF = segp(kF, P.ft + P.fk, D.shin);
  const kB = segp(hipB, P.bt, D.thigh), fB = segp(kB, P.bt + P.bk, D.shin);
  const lift = Math.max(fF[1], fB[1]) + 14 - (P.bob || 0);
  ctx.save(); ctx.scale(opts.scale || 1, opts.scale || 1); ctx.scale(opts.facing === -1 ? -1 : 1, 1); ctx.translate(0, -lift);
  ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // shadow (drawn in ground space)
  ctx.save(); ctx.translate(0, lift); ctx.fillStyle = 'rgba(42,39,35,.12)'; ctx.beginPath(); ctx.ellipse((fF[0] + fB[0]) / 2, 2, 120, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  const torsoC = up(0, -150), neckBase = up(0, -298), neckTop = up(0, -318), headC = up(0, -318 - D.head + 4);
  const shF = up(48, -262), shB = up(-48, -262);
  const limb = (a, b, cc, w = lw) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...cc); ctx.stroke(); };
  const foot = f => { ctx.fillStyle = color(c.shoes || 'white'); ctx.beginPath(); ctx.ellipse(f[0] + 13, f[1] + 5, 30, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = lw; ctx.stroke(); };
  const hand = h => { ctx.fillStyle = body; ctx.beginPath(); ctx.arc(h[0], h[1], 20, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = lw; ctx.stroke(); };

  // cape behind everything above the legs
  if (c.cape) { ctx.fillStyle = color(c.cape); ctx.beginPath(); const a = up(-60, -270), b = up(60, -270), cl = up(-110 - 20 * Math.sin(t * 3), 40), cr = up(30, 60);
    ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...cr); ctx.quadraticCurveTo(...up(-40, 80), ...cl); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
  // back leg + back arm
  limb(hipB, kB, fB); foot(fB);
  const eB = segp(shB, P.bu, D.upper), hB = segp(eB, P.bf, D.fore);
  limb(shB, eB, hB); hand(hB);
  // front leg
  limb(hipF, kF, fF); foot(fF);
  // robe (long gown) over legs
  if (c.robe) { ctx.fillStyle = color(c.robe); ctx.beginPath(); const a = up(-70, -250), b = up(70, -250), br = up(115, 160), bl = up(-115, 160);
    ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...br); ctx.lineTo(...bl); ctx.closePath(); ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
    if (c.robeTrim) { ctx.strokeStyle = color(c.robeTrim); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(...up(-110, 150)); ctx.lineTo(...up(110, 150)); ctx.stroke(); ctx.strokeStyle = ink; } }
  // torso
  ctx.save(); ctx.translate(...torsoC); ctx.rotate(lean);
  if (!c.robe) { ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, D.torsoRx, D.torsoRy, 0, 0, Math.PI * 2); ctx.fill(); }
  const band = (x0, y0, x1, y1, w, col) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
    ctx.fillStyle = color(col); ctx.beginPath(); ctx.moveTo(x0 + nx, y0 + ny); ctx.lineTo(x1 + nx, y1 + ny); ctx.lineTo(x1 - nx, y1 - ny); ctx.lineTo(x0 - nx, y0 - ny); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); };
  if (c.sash) { band(-50, -112, 62, 92, 28, c.sash); if (c.sashX !== false) band(50, -112, -62, 92, 28, c.sash); }
  if (c.belt) { ctx.fillStyle = color(c.belt); ctx.beginPath(); ctx.moveTo(-70, 78); ctx.quadraticCurveTo(0, 90, 70, 78); ctx.lineTo(56, 108); ctx.quadraticCurveTo(0, 118, -56, 108); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
  if (!c.robe) { ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(0, 0, D.torsoRx, D.torsoRy, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(...neckBase); ctx.lineTo(...neckTop); ctx.stroke();

  // head
  const [hx, hy] = headC, R = D.head;
  ctx.fillStyle = body; ctx.beginPath(); ctx.arc(hx, hy, R, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
  drawFace(ctx, hx, hy, E, opts, ink);
  if (c.beard) { ctx.fillStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(hx - 6, hy + 66); ctx.quadraticCurveTo(hx + 18, hy + 140, hx + 26, hy + 150); ctx.quadraticCurveTo(hx + 40, hy + 120, hx + 50, hy + 64); ctx.stroke(); }
  if (c.headband) {
    const knot = [hx - R + 8, hy - 44], wind = opts.wind ?? 1;
    ctx.fillStyle = color(c.headband); ctx.beginPath(); ctx.moveTo(hx - R + 4, hy - 64); ctx.quadraticCurveTo(hx, hy - 82, hx + R - 4, hy - 64); ctx.lineTo(hx + R - 1, hy - 28); ctx.quadraticCurveTo(hx, hy - 46, hx - R + 1, hy - 28); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
    for (const [k, ph, L] of [[0, 0, 140], [1, 1.7, 112]]) {
      ctx.beginPath(); const pts = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10, w = Math.sin(t * 9 * (1 + k * 0.2) - u * 4 + ph) * 15 * u * wind; pts.push([knot[0] - u * L, knot[1] + u * (28 + k * 30) + w]); }
      ctx.moveTo(pts[0][0], pts[0][1] - 9); pts.forEach(p => ctx.lineTo(p[0], p[1] - 9)); [...pts].reverse().forEach(p => ctx.lineTo(p[0], p[1] + 9)); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(knot[0], knot[1], 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  drawHat(ctx, c, hx, hy, R, t);

  // front arm + prop (prop drawn first so the hand sits on top)
  const eF = segp(shF, P.fu, D.upper), hF = segp(eF, P.ff, D.fore);
  if (c.prop) drawHeldProp(ctx, c, hF, P.sp === null || P.sp === undefined ? Math.PI - P.ff : P.sp, ink, t);
  limb(shF, eF, hF); hand(hF);
  if (c.prop === 'scroll' && P.bu > 1) { /* both hands on the scroll */ }
  ctx.restore();
  return {hand: hF, head: headC, contact: P.contact};
}

function drawFace(ctx, hx, hy, E, opts, ink) {
  const look = 14, blink = opts.blink ? 0.12 : 1;
  ctx.fillStyle = ink; ctx.strokeStyle = ink;
  for (const ex of [-22, 40]) {
    const x = hx + ex + look, y = hy + 10;
    if (E.eye === 'wide') { ctx.fillStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 16, 20 * blink, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(x + 4, y + 2, 6, 7 * blink, 0, 0, Math.PI * 2); ctx.fill(); }
    else if (E.eye === 'shut' || blink < 1) { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.quadraticCurveTo(x, y + 6, x + 10, y); ctx.stroke(); }
    else if (E.eye === 'squint') { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 10, y + 2); ctx.lineTo(x + 10, y - 2); ctx.stroke(); }
    else { ctx.beginPath(); ctx.ellipse(x + (E.eye === 'side' ? 6 : 0), y, 8, 12, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  const b = E.brow; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(hx - 44 + look, hy - 18 - b * 4); ctx.lineTo(hx - 6 + look, hy - 10 + b * 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx + 66 + look, hy - 18 - b * 4); ctx.lineTo(hx + 28 + look, hy - 10 + b * 7); ctx.stroke();
  const mx = hx + 14 + look, my = hy + 52; ctx.lineWidth = 6;
  switch (E.mouth) {
    case 'smile': ctx.beginPath(); ctx.moveTo(mx - 22, my - 4); ctx.quadraticCurveTo(mx, my + 14, mx + 22, my - 4); ctx.stroke(); break;
    case 'grin': ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mx - 26, my - 6); ctx.quadraticCurveTo(mx, my + 26, mx + 26, my - 6); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
    case 'frown': ctx.beginPath(); ctx.moveTo(mx - 20, my + 6); ctx.quadraticCurveTo(mx, my - 8, mx + 20, my + 6); ctx.stroke(); break;
    case 'shout': ctx.fillStyle = '#5a2320'; ctx.beginPath(); ctx.ellipse(mx, my + 4, 20, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); break;
    case 'o': ctx.fillStyle = '#5a2320'; ctx.beginPath(); ctx.ellipse(mx, my + 2, 10, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 5; ctx.stroke(); break;
    case 'wobble': ctx.beginPath(); ctx.moveTo(mx - 22, my); for (let i = 1; i <= 8; i++) ctx.lineTo(mx - 22 + i * 5.5, my + (i % 2 ? -5 : 5)); ctx.stroke(); break;
    case 'smirk': ctx.beginPath(); ctx.moveTo(mx - 18, my + 2); ctx.quadraticCurveTo(mx + 6, my + 8, mx + 24, my - 8); ctx.stroke(); break;
    default: ctx.beginPath(); ctx.moveTo(mx - 18, my); ctx.lineTo(mx + 18, my - 2); ctx.stroke();
  }
  if (E.sweat) { ctx.fillStyle = '#9FC6E8'; ctx.lineWidth = 3; for (const [dx, dy, s] of [[95, -60, 1], [110, -20, 0.7]]) { ctx.beginPath(); ctx.moveTo(hx + dx, hy + dy - 14 * s); ctx.quadraticCurveTo(hx + dx + 10 * s, hy + dy, hx + dx, hy + dy + 6 * s); ctx.quadraticCurveTo(hx + dx - 10 * s, hy + dy, hx + dx, hy + dy - 14 * s); ctx.fill(); ctx.stroke(); } }
  if (E.tear) { ctx.fillStyle = '#9FC6E8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx - 18 + look, hy + 34, 6, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
}

function drawHat(ctx, c, hx, hy, R, t) {
  if (!c.hat) return;
  const col = color(c.hatColor || 'navy'); ctx.fillStyle = col; ctx.lineWidth = 5;
  if (c.hat === 'official') { ctx.beginPath(); ctx.moveTo(hx - 62, hy - 78); ctx.lineTo(hx - 54, hy - 200); ctx.lineTo(hx + 54, hy - 200); ctx.lineTo(hx + 62, hy - 78); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color('green'); ctx.beginPath(); ctx.roundRect(hx - 12, hy - 120, 24, 16, 4); ctx.fill(); ctx.stroke(); }
  else if (c.hat === 'crown') { ctx.beginPath(); ctx.roundRect(hx - 50, hy - 150, 100, 66, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 95, hy - 160); ctx.lineTo(hx + 95, hy - 160); ctx.lineTo(hx + 85, hy - 145); ctx.lineTo(hx - 85, hy - 145); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3; for (let i = -4; i <= 4; i++) { const x = hx + i * 21, sw = Math.sin(t * 3 + i) * 2; ctx.beginPath(); ctx.moveTo(x, hy - 147); ctx.lineTo(x + sw, hy - 110); ctx.stroke(); ctx.beginPath(); ctx.arc(x + sw, hy - 106, 4, 0, Math.PI * 2); ctx.fill(); } }
  else if (c.hat === 'helmet') { ctx.beginPath(); ctx.arc(hx, hy - 30, R + 6, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx, hy - 136); ctx.lineTo(hx, hy - 175); ctx.stroke(); ctx.fillStyle = color('red'); ctx.beginPath(); ctx.ellipse(hx, hy - 178, 10, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else if (c.hat === 'cone') { ctx.fillStyle = color(c.hatColor || '#E8D9A8'); ctx.beginPath(); ctx.moveTo(hx - 140, hy - 50); ctx.lineTo(hx, hy - 170); ctx.lineTo(hx + 140, hy - 50); ctx.quadraticCurveTo(hx, hy - 70, hx - 140, hy - 50); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (c.hat === 'cap') { ctx.beginPath(); ctx.ellipse(hx, hy - 74, 74, 30, 0, Math.PI, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
}

function drawHeldProp(ctx, c, h, sp, ink, t) {
  const d = [Math.sin(sp), -Math.cos(sp)], n = [-d[1], d[0]], at = (a, b) => [h[0] + d[0] * a + n[0] * b, h[1] + d[1] * a + n[1] * b];
  const shaft = (front, backL, w, col) => { ctx.strokeStyle = ink; ctx.lineWidth = w + 8; ctx.beginPath(); ctx.moveTo(...at(-backL, 0)); ctx.lineTo(...at(front, 0)); ctx.stroke(); ctx.strokeStyle = color(col); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...at(-backL, 0)); ctx.lineTo(...at(front, 0)); ctx.stroke(); ctx.strokeStyle = ink; };
  const poly = (pts, col) => { ctx.fillStyle = color(col); ctx.lineWidth = 5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill(); ctx.stroke(); };
  switch (c.prop) {
    case 'spear': shaft(360, 470, 8, 'wood'); poly([at(360, 0), at(410, 22), at(470, 0), at(410, -22)], 'steel'); break;
    case 'sword': poly([at(-10, -7), at(200, -7), at(225, 0), at(200, 7), at(-10, 7)], 'steel'); poly([at(-14, -28), at(-4, -28), at(-4, 28), at(-14, 28)], 'gold'); shaft(-16, 60, 8, 'wood'); break;
    case 'dagger': poly([at(-6, -6), at(100, -6), at(118, 0), at(100, 6), at(-6, 6)], 'steel'); shaft(-8, 40, 8, 'wood'); break;
    case 'hammer': shaft(170, 40, 8, 'wood'); poly([at(150, -45), at(200, -45), at(200, 45), at(150, 45)], 'wood'); break;
    case 'oar': shaft(240, 200, 8, 'wood'); poly([at(-200, -26), at(-330, -30), at(-340, 0), at(-330, 30), at(-200, 26)], 'wood'); break;
    case 'flag': shaft(420, 120, 7, 'wood'); { const w = Math.sin(t * 6) * 12; poly([at(420, 0), at(420 + w * 0.3, 160), at(330 + w, 170), at(300, 0)], c.propColor || 'red'); } break;
    case 'scroll': poly([at(-20, -60), at(20, -60), at(20, 60), at(-20, 60)], '#F6EBCF'); poly([at(-6, -18), at(6, -18), at(6, 18), at(-6, 18)], c.propColor || 'navy'); break;
    case 'seal': poly([at(-30, -34), at(30, -34), at(30, 34), at(-30, 34)], 'gold'); break;
  }
}
