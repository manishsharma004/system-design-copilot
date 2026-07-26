from __future__ import annotations


def T(*paras):
    return "\n\n".join(paras)


def lines(*items):
    return "\n".join(items)


def code(title, language, code_text):
    return {"title": title, "language": language, "code": code_text}


def section(heading, body, bullets, code_example=None):
    out = {"heading": heading, "body": body, "bullets": bullets}
    if code_example is not None:
        out["codeExample"] = code_example
    return out


def design_exercise(ex_id, title, difficulty, description, prompt_questions, hints):
    return {
        "id": ex_id,
        "title": title,
        "difficulty": difficulty,
        "type": "design",
        "description": description,
        "promptQuestions": prompt_questions,
        "hints": hints,
    }


def coding_exercise(ex_id, title, difficulty, description, starter, solution, expected_output):
    return {
        "id": ex_id,
        "title": title,
        "difficulty": difficulty,
        "type": "coding",
        "description": description,
        "starterCode": starter,
        "solution": solution,
        "expectedOutput": expected_output,
    }


def lesson(
    slug,
    title,
    summary,
    why_it_matters,
    sections,
    checklist,
    pitfalls,
    interview_prompts,
    likely_answer_points,
    exercises,
    related,
):
    return {
        "slug": slug,
        "title": title,
        "summary": summary,
        "duration": "60-75 min",
        "whyItMatters": why_it_matters,
        "sections": sections,
        "checklist": checklist,
        "pitfalls": pitfalls,
        "interviewPrompts": interview_prompts,
        "likelyAnswerPoints": likely_answer_points,
        "exercises": exercises,
        "diagram": None,
        "related": related,
    }


def module(slug, title, summary, objectives, lessons):
    return {
        "slug": slug,
        "title": title,
        "summary": summary,
        "objectives": objectives,
        "lessons": lessons,
    }


def insight(heading, para1, para2):
    return {"heading": heading, "bodyParagraphs": [para1, para2]}


def ref(title, url, source, note):
    return {"title": title, "url": url, "source": source, "note": note}


def example(ex_id, label, title, scenario, decision, why, alternative, outcome):
    return {
        "id": ex_id,
        "label": label,
        "title": title,
        "scenario": scenario,
        "decision": decision,
        "why": why,
        "alternative": alternative,
        "outcome": outcome,
    }


def option(opt_id, label, best_for, choose_when, trade_offs, alternative_outcome):
    return {
        "id": opt_id,
        "label": label,
        "bestFor": best_for,
        "chooseWhen": choose_when,
        "tradeOffs": trade_offs,
        "alternativeOutcome": alternative_outcome,
    }


def case_step(title, detail, what_if):
    return {"title": title, "detail": detail, "whatIf": what_if}


def interactive_lesson(title, summary, takeaways, examples_list, prompt, options_list, case_title, case_prompt, steps, metrics, mermaid_title, mermaid_caption, mermaid_code):
    return {
        "title": title,
        "summary": summary,
        "takeaways": takeaways,
        "examples": examples_list,
        "decisionGuide": {"prompt": prompt, "options": options_list},
        "caseStudy": {"title": case_title, "prompt": case_prompt, "steps": steps, "metrics": metrics},
        "mermaid": {"title": mermaid_title, "caption": mermaid_caption, "code": mermaid_code},
    }


def _indexing_and_query_path_design():
    return lesson(
        slug="indexing-and-query-path-design",
        title="Indexing and query path design",
        summary="Design tables, secondary indexes, and pagination paths from concrete production queries instead of from abstract schema diagrams alone.",
        why_it_matters="Storage costs are paid continuously, but bad query paths are paid in every p95 and every incident review. Senior HLD answers are stronger when they can connect a user-facing read or write path to the exact key order, access pattern, and operational cost inside the datastore.",
        sections=[
            section(
                "Start from the request path, not the entity list",
                T(
                    "A credible indexing plan starts with the user request that must finish on time, not with a whiteboard full of nouns. If an operator dashboard always filters by tenant, status, and a descending created-at cursor, then the database path is already constrained. The winning design is the one that can answer that exact shape with stable latency as cardinality grows, not the one that looks maximally normalized in a vacuum.",
                    "Teams get into trouble when the data model and the query model drift apart. They add optional filters, free-form sorting, and ad hoc admin exports until the hot path silently turns into a scan plus sort plus heap lookup storm. Query path design means deciding which predicates are first-class, which sorts are allowed, which pages are cursor-based, and which exploratory questions belong in search, analytics, or offline systems instead of the transactional read path.",
                ),
                [
                    "Write down the exact tenant, filter, sort, and pagination shape of the hot request before discussing indexes.",
                    "Distinguish online serving queries from ad hoc analytics so one indexing strategy is not forced to serve incompatible workloads.",
                    "Treat pagination strategy and index strategy as one decision because the cursor usually depends on the same ordered key set.",
                ],
            ),
            section(
                "Primary keys and composite indexes encode the read contract",
                T(
                    "Primary keys describe authority and uniqueness, but secondary indexes describe how the system is actually consumed. Composite keys must follow equality filters first, then range filters or sort columns, because the leftmost key order determines how much of the tree the engine must walk. A tenant-scoped workload usually wants tenant_id near the front so one large customer does not cause cross-tenant scans on every query.",
                    "The strongest production-minded answers talk about what the index costs on writes as well as what it saves on reads. Every extra secondary index adds write amplification, storage, vacuum or compaction work, and longer failover catch-up. The design task is not to index every possible filter. It is to build a small set of indexes that make the top customer journeys fast while keeping write throughput and operational maintenance understandable.",
                ),
                [
                    "Order composite indexes so the most selective equality predicates and ownership boundaries come first.",
                    "Prefer a small number of intentionally reused composite indexes over many one-off indexes per endpoint.",
                    "Account for write amplification, backfill time, and replica catch-up when proposing new indexes.",
                ],
                code(
                    "Composite index for a tenant-scoped recent-orders query",
                    "sql",
                    lines(
                        "CREATE TABLE orders (",
                        "  order_id BIGSERIAL PRIMARY KEY,",
                        "  tenant_id BIGINT NOT NULL,",
                        "  user_id BIGINT NOT NULL,",
                        "  status TEXT NOT NULL,",
                        "  total_cents BIGINT NOT NULL,",
                        "  created_at TIMESTAMPTZ NOT NULL DEFAULT now()",
                        ");",
                        "",
                        "CREATE INDEX idx_orders_tenant_status_created",
                        "  ON orders (tenant_id, status, created_at DESC, order_id DESC);",
                        "",
                        "-- Supports:",
                        "-- WHERE tenant_id = $1 AND status = $2",
                        "-- ORDER BY created_at DESC, order_id DESC",
                        "-- LIMIT 50",
                    ),
                ),
            ),
            section(
                "Covering, partial, and purpose-built indexes should buy a specific win",
                T(
                    "Once the hot path is known, the next question is whether the index can avoid extra table lookups. Covering indexes, included columns, or clustered layouts can reduce heap visits for read-heavy screens that only need a narrow projection. Partial indexes are even more focused: they index only the rows that matter to a recurring filter such as active subscriptions or unprocessed jobs, so they keep both the structure and the write overhead smaller than a full-table secondary index.",
                    "The trap is building clever indexes with no explicit latency or cost hypothesis. A partial index on pending jobs is useful if dispatchers mostly read pending jobs. It is wasted if the workload quickly shifts to scanning all jobs by tenant. In review, ask which query becomes faster, how much data the index excludes, how the planner chooses it, and what fallback path exists if the query shape changes after product evolution.",
                ),
                [
                    "Use covering indexes only for projections that are stable enough to justify the extra bytes and maintenance.",
                    "Use partial indexes when a narrow subset of rows dominates the hot path.",
                    "Validate with explain plans and production cardinality, not just with local dev data.",
                ],
                code(
                    "Partial index for pending job dispatch",
                    "sql",
                    lines(
                        "CREATE TABLE delivery_jobs (",
                        "  job_id BIGSERIAL PRIMARY KEY,",
                        "  tenant_id BIGINT NOT NULL,",
                        "  state TEXT NOT NULL,",
                        "  run_after TIMESTAMPTZ NOT NULL,",
                        "  payload JSONB NOT NULL",
                        ");",
                        "",
                        "CREATE INDEX idx_delivery_jobs_ready",
                        "  ON delivery_jobs (tenant_id, run_after ASC, job_id ASC)",
                        "  WHERE state = 'pending';",
                        "",
                        "EXPLAIN ANALYZE",
                        "SELECT job_id, run_after",
                        "FROM delivery_jobs",
                        "WHERE tenant_id = 42",
                        "  AND state = 'pending'",
                        "  AND run_after <= now()",
                        "ORDER BY run_after ASC, job_id ASC",
                        "LIMIT 100;",
                    ),
                ),
            ),
            section(
                "Guard the planner from accidental fan-out and broad filter combinations",
                T(
                    "A mature query path design constrains what the application is allowed to ask for. Product teams often want dynamic filtering and sorting, but letting every route combine every filter with every sort produces a combinatorial explosion that no practical indexing plan can cover. If the application only exposes supported predicates and sort orders, storage remains predictable and on-call engineers are not surprised by a single dashboard query consuming half the IOPS budget.",
                    "This is where service design and storage design meet. Good APIs encode safe query shapes with explicit sort enums, cursor tokens, and bounded filters. Unsafe queries can be rejected, routed to asynchronous export jobs, or served from search and analytics systems that were designed for exploratory access. The goal is not to deny product flexibility. It is to separate the sub-second serving path from the slower but more expressive investigative path.",
                ),
                [
                    "Whitelist allowed filter and sort combinations on hot endpoints instead of letting arbitrary SQL-like requests through.",
                    "Send broad exploratory queries to exports, search indexes, or warehouses rather than stretching the OLTP path beyond its purpose.",
                    "Treat query-builder guardrails as performance controls, not just API cosmetics.",
                ],
                code(
                    "Application-side query shape guardrail",
                    "javascript",
                    lines(
                        "const SORTS = {",
                        "  RECENT: ['created_at', 'DESC'],",
                        "  OLDEST: ['created_at', 'ASC'],",
                        "  HIGHEST_TOTAL: ['total_cents', 'DESC']",
                        "};",
                        "",
                        "function buildOrderQuery({ tenantId, status, sort = 'RECENT' }) {",
                        "  if (!tenantId || !status) throw new Error('tenantId and status are required');",
                        "  if (!SORTS[sort]) throw new Error('unsupported sort');",
                        "  if (sort === 'HIGHEST_TOTAL' && status !== 'paid') {",
                        "    throw new Error('high-total sort is only supported for paid orders');",
                        "  }",
                        "  return {",
                        "    where: { tenant_id: tenantId, status },",
                        "    orderBy: SORTS[sort]",
                        "  };",
                        "}",
                    ),
                ),
            ),
            section(
                "Index rollouts are operational changes, not only DDL statements",
                T(
                    "Adding an index to a live high-cardinality table can be one of the most expensive safe-looking changes a team makes. Even online builds consume CPU, I/O, and replication bandwidth. A new index can increase write latency, expand storage enough to trigger maintenance churn, or extend recovery time after failover because replicas must catch up more bytes. Production teams therefore stage index changes with measured rollout criteria instead of treating them as routine migrations.",
                    "The safest rollout path ties the new index to a read-migration plan. Build the index, watch build progress and replica lag, shadow the new query plan or route a small read cohort to the new access path, and only then remove the old path or old index. If the new plan improves p95 but hurts write latency or bloat, that trade-off should be visible before the change becomes permanent. Good HLD answers say which metrics prove the rollout is safe.",
                ),
                [
                    "Track index build progress, replica lag, write latency, and storage growth during large index changes.",
                    "Roll reads onto the new index gradually when possible instead of coupling index creation and query-plan dependence in one deploy.",
                    "Delete obsolete indexes after observation windows so write paths do not carry historical baggage forever.",
                ],
                code(
                    "Simple index-rollout readiness check",
                    "python",
                    lines(
                        "metrics = {",
                        "    'replica_lag_seconds': 2,",
                        "    'write_p95_ms_delta': 1.8,",
                        "    'index_build_progress': 100,",
                        "    'storage_growth_gb': 18,",
                        "}",
                        "",
                        "def ready_to_shift_reads(m):",
                        "    return (",
                        "        m['index_build_progress'] == 100",
                        "        and m['replica_lag_seconds'] <= 5",
                        "        and m['write_p95_ms_delta'] <= 3",
                        "        and m['storage_growth_gb'] <= 25",
                        "    )",
                        "",
                        "print('safe_to_shift_reads=', ready_to_shift_reads(metrics))",
                    ),
                ),
            ),
            section(
                "Interview framing: defend one hot query and one painful failure mode",
                T(
                    "When you teach this topic back in an interview, anchor the discussion on one read path and one write path. State the user contract, show the table and the exact composite index, explain why the key order matches the predicates and sort, then mention what happens when the query becomes broader than intended. This keeps the answer concrete and demonstrates that you can connect logical modeling to physical execution.",
                    "Then close with an operational failure mode. Maybe the main risk is scan amplification from a new filter, maybe it is write slowdown from too many indexes, or maybe it is a replica lag spike during index build. That final step is where the answer stops sounding like textbook SQL and starts sounding like production architecture. Indexing is not only about faster queries; it is about owning the long-term read-write trade-off of a live system.",
                ),
                [
                    "Tie the proposed index to one endpoint, one sort order, and one growth assumption.",
                    "Say explicitly what query shapes are unsupported or moved to offline paths.",
                    "Name the operational metric that would tell you the indexing strategy is starting to fail in production.",
                ],
            ),
        ],
        checklist=[
            "Identify the exact predicates, sort order, projection, and pagination style of the hot request.",
            "Choose one primary key and a small number of composite indexes that directly support those shapes.",
            "Explain whether any query should use a covering or partial index and why.",
            "Constrain unsupported filter and sort combinations at the API layer.",
            "Describe the write-amplification and storage cost of every proposed secondary index.",
            "State how you would roll out and validate a new index on a live high-cardinality table.",
        ],
        pitfalls=[
            "Indexing every field mentioned in a product spec without ranking the actual hot queries.",
            "Allowing arbitrary sorts and filters on a latency-sensitive serving path.",
            "Optimizing explain plans on tiny local datasets and ignoring production cardinality and skew.",
            "Keeping stale indexes forever, which makes write latency and failover catch-up worse over time.",
            "Treating online index creation as risk-free even though it still consumes bandwidth and replica capacity.",
        ],
        interview_prompts=[
            "How would you design the indexes for a tenant-scoped order-history API sorted by recency?",
            "When is a partial index better than a full secondary index?",
            "Why can dynamic sorting and filtering break an otherwise good storage design?",
            "How would you roll out a new index on a 500 million row table without surprising the on-call team?",
        ],
        likely_answer_points=[
            "A strong answer starts from the exact request path, then chooses a composite index whose left-to-right key order matches equality filters first and ordering or range filters second.",
            "You should mention that each extra index costs write throughput, storage, and recovery bandwidth, so the goal is a minimal intentional set rather than universal indexing.",
            "If product needs broad exploratory filtering, route that workload to search, exports, or analytics instead of forcing the OLTP path to support every query shape synchronously.",
            "Production maturity shows up in the rollout plan: online build, replica lag monitoring, shadow or canary reads, and cleanup of superseded indexes after confidence grows.",
        ],
        exercises=[
            design_exercise(
                "merchant-order-history-query-path",
                "Design a merchant order-history read path",
                "intermediate",
                "Design the schema and index plan for a B2B merchant dashboard that lists recent paid or refunded orders per merchant, supports cursor pagination, and occasionally exports a 90-day CSV.",
                [
                    "Which filters and sorts belong on the synchronous UI endpoint, and which belong on an asynchronous export path?",
                    "What composite index would you create for the common recent-orders read?",
                    "How would you keep the design safe if product later asks for sorting by total amount or filtering by many optional fields?",
                    "Which rollout and observability steps would you use when adding the first large secondary index to the orders table?",
                ],
                [
                    "Start from one exact screen query instead of from every possible reporting need.",
                    "Use cursor pagination so the index order and page token align cleanly.",
                    "Call out write cost and export-job isolation explicitly.",
                ],
            ),
            coding_exercise(
                "left-prefix-index-picker",
                "Pick the best index by left-prefix match",
                "beginner",
                "Complete a Python helper that scores candidate indexes for a query whose equality filters and sort order are already known.",
                lines(
                    "query = {",
                    "    'filters': ['tenant_id', 'status'],",
                    "    'sort': ['created_at', 'order_id'],",
                    "}",
                    "indexes = [",
                    "    ('idx_a', ['status', 'tenant_id', 'created_at']),",
                    "    ('idx_b', ['tenant_id', 'status', 'created_at', 'order_id']),",
                    "    ('idx_c', ['tenant_id', 'created_at']),",
                    "]",
                    "",
                    "def score_index(query, columns):",
                    "    # TODO: return how many query columns match from the start of the index.",
                    "    # Filters should be matched before the sort columns.",
                    "    pass",
                    "",
                    "# TODO: print the index name with the highest score. Expected: idx_b",
                ),
                lines(
                    "query = {",
                    "    'filters': ['tenant_id', 'status'],",
                    "    'sort': ['created_at', 'order_id'],",
                    "}",
                    "indexes = [",
                    "    ('idx_a', ['status', 'tenant_id', 'created_at']),",
                    "    ('idx_b', ['tenant_id', 'status', 'created_at', 'order_id']),",
                    "    ('idx_c', ['tenant_id', 'created_at']),",
                    "]",
                    "",
                    "def score_index(query, columns):",
                    "    wanted = query['filters'] + query['sort']",
                    "    matched = 0",
                    "    for expected, actual in zip(wanted, columns):",
                    "        if expected != actual:",
                    "            break",
                    "        matched += 1",
                    "    return matched",
                    "",
                    "best = max(indexes, key=lambda pair: score_index(query, pair[1]))",
                    "print(best[0])",
                ),
                "The program should print idx_b because it preserves the full left-prefix of tenant_id, status, created_at, and order_id.",
            ),
        ],
        related=[
            "relational-data-modeling",
            "storage-selection",
            "caching-layers",
            "api-design",
            "observability",
        ],
    )


