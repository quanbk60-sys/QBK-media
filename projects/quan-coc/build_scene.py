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
    end = T(i1) if i1 is not None else round(caps[-1]['end'] + LEAD + 2.6, 2)
    shots.append({'start': start, 'end': end, **kw}); return round(end - start, 2)

# ===== PHẦN 1: VỆ TINH =====
# 0-1 "Ê ê! Tới Cần Thơ mà / chưa biết chỗ nào lai rai ngon hả?"
d = shot(1, view=view((0, 14, 112, 2.3), (T(1), 10.1, 105.8, 5.4)),
         elements=[{'type': 'stars'}, {'type': 'globe'}, title('Cần Thơ', 'Ê ê, tới', from_=0)], sfx=[pop(0.1, 0.25)])
d = shot(2, view=view((0, 10.1, 105.8, 5.4), (d, 10.04, 105.78, 11.2)),
         elements=[SAT, {'type': 'clouds', 'n': 5, 'y0': 700, 'y1': 1300, 'opacity': 0.7}, title('Lai rai\nchỗ nào ngon?', 'Mà chưa biết', size=104, typeDur=0.6)])
# 2-3 "Đứng yên đó, tui chỉ cho nè!"
d = shot(4, view=view((0, 10.04, 105.78, 11.2), (d, 10.0345, 105.7885, 16.2)),
         elements=[SAT, {'type': 'clouds', 'n': 4, 'y0': 800, 'y1': 1300, 'to': 0.9, 'opacity': 0.6}, title('Tui chỉ nè!', 'Đứng yên đó', size=120)],
         sfx=[pop(T(3) - T(2))])
# 4-6 "Từ Bến Ninh Kiều, chạy lên Hai Bà Trưng, dọc bờ sông."
t_hbt = T(5) - T(4)
d = shot(7, view=view((0, 10.0345, 105.7885, 16.2), (d, 10.0350, 105.7884, 17.2)),
         elements=[SAT, {'type': 'marker', 'geo': BEN, 'label': 'BẾN NINH KIỀU', 'side': 1, 'from': 0.05},
                   route(A, head='dot', grow={'at': t_hbt - 0.2, 'dur': d - t_hbt}),
                   {'type': 'tag', 'text': 'HAI BÀ TRƯNG', 'geo': [10.03440, 105.78885], 'dx': 30, 'align': 'left', 'from': t_hbt, 'size': 32},
                   {'type': 'tag', 'text': 'BỜ SÔNG', 'geo': [10.0336, 105.7897], 'align': 'left', 'from': T(6) - T(4), 'bg': 'blue', 'color': 'white', 'size': 26},
                   title('Bến Ninh Kiều', 'Từ', size=104, to=t_hbt - 0.05), title('Hai Bà Trưng', 'Chạy lên', 'dọc bờ sông', size=104, from_=t_hbt)],
         sfx=[pop(0.1)])
# 7 "Tới Ngô Gia Tự, quẹo trái."
d = shot(8, view=view((0, 10.0350, 105.7884, 17.2), (d, 10.0355, 105.7882, 17.3)),
         elements=[SAT, route(A), route(B, head='arrow', grow={'at': 0.3, 'dur': d - 0.35}),
                   {'type': 'tag', 'text': 'QUẸO TRÁI', 'geo': TURN, 'dx': 40, 'align': 'left', 'from': 0.05, 'bg': 'orange', 'color': 'white', 'size': 34},
                   {'type': 'tag', 'text': 'NGÔ GIA TỰ', 'geo': [10.0358, 105.78826], 'dx': 34, 'align': 'left', 'from': 0.5, 'size': 32},
                   title('Quẹo trái', 'Tới Ngô Gia Tự', size=120)], sfx=[pop(0.05)])
