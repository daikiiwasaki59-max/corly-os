#!/usr/bin/env python3
"""GitHub Actions 専用スクリプト。
Openverse（CC0 / パブリックドメインのみ）から写真を検索・取得し、
site/assets/img/ph-<slot>.jpg として保存する。ログイン・APIキー不要。

このスクリプトはローカルのサンドボックス環境では動かない（外部ネットワークが
遮断されているため）。.github/workflows/fetch-photos.yml から
GitHub Actions のランナー上でのみ実行する。
"""
import json, os, time, urllib.request, urllib.parse
from io import BytesIO
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site', 'assets', 'img')
CREDITS_PATH = os.path.join(ROOT, 'photos-inbox', 'CREDITS.md')

# 枠ごとの (幅, 高さ) と検索クエリ候補（先頭から試す）
SLOTS = {
    'hero':    ((1600, 900), ['professional cleaning service', 'commercial cleaning', 'cleaning staff']),
    'vacant':  ((1200, 900), ['empty apartment room', 'empty room interior', 'vacant apartment']),
    'regular': ((1200, 900), ['office cleaning', 'office lobby', 'mop floor']),
    'store':   ((1200, 900), ['restaurant kitchen stainless steel', 'commercial kitchen', 'restaurant kitchen']),
    'report':  ((1200, 900), ['clipboard checklist', 'inspection checklist', 'clipboard paper']),
    'office':  ((1200, 900), ['office building exterior', 'modern office building']),
    'staff':   ((1200, 900), ['rubber gloves cleaning', 'cleaning gloves', 'cleaning supplies']),
    'work1':   ((1200, 900), ['mop cleaning floor', 'cleaning floor']),
    'work2':   ((1200, 900), ['window cleaning', 'glass window cleaning']),
    'work3':   ((1200, 900), ['vacuum cleaner carpet', 'vacuuming']),
    'work4':   ((1200, 900), ['cleaning supplies', 'cleaning products']),
}

API = 'https://api.openverse.org/v1/images/'
HEADERS = {'User-Agent': 'corly-site-photo-fetch/1.0 (contact: info@corly.co.jp)'}


def search(query):
    params = {'q': query, 'license': 'cc0,pdm', 'mature': 'false', 'page_size': 20, 'category': 'photograph'}
    url = API + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r).get('results', [])


def pick(results, min_side=700):
    for it in results:
        w, h = it.get('width') or 0, it.get('height') or 0
        if w >= min_side and h >= min_side and it.get('url'):
            return it
    return results[0] if results else None


def download(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        ctype = r.headers.get('Content-Type', '')
        if 'image' not in ctype:
            raise ValueError(f'not an image: {ctype}')
        return r.read()


def main():
    os.makedirs(OUT, exist_ok=True)
    credits = [
        '# 使用画像クレジット（自動取得・Openverse / CC0・パブリックドメインのみ）', '',
        '取得日: ' + time.strftime('%Y-%m-%d'), '',
        '法的にはCC0/PDMのため表記義務はないが、出典追跡のために記録している。', '',
        '| 枠 | タイトル | 作者 | ライセンス | 出典URL |', '|---|---|---|---|---|',
    ]
    got, missed = 0, []
    for slot, (size, queries) in SLOTS.items():
        item = None
        for q in queries:
            try:
                results = search(q)
            except Exception as e:
                print(f'[{slot}] search failed for "{q}": {e}')
                results = []
            item = pick(results)
            if item:
                break
            time.sleep(1)
        if not item:
            print(f'[{slot}] 該当画像なし。プレースホルダーのまま。')
            missed.append(slot)
            continue
        try:
            data = download(item['url'])
            im = Image.open(BytesIO(data))
            im = ImageOps.exif_transpose(im).convert('RGB')
            im = ImageOps.fit(im, size, Image.LANCZOS, centering=(0.5, 0.4))
            dst = os.path.join(OUT, f'ph-{slot}.jpg')
            im.save(dst, 'JPEG', quality=82, optimize=True, progressive=True)
            title = (item.get('title') or '(無題)').replace('|', '-')
            creator = (item.get('creator') or '不明').replace('|', '-')
            lic = (item.get('license') or '').upper()
            src = item.get('foreign_landing_url', '')
            print(f'[{slot}] OK <- {title} ({lic}) {src}')
            credits.append(f'| {slot} | {title} | {creator} | {lic} | {src} |')
            got += 1
        except Exception as e:
            print(f'[{slot}] ダウンロード/変換失敗: {e}')
            missed.append(slot)
        time.sleep(1)

    os.makedirs(os.path.dirname(CREDITS_PATH), exist_ok=True)
    with open(CREDITS_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(credits) + '\n')
    if missed:
        with open(CREDITS_PATH, 'a', encoding='utf-8') as f:
            f.write('\n見つからなかった枠（仮のグレー枠のまま）: ' + ', '.join(missed) + '\n')
    print(f'{got}/{len(SLOTS)} 枚を取得しました。見つからなかった枠: {missed or "なし"}')


if __name__ == '__main__':
    main()
