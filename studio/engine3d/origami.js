// QBK origami: mô phỏng gấp giấy cứng (rigid origami), không phụ thuộc three.js.
// Mỗi mặt giấy là một đa giác phẳng trong tọa độ tờ giấy trải phẳng (z = 0), gắn vào mặt cha bằng một bản lề
// (đường nếp). Ma trận của mặt = ma trận mặt cha · quay quanh đường nếp. Không có mặt nào bị uốn hay kéo giãn:
// mọi khoảng cách trên giấy được giữ đúng ở mọi khung hình.
// Các bước gấp ngược (inside reverse fold) giải bằng ràng buộc đối xứng: sống cổ, sống đầu, sống đuôi phải nằm trên
// mặt phẳng đối xứng của con chim. Đây là mode gấp cứng thật của đỉnh bậc 4 gấp phẳng được (Kawasaki), nên chuyển
// động đúng như khi gấp lại theo các nếp đã miết sẵn.
//
// Mẫu "chim" (đế cánh diều): tờ giấy vuông, đặt chéo. Tọa độ: đỉnh nhọn T(0,0), đỉnh B(2,0), hai góc L(1,1), R(1,-1).
// Đường chéo TB là sống lưng (gấp đôi), mép TL và TR gấp vào đường giữa (cánh diều).

const D2R = Math.PI / 180, R2 = Math.SQRT2;

// ---------- 4x4 (hàng trước) ----------
const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) { const r = new Array(16); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[i * 4 + k] * b[k * 4 + j]; r[i * 4 + j] = s; } return r; }
function apply(m, [x, y, z = 0]) { return [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]]; }
// quay góc th (độ) quanh đường thẳng qua p, hướng d (đơn vị) nằm trong mặt z = 0
function hingeM(p, d, th) {
  const a = th * D2R, c = Math.cos(a), s = Math.sin(a), [x, y] = d, C = 1 - c;
  const R = [c + x * x * C, x * y * C, y * s, 0, x * y * C, c + y * y * C, -x * s, 0, -y * s, x * s, c, 0, 0, 0, 0, 1];
  const t = [p[0] - (R[0] * p[0] + R[1] * p[1]), p[1] - (R[4] * p[0] + R[5] * p[1]), -(R[8] * p[0] + R[9] * p[1])];
  R[3] = t[0]; R[7] = t[1]; R[11] = t[2]; return R;
}
const transZ = z => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, z, 0, 0, 0, 1];

// ---------- đa giác ----------
const cross2 = (d, v) => d[0] * v[1] - d[1] * v[0];
function splitPoly(poly, q, d) { // trả [phần bên trái đường, phần bên phải]
  const side = v => cross2(d, [v[0] - q[0], v[1] - q[1]]), A = [], B = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], n = poly[(i + 1) % poly.length], sp = side(p), sn = side(n);
    if (sp >= -1e-12) A.push(p); if (sp <= 1e-12) B.push(p);
    if ((sp > 1e-12 && sn < -1e-12) || (sp < -1e-12 && sn > 1e-12)) { const t = sp / (sp - sn), x = [p[0] + (n[0] - p[0]) * t, p[1] + (n[1] - p[1]) * t]; A.push(x); B.push(x); }
  }
  return [A, B];
}
function pick(poly, q, d, pt) { const [A, B] = splitPoly(poly, q, d), inA = cross2(d, [pt[0] - q[0], pt[1] - q[1]]) > 0; return inA ? [A, B] : [B, A]; }
const area = p => p.reduce((s, v, i) => s + cross2(v, p[(i + 1) % p.length]), 0) / 2;
const ccw = p => area(p) < 0 ? p.slice().reverse() : p;
function reflect(v, q, d) { const w = [v[0] - q[0], v[1] - q[1]], k = w[0] * d[0] + w[1] * d[1]; return [q[0] + 2 * k * d[0] - w[0], q[1] + 2 * k * d[1] - w[1]]; }
const unit = v => { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; };
const dirDeg = a => [Math.cos(a * D2R), Math.sin(a * D2R)];

