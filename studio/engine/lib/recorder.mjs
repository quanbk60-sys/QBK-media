// A Canvas-2D-like recorder. Drawing code (characters, props) draws into it; we get flat, device-space
// ops that can be played back fully, or progressively ("pen draws it"), on a real canvas.
// Supported: save/restore, translate/rotate/scale, beginPath/moveTo/lineTo/quadraticCurveTo/bezierCurveTo/
// arc/ellipse/rect/roundRect/closePath, stroke/fill, fillRect/strokeRect, fillText, globalAlpha, styles.
const mul = (m, n) => [m[0]*n[0] + m[2]*n[1], m[1]*n[0] + m[3]*n[1], m[0]*n[2] + m[2]*n[3], m[1]*n[2] + m[3]*n[3], m[0]*n[4] + m[2]*n[5] + m[4], m[1]*n[4] + m[3]*n[5] + m[5]];
const apply = (m, x, y) => [m[0]*x + m[2]*y + m[4], m[1]*x + m[3]*y + m[5]];

export class Recorder {
  constructor() { this.ops = []; this.m = [1, 0, 0, 1, 0, 0]; this.stack = []; this.paths = []; this.cur = null;
    this.lineWidth = 6; this.strokeStyle = '#2A2723'; this.fillStyle = '#fff'; this.globalAlpha = 1; this.font = '60px Hand'; this.textAlign = 'left'; this.textBaseline = 'alphabetic'; this.lineCap = 'round'; this.lineJoin = 'round'; }
  save() { this.stack.push({m: [...this.m], lineWidth: this.lineWidth, strokeStyle: this.strokeStyle, fillStyle: this.fillStyle, globalAlpha: this.globalAlpha, font: this.font, textAlign: this.textAlign, textBaseline: this.textBaseline}); }
  restore() { const s = this.stack.pop(); if (s) Object.assign(this, s); }
  translate(x, y) { this.m = mul(this.m, [1, 0, 0, 1, x, y]); }
  rotate(a) { const c = Math.cos(a), s = Math.sin(a); this.m = mul(this.m, [c, s, -s, c, 0, 0]); }
  scale(x, y = x) { this.m = mul(this.m, [x, 0, 0, y, 0, 0]); }
  get scaleFactor() { return Math.sqrt(Math.abs(this.m[0] * this.m[3] - this.m[1] * this.m[2])); }
  beginPath() { this.paths = []; this.cur = null; }
  moveTo(x, y) { this.cur = [apply(this.m, x, y)]; this.paths.push(this.cur); this.last = [x, y]; }
  lineTo(x, y) { if (!this.cur) return this.moveTo(x, y); this.cur.push(apply(this.m, x, y)); this.last = [x, y]; }
  _curve(fn, n) { const [x0, y0] = this.last || [0, 0]; for (let i = 1; i <= n; i++) { const [x, y] = fn(i / n, x0, y0); this.lineTo(x, y); } }
  quadraticCurveTo(cx, cy, x, y) { this._curve((t, x0, y0) => { const u = 1 - t; return [u*u*x0 + 2*u*t*cx + t*t*x, u*u*y0 + 2*u*t*cy + t*t*y]; }, 16); }
  bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { this._curve((t, x0, y0) => { const u = 1 - t; return [u*u*u*x0 + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*x, u*u*u*y0 + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*y]; }, 22); }
  ellipse(x, y, rx, ry, rot = 0, a0 = 0, a1 = Math.PI * 2, ccw = false) {
    let span = a1 - a0; if (ccw && span > 0) span -= Math.PI * 2; if (!ccw && span < 0) span += Math.PI * 2;
    const n = Math.max(8, Math.ceil(Math.abs(span) / (Math.PI * 2) * 56)), c = Math.cos(rot), s = Math.sin(rot);
    for (let i = 0; i <= n; i++) { const a = a0 + span * i / n, px = rx * Math.cos(a), py = ry * Math.sin(a), X = x + px * c - py * s, Y = y + px * s + py * c; i === 0 && !this.cur ? this.moveTo(X, Y) : this.lineTo(X, Y); }
  }
  arc(x, y, r, a0, a1, ccw) { this.ellipse(x, y, r, r, 0, a0, a1, ccw); }
  rect(x, y, w, h) { this.moveTo(x, y); this.lineTo(x + w, y); this.lineTo(x + w, y + h); this.lineTo(x, y + h); this.closePath(); }
  roundRect(x, y, w, h, r = 8) { r = Math.min(r, w / 2, h / 2); this.moveTo(x + r, y); this.lineTo(x + w - r, y); this.quadraticCurveTo(x + w, y, x + w, y + r); this.lineTo(x + w, y + h - r); this.quadraticCurveTo(x + w, y + h, x + w - r, y + h); this.lineTo(x + r, y + h); this.quadraticCurveTo(x, y + h, x, y + h - r); this.lineTo(x, y + r); this.quadraticCurveTo(x, y, x + r, y); this.closePath(); }
  closePath() { if (this.cur && this.cur.length) { this.cur.push([...this.cur[0]]); this.cur.closed = true; } }
  stroke() { if (this.paths.length) this.ops.push({k: 's', paths: this.paths.map(p => p.slice()), w: this.lineWidth * this.scaleFactor, c: this.strokeStyle, a: this.globalAlpha}); }
  fill() { if (this.paths.length) this.ops.push({k: 'f', paths: this.paths.map(p => p.slice()), c: this.fillStyle, a: this.globalAlpha}); }
  fillRect(x, y, w, h) { const keep = this.paths; this.beginPath(); this.rect(x, y, w, h); this.fill(); this.paths = keep; }
  strokeRect(x, y, w, h) { const keep = this.paths; this.beginPath(); this.rect(x, y, w, h); this.stroke(); this.paths = keep; }
  fillText(text, x, y) { this.ops.push({k: 't', text, m: mul(this.m, [1, 0, 0, 1, x, y]), font: this.font, align: this.textAlign, base: this.textBaseline, c: this.fillStyle, a: this.globalAlpha}); }
  measureText() { return {width: 0}; }
}

