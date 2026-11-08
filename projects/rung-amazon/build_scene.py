import json

MX, MY, MS = 560, 1010, 0.75  # world position/scale of the South America map


def mp(lon, lat):
    return [round(MX + (lon + 58) * 13 * MS), round(MY - (lat + 22) * 13 * MS)]


SRC_O2 = "NGUỒN: National Geographic, Oxford"
SRC_WWF = "NGUỒN: WWF"
SRC_NOBRE = "NGUỒN: Nobre 2014, ước tính"


def P(name, x, y, **kw):
    e = {"type": "prop", "name": name, "x": x, "y": y}
    e.update(kw)
    return e


def T(text, x, y, size, color="ink", **kw):
    e = {"type": "text", "text": text, "x": x, "y": y, "size": size, "color": color}
    e.update(kw)
    return e


def A(x, y, acting, scale=0.6, facing=1, **kw):
    e = {"type": "actor", "cast": "dan", "x": x, "y": y, "scale": scale, "facing": facing, "acting": acting}
    e.update(kw)
    return e


def sa_map(**kw):
    params = dict(kw.pop("params", {}), label="")
    m = P("southAmericaMap", MX, MY, scale=MS, params=params, **kw)
    lab = T("BẢN ĐỒ MINH HỌA", 245, 1180, 26, "ink", font="sans", alpha=0.7)
    for k in ("to", "exit", "draw"):
        if k in kw and k != "draw": lab[k] = kw[k]
    if "draw" in kw: lab["enter"] = "fade"; lab["from"] = 0.8
    return [m, lab]


def cam(*keys):
    return [dict(zip(("t", "x", "y", "zoom"), k)) for k in keys]


AM = mp(-63, -4)  # Amazon centre on map
shots = []

# 1. Hook 0 - 2.50: 20% bi gach + NGO NHAN
myth = dict(w=700, label="AMAZON TẠO RA", big="20% Ô-XY", bigSize=150, bigColor="gold")
shots.append({"start": 0, "end": 2.50, "camera": cam((0, 540, 900, 1.12), (2.5, 540, 960, 1.0)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1000}),
    P("jungleTree", 540, 1330, scale=0.85, params={"h": 470}, draw={"at": 0, "dur": 1.0, "hand": False}),
    P("infoPanel", 540, 210, params=myth, enter="pop", to=1.0),
    P("infoPanel", 540, 210, params=dict(myth, strike=True), from_=1.0),
    T("NGỘ NHẬN", 560, 610, 130, "red", font="sans", bold=True, rotate=-0.08, enter="pop", **{"from": 1.15}),
  ],
  "sfx": [{"t": 0.05, "kind": "drum", "gain": 0.5}, {"t": 1.0, "kind": "thud", "gain": 0.5}]})

# 2. 2.50 - 4.61: bang ngo nhan day du + nguoi dan
shots.append({"start": 2.50, "end": 4.61, "camera": cam((0, 540, 960, 1.0), (2.11, 560, 930, 1.06)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1000}),
    P("jungleTree", 360, 1330, scale=0.75, params={"h": 470}, track=[{"t": 0, "x": 540, "scale": 0.85}, {"t": 0.6, "x": 360, "scale": 0.75}]),
    P("infoPanel", 540, 190, params={"w": 820, "label": "NGỘ NHẬN PHỔ BIẾN", "title": "“Amazon tạo ra 20%\nô-xy của Trái Đất”", "titleSize": 48,
                                       "big": "20%", "bigSize": 130, "bigColor": "gold", "strike": True, "source": SRC_O2}),
    T("NGỘ NHẬN", 700, 470, 84, "red", font="sans", bold=True, rotate=-0.1, enter="pop", **{"from": 1.45}),
    A(1150, 1330, [{"t": 0, "pose": "stand", "expr": "neutral", "cycle": "walk"},
                   {"t": 1.0, "pose": "stand", "expr": "neutral"},
                   {"t": 1.4, "pose": "point", "expr": "determined", "snap": True}],
      scale=0.6, facing=-1, track=[{"t": 0, "x": 1150}, {"t": 1.0, "x": 830, "ease": "linear"}]),
  ],
  "sfx": [{"t": 1.42, "kind": "pop", "gain": 0.4}]})

