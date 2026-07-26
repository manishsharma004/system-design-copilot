const paragraphs = (...items) => items.join('\n\n');

const codeExample = (title, code) => ({ title, code: code.trim() });

const codingExercise = (id, title, description, starterCode, solution, hints, expectedOutput, difficulty = 'intermediate') => ({
  id,
  title,
  difficulty,
  type: 'coding',
  description,
  starterCode: starterCode.trim(),
  solution: solution.trim(),
  hints,
  expectedOutput
});

const designExercise = (id, title, description, promptQuestions, difficulty = 'intermediate') => ({
  id,
  title,
  difficulty,
  type: 'design',
  description,
  promptQuestions
});

const section = (heading, firstParagraph, secondParagraph, bullets, exampleTitle, exampleCode) => ({
  heading,
  body: paragraphs(firstParagraph, secondParagraph),
  bullets,
  codeExample: codeExample(exampleTitle, exampleCode)
});

const lruLesson = {
  slug: 'lru-cache-design-lab',
  title: 'LRU cache design lab',
  summary:
    'Design the cache prompt interviewers still use to check object ownership, O(1) invariants, and the judgment to keep TTL, loading, and distributed coordination out of version one.',
  duration: '65-85 min',
  whyItMatters:
    'LRU cache remains a favorite 2025-2026 prompt because it is small enough to code live yet rich enough to expose weak ownership and vague complexity claims. Interviewers want a clear invariant story: get and put are O(1), recency is updated on every read and overwrite, and eviction has one authoritative owner. Candidates who jump straight into Python syntax without naming the hash map plus recency structure often paint themselves into a corner when asked about duplicates, updates, or capacity zero.',
  sections: [
    section(
      'Start from the invariant, not from helper classes',
      'A cache prompt sounds trivial until you force yourself to say what must always be true. An LRU cache of capacity N stores at most N live entries, returns the value for a present key in O(1), inserts or overwrites in O(1), and evicts exactly the least recently used key when a new item would exceed capacity. The moment you say that aloud, the design goal becomes obvious: one structure must answer key lookup fast, and one structure must maintain recency order with constant-time removal and insertion. Everything else is a follow-up.',
      'That framing matters in interviews because many candidates start by listing features such as TTL, write-through, or async loading before the core recency invariant is stable. In 2025 and 2026 the stronger answer is still to keep version one narrow: capacity, get, put, overwrite, and eviction. Then, after the basic implementation is coherent, explain where TTL or refresh hooks would attach. Reviewers trust a design that protects one crisp invariant more than a large cache facade that mentions production buzzwords but cannot explain who owns eviction.',
      [
        'Version one owns only capacity, recency, lookup, overwrite, and eviction.',
        'A cache hit must also update recency, not only return a value.',
        'Overwrite should replace the stored value and move the key to most recent.',
        'Least recently used means oldest by successful access or insertion, depending on your policy statement.'
      ],
      'Name the public behaviors before you name classes',
      `
class CacheResult:
    def __init__(self, found, value):
        self.found = found
        self.value = value


class LruCache:
    def get(self, key):
        raise NotImplementedError

    def put(self, key, value):
        raise NotImplementedError
`
    ),
    section(
      'Use a hash map plus a recency list to earn O(1)',
      'The canonical implementation is a hash map from key to node plus a doubly linked list ordered from most recent to least recent. The map gives O(1) access to the node for a key. The linked list gives O(1) removal of an existing node and O(1) insertion at the head when a key becomes most recent. Eviction is then just removing the tail node and deleting its key from the map. If you use a singly linked list, tail eviction or middle removal stops being O(1) because you need a predecessor walk.',
      'In Python, OrderedDict is also an acceptable interview choice if you explain why it still satisfies the same invariant. That is often a better live-coding trade-off when the interviewer values reasoning over node bookkeeping. The important part is honesty: if you use OrderedDict, say you are relying on the library to provide the same key-plus-order behavior. If the interviewer wants the manual structure next, you can describe the Node object and the list operations without pretending both approaches are different algorithms.',
      [
        'Hash map answers where the node lives; the list answers which node is coldest.',
        'Doubly linked lists support constant-time detach because each node knows both neighbors.',
        'OrderedDict is a reasonable Python simplification if you still explain recency ownership.',
        'Complexity claims should mention both average-case hash lookup and constant-time list edits.'
      ],
      'The map and list serve different invariants',
      `
class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class DoublyLinkedList:
    def __init__(self):
        self.head = Node(None, None)
        self.tail = Node(None, None)
        self.head.next = self.tail
        self.tail.prev = self.head
`
    ),
    section(
      'Keep recency transitions explicit and testable',
      'A good cache answer separates tiny list primitives from cache policy. The list knows how to add a node after the head, remove a node from anywhere, move a node to the front, and pop the least recent node from the tail side. The cache owns the policy: on get, move the hit to the front; on put for an existing key, update the value and move the node to the front; on put for a new key that overflows capacity, evict the least recent node. Saying those transitions aloud prevents accidental bugs such as duplicate nodes, stale keys left in the map, or evicting the wrong end of the list.',
      'This is also where strong candidates defend O(1) carefully. Get is O(1) because it does one map lookup and at most one constant-time node move. Put is O(1) because it either updates an existing node or inserts one new node, and eviction removes only the tail-adjacent node. You do not need amortized speeches or hidden scans. If the interviewer asks for proof, walk one get hit, one overwrite, and one overflow insert through the exact data-structure edits and point out that no step iterates over the whole cache.',
      [
        'One cache method should own map edits and list edits together so they cannot diverge.',
        'Overwrite is not a no-op; it refreshes recency and replaces the stored value.',
        'Recency moves happen on successful reads and writes, not on misses.',
        'A short walk-through of three operations is often the best complexity defense.'
      ],
      'OrderedDict version keeps the same policy surface',
      `
from collections import OrderedDict


class LruCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]
`
    ),
    section(
      'Thread safety is a follow-up on top of a correct local design',
      'Interviewers now often push from the local cache into concurrency: what if two threads call get and put at the same time, or two writers both try to evict? The solid answer is modest and direct. The local cache is not thread-safe by default because map mutation and list mutation must remain consistent. Wrap mutating operations with one lock, and remember that get also mutates recency on a hit. For version one, a coarse lock around get and put is fine because the goal is correctness of the invariant, not maximum throughput from minute one.',
      'TTL, write-through, write-back, refresh-ahead, and async loading should be positioned as deliberate follow-ups instead of v1 clutter. TTL changes the read contract because a key can exist structurally but be expired logically. Write-through adds backing-store behavior and failure semantics. Async load introduces promise ownership, in-flight deduplication, and cache stampede concerns. A polished answer says the core cache stays responsible for recency and eviction, while a loader decorator or repository adapter would own fetching and TTL metadata once the first version is stable.',
      [
        'A cache hit mutates order, so get may need the same lock as put.',
        'Correctness under one coarse lock is a stronger first answer than premature lock striping.',
        'TTL and loading are orthogonal extensions; do not bury the recency invariant under them.',
        'Explain where metadata such as expires_at would live before you try to code it.'
      ],
      'A coarse lock is acceptable for the local interview version',
      `
import threading


class ThreadSafeLruCache:
    def __init__(self, inner_cache):
        self.inner_cache = inner_cache
        self.lock = threading.Lock()

    def get(self, key):
        with self.lock:
            return self.inner_cache.get(key)

    def put(self, key, value):
        with self.lock:
            self.inner_cache.put(key, value)
`
    ),
    section(
      'Production notes: stampedes, null caching, and metrics',
      'Production caches are judged less by their class diagram and more by the operational questions around them. A cache miss on a hot key can trigger a stampede when many callers race to fetch the same backend data. Null caching may be useful when absent data is itself expensive to recompute, but then you must distinguish a cached null from a missing key cleanly. Metrics should include hit ratio, miss ratio, evictions, item count, and sometimes load latency or stampede suppression counts. These are the numbers that tell you whether the cache is helping or just hiding backend pain.',
      'The final interview move is knowing when a local LLD cache stops being enough. If many app instances need shared freshness or coordinated invalidation, the local cache becomes an optimization in front of a distributed cache rather than the source of truth. That handoff is not a failure of the LLD; it is good scope control. Your local cache can still own process-local recency and object reuse, while Redis or another distributed tier owns shared eviction, cross-instance visibility, or invalidation streams. The important part is naming the bridge: local cache for hot in-process reads, distributed coordination when consistency or global limits matter across instances.',
      [
        'Stampede prevention usually needs request coalescing or single-flight behavior around misses.',
        'Null caching is useful only if the API distinguishes cached absence from true miss.',
        'Hit ratio without latency or eviction context can be misleading.',
        'Cross-instance invalidation is the point where local LLD hands off to distributed design.'
      ],
      'Metrics and load ownership matter after correctness',
      `
class CacheMetrics:
    def __init__(self):
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    def hit_ratio(self):
        total = self.hits + self.misses
        return 0.0 if total == 0 else self.hits / total
`
    )
  ],
  exercises: [
    codingExercise(
      'implement-lru-cache-core',
      'Implement an O(1) LRU cache core',
      'Finish get and put so the cache updates recency on hits, overwrites existing keys safely, and evicts the least recently used key when capacity is exceeded.',
      `
class Node:
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LruCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.nodes = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _add_to_front(self, node):
        first = self.head.next
        self.head.next = node
        node.prev = self.head
        node.next = first
        first.prev = node

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_front(self, node):
        self._remove(node)
        self._add_to_front(node)

    def _evict_lru(self):
        # TODO: remove the least recently used node from the list and dict.
        raise NotImplementedError

    def get(self, key):
        # TODO: return -1 when missing, otherwise move the node to the front and return its value.
        raise NotImplementedError

    def put(self, key, value):
        # TODO: update existing keys in place, otherwise insert and evict if over capacity.
        raise NotImplementedError


cache = LruCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))
cache.put(3, 3)
print(cache.get(2))
cache.put(4, 4)
print(cache.get(1))
print(cache.get(3))
print(cache.get(4))
`,
      `
class Node:
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LruCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.nodes = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _add_to_front(self, node):
        first = self.head.next
        self.head.next = node
        node.prev = self.head
        node.next = first
        first.prev = node

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _move_to_front(self, node):
        self._remove(node)
        self._add_to_front(node)

    def _evict_lru(self):
        lru = self.tail.prev
        if lru is self.head:
            return
        self._remove(lru)
        del self.nodes[lru.key]

    def get(self, key):
        node = self.nodes.get(key)
        if node is None:
            return -1
        self._move_to_front(node)
        return node.value

    def put(self, key, value):
        if self.capacity == 0:
            return
        node = self.nodes.get(key)
        if node is not None:
            node.value = value
            self._move_to_front(node)
            return
        node = Node(key, value)
        self.nodes[key] = node
        self._add_to_front(node)
        if len(self.nodes) > self.capacity:
            self._evict_lru()


cache = LruCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))
cache.put(3, 3)
print(cache.get(2))
cache.put(4, 4)
print(cache.get(1))
print(cache.get(3))
print(cache.get(4))
`,
      [
        'The least recently used node is the node just before the tail sentinel.',
        'A cache hit must move the node to the front before returning.',
        'Insert into the dict and list together so they never disagree.'
      ],
      '1\\n-1\\n-1\\n3\\n4',
      'intermediate'
    ),
    designExercise(
      'lru-cache-follow-up-design',
      'Extend the cache for concurrency and production follow-ups',
      'Describe how you would harden the local LRU cache when the interviewer adds thread safety, TTL, async loading, and multiple application instances.',
      [
        'Which operations need a lock, and why does a cache hit count as a mutation?',
        'Where would TTL metadata live, and how would you avoid mixing expiry checks with raw recency mechanics?',
        'How would you prevent a cache stampede when many requests miss on the same hot key?',
        'When does the local cache stop being the right owner and need to hand off to a distributed cache or invalidation service?'
      ]
    )
  ],
  checklist: [
    'Can explain O(1) get and put using a hash map plus doubly linked list or OrderedDict.',
    'Can say exactly when recency moves and which end of the list gets evicted.',
    'Can answer thread-safety follow-ups with a simple correct lock-based design first.',
    'Can separate v1 cache behavior from TTL, loading, and distributed invalidation follow-ups.'
  ],
  pitfalls: [
    'Claiming O(1) while using a structure that needs scans to remove or evict.',
    'Forgetting that get mutates recency and therefore affects concurrency and testing.',
    'Stuffing TTL, write-through, and async loading into version one before the basic invariant is stable.'
  ],
  interviewPrompts: [
    'Why does an LRU cache usually need both a hash map and a doubly linked list?',
    'How would you make a local LRU cache thread-safe without over-engineering it?',
    'When would you stop extending the local cache and introduce a distributed cache instead?'
  ],
  diagram: null,
  related: ['concurrency-followups-and-scale-bridges', 'repositories-caching-and-persistence-seams', 'dependency-injection-and-testability']
};

