#!/usr/bin/env python3
"""nam-long-2-earth: demo phong cách "BĐS · Hành trình tiện ích" (bds-hanh-trinh), học từ mẫu TikTok @phandinh_phuc (16/11/2026).
Nam Long II Central Lake (Cái Răng, Cần Thơ). Km, phút: OSRM (routes.json). Nguồn: sources.md.
Chạy từ gốc repo:
  sh projects/nam-long-2-earth/fetch_sat.sh && python3 projects/nam-long-2-earth/build_scene.py && node studio/engine/render.mjs projects/nam-long-2-earth/scene.json"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(D, 'routes.json'), encoding='utf-8'))
Q = json.load(open(os.path.join(D, '..', 'bds-can-tho', 'geo', 'quy-hoach.json'), encoding='utf-8'))
CEN = [R['project']['lat'], R['project']['lon']]
RANH = Q['corners']
LOT = [[9.994434, 105.783795], [9.994690, 105.784150], [9.994336, 105.784505], [9.994200, 105.783950]]
POI = {p['name']: p for p in R['pois']}
km = lambda n: POI[n]['km']
G = lambda n: [POI[n]['lat'], POI[n]['lon']]
TABS = {'type': 'tabs', 'items': [{'key': 'du', 'text': 'Du lịch', 'color': 'du'}, {'key': 'giao', 'text': 'Giáo dục', 'color': 'giao'},
                                  {'key': 'van', 'text': 'Trung tâm', 'color': 'van'}, {'key': 'ket', 'text': 'Kết nối', 'color': 'ket'}]}
ORANGE = '#FF9A2A'

shots, t = [], 0.0
def shot(dur, view, els, spot=None, **kw):
    global t
    base = [{'type': 'satmap', 'shade': False}, {'type': 'grade', 'desat': 0.5, 'vignette': 0.35, 'tint': 'rgb(196,202,184)'}]
    if spot: base.append({'type': 'spot', 'dark': 0.5, **spot})
    shots.append({'start': round(t, 3), 'end': round(t + dur, 3), 'view': view, 'elements': base + els, **kw}); t += dur
def V(c0, z0, c1, z1, dur): return [{'t': 0, 'lat': c0[0], 'lon': c0[1], 'zoom': z0}, {'t': dur, 'lat': c1[0], 'lon': c1[1], 'zoom': z1}]
def mid(a, b, f=0.5): return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
def project_marks(): return [{'type': 'outline', 'path': RANH, 'color': ORANGE, 'width': 5, 'draw': {'at': 0, 'dur': 0.01}, 'head': False, 'alpha': 0.85},
                             {'type': 'homepin', 'geo': CEN, 'label': 'Nam Long II', 'size': 26, 'labelSize': 30, 'instant': True, 'enterDur': 0.01}]
def leg(name, cat, color, icon, at, sub=None, ldx=0, side=None):
    """một nhịp điểm đến: ghim, đường chạy từ dự án, thẻ đếm km rồi phút"""
    p = POI[name]
    route = {'type': 'route', 'path': p['path'], 'color': {'du': '#FF8A3D', 'giao': '#4CE36B', 'van': '#4FC3FF', 'ket': '#D266FF'}[color], 'neon': True, 'width': 6, 'grow': {'at': 0, 'dur': 1.5}, 'from': at + 0.4, 'head': 'dot', 'flow': False}
    pin = {'type': 'catpin', 'geo': G(name), 'icon': icon, 'color': color, 'label': name, 'from': at, 'ldx': ldx, **({'side': side} if side else {})}
    card = {'type': 'infocard', 'cat': cat, 'name': name, 'color': color, 'km': p['km'], 'min': p['min'], 'from': at + 0.3, 'countAt': 0.1, 'countDur': 1.5, **({'sub': sub} if sub else {})}
    return [route, pin, card], {'path': p['path'], 'from': at + 0.4, 'grow': {'at': 0, 'dur': 1.5}}

# A · lao xuống dự án, tên, chip địa chỉ, câu hỏi
shot(7.0, V([10.01, 105.772], 12.3, CEN, 15.0, 7.0), [
    {'type': 'titleglow', 'text': 'Nam Long II', 'y': 330, 'size': 160, 'from': 0.2},
    {'type': 'chips', 'items': ['Central Lake · Phường Hưng Thạnh', 'Cái Răng · Cần Thơ'], 'y': 420, 'from': 0.9},
    {'type': 'outline', 'path': RANH, 'color': ORANGE, 'width': 6, 'draw': {'at': 2.6, 'dur': 1.2}},
    {'type': 'homepin', 'geo': CEN, 'label': 'Nam Long II', 'size': 28, 'from': 2.2},
    {'type': 'chaptitle', 'lead': 'mình đo thử trên', 'text': 'Bản đồ thật', 'color': 'amber', 'y': 1360, 'size': 120, 'from': 4.0}],
    spot={'points': [{'geo': CEN, 'r': 520}], 'dark': 0.45})
# B · trong dự án: 43,8 ha, hồ trung tâm, EHomeS
shot(4.6, V(CEN, 15.9, CEN, 16.1, 4.6), project_marks() + [
    {'type': 'outline', 'path': LOT, 'color': '#4FC3FF', 'width': 6, 'smooth': 1, 'draw': {'at': 1.6, 'dur': 0.8}, 'fill': 0.15},
    {'type': 'catpin', 'geo': [9.99445, 105.78415], 'icon': 'building', 'color': 'van', 'label': 'EHomeS', 'from': 2.0, 'side': 'below'},
    {'type': 'infocard', 'cat': 'Trong dự án', 'name': 'Nam Long II Central Lake', 'sub': 'Hồ trung tâm · khu nhà ở xã hội EHomeS', 'color': 'amber', 'km': 43.8, 'unit': 'HA', 'from': 0.3, 'countDur': 1.2}],
    spot={'points': [{'geo': CEN, 'r': 620}], 'dark': 0.4}, transition='zoomblur', blurDir=1)
# C · DU LỊCH: chợ nổi Cái Răng
els, sr = leg('Chợ nổi Cái Răng', 'Du lịch & sinh hoạt', 'du', 'water', 1.0)
c = mid(CEN, G('Chợ nổi Cái Răng'))
shot(4.0, V(c, 14.25, c, 14.35, 4.0), project_marks() + [dict(TABS, active='du', **{'from': 0.0})] + els +
     [{'type': 'chaptitle', 'lead': 'cuối tuần đi chơi', 'text': 'Du lịch', 'color': 'du', 'y': 900, 'size': 130, 'from': 0.0, 'to': 1.1}],
     spot={'points': [{'geo': CEN, 'r': 300}, {'geo': G('Chợ nổi Cái Răng'), 'r': 300}], 'routes': [sr]}, transition='zoomblur', blurDir=-1)
# D · GIÁO DỤC: Đại học Cần Thơ
els, sr = leg('Đại học Cần Thơ', 'Giáo dục', 'giao', 'school', 0.6)
c = mid(CEN, G('Đại học Cần Thơ'))
shot(3.5, V(c, 14.1, c, 14.2, 3.5), project_marks() + [dict(TABS, active='giao')] + els +
     [{'type': 'chaptitle', 'lead': 'chuyện học hành', 'text': 'Giáo dục', 'color': 'giao', 'y': 900, 'size': 130, 'from': 0.0, 'to': 0.75}],
     spot={'points': [{'geo': CEN, 'r': 300}, {'geo': G('Đại học Cần Thơ'), 'r': 300}], 'routes': [sr]})
# E · TRUNG TÂM: bảo tàng Cần Thơ rồi bến Ninh Kiều
e1, s1 = leg('Bảo tàng Cần Thơ', 'Trung tâm', 'van', 'bank', 0.5, ldx=-170)
e2, s2 = leg('Bến Ninh Kiều', 'Trung tâm', 'van', 'star', 2.6, ldx=170, side='below')
e1[2]['to'] = 2.6
c = mid(CEN, G('Bến Ninh Kiều'))
shot(5.1, V(c, 14.0, c, 14.15, 5.1), project_marks() + [dict(TABS, active='van')] + e1 + e2 +
     [{'type': 'chaptitle', 'lead': 'ra trung tâm', 'text': 'Trung tâm', 'color': 'van', 'y': 900, 'size': 130, 'from': 0.0, 'to': 0.6}],
     spot={'points': [{'geo': CEN, 'r': 300}, {'geo': G('Bến Ninh Kiều'), 'r': 320}], 'routes': [s1, s2]})
# F · KẾT NỐI XA: sân bay quốc tế Cần Thơ
els, sr = leg('Sân bay quốc tế Cần Thơ', 'Kết nối xa', 'ket', 'plane', 0.7)
c = mid(CEN, G('Sân bay quốc tế Cần Thơ'))
shot(4.0, V(c, 13.2, c, 13.3, 4.0), project_marks() + [dict(TABS, active='ket')] + els +
     [{'type': 'chaptitle', 'lead': 'đi xa hơn', 'text': 'Kết nối xa', 'color': 'ket', 'y': 900, 'size': 120, 'from': 0.0, 'to': 0.8}],
     spot={'points': [{'geo': CEN, 'r': 260}, {'geo': G('Sân bay quốc tế Cần Thơ'), 'r': 300}], 'routes': [sr]}, transition='zoomblur', blurDir=-1)
# G · tổng kết: vòng 10 phút
NEAR = [('Chợ nổi Cái Răng', 'du', 'water', 'Chợ nổi'), ('Đại học Cần Thơ', 'giao', 'school', 'ĐH Cần Thơ'), ('Bảo tàng Cần Thơ', 'van', 'bank', 'Bảo tàng'), ('Bến Ninh Kiều', 'van', 'star', 'Ninh Kiều')]
RC = mid(CEN, [10.022, 105.776], 0.5)
els = [{'type': 'ringzone', 'geo': RC, 'r': 470, 'from': 0.0}] + project_marks()
for i, (n, col, ic, short) in enumerate(NEAR):
    els += [{'type': 'route', 'path': POI[n]['path'], 'color': {'du': '#FF8A3D', 'giao': '#4CE36B', 'van': '#4FC3FF'}[col], 'neon': True, 'width': 5, 'grow': {'at': 0, 'dur': 0.8}, 'from': 0.6 + i * 0.35, 'flow': False},
            {'type': 'catpin', 'geo': G(n), 'icon': ic, 'color': col, 'label': f"{short} · {POI[n]['min']} phút", 'size': 20, 'labelSize': 20, 'from': 0.7 + i * 0.35, 'ldx': [40, -40, -60, 90][i], **({'side': 'below'} if i in (0, 2) else {})}]
els += [{'type': 'legend', 'y': 1250, 'from': 1.0, 'stagger': 0.35, 'items': [{'text': 'Chợ nổi Cái Răng', 'value': POI['Chợ nổi Cái Răng']['min'], 'color': 'du'}, {'text': 'Đại học Cần Thơ', 'value': POI['Đại học Cần Thơ']['min'], 'color': 'giao'},
                                                                                {'text': 'Bảo tàng Cần Thơ', 'value': POI['Bảo tàng Cần Thơ']['min'], 'color': 'van'}, {'text': 'Bến Ninh Kiều', 'value': POI['Bến Ninh Kiều']['min'], 'color': 'van'}]},
        {'type': 'chaptitle', 'lead': 'chợ, trường, trung tâm', 'text': 'Trong vòng 10 phút', 'color': 'ring', 'y': 1640, 'size': 96, 'leadSize': 46, 'from': 2.2}]
shot(4.8, V(RC, 13.75, RC, 13.8, 4.8), els, transition='zoomblur', blurDir=1)
# H · kết: camera nghiêng, đo trên bản đồ thật
shot(5.7, V(CEN, 15.3, CEN, 15.6, 5.7), project_marks() + [
    {'type': 'chaptitle', 'lead': 'những con số này được đo trên', 'text': 'Bản đồ thật', 'color': 'amber', 'y': 1420, 'size': 130, 'leadSize': 48, 'tail': 'không phải trên phối cảnh', 'from': 0.3},
    {'type': 'note', 'text': 'Km, phút: đường xe, ước tính theo OpenStreetMap (OSRM), lúc đường vắng', 'x': 540, 'align': 'center', 'y': 1700, 'size': 20, 'from': 0.6}],
    spot={'points': [{'geo': CEN, 'r': 560}], 'dark': 0.45}, tilt=[{'t': 0, 'deg': 8}, {'t': 2.0, 'deg': 42}], transition='zoomblur', blurDir=1)

scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 'bds-hanh-trinh', 'satmap': 'sat/satmap.json',
         'narration': {'path': 'audio/narration.wav', 'lead': 0.15, 'gain': 1.0},
         'music': {'path': 'audio/music.wav', 'gain': 0.05},
         'credit': 'Tiles © Esri, Maxar, Earthstar Geographics · Data © OpenStreetMap', 'shots': shots}
json.dump(scene, open(os.path.join(D, 'scene.json'), 'w'), ensure_ascii=False, indent=1)
print('scene.json', round(t, 2), 's,', len(shots), 'shots')
