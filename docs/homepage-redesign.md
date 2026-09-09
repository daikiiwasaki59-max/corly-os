# corly.co.jp リニューアル — 設計・デプロイ・セキュリティ

作成日: 2026-09-08　対象: `site/` ディレクトリ一式

## 1. 結論

- 新サイトは **WordPress を使わない静的HTML**（`site/`）。問い合わせフォームだけ `contact.php` 1ファイルで処理する。
- 現行サイト（WordPress と推定）は **検索エンジンに不正ページが登録されている疑い**がある（後述 §5）。デザイン差し替えだけでなく、旧ファイルの完全削除とパスワード変更をセットで行う。
- Xserver へのアップロードは **手動（ファイルマネージャ/FTP）** か **GitHub Actions（Secrets に FTP 情報を保存）** のどちらか。パスワードをチャットや Issue に書かない。

## 2. サイトに載せた事実と出典

| 項目 | 掲載内容 | 区分 | 出典 |
|---|---|---|---|
| 社名 | 株式会社CORLY（コーリー） | 実績値 | corly.co.jp/company（検索スニペット） |
| 代表取締役 | 岩崎 大樹 | 実績値 | 同上 |
| 設立 | 2024年10月 | 実績値 | 同上、gBizINFO |
| 所在地 | 〒541-0053 大阪市中央区本町2-3-4 アソルティ本町4F | 実績値 | 同上 |
| TEL / FAX / MAIL | 06-4256-2693 / 06-4560-9079 / info@corly.co.jp | 実績値 | 同上 |
| 法人番号 | 7120001269368 | 実績値 | gBizINFO |
| 有資格者 | JIS品質管理責任者・掃除能力検定士 在籍 | 実績値 | corly.co.jp/cleaning |
| 対応エリア | 大阪・兵庫・京都・奈良・滋賀・和歌山（他は応相談） | 実績値 | corly.co.jp/cleaning |
| 清掃不満 92%減 | 定期清掃導入企業の満足度調査 | 現行サイト掲載値 | corly.co.jp/case-studies |
| マップ表示回数 2.4倍（3ヶ月） | 歯科医院 MEO | 現行サイト掲載値 | corly.co.jp/case-studies |
| 建設業 HP刷新（補助金活用） | 数値なし | 現行サイト掲載値 | corly.co.jp/case-studies |
| 清掃4区分の説明文 | 空室 / 日常・定期 / 店舗・飲食店 / 官公庁・公共施設 | 現行サイトの記述を要約 + 一般的な作業内容で補足（**補足部分は仮置き**） | corly.co.jp/cleaning, /service |
| 「代表が直接担当」 | Why CORLY | 仮置き | CORLY OS 内の自社強み記述（App.jsx）を元に作文 |
| ご相談〜報告の4ステップ | Flow | **仮置き** | 一般的な流れ。現行サイトに記載なし |
| プライバシーポリシー | privacy.html | **仮置き（雛形）** | 現行 corly.co.jp/privacy-policy/ の文面に差し替えること |
| 営業時間 | 未掲載 | — | 出典が取れないため書いていない |

この環境からは corly.co.jp に直接アクセスできなかった（ネットワーク制限）。事実は検索エンジンのスニペットから拾っているため、**公開前に本人確認必須**。

## 3. デザイン方針（第3版・2026-09-09）

- 参照構成: 庄栄興産株式会社のサイト（bigpengold.com）と同じ「トップ／サービス別ページ／会社概要／お問い合わせ／プライバシーポリシー」の一般的な企業サイト型。
- 白ベース。文字は黒、アクセントにロゴの水色 `#5CE1E6`（ボタン・下線）と、文字用の濃い水色 `#0FA3A8`。
- フォントは Noto Sans JP のみ。派手な演出なし（スクロール時の軽いフェードのみ）。
- 掲載は清掃事業のみ: 空室清掃 / 日常・定期清掃 / 店舗・飲食店清掃（グリストラップ）。
- 写真は全てグレーの仮枠（SVG）。同名の JPG に差し替えれば反映される（§4-2）。

## 4. ファイル構成

```
site/
  index.html      トップ（サービス3枚・選ばれる理由・報告書・施工写真・エリア・流れ・会社概要抜粋・CTA）
  vacant.html     空室清掃
  regular.html    日常・定期清掃
  store.html      店舗・飲食店清掃
  company.html    会社概要（代表メッセージ・概要表）
  contact.html    お問い合わせ（フォーム）
  privacy.html    プライバシーポリシー（雛形・要差し替え）
  thanks.html     送信完了
  contact.php     フォーム受信 → info@corly.co.jp
  .htaccess / robots.txt / sitemap.xml
  assets/site.css, site.js
  assets/img/     logo-color.png, logo-white.png, logo-symbol.png, favicon.png, ph-*.svg（仮写真）
scripts/build-site-pages.mjs   8ページを共通ヘッダー/フッターから生成するスクリプト（node scripts/build-site-pages.mjs）
```

