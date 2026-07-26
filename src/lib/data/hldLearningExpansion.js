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
        duration: '35-45 min',
        whyItMatters:
          'Good system design starts with the real critical path. When you know where a request spends time, you can debug latency, choose the right optimization, and avoid adding infrastructure that does not help the user.',
        sections: [
          {
            heading: 'The path before your code runs',
            body:
              'A user action begins long before the application handler receives a request. DNS resolution, TCP connection setup, TLS negotiation, routing, and edge policy checks all add time and failure modes.',
            bullets: [
              'DNS may be fast from cache or slow when recursive resolution and low TTLs are involved.',
              'TLS protects the request but adds handshake work unless connections are reused.',
              'CDNs, API gateways, WAFs, and load balancers can reject, redirect, retry, or reshape traffic before it reaches the app.'
            ]
          },
          {
            heading: 'The application and storage path',
            body:
              'Once a request lands on an application instance, time is usually spent validating input, checking identity, calling dependencies, reading or writing state, and serializing the response.',
            bullets: [
              'A single endpoint often hides multiple network calls: auth, cache, database, search, payments, or internal services.',
              'Database latency includes connection checkout, query planning, lock waits, disk or memory access, replication coordination, and result transfer.',
              'Serialization, compression, and response size matter when payloads grow or mobile networks are slow.'
            ]
          },
          {
            heading: 'Building a latency budget',
            body:
              'A latency budget assigns rough time limits to each hop so performance work has a target. The point is not perfect precision; it is knowing which layer can afford delay and which cannot.',
            bullets: [
              'Start with the user promise, such as p95 under 300 ms for a read path or p99 under 2 seconds for checkout.',
              'Split the budget across edge, app, cache, database, and downstream calls with room for jitter.',
              'Measure both service time and queue time, because overload often shows up as waiting before work begins.'
            ]
          }
        ],
        checklist: [
          'Draw the full request path from browser to persistent storage and back.',
          'Name the likely p50, p95, and p99 bottlenecks for the path.',
          'Separate latency caused by network hops from latency caused by work inside a service.',
          'Identify one optimization that removes work and one that merely moves work elsewhere.'
        ],
        pitfalls: [
          'Treating the load balancer as the start of the request instead of accounting for DNS, connection setup, and edge behavior.',
          'Optimizing application code while a downstream dependency or queue wait dominates latency.',
          'Using average latency to reason about user experience when tail latency is what users feel.'
        ],
        interviewPrompts: [
          'Teach back what happens when a browser calls a REST API over HTTPS.',
          'Explain aloud where you would look first if p99 latency doubled but p50 stayed flat.',
          'Walk through how connection reuse changes the latency budget for a chatty client.'
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
        duration: '35-45 min',
        whyItMatters:
          'Capacity planning is the bridge between architecture diagrams and operating reality. It helps you avoid both fragile under-provisioning and expensive overbuilding.',
        sections: [
          {
            heading: 'From product behavior to QPS',
            body:
              'Capacity estimates begin with user behavior, not server counts. Translate active users, sessions, actions per session, and peak-to-average ratios into read and write throughput.',
            bullets: [
              'Separate average QPS from peak QPS; many consumer systems see sharp daily or event-driven spikes.',
              'Break traffic into read, write, background, and fan-out paths because each stresses different resources.',
              'Model burstiness explicitly when retries, launches, notifications, or batch jobs can synchronize traffic.'
            ]
          },
          {
            heading: 'Storage growth and retention',
            body:
              'Storage estimates should include object size, indexes, replicas, backups, logs, and retention policy. The raw business object is usually only part of the bill.',
            bullets: [
              'Estimate daily writes as count times average serialized size, then multiply by retention and replication factor.',
              'Indexes can rival or exceed primary data size when queries need many access patterns.',
              'Logs, metrics, traces, and backups grow with traffic and may need separate retention tiers.'
            ]
          },
          {
            heading: 'Utilization curves and right-sizing',
            body:
              'A service can be too small, too large, or simply shaped wrong for the workload. Healthy capacity planning leaves headroom for bursts while watching idle cost.',
            bullets: [
              'CPU-bound services scale differently from memory-bound caches, IO-bound databases, and network-bound gateways.',
              'High average utilization can be dangerous when variance is high; queues grow quickly as a system approaches saturation.',
              'Right-sizing combines autoscaling, reserved capacity, workload smoothing, and retiring unused resources.'
            ]
          }
        ],
        checklist: [
          'Estimate average and peak QPS for each major request path.',
          'Calculate storage growth with indexes, replication, and retention included.',
          'Name the dominant cost driver: compute, storage, network transfer, managed service fees, or observability volume.',
          'Define a target utilization range and the signal that triggers scaling.'
        ],
        pitfalls: [
          'Sizing for average traffic and discovering that the real system is governed by peaks.',
          'Ignoring network egress, logs, backups, and replicas when estimating total cost.',
          'Driving utilization too high without accounting for queueing delay and noisy-neighbor effects.'
        ],
        interviewPrompts: [
          'Explain aloud how you would estimate capacity for a feed service with read-heavy traffic.',
          'Teach back why 70 percent CPU utilization can be healthy for one service and risky for another.',
          'Walk through how cost drivers change when a product adds image upload and global delivery.'
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
        duration: '35-45 min',
        whyItMatters:
          'Most production architecture work is changing systems that already exist. Designs that support versioning, migration, and gradual rollout let teams learn without making every change a high-risk event.',
        sections: [
          {
            heading: 'API versioning and compatibility',
            body:
              'An API is a contract with clients that may update slowly. Evolution-friendly APIs add capabilities without surprising existing callers.',
            bullets: [
              'Prefer additive changes such as new fields, optional parameters, and new endpoints over changing existing semantics.',
              'Use explicit versioning when behavior must change, and publish a deprecation window before removing old behavior.',
              'Design responses so clients tolerate unknown fields and servers tolerate missing optional fields.'
            ]
          },
          {
            heading: 'Migrations without big-bang rewrites',
            body:
              'Safe migrations split a risky change into small reversible steps. The database, application code, and traffic routing rarely need to switch at the same instant.',
            bullets: [
              'For schema changes, use expand-and-contract: add new shape, dual-write or backfill, shift reads, then remove the old shape.',
              'For service rewrites, use the strangler pattern to route one capability at a time to the new implementation.',
              'Keep rollback paths real by monitoring correctness during the migration, not only uptime.'
            ]
          },
          {
            heading: 'Feature flags as architecture tools',
            body:
              'Feature flags are not only product toggles. They are control points for rollout, experiments, dependency changes, and operational recovery.',
            bullets: [
              'Use flags to separate deployment from release, so code can ship before all users see the behavior.',
              'Gate risky paths by tenant, region, cohort, or percentage to limit blast radius.',
              'Retire stale flags quickly; long-lived conditional logic becomes hidden architecture.'
            ]
          }
        ],
        checklist: [
          'Describe how clients remain compatible while an API changes.',
          'Plan a migration as a sequence of reversible steps.',
          'Define how traffic moves gradually from an old path to a new path.',
          'Name the feature flags that must be removed after rollout.'
        ],
        pitfalls: [
          'Treating versioning as a URL naming problem while ignoring behavior compatibility.',
          'Running a one-shot data migration with no dual-read, backfill validation, or rollback plan.',
          'Leaving feature flags in place until nobody knows which path is the real one.'
        ],
        interviewPrompts: [
          'Teach back the expand-and-contract pattern for a database schema migration.',
          'Explain aloud how you would replace a monolith capability using the strangler pattern.',
          'Walk through when you would use API versioning versus an additive change.'
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
        duration: '30-40 min',
        whyItMatters:
          'Reliability is not a vague desire for more nines. SLIs and SLOs turn reliability into a product decision that engineering, product, and operations can reason about together.',
        sections: [
          {
            heading: 'Choosing SLIs that match user experience',
            body:
              'A service level indicator should measure whether users can complete the job they came to do. Infrastructure metrics are useful, but they are not always user promises.',
            bullets: [
              'Availability SLIs often measure successful requests divided by valid requests over a time window.',
              'Latency SLIs should use percentiles for important paths, not only averages across all endpoints.',
              'Correctness and freshness SLIs matter for systems where a fast wrong answer is still a failure.'
            ]
          },
          {
            heading: 'Setting practical SLOs',
            body:
              'A service level objective defines the target for an SLI. Strong SLOs are ambitious enough to protect users and realistic enough to guide trade-offs.',
            bullets: [
              'Set SLOs per user journey or dependency tier instead of applying one target everywhere.',
              'Use historical data and product expectations to choose targets before committing publicly.',
              'Document exclusions carefully so the team does not hide meaningful failures behind policy language.'
            ]
          },
          {
            heading: 'Using error budgets for decisions',
            body:
              'An error budget is the allowed unreliability within an SLO period. Spending it quickly means the system is taking more risk than planned.',
            bullets: [
              'When the budget is healthy, teams can ship features while watching the leading indicators.',
              'When the budget burns too fast, pause risky launches and invest in the failure mode causing the burn.',
              'A feature freeze is most defensible when tied to user-impacting budget burn, not general anxiety.'
            ]
          }
        ],
        checklist: [
          'Define one availability SLI and one latency SLI for a critical user path.',
          'Choose an SLO target and explain why it is not simply 100 percent.',
          'Describe what happens when the error budget is nearly exhausted.',
          'Identify the dashboard signal that product and engineering can review together.'
        ],
        pitfalls: [
          'Measuring server uptime while users fail because dependencies or correctness are broken.',
          'Setting SLOs so strict that every minor deploy becomes an emergency.',
          'Freezing features without connecting the decision to budget burn and user impact.'
        ],
        interviewPrompts: [
          'Teach back the difference between an SLI, an SLO, and an SLA.',
          'Explain aloud when you would freeze feature launches because of error budget burn.',
          'Walk through an SLO for checkout, search, or message delivery.'
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
        duration: '35-45 min',
        whyItMatters:
          'Observability lets you ask useful questions about production without already knowing the bug. It turns distributed behavior into evidence instead of guesswork.',
        sections: [
          {
            heading: 'How the three pillars work together',
            body:
              'Metrics show trends and alertable symptoms, logs provide event detail, and traces connect work across service boundaries. None of the three is enough by itself.',
            bullets: [
              'Metrics answer what changed, how much, and whether an SLO is burning.',
              'Logs answer what happened for a specific event, user, order, or request.',
              'Traces answer where time was spent and which downstream call contributed to a failure.'
            ]
          },
          {
            heading: 'Correlation IDs and context propagation',
            body:
              'A correlation ID follows one unit of work through gateways, services, queues, and workers. It gives humans and tools a common handle for joining evidence.',
            bullets: [
              'Generate or accept a request ID at the edge and pass it through every downstream call.',
              'Attach high-cardinality identifiers carefully to logs and traces, not broad metrics that become too expensive.',
              'Propagate context through async work so queue consumers remain connected to the user action that created the job.'
            ]
          },
          {
            heading: 'Dashboards that matter',
            body:
              'A good dashboard starts with the user path and the resource that can saturate. RED and USE methods keep attention on symptoms and capacity limits.',
            bullets: [
              'RED for request-driven services: rate, errors, and duration.',
              'USE for resources: utilization, saturation, and errors.',
              'Put SLO burn, dependency health, queue age, and recent deploys near the top so responders see context quickly.'
            ]
          }
        ],
        checklist: [
          'Define the RED metrics for one request-driven service.',
          'Define the USE metrics for one saturated resource such as a database or worker pool.',
          'Show how a correlation ID travels through a synchronous call and an async job.',
          'Design a dashboard that starts with user impact before infrastructure detail.'
        ],
        pitfalls: [
          'Logging massive detail without a request ID, making incidents harder to investigate.',
          'Alerting on noisy infrastructure metrics that do not map to user harm.',
          'Using traces only in development and discovering production sampling is too low during an incident.'
        ],
        interviewPrompts: [
          'Teach back how metrics, logs, and traces answer different debugging questions.',
          'Explain aloud how RED and USE methods shape a service dashboard.',
          'Walk through how you would trace one failed checkout request across services.'
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
        duration: '35-45 min',
        whyItMatters:
          'Every meaningful system fails. Mature teams reduce surprise by testing failure paths, preparing recovery steps, and learning without blame when reality exposes a gap.',
        sections: [
          {
            heading: 'Chaos thinking without recklessness',
            body:
              'Failure injection is controlled learning. Start with a hypothesis, limit blast radius, watch clear signals, and stop immediately when the experiment threatens users.',
            bullets: [
              'Begin in staging or with a small production cohort before testing broad regional or dependency failures.',
              'Inject realistic faults such as latency, timeouts, dropped messages, stale cache entries, and dependency unavailability.',
              'Use experiments to validate fallback behavior and observability, not to prove the system is invincible.'
            ]
          },
          {
            heading: 'Runbooks and incident response',
            body:
              'A runbook turns known failure modes into repeatable steps. It should help a tired responder diagnose, mitigate, communicate, and verify recovery.',
            bullets: [
              'Start with symptoms, owner, dashboards, customer impact, and the safest mitigation.',
              'Prefer reversible mitigations such as disabling a feature flag, reducing traffic, or scaling workers before risky data changes.',
              'Record decisions, timestamps, and evidence so the incident review has facts instead of memory fragments.'
            ]
          },
          {
            heading: 'Graceful degradation and learning',
            body:
              'Graceful degradation keeps the most important user promises alive when part of the system is unhealthy. Postmortems then convert the incident into design improvement.',
            bullets: [
              'Serve cached, partial, read-only, or lower-fidelity experiences when a dependency fails.',
              'Keep critical paths smaller than convenience paths so optional features do not take down core work.',
              'Blameless postmortems focus on contributing conditions, missed signals, and concrete follow-up owners.'
            ]
          }
        ],
        checklist: [
          'Write one failure hypothesis and the signal that would confirm it.',
          'Define the smallest safe blast radius for a failure injection test.',
          'Draft runbook steps for detection, mitigation, communication, and recovery.',
          'Name one degraded mode that preserves the core user promise.'
        ],
        pitfalls: [
          'Running chaos experiments without a stop condition or clear owner.',
          'Writing runbooks that describe architecture but omit concrete mitigation commands or decision points.',
          'Treating postmortems as blame sessions instead of system learning.'
        ],
        interviewPrompts: [
          'Teach back how you would safely test whether a service tolerates database latency.',
          'Explain aloud what belongs in a runbook for a queue backlog incident.',
          'Walk through graceful degradation for a search, feed, or payments system.'
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
