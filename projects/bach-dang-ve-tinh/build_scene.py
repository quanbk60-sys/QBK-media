#!/usr/bin/env python3
"""Sinh scene.json (phong cách ve-tinh) từ captions-audio.json. Chạy: python3 build_scene.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
LEAD = 0.15
caps = json.load(open('captions-audio.json'))
T = lambda i: round(caps[i]['start'] + LEAD, 2)          # thời điểm bắt đầu cụm i (giây video)
CR = {v['path']: f"{v['author']} · {v['license']} · Wikimedia Commons" for v in json.load(open('photos/commons.json')).values()}
P = lambda name: 'photos/' + name

RIVER = [[20.975, 106.7685], [20.96, 106.770], [20.95, 106.7704], [20.94, 106.770], [20.93, 106.771], [20.92, 106.770], [20.91, 106.7676], [20.90, 106.762],
         [20.89, 106.7575], [20.88, 106.756], [20.87, 106.7578], [20.86, 106.7616], [20.85, 106.766], [20.845, 106.773], [20.839, 106.786], [20.833, 106.804],
         [20.828, 106.8208], [20.816, 106.832], [20.802, 106.835], [20.791, 106.836]]   # tâm dòng, dò trên ảnh Esri z14
UP = RIVER[::-1][:-4]                                     # từ biển ngược lên (dừng trước 20.94)
STAKES938 = [[20.9035 + k * 0.0004, 106.7645 + k * 0.0016] for k in range(9)]   # minh họa
STAKES1288 = [[20.934 + a, 106.7705 + b] for a, b in [(0, 0), (0.0012, 0.0018), (-0.001, 0.0035), (0.0004, 0.0052)]] + \
             [[20.925 + a, 106.769 + b] for a, b in [(0, 0), (0.0011, 0.0019), (-0.0008, 0.0036)]] + \
             [[20.9385 + a, 106.781 + b] for a, b in [(0, 0), (-0.0012, 0.0016), (0.0006, 0.0031)]]
YENGIANG = [20.941, 106.779]
QUANGYEN_AREA = [[20.952, 106.768], [20.952, 106.80], [20.928, 106.80], [20.922, 106.785], [20.926, 106.766]]

def view(*keys): return [dict(zip(('t', 'lat', 'lon', 'zoom'), k)) for k in keys]
def title(t, kicker=None, sub=None, **kw): return {'type': 'title', 'title': t, **({'kicker': kicker} if kicker else {}), **({'sub': sub} if sub else {}), 'y': 300, **kw}
def photo(name, **kw): return {'type': 'photo', 'path': P(name), 'credit': CR[name], **kw}
SAT = {'type': 'satmap'}

shots = []
def shot(i0, i1, **kw):
    start = shots[-1]['end'] if shots else 0
    end = T(i1) if i1 is not None else round(caps[-1]['end'] + LEAD + 0.9, 2)
    shots.append({'start': start, 'end': end, **kw}); return end - start

# 1. Nhìn từ vũ trụ, nó chỉ là một vệt nước nhỏ.
d = shot(0, 2, view=view((0, 14, 112, 2.25), (T(2) - 0.0, 20.75, 106.95, 5.4)),
         elements=[{'type': 'stars'}, {'type': 'globe'}, title('Một vệt nước nhỏ', 'Nhìn từ vũ trụ', from_=0)],
         sfx=[{'t': 0.05, 'kind': 'wind', 'dur': 2.2, 'gain': 0.25}, {'t': 0.9, 'kind': 'whoosh', 'gain': 0.35}])
# 2. Nhưng dòng sông này gắn với ba lần đánh bại quân xâm lược.
d = shot(2, 4, view=view((0, 20.75, 106.95, 5.4), (3.0, 20.885, 106.775, 12.3), (3.7, 20.885, 106.775, 12.4)),
         elements=[SAT, {'type': 'clouds', 'n': 5, 'y0': 750, 'y1': 1300, 'to': 2.4, 'exit': 'fade', 'opacity': 0.7},
                   {'type': 'route', 'path': RIVER, 'color': 'orange', 'width': 11, 'grow': {'at': 2.3, 'dur': 1.3}},
                   title('3 lần', 'Một dòng sông', 'đánh bại quân xâm lược', from_=0.2, size=150)],
         sfx=[{'t': 0.1, 'kind': 'whoosh', 'gain': 0.5}, {'t': 2.3, 'kind': 'chime', 'gain': 0.3}])
# 3. Sông Bạch Đằng, giữa Quảng Ninh và Hải Phòng.
d = shot(4, 6, view=view((0, 20.885, 106.775, 12.4), (d, 20.885, 106.775, 12.55)),
         elements=[SAT, {'type': 'route', 'path': RIVER, 'color': 'orange', 'width': 11},
                   {'type': 'tag', 'text': 'HẢI PHÒNG', 'geo': [20.905, 106.715], 'from': 0.15, 'size': 34},
                   {'type': 'tag', 'text': 'QUẢNG NINH', 'geo': [20.955, 106.815], 'from': 0.45, 'size': 34},
                   {'type': 'marker', 'geo': [20.915, 106.7685], 'label': 'SÔNG BẠCH ĐẰNG', 'side': -1},
                   title('Sông Bạch Đằng', 'Giữa Quảng Ninh và Hải Phòng')],
         sfx=[{'t': 0.05, 'kind': 'pop', 'gain': 0.4}])
# 4. Lần thứ nhất, năm 938.
d = shot(6, 7, view=view((0, 20.885, 106.775, 12.55), (d, 20.875, 106.763, 13.2)),
         elements=[SAT, title('938', 'Lần thứ nhất', 'Ngô Quyền · Nam Hán', size=170),
                   photo('model-of-battle-in-bach-dang-river-in-938-ad-dsc05544.jpg', y=1000, w=860, caption='MÔ HÌNH TRẬN BẠCH ĐẰNG 938', **{'from': 0.5})],
         sfx=[{'t': 0.05, 'kind': 'gong', 'gain': 0.45}, {'t': 0.55, 'kind': 'whoosh', 'gain': 0.3}])
# 5. Ngô Quyền đóng cọc gỗ bịt sắt xuống lòng sông.
d = shot(7, 9, view=view((0, 20.875, 106.763, 13.2), (d, 20.885, 106.760, 13.6)),
         elements=[SAT, {'type': 'dots', 'points': STAKES938, 'color': 'orange', 'size': 12, 'stagger': 0.12, 'from': 0.3},
                   {'type': 'tag', 'text': 'BÃI CỌC (MINH HỌA)', 'geo': [20.907, 106.781], 'align': 'left', 'from': 1.3, 'size': 26},
                   title('Cọc gỗ', 'Ngô Quyền', 'đầu bịt sắt'),
                   {'type': 'note', 'text': '*Vị trí bãi cọc năm 938 chưa xác định, hình chỉ minh họa', 'y': 1330, 'from': 0.8}],
         sfx=[{'t': 0.35 + k * 0.24, 'kind': 'hammer', 'gain': 0.3} for k in range(8)])
# 6. Triều lên, cọc chìm, ông nhử thủy quân Nam Hán vào sâu.
d = shot(9, 12, view=view((0, 20.885, 106.760, 13.6), (d, 20.872, 106.768, 13.25)),
         elements=[SAT, {'type': 'dots', 'points': STAKES938, 'color': 'orange', 'size': 12, 'enter': 'none', 'track': [{'t': 0, 'alpha': 1}, {'t': 0.8, 'alpha': 0.18}]},
                   {'type': 'tag', 'text': 'TRIỀU LÊN', 'geo': [20.913, 106.776], 'align': 'left', 'from': 0.3, 'bg': 'blue', 'color': 'white', 'size': 28},
                   {'type': 'route', 'path': UP, 'color': 'blue', 'width': 10, 'head': 'arrow', 'grow': {'at': 0.9, 'dur': 2.4}, 'label': 'THỦY QUÂN NAM HÁN', 'labelAt': 0.25, 'labelDx': 140},
                   title('Nhử giặc', 'Triều lên · cọc chìm')],
         sfx=[{'t': 0.1, 'kind': 'splash', 'gain': 0.35}, {'t': 1.0, 'kind': 'drum', 'gain': 0.35}, {'t': 2.0, 'kind': 'drum', 'gain': 0.35}])
# 7. Triều rút, thuyền giặc đâm cọc vỡ tan, Lưu Hoằng Tháo bỏ mạng.
d = shot(12, 15, view=view((0, 20.872, 106.768, 13.25), (1.2, 20.895, 106.760, 13.9), (d, 20.897, 106.759, 14.0)),
         elements=[SAT, {'type': 'route', 'path': UP, 'color': 'blue', 'width': 10, 'head': 'arrow', 'track': [{'t': 0, 'alpha': 1}, {'t': 1.4, 'alpha': 1}, {'t': 2.2, 'alpha': 0.25}]},
                   {'type': 'dots', 'points': STAKES938, 'color': 'orange', 'size': 12, 'stagger': 0.05, 'from': 0.2},
                   {'type': 'tag', 'text': 'TRIỀU RÚT', 'geo': [20.910, 106.772], 'align': 'left', 'from': 0.1, 'size': 28},
                   {'type': 'tag', 'text': 'THUYỀN GIẶC VỠ TAN', 'geo': [20.899, 106.752], 'align': 'right', 'from': 1.1, 'bg': 'red', 'color': 'white', 'size': 28},
                   title('Triều rút', 'Lưu Hoằng Tháo bỏ mạng', 'giặc thua to')],
         sfx=[{'t': 0.1, 'kind': 'splash', 'gain': 0.4}, {'t': 1.0, 'kind': 'crack', 'gain': 0.5}, {'t': 1.25, 'kind': 'crack', 'gain': 0.4}, {'t': 1.6, 'kind': 'thud', 'gain': 0.4}])
# 8. Lần thứ hai, năm 981.
d = shot(15, 16, view=view((0, 20.897, 106.759, 14.0), (d, 21.1, 106.9, 9.0)),
         elements=[SAT, title('981', 'Lần thứ hai', 'Lê Hoàn · quân Tống', size=190)],
         sfx=[{'t': 0.05, 'kind': 'gong', 'gain': 0.45}, {'t': 0.2, 'kind': 'whoosh', 'gain': 0.45}])
# 9. Quân Tống kéo sang, thủy quân tiến vào Bạch Đằng.
SONG_LAND = [[22.6, 106.95], [22.1, 106.78], [21.85, 106.76], [21.55, 106.55], [21.3, 106.35]]
SONG_SEA = [[21.62, 108.2], [21.35, 107.85], [21.0, 107.35], [20.82, 106.98], [20.84, 106.80]]
d = shot(16, 18, view=view((0, 21.1, 106.9, 9.0), (d, 21.4, 107.3, 7.7)),
         elements=[SAT, {'type': 'route', 'path': SONG_LAND, 'color': 'blue', 'width': 9, 'dashed': True, 'head': 'arrow', 'grow': {'at': 0.15, 'dur': 1.6}, 'label': 'ĐƯỜNG BỘ', 'labelAt': 0.45, 'labelDx': 120},
                   {'type': 'route', 'path': SONG_SEA, 'color': 'blue', 'width': 11, 'head': 'arrow', 'grow': {'at': 0.7, 'dur': 1.5}, 'label': 'THỦY QUÂN TỐNG', 'labelAt': 0.35, 'labelDy': -60},
                   {'type': 'marker', 'geo': [20.88, 106.77], 'label': 'BẠCH ĐẰNG', 'side': -1, 'from': 1.4},
                   title('Quân Tống', 'Năm 981', 'thủy bộ cùng tiến'),
                   {'type': 'note', 'text': '*Hướng tiến quân chỉ minh họa', 'y': 1330, 'from': 0.5}],
         sfx=[{'t': 0.2, 'kind': 'drum', 'gain': 0.4}, {'t': 0.8, 'kind': 'drum', 'gain': 0.4}, {'t': 1.4, 'kind': 'drum', 'gain': 0.4}])
# 10. Lê Hoàn đánh bại quân Tống, tướng Hầu Nhân Bảo bị giết.
d = shot(18, 20, view=view((0, 21.4, 107.3, 7.7), (d, 21.3, 107.2, 7.9)),
         elements=[SAT, {'type': 'route', 'path': SONG_LAND, 'color': 'blue', 'width': 9, 'dashed': True, 'head': 'arrow', 'track': [{'t': 0, 'alpha': 1}, {'t': 1.0, 'alpha': 0.2}]},
                   {'type': 'route', 'path': SONG_SEA, 'color': 'blue', 'width': 11, 'head': 'arrow', 'track': [{'t': 0, 'alpha': 1}, {'t': 1.0, 'alpha': 0.2}]},
                   photo('le-general-le-hoan-hoa-lu-4365684079.jpg', y=960, w=620, ratio=1.0, focus=[0.5, 0.3], caption='TƯỢNG LÊ HOÀN · HOA LƯ', **{'from': 0.15}),
                   title('Lê Hoàn', 'Đánh bại quân Tống', 'Hầu Nhân Bảo bị giết')],
         sfx=[{'t': 0.2, 'kind': 'whoosh', 'gain': 0.3}, {'t': 1.6, 'kind': 'cheer', 'gain': 0.2}])
# 11. Lần thứ ba, năm 1288, quân Nguyên Mông.
d = shot(20, 22, view=view((0, 21.3, 107.2, 7.9), (d, 20.90, 106.77, 11.8)),
         elements=[SAT, title('1288', 'Lần thứ ba', 'quân Nguyên Mông', size=190)],
         sfx=[{'t': 0.05, 'kind': 'gong', 'gain': 0.45}, {'t': 0.3, 'kind': 'whoosh', 'gain': 0.45}])
# 12. Trần Hưng Đạo dùng lại kế cũ: cọc gỗ và thủy triều.
d = shot(22, 24, view=view((0, 20.90, 106.77, 11.8), (d, 20.905, 106.77, 12.1)),
         elements=[SAT, photo('tran-hung-dao-1129-1300-defeated-mongol-invasion-at-bach-dan.jpg', y=840, w=560, ratio=1.05, focus=[0.5, 0.35], caption='TRẦN HƯNG ĐẠO', **{'from': 0.1}),
                   {'type': 'stats', 'y': 1240, 'w': 640, 'from': 1.1, 'items': [{'icon': 'stake', 'value': 'CỌC GỖ'}, {'icon': 'water', 'value': 'THỦY TRIỀU'}], 'valueSize': 46},
                   title('Trần Hưng Đạo', 'Dùng lại kế cũ')],
         sfx=[{'t': 1.1, 'kind': 'pop', 'gain': 0.4}, {'t': 1.4, 'kind': 'pop', 'gain': 0.4}])
# 13. Thuyền Nguyên bị giữ chân đến khi nước ròng, cọc nhô lên, thuyền vỡ đắm hàng loạt.
r1 = [[20.86, 106.760], [20.88, 106.754], [20.90, 106.760], [20.915, 106.767], [20.928, 106.769]]
r2 = [[20.855, 106.766], [20.875, 106.759], [20.895, 106.760], [20.912, 106.769], [20.931, 106.773]]
r3 = [[20.865, 106.763], [20.885, 106.758], [20.905, 106.765], [20.92, 106.771], [20.936, 106.778]]
t_ro = T(25) - T(24)   # "đến khi nước ròng"
t_coc = T(26) - T(24)  # "cọc nhô lên"
d = shot(24, 28, view=view((0, 20.905, 106.77, 12.1), (d, 20.915, 106.770, 13.4)),
         elements=[SAT] + [{'type': 'route', 'path': r, 'color': 'blue', 'width': 8, 'head': 'arrow', 'grow': {'at': 0.1 + k * 0.2, 'dur': 1.4}, 'track': [{'t': 0, 'alpha': 1}, {'t': t_coc + 0.6, 'alpha': 1}, {'t': t_coc + 1.4, 'alpha': 0.25}]} for k, r in enumerate([r1, r2, r3])] +
                  [{'type': 'tag', 'text': 'NƯỚC RÒNG', 'geo': [20.935, 106.745], 'align': 'right', 'from': t_ro, 'size': 28},
                   {'type': 'dots', 'points': STAKES1288, 'color': 'orange', 'size': 11, 'stagger': 0.06, 'from': t_coc},
                   {'type': 'tag', 'text': 'THUYỀN VỠ ĐẮM HÀNG LOẠT', 'geo': [20.92, 106.79], 'align': 'left', 'from': t_coc + 0.7, 'bg': 'red', 'color': 'white', 'size': 26},
                   title('Nước ròng', 'Giữ chân thuyền Nguyên', 'cọc nhô lên')],
         sfx=[{'t': 0.2, 'kind': 'drum', 'gain': 0.35}, {'t': t_ro, 'kind': 'splash', 'gain': 0.4}, {'t': t_coc + 0.5, 'kind': 'crack', 'gain': 0.5}, {'t': t_coc + 0.8, 'kind': 'crack', 'gain': 0.45}, {'t': t_coc + 1.1, 'kind': 'thud', 'gain': 0.45}])
# 14. Tướng Nguyên Ô Mã Nhi bị bắt sống.
d = shot(28, 30, view=view((0, 20.915, 106.770, 13.4), (d, 20.915, 106.770, 13.55)),
         elements=[SAT, photo('stakes-used-to-repel-mongol-invasion-at-bach-dang-river-1288.jpg', y=960, w=620, ratio=0.95, focus=[0.5, 0.75], caption='CỌC THẬT TRẬN 1288 · BẢO TÀNG', **{'from': 0.1}),
                   title('Bắt sống', 'Tướng Nguyên', 'Ô Mã Nhi')],
         sfx=[{'t': 0.1, 'kind': 'whoosh', 'gain': 0.3}, {'t': 1.4, 'kind': 'thud', 'gain': 0.4}])
# 15. Và những chiếc cọc ấy vẫn còn.
d = shot(30, 31, view=view((0, 20.915, 106.770, 13.55), (d, 20.938, 106.782, 14.3)),
         elements=[SAT, title('Vẫn còn', 'Sau hơn 700 năm')], sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.35}])
# 16. Ở Quảng Yên, khảo cổ tìm thấy ba bãi cọc: Yên Giang, Đồng Má Ngựa, Đồng Vạn Muối.
ty = T(32) - T(31) + 1.05; tm = T(33) - T(31); tv = tm + 1.05
d = shot(31, 34, view=view((0, 20.938, 106.782, 14.3), (d, 20.938, 106.782, 14.0)),
         elements=[SAT, {'type': 'area', 'path': QUANGYEN_AREA, 'color': 'orange', 'pulse': True, 'from': 0.2},
                   {'type': 'marker', 'geo': [20.948, 106.792], 'label': 'QUẢNG YÊN', 'side': 1, 'from': 0.1},
                   {'type': 'tag', 'text': 'YÊN GIANG', 'icon': True, 'x': 66, 'y': 690, 'align': 'left', 'from': ty, 'size': 34},
                   {'type': 'tag', 'text': 'ĐỒNG MÁ NGỰA', 'icon': True, 'x': 66, 'y': 790, 'align': 'left', 'from': tm, 'size': 34},
                   {'type': 'tag', 'text': 'ĐỒNG VẠN MUỐI', 'icon': True, 'x': 66, 'y': 890, 'align': 'left', 'from': tv, 'size': 34},
                   title('3 bãi cọc', 'Khảo cổ ở Quảng Yên'),
                   {'type': 'note', 'text': '*Vùng khoanh chỉ minh họa khu vực, không phải ranh giới bãi cọc', 'y': 1330, 'from': 0.6}],
         sfx=[{'t': ty, 'kind': 'pop', 'gain': 0.45}, {'t': tm, 'kind': 'pop', 'gain': 0.45}, {'t': tv, 'kind': 'pop', 'gain': 0.45}])
# 17. Đo tuổi bằng các-bon phóng xạ: thế kỷ mười ba, khớp năm 1288.
t13 = T(35) - T(34); t88 = T(36) - T(34)
d = shot(34, 37, view=view((0, 20.938, 106.782, 14.0), (d, 20.938, 106.782, 13.8)),
         elements=[SAT, {'type': 'shade', 'top': 0.7, 'bottom': 0.9},
                   {'type': 'stats', 'y': 860, 'stagger': 0, 'items': [{'icon': 'clock', 'value': 'C14', 'label': 'đo tuổi cọc gỗ'}], 'w': 360, 'valueSize': 80},
                   {'type': 'stats', 'y': 1110, 'from': t13, 'w': 900, 'stagger': t88 - t13, 'items': [{'icon': 'calendar', 'value': 'THẾ KỶ 13', 'label': 'niên đại'}, {'icon': 'flag', 'value': '1288', 'label': 'khớp trận Bạch Đằng'}], 'valueSize': 54},
                   title('Các-bon 14', 'Đo tuổi bằng phóng xạ')],
         sfx=[{'t': 0.1, 'kind': 'pop', 'gain': 0.4}, {'t': t13, 'kind': 'pop', 'gain': 0.4}, {'t': t88, 'kind': 'chime', 'gain': 0.4}])
# 18. Ở Yên Giang, bạn còn tận mắt thấy cọc lộ thiên.
d = shot(37, 39, view=view((0, 20.938, 106.782, 13.8), (d, 20.941, 106.779, 14.9)),
         elements=[SAT, {'type': 'marker', 'geo': YENGIANG, 'label': 'BÃI CỌC YÊN GIANG', 'side': 1, 'from': 0.4},
                   title('Lộ thiên', 'Yên Giang · Quảng Yên', 'tận mắt thấy cọc'),
                   {'type': 'note', 'text': '*Vị trí gần đúng', 'y': 1330, 'from': 0.8}],
         sfx=[{'t': 0.4, 'kind': 'pop', 'gain': 0.4}])
# 19. Một dòng sông, ba chiến thắng, trải suốt ba trăm năm mươi năm.
d = shot(39, 41, elements=[photo('cua-song-bach-dang.jpg', full=True, kenburns=1.12, dim=0.35, focus=[0.5, 0.5]),
                           title('350 năm', 'Một dòng sông · ba chiến thắng', size=170, kickerSize=52),
                           {'type': 'stats', 'y': 1150, 'from': 0.5, 'items': [{'icon': 'ship', 'value': '938', 'label': 'Ngô Quyền'}, {'icon': 'crown', 'value': '981', 'label': 'Lê Hoàn'}, {'icon': 'flag', 'value': '1288', 'label': 'Trần Hưng Đạo'}]}],
         sfx=[{'t': 0.5, 'kind': 'pop', 'gain': 0.4}, {'t': 0.8, 'kind': 'pop', 'gain': 0.4}, {'t': 1.1, 'kind': 'pop', 'gain': 0.4}])
# 20. Theo bạn, trận nào đáng nể nhất?
d = shot(41, None, view=view((0, 20.885, 106.775, 12.4), (3.2, 20.9, 106.8, 9.6)),
         elements=[SAT, {'type': 'route', 'path': RIVER, 'color': 'orange', 'width': 11}, {'type': 'clouds', 'n': 4, 'y0': 820, 'y1': 1320, 'from': 1.6, 'enterDur': 1.0, 'opacity': 0.6},
                   title('Trận nào', 'Theo bạn', 'đáng nể nhất?', align='center', size=150),
                   {'type': 'tag', 'text': 'BÌNH LUẬN: 938 · 981 · 1288', 'x': 540, 'y': 1180, 'from': 0.9, 'bg': 'orange', 'color': 'white', 'size': 34}],
         sfx=[{'t': 0.1, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.9, 'kind': 'pop', 'gain': 0.45}])

# "from_" trong title(): đổi thành "from"
for sh in shots:
    for e in sh['elements']:
        if 'from_' in e: e['from'] = e.pop('from_')
scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 've-tinh', 'satmap': 'sat/satmap.json', 'textFollowsCamera': True,
         'narration': {'path': 'audio/narration.wav', 'lead': LEAD},
         'captions': {'path': 'captions-audio.json', 'lead': LEAD, 'y': 1450, 'size': 60},
         'shots': shots}
json.dump(scene, open('scene.json', 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots,', shots[-1]['end'], 's')
