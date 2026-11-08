// Rigged stick figure demo: Ngô Quyền walks in, raises his spear, shouts, thrusts twice, holds a heroic pose.
// Forward kinematics: every limb = 2 segments with joint angles (0 = hanging straight down, + = toward screen right).
// Usage: node rig-demo.mjs OUT_DIR  → OUT_DIR/rig-demo.mp4
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] || 'out'); fs.mkdirSync(OUT, {recursive: true});
const W = 1080, H = 1920, FPS = 30, DUR = 8;
GlobalFonts.registerFromPath(new URL('./PatrickHand-Regular.ttf', import.meta.url).pathname, 'Hand');
const PAPER = '#F3EADB', INK = '#2A2723', RED = '#D9442E', WOOD = '#9A6B3F', STEEL = '#C9CCD1';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const back = t => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }; // overshoot
const seg = (p, a, L) => [p[0] + L * Math.sin(a), p[1] + L * Math.cos(a)];
const mix = (A, B, t) => Object.fromEntries(Object.keys(A).map(k => [k, lerp(A[k], B[k], t)]));

// body dimensions
const THIGH = 165, SHIN = 165, UPPER = 120, FORE = 110, HEAD = 100;
const T_WALK0 = 0.3, T_WALK1 = 2.1, T_RAISE0 = 2.55, T_RAISE1 = 3.25, T_THRUST = [4.2, 4.9], T_HERO = 5.7;
const PERIOD = 1.0, SWING = 0.3;
const X0 = -330, X1 = 180;

// arm/spear key poses (front arm = screen right, holds the spear; back arm = screen left)
const POSE = {
  carry:  {fu: 0.25, ff: 2.25, bu: 0, bf: 0, sp: 0.0, lean: 0.04, crouch: 0, mouth: 0, brow: 0.5},
  raise:  {fu: 2.75, ff: 2.95, bu: -0.9, bf: -0.4, sp: 0.35, lean: -0.05, crouch: 0, mouth: 1, brow: 1},
  ready:  {fu: 1.2, ff: 1.75, bu: -0.7, bf: -1.6, sp: 1.45, lean: 0.02, crouch: 0.6, mouth: 0.6, brow: 1},
  thrust: {fu: 1.62, ff: 1.6, bu: -1.0, bf: -1.2, sp: 1.57, lean: 0.14, crouch: 0.9, mouth: 1, brow: 1},
  hero:   {fu: 2.2, ff: 2.6, bu: -0.35, bf: -0.1, sp: 0.55, lean: -0.02, crouch: 0, mouth: 0, brow: 0.8},
};

