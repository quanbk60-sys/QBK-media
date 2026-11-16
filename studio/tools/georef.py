#!/usr/bin/env python3
"""Đối chiếu ảnh dự án (quy hoạch 1/500, mặt bằng phân lô, ảnh chụp thẳng từ trên) với ảnh vệ tinh: khớp bằng điểm mốc.

  python3 studio/tools/georef.py ANH.jpg SAT/satmap.json Z OUT_DIR \
      --pt 290,990:9.99622,105.77859 --pt 1080,270:9.99995,105.78258 --pt 1010,1820:9.99160,105.78286 [--pt ...] \
      [--alpha 0.55] [--name quy-hoach] [--key-white]

--pt  px,py:lat,lon   điểm mốc: pixel trên ảnh dự án ↔ tọa độ trên vệ tinh (ngã tư, góc ranh, mép hồ, đầu cầu).
                      3 điểm: biến đổi affine; từ 4 điểm: phối cảnh (homography, bình phương tối thiểu).
Ra trong OUT_DIR:
  <name>.png        ảnh dự án đã nắn về đúng lưới vệ tinh mức Z (nền trong suốt) để engine phủ lên bản đồ
  <name>.json       {"file", "z", "x0", "y0", "w", "h", "corners": [[lat,lon]×4], "rmse_m"}: phần tử `overlay` đọc file này
  <name>-check.jpg  ảnh kiểm tra: vệ tinh + ảnh dự án mờ đè lên + điểm mốc (đỏ: vệ tinh, vàng: ảnh dự án sau khi nắn)
--key-white  làm trong suốt nền giấy trắng của bản vẽ quy hoạch (chỉ giữ nét và mảng màu).
Sai số rmse_m (mét) in ra màn hình: dưới ~5 m là khớp tốt ở mức một lô đất; 5–15 m đủ cho cấp khu; lớn hơn thì chọn lại điểm.
Ảnh phối cảnh hay flycam chụp nghiêng KHÔNG nắn được kiểu này (chỉ ảnh nhìn thẳng từ trên); dùng để đối chiếu bằng mắt.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw


def gpx(lat, lon, z):
    n = 256 * 2 ** z
    s = math.sin(math.radians(lat))
    return (lon + 180) / 360 * n, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n


def glatlon(x, y, z):
    n = 256 * 2 ** z
    return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n)))), x / n * 360 - 180


def fit(src, dst):
    """src, dst: N×2. Trả về ma trận 3×3 (src → dst)."""
    n = len(src)
    if n == 3:
        A = np.array([[x, y, 1] for x, y in src]); M = np.linalg.solve(A, np.array(dst)).T
        return np.vstack([M, [0, 0, 1]])
    rows, b = [], []
    for (x, y), (u, v) in zip(src, dst):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    h = np.linalg.lstsq(np.array(rows, float), np.array(b, float), rcond=None)[0]
    return np.append(h, 1).reshape(3, 3)


def apply(H, x, y):
    p = H @ np.array([x, y, 1.0]); return p[0] / p[2], p[1] / p[2]


def main():
    a = sys.argv[1:]
    if len(a) < 4 or '--pt' not in a:
        print(__doc__); sys.exit(2)
    img_path, sat_json, z, out = a[0], a[1], int(a[2]), a[3]
    opt = lambda k, d: a[a.index(k) + 1] if k in a else d
    name, alpha = opt('--name', 'overlay'), float(opt('--alpha', 0.55))
    pts = [a[i + 1] for i, x in enumerate(a) if x == '--pt']
    src, geo = [], []
    for p in pts:
        l, r = p.split(':'); src.append(tuple(map(float, l.split(',')))); geo.append(tuple(map(float, r.split(','))))
    if len(src) < 3:
        sys.exit('cần ít nhất 3 điểm mốc')
    meta = json.load(open(sat_json)); L = [l for l in meta['levels'] if l['z'] == z]
    if not L:
        sys.exit(f'satmap không có mức z={z}')
    L = L[0]; sat = Image.open(os.path.join(os.path.dirname(sat_json), L['file'])).convert('RGB')
    dst = [(gx - L['x0'], gy - L['y0']) for gx, gy in (gpx(la, lo, z) for la, lo in geo)]   # pixel trên ảnh vệ tinh mức z
    H = fit(src, dst); Hi = np.linalg.inv(H)
    m_per_px = 156543.03392 * math.cos(math.radians(geo[0][0])) / 2 ** z
    err = [math.hypot(*(np.subtract(apply(H, *s), d))) * m_per_px for s, d in zip(src, dst)]
    rmse = math.sqrt(sum(e * e for e in err) / len(err))
    im = Image.open(img_path).convert('RGBA'); W, Hh = im.size
    if '--key-white' in a:
        arr = np.asarray(im).copy(); mn = arr[..., :3].min(axis=2).astype(int)
        arr[..., 3] = np.clip((255 - mn) * 4, 0, 255).astype(np.uint8); im = Image.fromarray(arr, 'RGBA')
    corners = [apply(H, x, y) for x, y in [(0, 0), (W, 0), (W, Hh), (0, Hh)]]
    x0, y0 = max(0, int(min(c[0] for c in corners))), max(0, int(min(c[1] for c in corners)))
    x1, y1 = min(sat.width, int(max(c[0] for c in corners)) + 1), min(sat.height, int(max(c[1] for c in corners)) + 1)
    # nắn: mỗi pixel đích (trên lưới vệ tinh) lấy từ ảnh nguồn qua ma trận nghịch
    T = np.array([[1, 0, x0], [0, 1, y0], [0, 0, 1]], float); M = Hi @ T
    coeffs = (M / M[2, 2]).flatten()[:8]
    warped = im.transform((x1 - x0, y1 - y0), Image.Transform.PERSPECTIVE, tuple(coeffs), Image.Resampling.BICUBIC)
    os.makedirs(out, exist_ok=True)
    warped.save(os.path.join(out, f'{name}.png'))
    info = {'file': f'{name}.png', 'source': os.path.basename(img_path), 'z': z, 'x0': L['x0'] + x0, 'y0': L['y0'] + y0, 'w': x1 - x0, 'h': y1 - y0,
            'corners': [list(map(lambda v: round(v, 7), glatlon(cx + L['x0'], cy + L['y0'], z))) for cx, cy in corners],
            'points': [{'px': s, 'geo': g, 'err_m': round(e, 1)} for s, g, e in zip(src, geo, err)], 'rmse_m': round(rmse, 1)}
    json.dump(info, open(os.path.join(out, f'{name}.json'), 'w'), ensure_ascii=False, indent=1)
    # ảnh kiểm tra
    chk = sat.crop((x0, y0, x1, y1)).convert('RGBA')
    ov = warped.copy(); ov.putalpha(Image.eval(warped.getchannel('A'), lambda v: int(v * alpha)))
    chk = Image.alpha_composite(chk, ov).convert('RGB'); d = ImageDraw.Draw(chk)
    for s, (dx, dy) in zip(src, dst):
        px, py = apply(H, *s)
        d.ellipse([dx - x0 - 9, dy - y0 - 9, dx - x0 + 9, dy - y0 + 9], outline=(255, 40, 40), width=4)
        d.ellipse([px - x0 - 4, py - y0 - 4, px - x0 + 4, py - y0 + 4], fill=(255, 220, 0))
    k = min(1, 1400 / max(chk.size)); chk.resize((int(chk.width * k), int(chk.height * k))).save(os.path.join(out, f'{name}-check.jpg'), quality=88)
    print(json.dumps({'out': os.path.join(out, f'{name}.json'), 'rmse_m': info['rmse_m'], 'err_m': [round(e, 1) for e in err]}, ensure_ascii=False))


if __name__ == '__main__':
    main()
