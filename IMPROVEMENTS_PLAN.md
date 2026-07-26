# System Design Copilot — Improvement Plan

A phased roadmap focused on **learning experience, content depth, and practice UX**.  
Status key: **Done** | **Partial** | **Planned** | **Deferred**

Last reviewed: 2026-07-26

---

## Current focus

**Learning UX + content** — mock interview pacing, curated hints, solution reveals, hero CTAs, spaced review, company paths.

**Deferred (not in active scope):** Playwright/e2e suite (5.2), theme toggle (7.3). Node unit tests remain the quality gate.

---

## Phase 1 — Infrastructure & correctness

| # | Item | Priority | Status |
|---|------|----------|--------|
| 1.1 | CI: run `npm ci`, `npm test`, `npm run build` before GitHub Pages deploy | P0 | **Done** |
| 1.2 | Pin Node `>=20.19` in `package.json` + `.nvmrc` | P0 | **Done** |
| 1.3 | Fix README (base path URL, npm/bun, validate steps) | P1 | **Done** |

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

---

## Phase 3 — Lesson experience

| # | Item | Priority | Status |
|---|------|----------|--------|
| 3.1 | Sticky lesson sub-nav: Read · Topic lab · Simulate · Practice · Solutions | P0 | **Done** |
| 3.2 | Section `id` anchors on labs for deep linking | P1 | **Done** |
| 3.3 | Remove duplicate “Guided walkthrough” anchor grid | P2 | **Done** |
| 3.4 | Skip-to-content link + visible search label | P1 | **Done** |
| 3.5 | Show lesson context in mobile topbar (truncate title) | P2 | **Done** |
| 3.6 | `/` keyboard shortcut to focus sidebar search | P2 | **Done** |

---

## Phase 4 — Learning features

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 4.1 | HLD/LLD mock-interview timer on Practice IDE (25/35/45 min phases) | P1 | **Done** | `PracticeIDE.svelte` + `practicePhaseLimits.js` |
| 4.2 | Curated `likelyAnswerPoints` (heuristic fallback) | P1 | **Partial** | 8 → 17 lessons |
| 4.3 | Expand solution reveals beyond 9 case studies | P2 | **Partial** | 9 → 12 lessons |
| 4.4 | Simulation + practice CTAs in lesson hero | P2 | **Done** | Hero deep links to labs |
| 4.5 | Spaced review queue (resurface completed lessons) | P1 | **Planned** | No review store yet |
| 4.6 | Company-specific study paths (Amazon/Google JSON data) | P2 | **Planned** | Company JSON backs question bank only |

**Key paths:** `PracticeIDE.svelte`, `practiceTimer.js`, `practicePhaseLimits.js`, `interviewAnswers.js`, `solutionLoader.js`, `lessonEnhancements.js`, `+page.svelte` (lesson)

**Next content targets for 4.2:** remaining HLD modules (data storage, security, distributed systems).  
**Next content targets for 4.3:** `partitioning-and-sharding`, `queues-and-streams`, `chat-notifications`.

---

## Phase 5 — Performance & quality

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 5.1 | Lazy-load Monaco only when practice lab opens | P2 | **Partial** | WASM on first run; Monaco still mounts with snippets |
| 5.2 | Playwright smoke tests | — | **Deferred** | Node `--test` only (58 tests) |
| 5.3 | Bundle analysis audit | P3 | **Planned** | No analyze script |
| 5.4 | PWA service worker for offline lesson reading | P2 | **Done** | `@vite-pwa/sveltekit`, precache + runtime cache |
| 5.5 | `prefers-reduced-motion` | P2 | **Done** | Global rules in `src/app.css` |

**Key paths:** `vite.config.js`, `PwaUpdateBanner.svelte`, `monaco.js`, `CodeEditor.svelte`

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
| 7.1 | Full-screen mock interview mode with debrief | **Planned** | `SimulationIDE` has sim fullscreen, not practice debrief |
| 7.2 | Simulation A/B compare (two topologies side by side) | **Planned** | |
| 7.3 | Theme toggle (light/dark) | **Deferred** | Fixed dark palette by design (`AGENTS.md`) |
| 7.4 | Shareable progress via encoded URL hash | **Planned** | JSON backup only today |

---

## Next sprint — recommended order

### Sprint A — Quick wins ✅ (shipped)

| Item | Status |
|------|--------|
| **4.4** Simulation + practice hero CTAs | **Done** |
| **4.3** (batch 1) — feed-timeline, caching-layers, api-design | **Done** |

### Sprint B — Core learning loop ✅ (shipped)

| Item | Status |
|------|--------|
| **4.1** Phased mock timer on `PracticeIDE` | **Done** |
| **4.2** Curated answers (+9 lessons) | **Partial** — continue expanding |

### Sprint C — Quality (selective)

| Item | Work | Status |
|------|------|--------|
| **5.1** Defer Monaco until editor focus | Gate `getMonaco()` on interaction | **Planned** |
| **5.2** Playwright smoke | — | **Deferred** |

### Sprint D — Engagement (next)

| Item | Work | Acceptance |
|------|------|------------|
| **4.5** Spaced review | `reviewQueue` store: 1d / 3d / 7d resurfacing | “Review today” card on home |
| **4.6** Company paths | `companyPaths` in `courseData.js` | Amazon + Google lesson sequences |
| **5.3** Bundle audit | `rollup-plugin-visualizer` + `npm run analyze` | One-time chunk report |
| **6.3** Proxy docs | Section in `docs/cursor/llm.mdc` | No runtime code change |

---

## Opportunities (not yet in phases)

| Opportunity | Why | Suggested phase |
|-------------|-----|-----------------|
| Generated sim labs for all HLD lessons | `getSimulationLesson()` falls back to module blueprints | Discovery UX (4.4 done) |
| Full backup includes IndexedDB workspaces | `exportFullLocalData()` beyond localStorage | Document in README |
| 13 interactive topic labs (`interactiveLessons.js`) | Richer than checklist-only framing | Cross-link from sub-nav |
| Company JSON → study paths | `amazon.json`, `google.json` exist for question bank | Sprint D / 4.6 |
| PWA runtime cache for visited lessons | Large bank chunks excluded from precache | Extend offline coverage |

---

## localStorage keys (for backup)

| Key | Purpose |
|-----|---------|
| `system-design-copilot-progress-v4` | Completed lesson IDs |
| `system-design-copilot-practice-v1` | Practice IDE drafts + per-phase timers |
| `system-design-copilot-simulation-v1` | Simulation lab sessions |
| `system-design-copilot-llm-v1` | LLM provider settings |
| `system-design-copilot-sidebar-v1` | Sidebar expand/collapse + scope preference |

IndexedDB workspaces (DSA drafts, ML worker state) are included in full export via `backup.js`.

---

## Current scale

5 flows · 29 modules · 110 lessons · **12** enhanced solution reveals · 13 interactive topic labs · simulation for all HLD lessons (9 authored + generated fallbacks)

---

## Validation

```bash
npm run check
npm test
npm run build
```
