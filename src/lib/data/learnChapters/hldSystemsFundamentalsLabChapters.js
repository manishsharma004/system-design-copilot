/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldSystemsFundamentalsLabChapters = {
  "systems-fundamentals-lab/request-lifecycle-deep-dive": {
    "title": "Workshop: Request lifecycle deep dive",
    "readingTime": "75-95 min",
    "premise": "This lab treats a single browser API call as a field instrument. You will map every hop that can steal milliseconds, build a p95 budget you can defend, and practice reading percentile shapes the way an on-call engineer does under pressure.",
    "parts": [
      {
        "id": "lab-briefing-and-instrument-setup",
        "heading": "Lab briefing: instrument one user journey",
        "paragraphs": [
          "Pick a concrete authenticated read—profile, order summary, or document metadata—and treat it as the entire workshop specimen. Write the user promise in one sentence, then translate it into a percentile goal such as p95 under 300 ms in the primary region for warm connections. Everything else in the chapter hangs from that promise: which hops matter, which dependencies can be optional, and which optimizations are distractions.",
          "Before drawing boxes, list the actors that can insert delay without your application code changing: DNS resolvers, TCP and TLS setup, CDN or edge proxies, load balancers, admission controls, worker queues, caches, databases, and response transfer on constrained networks. The workshop habit is to name an owner for each hop. If nobody owns DNS TTL or keep-alive policy, latency incidents will bounce between teams forever.",
          "Capture cold versus warm paths as two different experiments. A cold mobile request may pay DNS, TCP, and TLS before a single business byte moves; a warm HTTP/2 connection may skip that tax. If your SLO mixes both populations without labeling them, the dashboard will lie about whether the application is slow or the network path is cold."
        ],
        "keyTerms": [
          {
            "term": "Critical path",
            "definition": "The ordered work that must finish before the user sees a useful response."
          },
          {
            "term": "Cold connection",
            "definition": "A request that pays DNS, TCP, and TLS setup before application work begins."
          },
          {
            "term": "Warm connection",
            "definition": "A reused connection where setup cost has already been amortized."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Write the user promise and percentile target on a sticky note before you sketch topology. The sketch should serve the promise, not the reverse."
        },
        "checkYourself": [
          {
            "prompt": "Why separate cold and warm request budgets in a lab exercise?",
            "reveal": "They measure different systems. Cold budgets are dominated by connection setup and resolvers; warm budgets expose application, dependency, and transfer cost. Mixing them hides which remediation actually helps."
          }
        ]
      },
      {
        "id": "mapping-dns-to-response-bytes",
        "heading": "Map DNS through response bytes",
        "paragraphs": [
          "Walk the path in chronological order and annotate each hop with a typical and a stressed latency. DNS may be milliseconds when cached and tens of milliseconds when cold. TCP costs one round trip; TLS 1.3 usually costs another on a fresh handshake. Edge work can terminate TLS, run WAF rules, attach geo headers, or serve a cached object. Only then does a regional load balancer choose a target.",
          "Admission work sits between the network and scarce application capacity. Rate limits, body-size caps, authentication shortcuts, and circuit breakers decide which requests deserve a worker thread or a database connection. In overload, the fastest failure is often the safest: reject early so surviving capacity serves work that can still succeed.",
          "Inside the application, draw dependency calls as a graph. Mark sequential edges and parallel fans. The critical path length is the sum of sequential work plus the slowest parallel branch, plus serialization and transfer. Improving a five-millisecond cache call while a ninety-millisecond entitlement service sits on the critical path is busywork disguised as optimization."
        ],
        "keyTerms": [
          {
            "term": "Admission control",
            "definition": "Early rejection or shedding that protects scarce resources under overload."
          },
          {
            "term": "Fan-out",
            "definition": "Parallel dependency calls whose combined tail risk can exceed any single dependency's tail."
          },
          {
            "term": "Response transfer",
            "definition": "Time spent moving bytes to the client after the server is ready."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A handler that looks fast in local profiles can still feel slow if queue wait, pool wait, or transfer time never appear in application spans."
        },
        "checkYourself": [
          {
            "prompt": "What lower bound does a parallel fan-out set on latency?",
            "reveal": "Roughly the slowest required branch plus coordination overhead. Optional branches should be marked optional so they do not extend the critical path when they fail or lag."
          }
        ]
      },
      {
        "id": "worked-p95-budget-table",
        "heading": "Worked lab: build a p95 latency budget table",
        "paragraphs": [
          "A budget is a contract among teams, not a decorative spreadsheet. Allocate milliseconds to edge and load balancing, auth and validation, application orchestration, cache and database work, downstream calls, response transfer, and contingency. Contingency is mandatory: it absorbs garbage collection, noisy neighbors, packet loss, and measurement noise.",
          "Fill the table twice: once with planned allocations and once with measured or hypothesized p95 values. Any hop over budget is a product decision if you keep it, not an invisible implementation detail. If the database already spends its full allocation, adding another query is choosing to violate the user promise or to steal from contingency.",
          "Split budgets by region, client class, and cache-hit state when those populations behave differently. A single global average will declare victory while mobile users in a distant region burn the error budget."
        ],
        "workedExample": {
          "title": "Profile-read p95 budget worksheet",
          "body": "Fill planned versus measured columns for an authenticated profile read. Contingency is included in the target total.",
          "code": "budget_ms = {\n    \"edge_lb\": 25,\n    \"auth_validation\": 40,\n    \"app_orchestration\": 60,\n    \"db_cache\": 90,\n    \"downstream\": 40,\n    \"response_transfer\": 25,\n    \"contingency\": 20,\n}\nmeasured_p95_ms = {\n    \"edge_lb\": 19,\n    \"auth_validation\": 36,\n    \"app_orchestration\": 48,\n    \"db_cache\": 102,\n    \"downstream\": 51,\n    \"response_transfer\": 22,\n}\ntarget = sum(budget_ms.values())\nmeasured = sum(measured_p95_ms.values())\nprint(f\"{'hop':20} {'planned':>8} {'actual':>8} status\")\nfor hop, planned in budget_ms.items():\n    if hop == \"contingency\":\n        continue\n    actual = measured_p95_ms[hop]\n    status = \"OVER\" if actual > planned else \"ok\"\n    print(f\"{hop:20} {planned:8} {actual:8} {status}\")\nprint(\"target p95 including contingency:\", target, \"ms\")\nprint(\"measured without contingency:\", measured, \"ms\")\nprint(\"remaining headroom:\", target - measured, \"ms\")\n",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Walk the budget aloud: name the user promise, each hop owner, the over-budget lines, and the first remediation you would fund."
        },
        "checkYourself": [
          {
            "prompt": "Why keep explicit contingency in a latency budget?",
            "reveal": "Real systems have variance. Without contingency, a design that sums to exactly the SLO fails as soon as any hop jitters, which makes the SLO look stricter than the architecture can honestly support."
          }
        ]
      },
      {
        "id": "queueing-and-tail-multiplication",
        "heading": "Queueing delay and tail latency multiplication",
        "paragraphs": [
          "Much user-visible latency is wait time, not service time. Requests queue for accept sockets, worker threads, connection pools, locks, and saturated dependencies. Utilization curves are nonlinear: moving from 50 percent to 80 percent busy can multiply waiting far more than the utilization delta suggests. A CPU profile of a fast handler does not prove users are fast if admission is backed up.",
          "Distributed fan-out multiplies rare slowness into common pain. If a page needs twenty backend operations and each independently meets a 99 percent latency target, the chance that all twenty succeed on time is about 0.99^20, roughly 82 percent. Nearly one in five page views can see at least one slow hop while every service chart still looks green.",
          "Workshop practice: for your specimen endpoint, list every queue and every fan-out. Ask what happens if each queue saturates and what happens if each branch is slow. Then decide which work is required, which can be stale, which can be deferred after the response, and which can be precomputed."
        ],
        "keyTerms": [
          {
            "term": "Service time",
            "definition": "Time spent actually doing work once capacity is obtained."
          },
          {
            "term": "Wait time",
            "definition": "Time spent queued before work begins."
          },
          {
            "term": "Tail latency",
            "definition": "High-percentile latency that dominates user experience in fan-out systems."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Adding more web workers against an exhausted database pool often worsens queueing because more requests compete for the same scarce resource."
        },
        "checkYourself": [
          {
            "prompt": "How can p50 stay flat while p99 doubles?",
            "reveal": "A minority of requests may hit queueing, lock contention, slow dependencies, retries, or overloaded workers. Average or median metrics hide that shape; percentile and histogram views reveal it."
          }
        ]
      },
      {
        "id": "connection-reuse-and-payload-economics",
        "heading": "Connection reuse and payload economics",
        "paragraphs": [
          "Chatty APIs punish cold paths. Ten sequential small calls over fresh connections can feel worse than one larger response because each call repeats fixed setup and radio wakeups. Group data that is always needed together; lazy-load optional panels; keep connection pools with sane idle timeouts so servers do not thrash sockets under bursty traffic.",
          "Payload size is part of the lifecycle. Compression, pagination, field selection, and media placement change transfer time on mobile and cross-region links. A server that finishes in 40 ms can still miss a 300 ms budget if it ships a multi-megabyte JSON blob to a constrained client.",
          "In the lab, measure a cold and warm path with a representative payload, then again with a trimmed payload. Record which change moved the needle. Interview answers that never mention transfer or connection reuse are incomplete lifecycle answers."
        ],
        "callout": {
          "tone": "tip",
          "body": "Ask whether the product needs fewer requests, fewer bytes, or fewer round trips on the critical path. Those three levers are not interchangeable."
        },
        "checkYourself": [
          {
            "prompt": "When is combining endpoints a better latency fix than optimizing handler CPU?",
            "reveal": "When fixed per-request costs—DNS, TLS, auth, serialization headers, or radio wakeups—dominate, or when sequential chatty calls stack round trips on the critical path."
          }
        ]
      },
      {
        "id": "incident-debug-drill",
        "heading": "Incident drill: outside-in debugging sequence",
        "paragraphs": [
          "When latency moves, start outside and walk inward. Are all regions affected? Did errors, retries, or traffic volume change together? Inspect edge timing, load-balancer target time, application queue wait, dependency percentiles, database waits, and response sizes. Align clocks and correlation IDs so owners stop arguing past each other with incompatible definitions of fine.",
          "Use percentile shape as a diagnostic. Flat p50 with rising p99 suggests queueing, a small slow cohort, or retry storms. Rising p50 suggests uniform slowdown such as a bad deploy, larger payloads, or a dependency regression on every request. Cache-hit versus miss splits often explain sudden cliffs.",
          "Close the drill by naming the first three dashboards or traces you would open and the first mitigation you would try if the critical path dependency is the culprit: deadline tightening, fallback, shedding, or rollback. The lifecycle model earns its keep when it shortens time from symptom to action."
        ],
        "callout": {
          "tone": "interview",
          "body": "Narrate the debug order: population scope, percentile shape, hop breakdown, retry amplification, then mitigation that protects the user promise."
        },
        "checkYourself": [
          {
            "prompt": "Why investigate retry volume during a latency incident?",
            "reveal": "Retries can be both symptom and cause. They multiply load on an already stressed dependency, inflate observed latency, and can turn a small outage into a cascading failure."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "A request lifecycle is a critical path with owners, not a single handler timing.",
        "Cold and warm paths, queue wait, and transfer time often dominate user experience.",
        "Latency budgets turn percentiles into team contracts with contingency and ownership.",
        "Fan-out multiplies tail risk; mark optional work as optional.",
        "Outside-in debugging with percentile shape beats guessing inside one service."
      ],
      "nextSteps": [
        "Draw DNS through response for one real endpoint and label owners.",
        "Fill a planned-versus-measured p95 budget including contingency.",
        "List queues and fan-out branches, then mark required versus optional work."
      ]
    }
  },
  "systems-fundamentals-lab/capacity-cost-and-utilization": {
    "title": "Workshop: Capacity, cost, and utilization",
    "readingTime": "80-100 min",
    "premise": "Capacity planning is a bottleneck hunt with a price tag. This lab builds throughput, storage, utilization, and unit-cost models you can recalculate when traffic, hit ratio, or product features change—not a one-time napkin that dies in a slide deck.",
    "parts": [
      {
        "id": "bottleneck-first-framing",
        "heading": "Frame the lab around the first saturating resource",
        "paragraphs": [
          "Start with a workload sketch: requests per second, work per request, bytes read and written, and fan-out to dependencies. Convert that sketch into demand on CPU, memory, disk I/O, network egress, and connection pools. The useful output is not a single QPS number; it is a claim about which resource saturates first and what happens when it does.",
          "A feed service at 5,000 RPS with 3 ms CPU each needs about 15 CPU-seconds per second—roughly 20 cores after headroom. The same service sending 18 KB responses pushes about 90 MB/s egress. If cache hit ratio drops and misses slam storage, the bottleneck can move without any traffic growth. Capacity labs exist to catch that move before production does.",
          "Name the remediation family for each bottleneck: algorithm or batching for CPU, object size and eviction for memory, indexing or partitioning for disk, compression or CDN for network, pooling and shedding for connections. Architecture reviews that skip the resource model invent infrastructure that does not help."
        ],
        "keyTerms": [
          {
            "term": "Bottleneck",
            "definition": "The first resource whose saturation limits successful throughput."
          },
          {
            "term": "Headroom",
            "definition": "Spare capacity reserved for bursts, variance, and recovery work."
          },
          {
            "term": "Unit cost",
            "definition": "Marginal infrastructure cost attributable to one user action or request."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "End every estimate with a sentence: 'This design first runs out of X, so the next lever is Y.'"
        },
        "checkYourself": [
          {
            "prompt": "Why can capacity fail without traffic growth?",
            "reveal": "Work per request, hit ratios, payload sizes, or dependency fan-out can change the resource mix. The bottleneck moves even when RPS is flat."
          }
        ]
      },
      {
        "id": "utilization-variance-and-queueing",
        "heading": "Utilization, variance, and queueing curves",
        "paragraphs": [
          "Average utilization is a comfort metric that hides burst shape. A service at 70 percent average CPU can be fine with smooth arrivals and uniform work, or doomed if a push notification doubles traffic for three minutes while autoscaling is still warming. Size for the peak you must survive before new capacity is ready, not only for the monthly average.",
          "Work variance matters as much as arrival variance. If one percent of requests cost 100× the median, average CPU looks healthy while a small cohort saturates workers and connection pools. Measure high percentiles of service time and isolate heavy endpoints or tenants.",
          "Queueing theory intuition is enough for workshops: waiting time grows sharply as utilization approaches one. Leaving intentional headroom—often keeping steady-state well below the knee of the curve—is how you buy time for autoscaling, caches, and humans. Retry storms consume that headroom: a two percent dependency failure can become a much larger load increase if callers retry without budgets."
        ],
        "callout": {
          "tone": "warning",
          "body": "Autoscaling is not instant capacity. Include scale lag, warmup, and dependency pressure in the plan."
        },
        "checkYourself": [
          {
            "prompt": "What should a capacity plan include besides average RPS?",
            "reveal": "Peak-to-average ratio, work variance, scaling lag, failure-mode amplification such as retries, and the first resource that saturates under that combined stress."
          }
        ]
      },
      {
        "id": "capacity-table-lab",
        "heading": "Worked lab: throughput and instance capacity table",
        "paragraphs": [
          "Build a table with columns for RPS, CPU ms per request, required cores, chosen instance size, instances after headroom, and egress Mbps. Recalculate when you change hit ratio or add a dependency call. The point of the worksheet is sensitivity: which assumption, if wrong by 2×, breaks the plan first?",
          "Separate read and write paths when their costs differ. Background jobs and fan-out workers need their own rows; otherwise foreground capacity silently subsidizes batch work until an incident reveals the accounting error.",
          "Validate the table against a load test shape that includes bursts and a slow dependency. A plan that only passes smooth synthetic traffic is a hypothesis, not evidence."
        ],
        "workedExample": {
          "title": "10M-user feed capacity worksheet",
          "body": "Estimate cores and egress for a peak feed read workload, then apply headroom.",
          "code": "users = 10_000_000\ndaily_active_fraction = 0.25\npeak_to_avg = 3.0\nrequests_per_active_user_per_day = 40\ncpu_ms_per_request = 3.0\nresponse_kb = 18\nheadroom = 1.4  # 40% spare\n\nactive = users * daily_active_fraction\navg_rps = active * requests_per_active_user_per_day / 86400\npeak_rps = avg_rps * peak_to_avg\ncpu_cores_needed = peak_rps * (cpu_ms_per_request / 1000.0)\ncores_with_headroom = cpu_cores_needed * headroom\negress_mbps = peak_rps * response_kb * 8 / 1000.0\n\nprint(f\"avg RPS: {avg_rps:.0f}\")\nprint(f\"peak RPS: {peak_rps:.0f}\")\nprint(f\"CPU cores at peak: {cpu_cores_needed:.1f}\")\nprint(f\"cores with headroom: {cores_with_headroom:.1f}\")\nprint(f\"egress at peak: {egress_mbps:.0f} Mbps\")\n# Instance sketch: 8 vCPU boxes -> ceil(cores_with_headroom / 8)\nimport math\nprint(\"8-vCPU instances:\", math.ceil(cores_with_headroom / 8))\n",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Show the sensitivity: 'If hit ratio drops from 98% to 90%, storage I/O becomes the bottleneck before CPU.'"
        },
        "checkYourself": [
          {
            "prompt": "Why put background jobs on separate capacity rows?",
            "reveal": "They compete for the same CPU, pools, and I/O. Without separate accounting, batch spikes steal foreground headroom and create user-facing latency during catch-up."
          }
        ]
      },
      {
        "id": "storage-growth-and-multipliers",
        "heading": "Storage growth and cost multipliers",
        "paragraphs": [
          "Storage estimates need write rate, average object size, retention, indexes, replicas, and backups. A 1 KB logical record can become several kilobytes on disk after secondary indexes, replication factor, and snapshot retention. Ignoring multipliers produces a calm spreadsheet and an angry finance review six months later.",
          "Growth is often dominated by a few object types: media, event logs, or chat attachments. Separate hot and cold tiers early if access frequency falls with age. Compaction, TTL, and lifecycle policies are capacity features, not afterthoughts.",
          "Workshop exercise: estimate thirty days of growth for primary data, indexes at 1.5×, three replicas, and daily backups retained for seven days. Then ask which product change would cut the bill fastest: shorter retention, fewer indexes, cheaper cold storage, or less chatty write amplification."
        ],
        "keyTerms": [
          {
            "term": "Write amplification",
            "definition": "Extra bytes written beyond the logical user payload due to indexes, logs, or compaction."
          },
          {
            "term": "Retention policy",
            "definition": "How long data remains online before deletion or cold-tier transition."
          },
          {
            "term": "Replication factor",
            "definition": "Number of stored copies that multiply durable capacity needs."
          }
        ],
        "workedExample": {
          "title": "Monthly storage and rough cost model",
          "body": "Apply common multipliers to logical ingest to estimate billed storage.",
          "code": "logical_gb_per_day = 120\nindex_multiplier = 1.5\nreplica_factor = 3\nbackup_days = 7\nbackup_full_fraction = 1.0  # simplistic full-copy model\nusd_per_gb_month = 0.023\n\nprimary = logical_gb_per_day * 30 * index_multiplier * replica_factor\nbackups = logical_gb_per_day * index_multiplier * backup_days * backup_full_fraction\ntotal_gb = primary + backups\nprint(f\"primary+replicas GB: {primary:.0f}\")\nprint(f\"backup GB: {backups:.0f}\")\nprint(f\"total GB: {total_gb:.0f}\")\nprint(f\"approx monthly storage $: {total_gb * usd_per_gb_month:.0f}\")\n",
          "language": "python"
        },
        "callout": {
          "tone": "tip",
          "body": "Always state whether your GB numbers are logical payload or physical stored bytes after multipliers."
        },
        "checkYourself": [
          {
            "prompt": "Name three multipliers that turn a 1 KB record into much more stored data.",
            "reveal": "Secondary indexes, replication copies, and backup or snapshot retention are common; WAL, compaction overhead, and encoding can add more."
          }
        ]
      },
      {
        "id": "unit-economics-and-load-shedding",
        "heading": "Unit economics and intentional load shedding",
        "paragraphs": [
          "Unit cost connects architecture to product scale. If one request costs CPU, a database read, cache writes, and egress, multiply by a million and ask whether a feature that adds one external call still looks cheap. Track cost by user action, tenant, media type, or job class so regressions have owners.",
          "Useful controls preserve value while cutting waste: precompute shared answers, cache within freshness budgets, batch writes when overhead dominates, compress when egress dominates, move cold data down-tier. Reserved capacity lowers predictable baseline cost but must not hide inefficient paths.",
          "When demand exceeds capacity, accepting everything can reduce successful throughput. Selective shedding protects health checks and checkout while dropping optional recommendations, anonymous scraping, or background refresh. At 150 percent load, the goal is bounded latency and a predictable fraction of useful work—not zero errors."
        ],
        "callout": {
          "tone": "interview",
          "body": "Tie cost and reliability: explain how shedding and caching both protect user-visible success under overload while changing unit economics."
        },
        "checkYourself": [
          {
            "prompt": "Why can serving a fast 429 be better than attempting every request?",
            "reveal": "Work abandoned after client timeout still consumes CPU and pools. Early rejection preserves capacity for requests that can still succeed within deadlines."
          }
        ]
      },
      {
        "id": "capacity-review-checklist",
        "heading": "Lab closeout: capacity review checklist",
        "paragraphs": [
          "Present your worksheet as a design review: workload assumptions, bottleneck claim, headroom policy, storage multipliers, unit-cost drivers, and overload behavior. Invite someone to attack the most fragile assumption. Update the numbers live when they do.",
          "Define the signals that prove the plan in production: utilization and saturation for the claimed bottleneck, queue depth, shed rate, cost per successful request, and error-budget burn during peaks. Capacity without telemetry is fiction.",
          "Schedule a revisit trigger: traffic +50 percent, new media feature, hit-ratio drop, or region expansion. Living documents beat heroic re-estimates after outages."
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not ship a capacity plan that has no owner for the first saturation alarm."
        },
        "checkYourself": [
          {
            "prompt": "What makes a capacity plan 'live' rather than a slide artifact?",
            "reveal": "Named revisit triggers, production signals tied to the bottleneck claim, and an owner who updates assumptions when product or traffic changes."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Capacity estimates should name the first saturating resource and the next lever.",
        "Headroom must cover burst shape, work variance, scale lag, and retry amplification.",
        "Storage and cost models need indexes, replicas, backups, and unit drivers.",
        "Selective load shedding preserves successful throughput under overload.",
        "Plans stay honest only when telemetry and revisit triggers exist."
      ],
      "nextSteps": [
        "Build a peak RPS and core-count worksheet with headroom for one service.",
        "Apply storage multipliers for thirty days of growth including backups.",
        "Write a shedding priority list for 150 percent load."
      ]
    }
  },
  "systems-fundamentals-lab/designing-for-evolution": {
    "title": "Workshop: Designing for evolution",
    "readingTime": "70-90 min",
    "premise": "Systems that cannot change safely become product bottlenecks. This lab practices compatible contracts, expand-contract migrations, flag-controlled rollouts, and strangler slices so evolution is a designed path—not a rewrite fantasy.",
    "parts": [
      {
        "id": "compatibility-as-a-promise",
        "heading": "Treat compatibility as a client promise",
        "paragraphs": [
          "Clients do not upgrade on your schedule. Additive changes—new fields, optional parameters, new event attributes—are usually safe when readers ignore unknowns. Breaking changes rename meaning, narrow allowed values, or make optional data required. Semantic breaks are the dangerous ones: a status value that quietly changes meaning can corrupt analytics without a parse error.",
          "Design protocols for overlap. Writers should not require immediate reader adoption; readers should tolerate unknowns; defaults for missing fields must be documented. For events, never recycle a field name for a new meaning—add a version or a new event type. Version APIs only when behavior cannot remain compatible.",
          "Workshop prompt: take an orders API and list five additive extensions that leave old mobile clients working, then list three changes that look cosmetic but break semantics. That list becomes your team's compatibility checklist."
        ],
        "keyTerms": [
          {
            "term": "Additive change",
            "definition": "An extension that old clients can ignore without changing meaning."
          },
          {
            "term": "Breaking change",
            "definition": "A modification that invalidates old clients' assumptions about shape or meaning."
          },
          {
            "term": "Tolerant reader",
            "definition": "A consumer that ignores unknown fields and handles missing optional data via documented defaults."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Prefer needing fewer versions by leaving room in the original contract for growth."
        },
        "checkYourself": [
          {
            "prompt": "Why is renaming a field riskier than adding a new field?",
            "reveal": "Old writers and readers still emit or expect the old name. Unless both sides dual-support during overlap, you create silent data loss or hard failures across staggered deploys."
          }
        ]
      },
      {
        "id": "expand-contract-migrations",
        "heading": "Expand-contract migrations as reversible steps",
        "paragraphs": [
          "Safe migrations separate adding the new shape from removing the old one. Expand: add nullable columns or tables. Dual-write: deploy code that writes both forms. Backfill history. Shift reads behind a flag. Stop writing the old form. Delete only after observation and rollback windows expire. Each step should be reversible or at least observable.",
          "The same pattern applies to services and events. To split billing from orders, publish both old and new events, compare counts, shadow-consume, and move downstreams one at a time. Big-bang cutovers fail because code, data, caches, clients, and dashboards rarely flip together.",
          "Lab exercise: write the six-step sequence for moving `customerName` into a structured `customer` object on an orders table. For each step, name the metric that proves it worked and the rollback that undoes it."
        ],
        "workedExample": {
          "title": "Expand-contract sequence checklist",
          "body": "A concrete dual-write wrapper sketch for an orders field migration.",
          "code": "def save_order(order, store, flag_dual_write=True, flag_read_new=False):\n    # Expand already added nullable customer_json.\n    store.write_legacy_columns(order)\n    if flag_dual_write:\n        store.write_customer_json(order.to_customer_object())\n    if flag_read_new:\n        # Prefer new shape after backfill parity checks pass.\n        return store.read_using_customer_json(order.id)\n    return store.read_using_legacy_columns(order.id)\n\n# Rollback: set flag_read_new=False, keep dual-write until safe.\n# Delete legacy columns only after write_legacy is off and lag is zero.\n",
          "language": "python"
        },
        "callout": {
          "tone": "warning",
          "body": "Temporary duplication is a feature of safe migration. Permanent duplication without an exit plan is accidental architecture."
        },
        "checkYourself": [
          {
            "prompt": "What should you measure during dual-write overlap?",
            "reveal": "Parity between old and new forms: row counts, checksum samples, consumer lag, and error rates on both read paths before cutting readers over."
          }
        ]
      },
      {
        "id": "feature-flags-as-control-plane",
        "heading": "Feature flags as a runtime control plane",
        "paragraphs": [
          "Flags separate deployment from release. Release flags ramp exposure. Ops flags disable risky dependencies during incidents. Experiment flags assign users consistently. Mixing those lifetimes into one untracked boolean pile creates permanent complexity.",
          "A good flag has a name tied to behavior, a default, an owner, an expiration, and telemetry for exposure. Evaluate at stable boundaries: user ID for UX, tenant ID for enterprise rollout. Avoid flags that change database semantics mid-transaction unless both paths are compatible.",
          "Delete release flags after rollout. Evolution needs temporary branches; maintainability needs pruning. Workshop: inventory five flags in a fictional checkout service and classify each as release, ops, or experiment—with a kill date for the release ones."
        ],
        "keyTerms": [
          {
            "term": "Release flag",
            "definition": "A temporary switch that ramps new behavior independently of deploy."
          },
          {
            "term": "Ops flag",
            "definition": "A kill switch for degrading or disabling a risky path during incidents."
          },
          {
            "term": "Flag exposure",
            "definition": "Telemetry showing who evaluated a flag and which variant they received."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Explain how flags make expand-contract safer: deploy dark, dual-write, shift reads, then delete the flag and the old path."
        },
        "checkYourself": [
          {
            "prompt": "Why give release flags expiration dates?",
            "reveal": "Without expiration and owners, flags accumulate into permanent conditional complexity and unknown production behavior."
          }
        ]
      },
      {
        "id": "strangler-slices",
        "heading": "Strangler slices that retire real complexity",
        "paragraphs": [
          "The strangler pattern replaces legacy capability one route, workflow, or data slice at a time. Place a facade or router in front, send a narrow case to the new implementation, compare outputs, and expand when confidence grows. Keep the product running throughout.",
          "Choose slices that are small enough to verify and meaningful enough to retire complexity: by geography, endpoint, entity type, or traffic percentage. Bad slices share unclear database ownership with no rollback boundary, leaving two systems forever.",
          "Include observability, reconciliation, and an exit plan for the legacy path in the first slice, not the last. Workshop: propose the first three slices to strangler a booking monolith—search reads, reservation create for one region, then cancellations—and name the comparison metric for each."
        ],
        "callout": {
          "tone": "tip",
          "body": "A slice is done only when the legacy path for that slice can be turned off without ceremony."
        },
        "checkYourself": [
          {
            "prompt": "What makes a strangler slice 'bad'?",
            "reveal": "It shares mutable storage with unclear ownership, lacks parity checks, and has no rollback boundary—so risk expands instead of shrinking."
          }
        ]
      },
      {
        "id": "deprecation-and-communication",
        "heading": "Deprecation signals and client communication",
        "paragraphs": [
          "Evolution fails socially when clients never hear the plan. Publish deprecation timelines, response headers or warning fields, migration guides, and dashboarding of old-path usage. You cannot delete what you cannot see.",
          "Prefer simultaneous support windows sized to real client upgrade cadence—mobile app stores move slowly. Internal services can move faster if you control deploys, but still measure callers.",
          "Lab closeout: draft a deprecation notice for an old list-orders query parameter, including sunset date, dual-support behavior, metrics you will watch, and the hard-fail date."
        ],
        "workedExample": {
          "title": "HTTP deprecation signal sketch",
          "body": "Signal an upcoming removal while keeping the old parameter working during overlap.",
          "code": "HTTP/1.1 200 OK\nDeprecation: true\nSunset: Sat, 01 Nov 2026 00:00:00 GMT\nLink: <https://api.example.com/docs/orders-v2>; rel=\"successor-version\"\nWarning: 299 - \"Query param 'customer_name' is deprecated; use 'customer.id'\"\n\n# Still return data shaped for old clients until Sunset.\n",
          "language": "http"
        },
        "callout": {
          "tone": "warning",
          "body": "Silence is not a migration strategy. If old-path traffic is invisible, the cutover date is fiction."
        },
        "checkYourself": [
          {
            "prompt": "What evidence justifies deleting an old API path?",
            "reveal": "Sustained near-zero usage, successful dual-support window, migrated critical clients, and a monitored rollback plan if residual traffic appears."
          }
        ]
      },
      {
        "id": "evolution-design-review",
        "heading": "Design review: evolve without freezing delivery",
        "paragraphs": [
          "Present an evolution plan as you would in a real review: compatibility rules, migration sequence, flag strategy, strangler slices, and deprecation communications. Explicitly list what you are deferring—global rewrite, perfect schema purity, or immediate deletion—and why deferral is safe.",
          "Tie evolution to reliability: dual-write increases load; flags add paths to test; stranglers add routing complexity. Budget that cost in capacity and SLO plans rather than surprising on-call later.",
          "The durable skill is leaving seams: stable external IDs, tolerant contracts, replayable events, and indirection between logical resources and physical placement. Seams make the next migration boring, which is the goal."
        ],
        "callout": {
          "tone": "interview",
          "body": "Say what you would defend now, what you would leave temporary, and what evidence retires the temporary path."
        },
        "checkYourself": [
          {
            "prompt": "How does designing for evolution reduce rewrite pressure?",
            "reveal": "Compatible contracts and incremental migration paths let teams change internals under continuous delivery instead of accumulating irreversible coupling until only a rewrite seems possible."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Compatibility is a semantic promise to clients on staggered upgrade clocks.",
        "Expand-contract migrations make each step observable and preferably reversible.",
        "Flags are a control plane with owners, telemetry, and deletion deadlines.",
        "Strangler slices must retire real complexity with parity and rollback boundaries.",
        "Deprecation needs usage metrics and client communication, not hope."
      ],
      "nextSteps": [
        "Write an expand-contract sequence for one schema change with metrics and rollbacks.",
        "Classify five flags by type and assign kill dates to release flags.",
        "Propose strangler slices for one legacy workflow with comparison checks."
      ]
    }
  }
};
