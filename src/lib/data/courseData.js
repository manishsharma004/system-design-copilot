export const siteOverview = {
  "title": "System Design Copilot",
  "subtitle": "A complete system design interview prep curriculum with topic guides, diagrams, trade-offs, and case studies.",
  "description": "Study foundations, architecture patterns, storage, caching, reliability, security, and end-to-end design drills in a mobile-friendly SvelteKit site.",
  "studyTracks": [
    {
      "title": "Interview sprint",
      "summary": "Use the lesson checklists and case studies to rehearse the order of an interview answer in 7 to 10 days.",
      "steps": [
        "Clarify requirements",
        "Estimate scale",
        "Draw the critical path",
        "Deep dive into one risky area",
        "Close with trade-offs and operations"
      ]
    },
    {
      "title": "Deep understanding",
      "summary": "Move module by module to build intuition for when each component is useful and what it costs operationally.",
      "steps": [
        "Read the lesson summary",
        "Study the diagram",
        "Review failure modes",
        "Answer the interview prompts",
        "Mark the lesson complete after you can explain it aloud"
      ]
    },
    {
      "title": "System walkthrough practice",
      "summary": "Use the case-study module to simulate whiteboard conversations and connect multiple lessons together.",
      "steps": [
        "Pick a product prompt",
        "State assumptions",
        "Choose storage and edge patterns",
        "Add scaling and resilience controls",
        "Compare alternatives"
      ]
    }
  ],
  "studyLoop": [
    "Start from user-visible requirements and failure expectations.",
    "Quantify the read path, write path, and growth curve before choosing tools.",
    "Use diagrams to explain where latency, state, and replication live.",
    "Practice trade-offs, bottlenecks, and rollback plans out loud."
  ],
  "sourceAttribution": {
    "name": "The System Design Primer",
    "url": "https://github.com/donnemartin/system-design-primer",
    "license": "CC BY 4.0",
    "licenseUrl": "http://creativecommons.org/licenses/by/4.0/",
    "note": "Selected diagrams and topic framing were adapted from The System Design Primer by Donne Martin."
  }
};

