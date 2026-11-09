#!/usr/bin/env python3
"""Tạo video bằng Gemini Omni — DỊCH VỤ CÓ PHÍ (khoảng 0,07 USD mỗi giây 720p), có trần và sổ chi.

genvideo.py "PROMPT" OUT.mp4 [--image ảnh.png ...] [--video mẫu.mp4] [--aspect 9:16]
            [--model gemini-omni-1.2-flash] [--seconds 8] [--project <slug>] [--note "..."] [--dry]

- --image: ảnh nhân vật / khung đầu (giữ mặt, trang phục). --video: video mẫu chuyển động (ví dụ điệu nhảy).
- Trước khi gọi: ước tính giá = seconds x giá/giây, so với trần "video_month_usd" và "video_per_job_usd" trong studio/budget.json.
- Sau khi gọi: đo độ dài video thật, ghi studio/costs.jsonl (kind "video").
- KHÔNG làm người thật: chỉ nhân vật anime hoặc cảnh vật. Trần mặc định 0 (tắt). Không làm với trẻ em, người nổi tiếng,
  không tạo nội dung khiêu dâm. Đăng mạng xã hội phải gắn nhãn nội dung AI.
"""
import base64, datetime, json, mimetypes, os, subprocess, sys, urllib.request
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LEDGER, BUDGET = os.path.join(ROOT, 'costs.jsonl'), os.path.join(ROOT, 'budget.json')
PER_SEC = {'gemini-omni-1.2-flash': 0.07, 'gemini-omni-1.1-flash': 0.10, 'gemini-omni-flash-preview': 0.10}
args = sys.argv[1:]
def opt(k, d=None): return args[args.index(k) + 1] if k in args else d
def opts(k): return [args[i + 1] for i, a in enumerate(args) if a == k]
prompt, out = args[0], args[1]
model, secs, aspect = opt('--model', 'gemini-omni-1.2-flash'), float(opt('--seconds', 8)), opt('--aspect', '9:16')
project, note = opt('--project', '_studio'), opt('--note', '')
rate = PER_SEC.get(model, 0.10); est = rate * secs
rows = [json.loads(l) for l in open(LEDGER, encoding='utf8') if l.strip()] if os.path.exists(LEDGER) else []
now = datetime.datetime.now(datetime.timezone.utc)
vmonth = sum(r['usd'] for r in rows if r.get('kind') == 'video' and r['time'][:7] == now.strftime('%Y-%m'))
b = json.load(open(BUDGET)) if os.path.exists(BUDGET) else {}
cap_m, cap_job = b.get('video_month_usd', 0), b.get('video_per_job_usd', 0)
status = {"model": model, "est_usd": round(est, 3), "video_month_spent": round(vmonth, 3), "video_month_cap": cap_m, "per_job_cap": cap_job}
if '--dry' in args: print(json.dumps(status)); sys.exit(0)
if est > cap_job + 1e-9: sys.exit(f"DỪNG: ước tính {est:.2f} USD > trần mỗi lần {cap_job} USD (studio/budget.json). Hỏi người dùng.")
if vmonth + est > cap_m + 1e-9: sys.exit(f"DỪNG: vượt trần video tháng ({vmonth:.2f}+{est:.2f} > {cap_m} USD). Hỏi người dùng.")
# Interactions API (Omni chỉ nhận cách gọi này): input = text + ảnh + video, response_format video
import base64 as _b64
from google import genai
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY", "proxy-injected"), http_options={"api_version": "v1beta"})
inp = [{"type": "text", "text": prompt}]
for f in opts('--image'): inp.append({"type": "image", "mime_type": mimetypes.guess_type(f)[0] or 'image/png', "data": _b64.b64encode(open(f, 'rb').read()).decode()})
if opt('--video'): inp.append({"type": "video", "mime_type": "video/mp4", "data": _b64.b64encode(open(opt('--video'), 'rb').read()).decode()})
kw = dict(model=model, input=inp, response_modalities=["video"], background=True,
          response_format={"type": "video", "aspect_ratio": aspect, "duration": f"{int(secs)}s", "resolution": opt('--res', '720p'), "delivery": "inline"})
if opt('--task'): kw["generation_config"] = {"video_config": {"task": opt('--task')}}
try: it = client.interactions.create(**kw)
except Exception as e: sys.exit(f"VIDEO lỗi: {str(e)[:600]}")
import time as _t
for _ in range(180):  # chờ nếu chạy nền
    if getattr(it, 'output_video', None) is not None or getattr(it, 'status', None) in ('completed', 'failed', 'cancelled'): break
    _t.sleep(5); it = client.interactions.get(it.id)
data = {"usageMetadata": json.loads(it.usage.model_dump_json()) if getattr(it, 'usage', None) else None, "status": getattr(it, 'status', None), "id": getattr(it, 'id', None)}
ov = getattr(it, 'output_video', None)
vid = None; dur, usd = 0.0, 0.0
if ov is not None and getattr(ov, 'data', None):
    raw = ov.data if isinstance(ov.data, (bytes, bytearray)) else _b64.b64decode(ov.data)
    os.makedirs(os.path.dirname(os.path.abspath(out)) or '.', exist_ok=True); open(out, 'wb').write(raw); vid = True
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout or 0)
    usd = round(rate * dur, 3)
elif ov is not None and getattr(ov, 'uri', None):
    print('Video dạng URI:', ov.uri); usd = est; vid = True
with open(LEDGER, 'a', encoding='utf8') as f:
    f.write(json.dumps({"time": now.isoformat(timespec='seconds'), "kind": "video", "project": project, "model": model, "seconds": dur, "usd": usd,
                        "out": os.path.relpath(os.path.abspath(out), os.path.dirname(ROOT)), "note": note, "prompt": prompt[:300], "usage": data.get('usageMetadata')}, ensure_ascii=False) + '\n')
if not vid: sys.exit(f"Không có video: {data.get('status')} {str(it)[:600]}")
status.update(output=out, seconds=dur, usd=usd, video_month_spent=round(vmonth + usd, 3))
print(json.dumps(status, ensure_ascii=False))
