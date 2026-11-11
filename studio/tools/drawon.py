#!/usr/bin/env python3
"""Hiệu ứng vẽ tay cho ảnh storyboard: tranh hiện dần như đang được vẽ (nét đậm trước, bóng và chuyển sắc sau),
rồi máy quay chuyển động nhẹ. Khung cuối chính là ảnh gốc (giống 100%). Không gọi dịch vụ nào.

  python3 studio/tools/drawon.py IN.png OUT.mp4 --dur 5 [--size 1080x1920] [--move push|pull|panL|panR|none]
          [--fit pad|cover] [--draw 0.55] [--seed 1] [--fps 30]

- --fit pad (mặc định): tranh giữ nguyên, đặt giữa khung; phần trống là chính tranh làm mờ, nhạt như giấy.
  --fit cover: cắt tranh cho đầy khung (mất hai bên nếu tranh ngang mà video dọc).
- --draw: phần thời lượng dành cho lúc vẽ (tối đa 3,2 giây); sau đó tranh đứng yên, máy vẫn chuyển động.
- Tự cắt viền khung đen dày quanh tranh (khung ô storyboard) nếu có.
Dùng trong assemble.py bằng clip ảnh có "draw": true.
"""
import argparse, subprocess
import numpy as np
from PIL import Image, ImageFilter

PAPER = np.array([244, 241, 234], np.float32)


def trim_frame(im):
    """Bỏ viền đen dày ở mép (khung ô storyboard), tối đa 5% mỗi cạnh."""
    a = np.asarray(im.convert('L')) < 70
    h, w = a.shape
    def cut(prof, n):
        lim, k, seen = int(n * 0.05), 0, False
        for i in range(lim):
            if prof[i] > 0.5: seen = True; k = i + 1
            elif seen: break
        return k + (4 if seen else 0)
    t, b = cut(a.mean(1), h), cut(a.mean(1)[::-1], h)
    l, r = cut(a.mean(0), w), cut(a.mean(0)[::-1], w)
    return im.crop((l, t, w - r, h - b)) if t + b + l + r else im


def build(src, out, dur, W=1080, H=1920, move='push', fit='pad', draw=0.55, seed=1, fps=30):
    im = trim_frame(Image.open(src).convert('RGB'))
    if fit == 'cover':
        s = max(W / im.width, H / im.height); pw, ph = W, H
        big = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        x0, y0 = (big.width - W) // 2, (big.height - H) // 2
        pic = big.crop((x0, y0, x0 + W, y0 + H)); px, py = 0, 0
    else:
        s = min(W / im.width, H / im.height); pw, ph = round(im.width * s), round(im.height * s)
        pic = im.resize((pw, ph), Image.LANCZOS); px, py = (W - pw) // 2, (H - ph) // 2
    P = np.asarray(pic).astype(np.float32)
    # nền: chính tranh phóng to, làm mờ, pha giấy
    sb = max(W / im.width, H / im.height)
    bg = im.resize((round(im.width * sb), round(im.height * sb)), Image.BILINEAR)
    bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H)).filter(ImageFilter.GaussianBlur(40))
    BG = np.asarray(bg).astype(np.float32) * 0.25 + PAPER * 0.75
    # thứ tự nét: chéo từ trên trái, lệch ngẫu nhiên như tay người; nét đậm trước
    L = P.mean(2)
    rng = np.random.default_rng(seed)
    noise = np.asarray(Image.fromarray((rng.random((12, 16)) * 255).astype(np.uint8)).resize((pw, ph), Image.BICUBIC)).astype(np.float32) / 255
    yy, xx = np.mgrid[0:ph, 0:pw]
    ink = np.clip((170 - L) / 120, 0, 1)
    order = (xx / pw * 0.55 + yy / ph * 0.45) * 0.7 + noise * 0.3 - ink * 0.15
    order = (order - order.min()) / (order.max() - order.min())
    lineonly = PAPER + (P - PAPER) * np.clip(ink * 1.6, 0, 1)[..., None]
    td = min(3.2, dur * draw)                       # thời gian vẽ
    n = max(1, int(round(dur * fps)))
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                           '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'veryfast', out], stdin=subprocess.PIPE)
    done = None
    for i in range(n):
        t = i / fps
        if t < td or done is None:
            p = min(1.0, t / td) if td > 0 else 1.0
            dr = np.clip((p / 0.62 - order) / 0.05, 0, 1)[..., None]      # vẽ nét: 0–62% thời gian vẽ
            sh = np.clip((p - 0.5) / 0.45, 0, 1)                           # tô bóng: 50–95%
            img = PAPER + (lineonly - PAPER) * dr
            img = img + (P - img) * (sh * dr if p < 1 else 1)
            frame_pic = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
            if p >= 1: done = frame_pic
        else:
            frame_pic = done
        q = t / max(dur, 1e-6)                                             # chuyển động máy cả cảnh
        z = {'push': 1 + 0.08 * q, 'pull': 1.08 - 0.08 * q}.get(move, 1.06 if move in ('panL', 'panR') else 1.0)
        if z > 1.0001:
            cw, ch = pw / z, ph / z
            cx = {'panL': pw - cw / 2 - (pw - cw) * q, 'panR': cw / 2 + (pw - cw) * q}.get(move, pw / 2)
            frame_pic = frame_pic.crop((cx - cw / 2, ph / 2 - ch / 2, cx + cw / 2, ph / 2 + ch / 2)).resize((pw, ph), Image.BILINEAR)
        if fit == 'cover':
            can = frame_pic
        else:
            can = Image.fromarray(BG.astype(np.uint8)); can.paste(frame_pic, (px, py))
        ff.stdin.write(can.tobytes())
    ff.stdin.close(); ff.wait()
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('out')
    ap.add_argument('--dur', type=float, default=5); ap.add_argument('--size', default='1080x1920')
    ap.add_argument('--move', default='push'); ap.add_argument('--fit', default='pad')
    ap.add_argument('--draw', type=float, default=0.55); ap.add_argument('--seed', type=int, default=1); ap.add_argument('--fps', type=int, default=30)
    a = ap.parse_args(); W, H = map(int, a.size.split('x'))
    print(build(a.src, a.out, a.dur, W, H, a.move, a.fit, a.draw, a.seed, a.fps))
