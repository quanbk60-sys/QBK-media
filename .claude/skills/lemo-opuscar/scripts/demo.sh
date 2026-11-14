#!/bin/sh
# Lấy mã demo của MỘT phong cách vào thư viện (chỉ để học kỹ thuật, sau khi đã viết TREATMENT.md):  sh demo.sh <slug>
set -e; LIB=${LEMO_OPUSCAR_HOME:-$HOME/lemo-opuscar}
[ -f "$LIB/styles/$1/STYLE.md" ] || { echo "không có phong cách '$1' (xem $LIB/styles/README.md)"; exit 1; }
git -C "$LIB" sparse-checkout add "/styles/$1/demo/" "/styles/$1/poster.jpg" 2>/dev/null || true
echo "$LIB/styles/$1/demo"