# 3. 4.61 - 6.14: cay + vi sinh vat, o-xy bay len
shots.append({"start": 4.61, "end": 6.14, "camera": cam((0, 560, 930, 1.06), (1.53, 470, 900, 1.15)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1000}),
    P("jungleTree", 360, 1330, scale=0.75, params={"h": 470}),
    P("arrow", 380, 760, params={"dx": 160, "dy": -320, "bend": -0.25, "color": "green"}, ptrack=[{"t": 0.1, "progress": 0}, {"t": 0.9, "progress": 1}]),
    T("Ô-XY", 720, 490, 80, "green", font="sans", bold=True, enter="pop", **{"from": 0.7}),
    T("CÂY + VI SINH VẬT", 470, 290, 84, "gold", font="sans", bold=True, enter="pop", **{"from": 0.0}),
    A(830, 1330, [{"t": 0, "pose": "point", "expr": "determined"}, {"t": 0.5, "pose": "scratchHead", "expr": "surprised", "cycle": "scratch"}], scale=0.6, facing=-1),
  ],
  "sfx": [{"t": 0.55, "kind": "pop", "gain": 0.3}]})

# 4. 6.14 - 8.61: dung lai gan het -> ~0
shots.append({"start": 6.14, "end": 8.61, "camera": cam((0, 470, 900, 1.15), (2.47, 540, 930, 1.05)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1000}),
    P("jungleTree", 360, 1330, scale=0.75, params={"h": 470}),
    P("arrow", 380, 760, params={"dx": 160, "dy": -320, "bend": -0.25, "color": "green"}),
    P("arrow", 560, 430, params={"dx": -40, "dy": 800, "bend": -0.35, "color": "red", "dashed": True}, ptrack=[{"t": 0, "progress": 0}, {"t": 1.4, "progress": 1}]),
    P("infoPanel", 540, 190, params={"w": 760, "label": "Ô-XY RÒNG CỦA AMAZON", "big": "~0", "bigSize": 130, "bigColor": "gold", "source": SRC_O2}, enter="pop", **{"from": 1.2}),
    A(830, 1330, [{"t": 0, "pose": "scratchHead", "expr": "surprised", "cycle": "scratch"}, {"t": 1.3, "pose": "scared", "expr": "surprised", "snap": True}], scale=0.6, facing=-1),
  ],
  "sfx": [{"t": 1.1, "kind": "pop", "gain": 0.4}]})

# 5. 8.61 - 10.20: keo lui, ca khu rung
forest = [P("jungleTree", x, 1330, scale=s, params={"h": h}) for x, s, h in [(-240, 0.75, 460), (60, 0.6, 420), (1200, 0.8, 480), (1480, 0.7, 430)]]
shots.append({"start": 8.61, "end": 10.20, "camera": cam((0, 540, 930, 1.05), (1.59, 540, 880, 0.62, )),
  "elements": [
    P("ground", 540, 1330, params={"w": 2000}),
    *forest,
    P("jungleTree", 360, 1330, scale=0.75, params={"h": 470}),
    P("parrot", -300, 500, scale=0.8, track=[{"t": 0.2, "x": -300}, {"t": 1.59, "x": 1400, "ease": "linear"}]),
    A(830, 1330, [{"t": 0, "pose": "point", "expr": "grin", "snap": True}], scale=0.6, facing=1),
    T("LẠ HƠN NHIỀU", 540, 300, 130, "gold", font="sans", bold=True, enter="pop", **{"from": 0.75}),
  ],
  "sfx": [{"t": 0.05, "kind": "whoosh", "gain": 0.35}, {"t": 0.7, "kind": "pop", "gain": 0.3}]})
shots[-1]["camera"][-1]["ease"] = "out"

