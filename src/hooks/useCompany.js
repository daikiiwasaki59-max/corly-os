import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "../lib/api.js";
import { demoState } from "../lib/demo.js";
import { DEPARTMENTS } from "../config/company.js";

const REFRESH_MS = 60_000;

/** 会社の当日状態を保持し、定期的にバックエンドから取り直す */
export function useCompany() {
  const [state, setState] = useState(() => demoState());
  const [status, setStatus] = useState(api.isConnected() ? "loading" : "demo");
  const [error, setError] = useState("");
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!api.isConnected()) {
      setState(demoState());
      setStatus("demo");
      setError("");
      return;
    }
    setStatus((s) => (s === "ready" ? "ready" : "loading"));
    try {
      const data = await api.fetchState();
      if (!alive.current) return;
      setState(data);
      setStatus("ready");
      setError("");
    } catch (e) {
      if (!alive.current) return;
      setStatus("error");
      setError(e.message || String(e));
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  // 楽観更新つきの下書き操作
  const mutateDraft = useCallback(async (id, nextStatus, fn) => {
    setState((s) => ({
      ...s,
      drafts: (s.drafts || []).map((d) => (d.id === id ? { ...d, status: nextStatus } : d)),
    }));
    try {
      await fn();
    } catch (e) {
      setError(e.message || String(e));
    }
  }, []);

  const approve = useCallback(
    (id) => mutateDraft(id, "approved", () => api.approveDraft(id)),
    [mutateDraft]
  );
  const reject = useCallback(
    (id) => mutateDraft(id, "rejected", () => api.rejectDraft(id)),
    [mutateDraft]
  );

  const totals = computeTotals(state);
  return { state, totals, status, error, reload: load, approve, reject };
}

export function computeTotals(state) {
  const byId = Object.fromEntries((state.departments || []).map((d) => [d.id, d]));
  const perDept = DEPARTMENTS.map((d) => ({
    ...d,
    total: byId[d.id]?.total || 0,
    count: byId[d.id]?.count || 0,
    items: byId[d.id]?.items || [],
  }));
  return { perDept, grand: perDept.reduce((s, d) => s + d.total, 0) };
}
