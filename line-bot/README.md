# CORLY LINE自動返信ボット（Phase 1）

公式LINE(Messaging API) → Cloudflare Workers → Claude API。

## 動作
- 既定は **DRAFT**：AIが返信案を作り、岩崎さんのLINEに通知 → 「OK <ID>」で顧客へ送信 / 「NG <ID>」で破棄。
- 見積・金額・契約・クレーム等（`src/knowledge.js` の ESCALATE_WORDS）はAIが答えず、岩崎さんに通知。
- 1日のAI生成回数に上限あり（`DAILY_LIMIT`、仮置き）。
- `src/knowledge.js` の（未記入）を埋めるまで、AIは「担当者が確認して連絡」としか答えない。

## セットアップ
1. LINE Developers で公式アカウントの Messaging API を有効化し、Channel secret / Channel access token を取得
2. `npm i -g wrangler` 後、`npx wrangler kv namespace create STATE` → id を wrangler.toml に記入
3. シークレット登録（wrangler.toml 末尾参照）。OWNER_USER_ID は岩崎さん自身のLINE userId
4. `npx wrangler deploy` → 発行URLを LINE Developers の Webhook URL に設定、「Webhookの利用」をON
5. LINE公式アカウント側の「応答メッセージ」設定は、二重返信を避けるためOFF

## 注意（要確認）
- 顧客の文面を外部AI(Anthropic)へ送信します。個人情報保護法上の利用目的明示・プライバシーポリシー記載は、専門家に確認してください。
- 返信はpush送信を使うため、LINE公式アカウントの月間メッセージ数の上限に計上される可能性があります。プランの上限は LINE 公式で確認してください。
- AUTOモードは、DRAFTで十分な期間運用して誤回答がないことを確認してから。
