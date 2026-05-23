export const siteOverview = {
  title: "System Design Primer, made interactive",
  subtitle:
    "Learn the core system design topics in a dependency-aware order with mode-based coaching, quick checks, and short design exercises.",
  studyLoop: [
    "Read the meaning of the topic in one pass.",
    "Connect the trade-off to an actual design choice.",
    "Answer the quick check before revealing the explanation.",
    "Write a short design response in your current learning mode.",
  ],
};

export const learnerModes = [
  {
    id: "beginner",
    label: "Beginner",
    audience: "0–2 years experience",
    description:
      "Focus on vocabulary, core trade-offs, and when a building block should be introduced at all.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    audience: "2–5 years experience",
    description:
      "Focus on connecting trade-offs across services, storage, caching, and operations.",
  },
  {
    id: "advanced",
    label: "Advanced",
    audience: "5+ years experience",
    description:
      "Focus on failure modes, operational limits, and how design choices behave under real production stress.",
  },
];

export const primerTopics = [
  {
    id: "start-here",
    title: "System design topics: start here",
    summary:
      "Start with constraints, traffic shape, correctness needs, and failure expectations before picking technologies.",
    sections: [
      {
        heading: "What it means",
        body:
          "System design is the process of turning product needs into concrete interfaces, data flows, storage choices, and reliability controls. Good design starts with the problem shape, not with a favorite database or cloud service.",
      },
      {
        heading: "How it affects the design",
        body:
          "The first questions you ask determine almost every later choice: whether data can be stale, whether writes must be durable immediately, how much fan-out exists, and where bottlenecks will appear first.",
      },
      {
        heading: "What good answers look like",
        body:
          "A strong design answer states assumptions, estimates scale, draws the critical path, and names the main trade-offs before drilling into components. That keeps the design concise and prevents overbuilding.",
      },
    ],
    modeFocus: {
      beginner:
        "Practice asking clarifying questions and defining the read path, write path, and scale target in plain language.",
      intermediate:
        "Practice turning requirements into latency, throughput, and consistency budgets that drive component choices.",
      advanced:
        "Practice identifying the control points, failure boundaries, and the cheapest place to pay for correctness.",
    },
    exercises: [
      {
        id: "start-here-check",
        type: "multiple-choice",
        prompt: "What should come before selecting a database or cache?",
        options: [
          "Clarifying constraints such as traffic, latency, consistency, and failure tolerance",
          "Choosing a storage engine that is popular in interviews",
          "Drawing a replication topology from memory",
          "Optimizing for multi-region support immediately",
        ],
        answer: 0,
        explanation:
          "Technology choices only make sense after you know the workload and correctness needs. Otherwise you optimize for the wrong bottleneck.",
      },
      {
        id: "start-here-reflect",
        type: "reflection",
        prompt: "Write three questions you would ask before designing a new system.",
        guidance:
          "Useful questions usually cover traffic shape, availability and consistency expectations, and the most expensive user-facing operation.",
      },
    ],
    children: [
      {
        id: "scalability-video",
        title: "Step 1: Review the scalability video lecture",
        summary:
          "Use the lecture to build intuition for throughput, bottlenecks, parallelism, and why queueing appears before a system looks fully saturated.",
        impact:
          "It helps you explain scaling visually and communicate why a design needs partitioning, caching, or asynchronous work.",
        quickCheck: {
          question: "What should you watch for in the lecture?",
          answer:
            "Notice where work becomes serialized, where queues build, and which shared dependencies cap throughput long before every server is busy.",
        },
      },
      {
        id: "scalability-article",
        title: "Step 2: Review the scalability article",
        summary:
          "Use the article to reinforce vocabulary such as latency, availability, consistency, partitions, and horizontal scaling.",
        impact:
          "It creates a shared language for the rest of the primer so later trade-offs are easier to compare.",
        quickCheck: {
          question: "Why read the article after the lecture?",
          answer:
            "The lecture builds intuition; the article gives precise terms and examples that you can reuse in design discussions.",
        },
      },
      {
        id: "next-steps",
        title: "Next steps",
        summary:
          "Move from core trade-offs to network, storage, caching, asynchronous systems, and security in roughly that order.",
        impact:
          "This order mirrors how many real systems evolve: first understand trade-offs, then decide how requests move, where data lives, and how failure is contained.",
        quickCheck: {
          question: "What is the next useful topic after getting the vocabulary?",
          answer:
            "Start with foundational trade-offs such as performance versus scalability and latency versus throughput, because they shape every later design choice.",
        },
      },
    ],
  },
  {
    id: "performance-vs-scalability",
    title: "Performance vs scalability",
    summary:
      "Performance measures how fast one system instance works; scalability measures how well the system continues to work as load grows.",
    sections: [
      {
        heading: "What it means",
        body:
          "Performance is about current efficiency: response time, throughput, resource use, and work per request. Scalability is about growth: whether you can add capacity, partition work, or remove coordination points as demand increases.",
      },
      {
        heading: "How it affects the design",
        body:
          "A design with excellent single-node performance can still scale poorly if it depends on global locks, shared metadata, or one write leader. A scalable design usually reduces contention and lets capacity be added in parallel.",
      },
      {
        heading: "Design guidance",
        body:
          "Optimize single-node performance when the system is simple and load is modest. Invest in scalability when growth, hotspots, or coordination costs are likely to dominate the next stage of the product.",
      },
    ],
    modeFocus: {
      beginner:
        "Separate the idea of 'fast today' from 'still works at 10x traffic'.",
      intermediate:
        "Look for coordination points, stateful bottlenecks, and whether adding nodes really increases useful capacity.",
      advanced:
        "Ask which resource saturates first, how tail latency changes near saturation, and what control-plane limits block horizontal growth.",
    },
    exercises: [
      {
        id: "perf-scale-check",
        type: "multiple-choice",
        prompt: "Which system is more scalable?",
        options: [
          "A service that gets twice the throughput when you double stateless workers",
          "A single server with very low latency but no ability to partition work",
          "A database leader with strong CPU performance and all writes on one node",
          "A cache tier with one giant instance and no shard expansion plan",
        ],
        answer: 0,
        explanation:
          "Scalability is about handling growth by adding capacity or reducing contention. The stateless worker example increases useful throughput as nodes are added.",
      },
      {
        id: "perf-scale-reflect",
        type: "reflection",
        prompt: "Name one feature where you would accept lower raw performance to gain better scalability.",
        guidance:
          "A good answer mentions a coordination-heavy design that becomes easier to scale after introducing partitioning, queues, or asynchronous processing.",
      },
    ],
    children: [],
  },
  {
    id: "latency-vs-throughput",
    title: "Latency vs throughput",
    summary:
      "Latency measures how long one request takes; throughput measures how much work the system finishes in a time window.",
    sections: [
      {
        heading: "What it means",
        body:
          "Low latency matters when users wait on individual requests. High throughput matters when the system must complete a large amount of work overall, even if some work can finish slightly later.",
      },
      {
        heading: "How it affects the design",
        body:
          "Designs that optimize latency reduce synchronous hops, avoid queueing, and keep the critical path short. Designs that optimize throughput batch work, use asynchronous pipelines, and keep machines busy over time.",
      },
      {
        heading: "Common trade-off",
        body:
          "Batching, compression, and write-behind often improve throughput but can add latency. Dedicated hot paths, local caches, and precomputation improve latency but may cost more infrastructure.",
      },
    ],
    modeFocus: {
      beginner: "Identify which user action is latency-sensitive and which work can be deferred.",
      intermediate: "Break the request into stages and estimate which hops dominate p95 and p99 latency.",
      advanced: "Explain how queueing, retries, and burstiness distort throughput and tail latency together.",
    },
    exercises: [
      {
        id: "latency-throughput-check",
        type: "multiple-choice",
        prompt: "Which change usually improves throughput more than latency?",
        options: [
          "Batching writes before flushing to storage",
          "Removing one synchronous network hop from the read path",
          "Serving a response from an edge cache",
          "Keeping session data in memory for the request",
        ],
        answer: 0,
        explanation:
          "Batching amortizes overhead across more work, which usually increases throughput. Removing synchronous hops is the stronger latency improvement.",
      },
      {
        id: "latency-throughput-reflect",
        type: "reflection",
        prompt: "Describe one part of a design that should optimize for latency and one that should optimize for throughput.",
        guidance:
          "Front-door user actions usually optimize for latency, while analytics, indexing, and media processing often optimize for throughput.",
      },
    ],
    children: [],
  },
  {
    id: "availability-vs-consistency",
    title: "Availability vs consistency",
    summary:
      "Availability favors always returning a response; consistency favors returning the latest correct state, even if that means rejecting or delaying some requests.",
    sections: [
      {
        heading: "What it means",
        body:
          "In distributed systems, failures and partitions force choices. If replicas cannot agree, you can keep serving possibly stale data, or you can pause some operations until the system can prove the result is current.",
      },
      {
        heading: "How it affects the design",
        body:
          "The trade-off determines whether reads can come from lagging replicas, whether writes need quorum acknowledgement, and how much user-visible staleness is acceptable during failures.",
      },
      {
        heading: "Design guidance",
        body:
          "Choose stronger consistency when incorrect state is dangerous, such as payments, inventory reservation, or permission checks. Choose higher availability when serving stale data is cheaper than blocking users completely.",
      },
    ],
    modeFocus: {
      beginner:
        "Practice asking whether stale data is acceptable for this feature and for how long.",
      intermediate:
        "Connect the trade-off to replica reads, write acknowledgement, and failover behavior.",
      advanced:
        "Explain the difference between consistency guarantees in normal operation and the guarantees that remain during partitions or leader changes.",
    },
    exercises: [
      {
        id: "availability-consistency-check",
        type: "multiple-choice",
        prompt: "Which feature usually needs consistency over availability?",
        options: [
          "Checking whether a payment was already captured",
          "Showing like counts on a social feed",
          "Displaying cached weather information",
          "Serving product recommendations",
        ],
        answer: 0,
        explanation:
          "Payment state must be correct because duplicate or missing captures are costly. The other examples can usually tolerate brief staleness.",
      },
      {
        id: "availability-consistency-reflect",
        type: "reflection",
        prompt: "Describe one feature where stale reads are acceptable and one where they are not.",
        guidance:
          "Good answers tie the choice to user harm, business risk, and how expensive it is to recover from incorrect data.",
      },
    ],
    children: [
      {
        id: "cap-theorem",
        title: "CAP theorem",
        summary:
          "CAP says that during a network partition, a distributed system cannot simultaneously provide full consistency and full availability for the affected operations.",
        impact:
          "It is a failure-time framework, not a rule for normal operation. Use it to reason about what the system does when replicas cannot communicate.",
        quickCheck: {
          question: "Why is CAP often misused?",
          answer:
            "Because people treat it as a general ranking of databases, when it only constrains behavior during partitions.",
        },
      },
      {
        id: "cp",
        title: "CP - consistency and partition tolerance",
        summary:
          "CP systems keep data consistent across the surviving path but may reject or delay some requests during a partition.",
        impact:
          "Use CP behavior when stale or conflicting data is worse than temporary unavailability.",
        quickCheck: {
          question: "What is the cost of CP during a partition?",
          answer:
            "Some clients may be unable to read or write until the system can re-establish a safe source of truth.",
        },
      },
      {
        id: "ap",
        title: "AP - availability and partition tolerance",
        summary:
          "AP systems keep serving requests during a partition, even if different replicas temporarily diverge.",
        impact:
          "Use AP behavior when the product can tolerate temporary inconsistency and repair later through merge or reconciliation.",
        quickCheck: {
          question: "What must an AP design add later?",
          answer:
            "A repair strategy such as conflict resolution, read repair, anti-entropy, or a business rule for choosing the winning state.",
        },
      },
    ],
  },
  {
    id: "consistency-patterns",
    title: "Consistency patterns",
    summary:
      "Consistency patterns describe how quickly replicas converge and what clients are allowed to observe after writes.",
    sections: [
      {
        heading: "What it means",
        body:
          "Not every system needs the same freshness guarantee. Weak, eventual, and strong consistency represent different contracts between writes, reads, and replication delay.",
      },
      {
        heading: "How it affects the design",
        body:
          "Consistency requirements drive replica layout, quorum sizes, read routing, conflict handling, and whether some operations need a single coordinator.",
      },
      {
        heading: "Design guidance",
        body:
          "Be explicit about which operations need strong guarantees and which can tolerate lag. Paying for strong consistency everywhere often raises latency and operational complexity without improving the user experience.",
      },
    ],
    modeFocus: {
      beginner: "Match the guarantee to the user expectation instead of trying to memorize definitions only.",
      intermediate: "Explain what a client can observe right after a write and after a failover.",
      advanced: "Separate session guarantees, replica freshness, and cross-region coordination costs.",
    },
    exercises: [
      {
        id: "consistency-patterns-check",
        type: "multiple-choice",
        prompt: "Which guarantee usually gives the lowest write latency across regions?",
        options: [
          "Eventual consistency",
          "Strong consistency with a global quorum",
          "Linearizable reads and writes everywhere",
          "Synchronous leader failover before each write",
        ],
        answer: 0,
        explanation:
          "Eventual consistency allows replicas to accept writes and converge later, avoiding the coordination cost of synchronous global agreement.",
      },
      {
        id: "consistency-patterns-reflect",
        type: "reflection",
        prompt: "Name one operation in a social product that could be eventual and one that should be strong.",
        guidance:
          "Counts and timelines are often eventual; account settings, billing state, and permission changes often need stronger guarantees.",
      },
    ],
    children: [
      {
        id: "weak-consistency",
        title: "Weak consistency",
        summary:
          "Weak consistency provides little guarantee about when a read will reflect a recent write.",
        impact:
          "It can be acceptable for data that is naturally approximate or only used for trends, but it is risky for user-visible correctness decisions.",
        quickCheck: {
          question: "When is weak consistency acceptable?",
          answer:
            "When temporary inaccuracy has low business cost, such as approximate analytics or non-critical counters.",
        },
      },
      {
        id: "eventual-consistency",
        title: "Eventual consistency",
        summary:
          "Eventual consistency means replicas may disagree temporarily, but they converge once updates stop and repair completes.",
        impact:
          "It supports higher availability and lower coordination overhead, but the application must tolerate stale or conflicting reads for a period.",
        quickCheck: {
          question: "What makes eventual consistency safe enough?",
          answer:
            "Clear staleness boundaries, idempotent updates, and conflict resolution rules that match the product behavior.",
        },
      },
      {
        id: "strong-consistency",
        title: "Strong consistency",
        summary:
          "Strong consistency makes reads reflect the latest committed write according to a single system order.",
        impact:
          "It simplifies reasoning for correctness-sensitive features, but usually increases latency and reduces tolerance for partitions or slow replicas.",
        quickCheck: {
          question: "What is the main cost of strong consistency?",
          answer:
            "More coordination on the write or read path, which increases latency and can reduce availability during failures.",
        },
      },
    ],
  },
  {
    id: "availability-patterns",
    title: "Availability patterns",
    summary:
      "Availability patterns keep the service usable when machines, zones, or entire regions fail.",
    sections: [
      {
        heading: "What it means",
        body:
          "High availability is achieved through redundancy, fast failure detection, safe failover, and controlled degradation. Extra replicas alone do not help if traffic cannot be rerouted safely or if a shared dependency still fails.",
      },
      {
        heading: "How it affects the design",
        body:
          "You need health checks, leader election or request routing logic, enough spare capacity, and a clear model for what data becomes stale or unavailable during failover.",
      },
      {
        heading: "Design guidance",
        body:
          "Design for graceful degradation instead of assuming every dependency is always up. The best availability plan usually includes both fast local recovery and a slower regional recovery path.",
      },
    ],
    modeFocus: {
      beginner: "Learn that redundancy only helps when traffic can move to healthy capacity safely.",
      intermediate: "Tie failover plans to health checks, capacity headroom, and user-visible degradation.",
      advanced: "Reason about correlated failure, control-plane dependence, and how to test failover without causing an outage.",
    },
    exercises: [
      {
        id: "availability-patterns-check",
        type: "multiple-choice",
        prompt: "What is the most common reason redundant servers still do not improve availability?",
        options: [
          "A shared dependency or routing layer can still fail the whole service",
          "Users only send traffic to the first server alphabetically",
          "Redundancy always lowers throughput",
          "Replication automatically disables health checks",
        ],
        answer: 0,
        explanation:
          "Redundancy only helps when the system can isolate and route around failures. Shared state, shared control planes, and shared storage often create hidden single points of failure.",
      },
      {
        id: "availability-patterns-reflect",
        type: "reflection",
        prompt: "Describe one dependency you would test during a failover drill besides the main application servers.",
        guidance:
          "Good answers mention DNS, service discovery, caches, queues, configuration stores, identity providers, or background jobs that keep serving traffic indirectly.",
      },
    ],
    children: [
      {
        id: "fail-over",
        title: "Fail-over",
        summary:
          "Fail-over shifts traffic from an unhealthy component or location to a healthy one.",
        impact:
          "It only works well when failure detection is fast, spare capacity exists, and state transfer or replay does not overload the target.",
        quickCheck: {
          question: "Why is failover harder for writes than reads?",
          answer:
            "Writes depend on fresh ownership, durable state, and avoiding split-brain, while many read paths can tolerate cached or lagging data briefly.",
        },
      },
      {
        id: "replication",
        title: "Replication",
        summary:
          "Replication keeps multiple copies of data or service capacity so a single failure does not immediately stop the system.",
        impact:
          "It improves durability and read scaling, but also creates replication lag, repair work, and consistency trade-offs.",
        quickCheck: {
          question: "What is the hidden cost of replication?",
          answer:
            "Every extra replica adds coordination, repair, storage, and monitoring cost, especially when replicas drift or need rebuilding.",
        },
      },
      {
        id: "availability-in-numbers",
        title: "Availability in numbers",
        summary:
          "Availability percentages convert downtime tolerance into concrete operational targets such as minutes per month or year.",
        impact:
          "This forces honest design decisions: every additional nine usually requires more testing, automation, and isolation, not just more servers.",
        quickCheck: {
          question: "Why is 99.99% much harder than 99.9%?",
          answer:
            "Because the allowed downtime shrinks sharply, so routine maintenance, failovers, and operational mistakes all need tighter control.",
        },
      },
    ],
  },
  {
    id: "dns",
    title: "Domain name system",
    summary:
      "DNS maps human-readable names to network endpoints and is often the first control point for routing users to infrastructure.",
    sections: [
      {
        heading: "What it means",
        body:
          "DNS translates names such as api.example.com into IP addresses or other records. It is distributed, cached heavily, and updated through TTL-based propagation rather than instant global coordination.",
      },
      {
        heading: "How it affects the design",
        body:
          "DNS influences latency, regional routing, failover speed, and how quickly traffic shifts after a deployment or outage. It is excellent for coarse routing but too slow for per-request balancing.",
      },
      {
        heading: "Design guidance",
        body:
          "Use DNS for global entry-point decisions, but combine it with load balancers or proxies for fine-grained traffic control. Plan around TTL, client caching, and the fact that some clients ignore aggressive cache settings.",
      },
    ],
    modeFocus: {
      beginner: "Understand DNS as a naming and coarse-routing layer, not as a full traffic manager.",
      intermediate: "Explain TTL, cache propagation, and why DNS-based failover is not instantaneous.",
      advanced: "Account for resolver behavior, partial regional failover, and the operational limits of health-check-driven DNS routing.",
    },
    exercises: [
      {
        id: "dns-check",
        type: "multiple-choice",
        prompt: "Why is DNS alone a poor tool for instant failover?",
        options: [
          "Resolvers and clients cache records based on TTL and behavior you do not fully control",
          "DNS can only point to a single IP forever",
          "DNS cannot work with HTTPS",
          "DNS always routes round-robin with no health checks",
        ],
        answer: 0,
        explanation:
          "Even if you update DNS quickly, caches may continue to serve the previous answer for some time, so failover is not immediate or perfectly predictable.",
      },
      {
        id: "dns-reflect",
        type: "reflection",
        prompt: "When would you use DNS for routing and when would you delegate to a load balancer?",
        guidance:
          "Use DNS for region or entry-point selection; use a load balancer or proxy for per-request routing, health checks, and protocol-aware decisions.",
      },
    ],
    children: [],
  },
  {
    id: "cdn",
    title: "Content delivery network",
    summary:
      "A CDN caches content close to users to reduce latency, offload origin traffic, and improve resilience for globally distributed reads.",
    sections: [
      {
        heading: "What it means",
        body:
          "A CDN is a geographically distributed cache and delivery layer. It stores static or cacheable dynamic content near users so requests do not always need to travel back to the origin service.",
      },
      {
        heading: "How it affects the design",
        body:
          "A CDN changes your latency profile, traffic cost, cache invalidation strategy, and security posture at the edge. It is especially valuable when reads are global and objects are reused frequently.",
      },
      {
        heading: "Design guidance",
        body:
          "Use a CDN for assets, downloads, media, and cacheable API responses. Be explicit about TTL, invalidation, personalization boundaries, and what must still be served from the origin.",
      },
    ],
    modeFocus: {
      beginner: "Think of a CDN as a read cache near the user that protects the origin.",
      intermediate: "Match cache policy to content volatility, personalization, and invalidation needs.",
      advanced: "Explain cache hierarchy, origin shielding, signed delivery, and what happens during large invalidations or origin loss.",
    },
    exercises: [
      {
        id: "cdn-check",
        type: "multiple-choice",
        prompt: "Which content is the best default candidate for a CDN?",
        options: [
          "Static images and versioned JavaScript bundles",
          "Per-user balance data with strict freshness",
          "A write-heavy payment capture API",
          "A leader election control endpoint",
        ],
        answer: 0,
        explanation:
          "CDNs are strongest for cacheable read-heavy content that many users request repeatedly and that does not require unique per-request computation.",
      },
      {
        id: "cdn-reflect",
        type: "reflection",
        prompt: "What would stop you from caching a dynamic API response at the edge?",
        guidance:
          "Personalization, sensitive data, strict freshness requirements, and highly unique responses are the main reasons.",
      },
    ],
    children: [
      {
        id: "push-cdns",
        title: "Push CDNs",
        summary:
          "Push CDNs receive content proactively from the origin before users request it.",
        impact:
          "They work well when the origin knows what should be distributed ahead of time, such as large media files or release artifacts.",
        quickCheck: {
          question: "When do push CDNs help most?",
          answer:
            "When content is prepared in advance and origin fetch latency or origin availability would otherwise be a problem.",
        },
      },
      {
        id: "pull-cdns",
        title: "Pull CDNs",
        summary:
          "Pull CDNs fetch content from the origin on a miss and cache it afterward.",
        impact:
          "They are simpler operationally and fit most websites, but the first request still pays the miss penalty.",
        quickCheck: {
          question: "What is the main trade-off of a pull CDN?",
          answer:
            "You get simpler origin integration, but the first request for each object or after expiry still has to hit the origin.",
        },
      },
    ],
  },
  {
    id: "load-balancer",
    title: "Load balancer",
    summary:
      "A load balancer distributes requests across multiple backends so no single node becomes the front-door bottleneck.",
    sections: [
      {
        heading: "What it means",
        body:
          "Load balancers sit between clients and services. They terminate connections or forward packets, apply health checks, and choose which backend should handle a request.",
      },
      {
        heading: "How it affects the design",
        body:
          "Load balancing improves availability and capacity usage, but it also becomes part of the latency path and can influence session affinity, retry behavior, and protocol support.",
      },
      {
        heading: "Design guidance",
        body:
          "Choose the simplest balancing strategy that matches the protocol and routing logic you need. Always plan health checks, capacity headroom, and a strategy for draining nodes safely during deployments.",
      },
    ],
    modeFocus: {
      beginner: "Understand the load balancer as a traffic distributor and health-check gate.",
      intermediate: "Explain when you need sticky sessions, request-aware routing, or multi-layer balancing.",
      advanced: "Reason about queueing at the balancer, connection reuse, overload signaling, and regional failover interactions.",
    },
    exercises: [
      {
        id: "load-balancer-check",
        type: "multiple-choice",
        prompt: "Which problem does a load balancer solve first?",
        options: [
          "Preventing one backend from taking all front-door traffic",
          "Making every database strongly consistent",
          "Compressing stored objects automatically",
          "Replacing service discovery completely",
        ],
        answer: 0,
        explanation:
          "Its first job is to spread traffic and remove unhealthy instances from rotation so one server is not the single front-door bottleneck.",
      },
      {
        id: "load-balancer-reflect",
        type: "reflection",
        prompt: "What health check would you configure for an API that depends on a database?",
        guidance:
          "A good answer distinguishes readiness from liveness and avoids a health check so expensive or strict that it creates more instability.",
      },
    ],
    children: [
      {
        id: "active-passive",
        title: "Active-passive",
        summary:
          "One instance or site serves traffic while another waits in reserve and takes over during failure.",
        impact:
          "This is simpler to reason about, but failover time and stale reserve capacity can be significant costs.",
        quickCheck: {
          question: "Why choose active-passive?",
          answer:
            "It reduces split-brain and coordination complexity when only one side should actively serve writes.",
        },
      },
      {
        id: "active-active",
        title: "Active-active",
        summary:
          "Multiple instances or sites serve traffic at the same time.",
        impact:
          "It improves steady-state utilization and can fail over faster, but it requires careful handling of shared state, routing, and consistency.",
        quickCheck: {
          question: "What is the main challenge in active-active?",
          answer:
            "Keeping shared state and routing safe when more than one location can accept traffic concurrently.",
        },
      },
      {
        id: "layer-4-load-balancing",
        title: "Layer 4 load balancing",
        summary:
          "Layer 4 balancers route using transport-level information such as IPs and ports.",
        impact:
          "They are fast and protocol-agnostic, but they cannot make decisions based on HTTP paths, headers, or application semantics.",
        quickCheck: {
          question: "When is Layer 4 enough?",
          answer:
            "When you only need connection-level distribution and do not need request-aware routing or content-based policies.",
        },
      },
      {
        id: "layer-7-load-balancing",
        title: "Layer 7 load balancing",
        summary:
          "Layer 7 balancers understand application protocols such as HTTP and can route using paths, headers, or cookies.",
        impact:
          "They enable flexible routing and policy enforcement, but they add more processing overhead and operational complexity.",
        quickCheck: {
          question: "Why pay for Layer 7?",
          answer:
            "Because it supports request-aware routing, auth integration, rate limiting, and traffic shaping that Layer 4 cannot provide.",
        },
      },
      {
        id: "horizontal-scaling",
        title: "Horizontal scaling",
        summary:
          "Horizontal scaling increases capacity by adding more nodes instead of making a single node larger.",
        impact:
          "It improves fault tolerance and growth potential, but only if state and coordination are designed to spread cleanly across nodes.",
        quickCheck: {
          question: "What blocks horizontal scaling most often?",
          answer:
            "Shared mutable state, sticky in-memory sessions, and global coordination points that every request still must pass through.",
        },
      },
    ],
  },
  {
    id: "reverse-proxy",
    title: "Reverse proxy (web server)",
    summary:
      "A reverse proxy receives client requests on behalf of backend services and can add caching, TLS termination, routing, and security controls.",
    sections: [
      {
        heading: "What it means",
        body:
          "Unlike a forward proxy, a reverse proxy sits in front of your application. Clients see one entry point while the proxy forwards, rewrites, caches, or filters requests behind the scenes.",
      },
      {
        heading: "How it affects the design",
        body:
          "A reverse proxy can simplify TLS handling, compression, caching, authentication, and path-based routing. It is also another hop in the request path, so its failure and capacity matter.",
      },
      {
        heading: "Design guidance",
        body:
          "Use a reverse proxy when you need application-aware routing or a clean edge layer before services. Keep the proxy stateless where possible and make sure its configuration changes are safe and observable.",
      },
    ],
    modeFocus: {
      beginner: "Understand the proxy as the web-facing layer that protects and organizes backend services.",
      intermediate: "Differentiate proxy features such as TLS termination, caching, and path routing from pure transport balancing.",
      advanced: "Explain proxy capacity limits, config distribution, connection reuse, and what happens when the edge layer is overloaded.",
    },
    exercises: [
      {
        id: "reverse-proxy-check",
        type: "multiple-choice",
        prompt: "Which job is most natural for a reverse proxy?",
        options: [
          "TLS termination and path-based routing before traffic reaches services",
          "Replacing the primary database with an in-memory cache",
          "Persisting every user event to durable storage",
          "Rebalancing shards inside a distributed database",
        ],
        answer: 0,
        explanation:
          "Reverse proxies are designed to sit at the web edge and handle protocol-aware entry tasks such as TLS, routing, and simple caching.",
      },
      {
        id: "reverse-proxy-reflect",
        type: "reflection",
        prompt: "When would you use both a load balancer and a reverse proxy?",
        guidance:
          "A common pattern is a transport-level or managed balancer at the front, with reverse proxies handling HTTP-aware behavior closer to the application.",
      },
    ],
    children: [
      {
        id: "load-balancer-vs-reverse-proxy",
        title: "Load balancer vs reverse proxy",
        summary:
          "A load balancer focuses on distributing traffic; a reverse proxy focuses on fronting application traffic with protocol-aware controls.",
        impact:
          "In practice they often overlap, but the distinction helps when deciding whether you need simple balancing or richer application-edge behavior.",
        quickCheck: {
          question: "Can one tool do both jobs?",
          answer:
            "Yes, many products combine them, but the design question is still whether you need simple traffic spreading or full edge-layer behavior.",
        },
      },
    ],
  },
  {
    id: "application-layer",
    title: "Application layer",
    summary:
      "The application layer contains the business logic, APIs, and service boundaries that turn requests into meaningful work.",
    sections: [
      {
        heading: "What it means",
        body:
          "This is where request validation, orchestration, authorization decisions, and domain rules typically live. It translates user actions into calls to storage, caches, queues, and downstream services.",
      },
      {
        heading: "How it affects the design",
        body:
          "Application-layer structure determines deployment boundaries, ownership, latency across service hops, and how easy it is to evolve features independently.",
      },
      {
        heading: "Design guidance",
        body:
          "Start with clear responsibilities and simple interfaces. Split services only when separate scaling, ownership, deployment, or fault-isolation needs outweigh the extra network and operational cost.",
      },
    ],
    modeFocus: {
      beginner: "Map the API request to the business logic and data it touches.",
      intermediate: "Decide where service boundaries reduce complexity versus where they only add hops.",
      advanced: "Reason about orchestration cost, ownership boundaries, and failure isolation across service fleets.",
    },
    exercises: [
      {
        id: "application-layer-check",
        type: "multiple-choice",
        prompt: "When is splitting a monolith into multiple services usually justified?",
        options: [
          "When independent scaling, ownership, or fault isolation clearly outweigh added coordination cost",
          "As soon as the first API endpoint is created",
          "Whenever a team wants different naming conventions",
          "Only after adding a CDN",
        ],
        answer: 0,
        explanation:
          "Service boundaries should exist for clear operational or domain reasons. Otherwise they can add latency, retries, and cross-service coupling without real benefit.",
      },
      {
        id: "application-layer-reflect",
        type: "reflection",
        prompt: "Name one domain where a monolith is still a strong default and explain why.",
        guidance:
          "Look for cases where the team is small, data is tightly coupled, and deployment or scaling does not require separate services yet.",
      },
    ],
    children: [
      {
        id: "microservices",
        title: "Microservices",
        summary:
          "Microservices split application logic into independently deployable services with clear boundaries.",
        impact:
          "They improve team autonomy and scaling flexibility when boundaries are clean, but increase operational complexity and network coordination.",
        quickCheck: {
          question: "What is the main risk of microservices?",
          answer:
            "Turning one local call into many distributed calls, which increases latency, retries, debugging cost, and partial-failure scenarios.",
        },
      },
      {
        id: "service-discovery",
        title: "Service discovery",
        summary:
          "Service discovery helps services find healthy instances of other services as addresses change over time.",
        impact:
          "Without it, scaling and deployments become fragile because clients need hard-coded locations. With it, the control plane becomes a critical dependency.",
        quickCheck: {
          question: "Why is service discovery a control-plane concern?",
          answer:
            "Because it decides where traffic should go, even though the actual data-serving path happens elsewhere.",
        },
      },
    ],
  },
  {
    id: "database",
    title: "Database",
    summary:
      "Databases store durable system state and often determine the strongest correctness and scaling constraints in the design.",
    sections: [
      {
        heading: "What it means",
        body:
          "The database is where long-lived records, indexes, and transactional rules usually live. Its data model and replication strategy shape what queries are cheap, what writes are safe, and how the system recovers.",
      },
      {
        heading: "How it affects the design",
        body:
          "Storage choices influence query latency, write throughput, consistency, partitioning, and operational work such as backup, failover, schema evolution, and repair.",
      },
      {
        heading: "Design guidance",
        body:
          "Choose a data model that matches access patterns first. Then decide how much transactional correctness, query flexibility, and horizontal growth the product really needs.",
      },
    ],
    modeFocus: {
      beginner: "Match the database to the access pattern and correctness needs, not to hype.",
      intermediate: "Explain replication, indexing, sharding, and query patterns together.",
      advanced: "Discuss repair cost, hotspot behavior, transaction scope, and the operational blast radius of storage decisions.",
    },
    exercises: [
      {
        id: "database-check",
        type: "multiple-choice",
        prompt: "What should drive the first database choice?",
        options: [
          "The access pattern and correctness guarantees the product needs",
          "Which engine supports the most features in marketing material",
          "Which database is easiest to scale infinitely without trade-offs",
          "Whether the team wants fewer monitoring dashboards",
        ],
        answer: 0,
        explanation:
          "The data model, read/write pattern, and correctness expectations determine whether relational or different NoSQL shapes are a better fit.",
      },
      {
        id: "database-reflect",
        type: "reflection",
        prompt: "Describe a feature where you would pay for transactions and one where you would optimize for simpler horizontal scale.",
        guidance:
          "Transactions fit tightly related records and invariants; simpler horizontally scaled stores fit massive write or lookup workloads with simpler item-level rules.",
      },
    ],
    children: [
      {
        id: "rdbms",
        title: "Relational database management system (RDBMS)",
        summary:
          "An RDBMS stores data in tables with schema, joins, indexes, and transactional guarantees.",
        impact:
          "It is strong when relationships and invariants matter, but cross-node scaling becomes harder as data and transactional scope grow.",
        quickCheck: {
          question: "Why are RDBMSs popular for core business data?",
          answer:
            "Because they provide strong transactional tools and expressive queries for related data that must remain correct.",
        },
      },
      {
        id: "master-slave-replication",
        title: "Master-slave replication",
        summary:
          "One primary node accepts writes and one or more replicas follow it asynchronously or semi-synchronously.",
        impact:
          "This simplifies write ordering and can scale reads, but introduces lag and a failover process that must promote a safe new primary.",
        quickCheck: {
          question: "What is the most common user-visible issue here?",
          answer:
            "Replica lag causing stale reads after a recent write.",
        },
      },
      {
        id: "master-master-replication",
        title: "Master-master replication",
        summary:
          "More than one node can accept writes, so conflicts or ordering rules must be handled explicitly.",
        impact:
          "It can improve locality or availability, but conflict resolution and operational safety become much harder.",
        quickCheck: {
          question: "What new risk appears with master-master?",
          answer:
            "Concurrent writes to the same logical data may conflict or produce non-obvious merge behavior.",
        },
      },
      {
        id: "federation",
        title: "Federation",
        summary:
          "Federation splits databases by function, tenant group, or domain rather than keeping one giant shared store.",
        impact:
          "It reduces blast radius and can align ownership, but cross-federation queries and migrations become more complex.",
        quickCheck: {
          question: "What problem does federation reduce?",
          answer:
            "It keeps every feature or tenant from depending on one shared database bottleneck or failure domain.",
        },
      },
      {
        id: "sharding",
        title: "Sharding",
        summary:
          "Sharding partitions one logical dataset across multiple nodes using a shard key.",
        impact:
          "It increases capacity and parallelism, but hotspots, resharding, and cross-shard operations become major design concerns.",
        quickCheck: {
          question: "What makes a shard key bad?",
          answer:
            "Low cardinality or skew that sends too much traffic or storage to a small number of shards.",
        },
      },
      {
        id: "denormalization",
        title: "Denormalization",
        summary:
          "Denormalization stores duplicated or pre-joined data to make reads cheaper.",
        impact:
          "It improves read performance and simplifies common queries, but increases write fan-out and the risk of stale duplicate data.",
        quickCheck: {
          question: "Why denormalize at all?",
          answer:
            "To avoid expensive joins or repeated lookups on the hot read path when slightly more complex writes are acceptable.",
        },
      },
      {
        id: "sql-tuning",
        title: "SQL tuning",
        summary:
          "SQL tuning improves query plans, indexing, and data access so the database does less unnecessary work.",
        impact:
          "It often delays the need for architectural changes, but only if the schema and workload still fundamentally fit the engine.",
        quickCheck: {
          question: "What should you inspect first when a query is slow?",
          answer:
            "The execution plan, because it shows scans, index use, joins, and where the database is spending work.",
        },
      },
      {
        id: "nosql",
        title: "NoSQL",
        summary:
          "NoSQL is a broad category of non-relational stores optimized for specific data shapes or scaling models.",
        impact:
          "These systems often trade away some relational flexibility for easier horizontal scale, simpler item access, or specialized query patterns.",
        quickCheck: {
          question: "What does NoSQL really mean in design interviews?",
          answer:
            "Not 'no structure', but usually 'choose a storage model optimized for your access pattern instead of defaulting to relational joins'.",
        },
      },
      {
        id: "key-value-store",
        title: "Key-value store",
        summary:
          "A key-value store retrieves items by key with minimal query structure.",
        impact:
          "It is ideal for simple, high-scale lookups and writes, but weak for ad hoc relational queries.",
        quickCheck: {
          question: "What is the strength of key-value stores?",
          answer:
            "Very fast, predictable access when the application already knows the lookup key.",
        },
      },
      {
        id: "document-store",
        title: "Document store",
        summary:
          "A document store keeps semi-structured records, often as JSON-like documents.",
        impact:
          "It gives more flexibility than pure key-value stores, but query and transaction behavior varies widely by engine.",
        quickCheck: {
          question: "When is a document store a strong fit?",
          answer:
            "When records are naturally grouped into self-contained documents with evolving fields and mostly document-level access.",
        },
      },
      {
        id: "wide-column-store",
        title: "Wide column store",
        summary:
          "A wide column store organizes data for high write scale and efficient access by partition key and clustering order.",
        impact:
          "It works well for time-series and large append-heavy workloads, but query flexibility is limited to the table design.",
        quickCheck: {
          question: "What must you know before modeling for a wide column store?",
          answer:
            "The exact primary access patterns, because tables are usually shaped around the queries you need up front.",
        },
      },
      {
        id: "graph-database",
        title: "Graph Database",
        summary:
          "A graph database stores entities and relationships so traversals across connected data are efficient.",
        impact:
          "It is useful when relationships are the product, such as recommendation graphs or social connections, but can be less natural for simple high-volume key lookups.",
        quickCheck: {
          question: "What makes graph databases special?",
          answer:
            "Traversing many connected relationships is the primary workload, so the data model is optimized for edges as much as nodes.",
        },
      },
      {
        id: "sql-or-nosql",
        title: "SQL or NoSQL",
        summary:
          "This choice is really about access pattern, consistency needs, and scaling model, not ideology.",
        impact:
          "Some systems use both: relational storage for transactional truth and NoSQL for scale-oriented serving paths.",
        quickCheck: {
          question: "When is a hybrid storage design reasonable?",
          answer:
            "When one store is best for transactional source-of-truth data and another is best for derived read-heavy or scale-oriented access.",
        },
      },
    ],
  },
  {
    id: "cache",
    title: "Cache",
    summary:
      "A cache stores data closer to where it is needed so the system can avoid repeated expensive work.",
    sections: [
      {
        heading: "What it means",
        body:
          "Caches reduce latency and origin load by serving reused data from a faster layer such as the browser, CDN, application memory, or a distributed cache cluster.",
      },
      {
        heading: "How it affects the design",
        body:
          "Caching changes read latency, write invalidation complexity, consistency behavior, and how the system behaves during bursts or origin failures.",
      },
      {
        heading: "Design guidance",
        body:
          "Cache data with clear reuse and meaningful miss cost. Always define ownership for invalidation, expiry, and what level of staleness the product can tolerate.",
      },
    ],
    modeFocus: {
      beginner: "Treat caching as a consistency trade-off, not just a speed trick.",
      intermediate: "Choose the cache layer based on who pays the miss penalty and who can invalidate safely.",
      advanced: "Explain stampedes, hot keys, cache hierarchy interactions, and how degradation should work when cache freshness breaks.",
    },
    exercises: [
      {
        id: "cache-check",
        type: "multiple-choice",
        prompt: "What makes data a strong cache candidate?",
        options: [
          "It is read often, expensive to recompute, and can tolerate defined staleness",
          "It changes every request and must always be perfectly current",
          "It is used once and never again",
          "It only matters during database migrations",
        ],
        answer: 0,
        explanation:
          "Caches pay off when many requests can reuse the same result and the system can manage freshness safely.",
      },
      {
        id: "cache-reflect",
        type: "reflection",
        prompt: "Describe one cache invalidation rule you would trust for product data.",
        guidance:
          "A solid answer defines who owns the source of truth, when keys expire or are deleted, and how stale responses are handled during delays.",
      },
    ],
    children: [
      {
        id: "client-caching",
        title: "Client caching",
        summary:
          "The browser or mobile app stores responses or assets locally to avoid repeated network requests.",
        impact:
          "It can remove origin load entirely for some reads, but versioning and invalidation must be explicit.",
        quickCheck: {
          question: "What is the benefit of client caching?",
          answer:
            "Zero or reduced server trips for repeat access, which improves latency and saves backend capacity.",
        },
      },
      {
        id: "cdn-caching",
        title: "CDN caching",
        summary:
          "The CDN stores cacheable responses near users at the network edge.",
        impact:
          "It improves global latency and shields the origin, but cache keys and personalization boundaries must be correct.",
        quickCheck: {
          question: "What mistake makes CDN caching dangerous?",
          answer:
            "Serving one user's personalized or sensitive content from a shared cache key.",
        },
      },
      {
        id: "web-server-caching",
        title: "Web server caching",
        summary:
          "A reverse proxy or web tier caches responses close to the application.",
        impact:
          "It is useful for shared responses with moderate freshness needs and lets you shield the application before requests hit business logic.",
        quickCheck: {
          question: "Why cache at the web server layer?",
          answer:
            "It is close enough to the application to understand routing and cache keys while still offloading expensive downstream work.",
        },
      },
      {
        id: "database-caching",
        title: "Database caching",
        summary:
          "Database-adjacent caches store frequently read rows, query results, or pages to reduce repeated disk or index work.",
        impact:
          "They improve hot reads, but can hide inefficient queries if you rely on cache hit rate alone.",
        quickCheck: {
          question: "What risk comes with database caching?",
          answer:
            "A high cache hit rate can mask a query design that still becomes painful whenever misses or invalidations spike.",
        },
      },
      {
        id: "application-caching",
        title: "Application caching",
        summary:
          "The application stores computed values or objects in memory or an external cache.",
        impact:
          "This reduces repeated downstream work, but ownership and invalidation logic now live in application code.",
        quickCheck: {
          question: "What should application caching always define?",
          answer:
            "Who updates or invalidates the cache and what behavior is acceptable on stale or missing data.",
        },
      },
      {
        id: "db-query-level",
        title: "Caching at the database query level",
        summary:
          "The cache stores the result of a full query so repeated identical requests do not re-run it.",
        impact:
          "It is efficient for repeated reads, but query invalidation becomes tricky when many rows can affect the same result.",
        quickCheck: {
          question: "What is the weakness of query-result caching?",
          answer:
            "A small data change may invalidate many cached results that depend on overlapping rows.",
        },
      },
      {
        id: "object-level-caching",
        title: "Caching at the object level",
        summary:
          "The cache stores individual domain objects or records by key.",
        impact:
          "This gives more targeted invalidation and reuse, but callers may still need to join or assemble multiple objects.",
        quickCheck: {
          question: "Why use object-level caching?",
          answer:
            "It keeps invalidation and reuse more granular than caching every full query result.",
        },
      },
      {
        id: "when-to-update-cache",
        title: "When to update the cache",
        summary:
          "Cache update patterns decide whether the application reads from or writes through the cache first and when fresh data reaches it.",
        impact:
          "This determines write latency, miss behavior, consistency, and recovery after cache failure.",
        quickCheck: {
          question: "Why is the update pattern important?",
          answer:
            "Because it controls who owns freshness and what happens when the cache and source of truth temporarily disagree.",
        },
      },
      {
        id: "cache-aside",
        title: "Cache-aside",
        summary:
          "The application reads from cache first, loads from the source on a miss, and then fills the cache.",
        impact:
          "It is simple and common, but miss storms and stale entries need explicit handling.",
        quickCheck: {
          question: "What is the main risk of cache-aside?",
          answer:
            "Many simultaneous misses for a hot key can stampede the source of truth if requests are not coalesced.",
        },
      },
      {
        id: "write-through",
        title: "Write-through",
        summary:
          "Writes update the cache and the backing store in the same logical operation.",
        impact:
          "This keeps cache reads fresh but adds write-path work and may waste capacity on rarely read data.",
        quickCheck: {
          question: "What is the upside of write-through?",
          answer:
            "Read freshness is simpler because the cache is updated as part of the write path.",
        },
      },
      {
        id: "write-behind",
        title: "Write-behind (write-back)",
        summary:
          "Writes land in the cache first and are flushed to the backing store later.",
        impact:
          "It reduces perceived write latency, but failure before flush can lose data unless durability is handled carefully.",
        quickCheck: {
          question: "Why is write-behind risky?",
          answer:
            "The cache now briefly holds data that the source of truth has not persisted yet.",
        },
      },
      {
        id: "refresh-ahead",
        title: "Refresh-ahead",
        summary:
          "The system refreshes entries before they expire so hot keys stay warm.",
        impact:
          "It reduces miss spikes for predictable hotspots, but can waste work on entries that stop being popular.",
        quickCheck: {
          question: "When is refresh-ahead useful?",
          answer:
            "When some data is predictably hot and the miss penalty would be expensive or user-visible.",
        },
      },
    ],
  },
  {
    id: "asynchronism",
    title: "Asynchronism",
    summary:
      "Asynchronous design removes work from the immediate request path so the system can absorb spikes and decouple producers from consumers.",
    sections: [
      {
        heading: "What it means",
        body:
          "Instead of doing every step inline, the system records intent and lets downstream workers process work later. This shortens user-facing latency and smooths bursts.",
      },
      {
        heading: "How it affects the design",
        body:
          "Asynchronous systems improve throughput and resilience to spikes, but introduce delay, duplicates, ordering concerns, and the need for status tracking and idempotency.",
      },
      {
        heading: "Design guidance",
        body:
          "Move work off the critical path when the user does not need the result immediately. Then define delivery guarantees, retry policy, dead-letter handling, and what 'accepted' means to the caller.",
      },
    ],
    modeFocus: {
      beginner: "Separate user-facing acceptance from eventual background completion.",
      intermediate: "Match queues, workers, and retries to the business guarantee the product needs.",
      advanced: "Discuss idempotency, poison messages, backlog growth, and overload behavior under sustained spikes.",
    },
    exercises: [
      {
        id: "asynchronism-check",
        type: "multiple-choice",
        prompt: "What is the biggest new responsibility after moving work to a queue?",
        options: [
          "Handling retries, duplicates, delay, and completion visibility",
          "Removing the need for capacity planning",
          "Guaranteeing every request becomes strongly consistent",
          "Eliminating backpressure entirely",
        ],
        answer: 0,
        explanation:
          "Queues decouple work, but they do not remove correctness concerns. They move them into retry, deduplication, and operational visibility.",
      },
      {
        id: "asynchronism-reflect",
        type: "reflection",
        prompt: "Name one workflow you would make asynchronous and how you would show progress to the user.",
        guidance:
          "Examples include media processing, email delivery, indexing, or report generation. A status endpoint, callback, or notification usually closes the loop.",
      },
    ],
    children: [
      {
        id: "message-queues",
        title: "Message queues",
        summary:
          "Message queues buffer work between producers and consumers and usually focus on delivery rather than long-term replay.",
        impact:
          "They smooth spikes and decouple systems, but queue depth and consumer lag become important health signals.",
        quickCheck: {
          question: "Why use a message queue?",
          answer:
            "To absorb bursts and let producers continue even when consumers process work at a different rate.",
        },
      },
      {
        id: "task-queues",
        title: "Task queues",
        summary:
          "Task queues model units of background work such as sending email, resizing images, or generating reports.",
        impact:
          "They are ideal for retryable jobs, but each task needs idempotency, visibility, and failure handling.",
        quickCheck: {
          question: "What makes a task queue safe?",
          answer:
            "Jobs can be retried without corrupting downstream systems and operators can see stuck or failing work.",
        },
      },
      {
        id: "back-pressure",
        title: "Back pressure",
        summary:
          "Back pressure slows producers or sheds work when downstream capacity cannot keep up.",
        impact:
          "Without it, queues grow without bound, latency explodes, and retries can amplify incidents.",
        quickCheck: {
          question: "Why is back pressure necessary?",
          answer:
            "Because buffers are finite and an overloaded system needs a controlled way to refuse or delay new work instead of collapsing.",
        },
      },
    ],
  },
  {
    id: "communication",
    title: "Communication",
    summary:
      "Communication patterns define how services exchange bytes, semantics, and failure signals across the network.",
    sections: [
      {
        heading: "What it means",
        body:
          "Different protocols optimize for different goals: reliable ordered delivery, low-latency datagrams, structured RPC contracts, or loosely coupled resource-oriented APIs.",
      },
      {
        heading: "How it affects the design",
        body:
          "Protocol choices influence latency, reliability, retries, observability, streaming support, and how strongly clients and servers are coupled.",
      },
      {
        heading: "Design guidance",
        body:
          "Choose the simplest communication style that matches the operation. Then define timeouts, retries, idempotency, and payload evolution so the system behaves predictably under change and failure.",
      },
    ],
    modeFocus: {
      beginner: "Understand what guarantees the network layer provides before reasoning about the application layer.",
      intermediate: "Compare transport guarantees with API style and operational trade-offs.",
      advanced: "Reason about head-of-line blocking, timeout budgets, retry safety, and schema evolution across protocols.",
    },
    exercises: [
      {
        id: "communication-check",
        type: "multiple-choice",
        prompt: "Which option is best when you need low-latency delivery and can tolerate packet loss?",
        options: [
          "UDP",
          "TCP with strict ordered retries for every packet",
          "REST over a database connection",
          "A synchronous two-phase commit",
        ],
        answer: 0,
        explanation:
          "UDP avoids connection setup and in-order delivery guarantees, which makes it useful when low latency matters more than perfect delivery and ordering.",
      },
      {
        id: "communication-reflect",
        type: "reflection",
        prompt: "Describe one internal service call you would prefer as RPC and one external integration you would keep as REST.",
        guidance:
          "Internal calls often benefit from stronger contracts and generated clients; external APIs often benefit from broad compatibility and resource-oriented semantics.",
      },
    ],
    children: [
      {
        id: "tcp",
        title: "Transmission control protocol (TCP)",
        summary:
          "TCP provides connection-oriented, ordered, reliable byte streams between endpoints.",
        impact:
          "It is the default for many application protocols because it handles retransmission and ordering, but those guarantees add latency and head-of-line behavior.",
        quickCheck: {
          question: "Why is TCP widely used?",
          answer:
            "Because most applications prefer reliable, ordered delivery instead of reimplementing those guarantees themselves.",
        },
      },
      {
        id: "udp",
        title: "User datagram protocol (UDP)",
        summary:
          "UDP sends independent datagrams without built-in connection management, ordering, or retransmission.",
        impact:
          "It is useful for latency-sensitive traffic such as streaming, voice, gaming, or protocols that want custom reliability behavior.",
        quickCheck: {
          question: "What must the application do with UDP?",
          answer:
            "Handle any needed ordering, loss recovery, congestion behavior, and message interpretation itself.",
        },
      },
      {
        id: "rpc",
        title: "Remote procedure call (RPC)",
        summary:
          "RPC lets one service call another as a typed operation, often with generated clients and strict schemas.",
        impact:
          "It works well for internal service contracts, but increases coupling and still needs careful timeout and retry design.",
        quickCheck: {
          question: "What is the risk of RPC feeling like a local call?",
          answer:
            "Engineers may forget that it is still a network call with latency, partial failure, and versioning concerns.",
        },
      },
      {
        id: "rest",
        title: "Representational state transfer (REST)",
        summary:
          "REST models resources over HTTP with verbs and representations rather than typed procedure calls.",
        impact:
          "It is broadly compatible and easy to expose externally, but can be less strict or efficient than internal RPC for some workloads.",
        quickCheck: {
          question: "Why is REST common for public APIs?",
          answer:
            "Because it is widely understood, works well over HTTP infrastructure, and is easy for many clients to consume.",
        },
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    summary:
      "Security protects data, identities, and system availability across the whole design, not as an add-on at the end.",
    sections: [
      {
        heading: "What it means",
        body:
          "Security in system design covers authentication, authorization, transport protection, secret handling, abuse prevention, isolation, auditability, and safe operational defaults.",
      },
      {
        heading: "How it affects the design",
        body:
          "Security changes where trust boundaries are placed, how identities flow through services, which data must be encrypted, and what controls exist for rate limiting, logging, and incident response.",
      },
      {
        heading: "Design guidance",
        body:
          "Start with least privilege and clear trust boundaries. Then protect data in transit and at rest, limit abuse, rotate credentials safely, and log enough evidence to investigate incidents without exposing more data than necessary.",
      },
    ],
    modeFocus: {
      beginner: "Treat authentication, authorization, encryption, and secret storage as baseline design concerns.",
      intermediate: "Connect security controls to actual trust boundaries, data classes, and abuse risks.",
      advanced: "Explain key rotation, blast-radius reduction, auditability, multi-tenant isolation, and how security controls behave under incident conditions.",
    },
    exercises: [
      {
        id: "security-check",
        type: "multiple-choice",
        prompt: "Which statement is the best security default?",
        options: [
          "Give each component the smallest set of permissions it needs",
          "Share one long-lived credential across all services for simplicity",
          "Encrypt only the database, not the network",
          "Delay rate limiting until the product is large",
        ],
        answer: 0,
        explanation:
          "Least privilege reduces blast radius if one service or credential is compromised. Security defaults should narrow trust, not widen it.",
      },
      {
        id: "security-reflect",
        type: "reflection",
        prompt: "Name one trust boundary in a typical web system and one security control you would place there.",
        guidance:
          "Examples include the internet edge, service-to-service calls, admin interfaces, or database access. Useful controls include auth, mTLS, WAF rules, RBAC, or secret rotation.",
      },
    ],
    children: [
      {
        id: "security-authn-authz",
        title: "Authentication and authorization",
        summary:
          "Authentication verifies identity; authorization decides what that identity is allowed to do.",
        impact:
          "Keeping these separate avoids over-trusting callers and makes permissions easier to reason about and audit.",
        quickCheck: {
          question: "Why separate authn from authz?",
          answer:
            "Knowing who a caller is does not automatically mean they should be allowed to perform every action.",
        },
      },
      {
        id: "security-encryption",
        title: "Encryption in transit and at rest",
        summary:
          "Encryption protects data while it moves across networks and while it is stored on disk or in backups.",
        impact:
          "It reduces exposure from interception or storage theft, but key management and rotation become core operational concerns.",
        quickCheck: {
          question: "Why is key management central here?",
          answer:
            "Because encryption is only as strong as the controls around who can use, rotate, and audit the keys.",
        },
      },
      {
        id: "security-secrets",
        title: "Secrets and key management",
        summary:
          "Secrets such as API tokens, passwords, and signing keys must be stored, rotated, and accessed safely.",
        impact:
          "Poor secret handling turns one code leak or instance compromise into a wider incident.",
        quickCheck: {
          question: "What is a good secret-handling principle?",
          answer:
            "Never bake long-lived secrets into source code or images; fetch them securely and rotate them regularly.",
        },
      },
      {
        id: "security-rate-limits",
        title: "Rate limiting and abuse defense",
        summary:
          "Rate limits, quotas, bot defense, and anomaly detection protect availability and downstream cost.",
        impact:
          "They keep one user, script, or tenant from exhausting shared capacity or abusing sensitive endpoints.",
        quickCheck: {
          question: "Why is rate limiting both security and reliability?",
          answer:
            "Because it protects the system from abuse-driven overload as well as from accidental traffic spikes.",
        },
      },
    ],
  },
];
