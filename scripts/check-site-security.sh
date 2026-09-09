#!/usr/bin/env bash
# corly.co.jp 公開後のセキュリティ確認スクリプト（あなたのPC / GitHub Actions から実行）
# 使い方: bash scripts/check-site-security.sh [https://corly.co.jp]
set -u
BASE="${1:-https://corly.co.jp}"
ok=0; ng=0
pass(){ echo "  [OK] $1"; ok=$((ok+1)); }
fail(){ echo "  [NG] $1"; ng=$((ng+1)); }
code(){ curl -s -o /dev/null -m 20 -w "%{http_code}" "$1"; }
hdr(){ curl -s -I -m 20 "$1" | tr -d '\r' | grep -i "^$2:" | head -1; }

echo "== 1. HTTPS / リダイレクト"
c=$(curl -s -o /dev/null -m 20 -w "%{http_code} %{redirect_url}" "http://corly.co.jp/"); [[ "$c" == 301\ https://corly.co.jp/* ]] && pass "http → https 301" || fail "http → https ($c)"
c=$(curl -s -o /dev/null -m 20 -w "%{http_code} %{redirect_url}" "https://www.corly.co.jp/"); [[ "$c" == 301\ https://corly.co.jp/* ]] && pass "www → なし 301" || fail "www 統一 ($c)"

echo "== 2. セキュリティヘッダ"
for h in "Strict-Transport-Security" "Content-Security-Policy" "X-Content-Type-Options" "X-Frame-Options" "Referrer-Policy" "Permissions-Policy"; do
  v=$(hdr "$BASE/" "$h"); [[ -n "$v" ]] && pass "$v" || fail "$h なし"
done
v=$(hdr "$BASE/" "X-Powered-By"); [[ -z "$v" ]] && pass "X-Powered-By 非表示" || fail "$v"

echo "== 3. WordPress 残骸・改ざんURLが消えているか（200 が出たら危険）"
for p in "/wp-login.php" "/wp-admin/" "/xmlrpc.php" "/wp-content/" "/wp-includes/" "/wp-json/" "/quality/c99183725" "/original/c99469378" "/kuuki-osama/" "/wp-config.php" "/.git/HEAD" "/.env" "/readme.html" "/license.txt"; do
  c=$(code "$BASE$p"); if [[ "$c" == "200" ]]; then fail "$p → 200（残っている）"; else pass "$p → $c"; fi
done

echo "== 4. PHP実行制限"
c=$(code "$BASE/assets/site.css"); [[ "$c" == "200" ]] && pass "assets/site.css 200" || fail "assets/site.css $c"
c=$(code "$BASE/index.php"); [[ "$c" != "200" ]] && pass "index.php → $c（拒否）" || fail "index.php が 200"
c=$(curl -s -o /dev/null -m 20 -w "%{http_code}" "$BASE/contact.php"); [[ "$c" == "303" || "$c" == "302" ]] && pass "contact.php GET → $c（フォームへ戻す）" || fail "contact.php GET → $c"

echo "== 5. 不正ページの痕跡（トップHTML内）"
body=$(curl -s -m 20 "$BASE/")
if echo "$body" | grep -qiE "ミニ四駆|シマノ|SHIMANO|ミニカー|楽天|Amazon|casino|カジノ|viagra|replica"; then fail "トップHTMLに物販/スパム語が含まれる"; else pass "トップHTMLにスパム語なし"; fi
echo "$body" | grep -qi "wp-content" && fail "トップHTMLに wp-content 参照が残っている" || pass "wp-content 参照なし"

echo "== 6. その他"
c=$(code "$BASE/robots.txt"); [[ "$c" == "200" ]] && pass "robots.txt" || fail "robots.txt $c"
c=$(code "$BASE/sitemap.xml"); [[ "$c" == "200" ]] && pass "sitemap.xml" || fail "sitemap.xml $c"
c=$(code "$BASE/.well-known/security.txt"); [[ "$c" == "200" ]] && pass "security.txt" || fail "security.txt $c"
c=$(code "$BASE/.htaccess"); [[ "$c" != "200" ]] && pass ".htaccess 非公開 ($c)" || fail ".htaccess が読める"

echo; echo "結果: OK $ok / NG $ng"
[[ $ng -eq 0 ]]
