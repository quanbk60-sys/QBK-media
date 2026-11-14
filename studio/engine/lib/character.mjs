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
  // v2 (Rùa và Thỏ). Optional extra fields: `nod` (head drops toward facing, radians), `lie` (0..1: lift so the body, not only the feet, rests on the ground)
  sleep:   {fu: 0.55, ff: 0.35, bu: 0.3, bf: 0.15, ft: 2.1, fk: -1.2, bt: 1.55, bk: 0, lean: -0.3, sp: 0, nod: 1.05, lie: 1},
  lie:     {fu: 1.9, ff: 1.0, bu: 1.6, bf: 1.2, ft: 1.57, fk: 0, bt: 1.62, bk: -0.3, lean: -1.5, sp: 0, nod: -0.1, lie: 1},
  crouch:  {fu: 0.9, ff: 1.4, bu: -0.6, bf: -0.2, ft: 1.0, fk: -1.4, bt: 0.2, bk: -1.2, lean: 0.35, sp: 0.8},
  celebrate: {fu: 2.55, ff: 2.85, bu: -2.55, bf: -2.85, ft: 0.4, fk: -0.7, bt: -0.3, bk: -0.5, lean: -0.06, sp: 0.15},
  scratch: {fu: 0.2, ff: 0.15, bu: -2.39, bf: 2.6, ft: 0.06, fk: 0, bt: -0.06, bk: 0, lean: 0.06, sp: 0, nod: 0.22},
};
POSES.scratchHead = POSES.scratch;
const FIELDS = ['fu', 'ff', 'bu', 'bf', 'ft', 'fk', 'bt', 'bk', 'lean'];

export function blendPose(a, b, t) {
  const A = typeof a === 'string' ? POSES[a] : a, B = typeof b === 'string' ? POSES[b] : b;
  if (!A || !B) throw new Error(`Unknown pose ${!A ? a : b}`);
  const out = {};
  for (const f of FIELDS) out[f] = lerp(A[f], B[f], t);
  for (const f of ['nod', 'lie']) if (A[f] !== undefined || B[f] !== undefined) out[f] = lerp(A[f] || 0, B[f] || 0, t);
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
  } else if (cycle === 'crawl' || cycle === 'sprint') {
    // crawl: very slow, short hunched steps (~60 px/s at scale 0.6). sprint: fast, strongly leaning run (~650 px/s).
    const cr = cycle === 'crawl', per = cr ? 1.7 : 0.4, amp = (cr ? 0.2 : 0.7) * k, ph = t / per * Math.PI * 2;
    q.ft = (cr ? 0.08 : 0) + amp * Math.sin(ph); q.bt = (cr ? 0.08 : 0) - amp * Math.sin(ph);
    const kb = cr ? 0.55 : 1.15;
    q.fk = -(cr ? 0.25 : 0) * k - Math.max(0, Math.sin(ph + Math.PI / 2)) * kb * k; q.bk = -(cr ? 0.25 : 0) * k - Math.max(0, Math.sin(ph - Math.PI / 2)) * kb * k;
    q.lean = p.lean + (cr ? 0.32 : 0.5) * k;
    if (cr) { if (p.fu < 0.6) { q.fu = 0.45 - amp * 0.8 * Math.sin(ph); q.ff = 0.9; } q.bu = -0.1 + amp * 0.8 * Math.sin(ph); q.bf = 0.5; q.nod = (p.nod || 0) + 0.1 * k; }
    else { if (p.fu < 0.6) { q.fu = p.fu - amp * 1.3 * Math.sin(ph); q.ff = q.fu + 1.6; } q.bu = p.bu + amp * 1.3 * Math.sin(ph); q.bf = q.bu + 1.6; }
    q.bob = -Math.abs(Math.sin(ph)) * (cr ? 6 : 28) * k; q.contact = Math.sin(ph);
  } else if (cycle === 'jump') {
    // hop in place: squat on landing, legs straighten and body rises in the air (period 0.62s)
    const u = (t / 0.62) % 1, h = Math.sin(u * Math.PI), sq = 1 - h;
    q.fk = p.fk * h - 0.9 * sq * k; q.bk = p.bk * h - 0.8 * sq * k; q.ft = p.ft * h + 0.45 * sq * k; q.bt = p.bt * h + 0.1 * sq * k;
    q.bob = -h * 130 * k; q.fu = p.fu + 0.15 * h * k; q.bu = p.bu - 0.15 * h * k; q.lean = p.lean + 0.12 * sq * k;
    q.contact = sq > 0.85 ? 1 : -1;
  } else if (cycle === 'doze') {
    // sleeping breath: slow chest rise and head bob
    const b = Math.sin(t * 2.0); q.lean = p.lean - b * 0.03 * k; q.nod = (p.nod || 0) + b * 0.06 * k; q.fu = p.fu + b * 0.03;
  } else if (cycle === 'scratch') {
    const s = Math.sin(t * 16) * k; q.bf = p.bf + s * 0.28; q.bu = p.bu - s * 0.06;
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
  sleepy:     {brow: -0.3, eye: 'half', mouth: 'flat'},
  asleep:     {brow: -0.2, eye: 'shut', mouth: 'o'},
  yawn:       {brow: -0.5, eye: 'shut', mouth: 'shout'},
  embarrassed:{brow: -0.6, eye: 'dot', mouth: 'wobble', blush: true, sweat: true},
};
// how far bunny ears droop for each expression (costume.earsDown overrides)
const EAR_DROOP = {sad: 0.9, scared: 0.7, pain: 0.6, sleepy: 0.55, asleep: 0.75, yawn: 0.3, embarrassed: 0.5};
export const CYCLES = ['walk', 'run', 'shake', 'hammer', 'row', 'wave', 'breathe', 'crawl', 'sprint', 'jump', 'doze', 'scratch'];

