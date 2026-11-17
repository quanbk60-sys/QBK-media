#!/usr/bin/env python3
"""Tải ảnh vệ tinh miễn phí (Esri World Imagery, không cần key) và ghép thành "kim tự tháp" nhiều mức zoom
cho engine (phần tử `satmap` / `globe`, xem studio/engine/SCENE_FORMAT.md).

Ví dụ:
  python3 satmap.py projects/bach-dang-ve-tinh/sat \
      --level 4:world --level 6:21.0,106.0:1600x2400 --level 8:20.95,106.75:1600x2400 \
      --level 10:20.92,106.78:1800x2600 --level 12:20.90,106.79:1800x2600 --level 13:20.90,106.79:1800x2600

  --level Z:world               cả thế giới ở zoom Z (Z<=4 ⇒ tối đa 4096 px, dùng cho quả địa cầu)
  --level Z:LAT,LON:WxH         ảnh WxH px quanh tâm LAT,LON ở zoom Z
  --grade 0.82,0.85,1.08        độ sáng, độ bão hòa, tương phản (mặc định giống video mẫu: hơi tối, hơi nhạt)
  --source navy                 bản đồ đường phố vector màu xanh navy (phong cách bds-navy): nền Esri World Dark Gray,
                                tự xóa chữ tên đường in sẵn rồi tô lại theo bảng màu navy. Mặc định: imagery (ảnh vệ tinh)

Ra: OUT/z{Z}.jpg + OUT/satmap.json  {"source", "credit", "levels": [{z, file, x0, y0, w, h}]}
x0, y0 là tọa độ pixel toàn cầu (Web Mercator, 256 px/ô) của góc trên trái ở mức z.
Ảnh thuộc Esri và các nhà cung cấp; luôn hiện dòng ghi nguồn `credit` trên video.
"""
import io, zlib, json, math, os, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageEnhance

URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
UA = 'QBKStudio/1.0 (+https://github.com/quanbk60-sys/QBK-media)'
CREDIT = 'Esri, Maxar, Earthstar Geographics'
CACHE = os.path.expanduser('~/.cache/qbk-tiles')
SOURCES = {'imagery': (URL, CACHE, 'Esri World Imagery', CREDIT),
           'navy': ('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', CACHE + '-darkgray', 'Esri World Dark Gray Canvas (tô lại màu navy)', 'Esri, HERE, Garmin, © OpenStreetMap contributors')}
SRC = SOURCES['imagery']


def gpx(lat, lon, z):
    n = 256 * 2 ** z
    s = math.sin(math.radians(max(-85.05, min(85.05, lat))))
    return (lon + 180) / 360 * n, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n


def tile(z, x, y):
    f = os.path.join(SRC[1], str(z), str(x), f'{y}.jpg')
    if not os.path.exists(f):
        os.makedirs(os.path.dirname(f), exist_ok=True)
        for k in range(4):
            try:
                req = urllib.request.Request(SRC[0].format(z=z, x=x, y=y), headers={'User-Agent': UA})
                data = urllib.request.urlopen(req, timeout=30).read()
                open(f, 'wb').write(data)
                break
            except Exception as e:  # noqa
                if k == 3:
                    print(f'  tile {z}/{x}/{y} failed: {e}', file=sys.stderr)
                    return None
                time.sleep(2 ** k)
    try:
        return Image.open(f).convert('RGB')
    except Exception:
        return None


