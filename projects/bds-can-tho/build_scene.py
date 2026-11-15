#!/usr/bin/env python3
"""bds-can-tho: video vị trí lô A (block EHomeS, Nam Long II Central Lake, Cái Răng, Cần Thơ). Phong cách bds-tien-ich, không lời đọc.
Chạy từ gốc repo: sh projects/bds-can-tho/fetch_sat.sh && python3 projects/bds-can-tho/build_scene.py && node studio/engine/render.mjs projects/bds-can-tho/scene.json
Nguồn mọi chữ trên hình: sources.md."""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(D, 'routes.json'), encoding='utf-8'))
P = R['project']; G = [P['lat'], P['lon']]
LAKE = [9.9955, 105.7825]
pois = [p for p in R['pois'] if p['name'] != 'Cầu Cần Thơ']   # tuyến OSRM tới mặt cầu đi vòng bất thường (14 km): bỏ
km = lambda p: str(p['km']).replace('.', ',')
COL = {'gold': '#F6C33B', 'ruby': '#FF4D61', 'blue': '#3FB6FF', 'green': '#38D46A', 'teal': '#19C3B1', 'purple': '#B07CFF'}
# khối nhà lô A, dò trên ảnh vệ tinh Esri z18 (notes.md)
LOT = [[9.994434, 105.783795], [9.994690, 105.784150], [9.994336, 105.784505], [9.994200, 105.783950]]
CREDIT = 'Ảnh: Nam Long II Central Lake (cafeland.vn)'


def view(z0, z1, dur, c=G, c1=None):
    c1 = c1 or c
    return [{'t': 0, 'lat': c[0], 'lon': c[1], 'zoom': z0}, {'t': dur, 'lat': c1[0], 'lon': c1[1], 'zoom': z1}]


def route(p, at, dur):
    return {'type': 'route', 'path': p['path'], 'color': COL[p['color']], 'neon': True, 'width': 7, 'grow': {'at': at, 'dur': dur}, 'head': 'dot'}


shots = []
t = 0
def shot(dur, **kw):
    global t
    shots.append({'start': round(t, 3), 'end': round(t + dur, 3), **kw}); t += dur

# 1. từ trên cao xuống khu đô thị
shot(4.0, view=view(12.6, 15.4, 4.0, c=[10.004, 105.776], c1=LAKE), tilt=[{'t': 0, 'deg': 12}, {'t': 3.6, 'deg': 40}],
     elements=[{'type': 'satmap'},
               {'type': 'chapter', 'text': 'Nam Long II Central Lake', 'sub': 'Cái Răng · Cần Thơ · 43,8 ha', 'from': 0.3, 'y': 300, 'size': 78}],
     sfx=[{'t': 0.4, 'kind': 'pop', 'gain': 0.25}])
# 2. phủ bản quy hoạch 1/500
shot(4.0, view=view(15.4, 15.8, 4.0, c=LAKE), tilt=40,
     elements=[{'type': 'satmap'}, {'type': 'overlay', 'path': 'geo/quy-hoach.json', 'alpha': 0.7, 'reveal': {'at': 0.1, 'dur': 1.6}},
               {'type': 'project', 'geo': G, 'label': 'EHomeS', 'sub': 'Nhà ở xã hội', 'from': 1.6},
               {'type': 'chapter', 'text': 'Quy hoạch 1/500', 'sub': 'Khu dân cư Nam Long II', 'from': 0.0, 'y': 300},
               {'type': 'note', 'text': 'Bản đồ quy hoạch phân lô: cafeland.vn (đặt khớp ảnh vệ tinh, lệch khoảng 45 m)', 'x': 540, 'align': 'center', 'y': 1640, 'size': 22, 'from': 0.4}],
     sfx=[{'t': 1.7, 'kind': 'pop', 'gain': 0.4}])
# 3. flycam hồ trung tâm
shot(3.2, elements=[{'type': 'photo', 'path': 'ref/flycam-ho.jpg', 'full': True, 'kenburns': 1.12, 'focus': [0.42, 0.5], 'dim': 0.05, 'credit': CREDIT},
                    {'type': 'chapter', 'text': 'Hồ trung tâm', 'from': 0.2, 'y': 300}])
