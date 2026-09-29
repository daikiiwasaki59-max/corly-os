# 朝の1通（admin）— 毎日 6:30 JST

役職: `.claude/agents/admin.md`。共通前提: `routines/_common.md`。

## 目的
岩崎が1日1回このメールを見れば会社が回る状態にする。返信が承認になる。

## 手順
1. `routines/_common.md` §0 でリポジトリを最新にする。
2. 読む
   - `data/approvals.csv`: 状態＝待ち の行
   - `docs/research/pm-list-osaka-master.csv` と `fuel-prospects-osaka-hanshin.csv`: 次アクション期限 ≤ 今日 の行（あれば）
   - Google Calendar: 今日の予定（`list_events`）
   - Gmail: `newer_than:1d -from:daikiiwasaki59@gmail.com -in:draft` の未読を取り、取引先の URL ドメインと差出人ドメインが一致するものだけ「返信あり」として拾う
   - `data/log.csv`: 昨夜の inside-sales の行
   - `company/00_contact.md`: 所在地・電話・メールが登録済みか
3. 書く（Gmail `send_message`、宛先 daikiiwasaki59@gmail.com）
   - 件名: `【朝の1通】YYYY-MM-DD`
   - 本文の型（この順。該当なしの節は1行で「なし」）:
     ```
     承認待ち N件
       A0001 [役職/行為] 宛先名 — 内容の要約（1行）
       ...
     今日の期限
       ...
     今日の予定
       ...
     昨夜の部隊
       inside-sales: 送信 n / 返信 n / 下書き n
     返信あり（要対応）
       ...
     栓になっていること
       （例: 会社の所在地・電話・メールが未登録。返信で「所在地: / 電話: / メール:」の3行を送れば夜に転記します）
     返信の書き方
       承認 A0001 A0003
       修正 A0002 〇〇に直して
       却下 A0004
     ```
   - 数字は実績値のみ。推測しない。
4. `data/log.csv` に1行追記し、commit / push。

## やらない
- 顧客へ送らない。承認待ちを承認しない。会社知識を書き換えない。
