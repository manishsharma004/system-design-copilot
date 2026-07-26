/**
 * Mid-2026 industry-currency patches for AI Engineer lessons.
 *
 * Keys are lesson ids: `${moduleSlug}/${lessonSlug}`.
 * `applyAiIndustryCurrencyPatches` deep-merges patch fields onto matching lessons:
 * - replaces `whyItMatters` when provided
 * - appends `sectionsAppend` (skips headings already present)
 * - appends checklist/pitfalls/interviewPrompts (exact-string dedupe)
 * - appends `exercisesAppend` (dedupe by exercise id when present)
 *
 * Code examples and coding exercises are Pyodide-safe (numpy/pandas/matplotlib/sklearn).
 */

const code = (lines) => lines.join('\n');

function appendUniqueStrings(existing, additions) {
  const base = Array.isArray(existing) ? existing.slice() : [];
  const seen = new Set(base);
  for (const item of additions || []) {
    if (typeof item !== 'string' || seen.has(item)) continue;
    seen.add(item);
    base.push(item);
  }
  return base;
}

function appendUniqueSections(existing, additions) {
  const base = Array.isArray(existing) ? existing.slice() : [];
  const headings = new Set(base.map((s) => s && s.heading).filter(Boolean));
  for (const section of additions || []) {
    if (!section || !section.heading || headings.has(section.heading)) continue;
    headings.add(section.heading);
    base.push(section);
  }
  return base;
}

function appendUniqueExercises(existing, additions) {
  const base = Array.isArray(existing) ? existing.slice() : [];
  const ids = new Set(base.map((e) => e && e.id).filter(Boolean));
  const titles = new Set(base.map((e) => e && e.title).filter(Boolean));
  for (const exercise of additions || []) {
    if (!exercise) continue;
    if (exercise.id && ids.has(exercise.id)) continue;
    if (exercise.title && titles.has(exercise.title)) continue;
    if (exercise.id) ids.add(exercise.id);
    if (exercise.title) titles.add(exercise.title);
    base.push(exercise);
  }
  return base;
}