const plen = p => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };
export function strokeLength(ops) { return ops.filter(o => o.k === 's').reduce((s, o) => s + o.paths.reduce((a, p) => a + plen(p), 0), 0); }

// Play ops onto a real ctx. reveal: undefined = all; else {ink: 0..1 of total stroke length drawn, fill: 0..1 alpha of fills}
// Returns the pen tip (device coords) while drawing.
export function play(ctx, ops, reveal, style, textFollowsCamera = false) {
  const B = textFollowsCamera ? ctx.getTransform() : null; // compose text matrices with the camera (opt-in, scene.textFollowsCamera)
  const map = style?.map || (c => c), ls = style?.lineScale ?? 1;
  let budget = reveal ? reveal.ink * strokeLength(ops) : Infinity, tip = null;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const o of ops) {
    ctx.globalAlpha = o.a ?? 1;
    if (o.k === 'f') {
      const fa = reveal ? reveal.fill : 1; if (fa <= 0) continue;
      ctx.globalAlpha *= fa; ctx.fillStyle = map(o.c); ctx.beginPath();
      for (const p of o.paths) p.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.fill();
    } else if (o.k === 's') {
      if (budget <= 0) continue;
      ctx.strokeStyle = map(o.c); ctx.lineWidth = o.w * ls; ctx.beginPath();
      for (const p of o.paths) {
        if (budget <= 0) break;
        ctx.moveTo(p[0][0], p[0][1]);
        for (let i = 1; i < p.length; i++) {
          const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
          if (d >= budget) { const f = budget / d, x = p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, y = p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f; ctx.lineTo(x, y); tip = [x, y]; budget = 0; break; }
          budget -= d; ctx.lineTo(p[i][0], p[i][1]);
        }
      }
      ctx.stroke();
    } else if (o.k === 't') {
      const ta = reveal ? reveal.fill : 1; if (ta <= 0) continue;
      ctx.save(); ctx.globalAlpha *= ta; if (B) { const m = o.m; ctx.setTransform(B.a * m[0] + B.c * m[1], B.b * m[0] + B.d * m[1], B.a * m[2] + B.c * m[3], B.b * m[2] + B.d * m[3], B.a * m[4] + B.c * m[5] + B.e, B.b * m[4] + B.d * m[5] + B.f); } else ctx.setTransform(...o.m); ctx.font = o.font; ctx.textAlign = o.align; ctx.textBaseline = o.base; ctx.fillStyle = map(o.c); ctx.fillText(o.text, 0, 0); ctx.restore();
    }
  }
  ctx.restore();
  return tip;
}
