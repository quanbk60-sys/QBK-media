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
def stk(_lines, **kw):
    kw.setdefault('lines', [l if isinstance(l, dict) else {'text': l} for l in _lines])
    return {'type': 'sticker', **kw}

shots = []
def shot(i1, **kw):
    start = shots[-1]['end'] if shots else 0
    end = T(i1) if i1 is not None else round(caps[-1]['end'] + LEAD + 2.6, 2)
    shots.append({'start': start, 'end': end, **kw}); return round(end - start, 2)

# ===== PHẦN 1: VỆ TINH =====
# 0-1 "Ê, tới Cần Thơ mà / chưa biết chỗ nào lai rai ngon hả?"
d = shot(1, view=view((0, 14, 112, 2.3), (T(1), 10.1, 105.8, 5.4)),
         elements=[{'type': 'stars'}, {'type': 'globe'}, title('Cần Thơ', 'Ê, tới', from_=0)],
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.45}])
d = shot(2, view=view((0, 10.1, 105.8, 5.4), (d, 10.04, 105.78, 11.2)),
         elements=[SAT, {'type': 'clouds', 'n': 5, 'y0': 700, 'y1': 1300, 'opacity': 0.7},
                   title('Lai rai\nchỗ nào ngon?', 'Mà chưa biết', size=104, typeDur=0.6)],
         sfx=[{'t': 0.1, 'kind': 'whoosh', 'gain': 0.5}])
# 2-3 "Đứng yên đó, để tui chỉ cho!"
d = shot(4, view=view((0, 10.04, 105.78, 11.2), (d, 10.0345, 105.7885, 15.6)),
         elements=[SAT, {'type': 'clouds', 'n': 4, 'y0': 800, 'y1': 1300, 'to': 0.9, 'opacity': 0.6},
                   title('Để tui chỉ!', 'Đứng yên đó', size=120)],
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.45}, {'t': 0.75, 'kind': 'pop', 'gain': 0.35}])
# 4 "Đây là Bến Ninh Kiều nè."
d = shot(5, view=view((0, 10.0345, 105.7885, 15.6), (d, 10.0343, 105.7887, 17.0)),
         elements=[SAT, {'type': 'marker', 'geo': BEN, 'label': 'BẾN NINH KIỀU', 'side': 1, 'from': 0.1},
                   title('Bến Ninh Kiều', 'Xuất phát', size=112)],
         sfx=[{'t': 0.1, 'kind': 'pop', 'gain': 0.45}])
# 5-6 "Chạy lên đường Hai Bà Trưng, dọc theo bờ sông."
d = shot(7, view=view((0, 10.0343, 105.7887, 17.0), (d, 10.0350, 105.7884, 17.2)),
         elements=[SAT, {'type': 'marker', 'geo': BEN, 'size': 1.1, 'enter': 'none', 'pulse': False},
                   route(A, head='dot', grow={'at': 0.15, 'dur': d - 0.4}),
                   {'type': 'tag', 'text': 'HAI BÀ TRƯNG', 'geo': [10.03425, 105.78875], 'dx': 30, 'align': 'left', 'from': 0.3, 'size': 32},
                   {'type': 'tag', 'text': 'BỜ SÔNG HẬU', 'geo': [10.0338, 105.7896], 'align': 'left', 'from': 1.3, 'bg': 'blue', 'color': 'white', 'size': 26},
                   title('Hai Bà Trưng', 'Chạy lên', 'dọc bờ sông', size=110)],
         sfx=[{'t': 0.15, 'kind': 'whoosh', 'gain': 0.3}])
# 7 "Tới Ngô Gia Tự thì quẹo trái."
d = shot(8, view=view((0, 10.0350, 105.7884, 17.2), (d, 10.0355, 105.7882, 17.3)),
         elements=[SAT, route(A), route(B, head='arrow', grow={'at': 0.35, 'dur': d - 0.4}),
                   {'type': 'tag', 'text': 'QUẸO TRÁI', 'geo': TURN, 'dx': 40, 'align': 'left', 'from': 0.05, 'bg': 'orange', 'color': 'white', 'size': 34},
                   {'type': 'tag', 'text': 'NGÔ GIA TỰ', 'geo': [10.0358, 105.78826], 'dx': 34, 'align': 'left', 'from': 0.6, 'size': 32},
                   title('Quẹo trái', 'Tới Ngô Gia Tự', size=120)],
         sfx=[{'t': 0.05, 'kind': 'pop', 'gain': 0.4}])
