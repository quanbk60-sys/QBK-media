#!/usr/bin/env python3
"""Gemini TTS → WAV. Usage: tts.py TEXT_FILE OUT.wav [--model gemini-3.8-flash-tts] [--voice Bodi]
The API key is injected by the session's network proxy (Network secret for generativelanguage.googleapis.com,
header x-goog-api-key). Never paste keys; GEMINI_API_KEY may hold a placeholder."""
import base64, json, os, sys, urllib.request, wave
args = sys.argv[1:]
def opt(k, d):
    return args[args.index(k) + 1] if k in args else d
text_file, out = args[0], args[1]
model, voice = opt('--model', 'gemini-3.8-flash-tts'), opt('--voice', 'Bodi')
text = ' '.join(open(text_file, encoding='utf8').read().split())
body = {"contents": [{"role": "user", "parts": [{"text": text}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
    data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "proxy-injected")})
try:
    data = json.load(urllib.request.urlopen(req, timeout=300))
except urllib.error.HTTPError as e:
    msg = json.load(e).get('error', {}).get('message', '')[:300]
    sys.exit(f"TTS HTTP {e.code}: {msg}")
part = next(p['inlineData'] for p in data['candidates'][0]['content']['parts'] if 'inlineData' in p)
raw, mime = base64.b64decode(part['data']), part['mimeType']
if raw[:4] == b'RIFF':
    open(out, 'wb').write(raw)
else:  # raw PCM L16
    rate = int(mime.split('rate=')[1].split(';')[0]) if 'rate=' in mime else 24000
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(raw)
print(json.dumps({"output": out, "model": model, "voice": voice, "usage": data.get('usageMetadata')}))
