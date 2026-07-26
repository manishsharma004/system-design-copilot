/** @type {(...paragraphs: string[]) => string} */
const teachingBody = (...paragraphs) => paragraphs.join('\n\n');

/**
 * Mid-2026 AI/ML industry deep knowledge overlays.
 * Full entries for llmops-eval-lab lessons; updated/additional insights for core AI lessons.
 *
 * @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>}
 */
export const aiIndustryDeepKnowledge2026 = {
  'llmops-eval-lab/llm-evaluation-harness': {
    insights: [
      {
        heading: 'Eval is a product surface with versioned artifacts',
        body: teachingBody(
          `By mid-2026, serious LLM teams treat evaluation like a deployable subsystem: golden sets, graders, thresholds, and reports are versioned next to prompts, models, and indexes. A harness answers three questions on every change—did task success move, did safety/grounding regress, and which slice broke? Without pinned artifacts, “we checked a few chats” is not reproducible and cannot gate CI.`,
          `Practical harness design separates dataset construction, metric computation, and gate policy. Datasets cover intent mix, languages, adversarial cases, and abstention. Metrics mix executable checks (JSON schema, citation IDs present in corpus, tool side effects) with human or LLM judges. Gate policy maps metrics to block vs warn by risk tier so low-risk copy tweaks are not held to the same bar as refund-issuing agents.`
        )
      },
      {
        heading: 'Calibrate LLM-as-judge or keep humans in the loop',
        body: teachingBody(
          `LLM-as-judge scales rubric scoring but inherits bias, verbosity preference, and position effects. Industry practice is to measure agreement against a double-annotated human panel before automating a dimension. Dimensions with weak agreement stay human-reviewed or become pairwise preferences with clearer anchors. Publishing a single uncalibrated “quality 4.7” number in a launch review is a governance failure disguised as metrics.`,
          `For RAG and agents, prefer metrics that reference evidence or world state: faithfulness against retrieved context, citation precision, and trajectory success (did the ticket close? did tests pass?). Fluency and generic helpfulness are soft signals. OpenAI and Anthropic evaluation guidance both emphasize task-specific graders and iterative eval sets over one-off vibe checks—encode that as CI, not a wiki page.`
        )
      },
      {
        heading: 'Component metrics prevent wrong-layer debugging',
        body: teachingBody(
          `End-to-end scores conflate retrieval, planning, tools, and wording. A harness that only reports final-answer quality sends teams into prompt churn while recall@k is 0.4. Instrument stages: retrieval IR metrics, tool-call validity, and generation groundedness. Failure attribution tags (retrieval miss, ignored context, bad tool args, policy refusal error) turn eval failures into a backlog that engineering can own.`,
          `Slice relentlessly. Global averages hide the high-severity refund intent or a single locale. Report hard-gate metrics with confidence intervals when n is small, and refresh the golden set from privacy-redacted production traces so offline gates track real drift. The interview-ready story is a closed loop: offline gates, canary KPIs, sampled traces, updated sets.`
        )
      },
      {
        heading: 'Executable checks beat eloquence for agentic systems',
        body: teachingBody(
          `When an agent can mutate state, the best grader is often the environment: unit tests green, DB row matches policy, refund amount ≤ cap, schema validates. Pair those checks with policy suites for injection and data exfiltration. Trajectory metrics—steps to success, cost per success, unnecessary tool calls—catch efficient-looking failures that a single final message score misses.`,
          `Budget eval compute like you budget inference. Run a fast smoke suite on every PR and a deeper nightly suite with judges and red teams. Flaky judges need retries and adjudication rules; flaky environment checks need deterministic fixtures. A harness that is too slow or noisy will be bypassed—reliability of the eval path is part of product reliability.`
        )
      }
    ],
    references: [
      {
        title: 'OpenAI — Evaluation best practices',
        url: 'https://platform.openai.com/docs/guides/evaluation',
        source: 'OpenAI',
        note: 'Official guidance on eval datasets, graders, and iterating on model/prompt quality.'
      },
      {
        title: 'Anthropic — Demonstrate performance with evals',
        url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests',
        source: 'Anthropic',
        note: 'Practical patterns for building test cases and measuring Claude application quality.'
      },
      {
        title: 'RAGAS: Automated Evaluation of Retrieval Augmented Generation',
        url: 'https://arxiv.org/abs/2309.15217',
        source: 'arXiv',
        note: 'Foundational metrics framing for faithfulness, answer relevance, and context quality.'
      },
      {
        title: 'RAGAS documentation',
        url: 'https://docs.ragas.io/en/stable/',
        source: 'RAGAS',
        note: 'Implementation-oriented docs for metrics, datasets, and evaluation workflows used in LLMOps harnesses.'
      }
    ]
  },

  'llmops-eval-lab/cost-latency-and-observability': {
    insights: [
      {
        heading: 'Unit economics need success-normalized metrics',
        body: teachingBody(
          `Raw token spend and average latency mislead. Mid-2026 dashboards track $/successful task, TTFT (time to first token), tokens/sec, cache hit rate, and cost by intent/route. A cheaper model that doubles retries or human escalations is not cheaper. Define success with the same rigor as offline eval—resolved ticket, correct citation, schema-valid tool outcome—then normalize spend to that denominator.`,
          `Separate interactive and batch economics. Interactive paths care about TTFT and degrade-not-die behavior under load; batch paths care about tokens/sec and queue depth. Mixing them on one queue produces both bad UX and wasted GPUs. Publish budgets per tenant and per request so product features cannot silently unbound spend.`
        )
      },
      {
        heading: 'Caching, routing, and serving are first-line levers',
        body: teachingBody(
          `Stable system prompts, tool schemas, and RAG preambles dominate tokens on agentic apps—prefix/prompt caching is now a default cost control when providers or self-hosted runtimes support it. Complexity routing sends navigational queries to small models and reserves frontier models for hard reasoning. On self-hosted stacks, vLLM-class continuous batching and KV memory managers often beat naive horizontal scale.`,
          `Every optimization needs a quality re-gate. Speculative decoding, quantization, smaller routes, and aggressive caching can change answer distributions. Pair cost projects with the golden harness and online sample monitors. Finance-friendly graphs without task-success overlays are how teams ship silent quality regressions.`
        )
      },
      {
        heading: 'GenAI observability is distributed tracing plus tokens',
        body: teachingBody(
          `OpenTelemetry GenAI semantic conventions give a shared language for spans covering prompts, completions, retrieval, and token usage. For agents, each tool call should be a child span with latency, success/error, and argument size—not a black-box “LLM took 8s.” Cache hits, model IDs, and retrieval k belong as attributes so cost and latency regressions are attributable.`,
          `Logs alone do not replace traces when fan-out exists (parallel tools, multi-hop retrieval). Privacy redaction must be designed in: prompts often contain PII and secrets. Sample thoughtfully for human review; keep aggregates and histograms for SLO burn. Observability that cannot be shared across app and platform teams recreates the “LLM is slow” blame spiral.`
        )
      },
      {
        heading: 'Budgets and degrade paths are product features',
        body: teachingBody(
          `Hard caps on tokens, tool iterations, and wall-clock time prevent runaway agents from becoming billing incidents. When budgets trip, degrade deliberately: shorter context, cached FAQ, smaller model, or human handoff—with a user-visible explanation when appropriate. Measure how often degrade paths fire; chronic firing means the primary path is under-provisioned or poorly routed.`,
          `Capacity planning should use p95/p99 of TTFT and decode under realistic concurrency, including retrieval and tool tails. Synthetic load that only hits empty prompts will not expose KV pressure or tool fan-out. Interview answers that mention TTFT, cache hit rate, and $/success signal production literacy beyond naming a single inference server.`
        )
      }
    ],
    references: [
      {
        title: 'vLLM documentation',
        url: 'https://docs.vllm.ai/en/stable/',
        source: 'vLLM',
        note: 'Production LLM serving docs covering continuous batching, KV efficiency, and OpenAI-compatible APIs.'
      },
      {
        title: 'vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention',
        url: 'https://arxiv.org/abs/2309.06180',
        source: 'arXiv',
        note: 'Core paper on PagedAttention and high-throughput LLM serving economics.'
      },
      {
        title: 'OpenTelemetry — Generative AI semantic conventions',
        url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
        source: 'OpenTelemetry',
        note: 'Emerging standard attributes/spans for tracing LLM, retrieval, and agent workloads.'
      },
      {
        title: 'OpenAI — Production best practices',
        url: 'https://platform.openai.com/docs/guides/production-best-practices',
        source: 'OpenAI',
        note: 'Operational guidance relevant to latency, reliability, and production LLM integration.'
      }
    ]
  },

  'llmops-eval-lab/shipping-gates-and-guardrails': {
    insights: [
      {
        heading: 'Gates encode risk policy as pass/fail evidence',
        body: teachingBody(
          `Shipping gates turn organizational risk appetite into CI and promote rules: faithfulness below X blocks, jailbreak pass-rate below Y blocks, PII leak above Z blocks. Soft metrics (style, verbosity) inform product taste but should not override hard gates. Attach evidence packs—metric reports, model/prompt hashes, dataset versions—to each promote so audits and incidents start from facts.`,
          `Risk tiers keep the system humane. A grammar helper and a hiring or credit agent must not share the same 12-week theater or the same rubber stamp. Map EU AI Act-style high-risk duties and internal policies to concrete artifacts (human oversight plan, eval suites, monitoring). Gates that never fail are unused; gates that always fail will be bypassed—calibrate thresholds with historical baselines.`
        )
      },
      {
        heading: 'Runtime guardrails are not optional for tools',
        body: teachingBody(
          `Offline eval cannot see every adversarial ticket body or corrupted tool payload. Runtime controls—input/output filters, allowlisted tools, argument validation, authz, rate limits, and human approval for irreversible writes—contain blast radius when models fail. Treat the model as an untrusted proposer of actions; policy engines decide.`,
          `Prompt injection (direct and indirect via retrieved docs or emails) is a design constraint. Instruction hierarchy helps but does not replace least privilege. Log denials with enough detail to improve red-team suites without storing secrets. Guardrail false positives need product UX (retry, escalate), or users will invent shadow workflows.`
        )
      },
      {
        heading: 'Canary and rollback close the release loop',
        body: teachingBody(
          `After offline gates, shadow and canary on risk-weighted traffic. Watch task-success proxies, guardrail deny spikes, escalation rate, and cost anomalies—not only latency. Auto-rollback when hard KPIs breach, even if a stakeholder preferred the new demo tone. Immutable version pins for prompts, models, and indexes make rollback real.`,
          `Learn from every breach. Failing canary traces become golden or red-team cases before the next attempt. Shipping without a feedback path into the suite repeats the same incident. This loop—gate, canary, rollback, learn—is the mid-2026 definition of responsible LLM iteration speed.`
        )
      },
      {
        heading: 'Governance, security, and MLOps share one inventory',
        body: teachingBody(
          `Fragmented ownership—legal owns principles, security owns jailbreaks, ML owns BLEU-like scores—creates gaps agents will drive a truck through. Maintain a single AI system inventory with owners, risk tier, model providers, tool privileges, eval evidence, and monitoring links. Incidents should update that inventory and the gates, not only a postmortem slide.`,
          `Third-party and open-weight models add supply-chain controls: data handling terms, regional endpoints, eval on your tasks, and exit plans. Document what you outsource versus what you still own (retrieval quality, tool authz, user communication). Strong interview answers connect NIST AI RMF-style Map/Measure/Manage activities to concrete ship blockers.`
        )
      }
    ],
    references: [
      {
        title: 'NIST AI Risk Management Framework',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        source: 'NIST',
        note: 'Voluntary US framework (Govern/Map/Measure/Manage) widely used to structure AI risk controls and evidence.'
      },
      {
        title: 'Regulation (EU) 2024/1689 — Artificial Intelligence Act',
        url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/en',
        source: 'EUR-Lex',
        note: 'Binding EU risk-tiered obligations for AI systems and GPAI; official legal text.'
      },
      {
        title: 'OWASP Top 10 for Large Language Model Applications',
        url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
        source: 'OWASP',
        note: 'Threat model covering prompt injection, insecure output handling, and excessive agency.'
      },
      {
        title: 'Anthropic — Mitigate jailbreaks and prompt injections',
        url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks',
        source: 'Anthropic',
        note: 'Vendor guidance on strengthening application-level guardrails against adversarial inputs.'
      }
    ]
  },

  'prompt-engineering-and-rag/rag-systems': {
    insights: [
      {
        heading: 'Hybrid retrieval plus reranking is the 2026 baseline',
        body: teachingBody(
          `Pure dense retrieval still misses exact identifiers; pure lexical retrieval still misses paraphrase. Production RAG stacks typically fuse BM25 (or similar) with dense embeddings, then apply a cross-encoder or late-interaction reranker inside a tight top-k before generation. Metadata filters (tenant, ACL, freshness) are part of relevance—not an afterthought bolted on in the prompt.`,
          `Chunking remains a top lever: structure-aware splits by headings/functions, overlap for boundary answers, and parent-document expansion when small chunks retrieve but large context is needed for generation. Measure recall@k and nDCG on a labeled set before investing in multi-agent orchestration; agentic RAG cannot fetch evidence that indexing never made findable.`
        )
      },
      {
        heading: 'Evaluation-first RAG beats prompt-first RAG',
        body: teachingBody(
          `Frameworks like RAGAS popularized faithfulness, answer relevance, and context precision/recall-style metrics that separate retrieval faults from generator faults. Pair them with classical IR metrics and citation checks. Promote chunker/index/embedding changes only when those gates hold. Online, log retrieved IDs and user corrections to refresh hard cases.`,
          `Grounding policy is product design: refuse or clarify when evidence is weak; require quote-backed claims for high-risk domains. Long-context models reduce some chunk pressure but do not remove the need for retrieval quality, ACLs, or eval—context stuffing raises cost and can still drown the needle. Interview answers should name hybrid search, rerank, and faithfulness gates as a coherent system.`
        )
      },
      {
        heading: 'Agentic RAG needs budgets and slice-specific justification',
        body: teachingBody(
          `Query decomposition, iterative retrieve-and-verify, and tool-using research loops help multi-hop questions. They also multiply latency and tokens. Gate agentic paths to slices where single-shot hybrid RAG fails offline, and enforce step/token budgets with degrade to single-pass retrieval. Without slice metrics, teams pay agent costs on navigational FAQs.`,
          `Access control must apply at retrieval time. Vector indexes without document-level auth create cross-tenant leaks that no generator policy can ethically “average away.” Treat index builds, embedding model versions, and ACL fields as release artifacts subject to the same canary discipline as prompts.`
        )
      }
    ],
    references: [
      {
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        url: 'https://arxiv.org/abs/2005.11401',
        source: 'arXiv',
        note: 'Original RAG paper combining parametric and non-parametric memory.'
      },
      {
        title: 'RAGAS documentation',
        url: 'https://docs.ragas.io/en/stable/',
        source: 'RAGAS',
        note: 'Widely used open-source metrics and workflows for evaluating RAG systems.'
      },
      {
        title: 'RAGAS GitHub repository',
        url: 'https://github.com/explodinggradients/ragas',
        source: 'GitHub',
        note: 'Source and issue tracker for the RAGAS evaluation toolkit (docs at docs.ragas.io).'
      },
      {
        title: 'Dense Passage Retrieval for Open-Domain Question Answering',
        url: 'https://arxiv.org/abs/2004.04906',
        source: 'arXiv',
        note: 'Dual-encoder retrieval foundation still underlying many dense RAG indexes.'
      }
    ]
  },

  'ai-agents/agent-fundamentals': {
    insights: [
      {
        heading: 'Agents are budgeted control loops over contracts',
        body: teachingBody(
          `The durable abstraction is observe → plan/act → update memory until a stop condition—not unbounded autonomy. Mid-2026 systems encode stop conditions as hard budgets (steps, tokens, wall-clock), structured outputs, and human handoff. ReAct-style interleaving still helps tool selection, but production reliability comes from contracts around tools and state more than from longer chain-of-thought.`,
          `Prefer deterministic workflows when the path is known (form submit, ETL, fixed approval chain). Reserve agents for ambiguous multi-step work where branching depends on observations. Teams that “agentify” CRUD create cost and failure modes without upside. Architecture reviews should start from the task graph and privilege set, then decide whether an LLM loop belongs at all.`
        )
      },
      {
        heading: 'MCP and shared tool protocols reduce glue—and clarify trust boundaries',
        body: teachingBody(
          `The Model Context Protocol (MCP) standardizes how hosts discover tools/resources and exchange context with servers. Whether you adopt MCP or an internal equivalent, the industry direction is clear: typed tool surfaces, negotiated capabilities, and explicit client/server boundaries beat one-off adapters per model vendor. Shared protocols make authz, logging, and least privilege enforceable in one place.`,
          `Protocol adoption does not remove threat models. Tool servers still need authentication, scoped credentials, and output sanitation against indirect injection. Multi-agent designs (planner/worker/critic) should pass typed artifacts, not free-form telepathy, and must attribute costs per agent role. Eval on trajectories—success, steps, policy violations—belongs in the same harness as chat quality.`
        )
      },
      {
        heading: 'Memory policy is a privacy and correctness feature',
        body: teachingBody(
          `Short-term context, session scratchpads, and long-term stores (vector or structured) each need write/forget policies. Unbounded memory causes drift, cross-session leakage, and prompt-injection persistence. Store what improves task success; expire or redact what creates compliance risk. Reflection-style summaries help long tasks but must be treated as untrusted text when fed back as instructions.`,
          `Connect agent fundamentals to serving and governance: tool privileges appear in the AI system inventory; trajectory logs feed eval; budgets protect unit economics. Strong mid-2026 answers mention MCP-style contracts, trajectory eval, and dual-control writes in the same breath as ReAct.`
        )
      }
    ],
    references: [
      {
        title: 'Model Context Protocol specification',
        url: 'https://modelcontextprotocol.io/specification/2025-11-25/',
        source: 'MCP',
        note: 'Authoritative MCP protocol requirements for connecting LLM applications to tools and context sources.'
      },
      {
        title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
        url: 'https://arxiv.org/abs/2210.03629',
        source: 'arXiv',
        note: 'Foundational pattern interleaving reasoning with tool use still used in agent designs.'
      },
      {
        title: 'OpenAI — Agents guide',
        url: 'https://platform.openai.com/docs/guides/agents',
        source: 'OpenAI',
        note: 'Official patterns for tool-using agents and multi-step workflows.'
      },
      {
        title: 'Anthropic — Building effective agents',
        url: 'https://www.anthropic.com/engineering/building-effective-agents',
        source: 'Anthropic',
        note: 'Engineering guidance on when to use agents vs workflows and how to keep them reliable.'
      }
    ]
  },

  'mlops-and-deployment/monitoring-and-observability': {
    insights: [
      {
        heading: 'Four planes: infra, data, GenAI traces, outcomes',
        body: teachingBody(
          `Classical ML monitoring watched features, predictions, and delayed labels. LLM apps add prompt/retrieval/tool traces and token economics. A green GPU graph with collapsing citation hit rate is still an incident. Organize dashboards into infra SLOs, data/quality SLIs, GenAI trace red-lanes, and business outcomes—and page only when playbooks exist.`,
          `OpenTelemetry GenAI conventions help standardize span names and attributes across vendors and self-hosted stacks. Include model ID, cache hits, retrieval document IDs, and tool errors. Sampling strategies must balance debug needs with privacy; never ship raw prompts to shared logs without redaction contracts.`
        )
      },
      {
        heading: 'Slice-aware quality beats global averages',
        body: teachingBody(
          `Corpus refreshes, embedding upgrades, and UI changes often break one locale, tenant, or intent first. Monitor task-success proxies, faithfulness samples, and guardrail deny rates by slice with volume floors. Tie alerts to actions: roll back index, tighten guardrail, retrain reranker, or degrade to FAQ search.`,
          `Label delay still applies: many outcomes (fraud, long-term retention, ticket reopen) arrive late. Use leading proxies carefully and maintain maturation windows for honest reporting. Champion/challenger and shadow modes remain the safe way to validate retrains when ground truth is slow.`
        )
      },
      {
        heading: 'Alert fatigue is an MLOps design smell',
        body: teachingBody(
          `PSI-on-everything paging trains on-call to ignore signals. Tier alerts: schema/null/freshness pages immediately; distribution drift opens tickets with slice context; quality SLO burn pages with owners. For agents, spike detection on tool error rates and loop length catches runaway behavior faster than waiting for CSAT.`,
          `Close the loop into eval: sampled failures become golden cases; repeated guardrail denials become red-team tests. Monitoring without a path into the harness and release gates becomes a museum of charts. Mid-2026 interview strength is naming GenAI traces, slice SLIs, and rollback playbooks together.`
        )
      }
    ],
    references: [
      {
        title: 'OpenTelemetry — Generative AI semantic conventions',
        url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
        source: 'OpenTelemetry',
        note: 'Semantic conventions for tracing generative AI systems in production.'
      },
      {
        title: 'Evidently AI documentation',
        url: 'https://docs.evidentlyai.com/',
        source: 'Evidently',
        note: 'Practical monitoring reports for data drift, model quality, and LLM evaluation.'
      },
      {
        title: 'Google — Rules of Machine Learning',
        url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
        source: 'Google',
        note: 'Engineering rules including monitoring, testing, and pipeline hygiene for production ML.'
      },
      {
        title: 'vLLM documentation',
        url: 'https://docs.vllm.ai/en/stable/',
        source: 'vLLM',
        note: 'Serving metrics and operational context for self-hosted LLM latency/throughput monitoring.'
      }
    ]
  },

  'ai-safety-and-ethics/ai-governance': {
    insights: [
      {
        heading: 'Mid-2026 means operational EU AI Act readiness',
        body: teachingBody(
          `Regulation (EU) 2024/1689 (AI Act) entered into force in 2024 with phased applicability; by mid-2026 organizations serving the EU need working inventories, risk classifications, and evidence for high-risk and GPAI-related duties—not slideware. Map each deployed system to a risk tier, owner, and control set: evals, human oversight, transparency, logging, and incident response proportionate to impact.`,
          `Hiring, credit, and biometric use cases demand deeper impact assessment and monitoring than internal writing assistants. GPAI/provider obligations may sit with model vendors, but deployers still own application-level misuse, data handling, and downstream harm. Contracts and technical controls must reflect that split of responsibility.`
        )
      },
      {
        heading: 'NIST AI RMF remains the operating language for many teams',
        body: teachingBody(
          `The NIST AI RMF (Govern, Map, Measure, Manage) is voluntary but widely used to structure programs that produce evidence useful under multiple regimes. Map: know systems, data, and harm scenarios. Measure: evals, red teams, monitoring. Manage: gates, rollback, incident learning. Govern: roles, policies, and third-party oversight. Use it as an internal control catalog even when legal obligations come from the EU Act or sector rules.`,
          `Model cards, data sheets, and system cards only work if they stay synchronized with production versions. A card that describes last year’s model while canaries run a new prompt is a liability. Tie documentation updates to the same promote pipeline as code.`
        )
      },
      {
        heading: 'Runtime controls and supply chain are governance',
        body: teachingBody(
          `Access control on tools/data, retention limits on prompts, regional routing, and audit logs are governance primitives. So is vendor diligence for hosted models: training-data opt-out, subprocessors, uptime, and eval rights on your tasks. Open-weight self-hosting shifts some risks (exfiltration, fine-tune misuse) onto your perimeter without removing responsibility for outputs.`,
          `Incidents should change gates. If an agent issues an out-of-policy refund, the fix is dual-control tools plus a new offline case—not only a sterner system prompt. Cross-functional review boards unblock high-risk launches when they demand evidence packs, not unanimous philosophy. Mid-2026 competence is showing the inventory, the tier, the metrics, and the rollback in one coherent story.`
        )
      }
    ],
    references: [
      {
        title: 'Regulation (EU) 2024/1689 — Artificial Intelligence Act',
        url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/en',
        source: 'EUR-Lex',
        note: 'Official EU AI Act text with risk-tiered obligations for providers and deployers.'
      },
      {
        title: 'European Commission — AI Act overview',
        url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
        source: 'European Commission',
        note: 'Policy overview of the AI Act, governance bodies, and implementation context.'
      },
      {
        title: 'NIST AI Risk Management Framework',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        source: 'NIST',
        note: 'US AI RMF resources for identifying, measuring, and managing AI risks.'
      },
      {
        title: 'Model Cards for Model Reporting',
        url: 'https://arxiv.org/abs/1810.03993',
        source: 'arXiv',
        note: 'Canonical template for documenting intended use, metrics, and limitations.'
      }
    ]
  }
};
