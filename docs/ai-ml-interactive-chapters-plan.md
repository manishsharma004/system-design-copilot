# AI/ML interactive Learn chapters — extension plan

Plan to make every **AI Engineer** Learn chapter fully interactive: runnable Python in the reader, interactive diagrams, fixture-based demos, and deep links into the Python lab and topic lab. Extends and supersedes Phase D of [`ai-engineer-update-plan.md`](ai-engineer-update-plan.md) with **per-lesson deliverables**.

**Baseline (2026-08-09):** 15 modules · 44 lessons · 44 Learn chapters · 44 topic labs · ≥2 exercises/lesson.  
**Gaps today:** only **2** Learn chapters with Mermaid; **21** chapters without runnable `workedExample`; no in-chapter parameter widgets; `nextSteps` only in 4 chapter files.

---

## What “fully interactive” means here

Each Learn chapter should ship **all** of the following where the topic allows:

| Layer | In Learn modal | On lesson page | Data / UI |
|-------|----------------|----------------|-----------|
| **Runnable code** | `workedExample` → `LessonCodeSnippet` (Pyodide) | `#ml-practice-lab` exercises | `learnChapters/*.js`, `aiCoreLessonEnrichment.js` |
| **Interactive diagram** | `part.mermaid` → `MermaidDiagram` (clickable nodes optional) | Topic lab diagram tab | Same + `aiInteractiveExtras.js` |
| **Parameter demo** | New: `interactiveDemo` sliders/toggles → live re-run snippet | Mirror in Python lab | `LessonLearnReader.svelte` + chapter schema |
| **Checks** | `checkYourself` prompts per part | Interview practice | Existing |
| **Navigation** | `wrapUp.nextSteps` → `?learn=1`, `#ml-practice-lab`, `#topic-lab` | Sub-nav Learn · Topic lab · Python lab | All chapter files |

**Out of scope for v1:** live OpenAI calls inside Learn; LangChain in Pyodide; 3D/visual weight explorers (use NumPy + plots instead).

---

## Platform work (do before bulk content)

| # | Item | Acceptance | Files |
|---|------|------------|-------|
| P.1 | **`interactiveDemo` schema** | Part may define `sliders[]` + `code` template; reader re-runs Pyodide on change | `learnChapters.js`, `LessonLearnReader.svelte`, `LessonCodeSnippet.svelte` |
| P.2 | **Diagram standard** | Every AI chapter ≥1 Mermaid; shared palette (ingest/query/agent/serve) | `docs/learn-chapter-reader.md` |
| P.3 | **`nextSteps` on all wrap-ups** | Every chapter ends with 2–4 deep links | Batch edit `learnChapters/*.js` |
| P.4 | **Chapter ↔ exercise map** | `exerciseId` in `nextSteps` opens ML IDE tab | `MLPracticeIDE.svelte`, chapter `wrapUp` |
| P.5 | **Fixture helpers in worker** | `mock_search()`, `mock_sql()`, `score_rag()` for agent/RAG chapters | `lessonPythonRunner.js`, exercise starters |
| P.6 | **Eval gate UI** | LLMOps exercises show Pass / Review from harness output | `MLPracticeIDE.svelte` |
| P.7 | **Tests** | Assert: each AI lesson has ≥1 mermaid OR workedExample in Learn; ≥1 coding exercise | `tests/courseData.test.js` |

---

## Chapter extension targets

| Module family | Current parts | Target parts | Target reading time | Runnable parts | Mermaid parts |
|---------------|---------------|--------------|---------------------|----------------|---------------|
| Core 8 (`ml-foundations` … `data-engineering-for-ml`) | 6 | 6–7 (+1 demo part where thin) | 75–95 min | ≥3 parts | ≥2 parts |
| Lab modules 9–15 | 5 | 6 | 70–90 min | ≥3 parts | ≥2 parts |
| `ai-application-lab` | 4 | 5 | 60–75 min | ≥2 parts | ≥2 parts |

**New lessons (optional Phase 2):** `llms-and-nlp/tokenization-and-context`, `mlops-and-deployment/feature-stores-online`, `ai-agents/multi-agent-orchestration` — only after 44 chapters hit interactive bar.

---

## Per-module plans (all 44 lessons)

### 1. Machine learning foundations (`ml-foundations`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **math-for-ml** | Add part: “Conditioning playground” with slider on feature scale | Distance geometry flowchart (KNN vs linear) | Expand NumPy PCA + condition number demo; slider for noise σ | Exercise: scale features, plot decision boundary |
| **classical-ml-algorithms** | Add part: bias–variance with plotted learning curves | Model family decision tree (linear / tree / kernel) | Runnable: train 3 estimators on same split; print metrics | Exercise: compare CV scores |
| **model-evaluation** | Add worked examples for nested CV + calibration | Train/val/test + leakage arrows | Runnable: simulate leakage vs proper split; print AUC gap | Exercise: fix leaky pipeline |

