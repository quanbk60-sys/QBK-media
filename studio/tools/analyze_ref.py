#!/usr/bin/env python3
"""Measure a reference video so agents can learn its style.
Usage: analyze_ref.py VIDEO OUT_DIR [--crop top,bottom]   (crop = fractions of height to cut, e.g. 0.08,0.12 for phone UI)
Writes OUT_DIR/analysis.json, contact.png (16 frames), frames/fNN.png (key frames at each detected cut).
Measures: duration, size, fps, cuts (scene changes) + average shot length, dominant palette (6 colours),
brightness, colourfulness, speech/silence ratio and loudness. It does not judge taste: the agent writes card.md."""
import json, os, re, subprocess, sys
from PIL import Image

args = sys.argv[1:]
video, out = args[0], args[1]
crop = [float(x) for x in args[args.index('--crop') + 1].split(',')] if '--crop' in args else [0, 0]
os.makedirs(f'{out}/frames', exist_ok=True)
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate', '-of', 'json', video]))
dur = float(probe['format']['duration'])
vs = next(s for s in probe['streams'] if s['codec_type'] == 'video')
W, H = vs['width'], vs['height']
has_audio = any(s['codec_type'] == 'audio' for s in probe['streams'])
cy, ch = int(H * crop[0]), int(H * (1 - crop[0] - crop[1]))
vf_crop = f'crop={W}:{ch}:0:{cy}'

# cuts
log = subprocess.run(['ffmpeg', '-v', 'info', '-i', video, '-vf', f"{vf_crop},select='gt(scene,0.28)',showinfo", '-f', 'null', '-'], capture_output=True, text=True).stderr
cuts = sorted(set(round(float(t), 2) for t in re.findall(r'pts_time:([0-9.]+)', log)))
shots = [0.0] + cuts + [dur]
lens = [b - a for a, b in zip(shots, shots[1:]) if b - a > 0.05]

# contact sheet + key frames
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-vf', f'{vf_crop},fps=16/{dur},scale=-1:360,tile=8x2', '-frames:v', '1', f'{out}/contact.png'])
for i, t in enumerate(([0.3] + [c + 0.15 for c in cuts])[:12]):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{min(t, dur - 0.05)}', '-i', video, '-frames:v', '1', '-vf', f'{vf_crop},scale=-1:640', f'{out}/frames/f{i:02d}.png'])

# palette, brightness, colourfulness from the contact sheet
img = Image.open(f'{out}/contact.png').convert('RGB'); small = img.resize((320, int(320 * img.height / img.width)))
q = small.quantize(colors=6, method=Image.Quantize.MEDIANCUT); pal = q.getpalette()[:18]; counts = sorted(q.getcolors(), reverse=True)
palette = [{'hex': '#%02X%02X%02X' % tuple(pal[i * 3:i * 3 + 3]), 'share': round(c / (small.width * small.height), 3)} for c, i in counts]
px = list(small.get_flattened_data() if hasattr(small, "get_flattened_data") else small.getdata())
lum = sum(0.2126 * r + 0.7152 * g + 0.0722 * b for r, g, b in px) / len(px) / 255
colorful = sum(max(p) - min(p) for p in px) / len(px) / 255

# audio
audio = None
if has_audio:
    a = subprocess.run(['ffmpeg', '-v', 'info', '-i', video, '-af', 'silencedetect=noise=-38dB:d=0.25,volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    sil = sum(float(x) for x in re.findall(r'silence_duration: ([0-9.]+)', a))
    mv = re.search(r'mean_volume: (-?[0-9.]+)', a); xv = re.search(r'max_volume: (-?[0-9.]+)', a)
    audio = {'sound_ratio': round(1 - sil / dur, 2), 'mean_db': float(mv.group(1)) if mv else None, 'max_db': float(xv.group(1)) if xv else None}

res = {'video': os.path.basename(video), 'duration_s': round(dur, 2), 'size': f'{W}x{H}', 'fps': vs['r_frame_rate'], 'crop': crop,
       'cuts': len(cuts), 'cut_times': cuts, 'avg_shot_s': round(sum(lens) / len(lens), 2) if lens else round(dur, 2),
       'palette': palette, 'brightness': round(lum, 2), 'colourfulness': round(colorful, 2), 'audio': audio,
       'files': {'contact': 'contact.png', 'frames': sorted(os.listdir(f'{out}/frames'))}}
json.dump(res, open(f'{out}/analysis.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: res[k] for k in ('duration_s', 'size', 'cuts', 'avg_shot_s', 'brightness', 'colourfulness', 'audio')}, ensure_ascii=False))
print('palette:', ' '.join(p['hex'] for p in palette))
