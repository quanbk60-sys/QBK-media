#!/usr/bin/env python3
"""Dựng video phong cách "Storyboard" từ storyboard.json: mỗi cảnh một ảnh người dùng gửi + một đoạn lời.
Lồng tiếng TỪNG CẢNH (tts.py), nên độ dài mỗi cảnh = đúng độ dài lời của cảnh đó: hình đổi đúng lúc lời đổi.

  python3 studio/tools/storyboard_build.py projects/<slug> [--no-tts]   (--no-tts: dùng lại audio/sNN.wav đã có)

projects/<slug>/storyboard.json:
{"reveal": "ve-tay", "voice": "Bodi", "tempo": 1.15, "aspect": "9:16", "fit": "pad", "music": "chill", "musicGain": 0.16,
 "scenes": [{"image": "board/01.png", "text": "An đứng lặng trước gương…", "move": "push"}, ...]}
- reveal: "ve-tay" (mỗi cảnh hiện dần như đang vẽ tay, drawon.py) hoặc "hien-thang" (ảnh hiện đủ ngay, mờ dần từ cảnh trước).
- move: push | pull | panL | panR | none (theo ghi chú máy quay trên storyboard; bỏ trống thì xen kẽ push/pull).
- text rỗng: cảnh không lời, dài "dur" giây (mặc định 3).
- music: chill | warm | bright | none (nhạc tự sáng tác bằng music.py), hoặc đường dẫn file nhạc có giấy phép.
Ra: audio/sNN.wav, audio/narration.wav, captions-audio.json, cut.json, output/final.mp4.
"""
import json, os, re, subprocess, sys, wave
import numpy as np

TOOLS = os.path.dirname(os.path.abspath(__file__))
proj = os.path.abspath(sys.argv[1]); args = sys.argv[2:]
cfg = os.path.join(proj, 'storyboard.json')
V = json.load(open(cfg if os.path.exists(cfg) else os.path.join(proj, 'vetay.json'), encoding='utf8'))
DRAW = 0.55 if V.get('reveal', 've-tay') == 've-tay' else 0.0
P = lambda f: f if os.path.isabs(f) else os.path.join(proj, f)
os.makedirs(P('audio'), exist_ok=True); os.makedirs(P('output'), exist_ok=True)
SR, XF, LEAD, TAIL = 24000, 0.4, 0.35, 0.45   # chuyển cảnh mờ 0,4 s; lời bắt đầu sau khi hình hiện 0,35 s; nghỉ 0,45 s cuối cảnh


def read_wav(f):
    with wave.open(f) as w:
        sr, ch, sw = w.getframerate(), w.getnchannels(), w.getsampwidth(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
    if ch > 1: x = x.reshape(-1, ch).mean(1)
    if sr != SR: x = np.interp(np.arange(0, len(x), sr / SR), np.arange(len(x)), x)
    return x


def phrases(text, n_max=8):
    """Tách lời thành cụm phụ đề ngắn (≤ n_max từ), ưu tiên ngắt ở dấu câu."""
    out = []
    for part in re.split(r'(?<=[,.;:!?…])\s+', text.strip()):
        w = part.split()
        while len(w) > n_max:
            k = len(w) // 2 if len(w) <= n_max * 2 else n_max
            out.append(' '.join(w[:k])); w = w[k:]
        if w: out.append(' '.join(w))
    return out


scenes, tempo = V['scenes'], V.get('tempo', 1.15)
clips, voice_tracks, caps, start = [], [], [], 0.0
for i, s in enumerate(scenes, 1):
    wav = P(f'audio/s{i:02d}.wav'); text = (s.get('text') or '').strip()
    if text and not (os.path.exists(wav) and '--no-tts' in args):
        if True:
            tf = P(f'audio/s{i:02d}.txt'); open(tf, 'w', encoding='utf8').write(text)
            raw = P(f'audio/s{i:02d}.raw.wav')
            subprocess.run([sys.executable, os.path.join(TOOLS, 'tts.py'), tf, raw, '--voice', V.get('voice', 'Bodi')], check=True, stdout=subprocess.DEVNULL)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={tempo}',
                            '-ar', str(SR), '-ac', '1', wav], check=True)
    a = read_wav(wav) if text else np.zeros(0, np.float32)
    say = len(a) / SR
    dur = round((LEAD + say + TAIL) if text else float(s.get('dur', 3)), 2)
    if i == 1: dur += 0.3
    if i == len(scenes): dur += 0.8
    mv = s.get('move') or ('push' if i % 2 else 'pull')
    clips.append({'file': s['image'], 'dur': dur, 'move': mv, 'draw': True, 'drawPart': DRAW})
    t0 = start + LEAD + (0.3 if i == 1 else 0)
    voice_tracks.append((t0, a))
    ph = phrases(text) if text else []
    tot = sum(len(x) for x in ph) or 1; t = t0
    for x in ph:
        d = say * len(x) / tot; caps.append({'start': round(t, 2), 'end': round(t + d, 2), 'text': x}); t += d
    print(f'Cảnh {i}: {dur:.2f} s ({say:.2f} s lời) {mv}  {s["image"]}')
    start += dur - XF
total = start + XF
track = np.zeros(int((total + 1) * SR), np.float32)
for t0, a in voice_tracks:
    k = int(t0 * SR); track[k:k + len(a)] += a[:len(track) - k]
with wave.open(P('audio/narration.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.clip(track, -32767, 32767).astype(np.int16).tobytes())
json.dump(caps, open(P('captions-audio.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
cut = {'clips': clips, 'xfade': XF, 'aspect': V.get('aspect', '9:16'), 'fit': V.get('fit', 'pad'), 'narration': 'audio/narration.wav', 'narrationLead': 0,
       'captions': 'captions-audio.json', 'grade': {'saturation': 1.0, 'contrast': 1.02, 'gamma': 1.0}}
mus = V.get('music', 'chill')
if mus and mus != 'none':
    if mus in ('chill', 'warm', 'bright'):
        subprocess.run([sys.executable, os.path.join(TOOLS, 'music.py'), P('audio/music.wav'), '--dur', str(int(total) + 2), '--mood', mus], check=True, stdout=subprocess.DEVNULL)
        cut['music'] = 'audio/music.wav'
    else:
        cut['music'] = mus
    cut['musicGain'] = V.get('musicGain', 0.16)
json.dump(cut, open(P('cut.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
out = P('output/final.mp4')
subprocess.run([sys.executable, os.path.join(TOOLS, 'assemble.py'), P('cut.json'), out], check=True)
print(json.dumps({'output': out, 'seconds': round(total, 2), 'scenes': len(scenes)}))