# 6. 10.20 - 13.08: ban do + dien tich
shots.append({"start": 10.20, "end": 13.08, "camera": cam((0, 540, 980, 1.0), (2.88, 540, 940, 1.04)),
  "elements": [
    *sa_map(params={"fill": 0}, ptrack=[{"t": 0, "fill": 0}, {"t": 1.0, "fill": 0}, {"t": 2.2, "fill": 1, "ease": "out"}], draw={"at": 0, "dur": 1.2, "hand": False}),
    P("infoPanel", 540, 190, params={"w": 900, "label": "DIỆN TÍCH VÙNG AMAZON", "big": "6,7 TRIỆU KM²", "bigColor": "gold", "source": SRC_WWF}, enter="pop", **{"from": 1.5}),
  ],
  "sfx": [{"t": 1.45, "kind": "pop", "gain": 0.4}]})

# 7. 13.08 - 16.52: x20 Viet Nam -> 9 quoc gia va vung lanh tho
pins = [(-55, -8), (-64, -16), (-75, -9), (-78, -1.5), (-73, 3), (-66, 7), (-59, 5), (-56, 3.5), (-52.5, 3.8)]
pin_el = []
for i, (lo, la) in enumerate(pins):
    x, y = mp(lo, la)
    pin_el.append(P("pin", x, y, params={"size": 0.6, "progress": 0}, ptrack=[{"t": 1.5 + i * 0.12, "progress": 0}, {"t": 1.75 + i * 0.12, "progress": 1}]))
shots.append({"start": 13.08, "end": 16.52, "camera": cam((0, 540, 940, 1.04), (3.44, 520, 900, 1.12)),
  "elements": [
    *sa_map(),
    P("infoPanel", 540, 190, params={"w": 900, "label": "SO VỚI VIỆT NAM", "big": "×20", "bigSize": 120, "bigColor": "gold",
                                       "bars": [{"label": "Vùng Amazon", "value": 1, "color": "green", "text": "6,7 tr km²"},
                                                {"label": "Việt Nam", "value": 0.05, "color": "gold", "text": "0,33 tr km²"}],
                                       "source": "NGUỒN: WWF, Britannica"}, ptrack=[{"t": 0, "progress": 0}, {"t": 1.0, "progress": 1}], to=1.4, exit="fade"),
    P("infoPanel", 540, 190, params={"w": 900, "label": "TRẢI TRÊN", "title": "9 quốc gia\nvà vùng lãnh thổ", "titleSize": 60, "source": "NGUỒN: WWF, Britannica"}, enter="pop", **{"from": 1.42}),
    *pin_el,
  ],
  "sfx": [{"t": 0.1, "kind": "pop", "gain": 0.3}, {"t": 1.5, "kind": "tap", "gain": 0.35}]})

# 8. 16.52 - 18.91: 390 ty cay
canopy = []
for i, (x, s, h) in enumerate([(120, 0.62, 420), (330, 0.72, 480), (560, 0.8, 520), (790, 0.7, 460), (980, 0.6, 400), (-80, 0.55, 380), (1180, 0.55, 380)]):
    canopy.append(P("jungleTree", x, 1330, scale=s, params={"h": h}, enter="drop", **{"from": 0.25 + 0.1 * i}))
shots.append({"start": 16.52, "end": 18.91, "camera": cam((0, 520, 820, 1.6), (0.9, 540, 960, 1.0), (2.39, 560, 950, 1.03)),
  "elements": [
    *sa_map(alpha=1, to=0.45, exit="fade"),
    P("ground", 540, 1330, params={"w": 1600}),
    *canopy,
    P("infoPanel", 540, 190, params={"w": 820, "label": "SỐ CÂY Ở AMAZON", "big": "390 TỶ CÂY", "bigColor": "gold", "source": "NGUỒN: Science 2013"}, enter="pop", **{"from": 1.0}),
  ],
  "sfx": [{"t": 0.95, "kind": "pop", "gain": 0.4}]})

