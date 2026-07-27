/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldCaseStudiesChapters = {
  "case-studies/url-shortener": {
    "title": "Case study: URL shortener",
    "readingTime": "75-95 min",
    "premise": "A URL shortener looks tiny until you design the hot redirect path, unique code generation under write bursts, cache stampedes on viral links, and analytics that must never slow a 302. This chapter walks the full interview design from requirements through failure modes.",
    "parts": [
      {
        "id": "requirements-and-traffic-shape",
        "heading": "Requirements, non-goals, and traffic shape",
        "paragraphs": [
          "Start by locking scope. The core product needs two APIs: create a short link from a long URL, and resolve a short code into a redirect. Optional features change the design quickly: custom aliases, expiration, ownership, and click analytics. Decide which are in the MVP and which are stretch. Ask whether links are immutable after creation, whether expired links must return a hard miss or a soft landing page, and whether the shortener must block known malware destinations before the first redirect.",
          "The traffic shape is usually extreme. Writes are modest and bursty around marketing campaigns. Reads dominate by one or two orders of magnitude, and a handful of codes absorb most of the redirect volume. That means average QPS is a weak design driver. Hot-key latency, cache hit rate, and write-side abuse controls matter more than the monthly mean. Capacity estimates should therefore include both averages and spike multipliers.",
          "Non-goals keep the answer honest. You can defer custom domains, A/B experiments on landing pages, and account billing. You should not defer safety validation of destination URLs, reserved-word filtering for aliases, or a plan for analytics that stays off the redirect path. Interviewers listen for this triage: what must be correct on day one, what must be fast, and what can be eventual."
        ],
        "keyTerms": [
          {
            "term": "Read-to-write ratio",
            "definition": "The relative volume of redirect lookups versus link creations; often 100:1 or higher for shorteners."
          },
          {
            "term": "Hot key",
            "definition": "A single short code whose redirect traffic dwarfs the rest of the keyspace and stresses caches and stores."
          },
          {
            "term": "MVP scope",
            "definition": "The minimal feature set you commit to design first, used to avoid inventing an entire product platform mid-interview."
          }
        ],
        "workedExample": {
          "title": "Back-of-envelope capacity sketch",
          "body": "Convert monthly volume into QPS, then apply a hot-key spike so the design is driven by peaks rather than averages.",
          "code": "# Assumptions for an interview sketch\nwrites_per_month = 10_000_000\nreads_per_month = 100_000_000\nseconds_per_month = 30 * 24 * 3600\n\navg_write_qps = writes_per_month / seconds_per_month  # ~3.9\navg_read_qps = reads_per_month / seconds_per_month    # ~38.6\nhot_key_multiplier = 1000\npeak_read_qps = avg_read_qps * hot_key_multiplier     # design for ~4e4\n\n# Metadata ~500 bytes/link; 5 years of growth\nstorage_gb = writes_per_month * 12 * 5 * 500 / (1024**3)\nprint(round(avg_write_qps, 1), round(avg_read_qps, 1), int(peak_read_qps), round(storage_gb, 1))",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Open with scope, then estimates that include hot-key spikes. Saying only average QPS signals you have not designed for virality."
        },
        "checkYourself": [
          {
            "prompt": "Why are monthly averages a weak guide for a URL shortener?",
            "reveal": "A few viral codes can produce redirect spikes orders of magnitude above the mean. Caching, coalescing, and edge placement are justified by peaks, not by the monthly average."
          },
          {
            "prompt": "Name two optional features that materially change the data model.",
            "reveal": "Custom aliases require uniqueness and reserved-word checks; expiration and deletion add status transitions and negative-cache behavior on the read path."
          }
        ]
      },
      {
        "id": "apis-and-redirect-semantics",
        "heading": "APIs and redirect semantics",
        "paragraphs": [
          "Keep the public surface small. POST /v1/links accepts a long URL, optional custom alias, and optional expires_at, then returns the short URL and metadata. GET /:code performs the redirect. DELETE /v1/links/:code or a status update disables a link. Analytics queries live on a separate read model, never on the redirect handler. Validate that the destination uses http or https, reject javascript and data URLs, and rate-limit creation by IP, account, and destination host.",
          "Choose redirect status deliberately. A 301 suggests permanent mapping and may be cached aggressively by clients and intermediaries. A 302 or 307 keeps control closer to your servers when you need to revoke links, rotate destinations, or measure clicks more accurately. Many production shorteners prefer temporary redirects for that reason, even though 301s look tempting for CDN friendliness. State the tradeoff out loud.",
          "Error behavior is part of the API contract. Missing codes should return a fast 404. Expired or disabled codes should not leak whether the code once existed if privacy matters, or should return a clear expired page if product wants transparency. Either way, negative responses must be cacheable for a short TTL so scanners cannot turn misses into database load."
        ],
        "keyTerms": [
          {
            "term": "301 vs 302",
            "definition": "Permanent versus temporary redirect; permanent responses may be cached by clients and reduce your ability to revoke or measure."
          },
          {
            "term": "Negative caching",
            "definition": "Caching miss or expired responses briefly so repeated bad lookups do not hammer the primary store."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Write the create and redirect request/response shapes on the board before drawing boxes. APIs force clarity about validation and status codes."
        },
        "checkYourself": [
          {
            "prompt": "When would you avoid a 301 for short-link redirects?",
            "reveal": "When links may be revoked, destinations may change, or click measurement must stay under your control. Temporary redirects keep intermediaries from permanently caching the mapping."
          }
        ]
      },
      {
        "id": "id-generation-and-data-model",
        "heading": "ID generation and the mapping data model",
        "paragraphs": [
          "The mapping record is simple and consequential: code, long_url, created_at, expires_at, owner_id, status, and safety_state. The primary key is the short code. Secondary needs include owner lookups and expiration sweeps. Keep click counters out of this hot row if updates would contend with redirects; store aggregates in an analytics store fed by events.",
          "ID generation is the classic deep dive. A global auto-increment counter encoded in Base62 is compact and collision-free, but the counter service becomes a availability bottleneck unless you allocate ranges to writers. Random or hash-derived codes reduce coordination and are harder to enumerate, but they need collision retries and still need reserved-word filtering. Custom aliases skip generation and become a uniqueness constraint plus moderation policy.",
          "Base62 with length seven already covers tens of trillions of codes, which is more than enough for early growth. Length is a product decision as much as a capacity decision: shorter codes are nicer to share and easier to brute-force scan, so pair short codes with rate limits and anomaly detection. Snowflake-style distributed IDs are overkill for many shorteners but useful if you already run a multi-region ID service and want time-sortable opaque tokens."
        ],
        "workedExample": {
          "title": "Base62 encoding and keyspace size",
          "body": "Show how a counter becomes a short code and why seven characters are usually enough.",
          "code": "BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'\n\ndef encode_base62(n: int) -> str:\n    if n == 0:\n        return '0'\n    out = []\n    while n:\n        n, r = divmod(n, 62)\n        out.append(BASE62[r])\n    return ''.join(reversed(out))\n\ndef pad_code(n: int, width: int = 7) -> str:\n    return encode_base62(n).rjust(width, '0')[-width:]\n\nprint(pad_code(1), pad_code(62), pad_code(62**7 - 1))\nprint('keyspace', 62**7)  # 3.5e12",
          "language": "python"
        },
        "keyTerms": [
          {
            "term": "Base62",
            "definition": "Encoding over 0-9, a-z, and A-Z used to turn numeric IDs into compact URL-safe codes."
          },
          {
            "term": "Range allocation",
            "definition": "Giving each write shard a block of counters so ID generation stays unique without a per-request global lock."
          },
          {
            "term": "Reserved word",
            "definition": "A short code blocked because it collides with product routes or is abusive or brand-sensitive."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Compare counter, random, and alias strategies on uniqueness, coordination, enumerability, and operational failure modes. Do not pick one without naming the tradeoff."
        },
        "checkYourself": [
          {
            "prompt": "What fails first if every create call increments one shared counter in a single database row?",
            "reveal": "Write throughput and availability concentrate on that row. Range allocation, ticket servers, or random IDs remove the single-row hotspot."
          },
          {
            "prompt": "Why keep click counts off the mapping row used for redirects?",
            "reveal": "Synchronous counter updates serialize writes on hot codes and add latency to the redirect path. Async events keep reads cheap and aggregates eventual."
          }
        ]
      },
      {
        "id": "read-path-caching-and-hot-keys",
        "heading": "Read path, caching, and hot-key defense",
        "paragraphs": [
          "The redirect path should be boring and fast: edge TLS and rate limits, redirect service, Redis (or equivalent) lookup by code, datastore fallback on miss, emit analytics event, return redirect. Aim for single-digit milliseconds on cache hits. Populate the cache on miss with a TTL aligned to expiration, and use slightly shorter TTLs than the true expiry so you re-check status before serving a doomed link forever.",
          "Hot keys break naive designs. A celebrity campaign can pin one code in every cache and still overwhelm origin if TTLs expire together. Use request coalescing so only one miss fills the cache while others wait. Consider local in-process caches in front of Redis for the hottest codes, and regional cache replicas close to users. CDN caching of temporary redirects is possible but interacts carefully with revocation and analytics.",
          "Partitioning arrives later than caching. When the primary mapping store becomes the bottleneck, shard by code prefix or consistent hash of the code. Reads should not need cross-shard fan-out. Writes for custom aliases need a global uniqueness check, which may stay on a dedicated uniqueness index or allocation service even after the bulk mapping store is sharded."
        ],
        "keyTerms": [
          {
            "term": "Request coalescing",
            "definition": "Allowing only one concurrent miss for a key to hit the database while other waiters reuse the result."
          },
          {
            "term": "Cache stampede",
            "definition": "Many clients missing the same hot key at once and stampeding the origin store."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A high cache hit ratio is not enough if miss storms on one viral code still melt the database. Design stampede protection explicitly."
        },
        "checkYourself": [
          {
            "prompt": "Where should a newly expired link be remembered?",
            "reveal": "In negative cache entries and in the mapping status. Otherwise clients that keep hitting the old code will repeatedly miss through to storage."
          }
        ]
      },
      {
        "id": "analytics-consistency-and-abuse",
        "heading": "Analytics, consistency, and abuse controls",
        "paragraphs": [
          "Every successful redirect can enqueue a click event with code, timestamp, coarse geo, and user-agent class. Workers aggregate into hourly or monthly buckets. Dashboards read the aggregate store, not the mapping table. At-least-once delivery is fine if aggregation is idempotent by event id or if small overcount is acceptable. Exactly-once click accounting is rarely worth the complexity for marketing analytics.",
          "Consistency choices should be named. Creating a link should be strongly consistent for the writer: after a successful create, the returned code must resolve. Cross-region active-active writes are harder because alias uniqueness becomes a distributed consensus problem. Many teams keep create sticky to one primary region and replicate mappings asynchronously for redirects, accepting brief cross-region lag for newly created links.",
          "Abuse is a first-class failure mode. Attackers create phishing links, spray destinations, and scan the code space. Rate-limit creates, scan destinations against blocklists asynchronously when possible and synchronously for high-risk patterns, quarantine suspicious codes, and alert on sudden create spikes from one account or ASN. Operational metrics include redirect p99, cache hit rate, create error rate, collision retries, and quarantine volume."
        ],
        "callout": {
          "tone": "interview",
          "body": "Close by stating what breaks first under growth: hot redirects, abuse writes, or analytics lag. Then name the next scaling step for each."
        },
        "checkYourself": [
          {
            "prompt": "Why is at-least-once analytics usually acceptable here?",
            "reveal": "Click dashboards tolerate small overcounts, and idempotent aggregation or approximate counts are cheaper than making the redirect path transactional with the analytics store."
          },
          {
            "prompt": "What consistency do creators expect immediately after POST /links?",
            "reveal": "The returned short code should resolve immediately in the region that served the write. Cross-region read-your-writes may lag if replication is asynchronous."
          }
        ]
      },
      {
        "id": "failure-modes-and-evolution",
        "heading": "Failure modes and how the design evolves",
        "paragraphs": [
          "Enumerate failures before the interviewer asks. Cache cluster loss should fall back to the datastore with shed-able load and possibly serve stale mappings briefly if product allows. Datastore primary loss needs replicas and a failover runbook; during failover, prefer failing creates before serving incorrect redirects. Queue backlog should delay dashboards, never redirects. ID allocator outage should stop creates cleanly rather than minting duplicates.",
          "Evolution follows measured bottlenecks. First add caching and async analytics. Next add read replicas or multi-region redirect caches. Then partition the mapping store. Only then consider edge compute for redirects or specialized hot-key stores. Each step should preserve the simple create and redirect APIs so clients do not absorb your internal rearchitecture.",
          "A strong wrap is operational: SLOs on redirect latency and availability, create success rate, time-to-detect phishing reports, and analytics freshness. The system is successful when the boring path stays boring under celebrity traffic and hostile write patterns."
        ],
        "checkYourself": [
          {
            "prompt": "If the analytics queue is down, what should the redirect path do?",
            "reveal": "Still redirect. Drop or buffer events, degrade dashboards, and never block the user-facing 302 on analytics durability."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Scope create versus redirect first; the product is read-heavy and spike-driven.",
        "ID strategy trades coordination, collision handling, and enumerability.",
        "Cache hits, coalescing, and negative caching protect the hot path more than average QPS math.",
        "Analytics and abuse controls belong off the redirect critical path.",
        "Consistency for create is stricter than consistency for click aggregates."
      ],
      "nextSteps": [
        "Sketch Base62 range allocation across three write replicas.",
        "Write a sequence diagram for cache miss coalescing on a viral code.",
        "List metrics and alerts you would page on for create abuse and redirect latency."
      ]
    }
  },
  "case-studies/web-crawler": {
    "title": "Case study: distributed web crawler",
    "readingTime": "80-100 min",
    "premise": "A distributed crawler is a long-running control system: durable frontiers, per-host politeness, URL and content deduplication, fetch/parse pipelines, and recovery when workers die mid-flight. This chapter designs that system end to end for interviews.",
    "parts": [
      {
        "id": "crawler-goals-and-constraints",
        "heading": "Goals, politeness, and hard constraints",
        "paragraphs": [
          "Clarify what the crawler is for. A search index wants broad coverage and freshness. A compliance archive wants completeness and provenance. A price monitor wants a narrow set of hosts with frequent revisits. The goal changes frontier priority, storage format, and how aggressively you revisit. Also clarify legal and policy constraints: honor robots.txt, crawl-delay, and disallow rules; identify yourself; and stay inside an approved host allowlist when the product is not a general web search engine.",
          "Politeness is not optional garnish. A small site can be knocked over by a polite-looking global QPS target if all workers hit it at once. The unit of rate limiting is usually the host or pay-level domain, not the individual URL. Budgets may also include per-host concurrent connections, bytes per day, and error-rate circuit breakers. Interview answers that ignore politeness sound like scrapers, not production crawlers.",
          "Capacity estimates should cover pages per day, average page size, parse CPU, frontier growth, and storage for raw versus extracted content. The frontier can grow faster than you can fetch if discovery is unbounded, so crawl budgets and prioritization are load-shedding mechanisms as much as ranking mechanisms."
        ],
        "keyTerms": [
          {
            "term": "Frontier",
            "definition": "The prioritized set of URLs discovered but not yet fetched, often organized by host."
          },
          {
            "term": "Politeness",
            "definition": "Per-host rate and concurrency limits that prevent the crawler from overwhelming a site."
          },
          {
            "term": "robots.txt",
            "definition": "A host-published policy file declaring disallowed paths and optional crawl delays that compliant crawlers must respect."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State the crawl purpose and politeness model before drawing workers. Interviewers use this to separate thoughtful system design from naive parallel fetching."
        },
        "checkYourself": [
          {
            "prompt": "Why is a single global fetch queue a politeness hazard?",
            "reveal": "Many workers can dequeue URLs for the same small host simultaneously. Host-based queues or leases keep per-host concurrency under control."
          }
        ]
      },
      {
        "id": "apis-and-control-plane",
        "heading": "Control-plane APIs and worker contracts",
        "paragraphs": [
          "Even if end users never see the crawler, internal APIs matter. A seed API submits starting URLs or sitemaps. A policy API updates allowlists, denylists, and budgets. A worker lease API hands out host-scoped work items with deadlines. A status API exposes frontier depth, fetch success rates, robots denials, and parser lag. Designing these contracts early clarifies which state must be durable.",
          "Workers should be replaceable. A fetch worker claims a lease for a host queue, fetches within the politeness window, writes raw content to object storage, emits a parse task, and acknowledges the lease. If the worker dies, the lease expires and another worker may retry. Idempotency keys on URL fetch attempts prevent double-writes from corrupting metrics even when content is overwritten.",
          "Separate control plane from data plane. Configuration changes such as blocking a host should take effect without redeploying every fetcher. Feature flags for max concurrency, content-type filters, and JavaScript rendering budgets belong in dynamic config with audit logs."
        ],
        "checkYourself": [
          {
            "prompt": "What happens to in-flight URLs when a fetch worker crashes?",
            "reveal": "Leases expire and unfinished URLs return to the frontier or retry queue. Acknowledgments should happen only after durable write of fetch results."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Describe leases and acknowledgments the way you would for a queue system. Crawlers are distributed work schedulers first."
        }
      },
      {
        "id": "frontier-dedup-and-data-model",
        "heading": "Frontier, canonicalization, and data model",
        "paragraphs": [
          "URL canonicalization happens before the frontier: lowercase host, strip fragments, normalize default ports, sort query parameters when safe, and apply redirect-learned canonical rules carefully. Without this, mirrors and tracking parameters explode the queue. Store both the raw discovered URL and the canonical key used for dedup.",
          "A practical data model splits several stores. Frontier queues keyed by host hold pending canonical URLs with priority and scheduled time. A seen-URL store records whether a canonical URL was scheduled or fetched recently. A content-digest store maps checksums to first-seen URL for near-duplicate detection. Raw payloads live in object storage. Extracted links and metadata land in a structured store or log for indexing.",
          "Exact seen-URL sets do not fit in memory at web scale. Use Bloom filters or similar probabilistic sets as a first gate, then confirm against a distributed key-value store for candidates that pass. Accept a tiny false-positive rate that skips a URL, or design a two-tier check if missing a URL is costly. Content hashing catches identical bodies under different URLs."
        ],
        "workedExample": {
          "title": "Canonical key and host partition",
          "body": "A tiny sketch of normalizing a URL and choosing a host shard for politeness queues.",
          "code": "from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse\n\ndef canonical_url(url: str) -> str:\n    p = urlparse(url.strip())\n    scheme = (p.scheme or 'http').lower()\n    host = (p.hostname or '').lower()\n    port = p.port\n    netloc = host if port in (None, 80, 443) else f'{host}:{port}'\n    path = p.path or '/'\n    query = urlencode(sorted(parse_qsl(p.query, keep_blank_values=True)))\n    return urlunparse((scheme, netloc, path, '', query, ''))  # drop fragment\n\ndef host_shard(url: str, n: int = 128) -> int:\n    host = urlparse(canonical_url(url)).hostname or ''\n    return hash(host) % n\n\nu = 'HTTP://Example.com:80/a?b=2&a=1#x'\nprint(canonical_url(u))\nprint(host_shard(u))",
          "language": "python"
        },
        "keyTerms": [
          {
            "term": "Canonicalization",
            "definition": "Normalizing URL form so equivalent addresses share one frontier and dedup key."
          },
          {
            "term": "Bloom filter",
            "definition": "A compact probabilistic set that can say an item is possibly present, used to cheaply skip likely duplicates."
          },
          {
            "term": "Content digest",
            "definition": "A hash of page body used to detect duplicate or near-duplicate content across URLs."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Separate URL dedup from content dedup. Both are required, and they fail differently."
        },
        "checkYourself": [
          {
            "prompt": "Why partition frontier queues by host rather than by URL hash alone?",
            "reveal": "Politeness and robots rules are host-scoped. Host queues make per-host scheduling and rate limiting natural."
          }
        ]
      },
      {
        "id": "fetch-parse-pipeline-scale",
        "heading": "Fetch/parse pipeline and scale bottlenecks",
        "paragraphs": [
          "Keep fetch and parse asynchronous. Fetchers are network-bound and blocked by politeness waits. Parsers are CPU-bound and may run HTML extraction, language detection, and link scoring. If parsing is inline with fetching, a slow parser stalls the politeness schedule and wastes crawl budget. Object storage plus a parse queue decouples the stages and allows independent autoscaling.",
          "Bottlenecks shift over time. DNS resolution can become a hidden shared limit. TLS handshakes and connection pools matter for many small hosts. Parser backlog grows when rich pages or optional headless rendering are enabled. Indexing consumers may lag, requiring backpressure into the parse stage rather than unbounded queue growth. Render budgets for JavaScript-heavy sites should be a scarce resource with explicit priority.",
          "Freshness policies decide revisits. High-value hosts get shorter revisit intervals; stable archives get long intervals. Recrawl scheduling can use change-rate estimates from past digests. Discovery of new URLs should not indefinitely starve revisits, so use weighted scheduling across discover and refresh lanes."
        ],
        "checkYourself": [
          {
            "prompt": "What is the risk of parsing inside the fetch worker?",
            "reveal": "CPU-heavy parsing delays acknowledgments and reduces fetch concurrency under politeness constraints, coupling two different resource profiles."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Unbounded frontier growth is a real outage mode. Budgets, priorities, and drop policies are part of the design."
        }
      },
      {
        "id": "consistency-freshness-and-failures",
        "heading": "Consistency, freshness, and failure modes",
        "paragraphs": [
          "Crawlers are eventually consistent views of the web. The same URL may change between discovery and fetch. Duplicate fetch attempts may occur after timeouts. Downstream indexes must tolerate multiple versions and choose by fetch timestamp. Exactly-once fetching is less important than bounded duplicate work and durable frontier state.",
          "Failure modes include host outages, soft 503 storms, captcha walls, parser poison pages, and poisonously large files. Use per-host error budgets, exponential backoff, content-length caps, time budgets, and virus or malware scanning for stored payloads when relevant. Poison URLs that always crash parsers should enter a quarantine list.",
          "Operational excellence is the difference between a demo and a crawler. Track pages fetched per second, robots denial rate, duplicate skip rate, parse lag, host error distributions, and disk growth of raw stores. Chaos-test lease expiry and parser backlog drain. Document how to pause a host or the whole crawl without losing frontier durability."
        ],
        "keyTerms": [
          {
            "term": "Revisit policy",
            "definition": "Rules that decide when a previously fetched URL should be scheduled again for freshness."
          },
          {
            "term": "Backpressure",
            "definition": "Slowing upstream fetch or discovery when parse or index stages cannot keep up."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "End with durability and pause semantics: can you stop crawling a host now without forgetting the frontier?"
        },
        "checkYourself": [
          {
            "prompt": "Is exactly-once fetch required for correctness?",
            "reveal": "Usually no. Prefer durable leases, idempotent writes, and versioned content. Bounded duplicates are acceptable if expensive side effects are controlled."
          },
          {
            "prompt": "How do you keep one slow host from stalling the whole crawl?",
            "reveal": "Isolate host queues, cap concurrency per host, apply backoff on errors, and let workers proceed with other hosts."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Crawlers are schedulers with politeness, budgets, and durable frontiers.",
        "Canonicalization plus URL and content dedup keep the system from drowning in mirrors.",
        "Fetch, parse, and index must scale independently with backpressure.",
        "Eventual consistency and bounded duplicates are normal; lease recovery is mandatory.",
        "Operations center on host-level errors, lag, and the ability to pause safely."
      ],
      "nextSteps": [
        "Design a host lease state machine with timeout and retry counts.",
        "Estimate Bloom filter size for one billion canonical URLs at 1% false positives.",
        "Sketch metrics for politeness violations and parser quarantine."
      ]
    }
  },
  "case-studies/social-graph": {
    "title": "Case study: social graph service",
    "readingTime": "75-95 min",
    "premise": "A social graph is a high-QPS relationship service: asymmetric follows, mutual friends, blocks, celebrity adjacency, and change streams that feed timelines and recommendations. This chapter designs the APIs, storage, consistency, and skew handling interviewers expect.",
    "parts": [
      {
        "id": "relationship-semantics",
        "heading": "Relationship semantics before storage",
        "paragraphs": [
          "Name the edge types first. Follow is usually asymmetric: A can follow B without reciprocity. Friendship is often symmetric and may require accept/reject workflows. Mute, block, close-friend, and restrict edges change visibility and notification rules without being the same as unfollow. If you collapse all of these into one generic edge table with a type column, you still must document the invariants each type demands on write.",
          "Query patterns drive the representation more than graph theory purity. Hot paths are typically: list following, list followers, is-following checks, block checks before a write, and mutual counts. Multi-hop traversals such as friends-of-friends are valuable but often belong in offline or nearline jobs rather than the request path. TAO-style systems exist because social products issue enormous volumes of shallow graph reads with strict latency budgets.",
          "Celebrity skew is a product fact, not an edge case. A tiny fraction of accounts own enormous follower sets. Any design that materializes full follower lists into every consumer on write will melt under celebrity activity. Call out fan-out and pagination strategies before you praise a particular database."
        ],
        "keyTerms": [
          {
            "term": "Asymmetric follow",
            "definition": "A one-way relationship where following does not imply reciprocity."
          },
          {
            "term": "Adjacency list",
            "definition": "Per-user lists of neighbor IDs for a given edge type, optimized for shallow lookups."
          },
          {
            "term": "Celebrity skew",
            "definition": "Heavy imbalance where a few nodes have enormous degree and dominate read or write load."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Do not jump to Neo4j or a general graph DB until you have listed the hot one-hop queries and their QPS. Many social graphs are adjacency lists plus caches."
        },
        "checkYourself": [
          {
            "prompt": "Why might block edges need stronger read-your-writes semantics than follow edges?",
            "reveal": "A user who blocks someone expects immediate enforcement on subsequent views and messages. Lagging block visibility is a safety and trust failure, not just a feed quirk."
          }
        ]
      },
      {
        "id": "apis-and-authorization",
        "heading": "APIs, pagination, and authorization checks",
        "paragraphs": [
          "Core write APIs include follow, unfollow, block, unblock, and optionally friend request/accept. Read APIs include list following, list followers, relationship status between two users, and batch checks for feed assembly. Every list API needs cursor pagination; offsets fall apart on large degrees and concurrent mutations. Return edge metadata such as created_at when the product sorts or audits relationships.",
          "Authorization is intertwined with the graph. Private accounts may require follow approval. Blocks should suppress follows, messages, and recommendations in both directions according to product rules. The graph service often exposes a CheckVisibility(viewer, owner) helper used by posts, profiles, and search. Caching that helper is powerful and dangerous: stale allow decisions leak content; stale deny decisions confuse users.",
          "Rate limits belong on write edges. Follow churn and block/unblock flapping are abuse patterns. Idempotent writes help retries: following an already-followed user should succeed cleanly. Emit edge-change events for downstream consumers after the durable write commits."
        ],
        "checkYourself": [
          {
            "prompt": "Why are cursor-based follower lists preferred over OFFSET pagination?",
            "reveal": "Large offsets are expensive and unstable under concurrent follows. Cursors keyed by (created_at, user_id) give stable scans over adjacency storage."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Write CheckVisibility as a first-class API in the design. It reveals whether you understand graph reads as policy, not only as social lists."
        }
      },
      {
        "id": "data-model-and-indexes",
        "heading": "Data model, dual indexes, and counts",
        "paragraphs": [
          "For asymmetric follows, store two adjacency orientations or maintain dual indexes: following:{user} -> sorted neighbors and followers:{user} -> sorted neighbors. Dual writes keep both list directions fast. Mutual friendship may store a single undirected edge plus an accepted state, or two mirrored edges under a transaction. Choose based on whether the product thinks in undirected pairs or directed edges.",
          "Denormalized counts such as follower_count and following_count are almost always required for profile reads. Update them asynchronously with periodic reconciliation, or update synchronously if absolute precision on every follow matters more than write latency. Reconciliation jobs compare adjacency cardinality to counters and repair drift after crashes or duplicate events.",
          "Secondary data includes edge creation time, source (mobile, suggestion, import), and soft-delete markers. Hard deletes may be required for GDPR-style erasure, which forces tombstones and downstream purge events. Do not assume a graph DB removes the need for these product-level lifecycle rules."
        ],
        "workedExample": {
          "title": "Dual-index follow write sketch",
          "body": "Pseudocode for writing both adjacency directions and enqueueing a count update.",
          "code": "def follow(store, queue, follower_id: int, followee_id: int) -> None:\n    if follower_id == followee_id:\n        raise ValueError('cannot follow self')\n    if store.is_blocked_either_way(follower_id, followee_id):\n        raise PermissionError('blocked')\n    # Dual adjacency indexes for fast list queries in both directions\n    store.sadd(f'following:{follower_id}', followee_id)\n    store.sadd(f'followers:{followee_id}', follower_id)\n    store.set_edge_meta(follower_id, followee_id, {'created_at': store.now()})\n    queue.publish({'type': 'follow_created', 'follower': follower_id, 'followee': followee_id})\n    # counts updated by consumer; reconcile later if needed\n\ndef is_following(store, follower_id: int, followee_id: int) -> bool:\n    return store.sismember(f'following:{follower_id}', followee_id)",
          "language": "python"
        },
        "keyTerms": [
          {
            "term": "Dual indexing",
            "definition": "Maintaining both outbound and inbound adjacency structures so each list direction is an efficient primary lookup."
          },
          {
            "term": "Count reconciliation",
            "definition": "Periodic repair that aligns denormalized counters with authoritative adjacency data."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Explain how a crash between dual index writes is detected and repaired. Partial adjacency is a classic consistency trap."
        },
        "checkYourself": [
          {
            "prompt": "What goes wrong if follower_count is only incremented and never reconciled?",
            "reveal": "Lost updates, duplicate events, and failed rollbacks cause permanent drift. Profiles become untrustworthy without repair jobs."
          }
        ]
      },
      {
        "id": "caching-skew-and-scale",
        "heading": "Caching, celebrity skew, and scale bottlenecks",
        "paragraphs": [
          "Cache small adjacency segments and relationship checks aggressively. Hot reads are repeated is-following and first-page follower lists for active users. Celebrity follower lists are too large to cache whole; cache page segments, counts, and negative lookup results. A graph cache such as TAO separates the caching layer from durable storage and serves most reads from memory with careful write-through or write-back semantics.",
          "On writes to celebrity accounts, avoid synchronous fan-out to every downstream feed cache. Publish the edge event and let consumers apply bounded work. Some systems special-case celebrities so follower-side materialization is pull-based. The graph service itself still must accept the follow write quickly and update the celebrity's followers index without locking the whole list.",
          "Sharding is usually by user id for adjacency. Cross-shard follow writes touch two shards when dual indexes live on both users. Use a transaction protocol, saga with repair, or an edge store keyed by edge id with secondary lookups. Bottlenecks appear first on celebrity shards, then on cache stampede for popular profiles, then on event consumer lag feeding timelines."
        ],
        "checkYourself": [
          {
            "prompt": "Why can caching a celebrity's full follower list be a bad idea?",
            "reveal": "The list is huge, changes constantly, and provides little locality for typical clients who only need a page or a membership check."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If your design fans out celebrity follows synchronously into millions of home timelines, you have moved the bottleneck, not solved it."
        }
      },
      {
        "id": "consistency-downstream-failures",
        "heading": "Consistency, downstream consumers, and failures",
        "paragraphs": [
          "Pick consistency per edge type. Blocks and privacy edges often need stronger immediate enforcement in the acting user's region. Follow edges can sometimes be eventually visible across regions. Dual-index writes should not leave one side updated permanently; use idempotent retries and background repair scanners that compare following and followers orientations.",
          "Downstream consumers include home timelines, notification services, people-you-may-know jobs, and search documents for social signals. Graph change events should be ordered per user where possible so unfollow then follow does not apply backward. Consumers must handle duplicates and backlog; graph write success should not depend on every consumer acknowledging.",
          "Failure modes: cache serving stale allow after block, repair storms after dual-write outages, thundering herd on celebrity profile pages, and privacy bugs from incorrect CheckVisibility caching. Monitor edge write latency, dual-index divergence rate, cache hit rate on relationship checks, and consumer lag. Provide admin tooling to rebuild adjacency for a user from an authoritative edge log."
        ],
        "keyTerms": [
          {
            "term": "Edge change stream",
            "definition": "An ordered log of relationship mutations consumed by feeds, notifications, and offline recommenders."
          },
          {
            "term": "Read-your-writes",
            "definition": "A consistency expectation that a user immediately sees the effects of their own recent graph mutations."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Tie consistency to user trust: which stale reads are merely awkward, and which are safety incidents?"
        },
        "checkYourself": [
          {
            "prompt": "Should timeline fan-out run inside the graph write API?",
            "reveal": "No. Persist the edge, emit an event, and let timeline systems apply fan-out asynchronously with their own celebrity policies."
          },
          {
            "prompt": "How do you detect dual-index divergence?",
            "reveal": "Sample or scan edges and verify membership in both orientations; track a divergence metric and repair with a rebuild from the edge log."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Edge semantics and hot one-hop queries determine storage more than graph DB branding.",
        "Dual indexes, denormalized counts, and cursors are the backbone of social adjacency APIs.",
        "Celebrity skew forces pagination, partial caching, and async downstream fan-out.",
        "Blocks and visibility checks often need stricter freshness than ordinary follows.",
        "Repair paths for dual writes and count drift are part of the design, not extras."
      ],
      "nextSteps": [
        "Draw the dual-write sequence with crash points and repair actions.",
        "Estimate storage for 500M users at average degree 200 with 8-byte IDs.",
        "Specify cache TTLs and invalidation for CheckVisibility after a block."
      ]
    }
  },
  "case-studies/query-cache": {
    "title": "Case study: query-result cache",
    "readingTime": "70-90 min",
    "premise": "A query-result cache stores expensive assembled answers, not just rows. The hard parts are key design, authorization context, invalidation, stampede control, and knowing when a miss costs more than the cache is worth. This chapter builds that decision framework.",
    "parts": [
      {
        "id": "when-result-caches-win",
        "heading": "When a result cache beats object caching",
        "paragraphs": [
          "Object caches store entities such as user or product records. Result caches store the output of an expensive query or assembled response: a search page, a ranked homepage module, a multi-join dashboard widget. Result caches win when recomputation joins many sources, applies ranking, or hits analytical stores, and when the same logical query repeats with high locality.",
          "They lose when inputs change faster than reuse happens, when keys explode with high cardinality parameters, when payloads are huge, or when invalidation fan-out becomes more expensive than recomputing. Interview answers should estimate hit ratio, miss cost, and invalidation rate together. A 90% hit ratio is a failure if the 10% misses are stampedes that take down the primary.",
          "Define the cached unit explicitly. Caching 'the SQL string' is brittle. Prefer a normalized query descriptor: query name, canonical parameters, tenant, locale, and authz scope. Exclude volatile parameters such as request ids. Include version stamps for ranking models or template versions so deploys do not serve incompatible shapes."
        ],
        "keyTerms": [
          {
            "term": "Result cache",
            "definition": "A cache whose values are assembled query answers rather than individual source entities."
          },
          {
            "term": "Miss cost",
            "definition": "The latency, compute, and dependency load incurred when a cache lookup fails and the origin recomputes."
          },
          {
            "term": "Key cardinality",
            "definition": "How many distinct cache keys a parameter space can generate; high cardinality reduces reuse."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say hit ratio and miss cost in the same sentence. Caches are economic systems, not decorations."
        },
        "checkYourself": [
          {
            "prompt": "Why can caching raw rows still leave the API slow?",
            "reveal": "The expensive work may be joining, sorting, personalizing, or aggregating many objects. Object hits do not eliminate that assembly cost."
          }
        ]
      },
      {
        "id": "api-and-key-contract",
        "heading": "API contract and cache key design",
        "paragraphs": [
          "Treat the cache as an internal collaborator behind a query service, not as a public API. The service method Lookup(QueryDescriptor) returns a result with cache metadata: hit/miss, age, and generation. Callers should not invent string keys ad hoc across teams. A shared key builder prevents equivalent queries from missing each other because of parameter ordering or spacing.",
          "Authorization context must enter the key or the value validation. Mixing anonymous and authenticated results, or results for different tenants, is a serious bug. If personalization is mild, you might cache a shared base result and apply cheap personalization after fetch. If personalization is deep, the key must include user or cohort, which raises cardinality and may destroy hit rate.",
          "TTL is part of the contract. Document freshness SLOs: search results may tolerate 30 seconds; inventory badges may need a few seconds; config documents may live minutes. Stale-while-revalidate can serve a slightly old value while one requester refreshes, improving tail latency when absolute freshness is not required."
        ],
        "workedExample": {
          "title": "Canonical cache key builder",
          "body": "Normalize parameters and include tenant, locale, and authz scope so equivalent queries share entries.",
          "code": "import hashlib, json\n\ndef build_cache_key(query_name: str, params: dict, *, tenant: str, locale: str, authz_scope: str, version: str) -> str:\n    canonical = {\n        'q': query_name,\n        'p': {k: params[k] for k in sorted(params)},\n        'tenant': tenant,\n        'locale': locale,\n        'authz': authz_scope,\n        'v': version,\n    }\n    blob = json.dumps(canonical, separators=(',', ':'), ensure_ascii=True)\n    return query_name + ':' + hashlib.sha256(blob.encode()).hexdigest()[:32]\n\na = build_cache_key('search', {'q': 'shoes', 'page': 1}, tenant='acme', locale='en-US', authz_scope='public', version='r12')\nb = build_cache_key('search', {'page': 1, 'q': 'shoes'}, tenant='acme', locale='en-US', authz_scope='public', version='r12')\nprint(a == b, a)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "What happens if authz scope is omitted from the key?",
            "reveal": "Users can receive another principal's filtered results, which is an authorization incident, not a mild cache bug."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Never treat cache keys as optional string hygiene. They encode security boundaries."
        }
      },
      {
        "id": "invalidation-strategies",
        "heading": "Freshness and invalidation strategies",
        "paragraphs": [
          "TTL-only invalidation is simple and blunt. It works when data changes slowly or approximate freshness is fine. Event-driven invalidation deletes or versions keys when source entities change. It is precise but requires a map from entity to affected query keys, which can explode for broad queries such as 'all shoes'. Hybrid approaches use short TTLs plus targeted invalidation for known hot queries.",
          "Version tokens help. Store a generation number per dependency set; encode it in the key or check it on read. Bumping a generation cheaply invalidates a family of results without enumerating every key. This is especially useful after bulk imports or ranking model launches.",
          "Write paths must decide whether they wait on invalidation. Synchronous invalidation reduces stale reads but couples writers to the cache cluster. Asynchronous invalidation preserves write latency and accepts a short stale window. State the product preference explicitly."
        ],
        "keyTerms": [
          {
            "term": "Stale-while-revalidate",
            "definition": "Serving a cached value past soft expiry while a single refresh recompute runs in the background."
          },
          {
            "term": "Generation bump",
            "definition": "Incrementing a version token that effectively invalidates a family of dependent cache entries."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Compare TTL, event invalidation, and generation bumps on precision, complexity, and write-path coupling."
        },
        "checkYourself": [
          {
            "prompt": "Why are broad search result keys hard to invalidate precisely?",
            "reveal": "A single product change may participate in many query pages. Enumerating affected keys is expensive, so TTL or generation schemes are often used instead."
          }
        ]
      },
      {
        "id": "stampedes-eviction-and-skew",
        "heading": "Stampedes, eviction, and hot keys",
        "paragraphs": [
          "When a popular key expires, thousands of concurrent requests can recompute the same query. Single-flight or locking lets one caller populate while others wait or serve stale. Probabilistic early expiration spreads refreshes so not all clients expire together. For hard-to-compute keys, background refreshers can keep values warm without waiting for a user miss.",
          "Eviction policy must account for value size. A handful of multi-megabyte results can crowd out many small ones under naive LRU item counts. Use size-aware eviction and cap maximum cached payload size. Compress values when CPU is cheaper than memory. Shard the cache cluster by key to spread hot keys, and consider a local process cache in front of remote caches for ultra-hot descriptors.",
          "Observe the right metrics: hit ratio, miss latency, origin QPS attributable to misses, eviction rate, lock wait time, and stale serve rate. Optimize for origin protection and end-user latency, not for vanity hit ratio alone."
        ],
        "workedExample": {
          "title": "Single-flight miss handling sketch",
          "body": "One in-process lock per key populates the cache; waiters reuse the same future.",
          "code": "import threading\n\nclass SingleFlightCache:\n    def __init__(self):\n        self.store = {}\n        self.locks = {}\n        self.guard = threading.Lock()\n\n    def get_or_load(self, key, loader):\n        with self.guard:\n            if key in self.store:\n                return self.store[key], 'hit'\n            lock = self.locks.setdefault(key, threading.Lock())\n        with lock:\n            if key in self.store:\n                return self.store[key], 'coalesced'\n            value = loader()\n            self.store[key] = value\n            with self.guard:\n                self.locks.pop(key, None)\n            return value, 'miss'\n\nc = SingleFlightCache()\nprint(c.get_or_load('q1', lambda: {'items': [1, 2, 3]}))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "What is probabilistic early refresh trying to prevent?",
            "reveal": "Synchronized expiry of a hot key across many clients that would otherwise stampede the origin at the same moment."
          }
        ]
      },
      {
        "id": "failure-modes-and-operations",
        "heading": "Failure modes, consistency, and operations",
        "paragraphs": [
          "Cache outages should degrade to origin with shed load, not cascading timeouts. Use bulkheads and circuit breakers so an empty cache cluster does not multiply origin concurrency unboundedly. Serving stale on cache error can be better than failing open to an already overloaded database.",
          "Consistency is usually eventual by design. Readers must tolerate short staleness, or the product must read-through critical paths without caching. Document which queries are cacheable. Debugging requires cache version headers or trace ids that show whether a response was hit, miss, stale, or bypassed.",
          "Operational pitfalls include caching errors as values, thundering herds after deploys that bump all versions, and hot-key memory pressure. Runbooks should cover flushing by generation, warming top queries after release, and disabling cache per query name when correctness bugs appear."
        ],
        "callout": {
          "tone": "tip",
          "body": "A kill switch per query family is as important as the cache itself when incorrect entries ship."
        },
        "checkYourself": [
          {
            "prompt": "Why might you intentionally bypass the cache after a bad deploy?",
            "reveal": "If results are wrong or keys omit a security dimension, serving origin temporarily is safer than waiting for TTLs while incorrect entries remain hot."
          },
          {
            "prompt": "How can a cache outage cause a larger outage?",
            "reveal": "All traffic falls through to origin simultaneously. Without request shedding and single-flight, the origin collapses under multiplied load."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Result caches are for expensive assembled answers with repeated logical queries.",
        "Keys must canonicalize parameters and include tenant, locale, and authz scope.",
        "TTL, events, and generation bumps are different freshness tools with different costs.",
        "Stampede control and size-aware eviction matter as much as hit ratio.",
        "Failure modes center on origin stampedes, stale security boundaries, and missing kill switches."
      ],
      "nextSteps": [
        "Pick one product query and compute expected hit ratio versus invalidation rate.",
        "Design entity-to-key indexing for a homepage module fed by three source tables.",
        "Write an origin-protection policy for total cache cluster loss."
      ]
    }
  },
  "case-studies/scaling-playbook": {
    "title": "Case study: scale-to-millions playbook",
    "readingTime": "75-95 min",
    "premise": "Interviewers often ask how a simple app grows from one box to millions of users. The winning answer is a staged playbook: measure a bottleneck, apply the smallest fix that buys headroom, and carry operations along with architecture. This chapter teaches that story.",
    "parts": [
      {
        "id": "story-structure",
        "heading": "Tell a bottleneck-driven story",
        "paragraphs": [
          "A scaling playbook is not a shopping list of Redis, Kafka, Kubernetes, and shards. It is a narrative with stages, each triggered by a measurable constraint: CPU on the web process, lock contention on a primary database, storage growth, network egress, or operational toil. Start from a concrete product such as a read-heavy media site or a collaborative SaaS app so the bottlenecks feel real.",
          "At each stage, name what hurts, what you change, what risk you accept, and how you will know it worked. Premature sharding can add years of complexity before the team has instrumentation, backups, and a deploy culture that can survive distributed failure. Interviewers reward judgment about sequence as much as knowledge of components.",
          "Use the scale cube as vocabulary, not as a mandate: clone identical instances (X), split by responsibility or service (Y), and split by data partition such as customer id (Z). Most journeys use clones and caches long before Z-axis shards."
        ],
        "keyTerms": [
          {
            "term": "Bottleneck",
            "definition": "The resource or contention point that currently limits further useful throughput or latency improvement."
          },
          {
            "term": "Scale cube",
            "definition": "A model describing scale-out by cloning, by functional split, and by data partitioning."
          },
          {
            "term": "Headroom",
            "definition": "Spare capacity retained so traffic spikes and deploys do not immediately breach SLOs."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "For every component you add, say the metric that justified it. If you cannot name the metric, you are decorating the diagram."
        },
        "checkYourself": [
          {
            "prompt": "Why is 'add Kafka' a weak first scaling step for a monolith with slow SQL?",
            "reveal": "If the bottleneck is query planning or missing indexes, a queue does not help. Fix the measured constraint first."
          }
        ]
      },
      {
        "id": "stage-single-to-tiered",
        "heading": "From single box to tiered architecture",
        "paragraphs": [
          "Stage 0 is one server running app and database. It is valid for early products. The first pain is usually compute and deploy risk sharing the same machine as data. Stage 1 separates the database onto its own host, adds off-box object storage for media, and puts the app behind a simple process manager. Backups and restore drills become possible.",
          "Stage 2 adds a load balancer and multiple app clones. Sessions move to cookies or a shared store. Stateless app nodes let you roll deploys and absorb web CPU load. This is X-axis scaling. Watch for sticky-session traps and for databases that now see more concurrent connections than they can handle.",
          "APIs at this stage remain a modular monolith for many teams. Extracting services too early creates distributed failure without relieving the true bottleneck. Keep the playbook honest about team size: five engineers cannot operate twelve microservices and a sharding layer safely."
        ],
        "workedExample": {
          "title": "Connection math after cloning app nodes",
          "body": "Show why multiplying app replicas can exhaust a database before CPU is free.",
          "code": "app_replicas = 12\npools_per_replica = 20\nmax_db_connections = 200\nneeded = app_replicas * pools_per_replica\nprint('connections needed', needed)\nprint('fits?', needed <= max_db_connections)\n# Mitigation sketch: lower pool size, PgBouncer, or read replicas for read traffic\nsafe_pool = max_db_connections // app_replicas\nprint('max pool per replica', safe_pool)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "What operational capability must appear when the database leaves the app box?",
            "reveal": "Automated backups, restore testing, monitoring of disk and connections, and a clear owner for schema migrations."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Cloning app servers without connection pooling plans is a classic self-inflicted outage."
        }
      },
      {
        "id": "cache-replicas-queues",
        "heading": "Caches, read replicas, and asynchronous work",
        "paragraphs": [
          "When the primary database saturates on reads, caches and read replicas are the usual next levers. Cache hot objects or query results near the app. Use replicas for read paths that tolerate replication lag. Be explicit about which reads require primary freshness, such as payment confirmation pages after a write.",
          "When request threads spend time on email, image processing, or webhook delivery, introduce a queue and workers. This improves user-facing latency and absorbs spikes, but adds at-least-once processing, poison messages, and backlog monitoring. Asynchronous work is a scaling tool and an operations product of its own.",
          "Search indexes, analytics warehouses, and recommendation pipelines should not share the primary OLTP store. Sync them through events or batch jobs. Crossing that boundary too late causes report queries to lock production tables; crossing too early costs complexity. Tie the split to observed query interference."
        ],
        "keyTerms": [
          {
            "term": "Replication lag",
            "definition": "Delay between a primary write and its visibility on a replica, shaping which reads may use replicas."
          },
          {
            "term": "OLTP versus OLAP",
            "definition": "Transactional user-path workloads versus analytical scans; mixing them on one store creates contention."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State what happens to a read-after-write if you send the next GET to a replica. That single sentence shows maturity."
        },
        "checkYourself": [
          {
            "prompt": "When should you prefer a cache over a read replica?",
            "reveal": "When a small hot keyset produces repeated identical reads and invalidation is manageable. Replicas help broader read scale but still execute SQL and can lag."
          }
        ]
      },
      {
        "id": "sharding-and-multi-region",
        "heading": "Sharding, services, and multi-region choices",
        "paragraphs": [
          "Horizontal data partitioning arrives when a single primary cannot absorb write throughput, storage, or maintenance windows. Choose a partition key aligned with access patterns, such as tenant_id. Plan cross-shard queries as exceptions, not as the default homepage path. Resharding strategy and routing must exist before you cut the first shard.",
          "Y-axis service splits help when independent teams need independent deploy cadences or when one module has a different scaling profile, such as a media transcoder. Do not confuse organizational desire for services with a scaling necessity. Each service boundary needs contracts, auth, tracing, and on-call.",
          "Multi-region designs address latency and disaster recovery. Active-passive is operationally simpler. Active-active requires conflict rules for writes. Many products stop at multi-AZ within one region plus object storage replication long before true multi-region active writes. Pick the availability story the business actually bought."
        ],
        "checkYourself": [
          {
            "prompt": "What makes a bad shard key?",
            "reveal": "A key that concentrates writes on few partitions, or one that forces most requests to scatter-gather across shards."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot explain how to add the Nth shard and how to route a single-key read, you are not ready to shard in the interview story."
        }
      },
      {
        "id": "operations-as-scale",
        "heading": "Operations maturity is part of scale",
        "paragraphs": [
          "Every architectural stage changes deploys, secrets, backups, schema migrations, autoscaling signals, and incident response. A system that can take 10x traffic but cannot deploy weekly or restore a database is not actually scaled. Include health checks, load-balancer draining, feature flags, and SLO dashboards in the playbook stages.",
          "Cost and capacity planning belong in the narrative. Autoscaling without load tests produces surprise bills and thundering herds at cold start. Cache clusters need memory headroom. Queues need consumer lag alerts. Data growth needs retention policies. Interviewers notice when you mention these without being prompted.",
          "Close the story with tradeoffs, not perfection. Show the current stage, the next two likely bottlenecks, and what you would not do yet. That restraint is the playbook."
        ],
        "keyTerms": [
          {
            "term": "SLO",
            "definition": "A target on user-visible reliability or latency that guides scaling and paging decisions."
          },
          {
            "term": "Feature flag",
            "definition": "A runtime switch used to decouple deploy from release and to shed risky functionality during incidents."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "End with: 'We are here, this metric would push us to the next stage, and this is the risk we accept today.'"
        },
        "checkYourself": [
          {
            "prompt": "Name an operational dependency introduced by adding a queue.",
            "reveal": "You now need consumer lag monitoring, poison-message handling, replay tooling, and a plan for duplicate side effects."
          },
          {
            "prompt": "Why do restore drills belong in a scaling interview answer?",
            "reveal": "Data scale without tested recovery increases downtime risk. Scaling reads and writes without restore confidence is incomplete."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Scale in stages tied to measured bottlenecks, not fashion.",
        "Separate data early, clone apps carefully, and watch connection and session effects.",
        "Caches, replicas, and queues each buy a specific kind of headroom.",
        "Sharding and multi-region are late, high-cost moves that need routing and conflict plans.",
        "Operations, SLOs, and cost are part of the architecture story."
      ],
      "nextSteps": [
        "Write a five-stage playbook for a fictional photo-sharing MVP with triggers and risks.",
        "Calculate database connections for 30 app tasks with pool size 15.",
        "List the first three dashboards you would build before adding a cache."
      ]
    }
  },
  "case-studies/pastebin": {
    "title": "Case study: pastebin",
    "readingTime": "75-95 min",
    "premise": "Pastebin extends URL shortening with durable text bodies, expiration, abuse scanning, and read-heavy retrieval. The core move is separating short-code metadata from blob content so the hot path stays light while objects scale independently.",
    "parts": [
      {
        "id": "paste-requirements",
        "heading": "Requirements unique to paste storage",
        "paragraphs": [
          "Users create a paste, receive a short URL, and later read raw or rendered content until expiry or deletion. Optional features include titles, syntax language hints, privacy settings, passwords, and edit-in-place. Anonymous writes are common, which raises abuse and rate-limit stakes compared with authenticated-only document editors.",
          "Content sizes span small snippets to multi-megabyte dumps. That range pushes you away from storing every body in a transactional row if large pastes are allowed. Reads dominate writes, and a few pastes can go viral on social media. Analytics such as view counts should not ride on the critical read path.",
          "Safety requirements include malware scanning for downloadable content, PII policy choices, legal takedown workflows, and reserved-path filtering for short codes. Expiration must behave consistently: once expired, reads fail even if the blob cleaner lags."
        ],
        "keyTerms": [
          {
            "term": "Metadata versus blob",
            "definition": "The split between small indexed fields (code, expiry, pointers) and the large paste body in object storage."
          },
          {
            "term": "Raw versus rendered view",
            "definition": "Serving plain text for tools versus HTML-highlighted pages for browsers, often with different cache policies."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Call out anonymous write abuse in the first minute. Paste services without rate limits are spam platforms."
        },
        "checkYourself": [
          {
            "prompt": "Why is pastebin not just a URL shortener with a longer string field?",
            "reveal": "Bodies can be large, need distinct storage lifecycle and CDN behavior, and introduce scanning, rendering, and bandwidth costs that mapping metadata alone does not."
          }
        ]
      },
      {
        "id": "apis-create-read-expire",
        "heading": "Create, read, and expiration APIs",
        "paragraphs": [
          "POST /pastes accepts body, optional language, expiry, and visibility. The service validates size limits, generates or accepts a custom code, stores the body, writes metadata, and returns the URL. GET /p/:code returns rendered HTML. GET /raw/:code returns text/plain. DELETE marks metadata disabled and schedules blob deletion.",
          "Expiration can be absolute timestamps or sliding policies. On read, check metadata status before fetching the blob. If expired, return 404 and preferably negative-cache the code. Do not rely only on object-store lifecycle rules for user-visible correctness; lifecycle is a cleanup optimization, not the authorization check.",
          "Authentication, when present, enables private pastes and listing. Private paste reads need authorization checks that must be part of cache keys if responses are cached. Public hot pastes can be cached aggressively at CDN layers for raw and rendered forms."
        ],
        "checkYourself": [
          {
            "prompt": "Where should the expiry check run relative to object fetch?",
            "reveal": "Before fetching the blob, using metadata. That avoids unnecessary bandwidth and makes expired behavior consistent even if cleanup is delayed."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Separate raw and rendered routes in the design; their caching and content-type needs differ."
        }
      },
      {
        "id": "data-model-and-ids",
        "heading": "Data model, IDs, and object pointers",
        "paragraphs": [
          "Metadata table fields include code, object_key, content_type, size_bytes, language, created_at, expires_at, owner_id, visibility, status, and safety_state. The blob store holds the body at object_key. Small pastes can be inlined in metadata as an optimization, but keep a single abstraction so growth does not require an API change.",
          "ID generation mirrors URL shorteners: Base62 counters with range allocation, random codes, or custom aliases. Because pastes are often pasted into chat, avoid ambiguous characters if you use human-typed codes, or keep codes opaque and copy-paste friendly. Uniqueness constraints protect aliases.",
          "Indexes support expiry sweeps (expires_at, status) and owner listings. View counters belong in an analytics pipeline keyed by code and time bucket. Keep safety scan results on metadata so the read path can block quarantined content quickly."
        ],
        "workedExample": {
          "title": "Create-path storage sketch",
          "body": "Persist the blob first or use a two-phase approach so metadata never points at missing bodies.",
          "code": "import uuid\n\ndef create_paste(meta_db, blob_store, body: bytes, expires_at, language: str | None):\n    if len(body) > 1_000_000:\n        raise ValueError('paste too large')\n    code = meta_db.allocate_code()\n    object_key = f'pastes/{code}/{uuid.uuid4().hex}'\n    blob_store.put(object_key, body, content_type='text/plain')\n    try:\n        meta_db.insert({\n            'code': code,\n            'object_key': object_key,\n            'size_bytes': len(body),\n            'language': language,\n            'expires_at': expires_at,\n            'status': 'active',\n            'safety_state': 'pending_scan',\n        })\n    except Exception:\n        blob_store.delete(object_key)\n        raise\n    return code\n\ndef read_paste(meta_db, blob_store, code: str):\n    row = meta_db.get(code)\n    if not row or row['status'] != 'active':\n        return None\n    if row['expires_at'] is not None and row['expires_at'] <= meta_db.now():\n        return None\n    if row['safety_state'] == 'blocked':\n        return None\n    return blob_store.get(row['object_key'])",
          "language": "python"
        },
        "keyTerms": [
          {
            "term": "Object key",
            "definition": "The blob-store locator stored in metadata and used to fetch paste bytes after authorization and expiry checks."
          },
          {
            "term": "Inline optimization",
            "definition": "Storing tiny paste bodies beside metadata to avoid an extra fetch, while still supporting external blobs for large content."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Explain orphan cleanup: blobs without metadata and metadata without blobs. Pastebin designs live or die on lifecycle honesty."
        },
        "checkYourself": [
          {
            "prompt": "What is the risk of writing metadata before the blob exists?",
            "reveal": "Readers can resolve a code and then fail on missing content. Prefer blob-first with rollback, or a pending state not yet publicly readable."
          }
        ]
      },
      {
        "id": "read-path-scale",
        "heading": "Read path, caching, and scale bottlenecks",
        "paragraphs": [
          "Hot path: resolve metadata from cache or DB, validate status and expiry, fetch body from object storage or inline field, optionally render, return response. Cache metadata aggressively. Cache rendered HTML for public pastes at CDN edge when syntax highlighting makes rendering expensive. Raw routes can often be served as immutable objects when pastes are write-once.",
          "Bottlenecks include viral paste bandwidth, metadata DB CPU on hot codes, and render CPU if highlighting runs inline. Move highlighting to create-time or asynchronous prep for popular languages, or cache rendered output. Rate-limit anonymous creates and scans of the code space.",
          "Sharding metadata by code works like a shortener. Object storage scales independently. If you need multi-region reads, replicate metadata and rely on geo-distributed object storage; accept create visibility lag across regions or sticky create regions."
        ],
        "checkYourself": [
          {
            "prompt": "Why cache metadata even when bodies live in a scalable object store?",
            "reveal": "Expiry, safety, and visibility checks still need a fast authoritative or cached metadata lookup before paying for blob fetch and before enforcing policy."
          }
        ]
      },
      {
        "id": "analytics-abuse-failures",
        "heading": "Analytics, abuse, consistency, and failures",
        "paragraphs": [
          "View events enqueue asynchronously. Monthly view tables power simple dashboards. Cleanup workers sweep expired metadata and delete blobs; object lifecycle rules provide a safety net. Abuse scanners inspect new bodies and flip safety_state before or shortly after publication depending on risk appetite.",
          "Consistency: creators should read their paste immediately after create in-region. Public CDN caches need purge or short TTL on delete and quarantine. Password-protected pastes must not be cached publicly.",
          "Failures: object store outage blocks reads of non-inlined pastes; degrade with clear errors. Metadata primary outage blocks creates first. Scanner backlog should not silently publish known-dangerous content if policy requires gating. Monitor create QPS, read latency, cache hit rate, expiry sweep lag, quarantine rate, and egress bytes."
        ],
        "callout": {
          "tone": "warning",
          "body": "Deleting a paste privately while CDN still serves it is a trust-breaking failure mode. Plan purge paths."
        },
        "checkYourself": [
          {
            "prompt": "How should delete interact with CDN-cached raw content?",
            "reveal": "Mark metadata disabled immediately, purge or overwrite CDN entries, and keep short TTLs as a backstop."
          },
          {
            "prompt": "Where do view counters live?",
            "reveal": "In an async analytics store updated from events, not as synchronous increments on the metadata row during every read."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Split paste metadata from blob bodies and check expiry before fetch.",
        "ID and alias design mirrors shorteners, with stronger abuse controls for anonymous writes.",
        "Cache metadata and rendered public views; keep private pastes out of shared caches.",
        "Lifecycle needs orphan cleanup, sweeps, and CDN purge on delete or quarantine.",
        "Analytics stay asynchronous so viral reads remain cheap."
      ],
      "nextSteps": [
        "Design pending_scan versus publish-now safety policies and their UX.",
        "Estimate object-store cost for 50M pastes averaging 8 KB retained 90 days.",
        "Write a delete sequence that includes metadata, blob, and CDN purge."
      ]
    }
  },
  "case-studies/mint": {
    "title": "Case study: Mint-style budgeting app",
    "readingTime": "80-100 min",
    "premise": "A Mint-style app links financial accounts, extracts transactions asynchronously, categorizes spending, materializes monthly rollups, and alerts on budgets — all while treating credentials and money data as sensitive systems, not ordinary CRUD.",
    "parts": [
      {
        "id": "product-risks-and-requirements",
        "heading": "Product requirements and trust constraints",
        "paragraphs": [
          "Users connect bank and credit accounts, wait for transactions to appear, review categorized spending, set budgets, and receive alerts when they approach limits. The emotional contract is trust: balances and merchants should be right enough to plan life around, and credentials must never be handled casually. Clarify whether you integrate through an aggregator such as Plaid-style tokenized access or through direct institution connectors; that choice dominates security and failure modes.",
          "Traffic is read-heavy on dashboards with write bursts when sync jobs run. Sync freshness expectations are near-real-time in marketing language and often hours in practice because institutions rate-limit and fail unpredictably. Design for stale-but-honest UI: show last successful sync time rather than pretending live banking rails.",
          "Compliance and privacy constraints shape storage: encrypt sensitive fields, minimize retention of credentials, audit access, and support user export and deletion. Even when card numbers are not stored, financial metadata remains high-risk."
        ],
        "keyTerms": [
          {
            "term": "Account aggregator",
            "definition": "A third-party service that brokers tokenized access to institution data so your app avoids storing raw bank passwords whenever possible."
          },
          {
            "term": "Last sync watermark",
            "definition": "The timestamp shown to users and used by jobs to request incremental transaction updates."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Lead with security and async extraction. A design that refreshes banks inside a user HTTP request is an instant red flag."
        },
        "checkYourself": [
          {
            "prompt": "Why is 'real-time balance' a dangerous promise?",
            "reveal": "Upstream institutions throttle and fail; your system should expose sync state and freshness instead of implying a live ledger you do not control."
          }
        ]
      },
      {
        "id": "apis-and-linking-flow",
        "heading": "APIs for linking, sync, and budgets",
        "paragraphs": [
          "Linking APIs start an aggregator session, receive a public token, exchange it server-side for access tokens, and persist account metadata without putting secrets in browser storage. Manual sync triggers enqueue a job and return 202 with a job id. Read APIs serve accounts, paginated transactions, monthly summaries, category overrides, and budget configurations.",
          "Budget APIs create monthly targets per category and notification preferences. Alert delivery should be asynchronous. Category override APIs must be idempotent and feed both the immediate UI and future categorization learning pipelines.",
          "Authorize every read by user id with strict tenant isolation. Financial apps fail interviews when they forget that caching and search indexes can leak across users if keys omit owner scope."
        ],
        "checkYourself": [
          {
            "prompt": "Why return 202 for sync instead of waiting for extraction?",
            "reveal": "Extraction can take seconds to minutes and depends on upstream availability. Blocking the request couples UX to the slowest bank API."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Draw the token exchange as a sequence diagram. Interviewers look for secrets staying on the server."
        }
      },
      {
        "id": "data-model-and-pipelines",
        "heading": "Data model: raw ledger versus derived views",
        "paragraphs": [
          "Persist linked accounts, encrypted access material or aggregator references, and a raw transactions ledger as source of truth. Transaction fields include institution ids, amount, posted time, merchant string, pending flag, and a stable external id for idempotent upserts. Pending-to-posted transitions are normal and must update rather than duplicate.",
          "Derived data includes seller-to-category maps, per-user overrides, monthly category totals, and budget snapshots. Compute rollups in pipelines after ingest, not by scanning the full ledger on each dashboard load. Keep enough raw history to recompute when categorization logic improves.",
          "Duplicate detection uses external ids first, then fuzzy fallbacks on amount, date, and merchant for institutions with unstable ids. Soft-delete and correction events from upstream should be first-class; money apps that ignore corrections accumulate silent lies."
        ],
        "workedExample": {
          "title": "Idempotent transaction upsert and monthly rollup key",
          "body": "Sketch how a sync worker writes the ledger and emits a rollup invalidation key.",
          "code": "def upsert_transaction(db, user_id, tx):\n    key = (user_id, tx['account_id'], tx['external_id'])\n    existing = db.get_tx(key)\n    if existing and existing['version'] >= tx['version']:\n        return 'skip'\n    db.put_tx(key, tx)\n    month = tx['posted_at'].strftime('%Y-%m')\n    db.enqueue_rollup(user_id, month)\n    return 'upserted'\n\ndef recompute_month(db, user_id, month):\n    rows = db.iter_tx(user_id, month)\n    totals = {}\n    for r in rows:\n        if r.get('pending'):\n            continue\n        cat = r['category']\n        totals[cat] = totals.get(cat, 0) + r['amount']\n    db.put_monthly_summary(user_id, month, totals)\n    return totals\n\nprint(recompute_month.__name__, 'keys on user+month')",
          "language": "python"
        },
        "keyTerms": [
          {
            "term": "Raw ledger",
            "definition": "Authoritative stored transactions from institutions, retained so derived categories and rollups can be rebuilt."
          },
          {
            "term": "Category override",
            "definition": "A user-specified merchant or transaction categorization that should win over default model output."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say 'raw versus derived' explicitly. It shows you will not recompute dashboards from full history on every GET."
        },
        "checkYourself": [
          {
            "prompt": "What breaks if pending and posted transactions use different external ids with no linkage?",
            "reveal": "Users see duplicates and budgets double-count until a heuristic merge exists. Track pending linkage when the institution provides it."
          }
        ]
      },
      {
        "id": "sync-scale-and-skew",
        "heading": "Sync workers, scale, and user skew",
        "paragraphs": [
          "A queue of sync jobs per account is the backbone. Workers respect institution rate limits with per-host token buckets. Retries use exponential backoff and dead-letter queues for permanent auth failures, prompting the user to relink. Fan-out at month end or morning hours can create herd effects; jitter schedules and priority queues for interactive manual syncs help.",
          "Read scaling relies on cached monthly summaries and paginated transaction queries partitioned by user_id. Hot users with years of history need indexed time ranges and optionally cold storage for old months. Do not put every dashboard widget on the write-optimized ledger store if analytical scans appear.",
          "Categorization can run inline for small batches or as a stream processor. Model updates should reprocess recent months asynchronously. Budget alerts evaluate after rollups update and enqueue notification messages without blocking ingest."
        ],
        "checkYourself": [
          {
            "prompt": "How do you protect upstream banks during a mass reconnect event?",
            "reveal": "Per-institution rate limits, jittered retries, and separate queues so one bank outage does not stall all sync traffic."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A single global sync queue without institution partitioning turns one bank outage into a sitewide backlog."
        }
      },
      {
        "id": "security-consistency-failures",
        "heading": "Security, consistency, and failure modes",
        "paragraphs": [
          "Encrypt tokens at rest with a KMS, restrict decrypt permissions, audit every access, and rotate keys. Transport is TLS everywhere. Admin tools need break-glass procedures. Assume breach drills: what data exists in logs, analytics warehouses, and support screenshots?",
          "Consistency is user-scoped eventual for rollups: after sync, summaries may lag seconds to minutes. Users should see job progress. Category overrides should be read-your-writes on the next dashboard load in-region. Cross-device sessions need auth token hygiene.",
          "Failure modes include stuck syncs, wrong categories causing false budget alerts, duplicate transactions, stale caches after override, and notification storms. Monitor sync success rate by institution, lag distributions, rollup queue depth, alert precision complaints, and encryption key errors. Provide replay from raw ledger when categorization bugs ship."
        ],
        "keyTerms": [
          {
            "term": "Dead-letter queue",
            "definition": "A holding area for sync jobs that failed permanently until a user or operator remediates credentials or data issues."
          },
          {
            "term": "Break-glass access",
            "definition": "Audited emergency access to sensitive financial data with strict controls and expiry."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Close with replay: if categorization is wrong, can you rebuild months without re-hitting every bank?"
        },
        "checkYourself": [
          {
            "prompt": "Why keep the raw ledger if monthly summaries exist?",
            "reveal": "Summaries are derived. Fixes to categories, duplicate logic, or budget rules require recompute from authoritative transactions without depending on upstream availability."
          },
          {
            "prompt": "What should happen when an access token is revoked?",
            "reveal": "Fail the sync to dead-letter, mark the account needs_reauth, stop alerts based on stale assumptions if policy requires, and notify the user to relink."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Linking and sync are asynchronous, rate-limited, and honesty-first about freshness.",
        "Raw transactions are source of truth; categories and monthly budgets are derived and rebuildable.",
        "Security controls and tenant isolation are central design requirements.",
        "Institutional skew and outages demand partitioned queues and jitter.",
        "Alerts and dashboards must tolerate lag and support replay after logic bugs."
      ],
      "nextSteps": [
        "Sequence-diagram token exchange and server-side secret handling.",
        "Design a pending-to-posted merge strategy for a fictional bank API.",
        "List encryption, audit, and deletion requirements for user export requests."
      ]
    }
  },
  "case-studies/twitter": {
    "title": "Case study: Twitter timeline and search",
    "readingTime": "85-100 min",
    "premise": "Twitter-scale design is the classic fan-out interview: fast tweet writes, home versus user timelines, celebrity skew, async notifications, and search indexes that must not block posting. This chapter builds the full path from ingest to read.",
    "parts": [
      {
        "id": "timeline-requirements",
        "heading": "Requirements: write latency versus read fan-out",
        "paragraphs": [
          "Users post tweets quickly, view their profile timeline, scroll a home timeline of people they follow, search recent tweets, and receive notifications. Media uploads complicate writes but should be separated from tweet metadata. The non-negotiable feeling is that posting succeeds fast even when a user has millions of followers.",
          "Reads vastly outnumber writes. Home timeline traffic is extremely hot for active users. Celebrity posts create sudden global load. Search and trends are separate products with their own freshness SLOs. Clarify whether the home timeline is strictly reverse-chronological or ranked; ranking adds feature pipelines but the fan-out skeleton remains.",
          "Capacity sketches should include tweets per second, average followers, p99 followers, home timeline QPS, and media object sizes. The p99 follower count, not the mean, sizes the fan-out problem."
        ],
        "workedExample": {
          "title": "Fan-out work sketch",
          "body": "Compare mean versus celebrity fan-out cost for push-on-write timelines.",
          "code": "tweets_per_sec = 6000\nmean_followers = 200\np99_followers = 50_000\ncelebrity_followers = 10_000_000\n\nmean_fanout_writes = tweets_per_sec * mean_followers\np99_fanout_writes = tweets_per_sec * 0.01 * p99_followers  # if 1% are p99-ish; illustrative\nprint('approx mean fan-out rows/s', mean_fanout_writes)\nprint('one celebrity tweet fan-out rows', celebrity_followers)\n# Hybrid strategy: push for users below threshold, pull for celebrities\nthreshold = 100_000\nprint('push if followers <', threshold)",
          "language": "python"
        },
        "keyTerms": [
          {
            "term": "Fan-out on write",
            "definition": "Pushing a new tweet into followers' timeline caches or stores at post time."
          },
          {
            "term": "Fan-out on read",
            "definition": "Pulling recent tweets from followees at home-timeline read time and merging them."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Mention celebrity hybrid fan-out before drawing twenty boxes. It is the signature insight of this problem."
        },
        "checkYourself": [
          {
            "prompt": "Why is average follower count a misleading sizing input?",
            "reveal": "Fan-out cost is dominated by high-degree accounts. Designs must special-case or bound work for celebrities."
          }
        ]
      },
      {
        "id": "apis-and-write-path",
        "heading": "APIs and the tweet write path",
        "paragraphs": [
          "POST /tweets creates a tweet with text and media references. GET /users/:id/timeline returns a user's tweets. GET /home returns the authenticated home timeline. Search and like/retweet APIs are adjacent. Posting should validate size limits, rate limits, and media upload completion before commit.",
          "The write path persists tweet metadata with a time-sortable unique id such as Snowflake, stores media in object storage, enqueues fan-out and search index jobs, and returns success. Do not wait for fan-out completion. Idempotency keys protect mobile retries from double-posting.",
          "Snowflake-style IDs help order tweets without a central counter bottleneck and make timeline merges easier. Explain clock skew handling at a high level if asked; the interview signal is distributed unique time-ordered ids."
        ],
        "keyTerms": [
          {
            "term": "Snowflake ID",
            "definition": "A distributed 64-bit id scheme combining timestamp, worker id, and sequence for unique, roughly time-ordered keys."
          }
        ],
        "checkYourself": [
          {
            "prompt": "What must complete before the post API returns 200?",
            "reveal": "Durable tweet metadata (and media references) sufficient to serve the user timeline. Fan-out and search can be asynchronous."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Separate media upload from tweet create. Large uploads should not hold the metadata write path open."
        }
      },
      {
        "id": "storage-and-timelines",
        "heading": "Storage model for tweets and timelines",
        "paragraphs": [
          "Tweet store: tweet_id, user_id, text, media keys, created_at, flags. User timeline can be queried from the tweet store by user_id clustered on time or maintained as an explicit list. Home timelines for active users are often materialized lists of tweet ids in Redis or a similar fast store, with multiget to hydrate tweet bodies and user objects.",
          "Social graph services provide followings for pull merges and for push fan-out targets. Counts and favorite state live in separate systems. Search indexes store tokenized text and metadata in a dedicated cluster. Do not force one database to serve transactional posts, huge fan-out lists, and full-text search equally well.",
          "Cold users may lack a warm home timeline. On read, build a temporary merge from followees' recent tweets, optionally materialize lazily, and bound list length. Eviction of inactive home timelines saves memory without breaking profile timelines."
        ],
        "checkYourself": [
          {
            "prompt": "Why store home timelines as id lists plus multiget hydration?",
            "reveal": "Lists stay small and cacheable while tweet bodies and user records are reused across many timelines without duplication."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Distinguish user timeline and home timeline storage. Collapsing them loses the fan-out discussion."
        }
      },
      {
        "id": "celebrity-search-scale",
        "heading": "Celebrity hybrid fan-out, search, and bottlenecks",
        "paragraphs": [
          "Push fan-out works for normal accounts: enqueue writes of tweet ids into followers' home timeline lists. For celebrities, skip push or push only to online active followers, and merge celebrity tweets at read time from the celebrity user timeline. Thresholds are operational knobs tuned by cost and latency.",
          "Search ingest consumes the same tweet events and updates an inverted index asynchronously. Freshness targets might be seconds, not milliseconds. Trends use sliding-window heavy-hitter detection on a sample or stream, isolated from the post path. Notifications are another consumer with their own rate limits and digests.",
          "Bottlenecks appear on Redis memory for timelines, fan-out queue lag after viral posts, search cluster merge storms, and graph service reads when pull merges are wide. Mitigations include timeline length caps, candidate pruning, tiered caches, and isolating celebrity pull paths."
        ],
        "workedExample": {
          "title": "Home timeline merge sketch",
          "body": "Merge precomputed timeline ids with recent celebrity tweets at read time.",
          "code": "def home_timeline(user_id, cache, graph, tweets, celebrity_ids, limit=50):\n    ids = list(cache.lrange(f'home:{user_id}', 0, limit - 1))\n    followings = graph.following(user_id)\n    celebs = [u for u in followings if u in celebrity_ids]\n    for c in celebs:\n        ids.extend(tweets.recent_ids(c, limit=5))\n    # unique preserve order by tweet id time\n    ids = sorted(set(ids), reverse=True)[:limit]\n    return tweets.multiget(ids)\n\nprint('hybrid merge ready')",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "What user-visible symptom indicates fan-out lag?",
            "reveal": "Followers see a tweet late on home timelines while the author's profile timeline already shows it. Search lag is a separate symptom."
          }
        ]
      },
      {
        "id": "consistency-failures-ops",
        "heading": "Consistency, failure modes, and operations",
        "paragraphs": [
          "Authors should see their own tweets immediately on their user timeline. Home timeline delivery is eventual. Deletes and protects must propagate: removing a tweet should delete from caches, indexes, and timelines with best-effort fan-out of deletions, accepting short windows of ghost ids that hydration treats as missing.",
          "Failure modes include fan-out backlog explosions, cache eviction of active users, search mapping explosions after deploys, and thundering herds when a celebrity tweets during a cache outage. Duplicates in timeline lists should be tolerated. Poison tweets that break renderers need quarantine flags.",
          "Operate with SLOs on post success latency, home timeline p99, fan-out lag, search freshness, and cache hit rates. Provide rebuild tools for a user's home timeline from the graph and tweet stores. Chaos-test hybrid celebrity merges."
        ],
        "keyTerms": [
          {
            "term": "Ghost id",
            "definition": "A tweet id present in a timeline list whose body was deleted or is not yet visible; hydration must skip it safely."
          },
          {
            "term": "Search freshness",
            "definition": "The delay between tweet persistence and searchability in the index cluster."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If delete fan-out is ignored, muted or deleted tweets linger in caches and become trust incidents."
        },
        "checkYourself": [
          {
            "prompt": "Should search indexing share a transaction with tweet insert?",
            "reveal": "No. Persist the tweet, then index asynchronously so search outages do not block posting."
          },
          {
            "prompt": "How do you rebuild a cold home timeline?",
            "reveal": "Fetch followings, pull recent tweets from each (with celebrity limits), merge by id/time, optionally materialize the result for subsequent reads."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Post fast: durable tweet write plus async fan-out, search, and notifications.",
        "Home and user timelines have different storage and access patterns.",
        "Hybrid push/pull fan-out is the standard answer to celebrity skew.",
        "Hydrated id lists, multiget, and bounded timeline length keep reads efficient.",
        "Deletes, lag SLOs, and rebuild tools are mandatory operational pieces."
      ],
      "nextSteps": [
        "Choose a celebrity threshold and estimate push write rates with and without it.",
        "Diagram post, fan-out, search, and notification consumers on one event bus.",
        "Specify delete propagation across timeline cache and search index."
      ]
    }
  },
  "case-studies/sales-rank": {
    "title": "Case study: sales rank by category",
    "readingTime": "75-95 min",
    "premise": "Sales rank systems turn append-only purchase events into hot category leaderboards. The interview skill is isolating heavy windowed aggregation from an ultra-cheap read API while explaining freshness, late data, and multi-category products.",
    "parts": [
      {
        "id": "rank-problem-framing",
        "heading": "Frame the ranking window and read SLO",
        "paragraphs": [
          "The product shows top-selling items in a category over a rolling window such as the last seven days. Readers hit category pages at enormous QPS; writers are order events from checkout. Never compute ranks by scanning the OLTP order database on each page view. Separate ingest, aggregation, and serving from the first whiteboard sketch.",
          "Clarify ranking semantics: units sold versus revenue, how returns adjust ranks, whether pending orders count, and how products in multiple categories contribute. Clarify freshness: hourly batch may be enough for merchandising; nearline minutes may be required for campaigns. Exact global sort of millions of SKUs is expensive; top-N per category is the usual serving shape.",
          "Estimates include orders per second, distinct products, distinct categories, average categories per product, and read QPS on top category pages. These numbers decide batch versus stream and how much precomputation you need."
        ],
        "keyTerms": [
          {
            "term": "Rolling window",
            "definition": "A time range anchored to now, such as the past 168 hours, over which sales contribute to rank."
          },
          {
            "term": "Top-N serving set",
            "definition": "The precomputed list of leading products stored for fast category page reads."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State freshness SLO and ranking formula before choosing Flink or MapReduce. Algorithms follow requirements."
        },
        "checkYourself": [
          {
            "prompt": "Why is querying the orders table for each category page view a non-starter at scale?",
            "reveal": "It turns analytical aggregation into synchronous OLTP load, with unpredictable latency and lock or IO contention on the sales system of record."
          }
        ]
      },
      {
        "id": "events-apis-serving",
        "heading": "Event schema, APIs, and serving contract",
        "paragraphs": [
          "Ingest an append-only sales event: order_id, product_id, category_ids[], quantity, revenue, event_time, processing metadata. Category membership is reference data that can change; decide whether rank uses membership at purchase time or current membership. Serving APIs look like GET /categories/:id/top?window=7d&limit=100 with cache headers advertising freshness.",
          "Admin APIs may trigger recomputes or backfills after data repair. Do not expose raw aggregation internals to the storefront. The storefront should treat ranks as an eventually consistent derived signal, similar to Amazon's public explanation of best-seller ranks as relative and time-weighted.",
          "Authorization is mostly public read for storefront ranks, but wholesale export of rank histories may be internal-only. Protect write ingest with producer auth so clients cannot forge sales events."
        ],
        "checkYourself": [
          {
            "prompt": "What breaks if a product's categories change and you always use live membership?",
            "reveal": "Historical sales suddenly move between leaderboards, causing rank jumps unrelated to new purchases. Purchase-time membership is often more stable."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Put window and limit in the API so you do not hard-code one aggregation into the only serving path."
        }
      },
      {
        "id": "aggregation-pipeline",
        "heading": "Aggregation pipeline: batch, stream, or hybrid",
        "paragraphs": [
          "Batch jobs periodically read sales logs for the window, group by (category_id, product_id), sum metrics, sort top-N per category, and write a serving table. This is easy to replay and debug. Stream jobs update windowed counters continuously with watermarks for late events, then periodically snapshot top-N. Hybrid designs stream approximate counters and reconcile with daily exact batch.",
          "Probabilistic structures such as count-min sketch can estimate heavy hitters when the product catalog is huge and approximate ranks are acceptable. For storefront top-100, exact counts per category shard are often feasible if you pre-aggregate by time buckets and slide the window by adding new buckets and dropping old ones.",
          "Multi-category products emit one contribution per category key. Returns emit negative quantities or correction events. The pipeline must be idempotent on order_id revisions to avoid double-counting retries."
        ],
        "workedExample": {
          "title": "Bucketed window aggregation sketch",
          "body": "Maintain hourly buckets and sum the last 168 hours per category-product pair for a sliding week.",
          "code": "from collections import defaultdict\n\n# bucket[(hour, category, product)] = units\nbucket = defaultdict(int)\n\ndef on_sale(event_time_hour, category_id, product_id, qty):\n    bucket[(event_time_hour, category_id, product_id)] += qty\n\ndef top_n(category_id, now_hour, window_hours=168, n=5):\n    scores = defaultdict(int)\n    for h in range(now_hour - window_hours + 1, now_hour + 1):\n        # scan keys for hour; in production, store nested maps per hour\n        for (hour, cat, prod), qty in list(bucket.items()):\n            if hour == h and cat == category_id:\n                scores[prod] += qty\n    return sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[:n]\n\nfor hour, prod, qty in [(10, 'A', 3), (10, 'B', 1), (11, 'A', 2)]:\n    on_sale(hour, 'shoes', prod, qty)\nprint(top_n('shoes', now_hour=11, window_hours=2))",
          "language": "python"
        },
        "keyTerms": [
          {
            "term": "Watermark",
            "definition": "A stream-processing progress signal estimating when events for a time window are complete enough to close."
          },
          {
            "term": "Time bucket",
            "definition": "A discrete slice such as an hour used to add and expire contributions in a sliding window efficiently."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Compare batch replayability with streaming freshness. Hybrid often wins for merchandising ranks."
        },
        "checkYourself": [
          {
            "prompt": "How do late-arriving events affect a closed stream window?",
            "reveal": "Without allowed lateness or reconciliation batch, late sales never join the rank. Watermarks and backfills define the policy."
          }
        ]
      },
      {
        "id": "serving-cache-and-scale",
        "heading": "Serving store, caching, and scale bottlenecks",
        "paragraphs": [
          "Write compact serving rows: category_id, window, rank_list JSON or child rows, computed_at. Cache top categories at CDN or edge with short TTLs aligned to freshness SLO. Most categories are cold; a few are extremely hot during holidays. Pre-warm top caches before events.",
          "Bottlenecks include shuffle-heavy aggregations, skewed categories with huge catalogs, serving-table write storms at job completion, and cache stampedes when a popular category expires. Stagger category materialization and use single-flight on miss. Keep the sales OLTP system off this path entirely.",
          "Scale aggregation horizontally by category id partitions. Ensure a category's top-N can be computed without global sort across all products worldwide. If using streams, watch state size for windowed counters and checkpoint duration."
        ],
        "checkYourself": [
          {
            "prompt": "What should a cache miss on a hot category do?",
            "reveal": "Single-flight load from the serving table, not a live re-aggregation from raw sales events."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If miss handling recomputes from raw logs, you have rebuilt the anti-pattern behind a cache."
        }
      },
      {
        "id": "freshness-failures-ops",
        "heading": "Freshness guarantees, failures, and operations",
        "paragraphs": [
          "Publish computed_at and expected freshness in APIs or headers so clients and operators know the lag. When jobs fail, serve the last good rank rather than empty pages if product prefers staleness over blanks. For campaign-critical categories, page on lag SLO breaches.",
          "Failure modes: late data after reconciliation causing sudden rank jumps, double-counting from non-idempotent retries, category reference data skew, and thundering herds on Black Friday caches. Backfills should be routine tooling, not heroics.",
          "Monitor ingest lag, job duration, window completeness, serving write success, cache hit rate, and user-visible rank volatility. Provide diff tools between batch exact ranks and streaming approximate ranks when running hybrid pipelines."
        ],
        "keyTerms": [
          {
            "term": "Last-good serve",
            "definition": "Continuing to serve the previous successful rank snapshot when a recompute fails, trading freshness for availability."
          },
          {
            "term": "Backfill",
            "definition": "Reprocessing historical sales events to repair or recompute ranks after bugs or late data."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "End with late-data policy and last-good serve. Rank systems are judged on trustworthy staleness, not mythical perfect real time."
        },
        "checkYourself": [
          {
            "prompt": "Would you promise second-level rank freshness on day one?",
            "reveal": "Usually no. Exact windowed top-N with minute-to-hour freshness is cheaper and easier to operate; justify tighter freshness with a concrete product need."
          },
          {
            "prompt": "How do returns enter the design?",
            "reveal": "As correction events that decrement windowed counters or as a deferred adjustment job, with clear semantics for already-materialized serving snapshots."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Isolate sales event ingest, windowed aggregation, and top-N serving from OLTP page reads.",
        "Define ranking formula, multi-category behavior, and freshness SLO before picking batch or stream.",
        "Bucketed windows and category partitions keep sliding top-N tractable.",
        "Caches must fall back to serving tables, never to live raw re-aggregation.",
        "Late data, backfills, and last-good serve policies make ranks operationally trustworthy."
      ],
      "nextSteps": [
        "Choose batch versus stream for a store with 5-minute freshness and strong replay needs.",
        "Estimate storage for hourly buckets across 10k categories and 2M products.",
        "Design a Black Friday cache warm-up and stampede policy for top 50 categories."
      ]
    }
  }
};
