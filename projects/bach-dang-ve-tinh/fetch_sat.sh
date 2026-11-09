#!/bin/sh
# Tải lại ảnh vệ tinh (Esri World Imagery, miễn phí, không key). Chạy từ gốc repo.
python3 studio/tools/satmap.py projects/bach-dang-ve-tinh/sat \
  --level 4:world \
  --level 6:19.5,106.5:2200x2800 \
  --level 8:20.5,106.6:2400x3600 \
  --level 10:20.88,106.77:2400x4000 \
  --level 12:20.89,106.77:2400x3000 \
  --level 14:20.92,106.78:2600x3400
