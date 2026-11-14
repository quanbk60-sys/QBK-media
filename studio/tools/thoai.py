#!/usr/bin/env python3
"""Thu thoại nhiều giọng (mỗi nhân vật một giọng Gemini TTS) rồi ghép thành một file.

python3 thoai.py dialogue.txt voices.json OUTDIR [--gap 0.22] [--tempo 1.15] [--model gemini-3.8-flash-tts]

dialogue.txt: mỗi dòng "Tên: lời thoại". Dòng trống hoặc bắt đầu bằng # bị bỏ qua.
voices.json:  {"Zeus": {"voice": "Charon", "style": "old, grumpy, bossy"}, "Hermes": {"voice": "Puck", "tempo": 1.25}, ...}
              "style" (tiếng Anh, vài tính từ, không bắt buộc) thành thẻ "[style]" đặt trước câu: điều khiển giọng, không bị đọc.
              "tempo" riêng từng nhân vật (mặc định theo --tempo).

Kết quả trong OUTDIR:
- narration.wav          toàn bộ thoại, các câu cách nhau --gap giây
- captions-audio.json    [{start, end, text, speaker}] theo thời gian file ghép
- talk.json              {"Zeus": [[start, end], ...]}: lúc nhân vật đang nói (dùng cho "talk" của ảnh)
- lines/NN-Ten.wav       từng câu (đã cắt lặng hai đầu, đổi tốc độ)
Key do proxy gắn như tts.py. Câu đã thu (file còn đó) thì không thu lại; xóa file để thu lại câu đó.
"""
import json, os, re, subprocess, sys, wave

args = sys.argv[1:]
if len(args) < 3: print(__doc__); sys.exit(2)
def opt(k, d): return args[args.index(k) + 1] if k in args else d
dlg, vfile, out = args[0], args[1], args[2]
gap, tempo, model = float(opt('--gap', 0.22)), float(opt('--tempo', 1.15)), opt('--model', 'gemini-3.8-flash-tts')
voices = json.load(open(vfile, encoding='utf8'))
here = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(out, 'lines'), exist_ok=True)

lines = []
for raw in open(dlg, encoding='utf8'):
    raw = raw.strip()
    if not raw or raw.startswith('#'): continue
    m = re.match(r'^([^:]{1,40}):\s*(.+)$', raw)
    if not m: sys.exit(f'Dòng thiếu "Tên: lời": {raw}')
    who, text = m.group(1).strip(), m.group(2).strip()
    if who not in voices: sys.exit(f'Chưa có giọng cho "{who}" trong {vfile}')
    lines.append((who, text))

slug = lambda s: re.sub(r'[^A-Za-z0-9]+', '', s) or 'x'
rate, parts, caps, talk, t = None, [], [], {}, 0.0
for i, (who, text) in enumerate(lines):
    v = voices[who]; base = os.path.join(out, 'lines', f'{i:02d}-{slug(who)}')
    if not os.path.exists(base + '.wav'):
        open(base + '.txt', 'w', encoding='utf8').write(text)
        cmd = [sys.executable, os.path.join(here, 'tts.py'), base + '.txt', base + '.raw.wav', '--model', model, '--voice', v.get('voice', 'Bodi')]
        if v.get('style'): cmd += ['--style', v['style']]
        subprocess.run(cmd, check=True)
        # cut leading/trailing silence, change speed, 24 kHz mono
        af = f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo={v.get("tempo", tempo)}'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base + '.raw.wav', '-af', af, '-ar', '24000', '-ac', '1', base + '.wav'], check=True)
        os.remove(base + '.raw.wav')
    with wave.open(base + '.wav') as w:
        rate = rate or w.getframerate(); d = w.getnframes() / w.getframerate(); parts.append(w.readframes(w.getnframes()))
    caps.append({'start': round(t, 3), 'end': round(t + d, 3), 'text': text, 'speaker': who})
    talk.setdefault(who, []).append([round(t, 3), round(t + d, 3)])
    t += d + gap

silence = b'\x00\x00' * int(rate * gap)
with wave.open(os.path.join(out, 'narration.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(silence.join(parts))
json.dump(caps, open(os.path.join(out, 'captions-audio.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
json.dump(talk, open(os.path.join(out, 'talk.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(json.dumps({'lines': len(lines), 'seconds': round(t - gap, 2), 'speakers': list(talk)}, ensure_ascii=False))
