#!/usr/bin/env python3
"""Dựng video giới thiệu bất động sản (phong cách `bds`) từ projects/<slug>/bds.json.

  python3 studio/tools/bds_build.py projects/<slug> [--no-fetch] [--refresh-routes]

Làm 4 việc:
  1. Lấy tuyến đường, km, phút từ dự án tới từng địa điểm (OSRM, miễn phí) → routes.json (lưu lại, chạy lại không gọi mạng).
  2. Tính zoom cho từng cảnh: lùi dần đến khi cả tuyến nằm gọn trong khung (camera nghiêng 40°, dự án luôn ở giữa).
  3. Tải đúng vùng ảnh vệ tinh Esri cần cho mọi khung → sat/ (gọi satmap.py). Bỏ qua bằng --no-fetch.
  4. Viết scene.json: mở đầu → ảnh BĐS → các địa điểm → kết (đổi thứ tự bằng "order").

Có audio/narration.wav + captions-audio.json thì tự gắn giọng đọc, phụ đề và kéo cảnh cuối cho hết lời.
Muốn một cảnh bắt đầu đúng câu nào thì ghi "cue": <số thứ tự cụm phụ đề, từ 0> vào mục đó.
Mẫu bds.json và giải thích từng trường: studio/references/vi-tri-ket-noi-bds/bds.example.json
"""
import json, math, os, subprocess, sys, urllib.request

W, H = 1080, 1920
K = W / 576
D = W * 1.736
TOP_ROW = round(H * 0.127)
CAP_Y = 250
FIT_X = (80 * K, W - 80 * K)
FIT_TOP = 450
CARD_B = H - 84 * K
CARD_TOP = CARD_B - 108 * K
OUT_TOP = CARD_B - 176 * K
TILT = 40
CREDIT = 'Ảnh vệ tinh: Esri, Maxar · Đường: © OpenStreetMap · Số liệu ước tính'
UA = 'QBKStudio/1.0'
DEF_DUR = {'intro': 3.5, 'photo': 3.2, 'specs': 4.5, 'poi': 5.5, 'outro': 4.0}


def merc(lat, lon):
    s = math.sin(math.radians(max(-85.05, min(85.05, lat))))
    return (lon + 180) / 360, 0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)


def unmerc(mx, my):
    lon = mx * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * my))))
    return lat, lon


def proj(c, z, tilt, lat, lon):
    m = merc(lat, lon); Wz = 256 * 2 ** z
    u, w = (m[0] - c[0]) * Wz, (m[1] - c[1]) * Wz
    ph = math.radians(tilt); den = D - w * math.sin(ph)
    if den < D * 0.05: return None
    sc = D / den
    return W / 2 + u * sc, H / 2 + sc * w * math.cos(ph)


def fit_zoom(c, pts, top, bottom):
    z = 16.2
    while z > 8:
        ok = True
        for lat, lon in pts:
            q = proj(c, z, TILT, lat, lon)
            if not q or q[0] < FIT_X[0] or q[0] > FIT_X[1] or q[1] < top or q[1] > bottom: ok = False; break
        if ok: return round(z, 2)
        z -= 0.02
    return 9.0


def tilt_rect(tilt):
    ph = math.radians(tilt); c, s = math.cos(ph), math.sin(ph)
    def row(ys):
        yp = ys - H / 2; Q = D * c + yp * s
        return yp * D / Q, W / 2 / (Q / (D * c))
    tv, th = row(TOP_ROW); bv, _ = row(H)
    if tilt < 0.5: tv, th, bv = -H / 2, W / 2, H / 2
    return -th - 40, th + 40, tv - 40, bv + 40


def rdp(pts, eps):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1e-12
    i, dmax = 0, 0
    for k in range(1, len(pts) - 1):
        d = abs(dy * pts[k][0] - dx * pts[k][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > dmax: i, dmax = k, d
    if dmax <= eps: return [a, b]
    return rdp(pts[:i + 1], eps)[:-1] + rdp(pts[i:], eps)


def osrm(p, q):
    u = f"https://router.project-osrm.org/route/v1/driving/{p['lon']},{p['lat']};{q['lon']},{q['lat']}?overview=full&geometries=geojson"
    j = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=30))
    r = j['routes'][0]
    path = [[round(c[1], 6), round(c[0], 6)] for c in r['geometry']['coordinates']]
    return {'path': rdp(path, 0.00002), 'km': round(r['distance'] / 1000, 2), 'min': round(r['duration'] / 60, 1)}


