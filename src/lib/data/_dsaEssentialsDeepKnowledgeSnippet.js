/** @type {(...paragraphs: string[]) => string} */
const teachingBody = (...paragraphs) => paragraphs.join('\n\n');

/** @type {Record<string, import('./lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const dsaEssentialsDeepKnowledge = {
  'dsa-interview-essentials-lab/tries-and-prefix-decision-trees': {
    insights: [
      {
        heading: 'Prefix nodes are compressed decisions',
        body: teachingBody(
          `A trie is best understood as a decision tree over characters where every node represents the prefix formed by the path from the root. That prefix meaning is what makes insertion, exact lookup, prefix lookup, autocomplete, and DFS pruning share one implementation. The current node is not an arbitrary object; it is the proof that the prefix read so far exists.`,
          `This framing helps in interviews because it explains both speed and correctness. A hash set can answer full-word membership, but it cannot tell you which next characters keep a prefix alive without extra prefix storage. A sorted list can answer static prefix ranges, but it does not naturally advance in lockstep with board DFS. The trie is strongest when the search itself is character-by-character.`
        )
      },
      {
        heading: 'End markers protect prefix versus word semantics',
        body: teachingBody(
          `The most common trie bug is treating a reachable prefix as a complete word. "app" and "apple" may share a path, but "appl" is only a prefix unless the node has an end marker. A correct implementation separates edge existence from terminal membership: child links answer "can this prefix continue?" and an end marker answers "was this exact word inserted?"`,
          `That separation also matters during board-search prompts. Finding a terminal marker records a word, but traversal may continue because longer words can extend the same prefix. Removing or nulling the terminal marker after recording avoids duplicate outputs while preserving child edges needed by longer matches.`
        )
      },
      {
        heading: 'DFS pruning is where tries change complexity shape',
        body: teachingBody(
          `In Word Search II style problems, the trie changes the search from "generate paths, then ask whether each string is useful" to "stop as soon as the current path is not a dictionary prefix." The worst-case board search can still be large, but practical search volume drops sharply when dictionaries reject prefixes early. That is the same shared-prefix advantage seen in autocomplete, applied to a two-dimensional traversal.`,
          `The board invariant is just as important as the trie invariant. A cell may be used once in one candidate word, so marking and restoring are part of correctness. If the code forgets to restore, sibling paths see a corrupted board; if it forgets to mark, a word can reuse a cell illegally. The trie does not remove the need for DFS discipline.`
        )
      },
      {
        heading: 'Static alternatives can be better than a trie',
        body: teachingBody(
          `A senior interview answer names when not to use a trie. If the dictionary is static, small, and the task is lexicographic prefix retrieval, sorted words plus binary search can be simpler and more memory-efficient. If the task only needs yes/no prefix pruning for a modest dictionary, a prefix set may be acceptable even though it duplicates prefix strings.`,
          `The deciding questions are update rate, prefix sharing, result ordering, memory budget, and traversal shape. Dynamic insertions and board DFS favor tries. Static range queries favor sorted arrays. Ranked autocomplete may start from a trie but add per-node top-k metadata. These tradeoffs show design fluency beyond the coding template.`
        )
      }
    ],
    references: [
      {
        title: 'Trie',
        url: 'https://en.wikipedia.org/wiki/Trie',
        source: 'Wikipedia',
        note: 'General reference on prefix trees, lookup, insertion, and memory tradeoffs.'
      },
      {
        title: 'bisect - Array bisection algorithm',
        url: 'https://docs.python.org/3/library/bisect.html',
        source: 'Python Documentation',
        note: 'Useful for comparing tries with sorted-list prefix range lookups.'
      },
      {
        title: 'String Hashing',
        url: 'https://cp-algorithms.com/string/string-hashing.html',
        source: 'CP-Algorithms',
        note: 'Helpful contrast for substring and prefix fingerprint approaches outside trie traversal.'
      }
    ]
  },

  'dsa-interview-essentials-lab/monotonic-stacks-and-next-greater': {
    insights: [
      {
        heading: 'Monotonic structures keep only live candidates',
        body: teachingBody(
          `The key idea behind monotonic stacks and deques is candidate elimination. The structure is not storing all prior values; it stores only values that can still become an answer under the prompt's ordering rule. In next-greater problems, a newly seen larger value resolves smaller unresolved values. In sliding maxima, a newly seen larger value makes older smaller values useless for all future windows where both are present.`,
          `This candidate language makes the implementation easier to defend. Every pop has a reason tied to the prompt: resolved, dominated, or expired. Without that reason, the code is just a memorized while loop and tends to fail on duplicates, boundaries, or follow-up variants.`
        )
      },
      {
        heading: 'Amortized linear time is a push-pop accounting proof',
        body: teachingBody(
          `The nested while loops in monotonic algorithms often look suspiciously quadratic. The proof is accounting: each index is pushed once and can be popped at most once. A single iteration may pop many items, but those items will never be popped again. Across the whole input, total stack or deque operations are linear.`,
          `Interviewers like this proof because it is short and robust. It also explains why storing indices is standard: one index carries value comparison, output position, and expiration age. Values alone usually lose at least one of those responsibilities.`
        )
      },
      {
        heading: 'Stack versus deque is about expiration direction',
        body: teachingBody(
          `A monotonic stack is enough when candidates only leave because a future value resolves them or a boundary is discovered. A monotonic deque is needed when candidates can also expire from the left side of a moving window. That front-removal operation is the structural difference between daily temperatures and sliding-window maximum.`,
          `A heap is a different answer again. It exposes a current extreme but does not naturally know which entries have expired or been superseded unless you add lazy deletion. That makes heaps appropriate for irregular active sets, while deques are ideal for regular one-step windows. Choosing between these structures is often the real onsite follow-up.`
        )
      },
      {
        heading: 'Comparison strictness encodes duplicate semantics',
        body: teachingBody(
          `Small comparison choices are correctness choices. For next greater element, equal values usually do not resolve each other, so the pop condition is values[top] < current. For next greater or equal, it becomes <=. For sliding-window maximum, popping <= from the back is common because a newer equal value dominates an older equal value by expiring later.`,
          `State this before coding when duplicates are possible. It shows that the invariant is not just "keep it decreasing" but "keep exactly the candidates that can still produce the prompt's required answer." Duplicate behavior is one of the easiest places for hidden tests to expose a shallow template.`
        )
      }
    ],
    references: [
      {
        title: 'Stack (abstract data type)',
        url: 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)',
        source: 'Wikipedia',
        note: 'Background on stack behavior before adding monotonic candidate invariants.'
      },
      {
        title: 'collections - deque objects',
        url: 'https://docs.python.org/3/library/collections.html#collections.deque',
        source: 'Python Documentation',
        note: 'Python stdlib reference for efficient double-ended queue operations.'
      },
      {
        title: 'Minimum Stack / Minimum Queue',
        url: 'https://cp-algorithms.com/data_structures/stack_queue_modification.html',
        source: 'CP-Algorithms',
        note: 'Competitive-programming reference for modified stacks and queues that maintain extrema.'
      }
    ]
  },

  'dsa-interview-essentials-lab/bits-strings-hashing-and-lru-design': {
    insights: [
      {
        heading: 'Bit tricks are contracts, not magic',
        body: teachingBody(
          `XOR cancellation, masks, and popcount are compact because they rely on exact algebraic contracts. XOR finds one unpaired value only when every other value appears exactly twice. A mask represents a set only after every item has a stable bit position. Hamming distance is popcount of XOR because XOR marks exactly the differing bit positions.`,
          `The interview skill is naming the contract before using the trick. If duplicates appear three times, if there are two unique values, or if the universe is too large to map cleanly, the bit solution must change. A hash map or count array may be less elegant but more correct for the altered contract.`
        )
      },
      {
        heading: 'Bitmasks turn small sets into hashable state',
        body: teachingBody(
          `Bitmasks are especially useful in dynamic programming and search because they compress membership into one integer. That integer can be used as a dictionary key, compared quickly, and updated with simple OR, AND, and XOR operations. For small subsets, visited-node states, feature flags, and parity masks, this can make the state space easier to reason about.`,
          `The hidden cost is the item-to-bit mapping. For lowercase letters the mapping is obvious. For arbitrary labels, you must assign compact indices first. If the number of distinct labels can grow large, a Python set may be clearer and less error-prone even if it is less compact.`
        )
      },
      {
        heading: 'Rolling hash trades certainty for reusable substring fingerprints',
        body: teachingBody(
          `Rabin-Karp style hashing is useful when order matters and many substring comparisons would otherwise repeat character-by-character work. Prefix hashes let you compute a substring fingerprint by subtracting the hash contribution before the substring and scaling by a precomputed power. This turns repeated equality checks into arithmetic.`,
          `The tradeoff is collisions. A modular hash match is evidence, not proof, unless you verify the substring or use a deterministic structure. In interviews, this caveat matters. It is acceptable to say "I verify on hash match" or "I would double hash if probabilistic equality is acceptable." That statement prevents the algorithm from promising more than it guarantees.`
        )
      },
      {
        heading: 'LRU is two synchronized invariants',
        body: teachingBody(
          `An LRU cache needs fast lookup and fast recency mutation. The hash map invariant is that every key maps to exactly one live node. The list invariant is that nodes are ordered from most recently used to least recently used. get and put both may move nodes, so reads are mutations in LRU semantics. Eviction removes the tail node and deletes the corresponding map entry.`,
          `This design is also a compact system-design conversation. Capacity must be explicit. Updating an existing key should define whether recency refreshes. The single-threaded interview version avoids locks, but a production cache needs concurrency control because get mutates recency state. LFU and FIFO are not harder or easier by default; they serve different access patterns.`
        )
      }
    ],
    references: [
      {
        title: 'Bit manipulation',
        url: 'https://en.wikipedia.org/wiki/Bit_manipulation',
        source: 'Wikipedia',
        note: 'General reference for bit operations, masks, and low-level integer manipulation.'
      },
      {
        title: 'Rabin-Karp algorithm',
        url: 'https://en.wikipedia.org/wiki/Rabin%E2%80%93Karp_algorithm',
        source: 'Wikipedia',
        note: 'Background on rolling hashes for substring search and collision behavior.'
      },
      {
        title: 'OrderedDict objects',
        url: 'https://docs.python.org/3/library/collections.html#ordereddict-objects',
        source: 'Python Documentation',
        note: 'Python stdlib reference for recency-order operations useful in LRU cache implementations.'
      }
    ]
  }
};