def _replication_sharding_and_consistency():
    return lesson(
        slug="replication-sharding-and-consistency",
        title="Replication, sharding, and consistency",
        summary="Choose replica topologies, shard keys, and user-visible consistency contracts that match the business risk of stale or lost data.",
        why_it_matters="Many HLD answers name replicas and shards quickly, but senior answers explain what users actually observe when replicas lag, a leader fails, or a shard becomes hot. This lesson trains that product-facing explanation.",
        sections=[
            section(
                "Begin with the correctness contract before naming topology",
                T(
                    "The right replication and sharding design depends on what the product must not get wrong. An inventory reservation flow, a bank balance read, and a social-feed view are all data-serving problems, but their tolerance for stale reads and lost writes is radically different. If the system cannot state what read-after-write, monotonic, or cross-entity guarantees the user journey needs, any discussion of leaders, replicas, or shards becomes architecture theater.",
                    "That is why strong design reviews start with a matrix of flows instead of with infrastructure defaults. Reads that can lag by a few seconds might go to replicas or regional followers. Reads that immediately confirm a write may need primary reads, session stickiness, or a token that proves the write has propagated. Sharding decisions then follow from throughput and ownership boundaries, not from a vague desire to look distributed.",
                ),
                [
                    "Write down which user actions require fresh reads and which can tolerate bounded staleness.",
                    "Separate durability promises from freshness promises because some flows need one more than the other.",
                    "Treat shards as throughput and data-placement tools, not automatic correctness mechanisms.",
                ],
            ),
            section(
                "Replica topology changes what a read can honestly promise",
                T(
                    "Leader-follower replication keeps one authoritative write owner, which simplifies conflict handling but introduces replica lag and failover nuance. Asynchronous followers are cheap for read scale and region-local reads, yet they cannot promise immediate freshness after a write unless the client is explicitly routed to the leader or to a follower that has caught up past a known log position. Synchronous replication improves durability but spends more latency and coordination budget on every write.",
                    "The production question is not whether replicas are good. It is which requests can safely consume follower state. A catalog page can probably read slightly stale availability counts; a just-changed password or revoked admin role usually cannot. Mature systems encode that distinction in routing rules, session semantics, or per-request consistency flags so engineers do not accidentally confirm a critical write from a lagging node.",
                ),
                [
                    "Use follower reads only where the product can tolerate the replica freshness window.",
                    "Plan a read-after-write strategy such as primary reads, session stickiness, or log-position tokens for sensitive flows.",
                    "Expect synchronous durability gains to cost extra coordination latency on the write path.",
                ],
                code(
                    "Route fresh reads away from lagging replicas",
                    "python",
                    lines(
                        "replicas = [",
                        "    {'name': 'replica-a', 'lag_ms': 45},",
                        "    {'name': 'replica-b', 'lag_ms': 380},",
                        "]",
                        "",
                        "def pick_read_target(require_fresh_within_ms):",
                        "    if require_fresh_within_ms == 0:",
                        "        return 'primary'",
                        "    eligible = [r['name'] for r in replicas if r['lag_ms'] <= require_fresh_within_ms]",
                        "    return eligible[0] if eligible else 'primary'",
                        "",
                        "print(pick_read_target(100))",
                        "print(pick_read_target(0))",
                    ),
                ),
            ),
            section(
                "Shard keys are product decisions with long half-lives",
                T(
                    "Sharding should follow the dominant ownership or locality dimension of the workload. User-owned data often shards well by user or tenant. Marketplace data may shard by merchant or region. Time-based keys can look attractive for recent-write workloads but frequently create hot partitions unless they are bucketed or combined with another spreading dimension. Once a shard key is embedded in routing, background jobs, and client caches, changing it becomes expensive.",
                    "The best designs therefore ask two uncomfortable questions early. First, will the key distribute both reads and writes under the worst product success case, not merely under today's average? Second, does the key keep the most important multi-record operations local enough to avoid constant scatter-gather queries or cross-shard transactions? If the answer to either question is weak, the team should reconsider the key before the system scales into a corner.",
                ),
                [
                    "Choose a shard key that spreads load and preserves locality for the most important workflow.",
                    "Model celebrity tenants, flash sales, and bursty regions explicitly instead of assuming even distribution.",
                    "Assume that re-sharding later is possible but costly, so invest in key choice early.",
                ],
                code(
                    "Bucket writes by tenant and hour to soften temporal hotspots",
                    "javascript",
                    lines(
                        "function shardForWrite({ tenantId, createdAtIso, shardCount }) {",
                        "  const hourBucket = createdAtIso.slice(0, 13); // YYYY-MM-DDTHH",
                        "  const spreadKey = `${tenantId}:${hourBucket}`;",
                        "  let hash = 0;",
                        "  for (const ch of spreadKey) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;",
                        "  return hash % shardCount;",
                        "}",
                        "",
                        "console.log(shardForWrite({",
                        "  tenantId: 'merchant-42',",
                        "  createdAtIso: '2026-07-26T14:00:00Z',",
                        "  shardCount: 16",
                        "}));",
                    ),
                ),
            ),
            section(
                "Consistency should be described as a user experience, not as a slogan",
                T(
                    "Terms like eventual consistency and strong consistency are too coarse to guide product decisions by themselves. A better explanation says what a specific user might see. For example, after changing a shipping address, the order-confirmation page must show the new value immediately, but a cross-region analytics panel can lag by thirty seconds. That description tells engineers where synchronous coordination is worth the price and where asynchronous propagation is acceptable.",
                    "This user-visible framing also clarifies mitigation patterns. If stale reads are tolerable, maybe the UI shows a last-updated timestamp or a pending state. If they are not tolerable, the API might read from primary until a session token proves followers have caught up. If cross-shard totals lag, perhaps the product treats them as approximate counters and labels them accordingly. Good HLD answers acknowledge that consistency is a product contract with UX consequences, not merely a storage setting.",
                ),
                [
                    "Translate consistency vocabulary into what a user sees immediately after a write.",
                    "Use explicit read-routing or pending-state patterns when follower lag would otherwise violate the user contract.",
                    "Mark approximate or delayed aggregates honestly instead of pretending every view is strongly fresh.",
                ],
                code(
                    "Schema support for read-after-write confirmation",
                    "sql",
                    lines(
                        "CREATE TABLE account_updates (",
                        "  update_id BIGSERIAL PRIMARY KEY,",
                        "  account_id BIGINT NOT NULL,",
                        "  committed_lsn BIGINT NOT NULL,",
                        "  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()",
                        ");",
                        "",
                        "-- The API can return committed_lsn with the write response.",
                        "-- A subsequent read can require follower replay >= committed_lsn,",
                        "-- otherwise the request is routed to the primary.",
                    ),
                ),
            ),
            section(
                "Failover and repair are often harder than steady-state serving",
                T(
                    "A design that looks elegant when every node is healthy can behave badly during promotion, catch-up, and repair. If a leader fails under heavy write load, survivors may be both serving traffic and replaying logs. If a hot shard is moved, caches churn and retry storms appear. If a replica is promoted while still behind, the system may meet an uptime target but lose user trust because the newest confirmed writes disappeared. These are not edge cases; they are the moments users remember.",
                    "That is why resilient teams design for degraded transitions, not just for normal topology. Promotion rules should include lag guardrails. Catch-up traffic may need throttling. Clients need a clear way to discover the new primary or new routing map. Operators need metrics for replica lag, shard skew, rebalance progress, and repair backlog. The best HLD answers therefore name repair behavior and incident safeguards, not merely replication diagrams.",
                ),
                [
                    "Guard failover with freshness thresholds so a stale follower is not promoted into user-visible data loss.",
                    "Throttle catch-up and rebalance work so repair traffic does not collapse the remaining healthy nodes.",
                    "Make routing-map and primary-discovery behavior explicit for both clients and operators.",
                ],
                code(
                    "Promotion guard based on follower lag",
                    "python",
                    lines(
                        "candidate = {'node': 'replica-b', 'lag_ms': 1200, 'healthy': True}",
                        "",
                        "def can_promote(replica, max_lag_ms=500):",
                        "    return replica['healthy'] and replica['lag_ms'] <= max_lag_ms",
                        "",
                        "print('promote=', can_promote(candidate))",
                    ),
                ),
            ),
            section(
                "Interview framing: tie topology choices back to business pain avoided",
                T(
                    "A strong interview answer here sounds like: this workflow writes to one primary because duplicate or conflicting writes are expensive; these reads can use followers because a short freshness window is acceptable; the table shards by merchant because write ownership and operational isolation follow merchants; and a hot merchant is handled with caching plus selective partition spreading. That sequence shows judgement rather than pattern memorization.",
                    "Always end by naming one trade-off you are deliberately accepting. Maybe follower reads are slightly stale. Maybe cross-shard reporting is asynchronous. Maybe failover takes an extra few seconds because promotion safety matters more than the fastest possible switch. Senior answers become credible when they show that the candidate can say both what the system does well and what cost the business is consciously paying for that behavior.",
                ),
                [
                    "Explain who owns writes, who can serve reads, and what freshness each user journey gets.",
                    "Defend the shard key with both throughput reasoning and workflow locality reasoning.",
                    "Say explicitly what trade-off the topology accepts in latency, freshness, or operational complexity.",
                ],
            ),
        ],
        checklist=[
            "Define which flows require immediate freshness, which require durability, and which can tolerate lag.",
            "Choose a replica topology and say exactly which requests are allowed to read from followers.",
            "Pick and justify a shard key using both load distribution and workflow locality.",
            "Describe at least one read-after-write or monotonic-read mitigation for sensitive flows.",
            "Explain failover guardrails, client discovery of the new primary, and catch-up behavior after promotion.",
            "Track shard skew, replica lag, retry amplification, and repair backlog as first-class operating signals.",
        ],
        pitfalls=[
            "Saying eventual consistency is fine without naming which user experience becomes stale and for how long.",
            "Choosing a shard key that mirrors traffic bursts and creates predictable hotspots.",
            "Promoting a lagging replica in the name of uptime while hiding effective data loss from the design discussion.",
            "Assuming follower reads are free even when product workflows need immediate confirmation of the latest write.",
            "Ignoring the operational cost of rebalancing, catch-up traffic, and cache churn during topology changes.",
        ],
        interview_prompts=[
            "When should a system force reads to the primary instead of to replicas?",
            "How would you choose a shard key for a multi-tenant commerce platform?",
            "What does eventual consistency mean in user-visible terms for an order-management product?",
            "Why can a failover that preserves uptime still feel like a correctness outage to customers?",
        ],
        likely_answer_points=[
            "Good topology design starts by classifying user journeys by freshness and durability needs instead of by assuming every read can use replicas.",
            "Leader-follower replication is often the simplest write-ownership model, but it requires an explicit read-after-write strategy for sensitive flows.",
            "A shard key should be judged by distribution under skew and by whether it keeps the most important multi-record operations local enough to avoid constant scatter-gather work.",
            "Operational maturity shows up in failover and repair: promotion lag thresholds, catch-up throttling, routing discovery, and metrics for skew and replica freshness.",
        ],
        exercises=[
            design_exercise(
                "inventory-topology-consistency-plan",
                "Design inventory serving with bounded staleness",
                "advanced",
                "Design the storage topology for a global inventory service where reservation writes must be authoritative, product-detail reads can lag slightly, and some merchants are dramatically hotter than others.",
                [
                    "Which requests must hit the primary or a fresh-enough follower, and why?",
                    "What shard key would you choose for inventory ownership and for merchant-facing dashboards?",
                    "How would you protect the system during leader failover if the hottest merchant shard is already under pressure?",
                    "What user-facing behavior would you expose when read freshness temporarily cannot be guaranteed?",
                ],
                [
                    "Separate reservation confirmation from general browse traffic.",
                    "Model a celebrity merchant or flash sale instead of only average load.",
                    "Be honest about what failover safety costs in latency or recovery time.",
                ],
            ),
            coding_exercise(
                "freshness-aware-read-router",
                "Implement a freshness-aware read router",
                "beginner",
                "Complete the Python function so stale-tolerant reads can use eligible replicas while fresh reads fall back to the primary.",
                lines(
                    "replicas = [",
                    "    {'name': 'r1', 'lag_ms': 25},",
                    "    {'name': 'r2', 'lag_ms': 240},",
                    "]",
                    "",
                    "def route_read(required_freshness_ms):",
                    "    # TODO: if required_freshness_ms is 0, return 'primary'.",
                    "    # TODO: otherwise choose the first replica whose lag is <= required_freshness_ms.",
                    "    # TODO: if none qualify, return 'primary'.",
                    "    pass",
                    "",
                    "print(route_read(100))  # expected r1",
                    "print(route_read(0))    # expected primary",
                ),
                lines(
                    "replicas = [",
                    "    {'name': 'r1', 'lag_ms': 25},",
                    "    {'name': 'r2', 'lag_ms': 240},",
                    "]",
                    "",
                    "def route_read(required_freshness_ms):",
                    "    if required_freshness_ms == 0:",
                    "        return 'primary'",
                    "    for replica in replicas:",
                    "        if replica['lag_ms'] <= required_freshness_ms:",
                    "            return replica['name']",
                    "    return 'primary'",
                    "",
                    "print(route_read(100))",
                    "print(route_read(0))",
                ),
                "The router should select r1 for a 100 ms freshness budget and primary for a strict read-after-write request.",
            ),
        ],
        related=[
            "replication-and-failover",
            "partitioning-and-sharding",
            "multi-region-disaster-recovery",
            "idempotency-retries-backpressure",
            "observability",
        ],
    )


def _polyglot_storage_selection():
    return lesson(
        slug="polyglot-storage-selection",
        title="Polyglot storage selection",
        summary="Choose a small, coherent portfolio of datastores where each engine has a clear authority boundary and access-pattern justification.",
        why_it_matters="Real systems rarely use one datastore for everything, but weak designs add engines casually and create synchronization debt. Strong HLD answers can explain why one system is authoritative, why another is derived, and how data moves safely between them.",
        sections=[
            section(
                "Start with the source of truth and the business invariant",
                T(
                    "Polyglot persistence works when every datastore has a specific job and a clear relationship to the business invariant. Orders, payments, and entitlement changes often want a strongly authoritative system with durable transactional guarantees. Search indexes, recommendation features, and cache entries are usually derived views whose job is speed, retrieval quality, or fan-out efficiency rather than first-write correctness.",
                    "The fastest way to make a multi-store design confusing is to let two systems believe they are both authoritative for the same domain fact. When that happens, every incident becomes a reconciliation argument. Good selection starts by naming which system owns the legal or product truth, which systems are read-optimized derivatives, what lag is acceptable between them, and how each consumer should behave when the derivative is behind or rebuilding.",
                ),
                [
                    "Pick the authoritative system by invariant, not by habit or benchmark headlines.",
                    "Treat caches, search indexes, and analytic stores as derivatives unless the design explicitly says otherwise.",
                    "Write down acceptable propagation lag between source-of-truth data and each derived system.",
                ],
            ),
            section(
                "Match engines to access patterns, not to labels",
                T(
                    "Relational stores remain strong defaults for multi-row invariants, constrained updates, and operational maturity. Document stores fit aggregates whose fields evolve frequently but are usually read and written as a unit. Search indexes fit ranked retrieval and text filtering. Object storage fits immutable large blobs. Key-value caches fit ephemeral hot reads. Each tool is attractive when the access path aligns with its strengths and dangerous when used to imitate another engine badly.",
                    "Strong interviews do not only say that NoSQL scales. They specify what scales and at what semantic cost. A document store may scale tenant metadata well but still struggle with cross-document transactions. A search engine makes relevance queries easy but is a poor legal source of truth. Object storage is cheap for media but terrible for row-level transactional updates. Selection quality comes from matching the engine to the workload and explicitly naming the edges where it should not be stretched.",
                ),
                [
                    "Choose engines by read/write shape, query flexibility, object size, and correctness needs.",
                    "Explain the semantic trade-off of every non-relational choice, not only the throughput benefit.",
                    "Keep the team's operating burden in view when adding a new storage technology.",
                ],
                code(
                    "Relational truth with object-storage pointers",
                    "sql",
                    lines(
                        "CREATE TABLE media_assets (",
                        "  asset_id UUID PRIMARY KEY,",
                        "  owner_id BIGINT NOT NULL,",
                        "  object_key TEXT NOT NULL,",
                        "  content_type TEXT NOT NULL,",
                        "  byte_size BIGINT NOT NULL,",
                        "  created_at TIMESTAMPTZ NOT NULL DEFAULT now()",
                        ");",
                        "",
                        "-- Metadata stays transactional.",
                        "-- Large immutable bytes live in object storage under object_key.",
                    ),
                ),
            ),
            section(
                "Derived stores need explicit movement, ownership, and replay rules",
                T(
                    "Adding a search index or analytics store is not just a provisioning action. It creates a data movement contract. The design must say how changes leave the source system, how they are transformed, how consumers replay missed events, and how operators rebuild the derivative after code or schema changes. Without those answers, every indexing lag spike or pipeline outage turns into manual patchwork and inconsistent customer state.",
                    "The outbox pattern is often the cleanest explanation because it ties source-of-truth writes and downstream publication together without pretending a distributed two-phase commit exists. From there, consumers can project records into search, cache warmers, or warehouses idempotently. This framing also keeps incident boundaries clear: if search is behind, the order table is still truth; if cache is cold, the relational read path still works; if analytics is delayed, revenue accounting is not corrupted.",
                ),
                [
                    "Describe exactly how changes leave the source system and become projections elsewhere.",
                    "Make rebuild and replay explicit operating capabilities for every derived store.",
                    "Use idempotent consumers so projection retries do not create duplicate or contradictory derived state.",
                ],
                code(
                    "Outbox-driven projection into search",
                    "javascript",
                    lines(
                        "async function publishOrderProjection(tx, order) {",
                        "  await tx.insert('orders', order);",
                        "  await tx.insert('outbox_events', {",
                        "    topic: 'order.updated',",
                        "    aggregate_id: order.order_id,",
                        "    payload: JSON.stringify({",
                        "      orderId: order.order_id,",
                        "      merchantId: order.merchant_id,",
                        "      searchableText: order.customer_name + ' ' + order.city",
                        "    })",
                        "  });",
                        "}",
                    ),
                ),
            ),
            section(
                "Minimize the portfolio because each datastore multiplies operations",
                T(
                    "A datastore is not only a benchmark profile. It is backups, IAM, dashboards, patching, failover drills, schema evolution, local development, and on-call muscle memory. The difference between two engines and five engines is not linear because every cross-store movement path adds another matrix of failure cases. Polyglot storage is a powerful strategy only when the number of systems stays intentionally small and each one carries obvious product value.",
                    "That is why senior engineers often ask whether an existing system can be stretched slightly before introducing a new one. Sometimes the answer is yes: a relational store plus a cache may handle the next phase. Sometimes the answer is no: full-text ranking or cheap blob storage genuinely needs a dedicated tool. The point is not to avoid specialization forever. It is to avoid premature specialization that outpaces the team's ability to operate, migrate, and debug the resulting portfolio.",
                ),
                [
                    "Count operational surface area as part of the storage decision, not as an afterthought.",
                    "Prefer one authoritative store plus a few clearly justified derivatives over a fragmented portfolio.",
                    "Introduce a new engine only when the current portfolio cannot meet an important workload or product need cleanly.",
                ],
            ),
            section(
                "Migrations between storage systems need overlap and observability",
                T(
                    "Once a system uses multiple stores, the next hard problem is changing one without breaking the others. Migrating search schemas, moving media metadata to a new relational shape, or retiring a document store requires overlap periods where old and new paths both exist. During that window, teams need counters for dual-write success, projection lag, backfill completeness, and correctness sampling between old and new query results.",
                    "This is where storage selection and change safety intersect. The cheaper engine is not cheaper if migration away from it later becomes practically impossible. Good selection therefore includes exit thinking: can we dual-write temporarily, replay history, validate parity, and cut traffic over by cohort? Designs that ignore exit cost often end up with a permanent shadow datastore that survives only because everyone is afraid to remove it.",
                ),
                [
                    "Include migration and exit cost when evaluating a new datastore, not only steady-state fit.",
                    "Use overlap windows, backfills, and parity checks when moving authority or read traffic between stores.",
                    "Track lag and correctness on the projection path so cutovers are evidence based.",
                ],
                code(
                    "Storage-choice scorecard",
                    "python",
                    lines(
                        "candidates = {",
                        "    'relational': {'correctness': 5, 'query_flex': 4, 'ops_cost': 3},",
                        "    'document': {'correctness': 3, 'query_flex': 3, 'ops_cost': 3},",
                        "    'search': {'correctness': 1, 'query_flex': 5, 'ops_cost': 4},",
                        "}",
                        "",
                        "def weighted_score(scores, weights):",
                        "    return sum(scores[k] * weights[k] for k in weights)",
                        "",
                        "weights = {'correctness': 0.5, 'query_flex': 0.3, 'ops_cost': -0.2}",
                        "for name, scores in candidates.items():",
                        "    print(name, round(weighted_score(scores, weights), 2))",
                    ),
                ),
            ),
            section(
                "Interview framing: explain the portfolio as a small map of authority and derivation",
                T(
                    "When answering a storage-selection question, do not list technologies first. Start with domains. For example: orders and payments live in a relational primary because money and inventory invariants matter; product media lives in object storage with relational metadata pointers; search is a derived index built from outbox events; Redis caches hot reads but is disposable. That narrative is easy to defend because each tool has one clear reason to exist.",
                    "Then show restraint. Mention what you are explicitly not adding yet and why. Maybe you are postponing a graph store because relationship depth is shallow. Maybe you are keeping analytics in batch exports until data freshness becomes a product feature. That kind of disciplined scope is exactly what turns polyglot persistence from a buzzword into a practical senior design answer.",
                ),
                [
                    "Describe the system as authority plus derivatives, not as a shopping list of databases.",
                    "Say what you are deliberately not introducing yet and why the current portfolio is enough.",
                    "Tie every chosen datastore back to one important workload or invariant.",
                ],
                code(
                    "Simple storage selector",
                    "python",
                    lines(
                        "def choose_storage(needs_transactions, needs_full_text, large_blobs):",
                        "    plan = []",
                        "    if needs_transactions:",
                        "        plan.append('relational-primary')",
                        "    if needs_full_text:",
                        "        plan.append('search-index-derived')",
                        "    if large_blobs:",
                        "        plan.append('object-storage')",
                        "    return plan",
                        "",
                        "print(choose_storage(True, True, True))",
                    ),
                ),
            ),
        ],
        checklist=[
            "Identify the authoritative store for each important business invariant.",
            "Choose derived systems only for clear read, retrieval, or cost benefits.",
            "Explain how data moves from the source of truth into caches, search, or analytics.",
            "Keep the datastore portfolio intentionally small and count operational burden as part of the trade-off.",
            "Plan replay, rebuild, and parity validation for every derived store.",
            "Include migration and eventual retirement cost in the selection conversation.",
        ],
        pitfalls=[
            "Using a search index or cache as if it were the legal source of truth for mutable business data.",
            "Adding a new datastore because it is fashionable rather than because an access pattern truly needs it.",
            "Ignoring the replay and rebuild story for derived systems until a projection outage happens in production.",
            "Letting two systems act authoritative for the same field set and then discovering conflicts during incidents.",
            "Underestimating the people cost of operating many engines with different failure modes and toolchains.",
        ],
        interview_prompts=[
            "How would you choose the storage mix for a marketplace with orders, search, media, and analytics?",
            "Why is object storage often the right place for large immutable assets even when metadata stays relational?",
            "What makes an outbox-based projection safer than direct dual writes into a primary database and search engine?",
            "How do you decide whether adding a new datastore is worth the operational complexity?",
        ],
        likely_answer_points=[
            "Choose the authoritative store by business invariant first, then add derived systems only where a clear workload advantage justifies them.",
            "Search, cache, and analytics systems should usually be described as projections with replay and rebuild paths rather than as peers to the transactional source of truth.",
            "A strong answer shows restraint: it names the minimum viable portfolio and explicitly says which specialized systems are being deferred for now.",
            "Migration and exit cost matter because the hardest storage decision is often not adoption but safe removal or replacement after the system evolves.",
        ],
        exercises=[
            design_exercise(
                "creator-platform-storage-portfolio",
                "Design a storage portfolio for a creator platform",
                "intermediate",
                "Design the storage mix for a creator platform with subscriptions, media uploads, creator search, payout history, and periodic analytics dashboards.",
                [
                    "Which domains need a strict source of truth and which can be projected asynchronously?",
                    "How would you move updates from the authoritative store into search and analytics systems?",
                    "Where would you draw the line between acceptable staleness and unacceptable divergence?",
                    "Which datastore would you deliberately avoid in the first version even if it looks attractive on paper?",
                ],
                [
                    "Name authority boundaries first.",
                    "Separate media bytes from transactional metadata.",
                    "Keep the operating portfolio smaller than the feature list suggests.",
                ],
            ),
            coding_exercise(
                "workload-based-storage-selector",
                "Implement a workload-based storage selector",
                "beginner",
                "Complete the Python function so it chooses a small portfolio based on invariants and access-pattern flags.",
                lines(
                    "def plan_storage(needs_transactions, needs_search, stores_large_blobs, needs_hot_cache):",
                    "    plan = []",
                    "    # TODO: append 'relational-primary' when transactions are needed.",
                    "    # TODO: append 'search-derived' when full-text search is needed.",
                    "    # TODO: append 'object-storage' when large blobs are needed.",
                    "    # TODO: append 'cache' when a hot cache is needed.",
                    "    return plan",
                    "",
                    "print(plan_storage(True, True, True, True))",
                ),
                lines(
                    "def plan_storage(needs_transactions, needs_search, stores_large_blobs, needs_hot_cache):",
                    "    plan = []",
                    "    if needs_transactions:",
                    "        plan.append('relational-primary')",
                    "    if needs_search:",
                    "        plan.append('search-derived')",
                    "    if stores_large_blobs:",
                    "        plan.append('object-storage')",
                    "    if needs_hot_cache:",
                    "        plan.append('cache')",
                    "    return plan",
                    "",
                    "print(plan_storage(True, True, True, True))",
                ),
                "The function should return ['relational-primary', 'search-derived', 'object-storage', 'cache'].",
            ),
        ],
        related=[
            "storage-selection",
            "nosql-landscape",
            "relational-data-modeling",
            "queues-and-streams",
            "caching-layers",
        ],
    )