# 9. 18.91 - 21.23: >=10% loai
canopy2 = [{k: v for k, v in e.items() if k not in ("enter", "from")} for e in canopy]
shots.append({"start": 18.91, "end": 21.23, "camera": cam((0, 560, 950, 1.03), (2.32, 545, 930, 1.05)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1600}),
    *canopy2,
    P("parrot", -300, 700, scale=0.7, track=[{"t": 0.1, "x": -300, "y": 720}, {"t": 2.32, "x": 1400, "y": 660, "ease": "linear"}]),
    P("infoPanel", 540, 190, params={"w": 820, "label": "SỐ LOÀI ĐÃ BIẾT TRÊN TRÁI ĐẤT", "big": "ÍT NHẤT 10%", "bigColor": "gold", "w": 900,
                                       "bars": [{"label": "Có ở Amazon", "value": 0.1, "color": "gold", "text": "1/10"}], "source": SRC_WWF},
      ptrack=[{"t": 0.2, "progress": 0}, {"t": 1.2, "progress": 1}], enter="pop"),
  ],
  "sfx": [{"t": 0.0, "kind": "pop", "gain": 0.3}]})

# 10. 21.23 - 24.32: song Amazon 1/5
shots.append({"start": 21.23, "end": 24.32, "camera": cam((0, 540, 980, 1.0), (3.09, 540, 940, 1.06)),
  "elements": [
    P("riverPath", 540, 1010, scale=0.68, rotate=-0.95, params={"w": 46}, ptrack=[{"t": 0, "progress": 0}, {"t": 2.0, "progress": 1}], draw={"at": 0, "dur": 0.6, "hand": False}),
    P("infoPanel", 540, 190, params={"w": 860, "label": "SÔNG AMAZON ĐỔ RA BIỂN", "big": "~1/5", "bigSize": 130, "bigColor": "gold", "title": "lượng nước sông cả thế giới", "titleSize": 44, "source": "NGUỒN: Britannica"}, enter="pop", **{"from": 0.9}),
  ],
  "sfx": [{"t": 0.1, "kind": "splash", "gain": 0.3}, {"t": 0.85, "kind": "pop", "gain": 0.35}]})

# 11. 24.32 - 26.94: tren troi con mot dong song lon hon
shots.append({"start": 24.32, "end": 26.94, "camera": cam((0, 540, 940, 1.06), (1.2, 540, 900, 0.95), (2.62, 540, 880, 0.95)),
  "elements": [
    P("riverPath", 540, 1010, scale=0.68, rotate=-0.95, params={"w": 46}),
    P("vaporFlow", 160, 620, params={"dx": 760, "dy": -120, "n": 4, "progress": 0}, ptrack=[{"t": 0.5, "progress": 0}, {"t": 1.8, "progress": 1}]),
    T("SÔNG TRÊN TRỜI?", 540, 300, 100, "gold", font="sans", bold=True, enter="pop", **{"from": 1.0}),
  ],
  "sfx": [{"t": 0.3, "kind": "whoosh", "gain": 0.3}, {"t": 0.95, "kind": "pop", "gain": 0.35}]})

# 12. 26.94 - 29.51: cay hut nuoc, tho hoi nuoc
shots.append({"start": 26.94, "end": 29.51, "camera": cam((0, 540, 900, 1.0), (2.57, 500, 880, 1.08)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1100}),
    P("jungleTree", 440, 1330, scale=0.9, params={"h": 470}, enter="fade"),
    P("arrow", 440, 1290, params={"dx": 0, "dy": -420, "bend": 0.08, "color": "navy", "dashed": True}, ptrack=[{"t": 0.1, "progress": 0}, {"t": 0.9, "progress": 1}]),
    P("vaporFlow", 420, 560, params={"dx": 80, "dy": -360, "n": 3, "gap": 70, "progress": 0}, ptrack=[{"t": 1.0, "progress": 0}, {"t": 2.2, "progress": 1}]),
    A(860, 1330, [{"t": 0, "pose": "point", "expr": "calm"}, {"t": 1.0, "pose": "think", "expr": "happy", "blend": 0.4}], scale=0.58, facing=-1),
  ],
  "sfx": [{"t": 1.0, "kind": "wind", "gain": 0.25, "dur": 1.5}]})

