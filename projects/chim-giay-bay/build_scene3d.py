#!/usr/bin/env python3
"""Sinh scene3d.json cho "Chim giấy bay" (vòng 2): gấp giấy mô phỏng cứng bằng studio/engine3d/origami.js.
Chạy: python3 build_scene3d.py && (cd ../../studio/engine3d && node render3d.mjs ../../projects/chim-giay-bay/scene3d.json)"""
import json, math, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
caps = json.load(open('captions-audio.json'))
LEAD = 0.15
T = lambda i: round(caps[i]['start'] + LEAD, 2)
END = round(caps[-1]['end'] + LEAD + 2.2, 2)
S = 0.106                     # mét trên một đơn vị giấy: tờ 15 cm, đường chéo 21,2 cm
Y0 = 0.052                    # mặt bàn ở 0,05; chừa 2 mm cho các lớp giấy lệch nhau
YAW = -28                     # xoay tờ giấy cho chéo khung dọc
COLOR = '#b5121b'

def world(px, pz, at=(0, Y0, 0), yaw=YAW, py=0.0):
    """điểm trên mô hình (tọa độ giấy x, độ cao z) → tọa độ thế giới"""
    x, y, z = (px - 1) * S, pz * S, -py * S
    a = math.radians(yaw)
    return [round(at[0] + x * math.cos(a) + z * math.sin(a), 4), round(at[1] + y, 4), round(at[2] - x * math.sin(a) + z * math.cos(a), 4)]

FINAL = {'spine': 180, 'kiteL': 180, 'kiteR': 180, 'rev': 2, 'layerB': 1, 'wing': 84, 'guides': 0}
DESK = [{'type': 'ground', 'material': 'stone', 'size': 20, 'tile': 2}, {'type': 'board', 'size': [1.6, 1.0], 'h': 0}]
shots = []
def shot(t0, t1, **kw): shots.append({'start': t0, 'end': t1, 'shadowSize': 0.5, 'time': 'studio', **kw})
def cam(*keys): return [{'t': t, 'pos': p, 'target': g, **({'fov': f} if f else {})} for t, p, g, f in keys]
def title(text, kicker=None, frm=0.1, to=None, y=150): return {'type': 'title', 'text': text, 'y': y, **({'kicker': kicker} if kicker else {}), 'from': frm, **({'to': to} if to else {})}
def label(text, at, frm, to=None): return {'type': 'label', 'text': text, 'at': at, 'from': frm, **({'to': to} if to else {})}
def paper(track, **kw): return {'type': 'origami', 'color': COLOR, 'size': S, 'at': [0, Y0, 0], 'rot': [0, YAW, 0], 'track': track, **kw}

# 0. "Chỉ một tờ giấy vuông, không cắt, không dán"
s0, s1 = 0, T(2)
shot(s0, s1, objects=DESK + [paper([{'t': 0, 'spine': 0}])],
     camera=cam((0, [0.02, 0.9, 0.16], [0, Y0, 0], 42), (s1, [0.02, 0.76, 0.14], [0, Y0, 0], 42)),
     texts=[title('Gấp chim giấy', 'Một tờ giấy vuông', 0.2, s1 - 0.1), label('15 × 15 cm', world(1, 0.05, py=0.9), 0.9, s1 - 0.1)])
# 1. "bạn gấp được một chú chim" (cho xem thành phẩm trước)
s0, s1 = T(2), T(3)
shot(s0, s1, objects=DESK + [paper([{'t': 0, **FINAL}])],
     camera=cam((0, [-0.33, 0.24, 0.45], [0, 0.07, 0], 40), (s1 - s0, [0.16, 0.2, 0.52], [0, 0.07, 0], 40)),
     sfx=[{'t': 0.05, 'kind': 'chime'}])