function state(t) {
  // locomotion
  const walking = t >= T_WALK0 && t < T_WALK1 + 0.25;
  const wt = clamp((t - T_WALK0) / (T_WALK1 - T_WALK0));
  const x = lerp(X0, X1, wt);
  const amp = walking ? SWING * clamp((T_WALK1 + 0.25 - t) / 0.35) : 0;
  const ph = (t - T_WALK0) / PERIOD * Math.PI * 2;
  const bob = walking ? -Math.abs(Math.sin(ph)) * 12 * (amp / SWING) : 0;
  // upper-body pose blend
  let P = POSE.carry;
  if (t >= T_RAISE0) P = mix(POSE.carry, POSE.raise, back((t - T_RAISE0) / (T_RAISE1 - T_RAISE0)));
  if (t >= 3.75) P = mix(POSE.raise, POSE.ready, ease((t - 3.75) / 0.4));
  for (const tt of T_THRUST) {
    if (t >= tt && t < tt + 0.7) { const k = t - tt; P = k < 0.14 ? mix(POSE.ready, POSE.thrust, ease(k / 0.14)) : mix(POSE.thrust, POSE.ready, ease((k - 0.14) / 0.5)); }
  }
  if (t >= T_HERO) P = mix(POSE.ready, POSE.hero, back((t - T_HERO) / 0.6));
  const breathe = t > T_HERO + 0.6 ? Math.sin((t - T_HERO) * 2.4) * 0.04 : 0;
  // legs: walk swing, or a wide stance when fighting
  const fight = clamp((t - 3.7) / 0.3) * (1 - clamp((t - T_HERO) / 0.6) * 0.5);
  const legA = {thigh: amp * Math.sin(ph) + 0.3 * fight, knee: -Math.max(0, Math.sin(ph + Math.PI / 2)) * 0.5 * (amp / SWING) - 0.25 * P.crouch};
  const legB = {thigh: -amp * Math.sin(ph) - 0.22 * fight, knee: -Math.max(0, Math.sin(ph - Math.PI / 2)) * 0.5 * (amp / SWING) - 0.1 * P.crouch};
  const swingArm = walking ? -amp * 1.1 * Math.sin(ph) : 0;
  return {x, bob, ph, walking, amp, P: {...P, bu: P.bu + swingArm, fu: P.fu + breathe}, legA, legB, crouch: P.crouch};
}

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
const dust = [];
function drawFigure(s, t) {
  const {P} = s;
  const hipY = 1260 + s.bob + s.crouch * 30;
  const hip = [s.x + 540 - 470 + 470 - 470 + 470, hipY]; hip[0] = s.x + 70;      // hip x follows locomotion
  const lean = P.lean;
  const up = (p, dx, dy) => [p[0] + dx * Math.cos(lean) - dy * Math.sin(lean), p[1] + dx * Math.sin(lean) + dy * Math.cos(lean)];
  const torsoC = up(hip, 0, -150), neckTop = up(hip, 0, -318), headC = up(hip, 0, -318 - HEAD + 6);
  const shF = up(hip, 58, -258), shB = up(hip, -58, -258);
  const hipF = [hip[0] + 34, hip[1]], hipB = [hip[0] - 34, hip[1]];

  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK;
  // shadow
  ctx.fillStyle = 'rgba(42,39,35,.12)'; ctx.beginPath(); ctx.ellipse(hip[0], 1612, 150 - s.crouch * 10, 18, 0, 0, Math.PI * 2); ctx.fill();

  // legs (back leg first)
  const leg = (h, L, front) => {
    const k = seg(h, L.thigh, THIGH), f = seg(k, L.thigh + L.knee, SHIN);
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...h); ctx.lineTo(...k); ctx.lineTo(...f); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(f[0] + 14, f[1] + 6, 30, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 6; ctx.stroke();
    return f;
  };
  const fB = leg(hipB, s.legB), fA = leg(hipF, s.legA);
  // footstep dust
  if (s.walking && s.amp > 0.05) {
    const contact = Math.sin(s.ph);
    if (!drawFigure.prev || Math.sign(contact) !== Math.sign(drawFigure.prev)) dust.push({x: contact > 0 ? fB[0] : fA[0], y: 1612, t0: t}), sfxSteps.push(t);
    drawFigure.prev = contact;
  }

  // back arm
  const elB = seg(shB, P.bu, UPPER), haB = seg(elB, P.bf, FORE);
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...shB); ctx.lineTo(...elB); ctx.lineTo(...haB); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(haB[0], haB[1], 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // torso
  ctx.save(); ctx.translate(...torsoC); ctx.rotate(lean);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 80, 150, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = RED;
  for (const sgn of [1, -1]) { ctx.save(); ctx.rotate(sgn * 0.62); ctx.fillRect(-14, -200, 28, 400); ctx.restore(); }
  ctx.fillRect(-90, 92, 180, 30);
  ctx.strokeStyle = INK; ctx.lineWidth = 4;
  for (const sgn of [1, -1]) { ctx.save(); ctx.rotate(sgn * 0.62); ctx.strokeRect(-14, -200, 28, 400); ctx.restore(); }
  ctx.strokeRect(-90, 92, 180, 30);
  ctx.restore();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 80, 150, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...up(hip, 0, -300)); ctx.lineTo(...neckTop); ctx.stroke();

  // head
  const [hx, hy] = headC;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, HEAD, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // headband + flying tails (flutter stronger when moving)
  ctx.save(); ctx.beginPath(); ctx.arc(hx, hy, HEAD, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = RED; ctx.fillRect(hx - HEAD - 5, hy - 62, HEAD * 2 + 10, 36);
  ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(hx - HEAD - 5, hy - 62, HEAD * 2 + 10, 36);
  ctx.restore();
  const wind = 1 + (s.walking ? 1.5 : 0) + (P.crouch > 0.5 ? 0.8 : 0);
  const knot = [hx - HEAD + 6, hy - 44];
  for (const [k, ph, L] of [[0, 0, 150], [1, 1.7, 120]]) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12, wave = Math.sin(t * 9 * (1 + k * 0.2) - u * 4 + ph) * 16 * u * wind;
      pts.push([knot[0] - u * L, knot[1] + u * (30 + k * 30) + wave]);
    }
    ctx.fillStyle = RED; ctx.strokeStyle = INK; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(...pts[0]); pts.forEach(p => ctx.lineTo(p[0], p[1] - 9)); [...pts].reverse().forEach(p => ctx.lineTo(p[0], p[1] + 9)); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(knot[0], knot[1], 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // face (looking right)
  const look = 14, blink = [1.2, 6.6].some(b => Math.abs(t - b) < 0.07) ? 0.15 : 1;
  ctx.fillStyle = INK;
  for (const ex of [-22, 40]) { ctx.beginPath(); ctx.ellipse(hx + ex + look, hy + 12, 8, 12 * blink, 0, 0, Math.PI * 2); ctx.fill(); }
  const b = P.brow; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(hx - 44 + look, hy - 14 - b * 4); ctx.lineTo(hx - 6 + look, hy - 4 + b * 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(hx + 66 + look, hy - 14 - b * 4); ctx.lineTo(hx + 28 + look, hy - 4 + b * 6); ctx.stroke();
  if (P.mouth > 0.15) {   // shouting mouth
    ctx.fillStyle = '#5a2320'; ctx.beginPath(); ctx.ellipse(hx + 14 + look, hy + 54, 20, 6 + 22 * P.mouth, 0, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
  } else { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hx - 6 + look, hy + 52); ctx.quadraticCurveTo(hx + 14 + look, hy + 46, hx + 34 + look, hy + 50); ctx.stroke(); }

  // front arm + spear
  const elF = seg(shF, P.fu, UPPER), haF = seg(elF, P.ff, FORE);
  const d = [Math.sin(P.sp), -Math.cos(P.sp)], tip = [haF[0] + d[0] * 360, haF[1] + d[1] * 360], butt = [haF[0] - d[0] * 470, haF[1] - d[1] * 470];
  ctx.strokeStyle = INK; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(...butt); ctx.lineTo(...tip); ctx.stroke();
  ctx.strokeStyle = WOOD; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...butt); ctx.lineTo(...tip); ctx.stroke();
  const n = [-d[1], d[0]], hd = [[0, 0], [22, 50], [0, 110], [-22, 50]].map(([a, c]) => [tip[0] + n[0] * a + d[0] * c, tip[1] + n[1] * a + d[1] * c]);
  ctx.fillStyle = STEEL; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); hd.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(...shF); ctx.lineTo(...elF); ctx.lineTo(...haF); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(haF[0], haF[1], 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // thrust speed lines
  for (const tt of T_THRUST) { const k = t - tt; if (k > 0.05 && k < 0.3) { ctx.strokeStyle = `rgba(42,39,35,${0.5 * (1 - k / 0.3)})`; ctx.lineWidth = 5;
    for (const o of [-40, 0, 40]) { ctx.beginPath(); ctx.moveTo(tip[0] - 260, tip[1] + o); ctx.lineTo(tip[0] - 60, tip[1] + o); ctx.stroke(); } } }
}

