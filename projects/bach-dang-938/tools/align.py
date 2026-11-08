# DP caption alignment: phrase boundaries prefer real pauses, speaking rate kept even.
# Not a forced aligner (Whisper unavailable); review by listening.
import json, math, sys
base = sys.argv[1]; DUR = float(sys.argv[2])
phrases = [l.strip() for l in open(f'{base}/captions-phrases.txt', encoding='utf8') if l.strip()]
sil = [tuple(map(float, l.split())) for l in open(f'{base}/audio/silences.txt')]
NUM = {'938': 6, '937': 6, '939': 6}
syl = [sum(NUM.get(w.strip('.,?:'), 1) for w in p.split()) for p in phrases]
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
G = len(grid); N = len(phrases); rate = sum(syl) / T
tot = [0]
for s in syl: tot.append(tot[-1] + s)
INF = 1e18
cost = [[INF] * G for _ in range(N + 1)]; back = [[-1] * G for _ in range(N + 1)]
cost[0][0] = 0
import bisect
for n in range(1, N + 1):
    exp = tot[n] / rate; ends_punct = phrases[n - 1][-1] in '.,?:'
    lo = bisect.bisect_left(grid, exp - 6); hi = bisect.bisect_right(grid, exp + 6)
    for j in range(lo, hi):
        if n == N and j != G - 1: continue
        pen = 0 if grid[j] in pause else (1.2 if ends_punct else 0.15)
        best, bi = INF, -1
        mn = grid[j] - syl[n - 1] / rate * 2.2; mx = grid[j] - syl[n - 1] / rate * 0.45
        a = bisect.bisect_left(grid, mn); b = bisect.bisect_right(grid, mx)
        for i in range(a, min(b, j)):
            if cost[n - 1][i] >= INF: continue
            d = grid[j] - grid[i]
            c = cost[n - 1][i] + 3 * math.log((syl[n - 1] / d) / rate) ** 2
            if c < best: best, bi = c, i
        if bi >= 0: cost[n][j] = best + pen; back[n][j] = bi
j = G - 1; bounds = [j]
for n in range(N, 0, -1): j = back[n][j]; bounds.append(j)
bounds.reverse()
out = []
for n in range(N):
    st = real(grid[bounds[n]], True); en = real(grid[bounds[n + 1]], False)
    out.append({'start': round(st, 2), 'end': round(en, 2), 'text': phrases[n], 'at_pause': grid[bounds[n + 1]] in pause})
json.dump(out, open(f'{base}/captions-audio.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for c in out: print(f"{c['start']:6.2f} {c['end']:6.2f} {'|' if c['at_pause'] else '~'} {c['text']}")
