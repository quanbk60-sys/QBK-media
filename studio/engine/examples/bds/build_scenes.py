#!/usr/bin/env python3
"""Dựng 4 scene mẫu cho 4 phong cách BĐS (bds-drone, bds-capcut, bds-navy, bds-geo), theo đúng cấu trúc 4 video mẫu.
python3 build_scenes.py   →  drone.json, capcut.json, navy.json, geo.json   (render: node ../../render.mjs <file>)
Dữ liệu: osm.json (OpenStreetMap qua Nominatim, ODbL), photos/commons.json (Wikimedia Commons, ghi tác giả + giấy phép),
sat-*/ (Esri). Các nhãn tiện ích chung chung (TRƯỜNG HỌC, SIÊU THỊ…) và số đo lô đất trong cảnh mẫu là MINH HỌA phong cách,
không phải dữ kiện; video thật phải lấy vị trí và số liệu từ sources.md của dự án."""
import json, math, os
H = os.path.dirname(os.path.abspath(__file__))
OSM = json.load(open(os.path.join(H, 'osm.json')))
PH = json.load(open(os.path.join(H, 'photos/commons.json'))) if os.path.exists(os.path.join(H, 'photos/commons.json')) else {}
photo = lambda key: f'photos/{key}.jpg' if os.path.exists(os.path.join(H, f'photos/{key}.jpg')) else os.environ.get('BDS_PLACEHOLDER')


def ring(key, simplify=1):
    g = OSM[key]['geojson']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']] if g['type'] == 'Polygon' else [[g['coordinates']]]
    return [[[lat, lon] for lon, lat in p[0][::simplify]] for p in polys]


def line(key):
    g = OSM[key]['geojson']; return [[lat, lon] for lon, lat in g['coordinates']]


def km(a, b):
    R = 6371.0; p1, p2 = math.radians(a[0]), math.radians(b[0]); dl = math.radians(b[1] - a[1]); dp = p2 - p1
    return 2 * R * math.asin(math.sqrt(math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2))


def fmt_km(d): return f"{d:.1f}KM".replace('.', ',')


def cen(key): return [OSM[key]['lat'], OSM[key]['lon']]


def save(name, scene):
    json.dump(scene, open(os.path.join(H, name), 'w'), ensure_ascii=False, indent=1); print('wrote', name, scene['shots'][-1]['end'], 's')


NOCAP = {'items': []}
WM = lambda y=1545, x=170: {'type': 'btext', 'text': 'QBK MEDIA', 'x': x, 'y': y, 'font': 'M900', 'size': 30, 'alpha': 0.85, 'enter': 'none', 'shadowBlur': 6}

