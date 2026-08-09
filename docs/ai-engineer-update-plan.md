# AI Engineer track — update plan

Phased plan to improve **AI/ML learning content**, **interactive labs**, and **UX** for engineers building AI applications (basics through professional / production).

**Status key:** **Done** | **Partial** | **Planned** | **Deferred**  
**Last reviewed:** 2026-08-09  
**Parent roadmap:** [`IMPROVEMENTS_PLAN.md`](../../IMPROVEMENTS_PLAN.md) (Sprint E / Phase 8)

---

## Goals

1. **Clear learning paths** — builder vs theory-first vs platform/LLMOps, with aligned “start here” copy.
2. **One coherent lesson loop** — Learn → unified topic lab → ML IDE → interview practice, without duplicate anchors or buried labs.
3. **Application-builder depth** — API/streaming, multi-tenant RAG, tool agents, ship checklist (not only model math).
4. **Stronger hands-on** — fixture-based tool sims, eval gates in ML IDE, diagrams in Learn chapters.
5. **Retention** — spaced review biased toward RAG/agents/LLMOps; backup includes Learn reader position.

---

## Current baseline (2026-08-09)

| Metric | Value |
|--------|--------|
| AI Engineer modules | 15 |
| AI lessons | 44 |
| Learn chapters | 44 (all AI lessons) |
| Interactive topic labs (`getInteractiveLesson`) | ~35 lessons |
| Exercises per lesson | ≥2 (coding + design mix) |
| Topic lab UX | Unified `AiTopicLab.svelte` — single `#topic-lab` |
| Module order | Core 8 first (`ml-foundations` … `data-engineering-for-ml`), labs 9–15 |
| Stated start | Builder path defaults to **ml-interactive-lab**; flow resume respects study path |

**Key paths**

| Area | Paths |
|------|--------|
| Curriculum assembly | `src/lib/data/courseData.js`, `aiEngineerCourseData.js`, `aiCoreLessonEnrichment.js`, `aiLearningExpansion*.js`, `aiIndustryCurrency*.js` |
| Learn chapters | `src/lib/data/learnChapters.js`, `src/lib/data/learnChapters/*.js` |
| Interactive labs | `src/lib/data/interactiveLessons.js`, `aiInteractiveExtras.js`, `aiInteractiveCurrency2026.js` |
| Lesson UI | `src/routes/module/[module]/lesson/[lesson]/+page.svelte`, `AiLessonStudyGuide.svelte`, `LessonExplorer.svelte`, `MLPracticeIDE.svelte`, `LessonLearnReader.svelte`, `LessonSectionNav.svelte` |
| Practice | `PracticeIDE.svelte`, `getLessonPracticeSteps()` in `courseData.js` |
| Progress / backup | `src/lib/stores/progress.js`, `backup.js` |

---

## Phase A — UX clarity (P0)

Fix discovery and navigation before adding content. Low risk, high impact.

| # | Item | Work | Acceptance | Files |
|---|------|------|------------|-------|
| A.1 | Unify AI topic lab | Merge `AiLessonStudyGuide` + `LessonExplorer` into one surface **or** render `LessonExplorer` only when study guide absent; single `#topic-lab` | One topic-lab block per AI lesson; sub-nav “Topic lab” scrolls to one target; no duplicate ids | `+page.svelte`, `AiLessonStudyGuide.svelte`, `LessonExplorer.svelte` (or new `AiTopicLab.svelte`) |
| A.2 | Add **Learn** to sub-nav | First item when `learnChapter` exists; optional “Chapter” pill | Sticky nav: Learn · Read · …; opens modal or `?learn=1` | `LessonSectionNav.svelte`, `+page.svelte` |
| A.3 | Align **start here** | Pick one default path; update `heroGuidance`, `learningPaths.startModule`, flow **START HERE** (`nextModule` logic), and home AI card | Copy and first CTA agree; optional second path link (“Theory-first: start with ML foundations”) | `courseData.js`, `flow/[flow]/+page.svelte`, `+page.svelte` (home) |
| A.4 | Rename AI practice CTA | Hero: “Interview practice” / “Explain aloud” instead of “Start mock interview” for `ai-engineer` | No HLD timer implied on AI lessons | `+page.svelte` |
| A.5 | Phase labels on AI flow | Runway sections: **Foundations · Models · Applications · Production** | Visual grouping on `/flow/ai-engineer` | `flow/[flow]/+page.svelte`, optional `courseData.js` metadata |
| A.6 | Home hero stats | Replace “4 interactive labs” with accurate AI loop copy | Mentions Learn chapters, topic labs, ML IDE, interview practice | `+page.svelte`, `siteOverview` if needed |

