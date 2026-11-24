#!/usr/bin/env python3
"""Nhạc nền tự tổng hợp (không bản quyền): 118 BPM, trống kick sine, bass, hợp âm pluck, giai điệu marimba. Không dùng tiếng ồn (tránh tiếng xẹt).
Chạy: python3 make_music.py 48 → audio/music.wav"""
import sys, wave, numpy as np
SR = 44100; DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 48; BPM = 118; B = 60 / BPM
N = int(SR * DUR); out = np.zeros(N)
def add(t0, sig):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N: out[i:j] += sig[:j - i]
def tone(f, d, dec, harm=(1,), amp=1.0):
    t = np.arange(int(d * SR)) / SR; s = sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harm))
    env = np.exp(-t * dec) * np.minimum(1, t / 0.004); return amp * s * env
def kick():
    t = np.arange(int(0.35 * SR)) / SR; f = 50 + 90 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9
def tick():  # thay hi-hat bằng tiếng gõ gỗ (sine cao, ngắn), không có tiếng ồn
    return tone(2600, 0.05, 90, (1, 0.3), 0.12)
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
prog = [(60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)]   # C G Am F
bassn = [36, 31, 33, 29]
mel = [72, 74, 76, 79, 76, 74, 72, 74, 76, 74, 72, 69, 67, 69, 72, 74]
bar = 4 * B; nb = int(DUR / bar) + 1
for b in range(nb):
    t0 = b * bar; ch = prog[b % 4]
    for k in range(4):
        add(t0 + k * B, kick() * (0.9 if k % 2 == 0 else 0.6))
        add(t0 + k * B + B / 2, tick())
        add(t0 + k * B + B / 2, tone(nt(bassn[b % 4]), B * 0.45, 7, (1, 0.5, 0.2), 0.35))
    for k in (0, 1.5, 2.5, 3.5):
        for m in ch: add(t0 + k * B, tone(nt(m), 0.5, 7, (1, 0.35, 0.12), 0.07))
    if b >= 2:
        for k in range(8):
            m = mel[(b * 8 + k) % 16]
            if (b + k) % 3 != 2: add(t0 + k * B / 2, tone(nt(m), 0.3, 13, (1, 0.0, 0.25, 0.0, 0.08), 0.09))
fade = np.minimum(1, np.arange(N) / (SR * 0.8)) * np.minimum(1, (N - np.arange(N)) / (SR * 2.0))
out *= fade; out /= np.abs(out).max() / 0.6
with wave.open('audio/music.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('audio/music.wav', DUR)