# 8-9 "Chạy thẳng, băng qua đường Hòa Bình."
d = shot(10, view=view((0, 10.0355, 105.7882, 17.3), (d, 10.0364, 105.7876, 17.6)),
         elements=[SAT, route(A), route(B), route(C, head='arrow', grow={'at': 0.2, 'dur': d - 0.25}),
                   {'type': 'tag', 'text': 'ĐƯỜNG HÒA BÌNH', 'geo': [10.0359, 105.7871], 'dx': -20, 'align': 'right', 'from': T(9) - T(8), 'bg': 'blue', 'color': 'white', 'size': 30},
                   title('Băng qua\nHòa Bình', 'Chạy thẳng', size=104, typeDur=0.5)])
# 10-11 "Tới góc Nguyễn Đình Chiểu, ngó qua tay phải..."
t_ph = T(11) - T(10)
d = shot(12, view=view((0, 10.0364, 105.7876, 17.6), (1.3, 10.03712, 105.78712, 18.6), (d, 10.03712, 105.78712, 18.75)),
         elements=[SAT, route(FULL, head='arrow'),
                   {'type': 'tag', 'text': 'NGUYỄN ĐÌNH CHIỂU', 'geo': [10.03692, 105.78672], 'align': 'right', 'dx': -10, 'from': 0.2, 'size': 30},
                   {'type': 'tag', 'text': 'BÊN TAY PHẢI', 'geo': [10.03700, 105.78718], 'align': 'left', 'dx': 30, 'from': t_ph, 'bg': 'orange', 'color': 'white', 'size': 32},
                   {'type': 'marker', 'geo': QUAN, 'label': 'QUÁN CÓC', 'side': 0, 'size': 2.0, 'labelSize': 44, 'labelBg': 'teal', 'labelColor': 'white', 'from': t_ph + 0.1},
                   title('Góc Nguyễn\nĐình Chiểu', 'Tới', size=96, typeDur=0.6)],
         sfx=[pop(t_ph + 0.1, 0.35)])
# 12 "Tới rồi đó!" — video thật: đi tới góc quán
d = shot(13, elements=[vid('ngay-di-toi', 24.0, kenburns=1.04),
                       stk(['TỚI RỒI ĐÓ!'], shape='burst', x=540, y=430, bg='habeco', outline='crimson', rotate=-0.08, shake=True, lines=[{'text': 'TỚI', 'size': 100, 'color': 'crimson'}, {'text': 'RỒI ĐÓ!', 'size': 100, 'color': 'crimson'}], **{'from': 0.05})],
         sfx=[{'t': 0.05, 'kind': 'chime', 'gain': 0.35}])

# ===== PHẦN 2: BẢNG HIỆU QUÁN =====
WARN = {'type': 'note', 'text': 'Người dưới 18 tuổi không sử dụng rượu bia · Đã uống rượu bia không lái xe', 'x': 540, 'align': 'center', 'y': 1880, 'size': 22}
# 13-15 "Quán Cóc, số 16 Nguyễn Đình Chiểu, chưa tới 500 mét từ bến." — video đêm
t16, t500 = T(14) - T(13), T(15) - T(13)
d = shot(16, elements=[vid('dem-mat-tien', 0.8, kenburns=1.06, shade=True),
                       stk([{'text': 'QUÁN NHẬU', 'size': 44, 'font': 'italic'}, {'text': 'CÓC', 'size': 150, 'color': 'habeco'}], x=540, y=330, bg='teal', rotate=-0.06, **{'from': 0.0}),
                       stk(['16 NGUYỄN ĐÌNH CHIỂU'], x=540, y=560, bg='crimson', rotate=0.03, lines=[{'text': '16 NGUYỄN ĐÌNH CHIỂU', 'size': 54}], **{'from': t16}),
                       stk(['< 500 M'], shape='pill', x=540, y=1270, bg='habeco', outline='white', rotate=-0.03, lines=[{'text': 'CÁCH BẾN < 500 M', 'size': 52, 'color': 'crimson'}], **{'from': t500}), WARN],
         sfx=[pop(0.05, 0.35), pop(t16), pop(t500)])