# ---------------------------------------------------------------- bds-capcut (mẫu: Zin Media "Vẽ map trên CapCut")
def capcut():
    P = [16.05935, 108.2132]  # điểm minh hoạ trong phường Hải Châu, sát đường Nguyễn Văn Linh
    NVL = [[16.0571, 108.2010], [16.0583, 108.2080], [16.0594, 108.2140], [16.0603, 108.2190], [16.0611, 108.2238]]
    title = lambda: [{'type': 'btext', 'text': 'VỊ TRÍ *NHÀ PHỐ* TẠI *ĐÀ NẴNG*', 'x': 540, 'y': 232, 'font': 'M900', 'size': 58, 'keyColor': '#FFD21F', 'enter': 'none', 'shadowBlur': 14, 'shadowColor': 'rgba(0,0,0,.65)'},
                     {'type': 'btext', 'text': 'Bài tập phong cách', 'x': 540, 'y': 318, 'font': 'M500i', 'size': 62, 'enter': 'none', 'shadowBlur': 14, 'shadowColor': 'rgba(0,0,0,.65)'}]
    rong, han = [16.0613, 108.2274], [16.0719, 108.2267]
    shots = [
        {'start': 0, 'end': 2.6, 'zoomBlur': 1.4, 'view': [{'t': 0, 'lat': 16.06, 'lon': 108.21, 'zoom': 11.4}, {'t': 2.4, 'lat': P[0], 'lon': P[1], 'zoom': 16.5, 'ease': 'in'}],
         'elements': [{'type': 'satmap', 'shade': False}, *title()], 'sfx': [{'t': 0.1, 'kind': 'whoosh', 'gain': 0.5}]},
        {'start': 2.6, 'end': 10.4, 'view': [{'t': 0, 'lat': P[0], 'lon': P[1], 'zoom': 16.5}, {'t': 7.8, 'lat': P[0] + 0.0002, 'lon': P[1], 'zoom': 16.62}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'ring', 'geo': P, 'radiusM': 400, 'from': 1.8, 'enterDur': 0.6},
                      {'type': 'neon', 'variant': 'laser', 'path': NVL, 'grow': {'at': 0.6, 'dur': 0.7}, 'from': 0.6, 'width': 13},
                      {'type': 'tagbox', 'variant': 'road', 'text': 'Nguyễn Văn Linh', 'geo': [16.05955, 108.2112], 'stick': 150, 'from': 1.0},
                      {'type': 'pin', 'variant': 'gold', 'geo': P, 'icon': 'house', 'label': 'Vị trí đất', 'from': 0.1, 'size': 1.05},
                      *[{'type': 'pin', 'variant': 'yellow', 'geo': g, 'icon': ic, 'label': lb, 'from': 3.0 + i * 0.45, 'size': 0.72, 'labelSize': 24}
                        for i, (g, ic, lb) in enumerate([([16.0617, 108.2117], 'cart', 'Siêu thị'), ([16.0577, 108.2110], 'school', 'Trường học'), ([16.0583, 108.2156], 'food', 'Nhà hàng'), ([16.0559, 108.2133], 'school', 'Trường học'), ([16.0570, 108.2176], 'food', 'Nhà hàng')])],
                      *title()], 'sfx': [{'t': 0.1, 'kind': 'pop', 'gain': 0.4}, {'t': 0.6, 'kind': 'whoosh', 'gain': 0.35}, {'t': 1.8, 'kind': 'chime', 'gain': 0.2}] + [{'t': 3.0 + i * 0.45, 'kind': 'pop', 'gain': 0.3} for i in range(5)]},
        {'start': 10.4, 'end': 15.4, 'zoomBlur': 1.6, 'view': [{'t': 0, 'lat': P[0], 'lon': P[1], 'zoom': 16.62}, {'t': 0.9, 'lat': P[0], 'lon': P[1], 'zoom': 19.2, 'ease': 'in'}, {'t': 5, 'lat': P[0], 'lon': P[1], 'zoom': 19.32}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'lot', 'variant': 'blue', 'pts': [[410, 720], [670, 720], [670, 1240], [410, 1240]], 'area': '100m²', 'from': 1.1,
                       'dims': [{'edge': 2, 'text': '5m', 'side': 1}, {'edge': 1, 'text': '20m', 'side': 1}]}, *title()],
         'sfx': [{'t': 0, 'kind': 'whoosh', 'gain': 0.5}, {'t': 1.1, 'kind': 'tap', 'gain': 0.3}, {'t': 1.9, 'kind': 'tap', 'gain': 0.3}, {'t': 2.35, 'kind': 'tap', 'gain': 0.3}]},
        {'start': 15.4, 'end': 22.4, 'zoomBlur': 1.2, 'view': [{'t': 0, 'lat': P[0], 'lon': P[1], 'zoom': 19.3}, {'t': 1.0, 'lat': 16.0625, 'lon': 108.2185, 'zoom': 14.3, 'ease': 'out'}, {'t': 5.6, 'lat': 16.0625, 'lon': 108.2185, 'zoom': 14.35}, {'t': 7, 'lat': 16.06, 'lon': 108.215, 'zoom': 12.6}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'pin', 'variant': 'gold', 'geo': P, 'icon': 'house', 'label': 'Vị trí đất', 'from': 1.0, 'size': 0.95, 'to': 6.0},
                      {'type': 'arrow', 'variant': 'ydash', 'path': [P, [16.0606, 108.2205], rong], 'smooth': True, 'grow': {'at': 1.6, 'dur': 0.8}, 'from': 1.6, 'to': 6.0},
                      {'type': 'card', 'variant': 'bubble', 'path': photo('dragon-bridge-diff'), 'geo': rong, 'r': 140, 'tail': 110, 'from': 2.3, 'to': 6.0, 'focus': [0.42, 0.5]},
                      {'type': 'arrow', 'variant': 'ydash', 'path': [P, [16.0670, 108.2190], han], 'smooth': True, 'grow': {'at': 3.0, 'dur': 0.8}, 'from': 3.0, 'to': 6.0},
                      {'type': 'card', 'variant': 'bubble', 'path': photo('cau-song-han'), 'geo': han, 'r': 140, 'tail': 110, 'from': 3.7, 'to': 6.0},
                      *title()], 'sfx': [{'t': 0, 'kind': 'whoosh', 'gain': 0.45}, {'t': 2.3, 'kind': 'pop', 'gain': 0.4}, {'t': 3.7, 'kind': 'pop', 'gain': 0.4}, {'t': 6.0, 'kind': 'whoosh', 'gain': 0.4}]},
    ]
    save('capcut.json', {'style': 'bds-capcut', 'satmap': 'sat-capcut/satmap.json', 'captions': NOCAP, 'shots': shots})


