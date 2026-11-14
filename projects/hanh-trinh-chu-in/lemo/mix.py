"""Hành trình của chữ in · âm thanh: giọng đọc + sfx tổng hợp theo sự kiện EV của từng chương + nền nhạc riêng mỗi phong cách.
Chạy bằng Python của Lemo-Opuscar:  $LIB/.venv/bin/python mix.py   (cần LIB trỏ tới thư viện để import core/audio/sfx.py)"""
import json, os, sys
import numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB', os.path.expanduser('~/lemo-opuscar'))
sys.path.insert(0, f'{LIB}/core/audio')
from sfx import SR, t_, env_exp, bp, lp, hp, noise, norm, thump, whoosh, clack, click, ding, pop, add, compress, limit

HERE = os.path.dirname(os.path.abspath(__file__))
CH = {'a': (0, 9.87), 'b': (9.87, 25.17), 'c': (25.17, 33.2), 'd': (33.2, 43.6)}
DUR = 43.6
N = int(DUR * SR)
fx, mus = np.zeros((N, 2)), np.zeros((N, 2))
rng = np.random.default_rng(7)

def ks(f, d=2.5, bright=.5, v=1.0):        # dây gảy Karplus–Strong (đàn tranh/cổ cầm, harpsichord)
    n, p = int(d * SR), max(2, int(SR / f)); buf = rng.uniform(-1, 1, p) * v; out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * (.996 if bright < .6 else .998)
    return lp(out, 2500 + 6000 * bright) * env_exp(d, d * .5)
def tone(f, d, v=1.0, harm=(1, .5, .25)):
    tt = t_(d); return v * sum(a * np.sin(2 * np.pi * f * (k + 1) * tt) for k, a in enumerate(harm))
def fade(x, a=.05, b=.3):
    n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR)
    e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return x * e
def brush(d=.4, v=.5):   return v * fade(bp(noise(d), 1200, 5000) * np.hanning(int(round(d * SR))), .01, .05)
def carve(d=.2, v=.5):   x = bp(noise(d), 1500, 7000) * (1 + .8 * np.sign(np.sin(2 * np.pi * 38 * t_(d)))); return v * fade(x * np.hanning(len(x)), .005, .03)
def burin(d=.3, v=.3):   x = bp(noise(d), 4000, 11000) * (1 + .5 * np.sin(2 * np.pi * 60 * t_(d))); return v * fade(x, .01, .05)
def key(v=.5):           return v * (bp(noise(.03), 2000, 6000) * env_exp(.03, .006) + .5 * tone(180, .03, 1, (1,)) * env_exp(.03, .01))

def events(ch):
    p = f'{HERE}/out/ev-{ch}.json'
    return json.load(open(p))['ev'] if os.path.exists(p) else []

