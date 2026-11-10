#!/usr/bin/env python3
"""Biến một ảnh chụp trong nhà thành cảnh quay cầm tay: máy quay ảo đi trong không gian 3D dựng từ chiều sâu ảnh.

  python3 studio/tools/camwalk.py ANH.jpg OUT_DIR --dur 5 [--fwd 0.25] [--side 0] [--up 0] [--yaw 0,0] [--pitch 0,0]
                                   [--hand 1] [--zoom 1.1] [--fps 30] [--fov 70] [--size 1080x1920]

- Chiều sâu: MiDaS v2.1 (ONNX, miễn phí, ~/.cache/qbk-models/midas-large.onnx, tải từ GitHub isl-org/MiDaS releases).
- Dựng: mỗi điểm ảnh thành điểm 3D (Z gần = 1, xa tối đa 6), máy quay đi theo đường: tiến `fwd`, ngang `side`, lên `up`
  (đơn vị: khoảng cách tới vật gần nhất), quay `yaw`/`pitch` từ đầu đến cuối (độ). `hand` = mức rung tay + nhún bước chân.
- Chiếu lại bằng phối cảnh thật (z-buffer, ánh xạ ngược), nên tường và khung cửa vẫn thẳng; quay thuần (yaw) là chính xác tuyệt đối.
- Ảnh ngang ra khung dọc: dùng yaw để lia (quay đầu máy), không cắt cứng.
Ra: OUT_DIR/f0000.jpg … và OUT_DIR/clip.json (thông số, để builder bỏ qua khi không đổi).
"""
import argparse, hashlib, json, math, os, sys
import numpy as np, cv2

MODEL = os.path.expanduser('~/.cache/qbk-models/midas-large.onnx')
MODEL_URL = 'https://github.com/isl-org/MiDaS/releases/download/v2_1/model-f6b98070.onnx'