# 13. 29.51 - 32.78: uoc tinh 20 ty tan len troi
shots.append({"start": 29.51, "end": 32.78, "camera": cam((0, 500, 880, 1.08), (1.0, 540, 930, 1.0), (3.27, 540, 960, 0.97)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1600}),
    *[P("jungleTree", x, 1330, scale=s, params={"h": h}) for x, s, h in [(140, 0.6, 400), (440, 0.7, 440), (760, 0.62, 420), (1000, 0.55, 380)]],
    *[P("vaporFlow", x, 900, params={"dx": 60, "dy": -300, "n": 2, "gap": 60}) for x in (140, 440, 760)],
    P("infoPanel", 540, 190, params={"w": 860, "label": "THEO MỘT ƯỚC TÍNH", "title": "Rừng đẩy lên trời mỗi ngày", "titleSize": 46,
                                       "big": "20 TỶ TẤN", "bigColor": "navy", "source": SRC_NOBRE}, enter="pop", **{"from": 0.1}),
  ],
  "sfx": [{"t": 0.05, "kind": "pop", "gain": 0.3}, {"t": 0.8, "kind": "wind", "gain": 0.2, "dur": 2.2}]})

# 14. 32.78 - 35.40: 20 > 17
shots.append({"start": 32.78, "end": 35.40, "camera": cam((0, 540, 960, 0.97), (2.62, 540, 900, 1.05)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1600}),
    *[P("jungleTree", x, 1330, scale=s, params={"h": h}) for x, s, h in [(140, 0.6, 400), (440, 0.7, 440), (760, 0.62, 420), (1000, 0.55, 380)]],
    P("infoPanel", 540, 190, params={"w": 860, "label": "MỖI NGÀY · THEO MỘT ƯỚC TÍNH", "title": "Sông bay lớn hơn\nsông Amazon", "titleSize": 52,
                                       "bars": [{"label": "Hơi nước lên trời", "value": 1, "color": "navy", "text": "20 tỷ tấn"},
                                                {"label": "Sông Amazon ra biển", "value": 0.85, "color": "waterDeep", "text": "17 tỷ tấn"}],
                                       "source": SRC_NOBRE}, ptrack=[{"t": 0.1, "progress": 0.0}, {"t": 1.6, "progress": 1}]),
    T("20 > 17", 540, 830, 150, "gold", font="sans", bold=True, enter="pop", **{"from": 1.75}),
  ],
  "sfx": [{"t": 1.7, "kind": "drum", "gain": 0.4}]})

# 15. 35.40 - 38.28: gio mang hoi nuoc thanh mua (ban do)
VF1 = dict(x=800, y=800, dx=-380, dy=20)
VF2 = dict(x=440, y=805, dx=90, dy=300)
def vmap(prog=None, **kw):
    out = []
    for i, v in enumerate((VF1, VF2)):
        params = dict(dx=v["dx"], dy=v["dy"], n=3, gap=34); params.update(kw)
        e = P("vaporFlow", v["x"], v["y"], params=params)
        if prog:
            a, b = prog
            mid = a + (b - a) * 0.5
            seg = (a, mid) if i == 0 else (mid, b)
            e["params"]["progress"] = 0
            e["ptrack"] = [{"t": seg[0], "progress": 0}, {"t": seg[1], "progress": 1}]
        out.append(e)
    return out
CLOUD = (540, 1150)
shots.append({"start": 35.40, "end": 38.28, "camera": cam((0, 540, 940, 1.0), (2.88, 520, 960, 1.1)),
  "elements": [
    *sa_map(),
    *vmap((0.1, 2.0)),
    P("cloud", *CLOUD, scale=0.5, enter="pop", **{"from": 1.9}),
    T("GIÓ", 800, 650, 70, "navy", font="sans", bold=True, enter="fade", **{"from": 0.2}),
    T("MƯA", 720, 1150, 64, "navy", font="sans", bold=True, enter="pop", **{"from": 2.0}),
  ],
  "sfx": [{"t": 0.0, "kind": "wind", "gain": 0.35, "dur": 2.6}]})

# 16. 38.28 - 40.56: SONG BAY
shots.append({"start": 38.28, "end": 40.56, "camera": cam((0, 520, 960, 1.1), (2.28, 540, 900, 1.0)),
  "elements": [
    *sa_map(),
    *[dict(e, track=[{"t": 0, "alpha": 0.6}, {"t": 1.2, "alpha": 1}]) for e in vmap(n=3, gap=30, color="gold")],
    P("cloud", *CLOUD, scale=0.5),
    T("SÔNG BAY", 540, 330, 160, "gold", font="sans", bold=True, enter="pop", **{"from": 1.1}),
  ],
  "sfx": [{"t": 1.05, "kind": "drum", "gain": 0.45}]})

