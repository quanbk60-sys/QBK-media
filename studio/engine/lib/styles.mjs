// Style packs: one engine, many looks. A style recolours every drawn op (ink, body, named palette),
// scales line weight, paints a background treatment, styles captions and optionally applies a post filter.
// Use in scene.json: "style": "bang-phan". List: node catalog.mjs
import {COLORS, rng} from './math.mjs';

export const STYLES = {
  'giay-muc':   { stroke: 'wobble', boil: true, transition: 'fade', hand: true,label: 'Giấy mực', genres: 'ngụ ngôn, lịch sử VN, kể chuyện', bg: '#F3EADB', deco: 'none', ink: '#2A2723', body: '#FFFFFF',
                 caption: {color: '#2A2723', stroke: 'rgba(243,234,219,.9)'}},
  'bang-phan':  { stroke: 'chalk', fill: 'chalk', boil: true, boilEvery: 3, hand: false, transition: 'smudge', transitionDur: 0.5, captionFont: '{size}px Hand',label: 'Bảng phấn', genres: 'khoa học, "vì sao", mẹo học', bg: '#2F4A3A', deco: 'chalk', ink: '#F2F1E8', body: '#2F4A3A', lineScale: 1.1,
                 palette: {red: '#F7A1A1', navy: '#9FD5F5', gold: '#F6D365', green: '#B9E39B', wood: '#E3C08D', steel: '#DDE3E8', water: '#7FB8D6', waterDeep: '#A9D3EA', paper: '#2F4A3A', skin: '#F6D7B8', sky: '#3B5A48'},
                 caption: {color: '#F7F6EE', stroke: 'rgba(25,40,31,.85)'}, titleFont: 'Hand'},
  'ban-ve':     { stroke: 'plotter', fill: 'ghost', hand: false, transition: 'scan', transitionDur: 0.6, captionBox: 'tag', captionTypewriter: true,label: 'Bản vẽ kỹ thuật', genres: 'lịch sử thế giới, công trình, phát minh', bg: '#1F4E8C', deco: 'blueprint', ink: '#EAF2FF', body: '#1F4E8C', lineScale: 0.7,
                 palette: {red: '#FFD166', navy: '#9CC8FF', gold: '#FFD166', green: '#9CE3C8', wood: '#BFD8FF', steel: '#FFFFFF', water: '#5C8FD0', waterDeep: '#9CC8FF', paper: '#1F4E8C', skin: '#D6E6FF', sky: '#2A5D9E'},
                 caption: {color: '#FFFFFF', stroke: 'rgba(15,40,80,.85)'}, titleFont: 'Sans'},
  'so-tay':     { stroke: 'marker', fill: 'offset', boil: true, boilEvery: 5, hand: true, transition: 'page', transitionDur: 0.55, captionBox: 'note', captionFont: '{size}px Hand',label: 'Sổ tay nguệch ngoạc', genres: 'tâm lý, kỹ năng, năng suất', bg: '#FFFDF6', deco: 'lines', ink: '#1F2A44', body: '#FFFFFF',
                 palette: {red: '#F25F5C', navy: '#3D7DF0', gold: '#FFB703', green: '#4DAA57'},
                 caption: {color: '#1F2A44', stroke: 'rgba(255,253,246,.92)'}},
  'pop':        { stroke: 'clean', fill: 'drop', drawMode: 'pop', hand: false, transition: 'flash', transitionDur: 0.3, captionBox: 'sticker', captionFont: '{size}px QBKBlack',label: 'Pop sặc sỡ', genres: 'hoạt hình vui, meme, thử thách', bg: '#FFD23F', deco: 'burst', ink: '#111111', body: '#FFFFFF', lineScale: 1.45,
                 palette: {red: '#EE4266', navy: '#540D6E', gold: '#FF8C42', green: '#3BCEAC', water: '#3BCEAC', waterDeep: '#1B9AAA', paper: '#FFD23F', sky: '#7AD7F0'},
                 caption: {color: '#111111', stroke: 'rgba(255,255,255,.95)'}, titleFont: 'Sans'},
  'dan-gian':   { stroke: 'woodcut', fill: 'grain', drawMode: 'fade', hand: false, transition: 'wipe', transitionDur: 0.6, captionFont: '{size}px Hand',label: 'Tranh dân gian', genres: 'cổ tích VN, lịch sử VN, lễ Tết', bg: '#EFE2C4', deco: 'frame', ink: '#3B2414', body: '#F7EEDB', lineScale: 1.2,
                 palette: {red: '#B23A2E', navy: '#2D4E7A', gold: '#D9A520', green: '#4F7A3A', wood: '#8A5A2B', water: '#6F95B8', waterDeep: '#2D4E7A', paper: '#EFE2C4', sky: '#E8D7B0'},
                 caption: {color: '#3B2414', stroke: 'rgba(239,226,196,.92)'}},
  'phim-cam':   { stroke: 'wobble', drawMode: 'fade', hand: false, transition: 'iris', transitionDur: 0.6, captionBox: 'intertitle', captionFont: '{size}px Hand',label: 'Phim câm đen trắng', genres: 'bí ẩn, chuyện lạ, hài kiểu cũ', bg: '#1A1A1A', deco: 'film', ink: '#EDEDED', body: '#1A1A1A',
                 palette: {red: '#BDBDBD', navy: '#9A9A9A', gold: '#D6D6D6', green: '#A8A8A8', wood: '#8C8C8C', steel: '#E0E0E0', water: '#6E6E6E', waterDeep: '#9E9E9E', paper: '#1A1A1A', skin: '#CFCFCF', sky: '#2A2A2A'},
                 caption: {color: '#F2F2F2', stroke: 'rgba(0,0,0,.9)'}, titleFont: 'Sans', post: 'bw'},
  'phac-thao':  { stroke: 'pencil', fill: 'hatch', boil: true, boilEvery: 4, hand: true, transition: 'fade', transitionDur: 0.8,label: 'Phác thảo điện ảnh', genres: 'tâm lý, đời sống, chuyện sâu lắng', bg: '#E6DCC6', deco: 'letterbox', ink: '#4A4238', body: '#EFE7D6', lineScale: 0.6,
                 palette: {red: '#9C6B4E', navy: '#5C6470', gold: '#B59A63', green: '#7D8A6A', wood: '#8E7556', steel: '#B9B2A4', water: '#9AA6A8', waterDeep: '#6E7A7C', paper: '#E6DCC6', skin: '#E2CDB0', sky: '#D8D0BE'},
                 caption: {color: '#F3EDE0', stroke: 'rgba(20,18,15,.9)'}, post: 'sepia', captionOnBar: true},
  'ban-do-toi': { stroke: 'neon', fill: 'ghost', hand: false, transition: 'fade', transitionDur: 0.4,label: 'Bản đồ dữ liệu tối', genres: 'địa lý, chiến tranh–hiệp ước, kinh tế', bg: '#14202B', deco: 'vignette', ink: '#E8EEF2', body: '#1E2E3B', lineScale: 0.8,
                 palette: {red: '#C8553D', navy: '#4F86A8', gold: '#E2A72E', green: '#6FA37A', wood: '#B08A5A', steel: '#C9D3DA', water: '#1B3A52', waterDeep: '#2C5878', paper: '#14202B', skin: '#D9C2A6', sky: '#1B2A37'},
                 caption: {color: '#FFFFFF', stroke: 'rgba(8,14,20,.9)'}, titleFont: 'Sans'},
  've-tinh':   {label: 'Vệ tinh ảnh thật', genres: 'địa lý, lịch sử chiến trận, công trình, dự án (ảnh vệ tinh + ảnh thật)', bg: '#05080C', deco: 'none', ink: '#FFFFFF', body: '#1A1F26', lineScale: 0.9,
                 palette: {red: '#E5484D', navy: '#3FB6FF', gold: '#FF8A1F', green: '#46C46B', water: '#1B3A52', waterDeep: '#2C5878', paper: '#05080C', sky: '#0B1118'},
                 caption: {color: '#FFFFFF', stroke: 'rgba(0,0,0,.9)'}, captionFont: '{size}px QBKBlack', captionStrokeW: 12, titleFont: 'Sans'},
  'bds-tien-ich': {label: 'BĐS · Bản đồ tiện ích', genres: 'bất động sản: vị trí dự án, tiện ích xung quanh, hạ tầng giao thông (ảnh vệ tinh, camera nghiêng 3D, ghim kim loại có icon, đường neon)', bg: '#05080C', deco: 'none', ink: '#FFFFFF', body: '#1A1F26', lineScale: 0.9, transition: 'cut',
                 palette: {red: '#E5364B', navy: '#2E9BF0', gold: '#F6C33B', green: '#2FBF5A', water: '#1B3A52', waterDeep: '#2C5878', paper: '#05080C', sky: '#0B1118'},
                 caption: {color: '#FFFFFF', stroke: 'rgba(0,0,0,.92)'}, captionFont: '{size}px QBKBlack', captionStrokeW: 12, captionHighlight: '#FFD54A', titleFont: 'Sans'},
  'thi-nghiem': { stroke: 'clean', drawMode: 'fade', hand: false, transition: 'cut',label: 'Thí nghiệm cổ', genres: 'khoa học đời thường, cách làm, mẹo dân gian, đồ vật (khung 16:9 giữa, nền mờ, chữ 2–3 từ có từ khóa vàng)', bg: '#E9E6E0', deco: 'none', ink: '#2A2723', body: '#FFFFFF',
                 layout: 'blurband', captionWords: 3, captionHighlight: '#FFE14D',
                 caption: {color: '#FFFFFF', stroke: 'rgba(0,0,0,.92)'}, captionFont: '{size}px QBKBlack', captionStrokeW: 9, titleFont: 'Sans'},
};
export const STYLE_NAMES = Object.keys(STYLES);

