/** @type {Record<string, any>} */
export const interactiveLessons = {
  'data-storage/relational-data-modeling': {
    title: 'Interactive database decision lab',
    summary:
      'Use relational storage when correctness and query flexibility matter more than horizontal write scale on day one. The interviewer signal is not just “SQL”, but why SQL protects the risky part of the product.',
    takeaways: [
      'Lead with invariants before schema details.',
      'Choose indexes from the hot query path, not from table structure alone.',
      'Move derived reads out of the transactional path before changing the source of truth.'
    ],
    examples: [
      {
        id: 'checkout',
        label: 'Flash sale checkout',
        title: 'Inventory reservations and payment state need one authoritative write path',
        scenario:
          'An e-commerce team expects short flash-sale spikes, payment retries, and strict “do not oversell” guarantees for the top 100 SKUs.',
        decision: 'Use PostgreSQL or MySQL as the primary store for orders, payment intents, and inventory reservations.',
        why: [
          'Transactions make it straightforward to reserve inventory and create an order atomically.',
          'Unique keys and foreign keys stop duplicate checkout records from silently drifting apart.',
          'Secondary indexes can keep merchant and customer support queries fast without introducing another source of truth.'
        ],
        alternative:
          'Starting with a document store simplifies flexible JSON payloads, but inventory correctness and reconciliation become much harder once retries and partial failures appear.',
        outcome:
          'Use the relational core for writes, then project read models into Redis or Elasticsearch if product queries grow beyond the transactional workload.'
      },
      {
        id: 'reporting',
        label: 'Marketplace reporting',
        title: 'Keep operational writes relational even when analytics grows faster than transactions',
        scenario:
          'A marketplace wants merchant dashboards with filters by store, refund reason, payment method, and time range while the checkout system must stay reliable.',
        decision: 'Store operational truth in a relational primary and ship events into a warehouse or OLAP read model.',
        why: [
          'The transactional database keeps money-moving state correct and auditable.',
          'A separate analytical system absorbs expensive scans and aggregations.',
          'This split preserves one place to repair bad writes and one place to optimize heavy reporting.'
        ],
        alternative:
          'If analytics queries run directly on the primary, lock contention, replica lag, and unpredictable latency will eventually leak into checkout and support flows.',
        outcome:
          'The interview-friendly answer is “relational primary plus derived analytics,” not “one database for everything.”'
      }
    ],
    decisionGuide: {
      prompt: 'Which primary store should own the workload first?',
      options: [
        {
          id: 'postgres',
          label: 'PostgreSQL / MySQL',
          bestFor: 'Orders, billing, inventory, subscriptions, and any workflow with cross-row invariants.',
          chooseWhen: [
            'You need transactions, uniqueness guarantees, and flexible ad hoc queries.',
            'The team can operate replicas, schema changes, and index tuning.',
            'Correctness failures would be more damaging than moderate write-scale limits.'
          ],
          tradeOffs: [
            'Write scale eventually requires partitioning, queue offload, or workload splitting.',
            'Too many indexes increase write cost and storage overhead.',
            'Long-running transactions can create lock contention and noisy-neighbor problems.'
          ],
          alternativeOutcome:
            'If you jump to Cassandra first, you trade easy invariants for scale headroom you may not need yet and make correctness harder to explain during the interview.'
        },
        {
          id: 'document',
          label: 'Document store',
          bestFor: 'Catalog metadata, user-generated content records, and document-shaped entities that evolve often.',
          chooseWhen: [
            'The request path usually reads or writes one document boundary at a time.',
            'Schema evolution speed matters more than joins.',
            'Nested payloads map directly to the product API.'
          ],
          tradeOffs: [
            'Cross-document invariants become application logic instead of database guarantees.',
            'Secondary indexes can become expensive quickly on large mutable documents.',
            'It is easy to over-denormalize and create heavy write amplification.'
          ],
          alternativeOutcome:
            'Using a document store for checkout-style workloads usually leads to compensating workflows and more reconciliation logic than the product team expected.'
        },
        {
          id: 'wide-column',
          label: 'Wide-column store',
          bestFor: 'Massive append-heavy events, telemetry, time-series, and partition-friendly read patterns.',
          chooseWhen: [
            'You already know the partition key and query model.',
            'Write throughput or regional availability matters more than ad hoc joins.',
            'The team accepts eventual consistency or query restrictions in exchange for scale.'
          ],
          tradeOffs: [
            'Data modeling is query-driven and much less forgiving.',
            'Backfills, repairs, and secondary-index semantics are operationally heavy.',
            'Poor partition keys create hot partitions that are painful to fix later.'
          ],
          alternativeOutcome:
            'If you choose this too early, the interview story sounds like premature scaling instead of a deliberate response to workload shape.'
        }
      ]
    },
    caseStudy: {
      title: 'How to explain a relational-first architecture',
      context:
        'You are designing checkout for a fast-growing commerce platform. The risky user-visible failure is overselling or losing payment state, not running out of horizontal scale on week one.',
      steps: [
        {
          phase: '1. Authoritative write path',
          decision: 'Persist carts, inventory reservations, and order state in a relational primary.',
          why: 'This keeps money movement and stock allocation under one transactional boundary.',
          whatIf: 'If reservations live in a separate eventually consistent store, retries and partial failures create reconciliation work and customer-visible oversells.'
        },
        {
          phase: '2. Read scaling',
          decision: 'Send support, dashboard, and browse-heavy reads to replicas or derived views.',
          why: 'You protect the checkout write path while still supporting product and operations queries.',
          whatIf: 'If every query hits the primary, the team eventually fights slow reports instead of business growth.'
        },
        {
          phase: '3. Growth escape hatch',
          decision: 'Add queues, partitioning, or domain splits only after you can name the first bottleneck.',
          why: 'Interviewers trust staged evolution more than a final-state diagram with no migration story.',
          whatIf: 'If you begin with sharding, your answer gets operationally complex before you proved the need.'
        }
      ],
      metrics: ['checkout commit latency', 'deadlock / retry rate', 'inventory reservation conflicts', 'replica lag']
    },
    mermaid: {
      title: 'Relational core with derived read models',
      caption: 'Keep correctness-sensitive writes in one primary system, then project read-heavy or analytical views outward.',
      code: `flowchart LR
    Client[Client apps] --> API[Checkout API]
    API --> SQL[(Relational primary)]
    SQL --> Replica[(Read replica)]
    SQL --> Outbox[Outbox / CDC]
    Outbox --> Cache[Redis cache]
    Outbox --> Search[Search / analytics index]
    Replica --> Support[Support dashboards]
    Cache --> Product[Product read APIs]
    Search --> BI[Reporting and search]
      `
    }
  },
  'data-storage/nosql-landscape': {
    title: 'NoSQL pattern explorer',
    summary:
      'A strong NoSQL answer names the exact model, the access pattern it helps, and the semantic cost you accept in return. “NoSQL because scale” is too shallow for interviews.',
    takeaways: [
      'Different NoSQL families optimize different shapes of work.',
      'Partition keys matter more than brand names.',
      'Polyglot persistence only works when ownership boundaries stay clear.'
    ],
    examples: [
      {
        id: 'profile',
        label: 'Profile service',
        title: 'Document storage fits product records that evolve by feature area',
        scenario:
          'A profile service stores bios, privacy settings, notification preferences, and feature flags that change at different speeds.',
        decision: 'A document store works well when the application usually reads and writes one profile at a time.',
        why: [
          'Nested user settings map naturally to a document boundary.',
          'Feature teams can evolve the payload without coordinating every change through multi-table migrations.',
          'The read path stays simple because the product almost always needs the whole profile.'
        ],
        alternative:
          'A relational schema is still fine if joins and reporting matter more than payload flexibility, but forcing every variant into rigid tables can slow iteration.',
        outcome:
          'The best explanation is not “documents are modern,” but “the access pattern is profile-by-id with evolving nested fields.”'
      },
      {
        id: 'telemetry',
        label: 'IoT telemetry',
        title: 'Wide-column storage wins when writes are huge and reads are partition-friendly',
        scenario:
          'Millions of devices write sensor data every minute, and product queries are usually “device X over the last N hours” or rollups by bucket.',
        decision: 'Use a wide-column store or time-series optimized engine with a carefully chosen partition key.',
        why: [
          'Append-heavy writes stay cheap when the data model matches the read pattern.',
          'Retention policies and bucketed keys control hot partitions and storage cost.',
          'The system tolerates eventual consistency better than a money-moving workflow would.'
        ],
        alternative:
          'If you tried to keep this in a single relational primary, indexes and write amplification would dominate before product complexity did.',
        outcome:
          'You gain scale and availability, but only if the query model is intentionally narrow.'
      }
    ],
    decisionGuide: {
      prompt: 'Pick the NoSQL family that best matches the workload.',
      options: [
        {
          id: 'key-value',
          label: 'Key-value store',
          bestFor: 'Sessions, cache-backed lookups, rate-limit counters, and feature flags.',
          chooseWhen: [
            'Requests are dominated by point lookups by stable key.',
            'The hottest path values latency over query richness.',
            'The system can rebuild or re-derive the data if needed.'
          ],
          tradeOffs: [
            'Secondary query support is minimal or operationally awkward.',
            'Complex filters move back into application code or a separate index.',
            'You still need a story for durability and repair if the data matters.'
          ],
          alternativeOutcome:
            'Using a key-value store as the primary source of truth for rich query workloads usually forces more side systems sooner than expected.'
        },
        {
          id: 'document',
          label: 'Document store',
          bestFor: 'Content records, profiles, listings, and APIs that naturally own one aggregate document.',
          chooseWhen: [
            'Most requests touch one entity boundary.',
            'Schema evolution is frequent and localized.',
            'Teams want to ship features without redesigning a relational schema every sprint.'
          ],
          tradeOffs: [
            'Cross-document joins or strict multi-record invariants are weaker.',
            'Large mutable documents can create surprising write amplification.',
            'Secondary indexes still need thoughtful design and cost monitoring.'
          ],
          alternativeOutcome:
            'If your workload later requires many global joins or relational-style reports, you will probably add another system for those reads.'
        },
        {
          id: 'wide-column',
          label: 'Wide-column / Dynamo-style',
          bestFor: 'Event ingestion, time-series, inboxes, and partition-key-driven reads at large scale.',
          chooseWhen: [
            'You know the dominant partition key and query shape ahead of time.',
            'High write throughput and regional availability are central requirements.',
            'The product tolerates denormalization and repair complexity.'
          ],
          tradeOffs: [
            'Data modeling mistakes are expensive to unwind.',
            'Ad hoc queries and joins are limited or absent.',
            'Operational work such as compaction, repair, and backfills matters a lot.'
          ],
          alternativeOutcome:
            'This is the right answer for telemetry or timelines, but a poor first answer for workflows centered on correctness and flexible reporting.'
        }
      ]
    },
    caseStudy: {
      title: 'Choosing NoSQL without overusing it',
      context:
        'You are asked to design a social product with profiles, feeds, media, and relationship edges. The winning answer usually uses more than one store, but only where the product shape forces it.',
      steps: [
        {
          phase: '1. Preserve the invariant',
          decision: 'Keep correctness-sensitive entities such as billing or moderation state in a stronger primary store.',
          why: 'NoSQL should solve a workload problem, not become the default for every domain.',
          whatIf: 'If every domain moves to the same flexible store, teams later rebuild missing guarantees in application code.'
        },
        {
          phase: '2. Match the product boundary',
          decision: 'Use document storage for profile-shaped aggregates and wide-column patterns for feed or telemetry style access.',
          why: 'This keeps each store close to the hottest request path it serves.',
          whatIf: 'If you use one general store for all shapes, the model becomes a compromise that fits none of them well.'
        },
        {
          phase: '3. Make ownership explicit',
          decision: 'Publish changes into derived stores instead of letting multiple systems accept writes independently.',
          why: 'One clear writer per domain reduces drift and repair effort.',
          whatIf: 'Bi-directional sync sounds flexible, but it usually creates the hardest incidents.'
        }
      ],
      metrics: ['partition hotness', 'p99 read latency by access pattern', 'repair / backfill time', 'derived-store lag']
    },
    mermaid: {
      title: 'Polyglot persistence done intentionally',
      caption: 'Give each storage engine a narrow, explainable job instead of letting multiple stores compete for the same truth.',
      code: `flowchart LR
    App[Product APIs] --> Profile[(Document store)]
    App --> Feed[(Wide-column / KV timeline store)]
    App --> Blob[(Object storage)]
    App --> Search[(Search index)]
    Profile --> Events[Change events]
    Feed --> Events
    Events --> Search
    Events --> Analytics[Analytics warehouse]
      `
    }
  },
  'data-storage/storage-selection': {
    title: 'Storage mix simulator',
    summary:
      'The best storage answer is a portfolio with a small number of clearly-scoped systems. Explain why each store exists, which request path it owns, and what happens if you choose differently.',
    takeaways: [
      'Start from the riskiest invariant, then fan out to derived views.',
      'Every extra datastore needs an owner, sync plan, and incident story.',
      'Not choosing a specialized database can be the mature decision.'
    ],
    examples: [
      {
        id: 'social',
        label: 'Social product',
        title: 'Use multiple stores only where the workload shape truly changes',
        scenario:
          'A social product needs user profiles, media uploads, a feed, search, and notifications with uneven traffic growth across each domain.',
        decision:
          'Use a relational or document primary for user/account state, object storage for media, a feed-optimized store or cache layer for timelines, and a search index for retrieval.',
        why: [
          'Media belongs in cheap durable blob storage, not in the transactional database.',
          'Search retrieval is a derived read model and should not become the write authority.',
          'Feed fan-out and ranking usually need a different scaling strategy than account state.'
        ],
        alternative:
          'If you force everything into one general database, either media and search become awkward, or the core account workflows inherit unnecessary operational complexity.',
        outcome:
          'Interviewers like hearing “one primary truth plus purpose-built secondary systems” because it sounds operable, not trendy.'
      },
      {
        id: 'b2b',
        label: 'B2B SaaS',
        title: 'A smaller operational portfolio often beats a theoretically perfect one',
        scenario:
          'A B2B SaaS product has moderate scale, tenant-isolated data, exports, dashboards, and full-text search, but the team is still small.',
        decision:
          'Choose a relational primary, object storage for exports, and perhaps one search system only if product search is truly central.',
        why: [
          'A small team can run this stack reliably and reason about backups and migrations.',
          'Most dashboard and export needs can come from replicas or a warehouse before adopting more operationally heavy systems.',
          'This preserves engineering focus for product work instead of storage sprawl.'
        ],
        alternative:
          'Adding separate graph, time-series, and document systems too early looks sophisticated on a whiteboard but creates on-call and migration cost the team cannot absorb.',
        outcome:
          'The mature answer is to keep the portfolio intentionally small until a bottleneck is measurable.'
      }
    ],
    decisionGuide: {
      prompt: 'Which storage mix best matches the product stage?',
      options: [
        {
          id: 'single-primary',
          label: 'One primary + a cache',
          bestFor: 'Early-stage products with one dominant business workflow and a small team.',
          chooseWhen: [
            'You can still meet latency and throughput goals with one main store.',
            'Operational simplicity is a competitive advantage.',
            'Derived views can be added later via CDC or queues.'
          ],
          tradeOffs: [
            'You may need to optimize hot paths more aggressively inside the primary.',
            'Some read workloads stay constrained until you split them out.',
            'The primary becomes a very important dependency.'
          ],
          alternativeOutcome:
            'Choosing a larger storage portfolio too early usually makes operations more complex before it makes the product better.'
        },
        {
          id: 'polyglot',
          label: 'Primary + purpose-built secondary stores',
          bestFor: 'Products with clearly distinct workloads such as media, search, analytics, and hot caches.',
          chooseWhen: [
            'The request paths differ enough that one engine is a poor fit for all of them.',
            'You can describe the ownership and synchronization pipeline clearly.',
            'The team is ready to operate and monitor each added system.'
          ],
          tradeOffs: [
            'Backfills, schema evolution, and lag monitoring all get harder.',
            'Failures can hide in the sync path, not only in the source system.',
            'Developers need stronger conventions around source of truth.'
          ],
          alternativeOutcome:
            'This is usually the best answer for mature multi-surface products, but only when the product truly has multiple distinct workload shapes.'
        },
        {
          id: 'warehouse-first',
          label: 'Operational store + warehouse / lakehouse',
          bestFor: 'Products where analytical queries and large historical scans are important but should not hit the transactional path.',
          chooseWhen: [
            'Teams need dashboards, experiments, finance reporting, or historical analysis.',
            'Heavy scans would otherwise damage operational latency.',
            'A short delay for analytics freshness is acceptable.'
          ],
          tradeOffs: [
            'Pipelines can break and create trust issues in dashboards.',
            'Analytical schemas and transformations become another ownership layer.',
            'Near-real-time analytics is possible but more expensive.'
          ],
          alternativeOutcome:
            'If you skip the warehouse and run these queries on the primary forever, product growth eventually turns analytics into an availability risk.'
        }
      ]
    },
    caseStudy: {
      title: 'Defending a storage portfolio in an interview',
      context:
        'You are asked why your system uses multiple datastores. The winning answer is to connect each one to a concrete request path and explain what breaks if you remove it.',
      steps: [
        {
          phase: '1. Name the source of truth',
          decision: 'Pick one operational system that owns correctness-sensitive writes.',
          why: 'This anchors the architecture and keeps repair and reconciliation tractable.',
          whatIf: 'If multiple systems own writes for the same domain, outages become sync and reconciliation incidents.'
        },
        {
          phase: '2. Add purpose-built secondaries',
          decision: 'Introduce search, blob, cache, or warehouse systems only when they remove a specific bottleneck.',
          why: 'This keeps each added dependency easy to justify and easy to operate.',
          whatIf: 'If a datastore has no clear bottleneck attached to it, reviewers hear architecture tourism.'
        },
        {
          phase: '3. Explain the sync path',
          decision: 'Use events, CDC, or background jobs to update derived stores with measured lag.',
          why: 'The data pipeline is part of the architecture, not an implementation detail.',
          whatIf: 'If you hand-wave synchronization, the design sounds incomplete even if the components are sensible.'
        }
      ],
      metrics: ['primary write latency', 'CDC / event lag', 'cache hit ratio', 'warehouse freshness']
    },
    mermaid: {
      title: 'Small, explainable storage portfolio',
      caption: 'Tie each datastore to a narrow job and keep the synchronization path visible.',
      code: `flowchart LR
    API[Product services] --> Primary[(Primary operational store)]
    Primary --> CDC[CDC / event stream]
    API --> Blob[(Object storage)]
    CDC --> Cache[Redis / query cache]
    CDC --> Search[Search index]
    CDC --> Warehouse[Warehouse / BI]
    Cache --> ReadAPI[Hot read APIs]
    Search --> Discovery[Discovery APIs]
      `
    }
  },
  'case-studies/url-shortener': {
    title: 'URL shortener architecture studio',
    summary:
      'This case study should feel like a guided interview. Explore the redirect path, compare code-generation strategies, and see how different storage choices change latency, abuse handling, and operational risk.',
    takeaways: [
      'Optimize the redirect path first because reads dominate.',
      'Keep analytics and abuse enrichment off the critical path.',
      'Choose a code-generation strategy based on collision risk, availability, and operational simplicity.'
    ],
    examples: [
      {
        id: 'marketing',
        label: 'Hot campaign links',
        title: 'A few links become globally hot while writes stay modest',
        scenario:
          'A marketing platform creates only thousands of links per hour, but campaign launches create huge spikes on a handful of redirect keys.',
        decision: 'Store canonical mappings in a durable primary and push hot redirects into Redis or edge caches.',
        why: [
          'The hot path becomes a memory lookup plus redirect response.',
          'Negative caching and request collapsing protect the database during misses.',
          'Analytics stays asynchronous so read latency stays tiny under spikes.'
        ],
        alternative:
          'If every redirect increments counters synchronously in the primary database, a single hot campaign turns analytics into a latency and availability problem.',
        outcome:
          'The best explanation is “fast redirect path, slow analytics path,” with explicit hot-key protection.'
      },
      {
        id: 'custom-alias',
        label: 'Custom aliases',
        title: 'Human-readable aliases shift complexity from reads to writes',
        scenario:
          'A paid tier allows vanity links, reserved words, and expiration policies while keeping redirect latency low.',
        decision: 'Do uniqueness and reserved-word checks on create, then keep redirect lookups simple.',
        why: [
          'Write-time validation keeps the read path deterministic.',
          'Aliases can live in the same mapping table if uniqueness is global.',
          'Abuse review and malware checks can happen asynchronously after creation if the UX permits.'
        ],
        alternative:
          'If alias conflict resolution or safety checks happen on the redirect path, every click pays for a problem that should have been solved at write time.',
        outcome:
          'This is a good interview moment to say “I move complexity toward the colder path.”'
      }
    ],
    decisionGuide: {
      prompt: 'Choose the most defensible design decision for the shortener.',
      options: [
        {
          id: 'sql-primary',
          label: 'Relational primary + Redis',
          bestFor: 'Moderate write volume, clear admin workflows, custom aliases, and manageable metadata.',
          chooseWhen: [
            'You want easy uniqueness checks and support tooling.',
            'The dataset is still small enough that one primary or partitioned SQL system is practical.',
            'The team values operational simplicity and mature failover tooling.'
          ],
          tradeOffs: [
            'Very large global write scale eventually needs partitioning or range allocation.',
            'Hot reads still require cache protection.',
            'Synchronous analytics updates should still be avoided.'
          ],
          alternativeOutcome:
            'This is often the best interview starting point because it keeps the explanation grounded and easy to evolve.'
        },
        {
          id: 'kv-primary',
          label: 'Key-value primary + cache',
          bestFor: 'Pure code-to-URL lookups with simple metadata and extremely predictable request paths.',
          chooseWhen: [
            'The system mostly does point reads and point writes by short code.',
            'The product does not need rich administrative queries.',
            'The team is comfortable moving some guarantees into application logic.'
          ],
          tradeOffs: [
            'Support queries, abuse tooling, and custom alias workflows can become awkward.',
            'Range scans or ad hoc filters usually need another system.',
            'Collision or uniqueness workflows may require extra coordination.'
          ],
          alternativeOutcome:
            'This can be the right evolved design, but as a first answer it needs a stronger explanation of uniqueness and admin tooling.'
        },
        {
          id: 'random-ids',
          label: 'Random IDs',
          bestFor: 'Multi-region creation flows where local availability matters more than sequential simplicity.',
          chooseWhen: [
            'You want to reduce coordination across regions.',
            'Collision probability is low enough or easy to check.',
            'ID predictability needs to be lower than a counter-based scheme.'
          ],
          tradeOffs: [
            'You still need collision handling and reserved-word filtering.',
            'Support workflows cannot infer creation order from the code.',
            'The code space may need to expand sooner if entropy is conservative.'
          ],
          alternativeOutcome:
            'If you choose a single global counter instead, you simplify collision handling but create a more central coordination point.'
        }
      ]
    },
    caseStudy: {
      title: 'Walk the redirect system like an interviewer would',
      context:
        'The case study starts with a simple create API and a much hotter redirect API. The first production risks are hot links, abuse bursts, and analytics fan-out.',
      steps: [
        {
          phase: '1. Create path',
          decision: 'Validate, reserve a code, store metadata, and return the short URL.',
          why: 'Write-time work should absorb alias checks, safety filtering, and expiration metadata.',
          whatIf: 'If these decisions leak into redirect handling, latency and failure risk grow on the hottest path.'
        },
        {
          phase: '2. Redirect path',
          decision: 'Serve from cache first, fall back to the primary store, and emit analytics asynchronously.',
          why: 'This keeps the user-facing path tiny and resilient to reporting bursts.',
          whatIf: 'If clicks synchronously update counters or dashboards, hot campaigns amplify write load at exactly the wrong moment.'
        },
        {
          phase: '3. Growth path',
          decision: 'Add partitioning, edge caches, or regional ranges only after naming the first bottleneck.',
          why: 'Interviewers reward staged evolution and measured trade-offs.',
          whatIf: 'If you begin with the most distributed design, your explanation becomes harder to defend than the workload requires.'
        }
      ],
      metrics: ['redirect p99', 'cache hit rate', 'code collision retries', 'analytics queue lag']
    },
    mermaid: {
      title: 'Shortener critical paths',
      caption: 'Separate the hot redirect path from slower analytics and abuse-processing workflows.',
      code: `flowchart LR
    Creator[Creator] --> WriteAPI[Create link API]
    WriteAPI --> ID[ID generator]
    WriteAPI --> Primary[(Link mapping store)]
    User[Reader] --> Edge[Edge / redirect service]
    Edge --> Cache[(Redis / edge cache)]
    Cache -->|miss| Primary
    Edge --> Queue[Analytics queue]
    Queue --> Analytics[Analytics workers]
    Queue --> Abuse[Abuse / safety pipeline]
      `
    }
  },
  'case-studies/scaling-playbook': {
    title: 'Interactive scaling playbook',
    summary:
      'This lesson should feel like a choose-your-next-bottleneck exercise. Trace how a simple app evolves, what each added component buys you, and what extra operational work it creates.',
    takeaways: [
      'Scale in response to a named bottleneck, not in anticipation of every possible future.',
      'Every new tier changes deployment, observability, and failure handling.',
      'Tell the evolution story in stages so the interviewer can follow the trade-offs.'
    ],
    examples: [
      {
        id: 'monolith',
        label: 'Stage 1 → 2',
        title: 'Move from one app server to a load-balanced stateless tier',
        scenario:
          'Traffic grows from a few hundred requests per second to a few thousand, and deployments now cause visible downtime.',
        decision: 'Make the web tier stateless, put it behind a load balancer, and externalize sessions if needed.',
        why: [
          'This is often the cheapest first scaling step because it improves availability and deploy safety.',
          'It unlocks horizontal app capacity without changing the core data model yet.',
          'Health checks and rolling deploys immediately improve operational maturity.'
        ],
        alternative:
          'Jumping straight to sharding or multi-region before fixing the web tier usually adds complexity before it removes the actual bottleneck.',
        outcome:
          'A good scaling story starts with the simplest component that clearly relieves the current pain.'
      },
      {
        id: 'db-pressure',
        label: 'Stage 2 → 3',
        title: 'Use caches, replicas, and queues before repartitioning the database',
        scenario:
          'Read volume grows quickly, expensive derived work slows requests, and background jobs begin to compete with user traffic.',
        decision: 'Cache hot reads, offload expensive async work to queues, and add read replicas or materialized views.',
        why: [
          'These moves often buy an order of magnitude more headroom with lower migration cost than immediate sharding.',
          'They isolate the critical user path from cold or bursty work.',
          'They create time to learn the long-term access pattern before changing the source-of-truth topology.'
        ],
        alternative:
          'If you shard too early, you inherit routing, rebalancing, and cross-shard query complexity while some of the pressure might have been read-only or async-able.',
        outcome:
          'Sharding becomes a later move once you have evidence that simpler levers are exhausted.'
      }
    ],
    decisionGuide: {
      prompt: 'Which scaling step is most justified next?',
      options: [
        {
          id: 'stateless',
          label: 'Stateless app tier + load balancer',
          bestFor: 'Deployment pain, web-tier saturation, and straightforward horizontal scale.',
          chooseWhen: [
            'Most bottlenecks are CPU or connection pressure in the app tier.',
            'Requests can be served without sticky in-memory state.',
            'Downtime from deploys or single-node failures is already visible.'
          ],
          tradeOffs: [
            'Sessions and file uploads may need externalization.',
            'Configuration and health checks become more important.',
            'This does not fix data-tier bottlenecks by itself.'
          ],
          alternativeOutcome:
            'If you skip this and chase more exotic scaling first, the architecture still suffers from brittle deploys and single-instance risk.'
        },
        {
          id: 'cache-queue',
          label: 'Caching + async work',
          bestFor: 'Read-heavy pressure, burst smoothing, and expensive derived operations.',
          chooseWhen: [
            'The database is hot mostly because of repeated reads or slow secondary work.',
            'Users do not need every operation to finish synchronously.',
            'Queue lag and cache invalidation are manageable trade-offs.'
          ],
          tradeOffs: [
            'You introduce invalidation, duplicate processing, and observability work.',
            'Failures can hide in background pipelines.',
            'Some product flows now become eventually consistent.'
          ],
          alternativeOutcome:
            'This is often the highest-ROI middle stage before partitioning or multi-region changes.'
        },
        {
          id: 'partition',
          label: 'Partitioning / sharding',
          bestFor: 'True single-primary data limits on storage or write throughput.',
          chooseWhen: [
            'You can name the shard key and the dominant access pattern.',
            'Simpler levers such as caches, replicas, and queues are no longer enough.',
            'The team can absorb routing, rebalancing, and migration complexity.'
          ],
          tradeOffs: [
            'Cross-shard joins and backfills get harder.',
            'Operational tooling needs to mature significantly.',
            'Bad shard keys create new hot spots instead of fixing the old one.'
          ],
          alternativeOutcome:
            'Correct when justified, but weak as a first instinct unless you can prove the data tier is truly the bottleneck.'
        }
      ]
    },
    caseStudy: {
      title: 'A staged evolution reviewers can follow',
      context:
        'Start from a single-region web app. Each growth step should answer three questions: what broke first, what change is cheapest now, and what new risk does that change introduce?',
      steps: [
        {
          phase: '1. Reliability baseline',
          decision: 'Stateless app servers behind a load balancer.',
          why: 'This removes single-node web failures and improves deploy safety early.',
          whatIf: 'If the app stays stateful and single-homed, later scaling work builds on a fragile base.'
        },
        {
          phase: '2. Read and async isolation',
          decision: 'Add caches, read replicas, and background queues for cold work.',
          why: 'This usually removes the next biggest pain without changing the data authority yet.',
          whatIf: 'If everything stays synchronous, user-facing latency rises with every new product feature.'
        },
        {
          phase: '3. Data topology change',
          decision: 'Partition or distribute only after the primary store is truly the limiting factor.',
          why: 'This keeps the migration story credible and cost-aware.',
          whatIf: 'If you shard too early, the interview answer becomes operationally noisy without better product outcomes.'
        }
      ],
      metrics: ['deploy recovery time', 'cache hit rate', 'queue lag', 'primary CPU / write saturation']
    },
    mermaid: {
      title: 'Scaling story by stages',
      caption: 'Show how the architecture evolves instead of jumping straight to a final-state diagram.',
      code: `flowchart LR
    Stage1[Stage 1: monolith + primary DB] --> Stage2[Stage 2: load balancer + stateless app tier]
    Stage2 --> Stage3[Stage 3: cache + queue + replicas]
    Stage3 --> Stage4[Stage 4: partitioning / multi-region]
      `
    }
  }
};

/** @param {string} lessonId */
export function getInteractiveLesson(lessonId) {
  return interactiveLessons[lessonId] ?? null;
}