# 16-17 "Món bình dân mà món nào cũng cuốn nha!"
t_cuon = T(17) - T(16)
d = shot(18, elements=[{'type': 'backdrop', 'color': 'habeco', 'color2': 'white', 'pattern': 'rays', 'patternAlpha': 0.35, 'enter': 'wipe'},
                       photo('mat-tien-habeco.jpg', y=1000, w=760, ratio=0.85, focus=[0.3, 0.45], frameColor='white', rotate=-0.04, **{'from': 0.1}),
                       stk(['MÓN BÌNH DÂN'], x=540, y=330, bg='crimson', rotate=-0.05, lines=[{'text': 'MÓN BÌNH DÂN', 'size': 96, 'color': 'habeco'}], **{'from': 0.05}),
                       stk(['CUỐN!'], shape='burst', x=820, y=620, bg='teal', outline='white', rotate=0.12, shake=True, lines=[{'text': 'MÓN NÀO', 'size': 46}, {'text': 'CŨNG CUỐN!', 'size': 46, 'color': 'habeco'}], **{'from': t_cuon}), WARN],
         sfx=[pop(0.1), pop(t_cuon, 0.35)])
# 18-25 dàn món: ảnh tách nền viền trắng bay vào trên nền màu, cắt theo nhịp lời
def dish2(img, name, color, pattern, bg, slide, extra=(), **kw):
    return dict(elements=[{'type': 'backdrop', 'color': color, 'color2': 'white', 'pattern': pattern, 'patternAlpha': 0.2},
                          cut(img, slide=slide, rotate=kw.get('rot', -0.04), **kw.get('cutkw', {})),
                          stk(name, x=540, y=kw.get('ny', 330), bg=bg, rotate=kw.get('nrot', -0.04), lines=[{'text': n, 'size': kw.get('nsize', 92)} for n in name], **{'from': 0.05}),
                          *extra, WARN], sfx=[pop(0.05)])
d = shot(19, **dish2('chan-ga', ['CHÂN GÀ CHIÊN'], 'teal', 'dots', 'crimson', 'left', nsize=84))
d = shot(20, **dish2('oc', ['ỐC NÈ!'], 'crimson', 'stripes', 'teal', 'right', nsize=110, rot=0.05))
d = shot(21, **dish2('kho-muc-2', ['KHÔ MỰC', 'CHIÊN TIÊU'], 'habeco', 'rays', 'crimson', 'bottom', nsize=88, cutkw={'w': 820, 'y': 1060}))
d = shot(22, **dish2('khoai-mon', ['KHOAI MÔN CHIÊN'], 'teal', 'rays', 'crimson', 'left', nsize=80,
                     extra=[stk(['GIÒN RỤM!'], shape='burst', x=850, y=700, bg='habeco', outline='crimson', rotate=0.14, shake=True, lines=[{'text': 'GIÒN', 'size': 58, 'color': 'crimson'}, {'text': 'RỤM!', 'size': 58, 'color': 'crimson'}], **{'from': 0.5})]))
d = shot(23, **dish2('kho-qua', ['KHỔ QUA', 'CHÀ BÔNG'], 'crimson', 'dots', 'teal', 'right', nsize=88, cutkw={'y': 1080},
                     extra=[stk(['MÁT RƯỢI!'], shape='burst', x=240, y=720, bg='white', outline='teal', rotate=-0.14, shake=True, lines=[{'text': 'MÁT', 'size': 56, 'color': 'teal'}, {'text': 'RƯỢI!', 'size': 56, 'color': 'teal'}], **{'from': T(22) - T(22) + 0.6})]))
