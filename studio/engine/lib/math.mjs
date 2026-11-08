export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
export const backOut = t => { t = clamp(t); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export const EASE = {linear: clamp, ease, out: easeOut, back: backOut};

export function rng(seed = 1) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Keyframe track: [{t, ...numbers}] → interpolated value object at time t (eases per key via key.ease)
export function sampleTrack(track, t, fields) {
  if (!track || !track.length) return {};
  const out = {};
  for (const f of fields) {
    const keys = track.filter(k => k[f] !== undefined);
    if (!keys.length) continue;
    if (t <= keys[0].t) { out[f] = keys[0][f]; continue; }
    if (t >= keys.at(-1).t) { out[f] = keys.at(-1)[f]; continue; }
    const i = keys.findIndex(k => k.t > t), a = keys[i - 1], b = keys[i];
    const e = EASE[b.ease || 'ease'] || ease;
    out[f] = typeof a[f] === 'number' ? lerp(a[f], b[f], e((t - a.t) / (b.t - a.t))) : a[f];
  }
  return out;
}

export const COLORS = {
  ink: '#2A2723', paper: '#F3EADB', red: '#D9442E', navy: '#22306B', gold: '#E2A72E', green: '#5E8F3E',
  wood: '#9A6B3F', steel: '#C9CCD1', water: '#7FA7C9', waterDeep: '#4E79A7', white: '#FFFFFF', skin: '#F2C9A1', sky: '#DCE9F2',
};
export const color = c => COLORS[c] || c;