export const modules = [
  {
    "slug": "foundations",
    "title": "Foundations and estimation",
    "summary": "Build the habit of turning vague prompts into concrete requirements, scale assumptions, and explicit trade-offs.",
    "objectives": [
      "Frame product requirements before picking components",
      "Estimate traffic, storage, and throughput with quick math",
      "Explain performance, scalability, consistency, and availability in interviewer-friendly language"
    ],
    "lessons": [
      {
        "slug": "problem-framing",
        "title": "Problem framing and requirements",
        "summary": "Start every design with the user journey, hard constraints, and the two or three metrics that will define success.",
        "duration": "25-35 min",
        "whyItMatters": "Strong interview answers feel structured because the requirements phase narrows the search space before any component is introduced.",
        "sections": [
          {
            "heading": "What to ask first",
            "body": "Clarify the product surface area, core actors, read/write mix, latency expectations, consistency expectations, and what must still work during a partial outage.",
            "bullets": [
              "Who are the primary actors and what is the most common request path?",
              "What is the target peak QPS, growth rate, and geographic footprint?",
              "What data absolutely cannot be lost or shown stale?"
            ]
          },
          {
            "heading": "Translate goals into system constraints",
            "body": "Convert business language into engineering budgets. A chat product implies fan-out and ordering questions, while a payments product implies auditability and idempotency.",
            "bullets": [
              "Capture latency SLOs per critical endpoint",
              "Separate durability from availability requirements",
              "Identify compliance, privacy, and abuse constraints early"
            ]
          },
          {
            "heading": "Shape the rest of the conversation",
            "body": "State assumptions and choose one baseline architecture quickly so the discussion can move to trade-offs instead of staying abstract.",
            "bullets": [
              "Draw the critical read path and write path",
              "Call out the first likely bottleneck",
              "Mention one future scaling lever you would keep available"
            ]
          }
        ],
        "checklist": [
          "Open with user-facing requirements and non-functional constraints.",
          "State traffic assumptions numerically, even if they are rough.",
          "Choose a baseline design before exploring optimizations.",
          "Explicitly call out one thing that is out of scope for the first version."
        ],
        "pitfalls": [
          "Jumping into storage or queues before the workload is clear.",
          "Treating consistency, durability, and availability as the same thing.",
          "Ignoring operational requirements such as moderation, analytics, or abuse prevention."
        ],
        "interviewPrompts": [
          "What five questions would you ask before designing a notifications service?",
          "Which requirement usually changes the architecture the most: latency, correctness, or cost? Why?",
          "How would your framing change for an internal admin tool versus a global consumer app?"
        ],
        "diagram": null,
        "related": [
          "capacity-estimation",
          "availability-consistency-cap"
        ],
        "moduleSlug": "foundations",
        "moduleTitle": "Foundations and estimation",
        "order": 1,
        "id": "foundations/problem-framing"
      },
      {
        "slug": "capacity-estimation",
        "title": "Back-of-the-envelope estimation",
        "summary": "Use quick arithmetic to size read/write traffic, storage growth, cache footprint, and inter-service bandwidth before deep diving.",
        "duration": "25-35 min",
        "whyItMatters": "Interviewers care less about perfect numbers than about whether your estimates are directionally correct and connected to design decisions.",
        "sections": [
          {
            "heading": "Estimate the steady state",
            "body": "Start from DAU, requests per user, and object size. Convert the product story into QPS, storage growth per day, and bandwidth per request path.",
            "bullets": [
              "Peak QPS is often 2x to 10x the average depending on workload shape",
              "Write amplification matters for indexes, replicas, and event logs",
              "Storage growth should include primary data, indexes, backups, and derived views"
            ]
          },
          {
            "heading": "Use mental reference numbers",
            "body": "Latency numbers, powers of two, and rough infrastructure limits help you reject unrealistic designs early.",
            "bullets": [
              "1 KB \u2248 10^3 bytes, 1 MB \u2248 10^6 bytes, 1 GB \u2248 10^9 bytes",
              "Cross-region round trips are orders of magnitude slower than memory access",
              "A cache hit that avoids disk or network hops usually changes the bottleneck dramatically"
            ]
          },
          {
            "heading": "Tie estimates to architecture choices",
            "body": "Each estimate should justify something: a CDN for global static traffic, sharding for write throughput, or asynchronous pipelines for burst smoothing.",
            "bullets": [
              "Estimate hot-key risk, not just total volume",
              "Consider recovery bandwidth for backups and replica catch-up",
              "Show how growth changes the next architectural step"
            ]
          }
        ],
        "checklist": [
          "Calculate average and peak QPS.",
          "Estimate storage growth for 1 day and 1 year.",
          "Account for replicas, indexes, and cached copies.",
          "Use numbers to justify scaling decisions rather than quoting them in isolation."
        ],
        "pitfalls": [
          "Forgetting that reads and writes fan out into caches, indexes, and logs.",
          "Using unrealistic object sizes or ignoring metadata overhead.",
          "Treating averages as enough for bursty traffic."
        ],
        "interviewPrompts": [
          "For a URL shortener with 100 million new links per month, what is the yearly storage requirement?",
          "How would a read-heavy social feed change your cache estimate?",
          "When is a rough estimate sufficient and when should you refine it?"
        ],
        "diagram": null,
        "related": [
          "problem-framing",
          "caching-layers"
        ],
        "moduleSlug": "foundations",
        "moduleTitle": "Foundations and estimation",
        "order": 2,
        "id": "foundations/capacity-estimation"
      },
      {
        "slug": "performance-vs-scalability",
        "title": "Performance vs. scalability",
        "summary": "Performance describes how fast one request path is now; scalability describes how gracefully the system behaves as load, data, or team size grows.",
        "duration": "25-35 min",
        "whyItMatters": "Good designs keep today\u2019s latency reasonable while preserving low-friction ways to add capacity later.",
        "sections": [
          {
            "heading": "Performance is about the current experience",
            "body": "Single-request latency, CPU usage, memory pressure, and tail latency tell you how a design performs at the current scale.",
            "bullets": [
              "Measure p50 and p99, not just averages",
              "A fast design can still fail badly under growth if it centralizes state",
              "Performance tuning often targets the critical path or hot keys"
            ]
          },
          {
            "heading": "Scalability is about shape under growth",
            "body": "A scalable design can add capacity without excessive coordination, downtime, or operational pain.",
            "bullets": [
              "Look for stateless tiers, partitionable state, and asynchronous work",
              "Beware components that require global locks or single leaders for every request",
              "Operational scalability also matters: can a small team run this?"
            ]
          },
          {
            "heading": "Use both in trade-off language",
            "body": "Sometimes a vertically scaled database performs well early, but horizontal approaches age better. State which phase you are optimizing for and why.",
            "bullets": [
              "Optimize the first bottleneck, not hypothetical future ones",
              "Reserve escape hatches such as partition keys or event logs",
              "Prefer incremental scalability over all-at-once rewrites"
            ]
          }
        ],
        "checklist": [
          "Differentiate fast now from easy to grow later.",
          "Name which component becomes the bottleneck first.",
          "Explain how the next 10x growth step changes the architecture.",
          "Consider operational complexity as part of scalability."
        ],
        "pitfalls": [
          "Calling any high-throughput system scalable without discussing coordination costs.",
          "Confusing vertical scaling with an indefinite solution.",
          "Ignoring team ownership boundaries and operational load."
        ],
        "interviewPrompts": [
          "Give an example of a design that performs well but scales poorly.",
          "When is vertical scaling the right answer?",
          "How would you explain scalability to a non-infrastructure stakeholder?"
        ],
        "diagram": null,
        "related": [
          "latency-throughput-slos",
          "partitioning-and-sharding"
        ],
        "moduleSlug": "foundations",
        "moduleTitle": "Foundations and estimation",
        "order": 3,
        "id": "foundations/performance-vs-scalability"
      },
      {
        "slug": "latency-throughput-slos",
        "title": "Latency, throughput, and SLOs",
        "summary": "Reason about how much work the system can do, how long each request takes, and which percentile targets users actually feel.",
        "duration": "25-35 min",
        "whyItMatters": "This is the language that connects product promises to capacity planning, queues, caches, and admission control.",
        "sections": [
          {
            "heading": "Latency is the user-visible delay",
            "body": "Latency comes from network hops, serialization, locks, cache misses, storage I/O, and retries. Tail latency often dominates user pain.",
            "bullets": [
              "Track p50 for typical experience and p95/p99 for worst-case experience",
              "One slow dependency can dominate the whole request fan-out",
              "Synchronous cross-region calls are expensive in latency budgets"
            ]
          },
          {
            "heading": "Throughput is sustained work per unit time",
            "body": "Throughput depends on concurrency, parallelism, batching, and how much coordination each request requires.",
            "bullets": [
              "Queues can smooth bursts even when average throughput is healthy",
              "Throughput ceilings often appear before CPU is fully saturated",
              "Back pressure protects latency by refusing or delaying excess work"
            ]
          },
          {
            "heading": "SLOs drive trade-offs",
            "body": "A stated objective such as 99.9% of writes under 200 ms creates a design target for replicas, cache placement, and fallback behavior.",
            "bullets": [
              "Separate user-facing SLOs from internal targets",
              "Include error budgets and degraded modes",
              "Make clear which endpoints need stronger guarantees than others"
            ]
          }
        ],
        "checklist": [
          "Use percentile latency, not only averages.",
          "Call out both average load and peak concurrency.",
          "Tie SLOs to architecture choices and fallback behavior.",
          "Discuss how you would detect SLO regression in production."
        ],
        "pitfalls": [
          "Assuming throughput improvements always help latency.",
          "Ignoring tail latency in fan-out systems.",
          "Treating SLOs as static even when product requirements differ by endpoint."
        ],
        "interviewPrompts": [
          "Why can adding retries improve availability but hurt latency?",
          "How do queues change throughput without necessarily improving latency?",
          "Which percentile would you optimize for a checkout flow and why?"
        ],
        "diagram": null,
        "related": [
          "availability-consistency-cap",
          "queues-and-streams"
        ],
        "moduleSlug": "foundations",
        "moduleTitle": "Foundations and estimation",
        "order": 4,
        "id": "foundations/latency-throughput-slos"
      },
      {
        "slug": "availability-consistency-cap",
        "title": "Availability, consistency, and CAP trade-offs",
        "summary": "Designs under partition must choose whether to prioritize fresh coordinated answers or continued service with potentially stale data.",
        "duration": "25-35 min",
        "whyItMatters": "Many interview prompts become easier when you can place each operation on the spectrum between strict correctness and graceful degradation.",
        "sections": [
          {
            "heading": "Use precise definitions",
            "body": "Availability means every request receives a non-error response. Consistency means readers observe the most recent successful write according to the chosen model.",
            "bullets": [
              "Durability is separate from both availability and consistency",
              "Different operations in the same product may need different consistency levels",
              "Partitions are not rare edge cases in distributed systems"
            ]
          },
          {
            "heading": "Read CAP correctly",
            "body": "During a network partition, a distributed system cannot fully provide both availability and strong consistency for every operation. Real systems make operation-specific choices.",
            "bullets": [
              "Account settings may favor consistency over availability",
              "Feed ranking may prefer availability with eventual consistency",
              "Quorums, leaders, and leases help you navigate the trade-off space"
            ]
          },
          {
            "heading": "Explain the user impact",
            "body": "Trade-offs are easier to justify when you connect them to visible outcomes: duplicate notifications, stale counters, temporary read-only modes, or retriable write failures.",
            "bullets": [
              "Name the degraded mode you will accept during partition",
              "Mention reconciliation or repair mechanisms",
              "Show where product semantics allow stale or approximate answers"
            ]
          }
        ],
        "checklist": [
          "State the consistency requirement per critical operation.",
          "Describe the system behavior during partition, failover, and recovery.",
          "Differentiate strong, eventual, and session-level guarantees.",
          "Explain the user-visible consequence of each trade-off."
        ],
        "pitfalls": [
          "Saying a whole product is simply CP or AP without qualifying the operation.",
          "Equating eventual consistency with random inconsistency.",
          "Ignoring repair work after the partition heals."
        ],
        "interviewPrompts": [
          "Which parts of a social feed can be eventually consistent?",
          "How would you design an order placement flow during a regional partition?",
          "When is temporary unavailability preferable to stale reads?"
        ],
        "diagram": {
          "src": "/primer-images/bgLMI2u.png",
          "alt": "CAP theorem triangle diagram",
          "caption": "A useful mental model for explaining partition-time trade-offs.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "replication-and-failover",
          "idempotency-retries-backpressure"
        ],
        "moduleSlug": "foundations",
        "moduleTitle": "Foundations and estimation",
        "order": 5,
        "id": "foundations/availability-consistency-cap"
      }
    ]
  },
  {
    "slug": "edge-and-routing",
    "title": "Networking, edge, and request routing",
    "summary": "Learn how requests find your system, how traffic is distributed, and where you terminate policy, caching, and security controls.",
    "objectives": [
      "Explain DNS, CDNs, and load balancers as separate layers",
      "Choose between L4 and L7 routing based on needed controls",
      "Use edge layers to reduce latency and shield origin services"
    ],
    "lessons": [
      {
        "slug": "dns",
        "title": "DNS fundamentals",
        "summary": "DNS maps names to endpoints and lets you steer traffic geographically, by health, or by weighted rollout without changing clients.",
        "duration": "25-35 min",
        "whyItMatters": "Many high-level designs start at the wrong place. DNS is often the first layer that shapes latency, failover, and migration strategy.",
        "sections": [
          {
            "heading": "What DNS actually does",
            "body": "Resolvers follow delegation from root to TLD to authoritative servers and cache answers based on TTL.",
            "bullets": [
              "A and AAAA records map names to IPs",
              "CNAME records alias names",
              "Low TTLs help migrations but increase resolver traffic"
            ]
          },
          {
            "heading": "Traffic steering patterns",
            "body": "Managed DNS can support weighted, latency-based, and geo-aware routing to shift users toward healthy regions or gradual rollouts.",
            "bullets": [
              "Use health checks to avoid routing users to failed regions",
              "Remember that DNS failover is not instant because of caching",
              "Steering works best when the application is region-aware"
            ]
          },
          {
            "heading": "Operational caveats",
            "body": "DNS is eventually consistent and cached by many layers, so it is better for coarse routing than for per-request balancing.",
            "bullets": [
              "Avoid depending on instant TTL expiry",
              "Plan for stale records during incidents",
              "Combine DNS with regional load balancers for fine-grained control"
            ]
          }
        ],
        "checklist": [
          "Explain recursive lookup, caching, and TTL.",
          "Use DNS for coarse traffic steering, not every balancing decision.",
          "Mention latency, geo, or weighted routing when multi-region matters.",
          "Call out the delay between a DNS change and user impact."
        ],
        "pitfalls": [
          "Treating DNS as immediate failover.",
          "Ignoring resolver and browser caching.",
          "Putting application-level routing logic entirely in DNS."
        ],
        "interviewPrompts": [
          "When would you use weighted DNS instead of an L7 load balancer?",
          "How do TTL choices affect planned cutovers?",
          "What happens if one region fails but clients still cache its record?"
        ],
        "diagram": {
          "src": "/primer-images/IOyLj4i.jpg",
          "alt": "DNS hierarchy diagram",
          "caption": "DNS resolution and delegation are useful to explain before regional routing decisions.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "cdn",
          "load-balancing"
        ],
        "moduleSlug": "edge-and-routing",
        "moduleTitle": "Networking, edge, and request routing",
        "order": 1,
        "id": "edge-and-routing/dns"
      },
      {
        "slug": "cdn",
        "title": "Content delivery networks",
        "summary": "A CDN moves cacheable content closer to users and can absorb large amounts of read traffic before requests ever reach origin infrastructure.",
        "duration": "25-35 min",
        "whyItMatters": "For global products, edge caching is often the fastest latency improvement and the cheapest way to reduce origin load.",
        "sections": [
          {
            "heading": "What belongs at the edge",
            "body": "Static assets, media, rendered fragments, and sometimes API responses with clear caching semantics are good CDN candidates.",
            "bullets": [
              "Use cache-control headers to express freshness",
              "Separate immutable assets from personalized data",
              "Origin shielding can reduce thundering herds toward the origin"
            ]
          },
          {
            "heading": "Push vs. pull models",
            "body": "Push CDNs pre-load content; pull CDNs fetch on demand and cache after the first request. Most web products rely on pull behavior for simplicity.",
            "bullets": [
              "Pre-warm popular content before launches",
              "Think about invalidation for mutable assets",
              "Signed URLs help protect private content"
            ]
          },
          {
            "heading": "Trade-offs and metrics",
            "body": "Cache hit ratio, origin offload, egress cost, and regional latency tell you whether the CDN is doing real work.",
            "bullets": [
              "Personalized responses lower cacheability",
              "Hot content benefits from long TTLs and immutable naming",
              "CDNs can also terminate TLS and apply bot/rate controls"
            ]
          }
        ],
        "checklist": [
          "Separate cacheable, immutable, and personalized responses.",
          "Mention cache keys, TTLs, and invalidation.",
          "Use the CDN as both performance and protection layer.",
          "Track hit ratio and origin offload."
        ],
        "pitfalls": [
          "Caching personalized responses without varying on identity or headers.",
          "Ignoring invalidation for mutable assets.",
          "Assuming a CDN removes the need for origin capacity planning."
        ],
        "interviewPrompts": [
          "What content would you intentionally avoid putting behind a CDN?",
          "How would you roll out a new web bundle without stale asset bugs?",
          "Why can a CDN lower both latency and cost?"
        ],
        "diagram": {
          "src": "/primer-images/h9TAuGI.jpg",
          "alt": "CDN edge and origin diagram",
          "caption": "Edge caches reduce user distance and shield the origin from repeated reads.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "dns",
          "caching-layers"
        ],
        "moduleSlug": "edge-and-routing",
        "moduleTitle": "Networking, edge, and request routing",
        "order": 2,
        "id": "edge-and-routing/cdn"
      },
      {
        "slug": "load-balancing",
        "title": "Load balancing",
        "summary": "Load balancers distribute requests across healthy backends and are the main control point for availability, failover, and safe scaling at the service edge.",
        "duration": "25-35 min",
        "whyItMatters": "They are foundational because almost every stateless tier depends on balancing to survive failures and scale horizontally.",
        "sections": [
          {
            "heading": "L4 vs. L7 balancing",
            "body": "Layer 4 balancing routes by transport metadata, while Layer 7 balancing understands HTTP details and can route by host, path, or headers.",
            "bullets": [
              "Choose L4 for simple, high-throughput transport routing",
              "Choose L7 when you need sticky sessions, canarying, or auth-aware policies",
              "Managed platforms often combine both layers"
            ]
          },
          {
            "heading": "Healthy routing and failover",
            "body": "Balancers use health checks and connection draining to stop sending users to degraded instances during deploys or incidents.",
            "bullets": [
              "Active-active improves utilization and failover speed",
              "Active-passive can simplify correctness-sensitive services",
              "Cross-zone balancing changes both resilience and data transfer cost"
            ]
          },
          {
            "heading": "Operational features",
            "body": "Modern balancers often terminate TLS, emit metrics, apply rate limits, and support weighted rollouts.",
            "bullets": [
              "Session affinity can help stateful migrations but hurts elasticity",
              "Keep backends stateless whenever possible",
              "Observe queue depth, connection count, and backend error rates"
            ]
          }
        ],
        "checklist": [
          "Explain how requests are distributed and how unhealthy nodes are removed.",
          "Choose L4 or L7 based on needed routing logic.",
          "Mention connection draining and rolling deploy behavior.",
          "Avoid storing sticky state in a tier that should scale horizontally."
        ],
        "pitfalls": [
          "Using sticky sessions as a default instead of fixing state management.",
          "Ignoring TLS termination and certificate rotation.",
          "Forgetting that load balancers are also failure domains."
        ],
        "interviewPrompts": [
          "When does L7 routing justify the extra complexity?",
          "How would you keep deploys safe behind a load balancer?",
          "Why is session affinity usually a temporary compromise?"
        ],
        "diagram": {
          "src": "/primer-images/h81n9iK.png",
          "alt": "Load balancer in front of app servers",
          "caption": "Load balancers enable horizontal scaling and failover for stateless service tiers.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "reverse-proxies-and-gateways",
          "service-discovery"
        ],
        "moduleSlug": "edge-and-routing",
        "moduleTitle": "Networking, edge, and request routing",
        "order": 3,
        "id": "edge-and-routing/load-balancing"
      },
      {
        "slug": "reverse-proxies-and-gateways",
        "title": "Reverse proxies, gateways, and edge policy",
        "summary": "Reverse proxies shape inbound traffic by terminating TLS, applying caching and compression, enforcing auth, and routing to internal services.",
        "duration": "25-35 min",
        "whyItMatters": "They let you keep backend services simpler and more focused while centralizing cross-cutting concerns.",
        "sections": [
          {
            "heading": "Reverse proxy role",
            "body": "A reverse proxy sits in front of application servers, unlike a forward proxy that acts on behalf of clients.",
            "bullets": [
              "Good place for TLS termination, header normalization, and compression",
              "Can cache shared responses close to the application tier",
              "Often paired with WAF or bot controls"
            ]
          },
          {
            "heading": "API gateways and service exposure",
            "body": "Gateways aggregate routing, authentication, request shaping, and sometimes schema translation for internal microservices.",
            "bullets": [
              "Useful when clients should not know internal service topology",
              "Keep gateway logic thin to avoid creating a monolith choke point",
              "Prefer clear ownership of shared policies"
            ]
          },
          {
            "heading": "When to split concerns",
            "body": "CDN, load balancer, reverse proxy, and gateway can coexist. Explain what each layer owns instead of collapsing them into one vague box.",
            "bullets": [
              "CDN: edge caching and global acceleration",
              "Load balancer: healthy distribution",
              "Gateway/proxy: policy, routing, and internal exposure control"
            ]
          }
        ],
        "checklist": [
          "Differentiate reverse proxy, gateway, CDN, and load balancer.",
          "Use the proxy tier for shared cross-cutting behavior.",
          "Keep business logic out of the gateway.",
          "Discuss observability and auth policies at the edge."
        ],
        "pitfalls": [
          "Calling every front-door component a load balancer.",
          "Stuffing product-specific orchestration into the gateway.",
          "Ignoring hop-by-hop headers, compression cost, or auth propagation."
        ],
        "interviewPrompts": [
          "What belongs in an API gateway versus inside a service?",
          "How would you roll out a new auth policy safely?",
          "When should a reverse proxy cache responses?"
        ],
        "diagram": {
          "src": "/primer-images/n41Azff.png",
          "alt": "Reverse proxy diagram",
          "caption": "Reverse proxies centralize policy and hide internal topology from clients.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "load-balancing",
          "api-design"
        ],
        "moduleSlug": "edge-and-routing",
        "moduleTitle": "Networking, edge, and request routing",
        "order": 4,
        "id": "edge-and-routing/reverse-proxies-and-gateways"
      },
      {
        "slug": "rate-limiting-and-edge-protection",
        "title": "Rate limiting and edge protection",
        "summary": "Protect critical services from abusive clients, noisy neighbors, and self-inflicted overload before the core system becomes unstable.",
        "duration": "25-35 min",
        "whyItMatters": "Abuse resistance is part of system design; a product that collapses under spikes or bots is not production ready.",
        "sections": [
          {
            "heading": "Choose the right limiting unit",
            "body": "Limits can apply per user, API key, IP, tenant, region, or endpoint depending on product semantics and attack surface.",
            "bullets": [
              "Token bucket is common for burst allowance",
              "Leaky bucket smooths output rate",
              "Sliding window logs are accurate but more expensive"
            ]
          },
          {
            "heading": "Place enforcement carefully",
            "body": "Rate limits near the edge protect origin resources early, while service-local limits protect expensive internals with finer semantics.",
            "bullets": [
              "Use edge limits for broad abuse patterns",
              "Use per-tenant quotas deeper in the stack",
              "Combine limits with queue back pressure and circuit breakers"
            ]
          },
          {
            "heading": "Plan the user experience",
            "body": "Good systems return clear retry semantics, degrade gracefully, and distinguish between accidental bursts and malicious behavior.",
            "bullets": [
              "Return structured retry headers or error bodies",
              "Prefer soft limits plus warnings for internal customers",
              "Track block rates and false positives"
            ]
          }
        ],
        "checklist": [
          "Name who is being limited and why.",
          "Choose an algorithm that matches burst tolerance.",
          "Place coarse protection at the edge and fine limits near expensive resources.",
          "Explain retry messaging and observability."
        ],
        "pitfalls": [
          "Using IP-only limits for authenticated multi-tenant workloads.",
          "Relying on a single centralized limiter that becomes a bottleneck.",
          "Blocking without clear client feedback or monitoring."
        ],
        "interviewPrompts": [
          "How would you protect a login API from credential stuffing?",
          "When would you rate-limit by tenant instead of by user?",
          "What metrics tell you the limiter is too strict or too weak?"
        ],
        "diagram": null,
        "related": [
          "latency-throughput-slos",
          "idempotency-retries-backpressure"
        ],
        "moduleSlug": "edge-and-routing",
        "moduleTitle": "Networking, edge, and request routing",
        "order": 5,
        "id": "edge-and-routing/rate-limiting-and-edge-protection"
      }
    ]
  },
  {
    "slug": "application-architecture",
    "title": "Application architecture and APIs",
    "summary": "Choose service boundaries, communication styles, and coordination patterns that fit both the workload and the team operating the system.",
    "objectives": [
      "Select application decomposition patterns intentionally",
      "Understand service discovery, coordination, and API trade-offs",
      "Handle synchronous and real-time communication without hiding costs"
    ],
    "lessons": [
      {
        "slug": "application-layer",
        "title": "Application layer responsibilities",
        "summary": "The application layer turns requests into business actions, coordinates data access, and owns the product semantics that infrastructure alone cannot express.",
        "duration": "25-35 min",
        "whyItMatters": "A clean application layer lets you scale capabilities independently without losing clarity around ownership and correctness.",
        "sections": [
          {
            "heading": "Separate concerns intentionally",
            "body": "Presentation, orchestration, domain logic, and persistence concerns often blur together in early systems. Draw boundaries so the main invariants remain obvious.",
            "bullets": [
              "Keep user-facing orchestration close to the business flow",
              "Move reusable infrastructure concerns into libraries or shared services",
              "Prefer explicit ownership over generic helper abstractions"
            ]
          },
          {
            "heading": "Stateless compute scales best",
            "body": "Application servers should usually stay stateless and push durable state into caches, databases, or event logs.",
            "bullets": [
              "Stateless services simplify balancing and failover",
              "Session state should be externalized if it must survive restarts",
              "Background workers often share logic with online services but have different latency goals"
            ]
          },
          {
            "heading": "Coordinate around domain boundaries",
            "body": "Structure services and modules around business capabilities, not just technical layers, so ownership remains stable as the team grows.",
            "bullets": [
              "Define clear APIs and data ownership",
              "Avoid shared mutable databases across many teams",
              "Use contracts and events for cross-boundary interactions"
            ]
          }
        ],
        "checklist": [
          "Explain what the application layer owns beyond request forwarding.",
          "Prefer stateless services for elasticity.",
          "Align boundaries with business capabilities.",
          "Keep invariants easy to locate and test."
        ],
        "pitfalls": [
          "Mixing infrastructure glue and business rules everywhere.",
          "Spreading one domain invariant across many services.",
          "Treating background jobs as an afterthought instead of part of the same workflow."
        ],
        "interviewPrompts": [
          "What logic belongs in the application layer rather than the database or gateway?",
          "How do you keep a stateless service from depending on hidden local state?",
          "What changes when one domain is owned by many teams?"
        ],
        "diagram": {
          "src": "/primer-images/yB5SYwm.png",
          "alt": "Application layer diagram",
          "caption": "The application layer coordinates domain logic between clients and storage systems.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "monolith-vs-microservices",
          "api-design"
        ],
        "moduleSlug": "application-architecture",
        "moduleTitle": "Application architecture and APIs",
        "order": 1,
        "id": "application-architecture/application-layer"
      },
      {
        "slug": "monolith-vs-microservices",
        "title": "Monoliths vs. microservices",
        "summary": "Choose decomposition based on coordination cost, deployment independence, and team boundaries rather than trend pressure.",
        "duration": "25-35 min",
        "whyItMatters": "Many interview answers become stronger when you can justify why a simple modular monolith is enough for an early phase and what pressures justify later extraction.",
        "sections": [
          {
            "heading": "What a monolith does well",
            "body": "A modular monolith makes local reasoning, transactions, and debugging simpler when one team owns the product.",
            "bullets": [
              "One deployment unit speeds early iteration",
              "In-process calls avoid network overhead",
              "Shared code is easy but can hide poor boundaries"
            ]
          },
          {
            "heading": "What microservices buy you",
            "body": "Service extraction helps when domains need independent scaling, deployment pace, language/runtime freedom, or stronger ownership boundaries.",
            "bullets": [
              "Independent scaling helps uneven workloads",
              "Failures can be isolated if dependencies are controlled",
              "Operational overhead rises quickly with service count"
            ]
          },
          {
            "heading": "Migration pressure signals",
            "body": "Use concrete signals such as deploy contention, divergent scaling needs, or ownership conflict to justify decomposition.",
            "bullets": [
              "Separate hot paths or data ownership first",
              "Create clear contracts before extracting data",
              "Plan observability and developer tooling before multiplying services"
            ]
          }
        ],
        "checklist": [
          "Show that a modular monolith is often a valid starting point.",
          "Extract services for a specific reason, not fashion.",
          "Call out data ownership and operational overhead.",
          "Mention migration steps rather than jumping from one extreme to another."
        ],
        "pitfalls": [
          "Equating microservices with automatic scalability.",
          "Splitting services before the domain is understood.",
          "Ignoring testing, local development, and observability costs."
        ],
        "interviewPrompts": [
          "What is the first signal that a monolith should be split?",
          "How would you extract one service safely from a monolith?",
          "When is a monolith still the better design even at scale?"
        ],
        "diagram": null,
        "related": [
          "application-layer",
          "service-discovery"
        ],
        "moduleSlug": "application-architecture",
        "moduleTitle": "Application architecture and APIs",
        "order": 2,
        "id": "application-architecture/monolith-vs-microservices"
      },
      {
        "slug": "service-discovery",
        "title": "Service discovery and coordination",
        "summary": "Distributed services need a way to locate healthy instances, coordinate leaders, and react to topology changes without manual reconfiguration.",
        "duration": "25-35 min",
        "whyItMatters": "Discovery and coordination are invisible when done well, but they shape failover behavior, deployment safety, and the blast radius of outages.",
        "sections": [
          {
            "heading": "Discovery patterns",
            "body": "Clients can discover service instances directly, or a sidecar/proxy can hide the topology. Registries maintain health-aware instance lists.",
            "bullets": [
              "Client-side discovery gives more control to the caller",
              "Server-side discovery simplifies clients",
              "Managed platforms often embed discovery in service meshes or load balancers"
            ]
          },
          {
            "heading": "Coordination patterns",
            "body": "Leader election, leases, heartbeats, and distributed locks support operations that should not run everywhere at once.",
            "bullets": [
              "Prefer idempotent work over broad locking when possible",
              "Use leases to avoid stale leaders during partitions",
              "Keep the coordination surface small"
            ]
          },
          {
            "heading": "Failure thinking",
            "body": "Discovery systems can themselves become critical dependencies. Explain fallback behavior, cache staleness, and how callers handle partial topology information.",
            "bullets": [
              "Cache endpoint lists locally with expiration",
              "Use retries with jitter when instances churn",
              "Observe registration freshness and health-check flapping"
            ]
          }
        ],
        "checklist": [
          "Explain how services find healthy peers.",
          "Mention registries, health checks, and local caching.",
          "Use coordination sparingly and prefer idempotency.",
          "Treat the discovery system as a failure domain with its own monitoring."
        ],
        "pitfalls": [
          "Centralizing every request through the discovery store.",
          "Using distributed locks when commutative or idempotent work would do.",
          "Ignoring stale endpoint lists and split-brain scenarios."
        ],
        "interviewPrompts": [
          "How would a worker discover partitions it should process?",
          "When is client-side discovery preferable?",
          "What happens if discovery data is slightly stale?"
        ],
        "diagram": null,
        "related": [
          "load-balancing",
          "idempotency-retries-backpressure"
        ],
        "moduleSlug": "application-architecture",
        "moduleTitle": "Application architecture and APIs",
        "order": 3,
        "id": "application-architecture/service-discovery"
      },
      {
        "slug": "api-design",
        "title": "API design: REST, RPC, and contracts",
        "summary": "Pick communication styles that match workflow complexity, evolution needs, and performance sensitivity.",
        "duration": "25-35 min",
        "whyItMatters": "The best API choice is the one that makes contracts understandable, evolvable, and efficient for the given clients.",
        "sections": [
          {
            "heading": "REST strengths",
            "body": "REST fits resource-oriented products, cacheable reads, and broad ecosystem compatibility. It works especially well when URLs and verbs map cleanly to product nouns and actions.",
            "bullets": [
              "HTTP semantics help with idempotency and caching",
              "Versioning and backward compatibility still require discipline",
              "Payload size and over-fetching can matter on hot paths"
            ]
          },
          {
            "heading": "RPC strengths",
            "body": "RPC is useful for strongly typed internal calls, explicit method contracts, and efficient binary serialization.",
            "bullets": [
              "Schema-first workflows improve consistency across teams",
              "Good for high-throughput internal service communication",
              "You must still handle timeouts, retries, and versioning carefully"
            ]
          },
          {
            "heading": "Design contracts, not only endpoints",
            "body": "State ownership, idempotency, pagination, error models, and auth scopes matter more than protocol fashion.",
            "bullets": [
              "Document retries and duplicate handling",
              "Keep backward-compatible changes easy",
              "Return stable identifiers and machine-readable errors"
            ]
          }
        ],
        "checklist": [
          "Choose the API style based on clients and workload.",
          "Discuss idempotency, pagination, and versioning.",
          "Keep contracts explicit and evolution-friendly.",
          "Mention timeouts, retries, and error models."
        ],
        "pitfalls": [
          "Treating RPC as automatically faster without considering network behavior.",
          "Designing REST APIs with action-heavy verbs but no resource model.",
          "Ignoring compatibility once multiple clients exist."
        ],
        "interviewPrompts": [
          "What makes an endpoint idempotent?",
          "When would you choose RPC over REST for an internal platform?",
          "How would you evolve an API used by mobile clients on old versions?"
        ],
        "diagram": {
          "src": "/primer-images/iF4Mkb5.png",
          "alt": "RPC communication diagram",
          "caption": "RPC makes remote calls feel local, but the network semantics still matter.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "realtime-delivery",
          "queues-and-streams"
        ],
        "moduleSlug": "application-architecture",
        "moduleTitle": "Application architecture and APIs",
        "order": 4,
        "id": "application-architecture/api-design"
      },
      {
        "slug": "realtime-delivery",
        "title": "Real-time delivery: WebSockets, SSE, and long polling",
        "summary": "When users expect live updates, choose a delivery model that matches fan-out shape, connection count, and the direction of data flow.",
        "duration": "25-35 min",
        "whyItMatters": "Real-time features are common in interviews because they force you to reason about connection state, pub/sub fan-out, and degraded modes.",
        "sections": [
          {
            "heading": "Pick by communication pattern",
            "body": "WebSockets support bidirectional low-latency streams; Server-Sent Events fit server-to-client updates; long polling is simpler but less efficient at scale.",
            "bullets": [
              "Chat and collaborative editing often need WebSockets",
              "Live dashboards often fit SSE",
              "Long polling remains useful for simpler infrastructure or legacy environments"
            ]
          },
          {
            "heading": "Handle fan-out and connection state",
            "body": "Persistent connections move cost from request rate to connection management, heartbeat handling, and per-node state.",
            "bullets": [
              "Use pub/sub or streams to broadcast updates across nodes",
              "Connection sharding and sticky routing may be necessary",
              "Back pressure and slow-consumer handling are critical"
            ]
          },
          {
            "heading": "Degraded modes matter",
            "body": "If real-time delivery fails, many products can fall back to periodic refresh or delayed notifications. Say that explicitly.",
            "bullets": [
              "Keep reconnect logic idempotent",
              "Replay missed events from a durable log when correctness matters",
              "Track connection counts, reconnect rate, and lag"
            ]
          }
        ],
        "checklist": [
          "Choose a protocol based on data direction and scale.",
          "Discuss connection management and pub/sub fan-out.",
          "Plan a fallback mode when sockets fail.",
          "Observe lag, reconnects, and slow consumers."
        ],
        "pitfalls": [
          "Using WebSockets everywhere by default.",
          "Ignoring sticky routing or shared subscription state.",
          "Forgetting replay or gap filling when updates matter."
        ],
        "interviewPrompts": [
          "How would you deliver live order-status updates?",
          "Why might SSE be better than WebSockets for a dashboard?",
          "How do you recover missed events after a reconnect?"
        ],
        "diagram": null,
        "related": [
          "queues-and-streams",
          "feed-timeline"
        ],
        "moduleSlug": "application-architecture",
        "moduleTitle": "Application architecture and APIs",
        "order": 5,
        "id": "application-architecture/realtime-delivery"
      }
    ]
  },
  {
    "slug": "data-storage",
    "title": "Data storage and indexing",
    "summary": "Match storage engines and data models to access patterns, write volume, consistency needs, and query flexibility.",
    "objectives": [
      "Explain relational and NoSQL trade-offs clearly",
      "Choose replication, partitioning, and indexing strategies",
      "Recognize when one workload needs multiple storage systems"
    ],
    "lessons": [
      {
        "slug": "relational-data-modeling",
        "title": "Relational data modeling and indexing",
        "summary": "Relational databases remain the default for strongly constrained data, multi-row invariants, and flexible querying with mature operational tooling.",
        "duration": "25-35 min",
        "whyItMatters": "Many interviews reward candidates who start with a relational model and only move away when scale or access patterns demand it.",
        "sections": [
          {
            "heading": "Why relational databases remain powerful",
            "body": "Schemas, constraints, joins, and transactional guarantees make relational systems excellent for products with strong correctness needs.",
            "bullets": [
              "Use normalized schemas to avoid duplication at first",
              "Define primary keys, uniqueness, and foreign-key semantics clearly",
              "Secondary indexes are often the difference between workable and unusable query latency"
            ]
          },
          {
            "heading": "Model for access patterns",
            "body": "Schema quality is not just theoretical normalization; it is about making the common read and write paths efficient and obvious.",
            "bullets": [
              "Add covering indexes for hot queries",
              "Denormalize intentionally when repeated joins become too costly",
              "Watch write amplification from too many indexes"
            ]
          },
          {
            "heading": "Operational trade-offs",
            "body": "A strong relational design still needs connection pooling, query tuning, and a plan for read scaling and failover.",
            "bullets": [
              "Use read replicas to offload analytics or heavy reads",
              "Keep transactions short to avoid lock contention",
              "Explain when you would archive or partition old data"
            ]
          }
        ],
        "checklist": [
          "Start with entities, relationships, and invariants.",
          "Index the hot read paths explicitly.",
          "Discuss transaction boundaries and lock contention.",
          "Use denormalization only when it clearly helps."
        ],
        "pitfalls": [
          "Choosing NoSQL before the query patterns are known.",
          "Adding too many indexes and slowing writes.",
          "Letting analytics queries impact the transactional workload."
        ],
        "interviewPrompts": [
          "What data would you model relationally for an e-commerce checkout flow?",
          "When is denormalization worth it?",
          "How do indexes change write performance?"
        ],
        "diagram": null,
        "related": [
          "replication-and-failover",
          "storage-selection"
        ],
        "moduleSlug": "data-storage",
        "moduleTitle": "Data storage and indexing",
        "order": 1,
        "id": "data-storage/relational-data-modeling"
      },
      {
        "slug": "replication-and-failover",
        "title": "Replication and failover",
        "summary": "Replicas improve read scale, durability, and recovery options, but they introduce lag, failover complexity, and write ownership decisions.",
        "duration": "25-35 min",
        "whyItMatters": "A lot of interview depth comes from acknowledging what replicas do during steady state, incident response, and recovery.",
        "sections": [
          {
            "heading": "Master-replica patterns",
            "body": "Single-writer topologies simplify conflict handling, while multi-writer topologies trade simplicity for write locality or availability.",
            "bullets": [
              "Asynchronous replication improves availability but can lose the latest writes on failover",
              "Synchronous replication improves durability but increases latency",
              "Read replicas are great until replica lag becomes user-visible"
            ]
          },
          {
            "heading": "Failover choices",
            "body": "Automatic failover shortens outages but must guard against split brain and stale leaders. Manual failover is slower but sometimes safer.",
            "bullets": [
              "Use health checks and quorum-aware promotion when possible",
              "Clearly define RPO and RTO expectations",
              "Plan how clients discover the new primary"
            ]
          },
          {
            "heading": "Recovery and repair",
            "body": "After failover, the hard part is often reconciliation, replica catch-up, and preventing overloaded survivors from collapsing.",
            "bullets": [
              "Throttle catch-up traffic if necessary",
              "Protect hot partitions during recovery",
              "Observe replication lag and failover drills regularly"
            ]
          }
        ],
        "checklist": [
          "Explain the write path and which node is authoritative.",
          "Discuss replica lag and user-visible effects.",
          "Define failover triggers, RPO, and RTO.",
          "Mention recovery traffic and split-brain protection."
        ],
        "pitfalls": [
          "Saying replicas automatically improve everything.",
          "Ignoring promotion safety and stale reads after failover.",
          "Forgetting how clients find the new primary."
        ],
        "interviewPrompts": [
          "When is asynchronous replication acceptable?",
          "How would you explain replica lag to a product manager?",
          "What changes if you need active-active writes across regions?"
        ],
        "diagram": {
          "src": "/primer-images/C9ioGtn.png",
          "alt": "Master slave replication diagram",
          "caption": "Replication improves read scale and recovery options but introduces lag and failover choices.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "availability-consistency-cap",
          "multi-region-disaster-recovery"
        ],
        "moduleSlug": "data-storage",
        "moduleTitle": "Data storage and indexing",
        "order": 2,
        "id": "data-storage/replication-and-failover"
      },
      {
        "slug": "partitioning-and-sharding",
        "title": "Partitioning, federation, and sharding",
        "summary": "Break data into smaller pieces when a single machine or logical schema becomes the bottleneck for size, throughput, or ownership.",
        "duration": "25-35 min",
        "whyItMatters": "Partitioning strategies are common interview deep dives because they expose trade-offs around hot keys, joins, and operational mobility.",
        "sections": [
          {
            "heading": "Partition for a reason",
            "body": "Partitioning helps when throughput or storage exceeds a single node, or when separate domains need independent lifecycle management.",
            "bullets": [
              "Horizontal partitioning spreads load across shards",
              "Federation separates functional domains into different databases",
              "Archive or cold-storage partitions can reduce hot-set pressure"
            ]
          },
          {
            "heading": "Choose stable keys carefully",
            "body": "A good shard key distributes load and keeps common queries local. A bad key creates hot partitions or expensive scatter-gather reads.",
            "bullets": [
              "User ID often works for user-owned data",
              "Time-based keys can create hot partitions without bucketing",
              "Consistent hashing helps when capacity changes frequently"
            ]
          },
          {
            "heading": "Accept the operational costs",
            "body": "Cross-shard transactions, rebalancing, backfills, and global secondary indexes become harder after partitioning.",
            "bullets": [
              "Plan resharding before you need it urgently",
              "Keep routing metadata highly available",
              "Model hot-spot mitigation explicitly"
            ]
          }
        ],
        "checklist": [
          "State why a single store is no longer enough.",
          "Choose and justify a partition key.",
          "Explain cross-shard query limitations and mitigation.",
          "Mention rebalancing and hot-partition handling."
        ],
        "pitfalls": [
          "Sharding before the access pattern is understood.",
          "Choosing a shard key that aligns with traffic bursts.",
          "Ignoring metadata, rebalancing, and cross-shard aggregations."
        ],
        "interviewPrompts": [
          "How would you shard a timeline service?",
          "What is the difference between federation and sharding?",
          "When is consistent hashing useful?"
        ],
        "diagram": {
          "src": "/primer-images/wU8x5Id.png",
          "alt": "Database sharding diagram",
          "caption": "Shard keys should distribute load while keeping the common request path local.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "relational-data-modeling",
          "caching-layers"
        ],
        "moduleSlug": "data-storage",
        "moduleTitle": "Data storage and indexing",
        "order": 3,
        "id": "data-storage/partitioning-and-sharding"
      },
      {
        "slug": "nosql-landscape",
        "title": "The NoSQL landscape",
        "summary": "NoSQL systems trade some relational flexibility for scale, availability patterns, schema freedom, or specialized query models.",
        "duration": "25-35 min",
        "whyItMatters": "Interview answers improve when you can say not only that NoSQL is scalable, but what kind and at what semantic cost.",
        "sections": [
          {
            "heading": "Key-value and document stores",
            "body": "Key-value stores excel at simple lookups and caching, while document stores fit evolving, nested records with access patterns centered on a document boundary.",
            "bullets": [
              "Great for profiles, sessions, feature flags, and metadata",
              "Watch document growth and secondary index cost",
              "Denormalization is usually expected rather than exceptional"
            ]
          },
          {
            "heading": "Wide-column and graph stores",
            "body": "Wide-column stores optimize very large sparse datasets and partition-friendly access patterns; graph databases help when traversals are the product itself.",
            "bullets": [
              "Wide-column systems fit high-write event or telemetry workloads",
              "Graph databases fit social edges, recommendations, or relationship queries",
              "Operational maturity and query ergonomics vary widely"
            ]
          },
          {
            "heading": "Use polyglot persistence thoughtfully",
            "body": "One product can legitimately use relational storage for orders, object storage for media, search indexes for retrieval, and Redis for ephemeral state.",
            "bullets": [
              "Pick the primary store per domain invariant",
              "Avoid duplicating the same truth without a clear pipeline",
              "Plan synchronization and ownership carefully"
            ]
          }
        ],
        "checklist": [
          "Explain which access pattern motivates the chosen store.",
          "Name the semantic trade-off, not only the scaling benefit.",
          "Use polyglot persistence intentionally.",
          "Keep one source of truth per domain whenever possible."
        ],
        "pitfalls": [
          "Calling every distributed store a NoSQL database without specifying the model.",
          "Moving to NoSQL to avoid schema work rather than because the workload benefits.",
          "Ignoring index, consistency, and repair costs."
        ],
        "interviewPrompts": [
          "When would a document store beat a relational schema?",
          "What workloads fit wide-column systems?",
          "How would you keep a search index synchronized with the primary store?"
        ],
        "diagram": {
          "src": "/primer-images/n16iOGk.png",
          "alt": "Wide column data model diagram",
          "caption": "Wide-column stores favor partition-friendly access patterns over ad hoc relational flexibility.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "storage-selection",
          "query-cache"
        ],
        "moduleSlug": "data-storage",
        "moduleTitle": "Data storage and indexing",
        "order": 4,
        "id": "data-storage/nosql-landscape"
      },
      {
        "slug": "storage-selection",
        "title": "Choosing the right storage mix",
        "summary": "Most serious systems use more than one storage technology. The skill is choosing a small set whose strengths align with the workload and team.",
        "duration": "25-35 min",
        "whyItMatters": "This lesson ties the previous ones together into a decision process that is easy to explain in interviews.",
        "sections": [
          {
            "heading": "Start with the invariant",
            "body": "Identify which data needs strict correctness, which needs flexible querying, which needs cheap large-object storage, and which needs fast derived retrieval.",
            "bullets": [
              "Transactions often imply relational or strongly consistent stores",
              "Large blobs belong in object storage, not a transactional row store",
              "Search often deserves its own index or engine"
            ]
          },
          {
            "heading": "Then match the access pattern",
            "body": "Look at cardinality, fan-out, query flexibility, update frequency, and retention policy to decide the storage engine and surrounding caches.",
            "bullets": [
              "Write-heavy append workloads fit logs and wide-column systems",
              "Read-heavy key lookups fit caches or key-value stores",
              "Complex joins and reporting often favor relational models or warehouses"
            ]
          },
          {
            "heading": "Keep the operational portfolio small",
            "body": "Every extra datastore multiplies migration, monitoring, backup, on-call, and developer education costs.",
            "bullets": [
              "Prefer one primary store plus purpose-built secondary systems",
              "Document ownership and synchronization clearly",
              "Explain why not choosing a more exotic store is a feature"
            ]
          }
        ],
        "checklist": [
          "Choose stores by invariant and access pattern.",
          "Use object storage and search indexes as distinct tools.",
          "Limit the number of storage systems the team must run.",
          "Explain synchronization between primary and derived stores."
        ],
        "pitfalls": [
          "Adding a new datastore for every problem.",
          "Using a search index as the source of truth.",
          "Ignoring backup, migration, and operator expertise."
        ],
        "interviewPrompts": [
          "What storage mix would you choose for a social media product?",
          "Why is object storage usually the right place for media?",
          "How do you justify not introducing another specialized database?"
        ],
        "diagram": {
          "src": "/primer-images/wXGqG5f.png",
          "alt": "SQL versus NoSQL decision diagram",
          "caption": "Storage choices should follow access patterns and correctness needs, not labels.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "relational-data-modeling",
          "nosql-landscape"
        ],
        "moduleSlug": "data-storage",
        "moduleTitle": "Data storage and indexing",
        "order": 5,
        "id": "data-storage/storage-selection"
      }
    ]
  },
  {
    "slug": "performance-and-resilience",
    "title": "Caching, asynchrony, and resilience",
    "summary": "Reduce latency, smooth bursts, and survive failures by placing the right work in caches, queues, and resilient control loops.",
    "objectives": [
      "Use cache layers and invalidation strategies responsibly",
      "Choose asynchronous patterns to absorb bursty work",
      "Design retries, idempotency, and back pressure without making incidents worse"
    ],
    "lessons": [
      {
        "slug": "caching-layers",
        "title": "Caching layers and cache placement",
        "summary": "Caching can remove repeated work from the critical path, but only if you choose the right layer and understand freshness requirements.",
        "duration": "25-35 min",
        "whyItMatters": "Cache design is a staple interview topic because it touches latency, cost, invalidation, and failure semantics all at once.",
        "sections": [
          {
            "heading": "Place caches where they save the most work",
            "body": "Clients, CDNs, reverse proxies, application nodes, and databases can all cache. Pick the layer that removes the most expensive repeated computation or I/O.",
            "bullets": [
              "Client and CDN caches reduce global network distance",
              "Application caches help personalized or computed views",
              "Database caches can reduce repeated query or page fetches"
            ]
          },
          {
            "heading": "Design the cache key and TTL",
            "body": "A cache is only useful if the key matches the read pattern and the TTL matches product tolerance for staleness.",
            "bullets": [
              "Include version or tenant context when needed",
              "Use immutable keys for assets to make invalidation simple",
              "Protect against stampedes on popular keys"
            ]
          },
          {
            "heading": "Plan for misses and outages",
            "body": "Every cache eventually misses, evicts, or fails. The origin path must still be correct and safe under surge conditions.",
            "bullets": [
              "Warm critical keys when possible",
              "Use request coalescing or single-flight behavior",
              "Measure hit ratio, hit latency, and origin fallthrough"
            ]
          }
        ],
        "checklist": [
          "Choose the cache layer based on what work it eliminates.",
          "Design cache keys and TTLs explicitly.",
          "Explain miss behavior and stampede protection.",
          "Track hit ratio and origin offload."
        ],
        "pitfalls": [
          "Adding a cache without defining freshness semantics.",
          "Caching values with unstable keys or poor cardinality.",
          "Assuming the origin can handle a sudden cold-start miss storm."
        ],
        "interviewPrompts": [
          "What would you cache for a product details page?",
          "How does personalized content change cache placement?",
          "When is a low hit ratio still acceptable?"
        ],
        "diagram": {
          "src": "/primer-images/Q6z24La.png",
          "alt": "Cache layer diagram",
          "caption": "Caching works best when it removes repeated expensive work from the hot path.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "cdn",
          "cache-invalidation"
        ],
        "moduleSlug": "performance-and-resilience",
        "moduleTitle": "Caching, asynchrony, and resilience",
        "order": 1,
        "id": "performance-and-resilience/caching-layers"
      },
      {
        "slug": "cache-invalidation",
        "title": "Cache invalidation and update patterns",
        "summary": "Pick an update pattern that matches read/write mix, freshness requirements, and operational simplicity.",
        "duration": "25-35 min",
        "whyItMatters": "Interviewers often want to hear that you understand the behavior after writes, not only the happy path for cache hits.",
        "sections": [
          {
            "heading": "Cache-aside is the default",
            "body": "Applications read from cache, fall back to the database, then populate cache. It is simple and keeps the database as the source of truth.",
            "bullets": [
              "Great for read-heavy workloads",
              "Beware stampedes and stale data after writes",
              "Works well when occasional misses are acceptable"
            ]
          },
          {
            "heading": "Write-through and write-behind",
            "body": "Write-through updates cache and source of truth together, while write-behind delays persistence for higher write throughput at the cost of durability complexity.",
            "bullets": [
              "Write-through simplifies read-after-write freshness",
              "Write-behind must handle crashes and replay safely",
              "Durability requirements often rule out write-behind for critical data"
            ]
          },
          {
            "heading": "Refresh-ahead and explicit invalidation",
            "body": "Refresh-ahead reduces misses for predictable hot keys, while explicit invalidation helps when updates are event driven and freshness matters.",
            "bullets": [
              "Invalidate by key, tag, or version",
              "Prefer immutable object versions when possible",
              "Measure stale-read rate, miss storms, and refresh cost"
            ]
          }
        ],
        "checklist": [
          "Name the update pattern after a write.",
          "Explain who owns freshness and how stale data is repaired.",
          "Use versioning or invalidation to avoid ambiguous cache state.",
          "Treat write-behind as risky for critical data unless carefully justified."
        ],
        "pitfalls": [
          "Using write-behind for money or audit-critical records.",
          "Assuming cache eviction equals invalidation.",
          "Ignoring concurrent writers and stale overwrites."
        ],
        "interviewPrompts": [
          "Which cache strategy fits product catalog reads?",
          "How would you invalidate a user profile across many caches?",
          "Why is write-behind risky for orders or payments?"
        ],
        "diagram": {
          "src": "/primer-images/ONjORqk.png",
          "alt": "Cache aside pattern diagram",
          "caption": "Cache-aside is simple and common, but write paths still need careful invalidation.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "caching-layers",
          "idempotency-retries-backpressure"
        ],
        "moduleSlug": "performance-and-resilience",
        "moduleTitle": "Caching, asynchrony, and resilience",
        "order": 2,
        "id": "performance-and-resilience/cache-invalidation"
      },
      {
        "slug": "queues-and-streams",
        "title": "Queues, streams, and background work",
        "summary": "Move non-interactive or bursty work off the request path so user-facing latency stays bounded and the system can absorb spikes gracefully.",
        "duration": "25-35 min",
        "whyItMatters": "Asynchronous design is essential for email, notifications, indexing, media processing, analytics, and any workload with burstier write traffic than the online path can safely handle.",
        "sections": [
          {
            "heading": "What belongs off the critical path",
            "body": "Any work that does not need to finish before the user gets a response is a candidate for a queue or event stream.",
            "bullets": [
              "Email and push notifications",
              "Media transcoding and indexing",
              "Fan-out to followers or secondary views"
            ]
          },
          {
            "heading": "Queues vs. streams",
            "body": "Queues focus on work dispatch and at-least-once processing, while streams retain ordered logs that many consumers can replay.",
            "bullets": [
              "Queues fit task execution",
              "Streams fit event sourcing, CDC, and many downstream consumers",
              "Both still need idempotent consumers"
            ]
          },
          {
            "heading": "Operational controls",
            "body": "Dead-letter queues, retry policies, consumer lag monitoring, and partitioning strategy determine whether async pipelines stay healthy under load.",
            "bullets": [
              "Track backlog age and consumer lag",
              "Design for poison messages and replay",
              "Scale consumers based on throughput and ordering constraints"
            ]
          }
        ],
        "checklist": [
          "Move non-interactive work off the user path.",
          "Choose queue or stream semantics intentionally.",
          "Make consumers idempotent and observable.",
          "Explain retry, DLQ, and replay behavior."
        ],
        "pitfalls": [
          "Putting user-critical synchronous work onto a queue without clear feedback.",
          "Ignoring ordering and idempotency in consumers.",
          "Treating queues as infinite buffers instead of capacity they can also exhaust."
        ],
        "interviewPrompts": [
          "How would you handle notification fan-out for a celebrity account?",
          "When does a stream fit better than a queue?",
          "What metrics tell you the async system is falling behind?"
        ],
        "diagram": {
          "src": "/primer-images/54GYsSx.png",
          "alt": "Message queue and worker diagram",
          "caption": "Queues absorb bursty work and protect the user-facing path from expensive processing.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "realtime-delivery",
          "search-autocomplete"
        ],
        "moduleSlug": "performance-and-resilience",
        "moduleTitle": "Caching, asynchrony, and resilience",
        "order": 3,
        "id": "performance-and-resilience/queues-and-streams"
      },
      {
        "slug": "idempotency-retries-backpressure",
        "title": "Idempotency, retries, and back pressure",
        "summary": "Make distributed workflows safe under duplicate delivery, partial failure, and overload instead of assuming every call succeeds exactly once.",
        "duration": "25-35 min",
        "whyItMatters": "These controls separate systems that merely work in demos from systems that remain correct during incidents.",
        "sections": [
          {
            "heading": "Design for repeated attempts",
            "body": "Retries happen because networks are unreliable and callers time out. Idempotency keys, request deduplication, and state-machine design prevent duplicate side effects.",
            "bullets": [
              "Payment and order creation should accept an idempotency key",
              "Consumers should tolerate at-least-once delivery",
              "Make retryable operations explicit in the API"
            ]
          },
          {
            "heading": "Retry with restraint",
            "body": "Retries improve availability only when bounded by timeouts, jitter, and an understanding of what failures are likely to recover.",
            "bullets": [
              "Use exponential backoff with jitter",
              "Avoid retry storms during brownouts",
              "Fail fast on validation errors or non-retryable conflicts"
            ]
          },
          {
            "heading": "Back pressure protects the system",
            "body": "When a dependency is overloaded, you should shed load, queue selectively, or degrade features instead of letting every layer time out together.",
            "bullets": [
              "Use admission control and per-tenant fairness",
              "Surface retry-after semantics when possible",
              "Circuit breakers and load shedding can preserve core traffic"
            ]
          }
        ],
        "checklist": [
          "State how duplicate requests are made safe.",
          "Use retries with bounded budgets and jitter.",
          "Explain how the system rejects or defers excess work.",
          "Protect the most important traffic first during overload."
        ],
        "pitfalls": [
          "Retrying everything blindly.",
          "Treating at-least-once delivery as if it were exactly-once.",
          "Allowing low-value traffic to consume all capacity during incidents."
        ],
        "interviewPrompts": [
          "How would you make a payment API safe to retry?",
          "When should a service shed load instead of queueing?",
          "What is the difference between retry logic and true idempotency?"
        ],
        "diagram": null,
        "related": [
          "queues-and-streams",
          "availability-consistency-cap"
        ],
        "moduleSlug": "performance-and-resilience",
        "moduleTitle": "Caching, asynchrony, and resilience",
        "order": 4,
        "id": "performance-and-resilience/idempotency-retries-backpressure"
      },
      {
        "slug": "observability",
        "title": "Observability and operational feedback loops",
        "summary": "Metrics, logs, traces, and alerting turn architecture choices into something operators can actually trust and improve.",
        "duration": "25-35 min",
        "whyItMatters": "In interviews, observability is often the difference between a design that scales on paper and one that can be debugged in production.",
        "sections": [
          {
            "heading": "Instrument the golden signals",
            "body": "Latency, traffic, errors, and saturation provide a baseline view of service health, while domain metrics show product-specific correctness.",
            "bullets": [
              "Track p95 and p99 by endpoint",
              "Use backlog and lag for async systems",
              "Monitor domain metrics such as failed payments or duplicate notifications"
            ]
          },
          {
            "heading": "Use traces for multi-hop requests",
            "body": "Distributed tracing reveals where time is spent across services, queues, and storage layers.",
            "bullets": [
              "Propagate request IDs and correlation IDs",
              "Trace fan-out requests and async continuations",
              "Use sampling carefully on very high-volume services"
            ]
          },
          {
            "heading": "Close the loop operationally",
            "body": "Dashboards, alerts, runbooks, and drills let teams respond quickly and learn from incidents.",
            "bullets": [
              "Alert on symptoms and user impact, not just resource usage",
              "Keep logs structured for searchability",
              "Review near misses and test recovery regularly"
            ]
          }
        ],
        "checklist": [
          "Name the most important metrics for the proposed design.",
          "Include domain correctness signals, not only infrastructure metrics.",
          "Use tracing for multi-service critical paths.",
          "Mention runbooks, alerts, and incident drills."
        ],
        "pitfalls": [
          "Monitoring only CPU and memory.",
          "Ignoring queue lag, cache hit ratio, or replica lag.",
          "Creating alerts without actionable ownership."
        ],
        "interviewPrompts": [
          "What would you monitor first in a notification pipeline?",
          "Why are domain metrics important alongside infrastructure metrics?",
          "How would you debug rising p99 latency in a fan-out service?"
        ],
        "diagram": null,
        "related": [
          "multi-region-disaster-recovery",
          "deployment-capacity-cost"
        ],
        "moduleSlug": "performance-and-resilience",
        "moduleTitle": "Caching, asynchrony, and resilience",
        "order": 5,
        "id": "performance-and-resilience/observability"
      }
    ]
  },
  {
    "slug": "security-and-operations",
    "title": "Security, multi-region, and operations",
    "summary": "Design systems that are safe to expose, recoverable during disasters, and maintainable by real teams over time.",
    "objectives": [
      "Apply practical authentication, authorization, and data protection patterns",
      "Reason about multi-region architecture and disaster recovery",
      "Include deployment, capacity, and cost controls in designs"
    ],
    "lessons": [
      {
        "slug": "security-basics",
        "title": "Security foundations for system design",
        "summary": "Security choices should appear throughout the design, not as a last-minute box labeled auth.",
        "duration": "25-35 min",
        "whyItMatters": "Interviewers want to see that you protect data, isolate access, and anticipate abuse without derailing the rest of the design.",
        "sections": [
          {
            "heading": "Authenticate and authorize clearly",
            "body": "Authentication proves identity; authorization decides what the caller is allowed to do. Keep those concepts separate in your explanation.",
            "bullets": [
              "Use short-lived tokens and well-defined scopes",
              "Model multi-tenant boundaries explicitly",
              "Audit privileged actions and admin flows"
            ]
          },
          {
            "heading": "Protect data in transit and at rest",
            "body": "TLS, key management, secret rotation, and careful handling of sensitive fields are part of the baseline, not optional polish.",
            "bullets": [
              "Encrypt transport for all public and internal sensitive traffic",
              "Use KMS-backed key rotation where possible",
              "Minimize stored secrets and personal data"
            ]
          },
          {
            "heading": "Defend against common abuse",
            "body": "Input validation, parameterized queries, CSRF protection where relevant, and audit logs reduce both security bugs and operational ambiguity.",
            "bullets": [
              "Protect write endpoints from replay and forgery",
              "Validate and sanitize user input by context",
              "Use least privilege for services and operators"
            ]
          }
        ],
        "checklist": [
          "Separate authn from authz.",
          "Encrypt transport and sensitive data at rest.",
          "Apply least privilege to services and operators.",
          "Mention abuse prevention and auditability."
        ],
        "pitfalls": [
          "Treating security as one edge component with no data-flow impact.",
          "Granting broad internal trust without service identity.",
          "Ignoring operational controls such as key rotation or audit logs."
        ],
        "interviewPrompts": [
          "What security controls are mandatory for a payments system?",
          "How would you design authz for a multi-tenant admin dashboard?",
          "Why is least privilege important between internal services?"
        ],
        "diagram": null,
        "related": [
          "rate-limiting-and-edge-protection",
          "payments-ledger"
        ],
        "moduleSlug": "security-and-operations",
        "moduleTitle": "Security, multi-region, and operations",
        "order": 1,
        "id": "security-and-operations/security-basics"
      },
      {
        "slug": "multi-region-disaster-recovery",
        "title": "Multi-region design and disaster recovery",
        "summary": "Use multiple regions when the business case justifies lower outage risk, lower latency, or data residency needs, while accepting the added coordination cost.",
        "duration": "25-35 min",
        "whyItMatters": "This is a high-signal interview area because it forces you to reconcile availability goals with replication lag, cost, and operational maturity.",
        "sections": [
          {
            "heading": "Know what you are optimizing for",
            "body": "Some systems need active-active read serving, some need active-passive failover, and some only need robust backups plus tested restore procedures.",
            "bullets": [
              "Map the business requirement to RTO and RPO",
              "Not every product needs active-active writes",
              "Data sovereignty may shape regional placement as much as latency does"
            ]
          },
          {
            "heading": "Replication and control planes",
            "body": "Multi-region architectures rely on replicated data, regional stateless capacity, and a clear plan for global coordination components such as DNS, config, and identity.",
            "bullets": [
              "Keep regional blast radii explicit",
              "Plan write ownership carefully to avoid global coordination on every request",
              "Expect failover automation to need drills and guardrails"
            ]
          },
          {
            "heading": "Recovery is a practiced capability",
            "body": "Backups, snapshots, IaC, and runbooks matter only if they are tested under realistic conditions.",
            "bullets": [
              "Restore drills are part of the design",
              "Keep backups isolated from production compromise",
              "Observe cross-region lag and failover readiness continually"
            ]
          }
        ],
        "checklist": [
          "Define RTO and RPO before proposing multi-region complexity.",
          "Choose active-passive or active-active intentionally.",
          "Explain how traffic shifts and how clients discover healthy regions.",
          "Mention backup restore drills, not only replication."
        ],
        "pitfalls": [
          "Assuming multi-region automatically means active-active writes.",
          "Forgetting global dependencies like identity or configuration stores.",
          "Relying on backups that have never been restored in practice."
        ],
        "interviewPrompts": [
          "When is active-passive enough?",
          "How would you fail over user traffic during a regional outage?",
          "Why can active-active writes be difficult for strongly consistent domains?"
        ],
        "diagram": null,
        "related": [
          "replication-and-failover",
          "dns"
        ],
        "moduleSlug": "security-and-operations",
        "moduleTitle": "Security, multi-region, and operations",
        "order": 2,
        "id": "security-and-operations/multi-region-disaster-recovery"
      },
      {
        "slug": "fault-tolerance-and-graceful-degradation",
        "title": "Fault tolerance and graceful degradation",
        "summary": "Healthy systems keep the core user journey alive when dependencies fail by shedding optional work and falling back to simpler behavior.",
        "duration": "25-35 min",
        "whyItMatters": "This is how you turn abstract availability goals into concrete runtime behavior.",
        "sections": [
          {
            "heading": "Design degradable experiences",
            "body": "Not every feature needs the same availability target. Separate must-have functionality from enrichments such as recommendations, analytics, or avatars.",
            "bullets": [
              "Checkout may stay available while recommendations fail closed",
              "Feeds can show slightly stale content instead of erroring",
              "Read-only modes can be safer than risky writes during incidents"
            ]
          },
          {
            "heading": "Contain failures early",
            "body": "Timeouts, bulkheads, circuit breakers, and bounded queues keep one unhealthy dependency from dragging everything else down.",
            "bullets": [
              "Use short, realistic timeouts",
              "Pool resources per dependency or tenant when necessary",
              "Fail fast when dependencies are clearly unavailable"
            ]
          },
          {
            "heading": "Test the degraded mode",
            "body": "Fallback logic rots if it is never exercised. Drill dependency failure and ensure the product response is understandable to users.",
            "bullets": [
              "Inject faults in staging and selected production paths",
              "Track degraded-mode activation rate",
              "Write runbooks for manual feature shedding"
            ]
          }
        ],
        "checklist": [
          "Name the minimal user journey that must survive.",
          "Shed optional work first during incidents.",
          "Use timeouts and isolation to contain blast radius.",
          "Test fallbacks instead of only describing them."
        ],
        "pitfalls": [
          "Claiming 100% availability for every feature.",
          "Allowing fallback logic to silently rot.",
          "Letting low-priority dependencies sit on the critical path."
        ],
        "interviewPrompts": [
          "What can degrade in a food-delivery app during an outage?",
          "How would you design a read-only mode for an account system?",
          "Why can graceful degradation be better than aggressive retries?"
        ],
        "diagram": null,
        "related": [
          "idempotency-retries-backpressure",
          "observability"
        ],
        "moduleSlug": "security-and-operations",
        "moduleTitle": "Security, multi-region, and operations",
        "order": 3,
        "id": "security-and-operations/fault-tolerance-and-graceful-degradation"
      },
      {
        "slug": "deployment-capacity-cost",
        "title": "Deployments, capacity, and cost awareness",
        "summary": "Production systems need safe release mechanics, realistic capacity headroom, and an explicit understanding of what the architecture costs to run.",
        "duration": "25-35 min",
        "whyItMatters": "A design is incomplete if it only works in steady state and ignores change management or economics.",
        "sections": [
          {
            "heading": "Release safely",
            "body": "Rolling deploys, canaries, blue-green releases, and feature flags reduce the blast radius of changes.",
            "bullets": [
              "Drain connections before terminating nodes",
              "Use progressive exposure for risky changes",
              "Keep schema migrations backward compatible across mixed-version deploys"
            ]
          },
          {
            "heading": "Plan headroom and autoscaling",
            "body": "Capacity should account for growth, burst, maintenance events, and failover scenarios, not only average load.",
            "bullets": [
              "Scale on saturation signals that precede user pain",
              "Preserve buffer for regional failover or deploy overlap",
              "Model the cost of always-on capacity versus queueing and batch work"
            ]
          },
          {
            "heading": "Cost is part of the trade-off",
            "body": "Egress, replication, storage classes, idle capacity, and operational labor all matter. The cheapest architecture on paper may be the most expensive to operate.",
            "bullets": [
              "Use cost-aware storage tiers",
              "Cache and CDN decisions often shift both latency and egress cost",
              "Overly fragmented architectures increase people cost"
            ]
          }
        ],
        "checklist": [
          "Mention a release strategy and rollback plan.",
          "Reserve capacity for bursts and failover.",
          "Discuss cost drivers such as egress, replicas, and idle headroom.",
          "Prefer simple architectures when they meet the requirements."
        ],
        "pitfalls": [
          "Ignoring schema compatibility during rolling deploys.",
          "Sizing only for averages.",
          "Pretending cost is someone else\u2019s problem."
        ],
        "interviewPrompts": [
          "How would you deploy a risky ranking change safely?",
          "Why do failover scenarios affect capacity planning?",
          "What are the biggest hidden costs in a globally distributed system?"
        ],
        "diagram": null,
        "related": [
          "load-balancing",
          "multi-region-disaster-recovery"
        ],
        "moduleSlug": "security-and-operations",
        "moduleTitle": "Security, multi-region, and operations",
        "order": 4,
        "id": "security-and-operations/deployment-capacity-cost"
      }
    ]
  },
  {
    "slug": "product-patterns",
    "title": "Common product design patterns",
    "summary": "Practice recurring architectures that appear across many interview prompts and real-world products.",
    "objectives": [
      "Recognize reusable patterns behind common product families",
      "Explain fan-out, indexing, storage, and notification decisions",
      "Use these patterns as building blocks in case studies"
    ],
    "lessons": [
      {
        "slug": "feed-timeline",
        "title": "Feeds and timelines",
        "summary": "Feeds combine ranking, fan-out, caching, and read-time assembly decisions under heavy skewed traffic.",
        "duration": "25-35 min",
        "whyItMatters": "This pattern shows up in social, commerce, news, and activity products, making it a high-yield interview topic.",
        "sections": [
          {
            "heading": "Read-time vs. write-time fan-out",
            "body": "Write-time fan-out gives fast reads but expensive writes for high-follower accounts; read-time assembly is cheaper on writes but can be slower for readers.",
            "bullets": [
              "Hybrid strategies are common",
              "Celebrity accounts often require special handling",
              "Precomputed home feeds trade storage for low-latency reads"
            ]
          },
          {
            "heading": "Ranking and retrieval pipeline",
            "body": "Timelines often combine candidate generation, filtering, ranking, and pagination rather than one raw query.",
            "bullets": [
              "Cache the hot first page aggressively",
              "Store immutable events separately from ranked views",
              "Use async pipelines for fan-out and re-ranking"
            ]
          },
          {
            "heading": "Correctness and product controls",
            "body": "Blocked users, deleted content, privacy settings, and deduplication all influence the final feed.",
            "bullets": [
              "Expect eventual consistency in non-critical counters",
              "Use tombstones or event handling for deletions",
              "Observe ranking freshness and fan-out lag"
            ]
          }
        ],
        "checklist": [
          "State whether the design fans out on read, write, or both.",
          "Separate event storage from derived feed views.",
          "Handle high-follower skew explicitly.",
          "Mention product correctness rules such as privacy and deletion."
        ],
        "pitfalls": [
          "Using one strategy for all account sizes.",
          "Ignoring ranking and content filtering as if the feed were a simple list.",
          "Forgetting deletion propagation and privacy constraints."
        ],
        "interviewPrompts": [
          "How would you design for celebrity accounts?",
          "What would you cache in a home feed?",
          "Why is a feed usually a derived view instead of the primary source of truth?"
        ],
        "diagram": null,
        "related": [
          "queues-and-streams",
          "caching-layers"
        ],
        "moduleSlug": "product-patterns",
        "moduleTitle": "Common product design patterns",
        "order": 1,
        "id": "product-patterns/feed-timeline"
      },
      {
        "slug": "file-storage-cdn",
        "title": "File upload, processing, and distribution",
        "summary": "Media-heavy products require a pipeline for uploads, validation, durable storage, transformation, and fast global delivery.",
        "duration": "25-35 min",
        "whyItMatters": "This pattern combines object storage, asynchronous work, metadata stores, and CDN behavior in a concrete way.",
        "sections": [
          {
            "heading": "Upload flow",
            "body": "Clients usually upload directly to object storage using signed URLs, then notify the application with metadata and processing requirements.",
            "bullets": [
              "Avoid proxying large files through application servers",
              "Validate file type and size early",
              "Keep object keys immutable or versioned"
            ]
          },
          {
            "heading": "Processing pipeline",
            "body": "Images, videos, and documents often need virus scanning, transcoding, thumbnail generation, or OCR in background workers.",
            "bullets": [
              "Emit events when uploads complete",
              "Store derived asset metadata separately",
              "Retry and deduplicate processing tasks safely"
            ]
          },
          {
            "heading": "Serving and lifecycle",
            "body": "Distribute content via CDN and attach lifecycle policies for retention, versioning, and deletion compliance.",
            "bullets": [
              "Use signed URLs for private media",
              "Distinguish hot serving from archival storage",
              "Track egress and cache hit ratio"
            ]
          }
        ],
        "checklist": [
          "Use direct uploads to object storage when files are large.",
          "Process heavy transformations asynchronously.",
          "Serve finished assets through a CDN.",
          "Track lifecycle, privacy, and deletion requirements."
        ],
        "pitfalls": [
          "Sending all uploads through the core app tier.",
          "Treating the object store as the metadata database.",
          "Ignoring retention and signed-access requirements."
        ],
        "interviewPrompts": [
          "How would you design an avatar upload flow?",
          "Where do thumbnails and transcoded variants fit?",
          "Why should metadata and blobs usually live in different stores?"
        ],
        "diagram": null,
        "related": [
          "cdn",
          "queues-and-streams"
        ],
        "moduleSlug": "product-patterns",
        "moduleTitle": "Common product design patterns",
        "order": 2,
        "id": "product-patterns/file-storage-cdn"
      },
      {
        "slug": "search-autocomplete",
        "title": "Search and autocomplete",
        "summary": "Search systems combine ingestion, indexing, ranking, caching, and query-time latency controls.",
        "duration": "25-35 min",
        "whyItMatters": "Autocomplete is a strong interview prompt because it requires you to reason about prefix retrieval, freshness, and hot terms.",
        "sections": [
          {
            "heading": "Separate source of truth from search index",
            "body": "Search indexes are derived data optimized for retrieval, not the canonical record.",
            "bullets": [
              "Use CDC or async indexing pipelines",
              "Expect eventual consistency between the primary store and the index",
              "Track indexing lag and failed documents"
            ]
          },
          {
            "heading": "Autocomplete data structures",
            "body": "Tries, prefix indexes, n-grams, or specialized search engines can power autocomplete depending on scale and update frequency.",
            "bullets": [
              "Cache popular prefixes aggressively",
              "Use ranking signals such as popularity and personalization",
              "Protect the service from high-QPS short queries"
            ]
          },
          {
            "heading": "Latency and relevance",
            "body": "Search must trade response time against ranking sophistication. Good answers call out where expensive ranking moves offline.",
            "bullets": [
              "Precompute signals when possible",
              "Use top-k retrieval before deep ranking",
              "Fallback to trending suggestions when dependencies lag"
            ]
          }
        ],
        "checklist": [
          "Keep search indexes derived from the source of truth.",
          "Choose an autocomplete structure based on update and query shape.",
          "Cache hot prefixes and trending results.",
          "Observe freshness, latency, and zero-result rates."
        ],
        "pitfalls": [
          "Writing directly to the search index and calling it the source of truth.",
          "Ignoring abusive high-QPS prefix queries.",
          "Trying to do all ranking work synchronously in the request path."
        ],
        "interviewPrompts": [
          "How would you keep autocomplete fresh after updates?",
          "What should happen when the index is behind?",
          "Why is caching so effective for short-prefix search?"
        ],
        "diagram": null,
        "related": [
          "nosql-landscape",
          "observability"
        ],
        "moduleSlug": "product-patterns",
        "moduleTitle": "Common product design patterns",
        "order": 3,
        "id": "product-patterns/search-autocomplete"
      },
      {
        "slug": "chat-notifications",
        "title": "Chat, presence, and notifications",
        "summary": "Messaging products blend low-latency delivery, persistent history, fan-out, device state, and notification fallbacks.",
        "duration": "25-35 min",
        "whyItMatters": "This pattern is useful because it combines real-time delivery with offline durability and multi-device consistency.",
        "sections": [
          {
            "heading": "Separate message durability from delivery state",
            "body": "Persist the canonical message event first, then fan out to connected recipients, push services, or unread counters.",
            "bullets": [
              "Use ordered partitions per conversation when possible",
              "Keep delivery receipts and read state as separate derived data",
              "Handle offline recipients through push or inbox sync"
            ]
          },
          {
            "heading": "Presence and connection management",
            "body": "Presence systems are usually soft-state and eventually consistent, while message history must be durable.",
            "bullets": [
              "Heartbeat connections and expire stale presence",
              "Shard websocket gateways by connection count",
              "Publish events to the right regional or conversation partition"
            ]
          },
          {
            "heading": "Notification fan-out",
            "body": "Push notifications, email, and in-app badges are downstream reactions to the same event stream, each with different urgency and idempotency needs.",
            "bullets": [
              "Deduplicate downstream notifications",
              "Respect user preferences and quiet hours",
              "Track delivery, click, and dropout metrics"
            ]
          }
        ],
        "checklist": [
          "Persist messages before treating them as sent.",
          "Model presence as soft state separate from history.",
          "Use real-time sockets for active users and push for offline users.",
          "Separate message events from downstream notification workflows."
        ],
        "pitfalls": [
          "Conflating presence with durable conversation state.",
          "Using one global ordering stream for all conversations.",
          "Sending duplicate notifications on retries."
        ],
        "interviewPrompts": [
          "How would you design read receipts?",
          "Why should presence tolerate slight staleness?",
          "How do you notify offline users without duplicating sends?"
        ],
        "diagram": null,
        "related": [
          "realtime-delivery",
          "queues-and-streams"
        ],
        "moduleSlug": "product-patterns",
        "moduleTitle": "Common product design patterns",
        "order": 4,
        "id": "product-patterns/chat-notifications"
      },
      {
        "slug": "payments-ledger",
        "title": "Payments and ledger-style systems",
        "summary": "Money movement demands idempotency, auditability, reconciliation, and a conservative approach to asynchronous side effects.",
        "duration": "25-35 min",
        "whyItMatters": "Even if you never design a payments product in production, this lesson forces precise thinking about correctness under failure.",
        "sections": [
          {
            "heading": "Double-entry and immutable events",
            "body": "Represent money movement as balanced ledger entries or state transitions so you can audit and reconcile every step.",
            "bullets": [
              "Avoid destructive updates to balances without history",
              "Use idempotency keys for external and internal requests",
              "Separate authorization, capture, settlement, and refund states"
            ]
          },
          {
            "heading": "Synchronous correctness, asynchronous integrations",
            "body": "The core ledger path often requires strong correctness, while email, analytics, and some partner updates can be asynchronous.",
            "bullets": [
              "Persist the canonical transaction result before side effects",
              "Use outbox or event publication for downstream tasks",
              "Plan reconciliation with payment processors or banks"
            ]
          },
          {
            "heading": "Operational safeguards",
            "body": "Retries, duplicate callbacks, partial outages, and compliance audits are normal, so design the workflow as a recoverable state machine.",
            "bullets": [
              "Hold suspicious transactions for review when needed",
              "Audit privileged operations and schema changes",
              "Observe settlement lag, retry rates, and mismatch counts"
            ]
          }
        ],
        "checklist": [
          "Use immutable ledger events or equivalent audit records.",
          "Make transaction creation idempotent.",
          "Keep the core money path strongly correct.",
          "Plan reconciliation and dispute workflows."
        ],
        "pitfalls": [
          "Using write-behind caches for balances.",
          "Letting downstream notifications define transaction truth.",
          "Ignoring external callback duplication and delayed settlement."
        ],
        "interviewPrompts": [
          "How would you design a wallet transfer API?",
          "What happens if a partner callback is retried days later?",
          "Why is an append-only ledger safer than just mutating balances?"
        ],
        "diagram": null,
        "related": [
          "security-basics",
          "idempotency-retries-backpressure"
        ],
        "moduleSlug": "product-patterns",
        "moduleTitle": "Common product design patterns",
        "order": 5,
        "id": "product-patterns/payments-ledger"
      }
    ]
  },
  {
    "slug": "case-studies",
    "title": "Case studies and interview drills",
    "summary": "Apply the concepts to end-to-end systems that commonly appear in interviews and architecture reviews.",
    "objectives": [
      "Practice moving from requirements to a full design quickly",
      "Use diagrams and trade-off language from earlier modules",
      "Build confidence discussing bottlenecks, scaling steps, and failure modes"
    ],
    "lessons": [
      {
        "slug": "url-shortener",
        "title": "Case study: URL shortener",
        "summary": "Design a service that creates short codes, resolves them quickly, tracks analytics, and avoids hot-key failures.",
        "duration": "25-35 min",
        "whyItMatters": "This case is deceptively small and is excellent practice for storage design, cache placement, and throughput reasoning.",
        "sections": [
          {
            "heading": "Core flow",
            "body": "Write path creates a short code, stores the mapping, and optionally records metadata. Read path resolves the code with very low latency.",
            "bullets": [
              "Short-code generation can be random, counter-based, or hash derived",
              "Collision handling and reserved words must be addressed",
              "Analytics often belongs in an async pipeline"
            ]
          },
          {
            "heading": "Scaling decisions",
            "body": "Read traffic is usually much higher than writes, so aggressive caching and CDN-friendly redirects are natural optimizations.",
            "bullets": [
              "Cache hot mappings near the edge or in Redis",
              "Partition by short code or hash prefix",
              "Use append-only analytics logs instead of synchronous counters"
            ]
          },
          {
            "heading": "Operational nuances",
            "body": "Custom aliases, expiration, abuse detection, and safe redirect behavior quickly turn a toy problem into a production design.",
            "bullets": [
              "Validate target URLs and protect against malicious redirects",
              "Support expiration and deletion workflows",
              "Rate-limit creation APIs to reduce abuse"
            ]
          }
        ],
        "checklist": [
          "Explain short-code generation and collision handling.",
          "Optimize the hot read path with caching.",
          "Move analytics off the critical redirect path.",
          "Mention abuse prevention and TTL handling."
        ],
        "pitfalls": [
          "Using a global counter without discussing bottlenecks or availability.",
          "Updating analytics synchronously on every redirect.",
          "Ignoring malicious destination URLs or spam."
        ],
        "interviewPrompts": [
          "How would you generate unique short codes at high write volume?",
          "What would you cache for fast redirects?",
          "How do analytics change the design?"
        ],
        "diagram": {
          "src": "/primer-images/4edXG0T.png",
          "alt": "URL shortener architecture diagram",
          "caption": "A URL shortener is a compact way to practice hot reads, mapping storage, and async analytics.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "capacity-estimation",
          "caching-layers"
        ],
        "moduleSlug": "case-studies",
        "moduleTitle": "Case studies and interview drills",
        "order": 1,
        "id": "case-studies/url-shortener"
      },
      {
        "slug": "web-crawler",
        "title": "Case study: distributed web crawler",
        "summary": "Crawlers combine frontier management, politeness, deduplication, storage, and ranking across many workers.",
        "duration": "25-35 min",
        "whyItMatters": "This is a strong systems problem because it forces you to coordinate huge workloads safely over time.",
        "sections": [
          {
            "heading": "Frontier and scheduling",
            "body": "The crawler maintains a frontier of URLs to visit, grouped or prioritized by host, freshness, and crawl budget.",
            "bullets": [
              "Use host-based queues to enforce politeness",
              "Deduplicate URLs before scheduling work",
              "Track revisit policies separately from discovery"
            ]
          },
          {
            "heading": "Fetch and parse pipeline",
            "body": "Workers fetch pages, parse links and metadata, store content or digests, and emit new candidates to the frontier.",
            "bullets": [
              "Respect robots.txt and rate limits",
              "Use content hashing to avoid duplicates",
              "Separate raw fetch storage from indexable extracted data"
            ]
          },
          {
            "heading": "Scale and failure handling",
            "body": "The crawler should continue if workers die, some hosts are slow, or parsing pipelines fall behind.",
            "bullets": [
              "Keep frontier state durable",
              "Use back pressure when fetch or parse stages lag",
              "Track host error rates and retry budgets"
            ]
          }
        ],
        "checklist": [
          "Design a durable frontier and dedup pipeline.",
          "Respect politeness and robots constraints.",
          "Separate fetch, parse, and index stages.",
          "Observe backlog, duplicate rate, and host-level failures."
        ],
        "pitfalls": [
          "Using one shared queue without host-level fairness.",
          "Ignoring robots.txt or crawl budget semantics.",
          "Treating parsing as synchronous with fetch."
        ],
        "interviewPrompts": [
          "How would you avoid overwhelming a small website?",
          "What data needs to be durable versus ephemeral?",
          "How do you deduplicate pages efficiently?"
        ],
        "diagram": {
          "src": "/primer-images/bWxPtQA.png",
          "alt": "Distributed web crawler diagram",
          "caption": "Crawlers highlight scheduling, politeness, deduplication, and pipeline resilience.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "queues-and-streams",
          "search-autocomplete"
        ],
        "moduleSlug": "case-studies",
        "moduleTitle": "Case studies and interview drills",
        "order": 2,
        "id": "case-studies/web-crawler"
      },
      {
        "slug": "social-graph",
        "title": "Case study: social graph service",
        "summary": "A social graph stores user relationships, supports high-volume fan-out queries, and powers many downstream ranking and recommendation systems.",
        "duration": "25-35 min",
        "whyItMatters": "This is a good drill for graph-shaped data, adjacency lists, caching, and consistency semantics around relationship changes.",
        "sections": [
          {
            "heading": "Model relationships clearly",
            "body": "Follow, friend, mute, and block edges have different semantics and query patterns. Keep them explicit in the model.",
            "bullets": [
              "Adjacency lists often scale better than general graph traversals on the hot path",
              "Bidirectional friendship needs consistent update semantics",
              "Relationship history may matter for audit or recommendation signals"
            ]
          },
          {
            "heading": "Query paths",
            "body": "Common reads include followers, following, mutuals, and authorization checks such as block or visibility rules.",
            "bullets": [
              "Precompute counts and hot sets when useful",
              "Cache frequently accessed adjacency segments",
              "Expect celebrity accounts to skew follower queries"
            ]
          },
          {
            "heading": "Downstream consumers",
            "body": "Feeds, notifications, recommendations, and privacy checks often consume graph changes asynchronously.",
            "bullets": [
              "Publish edge changes to downstream systems",
              "Backfill derived views after repair or migration",
              "Track lag between the graph and downstream indexes"
            ]
          }
        ],
        "checklist": [
          "Choose a graph representation based on hot queries.",
          "Explain celebrity skew and cache strategy.",
          "Differentiate edge types and their semantics.",
          "Mention downstream consumers of relationship changes."
        ],
        "pitfalls": [
          "Using expensive graph traversals for every user-facing request.",
          "Treating all relationship types as the same edge.",
          "Ignoring the effect of graph changes on feeds and notifications."
        ],
        "interviewPrompts": [
          "How would you model follows versus mutual friendships?",
          "What happens when a celebrity gains millions of followers?",
          "Why might a graph database not be necessary for the hot path?"
        ],
        "diagram": {
          "src": "/primer-images/cdCv5g7.png",
          "alt": "Social graph diagram",
          "caption": "Graph-shaped domains often rely on adjacency patterns and derived downstream views.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "feed-timeline",
          "nosql-landscape"
        ],
        "moduleSlug": "case-studies",
        "moduleTitle": "Case studies and interview drills",
        "order": 3,
        "id": "case-studies/social-graph"
      },
      {
        "slug": "query-cache",
        "title": "Case study: query-result cache",
        "summary": "Design a cache that stores expensive query results while handling invalidation, skew, and freshness guarantees.",
        "duration": "25-35 min",
        "whyItMatters": "This is a focused practice problem for cache keys, eviction strategy, and derived-data ownership.",
        "sections": [
          {
            "heading": "Cache the right abstraction",
            "body": "Sometimes caching raw rows is less effective than caching the assembled response or query result that users repeatedly request.",
            "bullets": [
              "Normalize cache keys across equivalent queries",
              "Include tenant, locale, and auth context where needed",
              "Protect against giant payloads and poor cardinality"
            ]
          },
          {
            "heading": "Freshness and invalidation",
            "body": "Result caches become tricky when the underlying data changes frequently or when queries combine many mutable sources.",
            "bullets": [
              "Time-based TTLs are simple but blunt",
              "Event-driven invalidation can be precise but complex",
              "Stale-while-revalidate often improves user experience"
            ]
          },
          {
            "heading": "Eviction and hot keys",
            "body": "Memory pressure, uneven query popularity, and batch invalidations can destabilize the cache if not planned carefully.",
            "bullets": [
              "Use size-aware eviction when payload sizes vary",
              "Protect hot keys from stampedes",
              "Observe miss cost and eviction churn"
            ]
          }
        ],
        "checklist": [
          "Define the cached unit and key shape.",
          "State how freshness is maintained.",
          "Handle hot keys and stampedes explicitly.",
          "Measure miss cost, not just hit ratio."
        ],
        "pitfalls": [
          "Caching queries whose invalidation cost exceeds their value.",
          "Ignoring authorization context in cache keys.",
          "Assuming LRU alone solves all hot-key problems."
        ],
        "interviewPrompts": [
          "When is a result cache better than object-level caching?",
          "How would you invalidate cached search results?",
          "Why should miss cost guide your cache decision?"
        ],
        "diagram": {
          "src": "/primer-images/4j99mhe.png",
          "alt": "Query cache architecture diagram",
          "caption": "Result caches work best when the cached unit maps directly to an expensive repeated read path.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "caching-layers",
          "cache-invalidation"
        ],
        "moduleSlug": "case-studies",
        "moduleTitle": "Case studies and interview drills",
        "order": 4,
        "id": "case-studies/query-cache"
      },
      {
        "slug": "scaling-playbook",
        "title": "Case study: scaling playbook",
        "summary": "Practice describing how a simple single-region web application evolves through caching, queueing, partitioning, and global distribution over multiple growth stages.",
        "duration": "25-35 min",
        "whyItMatters": "Interviewers like this because it reveals whether you can tell a coherent architectural story instead of listing disconnected components.",
        "sections": [
          {
            "heading": "Stage architecture incrementally",
            "body": "Start simple with a monolith and a single database, then introduce CDNs, load balancers, caches, read replicas, queues, and sharding as each bottleneck emerges.",
            "bullets": [
              "Explain why each step happens at that stage",
              "Preserve migration paths between stages",
              "Avoid introducing complexity before a measurable need exists"
            ]
          },
          {
            "heading": "Keep failure and operations in view",
            "body": "Every scaling step changes deploy behavior, backup strategy, observability, and on-call load.",
            "bullets": [
              "Add health checks and failover as tiers multiply",
              "Expect cache invalidation and queue monitoring to become major concerns",
              "Budget time for tooling and automation, not just product features"
            ]
          },
          {
            "heading": "Tell the story clearly",
            "body": "The most convincing designs present a baseline, then show the next 2 or 3 steps under growth and the signals that trigger each transition.",
            "bullets": [
              "Name the bottleneck first",
              "Give one mitigation and one future risk",
              "End with trade-offs, not a claim of perfection"
            ]
          }
        ],
        "checklist": [
          "Describe the architecture evolution in stages.",
          "Tie each stage to a bottleneck or product requirement.",
          "Include operational changes as scale grows.",
          "Keep the story incremental and justified."
        ],
        "pitfalls": [
          "Throwing every pattern into version one.",
          "Ignoring migration and data movement between stages.",
          "Presenting scaling as only an infrastructure problem rather than a product and team problem."
        ],
        "interviewPrompts": [
          "What is the first scaling step for a successful monolith?",
          "How would you explain the trigger for sharding?",
          "Why should scaling stories include operational maturity?"
        ],
        "diagram": {
          "src": "/primer-images/jj3A5N8.png",
          "alt": "Scaling architecture progression diagram",
          "caption": "A staged scaling story is often more persuasive than a prematurely complex final-state design.",
          "credit": "Adapted from The System Design Primer by Donne Martin (CC BY 4.0)."
        },
        "related": [
          "performance-vs-scalability",
          "deployment-capacity-cost"
        ],
        "moduleSlug": "case-studies",
        "moduleTitle": "Case studies and interview drills",
        "order": 5,
        "id": "case-studies/scaling-playbook"
      }
    ]
  }
];


