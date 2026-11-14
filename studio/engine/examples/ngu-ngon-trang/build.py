# Cảnh mẫu phong cách ngu-ngon-trang (16:9, không lời): "Sông Làm Giàu Nhanh". Chạy: python3 build.py → scene.json
import json
W, H = 1920, 1080
def A(cast, x, y, sc=0.34, face=1, **k): return {"type": "actor", "cast": cast, "x": x, "y": y, "scale": sc, "facing": face, **k}
def P(name, x=0, y=0, sc=1, **k):
    e = {"type": "prop", "name": name, "x": x, "y": y, "scale": sc}
    if "params" in k: e["params"] = k.pop("params")
    e.update(k); return e
crowd = ["a", "b", "c", "d", "e", "f"]
cast = {"hero": {"hat": "fedora", "prop": "axe"}, "heroP": {"hat": "fedora", "prop": "oar"},
        "a": {}, "b": {"hair": "long"}, "c": {"hair": "spiky"}, "d": {}, "e": {"hair": "long"}, "f": {"hair": "spiky"}}
def drown(x, y, sc=0.55, seed=1, **k): return [P("ripple", x, y + 4, sc, params={"r": 90, "seed": seed}, **k), P("drowner", x, y, sc, params={"seed": seed}, **k)]
shots = []

# 1. Biển "LÀM GIÀU NHANH", sông chéo phối cảnh, đám đông chạy dọc bờ gần rồi lao xuống
far1 = [[-150, 600], [300, 585], [700, 560], [1100, 505], [1500, 440], [2100, 380]]
near1 = [[-150, 1180], [400, 1080], [850, 940], [1250, 790], [1650, 650], [2100, 560]]
runners = []
for i, (c, x0, d0) in enumerate([("a", 2050, 0.0), ("c", 2150, 0.5), ("d", 2250, 1.1), ("f", 2380, 1.8)]):
    jx, jy = 1000 - i * 70, 830 + i * 20
    runners.append(A(c, x0, 760, 0.3, -1, to=d0 + 2.3, track=[{"t": d0, "x": x0, "y": 760 + i * 40}, {"t": d0 + 1.9, "x": jx + 260, "y": 1010 + i * 15, "ease": "linear"}, {"t": d0 + 2.3, "x": jx, "y": jy}],
                     acting=[{"t": 0, "pose": "stand", "expr": ["grin", "happy", "determined", "grin"][i], "cycle": "run"}, {"t": d0 + 1.9, "pose": "fall", "expr": "scared"}]))
    runners += [dict(e, **{"from": d0 + 2.25}) for e in drown(jx, jy - 10, 0.5, seed=i + 4)] + [P("splash", jx, jy, 0.6, **{"from": d0 + 2.25, "to": d0 + 3.0, "params": {"seed": i}})]
shots.append({"start": 0, "end": 5.6, "camera": [{"t": 0, "zoom": 1.08, "x": 860, "y": 600}, {"t": 5.6, "zoom": 1.0, "x": 1000, "y": 560}],
  "elements": [P("groundTex", 960, 180, params={"w": 2200, "depth": 380, "n": 26, "seed": 1}), P("groundTex", 1500, 900, params={"w": 1400, "depth": 200, "n": 18, "seed": 2}),
    P("riverBend", params={"far": far1, "near": near1, "flow": 7, "strokes": 7, "dir": -1}),
    P("signpost", 330, 590, 0.95, params={"text": "LÀM GIÀU\nNHANH", "size": 66, "w": 460, "h": 200}),
    *drown(420, 800, 0.62, 1), *drown(760, 700, 0.55, 2), *drown(560, 950, 0.66, 3),
    P("rock", 1260, 1040, 0.9), P("rock", 1700, 900, 0.6, params={"w": 90, "h": 50}),
    *runners],
  "sfx": [{"t": d + 2.25, "kind": "splash", "gain": 0.45} for d in (0.0, 0.5, 1.1, 1.8)]})