# 8-9 "Chạy thẳng, băng qua đường Hòa Bình."
d = shot(10, view=view((0, 10.0355, 105.7882, 17.3), (d, 10.0364, 105.7876, 17.6)),
         elements=[SAT, route(A), route(B), route(C, head='arrow', grow={'at': 0.25, 'dur': d - 0.3}),
                   {'type': 'tag', 'text': 'ĐƯỜNG HÒA BÌNH', 'geo': [10.0359, 105.7871], 'dx': -20, 'align': 'right', 'from': 0.9, 'bg': 'blue', 'color': 'white', 'size': 30},
                   title('Băng qua\nHòa Bình', 'Chạy thẳng', size=104, typeDur=0.6)],
         sfx=[{'t': 0.2, 'kind': 'whoosh', 'gain': 0.35}])
# 10-12 "Tới góc Nguyễn Đình Chiểu, ngó qua tay phải. Tới rồi đó!"
t_toi = T(12) - T(10)
d = shot(13, view=view((0, 10.0364, 105.7876, 17.6), (1.6, 10.03712, 105.78712, 18.6), (d, 10.03712, 105.78712, 18.75)),
         elements=[SAT, route(FULL, head='arrow'),
                   {'type': 'tag', 'text': 'NGUYỄN ĐÌNH CHIỂU', 'geo': [10.03692, 105.78672], 'align': 'right', 'dx': -10, 'from': 0.2, 'size': 30},
                   {'type': 'tag', 'text': 'BÊN TAY PHẢI', 'geo': [10.03700, 105.78718], 'align': 'left', 'dx': 30, 'from': T(11) - T(10), 'bg': 'orange', 'color': 'white', 'size': 32},
                   {'type': 'marker', 'geo': QUAN, 'label': 'QUÁN CÓC', 'side': 0, 'size': 2.0, 'labelSize': 44, 'labelBg': 'teal', 'labelColor': 'white', 'from': t_toi - 0.2},
                   title('Góc Nguyễn\nĐình Chiểu', 'Tới', size=96, to=t_toi - 0.1, typeDur=0.6),
                   title('Tới rồi đó!', 'Quán Cóc', size=120, from_=t_toi)],
         sfx=[{'t': T(11) - T(10), 'kind': 'pop', 'gain': 0.4}, {'t': t_toi - 0.2, 'kind': 'chime', 'gain': 0.45}])
# 13-14 "Từ bến lên chừng 500 mét, chạy xe cái vèo là tới."
d = shot(15, view=view((0, 10.03712, 105.78712, 18.75), (d, 10.0349, 105.7880, 17.0)),
         elements=[SAT, route(FULL, head='arrow'),
                   {'type': 'marker', 'geo': BEN, 'size': 1.2, 'pulse': False, 'label': 'BẾN', 'side': 1, 'labelSize': 26},
                   {'type': 'marker', 'geo': QUAN, 'label': 'QUÁN CÓC', 'side': -1, 'size': 1.6, 'labelBg': 'teal', 'labelColor': 'white', 'enter': 'none'},
                   {'type': 'stats', 'y': 1290, 'w': 800, 'from': 0.3, 'items': [{'icon': 'ruler', 'value': '~500 M', 'label': 'từ Bến Ninh Kiều'}, {'icon': 'flag', 'value': '1 LẦN QUẸO', 'label': 'trái vô Ngô Gia Tự'}], 'valueSize': 56},
                   title('Cái vèo\nlà tới', 'Chừng 500 mét', size=118, typeDur=0.5)],
         sfx=[{'t': 0.3, 'kind': 'pop', 'gain': 0.4}, {'t': 0.6, 'kind': 'pop', 'gain': 0.4}, {'t': T(14) - T(13), 'kind': 'whoosh', 'gain': 0.45}])

