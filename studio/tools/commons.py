#!/usr/bin/env python3
"""Tải ảnh Wikimedia Commons theo tên file (không cần key, không qua API: dùng upload.wikimedia.org).
python3 commons.py OUT_DIR "File:Cọc Bạch Đằng.jpg" ["File:..." ...] [--width 1280]

Ra: OUT_DIR/<tên rút gọn>.jpg và OUT_DIR/commons.json (tên file, url trang, đường dẫn). Tác giả và giấy phép
PHẢI được điền vào commons.json (trường author, license) trước khi dùng; tra trên trang File: của Commons.
Khi API Commons mở (không bị 429), script tự điền từ extmetadata.
"""
import hashlib, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request
UA = 'QBKStudio/1.0 (+https://github.com/quanbk60-sys/QBK-media)'


def get(url, tries=4):
    for k in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=40).read()
        except Exception as e:  # noqa
            if k == tries - 1: raise
            time.sleep(2 ** (k + 1))


def slug(name):
    s = unicodedata.normalize('NFD', name.replace('đ', 'd').replace('Đ', 'D'))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', os.path.splitext(s)[0]).strip('-')[:60]


def main():
    a = sys.argv[1:]
    if len(a) < 2: print(__doc__); sys.exit(2)
    width = int(a[a.index('--width') + 1]) if '--width' in a else 1280
    out = a[0]; os.makedirs(out, exist_ok=True)
    files = [x for x in a[1:] if x.startswith('File:')]
    mf = os.path.join(out, 'commons.json'); meta = json.load(open(mf)) if os.path.exists(mf) else {}
    for f in files:
        name = f[5:].replace(' ', '_'); name = name[0].upper() + name[1:]
        h = hashlib.md5(name.encode()).hexdigest(); q = urllib.parse.quote(name)
        ext = os.path.splitext(name)[1].lower(); dst = os.path.join(out, slug(name) + ('.png' if ext == '.png' else '.jpg'))
        urls = [f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{width}px-{q}', f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{q}']
        ok = None
        for u in urls:
            try: data = get(u); open(dst, 'wb').write(data); ok = u; break
            except Exception as e: print(f'  {u[:90]}… {e}', file=sys.stderr)
        if not ok: print('FAILED', f); continue
        entry = meta.get(f, {}); entry.update(file=f, page='https://commons.wikimedia.org/wiki/' + q, path=os.path.basename(dst), url=ok)
        try:
            api = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata&titles=' + urllib.parse.quote(f)
            pages = json.loads(get(api, 1))['query']['pages']; em = next(iter(pages.values()))['imageinfo'][0]['extmetadata']
            strip = lambda v: re.sub('<[^>]+>', '', v or '').strip()
            entry.setdefault('author', strip(em.get('Artist', {}).get('value'))); entry.setdefault('license', em.get('LicenseShortName', {}).get('value'))
        except Exception:
            entry.setdefault('author', None); entry.setdefault('license', None)
        meta[f] = entry; print('ok', dst, os.path.getsize(dst) // 1024, 'KB')
    json.dump(meta, open(mf, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
