# Builds project.json (B1, 9:16) from the shot plan below. Times are narration (voice) seconds;
# LEAD is added for video time. Re-run after editing; then validate/preview with the skill CLI.
import json, os
from PIL import Image, ImageFont

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1280, 1280 * 1920 / 1080          # design plane (≈2275.6)
LEAD, TAIL = 0.15, 0.35
HAND = ImageFont.truetype(os.path.join(BASE, 'fonts/PatrickHand-Regular.ttf'), 100)
RED, NAVY, INK, GREEN = '#D9442E', '#22306B', '#191916', '#5E8F3E'
CAPTION_Y = 1650

def tw(text, size):  # text width in design units
    return HAND.getlength(text) * size / 100

def title(text, y, size=150, color=INK, frm=0.0, bold=False, pop=True):
    x = (W - tw(text, size)) / 2
    layer = {'type': 'text', 'text': text, 'x': round(x), 'y': y, 'size': size, 'color': color, 'w': W}
    if bold: layer['bold'] = True
    if frm: layer['from'] = frm
    if pop:
        layer['keys'] = [{'t': frm, 'alpha': 0, 'y': y + 30}, {'t': frm + 0.25, 'alpha': 1, 'y': y}]
    return layer

def img(name, x, y, w, keys=None, frm=None, to=None):
    l = {'type': 'image', 'path': f'art/cut/{name}.png', 'x': x, 'y': y, 'w': w}
    if keys: l['keys'] = keys
    if frm is not None: l['from'] = frm
    if to is not None: l['to'] = to
    return l

def h_of(name, w):
    i = Image.open(os.path.join(BASE, f'art/cut/{name}.png'))
    return w * i.height / i.width

def centered(name, w, cy):
    return (W - w) / 2, cy - h_of(name, w) / 2

# ---- shot plan (voice time) -------------------------------------------------
shots, sfx = [], []
def shot(start, end, layers):
    shots.append({'start': start, 'end': end, 'layers': layers})
def fx(t, kind, gain=0.03):
    sfx.append({'time': round(t + LEAD, 3), 'kind': kind, 'gain': gain})

# S1 0–1.75 "Năm 938," — date slams in over the enemy fleet
x, y = centered('01-warship', 1180, 1100)
shot(0, 1.75 + LEAD, [
    title('938', 300, 300, RED, bold=True),
    img('01-warship', x, y, 1180, keys=[{'t': 0, 'angle': -0.015, 'y': y}, {'t': 0.9, 'angle': 0.015, 'y': y + 12}, {'t': 1.8, 'angle': -0.01, 'y': y}]),
])
fx(0.2, 'pop')

# S2 1.75–5.72 "…người thắng không cần tự tay đánh chìm thuyền giặc."
shot(1.75 + LEAD, 5.72 + LEAD, [
    img('01-warship', 300, 640, 880, keys=[{'t': 0, 'angle': 0.01}, {'t': 1.5, 'angle': -0.015}, {'t': 3.0, 'angle': 0.012}, {'t': 3.9, 'angle': -0.005}]),
    img('02-shore-soldier', 80, 900, 420, frm=0.5, keys=[{'t': 0.5, 'x': -60, 'alpha': 0}, {'t': 0.95, 'x': 80, 'alpha': 1}]),
    title('KHÔNG CẦN', 300, 130, INK, frm=1.3),
    title('ĐÁNH CHÌM?', 440, 130, RED, frm=2.3),
])
fx(1.75 + 0.6, 'tap'); fx(1.75 + 2.35, 'pop')

# S3 5.72–8.72 "Thủy triều đã làm điều đó." — water drops, ship lists
x, y = centered('01-warship', 1050, 1050)
shot(5.72 + LEAD, 8.72 + LEAD, [
    title('THỦY TRIỀU', 300, 170, NAVY, bold=True),
    img('01-warship', x, y, 1050, keys=[{'t': 0, 'angle': 0, 'y': y}, {'t': 1.6, 'angle': 0.07, 'y': y + 40}, {'t': 2.9, 'angle': 0.1, 'y': y + 70}]),
    {'type': 'arrow', 'x': 170, 'y': 1430, 'w': 940, 'color': NAVY, 'lineWidth': 6, 'from': 0.6,
     'keys': [{'t': 0.6, 'progress': 0}, {'t': 1.8, 'progress': 1}]},
    {'type': 'underline', 'x': 350, 'y': 500, 'w': 580, 'color': RED, 'from': 1.6, 'keys': [{'t': 1.6, 'progress': 0}, {'t': 2.1, 'progress': 1}]},
])
fx(5.72 + 0.7, 'paper', 0.025)