**Validation:** Manual pass on `math-for-ml`, `building-with-frameworks`, `rag-systems`; `npm run check`; lesson page has unique anchor ids.

---

## Phase B — Learning path productization (P1)

| # | Item | Work | Acceptance | Files |
|---|------|------|------------|-------|
| B.1 | Role-based paths | Three curated sequences on AI flow page: **App engineer**, **ML engineer**, **Platform / LLMOps** | Each path lists 8–12 lesson ids + deep links; does not reorder global module index | `courseData.js` (`aiStudyPaths`), `flow/[flow]/+page.svelte` |
| B.2 | Builder vs theory entry | **Builder default:** `ml-interactive-lab` → foundations → DL → LLMs → RAG. **Theory:** `ml-foundations` first | `getResumeLesson` / START HERE respect chosen path preference (`localStorage` key) | `courseData.js`, `progress.js` or new `studyPath.js` store |
| B.3 | Move data engineering earlier | Reorder modules or add “required before RAG” callout on `rag-systems` / `embeddings-and-vector-search` | Learners see ingest/feature-store context before RAG depth | `courseData.js` module order or lesson `related[]` + flow UI badges |
| B.4 | Dedupe thin shell sections | Trim stale `aiEngineerCourseData.js` bodies where `aiCoreLessonEnrichment` + patches supersede | Read tab not weaker duplicate of Learn chapter | `aiEngineerCourseData.js`, enrichment patches |

**App engineer path (initial lesson order)**

1. `ml-interactive-lab/*` (3)
2. `ml-foundations/classical-ml-algorithms`, `model-evaluation`
3. `llms-and-nlp/llm-fundamentals`, `embeddings-and-vector-search`
4. `prompt-engineering-and-rag/*` (3)
5. `ai-agents/tool-use-and-function-calling`
6. `mlops-and-deployment/model-serving`
7. `llmops-eval-lab/*` (3)

---

## Phase C — Application-builder content (P1)

New and expanded **lessons/modules** for shipping AI applications (design + browser-safe exercises).

| # | Item | Work | Acceptance | Files |
|---|------|------|------------|-------|
| C.1 | **AI application architecture** module | New module `ai-application-lab` (3 lessons) | Module appears in AI flow; 3 Learn chapters; ≥2 exercises each | New: `aiApplicationLab.js`, `learnChapters/aiApplicationLabChapters.js`; wire in `courseData.js` |
| C.2 | Lesson: Chat API & streaming | REST vs SSE, session ids, cancellation, error UX | Learn chapter + design drill + checklist | C.1 |
| C.3 | Lesson: Multi-tenant RAG product | Per-tenant indexes, ACL filters, audit | Diagram in Learn; links to `rag-systems` | C.1 |
| C.4 | Lesson: Ship checklist | Env/secrets, rate limits, cost caps, canary, rollback | Practice step “Sketch deploy + gates” | C.1 |
| C.5 | Capstone design drills | Add to `building-with-frameworks`, `rag-systems`, `agent-fundamentals` practice steps: full app sketch (API + data + eval) | `getLessonPracticeSteps` third step or expanded design prompt | `courseData.js`, `aiCoreLessonEnrichment.js` |
| C.6 | Expand `building-with-frameworks` | Ensure enrichment is single source; interactive lab tabbed with decision guide | No LangChain-only thin Read; MCP/thin-orchestration in Learn + lab | Existing AI data files |

**C.1 lesson outlines**

| Slug | Title | Focus |
|------|--------|--------|
| `chat-api-and-streaming` | Chat APIs and streaming UX | SSE, backpressure, session store, client states |
| `multi-tenant-rag-products` | Multi-tenant RAG | Tenant isolation, ACL on retrieve, observability |
| `shipping-ai-features` | Shipping AI features | Gates, shadow, rollback, on-call playbooks |

