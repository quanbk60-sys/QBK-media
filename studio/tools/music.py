#!/usr/bin/env python3
"""Sáng tác nhạc nền bằng code (không bản quyền, miễn phí): nhạc nhẹ kiểu lo-fi / chill cho video nhà đẹp, du lịch, đời sống.

  python3 studio/tools/music.py OUT.wav --dur 40 [--bpm 78] [--key 0] [--mood chill|warm|bright] [--seed 1]

Gồm: pad hợp âm ấm, piano điện rải nốt, bass trầm, trống nhẹ (kick, snare chổi, hi-hat), tiếng đĩa than rất nhỏ.
Tự mở dần 2 s đầu và tắt dần 3 s cuối. Ra WAV stereo 44,1 kHz, đỉnh -1 dB.
"""
import argparse, math, wave
import numpy as np

SR = 44100
PROG = {  # bậc hợp âm (nửa cung so với chủ âm) — 4 ô nhịp lặp
    'chill': [[5, 9, 12, 16], [4, 7, 11, 14], [2, 5, 9, 12], [0, 4, 7, 11]],      # Fmaj7 Em7 Dm7 Cmaj7
    'warm': [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]],    # Cmaj7 Am7 Fmaj7 G7
    'bright': [[0, 4, 7, 14], [7, 11, 14, 21], [9, 12, 16, 19], [5, 9, 12, 19]],  # Cadd9 G Am7 Fmaj9
}


def hz(n): return 440 * 2 ** ((n - 69) / 12)


def lp(x, a):  # lọc thông thấp một cực
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
    return y


def env(n, a, d, s, r, sus_len):
    t = np.arange(n) / SR; e = np.zeros(n)
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    rel = t > sus_len; e[rel] *= np.exp(-(t[rel] - sus_len) / r)
    return e


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--dur', type=float, default=40)
    ap.add_argument('--bpm', type=float, default=78); ap.add_argument('--key', type=int, default=0); ap.add_argument('--mood', default='chill'); ap.add_argument('--seed', type=int, default=1)
    a = ap.parse_args(); rng = np.random.default_rng(a.seed)
    N = int((a.dur + 1) * SR); L = np.zeros(N); R = np.zeros(N)
    beat = 60 / a.bpm; bar = 4 * beat; prog = PROG.get(a.mood, PROG['chill']); root = 48 + a.key
    def add(sig, start, pan=0.0, gain=1.0):
        i = int(start * SR); j = min(N, i + len(sig))
        if i >= N: return
        s = sig[:j - i] * gain; L[i:j] += s * math.cos((pan + 1) * math.pi / 4); R[i:j] += s * math.sin((pan + 1) * math.pi / 4)
    nbars = int(a.dur / bar) + 2
    for b in range(nbars):
        ch = prog[b % 4]; t0 = b * bar
        # pad: 3 sóng răng cưa lệch nhẹ, lọc ấm
        n = int(bar * SR * 1.05); t = np.arange(n) / SR; pad = np.zeros(n)
        for k in ch:
            f = hz(root + 12 + k)
            for det in (-0.12, 0.0, 0.11):
                ph = 2 * np.pi * f * (1 + det / 100) * t; pad += (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.06
        pad = lp(pad, 0.035) * env(n, 0.6, 0.5, 0.85, 0.4, bar)
        add(pad, t0, pan=0, gain=0.55)
        # bass
        n = int(bar * SR); t = np.arange(n) / SR; f = hz(root - 12 + ch[0])
        bass = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(n, 0.02, 0.4, 0.6, 0.3, bar * 0.9)
        add(bass, t0, gain=0.32)
        # piano điện rải 8 nốt mỗi ô nhịp
        pat = [0, 2, 1, 3, 2, 1, 3, 2] if b % 2 == 0 else [0, 1, 2, 3, 2, 3, 1, 0]
        for s_i, idx in enumerate(pat):
            if rng.random() < 0.18: continue
            st = t0 + s_i * beat / 2 + rng.normal(0, 0.008); note = root + 24 + ch[idx % len(ch)]
            n = int(1.4 * SR); t = np.arange(n) / SR; f = hz(note)
            ep = (np.sin(2 * np.pi * f * t + 0.9 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6)) * np.exp(-t * 2.6))
            add(ep, st, pan=rng.uniform(-0.35, 0.35), gain=0.16 * rng.uniform(0.75, 1.0))
        # trống nhẹ
        for q in range(4):
            st = t0 + q * beat
            if q in (0, 2):
                n = int(0.35 * SR); t = np.arange(n) / SR; kick = np.sin(2 * np.pi * (50 + 70 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
                add(kick, st, gain=0.42)
            if q in (1, 3):
                n = int(0.3 * SR); t = np.arange(n) / SR; sn = lp(rng.normal(0, 1, n), 0.25) * np.exp(-t * 14)
                add(sn, st, gain=0.07)
            for h in (0, 0.5):
                n = int(0.08 * SR); t = np.arange(n) / SR; hh = np.diff(rng.normal(0, 1, n + 1)) * np.exp(-t * 60)
                add(hh, st + h * beat + (0.03 if h else 0), pan=0.25, gain=0.025 * (1.0 if h == 0 else 0.7))
    vin = lp(rng.normal(0, 1, N), 0.3) * 0.004; L += vin; R += vin
    T = np.arange(N) / SR; fade = np.clip(T / 2.0, 0, 1) * np.clip((a.dur - T) / 3.0, 0, 1)
    L *= fade; R *= fade; L, R = L[:int(a.dur * SR)], R[:int(a.dur * SR)]
    pk = max(np.abs(L).max(), np.abs(R).max(), 1e-9); g = 10 ** (-1 / 20) / pk
    data = (np.stack([L, R], 1) * g * 32767).astype(np.int16)
    with wave.open(a.out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print({'out': a.out, 'dur': a.dur, 'bpm': a.bpm, 'mood': a.mood})


if __name__ == '__main__':
    main()
