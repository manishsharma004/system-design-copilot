/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldDataStorageChapters = {
  "data-storage/relational-data-modeling": {
    "title": "Relational data modeling and indexing",
    "readingTime": "75-95 min",
    "premise": "Relational databases remain the default answer for systems that must enforce multi-row invariants, support flexible ad hoc queries, and operate with mature tooling. This chapter builds an interview-ready model of schemas, indexes, transactions, and deliberate denormalization so you can defend a relational design before reaching for specialized stores.",
    "parts": [
      {
        "id": "why-relational-still-wins",
        "heading": "Why relational databases remain the default",
        "paragraphs": [
          "A relational database stores facts in tables whose columns have declared types and whose rows are identified by keys. Constraints turn product rules into storage rules: a primary key prevents duplicate identities, a unique constraint protects natural keys such as email, and foreign keys keep relationships from dangling. Transactions then let several row changes succeed or fail together, which is how checkout, inventory reservation, and ledger posting stay coherent under concurrent clients.",
          "The relational model also separates how data is stored from how it is queried. Joins, filters, aggregates, and secondary indexes let one schema serve many access paths without inventing a new collection for every screen. That flexibility is why interviews often start with entities and relationships for payments, marketplaces, or SaaS tenancy before discussing scale-out. Specialized stores can still win later, but they usually win because a measured access pattern outgrew relational convenience, not because SQL was theoretically insufficient.",
          "Operational maturity matters as much as theory. Connection pooling, vacuum behavior, backup tooling, point-in-time recovery, explain plans, and decades of operator knowledge reduce the risk of choosing Postgres, MySQL, or a managed equivalent. In a design interview, naming that operational surface area shows you are selecting a system the team can run, not only a data structure that fits a whiteboard."
        ],
        "keyTerms": [
          {
            "term": "Invariant",
            "definition": "A product rule that must remain true across related rows, such as never overselling inventory or never posting an unbalanced ledger entry."
          },
          {
            "term": "ACID transaction",
            "definition": "A unit of work with atomicity, consistency, isolation, and durability guarantees that keep multi-step writes coherent under concurrency and failure."
          },
          {
            "term": "Declarative schema",
            "definition": "An explicit description of tables, types, keys, and constraints that the database enforces rather than leaving to application hope."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Open with entities, relationships, and invariants. Mention indexes and transaction boundaries next. Only then justify leaving the relational default."
        },
        "checkYourself": [
          {
            "prompt": "When is a relational store still the right answer even if traffic is high?",
            "reveal": "When correctness depends on multi-row invariants, flexible querying, or mature operational tooling, and the working set still fits a tunable primary plus replicas. High traffic alone does not require NoSQL if partitioning, caching, and read replicas can absorb the load."
          }
        ]
      },
      {
        "id": "entities-keys-and-normalization",
        "heading": "Entities, keys, and normalization that serve the product",
        "paragraphs": [
          "Good modeling starts by naming the nouns that own identity: users, accounts, orders, payments, shipments, tenants. Each entity needs a stable primary key. Surrogate keys such as UUIDs or bigserials keep joins independent of mutable business fields, while natural unique constraints still protect business identity. Relationships become foreign keys with explicit cascade or restrict behavior so deletes do not silently orphan critical history.",
          "Normalization reduces duplication and update anomalies. Third normal form is a useful starting habit: store each fact once, near the entity that owns it, and join when needed. That habit prevents contradictory copies of an address or price definition. It also makes auditability easier because the authoritative row is obvious. Interviews reward candidates who can sketch a normalized checkout schema and then explain which joins will be hot.",
          "Normalization is not a religion. Reporting snapshots, materialized order totals, or duplicated display names can be correct when the product requires a frozen historical view. The discipline is to distinguish live reference data from historical facts. An order line should usually freeze the price paid even if the catalog price later changes. That is intentional denormalization of a past event, not accidental duplication of a mutable entity."
        ],
        "keyTerms": [
          {
            "term": "Surrogate key",
            "definition": "A synthetic identifier used as the primary key so business attributes can change without rewriting relationship graphs."
          },
          {
            "term": "Natural key",
            "definition": "A business-meaningful unique attribute or set of attributes, often enforced with a unique constraint alongside a surrogate primary key."
          },
          {
            "term": "Normalization",
            "definition": "Organizing tables so each fact is stored once under clear ownership, reducing update anomalies and contradictory copies."
          }
        ],
        "workedExample": {
          "title": "Checkout skeleton with frozen line prices",
          "body": "This SQL sketch shows normalized order ownership plus intentional freezing of catalog price onto order lines at purchase time.",
          "code": "CREATE TABLE customers (\n  id BIGSERIAL PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE products (\n  id BIGSERIAL PRIMARY KEY,\n  sku TEXT NOT NULL UNIQUE,\n  unit_price_cents INT NOT NULL CHECK (unit_price_cents >= 0)\n);\n\nCREATE TABLE orders (\n  id BIGSERIAL PRIMARY KEY,\n  customer_id BIGINT NOT NULL REFERENCES customers(id),\n  status TEXT NOT NULL CHECK (status IN ('pending','paid','cancelled')),\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE TABLE order_lines (\n  id BIGSERIAL PRIMARY KEY,\n  order_id BIGINT NOT NULL REFERENCES orders(id),\n  product_id BIGINT NOT NULL REFERENCES products(id),\n  quantity INT NOT NULL CHECK (quantity > 0),\n  unit_price_cents INT NOT NULL, -- frozen at purchase\n  UNIQUE (order_id, product_id)\n);",
          "language": "sql"
        },
        "callout": {
          "tone": "tip",
          "body": "Ask whether a duplicated field is a live reference or a historical snapshot. Snapshots belong on event rows; live references belong on owned entities."
        },
        "checkYourself": [
          {
            "prompt": "Why should an order line store unit_price_cents instead of always joining to products?",
            "reveal": "Purchase history must preserve what the customer paid. Catalog prices change. Freezing the price on the line makes the historical fact immutable while the product table remains the live catalog."
          }
        ]
      },
      {
        "id": "indexes-and-access-paths",
        "heading": "Indexes as access paths, not decorations",
        "paragraphs": [
          "An index is a secondary data structure that makes a predicate or ordering cheap. B-tree indexes dominate equality and range lookups. Composite indexes matter because leftmost prefix matching determines which queries they accelerate. A covering index includes enough columns to answer a query without visiting the heap or clustered table, which can turn a hot endpoint from milliseconds of random I/O into a tight index-only scan.",
          "Index design must follow measured access patterns. List open orders by customer_id and created_at, look up payments by external_id, enforce uniqueness on tenant_id plus slug. Each of those sentences suggests a concrete index. Vague indexing such as indexing every foreign key without regard to selectivity or write rate creates write amplification: every insert and update maintains every secondary structure, inflating latency and storage.",
          "Cardinality and selectivity decide whether an index helps. An index on a boolean is_active column rarely pays for itself alone. An index on (tenant_id, is_active, updated_at) can be excellent for a tenant-scoped inbox query. Partial indexes further reduce size when only a subset of rows is queried, such as status = 'open'. In interviews, justify each index with a query shape rather than claiming indexes are free speed."
        ],
        "keyTerms": [
          {
            "term": "Covering index",
            "definition": "An index that contains all columns needed for a query, allowing the engine to avoid fetching the full row."
          },
          {
            "term": "Write amplification",
            "definition": "Extra work on inserts and updates caused by maintaining many secondary indexes or denormalized structures."
          },
          {
            "term": "Selectivity",
            "definition": "How effectively a predicate narrows the candidate row set; low-selectivity predicates often gain little from a standalone index."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Every index speeds some reads and slows some writes. Treat indexes as capacity decisions with owners and query justifications."
        },
        "checkYourself": [
          {
            "prompt": "Why might indexing every foreign key be harmful?",
            "reveal": "Foreign-key columns are not always used in selective lookups. Unused indexes still cost storage and write latency, and they can confuse planners without improving the hot path."
          }
        ]
      },
      {
        "id": "transactions-isolation-locks",
        "heading": "Transactions, isolation, and lock contention",
        "paragraphs": [
          "Transaction boundaries should match business operations. Reserving inventory and creating an order belong together if the product forbids orphan reservations. Posting a double-entry ledger belongs in one transaction so debit and credit cannot diverge. Long-running transactions that hold locks while calling external payment providers are a classic failure mode: they serialize throughput and create cascading timeouts.",
          "Isolation levels describe which concurrent anomalies are tolerated. Read committed avoids dirty reads but still allows non-repeatable reads. Repeatable read and snapshot isolation protect a statement or transaction from seeing mid-flight changes, which matters for balance checks. Serializable isolation prevents more anomalies at higher abort and retry cost. You do not need to recite every anomaly in an interview, but you should know which race your design must prevent and whether optimistic retries or SELECT FOR UPDATE is the tool.",
          "Lock contention appears when many sessions touch the same hot rows: a single inventory counter, a global sequence, or a popular account balance. Remedies include finer-grained rows, deferred work, idempotent upserts, and moving contention out of the synchronous path. Explain plans and lock wait metrics are how operators confirm the story. Designing as if the database were infinitely parallel without naming hot rows is a common interview weakness."
        ],
        "keyTerms": [
          {
            "term": "Isolation level",
            "definition": "The concurrency contract controlling which intermediate states concurrent transactions may observe."
          },
          {
            "term": "Pessimistic locking",
            "definition": "Holding locks such as SELECT FOR UPDATE to prevent conflicting writers from proceeding until the transaction ends."
          },
          {
            "term": "Optimistic concurrency",
            "definition": "Detecting conflicts with versions or predicates and retrying instead of holding long exclusive locks."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State the race you fear, the isolation or locking tool that prevents it, and how retries behave when the transaction aborts."
        },
        "checkYourself": [
          {
            "prompt": "Why are long transactions that wait on external HTTP calls dangerous?",
            "reveal": "They hold database locks or snapshots while latency is dominated by a remote system. Concurrent work queues behind those locks, amplifying outages when the dependency slows."
          }
        ]
      },
      {
        "id": "intentional-denormalization",
        "heading": "Intentional denormalization and derived data",
        "paragraphs": [
          "Denormalization is justified when repeated joins dominate latency or when a read model must be shaped like the UI. Storing a denormalized follower_count on a profile, a cached order_total on an order header, or a flattened projection for a mobile home screen can be correct if update rules are explicit. The cost is coherence: every write path that changes the source fact must update or invalidate the derived field.",
          "Materialized views, summary tables, and application-maintained counters are all forms of derived data. Choose a single writer for each derived value when possible. Event-driven updates can keep projections fresh, but they introduce lag and replay requirements. Synchronous dual writes are simpler to reason about at low scale and risk partial failure unless wrapped carefully. Interviews favor candidates who name the coherence mechanism rather than casually saying we will denormalize for speed.",
          "A practical rule is to keep the source of truth normalized for correctness and add denormalized read models only where measurement shows pain. Archive patterns follow the same idea: move cold rows to partitioned history tables or a warehouse so the hot transactional set stays small. That is physical organization in service of access patterns, not a rejection of relational modeling."
        ],
        "keyTerms": [
          {
            "term": "Derived data",
            "definition": "Values computed or copied from authoritative facts to accelerate reads, requiring an explicit freshness and update strategy."
          },
          {
            "term": "Read model",
            "definition": "A storage shape optimized for a query or screen rather than for capturing the canonical write invariants."
          },
          {
            "term": "Dual write",
            "definition": "Updating two stores or tables in one application path; fragile unless transactional or reconciled by an outbox."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Denormalization without an owner for updates creates silent drift. Prefer one authoritative write path and measurable staleness bounds."
        },
        "checkYourself": [
          {
            "prompt": "What must you specify after proposing a denormalized counter?",
            "reveal": "Which events increment or decrement it, whether updates are synchronous or asynchronous, how rebuilds work after corruption, and what users see while the counter is stale."
          }
        ]
      },
      {
        "id": "relational-ops-and-scaling",
        "heading": "Operational habits that keep relational systems healthy",
        "paragraphs": [
          "Schema quality alone does not make a database production-ready. Connection pools must be sized for the application fleet and the database's max connections. Query timeouts and statement budgets prevent one pathological request from exhausting workers. Migrations need expand-and-contract discipline so old and new application versions can coexist during rolling deploys. Online schema changes and careful lock timing belong in the same conversation as indexes.",
          "Read replicas offload reporting and eventually consistent reads, but replica lag can surprise product flows that expect read-after-write. Route those flows to the primary or use causal techniques such as waiting for a write to be visible. Separate analytical warehouses from the transactional primary when heavy scans would contend with OLTP. Partitioning large tables by time can keep vacuuming, backups, and purges manageable without a full sharding program.",
          "In an interview, close the relational story with operations: pooling, migration safety, replica routing, archival, and what happens when a hot query appears. That arc shows you can live with the design after the whiteboard session ends."
        ],
        "callout": {
          "tone": "tip",
          "body": "If analytics and OLTP share one primary, explain how you prevent scan-heavy queries from stealing I/O and CPU from checkout."
        },
        "checkYourself": [
          {
            "prompt": "Why can read-your-writes fail after inserting on the primary and immediately reading a replica?",
            "reveal": "Asynchronous replicas may not have applied the write yet. The client can observe a stale snapshot unless it reads from the primary or waits for replication catch-up."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Start with entities, constraints, and multi-row invariants before specialized stores.",
        "Indexes are access paths justified by query shapes and paid for on every write.",
        "Transaction boundaries should match business operations and avoid holding locks across remote calls.",
        "Denormalize deliberately with an owner for coherence, rebuilds, and staleness."
      ],
      "nextSteps": [
        "Sketch a normalized checkout schema and list the three hottest queries with their indexes.",
        "Pick one race in inventory reservation and explain isolation or locking for it.",
        "Describe an expand-and-contract migration for adding a non-null column under rolling deploys."
      ]
    }
  },
  "data-storage/replication-and-failover": {
    "title": "Replication and failover",
    "readingTime": "80-100 min",
    "premise": "Replicas buy read scale, durability, and recovery options, but they also introduce lag, split-brain risk, and client discovery problems. This chapter treats replication as a consistency and operations design, not as a checkbox that automatically makes a database highly available.",
    "parts": [
      {
        "id": "why-replicate",
        "heading": "What replication actually buys you",
        "paragraphs": [
          "Replication copies changes from one database copy to others. The motives differ: scale reads by serving queries from followers, keep a hot standby for failover, place data nearer to regional users, or retain an offline analytics replica. Each motive implies different lag tolerance and topology. A reporting replica can be minutes behind. A failover candidate should be close enough that the business accepts the potential data loss window.",
          "Single-writer topologies keep conflict handling simple: one primary accepts writes, and replicas apply an ordered stream of changes. Multi-writer or active-active topologies reduce write latency for geographically distributed clients but require conflict resolution, careful partitioning of write ownership, or consensus. Interviews go poorly when candidates claim multi-writer without naming how conflicts are prevented or merged.",
          "Replication is not a substitute for backups. Corrupting a schema migration or deleting rows can replicate the damage everywhere. Durable recovery still needs snapshots, point-in-time recovery, and restore drills that are independent of the live replica set."
        ],
        "keyTerms": [
          {
            "term": "Primary",
            "definition": "The replica currently authorized to accept writes in a single-writer topology."
          },
          {
            "term": "Replica lag",
            "definition": "The delay between a write committing on the primary and becoming visible on a follower."
          },
          {
            "term": "Hot standby",
            "definition": "A replica kept ready to be promoted quickly when the primary fails."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State the goal of each replica: read scale, failover, locality, or analytics. Different goals imply different lag and promotion rules."
        },
        "checkYourself": [
          {
            "prompt": "Why can a fully replicated cluster still lose data to a bad migration?",
            "reveal": "Replication faithfully copies logical damage. Backups and delayed replicas exist so you can restore to a time before the bad write."
          }
        ]
      },
      {
        "id": "sync-vs-async",
        "heading": "Synchronous, asynchronous, and quorum replication",
        "paragraphs": [
          "Asynchronous replication acknowledges a write after the primary persists it locally, then ships the change to replicas in the background. Latency stays low and availability can remain high if replicas disconnect, but failover may lose the newest acknowledged writes that never reached a survivor. That trade-off is acceptable for feeds, catalogs, and many session stores. It is usually unacceptable for ledgers without additional safeguards.",
          "Synchronous replication waits for one or more replicas to confirm durability before acknowledging the client. Durability improves and RPO shrinks, but commit latency rises and availability can fall if the synchronous standbys are unreachable. Semi-synchronous and quorum modes sit in between: the primary waits for a subset of acknowledgements, balancing latency with a bounded loss window.",
          "Quorum thinking connects replication to consensus. If a write must be present on a majority before success, promotion can prefer nodes that participated in recent quorums and reduce the chance of resurrecting a stale primary. You do not need to implement Paxos in an interview, but you should relate acknowledgement policy to what can be lost when the primary disappears."
        ],
        "keyTerms": [
          {
            "term": "RPO",
            "definition": "Recovery point objective: the maximum acceptable amount of data loss measured in time or transactions."
          },
          {
            "term": "RTO",
            "definition": "Recovery time objective: the maximum acceptable time to restore service after a failure."
          },
          {
            "term": "Quorum acknowledgement",
            "definition": "A durability policy that requires a majority or configured subset of replicas to confirm a write before success."
          }
        ],
        "workedExample": {
          "title": "Mapping product needs to replication mode",
          "body": "A compact decision table you can narrate in interviews when choosing sync versus async replication.",
          "code": "workload              | tolerable loss | commit latency | typical mode\n----------------------|----------------|----------------|----------------------\nsocial feed posts     | seconds OK     | must be low    | async + read replicas\nproduct catalog       | seconds OK     | low preferred  | async\ninventory reservation | near-zero      | medium OK      | sync/quorum to standby\npayments ledger       | near-zero      | medium OK      | sync/quorum + backups\nanalytics replica     | minutes OK     | n/a (reads)    | async delayed apply",
          "language": "text"
        },
        "callout": {
          "tone": "tip",
          "body": "Translate RPO into product language: how many recent orders or messages is the business willing to lose on primary death?"
        },
        "checkYourself": [
          {
            "prompt": "What does choosing asynchronous replication imply about failover?",
            "reveal": "Promotion may discard unreplicated primary writes, so clients can lose acknowledged data unless the product retries safely or the acknowledgement policy was misunderstood."
          }
        ]
      },
      {
        "id": "read-your-writes-and-lag",
        "heading": "Replica lag and user-visible consistency",
        "paragraphs": [
          "Users experience replica lag as stale reads: a profile edit that vanishes on refresh, a like count that drops, or an order confirmation page that cannot find the order. Sticky primary reads for the writing session, session consistency tokens, or routing read-after-write paths to the primary mitigate those surprises. Global secondary indexes and search indexes introduce similar lag when they are fed asynchronously.",
          "Monitoring lag is an operational requirement, not a dashboard luxury. Track apply lag in seconds and in bytes, alert before product SLOs break, and understand whether lag is caused by network, replay CPU, vacuum contention, or a long transaction holding back apply. During incidents, lagging replicas can be temporarily removed from the load balancer rather than served as truth.",
          "Explain lag to product partners without mysticism. It is the delay before a committed write becomes visible on a follower. For feeds, seconds may be fine. For account balances, it is not. That sentence alone often separates shallow from strong interview answers."
        ],
        "keyTerms": [
          {
            "term": "Read-your-writes",
            "definition": "A consistency expectation that a client immediately observes its own successful writes on subsequent reads."
          },
          {
            "term": "Session consistency",
            "definition": "Routing or versioning techniques that keep one client session from reading older replicas after it has seen a newer state."
          },
          {
            "term": "Stale read",
            "definition": "A read that returns a version older than the latest committed write the system has acknowledged elsewhere."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Never put mandatory read-after-write UX on an unreplicated async follower without a mitigation plan."
        },
        "checkYourself": [
          {
            "prompt": "Name two mitigations for read-your-writes on an async replica topology.",
            "reveal": "Route the writer's subsequent reads to the primary for a TTL, or use a causality token that waits until replicas have applied at least that write position."
          }
        ]
      },
      {
        "id": "failover-and-split-brain",
        "heading": "Failover, promotion safety, and split brain",
        "paragraphs": [
          "Failover promotes a replica to primary when health checks fail. Automatic failover shortens RTO but must avoid promoting a stale node or allowing two primaries. Fencing, quorum membership, lease-based leadership, and isolation of the old primary are the classic tools. Manual failover is slower and sometimes safer when the failure mode is ambiguous.",
          "Split brain occurs when two nodes both accept writes because each believes it is primary. Divergent data is expensive to reconcile. Prevention is better than clever merge tools: require consensus to win leadership, fence the old primary's disk or network path, and make clients discover the primary through a strongly consistent control plane such as consensus-backed metadata or a well-operated discovery service plus fencing workflow.",
          "Client discovery is part of the design. Connection string updates, proxy layers, service endpoints, or driver-side primary discovery must be explained. A promoted replica that nobody connects to does not restore service. Health checks should probe writeability and replication health, not only TCP liveness."
        ],
        "keyTerms": [
          {
            "term": "Split brain",
            "definition": "A failure mode where two primaries accept writes concurrently, creating divergent histories."
          },
          {
            "term": "Fencing",
            "definition": "Forcibly preventing a former primary from accepting writes after another node has been promoted."
          },
          {
            "term": "Promotion",
            "definition": "The act of selecting a replica to become the new writable primary."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Walk through failure detection, promotion choice, fencing the old primary, and how clients find the new writer."
        },
        "checkYourself": [
          {
            "prompt": "Why is a TCP health check insufficient for database failover?",
            "reveal": "A process can accept TCP connections while stuck replaying WAL, mounted read-only, or lagging badly. Failover health checks need writeability and replication-aware signals."
          }
        ]
      },
      {
        "id": "recovery-after-failover",
        "heading": "Recovery, catch-up, and repair after promotion",
        "paragraphs": [
          "After promotion, survivors must catch up, old primaries must be rebuilt or rejoined carefully, and traffic spikes can melt the new primary. Throttle replica rebuilds, postpone heavy analytics, and protect hot partitions. If asynchronous replication lost writes, product workflows may need reconciliation jobs that compare external systems of record such as payment provider statements.",
          "Multi-region active-active adds another layer: per-region primaries with asynchronous cross-region replication are often easier than global synchronous writes. Conflict-free data models, sticky region assignment, or last-writer-wins with explicit risk may appear. State those choices honestly rather than promising transparent global strong consistency for free.",
          "Practice failover. Game days that promote standbys, break networks, and verify application behavior build confidence that RTO numbers are real. Observing replication lag, failover duration, and error budgets over time turns replication from architecture diagram ink into an operable control."
        ],
        "callout": {
          "tone": "tip",
          "body": "Include catch-up traffic control in the failover runbook. Unthrottled rebuilds are a common way to turn one failure into two."
        },
        "checkYourself": [
          {
            "prompt": "What product work remains after a successful technical promotion if async replication was in use?",
            "reveal": "Detect and reconcile any writes acknowledged by the old primary that never reached the new one, and verify clients are no longer talking to the fenced node."
          }
        ]
      },
      {
        "id": "replication-interview-synthesis",
        "heading": "Synthesizing replication answers in interviews",
        "paragraphs": [
          "A complete answer names topology, acknowledgement policy, lag implications, failover safety, client discovery, and backup independence. Tie each choice to RPO and RTO. Mention what users see during lag and during failover. That checklist covers most interviewer follow-ups.",
          "Avoid absolute claims. Replicas do not automatically improve write throughput in single-writer systems. Synchronous replication does not remove the need for backups. Automatic failover is not always safer than manual. Precision about trade-offs reads as senior engineering judgment.",
          "If the system later needs multi-region writes, escalate the design deliberately: partition write ownership, adopt conflict resolution, or accept a consensus-replicated store. Do not silently upgrade a single-region async pair into a global active-active promise."
        ],
        "callout": {
          "tone": "interview",
          "body": "Use the sentence: single writer for simplicity, async for latency, sync for durability, quorum for promotion safety, backups for true disaster recovery."
        },
        "checkYourself": [
          {
            "prompt": "Does adding read replicas increase write capacity of a single-writer database?",
            "reveal": "No. They can scale reads and provide failover candidates, but all writes still serialize through the primary unless you change the write topology."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Replication goals differ: read scale, failover, locality, and analytics imply different lag budgets.",
        "Sync versus async is an RPO and latency decision with direct user-visible consequences.",
        "Safe failover requires fencing, careful promotion, and client discovery, not only health pings.",
        "Backups and restore drills remain necessary even with many replicas."
      ],
      "nextSteps": [
        "Write RPO and RTO targets for a feed service and a payments ledger and choose replication modes for each.",
        "Diagram automatic failover with fencing and primary discovery.",
        "List metrics you would alert on for lag and failover readiness."
      ]
    }
  },
  "data-storage/partitioning-and-sharding": {
    "title": "Partitioning, federation, and sharding",
    "readingTime": "80-100 min",
    "premise": "Partitioning appears when a single machine or logical schema becomes the bottleneck for size, throughput, or ownership. This chapter develops shard-key selection, consistent hashing, hot-key mitigation, federation versus sharding, and the operational costs interviewers probe after the happy-path diagram.",
    "parts": [
      {
        "id": "partition-for-a-reason",
        "heading": "Partition only when a bottleneck is real",
        "paragraphs": [
          "Horizontal partitioning, or sharding, splits rows of the same logical table across nodes so each node owns a subset of keys. It helps when storage, write throughput, or working-set memory exceeds what one primary can provide even after indexing and caching. Vertical federation instead separates domains into different databases—billing apart from messaging—so teams and lifecycles can diverge without splitting every table by hash.",
          "Premature sharding is a common failure. Cross-shard joins, distributed transactions, and rebalancing hurt more than a well-tuned monolithic relational primary for a long time. Interviews reward candidates who first exhaust vertical scaling, read replicas, archival partitions, and caching, then justify sharding with concrete limits: disk, IOPS, lock contention, or blast-radius isolation.",
          "Time-based table partitioning inside one database is a lighter cousin. Range partitions by month keep purges cheap and queries on recent data local to hot partitions. That technique often delays true sharding and should be distinguished from multi-node shard routing in your answer."
        ],
        "keyTerms": [
          {
            "term": "Sharding",
            "definition": "Horizontal partitioning of one logical dataset across multiple nodes by a shard key."
          },
          {
            "term": "Federation",
            "definition": "Separating functional domains into independently operated databases rather than splitting one table by key."
          },
          {
            "term": "Table partitioning",
            "definition": "Splitting a table within one database engine, often by time ranges, without multi-node routing."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State the bottleneck numbers or failure modes that force partitioning before naming a shard key."
        },
        "checkYourself": [
          {
            "prompt": "What is the difference between federation and sharding?",
            "reveal": "Federation separates domains into different databases by bounded context. Sharding splits one domain's records across nodes by a key while preserving one logical schema."
          }
        ]
      },
      {
        "id": "choosing-shard-keys",
        "heading": "Choose stable keys that keep queries local",
        "paragraphs": [
          "A good shard key distributes load and keeps common queries on one shard. User ID works for user-owned profiles, settings, and many social graphs because the primary request path is per user. Tenant ID works for multi-tenant SaaS when tenants are numerous and none dominate. Compound keys can combine tenant and entity when needed.",
          "Bad keys create hotspots. Sharding only by timestamp sends all new writes to one partition. Sharding by a low-cardinality status field clusters traffic. Celebrity users or mega-tenants can overload a single shard even with a generally good key; hotspot mitigation then needs cache, separate hot shards, or key salting.",
          "Query locality is the other half of the decision. If the common path is get timeline for user U, shard by user. If the common path is list all orders for product P across buyers, a user shard key forces scatter-gather. Secondary global indexes, dedicated search systems, or careful dual modeling may be required. Always narrate the hottest query when defending a key."
        ],
        "keyTerms": [
          {
            "term": "Shard key",
            "definition": "The attribute used to decide which node owns a row or document."
          },
          {
            "term": "Hot partition",
            "definition": "A shard that receives disproportionate traffic or storage, becoming the system bottleneck."
          },
          {
            "term": "Scatter-gather",
            "definition": "A query pattern that fans out to many shards and merges results, amplifying latency and failure modes."
          }
        ],
        "workedExample": {
          "title": "Shard key checklist for a timeline service",
          "body": "Narrate this checklist when asked how you would shard timelines.",
          "code": "1) Primary path: read/write posts for user_id -> candidate key user_id\n2) Fan-out read: home timeline may need precomputed per-user inbox shards\n3) Celebrity hotspot: isolate heavy users, cache, async fan-out\n4) Avoid: shard only by post timestamp\n5) Rebalance plan: consistent hashing or directory with move tooling\n6) Cross-shard: search/global reports go to secondary index/warehouse",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "Never choose a shard key that aligns with a natural traffic burst such as wall-clock time without bucketing or salting."
        },
        "checkYourself": [
          {
            "prompt": "Why can sharding a timeline solely by created_at be dangerous?",
            "reveal": "New events all land in the newest time partition, creating a permanent write hotspot and uneven storage growth."
          }
        ]
      },
      {
        "id": "routing-and-consistent-hashing",
        "heading": "Routing metadata and consistent hashing",
        "paragraphs": [
          "Clients or proxies must map a key to a shard. A shard directory or routing table stored in a highly available control plane is explicit and flexible. Consistent hashing maps keys onto a ring so that adding or removing a node moves only a fraction of keys, which helps elastic clusters and cache fleets. Range-based sharding maps contiguous key ranges to nodes and can support efficient range scans at the cost of hotspot risk and split operations.",
          "Virtual nodes reduce imbalance on a hash ring by giving each physical node many positions. Directory-based routing can place heavy keys intentionally. Both approaches need careful metadata durability: if the routing map is wrong, you silently read stale locations or write to the wrong owner.",
          "Resharding is inevitable. Plan for online moves, dual writes or log replay during migration, backfills, and verification checksums. Emergency resharding under duress is how outages lengthen. Interview answers should mention rebalancing before capacity is exhausted."
        ],
        "keyTerms": [
          {
            "term": "Consistent hashing",
            "definition": "A placement algorithm where most keys stay put when nodes are added or removed."
          },
          {
            "term": "Shard directory",
            "definition": "A metadata service mapping key ranges or hash slots to owning nodes."
          },
          {
            "term": "Virtual node",
            "definition": "Multiple hash-ring positions representing one physical node to smooth load."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Keep routing metadata on a consensus-backed or otherwise strongly consistent store; wrong maps cause silent data loss."
        },
        "checkYourself": [
          {
            "prompt": "When is consistent hashing especially useful?",
            "reveal": "When membership changes often—elastic cache clusters or frequently resized shard fleets—and you want to minimize key movement during rebalance."
          }
        ]
      },
      {
        "id": "cross-shard-costs",
        "heading": "Cross-shard transactions, indexes, and aggregations",
        "paragraphs": [
          "Once data is sharded, multi-row transactions that spanned one primary become distributed problems. Many systems avoid cross-shard ACID and instead keep transactions single-shard by design. Sagas, outboxes, and idempotent compensating actions handle multi-entity workflows. If you truly need cross-shard strict transactions, explain the latency and failure cost of two-phase commit or a distributed SQL layer.",
          "Global secondary indexes are another tax. An index on email across user shards cannot live entirely locally. Approaches include maintaining a global index service, scatter-gather queries, or storing a lookup table keyed by the secondary attribute. Each approach has lag or fan-out costs.",
          "Aggregations and joins follow the same logic. Prefer precomputation, warehouses, or application-level assembly over ad hoc cross-shard joins on the online path. Sharding is a contract that most online queries stay local."
        ],
        "keyTerms": [
          {
            "term": "Saga",
            "definition": "A sequence of local transactions with compensations that approximates a multi-step workflow without a global lock."
          },
          {
            "term": "Global secondary index",
            "definition": "An index on an attribute that is not the shard key, requiring cross-shard maintenance or query fan-out."
          },
          {
            "term": "Two-phase commit",
            "definition": "A distributed protocol that atomically commits across participants at the cost of latency and blocking risk."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say which transactions remain single-shard by construction, and which workflows become sagas."
        },
        "checkYourself": [
          {
            "prompt": "How do you keep checkout correct if orders and inventory live on different shards?",
            "reveal": "Use a carefully designed workflow: reserve inventory with idempotency on its shard, create the order on its shard, and compensate or release on failure—or colocate entities that must commit together."
          }
        ]
      },
      {
        "id": "hotspots-and-operations",
        "heading": "Hotspots, operations, and when not to shard",
        "paragraphs": [
          "Hotspot mitigation includes caching popular keys, salting keys into multiple buckets, isolating mega-tenants onto dedicated shards, and moving ultra-hot counters into specialized stores. Detect imbalance with per-shard QPS, CPU, and storage metrics rather than cluster averages.",
          "Operational costs compound: backups per shard, schema rollout coordination, partial outages, and on-call mental load. Routing bugs become data-correctness bugs. This is why many mature companies stay on large relational primaries with partitioning and replicas longer than whiteboard culture suggests.",
          "Close the interview topic by restating the reason to partition, the key, the local query guarantee, the cross-shard escape hatches, and the rebalance plan. That structure sounds complete and senior."
        ],
        "callout": {
          "tone": "warning",
          "body": "Cluster-wide averages hide dying hot shards. Always monitor per-shard saturation."
        },
        "checkYourself": [
          {
            "prompt": "Name three operational costs introduced by sharding.",
            "reveal": "Coordinated schema migrations, per-shard backup/restore complexity, and harder debugging when only some shards fail or lag."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Partition after naming a concrete bottleneck; federation and table partitioning are lighter alternatives.",
        "Shard keys must distribute load and keep the hottest queries local.",
        "Routing metadata, rebalancing, and hotspot controls are part of the design.",
        "Cross-shard ACID and global indexes are expensive; prefer single-shard transactions and secondary systems."
      ],
      "nextSteps": [
        "Propose a shard key for a multi-tenant document editor and justify query locality.",
        "Explain how you would reshard from 8 to 16 nodes with verification.",
        "Design a hotspot plan for a celebrity user in a social graph."
      ]
    }
  },
  "data-storage/nosql-landscape": {
    "title": "The NoSQL landscape",
    "readingTime": "75-95 min",
    "premise": "NoSQL is not one technology. It is a family of data models that trade relational join flexibility for scale characteristics, schema freedom, availability patterns, or specialized query power. This chapter maps key-value, document, wide-column, and graph stores to workloads and teaches polyglot persistence without cargo-culting.",
    "parts": [
      {
        "id": "what-nosql-means",
        "heading": "Name the model, not the buzzword",
        "paragraphs": [
          "Calling a system NoSQL without specifying the model is interview noise. Key-value, document, wide-column, graph, and search indexes solve different problems. They often weaken multi-row relational constraints, ad hoc joins, or both, in exchange for horizontal scale, simpler partition-local access, flexible schemas, or traversal performance.",
          "Consistency and durability options vary widely inside the label. Some document databases offer multi-document transactions within limits. Some key-value stores are pure caches. Some wide-column systems emphasize tunable quorum consistency. Your job is to match access patterns and invariants to a model, then name the semantic cost.",
          "Teams sometimes flee to NoSQL to avoid schema design. That usually recreates schema in application code with weaker enforcement. Schema freedom is valuable when documents evolve quickly and are fetched as wholes; it is not a substitute for thinking about identity, uniqueness, and correctness."
        ],
        "keyTerms": [
          {
            "term": "Data model",
            "definition": "The structural abstraction—rows, documents, columns, edges—that shapes queries and constraints."
          },
          {
            "term": "Schema-on-read",
            "definition": "Interpreting structure in application code when the store accepts flexible or evolving records."
          },
          {
            "term": "Semantic trade-off",
            "definition": "The correctness, query, or operational property given up to gain scale, flexibility, or specialized access."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Never say we will use NoSQL for scale. Say which model, which query shape, and which relational capability you are giving up."
        },
        "checkYourself": [
          {
            "prompt": "Why is avoiding schema work a weak reason to choose a document store?",
            "reveal": "The schema still exists in producers and consumers. Without database enforcement, invariants drift and every reader reimplements validation."
          }
        ]
      },
      {
        "id": "key-value-and-document",
        "heading": "Key-value and document stores",
        "paragraphs": [
          "Key-value stores excel at get and put by primary key with extremely simple semantics. Sessions, feature flags, rate-limit counters, profile blobs, and cache-like working sets fit well. Secondary query power is limited unless you add indexes or external search. Memory-first systems can be astonishingly fast and must be designed with eviction and durability modes in mind.",
          "Document stores persist JSON-like documents, often with secondary indexes and rich queries inside a document collection. They fit product profiles, CMS content, event payloads, and aggregates that are read and written as a unit. Document growth, unbounded arrays, and fan-out writes to many documents are common pitfalls. Denormalization is expected: embed related data when it is read together, reference it when it changes independently.",
          "Transactions across many documents may be limited or expensive. If your core invariant spans many aggregates, a relational primary might still be safer. Document stores shine when the aggregate boundary matches the consistency boundary."
        ],
        "keyTerms": [
          {
            "term": "Aggregate boundary",
            "definition": "The cluster of data that is read and written together and can act as a consistency unit."
          },
          {
            "term": "Secondary index",
            "definition": "An index on fields other than the primary key enabling alternative lookup paths."
          },
          {
            "term": "Embedded document",
            "definition": "Related data stored inside a parent document to make common reads local and join-free."
          }
        ],
        "workedExample": {
          "title": "Document shape for a user profile aggregate",
          "body": "An example aggregate that matches common read/write boundaries for a profile service.",
          "code": "{\n  \"_id\": \"user_1842\",\n  \"email\": \"ada@example.com\",\n  \"displayName\": \"Ada\",\n  \"settings\": {\"locale\": \"en\", \"theme\": \"dark\"},\n  \"devices\": [{\"id\": \"d1\", \"platform\": \"ios\"}],\n  \"updatedAt\": \"2026-07-27T12:00:00Z\"\n}\n# Good: settings and devices fetched with profile\n# Risky: embedding entire follower lists that grow without bound",
          "language": "json"
        },
        "callout": {
          "tone": "tip",
          "body": "If a nested array can grow without bound, store it as a separate collection or shard-friendly relation instead of embedding forever."
        },
        "checkYourself": [
          {
            "prompt": "When would a document store beat a relational schema?",
            "reveal": "When the primary access pattern loads a single evolving aggregate by key, secondary joins are rare, and schema fields change faster than migrations comfortably allow."
          }
        ]
      },
      {
        "id": "wide-column-and-graph",
        "heading": "Wide-column and graph stores",
        "paragraphs": [
          "Wide-column stores organize data by partition keys and clustered columns, optimizing sparse tables and high write throughput for time-series, telemetry, inbox patterns, and large event histories. Query design is primary: you must know the partition key and clustering order up front. Ad hoc relational queries are the wrong expectation. Tombstones, compaction, and repair operations become part of operational literacy.",
          "Graph databases treat edges and traversals as first-class. Social relationships, fraud rings, authorization graphs, and recommendation neighborhoods can be natural fits when multi-hop queries are the product. They are less ideal as a general transactional store for tabular business records. Operational maturity and ecosystem tooling vary, so justify them with traversal-heavy access patterns.",
          "Search engines and vector indexes often appear beside these stores. They are derived query systems, not usually sources of truth. Keep that distinction clear when discussing polyglot designs."
        ],
        "keyTerms": [
          {
            "term": "Partition key",
            "definition": "In wide-column systems, the key that defines data locality and the unit of distribution."
          },
          {
            "term": "Clustering columns",
            "definition": "Columns that define sort order inside a partition for efficient range access."
          },
          {
            "term": "Graph traversal",
            "definition": "A query that walks edges across nodes, often multiple hops deep."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "For wide-column designs, write the exact primary-key access pattern on the board before naming the database product."
        },
        "checkYourself": [
          {
            "prompt": "What workloads fit wide-column systems well?",
            "reveal": "High-write append-heavy workloads with known partition keys such as telemetry, messaging inboxes, and large sparse time-series where scans stay inside a partition."
          }
        ]
      },
      {
        "id": "polyglot-persistence",
        "heading": "Polyglot persistence with clear ownership",
        "paragraphs": [
          "Serious products often combine stores: relational for orders, object storage for media, a document store for flexible profiles, Redis for ephemeral state, and a search index for retrieval. Polyglot persistence is legitimate when each system owns a clear invariant and access pattern. It becomes chaos when every service invents a new database for convenience.",
          "Ownership rules matter. One source of truth per domain fact; derived stores subscribe through streams, CDC, or explicit pipelines. Dual writes without an outbox create silent drift. Synchronization lag must be product-visible or bounded by design.",
          "Operational portfolio size is a first-class constraint. Each store brings backups, upgrade paths, security models, and on-call expertise. Prefer a small set of default technologies and add specialists only when requirements demand them."
        ],
        "keyTerms": [
          {
            "term": "Polyglot persistence",
            "definition": "Using multiple specialized storage technologies within one product intentionally."
          },
          {
            "term": "Source of truth",
            "definition": "The authoritative system for a given fact against which derived stores are reconciled."
          },
          {
            "term": "CDC",
            "definition": "Change data capture: emitting a change stream from a primary store to update derived systems."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A search index is a derived view. Designing it as the only copy of business-critical records invites painful recovery stories."
        },
        "checkYourself": [
          {
            "prompt": "How would you keep a search index synchronized with a primary store?",
            "reveal": "Publish reliable change events from the primary via CDC or an outbox, apply idempotent upserts/deletes to the index, monitor lag, and rebuild from snapshots when drift is detected."
          }
        ]
      },
      {
        "id": "choosing-among-models",
        "heading": "Decision cues across the landscape",
        "paragraphs": [
          "Start from invariants and query shapes. Need multi-row transactions and flexible joins? Relational. Need huge keyed lookups with simple values? Key-value. Need aggregate documents with evolving fields? Document. Need partition-local high write volume with known queries? Wide-column. Need deep relationship walks? Graph. Need relevance retrieval? Search.",
          "Then layer consistency, team skill, and managed service maturity. A slightly imperfect model on a well-understood platform often beats an ideal model nobody can operate. Interview answers that include operability sound trustworthy.",
          "Finally, revisit whether caching and good relational indexing already solve the pain. Many NoSQL migrations are really caching, archival, or read-model problems in disguise."
        ],
        "callout": {
          "tone": "tip",
          "body": "If you cannot describe the primary key access pattern, you are not ready to choose a wide-column or key-value store."
        },
        "checkYourself": [
          {
            "prompt": "What question should you answer before proposing any NoSQL system?",
            "reveal": "What is the dominant access pattern, which invariant must hold, and which relational capability are we intentionally giving up?"
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Specify the NoSQL data model and semantic trade-off, not the buzzword.",
        "Key-value and document stores fit keyed aggregates; watch unbounded embeds and weak multi-document invariants.",
        "Wide-column and graph systems require query-first design around partitions or traversals.",
        "Polyglot persistence needs clear sources of truth, sync pipelines, and a small operational portfolio."
      ],
      "nextSteps": [
        "Map a social media product to two or three stores with ownership boundaries.",
        "Rewrite a poorly embedded document that contains an unbounded list.",
        "Explain CDC-based search sync including lag and rebuild strategy."
      ]
    }
  },
  "data-storage/storage-selection": {
    "title": "Choosing the right storage mix",
    "readingTime": "70-90 min",
    "premise": "Most serious systems use more than one storage technology. The skill is choosing a small set whose strengths align with invariants, access patterns, and team capacity. This chapter turns the previous lessons into an interview-ready decision process.",
    "parts": [
      {
        "id": "start-with-invariants",
        "heading": "Start with the invariant, not the brand name",
        "paragraphs": [
          "List the facts the product cannot get wrong. Money movement, inventory reservation, entitlement grants, and audit trails usually demand strongly consistent transactional storage. Soft preferences, approximate counters, and recommendation features can tolerate lag or lossy reconstruction. Separating must-be-correct from best-effort prevents overbuilding exotic clusters for decorative data.",
          "Large binary objects almost never belong in a transactional row store. Object storage holds media, exports, and backups cheaply, while the database stores metadata and access control. Search and vector retrieval are query accelerators over text or embeddings, not ledgers. Caches are performance layers, not sources of truth.",
          "Write these distinctions explicitly in interviews. Interviewers listen for whether you protect correctness domains before optimizing latency domains."
        ],
        "keyTerms": [
          {
            "term": "Correctness domain",
            "definition": "Data whose wrongness creates financial, legal, or severe product failure and therefore needs strong transactional guarantees."
          },
          {
            "term": "Object storage",
            "definition": "Durable blob storage optimized for large opaque objects rather than fine-grained transactional updates."
          },
          {
            "term": "Derived index",
            "definition": "A secondary retrieval structure rebuilt from a primary store for search or specialized queries."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Open storage selection by classifying data into transactional truth, large objects, derived indexes, and ephemeral state."
        },
        "checkYourself": [
          {
            "prompt": "Why is object storage usually right for media?",
            "reveal": "Media files are large, infrequently mutated as wholes, and poorly suited to row-store page caches and transactional logging; object storage provides cheap durable blobs while metadata stays in a database."
          }
        ]
      },
      {
        "id": "match-access-patterns",
        "heading": "Match engines to access patterns",
        "paragraphs": [
          "After invariants, examine cardinality, read/write ratio, fan-out, query flexibility, update frequency, and retention. Write-heavy append workloads fit logs, streams, and wide-column patterns. Read-heavy key lookups fit caches and key-value stores. Complex joins and ad hoc reporting favor relational systems or warehouses. Graph walks and relevance search deserve specialized engines when they dominate.",
          "Retention policy changes the answer. Thirty days of hot click events may live in a wide-column or log store; seven years of financial records need transactional storage plus immutable archives. Cold tiers and lifecycle policies are part of the design, not afterthoughts.",
          "Consistency requirements interact with geography. If users are global but writes must be strongly ordered, you may keep a single-region primary for that domain even while media and reads are multi-region. Storage choice and topology choice travel together."
        ],
        "keyTerms": [
          {
            "term": "Access pattern",
            "definition": "The concrete read and write shapes, including keys, filters, fan-out, and freshness expectations."
          },
          {
            "term": "Retention policy",
            "definition": "Rules for how long data remains hot, warm, cold, or deleted."
          },
          {
            "term": "Write amplification profile",
            "definition": "How much extra I/O indexes, compaction, and replication add to each logical write."
          }
        ],
        "workedExample": {
          "title": "Storage mix for a social product",
          "body": "A concise mix you can defend in interviews without inventing a database per feature.",
          "code": "users/auth/billing     -> relational (invariants)\nposts metadata         -> relational or document by key\nmedia bytes            -> object storage\nhome timeline fan-out  -> cache + sharded store / streams\nsearch                 -> derived search index via CDC\nnotifications async    -> queue/stream\nsessions/rate limits   -> key-value / memory store\nanalytics              -> warehouse (not OLTP primary)",
          "language": "text"
        },
        "callout": {
          "tone": "tip",
          "body": "Prefer one primary transactional store plus purpose-built secondaries over five overlapping sources of truth."
        },
        "checkYourself": [
          {
            "prompt": "What storage mix would you choose for a social media product at a high level?",
            "reveal": "Relational or strongly consistent store for accounts and billing, object storage for media, a timeline store shaped for fan-out, a derived search index, caches for hot reads, and a warehouse for analytics—all with clear ownership."
          }
        ]
      },
      {
        "id": "keep-portfolio-small",
        "heading": "Keep the operational portfolio small",
        "paragraphs": [
          "Every datastore multiplies migration tooling, monitoring, backup, security review, and developer education. A design that uses eight databases to look modern often fails in production for people reasons. Choose defaults: for example Postgres plus object storage plus Redis plus a search product, and require an explicit RFC to add more.",
          "Document synchronization contracts. Who publishes changes? What is the lag SLO? How do you rebuild a derived store? Who is on-call? These questions are part of storage selection, not deferred ops work.",
          "Explaining why you are not adopting a fashionable database is a feature. Restraint signals engineering taste."
        ],
        "keyTerms": [
          {
            "term": "Operational portfolio",
            "definition": "The set of storage and infrastructure technologies a team must run and master."
          },
          {
            "term": "Rebuild path",
            "definition": "A tested procedure to reconstruct a derived store from authoritative sources."
          },
          {
            "term": "Lag SLO",
            "definition": "A target bound on how stale a derived system may be relative to its source of truth."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Adding a datastore for every pain point creates a distributed monolith of failure modes."
        },
        "checkYourself": [
          {
            "prompt": "How do you justify not introducing another specialized database?",
            "reveal": "Show that existing stores meet invariants and access patterns within SLO, and that the operational and sync cost of a new system exceeds its benefit."
          }
        ]
      },
      {
        "id": "selection-playbook",
        "heading": "An interview playbook for storage decisions",
        "paragraphs": [
          "Use a fixed cadence: (1) list entities and invariants, (2) list top queries with QPS and freshness, (3) assign a primary store per invariant domain, (4) add derived systems only for measured gaps, (5) define sync and failure behavior, (6) estimate cost and operability. This cadence prevents random technology shopping.",
          "Be ready to evolve the mix. Start relational, add cache, add search, shard later. Narrating an evolution path is stronger than pretending the first diagram is eternal.",
          "Connect back to replication and partitioning lessons: the storage engine choice constrains how you scale writes, and the scaling strategy constrains which engines are viable."
        ],
        "callout": {
          "tone": "interview",
          "body": "Walk the six-step cadence aloud; interviewers hear structured judgment rather than trivia."
        },
        "checkYourself": [
          {
            "prompt": "What is the first fork in storage selection?",
            "reveal": "Whether the data's correctness requirements demand a transactional source of truth or can live as derived/ephemeral state."
          }
        ]
      },
      {
        "id": "anti-patterns",
        "heading": "Anti-patterns that weaken storage answers",
        "paragraphs": [
          "Using a search index as the only copy of orders. Storing multi-GB blobs in Postgres. Choosing wide-column without a partition key. Introducing a graph database for a single join. Caching without a source of truth. These anti-patterns appear constantly and are easy to avoid if you keep invariants central.",
          "Another anti-pattern is ignoring backup and migration expertise. A store your team cannot restore is not highly available regardless of its replication brochure.",
          "Close by restating the mix in one sentence per domain. Clarity beats ornamental architecture."
        ],
        "callout": {
          "tone": "tip",
          "body": "If removing a database does not change a named invariant or query SLO, you probably did not need it."
        },
        "checkYourself": [
          {
            "prompt": "Name two risks of using a search index as source of truth.",
            "reveal": "Search systems optimize retrieval over transactional integrity, and rebuilds or reindexing can temporarily lose or duplicate business records without a primary store to reconcile against."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Classify data by invariant first, then by access pattern.",
        "Use object storage, search, caches, and warehouses as distinct tools with clear ownership.",
        "Limit the number of datastores to what the team can operate and sync safely.",
        "Narrate an evolution path from simple defaults to specialized systems as scale demands."
      ],
      "nextSteps": [
        "Apply the six-step cadence to an e-commerce design on a whiteboard.",
        "Identify three derived stores and write their lag SLOs and rebuild paths.",
        "Cut a hypothetical seven-database design down to four with justification."
      ]
    }
  }
};
