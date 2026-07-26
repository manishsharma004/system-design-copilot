/** Exhaustive HLD learning expansion labs (data storage, security, distributed systems).
 * Source of truth: scripts/hld_lab_content.py — regenerate with
 * `python3 scripts/build_hld_exhaustive_labs.py`.
 */
export const rawHldExhaustiveLabModules = [
  {
    "slug": "data-storage-lab",
    "title": "Data storage lab",
    "summary": "Go beyond basic storage primers by connecting schema, indexing, replication, and engine choice to real production query paths and failure behavior.",
    "objectives": [
      "Design storage from the query and mutation paths users actually exercise",
      "Explain how replicas, shards, and consistency affect customer-visible behavior",
      "Choose a small portfolio of datastores with clear authority and projection boundaries"
    ],
    "lessons": [
      {
        "slug": "indexing-and-query-path-design",
        "title": "Indexing and query path design",
        "summary": "Design tables, secondary indexes, and pagination paths from concrete production queries instead of from abstract schema diagrams alone.",
        "duration": "60-75 min",
        "whyItMatters": "Storage costs are paid continuously, but bad query paths are paid in every p95 and every incident review. Senior HLD answers are stronger when they can connect a user-facing read or write path to the exact key order, access pattern, and operational cost inside the datastore.",
        "sections": [
          {
            "heading": "Start from the request path, not the entity list",
            "body": "A credible indexing plan starts with the user request that must finish on time, not with a whiteboard full of nouns. If an operator dashboard always filters by tenant, status, and a descending created-at cursor, then the database path is already constrained. The winning design is the one that can answer that exact shape with stable latency as cardinality grows, not the one that looks maximally normalized in a vacuum.\n\nTeams get into trouble when the data model and the query model drift apart. They add optional filters, free-form sorting, and ad hoc admin exports until the hot path silently turns into a scan plus sort plus heap lookup storm. Query path design means deciding which predicates are first-class, which sorts are allowed, which pages are cursor-based, and which exploratory questions belong in search, analytics, or offline systems instead of the transactional read path.",
            "bullets": [
              "Write down the exact tenant, filter, sort, and pagination shape of the hot request before discussing indexes.",
              "Distinguish online serving queries from ad hoc analytics so one indexing strategy is not forced to serve incompatible workloads.",
              "Treat pagination strategy and index strategy as one decision because the cursor usually depends on the same ordered key set."
            ]
          },
          {
            "heading": "Primary keys and composite indexes encode the read contract",
            "body": "Primary keys describe authority and uniqueness, but secondary indexes describe how the system is actually consumed. Composite B-tree keys still follow the same rule in 2026: equality filters first, then range filters or sort columns, because the leftmost key order determines how much of the tree the engine must walk. A tenant-scoped workload usually wants tenant_id near the front so one large customer does not cause cross-tenant scans on every query. When the request path is semantic rather than exact-match, the same discipline applies in a different form: choose whether metadata filters narrow the candidate set first, then pick the ANN structure that fits the recall and latency budget.\n\nThe strongest production-minded answers talk about what the index costs on writes as well as what it saves on reads. Every extra secondary index adds write amplification, storage, vacuum or compaction work, and longer failover catch-up. Vector indexes do not remove that trade-off; they add their own knobs. HNSW often buys lower latency and stronger recall at the cost of heavier memory and update work, while IVF-style layouts can be cheaper to build but may need more tuning and can lose recall under tight latency budgets. Common production answers now mention pgvector for relational adjacency and GIN or other metadata indexes for hybrid filtering, but they still defend the long-term write and storage bill.",
            "bullets": [
              "Order composite indexes so the most selective equality predicates and ownership boundaries come first.",
              "Prefer a small number of intentionally reused composite indexes over many one-off indexes per endpoint.",
              "Account for write amplification, ANN maintenance cost, backfill time, and replica catch-up when proposing new indexes."
            ],
            "codeExample": {
              "title": "Composite index for a tenant-scoped recent-orders query",
              "language": "sql",
              "code": "CREATE TABLE orders (\n  order_id BIGSERIAL PRIMARY KEY,\n  tenant_id BIGINT NOT NULL,\n  user_id BIGINT NOT NULL,\n  status TEXT NOT NULL,\n  total_cents BIGINT NOT NULL,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_orders_tenant_status_created\n  ON orders (tenant_id, status, created_at DESC, order_id DESC);\n\n-- Supports:\n-- WHERE tenant_id = $1 AND status = $2\n-- ORDER BY created_at DESC, order_id DESC\n-- LIMIT 50"
            }
          },
          {
            "heading": "Covering, partial, and purpose-built indexes should buy a specific win",
            "body": "Once the hot path is known, the next question is whether the index can avoid extra table lookups. Covering indexes, included columns, or clustered layouts can reduce heap visits for read-heavy screens that only need a narrow projection. Partial indexes are even more focused: they index only the rows that matter to a recurring filter such as active subscriptions or unprocessed jobs, so they keep both the structure and the write overhead smaller than a full-table secondary index.\n\nThe trap is building clever indexes with no explicit latency or cost hypothesis. A partial index on pending jobs is useful if dispatchers mostly read pending jobs. It is wasted if the workload quickly shifts to scanning all jobs by tenant. In review, ask which query becomes faster, how much data the index excludes, how the planner chooses it, and what fallback path exists if the query shape changes after product evolution.",
            "bullets": [
              "Use covering indexes only for projections that are stable enough to justify the extra bytes and maintenance.",
              "Use partial indexes when a narrow subset of rows dominates the hot path.",
              "Validate with explain plans and production cardinality, not just with local dev data."
            ],
            "codeExample": {
              "title": "Partial index for pending job dispatch",
              "language": "sql",
              "code": "CREATE TABLE delivery_jobs (\n  job_id BIGSERIAL PRIMARY KEY,\n  tenant_id BIGINT NOT NULL,\n  state TEXT NOT NULL,\n  run_after TIMESTAMPTZ NOT NULL,\n  payload JSONB NOT NULL\n);\n\nCREATE INDEX idx_delivery_jobs_ready\n  ON delivery_jobs (tenant_id, run_after ASC, job_id ASC)\n  WHERE state = 'pending';\n\nEXPLAIN ANALYZE\nSELECT job_id, run_after\nFROM delivery_jobs\nWHERE tenant_id = 42\n  AND state = 'pending'\n  AND run_after <= now()\nORDER BY run_after ASC, job_id ASC\nLIMIT 100;"
            }
          },
          {
            "heading": "Guard the planner and retrieval layer from accidental fan-out",
            "body": "A mature query path design constrains what the application is allowed to ask for, whether the path is B-tree-backed, full-text, or ANN-backed. Product teams often want dynamic filtering, flexible sorting, and now semantic retrieval on the same endpoint, but letting one request combine arbitrary metadata filters, deep pagination, hybrid ranking, and cross-tenant exploration produces a combinatorial explosion that no practical indexing plan can cover. If the application only exposes supported predicates, bounded candidate sizes, and approved ranking modes, storage remains predictable and on-call engineers are not surprised by one exploratory prompt consuming half the IOPS budget.\n\nThis is where service design and storage design meet. Good APIs encode safe query shapes with explicit sort enums, cursor tokens, hybrid-search flags, and bounded filters. Semantic or RAG endpoints should still state whether lexical filters run first, whether metadata is indexed with GIN or equivalent structures, whether pgvector is sufficient, and what recall target justifies HNSW versus IVF-style indexes. Unsafe exploratory queries can be rejected, routed to asynchronous evaluation, or served from search and analytics systems that were designed for broad access. The goal is not to deny product flexibility. It is to separate the sub-second serving path from the slower but more expressive investigative path.",
            "bullets": [
              "Whitelist allowed filter, sort, and retrieval-mode combinations on hot endpoints instead of letting arbitrary SQL-like or semantic requests through.",
              "Set explicit ANN candidate limits and recall goals so semantic retrieval remains a designed serving path rather than an unbounded experiment.",
              "Send broad exploratory queries to exports, search indexes, or warehouses rather than stretching the OLTP path beyond its purpose."
            ],
            "codeExample": {
              "title": "Hybrid metadata and vector indexing with pgvector",
              "language": "sql",
              "code": "CREATE EXTENSION IF NOT EXISTS vector;\n\nCREATE TABLE knowledge_chunks (\n  chunk_id BIGSERIAL PRIMARY KEY,\n  tenant_id BIGINT NOT NULL,\n  doc_id BIGINT NOT NULL,\n  metadata JSONB NOT NULL,\n  searchable tsvector NOT NULL,\n  embedding vector(1536) NOT NULL\n);\n\nCREATE INDEX idx_chunks_tenant_doc\n  ON knowledge_chunks (tenant_id, doc_id);\n\nCREATE INDEX idx_chunks_searchable\n  ON knowledge_chunks USING GIN (searchable);\n\nCREATE INDEX idx_chunks_embedding_hnsw\n  ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);\n\n-- HNSW usually buys lower latency and higher recall than IVFFlat,\n-- but it costs more memory and update work on active collections.\n\nSELECT chunk_id\nFROM knowledge_chunks\nWHERE tenant_id = $1\n  AND metadata @> '{\"doc_type\":\"policy\"}'\nORDER BY embedding <=> $2\nLIMIT 20;"
            }
          },
          {
            "heading": "Index rollouts are operational changes, not only DDL statements",
            "body": "Adding an index to a live high-cardinality table can be one of the most expensive safe-looking changes a team makes. Even online builds consume CPU, I/O, and replication bandwidth. A new index can increase write latency, expand storage enough to trigger maintenance churn, or extend recovery time after failover because replicas must catch up more bytes. Vector indexes amplify the same concern because ANN graph builds or centroid training can be expensive and rebuild windows matter when embeddings are refreshed in bulk. Production teams therefore stage index changes with measured rollout criteria instead of treating them as routine migrations.\n\nThe safest rollout path ties the new index to a read-migration plan. Build the index, watch build progress and replica lag, shadow the new query plan or route a small read cohort to the new access path, and only then remove the old path or old index. If the new plan improves p95 but hurts write latency, recall, or storage growth, that trade-off should be visible before the change becomes permanent. Good HLD answers say which metrics prove the rollout is safe.",
            "bullets": [
              "Track index build progress, replica lag, write latency, storage growth, and any recall regression during large index changes.",
              "Roll reads onto the new index gradually when possible instead of coupling index creation and query-plan dependence in one deploy.",
              "Delete obsolete indexes after observation windows so write paths do not carry historical baggage forever."
            ],
            "codeExample": {
              "title": "Simple index-rollout readiness check",
              "language": "python",
              "code": "metrics = {\n    'replica_lag_seconds': 2,\n    'write_p95_ms_delta': 1.8,\n    'index_build_progress': 100,\n    'storage_growth_gb': 18,\n}\n\ndef ready_to_shift_reads(m):\n    return (\n        m['index_build_progress'] == 100\n        and m['replica_lag_seconds'] <= 5\n        and m['write_p95_ms_delta'] <= 3\n        and m['storage_growth_gb'] <= 25\n    )\n\nprint('safe_to_shift_reads=', ready_to_shift_reads(metrics))"
            }
          },
          {
            "heading": "Interview framing: defend one hot query and one painful failure mode",
            "body": "When you teach this topic back in an interview, anchor the discussion on one read path and one write path. State the user contract, show the table and the exact composite index, explain why the key order matches the predicates and sort, then mention what happens when the query becomes broader than intended. This keeps the answer concrete and demonstrates that you can connect logical modeling to physical execution.\n\nThen close with an operational failure mode. Maybe the main risk is scan amplification from a new filter, maybe it is write slowdown from too many indexes, or maybe it is a replica lag spike during index build. That final step is where the answer stops sounding like textbook SQL and starts sounding like production architecture. Indexing is not only about faster queries; it is about owning the long-term read-write trade-off of a live system.",
            "bullets": [
              "Tie the proposed index to one endpoint, one sort order, and one growth assumption.",
              "Say explicitly what query shapes are unsupported or moved to offline paths.",
              "Name the operational metric that would tell you the indexing strategy is starting to fail in production."
            ]
          }
        ],
        "checklist": [
          "Identify the exact predicates, sort order, projection, and pagination style of the hot request.",
          "Choose one primary key and a small number of composite indexes that directly support those shapes.",
          "Explain whether any query should use a covering or partial index and why.",
          "Constrain unsupported filter and sort combinations at the API layer.",
          "Describe the write-amplification and storage cost of every proposed secondary index, including ANN indexes used for semantic retrieval.",
          "State how you would roll out and validate a new index on a live high-cardinality table."
        ],
        "pitfalls": [
          "Indexing every field mentioned in a product spec without ranking the actual hot queries.",
          "Allowing arbitrary sorts and filters on a latency-sensitive serving path.",
          "Optimizing explain plans on tiny local datasets and ignoring production cardinality and skew.",
          "Keeping stale indexes forever, which makes write latency and failover catch-up worse over time.",
          "Treating online index creation as risk-free even though it still consumes bandwidth and replica capacity."
        ],
        "interviewPrompts": [
          "How would you design the indexes for a tenant-scoped order-history API sorted by recency?",
          "When is a partial index better than a full secondary index?",
          "Why can dynamic sorting and filtering break an otherwise good storage design?",
          "How would you roll out a new index on a 500 million row table without surprising the on-call team?"
        ],
        "likelyAnswerPoints": [
          "A strong answer starts from the exact request path, then chooses a composite index whose left-to-right key order matches equality filters first and ordering or range filters second.",
          "You should mention that each extra index costs write throughput, storage, and recovery bandwidth, so the goal is a minimal intentional set rather than universal indexing. That same reasoning now applies to ANN structures such as HNSW or IVF in semantic paths.",
          "If product needs broad exploratory filtering or hybrid semantic retrieval, route that workload to search, vector-aware projections, or analytics instead of forcing the OLTP path to support every query shape synchronously.",
          "Production maturity shows up in the rollout plan: online build, replica lag monitoring, shadow or canary reads, recall-versus-latency checks for semantic search, and cleanup of superseded indexes after confidence grows."
        ],
        "exercises": [
          {
            "id": "merchant-order-history-query-path",
            "title": "Design a merchant order-history read path",
            "difficulty": "intermediate",
            "type": "design",
            "description": "Design the schema and index plan for a B2B merchant dashboard that lists recent paid or refunded orders per merchant, supports cursor pagination, and occasionally exports a 90-day CSV.",
            "promptQuestions": [
              "Which filters and sorts belong on the synchronous UI endpoint, and which belong on an asynchronous export path?",
              "What composite index would you create for the common recent-orders read?",
              "How would you keep the design safe if product later asks for sorting by total amount or filtering by many optional fields?",
              "Which rollout and observability steps would you use when adding the first large secondary index to the orders table?"
            ],
            "hints": [
              "Start from one exact screen query instead of from every possible reporting need.",
              "Use cursor pagination so the index order and page token align cleanly.",
              "Call out write cost and export-job isolation explicitly."
            ]
          },
          {
            "id": "left-prefix-index-picker",
            "title": "Pick the best index by left-prefix match",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete a Python helper that scores candidate indexes for a query whose equality filters and sort order are already known.",
            "starterCode": "query = {\n    'filters': ['tenant_id', 'status'],\n    'sort': ['created_at', 'order_id'],\n}\nindexes = [\n    ('idx_a', ['status', 'tenant_id', 'created_at']),\n    ('idx_b', ['tenant_id', 'status', 'created_at', 'order_id']),\n    ('idx_c', ['tenant_id', 'created_at']),\n]\n\ndef score_index(query, columns):\n    # TODO: return how many query columns match from the start of the index.\n    # Filters should be matched before the sort columns.\n    pass\n\n# TODO: print the index name with the highest score. Expected: idx_b",
            "solution": "query = {\n    'filters': ['tenant_id', 'status'],\n    'sort': ['created_at', 'order_id'],\n}\nindexes = [\n    ('idx_a', ['status', 'tenant_id', 'created_at']),\n    ('idx_b', ['tenant_id', 'status', 'created_at', 'order_id']),\n    ('idx_c', ['tenant_id', 'created_at']),\n]\n\ndef score_index(query, columns):\n    wanted = query['filters'] + query['sort']\n    matched = 0\n    for expected, actual in zip(wanted, columns):\n        if expected != actual:\n            break\n        matched += 1\n    return matched\n\nbest = max(indexes, key=lambda pair: score_index(query, pair[1]))\nprint(best[0])",
            "expectedOutput": "The program should print idx_b because it preserves the full left-prefix of tenant_id, status, created_at, and order_id."
          }
        ],
        "diagram": null,
        "related": [
          "relational-data-modeling",
          "storage-selection",
          "caching-layers",
          "api-design",
          "observability"
        ]
      },
      {
        "slug": "replication-sharding-and-consistency",
        "title": "Replication, sharding, and consistency",
        "summary": "Choose replica topologies, shard keys, and user-visible consistency contracts that match the business risk of stale or lost data.",
        "duration": "60-75 min",
        "whyItMatters": "Many HLD answers name replicas and shards quickly, but senior answers explain what users actually observe when replicas lag, a leader fails, or a shard becomes hot. This lesson trains that product-facing explanation.",
        "sections": [
          {
            "heading": "Begin with the correctness contract before naming topology",
            "body": "The right replication and sharding design depends on what the product must not get wrong. An inventory reservation flow, a bank balance read, and a social-feed view are all data-serving problems, but their tolerance for stale reads and lost writes is radically different. If the system cannot state what read-after-write, monotonic, or cross-entity guarantees the user journey needs, any discussion of leaders, replicas, or shards becomes architecture theater.\n\nThat is why strong design reviews start with a matrix of flows instead of with infrastructure defaults. Reads that can lag by a few seconds might go to replicas or regional followers. Reads that immediately confirm a write may need primary reads, session stickiness, or a token that proves the write has propagated. In 2026 you also have to add residency and write-affinity rules to that matrix: which tenant or jurisdiction must keep writes in-region, which user journeys may cross region boundaries, and which flows need a self-contained cell so one regional or software failure does not become a global incident.",
            "bullets": [
              "Write down which user actions require fresh reads and which can tolerate bounded staleness.",
              "Separate durability promises from freshness promises because some flows need one more than the other.",
              "Treat shards as throughput and data-placement tools, not automatic correctness mechanisms."
            ]
          },
          {
            "heading": "Replica topology and regional write affinity change what a read can honestly promise",
            "body": "Leader-follower replication keeps one authoritative write owner, which simplifies conflict handling but introduces replica lag and failover nuance. Asynchronous followers are cheap for read scale and region-local reads, yet they cannot promise immediate freshness after a write unless the client is explicitly routed to the leader or to a follower that has caught up past a known log position. Synchronous replication improves durability but spends more latency and coordination budget on every write. Multi-region systems now often add write affinity as a first-class rule: a tenant or account has a home region or home cell where authoritative writes land, even if global reads or projections fan out elsewhere.\n\nThe production question is not whether replicas are good. It is which requests can safely consume follower state and which requests must stay inside a residency or write-affinity boundary. A catalog page can probably read slightly stale availability counts; a just-changed password or revoked admin role usually cannot. Mature systems encode that distinction in routing rules, session semantics, per-request consistency flags, and regional routing policies so engineers do not accidentally confirm a critical write from a lagging or non-compliant location.",
            "bullets": [
              "Use follower reads only where the product can tolerate the replica freshness window.",
              "Plan a read-after-write strategy such as primary reads, session stickiness, or log-position tokens for sensitive flows.",
              "Expect synchronous durability gains and cross-region write policies to cost extra coordination latency on the write path."
            ],
            "codeExample": {
              "title": "Route fresh reads away from lagging replicas",
              "language": "python",
              "code": "replicas = [\n    {'name': 'replica-a', 'lag_ms': 45},\n    {'name': 'replica-b', 'lag_ms': 380},\n]\n\ndef pick_read_target(require_fresh_within_ms):\n    if require_fresh_within_ms == 0:\n        return 'primary'\n    eligible = [r['name'] for r in replicas if r['lag_ms'] <= require_fresh_within_ms]\n    return eligible[0] if eligible else 'primary'\n\nprint(pick_read_target(100))\nprint(pick_read_target(0))"
            }
          },
          {
            "heading": "Shard keys and cell boundaries are product decisions with long half-lives",
            "body": "Sharding should follow the dominant ownership or locality dimension of the workload. User-owned data often shards well by user or tenant. Marketplace data may shard by merchant or region. Modern cell-based systems go one step further and make the cell self-contained: each cell owns its compute, storage, and failure domain for a subset of tenants or geography, with a thin router deciding where the request belongs. Time-based keys can look attractive for recent-write workloads but frequently create hot partitions unless they are bucketed or combined with another spreading dimension. Once a shard key or cell mapping is embedded in routing, background jobs, and client caches, changing it becomes expensive.\n\nThe best designs therefore ask two uncomfortable questions early. First, will the key distribute both reads and writes under the worst product success case, not merely under today's average? Second, does the key keep the most important multi-record operations local enough to avoid constant scatter-gather queries or cross-shard transactions while still respecting residency? If the answer to either question is weak, the team should reconsider the key before the system scales into a corner. Good interview answers explicitly connect shard choice to blast radius, compliance routing, and cell migration cost.",
            "bullets": [
              "Choose a shard key and cell boundary that spread load, preserve locality, and align with failure or residency boundaries for the most important workflow.",
              "Model celebrity tenants, flash sales, and bursty regions explicitly instead of assuming even distribution.",
              "Assume that re-sharding or moving tenants between cells later is possible but costly, so invest in key choice early."
            ],
            "codeExample": {
              "title": "Route a tenant write to its home cell",
              "language": "javascript",
              "code": "const tenantDirectory = {\n  'merchant-42': { cell: 'eu-cell-a', residencyRegion: 'eu-west-1' },\n  'merchant-77': { cell: 'us-cell-c', residencyRegion: 'us-east-1' }\n};\n\nfunction routeWrite({ tenantId, callerRegion }) {\n  const assignment = tenantDirectory[tenantId];\n  if (!assignment) throw new Error('unknown tenant');\n  return {\n    cell: assignment.cell,\n    region: assignment.residencyRegion,\n    crossRegionHop: callerRegion !== assignment.residencyRegion\n  };\n}\n\nconsole.log(routeWrite({ tenantId: 'merchant-42', callerRegion: 'eu-west-1' }));"
            }
          },
          {
            "heading": "Consistency should be described as a user experience, not as a slogan",
            "body": "Terms like eventual consistency and strong consistency are too coarse to guide product decisions by themselves. A better explanation says what a specific user might see. For example, after changing a shipping address, the order-confirmation page must show the new value immediately, but a cross-region analytics panel can lag by thirty seconds. That description tells engineers where synchronous coordination is worth the price and where asynchronous propagation is acceptable.\n\nThis user-visible framing also clarifies mitigation patterns. If stale reads are tolerable, maybe the UI shows a last-updated timestamp or a pending state. If they are not tolerable, the API might read from primary until a session token proves followers have caught up. If cross-shard totals lag, perhaps the product treats them as approximate counters and labels them accordingly. Good HLD answers acknowledge that consistency is a product contract with UX consequences, not merely a storage setting.",
            "bullets": [
              "Translate consistency vocabulary into what a user sees immediately after a write.",
              "Use explicit read-routing or pending-state patterns when follower lag would otherwise violate the user contract.",
              "Mark approximate or delayed aggregates honestly instead of pretending every view is strongly fresh."
            ],
            "codeExample": {
              "title": "Schema support for read-after-write confirmation",
              "language": "sql",
              "code": "CREATE TABLE account_updates (\n  update_id BIGSERIAL PRIMARY KEY,\n  account_id BIGINT NOT NULL,\n  committed_lsn BIGINT NOT NULL,\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\n-- The API can return committed_lsn with the write response.\n-- A subsequent read can require follower replay >= committed_lsn,\n-- otherwise the request is routed to the primary."
            }
          },
          {
            "heading": "Failover and repair are often harder than steady-state serving",
            "body": "A design that looks elegant when every node is healthy can behave badly during promotion, catch-up, and repair. If a leader fails under heavy write load, survivors may be both serving traffic and replaying logs. If a hot shard is moved, caches churn and retry storms appear. If a replica is promoted while still behind, the system may meet an uptime target but lose user trust because the newest confirmed writes disappeared. In cell-based systems the same lesson applies one level higher: fail in-cell first if possible, and only escalate to cross-cell evacuation when the local blast radius boundary is truly compromised. These are not edge cases; they are the moments users remember.\n\nThat is why resilient teams design for degraded transitions, not just for normal topology. Promotion rules should include lag guardrails. Catch-up traffic may need throttling. Clients need a clear way to discover the new primary or new routing map. Operators need metrics for replica lag, shard skew, rebalance progress, repair backlog, and any residency-policy violations triggered during failover. The best HLD answers therefore name repair behavior and incident safeguards, not merely replication diagrams.",
            "bullets": [
              "Guard failover with freshness thresholds so a stale follower is not promoted into user-visible data loss.",
              "Throttle catch-up and rebalance work so repair traffic does not collapse the remaining healthy nodes.",
              "Make routing-map, cell-router, and primary-discovery behavior explicit for both clients and operators."
            ],
            "codeExample": {
              "title": "Promotion guard based on follower lag",
              "language": "python",
              "code": "candidate = {'node': 'replica-b', 'lag_ms': 1200, 'healthy': True}\n\ndef can_promote(replica, max_lag_ms=500):\n    return replica['healthy'] and replica['lag_ms'] <= max_lag_ms\n\nprint('promote=', can_promote(candidate))"
            }
          },
          {
            "heading": "Interview framing: tie topology choices back to business pain avoided",
            "body": "A strong interview answer here sounds like: this workflow writes to one primary because duplicate or conflicting writes are expensive; these reads can use followers because a short freshness window is acceptable; the table shards by merchant because write ownership and operational isolation follow merchants; and a hot merchant is handled with caching plus selective partition spreading. That sequence shows judgement rather than pattern memorization.\n\nAlways end by naming one trade-off you are deliberately accepting. Maybe follower reads are slightly stale. Maybe cross-shard reporting is asynchronous. Maybe failover takes an extra few seconds because promotion safety matters more than the fastest possible switch. Senior answers become credible when they show that the candidate can say both what the system does well and what cost the business is consciously paying for that behavior.",
            "bullets": [
              "Explain who owns writes, who can serve reads, and what freshness each user journey gets.",
              "Defend the shard key with both throughput reasoning and workflow locality reasoning.",
              "Say explicitly what trade-off the topology accepts in latency, freshness, or operational complexity."
            ]
          }
        ],
        "checklist": [
          "Define which flows require immediate freshness, which require durability, and which can tolerate lag.",
          "Choose a replica topology and say exactly which requests are allowed to read from followers.",
          "Pick and justify a shard key and, if relevant, a cell boundary using load distribution, workflow locality, and residency rules.",
          "Describe at least one read-after-write or monotonic-read mitigation for sensitive flows.",
          "Explain failover guardrails, client discovery of the new primary, and catch-up behavior after promotion.",
          "Track shard skew, replica lag, retry amplification, repair backlog, and cross-region routing exceptions as first-class operating signals."
        ],
        "pitfalls": [
          "Saying eventual consistency is fine without naming which user experience becomes stale and for how long.",
          "Choosing a shard key that mirrors traffic bursts and creates predictable hotspots.",
          "Ignoring data-residency or write-affinity constraints until the topology is already globally coupled.",
          "Promoting a lagging replica in the name of uptime while hiding effective data loss from the design discussion.",
          "Assuming follower reads are free even when product workflows need immediate confirmation of the latest write.",
          "Ignoring the operational cost of rebalancing, catch-up traffic, and cache churn during topology changes."
        ],
        "interviewPrompts": [
          "When should a system force reads to the primary instead of to replicas?",
          "How would you choose a shard key for a multi-tenant commerce platform?",
          "What does eventual consistency mean in user-visible terms for an order-management product?",
          "Why can a failover that preserves uptime still feel like a correctness outage to customers?"
        ],
        "likelyAnswerPoints": [
          "Good topology design starts by classifying user journeys by freshness and durability needs instead of by assuming every read can use replicas.",
          "Leader-follower replication is often the simplest write-ownership model, but it requires an explicit read-after-write strategy for sensitive flows.",
          "A shard key or cell boundary should be judged by distribution under skew, by whether it keeps the most important multi-record operations local enough to avoid constant scatter-gather work, and by whether it honors data residency cleanly.",
          "Operational maturity shows up in failover and repair: promotion lag thresholds, catch-up throttling, cell-local isolation, routing discovery, and metrics for skew and replica freshness."
        ],
        "exercises": [
          {
            "id": "inventory-topology-consistency-plan",
            "title": "Design inventory serving with bounded staleness",
            "difficulty": "advanced",
            "type": "design",
            "description": "Design the storage topology for a global inventory service where reservation writes must be authoritative, product-detail reads can lag slightly, and some merchants are dramatically hotter than others.",
            "promptQuestions": [
              "Which requests must hit the primary or a fresh-enough follower, and why?",
              "What shard key would you choose for inventory ownership and for merchant-facing dashboards?",
              "How would you protect the system during leader failover if the hottest merchant shard is already under pressure?",
              "What user-facing behavior would you expose when read freshness temporarily cannot be guaranteed?"
            ],
            "hints": [
              "Separate reservation confirmation from general browse traffic.",
              "Model a celebrity merchant or flash sale instead of only average load.",
              "Be honest about what failover safety costs in latency or recovery time."
            ]
          },
          {
            "id": "freshness-aware-read-router",
            "title": "Implement a freshness-aware read router",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete the Python function so stale-tolerant reads can use eligible replicas while fresh reads fall back to the primary.",
            "starterCode": "replicas = [\n    {'name': 'r1', 'lag_ms': 25},\n    {'name': 'r2', 'lag_ms': 240},\n]\n\ndef route_read(required_freshness_ms):\n    # TODO: if required_freshness_ms is 0, return 'primary'.\n    # TODO: otherwise choose the first replica whose lag is <= required_freshness_ms.\n    # TODO: if none qualify, return 'primary'.\n    pass\n\nprint(route_read(100))  # expected r1\nprint(route_read(0))    # expected primary",
            "solution": "replicas = [\n    {'name': 'r1', 'lag_ms': 25},\n    {'name': 'r2', 'lag_ms': 240},\n]\n\ndef route_read(required_freshness_ms):\n    if required_freshness_ms == 0:\n        return 'primary'\n    for replica in replicas:\n        if replica['lag_ms'] <= required_freshness_ms:\n            return replica['name']\n    return 'primary'\n\nprint(route_read(100))\nprint(route_read(0))",
            "expectedOutput": "The router should select r1 for a 100 ms freshness budget and primary for a strict read-after-write request."
          }
        ],
        "diagram": null,
        "related": [
          "replication-and-failover",
          "partitioning-and-sharding",
          "multi-region-disaster-recovery",
          "idempotency-retries-backpressure",
          "observability"
        ]
      },
      {
        "slug": "polyglot-storage-selection",
        "title": "Polyglot storage selection",
        "summary": "Choose a small, coherent portfolio of datastores where each engine has a clear authority boundary and access-pattern justification.",
        "duration": "60-75 min",
        "whyItMatters": "Real systems rarely use one datastore for everything, but weak designs add engines casually and create synchronization debt. Strong HLD answers can explain why one system is authoritative, why another is derived, and how data moves safely between them.",
        "sections": [
          {
            "heading": "Start with the source of truth and the business invariant",
            "body": "Polyglot persistence works when every datastore has a specific job and a clear relationship to the business invariant. Orders, payments, and entitlement changes often want a strongly authoritative system with durable transactional guarantees. Search indexes, recommendation features, and cache entries are usually derived views whose job is speed, retrieval quality, or fan-out efficiency rather than first-write correctness.\n\nThe fastest way to make a multi-store design confusing is to let two systems believe they are both authoritative for the same domain fact. When that happens, every incident becomes a reconciliation argument. Good selection starts by naming which system owns the legal or product truth, which systems are read-optimized derivatives, what lag is acceptable between them, and how each consumer should behave when the derivative is behind or rebuilding.",
            "bullets": [
              "Pick the authoritative system by invariant, not by habit or benchmark headlines.",
              "Treat caches, search indexes, and analytic stores as derivatives unless the design explicitly says otherwise.",
              "Write down acceptable propagation lag between source-of-truth data and each derived system."
            ]
          },
          {
            "heading": "Match engines to access patterns, not to labels",
            "body": "Relational stores remain strong defaults for multi-row invariants, constrained updates, and operational maturity. Document stores fit aggregates whose fields evolve frequently but are usually read and written as a unit. Search indexes fit ranked retrieval and text filtering. Vector stores are now mainstream choices for semantic retrieval, especially when dense or hybrid search must scale beyond what a transactional store can comfortably absorb. Object storage fits immutable large blobs. Lakehouse tables on open formats such as Apache Iceberg, with Delta Lake and Hudi as peers, have become the standard projection layer for analytical fact sets, replayable event history, and cross-engine SQL rather than a vague dump CSV somewhere later pattern.\n\nStrong interviews do not only say that NoSQL scales. They specify what scales and at what semantic cost. A document store may scale tenant metadata well but still struggle with cross-document transactions. A search engine makes relevance queries easy but is a poor legal source of truth. pgvector can be excellent when embeddings benefit from ACID adjacency, relational joins, and simpler ops, but specialized systems such as Qdrant, Weaviate, or Pinecone can win when vector scale, filtering behavior, or dedicated retrieval tooling dominate. Lakehouse choices should also be defended economically: storage layout, query-engine cost, compaction or maintenance work, and full rebuild cost all matter as much as raw flexibility.",
            "bullets": [
              "Choose engines by read or write shape, query flexibility, object size, correctness needs, and unit economics.",
              "Explain the semantic trade-off of every non-relational choice, not only the throughput benefit.",
              "Keep the team's operating burden and rebuild cost in view when adding a new storage technology."
            ],
            "codeExample": {
              "title": "Relational truth with object-storage pointers",
              "language": "sql",
              "code": "CREATE TABLE media_assets (\n  asset_id UUID PRIMARY KEY,\n  owner_id BIGINT NOT NULL,\n  object_key TEXT NOT NULL,\n  content_type TEXT NOT NULL,\n  byte_size BIGINT NOT NULL,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\n-- Metadata stays transactional.\n-- Large immutable bytes live in object storage under object_key."
            }
          },
          {
            "heading": "Derived stores need explicit movement, ownership, and replay rules",
            "body": "Adding a vector index, search tier, or lakehouse projection is not just a provisioning action. It creates a data movement contract. The design must say how changes leave the source system, how they are transformed, how consumers replay missed events, and how operators rebuild the derivative after code or schema changes. Without those answers, every embedding lag spike, indexing outage, or analytics schema evolution turns into manual patchwork and inconsistent customer state.\n\nThe outbox pattern is often the cleanest explanation because it ties source-of-truth writes and downstream publication together without pretending a distributed two-phase commit exists. From there, consumers can project records into search, vector collections, cache warmers, or lakehouse tables idempotently. This framing also keeps incident boundaries clear: if vector retrieval is behind, the order table is still truth; if cache is cold, the relational read path still works; if lakehouse refresh is delayed, operational decisioning may lag but the transactional system of record is not corrupted.",
            "bullets": [
              "Describe exactly how changes leave the source system and become projections elsewhere.",
              "Make rebuild and replay explicit operating capabilities for every derived store.",
              "Use idempotent consumers so projection retries do not create duplicate or contradictory derived state."
            ],
            "codeExample": {
              "title": "Outbox-driven projection into vector and lakehouse consumers",
              "language": "javascript",
              "code": "async function publishOrderProjection(tx, order) {\n  await tx.insert('orders', order);\n  await tx.insert('outbox_events', {\n    topic: 'order.updated',\n    aggregate_id: order.order_id,\n    payload: JSON.stringify({\n      orderId: order.order_id,\n      merchantId: order.merchant_id,\n      searchableText: order.customer_name + ' ' + order.city,\n      embeddingText: `${order.customer_name} ${order.city} ${order.notes}`\n    })\n  });\n}"
            }
          },
          {
            "heading": "Minimize the portfolio because each datastore multiplies operations",
            "body": "A datastore is not only a benchmark profile. It is backups, IAM, dashboards, patching, failover drills, schema evolution, local development, and on-call muscle memory. The difference between two engines and five engines is not linear because every cross-store movement path adds another matrix of failure cases. Polyglot storage is a powerful strategy only when the number of systems stays intentionally small, each one carries obvious product value, and the unit economics are still attractive at production scale.\n\nThat is why senior engineers often ask whether an existing system can be stretched slightly before introducing a new one. Sometimes the answer is yes: a relational store plus a cache and pgvector may handle the next phase. Sometimes the answer is no: large-scale semantic retrieval, filterable ANN, or open-table analytics genuinely needs a dedicated tool. The point is not to avoid specialization forever. It is to avoid premature specialization that outpaces the team's ability to operate, migrate, debug, and pay for the resulting portfolio.",
            "bullets": [
              "Count operational surface area as part of the storage decision, not as an afterthought.",
              "Prefer one authoritative store plus a few clearly justified derivatives over a fragmented portfolio.",
              "Introduce a new engine only when the current portfolio cannot meet an important workload or product need cleanly."
            ]
          },
          {
            "heading": "Migrations between storage systems need overlap and observability",
            "body": "Once a system uses multiple stores, the next hard problem is changing one without breaking the others. Migrating search schemas, moving media metadata to a new relational shape, swapping vector backends, or retiring an analytics projection requires overlap periods where old and new paths both exist. During that window, teams need counters for dual-write success, projection lag, backfill completeness, query-engine cost, and correctness sampling between old and new query results.\n\nThis is where storage selection and change safety intersect. The cheaper engine is not cheaper if migration away from it later becomes practically impossible or if a full embedding or lakehouse rebuild takes weeks. Good selection therefore includes exit thinking: can we dual-write temporarily, replay history, validate parity, estimate rebuild cost, and cut traffic over by cohort? Designs that ignore exit cost often end up with a permanent shadow datastore that survives only because everyone is afraid to remove it.",
            "bullets": [
              "Include migration and exit cost when evaluating a new datastore, not only steady-state fit.",
              "Use overlap windows, backfills, and parity checks when moving authority or read traffic between stores.",
              "Track lag, correctness, and unit cost on the projection path so cutovers are evidence based."
            ],
            "codeExample": {
              "title": "Storage-choice scorecard",
              "language": "python",
              "code": "candidates = {\n    'relational': {'correctness': 5, 'query_flex': 4, 'ops_cost': 3, 'rebuild_cost': 2},\n    'vector_index': {'correctness': 2, 'query_flex': 4, 'ops_cost': 4, 'rebuild_cost': 4},\n    'lakehouse': {'correctness': 3, 'query_flex': 5, 'ops_cost': 4, 'rebuild_cost': 3},\n}\n\ndef weighted_score(scores, weights):\n    return sum(scores[k] * weights[k] for k in weights)\n\nweights = {'correctness': 0.45, 'query_flex': 0.25, 'ops_cost': -0.15, 'rebuild_cost': -0.15}\nfor name, scores in candidates.items():\n    print(name, round(weighted_score(scores, weights), 2))"
            }
          },
          {
            "heading": "Interview framing: explain the portfolio as a small map of authority and derivation",
            "body": "When answering a storage-selection question, do not list technologies first. Start with domains. For example: orders and payments live in a relational primary because money and inventory invariants matter; product media lives in object storage with relational metadata pointers; semantic retrieval starts in pgvector because the embeddings need ACID adjacency and joins, but may move to a specialized vector store if recall, filterability, or scale demand it; lakehouse tables hold replayable analytical projections; Redis caches hot reads but is disposable. That narrative is easy to defend because each tool has one clear reason to exist.\n\nThen show restraint. Mention what you are explicitly not adding yet and why. Maybe you are postponing a dedicated vector database because pgvector is still within latency and cost targets. Maybe you are keeping analytics in one Iceberg-backed lakehouse instead of separate warehouse plus files plus bespoke ETL. That kind of disciplined scope is exactly what turns polyglot persistence from a buzzword into a practical senior design answer.",
            "bullets": [
              "Describe the system as authority plus derivatives, not as a shopping list of databases.",
              "Say what you are deliberately not introducing yet and why the current portfolio is enough.",
              "Tie every chosen datastore back to one important workload or invariant."
            ],
            "codeExample": {
              "title": "Simple storage selector",
              "language": "python",
              "code": "def choose_storage(needs_transactions, needs_semantic_search, large_blobs, needs_analytics_projection):\n    plan = []\n    if needs_transactions:\n        plan.append('relational-primary')\n    if needs_semantic_search:\n        plan.append('vector_index')\n    if large_blobs:\n        plan.append('object-storage')\n    if needs_analytics_projection:\n        plan.append('lakehouse')\n    return plan\n\nprint(choose_storage(True, True, True, True))"
            }
          }
        ],
        "checklist": [
          "Identify the authoritative store for each important business invariant.",
          "Choose derived systems only for clear read, retrieval, or cost benefits.",
          "Explain how data moves from the source of truth into caches, search, or analytics.",
          "Keep the datastore portfolio intentionally small and count operational burden as part of the trade-off.",
          "Plan replay, rebuild, and parity validation for every derived store.",
          "Include migration, rebuild, and eventual retirement cost in the selection conversation."
        ],
        "pitfalls": [
          "Using a search index or cache as if it were the legal source of truth for mutable business data.",
          "Adding a new datastore because it is fashionable rather than because an access pattern truly needs it.",
          "Ignoring the replay and rebuild story for derived systems until a projection outage happens in production.",
          "Letting two systems act authoritative for the same field set and then discovering conflicts during incidents.",
          "Underestimating the people cost of operating many engines with different failure modes and toolchains."
        ],
        "interviewPrompts": [
          "How would you choose the storage mix for a marketplace with orders, search, media, and analytics?",
          "Why is object storage often the right place for large immutable assets even when metadata stays relational?",
          "What makes an outbox-based projection safer than direct dual writes into a primary database and search engine?",
          "How do you decide whether adding a new datastore is worth the operational complexity?"
        ],
        "likelyAnswerPoints": [
          "Choose the authoritative store by business invariant first, then add derived systems only where a clear workload advantage justifies them.",
          "Search, vector, cache, and analytics systems should usually be described as projections with replay and rebuild paths rather than as peers to the transactional source of truth.",
          "A strong answer shows restraint: it names the minimum viable portfolio, explains when pgvector is enough versus when a specialized vector store earns its cost, and treats Iceberg-class lakehouse tables as the analytical default rather than a pile of exports.",
          "Migration and exit cost matter because the hardest storage decision is often not adoption but safe removal or replacement after the system evolves."
        ],
        "exercises": [
          {
            "id": "creator-platform-storage-portfolio",
            "title": "Design a storage portfolio for a creator platform",
            "difficulty": "intermediate",
            "type": "design",
            "description": "Design the storage mix for a creator platform with subscriptions, media uploads, semantic creator search, payout history, and periodic analytics dashboards.",
            "promptQuestions": [
              "Which domains need a strict source of truth and which can be projected asynchronously?",
              "When would pgvector inside the relational store be enough for search, and when would a specialized vector store earn its cost?",
              "How would you move updates from the authoritative store into vector and analytics systems?",
              "Where would you draw the line between acceptable staleness and unacceptable divergence?",
              "Which datastore would you deliberately avoid in the first version even if it looks attractive on paper?"
            ],
            "hints": [
              "Name authority boundaries first.",
              "Discuss vector and analytics projections as deliberate derivatives.",
              "Separate media bytes from transactional metadata.",
              "Keep the operating portfolio smaller than the feature list suggests."
            ]
          },
          {
            "id": "workload-based-storage-selector",
            "title": "Implement a workload-based storage selector",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete the Python function so it chooses a small portfolio based on invariants and access-pattern flags.",
            "starterCode": "def plan_storage(needs_transactions, needs_vector_search, stores_large_blobs, needs_lakehouse, needs_hot_cache):\n    plan = []\n    # TODO: append 'relational-primary' when transactions are needed.\n    # TODO: append 'vector_index' when semantic or vector search is needed.\n    # TODO: append 'object-storage' when large blobs are needed.\n    # TODO: append 'lakehouse' when replayable analytics projections are needed.\n    # TODO: append 'cache' when a hot cache is needed.\n    return plan\n\nprint(plan_storage(True, True, True, True, True))",
            "solution": "def plan_storage(needs_transactions, needs_vector_search, stores_large_blobs, needs_lakehouse, needs_hot_cache):\n    plan = []\n    if needs_transactions:\n        plan.append('relational-primary')\n    if needs_vector_search:\n        plan.append('vector_index')\n    if stores_large_blobs:\n        plan.append('object-storage')\n    if needs_lakehouse:\n        plan.append('lakehouse')\n    if needs_hot_cache:\n        plan.append('cache')\n    return plan\n\nprint(plan_storage(True, True, True, True, True))",
            "expectedOutput": "The function should return ['relational-primary', 'vector_index', 'object-storage', 'lakehouse', 'cache']."
          }
        ],
        "diagram": null,
        "related": [
          "storage-selection",
          "nosql-landscape",
          "relational-data-modeling",
          "queues-and-streams",
          "caching-layers"
        ]
      }
    ]
  },
  {
    "slug": "security-operations-lab",
    "title": "Security and operations lab",
    "summary": "Treat identity, key management, rollout safety, and recovery as architecture concerns that shape the request path and the operating model.",
    "objectives": [
      "Model identities, privileges, and abuse cases at the same level of detail as latency and storage",
      "Choose encryption, secret-distribution, and tenancy controls that reduce blast radius practically",
      "Design safe rollout, disaster-recovery, and graceful-degradation paths before incidents force them"
    ],
    "lessons": [
      {
        "slug": "auth-threat-modeling-for-hld",
        "title": "Auth and threat modeling for HLD",
        "summary": "Model identities, trust boundaries, and abuse cases early enough that security controls shape the architecture instead of patching it afterward.",
        "duration": "60-75 min",
        "whyItMatters": "Security depth in HLD is rarely about naming JWTs or OAuth alone. Strong answers show how identity, authorization, and threat thinking alter service boundaries, storage decisions, and operating controls across the critical path.",
        "sections": [
          {
            "heading": "Zero trust starts by naming assets, actors, and trust boundaries",
            "body": "A useful HLD threat model is not a giant spreadsheet of hypothetical disasters. It is a map of who can act, what they are trying to access, and where trust changes across the system. External clients, partner systems, support agents, background workers, and platform operators usually need different identities and different guardrails. Zero trust sharpens that model: authenticate and authorize every hop, assume network location is not privilege, re-check context as the request crosses services, and keep least privilege narrow enough that one compromised component cannot laterally roam the system.\n\nThis framing matters because many architecture bugs start as trust-boundary bugs rather than crypto bugs. A service that assumes every internal caller is safe, an admin tool that shares customer APIs without stronger controls, or a queue consumer that runs with global write access can all be catastrophic even if every hop uses TLS. Threat modeling at HLD level is about deciding where identity is established, where privilege narrows, where continuous verification is required, and where audit trails must survive an incident.",
            "bullets": [
              "List human users, services, operators, and background jobs as separate actors with separate privileges.",
              "Draw trust boundaries at the edge, admin surfaces, message queues, and cross-service hops.",
              "Ask which assets would cause the most damage if read, modified, replayed, or deleted incorrectly."
            ]
          },
          {
            "heading": "Modern auth separates strong user authn, workload identity, and contextual authz",
            "body": "Authentication and authorization are related but should not collapse into one vague box labeled auth. Authentication establishes a principal, perhaps via a passkey-backed WebAuthn ceremony, an OIDC session, a short-lived access token, or a workload identity such as mTLS or SPIFFE-issued service credentials. Authorization then evaluates the action in context: which tenant, which resource, which role, which elevation path, which environment. Strong systems perform that second step close enough to business logic that product-specific policy is explicit rather than hidden in a gateway rule nobody can reason about.\n\nProduction trouble appears when architectures authenticate once and then over-trust the rest of the path. A valid identity token does not mean the caller can edit any record, cross any tenant boundary, or impersonate an admin workflow. Senior answers therefore discuss short-lived tokens, tenant-aware permission checks, workload identity for service-to-service calls instead of long-lived shared secrets, and step-up mechanisms for privileged actions. The goal is to keep the permission decision observable and debuggable without pushing every domain rule into the edge tier.",
            "bullets": [
              "Authenticate users with phishing-resistant factors such as passkeys where the risk justifies it, and keep tokens short lived.",
              "Perform authorization with resource and tenant context instead of treating identity proof as blanket access.",
              "Keep domain-specific permission logic visible in application services even if gateways enforce coarse edge policies."
            ],
            "codeExample": {
              "title": "Authorization check with tenant context and step-up strength",
              "language": "javascript",
              "code": "function canEditInvoice({ actor, invoice, privilegedAction = false }) {\n  if (actor.role === 'platform-admin') {\n    return actor.breakGlassTicketOpen === true && actor.authStrength === 'passkey';\n  }\n  if (actor.tenantId !== invoice.tenantId) return false;\n  if (privilegedAction && actor.authStrength !== 'passkey') return false;\n  return actor.scopes.includes('invoice:write');\n}\n\nconsole.log(canEditInvoice({\n  actor: { role: 'manager', tenantId: 't-1', scopes: ['invoice:write'], authStrength: 'passkey' },\n  invoice: { tenantId: 't-1', status: 'open' },\n  privilegedAction: true\n}));"
            }
          },
          {
            "heading": "Threat modeling should follow the highest-value workflow, not every endpoint equally",
            "body": "You get more value from a focused threat model of one privileged workflow than from superficial coverage of twenty endpoints. Pick the flow where money, secrets, or durable customer impact move. For example, login, password reset, payout approval, tenant invitation, and admin impersonation are all richer than a generic profile read. Walk the flow step by step and ask how spoofing, tampering, repudiation, information disclosure, denial of service, or privilege escalation could appear. STRIDE remains useful here because it forces the review to stay concrete on the workflow with real blast radius.\n\nThe HLD benefit of that exercise is architectural prioritization. Maybe the password-reset path needs passkey recovery constraints, one-time tokens, and aggressive abuse limits. Maybe payout approval needs dual control, stronger auditing, and delayed execution. Maybe admin impersonation needs distinct break-glass credentials and immutable logs. Threat modeling at this level is useful because it changes the design in concrete ways instead of becoming compliance theater that leaves the critical workflow untouched.",
            "bullets": [
              "Run the threat model on a privileged, money-moving, or identity-mutating workflow first.",
              "Use categories like spoofing, tampering, disclosure, and privilege escalation only if they lead to design changes.",
              "Prefer a few concrete threats with mitigations over a long unprioritized list."
            ],
            "codeExample": {
              "title": "Simple risk score for privileged flows",
              "language": "python",
              "code": "flows = [\n    {'name': 'password_reset', 'blast_radius': 4, 'abuse_likelihood': 5},\n    {'name': 'profile_read', 'blast_radius': 1, 'abuse_likelihood': 2},\n]\n\nfor flow in flows:\n    score = flow['blast_radius'] * flow['abuse_likelihood']\n    print(flow['name'], score)"
            }
          },
          {
            "heading": "Abuse resistance belongs at the architecture level",
            "body": "Credential stuffing, replay, brute force, enumeration, and permission probing can all overwhelm a design long before a classic exploit appears. This is why login, password-reset, token-refresh, and admin endpoints often need different rate limits, telemetry, and challenge strategies than ordinary product APIs. If the design treats those endpoints like every other request, abuse traffic can become the dominant workload during an incident. OIDC sessions and short-lived tokens reduce replay windows, but only if refresh, revocation, and step-up paths are designed intentionally.\n\nThe deeper lesson is that security and reliability overlap. A replay-resistant write path also benefits correctness. Per-actor rate limiting protects both abuse surfaces and multi-tenant fairness. Audit events feed both incident response and product accountability. Strong HLD answers therefore mention idempotency keys, nonce or token expiration, rate limits by actor type, suspicious-activity alerts, and clear error semantics that do not leak sensitive state to attackers.",
            "bullets": [
              "Give identity and privilege-mutating endpoints stricter controls than generic reads.",
              "Use rate limiting, expiration, and replay resistance together instead of depending on one control.",
              "Instrument abuse signals so security incidents are visible before they become availability incidents."
            ],
            "codeExample": {
              "title": "Audit query for repeated failed logins",
              "language": "sql",
              "code": "SELECT actor_key, count(*) AS failures\nFROM auth_audit_events\nWHERE event_type = 'login_failed'\n  AND occurred_at >= now() - interval '10 minutes'\nGROUP BY actor_key\nHAVING count(*) >= 5\nORDER BY failures DESC;"
            }
          },
          {
            "heading": "Tenant boundaries and operator privilege deserve explicit architecture",
            "body": "Many high-severity incidents are not caused by anonymous attackers. They are caused by the wrong tenant seeing the wrong data or by a support or operations tool acting with excessive default power. Multi-tenant systems should treat tenant identity as a first-class dimension in tokens, database filters, caches, and audit records. Operator tools should be designed as distinct privileged systems, not as quiet side doors into the customer plane. Service-to-service calls should also present workload identity instead of reusing one shared secret across the fleet.\n\nThis means thinking about blast radius the same way you think about shard keys or replication domains. A cache key missing tenant context can become a cross-tenant leak. A queue consumer with global write scope can mutate the wrong tenant during a bug. An admin impersonation flow without justification logging becomes impossible to investigate later. HLD security maturity comes from making those privilege boundaries visible in the design itself and carrying least privilege all the way through the worker and service graph.",
            "bullets": [
              "Propagate tenant context through API, storage, cache, and audit layers.",
              "Keep operator and support tooling on explicit privileged paths with stronger audit and approval controls.",
              "Treat missing tenant scoping in caches and background jobs as architectural bugs, not implementation details."
            ]
          },
          {
            "heading": "Interview framing: secure the happy path and the abuse path together",
            "body": "A senior answer on this topic sounds concrete: identity is established at the edge, privilege is re-checked in the application with tenant context, privileged workflows have stronger challenge and audit controls, and abuse-sensitive endpoints carry separate rate limits and telemetry. That sequence shows you understand security as part of request flow design rather than as a decorative edge service.\n\nClose by naming one security trade-off. Maybe you accept slightly higher latency on admin actions because you require stronger checks. Maybe you keep authorization in the service instead of fully centralizing it because domain context matters. Maybe you choose short-lived tokens and more refresh traffic in exchange for better revocation and smaller blast radius. Those trade-offs make the answer credible because they acknowledge cost instead of claiming perfect security for free.",
            "bullets": [
              "Show where identity is established, where permissions narrow, and where high-risk actions get extra controls.",
              "Explain how the architecture responds to misuse, not only to valid requests.",
              "Name one real trade-off in latency, complexity, or operator friction that the security design intentionally accepts."
            ]
          }
        ],
        "checklist": [
          "Identify the principal actors, assets, and trust boundaries for the system.",
          "Separate authentication from authorization and explain where each decision happens.",
          "Threat-model at least one privileged workflow such as login recovery, payout approval, or admin impersonation with STRIDE-style abuse questions.",
          "Add replay resistance, rate limits, and audit trails to identity- and privilege-mutating endpoints.",
          "Use workload identity for service-to-service calls instead of long-lived shared secrets.",
          "Carry tenant context through services, caches, jobs, and storage filters.",
          "Design operator and support tooling as explicit privileged paths with reviewable access."
        ],
        "pitfalls": [
          "Treating a valid token as if it automatically grants correct tenant and resource access.",
          "Assuming internal service traffic is trusted and therefore skipping workload identity or scoped permissions.",
          "Threat-modeling everything lightly instead of modeling the highest-risk workflow deeply.",
          "Forgetting abuse economics such as credential stuffing, replay, and enumeration on auth endpoints.",
          "Letting admin or support surfaces share customer-plane privileges without stronger audit and approval controls."
        ],
        "interviewPrompts": [
          "How would you explain the difference between authentication and authorization in a multi-tenant SaaS design?",
          "Which workflow would you threat-model first in a payout or payments system, and why?",
          "How do rate limiting and replay resistance fit into an auth architecture rather than living as afterthoughts?",
          "Why should support tools and break-glass admin flows be treated differently from ordinary product APIs?"
        ],
        "likelyAnswerPoints": [
          "Strong answers begin with actors, assets, and trust boundaries so the auth design serves an explicit zero-trust threat model instead of a generic login box.",
          "Authentication proves identity, but authorization must still be evaluated with resource and tenant context near the business logic that understands the action. In 2026 that usually means passkeys or OIDC for users plus workload identity for services.",
          "High-risk workflows like password reset, payout approval, or admin impersonation deserve deeper threat modeling and stronger controls than generic reads.",
          "Security maturity shows up in abuse controls, scoped privileges, tenant-safe caching and jobs, and immutable auditability for privileged actions."
        ],
        "exercises": [
          {
            "id": "b2b-admin-threat-model",
            "title": "Threat-model a tenant admin console",
            "difficulty": "advanced",
            "type": "design",
            "description": "Design the authn, authz, and threat controls for a B2B admin console where tenant admins manage invoices and support agents can view accounts under controlled escalation.",
            "promptQuestions": [
              "Where is identity established, and how are tenant and role claims propagated downstream?",
              "Which actions require step-up or break-glass controls, and which can use normal sessions?",
              "What abuse cases matter most on login, password reset, invite acceptance, and impersonation flows?",
              "How will you audit operator actions without turning the audit trail into an afterthought?"
            ],
            "hints": [
              "Separate tenant admin actions from support or platform operator actions.",
              "Pick one privileged workflow and model it step by step.",
              "Use the threat model to change the architecture, not just the wording."
            ]
          },
          {
            "id": "tenant-scope-permission-check",
            "title": "Implement a tenant-aware permission check",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete a JavaScript helper that denies cross-tenant writes and requires the invoice:write scope.",
            "starterCode": "function canWriteInvoice(actor, invoice) {\n  // TODO: reject if actor.tenantId and invoice.tenantId differ.\n  // TODO: allow only when actor.scopes contains 'invoice:write'.\n}\n\nconsole.log(canWriteInvoice(\n  { tenantId: 't-1', scopes: ['invoice:write'] },\n  { tenantId: 't-1' }\n));",
            "solution": "function canWriteInvoice(actor, invoice) {\n  if (actor.tenantId !== invoice.tenantId) return false;\n  return actor.scopes.includes('invoice:write');\n}\n\nconsole.log(canWriteInvoice(\n  { tenantId: 't-1', scopes: ['invoice:write'] },\n  { tenantId: 't-1' }\n));",
            "expectedOutput": "The helper should return true only when the actor belongs to the same tenant and holds the invoice:write scope."
          }
        ],
        "diagram": null,
        "related": [
          "security-basics",
          "api-design",
          "rate-limiting-and-edge-protection",
          "observability",
          "idempotency-retries-backpressure"
        ]
      },
      {
        "slug": "encryption-secrets-and-tenancy",
        "title": "Encryption, secrets, and tenancy",
        "summary": "Design key hierarchies, secret-distribution paths, and tenant-isolation boundaries that reduce blast radius without making operations impossible.",
        "duration": "60-75 min",
        "whyItMatters": "Security answers become meaningfully more senior when they explain which data is encrypted, who can decrypt it, how keys rotate, and how tenant boundaries are enforced in both storage and tooling.",
        "sections": [
          {
            "heading": "Classify data before picking cryptography",
            "body": "Encryption strategy starts with data classification, not with naming AES or TLS. Credentials, payment tokens, government identifiers, audit trails, feature flags, and public catalog data all carry different confidentiality and integrity needs. Some values only need transport protection. Some need application-level field protection. Some need immutable retention and access logging. Good architecture identifies these classes so the most expensive controls are focused on the smallest set of truly sensitive assets.\n\nThis classification also drives operational choices. If a field is needed for filtering, encrypting it blindly at the application layer may destroy the access path and push engineers toward unsafe workarounds. If a secret is only used at deploy time, an ephemeral runtime fetch path may be unnecessary. If multi-tenant data carries different compliance obligations, key hierarchy and retention may differ by tenant tier. Mature HLD answers therefore tie cryptography to data usage, not just to fear.",
            "bullets": [
              "Group data by confidentiality, integrity, access-pattern, and retention needs before selecting controls.",
              "Prefer the smallest strong-encryption surface that still protects the genuinely sensitive fields and objects.",
              "Check how encryption interacts with indexing, filtering, and operational debugging before finalizing the design."
            ]
          },
          {
            "heading": "Envelope encryption reduces blast radius while keeping keys manageable",
            "body": "A common production pattern is envelope encryption: a data encryption key protects the record or object, and a higher-level key in KMS or HSM protects that data key. This structure makes large-scale encryption practical because application code can encrypt many items without repeatedly handling the root key directly. It also improves blast radius because rotating or disabling a top-level key affects key unwrapping policy centrally while individual object keys remain scoped.\n\nThe architectural value is not just cryptographic hygiene. It is operational clarity. Teams can log which key version wrapped which object, phase rotations by cohort, and design access reviews around who may request decrypt capability instead of who knows a shared secret string. When interviewed, explain that the system should minimize plaintext exposure, keep master keys out of application code, and retain enough metadata to rotate or rewrap objects without guesswork.",
            "bullets": [
              "Use envelope encryption so application code works with scoped data keys instead of long-lived root secrets.",
              "Store key version metadata with encrypted material so rotation and rewrap are traceable.",
              "Separate permission to use a KMS key from permission to read the encrypted record itself."
            ],
            "codeExample": {
              "title": "Envelope-encryption metadata sketch",
              "language": "python",
              "code": "record = {\n    'ciphertext_b64': '...redacted...',\n    'wrapped_data_key_b64': '...redacted...',\n    'kms_key_id': 'kms/customer-pii/v3',\n    'algorithm': 'AES256-GCM',\n}\n\ndef can_rewrap(current_key_id, new_key_id):\n    return current_key_id != new_key_id\n\nprint(can_rewrap(record['kms_key_id'], 'kms/customer-pii/v4'))"
            }
          },
          {
            "heading": "Secret distribution should be short-lived, auditable, and environment aware",
            "body": "A secret path is an architecture path. Services need database credentials, third-party API tokens, signing keys, and sometimes tenant-specific integration secrets. The secure pattern is usually to fetch short-lived credentials from a managed secret source or workload identity mechanism at runtime, cache them briefly in memory, and rotate them without code redeploys. Hard-coded environment files, long-lived shared passwords, and ad hoc manual rotation make incident response slower and blast radius larger. Modern data platforms apply the same idea to storage access: a catalog or control plane vends scoped credentials for a tenant, table, or prefix instead of distributing one broad object-store key to every worker.\n\nThe operating detail that matters in HLD is renewal behavior. What happens when a secret rotates? Does the service watch for version change, reopen a connection, and recover gracefully? Can one compromised worker expose every tenant's connector token, or are those secrets partitioned by tenant or integration? Which audit event proves who accessed a secret and when? Strong answers connect secret distribution to service startup, rotation cadence, incident containment, and credential vending boundaries.",
            "bullets": [
              "Prefer workload identities and short-lived credentials over static secrets stored on hosts or in source control.",
              "Design service refresh behavior so rotation does not require emergency redeploys or prolonged downtime.",
              "Partition sensitive integration secrets or scoped storage credentials where possible so one compromise does not spill every tenant's access."
            ],
            "codeExample": {
              "title": "Scoped credential vending with explicit expiry",
              "language": "javascript",
              "code": "async function issueScopedStorageCreds(catalog, tenantId, prefix) {\n  const lease = await catalog.vendCredentials({\n    tenantId,\n    prefix,\n    ttlSeconds: 900\n  });\n  return {\n    accessKeyId: lease.accessKeyId,\n    expiresAt: lease.expiresAt,\n    allowedPrefix: prefix\n  };\n}\n\nissueScopedStorageCreds(catalog, 'tenant-17', 'tenant-17/contracts/');"
            }
          },
          {
            "heading": "Tenant isolation and residency must exist in storage, cache keys, and background jobs",
            "body": "Multi-tenancy is not safe if tenant isolation exists only in controller code. The architecture should carry tenant context through database filters, queue payloads, cache keys, search documents, and audit records. Storage-level protections such as schema-per-tenant, database-per-tenant, or row-level security all have trade-offs, but the key point is that the isolation boundary should be enforced in more than one layer so a single application bug does not silently become a cross-tenant exposure. Residency adds another dimension: some tenants or data classes may need to stay in-region, which means workers, caches, backups, and projections must honor location as well as tenant identity.\n\nThe right isolation depth depends on risk and operating model. Shared-table multi-tenancy can be efficient if row-level security, cache-key discipline, job scoping, and residency-aware routing are rigorous. Premium or regulated tenants may justify separate schemas, clusters, or even distinct keys. The senior answer is not that one model is always right; it is that blast radius, cost, residency, and operator ergonomics must all be weighed and that background processing must respect the same tenant boundary as synchronous reads.",
            "bullets": [
              "Carry tenant and, where needed, residency context end to end: API, database, cache, queue, and audit layers.",
              "Choose row-level, schema-level, or cluster-level isolation based on blast radius, residency, and operating constraints.",
              "Treat missing tenant context in cache keys or worker payloads as a severe architecture flaw."
            ],
            "codeExample": {
              "title": "Row-level tenant guardrail",
              "language": "sql",
              "code": "ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY tenant_isolation ON invoices\nUSING (tenant_id = current_setting('app.tenant_id')::text);\n\n-- Every session serving tenant-scoped traffic must set app.tenant_id\n-- before querying invoices."
            }
          },
          {
            "heading": "Auditability and break-glass access are part of the design, not exceptions",
            "body": "Eventually someone needs temporary elevated access during an outage, fraud event, or legal hold. If the architecture has no explicit break-glass path, operators will invent one under pressure, usually with poor logging and excessive power. Safer systems define who can elevate, how approval works, how long elevation lasts, what extra logging is captured, and how follow-up review happens. That planning protects both the customer and the operator.\n\nThe same thinking applies to decrypted-data exposure and to sensitive telemetry. Reading ciphertext is one privilege; requesting decryption may be another; bulk export may require a third. When AI or LLM features touch PHI or PII, logs and prompts should be metadata first: correlation IDs, tenant IDs, token counts, model names, and redacted field classes are usually safe; raw secrets, prompts with customer data, and decrypted payloads are not. Architectural separation of those actions makes abuse easier to detect and permission reviews easier to reason about. In interviews, this is a high-signal place to show that security is operational as well as cryptographic.",
            "bullets": [
              "Make elevated access explicit, time-bound, and heavily audited.",
              "Separate data-read permission from decrypt permission and from bulk-export permission when the domain justifies it.",
              "Review break-glass usage after the incident so the path remains exceptional instead of normal."
            ]
          },
          {
            "heading": "Interview framing: explain how keys, secrets, and tenants shrink blast radius",
            "body": "A strong answer here sounds like an end-to-end control plane. Data classes are identified first, field or object protection is applied where it matters, envelope encryption keeps master keys out of services, runtime identities fetch short-lived secrets, and tenant context survives every storage and worker hop. That explanation is stronger than simply saying encrypted in transit and at rest because it shows who can actually read what under failure or compromise.\n\nClose by naming a deliberate trade-off. Maybe shared-table multi-tenancy is acceptable because row-level controls and auditing are mature. Maybe per-tenant keys are reserved for premium or regulated tenants because universal per-tenant key management would overwhelm operations. Maybe decrypt paths are slightly slower because KMS calls are kept in the critical loop for high-value actions. Trade-offs make the design believable.",
            "bullets": [
              "Describe how the control reduces blast radius, not only how it satisfies a checklist item.",
              "Carry tenant isolation through caches and jobs, not just through synchronous HTTP handlers.",
              "State where you are choosing stronger separation and where you are accepting shared infrastructure for practical reasons."
            ]
          }
        ],
        "checklist": [
          "Classify data by confidentiality, access pattern, and retention before selecting encryption controls.",
          "Use envelope encryption and retain key-version metadata for sensitive records or objects.",
          "Distribute secrets through short-lived identities or managed secret stores with rotation-aware refresh behavior.",
          "Use scoped credential vending where broad shared storage credentials would create unnecessary blast radius.",
          "Propagate tenant and residency context into database filters, cache keys, queue payloads, and audit records.",
          "Define break-glass access with approval, expiry, and enhanced auditing.",
          "Be explicit about where stronger tenant isolation or per-tenant keys are worth the extra operations cost."
        ],
        "pitfalls": [
          "Encrypting fields without considering how the application must query or index them later.",
          "Storing long-lived shared secrets on hosts or in configs that outlive the people who created them.",
          "Assuming application-layer tenant checks are enough while caches or workers remain unscoped.",
          "Treating break-glass access as a future process problem instead of as a design concern.",
          "Using one broad decrypt capability where read, decrypt, and bulk-export privileges should be separated."
        ],
        "interviewPrompts": [
          "How would you explain envelope encryption in a system-design interview without disappearing into crypto minutiae?",
          "What makes a secret-rotation story operationally credible for a service fleet?",
          "When is shared-table multi-tenancy acceptable, and what controls make it safer?",
          "Why should break-glass or operator access be designed explicitly rather than handled ad hoc during incidents?"
        ],
        "likelyAnswerPoints": [
          "Start with data classes and blast radius, because the right encryption and key strategy depends on what data is sensitive and how it is used.",
          "Envelope encryption is valuable because it keeps root keys outside application code, supports rotation, and leaves metadata that operators can reason about later.",
          "Secret handling is part of system architecture: runtime identity, refresh behavior, scoped credential vending, partitioning of sensitive tokens, and auditability matter as much as storage.",
          "Tenant isolation must survive through storage, cache, background systems, and residency-aware routing; otherwise a single missing scope can become a cross-tenant or cross-border incident."
        ],
        "exercises": [
          {
            "id": "tenant-pii-protection-plan",
            "title": "Design tenant-safe PII protection",
            "difficulty": "advanced",
            "type": "design",
            "description": "Design the encryption, secret, and tenant-isolation plan for a SaaS billing platform that stores invoices, payout bank details, uploaded contracts, and tenant-specific webhook secrets.",
            "promptQuestions": [
              "Which data needs field or object-level encryption beyond basic transport and disk encryption?",
              "How will the services fetch, refresh, and audit the secrets needed for signing, database access, and third-party integrations?",
              "What tenant-isolation model will you choose for invoice and contract metadata, and how will caches and workers honor it?",
              "Where would you accept shared controls, and where would you justify premium or regulated tenant separation?"
            ],
            "hints": [
              "Separate metadata from large immutable objects.",
              "Think about who can decrypt, not only whether something is encrypted.",
              "Remember worker payloads and cache keys, not just database rows."
            ]
          },
          {
            "id": "secret-version-refresh",
            "title": "Implement a secret-version refresh helper",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete the JavaScript helper so cached secret material updates only when the secret-store version changes.",
            "starterCode": "async function refreshSecret(secretStore, cache, name) {\n  const latest = await secretStore.get(name);\n  // TODO: if cache.version differs, replace cache.material and cache.version.\n  // TODO: return cache.material.\n}",
            "solution": "async function refreshSecret(secretStore, cache, name) {\n  const latest = await secretStore.get(name);\n  if (cache.version !== latest.version) {\n    cache.material = latest.material;\n    cache.version = latest.version;\n  }\n  return cache.material;\n}",
            "expectedOutput": "The helper should keep using cached material until the secret version changes, then atomically refresh the in-memory value."
          }
        ],
        "diagram": null,
        "related": [
          "security-basics",
          "multi-region-disaster-recovery",
          "deployment-capacity-cost",
          "observability",
          "rate-limiting-and-edge-protection"
        ]
      },
      {
        "slug": "safe-change-dr-and-degradation",
        "title": "Safe change, DR, and degradation",
        "summary": "Design rollout paths, recovery plans, and degraded modes so the system survives both intentional change and accidental failure.",
        "duration": "60-75 min",
        "whyItMatters": "Many outages are self-inflicted or become worse because recovery and degradation were never modeled ahead of time. Strong HLD answers treat change safety and disaster readiness as core architecture, not process footnotes.",
        "sections": [
          {
            "heading": "Safe change is a first-class reliability feature",
            "body": "A system that works only when it never changes is not production ready. Every important architecture eventually faces new schemas, dependency swaps, re-partitioning, feature rollout, or policy changes. Safe change means the system is built so mixed versions can coexist temporarily, traffic can shift gradually, and rollback or fast disablement is possible before the blast radius grows. This is a design property, not only a deployment-tooling property.\n\nThat is why mature architectures prefer additive contracts, feature flags, compatibility windows, and idempotent migration steps. The safest change is one where old and new paths can overlap while telemetry proves whether the new path behaves correctly. If the design requires a one-shot cutover where data, code, and clients all switch in lockstep, the architecture is fragile even if the code looks clean.",
            "bullets": [
              "Design APIs, schemas, and workflows so old and new versions can overlap during rollout.",
              "Favor additive, reversible steps over big-bang cutovers that couple data and code changes too tightly.",
              "Treat fast disablement and rollback as explicit user-safety requirements."
            ]
          },
          {
            "heading": "Progressive delivery lowers blast radius when paired with real signals",
            "body": "Canaries, dark launches, weighted routing, feature flags, kill switches, and shadow reads are useful only when they are tied to signals that matter. A rollout that checks CPU but ignores domain correctness, tenant-specific errors, or write latency can still ship a bad change cleanly into production. Safe change therefore needs both traffic control and validation metrics. In current practice those signals are usually emitted through an OpenTelemetry-style traces, metrics, and logs pipeline, then evaluated against service-level objectives before a canary is promoted.\n\nThe most convincing designs define the cohort boundary intentionally. User ID, tenant, region, shard, or background-job partition can each be a rollout unit depending on blast radius. Rollout should move in stages with objective stop conditions. If error-budget burn accelerates, if replica lag rises, if reconciliation mismatches grow, if p95 doubles for one tenant tier, or if cost per request climbs unexpectedly, the system should be able to freeze, flip a kill switch, or roll back before the whole fleet absorbs the change.",
            "bullets": [
              "Roll out by a stable cohort such as tenant, region, or shard instead of by random request when correctness matters across a workflow.",
              "Validate both technical and business signals during rollout, not only generic resource metrics.",
              "Define stop conditions in advance so rollback decisions are not made from panic alone."
            ],
            "codeExample": {
              "title": "Rollout gate using SLO and cost signals",
              "language": "python",
              "code": "signals = {\n    'error_budget_burn_rate': 0.8,\n    'checkout_p95_ms': 210,\n    'cost_per_order_delta_pct': 3.0,\n    'projection_mismatch_rate': 0.0002,\n}\n\ndef can_promote_canary(s):\n    return (\n        s['error_budget_burn_rate'] <= 1.0\n        and s['checkout_p95_ms'] <= 250\n        and s['cost_per_order_delta_pct'] <= 5.0\n        and s['projection_mismatch_rate'] <= 0.001\n    )\n\nprint('promote=', can_promote_canary(signals))"
            }
          },
          {
            "heading": "Disaster recovery is a business promise expressed as RTO and RPO",
            "body": "Multi-region architecture, backups, and failover only make sense when tied to recovery time objective and recovery point objective. Some systems need regional failover in minutes with near-zero data loss. Others only need repeatable restore within a few hours. Without those business promises, teams overspend on unnecessary coordination or underspecify recovery until the first real outage reveals that restore time, not replication, is the actual bottleneck.\n\nA high-quality HLD answer therefore says what survives a region loss, what data may be temporarily stale or unavailable, how traffic shifts, and how restores are rehearsed. Backups without restore drills are hope, not recovery. Active-passive without tested DNS or client failover is ceremony, not availability. Even active-active systems still need restore and rebuild stories because corruption, operator error, and security incidents do not respect the same boundaries as regional outages.",
            "bullets": [
              "Define RTO and RPO before selecting active-passive, active-active, or backup-and-restore strategies.",
              "Treat restore rehearsal as part of architecture because untested backups do not constitute real resilience.",
              "Remember that corruption and bad deploys can require recovery even when no region is down."
            ],
            "codeExample": {
              "title": "Migration marker for safe dual-read cutover",
              "language": "sql",
              "code": "CREATE TABLE migration_state (\n  migration_name TEXT PRIMARY KEY,\n  read_mode TEXT NOT NULL,\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nINSERT INTO migration_state (migration_name, read_mode)\nVALUES ('orders_v2_projection', 'shadow');"
            }
          },
          {
            "heading": "Graceful degradation keeps the core journey alive during partial failure",
            "body": "A system with no degraded mode usually discovers that everything is critical right when a dependency fails. Mature architectures rank features by user importance and business reversibility. Checkout confirmation, balance display, and authentication may be must-survive flows. Recommendations, badges, exports, and some admin insights often are not. When dependency health worsens, the system should shed or simplify the lower-value work first so the core path remains understandable and bounded. Feature flags and kill switches are therefore part of the architecture, not just release tooling, because they are the mechanism that turns policy into fast action.\n\nThis is where resilience and product design meet. A feed may tolerate slightly stale content. A dashboard may hide optional segments and show a freshness banner. A write path may become read-only rather than risk corrupting state. The best answers state these fallbacks concretely and pair them with control mechanisms such as feature flags, circuit breakers, bounded queues, or read-only switches. Saying it degrades gracefully is meaningless unless you can name the user experience and the switch that activates it.",
            "bullets": [
              "Rank features by criticality before the outage so shedding order is intentional.",
              "Make degraded UX explicit, such as stale reads, hidden enrichments, or temporary read-only mode.",
              "Control degraded states with mechanisms that operators can activate quickly and reverse safely."
            ],
            "codeExample": {
              "title": "Degradation policy selector",
              "language": "python",
              "code": "def choose_mode(primary_healthy, queue_lag_seconds, fraud_service_healthy):\n    if not primary_healthy:\n        return 'read-only'\n    if queue_lag_seconds > 300 or not fraud_service_healthy:\n        return 'core-checkout-no-enrichment'\n    return 'normal'\n\nprint(choose_mode(True, 420, False))"
            }
          },
          {
            "heading": "Runbooks, drills, and visibility determine whether the plan is real",
            "body": "A sophisticated design still fails badly if operators cannot tell what state it is in or which switch to pull next. Runbooks should connect detection, diagnosis, mitigation, and rollback. Drills should validate not just the system mechanics but also the human communication path: who approves failover, who watches correctness, who owns customer messaging, and how the team knows when it is safe to recover normal behavior. This is especially important for changes that touch multiple stores or external partners.\n\nVisibility must also cover recovery itself. Lag to replica catch-up, percentage of backfill complete, dual-write mismatch rate, and fraction of traffic in degraded mode are as important during a recovery event as ordinary request latency. In HLD, mentioning these signals shows that you understand that the transition period is often the most dangerous part of the system's life cycle.",
            "bullets": [
              "Connect architecture controls to operator runbooks and approval paths.",
              "Track transition metrics such as dual-write mismatch, failover lag, and degraded-mode activation rate.",
              "Practice both technical failover and the human coordination needed to execute it safely."
            ]
          },
          {
            "heading": "Interview framing: combine safe rollout, recovery promise, and user-facing fallback",
            "body": "A high-signal answer on this topic has three pieces. First, the change path is progressive and observable. Second, disaster recovery is defined by explicit RTO and RPO rather than by vague multi-region aspirations. Third, degraded modes are described in product terms so the system can still serve a coherent core experience under stress. When those three pieces connect, the design sounds like something a real team could operate.\n\nEnd with one trade-off you are accepting. Maybe you keep failover slower to avoid promoting stale state. Maybe you accept stale recommendations so payments remain available. Maybe you limit rollout speed because tenant-by-tenant validation matters more than rapid exposure. Trade-offs are the sign that reliability work is grounded in business choices instead of slogans.",
            "bullets": [
              "State how you roll out, how you recover, and how the product degrades during partial failure.",
              "Use explicit objectives and operator signals, not only general statements about resilience.",
              "Name one conscious trade-off in rollout speed, failover speed, or feature availability."
            ]
          }
        ],
        "checklist": [
          "Design APIs and schemas for overlap between old and new versions during rollout.",
          "Roll changes by stable cohorts and monitor both technical and business correctness signals.",
          "Define RTO and RPO before choosing replication or disaster-recovery topology.",
          "Use feature flags or kill switches that can disable risky paths without waiting for a full redeploy.",
          "Describe at least one concrete degraded user experience for partial dependency failure.",
          "Connect failover, rollback, and migration states to runbooks and transition metrics.",
          "Exercise recovery and degraded modes in drills so they remain credible under pressure."
        ],
        "pitfalls": [
          "Treating deployment safety as a tooling concern while contracts and schemas remain incompatible across versions.",
          "Rolling out by random request when workflow correctness depends on stable cohorts or tenant context.",
          "Calling a system disaster-ready because backups exist even though restores are untested.",
          "Claiming graceful degradation without naming the exact user-visible fallback behavior.",
          "Ignoring transition metrics like dual-write mismatch, queue backlog, or degraded-mode activation during recovery."
        ],
        "interviewPrompts": [
          "How would you make a risky data-model change safe in a live high-volume system?",
          "What is the difference between replication and a credible disaster-recovery plan?",
          "How would you decide what enters read-only or simplified mode during a dependency outage?",
          "Why are drills and runbooks part of architecture quality rather than mere process overhead?"
        ],
        "likelyAnswerPoints": [
          "Safe change requires compatibility windows, cohort-based rollout, and validation signals that prove correctness, performance, and cost. Modern teams commonly wire those signals through an OpenTelemetry-style observability stack and gate promotion on SLO burn.",
          "Disaster recovery should be described with RTO and RPO so topology and backup choices map to business expectations rather than to intuition.",
          "Graceful degradation is strongest when it protects the must-survive user journey and explicitly sheds optional work first through feature flags or kill switches.",
          "Operational credibility comes from runbooks, drills, and transition metrics because the riskiest period is often the recovery or rollout itself."
        ],
        "exercises": [
          {
            "id": "checkout-degradation-and-dr-plan",
            "title": "Design change safety and DR for checkout",
            "difficulty": "advanced",
            "type": "design",
            "description": "Design the rollout, disaster-recovery, and degraded-mode plan for a checkout stack that depends on inventory, payment, and recommendation services.",
            "promptQuestions": [
              "Which schemas or APIs need overlap periods to support progressive rollout safely?",
              "What RTO and RPO would you target for order acceptance, payment status, and recommendation data?",
              "Which parts of the user experience can degrade or be temporarily disabled during payment or recommendation dependency issues?",
              "What metrics and runbook gates would determine whether the canary continues, pauses, or rolls back?"
            ],
            "hints": [
              "Separate must-survive flows from nice-to-have enrichments.",
              "Use explicit cohort boundaries for rollout.",
              "Do not confuse replication with a tested restore path."
            ]
          },
          {
            "id": "degradation-policy-helper",
            "title": "Implement a degradation-mode helper",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete the Python function so it chooses a user-facing operating mode from a few health signals.",
            "starterCode": "def choose_mode(primary_healthy, queue_lag_seconds, auth_healthy):\n    # TODO: return 'read-only' when primary_healthy is False.\n    # TODO: return 'core-only' when queue_lag_seconds > 300 or auth_healthy is False.\n    # TODO: otherwise return 'normal'.\n    pass",
            "solution": "def choose_mode(primary_healthy, queue_lag_seconds, auth_healthy):\n    if not primary_healthy:\n        return 'read-only'\n    if queue_lag_seconds > 300 or not auth_healthy:\n        return 'core-only'\n    return 'normal'",
            "expectedOutput": "The helper should prefer read-only mode when the primary is unhealthy and core-only mode when dependencies are degraded but the source of truth remains writable."
          }
        ],
        "diagram": null,
        "related": [
          "multi-region-disaster-recovery",
          "fault-tolerance-and-graceful-degradation",
          "deployment-capacity-cost",
          "observability",
          "replication-and-failover"
        ]
      }
    ]
  },
  {
    "slug": "distributed-systems-lab",
    "title": "Distributed systems lab",
    "summary": "Practice the harder coordination topics that often distinguish a solid system-design answer from a genuinely senior one.",
    "objectives": [
      "Partition systems in ways that survive skew and operational rebalancing",
      "Use coordination, leadership, and quorum language precisely rather than decoratively",
      "Preserve workflow correctness under retries, partial failure, and long-running recovery"
    ],
    "lessons": [
      {
        "slug": "partitioning-and-hot-key-control",
        "title": "Partitioning and hot-key control",
        "summary": "Design partitioning schemes that scale under skew, keep hot objects survivable, and remain operable during rebalancing or rapid growth.",
        "duration": "60-75 min",
        "whyItMatters": "Sharding discussions are common in HLD, but the differentiator is explaining what happens when traffic is uneven. Real systems fail on hot partitions, cache stampedes, and slow rebalances more often than on perfectly uniform textbook workloads.",
        "sections": [
          {
            "heading": "Partitioning strategy is a skew-management strategy",
            "body": "The core mistake in partitioning conversations is to optimize only for even average distribution. Real systems experience celebrity users, flash sales, tenant imbalance, and time-correlated bursts. A partitioning scheme should therefore be evaluated by how it behaves under skew, not just by how well it spreads synthetic uniform traffic. If one shard receives ten times the traffic of the others, the system design needs a plan for that shape before launch day reveals it. When the product also needs independent regional or tenant failure domains, partitioning often grows into a cell strategy: each cell owns a subset of demand and can fail, scale, or be degraded more independently than the whole fleet.\n\nThis pushes the discussion beyond modulo math and into product semantics. Which entities can become extraordinarily hot? Which reads can be served from locality-aware caches or replicas? Which writes must remain single-owner? Which fan-out operations can be deferred or rate limited? A good partitioning answer is really an answer about concentrated demand and how the architecture contains it without turning every request into global coordination.",
            "bullets": [
              "Model hot tenants, hot objects, and synchronized traffic bursts explicitly instead of assuming uniform keys.",
              "Choose a strategy that explains what happens when one partition becomes dramatically hotter than the median.",
              "Connect partitioning to caching, rate limiting, and fan-out control rather than treating it as a purely storage-local choice."
            ]
          },
          {
            "heading": "Pick keys that preserve locality without locking the system into a corner",
            "body": "A good partition key usually follows ownership and access locality. User-centric workloads often partition by user or tenant so most reads and writes stay local. Some systems need compound keys that mix owner and bucket, such as tenant plus time bucket, to reduce temporal hotspots. The difficulty is that today's best key can become tomorrow's migration project if it aligns too strongly with a success case like one giant tenant or one bursty event pattern. If region or compliance is part of the product contract, the key often needs to route first to a cell or region and only then to an internal partition so the failure domain and legal boundary are both visible.\n\nThe safest designs retain some routing indirection. Virtual nodes, placement metadata, or directory services let the system move ownership later without changing the external key. That indirection is not free, but it is often worth the cost because partitioning is a long-lived contract. A senior answer explains both the initial key and the future rebalancing path rather than pretending the first choice will be perfect forever.",
            "bullets": [
              "Choose a key that keeps the dominant workflow local while still allowing future rebalancing via indirection.",
              "Use compound or bucketed keys when pure time-based or pure tenant-based routing would create predictable hotspots.",
              "Keep routing metadata highly available because partition indirection becomes part of the critical control plane."
            ],
            "codeExample": {
              "title": "Virtual-node assignment sketch",
              "language": "python",
              "code": "vnodes = {\n    0: 'shard-a',\n    1: 'shard-b',\n    2: 'shard-c',\n    3: 'shard-a',\n}\n\ndef vnode_for_hash(hash_value, vnode_count=4):\n    return hash_value % vnode_count\n\ndef shard_for_hash(hash_value):\n    return vnodes[vnode_for_hash(hash_value)]\n\nprint(shard_for_hash(17))"
            }
          },
          {
            "heading": "Hot keys need a toolbox, not one universal fix",
            "body": "A hot key can be handled in several ways depending on the workload. Read-heavy hot objects often benefit from multilayer caches, request coalescing, replica reads, locality-aware caching near the traffic source, or edge distribution. Write-heavy hot objects may need queued serialization, logical sub-key splitting, key salting, rate limits, or a product change that reduces contention on a single record. The point is to address the specific source of heat rather than applying generic sharding and hoping it spreads a fundamentally concentrated access pattern.\n\nThe right fix also depends on whether the hotspot is permanent or event-driven. A celebrity profile, breaking-news topic, or sale launch may need temporary fan-out protection and CDN or cache priming. A permanently hot tenant may need dedicated isolation, dedicated hot partitions, or custom partition placement inside its own cell. Strong HLD answers therefore separate temporary burst handling from long-term ownership changes and call out what happens after the immediate fire is contained.",
            "bullets": [
              "Use different mitigations for read hotspots and write hotspots because their bottlenecks differ.",
              "Distinguish bursty ephemeral hotspots from structurally hot tenants or objects.",
              "Consider product-level changes, such as batching or delayed counters, when pure infrastructure fixes remain too expensive."
            ],
            "codeExample": {
              "title": "Request coalescing for a hot read key",
              "language": "javascript",
              "code": "const inflight = new Map();\n\nasync function getHotProfile(userId, loader) {\n  if (inflight.has(userId)) return inflight.get(userId);\n  const promise = loader(userId).finally(() => inflight.delete(userId));\n  inflight.set(userId, promise);\n  return promise;\n}"
            }
          },
          {
            "heading": "Rebalancing is an operational migration with cache and bandwidth side effects",
            "body": "Moving partitions is not only a metadata update. Data transfer consumes network and disk, caches cold-start on the destination, and clients or workers may temporarily route inconsistently if the control plane lags. A design that can spread load in theory may still fail in practice if rebalancing traffic competes with live traffic or if too many keys move at once. Virtual nodes help because they let operators shift smaller units, but they do not remove the need for staged movement and clear observability.\n\nThis is one of the best places to demonstrate production thinking in an interview. Mention how you would pace transfers, what metrics show rebalancing is safe, how you keep routing metadata fresh, and what rollback means if the destination shard saturates. If the answer stops at consistent hashing, it sounds academic. If it describes movement cost and control-plane behavior, it sounds operationally real.",
            "bullets": [
              "Move partitions in bounded chunks so rebalancing bandwidth does not starve live traffic.",
              "Watch destination saturation, cache warm-up, and control-plane freshness during reassignment.",
              "Retain a rollback or pause path if the target shard cannot absorb the moved hot set safely."
            ],
            "codeExample": {
              "title": "Detect skew from per-partition request counts",
              "language": "sql",
              "code": "SELECT partition_id,\n       sum(request_count) AS requests,\n       round(sum(request_count) * 100.0 / sum(sum(request_count)) OVER (), 2) AS pct_total\nFROM partition_metrics_hourly\nWHERE observed_hour = date_trunc('hour', now())\nGROUP BY partition_id\nORDER BY requests DESC;"
            }
          },
          {
            "heading": "Skew metrics matter more than average fleet health",
            "body": "Average CPU across the fleet can look healthy while one partition is collapsing. Hot-key control therefore needs partition-level metrics: per-shard request rate, p95 latency by shard, cache hit ratio by key class, queue depth by logical owner, and top-N key concentration. Without those views, teams often misdiagnose a hotspot as a generic capacity issue and add more nodes that do not help the overloaded partition.\n\nSkew visibility also improves product decisions. If one tenant repeatedly consumes a huge share of capacity, perhaps the business needs a dedicated tier or throttling contract. If one content type creates most write amplification, perhaps that feature needs batching or asynchronous counters. The point is that hotspot management is partly an observability and product-shaping problem, not only a routing algorithm problem.",
            "bullets": [
              "Measure top partitions and top keys directly because fleet averages hide skew.",
              "Use skew metrics to drive both infrastructure actions and product-tier decisions.",
              "Treat hotspot detection and mitigation as a permanent loop, not as a one-time design exercise."
            ]
          },
          {
            "heading": "Interview framing: explain the key, the hotspot, and the containment plan",
            "body": "A strong answer here says more than shard by user. It says the system partitions by a stable ownership dimension, keeps routing indirection so rebalancing is possible, uses caches and request coalescing for read hotspots, isolates or rate-limits exceptional tenants, and monitors shard-level skew. That structure demonstrates that you understand both initial distribution and the production failure mode of uneven success.\n\nThen say what you are not promising. Maybe cross-partition aggregates are asynchronous. Maybe one ultra-hot tenant eventually gets a dedicated partition or cluster. Maybe temporary flash-sale writes queue instead of staying purely synchronous. Those admissions make the answer practical because they acknowledge that hotspot control is often about bounding damage rather than eliminating skew completely.",
            "bullets": [
              "State the chosen key, the likely hotspot pattern, and the first mitigation you would apply.",
              "Mention routing indirection and staged rebalancing rather than assuming keys never need to move.",
              "Be explicit about where the design accepts asynchronous aggregation or tenant isolation to survive skew."
            ]
          }
        ],
        "checklist": [
          "Choose a partition key by locality and skew tolerance, not only by average spread.",
          "Plan an indirection layer such as virtual nodes or routing metadata for future movement.",
          "Connect partitioning to cell boundaries when region, tenant, or compliance requires independent failure domains.",
          "Name distinct mitigations for read hotspots and write hotspots.",
          "Describe how rebalancing is staged, observed, and rolled back if needed.",
          "Track shard-level and key-level skew metrics rather than only fleet-wide averages.",
          "Connect hotspot handling to product or tenant policy when concentrated usage is persistent."
        ],
        "pitfalls": [
          "Assuming consistent hashing alone solves hot keys even when one object is fundamentally more popular than all others.",
          "Choosing a partition key that matches synchronized traffic bursts and creates built-in hotspots.",
          "Rebalancing too much data at once and making the recovery event worse than the original imbalance.",
          "Looking only at fleet-average CPU or QPS and missing that one partition is failing independently.",
          "Ignoring the possibility that product-tier or feature changes may be the cheapest hotspot mitigation."
        ],
        "interviewPrompts": [
          "How would you keep one celebrity account from overwhelming a partitioned feed or profile system?",
          "Why is routing indirection useful even if the first partition key seems reasonable today?",
          "What is different about handling a hot read key versus a hot write key?",
          "Which metrics would tell you the partitioning strategy is starting to break under skew?"
        ],
        "likelyAnswerPoints": [
          "Partitioning should be judged under skew, because real systems fail from concentrated demand far more often than from perfectly even traffic.",
          "A strong key keeps dominant workflows local but still allows future movement through virtual nodes or routing metadata. When needed, a cell boundary adds an explicit blast-radius layer above individual partitions.",
          "Hot-key control requires a toolbox including salting, caching, request coalescing, locality-aware caching, queued serialization, rate limits, and sometimes tenant isolation or dedicated hot partitions.",
          "Operational maturity shows up in staged rebalancing and skew-specific observability, not just in the choice of hashing algorithm."
        ],
        "exercises": [
          {
            "id": "flash-sale-hotspot-control",
            "title": "Design hotspot control for a flash sale",
            "difficulty": "advanced",
            "type": "design",
            "description": "Design a partitioning and mitigation plan for a flash-sale inventory system where a few SKUs become massively hotter than the rest of the catalog for fifteen minutes at a time.",
            "promptQuestions": [
              "What partition key keeps most inventory operations local while still allowing exceptional hot products to be handled safely?",
              "Which read-path and write-path mitigations would you apply during the hottest part of the event?",
              "How would you detect when a product should move from shared treatment to dedicated isolation or queue-based serialization?",
              "What rebalancing or rollback safeguards would you need if operators decide to move the hot partition during the event?"
            ],
            "hints": [
              "Separate browse traffic from reservation writes.",
              "Think about temporary burst mitigation versus permanent layout changes.",
              "Use skew metrics, not only overall traffic, to justify the design."
            ]
          },
          {
            "id": "hot-key-coalescer",
            "title": "Implement a hot-key request coalescer",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete the JavaScript helper so duplicate concurrent reads for the same key share one in-flight load.",
            "starterCode": "const inflight = new Map();\n\nasync function loadOnce(key, loader) {\n  // TODO: if inflight already has the key, return that promise.\n  // TODO: otherwise call loader(), store the promise, delete it on finally, and return it.\n}",
            "solution": "const inflight = new Map();\n\nasync function loadOnce(key, loader) {\n  if (inflight.has(key)) return inflight.get(key);\n  const promise = loader().finally(() => inflight.delete(key));\n  inflight.set(key, promise);\n  return promise;\n}",
            "expectedOutput": "Concurrent callers for the same hot key should await one shared promise instead of stampeding the origin independently."
          }
        ],
        "diagram": null,
        "related": [
          "consistent-hashing-and-hot-keys",
          "partitioning-and-sharding",
          "caching-layers",
          "service-discovery",
          "observability"
        ]
      },
      {
        "slug": "consensus-quorums-and-leadership",
        "title": "Consensus, quorums, and leadership",
        "summary": "Use coordination only where the business truly needs a single write owner or shared control-plane truth, then explain the safety and latency costs clearly.",
        "duration": "60-75 min",
        "whyItMatters": "This topic separates casual distributed-systems language from real system-design depth. Strong candidates can explain when leadership is necessary, what quorums buy, and why global coordination is expensive enough to keep off most hot paths.",
        "sections": [
          {
            "heading": "Coordination is expensive, so start by proving you need it",
            "body": "Consensus and leadership are not badges of sophistication. They are costs paid to maintain one truth about something that cannot safely diverge. Metadata ownership, primary election, schema control, lock coordination, and some critical write paths may justify that cost. Many other workflows do not. If an operation can be partitioned, retried idempotently, or expressed as an eventually reconciled workflow, forcing it through global consensus often turns a scalable problem into a slower and more fragile one.\n\nThis is the first high-signal distinction in interviews. Strong answers do not say we will use Raft because we need consistency. They say exactly which state requires a single current owner or quorum-backed agreement and which state remains local, cached, or asynchronous. Real systems often put that control-plane truth in an etcd-style metadata service while keeping the data plane partitioned and fast. That split is how real systems preserve both safety and throughput.",
            "bullets": [
              "Use coordination only for state that genuinely requires one current owner or globally agreed metadata.",
              "Keep data-plane reads and writes off the consensus path unless the product truly needs that level of coordination.",
              "Separate control-plane leadership from application-level business workflows wherever possible."
            ]
          },
          {
            "heading": "Quorum math is useful only when tied to read and write behavior",
            "body": "Quorum language matters because it describes overlap between reads and writes across replicas, but the math alone is not the answer. A write quorum larger than half the replicas can ensure at least one overlapping node with a read quorum larger than half, yet practical systems still contend with message delay, hinted handoff, read repair, and client deadlines. If you name read and write quorums, you should also explain what a client may observe under lag or partial failure.\n\nIn production, quorum choices reflect a product trade-off. Larger quorums improve freshness confidence and durability but spend more latency budget and reduce tolerance for slow replicas. Smaller quorums preserve availability or speed but widen the stale-read window and increase repair work. Senior answers describe that trade-off in user terms rather than stopping at R plus W greater than N.",
            "bullets": [
              "Explain what the chosen quorum buys in observed freshness or durability, not only in algebra.",
              "Remember that slow or unreachable replicas change the practical latency and availability of a quorum write.",
              "Pair quorum discussion with repair and stale-read behavior so the answer remains user facing."
            ],
            "codeExample": {
              "title": "Check quorum overlap",
              "language": "python",
              "code": "def overlaps(replica_count, read_quorum, write_quorum):\n    return read_quorum + write_quorum > replica_count\n\nprint(overlaps(3, 2, 2))\nprint(overlaps(5, 2, 2))"
            }
          },
          {
            "heading": "Leadership is about fenced ownership, not only about choosing a winner",
            "body": "A leader is useful when one actor must serialize writes or assign work, but electing a leader is only half the problem. The more subtle requirement is preventing an old leader from acting after it should have lost authority. Leases, term numbers, fencing tokens, and epoch-based metadata all exist because partitions and slow networks can leave a previously healthy node alive long enough to do damage. Safe leadership therefore requires both election and stale-owner suppression.\n\nThis matters directly in HLD for metadata services, schedulers, partition coordinators, and payment or inventory sequencers. If the answer says leader election without mentioning leases or fencing, the split-brain story is incomplete. Mature designs explain how clients know which leader is current, how writes from older terms are rejected, and how long failover intentionally waits before trusting a new authority.",
            "bullets": [
              "Use terms, epochs, leases, or fencing tokens so previously valid leaders cannot continue mutating state safely after losing ownership.",
              "Explain how clients discover the current leader and how stale writers are rejected.",
              "Accept that failover speed and failover safety usually pull in opposite directions."
            ],
            "codeExample": {
              "title": "Leadership write with fencing token",
              "language": "javascript",
              "code": "function applyWrite(currentFence, requestFence, payload) {\n  if (requestFence < currentFence) {\n    throw new Error('stale leader');\n  }\n  return { nextFence: requestFence, payload };\n}\n\nconsole.log(applyWrite(12, 13, { configVersion: 7 }));"
            }
          },
          {
            "heading": "Membership changes and failover drills are where theory meets operations",
            "body": "Real consensus-backed systems spend a surprising amount of engineering effort on changing membership safely, replacing failed nodes, and recovering performance after leadership movement. Adding or removing replicas affects quorum calculations, log catch-up, and availability margins. If you do not mention membership changes, the design sounds static in a way production clusters rarely are. In a control plane this might mean safely rotating metadata voters or ownership coordinators while the partitioned data plane keeps serving.\n\nLeadership change also has customer-visible consequences. A brief pause for election may be acceptable for metadata updates but not for every end-user write. A cluster may stay correct but become slow while the new leader warms caches or catches followers up. The best HLD answers acknowledge that consensus systems are safer than ad hoc failover because they are disciplined, not because they are effortless.",
            "bullets": [
              "Mention how replicas join, catch up, and start participating in quorum decisions.",
              "Expect leadership movement to affect latency temporarily even when correctness remains intact.",
              "Treat drills and membership change procedures as part of the system design, not as undocumented cluster magic."
            ],
            "codeExample": {
              "title": "Lease-style leadership row",
              "language": "sql",
              "code": "CREATE TABLE leader_lease (\n  resource_id TEXT PRIMARY KEY,\n  term BIGINT NOT NULL,\n  holder_id TEXT NOT NULL,\n  lease_until TIMESTAMPTZ NOT NULL\n);\n\n-- Writers must present a current term and refuse work once lease_until expires."
            }
          },
          {
            "heading": "Client semantics matter as much as server consensus",
            "body": "Even a well-designed leader or quorum system can confuse clients if the client contract is vague. Where should the client send writes during election? Should retries be safe? Can a read observe stale metadata during leader movement? Does the API return a retryable redirect, a fenced error, or a temporary unavailable response? These questions belong in HLD because they determine whether coordination complexity leaks as random client pain.\n\nSenior answers often distinguish leader-aware internal clients from simpler external clients. Internal systems might follow redirects or refresh metadata on stale-term errors. External clients may just receive retriable 503s behind a stable endpoint while the gateway or coordinator hides the leader transition. The important part is that leadership changes are reflected in a coherent caller contract rather than left to luck.",
            "bullets": [
              "Design the caller contract for elections and stale-leader responses deliberately.",
              "Keep retries idempotent so temporary coordination events do not duplicate mutations.",
              "Hide coordination churn behind stable endpoints when external clients do not need direct topology knowledge."
            ]
          },
          {
            "heading": "Interview framing: isolate coordination and say what it costs",
            "body": "A convincing interview answer says something like: consensus is used only for partition metadata and primary ownership, normal reads stay partition-local, writes that require a single owner go through the leader, and fencing tokens prevent stale leaders from mutating state after failover. That explanation shows that you are using coordination surgically rather than smearing it across the entire architecture.\n\nThen state the cost openly. Maybe leader failover adds a short pause. Maybe quorum writes cost more latency across zones. Maybe some reads accept eventual repair instead of global coordination. Senior answers become trustworthy when they make those costs explicit instead of pretending coordination is both free and everywhere.",
            "bullets": [
              "Isolate consensus to the smallest state surface that truly needs it.",
              "Explain how terms or fencing prevent stale ownership after failover.",
              "Name the latency or availability cost of the coordination choice in practical terms."
            ]
          }
        ],
        "checklist": [
          "Prove which state actually needs coordination before introducing leaders or consensus.",
          "Explain quorum behavior in terms of observed read freshness, durability, and latency trade-offs.",
          "Use leases, terms, or fencing tokens to suppress stale leaders after failover.",
          "Describe membership changes, catch-up, and election effects on latency or availability.",
          "Define client behavior during elections, redirects, and stale-leader errors.",
          "Keep most traffic off the coordination path if the domain allows partitioned or asynchronous handling."
        ],
        "pitfalls": [
          "Using consensus vocabulary as a proxy for correctness without identifying the exact state that needs it.",
          "Stopping at quorum algebra without describing stale reads, repair, or latency cost.",
          "Ignoring stale-leader suppression and therefore leaving the split-brain story unfinished.",
          "Assuming membership changes and leader movement are invisible operationally.",
          "Letting coordination semantics leak as undefined client behavior during failover or retry."
        ],
        "interviewPrompts": [
          "When do you actually need a leader in a distributed system instead of partition-local autonomy?",
          "What does read quorum plus write quorum buy, and what does it still not guarantee automatically?",
          "Why are fencing tokens or epochs important after leader election?",
          "How would you explain leader failover behavior to an API client or another internal service?"
        ],
        "likelyAnswerPoints": [
          "Coordination should be used only where there must be one current owner or shared metadata truth, because global consensus is expensive. The usual 2026 pattern is a narrow control plane, often Raft-backed, around partition ownership or metadata.",
          "Quorums trade latency and partial-failure tolerance for better overlap between reads and writes, but they still require a stale-read and repair story.",
          "Leadership is safe only when stale owners are fenced off with terms, leases, or tokens, not merely when a new leader is elected.",
          "Operational credibility comes from membership-change handling, election behavior, and clear client semantics during ownership transitions while the data plane stays mostly partition-local."
        ],
        "exercises": [
          {
            "id": "partition-metadata-coordination",
            "title": "Design coordination for partition metadata",
            "difficulty": "advanced",
            "type": "design",
            "description": "Design the control plane for a partitioned data service where partition ownership must move safely during failures and scaling events, but ordinary reads should remain fast.",
            "promptQuestions": [
              "Which metadata or ownership state truly requires consensus, and which request paths can stay outside it?",
              "How will clients discover the current partition owner and react to stale-owner errors?",
              "What membership-change and catch-up steps are required before a new node can serve quorum traffic?",
              "Where would you accept extra latency for safety, and where would you avoid coordination entirely?"
            ],
            "hints": [
              "Separate control-plane metadata from normal data-plane reads.",
              "Include stale-leader suppression, not only election.",
              "Explain the caller contract during ownership changes."
            ]
          },
          {
            "id": "quorum-overlap-checker",
            "title": "Implement a quorum overlap checker",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete the Python helper so it returns whether read and write quorums overlap for a given replica count.",
            "starterCode": "def overlaps(replica_count, read_quorum, write_quorum):\n    # TODO: return True when read_quorum + write_quorum > replica_count.\n    pass\n\nprint(overlaps(3, 2, 2))  # expected True\nprint(overlaps(5, 2, 2))  # expected False",
            "solution": "def overlaps(replica_count, read_quorum, write_quorum):\n    return read_quorum + write_quorum > replica_count\n\nprint(overlaps(3, 2, 2))\nprint(overlaps(5, 2, 2))",
            "expectedOutput": "The helper should return True for 3 replicas with R=2 and W=2, and False for 5 replicas with R=2 and W=2."
          }
        ],
        "diagram": null,
        "related": [
          "consensus-quorums-and-leader-election",
          "replication-and-failover",
          "service-discovery",
          "multi-region-disaster-recovery",
          "observability"
        ]
      },
      {
        "slug": "sagas-idempotency-and-workflows",
        "title": "Sagas, idempotency, and workflows",
        "summary": "Preserve business intent across multiple services by combining local atomicity, durable workflow state, and retry-safe command handling.",
        "duration": "60-75 min",
        "whyItMatters": "This is where many microservice diagrams collapse under follow-up questions. Good HLD answers must explain what happens when a workflow fails halfway through, how retries avoid duplicate side effects, and how operators recover stuck or inconsistent work.",
        "sections": [
          {
            "heading": "Think in business intent, not imaginary global transactions",
            "body": "Once a workflow crosses service boundaries, pretending there is one effortless ACID transaction usually hides more than it helps. Payment authorization, inventory reservation, shipment creation, email, and ledger updates may each have local transactional boundaries, but the user still expects one coherent business outcome. HLD maturity comes from modeling that business intent explicitly instead of assuming a coordinator can make all side effects behave like a single database commit.\n\nThis is why sagas and durable workflow engines exist. They accept that distributed work may complete in stages, may need retries, and may require compensating action or operator review rather than instant all-or-nothing rollback. In 2026 it is normal to mention Temporal-style durable execution for high-value long-running workflows, but only alongside fundamentals such as local atomicity, outbox delivery, and idempotent commands. The goal is not to abandon correctness. It is to preserve intent honestly using local atomicity plus durable workflow state rather than relying on fantasy infrastructure.",
            "bullets": [
              "Define the business outcome that must be preserved even when sub-steps succeed or fail at different times.",
              "Use local transactions where they are real and explicit workflow state where global atomicity is unavailable.",
              "Prefer honest staged completion to hand-waving about cross-service ACID semantics."
            ]
          },
          {
            "heading": "Sagas choose between orchestration and choreography, each with real costs",
            "body": "Orchestration centralizes workflow state and step order, which improves visibility and operational recovery at the cost of a stronger coordinator dependency. Choreography distributes responsibility through events, which can reduce direct coupling but often hides the business process across many consumers. Neither model is free. The right choice depends on how many steps exist, how important step ordering is, and how much centralized visibility operators need when something gets stuck. Durable execution platforms make orchestration much more common for high-value flows because timers, retries, and replay are built into the workflow runtime instead of hand-built in every service.\n\nIn interviews, it is not enough to say use a saga. Explain whether the workflow is best treated as a centrally visible state machine or as a small number of event-driven local reactions. If payment failure must trigger inventory release and customer messaging predictably, orchestration may be clearer. If a loose set of subscribers enriches a profile asynchronously, choreography may be acceptable. The signal comes from matching the coordination model to the business recovery needs rather than from picking the most fashionable framework.",
            "bullets": [
              "Choose orchestration when visibility, ordering, and operator intervention matter more than full decoupling.",
              "Choose choreography cautiously for simpler fan-out or enrichment flows where hidden coupling is manageable.",
              "Persist workflow state somewhere authoritative so retries and operators observe the same truth."
            ],
            "codeExample": {
              "title": "Workflow step state sketch",
              "language": "python",
              "code": "workflow = {\n    'order_id': 'ord-1',\n    'steps': {\n        'reserve_inventory': 'done',\n        'charge_payment': 'retrying',\n        'send_email': 'pending',\n    }\n}\nprint(workflow)"
            }
          },
          {
            "heading": "Outbox, inbox, and idempotency close the retry loop safely",
            "body": "Retries are inevitable in distributed systems, but retries only help if duplicate work is harmless or detectable. Stable idempotency keys on externally visible commands, outbox tables on the producer side, and inbox or deduplication state on the consumer side are what turn at-least-once delivery into business-safe behavior. Without those layers, a network timeout can become double charging, duplicate reservations, or conflicting downstream projections.\n\nThe key insight is that exactly-once is usually a composition of durable write ordering plus idempotent handling, not a magic transport guarantee. A workflow step should know whether it has already applied a command, what result should be returned on replay, and how long deduplication state must be retained. Senior answers make that logic explicit instead of claiming a queue or workflow engine solved duplication automatically.",
            "bullets": [
              "Require stable command identifiers on money-moving or externally retryable operations.",
              "Use outbox and inbox or another durable dedupe pattern so transport retries do not become business duplicates.",
              "Store enough result state that a replay can return the original outcome instead of re-executing blindly."
            ],
            "codeExample": {
              "title": "Outbox and inbox tables for idempotent projection",
              "language": "sql",
              "code": "CREATE TABLE outbox_events (\n  event_id UUID PRIMARY KEY,\n  topic TEXT NOT NULL,\n  aggregate_id TEXT NOT NULL,\n  payload JSONB NOT NULL,\n  published_at TIMESTAMPTZ\n);\n\nCREATE TABLE inbox_dedup (\n  consumer_name TEXT NOT NULL,\n  event_id UUID NOT NULL,\n  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  PRIMARY KEY (consumer_name, event_id)\n);"
            }
          },
          {
            "heading": "Compensation is a business decision, not just technical undo",
            "body": "Compensating actions are often described too casually. Reversing a reservation, refunding a payment, voiding an authorization, and sending an apology email are not all the same kind of compensation. Some are true reversals. Some are new business actions with customer and accounting implications. The architecture should therefore distinguish reversible local actions from irreversible side effects and design operator visibility for the latter.\n\nThis is where workflow design becomes domain-specific. If shipment creation is not easily reversible after handoff, maybe the workflow delays that step until payment certainty rises. If notification can fire twice, maybe the product tolerates one duplicate or uses dedupe tokens in the mailer. Good HLD answers show that compensations are planned around real business semantics, not as a magical undo button attached to every step.",
            "bullets": [
              "Differentiate truly reversible steps from steps that require a new corrective business action.",
              "Delay or isolate irreversible side effects when the workflow still carries uncertainty.",
              "Expose compensation state to operators because manual review is sometimes the correct recovery path."
            ],
            "codeExample": {
              "title": "Idempotent command handling sketch",
              "language": "javascript",
              "code": "async function applyCommand(store, key, handler) {\n  const prior = await store.get(key);\n  if (prior) return prior.result;\n  const result = await handler();\n  await store.put(key, { result });\n  return result;\n}"
            }
          },
          {
            "heading": "Workflow operations need reconciliation and stuck-state recovery",
            "body": "Even well-designed workflows need audits that compare expected state to observed state. A workflow may be marked complete even though one projection lagged. A payment provider may succeed after the caller timed out. A compensation may fail while the user already saw the failure banner. Reconciliation jobs and operator dashboards are therefore part of the architecture because they close the gap between ideal event flow and messy real-world timing. AI or agent workflows deserve the same discipline: a multi-step tool-using job still needs durable state, retry safety, and a way to detect partial progress or duplicate side effects.\n\nA strong design names who notices and who repairs stuck workflows. Operators may need a queue of workflows awaiting manual decision, a re-drive button for transient failures, or a report of steps whose wall-clock time exceeds policy. Without that visibility, the only workflow monitoring is user complaints. In HLD, mentioning reconciliation and stuck-state tooling is a strong sign that you understand distributed workflows as long-lived operational systems, not just code paths.",
            "bullets": [
              "Run reconciliation jobs that compare source-of-truth state with expected downstream workflow effects.",
              "Expose stuck, retrying, and compensating workflows to operators with actionable controls.",
              "Measure workflow age, retry count, and compensation rate as first-class signals."
            ],
            "codeExample": {
              "title": "Workflow state reducer",
              "language": "python",
              "code": "def next_workflow_state(step_results):\n    if any(state == 'failed' for state in step_results.values()):\n        return 'needs_compensation'\n    if all(state == 'done' for state in step_results.values()):\n        return 'completed'\n    return 'in_progress'\n\nprint(next_workflow_state({'reserve': 'done', 'charge': 'failed'}))"
            }
          },
          {
            "heading": "Interview framing: show local atomicity, workflow truth, and replay safety",
            "body": "A strong answer on this topic sounds structured. Each service keeps its own local transaction. A durable workflow record captures step state. Commands carry idempotency keys. Outbox and inbox patterns bridge local writes to asynchronous delivery. Compensations are defined in business terms, and operators can see and repair stuck workflows. That chain of reasoning is what makes a microservice design credible under failure.\n\nClose by naming what the system explicitly does not promise. Maybe user-visible completion is asynchronous after acceptance. Maybe some downstream enrichments can be missing temporarily. Maybe compensation is eventual rather than instantaneous. Those constraints are not weaknesses if they are aligned with the business contract. They are what keep distributed workflows honest.",
            "bullets": [
              "Map each step to a local transaction boundary and to a durable workflow state transition.",
              "Explain how retries, duplicates, and operator recovery work before claiming the workflow is reliable.",
              "State the eventuality or compensation window the product is explicitly accepting."
            ]
          }
        ],
        "checklist": [
          "Define the workflow's business intent and the local transaction boundary of each step.",
          "Choose orchestration or choreography deliberately and explain the operational trade-off.",
          "Use idempotency keys plus outbox and inbox-style dedupe where retries cross service boundaries.",
          "Classify which side effects are reversible, compensatable, or irreversible.",
          "Provide reconciliation and operator tooling for stuck or mismatched workflows.",
          "Be explicit about eventual completion semantics and what the user sees during intermediate states."
        ],
        "pitfalls": [
          "Claiming eventual consistency without explaining how partial failure is observed and repaired.",
          "Treating queue delivery guarantees as if they eliminate the need for idempotent handlers.",
          "Assuming every step has a clean technical undo when business semantics are messier.",
          "Ignoring operator visibility until the first workflow gets stuck between providers.",
          "Designing choreography so broadly that no one can explain the full business process anymore."
        ],
        "interviewPrompts": [
          "How would you design order placement across inventory, payment, and notification services?",
          "When is orchestration clearer than choreography for a distributed workflow?",
          "What makes an API or command truly idempotent from a caller's point of view?",
          "Why do reconciliation jobs matter even after you add a workflow engine and durable events?"
        ],
        "likelyAnswerPoints": [
          "Distributed workflows should preserve business intent through local atomicity plus durable workflow state instead of pretending global ACID exists everywhere. Mentioning a Temporal-style durable execution engine is now common for long-running critical workflows, but it does not replace idempotency fundamentals.",
          "Idempotency is a system property built from stable command keys, durable dedupe state, and replaying the original result safely.",
          "Compensation is domain specific: some steps reverse cleanly, while others require explicit corrective actions and operator review.",
          "Operational maturity comes from reconciliation, stuck-workflow dashboards, and clear eventual-completion semantics for the user, whether the flow is checkout, onboarding, or an AI agent job."
        ],
        "exercises": [
          {
            "id": "checkout-saga-design",
            "title": "Design a checkout saga",
            "difficulty": "advanced",
            "type": "design",
            "description": "Design a distributed checkout workflow spanning cart validation, inventory reservation, payment authorization, shipment creation, and customer notification.",
            "promptQuestions": [
              "Which steps should be synchronous before the API returns accepted, and which should continue asynchronously?",
              "Would you use orchestration or choreography, and how would operators inspect progress or intervene?",
              "How will you make retries safe across payment, inventory, and notification calls?",
              "Which compensations are true reversals and which are separate corrective business actions?"
            ],
            "hints": [
              "Distinguish user acceptance from eventual completion.",
              "Make the payment retry and notification duplication story explicit.",
              "Plan operator visibility, not only machine automation."
            ]
          },
          {
            "id": "idempotent-command-wrapper",
            "title": "Implement an idempotent command wrapper",
            "difficulty": "beginner",
            "type": "coding",
            "description": "Complete the JavaScript helper so duplicate command keys return the prior result instead of re-running the handler.",
            "starterCode": "async function applyCommand(store, key, handler) {\n  const prior = await store.get(key);\n  // TODO: if prior exists, return prior.result.\n  // TODO: otherwise run handler(), persist { result }, and return it.\n}",
            "solution": "async function applyCommand(store, key, handler) {\n  const prior = await store.get(key);\n  if (prior) return prior.result;\n  const result = await handler();\n  await store.put(key, { result });\n  return result;\n}",
            "expectedOutput": "The wrapper should collapse duplicate retries onto the previously stored result for the same command key."
          }
        ],
        "diagram": null,
        "related": [
          "distributed-transactions-and-sagas",
          "idempotency-retries-backpressure",
          "queues-and-streams",
          "api-design",
          "observability"
        ]
      }
    ]
  }
];