### 4-1. 文言を直すとき
`scripts/build-site-pages.mjs` を編集して `node scripts/build-site-pages.mjs` を実行すると `site/*.html` が再生成される。HTML を直接編集してもよいが、その場合はスクリプト側と二重管理になる。

### 4-2. 写真の差し替え
| ファイル | 場所 | 推奨 |
|---|---|---|
| ph-hero | トップのメイン | 清掃作業中のスタッフ、または清掃後の明るい室内（横長 16:9） |
| ph-vacant / ph-regular / ph-store | サービスカード・各ページ | 各サービスの現場（4:3） |
| ph-report | トップ「作業は、写真で報告します」 | 報告書の実物 |
| ph-work1〜4 | トップ「施工写真」 | 作業前後（4:3） |
| ph-staff | 未使用（予備） | スタッフ写真 |
| ph-office | 会社概要 | 事務所外観 |

差し替え手順: 同じ名前の `.jpg` を `assets/img/` に置き、HTML 内の `ph-xxx.svg` を `ph-xxx.jpg` に置換（スクリプト内を置換して再生成）。写真は Google ドライブの `HP写真` フォルダに入れてもらえれば、こちらで取り込める。

## 5. セキュリティ（2026-09-09 更新）

### 5-0. 先に結論
- 「完全防御」は存在しない。できるのは **攻撃面を最小にし、侵入されても被害を限定し、異常にすぐ気づく** の3点。以下はその全部。
- パスワードは変更済み（本人申告）。残りは **A. サーバー側（あなたがXserverパネルで行う）** と **B. ファイル側（このリポジトリで対応済み）** に分かれる。

### 5-1. 現行サイトの改ざん疑い（再掲）
検索結果に corly.co.jp 配下の物販ページ（ミニ四駆・釣具・ミニカー）が登録されている。WordPress改ざんの典型症状。直接確認はできていないため「疑い」。

### 5-2. A. サーバー側チェックリスト（Xserverサーバーパネル）
順番どおりに。所要 1〜2時間。

| # | 作業 | 場所 | 状態 |
|---|---|---|---|
| 1 | サーバーパネルの **二段階認証** を有効化 | Xserverアカウント → セキュリティ設定 | 要実施 |
| 2 | **バックアップ取得**: `corly.co.jp/public_html` 全体と MySQL を手元に保存（証拠・復元用） | ファイルマネージャ / phpMyAdmin | 要実施 |
| 3 | `public_html` の中身を **全部削除**（wp-admin, wp-content, wp-includes, wp-config.php, xmlrpc.php, 見覚えのない quality/ original/ 等、旧 .htaccess も） | ファイルマネージャ | 要実施 |
| 4 | WordPress用の **MySQLデータベースを削除**、DBユーザーも削除 | MySQL設定 | 要実施 |
| 5 | **FTPアカウント**: 不要なサブアカウントを削除。残すものは「FTP制限設定」で **接続元IPを自宅/事務所に限定** | FTPアカウント設定 | 要実施 |
| 6 | **WAF設定** を全項目 ON（XSS / SQL / ファイル / メール / コマンド / PHP） | WAF設定 | 要実施 |
| 7 | **SSH** を使わないなら OFF | SSH設定 | 要実施 |
| 8 | **無料SSL** が有効か確認、「Web改ざん検知」があれば ON | SSL設定 | 要実施 |
| 9 | **メール**: `info@corly.co.jp` の受信確認。`noreply@corly.co.jp` を作成。**DKIM署名 ON、DMARC を p=quarantine で設定**（なりすまし送信対策） | メールアカウント / DKIM設定 / DNS設定 | 要実施 |
| 10 | **PHPバージョン** を最新の推奨版に | PHP Ver.切替 | 要実施 |
| 11 | 新サイトを `site/` から `public_html/` にアップロード（`.htaccess` `.well-known` を含む。隠しファイル表示ON） | ファイルマネージャ | 要実施 |
| 12 | `public_html` の一つ上に `contact-ratelimit` ディレクトリを作成（権限 700） | ファイルマネージャ | 要実施 |
| 13 | **Google Search Console**: プロパティ確認 → 「削除」で `quality/` `original/` のURLを申請 → `sitemap.xml` 送信 → 「セキュリティの問題」タブを確認 | Search Console | 要実施 |
| 14 | **ドメイン管理側**（Xserverドメイン等）も二段階認証、WHOIS代理公開 | ドメイン管理 | 要実施 |
| 15 | `bash scripts/check-site-security.sh` を実行し NG が 0 になることを確認 | あなたのPC | 要実施 |

