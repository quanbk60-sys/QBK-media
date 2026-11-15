#!/bin/sh
# Ảnh vệ tinh Esri (miễn phí) cho demo bds-earth. Chạy từ gốc repo.
python3 studio/tools/satmap.py projects/_mau-bds-earth/sat \
  --level 12:10.012,105.778:2600x4200 --level 14:9.9990,105.7810:2400x4200 \
  --level 16:9.9958,105.7825:2400x4200 --level 17:9.9950,105.7830:2400x4000 --level 18:9.99445,105.78415:1800x3000
