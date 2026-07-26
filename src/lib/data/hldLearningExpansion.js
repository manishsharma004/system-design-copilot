export const rawHldLearningModules = [
  {
    slug: 'systems-fundamentals-lab',
    title: 'Systems fundamentals lab',
    summary:
      'Build durable intuition for how requests move through real systems, how capacity turns into cost, and how architecture choices leave room for change.',
    objectives: [
      'Trace a browser API request across network, edge, application, and storage layers',
      'Estimate throughput, storage growth, utilization, and operating cost with practical back-of-the-envelope math',
      'Design interfaces and migrations that let a system evolve without freezing product delivery'
    ],
    lessons: [
      {
        slug: 'request-lifecycle-deep-dive',
        title: 'Request lifecycle deep dive',
        summary:
          'Follow a browser request from DNS lookup through TLS, load balancing, application code, and database access so latency stops feeling mysterious.',
        duration: '55-70 min',
        whyItMatters:
          'Good system design starts with the real critical path. When you know where a request spends time, you can debug latency, choose the right optimization, and avoid adding infrastructure that does not help the user.',
        sections: [
          {
            heading: 'The full browser-to-database path',
            body: `A request starts when the browser turns a name such as api.example.com into an address. If the answer is cached in the browser, OS, resolver, or CDN edge, DNS can take 0-5 ms; if the resolver must walk authoritative servers, 20-80 ms is common on a healthy network. The browser then opens or reuses a TCP connection, negotiates TLS, sends HTTP headers and the request body, and waits for the first byte. A cold TCP plus TLS 1.3 connection often costs two round trips before application work begins, so a user 40 ms from the edge can spend about 80 ms just getting a protected connection ready.

This matters in production because many latency incidents are outside the handler that engineers first inspect. A low DNS TTL can amplify resolver traffic during an outage, a missing keep-alive setting can force every mobile request through a new handshake, and a certificate or OCSP issue can look like random client slowness. Strong designs account for the path DNS -> TCP -> TLS -> load balancer -> app -> database -> response instead of pretending the load balancer is the beginning of the system.`,
            bullets: [
              'Separate first-request latency from warm-connection latency when setting performance goals.',
              'Account for DNS caching, TCP setup, TLS negotiation, edge routing, application work, database time, and response transfer.',
              'Treat mobile and cross-region users as first-class because each extra round trip hurts them more.'
            ],
            codeExample: {
              title: 'Cold versus warm connection budget',
              language: 'bash',
              languageLabel: 'Bash / arithmetic',
              code: [
                '# Assume a user is 40 ms round-trip-time from the nearest edge.',
                'RTT_MS=40',
                'DNS_CACHED_MS=3',
                'DNS_COLD_MS=45',
                '',
                '# TCP costs 1 RTT. TLS 1.3 usually costs 1 RTT. HTTP/2 request uses the ready connection.',
                'COLD_CONNECT_MS=$((RTT_MS + RTT_MS))',
                'WARM_CONNECT_MS=0',
                '',
                'APP_AND_DB_MS=105',
                'RESPONSE_TRANSFER_MS=20',
                '',
                'cold_total=$((DNS_COLD_MS + COLD_CONNECT_MS + APP_AND_DB_MS + RESPONSE_TRANSFER_MS))',
                'warm_total=$((DNS_CACHED_MS + WARM_CONNECT_MS + APP_AND_DB_MS + RESPONSE_TRANSFER_MS))',
                '',
                'echo "cold request ~= ${cold_total} ms"',
                'echo "warm reused-connection request ~= ${warm_total} ms"',
                'echo "connection reuse saves ~= $((cold_total - warm_total)) ms in this path"'
              ].join('\n')
            }
          },
          {
            heading: 'Edge, load balancer, and admission work',
            body: `After the connection is ready, the request usually lands at an edge tier before an application process sees it. A CDN may terminate TLS, serve cached content, enforce WAF rules, attach geo headers, or forward the request to a regional load balancer. The load balancer then chooses a target based on health checks, least outstanding requests, weighted routing, consistent hashing, or another policy. Each choice affects reliability as much as speed: routing to a warm healthy instance is fast, while routing to an overloaded instance creates queue time that application logs may not explain.

Production systems also need admission control. If 20,000 clients retry at once after a network blip, a load balancer that blindly forwards all retries can turn a short dependency timeout into a fleet-wide incident. Rate limits, request body caps, circuit breakers, and retry budgets protect the app by rejecting or shedding work early. The right question in design interviews is not only "How do we balance traffic?" but also "Which traffic should not be admitted when the system is stressed?"`,
            bullets: [
              'Place WAF, authentication shortcuts, rate limits, and body-size enforcement before scarce application resources.',
              'Use health checks that prove the instance can serve real work, not only that the process is listening.',
              'Watch load-balancer queue time and target error rates separately from handler latency.'
            ]
          },
          {
            heading: 'Application critical path and hidden dependencies',
            body: `Inside the app, latency is the sum of CPU work, queue time, and dependency calls. A simple "get profile" endpoint may validate a token, load user settings from cache, read the profile row, call a feature entitlement service, fetch counts from a search system, and serialize JSON. Some calls run in parallel, but others are sequential because one result is needed to form the next request. The sequential portion is the critical path and sets a lower bound on response time.

This matters because adding a microservice or a database index can move the bottleneck without improving the user-visible path. If auth is 18 ms, cache is 4 ms, database is 38 ms, and a downstream service is 90 ms, optimizing 4 ms of JSON serialization will not rescue p95. A useful production review draws the dependency graph, marks which calls are parallel, and asks what happens when each dependency is slow, unavailable, or returning partial data.`,
            bullets: [
              'Draw dependency calls as a graph and mark parallel versus sequential work.',
              'Measure connection-pool wait, thread-pool wait, and queue wait because they are often absent from business logs.',
              'Prefer removing a dependency from the critical path over shaving a few milliseconds from noncritical work.'
            ],
            codeExample: {
              title: 'Critical path from sequential and parallel calls',
              language: 'javascript',
              code: [
                'const requestPath = {',
                '  edge: 12,',
                '  auth: 18,',
                '  appValidation: 6,',
                '  parallelReads: {',
                '    profileDb: 42,',
                '    settingsCache: 5,',
                '    entitlementService: 31',
                '  },',
                '  serializeAndCompress: 11',
                '};',
                '',
                'const parallelReadCost = Math.max(...Object.values(requestPath.parallelReads));',
                'const totalMs = requestPath.edge +',
                '  requestPath.auth +',
                '  requestPath.appValidation +',
                '  parallelReadCost +',
                '  requestPath.serializeAndCompress;',
                '',
                'console.log({ parallelReadCost, totalMs });',
                '// Output: { parallelReadCost: 42, totalMs: 89 }',
                '// Improving the 5 ms cache call does not change the critical path.'
              ].join('\n')
            }
          },
          {
            heading: 'Worked p95 latency budget',
            body: `A latency budget starts with a user promise. Suppose the product promise is "profile loads feel instant," translated into p95 <= 300 ms for authenticated reads in the primary region. A reasonable first budget might be 25 ms edge and load balancer, 40 ms auth and request validation, 70 ms application orchestration, 90 ms database and cache work, 35 ms downstream calls, 20 ms response serialization and transfer, and 20 ms contingency. The contingency is not decoration; it absorbs noisy neighbors, garbage collection, packet loss, and normal measurement variance.

The budget changes how teams make decisions. If the database is already using 88 of its 90 ms p95 allocation, adding another query to that path is a product decision, not a harmless implementation detail. If the app tier uses only 25 of 70 ms, optimizing it may not matter until database or downstream time is addressed. In production, budgets should be reviewed with real percentiles, split by endpoint, region, client type, and cache-hit state.`,
            bullets: [
              'Start with p95 or p99 user goals, then split the budget across hops that teams can own.',
              'Track actual latency against budget by endpoint and dependency instead of only reporting total latency.',
              'Keep explicit contingency so the design survives normal jitter and small regressions.'
            ],
            codeExample: {
              title: 'Checking a latency budget with measured p95s',
              language: 'python',
              code: [
                'budget_ms = {',
                '    "edge_lb": 25,',
                '    "auth_validation": 40,',
                '    "app_orchestration": 70,',
                '    "db_cache": 90,',
                '    "downstream": 35,',
                '    "response_transfer": 20,',
                '    "contingency": 20,',
                '}',
                '',
                'measured_p95_ms = {',
                '    "edge_lb": 18,',
                '    "auth_validation": 37,',
                '    "app_orchestration": 52,',
                '    "db_cache": 96,',
                '    "downstream": 44,',
                '    "response_transfer": 17,',
                '}',
                '',
                'target = sum(budget_ms.values())',
                'measured = sum(measured_p95_ms.values())',
                'remaining = target - measured',
                '',
                'for hop, actual in measured_p95_ms.items():',
                '    planned = budget_ms[hop]',
                '    status = "over" if actual > planned else "ok"',
                '    print(f"{hop:18} actual={actual:3} planned={planned:3} {status}")',
                '',
                'print("target p95:", target, "ms")',
                'print("measured p95 without contingency:", measured, "ms")',
                'print("remaining including contingency:", remaining, "ms")'
              ].join('\n')
            }
          },
          {
            heading: 'Production debugging sequence',
            body: `When latency moves, debug from the outside in. First ask whether users in all regions see the same change and whether errors, retries, or traffic volume changed at the same time. Then inspect edge timing, load-balancer target response time, application queue time, dependency p95/p99, database waits, and response sizes. If p50 is steady but p99 doubles, suspect queueing, lock contention, a small set of slow dependencies, retry storms, or overloaded workers rather than a uniform code slowdown.

The production value of a request-lifecycle mental model is speed under pressure. During an incident, teams waste time when every owner says "our service looks fine" using a different definition of fine. A shared lifecycle lets responders line up timestamps and ask where the missing time enters the path. The answer may be a bad deploy, but it may also be DNS resolver trouble, TLS handshakes after connection reuse broke, a load balancer draining too many instances, or a database lock that only appears under peak concurrency.`,
            bullets: [
              'Compare p50, p95, and p99; different percentile shapes point to different failure modes.',
              'Break latency down by region, client, endpoint, cache hit, target instance, and dependency.',
              'Investigate retry volume because retries can be both symptom and cause of overload.'
            ]
          }
        ],
        checklist: [
          'Draw DNS -> TCP -> TLS -> load balancer -> app -> database -> response for a real endpoint.',
          'Estimate cold and warm request latency separately, including round trips and response transfer.',
          'Identify which calls are sequential and which are parallel on the application critical path.',
          'Create a p95 or p99 latency budget with explicit contingency and ownership per hop.',
          'Name the first three dashboards or traces you would inspect when tail latency increases.',
          'Explain how retries, queueing, and connection reuse change the path during production load.'
        ],
        pitfalls: [
          'Treating the application handler as the whole request and ignoring DNS, TCP, TLS, edge, and load-balancer behavior.',
          'Optimizing average latency while p95 or p99 users are hurt by queueing and dependency outliers.',
          'Adding retries without timeouts, jitter, and retry budgets, causing overload to multiply.',
          'Using one latency number for every region, client, endpoint, and cache state.',
          'Ignoring payload size and response transfer time on mobile or cross-region paths.'
        ],
        interviewPrompts: [
          'Teach back what happens when a browser calls a REST API over HTTPS, from DNS through database response.',
          'Walk through a 300 ms p95 latency budget for a read endpoint and defend each allocation.',
          'Explain where you would look first if p99 latency doubled while p50 stayed flat.',
          'Describe how connection reuse, CDN caching, and load-balancer health checks change the request lifecycle.'
        ],
        exercises: [
          {
            id: 'profile-request-path-budget',
            title: 'Design a latency budget for profile reads',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Create a request-path diagram and p95 budget for an authenticated profile API used by mobile clients in two regions.',
            promptQuestions: [
              'Which hops exist before application code runs, and which team or system owns each hop?',
              'What budget would you allocate to DNS, connection setup, edge, app, dependencies, database, and response transfer?',
              'Which measurements prove whether cold requests and warm requests meet different targets?',
              'How would the design degrade if the entitlement service is slow but profile data is available?'
            ],
            hints: [
              'Call out DNS cache state, connection reuse, and regional distance.',
              'Use p95 or p99, not average latency.',
              'Separate core profile data from optional enrichments.'
            ]
          },
          {
            id: 'latency-budget-calculator',
            title: 'Calculate request path headroom',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Fill in the missing hop values and print whether the endpoint fits within a 300 ms p95 budget.',
            starterCode: [
              'target_ms = 300',
              'hops = {',
              '    "dns": 8,',
              '    "tcp_tls": 0,  # warm connection',
              '    "edge_lb": 18,',
              '    "auth": 32,',
              '    "app": None,',
              '    "db": 84,',
              '    "response": 21,',
              '}',
              '',
              '# TODO: set app to 57 ms, compute total, and print headroom.',
              '# TODO: repeat with tcp_tls=80 for a cold connection.'
            ].join('\n'),
            solution: [
              'target_ms = 300',
              'hops = {',
              '    "dns": 8,',
              '    "tcp_tls": 0,',
              '    "edge_lb": 18,',
              '    "auth": 32,',
              '    "app": 57,',
              '    "db": 84,',
              '    "response": 21,',
              '}',
              '',
              'def report(label, values):',
              '    total = sum(values.values())',
              '    print(label, "total=", total, "headroom=", target_ms - total)',
              '',
              'report("warm", hops)',
              'cold = {**hops, "tcp_tls": 80}',
              'report("cold", cold)'
            ].join('\n'),
            expectedOutput:
              'Warm requests have 80 ms of headroom; cold requests spend that headroom on connection setup and land exactly at 300 ms.'
          }
        ],
        diagram: null,
        related: [
          'dns',
          'load-balancing',
          'api-gateway',
          'latency-and-throughput',
          'caching-layers'
        ]
      },
      {
        slug: 'capacity-cost-and-utilization',
        title: 'Capacity, cost, and utilization',
        summary:
          'Turn QPS, object size, retention, and growth assumptions into capacity plans that explain performance risk and cloud spend.',
        duration: '60-75 min',
        whyItMatters:
          'Capacity planning is the bridge between architecture diagrams and operating reality. It helps you avoid both fragile under-provisioning and expensive overbuilding.',
        sections: [
          {
            heading: 'Start with product behavior, not server counts',
            body: `A capacity estimate begins with users and actions. Suppose a product has 10 million registered users, 2 million daily active users, and each active user opens the app 5 times per day. If each session loads a home feed once, fetches 8 pages of content, sends 2 writes, and triggers 6 background notification or ranking events, the system is not "2 million users"; it is a set of read, write, fan-out, and async workloads with different resource profiles.

The production reason to model behavior first is that every multiplier hides a future incident. A push campaign can synchronize sessions into a 10-minute spike, retries can double write traffic, and fan-out can turn one user action into hundreds of queue messages. Interview estimates are rough, but the shape should be explicit: daily volume, average QPS, peak multiplier, read/write split, payload size, and which paths are synchronous.`,
            bullets: [
              'Convert users -> daily active users -> sessions -> actions -> reads, writes, and async jobs.',
              'Use peak-to-average multipliers instead of sizing only for daily averages.',
              'Separate synchronous user-facing QPS from background work that can be queued or smoothed.'
            ]
          },
          {
            heading: 'Worked 10M-user QPS estimate',
            body: `For a 10 million user consumer app, assume 20 percent are daily active: 2 million DAU. Each DAU creates 5 sessions, each session performs 10 read requests and 2 write requests, and background systems create 6 async jobs per session. That gives 100 million reads/day, 20 million writes/day, and 60 million jobs/day. Dividing by 86,400 seconds gives about 1,157 average read QPS, 231 average write QPS, and 694 average job QPS.

Average is not the capacity target. If 25 percent of daily traffic arrives in the busiest hour, read QPS becomes 25 million / 3,600 = 6,944 before retries. Add a 1.3 retry/refresh factor and the read path should be comfortable around 9,000 QPS. If the service target is 60 percent CPU at peak and one instance can safely serve 250 read QPS at that utilization, the read fleet needs 36 instances plus failure headroom. That is the kind of math that turns a vague design into an operable plan.`,
            bullets: [
              'Average QPS = daily operations / 86,400, but peak QPS often uses busiest-hour or event multipliers.',
              'Instance count = peak QPS / safe QPS per instance, then add zone, deploy, and failure headroom.',
              'Use separate estimates for reads, writes, jobs, and fan-out because one bottleneck rarely covers all paths.'
            ],
            codeExample: {
              title: '10M-user throughput and instance estimate',
              language: 'python',
              code: [
                'users = 10_000_000',
                'dau_ratio = 0.20',
                'sessions_per_dau = 5',
                'reads_per_session = 10',
                'writes_per_session = 2',
                'jobs_per_session = 6',
                '',
                'dau = users * dau_ratio',
                'sessions = dau * sessions_per_dau',
                'daily_reads = sessions * reads_per_session',
                'daily_writes = sessions * writes_per_session',
                'daily_jobs = sessions * jobs_per_session',
                '',
                'avg_read_qps = daily_reads / 86_400',
                'busy_hour_fraction = 0.25',
                'peak_read_qps = daily_reads * busy_hour_fraction / 3_600',
                'retry_factor = 1.30',
                'planned_read_qps = peak_read_qps * retry_factor',
                '',
                'safe_qps_per_instance = 250',
                'failure_headroom = 1.20',
                'instances = planned_read_qps / safe_qps_per_instance * failure_headroom',
                '',
                'print(f"DAU: {dau:,.0f}")',
                'print(f"avg read QPS: {avg_read_qps:,.0f}")',
                'print(f"planned peak read QPS: {planned_read_qps:,.0f}")',
                'print(f"read instances with headroom: {instances:.1f}")'
              ].join('\n')
            }
          },
          {
            heading: 'Storage, indexes, replicas, and retention',
            body: `Storage estimates need more than the primary object size. If each write creates a 2 KB event, 20 million writes/day creates about 40 GB/day of raw event data. With a primary index, two secondary indexes, compression, and replication, the billable storage may be 2-5 times the raw number. Backups, change streams, analytics exports, and logs often grow faster than transactional data because they retain versions and debugging context.

Retention is an architecture choice. Keeping 365 days of hot indexed events at 40 GB/day is roughly 14.6 TB raw before replicas and indexes; keeping 30 days hot and moving the rest to cheaper object storage can cut cost while preserving auditability. In production, storage pressure shows up as cost, slower queries, longer backups, and harder restores. A good plan names hot, warm, and cold tiers and explains what queries each tier must serve.`,
            bullets: [
              'Raw storage = writes per day * average serialized bytes * retention days.',
              'Billable storage includes indexes, replicas, backups, WAL/change logs, analytics copies, and observability data.',
              'Hot retention should match online query needs; long-term retention can often move to cheaper tiers.'
            ],
            codeExample: {
              title: 'Storage and monthly cost with multipliers',
              language: 'python',
              code: [
                'writes_per_day = 20_000_000',
                'event_kb = 2',
                'retention_days = 365',
                'index_multiplier = 1.8',
                'replication_factor = 3',
                'backup_multiplier = 1.25',
                'cost_per_gb_month = 0.18',
                '',
                'raw_gb = writes_per_day * event_kb / 1024 / 1024 * retention_days',
                'billable_gb = raw_gb * index_multiplier * replication_factor * backup_multiplier',
                'monthly_cost = billable_gb * cost_per_gb_month',
                '',
                'print(f"raw retained data: {raw_gb:,.0f} GB")',
                'print(f"billable storage estimate: {billable_gb:,.0f} GB")',
                'print(f"storage cost/month: ${monthly_cost:,.0f}")'
              ].join('\n')
            }
          },
          {
            heading: 'Utilization and queueing risk',
            body: `Utilization tells you how busy a resource is, but the safe target depends on variance and recovery time. A stateless API with fast autoscaling may run at 55-70 percent CPU during peak; a latency-sensitive database with uneven query cost may need lower average CPU because lock waits, buffer cache misses, and IO saturation create long tails. As utilization approaches saturation, queues grow nonlinearly: going from 50 to 80 percent busy is not the same risk as going from 80 to 95 percent.

Production systems need headroom for deploys, zone failures, traffic bursts, and dependency slowness. If a three-zone service needs to survive one zone down, the remaining two zones must carry 100 percent of traffic. That means each zone should normally run at or below about 66 percent of its safe zone capacity before considering deploy overlap. For databases and queues, saturation should be monitored directly with queue depth, oldest message age, lock wait, disk IO wait, and connection-pool wait, not just CPU.`,
            bullets: [
              'Pick utilization targets per resource: CPU-bound app, memory-bound cache, IO-bound database, or network-bound gateway.',
              'Design normal headroom so one zone or deploy batch can disappear without immediate overload.',
              'Watch saturation signals such as queue age, connection waits, thread-pool waits, lock waits, and throttling.'
            ]
          },
          {
            heading: 'Cost model and trade-offs',
            body: `Cost is capacity multiplied by time, redundancy, managed-service premiums, and data movement. A read fleet of 44 instances at $0.12/hour costs about $3,800/month before load balancers, logs, traces, storage, cache, and network egress. A database cluster may cost more than the app fleet because it needs provisioned IOPS, storage replicas, backups, and cross-region replication. Observability can also become a top line item when high-cardinality metrics and verbose logs scale with QPS.

The design question is not "What is cheapest?" but "Which cost buys the user promise?" Caching may reduce database spend but increase invalidation complexity. Reserved instances may cut stable baseline cost but make traffic shape less flexible. Queues may smooth writes but add operational lag and replay work. A strong capacity answer names the dominant cost driver, the assumptions that can change it, and the measurements that would trigger the next scaling step.`,
            bullets: [
              'Estimate compute, storage, network egress, managed-service fees, and observability volume separately.',
              'Tie every expensive redundancy choice to a user promise such as availability, durability, latency, or compliance.',
              'Track unit cost, such as cost per 1,000 requests or cost per active user, so growth does not hide inefficiency.'
            ],
            codeExample: {
              title: 'Simple monthly unit-cost model',
              language: 'javascript',
              code: [
                'const hoursPerMonth = 730;',
                'const apiInstances = 44;',
                'const apiCostPerHour = 0.12;',
                'const storageGb = 98000;',
                'const storageCostPerGbMonth = 0.18;',
                'const observabilityPerMillionRequests = 0.35;',
                'const monthlyRequests = 100_000_000 * 30;',
                '',
                'const compute = apiInstances * apiCostPerHour * hoursPerMonth;',
                'const storage = storageGb * storageCostPerGbMonth;',
                'const observability = monthlyRequests / 1_000_000 * observabilityPerMillionRequests;',
                'const total = compute + storage + observability;',
                '',
                'console.log({ compute, storage, observability, total });',
                'console.log("cost per 1k requests", total / (monthlyRequests / 1000));'
              ].join('\n')
            }
          },
          {
            heading: 'Capacity planning as an operating loop',
            body: `The estimate is the starting point, not the final truth. After launch, compare forecasted QPS, storage growth, cache hit rate, CPU, memory, queue age, and unit cost to actuals. Keep a weekly capacity review for fast-growing systems and a monthly review for stable ones. The review should identify which assumption changed: more DAU, more sessions, lower cache hit rate, bigger payloads, inefficient queries, or a new product path creating hidden writes.

This loop matters in production because the worst capacity failures often arrive gradually and then suddenly. A database grows from 50 to 85 percent disk over weeks, then compaction fails. A queue usually clears in two minutes, then a new partner import makes oldest-message age climb for hours. Treat capacity as a set of leading indicators with owners and thresholds, and it becomes a routine engineering practice instead of an emergency purchase order.`,
            bullets: [
              'Compare forecast and actuals for traffic, storage, utilization, queue age, and unit cost.',
              'Set thresholds that trigger scale-up, query optimization, data-tiering, or product throttling work.',
              'Document assumptions so future teams know which number to change when the product changes.'
            ]
          }
        ],
        checklist: [
          'Translate users and sessions into read QPS, write QPS, async jobs, and fan-out volume.',
          'Calculate average and peak QPS, including busiest-hour, event, and retry multipliers.',
          'Estimate storage with object size, retention, indexes, replicas, backups, and observability included.',
          'Choose utilization targets and headroom for zone failure, deploy overlap, and burst traffic.',
          'Name dominant cost drivers and compute at least one unit-cost metric.',
          'Define capacity review signals and thresholds for scaling or optimization.'
        ],
        pitfalls: [
          'Sizing for average traffic while real load is governed by launch spikes, daily peaks, and retries.',
          'Ignoring indexes, replicas, backups, logs, traces, and network egress in the cost estimate.',
          'Running high utilization on resources with high variance and then being surprised by queueing delay.',
          'Using one instance benchmark for every endpoint even though read, write, and fan-out paths differ.',
          'Treating the first estimate as a promise instead of revisiting assumptions with production data.'
        ],
        interviewPrompts: [
          'Walk through capacity planning for a 10M-user app, including QPS, storage, and monthly cost.',
          'Explain why peak QPS, not average QPS, usually drives user-facing capacity.',
          'Teach back how utilization, saturation, and headroom differ for an API fleet versus a database.',
          'Describe how you would reduce cost without breaking a p95 latency or durability promise.'
        ],
        exercises: [
          {
            id: 'ten-million-user-capacity-plan',
            title: 'Design a capacity plan for a 10M-user feed',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Build a back-of-the-envelope plan for a social feed with reads, writes, media metadata, ranking jobs, and 12-month retention.',
            promptQuestions: [
              'What DAU, sessions, reads, writes, and fan-out assumptions will you use?',
              'How do average QPS and peak QPS differ during the busiest hour?',
              'Which resources dominate cost: app compute, database, cache, object storage, network, or observability?',
              'What headroom do you need for one-zone failure and deploy overlap?'
            ],
            hints: [
              'Use explicit multipliers for peak traffic and retries.',
              'Separate metadata storage from media object storage.',
              'Name a unit-cost metric that product can understand.'
            ]
          },
          {
            id: 'capacity-math-python',
            title: 'Compute QPS, storage, and unit cost',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Complete a Python calculator for traffic, storage, and monthly unit cost using the assumptions in the lesson.',
            starterCode: [
              'users = 10_000_000',
              'dau_ratio = 0.20',
              'sessions_per_dau = 5',
              'reads_per_session = 10',
              'writes_per_session = 2',
              'event_kb = 2',
              'retention_days = 365',
              '',
              '# TODO: calculate DAU, daily reads, average read QPS, and raw retained GB.',
              '# TODO: assume 25% of reads happen in the busiest hour and print peak QPS.'
            ].join('\n'),
            solution: [
              'users = 10_000_000',
              'dau_ratio = 0.20',
              'sessions_per_dau = 5',
              'reads_per_session = 10',
              'writes_per_session = 2',
              'event_kb = 2',
              'retention_days = 365',
              '',
              'dau = users * dau_ratio',
              'sessions = dau * sessions_per_dau',
              'daily_reads = sessions * reads_per_session',
              'daily_writes = sessions * writes_per_session',
              'avg_read_qps = daily_reads / 86_400',
              'peak_read_qps = daily_reads * 0.25 / 3_600',
              'raw_retained_gb = daily_writes * event_kb / 1024 / 1024 * retention_days',
              '',
              'print("DAU", round(dau))',
              'print("avg read QPS", round(avg_read_qps))',
              'print("peak read QPS", round(peak_read_qps))',
              'print("raw retained GB", round(raw_retained_gb))'
            ].join('\n'),
            expectedOutput:
              'The calculator should show 2M DAU, about 1,157 average read QPS, 6,944 peak read QPS before retries, and about 13,924 GB of raw retained write data.'
          }
        ],
        diagram: null,
        related: [
          'estimation-and-capacity',
          'latency-and-throughput',
          'caching-layers',
          'queues-and-workers',
          'storage-scaling'
        ]
      },
      {
        slug: 'designing-for-evolution',
        title: 'Designing for evolution',
        summary:
          'Learn how APIs, data models, deployments, and ownership boundaries can change safely as a system grows.',
        duration: '55-70 min',
        whyItMatters:
          'Most production architecture work is changing systems that already exist. Designs that support versioning, migration, and gradual rollout let teams learn without making every change a high-risk event.',
        sections: [
          {
            heading: 'Compatibility is the core API promise',
            body: `An API is not just a route; it is a contract with deployed clients, dashboards, jobs, partner integrations, and support tooling. Evolution-friendly APIs make additive changes easy and breaking changes deliberate. Adding an optional response field, accepting a missing request field, or introducing a new endpoint is usually safer than changing the meaning of an existing field. Versioning becomes necessary when behavior truly changes, not every time a new field appears.

In production, compatibility protects teams from synchronized releases. Mobile apps may update over weeks, partners may update quarterly, and background jobs may pin old client libraries. A server that tolerates old and new shapes lets product ship without forcing every caller to move at once. The best design answers explain what old clients see, what new clients see, how long both are supported, and how usage is measured before removal.`,
            bullets: [
              'Prefer additive fields and optional request parameters when semantics do not change.',
              'Use explicit versions when behavior changes in a way old clients cannot safely ignore.',
              'Measure version usage and publish deprecation windows before removing old behavior.'
            ],
            codeExample: {
              title: 'Additive API change instead of breaking rename',
              language: 'javascript',
              code: [
                '// Before: clients read displayName.',
                'const v1User = {',
                '  id: "u_123",',
                '  displayName: "Mina Patel"',
                '};',
                '',
                '// Safe expansion: keep displayName and add structured name fields.',
                'const compatibleUser = {',
                '  id: "u_123",',
                '  displayName: "Mina Patel",',
                '  name: {',
                '    given: "Mina",',
                '    family: "Patel"',
                '  }',
                '};',
                '',
                '// Breaking change to avoid without a version or migration window:',
                '// const brokenUser = { id: "u_123", name: { given: "Mina", family: "Patel" } };',
                '// Old clients that expect displayName would render a blank profile.'
              ].join('\n')
            }
          },
          {
            heading: 'Expand-and-contract migrations',
            body: `Database migrations are safest when they separate schema expansion, data movement, read switching, and cleanup. Suppose a users table stores a single full_name column, but the product now needs given_name and family_name. The risky approach is to rename the column and deploy code at the same time. The safer approach is expand: add nullable new columns; dual-write both old and new shapes; backfill existing rows; validate counts and mismatches; switch reads; then contract by removing the old column after all callers no longer need it.

This matters because production databases are shared state. A one-shot migration can lock hot tables, break old application versions during deploy rollout, or leave partial data when it fails halfway. Expand-and-contract gives you pause points and rollback options. If reads from the new columns look wrong, switch reads back while keeping dual-writes. If backfill runs too slowly, throttle it. The design is not only about final schema; it is about moving safely while traffic continues.`,
            bullets: [
              'Expand schema first so old and new application versions can both run.',
              'Dual-write or backfill with validation before switching reads.',
              'Contract only after usage data proves no active caller depends on the old shape.'
            ],
            codeExample: {
              title: 'Expand-contract migration sequence',
              language: 'pseudocode',
              languageLabel: 'Pseudocode',
              code: [
                '1. EXPAND',
                '   add nullable column users.given_name',
                '   add nullable column users.family_name',
                '',
                '2. DUAL WRITE',
                '   on profile update:',
                '     write full_name',
                '     write given_name and family_name',
                '',
                '3. BACKFILL',
                '   for batches of 5,000 old rows:',
                '     parse full_name',
                '     fill given_name and family_name',
                '     record mismatches for manual review',
                '',
                '4. SWITCH READS',
                '   feature flag read_new_name_columns = 1% -> 10% -> 50% -> 100%',
                '   compare rendered display names and error rates',
                '',
                '5. CONTRACT',
                '   remove full_name reads',
                '   stop writing full_name',
                '   drop full_name after old versions and exports are gone'
              ].join('\n')
            }
          },
          {
            heading: 'Feature flags as operational control points',
            body: `Feature flags decouple deployment from release. Code can be deployed dark, enabled for internal users, then enabled for 1 percent, 10 percent, one region, or one tenant at a time. A good flag is targeted, observable, owned, and temporary. It should have a clear default, a kill-switch plan, and a removal date. Flags are also useful for dependency migrations: route a small cohort to a new search service, compare correctness and latency, and roll back immediately if the new path misbehaves.

The production risk is that flags become hidden architecture. A flag that lives for two years means there are two systems, two test matrices, and two incident paths. Mature teams track flag age and require cleanup once rollout is complete. During interviews, mention that flags protect blast radius, but also mention that long-lived flags create complexity that must be paid down.`,
            bullets: [
              'Use flags for cohort rollout, dependency migration, experiments, and emergency disablement.',
              'Attach metrics to each flag state so teams can compare latency, errors, and correctness.',
              'Retire flags after rollout to avoid permanent parallel behavior.'
            ],
            codeExample: {
              title: 'Flagged migration with metrics tags',
              language: 'javascript',
              code: [
                'async function searchProducts(query, user, flags, metrics) {',
                '  const useSearchV2 = flags.enabled("search_v2", {',
                '    userId: user.id,',
                '    region: user.region,',
                '    plan: user.plan',
                '  });',
                '',
                '  const start = Date.now();',
                '  try {',
                '    const result = useSearchV2',
                '      ? await searchV2(query)',
                '      : await searchV1(query);',
                '    metrics.increment("search.success", { version: useSearchV2 ? "v2" : "v1" });',
                '    return result;',
                '  } catch (error) {',
                '    metrics.increment("search.error", { version: useSearchV2 ? "v2" : "v1" });',
                '    throw error;',
                '  } finally {',
                '    metrics.timing("search.latency_ms", Date.now() - start, {',
                '      version: useSearchV2 ? "v2" : "v1"',
                '    });',
                '  }',
                '}'
              ].join('\n')
            }
          },
          {
            heading: 'Before-and-after design for service extraction',
            body: `Evolution often means moving a capability out of a monolith or replacing a dependency. The before state may be a checkout controller that directly calculates tax, reserves inventory, charges payment, and sends email. The after state should not be a distributed monolith where checkout synchronously calls five services with no ownership boundaries. A safer path is the strangler pattern: identify one capability, introduce an interface, route a small slice to the new implementation, compare outputs, then increase traffic.

Concrete before-and-after thinking prevents architecture fashion from driving the change. If tax calculation is extracted because tax rules change often and need a specialized owner, the API should be stable around inputs, outputs, idempotency, and audit records. If extraction is only to reduce codebase size, the added network hop may hurt reliability more than it helps. In production, every new boundary needs timeouts, retries, observability, authorization, and a rollback path.`,
            bullets: [
              'Extract capabilities for ownership, scaling, compliance, or release independence, not because distributed systems look cleaner.',
              'Introduce interfaces and shadow comparisons before routing user-visible traffic.',
              'Add timeouts, idempotency, and fallback behavior at every new network boundary.'
            ]
          },
          {
            heading: 'Deprecation, rollback, and cleanup',
            body: `Evolution is incomplete until the old path is removed. A practical deprecation plan names affected clients, usage metrics, owner, deadline, support message, and rollback policy. For example, "/v1/orders" may be frozen for new features, emit a response header with a sunset date, and be watched until traffic falls below 0.1 percent for 30 consecutive days. Only then should the team remove it, and even then the removal should be staged behind a flag or deploy sequence that can stop quickly.

Rollback planning should be honest about data. Rolling back code is easy when the old and new versions read the same data. It is hard after the new version writes data the old version cannot understand. That is why compatibility windows, dual-writes, write fences, and migration checkpoints matter. Production teams design rollback before launch, not after the pager fires.`,
            bullets: [
              'Track usage by version, client, tenant, region, and job before setting removal dates.',
              'Prefer roll-forward or feature disablement when data has already changed shape.',
              'Remove stale flags, endpoints, columns, and dashboards so the system does not accumulate ghosts.'
            ],
            codeExample: {
              title: 'Deprecation signal in an HTTP response',
              language: 'bash',
              languageLabel: 'HTTP response sketch',
              code: [
                'HTTP/1.1 200 OK',
                'Content-Type: application/json',
                'Deprecation: true',
                'Sunset: Wed, 30 Sep 2026 23:59:59 GMT',
                'Link: <https://docs.example.com/orders-v2-migration>; rel="deprecation"',
                'X-API-Version: orders-v1',
                '',
                '{',
                '  "order_id": "ord_123",',
                '  "status": "paid",',
                '  "migration_notice": "orders-v1 is frozen; move to orders-v2 before 2026-09-30"',
                '}'
              ].join('\n')
            }
          }
        ],
        checklist: [
          'Classify each API change as additive, behavior-changing, or removal.',
          'Plan schema changes with expand, dual-write/backfill, read switch, validation, and contract steps.',
          'Use feature flags to control blast radius and compare old versus new behavior.',
          'Define version usage metrics, deprecation windows, and client communication before removal.',
          'State the rollback strategy, especially when new writes may be unreadable by old code.',
          'Schedule cleanup for stale flags, endpoints, columns, and migration dashboards.'
        ],
        pitfalls: [
          'Treating API versioning as URL naming while changing behavior that old clients cannot tolerate.',
          'Combining schema change, backfill, code rollout, and cleanup into one irreversible deploy.',
          'Leaving feature flags in place until nobody knows which path is canonical.',
          'Extracting a service without adding timeouts, retries, ownership, observability, and idempotency.',
          'Planning rollback only for code while ignoring data written in the new shape.'
        ],
        interviewPrompts: [
          'Teach back the expand-and-contract pattern for splitting full_name into first and last name.',
          'Explain when an additive API change is enough and when a new version is justified.',
          'Walk through a feature-flag rollout for replacing a search service.',
          'Describe how you would deprecate an old endpoint without surprising mobile or partner clients.'
        ],
        exercises: [
          {
            id: 'orders-api-evolution-plan',
            title: 'Design an orders API migration',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Plan a migration from /v1/orders, which returns one status string, to /v2/orders, which returns payment, fulfillment, and fraud states separately.',
            promptQuestions: [
              'Which changes can be additive in v1, and which require v2 semantics?',
              'How will old mobile clients behave during the migration window?',
              'What usage metrics and deprecation signals prove v1 is safe to remove?',
              'How would you roll back if v2 writes a state v1 cannot represent?'
            ],
            hints: [
              'Separate response-shape compatibility from behavior compatibility.',
              'Include client communication and SDK version tracking.',
              'Be explicit about write compatibility.'
            ]
          },
          {
            id: 'dual-write-flag-wrapper',
            title: 'Implement a dual-write wrapper',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Complete a JavaScript sketch that dual-writes an old and new user-name shape while reads are still controlled by a flag.',
            starterCode: [
              'async function updateName(userId, fullName, flags, db) {',
              '  const [given, ...rest] = fullName.split(" ");',
              '  const family = rest.join(" ");',
              '',
              '  // TODO: write old full_name for compatibility.',
              '  // TODO: write new given_name/family_name for the future read path.',
              '}',
              '',
              'async function readDisplayName(userId, flags, db) {',
              '  const row = await db.users.get(userId);',
              '  // TODO: return new shape only when the read_new_name flag is enabled.',
              '}'
            ].join('\n'),
            solution: [
              'async function updateName(userId, fullName, flags, db) {',
              '  const [given, ...rest] = fullName.split(" ");',
              '  const family = rest.join(" ");',
              '',
              '  await db.users.update(userId, {',
              '    full_name: fullName,',
              '    given_name: given,',
              '    family_name: family',
              '  });',
              '}',
              '',
              'async function readDisplayName(userId, flags, db) {',
              '  const row = await db.users.get(userId);',
              '  if (flags.enabled("read_new_name") && row.given_name) {',
              '    return [row.given_name, row.family_name].filter(Boolean).join(" ");',
              '  }',
              '  return row.full_name;',
              '}'
            ].join('\n'),
            expectedOutput:
              'The wrapper keeps old writes available while enabling a controlled switch to reads from the expanded schema.'
          }
        ],
        diagram: null,
        related: [
          'api-design',
          'database-schema-design',
          'microservices',
          'deployment-strategies',
          'operational-excellence'
        ]
      }
    ]
  },
  {
    slug: 'reliability-observability-lab',
    title: 'Reliability and observability lab',
    summary:
      'Learn how teams define reliability goals, observe production behavior, practice failure, and improve systems after incidents.',
    objectives: [
      'Turn user promises into SLIs, SLOs, and error budget decisions',
      'Use traces, metrics, and logs together to explain production behavior',
      'Prepare systems and teams for failure through graceful degradation, runbooks, and postmortems'
    ],
    lessons: [
      {
        slug: 'sli-slo-error-budgets',
        title: 'SLIs, SLOs, and error budgets',
        summary:
          'Define reliability in user-centered terms, set measurable objectives, and use error budgets to balance feature work with operational risk.',
        duration: '55-70 min',
        whyItMatters:
          'Reliability is not a vague desire for more nines. SLIs and SLOs turn reliability into a product decision that engineering, product, and operations can reason about together.',
        sections: [
          {
            heading: 'SLIs measure user promises',
            body: `A service level indicator is a measurement of whether users can complete a meaningful action. For checkout, availability might be successful checkout attempts divided by valid checkout attempts. For search, latency might be the percentage of valid searches returning useful results under 500 ms. For messaging, freshness or delivery delay may matter more than HTTP uptime. CPU, memory, and pod count are useful engineering signals, but they are not usually the promise users experience.

This distinction matters in production because infrastructure can look healthy while users fail. A payment page can return HTTP 200 with an error banner, a feed can load fast but show stale items, and a queue can accept messages but deliver them 20 minutes late. Good SLIs are scoped to critical journeys, filtered to valid user requests, and measured near the point where user experience is known.`,
            bullets: [
              'Define SLIs around successful user outcomes, not only server uptime.',
              'Use availability, latency, correctness, freshness, and durability depending on the product path.',
              'Document valid-request filters so abuse, test traffic, and malformed requests do not distort the signal.'
            ]
          },
          {
            heading: 'SLO targets and 99.9% monthly math',
            body: `A service level objective is the target for an SLI over a window. A 99.9 percent monthly availability SLO allows 0.1 percent failure over the month. In a 30-day month, that is 43.2 minutes of allowed unavailability if you think in time, or 0.1 percent of valid requests if you think in events. Request-based SLOs are often better for APIs because a quiet midnight minute should not count the same as a peak checkout minute if users were not affected equally.

The target should be strict enough to protect users and loose enough to guide trade-offs. 100 percent is not practical because networks fail, dependencies fail, deploys happen, and measuring itself has uncertainty. 99.99 percent may be justified for payment authorization or emergency alerts, but it is expensive and slows change. 99.5 or 99.9 may be better for internal dashboards or recommendation widgets. The SLO is a product decision about reliability versus speed, cost, and complexity.`,
            bullets: [
              '99.9 percent monthly availability leaves 0.1 percent monthly error budget.',
              'Request-based budgets weight failures by traffic volume; time-based budgets are easier but can misrepresent impact.',
              'Pick different SLOs for different journeys instead of applying one number to every endpoint.'
            ],
            codeExample: {
              title: '99.9% monthly error budget',
              language: 'python',
              code: [
                'slo = 0.999',
                'days = 30',
                'minutes = days * 24 * 60',
                'allowed_bad_minutes = minutes * (1 - slo)',
                '',
                'monthly_valid_requests = 250_000_000',
                'allowed_bad_requests = monthly_valid_requests * (1 - slo)',
                '',
                'print(f"allowed bad minutes: {allowed_bad_minutes:.1f}")',
                'print(f"allowed bad requests: {allowed_bad_requests:,.0f}")',
                '',
                '# If one incident causes 80,000 failed requests:',
                'incident_failures = 80_000',
                'budget_spent = incident_failures / allowed_bad_requests',
                'print(f"budget spent by incident: {budget_spent:.1%}")'
              ].join('\n')
            }
          },
          {
            heading: 'Error budgets turn reliability into decisions',
            body: `An error budget is the amount of unreliability left after choosing the SLO. If a service with 250 million valid monthly requests and a 99.9 percent SLO is allowed 250,000 bad requests, then an incident causing 80,000 failed requests spends 32 percent of the monthly budget. If that happens on day two, the team is burning risk much faster than planned. If it happens on day twenty-eight after a quiet month, the decision may be different.

In production, error budgets keep reliability conversations concrete. Instead of a vague argument between "ship faster" and "be safer," the team can say, "Search has used 75 percent of its monthly budget in the first week, mostly from timeout errors in the ranking service; pause risky launches and fix that path." Budgets should drive actions such as launch freezes, extra review, capacity work, dependency rollback, or reduced experiment exposure.`,
            bullets: [
              'Budget remaining = allowed bad events - observed bad events for the SLO window.',
              'Burn rate shows how quickly the budget is being spent compared with the window length.',
              'Tie launch policy to user-impacting budget burn, not general anxiety.'
            ],
            codeExample: {
              title: 'Burn-rate check for alerting',
              language: 'javascript',
              code: [
                'function burnRate({ badEvents, totalEvents, slo }) {',
                '  const observedErrorRate = badEvents / totalEvents;',
                '  const allowedErrorRate = 1 - slo;',
                '  return observedErrorRate / allowedErrorRate;',
                '}',
                '',
                'const oneHour = burnRate({',
                '  badEvents: 4200,',
                '  totalEvents: 1_000_000,',
                '  slo: 0.999',
                '});',
                '',
                'const sixHours = burnRate({',
                '  badEvents: 12_000,',
                '  totalEvents: 7_200_000,',
                '  slo: 0.999',
                '});',
                '',
                'console.log({ oneHour, sixHours });',
                'console.log(oneHour > 14 && sixHours > 6 ? "page now" : "watch or ticket");'
              ].join('\n')
            }
          },
          {
            heading: 'Choosing windows, alerts, and exclusions',
            body: `SLO windows can be rolling or calendar-based. Calendar windows are easy for monthly reporting, but rolling windows catch risk continuously. Alerting usually uses multiple burn-rate windows: a fast burn over 5 minutes and 1 hour catches emergencies, while a slower burn over 6 hours and 3 days catches chronic leaks. The goal is to page when users are being harmed and action is needed, not every time an internal metric wiggles.

Exclusions must be narrow and honest. It is reasonable to exclude malformed requests, synthetic tests, planned maintenance that users were warned about, or third-party callbacks outside your contract. It is dangerous to exclude dependency failures if users still cannot complete the journey; from the user's perspective, the product failed. Document exclusions before incidents so they do not become a way to hide painful data.`,
            bullets: [
              'Use multi-window burn alerts to catch both fast outages and slow budget leaks.',
              'Exclude invalid traffic carefully, but keep real user harm in the SLI even when a dependency caused it.',
              'Review alert fatigue by asking whether each page had a clear owner and action.'
            ]
          },
          {
            heading: 'Reliability policy and product trade-offs',
            body: `SLOs become useful when they influence behavior. A team might allow normal deploy velocity while budget remaining is above 50 percent, require extra review below 50 percent, freeze risky launches below 20 percent, and dedicate the next sprint to reliability if the budget is exhausted. Product should be part of that policy because slowing releases, adding redundancy, or simplifying a feature all have customer and business trade-offs.

This matters in production because reliability is never free. Higher availability may require multi-region failover, better test environments, more observability, simpler dependencies, or slower launches. Lower availability may be acceptable for a noncritical analytics export but unacceptable for login. A good interview answer explains not only how to calculate the SLO, but how the organization uses it to decide what to build next.`,
            bullets: [
              'Map budget health to launch policy, review depth, and reliability investment.',
              'Use separate SLOs for critical paths, convenience features, and internal tools.',
              'Revisit SLOs after incidents, product changes, traffic growth, or new dependencies.'
            ]
          }
        ],
        checklist: [
          'Define availability, latency, correctness, freshness, or durability SLIs for a critical user journey.',
          'Calculate the monthly error budget for a 99.9 percent SLO in minutes and request events.',
          'Compute budget spent and burn rate for a sample incident.',
          'Choose alert windows that page for fast outages and ticket slow budget leaks.',
          'Document valid exclusions without hiding real user harm.',
          'Connect budget health to launch policy and reliability investment.'
        ],
        pitfalls: [
          'Measuring server uptime while users fail because responses are wrong, stale, or too late.',
          'Setting every service to 99.99 percent without understanding cost, complexity, and product value.',
          'Paging on raw CPU or pod restarts instead of user-impacting SLO burn.',
          'Creating broad exclusions that remove dependency failures users actually experience.',
          'Freezing features without tying the decision to budget burn, impact, and a recovery plan.'
        ],
        interviewPrompts: [
          'Teach back the difference between SLI, SLO, SLA, and error budget using checkout as the example.',
          'Calculate how many bad requests are allowed for 250M monthly requests at 99.9 percent.',
          'Explain how burn-rate alerts differ from threshold alerts.',
          'Describe what policy you would apply when a service spends 80 percent of its budget in the first week.'
        ],
        exercises: [
          {
            id: 'checkout-slo-design',
            title: 'Design SLOs for checkout',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Define user-centered SLIs and SLOs for a checkout flow with payment, inventory, and email dependencies.',
            promptQuestions: [
              'Which user actions count as valid checkout attempts?',
              'What availability and latency SLOs would you set, and why are they not 100 percent?',
              'Which dependency failures should still count against the user-facing SLO?',
              'What launch policy changes when the error budget is nearly exhausted?'
            ],
            hints: [
              'Include successful payment authorization and order creation.',
              'Separate email receipt delay from checkout completion.',
              'Use request-based math during peak shopping periods.'
            ]
          },
          {
            id: 'error-budget-calculator',
            title: 'Calculate budget spend and burn rate',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Complete a Python script that calculates allowed failures, budget spend, and burn rate for a 99.9 percent SLO.',
            starterCode: [
              'slo = 0.999',
              'monthly_requests = 250_000_000',
              'incident_bad_requests = 80_000',
              'window_bad_requests = 4_200',
              'window_total_requests = 1_000_000',
              '',
              '# TODO: calculate allowed_bad_requests.',
              '# TODO: calculate incident budget spend percentage.',
              '# TODO: calculate burn rate for the window.'
            ].join('\n'),
            solution: [
              'slo = 0.999',
              'monthly_requests = 250_000_000',
              'incident_bad_requests = 80_000',
              'window_bad_requests = 4_200',
              'window_total_requests = 1_000_000',
              '',
              'allowed_error_rate = 1 - slo',
              'allowed_bad_requests = monthly_requests * allowed_error_rate',
              'budget_spend = incident_bad_requests / allowed_bad_requests',
              'burn_rate = (window_bad_requests / window_total_requests) / allowed_error_rate',
              '',
              'print("allowed bad requests", round(allowed_bad_requests))',
              'print("incident budget spend", f"{budget_spend:.1%}")',
              'print("window burn rate", round(burn_rate, 1))'
            ].join('\n'),
            expectedOutput:
              'The incident spends 32.0% of the monthly budget, and the sample one-hour window burns at 4.2x the allowed error rate.'
          }
        ],
        diagram: null,
        related: [
          'availability',
          'latency-and-throughput',
          'monitoring-and-alerting',
          'incident-management',
          'graceful-degradation'
        ]
      },
      {
        slug: 'tracing-metrics-and-logs',
        title: 'Tracing, metrics, and logs',
        summary:
          'Use the three pillars of observability with correlation IDs, RED and USE methods, and dashboards that reveal user-impacting behavior.',
        duration: '60-75 min',
        whyItMatters:
          'Observability lets you ask useful questions about production without already knowing the bug. It turns distributed behavior into evidence instead of guesswork.',
        sections: [
          {
            heading: 'Metrics, logs, and traces answer different questions',
            body: `Metrics are numeric time series that answer "how much, how often, and is it getting worse?" Logs are structured events that answer "what happened for this request, user, order, or job?" Traces connect spans across services and answer "where did time go and which dependency contributed to failure?" A production system needs all three because incidents rarely arrive pre-labeled. Metrics detect symptoms, traces localize the path, and logs explain details.

This matters because collecting more data is not the same as being observable. A team can have terabytes of logs and still be blind if there is no request ID, no consistent fields, and no way to join evidence across services. A good observability design starts with the questions responders will ask: Which users are affected? Which endpoint? Which version? Which dependency? Which region? What changed?`,
            bullets: [
              'Use metrics for alerting and trend detection, logs for detailed events, and traces for cross-service causality.',
              'Make service, version, region, route, status, and correlation identifiers consistent across signals.',
              'Design telemetry around incident questions, not around whatever the framework emits by default.'
            ]
          },
          {
            heading: 'RED and USE methods for dashboards',
            body: `RED is a service dashboard pattern: Rate, Errors, and Duration. For an API, show requests per second by route, error ratio by route and status class, and latency percentiles such as p50, p95, and p99. USE is a resource pattern: Utilization, Saturation, and Errors. For a database, show CPU or IO utilization, lock or connection-pool saturation, and query or replication errors. Together they separate user-facing symptoms from resource limits.

A good production dashboard begins with user impact at the top: SLO burn, success rate, p95/p99 latency, traffic volume, and recent deploys. The next row shows dependencies and saturation: database lock wait, cache hit rate, queue age, worker concurrency, and downstream error rates. Do not bury the SLO under twenty host graphs. The first screen should help an on-call engineer decide whether to page another team, roll back, shed load, or keep investigating.`,
            bullets: [
              'RED: rate, errors, duration for request-driven services.',
              'USE: utilization, saturation, errors for resources such as databases, queues, caches, and hosts.',
              'Put SLO burn, recent deploys, and dependency health near the top of incident dashboards.'
            ],
            codeExample: {
              title: 'Dashboard query sketch',
              language: 'pseudocode',
              languageLabel: 'Metric query pseudocode',
              code: [
                '# RED: request rate by route',
                'sum(rate(http_requests_total{service="checkout"}[5m])) by (route)',
                '',
                '# RED: 5xx error ratio',
                'sum(rate(http_requests_total{service="checkout",status=~"5.."}[5m]))',
                '  /',
                'sum(rate(http_requests_total{service="checkout"}[5m]))',
                '',
                '# RED: p95 latency from histogram buckets',
                'histogram_quantile(0.95,',
                '  sum(rate(http_request_duration_seconds_bucket{service="checkout"}[5m])) by (le, route)',
                ')',
                '',
                '# USE: queue saturation',
                'max(queue_oldest_message_age_seconds{queue="payment-capture"})'
              ].join('\n')
            }
          },
          {
            heading: 'Correlation IDs and structured logs',
            body: `A correlation ID is a stable handle for one unit of work. It should be generated or accepted at the edge, added to response headers, propagated to downstream HTTP calls, attached to queue messages, and included in every structured log and trace span. For asynchronous work, the original request ID may become a causation ID while a new job ID identifies the worker execution. Without this propagation, an incident involving gateways, APIs, queues, and workers becomes a manual search through unrelated records.

Structured logs should be JSON or another machine-queryable shape with consistent fields. Avoid dumping unbounded objects or secrets. Put high-cardinality identifiers such as user_id, order_id, request_id, and trace_id in logs and traces where they are useful for investigation; be careful putting them in metrics because high-cardinality metrics can become expensive and slow. In production, a single well-shaped error log can save hours during an incident.`,
            bullets: [
              'Generate or preserve request IDs at the edge and propagate them through sync and async calls.',
              'Use consistent JSON fields so logs can be filtered by service, route, version, request_id, trace_id, and customer impact.',
              'Keep secrets and large payloads out of logs; log references and counts instead.'
            ],
            codeExample: {
              title: 'JSON log event with trace context',
              language: 'javascript',
              code: [
                'const logEvent = {',
                '  timestamp: "2026-07-26T08:15:30.120Z",',
                '  level: "error",',
                '  service: "checkout-api",',
                '  version: "2026.07.26.3",',
                '  region: "us-east-1",',
                '  route: "POST /checkout",',
                '  request_id: "req_01J4ABC9Y7",',
                '  trace_id: "4bf92f3577b34da6a3ce929d0e0e4736",',
                '  span_id: "00f067aa0ba902b7",',
                '  user_id: "u_12345",',
                '  order_id: "ord_98765",',
                '  dependency: "payment-gateway",',
                '  error_code: "PAYMENT_TIMEOUT",',
                '  latency_ms: 1840,',
                '  retry_count: 2,',
                '  message: "payment authorization timed out after retry budget exhausted"',
                '};',
                '',
                'console.log(JSON.stringify(logEvent));'
              ].join('\n')
            }
          },
          {
            heading: 'Tracing the critical path',
            body: `A trace is a tree of spans representing work done for a request or job. The root span may be the API gateway, with child spans for auth, checkout handler, inventory reservation, payment authorization, database writes, and email enqueue. Each span needs start time, duration, status, service name, operation name, and selected attributes. Sampling should preserve errors and slow requests even if normal successful traffic is sampled at a lower rate.

Production traces are most useful when they reveal causality and waiting. A trace that shows payment authorization took 1,600 ms is useful; a trace that also shows 1,200 ms was connection-pool wait is better. For queues, propagate context from producer to consumer so a delayed worker job can be linked to the original user action. Tracing is not only for debugging latency; it also exposes unexpected dependency calls, N+1 query patterns, and retries hidden inside client libraries.`,
            bullets: [
              'Instrument root spans, downstream calls, database operations, queue produce/consume, and retry attempts.',
              'Preserve traces for errors and slow requests even when sampling normal traffic.',
              'Add span attributes that help routing investigation: route, tenant tier, dependency, cache state, and retry count.'
            ]
          },
          {
            heading: 'Observability cost and signal quality',
            body: `Telemetry has cost. Every metric label multiplies time series, every log line consumes ingestion and storage, and every trace span adds network and indexing work. The goal is not minimal data; it is high-value data. Keep cardinality low for metrics by using bounded labels such as route templates, status class, region, and service version. Put high-cardinality investigation keys in logs and traces. Use log levels and sampling so normal traffic is visible but not financially destructive.

Signal quality matters during incidents. Dashboards should have owners, runbook links, and clear thresholds. Alerts should state user impact, suspected component, SLO burn, and a first action. Logs should use consistent names so responders do not need to remember that one service uses requestId while another uses correlation_id. Observability is a product for engineers under stress; design it with the same care as a customer feature.`,
            bullets: [
              'Control metric cardinality with bounded labels and route templates.',
              'Sample traces deliberately while retaining errors, slow requests, and important cohorts.',
              'Treat dashboards and alerts as maintained artifacts with owners and runbook links.'
            ],
            codeExample: {
              title: 'Alert payload that gives responders context',
              language: 'javascript',
              code: [
                'const alert = {',
                '  name: "checkout-api fast SLO burn",',
                '  severity: "page",',
                '  service: "checkout-api",',
                '  slo: "99.9% successful checkout attempts over 30d",',
                '  burn_rate_1h: 18.4,',
                '  burn_rate_6h: 7.1,',
                '  current_error_ratio: 0.021,',
                '  top_error_code: "PAYMENT_TIMEOUT",',
                '  started_at: "2026-07-26T08:10:00Z",',
                '  dashboard_url: "https://observability.example.com/d/checkout",',
                '  runbook_url: "https://runbooks.example.com/checkout-payment-timeouts",',
                '  first_action: "Check payment gateway health, then disable new-card retries if gateway p95 > 2s"',
                '};'
              ].join('\n')
            }
          }
        ],
        checklist: [
          'Define RED metrics for a request-driven service and USE metrics for its most constrained resource.',
          'Propagate request_id, trace_id, and causation context through synchronous calls and queues.',
          'Create JSON log fields that let responders filter by service, route, version, user impact, and dependency.',
          'Design a dashboard with SLO burn, traffic, errors, latency, deploys, and dependency saturation on the first screen.',
          'Set trace sampling rules that retain errors and slow paths.',
          'Control telemetry cost by keeping metric labels bounded and moving high-cardinality IDs to logs/traces.'
        ],
        pitfalls: [
          'Logging large unstructured blobs without request IDs, making incident investigation slow and expensive.',
          'Alerting on infrastructure symptoms that do not map to user impact or a clear action.',
          'Using high-cardinality user or order IDs as metric labels and exploding time-series cost.',
          'Sampling away exactly the slow or failed traces needed during an incident.',
          'Building dashboards that show host trivia before SLO burn, dependency health, and recent deploys.'
        ],
        interviewPrompts: [
          'Teach back how metrics, logs, and traces answer different production debugging questions.',
          'Design the first screen of a checkout dashboard using RED and USE.',
          'Explain how a correlation ID should move through an API, queue, and worker.',
          'Walk through how you would investigate one failed checkout using metric, trace, and log evidence.'
        ],
        exercises: [
          {
            id: 'checkout-observability-dashboard',
            title: 'Design a dashboard for checkout incidents',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Create the first dashboard screen and logging/tracing context for a checkout flow with payment and inventory dependencies.',
            promptQuestions: [
              'Which RED metrics belong at the top of the service dashboard?',
              'Which USE metrics reveal database, queue, or payment saturation?',
              'What fields must appear in every structured log event?',
              'What alert payload would help an on-call engineer take the first action?'
            ],
            hints: [
              'Start with SLO burn and user impact.',
              'Include recent deploys and dependency health.',
              'Keep metric labels bounded.'
            ]
          },
          {
            id: 'correlated-log-builder',
            title: 'Build a correlated log event',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Complete a JavaScript helper that creates a structured log event with request and trace context.',
            starterCode: [
              'function buildLogEvent(context, details) {',
              '  return {',
              '    timestamp: new Date().toISOString(),',
              '    level: details.level,',
              '    service: context.service,',
              '    // TODO: include version, region, route, request_id, trace_id, user_id.',
              '    // TODO: include error_code, dependency, latency_ms, and message.',
              '  };',
              '}'
            ].join('\n'),
            solution: [
              'function buildLogEvent(context, details) {',
              '  return {',
              '    timestamp: new Date().toISOString(),',
              '    level: details.level,',
              '    service: context.service,',
              '    version: context.version,',
              '    region: context.region,',
              '    route: context.route,',
              '    request_id: context.requestId,',
              '    trace_id: context.traceId,',
              '    user_id: context.userId,',
              '    error_code: details.errorCode,',
              '    dependency: details.dependency,',
              '    latency_ms: details.latencyMs,',
              '    message: details.message',
              '  };',
              '}'
            ].join('\n'),
            expectedOutput:
              'The helper returns a consistent JSON-compatible event that can be joined with traces and filtered during incidents.'
          }
        ],
        diagram: null,
        related: [
          'monitoring-and-alerting',
          'distributed-tracing',
          'queues-and-workers',
          'api-gateway',
          'incident-management'
        ]
      },
      {
        slug: 'failure-injection-and-incidents',
        title: 'Failure injection and incidents',
        summary:
          'Practice chaos thinking, write useful runbooks, respond to incidents calmly, and design graceful degradation before outages force the lesson.',
        duration: '60-75 min',
        whyItMatters:
          'Every meaningful system fails. Mature teams reduce surprise by testing failure paths, preparing recovery steps, and learning without blame when reality exposes a gap.',
        sections: [
          {
            heading: 'Failure injection starts with a hypothesis',
            body: `Failure injection is controlled learning, not random breakage. A good experiment starts with a hypothesis: "If the payment gateway p95 increases to 2 seconds for 10 minutes, checkout should keep accepting saved-card payments, reject new-card retries after one attempt, and keep SLO burn below 2x." The experiment also names blast radius, stop conditions, dashboards, owner, communication channel, and rollback command. Start in staging, then a tiny production cohort, then a broader scope only after evidence supports it.

This matters in production because untested fallback paths are often fictional. Code may say "use cache on error," but the cache entry may not contain enough data, the timeout may be longer than the user budget, or the alert may not fire until the budget is gone. Controlled experiments turn assumptions into evidence before a real outage forces the same test with customers watching.`,
            bullets: [
              'Write the failure hypothesis, expected user behavior, blast radius, owner, stop condition, and rollback before injecting faults.',
              'Start with low-risk faults such as latency, timeouts, dropped messages, stale cache, or one disabled dependency.',
              'Use experiments to validate fallback behavior, telemetry, alerts, and human response.'
            ]
          },
          {
            heading: 'Concrete failure scenarios to practice',
            body: `Useful scenarios match the system's real dependencies. For an API, inject 500 ms and 2,000 ms downstream latency, connection resets, DNS failures, and elevated 5xx responses. For a queue, pause consumers, poison a small percentage of messages, or slow one shard. For a database, simulate read-replica lag, lock waits, connection-pool exhaustion, or disk nearing full. For a regional system, drain one zone or route a small cohort away from a region.

The key is to measure both technical and user outcomes. If a queue consumer is paused, does oldest-message age alert before users notice? If a read replica lags by 90 seconds, does the UI label data as stale or show incorrect account balances? If a dependency returns 5xx, do retries respect budgets or stampede? Production value comes from finding the gap between design diagrams and actual behavior.`,
            bullets: [
              'Pick scenarios from real dependency risks: latency, timeout, partial outage, stale data, queue backlog, and regional failover.',
              'Measure SLO burn, fallback rate, queue age, retry volume, and customer-visible behavior.',
              'Keep blast radius small and stop immediately when guardrail metrics cross the limit.'
            ],
            codeExample: {
              title: 'Small-scope latency injection sketch',
              language: 'bash',
              code: [
                '# Example shape for a controlled experiment command.',
                '# Scope: 1% of checkout traffic in staging-like production cohort.',
                '',
                'export SERVICE=checkout-api',
                'export DEPENDENCY=payment-gateway',
                'export COHORT=chaos-1-percent',
                'export ADDED_LATENCY_MS=750',
                'export DURATION_MINUTES=10',
                '',
                'echo "Inject ${ADDED_LATENCY_MS} ms latency into ${DEPENDENCY} for ${COHORT}"',
                'echo "Watch: checkout SLO burn, payment timeout rate, retry count, p95 latency"',
                'echo "Stop if burn_rate_5m > 6 or checkout error_ratio > 1%"',
                '',
                '# chaosctl inject latency \\',
                '#   --service "$SERVICE" --dependency "$DEPENDENCY" --cohort "$COHORT" \\',
                '#   --latency-ms "$ADDED_LATENCY_MS" --duration "${DURATION_MINUTES}m"'
              ].join('\n')
            }
          },
          {
            heading: 'Runbooks that a tired responder can use',
            body: `A runbook should be concrete enough for someone awakened at 03:00. It starts with symptoms and scope, then links dashboards, owners, dependencies, recent deploys, and safe mitigations. Good steps use decision points: "If queue oldest age is above 10 minutes and worker CPU is below 60 percent, scale workers; if CPU is above 85 percent, disable image enrichment first." The runbook should also say what not to do, such as "Do not replay payment messages until idempotency keys are verified."

In production, runbooks reduce cognitive load and prevent unsafe heroics. They also improve incident handoff because each action has expected evidence. A mitigation step should say how to verify it worked: error ratio drops, backlog drains, p95 recovers, customer tickets slow, or SLO burn returns below threshold. If the runbook requires a command, include the command shape and the rollback command next to it.`,
            bullets: [
              'Start with symptoms, customer impact, dashboards, owner, dependencies, and safest mitigations.',
              'Use if/then decision points tied to metrics rather than vague architecture descriptions.',
              'Include verification signals and rollback steps for every mitigation.'
            ],
            codeExample: {
              title: 'Queue backlog runbook excerpt',
              language: 'bash',
              code: [
                '# Symptom: payment-capture queue oldest_message_age_seconds > 600',
                '# Impact: orders may show paid late; duplicate capture risk if replay is unsafe.',
                '',
                '1. Confirm scope',
                '   open dashboard: queue age, worker CPU, payment gateway errors, deploy markers',
                '   check top shard and message type',
                '',
                '2. Mitigate safely',
                '   if worker_cpu < 60% and payment_gateway_error_ratio < 0.5%:',
                '     scale workers from 20 to 35',
                '     # kubectl scale deploy/payment-capture-worker --replicas=35',
                '',
                '   if payment_gateway_error_ratio >= 0.5%:',
                '     disable nonessential retries',
                '     # flags set payment_capture_retry_v2=false',
                '',
                '3. Verify',
                '   oldest_message_age should fall for 10 consecutive minutes',
                '   duplicate_capture_count must remain zero',
                '',
                '4. Communicate',
                '   post status update every 15 minutes with impact and next action'
              ].join('\n')
            }
          },
          {
            heading: 'Graceful degradation keeps the core promise alive',
            body: `Graceful degradation means the system provides a reduced but honest experience when part of it is unhealthy. A feed may serve cached items without personalization, search may show popular results when ranking is down, checkout may allow saved-card purchases while disabling new payment methods, and analytics may become eventually consistent. The degraded mode should be designed before failure so product, support, and engineering agree on what users will see.

This matters because all-or-nothing systems turn optional features into outage multipliers. If recommendations depend on five services and the home page fails whenever any one is slow, convenience features own the availability of the core product. Degradation should preserve the most important user promise, communicate limitations clearly, and avoid corrupting data. It should also be observable: teams need to know when they are serving stale, cached, partial, or read-only responses.`,
            bullets: [
              'Identify the core user promise and separate it from optional enrichments.',
              'Serve cached, partial, read-only, or lower-fidelity responses when dependencies are unhealthy.',
              'Emit metrics for degraded responses so reduced service does not become invisible.'
            ],
            codeExample: {
              title: 'Fallback path with explicit degraded response',
              language: 'javascript',
              code: [
                'async function loadHomeFeed(userId, services, metrics) {',
                '  try {',
                '    const personalized = await services.ranker.getFeed(userId, { timeoutMs: 250 });',
                '    metrics.increment("feed.response", { mode: "personalized" });',
                '    return { mode: "personalized", items: personalized, stale: false };',
                '  } catch (error) {',
                '    const cached = await services.cache.get(`feed:fallback:${userId}`);',
                '    if (cached) {',
                '      metrics.increment("feed.response", { mode: "cached_degraded" });',
                '      return {',
                '        mode: "cached_degraded",',
                '        items: cached.items,',
                '        stale: true,',
                '        message: "Showing a recent feed while personalization recovers."',
                '      };',
                '    }',
                '    metrics.increment("feed.response", { mode: "popular_degraded" });',
                '    return { mode: "popular_degraded", items: await services.popularFeed(), stale: true };',
                '  }',
                '}'
              ].join('\n')
            }
          },
          {
            heading: 'Incident roles, communication, and postmortems',
            body: `During an incident, roles reduce chaos. The incident commander coordinates, the technical lead drives diagnosis and mitigation, the communications lead posts updates, and scribes record timestamps and decisions. One person can hold multiple roles in a small team, but the responsibilities should be explicit. Updates should state impact, scope, current mitigation, next update time, and whether customer action is needed. Silence creates anxiety even when engineers are working hard.

The postmortem converts pain into system improvement. A useful structure includes summary, timeline, customer impact, detection, contributing factors, what went well, what went poorly, and action items with owners and due dates. Blameless does not mean consequence-free; it means the analysis focuses on system conditions that made the incident likely or hard to recover from. Good postmortems produce fewer repeat incidents, better runbooks, sharper alerts, and simpler designs.`,
            bullets: [
              'Assign incident command, technical lead, communications, and scribe responsibilities.',
              'Communicate impact, scope, mitigation, next update time, and customer action clearly.',
              'Write postmortems around contributing conditions, missed signals, and owned follow-up actions.'
            ]
          },
          {
            heading: 'Learning loops and game days',
            body: `Incidents should feed a learning loop. Action items need to be small enough to finish, important enough to matter, and tracked like product work. Examples include lowering a timeout from 5 seconds to 800 ms, adding a missing SLO burn alert, creating a cache fallback, documenting a replay command, or removing a dependency from the critical path. A postmortem with ten vague action items and no owners is another form of incident debt.

Game days keep the loop alive between real incidents. Pick one scenario, announce roles, run the failure or tabletop, and measure detection, diagnosis, mitigation, communication, and cleanup. Over time, teams learn which assumptions are real and which are only in diagrams. This matters in production because resilience is practiced behavior, not a property you get automatically by using managed services or multiple zones.`,
            bullets: [
              'Turn incident findings into owned, dated, testable action items.',
              'Practice tabletop and live game-day scenarios before high-risk launches.',
              'Measure response quality: time to detect, time to mitigate, communication quality, and repeat-incident prevention.'
            ],
            codeExample: {
              title: 'Postmortem template',
              language: 'pseudocode',
              languageLabel: 'Postmortem outline',
              code: [
                'Postmortem: checkout payment timeouts on 2026-07-26',
                '',
                '1. Summary',
                '   09:12-09:48 UTC: 2.1% of checkout attempts failed or exceeded 3 seconds.',
                '',
                '2. Customer impact',
                '   affected regions, affected cohorts, failed requests, delayed orders, support tickets',
                '',
                '3. Timeline',
                '   detection, first page, diagnosis, mitigation, recovery, all-clear',
                '',
                '4. Contributing factors',
                '   payment gateway latency, retry storm, timeout too high, missing fast-burn alert',
                '',
                '5. What went well / poorly',
                '   clear owner, useful traces / slow customer comms, stale runbook',
                '',
                '6. Action items',
                '   owner, due date, success signal, link to tracking ticket'
              ].join('\n')
            }
          }
        ],
        checklist: [
          'Write a failure-injection hypothesis with blast radius, stop condition, owner, and expected user behavior.',
          'Practice realistic scenarios such as dependency latency, queue backlog, stale cache, replica lag, and regional failover.',
          'Create runbook steps with if/then decisions, mitigation commands, verification signals, and rollback steps.',
          'Design degraded modes that preserve the core user promise and emit degraded-response metrics.',
          'Assign incident roles and communicate impact, scope, mitigation, and next update time.',
          'Write postmortems with timeline, contributing factors, and owned action items.'
        ],
        pitfalls: [
          'Running chaos experiments without a hypothesis, blast-radius limit, stop condition, or accountable owner.',
          'Testing only infrastructure failure while ignoring user-visible behavior and SLO burn.',
          'Writing runbooks that explain architecture but omit concrete decision points, commands, and verification.',
          'Letting optional dependencies take down the core user journey because no degraded mode exists.',
          'Producing postmortem action items that are vague, ownerless, or never verified.'
        ],
        interviewPrompts: [
          'Teach back how you would safely inject payment-gateway latency for 1 percent of checkout traffic.',
          'Walk through a runbook for a queue backlog where duplicate processing would be dangerous.',
          'Explain graceful degradation for a feed, search, or checkout system.',
          'Describe a blameless postmortem structure and how action items prevent repeat incidents.'
        ],
        exercises: [
          {
            id: 'payment-latency-chaos-plan',
            title: 'Design a failure-injection experiment',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Plan a safe production experiment that injects payment-gateway latency into a tiny checkout cohort.',
            promptQuestions: [
              'What hypothesis are you testing and what user behavior should remain true?',
              'What blast radius, duration, stop conditions, and dashboards will you use?',
              'Which fallback or retry behavior should activate during the experiment?',
              'How will you communicate before, during, and after the experiment?'
            ],
            hints: [
              'Start with one region or one percent of traffic.',
              'Use SLO burn, timeout ratio, retry count, and checkout conversion as guardrails.',
              'Name the rollback command before the experiment starts.'
            ]
          },
          {
            id: 'runbook-status-helper',
            title: 'Generate incident status updates',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Complete a small JavaScript helper that formats clear incident updates from structured incident state.',
            starterCode: [
              'function statusUpdate(incident) {',
              '  // TODO: return a sentence with impact, scope, mitigation, and next update time.',
              '}',
              '',
              'const incident = {',
              '  impact: "2.1% of checkout attempts are timing out",',
              '  scope: "US mobile users using new cards",',
              '  mitigation: "new-card retries disabled while gateway latency recovers",',
              '  nextUpdate: "09:45 UTC"',
              '};',
              '',
              'console.log(statusUpdate(incident));'
            ].join('\n'),
            solution: [
              'function statusUpdate(incident) {',
              '  return `Impact: ${incident.impact}. Scope: ${incident.scope}. ` +',
              '    `Mitigation: ${incident.mitigation}. Next update by ${incident.nextUpdate}.`;',
              '}',
              '',
              'const incident = {',
              '  impact: "2.1% of checkout attempts are timing out",',
              '  scope: "US mobile users using new cards",',
              '  mitigation: "new-card retries disabled while gateway latency recovers",',
              '  nextUpdate: "09:45 UTC"',
              '};',
              '',
              'console.log(statusUpdate(incident));'
            ].join('\n'),
            expectedOutput:
              'Impact: 2.1% of checkout attempts are timing out. Scope: US mobile users using new cards. Mitigation: new-card retries disabled while gateway latency recovers. Next update by 09:45 UTC.'
          }
        ],
        diagram: null,
        related: [
          'graceful-degradation',
          'queues-and-workers',
          'monitoring-and-alerting',
          'incident-management',
          'feature-flags'
        ]
      }
    ]
  }
];
