# Cảnh mẫu phong cách ngu-ngon-trang (16:9, không lời): "Sông Làm Giàu Nhanh"
import json
W, H, G = 1920, 1080, 860          # ground line
A = lambda cast, x, y=G, sc=0.36, face=1, **k: {"type": "actor", "cast": cast, "x": x, "y": y, "scale": sc, "facing": face, **{("to" if kk == "to" else kk): v for kk, v in k.items()}}
P = lambda name, x, y, sc=1, **k: {"type": "prop", "name": name, "x": x, "y": y, "scale": sc, **({"params": k.pop("params")} if "params" in k else {}), **k}
crowd = ["a", "b", "c", "d", "e"]
cast = {"hero": {"hat": "fedora", "prop": "axe"}, "heroR": {"hat": "fedora", "prop": "oar"}}
for i, c in enumerate(crowd): cast[c] = {}
def laughing(x0, t0=0):
    return [A(c, x0 + i * 85, G + (i % 2) * 14, 0.33, -1, acting=[{"t": 0, "pose": "point" if i % 2 == 0 else "cheer", "expr": "grin" if i % 2 else "happy", "cycle": "breathe"}]) for i, c in enumerate(crowd)]
def staring(x0):
    return [A(c, x0 + i * 85, G + (i % 2) * 14, 0.33, -1, acting=[{"t": 0, "pose": "stand", "expr": "surprised"}]) for i, c in enumerate(crowd)]
shots = []
# 1. Wide: the river, the sign, people jumping in and drowning (camera pans right)
shots.append({"start": 0, "end": 5.2, "camera": [{"t": 0, "zoom": 1.05, "x": 820, "y": 560}, {"t": 5.2, "zoom": 1.0, "x": 1100, "y": 540}],
  "elements": [P("meadow", 900, G, params={"far": 470}), P("river", 900, G - 40, params={"w": 2600, "h": 230}),
    P("signpost", 300, G - 285, 0.7, params={"text": "LÀM GIÀU\nNHANH", "size": 60}),
    P("drowner", 650, G - 110, 0.55, params={"seed": 1}), P("drowner", 950, G - 150, 0.5, params={"seed": 2}), P("drowner", 1180, G - 95, 0.55, params={"seed": 3}),
    A("a", 1750, G, 0.33, -1, track=[{"t": 0, "x": 1750, "y": G}, {"t": 1.3, "x": 1420, "y": G, "ease": "linear"}, {"t": 1.7, "x": 1380, "y": G - 100}], acting=[{"t": 0, "pose": "stand", "expr": "grin", "cycle": "run"}, {"t": 1.3, "pose": "fall", "expr": "scared"}], to=1.75),
    A("b", 1950, G, 0.33, -1, track=[{"t": 0.8, "x": 1950, "y": G}, {"t": 2.7, "x": 1520, "y": G, "ease": "linear"}, {"t": 3.1, "x": 1480, "y": G - 110}], acting=[{"t": 0, "pose": "stand", "expr": "happy", "cycle": "run"}, {"t": 2.7, "pose": "fall", "expr": "scared"}], to=3.15),
    P("drowner", 1370, G - 105, 0.55, **{"from": 1.75, "params": {"seed": 4}}), P("drowner", 1470, G - 115, 0.55, **{"from": 3.2, "params": {"seed": 5}})],
  "sfx": [{"t": 1.7, "kind": "splash", "gain": 0.5}, {"t": 3.1, "kind": "splash", "gain": 0.5}]})
# 2. The man with the hat watches; the crowd laughs at him; he thinks
shots.append({"start": 5.2, "end": 10.0, "camera": [{"t": 0, "zoom": 1.0}, {"t": 4.8, "zoom": 1.25, "x": 760, "y": 520}],
  "elements": [P("meadow", 900, G, params={"far": 470, "seed": 2}), P("river", 1300, G - 40, params={"w": 2200, "h": 220}), P("drowner", 1500, G - 120, 0.5, params={"seed": 6}),
    A("hero", 700, G, 0.4, 1, acting=[{"t": 0, "pose": "carry", "expr": "calm", "cycle": "breathe"}, {"t": 2.2, "pose": "think", "expr": "neutral"}]),
    *laughing(1050), P("thinkIcons", 520, 380, 0.7, **{"from": 2.4, "enter": "pop", "params": {"icons": ["clock", "money", "target"]}})],
  "sfx": [{"t": 0.3, "kind": "cheer", "gain": 0.25}, {"t": 2.4, "kind": "pop", "gain": 0.4}]})
