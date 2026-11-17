#!/bin/sh
# Tải lại ảnh nền cho 4 scene mẫu BĐS (không commit ảnh vệ tinh). Chạy trong thư mục này.
T=../../../tools/satmap.py
python3 $T sat-capcut --grade 0.78,0.9,1.12 --level 11:16.04,108.2:1400x2200 --level 13:16.045,108.21:1600x2400 --level 15:16.058,108.214:1600x2400 --level 16:16.0592,108.2135:1800x2800 --level 17:16.0592,108.2135:2200x3400
python3 $T sat-navy --source navy --level 11:16.06,108.2:1400x2000 --level 13:16.07,108.225:2000x2600 --level 14:16.07,108.225:2600x3400 --level 15:16.065,108.226:3000x3600 --level 16:16.069,108.2262:3800x3800
python3 $T sat-geo --grade 1.02,1.18,1.06 --level 9:12.5,109.0:1400x2200 --level 11:12.52,109.08:1600x2400 --level 13:12.505,109.11:1800x2600 --level 15:12.50,109.106:1800x2600 --level 17:12.5115,109.0935:1800x2600 --level 18:12.5115,109.0935:1600x2400
python3 $T sat-drone --grade 0.95,1.05,1.05 --level 15:16.0605,108.2215:2000x2000 --level 17:16.0603,108.2190:5200x4400