export function getStyle(name) {
  const st = STYLES[name || 'giay-muc'];
  if (!st) throw new Error(`Unknown style "${name}". Styles: ${STYLE_NAMES.join(', ')}`);
  const remap = new Map();
  for (const [k, v] of Object.entries(COLORS)) if (st.palette?.[k]) remap.set(v.toLowerCase(), st.palette[k]);
  remap.set('#2a2723', st.ink); remap.set('#ffffff', st.body); remap.set('#fff', st.body);
  return {...st, lineScale: st.lineScale ?? 1, map: c => (typeof c === 'string' && remap.get(c.toLowerCase())) || c};
}

// Background treatment (screen space, before elements)
export function paintBackground(ctx, st, W, H, frameNo) {
  ctx.fillStyle = st.bg; ctx.fillRect(0, 0, W, H);
  const r = rng(7);
  switch (st.deco) {
    case 'chalk': for (let i = 0; i < 420; i++) { ctx.fillStyle = `rgba(255,255,255,${(r() * 0.045).toFixed(3)})`; ctx.fillRect(r() * W, r() * H, 20 + r() * 90, 2 + r() * 2); } break;
    case 'blueprint': ctx.lineWidth = 1; for (let x = 0; x <= W; x += 40) { ctx.strokeStyle = x % 200 ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += 40) { ctx.strokeStyle = y % 200 ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } break;
    case 'lines': ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(61,125,240,.18)'; for (let y = 120; y < H; y += 56) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(242,95,92,.45)'; ctx.beginPath(); ctx.moveTo(90, 0); ctx.lineTo(90, H); ctx.stroke(); break;
    case 'burst': ctx.save(); ctx.translate(W / 2, H * 0.42); for (let i = 0; i < 18; i++) { ctx.rotate(Math.PI / 9); if (i % 2) continue; ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(H, -150); ctx.lineTo(H, 150); ctx.closePath(); ctx.fill(); } ctx.restore(); break;
    case 'frame': ctx.lineWidth = 14; ctx.strokeStyle = '#B23A2E'; ctx.strokeRect(24, 24, W - 48, H - 48); ctx.lineWidth = 4; ctx.strokeStyle = '#3B2414'; ctx.strokeRect(46, 46, W - 92, H - 92);
      for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(90,60,30,${(r() * 0.05).toFixed(3)})`; ctx.fillRect(r() * W, r() * H, 2, 2); } break;
    case 'vignette': { const g = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.2, W / 2, H * 0.45, H * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); break; }
  }
}

// Overlays after elements (screen space): film grain, letterbox, colour grading
export function paintOverlay(ctx, st, W, H, frameNo) {
  if (st.post === 'bw' || st.post === 'sepia') {
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
    if (st.post === 'sepia') { ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#F0DDBA'; ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }
  if (st.deco === 'film') {
    const r = rng(1000 + frameNo); for (let i = 0; i < 1400; i++) { ctx.fillStyle = `rgba(255,255,255,${(r() * 0.07).toFixed(3)})`; ctx.fillRect(r() * W, r() * H, 2, 2); }
    if (frameNo % 37 < 2) { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(0, 0, W, H); }
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; const x = (frameNo * 53) % W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 8, H); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 70); ctx.fillRect(0, H - 70, W, 70);
  }
  if (st.deco === 'letterbox') { ctx.fillStyle = '#0E0D0B'; ctx.fillRect(0, 0, W, 230); ctx.fillRect(0, H - 380, W, 380); }
}
