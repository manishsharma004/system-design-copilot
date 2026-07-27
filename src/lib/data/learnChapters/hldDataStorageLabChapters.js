/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldDataStorageLabChapters = {
  "data-storage-lab/indexing-and-query-path-design": {
    "title": "Workshop: Indexing and query-path design",
    "readingTime": "75-95 min",
    "premise": "Indexes are physical contracts with the request path, not optional hints. This lab designs access paths for real query shapes, chooses structures with write-cost eyes open, aligns pagination with order, and practices index rollouts as migrations.",
    "parts": [
      {
        "id": "indexes-as-contracts",
        "heading": "Treat indexes as physical contracts",
        "paragraphs": [
          "Once an endpoint depends on an index, key order, clustering, and cardinality become long-lived product assumptions. Teams that treat indexes as infinitely malleable underestimate write cost and migration risk. Senior reviews ask which caller owns the index budget—and which query shapes are intentionally unsupported.",
          "Start from the query, not from table columns. Write the predicate, sort, and pagination shape. Then design the minimal structure that makes that shape cheap. Extra indexes are permanent taxes on every write and on vacuum or compaction.",
          "Workshop: for a list-orders-by-customer-and-created-at API, state the exact WHERE/ORDER BY and propose one composite index. Explicitly refuse a filter combination you will not accelerate."
        ],
        "keyTerms": [
          {
            "term": "Access path",
            "definition": "The physical route the engine uses to find rows for a query shape."
          },
          {
            "term": "Composite index",
            "definition": "An index on multiple columns whose left-to-right order must match query needs."
          },
          {
            "term": "Write amplification",
            "definition": "Extra work on inserts/updates/deletes caused by maintaining secondary structures."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If no important caller justifies an index, it is probably cargo cult."
        },
        "checkYourself": [
          {
            "prompt": "Why is an unused secondary index still harmful?",
            "reveal": "It still costs write I/O, storage, cache pressure, and migration complexity even when no query benefits."
          }
        ]
      },
      {
        "id": "selectivity-and-covering",
        "heading": "Selectivity, covering, and planner honesty",
        "paragraphs": [
          "Low-selectivity predicates—boolean flags, a few statuses—rarely deserve leading index columns. High-selectivity predicates and equality filters usually belong leftmost, with range and sort columns following in an order that matches the query. Covering indexes include retrieved columns to avoid heap lookups when justified by read volume.",
          "Planners are good but not magical. Optional filters combined arbitrarily create an optimization problem with no stable cheap path. Constrain API query shapes so the database sees a small set of dominant plans.",
          "Lab: compare three candidate indexes for the same table and predict which queries each helps or hurts."
        ],
        "workedExample": {
          "title": "Index choice scenario card",
          "body": "Choose among candidate indexes for an orders listing workload.",
          "code": "Query A (hot): WHERE customer_id=? ORDER BY created_at DESC LIMIT 20\nQuery B (rare): WHERE status=? AND created_at > ? ORDER BY created_at\nQuery C (forbidden expensive): arbitrary AND of 6 optional filters + sort\n\nCandidates:\n  1) (customer_id, created_at DESC)\n  2) (status, created_at)\n  3) (created_at)  -- tempting, usually wrong for A\n\nDecision: ship (1) for A; consider (2) only if B is SLO-critical;\nreject unconstrained C at the API; do not create a kitchen-sink index.\nWrite-cost note: each extra index slows every order insert/update.\n",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "Narrate left-prefix rules and which query you are deliberately not optimizing."
        },
        "checkYourself": [
          {
            "prompt": "Why can an index on created_at alone fail the hot customer listing?",
            "reveal": "It may scan large time ranges then filter by customer, instead of jumping to one customer's ordered rows via a leading customer_id key."
          }
        ]
      },
      {
        "id": "pagination-and-index-order",
        "heading": "Align pagination with index order",
        "paragraphs": [
          "Offset pagination makes deep pages progressively more expensive and unstable under concurrent writes. Cursor pagination keyed on the same ordered columns as the index keeps cost stable as data grows and behaves more predictably when rows insert mid-read.",
          "Design cursor tokens as opaque encodings of the sort key, not as offsets. Document what happens when a row is deleted between pages. Seek-method queries (`(created_at, id) < (:cursor_ts, :cursor_id)`) pair naturally with composite indexes.",
          "Workshop: replace `OFFSET 10000` on a feed with a cursor plan and name the supporting index."
        ],
        "keyTerms": [
          {
            "term": "Keyset/cursor pagination",
            "definition": "Fetching the next page using the last sort key rather than an offset."
          },
          {
            "term": "Left-prefix rule",
            "definition": "A composite btree can efficiently support queries that constrain a leading subset of its columns."
          },
          {
            "term": "Heap fetch",
            "definition": "Extra lookup from index entry to table row when the index does not cover needed columns."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Pagination and indexing are the same conversation—design them together."
        },
        "checkYourself": [
          {
            "prompt": "What correctness issue can OFFSET pagination show under concurrent inserts?",
            "reveal": "Rows can shift between pages, causing duplicates or skipped items as the underlying order changes between requests."
          }
        ]
      },
      {
        "id": "hybrid-and-specialized-indexes",
        "heading": "Specialized indexes and hybrid retrieval discipline",
        "paragraphs": [
          "GIN/GiST, full-text, geospatial, and vector/ANN indexes expand what is possible, but each has write cost, recall/latency tradeoffs, and operational quirks. ANN improves candidate search; it does not make every hybrid filter-plus-sort query exact or cheap.",
          "Constrain hybrid request shapes at the API: lexical filter then vector rerank on a bounded candidate set, or metadata prefilter with documented limits. Unconstrained dashboards and RAG queries will eventually discover catastrophic plans.",
          "Lab: for a product search that filters by tenant and category then ranks by embedding similarity, propose an access path with explicit candidate caps."
        ],
        "callout": {
          "tone": "tip",
          "body": "State recall, latency, and freshness targets before choosing HNSW versus exact scan versus external search."
        },
        "checkYourself": [
          {
            "prompt": "Why must hybrid retrieval still constrain query shape?",
            "reveal": "Because combining many optional predicates with ANN and sorts yields unstable plans and cost; engines need a small set of dominant paths."
          }
        ]
      },
      {
        "id": "index-rollout-as-migration",
        "heading": "Roll out indexes like migrations",
        "paragraphs": [
          "Large live index builds consume CPU, I/O, replication bandwidth, and attention—like application migrations. Treating them as harmless DDL surprises teams with replica lag and write regressions.",
          "Use online creation where available, throttle, observe write-path latency and replication lag, and delete obsolete indexes after the new path proves itself. Stale indexes are a quiet permanent tax.",
          "Workshop: write a rollout checklist for adding `(customer_id, created_at)` on a 500 GB orders table with replicas."
        ],
        "workedExample": {
          "title": "Index rollout checklist",
          "body": "Operational gates for a hot-table index addition.",
          "code": "1. Confirm query shape + EXPLAIN on shadow traffic or staging copy\n2. Estimate build time/I/O; schedule low-traffic window if needed\n3. Create index concurrently / online; watch replica lag & write p95\n4. Gate app deploy that depends on index until build completes\n5. Verify plans flipped; add latency/error monitors on the endpoint\n6. Remove superseded indexes after a soak period\nAbort if: replica lag SLO burn or primary write p95 doubles\n",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "Never deploy code that requires an index before the index exists in production."
        },
        "checkYourself": [
          {
            "prompt": "What should you monitor during a large index build?",
            "reveal": "Primary write latency, CPU/I/O, replica lag, disk growth, and the target query's plans once the build finishes."
          }
        ]
      },
      {
        "id": "query-path-review",
        "heading": "Lab closeout: query-path design review",
        "paragraphs": [
          "Present query shapes, indexes, pagination, refused patterns, write-cost estimates, and rollout plan. Invite someone to propose an ad-hoc filter; practice saying no or naming the new index cost explicitly.",
          "Tie storage design to SLOs: a list endpoint with a p95 budget owns its access path. If the path needs a table scan at projected scale, the SLO is fiction.",
          "Capture follow-ups: statistics jobs, plan regression tests, and a quarterly unused-index audit."
        ],
        "callout": {
          "tone": "interview",
          "body": "Defend one composite index, one refused query shape, and one rollout abort condition."
        },
        "checkYourself": [
          {
            "prompt": "How do you prove an index is unused and safe to drop?",
            "reveal": "Use index-usage stats over a full business cycle, confirm no dependent plans in EXPLAIN samples, and drop during a reversible change window while watching regressions."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Indexes are contracts owned by real query shapes and write budgets.",
        "Composite key order, selectivity, and covering must match access paths.",
        "Cursor pagination should align with index order.",
        "Specialized and hybrid indexes still need API shape discipline.",
        "Index creation and deletion are operational migrations."
      ],
      "nextSteps": [
        "Write WHERE/ORDER BY for one hot API and design one composite index.",
        "Replace an OFFSET page with a cursor plan.",
        "Draft an online index rollout checklist with abort metrics."
      ]
    }
  },
  "data-storage-lab/replication-sharding-and-consistency": {
    "title": "Workshop: Replication, sharding, and consistency",
    "readingTime": "80-100 min",
    "premise": "Scale and durability choices rewrite what users can believe after a write. This lab turns freshness into product budgets, designs shard and cell boundaries, practices failover beyond leader election, and writes user-visible consistency language.",
    "parts": [
      {
        "id": "freshness-as-product-budget",
        "heading": "Make freshness a product budget",
        "paragraphs": [
          "Replica lag is manageable when treated as a budget. If a page tolerates seconds of staleness, follower reads are easy. If a path must confirm a write just completed, even tens of milliseconds may be too much unless routing stays on the primary.",
          "Write freshness windows per workflow: profile edits visible immediately to the editor, leaderboards may lag thirty seconds, analytics may lag minutes. Budgets drive routing, caching, and UX copy when the budget cannot be met.",
          "Workshop: label five screens in a social app with freshness SLOs and the read routing each implies."
        ],
        "keyTerms": [
          {
            "term": "Replica lag",
            "definition": "Delay between a primary write and its visibility on a follower."
          },
          {
            "term": "Read-your-writes",
            "definition": "A consistency expectation that a client sees its own recent writes."
          },
          {
            "term": "Freshness budget",
            "definition": "Allowed staleness for a workflow, expressed in time or versions."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If the user-facing freshness sentence sounds unacceptable, the topology is wrong for that workflow."
        },
        "checkYourself": [
          {
            "prompt": "How do you provide read-your-writes while still scaling reads?",
            "reveal": "Route that session or key to the primary for a short window, use synchronous session stickiness, or version tokens that force primary reads until caught up."
          }
        ]
      },
      {
        "id": "shard-keys-and-cells",
        "heading": "Choose shard keys and cell boundaries",
        "paragraphs": [
          "A partition key decides which records move together, which failures stay local, and how painful rebalancing becomes. In multi-region systems this often expands into a cell: a self-contained slice of compute and storage that limits blast radius and compliance scope.",
          "Preserve routing indirection. External IDs should stay stable while cell placement evolves. Hot keys and celebrity tenants need special strategies—covered more in the distributed lab—but even here you should ask whether the key distributes load and locality of transactions.",
          "Lab: propose shard keys for a multi-tenant SaaS with per-tenant admin transactions and global search as a derived system."
        ],
        "callout": {
          "tone": "warning",
          "body": "A shard key optimized only for today's inserts can imprison tomorrow's rebalancing and compliance needs."
        },
        "checkYourself": [
          {
            "prompt": "Why keep external IDs independent from shard placement?",
            "reveal": "So you can move data between shards or cells without rewriting every client reference and URL."
          }
        ]
      },
      {
        "id": "consistency-models-in-user-language",
        "heading": "Speak consistency in user language",
        "paragraphs": [
          "Eventual and strong are incomplete answers. Better language: a confirmed reservation appears immediately; a like count may lag; a cross-region inventory number may be approximate briefly. If you cannot say it to a product manager, you do not understand the tradeoff yet.",
          "Map mechanisms—single-primary, quorum, sync replicas, consensus—to those sentences. Pay for coordination only where the sentence demands it.",
          "Workshop: rewrite three infrastructure claims into user-visible guarantees and the failure modes when violated."
        ],
        "workedExample": {
          "title": "Consistency statement table",
          "body": "Bind workflows to mechanisms and user-visible guarantees.",
          "code": "Workflow              User-visible guarantee              Mechanism sketch\n--------------------- ----------------------------------- -------------------------\nSeat reservation      Confirm => seat taken immediately   Primary write + reject race\nProfile bio edit      Editor sees own write instantly     Read-your-writes routing\nLike counter          May lag up to 30s                   Async aggregate / followers\nGlobal inventory qty  Approximate across regions briefly  Per-cell stock + reconciliation\n",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "Never stop at 'eventual consistency'—finish the sentence with what the user might see."
        },
        "checkYourself": [
          {
            "prompt": "When is eventual consistency the wrong default?",
            "reveal": "When double-spending, double-booking, or legally binding confirmations can occur if two writers disagree—those workflows need stronger coordination or conflict-free reservation designs."
          }
        ]
      },
      {
        "id": "failover-after-promotion",
        "heading": "Judge failover after promotion",
        "paragraphs": [
          "Flipping a leader flag is only half of failover. Customers care whether recent writes survive, survivors stay responsive, and reads remain coherent. Repair pressure and replay traffic often dominate cost after the switch.",
          "Rehearse promotion: fencing tokens, client rediscovery, lag-based eligibility, throttled catch-up, and deliberate stale-read handling. Untested failover is a scheduled incident.",
          "Lab: write a promotion runbook checklist for a primary/replica datastore including abort and communication steps."
        ],
        "keyTerms": [
          {
            "term": "Fencing",
            "definition": "Preventing an old primary from accepting writes after a new primary is chosen."
          },
          {
            "term": "Promotion",
            "definition": "Elevating a replica to accept writes."
          },
          {
            "term": "Catch-up / repair",
            "definition": "Traffic and I/O required to reconcile replicas after faults or promotion."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A replica that is 'almost caught up' can still lose acknowledged writes if you promote carelessly—know your durability contract."
        },
        "checkYourself": [
          {
            "prompt": "What should clients do when a primary is promoted?",
            "reveal": "Rediscover endpoints via service discovery or DNS with short TTLs, refresh connections, and honor fencing so retries do not hit a demoted node."
          }
        ]
      },
      {
        "id": "rebalancing-and-routing",
        "heading": "Plan rebalancing and routing evolution",
        "paragraphs": [
          "Growth requires moving data. Dual-writes, range splits, consistent-hash ring changes, and cell evacuations all need backfill, parity checks, and traffic shifting—mirroring expand-contract thinking from systems fundamentals.",
          "Route with a control plane that can shadow reads, compare, and ramp. Measure lag, error rates, and hot-key distribution during moves.",
          "Workshop: outline moving 5 percent of tenants to a new cell without changing public tenant IDs."
        ],
        "callout": {
          "tone": "tip",
          "body": "Rebalancing is a product change to freshness and failure domains—budget it like a feature launch."
        },
        "checkYourself": [
          {
            "prompt": "What parity checks matter during a shard move?",
            "reveal": "Row counts, checksum samples, lag between old and new homes, and read/write error rates on both paths before decommissioning the old placement."
          }
        ]
      },
      {
        "id": "replication-design-review",
        "heading": "Lab closeout: topology review",
        "paragraphs": [
          "Present replication mode, freshness budgets, shard/cell keys, failover rehearsal results, and rebalancing plan. Explicitly list workflows that require stronger consistency and what you pay for them.",
          "Connect to SLOs: lag alerts, promotion time objectives, and read-repair rates belong beside availability charts.",
          "Success: a new engineer can explain what a user might see after a write in each region during steady state and during failover."
        ],
        "callout": {
          "tone": "interview",
          "body": "Defend one workflow that stays on primary reads and one that tolerates follower staleness."
        },
        "checkYourself": [
          {
            "prompt": "Why alert on replica lag as a product signal?",
            "reveal": "Because freshness budgets are user promises; lag beyond budget means follower-routed reads are violating the contract even if the primary is healthy."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Freshness budgets turn replica lag into product contracts.",
        "Shard and cell keys encode locality, blast radius, and move cost.",
        "Consistency claims must be user-visible sentences.",
        "Failover quality is judged after promotion, including fencing and repair.",
        "Rebalancing needs routing indirection and parity checks."
      ],
      "nextSteps": [
        "Label freshness budgets for five workflows and their read routing.",
        "Propose a shard/cell key with rebalancing indirection.",
        "Write a primary promotion checklist including fencing."
      ]
    }
  },
  "data-storage-lab/polyglot-storage-selection": {
    "title": "Workshop: Polyglot storage selection",
    "readingTime": "70-90 min",
    "premise": "Multiple datastores can be leverage or liability. This lab assigns authority boundaries, designs derived projections with honest freshness, scores unit economics and exit cost, and practices saying no to unnecessary specialization.",
    "parts": [
      {
        "id": "authority-boundaries",
        "heading": "Assign a system of record per business fact",
        "paragraphs": [
          "When one system clearly owns a fact, incidents ask which projections are stale instead of which truth to believe. That clarity is the hidden benefit of disciplined polyglot persistence. If search, cache, and primary tables each partially own meaning, operators argue during outages.",
          "Draw an authority map: orders in OLTP, session state in a cache with TTL and rebuild rules, search as derived, analytics in a warehouse or lakehouse. Caches are never systems of record for durable business commitments.",
          "Workshop: for booking, inventory, and search autocomplete, mark authority versus derived for each store."
        ],
        "keyTerms": [
          {
            "term": "System of record",
            "definition": "The authoritative store for a business fact."
          },
          {
            "term": "Derived store",
            "definition": "A projection rebuilt or updated from an authority for a specialized access path."
          },
          {
            "term": "Projection",
            "definition": "A stored view optimized for a query pattern, not for authority."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Authority maps are operations tools as much as architecture diagrams."
        },
        "checkYourself": [
          {
            "prompt": "Why must a cache not be the system of record for order state?",
            "reveal": "Caches evict, restart empty, and can serve stale data; durable commitments need a rebuildable authoritative store."
          }
        ]
      },
      {
        "id": "derived-freshness-honesty",
        "heading": "Be honest about derived freshness and rebuilds",
        "paragraphs": [
          "Derived indexes create value only with explicit freshness and recovery behavior. Search may lag profile edits; analytics may arrive minutes later; thumbnails may rebuild after corruption. Hidden immediacy expectations create support debt.",
          "Every derived store needs user-facing expectations, rebuild paths, operator dashboards, and a story for poison messages or failed pipelines.",
          "Lab: write the freshness SLO and rebuild runbook for a product search index fed from OLTP events."
        ],
        "callout": {
          "tone": "warning",
          "body": "A derived store without a rebuild path is a time bomb."
        },
        "checkYourself": [
          {
            "prompt": "What should users see when search lag exceeds budget?",
            "reveal": "Honest degradation—stale markers, delayed badges, or fallback to primary lookups for critical reads—not silently wrong results presented as fresh."
          }
        ]
      },
      {
        "id": "fit-scorecard-lab",
        "heading": "Worked lab: storage fit scorecard",
        "paragraphs": [
          "Score candidates on query shape, consistency needs, scale, operational skill, cost, and exit options. Specialization wins when workload pain or product leverage is real—not when a blog post is exciting.",
          "Compare keeping vectors in Postgres with pgvector versus a specialized ANN service; compare OLTP reporting versus a lakehouse table format for analytics. Include rebuild and dual-run cost in the score.",
          "Practice rejecting a third datastore when a second access path can be served by the existing authority with acceptable cost."
        ],
        "workedExample": {
          "title": "Polyglot selection scorecard",
          "body": "Compare options for product semantic search.",
          "code": "Need: tenant-scoped semantic product search, filters by category,\n      freshness <= 2 min, team already runs Postgres.\n\nOption A: pgvector in OLTP Postgres\n  +: joins, one ops surface, ACID with product rows\n  -: ANN + heavy write compaction risk on primary; noisy neighbor\n\nOption B: specialized vector DB + events from OLTP\n  +: tuned ANN, isolate load\n  -: second ops/IAM/backup surface; sync lag; dual authority temptation\n\nOption C: embed search in OpenSearch/Elastic already used for text\n  +: one search platform for lexical+vector if supported\n  -: cluster cost; rebuild complexity; skill overlap check\n\nDecision sketch: if QPS modest, start A or C with clear derived role;\nmove to B only when measured latency/CPU on primary forces isolation.\nExit criteria required before B: replayable events + parity harness.\n",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "Show entrance criteria and exit criteria before advocating a new store."
        },
        "checkYourself": [
          {
            "prompt": "What operational costs multiply with each added datastore?",
            "reveal": "Backups, IAM, monitoring, paging skill, testing matrices, and failure modes on every data-movement edge between stores."
          }
        ]
      },
      {
        "id": "unit-economics-of-stores",
        "heading": "Include unit economics in fit quality",
        "paragraphs": [
          "Every datastore multiplies tools and on-call knowledge nonlinearly because movement paths add failure matrices. Query cost, compaction, storage class, and full rebuild cost are design inputs.",
          "Attribute cost to product actions: media uploads, chat fan-out, analytics reprocessing. Architecture that ignores unit cost eventually gets rewritten by finance under duress.",
          "Workshop: estimate monthly cost drivers for OLTP + search + warehouse and name the top lever to cut without harming the user promise."
        ],
        "callout": {
          "tone": "tip",
          "body": "Polyglot is strongest when it expresses necessity, not enthusiasm."
        },
        "checkYourself": [
          {
            "prompt": "When is a warehouse the wrong place for an operational read?",
            "reveal": "When the read needs low-latency transactional freshness or is on the user critical path the warehouse was not designed to serve."
          }
        ]
      },
      {
        "id": "exit-cost-and-parity",
        "heading": "Design exit cost and parity from day one",
        "paragraphs": [
          "Adoption risk is higher when replay, backfill, and parity validation are impossible. Evaluate new stores with entrance and exit criteria. Preserve the ability to leave without stopping the product.",
          "Dual-run windows, checksum jobs, and traffic shadowing make exits and entries safer. Event schemas should be versioned so projections can rebuild.",
          "Lab: write exit criteria for adopting a specialized cache or search cluster."
        ],
        "keyTerms": [
          {
            "term": "Dual run",
            "definition": "Operating old and new paths together to compare parity before cutover."
          },
          {
            "term": "Replay",
            "definition": "Rebuilding derived state by reprocessing authoritative events or snapshots."
          },
          {
            "term": "Exit criteria",
            "definition": "Predeclared conditions under which a store can be replaced or removed."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "A store you cannot rebuild from authority is an accidental second system of record."
        },
        "checkYourself": [
          {
            "prompt": "What makes a derived store replaceable?",
            "reveal": "A complete rebuild path from authority, versioned contracts, and parity checks that prove the replacement before traffic moves."
          }
        ]
      },
      {
        "id": "polyglot-review-closeout",
        "heading": "Lab closeout: polyglot architecture review",
        "paragraphs": [
          "Present authority maps, derived freshness SLOs, scorecards, cost drivers, and exit plans. Explicitly list datastores you refuse to add and why.",
          "Connect on-call: each store needs a pager owner and a dependency in the incident dashboard. Orphan stores become mystery outages.",
          "Success: the team shares one diagram of truth versus projections and can rebuild any projection from documented inputs."
        ],
        "callout": {
          "tone": "warning",
          "body": "If two stores can disagree on a money or inventory fact with no resolver, you do not have polyglot design—you have a split brain."
        },
        "checkYourself": [
          {
            "prompt": "What question ends a polyglot design review?",
            "reveal": "For each business fact, which store wins in a conflict, and how do we detect and repair divergence?"
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Authority boundaries turn multi-store systems into operable designs.",
        "Derived stores need freshness honesty and rebuild paths.",
        "Selection scorecards include ops load, cost, and exit criteria.",
        "Unit economics belong in storage fit, not only in finance reviews.",
        "Replay and parity preserve the freedom to change later."
      ],
      "nextSteps": [
        "Draw an authority-versus-derived map for one product slice.",
        "Fill a scorecard comparing two stores for one access path.",
        "Write rebuild and parity steps for one derived index."
      ]
    }
  }
};
