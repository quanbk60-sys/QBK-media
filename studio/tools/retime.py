#!/usr/bin/env python3
"""Speed narration up/down and retime a project to match.
Usage: retime.py PROJECT_DIR FACTOR   (e.g. 1.2 = 20% faster)
- keeps the original voice as audio/narration-orig.wav (first run only), writes audio/narration.wav via ffmpeg atempo (pitch kept)
- re-aligns captions (align.py), scales every time value in scene.json by 1/FACTOR and fits the last shot to the new length."""
import json, os, shutil, subprocess, sys
base, f = sys.argv[1], float(sys.argv[2])
here = os.path.dirname(os.path.abspath(__file__))
orig, nar = f'{base}/audio/narration-orig.wav', f'{base}/audio/narration.wav'
if not os.path.exists(orig): shutil.copy(nar, orig)
prev = json.load(open(f'{base}/checkpoint.json')).get('tts', {}).get('tempo', 1.0) if os.path.exists(f'{base}/checkpoint.json') else 1.0
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', orig, '-filter:a', f'atempo={f}', nar], check=True)
subprocess.run([sys.executable, f'{here}/align.py', base], check=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', nar]))
k = prev / f   # scene was timed for `prev`
TIME_KEYS = {'start', 'end', 't', 'from', 'to', 'at', 'dur', 'enterDur', 'blend'}
def scale(o, parent=None):
    if isinstance(o, dict):
        for key, v in o.items():
            if key in TIME_KEYS and isinstance(v, (int, float)) and parent != 'params': o[key] = round(v * k, 3)
            elif key == 'blinks' and isinstance(v, list): o[key] = [round(x * k, 3) for x in v]
            else: scale(v, key)
    elif isinstance(o, list):
        for v in o: scale(v, parent)
sp = f'{base}/scene.json'
if os.path.exists(sp):
    s = json.load(open(sp, encoding='utf8')); scale(s['shots'])
    lead = s.get('narration', {}).get('lead', 0)
    for i in range(1, len(s['shots'])): s['shots'][i]['start'] = s['shots'][i - 1]['end']
    s['shots'][0]['start'] = 0; s['shots'][-1]['end'] = round(dur + lead + 0.4, 3)
    json.dump(s, open(sp, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
cp = f'{base}/checkpoint.json'
if os.path.exists(cp):
    c = json.load(open(cp)); c.setdefault('tts', {}).update(tempo=f, duration_s=round(dur, 2), tempo_note='ffmpeg atempo on narration-orig.wav (pitch preserved)'); json.dump(c, open(cp, 'w'), ensure_ascii=False, indent=1)
print(json.dumps({'tempo': f, 'duration_s': round(dur, 2), 'scene_scaled_by': round(k, 4)}))
