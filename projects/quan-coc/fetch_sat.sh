#!/bin/sh
# Tải ảnh vệ tinh (Esri World Imagery, miễn phí, không key). Chạy từ gốc repo.
python3 studio/tools/satmap.py projects/quan-coc/sat \
  --level 4:world \
  --level 7:10.3,105.9:2000x2600 \
  --level 10:10.04,105.77:2000x3000 \
  --level 13:10.036,105.786:2000x3200 \
  --level 16:10.0358,105.7880:2200x3400 \
  --level 18:10.0357,105.7880:2400x3600
