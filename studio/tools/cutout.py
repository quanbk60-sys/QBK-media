# White -> alpha (colour-to-alpha), trim, optional flood-fill tints. Usage: cutout.py SRC DST [x,y,r,g,b ...]
import sys, numpy as np
from PIL import Image, ImageDraw
src, dst, *fills = sys.argv[1:]
im = Image.open(src).convert('RGB')
for f in fills:
    x, y, r, g, b = map(int, f.split(','))
    ImageDraw.floodfill(im, (x, y), (r, g, b), thresh=40)
a = np.asarray(im).astype(np.float32) / 255.0
# normalise paper: treat >= 0.94 as white
alpha = np.clip((1.0 - a.min(axis=2) - 0.04) / 0.96, 0, 1)
alpha = np.maximum(alpha, np.clip((1.0 - a).max(axis=2) * 1.0 - 0.04, 0, 1))
alpha[alpha < 0.05] = 0
safe = np.maximum(alpha, 1e-4)[..., None]
rgb = np.clip((a - (1 - safe)) / safe, 0, 1)
out = np.dstack([rgb, alpha]) * 255
img = Image.fromarray(out.astype(np.uint8), 'RGBA')
bbox = img.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
pad = 24
bbox = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(img.width, bbox[2]+pad), min(img.height, bbox[3]+pad))
img = img.crop(bbox)
img.save(dst)
print(dst, img.size)