export const aiIndustryCurrencyPatches = {
  'llms-and-nlp/llm-fundamentals': {
    whyItMatters:
      'By mid-2026, shipping LLM features means choosing among frontier APIs, open-weight engines, and reasoning-optimized models—then controlling structured outputs, multimodal inputs, cost/latency SLOs, and provider deprecation risk. Interviewers expect systems thinking, not only next-token intuition.',
    sectionsAppend: [
      {
        heading: 'Frontier APIs, open-weight engines, and reasoning models in 2026',
        body:
          'The practical model landscape now splits along operational axes, not just parameter counts. Frontier hosted models still lead on hard reasoning, tool use, and multimodal fluency when you need rapid product iteration without owning GPUs. Open-weight models (Llama-class, Mistral-class, Qwen-class, and peers) win when you need data residency, predictable unit economics at high volume, deep customization, or air-gapped deployment—usually behind an inference stack that exposes an OpenAI-compatible API. Separately, reasoning or extended-thinking models allocate extra test-time compute: they produce longer internal traces before answering, which can raise accuracy on math, planning, and multi-step tools while blowing up latency and token bills. Classic chat models remain better for low-latency classification, extraction, and drafting when you already constrain the task. Multimodal inputs (images, PDFs, sometimes audio) are mainstream product requirements; treat pixels and pages as untrusted content with the same injection risks as web text. Structured output modes—JSON schema / constrained decoding—are no longer optional polish: they are how you keep parsers deterministic. Finally, provider deprecation is an ops risk: model IDs disappear, defaults change, and silent quality shifts break evals. Pin aliases, keep golden prompts, and design a two-provider escape hatch before traffic depends on one SKU.',
        bullets: [
          'Choose frontier vs open-weight by residency, cost curve, customization, and ops ownership—not brand loyalty.',
          'Treat reasoning/extended-thinking models as a latency/cost dial distinct from classic chat models.',
          'Require schema-constrained outputs for machine-consumed responses; pin model aliases against deprecation.',
          'Multimodal bytes are untrusted inputs; apply the same injection and PII controls as text.'
        ],
        codeExample: {
          title: 'Toy cost/latency scorecard for model routing',
          language: 'python',
          code: code([
            "import pandas as pd",
            "",
            "rows = [",
            "    {'model': 'frontier_chat', 'mode': 'chat', 'cost_per_1k': 0.008, 'p95_ms': 900, 'schema_ok': 0.96},",
            "    {'model': 'frontier_reason', 'mode': 'reason', 'cost_per_1k': 0.04, 'p95_ms': 4500, 'schema_ok': 0.98},",
            "    {'model': 'openweight_chat', 'mode': 'chat', 'cost_per_1k': 0.0015, 'p95_ms': 700, 'schema_ok': 0.93},",
            "]",
            "df = pd.DataFrame(rows)",
            "df['utility'] = df['schema_ok'] / (df['cost_per_1k'] * (df['p95_ms'] / 1000))",
            "print(df.sort_values('utility', ascending=False).round(3).to_string(index=False))"
          ])
        }
      }
    ],
    checklistAppend: [
      'Can contrast frontier APIs vs self-hosted open-weight serving for a concrete product constraint.',
      'Knows when extended-thinking/reasoning models justify higher latency and token cost.',
      'Plans for model alias pinning and provider deprecation.',
      'Uses structured-output / JSON-schema modes for machine-parsed responses.'
    ],
    pitfallsAppend: [
      'Defaulting every task to a reasoning model and missing latency budgets.',
      'Assuming open-weight deployment is free because weights are downloadable.',
      'Shipping without a pinned model alias and a golden eval for silent provider changes.'
    ],
    interviewPromptsAppend: [
      'How would you decide between a frontier chat model, a reasoning model, and a self-hosted open-weight model for invoice extraction?',
      'Design a structured-output pipeline that stays reliable when the provider deprecates your model ID.',
      'What offline evals and online SLOs would you use to compare cost, latency, and quality across two LLM vendors in 2026?',
      'How do multimodal PDF inputs change your threat model versus plain text chat?'
    ],
    exercisesAppend: [
      {
        id: 'model-routing-scorecard-2026',
        title: 'Build a model routing scorecard',
        difficulty: 'intermediate',
        type: 'coding',
        description:
          'Given toy per-model cost, p95 latency, and schema validity rates, compute a utility score and pick a default plus a fallback.',
        starterCode: code([
          'import pandas as pd',
          '',
          'df = pd.DataFrame([',
          "    {'model': 'A_chat', 'cost_per_1k': 0.01, 'p95_ms': 800, 'schema_ok': 0.95},",
          "    {'model': 'B_reason', 'cost_per_1k': 0.05, 'p95_ms': 5000, 'schema_ok': 0.99},",
          "    {'model': 'C_open', 'cost_per_1k': 0.002, 'p95_ms': 1000, 'schema_ok': 0.9},",
          '])',
          '',
          'def rank(df):',
          '    # TODO: utility = schema_ok / (cost_per_1k * p95_seconds)',
          '    # return df sorted by utility descending',
          '    pass',
          '',
          'print(rank(df))'
        ]),
        solution: code([
          'import pandas as pd',
          '',
          'df = pd.DataFrame([',
          "    {'model': 'A_chat', 'cost_per_1k': 0.01, 'p95_ms': 800, 'schema_ok': 0.95},",
          "    {'model': 'B_reason', 'cost_per_1k': 0.05, 'p95_ms': 5000, 'schema_ok': 0.99},",
          "    {'model': 'C_open', 'cost_per_1k': 0.002, 'p95_ms': 1000, 'schema_ok': 0.9},",
          '])',
          '',
          'def rank(df):',
          '    out = df.copy()',
          "    out['utility'] = out['schema_ok'] / (out['cost_per_1k'] * (out['p95_ms'] / 1000.0))",
          "    return out.sort_values('utility', ascending=False).reset_index(drop=True)",
          '',
          'print(rank(df))'
        ]),
        hints: [
          'Convert p95_ms to seconds before multiplying',
          'Higher schema_ok and lower cost/latency should increase utility',
          'Sort descending and keep the original columns'
        ],
        expectedOutput: 'DataFrame ranked by utility with C_open or A_chat near the top depending on formula'
      }
    ]
  },

  'llms-and-nlp/fine-tuning-techniques': {
    whyItMatters:
      'Adaptation in 2026 is a ladder—prompting, RAG, LoRA/QLoRA, continued pretraining, then preference optimization—not a single fine-tune button. Choosing the wrong rung wastes GPU budget and can regress safety or general instruction following.',
    sectionsAppend: [
      {
        heading: 'The adaptation ladder: prompt, RAG, LoRA, continued pretraining, preferences',
        body:
          'Treat specialization as an escalation path with explicit exit criteria. Start with prompts and tools: cheapest to iterate, easiest to roll back. Move to RAG when the failure is missing or stale private knowledge rather than style or schema adherence. Reach for LoRA/QLoRA when you need consistent formats, domain tone, or latency wins from a smaller specialized model and you already have clean instruction pairs. Continued pretraining (domain-adaptive pretraining on raw corpora) is a heavier step for language/distribution shift—legal, biomedical, or multilingual corpora—before instruction tuning; it is not a substitute for retrieval of facts that change weekly. Preference optimization (DPO-style and relatives) sits after supervised fine-tuning: given preferred vs rejected responses, the model learns a ranking signal without a full RLHF stack. Conceptually, you are shaping the policy toward human (or AI) preferences on pairwise data; you still need SFT competence first, and you must watch for reward hacking on verbosity or sycophancy. Synthetic data can multiply volume, but quality risks dominate: teacher-model biases, duplicated templates, contaminated evals, and fluent nonsense. Filter with rubrics, dedupe embeddings, hold out human gold sets, and always measure regressions on general assistants plus safety suites—not only the domain win rate.',
        bullets: [
          'Escalate prompt → RAG → PEFT → continued pretraining only when the prior rung fails measured gates.',
          'DPO-style preference optimization is pairwise policy shaping after SFT, not a magic alignment layer.',
          'Synthetic data needs dedupe, rubrics, and untouched human gold evals to avoid self-congratulation.',
          'Track catastrophic forgetting and safety regressions whenever you train adapters.'
        ],
        codeExample: {
          title: 'Gate the adaptation ladder with offline scores',
          language: 'python',
          code: code([
            "def choose_rung(prompt_score, rag_recall, peft_gain, data_rows):",
            "    if prompt_score >= 0.9:",
            "        return 'ship_prompt'",
            "    if rag_recall is not None and rag_recall < 0.7:",
            "        return 'fix_retrieval_before_training'",
            "    if data_rows < 500:",
            "        return 'collect_data_or_stay_on_rag'",
            "    if peft_gain >= 0.05:",
            "        return 'train_lora'",
            "    return 'prefer_rag_or_prompt_iteration'",
            "",
            "print(choose_rung(0.72, 0.55, 0.0, 200))",
            "print(choose_rung(0.72, 0.88, 0.08, 2000))"
          ])
        }
      }
    ],
    checklistAppend: [
      'Can explain when RAG is preferable to LoRA for rapidly changing facts.',
      'Describes DPO-style preference data at a conceptual level (chosen vs rejected).',
      'Lists synthetic-data failure modes and gold-set protections.'
    ],
    pitfallsAppend: [
      'Fine-tuning to paper over a broken retrieval stack.',
      'Training on synthetic data that duplicates the eval set.',
      'Skipping general-capability and safety regressions after preference optimization.'
    ],
    interviewPromptsAppend: [
      'Walk through prompt → RAG → LoRA → continued pretraining for an internal policy assistant and justify each stop.',
      'How does DPO-style preference optimization differ from supervised fine-tuning conceptually?',
      'What quality controls would you put on synthetic instruction data before QLoRA?'
    ],
    exercisesAppend: [
      {
        id: 'adaptation-ladder-gate-2026',
        title: 'Implement adaptation ladder gates',
        difficulty: 'beginner',
        type: 'coding',
        description: 'Write a function that returns the next recommended adaptation rung given offline metrics.',
        starterCode: code([
          'def next_rung(prompt_f1, rag_recall, n_labeled):',
          '    # TODO: if prompt_f1 >= 0.9 -> ship_prompt',
          '    # if rag_recall < 0.75 -> improve_rag',
          '    # if n_labeled < 800 -> collect_labels',
          '    # else -> try_lora',
          '    pass',
          '',
          'print(next_rung(0.91, 0.5, 100))',
          'print(next_rung(0.7, 0.6, 100))',
          'print(next_rung(0.7, 0.8, 100))',
          'print(next_rung(0.7, 0.8, 1000))'
        ]),
        solution: code([
          'def next_rung(prompt_f1, rag_recall, n_labeled):',
          '    if prompt_f1 >= 0.9:',
          "        return 'ship_prompt'",
          '    if rag_recall < 0.75:',
          "        return 'improve_rag'",
          '    if n_labeled < 800:',
          "        return 'collect_labels'",
          "    return 'try_lora'",
          '',
          'print(next_rung(0.91, 0.5, 100))',
          'print(next_rung(0.7, 0.6, 100))',
          'print(next_rung(0.7, 0.8, 100))',
          'print(next_rung(0.7, 0.8, 1000))'
        ]),
        hints: [
          'Check prompt success before anything else',
          'Low recall means retrieval work, not training',
          'Need enough labels before LoRA'
        ],
        expectedOutput: 'ship_prompt / improve_rag / collect_labels / try_lora'
      }
    ]
  },

  'llms-and-nlp/embeddings-and-vector-search': {
    whyItMatters:
      'Production retrieval in 2026 is hybrid by default: BM25 for exact tokens, dense vectors for paraphrase, cross-encoders for precision, and an explicit migration playbook when embedding models change. Dimensionality and Matryoshka-style truncations are cost levers, not afterthoughts.',
    sectionsAppend: [
      {
        heading: 'Hybrid search, rerankers, Matryoshka tradeoffs, and embedding migrations',
        body:
          'Dense retrieval alone still blurs SKUs, error codes, and rare proper nouns; BM25 (and other lexical indexes) still win on exactness. A 2026-default stack retrieves a union or fused shortlist from lexical and dense indexes—often via reciprocal rank fusion—then applies a cross-encoder reranker that scores full query-document pairs for precision. Rerankers are slower and usually limited to top 20–100 candidates; they are not a replacement for first-stage recall. Matryoshka Representation Learning and similar embedding designs let you train (or select) vectors that remain useful when truncated to fewer dimensions: store 768-d, serve 256-d for cheap ANN, and only use full width for hard queries. The tradeoff is recall vs memory/latency; measure on your corpus, not vendor slides. Embedding model migration is a release, not a config flip: dual-write or dual-read indexes, backfill by tenant/shard, compare recall@k and downstream groundedness on a frozen golden set, then cut traffic with a kill switch. Version embedder id, chunker id, and index build id in every vector’s metadata so you can explain why yesterday’s neighbors moved. Without that playbook, “we upgraded the embedder” becomes a silent relevance regression.',
        bullets: [
          'Hybrid first-stage (BM25 + dense) plus cross-encoder rerank is the common production pattern.',
          'Matryoshka-style shorter vectors trade recall for memory and QPS—validate on your queries.',
          'Treat embedding upgrades as migrations with dual indexes, golden recall, and metadata versioning.',
          'Rerankers improve precision on shortlists; they cannot fix catastrophic first-stage misses.'
        ],
        codeExample: {
          title: 'Simulate Matryoshka truncation vs recall proxy',
          language: 'python',
          code: code([
            'import numpy as np',
            '',
            'rng = np.random.default_rng(0)',
            'docs = rng.normal(size=(200, 128))',
            'docs /= np.linalg.norm(docs, axis=1, keepdims=True)',
            'q = docs[0].copy()',
            '',
            'def recall_at_k(mat, query, truth=0, k=10):',
            '    scores = mat @ query',
            '    top = np.argsort(-scores)[:k]',
            '    return float(truth in top)',
            '',
            'for d in [128, 64, 32, 16]:',
            '    m = docs[:, :d]',
            '    m = m / np.linalg.norm(m, axis=1, keepdims=True)',
            '    qq = q[:d] / np.linalg.norm(q[:d])',
            '    print(d, recall_at_k(m, qq))'
          ])
        }
      }
    ],
    checklistAppend: [
      'Can design BM25 + dense fusion with a cross-encoder rerank stage.',
      'Explains dimensionality/Matryoshka tradeoffs in product terms.',
      'Has a step-by-step embedding model migration plan.'
    ],
    pitfallsAppend: [
      'Reranking a candidate set that already missed the relevant chunk.',
      'Cutting embedding dimensions in production without measuring recall.',
      'Replacing an embedder in place without dual-index backfill.'
    ],
    interviewPromptsAppend: [
      'Design hybrid retrieval for a corpus with many SKU identifiers and paraphrased how-to questions.',
      'How would you migrate 50M vectors to a new embedding model with less than an hour of relevance downtime?',
      'When would you truncate Matryoshka vectors to 256-d at serve time?'
    ]
  },

  'prompt-engineering-and-rag/prompt-engineering': {
    whyItMatters:
      'Prompting in 2026 is an engineering discipline: role separation, cache-aware prompt layouts, schema-enforced outputs, and eval-driven iteration. Long chain-of-thought prompting is not the same control surface as built-in reasoning/extended-thinking models.',
    sectionsAppend: [
      {
        heading: 'Roles, prompt caching, structured outputs, and eval-driven iteration',
        body:
          'Modern APIs expose distinct message roles—system, developer/policy, and user—and sometimes tool results as their own channels. Put durable policy, safety, and output contracts in the highest-privilege roles; put untrusted user and retrieved content in lower-privilege roles and never let retrieved HTML silently become system instructions. Prompt caching / prefix caching changes economics: stable prefixes (policies, long tool schemas, large static manuals) can be reused across requests so you pay full price mainly for the dynamic suffix. That pushes you to structure prompts with a large immutable head and a thin per-request tail—opposite of constantly rewriting the entire system prompt. Structured output enforcement (JSON schema, constrained decoding, or grammar-guided generation) should be the default for machine-consumed answers; free-form prose is for humans. Iterate prompts like code: golden sets, slice metrics (language, tenant, document type), shadow traffic, and change budgets. Important distinction for interviews: asking a classic chat model to “think step by step” in the visible prompt is not identical to routing to a reasoning model that spends hidden test-time compute. Visible CoT can help some tasks but leaks process text, adds tokens, and is a weaker, less controllable knob than provider reasoning modes with explicit effort settings. Choose the mechanism that matches your latency, audit, and accuracy needs.',
        bullets: [
          'Separate system/developer policy from untrusted user and retrieved content.',
          'Design cache-friendly stable prefixes to cut repeated token spend.',
          'Enforce schemas for machine-parsed outputs; evaluate prompts with golden sets.',
          'Do not conflate long visible CoT prompting with built-in reasoning/extended-thinking models.'
        ],
        codeExample: {
          title: 'Estimate prompt-cache savings on a stable prefix',
          language: 'python',
          code: code([
            'def monthly_cost(requests, prefix_tokens, suffix_tokens, price_per_1k, cache_hit_rate, cached_price_factor=0.1):',
            '    full = (prefix_tokens + suffix_tokens) / 1000.0 * price_per_1k',
            '    cached = (prefix_tokens / 1000.0 * price_per_1k * cached_price_factor) + (suffix_tokens / 1000.0 * price_per_1k)',
            '    per_req = (1 - cache_hit_rate) * full + cache_hit_rate * cached',
            '    return round(per_req * requests, 2)',
            '',
            'print("no cache", monthly_cost(200_000, 2500, 400, 0.01, 0.0))',
            'print("with cache", monthly_cost(200_000, 2500, 400, 0.01, 0.85))'
          ])
        }
      }
    ],
    checklistAppend: [
      'Structures prompts for privilege separation and cache-friendly prefixes.',
      'Uses schema enforcement plus golden-set iteration rather than vibe checks.',
      'Can explain visible CoT vs built-in reasoning models.'
    ],
    pitfallsAppend: [
      'Putting retrieved documents into the system role.',
      'Rewriting the entire prompt every request and defeating prefix caches.',
      'Assuming "think step by step" equals a reasoning-model product tier.'
    ],
    interviewPromptsAppend: [
      'How would you lay out system vs developer vs user content for a RAG app that must be prompt-injection resistant?',
      'Estimate when prompt caching pays for a 2k-token policy prefix at 1M requests/day.',
      'Compare eval-driven prompt changes to switching from a chat model to a reasoning model for multi-step tools.'
    ]
  },

  'prompt-engineering-and-rag/rag-systems': {
    whyItMatters:
      'Production RAG in 2026 is a staged system—ingest, chunk+metadata, hybrid retrieve, rerank, generate, cite/refuse—with failure attribution, optional graph augmentation, and hard multi-tenant ACL filters. Demos that skip these stages do not survive enterprise reviews.',
    sectionsAppend: [
      {
        heading: 'Production RAG stacks, GraphRAG paths, failure attribution, and tenant ACLs',
        body:
          'A durable RAG architecture is a pipeline with owned stages. Ingest normalizes source systems, strips boilerplate, and records provenance. Chunking emits passages plus metadata (source, section, timestamps, access labels, language). Hybrid retrieval pulls lexical and dense candidates; a reranker tightens precision; generation must cite evidence or refuse when support is weak. GraphRAG and knowledge-graph patterns are an optional advanced path: extract entities/relations, retrieve subgraphs for multi-hop questions (“which vendor shares a parent with X?”), then verbalize graph context into the prompt. Use graphs when relationships matter more than passage similarity; do not add graph ETL for FAQ lookup. Failure attribution is how you debug: label misses as parse/chunk, retrieve, rerank, context packing, or generation/faithfulness—then fix the guilty stage. Multi-tenant ACL filtering is non-negotiable: filters must run as prefilters (or cryptographically equivalent constrained retrieval) so vectors from Tenant A never enter Tenant B’s shortlist. Post-filtering after ANN can leak via scores or side channels if misimplemented; prefer index partitioning or mandatory metadata predicates enforced in the retrieval engine. Log chunk ids used, not raw documents, and keep delete/reindex paths for retention law.',
        bullets: [
          'Own the full stack: ingest → chunk/metadata → hybrid retrieve → rerank → generate → cite/refuse.',
          'Treat GraphRAG as an optional multi-hop path, not the default for every corpus.',
          'Attribute quality failures to a stage before changing prompts or models.',
          'Enforce tenant ACLs inside retrieval, not only in the final prompt assembly.'
        ],
        codeExample: {
          title: 'Attribute RAG failures to pipeline stages',
          language: 'python',
          code: code([
            'def attribute(case):',
            "    if case['relevant_in_index'] is False:",
            "        return 'ingest_or_chunk'",
            "    if case['recall_at_k'] < 1.0:",
            "        return 'retrieve'",
            "    if case['relevant_in_rerank_top'] is False:",
            "        return 'rerank'",
            "    if case['cited_support'] is False:",
            "        return 'generate_or_prompt'",
            "    return 'ok'",
            '',
            'cases = [',
            "    {'relevant_in_index': False, 'recall_at_k': 0.0, 'relevant_in_rerank_top': False, 'cited_support': False},",
            "    {'relevant_in_index': True, 'recall_at_k': 0.0, 'relevant_in_rerank_top': False, 'cited_support': False},",
            "    {'relevant_in_index': True, 'recall_at_k': 1.0, 'relevant_in_rerank_top': True, 'cited_support': False},",
            ']',
            'print([attribute(c) for c in cases])'
          ])
        }
      }
    ],
    checklistAppend: [
      'Can draw the production RAG stage diagram including cite/refuse.',
      'Knows when GraphRAG-style structure helps multi-hop questions.',
      'Implements tenant ACL filtering at retrieval time.'
    ],
    pitfallsAppend: [
      'Prompt-tuning a generator when recall@k is the real failure.',
      'Adding a knowledge graph before hybrid retrieval is solid.',
      'Applying tenant filters only after fetching foreign vectors into memory.'
    ],
    interviewPromptsAppend: [
      'Describe a production RAG stack and how you would attribute a wrong answer to a stage.',
      'When would you invest in GraphRAG versus improving hybrid chunk retrieval?',
      'How do you enforce multi-tenant document ACLs in vector search?'
    ],
    exercisesAppend: [
      {
        id: 'rag-failure-attribution-2026',
        title: 'Classify RAG failure stages',
        difficulty: 'beginner',
        type: 'coding',
        description: 'Implement stage attribution for a list of offline RAG case dicts.',
        starterCode: code([
          'def attribute(case):',
          '    # TODO: ingest_or_chunk / retrieve / rerank / generate_or_prompt / ok',
          '    pass',
          '',
          "print(attribute({'relevant_in_index': True, 'recall_at_k': 1.0, 'relevant_in_rerank_top': False, 'cited_support': False}))"
        ]),
        solution: code([
          'def attribute(case):',
          "    if case['relevant_in_index'] is False:",
          "        return 'ingest_or_chunk'",
          "    if case['recall_at_k'] < 1.0:",
          "        return 'retrieve'",
          "    if case['relevant_in_rerank_top'] is False:",
          "        return 'rerank'",
          "    if case['cited_support'] is False:",
          "        return 'generate_or_prompt'",
          "    return 'ok'",
          '',
          "print(attribute({'relevant_in_index': True, 'recall_at_k': 1.0, 'relevant_in_rerank_top': False, 'cited_support': False}))"
        ]),
        hints: [
          'Check index presence before recall',
          'Rerank only matters if retrieve succeeded',
          'Faithfulness is last'
        ],
        expectedOutput: 'rerank'
      }
    ]
  },

  'prompt-engineering-and-rag/building-with-frameworks': {
    whyItMatters:
      'Framework gravity is strong in 2026, but durable LLM apps keep orchestration thin, state explicit (LangGraph-style), business logic in testable pure functions, and tool/context wiring behind clear contracts—MCP-style—rather than a single mega-framework.',
    sectionsAppend: [
      {
        heading: 'Thin orchestration, explicit graphs, pure functions, and MCP-style contracts',
        body:
          'Heavy frameworks accelerate demos; they also hide control flow, freeze dependency versions, and make unit tests awkward. Prefer thin orchestration: your code owns the graph of steps, retries, and budgets; libraries provide model clients, vector I/O, and tracers. LangGraph-style explicit state machines (and similar graph runners) are popular because nodes are named, edges are reviewable, and persistence/checkpointing maps to durable workflows—closer to Temporal-style thinking than to an unbounded “agent loop” string. Keep nodes as wrappers around pure functions: `retrieve(query, tenant) -> chunks`, `rerank(query, chunks) -> chunks`, `draft(prompt) -> text`, `validate(text, schema) -> result`. Pure functions are what you property-test in CI without spinning a model. Model Context Protocol (MCP) emerged as a contract idea for exposing tools and contextual resources to assistants: a host discovers typed capabilities (tools/resources/prompts) from servers over a standard session, rather than hard-coding one vendor’s plugin format. Teach the contract—discovery, schemas, permissions, transport—without requiring any particular SDK in this course. If you can swap MCP servers or plain HTTPS tools behind the same interface, you avoided framework lock-in. Choose a heavy framework only when it deletes complexity you measured; otherwise a few modules plus traces will outlive the fashion cycle.',
        bullets: [
          'Default to thin orchestration; justify heavy frameworks with concrete complexity they remove.',
          'Prefer explicit state-machine graphs over opaque chain classes for multi-step apps.',
          'Keep business logic in pure, testable functions behind I/O adapters.',
          'Treat MCP as a tool/context contract (discover, schema, authorize)—not a mandatory library.'
        ],
        codeExample: {
          title: 'Pure pipeline steps with a tiny explicit graph',
          language: 'python',
          code: code([
            'def retrieve(q):',
            "    return [c for c in ['alpha kv cache', 'beta dropout'] if any(w in c for w in q.split())]",
            '',
            'def answer(q, ctx):',
            "    return ctx[0] if ctx else 'refuse'",
            '',
            "GRAPH = ['retrieve', 'answer']",
            'state = {"q": "kv cache"}',
            'for node in GRAPH:',
            "    if node == 'retrieve':",
            "        state['ctx'] = retrieve(state['q'])",
            '    else:',
            "        state['out'] = answer(state['q'], state['ctx'])",
            'print(state)'
          ])
        }
      }
    ],
    checklistAppend: [
      'Can sketch an explicit state graph for a RAG+tools app without a framework.',
      'Separates pure logic from model/tool I/O for CI tests.',
      'Explains MCP-style tool discovery as a contract, not a product pitch.'
    ],
    pitfallsAppend: [
      'Business rules living only inside framework-specific runnable objects.',
      'Adopting a mega-framework for a one-prompt feature.',
      'Hard-wiring a single vendor plugin format with no tool contract layer.'
    ],
    interviewPromptsAppend: [
      'When would you pick a LangGraph-style state machine over a simple function pipeline?',
      'How would you design tool interfaces so MCP-style servers and plain HTTP tools are interchangeable?',
      'What do you unit test without calling a live LLM?'
    ]
  },

  'ai-agents/agent-fundamentals': {
    whyItMatters:
      'Agents are optional autonomy. In 2026 interviews, strong candidates explain when deterministic workflows beat agents, how approval gates bound risk, and why multi-agent coordination is a cost center unless specialization truly pays.',
    sectionsAppend: [
      {
        heading: 'When not to use agents: workflows, approvals, and multi-agent cost',
        body:
          'An agent earns its complexity only when the next action truly depends on model judgment under uncertainty. If the steps are known—authenticate, fetch account, compute refund eligibility, write ledger, notify—implement a deterministic workflow or explicit state machine with typed inputs. Autonomous loops (LLM chooses tools until a stop condition) add nondeterminism, spend variance, and failure modes that are hard to replay. Prefer workflow graphs with LLM nodes at narrow judgment points (classify intent, draft message) rather than letting the model own the whole control plane. Human approval gates belong before irreversible side effects: payments, emails to customers, production config changes, deleting data. Make approvals first-class states with timeouts and audit logs, not a prompt suggestion the model can ignore. Multi-agent designs (researcher/writer/reviewer, or planner/executor) help when specialization or independent verification reduces error enough to pay for coordination: extra tokens, race conditions, shared-memory bugs, and blame diffusion. If one well-tooled agent with a checklist outperforms a committee in your evals, ship the simpler system. Interview signal: say “we tried an agent and reverted to a workflow after measuring loop spend and flake rate,” not only “agents are the future.”',
        bullets: [
          'Default to deterministic workflows; add autonomy only at uncertain decision points.',
          'Use explicit graphs with budgets and stop conditions rather than unbounded loops.',
          'Require human approval states before destructive or externally visible actions.',
          'Adopt multi-agent designs only when specialization/verification beats coordination cost on evals.'
        ],
        codeExample: {
          title: 'Workflow vs autonomous loop cost sketch',
          language: 'python',
          code: code([
            'def workflow_cost(steps, tokens_per_step=300, price=0.01):',
            '    return steps * tokens_per_step / 1000.0 * price',
            '',
            'def agent_cost(max_loops, tokens_per_loop=1200, price=0.01, stop_at=None):',
            '    loops = stop_at if stop_at is not None else max_loops',
            '    return loops * tokens_per_loop / 1000.0 * price',
            '',
            'print("workflow", round(workflow_cost(4), 4))',
            'print("agent_avg", round(agent_cost(8, stop_at=5), 4))',
            'print("agent_worst", round(agent_cost(8), 4))'
          ])
        }
      }
    ],
    checklistAppend: [
      'Can name three product flows that should stay deterministic.',
      'Designs approval gates as states with audit trails.',
      'Justifies multi-agent coordination with measured gains.'
    ],
    pitfallsAppend: [
      'Wrapping a fixed ETL-like process in an autonomous agent loop.',
      'Letting the model self-approve refunds or emails.',
      'Adding agents for resume keywords without eval proof.'
    ],
    interviewPromptsAppend: [
      'When is an agent worse than a fixed workflow for customer support?',
      'Design human approval for an agent that can change DNS records.',
      'How do you decide whether a reviewer agent is worth the extra tokens?'
    ]
  },

  'ai-agents/tool-use-and-function-calling': {
    whyItMatters:
      'Tool use is production API design under adversarial inputs: typed contracts, idempotency, least privilege, destructive confirmations, discoverable catalogs (MCP-style), and offline contract tests that do not need a live model.',
    sectionsAppend: [
      {
        heading: 'Typed tool contracts, idempotency, least privilege, and MCP-style discovery',
        body:
          'Treat each tool as a public API the model can call under injection pressure. Specify JSON Schema (or equivalent) for arguments, reject unknown fields, coerce types carefully, and keep server-side authorization that ignores any “user is admin” string the model invents. Idempotency keys on mutating tools stop double refunds when the agent retries after a timeout; store request hash → result for a TTL. Least privilege means separate credentials per tool class: read-only CRM search must not share a token with wire-transfer. Destructive tools (delete, pay, page on-call) should require a confirmation artifact—second model check, human approval, or dual-control flag—before execution. MCP-style tool discovery is the emerging contract pattern: hosts list tools/resources from servers at session start, each with name, description, and schema, then invoke by stable name. Teaching point: whether or not you use MCP, your agent runtime needs a catalog, schemas, and permission scopes that can be audited. Offline contract tests bind sample argument objects to validators and stubbed side effects in CI; do not wait for an LLM to exercise refunds. Log tool name, latency, error class, and idempotency key for every call.',
        bullets: [
          'Schemas + server-side auth are mandatory; the model is not a security boundary.',
          'Idempotency keys make retries safe for payments and writes.',
          'Separate privileges and confirm destructive tools explicitly.',
          'Discoverable tool catalogs (MCP-style) plus offline contract tests keep systems evolvable.'
        ],
        codeExample: {
          title: 'Idempotent tool execution with a schema check',
          language: 'python',
          code: code([
            'STORE = {}',
            '',
            'def validate_refund(args):',
            "    if not isinstance(args.get('amount_cents'), int) or args['amount_cents'] <= 0:",
            "        raise ValueError('amount')",
            "    if 'account_id' not in args:",
            "        raise ValueError('account')",
            '    return args',
            '',
            'def refund(args, idem_key):',
            '    if idem_key in STORE:',
            '        return STORE[idem_key]',
            '    args = validate_refund(args)',
            "    result = {'status': 'ok', 'amount_cents': args['amount_cents']}",
            '    STORE[idem_key] = result',
            '    return result',
            '',
            "print(refund({'account_id': 'A1', 'amount_cents': 500}, 'k1'))",
            "print(refund({'account_id': 'A1', 'amount_cents': 500}, 'k1'))"
          ])
        }
      }
    ],
    checklistAppend: [
      'Defines schemas, authz, and idempotency for every mutating tool.',
      'Separates read vs write credentials and confirmation paths.',
      'Has CI contract tests that never call a live model.'
    ],
    pitfallsAppend: [
      'Trusting model-provided role or account ids without authz checks.',
      'Retrying payments without idempotency keys.',
      'Only testing tools through flaky full-agent transcripts.'
    ],
    interviewPromptsAppend: [
      'Design a refund tool with schema, authz, idempotency, and confirmation.',
      'How would MCP-style discovery change how you onboard a new internal API to an agent?',
      'What belongs in offline contract tests for function calling?'
    ],
    exercisesAppend: [
      {
        id: 'idempotent-tool-store-2026',
        title: 'Implement an idempotent tool store',
        difficulty: 'intermediate',
        type: 'coding',
        description: 'Validate args and return cached results for repeated idempotency keys.',
        starterCode: code([
          'STORE = {}',
          '',
          'def call_tool(args, idem_key):',
          '    # TODO: validate amount_cents > 0 and account_id present',
          '    # TODO: return cached result on repeat keys',
          '    pass',
          '',
          "print(call_tool({'account_id': 'A', 'amount_cents': 100}, 'x'))",
          "print(call_tool({'account_id': 'A', 'amount_cents': 100}, 'x'))"
        ]),
        solution: code([
          'STORE = {}',
          '',
          'def call_tool(args, idem_key):',
          '    if idem_key in STORE:',
          '        return STORE[idem_key]',
          "    if 'account_id' not in args:",
          "        raise ValueError('account_id')",
          "    if not isinstance(args.get('amount_cents'), int) or args['amount_cents'] <= 0:",
          "        raise ValueError('amount_cents')",
          "    result = {'ok': True, 'amount_cents': args['amount_cents']}",
          '    STORE[idem_key] = result',
          '    return result',
          '',
          "print(call_tool({'account_id': 'A', 'amount_cents': 100}, 'x'))",
          "print(call_tool({'account_id': 'A', 'amount_cents': 100}, 'x'))"
        ]),
        hints: [
          'Check the store before validating if you want same errors cached—here validate then store',
          'Reject non-positive amounts',
          'Return the exact same dict on replay'
        ],
        expectedOutput: 'Two identical ok results'
      }
    ]
  },

  'ai-agents/agent-evaluation-and-safety': {
    whyItMatters:
      'Agent quality is trajectory quality: tool-call correctness, injection resistance, and cost/loop budgets as SLOs—not only a final answer rubric. Mid-2026 teams that skip these ship demos that fail under adversarial or long-running use.',
    sectionsAppend: [
      {
        heading: 'Trajectory eval, tool correctness, injection red teams, and loop SLOs',
        body:
          'Evaluate agents as paths, not endpoints. A trajectory record includes messages, tool names, arguments, observations, latencies, and stop reasons. Score tool-call correctness separately from natural-language quality: wrong tool, missing required arg, hallucinated id, or skipped confirmation is a fail even if the final sentence looks helpful. Build golden trajectories for happy paths and for forced recovery (tool 500, empty search). LLM-as-judge can grade open-ended steps but needs blinded rubrics, spot-checked human agreement, and awareness of verbosity bias. Injection red teams are mandatory: direct (“ignore policies”), indirect (poisoned retrieved docs, malicious PDF text, tool-returned HTML), and confused-deputy cases where the model is tricked into calling privileged tools. Measure attack success rate and time-to-detect. Cost and loop budgets are first-class SLOs alongside task success: max tool calls, max tokens, max wall time, max spend per session; breach should stop the agent with a safe user message. Online, monitor tool error rate, repeat-tool thrash, approval bypass attempts, and spend per successful task. Ship gates: offline suite green, red-team below threshold, budgets enforced in the runtime—not only documented in a wiki.',
        bullets: [
          'Score trajectories and tool-call correctness, not only final answers.',
          'Red-team direct and indirect injection, including tool-returned content.',
          'Treat max loops/tokens/spend as SLOs enforced in the runtime.',
          'Combine golden trajectories, judges with human calibration, and online thrash metrics.'
        ],
        codeExample: {
          title: 'Score tool-call correctness on a trajectory',
          language: 'python',
          code: code([
            'def tool_score(trajectory, expected_calls):',
            "    got = [(t['name'], tuple(sorted(t['args'].items()))) for t in trajectory if t['type'] == 'tool']",
            "    exp = [(n, tuple(sorted(a.items()))) for n, a in expected_calls]",
            '    return got == exp',
            '',
            'traj = [',
            "    {'type': 'tool', 'name': 'search', 'args': {'q': 'invoice 9'}},",
            "    {'type': 'tool', 'name': 'refund', 'args': {'id': '9', 'cents': 500}},",
            ']',
            "print(tool_score(traj, [('search', {'q': 'invoice 9'}), ('refund', {'id': '9', 'cents': 500})]))",
            "print(tool_score(traj, [('refund', {'id': '9', 'cents': 500})]))"
          ])
        }
      }
    ],
    checklistAppend: [
      'Maintains golden trajectories with expected tool calls.',
      'Runs injection red teams on retrieved and tool-returned content.',
      'Enforces loop/token/spend budgets as runtime SLOs.'
    ],
    pitfallsAppend: [
      'Judging only the final message while tools did the wrong thing.',
      'No budget → infinite retry loops in production.',
      'Red-teaming only the system prompt and ignoring indirect injection.'
    ],
    interviewPromptsAppend: [
      'How would you evaluate an agent that can issue refunds using trajectory metrics?',
      'Design a red-team plan for indirect prompt injection via a knowledge base.',
      'Which cost and loop SLOs would you put on a production support agent?'
    ]
  },

  'mlops-and-deployment/model-serving': {
    whyItMatters:
      'LLM serving in 2026 is dominated by KV-cache behavior, continuous batching, prefill vs decode asymmetry, and the choice between managed APIs and open-weight engines behind gateways—with canary prompts and model aliases as release machinery.',
    sectionsAppend: [
      {
        heading: 'LLM serving realities: KV cache, batching, gateways, and aliases',
        body:
          'Classic sklearn/torch classifiers hide behind simple horizontal autoscaling; LLMs do not. Prefill processes the prompt in parallel and builds a KV cache; decode generates token-by-token while reading and appending to that cache. Time-to-first-token is mostly prefill; tokens-per-second is decode. Continuous batching (vLLM-class and similar engines) schedules many sequences in one GPU batch as they grow at different lengths, improving utilization versus naive one-request-per-batch serving. Memory is often bound by KV cache (layers × heads × sequence × width), so long contexts and concurrency fight each other. Quantization, paged attention, and prefix caching are standard levers. Many teams put an API gateway in front of open-weight engines to expose OpenAI-compatible routes, auth, rate limits, and routing—while other workloads stay on managed frontier APIs. Product code should call stable model aliases (`chat-strong`, `extract-fast`) that map to concrete revisions; canary prompts and eval suites run against candidates before alias flips. Deprecations and capacity events then become controlled cutovers instead of surprise regressions. Measure queue time, prefill ms, decode TPS, cache hit rate, and OOM kills—not only “GPU busy %.',
        bullets: [
          'Separate prefill (TTFT) from decode (TPS) when capacity planning.',
          'Continuous batching and KV-cache memory dominate open-weight serving economics.',
          'Use gateways + model aliases in front of engines; canary prompts before alias flips.',
          'Track cache hits, queue time, and OOM alongside generic GPU metrics.'
        ],
        codeExample: {
          title: 'Estimate KV-cache memory growth',
          language: 'python',
          code: code([
            'def kv_cache_gb(layers, heads, seq, head_dim, bytes_per=2, batch=1):',
            '    # K and V each store layers*batch*heads*seq*head_dim',
            '    elements = 2 * layers * batch * heads * seq * head_dim',
            '    return elements * bytes_per / (1024 ** 3)',
            '',
            'for seq in [2048, 8192, 32768]:',
            '    print(seq, round(kv_cache_gb(32, 32, seq, 128, batch=8), 2), "GiB")'
          ])
        }
      }
    ],
    checklistAppend: [
      'Can explain prefill vs decode and KV-cache memory scaling.',
      'Knows why continuous batching exists for LLM engines.',
      'Uses model aliases and canary prompts for cutovers.'
    ],
    pitfallsAppend: [
      'Autoscaling LLMs like stateless CPU microservices without cache awareness.',
      'Hard-coding provider model IDs in every client.',
      'Ignoring TTFT when optimizing only average latency.'
    ],
    interviewPromptsAppend: [
      'How does KV-cache size constrain concurrent long-context requests on one GPU?',
      'Compare calling a managed API versus a vLLM-class engine behind your own gateway.',
      'Design a canary + alias flip plan for upgrading a chat model.'
    ]
  },

  'mlops-and-deployment/monitoring-and-observability': {
    whyItMatters:
      'LLMOps monitoring complements classic ML drift: token cost, groundedness sampling, retrieval miss rate, and tool errors can tank a product while feature PSI stays flat. You need dashboards that separate traditional model decay from generative quality regressions.',
    sectionsAppend: [
      {
        heading: 'LLMOps dashboards vs classic ML drift',
        body:
          'Tabular model monitoring centers on feature distributions, prediction scores, and delayed labels. LLM applications fail differently: a prompt change, embedder upgrade, or provider model swap can collapse groundedness while every classic drift gauge stays green. Build LLMOps dashboards that track token spend and cache hit rate, latency split by prefill/decode or provider TTFT, retrieval miss rate / recall proxies on canary queries, groundedness or citation validity on sampled traffic, schema-validation failure rate, tool/function error rate, refusal rate, and user friction (reprompts, thumbs-down). Distinguish incident classes: data drift in an upstream ranker versus generative regression from a temperature or alias change. Sampling plans matter—you cannot LLM-judge 100% of traffic; use stratified samples by tenant and query type, plus always-on cheap heuristics (citation regex, JSON parse). Join traces across retrieve → rerank → generate → tools with a single request id. Alert on spend per successful task and on sudden jumps in “answer without citation,” not only on 5xx rates. Classic PSI still matters for embedded classifiers in the same product; keep both panes rather than replacing ML monitoring with chat logs.',
        bullets: [
          'Add token cost, groundedness samples, retrieval misses, and tool errors to the core dashboard.',
          'Separate classic feature/score drift from LLM quality regressions in runbooks.',
          'Use stratified sampling for expensive judges; keep cheap always-on parsers.',
          'Alert on spend-per-success and citation failures, not only HTTP errors.'
        ],
        codeExample: {
          title: 'Aggregate a tiny LLMOps metrics table',
          language: 'python',
          code: code([
            'import pandas as pd',
            '',
            'df = pd.DataFrame([',
            "    {'route': 'rag', 'tokens': 1200, 'grounded': 1, 'retrieve_hit': 1, 'tool_err': 0},",
            "    {'route': 'rag', 'tokens': 1800, 'grounded': 0, 'retrieve_hit': 0, 'tool_err': 0},",
            "    {'route': 'agent', 'tokens': 4000, 'grounded': 1, 'retrieve_hit': 1, 'tool_err': 1},",
            '])',
            'summary = df.groupby("route").agg(',
            '    avg_tokens=("tokens", "mean"),',
            '    grounded_rate=("grounded", "mean"),',
            '    retrieve_recall_proxy=("retrieve_hit", "mean"),',
            '    tool_error_rate=("tool_err", "mean"),',
            ')',
            'print(summary.round(3))'
          ])
        }
      }
    ],
    checklistAppend: [
      'Lists LLMOps metrics beyond HTTP and GPU utilization.',
      'Can tell a groundedness regression from tabular feature drift.',
      'Has a sampling strategy for judges and canaries.'
    ],
    pitfallsAppend: [
      'Assuming stable PSI means the RAG answers are still faithful.',
      'Logging prompts without PII controls.',
      'Alerting only on latency while token spend doubles.'
    ],
    interviewPromptsAppend: [
      'Design a dashboard for an LLM+RAG feature that pages the right owner.',
      'How do you distinguish classic ML drift from an LLM quality regression?',
      'What always-on metrics vs sampled judges would you use at 10M requests/day?'
    ]
  },

  'ai-safety-and-ethics/ai-governance': {
    whyItMatters:
      'Governance in 2026 is risk-tiered and operational: EU AI Act-style intuition (educational, not legal advice), model/system cards for LLM apps, audit logs for tool actions, and data residency constraints shape architecture as much as accuracy does.',
    sectionsAppend: [
      {
        heading: 'Risk-tiered governance, system cards, audit logs, and residency',
        body:
          'Regulators and enterprise buyers increasingly expect risk-tiered controls. Using EU AI Act-style intuition for education—not as legal advice—helps structure reviews: unacceptable-use categories (e.g., social scoring-like patterns) are blocked; high-risk decision systems need stronger documentation, human oversight, and quality management; limited-risk apps emphasize transparency (user knows they interact with AI); minimal-risk freer iteration still needs basic security and privacy hygiene. Map your product to a tier with counsel; engineering’s job is to make the tier real in code paths. For LLM apps, publish model cards and system cards: intended use, out-of-scope uses, evaluation summaries, known failure modes, tool permissions, and escalation paths. Audit logs for tool actions (who/what/when/why/idempotency key/approver) are evidence in incidents and compliance reviews. Data residency and cross-border processing constraints may force regional open-weight serving, regional indexes, and prompt/log storage rules—architecture must follow. Retention, deletion, and training-data opt-out commitments should connect to reindex and fine-tune invalidation runbooks. Governance that ends as a slide deck fails; governance that blocks a deploy when cards, evals, or audit sinks are missing actually protects users.',
        bullets: [
          'Risk-tier systems (unacceptable/high/limited/minimal) to size oversight—educational framing, involve counsel for compliance.',
          'Ship model/system cards that cover tools, evals, and out-of-scope uses for LLM apps.',
          'Audit-log privileged tool actions with approver and idempotency metadata.',
          'Design for data residency: regional inference, indexes, and log storage when required.'
        ],
        codeExample: {
          title: 'Toy risk tier classifier for launch review',
          language: 'python',
          code: code([
            'def risk_tier(feature):',
            "    if feature.get('prohibited_use'):",
            "        return 'unacceptable_review_block'",
            "    if feature.get('affects_legal_or_credit') or feature.get('safety_critical'):",
            "        return 'high'",
            "    if feature.get('user_facing_chat'):",
            "        return 'limited'",
            "    return 'minimal'",
            '',
            "print(risk_tier({'user_facing_chat': True}))",
            "print(risk_tier({'affects_legal_or_credit': True}))",
            "print(risk_tier({'prohibited_use': True}))"
          ])
        }
      }
    ],
    checklistAppend: [
      'Can risk-tier an LLM feature and list required artifacts per tier.',
      'Maintains system cards including tool permissions and eval summaries.',
      'Stores audit logs for mutating tool calls and respects residency constraints.'
    ],
    pitfallsAppend: [
      'Treating a model card as optional marketing copy.',
      'No audit trail for agent tool actions that move money or data.',
      'Sending prompts to a foreign region when contracts require residency.'
    ],
    interviewPromptsAppend: [
      'How would you risk-tier an internal HR chatbot versus a credit-decision assistant? (Discuss process; not legal advice.)',
      'What belongs in a system card for an LLM app with tools?',
      'How do data residency requirements change your RAG and logging architecture?'
    ]
  },

  'mlops-and-deployment/ml-pipeline-design': {
    whyItMatters:
      'ML platforms now run dual tracks: classic training/registry pipelines and LLM app pipelines where prompts, indexes, and eval suites are versioned releases. Ignoring either track creates shadow IT.',
    sectionsAppend: [
      {
        heading: 'Dual-track pipelines: classic training and LLM app releases',
        body:
          'Classic MLOps pipelines still matter: data validation → features → train → evaluate → register → deploy for tabular, CV, and ranking models. In parallel, LLM product work needs a second release train whose artifacts are prompts, tool schemas, chunker config, embedding model ids, index snapshots, routing policies, and offline eval bundles—not only weight files. Treat a prompt+index+eval triple as a versioned release candidate with changelogs and rollback. CI should run golden retrieval and answer suites the way training pipelines run metric gates; promotion to “prod alias” mirrors promoting a model registry entry. Shared platform pieces include artifact storage, approval records, secret management, and canary traffic—but stage graphs differ. A common failure mode is improving a classifier with rigorous Airflow DAGs while the companion RAG prompts are edited live in a vendor UI with no diff. Another failure is retraining an LLM adapter without refreshing the retrieval index versions referenced in production. Draw both tracks in architecture reviews; assign owners; require the same discipline for JSON prompt bundles that you require for ONNX files. Where possible, unify observability ids so a quickstart tutorial and a fraud model incident use the same deployment vocabulary.',
        bullets: [
          'Keep a classic train/eval/register track for discriminative models.',
          'Version prompts, indexes, tool schemas, and eval sets as LLM app release artifacts.',
          'Gate both tracks with CI metrics and alias-based rollback.',
          'Avoid unversioned prompt edits in vendor consoles for production paths.'
        ],
        codeExample: {
          title: 'Version dict for an LLM app release',
          language: 'python',
          code: code([
            'release = {',
            "    'prompt_version': 'policy_assist_v12',",
            "    'embedder': 'e5-large-v3',",
            "    'index_build': 'acme_docs_2026_07_20',",
            "    'eval_suite': 'rag_gold_v7',",
            "    'routing_alias': 'chat-strong',",
            '}',
            "required = ['prompt_version', 'embedder', 'index_build', 'eval_suite']",
            'missing = [k for k in required if k not in release]',
            'print("ready" if not missing else missing)'
          ])
        }
      }
    ],
    checklistAppend: [
      'Documents both classic ML and LLM app pipeline tracks.',
      'Versions prompt/index/eval artifacts with rollback aliases.',
      'Blocks promotion when LLM golden suites fail—same as model metric gates.'
    ],
    pitfallsAppend: [
      'Production prompts edited without version control.',
      'Deploying a new embedder without a matching index build id.',
      'Assuming registry-only workflows cover RAG systems.'
    ],
    interviewPromptsAppend: [
      'Design dual pipelines for a fraud classifier and its LLM investigation copilot.',
      'What artifacts belong in an LLM app release candidate?',
      'How do you roll back a bad prompt+index pair without taking down unrelated models?'
    ],
    exercisesAppend: [
      {
        id: 'llm-release-artifact-gate-2026',
        title: 'Gate an LLM app release bundle',
        difficulty: 'beginner',
        type: 'coding',
        description: 'Return missing keys for a release dict that must include prompt, embedder, index, and eval suite versions.',
        starterCode: code([
          'REQUIRED = ["prompt_version", "embedder", "index_build", "eval_suite"]',
          '',
          'def missing_artifacts(release):',
          '    # TODO',
          '    pass',
          '',
          "print(missing_artifacts({'prompt_version': 'p1', 'embedder': 'e1'}))"
        ]),
        solution: code([
          'REQUIRED = ["prompt_version", "embedder", "index_build", "eval_suite"]',
          '',
          'def missing_artifacts(release):',
          '    return [k for k in REQUIRED if k not in release]',
          '',
          "print(missing_artifacts({'prompt_version': 'p1', 'embedder': 'e1'}))"
        ]),
        hints: [
          'Iterate REQUIRED',
          'Check key membership',
          'Preserve order of REQUIRED'
        ],
        expectedOutput: "['index_build', 'eval_suite']"
      }
    ]
  },

  'llm-retrieval-lab/rag-evaluation-workshop': {
    sectionsAppend: [
      {
        heading: 'RAGAS-style metrics, LLM-as-judge caveats, and CI golden sets',
        body:
          'Workshop metrics (recall@k, MRR, token overlap) are necessary but not sufficient for 2026 production RAG. RAGAS-style evaluation popularized decomposing quality into signals such as faithfulness/groundedness, answer relevance, and context precision/recall—scored with embeddings or LLM judges against the retrieved context. Use the idea even if you implement simplified proxies in NumPy: an answer that does not overlap evidence fails faithfulness; retrieved context that never appears in the answer may be wasted tokens (context precision). LLM-as-judge scales rubrics but brings position bias, verbosity bias, self-preference for the judge’s cousin models, and instability across temperatures—always calibrate against a human-labeled subset and freeze judge prompts/models as versioned artifacts. CI golden sets are the backbone: a few dozen to a few hundred queries with relevant chunk ids and acceptable answer keys, run on every chunker/embedder/prompt change. Fail the build on recall or faithfulness regressions beyond a delta. Keep goldens free of training/synthetic contamination, refresh them when products change, and slice by query type so one happy-path FAQ does not hide multi-hop failures.',
        bullets: [
          'Decompose RAG quality into faithfulness, relevance, and context precision/recall-style signals.',
          'Calibrate LLM judges on human labels; version judge prompts and models.',
          'Run golden retrieval/answer suites in CI on every index or prompt change.',
          'Watch for contamination and slice metrics by query archetype.'
        ],
        codeExample: {
          title: 'Tiny faithfulness proxy for CI',
          language: 'python',
          code: code([
            'def faithfulness_proxy(answer, contexts):',
            '    ans = set(answer.lower().split())',
            '    ctx = set(" ".join(contexts).lower().split())',
            '    if not ans:',
            '        return 0.0',
            '    return len(ans & ctx) / len(ans)',
            '',
            "print(round(faithfulness_proxy('causal masks block future tokens', ['Causal masks block future tokens during decoding.']), 2))",
            "print(round(faithfulness_proxy('quantum flux capacitor unlocked', ['Causal masks block future tokens.']), 2))"
          ])
        }
      }
    ],
    interviewPromptsAppend: [
      'Which RAGAS-style metrics would you gate in CI for a policy FAQ RAG system?',
      'What are the main failure modes of LLM-as-judge for groundedness, and how do you mitigate them?',
      'How do you keep golden sets from contaminating synthetic training data?'
    ]
  },

  'ml-production-lab/serving-contracts-lab': {
    sectionsAppend: [
      {
        heading: 'LLM gateway contracts, model aliases, and deprecation drills',
        body:
          'Serving contracts expand from feature schemas to LLM gateway contracts: request fields (messages, tools, response_format, temperature caps), tenancy headers, auth scopes, and response fields (text, structured JSON, usage tokens, model revision actually served). Gateways in front of open-weight engines or multi-vendor APIs should expose stable aliases (`extract-v1`, `chat-strong`) that resolve to concrete model IDs and revisions. Clients never hard-code ephemeral provider SKUs. Deprecation drills are rehearsals: announce alias retarget, run canary prompts and schema golden tests against the candidate, compare cost/latency/quality, then flip with instant rollback. Contract tests freeze a golden chat request and expected JSON schema validity for each alias. Include error taxonomy (context length, content filter, upstream 429) so clients retry correctly. The lab mindset still applies—validate before predict—but now validation covers message roles, max tokens, and tool schema sizes that can DOS your own gateway. Treat provider deprecation notices as pages, not blog skims.',
        bullets: [
          'Define gateway request/response contracts including usage and resolved model revision.',
          'Route clients through aliases; canary before retargeting.',
          'Rehearse deprecation with golden prompts, schema checks, and rollback.',
          'Validate message/tool payload sizes and roles at the edge.'
        ],
        codeExample: {
          title: 'Resolve a model alias with pin + canary',
          language: 'python',
          code: code([
            'ALIASES = {',
            "    'chat-strong': {'prod': 'providerA-large-2026-05', 'canary': 'providerA-large-2026-07'},",
            '}',
            '',
            'def resolve(alias, canary_percent, user_id):',
            '    cfg = ALIASES[alias]',
            '    bucket = sum(map(ord, user_id)) % 100',
            "    return cfg['canary'] if bucket < canary_percent else cfg['prod']",
            '',
            "print(resolve('chat-strong', 10, 'user-1'))",
            "print(resolve('chat-strong', 10, 'user-2'))"
          ])
        }
      }
    ],
    interviewPromptsAppend: [
      'Design an LLM gateway contract that supports structured outputs and usage metering.',
      'How do model aliases and canary percentages make provider deprecation safer?',
      'What golden tests pin an alias before a production retarget?'
    ]
  },

  'transformers-attention-lab/positional-encoding-and-causal-mask': {
    sectionsAppend: [
      {
        heading: 'Long-context serving and KV-cache industry constraints',
        body:
          'Lab exercises that append to a NumPy KV cache foreshadow the dominant inference cost center in industry: long-context serving. As prompts grow to tens or hundreds of thousands of tokens, KV-cache memory and memory-bandwidth dominate GPU choice more than raw FLOPs. Prefill of a huge prompt is compute-heavy and spikes TTFT; subsequent decode is memory-bound as every new token attends over the cached keys/values. Systems mitigate with paged KV caches, prefix caching for shared system prompts, sliding/attention-window variants, and speculative decoding—but the positional encoding story also evolves: RoPE scaling, YaRN-style extrapolations, and learned long-context adaptations attempt to keep attention meaningful beyond training lengths. Causal masks remain mandatory for autoregressive correctness; chunked prefill still respects causality. When you explain a production incident—“OOM after context doubled”—tie it back to 2 × layers × batch × heads × seq × head_dim storage for K and V. Interviewers in 2026 expect you to connect the textbook causal mask to the ops reality that concurrency limits fall as context rises, and that product features dumping full PDFs into the window are capacity decisions, not free UX wins.',
        bullets: [
          'KV-cache memory scales with sequence length and concurrency; long context reduces batch size.',
          'Prefill TTFT and decode TPS degrade differently as windows grow.',
          'Prefix caching and paged KV are standard engine mitigations; positional extrapolation has limits.',
          'Product context budgets are capacity controls tied to causal decoding physics.'
        ],
        codeExample: {
          title: 'Concurrency vs context under a KV memory budget',
          language: 'python',
          code: code([
            'def max_batch(layers, heads, head_dim, seq, budget_gb, bytes_per=2):',
            '    per = 2 * layers * heads * seq * head_dim * bytes_per / (1024 ** 3)',
            '    return int(budget_gb // per)',
            '',
            'for seq in [4096, 16384, 65536]:',
            '    print(seq, max_batch(32, 32, 128, seq, budget_gb=40))'
          ])
        }
      }
    ],
    interviewPromptsAppend: [
      'How does KV-cache growth limit concurrent 128k-context requests on a single GPU?',
      'Explain prefill versus decode bottlenecks for long PDF prompts.',
      'What happens to causal attention serving costs if every user pastes a full repository into the window?'
    ]
  }
};