# ===== PHẦN 2: BẢNG HIỆU QUÁN =====
WARN = {'type': 'note', 'text': 'Người dưới 18 tuổi không sử dụng rượu bia · Đã uống rượu bia không lái xe', 'x': 540, 'align': 'center', 'y': 1880, 'size': 22}
# 15-16 "Quán Cóc, số 16 Nguyễn Đình Chiểu."
d = shot(17, elements=[{'type': 'backdrop', 'color': 'teal', 'enter': 'wipe'},
                       photo('goc-quan.jpg', full=True, focus=[0.72, 0.36], kenburns=1.1, dim=0.05, enterDur=0.25, **{'from': 0.18}),
                       stk([{'text': 'QUÁN NHẬU', 'size': 44, 'font': 'italic'}, {'text': 'CÓC', 'size': 150, 'color': 'habeco'}], x=540, y=330, bg='teal', rotate=-0.06, **{'from': 0.25}),
                       stk(['16 NGUYỄN ĐÌNH CHIỂU'], x=540, y=1270, size=52, bg='crimson', rotate=0.03, lines=[{'text': '16 NGUYỄN ĐÌNH CHIỂU', 'size': 54}], **{'from': T(16) - T(15)}), WARN],
         sfx=[{'t': 0.0, 'kind': 'whoosh', 'gain': 0.5}, {'t': 0.3, 'kind': 'pop', 'gain': 0.5}, {'t': T(16) - T(15), 'kind': 'pop', 'gain': 0.45}])
# 17 "Toàn món nhậu bình dân thôi à."
d = shot(18, elements=[{'type': 'backdrop', 'color': 'habeco', 'color2': 'white', 'pattern': 'rays', 'patternAlpha': 0.35},
                       photo('mat-tien-habeco.jpg', y=900, w=820, ratio=0.95, focus=[0.3, 0.45], frameColor='white', rotate=-0.04),
                       stk(['MÓN NHẬU', 'BÌNH DÂN'], x=540, y=330, bg='crimson', rotate=-0.05, lines=[{'text': 'MÓN NHẬU', 'size': 96}, {'text': 'BÌNH DÂN', 'size': 96, 'color': 'habeco'}], **{'from': 0.15}), WARN],
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.2, 'kind': 'pop', 'gain': 0.45}])
# 18 "Bò lúc lắc khoai tây nè."
def dish(img, name, color, bg, pattern, ratio=1.1, focus=(0.5, 0.5), extra=(), slide='up', **kw):
    return dict(elements=[{'type': 'backdrop', 'color': color, 'color2': 'white', 'pattern': pattern, 'patternAlpha': 0.18},
                          photo(img, y=880, w=840, ratio=ratio, focus=list(focus), frameColor='white', rotate=kw.get('rot', -0.03), slide=slide),
                          stk(name, x=540, y=kw.get('ny', 1290), bg=bg, rotate=kw.get('nrot', 0.03), lines=[{'text': n, 'size': kw.get('nsize', 76)} for n in name], **{'from': 0.2}),
                          *extra, WARN])