# Tiếng làm từ nhiễu trắng (bút lông, dao khắc, burin, lăn mực, giấy, gõ phím) nghe sẹt sẹt: tắt hết theo góp ý người dùng 14/11/2026
NOISY = {'brush', 'wash', 'carve', 'brayer', 'paper', 'peel', 'burin', 'tick', 'type', 'scan'}
for ch, (t0, t1) in CH.items():
    for e in events(ch):
        at, ty, d = t0 + e['t'], e['type'], e.get('dur', 1.0)
        if ty in NOISY: continue   # người dùng: bỏ hết tiếng sẹt sẹt (tiếng nhiễu)
        if ty == 'brush':
            n = e.get('n', 4)
            for k in range(n): add(fx, brush(.3 + .2 * rng.random(), .35), at + k * d / n, 1, rng.uniform(-.3, .3))
        elif ty == 'seal':  add(fx, thump(.6, 90) * .5, at, 1)
        elif ty == 'drop':  add(fx, tone(1900, .25, .25, (1, .3)) * env_exp(.25, .05), at, 1); add(fx, thump(.4, 70) * .5, at + .03, 1)
        elif ty == 'wash':  add(fx, fade(lp(noise(1.6), 900) * .12, .6, .8), at, 1)
        elif ty == 'carve':
            k = at
            while k < at + d: add(fx, carve(.12 + .15 * rng.random(), .32), k, 1, rng.uniform(-.4, .4)); k += .14 + .12 * rng.random()
        elif ty == 'brayer': add(fx, fade(lp(noise(.5), 600) * .35 * (1 + .3 * np.sin(2 * np.pi * 9 * t_(.5))), .05, .1), at, 1)
        elif ty == 'paper':  add(fx, whoosh(.3, .4), at, 1)
        elif ty == 'peel':   add(fx, fade(bp(noise(.8), 1500, 6000) * (rng.random(int(.8 * SR)) > .97) * .9 + lp(noise(.8), 500) * .1, .05, .2), at, 1)
        elif ty == 'impress': add(fx, thump(.8, 60) * .6, at, 1)
        elif ty == 'stamp':  add(fx, thump(1, 80) * .7, at, 1); add(fx, clack(.8, .5), at + .01, 1)
        elif ty == 'burin':
            k = at
            while k < at + d: add(fx, burin(.18 + .2 * rng.random(), .14), k, 1, rng.uniform(-.3, .3)); k += .22 + .1 * rng.random()
        elif ty == 'scribe': add(fx, tone(3100, .6, .12, (1, .2)) * env_exp(.6, .15), at, 1, .3)
        elif ty == 'clack':
            n = e.get('n', 6)
            for k in range(n): add(fx, tone(2400 + 200 * rng.random(), .08, .2, (1, .4)) * env_exp(.08, .015), at + k * d / n, 1, -.4 + .8 * k / n)
        elif ty == 'press':  add(fx, thump(1, 55) * .7, at, 1)
        elif ty == 'tick':
            for k in range(6): add(fx, key(.25), at + k * d / 6, 1)
        elif ty == 'poweron': add(fx, thump(.7, 60) * .6, at, 1); add(fx, fade(tone(60, 1.2, .08, (1, .5, .3, .2)), .02, .6), at, 1)
        elif ty == 'type':
            k = at
            while k < at + d: add(fx, key(.35), k, 1, rng.uniform(-.2, .2)); k += .045 + .04 * rng.random()
        elif ty == 'clear':  add(fx, click(1.4, .5), at, 1)
        elif ty == 'zoom':   tt = t_(d); add(fx, fade(.06 * np.sin(2 * np.pi * np.cumsum(120 + 500 * (tt / d) ** 2) / SR), .2, .4), at, 1)
        elif ty == 'scan':
            for k in range(14): add(fx, key(.15), at + k * d / 14, 1)
        elif ty == 'bel':    tt = t_(.25); add(fx, .08 * np.sign(np.sin(2 * np.pi * 880 * tt)) * env_exp(.25, .08), at, 1)

# nền nhạc: mỗi chương một bảng nhạc cụ, cắt theo hình, không lặp
def put(x, at, g=1, pan=0): add(mus, x, at, g, pan)
# A · thủy mặc: dây gảy ngũ cung, thưa
for at, f in [(0.2, 220), (1.4, 247.5), (2.6, 330), (3.9, 293.3), (5.3, 220), (6.8, 196), (8.3, 165)]: put(ks(f, 3, .4, .6), at, .5, rng.uniform(-.3, .3))
# B · khắc gỗ: drone dây trầm + trống gỗ ở mỗi tấm in mới
put(fade(tone(55, 15.3, .18, (1, .6, .35, .2)), 1, 2), CH['b'][0], 1)
for at in [0, 4.0, 8.15, 11.3]: put(thump(.6, 110) * .3, CH['b'][0] + at, 1, -.2)
# C · khắc đồng: harpsichord gảy khô
for i, f in enumerate([392, 440, 494, 523.3, 494, 440, 392, 349.2, 392, 440, 523.3, 587.3]): put(ks(f, 1.2, .9, .4), CH['c'][0] + .2 + i * .62, .35, .3 if i % 2 else -.3)
# D · CRT: pad saw lọc chậm, mở hợp âm ở lời mời
tt = t_(10.4); saw = sum(np.sin(2 * np.pi * f * k * tt) / k for f in (110, 164.8) for k in range(1, 8))
put(fade(lp(saw, 900) * .08, 1, 2), CH['d'][0], 1)
put(fade(sum(np.sin(2 * np.pi * f * t_(3.2)) for f in (220, 277.2, 329.6)) * .05, .3, 1.5), CH['d'][0] + 7.4, 1)

# giọng: nén, đặt cao hơn nền ~10 dB; nhạc nhún xuống khi có giọng
v, sr = sf.read(f'{HERE}/../audio/narration.wav')
if v.ndim > 1: v = v.mean(1)
v = soxr.resample(v, sr, SR); v = compress(norm(v, .9), .25, 3.5)
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
envv = np.convolve(np.abs(voice), np.ones(int(.2 * SR)) / int(.2 * SR), 'same'); duck = 1 - .55 * np.clip(envv / (envv.max() * .25 + 1e-9), 0, 1)
mixd = voice[:, None] * .9 + mus * duck[:, None] * .55 + fx * duck[:, None] * .8
mixd = np.stack([limit(mixd[:, 0]), limit(mixd[:, 1])], 1)
sf.write(f'{HERE}/out/mix.wav', mixd, SR)
print('mix.wav', mixd.shape[0] / SR, 's, peak', float(np.abs(mixd).max()))
