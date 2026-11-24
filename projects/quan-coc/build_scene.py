#!/usr/bin/env python3
"""Sinh scene.json cho quảng cáo Quán Cóc: phần 1 vệ tinh (chỉ đường), phần 2 "bảng hiệu quán" (ảnh thật, sticker, phiếu quà).
Chạy: python3 build_scene.py"""
import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
LEAD = 0.15
caps = json.load(open('captions-audio.json'))
T = lambda i: round(caps[i]['start'] + LEAD, 2)
P = lambda n: 'photos/' + n

# Tọa độ (OpenStreetMap, đã chồng lên ảnh Esri z18 để soát)
BEN = [10.03369, 105.78843]                 # trước Bến Ninh Kiều, đường Hai Bà Trưng
TURN = [10.03495, 105.78906]                # Hai Bà Trưng × Ngô Gia Tự (quẹo trái)
HOABINH = [10.03633, 105.78776]             # Ngô Gia Tự × Hòa Bình
CORNER = [10.03715, 105.78700]              # Ngô Gia Tự × Nguyễn Đình Chiểu
QUAN = [10.03723, 105.78712]                # Quán Cóc: góc phía đông của giao lộ
A = [BEN, [10.0343, 105.78868], [10.03474, 105.78895], TURN]
B = [TURN, [10.0357, 105.78834], HOABINH]
C = [HOABINH, [10.03673, 105.78743], [10.03694, 105.7872], CORNER]
FULL = A + B[1:] + C[1:]
NDC = [[10.03659, 105.78638], CORNER, [10.03768, 105.78757]]

def view(*k): return [dict(zip(('t', 'lat', 'lon', 'zoom'), x)) for x in k]
def title(t, kicker=None, sub=None, **kw):
    d = {'type': 'title', 'title': t, 'y': 300, **kw}
    if kicker: d['kicker'] = kicker
    if sub: d['sub'] = sub
    return d
def route(path, **kw): return {'type': 'route', 'path': path, 'color': 'orange', 'width': 13, 'smooth': False, **kw}
SAT = {'type': 'satmap'}
def photo(n, **kw): return {'type': 'photo', 'path': P(n), **kw}
def cut(n, **kw): return {'type': 'cutout', 'path': f'photos/cut/{n}-s.png', 'x': 540, 'y': 1010, 'w': 880, **kw}
def vid(n, start, **kw): return {'type': 'video', 'path': f'video/{n}', 'start': start, **kw}
def pop(t, g=0.3): return {'t': round(t, 2), 'kind': 'pop', 'gain': g}
def stk(_lines, **kw):
    kw.setdefault('lines', [l if isinstance(l, dict) else {'text': l} for l in _lines])
    return {'type': 'sticker', **kw}

shots = []
def shot(i1, **kw):
    start = shots[-1]['end'] if shots else 0
    end = T(i1) if i1 is not None else round(caps[-1]['end'] + LEAD + 3.2, 2)
    shots.append({'start': start, 'end': end, **kw}); return round(end - start, 2)

# Phong cách CHILL (vòng 3): nhịp chậm, chữ hiện mờ dần (không gõ chữ, không sticker), video người dùng quay là nền chính,
# màu ấm (tint soft-light + vignette), ảnh món hiện nhẹ không nảy, nhạc lo-fi tự tổng hợp.
WARM = 'rgba(255,170,90,0.35)'
def ct(t, kicker=None, sub=None, **kw):  # tiêu đề chill: hiện mờ, không gõ chữ
    return title(t, kicker, sub, typing=False, enter='fade', enterDur=0.7, kickerColor='#FFD27A', subColor='#FFE7B8', **{'size': 92, **kw})
def soft_tag(text, y, frm, **kw):
    return {'type': 'tag', 'text': text, 'x': 540, 'y': y, 'from': frm, 'enterDur': 0.6, 'size': 30, 'bg': 'rgba(20,16,12,0.55)', 'color': '#FFF3DC', **kw}
def V(n, start, **kw): return vid(n, start, **{'tint': WARM, 'vignette': 0.55, 'enterDur': 0.45, **kw})

# ===== PHẦN 1: VỆ TINH (chỉ đường) =====
# 0-1 "Tối nay rảnh không? Ghé Cần Thơ, lai rai chút nè."
d = shot(1, view=view((0, 14, 112, 2.3), (T(1), 10.1, 105.8, 5.4)),
         elements=[{'type': 'stars'}, {'type': 'globe'}, ct('Cần Thơ', 'Tối nay rảnh không?')])