### 2. Deep learning (`deep-learning`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **neural-network-fundamentals** | Part: activation shapes (ReLU vs sigmoid) | Forward pass layer stack | Runnable: tiny MLP forward pass NumPy | Exercise: implement one layer |
| **cnn-and-computer-vision** | Part: receptive field arithmetic | CNN block diagram (conv → pool → FC) | Runnable: conv output size calculator | Exercise: manual conv on 5×5 |
| **transformer-architecture** | Part: complexity table (seq² vs linear) | Encoder–decoder + cross-attn | Runnable: attention weight matrix on toy tokens | Link to attention lab module |

### 3. LLMs and NLP (`llms-and-nlp`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **llm-fundamentals** | Part: decoding knobs (temp, top-p) | Prefill vs decode timeline | Runnable: toy sampling loop; compare temperatures | Exercise: decode sweep table |
| **fine-tuning-techniques** | Part: LoRA vs full FT cost | Adapter injection diagram | Runnable: param count comparison script | Exercise: PEFT-style mock matrices |
| **embeddings-and-vector-search** | Part: metric choice (cosine vs dot) | Embedding → ANN query path | Runnable: cosine similarity on 5 vectors | Exercise: nearest neighbor by hand |

### 4. Prompt engineering and RAG (`prompt-engineering-and-rag`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **prompt-engineering** | Part: JSON schema validation failures | Prompt layer stack (system/dev/user) | Runnable: `json.loads` + repair loop mock | Exercise: structured output parser |
| **rag-systems** | Extend ingest + query mermaid with failure overlays | **Have diagram** — add debug overlays | Runnable: chunk + retrieve toy index | Exercise: measure recall@k |
| **building-with-frameworks** | Part: thin orchestration vs heavy framework | App layers (API → orchestrator → tools) | Runnable: mock tool router in pure Python | Exercise: function-calling fixture |

### 5. AI agents (`ai-agents`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **agent-fundamentals** | Part: planner vs ReAct tradeoffs | Agent loop (plan → act → observe) | Runnable: state machine simulator | Exercise: step trace log |
| **tool-use-and-function-calling** | Part: schema validation | Tool routing diagram | Runnable: `mock_search` + `mock_sql` fixtures | Exercise: tool selection from JSON |
| **agent-evaluation-and-safety** | Part: red-team categories | Eval harness flow | Runnable: score trajectory against rubric | Exercise: pass/fail gate |

### 6. MLOps and deployment (`mlops-and-deployment`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **ml-pipeline-design** | Part: artifact lineage | Pipeline DAG (data → train → register) | Runnable: mock metadata dict walk | Exercise: pipeline stage checklist |
| **model-serving** | Part: batch vs online SLO table | Serving paths (sync, stream, batch) | Runnable: latency budget calculator | Exercise: p99 budget script |
| **monitoring-and-observability** | Part: alert design | Drift → alert → rollback | Runnable: simulate PSI threshold | Exercise: drift flag on toy data |

### 7. AI safety and ethics (`ai-safety-and-ethics`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **bias-and-fairness** | Part: subgroup metrics | Fairness workflow diagram | Runnable: compute TPR gap on synthetic groups | Exercise: threshold sweep |
| **explainability** | Part: local vs global | SHAP-style intuition diagram | Runnable: linear coefficients as explanation | Exercise: permutation importance toy |
| **ai-governance** | Part: model card fields | Governance RACI flow | Runnable: fill model card template dict | Design drill in practice IDE |

### 8. Data engineering for ML (`data-engineering-for-ml`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **data-pipelines-at-scale** | Add 6th part: backfill vs streaming | Ingest → feature store → train | Runnable: batch window aggregator | Exercise: idempotent job key |
| **dataset-management** | Add 6th part: consent + retention | Version lineage diagram | Runnable: dataset manifest hasher | Exercise: train/serve skew check |

### 9. AI application architecture lab (`ai-application-lab`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **chat-api-and-streaming** | Add 5th part: cancellation + reconnect | SSE timeline diagram | Runnable: latency stack (existing) + token cadence | Exercise: stream chunk parser |
| **multi-tenant-rag-products** | Tenant isolation mermaid (have) — add ACL path | **Have diagram** — add query filter overlay | Runnable: tenant filter on mock index | Exercise: ACL unit test |
| **shipping-ai-features** | Add 5th part: incident runbook | Ship gates (shadow → canary → full) | Runnable: gate checklist scorer | Practice: deploy sketch step |

### 10. Interactive machine learning lab (`ml-interactive-lab`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **feature-engineering-playground** | Add runnable part per scaling/encoding topic | Feature pipeline flow | Runnable: StandardScaler before/after distances | **Primary** — all 3 exercises |
| **supervised-learning-workshop** | Add decision boundary plots in chapter | Train/validate loop | Runnable: fit + plot on 2D synthetic | Exercise: metric comparison |
| **unsupervised-learning-workshop** | Add cluster silhouette intuition | K-means steps diagram | Runnable: k sweep + inertia plot | Exercise: pick k |

