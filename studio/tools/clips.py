#!/usr/bin/env python3
"""Tìm và tải đoạn video thật có giấy phép tự do để ghép vào phim (phần tử "clip" của engine).

  python3 clips.py search "volcano eruption" [--src commons,nasa,archive,pexels] [--n 8] [--min 3] [--max 600]
  python3 clips.py get OUT_DIR ID [--start S] [--dur D] [--name ten] [--height 1280] [--audio]
  python3 clips.py info ID

Từ khóa nên viết bằng tiếng Anh (kho tư liệu chủ yếu tiếng Anh). ID có dạng:
  commons:File:Tên file.webm   (Wikimedia Commons, không cần key)
  nasa:<nasa_id>               (NASA Image and Video Library, không cần key; cần mạng tới images-api.nasa.gov, images-assets.nasa.gov)
  archive:<identifier>         (Internet Archive, chỉ lấy mục ghi rõ PD/CC0/CC BY/CC BY-SA; cần mạng tới archive.org)
  pexels:<id>                  (Pexels, cần key gắn qua Network secrets cho api.pexels.com)

Chỉ nhận giấy phép dùng thương mại được: CC0, Public domain, CC BY, CC BY-SA, giấy phép Pexels.
Không bao giờ lấy video TikTok, YouTube, phim, bản tin của người khác để ghép vào phim.

"get" cắt đoạn [start, start+dur], đổi sang mp4 H.264 không tiếng (thêm --audio để giữ tiếng gốc), chiều cao tối đa
--height, rồi ghi OUT_DIR/<name>.mp4 và thêm một mục vào OUT_DIR/clips.json (id, nguồn, tác giả, giấy phép,
credit, url trang). Dòng "credit" chép thẳng vào thuộc tính credit của phần tử clip và vào publish.md.
"""
import json, os, re, subprocess, sys, time, unicodedata, urllib.error, urllib.parse, urllib.request

UA = 'QBKStudio/1.0 (+https://github.com/quanbk60-sys/QBK-media)'
def license_ok(lic):
    l = re.sub(r'[-_/]', ' ', (lic or '').lower())
    if re.search(r'\b(nc|nd)\b|noncommercial|non commercial|no derivatives|fair use|all rights reserved|copyrighted', l): return False
    return bool(re.search(r'\bcc0\b|public domain|\bpd\b|\bpdm\b|no restrictions|\bcc by\b|pexels', l))


def get(url, headers=None, tries=5, raw=False):
    for k in range(tries):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA, **(headers or {})}), timeout=60).read()
            return r if raw else json.loads(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and k < tries - 1:
                time.sleep(3 * 2 ** k); continue
            raise
        except urllib.error.URLError:
            if k < tries - 1: time.sleep(2 * 2 ** k); continue
            raise


def strip_html(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s or '')).strip()


# ---------------- Wikimedia Commons ----------------
CAPI = 'https://commons.wikimedia.org/w/api.php?'


def commons_pages(params):
    q = {'action': 'query', 'format': 'json', 'prop': 'videoinfo', 'viprop': 'url|size|mime|extmetadata|derivatives', **params}
    return (get(CAPI + urllib.parse.urlencode(q)).get('query') or {}).get('pages', {}).values()


def commons_item(p):
    vi = (p.get('videoinfo') or [{}])[0]; md = vi.get('extmetadata') or {}
    v = lambda k: strip_html((md.get(k) or {}).get('value', ''))
    lic = v('LicenseShortName') or v('License')
    return {'id': 'commons:' + p['title'], 'source': 'Wikimedia Commons', 'title': p['title'][5:], 'page': vi.get('descriptionurl'),
            'author': v('Artist') or v('Credit'), 'license': lic, 'license_ok': license_ok(lic),
            'duration': round(float(vi.get('duration') or 0), 1) or None, 'width': vi.get('width'), 'height': vi.get('height'),
            'desc': v('ImageDescription')[:160], '_url': vi.get('url'), '_derivatives': vi.get('derivatives') or []}