def depth_of(img):
    import onnxruntime as ort
    if not os.path.exists(MODEL):
        import urllib.request; os.makedirs(os.path.dirname(MODEL), exist_ok=True)
        print('  tải MiDaS…', file=sys.stderr); urllib.request.urlretrieve(MODEL_URL, MODEL)
    s = ort.InferenceSession(MODEL, providers=['CPUExecutionProvider']); name = s.get_inputs()[0].name
    x = cv2.resize(img[:, :, ::-1], (384, 384), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
    x = (x - 0.5) / 0.5
    d = s.run(None, {name: x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
    d = cv2.resize(d, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5)
    dn = np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)
    Z = 1.0 / (0.16 + 0.84 * dn)          # gần = 1, xa ≈ 6
    return cv2.bilateralFilter(Z.astype(np.float32), 9, 0.3, 9)


def rot(yaw, pitch, roll):
    y, p, r = map(math.radians, (yaw, pitch, roll))
    Ry = np.array([[math.cos(y), 0, math.sin(y)], [0, 1, 0], [-math.sin(y), 0, math.cos(y)]])
    Rx = np.array([[1, 0, 0], [0, math.cos(p), -math.sin(p)], [0, math.sin(p), math.cos(p)]])
    Rz = np.array([[math.cos(r), -math.sin(r), 0], [math.sin(r), math.cos(r), 0], [0, 0, 1]])
    return Ry @ Rx @ Rz


def smooth_noise(t, seed, freqs=(0.31, 0.53, 0.97)):
    return sum(math.sin(2 * math.pi * f * t + seed * (i + 1) * 1.7) / (i + 1) for i, f in enumerate(freqs))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('img'); ap.add_argument('out')
    ap.add_argument('--dur', type=float, default=5); ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--fwd', type=float, default=0.25); ap.add_argument('--side', type=float, default=0); ap.add_argument('--up', type=float, default=0)
    ap.add_argument('--yaw', default='0,0'); ap.add_argument('--pitch', default='0,0'); ap.add_argument('--hand', type=float, default=1); ap.add_argument('--bob', type=float, default=None, help='nhún bước chân, mặc định = hand; gimbal: 0')
    ap.add_argument('--zoom', type=float, default=1.1); ap.add_argument('--fov', type=float, default=70); ap.add_argument('--size', default='1080x1920')
    ap.add_argument('--focus', default='0.5,0.5', help='điểm giữa khung ra trên ảnh gốc (0..1), dùng cho ảnh ngang')
    ap.add_argument('--ease', default='walk', help='walk: đi đều, vào/ra mềm; linear')
    a = ap.parse_args()
    OW, OH = map(int, a.size.lower().split('x'))
    sig = hashlib.md5(json.dumps({**vars(a), 'out': None, 'v': 5}, sort_keys=True).encode()).hexdigest()[:12]
    meta_f = os.path.join(a.out, 'clip.json')
    if os.path.exists(meta_f) and json.load(open(meta_f)).get('sig') == sig:
        print(json.dumps({'out': a.out, 'cached': True})); return
    os.makedirs(a.out, exist_ok=True)
    for f in os.listdir(a.out):
        if f.endswith('.jpg'): os.remove(os.path.join(a.out, f))

    img = cv2.imread(a.img); img = cv2.resize(img, None, fx=1920 / max(img.shape[:2]), fy=1920 / max(img.shape[:2]), interpolation=cv2.INTER_AREA)
    H, W = img.shape[:2]; Z = depth_of(img)
    f = (max(W, H) / 2) / math.tan(math.radians(a.fov / 2)); cx, cy = W / 2, H / 2
    fo = f * a.zoom * max(OW / W, OH / H, 1) if W > H else f * a.zoom * OH / H     # tiêu cự khung ra (px khung ra)
    fx0, fy0 = map(float, a.focus.split(','))
    base_yaw = math.degrees(math.atan((fx0 - 0.5) * W / f)); base_pitch = -math.degrees(math.atan((fy0 - 0.5) * H / f))
    ocx, ocy = OW / 2, OH / 2
    # điểm 3D ở nửa độ phân giải cho bước z-buffer
    s = 2; Zs = cv2.resize(Z, (W // s, H // s), interpolation=cv2.INTER_AREA)
    vs, us = np.mgrid[0:H // s, 0:W // s].astype(np.float32); us = us * s + s / 2; vs = vs * s + s / 2
    P = np.stack([(us - cx) * Zs / f, (vs - cy) * Zs / f, Zs], -1).reshape(-1, 3)
    y0, y1 = map(float, a.yaw.split(',')); p0, p1 = map(float, a.pitch.split(','))
    # giới hạn góc quay để khung ra không vượt mép ảnh gốc (chừa 1,5° cho rung tay)
    ym = max(0.0, math.degrees(math.atan(W / 2 / f) - math.atan(OW / 2 / fo)) - 1.5 - abs(base_yaw))
    pm = max(0.0, math.degrees(math.atan(H / 2 / f) - math.atan(OH / 2 / fo)) - 1.5 - abs(base_pitch))
    y0, y1 = (max(-ym, min(ym, v)) for v in (y0, y1)); p0, p1 = (max(-pm, min(pm, v)) for v in (p0, p1))
    N = max(1, round(a.dur * a.fps)); dw, dh = OW // 2, OH // 2
    vv, uu = np.mgrid[0:OH, 0:OW].astype(np.float32)
    for i in range(N):
        tt = i / a.fps; u = i / max(1, N - 1)
        q = u if a.ease == 'linear' else (u * u * (3 - 2 * u) * 0.35 + u * 0.65)   # gần đều, đầu cuối mềm
        hand = a.hand; bob = a.hand if a.bob is None else a.bob
        C = np.array([a.side * q + hand * 0.006 * smooth_noise(tt, 1), a.up * q - bob * 0.006 * abs(math.sin(math.pi * 1.8 * tt)) + hand * 0.004 * smooth_noise(tt, 2), a.fwd * q])
        R = rot(base_yaw + y0 + (y1 - y0) * q + hand * 0.35 * smooth_noise(tt, 3), base_pitch + p0 + (p1 - p0) * q + hand * 0.25 * smooth_noise(tt, 4), hand * 0.3 * smooth_noise(tt, 5))
        Pc = (P - C) @ R            # = R^T (P - C)
        zc = Pc[:, 2]; ok = zc > 0.05
        uo = Pc[ok, 0] / zc[ok] * (fo / 2) + dw / 2; vo = Pc[ok, 1] / zc[ok] * (fo / 2) + dh / 2
        ui, vi = np.round(uo).astype(np.int32), np.round(vo).astype(np.int32); m = (ui >= 0) & (ui < dw) & (vi >= 0) & (vi < dh)
        zb = np.full(dw * dh, np.inf, np.float32); np.minimum.at(zb, vi[m] * dw + ui[m], zc[ok][m]); zb = zb.reshape(dh, dw)
        hole = ~np.isfinite(zb); zf = np.where(hole, 0, zb).astype(np.float32)
        for _ in range(12):                                    # lỗ hổng: lấy chiều sâu nền (xa) quanh đó
            if not hole.any(): break
            d = cv2.dilate(zf, np.ones((3, 3), np.uint8)); zf = np.where(hole, d, zf); hole = zf <= 0
        zf[zf <= 0] = Z.max(); zf = cv2.medianBlur(zf, 5)
        zt = cv2.resize(zf, (OW, OH), interpolation=cv2.INTER_LINEAR)
        Pt = np.stack([(uu - ocx) / fo * zt, (vv - ocy) / fo * zt, zt], -1) @ R.T + C   # về toạ độ ảnh gốc
        mx = (Pt[..., 0] / Pt[..., 2] * f + cx).astype(np.float32); my = (Pt[..., 1] / Pt[..., 2] * f + cy).astype(np.float32)
        fr = cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        cv2.imwrite(os.path.join(a.out, f'f{i:04d}.jpg'), fr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    json.dump({'sig': sig, 'frames': N, 'fps': a.fps, 'size': [OW, OH], 'src': a.img}, open(meta_f, 'w'))
    print(json.dumps({'out': a.out, 'frames': N}))


if __name__ == '__main__':
    main()
