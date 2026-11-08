#!/usr/bin/env python3
"""Caption timing without a forced aligner: phrase boundaries snap to real pauses (DP), speaking rate kept even.
Usage: align.py PROJECT_DIR   (reads captions-phrases.txt + audio/narration.wav, writes captions-audio.json)
One phrase per line, max ~32 characters; split at natural pauses. Numbers like 938 count as spoken syllables."""
import bisect, json, math, re, subprocess, sys
base = sys.argv[1]
wav = f'{base}/audio/narration.wav'
DUR = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav]).decode())
log = subprocess.run(['ffmpeg', '-v', 'info', '-i', wav, '-af', 'silencedetect=noise=-38dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', log)]; en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', log)]
sil = list(zip(st, en))
phrases = [l.strip() for l in open(f'{base}/captions-phrases.txt', encoding='utf8') if l.strip()]
DIG = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
def num_syl(w):
    d = re.sub(r'\D', '', w)
    return max(1, len(d) * 2 - 1) if d else 1
syl = [sum(num_syl(w) if re.search(r'\d', w) else 1 for w in p.split()) for p in phrases]
speech, t = [], 0.0
for s, e in sil:
    if s > t + 1e-3: speech.append((t, s))
    t = max(t, e)
if t < DUR: speech.append((t, DUR))
cum = [0.0]
for s, e in speech: cum.append(cum[-1] + e - s)
T = cum[-1]
def real(pos, as_start):
    for i, (s, e) in enumerate(speech):
        if pos < cum[i + 1] - 1e-6 or i == len(speech) - 1:
            if as_start and abs(pos - cum[i + 1]) < 1e-6 and i + 1 < len(speech): return speech[i + 1][0]
            return s + (pos - cum[i])
    return DUR
STEP = 0.05
grid = sorted(set([round(k * STEP, 3) for k in range(int(T / STEP) + 1)] + [round(c, 3) for c in cum]))
pause = set(round(c, 3) for c in cum)
G, N, rate = len(grid), len(phrases), sum(syl) / T
tot = [0]
for s in syl: tot.append(tot[-1] + s)
INF = 1e18
cost = [[INF] * G for _ in range(N + 1)]; back = [[-1] * G for _ in range(N + 1)]; cost[0][0] = 0
for n in range(1, N + 1):
    exp = tot[n] / rate; punct = phrases[n - 1][-1] in '.,?:!;'
    for j in range(bisect.bisect_left(grid, exp - 6), bisect.bisect_right(grid, exp + 6)):
        if n == N and j != G - 1: continue
        pen = 0 if grid[j] in pause else (1.2 if punct else 0.15)
        best, bi = INF, -1
        for i in range(bisect.bisect_left(grid, grid[j] - syl[n - 1] / rate * 2.2), min(bisect.bisect_right(grid, grid[j] - syl[n - 1] / rate * 0.45), j)):
            if cost[n - 1][i] >= INF: continue
            c = cost[n - 1][i] + 3 * math.log((syl[n - 1] / (grid[j] - grid[i])) / rate) ** 2
            if c < best: best, bi = c, i
        if bi >= 0: cost[n][j] = best + pen; back[n][j] = bi
j = G - 1; bounds = [j]
for n in range(N, 0, -1): j = back[n][j]; bounds.append(j)
bounds.reverse()
out = [{'start': round(real(grid[bounds[n]], True), 2), 'end': round(real(grid[bounds[n + 1]], False), 2), 'text': phrases[n]} for n in range(N)]
json.dump(out, open(f'{base}/captions-audio.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(json.dumps({'duration': DUR, 'phrases': N, 'pauses': len(sil)}))
