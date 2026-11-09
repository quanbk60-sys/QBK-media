#!/usr/bin/env python3
"""Đọc link TikTok (kể cả link rút gọn vt.tiktok.com) không cần key.
python3 tiktok.py URL [--download OUT.mp4] [--json]

In ra: id, tác giả, tiêu đề/mô tả, hashtag, độ dài, lượt xem/thích/bình luận/chia sẻ, ảnh bìa, nhạc.
--download tải video về để học mẫu (cần mạng tới v16-webapp-prime.us.tiktok.com; nếu bị chặn thì báo rõ).
Cách làm: oEmbed (www.tiktok.com/oembed) lấy id video, rồi đọc JSON nhúng trong trang www.tiktok.com/@x/video/<id>.
"""
import http.cookiejar, json, re, sys, urllib.request
UA = 'Mozilla/5.0 (compatible; QBKStudio/1.0; +https://github.com/quanbk60-sys/QBK-media)'
jar = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
get = lambda u, h=None: op.open(urllib.request.Request(u, headers={'User-Agent': UA, **(h or {})}), timeout=30).read()

def info(url):
    vid = re.search(r'/video/(\d+)', url)
    vid = vid.group(1) if vid else json.loads(get('https://www.tiktok.com/oembed?url=' + url))['embed_product_id']
    html = get(f'https://www.tiktok.com/@x/video/{vid}').decode('utf-8', 'ignore')
    m = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', html, re.S)
    it = json.loads(m.group(1))['__DEFAULT_SCOPE__']['webapp.video-detail']['itemInfo']['itemStruct']
    v, a, st = it['video'], it['author'], it.get('stats', {})
    return {'id': vid, 'url': f"https://www.tiktok.com/@{a['uniqueId']}/video/{vid}", 'author': a['uniqueId'], 'nickname': a.get('nickname'),
            'title': it.get('desc', ''), 'hashtags': re.findall(r'#(\w+)', it.get('desc', '')), 'duration': v.get('duration'),
            'views': st.get('playCount'), 'likes': st.get('diggCount'), 'comments': st.get('commentCount'), 'shares': st.get('shareCount'),
            'music': (it.get('music') or {}).get('title'), 'cover': v.get('cover'), 'play': v.get('playAddr') or v.get('downloadAddr'), 'created': it.get('createTime')}

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: print(__doc__); sys.exit(2)
    d = info(a[0])
    if '--download' in a:
        out = a[a.index('--download') + 1]
        try: open(out, 'wb').write(get(d['play'], {'Referer': 'https://www.tiktok.com/'})); d['downloaded'] = out
        except Exception as e: d['download_error'] = f'{e} (cần mở mạng tới host của link play, xem studio/references/README.md)'
    print(json.dumps(d, ensure_ascii=False, indent=1) if '--json' in a else '\n'.join(f'{k}: {v}' for k, v in d.items() if k not in ('cover', 'play')))
