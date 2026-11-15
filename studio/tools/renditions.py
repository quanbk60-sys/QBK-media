#!/usr/bin/env python3
"""Tạo các bản tải về theo mức chất lượng cho app (mục "Tải về máy").

renditions.py final.mp4 OUTDIR [--max-mb 14.5]
-> OUTDIR/<tên>-1080.mp4 (Cao, giữ 1080p, nén vừa dưới giới hạn tải lên app), -720.mp4 (Vừa), -480.mp4 (Nhẹ)
In JSON: [{"label", "res", "mb", "file"}] để tải lên app (Artifact asset:true) rồi ghi videos/<slug>.downloads =
[{"label": "Cao", "res": "1080p", "mb": 12.1, "asset": "<id>"}, ...]
"""
import json, os, subprocess, sys
src, outdir = sys.argv[1], sys.argv[2]; maxmb = float(sys.argv[sys.argv.index('--max-mb') + 1]) if '--max-mb' in sys.argv else 14.5
os.makedirs(outdir, exist_ok=True); name = os.path.splitext(os.path.basename(src))[0]
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
h = int(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=height', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout)
out = []
for label, res, crf in [('Cao', 1080, 23), ('Vừa', 720, 25), ('Nhẹ', 480, 27)]:
    if res > h: continue
    f = os.path.join(outdir, f'{name}-{res}.mp4')
    for c in range(crf, 40, 2):  # tăng nén tới khi vừa giới hạn tải lên app
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f'scale=-2:{res}', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(c),
                        '-maxrate', f'{int(maxmb * 8 * 0.92 / dur * 1000)}k', '-bufsize', f'{int(maxmb * 16 / dur * 1000)}k', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', f], check=True)
        if os.path.getsize(f) / 1e6 <= maxmb: break
    out.append({"label": label, "res": f"{res}p", "mb": round(os.path.getsize(f) / 1e6, 1), "file": f})
print(json.dumps(out, ensure_ascii=False))