const segp = (p, a, L) => [p[0] + L * Math.sin(a), p[1] + L * Math.cos(a)];

// Draw onto ctx (real canvas or Recorder). Origin = point on the ground between the feet.
// opts: {costume, pose(object), expr(name), facing(1|-1), t, scale, blink, wind}
export function drawCharacter(ctx, opts) {
  const c = opts.costume || {}, P = opts.pose, E = EXPR[opts.expr || 'neutral'] || EXPR.neutral, t = opts.t || 0;
  const D = DIM, ink = color(c.ink || 'ink'), body = color(c.body || 'white'), lw = 6;
  // skeleton (hip at 0,0), then lift so the lowest foot touches the ground
  const lean = P.lean || 0;
  const up = (dx, dy) => [dx * Math.cos(lean) - dy * Math.sin(lean), dx * Math.sin(lean) + dy * Math.cos(lean)];
  const hipF = c.stick ? [3, 0] : [16, 0], hipB = c.stick ? [-3, 0] : [-16, 0];
  const kF = segp(hipF, P.ft, D.thigh), fF = segp(kF, P.ft + P.fk, D.shin);
  const kB = segp(hipB, P.bt, D.thigh), fB = segp(kB, P.bt + P.bk, D.shin);
  let lift = Math.max(fF[1], fB[1]) + 14 - (P.bob || 0);
  if (P.lie) { // body rests on the ground: lowest of torso ellipse, head, feet
    const L = (x, y) => x * Math.sin(lean) + y * Math.cos(lean), cy = L(0, -150), ty = Math.hypot(D.torsoRx * Math.sin(lean), D.torsoRy * Math.cos(lean));
    const hy = L(0, -318) - (D.head - 4) * Math.cos(lean + (P.nod || 0));
    const low = Math.max(cy + ty, hy + D.head, Math.max(fF[1], fB[1]) + 14) + 4;
    lift = lerp(lift, Math.max(lift, low - (P.bob || 0)), clamp(P.lie));
  }
  ctx.save(); ctx.scale(opts.scale || 1, opts.scale || 1); ctx.scale(opts.facing === -1 ? -1 : 1, 1); ctx.translate(0, -lift);
  ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // shadow (drawn in ground space)
  ctx.save(); ctx.translate(0, lift); ctx.fillStyle = 'rgba(42,39,35,.12)'; ctx.beginPath(); ctx.ellipse((fF[0] + fB[0]) / 2, 2, 120, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  const torsoC = up(0, -150), neckBase = up(0, -298), neckTop = up(0, -318), nod = P.nod || 0;
  const HR = D.head * (c.stick ? 1.18 : 1); // stick figures: bigger head
  const headC = nod ? [neckTop[0] + (HR - 4) * Math.sin(lean + nod), neckTop[1] - (HR - 4) * Math.cos(lean + nod)] : up(0, -318 - HR + 4);
  const shF = c.stick ? up(4, -262) : up(48, -262), shB = c.stick ? up(-4, -262) : up(-48, -262);
  const limb = (a, b, cc, w = lw) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...cc); ctx.stroke(); };
  const foot = c.stick ? f => { ctx.fillStyle = '#FFFFFF'; ctx.lineWidth = lw * 0.8; ctx.beginPath(); ctx.ellipse(f[0] + 14, f[1] + 4, 24, 11, 0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } : f => { ctx.fillStyle = color(c.shoes || 'white'); ctx.beginPath(); ctx.ellipse(f[0] + 13, f[1] + 5, 30, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = lw; ctx.stroke(); };
  const hand = c.stick ? h => { ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(h[0], h[1], 7, 0, Math.PI * 2); ctx.fill(); } : h => { ctx.fillStyle = body; ctx.beginPath(); ctx.arc(h[0], h[1], 20, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = lw; ctx.stroke(); };

  // cape behind everything above the legs
  if (c.cape) { ctx.fillStyle = color(c.cape); ctx.beginPath(); const a = up(-60, -270), b = up(60, -270), cl = up(-110 - 20 * Math.sin(t * 3), 40), cr = up(30, 60);
    ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...cr); ctx.quadraticCurveTo(...up(-40, 80), ...cl); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
  // back leg + back arm
  limb(hipB, kB, fB); foot(fB);
  const eB = segp(shB, P.bu, D.upper), hB = segp(eB, P.bf, D.fore);
  limb(shB, eB, hB); hand(hB);
  if (c.shell) drawShell(ctx, c, torsoC, lean, ink);
  // front leg
  limb(hipF, kF, fF); foot(fF);
  // robe (long gown) over legs
  if (c.robe) { ctx.fillStyle = color(c.robe); ctx.beginPath(); const a = up(-70, -250), b = up(70, -250), br = up(115, 160), bl = up(-115, 160);
    ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...br); ctx.lineTo(...bl); ctx.closePath(); ctx.fill(); ctx.lineWidth = lw; ctx.stroke();
    if (c.robeTrim) { ctx.strokeStyle = color(c.robeTrim); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(...up(-110, 150)); ctx.lineTo(...up(110, 150)); ctx.stroke(); ctx.strokeStyle = ink; } }
  // torso
  ctx.save(); ctx.translate(...torsoC); ctx.rotate(lean);
  if (!c.robe && !c.stick) { ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, D.torsoRx, D.torsoRy, 0, 0, Math.PI * 2); ctx.fill(); }
  if (c.stick && !c.robe) { ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(0, -150); ctx.stroke(); } // classic one-line stick body (hip → neck)
  const band = (x0, y0, x1, y1, w, col) => { const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
    ctx.fillStyle = color(col); ctx.beginPath(); ctx.moveTo(x0 + nx, y0 + ny); ctx.lineTo(x1 + nx, y1 + ny); ctx.lineTo(x1 - nx, y1 - ny); ctx.lineTo(x0 - nx, y0 - ny); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); };
  if (c.sash) { band(-50, -112, 62, 92, 28, c.sash); if (c.sashX !== false) band(50, -112, -62, 92, 28, c.sash); }
  if (c.belt) { ctx.fillStyle = color(c.belt); ctx.beginPath(); ctx.moveTo(-70, 78); ctx.quadraticCurveTo(0, 90, 70, 78); ctx.lineTo(56, 108); ctx.quadraticCurveTo(0, 118, -56, 108); ctx.closePath(); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
  if (!c.robe && !c.stick) { ctx.lineWidth = lw; ctx.beginPath(); ctx.ellipse(0, 0, D.torsoRx, D.torsoRy, 0, 0, Math.PI * 2); ctx.stroke(); }
  if (c.tail) drawTail(ctx, c, t, opts.wind ?? 1);
  ctx.restore();
  ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(...neckBase); ctx.lineTo(...neckTop); ctx.stroke();

  // head
  const [hx, hy] = headC, R = HR;
  if (c.ears) drawEars(ctx, c, hx, hy, R, lean + nod, opts, body, ink);
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
  drawHat(ctx, c, hx, hy - (R - D.head), R, t); // hat offsets are tuned for the default head radius

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
    else if (E.eye === 'half' && blink === 1) { ctx.beginPath(); ctx.ellipse(x, y + 3, 9, 7, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 13, y + 1); ctx.lineTo(x + 13, y + 1); ctx.stroke(); }
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
  if (E.blush) { ctx.fillStyle = '#F2A0A0'; for (const dx of [-30, 58]) { ctx.beginPath(); ctx.ellipse(hx + dx + look, hy + 34, 17, 9, 0, 0, Math.PI * 2); ctx.fill(); } ctx.fillStyle = ink; }
  if (E.tear) { ctx.fillStyle = '#9FC6E8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(hx - 18 + look, hy + 34, 6, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
}

function drawHat(ctx, c, hx, hy, R, t) {
  const hy0 = hy + (R - DIM.head); // true head centre (hy is shifted for hats)
  if (c.hair === 'long') { ctx.lineWidth = 5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx + s * 20, hy0 - R + 4); ctx.bezierCurveTo(hx + s * (R + 30), hy0 - R * 0.6, hx + s * (R + 26), hy0 + R * 0.6, hx + s * (R + 4), hy0 + R * 1.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx + s * 10, hy0 - R + 2); ctx.bezierCurveTo(hx + s * (R + 8), hy0 - R * 0.4, hx + s * (R + 6), hy0 + R * 0.5, hx + s * (R - 10), hy0 + R * 0.95); ctx.stroke(); } }
  else if (c.hair === 'spiky') { ctx.lineWidth = 5; for (let i = -2; i <= 2; i++) { const a = -Math.PI / 2 + i * 0.28; ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * (R - 6), hy0 + Math.sin(a) * (R - 6)); ctx.lineTo(hx + Math.cos(a) * (R + 28), hy0 + Math.sin(a) * (R + 28)); ctx.stroke(); } }
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
  else if (c.hat === 'fedora') { ctx.fillStyle = color(c.hatColor || 'white'); // brim + pinched crown + band
    ctx.beginPath(); ctx.ellipse(hx + 6, hy - 70, 112, 20, -0.04, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 62, hy - 74); ctx.bezierCurveTo(hx - 66, hy - 150, hx - 30, hy - 170, hx + 4, hy - 150); ctx.bezierCurveTo(hx + 40, hy - 172, hx + 74, hy - 150, hx + 70, hy - 74); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 63, hy - 92); ctx.lineTo(hx + 70, hy - 92); ctx.lineTo(hx + 70, hy - 76); ctx.lineTo(hx - 62, hy - 76); ctx.closePath(); ctx.fillStyle = color(c.bandColor || 'ink'); ctx.fill(); ctx.stroke(); }
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
    case 'pole': shaft(520, 520, 8, 'wood'); break;
    case 'axe': shaft(215, 40, 9, 'wood'); poly([at(160, -20), at(200, -20), at(200, 8), at(236, 86), at(190, 104), at(130, 86), at(160, 8)], 'steel'); poly([at(200, -20), at(160, -20), at(166, -38), at(194, -38)], 'steel'); break;
    case 'seal': poly([at(-30, -34), at(30, -34), at(30, 34), at(-30, 34)], 'gold'); break;
  }
}