def build(z, x0, y0, w, h, grade):
    n = 2 ** z
    tx0, ty0, tx1, ty1 = int(x0 // 256), int(y0 // 256), int((x0 + w - 1) // 256), int((y0 + h - 1) // 256)
    jobs = [(tx, ty) for ty in range(max(0, ty0), min(n - 1, ty1) + 1) for tx in range(tx0, tx1 + 1)]
    img = Image.new('RGB', (w, h), (8, 14, 22))
    with ThreadPoolExecutor(8) as ex:
        for (tx, ty), t in zip(jobs, ex.map(lambda j: tile(z, j[0] % n, j[1]), jobs)):
            if t:
                img.paste(t, (int(tx * 256 - x0), int(ty * 256 - y0)))
    if SRC is SOURCES['navy']:
        img = navy(img); print(f'  z{z}: {len(jobs)} tiles -> {w}x{h} (navy)'); return img
    b, s, c = grade
    img = ImageEnhance.Brightness(ImageEnhance.Color(ImageEnhance.Contrast(img).enhance(c)).enhance(s)).enhance(b)
    print(f'  z{z}: {len(jobs)} tiles -> {w}x{h}')
    return img


def navy(img):
    """Dark Gray canvas → navy vector map like the bds-navy reference: water #105283 (lighter than land), land #063360,
    roads light steel blue. Street-name labels baked into the tiles are brighter than any road: mask them and inpaint."""
    import numpy as np
    L = np.asarray(img.convert('L')).astype(np.float32)
    road = np.percentile(L[L > 60], 97) if (L > 60).any() else 100
    mask = L > max(road + 4, 104)
    m = mask.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            m |= np.roll(np.roll(mask, dy, 0), dx, 1)
    V = L.copy(); V[m] = np.nan
    for _ in range(12):
        if not np.isnan(V).any(): break
        acc = np.zeros_like(L); cnt = np.zeros_like(L)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                sh = np.roll(np.roll(V, dy, 0), dx, 1); ok = ~np.isnan(sh); acc[ok] += sh[ok]; cnt[ok] += 1
        fill = np.isnan(V) & (cnt > 0); V[fill] = acc[fill] / cnt[fill]
    V = np.nan_to_num(V, nan=72)
    # labels printed on water (river / sea names) are mid-grey: snap them back to water when water surrounds them
    wat = (V < 42).astype(np.float32); acc = np.zeros_like(wat)
    for dy in range(-4, 5, 2):
        for dx in range(-4, 5, 2):
            acc += np.roll(np.roll(wat, dy, 0), dx, 1)
    V[(acc / 25 > 0.55) & (V > 40) & (V < 90)] = 35
    xs = [0, 44, 60, 84, 97, 112, 255]
    cols = np.array([(16, 82, 131), (16, 82, 131), (8, 56, 102), (6, 51, 96), (47, 87, 126), (66, 104, 146), (80, 120, 160)], np.float32)
    out = np.stack([np.interp(V, xs, cols[:, i]) for i in range(3)], -1)
    return Image.fromarray(out.clip(0, 255).astype('uint8'))


def main():
    global SRC
    a = sys.argv[1:]
    if not a or a[0].startswith('-'):
        print(__doc__); sys.exit(2)
    out = a[0]; os.makedirs(out, exist_ok=True)
    grade = (0.82, 0.85, 1.08)
    levels = []
    i = 1
    while i < len(a):
        if a[i] == '--level': levels.append(a[i + 1]); i += 2
        elif a[i] == '--grade': grade = tuple(float(v) for v in a[i + 1].split(',')); i += 2
        elif a[i] == '--source': SRC = SOURCES[a[i + 1]]; i += 2
        else: print('unknown arg', a[i]); sys.exit(2)
    meta_f = os.path.join(out, 'satmap.json')
    meta = json.load(open(meta_f)) if os.path.exists(meta_f) else {'levels': []}
    meta.update(source=SRC[2], credit=SRC[3])
    for spec in levels:
        parts = spec.split(':'); z = int(parts[0])
        if parts[1] == 'world':
            size = 256 * 2 ** z; x0 = y0 = 0; w = h = size
        else:
            lat, lon = (float(v) for v in parts[1].split(','))
            w, h = (int(v) for v in parts[2].lower().split('x'))
            cx, cy = gpx(lat, lon, z); x0, y0 = round(cx - w / 2), round(cy - h / 2)
            y0 = max(0, min(256 * 2 ** z - h, y0))
        name = f'z{z}' + ('' if parts[1] == 'world' else f'_{zlib.crc32(spec.encode()) % 10000:04d}') + '.jpg'
        build(z, x0, y0, w, h, grade).save(os.path.join(out, name), quality=90)
        meta['levels'] = [l for l in meta['levels'] if l['file'] != name] + [{'z': z, 'file': name, 'x0': x0, 'y0': y0, 'w': w, 'h': h, 'world': parts[1] == 'world'}]
    meta['levels'].sort(key=lambda l: l['z'])
    json.dump(meta, open(meta_f, 'w'), indent=1)
    print(json.dumps({'out': meta_f, 'levels': [l['file'] for l in meta['levels']]}))


if __name__ == '__main__':
    main()