**Out of scope (Phase C):** Live LangChain in Pyodide; real OpenAI calls in ML IDE (see Phase E optional).

---

## Phase D — Interactive & Learn depth (P1–P2)

**Detailed per-lesson plan:** [`ai-ml-interactive-chapters-plan.md`](ai-ml-interactive-chapters-plan.md) (runnable demos, Mermaid, `nextSteps`, all 44 lessons).

| # | Item | Work | Acceptance | Files |
|---|------|------|------------|-------|
| D.1 | Diagrams in Learn chapters | Optional `mermaid` on part or chapter for RAG pipeline, agent loop, serving | ≥10 high-traffic AI chapters get diagrams; `LessonLearnReader` renders `MermaidDiagram` | `learnChapters.js` schema, `LessonLearnReader.svelte`, chapter data |
| D.2 | Unified topic lab tabs | Study · Scenarios · Design choices · Diagram (post A.1) | Same panels as HLD `LessonExplorer` where data exists | Merged topic lab component |
| D.3 | Learn `nextSteps` deep links | Text + lesson URLs / `#practice-lab` / exercise ids | Wrap-up links jump to ML IDE exercise or next lesson | All `learnChapters/*` AI files (batch by module) |
| D.4 | Fixture tool-calling exercises | Mock `search()`, `sql()` returning JSON in starter code | Agent lessons runnable without network; `expectedOutput` keywords | `aiCoreLessonEnrichment.js`, agent module exercises |
| D.5 | Eval harness exercises | Golden row → score → pass/fail gate in LLMOps lessons | ML IDE shows Pass/Review; harness exercise in `llmops-eval-lab` | `aiIndustryCurrencyLabs.js`, `MLPracticeIDE.svelte` |
| D.6 | Exercise onboarding | First-run hint on TODO starters; “Load solution & run” chip | Gradient-descent starter does not look “broken” on first Run | `MLPracticeIDE.svelte`, optional `AiLessonStudyGuide` |
| D.7 | Plotting in exercises | Starters/solutions include `plt` when description mentions plots | Matplotlib appears in ML IDE output panel | Exercise payloads in AI enrichment |

---

## Phase E — Retention & platform (P2)

Aligns with global Sprint D (`IMPROVEMENTS_PLAN` 4.5, 4.6) but **AI-weighted**.

| # | Item | Work | Acceptance | Files |
|---|------|------|------------|-------|
| E.1 | Spaced review queue | `reviewQueue` store; AI tags boost RAG/agents/LLMOps | Home “Review today” includes AI lessons | `reviewQueue.js`, `+page.svelte`, `progress.js` |
| E.2 | Learn position in backup | Add `system-design-copilot-learn-position-v1:*` to export/import | Full backup restores chapter section | `backup.js`, `IMPROVEMENTS_PLAN` key table |
| E.3 | Optional live API lane | Label: sandbox vs user-key LLM check on Practice markdown | Docs + UI disclaimer; reuses `LlmAssistantPanel` | `PracticeIDE.svelte`, `docs/cursor/llm.mdc` |
| E.4 | PWA cache for AI bundles | Runtime cache visited lesson routes (large ML worker already lazy) | Offline re-open of last AI lesson | `vite.config.js` PWA config |
| E.5 | Mobile lesson jump menu | Collapse long AI lesson stacks or floating “Jump to” | Topic lab / ML IDE reachable on narrow viewport | `+page.svelte`, `app.css` |

---

## Phase F — Quality & tests (ongoing)

| # | Item | Work | Acceptance |
|---|------|------|------------|
| F.1 | Course data tests | Assert AI module count, no duplicate `#topic-lab` in rendered lesson section list (component test or data invariant) | `tests/courseData.test.js` |
| F.2 | Learn chapter coverage | Assert all `ai-engineer` lesson ids have `getLessonLearnChapter` | Existing pattern in tests |
| F.3 | Interactive coverage | Assert each AI lesson has merged topic lab data (study **or** interactive) | `tests/courseData.test.js` |
| F.4 | Exercise smoke | Node test: gradient-descent **solution** runs in worker fixture (if feasible) or static assert solution shape | `tests/` |