d = shot(24, **dish2('bo-luc-lac-2', ['BÒ LÚC LẮC'], 'habeco', 'stripes', 'crimson', 'left', nsize=96))
d = shot(25, **dish2('hot-vit-lon-2', ['HỘT VỊT LỘN', 'XÀO ME'], 'teal', 'rays', 'crimson', 'bottom', nsize=84, cutkw={'w': 760, 'y': 1080}))
# 25 "kể hoài không hết!" — ảnh món cũ bay vào dồn dập
d = shot(26, elements=[{'type': 'backdrop', 'color': 'crimson', 'color2': 'habeco', 'pattern': 'rays', 'patternAlpha': 0.25, 'spin': 0.5},
                       photo('dau-hu-sa.jpg', x=300, y=760, w=430, ratio=1.0, frameColor='white', rotate=-0.1, slide='left'),
                       photo('ngheu-thai.jpg', x=780, y=820, w=430, ratio=1.0, frameColor='white', rotate=0.08, slide='right', **{'from': 0.12}),
                       photo('kho-muc.jpg', x=540, y=1130, w=460, ratio=0.9, frameColor='white', rotate=-0.03, **{'from': 0.24}),
                       stk(['KỂ HOÀI', 'KHÔNG HẾT!'], x=540, y=330, bg='habeco', outline='white', rotate=-0.05, shake=True, lines=[{'text': 'KỂ HOÀI', 'size': 90, 'color': 'crimson'}, {'text': 'KHÔNG HẾT!', 'size': 90, 'color': 'crimson'}], **{'from': 0.0}), WARN],
         sfx=[pop(0.0), pop(0.12), pop(0.24)])
# 26-27 "Mà khoan, tin nóng! Từ 22/11 tới 6/12,"
t_ngay = T(27) - T(26)
d = shot(28, elements=[{'type': 'backdrop', 'color': 'crimson', 'color2': 'habeco', 'pattern': 'rays', 'patternAlpha': 0.25, 'spin': 0.4},
                       stk(['TIN NÓNG!'], shape='burst', x=540, y=620, bg='habeco', outline='white', rotate=-0.08, shake=True, lines=[{'text': 'TIN', 'size': 120, 'color': 'crimson'}, {'text': 'NÓNG!', 'size': 120, 'color': 'crimson'}], **{'from': 0.0}),
                       stk(['22/11 – 6/12'], x=540, y=1150, bg='white', color='crimson', outline='crimson', rotate=0.03, lines=[{'text': 'TỪ 22/11', 'size': 90, 'color': 'crimson'}, {'text': 'ĐẾN 6/12', 'size': 90, 'color': 'crimson'}], **{'from': t_ngay}), WARN],
         sfx=[{'t': 0.0, 'kind': 'drum', 'gain': 0.4}, pop(0.08, 0.35), pop(t_ngay, 0.35)])
# 28-29 "hóa đơn 500 nghìn, tặng liền một dĩa bò viên."
t_tang = T(29) - T(28)
d = shot(30, elements=[{'type': 'backdrop', 'color': 'habeco', 'color2': 'white', 'pattern': 'rays', 'patternAlpha': 0.35},
                       photo('qua-bo-vien.jpg', y=700, w=760, ratio=0.9, focus=[0.5, 0.55], frameColor='white', rotate=-0.04, **{'from': t_tang - 0.1}),
                       {'type': 'coupon', 'x': 540, 'y': 1230, 'w': 900, 'h': 300, 'top': 'HÓA ĐƠN 500K', 'bottom': 'TẶNG 1 DĨA BÒ VIÊN', 'from': 0.0},
                       {'type': 'confetti', 'from': t_tang, 'n': 60}, WARN],
         sfx=[pop(0.05), pop(t_tang - 0.1, 0.35), {'t': t_tang, 'kind': 'chime', 'gain': 0.3}])
