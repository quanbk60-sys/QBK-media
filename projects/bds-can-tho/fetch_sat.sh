#!/bin/sh
# Ảnh vệ tinh Esri (miễn phí) cho bds-can-tho. Chạy từ gốc repo. Camera nghiêng cần ảnh cao gấp ~2 khung.
python3 studio/tools/satmap.py projects/bds-can-tho/sat \
  --level 12:10.012,105.778:2400x4400 \
  --level 14:9.9955,105.7825:2400x4400 \
  --level 16:9.9950,105.7830:2400x4600 \
  --level 17:9.9947,105.7834:2400x4600 \
  --level 18:9.99441,105.78373:2400x4600 \
  --grade 1.0,1.05,1.08