### 11. Deep learning from scratch (`deep-learning-from-scratch`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **perceptron-and-mlp-numpy** | Part: XOR failure of single layer | MLP layer diagram | Runnable: perceptron step updates | Exercise: train XOR MLP |
| **backpropagation-by-hand** | Part: chain rule on tiny graph | Computation graph | Runnable: manual grad on 2-layer net | Exercise: numeric grad check |
| **cnn-building-blocks-numpy** | Part: im2col intuition | Conv receptive field | Runnable: conv forward NumPy only | Exercise: output shape calc |

### 12. Transformers and attention lab (`transformers-attention-lab`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **attention-from-scratch** | Part: softmax temperature | Q/K/V attention map | Runnable: attention matrix heatmap data | Exercise: scaled dot-product |
| **multi-head-and-blocks** | Part: residual + norm order | Multi-head split/merge | Runnable: multi-head on toy sequence | Exercise: block forward pass |
| **positional-encoding-and-causal-mask** | Part: KV-cache step table | Causal mask diagram | Runnable: mask + position enc demo | Exercise: masked attention |

### 13. LLM systems and retrieval lab (`llm-retrieval-lab`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **tokenization-workshop** | Add 6th part: BPE intuition | Tokenizer pipeline | Runnable: char vs word token counts | Exercise: chunk length budget |
| **embeddings-and-similarity-lab** | Add 6th part: hybrid retrieval | Embed + BM25 hybrid diagram | Runnable: cosine + keyword score blend | Exercise: hybrid ranker |
| **rag-evaluation-workshop** | Add 6th part: human eval rubric | RAG eval harness | Runnable: `score_rag()` on gold rows | Exercise: pass/fail gate |

### 14. ML production systems lab (`ml-production-lab`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **leakage-safe-pipelines** | Add 6th part: time-split rules | Leakage paths diagram | Runnable: leaky vs safe CV | Exercise: fix pipeline |
| **drift-and-monitoring-lab** | Add 6th part: alert thresholds | Monitor → page diagram | Runnable: PSI on shifted sample | Exercise: alert when PSI > τ |
| **serving-contracts-lab** | Add 6th part: schema versioning | Request/response contract | Runnable: validate JSON schema | Exercise: breaking change detect |

### 15. LLMOps and evaluation lab (`llmops-eval-lab`)

| Lesson | Chapter extensions | Interactive diagram | Runnable demo / code | Python lab tie-in |
|--------|-------------------|---------------------|----------------------|-------------------|
| **llm-evaluation-harness** | Add 6th part: regression suite | Eval CI diagram | Runnable: golden file diff scorer | Exercise: harness pass/fail UI |
| **cost-latency-and-observability** | Add 6th part: cost cap policy | Cost/latency Pareto sketch | Runnable: $/1k tokens calculator | Exercise: budget guard |
| **shipping-gates-and-guardrails** | Add 6th part: rollback triggers | Gate sequence diagram | Runnable: policy gate simulator | Exercise: block on jailbreak fixture |

---

## Content authoring workflow

1. **Platform** — ship P.1–P.6 so authors can use demos, fixtures, and gates.
2. **Pilot module** — complete `ml-interactive-lab` + `prompt-engineering-and-rag/rag-systems` end-to-end (reference quality).
3. **Wave 1** — `llm-retrieval-lab`, `transformers-attention-lab`, `ai-agents` (highest traffic).
4. **Wave 2** — core 8 modules (fill runnable + mermaid gaps).
5. **Wave 3** — `ml-production-lab`, `llmops-eval-lab`, `ai-application-lab` polish.
6. **Tests + docs** — update `learn-chapter-reader.md`, `docs/cursor/data.mdc`, course tests.

**Definition of done (per lesson):** Learn chapter has ≥2 Mermaid parts OR 1 Mermaid + 1 topic-lab diagram; ≥3 parts with `workedExample.code`; `wrapUp.nextSteps` ≥2 links; topic lab mermaid aligned with Learn; Python lab exercises referenced in chapter.

---

## Execution order (sprints)

| Sprint | Scope | Lessons touched |
|--------|--------|-----------------|
| **I1** | Platform P.1–P.4 | — |
| **I2** | Pilot: `ml-interactive-lab` (3) + `rag-systems` | 4 |
| **I3** | Wave 1 labs + agents | 12 |
| **I4** | Wave 2 core 8 modules | 22 |
| **I5** | Wave 3 production + app lab | 9 |
| **I6** | P.5–P.7, tests, optional new lessons | +0–3 |

**Gate each sprint:** `npm test`, `npm run check`, manual Learn open → run code → follow `nextSteps` to Python lab on 3 sample lessons.

---

## Related docs

- [`learn-chapter-reader.md`](learn-chapter-reader.md) — reader UX and schema
- [`ai-engineer-update-plan.md`](ai-engineer-update-plan.md) — broader AI track roadmap (Phases A–F)
- Data paths: `src/lib/data/learnChapters/*.js`, `src/lib/components/LessonLearnReader.svelte`