d = shot(2, view=view((0, 10.1, 105.8, 5.4), (d, 10.04, 105.78, 11.2)),
         elements=[SAT, {'type': 'clouds', 'n': 5, 'y0': 700, 'y1': 1300, 'opacity': 0.7}, ct('Lai rai\nchút nè', 'Ghé Cần Thơ')])
# 2-4 "Từ Bến Ninh Kiều, chạy lên Hai Bà Trưng, dọc bờ sông."
t_hbt = T(3) - T(2)
d = shot(5, view=view((0, 10.04, 105.78, 11.2), (t_hbt, 10.0345, 105.7885, 16.4), (d, 10.0350, 105.7884, 17.2)),
         elements=[SAT, {'type': 'marker', 'geo': BEN, 'label': 'BẾN NINH KIỀU', 'side': 1, 'from': t_hbt - 0.6},
                   route(A, head='dot', grow={'at': t_hbt, 'dur': d - t_hbt - 0.1}),
                   {'type': 'tag', 'text': 'HAI BÀ TRƯNG', 'geo': [10.03440, 105.78885], 'dx': 30, 'align': 'left', 'from': t_hbt + 0.2, 'size': 30},
                   ct('Bến Ninh Kiều', 'Từ', to=t_hbt), ct('Hai Bà Trưng', 'Chạy lên', 'dọc bờ sông', from_=t_hbt)])
# 5 "Tới Ngô Gia Tự thì quẹo trái."
d = shot(6, view=view((0, 10.0350, 105.7884, 17.2), (d, 10.0355, 105.7882, 17.3)),
         elements=[SAT, route(A), route(B, head='arrow', grow={'at': 0.4, 'dur': d - 0.5}),
                   {'type': 'tag', 'text': 'QUẸO TRÁI', 'geo': TURN, 'dx': 40, 'align': 'left', 'from': 0.2, 'bg': 'orange', 'color': 'white', 'size': 32},
                   {'type': 'tag', 'text': 'NGÔ GIA TỰ', 'geo': [10.0358, 105.78826], 'dx': 34, 'align': 'left', 'from': 0.6, 'size': 30},
                   ct('Quẹo trái', 'Tới Ngô Gia Tự')])
# 6-7 "Chạy thẳng, qua đường Hòa Bình."
d = shot(8, view=view((0, 10.0355, 105.7882, 17.3), (d, 10.0364, 105.7876, 17.6)),
         elements=[SAT, route(A), route(B), route(C, head='arrow', grow={'at': 0.3, 'dur': d - 0.4}),
                   {'type': 'tag', 'text': 'ĐƯỜNG HÒA BÌNH', 'geo': [10.0359, 105.7871], 'dx': -20, 'align': 'right', 'from': T(7) - T(6), 'bg': 'blue', 'color': 'white', 'size': 28},
                   ct('Qua\nHòa Bình', 'Chạy thẳng')])
# 8 "Tới góc Nguyễn Đình Chiểu,"
d = shot(9, view=view((0, 10.0364, 105.7876, 17.6), (d, 10.03712, 105.78712, 18.5)),
         elements=[SAT, route(FULL, head='arrow'),
                   {'type': 'tag', 'text': 'NGUYỄN ĐÌNH CHIỂU', 'geo': [10.03692, 105.78672], 'align': 'right', 'dx': -10, 'from': 0.3, 'size': 28},
                   {'type': 'marker', 'geo': QUAN, 'label': 'QUÁN CÓC', 'side': 0, 'size': 1.8, 'labelSize': 40, 'labelBg': 'teal', 'labelColor': 'white', 'from': 0.5},
                   ct('Góc Nguyễn\nĐình Chiểu', 'Tới')])

# ===== PHẦN 2: CHILL, XOAY QUANH VIDEO QUAY THẬT =====
# 9-11 "ngó qua tay phải... là tới rồi. Quán Cóc," — video ban ngày đi tới góc quán
t_coc = T(11) - T(9)
d = shot(12, elements=[V('ngay-di-toi', 21.0, kenburns=1.04),
                       ct('Quán Cóc', 'Là tới rồi', from_=t_coc - 0.2, y=330)])
# 12-15 "số 16 Nguyễn Đình Chiểu. Cách bến chưa tới 500 mét. Chiều chiều ngồi đây, ngó phố lên đèn." — video đêm
t500, tchieu = T(13) - T(12), T(14) - T(12)
d = shot(16, elements=[V('dem-mat-tien', 0.0, kenburns=1.06),
                       ct('16 Nguyễn\nĐình Chiểu', 'Quán Cóc', size=84, to=tchieu - 0.1),
                       soft_tag('CÁCH BẾN NINH KIỀU CHƯA TỚI 500 M', 1300, t500, size=36, to=tchieu - 0.1),
                       ct('Ngó phố\nlên đèn', 'Chiều chiều ngồi đây', size=96, from_=tchieu)])