def _auth_threat_modeling_for_hld():
    return lesson(
        slug="auth-threat-modeling-for-hld",
        title="Auth and threat modeling for HLD",
        summary="Model identities, trust boundaries, and abuse cases early enough that security controls shape the architecture instead of patching it afterward.",
        why_it_matters="Security depth in HLD is rarely about naming JWTs or OAuth alone. Strong answers show how identity, authorization, and threat thinking alter service boundaries, storage decisions, and operating controls across the critical path.",
        sections=[
            section(
                "Threat modeling starts by naming assets, actors, and trust boundaries",
                T(
                    "A useful HLD threat model is not a giant spreadsheet of hypothetical disasters. It is a map of who can act, what they are trying to access, and where trust changes across the system. External clients, partner systems, support agents, background workers, and platform operators usually need different identities and different guardrails. The moment you draw those roles on the architecture, you can ask more realistic questions about token scope, lateral movement, replay, and accidental privilege exposure.",
                    "This framing matters because many architecture bugs start as trust-boundary bugs rather than crypto bugs. A service that assumes every internal caller is safe, an admin tool that shares customer APIs without stronger controls, or a queue consumer that runs with global write access can all be catastrophic even if every hop uses TLS. Threat modeling at HLD level is about deciding where identity is established, where privilege narrows, and where audit trails must survive an incident.",
                ),
                [
                    "List human users, services, operators, and background jobs as separate actors with separate privileges.",
                    "Draw trust boundaries at the edge, admin surfaces, message queues, and cross-service hops.",
                    "Ask which assets would cause the most damage if read, modified, replayed, or deleted incorrectly.",
                ],
            ),
            section(
                "Authentication proves who is calling, authorization proves what they may do",
                T(
                    "Authentication and authorization are related but should not collapse into one vague box labeled auth. Authentication establishes a principal, perhaps via a session, short-lived access token, service certificate, or workload identity. Authorization then evaluates the action in context: which tenant, which resource, which role, which elevation path, which environment. Strong systems perform that second step close enough to business logic that product-specific policy is explicit rather than hidden in a gateway rule nobody can reason about.",
                    "Production trouble appears when architectures authenticate once and then over-trust the rest of the path. A valid identity token does not mean the caller can edit any record, cross any tenant boundary, or impersonate an admin workflow. Senior answers therefore discuss scoped tokens, tenant-aware permission checks, delegated service calls, and step-up mechanisms for privileged actions. The goal is to keep the permission decision observable and debuggable without pushing every domain rule into the edge tier.",
                ),
                [
                    "Authenticate identities with short-lived credentials or sessions that can be rotated and revoked sensibly.",
                    "Perform authorization with resource and tenant context instead of treating identity proof as blanket access.",
                    "Keep domain-specific permission logic visible in application services even if gateways enforce coarse edge policies.",
                ],
                code(
                    "Authorization check with tenant context",
                    "javascript",
                    lines(
                        "function canEditInvoice({ actor, invoice }) {",
                        "  if (actor.role === 'platform-admin') return actor.breakGlassTicketOpen === true;",
                        "  if (actor.tenantId !== invoice.tenantId) return false;",
                        "  return actor.scopes.includes('invoice:write');",
                        "}",
                        "",
                        "console.log(canEditInvoice({",
                        "  actor: { role: 'manager', tenantId: 't-1', scopes: ['invoice:write'] },",
                        "  invoice: { tenantId: 't-1', status: 'open' }",
                        "}));",
                    ),
                ),
            ),
            section(
                "Threat modeling should follow the highest-value workflow, not every endpoint equally",
                T(
                    "You get more value from a focused threat model of one privileged workflow than from superficial coverage of twenty endpoints. Pick the flow where money, secrets, or durable customer impact move. For example, login, password reset, payout approval, tenant invitation, and admin impersonation are all richer than a generic profile read. Walk the flow step by step and ask how spoofing, tampering, repudiation, information disclosure, denial of service, or privilege escalation could appear.",
                    "The HLD benefit of that exercise is architectural prioritization. Maybe the password-reset path needs one-time tokens and aggressive abuse limits. Maybe payout approval needs dual control, stronger auditing, and delayed execution. Maybe admin impersonation needs distinct break-glass credentials and immutable logs. Threat modeling at this level is useful because it changes the design in concrete ways instead of becoming compliance theater that leaves the critical workflow untouched.",
                ),
                [
                    "Run the threat model on a privileged, money-moving, or identity-mutating workflow first.",
                    "Use categories like spoofing, tampering, disclosure, and privilege escalation only if they lead to design changes.",
                    "Prefer a few concrete threats with mitigations over a long unprioritized list.",
                ],
                code(
                    "Simple risk score for privileged flows",
                    "python",
                    lines(
                        "flows = [",
                        "    {'name': 'password_reset', 'blast_radius': 4, 'abuse_likelihood': 5},",
                        "    {'name': 'profile_read', 'blast_radius': 1, 'abuse_likelihood': 2},",
                        "]",
                        "",
                        "for flow in flows:",
                        "    score = flow['blast_radius'] * flow['abuse_likelihood']",
                        "    print(flow['name'], score)",
                    ),
                ),
            ),
            section(
                "Abuse resistance belongs at the architecture level",
                T(
                    "Credential stuffing, replay, brute force, enumeration, and permission probing can all overwhelm a design long before a classic exploit appears. This is why login, password-reset, token-refresh, and admin endpoints often need different rate limits, telemetry, and challenge strategies than ordinary product APIs. If the design treats those endpoints like every other request, abuse traffic can become the dominant workload during an incident.",
                    "The deeper lesson is that security and reliability overlap. A replay-resistant write path also benefits correctness. Per-actor rate limiting protects both abuse surfaces and multi-tenant fairness. Audit events feed both incident response and product accountability. Strong HLD answers therefore mention idempotency keys, nonce or token expiration, rate limits by actor type, suspicious-activity alerts, and clear error semantics that do not leak sensitive state to attackers.",
                ),
                [
                    "Give identity and privilege-mutating endpoints stricter controls than generic reads.",
                    "Use rate limiting, expiration, and replay resistance together instead of depending on one control.",
                    "Instrument abuse signals so security incidents are visible before they become availability incidents.",
                ],
                code(
                    "Audit query for repeated failed logins",
                    "sql",
                    lines(
                        "SELECT actor_key, count(*) AS failures",
                        "FROM auth_audit_events",
                        "WHERE event_type = 'login_failed'",
                        "  AND occurred_at >= now() - interval '10 minutes'",
                        "GROUP BY actor_key",
                        "HAVING count(*) >= 5",
                        "ORDER BY failures DESC;",
                    ),
                ),
            ),
            section(
                "Tenant boundaries and operator privilege deserve explicit architecture",
                T(
                    "Many high-severity incidents are not caused by anonymous attackers. They are caused by the wrong tenant seeing the wrong data or by a support or operations tool acting with excessive default power. Multi-tenant systems should treat tenant identity as a first-class dimension in tokens, database filters, caches, and audit records. Operator tools should be designed as distinct privileged systems, not as quiet side doors into the customer plane.",
                    "This means thinking about blast radius the same way you think about shard keys or replication domains. A cache key missing tenant context can become a cross-tenant leak. A queue consumer with global write scope can mutate the wrong tenant during a bug. An admin impersonation flow without justification logging becomes impossible to investigate later. HLD security maturity comes from making those privilege boundaries visible in the design itself.",
                ),
                [
                    "Propagate tenant context through API, storage, cache, and audit layers.",
                    "Keep operator and support tooling on explicit privileged paths with stronger audit and approval controls.",
                    "Treat missing tenant scoping in caches and background jobs as architectural bugs, not implementation details.",
                ],
            ),
            section(
                "Interview framing: secure the happy path and the abuse path together",
                T(
                    "A senior answer on this topic sounds concrete: identity is established at the edge, privilege is re-checked in the application with tenant context, privileged workflows have stronger challenge and audit controls, and abuse-sensitive endpoints carry separate rate limits and telemetry. That sequence shows you understand security as part of request flow design rather than as a decorative edge service.",
                    "Close by naming one security trade-off. Maybe you accept slightly higher latency on admin actions because you require stronger checks. Maybe you keep authorization in the service instead of fully centralizing it because domain context matters. Maybe you choose short-lived tokens and more refresh traffic in exchange for better revocation and smaller blast radius. Those trade-offs make the answer credible because they acknowledge cost instead of claiming perfect security for free.",
                ),
                [
                    "Show where identity is established, where permissions narrow, and where high-risk actions get extra controls.",
                    "Explain how the architecture responds to misuse, not only to valid requests.",
                    "Name one real trade-off in latency, complexity, or operator friction that the security design intentionally accepts.",
                ],
            ),
        ],
        checklist=[
            "Identify the principal actors, assets, and trust boundaries for the system.",
            "Separate authentication from authorization and explain where each decision happens.",
            "Threat-model at least one privileged workflow such as login recovery, payout approval, or admin impersonation.",
            "Add replay resistance, rate limits, and audit trails to identity- and privilege-mutating endpoints.",
            "Carry tenant context through services, caches, jobs, and storage filters.",
            "Design operator and support tooling as explicit privileged paths with reviewable access.",
        ],
        pitfalls=[
            "Treating a valid token as if it automatically grants correct tenant and resource access.",
            "Assuming internal service traffic is trusted and therefore skipping service identity or scoped permissions.",
            "Threat-modeling everything lightly instead of modeling the highest-risk workflow deeply.",
            "Forgetting abuse economics such as credential stuffing, replay, and enumeration on auth endpoints.",
            "Letting admin or support surfaces share customer-plane privileges without stronger audit and approval controls.",
        ],
        interview_prompts=[
            "How would you explain the difference between authentication and authorization in a multi-tenant SaaS design?",
            "Which workflow would you threat-model first in a payout or payments system, and why?",
            "How do rate limiting and replay resistance fit into an auth architecture rather than living as afterthoughts?",
            "Why should support tools and break-glass admin flows be treated differently from ordinary product APIs?",
        ],
        likely_answer_points=[
            "Strong answers begin with actors, assets, and trust boundaries so the auth design serves an explicit threat model instead of a generic login box.",
            "Authentication proves identity, but authorization must still be evaluated with resource and tenant context near the business logic that understands the action.",
            "High-risk workflows like password reset, payout approval, or admin impersonation deserve deeper threat modeling and stronger controls than generic reads.",
            "Security maturity shows up in abuse controls, scoped privileges, tenant-safe caching and jobs, and immutable auditability for privileged actions.",
        ],
        exercises=[
            design_exercise(
                "b2b-admin-threat-model",
                "Threat-model a tenant admin console",
                "advanced",
                "Design the authn, authz, and threat controls for a B2B admin console where tenant admins manage invoices and support agents can view accounts under controlled escalation.",
                [
                    "Where is identity established, and how are tenant and role claims propagated downstream?",
                    "Which actions require step-up or break-glass controls, and which can use normal sessions?",
                    "What abuse cases matter most on login, password reset, invite acceptance, and impersonation flows?",
                    "How will you audit operator actions without turning the audit trail into an afterthought?",
                ],
                [
                    "Separate tenant admin actions from support or platform operator actions.",
                    "Pick one privileged workflow and model it step by step.",
                    "Use the threat model to change the architecture, not just the wording.",
                ],
            ),
            coding_exercise(
                "tenant-scope-permission-check",
                "Implement a tenant-aware permission check",
                "beginner",
                "Complete a JavaScript helper that denies cross-tenant writes and requires the invoice:write scope.",
                lines(
                    "function canWriteInvoice(actor, invoice) {",
                    "  // TODO: reject if actor.tenantId and invoice.tenantId differ.",
                    "  // TODO: allow only when actor.scopes contains 'invoice:write'.",
                    "}",
                    "",
                    "console.log(canWriteInvoice(",
                    "  { tenantId: 't-1', scopes: ['invoice:write'] },",
                    "  { tenantId: 't-1' }",
                    "));",
                ),
                lines(
                    "function canWriteInvoice(actor, invoice) {",
                    "  if (actor.tenantId !== invoice.tenantId) return false;",
                    "  return actor.scopes.includes('invoice:write');",
                    "}",
                    "",
                    "console.log(canWriteInvoice(",
                    "  { tenantId: 't-1', scopes: ['invoice:write'] },",
                    "  { tenantId: 't-1' }",
                    "));",
                ),
                "The helper should return true only when the actor belongs to the same tenant and holds the invoice:write scope.",
            ),
        ],
        related=[
            "security-basics",
            "api-design",
            "rate-limiting-and-edge-protection",
            "observability",
            "idempotency-retries-backpressure",
        ],
    )


def _encryption_secrets_and_tenancy():
    return lesson(
        slug="encryption-secrets-and-tenancy",
        title="Encryption, secrets, and tenancy",
        summary="Design key hierarchies, secret-distribution paths, and tenant-isolation boundaries that reduce blast radius without making operations impossible.",
        why_it_matters="Security answers become meaningfully more senior when they explain which data is encrypted, who can decrypt it, how keys rotate, and how tenant boundaries are enforced in both storage and tooling.",
        sections=[
            section(
                "Classify data before picking cryptography",
                T(
                    "Encryption strategy starts with data classification, not with naming AES or TLS. Credentials, payment tokens, government identifiers, audit trails, feature flags, and public catalog data all carry different confidentiality and integrity needs. Some values only need transport protection. Some need application-level field protection. Some need immutable retention and access logging. Good architecture identifies these classes so the most expensive controls are focused on the smallest set of truly sensitive assets.",
                    "This classification also drives operational choices. If a field is needed for filtering, encrypting it blindly at the application layer may destroy the access path and push engineers toward unsafe workarounds. If a secret is only used at deploy time, an ephemeral runtime fetch path may be unnecessary. If multi-tenant data carries different compliance obligations, key hierarchy and retention may differ by tenant tier. Mature HLD answers therefore tie cryptography to data usage, not just to fear.",
                ),
                [
                    "Group data by confidentiality, integrity, access-pattern, and retention needs before selecting controls.",
                    "Prefer the smallest strong-encryption surface that still protects the genuinely sensitive fields and objects.",
                    "Check how encryption interacts with indexing, filtering, and operational debugging before finalizing the design.",
                ],
            ),
            section(
                "Envelope encryption reduces blast radius while keeping keys manageable",
                T(
                    "A common production pattern is envelope encryption: a data encryption key protects the record or object, and a higher-level key in KMS or HSM protects that data key. This structure makes large-scale encryption practical because application code can encrypt many items without repeatedly handling the root key directly. It also improves blast radius because rotating or disabling a top-level key affects key unwrapping policy centrally while individual object keys remain scoped.",
                    "The architectural value is not just cryptographic hygiene. It is operational clarity. Teams can log which key version wrapped which object, phase rotations by cohort, and design access reviews around who may request decrypt capability instead of who knows a shared secret string. When interviewed, explain that the system should minimize plaintext exposure, keep master keys out of application code, and retain enough metadata to rotate or rewrap objects without guesswork.",
                ),
                [
                    "Use envelope encryption so application code works with scoped data keys instead of long-lived root secrets.",
                    "Store key version metadata with encrypted material so rotation and rewrap are traceable.",
                    "Separate permission to use a KMS key from permission to read the encrypted record itself.",
                ],
                code(
                    "Envelope-encryption metadata sketch",
                    "python",
                    lines(
                        "record = {",
                        "    'ciphertext_b64': '...redacted...',",
                        "    'wrapped_data_key_b64': '...redacted...',",
                        "    'kms_key_id': 'kms/customer-pii/v3',",
                        "    'algorithm': 'AES256-GCM',",
                        "}",
                        "",
                        "def can_rewrap(current_key_id, new_key_id):",
                        "    return current_key_id != new_key_id",
                        "",
                        "print(can_rewrap(record['kms_key_id'], 'kms/customer-pii/v4'))",
                    ),
                ),
            ),
            section(
                "Secret distribution should be short-lived, auditable, and environment aware",
                T(
                    "A secret path is an architecture path. Services need database credentials, third-party API tokens, signing keys, and sometimes tenant-specific integration secrets. The secure pattern is usually to fetch short-lived credentials from a managed secret source or workload identity mechanism at runtime, cache them briefly in memory, and rotate them without code redeploys. Hard-coded environment files, long-lived shared passwords, and ad hoc manual rotation make incident response slower and blast radius larger.",
                    "The operating detail that matters in HLD is renewal behavior. What happens when a secret rotates? Does the service watch for version change, reopen a connection, and recover gracefully? Can one compromised worker expose every tenant's connector token, or are those secrets partitioned by tenant or integration? Which audit event proves who accessed a secret and when? Strong answers connect secret distribution to service startup, rotation cadence, and incident containment.",
                ),
                [
                    "Prefer workload identities and short-lived credentials over static secrets stored on hosts or in source control.",
                    "Design service refresh behavior so rotation does not require emergency redeploys or prolonged downtime.",
                    "Partition sensitive integration secrets where possible so one compromise does not spill every tenant's credentials.",
                ],
                code(
                    "Secret refresh with explicit version checks",
                    "javascript",
                    lines(
                        "async function loadSigningKey(secretStore, cache) {",
                        "  const latest = await secretStore.get('jwt-signing-key');",
                        "  if (cache.version !== latest.version) {",
                        "    cache.material = latest.material;",
                        "    cache.version = latest.version;",
                        "  }",
                        "  return cache.material;",
                        "}",
                    ),
                ),
            ),
            section(
                "Tenant isolation must exist in storage, cache keys, and background jobs",
                T(
                    "Multi-tenancy is not safe if tenant isolation exists only in controller code. The architecture should carry tenant context through database filters, queue payloads, cache keys, search documents, and audit records. Storage-level protections such as schema-per-tenant, database-per-tenant, or row-level security all have trade-offs, but the key point is that the isolation boundary should be enforced in more than one layer so a single application bug does not silently become a cross-tenant exposure.",
                    "The right isolation depth depends on risk and operating model. Shared-table multi-tenancy can be efficient if row-level security, cache-key discipline, and job scoping are rigorous. Premium or regulated tenants may justify separate schemas, clusters, or even distinct keys. The senior answer is not that one model is always right; it is that blast radius, cost, and operator ergonomics must all be weighed and that background processing must respect the same tenant boundary as synchronous reads.",
                ),
                [
                    "Carry tenant context end to end: API, database, cache, queue, and audit layers.",
                    "Choose row-level, schema-level, or cluster-level isolation based on blast radius and operating constraints.",
                    "Treat missing tenant context in cache keys or worker payloads as a severe architecture flaw.",
                ],
                code(
                    "Row-level tenant guardrail",
                    "sql",
                    lines(
                        "ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;",
                        "",
                        "CREATE POLICY tenant_isolation ON invoices",
                        "USING (tenant_id = current_setting('app.tenant_id')::text);",
                        "",
                        "-- Every session serving tenant-scoped traffic must set app.tenant_id",
                        "-- before querying invoices.",
                    ),
                ),
            ),
            section(
                "Auditability and break-glass access are part of the design, not exceptions",
                T(
                    "Eventually someone needs temporary elevated access during an outage, fraud event, or legal hold. If the architecture has no explicit break-glass path, operators will invent one under pressure, usually with poor logging and excessive power. Safer systems define who can elevate, how approval works, how long elevation lasts, what extra logging is captured, and how follow-up review happens. That planning protects both the customer and the operator.",
                    "The same thinking applies to decrypted-data exposure. Reading ciphertext is one privilege; requesting decryption may be another; bulk export may require a third. Architectural separation of those actions makes abuse easier to detect and permission reviews easier to reason about. In interviews, this is a high-signal place to show that security is operational as well as cryptographic.",
                ),
                [
                    "Make elevated access explicit, time-bound, and heavily audited.",
                    "Separate data-read permission from decrypt permission and from bulk-export permission when the domain justifies it.",
                    "Review break-glass usage after the incident so the path remains exceptional instead of normal.",
                ],
            ),
            section(
                "Interview framing: explain how keys, secrets, and tenants shrink blast radius",
                T(
                    "A strong answer here sounds like an end-to-end control plane. Data classes are identified first, field or object protection is applied where it matters, envelope encryption keeps master keys out of services, runtime identities fetch short-lived secrets, and tenant context survives every storage and worker hop. That explanation is stronger than simply saying encrypted in transit and at rest because it shows who can actually read what under failure or compromise.",
                    "Close by naming a deliberate trade-off. Maybe shared-table multi-tenancy is acceptable because row-level controls and auditing are mature. Maybe per-tenant keys are reserved for premium or regulated tenants because universal per-tenant key management would overwhelm operations. Maybe decrypt paths are slightly slower because KMS calls are kept in the critical loop for high-value actions. Trade-offs make the design believable.",
                ),
                [
                    "Describe how the control reduces blast radius, not only how it satisfies a checklist item.",
                    "Carry tenant isolation through caches and jobs, not just through synchronous HTTP handlers.",
                    "State where you are choosing stronger separation and where you are accepting shared infrastructure for practical reasons.",
                ],
            ),
        ],
        checklist=[
            "Classify data by confidentiality, access pattern, and retention before selecting encryption controls.",
            "Use envelope encryption and retain key-version metadata for sensitive records or objects.",
            "Distribute secrets through short-lived identities or managed secret stores with rotation-aware refresh behavior.",
            "Propagate tenant context into database filters, cache keys, queue payloads, and audit records.",
            "Define break-glass access with approval, expiry, and enhanced auditing.",
            "Be explicit about where stronger tenant isolation or per-tenant keys are worth the extra operations cost.",
        ],
        pitfalls=[
            "Encrypting fields without considering how the application must query or index them later.",
            "Storing long-lived shared secrets on hosts or in configs that outlive the people who created them.",
            "Assuming application-layer tenant checks are enough while caches or workers remain unscoped.",
            "Treating break-glass access as a future process problem instead of as a design concern.",
            "Using one broad decrypt capability where read, decrypt, and bulk-export privileges should be separated.",
        ],
        interview_prompts=[
            "How would you explain envelope encryption in a system-design interview without disappearing into crypto minutiae?",
            "What makes a secret-rotation story operationally credible for a service fleet?",
            "When is shared-table multi-tenancy acceptable, and what controls make it safer?",
            "Why should break-glass or operator access be designed explicitly rather than handled ad hoc during incidents?",
        ],
        likely_answer_points=[
            "Start with data classes and blast radius, because the right encryption and key strategy depends on what data is sensitive and how it is used.",
            "Envelope encryption is valuable because it keeps root keys outside application code, supports rotation, and leaves metadata that operators can reason about later.",
            "Secret handling is part of system architecture: runtime identity, refresh behavior, partitioning of sensitive tokens, and auditability matter as much as storage.",
            "Tenant isolation must survive through storage, cache, and background systems; otherwise a single missing scope can become a cross-tenant incident.",
        ],
        exercises=[
            design_exercise(
                "tenant-pii-protection-plan",
                "Design tenant-safe PII protection",
                "advanced",
                "Design the encryption, secret, and tenant-isolation plan for a SaaS billing platform that stores invoices, payout bank details, uploaded contracts, and tenant-specific webhook secrets.",
                [
                    "Which data needs field or object-level encryption beyond basic transport and disk encryption?",
                    "How will the services fetch, refresh, and audit the secrets needed for signing, database access, and third-party integrations?",
                    "What tenant-isolation model will you choose for invoice and contract metadata, and how will caches and workers honor it?",
                    "Where would you accept shared controls, and where would you justify premium or regulated tenant separation?",
                ],
                [
                    "Separate metadata from large immutable objects.",
                    "Think about who can decrypt, not only whether something is encrypted.",
                    "Remember worker payloads and cache keys, not just database rows.",
                ],
            ),
            coding_exercise(
                "secret-version-refresh",
                "Implement a secret-version refresh helper",
                "beginner",
                "Complete the JavaScript helper so cached secret material updates only when the secret-store version changes.",
                lines(
                    "async function refreshSecret(secretStore, cache, name) {",
                    "  const latest = await secretStore.get(name);",
                    "  // TODO: if cache.version differs, replace cache.material and cache.version.",
                    "  // TODO: return cache.material.",
                    "}",
                ),
                lines(
                    "async function refreshSecret(secretStore, cache, name) {",
                    "  const latest = await secretStore.get(name);",
                    "  if (cache.version !== latest.version) {",
                    "    cache.material = latest.material;",
                    "    cache.version = latest.version;",
                    "  }",
                    "  return cache.material;",
                    "}",
                ),
                "The helper should keep using cached material until the secret version changes, then atomically refresh the in-memory value.",
            ),
        ],
        related=[
            "security-basics",
            "multi-region-disaster-recovery",
            "deployment-capacity-cost",
            "observability",
            "rate-limiting-and-edge-protection",
        ],
    )