def commons_search(q, n):
    return [commons_item(p) for p in commons_pages({'generator': 'search', 'gsrnamespace': 6, 'gsrsearch': f'{q} filetype:video', 'gsrlimit': n})]


def commons_info(title):
    return commons_item(next(iter(commons_pages({'titles': title}))))


def commons_url(it, height):
    # candidates, best first: the original (if not taller than `height`), then transcodes tallest-first.
    # upload.wikimedia.org often answers 429 for originals while transcodes still download.
    orig = (it['_url'] or '').split('?')[0]
    der = sorted([d for d in it['_derivatives'] if d.get('src') and 'video' in (d.get('type') or '') and (d.get('height') or 0) <= height],
                 key=lambda d: (-(d.get('height') or 0), 'webm' not in d.get('type', '')))
    urls = [d['src'] for d in der]
    return ([orig] if (it.get('height') or 0) <= height else []) + urls + ([] if (it.get('height') or 0) <= height else [orig])


# ---------------- NASA ----------------
def nasa_item(x):
    d = (x.get('data') or [{}])[0]
    by = d.get('secondary_creator') or d.get('photographer') or ''
    # footage credited to someone other than NASA (a company, ESA, a TV network) is not automatically public domain
    third = bool(by) and not re.search(r'nasa|jpl|goddard|kennedy|johnson|marshall|ames|langley|glenn|armstrong|stennis', by, re.I)
    return {'id': 'nasa:' + d.get('nasa_id', ''), 'source': 'NASA', 'title': d.get('title', ''), 'page': 'https://images.nasa.gov/details/' + urllib.parse.quote(d.get('nasa_id', '')),
            'author': by or d.get('center') or 'NASA', 'license': 'Public domain (NASA)' if not third else f'Không rõ (quay bởi {by})', 'license_ok': not third,
            'duration': None, 'desc': strip_html(d.get('description', ''))[:160],
            'note': 'NASA media thường thuộc phạm vi công cộng; nếu mô tả ghi bên thứ ba (ESA, công ty, đài truyền hình) thì không dùng.'}


def nasa_search(q, n):
    r = get('https://images-api.nasa.gov/search?' + urllib.parse.urlencode({'q': q, 'media_type': 'video', 'page_size': n}))
    return [nasa_item(x) for x in r['collection']['items'][:n]]


def nasa_info(nid):
    r = get('https://images-api.nasa.gov/search?' + urllib.parse.urlencode({'nasa_id': nid}))
    return nasa_item(r['collection']['items'][0])


def nasa_url(it, height):
    files = [x['href'] for x in get('https://images-api.nasa.gov/asset/' + urllib.parse.quote(it['id'][5:]))['collection']['items']]
    mp4 = [f for f in files if f.lower().endswith('.mp4')]
    for tag in (['~medium', '~small', '~orig'] if height <= 1280 else ['~orig', '~medium', '~small']):
        for f in mp4:
            if tag in f: return f.replace('http://', 'https://')
    if mp4: return mp4[0].replace('http://', 'https://')
    raise SystemExit('NASA: không có file mp4')


# ---------------- Internet Archive ----------------
def archive_item(d):
    lic = d.get('licenseurl') or ''
    if isinstance(lic, list): lic = lic[0]
    name = 'CC0' if 'zero' in lic else 'Public domain' if 'publicdomain' in lic else ('CC BY-SA' if 'by-sa' in lic else 'CC BY' if '/by/' in lic else lic)
    cr = d.get('creator') or ''
    return {'id': 'archive:' + d['identifier'], 'source': 'Internet Archive', 'title': d.get('title', ''), 'page': 'https://archive.org/details/' + d['identifier'],
            'author': cr[0] if isinstance(cr, list) else cr, 'license': name, 'license_ok': license_ok(name), 'duration': None,
            'desc': strip_html(d.get('description') if isinstance(d.get('description'), str) else '')[:160]}


