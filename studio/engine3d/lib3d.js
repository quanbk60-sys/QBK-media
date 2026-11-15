// QBK engine3d: dựng cảnh 3D thực tế bằng three.js trong Chromium (không cần ảnh, không cần key).
// Trang page.html nạp file này; render3d.mjs gọi window.__setup(scene) rồi window.__frame(t) cho từng khung.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {birdModel, pose} from './origami.js';

const W = window.__W, H = window.__H;
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);
const pmrem = new THREE.PMREMGenerator(renderer);
const ENV = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------- procedural textures ----------
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function canvasTex(w, h, draw, repeat = [1, 1], color = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace; return t;
}
function noise(ctx, w, h, n, a, seed, col = '0,0,0') { const r = rng(seed); for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(${col},${(r() * a).toFixed(3)})`; const s = 1 + r() * 3; ctx.fillRect(r() * w, r() * h, s, s); } }
const TEX = {
  wood: (rep) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#8a5a33'; c.fillRect(0, 0, w, h); const r = rng(3);
    for (let i = 0; i < 90; i++) { c.strokeStyle = `rgba(${40 + r() * 40},${20 + r() * 20},10,${0.15 + r() * 0.3})`; c.lineWidth = 1 + r() * 4; c.beginPath(); let x = r() * w; c.moveTo(x, 0); for (let y = 0; y <= h; y += 32) c.lineTo(x + Math.sin(y * 0.02 + i) * 6, y); c.stroke(); }
    noise(c, w, h, 3000, 0.12, 5); }, rep),
  planks: (rep) => canvasTex(512, 512, (c, w, h) => { const r = rng(9); for (let i = 0; i < 8; i++) { const g = 120 + r() * 40; c.fillStyle = `rgb(${g},${g * 0.66},${g * 0.4})`; c.fillRect(i * 64, 0, 64, h);
      for (let k = 0; k < 14; k++) { c.strokeStyle = `rgba(60,35,15,${0.15 + r() * 0.25})`; c.lineWidth = 1 + r() * 2; c.beginPath(); const x = i * 64 + r() * 64; c.moveTo(x, 0); c.bezierCurveTo(x + 8, h * 0.3, x - 8, h * 0.7, x + 3, h); c.stroke(); }
      c.fillStyle = 'rgba(30,18,8,.8)'; c.fillRect(i * 64, 0, 3, h); } noise(c, w, h, 2500, 0.1, 2); }, rep),
  stoneTiles: (rep) => canvasTex(512, 512, (c, w, h) => { const r = rng(4); c.fillStyle = '#9a958c'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const g = 170 + r() * 40; c.fillStyle = `rgb(${g},${g - 4},${g - 12})`; c.fillRect(x * 128 + 3, y * 128 + 3, 122, 122); }
    noise(c, w, h, 9000, 0.12, 7); noise(c, w, h, 2000, 0.15, 8, '255,255,255'); }, rep),
  sand: (rep) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#c9a777'; c.fillRect(0, 0, w, h); noise(c, w, h, 22000, 0.18, 11); noise(c, w, h, 9000, 0.2, 12, '255,240,210'); }, rep),
  dirt: (rep) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#6e5238'; c.fillRect(0, 0, w, h); noise(c, w, h, 22000, 0.25, 13); noise(c, w, h, 6000, 0.15, 14, '200,170,130'); }, rep),
  grass: (rep) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#5d7d38'; c.fillRect(0, 0, w, h); noise(c, w, h, 26000, 0.25, 15, '20,40,10'); noise(c, w, h, 12000, 0.2, 16, '160,190,90'); }, rep),
  mudbrick: (rep) => canvasTex(512, 512, (c, w, h) => { const r = rng(17); c.fillStyle = '#9c7650'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < 16; y++) for (let x = -1; x < 8; x++) { const g = 150 + r() * 35; c.fillStyle = `rgb(${g},${g * 0.75},${g * 0.52})`; c.fillRect(x * 64 + (y % 2) * 32 + 2, y * 32 + 2, 60, 28); }
    noise(c, w, h, 14000, 0.16, 18); }, rep),
  plaster: (rep) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#c69b6d'; c.fillRect(0, 0, w, h); noise(c, w, h, 20000, 0.12, 19); noise(c, w, h, 8000, 0.1, 20, '240,210,170'); }, rep),
  iron: (rep) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#3b3c3e'; c.fillRect(0, 0, w, h); noise(c, w, h, 6000, 0.2, 21); noise(c, w, h, 2000, 0.12, 22, '120,90,70'); }, rep),
  clay: (rep) => canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#a25c3a'; c.fillRect(0, 0, w, h); noise(c, w, h, 5000, 0.15, 23); }, rep),
  straw: (rep) => canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#b89a52'; c.fillRect(0, 0, w, h); const r = rng(24); for (let i = 0; i < 2500; i++) { c.strokeStyle = `rgba(${200 + r() * 50},${170 + r() * 40},${90 + r() * 30},${0.4 + r() * 0.5})`; c.lineWidth = 1 + r(); c.beginPath(); const x = r() * w, y = r() * h, a = r() * Math.PI; c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); c.stroke(); } }, rep),
  waterNormal: () => canvasTex(256, 256, (c, w, h) => { const img = c.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, a = Math.sin(x * 0.15) * 0.5 + Math.sin((x + y) * 0.09) * 0.3 + Math.sin(y * 0.21 + x * 0.05) * 0.4, b = Math.cos(y * 0.13) * 0.5 + Math.cos((x - y) * 0.07) * 0.4;
      img.data[i] = 128 + a * 40; img.data[i + 1] = 128 + b * 40; img.data[i + 2] = 255; img.data[i + 3] = 255; } c.putImageData(img, 0, 0); }, [4, 4], false),
};
const texCache = new Map();
const tex = (name, rep = [1, 1]) => { const k = name + rep.join('x'); if (!texCache.has(k)) texCache.set(k, TEX[name](rep)); return texCache.get(k); };

function mat(name, o = {}) {
  const rep = o.repeat || [1, 1];
  switch (name) {
    case 'wood': return new THREE.MeshStandardMaterial({map: tex('wood', rep), roughness: 0.75, envMapIntensity: 0.4});
    case 'planks': return new THREE.MeshStandardMaterial({map: tex('planks', rep), roughness: 0.8, envMapIntensity: 0.3});
    case 'iron': return new THREE.MeshStandardMaterial({map: tex('iron', rep), metalness: 0.85, roughness: 0.45, envMapIntensity: 0.9});
    case 'copper': return new THREE.MeshStandardMaterial({color: '#b56a3b', metalness: 1, roughness: 0.35});
    case 'steel': return new THREE.MeshStandardMaterial({color: '#c9ccd1', metalness: 1, roughness: 0.22});
    case 'clay': return new THREE.MeshStandardMaterial({map: tex('clay', rep), roughness: 0.9});
    case 'mudbrick': return new THREE.MeshStandardMaterial({map: tex('mudbrick', rep), roughness: 0.95, bumpMap: tex('mudbrick', rep), bumpScale: 2});
    case 'plaster': return new THREE.MeshStandardMaterial({map: tex('plaster', rep), roughness: 0.95, bumpMap: tex('plaster', rep), bumpScale: 1.5});
    case 'stone': return new THREE.MeshStandardMaterial({map: tex('stoneTiles', rep), roughness: 0.85});
    case 'rock': return new THREE.MeshStandardMaterial({color: '#7d776f', roughness: 0.95, flatShading: true});
    case 'sand': return new THREE.MeshStandardMaterial({map: tex('sand', rep), roughness: 1});
    case 'dirt': return new THREE.MeshStandardMaterial({map: tex('dirt', rep), roughness: 1});
    case 'grass': return new THREE.MeshStandardMaterial({map: tex('grass', rep), roughness: 1});
    case 'straw': return new THREE.MeshStandardMaterial({map: tex('straw', rep), roughness: 1});
    case 'water': return new THREE.MeshPhysicalMaterial({color: o.color || '#3d6f7d', roughness: 0.05, metalness: 0, transmission: 0.55, thickness: 0.5, ior: 1.33, normalMap: tex('waterNormal'), normalScale: new THREE.Vector2(0.35, 0.35), transparent: true, opacity: 0.92, envMapIntensity: 1.2});
    case 'ice': return new THREE.MeshPhysicalMaterial({color: '#dff3fb', roughness: 0.12, transmission: 0.85, thickness: 1.2, ior: 1.31, clearcoat: 1, transparent: true, opacity: 0.95, envMapIntensity: 1.5});
    case 'cloth': return new THREE.MeshStandardMaterial({color: o.color || '#d8cbb0', roughness: 1});
    case 'ember': return new THREE.MeshStandardMaterial({color: '#2a1a12', emissive: '#ff5a10', emissiveIntensity: 1.5, roughness: 0.9});
    default: return new THREE.MeshStandardMaterial({color: o.color || name || '#cccccc', roughness: o.roughness ?? 0.7, metalness: o.metalness ?? 0});
  }
}
const shadow = (m, cast = true, recv = true) => { m.traverse(o => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = recv; } }); return m; };

// ---------- object library ----------
const LIB = {

  // giấy gấp mô phỏng cứng (origami.js). Track: spine, kiteL, kiteR, rev (0 | 1 | 2), layerB (0..1), wing, guides (0..1), flapAmp, flapHz
  origami(p) {
    const model = birdModel(p.params || {}), S = p.size || 0.106, g = new THREE.Group(), inner = new THREE.Group(), off = new THREE.Group();
    inner.rotation.x = -Math.PI / 2; inner.scale.setScalar(S); off.position.set(-(p.center ?? 1), 0, 0); inner.add(off); g.add(inner);
    const grain = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); noise(c, w, h, 9000, 0.05, 31); noise(c, w, h, 3000, 0.05, 32, '255,255,255'); }, [4, 4]);
    const white = new THREE.MeshStandardMaterial({color: p.back || '#f3efe6', map: grain, roughness: 0.9, side: THREE.FrontSide});
    const colr = new THREE.MeshStandardMaterial({color: p.color || '#d23b3b', map: grain, roughness: 0.82, side: THREE.BackSide});
    const fm = {};
    for (const f of model.faces) { const geo = new THREE.ShapeGeometry(new THREE.Shape(f.poly.map(([x, y]) => new THREE.Vector2(x, y))));
      const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, geo.attributes.position.getX(i) / 2, geo.attributes.position.getY(i) / 2);
      const grp = new THREE.Group(); grp.matrixAutoUpdate = false; grp.add(new THREE.Mesh(geo, white), new THREE.Mesh(geo, colr)); off.add(grp); fm[f.id] = grp; }
    shadow(g);
    // nét chỉ dẫn (gạch đứt) cho các nếp gấp ngược, vẽ trên mặt giấy khi giấy mở phẳng
    const gmat = new THREE.MeshBasicMaterial({color: p.guideColor || '#1f5fbf', transparent: true, opacity: 0, depthWrite: false}), guideGrp = new THREE.Group(); guideGrp.matrixAutoUpdate = false; off.add(guideGrp);
    const gpos = []; for (const name of p.guides || ['neck', 'head', 'tail']) for (const [a, b] of model.creases[name]) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 0.05)), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, w = 0.008;
      for (let i = 0; i < n; i += 2) { const s0 = i / n * L, s1 = Math.min(L, (i + 1) / n * L), q = (s) => [a[0] + ux * s, a[1] + uy * s];
        const [x0, y0] = q(s0), [x1, y1] = q(s1); gpos.push(x0 - uy * w, y0 + ux * w, 0, x0 + uy * w, y0 - ux * w, 0, x1 + uy * w, y1 - ux * w, 0, x0 - uy * w, y0 + ux * w, 0, x1 + uy * w, y1 - ux * w, 0, x1 - uy * w, y1 + ux * w, 0); } }
    const ggeo = new THREE.BufferGeometry(); ggeo.setAttribute('position', new THREE.Float32BufferAttribute(gpos, 3)); const gm = new THREE.Mesh(ggeo, gmat); gm.renderOrder = 2; guideGrp.add(gm);
    const m4 = new THREE.Matrix4();
    g.userData.update = (q, t) => {
      const amp = q.flapAmp ?? p.flapAmp ?? 0, hz = q.flapHz ?? p.flapHz ?? 2.2;
      const st = {spine: q.spine ?? p.spine ?? 0, kiteL: q.kiteL ?? p.kiteL ?? 0, kiteR: q.kiteR ?? p.kiteR ?? 0, rev: Math.round(q.rev ?? p.rev ?? 0), layerB: q.layerB ?? p.layerB, wing: (q.wing ?? p.wing ?? 0) + amp * Math.sin(t * hz * Math.PI * 2)};
      const {M} = pose(model, st);
      for (const id in fm) { const a = M[id]; m4.set(...a); fm[id].matrix.copy(m4); }
      const gop = q.guides ?? p.guidesOn ?? 0; gmat.opacity = 0.9 * gop; guideGrp.visible = gop > 0.01; m4.set(...M.bodyL); guideGrp.matrix.copy(m4).multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.03));
    };
    g.userData.update({}, 0); return g;
  },
  // ruộng lúa: lá lúa và bông lúa dạng instanced, lắc theo gió trong vertex shader
  ricefield(p) {
    const [w, d] = p.size || [40, 40], n = p.count || 26000, r = rng(p.seed || 3), g = new THREE.Group();
    const blade = new THREE.PlaneGeometry(0.035, 0.75, 1, 4); blade.translate(0, 0.375, 0);
    const pos = blade.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, y * y * 0.35); pos.setX(i, pos.getX(i) * (1 - y / 0.9)); } blade.computeVertexNormals();
    const col = new THREE.Color(p.color || '#d9b23f'), uTime = {value: 0};
    const m = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: 0.85, side: THREE.DoubleSide, vertexColors: false});
    m.onBeforeCompile = sh => { sh.uniforms.uTime = uTime; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); float k = position.y * position.y; transformed.x += sin(uTime * 1.6 + wp.x * 0.35 + wp.z * 0.2) * 0.12 * k; transformed.z += cos(uTime * 1.3 + wp.x * 0.2) * 0.06 * k;`); };
    const im = new THREE.InstancedMesh(blade, m, n), o = new THREE.Object3D(), c = new THREE.Color();
    for (let i = 0; i < n; i++) { o.position.set((r() - 0.5) * w, 0, (r() - 0.5) * d); o.rotation.set((r() - 0.5) * 0.3, r() * Math.PI * 2, (r() - 0.5) * 0.3); o.scale.setScalar(0.7 + r() * 0.6); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
      c.copy(col).offsetHSL((r() - 0.5) * 0.04, (r() - 0.5) * 0.15, (r() - 0.5) * 0.18); im.setColorAt(i, c); }
    im.receiveShadow = true; g.add(im);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(w * 6, d * 3), new THREE.MeshStandardMaterial({color: p.groundColor || '#8a6a26', map: tex('dirt', [w, d]), roughness: 1})); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
    g.userData.update = (q, t) => { uTime.value = t; };
    return g;
  },
  ground(p) { const g = new THREE.Mesh(p.hole ? new THREE.RingGeometry(p.hole, (p.size || 60) / 2, 64, 2) : new THREE.PlaneGeometry(p.size || 60, p.size || 60), mat(p.material || 'sand', {repeat: [(p.size || 60) / (p.tile || 4), (p.size || 60) / (p.tile || 4)]})); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; return g; },
  box(p) { const m = new THREE.Mesh(new THREE.BoxGeometry(...(p.size || [1, 1, 1])), mat(p.material, {repeat: p.repeat, color: p.color})); m.position.y = (p.size || [1, 1, 1])[1] / 2; return shadow(new THREE.Group().add(m)); },
  cylinder(p) { const m = new THREE.Mesh(new THREE.CylinderGeometry(p.r ?? 0.5, p.r2 ?? p.r ?? 0.5, p.h ?? 1, 48), mat(p.material, {repeat: p.repeat, color: p.color})); m.position.y = (p.h ?? 1) / 2; return shadow(new THREE.Group().add(m)); },
  // wooden tub of staves with two iron hoops; `water` 0..1 fill level
  tub(p) { const R = p.r || 1, Hh = p.h || 0.7, n = 28, g = new THREE.Group(), wood = mat('wood', {repeat: [0.3, 1]});
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, s = new THREE.Mesh(new THREE.BoxGeometry(2 * Math.PI * R / n * 0.96, Hh, 0.07), wood); s.position.set(Math.cos(a) * R, Hh / 2, Math.sin(a) * R); s.rotation.y = -a + Math.PI / 2; s.rotation.x = 0; g.add(s); }
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.06, 48), mat('planks', {repeat: [2, 2]})); bottom.position.y = 0.05; g.add(bottom);
    for (const y of [0.18, Hh - 0.15]) { const hoop = new THREE.Mesh(new THREE.TorusGeometry(R + 0.04, 0.025, 8, 64), mat('iron')); hoop.rotation.x = Math.PI / 2; hoop.position.y = y; g.add(hoop); }
    const water = new THREE.Mesh(new THREE.CircleGeometry(R - 0.03, 48), mat('water')); water.rotation.x = -Math.PI / 2; water.name = 'water'; g.add(water);
    g.userData.update = (q) => { const lv = q.water ?? p.water ?? 0.7; water.visible = lv > 0.01; water.position.y = 0.08 + lv * (Hh - 0.15); };
    return shadow(g); },
  // iron wok on three stones, optional fire beneath
  wok(p) { const R = p.r || 0.8, g = new THREE.Group(); const pts = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI * 0.42; pts.push(new THREE.Vector2(Math.sin(a) * R, (1 - Math.cos(a)) * R * 0.9)); }
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), mat('iron')); bowl.material.side = THREE.DoubleSide; bowl.position.y = 0.45; g.add(bowl);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 8, 24, Math.PI), mat('iron')); h.position.set(s * (R * 0.66 + 0.08), 0.45 + R * 0.3, 0); h.rotation.set(0, s > 0 ? Math.PI / 2 : -Math.PI / 2, 0); g.add(h); }
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2, st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), mat('rock')); st.position.set(Math.cos(a) * R * 0.55, 0.18, Math.sin(a) * R * 0.55); st.scale.y = 1.4; g.add(st); }
    const liquid = new THREE.Mesh(new THREE.CircleGeometry(R * 0.5, 48), mat('water', {color: p.liquid || '#6b5a2a'})); liquid.rotation.x = -Math.PI / 2; liquid.position.y = 0.45 + 0.12; g.add(liquid);
    g.userData.update = q => { const lv = q.level ?? p.level ?? 0.5; liquid.visible = lv > 0.02; liquid.scale.setScalar(0.3 + lv * 0.9); liquid.position.y = 0.47 + lv * R * 0.28; };
    if (p.fire) g.add(LIB.fire({size: R * 0.8}));
    return shadow(g); },
  fire(p) { const g = new THREE.Group(), s = p.size || 1, n = 60, r = rng(7);
    const light = new THREE.PointLight('#ff8a3a', 6 * s, 6 * s, 2); light.position.y = 0.4 * s; g.add(light);
    const sprites = []; const tx = canvasTex(64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,240,180,1)'); gr.addColorStop(0.35, 'rgba(255,140,40,.8)'); gr.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });
    for (let i = 0; i < n; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({map: tx, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true})); m.userData = {ph: r(), x: (r() - 0.5) * 0.5 * s, z: (r() - 0.5) * 0.5 * s, sp: 0.6 + r() * 0.6}; g.add(m); sprites.push(m); }
    const logs = new THREE.Group(); for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s, 0.06 * s, 0.7 * s, 10), mat('ember')); l.rotation.set(Math.PI / 2, i * Math.PI / 3, 0); l.position.y = 0.06 * s; logs.add(l); } g.add(logs);
    g.userData.update = (q, t) => { const on = q.on ?? 1; g.visible = on > 0.01; light.intensity = on * (5 + Math.sin(t * 17) * 1.2 + Math.sin(t * 7.3)) * s;
      for (const m of sprites) { const k = (t * m.userData.sp + m.userData.ph) % 1; m.position.set(m.userData.x * (1 - k), 0.1 * s + k * 0.9 * s, m.userData.z * (1 - k)); const sc = (0.45 * (1 - k) + 0.1) * s * on; m.scale.set(sc, sc * 1.4, 1); m.material.opacity = (1 - k) * 0.9; } };
    return g; },
  // block of ice; `grow` 0..1 scales thickness (freezing)
  ice(p) { const sz = p.size || [0.6, 0.3, 0.6], m = new THREE.Mesh(new THREE.BoxGeometry(...sz, 1, 1, 1), mat('ice')); const g = new THREE.Group().add(m);
    g.userData.update = q => { const k = q.grow ?? 1; m.scale.y = Math.max(0.02, k); m.position.y = sz[1] * k / 2; m.visible = k > 0.01; }; return shadow(g, true, false); },
  // shallow rectangular pool, water may freeze (`freeze` 0..1 -> white-blue ice sheet)
  pool(p) { const [w, d] = p.size || [4, 2], dep = p.depth || 0.25, g = new THREE.Group(), m = mat(p.material || 'plaster', {repeat: [w / 2, 1]});
    for (const [sx, sz, x, z] of [[w + 0.3, 0.15, 0, d / 2 + 0.075], [w + 0.3, 0.15, 0, -d / 2 - 0.075], [0.15, d, w / 2 + 0.075, 0], [0.15, d, -w / 2 - 0.075, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, dep, sz), m); b.position.set(x, dep / 2, z); g.add(b); }
    const water = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat('water')); water.rotation.x = -Math.PI / 2; water.position.y = dep * 0.7; g.add(water);
    const ice = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshPhysicalMaterial({color: '#eef8ff', roughness: 0.25, clearcoat: 1, transparent: true, opacity: 0})); ice.rotation.x = -Math.PI / 2; ice.position.y = dep * 0.7 + 0.005; g.add(ice);
    g.userData.update = q => { const f = q.freeze ?? p.freeze ?? 0, lv = q.water ?? 1; water.visible = lv > 0.01; ice.material.opacity = f * 0.92; ice.visible = f > 0.01; water.material.opacity = 0.92 * (1 - f * 0.6); };
    return shadow(g); },
  // yakhchal-like stepped dome of mud brick
  dome(p) { const R = p.r || 3, Hh = p.h || 6, steps = p.steps || 9, pts = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= steps; i++) { const k = i / steps, r = R * (1 - Math.pow(k, 1.35)), y = Hh * k; pts.push(new THREE.Vector2(r, y)); if (i < steps) pts.push(new THREE.Vector2(r * 0.97, y + Hh / steps * 0.5)); }
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 72), mat('plaster', {repeat: [6, 3]})); const g = new THREE.Group().add(m);
    if (p.door !== false) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.3), mat('#2a1d14')); d.position.set(0, 0.7, R - 0.05); g.add(d); }
    return shadow(g); },
  wall(p) { const [l, h, t] = p.size || [10, 3, 0.6], m = new THREE.Mesh(new THREE.BoxGeometry(l, h, t), mat(p.material || 'mudbrick', {repeat: [l / 2, h / 2]})); m.position.y = h / 2; return shadow(new THREE.Group().add(m)); },
  // trench with flowing water (qanat channel)
  channel(p) { const l = p.length || 8, w = p.width || 0.6, g = new THREE.Group(), m = mat('plaster', {repeat: [l / 2, 1]});
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(l, 0.25, 0.2), m); b.position.set(0, 0.125, s * (w / 2 + 0.1)); g.add(b); }
    const water = new THREE.Mesh(new THREE.PlaneGeometry(l, w), mat('water')); water.rotation.x = -Math.PI / 2; water.position.y = 0.12; g.add(water);
    g.userData.update = (q, t) => { water.material.normalMap.offset.x = -t * 0.15 * (q.flow ?? 1); water.visible = (q.water ?? 1) > 0.01; };
    return shadow(g); },
  rock(p) { const r = rng(p.seed || 1), m = new THREE.Mesh(mergeVertices(new THREE.IcosahedronGeometry(p.r || 0.5, 2).deleteAttribute('normal').deleteAttribute('uv')), mat('rock')); const pos = m.geometry.attributes.position; const ph = [r() * 6, r() * 6, r() * 6]; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), k = 0.85 + 0.15 * Math.sin(x * 5 + ph[0]) * Math.sin(y * 4 + ph[1]) + 0.08 * Math.sin(z * 9 + ph[2]); pos.setXYZ(i, x * k * 1.1, y * k * 0.7, z * k); } m.geometry.computeVertexNormals(); m.position.y = (p.r || 0.5) * 0.4; return shadow(new THREE.Group().add(m)); },
  tree(p) { const g = new THREE.Group(), h = p.h || 4; const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * h / 4, 0.2 * h / 4, h * 0.5, 10), mat('wood')); trunk.position.y = h * 0.25; g.add(trunk);
    const r = rng(p.seed || 3), leaf = mat(p.kind === 'cypress' ? '#2f4a26' : '#4e6d2e', {roughness: 0.95}); leaf.flatShading = true;
    if (p.kind === 'cypress') { const c = new THREE.Mesh(new THREE.ConeGeometry(h * 0.16, h * 0.8, 9), leaf); c.position.y = h * 0.6; g.add(c); }
    else for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(h * (0.16 + r() * 0.08), 0), leaf); b.position.set((r() - 0.5) * h * 0.35, h * (0.55 + r() * 0.3), (r() - 0.5) * h * 0.35); g.add(b); }
    return shadow(g); },
  hay(p) { const m = new THREE.Mesh(new THREE.SphereGeometry(p.r || 0.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('straw', {repeat: [2, 1]})); m.scale.y = 0.6; return shadow(new THREE.Group().add(m)); },
  jar(p) { const pts = [[0, 0], [0.25, 0], [0.34, 0.15], [0.38, 0.4], [0.3, 0.62], [0.16, 0.72], [0.18, 0.8]].map(([x, y]) => new THREE.Vector2(x * (p.s || 1), y * (p.s || 1))); return shadow(new THREE.Group().add(new THREE.Mesh(new THREE.LatheGeometry(pts, 40), mat('clay')))); },
  fence(p) { const g = new THREE.Group(), l = p.length || 6, n = Math.round(l / 0.35), w = mat('wood', {repeat: [0.2, 1]});
    for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 0.05), w); b.position.set(-l / 2 + i * 0.35, 0.55, 0); g.add(b); }
    for (const y of [0.3, 0.85]) { const r = new THREE.Mesh(new THREE.BoxGeometry(l, 0.08, 0.06), w); r.position.set(-0.1, y, -0.05); g.add(r); } return shadow(g); },
  steam(p) { const g = new THREE.Group(), n = 26, r = rng(5), tx = canvasTex(64, 64, c => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); }), sp = [];
    for (let i = 0; i < n; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({map: tx, depthWrite: false, transparent: true})); m.userData = {ph: r(), x: (r() - 0.5) * (p.w || 0.8), z: (r() - 0.5) * (p.w || 0.8)}; g.add(m); sp.push(m); }
    g.userData.update = (q, t) => { const on = q.on ?? 1; for (const m of sp) { const k = (t * 0.25 + m.userData.ph) % 1; m.position.set(m.userData.x + Math.sin(t + k * 6) * 0.1, k * (p.h || 1.6), m.userData.z); const s = (0.3 + k * 0.9) * (p.size || 1); m.scale.set(s, s, 1); m.material.opacity = (1 - k) * 0.6 * on; } };
    return g; },
  dune(p) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat('sand', {repeat: [6, 3]})); m.scale.set(p.w || 12, p.h || 2.5, p.d || 8); m.position.y = -(p.sink ?? 0.4) * (p.h || 2.5); return shadow(new THREE.Group().add(m), false, true); },
  // powder / material pile: cone with colour or texture
  pile(p) { const r = p.r || 0.35, h = p.h || 0.3, pts = []; for (let i = 0; i <= 14; i++) { const k = i / 14, x = r * (1 - k), y = h * Math.pow(Math.sin(k * Math.PI / 2), 0.8); pts.push(new THREE.Vector2(x, y)); }
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts.reverse(), 48), p.material ? mat(p.material, {repeat: [1, 1]}) : new THREE.MeshStandardMaterial({color: p.color || '#cccccc', roughness: 1})); m.material.side = THREE.DoubleSide; return shadow(new THREE.Group().add(m)); },
  egg(p) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09 * (p.s || 1), 32, 16), new THREE.MeshPhysicalMaterial({color: '#f3ead8', roughness: 0.45, clearcoat: 0.3})); m.scale.y = 1.3; m.position.y = 0.11 * (p.s || 1); return shadow(new THREE.Group().add(m)); },
  // shallow bowl, optional content colour (filled) or `ice: true` (shaved ice)
  bowl(p) { const R = p.r || 0.35, pts = []; for (let i = 0; i <= 16; i++) { const a = i / 16 * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * R, (1 - Math.cos(a)) * R * 0.6)); }
    const g = new THREE.Group(), b = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mat(p.material || 'clay')); b.material.side = THREE.DoubleSide; g.add(b);
    if (p.ice || p.fill) { const c = new THREE.Mesh(new THREE.SphereGeometry(R * 0.92, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), p.ice ? new THREE.MeshPhysicalMaterial({color: '#f4fbff', roughness: 0.35, transmission: 0.3, clearcoat: 0.5}) : new THREE.MeshStandardMaterial({color: p.fill, roughness: 1})); c.scale.y = p.ice ? 0.55 : 0.25; c.position.y = R * 0.4; g.add(c);
      if (p.topping) { const tp = new THREE.Mesh(new THREE.SphereGeometry(R * 0.5, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color: p.topping, roughness: 0.6})); tp.scale.y = 0.3; tp.position.y = R * 0.4 + R * 0.5; g.add(tp); } }
    return shadow(g); },
  board(p) { const [w, d] = p.size || [3, 2], g = new THREE.Group(), top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), mat('planks', {repeat: [w / 2, d / 2]})); top.position.y = (p.h ?? 0.8); g.add(top);
    if (p.legs !== false) for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, p.h ?? 0.8, 0.1), mat('wood')); l.position.set(x * (w / 2 - 0.1), (p.h ?? 0.8) / 2, z * (d / 2 - 0.1)); g.add(l); } return shadow(g); },
  // cutaway pit under a dome: dark interior ring wall + floor (place at ground level, camera looks down into it)
  pit(p) { const R = p.r || 2.5, D = p.depth || 2, g = new THREE.Group(), wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.9, D, 48, 1, true), mat('mudbrick', {repeat: [8, 2]})); wall.material.side = THREE.BackSide; wall.position.y = -D / 2; g.add(wall);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(R * 0.9, 48), mat('dirt', {repeat: [3, 3]})); floor.rotation.x = -Math.PI / 2; floor.position.y = -D + 0.01; g.add(floor);
    const rim = new THREE.Mesh(new THREE.RingGeometry(R, R + 0.6, 48), mat('plaster', {repeat: [6, 1]})); rim.rotation.x = -Math.PI / 2; rim.position.y = 0.01; g.add(rim); return shadow(g, false, true); },
  // thick wall section with layered cross-section (for "tường dày")
  section(p) { const [l, h, t] = p.size || [3, 2.5, 2], g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(l, h, t), [mat('plaster', {repeat: [l, h]}), mat('plaster', {repeat: [l, h]}), mat('plaster'), mat('mudbrick', {repeat: [l, 1]}), mat('mudbrick', {repeat: [t, h]}), mat('plaster', {repeat: [l, h]})]); b.position.y = h / 2; g.add(b);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, t), new THREE.MeshBasicMaterial({color: '#FFE14D'})); bar.position.set(l / 2 + 0.15, h + 0.15, 0); g.add(bar);
    for (const s of [-1, 1]) { const tick = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.04), new THREE.MeshBasicMaterial({color: '#FFE14D'})); tick.position.set(l / 2 + 0.15, h + 0.15, s * t / 2); g.add(tick); } return shadow(g); },
  stars(p) { const n = 1500, r = rng(2), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, e = Math.asin(r()), R = 300; pos.set([Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return new THREE.Points(g, new THREE.PointsMaterial({color: '#ffffff', size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.9})); },
  moon(p) { const m = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 16), new THREE.MeshBasicMaterial({color: '#f4f1e0'})); m.position.set(...(p.at || [-60, 70, -200])); return m; },
};

