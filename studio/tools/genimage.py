#!/usr/bin/env python3
"""Tạo ảnh bằng Gemini (Nano Banana) — DỊCH VỤ CÓ PHÍ, có trần ngân sách và sổ chi phí.

genimage.py "PROMPT" OUT.png [--model gemini-3.1-flash-image] [--size 1K|2K|4K] [--aspect 9:16]
            [--ref ảnh.png ...] [--project <slug>] [--note "..."] [--dry]

- Key do proxy của môi trường tự gắn (Network secret cho generativelanguage.googleapis.com). Không dán key.
- Mỗi ảnh ghi một dòng vào studio/costs.jsonl (thời gian, project, model, cỡ, giá ước tính, prompt).
- Trần ngân sách đọc từ studio/budget.json: {"month_usd": ..., "per_video_usd": ...}. Vượt trần thì dừng, không gọi API.
- --ref: ảnh tham chiếu (ảnh do studio tự tạo hoặc tự vẽ) để giữ đồng nhất phong cách. Không dùng khung hình video người khác.
- --dry: chỉ in giá ước tính và tổng đã chi, không gọi API.
"""
import base64, datetime, json, mimetypes, os, sys, urllib.request
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LEDGER, BUDGET = os.path.join(ROOT, 'costs.jsonl'), os.path.join(ROOT, 'budget.json')
# Giá ước tính mỗi ảnh (USD), theo các bảng giá tổng hợp 11/2026. Sửa ở đây khi Google đổi giá.
PRICE = {'gemini-3.1-flash-image': {'1K': 0.067, '2K': 0.101, '4K': 0.151},
         'gemini-3.1-flash-lite-image': {'1K': 0.034, '2K': 0.05, '4K': 0.113},
         'gemini-3-pro-image': {'1K': 0.134, '2K': 0.134, '4K': 0.24},
         'gemini-2.5-flash-image': {'1K': 0.039, '2K': 0.039, '4K': 0.039}}

args = sys.argv[1:]
def opt(k, d=None):
    return args[args.index(k) + 1] if k in args else d
def opts(k):
    return [args[i + 1] for i, a in enumerate(args) if a == k]
prompt, out = args[0], args[1]
model, size, aspect = opt('--model', 'gemini-3.1-flash-image'), opt('--size', '1K'), opt('--aspect', '9:16')
project, note = opt('--project', '_studio'), opt('--note', '')
price = PRICE.get(model, {}).get(size, 0.15)

def ledger():
    if not os.path.exists(LEDGER): return []
    return [json.loads(l) for l in open(LEDGER, encoding='utf8') if l.strip()]
rows, now = ledger(), datetime.datetime.now(datetime.timezone.utc)
month = sum(r['usd'] for r in rows if r['time'][:7] == now.strftime('%Y-%m'))
proj = sum(r['usd'] for r in rows if r['project'] == project)
budget = json.load(open(BUDGET)) if os.path.exists(BUDGET) else {}
cap_m, cap_p = budget.get('month_usd', 5), budget.get('projects', {}).get(project, budget.get('per_video_usd', 0.6))
status = {"price_usd": price, "month_spent": round(month, 3), "month_cap": cap_m, "project": project, "project_spent": round(proj, 3), "project_cap": cap_p}
if '--dry' in args: print(json.dumps(status)); sys.exit(0)
if month + price > cap_m + 1e-9: sys.exit(f"DỪNG: vượt trần tháng ({month:.2f}+{price} > {cap_m} USD). Hỏi người dùng trước khi nâng studio/budget.json.")
if proj + price > cap_p + 1e-9: sys.exit(f"DỪNG: vượt trần của {project} ({proj:.2f}+{price} > {cap_p} USD). Hỏi người dùng trước khi nâng.")

parts = [{"text": prompt}]
for ref in opts('--ref'):
    parts.append({"inlineData": {"mimeType": mimetypes.guess_type(ref)[0] or 'image/png', "data": base64.b64encode(open(ref, 'rb').read()).decode()}})
body = {"contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect, "imageSize": size}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "proxy-injected")})
try:
    data = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    sys.exit(f"IMAGE HTTP {e.code}: {json.load(e).get('error', {}).get('message', '')[:400]}")
cand = (data.get('candidates') or [{}])[0]
img = next((p['inlineData'] for p in cand.get('content', {}).get('parts', []) if 'inlineData' in p), None)
# Google tính tiền khi đã sinh ảnh; không có ảnh (bị chặn) thì ghi 0.
usd = price if img else 0
with open(LEDGER, 'a', encoding='utf8') as f:
    f.write(json.dumps({"time": now.isoformat(timespec='seconds'), "project": project, "model": model, "size": size, "usd": usd,
                        "out": os.path.relpath(os.path.abspath(out), os.path.dirname(ROOT)), "note": note, "prompt": prompt[:300],
                        "usage": data.get('usageMetadata')}, ensure_ascii=False) + '\n')
if not img: sys.exit(f"Không có ảnh trả về: {cand.get('finishReason')} {json.dumps(data.get('promptFeedback', {}))[:300]}")
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'wb').write(base64.b64decode(img['data']))
status.update(output=out, usd=usd, month_spent=round(month + usd, 3), project_spent=round(proj + usd, 3))
print(json.dumps(status, ensure_ascii=False))