def _safe_change_dr_and_degradation():
    return lesson(
        slug="safe-change-dr-and-degradation",
        title="Safe change, DR, and degradation",
        summary="Design rollout paths, recovery plans, and degraded modes so the system survives both intentional change and accidental failure.",
        why_it_matters="Many outages are self-inflicted or become worse because recovery and degradation were never modeled ahead of time. Strong HLD answers treat change safety and disaster readiness as core architecture, not process footnotes.",
        sections=[
            section(
                "Safe change is a first-class reliability feature",
                T(
                    "A system that works only when it never changes is not production ready. Every important architecture eventually faces new schemas, dependency swaps, re-partitioning, feature rollout, or policy changes. Safe change means the system is built so mixed versions can coexist temporarily, traffic can shift gradually, and rollback or fast disablement is possible before the blast radius grows. This is a design property, not only a deployment-tooling property.",
                    "That is why mature architectures prefer additive contracts, feature flags, compatibility windows, and idempotent migration steps. The safest change is one where old and new paths can overlap while telemetry proves whether the new path behaves correctly. If the design requires a one-shot cutover where data, code, and clients all switch in lockstep, the architecture is fragile even if the code looks clean.",
                ),
                [
                    "Design APIs, schemas, and workflows so old and new versions can overlap during rollout.",
                    "Favor additive, reversible steps over big-bang cutovers that couple data and code changes too tightly.",
                    "Treat fast disablement and rollback as explicit user-safety requirements.",
                ],
            ),
            section(
                "Progressive delivery lowers blast radius when paired with real signals",
                T(
                    "Canaries, dark launches, weighted routing, feature flags, and shadow reads are useful only when they are tied to signals that matter. A rollout that checks CPU but ignores domain correctness, tenant-specific errors, or write latency can still ship a bad change cleanly into production. Safe change therefore needs both traffic control and validation metrics. The architecture must expose which cohorts receive the new path and what evidence proves the system is still behaving correctly.",
                    "The most convincing designs define the cohort boundary intentionally. User ID, tenant, region, shard, or background-job partition can each be a rollout unit depending on blast radius. Rollout should move in stages with objective stop conditions. If replica lag rises, if reconciliation mismatches grow, if p95 doubles for one tenant tier, or if queue backlog spikes, the system should be able to freeze or roll back before the whole fleet absorbs the change.",
                ),
                [
                    "Roll out by a stable cohort such as tenant, region, or shard instead of by random request when correctness matters across a workflow.",
                    "Validate both technical and business signals during rollout, not only generic resource metrics.",
                    "Define stop conditions in advance so rollback decisions are not made from panic alone.",
                ],
                code(
                    "Cohort-based canary decision",
                    "javascript",
                    lines(
                        "function inCanary(tenantId, percent) {",
                        "  let hash = 0;",
                        "  for (const ch of tenantId) hash = (hash * 33 + ch.charCodeAt(0)) >>> 0;",
                        "  return (hash % 100) < percent;",
                        "}",
                        "",
                        "console.log(inCanary('tenant-42', 10));",
                    ),
                ),
            ),
            section(
                "Disaster recovery is a business promise expressed as RTO and RPO",
                T(
                    "Multi-region architecture, backups, and failover only make sense when tied to recovery time objective and recovery point objective. Some systems need regional failover in minutes with near-zero data loss. Others only need repeatable restore within a few hours. Without those business promises, teams overspend on unnecessary coordination or underspecify recovery until the first real outage reveals that restore time, not replication, is the actual bottleneck.",
                    "A high-quality HLD answer therefore says what survives a region loss, what data may be temporarily stale or unavailable, how traffic shifts, and how restores are rehearsed. Backups without restore drills are hope, not recovery. Active-passive without tested DNS or client failover is ceremony, not availability. Even active-active systems still need restore and rebuild stories because corruption, operator error, and security incidents do not respect the same boundaries as regional outages.",
                ),
                [
                    "Define RTO and RPO before selecting active-passive, active-active, or backup-and-restore strategies.",
                    "Treat restore rehearsal as part of architecture because untested backups do not constitute real resilience.",
                    "Remember that corruption and bad deploys can require recovery even when no region is down.",
                ],
                code(
                    "Migration marker for safe dual-read cutover",
                    "sql",
                    lines(
                        "CREATE TABLE migration_state (",
                        "  migration_name TEXT PRIMARY KEY,",
                        "  read_mode TEXT NOT NULL,",
                        "  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()",
                        ");",
                        "",
                        "INSERT INTO migration_state (migration_name, read_mode)",
                        "VALUES ('orders_v2_projection', 'shadow');",
                    ),
                ),
            ),
            section(
                "Graceful degradation keeps the core journey alive during partial failure",
                T(
                    "A system with no degraded mode usually discovers that everything is critical right when a dependency fails. Mature architectures rank features by user importance and business reversibility. Checkout confirmation, balance display, and authentication may be must-survive flows. Recommendations, badges, exports, and some admin insights often are not. When dependency health worsens, the system should shed or simplify the lower-value work first so the core path remains understandable and bounded.",
                    "This is where resilience and product design meet. A feed may tolerate slightly stale content. A dashboard may hide optional segments and show a freshness banner. A write path may become read-only rather than risk corrupting state. The best answers state these fallbacks concretely and pair them with control mechanisms such as feature flags, circuit breakers, bounded queues, or read-only switches. Saying it degrades gracefully is meaningless unless you can name the user experience.",
                ),
                [
                    "Rank features by criticality before the outage so shedding order is intentional.",
                    "Make degraded UX explicit, such as stale reads, hidden enrichments, or temporary read-only mode.",
                    "Control degraded states with mechanisms that operators can activate quickly and reverse safely.",
                ],
                code(
                    "Degradation policy selector",
                    "python",
                    lines(
                        "def choose_mode(primary_healthy, queue_lag_seconds, fraud_service_healthy):",
                        "    if not primary_healthy:",
                        "        return 'read-only'",
                        "    if queue_lag_seconds > 300 or not fraud_service_healthy:",
                        "        return 'core-checkout-no-enrichment'",
                        "    return 'normal'",
                        "",
                        "print(choose_mode(True, 420, False))",
                    ),
                ),
            ),
            section(
                "Runbooks, drills, and visibility determine whether the plan is real",
                T(
                    "A sophisticated design still fails badly if operators cannot tell what state it is in or which switch to pull next. Runbooks should connect detection, diagnosis, mitigation, and rollback. Drills should validate not just the system mechanics but also the human communication path: who approves failover, who watches correctness, who owns customer messaging, and how the team knows when it is safe to recover normal behavior. This is especially important for changes that touch multiple stores or external partners.",
                    "Visibility must also cover recovery itself. Lag to replica catch-up, percentage of backfill complete, dual-write mismatch rate, and fraction of traffic in degraded mode are as important during a recovery event as ordinary request latency. In HLD, mentioning these signals shows that you understand that the transition period is often the most dangerous part of the system's life cycle.",
                ),
                [
                    "Connect architecture controls to operator runbooks and approval paths.",
                    "Track transition metrics such as dual-write mismatch, failover lag, and degraded-mode activation rate.",
                    "Practice both technical failover and the human coordination needed to execute it safely.",
                ],
            ),
            section(
                "Interview framing: combine safe rollout, recovery promise, and user-facing fallback",
                T(
                    "A high-signal answer on this topic has three pieces. First, the change path is progressive and observable. Second, disaster recovery is defined by explicit RTO and RPO rather than by vague multi-region aspirations. Third, degraded modes are described in product terms so the system can still serve a coherent core experience under stress. When those three pieces connect, the design sounds like something a real team could operate.",
                    "End with one trade-off you are accepting. Maybe you keep failover slower to avoid promoting stale state. Maybe you accept stale recommendations so payments remain available. Maybe you limit rollout speed because tenant-by-tenant validation matters more than rapid exposure. Trade-offs are the sign that reliability work is grounded in business choices instead of slogans.",
                ),
                [
                    "State how you roll out, how you recover, and how the product degrades during partial failure.",
                    "Use explicit objectives and operator signals, not only general statements about resilience.",
                    "Name one conscious trade-off in rollout speed, failover speed, or feature availability.",
                ],
            ),
        ],
        checklist=[
            "Design APIs and schemas for overlap between old and new versions during rollout.",
            "Roll changes by stable cohorts and monitor both technical and business correctness signals.",
            "Define RTO and RPO before choosing replication or disaster-recovery topology.",
            "Describe at least one concrete degraded user experience for partial dependency failure.",
            "Connect failover, rollback, and migration states to runbooks and transition metrics.",
            "Exercise recovery and degraded modes in drills so they remain credible under pressure.",
        ],
        pitfalls=[
            "Treating deployment safety as a tooling concern while contracts and schemas remain incompatible across versions.",
            "Rolling out by random request when workflow correctness depends on stable cohorts or tenant context.",
            "Calling a system disaster-ready because backups exist even though restores are untested.",
            "Claiming graceful degradation without naming the exact user-visible fallback behavior.",
            "Ignoring transition metrics like dual-write mismatch, queue backlog, or degraded-mode activation during recovery.",
        ],
        interview_prompts=[
            "How would you make a risky data-model change safe in a live high-volume system?",
            "What is the difference between replication and a credible disaster-recovery plan?",
            "How would you decide what enters read-only or simplified mode during a dependency outage?",
            "Why are drills and runbooks part of architecture quality rather than mere process overhead?",
        ],
        likely_answer_points=[
            "Safe change requires compatibility windows, cohort-based rollout, and validation signals that prove both correctness and performance.",
            "Disaster recovery should be described with RTO and RPO so topology and backup choices map to business expectations rather than to intuition.",
            "Graceful degradation is strongest when it protects the must-survive user journey and explicitly sheds optional work first.",
            "Operational credibility comes from runbooks, drills, and transition metrics because the riskiest period is often the recovery or rollout itself.",
        ],
        exercises=[
            design_exercise(
                "checkout-degradation-and-dr-plan",
                "Design change safety and DR for checkout",
                "advanced",
                "Design the rollout, disaster-recovery, and degraded-mode plan for a checkout stack that depends on inventory, payment, and recommendation services.",
                [
                    "Which schemas or APIs need overlap periods to support progressive rollout safely?",
                    "What RTO and RPO would you target for order acceptance, payment status, and recommendation data?",
                    "Which parts of the user experience can degrade or be temporarily disabled during payment or recommendation dependency issues?",
                    "What metrics and runbook gates would determine whether the canary continues, pauses, or rolls back?",
                ],
                [
                    "Separate must-survive flows from nice-to-have enrichments.",
                    "Use explicit cohort boundaries for rollout.",
                    "Do not confuse replication with a tested restore path.",
                ],
            ),
            coding_exercise(
                "degradation-policy-helper",
                "Implement a degradation-mode helper",
                "beginner",
                "Complete the Python function so it chooses a user-facing operating mode from a few health signals.",
                lines(
                    "def choose_mode(primary_healthy, queue_lag_seconds, auth_healthy):",
                    "    # TODO: return 'read-only' when primary_healthy is False.",
                    "    # TODO: return 'core-only' when queue_lag_seconds > 300 or auth_healthy is False.",
                    "    # TODO: otherwise return 'normal'.",
                    "    pass",
                ),
                lines(
                    "def choose_mode(primary_healthy, queue_lag_seconds, auth_healthy):",
                    "    if not primary_healthy:",
                    "        return 'read-only'",
                    "    if queue_lag_seconds > 300 or not auth_healthy:",
                    "        return 'core-only'",
                    "    return 'normal'",
                ),
                "The helper should prefer read-only mode when the primary is unhealthy and core-only mode when dependencies are degraded but the source of truth remains writable.",
            ),
        ],
        related=[
            "multi-region-disaster-recovery",
            "fault-tolerance-and-graceful-degradation",
            "deployment-capacity-cost",
            "observability",
            "replication-and-failover",
        ],
    )


def _partitioning_and_hot_key_control():
    return lesson(
        slug="partitioning-and-hot-key-control",
        title="Partitioning and hot-key control",
        summary="Design partitioning schemes that scale under skew, keep hot objects survivable, and remain operable during rebalancing or rapid growth.",
        why_it_matters="Sharding discussions are common in HLD, but the differentiator is explaining what happens when traffic is uneven. Real systems fail on hot partitions, cache stampedes, and slow rebalances more often than on perfectly uniform textbook workloads.",
        sections=[
            section(
                "Partitioning strategy is a skew-management strategy",
                T(
                    "The core mistake in partitioning conversations is to optimize only for even average distribution. Real systems experience celebrity users, flash sales, tenant imbalance, and time-correlated bursts. A partitioning scheme should therefore be evaluated by how it behaves under skew, not just by how well it spreads synthetic uniform traffic. If one shard receives ten times the traffic of the others, the system design needs a plan for that shape before launch day reveals it.",
                    "This pushes the discussion beyond modulo math and into product semantics. Which entities can become extraordinarily hot? Which reads can be served from caches or replicas? Which writes must remain single-owner? Which fan-out operations can be deferred or rate limited? A good partitioning answer is really an answer about concentrated demand and how the architecture contains it without turning every request into global coordination.",
                ),
                [
                    "Model hot tenants, hot objects, and synchronized traffic bursts explicitly instead of assuming uniform keys.",
                    "Choose a strategy that explains what happens when one partition becomes dramatically hotter than the median.",
                    "Connect partitioning to caching, rate limiting, and fan-out control rather than treating it as a purely storage-local choice.",
                ],
            ),
            section(
                "Pick keys that preserve locality without locking the system into a corner",
                T(
                    "A good partition key usually follows ownership and access locality. User-centric workloads often partition by user or tenant so most reads and writes stay local. Some systems need compound keys that mix owner and bucket, such as tenant plus time bucket, to reduce temporal hotspots. The difficulty is that today's best key can become tomorrow's migration project if it aligns too strongly with a success case like one giant tenant or one bursty event pattern.",
                    "The safest designs retain some routing indirection. Virtual nodes, placement metadata, or directory services let the system move ownership later without changing the external key. That indirection is not free, but it is often worth the cost because partitioning is a long-lived contract. A senior answer explains both the initial key and the future rebalancing path rather than pretending the first choice will be perfect forever.",
                ),
                [
                    "Choose a key that keeps the dominant workflow local while still allowing future rebalancing via indirection.",
                    "Use compound or bucketed keys when pure time-based or pure tenant-based routing would create predictable hotspots.",
                    "Keep routing metadata highly available because partition indirection becomes part of the critical control plane.",
                ],
                code(
                    "Virtual-node assignment sketch",
                    "python",
                    lines(
                        "vnodes = {",
                        "    0: 'shard-a',",
                        "    1: 'shard-b',",
                        "    2: 'shard-c',",
                        "    3: 'shard-a',",
                        "}",
                        "",
                        "def vnode_for_hash(hash_value, vnode_count=4):",
                        "    return hash_value % vnode_count",
                        "",
                        "def shard_for_hash(hash_value):",
                        "    return vnodes[vnode_for_hash(hash_value)]",
                        "",
                        "print(shard_for_hash(17))",
                    ),
                ),
            ),
            section(
                "Hot keys need a toolbox, not one universal fix",
                T(
                    "A hot key can be handled in several ways depending on the workload. Read-heavy hot objects often benefit from multilayer caches, request coalescing, replica reads, or edge distribution. Write-heavy hot objects may need queued serialization, logical sub-key splitting, rate limits, or a product change that reduces contention on a single record. The point is to address the specific source of heat rather than applying generic sharding and hoping it spreads a fundamentally concentrated access pattern.",
                    "The right fix also depends on whether the hotspot is permanent or event-driven. A celebrity profile, breaking-news topic, or sale launch may need temporary fan-out protection and CDN or cache priming. A permanently hot tenant may need dedicated isolation or custom partition placement. Strong HLD answers therefore separate temporary burst handling from long-term ownership changes and call out what happens after the immediate fire is contained.",
                ),
                [
                    "Use different mitigations for read hotspots and write hotspots because their bottlenecks differ.",
                    "Distinguish bursty ephemeral hotspots from structurally hot tenants or objects.",
                    "Consider product-level changes, such as batching or delayed counters, when pure infrastructure fixes remain too expensive.",
                ],
                code(
                    "Request coalescing for a hot read key",
                    "javascript",
                    lines(
                        "const inflight = new Map();",
                        "",
                        "async function getHotProfile(userId, loader) {",
                        "  if (inflight.has(userId)) return inflight.get(userId);",
                        "  const promise = loader(userId).finally(() => inflight.delete(userId));",
                        "  inflight.set(userId, promise);",
                        "  return promise;",
                        "}",
                    ),
                ),
            ),
            section(
                "Rebalancing is an operational migration with cache and bandwidth side effects",
                T(
                    "Moving partitions is not only a metadata update. Data transfer consumes network and disk, caches cold-start on the destination, and clients or workers may temporarily route inconsistently if the control plane lags. A design that can spread load in theory may still fail in practice if rebalancing traffic competes with live traffic or if too many keys move at once. Virtual nodes help because they let operators shift smaller units, but they do not remove the need for staged movement and clear observability.",
                    "This is one of the best places to demonstrate production thinking in an interview. Mention how you would pace transfers, what metrics show rebalancing is safe, how you keep routing metadata fresh, and what rollback means if the destination shard saturates. If the answer stops at consistent hashing, it sounds academic. If it describes movement cost and control-plane behavior, it sounds operationally real.",
                ),
                [
                    "Move partitions in bounded chunks so rebalancing bandwidth does not starve live traffic.",
                    "Watch destination saturation, cache warm-up, and control-plane freshness during reassignment.",
                    "Retain a rollback or pause path if the target shard cannot absorb the moved hot set safely.",
                ],
                code(
                    "Detect skew from per-partition request counts",
                    "sql",
                    lines(
                        "SELECT partition_id,",
                        "       sum(request_count) AS requests,",
                        "       round(sum(request_count) * 100.0 / sum(sum(request_count)) OVER (), 2) AS pct_total",
                        "FROM partition_metrics_hourly",
                        "WHERE observed_hour = date_trunc('hour', now())",
                        "GROUP BY partition_id",
                        "ORDER BY requests DESC;",
                    ),
                ),
            ),
            section(
                "Skew metrics matter more than average fleet health",
                T(
                    "Average CPU across the fleet can look healthy while one partition is collapsing. Hot-key control therefore needs partition-level metrics: per-shard request rate, p95 latency by shard, cache hit ratio by key class, queue depth by logical owner, and top-N key concentration. Without those views, teams often misdiagnose a hotspot as a generic capacity issue and add more nodes that do not help the overloaded partition.",
                    "Skew visibility also improves product decisions. If one tenant repeatedly consumes a huge share of capacity, perhaps the business needs a dedicated tier or throttling contract. If one content type creates most write amplification, perhaps that feature needs batching or asynchronous counters. The point is that hotspot management is partly an observability and product-shaping problem, not only a routing algorithm problem.",
                ),
                [
                    "Measure top partitions and top keys directly because fleet averages hide skew.",
                    "Use skew metrics to drive both infrastructure actions and product-tier decisions.",
                    "Treat hotspot detection and mitigation as a permanent loop, not as a one-time design exercise.",
                ],
            ),
            section(
                "Interview framing: explain the key, the hotspot, and the containment plan",
                T(
                    "A strong answer here says more than shard by user. It says the system partitions by a stable ownership dimension, keeps routing indirection so rebalancing is possible, uses caches and request coalescing for read hotspots, isolates or rate-limits exceptional tenants, and monitors shard-level skew. That structure demonstrates that you understand both initial distribution and the production failure mode of uneven success.",
                    "Then say what you are not promising. Maybe cross-partition aggregates are asynchronous. Maybe one ultra-hot tenant eventually gets a dedicated partition or cluster. Maybe temporary flash-sale writes queue instead of staying purely synchronous. Those admissions make the answer practical because they acknowledge that hotspot control is often about bounding damage rather than eliminating skew completely.",
                ),
                [
                    "State the chosen key, the likely hotspot pattern, and the first mitigation you would apply.",
                    "Mention routing indirection and staged rebalancing rather than assuming keys never need to move.",
                    "Be explicit about where the design accepts asynchronous aggregation or tenant isolation to survive skew.",
                ],
            ),
        ],
        checklist=[
            "Choose a partition key by locality and skew tolerance, not only by average spread.",
            "Plan an indirection layer such as virtual nodes or routing metadata for future movement.",
            "Name distinct mitigations for read hotspots and write hotspots.",
            "Describe how rebalancing is staged, observed, and rolled back if needed.",
            "Track shard-level and key-level skew metrics rather than only fleet-wide averages.",
            "Connect hotspot handling to product or tenant policy when concentrated usage is persistent.",
        ],
        pitfalls=[
            "Assuming consistent hashing alone solves hot keys even when one object is fundamentally more popular than all others.",
            "Choosing a partition key that matches synchronized traffic bursts and creates built-in hotspots.",
            "Rebalancing too much data at once and making the recovery event worse than the original imbalance.",
            "Looking only at fleet-average CPU or QPS and missing that one partition is failing independently.",
            "Ignoring the possibility that product-tier or feature changes may be the cheapest hotspot mitigation.",
        ],
        interview_prompts=[
            "How would you keep one celebrity account from overwhelming a partitioned feed or profile system?",
            "Why is routing indirection useful even if the first partition key seems reasonable today?",
            "What is different about handling a hot read key versus a hot write key?",
            "Which metrics would tell you the partitioning strategy is starting to break under skew?",
        ],
        likely_answer_points=[
            "Partitioning should be judged under skew, because real systems fail from concentrated demand far more often than from perfectly even traffic.",
            "A strong key keeps dominant workflows local but still allows future movement through virtual nodes or routing metadata.",
            "Hot-key control requires a toolbox including caching, request coalescing, queued serialization, rate limits, and sometimes tenant isolation.",
            "Operational maturity shows up in staged rebalancing and skew-specific observability, not just in the choice of hashing algorithm.",
        ],
        exercises=[
            design_exercise(
                "flash-sale-hotspot-control",
                "Design hotspot control for a flash sale",
                "advanced",
                "Design a partitioning and mitigation plan for a flash-sale inventory system where a few SKUs become massively hotter than the rest of the catalog for fifteen minutes at a time.",
                [
                    "What partition key keeps most inventory operations local while still allowing exceptional hot products to be handled safely?",
                    "Which read-path and write-path mitigations would you apply during the hottest part of the event?",
                    "How would you detect when a product should move from shared treatment to dedicated isolation or queue-based serialization?",
                    "What rebalancing or rollback safeguards would you need if operators decide to move the hot partition during the event?",
                ],
                [
                    "Separate browse traffic from reservation writes.",
                    "Think about temporary burst mitigation versus permanent layout changes.",
                    "Use skew metrics, not only overall traffic, to justify the design.",
                ],
            ),
            coding_exercise(
                "hot-key-coalescer",
                "Implement a hot-key request coalescer",
                "beginner",
                "Complete the JavaScript helper so duplicate concurrent reads for the same key share one in-flight load.",
                lines(
                    "const inflight = new Map();",
                    "",
                    "async function loadOnce(key, loader) {",
                    "  // TODO: if inflight already has the key, return that promise.",
                    "  // TODO: otherwise call loader(), store the promise, delete it on finally, and return it.",
                    "}",
                ),
                lines(
                    "const inflight = new Map();",
                    "",
                    "async function loadOnce(key, loader) {",
                    "  if (inflight.has(key)) return inflight.get(key);",
                    "  const promise = loader().finally(() => inflight.delete(key));",
                    "  inflight.set(key, promise);",
                    "  return promise;",
                    "}",
                ),
                "Concurrent callers for the same hot key should await one shared promise instead of stampeding the origin independently.",
            ),
        ],
        related=[
            "consistent-hashing-and-hot-keys",
            "partitioning-and-sharding",
            "caching-layers",
            "service-discovery",
            "observability",
        ],
    )


def _consensus_quorums_and_leadership():
    return lesson(
        slug="consensus-quorums-and-leadership",
        title="Consensus, quorums, and leadership",
        summary="Use coordination only where the business truly needs a single write owner or shared control-plane truth, then explain the safety and latency costs clearly.",
        why_it_matters="This topic separates casual distributed-systems language from real system-design depth. Strong candidates can explain when leadership is necessary, what quorums buy, and why global coordination is expensive enough to keep off most hot paths.",
        sections=[
            section(
                "Coordination is expensive, so start by proving you need it",
                T(
                    "Consensus and leadership are not badges of sophistication. They are costs paid to maintain one truth about something that cannot safely diverge. Metadata ownership, primary election, schema control, lock coordination, and some critical write paths may justify that cost. Many other workflows do not. If an operation can be partitioned, retried idempotently, or expressed as an eventually reconciled workflow, forcing it through global consensus often turns a scalable problem into a slower and more fragile one.",
                    "This is the first high-signal distinction in interviews. Strong answers do not say we will use Raft because we need consistency. They say exactly which state requires a single current owner or quorum-backed agreement and which state remains local, cached, or asynchronous. That split is how real systems preserve both safety and throughput.",
                ),
                [
                    "Use coordination only for state that genuinely requires one current owner or globally agreed metadata.",
                    "Keep data-plane reads and writes off the consensus path unless the product truly needs that level of coordination.",
                    "Separate control-plane leadership from application-level business workflows wherever possible.",
                ],
            ),
            section(
                "Quorum math is useful only when tied to read and write behavior",
                T(
                    "Quorum language matters because it describes overlap between reads and writes across replicas, but the math alone is not the answer. A write quorum larger than half the replicas can ensure at least one overlapping node with a read quorum larger than half, yet practical systems still contend with message delay, hinted handoff, read repair, and client deadlines. If you name read and write quorums, you should also explain what a client may observe under lag or partial failure.",
                    "In production, quorum choices reflect a product trade-off. Larger quorums improve freshness confidence and durability but spend more latency budget and reduce tolerance for slow replicas. Smaller quorums preserve availability or speed but widen the stale-read window and increase repair work. Senior answers describe that trade-off in user terms rather than stopping at R plus W greater than N.",
                ),
                [
                    "Explain what the chosen quorum buys in observed freshness or durability, not only in algebra.",
                    "Remember that slow or unreachable replicas change the practical latency and availability of a quorum write.",
                    "Pair quorum discussion with repair and stale-read behavior so the answer remains user facing.",
                ],
                code(
                    "Check quorum overlap",
                    "python",
                    lines(
                        "def overlaps(replica_count, read_quorum, write_quorum):",
                        "    return read_quorum + write_quorum > replica_count",
                        "",
                        "print(overlaps(3, 2, 2))",
                        "print(overlaps(5, 2, 2))",
                    ),
                ),
            ),
            section(
                "Leadership is about fenced ownership, not only about choosing a winner",
                T(
                    "A leader is useful when one actor must serialize writes or assign work, but electing a leader is only half the problem. The more subtle requirement is preventing an old leader from acting after it should have lost authority. Leases, term numbers, fencing tokens, and epoch-based metadata all exist because partitions and slow networks can leave a previously healthy node alive long enough to do damage. Safe leadership therefore requires both election and stale-owner suppression.",
                    "This matters directly in HLD for metadata services, schedulers, partition coordinators, and payment or inventory sequencers. If the answer says leader election without mentioning leases or fencing, the split-brain story is incomplete. Mature designs explain how clients know which leader is current, how writes from older terms are rejected, and how long failover intentionally waits before trusting a new authority.",
                ),
                [
                    "Use terms, epochs, leases, or fencing tokens so previously valid leaders cannot continue mutating state safely after losing ownership.",
                    "Explain how clients discover the current leader and how stale writers are rejected.",
                    "Accept that failover speed and failover safety usually pull in opposite directions.",
                ],
                code(
                    "Leadership write with fencing token",
                    "javascript",
                    lines(
                        "function applyWrite(currentFence, requestFence, payload) {",
                        "  if (requestFence < currentFence) {",
                        "    throw new Error('stale leader');",
                        "  }",
                        "  return { nextFence: requestFence, payload };",
                        "}",
                        "",
                        "console.log(applyWrite(12, 13, { configVersion: 7 }));",
                    ),
                ),
            ),
            section(
                "Membership changes and failover drills are where theory meets operations",
                T(
                    "Real consensus-backed systems spend a surprising amount of engineering effort on changing membership safely, replacing failed nodes, and recovering performance after leadership movement. Adding or removing replicas affects quorum calculations, log catch-up, and availability margins. If you do not mention membership changes, the design sounds static in a way production clusters rarely are.",
                    "Leadership change also has customer-visible consequences. A brief pause for election may be acceptable for metadata updates but not for every end-user write. A cluster may stay correct but become slow while the new leader warms caches or catches followers up. The best HLD answers acknowledge that consensus systems are safer than ad hoc failover because they are disciplined, not because they are effortless.",
                ),
                [
                    "Mention how replicas join, catch up, and start participating in quorum decisions.",
                    "Expect leadership movement to affect latency temporarily even when correctness remains intact.",
                    "Treat drills and membership change procedures as part of the system design, not as undocumented cluster magic.",
                ],
                code(
                    "Lease-style leadership row",
                    "sql",
                    lines(
                        "CREATE TABLE leader_lease (",
                        "  resource_id TEXT PRIMARY KEY,",
                        "  term BIGINT NOT NULL,",
                        "  holder_id TEXT NOT NULL,",
                        "  lease_until TIMESTAMPTZ NOT NULL",
                        ");",
                        "",
                        "-- Writers must present a current term and refuse work once lease_until expires.",
                    ),
                ),
            ),
            section(
                "Client semantics matter as much as server consensus",
                T(
                    "Even a well-designed leader or quorum system can confuse clients if the client contract is vague. Where should the client send writes during election? Should retries be safe? Can a read observe stale metadata during leader movement? Does the API return a retryable redirect, a fenced error, or a temporary unavailable response? These questions belong in HLD because they determine whether coordination complexity leaks as random client pain.",
                    "Senior answers often distinguish leader-aware internal clients from simpler external clients. Internal systems might follow redirects or refresh metadata on stale-term errors. External clients may just receive retriable 503s behind a stable endpoint while the gateway or coordinator hides the leader transition. The important part is that leadership changes are reflected in a coherent caller contract rather than left to luck.",
                ),
                [
                    "Design the caller contract for elections and stale-leader responses deliberately.",
                    "Keep retries idempotent so temporary coordination events do not duplicate mutations.",
                    "Hide coordination churn behind stable endpoints when external clients do not need direct topology knowledge.",
                ],
            ),
            section(
                "Interview framing: isolate coordination and say what it costs",
                T(
                    "A convincing interview answer says something like: consensus is used only for partition metadata and primary ownership, normal reads stay partition-local, writes that require a single owner go through the leader, and fencing tokens prevent stale leaders from mutating state after failover. That explanation shows that you are using coordination surgically rather than smearing it across the entire architecture.",
                    "Then state the cost openly. Maybe leader failover adds a short pause. Maybe quorum writes cost more latency across zones. Maybe some reads accept eventual repair instead of global coordination. Senior answers become trustworthy when they make those costs explicit instead of pretending coordination is both free and everywhere.",
                ),
                [
                    "Isolate consensus to the smallest state surface that truly needs it.",
                    "Explain how terms or fencing prevent stale ownership after failover.",
                    "Name the latency or availability cost of the coordination choice in practical terms.",
                ],
            ),
        ],
        checklist=[
            "Prove which state actually needs coordination before introducing leaders or consensus.",
            "Explain quorum behavior in terms of observed read freshness, durability, and latency trade-offs.",
            "Use leases, terms, or fencing tokens to suppress stale leaders after failover.",
            "Describe membership changes, catch-up, and election effects on latency or availability.",
            "Define client behavior during elections, redirects, and stale-leader errors.",
            "Keep most traffic off the coordination path if the domain allows partitioned or asynchronous handling.",
        ],
        pitfalls=[
            "Using consensus vocabulary as a proxy for correctness without identifying the exact state that needs it.",
            "Stopping at quorum algebra without describing stale reads, repair, or latency cost.",
            "Ignoring stale-leader suppression and therefore leaving the split-brain story unfinished.",
            "Assuming membership changes and leader movement are invisible operationally.",
            "Letting coordination semantics leak as undefined client behavior during failover or retry.",
        ],
        interview_prompts=[
            "When do you actually need a leader in a distributed system instead of partition-local autonomy?",
            "What does read quorum plus write quorum buy, and what does it still not guarantee automatically?",
            "Why are fencing tokens or epochs important after leader election?",
            "How would you explain leader failover behavior to an API client or another internal service?",
        ],
        likely_answer_points=[
            "Coordination should be used only where there must be one current owner or shared metadata truth, because global consensus is expensive.",
            "Quorums trade latency and partial-failure tolerance for better overlap between reads and writes, but they still require a stale-read and repair story.",
            "Leadership is safe only when stale owners are fenced off with terms, leases, or tokens, not merely when a new leader is elected.",
            "Operational credibility comes from membership-change handling, election behavior, and clear client semantics during ownership transitions.",
        ],
        exercises=[
            design_exercise(
                "partition-metadata-coordination",
                "Design coordination for partition metadata",
                "advanced",
                "Design the control plane for a partitioned data service where partition ownership must move safely during failures and scaling events, but ordinary reads should remain fast.",
                [
                    "Which metadata or ownership state truly requires consensus, and which request paths can stay outside it?",
                    "How will clients discover the current partition owner and react to stale-owner errors?",
                    "What membership-change and catch-up steps are required before a new node can serve quorum traffic?",
                    "Where would you accept extra latency for safety, and where would you avoid coordination entirely?",
                ],
                [
                    "Separate control-plane metadata from normal data-plane reads.",
                    "Include stale-leader suppression, not only election.",
                    "Explain the caller contract during ownership changes.",
                ],
            ),
            coding_exercise(
                "quorum-overlap-checker",
                "Implement a quorum overlap checker",
                "beginner",
                "Complete the Python helper so it returns whether read and write quorums overlap for a given replica count.",
                lines(
                    "def overlaps(replica_count, read_quorum, write_quorum):",
                    "    # TODO: return True when read_quorum + write_quorum > replica_count.",
                    "    pass",
                    "",
                    "print(overlaps(3, 2, 2))  # expected True",
                    "print(overlaps(5, 2, 2))  # expected False",
                ),
                lines(
                    "def overlaps(replica_count, read_quorum, write_quorum):",
                    "    return read_quorum + write_quorum > replica_count",
                    "",
                    "print(overlaps(3, 2, 2))",
                    "print(overlaps(5, 2, 2))",
                ),
                "The helper should return True for 3 replicas with R=2 and W=2, and False for 5 replicas with R=2 and W=2.",
            ),
        ],
        related=[
            "consensus-quorums-and-leader-election",
            "replication-and-failover",
            "service-discovery",
            "multi-region-disaster-recovery",
            "observability",
        ],
    )