const sfxSteps = [];
function frame(t) {
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(42,39,35,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, 1620); ctx.bezierCurveTo(300, 1614, 760, 1626, 1040, 1616); ctx.stroke();
  for (const p of dust) { const k = (t - p.t0) / 0.5; if (k < 0 || k > 1) continue;
    ctx.strokeStyle = `rgba(42,39,35,${0.45 * (1 - k)})`; ctx.lineWidth = 3;
    for (const sgn of [-1, 1]) { ctx.beginPath(); ctx.arc(p.x + sgn * (20 + 40 * k), p.y - 10 - 10 * k, 10 + 8 * k, 0, Math.PI * 2); ctx.stroke(); } }
  drawFigure(state(t), t);
  if (t > 3.0 && t < 5.6) {   // shout bubble text
    const a = clamp((t - 3.0) / 0.2) * clamp((5.6 - t) / 0.3), sc = 0.8 + 0.2 * back((t - 3.0) / 0.35);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(560, 420); ctx.scale(sc, sc); ctx.rotate(-0.06);
    ctx.fillStyle = RED; ctx.font = '150px Hand'; ctx.textAlign = 'center'; ctx.fillText('XUNG TRẬN!', 0, 0); ctx.restore();
  }
  if (t > T_HERO + 0.3) {
    const a = clamp((t - T_HERO - 0.3) / 0.4); ctx.globalAlpha = a; ctx.fillStyle = RED; ctx.font = '150px Hand'; ctx.textAlign = 'center';
    ctx.fillText('NGÔ QUYỀN', W / 2, 300 + (1 - a) * 30); ctx.globalAlpha = 1;
  }
}

