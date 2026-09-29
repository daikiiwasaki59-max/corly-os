import { KNOWLEDGE, ESCALATE_WORDS } from "./knowledge.js";

const LINE_API = "https://api.line.me/v2/bot/message";

export default {
  async fetch(req, env, ctx) {
    if (req.method !== "POST") return new Response("ok");
    const body = await req.text();
    if (!(await verifySignature(body, req.headers.get("x-line-signature"), env.LINE_CHANNEL_SECRET))) {
      return new Response("invalid signature", { status: 401 });
    }
    const { events = [] } = JSON.parse(body);
    // LINEには即200を返し、処理は裏で続ける
    ctx.waitUntil(Promise.all(events.map((e) => handleEvent(e, env).catch((err) => console.error(err)))));
    return new Response("ok");
  },
};

async function verifySignature(body, signature, secret) {
  if (!signature || !secret) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return expected === signature;
}

async function handleEvent(event, env) {
  if (event.type !== "message" || event.message.type !== "text") return;
  const userId = event.source.userId;
  const text = event.message.text.trim();

  // 岩崎さん本人からの操作コマンド: 「OK abc123」「NG abc123」
  if (userId === env.OWNER_USER_ID) return handleOwnerCommand(text, event, env);

  // 見積・契約・クレーム等はAIに答えさせず、岩崎さんへ通知
  if (ESCALATE_WORDS.some((w) => text.includes(w))) {
    await push(env, env.OWNER_USER_ID, `【要対応】自動返信せず保留\n顧客ID: ${userId}\n内容: ${text}`);
    await reply(env, event.replyToken, "お問い合わせありがとうございます。内容を確認のうえ、担当者よりご連絡いたします。");
    return;
  }

  if (!(await underDailyLimit(env))) {
    await push(env, env.OWNER_USER_ID, `【上限到達】本日のAI返信上限に達したため保留\n顧客ID: ${userId}\n内容: ${text}`);
    return;
  }

  const answer = await askClaude(env, text);

  if (env.MODE === "AUTO") {
    await reply(env, event.replyToken, answer);
    return;
  }

  // DRAFTモード: 下書きを保存し、岩崎さんに承認依頼
  const id = crypto.randomUUID().slice(0, 6);
  await env.STATE.put(`draft:${id}`, JSON.stringify({ userId, answer }), { expirationTtl: 60 * 60 * 24 });
  await push(env, env.OWNER_USER_ID, `【下書き ${id}】\n顧客の質問: ${text}\n\n返信案:\n${answer}\n\n送る→「OK ${id}」／破棄→「NG ${id}」`);
}

async function handleOwnerCommand(text, event, env) {
  const m = text.match(/^(OK|NG)\s+(\w+)$/i);
  if (!m) return reply(env, event.replyToken, "コマンド: 「OK <ID>」で送信、「NG <ID>」で破棄");
  const [, cmd, id] = m;
  const raw = await env.STATE.get(`draft:${id}`);
  if (!raw) return reply(env, event.replyToken, `下書き ${id} は見つからないか、期限切れです。`);
  const { userId, answer } = JSON.parse(raw);
  await env.STATE.delete(`draft:${id}`);
  if (cmd.toUpperCase() === "OK") {
    await push(env, userId, answer);
    await reply(env, event.replyToken, `${id} を送信しました。`);
  } else {
    await reply(env, event.replyToken, `${id} を破棄しました。`);
  }
}

async function underDailyLimit(env) {
  const day = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10); // JST
  const key = `count:${day}`;
  const n = parseInt((await env.STATE.get(key)) || "0", 10);
  if (n >= parseInt(env.DAILY_LIMIT, 10)) return false;
  await env.STATE.put(key, String(n + 1), { expirationTtl: 60 * 60 * 48 });
  return true;
}

async function askClaude(env, question) {
  const system = `あなたは株式会社CORLYの問い合わせ対応担当です。
以下の【情報】に書かれている内容だけを根拠に、丁寧で簡潔な日本語で返信してください。
- 【情報】にない事項、（未記入）の事項は推測せず「担当者が確認してご連絡します」と答える。
- 金額・納期・契約条件を約束しない。
- 返信本文のみを出力する。

【情報】${KNOWLEDGE}`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.CLAUDE_MODEL, max_tokens: 600, system, messages: [{ role: "user", content: question }] }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  return data.content.filter((c) => c.type === "text").map((c) => c.text).join("").slice(0, 4500);
}

const headers = (env) => ({ "content-type": "application/json", authorization: `Bearer ${env.LINE_CHANNEL_TOKEN}` });

async function reply(env, replyToken, text) {
  await fetch(`${LINE_API}/reply`, { method: "POST", headers: headers(env), body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }) });
}
async function push(env, to, text) {
  await fetch(`${LINE_API}/push`, { method: "POST", headers: headers(env), body: JSON.stringify({ to, messages: [{ type: "text", text }] }) });
}
