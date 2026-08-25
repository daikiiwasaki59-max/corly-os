# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CORLY OS is a mobile-first, single-page React app used by a small Osaka cleaning/air-filter sales company (株式会社CORLY) to run field sales: track prospects on a map, log contact attempts, send DM templates, build estimates, rehearse sales scripts, and track daily KPIs. All UI text and business content is in Japanese.

There is no backend. All state lives in React state (seeded from hardcoded mock data) plus `localStorage` for the daily report feature. The only external integration is an optional Google Apps Script webhook (see below).

## Commands

```bash
npm install     # install dependencies
npm run dev     # start Vite dev server
npm run build   # production build to dist/
npm run preview # preview the production build
```

There is no test suite, linter, or type checker configured in this repo — don't invent commands for them.

`dist/` (the built output) is committed to the repo, not gitignored. If you change `src/`, consider whether `dist/` also needs rebuilding (`npm run build`) and committing, matching how prior commits shipped changes.

## Architecture

- **Single-component app**: nearly the entire application lives in one file, `src/App.jsx` (~800 lines). `src/main.jsx` just mounts `<CORLYApp />` (the default export of `App.jsx`) into `#root`.
- **Screen switching, not routing**: `CORLYApp` holds a `screen` state string (`"map" | "targets" | "pipeline" | "estimate" | "talk" | "kpi" | "filter" | "daily"`) and conditionally renders one screen component. Navigation is the bottom nav bar (`nav` array in `CORLYApp`) — there is no router library and no URL-based state.
- **Screen components** (each a function defined top-to-bottom in `App.jsx`, roughly in this order): `MapView`, `QuickLog` (modal), `DMComposer` (modal), `EstimateScreen`, `PipelineScreen`, `TalkScreen`, `KPIScreen`, `FilterScreen`, `DailyReportScreen`, then the `TargetList` screen and shared primitives, then the `CORLYApp` root component that wires it all together.
- **Shared UI primitives** near the bottom of the file: `Label`, `TextInput`, `TextArea`, `ActionBtn`, `SectionTitle`, `Modal`, `ChannelBadge`, `FilterBtn`, plus shared style objects `inputStyle`/`stepperBtnStyle`. Reuse these instead of hand-rolling new form controls.
- **Styling**: all inline `style={{...}}` objects, no CSS files or CSS-in-JS library, no Tailwind. The color palette is centralized in the `C` constant at the top of `App.jsx`; reuse `C.*` tokens for new UI rather than hardcoding hex values, except for the many per-entity colors below.
- **Domain data model, all defined as constants at the top of `App.jsx`**:
  - `CHANNELS` — contact channels (walk-in, phone, email, LINE, Instagram, X, Google, referral), each with an `online` flag distinguishing offline vs. online outreach.
  - `STAGES` / `STAGE_COLOR` — pipeline stages (未接触→初回接触→提案済→交渉中→成約/失注).
  - `TYPE_ICON` / `TYPE_COLOR` — business categories (歯科, 薬局, 介護, 保育, 美容, 医療, 飲食, 工場).
  - `initTargets` — seed array of prospect/customer records (the core entity: id, name, type, stage, channels, lat/lng, priority, note, filters installed, monthly revenue, last contact, referrer). This is the initial value of the `targets` state in `CORLYApp`, which is threaded down as props to every screen that reads or mutates prospects — there is no global store/context.
  - `TALK_SCRIPTS`, `COMPETITORS`, `DM_TEMPLATES` — canned sales copy keyed by business type or channel.
  - `DAILY_FIELDS` — the counters tracked on the daily report screen.
- **`MapView`** renders prospects as pinned dots on a fake/schematic map (not a real map library — lat/lng are projected into percentage `left`/`top` via a hardcoded bounding box for the Osaka Kita-ku area).
- **Revenue/profit math** is duplicated in a few places (`CORLYApp` header, `KPIScreen`, `FilterScreen`): profit = 17.5% of monthly recurring revenue from won deals, plus ¥1,750 per installed filter. Keep these in sync if you change the formula.
- **Daily report → Google Sheets sync** (`DailyReportScreen` in `App.jsx`, plus `apps-script/daily-report.gs` and `docs/daily-report-sheet-sync.md`): the user pastes a Google Apps Script Web App URL, saved to `localStorage` under key `corly_sheet_webhook`. Submitting a report POSTs JSON to that URL with `mode: "no-cors"` (so the app cannot read success/failure from the response — it optimistically marks the report synced) and also appends the report to `localStorage` under `corly_daily_reports` (last 50 kept) so it's visible locally regardless of sync status. `apps-script/daily-report.gs` is the server-side script the user pastes into their own Google Apps Script project; it appends a row to a "日報" sheet. If you change the report payload shape in `DailyReportScreen`, update `daily-report.gs`'s expected fields and `docs/daily-report-sheet-sync.md` to match.
