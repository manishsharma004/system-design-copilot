/** Deep knowledge for AI application architecture lab lessons. */
export const aiApplicationLabDeepKnowledge = {
  'ai-application-lab/chat-api-and-streaming': {
    insights: [
      {
        heading: 'Streaming is a product API contract',
        body: 'SSE and WebSocket choices affect mobile battery, CDN compatibility, and retry semantics. Document client states and server abort behavior before picking a framework.'
      },
      {
        heading: 'Session storage is a compliance surface',
        body: 'Server-held chat history enables audit and moderation but increases retention obligations. Align TTL and redaction with legal review early.'
      }
    ],
    references: [
      {
        title: 'Server-sent events',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events',
        source: 'MDN',
        note: 'Browser SSE API and connection lifecycle.'
      },
      {
        title: 'OpenAI streaming guide',
        url: 'https://platform.openai.com/docs/api-reference/streaming',
        source: 'OpenAI',
        note: 'Provider streaming patterns and chunk handling.'
      }
    ]
  },
  'ai-application-lab/multi-tenant-rag-products': {
    insights: [
      {
        heading: 'Isolation belongs in retrieval',
        body: 'Post-generation refusal cannot undo leaked chunks in logs or ranking. Tenant and ACL filters must be mandatory query predicates tested in CI.'
      },
      {
        heading: 'Audit logs win enterprise reviews',
        body: 'Record retrieved document ids, scores, and tenant for each answer. Compliance teams care about provability more than embedding model brand.'
      }
    ],
    references: [
      {
        title: 'OWASP LLM Top 10',
        url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
        source: 'OWASP',
        note: 'Security risks including data leakage in RAG systems.'
      },
      {
        title: 'LlamaIndex multi-tenancy concepts',
        url: 'https://docs.llamaindex.ai/en/stable/',
        source: 'LlamaIndex',
        note: 'Patterns for metadata filters and index organization.'
      }
    ]
  },
  'ai-application-lab/shipping-ai-features': {
    insights: [
      {
        heading: 'Release bundles are versioned artifacts',
        body: 'Prompt hash, index schema, model alias, and tool schemas should ship together. Partial updates cause attribution nightmares in incidents.'
      },
      {
        heading: 'Canary metrics must include quality',
        body: 'Latency-only canaries miss faithfulness regressions. Pair SLO dashboards with eval harness deltas on the same traffic slice.'
      }
    ],
    references: [
      {
        title: 'Google SRE — Canary releases',
        url: 'https://sre.google/workbook/canarying-releases/',
        source: 'Google SRE',
        note: 'Progressive rollout and rollback discipline.'
      },
      {
        title: 'LangSmith evaluation',
        url: 'https://docs.smith.langchain.com/',
        source: 'LangChain',
        note: 'Tracing and eval workflows for LLM apps (concepts apply beyond LangChain).'
      }
    ]
  }
};
