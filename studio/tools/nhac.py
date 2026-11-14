#!/usr/bin/env python3
"""Nhạc nền tự tổng hợp bằng code (không bản quyền, miễn phí), kiểu ukulele/marimba gảy nhẹ cho video không lời.

python3 nhac.py OUT.wav SECONDS [--mood vui|tram|hoi-hop] [--bpm 100] [--seed 1]

- vui: trưởng, gảy nảy, hợp ngụ ngôn vui, kết có hậu
- tram: thứ, chậm, hợp suy ngẫm
- hoi-hop: thứ, nhịp nhanh, bass đều, hợp đoạn gấp gáp
Tự fade in/out. Khai báo trong scene: "music": {"path": "audio/music.wav", "gain": 0.5} (file đã ở mức vừa nghe).
"""
import sys, wave
import numpy as np

a = sys.argv[1:]
if len(a) < 2: print(__doc__); sys.exit(2)
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
out, secs = a[0], float(a[1])
mood, seed = opt('--mood', 'vui'), int(opt('--seed', 1))
bpm = float(opt('--bpm', {'vui': 104, 'tram': 76, 'hoi-hop': 128}.get(mood, 100)))
SR = 44100; rng = np.random.default_rng(seed)
N = int(SR * secs); mix = np.zeros(N)
beat = 60 / bpm

def pluck(f, dur, amp):  # Karplus-Strong plucked string
    n = int(SR * dur); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); outv = np.empty(n)
    for i in range(n):
        outv[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return outv * amp
def mallet(f, dur, amp):  # soft marimba-like tone
    t = np.arange(int(SR * dur)) / SR
    return amp * np.exp(-t * 6) * (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 20))
def add(sig, at):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig)); mix[i:j] += sig[:j - i]

midi = lambda m: 440 * 2 ** ((m - 69) / 12)
if mood == 'vui':   prog, scale = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], [72, 74, 76, 79, 81]
elif mood == 'tram': prog, scale = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], [69, 72, 74, 76, 79]
else:               prog, scale = [[57, 60, 64], [57, 60, 64], [53, 57, 60], [52, 56, 59]], [69, 71, 72, 76, 77]

t, bar = 0.0, 0
while t < secs:
    ch = prog[bar % len(prog)]
    add(mallet(midi(ch[0] - 12), beat * 3.5, 0.35), t)                      # bass on beat 1
    if mood == 'hoi-hop': add(mallet(midi(ch[0] - 12), beat, 0.25), t + 2 * beat)
    for k in range(8):                                                      # strummed eighths
        if mood == 'tram' and k % 2: continue
        n = ch[k % 3] + (12 if k in (3, 7) else 0)
        add(pluck(midi(n), beat * 1.2, 0.16 if k % 2 else 0.22), t + k * beat / 2)
    if bar % 2 == 1 or mood == 'vui':                                       # little melody
        for k in range(4):
            if rng.random() < 0.65: add(mallet(midi(int(rng.choice(scale))), beat * 1.5, 0.18), t + k * beat + (beat / 2 if rng.random() < 0.3 else 0))
    t += 4 * beat; bar += 1

fade = int(SR * 1.2); env = np.ones(N); env[:fade] = np.linspace(0, 1, fade); env[-fade:] = np.linspace(1, 0, fade)
mix *= env; mix /= max(1e-9, np.abs(mix).max()); mix *= 0.5
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print(f'{out}: {secs:.1f}s, {mood}, {bpm:.0f} bpm')