// render
const frames = Math.round(DUR * FPS);
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', path.join(OUT, 'rig-video.mp4')], {stdio: ['pipe', 'inherit', 'inherit']});
for (let i = 0; i < frames; i++) { frame(i / FPS); if (!ff.stdin.write(cv.data())) await new Promise(r => ff.stdin.once('drain', r)); }
ff.stdin.end(); await new Promise(r => ff.on('close', r));

// audio: footsteps (low thumps), whoosh on thrusts, drum hit on shout, synthesized
const SR = 44100, N = DUR * SR, pcm = new Float32Array(N);
let sd = 5; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (t0, fn, dur) => { for (let n = Math.floor(t0 * SR); n < Math.min(N, (t0 + dur) * SR); n++) pcm[n] += fn(n / SR - t0); };
for (const st of sfxSteps) add(st, d => Math.sin(2 * Math.PI * (90 - 40 * d) * d) * Math.exp(-d * 28) * 0.35, 0.2);
let lp = 0; const noise = () => (lp += 0.25 * (rnd() - lp));
for (const tt of T_THRUST) add(tt, d => noise() * Math.sin(Math.PI * Math.min(1, d / 0.25)) * 0.9, 0.25);
add(3.0, d => (Math.sin(2 * Math.PI * 70 * d) * 0.6 + rnd() * 0.2) * Math.exp(-d * 9) * 0.6, 0.6);
add(T_HERO + 0.3, d => (Math.sin(2 * Math.PI * 220 * d) + 0.5 * Math.sin(2 * Math.PI * 330 * d)) * Math.exp(-d * 2.5) * 0.12, 1.6);
const i16 = Int16Array.from(pcm, v => clamp(v, -1, 1) * 32767);
const hd = Buffer.alloc(44); hd.write('RIFF'); hd.writeUInt32LE(36 + N * 2, 4); hd.write('WAVEfmt ', 8); hd.writeUInt32LE(16, 16); hd.writeUInt16LE(1, 20); hd.writeUInt16LE(1, 22); hd.writeUInt32LE(SR, 24); hd.writeUInt32LE(SR * 2, 28); hd.writeUInt16LE(2, 32); hd.writeUInt16LE(16, 34); hd.write('data', 36); hd.writeUInt32LE(N * 2, 40);
fs.writeFileSync(path.join(OUT, 'rig-audio.wav'), Buffer.concat([hd, Buffer.from(i16.buffer)]));
await new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OUT, 'rig-video.mp4'), '-i', path.join(OUT, 'rig-audio.wav'), '-c:v', 'copy', '-c:a', 'aac', '-shortest', path.join(OUT, 'rig-demo.mp4')], {stdio: 'inherit'}).on('close', r));
fs.rmSync(path.join(OUT, 'rig-video.mp4')); fs.rmSync(path.join(OUT, 'rig-audio.wav'));
console.error('done', path.join(OUT, 'rig-demo.mp4'));
