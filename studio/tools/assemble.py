#!/usr/bin/env python3
"""Ghép phim (dựng phim, hậu kỳ): nối các clip theo danh sách cắt, chuyển cảnh mờ chồng, chỉnh màu đồng đều,
gắn phụ đề, trộn lời đọc + nhạc/tiếng động. Dùng cho Anime · hoạt hình động (clip Omni) và Anime · ảnh tĩnh.

assemble.py cut.json OUT.mp4 [--animatic]

cut.json:
{"clips": [{"file": "shots/s01.mp4", "in": 0, "out": 6.0}, {"file": "shots/s02.png", "dur": 4, "move": "push"}],
 "xfade": 0.5,                       # giây chuyển cảnh mờ chồng (0 = cắt thẳng)
 "grade": {"saturation": 1.05, "contrast": 1.03, "gamma": 1.0},   # chỉnh màu chung cho cả phim
 "narration": "audio/narration.wav", "narrationLead": 0.3,        # tuỳ chọn
 "music": "audio/music.wav", "musicGain": 0.35,                    # tuỳ chọn (tạo bằng phong-canh.mjs --audio-only)
 "keepClipAudio": false,
 "captions": "captions-audio.json"}  # tuỳ chọn: [{start, end, text}], vẽ chữ trắng viền đen phía dưới
- Clip ảnh (.png/.jpg) thành đoạn chuyển động nhẹ: move = push (đẩy vào), pull (lùi ra), panL, panR.
- --animatic: bản thô để duyệt trước khi quay: mọi cảnh dùng ảnh khung đầu (file "key" của clip nếu có), 720p, nhanh.
"""
import json, os, subprocess, sys, tempfile
args = sys.argv[1:]; cut_path, out = args[0], args[1]; animatic = '--animatic' in args
base = os.path.dirname(os.path.abspath(cut_path)); C = json.load(open(cut_path))
W, H = (720, 1280) if animatic else (1080, 1920); FPS = 30
P = lambda f: f if os.path.isabs(f) else os.path.join(base, f)
def dur_of(f): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout or 0)
tmp = tempfile.mkdtemp(prefix='asm_'); parts = []
for i, c in enumerate(C['clips']):
    src = P(c.get('key') if animatic and c.get('key') else c['file']); o = os.path.join(tmp, f'p{i:02d}.mp4')
    if src.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        d = c.get('dur', c.get('out', 4) - c.get('in', 0)); n = int(d * FPS); mv = c.get('move', 'push')
        z = {'push': f"1+0.06*on/{n}", 'pull': f"1.06-0.06*on/{n}"}.get(mv, "1.06")
        x = {'panL': f"(iw-iw/zoom)*(1-on/{n})", 'panR': f"(iw-iw/zoom)*on/{n}"}.get(mv, "(iw-iw/zoom)/2")
        vf = f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},zoompan=z='{z}':x='{x}':y='(ih-ih/zoom)/2':d={n}:s={W}x{H}:fps={FPS}"
        cmd = ['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', src, '-vf', vf, '-frames:v', str(n), '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18', o]
    else:
        a, b = c.get('in', 0), c.get('out', None); d = (b if b is not None else dur_of(src)) - a
        cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-t', str(d), '-i', src, '-vf', f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1",
               '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '18'] + (['-c:a', 'aac'] if C.get('keepClipAudio') else ['-an']) + [o]
    subprocess.run(cmd, check=True); parts.append((o, dur_of(o)))
# nối có chuyển cảnh
xf = 0 if animatic else C.get('xfade', 0.5); inputs, fl, last, offset = [], [], '[0:v]', 0.0
for o, _ in parts: inputs += ['-i', o]
if len(parts) == 1 or xf <= 0:
    fl.append(''.join(f'[{i}:v]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0[v]'); total = sum(d for _, d in parts)
else:
    offset = parts[0][1]
    for i in range(1, len(parts)):
        offset -= xf; lab = f'[x{i}]' if i < len(parts) - 1 else '[v]'
        fl.append(f"{last}[{i}:v]xfade=transition=fade:duration={xf}:offset={offset:.3f}{lab}"); last = lab; offset += parts[i][1]
    total = offset
g = C.get('grade', {}); grade = f"eq=saturation={g.get('saturation', 1.0)}:contrast={g.get('contrast', 1.0)}:gamma={g.get('gamma', 1.0)}"
vchain = f"[v]{grade}"
if C.get('captions'):
    caps = json.load(open(P(C['captions']))); lead = C.get('narrationLead', 0.3)
    def ts(t): t = max(0, t); return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
    fs = int(H * 0.052); ass = os.path.join(tmp, 'caps.ass')
    with open(ass, 'w', encoding='utf8') as f:
        f.write(f"[Script Info]\nPlayResX: {W}\nPlayResY: {H}\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV\n"
                f"Style: D,Noto Sans,{fs},&H00FFFFFF,&H00000000,&H64000000,1,1,{max(3, fs // 9)},2,2,{W // 12},{W // 12},{int(H * 0.16)}\n\n[Events]\nFormat: Layer, Start, End, Style, Text\n")
        for c in caps: f.write(f"Dialogue: 0,{ts(c['start'] + lead)},{ts(c['end'] + lead)},D,{c['text']}\n")
    fontsdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'engine', 'fonts')
    vchain += f",subtitles='{ass}':fontsdir='{fontsdir}'"
fl.append(vchain + '[vo]')
# âm thanh
amap, ai = [], len(parts)
if C.get('narration'):
    inputs += ['-i', P(C['narration'])]; fl.append(f"[{ai}:a]adelay={int(C.get('narrationLead', 0.3) * 1000)}:all=1,apad[na]"); amap.append('[na]'); ai += 1
if C.get('music'):
    inputs += ['-stream_loop', '-1', '-i', P(C['music'])]; fl.append(f"[{ai}:a]volume={C.get('musicGain', 0.35)}[mu]"); amap.append('[mu]'); ai += 1
if amap: fl.append(''.join(amap) + f"amix=inputs={len(amap)}:duration=longest:normalize=0,afade=t=out:st={max(0, total - 1.2):.2f}:d=1.2[ao]")
cmd = ['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fl), '-map', '[vo]'] + (['-map', '[ao]', '-c:a', 'aac', '-b:a', '160k'] if amap else []) + \
      ['-t', f'{total:.3f}', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24' if animatic else '20', '-preset', 'medium', out]
subprocess.run(cmd, check=True)
print(json.dumps({"output": out, "seconds": round(total, 2), "clips": len(parts), "animatic": animatic}))
