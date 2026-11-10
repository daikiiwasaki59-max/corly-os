"""発注書PDF(4ページ)の2ページ目「注文請書」だけを記入し、1ページのPDFとして出力する。

使い方: python3 fill_chumonsho.py <元PDF> <出力PDF> <記載日 YYYY-MM-DD>
"""
import sys
import os
import pymupdf

src, out, date = sys.argv[1], sys.argv[2], sys.argv[3]
y, m, d = (int(x) for x in date.split('-'))
STAMP = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'stamp.jpg')

JP = pymupdf.Font("japan")
AS = pymupdf.Font("helv")
FS = 9

def centered(page, x0, x1, ybase, text, ascii_=True):
    font = AS if ascii_ else JP
    w = font.text_length(text, fontsize=FS)
    page.insert_text((x0 + ((x1 - x0) - w) / 2, ybase), text, fontsize=FS,
                     fontname="helv" if ascii_ else "japan", color=(0, 0, 0))

def stamp(page, rect, inset=3):
    r = pymupdf.Rect(rect).normalize()
    r = pymupdf.Rect(r.x0 + inset, r.y0 + inset, r.x1 - inset, r.y1 - inset)
    side = min(r.width, r.height)
    cx, cy = (r.x0 + r.x1) / 2, (r.y0 + r.y1) / 2
    page.insert_image(pymupdf.Rect(cx - side / 2, cy - side / 2, cx + side / 2, cy + side / 2), filename=STAMP)

doc = pymupdf.open(src)
if doc.page_count != 4:
    sys.exit("想定外のページ数: %d (4ページの発注書が前提)" % doc.page_count)

p = doc[1]
if '注　文　請　書' not in p.get_text():
    sys.exit("2ページ目に「注文請書」が見つかりません。テンプレートが変わった可能性があります")

# 注文請日 = 記載日(作成した日)
centered(p, 373.4, 429.67, 143.5, str(y))
centered(p, 437.7, 485.95, 143.5, str(m))
centered(p, 493.99, 542.23, 143.5, str(d))
centered(p, 349.5, 521.4, 208.65, "06-4256-2693")
centered(p, 349.5, 521.4, 231.45, "岩崎大樹", ascii_=False)
stamp(p, (521.4, 194.8, 572.3, 239.5))

tmp = out + '.tmp.pdf'
doc.save(tmp, garbage=4, deflate=True, clean=True)
# 新規文書に1ページだけ取り込み直す(StructTreeRoot残りでAcrobatが開けなくなるのを防ぐ)
src2 = pymupdf.open(tmp)
new = pymupdf.open()
new.insert_pdf(src2, from_page=1, to_page=1)
new.save(out, garbage=4, deflate=True, clean=True)
src2.close()
os.remove(tmp)
print("saved", out)
