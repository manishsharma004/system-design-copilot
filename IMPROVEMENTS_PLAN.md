# System Design Copilot — Improvement Plan

A phased roadmap for UX, learning features, performance, and infrastructure.  
Status key: **Done** | **Partial** | **In progress** | **Planned**

Last reviewed: 2026-07-26 (Phases 1–3 complete; Phase 4–7 active backlog)

---

## Phase 1 — Infrastructure & correctness

| # | Item | Priority | Status |
|---|------|----------|--------|
| 1.1 | CI: run `npm ci`, `npm test`, `npm run build` before GitHub Pages deploy | P0 | **Done** |
| 1.2 | Pin Node `>=20.19` in `package.json` + `.nvmrc` | P0 | **Done** |
| 1.3 | Fix README (base path URL, npm/bun, validate steps) | P1 | **Done** |

**Success criteria:** Every push to `main` produces a fresh `dist/` artifact; local docs match runtime.

---

## Phase 2 — Navigation & home UX

| # | Item | Priority | Status |
|---|------|----------|--------|
| 2.1 | Trim home page: hero + flow cards + resume + collapsible extras | P0 | **Done** |
| 2.2 | Fix copy: “Five prep flows” (not “Two interview tracks”) | P1 | **Done** |
| 2.3 | Dedupe topbar progress (single counter + flow progress when scoped) | P1 | **Done** |
| 2.4 | Progress export/import (all localStorage keys) | P1 | **Done** |
| 2.5 | Sidebar toggle: “Current flow only” vs “All topics” | P1 | **Done** |
| 2.6 | “Resume where you left off” card on home | P1 | **Done** |

**Success criteria:** Home scroll depth reduced ~50%; users can backup/restore progress; sidebar defaults to current flow on lesson pages.

---

## Phase 3 — Lesson experience

| # | Item | Priority | Status |
|---|------|----------|--------|
| 3.1 | Sticky lesson sub-nav: Read · Topic lab · Simulate · Practice · Solutions | P0 | **Done** |
| 3.2 | Section `id` anchors on labs for deep linking | P1 | **Done** |
| 3.3 | Remove duplicate “Guided walkthrough” anchor grid (keep study map + sub-nav) | P2 | **Done** |
| 3.4 | Skip-to-content link + visible search label | P1 | **Done** |
| 3.5 | Show lesson context in mobile topbar (truncate title) | P2 | **Done** |
| 3.6 | `/` keyboard shortcut to focus sidebar search | P2 | **Done** |

**Success criteria:** Jump from lesson hero to simulation/practice in one click; improved a11y baseline.

---

## Phase 4 — Learning features

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 4.1 | HLD/LLD mock-interview timer on Practice IDE (25/35/45 min phases) | P1 | **Partial** | Timer store + DSA UI exist; `PracticeIDE.svelte` not wired |
| 4.2 | Curated `likelyAnswers` per checklist item (fallback to heuristics) | P1 | **Partial** | Heuristic UI shipped; ~8 lessons have `likelyAnswerPoints` |
| 4.3 | Expand solution reveals beyond 9 case studies | P2 | **Partial** | `solutionLoader.js` gates 9 IDs; reveal panel works |
| 4.4 | Simulation CTA in lesson hero when lab exists | P2 | **Planned** | Sub-nav has Simulate; hero action-row missing CTA |
| 4.5 | Spaced review queue (resurface completed lessons) | P3 | **Planned** | No review store or scheduling |
| 4.6 | Company-specific study paths (Amazon/Google JSON data) | P3 | **Planned** | Company JSON backs question bank, not curated paths |

**Key paths:** `PracticeIDE.svelte`, `practiceTimer.js`, `practice.js`, `interviewAnswers.js`, `solutionLoader.js`, `lessonEnhancements.js`, `simulationLessons.js`, `+page.svelte` (lesson)

**Success criteria:** Timed HLD rehearsal matches real interview pacing; curated hints on every checklist item; simulation discoverable from hero; optional review queue on home.

---

## Phase 5 — Performance & quality

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 5.1 | Lazy-load Monaco / Pyodide / WASM only when lab opens | P1 | **Partial** | WASM on first run; Monaco mounts with lesson snippets/practice |
| 5.2 | Playwright smoke tests (search, progress, practice save, simulation run) | P1 | **Planned** | Node `--test` only (32 tests, no browser) |
| 5.3 | Bundle analysis + route-level code splitting audit | P2 | **Planned** | No analyze script |
| 5.4 | PWA service worker for offline lesson reading | P2 | **Planned** | Static adapter only |
| 5.5 | `prefers-reduced-motion` respect for smooth scroll / animations | P2 | **Done** | Global rules in `src/app.css` |

**Key paths:** `monaco.js`, `CodeEditor.svelte`, `LessonCodeSnippet.svelte`, `wasm*Runtime.js`, `vite.config.js`, `tests/`

---

## Phase 6 — AI & security UX

| # | Item | Priority | Status |
|---|------|----------|--------|
| 6.1 | Default LLM provider to search-engine mode | P1 | **Done** |
| 6.2 | Prominent warning before storing cloud API keys in browser | P1 | **Done** |
| 6.3 | Optional proxy endpoint docs for production API use | P2 | **Planned** |

**Key paths:** `docs/cursor/llm.mdc`, `src/lib/llm/providers.js`

---

## Phase 7 — Future differentiation

