#!/bin/sh
# Ảnh vệ tinh Esri World Imagery (miễn phí, không key) cho demo phong cách bds. Chạy từ gốc repo.
# Camera nghiêng cần ảnh cao hơn khung: ở góc 40°, mức Z phủ được view zoom z khi H >= 3400 * 2^(Z - z) và W >= 1500 * 2^(Z - z).
python3 studio/tools/satmap.py projects/_mau-bds-tien-ich/sat \
  --level 12:21.028,105.849:2400x4000 \
  --level 14:21.028,105.849:2400x4400 \
  --level 15:21.028,105.849:2400x5200 \
  --level 16:21.028,105.849:3200x5600 \
  --level 17:21.0262,105.849:2600x5000 \
  --grade 1.0,1.05,1.08