# 30-31 "Hóa đơn 1 triệu rưỡi, tặng luôn một dĩa sườn bò!"
t_tang = T(31) - T(30)
d = shot(32, elements=[{'type': 'backdrop', 'color': 'teal', 'color2': 'habeco', 'pattern': 'rays', 'patternAlpha': 0.2},
                       photo('qua-suon-bo.jpg', y=700, w=760, ratio=0.9, focus=[0.5, 0.5], frameColor='white', rotate=0.04, **{'from': t_tang - 0.1}),
                       {'type': 'coupon', 'x': 540, 'y': 1230, 'w': 900, 'h': 300, 'top': 'HÓA ĐƠN 1.500K', 'bottom': 'TẶNG 1 DĨA SƯỜN BÒ', 'slide': 'right', 'from': 0.0},
                       {'type': 'confetti', 'from': t_tang, 'n': 80, 'seed': 4}, WARN],
         sfx=[pop(0.05), pop(t_tang - 0.1, 0.35), {'t': t_tang, 'kind': 'chime', 'gain': 0.3}])
# 32 "Rủ cạ cứng đi liền đi!" — video khách ngồi quán đêm mưa
d = shot(33, elements=[vid('mua-khach', 4.0, kenburns=1.05),
                       stk(['RỦ CẠ CỨNG', 'ĐI LIỀN!'], x=540, y=360, bg='crimson', rotate=-0.05, shake=True, lines=[{'text': 'RỦ CẠ CỨNG', 'size': 92, 'color': 'habeco'}, {'text': 'ĐI LIỀN!', 'size': 92}], **{'from': 0.05}), WARN],
         sfx=[pop(0.05, 0.35)])
# 33-34 "Mà nhớ nha, có uống thì đừng lái xe đó!" + màn kết
d = shot(None, elements=[photo('hoang-hon.jpg', full=True, focus=[0.4, 0.5], kenburns=1.08, dim=0.35),
                         stk([{'text': 'QUÁN NHẬU', 'size': 44, 'font': 'italic'}, {'text': 'CÓC', 'size': 150, 'color': 'habeco'}], x=540, y=330, bg='teal', rotate=-0.05, **{'from': 0.0}),
                         stk(['16 NGUYỄN ĐÌNH CHIỂU'], x=540, y=560, bg='crimson', rotate=0.02, lines=[{'text': '16 NGUYỄN ĐÌNH CHIỂU', 'size': 50}, {'text': 'P. NINH KIỀU, CẦN THƠ', 'size': 36, 'font': 'bold'}], **{'from': 0.2}),
                         stk(['0938 543 698'], shape='pill', x=540, y=760, bg='habeco', color='crimson', outline='white', rotate=-0.02, lines=[{'text': 'ĐT 0938 543 698', 'size': 56, 'color': 'crimson'}], **{'from': 0.4}),
                         stk(['KM'], x=540, y=930, bg='white', outline='crimson', rotate=0.03, lines=[{'text': 'KHUYẾN MÃI 22/11 – 6/12', 'size': 40, 'color': 'crimson'}], **{'from': 0.6}),
                         stk(['ĐÃ UỐNG RƯỢU BIA', 'KHÔNG LÁI XE'], x=540, y=1200, bg='crimson', rotate=0, wobble=False, lines=[{'text': 'ĐÃ UỐNG RƯỢU BIA', 'size': 46}, {'text': 'KHÔNG LÁI XE', 'size': 46, 'color': 'habeco'}], **{'from': 0.8}),
                         {'type': 'note', 'text': 'Người dưới 18 tuổi không sử dụng rượu bia', 'x': 540, 'align': 'center', 'y': 1880, 'size': 24}],
         sfx=[pop(0.05), pop(0.25), pop(0.45), pop(0.65)])

for sh in shots:
    for e in sh['elements']:
        if 'from_' in e: e['from'] = e.pop('from_')
scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 've-tinh', 'satmap': 'sat/satmap.json', 'textFollowsCamera': True,
         'narration': {'path': 'audio/narration.wav', 'lead': LEAD},
         'music': {'path': 'audio/music.wav', 'gain': 0.16},
         'captions': {'path': 'captions-audio.json', 'lead': LEAD, 'y': 1530, 'size': 60},
         'shots': shots}
json.dump(scene, open('scene.json', 'w'), ensure_ascii=False, indent=1)
print(len(shots), 'shots,', shots[-1]['end'], 's')