# 4. flycam tiến độ: khoanh block A (ảnh 1600×792 phủ khung 1080×1920: tỉ lệ 2,424; focus x 0,612 đặt block A giữa khung)
shot(4.0, elements=[{'type': 'photo', 'path': 'ref/flycam-tien-do.jpg', 'full': True, 'kenburns': 1.0, 'focus': [0.612, 0.5], 'dim': 0.05, 'credit': CREDIT},
                    {'type': 'frame', 'points': [[326, 1118], [766, 1118], [766, 1372], [326, 1372]], 'color': 'gold', 'label': 'Block EHomeS', 'sub': 'ngay đầu hồ', 'from': 0.4},
                    {'type': 'chapter', 'text': 'Hiện trạng', 'sub': 'ảnh flycam của chủ đầu tư', 'from': 0.0, 'y': 300}],
     sfx=[{'t': 0.5, 'kind': 'tap', 'gain': 0.3}])
# 5. kết nối trung tâm Cần Thơ
SIDE = {'Chợ nổi Cái Răng': -1, 'Đại học Cần Thơ': 0, 'Bến Ninh Kiều': 1}
shot(5.5, view=view(13.75, 13.55, 5.5, c=[10.016, 105.771]), tilt=30,
     elements=[{'type': 'satmap'}] + [route(p, 0.2 + i * 0.6, 1.2) for i, p in enumerate(pois)] +
              [{'type': 'project', 'geo': G, 'size': 1.0, 'from': 0.0}] +
              [{'type': 'poi', 'geo': [p['lat'], p['lon']], 'icon': p['icon'], 'color': p['color'], 'label': p['name'], 'sub': f"{km(p)} km · {p['min']} phút", 'side': SIDE.get(p['name'], 0), 'from': 1.2 + i * 0.6} for i, p in enumerate(pois)] +
              [{'type': 'chapter', 'text': 'Kết nối trung tâm', 'from': 0.0, 'y': 300},
               {'type': 'checklist', 'title': 'Lái xe khoảng', 'y': 1230, 'from': 2.6, 'stagger': 0.3, 'items': [f"{p['name']} · {km(p)} km · {p['min']} phút" for p in pois]},
               {'type': 'note', 'text': 'km, phút: ước tính OSRM lúc đường vắng · Đường: © OpenStreetMap', 'x': 540, 'align': 'center', 'y': 1560, 'size': 22, 'from': 2.6}],
     sfx=[{'t': 1.3 + i * 0.6, 'kind': 'pop', 'gain': 0.35} for i in range(len(pois))])
# 6. zoom vào lô A, khoanh khối nhà
shot(7.0, view=[{'t': 0, 'lat': G[0], 'lon': G[1], 'zoom': 15.2}, {'t': 2.6, 'lat': 9.99445, 'lon': 105.78415, 'zoom': 18.4}, {'t': 7.0, 'lat': 9.99445, 'lon': 105.78415, 'zoom': 18.6, 'ease': 'linear'}],
     tilt=[{'t': 0, 'deg': 38}, {'t': 2.6, 'deg': 48}, {'t': 7, 'deg': 52}],
     elements=[{'type': 'satmap'},
               {'type': 'area', 'path': LOT, 'color': '#F6C33B', 'fillAlpha': 0.3, 'pulse': True, 'dashed': False, 'width': 8, 'from': 2.4},
               {'type': 'poi', 'geo': [9.99445, 105.78415], 'icon': 'building', 'color': 'gold', 'label': 'Block EHomeS', 'sub': 'khối nhà ≈ 2.200 m²*', 'labelSize': 44, 'from': 2.8},
               {'type': 'chapter', 'text': 'Lô A', 'sub': 'Nhà ở xã hội EHomeS · Nam Long 2', 'from': 2.6, 'y': 300},
               {'type': 'checklist', 'title': 'Vị trí', 'y': 1150, 'from': 3.4, 'stagger': 0.3,
                'items': ['Ngay đầu nam hồ trung tâm', 'Góc đường N3 · D7', 'Trong khu Nam Long II Central Lake']},
               {'type': 'cta', 'text': 'Liên hệ', 'key': 'Nhận thông tin', 'y': 1470, 'from': 4.8},
               {'type': 'note', 'text': '*Đo ước tính trên ảnh vệ tinh Esri, không phải số liệu pháp lý', 'x': 540, 'align': 'center', 'y': 1580, 'size': 22, 'from': 3.0}],
     sfx=[{'t': 2.9, 'kind': 'pop', 'gain': 0.4}, {'t': 4.9, 'kind': 'chime', 'gain': 0.35}])

scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 'bds-tien-ich', 'satmap': 'sat/satmap.json', 'shots': shots}
json.dump(scene, open(os.path.join(D, 'scene.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('scene.json', round(t, 1), 's')
