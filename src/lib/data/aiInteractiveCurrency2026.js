function caseStudy({ title, prompt, steps, metrics }) {
  return {
    title,
    prompt,
    context: prompt,
    steps: steps.map((step, index) => ({
      title: step.title,
      detail: step.detail,
      phase: `${index + 1}. ${step.title}`,
      decision: step.title,
      why: step.detail,
      whatIf: step.whatIf ?? 'Skipping this step makes the design harder to defend because the trade-off stays implicit.'
    })),
    metrics: metrics ?? []
  };
}

/**
 * Mid-2026 AI/ML interactive currency overlays.
 * FULL entries replace/seed labs; PATCH entries shallow-merge via mergeInteractiveCurrency.
 *
 * @type {Record<string, any>}
 */
export const aiInteractiveCurrency2026 = {
  'llmops-eval-lab/llm-evaluation-harness': {
    title: 'LLM evaluation harness lab (2026)',
    summary:
      'Build a release-grade LLM eval harness: golden sets, component metrics, calibrated LLM-as-judge, regression gates, and failure attribution—so “it looks good in the demo” is never the only quality signal.',
    takeaways: [
      'Separate offline golden-set gates from online feedback; both are required by mid-2026 practice.',
      'Calibrate LLM-as-judge against human labels; uncalibrated judges are just expensive vibes.',
      'Slice metrics by intent, language, and risk tier—global averages hide the incidents that matter.',
      'Version prompts, models, retrieval indexes, and eval sets together so regressions are attributable.',
      'Executable checks (schema, citations, tool side effects) beat fluency scores for agentic systems.'
    ],
    examples: [
      {
        id: 'golden-set-ci',
        label: 'Golden set CI',
        title: 'Gate every prompt/model change on a versioned golden set',
        scenario:
          'A support copilot team ships weekly prompt edits. Quality “feels fine” until a high-severity refund policy regression reaches customers.',
        decision:
          'Run a pinned golden set in CI with hard gates on task success, faithfulness, and refusal correctness before any production promote.',
        why: [
          'Pinned cases catch policy regressions that chat spot-checks miss.',
          'CI forces eval ownership onto the same PR that changes behavior.',
          'Versioned sets make “what broke” answerable during incident review.'
        ],
        alternative:
          'Relying on ad-hoc playground sessions lets silent regressions ship with every prompt tweak.',
        outcome:
          'Promotions become evidence-based: metric deltas and failing cases travel with the change.'
      },
      {
        id: 'judge-calibration',
        label: 'Judge calibration',
        title: 'Calibrate LLM-as-judge before trusting automated scores',
        scenario:
          'An LLM judge scores “helpfulness” at 4.6/5 while human raters disagree on 35% of borderline refund answers.',
        decision:
          'Collect a double-annotated human panel, measure judge agreement (κ / pairwise accuracy), and only automate dimensions that pass a calibration bar.',
        why: [
          'Uncalibrated judges amplify model biases and style preferences.',
          'Calibration tells you which rubrics are automatable vs human-only.',
          'Release gates need known measurement error, not fake precision.'
        ],
        alternative:
          'Treating raw judge scores as ground truth creates false confidence and gamed prompts.',
        outcome:
          'Automated eval covers high-agreement dimensions; humans still own high-stakes edge cases.'
      }
    ],
    decisionGuide: {
      prompt: 'Which eval investment should come first for this LLM product?',
      options: [
        {
          id: 'golden-harness',
          label: 'Versioned golden-set harness',
          bestFor: 'Products with clear task success criteria and recurring prompt/model changes.',
          chooseWhen: [
            'You can label expected answers, citations, or tool outcomes.',
            'Regressions have already shipped from prompt edits.',
            'You need PR-level gates before canary traffic.'
          ],
          tradeOffs: [
            'Labeling and maintenance cost is real.',
            'Sets go stale without corpus/product refresh.',
            'Does not replace online monitoring.'
          ],
          alternativeOutcome:
            'Skipping golden sets leaves quality as anecdote until customers file tickets.'
        },
        {
          id: 'component-metrics',
          label: 'Component metrics (retrieval, tools, generation)',
          bestFor: 'RAG and agent systems with multi-stage pipelines.',
          chooseWhen: [
            'Failures could be retrieval, planning, tools, or wording.',
            'Teams keep fixing the wrong stage.',
            'You need attributable dashboards.'
          ],
          tradeOffs: [
            'More instrumentation and labels per stage.',
            'End-to-end UX can still fail when components look green.',
            'Requires clear stage contracts.'
          ],
          alternativeOutcome:
            'End-to-end-only scores hide whether the retriever or the generator broke.'
        },
        {
          id: 'online-plus-offline',
          label: 'Paired offline gates + online eval sampling',
          bestFor: 'Live products with shifting traffic and corpora.',
          chooseWhen: [
            'Production queries diverge from the golden set.',
            'You can sample traces with privacy controls.',
            'Business KPIs exist (resolve rate, edit rate, CSAT).'
          ],
          tradeOffs: [
            'Online signals are sparse and biased.',
            'Needs sampling and review workflows.',
            'Cannot alone block a bad deploy without offline gates.'
          ],
          alternativeOutcome:
            'Offline-only eval drifts from real user intent mix within weeks.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Stand up an eval harness for a policy-aware support copilot',
      prompt:
        'You own quality for a support copilot that answers policy questions, drafts refunds, and must refuse when evidence is missing. Leadership wants weekly model swaps without silent regressions.',
      steps: [
        {
          title: 'Define task contracts and risk tiers',
          detail:
            'Enumerate intents (FAQ, multi-hop policy, refund draft, jailbreak/refuse). Assign risk tiers that decide which metrics are hard gates vs soft monitors.',
          whatIf: 'Without tiers, every metric becomes either noise or a veto and teams game the wrong scores.'
        },
        {
          title: 'Build a versioned golden set with coverage slices',
          detail:
            'Label 150–400 cases covering paraphrases, adversarial asks, missing-evidence refusals, and multilingual traffic. Pin corpus snapshot IDs next to the set version.',
          whatIf: 'A vanity FAQ list underestimates the queries that cause incidents.'
        },
        {
          title: 'Wire component + end-to-end metrics into CI',
          detail:
            'Compute retrieval recall@k where applicable, faithfulness/citation checks, schema validity, and task success. Fail the PR when hard gates regress beyond agreed deltas.',
          whatIf: 'Post-hoc notebooks after an outage are too late to protect customers.'
        },
        {
          title: 'Calibrate judges and close the online loop',
          detail:
            'Measure LLM-judge agreement with humans; sample production traces weekly into the golden set with privacy redaction.',
          whatIf: 'Uncalibrated automation and stale offline sets both create false green lights.'
        }
      ],
      metrics: [
        'task success rate',
        'faithfulness / citation precision',
        'judge–human agreement',
        'refusal correctness',
        'eval set coverage by intent'
      ]
    }),
    mermaid: {
      title: 'LLM evaluation harness loop',
      caption: 'Offline gates, calibrated judges, and online sampling form one quality system.',
      code: `flowchart LR
  Change[Prompt model or index change] --> CI[CI golden harness]
  CI --> Gates{Hard gates pass?}
  Gates -->|no| Fix[Attribute failure and fix]
  Fix --> Change
  Gates -->|yes| Canary[Canary traffic]
  Canary --> Online[Online sample and KPIs]
  Online --> Refresh[Refresh golden set]
  Refresh --> CI`
    }
  },

  'llmops-eval-lab/cost-latency-and-observability': {
    title: 'LLM cost, latency, and observability lab (2026)',
    summary:
      'Treat tokens, TTFT, prefixes, and traces as first-class product metrics. Design routing, caching, and OpenTelemetry-style GenAI spans so quality, cost, and latency are co-optimized—not traded in the dark.',
    takeaways: [
      'Track TTFT, tokens/sec, and $/successful-task—not only average latency or raw token spend.',
      'Prompt caching, speculative decoding, and model routing are 2026 default cost levers, not optional polish.',
      'GenAI semantic conventions (prompts, retrieval, tools, token usage) make incidents debuggable across teams.',
      'Budgets belong in the product: per-request caps, per-tenant quotas, and degrade-not-die paths.',
      'Quality without unit economics is a demo; unit economics without quality is a churn machine.'
    ],
    examples: [
      {
        id: 'route-and-cache',
        label: 'Route and cache',
        title: 'Cut spend with complexity routing plus prefix caching',
        scenario:
          'A docs assistant burns 70% of LLM spend on short navigational queries that a small model answers well, while long policy questions need a larger model and shared system prompts.',
        decision:
          'Classify intent/complexity, route simple traffic to a cheaper model, and enable provider/runtime prompt caching for stable system+tool prefixes.',
        why: [
          'Most volume is low complexity; reserve frontier models for hard cases.',
          'Shared prefixes dominate tokens on tool-using agents.',
          'Routing needs quality monitors so cheap paths do not silently fail.'
        ],
        alternative:
          'One large model for everything keeps quality flat while cost and queueing explode at peak.',
        outcome:
          'Cost per resolved query drops sharply while hard-case quality stays gated by the large-model path.'
      },
      {
        id: 'genai-traces',
        label: 'GenAI traces',
        title: 'Instrument retrieval, tools, and generations as linked spans',
        scenario:
          'p95 latency spikes; dashboards show “LLM slow” but not whether retrieval, tool fan-out, or decode tokens dominate.',
        decision:
          'Emit OpenTelemetry GenAI spans for retrieval, each tool call, and generation with token counts, cache hits, and model IDs.',
        why: [
          'Linked spans localize the bottleneck without guesswork.',
          'Token and cache attributes explain cost regressions.',
          'Shared conventions let platform and app teams debug together.'
        ],
        alternative:
          'Logging only final answers forces archaeology during incidents.',
        outcome:
          'On-call sees whether to tune retrieval k, tool concurrency, or model routing.'
      }
    ],
    decisionGuide: {
      prompt: 'Which cost/latency lever should you pull first?',
      options: [
        {
          id: 'measure-unit-economics',
          label: 'Measure unit economics end-to-end',
          bestFor: 'Any LLM feature before heavy optimization.',
          chooseWhen: [
            'You cannot state $/successful task or TTFT by route.',
            'Finance and eng disagree on “expensive.”',
            'You need a baseline before routing or caching.'
          ],
          tradeOffs: [
            'Instrumentation takes upfront work.',
            'Does not by itself reduce spend.',
            'Requires agreement on success definition.'
          ],
          alternativeOutcome:
            'Optimizing blindly often cuts a cheap path and leaves the expensive failure mode.'
        },
        {
          id: 'cache-route',
          label: 'Caching + model routing',
          bestFor: 'High-volume assistants with mixed query difficulty.',
          chooseWhen: [
            'Stable system prompts/tools dominate tokens.',
            'A classifier or heuristic can separate easy/hard.',
            'You have quality gates on each route.'
          ],
          tradeOffs: [
            'Misrouting hurts quality.',
            'Cache invalidation must track prompt/tool versions.',
            'More moving parts in serving.'
          ],
          alternativeOutcome:
            'Quantizing or shrinking one model may not beat routing away easy traffic.'
        },
        {
          id: 'serving-stack',
          label: 'Serving stack (batching, speculative decode, KV efficiency)',
          bestFor: 'Self-hosted or dedicated inference fleets.',
          chooseWhen: [
            'GPU utilization or queue depth is the bottleneck.',
            'TTFT/tokens-per-second SLOs are missed.',
            'You control the runtime (e.g. vLLM-class stacks).'
          ],
          tradeOffs: [
            'Needs ML platform investment.',
            'Quality must be revalidated after decode tricks.',
            'Does not fix bad prompts or retrieval.'
          ],
          alternativeOutcome:
            'App-only caching cannot fix a saturated decode path under peak concurrency.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Bring a growing agentic assistant under a cost and latency SLO',
      prompt:
        'An internal agent with MCP tools and RAG is popular. Monthly LLM spend is up 4×; p95 TTFT misses the UX bar at peak. Leadership wants a cost ceiling without freezing feature work.',
      steps: [
        {
          title: 'Define success-normalized metrics',
          detail:
            'Report $/successful task, TTFT, tokens/sec, cache hit rate, and tool-call fan-out by intent—not raw token totals alone.',
          whatIf: 'Raw spend charts cannot tell whether quality or waste is the problem.'
        },
        {
          title: 'Add GenAI tracing and budgets',
          detail:
            'Instrument spans for retrieval, tools, and generation; enforce per-request token/time budgets with graceful degrade (shorter context, smaller model, or cached FAQ).',
          whatIf: 'Without budgets, a single looping tool trajectory can blow the month’s spend.'
        },
        {
          title: 'Route, cache, and tune serving',
          detail:
            'Route easy intents to cheaper models, enable prefix caching, and tune batching/speculative decoding where you self-host.',
          whatIf: 'Skipping routing leaves you paying frontier rates for navigational lookups.'
        },
        {
          title: 'Gate optimizations on quality',
          detail:
            'Re-run the golden harness and online sample after each cost change; roll back if task success or faithfulness drops.',
          whatIf: 'Cost wins that tank quality are churn and support load, not savings.'
        }
      ],
      metrics: [
        '$ / successful task',
        'TTFT p95',
        'cache hit rate',
        'tokens per request',
        'task success under budget'
      ]
    }),
    mermaid: {
      title: 'Cost-latency observability for LLM apps',
      caption: 'Measure, route/cache, enforce budgets, and verify quality after every optimization.',
      code: `flowchart TD
  Req[User request] --> Trace[GenAI trace spans]
  Trace --> Route[Complexity router]
  Route --> Cheap[Small model + cache]
  Route --> Heavy[Large model + RAG tools]
  Cheap --> Budget[Budget and degrade checks]
  Heavy --> Budget
  Budget --> Out[Response]
  Trace --> Metrics[TTFT tokens cost KPIs]
  Metrics --> Tune[Routing cache serving tunes]
  Tune --> Route`
    }
  },

  'llmops-eval-lab/shipping-gates-and-guardrails': {
    title: 'Shipping gates and runtime guardrails lab (2026)',
    summary:
      'Ship LLM changes through evidence gates—offline eval, safety/policy checks, canary, and rollback—while runtime guardrails (input/output filters, tool authz, human approval) contain blast radius when models misbehave.',
    takeaways: [
      'Release gates are product policy encoded as metrics, not a slide-deck checklist.',
      'Guardrails at runtime (authz, schemas, filters, approvals) complement offline eval; neither replaces the other.',
      'Canary on risk-weighted slices and roll back on gate breach even if demos look better.',
      'Agent/tool writes need least privilege and dual control; prompt text is not an access-control plane.',
      'Incidents must feed new gates—governance that does not update after failure is theater.'
    ],
    examples: [
      {
        id: 'evidence-promote',
        label: 'Evidence promote',
        title: 'Block promote when hard gates regress—even if a demo improves',
        scenario:
          'A new system prompt raises judge “helpfulness” but drops citation faithfulness and increases unsafe compliance on adversarial cases.',
        decision:
          'Require all hard gates (faithfulness, refusal correctness, PII leak rate) to pass; treat helpfulness as a soft metric.',
        why: [
          'Helpfulness without grounding is a known failure mode.',
          'Hard gates encode non-negotiable risk.',
          'Demo cherry-picks hide adversarial regressions.'
        ],
        alternative:
          'Shipping on a single vanity score recreates the incident the gates were meant to prevent.',
        outcome:
          'The prompt is rejected until faithfulness and safety recover.'
      },
      {
        id: 'runtime-tool-guard',
        label: 'Runtime tool guard',
        title: 'Enforce tool authz and confirmation outside the model',
        scenario:
          'An ops agent with broad cloud tools is jailbroken via a pasted runbook and attempts a destructive delete.',
        decision:
          'Keep delete behind scoped credentials, policy engine checks, and human approval tokens; allow read-only diagnosis autonomously.',
        why: [
          'Models are not trustworthy authorization layers.',
          'Approvals create audit evidence.',
          'Least privilege limits blast radius when prompts fail.'
        ],
        alternative:
          '“Please be careful” in the system prompt will not stop a determined injection.',
        outcome:
          'The destructive call is denied; the incident becomes a red-team case in the next gate suite.'
      }
    ],
    decisionGuide: {
      prompt: 'Which control should you strengthen before the next LLM release?',
      options: [
        {
          id: 'offline-gates',
          label: 'Offline release gates',
          bestFor: 'Prompt/model/index changes with labeled eval coverage.',
          chooseWhen: [
            'You can define pass/fail metrics.',
            'Regressions have shipped from unchecked changes.',
            'Rollback artifacts are versioned.'
          ],
          tradeOffs: [
            'Slower iteration if gates are too broad.',
            'Needs maintained golden sets.',
            'Misses novel online attacks without red-team cases.'
          ],
          alternativeOutcome:
            'Canaries without offline gates send known-bad builds to real users.'
        },
        {
          id: 'runtime-guardrails',
          label: 'Runtime guardrails and authz',
          bestFor: 'Agents/tools and user-facing generation with abuse risk.',
          chooseWhen: [
            'Systems can take actions or expose sensitive data.',
            'Prompt injection is in the threat model.',
            'You need deny/allow evidence in logs.'
          ],
          tradeOffs: [
            'False positives frustrate users.',
            'Engineering cost for policy engines.',
            'Does not prove task quality alone.'
          ],
          alternativeOutcome:
            'Strong offline scores still fail if a tool call bypasses policy at runtime.'
        },
        {
          id: 'canary-rollback',
          label: 'Canary, shadow, and rollback',
          bestFor: 'Production traffic with measurable KPIs.',
          chooseWhen: [
            'You can split traffic safely.',
            'Online proxies detect harm quickly.',
            'Previous version can be restored fast.'
          ],
          tradeOffs: [
            'Needs mature serving/experiment infra.',
            'Low-volume slices may be underpowered.',
            'Still needs offline gates for known risks.'
          ],
          alternativeOutcome:
            'Big-bang cutovers turn every model swap into a high-severity incident risk.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Define a ship path for a tool-using customer agent',
      prompt:
        'You must launch an agent that reads CRM data and can issue refunds under policy. Legal requires audit trails; eng wants weekly iteration; security fears prompt injection via ticket text.',
      steps: [
        {
          title: 'Encode risk-tiered release gates',
          detail:
            'Offline: task success, faithfulness, injection/refusal suites, PII leak checks. Map each to block vs warn. Attach evidence to the model/prompt version.',
          whatIf: 'A single vague “safety review” meeting leaves no reproducible bar.'
        },
        {
          title: 'Install runtime guardrails on tools',
          detail:
            'Separate read vs write tools; enforce amount caps, authz, idempotency keys, and human approval for refunds above threshold—independent of model output.',
          whatIf: 'Prompt-only restrictions fail under indirect injection from ticket bodies.'
        },
        {
          title: 'Canary on risk-weighted traffic',
          detail:
            'Shadow the new version, then canary on lower-risk intents first; watch refund error rate, escalation rate, and guardrail deny rates.',
          whatIf: 'Canarying only happy-path chats misses the abusive and high-value slices.'
        },
        {
          title: 'Rollback and learn into the suite',
          detail:
            'Auto-rollback on hard KPI or gate breach; file failing traces as new golden/red-team cases before the next attempt.',
          whatIf: 'Without learning, the same failure mode returns two sprints later.'
        }
      ],
      metrics: [
        'hard-gate pass rate',
        'guardrail deny rate',
        'canary task success',
        'refund policy violation rate',
        'time-to-rollback'
      ]
    }),
    mermaid: {
      title: 'Ship path with gates and guardrails',
      caption: 'Offline evidence, runtime policy, canary, and rollback form a closed loop.',
      code: `flowchart LR
  Build[Change artifact] --> Offline[Offline hard gates]
  Offline -->|fail| Fix[Fix and re-eval]
  Fix --> Build
  Offline -->|pass| Shadow[Shadow traffic]
  Shadow --> Canary[Risk-weighted canary]
  Canary -->|breach| Rollback[Rollback]
  Canary -->|hold| Prod[Production]
  Prod --> Runtime[Runtime guardrails]
  Runtime --> Learn[New cases into suite]
  Learn --> Offline
  Rollback --> Learn`
    }
  },

  // --- PATCH-STYLE overlays (shallow-merged over existing interactive labs) ---
  'llms-and-nlp/llm-fundamentals': {
    summary:
      'LLMs remain probabilistic next-token generators; mid-2026 systems compete on post-training, tooling (RAG/agents/MCP), eval harnesses, and unit economics—not raw parameter counts alone.',
    takeaways: [
      'Capability is a stack: pretrain + SFT + preference/RL stages + tools/retrieval—not a single base checkpoint.',
      'Design for verification (citations, schemas, tools) because fluency still outruns truthfulness.',
      'Token economics, caching, and routing are architecture decisions as much as model choice.',
      'Eval harnesses and shipping gates are part of “knowing LLMs,” not optional MLOps polish.'
    ],
    examples: [
      {
        id: 'posttrain-and-tools-2026',
        label: 'Post-train + tools',
        title: 'Prefer tools and retrieval over hoping the base model memorized your domain',
        scenario:
          'A product team debates fine-tuning a 70B model on internal wikis versus shipping RAG + tool calling with a smaller instruction-tuned model.',
        decision:
          'Start with retrieval and typed tools for living knowledge; reserve fine-tunes for style/format or tight latency budgets after eval proves prompting insufficient.',
        why: [
          'Internal knowledge changes faster than retrain cycles.',
          'Tools and RAG provide auditability that weights lack.',
          '2026 serving stacks make small+tools often cheaper at equal task success.'
        ],
        alternative:
          'Fine-tuning alone freezes knowledge and still hallucinates on gaps.',
        outcome:
          'The team ships a grounded assistant faster, with clearer eval gates and lower steady-state cost.'
      }
    ]
  },

  'prompt-engineering-and-rag/rag-systems': {
    summary:
      'Modern RAG (2026) is hybrid retrieval, disciplined chunking, reranking, and evaluation-first iteration—often with agentic query reformulation—not a single vector search glued to a prompt.',
    takeaways: [
      'Hybrid search (lexical + dense) plus rerankers is the default production pattern for mixed terminology and paraphrase.',
      'Chunking and metadata filters move the quality ceiling more than clever prompt adjectives.',
      'Measure recall@k / nDCG and faithfulness before endless prompt edits.',
      'Agentic RAG (decompose, retrieve, verify) helps multi-hop questions but needs budgets and eval slices.'
    ],
    examples: [
      {
        id: 'hybrid-rerank-2026',
        label: 'Hybrid + rerank',
        title: 'Ship hybrid retrieval with a cross-encoder reranker before agentic complexity',
        scenario:
          'Semantic-only search misses SKU IDs and error codes; pure BM25 misses paraphrased how-to questions. The team wants to jump to multi-agent RAG.',
        decision:
          'Deploy BM25 + dense fusion, then a cross-encoder reranker on top-k; add query decomposition only for multi-hop slices that still fail.',
        why: [
          'Hybrid recovers exact tokens and paraphrase in one stack.',
          'Rerankers buy precision inside a small context budget.',
          'Agentic loops cost latency/tokens and need their own eval.'
        ],
        alternative:
          'Skipping to agents without fixing retrieval burns money on elaborate wrong context.',
        outcome:
          'Recall and grounded answer rates rise before adding planner complexity.'
      }
    ]
  },

  'ai-agents/agent-fundamentals': {
    summary:
      'Agents are budgeted control loops over tools and memory. Mid-2026 practice emphasizes MCP-style tool contracts, trajectory eval, and least-privilege autonomy—not unbounded “autonomous employees.”',
    takeaways: [
      'Start from task graphs and stop conditions; autonomy without budgets is an incident generator.',
      'Standardized tool/context protocols (e.g. MCP) reduce bespoke glue and clarify auth boundaries.',
      'Evaluate trajectories (success, steps, cost, policy violations)—not only final chat text.',
      'Prefer deterministic workflows when the path is known; reserve agents for ambiguous multi-step work.'
    ],
    examples: [
      {
        id: 'mcp-budgeted-agent-2026',
        label: 'MCP + budgets',
        title: 'Expose tools via MCP-style contracts with hard step/token budgets',
        scenario:
          'A research agent keeps growing custom tool adapters; one runaway loop spends thousands of tool calls overnight.',
        decision:
          'Normalize tools behind a shared protocol (schemas, auth), enforce max steps/tokens/wall-clock, and fail closed to a human handoff.',
        why: [
          'Shared contracts make authz and logging consistent.',
          'Budgets bound worst-case cost.',
          'Handoffs beat silent infinite loops.'
        ],
        alternative:
          'Ad-hoc tools and “trust the model to stop” fail under adversarial or confusing states.',
        outcome:
          'Agents stay useful within predictable cost and clearer security review.'
      }
    ]
  },

  'ai-agents/tool-use-and-function-calling': {
    summary:
      'Tool use in 2026 is API and policy design: strict schemas, MCP/server boundaries, idempotent writes, and confirmation for irreversible actions—models propose calls, policy engines authorize them.',
    takeaways: [
      'Treat tool schemas as public APIs: enums, required fields, and actionable error messages back to the model.',
      'Validate and authorize arguments in your code path; never trust model JSON as ground truth.',
      'Separate read vs write tools; dual-control high-impact side effects.',
      'Log full tool trajectories for eval, abuse detection, and incident replay.'
    ],
    examples: [
      {
        id: 'strict-tools-mcp-2026',
        label: 'Strict tools',
        title: 'Prefer narrow, strict-schema tools over a generic code interpreter for production actions',
        scenario:
          'An agent needs to update tickets and trigger refunds. A general “run Python” tool is proposed for speed.',
        decision:
          'Ship narrow tools (get_ticket, quote_refund, apply_refund) with strict JSON schemas, authz, and amount caps; keep sandboxed code only for analysis without side effects.',
        why: [
          'Narrow tools limit blast radius.',
          'Strict schemas reduce malformed calls.',
          'Policy caps belong outside the prompt.'
        ],
        alternative:
          'A generic interpreter turns one injection into arbitrary side effects.',
        outcome:
          'Actions remain auditable and policy-bound even when the model is confused.'
      }
    ]
  },

  'mlops-and-deployment/model-serving': {
    summary:
      'LLM serving in 2026 centers on KV-efficient runtimes (vLLM-class), continuous batching, speculative decoding, and SLOs split across TTFT vs decode—plus canary/rollback like any other service.',
    takeaways: [
      'Optimize KV cache and batching before buying more GPUs; memory manager design dominates throughput.',
      'Report TTFT and tokens/sec separately; UX and capacity planning need both.',
      'Quantization and speculative decoding require quality re-gates, not only speed benches.',
      'Versioned model artifacts with shadow/canary are mandatory for safe swaps.'
    ],
    examples: [
      {
        id: 'vllm-ttft-2026',
        label: 'KV + TTFT',
        title: 'Raise throughput with PagedAttention-style serving and explicit TTFT SLOs',
        scenario:
          'A self-hosted 70B endpoint saturates GPU memory with naive request isolation; interactive UX complains about slow first token while batch jobs want tokens/sec.',
        decision:
          'Move to a KV-efficient continuous-batching server, set separate TTFT and decode SLOs, and isolate interactive vs batch queues.',
        why: [
          'Fragmented KV memory wastes capacity.',
          'Interactive and batch workloads fight without QoS.',
          'SLOs that mix TTFT and total latency mis-prioritize work.'
        ],
        alternative:
          'Horizontal scale alone burns budget without fixing scheduling and memory waste.',
        outcome:
          'Higher concurrency at the same GPU count with clearer UX budgets.'
      }
    ]
  },

  'mlops-and-deployment/monitoring-and-observability': {
    summary:
      'Observe LLM/ML systems across infra, data, predictions, GenAI traces, and business outcomes—with slice-aware alerts and playbooks that include retrain, rollback, or guardrail tighten.',
    takeaways: [
      'Green CPU/GPU does not mean the model is right; monitor inputs, outputs, and outcomes.',
      'GenAI traces (retrieval, tools, tokens) are required for agent/RAG incident response.',
      'Slice metrics and delayed-label proxies catch silent quality loss early.',
      'Every alert needs an owner and action: investigate, degrade, retrain, or rollback.'
    ],
    examples: [
      {
        id: 'genai-slo-monitor-2026',
        label: 'GenAI SLO',
        title: 'Page on task-success and guardrail anomalies, not only latency',
        scenario:
          'Latency SLOs stay green while citation hit rate and thumbs-down spike after a corpus refresh.',
        decision:
          'Add quality SLIs (task success proxy, faithfulness sample, guardrail deny spikes) with playbooks tied to index rollback.',
        why: [
          'RAG breaks often in data, not infra.',
          'User feedback is a leading indicator.',
          'Playbooks convert dashboards into action.'
        ],
        alternative:
          'Infra-only monitoring discovers the issue through viral complaints.',
        outcome:
          'On-call rolls back the index version before a full brand incident.'
      }
    ]
  },

  'ai-safety-and-ethics/ai-governance': {
    summary:
      'By mid-2026, governance is operational: EU AI Act obligations (risk tiers/GPAI), NIST AI RMF-style risk management, model cards, eval evidence, and runtime controls—proportionate to impact.',
    takeaways: [
      'Map systems to risk tiers and attach proportionate evidence (evals, oversight, incident plans).',
      'Treat foundation-model and tool supply chains as first-class vendor risk.',
      'Documentation (model cards, data sheets) must match what is actually deployed and monitored.',
      'Runtime access control and logging are governance controls, not only security niceties.'
    ],
    examples: [
      {
        id: 'eu-act-evidence-2026',
        label: 'Act evidence',
        title: 'Build an evidence pack that maps NIST-style controls to EU AI Act duties',
        scenario:
          'A company sells an EU-facing hiring screener and a low-risk writing assistant. Legal asks what “compliance” means before August 2026 applicability milestones.',
        decision:
          'Tier systems: high-risk hiring gets impact assessment, human oversight, logged evals, and monitoring; the writing assistant gets transparency and lighter review—documented in one inventory.',
        why: [
          'Risk-based duties differ by use case.',
          'Voluntary RMF activities produce reusable evidence.',
          'One-size process either blocks or rubber-stamps.'
        ],
        alternative:
          'A single ethics poster without system inventory fails both audits and shipping speed.',
        outcome:
          'High-risk AI carries a real evidence pack; low-risk AI keeps a short path to production.'
      }
    ]
  },

  'llm-retrieval-lab/rag-evaluation-workshop': {
    summary:
      'Evaluate RAG in stages with mid-2026 tooling mindset: retrieval IR metrics, faithfulness/groundedness (RAGAS-style), answer quality, and online feedback—wired into release gates.',
    takeaways: [
      'Retrieval recall@k / nDCG is still the ceiling; measure it before blaming the LLM.',
      'Faithfulness and context precision/recall-style metrics catch fluent hallucination.',
      'Golden sets need adversarial and “not in corpus” cases, not only FAQ vanity queries.',
      'Promote only when component and end-to-end gates pass; refresh sets from production traces.'
    ],
    examples: [
      {
        id: 'ragas-gates-2026',
        label: 'RAGAS-style gates',
        title: 'Add faithfulness and context metrics as hard release gates',
        scenario:
          'End-to-end helpfulness scores look stable while users report invented policy clauses after a chunker change.',
        decision:
          'Run faithfulness / context relevance metrics (RAGAS-style or equivalent judges) as CI gates alongside recall@k.',
        why: [
          'Helpfulness can rise while grounding falls.',
          'Component metrics localize chunking vs generator faults.',
          'Hard gates stop groundedness regressions from shipping.'
        ],
        alternative:
          'Fluency-only judges greenlight eloquent fabrication.',
        outcome:
          'The chunker change is blocked until faithfulness recovers on the golden set.'
      }
    ]
  }
};

/**
 * Shallow-merge currency overlays onto a base interactive lesson map.
 *
 * @param {Record<string, any>} baseMap
 * @returns {Record<string, any>}
 */
export function mergeInteractiveCurrency(baseMap) {
  const base = baseMap ?? {};
  /** @type {Record<string, any>} */
  const out = { ...base };

  for (const [key, patch] of Object.entries(aiInteractiveCurrency2026)) {
    const existing = base[key];
    if (!existing) {
      out[key] = patch;
      continue;
    }

    /** @type {Record<string, any>} */
    const merged = { ...existing, ...patch };

    if (patch.takeaways) {
      merged.takeaways = patch.takeaways;
    }
    if (patch.summary) {
      merged.summary = patch.summary;
    }
    if (patch.examples) {
      const baseExamples = Array.isArray(existing.examples) ? existing.examples : [];
      merged.examples = [...baseExamples, ...patch.examples];
    }

    out[key] = merged;
  }

  return out;
}
