# System Design Copilot — Improvement Plan

A phased roadmap for UX, learning features, performance, and infrastructure.  
Status key: **Done** | **In progress** | **Planned**

---

## Phase 1 — Infrastructure & correctness (Week 1)

| # | Item | Priority | Status |
|---|------|----------|--------|
| 1.1 | CI: run `npm ci`, `npm test`, `npm run build` before GitHub Pages deploy | P0 | **Done** |
| 1.2 | Pin Node `>=20.19` in `package.json` + `.nvmrc` | P0 | **Done** |
| 1.3 | Fix README (base path URL, npm/bun, validate steps) | P1 | **Done** |

**Success criteria:** Every push to `main` produces a fresh `dist/` artifact; local docs match runtime.

---

## Phase 2 — Navigation & home UX (Week 1–2)

| # | Item | Priority | Status |
|---|------|----------|--------|
| 2.1 | Trim home page: hero + flow cards + resume + collapsible extras | P0 | **Done** |
| 2.2 | Fix copy: “Four prep flows” (not “Two interview tracks”) | P1 | **Done** |
| 2.3 | Dedupe topbar progress (single counter + flow progress when scoped) | P1 | **Done** |
| 2.4 | Progress export/import (all localStorage keys) | P1 | **Done** |
| 2.5 | Sidebar toggle: “Current flow only” vs “All topics” | P1 | **Done** |
| 2.6 | “Resume where you left off” card on home | P1 | **Done** |

**Success criteria:** Home scroll depth reduced ~50%; users can backup/restore progress; sidebar defaults to current flow on lesson pages.

---

## Phase 3 — Lesson experience (Week 2–3)

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

## Phase 4 — Learning features (Week 3–5)

| # | Item | Priority | Status |
|---|------|----------|--------|
| 4.1 | HLD/LLD mock-interview timer on Practice IDE (25/35/45 min phases) | P1 | Planned |
| 4.2 | Curated `likelyAnswers` per checklist item (fallback to heuristics) | P1 | Planned |
| 4.3 | Expand solution reveals beyond 9 case studies | P2 | Planned |
| 4.4 | Simulation CTA in lesson hero when lab exists | P2 | Planned |
| 4.5 | Spaced review queue (resurface completed lessons) | P3 | Planned |
| 4.6 | Company-specific study paths (Amazon/Google JSON data) | P3 | Planned |

---

## Phase 5 — Performance & quality (Week 4–6)

| # | Item | Priority | Status |
|---|------|----------|--------|
| 5.1 | Lazy-load Monaco / Pyodide / WASM only when lab opens | P1 | Planned |
| 5.2 | Playwright smoke tests (search, progress, practice save, simulation run) | P1 | Planned |
| 5.3 | Bundle analysis + route-level code splitting audit | P2 | Planned |
| 5.4 | PWA service worker for offline lesson reading | P2 | Planned |
| 5.5 | `prefers-reduced-motion` respect for smooth scroll / animations | P2 | Planned |

---

## Phase 6 — AI & security UX (Week 5–6)

| # | Item | Priority | Status |
|---|------|----------|--------|
| 6.1 | Default LLM provider to search-engine mode | P1 | Planned |
| 6.2 | Prominent warning before storing cloud API keys in browser | P1 | Planned |
| 6.3 | Optional proxy endpoint docs for production API use | P2 | Planned |

---

## Phase 7 — Future differentiation

| # | Item | Status |
|---|------|--------|
| 7.1 | Full-screen mock interview mode with debrief | Planned |
| 7.2 | Simulation A/B compare (two topologies side by side) | Planned |
| 7.3 | Theme toggle (light/dark) | Planned |
| 7.4 | Shareable progress via encoded URL hash | Planned |

---

## localStorage keys (for backup)

| Key | Purpose |
|-----|---------|
| `system-design-copilot-progress-v4` | Completed lesson IDs |
| `system-design-copilot-practice-v1` | Practice IDE drafts + timers |
| `system-design-copilot-simulation-v1` | Simulation lab sessions |
| `system-design-copilot-llm-v1` | LLM provider settings |
| `system-design-copilot-sidebar-v1` | Sidebar expand/collapse + scope preference |

---

## How to track progress

Update the **Status** column in this file as phases ship. Run validation before each release:

```bash
npm run check
npm test
npm run build
```
