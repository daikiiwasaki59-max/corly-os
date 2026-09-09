#!/usr/bin/env python3
"""GitHub Actions 専用: Pexels / Pixabay の無料APIキーで写真を取得し、
site/assets/img/ph-<slot>.jpg に保存する。

必要な GitHub Secrets（どちらか一方でも可。両方あれば精度が上がる）:
  PEXELS_API_KEY   https://www.pexels.com/api/ で無料発行（登録のみ、カード不要）
  PIXABAY_API_KEY  https://pixabay.com/api/docs/ で無料発行（要アカウント登録）

どちらの Secret も未設定なら何もせず正常終了する（ワークフローを失敗させない）。
"""
import json, os, re, time, urllib.request, urllib.parse
from io import BytesIO
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site', 'assets', 'img')
CREDITS_PATH = os.path.join(ROOT, 'photos-inbox', 'CREDITS.md')

PEXELS_KEY = os.environ.get('PEXELS_API_KEY', '').strip()
PIXABAY_KEY = os.environ.get('PIXABAY_API_KEY', '').strip()

# 枠ごとの (幅, 高さ) と検索クエリ候補（先頭から試す。英語の方が母数が多い）
SLOTS = {
    'hero':    ((1600, 900), ['professional cleaner', 'commercial cleaning service', 'cleaning staff']),
    'vacant':  ((1200, 900), ['empty apartment room', 'empty room interior']),
    'regular': ((1200, 900), ['office cleaning', 'janitor office', 'cleaning office floor']),
    'store':   ((1200, 900), ['restaurant kitchen', 'commercial kitchen']),
    'report':  ((1200, 900), ['clipboard checklist', 'inspection clipboard']),
    'office':  ((1200, 900), ['modern office building exterior', 'office building']),
    'staff':   ((1200, 900), ['cleaning staff', 'janitor worker', 'cleaning team']),
    'work1':   ((1200, 900), ['mop floor cleaning']),
    'work2':   ((1200, 900), ['window cleaning']),
    'work3':   ((1200, 900), ['vacuum cleaner carpet']),
    'work4':   ((1200, 900), ['cleaning supplies']),
}

# Openverse で実際に混入した事故（花のマクロ・軍用ヘリ・上半身裸 等）を踏まえた
# 簡易ブロックリスト。完全な安全装置ではないため、取得後は必ず目視確認すること。
BLOCK = re.compile(
    r'shirtless|topless|nude|naked|torso|\babs\b|military|helicopter|aircraft|fighter jet|'
    r'weapon|\bgun\b|rifle|flower|floral|insect|butterfly|wildlife|\bbird\b|'
    r'nail salon|manicure|\bspa\b|massage|swimsuit|bikini|lingerie',
    re.IGNORECASE,
)

HEADERS = {'User-Agent': 'corly-site-photo-fetch/1.0 (contact: info@corly.co.jp)'}


def pexels_search(query):
    if not PEXELS_KEY:
        return []
    url = 'https://api.pexels.com/v1/search?' + urllib.parse.urlencode(
        {'query': query, 'per_page': 10, 'orientation': 'landscape'})
    req = urllib.request.Request(url, headers={**HEADERS, 'Authorization': PEXELS_KEY})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.load(r)
    out = []
    for p in data.get('photos', []):
        alt = p.get('alt') or ''
        if BLOCK.search(alt):
            continue
        src = p.get('src', {})
        out.append({
            'provider': 'Pexels', 'url': src.get('large2x') or src.get('original'),
            'w': p.get('width', 0), 'h': p.get('height', 0),
            'title': alt or query, 'creator': p.get('photographer', '不明'),
            'source': p.get('url', ''),
        })
    return out


def pixabay_search(query):
    if not PIXABAY_KEY:
        return []
    url = 'https://pixabay.com/api/?' + urllib.parse.urlencode({
        'key': PIXABAY_KEY, 'q': query, 'image_type': 'photo',
        'orientation': 'horizontal', 'safesearch': 'true', 'per_page': 10,
    })
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.load(r)
    out = []
    for h in data.get('hits', []):
        tags = h.get('tags') or ''
        if BLOCK.search(tags):
            continue
        out.append({
            'provider': 'Pixabay', 'url': h.get('largeImageURL'),
            'w': h.get('imageWidth', 0), 'h': h.get('imageHeight', 0),
            'title': tags or query, 'creator': h.get('user', '不明'),
            'source': h.get('pageURL', ''),
        })
    return out


def download(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        ctype = r.headers.get('Content-Type', '')
        if 'image' not in ctype:
            raise ValueError(f'not an image: {ctype}')
        return r.read()


def main():
    if not PEXELS_KEY and not PIXABAY_KEY:
        print('PEXELS_API_KEY / PIXABAY_API_KEY のどちらも未設定のため、写真取得をスキップします。')
        print('GitHub の Settings > Secrets and variables > Actions で追加してください。')
        return

    os.makedirs(OUT, exist_ok=True)
    credits = [
        '# 使用画像クレジット（自動取得・Pexels / Pixabay）', '',
        '取得日: ' + time.strftime('%Y-%m-%d'), '',
        '両サービスとも無料ライセンスの範囲内（商用利用可・クレジット表記の法的義務なし）。'
        '出典追跡のため記録している。', '',
        '**自動取得のため、公開前に必ず目視確認すること。**', '',
        '| 枠 | 提供元 | タイトル/タグ | 作者 | 出典URL |', '|---|---|---|---|---|',
    ]
    got, missed = 0, []
    for slot, (size, queries) in SLOTS.items():
        candidates = []
        for q in queries:
            try:
                candidates = pexels_search(q) or pixabay_search(q)
            except Exception as e:
                print(f'[{slot}] search failed for "{q}": {e}')
                candidates = []
            if candidates:
                break
            time.sleep(1)
        item = next((c for c in candidates if c['w'] >= 900 and c['h'] >= 600 and c['url']), None) \
            or (candidates[0] if candidates else None)
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
            title = (item['title'] or '')[:80].replace('|', '-')
            creator = (item['creator'] or '不明').replace('|', '-')
            print(f"[{slot}] OK <- [{item['provider']}] {title} by {creator} ({item['source']})")
            credits.append(f"| {slot} | {item['provider']} | {title} | {creator} | {item['source']} |")
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
