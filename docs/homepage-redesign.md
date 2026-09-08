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
| サービス6区分の説明文 | 清掃 / 空気の王様 / 集客支援 / 健康経営 / 入札案件 / コスト最適化 | 現行サイトの記述を要約 | corly.co.jp/service, /project, /kuuki-osama |
| 「コスト最適化（電気・燃料）」の文言 | 燃料販売仲介を「燃料・油の仕入れ見直し」「供給事業者のご紹介」と表現 | **仮置き** | 現行サイトの「電気・油代のコスト削減支援」を元に作文。要確認 |
| 「代表が直接担当」 | Why CORLY | 仮置き | CORLY OS 内の自社強み記述（App.jsx）を元に作文 |
| ご相談〜報告の4ステップ | Flow | **仮置き** | 一般的な流れ。現行サイトに記載なし |
| プライバシーポリシー | privacy.html | **仮置き（雛形）** | 現行 corly.co.jp/privacy-policy/ の文面に差し替えること |
| 営業時間 | 未掲載 | — | 出典が取れないため書いていない |

この環境からは corly.co.jp に直接アクセスできなかった（ネットワーク制限）。事実は検索エンジンのスニペットから拾っているため、**公開前に本人確認必須**。

## 3. デザイン方針

- CORLY OS と同じ黒 `#07090F` × ゴールド `#F0B429`。社内ツールと対外サイトでブランドを揃える。
- 見出しは明朝体（Shippori Mincho B1）、本文は Noto Sans JP、数値・ラベルは IBM Plex Mono。
- 「作業報告書」をモチーフにした罫線グリッド、縦書きのアクセント、サービスは台帳形式の行。写真は使わない（素材がないため。実際の現場写真が用意できれば差し替え推奨）。
- 1ページ構成 + プライバシーポリシー + 送信完了ページ。ページを増やすほど管理が増えるので最小限。

## 4. ファイル構成

```
site/
  index.html        トップ（全セクション）
  privacy.html      プライバシーポリシー（雛形・要差し替え）
  thanks.html       送信完了
  contact.php       フォーム受信 → info@corly.co.jp へメール
  .htaccess         HTTPS強制 / 旧URL転送 / セキュリティヘッダ / PHP実行制限
  robots.txt, sitemap.xml
  assets/site.css, site.js, favicon.svg
.github/workflows/deploy-site.yml   手動実行の FTPS デプロイ
```

## 5. セキュリティ所見（重要）

### 5-1. 現行サイトの改ざん疑い
検索結果に、corly.co.jp 配下として次のようなページが登録されている（2026-09-08 時点）。

- `www.corly.co.jp/quality/c99183725` — 「ミニ四駆 パーツ等まとめて」
- `www.corly.co.jp/original/c99469378` — 「SHIMANO スピニングリール」
- `corly.co.jp/kuuki-osama/` — タイトルが「ヤマト運輸 トラック ミニカー…」に置き換わっている

清掃会社のサイトに物販ページが存在する理由はないため、**WordPress の改ざん（日本語キーワードハック）**の典型症状と判断する。直接確認はできていないので「疑い」扱い。

影響: 検索順位の低下、Google の「ハッキングされたサイト」警告、閲覧者のフィッシング誘導、取引先からの信用毀損。

### 5-2. 対応手順（この順で）
1. **Xserver のパスワードを全部変える**: サーバーパネル、FTP、WordPress管理者、MySQL。Xserver の 2段階認証を有効化。
2. **バックアップ取得**: 現行 `public_html` と DB を丸ごとダウンロードして保管（証拠・復元用）。
3. **public_html を空にしてから新サイトを配置**: `wp-admin` `wp-content` `wp-includes` `wp-config.php` `xmlrpc.php` と、見覚えのないディレクトリ（`quality/`, `original/` など）を残さない。旧 `.htaccess` も使い回さない。
4. WordPress を使わないなら **MySQL データベースを削除**（バックアップ後）。
5. **Google Search Console** で、不正URLを「削除ツール」で申請し、`sitemap.xml` を再送信。`.htaccess` は不正URLに 410 を返すようにしてある。
6. Xserver の **WAF を ON**、**FTP接続制限（IP制限）を ON**（GitHub Actions を使う時だけ一時解除）。
7. `info@corly.co.jp` の受信設定を確認（フォームの送信先）。

### 5-3. 新サイト側の対策
- `contact.php`: 同一オリジン検査、ハニーポット、最短入力時間、IP別レート制限（5回/時）、メールヘッダインジェクション防止、文字数制限。
- `.htaccess`: `contact.php` 以外の PHP 実行を拒否（不正アップロードされても動かない）、ディレクトリ一覧禁止、CSP / X-Frame-Options / nosniff / Referrer-Policy。
- 外部読み込みは Google Fonts のみ。jQuery 等のライブラリなし。
- HSTS はコメントアウト。HTTPS が安定してから有効化する。

### 5-4. 残るリスク
- `contact.php` の送信元 `noreply@corly.co.jp` は Xserver 側でメールアドレスとして作成しておくと届きやすい（SPF は Xserver 既定で通る）。未作成でも送信自体は可能なことが多いが、迷惑メール判定される可能性がある。
- 外部の CAPTCHA は入れていない（外部サービス依存を避けた）。スパムが多ければ Cloudflare Turnstile 追加を検討。
- 静的サイトなので更新は HTML 編集になる。文言変更は `index.html` を直接編集し、再アップロード。

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
1. 燃料販売仲介の表現（「コスト最適化」の文言）は合っているか。正式なサービス名・対象顧客・仕組み。
2. 「相談〜報告」4ステップは実際の流れと合っているか。
3. プライバシーポリシーの本文差し替え。
4. 現行サイトの title に「大阪市北区」とあるが所在地は中央区。移転履歴があるなら会社概要に追記。
5. 実績値（92%減、2.4倍）を引き続き掲載してよいか（顧客の同意状況）。
6. 現場写真・代表写真があれば差し替え位置を用意する。