// ---------- mẫu chim ----------
// a: điểm gấp cổ trên sống (tính từ mũi T), c: điểm gấp đầu, b: điểm gấp đuôi, h: độ cao nếp cánh.
export function birdModel(o = {}) {
  const a = o.neck ?? 0.75, c = o.head ?? 0.24, b = o.tail ?? 1.55, h = o.wing ?? 0.2;
  const neckAng = o.neckAngle ?? 150, headAng = o.headAngle ?? 142.5, tailAng = o.tailAngle ?? 30;
  const T = [0, 0], B = [2, 0], L = [1, 1], P = [R2, 2 - R2], Lp = [R2, 0];
  const K = {p: T, d: unit(P)}, N = {p: [a, 0], d: dirDeg(neckAng)}, H = {p: [c, 0], d: dirDeg(headAng)}, Tl = {p: [b, 0], d: dirDeg(tailAng)}, Wg = {p: [0, h], d: [1, 0]};
  // lớp nền (nửa trái): tam giác T P B
  const [neckAll, rest] = pick([T, P, B], N.p, N.d, T), [head, neck] = pick(neckAll, H.p, H.d, T);
  const [tail, rest2] = pick(rest, Tl.p, Tl.d, B), [wing, body] = pick(rest2, Wg.p, Wg.d, P);
  // vạt cánh diều: tam giác T L P, gấp lên nằm trên T L' P. Cắt ở vị trí đã gấp rồi phản chiếu về tọa độ giấy.
  const [fNeckAll, fRest] = pick([T, Lp, P], N.p, N.d, T), [fHead, fNeck] = pick(fNeckAll, H.p, H.d, T), [fWing, fBody] = pick(fRest, Wg.p, Wg.d, P);
  const unfold = poly => poly.map(v => reflect(v, K.p, K.d));
  const L_ = [
    {id: 'body', poly: body, parent: null, hinge: {p: T, d: [1, 0]}, k: 'spine'},
    {id: 'neck', poly: neck, parent: 'body', hinge: N, k: 'neck'},
    {id: 'head', poly: head, parent: 'neck', hinge: H, k: 'head'},
    {id: 'tail', poly: tail, parent: 'body', hinge: Tl, k: 'tail'},
    {id: 'wing', poly: wing, parent: 'body', hinge: Wg, k: 'wing'},
    {id: 'fbody', poly: unfold(fBody), parent: 'body', hinge: K, k: 'kite', flap: true},
    {id: 'fneck', poly: unfold(fNeck), parent: 'neck', hinge: K, k: 'kite', flap: true},
    {id: 'fhead', poly: unfold(fHead), parent: 'head', hinge: K, k: 'kite', flap: true},
    {id: 'fwing', poly: unfold(fWing), parent: 'wing', hinge: K, k: 'kite', flap: true},
  ];
  const mir = v => [v[0], -v[1]], faces = [];
  for (const f of L_) {
    faces.push({...f, id: f.id + 'L', side: 1, parent: f.parent && f.parent + 'L', poly: ccw(f.poly)});
    faces.push({...f, id: f.id + 'R', side: -1, parent: f.parent && f.parent + 'R', poly: ccw(f.poly.map(mir)), hinge: {p: mir(f.hinge.p), d: mir(f.hinge.d)}});
  }
  // đường nếp để vẽ nét chỉ dẫn (tọa độ giấy), mỗi đường là đoạn [p0, p1]
  const seg = (poly1, poly2) => { const s = poly1.filter(v => poly2.some(w => Math.hypot(v[0] - w[0], v[1] - w[1]) < 1e-9)); return s.length >= 2 ? [s[0], s[s.length - 1]] : null; };
  const creases = {};
  for (const [name, a1, a2, fl] of [['neck', neckAll, rest], ['head', head, neck], ['tail', tail, rest2], ['wing', wing, body]]) {
    const s = seg(a1, a2); creases[name] = [s, [mir(s[0]), mir(s[1])]];
    void fl;
  }
  creases.spine = [[T, B]]; creases.kite = [[T, P], [T, mir(P)]];
  // điểm mốc để giải ràng buộc (điểm nằm trên sống, tọa độ giấy)
  return {faces, creases, pts: {T, B, L, P, neckTip: T, headTip: T, tailTip: B}, params: {a, c, b, h}};
}

