#!/usr/bin/env python3
"""_mau-bds-earth: bản demo phong cách "BĐS · Google Earth tối" (bds-earth), học từ mẫu TikTok người dùng gửi 15/11/2026.
Nội dung: Nam Long II Central Lake (Cái Răng, Cần Thơ), dữ kiện lấy từ projects/bds-can-tho/sources.md (chép ở sources.md).
Chạy từ gốc repo:
  python3 projects/_mau-bds-earth/build_scene.py && node studio/engine/render.mjs projects/_mau-bds-earth/scene.json"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(D, '..', 'bds-can-tho')
R = json.load(open(os.path.join(SRC, 'routes.json'), encoding='utf-8'))
Q = json.load(open(os.path.join(SRC, 'geo', 'quy-hoach.json'), encoding='utf-8'))
P = [R['project']['lat'], R['project']['lon']]
RANH = Q['corners']                              # 4 góc ranh khu theo quy hoạch 1/500 đã nắn (gần đúng, rmse 45 m)
CEN = [sum(c[0] for c in RANH) / 4, sum(c[1] for c in RANH) / 4]
LOT = [[9.994434, 105.783795], [9.994690, 105.784150], [9.994336, 105.784505], [9.994200, 105.783950]]   # khối EHomeS dò trên vệ tinh
POI = {p['name']: p for p in R['pois'] if p['name'] != 'Cầu Cần Thơ'}
km = lambda p: str(p['km']).replace('.', ',')
PHOTO = {'Chợ nổi Cái Răng': ('photos/cai-rang-floating-market-1.jpg', 'Ảnh: Christophe95, CC BY-SA 4.0'),
         'Đại học Cần Thơ': ('photos/can-tho-university-41696358552.jpg', 'Ảnh: Tran Anh Khoa, CC BY-SA 2.0'),
         'Bến Ninh Kiều': ('photos/ben-ninh-kieu-can-tho.jpg', 'Ảnh: Phương Huy, phạm vi công cộng')}

shots, t = [], 0.0
def shot(dur, view, els, **kw):
    global t
    shots.append({'start': round(t, 3), 'end': round(t + dur, 3), 'view': view, 'elements': [{'type': 'satmap', 'shade': False}, {'type': 'grade'}] + els, **kw}); t += dur
def V(*keys): return [{'t': k[0], 'lat': k[1][0], 'lon': k[1][1], 'zoom': k[2], **({'ease': k[3]} if len(k) > 3 else {})} for k in keys]

# 1 · lao từ trên cao xuống khu đô thị, tên dự án
shot(4.6, V((0, [10.004, 105.775], 12.4), (4.6, CEN, 15.1)), [
    {'type': 'ebig', 'from': 0.3, 'y': 300, 'lines': [{'text': 'Nam Long II', 'size': 74}, {'text': 'Central Lake', 'size': 74}, {'text': 'Khu đô thị 43,8 ha · Cái Răng, Cần Thơ', 'size': 26, 'color': 'chanh', 'spacing': 0.06}]}])
# 2 · viền ranh khu tự chạy, biển tên, phường, hồ trung tâm
shot(3.4, V((0, CEN, 15.6), (3.4, CEN, 15.75)), [
    {'type': 'outline', 'path': RANH, 'color': 'lime', 'width': 8, 'draw': {'at': 0.15, 'dur': 1.3}, 'fill': 0.07},
    {'type': 'sign', 'geo': CEN, 'name': 'Nam Long II', 'sub': 'Central Lake', 'from': 1.0},
    {'type': 'etag', 'geo': [9.9955, 105.7825], 'text': 'Hồ trung tâm', 'dx': 70, 'dy': 150, 'from': 1.6, 'color': 'cyan'},
    {'type': 'ebig', 'from': 0.6, 'y': 1370, 'lines': [{'text': 'Chủ đầu tư Nam Long', 'size': 50}, {'text': 'Phường Hưng Thạnh', 'size': 40, 'color': 'chanh'}]},
    {'type': 'note', 'text': 'Ranh khu theo quy hoạch 1/500, gần đúng', 'x': 540, 'align': 'center', 'y': 1600, 'size': 20, 'from': 0.6}])
# 3 · zoom ra: kết nối 3 điểm, đường vàng tự chạy, thẻ nhãn, thẻ ảnh lần lượt
names = ['Chợ nổi Cái Răng', 'Đại học Cần Thơ', 'Bến Ninh Kiều']
DX = {'Chợ nổi Cái Răng': (-40, 90, 'right'), 'Đại học Cần Thơ': (-60, -80, 'right'), 'Bến Ninh Kiều': (40, -90, 'left')}
els = [{'type': 'outline', 'path': RANH, 'color': 'lime', 'width': 6, 'draw': {'at': 0, 'dur': 0.01}, 'head': False}]
for i, n in enumerate(names):
    p, at = POI[n], 0.9 + i * 1.75
    els += [{'type': 'route', 'path': p['path'], 'color': '#F3EE3C', 'neon': True, 'width': 7, 'grow': {'at': 0, 'dur': 1.0}, 'from': at, 'head': 'dot', 'flow': False},
            {'type': 'etag', 'geo': [p['lat'], p['lon']], 'text': f"{n} · {km(p)} km", 'dx': DX[n][0], 'dy': DX[n][1], 'align': DX[n][2], 'from': at + 0.8},
            {'type': 'ecard', 'path': PHOTO[n][0], 'credit': PHOTO[n][1], 'x': 540, 'y': 360, 'w': 470, 'ratio': 1.6, 'from': at + 0.7, **({'to': at + 1.75} if i < 2 else {})}]
els += [{'type': 'ebig', 'from': 0.2, 'y': 1400, 'lines': [{'text': 'Kết nối', 'size': 64}, {'text': 'Trung tâm Cần Thơ', 'size': 40, 'color': 'chanh'}]},
        {'type': 'note', 'text': 'Khoảng cách đường xe, ước tính theo OSRM · © OpenStreetMap', 'x': 540, 'align': 'center', 'y': 1600, 'size': 20, 'from': 0.4}]
shot(6.9, V((0, [10.0130, 105.7715], 14.05), (6.9, [10.0130, 105.7715], 14.2)), els, transition='zoomblur', blurDir=-1)
# 4 · zoom vào khu nhà ở xã hội EHomeS: viền hồng, số liệu đếm lên
shot(7.5, V((0, [9.99445, 105.78415], 18.35), (7.5, [9.99445, 105.78415], 18.65)), [
    {'type': 'outline', 'path': RANH, 'color': 'lime', 'width': 6, 'draw': {'at': 0, 'dur': 0.01}, 'head': False, 'alpha': 0.7},
    {'type': 'outline', 'path': LOT, 'color': 'magenta', 'width': 7, 'draw': {'at': 0.2, 'dur': 1.0}, 'smooth': 1, 'fill': 0.12},
    {'type': 'etag', 'geo': [9.99445, 105.78415], 'text': 'Nhà ở xã hội EHomeS', 'dx': 0, 'dy': -260, 'align': 'center', 'from': 0.9, 'color': 'magenta'},
    {'type': 'estat', 'label': 'EHomeS', 'value': '3,8 ha', 'y': 1330, 'from': 0.6, 'to': 3.2, 'note': 'khoảng'},
    {'type': 'estat', 'label': 'Quy mô', 'value': '12 block', 'y': 1330, 'from': 3.2, 'to': 4.9, 'count': 0.8, 'note': 'cao tối đa 9 tầng'},
    {'type': 'ebig', 'from': 4.9, 'y': 1300, 'lines': [{'text': '4 tháp cất nóc', 'size': 60}, {'text': 'Cuối năm 2025', 'size': 44, 'color': 'chanh'}]}],
    transition='zoomblur', blurDir=1)
# 5 · kết: toàn khu, biển tên, theo dõi
shot(3.1, V((0, CEN, 15.2), (3.1, CEN, 15.35)), [
    {'type': 'outline', 'path': RANH, 'color': 'lime', 'width': 8, 'draw': {'at': 0, 'dur': 0.8}},
    {'type': 'sign', 'geo': CEN, 'name': 'Nam Long II', 'sub': 'Central Lake', 'from': 0.5},
    {'type': 'ebig', 'from': 0.4, 'y': 1360, 'lines': [{'text': 'Nam Long II Central Lake', 'size': 52}, {'text': 'Theo dõi QBK · xem thêm dự án', 'size': 30, 'color': 'chanh'}]}],
    transition='zoomblur', blurDir=-1)

scene = {'width': 1080, 'height': 1920, 'fps': 30, 'style': 'bds-earth', 'satmap': 'sat/satmap.json',
         'narration': {'path': 'audio/narration.wav', 'lead': 0.15, 'gain': 1.0},
         'music': {'path': 'audio/music.wav', 'gain': 0.10},
         'credit': 'Ảnh vệ tinh: Esri, Maxar, Earthstar Geographics',
         'shots': shots}
json.dump(scene, open(os.path.join(D, 'scene.json'), 'w'), ensure_ascii=False, indent=1)
print('scene.json', round(t, 2), 's,', len(shots), 'shots')
