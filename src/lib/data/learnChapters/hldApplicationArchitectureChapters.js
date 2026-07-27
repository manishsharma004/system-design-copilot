/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldApplicationArchitectureChapters = {
  "application-architecture/application-layer": {
    title: "Application layer responsibilities",
    readingTime: "75-95 min",
    premise:
      "The application layer turns requests into business actions, coordinates data access, and owns product semantics that infrastructure alone cannot express. A clean application layer lets you scale capabilities independently without losing clarity around ownership and correctness.",
    parts: [
      {
        id: "what-the-app-layer-owns",
        heading: "What the application layer owns",
        paragraphs: [
          "Infrastructure moves bits; the application layer decides what those bits mean. It authenticates and authorizes in product terms, enforces invariants such as \"an order cannot be charged twice,\" orchestrates multi-step workflows, and chooses when to write to a database versus emit an event. Gateways may verify a token's signature; the application decides whether this user may cancel this shipment under current policy.",
          "Presentation, orchestration, domain logic, and persistence often blur in early systems. Drawing boundaries keeps invariants findable. Controllers or handlers adapt transport. Domain modules express rules. Repositories or data mappers isolate SQL and cache keys. When everything sits in one file of framework glue, tests become end-to-end only and ownership becomes tribal knowledge.",
          "Background workers are part of the same application layer, not a foreign planet. They reuse domain rules with different latency goals, retry policies, and idempotency requirements. Treating async jobs as throwaway scripts is how duplicate charges and inconsistent projections appear."
        ],
        keyTerms: [
          {
            term: "Invariant",
            definition: "A rule about system state that must remain true for the product to be correct, such as unique constraints or lifecycle bans."
          },
          {
            term: "Orchestration",
            definition: "Coordinating multiple steps or dependencies to complete a business workflow."
          },
          {
            term: "Application layer",
            definition: "The software tier that implements product behavior on top of transport, data stores, and infrastructure services."
          }
        ],
        callout: {
          tone: "interview",
          body: "Say what the app layer owns beyond forwarding: business rules, workflow state, and authorization tied to product semantics."
        },
        checkYourself: [
          {
            prompt: "What logic belongs in the application layer rather than the database or gateway?",
            reveal:
              "Multi-step workflows, product authorization decisions, and domain invariants that span records or services. Gateways handle edge policy; databases enforce storage constraints—not the full business process."
          }
        ]
      },
      {
        id: "stateless-compute",
        heading: "Stateless compute scales best",
        paragraphs: [
          "Application servers should usually hold no durable request state locally. Push sessions, carts, and locks into shared stores. Stateless instances are interchangeable behind load balancers, which simplifies failover, autoscaling, and rolling deploys. Hidden local memory caches of user sessions turn every deploy into sticky-session archaeology.",
          "Stateless does not mean cache-less. Processes may keep warm caches of reference data as long as correctness tolerates loss on restart and inconsistency across nodes. The test is: if this instance dies mid-flight, can another instance finish or safely retry without corrupt state?",
          "Externalize session state when it must survive restarts. Prefer tokens that carry verified identity claims, or server-side sessions in Redis with clear TTLs. Document affinity only as a temporary bridge while migrating off local state."
        ],
        keyTerms: [
          {
            term: "Stateless service",
            definition: "A compute instance that can handle any request without relying on durable memory unique to that instance."
          },
          {
            term: "Externalized session",
            definition: "Session data stored outside the app process so any instance can resume the user context."
          },
          {
            term: "Interchangeable instance",
            definition: "A node that can be replaced or scaled out without special routing for correctness."
          }
        ],
        callout: {
          tone: "tip",
          body: "Design every instance to handle any request interchangeably. If you cannot, you have hidden local state to confront."
        },
        checkYourself: [
          {
            prompt: "How do you keep a stateless service from depending on hidden local state?",
            reveal:
              "Externalize sessions and locks, avoid in-memory singletons for request identity, and verify that killing any instance mid-traffic does not require sticky recovery."
          }
        ]
      },
      {
        id: "domain-boundaries",
        heading: "Coordinate around domain boundaries",
        paragraphs: [
          "Structure modules and services around business capabilities—billing, catalog, identity—not only technical layers like \"controllers\" and \"helpers.\" Capability boundaries stay stable as teams grow; pure technical layers often become dumping grounds. Clear APIs and data ownership matter more than folder names.",
          "Shared mutable databases across many teams recreate distributed monoliths. Prefer one owner per data set, with others integrating through APIs or events. When multiple teams must touch one domain, invest in contract tests, versioning, and explicit ownership maps before multiplying writers.",
          "Cross-boundary interactions should be deliberate. Synchronous calls are fine for request-response needs with tight latency budgets. Events and outboxes help when the other side can react asynchronously and you want looser coupling. Avoid chatty cyclic call graphs that turn every outage into a mesh of failures."
        ],
        keyTerms: [
          {
            term: "Capability boundary",
            definition: "A module or service border aligned to a business capability with clear ownership of rules and data."
          },
          {
            term: "Data ownership",
            definition: "The principle that one team or service is authoritative for a given data set's writes and invariants."
          },
          {
            term: "Integration contract",
            definition: "The agreed API or event schema through which boundaries communicate safely."
          }
        ],
        workedExample: {
          title: "Ownership map for a simple commerce app",
          body: "Keep writes local to the owning capability.",
          code: "identity-service: users, credentials, sessions\ncatalog-service: products, prices (read models published)\ncart-service:    cart lines (reads catalog snapshots)\norders-service:  place/cancel order, owns order rows\nbilling-service: charges, refunds, owns payment intents\n\ncart must NOT update inventory tables directly\norders emits OrderPlaced; billing and inventory consumers react",
          language: "text"
        },
        callout: {
          tone: "warning",
          body: "Spreading one domain invariant across many services without an owner is how \"nobody knows why this broke\" incidents happen."
        },
        checkYourself: [
          {
            prompt: "What changes when one domain is owned by many teams?",
            reveal:
              "You need explicit APIs/events, stricter versioning, contract tests, and usually a split of the domain into clearer capabilities—shared mutable tables become a liability."
          }
        ]
      },
      {
        id: "sync-async-workflows",
        heading: "Online paths, async paths, and idempotency",
        paragraphs: [
          "Not every side effect belongs on the user-critical path. Charging a card may be synchronous; sending email, updating search indexes, and notifying analytics should often be asynchronous. The application layer decides that split and must keep the user-visible state honest if async steps lag or fail.",
          "Idempotency is the application layer's friend under retries. Use idempotency keys for POSTs that create orders or payments. Make consumers of events safe to reprocess. Without these habits, load balancers, timeouts, and mobile retries will invent duplicate work for you.",
          "Transactional outbox and similar patterns keep \"database write plus event publish\" aligned. Dual writes to a DB and a queue without coordination create phantom events or silent misses. Mentioning an outbox or inbox pattern in interviews shows you have felt that failure mode."
        ],
        keyTerms: [
          {
            term: "Idempotency key",
            definition: "A client-supplied token that lets the server recognize and coalesce duplicate submissions of the same intent."
          },
          {
            term: "Transactional outbox",
            definition: "A pattern that stores outbound events alongside state changes so publication can be made reliable."
          },
          {
            term: "User-critical path",
            definition: "The synchronous steps required before returning a meaningful response to the user."
          }
        ],
        callout: {
          tone: "interview",
          body: "Background workers should reuse domain logic but declare different SLOs, retries, and idempotency rules."
        },
        checkYourself: [
          {
            prompt: "Why are background jobs part of application architecture rather than pure infrastructure?",
            reveal:
              "They enforce the same business invariants and workflows, just with different timing; treating them as scripts bypasses domain ownership and creates inconsistency."
          }
        ]
      },
      {
        id: "testing-and-clarity",
        heading: "Keep invariants easy to locate and test",
        paragraphs: [
          "A healthy application layer makes critical rules unit-testable without booting the world. Pure domain functions and explicit state machines beat tangled framework callbacks for money and permissions logic. Infrastructure adapters can be integration-tested separately.",
          "Observability belongs in the application story: business metrics such as orders placed, authorization denials, and idempotent replays complement CPU graphs. If you cannot see invariant violations, you cannot operate the layer you drew.",
          "In HLD interviews, describe the application tier as the place where product correctness lives, then show how stateless instances and domain boundaries let that correctness scale. Infrastructure flourishes around it; it should not replace it."
        ],
        keyTerms: [
          {
            term: "Domain state machine",
            definition: "An explicit model of allowed entity lifecycles that prevents illegal transitions."
          },
          {
            term: "Business metric",
            definition: "A telemetry signal tied to product outcomes rather than only machine resources."
          }
        ],
        callout: {
          tone: "tip",
          body: "If a new engineer cannot find where \"no double charge\" is enforced within five minutes, the application layer boundaries are too soft."
        },
        checkYourself: [
          {
            prompt: "Name two signs the application layer is mixing infrastructure glue with business rules poorly.",
            reveal:
              "Critical invariants exist only in SQL triggers scattered across services, and HTTP handlers contain unreused copy-pasted charge logic that workers do not share."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "The application layer owns product semantics, workflows, and invariants—not just request forwarding.",
        "Stateless, interchangeable compute with externalized session state scales and deploys cleanly.",
        "Align modules with business capabilities and clear data ownership.",
        "Treat async workers as first-class domain citizens with idempotency and honest SLOs."
      ],
      nextSteps: [
        "Draw a capability ownership map for an app you know.",
        "List which side effects on a checkout path should be sync versus async.",
        "Design an idempotency approach for order creation under mobile retries."
      ]
    }
  },

  "application-architecture/monolith-vs-microservices": {
    title: "Monoliths vs. microservices",
    readingTime: "80-100 min",
    premise:
      "Decomposition is a response to coordination cost, deployment independence, scaling skew, and team boundaries—not a fashion contest. Strong interview answers justify a modular monolith for early phases and name concrete pressures that justify later extraction.",
    parts: [
      {
        id: "modular-monolith-strengths",
        heading: "What a modular monolith does well",
        paragraphs: [
          "A monolith packages many capabilities into one deployable unit. When modularized thoughtfully—with clear internal packages and boundaries—it offers fast local reasoning, simple transactions, and one-process debugging. Early products often need that speed more than independent deploy trains.",
          "In-process calls avoid network latency, serialization tax, and partial-failure complexity. A single relational database transaction can enforce invariants that would become sagas across services. For one team or a small set of collaborating teams, that simplicity is a feature.",
          "The danger is an unmodular \"ball of mud\" monolith where every feature reaches into every table. Microservices do not fix mud; they distribute it. Invest in module boundaries, public APIs inside the monolith, and forbidden import rules before declaring the architecture obsolete."
        ],
        keyTerms: [
          {
            term: "Modular monolith",
            definition: "A single deployable application structured into well-bounded modules with explicit internal interfaces."
          },
          {
            term: "Ball of mud",
            definition: "A codebase without enforceable boundaries where every part can entangle every other part."
          },
          {
            term: "In-process call",
            definition: "A function or method invocation within one runtime, without network failure modes."
          }
        ],
        callout: {
          tone: "interview",
          body: "Starting with a modular monolith is often the senior answer. Extract when pressure signals appear, not on day one of a whiteboard."
        },
        checkYourself: [
          {
            prompt: "When is a monolith still the better design even at nontrivial scale?",
            reveal:
              "When one team can own it, transactions and consistency are simpler in-process, operational overhead of many services would dominate, and modules already provide enough boundaries."
          }
        ]
      },
      {
        id: "what-microservices-buy",
        heading: "What microservices buy you—and what they cost",
        paragraphs: [
          "Service extraction helps when domains need independent scaling, independent deployment pace, different runtimes, or stronger ownership walls between teams. A media transcoding pipeline should not share autoscaling fate with a latency-sensitive checkout API. A payments team may need change isolation from marketing experiments.",
          "Failure isolation is real only if dependencies are controlled. A mesh of synchronous calls recreates a distributed monolith: one slow service freezes many. Timeouts, bulkheads, async integration, and careful API design are mandatory costs of the style—not optional polish.",
          "Operational overhead rises with service count: CI pipelines, observability, local dev environments, schema migrations, on-call graphs, and security boundaries. Each service is a product. Candidates who only list benefits without costs sound naive; candidates who only recite costs sound stuck."
        ],
        keyTerms: [
          {
            term: "Independent deployability",
            definition: "The ability to release one capability without rebuilding and shipping unrelated capabilities."
          },
          {
            term: "Bulkhead",
            definition: "Isolation of resources or pools so failure or overload in one area does not sink others."
          },
          {
            term: "Distributed monolith",
            definition: "Many services that remain tightly coupled through sync chains or shared databases, losing monolith simplicity without gaining independence."
          }
        ],
        callout: {
          tone: "warning",
          body: "Microservices do not automatically equal scalability. Unpartitioned data and chatty sync graphs can scale worse than a clean monolith."
        },
        checkYourself: [
          {
            prompt: "Name two benefits and two costs of extracting a service.",
            reveal:
              "Benefits: independent scale/deploy and clearer team ownership. Costs: network failure modes, distributed observability, and harder cross-capability transactions."
          }
        ]
      },
      {
        id: "pressure-signals",
        heading: "Migration pressure signals",
        paragraphs: [
          "Use concrete signals to justify decomposition. Deploy contention—teams blocking each other on one release train—is a classic organizational signal. Divergent scaling needs—hot read paths versus rare heavy jobs—are a technical signal. Ownership conflict over one module's roadmap is a people signal. Fashionable architecture blogs are not a signal.",
          "Separate hot paths or data ownership first. Extracting the busiest capability with the clearest boundary yields learning without boiling the ocean. Creating clear contracts before extracting data prevents a \"microservice\" that still writes to the old shared tables.",
          "Plan observability, CI, and developer tooling before multiplying services. If local development already hurts with one app, twenty services will not magically feel agile. Platform readiness is part of the migration design."
        ],
        keyTerms: [
          {
            term: "Deploy contention",
            definition: "Release friction caused by many teams shipping through one shared deployable."
          },
          {
            term: "Scaling skew",
            definition: "Uneven resource needs across capabilities that waste capacity when forced into one scaling unit."
          },
          {
            term: "Extraction contract",
            definition: "The API/event boundary defined before or during a split so callers do not depend on old internal tables."
          }
        ],
        workedExample: {
          title: "First safe extraction from a commerce monolith",
          body: "Contracts before cutover; dual running beats big bang.",
          code: "1. identify search as hot, independently scaling path\n2. define Search API + events for product changes\n3. build search service reading events / batch dump\n4. dual-run: gateway sends % traffic to new search\n5. compare relevance/latency; fix gaps\n6. remove in-monolith search path; monolith remains source for writes\navoid: extracting payments+cart+inventory simultaneously",
          language: "text"
        },
        callout: {
          tone: "tip",
          body: "The first signal to split is often deploy contention or scaling skew—not a microservice checklist."
        },
        checkYourself: [
          {
            prompt: "What is a strong first signal that a monolith should be split?",
            reveal:
              "Repeated deploy collisions across teams or a capability whose scale/failure profile clearly diverges from the rest—especially when module boundaries are already clear."
          }
        ]
      },
      {
        id: "safe-extraction",
        heading: "How to extract a service safely",
        paragraphs: [
          "Start by sealing a module boundary inside the monolith: only public functions touch the capability. Replace direct table access from outsiders with API calls still in-process. Then move the module to a separate process behind the same API, using dual running and comparison where risk is high.",
          "Data migration is the sharp edge. Options include sharing the database temporarily (pragmatic but incomplete), replicating via events, or bulk copying with cutover windows. Shared databases postpone the hard ownership problem; treat them as a waypoint with an expiry date.",
          "Rollback plans matter. Keep the old path switchable until the new service meets SLOs and error budgets. Feature flags and gateway weights make extraction reversible. Irreversible big-bang cutovers are drama, not engineering."
        ],
        keyTerms: [
          {
            term: "Strangler migration",
            definition: "Incrementally routing responsibility from an old system to a new one until the old path can be retired."
          },
          {
            term: "Dual running",
            definition: "Operating old and new implementations in parallel to compare results before cutting over."
          },
          {
            term: "Shared database waypoint",
            definition: "A temporary phase where a new service still uses the old database while ownership boundaries catch up."
          }
        ],
        callout: {
          tone: "interview",
          body: "Describe strangler steps: seal boundary, extract read path, dual-run, move writes, drop shared tables."
        },
        checkYourself: [
          {
            prompt: "How would you extract one service safely from a monolith?",
            reveal:
              "Seal an internal API, stand up the new service against that contract, shift traffic gradually with dual running, migrate data ownership deliberately, and keep rollback until SLOs prove out."
          }
        ]
      },
      {
        id: "decision-language",
        heading: "Decision language for interviews",
        paragraphs: [
          "Frame the choice as phase-appropriate. \"For v1, modular monolith with packages for identity, feed, and media; if media encoding CPU skews or team ownership splits, extract media first.\" That sentence beats either extreme ideology.",
          "Discuss team topology. Microservices map poorly onto a two-person startup and map better onto aligned teams with platform support. Conway's law is not an excuse for chaos, but ignoring org structure produces architectures nobody can run.",
          "Close by naming operational prerequisites: tracing, centralized logging, CI templates, and on-call ownership. Decomposition without platform investment multiplies toil faster than it multiplies velocity."
        ],
        keyTerms: [
          {
            term: "Conway's law",
            definition: "The observation that system structure tends to mirror communication structures of the organization."
          },
          {
            term: "Platform readiness",
            definition: "Shared tooling and practices that make many services operable without linear human cost."
          }
        ],
        callout: {
          tone: "warning",
          body: "Splitting services before the domain is understood often paints wrong boundaries that are expensive to redraw."
        },
        checkYourself: [
          {
            prompt: "Why is equating microservices with automatic scalability a pitfall?",
            reveal:
              "Scale comes from partitionable work and careful dependencies. Poorly bounded services add latency and coordination without relieving the real bottleneck."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Modular monoliths optimize early iteration, transactions, and simple operations.",
        "Microservices buy independent scale, deploy, and ownership at real distributed cost.",
        "Extract on pressure signals with strangler steps, contracts, and dual running.",
        "Match architecture to team topology and platform readiness, not trends."
      ],
      nextSteps: [
        "List pressure signals in a codebase you know that would or would not justify a split.",
        "Practice a strangler plan for extracting search or notifications.",
        "Argue both sides for keeping checkout inside a monolith at 5x growth."
      ]
    }
  },

  "application-architecture/service-discovery": {
    title: "Service discovery and coordination",
    readingTime: "75-95 min",
    premise:
      "Distributed services need a way to locate healthy instances, coordinate leaders, and react to topology changes without manual reconfiguration. Discovery and coordination are invisible when done well, yet they shape failover, deploy safety, and outage blast radius.",
    parts: [
      {
        id: "discovery-patterns",
        heading: "Discovery patterns",
        paragraphs: [
          "Service discovery answers: given a logical name like checkout, which network endpoints are healthy right now? Registries track instance addresses and metadata. Instances register on boot, renew heartbeats, and deregister on shutdown—or get culled when heartbeats fail. Clients or proxies consume that membership set.",
          "Client-side discovery lets callers query the registry and choose instances—often with custom load-balancing logic. It gives control and can reduce hops, but pushes complexity into every client. Server-side discovery hides topology behind a load balancer or mesh proxy; clients dial a stable name and the infrastructure picks targets. Managed platforms frequently embed this in cloud load balancers or service meshes.",
          "DNS can act as a primitive discovery mechanism with short TTLs, but it inherits DNS caching caveats and limited health sophistication. For internal microservices, purpose-built registries or platform discovery usually beat inventing your own DNS-only scheme."
        ],
        keyTerms: [
          {
            term: "Service registry",
            definition: "A store of service instance endpoints and health metadata used for discovery."
          },
          {
            term: "Client-side discovery",
            definition: "A pattern where callers fetch instance lists and implement routing themselves."
          },
          {
            term: "Server-side discovery",
            definition: "A pattern where callers use a stable endpoint and an intermediary selects healthy instances."
          }
        ],
        callout: {
          tone: "interview",
          body: "Prefer server-side discovery for simplicity unless you have a concrete need for client-controlled routing."
        },
        checkYourself: [
          {
            prompt: "When is client-side discovery preferable?",
            reveal:
              "When callers need custom routing, locality, or hedging logic that a shared balancer cannot express, and you can afford client library complexity."
          }
        ]
      },
      {
        id: "health-and-caching",
        heading: "Health, freshness, and local caching",
        paragraphs: [
          "Discovery data is a cache of reality. Heartbeats lag; networks partition; processes deadlock while still accepting TCP. Health checks should match what \"usable\" means for the service—shallow for liveness, deeper for readiness—without creating synchronized false outages when a shared dependency fails.",
          "Consumers should cache endpoint lists locally with expiration and watch for updates. On every request hitting the registry is a self-inflicted outage amplifier. Retries with jitter help when instances churn during deploys. Observe registration freshness and health-check flapping; flapping nodes bouncing in and out of rotation create traffic storms.",
          "Stale discovery is sometimes safer than unavailable discovery. If the registry is down, continuing with a recently known good set may keep the fleet alive. That policy must be bounded and monitored so long-dead nodes do not linger forever."
        ],
        keyTerms: [
          {
            term: "Readiness vs liveness",
            definition: "Readiness means safe to receive traffic; liveness means the process should be restarted if failed."
          },
          {
            term: "Membership cache",
            definition: "A local snapshot of discovered instances used to survive registry blips and reduce lookup load."
          },
          {
            term: "Health flapping",
            definition: "Rapid oscillation between healthy and unhealthy that destabilizes routing."
          }
        ],
        callout: {
          tone: "warning",
          body: "Centralizing every request through the discovery store makes discovery a throughput bottleneck and a fatal dependency."
        },
        checkYourself: [
          {
            prompt: "What happens if discovery data is slightly stale?",
            reveal:
              "Callers may briefly hit drained or dead instances and must rely on retries, timeouts, and health-aware clients; some staleness is normal and preferable to hard failure when the registry blips."
          }
        ]
      },
      {
        id: "coordination-patterns",
        heading: "Coordination: leaders, leases, and locks",
        paragraphs: [
          "Some work should not run everywhere at once: schema migrations, partition consumers, singleton schedulers, or primary-writer roles. Leader election and leases provide that coordination. A leader holds a lease that expires unless renewed, reducing the chance of two leaders after a partition if fencing tokens are used correctly.",
          "Distributed locks are seductive and dangerous. Prefer idempotent, commutative work when possible so locking is unnecessary. When locks are required, set TTLs, fence tokens, and clear ownership semantics. A lock without fencing can let a paused process believe it still owns a critical section after expiry.",
          "Keep the coordination surface small. Systems that take a lock on every user request will not scale and will fail dramatically under registry or ZooKeeper/etcd-like dependency loss. Coordination belongs on control paths, not on the hottest data plane."
        ],
        keyTerms: [
          {
            term: "Leader election",
            definition: "Choosing one instance to perform a singleton role among peers."
          },
          {
            term: "Lease",
            definition: "A time-bounded grant of leadership or lock ownership that must be renewed."
          },
          {
            term: "Fencing token",
            definition: "A monotonically increasing identity that storage systems can use to reject operations from stale former leaders."
          }
        ],
        workedExample: {
          title: "Workers discovering partitions to process",
          body: "Combine discovery of peers with partition assignment.",
          code: "registry lists worker instances\ncoordinator (or consistent hash) assigns topic partitions\neach worker consumes only its partitions\non membership change: rebalance with care\nprefer idempotent handlers over global locks per message\nlease the coordinator role; fence old coordinators",
          language: "text"
        },
        callout: {
          tone: "tip",
          body: "Prefer idempotent work over broad locking whenever the business allows it."
        },
        checkYourself: [
          {
            prompt: "How would a worker discover partitions it should process?",
            reveal:
              "Via membership in a worker set plus an assignment algorithm (coordinator or consistent hashing), with rebalance on join/leave and idempotent processing for overlap windows."
          }
        ]
      },
      {
        id: "mesh-and-platform",
        heading: "Meshes, platforms, and failure domains",
        paragraphs: [
          "Service meshes and cloud platforms embed discovery, mTLS, retries, and observability into sidecars or managed data planes. They reduce the need for every team to reinvent client libraries, at the cost of another runtime dependency and subtle failure modes. In interviews, it is fair to assume a mesh or managed LB if you state the properties you need.",
          "Treat discovery and coordination systems as failure domains with their own monitoring. Ask what happens when etcd/Consul/Kubernetes control plane is unhealthy. Data plane traffic should often continue on cached membership; control actions like new deploys may pause.",
          "Split-brain scenarios deserve a sentence. If two regions elect leaders independently during partition, you need application-level fencing or a design that avoids dual writers. Discovery alone does not solve consistency."
        ],
        keyTerms: [
          {
            term: "Service mesh",
            definition: "Infrastructure layer that handles service-to-service networking concerns such as discovery, security, and traffic policy via proxies."
          },
          {
            term: "Control plane vs data plane",
            definition: "Control plane configures routing and policy; data plane forwards actual requests."
          }
        ],
        callout: {
          tone: "interview",
          body: "Name registry, health checks, local caching, and discovery-as-failure-domain in one breath for credibility."
        },
        checkYourself: [
          {
            prompt: "Why is using distributed locks when commutative work would do a pitfall?",
            reveal:
              "Locks add latency, failure modes, and scaling limits; commutative or idempotent designs avoid coordination on the hot path."
          }
        ]
      },
      {
        id: "discovery-in-hld",
        heading: "Putting discovery into HLD answers",
        paragraphs: [
          "When you draw multiple services, say how they find each other: DNS to an internal LB, Kubernetes services, mesh, or client libraries plus registry. Silence implies magical hard-coded IPs that will not survive deploys.",
          "Connect discovery to deploys: new instances register when ready; old instances drain and deregister. Connect discovery to incidents: remove bad nodes quickly without flapping. Connect coordination to jobs: only one migrator runs.",
          "End with fallback behavior under stale or missing membership. That sentence separates diagram artists from operators."
        ],
        keyTerms: [
          {
            term: "Deregistration delay",
            definition: "Time allowed for in-flight work after removing an instance from discovery before process exit."
          },
          {
            term: "Rebalance",
            definition: "Redistribution of work or partitions when membership changes."
          }
        ],
        callout: {
          tone: "tip",
          body: "If you mention leader election, also mention leases and what happens when the leader pauses mid-work."
        },
        checkYourself: [
          {
            prompt: "How do discovery and connection draining interact during a deploy?",
            reveal:
              "Stop advertising the instance (or mark not ready), drain in-flight requests, then exit—so discovery removes it before the process disappears under load."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Discovery maps logical names to healthy instances via registries, balancers, or meshes.",
        "Cache membership locally; treat the discovery system as its own failure domain.",
        "Use coordination sparingly with leases and fencing; prefer idempotency over hot-path locks.",
        "Explain deploy-time register/drain behavior and stale-membership fallbacks."
      ],
      nextSteps: [
        "Compare client-side vs server-side discovery for an internal payments API.",
        "Design partition assignment for a consumer group under node loss.",
        "Write failure modes for a registry outage lasting five minutes."
      ]
    }
  },

  "application-architecture/api-design": {
    title: "API design: REST, RPC, and contracts",
    readingTime: "80-100 min",
    premise:
      "The best API choice makes contracts understandable, evolvable, and efficient for the clients you actually have. Protocol fashion matters less than idempotency, versioning, error models, pagination, and ownership of fields over time.",
    parts: [
      {
        id: "rest-strengths",
        heading: "REST strengths and discipline",
        paragraphs: [
          "REST-style HTTP APIs fit resource-oriented products where nouns map cleanly to URLs and standard methods express intent. GET reads, PUT/PATCH update, DELETE removes, POST creates or triggers non-idempotent actions when necessary. Broad ecosystem compatibility, browser and mobile familiarity, and intermediary caching for GETs are enduring strengths.",
          "HTTP semantics help with caching and idempotency when used honestly. Safe methods should not mutate. Idempotent methods should tolerate replay. Cache-Control on public GETs can offload origins. Many so-called REST APIs ignore these semantics and become ad hoc RPC over HTTP paths—which can be fine if honest, but then do not claim REST benefits you did not earn.",
          "Payload shape still matters. Over-fetching large resources on hot mobile paths wastes bandwidth. Under-fetching creates chatty N+1 client patterns. Partial responses, sparse fieldsets, or dedicated view resources can help without abandoning resource orientation."
        ],
        keyTerms: [
          {
            term: "Resource-oriented API",
            definition: "An API organized around addressable nouns and standard methods rather than only remote procedure names."
          },
          {
            term: "Safe method",
            definition: "An HTTP method that should not change server state, such as GET or HEAD."
          },
          {
            term: "Idempotent method",
            definition: "A method for which repeating the same request has the same effect as doing it once."
          }
        ],
        callout: {
          tone: "tip",
          body: "If your REST paths are all verbs like /createOrder and /doRefund, you are already in RPC territory—design the contract accordingly."
        },
        checkYourself: [
          {
            prompt: "What makes an endpoint idempotent?",
            reveal:
              "Repeating the same request with the same intent does not create duplicate side effects—achieved via natural keys, upserts, or Idempotency-Key headers on creates."
          }
        ]
      },
      {
        id: "rpc-strengths",
        heading: "RPC strengths for internal platforms",
        paragraphs: [
          "RPC systems such as gRPC excel at strongly typed internal calls, explicit method contracts, streaming, and efficient binary serialization. Schema-first workflows with protobuf or similar IDLs improve consistency across languages and generate stubs that reduce hand-written boilerplate.",
          "High-throughput service-to-service paths often benefit from HTTP/2 multiplexing and compact payloads. That does not make RPC \"automatically faster\" in the presence of bad fan-out, huge messages, or missing deadlines. Network behavior still dominates.",
          "RPC is a weaker default for public third-party ecosystems where HTTP+JSON familiarity, cacheability, and ad hoc debugging matter more. Many companies use REST or GraphQL externally and RPC internally—a pragmatic split worth mentioning."
        ],
        keyTerms: [
          {
            term: "IDL",
            definition: "Interface definition language used to declare RPC methods and message schemas as the source of truth."
          },
          {
            term: "Binary serialization",
            definition: "Compact encoding of structured data, often faster and smaller than verbose JSON text."
          },
          {
            term: "Deadline",
            definition: "A time bound propagated with an RPC so servers stop work when the caller no longer needs the result."
          }
        ],
        callout: {
          tone: "interview",
          body: "Choose RPC for high-throughput typed internal calls; choose REST when resources are cacheable and HTTP semantics help diverse clients."
        },
        checkYourself: [
          {
            prompt: "When would you choose RPC over REST for an internal platform?",
            reveal:
              "When many services share schema-first contracts, need efficient binary payloads or streaming, and clients are first-party with generated stubs rather than broad public consumers."
          }
        ]
      },
      {
        id: "contracts-not-endpoints",
        heading: "Design contracts, not only endpoints",
        paragraphs: [
          "A contract includes ownership of fields, authentication scopes, pagination rules, error shapes, idempotency expectations, and compatibility promises—not merely a URL list. Teams break production when they change the meaning of a field without changing its name, or when they invent new error strings clients cannot parse.",
          "Pagination should prefer opaque cursors over fragile offset lists for large, shifting datasets. Return stable identifiers. Document whether lists are eventually consistent. Specify rate-limit headers. These details separate hobby APIs from operable platforms.",
          "Timeouts and retries are part of the contract between client and server. Servers should be idempotent where clients are told to retry. Clients should not retry non-idempotent POSTs without keys. Publish guidance; do not assume perfect client behavior."
        ],
        keyTerms: [
          {
            term: "Cursor pagination",
            definition: "Listing strategy that uses an opaque position token instead of numeric offsets for stable traversal."
          },
          {
            term: "Error model",
            definition: "A machine-readable scheme for failure codes, messages, and retryability hints."
          },
          {
            term: "Backward-compatible change",
            definition: "An API evolution that existing well-behaved clients can ignore or continue to work with."
          }
        ],
        workedExample: {
          title: "Idempotent order creation contract",
          body: "Show headers and server behavior under replay.",
          code: "POST /v1/orders\nIdempotency-Key: 8f3c-...\nAuthorization: Bearer ...\n\nserver:\n  if key seen: return original 201 body + Order-Id\n  else: create order once; store key -> response\n\nretry after timeout:\n  same key => no duplicate charge\ndifferent key => new intent (client bug or new order)",
          language: "text"
        },
        callout: {
          tone: "warning",
          body: "Ignoring compatibility once multiple clients exist turns every release into a coordination tax across mobile and partners."
        },
        checkYourself: [
          {
            prompt: "What belongs in an API contract beyond method and path?",
            reveal:
              "Auth scopes, idempotency, pagination, error schema, versioning/compatibility rules, timeouts/retry guidance, and field ownership."
          }
        ]
      },
      {
        id: "versioning-evolution",
        heading: "Versioning and evolving APIs used by old clients",
        paragraphs: [
          "Additive changes—new optional fields, new endpoints—are the safest evolution. Renaming or removing fields, changing types, or altering defaults breaks clients silently. Prefer deprecation windows with telemetry on version and field usage before removal.",
          "Mobile clients are especially sticky. Users may linger on old app versions for months. Versioned paths (/v1, /v2), tolerant readers, and feature flags help. Never require all users to upgrade overnight unless you control the clients completely.",
          "Expand-contract migrations work well: add new fields, dual-write or dual-read, move consumers, then remove old fields. The same discipline applies to RPC schemas with reserved fields and explicit compatibility rules in CI."
        ],
        keyTerms: [
          {
            term: "Expand-contract",
            definition: "A migration pattern that adds the new shape first, migrates consumers, then removes the old shape."
          },
          {
            term: "Tolerant reader",
            definition: "A client that ignores unknown fields and avoids brittle assumptions about exact payloads."
          },
          {
            term: "Sunset window",
            definition: "A published period during which deprecated API surfaces remain available before removal."
          }
        ],
        callout: {
          tone: "interview",
          body: "For mobile: additive changes, optional fields, versioned endpoints or flags, and telemetry on version mix before sunsets."
        },
        checkYourself: [
          {
            prompt: "How would you evolve an API used by mobile clients on old versions?",
            reveal:
              "Ship backward-compatible additive changes, keep old versions running through a sunset window, track version telemetry, and only then remove legacy fields/endpoints."
          }
        ]
      },
      {
        id: "graphql-and-style-choice",
        heading: "Other styles and choosing deliberately",
        paragraphs: [
          "GraphQL can reduce over-fetching for complex client screens by letting clients ask for exact fields, at the cost of caching difficulty, complex authorization, and possible expensive queries. It is neither mandatory nor forbidden; it is a trade-off for product-shaped reads.",
          "Async APIs—webhooks, callbacks, event subscriptions—belong in the contract story when workflows are long-running. Return a resource that represents the job, and let clients poll or subscribe. Mixing long CPU work into synchronous request/response APIs creates timeouts and angry clients.",
          "In interviews, pick a style per boundary: public REST for partners, gRPC internally, async events for fan-out. Justify with clients, cacheability, and evolution needs. Protocol religion without constraints is a weak answer."
        ],
        keyTerms: [
          {
            term: "Webhook",
            definition: "A server-initiated HTTP callback that notifies a client system when an event occurs."
          },
          {
            term: "Job resource",
            definition: "An API object representing asynchronous work that can be polled or watched for completion."
          }
        ],
        callout: {
          tone: "tip",
          body: "Document retries and duplicate handling next to every mutating public endpoint. Clients will retry whether you planned for it or not."
        },
        checkYourself: [
          {
            prompt: "Why is treating RPC as automatically faster a pitfall?",
            reveal:
              "Serialization gains are often dwarfed by network RTT, fan-out, retries, and large messages; poor RPC design is still slow."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "REST fits resource and HTTP semantics; RPC fits typed internal high-chatter paths—choose per boundary.",
        "Contracts include idempotency, errors, pagination, auth, and compatibility—not just URLs.",
        "Evolve with additive changes, expand-contract migrations, and sunset discipline for old clients.",
        "Align sync vs async APIs with workflow duration and client retry reality."
      ],
      nextSteps: [
        "Rewrite a verb-heavy HTTP API into resources or admit it is RPC and harden the contract.",
        "Design idempotency and error codes for payment capture.",
        "Plan a v1→v2 field migration for a mobile profile API."
      ]
    }
  },

  "application-architecture/realtime-delivery": {
    title: "Real-time delivery: WebSockets, SSE, and long polling",
    readingTime: "85-100 min",
    premise:
      "When users expect live updates, choose a delivery model that matches data direction, fan-out shape, and connection scale. Real-time features force you to reason about connection state, pub/sub, back pressure, and degraded modes—core interview skills.",
    parts: [
      {
        id: "pick-by-pattern",
        heading: "Pick the protocol by communication pattern",
        paragraphs: [
          "WebSockets provide a long-lived bidirectional channel after an HTTP upgrade. They fit chat, collaborative editing, multiplayer games, and any flow where both client and server push frequently with low latency. They also concentrate operational complexity: connection tracking, heartbeats, and sticky or shared state across nodes.",
          "Server-Sent Events (SSE) stream server-to-client updates over HTTP. They fit live dashboards, feeds of notifications, and progress monitors where the client rarely needs to push on the same socket. SSE is simpler than WebSockets for one-way streams and works naturally with HTTP infrastructure, though browser connection limits and buffering quirks need attention.",
          "Long polling keeps a request open until an event arrives or a timeout fires, then the client immediately opens another. It is less efficient at scale but runs on the most basic HTTP stacks and sneaks through restrictive environments. It remains a valid v1 or fallback strategy when WebSocket infrastructure is not ready."
        ],
        keyTerms: [
          {
            term: "WebSocket",
            definition: "A bidirectional, long-lived application protocol commonly used for interactive real-time clients."
          },
          {
            term: "Server-Sent Events",
            definition: "A unidirectional server-to-client streaming mechanism over HTTP."
          },
          {
            term: "Long polling",
            definition: "A technique where the client holds an HTTP request open until events or timeout, then reconnects."
          }
        ],
        callout: {
          tone: "interview",
          body: "Do not default to WebSockets everywhere. Dashboards often want SSE; simple notifications may start with long polling."
        },
        checkYourself: [
          {
            prompt: "Why might SSE be better than WebSockets for a dashboard?",
            reveal:
              "Dashboards are mostly server-to-client updates; SSE is simpler, HTTP-friendly, and avoids bidirectional complexity you do not need."
          }
        ]
      },
      {
        id: "connections-as-state",
        heading: "Connections are state: fan-out and placement",
        paragraphs: [
          "Persistent connections move cost from request rate to connection count, memory, file descriptors, heartbeats, and per-node session maps. A million idle sockets can hurt before a million messages do. Size and shard connection-handling tiers deliberately—often separate from core business services.",
          "When an event occurs on one node, interested sockets may live on others. Pub/sub, streams, or a real-time mesh broadcast \"user 123 got an update\" to the node holding that user's connection. Without this, you need sticky routing and accept painful failover when a node dies.",
          "Sticky load balancing to connection nodes can help locality but weakens perfect failover. A shared subscription store mapping user → node enables any publisher to find the right socket host. Both patterns appear in production; pick one and explain failure behavior."
        ],
        keyTerms: [
          {
            term: "Connection shard",
            definition: "A subset of persistent connections owned by a particular real-time node."
          },
          {
            term: "Pub/sub fan-out",
            definition: "Publishing an event once so multiple subscribers or connection nodes receive it for delivery."
          },
          {
            term: "Presence map",
            definition: "Metadata about which users or devices are connected and where their sockets terminate."
          }
        ],
        workedExample: {
          title: "Live order-status delivery sketch",
          body: "SSE or WebSocket to clients; events from order service via bus.",
          code: "client opens SSE /orders/{id}/stream (authz checked)\ngateway routes to realtime-node (sticky or lookup)\norder-service emits OrderStatusChanged on bus\nrealtime-node subscribed to order-id topics\n  -> writes event on the user's stream\non reconnect: Last-Event-ID or cursor -> replay from log\nfallback: client polls GET /orders/{id} every 15s",
          language: "text"
        },
        callout: {
          tone: "warning",
          body: "Ignoring sticky routing or shared subscription state is how \"it works on one box\" demos fail in multi-node production."
        },
        checkYourself: [
          {
            prompt: "How would you deliver live order-status updates?",
            reveal:
              "Authenticate a stream (SSE/WebSocket), publish status changes to a bus, deliver from the node holding the connection, and replay missed events on reconnect with polling fallback."
          }
        ]
      },
      {
        id: "backpressure-slow-consumers",
        heading: "Back pressure, heartbeats, and slow consumers",
        paragraphs: [
          "Not every client reads as fast as you write. Slow consumers fill buffers, increase memory, and eventually force disconnects or drop policies. Decide whether to disconnect, coalesce events, or spill to a durable log for later catch-up. Silent unbounded buffering is an outage dressed as kindness.",
          "Heartbeats detect half-open connections through NATs and load balancers that forget idle sockets. Clients and servers should both react to missed heartbeats with reconnect. Idle timeouts at intermediate proxies must be longer than your heartbeat interval or you will flap forever.",
          "Message semantics matter. Can updates coalesce (latest location wins) or must every chat message deliver in order? Coalescing reduces load for presence and telemetry. Ordering and gaps matter for chat and collaborative ops—leading to sequence numbers and replay."
        ],
        keyTerms: [
          {
            term: "Slow consumer",
            definition: "A connected client that cannot keep up with the event rate, risking buffer growth."
          },
          {
            term: "Coalescing",
            definition: "Merging multiple pending updates into a single latest or summarized message."
          },
          {
            term: "Heartbeat",
            definition: "Periodic keepalive signals used to detect dead connections."
          }
        ],
        callout: {
          tone: "tip",
          body: "Track connection counts, reconnect rate, deliver lag, and drop counts—the vital signs of a real-time tier."
        },
        checkYourself: [
          {
            prompt: "What should you do when a client cannot keep up with a high-frequency telemetry stream?",
            reveal:
              "Coalesce to latest values, apply back pressure, or disconnect and let them resume from a durable snapshot—do not buffer without bound."
          }
        ]
      },
      {
        id: "reconnect-and-replay",
        heading: "Reconnect, replay, and correctness",
        paragraphs: [
          "Reconnect logic must be idempotent. Clients will disconnect on mobile networks constantly. Use backoff with jitter to avoid thundering herds after an outage. Resume tokens, Last-Event-ID for SSE, or sequence numbers tell the server where to continue.",
          "When correctness matters, replay missed events from a durable log rather than hoping the client was connected. Chat, financial status, and collaborative documents often need gap filling. Best-effort presence may not. State the choice explicitly.",
          "Authorization on streams is easy to forget. A long-lived connection opened when a user had access may outlive a revocation. Revalidate periodically or bind stream tickets to short-lived credentials. Privacy bugs in real-time tiers are severe because data keeps flowing."
        ],
        keyTerms: [
          {
            term: "Resume token",
            definition: "A cursor that lets a client continue a stream after reconnect without duplication gaps they cannot heal."
          },
          {
            term: "Gap fill",
            definition: "Fetching or replaying missed events between the last received sequence and the live tip."
          },
          {
            term: "Thundering herd reconnect",
            definition: "Mass simultaneous reconnects after an outage that can overwhelm the real-time tier."
          }
        ],
        callout: {
          tone: "interview",
          body: "On reconnect: resume cursor + durable replay when correctness matters; always jittered backoff."
        },
        checkYourself: [
          {
            prompt: "How do you recover missed events after a reconnect?",
            reveal:
              "Client presents last sequence or event id; server replays from a durable log or snapshot diff, then continues live; clients dedupe by id."
          }
        ]
      },
      {
        id: "degraded-modes",
        heading: "Degraded modes and protocol fallbacks",
        paragraphs: [
          "If real-time delivery fails, many products can fall back to periodic refresh, push notifications, or delayed email. Say that explicitly in designs. A dashboard that polls every thirty seconds under degradation still beats a blank spinner. Chat may show \"reconnecting\" while queuing outbound messages locally.",
          "Protocol fallback chains are common: try WebSocket, fall back to SSE, then long polling. Each step trades efficiency for reachability. Negotiate based on client capability and network policy.",
          "Close interview answers with capacity math intuition: concurrent connections ≈ online users × devices, messages per second ≈ event rate × average subscribers per event. Those estimates justify whether one real-time cluster is enough and when you must shard by user id."
        ],
        keyTerms: [
          {
            term: "Protocol fallback",
            definition: "Switching to a simpler delivery mechanism when the preferred real-time protocol cannot be established."
          },
          {
            term: "Degraded realtime mode",
            definition: "A planned reduced-freshness experience such as polling when push streams are unavailable."
          }
        ],
        callout: {
          tone: "warning",
          body: "Using WebSockets everywhere by default adds connection state cost where a cacheable poll or SSE stream would suffice."
        },
        checkYourself: [
          {
            prompt: "Name two metrics that indicate a real-time tier is unhealthy.",
            reveal:
              "Spiking reconnect rates, rising deliver lag, growing slow-consumer disconnects, or file-descriptor/connection saturation on nodes."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Match WebSockets, SSE, and long polling to bidirectional needs, simplicity, and infrastructure constraints.",
        "Treat connections as sharded state backed by pub/sub and clear failover behavior.",
        "Design for slow consumers, heartbeats, resume cursors, and durable replay when correctness demands it.",
        "Always name a degraded fallback when push delivery fails."
      ],
      nextSteps: [
        "Design live order tracking with SSE, replay, and poll fallback.",
        "Estimate connection and message rates for a chat room product.",
        "Compare sticky connection nodes versus a global pub/sub presence map."
      ]
    }
  }
};
