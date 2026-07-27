/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldPerformanceResilienceChapters = {
  "performance-and-resilience/caching-layers": {
    "title": "Caching layers and cache placement",
    "readingTime": "75-95 min",
    "premise": "Caching removes repeated work from the critical path only when the layer, key, and freshness contract match the product. This chapter builds a placement model from CDN edges to application memory to database buffer pools, then designs miss behavior that survives stampedes and outages.",
    "parts": [
      {
        "id": "why-cache",
        "heading": "Caching is a correctness and economics decision",
        "paragraphs": [
          "A cache stores a reusable result closer to the consumer or cheaper than recomputing from the source of truth. The win can be latency, origin offload, or cost. The risk is serving stale or wrong data, or creating a thundering herd when the cache fails. Interviews go shallow when candidates add Redis without naming which expensive operation disappears.",
          "Caches never replace invariants. Orders, balances, and entitlements still need an authoritative store. The cache holds projections, rendered fragments, session bags, computed recommendations, or hot metadata with an explicit staleness budget. If you cannot state the maximum acceptable staleness, you are not ready to choose a TTL.",
          "Hit ratio alone is not success. A cache with high hit ratio on tiny keys may still miss the expensive queries. Measure origin load, p95 latency, error rate during misses, and cost. A modest hit ratio that removes the heaviest 5% of queries can be a better design than a vanity 99% hit rate on cheap keys."
        ],
        "keyTerms": [
          {
            "term": "Source of truth",
            "definition": "The authoritative store that remains correct when caches are cold, partitioned, or wrong."
          },
          {
            "term": "Staleness budget",
            "definition": "The maximum age or inconsistency the product tolerates for a cached value."
          },
          {
            "term": "Origin offload",
            "definition": "The reduction in work reaching databases or compute services because caches absorb repeats."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Start every caching answer with the work being eliminated and the freshness the product can tolerate."
        },
        "checkYourself": [
          {
            "prompt": "When is a low hit ratio still acceptable?",
            "reveal": "When the rare hits remove disproportionately expensive work, or when the cache protects only a critical subset such as top-N keys, while the overall system remains within SLO."
          }
        ]
      },
      {
        "id": "placement-layers",
        "heading": "Place caches where they remove the most work",
        "paragraphs": [
          "Client and CDN caches shorten geographic distance for public or semi-public assets and pages. They shine for immutable versioned assets, product images, and cacheable HTML or API responses with careful Vary headers. Personalized pages need fragmented caching or edge logic; dumping per-user HTML into a shared CDN without keys becomes a privacy and correctness bug.",
          "Application-level caches—in-process memory or shared Redis/Memcached—help personalized or computed views: preference blobs, permission sets, rendered recommendation lists, and rate-limit counters. In-process caches are extremely fast but shard affinity and invalidation across instances are harder. Shared caches coordinate many app nodes at the cost of network hops and a new dependency.",
          "Database buffer pools and query result caches reduce repeated page fetches inside the engine. They are not substitutes for an application cache when you need cross-request business keys or cross-instance sharing. Reverse proxies can cache entire HTTP responses for anonymous traffic. Choose the layer by asking which hop is expensive: DNS distance, app CPU, or database I/O."
        ],
        "keyTerms": [
          {
            "term": "CDN cache",
            "definition": "Geographically distributed edge caching for cacheable responses and static objects."
          },
          {
            "term": "Application cache",
            "definition": "A cache keyed by business identifiers and maintained near application services."
          },
          {
            "term": "In-process cache",
            "definition": "Memory local to one process; fastest path with the weakest cross-instance coherence."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Personalized content usually moves the cache inward to the application layer or uses fragment caching rather than a fully shared anonymous CDN page."
        },
        "checkYourself": [
          {
            "prompt": "How does personalized content change cache placement?",
            "reveal": "Full-page edge caching becomes risky; prefer fragment caches, user-keyed application caches, or edge personalization that keeps private data out of shared public entries."
          }
        ]
      },
      {
        "id": "keys-ttl-cardinality",
        "heading": "Design cache keys, TTLs, and cardinality",
        "paragraphs": [
          "A cache key must encode every dimension that changes the value: tenant, locale, currency, feature flag cohort, schema version, and authorization variant when needed. Missing dimensions cause cross-talk bugs that look like random corruption. Immutable asset keys with content hashes make invalidation trivial because new content gets a new key.",
          "TTL is a product knob. Short TTLs limit staleness but increase origin load. Long TTLs need explicit invalidation on writes. Some values use soft TTLs with background refresh so users rarely block on recomputation. Negative caching of misses prevents repeated origin hammering for absent keys, but negative entries need short TTLs.",
          "Cardinality can destroy a cache. Per-request unique keys, keys containing raw timestamps, or unbounded user×item combinations blow memory without reuse. Estimate working set size and eviction policy—LRU, LFU, or size-aware—before promising hit ratios."
        ],
        "keyTerms": [
          {
            "term": "Cache key",
            "definition": "The lookup identity that must uniquely identify one reusable value including all varying dimensions."
          },
          {
            "term": "TTL",
            "definition": "Time to live: how long a cache entry may be served before refresh or eviction."
          },
          {
            "term": "Negative caching",
            "definition": "Caching the absence of a value to avoid repeating expensive miss paths."
          }
        ],
        "workedExample": {
          "title": "Key design for a product details page",
          "body": "Separate public fragments from user-specific overlays so edge and app caches can cooperate.",
          "code": "CDN:  GET /static/p/{productId}.{contentHash}.js   (immutable)\nApp:  product:v3:{productId}:locale={loc}:currency={cur}\nApp:  inventory:soft:{productId}   TTL=5s or pub/sub invalidate\nApp:  price:tier:{productId}:{priceCohort}\nDo NOT cache: cart, checkout session, payment methods\nStampede: single-flight lock per productId on miss",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "Unstable keys with timestamps or request IDs create a cache that never hits."
        },
        "checkYourself": [
          {
            "prompt": "What would you cache for a product details page?",
            "reveal": "Cache static attributes and rendered public fragments with versioned keys, short-TTL or invalidated inventory/price snapshots, and keep cart and payment state on the authoritative path."
          }
        ]
      },
      {
        "id": "misses-stampedes",
        "heading": "Plan for misses, stampedes, and cache outages",
        "paragraphs": [
          "Every cache eventually misses. The origin path must be correct and able to absorb a surge. Request coalescing or single-flight ensures one miss recomputes while others wait. Probabilistic early expiration and jittered TTLs prevent synchronized expiry of popular keys. Warm critical keys after deploys or failovers when the working set is known.",
          "Cache outages are distinct from misses: the dependency is gone. Applications should fail open to origin with shedding if needed, or fail closed for noncritical decorative data. Circuit breakers prevent a downed Redis from turning every request into a slow timeout. Timeouts on cache calls must be tighter than origin timeouts.",
          "Observe hit ratio, hit latency, miss latency, origin QPS, and eviction rate. Alert on sudden hit-ratio cliffs and origin saturation, not only on cache CPU. Load tests should include cold-start scenarios; warm-only tests lie."
        ],
        "keyTerms": [
          {
            "term": "Cache stampede",
            "definition": "Many concurrent misses for one key overloading the origin with duplicate recomputation."
          },
          {
            "term": "Single-flight",
            "definition": "Coalescing concurrent miss handlers so only one recomputation runs per key."
          },
          {
            "term": "Fail open",
            "definition": "Bypassing a broken cache dependency and serving from origin when safe."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Describe stampede protection and origin behavior when the cache cluster disappears."
        },
        "checkYourself": [
          {
            "prompt": "Why can a cold cache after a restart cause an outage?",
            "reveal": "A sudden miss storm sends previously cached traffic to the origin at once, exceeding database or compute capacity even though steady-state traffic was fine."
          }
        ]
      },
      {
        "id": "multi-layer-coherence",
        "heading": "Multi-layer caches and coherence instincts",
        "paragraphs": [
          "Multiple layers compound staleness. A CDN can serve HTML that embeds an API response already stale in Redis. Prefer short outer TTLs, explicit purge APIs, or versioned URLs that bypass layers atomically. Document which layer is authoritative for invalidation signals.",
          "Read-through versus explicit population affects who owns misses. Transparent caches are convenient but can hide origin load. Application-managed caches make ownership clear at the cost of more code. Either way, define coherency relative to writes in the next lesson's patterns.",
          "In interviews, draw the layers, annotate TTLs, and mark which requests skip caches for read-your-writes. That drawing is often worth more than naming a cache product."
        ],
        "callout": {
          "tone": "tip",
          "body": "Versioned immutable URLs are the simplest cross-layer invalidation strategy for static and semi-static assets."
        },
        "checkYourself": [
          {
            "prompt": "Why do nested caches make staleness harder?",
            "reveal": "Each layer can independently retain an old value, so a write may need coordinated invalidation or version bumps across CDN, proxy, and application caches."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Caches eliminate named work under a stated staleness budget; they are not sources of truth.",
        "Place caches at the layer that removes the expensive hop without leaking personalized data.",
        "Keys must encode every varying dimension; TTLs and cardinality determine real hit rates.",
        "Miss storms and cache outages need single-flight, timeouts, and origin capacity planning."
      ],
      "nextSteps": [
        "Design keys and TTLs for a multi-tenant SaaS settings API.",
        "Explain how you would protect origin during a Redis failover.",
        "Draw CDN plus application cache layers for a news homepage with personalization."
      ]
    }
  },
  "performance-and-resilience/cache-invalidation": {
    "title": "Cache invalidation and update patterns",
    "readingTime": "80-100 min",
    "premise": "Invalidation is the hard half of caching. This chapter compares cache-aside, write-through, write-behind, refresh-ahead, and explicit invalidation so you can describe what happens after a write—not only what happens on a lucky hit.",
    "parts": [
      {
        "id": "after-the-write",
        "heading": "Design for the moment after a write",
        "paragraphs": [
          "A cache that is only described on the read path is unfinished. Writers create the coherence problem: who updates or drops which keys, how concurrent writers interact, and what users see in the gap. Interviewers probe this because production incidents often come from stale overwrites or missed invalidations.",
          "Eviction is not invalidation. LRU dropping a cold key does not guarantee that a hot key reflecting old data is gone. TTL expiry is a blunt invalidation schedule. Explicit invalidation is an event. Mixing these concepts confuses debugging.",
          "Choose patterns based on read/write mix, durability needs, and operational simplicity. There is no universal best; there is a best fit for the invariant."
        ],
        "keyTerms": [
          {
            "term": "Invalidation",
            "definition": "Actively marking or deleting cached entries so subsequent reads refetch fresh data."
          },
          {
            "term": "Eviction",
            "definition": "Removing entries under pressure or policy without asserting product-level freshness."
          },
          {
            "term": "Coherence",
            "definition": "The degree to which cached views match the source of truth after updates."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "After proposing a cache, immediately narrate the write path and the stale window."
        },
        "checkYourself": [
          {
            "prompt": "Why is eviction not the same as invalidation?",
            "reveal": "Eviction frees memory based on policy; it does not systematically remove entries that became wrong after a write."
          }
        ]
      },
      {
        "id": "cache-aside",
        "heading": "Cache-aside as the default pattern",
        "paragraphs": [
          "In cache-aside (lazy loading), the application reads the cache, on miss loads the database, then populates the cache. The database remains the source of truth. This pattern fits read-heavy workloads and is easy to reason about. On writes, the application typically updates the database then deletes or updates the cache key.",
          "Delete-on-write is often safer than set-on-write for cache-aside: concurrent readers that miss will reload from the database rather than racing to set stale values. Still, concurrent writers and delayed deletes across replicas need care. Idempotent deletes and version checks help.",
          "Stampede risk remains on popular keys. Pair cache-aside with single-flight and jitter. Occasional misses should be acceptable; if misses are catastrophic, warm or refresh-ahead may be required."
        ],
        "keyTerms": [
          {
            "term": "Cache-aside",
            "definition": "Application-managed pattern that loads the cache lazily on miss from the source of truth."
          },
          {
            "term": "Delete-on-write",
            "definition": "Invalidating a cache key after updating the database so the next reader reloads."
          },
          {
            "term": "Stale overwrite",
            "definition": "A race where an older computation writes back to the cache after a newer value was stored."
          }
        ],
        "workedExample": {
          "title": "Cache-aside read/write sketch",
          "body": "Pseudocode showing delete-on-write to reduce stale set races.",
          "code": "read(key):\n  val = cache.get(key)\n  if val is not None: return val\n  val = db.read(key)           # single-flight around this\n  cache.set(key, val, ttl)\n  return val\n\nwrite(key, new_val):\n  db.write(key, new_val)\n  cache.delete(key)            # prefer delete over set\n  # optional: publish invalidate to other layers",
          "language": "text"
        },
        "callout": {
          "tone": "tip",
          "body": "For cache-aside, prefer invalidate-after-commit over writing computed values in the same breath as the DB write unless you have versions."
        },
        "checkYourself": [
          {
            "prompt": "Which cache strategy fits product catalog reads?",
            "reveal": "Cache-aside or read-through with delete/version invalidation on catalog edits, plus short TTLs for inventory-sensitive fields."
          }
        ]
      },
      {
        "id": "write-through-write-behind",
        "heading": "Write-through and write-behind",
        "paragraphs": [
          "Write-through updates the cache and the source of truth together on the write path, so subsequent reads usually see fresh data without a miss. It simplifies read-after-write at the cost of write latency and needing a reliable dual update. If the cache update fails after the database write, you still need repair or invalidation.",
          "Write-behind (write-back) acknowledges after writing the cache and persists to the database asynchronously. Throughput rises and write spikes smooth out, but a crash can lose acknowledged writes. Replay buffers, WAL-like durability in the cache tier, and careful acknowledgements are mandatory. Money, inventory, and audit-critical records rarely tolerate classic write-behind.",
          "Interview answers should treat write-behind as an explicit durability trade. If you propose it for payments, expect pushback—and deserve it."
        ],
        "keyTerms": [
          {
            "term": "Write-through",
            "definition": "Writing to cache and source of truth in the same request path before acknowledging success."
          },
          {
            "term": "Write-behind",
            "definition": "Updating the cache first and persisting to durable storage asynchronously."
          },
          {
            "term": "Durability window",
            "definition": "The period during which an acknowledged write may still be lost under write-behind designs."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not use write-behind for orders, payments, or audit-critical records unless a durable log backs the acknowledgement."
        },
        "checkYourself": [
          {
            "prompt": "Why is write-behind risky for orders or payments?",
            "reveal": "Clients may receive success before durable persistence; a crash can lose or reorder money-moving writes that the business already treated as final."
          }
        ]
      },
      {
        "id": "refresh-and-explicit",
        "heading": "Refresh-ahead, versions, and explicit invalidation",
        "paragraphs": [
          "Refresh-ahead recomputes hot keys before TTL expiry, reducing user-visible misses for predictable popular items. It needs good hot-key detection and budget for background work. Explicit invalidation uses key deletes, tag-based purges, or pub/sub notifications when updates are event driven.",
          "Versioning sidesteps many invalidation races. Store contentHash or version in the key or alongside the value; writers bump versions so readers never confuse generations. Immutable object versions make CDN purges optional. Tags group related keys for bulk invalidation of a user's projected views.",
          "Measure stale-read rate, invalidation lag, miss storms after bulk purges, and refresh cost. Bulk invalidation can itself become a denial-of-service against origin if too wide."
        ],
        "keyTerms": [
          {
            "term": "Refresh-ahead",
            "definition": "Proactively refreshing soon-to-expire hot entries before clients miss."
          },
          {
            "term": "Versioned key",
            "definition": "Including a generation token in the cache key so updates create a new entry instead of mutating ambiguity."
          },
          {
            "term": "Tag-based invalidation",
            "definition": "Associating keys with tags so one event can purge a related set."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Prefer immutable versions when you can; they turn invalidation into a key change instead of a distributed delete race."
        },
        "checkYourself": [
          {
            "prompt": "How would you invalidate a user profile across many caches?",
            "reveal": "Bump a profile version used in keys, publish a tag/key delete for user:{id}, and purge CDN fragments that embed the profile, while keeping the database as truth."
          }
        ]
      },
      {
        "id": "races-and-multi-tier",
        "heading": "Races, multi-tier invalidation, and operational practice",
        "paragraphs": [
          "Concurrent writers can resurrect stale values if a slow reader fills the cache after a newer write invalidated it. Compare-and-set with versions, shorter TTLs, or delete-only policies mitigate this. Distributed caches with replication introduce their own lag; a delete on one node may not be instantly visible everywhere.",
          "Multi-tier systems need an invalidation hierarchy: database commit → application cache delete → CDN purge. Ordering and retries matter. Idempotent purge APIs and reconciliation jobs catch missed events.",
          "Document the pattern per data class. Catalog may be cache-aside with delete-on-write; sessions may be write-through; analytics counters may tolerate write-behind. A single global strategy is usually wrong."
        ],
        "callout": {
          "tone": "tip",
          "body": "When debugging stale bugs, log key, version, and invalidation event IDs end to end."
        },
        "checkYourself": [
          {
            "prompt": "What race causes a stale overwrite in cache-aside?",
            "reveal": "A reader starts on an old miss, a writer updates DB and deletes cache, then the slow reader sets the old value back into the cache."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Always specify the write path and stale window for every cache.",
        "Cache-aside with delete-on-write is a strong default for read-heavy data.",
        "Write-through improves read-after-write; write-behind trades durability for throughput.",
        "Versions, tags, and measured invalidation lag keep multi-tier caches coherent."
      ],
      "nextSteps": [
        "Compare delete-on-write versus set-on-write for a profile service.",
        "Design versioned keys for a CDN-backed marketing site.",
        "Explain why a bulk purge might need rate limiting."
      ]
    }
  },
  "performance-and-resilience/queues-and-streams": {
    "title": "Queues, streams, and background work",
    "readingTime": "80-100 min",
    "premise": "Asynchronous pipelines keep user-facing latency bounded while absorbing spikes, fan-out, and slow dependencies. This chapter separates queues from streams, places work off the critical path, and covers lag, retries, dead letters, and ordering—the operational controls interviewers expect.",
    "parts": [
      {
        "id": "off-critical-path",
        "heading": "What belongs off the critical path",
        "paragraphs": [
          "Any work that need not finish before the user receives a useful response is a candidate for asynchronous processing: email and push notifications, media transcoding, search indexing, webhook delivery, fraud feature assembly, and fan-out to millions of followers. Keeping that work inline couples user latency to the slowest dependency and turns traffic spikes into site-wide brownouts.",
          "Not everything can be async. Payment authorization results, permission checks, and inventory reservation usually need synchronous answers or carefully designed reservation protocols. When you move work async, define the user-visible state machine: accepted, processing, completed, failed. Returning 202 without a way to observe progress frustrates products and support teams.",
          "Bursty write traffic is a classic motive. Social posts, IoT ingest, and flash-sale events arrive faster than downstream indexers can handle. Queues and streams provide buffer and load leveling so online writes acknowledge quickly while consumers catch up within a lag SLO."
        ],
        "keyTerms": [
          {
            "term": "Critical path",
            "definition": "The synchronous chain of work that must complete before returning a user response."
          },
          {
            "term": "Load leveling",
            "definition": "Absorbing spikes in a buffer so consumers process at a sustainable rate."
          },
          {
            "term": "Lag SLO",
            "definition": "A target bound on how far behind consumers may fall relative to producers."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Name the user-visible status while async work runs, not only the queue technology."
        },
        "checkYourself": [
          {
            "prompt": "What goes wrong if user-critical work is queued without feedback?",
            "reveal": "Users and clients cannot tell whether the action succeeded, retries multiply duplicates, and support cannot distinguish delay from loss."
          }
        ]
      },
      {
        "id": "queues-vs-streams",
        "heading": "Queues versus streams",
        "paragraphs": [
          "Queues focus on work dispatch: a message represents a job, consumers claim and process it, and successful processing removes or acknowledges it. Competing consumers scale throughput. Ordering is typically per-queue or best-effort. Queues fit task execution such as send email, generate PDF, or call a webhook.",
          "Streams retain an ordered log of events for a retention window. Many consumer groups can independently read the same events, rewind, and rebuild state. Streams fit event sourcing patterns, CDC distribution, analytics fan-out, and any case where multiple downstream systems need the same history. Partition keys determine ordering granularity.",
          "Both models usually provide at-least-once delivery in practical deployments. Exactly-once end-to-end behavior is a property of idempotent consumers plus transactional handoffs, not a magic broker switch. Choosing queue versus stream is choosing work distribution versus durable multi-subscriber history."
        ],
        "keyTerms": [
          {
            "term": "Queue",
            "definition": "A work buffer where messages are consumed as tasks, typically with competing consumers."
          },
          {
            "term": "Stream",
            "definition": "An append-only ordered log that multiple consumer groups can replay independently."
          },
          {
            "term": "Consumer group",
            "definition": "A set of consumers that cooperatively share partitions or shards of a stream."
          }
        ],
        "workedExample": {
          "title": "When to pick which",
          "body": "A quick interview table for queue versus stream selection.",
          "code": "use case                        | prefer\n--------------------------------|--------\nsend password reset email       | queue\ntranscode uploaded video        | queue\nfan-out post to many indexers   | stream\nCDC from orders to warehouse    | stream\nretryable webhook delivery      | queue\nrebuild read models from events | stream",
          "language": "text"
        },
        "callout": {
          "tone": "tip",
          "body": "If multiple independent systems must react to the same fact and possibly replay history, prefer a stream."
        },
        "checkYourself": [
          {
            "prompt": "When does a stream fit better than a queue?",
            "reveal": "When several consumers need the same ordered history, independent progress, and replay—such as CDC, event-driven read models, or analytics pipelines."
          }
        ]
      },
      {
        "id": "ordering-partitions-idempotency",
        "heading": "Ordering, partitions, and idempotent consumers",
        "paragraphs": [
          "Total global ordering does not scale. Systems provide ordering per partition key: all events for user U share a partition and preserve order, while different users interleave freely. Choose keys that match ordering needs without creating hot partitions—celebrity accounts again appear as villains.",
          "Consumers must be idempotent because duplicates happen after retries, rebalances, and at-least-once delivery. Use idempotency keys, natural unique constraints, or versioned upserts. Poison messages that always fail need isolation so they do not block a partition forever.",
          "Side effects such as charging cards or sending emails need especially careful dedupe stores. Processing a stream is easy; making side effects safe is the real design."
        ],
        "keyTerms": [
          {
            "term": "Partition key",
            "definition": "The attribute that colocates records into an ordered shard of a stream or queue."
          },
          {
            "term": "At-least-once delivery",
            "definition": "A delivery promise that messages may be redelivered until acknowledged successfully."
          },
          {
            "term": "Poison message",
            "definition": "A message that repeatedly fails processing and can stall a consumer if not isolated."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Never treat at-least-once delivery as exactly-once side effects. Deduplicate explicitly."
        },
        "checkYourself": [
          {
            "prompt": "How would you handle notification fan-out for a celebrity account?",
            "reveal": "Accept the write quickly, publish to a stream/queue, fan out asynchronously in batches, isolate the hot key with dedicated workers or sharded followee buckets, and keep the synchronous path light."
          }
        ]
      },
      {
        "id": "operational-controls",
        "heading": "Lag, retries, DLQs, and backlogs",
        "paragraphs": [
          "Track backlog age, consumer lag, processing success rate, and retry counts. Lag in messages and in time both matter: a million tiny messages may be fine while a one-hour delay on payments is not. Scale consumers by throughput and by partition count; you cannot exceed partition parallelism without repartitioning.",
          "Retry policies should use bounded attempts, exponential backoff, and dead-letter queues for exhausted messages. Operators need replay tools that are deliberate, not accidental redrive storms. Retention on streams must cover the worst rebuild and outage window you promise.",
          "Queues are not infinite shock absorbers. Disk, quota, and cost limits exist. Admission control on producers and shedding of low-priority events keep the buffer healthy. Treating a queue as unbounded capacity is how silent multi-hour delays accumulate."
        ],
        "keyTerms": [
          {
            "term": "Dead-letter queue",
            "definition": "A holding area for messages that exhausted retries and need inspection or replay."
          },
          {
            "term": "Consumer lag",
            "definition": "How far a consumer group trails the head of a stream or the producer."
          },
          {
            "term": "Redrive",
            "definition": "Replaying messages from a DLQ or backup topic back into the main processing path."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "List metrics: lag age, backlog depth, DLQ rate, and consumer error rate—then tie them to user impact."
        },
        "checkYourself": [
          {
            "prompt": "What metrics tell you an async system is falling behind?",
            "reveal": "Rising consumer lag/age, growing backlog depth, increasing DLQ volume, and user-visible delays in the state machine those consumers advance."
          }
        ]
      },
      {
        "id": "design-patterns",
        "heading": "Outbox, CDC, and choreography patterns",
        "paragraphs": [
          "The transactional outbox pattern writes a business row and an outbox event in one database transaction, then a publisher relays outbox rows to a broker. That avoids dual-write loss between DB and queue. CDC tools can stream database changes directly when schemas and filters allow.",
          "Choreography lets services react to events; orchestration uses a workflow engine to drive steps. Both need idempotency and visible state. Pick choreography for simple fan-out and orchestration for long-running multi-step processes with compensation.",
          "Close interviews by connecting async design to resilience: spikes become lag instead of 500s, provided consumers and SLOs are real."
        ],
        "callout": {
          "tone": "tip",
          "body": "If you publish events after a DB commit in a separate call, name the dual-write failure mode and prefer outbox/CDC."
        },
        "checkYourself": [
          {
            "prompt": "Why does a transactional outbox exist?",
            "reveal": "To atomically record that an event should be published with the business write, preventing lost or duplicate-intent messaging from non-atomic dual writes."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Move non-interactive work off the user path and define visible processing states.",
        "Queues dispatch tasks; streams retain multi-subscriber ordered history.",
        "Design for at-least-once delivery with idempotent consumers and poison-message isolation.",
        "Monitor lag, DLQs, and backlog age; buffers are finite capacity, not infinite safety."
      ],
      "nextSteps": [
        "Design notification fan-out with partitions and hot-key isolation.",
        "Sketch an outbox table and publisher for order-created events.",
        "Write alert thresholds for lag age on a search indexing pipeline."
      ]
    }
  },
  "performance-and-resilience/idempotency-retries-backpressure": {
    "title": "Idempotency, retries, and back pressure",
    "readingTime": "80-100 min",
    "premise": "Distributed systems duplicate messages, time out mid-flight, and overload dependencies. This chapter shows how idempotency keys, restrained retries, and back pressure keep workflows correct under partial failure instead of assuming exactly-once magic.",
    "parts": [
      {
        "id": "design-for-duplicates",
        "heading": "Design for repeated attempts",
        "paragraphs": [
          "Networks fail ambiguously. A client may retry after a timeout even though the server completed the write. Brokers redeliver. Mobile apps tap twice. Correct systems assume duplicates and make them safe. Idempotency means performing an operation once in effect even if invoked many times with the same intent.",
          "Idempotency keys are opaque tokens supplied by clients for unsafe operations such as create payment or place order. The server stores the key with the result and returns the original outcome on retries. Keys need a retention window, uniqueness scope (per user or per API key), and storage that survives the primary write.",
          "Natural idempotency also helps: upsert by natural key, compare-and-set versions, and state machines that ignore illegal transitions. Consumers of at-least-once queues should treat handlers as retryable by construction."
        ],
        "keyTerms": [
          {
            "term": "Idempotency key",
            "definition": "A client-generated token that identifies an intent so retries reuse the original server-side result."
          },
          {
            "term": "Exactly-once illusion",
            "definition": "The mistaken belief that infrastructure alone prevents duplicate side effects without application dedupe."
          },
          {
            "term": "State machine",
            "definition": "A model of allowed entity transitions that rejects duplicate or out-of-order illegal moves."
          }
        ],
        "workedExample": {
          "title": "Payment API idempotency",
          "body": "A minimal contract for safe payment retries.",
          "code": "POST /v1/payments\nIdempotency-Key: 8f3c-...\nBody: {\"amount\": 2599, \"currency\": \"USD\", \"orderId\": \"o_91\"}\n\nServer:\n  begin\n    if seen(key): return stored response\n    create payment row unique(key)\n    call processor with key\n    store response by key\n  commit\n  return response\n\nRetry with same key -> same paymentId/status\nRetry with new key -> new attempt (may be rejected by order constraints)",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "For any create or money-moving API, state the idempotency key scope, storage, and retention."
        },
        "checkYourself": [
          {
            "prompt": "How would you make a payment API safe to retry?",
            "reveal": "Require an idempotency key, persist key→result atomically with the payment record, return the original result on repeats, and reject conflicting payloads for the same key."
          }
        ]
      },
      {
        "id": "retry-with-restraint",
        "heading": "Retry with restraint",
        "paragraphs": [
          "Retries improve availability only for transient failures: network blips, 503s, deadlocks, and leader elections. Validation errors, authorization failures, and conflict responses should fail fast. Retrying non-retryable errors amplifies load and user pain.",
          "Use exponential backoff with jitter so thundering herds do not synchronize. Bound total attempts and total retry budget across layered clients—browser, edge, service, and dependency libraries can multiply retries if unaware of each other. Prefer hedged requests carefully; they can double load.",
          "Distinguish client timeouts from server work still running. Idempotency makes that ambiguity safe. Without it, retries create duplicate orders. Deadline propagation cancels work when the user already left, freeing capacity."
        ],
        "keyTerms": [
          {
            "term": "Exponential backoff",
            "definition": "Increasing delay between retries to give dependencies time to recover."
          },
          {
            "term": "Jitter",
            "definition": "Randomization of retry delays to avoid synchronized retry storms."
          },
          {
            "term": "Retry budget",
            "definition": "A limit on how much of a system's capacity may be spent on retries."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Layered default retries without a shared budget are a common cause of retry storms during brownouts."
        },
        "checkYourself": [
          {
            "prompt": "What is the difference between retry logic and true idempotency?",
            "reveal": "Retries repeat calls; idempotency makes those repeats safe. Retries without idempotency can duplicate side effects."
          }
        ]
      },
      {
        "id": "backpressure",
        "heading": "Back pressure protects the system",
        "paragraphs": [
          "When a dependency is overloaded, continuing to accept unbounded work creates cascading timeouts. Back pressure signals upstream to slow down: bounded queues, HTTP 429 with Retry-After, load shedding, and admission control. The goal is to keep serving high-value traffic rather than failing everything slowly.",
          "Fairness matters. Per-tenant and per-user limits stop noisy neighbors from consuming the fleet. Priority lanes can protect checkout while shedding recommendations. Circuit breakers stop calling a dependency that is clearly down, failing fast with fallbacks.",
          "Queueing is not always kinder than shedding. An unbounded queue turns an outage into an hours-long backlog of obsolete work. Prefer bounded queues with explicit overflow policies: reject, spill to cold storage, or drop low-priority events."
        ],
        "keyTerms": [
          {
            "term": "Back pressure",
            "definition": "Mechanisms that slow or reject incoming work when downstream capacity is exhausted."
          },
          {
            "term": "Load shedding",
            "definition": "Intentionally dropping or refusing lower-priority requests to preserve core capacity."
          },
          {
            "term": "Circuit breaker",
            "definition": "A policy that temporarily stops calling an unhealthy dependency after repeated failures."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say what you shed first under overload and how clients learn to back off."
        },
        "checkYourself": [
          {
            "prompt": "When should a service shed load instead of queueing?",
            "reveal": "When queued work would become obsolete, exhaust memory, or delay recovery—especially if waiting exceeds user usefulness or dependency recovery time."
          }
        ]
      },
      {
        "id": "timeouts-bulkheads",
        "heading": "Timeouts, bulkheads, and dependency isolation",
        "paragraphs": [
          "Timeouts should be shorter than upstream deadlines and tuned to dependency SLOs. An infinite wait is an accidental distributed deadlock. Bulkheads isolate pools of connections and threads per dependency so one slow neighbor cannot exhaust the whole process.",
          "Adaptive concurrency limits adjust in-flight requests based on observed latency and error rates. They outperform static huge thread pools during partial outages. Combine with hedged or alternative fallbacks only when safe and idempotent.",
          "These controls pair with graceful degradation: if recommendations time out, return the core product page. Back pressure without a product fallback still fails users; together they preserve the journey."
        ],
        "keyTerms": [
          {
            "term": "Bulkhead",
            "definition": "Isolating resources so failure or slowness in one dependency cannot consume all capacity."
          },
          {
            "term": "Deadline propagation",
            "definition": "Passing remaining time budgets through service calls so work stops when useless."
          },
          {
            "term": "Adaptive concurrency",
            "definition": "Dynamically limiting in-flight requests based on system health signals."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Set timeouts from the outside in: user deadline first, then each hop gets a smaller slice."
        },
        "checkYourself": [
          {
            "prompt": "Why do bulkheads matter during a single dependency brownout?",
            "reveal": "Without isolation, threads/connections block on the slow dependency and starve unrelated endpoints that could still succeed."
          }
        ]
      },
      {
        "id": "putting-it-together",
        "heading": "Putting idempotency, retries, and shedding together",
        "paragraphs": [
          "A resilient write API validates input, requires an idempotency key, applies admission control, calls dependencies with tight timeouts and circuit breakers, retries only transient errors within budget, and sheds low-priority traffic when saturated. That sentence is an interview-ready architecture.",
          "Observe duplicate rates, retry counts, shed rates, and breaker open events. These are product health signals as much as infrastructure metrics.",
          "Avoid the fantasy of perfect exactly-once pipelines. Aim for at-least-once delivery plus idempotent processing plus visible overload behavior."
        ],
        "callout": {
          "tone": "interview",
          "body": "Speak in controls: idempotency key, retry budget, timeout, breaker, shed policy—not vibes."
        },
        "checkYourself": [
          {
            "prompt": "What failure mode appears if only retries are added to a failing dependency?",
            "reveal": "A retry storm that multiplies load, lengthens queues, and turns a partial outage into a full meltdown."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Assume duplicates; make unsafe operations idempotent with keys and state machines.",
        "Retry only transient errors with backoff, jitter, and layered budgets.",
        "Use back pressure, shedding, and fair limits when dependencies overload.",
        "Isolate dependencies with timeouts, bulkheads, and circuit breakers."
      ],
      "nextSteps": [
        "Specify an idempotency key store schema for order creation.",
        "Design a shed order for a food-delivery API under database saturation.",
        "Trace a single user request's retry budget across three service hops."
      ]
    }
  },
  "performance-and-resilience/observability": {
    "title": "Observability and operational feedback loops",
    "readingTime": "75-95 min",
    "premise": "Metrics, logs, traces, and alerts turn architecture diagrams into systems operators can trust. This chapter covers golden signals, SLIs/SLOs, distributed tracing, domain correctness metrics, and the operational loops that keep designs honest after launch.",
    "parts": [
      {
        "id": "golden-signals-and-slis",
        "heading": "Instrument the golden signals and SLIs",
        "paragraphs": [
          "Latency, traffic, errors, and saturation form a baseline for service health. Track latency as distributions—p50, p95, p99—by endpoint and tenant class. Traffic includes QPS and concurrency. Errors include explicit failures and implicit ones such as silent drop rates. Saturation covers CPU, thread pools, connection pools, disk, and queue depth.",
          "Service level indicators (SLIs) translate those signals into user experience: availability of checkout, freshness of search, success of notification delivery. Service level objectives (SLOs) set targets and error budgets that guide release velocity. Interviews improve when you name SLIs for the design rather than only listing tools.",
          "Async systems need first-class lag and backlog age metrics. Cache systems need hit ratio and origin fallthrough. Replicated databases need replica lag. If a component is load-bearing in your diagram, it needs a signal."
        ],
        "keyTerms": [
          {
            "term": "Golden signals",
            "definition": "Latency, traffic, errors, and saturation as a core health quartet."
          },
          {
            "term": "SLI",
            "definition": "A quantitative measure of user-facing service quality."
          },
          {
            "term": "SLO",
            "definition": "A target value or range for an SLI over a window, often paired with an error budget."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Pick three SLIs for your design and say how you would alert on them."
        },
        "checkYourself": [
          {
            "prompt": "Why are domain metrics important alongside infrastructure metrics?",
            "reveal": "CPU can look fine while payments fail or duplicates spike; domain metrics detect product incorrectness that resource graphs miss."
          }
        ]
      },
      {
        "id": "tracing",
        "heading": "Use traces for multi-hop requests",
        "paragraphs": [
          "Distributed tracing follows a request across services, queues, and storage calls with a trace ID and spans. It reveals where time goes in fan-out designs and which dependency dominates p99. Propagate correlation IDs on HTTP headers and through async message metadata so continuations remain attached to the originating request.",
          "Sampling is necessary at high volume. Head-based sampling is simple; tail-based sampling can keep the interesting slow or erroneous traces. Always log the trace ID in structured logs so humans can pivot from an alert to a narrative of one request.",
          "Traces without consistent span names and attributes become noise. Standardize route names, peer service labels, and error flags. Trace async consumers as linked spans or separate traces with parent references depending on tooling."
        ],
        "keyTerms": [
          {
            "term": "Trace ID",
            "definition": "An identifier shared by all spans belonging to one distributed request journey."
          },
          {
            "term": "Span",
            "definition": "A timed unit of work within a trace, such as an HTTP handler or database call."
          },
          {
            "term": "Correlation ID",
            "definition": "An ID propagated across components to stitch logs and traces for one user action."
          }
        ],
        "workedExample": {
          "title": "What to monitor first in a notification pipeline",
          "body": "A minimal observability checklist for async notifications.",
          "code": "SLIs:\n  - accept_success_rate for enqueue API\n  - delivery_success_rate within 60s\n  - duplicate_send_rate\nMetrics:\n  - queue lag age / depth\n  - provider API latency p95\n  - DLQ rate\nTraces:\n  - produce span + consume span linked by message_id\nLogs:\n  - structured: user_id, message_id, template, attempt, trace_id\nAlerts:\n  - lag age > 2m for 5m\n  - delivery success < 99% for 10m\n  - DLQ rate spike",
          "language": "text"
        },
        "callout": {
          "tone": "tip",
          "body": "Propagate IDs through queues; otherwise async systems become untraceable islands."
        },
        "checkYourself": [
          {
            "prompt": "How would you debug rising p99 latency in a fan-out service?",
            "reveal": "Use traces to see which downstream span grew, check saturation and queue lag, compare error rates by dependency, and verify whether retries or stampedes amplified load."
          }
        ]
      },
      {
        "id": "logs-and-events",
        "heading": "Structured logs and high-cardinality caution",
        "paragraphs": [
          "Structured logs with consistent fields enable search and aggregation. Log identities, outcomes, and error classes, not unbounded payloads. High-cardinality labels in metrics—raw user IDs on every time series—can explode monitoring cost and cardinality limits; keep those in logs/traces instead.",
          "Security and privacy constrain logging. Avoid secrets, raw card data, and unnecessary PII. Tokenize or hash when needed for support workflows.",
          "Event logs for audit differ from debug logs. Privileged actions deserve immutable audit trails with actor, action, target, and reason."
        ],
        "keyTerms": [
          {
            "term": "Structured logging",
            "definition": "Emitting machine-parseable fields rather than only free-text lines."
          },
          {
            "term": "Cardinality",
            "definition": "The number of unique label combinations in a metric; unchecked growth is expensive."
          },
          {
            "term": "Audit trail",
            "definition": "A durable record of sensitive actions for security and compliance review."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not put unbounded user IDs on metric labels; put them in logs and traces."
        },
        "checkYourself": [
          {
            "prompt": "Where should a per-request user ID live for debugging?",
            "reveal": "In structured logs and trace attributes, not as a Prometheus-style metric label on high-volume series."
          }
        ]
      },
      {
        "id": "alerting-runbooks",
        "heading": "Alert on symptoms and close the loop",
        "paragraphs": [
          "Alert on user-impacting symptoms and SLO burn, not on every CPU blip. Pages should be rare, actionable, and owned. Include links to dashboards, traces, and runbooks. Symptom alerts like checkout success dropping beat cause alerts like disk at 70%—though saturation warnings still help early detection.",
          "Runbooks turn alerts into practiced steps: mitigate, diagnose, escalate, recover. Drills and game days validate that runbooks work. Near misses deserve review as much as full incidents.",
          "Observability without response loops is decorative. Close the loop: signal → alert → action → learning → design change."
        ],
        "keyTerms": [
          {
            "term": "Error budget",
            "definition": "Allowed unreliability derived from an SLO before release policy should tighten."
          },
          {
            "term": "Runbook",
            "definition": "Documented steps to mitigate and diagnose a known class of alert."
          },
          {
            "term": "Symptom-based alerting",
            "definition": "Alerting on user impact rather than only low-level resource anomalies."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Mention runbooks and drills when you claim a multi-region or failover design is operable."
        },
        "checkYourself": [
          {
            "prompt": "Why alert on checkout success rate rather than only CPU?",
            "reveal": "Checkout success is the user symptom; CPU may be healthy during logic bugs, dependency auth failures, or partial regional issues."
          }
        ]
      },
      {
        "id": "observability-in-designs",
        "heading": "Bake observability into the architecture answer",
        "paragraphs": [
          "For each major box in your design—API, cache, queue, database, third party—name one metric and one failure signal. For the critical user journey, name a trace path and an SLO. This habit elevates architecture answers from drawings to operable systems.",
          "Capacity and cost work also need signals: utilization, unit cost per request, and cache offload. Observability is how those controls are steered.",
          "Avoid tool name-dropping without semantics. Prometheus versus vendor X matters less than whether lag and domain failure modes are visible."
        ],
        "callout": {
          "tone": "tip",
          "body": "If your diagram has a queue, your metrics list must include lag age."
        },
        "checkYourself": [
          {
            "prompt": "What would you monitor first in a notification pipeline?",
            "reveal": "Enqueue success, delivery success within a time budget, consumer lag age, provider errors, duplicate sends, and DLQ rate—wired to symptom alerts."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Use golden signals plus domain SLIs/SLOs, not only CPU graphs.",
        "Propagate trace and correlation IDs across services and async boundaries.",
        "Keep metrics cardinality sane; put identities in structured logs and traces.",
        "Alert on symptoms with runbooks and drills that close the operational loop."
      ],
      "nextSteps": [
        "Write SLIs/SLOs for a multi-step checkout journey.",
        "List span boundaries for an API that enqueues and later sends email.",
        "Convert three cause-based alerts into symptom-based ones."
      ]
    }
  }
};
