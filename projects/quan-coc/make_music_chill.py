#!/usr/bin/env python3
"""Nhạc nền lo-fi chill tự tổng hợp (không bản quyền, không dùng tiếng ồn): 76 BPM, kick mềm, piano điện (sine + tremolo),
hợp âm Fmaj7 – Em7 – Dm7 – Cmaj7, bass trầm, giai điệu thưa. Chạy: python3 make_music_chill.py GIÂY → audio/music.wav"""
import sys, wave, numpy as np
SR = 44100; DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 50; B = 60 / 76
N = int(SR * DUR); out = np.zeros(N)
def add(t0, sig):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N: out[i:j] += sig[:j - i]
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def keys(f, d, amp):  # piano điện: sine + bội âm nhẹ, tremolo, tắt dần, đầu mềm
    t = np.arange(int(d * SR)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t + 0.4) + 0.05 * np.sin(2 * np.pi * 3 * f * t)
    return amp * s * np.exp(-t * 1.6) * np.minimum(1, t / 0.012) * (0.85 + 0.15 * np.sin(2 * np.pi * 4.2 * t))
def kick():
    t = np.arange(int(0.4 * SR)) / SR; f = 45 + 55 * np.exp(-t * 25); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) * 0.55
def rim():
    t = np.arange(int(0.06 * SR)) / SR; return (np.sin(2 * np.pi * 1700 * t) * 0.5 + np.sin(2 * np.pi * 820 * t) * 0.5) * np.exp(-t * 70) * 0.07
def bass(f, d):
    t = np.arange(int(d * SR)) / SR; return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 1.2) * np.minimum(1, t / 0.02) * 0.28
prog = [(53, 57, 60, 64), (52, 55, 59, 62), (50, 53, 57, 60), (48, 52, 55, 59)]
roots = [41, 40, 38, 36]
mel = [76, None, 74, 72, None, 69, 72, None, 74, None, 76, 79, None, 76, 74, None]
bar = 4 * B; sw = B * 0.08
for b in range(int(DUR / bar) + 1):
    t0 = b * bar; ch = prog[b % 4]
    for k in range(4):
        if k in (0, 2): add(t0 + k * B, kick() * (1 if k == 0 else 0.7))
        else: add(t0 + k * B + sw, rim())
    for i, m in enumerate(ch): add(t0 + i * 0.025, keys(nt(m), bar * 1.1, 0.075))
    add(t0 + 2.5 * B + sw, sum(keys(nt(m + 12), 1.2, 0.025) for m in ch[1:3]) if False else keys(nt(ch[2] + 12), 1.0, 0.03))
    add(t0, bass(nt(roots[b % 4]), bar * 0.9)); add(t0 + 2.5 * B, bass(nt(roots[b % 4] + 7), B * 1.2) * 0.6)
    if b >= 1:
        for k in range(8):
            m = mel[(b * 8 + k) % 16]
            if m and (b + k) % 2 == 0: add(t0 + k * B / 2 + (sw if k % 2 else 0), keys(nt(m), 0.9, 0.04))
fade = np.minimum(1, np.arange(N) / (SR * 1.5)) * np.minimum(1, (N - np.arange(N)) / (SR * 2.5))
out *= fade; out /= np.abs(out).max() / 0.6
with wave.open('audio/music.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('audio/music.wav', DUR)