# 16-22 các món: ảnh món hiện nhẹ lần lượt trên nền video khách ngồi quán (tối đi, màu ấm), video chạy liên tục
MENU = [(16, 'chan-ga', 'CHÂN GÀ CHIÊN'), (17, 'oc', 'ỐC'), (18, 'kho-muc-2', 'KHÔ MỰC CHIÊN TIÊU'), (19, 'khoai-cao', 'KHOAI CAO CHIÊN NƯỚC MẮM'),
        (20, 'kho-qua', 'KHỔ QUA CHÀ BÔNG'), (21, 'bo-luc-lac-2', 'BÒ LÚC LẮC'), (22, 'hot-vit-lon-2', 'HỘT VỊT LỘN XÀO ME')]
base = T(16); dish_els = []
for k, (i, img, name) in enumerate(MENU):
    a = T(i) - base; b = (T(i + 1) - base) if k < len(MENU) - 1 else None
    if img == 'oc': b = T(18) - base + 0.25          # "dĩa ốc" ngắn: giữ thêm chút
    if img == 'kho-muc-2': a = T(18) - base + 0.25
    dish_els.append(photo(f'menu/{img}.jpg', x=540, y=880, w=720, ratio=1.0, focus=[0.5, 0.62], soft=True, enterDur=0.5, kenburns=1.06,
                          rotate=(-0.025 if k % 2 == 0 else 0.025), caption=name, **{'from': round(a, 2), **({'to': round(b + 0.15, 2)} if b else {})}))
d = shot(23, elements=[V('mua-khach', 0.0, dim=0.5, kenburns=1.03), *dish_els])
# 23-25 "Trời mưa cũng chẳng sao, ngồi nghe mưa với bạn bè là vui rồi." — video mưa, sáng dần (tiếp tục cùng clip)
d0 = T(23) - T(16)
d = shot(26, elements=[V('mua-khach', d0, kenburns=1.04, track=[{'t': 0, 'dim': 0.5}, {'t': 0.9, 'dim': 0.0}], enterDur=0.01),
                       ct('Nghe mưa', 'Trời mưa cũng chẳng sao', 'với bạn bè', from_=0.6)])
# 26-30 khuyến mãi: nền video ban ngày (vỉa hè, ghế vàng), ảnh quà hiện nhẹ, chữ mờ dần
tq1, tq2 = T(27) - T(26), T(29) - T(26)
d = shot(31, elements=[V('ngay-di-toi', 1.0, dim=0.45, kenburns=1.03),
                       ct('Có quà nè', 'Từ 22/11 đến 6/12', size=96, to=tq1 - 0.05),
                       ct('500K', 'Hóa đơn', 'tặng dĩa bò viên', size=130, from_=tq1, to=tq2 - 0.05),
                       photo('qua-bo-vien.jpg', y=1020, w=640, ratio=0.85, focus=[0.5, 0.55], soft=True, enterDur=0.6, rotate=-0.025, **{'from': tq1 + 0.3, 'to': tq2 + 0.1}),
                       ct('1,5 TRIỆU', 'Hóa đơn', 'tặng dĩa sườn bò', size=120, from_=tq2),
                       photo('qua-suon-bo.jpg', y=1020, w=640, ratio=0.85, focus=[0.5, 0.5], soft=True, enterDur=0.6, rotate=0.025, **{'from': tq2 + 0.3})])
# 31-32 "Rảnh thì ghé Quán Cóc ngồi chơi nha." + màn kết trên video đêm
d = shot(None, elements=[V('dem-mat-tien', 6.3, kenburns=1.05, dim=0.25),
                         ct('Quán Cóc', 'Rảnh thì ghé ngồi chơi nha', size=130, y=360),
                         soft_tag('16 NGUYỄN ĐÌNH CHIỂU, P. NINH KIỀU', 1120, 1.2, size=40),
                         soft_tag('ĐT 0938 543 698', 1230, 1.6, size=46),
                         soft_tag('KHUYẾN MÃI 22/11 – 6/12', 1335, 2.0, size=38)])

for sh in shots:
    for e in sh['elements']:
        if 'from_' in e: e['from'] = e.pop('from_')
scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 've-tinh', 'satmap': 'sat/satmap.json', 'textFollowsCamera': True,
         'narration': {'path': 'audio/narration.wav', 'lead': LEAD},
         'music': {'path': 'audio/music.wav', 'gain': 0.28},
         'captions': {'path': 'captions-audio.json', 'lead': LEAD, 'y': 1530, 'size': 56},
         'shots': shots}
json.dump(scene, open('scene.json', 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots,', shots[-1]['end'], 's')
