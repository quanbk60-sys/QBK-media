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


def gpx(lat, lon, z):
    n = 256 * 2 ** z
    s = math.sin(math.radians(max(-85.05, min(85.05, lat))))
    return (lon + 180) / 360 * n, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n


def tile(z, x, y):
    f = os.path.join(CACHE, str(z), str(x), f'{y}.jpg')
    if not os.path.exists(f):
        os.makedirs(os.path.dirname(f), exist_ok=True)
        for k in range(4):
            try:
                req = urllib.request.Request(URL.format(z=z, x=x, y=y), headers={'User-Agent': UA})
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
    b, s, c = grade
    img = ImageEnhance.Brightness(ImageEnhance.Color(ImageEnhance.Contrast(img).enhance(c)).enhance(s)).enhance(b)
    print(f'  z{z}: {len(jobs)} tiles -> {w}x{h}')
    return img


def main():
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
        else: print('unknown arg', a[i]); sys.exit(2)
    meta_f = os.path.join(out, 'satmap.json')
    meta = json.load(open(meta_f)) if os.path.exists(meta_f) else {'levels': []}
    meta.update(source='Esri World Imagery', credit=CREDIT)
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
