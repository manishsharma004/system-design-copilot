/**
 * AI application architecture lab — chat APIs, multi-tenant RAG products, shipping.
 */
const code = (lines) => lines.join('\n');

export const rawAiApplicationLabModules = [
  {
    slug: 'ai-application-lab',
    title: 'AI application architecture lab',
    summary:
      'Design and ship LLM-powered applications: streaming chat APIs, multi-tenant RAG, and production release checklists.',
    objectives: [
      'Choose sync vs streaming APIs and session models for chat products',
      'Design tenant-isolated retrieval with ACL filters and audit trails',
      'Define shipping gates, canaries, and rollback for AI features'
    ],
    lessons: [
      {
        slug: 'chat-api-and-streaming',
        title: 'Chat APIs and streaming UX',
        summary:
          'REST vs SSE streaming, session handling, cancellation, and client-facing error contracts for LLM chat.',
        duration: '55-70 min',
        whyItMatters:
          'Users judge AI apps on perceived latency. Streaming tokens, stable session ids, and honest error surfaces separate production chat from demo wrappers.',
        sections: [
          {
            heading: 'Sync vs streaming responses',
            body:
              'A synchronous chat API waits for the full completion before returning JSON. That is simpler to test and cache but feels slow for long answers. Server-sent events (SSE) or WebSocket streams emit partial tokens as the model generates. Perceived latency drops because the user sees progress immediately. Streaming adds complexity: connection drops mid-generation, partial JSON from tool calls, and client reconnection must resume or fail gracefully. Interview answers should name the user-visible contract: does the client need the full message for rendering, or can it append deltas?',
            bullets: [
              'Use streaming when answers are long or users need early feedback.',
              'Keep a sync path for short structured outputs and batch jobs.',
              'Define what happens when the stream aborts halfway.'
            ]
          },
          {
            heading: 'Sessions and conversation state',
            body:
              'A session id ties multiple turns together. Store messages server-side or pass a compressed history from the client. Server-side storage enables audit, moderation, and consistent tool context; client-side reduces storage liability but complicates multi-device use. Cap history length to control cost — summarization or sliding windows prevent context explosion. Always version the prompt template used for each session.',
            bullets: [
              'Session ids should be opaque and scoped to the authenticated user.',
              'Truncate or summarize history before each model call.',
              'Log prompt version and model alias per turn for replay.'
            ]
          }
        ],
        checklist: [
          'Compare REST vs SSE for a support copilot hot path.',
          'Explain session storage trade-offs (server vs client history).',
          'Name client states: connecting, streaming, error, cancelled.',
          'Define timeout and max tokens per request.'
        ],
        pitfalls: [
          'Streaming without backpressure overwhelms slow clients.',
          'Reusing session ids across users leaks conversation context.',
          'Omitting cancellation leaves runaway tool loops billing after navigate-away.'
        ],
        interviewPrompts: [
          'How would you design a streaming chat API for a mobile app?',
          'What do you store per session for compliance?'
        ],
        related: ['prompt-engineering-and-rag/rag-systems', 'ai-agents/agent-fundamentals']
      },
      {
        slug: 'multi-tenant-rag-products',
        title: 'Multi-tenant RAG products',
        summary:
          'Tenant isolation, ACL filters on retrieve, metadata design, and observability for enterprise RAG.',
        duration: '60-75 min',
        whyItMatters:
          'Enterprise RAG fails reviews when retrieval crosses tenant boundaries or returns documents a user should never see. Isolation is a product requirement, not an index detail.',
        sections: [
          {
            heading: 'Tenant boundaries in ingest and query',
            body:
              'Every document chunk carries tenant_id and optional ACL tags at ingest. Queries always filter by tenant before vector search. Shared indexes with metadata filters differ from per-tenant indexes — filters scale operationally but demand strict query construction; separate indexes cost more but reduce blast radius. Never rely on the LLM to refuse cross-tenant leaks; block at retrieval.',
            bullets: [
              'Filter retrieval by tenant_id and user ACL before ranking.',
              'Audit which document ids were retrieved for each answer.',
              'Test adversarial queries that probe other tenants.'
            ]
          },
          {
            heading: 'Freshness and empty retrieval',
            body:
              'Stale indexes produce confident wrong answers. Track corpus version per tenant and surface freshness in metrics. When retrieval returns nothing, the app should refuse or ask clarifying questions — not hallucinate from parametric knowledge for regulated domains.',
            bullets: [
              'Monitor index lag per tenant and alert on SLA breach.',
              'Define empty-retrieval UX: refuse, escalate, or fallback policy.',
              'Re-ingest pipelines should be idempotent and observable.'
            ]
          }
        ],
        checklist: [
          'Draw ingest and query paths with tenant filters.',
          'Explain metadata fields required on every chunk.',
          'Describe how you test ACL enforcement.',
          'Name metrics: recall@k, empty retrieval rate, ACL violations.'
        ],
        pitfalls: [
          'Filtering only at generation time after retrieving cross-tenant chunks.',
          'Shared dev index without tenant tags becoming production.',
          'Ignoring embedding model changes without reindex plan.'
        ],
        interviewPrompts: [
          'Design RAG for a multi-tenant SaaS knowledge base.',
          'How do you prove a user never sees another tenant\'s data?'
        ],
        related: ['llms-and-nlp/embeddings-and-vector-search', 'prompt-engineering-and-rag/rag-systems']
      },
      {
        slug: 'shipping-ai-features',
        title: 'Shipping AI features',
        summary:
          'Golden-set gates, shadow deploys, canaries, rollback triggers, and on-call playbooks for LLM releases.',
        duration: '55-70 min',
        whyItMatters:
          'Shipping an LLM feature without offline gates and online canaries is how production incidents become postmortems. Release machinery matches traditional services — with extra eval harnesses.',
        sections: [
          {
            heading: 'Offline gates before merge',
            body:
              'CI runs golden-set eval: faithfulness, refusal quality, tool success on fixtures. Block merge on regression beyond threshold. Version prompts, retrieval index, and model alias together as a release bundle.',
            bullets: [
              'Golden sets cover happy path, edge cases, and red-team prompts.',
              'Separate retrieval vs generation metrics in the harness.',
              'Artifact bundle: prompt hash, index version, model id.'
            ]
          },
          {
            heading: 'Shadow, canary, rollback',
            body:
              'Shadow traffic scores new stack without user impact. Canary routes a small percentage with SLO monitors on latency, cost, and task success. Rollback triggers: faithfulness drop, error rate spike, cost per session above budget. Runbooks name who disables the feature flag and which artifact versions to restore.',
            bullets: [
              'Shadow compares distributions before flipping traffic.',
              'Canary SLOs include p95 latency and cost per successful task.',
              'Feature flags isolate model, prompt, and retrieval changes.'
            ]
          }
        ],
        checklist: [
          'List CI gates for an LLM feature PR.',
          'Explain shadow vs canary for a prompt change.',
          'Define rollback triggers with numeric thresholds.',
          'Name on-call steps when faithfulness drops 10% in canary.'
        ],
        pitfalls: [
          'Shipping prompt change without re-running retrieval eval.',
          'Canary too small to catch long-tail failures.',
          'No kill switch when tool loop causes cost runaway.'
        ],
        interviewPrompts: [
          'How do you release a new RAG pipeline safely?',
          'What metrics trigger automatic rollback?'
        ],
        related: ['llmops-eval-lab/shipping-gates-and-guardrails', 'mlops-and-deployment/model-serving']
      }
    ]
  }
];

