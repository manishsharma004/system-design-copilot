/** Deep knowledge essays for exhaustive HLD labs.
 * Source of truth: scripts/hld_lab_content.py — regenerate with
 * `python3 scripts/build_hld_exhaustive_labs.py`.
 */
const teachingBody = (...paragraphs) => paragraphs.join('\n\n');

function revive(entry) {
  return {
    insights: entry.insights.map((insight) => ({
      heading: insight.heading,
      body: teachingBody(...insight.bodyParagraphs)
    })),
    references: entry.references
  };
}

const raw = {
  "data-storage-lab/indexing-and-query-path-design": {
    "insights": [
      {
        "heading": "Indexes are physical contracts",
        "bodyParagraphs": [
          "An index is not just a performance hint. It is a physical contract between the storage engine and the request path. Once an endpoint depends on that contract, key order, clustering behavior, and cardinality shape become long-lived product assumptions. Teams that treat indexes as infinitely malleable often underestimate how much write cost and migration risk accumulates around them.",
          "This is why senior storage reviews ask which endpoint or background consumer truly owns the index budget. If no caller is important enough to justify the index, the structure is probably cargo cult. If a caller is important enough, then the team should also state what query shapes are intentionally unsupported and what alternate path handles them."
        ]
      },
      {
        "heading": "Query shape discipline beats planner heroics",
        "bodyParagraphs": [
          "Database planners are impressive, but they cannot rescue arbitrary product flexibility at scale. Once many optional predicates and sorts coexist, the planner's job becomes a losing optimization problem because the engine no longer has a small set of dominant access paths to exploit.",
          "Constrain the request shape at the API boundary and the database remains predictable. Leave it unconstrained and eventually someone builds a dashboard query that looks legal to the API but catastrophically expensive to the storage layer. Strong architecture sets those boundaries earlier than incident response would prefer."
        ]
      },
      {
        "heading": "Pagination and indexing are the same conversation",
        "bodyParagraphs": [
          "Offset pagination hides a read-amplification problem by making deeper pages progressively more expensive. Cursor pagination aligned with index order keeps the request shape stable as the dataset grows, which is why mature API designs usually discuss cursor tokens alongside their composite indexes.",
          "This also improves correctness under concurrent writes. A cursor anchored on ordered keys behaves more deterministically than an offset in a rapidly mutating table. The storage win and the product win are tightly connected, so they should be defended together."
        ]
      },
      {
        "heading": "Index rollouts are migration events",
        "bodyParagraphs": [
          "Large live index changes consume the same kinds of scarce resources as many application migrations: CPU, I/O, replication bandwidth, and operator attention. Treating them as harmless DDL is one reason teams are surprised by replica lag and write regressions after what looked like a routine schema tweak.",
          "Experienced teams add rollout checkpoints, observe write-path cost explicitly, and delete obsolete structures later. The index lifecycle matters almost as much as the index design itself because write amplification from stale indexes can quietly become a permanent tax."
        ]
      }
    ],
    "references": [
      {
        "title": "PostgreSQL Indexes",
        "url": "https://www.postgresql.org/docs/current/indexes.html",
        "source": "PostgreSQL Documentation",
        "note": "Practical grounding for how relational indexes work and when different structures matter."
      },
      {
        "title": "Use The Index, Luke!",
        "url": "https://use-the-index-luke.com/",
        "source": "Use The Index, Luke!",
        "note": "Clear explanations of query plans, pagination, and composite-index behavior."
      },
      {
        "title": "Amazon Builders' Library: Using load shedding to avoid overload",
        "url": "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/",
        "source": "Amazon Builders' Library",
        "note": "Useful companion reading on constraining work before the storage layer is overwhelmed."
      }
    ]
  },
  "data-storage-lab/replication-sharding-and-consistency": {
    "insights": [
      {
        "heading": "Freshness is a product budget",
        "bodyParagraphs": [
          "Replica lag becomes manageable when it is turned into a product budget instead of a surprise. If a page tolerates seconds of staleness, follower reads are easy to justify. If a path confirms a just-completed write, even tens of milliseconds may be too much unless routing stays authoritative.",
          "The important shift is to make that freshness window explicit per workflow. Doing so transforms consistency from vague philosophy into an engineering contract with routing consequences, dashboard implications, and user-experience copy when the budget cannot be met."
        ]
      },
      {
        "heading": "Shard keys encode future migrations",
        "bodyParagraphs": [
          "Choosing a partition key is not just about today's throughput. It decides which records move together, which failures stay local, and how painful the first major rebalancing event will be. A key that aligns poorly with future success cases can lock the system into expensive scatter-gather behavior or repeated hotspot isolation work.",
          "That is why good designs preserve some routing indirection. The external identifier should stay stable while the underlying placement can evolve. This is not free, but it is often the difference between manageable growth and emergency redesign."
        ]
      },
      {
        "heading": "Failover quality is judged after promotion",
        "bodyParagraphs": [
          "A failover that merely flips a leader flag is only half successful. Customers care whether recent writes are preserved, whether survivors stay responsive, and whether read paths are still coherent after promotion. Repair pressure and replay traffic often dominate the real incident cost after the initial switch.",
          "Systems that rehearse promotion safety, throttle catch-up, and design client rediscovery intentionally tend to recover with more dignity. The post-failover operating window is where architectural maturity becomes visible."
        ]
      },
      {
        "heading": "Consistency language must stay user visible",
        "bodyParagraphs": [
          "It is easy to say eventual or strong consistency and still leave everyone confused. Better design language describes what the user sees after a concrete action: a confirmed reservation appears immediately, a leaderboard can lag by thirty seconds, a cross-region count may be approximate for a short window.",
          "That style of explanation keeps infrastructure choices honest. If the user-facing statement sounds unacceptable, the consistency model is probably wrong for that workflow no matter how elegant the topology looks."
        ]
      }
    ],
    "references": [
      {
        "title": "Designing Data-Intensive Applications",
        "url": "https://dataintensive.net/",
        "source": "Martin Kleppmann",
        "note": "Authoritative background on replication, partitioning, and consistency trade-offs."
      },
      {
        "title": "Spanner: Google's Globally Distributed Database",
        "url": "https://research.google/pubs/pub39966/",
        "source": "Google Research",
        "note": "Useful reference for globally coordinated consistency and its costs."
      },
      {
        "title": "Jepsen Analyses",
        "url": "https://jepsen.io/analyses",
        "source": "Jepsen",
        "note": "Operationally grounded reminders that consistency claims should be tested under failure."
      }
    ]
  },
  "data-storage-lab/polyglot-storage-selection": {
    "insights": [
      {
        "heading": "Authority boundaries simplify incidents",
        "bodyParagraphs": [
          "When one system clearly owns a business fact, incident response can ask which projections are stale instead of which truth to believe. That clarity is the biggest hidden benefit of disciplined polyglot persistence. It turns recovery from philosophical debate into concrete replay and rebuild work.",
          "The opposite is also true. If search, cache, and primary tables each partially own the same domain meaning, operators will spend outages arguing about which state should win. Clear authority is therefore both a design and an operations accelerant."
        ]
      },
      {
        "heading": "Derived systems deserve product honesty",
        "bodyParagraphs": [
          "Derived indexes and caches create tremendous user value, but only when the product is honest about their freshness and recovery behavior. Search results may lag a profile edit. Analytics counts may arrive minutes later. Media thumbnails may rebuild after corruption. These are acceptable when made explicit and unacceptable when hidden as implied immediate truth.",
          "The design implication is that derivative systems should come with user-facing expectations, rebuild paths, and operator dashboards from the start. A derived store without those contracts eventually surprises both users and engineers."
        ]
      },
      {
        "heading": "The smallest portfolio compounds fastest",
        "bodyParagraphs": [
          "Every extra datastore multiplies tools, backups, IAM, testing, and on-call knowledge. The cost curve is nonlinear because data movement paths add failure matrices between systems. That is why strong platform teams often defer a specialist engine until one access pattern becomes impossible to serve gracefully without it.",
          "Specialization remains valuable, but the bar should be real workload pain or clear product leverage. Polyglot persistence is strongest when it expresses necessity, not enthusiasm."
        ]
      },
      {
        "heading": "Exit cost is part of selection quality",
        "bodyParagraphs": [
          "A datastore decision is easier to justify when the architecture already hints at how it could be replaced later. If replay, backfill, and parity validation are impossible, adoption risk is higher than the steady-state diagram suggests.",
          "Experienced engineers therefore evaluate new storage systems with both entrance and exit criteria. The operational skill is not merely launching the new path, but also preserving the ability to leave it without stopping the product."
        ]
      }
    ],
    "references": [
      {
        "title": "Martin Fowler: Polyglot Persistence",
        "url": "https://martinfowler.com/bliki/PolyglotPersistence.html",
        "source": "Martin Fowler",
        "note": "Classic framing for why different data models coexist in one system."
      },
      {
        "title": "Amazon DynamoDB Design Patterns",
        "url": "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html",
        "source": "AWS Documentation",
        "note": "Helpful reference on access-pattern-driven NoSQL modeling."
      },
      {
        "title": "Elasticsearch Reference",
        "url": "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html",
        "source": "Elastic Documentation",
        "note": "Useful grounding on what a search engine is actually optimized to do versus a primary OLTP store."
      }
    ]
  },
  "security-operations-lab/auth-threat-modeling-for-hld": {
    "insights": [
      {
        "heading": "Identity recovery is part of the attack surface",
        "bodyParagraphs": [
          "Systems often invest heavily in primary login paths while leaving password reset, invite acceptance, email change, or support impersonation comparatively underdesigned. Attackers notice. These secondary flows can bypass otherwise excellent session and token practices if the architecture does not treat them as privileged workflows.",
          "Threat modeling those paths first often yields better architectural returns than polishing generic auth diagrams. The controls become tangible: one-time semantics, stronger audit, abuse throttling, and explicit operator review boundaries."
        ]
      },
      {
        "heading": "Authorization wants domain context",
        "bodyParagraphs": [
          "Centralized token validation is useful, but meaningful authorization usually needs resource and tenant context known best by the application domain. A gateway can confirm the caller is who they claim to be and maybe enforce coarse scopes, yet the service often knows whether a given invoice, project, or account actually belongs to that tenant and action.",
          "This is why strong architectures mix centralized identity mechanisms with locally visible authorization checks. The result is more explainable than a giant edge policy blob and safer than assuming identity proof equals blanket permission."
        ]
      },
      {
        "heading": "Abuse and reliability overlap",
        "bodyParagraphs": [
          "Credential stuffing, replay, and enumeration can become availability incidents as much as security incidents. Rate limiting, deduplication, and suspicious-activity telemetry therefore serve both reliability and security goals. The infrastructure burden of abuse deserves the same architectural seriousness as ordinary product traffic.",
          "Teams that separate those conversations too rigidly often miss high-leverage controls. Protecting login and recovery endpoints well can reduce both fraud exposure and fleet saturation under attack."
        ]
      },
      {
        "heading": "Operator paths deserve first-class design",
        "bodyParagraphs": [
          "Support tools and break-glass paths are not embarrassing exceptions to the real architecture. They are often the most dangerous paths in the system because they deliberately bypass normal user constraints for legitimate operational reasons.",
          "Designing them explicitly with stronger identity, approval, and audit semantics keeps them accountable. Ignoring them until a crisis guarantees improvised privilege later."
        ]
      }
    ],
    "references": [
      {
        "title": "OWASP ASVS",
        "url": "https://owasp.org/www-project-application-security-verification-standard/",
        "source": "OWASP",
        "note": "Widely used security-control framework that helps anchor auth and authorization design depth."
      },
      {
        "title": "OWASP Threat Modeling Cheat Sheet",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html",
        "source": "OWASP Cheat Sheet Series",
        "note": "Practical guide for converting abstract threats into concrete design review questions."
      },
      {
        "title": "NIST Digital Identity Guidelines",
        "url": "https://pages.nist.gov/800-63-3/",
        "source": "NIST",
        "note": "Authoritative reference for identity, authentication, and lifecycle controls."
      }
    ]
  },
  "security-operations-lab/encryption-secrets-and-tenancy": {
    "insights": [
      {
        "heading": "Encryption is only useful relative to the attacker model",
        "bodyParagraphs": [
          "Encrypted at rest can protect against one class of media or infrastructure compromise while doing little against an overprivileged application or operator path. That does not make the control useless; it means the architecture must match cryptographic controls to the likely compromise path.",
          "This is why data classification and access-path analysis come first. Teams should know whether they are defending against disk theft, snapshot leakage, compromised app code, operator overreach, or tenant cross-talk, because each scenario changes which layer matters most."
        ]
      },
      {
        "heading": "Secrets have renewal behavior",
        "bodyParagraphs": [
          "The hard part of secret handling is often not storage but renewal. A service fleet that cannot refresh credentials gracefully turns every rotation into a redeploy or outage risk. A platform that cannot partition partner secrets cleanly turns one integration compromise into a multi-tenant event.",
          "Thinking about renewal early improves design quality. Which process fetches the secret, how does it notice a version change, what happens to open connections, and what audit event proves the access all become explicit instead of emergent."
        ]
      },
      {
        "heading": "Tenant isolation is a systems property",
        "bodyParagraphs": [
          "Multi-tenant safety is degraded whenever any layer forgets the tenant boundary, whether that layer is the cache, the worker, the analytics projection, or the admin export path. Database constraints help, but they are not sufficient on their own once derived data paths appear.",
          "Defense in depth therefore matters more than slogans. Architecture should deliberately repeat the tenant dimension where state is transformed or cached so one missing check is less likely to become a customer-visible leak."
        ]
      },
      {
        "heading": "Privilege for read is not identical to privilege for decrypt",
        "bodyParagraphs": [
          "Separating read, decrypt, and bulk-export privileges can dramatically shrink blast radius and simplify reviews. A support system may need to view metadata but not decrypt sensitive payloads. A batch job may need to process encrypted objects via envelope operations without exposing plaintext to humans.",
          "These distinctions are worth modeling because they create more meaningful audit trails and clearer incident stories. Overly broad decrypt permission is one of the easiest paths to invisible overexposure."
        ]
      }
    ],
    "references": [
      {
        "title": "Envelope Encryption",
        "url": "https://cloud.google.com/kms/docs/envelope-encryption",
        "source": "Google Cloud Documentation",
        "note": "Clear explanation of practical envelope-encryption architecture and why key hierarchies matter."
      },
      {
        "title": "OWASP Secrets Management Cheat Sheet",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html",
        "source": "OWASP Cheat Sheet Series",
        "note": "Useful operational guidance on rotation, retrieval, and secret hygiene."
      },
      {
        "title": "PostgreSQL Row Security Policies",
        "url": "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
        "source": "PostgreSQL Documentation",
        "note": "Concrete reference for one common database-level tenant-isolation mechanism."
      }
    ]
  },
  "security-operations-lab/safe-change-dr-and-degradation": {
    "insights": [
      {
        "heading": "Compatibility is the hidden enabler of safe rollout",
        "bodyParagraphs": [
          "Traffic shifting tools are only as good as the compatibility surface beneath them. If schemas, events, or APIs cannot overlap safely, canarying becomes a false comfort because the system still depends on lockstep change underneath.",
          "Architectures that value safe change therefore bias toward additive contracts and reversible movement. Progressive delivery is most effective when the data model cooperates with it."
        ]
      },
      {
        "heading": "Recovery objectives convert resilience from taste into math",
        "bodyParagraphs": [
          "RTO and RPO force architecture to acknowledge what the business is actually buying. Without them, teams either gold-plate multi-region designs or underprepare restore paths because no one has stated how much outage or data loss is acceptable.",
          "Those objectives also help trade-offs during incident design. Slower safer failover, faster potentially lossy promotion, or backup restore can each be appropriate under different business promises."
        ]
      },
      {
        "heading": "Graceful degradation is a product feature",
        "bodyParagraphs": [
          "Fallback behavior is experienced by users, not just by SRE dashboards. If the degraded experience is confusing, inconsistent, or silent, then the system may technically stay up while user trust still collapses.",
          "This is why strong HLD answers describe what the screen or API does under partial failure. A stale banner, a read-only state, or hidden enrichment is far more meaningful than the phrase graceful degradation alone."
        ]
      },
      {
        "heading": "Runbooks are architecture memory",
        "bodyParagraphs": [
          "Recovery plans decay unless they are encoded into runbooks, drills, and dashboards that outlive the individuals who first designed them. Architecture that depends on heroic tribal knowledge is fragile even if the topology is sound.",
          "Treating runbooks as part of system design ensures that failover, rollback, and re-entry paths remain shareable, reviewable, and testable across time."
        ]
      }
    ],
    "references": [
      {
        "title": "Google SRE Book: Addressing Cascading Failures",
        "url": "https://sre.google/sre-book/addressing-cascading-failures/",
        "source": "Google SRE Book",
        "note": "Helpful reference for overload, defensive controls, and preserving useful work."
      },
      {
        "title": "AWS Well-Architected Reliability Pillar",
        "url": "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html",
        "source": "AWS Documentation",
        "note": "Broad reference on recovery, change management, and fault isolation."
      },
      {
        "title": "Feature Toggles",
        "url": "https://martinfowler.com/articles/feature-toggles.html",
        "source": "Martin Fowler",
        "note": "Useful framework for understanding rollout, ops, and experiment flags as distinct controls."
      }
    ]
  },
  "distributed-systems-lab/partitioning-and-hot-key-control": {
    "insights": [
      {
        "heading": "Uniformity assumptions are architectural debt",
        "bodyParagraphs": [
          "Synthetic tests often spread keys evenly, but production behavior clusters around people, products, regions, and time. Designs that assume fairness from the workload end up paying for that assumption later through emergency caching, isolation, and queueing work.",
          "Modeling skew early is therefore a form of debt prevention. It pushes engineers to choose keys, metrics, and fallback controls that survive success rather than only surviving average load."
        ]
      },
      {
        "heading": "Read hotspots and write hotspots are different physics",
        "bodyParagraphs": [
          "Read hotspots usually amplify repeated work and are therefore susceptible to caching, replication, and coalescing. Write hotspots are about contention on a single authority boundary and often require serialization, batching, or altered product semantics instead.",
          "Confusing the two leads teams to apply the wrong mitigation. More caches do little for an oversubscribed single-writer record. More shards do little if one object remains the singular point of contention."
        ]
      },
      {
        "heading": "Rebalancing is a migration, not a toggle",
        "bodyParagraphs": [
          "Moving ownership shifts data, cache locality, repair work, and operational confidence simultaneously. Even with consistent hashing or virtual nodes, the system must manage transfer pace and destination warmup carefully.",
          "Experienced operators therefore treat rebalancing with the same caution they apply to schema or traffic migrations. The move itself can be as risky as the problem it intends to solve."
        ]
      },
      {
        "heading": "Skew metrics should shape product policy",
        "bodyParagraphs": [
          "Hotspot visibility often reveals that certain tenants or features consume infrastructure disproportionately. Architecture alone is not always the best or cheapest response. Tiering, quotas, and feature redesign can be just as important as technical mitigation.",
          "Seeing partitioning as a business-input loop as well as a routing problem helps teams avoid endless infrastructure escalation for a workload the product could reshape more intelligently."
        ]
      }
    ],
    "references": [
      {
        "title": "Amazon Dynamo: Highly Available Key-value Store",
        "url": "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf",
        "source": "Amazon",
        "note": "Foundational paper on partitioned ownership, consistent hashing, and failure trade-offs."
      },
      {
        "title": "The Log: What every software engineer should know about real-time data's unifying abstraction",
        "url": "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying",
        "source": "LinkedIn Engineering",
        "note": "Helpful for thinking about partitioned streams, ordered ownership, and movement costs."
      },
      {
        "title": "Caching at Scale",
        "url": "https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/caching/README.md",
        "source": "System Design Primer",
        "note": "Good supporting reading on cache behavior and hotspot mitigation patterns."
      }
    ]
  },
  "distributed-systems-lab/consensus-quorums-and-leadership": {
    "insights": [
      {
        "heading": "Consensus scope discipline preserves scalability",
        "bodyParagraphs": [
          "The most scalable use of consensus is usually the most boring one: narrow control-plane truth for metadata or leadership that the rest of the system can cache and exploit locally. Problems begin when engineers see consensus as a universal correctness solvent and start routing ordinary product actions through it unnecessarily.",
          "The result is often a system that is technically correct and practically slower, costlier, and harder to evolve. Scope discipline is what keeps coordinated safety and everyday throughput compatible."
        ]
      },
      {
        "heading": "Stale leaders are the real antagonist",
        "bodyParagraphs": [
          "Leader election feels dramatic, but many failures are caused not by choosing a new leader but by an old one that does not realize it should stop. This is why epochs, fences, and leases are so central. They encode the negative side of leadership: who no longer has authority.",
          "Any HLD explanation of leadership becomes much more convincing the moment it explains how stale ownership is rejected, not merely how fresh ownership is announced."
        ]
      },
      {
        "heading": "Quorum trade-offs are user trade-offs",
        "bodyParagraphs": [
          "Higher quorums can improve overlap and confidence, but they also increase coordination latency and sensitivity to slow replicas. Lower quorums can preserve responsiveness, but they enlarge repair and staleness windows. That balance should be explained in the same language as the product's expectations.",
          "Doing so keeps the design grounded. Engineers and interviewers alike can ask whether the user's experience justifies the cost instead of hiding the decision behind mathematical elegance."
        ]
      },
      {
        "heading": "Clients need ownership semantics too",
        "bodyParagraphs": [
          "Distributed-systems safety is incomplete until clients know what to do when ownership changes. Redirects, retriable errors, fenced-term failures, and metadata refresh rules are all part of the architecture because they decide whether a coordination event looks like a quick retry or like chaotic unavailability.",
          "Caller semantics also shape observability. If stale-term errors are expected but rare, they deserve explicit dashboards and alerts rather than being buried in generic failure noise."
        ]
      }
    ],
    "references": [
      {
        "title": "In Search of an Understandable Consensus Algorithm (Raft)",
        "url": "https://raft.github.io/raft.pdf",
        "source": "Raft Paper",
        "note": "Accessible consensus reference with strong grounding in leadership and terms."
      },
      {
        "title": "ZooKeeper: Wait-free coordination for Internet-scale systems",
        "url": "https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf",
        "source": "USENIX",
        "note": "Classic coordination-system paper useful for control-plane design intuition."
      },
      {
        "title": "Martin Kleppmann on Fencing Tokens",
        "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
        "source": "Martin Kleppmann",
        "note": "Helpful discussion of leases, stale ownership, and why tokens matter."
      }
    ]
  },
  "distributed-systems-lab/sagas-idempotency-and-workflows": {
    "insights": [
      {
        "heading": "Workflow truth should outlive transport truth",
        "bodyParagraphs": [
          "Messages, HTTP responses, and provider callbacks can all be lost, duplicated, or delayed. A durable workflow record is what lets the system preserve business intent despite those transport ambiguities. Without it, recovery relies on correlating logs and hoping side effects lined up the way engineers imagined.",
          "This is why sophisticated distributed workflows elevate state machines or equivalent durable progress records. The workflow becomes a first-class domain object rather than a hidden side effect of network success."
        ]
      },
      {
        "heading": "Idempotency is part of the product contract",
        "bodyParagraphs": [
          "Clients need to know whether retrying the same command is safe and what result they should expect if the first attempt actually succeeded. Stable keys and replayed prior results are therefore as much a caller experience choice as an implementation detail.",
          "The cleaner the idempotency contract, the less custom retry logic clients invent for themselves. That reduces accidental duplicate work throughout the stack."
        ]
      },
      {
        "heading": "Compensation is often asymmetric",
        "bodyParagraphs": [
          "Real workflows rarely roll backward in a perfectly mirrored way. A held seat can be released. A card authorization can be voided if timing permits. A shipped package may require a return, not an undo. Architecture that recognizes this asymmetry is more honest and usually safer.",
          "This is why operator review remains important even in automated workflow systems. Some business reversals are decisions, not technical reversions."
        ]
      },
      {
        "heading": "Reconciliation keeps workflows trustworthy over time",
        "bodyParagraphs": [
          "Eventually some workflow step will complete after a timeout, or a downstream projector will miss one event, or a compensation will partially apply. Reconciliation jobs and dashboards are what convert those edge cases from invisible corruption into repairable discrepancies.",
          "Treating reconciliation as a first-class architecture component keeps long-running distributed systems trustworthy even when perfect transport or timing guarantees do not exist."
        ]
      }
    ],
    "references": [
      {
        "title": "Microservices.io: Saga Pattern",
        "url": "https://microservices.io/patterns/data/saga.html",
        "source": "microservices.io",
        "note": "Clear conceptual reference for orchestrated and choreographed saga patterns."
      },
      {
        "title": "Microservices.io: Transactional Outbox",
        "url": "https://microservices.io/patterns/data/transactional-outbox.html",
        "source": "microservices.io",
        "note": "Practical grounding for bridging local transactions to asynchronous delivery."
      },
      {
        "title": "Stripe Idempotent Requests",
        "url": "https://stripe.com/docs/api/idempotent_requests",
        "source": "Stripe Documentation",
        "note": "Excellent real-world reference for caller-visible idempotency contracts."
      }
    ]
  }
};

/** @type {Record<string, any>} */
export const hldExhaustiveLabDeepKnowledge = Object.fromEntries(
  Object.entries(raw).map(([id, entry]) => [id, revive(entry)])
);