def _sagas_idempotency_and_workflows():
    return lesson(
        slug="sagas-idempotency-and-workflows",
        title="Sagas, idempotency, and workflows",
        summary="Preserve business intent across multiple services by combining local atomicity, durable workflow state, and retry-safe command handling.",
        why_it_matters="This is where many microservice diagrams collapse under follow-up questions. Good HLD answers must explain what happens when a workflow fails halfway through, how retries avoid duplicate side effects, and how operators recover stuck or inconsistent work.",
        sections=[
            section(
                "Think in business intent, not imaginary global transactions",
                T(
                    "Once a workflow crosses service boundaries, pretending there is one effortless ACID transaction usually hides more than it helps. Payment authorization, inventory reservation, shipment creation, email, and ledger updates may each have local transactional boundaries, but the user still expects one coherent business outcome. HLD maturity comes from modeling that business intent explicitly instead of assuming a coordinator can make all side effects behave like a single database commit.",
                    "This is why sagas and workflow engines exist. They accept that distributed work may complete in stages, may need retries, and may require compensating action or operator review rather than instant all-or-nothing rollback. The goal is not to abandon correctness. It is to preserve intent honestly using local atomicity plus durable workflow state rather than relying on fantasy infrastructure.",
                ),
                [
                    "Define the business outcome that must be preserved even when sub-steps succeed or fail at different times.",
                    "Use local transactions where they are real and explicit workflow state where global atomicity is unavailable.",
                    "Prefer honest staged completion to hand-waving about cross-service ACID semantics.",
                ],
            ),
            section(
                "Sagas choose between orchestration and choreography, each with real costs",
                T(
                    "Orchestration centralizes workflow state and step order, which improves visibility and operational recovery at the cost of a stronger coordinator dependency. Choreography distributes responsibility through events, which can reduce direct coupling but often hides the business process across many consumers. Neither model is free. The right choice depends on how many steps exist, how important step ordering is, and how much centralized visibility operators need when something gets stuck.",
                    "In interviews, it is not enough to say use a saga. Explain whether the workflow is best treated as a centrally visible state machine or as a small number of event-driven local reactions. If payment failure must trigger inventory release and customer messaging predictably, orchestration may be clearer. If a loose set of subscribers enriches a profile asynchronously, choreography may be acceptable. The signal comes from matching the coordination model to the business recovery needs.",
                ),
                [
                    "Choose orchestration when visibility, ordering, and operator intervention matter more than full decoupling.",
                    "Choose choreography cautiously for simpler fan-out or enrichment flows where hidden coupling is manageable.",
                    "Persist workflow state somewhere authoritative so retries and operators observe the same truth.",
                ],
                code(
                    "Workflow step state sketch",
                    "python",
                    lines(
                        "workflow = {",
                        "    'order_id': 'ord-1',",
                        "    'steps': {",
                        "        'reserve_inventory': 'done',",
                        "        'charge_payment': 'retrying',",
                        "        'send_email': 'pending',",
                        "    }",
                        "}",
                        "print(workflow)",
                    ),
                ),
            ),
            section(
                "Outbox, inbox, and idempotency close the retry loop safely",
                T(
                    "Retries are inevitable in distributed systems, but retries only help if duplicate work is harmless or detectable. Stable idempotency keys on externally visible commands, outbox tables on the producer side, and inbox or deduplication state on the consumer side are what turn at-least-once delivery into business-safe behavior. Without those layers, a network timeout can become double charging, duplicate reservations, or conflicting downstream projections.",
                    "The key insight is that exactly-once is usually a composition of durable write ordering plus idempotent handling, not a magic transport guarantee. A workflow step should know whether it has already applied a command, what result should be returned on replay, and how long deduplication state must be retained. Senior answers make that logic explicit instead of claiming a queue or workflow engine solved duplication automatically.",
                ),
                [
                    "Require stable command identifiers on money-moving or externally retryable operations.",
                    "Use outbox and inbox or another durable dedupe pattern so transport retries do not become business duplicates.",
                    "Store enough result state that a replay can return the original outcome instead of re-executing blindly.",
                ],
                code(
                    "Outbox and inbox tables for idempotent projection",
                    "sql",
                    lines(
                        "CREATE TABLE outbox_events (",
                        "  event_id UUID PRIMARY KEY,",
                        "  topic TEXT NOT NULL,",
                        "  aggregate_id TEXT NOT NULL,",
                        "  payload JSONB NOT NULL,",
                        "  published_at TIMESTAMPTZ",
                        ");",
                        "",
                        "CREATE TABLE inbox_dedup (",
                        "  consumer_name TEXT NOT NULL,",
                        "  event_id UUID NOT NULL,",
                        "  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),",
                        "  PRIMARY KEY (consumer_name, event_id)",
                        ");",
                    ),
                ),
            ),
            section(
                "Compensation is a business decision, not just technical undo",
                T(
                    "Compensating actions are often described too casually. Reversing a reservation, refunding a payment, voiding an authorization, and sending an apology email are not all the same kind of compensation. Some are true reversals. Some are new business actions with customer and accounting implications. The architecture should therefore distinguish reversible local actions from irreversible side effects and design operator visibility for the latter.",
                    "This is where workflow design becomes domain-specific. If shipment creation is not easily reversible after handoff, maybe the workflow delays that step until payment certainty rises. If notification can fire twice, maybe the product tolerates one duplicate or uses dedupe tokens in the mailer. Good HLD answers show that compensations are planned around real business semantics, not as a magical undo button attached to every step.",
                ),
                [
                    "Differentiate truly reversible steps from steps that require a new corrective business action.",
                    "Delay or isolate irreversible side effects when the workflow still carries uncertainty.",
                    "Expose compensation state to operators because manual review is sometimes the correct recovery path.",
                ],
                code(
                    "Idempotent command handling sketch",
                    "javascript",
                    lines(
                        "async function applyCommand(store, key, handler) {",
                        "  const prior = await store.get(key);",
                        "  if (prior) return prior.result;",
                        "  const result = await handler();",
                        "  await store.put(key, { result });",
                        "  return result;",
                        "}",
                    ),
                ),
            ),
            section(
                "Workflow operations need reconciliation and stuck-state recovery",
                T(
                    "Even well-designed workflows need audits that compare expected state to observed state. A workflow may be marked complete even though one projection lagged. A payment provider may succeed after the caller timed out. A compensation may fail while the user already saw the failure banner. Reconciliation jobs and operator dashboards are therefore part of the architecture because they close the gap between ideal event flow and messy real-world timing.",
                    "A strong design names who notices and who repairs stuck workflows. Operators may need a queue of workflows awaiting manual decision, a re-drive button for transient failures, or a report of steps whose wall-clock time exceeds policy. Without that visibility, the only workflow monitoring is user complaints. In HLD, mentioning reconciliation and stuck-state tooling is a strong sign that you understand distributed workflows as long-lived operational systems, not just code paths.",
                ),
                [
                    "Run reconciliation jobs that compare source-of-truth state with expected downstream workflow effects.",
                    "Expose stuck, retrying, and compensating workflows to operators with actionable controls.",
                    "Measure workflow age, retry count, and compensation rate as first-class signals.",
                ],
                code(
                    "Workflow state reducer",
                    "python",
                    lines(
                        "def next_workflow_state(step_results):",
                        "    if any(state == 'failed' for state in step_results.values()):",
                        "        return 'needs_compensation'",
                        "    if all(state == 'done' for state in step_results.values()):",
                        "        return 'completed'",
                        "    return 'in_progress'",
                        "",
                        "print(next_workflow_state({'reserve': 'done', 'charge': 'failed'}))",
                    ),
                ),
            ),
            section(
                "Interview framing: show local atomicity, workflow truth, and replay safety",
                T(
                    "A strong answer on this topic sounds structured. Each service keeps its own local transaction. A durable workflow record captures step state. Commands carry idempotency keys. Outbox and inbox patterns bridge local writes to asynchronous delivery. Compensations are defined in business terms, and operators can see and repair stuck workflows. That chain of reasoning is what makes a microservice design credible under failure.",
                    "Close by naming what the system explicitly does not promise. Maybe user-visible completion is asynchronous after acceptance. Maybe some downstream enrichments can be missing temporarily. Maybe compensation is eventual rather than instantaneous. Those constraints are not weaknesses if they are aligned with the business contract. They are what keep distributed workflows honest.",
                ),
                [
                    "Map each step to a local transaction boundary and to a durable workflow state transition.",
                    "Explain how retries, duplicates, and operator recovery work before claiming the workflow is reliable.",
                    "State the eventuality or compensation window the product is explicitly accepting.",
                ],
            ),
        ],
        checklist=[
            "Define the workflow's business intent and the local transaction boundary of each step.",
            "Choose orchestration or choreography deliberately and explain the operational trade-off.",
            "Use idempotency keys plus outbox and inbox-style dedupe where retries cross service boundaries.",
            "Classify which side effects are reversible, compensatable, or irreversible.",
            "Provide reconciliation and operator tooling for stuck or mismatched workflows.",
            "Be explicit about eventual completion semantics and what the user sees during intermediate states.",
        ],
        pitfalls=[
            "Claiming eventual consistency without explaining how partial failure is observed and repaired.",
            "Treating queue delivery guarantees as if they eliminate the need for idempotent handlers.",
            "Assuming every step has a clean technical undo when business semantics are messier.",
            "Ignoring operator visibility until the first workflow gets stuck between providers.",
            "Designing choreography so broadly that no one can explain the full business process anymore.",
        ],
        interview_prompts=[
            "How would you design order placement across inventory, payment, and notification services?",
            "When is orchestration clearer than choreography for a distributed workflow?",
            "What makes an API or command truly idempotent from a caller's point of view?",
            "Why do reconciliation jobs matter even after you add a workflow engine and durable events?",
        ],
        likely_answer_points=[
            "Distributed workflows should preserve business intent through local atomicity plus durable workflow state instead of pretending global ACID exists everywhere.",
            "Idempotency is a system property built from stable command keys, durable dedupe state, and replaying the original result safely.",
            "Compensation is domain specific: some steps reverse cleanly, while others require explicit corrective actions and operator review.",
            "Operational maturity comes from reconciliation, stuck-workflow dashboards, and clear eventual-completion semantics for the user.",
        ],
        exercises=[
            design_exercise(
                "checkout-saga-design",
                "Design a checkout saga",
                "advanced",
                "Design a distributed checkout workflow spanning cart validation, inventory reservation, payment authorization, shipment creation, and customer notification.",
                [
                    "Which steps should be synchronous before the API returns accepted, and which should continue asynchronously?",
                    "Would you use orchestration or choreography, and how would operators inspect progress or intervene?",
                    "How will you make retries safe across payment, inventory, and notification calls?",
                    "Which compensations are true reversals and which are separate corrective business actions?",
                ],
                [
                    "Distinguish user acceptance from eventual completion.",
                    "Make the payment retry and notification duplication story explicit.",
                    "Plan operator visibility, not only machine automation.",
                ],
            ),
            coding_exercise(
                "idempotent-command-wrapper",
                "Implement an idempotent command wrapper",
                "beginner",
                "Complete the JavaScript helper so duplicate command keys return the prior result instead of re-running the handler.",
                lines(
                    "async function applyCommand(store, key, handler) {",
                    "  const prior = await store.get(key);",
                    "  // TODO: if prior exists, return prior.result.",
                    "  // TODO: otherwise run handler(), persist { result }, and return it.",
                    "}",
                ),
                lines(
                    "async function applyCommand(store, key, handler) {",
                    "  const prior = await store.get(key);",
                    "  if (prior) return prior.result;",
                    "  const result = await handler();",
                    "  await store.put(key, { result });",
                    "  return result;",
                    "}",
                ),
                "The wrapper should collapse duplicate retries onto the previously stored result for the same command key.",
            ),
        ],
        related=[
            "distributed-transactions-and-sagas",
            "idempotency-retries-backpressure",
            "queues-and-streams",
            "api-design",
            "observability",
        ],
    )


def _build_modules():
    data_storage = module(
        "data-storage-lab",
        "Data storage lab",
        "Go beyond basic storage primers by connecting schema, indexing, replication, and engine choice to real production query paths and failure behavior.",
        [
            "Design storage from the query and mutation paths users actually exercise",
            "Explain how replicas, shards, and consistency affect customer-visible behavior",
            "Choose a small portfolio of datastores with clear authority and projection boundaries",
        ],
        [
            _indexing_and_query_path_design(),
            _replication_sharding_and_consistency(),
            _polyglot_storage_selection(),
        ],
    )

    security_ops = module(
        "security-operations-lab",
        "Security and operations lab",
        "Treat identity, key management, rollout safety, and recovery as architecture concerns that shape the request path and the operating model.",
        [
            "Model identities, privileges, and abuse cases at the same level of detail as latency and storage",
            "Choose encryption, secret-distribution, and tenancy controls that reduce blast radius practically",
            "Design safe rollout, disaster-recovery, and graceful-degradation paths before incidents force them",
        ],
        [
            _auth_threat_modeling_for_hld(),
            _encryption_secrets_and_tenancy(),
            _safe_change_dr_and_degradation(),
        ],
    )

    distributed = module(
        "distributed-systems-lab",
        "Distributed systems lab",
        "Practice the harder coordination topics that often distinguish a solid system-design answer from a genuinely senior one.",
        [
            "Partition systems in ways that survive skew and operational rebalancing",
            "Use coordination, leadership, and quorum language precisely rather than decoratively",
            "Preserve workflow correctness under retries, partial failure, and long-running recovery",
        ],
        [
            _partitioning_and_hot_key_control(),
            _consensus_quorums_and_leadership(),
            _sagas_idempotency_and_workflows(),
        ],
    )

    return [data_storage, security_ops, distributed]


