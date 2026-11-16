#!/usr/bin/env python3
"""Dựng scene.json cho demo phong cách ban-tin. Nhạc nền tổng hợp bằng code (audio/bed.wav, không bản quyền)."""
import json, os, wave, numpy as np
B = os.path.dirname(os.path.abspath(__file__))
LEAD = 0.15
dur = json.load(open(f'{B}/captions-audio.json'))[-1]['end'] + LEAD + 0.6

# --- nhạc nền lo-fi rất nhỏ: pad 4 hợp âm + nhịp nhẹ 84 bpm ---
SR = 44100; n = int(SR * (dur + 1)); t = np.arange(n) / SR; y = np.zeros(n)
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
bar = 60 / 84 * 4
for i, ch in enumerate(chords * 10):
    a, b = int(i * bar * SR), int((i + 1) * bar * SR)
    if a >= n: break
    b = min(b, n); tt = t[a:b] - t[a]; env = np.minimum(1, tt / 0.6) * np.minimum(1, (bar - tt) / 0.6)
    for m in ch: f = 440 * 2 ** ((m - 69) / 12); y[a:b] += env * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt + 0.3)) * 0.12
beat = 60 / 84
for k in range(int(dur / beat) + 1):
    a = int(k * beat * SR); m = min(n - a, int(0.25 * SR))
    if m <= 0: break
    tt = np.arange(m) / SR; y[a:a + m] += np.sin(2 * np.pi * (55 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14) * (0.5 if k % 2 == 0 else 0.25)
    if k % 2 == 1: y[a:a + m] += np.random.default_rng(k).normal(0, 1, m) * np.exp(-tt * 40) * 0.08
y = np.convolve(y, np.ones(6) / 6, mode='same'); y /= np.abs(y).max() * 1.1
fade = np.minimum(1, np.minimum(t / 1.0, (dur + 1 - t) / 1.5)); y *= fade
os.makedirs(f'{B}/audio', exist_ok=True)
with wave.open(f'{B}/audio/bed.wav', 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype(np.int16).tobytes())

def sh(a, b, els, sfx=()): return {'start': a, 'end': b, 'elements': els, 'sfx': list(sfx)}
H = lambda text, src=None, **k: {'type': 'headline', 'text': text, **({'source': src} if src else {}), **k}
P = lambda name, x, y, at, d, **params: {'type': 'prop', 'name': name, 'x': x, 'y': y, 'params': params, 'draw': {'at': at, 'dur': d, 'hand': False}}
pop = lambda t, g=0.35: {'t': t, 'kind': 'pop', 'gain': g}

# mốc theo phụ đề (+LEAD): 0.15 | 3.58 "Chỉ năm ngày" | 6.0 "Đến tháng Một" | 9.58 "ChatGPT có khoảng" | 14.6 "Để so sánh" | 19.31 "Còn bạn"
s1, s2, s3, s4, s5, s6 = 0, 3.55, 6.0, 9.55, 14.55, 19.3
shots = [
  sh(s1, s2, [
    H('ChatGPT ra mắt', 'Nguồn: history.com · OpenAI công bố 30/11/2022'),
    P('chatWindow', 650, 690, 0.15, 0.9, w=600),
    P('calendar', 200, 1040, 0.95, 0.6, top='THÁNG 11', day='30', w=250),
    {'type': 'label', 'text': '2022', 'x': 200, 'y': 1235, 'size': 54, 'color': 'red', 'from': 1.5},
    {'type': 'stamp', 'text': 'Ra mắt', 'x': 740, 'y': 1060, 'rotate': -0.22, 'from': 1.9},
  ], [pop(1.9, 0.5)]),
  sh(s2, s3, [
    H('5 ngày: 1 triệu người dùng', 'Nguồn: Sam Altman, theo history.com'),
    {'type': 'counter', 'from': 0, 'to': 1000000, 'x': 540, 'y': 560, 'size': 118, 'dur': 1.6},
    {'type': 'label', 'text': 'người dùng', 'x': 540, 'y': 680, 'size': 52, 'from': 0.3},
    P('people', 540, 900, 0.4, 0.9, n=5, size=80),
    P('timeline', 540, 1130, 0.9, 1.0, w=720, ticks=5, **{'from': '30/11', 'to': '5/12'}),
  ], [pop(0.0, 0.25), pop(1.6, 0.4)]),
  sh(s3, s4, [
    H('Hai tháng sau', 'Nguồn: Reuters 02/02/2023 · ghi chú UBS, dữ liệu Similarweb'),
    {'type': 'card', 'x': 540, 'y': 790, 'w': 760, 'ratio': 0.56, 'textSize': 31, 'titleSize': 40, 'rotate': -0.012, 'site': 'Reuters · 02/02/2023 (tóm tắt)',
     'title': 'ChatGPT lập kỷ lục tăng người dùng nhanh nhất',
     'lines': ['Theo ghi chú của ngân hàng UBS, ChatGPT ước tính', 'đạt *100 triệu người dùng mỗi tháng* vào tháng 1,', 'chỉ hai tháng sau khi ra mắt.', 'Số liệu dựa trên dữ liệu của Similarweb.'],
     'markAt': 1.6, 'from': 0.1, 'enter': 'slide-up'},
    {'type': 'badge', 'text': 'UBS', 'x': 870, 'y': 520, 'r': 70, 'from': 2.0},
  ], [{'t': 0.1, 'kind': 'whoosh', 'gain': 0.25}, pop(2.0, 0.4)]),
  sh(s4, s5, [
    H('~100 triệu người dùng/tháng', 'Nguồn: Reuters · ước tính của UBS'),
    P('rocket', 290, 820, 0.05, 0.8, size=330),
    {'type': 'box', 'x': 690, 'y': 690, 'w': 520, 'h': 200, 'text': '~100 triệu', 'sub': 'người dùng mỗi tháng', 'from': 0.6},
    {'type': 'label', 'text': 'Ứng dụng tiêu dùng\ntăng nhanh nhất', 'x': 690, 'y': 930, 'size': 46, 'from': 2.1},
    {'type': 'label', 'text': '(lúc đó)', 'x': 690, 'y': 1050, 'size': 38, 'color': 'gray', 'from': 3.4},
    {'type': 'stamp', 'text': 'Kỷ lục', 'x': 330, 'y': 1150, 'rotate': -0.28, 'from': 2.4},
  ], [pop(0.6, 0.3), pop(2.4, 0.5)]),
  sh(s5, s6, [
    H('Thời gian đạt 100 triệu người dùng', 'Nguồn: Sensor Tower, theo Reuters'),
  ] + [x for i, (name, val, months, c) in enumerate([('ChatGPT', '2 tháng', 2, 'blue'), ('TikTok', '~9 tháng', 9, 'ink'), ('Instagram', '2,5 năm', 30, 'red')]) for x in [
    {'type': 'label', 'text': name, 'x': 100, 'y': 560 + i * 230, 'size': 50, 'align': 'left', 'from': 0.2 + i * 1.1},
    {'type': 'box', 'x': 100 + max(24, months / 30 * 860) / 2, 'y': 640 + i * 230, 'w': max(24, months / 30 * 860), 'h': 64, 'color': 'blue' if c == 'blue' else 'red', 'from': 0.35 + i * 1.1},
    {'type': 'label', 'text': val, 'x': 100 + max(24, months / 30 * 860) + 24 if months < 20 else 980, 'y': 560 + i * 230 if months >= 20 else 640 + i * 230, 'size': 50, 'align': 'left' if months < 20 else 'right', 'color': 'blue' if c == 'blue' else 'red', 'from': 0.6 + i * 1.1}]],
   [pop(0.35 + i * 1.1, 0.3) for i in range(3)]),
  sh(s6, round(dur, 2), [
    {'type': 'label', 'text': 'Bạn nghĩ sao?', 'x': 540, 'y': 470, 'size': 104, 'underline': True},
    {'type': 'qbox', 'n': 1, 'text': 'Bạn bắt đầu dùng ChatGPT từ khi nào?', 'x': 540, 'y': 730, 'from': 0.5},
    {'type': 'qbox', 'n': 2, 'text': 'Bạn hay dùng nó để làm gì?', 'x': 540, 'y': 930, 'from': 1.5},
  ], [pop(0.5, 0.35), pop(1.5, 0.35)]),
]
scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 'ban-tin', 'duration': round(dur, 2),
         'narration': {'path': 'audio/narration.wav', 'lead': LEAD}, 'captions': {'path': 'captions-audio.json', 'lead': LEAD},
         'music': {'path': 'audio/bed.wav', 'gain': 0.07}, 'scribbleGain': 0, 'shots': shots}
json.dump(scene, open(f'{B}/scene.json', 'w'), ensure_ascii=False, indent=1)
print('duration', round(dur, 2))
