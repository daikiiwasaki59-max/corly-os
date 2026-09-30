// 単一HTMLのプレビューを作る（Artifact 用）。全ページを1ファイルに束ね、ハッシュでページを切り替える。
// node scripts/build-preview.mjs <出力パス>
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const site = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site') + '/';
const outPath = process.argv[2] || 'corly-site-preview.html';
const PAGES = ['index', 'vacant', 'regular', 'store', 'company', 'contact', 'privacy', 'thanks'];
const mime = { png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };
const dataUri = (rel) => {
  const f = site + rel; const ext = rel.split('.').pop();
  return `data:${mime[ext]};base64,${fs.readFileSync(f).toString('base64')}`;
};
const cache = {};
const inlineImg = (html) => html.replace(/(src|href)="assets\/img\/([^"]+)"/g, (m, attr, file) => {
  cache[file] ||= dataUri('assets/img/' + file);
  return `${attr}="${cache[file]}"`;
});
let css = fs.readFileSync(site + 'assets/site.css', 'utf8');
css = css.replace(/url\("(assets\/img\/[^"]+)"\)/g, (m, rel) => `url("${dataUri(rel)}")`);
let js = fs.readFileSync(site + 'assets/site.js', 'utf8');

const mains = PAGES.map((p) => {
  const html = fs.readFileSync(site + p + '.html', 'utf8');
  const main = html.match(/<main>([\s\S]*?)<\/main>/)[1];
  return `<main data-page="${p}"${p === 'index' ? '' : ' hidden'}>${inlineImg(main)}</main>`;
}).join('\n');
const first = fs.readFileSync(site + 'index.html', 'utf8');
const header = inlineImg(first.match(/<header[\s\S]*?<\/header>/)[0]);
const footer = inlineImg(first.match(/<footer[\s\S]*?<\/footer>/)[0]);

const router = `
(function(){
  var pages = document.querySelectorAll('main[data-page]');
  function show(){
    var id = (location.hash || '#index').slice(1).replace(/\\.html$/, '') || 'index';
    if (!document.querySelector('main[data-page="' + id + '"]')) id = 'index';
    pages.forEach(function(m){ m.hidden = m.dataset.page !== id; });
    document.querySelectorAll('.nav a, .fnav a').forEach(function(a){
      var t = (a.getAttribute('href') || '').replace(/^#/, '');
      if (a.classList.contains('btn')) return;
      if (t === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
    document.querySelectorAll('.rv, .rv-pic, .flow').forEach(function(el){ if (!el.closest('main[hidden]')) el.classList.add('in'); });
    var h = document.querySelector('.hero'); if (h) h.classList.add('in');
    document.dispatchEvent(new Event('corly:page'));
  }
  window.addEventListener('hashchange', show);
  show();
})();`;

let out = `<title>CORLY corly.co.jp v4</title>
<style>${css}
main[hidden]{display:none}
.preview-note{position:fixed;left:12px;bottom:12px;z-index:70;background:#0E1216;color:#fff;font:12px/1.5 system-ui,sans-serif;padding:8px 12px;border-radius:2px;opacity:.85;letter-spacing:.04em}
</style>
${header}
${mains}
${footer}
<div class="preview-note">PREVIEW — 写真は仮（AI生成）。本番未公開</div>
<script>${js}</script>
<script>${router}</script>`;
// リンクをハッシュに置換（フォームの action は無効化）
out = out.replace(/href="(index|vacant|regular|store|company|contact|privacy|thanks)\.html(#[^"]*)?"/g, 'href="#$1"');
out = out.replace(/action="contact\.php"/g, 'action="#thanks"');
fs.writeFileSync(outPath, out);
console.log('preview:', outPath, Math.round(out.length / 1024) + 'KB');
