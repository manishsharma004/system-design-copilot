/** @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const hldDeepKnowledge = {
  'foundations/problem-framing': {
    insights: [
      {
        heading: 'Separate functional from non-functional requirements early',
        body:
          'Interviewers reward candidates who explicitly distinguish what the system must do from how well it must do it. Functional requirements define user-visible behavior; non-functional requirements (latency, durability, compliance) drive architecture. Naming the top three NFRs before drawing boxes prevents you from over-engineering features nobody asked for.'
      },
      {
        heading: 'Scope negotiation is a design skill',
        body:
          'Strong designs start by stating what is out of scope and which assumptions you are making about users, data size, and geography. Interviewers often probe with "what if we also need X?" to test whether your core model flexes. A clear MVP boundary lets you defer complexity without hand-waving.'
      }
    ],
    references: [
      {
        title: 'Non-Functional Requirements',
        url: 'https://sre.google/sre-book/service-level-objectives/',
        source: 'Google SRE Book',
        note: 'Shows how to translate vague quality goals into measurable objectives that constrain design.'
      },
      {
        title: 'System Design Interview Framework',
        url: 'https://github.com/donnemartin/system-design-primer#how-to-approach-a-system-design-interview-question',
        source: 'System Design Primer',
        note: 'Canonical step-by-step framing used across industry prep — requirements before estimation.'
      },
      {
        title: 'Requirements vs. Design',
        url: 'https://martinfowler.com/bliki/Yagni.html',
        source: 'Martin Fowler',
        note: 'YAGNI reinforces scoping discipline: build only what current requirements justify.'
      }
    ]
  },

  'foundations/capacity-estimation': {
    insights: [
      {
        heading: 'Back-of-the-envelope beats false precision',
        body:
          'Interviewers want order-of-magnitude reasoning, not spreadsheet accuracy. Convert daily active users into QPS using peak-to-average multipliers (often 2–10×). Storage estimates should include metadata overhead, indexes, and replication factor — raw object size alone understates cost by 3–5×.'
      },
      {
        heading: 'Identify the dominant resource',
        body:
          'Every workload has a bottleneck class: CPU, memory, disk I/O, network egress, or human operations. Estimation should conclude with which dimension breaks first at 10× growth. That conclusion directly informs whether you shard, cache, or move work async.'
      }
    ],
    references: [
      {
        title: 'Numbers Everyone Should Know',
        url: 'https://github.com/donnemartin/system-design-primer#system-design-basics',
        source: 'System Design Primer',
        note: 'Latency and throughput reference numbers for quick mental math during interviews.'
      },
      {
        title: 'Latency Numbers Every Programmer Should Know',
        url: 'https://colin-scott.github.io/personal_website/research/interactive_latency.html',
        source: 'Colin Scott',
        note: 'Interactive visualization of orders-of-magnitude differences across storage and network tiers.'
      },
      {
        title: 'Capacity Planning',
        url: 'https://sre.google/sre-book/managing-load/',
        source: 'Google SRE Book',
        note: 'Explains load testing, headroom, and why averages mislead capacity decisions.'
      }
    ]
  },

  'foundations/performance-vs-scalability': {
    insights: [
      {
        heading: 'Performance optimizes a fixed load; scalability handles growth',
        body:
          'A fast single-server solution can outperform a distributed one at small scale. Scalability means adding resources yields proportional throughput without rewriting core logic. Interview answers should state current scale assumptions and the threshold where vertical scaling stops working.'
      },
      {
        heading: 'Amdahl\'s Law limits parallel gains',
        body:
          'Even with infinite machines, the serial fraction of work caps speedup. Identify which steps must be sequential (global counters, strict ordering) versus embarrassingly parallel (independent reads). This explains why some bottlenecks resist horizontal scaling.'
      }
    ],
    references: [
      {
        title: 'Scalability',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch01.html',
        source: 'Kleppmann (DDIA)',
        note: 'Chapter 1 contrasts reliability, scalability, and maintainability as core design goals.'
      },
      {
        title: 'Performance vs. Scalability',
        url: 'https://aws.amazon.com/builders-library/implementing-health-checks/',
        source: 'AWS Builders Library',
        note: 'Real production writing on measuring and improving system behavior under load.'
      },
      {
        title: 'Amdahl\'s Law',
        url: 'https://en.wikipedia.org/wiki/Amdahl%27s_law',
        source: 'Wikipedia',
        note: 'Foundational formula for why parallelization has diminishing returns.'
      }
    ]
  },

  'foundations/latency-throughput-slos': {
    insights: [
      {
        heading: 'Tail latency dominates user experience',
        body:
          'P50 latency tells you little about perceived quality; P99 and P999 matter for multi-hop requests. In a system with ten parallel calls each at 99th-percentile 50 ms, the overall tail approaches 500 ms. Designing for tails means timeouts, hedged requests, and graceful partial responses.'
      },
      {
        heading: 'SLOs create shared error budgets',
        body:
          'A Service Level Objective (e.g., 99.9% of requests < 200 ms) paired with an error budget lets teams balance velocity and reliability. When budget is exhausted, freeze launches and invest in stability. This framework turns vague "high availability" into actionable policy.'
      }
    ],
    references: [
      {
        title: 'Service Level Objectives',
        url: 'https://sre.google/sre-book/service-level-objectives/',
        source: 'Google SRE Book',
        note: 'Definitive guide to SLIs, SLOs, and error budgets.'
      },
      {
        title: 'The Tail at Scale',
        url: 'https://research.google/pubs/pub40801/',
        source: 'Google Research',
        note: 'Dean & Barroso paper on why rare slow requests compound in large distributed systems.'
      },
      {
        title: 'Latency and Throughput',
        url: 'https://aws.amazon.com/builders-library/timeout-and-retry-best-practices/',
        source: 'AWS Builders Library',
        note: 'Practical guidance on timeouts that protect tail latency under dependency failure.'
      }
    ]
  },

  'foundations/availability-consistency-cap': {
    insights: [
      {
        heading: 'CAP is about partition behavior, not a simple pick-two menu',
        body:
          'During a network partition, a distributed store must choose between rejecting writes (CP) or accepting them with possible divergence (AP). In normal operation many systems offer strong consistency. Interview depth comes from explaining per-operation trade-offs, not reciting the triangle.'
      },
      {
        heading: 'Availability is a spectrum measured in nines',
        body:
          'Each additional nine of availability (99.9% → 99.99%) requires roughly an order of magnitude more engineering investment. Strong consistency across regions often conflicts with low-latency writes. Name the consistency model per data type — payments vs. view counts need different guarantees.'
      }
    ],
    references: [
      {
        title: 'CAP Twelve Years Later',
        url: 'https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/',
        source: 'Eric Brewer / InfoQ',
        note: 'Brewer clarifies common CAP misconceptions and partition-focused interpretation.'
      },
      {
        title: 'Consistency and Consensus',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch09.html',
        source: 'Kleppmann (DDIA)',
        note: 'Deep treatment of linearizability, eventual consistency, and when each applies.'
      },
      {
        title: 'Amazon Dynamo',
        url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
        source: 'SOSP 2007',
        note: 'Foundational AP-system design that influenced DynamoDB and Cassandra.'
      }
    ]
  },

  'edge-and-routing/dns': {
    insights: [
      {
        heading: 'DNS is a distributed cache with TTL-driven staleness',
        body:
          'Resolvers cache records based on TTL; lowering TTL speeds failover but increases query load and propagation delay. For blue-green deploys, DNS alone is slow — health-checked load balancers or anycast IPs often front DNS for faster traffic shifting.'
      },
      {
        heading: 'GeoDNS and latency-based routing trade precision for complexity',
        body:
          'Routing users to the nearest region reduces RTT but can strand sessions if a region fails mid-TTL. Weighted and latency-based records help gradual rollouts. Always pair DNS routing with health checks at the target, not blind geographic assumptions.'
      }
    ],
    references: [
      {
        title: 'RFC 1034 — Domain Names',
        url: 'https://www.rfc-editor.org/rfc/rfc1034',
        source: 'IETF',
        note: 'Authoritative specification for DNS concepts and record types.'
      },
      {
        title: 'Route 53 Routing Policies',
        url: 'https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html',
        source: 'AWS',
        note: 'Production patterns for weighted, latency, failover, and geolocation routing.'
      },
      {
        title: 'DNS Performance and Reliability',
        url: 'https://www.cloudflare.com/learning/dns/what-is-dns/',
        source: 'Cloudflare',
        note: 'Accessible overview of resolver hierarchy and caching behavior.'
      }
    ]
  },

  'edge-and-routing/cdn': {
    insights: [
      {
        heading: 'CDNs move bytes closer; they do not replace origin logic',
        body:
          'Edge caches excel at static and cacheable dynamic content with clear cache keys. Personalized or authenticated responses often bypass CDN caching unless you use edge workers for token validation. Cache hit ratio and origin shielding determine whether CDN cost pays off.'
      },
      {
        heading: 'Invalidation strategy defines freshness guarantees',
        body:
          'Purging by URL, tag, or surrogate key lets you invalidate groups of objects without TTL expiry. Stale-while-revalidate serves slightly old content while refreshing in background — a common pattern for news and product catalogs. Over-aggressive TTLs hammer the origin.'
      }
    ],
    references: [
      {
        title: 'Amazon CloudFront Developer Guide',
        url: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html',
        source: 'AWS',
        note: 'Covers edge locations, cache behaviors, and origin shield patterns.'
      },
      {
        title: 'Caching Tutorial',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching',
        source: 'MDN',
        note: 'HTTP cache-control headers that CDNs honor at the edge.'
      },
      {
        title: 'CDN Interconnect',
        url: 'https://www.cloudflare.com/learning/cdn/what-is-a-cdn/',
        source: 'Cloudflare',
        note: 'Explains PoP architecture and why latency to edge matters for global users.'
      }
    ]
  },

  'edge-and-routing/load-balancing': {
    insights: [
      {
        heading: 'Layer 4 vs Layer 7 balancing changes what you can optimize',
        body:
          'L4 balancers route by IP/port with minimal overhead — ideal for raw throughput and long-lived TCP. L7 balancers inspect HTTP headers, cookies, and paths, enabling sticky sessions, path-based routing, and TLS termination. Most modern systems stack both: L4 for entry, L7 for application routing.'
      },
      {
        heading: 'Health checks must reflect real readiness',
        body:
          'A process listening on a port is not necessarily ready to serve traffic. Readiness probes should verify dependencies (database, cache warm-up). Uneven connection draining during deploys causes latency spikes unless you use connection-aware deregistration and weighted routing.'
      }
    ],
    references: [
      {
        title: 'Load Balancing at Scale',
        url: 'https://aws.amazon.com/builders-library/load-balancing/',
        source: 'AWS Builders Library',
        note: 'Production patterns for health checks, draining, and failure detection.'
      },
      {
        title: 'Maglev: A Fast and Reliable Software Network Load Balancer',
        url: 'https://research.google/pubs/pub44824/',
        source: 'Google Research',
        note: 'How Google achieves consistent hashing and fast failover at enormous scale.'
      },
      {
        title: 'NGINX Load Balancing',
        url: 'https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/',
        source: 'NGINX',
        note: 'Practical L7 algorithms: round-robin, least connections, and ip_hash.'
      }
    ]
  },

  'edge-and-routing/reverse-proxies-and-gateways': {
    insights: [
      {
        heading: 'Reverse proxies terminate TLS and enforce cross-cutting policy',
        body:
          'Placing authentication, rate limiting, and request logging at the gateway keeps backends simple and uniform. API gateways also aggregate multiple microservices behind one facade — but over-centralizing business logic in the gateway creates a new monolith.'
      },
      {
        heading: 'Service mesh vs API gateway overlap',
        body:
          'Gateways handle north-south (client-to-cluster) traffic; service meshes handle east-west (service-to-service) with mTLS and fine-grained retries. Many teams start with a gateway and adopt a mesh only when inter-service policy complexity justifies the operational cost.'
      }
    ],
    references: [
      {
        title: 'API Gateway',
        url: 'https://microservices.io/patterns/apigateway.html',
        source: 'microservices.io',
        note: 'Chris Richardson pattern catalog entry on gateway responsibilities.'
      },
      {
        title: 'Envoy Proxy Architecture',
        url: 'https://www.envoyproxy.io/docs/envoy/latest/intro/intro',
        source: 'Envoy',
        note: 'Modern L7 proxy used by Istio, Ambassador, and many cloud load balancers.'
      },
      {
        title: 'What is a Reverse Proxy?',
        url: 'https://www.nginx.com/resources/glossary/reverse-proxy/',
        source: 'NGINX',
        note: 'Clear explanation of proxy placement and SSL termination benefits.'
      }
    ]
  },

  'edge-and-routing/rate-limiting-and-edge-protection': {
    insights: [
      {
        heading: 'Token bucket vs sliding window semantics',
        body:
          'Token buckets allow controlled bursts while enforcing average rate — good for APIs with bursty clients. Sliding windows smooth per-interval counts but cost more to implement in distributed systems. Centralized counters (Redis) vs local approximate limits trade accuracy for latency.'
      },
      {
        heading: 'DDoS protection layers defense in depth',
        body:
          'Volumetric attacks are absorbed at CDN/ISP scrubbing centers; application-layer attacks need behavioral analysis and CAPTCHAs. Rate limits should be per-user, per-IP, and per-API-key with different thresholds. Always return 429 with Retry-After headers for well-behaved clients.'
      }
    ],
    references: [
      {
        title: 'Rate Limiting Patterns',
        url: 'https://cloud.google.com/architecture/rate-limiting-strategies-techniques',
        source: 'Google Cloud',
        note: 'Compares algorithms and distributed rate-limit implementations.'
      },
      {
        title: 'RFC 6585 — 429 Too Many Requests',
        url: 'https://www.rfc-editor.org/rfc/rfc6585',
        source: 'IETF',
        note: 'Standard status code and Retry-After semantics for rate-limited clients.'
      },
      {
        title: 'AWS WAF',
        url: 'https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html',
        source: 'AWS',
        note: 'Edge rule-based protection against common web exploits and bots.'
      }
    ]
  },

  'application-architecture/application-layer': {
    insights: [
      {
        heading: 'Stateless application tiers simplify horizontal scaling',
        body:
          'When session state lives in external stores (Redis, cookies with signed tokens), any app instance can handle any request. Stateful sticky sessions couple users to machines and complicate deploys. Push durable state down to data stores and keep the app tier ephemeral.'
      },
      {
        heading: 'Layered architecture enforces separation of concerns',
        body:
          'Presentation, business logic, and data access layers let teams evolve APIs independently. In interviews, map each layer to scaling characteristics: controllers handle I/O, services encode domain rules, repositories isolate persistence. Avoid leaking SQL into HTTP handlers.'
      }
    ],
    references: [
      {
        title: 'Twelve-Factor App — Processes',
        url: 'https://12factor.net/processes',
        source: '12factor.net',
        note: 'Stateless, share-nothing processes as the foundation of scalable app design.'
      },
      {
        title: 'Layered Architecture',
        url: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier',
        source: 'Microsoft Azure',
        note: 'N-tier pattern with clear responsibilities per layer.'
      },
      {
        title: 'Application Layer',
        url: 'https://aws.amazon.com/builders-library/workload-isolation/',
        source: 'AWS Builders Library',
        note: 'How to isolate workloads and failure domains within application tiers.'
      }
    ]
  },

  'application-architecture/monolith-vs-microservices': {
    insights: [
      {
        heading: 'Microservices buy team autonomy at the cost of distributed complexity',
        body:
          'Decomposing by bounded context lets teams deploy independently, but introduces network failures, distributed tracing needs, and data consistency challenges. Start monolithic when domain boundaries are unclear; extract services when a module has distinct scaling or release cadence.'
      },
      {
        heading: 'The modular monolith is a valid middle ground',
        body:
          'Well-bounded modules inside one deployable artifact avoid network overhead while preserving clear ownership. Strangler fig pattern gradually peels modules into services as load or team structure demands. Interviewers respect knowing when not to microservice.'
      }
    ],
    references: [
      {
        title: 'Microservices',
        url: 'https://martinfowler.com/articles/microservices.html',
        source: 'Martin Fowler',
        note: 'Foundational article on when microservices help and what they cost.'
      },
      {
        title: 'MonolithFirst',
        url: 'https://martinfowler.com/bliki/MonolithFirst.html',
        source: 'Martin Fowler',
        note: 'Argument for proving domain model in a monolith before splitting.'
      },
      {
        title: 'Decomposing the Monolith',
        url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-decomposing-monoliths/welcome.html',
        source: 'AWS',
        note: 'Practical extraction patterns including strangler and domain-driven boundaries.'
      }
    ]
  },

  'application-architecture/service-discovery': {
    insights: [
      {
        heading: 'Client-side vs server-side discovery changes failure modes',
        body:
          'Client-side discovery (Eureka, Consul) lets callers pick healthy instances but couples clients to registry logic. Server-side discovery via load balancers hides instance lists but centralizes the lookup hop. Kubernetes DNS + services blend both with kube-proxy routing.'
      },
      {
        heading: 'Health registration must be ephemeral',
        body:
          'Stale registrations route traffic to dead instances until TTL expires. Heartbeats with aggressive timeouts plus graceful shutdown hooks prevent connection storms. In multi-region setups, prefer local registries to avoid cross-region discovery latency.'
      }
    ],
    references: [
      {
        title: 'Service Discovery Pattern',
        url: 'https://microservices.io/patterns/service-registry.html',
        source: 'microservices.io',
        note: 'Catalog of registry, client-side, and server-side discovery variants.'
      },
      {
        title: 'Kubernetes Services',
        url: 'https://kubernetes.io/docs/concepts/services-networking/service/',
        source: 'Kubernetes',
        note: 'ClusterIP, DNS-based discovery, and endpoint slice mechanics.'
      },
      {
        title: 'Consul Service Discovery',
        url: 'https://developer.hashicorp.com/consul/docs/concepts/architecture',
        source: 'HashiCorp',
        note: 'Health checks, gossip protocol, and multi-datacenter federation.'
      }
    ]
  },

  'application-architecture/api-design': {
    insights: [
      {
        heading: 'REST resource modeling vs RPC action endpoints',
        body:
          'REST shines when resources are stable nouns with CRUD semantics and cacheable GETs. RPC-style or GraphQL endpoints fit complex client-driven fetches and evolving mobile clients. Version APIs explicitly (URL path or header) and design for backward-compatible field additions.'
      },
      {
        heading: 'Idempotency keys belong in write API contracts',
        body:
          'POST operations that create charges or orders should accept client-supplied idempotency keys so safe retries do not duplicate side effects. Document error shapes (problem+json), pagination cursors, and rate-limit headers — clients integrate faster when contracts are predictable.'
      }
    ],
    references: [
      {
        title: 'REST API Design',
        url: 'https://restfulapi.net/',
        source: 'restfulapi.net',
        note: 'Practical REST conventions for resources, status codes, and HATEOAS.'
      },
      {
        title: 'Google API Design Guide',
        url: 'https://cloud.google.com/apis/design',
        source: 'Google',
        note: 'Industry-standard guidance on naming, versioning, and standard fields.'
      },
      {
        title: 'Stripe Idempotent Requests',
        url: 'https://docs.stripe.com/api/idempotent_requests',
        source: 'Stripe',
        note: 'Production example of idempotency-key header design for payment APIs.'
      }
    ]
  },

  'application-architecture/realtime-delivery': {
    insights: [
      {
        heading: 'WebSockets vs SSE vs long polling trade connection cost for latency',
        body:
          'WebSockets maintain bidirectional persistent connections — ideal for chat and collaborative editing but expensive at millions of concurrent sockets. Server-Sent Events are simpler for server-push feeds. Long polling works through restrictive proxies but wastes resources at scale.'
      },
      {
        heading: 'Fan-out architecture separates publish from delivery',
        body:
          'A message broker or in-memory pub/sub channel decouples event producers from connection servers. Each edge node maintains local subscriber maps; cross-region fan-out uses dedicated relay tiers. Backpressure and per-user rate limits prevent one noisy channel from starving others.'
      }
    ],
    references: [
      {
        title: 'WebSockets API',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API',
        source: 'MDN',
        note: 'Browser WebSocket lifecycle, frames, and reconnection considerations.'
      },
      {
        title: 'Server-Sent Events',
        url: 'https://html.spec.whatwg.org/multipage/server-sent-events.html',
        source: 'WHATWG',
        note: 'Spec for one-way server push over HTTP with automatic reconnection.'
      },
      {
        title: 'Scaling MQTT',
        url: 'https://mqtt.org/mqtt-specification/',
        source: 'OASIS MQTT',
        note: 'Pub/sub protocol widely used for IoT and lightweight realtime messaging.'
      }
    ]
  },

  'data-storage/relational-data-modeling': {
    insights: [
      {
        heading: 'Normalization reduces anomalies; denormalization buys read speed',
        body:
          'Third normal form eliminates update anomalies but joins become expensive at scale. Read-heavy dashboards often denormalize with materialized views or summary tables. Interview depth: name which invariants must stay normalized (financial balances) vs. which can lag (activity counts).'
      },
      {
        heading: 'Indexes are a write-amplification trade-off',
        body:
          'Every secondary index slows inserts and consumes storage. Composite indexes should match query filter order. Covering indexes avoid table lookups. Over-indexing is a common production mistake that crushes write throughput.'
      }
    ],
    references: [
      {
        title: 'Use The Index, Luke',
        url: 'https://use-the-index-luke.com/',
        source: 'Markus Winand',
        note: 'Deep SQL indexing and query-plan optimization reference.'
      },
      {
        title: 'PostgreSQL Indexes',
        url: 'https://www.postgresql.org/docs/current/indexes.html',
        source: 'PostgreSQL',
        note: 'Official documentation on B-tree, GiST, and partial indexes.'
      },
      {
        title: 'Data Modeling',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch02.html',
        source: 'Kleppmann (DDIA)',
        note: 'Relational vs document models and schema evolution trade-offs.'
      }
    ]
  },

  'data-storage/replication-and-failover': {
    insights: [
      {
        heading: 'Leader-based replication simplifies writes; followers serve reads',
        body:
          'Single-leader replication routes all writes through one node and streams changes to replicas. Read-your-writes consistency may require routing recent writes to the leader or using synchronous replication for critical transactions. Failover must handle split-brain with fencing or quorum.'
      },
      {
        heading: 'Replication lag is a user-visible consistency problem',
        body:
          'Async replicas can serve stale reads seconds behind the leader. Applications must tolerate lag or use version vectors to detect staleness. Monitoring replication lag as an SLO prevents silent degradation during network or disk pressure.'
      }
    ],
    references: [
      {
        title: 'Replication',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch05.html',
        source: 'Kleppmann (DDIA)',
        note: 'Leader/follower, multi-leader, and leaderless replication models.'
      },
      {
        title: 'Amazon RDS Multi-AZ',
        url: 'https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html',
        source: 'AWS',
        note: 'Managed synchronous failover pattern for relational databases.'
      },
      {
        title: 'MySQL Group Replication',
        url: 'https://dev.mysql.com/doc/refman/8.0/en/group-replication.html',
        source: 'MySQL',
        note: 'Consensus-based multi-primary replication with automatic membership.'
      }
    ]
  },

  'data-storage/partitioning-and-sharding': {
    insights: [
      {
        heading: 'Choose partition keys that spread load and localize queries',
        body:
          'Hash partitioning distributes evenly but prevents range scans across shards. Range partitioning supports time-series queries but risks hot shards. Composite keys (tenant_id + entity_id) colocate related data — critical for multi-tenant SaaS.'
      },
      {
        heading: 'Resharding is inevitable; plan for it early',
        body:
          'Consistent hashing minimizes key movement when adding nodes, but rebalancing still requires dual-write or backfill migrations. Global secondary indexes across shards are expensive — prefer query patterns that include the shard key.'
      }
    ],
    references: [
      {
        title: 'Partitioning',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch06.html',
        source: 'Kleppmann (DDIA)',
        note: 'Partitioning strategies, rebalancing, and request routing.'
      },
      {
        title: 'DynamoDB Partition Keys',
        url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html',
        source: 'AWS',
        note: 'Practical hot-partition avoidance and adaptive capacity.'
      },
      {
        title: 'Vitess Sharding',
        url: 'https://vitess.io/docs/19.0/reference/features/sharding/',
        source: 'Vitess',
        note: 'How YouTube-scale MySQL horizontal sharding works in production.'
      }
    ]
  },

  'data-storage/nosql-landscape': {
    insights: [
      {
        heading: 'NoSQL categories optimize for different access patterns',
        body:
          'Document stores (MongoDB) fit flexible schemas; wide-column (Cassandra) excels at high-write time series; key-value (Redis, DynamoDB) offers predictable single-key latency; graph DBs optimize traversals. Pick the store that matches your dominant query, not the hype cycle.'
      },
      {
        heading: 'Schema flexibility shifts complexity to application code',
        body:
          'Schemaless does not mean schema-free — validations move to services, and migrations become application-level backfills. Eventual consistency and lack of joins require explicit denormalization and compensating logic.'
      }
    ],
    references: [
      {
        title: 'NoSQL Databases',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch03.html',
        source: 'Kleppmann (DDIA)',
        note: 'Storage engine fundamentals behind relational and NoSQL systems.'
      },
      {
        title: 'Azure Cosmos DB API Choices',
        url: 'https://learn.microsoft.com/en-us/azure/cosmos-db/choose-api',
        source: 'Microsoft',
        note: 'Side-by-side comparison of document, column, graph, and key-value APIs.'
      },
      {
        title: 'Apache Cassandra Architecture',
        url: 'https://cassandra.apache.org/doc/latest/architecture/',
        source: 'Apache Cassandra',
        note: 'Partitioner, replication, and tunable consistency in wide-column design.'
      }
    ]
  },

  'data-storage/storage-selection': {
    insights: [
      {
        heading: 'Match storage to access pattern, consistency, and ops maturity',
        body:
          'OLTP row stores for transactional workloads; OLAP column stores for analytics; object storage for blobs; search engines for full-text. The same product often uses polyglot persistence — Postgres for accounts, Elasticsearch for search, S3 for media.'
      },
      {
        heading: 'Managed vs self-hosted shifts operational burden',
        body:
          'Managed databases trade cost for automated backups, patching, and failover. Self-hosted offers tuning control for extreme workloads. Interview answers should justify TCO including on-call burden, not just license fees.'
      }
    ],
    references: [
      {
        title: 'Data Storage Fundamentals',
        url: 'https://learn.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-store-overview',
        source: 'Microsoft Azure',
        note: 'Decision matrix mapping workload types to storage categories.'
      },
      {
        title: 'AWS Database Services',
        url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/database.html',
        source: 'AWS',
        note: 'Overview of RDS, DynamoDB, Aurora, and specialized engines.'
      },
      {
        title: 'Choosing a Data Store',
        url: 'https://cloud.google.com/architecture/datastore-selection',
        source: 'Google Cloud',
        note: 'Structured framework for evaluating consistency, scale, and query needs.'
      }
    ]
  },

  'performance-and-resilience/caching-layers': {
    insights: [
      {
        heading: 'Cache hierarchy mirrors cost-latency trade-offs',
        body:
          'Browser cache → CDN → API gateway cache → application cache (Redis) → database buffer pool. Each layer has different TTL semantics and invalidation reach. The goal is maximizing hit rate on the cheapest layer that satisfies freshness requirements.'
      },
      {
        heading: 'Cache-aside vs read-through vs write-through',
        body:
          'Cache-aside lets the app manage population and is most common. Read-through delegates loading to the cache library. Write-through keeps cache and DB synchronized but adds write latency. Write-behind batches writes but risks data loss on crash.'
      }
    ],
    references: [
      {
        title: 'Caching Best Practices',
        url: 'https://aws.amazon.com/caching/best-practices/',
        source: 'AWS',
        note: 'ElastiCache patterns for session, database, and API response caching.'
      },
      {
        title: 'Cache',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch03.html',
        source: 'Kleppmann (DDIA)',
        note: 'How databases and applications use caching internally.'
      },
      {
        title: 'Redis Documentation',
        url: 'https://redis.io/docs/latest/develop/use-cases/',
        source: 'Redis',
        note: 'In-memory data structures beyond simple key-value caching.'
      }
    ]
  },

  'performance-and-resilience/cache-invalidation': {
    insights: [
      {
        heading: 'There are only two hard problems — invalidation is one',
        body:
          'TTL-based expiry is simple but serves stale data until expiration. Event-driven invalidation (pub/sub on writes) is precise but can miss messages. Versioned cache keys (include updated_at in key) let stale entries die naturally without explicit purge.'
      },
      {
        heading: 'Thundering herd follows invalidation events',
        body:
          'When a hot key expires, thousands of requests may hit the database simultaneously. Mitigations: probabilistic early expiration, request coalescing (single-flight), and stale-while-revalidate. Negative caching prevents repeated lookups for missing keys.'
      }
    ],
    references: [
      {
        title: 'Cache Invalidation',
        url: 'https://martinfowler.com/bliki/TwoHardThings.html',
        source: 'Martin Fowler',
        note: 'Classic framing of cache invalidation and naming as core CS challenges.'
      },
      {
        title: 'Preventing Cache Stampede',
        url: 'https://en.wikipedia.org/wiki/Cache_stampede',
        source: 'Wikipedia',
        note: 'Describes lock-based, probabilistic, and external recomputation strategies.'
      },
      {
        title: 'HTTP Caching — Validation',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#validation',
        source: 'MDN',
        note: 'ETag and If-None-Match for conditional requests at any cache layer.'
      }
    ]
  },

  'performance-and-resilience/queues-and-streams': {
    insights: [
      {
        heading: 'Queues decouple producers from consumer speed',
        body:
          'Message queues (SQS, RabbitMQ) buffer work spikes and let you scale consumers independently. At-least-once delivery requires idempotent consumers. Dead-letter queues capture poison messages for inspection without blocking the pipeline.'
      },
      {
        heading: 'Streams retain ordered, replayable logs',
        body:
          'Kafka-style logs let multiple consumer groups read the same events at their own pace. Ordering is per-partition, so partition key choice matters. Streams enable event sourcing and real-time analytics; queues excel at task distribution.'
      }
    ],
    references: [
      {
        title: 'Apache Kafka Documentation',
        url: 'https://kafka.apache.org/documentation/',
        source: 'Apache Kafka',
        note: 'Partitions, consumer groups, and log compaction fundamentals.'
      },
      {
        title: 'Amazon SQS',
        url: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
        source: 'AWS',
        note: 'Managed queue semantics including visibility timeout and DLQ.'
      },
      {
        title: 'Enterprise Integration Patterns',
        url: 'https://www.enterpriseintegrationpatterns.com/patterns/messaging/',
        source: 'Hohpe & Woolf',
        note: 'Canonical messaging patterns: pub/sub, competing consumers, wire tap.'
      }
    ]
  },

  'performance-and-resilience/idempotency-retries-backpressure': {
    insights: [
      {
        heading: 'Retries without idempotency duplicate side effects',
        body:
          'Networks fail after the server processed a request but before the client received the response. Idempotency keys, natural keys, or deduplication tables make retries safe. Exponential backoff with jitter prevents retry storms from amplifying outages.'
      },
      {
        heading: 'Backpressure signals overload upstream',
        body:
          'When downstream cannot keep pace, systems should shed load (drop, sample, or queue with bounds) rather than accumulate unbounded memory. Circuit breakers fail fast when error rates spike, giving dependencies time to recover.'
      }
    ],
    references: [
      {
        title: 'Timeouts, Retries, and Backoff',
        url: 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/',
        source: 'AWS Builders Library',
        note: 'Definitive production guidance on retry policies and jitter.'
      },
      {
        title: 'Circuit Breaker Pattern',
        url: 'https://martinfowler.com/bliki/CircuitBreaker.html',
        source: 'Martin Fowler',
        note: 'How breakers prevent cascading failure across service dependencies.'
      },
      {
        title: 'Idempotency',
        url: 'https://stripe.com/blog/idempotency',
        source: 'Stripe Engineering',
        note: 'Real-world idempotency implementation for financial APIs.'
      }
    ]
  },

  'performance-and-resilience/observability': {
    insights: [
      {
        heading: 'Metrics, logs, and traces answer different questions',
        body:
          'Metrics aggregate for alerting (error rate, latency histograms). Logs capture discrete events with context. Distributed traces follow requests across services to find slow spans. All three correlate via trace IDs injected at the edge.'
      },
      {
        heading: 'USE and RED methods structure what to instrument',
        body:
          'USE (Utilization, Saturation, Errors) suits infrastructure resources. RED (Rate, Errors, Duration) suits request-driven services. High-cardinality labels (per-user IDs) explode metric cost — prefer aggregated dimensions.'
      }
    ],
    references: [
      {
        title: 'Google SRE — Monitoring Distributed Systems',
        url: 'https://sre.google/sre-book/monitoring-distributed-systems/',
        source: 'Google SRE Book',
        note: 'Four golden signals and alerting philosophy for production systems.'
      },
      {
        title: 'OpenTelemetry',
        url: 'https://opentelemetry.io/docs/concepts/observability-primer/',
        source: 'OpenTelemetry',
        note: 'Vendor-neutral standard for traces, metrics, and logs.'
      },
      {
        title: 'USE Method',
        url: 'https://www.brendangregg.com/usemethod.html',
        source: 'Brendan Gregg',
        note: 'Systematic approach to resource-oriented performance analysis.'
      }
    ]
  },

  'security-and-operations/security-basics': {
    insights: [
      {
        heading: 'Defense in depth layers authentication, authorization, and encryption',
        body:
          'Authenticate identity (OAuth2, mTLS), authorize actions (RBAC, ABAC), and encrypt data in transit (TLS 1.3) and at rest (KMS-managed keys). Never trust client-side validation alone — enforce policy at the API gateway and service layer.'
      },
      {
        heading: 'Least privilege limits blast radius',
        body:
          'Service accounts, IAM roles, and network policies should grant minimum permissions needed. Secrets belong in vaults with rotation, not environment variables in images. Audit logs for admin actions are as important as perimeter firewalls.'
      }
    ],
    references: [
      {
        title: 'OWASP Top Ten',
        url: 'https://owasp.org/www-project-top-ten/',
        source: 'OWASP',
        note: 'Most critical web application security risks to address in system design.'
      },
      {
        title: 'AWS Well-Architected — Security Pillar',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html',
        source: 'AWS',
        note: 'Framework for identity, detection, infrastructure protection, and data security.'
      },
      {
        title: 'Zero Trust Architecture',
        url: 'https://learn.microsoft.com/en-us/security/zero-trust/zero-trust-overview',
        source: 'Microsoft',
        note: 'Never trust, always verify — applies to internal service communication too.'
      }
    ]
  },

  'security-and-operations/multi-region-disaster-recovery': {
    insights: [
      {
        heading: 'RPO and RTO define recovery objectives',
        body:
          'Recovery Point Objective (how much data loss is acceptable) and Recovery Time Objective (how long downtime is tolerable) drive architecture cost. Active-active across regions minimizes RTO but requires conflict resolution. Active-passive with async replication is cheaper but longer failover.'
      },
      {
        heading: 'DNS and data replication are the hard parts',
        body:
          'Failing over compute is straightforward if state is externalized; failing over databases requires tested runbooks, replication lag monitoring, and often manual promotion decisions. Regular game days prove DR plans work under pressure.'
      }
    ],
    references: [
      {
        title: 'Disaster Recovery on AWS',
        url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html',
        source: 'AWS',
        note: 'Backup/restore, pilot light, warm standby, and multi-site active patterns.'
      },
      {
        title: 'Google Cloud DR Planning',
        url: 'https://cloud.google.com/architecture/dr-scenarios-for-data',
        source: 'Google Cloud',
        note: 'RPO/RTO trade-offs with cross-region replication strategies.'
      },
      {
        title: 'Chaos Engineering',
        url: 'https://principlesofchaos.org/',
        source: 'Principles of Chaos',
        note: 'Proactive failure injection to validate multi-region resilience.'
      }
    ]
  },

  'security-and-operations/fault-tolerance-and-graceful-degradation': {
    insights: [
      {
        heading: 'Design for partial failure, not zero failure',
        body:
          'Large systems always have something broken — a slow dependency, a full disk, a bad deploy. Bulkheads isolate failures so one tenant or feature cannot take down the whole platform. Timeouts and fallbacks let core paths succeed when auxiliary services fail.'
      },
      {
        heading: 'Graceful degradation preserves core value',
        body:
          'When recommendations are down, show a default feed. When search is slow, return cached results with a staleness indicator. Define tier-1 vs tier-2 features explicitly so on-call knows what to sacrifice under load.'
      }
    ],
    references: [
      {
        title: 'Fault Tolerance',
        url: 'https://sre.google/sre-book/addressing-cascading-failures/',
        source: 'Google SRE Book',
        note: 'How cascading failures propagate and how to break the chain.'
      },
      {
        title: 'Bulkhead Pattern',
        url: 'https://docs.microsoft.com/en-us/azure/architecture/patterns/bulkhead',
        source: 'Microsoft Azure',
        note: 'Isolate thread pools and connections to contain resource exhaustion.'
      },
      {
        title: 'Release It! — Stability Patterns',
        url: 'https://pragprog.com/titles/mnee2/release-it-second-edition/',
        source: 'Nygard',
        note: 'Production stability patterns including circuit breakers and steady state.'
      }
    ]
  },

  'security-and-operations/deployment-capacity-cost': {
    insights: [
      {
        heading: 'Autoscaling tracks demand curves, not peaks forever',
        body:
          'Scale on request rate, queue depth, or custom metrics — not CPU alone. Predictive scaling pre-warms before known events. Right-sizing instances and using spot/preemptible for batch work can cut cloud bills 50–70% without sacrificing SLOs.'
      },
      {
        heading: 'Deploy strategies balance speed and risk',
        body:
          'Rolling deploys replace instances gradually; blue-green swaps entire environments; canary routes a small percentage to new code with automated rollback on error budget burn. Feature flags decouple deploy from release, enabling kill switches without redeploy.'
      }
    ],
    references: [
      {
        title: 'AWS Auto Scaling',
        url: 'https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html',
        source: 'AWS',
        note: 'Target tracking, step scaling, and scheduled scaling policies.'
      },
      {
        title: 'Cost Optimization Pillar',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
        source: 'AWS Well-Architected',
        note: 'Framework for matching supply to demand and eliminating waste.'
      },
      {
        title: 'Progressive Delivery',
        url: 'https://www.split.io/glossary/progressive-delivery/',
        source: 'Split',
        note: 'Canary releases and feature flags as operational safety valves.'
      }
    ]
  },

  'distributed-systems/consistent-hashing-and-hot-keys': {
    insights: [
      {
        heading: 'Consistent hashing minimizes remapping on cluster changes',
        body:
          'Traditional modulo hashing reshuffles most keys when node count changes. Consistent hashing maps keys and nodes to a ring; adding a node only moves adjacent key ranges. Virtual nodes improve load balance when physical machines differ in capacity.'
      },
      {
        heading: 'Hot keys defeat even perfect hashing',
        body:
          'A celebrity tweet or viral product concentrates traffic on one shard. Mitigations: local caching at the app layer, read replicas for hot partitions, key splitting (logical shard per fan), and request coalescing. Detection requires per-key QPS monitoring.'
      }
    ],
    references: [
      {
        title: 'Consistent Hashing',
        url: 'https://www.tom-e-white.com/2007/11/consistent-hashing.html',
        source: 'Tom White',
        note: 'Clear explanation of the ring model and virtual node technique.'
      },
      {
        title: 'Amazon Dynamo — Partitioning',
        url: 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf',
        source: 'SOSP 2007',
        note: 'Original consistent hashing application at Amazon scale.'
      },
      {
        title: 'Redis Hot Key Issues',
        url: 'https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/',
        source: 'Redis',
        note: 'Operational guidance when single keys dominate memory and throughput.'
      }
    ]
  },

  'distributed-systems/consensus-quorums-and-leader-election': {
    insights: [
      {
        heading: 'Quorum reads and writes trade latency for durability',
        body:
          'In leaderless systems like Dynamo-style stores, W + R > N ensures overlapping reads and writes see latest data. Higher quorums increase durability but add latency. Raft and Paxos elect a leader to serialize writes and simplify client semantics.'
      },
      {
        heading: 'Leader election must handle split-brain',
        body:
          'Two leaders accepting writes cause irreconcilable divergence. Fencing tokens (monotonic counters checked by storage) prevent stale leaders from committing. etcd and ZooKeeper use consensus for coordination locks and service metadata.'
      }
    ],
    references: [
      {
        title: 'In Search of an Understandable Consensus Algorithm (Raft)',
        url: 'https://raft.github.io/raft.pdf',
        source: 'Ongaro & Ousterhout',
        note: 'The most approachable consensus algorithm specification.'
      },
      {
        title: 'etcd Raft Implementation',
        url: 'https://etcd.io/docs/latest/learning/learner/',
        source: 'etcd',
        note: 'Production consensus used by Kubernetes for cluster state.'
      },
      {
        title: 'ZooKeeper',
        url: 'https://zookeeper.apache.org/doc/current/zookeeperOver.html',
        source: 'Apache ZooKeeper',
        note: 'Coordination service for locks, leader election, and configuration.'
      }
    ]
  },

  'distributed-systems/distributed-transactions-and-sagas': {
    insights: [
      {
        heading: 'Two-phase commit blocks under partition',
        body:
          '2PC guarantees atomicity across databases but holds locks and stalls if a coordinator fails. At scale, prefer sagas: a sequence of local transactions with compensating actions for rollback. Choreography (events) vs orchestration (central coordinator) trades visibility for coupling.'
      },
      {
        heading: 'Eventual consistency with outbox pattern',
        body:
          'Write business data and an outbox event in one local transaction, then a relay publishes to the message bus. This avoids dual-write races between DB and queue. Consumers must be idempotent because at-least-once delivery is the norm.'
      }
    ],
    references: [
      {
        title: 'Saga Pattern',
        url: 'https://microservices.io/patterns/data/saga.html',
        source: 'microservices.io',
        note: 'Choreography and orchestration approaches to distributed transactions.'
      },
      {
        title: 'Transactional Outbox',
        url: 'https://microservices.io/patterns/data/transactional-outbox.html',
        source: 'microservices.io',
        note: 'Reliable event publishing without 2PC across DB and broker.'
      },
      {
        title: 'Distributed Transactions',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch07.html',
        source: 'Kleppmann (DDIA)',
        note: '2PC, XA limitations, and exactly-once semantics reality.'
      }
    ]
  },

  'distributed-systems/probabilistic-data-structures': {
    insights: [
      {
        heading: 'Approximate answers at fraction of memory cost',
        body:
          'Bloom filters test set membership with no false negatives but tunable false positives — ideal for "definitely not in DB" pre-checks. HyperLogLog estimates cardinalities (unique visitors) in kilobytes. Count-min sketch tracks frequency for heavy hitters.'
      },
      {
        heading: 'Error bounds must be explicit in API contracts',
        body:
          'Interviewers want you to name acceptable false-positive rates and how they affect downstream load. A 1% Bloom false positive means 1% of negative lookups still hit the database — size the filter accordingly.'
      }
    ],
    references: [
      {
        title: 'Bloom Filters by Example',
        url: 'https://llimllib.github.io/bloomfilter-tutorial/',
        source: 'Jason Davies',
        note: 'Interactive intuition for hash count, bit array size, and false positive rate.'
      },
      {
        title: 'Redis Bloom Filter Module',
        url: 'https://redis.io/docs/latest/develop/data-types/probabilistic/',
        source: 'Redis',
        note: 'Production probabilistic structures: Bloom, Cuckoo, Top-K, HyperLogLog.'
      },
      {
        title: 'HyperLogLog: The analysis of a near-optimal cardinality estimation algorithm',
        url: 'https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf',
        source: 'Flajolet et al.',
        note: 'Original paper on cardinality estimation with minimal memory.'
      }
    ]
  },

  'distributed-systems/batch-stream-and-mapreduce': {
    insights: [
      {
        heading: 'Lambda and Kappa architectures unify batch and speed layers',
        body:
          'Lambda runs batch (accurate, slow) and stream (fast, approximate) pipelines, merging at query time. Kappa reprocesses the log for corrections, treating everything as a stream. Modern systems often use Flink or Spark Structured Streaming for unified APIs.'
      },
      {
        heading: 'MapReduce trades generality for fault tolerance',
        body:
          'Map shuffle-reduces by key across commodity machines; stragglers are mitigated by speculative duplicate tasks. Spark improves with in-memory iterations. For interviews, explain when batch ETL belongs offline vs. when stream processing needs sub-second latency.'
      }
    ],
    references: [
      {
        title: 'MapReduce Paper',
        url: 'https://research.google/pubs/pub62/',
        source: 'Google Research',
        note: 'Dean & Ghemawat foundational paper on large-scale data processing.'
      },
      {
        title: 'Apache Spark Overview',
        url: 'https://spark.apache.org/docs/latest/',
        source: 'Apache Spark',
        note: 'RDD, DataFrame, and Structured Streaming programming models.'
      },
      {
        title: 'Apache Flink',
        url: 'https://flink.apache.org/what-is-flink/flink-architecture/',
        source: 'Apache Flink',
        note: 'Stateful stream processing with exactly-once semantics.'
      }
    ]
  },

  'product-patterns/feed-timeline': {
    insights: [
      {
        heading: 'Fan-out on write vs fan-out on read',
        body:
          'Push model (write fan-out) precomputes timelines for fast reads but explodes for celebrities with millions of followers. Pull model (read fan-out) merges followed users\' posts at read time — simpler but slower. Hybrid approaches fan-out normally and merge hot accounts at read time.'
      },
      {
        heading: 'Ranking layer sits above raw chronology',
        body:
          'Production feeds blend recency, engagement signals, and diversity constraints. Separate the ingestion pipeline (store raw events) from the ranking service (ML features, A/B tests). Cache ranked slices per user with short TTL.'
      }
    ],
    references: [
      {
        title: 'Scaling Twitter Timeline',
        url: 'https://www.infoq.com/presentations/Twitter-Timeline-Scalability/',
        source: 'InfoQ / Twitter',
        note: 'Real talk on fan-out trade-offs at Twitter scale.'
      },
      {
        title: 'Facebook TAO',
        url: 'https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf',
        source: 'USENIX ATC 2013',
        note: 'Graph-aware caching layer behind Facebook\'s social graph reads.'
      },
      {
        title: 'Activity Streams',
        url: 'https://www.w3.org/TR/activitystreams-core/',
        source: 'W3C',
        note: 'Standard vocabulary for social activity objects and verbs.'
      }
    ]
  },

  'product-patterns/file-storage-cdn': {
    insights: [
      {
        heading: 'Object storage separates metadata from blob bytes',
        body:
          'Metadata (owner, ACL, content-type) lives in a database; blobs live in S3/GCS with content-addressed or UUID keys. Pre-signed URLs let clients upload/download directly, offloading bandwidth from app servers. Multipart upload handles large files.'
      },
      {
        heading: 'CDN integration requires cache-friendly URLs',
        body:
          'Immutable content gets long max-age; mutable content uses versioned filenames or short TTL with cache busting. Virus scanning and image transcoding run async on upload events before marking objects public.'
      }
    ],
    references: [
      {
        title: 'Amazon S3',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html',
        source: 'AWS',
        note: 'Durability model, storage classes, and pre-signed URL patterns.'
      },
      {
        title: 'Dropbox Architecture',
        url: 'https://dropbox.tech/infrastructure/inside-the-magic-dropbox',
        source: 'Dropbox Tech',
        note: 'Block-level deduplication and sync protocol design.'
      },
      {
        title: 'Google Cloud Storage',
        url: 'https://cloud.google.com/storage/docs',
        source: 'Google Cloud',
        note: 'Object lifecycle, uniform bucket access, and CDN integration.'
      }
    ]
  },

  'product-patterns/search-autocomplete': {
    insights: [
      {
        heading: 'Trie or prefix indexes power sub-millisecond suggestions',
        body:
          'In-memory tries (or Elasticsearch completion suggester) return top-K prefixes ranked by popularity. Personalization blends global trends with user history. Debounce client requests (150–300 ms) to reduce QPS by orders of magnitude.'
      },
      {
        heading: 'Ranking signals go beyond prefix match',
        body:
          'Weight by click-through rate, recency, and business rules (boost paid products). Cache hot prefixes at the edge. Protect against enumeration attacks with rate limits on suggestion endpoints.'
      }
    ],
    references: [
      {
        title: 'Elasticsearch Completion Suggester',
        url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html',
        source: 'Elastic',
        note: 'FST-based prefix completion with context filtering.'
      },
      {
        title: 'How We Built Prefix Matching for Search',
        url: 'https://engineering.linkedin.com/blog/2016/03/prefix-matching-scoring--and-suggestions-in-elasticsearch',
        source: 'LinkedIn Engineering',
        note: 'Production autocomplete ranking and scoring at LinkedIn.'
      },
      {
        title: 'Apache Lucene',
        url: 'https://lucene.apache.org/core/documentation.html',
        source: 'Apache Lucene',
        note: 'Underlying inverted index engine powering most search systems.'
      }
    ]
  },

  'product-patterns/chat-notifications': {
    insights: [
      {
        heading: 'Message ordering is per-conversation, not global',
        body:
          'Assign monotonic sequence numbers per chat room so clients detect gaps and fetch missing messages. Delivery guarantees are at-least-once; clients deduplicate by message ID. Offline users receive push notifications with payload limits (4 KB on APNS).'
      },
      {
        heading: 'Presence and typing indicators are ephemeral state',
        body:
          'Heartbeats with TTL in Redis track online status. Typing events flood the network — throttle to one event per few seconds. Notification fan-out batches digest emails while urgent messages trigger immediate push.'
      }
    ],
    references: [
      {
        title: 'WhatsApp Architecture',
        url: 'https://www.erlang-solutions.com/blog/erlang-and-elixir-in-the-wild/',
        source: 'Erlang Solutions',
        note: 'BEAM/OTP patterns for millions of concurrent connections.'
      },
      {
        title: 'Firebase Cloud Messaging',
        url: 'https://firebase.google.com/docs/cloud-messaging',
        source: 'Google Firebase',
        note: 'Cross-platform push delivery with topic subscriptions.'
      },
      {
        title: 'Matrix Protocol',
        url: 'https://spec.matrix.org/latest/',
        source: 'Matrix.org',
        note: 'Open standard for federated real-time communication and sync.'
      }
    ]
  },

  'product-patterns/payments-ledger': {
    insights: [
      {
        heading: 'Double-entry ledger ensures balances always reconcile',
        body:
          'Every debit has a matching credit across accounts. Immutable append-only entries with running balances enable audit trails. Never update balances in place — insert new entries and compute aggregates.'
      },
      {
        heading: 'Idempotency and exactly-once illusion',
        body:
          'Payment APIs require idempotency keys and external reference IDs to survive retries. Reconciliation jobs compare internal ledger against processor statements daily. Strong consistency within the ledger; async settlement with card networks.'
      }
    ],
    references: [
      {
        title: 'Stripe Ledger',
        url: 'https://stripe.com/blog/ledger',
        source: 'Stripe Engineering',
        note: 'How Stripe models money movement with immutable ledger entries.'
      },
      {
        title: 'PayPal Idempotency',
        url: 'https://developer.paypal.com/api/rest/reference/idempotency/',
        source: 'PayPal',
        note: 'Industry pattern for safe payment retries.'
      },
      {
        title: 'ACID Transactions',
        url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/ch07.html',
        source: 'Kleppmann (DDIA)',
        note: 'Transaction isolation levels critical for financial correctness.'
      }
    ]
  },

  'case-studies/url-shortener': {
    insights: [
      {
        heading: 'Read-heavy ratio drives cache-first redirect path',
        body:
          'URL shorteners see 100:1 or higher read-to-write ratios. The redirect path must be sub-10 ms: edge cache → Redis → DB fallback. Writes can tolerate higher latency. Analytics belong on an async queue, never blocking 301/302 responses.'
      },
      {
        heading: 'Code generation strategy affects collision and hot-key risk',
        body:
          'Base62 counter IDs are compact and sequential but need a highly available ID generator. Random hashes avoid coordination but need collision checks. Custom aliases require uniqueness constraints and reserved-word filtering.'
      }
    ],
    references: [
      {
        title: 'System Design: Pastebin / Bit.ly',
        url: 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md',
        source: 'System Design Primer',
        note: 'Canonical interview walkthrough covering APIs, storage, and caching.'
      },
      {
        title: 'How We Built URL Shortener at Scale',
        url: 'https://blog.twitter.com/engineering/en_us/a/2010/another-url-shortener',
        source: 'Twitter Engineering',
        note: 'Real-world t.co design constraints and abuse handling.'
      },
      {
        title: 'Snowflake ID',
        url: 'https://github.com/twitter-archive/snowflake',
        source: 'Twitter',
        note: 'Distributed unique ID generation without central coordination.'
      }
    ]
  },

  'case-studies/web-crawler': {
    insights: [
      {
        heading: 'Politeness and robots.txt constrain crawl rate',
        body:
          'Respect crawl-delay and disallow rules per domain. A frontier queue prioritizes URLs by PageRank estimates or freshness. Per-domain rate limiters prevent getting blocked. Distributed crawlers partition the URL space by hash of hostname.'
      },
      {
        heading: 'Deduplication at web scale needs probabilistic filters',
        body:
          'Billions of URLs cannot fit in a hash set. Bloom filters eliminate most duplicate fetches cheaply; exact dedup uses content checksums stored in a distributed key-value store. Canonical URL normalization prevents crawling mirrors.'
      }
    ],
    references: [
      {
        title: 'The Anatomy of a Large-Scale Hypertextual Web Search Engine',
        url: 'https://research.google/pubs/pub13/',
        source: 'Google Research (Brin & Page)',
        note: 'Original Google paper covering crawling, indexing, and PageRank.'
      },
      {
        title: 'Mercator Web Crawler',
        url: 'https://www.researchgate.net/publication/220657573_Mercator_A_Scalable_Extensible_Web_Crawler',
        source: 'Heydon & Najork',
        note: 'Classic crawler architecture with frontier management and politeness.'
      },
      {
        title: 'Robots Exclusion Protocol',
        url: 'https://www.rfc-editor.org/rfc/rfc9309',
        source: 'IETF RFC 9309',
        note: 'Standard for robots.txt semantics crawlers must honor.'
      }
    ]
  },

  'case-studies/social-graph': {
    insights: [
      {
        heading: 'Graph storage depends on query patterns',
        body:
          'Adjacency lists in a key-value store work for "who does user X follow?" Graph databases (Neo4j) optimize multi-hop traversals. For friend suggestions, precompute candidate lists offline with batch jobs on the graph.'
      },
      {
        heading: 'Mutual follow vs one-way follow changes data model',
        body:
          'Twitter-style asymmetric follows need separate follower and following indexes. Facebook-style symmetric friendship simplifies queries but complicates write paths. Count denormalization (follower_count) requires async increment with periodic reconciliation.'
      }
    ],
    references: [
      {
        title: 'TAO: Facebook\'s Distributed Data Store',
        url: 'https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf',
        source: 'USENIX ATC 2013',
        note: 'Graph cache layer serving billions of social graph queries per second.'
      },
      {
        title: 'LinkedIn Economic Graph',
        url: 'https://engineering.linkedin.com/',
        source: 'LinkedIn Engineering',
        note: 'Professional graph modeling and recommendation infrastructure.'
      },
      {
        title: 'Graph Databases',
        url: 'https://neo4j.com/docs/getting-started/current/',
        source: 'Neo4j',
        note: 'When native graph storage beats relational adjacency tables.'
      }
    ]
  },

  'case-studies/query-cache': {
    insights: [
      {
        heading: 'Cache key is the normalized query string plus parameters',
        body:
          'Hash the SQL or search query after canonicalization (lowercase, sorted params). TTL depends on data freshness requirements — stock prices need seconds, static content hours. Invalidate on write via table-change triggers or event streams.'
      },
      {
        heading: 'Stampede protection is mandatory for popular queries',
        body:
          'A cache miss on a hot query triggers thousands of identical DB hits. Single-flight locking lets one request populate while others wait. Probabilistic early refresh spreads recomputation over time.'
      }
    ],
    references: [
      {
        title: 'Memcached',
        url: 'https://memcached.org/',
        source: 'Memcached',
        note: 'Classic distributed memory cache used for query result caching.'
      },
      {
        title: 'MySQL Query Cache (historical context)',
        url: 'https://dev.mysql.com/doc/refman/5.7/en/query-cache.html',
        source: 'MySQL',
        note: 'Why server-side query caching was removed — lessons for app-level caching.'
      },
      {
        title: 'Varnish Cache',
        url: 'https://varnish-cache.org/docs/',
        source: 'Varnish',
        note: 'HTTP reverse proxy caching for full-page and fragment caching.'
      }
    ]
  },

  'case-studies/scaling-playbook': {
    insights: [
      {
        heading: 'Scale in phases: vertical → optimize → horizontal → shard',
        body:
          'Premature sharding adds years of operational pain. First profile and index, then cache, then read replicas, then partition. Each phase should be triggered by measured bottlenecks, not anticipated ones.'
      },
      {
        heading: 'Identify the constraint before adding components',
        body:
          'Adding Redis when CPU is the bottleneck wastes effort. Use metrics to find whether you are bound by reads, writes, storage, or network egress. The scaling playbook is a decision tree, not a checklist of technologies.'
      }
    ],
    references: [
      {
        title: 'Scalability for Dummies',
        url: 'https://www.lecloud.net/tagged/scalability',
        source: 'Le Cloud (Jacques Chester)',
        note: 'Classic blog series on scaling stages from single server to sharded clusters.'
      },
      {
        title: 'High Scalability Blog',
        url: 'https://highscalability.com/',
        source: 'High Scalability',
        note: 'Real architecture postmortems from major internet companies.'
      },
      {
        title: 'The Art of Scalability',
        url: 'https://artofscalability.com/',
        source: 'Abbott & Fisher',
        note: 'Scale cube framework: X (clones), Y (split), Z (split by geography).'
      }
    ]
  },

  'case-studies/pastebin': {
    insights: [
      {
        heading: 'Object storage suits large text blobs; metadata stays relational',
        body:
          'Paste content can be megabytes — store blobs in S3 with metadata (title, expiry, view count) in Postgres. Small pastes may inline in the database for simplicity. Expiration uses lifecycle policies on object storage plus TTL indexes.'
      },
      {
        heading: 'Syntax highlighting and raw view are CDN-friendly',
        body:
          'Rendered HTML for popular pastes can be cached at the edge. Raw text endpoints serve with text/plain for curl users. Abuse scanning (malware, PII) runs async on upload before public visibility.'
      }
    ],
    references: [
      {
        title: 'Pastebin System Design',
        url: 'https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md',
        source: 'System Design Primer',
        note: 'Step-by-step design for create, read, and expiration APIs.'
      },
      {
        title: 'GitHub Gist Architecture',
        url: 'https://github.blog/engineering/',
        source: 'GitHub Engineering',
        note: 'Code snippet storage patterns at GitHub scale.'
      },
      {
        title: 'S3 Object Lifecycle',
        url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html',
        source: 'AWS',
        note: 'Automated expiration and tiering for time-limited content.'
      }
    ]
  },

  'case-studies/mint': {
    insights: [
      {
        heading: 'Personal finance aggregation requires secure credential vaulting',
        body:
          'Bank credentials never touch your servers directly — use Plaid/Yodlee-style aggregators with tokenized access. Transaction categorization runs ML pipelines offline. Users expect near-real-time sync but banks rate-limit pulls.'
      },
      {
        heading: 'Read-heavy dashboards with write bursts on sync',
        body:
          'Cache aggregated monthly summaries per user. Full transaction history paginates from a column store or partitioned relational DB. Duplicate transaction detection uses fuzzy matching on amount, date, and merchant.'
      }
    ],
    references: [
      {
        title: 'Plaid API',
        url: 'https://plaid.com/docs/api/',
        source: 'Plaid',
        note: 'Industry-standard financial data aggregation API design.'
      },
      {
        title: 'Mint Data Aggregation',
        url: 'https://www.intuit.com/blog/innovative-thinking/',
        source: 'Intuit',
        note: 'How Intuit approaches secure bank connectivity at scale.'
      },
      {
        title: 'PCI DSS',
        url: 'https://www.pcisecuritystandards.org/document_library/',
        source: 'PCI Security Standards Council',
        note: 'Compliance requirements when handling payment-adjacent financial data.'
      }
    ]
  },

  'case-studies/twitter': {
    insights: [
      {
        heading: 'Timeline fan-out dominated Twitter\'s scaling story',
        body:
          'Early Twitter used pull-based timelines; scaling forced push fan-out to Redis for normal users and hybrid merge for celebrities. Tweet IDs from Snowflake sort chronologically without a central sequencer bottleneck.'
      },
      {
        heading: 'Search and trends are separate subsystems',
        body:
          'Real-time search indexes tweets on ingestion via Storm/Kafka pipelines. Trending topics use sliding-window counters with heavy-hitters algorithms. Decouple these from the write path to protect core tweeting latency.'
      }
    ],
    references: [
      {
        title: 'The Infrastructure Behind Twitter Scale',
        url: 'https://www.infoq.com/presentations/Twitter-Timeline-Scalability/',
        source: 'InfoQ',
        note: 'Raffi Krikorian on timeline fan-out and Redis caching layers.'
      },
      {
        title: 'Snowflake',
        url: 'https://github.com/twitter-archive/snowflake',
        source: 'Twitter',
        note: '64-bit distributed ID scheme used for tweet ordering.'
      },
      {
        title: 'Manhattan: Twitter\'s Distributed Database',
        url: 'https://blog.twitter.com/engineering/en_us/a/2014/manhattan-our-real-time-multi-tenant-distributed-database-for-twitter-scale',
        source: 'Twitter Engineering',
        note: 'Custom storage engine for timelines, tweets, and social graph.'
      }
    ]
  },

  'case-studies/sales-rank': {
    insights: [
      {
        heading: 'Sliding window counters approximate real-time rankings',
        body:
          'Exact global sorting of millions of products by sales is expensive. Count-min sketch or time-bucketed counters (per-minute hashes) estimate top sellers. Periodic batch jobs reconcile approximate ranks with ground truth.'
      },
      {
        heading: 'Category-scoped ranks reduce computation',
        body:
          'Precompute top-N per category shard rather than one global leaderboard. Stream processing (Flink) updates ranks on order events with watermarks for late arrivals. Cache category pages at CDN with short TTL.'
      }
    ],
    references: [
      {
        title: 'Amazon Best Sellers Rank',
        url: 'https://sellercentral.amazon.com/help/hub/reference/external/G200335450',
        source: 'Amazon Seller Central',
        note: 'How Amazon explains rank as a relative, time-weighted signal.'
      },
      {
        title: 'Count-Min Sketch',
        url: 'https://en.wikipedia.org/wiki/Count%E2%80%93min_sketch',
        source: 'Wikipedia',
        note: 'Probabilistic structure for frequency estimation in streaming ranks.'
      },
      {
        title: 'Apache Kafka Streams',
        url: 'https://kafka.apache.org/documentation/streams/',
        source: 'Apache Kafka',
        note: 'Real-time aggregation and windowed counts for ranking pipelines.'
      }
    ]
  }
};