/** Enrichment merged onto application lab lessons. */
export const aiApplicationLabEnrichment = {
  'ai-application-lab/chat-api-and-streaming': {
    duration: '60-75 min',
    whyItMatters:
      'Chat products are judged on time-to-first-token, reliable sessions, and graceful failures. Strong candidates design the API contract before picking a framework.',
    sections: [
      {
        heading: 'Latency budgets across the chat path',
        body:
          'Time-to-first-token includes auth, session load, retrieval (if RAG), and model prefill. Budget each hop. Prefill often dominates for long contexts; decode dominates total tokens. Caching prior turns reduces prefill for repeat users.',
        bullets: [
          'Measure prefill vs decode separately in traces.',
          'Cap context length per tier to protect p95.',
          'Use connection keep-alive for streaming endpoints.'
        ],
        codeExample: {
          title: 'Simulate token stream timing',
          language: 'python',
          code: code([
            'import numpy as np',
            'rng = np.random.default_rng(0)',
            'tokens = 120',
            'prefill_ms = 180',
            'decode_ms_per_token = np.full(tokens, 25) + rng.integers(-3, 4, size=tokens)',
            'cumulative = prefill_ms + np.cumsum(decode_ms_per_token)',
            'print("first token ms:", prefill_ms)',
            'print("p50 complete ms:", int(np.percentile(cumulative, 50)))',
            'print("p95 complete ms:", int(np.percentile(cumulative, 95)))'
          ])
        }
      },
      {
        heading: 'Error contracts clients can implement',
        body:
          'Return typed errors: rate_limited, context_too_long, model_unavailable, content_filtered. Clients show actionable UI — retry after N seconds, shorten message, or contact support. Never leak stack traces.',
        bullets: [
          'Map provider errors to stable client error codes.',
          'Include retry_after for rate limits.',
          'Log correlation id for support without exposing internals.'
        ]
      },
      {
        heading: 'Cancellation and idempotency',
        body:
          'Users close tabs mid-stream. Abort upstream model calls when the SSE connection closes. For tool side effects, use idempotency keys so retried requests do not double-charge or duplicate tickets.',
        bullets: [
          'Wire client disconnect to cancel generation tasks.',
          'Idempotency keys on write tools and payments.',
          'Bound agent step count and wall-clock time.'
        ]
      }
    ],
    exercises: [
      {
        id: 'stream-budget',
        title: 'Estimate chat latency budget',
        difficulty: 'intermediate',
        type: 'coding',
        description: 'Given prefill and per-token decode latency, compute when p95 completes for 80 tokens.',
        starterCode: code([
          'import numpy as np',
          'prefill_ms = 200',
          'decode_per_token = 22',
          'n_tokens = 80',
          '# TODO: compute total ms and print rounded p95 estimate (use linear sum for this toy model)',
          'total = None',
          'print(total)'
        ]),
        solution: code([
          'import numpy as np',
          'prefill_ms = 200',
          'decode_per_token = 22',
          'n_tokens = 80',
          'total = prefill_ms + decode_per_token * n_tokens',
          'print(total)'
        ]),
        hints: ['Total time is prefill plus tokens times per-token decode in this simplified model.'],
        expectedOutput: '1960'
      },
      {
        id: 'chat-api-design',
        title: 'Design a streaming support API',
        difficulty: 'advanced',
        type: 'design',
        description: 'Sketch REST/SSE endpoints, session model, and error codes for a B2B support copilot.',
        promptQuestions: [
          'What stays synchronous vs streamed?',
          'How do you authenticate and scope sessions?',
          'What happens when retrieval returns zero documents?'
        ],
        hints: ['Name actors: end user, support agent, admin audit reader.']
      }
    ],
    interviewPrompts: [
      'Walk through SSE chat from button click to first token.',
      'How do you prevent session hijacking?'
    ]
  },
  'ai-application-lab/multi-tenant-rag-products': {
    duration: '65-80 min',
    whyItMatters:
      'B2B AI products lose deals when retrieval cannot prove tenant isolation. Design filters and audits before choosing a vector database brand.',
    sections: [
      {
        heading: 'Metadata schema for ACL-aware chunks',
        body:
          'Each chunk stores tenant_id, document_id, acl_groups, sensitivity, and source_updated_at. Queries become: filter tenant_id = X AND acl_groups intersect user_groups, then vector search within that subset.',
        bullets: [
          'Never search globally then filter in application code.',
          'Index only fields needed for filter + display.',
          'Version schema with migration for new ACL dimensions.'
        ],
        codeExample: {
          title: 'Filter chunks by tenant and ACL',
          language: 'python',
          code: code([
            'chunks = [',
            '  {"id": "a", "tenant": "t1", "acl": ["sales"], "text": "pricing"},',
            '  {"id": "b", "tenant": "t1", "acl": ["eng"], "text": "api docs"},',
            '  {"id": "c", "tenant": "t2", "acl": ["sales"], "text": "other tenant"},',
            ']',
            'user = {"tenant": "t1", "groups": ["sales"]}',
            'allowed = [c for c in chunks if c["tenant"] == user["tenant"] and set(user["groups"]) & set(c["acl"])]',
            'print([c["id"] for c in allowed])'
          ])
        }
      },
      {
        heading: 'Evaluation with tenant fixtures',
        body:
          'Golden sets per tenant profile include cross-tenant probe queries that must return empty retrieval. CI fails if any probe retrieves foreign tenant ids.',
        bullets: [
          'Automate adversarial tenant escape tests.',
          'Log retrieved ids with tenant for audit.',
          'Track empty retrieval rate per tenant segment.'
        ]
      },
      {
        heading: 'Shared vs dedicated indexes',
        body:
          'Shared indexes with strict metadata filters reduce ops cost but require query-builder discipline. Per-tenant indexes increase isolation and cost. Hybrid: shared for small tenants, dedicated for regulated tiers.',
        bullets: [
          'Document filter injection points in code review.',
          'Load-test filter selectivity at peak tenant count.',
          'Plan reindex when embedding model changes.'
        ]
      }
    ],
    exercises: [
      {
        id: 'acl-filter',
        title: 'ACL filter simulation',
        difficulty: 'intermediate',
        type: 'coding',
        description: 'Implement a function that returns chunk ids visible to a user tenant and group set.',
        starterCode: code([
          'def visible_chunks(chunks, tenant, groups):',
          '    """Return ids of chunks matching tenant and ACL intersection."""',
          '    # TODO',
          '    return []',
          '',
          'chunks = [',
          '  {"id": "1", "tenant": "acme", "acl": ["billing", "all"]},',
          '  {"id": "2", "tenant": "acme", "acl": ["eng"]},',
          '  {"id": "3", "tenant": "other", "acl": ["all"]},',
          ']',
          'print(visible_chunks(chunks, "acme", {"billing"}))'
        ]),
        solution: code([
          'def visible_chunks(chunks, tenant, groups):',
          '    out = []',
          '    for c in chunks:',
          '        if c["tenant"] != tenant:',
          '            continue',
          '        if set(c["acl"]) & set(groups):',
          '            out.append(c["id"])',
          '    return out',
          '',
          'chunks = [',
          '  {"id": "1", "tenant": "acme", "acl": ["billing", "all"]},',
          '  {"id": "2", "tenant": "acme", "acl": ["eng"]},',
          '  {"id": "3", "tenant": "other", "acl": ["all"]},',
          ']',
          'print(visible_chunks(chunks, "acme", {"billing"}))'
        ]),
        hints: ['Intersect ACL tags with user groups; skip wrong tenant.'],
        expectedOutput: '1'
      },
      {
        id: 'tenant-rag-design',
        title: 'Multi-tenant RAG architecture',
        difficulty: 'advanced',
        type: 'design',
        description: 'Design ingest, index, and query paths for 500 tenants on shared infrastructure.',
        promptQuestions: [
          'Shared index vs per-tenant indexes?',
          'How do you test ACL enforcement in CI?',
          'What audit log do compliance reviewers need?'
        ],
        hints: ['Start with data classification and worst-case leak scenario.']
      }
    ],
    interviewPrompts: [
      'Design multi-tenant RAG for a B2B SaaS knowledge base.',
      'How do you prove ACL enforcement in CI?'
    ],
    pitfalls: [
      'Filtering only after vector search returns top-k.',
      'Shared dev index without tenant tags in production.',
      'Skipping audit logs for retrieved document ids.'
    ]
  },
  'ai-application-lab/shipping-ai-features': {
    duration: '60-75 min',
    whyItMatters:
      'Release discipline turns LLM demos into owned products. Interviewers want gates, canaries, and rollback — not "we shipped when QA felt good."',
    sections: [
      {
        heading: 'Golden-set regression in CI',
        body:
          'Store versioned golden rows with expected behaviors: must_cite, must_refuse, tool_outcome. Harness scores each row; fail build if aggregate faithfulness drops more than threshold vs main branch.',
        codeExample: {
          title: 'Toy regression gate',
          language: 'python',
          code: code([
            'baseline = 0.91',
            'candidate = 0.86',
            'threshold = 0.03',
            'regression = baseline - candidate',
            'gate_pass = regression <= threshold',
            'print("regression:", round(regression, 3), "pass:", gate_pass)'
          ])
        }
      },
      {
        heading: 'Operational rollback',
        body:
          'Keep previous prompt bundle and model alias deployable in one flag flip. Post-incident: freeze feature, restore bundle, replay failing goldens, patch harness, re-canary.',
        bullets: [
          'Feature flags per layer: model, prompt, retrieval index.',
          'Runbooks with owner and escalation path.',
          'Post-ship monitor faithfulness and cost for 48h.'
        ]
      },
      {
        heading: 'Shadow traffic before canary',
        body:
          'Shadow executes the new stack on live inputs without changing user-visible output. Compare faithfulness, latency, and cost distributions before exposing any user to new behavior.',
        bullets: [
          'Shadow must not write side effects from tool calls.',
          'Sample shadow queries for human review weekly.',
          'Align shadow period length with traffic diversity.'
        ]
      }
    ],
    exercises: [
      {
        id: 'eval-gate',
        title: 'Eval regression gate',
        difficulty: 'intermediate',
        type: 'coding',
        description: 'Implement a function that returns whether a candidate score passes against baseline and max drop.',
        starterCode: code([
          'def passes_gate(baseline, candidate, max_drop=0.05):',
          '    # TODO: return True if candidate >= baseline - max_drop',
          '    return False',
          '',
          'print(passes_gate(0.88, 0.84, 0.05))',
          'print(passes_gate(0.88, 0.80, 0.05))'
        ]),
        solution: code([
          'def passes_gate(baseline, candidate, max_drop=0.05):',
          '    return candidate >= baseline - max_drop',
          '',
          'print(passes_gate(0.88, 0.84, 0.05))',
          'print(passes_gate(0.88, 0.80, 0.05))'
        ]),
        hints: ['Compare candidate to baseline minus allowed drop.'],
        expectedOutput: 'True'
      },
      {
        id: 'ship-checklist',
        title: 'Release checklist for RAG feature',
        difficulty: 'advanced',
        type: 'design',
        description: 'Write a ship checklist from merge to full traffic for a prompt + index change.',
        promptQuestions: [
          'What runs in CI vs staging vs canary?',
          'Which metrics page wakes on-call?',
          'How do you roll back in under 5 minutes?'
        ],
        hints: ['Bundle prompt hash with index version in release artifact.']
      }
    ],
    interviewPrompts: [
      'Walk through releasing a prompt and index change safely.',
      'What metrics trigger rollback on a canary?'
    ],
    pitfalls: [
      'Shipping prompt changes without retrieval eval.',
      'Canary without faithfulness monitors.',
      'No kill switch for runaway tool or agent cost.'
    ]
  }
};

/**
 * @param {typeof rawAiApplicationLabModules} modules
 */
export function applyAiApplicationLabEnrichment(modules) {
  return modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => {
      const id = `${module.slug}/${lesson.slug}`;
      const enrichment = aiApplicationLabEnrichment[id];
      if (!enrichment) return lesson;
      return {
        ...lesson,
        ...enrichment,
        sections: enrichment.sections ?? lesson.sections,
        checklist: enrichment.checklist ?? lesson.checklist,
        pitfalls: enrichment.pitfalls ?? lesson.pitfalls,
        interviewPrompts: enrichment.interviewPrompts ?? lesson.interviewPrompts,
        exercises: enrichment.exercises ?? lesson.exercises
      };
    })
  }));
}