def archive_search(q, n):
    query = f'({q}) AND mediatype:movies AND (licenseurl:*publicdomain* OR licenseurl:*creativecommons.org/licenses/by/* OR licenseurl:*creativecommons.org/licenses/by-sa/*)'
    r = get('https://archive.org/advancedsearch.php?' + urllib.parse.urlencode([('q', query), ('rows', n), ('output', 'json')] + [('fl[]', f) for f in ['identifier', 'title', 'creator', 'licenseurl', 'description']]))
    return [archive_item(d) for d in r['response']['docs']]


def archive_info(ident):
    m = get('https://archive.org/metadata/' + urllib.parse.quote(ident.split('/')[0]))
    it = archive_item({'identifier': ident.split('/')[0], **m.get('metadata', {})}); it['_files'] = m.get('files', []); return it


def archive_url(it, height):
    ident = it['id'][8:]
    if '/' in ident: return 'https://archive.org/download/' + urllib.parse.quote(ident)
    files = [f for f in it['_files'] if f.get('name', '').lower().endswith(('.mp4', '.ogv', '.webm', '.mpeg', '.mov'))]
    if not files: raise SystemExit('Internet Archive: không có file video')
    files.sort(key=lambda f: (not f['name'].lower().endswith('.mp4'), int(f.get('size') or 0)))
    return f"https://archive.org/download/{ident}/{urllib.parse.quote(files[0]['name'])}"


# ---------------- Pexels ----------------
def pexels_item(v):
    return {'id': f"pexels:{v['id']}", 'source': 'Pexels', 'title': v.get('url', '').rstrip('/').split('/')[-1], 'page': v.get('url'),
            'author': (v.get('user') or {}).get('name', ''), 'license': 'Pexels License', 'license_ok': True, 'duration': v.get('duration'),
            'width': v.get('width'), 'height': v.get('height'), 'desc': '', '_files': v.get('video_files', [])}


PEX = {'Authorization': 'pexels-key-from-proxy'}  # giá trị giả: proxy thay bằng key thật (Network secrets)


def pexels_search(q, n):
    r = get('https://api.pexels.com/videos/search?' + urllib.parse.urlencode({'query': q, 'per_page': n, 'orientation': 'portrait'}), PEX)
    return [pexels_item(v) for v in r.get('videos', [])]


def pexels_info(pid):
    return pexels_item(get(f'https://api.pexels.com/videos/videos/{pid}', PEX))


def pexels_url(it, height):
    fs = sorted([f for f in it['_files'] if f.get('link')], key=lambda f: abs(max(f.get('height') or 0, f.get('width') or 0) - height))
    return fs[0]['link']


SRC = {'commons': (commons_search, commons_info, commons_url), 'nasa': (nasa_search, nasa_info, nasa_url),
       'archive': (archive_search, archive_info, archive_url), 'pexels': (pexels_search, pexels_info, pexels_url)}


def info(cid):
    src, _, rest = cid.partition(':')
    if src not in SRC: raise SystemExit(f'ID lạ: {cid} (cần commons:/nasa:/archive:/pexels:)')
    return SRC[src][1](rest)


def slug(name):
    s = unicodedata.normalize('NFD', name.replace('đ', 'd').replace('Đ', 'D'))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()
    return re.sub(r'[^a-z0-9]+', '-', os.path.splitext(s)[0]).strip('-')[:50] or 'clip'


