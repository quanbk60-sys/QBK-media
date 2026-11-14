#!/bin/sh
# QBK: cài thư viện Lemo-Opuscar vào ~/lemo-opuscar (không commit vào repo QBK) và chuẩn bị chạy trong container cloud.
#   sh .claude/skills/lemo-opuscar/scripts/install.sh      → in LIB=<đường dẫn> và PLAYWRIGHT_CHROME=<trình duyệt>
set -e
LIB=${LEMO_OPUSCAR_HOME:-$HOME/lemo-opuscar}
REPO=https://github.com/lemomo-ai/lemo-opuscar.git
if [ ! -f "$LIB/AGENTS.md" ]; then
  git clone --quiet --depth 1 --filter=blob:none --sparse --branch main "$REPO" "$LIB"
  (cd "$LIB" && git sparse-checkout set --no-cone '/*' '!/styles/*/demo/' '!/styleboard/' '!/docs/readme/' '!/docs/cover.jpg' '!/styles/*/poster.jpg')
  git -C "$LIB" config lemo.managed true
else
  git -C "$LIB" fetch --quiet --depth 1 origin main && git -C "$LIB" reset --quiet --hard FETCH_HEAD || echo "! không cập nhật được thư viện, dùng bản đang có"
fi
cd "$LIB"
[ -d node_modules/three ] || npm install --ignore-scripts --no-audit --no-fund --loglevel=error   # chỉ playwright-core + three
[ -x .venv/bin/python ] || python3 -m venv .venv
.venv/bin/python -c 'import numpy,scipy,soundfile,soxr,PIL,fontTools' 2>/dev/null || .venv/bin/pip install -q --disable-pip-version-check -r requirements.txt
# trình duyệt có sẵn của container (không chạy "playwright install")
CHROME=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)
echo "LIB=$LIB"
echo "PLAYWRIGHT_CHROME=$CHROME"
