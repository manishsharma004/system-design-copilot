var e={"case-studies/url-shortener":{referenceSource:{label:`System Design Primer · Pastebin / Bit.ly`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md`},solutionOverview:{summary:`Start with create and redirect APIs, quantify the read-heavy profile, keep redirect latency tiny, and move analytics plus abuse handling off the critical path.`,requirements:[`Create short links, optional custom aliases, expiration, and safe redirects.`,`Keep redirect latency low even when a few links become extremely hot.`,`Track analytics asynchronously and enforce abuse controls on write APIs.`],estimates:[`10 million writes/month ≈ 4 writes/sec average, but design for bursty campaigns.`,`100 million reads/month ≈ 40 reads/sec average with hot-key spikes far above the mean.`,`62^7 key space is enough for hundreds of millions of links before expanding code length.`],keyDecisions:[`Use a primary store for code → target mapping and a cache for hot redirects.`,`Generate IDs centrally or from a pre-allocated range to avoid collisions on the hot path.`,`Publish click events to a queue instead of updating counters synchronously.`]},detailedSolution:[{heading:`1. Clarify the narrow MVP first`,body:`Frame the problem as a write API and a much hotter read API. Say upfront whether custom aliases, TTL, deletion, and analytics are in scope because each one changes storage and validation requirements.`,bullets:[`Separate correctness requirements for creation from latency requirements for redirects.`,`Ask if links are immutable after creation and whether expired links must hard-fail or soft-redirect.`,`Call out abuse controls early: malware URLs, spam campaigns, and brute-force scans.`]},{heading:`2. Present the happy-path architecture`,body:`Use an edge layer for TLS and rate limits, a write service to validate and persist mappings, a redirect service for the hot path, a primary datastore for mappings, Redis for hot keys, and a queue for click events.`,bullets:[`Creation path: validate URL → generate or reserve code → persist metadata → return short URL.`,`Redirect path: cache lookup → datastore fallback on miss → emit click event → return 301/302.`,`Background workers aggregate click events, expire old entries, and refresh abuse rules.`]},{heading:`3. Deep dive on the high-signal trade-offs`,body:`Interviewers usually care about code generation, cache strategy, and hot-key handling more than the diagram itself. Explain why reads dominate, why custom aliases need uniqueness checks, and how to keep cache misses from stampeding the database.`,bullets:[`Counter-based IDs are simple but need high availability or range allocation per region.`,`Random IDs reduce coordination but require collision checks and reserved-word filtering.`,`Use negative caching and request coalescing for missing or newly-expired links.`]},{heading:`4. Finish with operations and growth steps`,body:`Close the answer by saying what breaks first and how you would evolve the system. For a URL shortener, the first bottlenecks are usually hot redirects, abuse write bursts, and analytics fan-out.`,bullets:[`Add read replicas or partition by code prefix when mapping traffic outgrows one primary.`,`Push popular redirects closer to the edge with regional caches or CDN-assisted caching.`,`Monitor cache hit rate, redirect latency, code collision retries, and malicious-link reports.`]}],sampleAnswer:[{heading:`Requirements and scope`,bullets:[`I will design create-short-link and redirect APIs, plus optional alias, expiration, and analytics.`,`The system is read-heavy, so I will optimize the redirect path first and keep analytics asynchronous.`,`I will leave account management and custom domains out of the first version unless asked.`]},{heading:`Capacity estimates`,bullets:[`At 10 million new links per month and roughly 1 KB metadata per link, storage is manageable in a relational or key-value store for the initial phase.`,`Average read QPS is modest, but hot links can spike by orders of magnitude, so caching and hot-key protection matter more than the mean.`,`The code space should support at least a few years of growth before we lengthen keys.`]},{heading:`High-level design`,bullets:[`A client hits an API gateway and the write service validates the destination URL, reserves a short code, writes the mapping, and returns the short link.`,`Redirect requests go to a read service that first checks Redis, falls back to the primary store on misses, and then returns a redirect response.`,`Each redirect also emits an analytics event to a queue so counters and dashboards do not add latency to the user-facing path.`]},{heading:`Data model and APIs`,bullets:[`Mapping table: code, long_url, created_at, expires_at, owner_id(optional), status, safety_state.`,`POST /links creates a new mapping, GET /:code resolves it, DELETE /:code disables it, and analytics read models stay separate from the hot store.`,`If custom aliases are supported, I would do a uniqueness check plus reserved-word filtering before commit.`]},{heading:`Scaling and trade-offs`,bullets:[`I would partition by code prefix or hashed code once a single write primary becomes a bottleneck.`,`For hot links, I would use regional caches, request collapsing, and maybe CDN-assisted caching for redirect responses.`,`My closing trade-off is that stronger write coordination makes uniqueness easy, while looser coordination improves availability but needs better collision handling.`]}],interviewCode:[{title:`Core short-link service`,filename:`url-shortener.ts`,language:`ts`,description:`A compact interview-ready implementation for create and resolve flows, including Base62 IDs and expiration checks.`,code:`type CreateLinkRequest = {
  longUrl: string;
  customAlias?: string;
  expiresAt?: Date;
};

type LinkRecord = {
  code: string;
  longUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
  clickCount: number;
  lastAccessedAt: Date | null;
};

class InMemoryLinkRepository {
  #records = new Map<string, LinkRecord>();

  get(code: string): LinkRecord | null {
    return this.#records.get(code) ?? null;
  }

  save(record: LinkRecord): void {
    this.#records.set(record.code, record);
  }

  incrementClick(code: string): void {
    const current = this.#records.get(code);
    if (!current) return;
    current.clickCount += 1;
    current.lastAccessedAt = new Date();
  }
}

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encodeBase62(value: number): string {
  if (value === 0) return '0';
  let remaining = value;
  let encoded = '';
  while (remaining > 0) {
    encoded = BASE62[remaining % 62] + encoded;
    remaining = Math.floor(remaining / 62);
  }
  return encoded;
}

class UrlShortenerService {
  #sequence = 0;

  constructor(
    private readonly repository: InMemoryLinkRepository,
    private readonly publishAnalytics: (event: { code: string; accessedAt: Date }) => void
  ) {}

  createLink(request: CreateLinkRequest): LinkRecord {
    if (!request.longUrl.startsWith('http://') && !request.longUrl.startsWith('https://')) {
      throw new Error('Only http and https URLs are allowed');
    }

    const code = request.customAlias ?? this.nextCode();
    if (this.repository.get(code)) {
      throw new Error('Short code already exists');
    }

    const record: LinkRecord = {
      code,
      longUrl: request.longUrl,
      createdAt: new Date(),
      expiresAt: request.expiresAt ?? null,
      clickCount: 0,
      lastAccessedAt: null
    };

    this.repository.save(record);
    return record;
  }

  resolve(code: string): string | null {
    const record = this.repository.get(code);
    if (!record) return null;
    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    this.repository.incrementClick(code);
    this.publishAnalytics({ code, accessedAt: new Date() });
    return record.longUrl;
  }

  private nextCode(): string {
    this.#sequence += 1;
    return encodeBase62(this.#sequence).padStart(7, '0').slice(-7);
  }
}`},{title:`Async analytics aggregation`,filename:`analytics-consumer.ts`,language:`ts`,description:`Shows how to move monthly click counting out of the redirect path.`,code:`type ClickEvent = {
  code: string;
  accessedAt: Date;
};

class AnalyticsAggregator {
  #monthlyCounts = new Map<string, number>();

  consume(event: ClickEvent): void {
    const bucket = this.bucketKey(event);
    const current = this.#monthlyCounts.get(bucket) ?? 0;
    this.#monthlyCounts.set(bucket, current + 1);
  }

  flush(): Array<{ bucket: string; clicks: number }> {
    const snapshot = Array.from(this.#monthlyCounts.entries()).map(([bucket, clicks]) => ({
      bucket,
      clicks
    }));
    this.#monthlyCounts.clear();
    return snapshot;
  }

  private bucketKey(event: ClickEvent): string {
    const month = event.accessedAt.toISOString().slice(0, 7);
    return month + ':' + event.code;
  }
}`}]},"case-studies/web-crawler":{referenceSource:{label:`System Design Primer · Web crawler`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/web_crawler/README.md`},solutionOverview:{summary:`A strong crawler answer emphasizes durable frontier state, politeness by host, deduplication for both URLs and content, and a pipeline that keeps fetching independent from parsing and indexing.`,requirements:[`Crawl and refresh a huge URL set without loops, duplicate work, or impolite traffic spikes.`,`Extract links and metadata, then feed downstream indexing and document-generation systems.`,`Remain available while workers fail, hosts slow down, or parsing backlogs grow.`],estimates:[`1 billion links with weekly refresh becomes roughly 4 billion crawls per month.`,`At 500 KB average page size, monthly raw fetch storage lands in the multi-petabyte range.`,`The important interview signal is prioritization and back pressure, not exact hardware counts.`],keyDecisions:[`Keep frontier state durable and partitioned by host or domain to enforce politeness.`,`Deduplicate URLs before fetch and page signatures after fetch.`,`Split fetch, parse, and index stages with queues so a slow parser does not stall crawling.`]},detailedSolution:[{heading:`1. Model the frontier explicitly`,body:`The frontier is the heart of the crawler. Say that each host gets its own scheduling lane so you can respect crawl-delay, retry backoff, and host-level fairness.`,bullets:[`Rank by freshness, popularity, and discovery source instead of one giant FIFO queue.`,`Store not-before timestamps per host to implement politeness and retry windows.`,`Persist frontier offsets so workers can restart without replaying everything.`]},{heading:`2. Separate fetch from parse from index`,body:`A fetcher should only worry about HTTP, compression, and robots checks. Parsing and downstream indexing should happen asynchronously so you can scale each stage independently.`,bullets:[`Fetch workers emit raw content and metadata to durable storage.`,`Parser workers extract links, titles, snippets, and signatures.`,`Index workers update reverse indexes without blocking discovery.`]},{heading:`3. Deduplicate on multiple levels`,body:`URL dedup alone is not enough because many different URLs can serve identical pages. A complete answer includes canonicalization, visited-URL tracking, and content-similarity checks.`,bullets:[`Canonicalize scheme, fragments, default ports, and tracking parameters before enqueue.`,`Use a visited set or Bloom filter to avoid obvious repeat fetches.`,`Hash or fingerprint page bodies so duplicate content can be down-ranked or skipped.`]},{heading:`4. Close with safety and observability`,body:`End by mentioning robots.txt, host bans, retry budgets, parser lag, and freshness SLOs. These are the details that make the design feel production-ready.`,bullets:[`Track host error rates, queue backlog, duplicate ratio, and crawl freshness.`,`Apply back pressure when parsers or indexers fall behind.`,`Protect the system from trap URLs, infinite spaces, and oversized responses.`]}],sampleAnswer:[{heading:`Requirements and constraints`,bullets:[`I will design a distributed crawler that discovers pages, refreshes them regularly, and produces indexable metadata.`,`The system must be polite per host, avoid cycles and duplicates, and continue working when workers fail.`,`I will treat ranking and search serving as downstream systems and focus the deep dive on crawling itself.`]},{heading:`High-level architecture`,bullets:[`I would use a durable frontier service, fetch workers, parser workers, content storage, and downstream indexing queues.`,`The frontier stores candidate URLs, grouped by host with next-allowed-fetch timestamps and priorities.`,`Fetchers download pages and push raw bodies plus metadata to storage, then parsers extract links and signatures asynchronously.`]},{heading:`Data and scheduling model`,bullets:[`Each URL is canonicalized before enqueue, and a visited set or Bloom filter blocks obvious duplicates.`,`I keep per-host queues so one aggressive domain cannot starve the rest of the crawl budget.`,`Pages also get a content fingerprint so identical mirrors can be identified after fetch.`]},{heading:`Scaling and failure handling`,bullets:[`I would partition the frontier by host hash, replicate durable state, and make workers stateless so they can scale horizontally.`,`If parsing lags, I would slow fetch throughput with explicit back pressure instead of letting storage explode.`,`My final trade-off is that stronger freshness guarantees cost more bandwidth and storage, so revisit frequency should depend on popularity and change rate.`]}],interviewCode:[{title:`Host-aware frontier scheduler`,filename:`crawler-frontier.ts`,language:`ts`,description:`Demonstrates politeness-aware scheduling and URL deduplication.`,code:`type FrontierItem = {
  url: string;
  host: string;
  depth: number;
  notBefore: number;
};

class Frontier {
  #queues = new Map<string, FrontierItem[]>();
  #seen = new Set<string>();

  add(item: FrontierItem): void {
    if (this.#seen.has(item.url)) return;
    this.#seen.add(item.url);
    const queue = this.#queues.get(item.host) ?? [];
    queue.push(item);
    queue.sort((left, right) => left.notBefore - right.notBefore);
    this.#queues.set(item.host, queue);
  }

  next(now = Date.now()): FrontierItem | null {
    for (const [host, queue] of this.#queues.entries()) {
      const candidate = queue[0];
      if (!candidate || candidate.notBefore > now) continue;
      queue.shift();
      if (queue.length === 0) {
        this.#queues.delete(host);
      }
      return candidate;
    }
    return null;
  }
}

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  parsed.searchParams.delete('utm_source');
  parsed.searchParams.delete('utm_medium');
  return parsed.toString();
}`},{title:`Crawler worker loop`,filename:`crawler-worker.ts`,language:`ts`,description:`A compact worker loop that fetches, fingerprints, and fans out discovered links.`,code:`type FetchResult = {
  url: string;
  body: string;
  links: string[];
};

class CrawlStore {
  visited = new Set<string>();
  fingerprints = new Set<string>();
}

class CrawlerWorker {
  constructor(
    private readonly frontier: Frontier,
    private readonly store: CrawlStore,
    private readonly fetchPage: (url: string) => Promise<FetchResult>,
    private readonly publish: (topic: string, payload: unknown) => void
  ) {}

  async run(limit: number): Promise<void> {
    while (limit-- > 0) {
      const next = this.frontier.next();
      if (!next) break;
      if (this.store.visited.has(next.url)) continue;

      const page = await this.fetchPage(next.url);
      const fingerprint = this.signature(page.body);
      if (this.store.fingerprints.has(fingerprint)) continue;

      this.store.visited.add(page.url);
      this.store.fingerprints.add(fingerprint);
      this.publish('document-index', { url: page.url, body: page.body });

      for (const link of page.links) {
        const normalized = normalizeUrl(link);
        this.frontier.add({
          url: normalized,
          host: new URL(normalized).host,
          depth: next.depth + 1,
          notBefore: Date.now() + 1_000
        });
      }
    }
  }

  private signature(body: string): string {
    let hash = 0;
    for (const char of body) {
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return String(hash);
  }
}`}]},"case-studies/social-graph":{referenceSource:{label:`System Design Primer · Social graph`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/social_graph/README.md`},solutionOverview:{summary:`The best answer chooses adjacency-list storage for hot reads, explains how different edge types behave, and deep dives on shortest-path or celebrity-skew handling instead of naming a graph database too early.`,requirements:[`Store relationship edges with clear semantics: follow, friend, mute, block, and privacy overrides.`,`Serve hot queries such as followers, following, mutuals, and path or recommendation lookups.`,`Propagate graph changes to feeds, notifications, and ranking pipelines.`],estimates:[`100 million users with 50 relationships on average yields billions of edges.`,`Read traffic is uneven because celebrity accounts cause extreme skew in adjacency lookups.`,`Graph traversals that cross shards are the expensive part, so data locality and cache strategy matter.`],keyDecisions:[`Represent hot edges as adjacency lists rather than running arbitrary graph traversals on every request.`,`Shard users by ID while keeping room for fan-out caches and derived views.`,`Use bidirectional BFS or offline precomputation for shortest-path style interview follow-ups.`]},detailedSolution:[{heading:`1. Separate edge semantics first`,body:`A follow edge is directional, a friendship edge is mutual, and a block edge must override visibility immediately. Call that out before talking about storage so the interviewer sees that you understand product semantics.`,bullets:[`Store edge type, source, destination, state, and timestamps explicitly.`,`Treat blocks and privacy edges as latency-sensitive authorization checks.`,`Publish edge mutations to downstream consumers instead of embedding all logic in the graph store.`]},{heading:`2. Optimize the hot reads, not the fanciest query`,body:`Most user-facing requests are adjacency lookups, counts, and membership checks. Those work well with denormalized adjacency lists, caches, and precomputed counters.`,bullets:[`Followers and following lists can be paginated by user ID or edge creation time.`,`Mutuals are often cheaper as set intersections over bounded adjacency windows.`,`Celebrity accounts may need special storage or cache treatment because one node dominates reads.`]},{heading:`3. Deep dive where the interviewer pushes`,body:`If the follow-up is shortest path, discuss bidirectional BFS and the cost of machine hops. If the follow-up is feeds, discuss event streams and derived materialized views.`,bullets:[`Cache popular adjacency fragments close to the application tier.`,`Batch requests to the same shard to reduce cross-machine chatter during BFS.`,`Use offline computation for recommendations instead of live multi-hop traversals.`]},{heading:`4. Close with consistency and repair`,body:`Mutual relationships, block propagation, and downstream feed updates all create consistency questions. A strong close explains what must be synchronous and what can lag.`,bullets:[`Blocks should take effect synchronously on read authorization paths.`,`Follower counts can be eventually consistent if the UI tolerates minor delay.`,`Keep repair and backfill jobs for corrupted derived views or replayed events.`]}],sampleAnswer:[{heading:`Requirements and hot queries`,bullets:[`I will model directional and bidirectional relationships separately because they drive different APIs and correctness rules.`,`The hot reads are followers, following, mutuals, counts, and authorization checks like block or mute.`,`I will keep recommendation and ranking systems as downstream consumers rather than part of the core graph write path.`]},{heading:`Storage model`,bullets:[`My baseline store is an adjacency-list model keyed by user ID, with edge records containing type, destination, state, and timestamps.`,`I would shard by user ID and keep read-optimized secondary views for counts and high-traffic edges.`,`Graph databases can help for specialized traversals, but they are not required for the hottest request paths.`]},{heading:`Read and write paths`,bullets:[`A follow request writes the edge, updates counters asynchronously, and emits an event for feeds and recommendations.`,`A followers query reads the paginated adjacency list, checks block state, and may use a cache for the first few pages.`,`For shortest-path follow-ups, I would use bidirectional BFS with shard-aware batching instead of single-ended traversal.`]},{heading:`Trade-offs and scale story`,bullets:[`Celebrity skew is the first scale issue, so I would call out cache sharding and special treatment for very large adjacency sets.`,`I want synchronous correctness for block checks, but eventual consistency is acceptable for follower counts and recommendation updates.`,`My closing trade-off is between flexible traversals and simple, predictable hot-path storage.`]}],interviewCode:[{title:`Adjacency-list graph service`,filename:`social-graph.ts`,language:`ts`,description:`Implements relationship writes plus a bidirectional shortest-path helper.`,code:`type UserId = string;

type EdgeType = 'follow' | 'friend' | 'block';

type Edge = {
  from: UserId;
  to: UserId;
  type: EdgeType;
};

class SocialGraphService {
  #adjacency = new Map<UserId, Set<UserId>>();

  addEdge(edge: Edge): void {
    this.#ensure(edge.from).add(edge.to);
    if (edge.type === 'friend') {
      this.#ensure(edge.to).add(edge.from);
    }
  }

  removeEdge(edge: Edge): void {
    this.#adjacency.get(edge.from)?.delete(edge.to);
    if (edge.type === 'friend') {
      this.#adjacency.get(edge.to)?.delete(edge.from);
    }
  }

  shortestPath(source: UserId, target: UserId): UserId[] | null {
    if (source === target) return [source];

    const leftPrev = new Map<UserId, UserId | null>([[source, null]]);
    const rightPrev = new Map<UserId, UserId | null>([[target, null]]);
    let leftFrontier = new Set<UserId>([source]);
    let rightFrontier = new Set<UserId>([target]);

    while (leftFrontier.size && rightFrontier.size) {
      const leftMeeting = this.expand(leftFrontier, leftPrev, rightPrev);
      if (leftMeeting) return this.buildPath(leftMeeting, leftPrev, rightPrev);

      const rightMeeting = this.expand(rightFrontier, rightPrev, leftPrev);
      if (rightMeeting) return this.buildPath(rightMeeting, leftPrev, rightPrev);
    }

    return null;
  }

  private expand(
    frontier: Set<UserId>,
    ownPrev: Map<UserId, UserId | null>,
    otherPrev: Map<UserId, UserId | null>
  ): UserId | null {
    const next = new Set<UserId>();
    for (const node of frontier) {
      for (const neighbor of this.#adjacency.get(node) ?? []) {
        if (ownPrev.has(neighbor)) continue;
        ownPrev.set(neighbor, node);
        if (otherPrev.has(neighbor)) return neighbor;
        next.add(neighbor);
      }
    }
    frontier.clear();
    next.forEach((node) => frontier.add(node));
    return null;
  }

  private buildPath(
    meeting: UserId,
    leftPrev: Map<UserId, UserId | null>,
    rightPrev: Map<UserId, UserId | null>
  ): UserId[] {
    const leftPath: UserId[] = [];
    let current: UserId | null = meeting;
    while (current) {
      leftPath.push(current);
      current = leftPrev.get(current) ?? null;
    }

    const rightPath: UserId[] = [];
    current = rightPrev.get(meeting) ?? null;
    while (current) {
      rightPath.push(current);
      current = rightPrev.get(current) ?? null;
    }

    return leftPath.reverse().concat(rightPath);
  }

  private #ensure(userId: UserId): Set<UserId> {
    if (!this.#adjacency.has(userId)) {
      this.#adjacency.set(userId, new Set<UserId>());
    }
    return this.#adjacency.get(userId)!;
  }
}`}]},"case-studies/query-cache":{referenceSource:{label:`System Design Primer · Query cache`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/query_cache/README.md`},solutionOverview:{summary:`A convincing cache answer defines the cached unit, the invalidation strategy, and the hot-key protections before talking about hit ratio. Miss cost and freshness drive the entire design.`,requirements:[`Cache expensive query results with fast lookups and bounded memory usage.`,`Support both cache hits and misses while preserving freshness guarantees.`,`Handle skewed workloads, hot keys, and invalidation after source-data changes.`],estimates:[`10 billion queries per month is roughly 4,000 requests/sec on average before peak amplification.`,`If all queries are unique, keeping everything is impossible, so eviction and selective caching are mandatory.`,`The system should focus on high-value repeated queries, not perfect coverage.`],keyDecisions:[`Normalize query keys so equivalent searches map to the same cache entry.`,`Use LRU or size-aware eviction plus TTL and request coalescing for freshness and stampede control.`,`Invalidate via events when possible, and fall back to TTL when exact dependency tracking is too expensive.`]},detailedSolution:[{heading:`1. Cache the response users actually repeat`,body:`Caching raw rows is often less useful than caching the final assembled response. State the cache key shape out loud, including auth scope, locale, tenant, and pagination controls.`,bullets:[`Normalize equivalent query strings before lookup.`,`Reject giant payloads or low-value one-off queries from the cache.`,`Measure saved database cost per entry, not just raw hit percentage.`]},{heading:`2. Handle the miss path carefully`,body:`The hardest production issue is usually a thundering herd during misses or invalidation. Use single-flight request coalescing so only one backend fetch populates a missing hot key.`,bullets:[`Track in-flight computations per normalized key.`,`Return stale data temporarily if the backend is slow but correctness allows it.`,`Update LRU state on hits so the hottest responses stay resident.`]},{heading:`3. Talk through freshness explicitly`,body:`TTL is easy but imprecise, while event-based invalidation is accurate but operationally heavier. Explain which one you choose for different query categories.`,bullets:[`Time-based expiry works well for analytics or search suggestions.`,`Event invalidation is better when query results depend on a small, known set of objects.`,`Stale-while-revalidate is a good compromise when user latency matters more than exact freshness.`]},{heading:`4. Finish with cluster scaling`,body:`A single cache node is fine for the whiteboard baseline, but growth usually means sharding or replicated caches. Mention consistent hashing and admission policies.`,bullets:[`Shard by normalized key to spread memory and query load.`,`Replicate only the hottest subset if full copies are too expensive.`,`Track eviction churn, backend miss cost, and invalidation lag.`]}],sampleAnswer:[{heading:`Define the cached unit`,bullets:[`I will cache normalized query results, not raw database rows, because users repeat the final response shape.`,`The cache key should include query text plus auth context, locale, tenant, and pagination when those change results.`,`I only want to cache queries whose backend cost is high enough to justify memory usage.`]},{heading:`Hit and miss flow`,bullets:[`On a hit, I return the cached payload and move the entry to the front of the eviction structure.`,`On a miss, I use request coalescing so only one caller computes the result and the rest wait for the same promise.`,`After a successful backend read, I store the response with TTL metadata and eviction bookkeeping.`]},{heading:`Freshness and invalidation`,bullets:[`I would combine TTL with targeted invalidation events when underlying documents change.`,`For very hot keys, stale-while-revalidate can protect latency while a background refresh repopulates the entry.`,`I would avoid caching queries whose invalidation fan-out is larger than the cost of recomputing them.`]},{heading:`Scale and trade-offs`,bullets:[`As traffic grows, I would shard the cache cluster with consistent hashing and add hot-key protection.`,`The main trade-off is freshness versus simplicity: TTL is easier, event invalidation is more accurate, and combining both often works best.`,`I would close by monitoring hit ratio, miss cost, stampede count, and eviction churn.`]}],interviewCode:[{title:`LRU cache with TTL`,filename:`query-cache.ts`,language:`ts`,description:`A minimal cache that supports TTL-aware hits and LRU eviction.`,code:`type CacheEntry<T> = {
  key: string;
  value: T;
  expiresAt: number;
  newer: CacheEntry<T> | null;
  older: CacheEntry<T> | null;
};

class QueryCache<T> {
  #lookup = new Map<string, CacheEntry<T>>();
  #head: CacheEntry<T> | null = null;
  #tail: CacheEntry<T> | null = null;

  constructor(private readonly capacity: number) {}

  get(key: string): T | null {
    const entry = this.#lookup.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.delete(key);
      return null;
    }
    this.moveToFront(entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    const existing = this.#lookup.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = Date.now() + ttlMs;
      this.moveToFront(existing);
      return;
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt: Date.now() + ttlMs,
      newer: this.#head,
      older: null
    };

    if (this.#head) this.#head.older = entry;
    this.#head = entry;
    if (!this.#tail) this.#tail = entry;
    this.#lookup.set(key, entry);

    if (this.#lookup.size > this.capacity && this.#tail) {
      this.delete(this.#tail.key);
    }
  }

  delete(key: string): void {
    const entry = this.#lookup.get(key);
    if (!entry) return;
    if (entry.older) entry.older.newer = entry.newer;
    if (entry.newer) entry.newer.older = entry.older;
    if (this.#head === entry) this.#head = entry.newer;
    if (this.#tail === entry) this.#tail = entry.older;
    this.#lookup.delete(key);
  }

  private moveToFront(entry: CacheEntry<T>): void {
    if (this.#head === entry) return;
    this.delete(entry.key);
    this.set(entry.key, entry.value, Math.max(entry.expiresAt - Date.now(), 1));
  }
}`},{title:`Single-flight query service`,filename:`query-service.ts`,language:`ts`,description:`Shows normalized keys, single-flight miss handling, and cache population.`,code:`class QueryService<T> {
  #inFlight = new Map<string, Promise<T>>();

  constructor(
    private readonly cache: QueryCache<T>,
    private readonly fetcher: (query: string) => Promise<T>
  ) {}

  async execute(rawQuery: string): Promise<T> {
    const query = this.normalize(rawQuery);
    const cached = this.cache.get(query);
    if (cached) return cached;

    const existing = this.#inFlight.get(query);
    if (existing) return existing;

    const promise = this.fetcher(query).then((result) => {
      this.cache.set(query, result, 30_000);
      this.#inFlight.delete(query);
      return result;
    });

    this.#inFlight.set(query, promise);
    return promise;
  }

  private normalize(rawQuery: string): string {
    return rawQuery.trim().toLowerCase().replace(/s+/g, ' ');
  }
}`}]},"case-studies/scaling-playbook":{referenceSource:{label:`System Design Primer · Scaling on AWS`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/scaling_aws/README.md`},solutionOverview:{summary:`Treat scaling as a staged story: start with one box, split storage and stateless compute, then add caches, replicas, queues, autoscaling, and partitioning only when metrics justify each move.`,requirements:[`Serve read and write traffic reliably while growing from a small deployment to millions of users.`,`Keep the architecture understandable and incremental so migrations stay realistic.`,`Include operations, failure domains, and cost control as part of the design story.`],estimates:[`A 100:1 read/write ratio means read scaling arrives earlier than write partitioning.`,`1 TB of new content per month makes object storage and warehouse planning relevant before multi-year retention becomes painful.`,`The exact cloud vendor is less important than the sequence of bottlenecks and responses.`],keyDecisions:[`Start with a single deployable unit, then peel off storage, edge, and async workloads one step at a time.`,`Use stateless application servers plus cache-aside reads to make horizontal scaling simple.`,`Let observed bottlenecks trigger the next stage: replicas for read load, queues for background work, sharding for write scale.`]},detailedSolution:[{heading:`1. Start deliberately simple`,body:`Interviewers want to hear that version one does not need every distributed-system pattern. A single app plus one relational database is a valid starting point if you instrument it well.`,bullets:[`Use vertical scaling first while traffic is low and the team is small.`,`Collect CPU, memory, latency, error, and storage metrics from day one.`,`Keep the app deployable as one unit until the first clear bottleneck appears.`]},{heading:`2. Split independent concerns next`,body:`The natural next step is to separate static assets, databases, and stateless compute. This reduces coupling and lets you scale the web tier independently.`,bullets:[`Move static files to object storage and a CDN.`,`Put the relational database on managed infrastructure with backups and failover.`,`Add a load balancer in front of multiple app servers so application instances become replaceable.`]},{heading:`3. Scale reads before writes`,body:`Most consumer systems feel read pressure first. That is where cache-aside, replicas, and stateless sessions pay off quickly.`,bullets:[`Externalize sessions to a cache so app servers can autoscale.`,`Use read replicas or read stores for heavy query traffic.`,`Protect the database with result or object caching for the hottest content.`]},{heading:`4. Introduce asynchronous work and partitioning only when justified`,body:`Queues and workers are the next unlock for thumbnails, fan-out, emails, and back-office processing. Sharding or multi-region traffic should come only after metrics prove a single writer or single region is no longer enough.`,bullets:[`Publish background jobs instead of doing heavy work in request handlers.`,`Adopt autoscaling and incident tooling as operational load rises.`,`Move old data, analytics, or blobs into cheaper stores before the primary database becomes bloated.`]}],sampleAnswer:[{heading:`Version-one baseline`,bullets:[`I would start with one app deployment and one relational database because it keeps development fast and operational overhead low.`,`I would still add monitoring, backups, and security boundaries immediately so the first migration is guided by evidence.`,`At this stage, vertical scaling is acceptable because simplicity beats premature distribution.`]},{heading:`First scaling steps`,bullets:[`When the app tier or static content becomes the bottleneck, I split static assets into object storage plus CDN and put multiple stateless app servers behind a load balancer.`,`I move the database onto managed infrastructure with backups and failover so compute and storage can scale independently.`,`This stage improves both availability and deployment safety without changing the product surface.`]},{heading:`Read-heavy growth stage`,bullets:[`Because the workload is read-heavy, I add cache-aside reads, externalized sessions, and read replicas before I think about write sharding.`,`This makes app servers horizontally scalable and reduces load on the primary database.`,`I would call out the consistency trade-off between fast replicas and the freshest possible reads.`]},{heading:`Advanced scaling stage`,bullets:[`Asynchronous jobs handle thumbnails, notifications, indexing, and other expensive work outside request paths.`,`Only after sustained write pressure or data growth would I add partitioning, specialized stores, or multi-region routing.`,`My closing point is that each stage should be triggered by metrics, not by copying a final-state architecture too early.`]}],interviewCode:[{title:`Stateless application service`,filename:`content-service.ts`,language:`ts`,description:`A read-heavy service sketch with cache-aside reads and queued background work.`,code:`type Post = {
  id: string;
  body: string;
  createdAt: Date;
};

interface PrimaryStore {
  insert(post: Post): Promise<void>;
  read(id: string): Promise<Post | null>;
}

interface CacheStore {
  get(key: string): Promise<Post | null>;
  set(key: string, value: Post, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
}

interface JobQueue {
  enqueue(job: { type: string; postId: string }): Promise<void>;
}

class ContentService {
  constructor(
    private readonly primary: PrimaryStore,
    private readonly cache: CacheStore,
    private readonly jobs: JobQueue
  ) {}

  async getPost(id: string): Promise<Post | null> {
    const cached = await this.cache.get(id);
    if (cached) return cached;

    const post = await this.primary.read(id);
    if (post) {
      await this.cache.set(id, post, 60_000);
    }
    return post;
  }

  async createPost(body: string): Promise<Post> {
    const post: Post = {
      id: crypto.randomUUID(),
      body,
      createdAt: new Date()
    };

    await this.primary.insert(post);
    await this.cache.delete(post.id);
    await this.jobs.enqueue({ type: 'fanout-and-index', postId: post.id });
    return post;
  }
}`},{title:`Background worker slice`,filename:`fanout-worker.ts`,language:`ts`,description:`Illustrates how scaling stories usually move expensive work off the synchronous path.`,code:`type Job = {
  type: 'fanout-and-index';
  postId: string;
};

class FanoutWorker {
  constructor(
    private readonly loadFollowers: (postId: string) => Promise<string[]>,
    private readonly publishFeedUpdate: (userId: string, postId: string) => Promise<void>
  ) {}

  async handle(job: Job): Promise<void> {
    const followerIds = await this.loadFollowers(job.postId);
    for (const followerId of followerIds) {
      await this.publishFeedUpdate(followerId, job.postId);
    }
  }
}`}]},"case-studies/pastebin":{referenceSource:{label:`System Design Primer · Pastebin / Bit.ly`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md`},solutionOverview:{summary:`Treat pastebin as two systems: a hot metadata lookup keyed by shortlink and a colder blob store for the paste body, with expiration and analytics pushed off the critical path.`,requirements:[`Store text pastes, optional expiration, and anonymous access behind a short URL.`,`Keep reads fast for popular links while serving large paste bodies reliably.`,`Collect analytics and delete expired content without slowing down the read path.`],estimates:[`At roughly 10 million pastes per month, metadata remains small while blob storage growth dominates over time.`,`A 10:1 read-heavy profile means caching popular shortlinks and paste bodies matters more than optimizing writes first.`,`Monthly analytics can be computed in batches because exact real-time counters are not user-critical.`],keyDecisions:[`Keep shortlink metadata in an indexed store and the paste body in object storage or a document store.`,`Use cache-aside reads for hot pastes and negative caching for expired or missing entries.`,`Run analytics and expiration cleanup asynchronously from events or access logs.`]},detailedSolution:[{heading:`1. Frame the data split clearly`,body:`The shortlink lookup and the paste payload have different performance characteristics, so explain them as separate concerns rather than shoving everything into one table.`,bullets:[`Store shortlink, created_at, expiration, and blob pointer as lightweight metadata.`,`Store the text body in object storage or a document store that handles larger payloads cheaply.`,`Call out abuse controls because anonymous content products invite spam and malware links.`]},{heading:`2. Optimize the read path and expiration behavior`,body:`Reads first resolve metadata, verify the paste is still valid, and then fetch the body. Hot reads belong in cache, not on the metadata store.`,bullets:[`Cache popular shortlinks and optionally the rendered paste body for ultra-hot entries.`,`Mark expired records before deleting them so readers get consistent behavior during cleanup.`,`Use negative caching for missing or expired pastes to reduce repeated misses.`]},{heading:`3. Keep analytics and cleanup asynchronous`,body:`Page views, monthly reports, and deletion sweeps are important, but they should not add latency to user-facing reads.`,bullets:[`Emit read events or aggregate access logs in the background.`,`Run scheduled sweeps that delete or archive expired metadata and blob objects.`,`Watch cache hit rate, read latency, expired-read frequency, and cleanup lag.`]}],sampleAnswer:[{heading:`Requirements and scope`,bullets:[`I would support create-paste, read-paste, expiration, and basic analytics, while leaving user accounts and document editing out of the MVP.`,`The system is anonymous and read-heavy, so I will optimize for low-latency reads and safe deletion behavior.`,`I will assume text-only payloads and eventual analytics updates.`]},{heading:`High-level design`,bullets:[`A write API validates the request, creates a shortlink, stores metadata in an indexed database, and writes the paste body to object storage.`,`A read API resolves the shortlink, checks expiration, fetches the body, and returns the content, using cache-aside for hot reads.`,`An async analytics pipeline aggregates access events and a cleanup worker removes expired content.`]},{heading:`Trade-offs and growth`,bullets:[`Keeping metadata separate from the body makes the hot path lightweight but introduces a second storage hop on cache misses.`,`Real-time counters are possible, but batch analytics are cheaper and usually sufficient for this product.`,`If read traffic spikes, I would add CDN or regional caches in front of the most popular pastes.`]}],interviewCode:[{title:`Paste metadata service`,filename:`paste-service.ts`,language:`ts`,description:`Shows the metadata lookup, blob storage indirection, and expiration guard on the read path.`,code:`type PasteRecord = {
  code: string;
  blobPath: string;
  expiresAt: Date | null;
};

interface MetadataStore {
  get(code: string): Promise<PasteRecord | null>;
  save(record: PasteRecord): Promise<void>;
}

interface BlobStore {
  put(path: string, body: string): Promise<void>;
  get(path: string): Promise<string>;
}

class PasteService {
  constructor(
    private readonly metadata: MetadataStore,
    private readonly blobs: BlobStore
  ) {}

  async readPaste(code: string): Promise<string | null> {
    const record = await this.metadata.get(code);
    if (!record) return null;
    if (record.expiresAt && record.expiresAt.getTime() <= Date.now()) {
      return null;
    }
    return this.blobs.get(record.blobPath);
  }
}`}]},"case-studies/mint":{referenceSource:{label:`System Design Primer · Mint.com`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/mint/README.md`},solutionOverview:{summary:`A Mint-style design should lead with asynchronous account refresh, transaction categorization, monthly rollups, and security boundaries around sensitive credentials.`,requirements:[`Link financial accounts, extract transactions, and keep them refreshed for active users.`,`Categorize spending, compute monthly rollups, and support manual category overrides.`,`Generate budget recommendations and notifications without blocking ingest workflows.`],estimates:[`The workload is write-heavy because transactions arrive far more often than users open the dashboard.`,`Five billion transactions per month means raw event retention and derived monthly summaries should be separated early.`,`Notification freshness can lag slightly, which makes queues and workers a clean fit.`],keyDecisions:[`Queue account refresh jobs instead of extracting transactions from the user-facing request path.`,`Store raw transactions and recomputable categorization inputs separately from monthly aggregates.`,`Encrypt credentials and sensitive account data while keeping audit trails for failures and overrides.`]},detailedSolution:[{heading:`1. Make ingestion asynchronous`,body:`Linking an account should enqueue work, not wait for a full scrape of the upstream institution. That keeps the UX responsive and isolates unreliable third parties.`,bullets:[`Persist the linked account plus refresh metadata first.`,`Push extraction jobs onto a queue for initial and recurring syncs.`,`Retry with backoff because providers can be slow, rate-limited, or flaky.`]},{heading:`2. Separate raw facts from derived views`,body:`Raw transactions are the repairable source of truth, while categories and monthly spending are derived views that can be recomputed when logic changes.`,bullets:[`Keep a transaction ledger with timestamps, sellers, amounts, and account ownership.`,`Use a categorization service seeded from seller mappings and improved by manual overrides.`,`Materialize monthly spend and budget state into user-specific read models.`]},{heading:`3. Protect secrets and user trust`,body:`Financial aggregation is as much a security and reliability problem as a data-pipeline problem.`,bullets:[`Encrypt account credentials and access tokens at rest and in transit.`,`Audit refresh failures, stale accounts, and repeated override patterns.`,`Send budget alerts asynchronously so slow notification providers never block ingestion.`]}],sampleAnswer:[{heading:`Scope the system`,bullets:[`I would support account linking, transaction refresh, categorization, monthly rollups, and budget alerts.`,`I would leave rich analytics and advisor features out of the first version.`,`The risky parts are slow upstream institutions, sensitive credentials, and recomputing user-specific aggregates correctly.`]},{heading:`Architecture`,bullets:[`The write path stores account metadata and publishes refresh jobs to a queue.`,`Workers pull transactions, write the raw ledger, run categorization, and update monthly-spending tables or caches.`,`Notification workers send threshold alerts when spending approaches the saved budget.`]},{heading:`Trade-offs`,bullets:[`Async refresh improves UX and isolates provider failures, but users must accept that some dashboards are slightly stale.`,`Derived summaries make reads fast, but they require replay or backfill when category logic changes.`,`Security controls are non-negotiable, even if they add operational complexity.`]}],interviewCode:[{title:`Account refresh orchestration`,filename:`account-refresh.ts`,language:`ts`,description:`Illustrates the enqueue-first write path for linking and refreshing financial accounts.`,code:`type AccountLink = {
  accountId: string;
  userId: string;
  provider: string;
};

interface RefreshQueue {
  enqueue(job: { accountId: string; reason: 'initial' | 'manual' | 'scheduled' }): Promise<void>;
}

class AccountRefreshService {
  constructor(private readonly queue: RefreshQueue) {}

  async linkAccount(link: AccountLink): Promise<void> {
    await this.queue.enqueue({ accountId: link.accountId, reason: 'initial' });
  }

  async refreshAccount(accountId: string): Promise<void> {
    await this.queue.enqueue({ accountId, reason: 'manual' });
  }
}`}]},"case-studies/twitter":{referenceSource:{label:`System Design Primer · Twitter timeline and search`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/twitter/README.md`},solutionOverview:{summary:`A strong Twitter answer separates tweet persistence, fan-out, timeline caching, and search indexing so the write path stays fast while downstream workloads scale independently.`,requirements:[`Support tweet creation, home timeline reads, user timeline reads, and keyword search.`,`Keep the product highly available despite massive read traffic and skewed follow graphs.`,`Handle notifications, media storage, and search indexing without blocking tweet writes.`],estimates:[`Read traffic dominates, but the fan-out multiplier makes tweet writes operationally expensive too.`,`Celebrity accounts break naive fan-out-on-write because a single post can target millions of followers.`,`Search and media storage deserve independent scaling because their growth curves differ from timelines.`],keyDecisions:[`Persist tweets durably first, then fan out and index them asynchronously.`,`Use push, pull, or hybrid fan-out based on follower count and cache behavior.`,`Serve active home timelines from memory while rebuilding cold timelines lazily.`]},detailedSolution:[{heading:`1. Keep tweet creation lightweight`,body:`The first API should store the tweet and hand off expensive work to downstream services. This keeps posting fast and isolates failures in notifications or search.`,bullets:[`Persist tweet metadata and media references in the authoritative store.`,`Publish fan-out, indexing, and notification jobs asynchronously.`,`Explain why the write path must not wait for every follower update.`]},{heading:`2. Differentiate timeline strategies`,body:`Home and user timelines are different workloads. User timelines can read more directly, but home timelines need caching or precomputation for active users.`,bullets:[`Keep recent home-timeline entries in a memory cache for active users.`,`Use multiget lookups for tweet details and user metadata at serve time.`,`Rebuild cold timelines on demand instead of storing everything forever in cache.`]},{heading:`3. Handle celebrity skew and search separately`,body:`Extremely popular accounts and keyword search both create scaling pressure that should not distort the core timeline design.`,bullets:[`Switch celebrity accounts to pull or hybrid fan-out strategies.`,`Index tweets asynchronously into a search cluster optimized for reads.`,`Track fan-out lag, search freshness, and cache hit rate as first-class metrics.`]}],sampleAnswer:[{heading:`Requirements`,bullets:[`I will cover posting tweets, user timelines, home timelines, and keyword search.`,`The main constraints are high read volume, huge follower skew, and the need to keep tweet creation fast.`,`I will leave advanced visibility rules and analytics out of the MVP unless asked.`]},{heading:`Design`,bullets:[`A write API stores the tweet, saves media externally, and publishes fan-out plus indexing events.`,`A timeline service serves cached home feeds for active users and falls back to durable stores on misses.`,`A search service indexes tweets asynchronously and serves keyword queries from a dedicated search cluster.`]},{heading:`Scaling trade-offs`,bullets:[`Push fan-out gives fast reads for normal users, but celebrity accounts may need pull or hybrid reads to avoid explosion on writes.`,`Caching active timelines makes reads fast, but cold users need feed reconstruction logic.`,`Separating search and media keeps the core tweet system simpler and easier to scale independently.`]}],interviewCode:[{title:`Tweet publication flow`,filename:`tweet-service.ts`,language:`ts`,description:`Shows durable tweet persistence plus asynchronous fan-out and indexing hooks.`,code:`type Tweet = {
  id: string;
  authorId: string;
  body: string;
  createdAt: Date;
};

interface TweetStore {
  save(tweet: Tweet): Promise<void>;
}

interface FanoutPublisher {
  publish(tweet: Tweet): Promise<void>;
}

class TweetService {
  constructor(
    private readonly store: TweetStore,
    private readonly fanout: FanoutPublisher
  ) {}

  async publishTweet(authorId: string, body: string): Promise<Tweet> {
    const tweet: Tweet = { id: crypto.randomUUID(), authorId, body, createdAt: new Date() };
    await this.store.save(tweet);
    await this.fanout.publish(tweet);
    return tweet;
  }
}`}]},"case-studies/sales-rank":{referenceSource:{label:`System Design Primer · Amazon sales rank`,url:`https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/sales_rank/README.md`},solutionOverview:{summary:`Sales rank is an aggregation problem: ingest transactions into durable logs, compute category windows offline or nearline, and serve a compact ranking table from cache.`,requirements:[`Calculate the top-selling products by category for the last week.`,`Serve ranking reads at very high volume with clear freshness guarantees.`,`Keep the aggregation pipeline isolated from the transactional sales path.`],estimates:[`One billion transactions per month makes raw log storage and aggregation cost more important than the serving table size.`,`Read traffic can be two orders of magnitude higher than writes, so the serving path should be tiny and cacheable.`,`Hourly updates are usually enough, which makes batch or nearline aggregation realistic.`],keyDecisions:[`Write raw transaction events to durable logs or object storage before ranking them.`,`Compute rolling windows in a batch or stream job and materialize results into a serving table.`,`Cache the hottest category pages and define freshness expectations explicitly.`]},detailedSolution:[{heading:`1. Start from append-only events`,body:`Sales-rank answers get stronger when they treat the aggregation input as immutable events rather than mutable counters.`,bullets:[`Capture category, product, quantity, and timestamp in the sales event stream.`,`Retain raw logs so jobs can be rerun after bugs or late data arrive.`,`Keep the checkout or sales system decoupled from ranking compute.`]},{heading:`2. Materialize ranked outputs`,body:`The heavy work belongs in MapReduce-style or streaming aggregations, while the read API should serve a small, precomputed result set.`,bullets:[`Aggregate quantity sold per product and category over the rolling window.`,`Sort or top-k rank inside the pipeline, then write results to a compact table.`,`Backfill or rerun windows when logs arrive late or corrections appear.`]},{heading:`3. Make freshness a product choice`,body:`Hourly or near-real-time freshness is a trade-off between compute cost and user value, so state the choice explicitly.`,bullets:[`Cache the hottest category results for ultra-fast reads.`,`Publish the update cadence so stakeholders know how fresh the rank is.`,`Watch job duration, ranking lag, cache hit rate, and error recovery time.`]}],sampleAnswer:[{heading:`Scope`,bullets:[`I am designing only the ranking feature, not the entire commerce platform.`,`The system needs to compute weekly top sellers by category and serve those lists quickly.`,`I will assume updates can happen hourly unless stricter freshness is required.`]},{heading:`Architecture`,bullets:[`Sales events flow into durable logs or object storage from the transactional system.`,`A ranking pipeline aggregates and sorts weekly totals by category, then writes the top results into a serving table.`,`The read API returns cached or precomputed lists so the user-facing path never scans raw transactions.`]},{heading:`Trade-offs`,bullets:[`Batch jobs are simpler and cheaper, while stream jobs improve freshness at the cost of more operational complexity.`,`The serving store is fast because it is tiny and precomputed, but it relies on the aggregation job being healthy.`,`Late-arriving transactions require reprocessing or correction logic, so I would keep raw events for replay.`]}],interviewCode:[{title:`Weekly sales aggregator`,filename:`sales-rank-aggregator.ts`,language:`ts`,description:`A compact windowed aggregation example for building category rankings from raw events.`,code:`type SaleEvent = {
  categoryId: string;
  productId: string;
  quantity: number;
};

class SalesRankAggregator {
  aggregate(events: SaleEvent[]): Map<string, Array<{ productId: string; quantity: number }>> {
    const totals = new Map<string, Map<string, number>>();

    for (const event of events) {
      const categoryTotals = totals.get(event.categoryId) ?? new Map<string, number>();
      categoryTotals.set(event.productId, (categoryTotals.get(event.productId) ?? 0) + event.quantity);
      totals.set(event.categoryId, categoryTotals);
    }

    return new Map(
      Array.from(totals.entries()).map(([categoryId, productTotals]) => [
        categoryId,
        Array.from(productTotals.entries())
          .map(([productId, quantity]) => ({ productId, quantity }))
          .sort((left, right) => right.quantity - left.quantity)
      ])
    );
  }
}`}]}};export{e as lessonEnhancements};