def probe(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration', '-of', 'json', f], capture_output=True, text=True)
    j = json.loads(r.stdout or '{}'); st = (j.get('streams') or [{}])[0]
    return {'duration': round(float((j.get('format') or {}).get('duration') or 0), 2), 'width': st.get('width'), 'height': st.get('height')}


def credit_line(it):
    a = re.sub(r'\s+', ' ', it.get('author') or '').strip()
    a = a if len(a) <= 40 else a[:38] + '…'
    return ' · '.join(x for x in [a, it.get('license'), it['source']] if x)


def cmd_get(out_dir, cid, start=0.0, dur=None, name=None, height=1280, audio=False):
    it = info(cid)
    if not it['license_ok'] and '--force' not in sys.argv:
        raise SystemExit(f"Giấy phép không dùng được: {it['license']!r} ({it['page']}). Chọn video khác.")
    src = cid.partition(':')[0]
    urls = SRC[src][2](it, height)
    urls = urls if isinstance(urls, list) else [urls]
    os.makedirs(out_dir, exist_ok=True)
    name = name or slug(it['title'])
    raw = os.path.join(out_dir, f'.{name}.src')
    data, last = None, None
    for i, url in enumerate(urls):
        try: data = get(url, PEX if src == 'pexels' and 'pexels.com' in url else None, tries=(1 if i == 0 and len(urls) > 1 else 3 if i < len(urls) - 1 else 5), raw=True); break
        except Exception as e: last = e; print(f'(bỏ qua {url.rsplit("/", 1)[-1][:60]}: {str(e)[:60]})', file=sys.stderr)
    if data is None: raise SystemExit(f'Không tải được: {last}')
    open(raw, 'wb').write(data)
    out = os.path.join(out_dir, name + '.mp4')
    args = ['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-i', raw] + (['-t', str(dur)] if dur else []) + [
        '-vf', f'scale=-2:min({height}\\,ih)', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    args += ['-c:a', 'aac', '-b:a', '128k'] if audio else ['-an']
    r = subprocess.run(args + [out], capture_output=True, text=True)
    os.remove(raw)
    if r.returncode != 0: raise SystemExit('ffmpeg lỗi: ' + r.stderr[-400:])
    meta = probe(out)
    rec = {'file': os.path.basename(out), 'id': cid, 'source': it['source'], 'title': it['title'], 'page': it['page'], 'author': it['author'],
           'license': it['license'], 'credit': credit_line(it), 'start': start, **meta}
    if it.get('note'): rec['note'] = it['note']
    jf = os.path.join(out_dir, 'clips.json')
    allc = json.load(open(jf)) if os.path.exists(jf) else []
    allc = [c for c in allc if c['file'] != rec['file']] + [rec]
    json.dump(allc, open(jf, 'w'), ensure_ascii=False, indent=1)
    return rec


def main():
    a = sys.argv[1:]
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    if not a or a[0] not in ('search', 'get', 'info'): print(__doc__); sys.exit(2)
    if a[0] == 'search':
        n, res, errs = int(opt('--n', 8)), [], {}
        for s in opt('--src', 'commons,nasa,archive').split(','):
            try: res += SRC[s][0](a[1], n)
            except Exception as e: errs[s] = f'{type(e).__name__}: {e}' + (' (mạng chặn host này hoặc thiếu key)' if '403' in str(e) or 'Tunnel' in str(e) or '401' in str(e) else '')
        lo, hi = float(opt('--min', 0)), float(opt('--max', 1e9))
        res = [r for r in res if r['license_ok'] and (r['duration'] is None or lo <= r['duration'] <= hi)]
        for r in res:
            for k in [k for k in r if k.startswith('_')]: del r[k]
        print(json.dumps({'results': res, 'errors': errs}, ensure_ascii=False, indent=1))
    elif a[0] == 'info':
        it = info(a[1]); print(json.dumps({k: v for k, v in it.items() if not k.startswith('_')}, ensure_ascii=False, indent=1))
    else:
        rec = cmd_get(a[1], a[2], float(opt('--start', 0)), float(opt('--dur')) if opt('--dur') else None, opt('--name'), int(opt('--height', 1280)), '--audio' in a)
        print(json.dumps(rec, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
