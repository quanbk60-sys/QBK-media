#!/usr/bin/env python3
"""Sinh scene3d.json (engine3d, phong cách thi-nghiem 3D) cho "Làm đá thời cổ đại". Chạy: python3 build_scene3d.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
LEAD = 0  # tiếng tách từ video cũ đã gồm sẵn độ trễ đầu
caps = json.load(open('captions-audio.json'))
T = lambda i: round(caps[i]['start'] + LEAD, 2)
END = round(caps[-1]['end'] + LEAD + 0.8, 2)
shots = []
def shot(t0, t1, **kw):
    shots.append({'start': t0, 'end': t1, **kw})
def cam(*keys): return [{'t': t, 'pos': p, 'target': g} for t, p, g in keys]
def label(text, at, frm, to=None): return {'type': 'label', 'text': text, 'at': at, 'from': frm, **({'to': to} if to else {})}
def title(text, kicker=None, frm=0.15, to=None): return {'type': 'title', 'text': text, **({'kicker': kicker} if kicker else {}), 'from': frm, **({'to': to} if to else {})}
rel = lambda i, s: round(T(i) - s, 2)

DESERT = [{'type': 'ground', 'material': 'sand', 'size': 160, 'tile': 6},
          {'type': 'dune', 'w': 26, 'h': 4, 'd': 14, 'at': [-24, 0, -30]}, {'type': 'dune', 'w': 30, 'h': 5, 'd': 16, 'at': [22, 0, -38]}, {'type': 'dune', 'w': 18, 'h': 3, 'd': 10, 'at': [30, 0, 6]}]
YARD = DESERT + [{'type': 'channel', 'length': 9, 'width': 0.6, 'at': [-6.5, 0, 0]},
                 {'type': 'pool', 'size': [6, 3], 'depth': 0.3, 'at': [1, 0, 0]},
                 {'type': 'wall', 'size': [9, 4.2, 0.8], 'at': [1, 0, -2.4]}]
TABLE = [{'type': 'ground', 'material': 'stone', 'size': 40, 'tile': 3}, {'type': 'board', 'size': [3.2, 2], 'h': 0.8}]

# 1. Cách đây 2.400 năm, giữa sa mạc Ba Tư nóng bỏng
s0, s1 = 0, T(2)
shot(s0, s1, time='day', objects=DESERT + [{'type': 'dome', 'r': 4, 'h': 8, 'at': [4, 0, -12]}, {'type': 'wall', 'size': [16, 4, 0.8], 'at': [-6, 0, -10]}, {'type': 'tree', 'kind': 'cypress', 'h': 6, 'at': [10, 0, -9]}],
     camera=cam((0, [-6, 1.6, 10], [3, 3, -10]), (s1, [-3, 2.4, 6], [3, 3.5, -12])),
     texts=[title('2.400 năm trước', 'Ba Tư cổ đại', 0.2, s1 - 0.2)])
# 2. người ta vẫn có đá lạnh
s0, s1 = T(2), T(3)
shot(s0, s1, time='studio', objects=TABLE + [{'type': 'ice', 'size': [0.5, 0.32, 0.4], 'at': [-0.3, 0.85, 0.1]}, {'type': 'ice', 'size': [0.42, 0.28, 0.38], 'at': [0.32, 0.85, -0.1], 'rot': [0, 25, 0]}, {'type': 'steam', 'at': [0, 1.1, 0], 'w': 0.8, 'h': 0.8, 'size': 0.6}],
     camera=cam((0, [1.2, 1.7, 1.6], [0, 0.95, 0]), (s1 - s0, [0.9, 1.45, 1.25], [0, 0.95, 0])))
# 3. Không tủ lạnh, không điện, vậy họ làm đá bằng cách nào?
s0, s1 = T(3), T(5)
shot(s0, s1, time='studio', objects=TABLE + [{'type': 'ice', 'size': [0.55, 0.35, 0.45], 'at': [0, 0.85, 0], 'track': [{'t': 0, 'rot': [0, 0, 0]}, {'t': s1 - s0, 'rot': [0, 70, 0], 'ease': 'linear'}]}],
     camera=cam((0, [0, 1.6, 1.9], [0, 1, 0]), (s1 - s0, [0, 1.35, 1.35], [0, 1, 0])),
     texts=[title('Làm đá thế nào?', 'Không tủ lạnh, không điện', rel(4, s0))])
# 4. Bước 1: dẫn nước từ kênh ngầm Qanat về những hồ nông có tường cao che nắng
s0, s1 = T(5), T(9)
shot(s0, s1, time='day', objects=YARD,
     camera=cam((0, [-11, 2.2, 4], [-6, 0.2, 0]), (rel(7, s0), [-5, 3, 6], [0, 0.3, 0]), (s1 - s0, [-1, 4.5, 8.5], [1, 1.2, -1])),
     texts=[title('Bước 1', 'Dẫn nước', 0.1, rel(6, s0)), label('KÊNH NGẦM QANAT', [-6.5, 0.4, 0], rel(6, s0)), label('HỒ NÔNG', [1, 0.6, 0.5], rel(7, s0)), label('TƯỜNG CAO CHE NẮNG', [1, 4.4, -2.4], rel(8, s0))])
# 5. Bước 2: chờ đêm xuống... nhiệt thoát dần lên trời đêm và nước bắt đầu đóng băng
s0, s1 = T(9), T(13)
pool_night = dict(YARD[-2], track=[{'t': 0, 'freeze': 0}, {'t': rel(12, s0), 'freeze': 0.15}, {'t': s1 - s0, 'freeze': 1}])
shot(s0, s1, time='night', objects=YARD[:-2] + [pool_night, YARD[-1], {'type': 'stars'}, {'type': 'moon', 'at': [-40, 60, -160]},
                                                 {'type': 'steam', 'at': [1, 0.3, 0.3], 'w': 5, 'h': 4, 'size': 1.2, 'track': [{'t': 0, 'on': 0}, {'t': rel(11, s0), 'on': 0.9}, {'t': s1 - s0, 'on': 0.3}]}],
     camera=cam((0, [4, 3.2, 8], [1, 0.8, 0]), (s1 - s0, [3, 4.5, 5.5], [1, 0.3, 0])),
     texts=[title('Bước 2', 'Chờ đêm xuống', 0.1, rel(10, s0)), label('KHÔNG KHÍ RẤT KHÔ', [-2, 2.5, 0], rel(10, s0), rel(11, s0)), label('NHIỆT THOÁT LÊN TRỜI', [1, 3.2, 0.3], rel(11, s0), rel(12, s0) + 0.6), label('ĐÓNG BĂNG', [1, 0.6, 0.6], rel(12, s0) + 0.4)])
# 6. Sáng sớm, thợ thu lấy những tấm đá
s0, s1 = T(13), T(15)
pool_ice = dict(YARD[-2], freeze=1)
slabs = [{'type': 'ice', 'size': [0.9, 0.12, 0.6], 'at': [4.6, 0.12 * k, 1.2], 'track': [{'t': 0, 'grow': 0}, {'t': 0.4 + k * 0.35, 'grow': 0}, {'t': 0.7 + k * 0.35, 'grow': 1}]} for k in range(4)]
shot(s0, s1, time='dusk', objects=YARD[:-2] + [pool_ice, YARD[-1]] + slabs,
     camera=cam((0, [7, 2.2, 5], [3, 0.4, 0.5]), (s1 - s0, [6.4, 1.8, 3.8], [3.6, 0.4, 0.8])),
     texts=[title('Sáng sớm', None, 0.1), label('NHỮNG TẤM ĐÁ', [4.6, 0.9, 1.2], rel(14, s0))])
# 7. Bước 3: chuyển đá vào Yakhchal, ngôi nhà hình nón khổng lồ
s0, s1 = T(15), T(18)
move = [{'type': 'ice', 'size': [0.7, 0.3, 0.5], 'at': [6, 0, 6], 'track': [{'t': 0.3 * k, 'at': [7 + k, 0, 8 + k * 0.6]}, {'t': 2.2 + 0.3 * k, 'at': [0.6 * (k - 1), 0, 4.4]}]} for k in range(3)]
shot(s0, s1, time='day', objects=DESERT + [{'type': 'dome', 'r': 4.2, 'h': 9, 'at': [0, 0, 0]}, {'type': 'tree', 'kind': 'cypress', 'h': 6, 'at': [-7, 0, -2]}] + move,
     camera=cam((0, [12, 2.5, 14], [0, 3, 0]), (s1 - s0, [8, 3.5, 10], [0, 4, 0])),
     texts=[title('Bước 3', 'Cất đá', 0.1, rel(16, s0)), label('YAKHCHAL', [0, 9.6, 0], rel(16, s0)), label('NHÀ HÌNH NÓN KHỔNG LỒ', [0, 4, 4.3], rel(17, s0))])
# 8. Tường làm bằng vữa Sarooj, trộn cát, đất sét, lòng trắng trứng, vôi, lông dê và tro
s0, s1 = T(18), T(22)
y = 0.85
mats = [('CÁT', {'type': 'pile', 'material': 'sand', 'r': 0.28, 'h': 0.22}, [-1.1, y, 0.35], rel(19, s0)),
        ('ĐẤT SÉT', {'type': 'pile', 'color': '#9b5a38', 'r': 0.28, 'h': 0.22}, [-0.4, y, 0.35], rel(19, s0) + 0.7),
        ('LÒNG TRẮNG TRỨNG', {'type': 'bowl', 'r': 0.22, 'material': 'clay', 'fill': '#f2efe2'}, [0.35, y, 0.35], rel(20, s0)),
        ('VÔI', {'type': 'pile', 'color': '#eeeeea', 'r': 0.26, 'h': 0.2}, [1.1, y, 0.35], rel(20, s0) + 0.7),
        ('LÔNG DÊ', {'type': 'hay', 'r': 0.28, 'at': None}, [-0.55, y, -0.4], rel(20, s0) + 1.3),
        ('TRO', {'type': 'pile', 'color': '#8d8b86', 'r': 0.26, 'h': 0.18}, [0.55, y, -0.4], rel(21, s0))]
objs = TABLE[:]
for name, o, at, t in mats:
    o = {k: v for k, v in o.items() if v is not None}; o['at'] = at; o['track'] = [{'t': 0, 'scale': 0.001}, {'t': max(0, t - 0.25), 'scale': 0.001}, {'t': t + 0.15, 'scale': 1}]; objs.append(o)
objs.append({'type': 'egg', 'at': [0.62, y, 0.55]})
shot(s0, s1, time='studio', objects=objs, camera=cam((0, [0, 3.0, 3.1], [0, 0.75, -0.1]), (s1 - s0, [0, 2.7, 2.7], [0, 0.75, -0.1])),
     texts=[title('Vữa Sarooj', None, 0.1, rel(19, s0))] + [label(n, [a[0], a[1] + 0.36, a[2]], t) for n, _, a, t in mats])
# 9. Vữa này chống thấm, cách nhiệt quanh năm và tường dày cỡ 2 m
s0, s1 = T(22), T(25)
shot(s0, s1, time='day', objects=DESERT + [{'type': 'section', 'size': [3.5, 2.6, 2], 'at': [0, 0, 0]}, {'type': 'dome', 'r': 4, 'h': 8, 'at': [0, 0, -14]}],
     camera=cam((0, [6.5, 3.2, 6], [0, 1.6, 0]), (s1 - s0, [5.6, 3.0, 5.2], [0.3, 1.7, 0])),
     texts=[label('CHỐNG THẤM', [-1, 2.9, 1], rel(22, s0)), label('CÁCH NHIỆT', [0.6, 2.9, -1], rel(23, s0)), label('DÀY CỠ 2 M', [1.9, 3.1, 0], rel(24, s0)),
            {'type': 'note', 'text': '*Độ dày tường: các nguồn ghi khác nhau', 'from': rel(24, s0)}])
# 10. Nhờ vậy, đá nằm lại qua cả mùa hè
s0, s1 = T(25), T(26)
stack = [{'type': 'ice', 'size': [0.8, 0.35, 0.6], 'at': [x, -2 + 0.35 * yy, z]} for yy in range(3) for x, z in [(-0.5, 0), (0.45, 0.1), (0, -0.6)]]
shot(s0, s1, time='day', objects=[{'type': 'ground', 'material': 'sand', 'size': 120, 'tile': 6, 'hole': 2.4}, {'type': 'pit', 'r': 2.4, 'depth': 2.2}] + stack,
     camera=cam((0, [0.5, 3.6, 3.2], [0, -1.6, 0]), (s1 - s0, [0.3, 3.0, 2.4], [0, -1.6, 0])),
     texts=[title('Qua cả mùa hè', None, 0.1)])
# 11. để giữ thức ăn và làm món tráng miệng
s0, s1 = T(26), T(28)
shot(s0, s1, time='studio', objects=TABLE + [{'type': 'jar', 's': 0.55, 'at': [-0.85, 0.85, -0.25]}, {'type': 'ice', 'size': [0.45, 0.25, 0.35], 'at': [-0.15, 0.85, -0.3]},
                                            {'type': 'bowl', 'r': 0.3, 'material': 'clay', 'ice': True, 'topping': '#b8323a', 'at': [0.55, 0.85, 0.2]}],
     camera=cam((0, [0, 1.9, 2.1], [0, 1, 0]), (s1 - s0, [0.4, 1.6, 1.6], [0.3, 0.95, 0])),
     texts=[label('GIỮ THỨC ĂN', [-0.5, 1.45, -0.3], rel(26, s0)), label('MÓN TRÁNG MIỆNG', [0.55, 1.45, 0.2], rel(27, s0))])
# 12. Một số Yakhchal ở Kerman vẫn còn đứng đến hôm nay
s0, s1 = T(28), T(30)
shot(s0, s1, time='day', objects=DESERT + [{'type': 'dome', 'r': 4.4, 'h': 9.5, 'at': [0, 0, 0]}, {'type': 'tree', 'kind': 'cypress', 'h': 6, 'at': [-6, 0, 3]}, {'type': 'tree', 'kind': 'cypress', 'h': 5, 'at': [6.5, 0, 2]}, {'type': 'wall', 'size': [10, 3, 0.6], 'at': [0, 0, -7]}],
     camera=cam((0, [-14, 3, 12], [0, 4, 0]), (s1 - s0, [-6, 2.5, 16], [0, 4.5, 0])),
     texts=[label('KERMAN, IRAN', [0, 10.2, 0], 0.3), {'type': 'note', 'text': 'Mô phỏng 3D, không phải ảnh chụp', 'from': 0.3}])
# 13. Nếu không có điện, bạn sẽ làm đá thế nào?
s0 = T(30)
shot(s0, END, time='studio', objects=TABLE + [{'type': 'ice', 'size': [0.55, 0.35, 0.45], 'at': [0, 0.85, 0], 'track': [{'t': 0, 'rot': [0, 0, 0]}, {'t': END - s0, 'rot': [0, 60, 0], 'ease': 'linear'}]}, {'type': 'steam', 'at': [0, 1.15, 0], 'w': 0.5, 'h': 0.6, 'size': 0.5}],
     camera=cam((0, [0, 1.5, 1.7], [0, 1, 0]), (END - s0, [0, 1.4, 1.4], [0, 1, 0])),
     texts=[title('Bạn làm thế nào?', 'Nếu không có điện', 0.3)])

scene = {'fps': 30, 'layout': 'blurband', 'narration': {'path': 'audio/from-app.wav', 'lead': LEAD}, 'captions': {'path': 'captions-audio.json', 'lead': LEAD}, 'shots': shots}
json.dump(scene, open('scene3d.json', 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots', END, 's')