### 5-3. B. ファイル側（このリポジトリで対応済み）
| 対策 | 内容 |
|---|---|
| CMSなし | WordPressを廃止。管理画面・DB・プラグインが存在しないので、それらを狙う攻撃は成立しない |
| PHP実行制限 | `.htaccess` で `contact.php` 以外のPHPを全拒否。`image.jpg.php` のような偽装名も拒否。`assets/` は静的ファイル以外を返さない |
| 隠し・設定ファイル拒否 | `.env` `.git` `.bak` `.sql` `.log` `.json` `.md` など |
| HTTPメソッド制限 | GET / POST / HEAD 以外を拒否 |
| HTTPS強制 + HSTS | 1年、サブドメイン含む |
| CSP | `default-src 'none'`。自サイトと Google Fonts 以外から何も読まない。改ざんでスクリプトを差し込まれても外部へ通信できない |
| その他ヘッダ | nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP/CORP |
| 旧URL | WordPress固有パスと改ざんURLに 410 Gone（検索から消える）|
| フォーム | 同一オリジン検査（Origin/Referer + Sec-Fetch-Site）、Content-Type検査、ハニーポット、最短入力時間、IP別レート制限（5回/時）、ヘッダインジェクション防止、文字数制限、noindex |
| security.txt | `/.well-known/security.txt` に脆弱性報告先を明記 |
| 監視 | GitHub Actions が毎週月曜7時に本番サイトを点検（ヘッダ、WP残骸、改ざんURL、スパム語）。NG があればGitHubから通知メール |
| 情報露出 | ServerSignature Off, X-Powered-By 削除, ディレクトリ一覧禁止 |

### 5-4. 残るリスク（正直に）
| リスク | 対処 |
|---|---|
| FTPパスワード漏えい（PC側のマルウェア等） | FTP IP制限（A-5）が効く。PC側のウイルス対策も |
| Xserverアカウント自体の乗っ取り | 二段階認証（A-1）。パスワードは他サービスと使い回さない |
| Xserver側の脆弱性 | 利用者側で対処不能。バックアップ（リポジトリがそのままバックアップ）で復旧 |
| フォームスパム | 対策済みだが完全ではない。多ければ Cloudflare Turnstile 追加 |
| メール（`info@`）のなりすまし | DKIM/DMARC（A-9）で受信側が弾ける |
| Google Fonts への依存 | 外部読み込みはこれのみ。切りたければフォントを同梱に変更可 |

## 6. デプロイ手順

### A. 手動（推奨・最初の1回）
1. Xserver サーバーパネル → ファイルマネージャ → `corly.co.jp/public_html`。
2. §5-2 の手順で旧ファイルを退避・削除。
3. `site/` の中身を `public_html/` 直下にアップロード（`.htaccess` も含む。隠しファイル表示を ON）。
4. サーバーパネル → 「SSL設定」で無料SSLが有効であることを確認。
5. `https://corly.co.jp/` を開き、フォームをテスト送信 → `info@corly.co.jp` に届くか確認。

### B. GitHub Actions（2回目以降）
1. Xserver で **サブFTPアカウント**を作り、アクセス先を `corly.co.jp/public_html` に限定。
2. GitHub → Settings → Secrets → Actions に `XSERVER_FTP_HOST` `XSERVER_FTP_USER` `XSERVER_FTP_PASSWORD` `XSERVER_FTP_DIR` を登録。
3. Actions タブ → 「Deploy corly.co.jp to Xserver」→ Run workflow。

## 7. 公開前に本人確認が必要な項目
1. 清掃4区分の作業内容の記述（「営業時間外の対応」「床洗浄・ワックス」など）は実際に提供しているか。
2. 「相談〜報告」4ステップは実際の流れと合っているか。
3. プライバシーポリシーの本文差し替え。
4. 現行サイトの title に「大阪市北区」とあるが所在地は中央区。移転履歴があるなら会社概要に追記。
5. 実績値（92%減、2.4倍）を引き続き掲載してよいか（顧客の同意状況）。
6. 現場写真・代表写真があれば差し替え位置を用意する。
