# data/ — 正データの一時置き場

Google Sheets の書き込み権限が直るまで、夜間部隊はここに書く。直ったらスプレッドシート「CORLY OS」へ切り替える。
- `approvals.csv` 承認待ち（朝の1通に載せ、岩崎がメール返信で承認）
- `log.csv` 運用ログ（部隊が何をしたか）
- `activities.csv` 活動（岩崎の一言メモを夜が解釈して追記。元メモを必ず残す）
- `daily.csv` 日報（岩崎の `日報 …` 行があればそれ、無ければ活動から集計）
- `calllists/YYYY-MM-DD.csv` 翌日のコールリスト（夜が作る。朝はそのまま載せる）
- `drafts/` フォロー・返信の下書き本文
- 取引先の正データ: `docs/research/pm-list-osaka-master.csv`（管理会社）と `docs/research/fuel-prospects-osaka-hanshin.csv`（燃料）。ステージ・最終接触日はここを更新する。
