#!/bin/sh
# Ảnh vệ tinh Esri (miễn phí) cho nam-long-2-earth: phủ dự án, trung tâm Cần Thơ và sân bay. Chạy từ gốc repo.
python3 studio/tools/satmap.py projects/nam-long-2-earth/sat \
  --level 12:10.03,105.76:2600x4200 --level 13:10.035,105.755:2400x4400 --level 14:10.012,105.775:2400x4400 \
  --level 16:9.9960,105.7826:2400x4200 --level 17:9.9955,105.7830:2400x4200
