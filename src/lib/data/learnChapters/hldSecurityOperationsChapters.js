/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldSecurityOperationsChapters = {
  "security-and-operations/security-basics": {
    "title": "Security foundations for system design",
    "readingTime": "75-95 min",
    "premise": "Security belongs inside the architecture, not as a final box labeled auth. This chapter separates authentication from authorization, covers transport and at-rest protection, multi-tenant boundaries, least privilege, and abuse defenses so interview designs protect data without derailing the rest of the system.",
    "parts": [
      {
        "id": "authn-vs-authz",
        "heading": "Authenticate and authorize as separate concerns",
        "paragraphs": [
          "Authentication proves who or what is calling. Authorization decides what that principal may do. Collapsing them into a single vague auth layer leads to broken admin tools and confused service-to-service trust. In interviews, name both explicitly and show where each check runs.",
          "Human authentication often uses OIDC/OAuth2 with short-lived access tokens and refresh flows, MFA for privileged users, and session revocation. Service authentication uses workload identities, mTLS, or signed service tokens—not shared long-lived static keys copied into twelve repos. Short-lived credentials limit blast radius when leaked.",
          "Authorization models include RBAC, ABAC, and relationship-based checks. Multi-tenant systems must enforce tenant boundaries on every query, not only at the UI. Object-level checks prevent IDOR-style access where an authenticated user reads another user's resources by guessing IDs. Audit privileged actions with actor, action, and target."
        ],
        "keyTerms": [
          {
            "term": "Authentication",
            "definition": "Verifying the identity of a user or service principal."
          },
          {
            "term": "Authorization",
            "definition": "Determining whether an authenticated principal may perform an action on a resource."
          },
          {
            "term": "Least privilege",
            "definition": "Granting only the minimum permissions needed for a task, for people and services alike."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say authn then authz: how identity is established, then how tenant and object permissions are enforced on the data path."
        },
        "checkYourself": [
          {
            "prompt": "How would you design authz for a multi-tenant admin dashboard?",
            "reveal": "Authenticate admins strongly, scope tokens to tenant and roles, enforce tenant filters in every query, separate break-glass super-admin with MFA and audit, and never trust client-supplied tenant IDs without server checks."
          }
        ]
      },
      {
        "id": "tokens-sessions-scopes",
        "heading": "Tokens, sessions, and scopes",
        "paragraphs": [
          "Access tokens should be short-lived and narrowly scoped. Scopes and audience claims prevent a token meant for the photo service from calling the billing API. Refresh tokens need rotation and reuse detection. Server-side session stores help revoke access quickly after theft or employee offboarding.",
          "API keys for public clients are not end-user identities; pair them with user auth when acting on private data. Rate-limit and bind keys to origins where possible. For third-party webhooks, verify signatures rather than trusting IP lists alone.",
          "Store secrets in a manager or KMS-backed store, inject at runtime, and rotate. Never bake production secrets into images or frontend bundles. Interview answers that mention secret rotation sound operationally mature."
        ],
        "keyTerms": [
          {
            "term": "Scope",
            "definition": "A capability claim limiting what a token is allowed to access."
          },
          {
            "term": "Token rotation",
            "definition": "Issuing new credentials regularly and invalidating old ones to limit leak windows."
          },
          {
            "term": "Workload identity",
            "definition": "Cloud or mesh identity for services replacing static shared passwords."
          }
        ],
        "workedExample": {
          "title": "Mandatory controls sketch for payments",
          "body": "A concise security checklist you can recite for a payments system design.",
          "code": "authn: user OIDC + MFA for payouts; services mTLS/workload identity\nauthz: RBAC + object checks; no broad admin by default\ntransit: TLS everywhere; restrict cipher suites\nrest: KMS-encrypted PAN tokens / never store raw cards if possible\nkeys: HSM/KMS, rotation, dual control for break-glass\nabuse: idempotency keys, velocity limits, fraud checks\naudit: immutable logs for money movement and permission changes\nsupply: dependency scanning, signed artifacts, least-privilege CI",
          "language": "text"
        },
        "callout": {
          "tone": "tip",
          "body": "Frontend tokens are public to the browser environment—design APIs assuming attackers can call them with a stolen session."
        },
        "checkYourself": [
          {
            "prompt": "What security controls are mandatory for a payments system?",
            "reveal": "Strong authn/authz, TLS, encryption of sensitive fields, strict secret management, fraud/velocity controls, immutable audit logs, and minimized storage of raw payment instruments."
          }
        ]
      },
      {
        "id": "protect-data",
        "heading": "Protect data in transit and at rest",
        "paragraphs": [
          "TLS should protect public and sensitive internal traffic. Mutual TLS or mesh identity raises the bar between services so the network is not an implicit trust zone. Certificate management and automation are part of the design.",
          "At-rest encryption via platform disk encryption is baseline; application-level encryption or field encryption protects especially sensitive columns with KMS-managed keys. Key rotation and access policies matter as much as algorithms. Backups inherit encryption and access-control requirements—or they become the soft underbelly.",
          "Data minimization reduces risk. Avoid storing what you do not need; tokenize or hash where lookups allow; define retention. Privacy regulations reinforce what good architecture already wants: less sensitive data in fewer places."
        ],
        "keyTerms": [
          {
            "term": "TLS",
            "definition": "Transport Layer Security for encrypting data in motion between endpoints."
          },
          {
            "term": "KMS",
            "definition": "Key management service that stores and controls access to cryptographic keys."
          },
          {
            "term": "Data minimization",
            "definition": "Collecting and retaining only the sensitive data required for the product purpose."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Unencrypted backups and log archives often undo careful online encryption."
        },
        "checkYourself": [
          {
            "prompt": "Why is least privilege important between internal services?",
            "reveal": "Compromising one service should not grant broad access to all data stores; scoped identity limits lateral movement."
          }
        ]
      },
      {
        "id": "abuse-and-input",
        "heading": "Defend against common abuse and injection",
        "paragraphs": [
          "Validate inputs by context: schema validation, size limits, type checks, and content constraints. Use parameterized queries to eliminate SQL injection. Encode outputs appropriately for HTML, URL, and command contexts. File uploads need type checks, size limits, virus scanning where relevant, and storage outside executable paths.",
          "Protect write endpoints from CSRF where cookie sessions apply, and from replay with idempotency keys and nonces for sensitive actions. Rate limiting and bot defenses belong at the edge for public APIs. Account takeover defenses include MFA, device anomaly detection, and notification on risky changes.",
          "Threat modeling lightweight in interviews: name assets, attackers, entry points, and mitigations. You need not produce a full STRIDE essay; you must show that abuse was considered."
        ],
        "keyTerms": [
          {
            "term": "Parameterized query",
            "definition": "A database call that binds values separately from SQL text to prevent injection."
          },
          {
            "term": "CSRF",
            "definition": "Cross-site request forgery: tricking a browser into sending authenticated requests unintentionally."
          },
          {
            "term": "Rate limiting",
            "definition": "Restricting request velocity to reduce abuse and overload."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "For public write APIs, mention validation, authz, rate limits, and idempotency in one breath."
        },
        "checkYourself": [
          {
            "prompt": "Name three abuse controls for a public signup and posting API.",
            "reveal": "Rate limits and bot checks, input validation/encoding, and authz that prevents acting on other users' resources—plus spam and content safety as product requires."
          }
        ]
      },
      {
        "id": "tenancy-and-zero-trust",
        "heading": "Multi-tenant boundaries and zero-trust instincts",
        "paragraphs": [
          "Tenant isolation can be row-level, schema-level, or cluster-level depending on risk. Row-level is common and demands relentless query discipline and automated tests that attempt cross-tenant access. Noisy-neighbor and export controls may push stronger isolation for enterprise customers.",
          "Zero-trust instincts assume breach: authenticate every hop, authorize every action, encrypt in transit, and monitor anomalies. Internal networks are not magic safety. Service meshes and policy engines help but still need correct policies.",
          "Human operators need break-glass procedures with MFA, time-bounded access, and audits—not permanent god-mode credentials on laptops."
        ],
        "callout": {
          "tone": "tip",
          "body": "Add one automated cross-tenant access test for every new query path that accepts a resource ID."
        },
        "checkYourself": [
          {
            "prompt": "What is a common multi-tenant failure mode?",
            "reveal": "Trusting a client-supplied tenant ID or resource ID without verifying membership, leading to cross-tenant reads or writes."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Keep authentication and authorization separate and explicit on every sensitive path.",
        "Use short-lived scoped credentials, TLS, KMS-backed encryption, and minimized sensitive storage.",
        "Validate input, parameterize queries, rate-limit public writes, and audit privileged actions.",
        "Enforce tenant boundaries in the data path and assume internal networks are hostile."
      ],
      "nextSteps": [
        "Threat-model a password-reset flow including replay and account enumeration.",
        "Design service-to-service auth for checkout calling inventory and payments.",
        "Write three cross-tenant negative tests for a documents API."
      ]
    }
  },
  "security-and-operations/multi-region-disaster-recovery": {
    "title": "Multi-region design and disaster recovery",
    "readingTime": "80-100 min",
    "premise": "Multi-region architecture is a business decision about outage risk, latency, and data residency—not a default badge of seriousness. This chapter maps RTO/RPO to active-passive and active-active topologies, control-plane dependencies, and recovery as a practiced capability.",
    "parts": [
      {
        "id": "optimize-for-goals",
        "heading": "Know what you are optimizing for",
        "paragraphs": [
          "Teams pursue multi-region for lower user latency, higher availability through regional isolation, or regulatory data residency. Each motive implies different topologies. Latency needs bring reads and static assets closer; availability needs careful failover; residency may forbid leaving a geography even if latency suffers.",
          "RTO and RPO must be chosen before topology. If RPO is near zero, asynchronous cross-region replication alone is insufficient for failover without accepting loss. If RTO is minutes, DNS-only failover with cold capacity may be too slow. Write requirements down in product language: how much data loss and downtime finance will accept.",
          "Not every product needs active-active writes. Many succeed with active-passive: one region takes writes, another stands ready. Some only need robust backups and tested restores in a second region. Matching complexity to goals is senior judgment."
        ],
        "keyTerms": [
          {
            "term": "RTO",
            "definition": "Recovery time objective: how quickly service must return after disaster."
          },
          {
            "term": "RPO",
            "definition": "Recovery point objective: how much data loss is acceptable on recovery."
          },
          {
            "term": "Active-passive",
            "definition": "A topology where one region serves primary traffic while another stands by for failover."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State RTO/RPO first, then choose active-passive, active-active read, or active-active write."
        },
        "checkYourself": [
          {
            "prompt": "When is active-passive enough?",
            "reveal": "When the business can tolerate failover minutes and single-region write latency, and the main goal is surviving regional loss rather than global write locality."
          }
        ]
      },
      {
        "id": "topologies",
        "heading": "Replication topologies and write ownership",
        "paragraphs": [
          "Active-passive with cross-region async replicas is common: promote the secondary on disaster, accept RPO equal to replication lag, and keep most write logic simple. Active-active reads serve local read replicas while writes still go to a primary region—often a sweet spot.",
          "Active-active writes require per-region write ownership, conflict-free data models, or consensus spanning regions. Conflicts on shared records are expensive. Sticky users to a home region, shard by geography, or use CRDTs for special data types. Do not hand-wave global synchrony for strongly consistent balances.",
          "Stateless compute is easy to run everywhere; stateful systems dominate the difficulty. Separate the conversation for edge caches, app tiers, and databases."
        ],
        "keyTerms": [
          {
            "term": "Active-active",
            "definition": "Multiple regions simultaneously serving traffic; writes may be local or conflict-prone depending on design."
          },
          {
            "term": "Home region",
            "definition": "A sticky region assigned to a user or tenant for write ownership."
          },
          {
            "term": "Conflict resolution",
            "definition": "Rules for merging divergent writes when multi-master replication overlaps."
          }
        ],
        "workedExample": {
          "title": "Topology choice card",
          "body": "Narrate this card when interviewers ask for multi-region.",
          "code": "goal: survive region loss, RTO 15m, RPO 1m\n-> active-passive DB async + warm standby app tier\n\ngoal: low read latency global, strong writes\n-> regional read replicas + single write primary\n\ngoal: local writes worldwide for collaborative docs\n-> home-region ownership or CRDT/OT layer; expect complexity\n\ngoal: compliance residency\n-> pin data plane to region; careful about global control planes",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "Assuming multi-region automatically means active-active writes is a common interview mistake."
        },
        "checkYourself": [
          {
            "prompt": "Why can active-active writes be difficult for strong consistency?",
            "reveal": "Coordinating writes across distant regions adds latency or forces conflict resolution; strong single-copy semantics fight physics."
          }
        ]
      },
      {
        "id": "control-planes",
        "heading": "Control planes, DNS, and global dependencies",
        "paragraphs": [
          "Regional blast radii fail if a global control plane sits in the path of every request: a single identity provider, feature-flag store, or configuration service can take all regions down together. Replicate or cache critical control data; degrade when the global brain is unavailable.",
          "Traffic shifting uses DNS, anycast, global load balancers, or client-side region selection. Health checks must be deep enough to detect bad deploys, not only empty VMs. Failover automation needs guardrails against flapping and split brain across regions.",
          "Data residency complicates logging, support tooling, and analytics. Design so operational convenience does not quietly ship forbidden data abroad."
        ],
        "keyTerms": [
          {
            "term": "Blast radius",
            "definition": "The scope of users or systems impacted by a single failure."
          },
          {
            "term": "Global load balancing",
            "definition": "Steering clients to healthy regional endpoints based on health and policy."
          },
          {
            "term": "Control plane",
            "definition": "Systems that configure and coordinate data planes, dangerous if singly regional."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Name at least one global dependency and how the product behaves if it fails."
        },
        "checkYourself": [
          {
            "prompt": "How would you fail over user traffic during a regional outage?",
            "reveal": "Detect with deep health checks, shift DNS/GLB to the standby region, promote data stores per runbook, fence the failed region, and verify control-plane dependencies still work."
          }
        ]
      },
      {
        "id": "recovery-practiced",
        "heading": "Recovery is a practiced capability",
        "paragraphs": [
          "Backups, snapshots, infrastructure as code, and runbooks matter only if restore drills succeed under time pressure. Test restores into clean accounts regularly. Keep backups isolated from production credentials so ransomware or bad actors cannot delete both.",
          "Replication is not backup. Logical corruption replicates. Delayed replicas and immutable backup vaults provide rewind points. Measure restore time; that measurement is your real RTO evidence.",
          "Game days that sever a region, promote standbys, and complete customer journeys build confidence. Multi-region without drills is aspirational paperwork."
        ],
        "keyTerms": [
          {
            "term": "Restore drill",
            "definition": "A practiced exercise restoring data and service from backups or standbys."
          },
          {
            "term": "Delayed replica",
            "definition": "A replica intentionally lagging to preserve a window for recovery from logical errors."
          },
          {
            "term": "Immutable backup",
            "definition": "A backup copy that cannot be altered or deleted casually by production credentials."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Quote last successful restore duration in interviews when claiming an RTO number."
        },
        "checkYourself": [
          {
            "prompt": "Why can backups that have never been restored be false comfort?",
            "reveal": "Formats, permissions, encryption keys, and runbooks often fail only when first exercised; untested RTO/RPO claims are guesses."
          }
        ]
      },
      {
        "id": "cost-and-complexity",
        "heading": "Cost, complexity, and when to stop",
        "paragraphs": [
          "Multi-region multiplies capacity, egress, engineering time, and failure modes. Sometimes investing in better single-region resilience—faster failover within AZs, better backups, graceful degradation—beats a half-finished global fabric.",
          "Be honest about partial multi-region: static assets and reads global, writes single-homed. Many products land there for years.",
          "Close with goals, topology, data plane failover, control plane risks, and drill evidence. That package is complete."
        ],
        "callout": {
          "tone": "interview",
          "body": "It is valid to argue against full active-active if RTO/RPO do not require it—say why."
        },
        "checkYourself": [
          {
            "prompt": "What is a sane intermediate step before active-active writes?",
            "reveal": "Active-passive or active-active reads with a single write primary, plus tested regional failover and backups."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Choose multi-region based on explicit RTO/RPO, latency, and residency goals.",
        "Prefer active-passive or local reads before global active-active writes.",
        "Watch global control-plane dependencies and practice traffic+data failover.",
        "Treat restore drills and isolated backups as mandatory proof of recovery."
      ],
      "nextSteps": [
        "Pick RTO/RPO for a banking ledger versus a social feed and propose topologies.",
        "Diagram failover including DB promotion and DNS cutover.",
        "List three global dependencies that could sink all regions at once."
      ]
    }
  },
  "security-and-operations/fault-tolerance-and-graceful-degradation": {
    "title": "Fault tolerance and graceful degradation",
    "readingTime": "75-95 min",
    "premise": "Healthy systems keep the core user journey alive when dependencies fail by shedding optional work and falling back to simpler behavior. This chapter turns availability goals into degradable experiences, containment mechanisms, and tested fallback modes.",
    "parts": [
      {
        "id": "degradable-experiences",
        "heading": "Design degradable experiences",
        "paragraphs": [
          "Not every feature deserves the same availability target. Checkout, login, and content read paths often outrank recommendations, avatars, analytics beacons, and personalization. Separate must-have from enrichment in the architecture so failures can be isolated productively.",
          "Examples: show a catalog without recommendations; serve slightly stale feeds; switch to read-only account settings during storage incidents; queue noncritical notifications. Users prefer limited function over a blank error page when the core job still works.",
          "Define degradation explicitly with product partners. Silent wrong answers can be worse than errors—especially for prices and permissions. Prefer fail-safe defaults for security-sensitive checks."
        ],
        "keyTerms": [
          {
            "term": "Graceful degradation",
            "definition": "Preserving core functionality with reduced features when dependencies fail."
          },
          {
            "term": "Fail-closed",
            "definition": "Denying an action when a security dependency is unavailable."
          },
          {
            "term": "Fail-open",
            "definition": "Allowing reduced or cached behavior when a noncritical dependency is unavailable."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Name the minimal user journey that must survive and what you will shed first."
        },
        "checkYourself": [
          {
            "prompt": "What can degrade in a food-delivery app during an outage?",
            "reveal": "Recommendations, promotions, live ETA polish, and receipt emails can shed while search→cart→checkout→payment for core restaurants stays prioritized."
          }
        ]
      },
      {
        "id": "contain-failures",
        "heading": "Contain failures early",
        "paragraphs": [
          "Timeouts, bulkheads, circuit breakers, and bounded queues keep one unhealthy dependency from dragging everything down. Without them, thread pools block and unrelated endpoints die. Fail fast when a dependency is clearly unavailable and trigger fallbacks.",
          "Retry amplification is the enemy of containment; pair retries with budgets and idempotency as covered earlier. Hedged requests can help tail latency but must not melt a struggling dependency.",
          "Isolate blast radius by cell or shard architectures when scale demands: a bad deploy or hot partition hurts a slice of users rather than everyone."
        ],
        "keyTerms": [
          {
            "term": "Fault containment",
            "definition": "Preventing a local failure from cascading into a systemic outage."
          },
          {
            "term": "Cell architecture",
            "definition": "Partitioning users into independent blast-radius units with little shared fate."
          },
          {
            "term": "Fallback",
            "definition": "An alternate code path that provides reduced service when the primary path fails."
          }
        ],
        "workedExample": {
          "title": "Read-only mode for an account system",
          "body": "A concrete degradation mode for profile and settings during primary write outages.",
          "code": "trigger: primary DB write error rate high OR breaker open\nbehavior:\n  - allow GET profile from read replica/cache\n  - block PATCH/PUT with 503 + Retry-After + clear UX banner\n  - keep auth login if session store healthy; else fail closed securely\n  - disable password change and payout updates (fail closed)\n  - continue serving avatars from object storage/CDN\nexit: writes healthy for N minutes + manual or automatic clear",
          "language": "text"
        },
        "callout": {
          "tone": "tip",
          "body": "Security checks usually fail closed; decorative personalization usually fails open to cache or default."
        },
        "checkYourself": [
          {
            "prompt": "How would you design a read-only mode for an account system?",
            "reveal": "Serve reads from replicas/caches, reject mutating APIs with clear messaging, keep authz fail-closed for sensitive actions, and define automatic entry/exit conditions."
          }
        ]
      },
      {
        "id": "product-fallbacks",
        "heading": "Fallbacks that users understand",
        "paragraphs": [
          "Fallback UX should be honest: banners that features are limited beat silent emptiness. Cached values should be labeled when staleness matters. Client apps need offline or degraded modes that do not corrupt server state on reconnect—idempotency returns here.",
          "Feature flags enable manual shedding during incidents: turn off expensive ML ranking, disable live comments, reduce image quality. Flags need defaults that survive the flag service outage.",
          "Do not put low-priority dependencies on the critical path. Load analytics SDKs asynchronously; fetch recommendations out of band; treat third-party widgets as optional."
        ],
        "keyTerms": [
          {
            "term": "Feature flag",
            "definition": "A runtime switch to enable or disable behavior without redeploying."
          },
          {
            "term": "Critical path dependency",
            "definition": "A dependency whose failure directly blocks the core user journey."
          },
          {
            "term": "Manual shedding",
            "definition": "Operator-driven disablement of optional features during incidents."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A fallback that is never compiled into production paths will not save you during the incident."
        },
        "checkYourself": [
          {
            "prompt": "Why can graceful degradation be better than aggressive retries?",
            "reveal": "Retries can amplify load and lengthen outages; degradation preserves partial value while protecting core capacity."
          }
        ]
      },
      {
        "id": "test-degraded-mode",
        "heading": "Test the degraded mode",
        "paragraphs": [
          "Inject faults in staging and carefully in production: kill dependencies, add latency, return errors. Verify fallbacks activate, metrics fire, and UX remains intelligible. Track degraded-mode activation rate as a first-class signal.",
          "Chaos without observability is cruelty. Pair fault injection with traces and alerts. Runbooks should include when to force shed and when to restore.",
          "Fallback code rots. Schedule tests alongside game days. Treat degradation paths as production features with owners."
        ],
        "keyTerms": [
          {
            "term": "Fault injection",
            "definition": "Deliberately introducing errors or latency to validate resilience behavior."
          },
          {
            "term": "Game day",
            "definition": "A planned exercise practicing incident response and failover/degradation."
          },
          {
            "term": "Degradation metric",
            "definition": "A signal counting how often fallback modes activate."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say you would test fallbacks with fault injection, not only describe them."
        },
        "checkYourself": [
          {
            "prompt": "What happens if fallback logic is never exercised?",
            "reveal": "It bitrots—configs drift, credentials expire, and the first real outage discovers the fallback itself fails."
          }
        ]
      },
      {
        "id": "availability-honesty",
        "heading": "Be honest about availability math",
        "paragraphs": [
          "Claiming 100% for every feature is unbelievable. Partial availability with clear priorities is credible. Multiply dependency availabilities carefully: many critical synchronous dependencies make high nines hard without isolation and fallbacks.",
          "Error budgets connect degradation to release policy: burn too much, slow down changes. Resilience is both design and process.",
          "Summarize: prioritize journeys, isolate failures, fallback deliberately, test often."
        ],
        "callout": {
          "tone": "tip",
          "body": "If a dependency is optional, prove it by running without it in a test."
        },
        "checkYourself": [
          {
            "prompt": "Why avoid putting low-priority dependencies on the critical path?",
            "reveal": "Their failures and latency become user-facing outages for core flows that did not need them."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Separate must-have journeys from enrichments that can shed.",
        "Contain failures with timeouts, bulkheads, breakers, and bounded queues.",
        "Provide user-understandable fallbacks and manual feature shedding.",
        "Test degraded modes with fault injection so fallbacks do not rot."
      ],
      "nextSteps": [
        "Write a degradation ladder for a streaming video homepage.",
        "Design circuit-breaker thresholds for a payments dependency.",
        "Plan a game day that disables the recommendation service in production-like traffic."
      ]
    }
  },
  "security-and-operations/deployment-capacity-cost": {
    "title": "Deployments, capacity, and cost awareness",
    "readingTime": "75-95 min",
    "premise": "A design is incomplete if it only works in steady state. This chapter covers safe release mechanics, capacity headroom for bursts and failover, and the cost drivers that make architectures sustainable—or quietly unaffordable.",
    "parts": [
      {
        "id": "release-safely",
        "heading": "Release safely",
        "paragraphs": [
          "Rolling deploys gradually replace instances while keeping service available. Canaries expose a change to a small slice of traffic first and abort on regressing SLIs. Blue-green keeps two environments and switches traffic when ready. Feature flags decouple deploy from release so code can land dark and enable progressively.",
          "Drain connections before terminating nodes; respect in-flight requests and queue consumers. Health checks should fail instances out of balancers before kill. Rollback plans must be real: previous artifacts, reverse flags, and database compatibility.",
          "Schema migrations need expand-and-contract discipline across mixed-version fleets: additive changes first, dual-write or dual-read as needed, then remove old fields after code no longer depends on them. Breaking migrations during rolling deploys cause partial outages."
        ],
        "keyTerms": [
          {
            "term": "Canary release",
            "definition": "Shipping a change to a small traffic fraction while monitoring SLIs before wider rollout."
          },
          {
            "term": "Feature flag",
            "definition": "A runtime switch separating deployment of code from enabling a behavior."
          },
          {
            "term": "Expand-and-contract",
            "definition": "A migration pattern that adds new schema first and removes old schema only after all readers/writers are upgraded."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Name a release strategy, rollback, and schema compatibility story for risky changes."
        },
        "checkYourself": [
          {
            "prompt": "How would you deploy a risky ranking change safely?",
            "reveal": "Ship behind a flag, canary to a small cohort, watch ranking quality and latency SLIs, ramp gradually, and roll back by flag without waiting for a full redeploy."
          }
        ]
      },
      {
        "id": "capacity-headroom",
        "heading": "Plan headroom and autoscaling",
        "paragraphs": [
          "Capacity planning must cover growth, daily/weekly peaks, deploy overlap (old+new versions), and failover absorption when a region or AZ disappears. Sizing only for averages guarantees pain at the worst time.",
          "Autoscaling should react to saturation signals that precede user pain: concurrency, queue lag, disk IOPS, heap pressure—not only CPU after users already wait. Cool-downs and max ceilings prevent thrash and runaway cost. Warm pools reduce cold-start latency for sudden spikes.",
          "Load tests and shadow traffic validate models. Include cache-cold and dependency-slow scenarios. Headroom targets like 30–50% spare for critical tiers are common starting heuristics, then refined by data."
        ],
        "keyTerms": [
          {
            "term": "Headroom",
            "definition": "Spare capacity reserved for spikes, deploys, and failover."
          },
          {
            "term": "Autoscaling signal",
            "definition": "The metric that triggers adding or removing capacity."
          },
          {
            "term": "N+1 / N+2 capacity",
            "definition": "Running enough spare that losing one or two units still meets load."
          }
        ],
        "workedExample": {
          "title": "Failover capacity sketch",
          "body": "Why failover scenarios change capacity math.",
          "code": "steady state: 2 regions, each at 40% of its local compute for regional users\nregion A fails: region B receives ~2x traffic if sticky users shift\nif B was at 40% with no headroom policy, 80% may still work;\nif B was at 70%, failover saturates -> need reserved capacity or graceful shed\nalso account for: cache cold start, DB primary promotion CPU, deploy overlap",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "Autoscaling that only watches CPU often scales too late for latency-sensitive services."
        },
        "checkYourself": [
          {
            "prompt": "Why do failover scenarios affect capacity planning?",
            "reveal": "Surviving regions or zones must absorb shifted traffic plus recovery work; without reserved headroom they collapse during the incident they were meant to survive."
          }
        ]
      },
      {
        "id": "cost-tradeoffs",
        "heading": "Cost is part of the architecture trade-off",
        "paragraphs": [
          "Major cost drivers include always-on compute, cross-region egress, multi-AZ replication, storage class and retention, chatty APIs, and idle overprovisioned headroom. The cheapest diagram on paper can be the most expensive once egress and duplicate stateful systems appear.",
          "Caches and CDNs often buy both latency and egress savings. Object storage tiers and lifecycle policies cut cold data cost. Batch and spot capacity can move flexible workloads off premium always-on fleets. Right-sizing beats endless horizontal scale of wasteful queries.",
          "People cost is real: every new datastore, language, and deploy pipeline taxes the team. Simpler architectures that meet SLOs are economically rational, not merely aesthetic."
        ],
        "keyTerms": [
          {
            "term": "Egress cost",
            "definition": "Charges for data leaving a network boundary, often dominant in multi-region designs."
          },
          {
            "term": "Unit cost",
            "definition": "Cost per user action or request used to compare architecture options."
          },
          {
            "term": "Lifecycle policy",
            "definition": "Automated transition of data across storage tiers or deletion as it ages."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Call out egress, replica count, and idle headroom when discussing global designs."
        },
        "checkYourself": [
          {
            "prompt": "What are the biggest hidden costs in a globally distributed system?",
            "reveal": "Cross-region egress, duplicated stateful capacity, complex operational labor, and overprovisioned headroom that sits idle outside failovers."
          }
        ]
      },
      {
        "id": "finops-feedback",
        "heading": "Connect cost to observability and product decisions",
        "paragraphs": [
          "Track unit cost beside SLIs: cost per checkout, per streaming hour, per AI inference. Unexpected cost regressions deserve the same curiosity as latency regressions. Tag resources by service and environment for attribution.",
          "Product choices drive cost: unbounded retention, high-resolution media defaults, chatty mobile refresh intervals. Architecture reviews should surface those levers to product owners.",
          "Optimization without SLOs creates brittle systems. Spend where error budgets and user value demand; save where enrichment features overspend."
        ],
        "keyTerms": [
          {
            "term": "Unit economics",
            "definition": "Relating infrastructure spend to product usage metrics."
          },
          {
            "term": "Cost attribution",
            "definition": "Mapping cloud spend to owning services and features."
          },
          {
            "term": "Efficiency regression",
            "definition": "A change that preserves features but worsens cost per unit work."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Put cost per critical journey on the same dashboard family as latency and errors."
        },
        "checkYourself": [
          {
            "prompt": "Why might caching be both a latency and a cost feature?",
            "reveal": "It reduces origin compute and often egress/bandwidth, so fewer repeated fetches translate into lower bills as well as faster responses."
          }
        ]
      },
      {
        "id": "closing-the-ops-story",
        "heading": "Close the operations story in interviews",
        "paragraphs": [
          "A complete design mentions how you ship (canary/flags), how you size (peaks+failover headroom), how you see problems (SLIs), and what it costs at rough order of magnitude. You need not calculate exact invoices; you must show economic awareness.",
          "Prefer boring technology that the team can deploy safely. Novelty has a tax paid at 3 a.m.",
          "Tie back to resilience: safe deploys and spare capacity are fault tolerance in everyday clothing."
        ],
        "callout": {
          "tone": "interview",
          "body": "End capacity answers with how much spare you keep for the largest failure you claim to survive."
        },
        "checkYourself": [
          {
            "prompt": "What makes a deployment story incomplete?",
            "reveal": "Missing rollback, schema compatibility across mixed versions, or metrics that would abort a canary."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Use progressive delivery, flags, and expand-and-contract migrations for safe change.",
        "Size for peaks, deploy overlap, and failover absorption—not averages alone.",
        "Treat egress, replicas, idle headroom, and people cost as first-class design inputs.",
        "Track unit cost next to SLIs so efficiency regressions are visible."
      ],
      "nextSteps": [
        "Write a canary abort policy for a checkout service.",
        "Estimate headroom needed if one of three AZs fails at peak.",
        "List cost levers for a multi-region media platform and which you would pull first."
      ]
    }
  }
};