def _build_interactive():
    return {
        "data-storage-lab/indexing-and-query-path-design": interactive_lesson(
            "Indexing and query path design lab",
            "Inspect a hot endpoint, constrain its query shape, and decide which indexes deserve long-term write cost.",
            [
                "Hot-path indexing begins with exact predicates and sort order, not with abstract tables.",
                "Every secondary index is a permanent write and recovery tax that must buy a measurable win.",
                "API-level query guardrails are often as important as the index itself.",
            ],
            [
                example(
                    "merchant-orders",
                    "Merchant dashboard",
                    "Protect the recent-orders view from scan creep",
                    "A merchant dashboard shows the latest paid or refunded orders for one merchant and wants flexible sorting later.",
                    "Design one primary composite index for the merchant, status, and created_at path, then reject unsupported sorts on the synchronous endpoint.",
                    [
                        "The user journey is narrow and high frequency, so a focused composite index buys predictable latency.",
                        "Allowing arbitrary sorts would require many indexes or force wide scans under pressure.",
                        "CSV export can satisfy exploratory needs without corrupting the hot serving path.",
                    ],
                    "Building a generic filter-and-sort endpoint seems flexible but quietly converts the dashboard into an ad hoc reporting system.",
                    "The team keeps p95 stable for the main screen and still serves unusual requests through slower controlled paths.",
                ),
                example(
                    "pending-jobs",
                    "Worker dispatch",
                    "Use a partial index where state matters more than table size",
                    "A dispatcher only needs pending jobs whose run_after is due, but the jobs table stores completed history for months.",
                    "Create a partial index on pending rows instead of indexing the full historical table for one narrow queue-read path.",
                    [
                        "Most completed rows are irrelevant to dispatch and only add maintenance cost.",
                        "The partial predicate keeps the index smaller and warmer in cache.",
                        "The path stays easy to explain operationally because the index matches one well-defined read pattern.",
                    ],
                    "A broad secondary index across all states appears simpler, but it spends write and storage budget on rows the dispatcher never touches.",
                    "Dispatch latency improves while write amplification stays bounded.",
                ),
            ],
            "How should you choose the indexing strategy for a new latency-sensitive endpoint?",
            [
                option(
                    "single-hot-path",
                    "Optimize one exact hot path first",
                    "Endpoints with one dominant query shape and strict p95 goals.",
                    [
                        "The request always filters by a stable ownership boundary such as tenant or merchant.",
                        "The product can accept explicit restrictions on supported filters and sorts.",
                        "Write throughput matters enough that extra indexes must be justified carefully.",
                    ],
                    [
                        "Ad hoc analytics needs a separate path.",
                        "Product teams may need education about why every sort is not free.",
                        "Future query growth can still force index evolution later.",
                    ],
                    "Trying to serve every potential query shape immediately usually wastes indexes and weakens the hot path.",
                ),
                option(
                    "derived-search",
                    "Move exploratory access to a derived system",
                    "Teams that need broad filtering or ranking but still need a tight transactional path.",
                    [
                        "Users need search-like behavior or many optional filters.",
                        "Staleness of a few seconds or minutes is acceptable for exploratory views.",
                        "The source-of-truth store should stay optimized for writes and narrow reads.",
                    ],
                    [
                        "You need event movement, replay, and search relevance tuning.",
                        "Derived data can lag and must be labeled honestly.",
                        "Operational surface area grows beyond one database.",
                    ],
                    "Forcing the OLTP store to behave like both a serving database and a search engine creates avoidable pain on both paths.",
                ),
            ],
            "Tune a merchant order-history endpoint for predictable p95",
            "A team is launching a merchant dashboard with recent-orders view, occasional CSV exports, and a looming request for flexible sorting by more fields.",
            [
                case_step("Name the exact hot query", "Define tenant or merchant filter, allowed status values, stable sort order, projection, and cursor semantics.", "If the team starts from abstract schema design, the eventual endpoint will inherit an accidental scan path."),
                case_step("Choose one focused composite index", "Match equality predicates first and order by the same key sequence the UI uses for pagination.", "If the index order and cursor order diverge, the endpoint may still sort in memory or page inconsistently."),
                case_step("Separate serving from exploration", "Keep CSV export or wide filtering off the hot endpoint and route it through async jobs or search.", "If both use cases share one path, every merchant pays the latency cost of rare investigative queries."),
                case_step("Roll out with write-cost visibility", "Build the index, watch write p95, storage growth, and replica lag, then shift reads intentionally.", "If index rollout is invisible operationally, the team can trade one latency win for a hidden recovery and write regression."),
            ],
            ["read p95 by query shape", "write p95 delta after index", "replica lag during build", "origin scan count"],
            "Query path and index contract",
            "The request path stays narrow while exports and broad exploration branch to separate systems.",
            """flowchart LR
    Client --> API
    API -->|supported filters only| QueryShape
    QueryShape --> PrimaryIndex
    API -->|broad export| AsyncJob
    AsyncJob --> Warehouse
""",
        ),
        "data-storage-lab/replication-sharding-and-consistency": interactive_lesson(
            "Replication, sharding, and consistency lab",
            "Choose who owns writes, what freshness users can expect, and how partitioning survives both growth and failure.",
            [
                "Replica reads are a product decision because freshness varies by workflow.",
                "Shard keys should be defended under skew, not only under uniform traffic.",
                "Failover safety and catch-up behavior often matter more than steady-state diagrams.",
            ],
            [
                example(
                    "inventory-primary",
                    "Inventory reservations",
                    "Keep the authoritative write path narrow",
                    "An inventory service needs fast browse traffic but strict correctness for reservation confirmation.",
                    "Route browse reads to replicas within a freshness budget, but force reservation confirmation and immediate verification reads to the primary.",
                    [
                        "Inventory oversell risk is concentrated on the write-confirm path, not on general browsing.",
                        "Follower reads can still absorb most browse traffic when the UI tolerates small lag.",
                        "The consistency rule becomes easy to explain: confirmation must reflect the latest committed write.",
                    ],
                    "Sending all reads to replicas sounds scalable until customers see a successful reservation followed by stale availability screens.",
                    "The system gets scale where it can and strict freshness where it must.",
                ),
                example(
                    "merchant-shard",
                    "Merchant isolation",
                    "Sharding follows ownership and hotspot risk",
                    "A commerce platform has long-tail merchants plus a few giant event-driven merchants.",
                    "Shard by merchant ownership but retain enough routing indirection to isolate exceptional merchants or move them safely later.",
                    [
                        "Operational isolation follows the same merchant boundary product teams understand.",
                        "The hottest merchants can be migrated or dedicated without redesigning every key externally.",
                        "Scatter-gather is reduced for the workflows most merchants care about.",
                    ],
                    "A time-only shard key spreads writes today but makes merchant-local operations and targeted isolation far harder tomorrow.",
                    "The platform balances locality for normal workflows with flexibility for abnormal success.",
                ),
            ],
            "Which topology is the better fit for the workflow you are defending?",
            [
                option(
                    "leader-followers",
                    "Single write owner with follower reads",
                    "Workloads that need simple conflict handling and clear write authority.",
                    [
                        "Read traffic dominates and some bounded staleness is acceptable.",
                        "User journeys that need fresh reads can be routed intentionally to primary.",
                        "Operational simplicity matters more than write locality across every region.",
                    ],
                    [
                        "Follower lag must be visible and policy driven.",
                        "Primary failover requires promotion safety and client discovery.",
                        "Cross-region writes still pay for distance if the leader is remote.",
                    ],
                    "Jumping directly to multi-writer often adds conflict and repair complexity before the business truly needs it.",
                ),
                option(
                    "partitioned-authority",
                    "Partitioned authority with local ownership",
                    "Workloads where throughput or locality demands multiple write domains.",
                    [
                        "A stable partition key keeps the dominant workflow local.",
                        "Global transactions are rare or can be approximated asynchronously.",
                        "Traffic skew is visible and hot partitions can be isolated or rebalanced.",
                    ],
                    [
                        "Cross-partition reads and reports become harder.",
                        "Rebalancing, routing metadata, and repair add operational burden.",
                        "User-facing freshness and aggregation rules must be explained carefully.",
                    ],
                    "Keeping one global writer for all traffic may simplify correctness but can become the wrong bottleneck or latency anchor.",
                ),
            ],
            "Design replica and shard policy for a global inventory platform",
            "A product needs per-merchant inventory ownership, fast browse reads, strict reservation semantics, and credible regional failover.",
            [
                case_step("Classify the user journeys", "Separate browse, reserve, confirm, and analytics paths by freshness need before discussing topology.", "If every path inherits the same consistency policy, the design will either overspend on coordination or underdeliver on correctness."),
                case_step("Assign write ownership and read eligibility", "Choose who owns reservations and define which followers are safe for browse traffic.", "If read routing rules are vague, engineers will accidentally serve confirmation reads from stale replicas."),
                case_step("Choose a shard key under skew", "Model giant merchants and event spikes, then explain how the system isolates or rebalances them.", "A key that looks even in test traffic may fail immediately during a flash sale."),
                case_step("Plan failover and repair", "Set promotion guardrails, routing discovery, and catch-up pacing before calling the topology resilient.", "If failover only exists on the diagram, the first incident becomes an improvised data-loss trade-off."),
            ],
            ["primary write latency", "replica lag by region", "per-shard skew", "promotion safety threshold"],
            "Freshness-aware read routing",
            "Critical reads stay authoritative while tolerant reads absorb scale from followers.",
            """sequenceDiagram
    participant Client
    participant API
    participant Router
    participant Primary
    participant Replica
    Client->>API: Reserve inventory
    API->>Primary: Authoritative write
    Client->>API: Browse availability
    API->>Router: Read with freshness budget
    Router->>Replica: If lag acceptable
    Router->>Primary: Otherwise
""",
        ),
        "data-storage-lab/polyglot-storage-selection": interactive_lesson(
            "Polyglot storage selection lab",
            "Map authoritative and derived storage roles so the portfolio stays explainable, minimal, and resilient.",
            [
                "Every datastore should have a single clear reason to exist.",
                "Authority and projection boundaries matter more than brand or benchmark comparisons.",
                "The smallest viable portfolio is usually the most operable one.",
            ],
            [
                example(
                    "creator-platform",
                    "Creator platform",
                    "Separate truth, search, and blobs deliberately",
                    "A creator platform needs subscription billing, uploaded media, account search, and analytics.",
                    "Keep billing and subscription truth relational, store blobs in object storage, project searchable documents into a search system, and cache hot reads separately.",
                    [
                        "Billing and entitlement logic benefit from transactional authority and mature constraints.",
                        "Media bytes are large, immutable, and cost sensitive, which suits object storage.",
                        "Search relevance and broad filters belong in a derived system rather than in the transactional path.",
                    ],
                    "A one-database-for-everything design either mishandles blobs or turns transactional tables into awkward search indexes.",
                    "Each store stays aligned with one workload while the source of truth remains unambiguous.",
                ),
                example(
                    "minimal-portfolio",
                    "Early-stage product",
                    "Resist adding a new datastore too soon",
                    "A young SaaS product wants graph queries, full-text search, and time-series dashboards before traffic is meaningfully large.",
                    "Delay specialized stores until one access pattern becomes a real bottleneck, and meet the current need with a relational store plus cache and exports where possible.",
                    [
                        "Operating burden grows faster than the feature list suggests once many stores exist.",
                        "Early product changes often invalidate premature data modeling for specialized engines.",
                        "Simple systems are easier to migrate later when usage is better understood.",
                    ],
                    "Adding every attractive datastore immediately creates synchronization and migration debt before the product proves which paths matter.",
                    "The team preserves agility and adds specialization only where production evidence demands it.",
                ),
            ],
            "How should you decide whether to add another datastore?",
            [
                option(
                    "reuse-current",
                    "Stretch the current portfolio slightly",
                    "Teams whose access patterns are still evolving and whose current bottlenecks are not yet existential.",
                    [
                        "The current source of truth can still meet correctness needs.",
                        "Broad queries or analytics can tolerate asynchronous exports for now.",
                        "The team would rather preserve operator simplicity than chase theoretical optimality.",
                    ],
                    [
                        "Some workflows may remain slower or less expressive temporarily.",
                        "You must watch for the moment when the stretch turns into real pain.",
                        "Temporary workarounds can become permanent if not revisited intentionally.",
                    ],
                    "Premature specialization can freeze architecture around guesses that the product invalidates within a quarter.",
                ),
                option(
                    "introduce-specialist",
                    "Introduce a specialist derived store",
                    "Workloads where the current portfolio cannot meet an important read or retrieval need cleanly.",
                    [
                        "The use case has a clear owner and a clear source of truth.",
                        "The new system solves a recurring product need such as ranked full-text search or cheap blob storage.",
                        "Replay, rebuild, and operational ownership are planned up front.",
                    ],
                    [
                        "Pipelines, lag, and rebuild costs become permanent responsibilities.",
                        "The team must keep source of truth and derivative roles explicit.",
                        "Migration away later will need overlap and parity validation.",
                    ],
                    "Trying to imitate search or blob storage inside the primary transactional engine often creates a worse long-term system than one purposeful derived tool.",
                ),
            ],
            "Design a minimal but sufficient storage portfolio for a marketplace",
            "The marketplace needs orders, seller dashboards, image uploads, search, and periodic analytics without overwhelming a small platform team.",
            [
                case_step("Name the authoritative domains", "Decide which data must stay transactionally correct and which can be projected or archived.", "If authority is unclear, incident response becomes a reconciliation argument instead of a repair action."),
                case_step("Match each non-authoritative need to one derived system", "Only add search, cache, or blob storage when the access pattern clearly benefits.", "If every feature gets a new datastore, operating complexity will outpace business value."),
                case_step("Design the movement path", "Define outbox, projection, replay, and rebuild rules from the source of truth.", "A derived store without replay or rebuild is a future outage waiting to happen."),
                case_step("Defend the omissions", "Explain which attractive specialized tools are deferred and how the current portfolio still meets today's workload.", "If no tool is ever deferred, the architecture likely reflects fascination with technology rather than disciplined scope."),
            ],
            ["projection lag", "search freshness", "cache hit ratio", "number of authoritative stores"],
            "Authority and projection portfolio",
            "One source-of-truth core feeds a few purposeful derivatives instead of a sprawling storage zoo.",
            """flowchart LR
    RelationalPrimary --> Outbox
    Outbox --> SearchIndex
    RelationalPrimary --> Cache
    RelationalPrimary --> Metadata
    Metadata --> ObjectStore
    Outbox --> Analytics
""",
        ),
        "security-operations-lab/auth-threat-modeling-for-hld": interactive_lesson(
            "Auth and threat modeling lab",
            "Map identity, permission checks, and abuse cases across one high-risk workflow until the control choices become architectural.",
            [
                "Identity and privilege are different control points with different failure modes.",
                "Threat modeling is strongest when it starts from one valuable workflow rather than from a giant abstract list.",
                "Abuse resistance and auditability belong in the architecture, not only in policy docs.",
            ],
            [
                example(
                    "admin-console",
                    "Admin console",
                    "Keep operator access on an explicit privileged path",
                    "Support agents need temporary access to customer accounts for debugging while tenant admins manage their own billing data.",
                    "Separate support and tenant principals, require break-glass justification for elevated access, and audit all impersonation flows independently of customer traffic.",
                    [
                        "Operator actions have higher blast radius and therefore deserve stronger controls than ordinary customer sessions.",
                        "Clear separation makes incident review and customer trust easier to preserve.",
                        "The customer plane stays simpler because privileged exceptions do not masquerade as normal user behavior.",
                    ],
                    "Reusing ordinary product APIs and roles for support actions hides privileged behavior inside the happy path and weakens accountability.",
                    "The system can move faster operationally while still making elevated behavior reviewable.",
                ),
                example(
                    "password-reset",
                    "Password reset",
                    "Threat-model the identity recovery path explicitly",
                    "A product focuses heavily on login tokens but has not deeply reviewed password reset or email change flows.",
                    "Treat password reset as a privileged workflow with replay resistance, enumeration-safe responses, and aggressive abuse limits.",
                    [
                        "Identity recovery often becomes the easiest path around otherwise solid login design.",
                        "Attackers prefer workflows that leak account existence or bypass stronger factors.",
                        "Rate limits and one-time semantics belong in the design, not only in the auth provider defaults.",
                    ],
                    "Assuming the login page is the only real auth surface ignores the highest-leverage secondary flows.",
                    "Security posture improves on the flows attackers actually probe during abuse campaigns.",
                ),
            ],
            "Where should you focus threat-modeling effort first?",
            [
                option(
                    "privileged-workflow",
                    "Start with the highest-blast-radius workflow",
                    "Systems where a small set of actions can cause outsized customer or financial harm.",
                    [
                        "An action changes identity, payout, admin access, or legal state.",
                        "The workflow is less frequent than ordinary reads but far more dangerous when wrong.",
                        "You want threat modeling to drive architecture rather than become a generic checklist.",
                    ],
                    [
                        "Some lower-risk endpoints stay less analyzed initially.",
                        "The team must revisit coverage as the product evolves.",
                        "It can feel slower than doing broad light reviews everywhere.",
                    ],
                    "Spreading effort evenly can leave the most dangerous path under-modeled while giving a false sense of thoroughness.",
                ),
                option(
                    "shared-edge-controls",
                    "Centralize only coarse controls at the edge",
                    "Architectures that need consistent authentication and rate limiting but domain-aware authorization inside services.",
                    [
                        "You want TLS termination, token validation, and baseline abuse policy shared.",
                        "Permission decisions depend on tenant or resource context known best by application services.",
                        "You need audits to reflect business actions, not only gateway decisions.",
                    ],
                    [
                        "Some logic is duplicated conceptually across edge and service tiers.",
                        "Teams need discipline to avoid pushing domain logic into the gateway over time.",
                        "Service owners must maintain clear policy code and tests.",
                    ],
                    "Putting all authorization in the gateway often creates a brittle central policy blob that lacks business context.",
                ),
            ],
            "Threat-model a multi-tenant admin console",
            "A SaaS company is launching a tenant admin console plus a support console with controlled escalation.",
            [
                case_step("Map actors and privileges", "Separate tenant admins, support agents, platform operators, and background jobs before designing token or role structure.", "If all identities are flattened, the privilege model will hide the real blast radius of operator flows."),
                case_step("Choose one critical workflow", "Model invite acceptance, password reset, or impersonation end to end and enumerate spoofing, tampering, disclosure, and privilege escalation risks.", "A generic survey will miss the workflow attackers actually exploit first."),
                case_step("Add architectural controls", "Place scoped identity, step-up checks, abuse limits, and immutable audit events on the chosen path.", "If the controls remain abstract, the threat model does not improve the actual system."),
                case_step("Plan misuse detection", "Define which dashboards, alerts, or audit queries reveal abuse before customers do.", "Controls without observability turn incidents into archaeology."),
            ],
            ["failed login rate", "break-glass activations", "cross-tenant authz denials", "impersonation audit completeness"],
            "Privileged workflow threat map",
            "High-risk flows get explicit control points instead of inheriting generic happy-path assumptions.",
            """flowchart LR
    User --> Edge
    Edge --> AuthN
    AuthN --> Service
    Service --> AuthZ
    AuthZ --> Data
    Service --> Audit
    SupportAgent --> BreakGlass
    BreakGlass --> AuthZ
""",
        ),
        "security-operations-lab/encryption-secrets-and-tenancy": interactive_lesson(
            "Encryption, secrets, and tenancy lab",
            "Decide what must be encrypted, how secrets rotate, and how tenant boundaries survive through storage and worker paths.",
            [
                "Data classification comes before key hierarchy choices.",
                "Secret distribution is part of the runtime architecture, not just a provisioning step.",
                "Tenant isolation fails if caches and workers ignore the same boundaries respected by APIs.",
            ],
            [
                example(
                    "pii-fields",
                    "Sensitive PII",
                    "Protect only what needs stronger treatment, but do it end to end",
                    "A SaaS billing platform stores invoices, payout details, contracts, and profile metadata with different risk levels.",
                    "Encrypt payout and contract data with stronger scoped controls, keep relational metadata queryable, and separate blob bytes from transactional rows.",
                    [
                        "Not every field needs the same protection or the same operational cost.",
                        "Field and object controls should follow who can access or export the data later.",
                        "Over-encrypting query-critical fields can cause teams to reintroduce unsafe plaintext shortcuts.",
                    ],
                    "Applying one blunt encryption policy everywhere can either underprotect high-risk data or break the paths the product still needs to query.",
                    "The control surface stays focused and the data model remains usable.",
                ),
                example(
                    "tenant-cache",
                    "Tenant-safe cache",
                    "Carry tenant boundaries beyond the database",
                    "An application already filters database rows by tenant but forgets to include tenant context in one cache key.",
                    "Make tenant context mandatory in cache keys, worker payloads, and search documents, not only in SQL filters.",
                    [
                        "Cross-tenant leaks often originate in derivative systems rather than in the primary table.",
                        "Defense in depth means the isolation boundary exists in multiple layers.",
                        "Workers and caches often evolve later and can quietly bypass an originally safe data model.",
                    ],
                    "Assuming database filters alone guarantee multi-tenant safety ignores where derived state and intermediate reads actually happen.",
                    "Tenant isolation remains resilient even when one layer behaves incorrectly.",
                ),
            ],
            "Which isolation pattern fits the tenant and data risk best?",
            [
                option(
                    "shared-table-strong-guards",
                    "Shared tables with strong guards",
                    "Most SaaS workloads that need efficiency and have mature tenant-aware controls.",
                    [
                        "Tenant context can be propagated reliably through API, DB, cache, and job paths.",
                        "Row-level security or equivalent storage-level guardrails are available.",
                        "Operator tooling and audit paths are mature enough to review access safely.",
                    ],
                    [
                        "One bug can still have wider blast radius than in hard-isolated designs.",
                        "Testing tenant-safety paths becomes critical and ongoing.",
                        "Premium or regulated tenants may still demand more isolation later.",
                    ],
                    "Jumping to hard isolation for every tenant can overwhelm operations before the business truly needs it.",
                ),
                option(
                    "premium-isolation",
                    "Stronger per-tenant isolation for select tiers",
                    "Highly regulated or premium tenants with strict blast-radius expectations.",
                    [
                        "Contracts or compliance requirements justify added cost and operational overhead.",
                        "A small subset of tenants meaningfully changes the risk posture.",
                        "Per-tenant keys, schemas, or clusters improve customer trust enough to matter commercially.",
                    ],
                    [
                        "Operations, migrations, and cost all become more complex.",
                        "The platform must avoid letting exceptional cases dominate every design choice.",
                        "Support tooling and analytics become harder across heterogeneous tenant layouts.",
                    ],
                    "One universal hard-isolation model may sacrifice product agility where shared infrastructure would have been sufficient and safe enough.",
                ),
            ],
            "Design tenant-safe secret and encryption policy for a billing SaaS",
            "The product stores contracts, payout details, tenant-specific webhook credentials, and normal invoice metadata across shared infrastructure.",
            [
                case_step("Classify the data", "Decide which fields or objects truly need scoped encryption, which need transport protection only, and which must remain queryable.", "If every field is treated identically, the design will either become unworkable or insufficiently protective."),
                case_step("Pick the secret-distribution path", "Define how services and workers obtain, refresh, and audit access to signing keys, database credentials, and tenant integration secrets.", "Static long-lived secrets turn one host compromise into a platform-wide incident."),
                case_step("Enforce tenant boundaries in derivatives", "Thread tenant context through cache keys, queue payloads, search documents, and audit records.", "If only the SQL path is tenant aware, a leak can still emerge from derived or cached state."),
                case_step("Plan the exception path", "Specify break-glass access, stronger isolation tiers, and how decrypt or export privileges are reviewed.", "Without an explicit exception path, operators will improvise one during the first serious incident."),
            ],
            ["secret version age", "tenant-scope cache misses", "decrypt audit events", "cross-tenant denial count"],
            "Tenant-aware protection path",
            "Encryption and tenancy controls follow data through APIs, storage, secrets, and workers.",
            """flowchart LR
    Client --> Edge
    Edge --> API
    API --> KMS
    API --> Primary
    API --> Cache
    API --> Queue
    Queue --> Workers
    Primary --> Audit
""",
        ),
        "security-operations-lab/safe-change-dr-and-degradation": interactive_lesson(
            "Safe change, DR, and degradation lab",
            "Decide how the system rolls out risky changes, recovers from regional or logic failures, and preserves the core journey while shedding optional work.",
            [
                "Rollout safety, recovery objectives, and degraded UX are one connected architecture story.",
                "Backups and failover only matter if restore and transition paths are tested.",
                "Graceful degradation is meaningful only when the user-visible fallback is explicit.",
            ],
            [
                example(
                    "checkout-rollout",
                    "Checkout migration",
                    "Use overlap and canary signals for a risky write-path change",
                    "A checkout service is moving from one order projection model to another while traffic remains live.",
                    "Deploy new code dark, dual-write where needed, shift a stable tenant cohort first, and compare both performance and business-correctness metrics before wider rollout.",
                    [
                        "Write-path changes are dangerous because data and code compatibility must overlap.",
                        "Stable cohorts make rollback and mismatch investigation far easier than random exposure.",
                        "Business metrics such as duplicate orders or missing confirmations matter as much as CPU and latency.",
                    ],
                    "A one-shot deploy may look fast, but it leaves no clean point for parity checks or safe rollback when something subtle goes wrong.",
                    "The team gains evidence and escape hatches while change is still reversible.",
                ),
                example(
                    "core-only-mode",
                    "Core-only mode",
                    "Protect the critical journey by shedding enrichments",
                    "An ecommerce site depends on recommendations, fraud enrichment, and analytics beyond the payment and order core.",
                    "During dependency distress, keep order acceptance and payment alive while disabling or deferring recommendations and nonessential enrichments.",
                    [
                        "Users care more about successful order placement than about optional content during incidents.",
                        "Clear shedding order prevents low-value work from consuming scarce capacity first.",
                        "Feature flags and runbooks let operators move intentionally instead of improvising under pressure.",
                    ],
                    "Trying to preserve every feature equally often means the whole request path times out together.",
                    "Availability becomes more honest and more useful to customers during partial outages.",
                ),
            ],
            "Which resilience posture best fits the change or outage you are planning for?",
            [
                option(
                    "progressive-overlap",
                    "Progressive rollout with overlap",
                    "Risky changes to schemas, projections, routing, or core dependencies.",
                    [
                        "Old and new versions can coexist for a limited window.",
                        "You can validate both correctness and latency on a stable cohort.",
                        "Rollback or fast disablement is more valuable than raw rollout speed.",
                    ],
                    [
                        "Temporary duplication adds complexity during the migration window.",
                        "Operators need clear metrics for parity and mismatch.",
                        "Cleanup discipline matters once confidence is established.",
                    ],
                    "Big-bang changes can be simpler on paper but make incidents much harder to diagnose and contain.",
                ),
                option(
                    "core-journey-first",
                    "Core journey first under degradation",
                    "Partial outages where preserving every feature is unrealistic.",
                    [
                        "The system can identify must-survive flows separately from enrichments.",
                        "Users can tolerate stale or missing secondary features better than failed critical actions.",
                        "Operators can toggle or queue lower-value work quickly.",
                    ],
                    [
                        "Some experiences become visibly reduced.",
                        "Feature teams must agree on shedding order ahead of time.",
                        "Re-entry to normal mode must be staged to avoid a rebound incident.",
                    ],
                    "If all work stays equally critical during an incident, overload tends to spread everywhere.",
                ),
            ],
            "Plan safe rollout and degraded mode for a checkout stack",
            "A payment and order stack needs a risky projection migration plus a documented strategy for regional failover and optional dependency loss.",
            [
                case_step("Define the recovery and rollout promises", "Set RTO, RPO, compatible overlap windows, and canary stop conditions before touching traffic.", "If objectives are implicit, every stakeholder will make a different risk trade-off mid-incident."),
                case_step("Choose cohort and signals", "Roll out by tenant or region and watch both domain metrics and system metrics.", "If exposure is random and signals are generic, subtle correctness bugs can spread quietly."),
                case_step("Rank user journeys", "Mark what stays alive in core-only or read-only mode and what work can defer to queues.", "Without an agreed shedding order, operators waste time debating while users time out."),
                case_step("Exercise the transition", "Drill failover, rollback, and re-entry into normal mode so the design is more than a diagram.", "Unpracticed recovery paths often fail at the human handoff even if the system mechanics look sound."),
            ],
            ["dual-write mismatch rate", "degraded-mode activation", "failover time", "core-checkout success rate"],
            "Safe change and degraded mode loop",
            "Traffic shifts gradually while the product keeps a narrower but coherent core experience under stress.",
            """flowchart LR
    Deploy --> Shadow
    Shadow --> Canary
    Canary --> Full
    Canary --> Rollback
    Full --> DegradeMode
    DegradeMode --> Recover
    Recover --> Full
""",
        ),
        "distributed-systems-lab/partitioning-and-hot-key-control": interactive_lesson(
            "Partitioning and hot-key control lab",
            "Choose a partition layout, predict the hotspot, and decide whether caches, queues, or rebalancing contain it best.",
            [
                "Skew is the real test of a partitioning scheme.",
                "Hot reads and hot writes usually need different mitigation tools.",
                "Rebalancing is itself a risky operational event that must be paced and observed.",
            ],
            [
                example(
                    "celebrity-profile",
                    "Celebrity profile",
                    "Protect a hot read key without repartitioning first",
                    "One social account is read millions of times per minute, but writes to the profile are rare.",
                    "Use multilayer caches and request coalescing first, and only consider dedicated isolation if the heat becomes persistent.",
                    [
                        "The bottleneck is repeated reads of one object, not distributed write ownership.",
                        "Coalescing and caching reduce origin amplification quickly without moving the partition.",
                        "The system can still keep one authoritative write owner for the profile itself.",
                    ],
                    "Immediate repartitioning of the user key may add churn and little benefit if read amplification is the main problem.",
                    "The hotspot is contained with cheaper tools before layout changes become necessary.",
                ),
                example(
                    "flash-sale-sku",
                    "Flash-sale SKU",
                    "Serialize hot writes instead of pretending they can stay fully parallel",
                    "A few inventory SKUs receive intense concurrent reservation attempts for a short window.",
                    "Queue or serialize the reservation path per SKU and pair it with strict cache and availability messaging on the read side.",
                    [
                        "The hotspot is write contention on the same logical object, not general shard imbalance alone.",
                        "Serializing one SKU is cheaper than letting parallel optimistic retries collapse the whole partition.",
                        "The product can expose queuing or pending semantics honestly during the sale window.",
                    ],
                    "Trying to keep the hot write path completely parallel often burns capacity on failed retries and contradictory updates.",
                    "Correctness is preserved and the overloaded partition remains bounded.",
                ),
            ],
            "Which first response best fits the hotspot you expect?",
            [
                option(
                    "cache-and-coalesce",
                    "Cache and coalesce first",
                    "Read-dominated hotspots on mostly immutable or slowly changing data.",
                    [
                        "Many identical reads target the same key concurrently.",
                        "The underlying object changes infrequently enough for caching to help.",
                        "Origin load amplification is the main risk.",
                    ],
                    [
                        "Freshness must still be defined and invalidation handled safely.",
                        "Truly persistent hotspots may still need dedicated isolation later.",
                        "Cold-cache recovery remains a design concern.",
                    ],
                    "Jumping straight to repartitioning may miss the cheaper and more direct fix to read amplification.",
                ),
                option(
                    "serialize-and-isolate",
                    "Serialize or isolate hot writes",
                    "Write-contention hotspots where many actors mutate the same logical record.",
                    [
                        "Concurrent writes conflict or repeatedly retry on the same owner.",
                        "Correctness is more important than maximizing write parallelism for that object.",
                        "A temporary queue or dedicated owner can keep blast radius bounded.",
                    ],
                    [
                        "Latency rises for the hot object.",
                        "Operators need visibility into queue age or owner saturation.",
                        "The product may need clearer pending or sold-out semantics.",
                    ],
                    "General-purpose parallel writes often waste more capacity than they save when one key is exceptionally hot.",
                ),
            ],
            "Handle a flash-sale hotspot without collapsing the shard map",
            "A commerce service expects a few celebrity products and merchants to dominate traffic briefly but brutally.",
            [
                case_step("Name the heat source", "Decide whether the hotspot is repeated reads, conflicting writes, or both before choosing tooling.", "If the team misclassifies the hotspot, it may spend time on rebalancing while origin amplification keeps burning."),
                case_step("Apply the first-line mitigation", "Use cache and coalescing for reads or queued serialization for writes, depending on the dominant risk.", "A generic answer like shard more can hide the fact that one object still remains singularly hot."),
                case_step("Watch skew signals", "Track top-key concentration, shard p95, cache hit ratio, and queue age on the hotspot path.", "If only fleet averages are watched, the hotspot will disappear inside healthy aggregate numbers."),
                case_step("Escalate to isolation or movement only when needed", "Reserve dedicated shards or rebalancing for sustained hotspots that outgrow the first-line controls.", "Moving too early can add control-plane churn without removing the actual workload concentration."),
            ],
            ["top-key request concentration", "shard p95", "cache hit ratio on hot set", "queue age for serialized writes"],
            "Hot object containment path",
            "Different hotspot classes trigger different mitigations before expensive movement.",
            """flowchart LR
    HotRequest --> Classify
    Classify -->|read-heavy| CacheCoalesce
    Classify -->|write-heavy| Serialize
    CacheCoalesce --> Observe
    Serialize --> Observe
    Observe -->|persistent| Isolate
    Observe -->|resolved| Normal
""",
        ),
        "distributed-systems-lab/consensus-quorums-and-leadership": interactive_lesson(
            "Consensus, quorums, and leadership lab",
            "Decide what truly needs coordination, then design leader ownership and caller behavior around failures and stale terms.",
            [
                "Consensus should be isolated to the smallest state surface that truly needs it.",
                "Quorums buy overlap at a latency and availability cost that must be justified per workflow.",
                "Leader election is incomplete without stale-leader suppression and client semantics.",
            ],
            [
                example(
                    "metadata-leader",
                    "Partition metadata",
                    "Use leadership for control-plane truth, not for every ordinary read",
                    "A partitioned data service needs one current owner for partition metadata and failover decisions, but user reads should remain local and fast.",
                    "Keep consensus around ownership metadata while allowing data-plane reads to stay partition local and cached.",
                    [
                        "Metadata correctness is critical because wrong ownership corrupts the whole partition map.",
                        "Most user reads do not need to pay consensus cost if ownership is already known.",
                        "The separation preserves safety without spreading coordination into every request path.",
                    ],
                    "Putting all reads and writes through a consensus service would simplify the diagram but impose unnecessary latency and throughput limits.",
                    "The service gets one reliable control plane without turning the whole product into a consensus system.",
                ),
                example(
                    "stale-leader",
                    "Stale writer suppression",
                    "Use fencing tokens to finish the failover story",
                    "A previously healthy leader can remain alive after partition and still attempt writes against shared infrastructure.",
                    "Attach terms or fencing tokens to leader-issued mutations and reject lower-term writes at the destination.",
                    [
                        "Election alone does not stop an old leader from acting after losing authority.",
                        "The write sink can protect itself even if two candidates temporarily believe they lead.",
                        "Operator confidence in failover improves when stale terms are visibly rejected rather than silently applied.",
                    ],
                    "Relying on timing assumptions alone creates split-brain risk when clocks or network conditions behave badly.",
                    "The design stays safe even when the old node dies slowly instead of cleanly.",
                ),
            ],
            "Where should you pay the coordination cost?",
            [
                option(
                    "control-plane-only",
                    "Control plane only",
                    "Systems where ownership metadata or scheduling state must be agreed globally, but ordinary traffic can stay local.",
                    [
                        "Most reads and writes can use stable partition ownership information.",
                        "Global coordination would be too expensive on every request.",
                        "Clients can tolerate brief metadata refresh during leadership change.",
                    ],
                    [
                        "Client or proxy discovery paths must be reliable.",
                        "Control-plane outages still have outsized blast radius.",
                        "You need a story for stale ownership caches.",
                    ],
                    "Using consensus everywhere may feel safer but usually pays too much latency and complexity tax.",
                ),
                option(
                    "quorum-critical-writes",
                    "Quorum only for the critical write class",
                    "Workloads where a narrow set of writes needs stronger freshness or durability than the rest.",
                    [
                        "Only some mutations justify the extra coordination budget.",
                        "Clients and operators can distinguish critical from ordinary writes cleanly.",
                        "The design can tolerate heterogeneous consistency semantics across workflows.",
                    ],
                    [
                        "The caller contract becomes more nuanced.",
                        "Observability must separate the critical and ordinary paths.",
                        "Teams must resist letting every new feature declare itself critical.",
                    ],
                    "Uniform coordination policies often spend latency budget on paths that never needed stronger semantics.",
                ),
            ],
            "Design leadership for a partition ownership service",
            "A partitioned data plane needs safe owner election and coherent client behavior when leadership changes.",
            [
                case_step("Prove the need for coordination", "Limit consensus to ownership metadata or another truly global control-plane fact.", "If coordination scope grows casually, the system will become slower without a corresponding safety gain."),
                case_step("Define stale-owner suppression", "Use terms, leases, or fencing tokens so old leaders cannot keep mutating after failover.", "Election without stale-owner suppression leaves the split-brain risk unsolved."),
                case_step("Design caller behavior", "Choose whether clients see redirects, retriable failures, or stable endpoints that hide the leader move.", "Undefined caller semantics turn brief failover into random client pain."),
                case_step("Plan membership and warmup", "Describe how new replicas catch up and when they may participate safely in leadership or quorum.", "If membership change is ignored, the design sounds static and under-tested."),
            ],
            ["election duration", "stale-term rejections", "metadata cache freshness", "quorum write latency"],
            "Leader ownership and fenced writes",
            "Only the coordination-critical state pays the term and fencing cost.",
            """sequenceDiagram
    participant Client
    participant Coordinator
    participant Leader
    participant Store
    Client->>Coordinator: Resolve current owner
    Coordinator-->>Client: leader + term
    Client->>Leader: Write(term=7)
    Leader->>Store: Apply with fence=7
    Store-->>Leader: accepted
""",
        ),
        "distributed-systems-lab/sagas-idempotency-and-workflows": interactive_lesson(
            "Sagas, idempotency, and workflows lab",
            "Design a multi-step business flow that survives retries, partial failure, compensation, and manual recovery without losing customer intent.",
            [
                "Distributed workflows need durable state and retry safety, not only event emission.",
                "Outbox and inbox patterns turn transport retries into business-safe behavior.",
                "Operator recovery paths are part of the workflow design, not only a future support concern.",
            ],
            [
                example(
                    "order-intent",
                    "Order submission",
                    "Return accepted on the right boundary",
                    "An order path validates cart state, reserves inventory, authorizes payment, and later sends email and analytics.",
                    "Return accepted after the authoritative core steps succeed, then continue recoverable side effects asynchronously with durable workflow state.",
                    [
                        "The user needs confidence that the order exists, not that every downstream side effect is already complete.",
                        "Durable workflow state makes retries and operator recovery coherent.",
                        "Async side effects stay recoverable without making the core path brittle.",
                    ],
                    "Doing every effect inline makes acceptance depend on low-value or cold systems such as email or analytics.",
                    "The workflow stays understandable, bounded, and operable under retry and delay.",
                ),
                example(
                    "duplicate-payment",
                    "Retrying a payment command",
                    "Treat duplicate transport as one business command",
                    "A client times out waiting for payment authorization and retries with the same intent.",
                    "Require a stable idempotency key and store the prior result so the retry returns the original outcome instead of charging twice.",
                    [
                        "Transport uncertainty is unavoidable; business duplication is optional if the design plans for it.",
                        "A durable result record keeps retried commands from re-executing blindly.",
                        "The caller contract becomes simpler because safe retry is intentional.",
                    ],
                    "Assuming the queue or HTTP transport gives exactly-once behavior pushes duplication risk into the business workflow.",
                    "The payment path becomes safe to retry even when the first response was lost.",
                ),
            ],
            "Which workflow style best fits the business process?",
            [
                option(
                    "orchestrated-state-machine",
                    "Orchestrated state machine",
                    "High-value workflows that need step visibility, ordering, and controlled compensation.",
                    [
                        "Operators must inspect or intervene in stuck workflows.",
                        "Step order and business timing are important.",
                        "One service or engine can own the workflow truth clearly.",
                    ],
                    [
                        "The coordinator becomes a critical dependency.",
                        "The workflow model must evolve carefully as steps change.",
                        "Teams need discipline to keep all step state coherent.",
                    ],
                    "Pure choreography can hide the business process across many consumers until no one can explain recovery anymore.",
                ),
                option(
                    "lightweight-choreography",
                    "Lightweight choreography",
                    "Simpler fan-out or enrichment flows where side effects are loosely coupled and visible failure handling is modest.",
                    [
                        "No single step needs strict centralized ordering.",
                        "Consumers can be independently retried and reconciled.",
                        "The business can tolerate partial completion or delayed enrichments.",
                    ],
                    [
                        "Ownership of end-to-end workflow visibility is weaker.",
                        "Hidden coupling can grow over time.",
                        "Operator recovery is harder if the event graph becomes too wide.",
                    ],
                    "Forcing orchestration on every tiny enrichment flow can add coordinator cost where the business never needed it.",
                ),
            ],
            "Design a retry-safe checkout saga",
            "The system spans inventory, payment, shipment, and notification while supporting safe client retries and eventual operator repair.",
            [
                case_step("Define the acceptance boundary", "State which local transactions must complete before the API returns accepted to the user.", "If acceptance is vague, retries and customer messaging become inconsistent immediately."),
                case_step("Persist workflow truth", "Store step state durably so retries, compensations, and operators all reason about the same workflow instance.", "If state only lives in transient logs or events, recovery becomes guesswork."),
                case_step("Attach idempotency to commands", "Use stable keys on externally retryable commands and dedupe state on consumers.", "Without replay safety, partial failures become duplicate charges or reservations."),
                case_step("Plan compensation and repair", "Decide which failures auto-compensate, which require manual review, and how reconciliation finds misses later.", "If recovery is undefined, the workflow is only reliable on the happy path."),
            ],
            ["workflow age", "compensation rate", "duplicate-command collapse count", "stuck workflow count"],
            "Workflow truth and replay safety",
            "A durable workflow record governs retries, async effects, and operator recovery.",
            """flowchart LR
    Client --> API
    API --> WorkflowState
    WorkflowState --> Inventory
    WorkflowState --> Payment
    WorkflowState --> Queue
    Queue --> Shipment
    Queue --> Notify
    WorkflowState --> Reconcile
""",
        ),
    }


