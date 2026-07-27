/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldHotPathLabsChapters = {
  'lld-hot-path-labs/lru-cache-design-lab': {
    title: 'LRU cache design lab',
    readingTime: '55-70 min',
    premise:
      'LRU cache is the hot-path classic that blends data structures with object design. Interviewers expect O(1) get/put, a clear eviction story, and a concurrency plan that does not destroy the complexity bounds you claimed.',
    parts: [
      {
        id: 'lru-contract',
        heading: 'Lock the cache contract before coding',
        paragraphs: [
          'Confirm capacity semantics: maximum entries, what happens at zero capacity, whether updates refresh recency, and whether get on missing keys returns null/optional or throws. Decide if values may be null.',
          'Operations: get(key), put(key, value), optional delete, optional stats (hits/misses). Eviction policy: least recently used on capacity overflow after put.',
          'Domain sentence: "LruCache stores entries in a HashMap from key to node and a doubly linked list ordered by recency; get and put promote nodes to most-recent; overflow evicts the least-recent node."'
        ],
        keyTerms: [
          {
            term: 'Recency order',
            definition:
              'The order of keys by last access time, maintained explicitly for eviction decisions.'
          },
          {
            term: 'Capacity',
            definition:
              'The maximum number of entries retained before puts must evict.'
          },
          {
            term: 'Promotion',
            definition:
              'Moving an accessed entry to the most-recently-used position.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Ask whether put on an existing key updates value and recency. The usual answer is yes to both.'
        },
        checkYourself: [
          {
            prompt: 'What must be O(1) in the standard LRU interview?',
            reveal:
              'Both get and put, including promotion and eviction bookkeeping, amortized or worst-case depending on hash map assumptions.'
          }
        ]
      },
      {
        id: 'lru-structures',
        heading: 'Structures: map plus doubly linked list',
        paragraphs: [
          'Hash map provides O(1) key lookup to a list node. Doubly linked list provides O(1) remove and move-to-front when you hold the node pointer. Dummy head/tail sentinels simplify edge cases.',
          'Alternatives: LinkedHashMap-style structures in some languages, or ordered dicts. In interviews, implementing explicit Node with prev/next shows you understand the mechanics.',
          'Class diagram in prose: LruCache owns capacity, map, head, tail; Node holds key, value, prev, next. Optional EvictionListener port fires on eviction for designs that wrap loaders.'
        ],
        keyTerms: [
          {
            term: 'Sentinel nodes',
            definition:
              'Dummy head and tail nodes that remove null checks at list ends.'
          },
          {
            term: 'Node handle',
            definition:
              'The map value pointing at the list node so unlinking does not require scanning.'
          },
          {
            term: 'Eviction listener',
            definition:
              'An optional callback invoked when an entry is removed due to capacity pressure.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Say: "Map for lookup, DLL for order—each operation splices pointers in O(1)."'
        },
        checkYourself: [
          {
            prompt: 'Why is a singly linked list a poor fit for LRU?',
            reveal:
              'Removing an arbitrary node in O(1) needs the previous pointer; singly linked lists require scans to find predecessors.'
          }
        ]
      },
      {
        id: 'lru-worked-implementation',
        heading: 'Implementation spine and iteration',
        paragraphs: [
          'Iterate: Node + list helpers (add_to_front, remove), then get, then put with eviction, then concurrency. Test after each step with a tiny capacity of 2.',
          'Careful pointer updates matter. Draw before/after for remove and insert when you talk. Off-by-one bugs in links are the usual live-coding failure.',
          'Keep methods small: _remove(node), _add_front(node), _move_front(node). Public get/put read like prose.'
        ],
        workedExample: {
          title: 'O(1) LRU cache with sentinel list',
          body: 'A complete minimal LRU showing promotion on get/put and eviction of the least-recent node.',
          language: 'python',
          code: `class Node:
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LruCache:
    def __init__(self, capacity: int):
        if capacity < 0:
            raise ValueError("capacity must be >= 0")
        self.capacity = capacity
        self.map = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: Node) -> None:
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node: Node) -> None:
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return None
        self._remove(node)
        self._add_front(node)
        return node.value

    def put(self, key, value) -> None:
        if self.capacity == 0:
            return
        if key in self.map:
            node = self.map[key]
            node.value = value
            self._remove(node)
            self._add_front(node)
            return
        node = Node(key, value)
        self.map[key] = node
        self._add_front(node)
        if len(self.map) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]


if __name__ == "__main__":
    cache = LruCache(2)
    cache.put("a", 1)
    cache.put("b", 2)
    print(cache.get("a"))
    cache.put("c", 3)
    print(cache.get("b"), cache.get("c"))`
        },
        callout: {
          tone: 'tip',
          body:
            'Capacity 2 tests are perfect demos: put a,b; get a; put c; assert b gone and a present.'
        },
        checkYourself: [
          {
            prompt: 'What happens on put when key already exists at capacity?',
            reveal:
              'Update value and promote; do not evict another key, because size does not increase.'
          }
        ]
      },
      {
        id: 'lru-concurrency',
        heading: 'Concurrency without losing the plot',
        paragraphs: [
          'A single mutex around get/put is the correct first answer. It preserves invariants with minimal code. Striping or concurrent maps plus careful list locks are advanced follow-ups that easily go wrong.',
          'Read-heavy caches may use read-write locks, but promotion on get is a write to the list order—so get is not a pure read. Mention that subtlety; it impresses interviewers.',
          'For distributed LRU, you are no longer designing a local structure: sharding, TTLs, and consistency models dominate. Bridge briefly, then return to process-local LRU.'
        ],
        keyTerms: [
          {
            term: 'Coarse lock',
            definition:
              'One mutex guarding the whole cache; simple and correct for many interview scopes.'
          },
          {
            term: 'Promotion write',
            definition:
              'The fact that LRU get mutates recency order, complicating read-write lock schemes.'
          },
          {
            term: 'Sharded cache',
            definition:
              'Partitioning keys across independently locked segments to reduce contention.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Locking the map but not the list (or vice versa) creates races that corrupt pointers. One lock first.'
        },
        checkYourself: [
          {
            prompt: 'Why is get not read-only in LRU?',
            reveal:
              'It updates recency order, mutating shared list pointers even when the value is unchanged.'
          }
        ]
      },
      {
        id: 'lru-edges-and-variants',
        heading: 'Edge cases and policy variants',
        paragraphs: [
          'Edges: capacity 0, capacity 1, get miss, overwrite, delete then put, extremely large values (memory), and hash collisions only as a theoretical note. TTL-based expiration is a common extension requiring time indexes.',
          'LFU, LRU-K, and segmented LRU appear as follow-ups. Keep eviction policy behind a strategy if the interviewer wants multiple policies; otherwise do not over-abstract.',
          'Loader caches (get-or-load) need single-flight loads to avoid stampedes. That is a separate concurrency design layered on LRU storage.'
        ],
        callout: {
          tone: 'interview',
          body:
            'If asked about cache stampede, mention single-flight/request coalescing in front of the loader, not inside list pointer logic.'
        },
        checkYourself: [
          {
            prompt: 'How would you add TTL without scanning the whole cache on each get?',
            reveal:
              'Store expiry on nodes and maintain a separate time-ordered structure, or lazy-expire on access plus periodic cleanup.'
          }
        ]
      },
      {
        id: 'lru-closing',
        heading: 'Closing the hot-path story',
        paragraphs: [
          'Restate complexity, structures, promotion rules, and lock strategy. Run the capacity-2 script aloud.',
          'Connect to system design: local LRU as a process cache in front of Redis or DB, with explicit consistency expectations.',
          'Tests: hits/misses, eviction order, overwrite, thread-smoke with a lock if time permits.'
        ],
        callout: {
          tone: 'interview',
          body:
            'End with invariants: map size equals list length, and list order is exact recency order.'
        },
        checkYourself: [
          {
            prompt: 'Name two invariants your tests should check after operations.',
            reveal:
              'len(map) equals number of real list nodes, and iterating from head to tail visits the most-recent key first.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'LRU pairs a hash map with a doubly linked list for O(1) get/put.',
        'Promotion and eviction are pointer splices; sentinels simplify edges.',
        'Start concurrency with one coarse lock; remember get mutates order.',
        'Variants (TTL, LFU, loaders) layer on after the core is proven.'
      ],
      nextSteps: [
        'Implement LRU with capacity 2 and the classic eviction demo.',
        'Add a mutex and discuss why get takes the write path.',
        'Sketch how a loader with single-flight would sit in front of the cache.'
      ]
    }
  },

  'lld-hot-path-labs/rate-limiter-design-lab': {
    title: 'Rate limiter design lab',
    readingTime: '55-70 min',
    premise:
      'Rate limiter design asks you to protect a hot path with a clear policy, precise time math, and safe concurrency. Machine-coding rounds favor token bucket or sliding window implementations that can sit in front of an API handler with predictable behavior.',
    parts: [
      {
        id: 'limiter-requirements',
        heading: 'Requirements: who is limited and how',
        paragraphs: [
          'Clarify identity: per user, per IP, per API key, or global. Clarify limit: N requests per window, or sustained rate with burst. Clarify response: reject, queue, or delay. Clarify clock: monotonic for intervals.',
          'Use cases: allow(key) → boolean or decision object with retry-after. Admin updates to limits. Optional fair queuing is a follow-up, not the first demo.',
          'Domain sentence: "RateLimiter uses a Policy to decide whether a request at time t for key k consumes budget; Store holds per-key counters or buckets; Clock provides now."'
        ],
        keyTerms: [
          {
            term: 'Token bucket',
            definition:
              'A rate algorithm that refills tokens at a steady rate and allows bursts up to bucket capacity.'
          },
          {
            term: 'Sliding window',
            definition:
              'A rate algorithm that counts requests inside a moving time window rather than fixed resets.'
          },
          {
            term: 'Retry-after',
            definition:
              'Guidance returned to callers indicating when sufficient budget may exist again.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Confirm burst behavior. Fixed windows are simple but allow 2N spikes at boundaries; call that out.'
        },
        checkYourself: [
          {
            prompt: 'Why can fixed windows allow almost 2N requests near a boundary?',
            reveal:
              'A client can spend N at the end of one window and N at the start of the next, doubling the short-term rate.'
          }
        ]
      },
      {
        id: 'limiter-class-diagram',
        heading: 'Class diagram and algorithm choice',
        paragraphs: [
          'RateLimiter facade, Clock port, Store (memory dict or Redis port), and Policy strategy (TokenBucket, SlidingWindowLog, SlidingWindowCounter, LeakyBucket). Decision value object carries allowed flag and metadata.',
          'Token bucket suits API throttles with burst. Sliding window log is accurate but memory-heavy. Sliding window counter approximates with less memory. Pick one, implement well, discuss others.',
          'Relationships: Limiter uses Clock and Store; Policy may be pure functions over bucket state. Keep HTTP concerns out of the limiter core.'
        ],
        keyTerms: [
          {
            term: 'Bucket state',
            definition:
              'Per-key fields such as tokens and last refill timestamp for token-bucket policies.'
          },
          {
            term: 'Window counter',
            definition:
              'Counts of requests partitioned into time slices used by approximate sliding windows.'
          },
          {
            term: 'Decision object',
            definition:
              'The return type describing allow/deny plus optional remaining budget and retry timing.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Choose token bucket for a first implementation unless the interviewer specifies otherwise; explain tradeoffs in one breath.'
        },
        checkYourself: [
          {
            prompt: 'When is sliding window log awkward at scale?',
            reveal:
              'It stores timestamps per request per key, which grows with traffic and complicates distributed stores.'
          }
        ]
      },
      {
        id: 'token-bucket-worked',
        heading: 'Token bucket implementation spine',
        paragraphs: [
          'State per key: tokens and last_refill_ts. On allow, refill tokens based on elapsed time × rate, cap at burst capacity, then try to consume one token. Reject if insufficient.',
          'Use integer math where possible: store tokens as scaled integers (e.g., micros) to avoid float drift, or accept floats carefully in interviews with a comment on production hardening.',
          'Iteration: single global bucket, then per-key map, then concurrency lock, then distributed store talk.'
        ],
        workedExample: {
          title: 'Per-key token bucket limiter',
          body: 'Refill based on elapsed time, cap at burst, consume one token per allow. Clock is injected for tests.',
          language: 'python',
          code: `from dataclasses import dataclass


@dataclass
class Bucket:
    tokens: float
    last_ts: float


class TokenBucketLimiter:
    def __init__(self, rate_per_sec: float, burst: float, clock):
        self.rate = rate_per_sec
        self.burst = burst
        self.clock = clock
        self.buckets = {}

    def allow(self, key: str) -> bool:
        now = self.clock()
        bucket = self.buckets.get(key)
        if bucket is None:
            bucket = Bucket(self.burst, now)
            self.buckets[key] = bucket
        elapsed = max(0.0, now - bucket.last_ts)
        bucket.tokens = min(self.burst, bucket.tokens + elapsed * self.rate)
        bucket.last_ts = now
        if bucket.tokens >= 1.0:
            bucket.tokens -= 1.0
            return True
        return False


if __name__ == "__main__":
    t = [0.0]
    limiter = TokenBucketLimiter(rate_per_sec=1.0, burst=2.0, clock=lambda: t[0])
    print(limiter.allow("u1"), limiter.allow("u1"), limiter.allow("u1"))
    t[0] = 1.5
    print(limiter.allow("u1"))`
        },
        callout: {
          tone: 'tip',
          body:
            'Advance a fake clock in tests to show refill without sleeping—standard hot-path interview craft.'
        },
        checkYourself: [
          {
            prompt: 'What does burst control in token bucket?',
            reveal:
              'The maximum tokens that can accumulate, hence the largest short spike above the sustained rate.'
          }
        ]
      },
      {
        id: 'limiter-concurrency-distributed',
        heading: 'Concurrency and distributed limiters',
        paragraphs: [
          'In-process: lock per key or a concurrent map of buckets with careful atomic refill/consume. A single global lock works for demos but contends under load.',
          'Distributed: Redis token bucket with Lua scripts for atomic refill-and-consume, or rate modules. Mention race of read-modify-write without atomicity—two nodes can over-admit.',
          'Clock skew across machines argues for server-side limiting with a shared store, or for designs tolerant of approximate enforcement.'
        ],
        keyTerms: [
          {
            term: 'Atomic refill-and-consume',
            definition:
              'A single critical section or script that updates budget without interleaving between nodes or threads.'
          },
          {
            term: 'Approximate limiting',
            definition:
              'Enforcement that may slightly over/under admit under races or sharding for higher throughput.'
          },
          {
            term: 'Per-key lock',
            definition:
              'Synchronization striped by key so unrelated clients do not block each other.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Naive get-bucket / put-bucket across Redis without a script is a classic over-admission bug.'
        },
        checkYourself: [
          {
            prompt: 'Why do distributed limiters often use Lua or transactions?',
            reveal:
              'To make refill and consume atomic in the shared store so concurrent nodes cannot both think a token remains.'
          }
        ]
      },
      {
        id: 'limiter-edges',
        heading: 'Edge cases, fairness, and API design',
        paragraphs: [
          'Edges: unknown keys, limit of zero, negative time jumps if clock rewinds, hot keys dominating memory, and need for TTL on idle bucket entries to avoid unbounded maps.',
          'Fairness follow-ups: separate limits for authenticated vs anonymous, priority lanes, and dry-run mode that returns decisions without consuming—useful for dashboards.',
          'Return rich decisions: allowed, remaining tokens, retry_after_ms. Callers and HTTP layers map that to 429 responses without baking HTTP into the core.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Mention idle-bucket eviction so a limiter for millions of IPs does not leak memory forever.'
        },
        checkYourself: [
          {
            prompt: 'How do you test a rate limiter properly?',
            reveal:
              'Inject a clock, fire a scripted sequence of allow() calls at chosen timestamps, and assert the boolean/decision pattern.'
          }
        ]
      },
      {
        id: 'limiter-closing',
        heading: 'Closing the limiter design',
        paragraphs: [
          'Summarize identity keying, algorithm, atomicity, and response shape. Show the burst-then-refill demo with a fake clock.',
          'Bridge to gateway placement: limiter as middleware depending on ports, not as business logic inside every service method—though service-local limiters also exist.',
          'If time remains, contrast token bucket with sliding window in one chart of accuracy vs memory vs boundary spikes.'
        ],
        callout: {
          tone: 'interview',
          body:
            'A strong close: policy strategy + clock seam + atomic consume + 429 mapping at the edge.'
        },
        checkYourself: [
          {
            prompt: 'Where should HTTP 429 formatting live?',
            reveal:
              'In the web adapter/middleware, mapping a domain Decision to status codes and headers—not inside TokenBucketLimiter.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Rate limiters need clear identity keys, policies, and injected clocks.',
        'Token bucket is a strong default; know fixed-window boundary spikes and sliding-window tradeoffs.',
        'Atomic refill-and-consume is the concurrency heart—locks locally, scripts distributed.',
        'Return decision objects and keep HTTP mapping at the edge; evict idle keys to bound memory.'
      ],
      nextSteps: [
        'Implement per-key token bucket with a fake clock and a burst demo.',
        'Add a mutex or discuss Redis Lua atomicity for multi-node deployment.',
        'Extend allow() to return remaining tokens and retry-after guidance.'
      ]
    }
  }
};