const rateLimiterLesson = {
  slug: 'rate-limiter-design-lab',
  title: 'Rate limiter design lab',
  summary:
    'Design the other hot-path interview prompt that still appears constantly: local rate limiters that handle burst versus sustained traffic, expose clock seams for tests, and know when to hand off to Redis or another distributed coordinator.',
  duration: '65-85 min',
  whyItMatters:
    'Rate limiting is a strong 2025-2026 machine-coding prompt because it mixes clean local object design with operational judgment. Interviewers are rarely satisfied with a single counter anymore. They want you to distinguish burst tolerance from sustained throughput, choose a key such as user, IP, or API key, define what a denial returns over HTTP, and explain why a single-process limiter eventually hands off to distributed coordination. A polished local answer demonstrates both algorithm choice and API discipline.',
  sections: [
    section(
      'Frame the contract before you pick an algorithm',
      'A rate limiter answer begins by naming the contract precisely. What key are you limiting: user id, IP address, auth token, tenant, or endpoint plus token? What does allow mean: return a boolean, a decision object, or an HTTP response with 429 Too Many Requests and maybe Retry-After? What traffic shape matters: short bursts, smooth sustained throughput, or both? These questions are not fluff; they determine whether token bucket, sliding window, or a different strategy is appropriate.',
      'That first-minute framing is part of the current interview bar. A limiter that ignores keying or HTTP semantics sounds toy-like, because real product traffic is rarely global and anonymous. By saying you will implement a local per-key limiter with an injected clock, clear allow or deny output, and one replaceable algorithm strategy, you show version-one judgment immediately. Then you can discuss how the same strategy interface could later be backed by Redis for shared limits or extended with route-specific policies.',
      [
        'Choose the rate-limit key explicitly: user, IP, API key, tenant, or a composed key.',
        'Return a decision that can carry allow or deny plus retry timing when useful.',
        'Different prompts optimize for burst tolerance versus steady smoothing.',
        'Local first is fine if you say where distributed coordination would take over.'
      ],
      'A decision object keeps HTTP behavior outside the core algorithm',
      `
class RateLimitDecision:
    def __init__(self, allowed, retry_after_seconds=0):
        self.allowed = allowed
        self.retry_after_seconds = retry_after_seconds


class RateLimiter:
    def allow(self, key):
        raise NotImplementedError
`
    ),
    section(
      'Token bucket is great when bursts are acceptable',
      'Token bucket is the standard answer when you want to allow brief bursts while enforcing an average refill rate over time. Each key owns a bucket with current tokens and a last-refill timestamp. On each request you compute how many tokens to refill based on elapsed time, cap the bucket at capacity, and spend one token if available. This gives a clean story for burst versus sustained rate: capacity defines burst size, and refill rate defines long-run throughput. Interviewers like it because the parameters are intuitive and the object model stays compact.',
      'The main modeling discipline is keeping time math and state ownership explicit. Buckets should be keyed independently so one noisy user or IP does not corrupt another. Refill should use the injected clock instead of time.time directly so tests can jump across seconds deterministically. A careful answer also says that local thread safety matters because two concurrent requests for the same key must not both observe the same token balance and oversubscribe it.',
      [
        'Capacity controls allowed burst; refill rate controls sustained throughput.',
        'Each key gets isolated state so traffic does not bleed across identities.',
        'Refill should use elapsed time from an injected clock or monotonic clock seam.',
        'Thread safety matters because refill and token spend are one critical section.'
      ],
      'Token bucket exposes burst size and average rate separately',
      `
class TokenBucketState:
    def __init__(self, tokens, last_refill):
        self.tokens = tokens
        self.last_refill = last_refill


def refill(state, now, capacity, refill_per_second):
    elapsed = max(0.0, now - state.last_refill)
    state.tokens = min(capacity, state.tokens + elapsed * refill_per_second)
    state.last_refill = now
`
    ),
    section(
      'Sliding window smooths traffic more strictly',
      'Sliding window is the better choice when you care about sustained request shape more than momentary bursts. A common interview version stores recent timestamps per key, removes entries older than the window, and allows the request only if the remaining count is below the limit. That produces a stricter, easier-to-explain bound than a fixed window counter, which can allow boundary spikes. The trade-off is that timestamp storage and cleanup are more expensive than token arithmetic, so you should say what data you keep and why.',
      'A useful modern answer is to put token bucket and sliding window behind one strategy interface. That makes the lesson more than algorithm memorization: you are demonstrating that the higher-level limiter service should not hard-code a single policy when burst-friendly and smooth-throughput policies are legitimate product choices. If the interviewer asks when to choose which, you can answer concretely: token bucket for client APIs that should tolerate short bursts, sliding window for abuse-sensitive operations where smoother pacing matters more.',
      [
        'Sliding window gives tighter smoothing than a fixed window counter.',
        'A deque of timestamps per key is easy to explain in a local machine-coding round.',
        'Strategy keeps algorithm choice separate from key resolution and response semantics.',
        'You can compare token bucket and sliding window in terms of burst tolerance and memory cost.'
      ],
      'A deque-based sliding window is a readable local implementation',
      `
from collections import deque


def allow_in_window(events, now, window_seconds, limit):
    while events and now - events[0] >= window_seconds:
        events.popleft()
    if len(events) >= limit:
        return False
    events.append(now)
    return True
`
    ),
    section(
      'Inject Clock, isolate keys, and lock the per-key mutation path',
      'Clock injection is more than a testing trick. It forces you to keep time as a dependency rather than ambient state, which makes boundary cases explainable: exactly at the window edge, after a long idle period, or after a clock skew bug. In a local design, a Clock object that exposes now can be swapped for a fixed or fake clock in tests, while production can use a monotonic source. The limiter service can also depend on a KeyResolver so the request-to-key mapping stays outside the algorithm itself and can vary by endpoint, auth type, or tenant.',
      'For thread safety, start with one lock around the state mutation for a given limiter instance or one lock per key shard if the interviewer pushes on contention. The important correctness point is that read, refill or trim, decision, and write-back belong in one critical section. This is also the right place to discuss fail-open versus fail-closed. If the local limiter storage is unavailable or corrupted, do you protect the backend by denying traffic or protect availability by allowing traffic? There is no universal answer; the strong interview move is to tie the choice to operation criticality and abuse risk.',
      [
        'Injected clock and key resolution keep algorithms deterministic and reusable.',
        'Refill or trim plus allow decision must be atomic for one key.',
        'Per-user, per-IP, and per-API-key are product policy choices, not algorithm details.',
        'Fail-open versus fail-closed should be justified by risk, not treated as a default.'
      ],
      'The service owns key lookup and synchronization, the strategy owns math',
      `
import threading


class LocalRateLimiter:
    def __init__(self, strategy, clock):
        self.strategy = strategy
        self.clock = clock
        self.lock = threading.Lock()

    def allow(self, key):
        with self.lock:
            return self.strategy.allow(key, self.clock.now())
`
    ),
    section(
      'HTTP 429, idempotency, and the bridge to distributed limits',
      'At the API edge, a denied request usually becomes HTTP 429 Too Many Requests, often with a Retry-After hint when you can estimate recovery. That is not just protocol trivia; it proves you understand how the limiter result reaches callers. Idempotent operations add another nuance. If clients retry the same request id, you may need to decide whether the retry spends more capacity or whether an idempotency layer recognizes a duplicate and bypasses the limiter path. Similarly, fail-open and fail-closed choices may differ for login abuse protection versus a read-heavy analytics endpoint.',
      'Finally, say clearly when the local design hands off to distributed coordination. A single-process limiter is enough for one worker, an interview sandbox, or a per-instance hot-path guardrail. It is not enough when multiple instances must enforce a shared quota. That is the bridge to Redis sorted sets, Lua scripts, or provider-native distributed counters. The local design still matters because it gives you the strategy surface, decision object, clock seam, and keying policy. Redis then becomes the state store and coordination layer, not an excuse to skip a coherent local object model.',
      [
        '429 Too Many Requests is the standard denial response; Retry-After is useful when you can compute it honestly.',
        'Idempotent retries may need their own identity layer so duplicates do not double-spend tokens.',
        'Local limiters protect one process; distributed limits protect a shared quota across processes.',
        'Redis or another coordinator should replace only the shared state path, not the whole design vocabulary.'
      ],
      'Distributed backing stores reuse the same decision contract',
      `
def to_http_response(decision):
    if decision.allowed:
        return 200, {}
    headers = {}
    if decision.retry_after_seconds > 0:
        headers["Retry-After"] = str(decision.retry_after_seconds)
    return 429, headers
`
    )
  ],
  exercises: [
    codingExercise(
      'implement-token-bucket-limiter',
      'Implement a local token bucket limiter',
      'Complete the limiter so each key gets its own bucket, elapsed time refills tokens through an injected clock, and requests are allowed only when at least one token is available.',
      `
class FixedClock:
    def __init__(self, start):
        self.current = start

    def now(self):
        return self.current

    def advance(self, seconds):
        self.current += seconds


class TokenBucketLimiter:
    def __init__(self, capacity, refill_per_second, clock):
        self.capacity = capacity
        self.refill_per_second = refill_per_second
        self.clock = clock
        self.buckets = {}

    def allow(self, key):
        now = self.clock.now()
        bucket = self.buckets.get(key)
        # TODO: initialize per-key state, refill by elapsed time, spend one token if available,
        # and return True or False.
        raise NotImplementedError


clock = FixedClock(0.0)
limiter = TokenBucketLimiter(capacity=2, refill_per_second=1.0, clock=clock)
print(limiter.allow("user-1"))
print(limiter.allow("user-1"))
print(limiter.allow("user-1"))
clock.advance(1.0)
print(limiter.allow("user-1"))
print(limiter.allow("user-2"))
`,
      `
class FixedClock:
    def __init__(self, start):
        self.current = start

    def now(self):
        return self.current

    def advance(self, seconds):
        self.current += seconds


class TokenBucketLimiter:
    def __init__(self, capacity, refill_per_second, clock):
        self.capacity = capacity
        self.refill_per_second = refill_per_second
        self.clock = clock
        self.buckets = {}

    def allow(self, key):
        now = self.clock.now()
        tokens, last_refill = self.buckets.get(key, (float(self.capacity), now))
        elapsed = max(0.0, now - last_refill)
        tokens = min(float(self.capacity), tokens + elapsed * self.refill_per_second)
        if tokens < 1.0:
            self.buckets[key] = (tokens, now)
            return False
        tokens -= 1.0
        self.buckets[key] = (tokens, now)
        return True


clock = FixedClock(0.0)
limiter = TokenBucketLimiter(capacity=2, refill_per_second=1.0, clock=clock)
print(limiter.allow("user-1"))
print(limiter.allow("user-1"))
print(limiter.allow("user-1"))
clock.advance(1.0)
print(limiter.allow("user-1"))
print(limiter.allow("user-2"))
`,
      [
        'Store limiter state independently per key.',
        'Refill before you decide whether the request can spend a token.',
        'A fixed clock makes the third and fourth calls deterministic in tests.'
      ],
      'True\\nTrue\\nFalse\\nTrue\\nTrue',
      'intermediate'
    ),
    designExercise(
      'rate-limiter-follow-up-design',
      'Review trade-offs for local versus distributed rate limiting',
      'Explain how you would compare token bucket and sliding window, choose keys, return 429 responses, and extend the local limiter into a distributed design when many application instances share the same quota.',
      [
        'When is token bucket better than sliding window, and when is the stricter smoothing worth the extra state?',
        'Would you key by user, IP, API key, tenant, or endpoint plus identity for this product, and why?',
        'How would you handle fail-open versus fail-closed behavior for abuse-sensitive endpoints compared with normal read traffic?',
        'What state and atomicity guarantees would you need from Redis or another coordinator to enforce a global quota correctly across instances?'
      ]
    )
  ],
  checklist: [
    'Can compare token bucket and sliding window in terms of burst tolerance, smoothing, and state cost.',
    'Can explain why clock injection and key selection belong in the design from the start.',
    'Can return a clear allow or deny decision that maps naturally to HTTP 429 behavior.',
    'Can explain when a thread-safe local limiter is enough and when Redis or distributed coordination is required.'
  ],
  pitfalls: [
    'Using one global counter without naming the rate-limit key or the traffic shape being protected.',
    'Reading current time directly inside the algorithm and making edge cases impossible to test deterministically.',
    'Pretending a local in-memory limiter enforces a shared quota across many instances without any coordinator.'
  ],
  interviewPrompts: [
    'How do token bucket and sliding window differ for bursty traffic?',
    'Why should a rate limiter inject a clock and keep per-key state?',
    'When would you switch from a local limiter to Redis or another distributed limit store?'
  ],
  diagram: null,
  related: ['concurrency-followups-and-scale-bridges', 'dependency-injection-and-testability', 'repositories-caching-and-persistence-seams']
};

export const rawLldHotPathModules = [
  {
    slug: 'lld-hot-path-labs',
    title: 'Cache and rate-limit design labs',
    summary:
      'Practice the high-frequency machine-coding prompts companies still ask in 2025-2026: LRU caches and rate limiters with clear invariants, concurrency, and extension seams.',
    objectives: [
      'Design an LRU cache with O(1) get/put using hash map + doubly linked list (or OrderedDict) and clear eviction policy ownership',
      'Design rate limiters (token bucket / sliding window) with keying, clock seams, and thread-safe counters',
      'Explain concurrency, multi-instance limits, and when local LLD must hand off to distributed coordination'
    ],
    lessons: [lruLesson, rateLimiterLesson]
  }
];
