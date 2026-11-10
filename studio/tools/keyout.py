#!/usr/bin/env python3
"""Xóa nền màu khóa (mặc định magenta #FF00FF) cho ảnh vật thể do Gemini vẽ, khử viền màu, cắt sát.
keyout.py SRC.png DST.png [--key 255,0,255] [--max 900]   (--max: cạnh dài tối đa sau khi cắt)"""
import sys, numpy as np
from PIL import Image
args = sys.argv[1:]
src, dst = args[0], args[1]
key = np.array([int(v) for v in (args[args.index('--key') + 1] if '--key' in args else '255,0,255').split(',')], np.float32)
mx = int(args[args.index('--max') + 1]) if '--max' in args else 900
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
if key[1] < 128 and key[0] > 128 and key[2] > 128:   # magenta: độ "tím hồng" = min(r,b) - g
    m = np.clip((np.minimum(r, b) - g - 40) / 90, 0, 1)
else:                                               # màu khóa khác: khoảng cách màu
    m = np.clip(1 - (np.linalg.norm(a - key, axis=2) - 40) / 80, 0, 1)
alpha = 1 - m
# khử viền: kéo kênh r,b không vượt quá g + chút ở vùng bán trong suốt
spill = np.minimum(r, b) - g
fix = (spill > 0) & (alpha < 0.999)
for ch in (0, 2):
    c = a[..., ch]; c[fix] = np.minimum(c[fix], g[fix] + np.maximum(0, spill[fix]) * alpha[fix] * 0.3)
alpha[alpha < 0.04] = 0
img = Image.fromarray(np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
bbox = img.getchannel('A').point(lambda v: 255 if v > 30 else 0).getbbox()
img = img.crop(bbox)
if max(img.size) > mx: img.thumbnail((mx, mx), Image.LANCZOS)
img.save(dst); print(dst, img.size)
