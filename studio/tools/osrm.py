#!/usr/bin/env python3
"""Lấy tuyến đường thật (OSRM công cộng, miễn phí, dữ liệu © OpenStreetMap) từ dự án tới từng địa điểm, cho phong cách `bds-tien-ich`.

Ví dụ:
  python3 studio/tools/osrm.py pois.json routes.json
pois.json:
  {"project": {"name": "Dự án A", "lat": 21.0, "lon": 105.8},
   "pois": [{"name": "Ga Hà Nội", "lat": 21.0245, "lon": 105.8412, "cat": "KẾT NỐI", "icon": "train", "color": "blue"}, ...]}
Ra routes.json: mỗi địa điểm thêm "km", "min" (lái xe, ước tính của OSRM), "path" [[lat, lon], ...] (đã rút gọn điểm)
để dán thẳng vào phần tử `route` của scene.json. Tùy chọn --profile driving|foot|bike (máy chủ công cộng chỉ chắc chắn có driving).

Không có công cụ tìm tọa độ miễn phí nào mở từ máy này (Nominatim, Photon bị chặn): tọa độ lấy từ người dùng, link Google Maps,
trang Wikipedia của địa điểm, hoặc dò trên ảnh vệ tinh bằng satgrid.py. Không bịa tọa độ; vị trí tạm phải ghi rõ trên video.
"""
import json, sys, time, urllib.request

UA = 'QBKStudio/1.0 (+https://github.com/quanbk60-sys/QBK-media)'


def simplify(pts, tol):
    """Ramer–Douglas–Peucker trên (lat, lon)."""
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = (dx * dx + dy * dy) ** 0.5 or 1e-12
    i, dmax = 0, -1
    for k in range(1, len(pts) - 1):
        d = abs(dy * (pts[k][0] - a[0]) - dx * (pts[k][1] - a[1])) / L
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [a, b]
    return simplify(pts[:i + 1], tol)[:-1] + simplify(pts[i:], tol)


def route(p, q, profile='driving'):
    u = f"https://router.project-osrm.org/route/v1/{profile}/{p['lon']},{p['lat']};{q['lon']},{q['lat']}?overview=full&geometries=geojson"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=30) as r:
                j = json.load(r)
            if j.get('code') == 'Ok':
                return j['routes'][0]
            raise RuntimeError(j.get('message') or j.get('code'))
        except Exception as e:  # noqa: BLE001
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(2)
    profile = args[args.index('--profile') + 1] if '--profile' in args else 'driving'
    data = json.load(open(args[0], encoding='utf-8'))
    P = data['project']
    out = {'project': P, 'source': 'OSRM (router.project-osrm.org), dữ liệu © OpenStreetMap contributors', 'pois': []}
    for q in data['pois']:
        r = route(P, q, profile)
        pts = [[c[1], c[0]] for c in r['geometry']['coordinates']]
        pts = simplify(pts, 0.00004)
        item = {**q, 'km': round(r['distance'] / 1000, 1), 'min': max(1, round(r['duration'] / 60)), 'path': [[round(a, 6), round(b, 6)] for a, b in pts]}
        out['pois'].append(item)
        print(f"{q['name']}: {item['km']} km, {item['min']} phút, {len(pts)} điểm", file=sys.stderr)
        time.sleep(0.5)
    json.dump(out, open(args[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