/**
 * Apply mid-2026 industry currency patches onto course modules.
 * @param {Array<{ slug: string, lessons?: Array<Record<string, unknown>> }>} modules
 * @returns {typeof modules}
 */
export function applyAiIndustryCurrencyPatches(modules) {
  return (modules || []).map((module) => ({
    ...module,
    lessons: (module.lessons || []).map((lesson) => {
      const key = `${module.slug}/${lesson.slug}`;
      const patch = aiIndustryCurrencyPatches[key];
      if (!patch) return lesson;

      const next = { ...lesson };

      if (Object.prototype.hasOwnProperty.call(patch, 'whyItMatters') && patch.whyItMatters != null) {
        next.whyItMatters = patch.whyItMatters;
      }

      if (patch.sectionsAppend) {
        next.sections = appendUniqueSections(lesson.sections, patch.sectionsAppend);
      }

      if (patch.checklistAppend) {
        next.checklist = appendUniqueStrings(lesson.checklist, patch.checklistAppend);
      }

      if (patch.pitfallsAppend) {
        next.pitfalls = appendUniqueStrings(lesson.pitfalls, patch.pitfallsAppend);
      }

      if (patch.interviewPromptsAppend) {
        next.interviewPrompts = appendUniqueStrings(lesson.interviewPrompts, patch.interviewPromptsAppend);
      }

      if (patch.exercisesAppend) {
        next.exercises = appendUniqueExercises(lesson.exercises, patch.exercisesAppend);
      }

      return next;
    })
  }));
}
