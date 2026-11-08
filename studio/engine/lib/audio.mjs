// Synthesised, rights-free sound effects. All kinds return mono float samples at SR.
import fs from 'node:fs';
import {rng, clamp} from './math.mjs';
export const SR = 44100;

export const SFX_KINDS = ['pop', 'tap', 'whoosh', 'step', 'drum', 'gong', 'splash', 'crack', 'scribble', 'chime', 'thud', 'wind', 'hammer', 'cheer'];

export function synth(kind, dur) {
  const r = rng(kind.length * 977 + Math.round((dur || 0) * 100)), noise = () => r() * 2 - 1;
  const D = dur || {pop: 0.12, tap: 0.08, whoosh: 0.35, step: 0.18, drum: 0.7, gong: 2.2, splash: 0.9, crack: 0.5, scribble: 1, chime: 1.2, thud: 0.35, wind: 2, hammer: 0.25, cheer: 1.5}[kind] || 0.3;
  const n = Math.round(D * SR), out = new Float32Array(n);
  let lp = 0, lp2 = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, w = noise(); let v = 0;
    switch (kind) {
      case 'pop': v = Math.sin(2 * Math.PI * (700 - 2500 * t) * t) * Math.exp(-t * 40) * 0.5; break;
      case 'tap': v = (Math.sin(2 * Math.PI * 1800 * t) * 0.4 + w * 0.3) * Math.exp(-t * 90) * 0.6; break;
      case 'whoosh': lp += 0.12 * (w - lp); v = lp * Math.sin(Math.PI * clamp(t / D)) * 1.8; break;
      case 'step': v = Math.sin(2 * Math.PI * (95 - 40 * t) * t) * Math.exp(-t * 28) * 0.55; break;
      case 'thud': v = (Math.sin(2 * Math.PI * (70 - 30 * t) * t) + w * 0.15) * Math.exp(-t * 14) * 0.7; break;
      case 'drum': v = (Math.sin(2 * Math.PI * (80 - 25 * t) * t) * 0.8 + w * 0.25 * Math.exp(-t * 30)) * Math.exp(-t * 7) * 0.8; break;
      case 'gong': v = (Math.sin(2 * Math.PI * 196 * t) + 0.6 * Math.sin(2 * Math.PI * 294 * t + 0.3) + 0.35 * Math.sin(2 * Math.PI * 523 * t)) * Math.exp(-t * 1.6) * 0.25; break;
      case 'chime': v = (Math.sin(2 * Math.PI * 880 * t) + 0.5 * Math.sin(2 * Math.PI * 1320 * t)) * Math.exp(-t * 3) * 0.18; break;
      case 'splash': lp += 0.35 * (w - lp); v = lp * Math.exp(-t * 4) * (t < 0.03 ? t / 0.03 : 1) * 0.9; break;
      case 'crack': v = (w * Math.exp(-t * 12) * 0.7 + Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 18) * 0.5) * (Math.sin(t * 90) > -0.2 ? 1 : 0.3); break;
      case 'hammer': v = (Math.sin(2 * Math.PI * 240 * t) * 0.6 + w * 0.4) * Math.exp(-t * 35) * 0.8; break;
      case 'scribble': { lp += 0.35 * (w - lp); const hp = lp - prev; prev = lp; v = hp * (0.55 + 0.45 * Math.abs(Math.sin(t * 23))) * 1.6; break; }
      case 'wind': lp += 0.02 * (w - lp); lp2 += 0.05 * (lp - lp2); v = lp2 * 6 * Math.sin(Math.PI * clamp(t / D)) * (0.7 + 0.3 * Math.sin(t * 1.3)); break;
      case 'cheer': lp += 0.2 * (w - lp); v = lp * (0.6 + 0.4 * Math.sin(t * 13) * Math.sin(t * 7)) * Math.sin(Math.PI * clamp(t / D)) * 0.9; break;
    }
    out[i] = v;
  }
  return out;
}

export function mixTrack(duration, events) {
  const N = Math.ceil(duration * SR), buf = new Float32Array(N);
  for (const e of events) {
    const s = synth(e.kind, e.dur), g = e.gain ?? 0.5, o = Math.round(e.t * SR);
    for (let i = 0; i < s.length && o + i < N; i++) if (o + i >= 0) buf[o + i] += s[i] * g;
  }
  return buf;
}

export function writeWav(file, f32) {
  const N = f32.length, h = Buffer.alloc(44), d = Buffer.alloc(N * 2);
  for (let i = 0; i < N; i++) d.writeInt16LE(Math.round(clamp(f32[i], -1, 1) * 32767), i * 2);
  h.write('RIFF'); h.writeUInt32LE(36 + N * 2, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(N * 2, 40);
  fs.writeFileSync(file, Buffer.concat([h, d]));
}