# 2. Cảnh gấp liền một mạch (bước 1 → 5)
s0, s1 = T(3), T(20)
r = lambda x: round(x - s0, 2)
b1, b2, b3, b4, b5 = T(3), T(6), T(9), T(12), T(18)
trk = [
    {'t': 0, 'spine': 0, 'kiteL': 0, 'kiteR': 0, 'rev': 0, 'layerB': 0, 'wing': 0, 'guides': 0},
    # bước 1: gấp đôi theo đường chéo rồi mở ra (để lại nếp hơi gợn)
    {'t': r(b1 + 0.45), 'spine': 0}, {'t': r(b1 + 1.75), 'spine': 178}, {'t': r(b1 + 2.2), 'spine': 178}, {'t': r(b1 + 3.1), 'spine': 4},
    # bước 2: hai mép vào đường giữa
    {'t': r(b2 + 0.55), 'kiteL': 0, 'kiteR': 0}, {'t': r(b2 + 1.55), 'kiteL': 180}, {'t': r(b2 + 1.75), 'kiteR': 0}, {'t': r(b2 + 2.75), 'kiteR': 180},
    # bước 3: gập đôi, miết, mở ra
    {'t': r(b3 + 0.9), 'spine': 4}, {'t': r(b3 + 2.3), 'spine': 180}, {'t': r(b3 + 3.0), 'spine': 180}, {'t': r(b3 + 4.1), 'spine': 0},
    # bước 4: hiện ba nếp (cổ, đầu, đuôi), chuyển sang mode gấp ngược, gập lại
    {'t': r(b4 + 0.15), 'rev': 0, 'layerB': 0, 'guides': 0}, {'t': r(b4 + 0.16), 'rev': 2}, {'t': r(b4 + 0.4), 'layerB': 1},
    {'t': r(b4 + 0.6), 'guides': 0}, {'t': r(b4 + 1.6), 'guides': 1},
    {'t': r(T(14) - 0.2), 'spine': 0, 'guides': 1}, {'t': r(T(14) + 0.8), 'guides': 0}, {'t': r(T(17) - 0.3), 'spine': 180},
    # bước 5: hạ cánh
    {'t': r(b5 + 0.9), 'wing': 0}, {'t': r(b5 + 2.4), 'wing': FINAL['wing']},
]
hi = [0.0, 0.5, 0.18]
shot(s0, s1, objects=DESK + [paper(trk)],
     camera=cam((0, [0.02, 0.76, 0.14], [0, Y0, 0], 42),
                (r(b1 + 0.3), [0.07, 0.6, 0.36], [0, 0.06, 0], 42),           # bước 1: nhìn chéo thấy nửa giấy dựng lên
                (r(b2 + 0.3), [0.0, 0.74, 0.17], [0, Y0, 0], 42),             # bước 2: gần như từ trên xuống
                (r(b3 + 0.6), [0.14, 0.48, 0.45], [0, 0.07, 0], 42),          # bước 3
                (r(b4 + 0.3), [0.0, 0.76, 0.15], [0, Y0, 0], 42),             # bước 4: mở phẳng, xem nét đứt
                (r(T(14)), [0.0, 0.72, 0.17], [0, Y0, 0], 42),
                (r(T(15) + 0.4), [0.18, 0.3, 0.5], [0, 0.07, 0], 40),         # gập lại: nhìn ngang thấy cổ dựng lên
                (r(b5 + 0.4), [0.26, 0.28, 0.45], [0, 0.07, 0], 40),
                (r(s1), [-0.1, 0.38, 0.46], [0, 0.07, 0], 40)),
     texts=[title('Bước 1', 'Gấp đôi theo đường chéo, mở ra', r(b1), r(b2) - 0.15),
            title('Bước 2', 'Hai mép vào đường giữa', r(b2), r(b3) - 0.15),
            label('CÁNH DIỀU', world(1.2, 0.05), r(T(8)), r(b3) - 0.1),
            title('Bước 3', 'Gập đôi, miết nếp, mở ra', r(b3), r(b4) - 0.15),
            title('Bước 4', 'Gấp ngược vào trong', r(b4), r(b5) - 0.15),
            label('NẾP CỔ', world(0.55, 0.02, py=0.12), r(T(13)), r(T(14) + 0.6)),
            label('NẾP ĐUÔI', world(1.7, 0.02, py=0.08), r(T(13) + 0.5), r(T(14) + 0.6)),
            label('CỔ', world(0.66, 0.2), r(T(15) + 0.5), r(b5) - 0.1),
            label('ĐẦU', world(0.24, 0.4), r(T(16) + 0.1), r(b5) - 0.1),
            label('ĐUÔI', world(1.8, 0.42), r(T(17) + 0.1), r(b5) - 0.1),
            title('Bước 5', 'Hạ hai cánh', r(b5), r(s1) - 0.1)],
     sfx=[{'t': r(b1 + 1.6), 'kind': 'tap'}, {'t': r(b2 + 1.45), 'kind': 'tap'}, {'t': r(b2 + 2.65), 'kind': 'tap'}, {'t': r(b3 + 2.2), 'kind': 'tap'},
          {'t': r(T(17) - 0.5), 'kind': 'tap'}, {'t': r(b5 + 2.3), 'kind': 'tap'}])