# 3. Into the forest: chop trees, logs pile up
trees = [P("meadow", 900, G, params={"far": 520, "seed": 3})] + [P("lineTree", x, G - 30 + (i % 2) * 40, 0.9 + (i % 3) * 0.15, params={"seed": i + 1}) for i, x in enumerate([160, 400, 620, 1480, 1700, 1900])]
shots.append({"start": 10.0, "end": 14.6, "camera": [{"t": 0, "zoom": 1.15, "x": 900, "y": 560}, {"t": 4.6, "zoom": 1.0}],
  "elements": [*trees, P("lineTree", 1150, G, 1.0, **{"to": 1.8, "params": {"seed": 9}}), P("stump", 1150, G, 1.0, **{"from": 1.8}),
    A("hero", 900, G, 0.42, 1, acting=[{"t": 0, "pose": "hammerUp", "expr": "determined", "cycle": "hammer"}, {"t": 2.6, "pose": "carry", "expr": "determined"}]),
    P("log", 1250, G + 40, 0.8, **{"from": 1.9, "enter": "drop"}), P("log", 1270, G - 14, 0.8, **{"from": 2.8, "enter": "drop"}), P("log", 1240, G - 68, 0.8, **{"from": 3.6, "enter": "drop"})],
  "sfx": [{"t": t, "kind": "hammer", "gain": 0.5} for t in (0.45, 0.95, 1.45)] + [{"t": 1.85, "kind": "crack", "gain": 0.5}, {"t": 1.95, "kind": "thud", "gain": 0.5}]})
# 4. Builds the raft on the bank; the crowd stops laughing
shots.append({"start": 14.6, "end": 18.4, "camera": [{"t": 0, "zoom": 1.0}, {"t": 3.8, "zoom": 1.1, "x": 900, "y": 560}],
  "elements": [P("meadow", 900, G, params={"far": 470, "seed": 4}), P("river", 1100, G - 40, params={"w": 2600, "h": 220}),
    P("raft", 860, G + 20, 0.62, **{"enter": "pop"}),
    A("hero", 600, G, 0.4, 1, acting=[{"t": 0, "pose": "hammerUp", "expr": "determined", "cycle": "hammer"}, {"t": 2.4, "pose": "crossed", "expr": "smug"}]),
    *staring(1250)],
  "sfx": [{"t": t, "kind": "hammer", "gain": 0.45} for t in (0.4, 0.9, 1.4, 1.9)]})
# 5. Poles the raft across while the others stare
shots.append({"start": 18.4, "end": 23.5, "camera": [{"t": 0, "zoom": 1.0, "x": 900, "y": 540}, {"t": 5.1, "zoom": 1.0, "x": 1100, "y": 540}],
  "elements": [P("meadow", 900, G + 120, params={"far": 560, "seed": 5}), P("river", 1000, G + 140, params={"w": 2800, "h": 330}),
    P("signpost", 1720, G - 210, 0.6, params={"text": "BỜ BÊN KIA", "size": 56}),
    P("raft", 600, G + 40, 0.62, **{"params": {"float": True}, "track": [{"t": 0, "x": 500}, {"t": 5.1, "x": 1300, "ease": "linear"}]}),
    A("heroR", 600, G - 40, 0.38, 1, track=[{"t": 0, "x": 520}, {"t": 5.1, "x": 1320, "ease": "linear"}], acting=[{"t": 0, "pose": "rowA", "expr": "happy", "cycle": "row"}]),
    *[dict(a, y=G - 230 + (i % 2) * 10, scale=0.27) for i, a in enumerate(staring(120))],
    {"type": "text", "text": "Đi chậm mà chắc.", "x": 960, "y": 170, "size": 84, "from": 3.0, "enter": "fade"}],
  "sfx": [{"t": 0.2, "kind": "splash", "gain": 0.3}, {"t": 3.0, "kind": "chime", "gain": 0.4}]})
scene = {"style": "ngu-ngon-trang", "width": W, "height": H, "fps": 30, "duration": 23.5, "textFollowsCamera": True,
         "music": {"path": "music.wav", "gain": 0.55}, "cast": cast, "shots": shots}
json.dump(scene, open("scene.json", "w"), ensure_ascii=False, indent=1)