// ---------- sky + light per "time" ----------
const SKY = {day: ['#8fb8de', '#e6eef4', '#fff6e8', 3.2, [8, 12, 6]], dusk: ['#3b4a7a', '#e59a6a', '#ffb07a', 2.0, [10, 4, -4]], night: ['#04070f', '#0b1a33', '#9fb4ff', 0.35, [-6, 10, -8]], studio: ['#d9d5ce', '#f2efea', '#ffffff', 2.6, [5, 10, 7]]};
let scene, camera, sun, hemi, objs = [], cur = null, S = null;
function skyTex(top, bottom) { return canvasTex(2, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, 0, w, h); }); }
function build(shot) {
  scene = new THREE.Scene(); scene.environment = ENV; objs = [];
  scene.environmentIntensity = {day: 1, dusk: 0.55, night: 0.12, studio: 1}[shot.time || S.time || 'day'];
  const time = shot.time || S.time || 'day', [top, bottom, sunCol, sunI, sunPos] = SKY[time];
  scene.background = skyTex(top, bottom); scene.fog = new THREE.Fog(bottom, shot.fogNear ?? 25, shot.fogFar ?? 90);
  hemi = new THREE.HemisphereLight(top, '#6b5a44', time === 'night' ? 0.25 : 0.9); scene.add(hemi);
  sun = new THREE.DirectionalLight(sunCol, sunI); sun.position.set(...sunPos).multiplyScalar(3); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 4; sun.shadow.bias = -0.0004;
  const sc = sun.shadow.camera, sh = shot.shadowSize || 14; sc.left = sc.bottom = -sh; sc.right = sc.top = sh; sc.near = 1; sc.far = 120; scene.add(sun);
  renderer.toneMappingExposure = {day: 1, dusk: 0.95, night: 0.7, studio: 1.05}[time];
  camera = new THREE.PerspectiveCamera(shot.fov || 40, W / H, 0.05, 600);
  for (const o of [...(S.sets?.[shot.set] || []), ...(shot.objects || [])]) {
    const fn = LIB[o.type]; if (!fn) throw new Error('engine3d: không có đồ vật "' + o.type + '"');
    const m = fn(o); m.userData.spec = o; if (o.at) m.position.set(...o.at); if (o.rot) m.rotation.set(...o.rot.map(d => d * Math.PI / 180)); if (o.scale) m.scale.setScalar(o.scale);
    scene.add(m); objs.push(m);
  }
}
// ---------- tracks ----------
const ease = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
function sample(keys, t, key) { if (!keys?.length) return undefined; const ks = keys.filter(k => k[key] !== undefined); if (!ks.length) return undefined;
  if (t <= ks[0].t) return ks[0][key]; for (let i = 1; i < ks.length; i++) if (t < ks[i].t) { const a = ks[i - 1], b = ks[i], u = ks[i].ease === 'linear' ? (t - a.t) / (b.t - a.t) : ease((t - a.t) / (b.t - a.t)), va = a[key], vb = b[key]; return Array.isArray(va) ? va.map((v, j) => v + (vb[j] - v) * u) : va + (vb - va) * u; } return ks.at(-1)[key]; }

