#!/usr/bin/env python3
"""Dự toán chi phí một video (agent du-toan dùng). Không gọi dịch vụ trả phí nào.

estimate.py projects/<slug> [--style <id>] [--plan projects/<slug>/estimate-plan.json]

Không có --plan: in thông tin nền để lập kế hoạch (độ dài lời đọc, số cảnh ước tính, phong cách, thư viện hình
có sẵn cho phong cách đó, bảng giá, trần ngân sách, số đã chi tháng này).
Có --plan: tính tổng, so với trần, ghi projects/<slug>/estimate.json. Định dạng plan:
{"images": [{"what": "tranh nền hoàng hôn biển", "size": "2K", "count": 2, "model": "gemini-3.1-flash-image"}],
 "videos": [{"what": "...", "seconds": 8}],
 "retry": 0.3,            # dự phòng làm lại (mặc định 30% phần ảnh/video)
 "notes": ["..."]}
"""
import datetime, glob, json, os, re, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))
IMG_PRICE = {'gemini-3.1-flash-image': {'1K': 0.067, '2K': 0.101, '4K': 0.151}, 'gemini-3.1-flash-lite-image': {'1K': 0.034, '2K': 0.05, '4K': 0.113},
             'gemini-3-pro-image': {'1K': 0.134, '2K': 0.134, '4K': 0.24}}
VID_PER_SEC = {'gemini-omni-1.2-flash': 0.07}
ART_DIR = {'phong-canh-3d': 'phong-canh'}          # phong cách -> thư mục trong studio/ai-art
RENDER_SEC_PER_SEC = {'phong-canh-3d': 10, 'thi-nghiem': 40, 've-tinh': 6}   # giây máy cho 1 giây phim (ước lượng)
args = sys.argv[1:]
proj = args[0].rstrip('/'); slug = os.path.basename(proj)
plan_path = args[args.index('--plan') + 1] if '--plan' in args else None

def read(p): return open(p, encoding='utf8').read() if os.path.exists(p) else ''
brief = read(os.path.join(proj, 'brief.md')); narr = read(os.path.join(proj, 'narration.txt'))
words = len(narr.split()); dur = round(words / 4.3, 1) if words else None   # ~4,3 từ/giây ở tốc độ 1,2x
style = args[args.index('--style') + 1] if '--style' in args else None
for s in ([] if style else re.findall(r'`([a-z0-9-]+)`', brief) + re.findall(r'(?i)phong cách[^\n:]*:\s*([a-z0-9-]+)', brief)):
    if s in ART_DIR or s in RENDER_SEC_PER_SEC or re.match(r'^[a-z]+(-[a-z0-9]+)+$', s): style = s; break
lib = sorted(os.path.basename(f) for f in glob.glob(os.path.join(ROOT, 'ai-art', ART_DIR.get(style, '__none__'), '*.png')) if not f.endswith('-raw.png'))
budget = json.load(open(os.path.join(ROOT, 'budget.json'))) if os.path.exists(os.path.join(ROOT, 'budget.json')) else {}
rows = [json.loads(l) for l in open(os.path.join(ROOT, 'costs.jsonl'), encoding='utf8') if l.strip()] if os.path.exists(os.path.join(ROOT, 'costs.jsonl')) else []
month = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m')
spent_month = round(sum(r['usd'] for r in rows if r['time'][:7] == month), 3)
spent_proj = round(sum(r['usd'] for r in rows if r.get('project') == slug), 3)
cap_video = budget.get('projects', {}).get(slug, budget.get('per_video_usd', 0.6)); cap_month = budget.get('month_usd', 5)
base = {"slug": slug, "style": style, "narration_words": words, "duration_s": dur, "shots_guess": round(dur / 4) if dur else None,
        "library": lib, "price_image": IMG_PRICE, "price_video_per_s": VID_PER_SEC, "video_cap": budget.get('video_per_job_usd', 0),
        "cap_video_usd": cap_video, "cap_month_usd": cap_month, "spent_month_usd": spent_month, "spent_project_usd": spent_proj,
        "render_minutes": round(dur * RENDER_SEC_PER_SEC.get(style, 8) / 60, 1) if dur else None}
if not plan_path:
    print(json.dumps(base, ensure_ascii=False, indent=1)); sys.exit(0)

plan = json.load(open(plan_path)); items = []
for im in plan.get('images', []):
    m = im.get('model', 'gemini-3.1-flash-image'); u = IMG_PRICE[m][im.get('size', '1K')] * im.get('count', 1)
    items.append({"what": f"{im.get('count', 1)} ảnh {im.get('size', '1K')}: {im['what']}", "usd": round(u, 3)})
for v in plan.get('videos', []):
    m = v.get('model', 'gemini-omni-1.2-flash'); items.append({"what": f"video AI {v['seconds']} giây: {v['what']}", "usd": round(VID_PER_SEC[m] * v['seconds'], 3)})
paid = sum(i['usd'] for i in items); retry = round(paid * plan.get('retry', 0.3), 3)
if retry: items.append({"what": "dự phòng làm lại", "usd": retry})
items += [{"what": "giọng đọc Gemini TTS (lượt miễn phí)", "usd": 0}, {"what": "dựng phim, nhạc, tiếng động (máy tự làm)", "usd": 0}]
total = round(paid + retry, 3)
need = total > cap_video + 1e-9 or spent_month + total > cap_month + 1e-9 or (plan.get('videos') and total > 0 and budget.get('video_per_job_usd', 0) <= 0)
est = {"usd": total, "cap": cap_video, "month_left": round(cap_month - spent_month, 3), "items": items, "needApproval": bool(need), "approved": False,
       "spent": spent_proj, "renderMinutes": base["render_minutes"], "notes": plan.get('notes', []), "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')}
json.dump(est, open(os.path.join(proj, 'estimate.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(est, ensure_ascii=False, indent=1))
