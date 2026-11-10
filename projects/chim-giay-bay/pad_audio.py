#!/usr/bin/env python3
"""Chèn khoảng lặng sau mỗi bước gấp để kịp xem nếp gấp. Đọc audio/narration-1.2x.wav + captions (bản chưa chèn),
ghi audio/narration.wav và captions-audio.json đã dời thời gian. Chạy lại align.py thì phải chạy lại file này."""
import json, wave, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
GAPS = {4.23: 0.3, 6.94: 1.1, 9.61: 1.3, 13.71: 1.2, 16.16: 0.8, 18.73: 0.3, 21.11: 1.4, 23.92: 1.2}
caps = json.load(open('captions-unpadded.json'))
w = wave.open('audio/narration-1.2x.wav'); sr, n, ch, sw = w.getframerate(), w.getnframes(), w.getnchannels(), w.getsampwidth(); raw = w.readframes(n)
out, last = b'', 0
for t in sorted(GAPS):
    i = int(t * sr); out += raw[last * ch * sw:i * ch * sw] + b'\0' * int(GAPS[t] * sr) * ch * sw; last = i
out += raw[last * ch * sw:]
o = wave.open('audio/narration.wav', 'wb'); o.setnchannels(ch); o.setsampwidth(sw); o.setframerate(sr); o.writeframes(out); o.close()
sh = lambda x: x + sum(g for t, g in GAPS.items() if t <= x + 1e-6)
for c in caps:
    c['start'] = round(sh(c['start']), 3); c['end'] = round(sh(c['end'] - 1e-3), 3)
json.dump(caps, open('captions-audio.json', 'w'), ensure_ascii=False, indent=1)
print(len(out) / sr / ch / sw)