// ---------- tư thế ----------
// st: {spine (độ, 0 phẳng → 180 gấp đôi), kiteL, kiteR (0 → 180), neck, head, tail (0 → 180 hoặc null = tự giải), wing (0 → ~100 hạ cánh), open (0..1 tách hai nửa ra một chút)}
function chain(model, st) {
  const by = Object.fromEntries(model.faces.map(f => [f.id, f])), M = {};
  const ang = f => {
    const s = f.side, v = {spine: st.spine / 2, neck: st.neck, head: st.head, tail: st.tail, wing: -st.wing}[f.k];
    if (f.k === 'kite') return s > 0 ? st.kiteL : -st.kiteR;
    return s * v;
  };
  const get = id => { if (M[id]) return M[id]; const f = by[id], P = f.parent ? get(f.parent) : I4(); return (M[id] = mul(P, hingeM(f.hinge.p, f.hinge.d, ang(f)))); };
  for (const f of model.faces) get(f.id);
  return M;
}
// giải góc gấp ngược sao cho điểm mốc nằm trên mặt đối xứng y = 0 (mode gấp cứng thứ hai, khác 0)
const REV_SIGN = {neck: 1, head: -1, tail: -1};
function solveRev(model, st, key, ptName) {
  if (st.spine <= 1e-6) return 0;
  const sg = REV_SIGN[key];
  const f = x => { const s = {...st, [key]: sg * x}; const M = chain(model, s), parent = {neck: 'bodyL', head: 'neckL', tail: 'bodyL'}[key];
    const fid = key + 'L'; void parent; return apply(M[fid], model.pts[ptName])[1]; };
  // quét từ 180 xuống tìm nghiệm khác 0 đầu tiên
  let prev = f(180), px = 180; if (Math.abs(prev) < 1e-12) return sg * 180;
  for (let x = 179; x >= 0.25; x -= 1) { const v = f(x); if (v === 0) return sg * x; if (Math.sign(v) !== Math.sign(prev)) { let lo = x, hi = px, flo = v; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m; } return sg * (lo + hi) / 2; } prev = v; px = x; }
  return 0;
}
// st.rev (0..1): bật mode gấp ngược; khi bật, neck/head/tail được giải theo spine
export function solveState(model, st0) {
  const st = {kiteL: 0, kiteR: 0, neck: 0, head: 0, tail: 0, wing: 0, ...st0};
  if (st.rev) { st.neck = solveRev(model, st, 'neck', 'neckTip'); st.head = st.rev >= 2 ? solveRev(model, st, 'head', 'headTip') : 0; st.tail = solveRev(model, st, 'tail', 'tailTip'); }
  return st;
}
// độ dày lớp (đơn vị giấy) để các lớp chồng không xuyên nhau. Mỗi mặt có độ lệch z cục bộ theo hai pha.
const LAYER_A = {body: -2, neck: -2, head: -2, tail: -2, wing: -2, fbody: 1, fneck: 1, fhead: 1, fwing: 1};
const LAYER_B = {body: -6, wing: -6, fbody: 5, fwing: 5, neck: 3, fneck: -4, head: -2, fhead: 1, tail: 1};
export function pose(model, st0, eps = 0.0016) {
  const st = solveState(model, st0), M = chain(model, st), k = Math.max(0, Math.min(1, st.layerB ?? (st.rev ? 1 : 0))), out = {};
  const kA = Math.max(0, Math.min(1, Math.max(Math.abs(st.kiteL), Math.abs(st.kiteR)) / 20)); // giấy chưa gấp thì phẳng tuyệt đối
  for (const f of model.faces) { const id = f.id.slice(0, -1), z = (LAYER_A[id] * kA * (1 - k) + LAYER_B[id] * k) * eps; out[f.id] = mul(M[f.id], transZ(z)); }
  return {M: out, st};
}
export const _test = {chain, apply, mul, hingeM};
