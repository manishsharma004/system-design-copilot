const chapters = {
  "dsa-concepts-lab/complexity-and-algorithmic-thinking": {
    title: "Chapter: Complexity and algorithmic thinking",
    readingTime: "75-95 min",
    premise:
      "Interview complexity is practical storytelling: name the input sizes, identify the hot operation, and defend a growth class you can derive from the process. This chapter builds that habit with Python-cost intuition, amortized reasoning, and space–time tradeoffs.",
    parts: [
      {
        id: "growth-stories",
        heading: "Big-O is a story about how work grows",
        paragraphs: [
          "Big-O does not ask how many nanoseconds one run took on your laptop. It asks what happens when the input becomes much larger. A single pass over n items is linear. Nested pairwise work is quadratic. Repeated halving is logarithmic. The useful interview habit is to narrate the algorithm before coding: scan once, for each item scan the rest, or cut the search space in half each comparison.",
          "Constants and lower-order terms matter for small n and for systems latency, but asymptotic class predicts scale. An algorithm that does 3n + 20 work is O(n). One that does n^2 + n is O(n^2). Dropping constants is legal only after you have named the real variables and found the dominant term.",
          "Input size is not always list length. For graphs it is often vertices plus edges. For strings it may be text length and pattern length. For matrices it is rows times columns. State the variables before the bound: let V be vertices and E edges, then say O(V + E). Vague O(n) without defining n is how wrong answers start."
        ],
        keyTerms: [
          {
            term: "Big-O",
            definition:
              "An upper-bound growth class for an algorithm's time or space as input size increases."
          },
          {
            term: "dominant term",
            definition:
              "The fastest-growing part of a cost expression; it determines the asymptotic class."
          },
          {
            term: "input variables",
            definition:
              "Named dimensions of the problem such as n, q, V, E, or string lengths."
          }
        ],
        workedExample: {
          title: "Count checks for linear, pairwise, and binary search",
          body:
            "Counters make growth shapes visible without relying on wall-clock timing.",
          code:
            "def linear_scan(values, target):\n    checks = 0\n    for value in values:\n        checks += 1\n        if value == target:\n            return True, checks\n    return False, checks\n\n\ndef pair_count(values):\n    checks = 0\n    for i in range(len(values)):\n        for j in range(i + 1, len(values)):\n            checks += 1\n    return checks\n\n\ndef binary_search_checks(values, target):\n    checks = 0\n    lo, hi = 0, len(values) - 1\n    while lo <= hi:\n        checks += 1\n        mid = (lo + hi) // 2\n        if values[mid] == target:\n            return True, checks\n        if values[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return False, checks\n\n\nfor n in [8, 16, 32, 64]:\n    data = list(range(n))\n    print(n, linear_scan(data, -1)[1], pair_count(data), binary_search_checks(data, -1)[1])",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is nested loops not automatically O(n^2)?",
            reveal:
              "If the inner loop walks disjoint pieces that together total O(n) work, the whole pass can be O(n). Nested structure alone does not define the bound; total work across iterations does."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Narrate first: one pass, nested pairs, or halving. The story usually picks the complexity class before you write code."
        }
      },
      {
        id: "python-cost-model",
        heading: "Python operation costs are part of the answer",
        paragraphs: [
          "Asymptotic answers fail when the cost model is wrong. In Python, list indexing and append are cheap, but list.pop(0) shifts every remaining element and is O(n). deque.popleft is O(1). Dict and set membership are expected O(1) under a good hash, worst case O(n) under pathological collisions. Sorting is O(n log n). String concatenation in a loop can be quadratic if each + copies a growing prefix.",
          "Interviewers expect you to defend costs in the language you are using. Saying hash lookup is O(1) is incomplete without average-case and load-factor assumptions. Saying BFS is O(V + E) assumes an adjacency-list representation. Saying substring extraction is free is often false when you copy k characters.",
          "A practical checklist: name the structure, name the operation, state expected and worst case when they differ, and include output size when the answer itself can be large. That precision separates memorized phrases from algorithmic thinking."
        ],
        keyTerms: [
          {
            term: "cost model",
            definition:
              "Assumptions about which operations are primitive and what each costs in a language or structure."
          },
          {
            term: "expected O(1)",
            definition:
              "Average-case constant time under assumptions such as good hashing and bounded load factor."
          },
          {
            term: "output-sensitive",
            definition:
              "A bound that includes the size of the produced answer, not only input scanning."
          }
        ],
        workedExample: {
          title: "Scan membership versus set membership",
          body:
            "Preprocessing into a set trades memory for faster repeated queries; growth trends beat microbenchmarks.",
          code:
            "from time import perf_counter\n\n\ndef contains_with_scan(values, queries):\n    found = 0\n    for query in queries:\n        for value in values:\n            if value == query:\n                found += 1\n                break\n    return found\n\n\ndef contains_with_set(values, queries):\n    lookup = set(values)\n    return sum(1 for query in queries if query in lookup)\n\n\nfor n in [500, 1000, 2000, 4000]:\n    values = list(range(n))\n    queries = list(range(n, 2 * n))\n    t0 = perf_counter()\n    contains_with_scan(values, queries)\n    scan = perf_counter() - t0\n    t0 = perf_counter()\n    contains_with_set(values, queries)\n    hashed = perf_counter() - t0\n    print(f\"n={n} scan={scan:.5f}s set={hashed:.5f}s\")",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can list.pop(0) make an apparently linear algorithm quadratic?",
            reveal:
              "Each pop shifts the remaining elements. Doing that n times costs about 1 + 2 + ... + n = O(n^2) even if the loop looks like a single pass."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "When stating complexity, mention the Python structure: dict lookup expected O(1), list insert at front O(n), sorted O(n log n)."
        }
      },
      {
        id: "hot-operation",
        heading: "Choose the hot operation before the clever trick",
        paragraphs: [
          "Many prompts hide one repeated expensive operation: membership tests, min extraction, range sums, or neighbor walks. Name that operation early. If you answer q membership queries by scanning an n-element list each time, cost is O(nq). Building a set once costs O(n) time and O(n) space, then queries become expected O(1) each for O(n + q) total.",
          "The best solution is decided by frequency and constraints, not taste. One query on a huge list may prefer a scan to avoid allocation. Many queries justify preprocessing. Mutation constraints matter: sorting in place may be disallowed; a hash map may be required for index recovery.",
          "Interview narration should sound like budgeting: identify the expensive call site, estimate how often it runs, and decide whether preprocessing, better data structures, or a different algorithm reduces total work enough to matter under the constraints."
        ],
        keyTerms: [
          {
            term: "hot operation",
            definition:
              "The repeated work that dominates total cost if left naive."
          },
          {
            term: "preprocessing",
            definition:
              "Up-front work that builds a structure so later operations become cheaper."
          },
          {
            term: "space–time tradeoff",
            definition:
              "Using extra memory to reduce asymptotic or practical running time."
          }
        ],
        workedExample: {
          title: "Two-sum with a one-pass index map",
          body:
            "Each value stores the complement we still need; one pass replaces nested pair search.",
          code:
            "def two_sum(nums, target):\n    need = {}\n    for i, value in enumerate(nums):\n        if value in need:\n            return [need[value], i]\n        need[target - value] = i\n    return []\n\n\nprint(two_sum([2, 7, 11, 15], 9))\nprint(two_sum([3, 2, 4], 6))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When would sorting plus two pointers beat a hash map for two-sum?",
            reveal:
              "When you only need values not indices, mutation or copying is allowed, and you prefer O(1) extra space after sorting at O(n log n) time instead of expected O(n) time with O(n) space."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Ask aloud: what operation repeats, and how many times? That question often picks the data structure."
        }
      },
      {
        id: "amortized",
        heading: "Amortized cost averages over a sequence",
        paragraphs: [
          "Worst-case cost asks what one unlucky operation can cost. Amortized cost asks what a long sequence costs on average when occasional expensive work pays for many cheap operations. Python list append is the classic example: most appends write into spare capacity; rare appends resize and copy. Across many appends, each element is copied a small constant number of times if capacity doubles, so append is O(1) amortized even though one resize is O(n).",
          "Amortized is not the same as average over random inputs. It is accounting over a sequence of operations on the structure. Hash-table resizing, dynamic arrays, and union-find path compression all use this idea. If latency spikes matter in a system, mention both: O(1) amortized, O(n) worst case on resize.",
          "In interviews, showing amortized literacy signals that you understand long-run guarantees and sharp edges. Saying only O(1) without caveats can be incomplete; saying O(n) for every append is also wrong. Precision wins."
        ],
        keyTerms: [
          {
            term: "amortized analysis",
            definition:
              "Bounding average cost per operation over a sequence when rare expensive work is paid for by many cheap ones."
          },
          {
            term: "geometric resizing",
            definition:
              "Growing capacity by a constant factor so total copy work stays linear across many inserts."
          },
          {
            term: "latency spike",
            definition:
              "A single expensive operation that can hurt interactive systems even when amortized cost is low."
          }
        ],
        workedExample: {
          title: "A tiny dynamic array model",
          body:
            "Doubling capacity makes total copies linear in the number of appends.",
          code:
            "class TinyDynamicArray:\n    def __init__(self):\n        self.capacity = 1\n        self.size = 0\n        self.copied_items = 0\n\n    def append(self, value):\n        if self.size == self.capacity:\n            self.copied_items += self.size\n            self.capacity *= 2\n        self.size += 1\n\n\narr = TinyDynamicArray()\nfor _ in range(32):\n    arr.append(0)\nprint(arr.size, arr.capacity, arr.copied_items)\nprint('copies per append', arr.copied_items / arr.size)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "If capacity grew by +1 each time instead of doubling, what would amortized append become?",
            reveal:
              "Each resize copies the whole array and happens every insert, so total copy work is about 1 + 2 + ... + n = O(n^2), which is O(n) amortized per append."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Do not confuse amortized O(1) with guaranteed O(1) per call. Systems that care about tail latency may still need bounded worst-case structures."
        }
      },
      {
        id: "space-and-narration",
        heading: "Space bounds and interview narration",
        paragraphs: [
          "Space complexity counts auxiliary memory, not only the returned output when the problem asks for extra space. A BFS queue can hold O(V) vertices. Tree recursion depth is O(h); in a skewed tree h = n. A DP table of size n times target may be pseudo-polynomial and impractical when target is huge.",
          "Many speedups buy time with memory: hash maps, prefix arrays, memo tables. Interview follow-ups often ask for less memory. You can compress only when old states are no longer needed. Be ready to name what you store and why.",
          "A strong complexity answer sounds like: constraints imply n up to 1e5 so O(n^2) is too slow; I will use a hash map for expected O(n) time and O(n) space; if memory is tight I can sort in O(n log n). That narrative ties constraints, algorithm, and tradeoffs."
        ],
        keyTerms: [
          {
            term: "auxiliary space",
            definition:
              "Extra memory beyond the input representation and required output."
          },
          {
            term: "recursion stack",
            definition:
              "Implicit memory used by call frames; often proportional to depth."
          },
          {
            term: "constraint-driven choice",
            definition:
              "Selecting an algorithm because input limits make some growth classes infeasible."
          }
        ],
        workedExample: {
          title: "Defend a membership tradeoff aloud",
          body:
            "Print both answers and compare asymptotic stories for the same queries.",
          code:
            "def answer_queries_scan(values, queries):\n    return [any(v == q for v in values) for q in queries]\n\n\ndef answer_queries_set(values, queries):\n    lookup = set(values)\n    return [q in lookup for q in queries]\n\n\nvalues = [17, 4, 9, 21, 4, 30]\nqueries = [4, 10, 21, 99]\nprint(answer_queries_scan(values, queries))\nprint(answer_queries_set(values, queries))\nprint('scan O(nq) space O(1); set O(n+q) time O(n) space')",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What should you say if an interviewer asks for worst-case hash map cost?",
            reveal:
              "Expected O(1) under a good hash and bounded load; worst case O(n) if many keys collide into one bucket. Mention randomization or treeified buckets if relevant to the runtime."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Lead with constraints, then growth class, then space, then a fallback if the first approach is rejected."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Big-O names growth after you define input variables and the hot operation.",
        "Python structure costs are part of a correct complexity answer.",
        "Preprocessing is justified by how often later operations reuse the structure.",
        "Amortized analysis explains dynamic arrays and hash resizing without hiding worst-case spikes.",
        "Space and constraints belong in the same narration as time."
      ],
      nextSteps: [
        "Rewrite a nested-loop solution and state its bound from total work, not loop nesting.",
        "List expected costs for list, deque, dict, and set operations you use often.",
        "Practice a thirty-second tradeoff speech for scan versus hash set."
      ]
    }
  },

  "dsa-concepts-lab/hash-tables-and-memory-layout": {
    title: "Chapter: Hash tables and memory layout",
    readingTime: "75-95 min",
    premise:
      "Hash tables feel like magic until you see buckets, collisions, load factor, and cache lines. This chapter connects dictionary intuition to memory layout so you can defend expected O(1) and know when arrays win on locality.",
    parts: [
      {
        id: "hash-contract",
        heading: "A hash table maps keys to buckets through a contract",
        paragraphs: [
          "A hash function turns a key into an integer, then modular arithmetic (or a related map) picks a bucket. Equality decides whether the key is already present. The contract is strict: if two keys compare equal, their hashes must match. Violating that breaks lookup. Mutable keys that change hash-relevant fields after insertion can disappear from the table even though the object still exists.",
          "Python dict and set are hash tables. Strings, numbers, and tuples of immutables are natural keys. Lists are not hashable because they are mutable. Composite keys should include every field that changes the meaning of the entry and exclude noise fields that destroy cache hits.",
          "Interview answers should separate hashing from equality. Hash picks a neighborhood; equality confirms identity. Collisions are normal. Performance depends on spreading keys and keeping the table sparse enough that chains or probes stay short."
        ],
        keyTerms: [
          {
            term: "hash function",
            definition:
              "A function that maps a key to an integer used to select a bucket."
          },
          {
            term: "bucket",
            definition:
              "A slot or chain location where entries with the same hash neighborhood are stored."
          },
          {
            term: "hash–equality contract",
            definition:
              "Equal keys must share a hash; unequal keys may collide but must compare unequal."
          }
        ],
        workedExample: {
          title: "Visualize buckets and collisions",
          body:
            "A tiny table shows how different keys can land in the same bucket index.",
          code:
            "def bucket_index(key, capacity):\n    return hash(key) % capacity\n\n\ncapacity = 8\nkeys = ['apple', 'apricot', 'banana', 'berry', 'citrus']\nbuckets = [[] for _ in range(capacity)]\nfor key in keys:\n    buckets[bucket_index(key, capacity)].append(key)\nfor i, chain in enumerate(buckets):\n    if chain:\n        print(i, chain)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why must equal keys share a hash?",
            reveal:
              "Lookup computes the hash of the query key and only searches that bucket neighborhood. If equals hashed differently, the search would look in the wrong place and miss the entry."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Never mutate an object in a way that changes its hash while it is stored as a dict key."
        }
      },
      {
        id: "collisions-and-load",
        heading: "Collisions and load factor set real performance",
        paragraphs: [
          "Collisions are inevitable because many keys map into fewer buckets. Separate chaining stores a list or tree per bucket. Open addressing stores entries in the main array and probes alternative slots. Chaining handles high load more gracefully but pays pointer overhead. Open addressing is cache-friendly until clustering lengthens probes.",
          "Load factor is entries divided by capacity. As it rises, average chain or probe length grows. Implementations often resize around two-thirds to four-fifths full, trading memory for stable expected O(1). Resize allocates a new array and reinserts entries because bucket indices depend on capacity. That pass is O(n), but geometric growth keeps insert amortized O(1).",
          "Pathological collisions can make a naive chained table O(n) per operation. Say expected O(1) under a good hash and bounded load, worst case O(n). That wording is more honest than claiming dictionaries are always constant time."
        ],
        keyTerms: [
          {
            term: "load factor",
            definition:
              "Number of stored entries divided by bucket capacity."
          },
          {
            term: "separate chaining",
            definition:
              "Collision strategy that stores a small collection per bucket."
          },
          {
            term: "open addressing",
            definition:
              "Collision strategy that probes alternate slots inside the main array."
          }
        ],
        workedExample: {
          title: "Separate chaining map from scratch",
          body:
            "Insert and get walk only the chain for the key's bucket.",
          code:
            "class ChainMap:\n    def __init__(self, capacity=8):\n        self.capacity = capacity\n        self.buckets = [[] for _ in range(capacity)]\n\n    def _bucket(self, key):\n        return self.buckets[hash(key) % self.capacity]\n\n    def put(self, key, value):\n        chain = self._bucket(key)\n        for i, (k, _) in enumerate(chain):\n            if k == key:\n                chain[i] = (key, value)\n                return\n        chain.append((key, value))\n\n    def get(self, key, default=None):\n        for k, v in self._bucket(key):\n            if k == key:\n                return v\n        return default\n\n\nm = ChainMap()\nm.put('a', 1)\nm.put('b', 2)\nm.put('a', 3)\nprint(m.get('a'), m.get('z', -1))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does resizing rehash all keys?",
            reveal:
              "Bucket index usually depends on capacity. After capacity changes, the old index is no longer valid, so every entry must be placed again."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Mention load factor and amortized resize when asked why dict operations are expected O(1)."
        }
      },
      {
        id: "memory-locality",
        heading: "Memory layout turns constants into wall-clock time",
        paragraphs: [
          "Big-O ignores the memory hierarchy, but CPUs fetch cache lines, often 64 bytes at a time. Scanning a contiguous array of integers is fast because consecutive values arrive together and prefetchers help. Walking a pointer-linked list of the same length can be much slower even though both are O(n), because each node may live on a different cache line.",
          "This is why sorted arrays sometimes beat hash sets for moderate read-heavy workloads. Binary search is O(log n) with compact memory. Hash lookup is expected O(1) but computes a hash, probes buckets, and may chase pointers. For tiny n, linear scan can win because it has no setup cost and excellent locality.",
          "Algorithm choice should consider input size, mutation frequency, and layout—not only asymptotic class. Contiguous structures favor scans and binary search. Pointer-rich structures favor flexible inserts and deletes. Interview answers that mention locality sound production-aware."
        ],
        keyTerms: [
          {
            term: "cache line",
            definition:
              "A fixed-size block of memory fetched together by the CPU cache."
          },
          {
            term: "locality",
            definition:
              "The tendency of accesses to hit nearby or recently used memory."
          },
          {
            term: "pointer chasing",
            definition:
              "Following links that jump around memory and hurt cache behavior."
          }
        ],
        workedExample: {
          title: "Array scan versus pointer-chasing list",
          body:
            "Same asymptotic scan, different access shape; count node hops explicitly.",
          code:
            "class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\n\ndef array_find(values, target):\n    for value in values:\n        if value == target:\n            return True\n    return False\n\n\ndef list_find(head, target):\n    node = head\n    while node is not None:\n        if node.value == target:\n            return True\n        node = node.next\n    return False\n\n\nvalues = list(range(20))\nhead = None\nfor value in reversed(values):\n    head = Node(value, head)\nprint(array_find(values, 19), list_find(head, 19))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When might a sorted array beat a hash set?",
            reveal:
              "When n is moderate, lookups are mostly reads, memory is tight, or predictable access and compact layout matter more than expected O(1) hashing overhead."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Asymptotic ties are decided by constants, allocation, and cache behavior. Say that aloud when two O(n) options compete."
        }
      },
      {
        id: "frequency-and-grouping",
        heading: "Frequency maps and grouping keys are the interview workhorses",
        paragraphs: [
          "Many prompts reduce to counting or grouping. Character frequencies, anagram groups, and majority votes all build a map from a derived key to a count or list. The design question is what the key should be. For anagrams, a sorted string or a fixed alphabet count tuple works. For paths, a canonical serialization may work. Bad keys either collide distinct meanings or explode cardinality.",
          "Building the map is usually one pass. Reading it produces the answer: first unique character, top frequency, or grouped lists. Watch for whether order of first occurrence matters; then you may need an ordered dict or a parallel list of insertion order.",
          "These patterns train you to invent hashable signatures. If the signature is expensive to compute, mention that cost. If two different items share a signature incorrectly, correctness fails before performance matters."
        ],
        keyTerms: [
          {
            term: "frequency map",
            definition:
              "A dictionary from item or feature to occurrence count."
          },
          {
            term: "grouping key",
            definition:
              "A hashable signature that places equivalent items in the same bucket."
          },
          {
            term: "signature",
            definition:
              "A derived immutable value used as a dict key for classification."
          }
        ],
        workedExample: {
          title: "Group anagrams with a sorted signature",
          body:
            "Words that share a sorted character key belong in the same group.",
          code:
            "from collections import defaultdict\n\n\ndef group_anagrams(words):\n    groups = defaultdict(list)\n    for word in words:\n        key = ''.join(sorted(word))\n        groups[key].append(word)\n    return list(groups.values())\n\n\nprint(group_anagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is a list a bad dict key for anagram counts?",
            reveal:
              "Lists are mutable and unhashable in Python. Use a tuple of counts or a sorted string so the key is immutable and hashable."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Explain the signature before coding: what makes two items equivalent for this prompt?"
        }
      },
      {
        id: "layout-tradeoffs",
        heading: "Choose layout under constraints",
        paragraphs: [
          "When designing under constraints, ask: how large is n, how many lookups, how often do we mutate, and do we need ordering? Hash tables win for large dynamic membership and association. Arrays win for dense integer keys, tight loops, and binary search after sorting. Linked structures win for splicing when arrays would shift too much, at the cost of locality.",
          "Open addressing versus chaining rarely appears as a coding-task requirement, but it is a strong systems follow-up. Mention cache friendliness, tombstones on deletion, and rebuilds when probe quality degrades. For interview coding, Python dict is the default associative map; know what it buys and what it costs in memory.",
          "The durable skill is matching access pattern to layout. Random key lookup under heavy insert/delete favors hashing. Sequential aggregation favors arrays. Graph adjacency for sparse graphs favors lists of neighbors, not a V by V matrix."
        ],
        keyTerms: [
          {
            term: "access pattern",
            definition:
              "How a workload reads and writes data: sequential, random, lookup-heavy, or splice-heavy."
          },
          {
            term: "dense keys",
            definition:
              "Keys that pack into a compact integer range where arrays index directly."
          },
          {
            term: "tombstone",
            definition:
              "A deleted marker in open addressing that preserves probe chains until rebuild."
          }
        ],
        workedExample: {
          title: "First unique character with counts and order",
          body:
            "Count first, then scan in original order to find the first count-one character.",
          code:
            "from collections import Counter\n\n\ndef first_unique_char(s):\n    counts = Counter(s)\n    for i, ch in enumerate(s):\n        if counts[ch] == 1:\n            return i\n    return -1\n\n\nprint(first_unique_char('leetcode'))\nprint(first_unique_char('loveleetcode'))\nprint(first_unique_char('aabb'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why not return the minimum index while building the Counter?",
            reveal:
              "You do not know final counts until the whole string is seen. A character that looks unique early may repeat later."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If keys are integers in 0..k and k is near n, an array can replace a hash map with better locality."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Hash tables depend on a hash–equality contract and bounded load.",
        "Collisions are normal; chaining and open addressing trade memory and locality.",
        "Cache lines make contiguous scans faster than pointer chasing at the same Big-O.",
        "Frequency and grouping problems are mostly signature design.",
        "Choose arrays, hashes, or links from access patterns and constraints."
      ],
      nextSteps: [
        "Implement a tiny chained map and force collisions with a weak hash.",
        "Compare group-anagrams signatures: sorted string versus count tuple.",
        "Explain when you would prefer a sorted array over a set in an interview."
      ]
    }
  },

  "dsa-concepts-lab/trees-graphs-mental-models": {
    title: "Chapter: Trees and graphs mental models",
    readingTime: "80-100 min",
    premise:
      "Tree and graph problems become manageable when you name state, representation, frontier, and visited rules before coding. This chapter builds mental models for DFS/BFS, components, and topological order.",
    parts: [
      {
        id: "state-first",
        heading: "Name the state carried at each step",
        paragraphs: [
          "Traversal clarity starts with state. In a tree depth problem, state might be node and depth. In path sum, node and remaining total. In shortest path, vertex and distance. In cycle detection, a color: unvisited, visiting, visited. Code written before state is defined grows accidental globals and off-by-one patches.",
          "Trees buy constraints: connected and acyclic, exactly one simple path between nodes. Recursion fits because child answers combine into parent answers—height, balance, subtree sums. General graphs remove those comforts. Cycles exist, multiple paths exist, components may be disconnected, edges may be directed or weighted.",
          "The first modeling question is which assumptions hold. If the input is a binary tree, you can recurse without a visited set. If it is a general graph, revisiting without a visited rule can loop forever. State names should explain the proof of correctness, not only the loop variables."
        ],
        keyTerms: [
          {
            term: "carried state",
            definition:
              "Values threaded through traversal such as depth, distance, remaining sum, or color."
          },
          {
            term: "tree",
            definition:
              "A connected acyclic graph; many problems assume a rooted hierarchy."
          },
          {
            term: "visited rule",
            definition:
              "When a node is marked discovered or finished to prevent duplicate or cyclic work."
          }
        ],
        workedExample: {
          title: "Tree DFS returning height and balance",
          body:
            "Each call returns height; imbalance bubbles up with a sentinel.",
          code:
            "class Node:\n    def __init__(self, val, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n\ndef height_and_balanced(node):\n    if node is None:\n        return 0, True\n    lh, lb = height_and_balanced(node.left)\n    rh, rb = height_and_balanced(node.right)\n    balanced = lb and rb and abs(lh - rh) <= 1\n    return 1 + max(lh, rh), balanced\n\n\nroot = Node(1, Node(2, Node(3)), Node(4))\nprint(height_and_balanced(root))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can tree DFS omit a visited set that graph DFS needs?",
            reveal:
              "A tree has no cycles and usually no cross edges back to ancestors except through explicit parent links. A general graph can revisit nodes through alternate paths."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Write one sentence: at node u I know __. If you cannot finish the sentence, the state is incomplete."
        }
      },
      {
        id: "representations",
        heading: "Adjacency lists and matrices shape complexity",
        paragraphs: [
          "Graphs are usually stored as adjacency lists or matrices. A list maps each vertex to neighbors and uses O(V + E) space—ideal for sparse graphs. A matrix uses O(V^2) space and answers edge-exists in O(1)—fine for dense graphs or tiny V. With 100,000 vertices, a matrix is usually impossible; with 100 vertices, it may be simplest.",
          "Representation changes bounds. BFS over lists is O(V + E). BFS over a matrix is O(V^2) because neighbor discovery scans a row. Weighted graphs store (neighbor, weight) pairs. Directed graphs need outgoing lists and sometimes incoming lists. Dynamic deletions may prefer sets of neighbors.",
          "State the representation before the algorithm bound. Saying Dijkstra is O((V + E) log V) assumes a binary heap and adjacency lists. The same algorithm on a matrix has a different bottleneck profile."
        ],
        keyTerms: [
          {
            term: "adjacency list",
            definition:
              "A map from vertex to a collection of neighbors; sparse-friendly."
          },
          {
            term: "adjacency matrix",
            definition:
              "A V by V table where entry (u, v) encodes an edge."
          },
          {
            term: "sparse graph",
            definition:
              "A graph where E is much smaller than V^2."
          }
        ],
        workedExample: {
          title: "Build list and matrix forms",
          body:
            "Same edge list, two representations with different query costs.",
          code:
            "def build_list(n, edges, directed=False):\n    graph = [[] for _ in range(n)]\n    for u, v in edges:\n        graph[u].append(v)\n        if not directed:\n            graph[v].append(u)\n    return graph\n\n\ndef build_matrix(n, edges, directed=False):\n    mat = [[0] * n for _ in range(n)]\n    for u, v in edges:\n        mat[u][v] = 1\n        if not directed:\n            mat[v][u] = 1\n    return mat\n\n\nedges = [(0, 1), (0, 2), (1, 2), (3, 4)]\nprint(build_list(5, edges))\nprint(build_matrix(5, edges))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When is an adjacency matrix worth the memory?",
            reveal:
              "When V is small, the graph is dense, or the algorithm repeatedly needs O(1) edge-existence checks between arbitrary pairs."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Start graph answers with: I will store an adjacency list because the graph is sparse under these constraints."
        }
      },
      {
        id: "frontier-semantics",
        heading: "The frontier data structure is the search policy",
        paragraphs: [
          "The frontier holds discovered but not finished nodes. A FIFO queue yields BFS: process distance d before d + 1 on unweighted graphs. A LIFO stack or recursion yields DFS: deep exploration for components, topology, and backtracking. A min-priority queue yields Dijkstra: next unsettled smallest tentative distance.",
          "Marking time matters. In BFS, mark visited when enqueued to avoid duplicate queue entries. In some Dijkstra implementations, push multiple times and skip stale pops. In backtracking, unmark because membership is path-local, not global reachability. Visited is not one boilerplate line; it encodes an invariant.",
          "Parent pointers reconstruct paths. Distances update answers. Component ids label connectivity. Choose metadata that matches the question: existence, path, distance, ordering, or cut structure."
        ],
        keyTerms: [
          {
            term: "frontier",
            definition:
              "The set of discovered nodes waiting to be expanded."
          },
          {
            term: "BFS",
            definition:
              "Breadth-first search using a queue; shortest path in unweighted graphs."
          },
          {
            term: "DFS",
            definition:
              "Depth-first search using a stack or recursion; strong for topology and components."
          }
        ],
        workedExample: {
          title: "BFS shortest path with parent reconstruction",
          body:
            "Layer order finds fewest edges; parents rebuild the path.",
          code:
            "from collections import deque\n\n\ndef bfs_path(graph, src, dst):\n    parent = {src: None}\n    queue = deque([src])\n    while queue:\n        u = queue.popleft()\n        if u == dst:\n            break\n        for v in graph[u]:\n            if v not in parent:\n                parent[v] = u\n                queue.append(v)\n    if dst not in parent:\n        return None\n    path = []\n    cur = dst\n    while cur is not None:\n        path.append(cur)\n        cur = parent[cur]\n    path.reverse()\n    return path\n\n\ngraph = {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2, 4], 4: [3]}\nprint(bfs_path(graph, 0, 4))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why mark visited at enqueue time in BFS?",
            reveal:
              "A node can be reached from multiple parents in the same layer. Marking at enqueue prevents duplicate queue entries and wasted expansions."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If the prompt is unweighted shortest path, reach for BFS before Dijkstra."
        }
      },
      {
        id: "components",
        heading: "Components and grids are graph problems in costume",
        paragraphs: [
          "Connected components ask which nodes share undirected reachability. Iterate nodes; whenever you find an unvisited node, run DFS or BFS and mark its whole component. Count launches or collect member lists. Union-find answers the same connectivity questions with a different API.",
          "Grid islands are graphs where cells are nodes and four- or eight-neighbor edges exist between land cells. DFS flood fill or BFS works. Mark visited in-place or with a set. Complexity is O(RC) for an R by C grid because each cell is processed constantly many times.",
          "Seeing the graph underneath the story matters. Courses and prerequisites are a directed graph. Chat threads with quotes can be trees. Image regions are grids. Once you see nodes and edges, the traversal toolkit applies."
        ],
        keyTerms: [
          {
            term: "connected component",
            definition:
              "A maximal set of vertices reachable from each other in an undirected graph."
          },
          {
            term: "flood fill",
            definition:
              "DFS/BFS marking of a contiguous region in a grid or image."
          },
          {
            term: "implicit graph",
            definition:
              "A graph not stored explicitly; neighbors are generated by rules such as grid moves."
          }
        ],
        workedExample: {
          title: "Count islands with iterative DFS",
          body:
            "Each unvisited land cell starts a new island; the stack marks the whole region.",
          code:
            "def num_islands(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    seen = [[False] * cols for _ in range(rows)]\n\n    def neighbors(r, c):\n        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < rows and 0 <= nc < cols:\n                yield nr, nc\n\n    def dfs(sr, sc):\n        stack = [(sr, sc)]\n        seen[sr][sc] = True\n        while stack:\n            r, c = stack.pop()\n            for nr, nc in neighbors(r, c):\n                if grid[nr][nc] == '1' and not seen[nr][nc]:\n                    seen[nr][nc] = True\n                    stack.append((nr, nc))\n\n    islands = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1' and not seen[r][c]:\n                islands += 1\n                dfs(r, c)\n    return islands\n\n\ngrid = [\n    ['1', '1', '0', '0'],\n    ['1', '0', '0', '1'],\n    ['0', '0', '1', '1'],\n]\nprint(num_islands(grid))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What is the time complexity of island counting on an R by C grid?",
            reveal:
              "O(RC). Each cell is visited a constant number of times across neighbor checks and marking."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Say the grid is an implicit graph with degree at most four before diving into code."
        }
      },
      {
        id: "topo-order",
        heading: "Topological order sequences directed dependencies",
        paragraphs: [
          "A topological order lists vertices of a directed acyclic graph so every edge u → v has u before v. Course schedules, build systems, and compilation dependencies use this idea. Kahn's algorithm repeatedly peels vertices with indegree zero. DFS finishing times reverse to a topo order when the graph is a DAG.",
          "Cycles make topological order impossible. Kahn detects that when nodes remain with positive indegree. DFS detects a back edge to a node still on the recursion stack. Interview prompts often ask whether a schedule exists and to return one valid order.",
          "Topo sort is not about distances. It is about respecting precedence. If the prompt mentions prerequisites, think directed edges and indegrees before inventing search heuristics."
        ],
        keyTerms: [
          {
            term: "topological order",
            definition:
              "A linear order of DAG vertices that respects directed edge direction."
          },
          {
            term: "indegree",
            definition:
              "The number of incoming edges to a vertex."
          },
          {
            term: "Kahn's algorithm",
            definition:
              "BFS-style topo sort that repeatedly removes indegree-zero nodes."
          }
        ],
        workedExample: {
          title: "Kahn course order",
          body:
            "Peel courses with all prerequisites satisfied; leftover nodes mean a cycle.",
          code:
            "from collections import deque, defaultdict\n\n\ndef course_order(num_courses, prerequisites):\n    graph = defaultdict(list)\n    indeg = [0] * num_courses\n    for a, b in prerequisites:\n        graph[b].append(a)\n        indeg[a] += 1\n    queue = deque([i for i in range(num_courses) if indeg[i] == 0])\n    order = []\n    while queue:\n        u = queue.popleft()\n        order.append(u)\n        for v in graph[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0:\n                queue.append(v)\n    return order if len(order) == num_courses else []\n\n\nprint(course_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]))\nprint(course_order(2, [[0, 1], [1, 0]]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "How does Kahn's algorithm detect a cycle?",
            reveal:
              "If the output order contains fewer than V vertices, remaining vertices still have positive indegree and participate in a cycle."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Do not run undirected connected-component logic on prerequisite graphs; direction and cycles change the meaning."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Define carried state and visited rules before writing traversal code.",
        "Adjacency representation determines both memory and asymptotic bounds.",
        "Queue, stack, and priority queue frontiers encode BFS, DFS, and Dijkstra policies.",
        "Components and islands are reachability with different costumes.",
        "Topological order sequences DAG dependencies and fails when cycles exist."
      ],
      nextSteps: [
        "Implement BFS path reconstruction on a small undirected graph.",
        "Convert a grid prompt into explicit neighbor generation.",
        "Trace Kahn's algorithm on a tiny cyclic prerequisite set."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaConceptsLabChapters = JSON.parse(JSON.stringify(chapters));