def main():
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(2)
    root = a[0]; fetch = '--no-fetch' not in a
    cfg = json.load(open(os.path.join(root, 'bds.json')))
    P = cfg['project']; pois = cfg.get('pois', []); photos = cfg.get('photos', [])
    dur = {**DEF_DUR, **cfg.get('durations', {})}
    c = merc(P['lat'], P['lon'])

    # 1. tuyến đường
    rf = os.path.join(root, 'routes.json')
    cache = json.load(open(rf)) if os.path.exists(rf) and '--refresh-routes' not in a else {}
    for p in pois:
        key = f"{P['lat']},{P['lon']}>{p['lat']},{p['lon']}"
        if key not in cache:
            if p.get('path'): cache[key] = {'path': p['path'], 'km': p.get('km'), 'min': p.get('min')}
            else: print('  OSRM:', p['name']); cache[key] = osrm(P, p)
        p['_r'] = cache[key]
        if p.get('km') is not None: p['_r']['km'] = p['km']
        if p.get('min') is not None: p['_r']['min'] = p['min']
    json.dump(cache, open(rf, 'w'), ensure_ascii=False)

    # 2. zoom
    proj_pt = [(P['lat'], P['lon'])]
    fits = [fit_zoom(c, proj_pt + [tuple(x) for x in p['_r']['path']], FIT_TOP, CARD_TOP - 44 * K) for p in pois]
    fit_all = fit_zoom(c, proj_pt + [tuple(x) for p in pois for x in p['_r']['path']], FIT_TOP, OUT_TOP - 44 * K) if pois else 13
    z_intro = (min(12.8, (fits[0] if fits else 15) - 2), min(15.0, max(fits) if fits else 15))
    if cfg.get('introZoom'): z_intro = tuple(cfg['introZoom'])
    if cfg.get('outroZoom'): fit_all = cfg['outroZoom']

    # thời gian theo giọng đọc
    caps_f = os.path.join(root, 'captions-audio.json'); lead = cfg.get('lead', 0.15)
    caps = json.load(open(caps_f)) if os.path.exists(caps_f) else []
    narr = os.path.join(root, 'audio', 'narration.wav')
    narr_end = (caps[-1]['end'] + lead) if caps else 0

    # 3. dựng danh sách cảnh
    name = cfg['name']; spec_items = cfg.get('specs', []); amen = cfg.get('amenities', [])
    STY_C = [p.get('sty', 'gold') for p in pois]
    footer = {'type': 'bdsFooter', 'text': cfg.get('footer', ''), 'credit': cfg.get('credit', CREDIT)}
    proj_pin = lambda **kw: {'type': 'bdsPin', 'geo': [P['lat'], P['lon']], 'label': name, 'project': True, 'sty': 'gold', 'id': 'project', 'pop': False, **kw}
    bar = lambda i: {'type': 'bdsBar', 'name': name, 'area': cfg.get('area', ''), 'colors': STY_C, 'active': i}
    MAP = [{'type': 'satmap', 'shade': False}, {'type': 'bdsShade'}]
    plan = []  # (kind, item)
    for sec in cfg.get('order', ['intro', 'photos', 'map', 'outro']):
        if sec == 'intro': plan.append(('intro', cfg))
        elif sec == 'photos': plan += [('photo', ph) for ph in photos]
        elif sec == 'map': plan += [('poi', (i, p)) for i, p in enumerate(pois)]
        elif sec == 'outro': plan.append(('outro', cfg))
    shots, t, last_view = [], 0.0, {'zoom': z_intro[1], 'tilt': TILT}
    view = lambda *keys: [{'t': round(k[0], 2), 'lat': P['lat'], 'lon': P['lon'], 'zoom': k[1], 'tilt': k[2]} for k in keys]
    for n, (kind, it) in enumerate(plan):
        item = it[1] if kind == 'poi' else it
        d = item.get('dur') if isinstance(item, dict) and kind in ('photo', 'poi') else None
        d = d or dur['specs' if kind == 'photo' and item.get('show') == 'specs' else kind]
        cue = item.get('cue') if isinstance(item, dict) and kind in ('photo', 'poi') else None
        if kind in ('intro', 'outro'): cue = cfg.get(kind + 'Cue')
        if cue is not None and caps and n > 0:  # cảnh trước kết thúc đúng lúc câu này bắt đầu
            ts = round(caps[cue]['start'] + lead, 2)
            if ts > shots[-1]['start'] + 0.8: shots[-1]['end'] = ts; t = ts
        sh = {'start': round(t, 2), 'end': round(t + d, 2)}
        f = min(1.0, d / 5.5)
        if kind == 'intro':
            sh.update(view=view((0, z_intro[0], 15), (d, z_intro[1], TILT)),
                      elements=MAP + [proj_pin(pop=True, **{'from': 0.4}), {'type': 'bdsHeadline', 'lines': cfg.get('intro', [name, '']), 'sub': cfg.get('subtitle', '')}, footer],
                      sfx=[{'t': 0.05, 'kind': 'whoosh', 'gain': 0.4}, {'t': 0.45, 'kind': 'pop', 'gain': 0.3}])
            last_view = {'zoom': z_intro[1], 'tilt': TILT}
        elif kind == 'photo':
            ph = item; els = [{'type': 'bdsPhoto', 'path': ph['path'], **{k: ph[k] for k in ('mode', 'focus', 'focusTo', 'zoom', 'dim', 'illustration', 'move') if k in ph}}]
            cap = {'type': 'bdsCaption', **{k: ph[k] for k in ('kicker', 'title', 'sub', 'sty') if k in ph}, 'from': 0.25}
            if ph.get('show') == 'specs' and spec_items:
                hspec = (40 + 44 * len(spec_items) + 12) * K
                els.append({'type': 'bdsSpecs', 'title': ph.get('specsTitle', 'Thông tin dự án'), 'items': spec_items, 'from': 0.35})
                cap['y'] = CARD_B - hspec - 22 * K; cap.pop('sub', None)
            elif ph.get('show') == 'chips' and amen:
                rows = 1 + (len(amen) - 1) // 3
                els.append({'type': 'bdsChips', 'items': amen, 'from': 0.45})
                cap['y'] = CARD_B - rows * 42 * K - 16 * K
            if 'y' in cap:  # ảnh ngang (khung) nằm gọn phía trên tiêu đề + thẻ
                els[0]['bottom'] = round(cap['y'] - (150 if any(k in ph for k in ('kicker', 'title')) else 0) - 20, 1)
            if 'y' in ph: els[0]['y'] = ph['y']
            if any(k in ph for k in ('kicker', 'title', 'sub')): els.append(cap)
            els.append(footer)
            sh.update(elements=els, transition='fade', transitionDur=0.35, sfx=[{'t': 0.02, 'kind': 'whoosh', 'gain': 0.22}])
        elif kind == 'poi':
            i, p = it; r = p['_r']; z0 = last_view['zoom']
            sh.update(view=view((0, z0, TILT), (1.4 * f, fits[i], TILT), (d, fits[i], TILT)),
                      elements=MAP + [{'type': 'bdsRoute', 'path': r['path'], 'sty': p.get('sty', 'gold'), 'grow': {'at': 0.9 * f, 'dur': 2.6 * f}},
                                      proj_pin(),
                                      {'type': 'bdsPin', 'geo': [p['lat'], p['lon']], 'label': p['name'], 'sty': p.get('sty', 'gold'), 'id': 'poi', 'from': 3.4 * f},
                                      {'type': 'bdsCard', 'cat': p.get('cat', ''), 'name': p['name'], 'km': r.get('km'), 'min': r.get('min'), 'extra': p.get('extra'), 'sty': p.get('sty', 'gold'), 'index': i, 'total': len(pois), 'from': 1.0 * f},
                                      bar(i), footer],
                      sfx=[{'t': 0.9 * f, 'kind': 'whoosh', 'gain': 0.18}, {'t': 3.4 * f, 'kind': 'pop', 'gain': 0.35}])
            if n > 0 and plan[n - 1][0] == 'photo': sh.update(transition='fade', transitionDur=0.35)
            last_view = {'zoom': fits[i], 'tilt': TILT}
        elif kind == 'outro':
            z0 = last_view['zoom']; ob = OUT_TOP - 14 * K
            els = MAP + [{'type': 'bdsRoute', 'path': p['_r']['path'], 'sty': p.get('sty', 'gold'), 'alpha': 0.6, 'head': False} for p in pois]
            els += [{'type': 'bdsPin', 'geo': [p['lat'], p['lon']], 'sty': p.get('sty', 'gold'), 'size': 0.6, 'pop': False, 'id': f'p{j}'} for j, p in enumerate(pois)]
            els += [proj_pin(bottom=ob), {'type': 'bdsOutro', 'name': name, 'tagline': cfg.get('tagline', ''), 'cta': cfg.get('cta', ''), 'note': cfg.get('note', ''), 'from': 0.6}, bar(len(pois)), footer]
            sh.update(view=view((0, z0, TILT), (1.8, fit_all, TILT), (d, fit_all, TILT)), elements=els, sfx=[{'t': 0.6, 'kind': 'chime', 'gain': 0.3}])
            if n > 0 and plan[n - 1][0] == 'photo': sh.update(transition='fade', transitionDur=0.35)
        shots.append(sh); t += d
    if caps and shots[-1]['end'] < narr_end + 0.8: shots[-1]['end'] = round(narr_end + 0.8, 2)
    for x in shots: x['start'], x['end'] = round(x['start'], 2), round(x['end'], 2)

    # 4. ảnh vệ tinh: hợp các vùng khung nhìn theo mức zoom nguyên
    need = {}
    for sh in shots:
        V = sh.get('view'); dsh = sh['end'] - sh['start']
        if not V: continue
        for k in range(int(dsh * 10) + 1):
            tt = k / 10; i = next((j for j, v in enumerate(V) if v['t'] > tt), len(V))
            if i == 0: zv, tl = V[0]['zoom'], V[0]['tilt']
            elif i == len(V): zv, tl = V[-1]['zoom'], V[-1]['tilt']
            else:
                A, B = V[i - 1], V[i]; u = (tt - A['t']) / (B['t'] - A['t']); e = u * u * (3 - 2 * u)
                zv, tl = A['zoom'] + (B['zoom'] - A['zoom']) * e, A['tilt'] + (B['tilt'] - A['tilt']) * e
            Z = min(17, math.ceil(zv - 0.05)); x0, x1, y0, y1 = tilt_rect(tl); s = 2 ** (Z - zv)
            r = need.setdefault(Z, [1e18, 1e18, -1e18, -1e18])
            r[0] = min(r[0], x0 * s); r[1] = min(r[1], y0 * s); r[2] = max(r[2], x1 * s); r[3] = max(r[3], y1 * s)
    levels = []
    for Z, (x0, y0, x1, y1) in sorted(need.items()):
        Wz = 256 * 2 ** Z; cx, cy = c[0] * Wz + (x0 + x1) / 2, c[1] * Wz + (y0 + y1) / 2
        w, h = min(7000, int(x1 - x0) + 64), min(8000, int(y1 - y0) + 64)
        lat, lon = unmerc(cx / Wz, cy / Wz); levels.append(f'{Z}:{lat:.6f},{lon:.6f}:{w}x{h}')
    if fetch and levels:
        tool = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'satmap.py')
        subprocess.run([sys.executable, tool, os.path.join(root, 'sat'), '--grade', cfg.get('grade', '0.95,0.92,1.06')] + sum([['--level', l] for l in levels], []), check=True)

    scene = {'style': 'bds', 'satmap': 'sat/satmap.json', 'credit': '', 'shots': shots}
    if caps:
        scene['captions'] = {'path': 'captions-audio.json', 'lead': lead, 'y': CAP_Y, 'size': 54}
    if os.path.exists(narr): scene['narration'] = {'path': 'audio/narration.wav', 'lead': lead}
    if cfg.get('music'): scene['music'] = cfg['music']
    json.dump(scene, open(os.path.join(root, 'scene.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps({'scene': os.path.join(root, 'scene.json'), 'seconds': shots[-1]['end'], 'shots': len(shots),
                      'routes': [{'name': p['name'], 'km': p['_r']['km'], 'min': p['_r']['min'], 'pts': len(p['_r']['path'])} for p in pois],
                      'zoom': fits, 'zoomAll': fit_all, 'satLevels': levels}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