# 2. Anh mũ phớt đứng trên doi đất, sông góc trái dưới, đám đông bên phải cười chỉ trỏ; anh nghĩ
far2 = [[-150, 760], [300, 770], [650, 820], [820, 920], [900, 1180]]
near2 = [[-150, 1180], [100, 1120], [300, 1100], [450, 1150], [500, 1190]]
laugh = [A(c, 1240 + i * 95, 860 + (i % 2) * 40 - (i // 3) * 70, 0.32 - (i // 3) * 0.03, -1, acting=[{"t": 0, "pose": ["point", "cheer", "point", "crossed", "cheer", "point"][i], "expr": ["grin", "happy", "grin", "smug", "happy", "grin"][i], "cycle": "breathe"}]) for i, c in enumerate(crowd)]
shots.append({"start": 5.6, "end": 10.6, "camera": [{"t": 0, "zoom": 1.0}, {"t": 5.0, "zoom": 1.22, "x": 820, "y": 560}],
  "elements": [P("groundTex", 1200, 760, params={"w": 1700, "depth": 320, "n": 24, "seed": 3}),
    P("riverBend", params={"far": far2, "near": near2, "flow": 4, "strokes": 7, "dir": -1, "lip": 26}),
    *drown(250, 900, 0.55, 6), *drown(520, 960, 0.5, 7), P("splash", 380, 860, 0.8, **{"from": 0.2, "to": 1.3}),
    P("rock", 1060, 1020, 0.7),
    A("hero", 900, 900, 0.4, 1, acting=[{"t": 0, "pose": "carry", "expr": "calm", "cycle": "breathe"}, {"t": 2.2, "pose": "think", "expr": "neutral"}]),
    *laugh, P("thinkIcons", 640, 330, 0.75, **{"from": 2.4, "enter": "pop", "params": {"icons": ["clock", "money", "target"]}})],
  "sfx": [{"t": 0.2, "kind": "splash", "gain": 0.4}, {"t": 0.5, "kind": "cheer", "gain": 0.25}, {"t": 2.4, "kind": "pop", "gain": 0.4}]})

# 3. Vào rừng: rừng nhiều lớp, chặt cây, khúc gỗ rơi
shots.append({"start": 10.6, "end": 15.4, "camera": [{"t": 0, "zoom": 1.12, "x": 980, "y": 600}, {"t": 4.8, "zoom": 1.0}],
  "elements": [P("forest", 960, 600, 0.8, params={"w": 2600, "seed": 4, "gap": 330}), P("groundTex", 960, 700, params={"w": 2000, "depth": 260, "n": 30, "seed": 5}),
    P("bigTree", 1780, 1060, 1.5, params={"seed": 31}), P("bush", 1500, 1070, 1.0, params={"w": 320, "seed": 3}), P("bigTree", 1180, 960, 1.0, **{"to": 1.9, "params": {"seed": 21}}), P("stump", 1180, 960, 0.9, **{"from": 1.9}),
    A("hero", 940, 990, 0.48, 1, acting=[{"t": 0, "pose": "hammerUp", "expr": "determined", "cycle": "hammer"}, {"t": 2.7, "pose": "carry", "expr": "determined"}]),
    P("log", 1330, 1010, 0.75, **{"from": 1.95, "enter": "drop", "params": {"seed": 1}}), P("log", 1350, 958, 0.75, **{"from": 2.8, "enter": "drop", "params": {"seed": 2}}), P("log", 1325, 906, 0.75, **{"from": 3.6, "enter": "drop", "params": {"seed": 3}}),
    P("rock", 560, 980, 0.8)],
  "sfx": [{"t": t, "kind": "hammer", "gain": 0.5} for t in (0.45, 0.95, 1.45)] + [{"t": 1.9, "kind": "crack", "gain": 0.5}] + [{"t": t, "kind": "thud", "gain": 0.45} for t in (2.0, 2.85, 3.65)]})

# 4. Bờ sông bìa rừng: đóng bè; đám đông nhỏ phía xa thôi cười
far4 = [[-150, 640], [200, 650], [450, 700], [560, 820], [520, 960], [380, 1180]]
near4 = [[-150, 1180], [0, 1140], [100, 1180]]
stare_far = [A(c, 1500 + i * 60, 720 + (i % 2) * 12, 0.22, -1, acting=[{"t": 0, "pose": "stand", "expr": "surprised"}]) for i, c in enumerate(crowd[:5])]
shots.append({"start": 15.4, "end": 19.6, "camera": [{"t": 0, "zoom": 1.0}, {"t": 4.2, "zoom": 1.12, "x": 980, "y": 620}],
  "elements": [P("forest", 1250, 600, 0.7, params={"w": 2000, "seed": 9, "gap": 360}), P("groundTex", 1100, 700, params={"w": 1800, "depth": 380, "n": 28, "seed": 6}),
    P("riverBend", params={"far": [[x, y] for x, y in far4], "near": [[-150, 1180], [-100, 1180]], "flow": 4, "strokes": 6, "dir": 1, "lip": 0}),
    P("rock", 640, 900, 0.8), P("rock", 700, 930, 0.5, params={"w": 80, "h": 45}),
    *stare_far,
    P("raft", 1020, 1000, 0.66, **{"enter": "pop"}), P("log", 1450, 1000, 0.6, params={"seed": 7}), P("log", 1470, 950, 0.6, params={"seed": 8}),
    A("hero", 860, 960, 0.42, 1, acting=[{"t": 0, "pose": "hammerUp", "expr": "determined", "cycle": "hammer"}, {"t": 2.6, "pose": "crossed", "expr": "smug"}])],
  "sfx": [{"t": t, "kind": "hammer", "gain": 0.45} for t in (0.4, 0.9, 1.4, 1.9)]})

# 5. Chống bè qua sông, đám đông trên bờ sững sờ, chữ chốt
far5 = [[-150, 560], [500, 545], [1000, 530], [1500, 520], [2100, 500]]
near5 = [[-150, 960], [500, 975], [1000, 990], [1500, 1000], [2100, 1010]]
stare = [A(c, 160 + i * 70, 520 + (i % 2) * 10, 0.22, 1, acting=[{"t": 0, "pose": "stand", "expr": "surprised"}]) for i, c in enumerate(crowd)]
shots.append({"start": 19.6, "end": 24.6, "camera": [{"t": 0, "zoom": 1.0, "x": 900, "y": 540}, {"t": 5.0, "zoom": 1.0, "x": 1060, "y": 540}],
  "elements": [P("forest", 1500, 500, 0.45, params={"w": 1900, "seed": 13, "gap": 380}), P("groundTex", 900, 1000, params={"w": 2200, "depth": 120, "n": 16, "seed": 7}),
    P("riverBend", params={"far": far5, "near": near5, "flow": 8, "strokes": 11, "dir": -1}),
    P("signpost", 1820, 520, 0.6, params={"text": "BỜ BÊN KIA", "size": 56}), *stare,
    P("raft", 560, 860, 0.62, **{"params": {"float": True}, "track": [{"t": 0, "x": 460}, {"t": 5.0, "x": 1280, "ease": "linear"}]}),
    P("ripple", 560, 880, 1.0, params={"r": 170, "drops": False}, **{"track": [{"t": 0, "x": 460}, {"t": 5.0, "x": 1280, "ease": "linear"}]}),
    A("heroP", 560, 790, 0.38, 1, track=[{"t": 0, "x": 470}, {"t": 5.0, "x": 1290, "ease": "linear"}], acting=[{"t": 0, "pose": "rowA", "expr": "happy", "cycle": "row"}]),
    {"type": "text", "text": "Đi chậm mà chắc.", "x": 960, "y": 170, "size": 84, "from": 3.0, "enter": "fade"}],
  "sfx": [{"t": 0.2, "kind": "splash", "gain": 0.3}, {"t": 3.0, "kind": "chime", "gain": 0.4}]})

scene = {"style": "ngu-ngon-trang", "width": W, "height": H, "fps": 30, "duration": 24.6, "textFollowsCamera": True,
         "music": {"path": "music.wav", "gain": 0.55}, "cast": cast, "shots": shots}
json.dump(scene, open("scene.json", "w"), ensure_ascii=False, indent=1)
