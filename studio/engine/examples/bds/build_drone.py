"""bds-drone (mẫu: HBN Media "Kẻ đường và ghim vị trí trên CapCut"). Mẫu gốc quay flycam thật; ở đây góc nhìn flycam được
dựng từ ảnh vệ tinh Esri nghiêng 55° + bầu trời, mây, sương xa (phần tử sky). Có ảnh/flycam thật thì thay satmap bằng bgphoto
và dùng toạ độ "ip"/"ipts" (phân số trên ảnh). Nhãn tiện ích chung chung là minh hoạ phong cách."""
from build_scenes import km, photo, NOCAP, WM

def drone(save):
    HOME = [16.0600, 108.2163]                       # điểm minh hoạ phía bắc đường Nguyễn Văn Linh
    BRIDGE = [16.06112, 108.2246]                     # đầu tây Cầu Rồng
    NVL = [[16.05846, 108.2040], [16.05906, 108.2105], [16.05976, 108.2140], [16.06066, 108.2190], [16.06128, 108.2238]]
    BD = [[16.0500, 108.2232], [16.0560, 108.2236], [16.0611, 108.2239], [16.0680, 108.2240], [16.0740, 108.2236]]
    V = lambda t, lon: {'t': t, 'lat': 16.0587 + (lon - 108.2105) * 0.17, 'lon': lon, 'zoom': 17.3, 'tilt': 55, 'rot': -76, 'pivot': 500, 'horizon': 540, 'ease': 'linear'}
    d = km(HOME, BRIDGE) * 1000
    title = {'type': 'btext', 'text': f'*Nhà Phố* Gần *Cầu Rồng*\nChỉ *{round(d, -2):.0f}m*\nĐi Bộ Vài Phút ???', 'x': 540, 'y': 520, 'font': 'M900', 'size': 60, 'keyColor': '#FFD21F', 'strokeW': 3, 'stroke': '#3A2A00', 'shadowBlur': 12, 'enter': 'none', 'to': 2.2}
    els = [{'type': 'satmap', 'shade': False}, {'type': 'sky', 'clouds': 7},
           {'type': 'tint', 'color': '#0B3E5E', 'track': [{'t': 0, 'alpha': 0}, {'t': 1.8, 'alpha': 0}, {'t': 2.6, 'alpha': 0.2}]},
           {'type': 'neon', 'path': NVL, 'grow': {'at': 1.8, 'dur': 1.2}, 'from': 1.8, 'width': 9, 'smooth': True},
           {'type': 'neon', 'path': BD, 'grow': {'at': 2.2, 'dur': 1.0}, 'from': 2.2, 'width': 7, 'smooth': True, 'pulses': 1},
           {'type': 'card', 'variant': 'bracket', 'path': photo('dragon-bridge-diff'), 'geo': BRIDGE, 'label': 'Cầu Rồng', 'dx': -170, 'dy': -260, 'from': 3.2, 'to': 6.6, 'focus': [0.45, 0.55]},
           {'type': 'card', 'variant': 'bracket', 'path': photo('cau-song-han'), 'geo': [16.0719, 108.2267], 'label': 'Cầu Sông Hàn', 'dx': 170, 'dy': -250, 'from': 4.5, 'to': 6.6},
           {'type': 'pin', 'variant': 'gold', 'geo': HOME, 'icon': 'house', 'label': 'Căn nhà', 'size': 1.0},
           *[{'type': 'pin', 'variant': 'yellow', 'geo': g, 'icon': ic, 'label': lb, 'from': f, 'size': sz, 'labelSize': ls}
             for g, ic, lb, f, sz, ls in [([16.0648, 108.2200], 'cart', 'Siêu thị', 7.5, 0.85, 32), ([16.0560, 108.2195], 'school', 'Trường học', 8.2, 0.85, 32), ([16.0567, 108.2128], 'food', 'Nhà hàng', 8.8, 1.0, 30)]],
           title, WM(1545, 190),
           {'type': 'tint', 'color': '#000000', 'track': [{'t': 0, 'alpha': 0}, {'t': 15.0, 'alpha': 0}, {'t': 16.0, 'alpha': 1}]}]
    shot = {'start': 0, 'end': 16.0, 'view': [V(0, 108.2105), V(16, 108.2128)], 'elements': els,
            'sfx': [{'t': 1.8, 'kind': 'whoosh', 'gain': 0.5}, {'t': 3.2, 'kind': 'pop', 'gain': 0.4}, {'t': 4.5, 'kind': 'pop', 'gain': 0.4}, {'t': 6.5, 'kind': 'whoosh', 'gain': 0.3},
                    {'t': 7.5, 'kind': 'pop', 'gain': 0.4}, {'t': 8.2, 'kind': 'pop', 'gain': 0.4}, {'t': 8.8, 'kind': 'pop', 'gain': 0.4}]}
    save('drone.json', {'style': 'bds-drone', 'satmap': 'sat-drone/satmap.json', 'captions': NOCAP, 'shots': [shot]})
