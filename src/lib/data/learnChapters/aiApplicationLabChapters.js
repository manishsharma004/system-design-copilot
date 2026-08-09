/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const aiApplicationLabChapters = {
  'ai-application-lab/chat-api-and-streaming': {
    title: 'Chat APIs and streaming UX',
    readingTime: '60-75 min',
    premise:
      'Production chat apps are API products first. This chapter covers sync vs streaming, session models, cancellation, and client error contracts before framework choices.',
    parts: [
      {
        id: 'sync-vs-stream',
        heading: 'Sync responses vs token streams',
        paragraphs: [
          'Synchronous chat returns one JSON payload when generation completes. That simplifies caching, logging, and client parsers but hides progress for long answers. Streaming via SSE or WebSockets emits partial tokens so users see movement within hundreds of milliseconds. Streaming raises engineering work: reconnect semantics, partial tool-call JSON, and billing for incomplete generations.',
          'Choose streaming when answers are routinely long or when product metrics track time-to-first-token. Keep sync paths for structured extraction, batch summarization, and low-latency classifiers that return small JSON.'
        ],
        keyTerms: [
          { term: 'SSE', definition: 'Server-sent events: one HTTP connection the server pushes events through.' },
          { term: 'Time-to-first-token', definition: 'Latency until the first model token reaches the client.' }
        ],
        checkYourself: [
          {
            prompt: 'When is sync still the right default?',
            reveal: 'Short structured outputs, batch jobs, and clients that cannot maintain long-lived connections.'
          }
        ],
        callout: { tone: 'interview', body: 'Name the client-visible contract before naming OpenAI or LangChain.' }
      },
      {
        id: 'sessions',
        heading: 'Sessions and bounded history',
        paragraphs: [
          'Sessions group turns under a stable id tied to an authenticated principal. Server-side history enables audit and consistent tool context; client-held history reduces storage duties but complicates multi-device resume. Cap tokens per request with summarization or sliding windows.',
          'Version prompt templates and model aliases per session so replay after incidents is possible.'
        ],
        checkYourself: [
          {
            prompt: 'Why version prompts per session?',
            reveal: 'Incidents and eval regressions require replaying exact stack versions, not only message text.'
          }
        ],
        callout: { tone: 'tip', body: 'Truncate history before the model call — not after billing.' }
      },
      {
        id: 'errors-cancel',
        heading: 'Errors, cancellation, and idempotency',
        paragraphs: [
          'Typed errors (rate_limited, context_too_long, filtered) let clients show actionable UI. When users disconnect, abort upstream generation to stop token spend. Tool calls with side effects need idempotency keys on writes.',
          'Bound agent loops with max steps and wall-clock deadlines.'
        ],
        checkYourself: [
          {
            prompt: 'What must happen when the SSE connection drops mid-stream?',
            reveal: 'Cancel upstream generation and decide whether partial output is persisted or discarded per product policy.'
          }
        ],
        callout: { tone: 'warning', body: 'Without cancellation, mobile tab closes still burn tokens.' }
      },
      {
        id: 'latency-budget',
        heading: 'Latency budgets on the chat path',
        paragraphs: [
          'Budget auth, session load, retrieval, prefill, and decode separately. Prefill grows with context length; decode grows with output tokens. Traces should split these phases for tuning.',
          'Connection keep-alive and regional routing affect tail latency as much as model choice.'
        ],
        workedExample: {
          title: 'Toy latency stack',
          body: 'Sum prefill and per-token decode for a rough complete-time estimate.',
          code: 'prefill_ms = 200\ndecode = 22 * 80\nprint(prefill_ms + decode)',
          language: 'python'
        }
      }
    ],
    wrapUp: {
      takeaways: [
        'Pick sync vs stream from user-visible latency needs.',
        'Sessions need auth scope, history caps, and versioned prompts.',
        'Cancel upstream work when clients disconnect.',
        'Measure prefill vs decode in traces.'
      ],
      nextSteps: [
        {
          label: 'Run the latency budget exercise in the Python lab',
          href: '/module/ai-application-lab/lesson/chat-api-and-streaming#ml-practice-lab'
        },
        {
          label: 'Continue to multi-tenant RAG products',
          href: '/module/ai-application-lab/lesson/multi-tenant-rag-products?learn=1'
        }
      ]
    }
  },
  'ai-application-lab/multi-tenant-rag-products': {
    title: 'Multi-tenant RAG products',
    readingTime: '65-80 min',
    premise:
      'Enterprise RAG is a security product. Tenant filters and audit logs belong in retrieval — not as hopes the model will refuse.',
    parts: [
      {
        id: 'tenant-filters',
        heading: 'Tenant isolation at retrieve',
        paragraphs: [
          'Every chunk carries tenant_id and ACL metadata at ingest. Queries filter tenant and ACL before vector search. Shared indexes with strict metadata filters differ from per-tenant indexes in cost and blast radius.',
          'Never retrieve globally then filter in application code — that pattern leaks in race conditions and ranking quirks.'
        ],
        mermaid: {
          title: 'Tenant RAG path',
          caption: 'Tenant filter precedes search.',
          code: `flowchart LR
  Query[User query] --> Auth[Auth plus tenant]
  Auth --> Filter[Metadata filter]
  Filter --> Search[Vector search]
  Search --> Rank[Rerank]
  Rank --> Gen[Generate with cite]`
        },
        keyTerms: [
          { term: 'ACL filter', definition: 'Metadata constraint ensuring chunks match user authorization groups.' }
        ],
        checkYourself: [
          {
            prompt: 'Why filter before vector search?',
            reveal: 'Prevents cross-tenant chunks from entering ranking and generation paths.'
          }
        ],
        callout: { tone: 'interview', body: 'Draw tenant_id on every arrow in the RAG diagram.' }
      },
      {
        id: 'metadata',
        heading: 'Metadata schema',
        paragraphs: [
          'Store tenant_id, document_id, acl_groups, sensitivity, source_updated_at on each chunk. Schema migrations need versioning when ACL dimensions grow.',
          'Audit logs record retrieved ids per answer for compliance reviewers.'
        ],
        checkYourself: [
          {
            prompt: 'What adversarial tests run in CI?',
            reveal: 'Cross-tenant probe queries that must return empty retrieval every build.'
          }
        ]
      },
      {
        id: 'freshness-empty',
        heading: 'Freshness and empty retrieval',
        paragraphs: [
          'Monitor index lag per tenant. Empty retrieval should trigger refuse or escalate — not confident hallucination in regulated domains.',
          'Corpus updates should be idempotent with observable ingest pipelines.'
        ],
        callout: { tone: 'tip', body: 'Track empty-retrieval rate as a first-class SLO.' }
      },
      {
        id: 'eval-tenant',
        heading: 'Evaluation with tenant fixtures',
        paragraphs: [
          'Golden sets include tenant-specific happy paths and escape probes. Fail CI if foreign tenant ids appear in retrieved sets.',
          'Slice metrics by tenant segment to catch uneven quality.'
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Filter tenant and ACL before search.',
        'Audit retrieved document ids.',
        'Test escape probes in CI.',
        'Treat empty retrieval as a product state.'
      ],
      nextSteps: [
        {
          label: 'Run the ACL filter exercise in the Python lab',
          href: '/module/ai-application-lab/lesson/multi-tenant-rag-products#ml-practice-lab'
        },
        {
          label: 'Continue to shipping AI features',
          href: '/module/ai-application-lab/lesson/shipping-ai-features?learn=1'
        }
      ]
    }
  },
  'ai-application-lab/shipping-ai-features': {
    title: 'Shipping AI features',
    readingTime: '60-75 min',
    premise:
      'LLM releases need the same discipline as payment APIs: offline gates, shadow traffic, canaries, and rollback triggers tied to metrics.',
    parts: [
      {
        id: 'ci-gates',
        heading: 'Offline gates in CI',
        paragraphs: [
          'Golden sets version expected behaviors: citations, refusals, tool outcomes. Harness scores faithfulness and task success; block merge beyond regression threshold.',
          'Bundle prompt hash, index version, and model alias as one release artifact.'
        ],
        checkYourself: [
          {
            prompt: 'What fails a PR vs warns only?',
            reveal: 'Policy sets numeric thresholds per slice; critical slices block, experimental slices may warn.'
          }
        ],
        callout: { tone: 'interview', body: 'Separate retrieval regressions from generation regressions in the report.' }
      },
      {
        id: 'shadow-canary',
        heading: 'Shadow and canary',
        paragraphs: [
          'Shadow scores new stack on live inputs without user impact. Canary routes small traffic with SLO monitors on latency, cost, and task success.',
          'Feature flags isolate model, prompt, and retrieval changes.'
        ]
      },
      {
        id: 'rollback',
        heading: 'Rollback and runbooks',
        paragraphs: [
          'Keep previous bundle deployable in one flag flip. Rollback triggers: faithfulness drop, error spike, cost per session above budget.',
          'Runbooks name owner, kill switch, and artifact versions to restore.'
        ],
        callout: { tone: 'warning', body: 'Canary too small misses long-tail; too large risks broad incidents.' }
      },
      {
        id: 'post-ship',
        heading: 'Post-ship monitoring',
        paragraphs: [
          'Watch faithfulness, refusal quality, and cost for 48h after full promotion. Incidents add golden rows before the next change.',
          'Postmortems update harness — not only prompts.'
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'CI golden gates block silent regressions.',
        'Shadow then canary with explicit SLOs.',
        'One-flag rollback for prompt plus index plus model.',
        'Feed incidents back into goldens.'
      ],
      nextSteps: [
        {
          label: 'Run the eval gate exercise in the Python lab',
          href: '/module/ai-application-lab/lesson/shipping-ai-features#ml-practice-lab'
        },
        {
          label: 'Deep dive: LLMOps eval harness',
          href: '/module/llmops-eval-lab/lesson/llm-evaluation-harness?learn=1'
        }
      ]
    }
  }
};
