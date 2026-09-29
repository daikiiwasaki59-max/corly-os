#!/usr/bin/env python3
"""company/09_backlog.md → docs/backlog.html（携帯で見る用。正本は md）"""
import re, html, pathlib, datetime
src = pathlib.Path('company/09_backlog.md').read_text(encoding='utf-8')
out = pathlib.Path('docs/backlog.html')
upd = re.search(r'更新: (\S+)', src); upd = upd.group(1) if upd else ''
sections = re.split(r'\n## ', '\n' + src)[1:]
CSS = """
<title>CORLY 未着手一覧</title>
<style>
/* layout: one column, section = card-less list, badges by owner */
:root{--bg:#f6f4ef;--fg:#1f2a22;--mute:#6b7168;--line:#d9d6cc;--acc:#1f6f5f;--acc-bg:#e3efeb;--warn-bg:#f3e9d2;--warn:#7a5a12;--done:#8d938b;
 --disp:"Zen Kaku Gothic New","Hiragino Sans","Noto Sans JP",system-ui,sans-serif;--body:"Hiragino Sans","Noto Sans JP",system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#171a17;--fg:#e8e6df;--mute:#9aa096;--line:#33382f;--acc:#7fc4b0;--acc-bg:#1f2f2a;--warn-bg:#3a3016;--warn:#e2c46a;--done:#6f756c;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#171a17;--fg:#e8e6df;--mute:#9aa096;--line:#33382f;--acc:#7fc4b0;--acc-bg:#1f2f2a;--warn-bg:#3a3016;--warn:#e2c46a;--done:#6f756c;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--body);padding-inline:16px;padding-block:20px 48px;max-width:720px;margin:0 auto;line-height:1.55}
h1{font-family:var(--disp);font-size:1.45rem;margin:0 0 4px;text-wrap:balance}
.sub{color:var(--mute);font-size:.85rem;margin:0 0 20px}
h2{font-family:var(--disp);font-size:1.02rem;margin:28px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:baseline}
h2 .n{font-size:.8rem;color:var(--mute);font-weight:400;font-variant-numeric:tabular-nums}
ol{list-style:none;padding:0;margin:0;display:grid;gap:10px}
li{display:grid;grid-template-columns:2.6rem 1fr;gap:8px;min-width:0}
.id{font-family:var(--disp);font-weight:700;color:var(--acc);background:var(--acc-bg);border-radius:4px;text-align:center;align-self:start;padding:1px 0;font-size:.85rem;font-variant-numeric:tabular-nums}
.B .id{color:var(--warn);background:var(--warn-bg)}
.C .id{color:var(--mute);background:transparent;border:1px solid var(--line)}
.t{font-weight:600}
.w{color:var(--mute);font-size:.86rem}
.w b{font-weight:600;color:var(--fg)}
ul{margin:0;padding-left:1.1rem;color:var(--mute);font-size:.9rem;display:grid;gap:4px}
.done ul{color:var(--done)}
details summary{cursor:pointer;color:var(--mute);font-size:.9rem;margin:24px 0 8px}
code{font-size:.85em;background:var(--acc-bg);padding:0 4px;border-radius:3px}
.reply{margin-top:28px;padding:12px 14px;border:1px dashed var(--line);border-radius:6px;font-size:.88rem;color:var(--mute)}
</style>
"""
def inline(t):
    t = html.escape(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    return re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', t)
def table(body):
    rows=[r for r in body.strip().split('\n') if r.startswith('|')]
    cells=[[c.strip() for c in r.strip('|').split('|')] for r in rows[2:]]
    return cells
parts=[CSS, f'<h1>CORLY 未着手一覧</h1><p class="sub">更新 {html.escape(upd)}。正本は <code>company/09_backlog.md</code>。終わったら朝の1通に「済 A3」と返信。</p>']
for sec in sections:
    title, _, body = sec.partition('\n')
    key = title.strip()[0]
    if key in 'ABC':
        cells = table(body)
        lab = {'A':'w','B':'w','C':'w'}[key]
        items=[]
        for c in cells:
            if len(c)<3: continue
            idc, t, why = c[0], c[1], c[2]
            extra = f' <b>{inline(c[3])}</b>' if len(c)>3 and key=='A' else ''
            head = {'A':'なぜ今: ','B':'選択肢: ','C':'待ち: '}[key]
            items.append(f'<li><span class="id">{html.escape(idc)}</span><div><div class="t">{inline(t)}</div><div class="w">{head}{inline(why)}{extra}</div></div></li>')
        parts.append(f'<section class="{key}"><h2>{inline(title)}<span class="n">{len(items)}件</span></h2><ol>{"".join(items)}</ol></section>')
    elif key=='D':
        lis=''.join(f'<li>{inline(l[2:])}</li>' for l in body.strip().split('\n') if l.startswith('- '))
        parts.append(f'<details><summary>{inline(title)}（開く）</summary><ul>{lis}</ul></details>')
    elif title.startswith('済'):
        lis=''.join(f'<li>{inline(l[2:])}</li>' for l in body.strip().split('\n') if l.startswith('- '))
        parts.append(f'<section class="done"><h2>{inline(title)}</h2><ul>{lis}</ul></section>')
parts.append('<div class="reply">返信の書き方: <b>済 A1</b>（終わった）／<b>所在地: … / 電話: … / メール: …</b>（A1の回答）／<b>承認 master所在地7件</b>（B1）／<b>SNS 案A 呼び名 原状回復の裏方</b>（A4）</div>')
out.write_text('\n'.join(parts), encoding='utf-8')
print(out, out.stat().st_size)
