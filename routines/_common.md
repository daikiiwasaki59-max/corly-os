# 全ルーティン共通の前提

## 0. リポジトリを最新にする（最初に必ず）
```
cd /home/user/corly-os 2>/dev/null || git clone https://github.com/daikiiwasaki59-max/corly-os /home/user/corly-os
cd /home/user/corly-os
git fetch origin claude/iwasaki-ai-agent-design-m9mngf
git checkout claude/iwasaki-ai-agent-design-m9mngf
git pull --ff-only origin claude/iwasaki-ai-agent-design-m9mngf
```
`main` に統合済みなら `main` を使う（`git branch -r` で確認）。

## 1. 読む順
`CLAUDE.md` → `company/00_charter.md` → `company/05_approval_policy.md` → 担当役職 `.claude/agents/<役職>.md` → 自分のルーティン `routines/<名前>.md`。

## 2. 正データの場所（優先順）
1. Google Sheets「CORLY OS」（ID: 後述）。Sheets ツールで `get_values` / `update_values` が使えるならこちら。
2. 使えない（Insufficient scope 等）なら **リポジトリの `data/` と `docs/research/*.csv`** に書き、`git commit` → `git push origin <branch>` する。
3. どちらに書いたかを `data/log.csv` に残す。

## 3. 絶対に守る
- 顧客への送信は **`data/approvals.csv` で 状態＝承認** のものだけ。承認なしで送らない。
- `company/00_contact.md` の所在地・電話・メールが未登録なら、営業メールは1通も送らない。下書きも「フッター待ち」として承認待ちに載せるだけ。
- 価格は `company/01_products.md` の価格表だけ。未登録は「未登録」。
- 連絡NG＝TRUE、配送業者の既存顧客には触れない。
- 実在企業・統計値を推測で書かない。数字は「実績値」か「仮置き」。
- 1回の実行で送るメールは最大5通（仮置き）。それ以上は翌日。

## 4. 岩崎への連絡
Gmail `send_message` で daikiiwasaki59@gmail.com 宛。件名は各ルーティンで固定。本文はプレーンテキスト、結論から。Markdown 記法は使わない。

## 5. 終わり方
`data/log.csv` に1行追記 → `git add -A && git commit -m "<役職>: <日付> <要約>" && git push`。
やることが無かった場合も1行残して終える（短く。無駄に調べない）。