// ---------- overlay (captions, titles, labels) ----------
const ov = document.getElementById('overlay');
const STOP = new Set(['ĐƯỢC', 'THÌ', 'LÀ', 'VÀ', 'CỦA', 'NHỮNG', 'MỘT', 'CÁC', 'CHO', 'VỚI', 'NÀY', 'ĐÓ', 'KHI', 'ĐÃ', 'SẼ', 'ĐANG', 'RỒI', 'CŨNG', 'NHƯNG', 'MÀ', 'NÊN', 'VÌ', 'BẠN', 'NÓ', 'TA', 'RA', 'VÀO', 'LÊN', 'XUỐNG', 'RẤT', 'CÒN', 'NHƯ', 'TỪ', 'TRONG', 'TRÊN', 'DƯỚI', 'ĐỂ', 'CÓ', 'NGƯỜI']);
const esc = s => String(s).replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]));
function captionHTML(text) { const words = text.toUpperCase().split(' '), bare = w => w.replace(/[^\p{L}\p{N}]/gu, '');
  let key = words.findIndex(w => /^\*.*\*/.test(w)); if (key < 0) key = words.reduce((k, w, i) => { const sc = x => STOP.has(bare(x)) ? 0 : bare(x).length; return sc(w) > sc(words[k]) ? i : k; }, 0);
  return words.map((w, i) => `<span class="${i === key && words.length > 1 ? 'k' : ''}">${esc(w.replace(/\*/g, ''))}</span>`).join(' '); }
