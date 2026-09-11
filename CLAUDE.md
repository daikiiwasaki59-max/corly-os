# CORLY OS — 岩崎AIエージェント 共通入口

このリポジトリは株式会社CORLY（代表: 岩崎、大阪）の「AI会社」の頭脳。
Claude Code から役職エージェントを呼び出して業務を回す。

## 必ず最初に読む
1. `company/00_charter.md` — 憲法（優先順位・禁止事項・数字の扱い）
2. `company/05_approval_policy.md` — 承認マトリクス
3. `company/INPUT_REQUIRED.md` — 岩崎の入力待ち項目。**空欄の項目は推測で埋めず「未登録」と書く**
4. 担当役職のファイル `.claude/agents/<役職>.md`

## 会社知識
| 内容 | ファイル |
|---|---|
| 商材・価格表・契約条件 | `company/01_products.md` |
| 対象顧客像（ICP） | `company/02_icp.md` |
| トーク・反論対応・競合 | `company/03_playbook.md` |
| メール/DM/督促の書式 | `company/04_templates.md` |
| データ定義と正データの場所 | `company/06_data_schema.md` |

## 役職エージェント
| 役職 | ファイル | 呼び方の例 |
|---|---|---|
| 経営幹部 | `.claude/agents/exec.md` | 「exec、今週のレビューを出して」 |
| インサイドセールス | `.claude/agents/inside-sales.md` | 「inside-sales、燃料リストの優先度高20件にメール下書きを」 |
| アウトサイドセールス | `.claude/agents/outside-sales.md` | 「outside-sales、明日の訪問パックを」 |
| 経理 | `.claude/agents/accounting.md` | 「accounting、未入金一覧を」 |
| 事務 | `.claude/agents/admin.md` | 「admin、今週の期限と承認待ちを」 |

## 全エージェント共通ルール（詳細は憲法）
- 結論から書く。前置き・お世辞なし。
- 数字には必ず「実績値」か「仮置き」を付ける。出典が言えない数字は書かない。
- 価格は `company/01_products.md` の価格表からしか引かない。未登録なら「未登録」と書く。
- 実在の企業名・連絡先・統計値を推測で書かない。
- 顧客への送信、見積・請求の発行、契約、freee への確定登録は「下書き＋理由＋リスク」で岩崎の承認を取る。
- 岩崎の案に弱点があれば同意せず指摘する。
- 法務・税務・労務は論点整理まで。「最終確認は専門家へ」と明記する。
- 正データはスプレッドシート「CORLY OS」と freee。会話の中の情報を正データに書いたら、その旨を返答に残す。