---

## Sprint execution order

### Sprint E1 — UX foundation (Phase A)

| Order | Items | Outcome |
|-------|--------|---------|
| 1 | A.1 Unify topic lab | Single lab surface |
| 2 | A.2 Learn in sub-nav | Discoverability |
| 3 | A.3–A.4 Start path + practice CTA | No contradictory guidance |
| 4 | A.5–A.6 Flow labels + home copy | Clear AI positioning |

**Gate:** `npm run check`, `npm test`, manual AI lesson smoke.

### Sprint E2 — Paths & content scaffold (Phase B + C.5–C.6)

| Order | Items | Outcome |
|-------|--------|---------|
| 1 | B.1–B.2 Role paths + preference | Choosable paths |
| 2 | B.3–B.4 Data eng visibility + dedupe | RAG prerequisites clear |
| 3 | C.5–C.6 Capstone drills + frameworks cleanup | App-building practice prompts |

**Gate:** Content review on 3 representative lessons.

### Sprint E3 — Application lab module (Phase C.1–C.4)

| Order | Items | Outcome |
|-------|--------|---------|
| 1 | C.1 Module shell in `courseData` | 3 lessons routable |
| 2 | Learn chapters + enrichment + exercises | Full lesson density |
| 3 | Interactive labs + deep knowledge | Parity with other AI modules |
| 4 | Update `docs/cursor/data.mdc`, `intent.mdc` | Agent docs current |

**Gate:** `npm test` courseData; build passes.

### Sprint E4 — Interactive depth (Phase D)

| Order | Items | Outcome |
|-------|--------|---------|
| 1 | D.1–D.2 Diagrams + lab tabs | Visual + decision learning |
| 2 | D.3 nextSteps links | Cross-link loop |
| 3 | D.4–D.7 Exercises + ML IDE polish | Hands-on app patterns |

### Sprint E5 — Retention (Phase E + global 4.5)

| Order | Items | Outcome |
|-------|--------|---------|
| 1 | E.1 Spaced review | Review card |
| 2 | E.2 Backup key | Learn resume in export |
| 3 | E.3–E.5 Optional lane, PWA, mobile | Polish |

---

## Dependencies & risks

| Risk | Mitigation |
|------|------------|
| Module reorder breaks deep links | Keep stable lesson ids; only change `moduleSlugs` order + UI badges |
| Merging topic labs regressions | Ship A.1 with visual QA on all 41 AI lessons |
| New module bloat | Cap at 3 lessons; reuse enrichment patterns; no new npm deps |
| Pyodide cannot run frameworks | Fixture mocks + design drills; optional user-key lane (E.3) |
| Learn chapter batch edits | One module per PR; script to validate schema |

---

## Success metrics (qualitative)

After E1–E3, a new **app engineer** learner should be able to:

1. Land on AI flow and pick **App engineer** path without conflicting START HERE text.
2. Open one lesson and follow **Learn → Topic lab → ML IDE → Interview practice** without duplicate sections.
3. Complete a design drill that covers **API + retrieval + eval gate** (not only algorithm detail).
4. Find **multi-tenant RAG** and **streaming API** content in the new application lab module.

---

## Doc updates when shipping

| Change | Update |
|--------|--------|
| New module / routes | `docs/cursor/routes.mdc`, `data.mdc`, `intent.mdc` |
| Topic lab merge | `docs/cursor/components.mdc`, `docs/learn-chapter-reader.md` |
| Backup keys | `IMPROVEMENTS_PLAN.md`, `docs/cursor/persistence.mdc` |
| Study paths | `docs/cursor/intent.mdc` |

---

## Validation

```bash
npm run check
npm test
npm run build
```

Manual smoke URLs:

- `/system-design-copilot/flow/ai-engineer`
- `/system-design-copilot/module/ml-foundations/lesson/math-for-ml`
- `/system-design-copilot/module/prompt-engineering-and-rag/lesson/rag-systems`
- `/system-design-copilot/module/llmops-eval-lab/lesson/llm-evaluation-harness`
