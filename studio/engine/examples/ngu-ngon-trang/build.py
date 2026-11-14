# Cảnh mẫu phong cách ngu-ngon-trang (16:9, không lời): "Sông Làm Giàu Nhanh". Chạy: python3 build.py → scene.json
import json
W, H = 1920, 1080
def A(cast, x, y, sc=0.34, face=1, **k): return {"type": "actor", "cast": cast, "x": x, "y": y, "scale": sc, "facing": face, **k}
def P(name, x=0, y=0, sc=1, **k):
    e = {"type": "prop", "name": name, "x": x, "y": y, "scale": sc}
    if "params" in k: e["params"] = k.pop("params")
    e.update(k); return e
crowd = ["a", "b", "c", "d", "e", "f"]
cast = {"hero": {"hat": "fedora", "prop": "axe"}, "heroP": {"hat": "fedora", "prop": "pole"}, "heroM": {"hat": "fedora", "prop": "scroll"},
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

# 3. Bìa rừng trên vách đá: anh mở cuộn bản đồ
shots.append({"start": 10.6, "end": 13.6, "camera": [{"t": 0, "zoom": 1.0, "x": 960, "y": 540}, {"t": 3.0, "zoom": 1.25, "x": 1000, "y": 520}],
  "elements": [P("forest", 760, 620, 0.75, params={"w": 1800, "seed": 21, "gap": 320}), P("bigTree", 1500, 860, 1.25, params={"seed": 41}),
    P("cliff", 1100, 860, 1.0, params={"w": 1500, "h": 300}), P("groundTex", 900, 870, params={"w": 1300, "depth": 120, "n": 14, "seed": 8}),
    A("heroM", 1080, 860, 0.46, 1, costume={"prop": None}, acting=[{"t": 0, "pose": "stand", "expr": "neutral"}, {"t": 0.6, "pose": "carry", "expr": "surprised"}]),
    P("parchment", 1120, 690, 0.55, **{"from": 0.6, "enter": "pop", "ptrack": [{"t": 0.6, "open": 0}, {"t": 1.4, "open": 1}]})],
  "sfx": [{"t": 0.9, "kind": "scribble", "gain": 0.3, "dur": 0.4}]})

# 4. Chèn tấm bản đồ giấy cổ có màu (cắt cứng vào và ra như mẫu); đường đỏ vẽ dần
shots.append({"start": 13.6, "end": 17.4, "transition": "cut", "background": "#F3E9D2", "camera": [{"t": 0, "zoom": 1.0}, {"t": 3.8, "zoom": 1.06, "x": 990, "y": 560}],
  "elements": [P("treasureMap", 960, 540, 1.0, params={"title": "BẢN ĐỒ LÀM GIÀU BỀN VỮNG", "sub": "Đi từng chặng, không nhảy cóc",
      "steps": ["Học nghề", "Làm thật", "Tiết kiệm", "Đầu tư", "Kiên trì"], "start": "BẠN Ở ĐÂY", "goal": "BỜ BÊN KIA"},
      ptrack=[{"t": 0.2, "reveal": 0}, {"t": 3.2, "reveal": 1}])],
  "sfx": [{"t": 0.05, "kind": "whoosh", "gain": 0.4}, {"t": 3.2, "kind": "chime", "gain": 0.4}]})

# 5. Trên vách đá nhìn xuống sông, suy nghĩ rồi nảy ra ý (bong bóng lá cờ trên đồi)
far5 = [[700, 760], [1100, 740], [1500, 760], [2100, 740]]; near5 = [[700, 1180], [1100, 1150], [1500, 1170], [2100, 1150]]
shots.append({"start": 17.4, "end": 21.4, "transition": "cut", "camera": [{"t": 0, "zoom": 1.15, "x": 760, "y": 560}, {"t": 4.0, "zoom": 1.0}],
  "elements": [P("meadow", 1300, 720, params={"far": 140, "seed": 9, "n": 10}), P("riverBend", params={"far": far5, "near": near5, "flow": 5, "strokes": 6, "dir": -1}),
    P("cliff", 300, 760, 1.0, params={"w": 900, "h": 420}), P("rock", 120, 760, 1.2), P("bush", 40, 770, 0.9, params={"w": 260}),
    A("hero", 600, 760, 0.46, 1, acting=[{"t": 0, "pose": "think", "expr": "neutral"}, {"t": 2.2, "pose": "point", "expr": "grin", "snap": True}]),
    P("thinkIcons", 420, 290, 0.75, **{"from": 0.4, "to": 2.1, "enter": "pop", "params": {"icons": ["clock", "money", "target"]}}),
    P("thinkIcons", 470, 290, 0.9, **{"from": 2.2, "enter": "pop", "params": {"icons": ["flag"]}})],
  "sfx": [{"t": 0.4, "kind": "pop", "gain": 0.35}, {"t": 2.2, "kind": "chime", "gain": 0.4}]})

# 6. Chặt cây: cây đổ nghiêng, khúc gỗ chất lên
shots.append({"start": 21.4, "end": 25.8, "camera": [{"t": 0, "zoom": 1.12, "x": 980, "y": 600}, {"t": 4.4, "zoom": 1.0}],
  "elements": [P("forest", 960, 600, 0.8, params={"w": 2600, "seed": 4, "gap": 330}), P("groundTex", 960, 700, params={"w": 2000, "depth": 300, "n": 30, "seed": 5}),
    P("bigTree", 1780, 1060, 1.5, params={"seed": 31}), P("bush", 1500, 1070, 1.0, params={"w": 320, "seed": 3}),
    P("bigTree", 1180, 960, 1.0, **{"to": 2.6, "params": {"seed": 21}, "track": [{"t": 0, "rotate": 0}, {"t": 1.6, "rotate": 0.04}, {"t": 2.5, "rotate": 1.5, "ease": "linear"}]}),
    P("stump", 1180, 960, 0.9, **{"from": 1.6}),
    A("hero", 940, 990, 0.48, 1, acting=[{"t": 0, "pose": "hammerUp", "expr": "determined", "cycle": "hammer"}, {"t": 1.6, "pose": "stand", "expr": "surprised"}, {"t": 2.7, "pose": "carry", "expr": "happy"}]),
    P("log", 1430, 1010, 0.75, **{"from": 2.55, "enter": "drop", "params": {"seed": 1}}), P("log", 1450, 958, 0.75, **{"from": 3.2, "enter": "drop", "params": {"seed": 2}}), P("log", 1425, 906, 0.75, **{"from": 3.8, "enter": "drop", "params": {"seed": 3}}),
    P("rock", 560, 980, 0.8)],
  "sfx": [{"t": t, "kind": "hammer", "gain": 0.5} for t in (0.45, 0.95, 1.45)] + [{"t": 1.6, "kind": "crack", "gain": 0.55}, {"t": 2.5, "kind": "thud", "gain": 0.7}, {"t": 3.25, "kind": "thud", "gain": 0.4}, {"t": 3.85, "kind": "thud", "gain": 0.4}]})

# 7. Đóng bè bên bờ; một người nữa lao xuống sông, đám đông xa thôi cười
far7 = [[-150, 640], [200, 650], [450, 700], [560, 820], [520, 960], [380, 1180]]
stare_far = [A(c, 1500 + i * 60, 720 + (i % 2) * 12, 0.22, -1, acting=[{"t": 0, "pose": "stand", "expr": "surprised"}]) for i, c in enumerate(crowd[:5])]
shots.append({"start": 25.8, "end": 30.0, "camera": [{"t": 0, "zoom": 1.0}, {"t": 4.2, "zoom": 1.12, "x": 980, "y": 620}],
  "elements": [P("forest", 1250, 600, 0.7, params={"w": 2000, "seed": 9, "gap": 360}), P("groundTex", 1100, 700, params={"w": 1800, "depth": 380, "n": 28, "seed": 6}),
    P("riverBend", params={"far": far7, "near": [[-150, 1180], [-100, 1180]], "flow": 4, "strokes": 6, "dir": 1, "lip": 0}),
    *drown(260, 880, 0.5, 8, **{"from": 1.2}), P("splash", 260, 880, 0.7, **{"from": 1.1, "to": 1.9}),
    P("rock", 640, 900, 0.8), P("rock", 700, 930, 0.5, params={"w": 80, "h": 45}), *stare_far,
    P("raft", 1020, 1000, 0.66, **{"enter": "pop"}), P("log", 1450, 1000, 0.6, params={"seed": 7}), P("log", 1470, 950, 0.6, params={"seed": 8}),
    A("hero", 860, 960, 0.44, 1, acting=[{"t": 0, "pose": "hammerUp", "expr": "determined", "cycle": "hammer"}, {"t": 2.6, "pose": "crossed", "expr": "smug"}])],
  "sfx": [{"t": t, "kind": "hammer", "gain": 0.45} for t in (0.4, 0.9, 1.4, 1.9)] + [{"t": 1.15, "kind": "splash", "gain": 0.4}]})

# 8. Chống sào qua sông, đám đông sững sờ, cập bờ bên kia, chữ chốt
far8 = [[-150, 560], [500, 545], [1000, 530], [1500, 520], [2100, 500]]
near8 = [[-150, 960], [500, 975], [1000, 990], [1500, 1000], [2100, 1010]]
stare = [A(c, 160 + i * 70, 520 + (i % 2) * 10, 0.22, 1, acting=[{"t": 0, "pose": "stand", "expr": "surprised"}]) for i, c in enumerate(crowd)]
mv = [{"t": 0, "x": 460}, {"t": 5.2, "x": 1330, "ease": "out"}]
shots.append({"start": 30.0, "end": 36.4, "camera": [{"t": 0, "zoom": 1.0, "x": 900, "y": 540}, {"t": 6.4, "zoom": 1.05, "x": 1120, "y": 540}],
  "elements": [P("forest", 1500, 500, 0.45, params={"w": 1900, "seed": 13, "gap": 380}), P("groundTex", 900, 1000, params={"w": 2200, "depth": 120, "n": 16, "seed": 7}),
    P("riverBend", params={"far": far8, "near": near8, "flow": 8, "strokes": 8, "dir": -1}),
    P("signpost", 1700, 520, 0.6, params={"text": "BỜ BÊN KIA", "size": 56}), *stare,
    P("raft", 560, 860, 0.62, **{"params": {"float": True}, "track": mv}),
    P("ripple", 560, 880, 1.0, params={"r": 170, "drops": False}, **{"track": mv}),
    A("heroP", 560, 790, 0.4, 1, track=[dict(k, x=k["x"] + 10) for k in mv], acting=[{"t": 0, "pose": "rowA", "expr": "happy", "cycle": "row"}, {"t": 5.2, "pose": "stand", "expr": "smug"}]),
    {"type": "text", "text": "Đi chậm mà chắc.", "x": 960, "y": 170, "size": 84, "from": 4.0, "enter": "fade"}],
  "sfx": [{"t": 0.2, "kind": "splash", "gain": 0.3}, {"t": 4.0, "kind": "chime", "gain": 0.4}]})

scene = {"style": "ngu-ngon-trang", "width": W, "height": H, "fps": 30, "duration": 36.4, "textFollowsCamera": True,
         "music": {"path": "music.wav", "gain": 0.55}, "cast": cast, "shots": shots}
json.dump(scene, open("scene.json", "w"), ensure_ascii=False, indent=1)