| # | Item | Status | Notes |
|---|------|--------|-------|
| 7.1 | Full-screen mock interview mode with debrief | Planned | `SimulationIDE` has sim fullscreen, not practice debrief |
| 7.2 | Simulation A/B compare (two topologies side by side) | Planned | |
| 7.3 | Theme toggle (light/dark) | Planned | Fixed dark palette by design (`AGENTS.md`) |
| 7.4 | Shareable progress via encoded URL hash | Planned | JSON backup only today |

---

## Next sprint — recommended order

Prioritized work packages for the next implementation cycle. Each is scoped to ship independently.

### Sprint A — Quick wins (low effort, high discovery)

| Item | Work | Acceptance |
|------|------|------------|
| **4.4** Simulation hero CTA | Add “Open simulation lab” link in lesson hero `action-row` when `showSimulationLab`; anchor `#simulation-lab` | Hero CTA visible on HLD lessons; one-click scroll to sim |
| **4.3** (batch 1) | Add 5–10 high-traffic lesson IDs to `solutionLessonIds` + enhancements | Reveal panel works on expanded set |

**Files:** `src/routes/module/[module]/lesson/[lesson]/+page.svelte`, `solutionLoader.js`, `lessonEnhancements.js`

### Sprint B — Core learning loop (highest product value)

| Item | Work | Acceptance |
|------|------|------------|
| **4.1** Phased mock timer | Wire `practiceTimer.js` into `PracticeIDE.svelte`; map steps `opening` → 25 min, `design` → 35 min, `tradeoffs` → 45 min (HLD/LLD); reuse DSA timer UI patterns | Start/pause/stop per phase; elapsed persists via `practiceAnswers`; tests in `tests/` |
| **4.2** Curated answers | Add `likelyAnswerPoints` (or per-checklist `likelyAnswers`) to foundation modules first (~20 lessons); keep `getLikelyAnswerPoints()` heuristic fallback | “Show likely answer” shows curated text when present |

**Files:** `PracticeIDE.svelte`, `DsaPracticeIDE.svelte` (reference), `courseData.js`, `interviewAnswers.js`, `practice.js`

**Timer design sketch:**

```
Phase 1 (opening)   — 25 min — explain scope, constraints, estimates
Phase 2 (design)    — 35 min — architecture, data model, APIs
Phase 3 (tradeoffs) — 45 min — scale, failure modes, trade-off defense
```

Persist under `practiceAnswers` keys like `hld-timer:{lessonId}:{stepId}`.

### Sprint C — Quality gate

| Item | Work | Acceptance |
|------|------|------------|
| **5.2** Playwright smoke | Add `@playwright/test`; 4–6 tests: home load, sidebar search, mark complete + export, practice draft save, simulation tab open | `npm run test:e2e` in CI (optional job) or documented local run |
| **5.1** Defer Monaco | Gate `getMonaco()` until user focuses editor or clicks “Open practice lab” | Lesson read path does not download Monaco chunk |

**Files:** `playwright.config.js`, `tests/e2e/`, `CodeEditor.svelte`, `LessonCodeSnippet.svelte`

### Sprint D — Engagement (after A–C)

| Item | Work | Acceptance |
|------|------|------------|
| **4.5** Spaced review | `reviewQueue` store: schedule completed lessons at 1d / 3d / 7d; “Review today” card on home | 3–5 lessons suggested per day from completed set |
| **4.6** Company paths | New `companyPaths` in `courseData.js` filtering modules/lessons; link from home study tracks | Amazon + Google paths with 10–15 lesson sequences |
| **5.3** Bundle audit | `rollup-plugin-visualizer` + `npm run analyze`; document largest chunks in plan | One-time report + route split recommendations |
| **6.3** Proxy docs | Section in `docs/cursor/llm.mdc` for server-side proxy pattern | No runtime code change |

---

## Opportunities (not yet in phases)

| Opportunity | Why | Suggested phase |
|-------------|-----|-----------------|
| Generated sim labs for all HLD lessons | `getSimulationLesson()` already falls back to module blueprints | Marketing copy + 4.4 CTA |
| Full backup includes IndexedDB workspaces | `exportFullLocalData()` beyond localStorage | Document in README |
| 13 interactive topic labs (`interactiveLessons.js`) | Richer than checklist-only framing | Cross-link from sub-nav |
| Reuse DSA timer UI for HLD phases | Less new UI than building from scratch | Sprint B |
| Company JSON → study paths | `amazon.json`, `google.json` exist for question bank | Sprint D / 4.6 |

---

## localStorage keys (for backup)

| Key | Purpose |
|-----|---------|
| `system-design-copilot-progress-v4` | Completed lesson IDs |
| `system-design-copilot-practice-v1` | Practice IDE drafts + timers |
| `system-design-copilot-simulation-v1` | Simulation lab sessions |
| `system-design-copilot-llm-v1` | LLM provider settings |
| `system-design-copilot-sidebar-v1` | Sidebar expand/collapse + scope preference |

IndexedDB workspaces (DSA drafts, ML worker state) are included in full export via `backup.js`.

---

## Current scale

5 flows · 29 modules · 110 lessons · 9 enhanced solution reveals · 13 interactive topic labs · simulation for all HLD lessons (9 authored + generated fallbacks)

---

## How to track progress

Update the **Status** column in this file as phases ship. Run validation before each release:

```bash
npm run check
npm test
npm run build
```

When adding Playwright (Sprint C):

```bash
npm run test:e2e
```