export const allLessons = modules.flatMap((module) =>
  module.lessons.map((lesson, index) => ({
    ...lesson,
    moduleSlug: module.slug,
    moduleTitle: module.title,
    moduleSummary: module.summary,
    lessonIndex: index,
    lessonCount: module.lessons.length
  }))
);

export const moduleIndex = Object.fromEntries(modules.map((module) => [module.slug, module]));
export const lessonIndex = Object.fromEntries(allLessons.map((lesson) => [lesson.id, lesson]));

/**
 * @param {string} moduleSlug
 */
export function getModuleBySlug(moduleSlug) {
  return moduleIndex[moduleSlug];
}

/**
 * @param {string} moduleSlug
 * @param {string} lessonSlug
 */
export function getLessonBySlug(moduleSlug, lessonSlug) {
  return lessonIndex[`${moduleSlug}/${lessonSlug}`];
}

/**
 * @param {string[]} completedLessonIds
 * @param {string} moduleSlug
 */
export function getModuleProgress(completedLessonIds, moduleSlug) {
  const module = getModuleBySlug(moduleSlug);
  if (!module) return { completed: 0, total: 0 };
  const completed = module.lessons.filter((lesson) => completedLessonIds.includes(`${moduleSlug}/${lesson.slug}`)).length;
  return { completed, total: module.lessons.length };
}
