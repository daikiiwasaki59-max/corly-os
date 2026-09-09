# 写真の入れ方

写真を反映する方法は2つあります。どちらも併用できます。

## 方法A: 自動取得（Pexels / Pixabay の無料APIキー）

**1回だけの準備:**
1. https://www.pexels.com/api/ を開き、無料登録してAPIキーを発行する（クレジットカード不要）。
   Pixabayも使いたい場合は https://pixabay.com/api/docs/ で同様にキーを発行する（要アカウント登録）。
   どちらか一方だけでも動く。
2. GitHubのこのリポジトリ → **Settings → Secrets and variables → Actions → New repository secret**
   - 名前 `PEXELS_API_KEY`、値にキーを貼り付けて保存
   - Pixabayも使うなら `PIXABAY_API_KEY` も同様に追加
   - **キーの値はチャット（Claudeとの会話）には貼らないこと。** GitHubの画面で直接入力する。
3. GitHubの **Actions タブ → "Fetch stock photos (Pexels / Pixabay)" → Run workflow** を押す。

数十秒で `site/assets/img/ph-*.jpg` が更新され、ページも自動で再生成される。
**自動取得した写真は必ず目視確認してから本番反映すること**（無関係・不適切な写真が混ざることがある。
`CREDITS.md` に取得元と判定結果を記録する）。

## 方法B: 手動でこのフォルダに置く

このフォルダに写真を置いて `python3 scripts/import-photos.py` を実行すると、
サイズ調整・圧縮のうえ `site/assets/img/ph-*.jpg` に変換され、ページ再生成で自動的に使われる。

### ファイル名（この名前で置く。拡張子は jpg / jpeg / png / webp どれでも可）

| ファイル名 | 使われる場所 | 推奨する写真 |
|---|---|---|
| hero    | トップのメイン | 清掃作業中のスタッフ、または清掃後の明るい室内（横長） |
| vacant  | 空室清掃（カード・ページ） | 清掃後の空室、キッチン、浴室 |
| regular | 日常・定期清掃 | エントランス、共用部、床洗浄 |
| store   | 店舗・飲食店清掃 | 厨房、グリストラップ、客席 |
| report  | トップ「作業は、写真で報告します」 | 報告書の実物 |
| work1〜work4 | トップ「施工写真」 | 作業前後 |
| office  | 会社概要 | 事務所外観 |
| staff   | 予備 | スタッフ |

例: `photos-inbox/hero.jpg`, `photos-inbox/work1.png`

GitHubのブラウザ画面で `photos-inbox` を開き「Add file → Upload files」でドラッグ＆ドロップできる。
写真AC・イラストAC・Unsplashなど、ログイン済みのサイトから落とした写真を置いてもよい。