d = shot(19, **dish('bo-luc-lac.jpg', ['BÒ LÚC LẮC', 'KHOAI TÂY'], 'crimson', 'brown', 'stripes', ratio=1.05, focus=(0.5, 0.55)),
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.25, 'kind': 'pop', 'gain': 0.45}])
# 19-20 "Khô mực chiên tiêu, nhai giòn rụm."
t_gion = T(20) - T(19)
d = shot(21, **dish('kho-muc.jpg', ['KHÔ MỰC', 'CHIÊN TIÊU'], 'teal', 'crimson', 'dots', ratio=1.0, focus=(0.6, 0.5), slide='right',
                    extra=[stk(['GIÒN', 'RỤM!'], shape='burst', x=830, y=560, bg='habeco', color='crimson', outline='crimson', rotate=0.12, shake=True, lines=[{'text': 'GIÒN', 'size': 64, 'color': 'crimson'}, {'text': 'RỤM!', 'size': 64, 'color': 'crimson'}], **{'from': t_gion})]),
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.25, 'kind': 'pop', 'gain': 0.45}, {'t': t_gion, 'kind': 'crack', 'gain': 0.35}])
# 21-22 "Hột vịt lộn xào me, đậu hũ chiên sả."
t_dh = T(22) - T(21)
d = shot(23, elements=[{'type': 'backdrop', 'color': 'habeco', 'color2': 'crimson', 'pattern': 'dots', 'patternAlpha': 0.12},
                       photo('hot-vit-lon.jpg', x=380, y=620, w=560, ratio=1.0, focus=[0.5, 0.5], frameColor='white', rotate=-0.07, slide='left'),
                       photo('dau-hu-sa.jpg', x=690, y=1060, w=560, ratio=1.0, focus=[0.55, 0.55], frameColor='white', rotate=0.06, slide='right', **{'from': t_dh}),
                       stk(['HỘT VỊT LỘN XÀO ME'], x=400, y=960, bg='crimson', rotate=-0.04, lines=[{'text': 'HỘT VỊT LỘN XÀO ME', 'size': 52}], **{'from': 0.2}),
                       stk(['ĐẬU HŨ CHIÊN SẢ'], x=650, y=1390, bg='teal', rotate=0.03, lines=[{'text': 'ĐẬU HŨ CHIÊN SẢ', 'size': 52}], **{'from': t_dh + 0.2}), WARN],
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.25, 'kind': 'pop', 'gain': 0.45}, {'t': t_dh, 'kind': 'whoosh', 'gain': 0.4}, {'t': t_dh + 0.2, 'kind': 'pop', 'gain': 0.45}])
# 23-24 "Thêm tô nghêu nấu Thái nữa là hết sẩy."
t_hs = T(24) - T(23)
d = shot(25, **dish('ngheu-thai.jpg', ['NGHÊU NẤU THÁI'], 'crimson', 'teal', 'rays', ratio=1.0, focus=(0.5, 0.5), nsize=70,
                    extra=[stk(['HẾT', 'SẨY!'], shape='burst', x=250, y=520, bg='habeco', outline='crimson', rotate=-0.14, shake=True, lines=[{'text': 'HẾT', 'size': 66, 'color': 'crimson'}, {'text': 'SẨY!', 'size': 66, 'color': 'crimson'}], **{'from': t_hs - 0.1})]),
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.25, 'kind': 'pop', 'gain': 0.45}, {'t': t_hs - 0.1, 'kind': 'chime', 'gain': 0.35}])
# 25-26 "Mà khoan, tin nóng nè! Từ 22/11 tới 6/12,"
t_ngay = T(26) - T(25)
d = shot(27, elements=[{'type': 'backdrop', 'color': 'crimson', 'color2': 'habeco', 'pattern': 'rays', 'patternAlpha': 0.25, 'spin': 0.4},
                       stk(['TIN NÓNG!'], shape='burst', x=540, y=620, bg='habeco', outline='white', rotate=-0.08, shake=True, lines=[{'text': 'TIN', 'size': 120, 'color': 'crimson'}, {'text': 'NÓNG!', 'size': 120, 'color': 'crimson'}], **{'from': 0.0}),
                       stk(['22/11 – 6/12'], x=540, y=1150, bg='white', color='crimson', outline='crimson', rotate=0.03, lines=[{'text': 'TỪ 22/11', 'size': 90, 'color': 'crimson'}, {'text': 'ĐẾN 6/12', 'size': 90, 'color': 'crimson'}], **{'from': t_ngay}), WARN],
         sfx=[{'t': 0.0, 'kind': 'drum', 'gain': 0.5}, {'t': 0.08, 'kind': 'pop', 'gain': 0.5}, {'t': t_ngay, 'kind': 'pop', 'gain': 0.5}])
# 27-28 "hóa đơn 500 nghìn, tặng liền một dĩa bò viên."
t_tang = T(28) - T(27)
d = shot(29, elements=[{'type': 'backdrop', 'color': 'habeco', 'color2': 'white', 'pattern': 'rays', 'patternAlpha': 0.35},
                       photo('qua-bo-vien.jpg', y=700, w=760, ratio=0.9, focus=[0.5, 0.55], frameColor='white', rotate=-0.04, **{'from': t_tang - 0.1}),
                       {'type': 'coupon', 'x': 540, 'y': 1230, 'w': 900, 'h': 300, 'top': 'HÓA ĐƠN 500K', 'bottom': 'TẶNG 1 DĨA BÒ VIÊN', 'from': 0.0},
                       {'type': 'confetti', 'from': t_tang, 'n': 60}, WARN],
         sfx=[{'t': 0.0, 'kind': 'whoosh', 'gain': 0.45}, {'t': t_tang - 0.1, 'kind': 'pop', 'gain': 0.5}, {'t': t_tang, 'kind': 'cheer', 'gain': 0.25}])
