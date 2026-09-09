#!/usr/bin/env python3
"""photos-inbox/ の写真を site/assets/img/ph-<name>.jpg に変換する（要 Pillow: pip install pillow）"""
import os, sys
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, 'photos-inbox'); OUT = os.path.join(ROOT, 'site', 'assets', 'img')
SLOTS = {'hero': (1600, 900), 'vacant': (1200, 900), 'regular': (1200, 900), 'store': (1200, 900), 'report': (1200, 900),
         'office': (1200, 900), 'staff': (1200, 900), 'work1': (1200, 900), 'work2': (1200, 900), 'work3': (1200, 900), 'work4': (1200, 900)}
done = 0
for f in sorted(os.listdir(INBOX)):
    name, ext = os.path.splitext(f)
    if name not in SLOTS or ext.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
        continue
    im = Image.open(os.path.join(INBOX, f)); im = ImageOps.exif_transpose(im).convert('RGB')
    im = ImageOps.fit(im, SLOTS[name], Image.LANCZOS, centering=(0.5, 0.5))   # 指定比率で中央トリミング
    dst = os.path.join(OUT, f'ph-{name}.jpg'); im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
    print(f'{f} -> {os.path.relpath(dst, ROOT)} ({os.path.getsize(dst)//1024} KB)'); done += 1
print(f'{done} 枚を変換しました。次に: node scripts/build-site-pages.mjs')
if done == 0: sys.exit(1)