function overlay(T, shot, t) {
  let h = '';
  const cue = S.captionItems.find(c => T >= c.start && T < c.end); if (cue) h += `<div class="cap">${captionHTML(cue.text)}</div>`;
  for (const e of shot.texts || []) { if (t < (e.from ?? 0) || (e.to !== undefined && t >= e.to)) continue; const a = Math.min(1, (t - (e.from ?? 0)) / 0.3) * (e.to !== undefined ? Math.min(1, (e.to - t) / 0.3) : 1);
    if (e.type === 'label') { const v = new THREE.Vector3(...e.at).project(camera); if (v.z > 1) continue; h += `<div class="lbl" style="left:${(v.x + 1) / 2 * W}px;top:${(1 - v.y) / 2 * H}px;opacity:${a}">${esc(e.text)}</div>`; }
    else if (e.type === 'title') h += `<div class="ttl" style="opacity:${a};top:${e.y ?? 40}px">${e.kicker ? `<i>${esc(e.kicker)}</i>` : ''}<b>${esc(e.text)}</b></div>`;
    else if (e.type === 'note') h += `<div class="note" style="opacity:${a * 0.85}">${esc(e.text)}</div>`;
    else if (e.type === 'credit') h += `<div class="credit">${esc(e.text)}</div>`; }
  if (S.watermark) h += `<div class="wm">${esc(S.watermark)}</div>`;
  ov.innerHTML = h;
}