# 29-30 "Hóa đơn 1 triệu rưỡi, tặng luôn một dĩa sườn bò!"
t_tang = T(30) - T(29)
d = shot(31, elements=[{'type': 'backdrop', 'color': 'teal', 'color2': 'habeco', 'pattern': 'rays', 'patternAlpha': 0.2},
                       photo('qua-suon-bo.jpg', y=700, w=760, ratio=0.9, focus=[0.5, 0.5], frameColor='white', rotate=0.04, **{'from': t_tang - 0.1}),
                       {'type': 'coupon', 'x': 540, 'y': 1230, 'w': 900, 'h': 300, 'top': 'HÓA ĐƠN 1.500K', 'bottom': 'TẶNG 1 DĨA SƯỜN BÒ', 'slide': 'right', 'from': 0.0},
                       {'type': 'confetti', 'from': t_tang, 'n': 80, 'seed': 4}, WARN],
         sfx=[{'t': 0.0, 'kind': 'whoosh', 'gain': 0.45}, {'t': t_tang - 0.1, 'kind': 'pop', 'gain': 0.5}, {'t': t_tang, 'kind': 'cheer', 'gain': 0.3}])
# 31-34 "Rủ cạ cứng đi liền, kẻo hết chương trình nha. Mà nhớ, có uống thì đừng lái xe đó!" + màn kết
t_nho = T(33) - T(31)
d = shot(None, elements=[photo('hoang-hon.jpg', full=True, focus=[0.4, 0.5], kenburns=1.08, dim=0.35),
                         stk([{'text': 'QUÁN NHẬU', 'size': 44, 'font': 'italic'}, {'text': 'CÓC', 'size': 150, 'color': 'habeco'}], x=540, y=330, bg='teal', rotate=-0.05, **{'from': 0.0}),
                         stk(['16 NGUYỄN ĐÌNH CHIỂU'], x=540, y=560, bg='crimson', rotate=0.02, lines=[{'text': '16 NGUYỄN ĐÌNH CHIỂU', 'size': 50}, {'text': 'P. NINH KIỀU, CẦN THƠ', 'size': 36, 'font': 'bold'}], **{'from': 0.25}),
                         stk(['0938 543 698'], shape='pill', x=540, y=760, bg='habeco', color='crimson', outline='white', rotate=-0.02, lines=[{'text': 'ĐT 0938 543 698', 'size': 56, 'color': 'crimson'}], **{'from': 0.5}),
                         stk(['KM 22/11 – 6/12'], x=540, y=930, bg='white', outline='crimson', rotate=0.03, lines=[{'text': 'KHUYẾN MÃI 22/11 – 6/12', 'size': 40, 'color': 'crimson'}], **{'from': 0.75}),
                         stk(['ĐÃ UỐNG RƯỢU BIA', 'KHÔNG LÁI XE'], x=540, y=1200, bg='crimson', rotate=0, wobble=False, lines=[{'text': 'ĐÃ UỐNG RƯỢU BIA', 'size': 46}, {'text': 'KHÔNG LÁI XE', 'size': 46, 'color': 'habeco'}], **{'from': t_nho}),
                         {'type': 'note', 'text': 'Người dưới 18 tuổi không sử dụng rượu bia', 'x': 540, 'align': 'center', 'y': 1880, 'size': 24}],
         sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.1, 'kind': 'pop', 'gain': 0.45}, {'t': 0.35, 'kind': 'pop', 'gain': 0.4}, {'t': 0.6, 'kind': 'pop', 'gain': 0.4}, {'t': t_nho, 'kind': 'thud', 'gain': 0.4}])

for sh in shots:
    for e in sh['elements']:
        if 'from_' in e: e['from'] = e.pop('from_')
scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 've-tinh', 'satmap': 'sat/satmap.json', 'textFollowsCamera': True,
         'narration': {'path': 'audio/narration.wav', 'lead': LEAD},
         'captions': {'path': 'captions-audio.json', 'lead': LEAD, 'y': 1530, 'size': 60},
         'shots': shots}
json.dump(scene, open('scene.json', 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots,', shots[-1]['end'], 's')