# 3. "Xong rồi! Giờ thả tay" : chim cất cánh khỏi bàn
s0, s1 = T(20), T(22)
lift = [{'t': 0, **FINAL, 'at': [0, Y0, 0], 'rot': [0, YAW, 0], 'flapAmp': 0}, {'t': r(T(21)) - 0 if False else round(T(21) - s0, 2), 'at': [0, Y0, 0], 'flapAmp': 0, 'rot': [0, YAW, 0]},
        {'t': round(s1 - s0, 2), 'at': [-0.12, 0.32, -0.15], 'rot': [8, YAW + 25, 0], 'flapAmp': 30}]
shot(s0, s1, objects=DESK + [paper(lift, flapHz=2.4)],
     camera=cam((0, [-0.1, 0.36, 0.48], [0, 0.07, 0], 40), (s1 - s0, [0.08, 0.3, 0.62], [-0.08, 0.22, -0.1], 42)),
     texts=[title('Xong!', None, 0.05, round(T(21) - s0, 2), y=180)], sfx=[{'t': 0.0, 'kind': 'chime'}, {'t': round(T(21) - s0 + 0.2, 2), 'kind': 'whoosh'}])

# 4. Cánh đồng lúa chín buổi chiều: chim bay xa dần
s0, s1 = T(22), END
d = round(s1 - s0, 2)
FIELD = [{'type': 'ricefield', 'size': [16, 50], 'count': 70000, 'at': [0, 0, -14]},
         {'type': 'tree', 'h': 6, 'at': [-9, 0, -34]}, {'type': 'tree', 'h': 7, 'at': [-6, 0, -38]}, {'type': 'tree', 'h': 5, 'at': [7, 0, -36]}, {'type': 'tree', 'h': 6.5, 'at': [10, 0, -40]}]
fly = [{'t': 0, 'at': [0, 1.8, 0], 'rot': [3, -90, -5], 'ease': 'linear'}, {'t': d * 0.62, 'at': [0, 1.9, -3.4], 'rot': [3, -90, 5], 'ease': 'linear'}, {'t': d, 'at': [-0.1, 2.1, -6.2], 'rot': [-3, -86, 0]}]
shot(s0, s1, time='dusk', shadowSize=6, fogNear=10, fogFar=60,
     objects=FIELD + [paper(fly, rot=[0, -90, 0], at=[0, 1.8, 0], spine=180, kiteL=180, kiteR=180, rev=2, layerB=1, wing=58, flapAmp=32, flapHz=2.2)],
     camera=[{'t': 0, 'pos': [0.62, 1.9, 0.38], 'target': [0, 1.8, 0], 'fov': 40, 'ease': 'linear'}, {'t': d * 0.62, 'pos': [0.62, 2.0, -3.02], 'target': [0, 1.9, -3.4], 'fov': 40, 'ease': 'linear'}, {'t': d, 'pos': [0.5, 2.0, -2.7], 'target': [-0.1, 2.08, -6.2], 'fov': 36}],
     texts=[], sfx=[{'t': 0.1, 'kind': 'wind'}])

scene = {'fps': 30, 'layout': 'full', 'duration': END, 'narration': {'path': 'audio/narration.wav', 'lead': LEAD},
         'captions': {'path': 'captions-audio.json', 'lead': LEAD}, 'watermark': 'QBK', 'shots': shots}
json.dump(scene, open('scene3d.json', 'w'), ensure_ascii=False, indent=1)
print('scene3d.json', END, 's,', len(shots), 'cảnh')