# S4 8.72–11.70 "Năm 937, Kiều Công Tiễn giết Dương Đình Nghệ"
x, y = centered('03-assassination', 1200, 1050)
shot(8.72 + LEAD, 11.70 + LEAD, [
    title('937', 300, 260, RED, bold=True),
    img('03-assassination', x, y, 1200, keys=[{'t': 0, 'x': x - 120, 'alpha': 0}, {'t': 0.35, 'x': x, 'alpha': 1}, {'t': 2.9, 'x': x + 20}]),
    title('Kiều Công Tiễn', 640, 64, GREEN, frm=1.5, pop=True) | {'x': 90},
    title('Dương Đình Nghệ', 640, 64, '#B8860B', frm=2.0, pop=True) | {'x': 700},
])
fx(8.72 + 0.3, 'tap')

# S5 11.70–13.02 "để cướp quyền." — the seal of office tumbles
shot(11.70 + LEAD, 13.02 + LEAD, [
    title('CƯỚP QUYỀN', 300, 160, RED, bold=True),
    img('04-seal', 370, 640, 540, keys=[{'t': 0, 'y': 560, 'angle': -0.25}, {'t': 0.9, 'y': 900, 'angle': 0.12}, {'t': 1.3, 'y': 880, 'angle': 0.08}]),
])
fx(11.70 + 0.9, 'tap', 0.04)

# S6 13.02–16.05 "Con rể của ông là Ngô Quyền lập tức kéo quân ra hỏi tội."
x, y = centered('05-ngo-quyen-march', 1240, 1080)
shot(13.02 + LEAD, 16.05 + LEAD, [
    title('NGÔ QUYỀN', 300, 190, RED, bold=True),
    img('05-ngo-quyen-march', x, y, 1240, keys=[{'t': 0, 'x': x - 160}, {'t': 3.0, 'x': x + 60}]),
    title('hỏi tội!', 520, 110, INK, frm=1.6),
])
fx(13.02 + 0.15, 'pop'); fx(13.02 + 1.65, 'tap')

# S7 16.05–18.37 "Bị dồn vào thế cùng," — panic shake
x, y = centered('06-kieu-cornered', 560, 1060)
shake = [{'t': round(k * 0.12, 2), 'angle': (0.03 if k % 2 else -0.03)} for k in range(20)]
shot(16.05 + LEAD, 18.37 + LEAD, [
    title('THẾ CÙNG', 300, 170, INK, bold=True),
    img('06-kieu-cornered', x, y, 560, keys=shake),
])
fx(16.05 + 0.9, 'tap', 0.025)

# S8 18.37–21.0 "Kiều Công Tiễn cầu cứu nhà Nam Hán."
x, y = 60, 760
shot(18.37 + LEAD, 21.2, [
    img('07-kieu-letter', x, y, 720, keys=[{'t': 0, 'x': x - 80, 'alpha': 0}, {'t': 0.35, 'x': x, 'alpha': 1}, {'t': 2.6, 'x': x + 30}]),
    title('cầu cứu', 300, 120, INK, frm=0.4),
    title('NAM HÁN', 560, 170, NAVY, bold=True, frm=1.6) | {'x': 600},
])
fx(18.37 + 0.4, 'paper', 0.03); fx(18.37 + 1.65, 'pop')

# ---- captions ---------------------------------------------------------------
caps = json.load(open(os.path.join(BASE, 'captions-audio.json'), encoding='utf8'))
captions = [{'start': round(c['start'] + LEAD, 3), 'end': round(c['end'] + LEAD, 3), 'text': c['text']} for c in caps]

project = {
    'version': 1, 'style': 'B1', 'width': 1080, 'height': 1920, 'fps': 30,
    'font': 'fonts/PatrickHand-Regular.ttf',
    'captionSize': 64, 'captionY': CAPTION_Y,
    'voice': {'path': 'audio/narration.wav', 'lead': LEAD, 'tail': TAIL},
    'captions': captions, 'shots': shots, 'sfx': sfx,
}
for s in project['shots']:
    s['start'], s['end'] = round(s['start'], 3), round(s['end'], 3)
json.dump(project, open(os.path.join(BASE, 'project.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('shots', len(shots), 'sfx', len(sfx), 'captions', len(captions))