# 17. 40.56 - 42.55: 17% da mat
shots.append({"start": 40.56, "end": 42.55, "camera": cam((0, 540, 900, 1.0), (1.99, 520, 880, 1.12)),
  "elements": [
    *sa_map(params={"lost": 0}, ptrack=[{"t": 0.3, "lost": 0}, {"t": 1.7, "lost": 1, "ease": "out"}]),
    *vmap(),
    P("infoPanel", 540, 190, params={"w": 820, "label": "RỪNG AMAZON ĐÃ MẤT HẲN", "big": "~17%", "bigSize": 140, "bigColor": "red", "source": "NGUỒN: WWF 2022"}, enter="pop", **{"from": 0.25}),
  ],
  "sfx": [{"t": 0.35, "kind": "crack", "gain": 0.5}]})

# 18. 42.55 - 44.18: mat cay, song bay yeu dan
shots.append({"start": 42.55, "end": 44.18, "camera": cam((0, 540, 960, 1.0), (1.63, 540, 930, 1.06)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1100}),
    P("jungleTree", 160, 1330, scale=0.55, params={"h": 380}),
    *[P("stump", x, 1330, scale=0.75, enter="pop", **{"from": f}) for x, f in [(390, 0.05), (600, 0.2), (960, 0.35)]],
    P("vaporFlow", 120, 700, params={"dx": 820, "dy": -160, "n": 4, "strength": 1}, ptrack=[{"t": 0.3, "strength": 1}, {"t": 1.5, "strength": 0.12}]),
    A(780, 1330, [{"t": 0, "pose": "stand", "expr": "surprised"}, {"t": 0.6, "pose": "sad", "expr": "sad", "blend": 0.5}], scale=0.58, facing=-1),
    T("SÔNG BAY YẾU DẦN", 540, 300, 96, "red", font="sans", bold=True, enter="pop", **{"from": 0.65}),
  ],
  "sfx": [{"t": 0.05, "kind": "thud", "gain": 0.45}]})

# 19. 44.18 - 47.80: ban tung tin?
shots.append({"start": 44.18, "end": 47.80, "camera": cam((0, 540, 900, 0.95), (3.62, 540, 960, 1.06)),
  "elements": [
    P("ground", 540, 1330, params={"w": 1000}),
    P("jungleTree", 360, 1330, scale=0.75, params={"h": 470}),
    P("infoPanel", 540, 400, params=dict(myth, strike=True, w=620, bigSize=120), enter="pop", **{"from": 0.1}),
    T("BẠN TỪNG TIN?", 540, 260, 120, "gold", font="sans", bold=True, enter="pop", **{"from": 0.0}),
    P("question", 640, 820, params={"size": 260, "color": "gold"}, enter="pop", motion="bob", **{"from": 1.1}),
    A(830, 1330, [{"t": 0, "pose": "point", "expr": "grin", "snap": True}, {"t": 1.9, "pose": "cheer", "expr": "happy", "snap": True}], scale=0.62, facing=-1),
  ],
  "sfx": [{"t": 0.0, "kind": "pop", "gain": 0.4}, {"t": 1.85, "kind": "chime", "gain": 0.35}]})

# fix "from_" helper usage
for sh in shots:
    for e in sh["elements"]:
        if "from_" in e:
            e["from"] = e.pop("from_")

scene = {
    "width": 1080, "height": 1920, "fps": 30, "style": "ban-do-toi", "textFollowsCamera": True,
    "narration": {"path": "audio/narration.wav", "lead": 0.15},
    "captions": {"path": "captions-audio.json", "lead": 0.15, "y": 1420, "size": 58},
    "cast": {"dan": {"hat": "cap", "hatColor": "gold", "sash": "green", "sashX": False, "belt": "green"}},
    "shots": shots,
}
json.dump(scene, open("/home/user/QBK-media/projects/rung-amazon/scene.json", "w"), ensure_ascii=False, indent=1)
print(len(shots), "shots")