# ---------------------------------------------------------------- bds-navy (mẫu: Zin Media "Sun Symphony – bản đồ tiện ích")
def navy():
    PJ = [16.0745, 108.2236]  # bờ tây sông Hàn (minh hoạ vị trí dự án)
    rong, mk, sb = cen('cau_rong'), [16.0700, 108.2470], cen('san_bay')
    son_tra, linh_ung, diff = [16.1180, 108.2800], [16.1003, 108.2778], [16.0705, 108.2262]
    bridge = ring('cau_rong')[0]
    d_rong, d_mk = km(PJ, rong), km(PJ, mk)
    v1 = {'tilt': 38, 'rot': -24}
    shots = [
        {'start': 0, 'end': 1.4, 'zoomBlur': 1.5, 'view': [{'t': 0, 'lat': 16.06, 'lon': 108.21, 'zoom': 11.6, 'tilt': 0, 'rot': 0}, {'t': 1.4, 'lat': 16.068, 'lon': 108.2265, 'zoom': 15.7, 'ease': 'in', **v1}],
         'elements': [{'type': 'satmap', 'shade': False, 'bg': '#063360'}, WM(700, 540)], 'sfx': [{'t': 0, 'kind': 'whoosh', 'gain': 0.5}]},
        {'start': 1.4, 'end': 9.4, 'view': [{'t': 0, 'lat': 16.068, 'lon': 108.2265, 'zoom': 15.7, **v1}, {'t': 8, 'lat': 16.0695, 'lon': 108.2305, 'zoom': 15.15, 'tilt': 36, 'rot': -18}],
         'elements': [{'type': 'satmap', 'shade': False, 'bg': '#063360'},
                      {'type': 'btext', 'text': 'SÔNG HÀN', 'geo': [16.0660, 108.2283], 'along': [[16.0700, 108.2272], [16.0620, 108.2290]], 'dy0': 0, 'font': 'M900', 'size': 104, 'enter': 'slide', 'slideX': 0, 'slideY': -60, 'from': 0.3, 'shadowBlur': 18, 'letter': 3},
                      {'type': 'boundary', 'path': bridge, 'color': '#7FE9FF', 'width': 4, 'rungs': 9, 'grow': {'at': 1.4, 'dur': 0.6}, 'from': 1.4, 'smooth': False, 'core': '#E6FBFF'},
                      {'type': 'arrow', 'variant': 'green', 'path': [PJ, rong], 'grow': {'at': 1.2, 'dur': 0.7}, 'from': 1.2, 'label': fmt_km(d_rong), 'labelOff': -40},
                      {'type': 'card', 'variant': 'navy', 'path': photo('dragon-bridge-diff'), 'geo': rong, 'label': 'Cầu Rồng', 'from': 1.8, 'stick': 90},
                      {'type': 'arrow', 'variant': 'green', 'path': [PJ, mk], 'grow': {'at': 3.0, 'dur': 0.7}, 'from': 3.0, 'label': fmt_km(d_mk), 'labelOff': -36},
                      {'type': 'tagbox', 'variant': 'glass', 'text': 'Biển Mỹ Khê', 'geo': mk, 'from': 3.6},
                      {'type': 'card', 'variant': 'navy', 'path': photo('han-river'), 'geo': PJ, 'label': 'Vị trí dự án', 'from': 0.1, 'stick': 100, 'frame': '#9FD9B4', 'textColor': '#FFE14D', 'w': 190, 'h': 112},
                      WM(860, 540)],
         'sfx': [{'t': 0.3, 'kind': 'whoosh', 'gain': 0.3}, {'t': 1.2, 'kind': 'whoosh', 'gain': 0.35}, {'t': 1.8, 'kind': 'pop', 'gain': 0.4}, {'t': 3.0, 'kind': 'whoosh', 'gain': 0.35}, {'t': 3.6, 'kind': 'pop', 'gain': 0.4}]},
        {'start': 9.4, 'end': 19.0, 'view': [{'t': 0, 'lat': 16.0695, 'lon': 108.2305, 'zoom': 15.15, 'tilt': 36, 'rot': -18}, {'t': 2.2, 'lat': 16.084, 'lon': 108.243, 'zoom': 13.95, 'tilt': 30, 'rot': 0}, {'t': 6.0, 'lat': 16.081, 'lon': 108.241, 'zoom': 13.9, 'tilt': 30, 'rot': 0}, {'t': 8.0, 'lat': 16.058, 'lon': 108.218, 'zoom': 13.9, 'tilt': 28, 'rot': 10}, {'t': 9.6, 'lat': 16.059, 'lon': 108.219, 'zoom': 13.95, 'tilt': 28, 'rot': 11}],
         'elements': [{'type': 'satmap', 'shade': False, 'bg': '#063360'},
                      {'type': 'boundary', 'path': ring('san_bay')[0], 'color': '#9BE36B', 'width': 2, 'glow': False, 'fill': '#1E5A2E', 'fillAlpha': 0.85, 'from': 6.6, 'fillAt': 0},
                      {'type': 'icon', 'icon': 'plane', 'geo': sb, 'size': 120, 'rotate': -28, 'color': '#E8FF3A', 'from': 7.0},
                      {'type': 'tagbox', 'variant': 'glass', 'text': 'Sân bay Đà Nẵng', 'geo': [sb[0] + 0.006, sb[1]], 'from': 7.2, 'stick': 60},
                      {'type': 'boundary', 'path': bridge, 'color': '#7FE9FF', 'width': 3, 'rungs': 9, 'smooth': False, 'core': '#E6FBFF'},
                      {'type': 'card', 'variant': 'navy', 'path': photo('dragon-bridge-diff'), 'geo': rong, 'label': 'Cầu Rồng', 'stick': 80, 'enter': 'none'},
                      {'type': 'card', 'variant': 'navy', 'path': photo('son-tra'), 'geo': son_tra, 'label': 'Bán đảo Sơn Trà', 'stick': 150, 'dx': -110, 'from': 2.6},
                      {'type': 'card', 'variant': 'navy', 'path': photo('linh-ung'), 'geo': linh_ung, 'label': 'Chùa Linh Ứng', 'stick': 70, 'dx': 60, 'from': 3.4},
                      {'type': 'tagbox', 'variant': 'glass', 'text': 'Biển Mỹ Khê', 'geo': mk},
                      {'type': 'card', 'variant': 'navy', 'path': photo('han-river'), 'geo': PJ, 'label': 'Vị trí dự án', 'stick': 190, 'frame': '#9FD9B4', 'w': 190, 'h': 112},
                      WM(1400, 540)],
         'sfx': [{'t': 0, 'kind': 'whoosh', 'gain': 0.35}, {'t': 1.6, 'kind': 'pop', 'gain': 0.4}, {'t': 2.6, 'kind': 'pop', 'gain': 0.4}, {'t': 3.4, 'kind': 'pop', 'gain': 0.4}, {'t': 6.0, 'kind': 'whoosh', 'gain': 0.35}, {'t': 7.0, 'kind': 'chime', 'gain': 0.25}]},
    ]
    save('navy.json', {'style': 'bds-navy', 'satmap': 'sat-navy/satmap.json', 'captions': NOCAP, 'shots': shots})


