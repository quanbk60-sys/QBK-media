#!/usr/bin/env python3
"""Demo phong cách `bds-tien-ich` (15 s, không lời đọc): routes.json (osrm.py) -> scene.json. Chạy từ gốc repo:
  sh projects/_mau-bds-tien-ich/fetch_sat.sh && python3 studio/tools/osrm.py projects/_mau-bds-tien-ich/pois.json projects/_mau-bds-tien-ich/routes.json
  python3 projects/_mau-bds-tien-ich/build_scene.py && node studio/engine/render.mjs projects/_mau-bds-tien-ich/scene.json
Dự án là vị trí minh họa (không phải dự án thật); km và phút là ước tính lái xe của OSRM."""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(D, 'routes.json'), encoding='utf-8'))
P = R['project']; G = [P['lat'], P['lon']]
poi = {p['name']: p for p in R['pois']}
vd, nh, ga, dx = poi['Bệnh viện Việt Đức'], poi['Nhà hát Lớn Hà Nội'], poi['Ga Hà Nội'], poi['Chợ Đồng Xuân']
km = lambda p: str(p['km']).replace('.', ',')


def route(p, at=0.0, dur=1.2, **kw):
    return {'type': 'route', 'path': p['path'], 'color': {'gold': '#F6C33B', 'ruby': '#FF4D61', 'blue': '#3FB6FF', 'green': '#38D46A'}[p['color']],
            'neon': True, 'width': 8, 'grow': {'at': at, 'dur': dur}, 'head': 'dot', **kw}


def pin(p, frm, **kw):
    return {'type': 'poi', 'geo': [p['lat'], p['lon']], 'icon': p['icon'], 'color': p['color'], 'label': p['name'],
            'sub': f"cách dự án {km(p)} km", 'from': frm, **kw}


def view(z0, z1, dur, lat=G[0], lon=G[1]):
    return [{'t': 0, 'lat': lat, 'lon': lon, 'zoom': z0}, {'t': dur, 'lat': lat, 'lon': lon, 'zoom': z1, 'ease': 'linear'}]


proj = {'type': 'project', 'geo': G, 'label': P['name'], 'sub': 'Vị trí minh họa'}
shots = [
    {'start': 0, 'end': 3.5, 'view': [{'t': 0, 'lat': G[0], 'lon': G[1], 'zoom': 13.6}, {'t': 3.5, 'lat': G[0], 'lon': G[1], 'zoom': 16.2}],
     'tilt': [{'t': 0, 'deg': 10}, {'t': 3.2, 'deg': 40}],
     'elements': [{'type': 'satmap'}, {**proj, 'from': 1.1},
                  {'type': 'chapter', 'text': 'Xung quanh có gì?', 'sub': 'Hoàn Kiếm · Hà Nội', 'from': 0.2, 'y': 300}],
     'sfx': [{'t': 0.1, 'kind': 'whoosh', 'gain': 0.35}, {'t': 1.2, 'kind': 'pop', 'gain': 0.4}]},
    {'start': 3.5, 'end': 7.5, 'view': view(16.2, 16.4, 4.0), 'tilt': 40,
     'elements': [{'type': 'satmap'}, route(vd, 0.2, 0.8), route(nh, 1.3, 1.4), proj,
                  pin(vd, 0.9, side='below'), pin(nh, 2.6),
                  {'type': 'chapter', 'text': 'Ngay cửa nhà', 'from': 0.0, 'y': 300},
                  {'type': 'info', 'cat': vd['cat'], 'name': vd['name'], 'km': vd['km'], 'min': vd['min'], 'icon': 'hospital', 'color': 'ruby', 'y': 1290, 'from': 0.9, 'to': 2.5},
                  {'type': 'info', 'cat': nh['cat'], 'name': nh['name'], 'km': nh['km'], 'min': nh['min'], 'icon': 'star', 'color': 'gold', 'y': 1290, 'from': 2.6}],
     'sfx': [{'t': 0.05, 'kind': 'whoosh', 'gain': 0.3}, {'t': 1.0, 'kind': 'pop', 'gain': 0.4}, {'t': 2.7, 'kind': 'pop', 'gain': 0.4}]},
    {'start': 7.5, 'end': 11.5, 'view': view(16.4, 15.0, 4.0), 'tilt': 40,
     'elements': [{'type': 'satmap'}, {'type': 'rings', 'geo': G, 'km': [1, 2], 'from': 0.0},
                  route(vd, 0, 0.01), route(nh, 0, 0.01), route(ga, 0.3, 1.0), route(dx, 1.0, 1.2), proj,
                  pin(vd, 0, pulse=False, instant=True, label=None, sub=None), pin(nh, 0, pulse=False, instant=True, label=None, sub=None),
                  pin(ga, 1.1, side=-1), pin(dx, 2.0),
                  {'type': 'chapter', 'text': 'Kết nối nhanh', 'from': 0.0, 'y': 300},
                  {'type': 'checklist', 'title': 'Tiện ích quanh dự án', 'y': 1240, 'from': 1.2, 'stagger': 0.35,
                   'items': [f"{p['name']} · {km(p)} km" for p in (vd, ga, nh, dx)]}],
     'sfx': [{'t': 0.05, 'kind': 'whoosh', 'gain': 0.3}, {'t': 1.2, 'kind': 'pop', 'gain': 0.35}, {'t': 2.1, 'kind': 'pop', 'gain': 0.35}, {'t': 1.6, 'kind': 'tap', 'gain': 0.3}, {'t': 2.0, 'kind': 'tap', 'gain': 0.3}, {'t': 2.3, 'kind': 'tap', 'gain': 0.3}, {'t': 2.7, 'kind': 'tap', 'gain': 0.3}]},
    {'start': 11.5, 'end': 15.5, 'view': view(17.0, 17.3, 4.0), 'tilt': [{'t': 0, 'deg': 40}, {'t': 4, 'deg': 48}],
     'elements': [{'type': 'satmap'}, route(vd, 0, 0.01), route(nh, 0, 0.01), route(ga, 0, 0.01), route(dx, 0, 0.01),
                  {'type': 'block', 'geo': G, 'size': [90, 60], 'rot': 18, 'height': 120, 'color': 'blue', 'label': 'LÔ MẪU', 'dims': '90 m', 'from': 0.2},
                  {'type': 'legend', 'y': 160, 'from': 0.4, 'items': [{'color': '#FF4D61', 'text': f"{vd['name']} · {vd['min']} phút"}, {'color': '#F6C33B', 'text': f"Nhà hát Lớn · {nh['min']} phút"},
                                                                     {'color': '#3FB6FF', 'text': f"{ga['name']} · {ga['min']} phút"}, {'color': '#38D46A', 'text': f"{dx['name']} · {dx['min']} phút"}]},
                  {'type': 'cta', 'text': 'Liên hệ', 'key': 'Nhận thông tin', 'y': 1330, 'from': 1.2},
                  {'type': 'note', 'text': 'Vị trí minh họa · km, phút: ước tính OSRM · Đường: © OpenStreetMap', 'x': 540, 'align': 'center', 'y': 1460, 'from': 1.4, 'size': 22}],
     'sfx': [{'t': 0.05, 'kind': 'whoosh', 'gain': 0.3}, {'t': 0.4, 'kind': 'thud', 'gain': 0.35}, {'t': 1.3, 'kind': 'chime', 'gain': 0.35}]},
]
scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 'bds-tien-ich', 'satmap': 'sat/satmap.json', 'shots': shots}
json.dump(scene, open(os.path.join(D, 'scene.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('scene.json', sum(len(s['elements']) for s in shots), 'elements')