// --- v2 costume parts (Rùa và Thỏ) ---
const SHELL_DEFAULT = '#6E9B45';
function tint(c, k) { // lighten (k>0) or darken (k<0) a #rrggbb colour
  const h = color(c); if (!/^#[0-9a-f]{6}$/i.test(h)) return h;
  const n = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
  return '#' + n.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// Bunny ears on top of the head (drawn before the head so the head covers their base).
// costume.ears: 'bunny' | 'rabbit' | true; costume.earsDown: 0..1 (else from expression); costume.earColor (inner, default pink)
function drawEars(ctx, c, hx, hy, R, tilt, opts, body, ink) {
  const droop = clamp(c.earsDown === true ? 1 : c.earsDown ?? EAR_DROOP[opts.expr] ?? 0), t = opts.t || 0, wind = opts.wind ?? 1;
  const inner = color(c.earColor || '#F4B8B0');
  for (const [i, base, up] of [[0, -0.42, -0.2], [1, 0.12, 0.1]]) {
    const wig = Math.sin(t * (3 + wind * 2) + i * 1.3) * 0.05 * wind;
    // upright: near vertical, splayed slightly; drooped: swung back and down behind the head
    const a = clamp(tilt + base + up + wig + droop * Math.max(0, Math.cos(tilt)) * (-2.0 + i * 0.25), -1.75, 1.75);
    ctx.save(); ctx.translate(hx + R * 0.92 * Math.sin(tilt + base), hy - R * 0.92 * Math.cos(tilt + base)); ctx.rotate(a);
    const L = 165, W = 34;
    ctx.fillStyle = body; ctx.lineWidth = 6; ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.moveTo(-W * 0.8, 10); ctx.bezierCurveTo(-W * 1.3, -L * 0.45, -W * 0.8, -L, 0, -L); ctx.bezierCurveTo(W * 0.8, -L, W * 1.3, -L * 0.45, W * 0.8, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = inner; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-W * 0.38, -8); ctx.bezierCurveTo(-W * 0.7, -L * 0.45, -W * 0.4, -L * 0.82, 0, -L * 0.84); ctx.bezierCurveTo(W * 0.4, -L * 0.82, W * 0.7, -L * 0.45, W * 0.38, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}

// Cotton tail at the back of the hips (torso space). costume.tail: 'bunny' | true; costume.tailColor
function drawTail(ctx, c, t, wind) {
  const x = -86, y = 96 + Math.sin(t * 7) * 2 * wind, r = 30;
  ctx.fillStyle = color(c.tailColor || 'white'); ctx.lineWidth = 5; ctx.beginPath();
  for (let i = 0; i <= 7; i++) { const a = i / 7 * Math.PI * 2, b = (i + 0.5) / 7 * Math.PI * 2, a2 = (i + 1) / 7 * Math.PI * 2;
    if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    if (i < 7) ctx.quadraticCurveTo(x + r * 1.32 * Math.cos(b), y + r * 1.32 * Math.sin(b), x + r * Math.cos(a2), y + r * Math.sin(a2)); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
}

// Turtle shell: domed carapace on the back (torso space, behind the torso), hexagonal scutes and a rim.
// costume.shell: 'turtle' | true | colour; costume.shellColor overrides
function drawShell(ctx, c, torsoC, lean, ink) {
  const base = c.shellColor || (c.shell === true || c.shell === 'turtle' ? SHELL_DEFAULT : c.shell), light = tint(base, 0.35), dark = tint(base, -0.3);
  ctx.save(); ctx.translate(torsoC[0], torsoC[1]); ctx.rotate(lean);
  ctx.strokeStyle = ink; ctx.lineWidth = 6;
  // dome: from the shoulder blade, bulging behind the back, down to the hip
  const dome = () => { ctx.beginPath(); ctx.moveTo(10, -150); ctx.bezierCurveTo(-120, -175, -205, -60, -190, 30); ctx.bezierCurveTo(-180, 110, -110, 165, 10, 150); ctx.closePath(); };
  ctx.fillStyle = color(base); dome(); ctx.fill(); ctx.stroke();
  // rim band
  ctx.fillStyle = dark; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, 150); ctx.bezierCurveTo(-110, 160, -178, 110, -190, 30); ctx.bezierCurveTo(-170, 95, -110, 135, -30, 128); ctx.closePath(); ctx.fill(); ctx.stroke();
  // scutes: hexagons in a column with spokes to the rim
  const hex = (x, y, r) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; i ? ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) : ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); ctx.fill(); ctx.stroke(); };
  const cells = [[-100, -88, 34], [-118, -10, 38], [-98, 70, 34]];
  ctx.fillStyle = light; ctx.lineWidth = 5;
  for (const [x, y, r] of cells) hex(x, y, r);
  ctx.lineWidth = 4; ctx.beginPath();
  for (const [x, y, r] of cells) { const px = x + r * Math.cos(Math.PI), py = y; ctx.moveTo(px, py); ctx.lineTo(px - 34, py + (y > 0 ? 8 : -6)); }
  ctx.moveTo(-100, -122); ctx.lineTo(-92, -146); ctx.moveTo(-98, 104); ctx.lineTo(-92, 126);
  ctx.stroke();
  ctx.restore();
}
