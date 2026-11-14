// Mỗi chương là một phim nhỏ: ?ch=a|b|c|d (render từng chương rồi nối)
const qs = new URLSearchParams(location.search), ch = qs.get('ch') || 'b';
const cv = document.getElementById('cv'), g = cv.getContext('2d');
for (const f of ['italic 400 40px "Cormorant VN"', '400 40px "EB Garamond VN"', 'italic 400 40px "EB Garamond VN"', '700 40px "Bodoni Moda"', '40px "Pinyon Script"', '40px "VT323"']) await document.fonts.load(f, 'Chữ ơ ư 1450');
const m = await import(`./ch-${ch}/film.js`);
await m.init(g, qs);
window.DUR = m.DUR; window.EV = m.EV || []; window.render = t => m.render(g, t); window.READY = true;
