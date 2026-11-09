#!/usr/bin/env python3
"""Người thật nói chuyện (phong cách phong-thu): ghép khẩu hình và chớp mắt từ các ảnh AI cùng một khung.

talking.py --base B.png --half H.png --open O.png --blink K.png --audio voice.wav --out out.mp4
           [--mouth 0.535,0.47] [--eyes 0.535,0.407] [--blur x0,y0,x1,y1] [--music m.mp3] [--fps 30]
           [--captions captions.json] [--still T]

- Các ảnh biến thể (miệng hé, miệng mở, nhắm mắt) do genimage.py tạo từ ảnh gốc bằng --ref. Chúng hay lệch vị trí
  vài pixel, nên được căn khớp về ảnh gốc (ECC affine trên vùng mặt) trước khi ghép.
- Chỉ vùng miệng (và vùng mắt khi chớp) lấy từ biến thể, ghép bằng mặt nạ mờ biên; phần còn lại giữ nguyên ảnh gốc.
- Độ mở miệng theo độ lớn giọng đọc từng khung (pha trộn gốc -> hé -> mở). Chớp mắt ngẫu nhiên mỗi 2,5–5 giây.
- Camera gần như tĩnh như mẫu: chỉ đẩy vào rất chậm và rung nhẹ.
- --blur: làm mờ một vùng (tỉ lệ khung) để che logo nhãn hiệu nếu ảnh AI vẽ ra.
"""
import json, os, subprocess, sys, wave
import numpy as np, cv2

args = sys.argv[1:]
def opt(k, d=None): return args[args.index(k) + 1] if k in args else d
def pair(s): return [float(v) for v in s.split(',')]
W, H, fps = 1080, 1920, int(opt('--fps', 30))
load = lambda p: cv2.imread(p, cv2.IMREAD_COLOR).astype(np.float32)
base = load(opt('--base')); h0, w0 = base.shape[:2]
mx, my = pair(opt('--mouth', '0.535,0.47')); ex, ey = pair(opt('--eyes', '0.535,0.407'))

def align(img):  # căn ảnh biến thể về ảnh gốc trên vùng mặt (thu nhỏ 1/4 cho nhanh)
    s = 0.25; a = cv2.cvtColor(cv2.resize(base, None, fx=s, fy=s), cv2.COLOR_BGR2GRAY); b = cv2.cvtColor(cv2.resize(img, None, fx=s, fy=s), cv2.COLOR_BGR2GRAY)
    m = np.zeros(a.shape, np.uint8); cv2.ellipse(m, (int(mx * a.shape[1]), int((my + ey) / 2 * a.shape[0])), (int(0.2 * a.shape[1]), int(0.13 * a.shape[0])), 0, 0, 360, 255, -1)
    warp = np.eye(2, 3, dtype=np.float32)
    try: _, warp = cv2.findTransformECC(a, b, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), m, 5)
    except cv2.error as e: print('ECC lỗi, dùng nguyên ảnh:', e)
    warp[:, 2] /= s
    return cv2.warpAffine(img, warp, (w0, h0), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE), warp

def ell_mask(cx, cy, rx, ry, feather):
    m = np.zeros((h0, w0), np.float32); cv2.ellipse(m, (int(cx * w0), int(cy * h0)), (int(rx * w0), int(ry * h0)), 0, 0, 360, 1, -1)
    k = int(feather * w0) | 1; return cv2.GaussianBlur(m, (k, k), 0)[..., None]

half, wh = align(load(opt('--half'))); opn, wo = align(load(opt('--open'))); blk, wb = align(load(opt('--blink')))
print('căn khớp (dịch px):', [round(float(w[0, 2]), 1) for w in (wh, wo, wb)], [round(float(w[1, 2]), 1) for w in (wh, wo, wb)])
Mm = ell_mask(mx, my + 0.008, 0.075, 0.042, 0.04); Me = ell_mask(ex, ey, 0.11, 0.022, 0.03)
if opt('--blur'):
    x0, y0, x1, y1 = pair(opt('--blur')); X0, Y0, X1, Y1 = int(x0 * w0), int(y0 * h0), int(x1 * w0), int(y1 * h0)
    for im in (base, half, opn, blk): im[Y0:Y1, X0:X1] = cv2.GaussianBlur(im[Y0:Y1, X0:X1], (0, 0), 9)
half = base + (half - base) * Mm; opn = base + (opn - base) * Mm; blkd = (blk - base) * Me

# độ lớn giọng đọc theo khung
wav = opt('--audio'); w = wave.open(wav); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)
if w.getnchannels() > 1: x = x.reshape(-1, w.getnchannels()).mean(1)
dur = len(x) / sr; N = int(dur * fps) + 1; win = int(sr * 0.04)
rms = np.array([np.sqrt(np.mean(x[max(0, int(i / fps * sr) - win // 2): int(i / fps * sr) + win // 2] ** 2) + 1e-9) for i in range(N)])
rms /= np.percentile(rms, 95) + 1e-9
env, v = np.zeros(N), 0.0
for i, r in enumerate(rms): v += (r - v) * (0.6 if r > v else 0.35); env[i] = v
mouth = np.clip((env - 0.12) / 0.75, 0, 1)
rng = np.random.default_rng(7); blinks, t = [], 1.2
while t < dur: blinks.append(t); t += 2.5 + rng.random() * 2.5

def frame(i):
    t = i / fps; m = mouth[min(i, N - 1)]
    img = base + (half - base) * (m / 0.5) if m < 0.5 else half + (opn - half) * ((m - 0.5) / 0.5)
    b = max([max(0.0, 1 - abs(t - bt) / 0.09) for bt in blinks] + [0.0])
    if b > 0: img = img + blkd * min(1, b * 1.4)
    z = 1.0 + 0.025 * t / max(dur, 1); ang = 0.15 * np.sin(t * 0.7); sx = 1.5 * np.sin(t * 0.43)
    k = W / w0 * z; M = cv2.getRotationMatrix2D((w0 / 2, h0 * 0.42), ang, k); M[0, 2] += W / 2 - w0 / 2 + sx; M[1, 2] += H * 0.42 - h0 * 0.42
    return cv2.warpAffine(np.clip(img, 0, 255).astype(np.uint8), M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

out = opt('--out'); os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
if opt('--still'):
    for ts in opt('--still').split(','): p = out.replace('.mp4', f'-{ts}.png'); cv2.imwrite(p, frame(int(float(ts) * fps))); print(p)
    sys.exit(0)
tmp = out + '.v.mp4'
ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', tmp], stdin=subprocess.PIPE)
for i in range(N): ff.stdin.write(frame(i).tobytes())
ff.stdin.close(); ff.wait()
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-i', wav]
if opt('--music'):
    cmd += ['-stream_loop', '-1', '-i', opt('--music'), '-filter_complex', '[2:a]volume=0.12[m];[1:a][m]amix=inputs=2:duration=first:normalize=0[a]', '-map', '0:v', '-map', '[a]']
else: cmd += ['-map', '0:v', '-map', '1:a']
subprocess.run(cmd + ['-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', out], check=True); os.remove(tmp)
print(json.dumps({"output": out, "seconds": round(dur, 2), "frames": N}))