# ---------------------------------------------------------------- bds-geo (mẫu: Thiên Minh "Một phút giới thiệu lô đất", After Effects + Geolayers)
def geo():
    LOT = [12.5115, 109.0935]  # điểm minh hoạ
    cho, th = cen('cho_ninh_phung'), cen('th_ninh_phung')
    ql = line('ql26')
    txnh = ring('tx_ninh_hoa', 2); pnh = ring('p_ninh_hoa')
    near_ql = min(ql, key=lambda p: km(LOT, p))
    shots = [
        {'start': 0, 'end': 4.2, 'zoomBlur': 1.3, 'view': [{'t': 0, 'lat': 12.55, 'lon': 109.05, 'zoom': 9.2}, {'t': 1.6, 'lat': 12.55, 'lon': 109.06, 'zoom': 10.5, 'ease': 'in'}, {'t': 4.2, 'lat': 12.54, 'lon': 109.07, 'zoom': 10.7}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'boundary', 'polys': txnh, 'color': '#3DFF63', 'width': 4, 'grow': {'at': 0.8, 'dur': 1.4}, 'from': 0.8, 'fill': '#3FD2B0', 'fillAlpha': 0.5, 'fillAt': 1.2,
                       'label': 'TX. NINH HÒA (CŨ)', 'labelGeo': [12.56, 109.03], 'labelSize': 54, 'labelAt': 1.4}],
         'sfx': [{'t': 0, 'kind': 'whoosh', 'gain': 0.45}, {'t': 2.0, 'kind': 'chime', 'gain': 0.2}]},
        {'start': 4.2, 'end': 8.4, 'zoomBlur': 1.3, 'view': [{'t': 0, 'lat': 12.54, 'lon': 109.07, 'zoom': 10.7}, {'t': 1.0, 'lat': 12.508, 'lon': 109.13, 'zoom': 13.25, 'ease': 'in'}, {'t': 4.2, 'lat': 12.508, 'lon': 109.132, 'zoom': 13.35}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'boundary', 'polys': pnh, 'color': '#F4FF3A', 'width': 4, 'grow': {'at': 1.0, 'dur': 0.9}, 'from': 1.0, 'fill': '#F4FF3A', 'fillAlpha': 0.22, 'hatch': True, 'fillAt': 0.6,
                       'label': 'P. NINH HÒA', 'labelGeo': [12.507, 109.152], 'labelSize': 50, 'labelAt': 0.9},
                      {'type': 'pin', 'variant': 'target', 'geo': LOT, 'label': 'Vị trí lô đất', 'from': 1.2, 'labelSize': 38}],
         'sfx': [{'t': 0, 'kind': 'whoosh', 'gain': 0.45}, {'t': 1.2, 'kind': 'pop', 'gain': 0.4}]},
        {'start': 8.4, 'end': 14.6, 'view': [{'t': 0, 'lat': 12.5055, 'lon': 109.098, 'zoom': 14.55}, {'t': 6.2, 'lat': 12.5055, 'lon': 109.098, 'zoom': 14.7}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'ring', 'variant': 'radar', 'geo': LOT, 'radiusM': 2000, 'from': 0.3, 'enterDur': 0.7, 'label': 'Bán kính 2 km', 'labelAngle': 128},
                      {'type': 'pin', 'variant': 'target', 'geo': LOT, 'label': 'Vị trí lô đất', 'labelSize': 38, 'enter': 'none'},
                      {'type': 'pin', 'variant': 'red', 'geo': cho, 'label': 'Chợ\nNinh Phụng', 'from': 1.6, 'labelDx': -95, 'labelDy': 6},
                      {'type': 'pin', 'variant': 'red', 'geo': th, 'label': 'Trường Tiểu học\nSố 1 Ninh Phụng', 'from': 2.3, 'labelDx': 120, 'labelDy': -40}],
         'sfx': [{'t': 0.3, 'kind': 'whoosh', 'gain': 0.35}, {'t': 1.6, 'kind': 'pop', 'gain': 0.4}, {'t': 2.3, 'kind': 'pop', 'gain': 0.4}]},
        {'start': 14.6, 'end': 20.6, 'view': [{'t': 0, 'lat': 12.5055, 'lon': 109.098, 'zoom': 14.7}, {'t': 1.2, 'lat': 12.505, 'lon': 109.095, 'zoom': 14.6}, {'t': 6, 'lat': 12.505, 'lon': 109.095, 'zoom': 14.7}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'neon', 'variant': 'road', 'path': ql, 'grow': {'at': 0.4, 'dur': 0.9}, 'from': 0.4},
                      {'type': 'tagbox', 'variant': 'yellow', 'text': 'Quốc lộ 26', 'geo': ql[0], 'rotate': -32, 'stick': 0, 'dy': -26, 'from': 1.2},
                      {'type': 'arrow', 'variant': 'dash', 'path': [LOT, [(LOT[0] + near_ql[0]) / 2 + 0.0008, (LOT[1] + near_ql[1]) / 2], near_ql], 'grow': {'at': 1.6, 'dur': 1.1}, 'from': 1.6,
                       'label': fmt_km(km(LOT, near_ql)).lower().replace('km', ' km'), 'labelOff': 46, 'labelSize': 40},
                      {'type': 'pin', 'variant': 'target', 'geo': LOT, 'label': 'Vị trí lô đất', 'labelSize': 38, 'enter': 'none'},
                      {'type': 'pin', 'variant': 'red', 'geo': cho, 'label': 'Chợ\nNinh Phụng', 'enter': 'none', 'labelDx': -95, 'labelDy': 6},
                      {'type': 'pin', 'variant': 'red', 'geo': th, 'label': 'Trường Tiểu học\nSố 1 Ninh Phụng', 'enter': 'none', 'labelDx': 120, 'labelDy': -40}],
         'sfx': [{'t': 0.4, 'kind': 'whoosh', 'gain': 0.35}, {'t': 1.6, 'kind': 'whoosh', 'gain': 0.35}]},
        {'start': 20.6, 'end': 26.0, 'zoomBlur': 1.4, 'view': [{'t': 0, 'lat': 12.505, 'lon': 109.095, 'zoom': 14.7}, {'t': 1.0, 'lat': LOT[0], 'lon': LOT[1], 'zoom': 18.3, 'ease': 'in'}, {'t': 5.4, 'lat': LOT[0], 'lon': LOT[1], 'zoom': 18.45}],
         'elements': [{'type': 'satmap', 'shade': False},
                      {'type': 'lot', 'variant': 'yellow', 'pts': [[430, 900], [700, 860], [730, 1070], [455, 1110]], 'area': '300m²', 'sub': '100m² TC', 'textRotate': -8, 'textDx': -45, 'textDy': 10, 'areaSize': 50, 'from': 1.3},
                      {'type': 'tagbox', 'variant': 'dark', 'text': 'Vị trí lô đất', 'x': 580, 'y': 840, 'stick': 0, 'from': 2.2},
                      {'type': 'pin', 'variant': 'red', 'x': 655, 'y': 1000, 'size': 1.6, 'from': 2.0}],
         'sfx': [{'t': 0, 'kind': 'whoosh', 'gain': 0.45}, {'t': 1.3, 'kind': 'chime', 'gain': 0.25}, {'t': 2.0, 'kind': 'pop', 'gain': 0.4}]},
    ]
    save('geo.json', {'style': 'bds-geo', 'satmap': 'sat-geo/satmap.json', 'captions': NOCAP, 'shots': shots})


if __name__ == '__main__':
    capcut(); navy(); geo()
    import build_drone; build_drone.drone(save)
