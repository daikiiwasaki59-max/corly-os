// ── デモデータ ──────────────────────────────────────────────────
// バックエンド未接続でも UI が動くようにするためのサンプル。
// 接続が済むと実データに置き換わる。

import { todayISO } from "./format.js";

const t = (hh, mm) => {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
};

export const demoState = () => ({
  demo: true,
  date: todayISO(),
  departments: [
    {
      id: "affiliate",
      total: 6800,
      count: 1,
      items: [
        { label: "クラウドストレージC 契約", amount: 3200 },
        { label: "クラウドストレージA 契約", amount: 2400 },
        { label: "文字起こしツールD 契約", amount: 800 },
        { label: "VPNサービスB 契約", amount: 400 },
      ],
    },
    {
      id: "note",
      total: 6700,
      count: 1,
      items: [
        { label: "AI副業ロードマップ", amount: 2980 },
        { label: "プロンプト設計の教科書", amount: 1980 },
        { label: "AI記事量産テンプレ50選", amount: 1240 },
        { label: "ChatGPT時短術", amount: 500 },
      ],
    },
    {
      id: "content",
      total: 24580,
      count: 1,
      items: [
        { label: "動画教材フルパック", amount: 12800 },
        { label: "テンプレート集 Pro", amount: 6800 },
        { label: "個別サポートプラン", amount: 3980 },
        { label: "月額コミュニティ", amount: 1000 },
      ],
    },
  ],
  feed: [
    { id: "f1", at: t(10, 40), author: "fable", role: "監督", text: "承知しました🙌 各部に聞いてきます" },
    { id: "f2", at: t(10, 41), author: "fable", role: "監督", text: "アフィリどう？" },
    { id: "f3", at: t(10, 42), author: "sol", deptId: "affiliate", text: "本日 ¥6,800 でした！" },
    { id: "f4", at: t(10, 44), author: "fable", role: "監督", text: "noteどう？" },
    { id: "f5", at: t(10, 45), author: "nao", deptId: "note", text: "本日 ¥6,700 でした！" },
    { id: "f6", at: t(10, 47), author: "fable", role: "監督", text: "コンテンツ販売どう？" },
    { id: "f7", at: t(10, 48), author: "kai", deptId: "content", text: "本日 ¥24,580 でした！" },
  ],
  ticker: [
    { at: t(10, 49), deptId: "affiliate", text: "文字起こしツールD 契約", amount: 400 },
    { at: t(10, 49), deptId: "note", text: "読者コメントに返信中", amount: 0 },
    { at: t(10, 46), deptId: "content", text: "LPの表示速度を確認中", amount: 0 },
    { at: t(10, 38), deptId: "content", text: "テンプレート集 Pro 決済", amount: 6800 },
  ],
  drafts: [
    {
      id: "d1",
      deptId: "affiliate",
      channel: "blog",
      title: "【2026年版】法人向けクラウドストレージ徹底比較",
      body: "容量・料金・セキュリティの3軸で主要5サービスを比較しました。…",
      status: "draft",
      createdAt: t(6, 5),
    },
    {
      id: "d2",
      deptId: "note",
      channel: "note",
      title: "AI記事量産テンプレ50選（実務で使った順）",
      body: "実際に使って成果が出た順に並べています。…",
      status: "draft",
      createdAt: t(6, 6),
    },
    {
      id: "d3",
      deptId: "content",
      channel: "x",
      title: "",
      body: "テンプレート集Proに新しく12個追加しました。既に購入済みの方は無料で再ダウンロードできます。",
      status: "approved",
      createdAt: t(6, 7),
    },
  ],
});