def _build_deep_map():
    return {
        "data-storage-lab/indexing-and-query-path-design": {
            "insights": [
                insight(
                    "Indexes are physical contracts",
                    "An index is not just a performance hint. It is a physical contract between the storage engine and the request path. Once an endpoint depends on that contract, key order, clustering behavior, and cardinality shape become long-lived product assumptions. Teams that treat indexes as infinitely malleable often underestimate how much write cost and migration risk accumulates around them.",
                    "This is why senior storage reviews ask which endpoint or background consumer truly owns the index budget. If no caller is important enough to justify the index, the structure is probably cargo cult. If a caller is important enough, then the team should also state what query shapes are intentionally unsupported and what alternate path handles them.",
                ),
                insight(
                    "Query shape discipline beats planner heroics",
                    "Database planners are impressive, but they cannot rescue arbitrary product flexibility at scale. Once many optional predicates and sorts coexist, the planner's job becomes a losing optimization problem because the engine no longer has a small set of dominant access paths to exploit.",
                    "Constrain the request shape at the API boundary and the database remains predictable. Leave it unconstrained and eventually someone builds a dashboard query that looks legal to the API but catastrophically expensive to the storage layer. Strong architecture sets those boundaries earlier than incident response would prefer.",
                ),
                insight(
                    "Pagination and indexing are the same conversation",
                    "Offset pagination hides a read-amplification problem by making deeper pages progressively more expensive. Cursor pagination aligned with index order keeps the request shape stable as the dataset grows, which is why mature API designs usually discuss cursor tokens alongside their composite indexes.",
                    "This also improves correctness under concurrent writes. A cursor anchored on ordered keys behaves more deterministically than an offset in a rapidly mutating table. The storage win and the product win are tightly connected, so they should be defended together.",
                ),
                insight(
                    "Index rollouts are migration events",
                    "Large live index changes consume the same kinds of scarce resources as many application migrations: CPU, I/O, replication bandwidth, and operator attention. Treating them as harmless DDL is one reason teams are surprised by replica lag and write regressions after what looked like a routine schema tweak.",
                    "Experienced teams add rollout checkpoints, observe write-path cost explicitly, and delete obsolete structures later. The index lifecycle matters almost as much as the index design itself because write amplification from stale indexes can quietly become a permanent tax.",
                ),
            ],
            "references": [
                ref("PostgreSQL Indexes", "https://www.postgresql.org/docs/current/indexes.html", "PostgreSQL Documentation", "Practical grounding for how relational indexes work and when different structures matter."),
                ref("Use The Index, Luke!", "https://use-the-index-luke.com/", "Use The Index, Luke!", "Clear explanations of query plans, pagination, and composite-index behavior."),
                ref("Amazon Builders' Library: Using load shedding to avoid overload", "https://aws.amazon.com/builders-library/using-load-shedding-to-avoid-overload/", "Amazon Builders' Library", "Useful companion reading on constraining work before the storage layer is overwhelmed."),
            ],
        },
        "data-storage-lab/replication-sharding-and-consistency": {
            "insights": [
                insight(
                    "Freshness is a product budget",
                    "Replica lag becomes manageable when it is turned into a product budget instead of a surprise. If a page tolerates seconds of staleness, follower reads are easy to justify. If a path confirms a just-completed write, even tens of milliseconds may be too much unless routing stays authoritative.",
                    "The important shift is to make that freshness window explicit per workflow. Doing so transforms consistency from vague philosophy into an engineering contract with routing consequences, dashboard implications, and user-experience copy when the budget cannot be met.",
                ),
                insight(
                    "Shard keys encode future migrations",
                    "Choosing a partition key is not just about today's throughput. It decides which records move together, which failures stay local, and how painful the first major rebalancing event will be. A key that aligns poorly with future success cases can lock the system into expensive scatter-gather behavior or repeated hotspot isolation work.",
                    "That is why good designs preserve some routing indirection. The external identifier should stay stable while the underlying placement can evolve. This is not free, but it is often the difference between manageable growth and emergency redesign.",
                ),
                insight(
                    "Failover quality is judged after promotion",
                    "A failover that merely flips a leader flag is only half successful. Customers care whether recent writes are preserved, whether survivors stay responsive, and whether read paths are still coherent after promotion. Repair pressure and replay traffic often dominate the real incident cost after the initial switch.",
                    "Systems that rehearse promotion safety, throttle catch-up, and design client rediscovery intentionally tend to recover with more dignity. The post-failover operating window is where architectural maturity becomes visible.",
                ),
                insight(
                    "Consistency language must stay user visible",
                    "It is easy to say eventual or strong consistency and still leave everyone confused. Better design language describes what the user sees after a concrete action: a confirmed reservation appears immediately, a leaderboard can lag by thirty seconds, a cross-region count may be approximate for a short window.",
                    "That style of explanation keeps infrastructure choices honest. If the user-facing statement sounds unacceptable, the consistency model is probably wrong for that workflow no matter how elegant the topology looks.",
                ),
            ],
            "references": [
                ref("Designing Data-Intensive Applications", "https://dataintensive.net/", "Martin Kleppmann", "Authoritative background on replication, partitioning, and consistency trade-offs."),
                ref("Spanner: Google's Globally Distributed Database", "https://research.google/pubs/pub39966/", "Google Research", "Useful reference for globally coordinated consistency and its costs."),
                ref("Jepsen Analyses", "https://jepsen.io/analyses", "Jepsen", "Operationally grounded reminders that consistency claims should be tested under failure."),
            ],
        },
        "data-storage-lab/polyglot-storage-selection": {
            "insights": [
                insight(
                    "Authority boundaries simplify incidents",
                    "When one system clearly owns a business fact, incident response can ask which projections are stale instead of which truth to believe. That clarity is the biggest hidden benefit of disciplined polyglot persistence. It turns recovery from philosophical debate into concrete replay and rebuild work.",
                    "The opposite is also true. If search, cache, and primary tables each partially own the same domain meaning, operators will spend outages arguing about which state should win. Clear authority is therefore both a design and an operations accelerant.",
                ),
                insight(
                    "Derived systems deserve product honesty",
                    "Derived indexes and caches create tremendous user value, but only when the product is honest about their freshness and recovery behavior. Search results may lag a profile edit. Analytics counts may arrive minutes later. Media thumbnails may rebuild after corruption. These are acceptable when made explicit and unacceptable when hidden as implied immediate truth.",
                    "The design implication is that derivative systems should come with user-facing expectations, rebuild paths, and operator dashboards from the start. A derived store without those contracts eventually surprises both users and engineers.",
                ),
                insight(
                    "The smallest portfolio compounds fastest",
                    "Every extra datastore multiplies tools, backups, IAM, testing, and on-call knowledge. The cost curve is nonlinear because data movement paths add failure matrices between systems. That is why strong platform teams often defer a specialist engine until one access pattern becomes impossible to serve gracefully without it.",
                    "Specialization remains valuable, but the bar should be real workload pain or clear product leverage. Polyglot persistence is strongest when it expresses necessity, not enthusiasm.",
                ),
                insight(
                    "Exit cost is part of selection quality",
                    "A datastore decision is easier to justify when the architecture already hints at how it could be replaced later. If replay, backfill, and parity validation are impossible, adoption risk is higher than the steady-state diagram suggests.",
                    "Experienced engineers therefore evaluate new storage systems with both entrance and exit criteria. The operational skill is not merely launching the new path, but also preserving the ability to leave it without stopping the product.",
                ),
            ],
            "references": [
                ref("Martin Fowler: Polyglot Persistence", "https://martinfowler.com/bliki/PolyglotPersistence.html", "Martin Fowler", "Classic framing for why different data models coexist in one system."),
                ref("Amazon DynamoDB Design Patterns", "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-general-nosql-design.html", "AWS Documentation", "Helpful reference on access-pattern-driven NoSQL modeling."),
                ref("Elasticsearch Reference", "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html", "Elastic Documentation", "Useful grounding on what a search engine is actually optimized to do versus a primary OLTP store."),
            ],
        },
        "security-operations-lab/auth-threat-modeling-for-hld": {
            "insights": [
                insight(
                    "Identity recovery is part of the attack surface",
                    "Systems often invest heavily in primary login paths while leaving password reset, invite acceptance, email change, or support impersonation comparatively underdesigned. Attackers notice. These secondary flows can bypass otherwise excellent session and token practices if the architecture does not treat them as privileged workflows.",
                    "Threat modeling those paths first often yields better architectural returns than polishing generic auth diagrams. The controls become tangible: one-time semantics, stronger audit, abuse throttling, and explicit operator review boundaries.",
                ),
                insight(
                    "Authorization wants domain context",
                    "Centralized token validation is useful, but meaningful authorization usually needs resource and tenant context known best by the application domain. A gateway can confirm the caller is who they claim to be and maybe enforce coarse scopes, yet the service often knows whether a given invoice, project, or account actually belongs to that tenant and action.",
                    "This is why strong architectures mix centralized identity mechanisms with locally visible authorization checks. The result is more explainable than a giant edge policy blob and safer than assuming identity proof equals blanket permission.",
                ),
                insight(
                    "Abuse and reliability overlap",
                    "Credential stuffing, replay, and enumeration can become availability incidents as much as security incidents. Rate limiting, deduplication, and suspicious-activity telemetry therefore serve both reliability and security goals. The infrastructure burden of abuse deserves the same architectural seriousness as ordinary product traffic.",
                    "Teams that separate those conversations too rigidly often miss high-leverage controls. Protecting login and recovery endpoints well can reduce both fraud exposure and fleet saturation under attack.",
                ),
                insight(
                    "Operator paths deserve first-class design",
                    "Support tools and break-glass paths are not embarrassing exceptions to the real architecture. They are often the most dangerous paths in the system because they deliberately bypass normal user constraints for legitimate operational reasons.",
                    "Designing them explicitly with stronger identity, approval, and audit semantics keeps them accountable. Ignoring them until a crisis guarantees improvised privilege later.",
                ),
            ],
            "references": [
                ref("OWASP ASVS", "https://owasp.org/www-project-application-security-verification-standard/", "OWASP", "Widely used security-control framework that helps anchor auth and authorization design depth."),
                ref("OWASP Threat Modeling Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html", "OWASP Cheat Sheet Series", "Practical guide for converting abstract threats into concrete design review questions."),
                ref("NIST Digital Identity Guidelines", "https://pages.nist.gov/800-63-3/", "NIST", "Authoritative reference for identity, authentication, and lifecycle controls."),
            ],
        },
        "security-operations-lab/encryption-secrets-and-tenancy": {
            "insights": [
                insight(
                    "Encryption is only useful relative to the attacker model",
                    "Encrypted at rest can protect against one class of media or infrastructure compromise while doing little against an overprivileged application or operator path. That does not make the control useless; it means the architecture must match cryptographic controls to the likely compromise path.",
                    "This is why data classification and access-path analysis come first. Teams should know whether they are defending against disk theft, snapshot leakage, compromised app code, operator overreach, or tenant cross-talk, because each scenario changes which layer matters most.",
                ),
                insight(
                    "Secrets have renewal behavior",
                    "The hard part of secret handling is often not storage but renewal. A service fleet that cannot refresh credentials gracefully turns every rotation into a redeploy or outage risk. A platform that cannot partition partner secrets cleanly turns one integration compromise into a multi-tenant event.",
                    "Thinking about renewal early improves design quality. Which process fetches the secret, how does it notice a version change, what happens to open connections, and what audit event proves the access all become explicit instead of emergent.",
                ),
                insight(
                    "Tenant isolation is a systems property",
                    "Multi-tenant safety is degraded whenever any layer forgets the tenant boundary, whether that layer is the cache, the worker, the analytics projection, or the admin export path. Database constraints help, but they are not sufficient on their own once derived data paths appear.",
                    "Defense in depth therefore matters more than slogans. Architecture should deliberately repeat the tenant dimension where state is transformed or cached so one missing check is less likely to become a customer-visible leak.",
                ),
                insight(
                    "Privilege for read is not identical to privilege for decrypt",
                    "Separating read, decrypt, and bulk-export privileges can dramatically shrink blast radius and simplify reviews. A support system may need to view metadata but not decrypt sensitive payloads. A batch job may need to process encrypted objects via envelope operations without exposing plaintext to humans.",
                    "These distinctions are worth modeling because they create more meaningful audit trails and clearer incident stories. Overly broad decrypt permission is one of the easiest paths to invisible overexposure.",
                ),
            ],
            "references": [
                ref("Envelope Encryption", "https://cloud.google.com/kms/docs/envelope-encryption", "Google Cloud Documentation", "Clear explanation of practical envelope-encryption architecture and why key hierarchies matter."),
                ref("OWASP Secrets Management Cheat Sheet", "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html", "OWASP Cheat Sheet Series", "Useful operational guidance on rotation, retrieval, and secret hygiene."),
                ref("PostgreSQL Row Security Policies", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "PostgreSQL Documentation", "Concrete reference for one common database-level tenant-isolation mechanism."),
            ],
        },
        "security-operations-lab/safe-change-dr-and-degradation": {
            "insights": [
                insight(
                    "Compatibility is the hidden enabler of safe rollout",
                    "Traffic shifting tools are only as good as the compatibility surface beneath them. If schemas, events, or APIs cannot overlap safely, canarying becomes a false comfort because the system still depends on lockstep change underneath.",
                    "Architectures that value safe change therefore bias toward additive contracts and reversible movement. Progressive delivery is most effective when the data model cooperates with it.",
                ),
                insight(
                    "Recovery objectives convert resilience from taste into math",
                    "RTO and RPO force architecture to acknowledge what the business is actually buying. Without them, teams either gold-plate multi-region designs or underprepare restore paths because no one has stated how much outage or data loss is acceptable.",
                    "Those objectives also help trade-offs during incident design. Slower safer failover, faster potentially lossy promotion, or backup restore can each be appropriate under different business promises.",
                ),
                insight(
                    "Graceful degradation is a product feature",
                    "Fallback behavior is experienced by users, not just by SRE dashboards. If the degraded experience is confusing, inconsistent, or silent, then the system may technically stay up while user trust still collapses.",
                    "This is why strong HLD answers describe what the screen or API does under partial failure. A stale banner, a read-only state, or hidden enrichment is far more meaningful than the phrase graceful degradation alone.",
                ),
                insight(
                    "Runbooks are architecture memory",
                    "Recovery plans decay unless they are encoded into runbooks, drills, and dashboards that outlive the individuals who first designed them. Architecture that depends on heroic tribal knowledge is fragile even if the topology is sound.",
                    "Treating runbooks as part of system design ensures that failover, rollback, and re-entry paths remain shareable, reviewable, and testable across time.",
                ),
            ],
            "references": [
                ref("Google SRE Book: Addressing Cascading Failures", "https://sre.google/sre-book/addressing-cascading-failures/", "Google SRE Book", "Helpful reference for overload, defensive controls, and preserving useful work."),
                ref("AWS Well-Architected Reliability Pillar", "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html", "AWS Documentation", "Broad reference on recovery, change management, and fault isolation."),
                ref("Feature Toggles", "https://martinfowler.com/articles/feature-toggles.html", "Martin Fowler", "Useful framework for understanding rollout, ops, and experiment flags as distinct controls."),
            ],
        },
        "distributed-systems-lab/partitioning-and-hot-key-control": {
            "insights": [
                insight(
                    "Uniformity assumptions are architectural debt",
                    "Synthetic tests often spread keys evenly, but production behavior clusters around people, products, regions, and time. Designs that assume fairness from the workload end up paying for that assumption later through emergency caching, isolation, and queueing work.",
                    "Modeling skew early is therefore a form of debt prevention. It pushes engineers to choose keys, metrics, and fallback controls that survive success rather than only surviving average load.",
                ),
                insight(
                    "Read hotspots and write hotspots are different physics",
                    "Read hotspots usually amplify repeated work and are therefore susceptible to caching, replication, and coalescing. Write hotspots are about contention on a single authority boundary and often require serialization, batching, or altered product semantics instead.",
                    "Confusing the two leads teams to apply the wrong mitigation. More caches do little for an oversubscribed single-writer record. More shards do little if one object remains the singular point of contention.",
                ),
                insight(
                    "Rebalancing is a migration, not a toggle",
                    "Moving ownership shifts data, cache locality, repair work, and operational confidence simultaneously. Even with consistent hashing or virtual nodes, the system must manage transfer pace and destination warmup carefully.",
                    "Experienced operators therefore treat rebalancing with the same caution they apply to schema or traffic migrations. The move itself can be as risky as the problem it intends to solve.",
                ),
                insight(
                    "Skew metrics should shape product policy",
                    "Hotspot visibility often reveals that certain tenants or features consume infrastructure disproportionately. Architecture alone is not always the best or cheapest response. Tiering, quotas, and feature redesign can be just as important as technical mitigation.",
                    "Seeing partitioning as a business-input loop as well as a routing problem helps teams avoid endless infrastructure escalation for a workload the product could reshape more intelligently.",
                ),
            ],
            "references": [
                ref("Amazon Dynamo: Highly Available Key-value Store", "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf", "Amazon", "Foundational paper on partitioned ownership, consistent hashing, and failure trade-offs."),
                ref("The Log: What every software engineer should know about real-time data's unifying abstraction", "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying", "LinkedIn Engineering", "Helpful for thinking about partitioned streams, ordered ownership, and movement costs."),
                ref("Caching at Scale", "https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/caching/README.md", "System Design Primer", "Good supporting reading on cache behavior and hotspot mitigation patterns."),
            ],
        },
        "distributed-systems-lab/consensus-quorums-and-leadership": {
            "insights": [
                insight(
                    "Consensus scope discipline preserves scalability",
                    "The most scalable use of consensus is usually the most boring one: narrow control-plane truth for metadata or leadership that the rest of the system can cache and exploit locally. Problems begin when engineers see consensus as a universal correctness solvent and start routing ordinary product actions through it unnecessarily.",
                    "The result is often a system that is technically correct and practically slower, costlier, and harder to evolve. Scope discipline is what keeps coordinated safety and everyday throughput compatible.",
                ),
                insight(
                    "Stale leaders are the real antagonist",
                    "Leader election feels dramatic, but many failures are caused not by choosing a new leader but by an old one that does not realize it should stop. This is why epochs, fences, and leases are so central. They encode the negative side of leadership: who no longer has authority.",
                    "Any HLD explanation of leadership becomes much more convincing the moment it explains how stale ownership is rejected, not merely how fresh ownership is announced.",
                ),
                insight(
                    "Quorum trade-offs are user trade-offs",
                    "Higher quorums can improve overlap and confidence, but they also increase coordination latency and sensitivity to slow replicas. Lower quorums can preserve responsiveness, but they enlarge repair and staleness windows. That balance should be explained in the same language as the product's expectations.",
                    "Doing so keeps the design grounded. Engineers and interviewers alike can ask whether the user's experience justifies the cost instead of hiding the decision behind mathematical elegance.",
                ),
                insight(
                    "Clients need ownership semantics too",
                    "Distributed-systems safety is incomplete until clients know what to do when ownership changes. Redirects, retriable errors, fenced-term failures, and metadata refresh rules are all part of the architecture because they decide whether a coordination event looks like a quick retry or like chaotic unavailability.",
                    "Caller semantics also shape observability. If stale-term errors are expected but rare, they deserve explicit dashboards and alerts rather than being buried in generic failure noise.",
                ),
            ],
            "references": [
                ref("In Search of an Understandable Consensus Algorithm (Raft)", "https://raft.github.io/raft.pdf", "Raft Paper", "Accessible consensus reference with strong grounding in leadership and terms."),
                ref("ZooKeeper: Wait-free coordination for Internet-scale systems", "https://www.usenix.org/legacy/event/atc10/tech/full_papers/Hunt.pdf", "USENIX", "Classic coordination-system paper useful for control-plane design intuition."),
                ref("Martin Kleppmann on Fencing Tokens", "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html", "Martin Kleppmann", "Helpful discussion of leases, stale ownership, and why tokens matter."),
            ],
        },
        "distributed-systems-lab/sagas-idempotency-and-workflows": {
            "insights": [
                insight(
                    "Workflow truth should outlive transport truth",
                    "Messages, HTTP responses, and provider callbacks can all be lost, duplicated, or delayed. A durable workflow record is what lets the system preserve business intent despite those transport ambiguities. Without it, recovery relies on correlating logs and hoping side effects lined up the way engineers imagined.",
                    "This is why sophisticated distributed workflows elevate state machines or equivalent durable progress records. The workflow becomes a first-class domain object rather than a hidden side effect of network success.",
                ),
                insight(
                    "Idempotency is part of the product contract",
                    "Clients need to know whether retrying the same command is safe and what result they should expect if the first attempt actually succeeded. Stable keys and replayed prior results are therefore as much a caller experience choice as an implementation detail.",
                    "The cleaner the idempotency contract, the less custom retry logic clients invent for themselves. That reduces accidental duplicate work throughout the stack.",
                ),
                insight(
                    "Compensation is often asymmetric",
                    "Real workflows rarely roll backward in a perfectly mirrored way. A held seat can be released. A card authorization can be voided if timing permits. A shipped package may require a return, not an undo. Architecture that recognizes this asymmetry is more honest and usually safer.",
                    "This is why operator review remains important even in automated workflow systems. Some business reversals are decisions, not technical reversions.",
                ),
                insight(
                    "Reconciliation keeps workflows trustworthy over time",
                    "Eventually some workflow step will complete after a timeout, or a downstream projector will miss one event, or a compensation will partially apply. Reconciliation jobs and dashboards are what convert those edge cases from invisible corruption into repairable discrepancies.",
                    "Treating reconciliation as a first-class architecture component keeps long-running distributed systems trustworthy even when perfect transport or timing guarantees do not exist.",
                ),
            ],
            "references": [
                ref("Microservices.io: Saga Pattern", "https://microservices.io/patterns/data/saga.html", "microservices.io", "Clear conceptual reference for orchestrated and choreographed saga patterns."),
                ref("Microservices.io: Transactional Outbox", "https://microservices.io/patterns/data/transactional-outbox.html", "microservices.io", "Practical grounding for bridging local transactions to asynchronous delivery."),
                ref("Stripe Idempotent Requests", "https://stripe.com/docs/api/idempotent_requests", "Stripe Documentation", "Excellent real-world reference for caller-visible idempotency contracts."),
            ],
        },
    }


