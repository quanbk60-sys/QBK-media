#!/usr/bin/env python3
"""Xem một mức ảnh vệ tinh kèm lưới kinh/vĩ độ để dò tọa độ (cho đạo diễn).
python3 satgrid.py sat/satmap.json Z OUT.jpg [--step 0.02] [--crop LAT0,LON0,LAT1,LON1] [--w 900]"""
import json, math, os, sys
from PIL import Image, ImageDraw
a = sys.argv[1:]; meta = json.load(open(a[0])); z = int(a[1]); out = a[2]
step = float(a[a.index('--step') + 1]) if '--step' in a else 0.02
W = int(a[a.index('--w') + 1]) if '--w' in a else 900
L = [l for l in meta['levels'] if l['z'] == z][0]
im = Image.open(os.path.join(os.path.dirname(a[0]), L['file']))
n = 256 * 2 ** z
def px(lat, lon):
    s = math.sin(math.radians(lat)); return (lon + 180) / 360 * n - L['x0'], (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n - L['y0']
def ll(x, y):
    X, Y = (x + L['x0']) / n, (y + L['y0']) / n; return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * Y)))), X * 360 - 180
if '--crop' in a:
    la0, lo0, la1, lo1 = map(float, a[a.index('--crop') + 1].split(','))
    x0, y0 = px(max(la0, la1), min(lo0, lo1)); x1, y1 = px(min(la0, la1), max(lo0, lo1)); im = im.crop((int(x0), int(y0), int(x1), int(y1))); L = dict(L, x0=L['x0'] + int(x0), y0=L['y0'] + int(y0))
k = W / im.width; im = im.resize((W, int(im.height * k))); d = ImageDraw.Draw(im)
la_top, lo_l = ll(0, 0); la_bot, lo_r = ll(im.width / k, im.height / k)
lat = math.floor(la_bot / step) * step
while lat <= la_top:
    y = px(lat, lo_l)[1] * k; d.line([(0, y), (im.width, y)], fill=(255, 255, 0)); d.text((3, y + 2), f'{lat:.3f}', fill=(255, 255, 0)); lat += step
lon = math.floor(lo_l / step) * step
while lon <= lo_r:
    x = px(la_top, lon)[0] * k; d.line([(x, 0), (x, im.height)], fill=(0, 255, 255)); d.text((x + 2, 3), f'{lon:.3f}', fill=(0, 255, 255)); lon += step
im.save(out, quality=88); print(out, im.size)
