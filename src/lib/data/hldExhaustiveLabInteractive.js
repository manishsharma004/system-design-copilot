/** Interactive topic labs for exhaustive HLD labs.
 * Source of truth: scripts/hld_lab_content.py — regenerate with
 * `python3 scripts/build_hld_exhaustive_labs.py`.
 */
function caseStudy(input) {
  const { title, prompt, steps, metrics } = input;
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
      whatIf:
        step.whatIf ??
        'Skipping this step makes the design harder to defend because the trade-off stays implicit.'
    })),
    metrics: metrics ?? []
  };
}

const raw = {
  "data-storage-lab/indexing-and-query-path-design": {
    "title": "Indexing and query path design lab",
    "summary": "Inspect a hot endpoint, constrain its query shape, and decide which indexes deserve long-term write cost.",
    "takeaways": [
      "Hot-path indexing begins with exact predicates and sort order, not with abstract tables.",
      "Every secondary index is a permanent write and recovery tax that must buy a measurable win.",
      "API-level query guardrails are often as important as the index itself."
    ],
    "examples": [
      {
        "id": "merchant-orders",
        "label": "Merchant dashboard",
        "title": "Protect the recent-orders view from scan creep",
        "scenario": "A merchant dashboard shows the latest paid or refunded orders for one merchant and wants flexible sorting later.",
        "decision": "Design one primary composite index for the merchant, status, and created_at path, then reject unsupported sorts on the synchronous endpoint.",
        "why": [
          "The user journey is narrow and high frequency, so a focused composite index buys predictable latency.",
          "Allowing arbitrary sorts would require many indexes or force wide scans under pressure.",
          "CSV export can satisfy exploratory needs without corrupting the hot serving path."
        ],
        "alternative": "Building a generic filter-and-sort endpoint seems flexible but quietly converts the dashboard into an ad hoc reporting system.",
        "outcome": "The team keeps p95 stable for the main screen and still serves unusual requests through slower controlled paths."
      },
      {
        "id": "pending-jobs",
        "label": "Worker dispatch",
        "title": "Use a partial index where state matters more than table size",
        "scenario": "A dispatcher only needs pending jobs whose run_after is due, but the jobs table stores completed history for months.",
        "decision": "Create a partial index on pending rows instead of indexing the full historical table for one narrow queue-read path.",
        "why": [
          "Most completed rows are irrelevant to dispatch and only add maintenance cost.",
          "The partial predicate keeps the index smaller and warmer in cache.",
          "The path stays easy to explain operationally because the index matches one well-defined read pattern."
        ],
        "alternative": "A broad secondary index across all states appears simpler, but it spends write and storage budget on rows the dispatcher never touches.",
        "outcome": "Dispatch latency improves while write amplification stays bounded."
      }
    ],
    "decisionGuide": {
      "prompt": "How should you choose the indexing strategy for a new latency-sensitive endpoint?",
      "options": [
        {
          "id": "single-hot-path",
          "label": "Optimize one exact hot path first",
          "bestFor": "Endpoints with one dominant query shape and strict p95 goals.",
          "chooseWhen": [
            "The request always filters by a stable ownership boundary such as tenant or merchant.",
            "The product can accept explicit restrictions on supported filters and sorts.",
            "Write throughput matters enough that extra indexes must be justified carefully."
          ],
          "tradeOffs": [
            "Ad hoc analytics needs a separate path.",
            "Product teams may need education about why every sort is not free.",
            "Future query growth can still force index evolution later."
          ],
          "alternativeOutcome": "Trying to serve every potential query shape immediately usually wastes indexes and weakens the hot path."
        },
        {
          "id": "derived-search",
          "label": "Move exploratory access to a derived system",
          "bestFor": "Teams that need broad filtering or ranking but still need a tight transactional path.",
          "chooseWhen": [
            "Users need search-like behavior or many optional filters.",
            "Staleness of a few seconds or minutes is acceptable for exploratory views.",
            "The source-of-truth store should stay optimized for writes and narrow reads."
          ],
          "tradeOffs": [
            "You need event movement, replay, and search relevance tuning.",
            "Derived data can lag and must be labeled honestly.",
            "Operational surface area grows beyond one database."
          ],
          "alternativeOutcome": "Forcing the OLTP store to behave like both a serving database and a search engine creates avoidable pain on both paths."
        }
      ]
    },
    "caseStudy": {
      "title": "Tune a merchant order-history endpoint for predictable p95",
      "prompt": "A team is launching a merchant dashboard with recent-orders view, occasional CSV exports, and a looming request for flexible sorting by more fields.",
      "steps": [
        {
          "title": "Name the exact hot query",
          "detail": "Define tenant or merchant filter, allowed status values, stable sort order, projection, and cursor semantics.",
          "whatIf": "If the team starts from abstract schema design, the eventual endpoint will inherit an accidental scan path."
        },
        {
          "title": "Choose one focused composite index",
          "detail": "Match equality predicates first and order by the same key sequence the UI uses for pagination.",
          "whatIf": "If the index order and cursor order diverge, the endpoint may still sort in memory or page inconsistently."
        },
        {
          "title": "Separate serving from exploration",
          "detail": "Keep CSV export or wide filtering off the hot endpoint and route it through async jobs or search.",
          "whatIf": "If both use cases share one path, every merchant pays the latency cost of rare investigative queries."
        },
        {
          "title": "Roll out with write-cost visibility",
          "detail": "Build the index, watch write p95, storage growth, and replica lag, then shift reads intentionally.",
          "whatIf": "If index rollout is invisible operationally, the team can trade one latency win for a hidden recovery and write regression."
        }
      ],
      "metrics": [
        "read p95 by query shape",
        "write p95 delta after index",
        "replica lag during build",
        "origin scan count"
      ]
    },
    "mermaid": {
      "title": "Query path and index contract",
      "caption": "The request path stays narrow while exports and broad exploration branch to separate systems.",
      "code": "flowchart LR\n    Client --> API\n    API -->|supported filters only| QueryShape\n    QueryShape --> PrimaryIndex\n    API -->|broad export| AsyncJob\n    AsyncJob --> Warehouse\n"
    }
  },
  "data-storage-lab/replication-sharding-and-consistency": {
    "title": "Replication, sharding, and consistency lab",
    "summary": "Choose who owns writes, what freshness users can expect, and how partitioning survives both growth and failure.",
    "takeaways": [
      "Replica reads are a product decision because freshness varies by workflow.",
      "Shard keys should be defended under skew, not only under uniform traffic.",
      "Failover safety and catch-up behavior often matter more than steady-state diagrams."
    ],
    "examples": [
      {
        "id": "inventory-primary",
        "label": "Inventory reservations",
        "title": "Keep the authoritative write path narrow",
        "scenario": "An inventory service needs fast browse traffic but strict correctness for reservation confirmation.",
        "decision": "Route browse reads to replicas within a freshness budget, but force reservation confirmation and immediate verification reads to the primary.",
        "why": [
          "Inventory oversell risk is concentrated on the write-confirm path, not on general browsing.",
          "Follower reads can still absorb most browse traffic when the UI tolerates small lag.",
          "The consistency rule becomes easy to explain: confirmation must reflect the latest committed write."
        ],
        "alternative": "Sending all reads to replicas sounds scalable until customers see a successful reservation followed by stale availability screens.",
        "outcome": "The system gets scale where it can and strict freshness where it must."
      },
      {
        "id": "merchant-shard",
        "label": "Merchant isolation",
        "title": "Sharding follows ownership and hotspot risk",
        "scenario": "A commerce platform has long-tail merchants plus a few giant event-driven merchants.",
        "decision": "Shard by merchant ownership but retain enough routing indirection to isolate exceptional merchants or move them safely later.",
        "why": [
          "Operational isolation follows the same merchant boundary product teams understand.",
          "The hottest merchants can be migrated or dedicated without redesigning every key externally.",
          "Scatter-gather is reduced for the workflows most merchants care about."
        ],
        "alternative": "A time-only shard key spreads writes today but makes merchant-local operations and targeted isolation far harder tomorrow.",
        "outcome": "The platform balances locality for normal workflows with flexibility for abnormal success."
      }
    ],
    "decisionGuide": {
      "prompt": "Which topology is the better fit for the workflow you are defending?",
      "options": [
        {
          "id": "leader-followers",
          "label": "Single write owner with follower reads",
          "bestFor": "Workloads that need simple conflict handling and clear write authority.",
          "chooseWhen": [
            "Read traffic dominates and some bounded staleness is acceptable.",
            "User journeys that need fresh reads can be routed intentionally to primary.",
            "Operational simplicity matters more than write locality across every region."
          ],
          "tradeOffs": [
            "Follower lag must be visible and policy driven.",
            "Primary failover requires promotion safety and client discovery.",
            "Cross-region writes still pay for distance if the leader is remote."
          ],
          "alternativeOutcome": "Jumping directly to multi-writer often adds conflict and repair complexity before the business truly needs it."
        },
        {
          "id": "partitioned-authority",
          "label": "Partitioned authority with local ownership",
          "bestFor": "Workloads where throughput or locality demands multiple write domains.",
          "chooseWhen": [
            "A stable partition key keeps the dominant workflow local.",
            "Global transactions are rare or can be approximated asynchronously.",
            "Traffic skew is visible and hot partitions can be isolated or rebalanced."
          ],
          "tradeOffs": [
            "Cross-partition reads and reports become harder.",
            "Rebalancing, routing metadata, and repair add operational burden.",
            "User-facing freshness and aggregation rules must be explained carefully."
          ],
          "alternativeOutcome": "Keeping one global writer for all traffic may simplify correctness but can become the wrong bottleneck or latency anchor."
        }
      ]
    },
    "caseStudy": {
      "title": "Design replica and shard policy for a global inventory platform",
      "prompt": "A product needs per-merchant inventory ownership, fast browse reads, strict reservation semantics, and credible regional failover.",
      "steps": [
        {
          "title": "Classify the user journeys",
          "detail": "Separate browse, reserve, confirm, and analytics paths by freshness need before discussing topology.",
          "whatIf": "If every path inherits the same consistency policy, the design will either overspend on coordination or underdeliver on correctness."
        },
        {
          "title": "Assign write ownership and read eligibility",
          "detail": "Choose who owns reservations and define which followers are safe for browse traffic.",
          "whatIf": "If read routing rules are vague, engineers will accidentally serve confirmation reads from stale replicas."
        },
        {
          "title": "Choose a shard key under skew",
          "detail": "Model giant merchants and event spikes, then explain how the system isolates or rebalances them.",
          "whatIf": "A key that looks even in test traffic may fail immediately during a flash sale."
        },
        {
          "title": "Plan failover and repair",
          "detail": "Set promotion guardrails, routing discovery, and catch-up pacing before calling the topology resilient.",
          "whatIf": "If failover only exists on the diagram, the first incident becomes an improvised data-loss trade-off."
        }
      ],
      "metrics": [
        "primary write latency",
        "replica lag by region",
        "per-shard skew",
        "promotion safety threshold"
      ]
    },
    "mermaid": {
      "title": "Freshness-aware read routing",
      "caption": "Critical reads stay authoritative while tolerant reads absorb scale from followers.",
      "code": "sequenceDiagram\n    participant Client\n    participant API\n    participant Router\n    participant Primary\n    participant Replica\n    Client->>API: Reserve inventory\n    API->>Primary: Authoritative write\n    Client->>API: Browse availability\n    API->>Router: Read with freshness budget\n    Router->>Replica: If lag acceptable\n    Router->>Primary: Otherwise\n"
    }
  },
  "data-storage-lab/polyglot-storage-selection": {
    "title": "Polyglot storage selection lab",
    "summary": "Map authoritative and derived storage roles so the portfolio stays explainable, minimal, and resilient.",
    "takeaways": [
      "Every datastore should have a single clear reason to exist.",
      "Authority and projection boundaries matter more than brand or benchmark comparisons.",
      "The smallest viable portfolio is usually the most operable one."
    ],
    "examples": [
      {
        "id": "creator-platform",
        "label": "Creator platform",
        "title": "Separate truth, search, and blobs deliberately",
        "scenario": "A creator platform needs subscription billing, uploaded media, account search, and analytics.",
        "decision": "Keep billing and subscription truth relational, store blobs in object storage, project searchable documents into a search system, and cache hot reads separately.",
        "why": [
          "Billing and entitlement logic benefit from transactional authority and mature constraints.",
          "Media bytes are large, immutable, and cost sensitive, which suits object storage.",
          "Search relevance and broad filters belong in a derived system rather than in the transactional path."
        ],
        "alternative": "A one-database-for-everything design either mishandles blobs or turns transactional tables into awkward search indexes.",
        "outcome": "Each store stays aligned with one workload while the source of truth remains unambiguous."
      },
      {
        "id": "minimal-portfolio",
        "label": "Early-stage product",
        "title": "Resist adding a new datastore too soon",
        "scenario": "A young SaaS product wants graph queries, full-text search, and time-series dashboards before traffic is meaningfully large.",
        "decision": "Delay specialized stores until one access pattern becomes a real bottleneck, and meet the current need with a relational store plus cache and exports where possible.",
        "why": [
          "Operating burden grows faster than the feature list suggests once many stores exist.",
          "Early product changes often invalidate premature data modeling for specialized engines.",
          "Simple systems are easier to migrate later when usage is better understood."
        ],
        "alternative": "Adding every attractive datastore immediately creates synchronization and migration debt before the product proves which paths matter.",
        "outcome": "The team preserves agility and adds specialization only where production evidence demands it."
      }
    ],
    "decisionGuide": {
      "prompt": "How should you decide whether to add another datastore?",
      "options": [
        {
          "id": "reuse-current",
          "label": "Stretch the current portfolio slightly",
          "bestFor": "Teams whose access patterns are still evolving and whose current bottlenecks are not yet existential.",
          "chooseWhen": [
            "The current source of truth can still meet correctness needs.",
            "Broad queries or analytics can tolerate asynchronous exports for now.",
            "The team would rather preserve operator simplicity than chase theoretical optimality."
          ],
          "tradeOffs": [
            "Some workflows may remain slower or less expressive temporarily.",
            "You must watch for the moment when the stretch turns into real pain.",
            "Temporary workarounds can become permanent if not revisited intentionally."
          ],
          "alternativeOutcome": "Premature specialization can freeze architecture around guesses that the product invalidates within a quarter."
        },
        {
          "id": "introduce-specialist",
          "label": "Introduce a specialist derived store",
          "bestFor": "Workloads where the current portfolio cannot meet an important read or retrieval need cleanly.",
          "chooseWhen": [
            "The use case has a clear owner and a clear source of truth.",
            "The new system solves a recurring product need such as ranked full-text search or cheap blob storage.",
            "Replay, rebuild, and operational ownership are planned up front."
          ],
          "tradeOffs": [
            "Pipelines, lag, and rebuild costs become permanent responsibilities.",
            "The team must keep source of truth and derivative roles explicit.",
            "Migration away later will need overlap and parity validation."
          ],
          "alternativeOutcome": "Trying to imitate search or blob storage inside the primary transactional engine often creates a worse long-term system than one purposeful derived tool."
        }
      ]
    },
    "caseStudy": {
      "title": "Design a minimal but sufficient storage portfolio for a marketplace",
      "prompt": "The marketplace needs orders, seller dashboards, image uploads, search, and periodic analytics without overwhelming a small platform team.",
      "steps": [
        {
          "title": "Name the authoritative domains",
          "detail": "Decide which data must stay transactionally correct and which can be projected or archived.",
          "whatIf": "If authority is unclear, incident response becomes a reconciliation argument instead of a repair action."
        },
        {
          "title": "Match each non-authoritative need to one derived system",
          "detail": "Only add search, cache, or blob storage when the access pattern clearly benefits.",
          "whatIf": "If every feature gets a new datastore, operating complexity will outpace business value."
        },
        {
          "title": "Design the movement path",
          "detail": "Define outbox, projection, replay, and rebuild rules from the source of truth.",
          "whatIf": "A derived store without replay or rebuild is a future outage waiting to happen."
        },
        {
          "title": "Defend the omissions",
          "detail": "Explain which attractive specialized tools are deferred and how the current portfolio still meets today's workload.",
          "whatIf": "If no tool is ever deferred, the architecture likely reflects fascination with technology rather than disciplined scope."
        }
      ],
      "metrics": [
        "projection lag",
        "search freshness",
        "cache hit ratio",
        "number of authoritative stores"
      ]
    },
    "mermaid": {
      "title": "Authority and projection portfolio",
      "caption": "One source-of-truth core feeds a few purposeful derivatives instead of a sprawling storage zoo.",
      "code": "flowchart LR\n    RelationalPrimary --> Outbox\n    Outbox --> SearchIndex\n    RelationalPrimary --> Cache\n    RelationalPrimary --> Metadata\n    Metadata --> ObjectStore\n    Outbox --> Analytics\n"
    }
  },
  "security-operations-lab/auth-threat-modeling-for-hld": {
    "title": "Auth and threat modeling lab",
    "summary": "Map identity, permission checks, and abuse cases across one high-risk workflow until the control choices become architectural.",
    "takeaways": [
      "Identity and privilege are different control points with different failure modes.",
      "Threat modeling is strongest when it starts from one valuable workflow rather than from a giant abstract list.",
      "Abuse resistance and auditability belong in the architecture, not only in policy docs."
    ],
    "examples": [
      {
        "id": "admin-console",
        "label": "Admin console",
        "title": "Keep operator access on an explicit privileged path",
        "scenario": "Support agents need temporary access to customer accounts for debugging while tenant admins manage their own billing data.",
        "decision": "Separate support and tenant principals, require break-glass justification for elevated access, and audit all impersonation flows independently of customer traffic.",
        "why": [
          "Operator actions have higher blast radius and therefore deserve stronger controls than ordinary customer sessions.",
          "Clear separation makes incident review and customer trust easier to preserve.",
          "The customer plane stays simpler because privileged exceptions do not masquerade as normal user behavior."
        ],
        "alternative": "Reusing ordinary product APIs and roles for support actions hides privileged behavior inside the happy path and weakens accountability.",
        "outcome": "The system can move faster operationally while still making elevated behavior reviewable."
      },
      {
        "id": "password-reset",
        "label": "Password reset",
        "title": "Threat-model the identity recovery path explicitly",
        "scenario": "A product focuses heavily on login tokens but has not deeply reviewed password reset or email change flows.",
        "decision": "Treat password reset as a privileged workflow with replay resistance, enumeration-safe responses, and aggressive abuse limits.",
        "why": [
          "Identity recovery often becomes the easiest path around otherwise solid login design.",
          "Attackers prefer workflows that leak account existence or bypass stronger factors.",
          "Rate limits and one-time semantics belong in the design, not only in the auth provider defaults."
        ],
        "alternative": "Assuming the login page is the only real auth surface ignores the highest-leverage secondary flows.",
        "outcome": "Security posture improves on the flows attackers actually probe during abuse campaigns."
      }
    ],
    "decisionGuide": {
      "prompt": "Where should you focus threat-modeling effort first?",
      "options": [
        {
          "id": "privileged-workflow",
          "label": "Start with the highest-blast-radius workflow",
          "bestFor": "Systems where a small set of actions can cause outsized customer or financial harm.",
          "chooseWhen": [
            "An action changes identity, payout, admin access, or legal state.",
            "The workflow is less frequent than ordinary reads but far more dangerous when wrong.",
            "You want threat modeling to drive architecture rather than become a generic checklist."
          ],
          "tradeOffs": [
            "Some lower-risk endpoints stay less analyzed initially.",
            "The team must revisit coverage as the product evolves.",
            "It can feel slower than doing broad light reviews everywhere."
          ],
          "alternativeOutcome": "Spreading effort evenly can leave the most dangerous path under-modeled while giving a false sense of thoroughness."
        },
        {
          "id": "shared-edge-controls",
          "label": "Centralize only coarse controls at the edge",
          "bestFor": "Architectures that need consistent authentication and rate limiting but domain-aware authorization inside services.",
          "chooseWhen": [
            "You want TLS termination, token validation, and baseline abuse policy shared.",
            "Permission decisions depend on tenant or resource context known best by application services.",
            "You need audits to reflect business actions, not only gateway decisions."
          ],
          "tradeOffs": [
            "Some logic is duplicated conceptually across edge and service tiers.",
            "Teams need discipline to avoid pushing domain logic into the gateway over time.",
            "Service owners must maintain clear policy code and tests."
          ],
          "alternativeOutcome": "Putting all authorization in the gateway often creates a brittle central policy blob that lacks business context."
        }
      ]
    },
    "caseStudy": {
      "title": "Threat-model a multi-tenant admin console",
      "prompt": "A SaaS company is launching a tenant admin console plus a support console with controlled escalation.",
      "steps": [
        {
          "title": "Map actors and privileges",
          "detail": "Separate tenant admins, support agents, platform operators, and background jobs before designing token or role structure.",
          "whatIf": "If all identities are flattened, the privilege model will hide the real blast radius of operator flows."
        },
        {
          "title": "Choose one critical workflow",
          "detail": "Model invite acceptance, password reset, or impersonation end to end and enumerate spoofing, tampering, disclosure, and privilege escalation risks.",
          "whatIf": "A generic survey will miss the workflow attackers actually exploit first."
        },
        {
          "title": "Add architectural controls",
          "detail": "Place scoped identity, step-up checks, abuse limits, and immutable audit events on the chosen path.",
          "whatIf": "If the controls remain abstract, the threat model does not improve the actual system."
        },
        {
          "title": "Plan misuse detection",
          "detail": "Define which dashboards, alerts, or audit queries reveal abuse before customers do.",
          "whatIf": "Controls without observability turn incidents into archaeology."
        }
      ],
      "metrics": [
        "failed login rate",
        "break-glass activations",
        "cross-tenant authz denials",
        "impersonation audit completeness"
      ]
    },
    "mermaid": {
      "title": "Privileged workflow threat map",
      "caption": "High-risk flows get explicit control points instead of inheriting generic happy-path assumptions.",
      "code": "flowchart LR\n    User --> Edge\n    Edge --> AuthN\n    AuthN --> Service\n    Service --> AuthZ\n    AuthZ --> Data\n    Service --> Audit\n    SupportAgent --> BreakGlass\n    BreakGlass --> AuthZ\n"
    }
  },
  "security-operations-lab/encryption-secrets-and-tenancy": {
    "title": "Encryption, secrets, and tenancy lab",
    "summary": "Decide what must be encrypted, how secrets rotate, and how tenant boundaries survive through storage and worker paths.",
    "takeaways": [
      "Data classification comes before key hierarchy choices.",
      "Secret distribution is part of the runtime architecture, not just a provisioning step.",
      "Tenant isolation fails if caches and workers ignore the same boundaries respected by APIs."
    ],
    "examples": [
      {
        "id": "pii-fields",
        "label": "Sensitive PII",
        "title": "Protect only what needs stronger treatment, but do it end to end",
        "scenario": "A SaaS billing platform stores invoices, payout details, contracts, and profile metadata with different risk levels.",
        "decision": "Encrypt payout and contract data with stronger scoped controls, keep relational metadata queryable, and separate blob bytes from transactional rows.",
        "why": [
          "Not every field needs the same protection or the same operational cost.",
          "Field and object controls should follow who can access or export the data later.",
          "Over-encrypting query-critical fields can cause teams to reintroduce unsafe plaintext shortcuts."
        ],
        "alternative": "Applying one blunt encryption policy everywhere can either underprotect high-risk data or break the paths the product still needs to query.",
        "outcome": "The control surface stays focused and the data model remains usable."
      },
      {
        "id": "tenant-cache",
        "label": "Tenant-safe cache",
        "title": "Carry tenant boundaries beyond the database",
        "scenario": "An application already filters database rows by tenant but forgets to include tenant context in one cache key.",
        "decision": "Make tenant context mandatory in cache keys, worker payloads, and search documents, not only in SQL filters.",
        "why": [
          "Cross-tenant leaks often originate in derivative systems rather than in the primary table.",
          "Defense in depth means the isolation boundary exists in multiple layers.",
          "Workers and caches often evolve later and can quietly bypass an originally safe data model."
        ],
        "alternative": "Assuming database filters alone guarantee multi-tenant safety ignores where derived state and intermediate reads actually happen.",
        "outcome": "Tenant isolation remains resilient even when one layer behaves incorrectly."
      }
    ],
    "decisionGuide": {
      "prompt": "Which isolation pattern fits the tenant and data risk best?",
      "options": [
        {
          "id": "shared-table-strong-guards",
          "label": "Shared tables with strong guards",
          "bestFor": "Most SaaS workloads that need efficiency and have mature tenant-aware controls.",
          "chooseWhen": [
            "Tenant context can be propagated reliably through API, DB, cache, and job paths.",
            "Row-level security or equivalent storage-level guardrails are available.",
            "Operator tooling and audit paths are mature enough to review access safely."
          ],
          "tradeOffs": [
            "One bug can still have wider blast radius than in hard-isolated designs.",
            "Testing tenant-safety paths becomes critical and ongoing.",
            "Premium or regulated tenants may still demand more isolation later."
          ],
          "alternativeOutcome": "Jumping to hard isolation for every tenant can overwhelm operations before the business truly needs it."
        },
        {
          "id": "premium-isolation",
          "label": "Stronger per-tenant isolation for select tiers",
          "bestFor": "Highly regulated or premium tenants with strict blast-radius expectations.",
          "chooseWhen": [
            "Contracts or compliance requirements justify added cost and operational overhead.",
            "A small subset of tenants meaningfully changes the risk posture.",
            "Per-tenant keys, schemas, or clusters improve customer trust enough to matter commercially."
          ],
          "tradeOffs": [
            "Operations, migrations, and cost all become more complex.",
            "The platform must avoid letting exceptional cases dominate every design choice.",
            "Support tooling and analytics become harder across heterogeneous tenant layouts."
          ],
          "alternativeOutcome": "One universal hard-isolation model may sacrifice product agility where shared infrastructure would have been sufficient and safe enough."
        }
      ]
    },
    "caseStudy": {
      "title": "Design tenant-safe secret and encryption policy for a billing SaaS",
      "prompt": "The product stores contracts, payout details, tenant-specific webhook credentials, and normal invoice metadata across shared infrastructure.",
      "steps": [
        {
          "title": "Classify the data",
          "detail": "Decide which fields or objects truly need scoped encryption, which need transport protection only, and which must remain queryable.",
          "whatIf": "If every field is treated identically, the design will either become unworkable or insufficiently protective."
        },
        {
          "title": "Pick the secret-distribution path",
          "detail": "Define how services and workers obtain, refresh, and audit access to signing keys, database credentials, and tenant integration secrets.",
          "whatIf": "Static long-lived secrets turn one host compromise into a platform-wide incident."
        },
        {
          "title": "Enforce tenant boundaries in derivatives",
          "detail": "Thread tenant context through cache keys, queue payloads, search documents, and audit records.",
          "whatIf": "If only the SQL path is tenant aware, a leak can still emerge from derived or cached state."
        },
        {
          "title": "Plan the exception path",
          "detail": "Specify break-glass access, stronger isolation tiers, and how decrypt or export privileges are reviewed.",
          "whatIf": "Without an explicit exception path, operators will improvise one during the first serious incident."
        }
      ],
      "metrics": [
        "secret version age",
        "tenant-scope cache misses",
        "decrypt audit events",
        "cross-tenant denial count"
      ]
    },
    "mermaid": {
      "title": "Tenant-aware protection path",
      "caption": "Encryption and tenancy controls follow data through APIs, storage, secrets, and workers.",
      "code": "flowchart LR\n    Client --> Edge\n    Edge --> API\n    API --> KMS\n    API --> Primary\n    API --> Cache\n    API --> Queue\n    Queue --> Workers\n    Primary --> Audit\n"
    }
  },
  "security-operations-lab/safe-change-dr-and-degradation": {
    "title": "Safe change, DR, and degradation lab",
    "summary": "Decide how the system rolls out risky changes, recovers from regional or logic failures, and preserves the core journey while shedding optional work.",
    "takeaways": [
      "Rollout safety, recovery objectives, and degraded UX are one connected architecture story.",
      "Backups and failover only matter if restore and transition paths are tested.",
      "Graceful degradation is meaningful only when the user-visible fallback is explicit."
    ],
    "examples": [
      {
        "id": "checkout-rollout",
        "label": "Checkout migration",
        "title": "Use overlap and canary signals for a risky write-path change",
        "scenario": "A checkout service is moving from one order projection model to another while traffic remains live.",
        "decision": "Deploy new code dark, dual-write where needed, shift a stable tenant cohort first, and compare both performance and business-correctness metrics before wider rollout.",
        "why": [
          "Write-path changes are dangerous because data and code compatibility must overlap.",
          "Stable cohorts make rollback and mismatch investigation far easier than random exposure.",
          "Business metrics such as duplicate orders or missing confirmations matter as much as CPU and latency."
        ],
        "alternative": "A one-shot deploy may look fast, but it leaves no clean point for parity checks or safe rollback when something subtle goes wrong.",
        "outcome": "The team gains evidence and escape hatches while change is still reversible."
      },
      {
        "id": "core-only-mode",
        "label": "Core-only mode",
        "title": "Protect the critical journey by shedding enrichments",
        "scenario": "An ecommerce site depends on recommendations, fraud enrichment, and analytics beyond the payment and order core.",
        "decision": "During dependency distress, keep order acceptance and payment alive while disabling or deferring recommendations and nonessential enrichments.",
        "why": [
          "Users care more about successful order placement than about optional content during incidents.",
          "Clear shedding order prevents low-value work from consuming scarce capacity first.",
          "Feature flags and runbooks let operators move intentionally instead of improvising under pressure."
        ],
        "alternative": "Trying to preserve every feature equally often means the whole request path times out together.",
        "outcome": "Availability becomes more honest and more useful to customers during partial outages."
      }
    ],
    "decisionGuide": {
      "prompt": "Which resilience posture best fits the change or outage you are planning for?",
      "options": [
        {
          "id": "progressive-overlap",
          "label": "Progressive rollout with overlap",
          "bestFor": "Risky changes to schemas, projections, routing, or core dependencies.",
          "chooseWhen": [
            "Old and new versions can coexist for a limited window.",
            "You can validate both correctness and latency on a stable cohort.",
            "Rollback or fast disablement is more valuable than raw rollout speed."
          ],
          "tradeOffs": [
            "Temporary duplication adds complexity during the migration window.",
            "Operators need clear metrics for parity and mismatch.",
            "Cleanup discipline matters once confidence is established."
          ],
          "alternativeOutcome": "Big-bang changes can be simpler on paper but make incidents much harder to diagnose and contain."
        },
        {
          "id": "core-journey-first",
          "label": "Core journey first under degradation",
          "bestFor": "Partial outages where preserving every feature is unrealistic.",
          "chooseWhen": [
            "The system can identify must-survive flows separately from enrichments.",
            "Users can tolerate stale or missing secondary features better than failed critical actions.",
            "Operators can toggle or queue lower-value work quickly."
          ],
          "tradeOffs": [
            "Some experiences become visibly reduced.",
            "Feature teams must agree on shedding order ahead of time.",
            "Re-entry to normal mode must be staged to avoid a rebound incident."
          ],
          "alternativeOutcome": "If all work stays equally critical during an incident, overload tends to spread everywhere."
        }
      ]
    },
    "caseStudy": {
      "title": "Plan safe rollout and degraded mode for a checkout stack",
      "prompt": "A payment and order stack needs a risky projection migration plus a documented strategy for regional failover and optional dependency loss.",
      "steps": [
        {
          "title": "Define the recovery and rollout promises",
          "detail": "Set RTO, RPO, compatible overlap windows, and canary stop conditions before touching traffic.",
          "whatIf": "If objectives are implicit, every stakeholder will make a different risk trade-off mid-incident."
        },
        {
          "title": "Choose cohort and signals",
          "detail": "Roll out by tenant or region and watch both domain metrics and system metrics.",
          "whatIf": "If exposure is random and signals are generic, subtle correctness bugs can spread quietly."
        },
        {
          "title": "Rank user journeys",
          "detail": "Mark what stays alive in core-only or read-only mode and what work can defer to queues.",
          "whatIf": "Without an agreed shedding order, operators waste time debating while users time out."
        },
        {
          "title": "Exercise the transition",
          "detail": "Drill failover, rollback, and re-entry into normal mode so the design is more than a diagram.",
          "whatIf": "Unpracticed recovery paths often fail at the human handoff even if the system mechanics look sound."
        }
      ],
      "metrics": [
        "dual-write mismatch rate",
        "degraded-mode activation",
        "failover time",
        "core-checkout success rate"
      ]
    },
    "mermaid": {
      "title": "Safe change and degraded mode loop",
      "caption": "Traffic shifts gradually while the product keeps a narrower but coherent core experience under stress.",
      "code": "flowchart LR\n    Deploy --> Shadow\n    Shadow --> Canary\n    Canary --> Full\n    Canary --> Rollback\n    Full --> DegradeMode\n    DegradeMode --> Recover\n    Recover --> Full\n"
    }
  },
  "distributed-systems-lab/partitioning-and-hot-key-control": {
    "title": "Partitioning and hot-key control lab",
    "summary": "Choose a partition layout, predict the hotspot, and decide whether caches, queues, or rebalancing contain it best.",
    "takeaways": [
      "Skew is the real test of a partitioning scheme.",
      "Hot reads and hot writes usually need different mitigation tools.",
      "Rebalancing is itself a risky operational event that must be paced and observed."
    ],
    "examples": [
      {
        "id": "celebrity-profile",
        "label": "Celebrity profile",
        "title": "Protect a hot read key without repartitioning first",
        "scenario": "One social account is read millions of times per minute, but writes to the profile are rare.",
        "decision": "Use multilayer caches and request coalescing first, and only consider dedicated isolation if the heat becomes persistent.",
        "why": [
          "The bottleneck is repeated reads of one object, not distributed write ownership.",
          "Coalescing and caching reduce origin amplification quickly without moving the partition.",
          "The system can still keep one authoritative write owner for the profile itself."
        ],
        "alternative": "Immediate repartitioning of the user key may add churn and little benefit if read amplification is the main problem.",
        "outcome": "The hotspot is contained with cheaper tools before layout changes become necessary."
      },
      {
        "id": "flash-sale-sku",
        "label": "Flash-sale SKU",
        "title": "Serialize hot writes instead of pretending they can stay fully parallel",
        "scenario": "A few inventory SKUs receive intense concurrent reservation attempts for a short window.",
        "decision": "Queue or serialize the reservation path per SKU and pair it with strict cache and availability messaging on the read side.",
        "why": [
          "The hotspot is write contention on the same logical object, not general shard imbalance alone.",
          "Serializing one SKU is cheaper than letting parallel optimistic retries collapse the whole partition.",
          "The product can expose queuing or pending semantics honestly during the sale window."
        ],
        "alternative": "Trying to keep the hot write path completely parallel often burns capacity on failed retries and contradictory updates.",
        "outcome": "Correctness is preserved and the overloaded partition remains bounded."
      }
    ],
    "decisionGuide": {
      "prompt": "Which first response best fits the hotspot you expect?",
      "options": [
        {
          "id": "cache-and-coalesce",
          "label": "Cache and coalesce first",
          "bestFor": "Read-dominated hotspots on mostly immutable or slowly changing data.",
          "chooseWhen": [
            "Many identical reads target the same key concurrently.",
            "The underlying object changes infrequently enough for caching to help.",
            "Origin load amplification is the main risk."
          ],
          "tradeOffs": [
            "Freshness must still be defined and invalidation handled safely.",
            "Truly persistent hotspots may still need dedicated isolation later.",
            "Cold-cache recovery remains a design concern."
          ],
          "alternativeOutcome": "Jumping straight to repartitioning may miss the cheaper and more direct fix to read amplification."
        },
        {
          "id": "serialize-and-isolate",
          "label": "Serialize or isolate hot writes",
          "bestFor": "Write-contention hotspots where many actors mutate the same logical record.",
          "chooseWhen": [
            "Concurrent writes conflict or repeatedly retry on the same owner.",
            "Correctness is more important than maximizing write parallelism for that object.",
            "A temporary queue or dedicated owner can keep blast radius bounded."
          ],
          "tradeOffs": [
            "Latency rises for the hot object.",
            "Operators need visibility into queue age or owner saturation.",
            "The product may need clearer pending or sold-out semantics."
          ],
          "alternativeOutcome": "General-purpose parallel writes often waste more capacity than they save when one key is exceptionally hot."
        }
      ]
    },
    "caseStudy": {
      "title": "Handle a flash-sale hotspot without collapsing the shard map",
      "prompt": "A commerce service expects a few celebrity products and merchants to dominate traffic briefly but brutally.",
      "steps": [
        {
          "title": "Name the heat source",
          "detail": "Decide whether the hotspot is repeated reads, conflicting writes, or both before choosing tooling.",
          "whatIf": "If the team misclassifies the hotspot, it may spend time on rebalancing while origin amplification keeps burning."
        },
        {
          "title": "Apply the first-line mitigation",
          "detail": "Use cache and coalescing for reads or queued serialization for writes, depending on the dominant risk.",
          "whatIf": "A generic answer like shard more can hide the fact that one object still remains singularly hot."
        },
        {
          "title": "Watch skew signals",
          "detail": "Track top-key concentration, shard p95, cache hit ratio, and queue age on the hotspot path.",
          "whatIf": "If only fleet averages are watched, the hotspot will disappear inside healthy aggregate numbers."
        },
        {
          "title": "Escalate to isolation or movement only when needed",
          "detail": "Reserve dedicated shards or rebalancing for sustained hotspots that outgrow the first-line controls.",
          "whatIf": "Moving too early can add control-plane churn without removing the actual workload concentration."
        }
      ],
      "metrics": [
        "top-key request concentration",
        "shard p95",
        "cache hit ratio on hot set",
        "queue age for serialized writes"
      ]
    },
    "mermaid": {
      "title": "Hot object containment path",
      "caption": "Different hotspot classes trigger different mitigations before expensive movement.",
      "code": "flowchart LR\n    HotRequest --> Classify\n    Classify -->|read-heavy| CacheCoalesce\n    Classify -->|write-heavy| Serialize\n    CacheCoalesce --> Observe\n    Serialize --> Observe\n    Observe -->|persistent| Isolate\n    Observe -->|resolved| Normal\n"
    }
  },
  "distributed-systems-lab/consensus-quorums-and-leadership": {
    "title": "Consensus, quorums, and leadership lab",
    "summary": "Decide what truly needs coordination, then design leader ownership and caller behavior around failures and stale terms.",
    "takeaways": [
      "Consensus should be isolated to the smallest state surface that truly needs it.",
      "Quorums buy overlap at a latency and availability cost that must be justified per workflow.",
      "Leader election is incomplete without stale-leader suppression and client semantics."
    ],
    "examples": [
      {
        "id": "metadata-leader",
        "label": "Partition metadata",
        "title": "Use leadership for control-plane truth, not for every ordinary read",
        "scenario": "A partitioned data service needs one current owner for partition metadata and failover decisions, but user reads should remain local and fast.",
        "decision": "Keep consensus around ownership metadata while allowing data-plane reads to stay partition local and cached.",
        "why": [
          "Metadata correctness is critical because wrong ownership corrupts the whole partition map.",
          "Most user reads do not need to pay consensus cost if ownership is already known.",
          "The separation preserves safety without spreading coordination into every request path."
        ],
        "alternative": "Putting all reads and writes through a consensus service would simplify the diagram but impose unnecessary latency and throughput limits.",
        "outcome": "The service gets one reliable control plane without turning the whole product into a consensus system."
      },
      {
        "id": "stale-leader",
        "label": "Stale writer suppression",
        "title": "Use fencing tokens to finish the failover story",
        "scenario": "A previously healthy leader can remain alive after partition and still attempt writes against shared infrastructure.",
        "decision": "Attach terms or fencing tokens to leader-issued mutations and reject lower-term writes at the destination.",
        "why": [
          "Election alone does not stop an old leader from acting after losing authority.",
          "The write sink can protect itself even if two candidates temporarily believe they lead.",
          "Operator confidence in failover improves when stale terms are visibly rejected rather than silently applied."
        ],
        "alternative": "Relying on timing assumptions alone creates split-brain risk when clocks or network conditions behave badly.",
        "outcome": "The design stays safe even when the old node dies slowly instead of cleanly."
      }
    ],
    "decisionGuide": {
      "prompt": "Where should you pay the coordination cost?",
      "options": [
        {
          "id": "control-plane-only",
          "label": "Control plane only",
          "bestFor": "Systems where ownership metadata or scheduling state must be agreed globally, but ordinary traffic can stay local.",
          "chooseWhen": [
            "Most reads and writes can use stable partition ownership information.",
            "Global coordination would be too expensive on every request.",
            "Clients can tolerate brief metadata refresh during leadership change."
          ],
          "tradeOffs": [
            "Client or proxy discovery paths must be reliable.",
            "Control-plane outages still have outsized blast radius.",
            "You need a story for stale ownership caches."
          ],
          "alternativeOutcome": "Using consensus everywhere may feel safer but usually pays too much latency and complexity tax."
        },
        {
          "id": "quorum-critical-writes",
          "label": "Quorum only for the critical write class",
          "bestFor": "Workloads where a narrow set of writes needs stronger freshness or durability than the rest.",
          "chooseWhen": [
            "Only some mutations justify the extra coordination budget.",
            "Clients and operators can distinguish critical from ordinary writes cleanly.",
            "The design can tolerate heterogeneous consistency semantics across workflows."
          ],
          "tradeOffs": [
            "The caller contract becomes more nuanced.",
            "Observability must separate the critical and ordinary paths.",
            "Teams must resist letting every new feature declare itself critical."
          ],
          "alternativeOutcome": "Uniform coordination policies often spend latency budget on paths that never needed stronger semantics."
        }
      ]
    },
    "caseStudy": {
      "title": "Design leadership for a partition ownership service",
      "prompt": "A partitioned data plane needs safe owner election and coherent client behavior when leadership changes.",
      "steps": [
        {
          "title": "Prove the need for coordination",
          "detail": "Limit consensus to ownership metadata or another truly global control-plane fact.",
          "whatIf": "If coordination scope grows casually, the system will become slower without a corresponding safety gain."
        },
        {
          "title": "Define stale-owner suppression",
          "detail": "Use terms, leases, or fencing tokens so old leaders cannot keep mutating after failover.",
          "whatIf": "Election without stale-owner suppression leaves the split-brain risk unsolved."
        },
        {
          "title": "Design caller behavior",
          "detail": "Choose whether clients see redirects, retriable failures, or stable endpoints that hide the leader move.",
          "whatIf": "Undefined caller semantics turn brief failover into random client pain."
        },
        {
          "title": "Plan membership and warmup",
          "detail": "Describe how new replicas catch up and when they may participate safely in leadership or quorum.",
          "whatIf": "If membership change is ignored, the design sounds static and under-tested."
        }
      ],
      "metrics": [
        "election duration",
        "stale-term rejections",
        "metadata cache freshness",
        "quorum write latency"
      ]
    },
    "mermaid": {
      "title": "Leader ownership and fenced writes",
      "caption": "Only the coordination-critical state pays the term and fencing cost.",
      "code": "sequenceDiagram\n    participant Client\n    participant Coordinator\n    participant Leader\n    participant Store\n    Client->>Coordinator: Resolve current owner\n    Coordinator-->>Client: leader + term\n    Client->>Leader: Write(term=7)\n    Leader->>Store: Apply with fence=7\n    Store-->>Leader: accepted\n"
    }
  },
  "distributed-systems-lab/sagas-idempotency-and-workflows": {
    "title": "Sagas, idempotency, and workflows lab",
    "summary": "Design a multi-step business flow that survives retries, partial failure, compensation, and manual recovery without losing customer intent.",
    "takeaways": [
      "Distributed workflows need durable state and retry safety, not only event emission.",
      "Outbox and inbox patterns turn transport retries into business-safe behavior.",
      "Operator recovery paths are part of the workflow design, not only a future support concern."
    ],
    "examples": [
      {
        "id": "order-intent",
        "label": "Order submission",
        "title": "Return accepted on the right boundary",
        "scenario": "An order path validates cart state, reserves inventory, authorizes payment, and later sends email and analytics.",
        "decision": "Return accepted after the authoritative core steps succeed, then continue recoverable side effects asynchronously with durable workflow state.",
        "why": [
          "The user needs confidence that the order exists, not that every downstream side effect is already complete.",
          "Durable workflow state makes retries and operator recovery coherent.",
          "Async side effects stay recoverable without making the core path brittle."
        ],
        "alternative": "Doing every effect inline makes acceptance depend on low-value or cold systems such as email or analytics.",
        "outcome": "The workflow stays understandable, bounded, and operable under retry and delay."
      },
      {
        "id": "duplicate-payment",
        "label": "Retrying a payment command",
        "title": "Treat duplicate transport as one business command",
        "scenario": "A client times out waiting for payment authorization and retries with the same intent.",
        "decision": "Require a stable idempotency key and store the prior result so the retry returns the original outcome instead of charging twice.",
        "why": [
          "Transport uncertainty is unavoidable; business duplication is optional if the design plans for it.",
          "A durable result record keeps retried commands from re-executing blindly.",
          "The caller contract becomes simpler because safe retry is intentional."
        ],
        "alternative": "Assuming the queue or HTTP transport gives exactly-once behavior pushes duplication risk into the business workflow.",
        "outcome": "The payment path becomes safe to retry even when the first response was lost."
      }
    ],
    "decisionGuide": {
      "prompt": "Which workflow style best fits the business process?",
      "options": [
        {
          "id": "orchestrated-state-machine",
          "label": "Orchestrated state machine",
          "bestFor": "High-value workflows that need step visibility, ordering, and controlled compensation.",
          "chooseWhen": [
            "Operators must inspect or intervene in stuck workflows.",
            "Step order and business timing are important.",
            "One service or engine can own the workflow truth clearly."
          ],
          "tradeOffs": [
            "The coordinator becomes a critical dependency.",
            "The workflow model must evolve carefully as steps change.",
            "Teams need discipline to keep all step state coherent."
          ],
          "alternativeOutcome": "Pure choreography can hide the business process across many consumers until no one can explain recovery anymore."
        },
        {
          "id": "lightweight-choreography",
          "label": "Lightweight choreography",
          "bestFor": "Simpler fan-out or enrichment flows where side effects are loosely coupled and visible failure handling is modest.",
          "chooseWhen": [
            "No single step needs strict centralized ordering.",
            "Consumers can be independently retried and reconciled.",
            "The business can tolerate partial completion or delayed enrichments."
          ],
          "tradeOffs": [
            "Ownership of end-to-end workflow visibility is weaker.",
            "Hidden coupling can grow over time.",
            "Operator recovery is harder if the event graph becomes too wide."
          ],
          "alternativeOutcome": "Forcing orchestration on every tiny enrichment flow can add coordinator cost where the business never needed it."
        }
      ]
    },
    "caseStudy": {
      "title": "Design a retry-safe checkout saga",
      "prompt": "The system spans inventory, payment, shipment, and notification while supporting safe client retries and eventual operator repair.",
      "steps": [
        {
          "title": "Define the acceptance boundary",
          "detail": "State which local transactions must complete before the API returns accepted to the user.",
          "whatIf": "If acceptance is vague, retries and customer messaging become inconsistent immediately."
        },
        {
          "title": "Persist workflow truth",
          "detail": "Store step state durably so retries, compensations, and operators all reason about the same workflow instance.",
          "whatIf": "If state only lives in transient logs or events, recovery becomes guesswork."
        },
        {
          "title": "Attach idempotency to commands",
          "detail": "Use stable keys on externally retryable commands and dedupe state on consumers.",
          "whatIf": "Without replay safety, partial failures become duplicate charges or reservations."
        },
        {
          "title": "Plan compensation and repair",
          "detail": "Decide which failures auto-compensate, which require manual review, and how reconciliation finds misses later.",
          "whatIf": "If recovery is undefined, the workflow is only reliable on the happy path."
        }
      ],
      "metrics": [
        "workflow age",
        "compensation rate",
        "duplicate-command collapse count",
        "stuck workflow count"
      ]
    },
    "mermaid": {
      "title": "Workflow truth and replay safety",
      "caption": "A durable workflow record governs retries, async effects, and operator recovery.",
      "code": "flowchart LR\n    Client --> API\n    API --> WorkflowState\n    WorkflowState --> Inventory\n    WorkflowState --> Payment\n    WorkflowState --> Queue\n    Queue --> Shipment\n    Queue --> Notify\n    WorkflowState --> Reconcile\n"
    }
  }
};

/** @type {Record<string, any>} */
export const hldExhaustiveLabInteractive = Object.fromEntries(
  Object.entries(raw).map(([id, lab]) => [
    id,
    {
      ...lab,
      caseStudy: caseStudy(lab.caseStudy)
    }
  ])
);