window.__setup = (scn) => { S = scn; };
window.__frame = (T) => {
  const shot = S.shots.find(s => T >= s.start && T < s.end) || S.shots.at(-1), t = T - shot.start;
  if (cur !== shot) { build(shot); cur = shot; }
  const ck = shot.camera || [{t: 0, pos: [6, 4, 8], target: [0, 0.5, 0]}];
  camera.position.set(...sample(ck, t, 'pos')); camera.lookAt(new THREE.Vector3(...sample(ck, t, 'target'))); const fov = sample(ck, t, 'fov'); if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  for (const m of objs) { const sp = m.userData.spec, tr = sp.track; const q = {};
    if (tr) { const p = sample(tr, t, 'at'); if (p) m.position.set(...p); const r = sample(tr, t, 'rot'); if (r) m.rotation.set(...r.map(d => d * Math.PI / 180)); const s = sample(tr, t, 'scale'); if (s !== undefined) m.scale.setScalar(s);
      const keys = new Set(); for (const kf of tr) for (const k in kf) if (!['t', 'at', 'rot', 'scale', 'visible', 'ease'].includes(k)) keys.add(k);
      for (const k of keys) { const v = sample(tr, t, k); if (v !== undefined) q[k] = v; } const vis = sample(tr, t, 'visible'); if (vis !== undefined) m.visible = vis > 0.5; }
    m.traverse(o => o.userData.update?.(q, T));
  }
  renderer.render(scene, camera); overlay(T, shot, t);
};
window.__ready = true;