def _build_sims():
    return {
        "data-storage-lab": {
            "title": "Data storage lab simulator",
            "summary": "Stress read-path indexing, replica freshness, and projection lag across a storage topology with one authoritative write path and several derived consumers.",
            "diagram": """node client type=edge label="Client traffic" latencyMs=5 capacityRps=90000
node api type=service label="Storage API" latencyMs=10 capacityRps=32000
node cache type=cache label="Hot query cache" latencyMs=3 capacityRps=120000 queueCapacity=50000 hitRate=0.9
node primary type=database label="Primary relational store" latencyMs=24 capacityRps=9500 queueCapacity=9000
node replica type=database label="Read replica" latencyMs=18 capacityRps=18000 queueCapacity=9000
node queue type=queue label="Projection queue" latencyMs=11 capacityRps=30000 queueCapacity=140000
node workers type=worker label="Projection workers" latencyMs=24 capacityRps=21000
link client -> api
link api -> cache
link api -> primary
link api -> replica
link api -> queue async=true
link queue -> workers async=true""",
            "apis": [
                {
                    "id": "indexed-read",
                    "label": "GET /orders",
                    "summary": "Tenant-scoped read path that uses cache first, then a replica or primary depending on freshness needs.",
                    "timeoutMs": 260,
                    "retries": 1,
                    "payloadKb": 2,
                    "stages": [
                        {"nodeId": "client", "mode": "always"},
                        {"nodeId": "api", "sourceNodeId": "client", "mode": "always"},
                        {"nodeId": "cache", "sourceNodeId": "api", "mode": "always", "kind": "cache", "hitRate": 0.9},
                        {"nodeId": "replica", "sourceNodeId": "api", "mode": "cache-miss"},
                        {"nodeId": "primary", "sourceNodeId": "api", "mode": "conditional", "callsPerRequest": 0.2},
                        {"nodeId": "queue", "sourceNodeId": "api", "mode": "async", "callsPerRequest": 0.25},
                        {"nodeId": "workers", "sourceNodeId": "queue", "mode": "async", "callsPerRequest": 0.25},
                    ],
                    "focusMetrics": ["read p95", "cache hit ratio", "replica utilization", "projection lag"],
                },
                {
                    "id": "authoritative-write",
                    "label": "POST /orders",
                    "summary": "Write path that persists authoritative state then emits async projection work.",
                    "timeoutMs": 480,
                    "retries": 2,
                    "payloadKb": 3,
                    "stages": [
                        {"nodeId": "client", "mode": "always"},
                        {"nodeId": "api", "sourceNodeId": "client", "mode": "always"},
                        {"nodeId": "primary", "sourceNodeId": "api", "mode": "always"},
                        {"nodeId": "queue", "sourceNodeId": "api", "mode": "async", "callsPerRequest": 0.9},
                        {"nodeId": "workers", "sourceNodeId": "queue", "mode": "async", "callsPerRequest": 0.9},
                    ],
                    "focusMetrics": ["write p95", "primary write utilization", "retry amplification", "queue depth"],
                },
            ],
            "workloadProfiles": [
                {"id": "steady-dashboard", "label": "Steady dashboard reads", "endpointId": "indexed-read", "description": "Healthy cache behavior and mostly tolerant freshness requirements.", "workload": {"rpm": 540000, "concurrency": 1800, "retries": 0}},
                {"id": "search-like-creep", "label": "Broader query creep", "endpointId": "indexed-read", "description": "Cache hit rate falls and replica pressure rises as users ask for less index-friendly filters.", "workload": {"rpm": 780000, "concurrency": 2600, "retries": 1}},
                {"id": "write-surge", "label": "Write-heavy burst", "endpointId": "authoritative-write", "description": "A promotion event increases writes and downstream projection lag.", "workload": {"rpm": 240000, "concurrency": 950, "retries": 2}},
            ],
            "scriptTemplate": """workload('indexed-read', { rpm: 820000, concurrency: 2900, retries: 1 })
failure('cache', { hitRate: 0.62, extraLatencyMs: 8 })
node('primary', { capacityRps: 7800, latencyMs: 31 })""",
        },
        "security-operations-lab": {
            "title": "Security and operations lab simulator",
            "summary": "Model identity checks, tenant-safe storage, and degraded-mode choices while auth, primary data, and audit paths compete under stress.",
            "diagram": """node client type=edge label="Client traffic" latencyMs=5 capacityRps=95000
node edge type=edge label="Edge / gateway" latencyMs=8 capacityRps=52000
node auth type=service label="Auth service" latencyMs=12 capacityRps=28000
node api type=service label="Core API" latencyMs=14 capacityRps=24000
node primary type=database label="Primary store" latencyMs=22 capacityRps=8500 queueCapacity=9000
node replica type=database label="Read replica" latencyMs=18 capacityRps=16000 queueCapacity=9000
node audit-queue type=queue label="Audit queue" latencyMs=10 capacityRps=34000 queueCapacity=150000
node workers type=worker label="Audit / notification workers" latencyMs=23 capacityRps=21000
link client -> edge
link edge -> auth
link auth -> api
link api -> primary
link api -> replica
link api -> audit-queue async=true
link audit-queue -> workers async=true""",
            "apis": [
                {
                    "id": "privileged-read",
                    "label": "GET /tenant/invoices",
                    "summary": "Authenticated tenant-scoped read that may use a replica only when freshness and auth context permit.",
                    "timeoutMs": 300,
                    "retries": 1,
                    "payloadKb": 2,
                    "stages": [
                        {"nodeId": "client", "mode": "always"},
                        {"nodeId": "edge", "sourceNodeId": "client", "mode": "always"},
                        {"nodeId": "auth", "sourceNodeId": "edge", "mode": "always"},
                        {"nodeId": "api", "sourceNodeId": "auth", "mode": "always"},
                        {"nodeId": "replica", "sourceNodeId": "api", "mode": "always"},
                        {"nodeId": "audit-queue", "sourceNodeId": "api", "mode": "async", "callsPerRequest": 0.35},
                        {"nodeId": "workers", "sourceNodeId": "audit-queue", "mode": "async", "callsPerRequest": 0.35},
                    ],
                    "focusMetrics": ["auth p95", "tenant read latency", "replica lag", "audit queue depth"],
                },
                {
                    "id": "privileged-write",
                    "label": "POST /admin/break-glass",
                    "summary": "Sensitive write path that must authenticate strongly, persist authoritative state, and emit audit events reliably.",
                    "timeoutMs": 420,
                    "retries": 1,
                    "payloadKb": 1,
                    "stages": [
                        {"nodeId": "client", "mode": "always"},
                        {"nodeId": "edge", "sourceNodeId": "client", "mode": "always"},
                        {"nodeId": "auth", "sourceNodeId": "edge", "mode": "always"},
                        {"nodeId": "api", "sourceNodeId": "auth", "mode": "always"},
                        {"nodeId": "primary", "sourceNodeId": "api", "mode": "always"},
                        {"nodeId": "audit-queue", "sourceNodeId": "api", "mode": "async", "callsPerRequest": 1},
                        {"nodeId": "workers", "sourceNodeId": "audit-queue", "mode": "async", "callsPerRequest": 1},
                    ],
                    "focusMetrics": ["break-glass write latency", "audit durability lag", "auth failure rate", "primary utilization"],
                },
            ],
            "workloadProfiles": [
                {"id": "normal-ops", "label": "Normal tenant traffic", "endpointId": "privileged-read", "description": "Mostly healthy auth and read paths with routine audit fan-out.", "workload": {"rpm": 420000, "concurrency": 1700, "retries": 0}},
                {"id": "auth-abuse", "label": "Auth abuse burst", "endpointId": "privileged-write", "description": "Credential and admin-surface pressure increases auth load and audit events.", "workload": {"rpm": 90000, "concurrency": 650, "retries": 1}},
                {"id": "degraded-audit", "label": "Audit consumer slowdown", "endpointId": "privileged-read", "description": "Core reads continue while audit lag grows and operators must decide when to degrade.", "workload": {"rpm": 500000, "concurrency": 2000, "retries": 1}},
            ],
            "scriptTemplate": """workload('privileged-read', { rpm: 560000, concurrency: 2300, retries: 1 })
failure('auth', { extraLatencyMs: 18 })
node('audit-queue', { queueCapacity: 90000, capacityRps: 22000 })""",
        },
        "distributed-systems-lab": {
            "title": "Distributed systems lab simulator",
            "summary": "Exercise partition ownership, leadership movement, and workflow retries across a coordinated but still throughput-conscious topology.",
            "diagram": """node client type=edge label="Client requests" latencyMs=5 capacityRps=98000
node coordinator type=service label="Coordinator" latencyMs=10 capacityRps=26000
node cache type=cache label="Hot-owner cache" latencyMs=3 capacityRps=105000 queueCapacity=45000 hitRate=0.86
node leader type=service label="Current leader" latencyMs=16 capacityRps=9000
node replicas type=database label="Replicated followers" latencyMs=19 capacityRps=17000 queueCapacity=9000
node replication-queue type=queue label="Replication / workflow queue" latencyMs=11 capacityRps=30000 queueCapacity=150000
node workers type=worker label="Workflow workers" latencyMs=24 capacityRps=20000
link client -> coordinator
link coordinator -> cache
link coordinator -> leader
link leader -> replicas
link leader -> replication-queue async=true
link replication-queue -> workers async=true""",
            "apis": [
                {
                    "id": "owned-read-write",
                    "label": "POST /partitioned-resource",
                    "summary": "Ownership-aware write path that resolves leader, applies a fenced write, and emits async workflow work.",
                    "timeoutMs": 450,
                    "retries": 2,
                    "payloadKb": 2,
                    "stages": [
                        {"nodeId": "client", "mode": "always"},
                        {"nodeId": "coordinator", "sourceNodeId": "client", "mode": "always"},
                        {"nodeId": "cache", "sourceNodeId": "coordinator", "mode": "always", "kind": "cache", "hitRate": 0.86},
                        {"nodeId": "leader", "sourceNodeId": "coordinator", "mode": "always"},
                        {"nodeId": "replicas", "sourceNodeId": "leader", "mode": "always"},
                        {"nodeId": "replication-queue", "sourceNodeId": "leader", "mode": "async", "callsPerRequest": 0.8},
                        {"nodeId": "workers", "sourceNodeId": "replication-queue", "mode": "async", "callsPerRequest": 0.8},
                    ],
                    "focusMetrics": ["leader write p95", "stale-owner retries", "replica lag", "workflow backlog"],
                },
                {
                    "id": "ownership-refresh",
                    "label": "GET /owner-map",
                    "summary": "Control-plane read path that serves cached ownership metadata but falls back to the coordinator during churn.",
                    "timeoutMs": 220,
                    "retries": 1,
                    "payloadKb": 1,
                    "stages": [
                        {"nodeId": "client", "mode": "always"},
                        {"nodeId": "coordinator", "sourceNodeId": "client", "mode": "always"},
                        {"nodeId": "cache", "sourceNodeId": "coordinator", "mode": "always", "kind": "cache", "hitRate": 0.92},
                        {"nodeId": "leader", "sourceNodeId": "coordinator", "mode": "cache-miss"},
                    ],
                    "focusMetrics": ["ownership lookup p95", "cache hit ratio", "leader saturation", "metadata freshness"],
                },
            ],
            "workloadProfiles": [
                {"id": "steady-owned-writes", "label": "Steady owned writes", "endpointId": "owned-read-write", "description": "Healthy ownership resolution and moderate async follow-up work.", "workload": {"rpm": 210000, "concurrency": 900, "retries": 1}},
                {"id": "leader-churn", "label": "Leader churn", "endpointId": "ownership-refresh", "description": "Frequent owner changes stress cached metadata and stale-owner handling.", "workload": {"rpm": 600000, "concurrency": 2600, "retries": 1}},
                {"id": "retrying-workflow", "label": "Workflow retry storm", "endpointId": "owned-read-write", "description": "A downstream issue causes retries and a growing workflow backlog.", "workload": {"rpm": 260000, "concurrency": 1200, "retries": 2}},
            ],
            "scriptTemplate": """workload('owned-read-write', { rpm: 300000, concurrency: 1400, retries: 2 })
failure('leader', { extraLatencyMs: 14 })
node('cache', { hitRate: 0.68 })""",
        },
    }


def _validate(modules, interactive, deep_map, sims):
    assert len(modules) == 3
    assert set(sims.keys()) == {"data-storage-lab", "security-operations-lab", "distributed-systems-lab"}
    assert len(interactive) == 9
    assert len(deep_map) == 9

    lesson_ids = []
    for mod in modules:
        assert len(mod["objectives"]) == 3, mod["slug"]
        assert len(mod["lessons"]) == 3, mod["slug"]
        for les in mod["lessons"]:
            lesson_id = f"{mod['slug']}/{les['slug']}"
            lesson_ids.append(lesson_id)
            assert les["duration"] == "60-75 min", lesson_id
            assert len(les["sections"]) >= 6, lesson_id
            assert sum(len(sec["body"]) for sec in les["sections"]) >= 2800, lesson_id
            assert sum(1 for sec in les["sections"] if sec.get("codeExample")) >= 3, lesson_id
            assert len(les["checklist"]) >= 5, lesson_id
            assert len(les["pitfalls"]) >= 4, lesson_id
            assert len(les["interviewPrompts"]) >= 4, lesson_id
            assert len(les["likelyAnswerPoints"]) >= 4, lesson_id
            assert len(les["exercises"]) == 2, lesson_id
            assert {ex["type"] for ex in les["exercises"]} == {"design", "coding"}, lesson_id
            assert 3 <= len(les["related"]) <= 5, lesson_id
            for sec in les["sections"]:
                assert "\n\n" in sec["body"], (lesson_id, sec["heading"])
                assert len(sec["bullets"]) >= 3, (lesson_id, sec["heading"])
                if "codeExample" in sec:
                    assert {"title", "language", "code"} <= set(sec["codeExample"].keys()), (lesson_id, sec["heading"])

    assert set(lesson_ids) == set(interactive.keys()) == set(deep_map.keys())

    for lesson_id, lab in interactive.items():
        assert len(lab["takeaways"]) >= 3, lesson_id
        assert len(lab["examples"]) >= 2, lesson_id
        assert len(lab["decisionGuide"]["options"]) >= 2, lesson_id
        assert len(lab["caseStudy"]["steps"]) >= 4, lesson_id
        assert len(lab["caseStudy"]["metrics"]) >= 4, lesson_id
        assert lab["mermaid"]["code"], lesson_id
        for ex in lab["examples"]:
            assert len(ex["why"]) >= 3, lesson_id
        for opt in lab["decisionGuide"]["options"]:
            assert len(opt["chooseWhen"]) >= 3, lesson_id
            assert len(opt["tradeOffs"]) >= 3, lesson_id

    for lesson_id, entry in deep_map.items():
        assert len(entry["insights"]) == 4, lesson_id
        assert len(entry["references"]) == 3, lesson_id
        for ins in entry["insights"]:
            assert len(ins["bodyParagraphs"]) == 2, lesson_id

    for mod_slug, blueprint in sims.items():
        assert len(blueprint["apis"]) == 2, mod_slug
        assert len(blueprint["workloadProfiles"]) == 3, mod_slug
        assert blueprint["diagram"], mod_slug
        assert blueprint["scriptTemplate"], mod_slug


def build_all():
    modules = _build_modules()
    interactive = _build_interactive()
    deep_map = _build_deep_map()
    sims = _build_sims()
    _validate(modules, interactive, deep_map, sims)
    return modules, interactive, deep_map, sims
