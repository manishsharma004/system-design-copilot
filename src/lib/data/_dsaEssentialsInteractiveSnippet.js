function caseStudy({ title, prompt, steps, metrics }) {
  return {
    title,
    prompt,
    context: prompt,
    steps: steps.map((step, index) => ({
      title: step.title,
      detail: step.detail,
      phase: `${index + 1}. ${step.title}`,
      decision: step.title,
      why: step.detail,
      whatIf: step.whatIf ?? 'Skipping this step makes the design harder to defend because the trade-off stays implicit.'
    })),
    metrics: metrics ?? []
  };
}

/** @type {Record<string, any>} */
export const dsaEssentialsInteractive = {
  'dsa-interview-essentials-lab/tries-and-prefix-decision-trees': {
    title: 'Trie prefix decision lab',
    summary:
      'Choose tries, prefix sets, or sorted-word ranges by matching shared-prefix traversal to the interview workload.',
    takeaways: [
      'A trie node represents a prefix, and a missing edge prunes every longer word under that prefix.',
      'Word Search II style DFS is efficient because the board path and trie prefix advance together.',
      'Static prefix queries may be better served by sorted words and binary search when updates are rare.'
    ],
    examples: [
      {
        id: 'autocomplete-prefix-walk',
        label: 'Autocomplete',
        title: 'Walk once to the prefix node, then collect bounded suggestions',
        scenario:
          'A search box needs suggestions for "sys" from a dictionary with many words sharing system, syntax, and sync prefixes.',
        decision: 'Use a trie when per-keystroke prefix traversal and shared prefixes dominate the workload.',
        why: [
          'The prefix is stored once no matter how many words share it.',
          'The current node after walking the query is the root of all completions.',
          'Top-k metadata can be cached at nodes for ranked product follow-ups.'
        ],
        alternative:
          'For a static dictionary with lexicographic suggestions, sorted words plus lower_bound can be simpler and memory-light.',
        outcome:
          'The answer shows both implementation fluency and a production-aware tradeoff.'
      },
      {
        id: 'board-dfs-prune',
        label: 'Board search',
        title: 'Prune board paths as soon as the trie prefix fails',
        scenario:
          'Find all words from a dictionary on a character board without reusing a cell in one word.',
        decision: 'Walk the board and trie together, marking cells during DFS and restoring them on return.',
        why: [
          'A missing trie edge proves no longer word can be formed from that path.',
          'The trie terminal marker records complete words without losing longer prefixes.',
          'Board restoration keeps sibling paths independent.'
        ],
        alternative:
          'Checking every generated board string against a word set wastes time on prefixes that cannot lead anywhere.',
        outcome:
          'The DFS does less work and has an invariant the interviewer can follow.'
      }
    ],
    decisionGuide: {
      prompt: 'Which prefix structure fits the prompt?',
      options: [
        {
          id: 'trie',
          label: 'Trie / prefix tree',
          bestFor: 'Dynamic dictionaries, autocomplete traversal, shared prefixes, and DFS pruning.',
          chooseWhen: [
            'You advance one character at a time.',
            'Many words share prefixes.',
            'A missing prefix should prune a whole search branch.'
          ],
          tradeOffs: [
            'Node overhead can be high in Python.',
            'Deletion and ranked metadata add implementation detail.',
            'Static lexicographic range queries may not need a trie.'
          ],
          alternativeOutcome:
            'Skipping the trie can repeat the same failed prefix checks across many words or board paths.'
        },
        {
          id: 'sorted-words',
          label: 'Sorted list plus binary search',
          bestFor: 'Static dictionaries, lexicographic prefix ranges, and memory-conscious lookup.',
          chooseWhen: [
            'The word list changes rarely.',
            'Returning contiguous lexicographic suggestions is enough.',
            'Binary search helpers are acceptable.'
          ],
          tradeOffs: [
            'Incremental updates are expensive.',
            'Board DFS still rebuilds candidate strings.',
            'Ranked suggestions need extra indexing.'
          ],
          alternativeOutcome:
            'Using a trie for a tiny static list can add code without improving the interview answer.'
        },
        {
          id: 'prefix-set',
          label: 'Word set plus prefix set',
          bestFor: 'Quick pruning when implementation time is tight and memory is acceptable.',
          chooseWhen: [
            'You only need yes/no prefix existence.',
            'The dictionary is modest in size.',
            'You want to separate word completion from prefix pruning.'
          ],
          tradeOffs: [
            'Every prefix string may be stored separately.',
            'It does not naturally continue traversal to children.',
            'It can hide shared-prefix structure from the explanation.'
          ],
          alternativeOutcome:
            'A prefix set can pass simpler prompts but is harder to extend to autocomplete collection.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design dictionary search for an interview IDE',
      prompt:
        'A browser-only practice tool needs autocomplete suggestions, exact dictionary checks, and a grid-word exercise using the same word source.',
      steps: [
        {
          title: 'Separate exact word and prefix needs',
          detail: 'Use terminal markers for full words and child edges for prefixes so "inter" can be a prefix without being a word.',
          whatIf: 'Conflating prefix existence with word existence returns false positives in exact checks.'
        },
        {
          title: 'Choose trie for board traversal',
          detail: 'Advance trie nodes during DFS so a missing edge stops the board path immediately.',
          whatIf: 'A word set alone discovers failure only after constructing longer candidate strings.'
        },
        {
          title: 'Bound autocomplete output',
          detail: 'Collect at most k completions below the prefix node or store cached ranked suggestions per node.',
          whatIf: 'Returning an entire large subtree can turn a keystroke into a latency spike.'
        },
        {
          title: 'Name static alternatives',
          detail: 'Explain that sorted words plus binary search can be preferred for read-only lexicographic prefix ranges.',
          whatIf: 'Presenting trie as always best makes the design harder to defend under constraints.'
        }
      ],
      metrics: ['dictionary size', 'prefix sharing', 'update rate', 'suggestion limit', 'board dimensions']
    }),
    mermaid: {
      title: 'Prefix structure choice',
      caption: 'Match the prefix workload to the smallest structure that preserves the invariant.',
      code: `flowchart LR
    Prompt[Prefix workload] --> Dynamic{Dynamic or path traversal?}
    Dynamic -->|yes| Trie[Trie]
    Dynamic -->|no| Static{Static lexicographic range?}
    Static -->|yes| Sorted[Sorted words + binary search]
    Static -->|no| PrefixSet[Word set + prefix set]
      `
    }
  },

  'dsa-interview-essentials-lab/monotonic-stacks-and-next-greater': {
    title: 'Monotonic candidate lab',
    summary:
      'Decide when ordered candidate stacks and deques replace ordinary stacks, repeated scans, or heaps.',
    takeaways: [
      'A monotonic stack stores unresolved candidates in increasing or decreasing order.',
      'A monotonic deque adds front expiration for sliding windows.',
      'Amortized O(n) comes from pushing each index once and popping it at most once.'
    ],
    examples: [
      {
        id: 'next-greater-candidates',
        label: 'Next greater',
        title: 'Pop smaller unresolved candidates when the answer arrives',
        scenario:
          'For each metric sample, report the next later sample that is strictly higher.',
        decision: 'Use a decreasing stack of indices whose next greater value has not appeared yet.',
        why: [
          'The current value resolves every smaller value on top of the stack.',
          'Indices provide both comparison and output position.',
          'Each sample is pushed and popped at most once.'
        ],
        alternative:
          'Scanning rightward from every index is easier to imagine but becomes quadratic.',
        outcome:
          'The solution is linear and the pop condition is tied directly to the prompt.'
      },
      {
        id: 'window-max-deque',
        label: 'Sliding max',
        title: 'Use a deque when old candidates expire from the left',
        scenario:
          'A dashboard needs the maximum request latency over the last k samples after each new sample.',
        decision: 'Keep a decreasing deque of indices, expiring old indices from the front.',
        why: [
          'The front is the best live candidate.',
          'The back removes weaker candidates dominated by the new value.',
          'The front removal handles window age exactly.'
        ],
        alternative:
          'A heap can work with lazy deletion but pays log factors and extra stale-entry handling.',
        outcome:
          'The data structure matches the one-step sliding-window update shape.'
      }
    ],
    decisionGuide: {
      prompt: 'Which structure owns the current candidates?',
      options: [
        {
          id: 'monotonic-stack',
          label: 'Monotonic stack',
          bestFor: 'Next greater, next smaller, daily temperatures, and nearest-boundary prompts.',
          chooseWhen: [
            'Candidates wait for a future item to resolve them.',
            'No left-edge expiration is required.',
            'The prompt asks for next or nearest boundary relationships.'
          ],
          tradeOffs: [
            'You must choose increasing versus decreasing order.',
            'Duplicate strictness affects correctness.',
            'It does not support sliding window expiration from the front.'
          ],
          alternativeOutcome:
            'Using an ordinary stack keeps too much history and loses the order proof.'
        },
        {
          id: 'monotonic-deque',
          label: 'Monotonic deque',
          bestFor: 'Sliding-window maximum or minimum with fixed-size windows.',
          chooseWhen: [
            'Indices expire by age from the left.',
            'New values can dominate older weaker candidates.',
            'Only the current window extreme is needed.'
          ],
          tradeOffs: [
            'The front must be expired before reading.',
            'It is specialized for monotonic window movement.',
            'It does not provide arbitrary deletion by key.'
          ],
          alternativeOutcome:
            'A heap without stale cleanup can return values outside the window.'
        },
        {
          id: 'heap',
          label: 'Heap with lazy cleanup',
          bestFor: 'Priority workloads where active items do not follow a simple sliding window.',
          chooseWhen: [
            'The current extreme is needed but lifetimes are irregular.',
            'Updates or removals require validation against a side map.',
            'O(log n) operations are acceptable.'
          ],
          tradeOffs: [
            'Stale entries accumulate until popped.',
            'The heap is not globally sorted.',
            'Arbitrary priority updates need extra strategy.'
          ],
          alternativeOutcome:
            'For a simple sliding window, heap code is longer and easier to get subtly wrong.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Choose a maximum tracker for product metrics',
      prompt:
        'A metrics service needs next spike alerts, rolling max over the last 60 samples, and highest-priority incident lookup.',
      steps: [
        {
          title: 'Map next spike to stack',
          detail: 'Use a decreasing stack because each new higher sample resolves earlier unresolved lower samples.',
          whatIf: 'Scanning forward per sample repeats work and misses the amortized proof.'
        },
        {
          title: 'Map rolling max to deque',
          detail: 'Use a decreasing deque so expired indices leave from the front and weaker new candidates leave from the back.',
          whatIf: 'Forgetting front expiration can report a maximum outside the active window.'
        },
        {
          title: 'Map incidents to heap',
          detail: 'Use a heap plus a side map when incident closure and priority changes do not follow window order.',
          whatIf: 'A monotonic deque cannot remove arbitrary closed incidents cleanly.'
        },
        {
          title: 'Narrate duplicate and complexity rules',
          detail: 'State strictness for equal values and use push-once-pop-once for the linear stack/deque proof.',
          whatIf: 'Leaving duplicate behavior implicit often fails hidden equal-value cases.'
        }
      ],
      metrics: ['candidate count', 'window size', 'expiration rule', 'priority update rate']
    }),
    mermaid: {
      title: 'Ordered candidate structures',
      caption: 'Expiration shape decides whether stack, deque, or heap is the better fit.',
      code: `flowchart LR
    Need[Need current or next extreme] --> Future{Resolved by future item?}
    Future -->|yes| Stack[Monotonic stack]
    Future -->|no| Window{Fixed sliding window?}
    Window -->|yes| Deque[Monotonic deque]
    Window -->|no| Heap[Heap + cleanup]
      `
    }
  },

  'dsa-interview-essentials-lab/bits-strings-hashing-and-lru-design': {
    title: 'Bits, hashing, and cache design lab',
    summary:
      'Connect small bit tricks, substring fingerprints, and LRU cache invariants to interview prompts and design follow-ups.',
    takeaways: [
      'XOR, masks, and popcount are useful only when the prompt contract matches the bit invariant.',
      'Rolling hashes compare ordered substrings with collision-aware fingerprints.',
      'LRU needs both key lookup and recency ordering to keep get and put O(1).'
    ],
    examples: [
      {
        id: 'xor-contract',
        label: 'Bit trick',
        title: 'Use XOR only when paired cancellation is guaranteed',
        scenario:
          'An OA asks for the one number that appears once when every other number appears exactly twice.',
        decision: 'XOR all values because pairs cancel and the operation is order-independent.',
        why: [
          'x XOR x is zero.',
          'The unique value is the only value not canceled.',
          'The solution uses O(1) extra memory.'
        ],
        alternative:
          'A hash count is more general if frequencies do not match the exact paired contract.',
        outcome:
          'The answer is short, but it is defended by the frequency invariant.'
      },
      {
        id: 'lru-recency',
        label: 'Cache design',
        title: 'Combine a map with a recency list for O(1) LRU',
        scenario:
          'Design a cache where get and put both run in O(1), and capacity overflow evicts the least recently used key.',
        decision: 'Use a hash map from key to doubly linked-list node; move touched nodes to the front.',
        why: [
          'The map finds a key without scanning.',
          'The list removes and reinserts nodes in O(1).',
          'The tail identifies the eviction victim.'
        ],
        alternative:
          'A plain array or list can track order but removing from the middle costs O(n).',
        outcome:
          'The design answer covers behavior, complexity, and eviction policy.'
      }
    ],
    decisionGuide: {
      prompt: 'Which low-level fluency tool fits?',
      options: [
        {
          id: 'bits',
          label: 'Bits and masks',
          bestFor: 'Paired cancellation, small subset state, parity, Hamming distance, and compact DP state.',
          chooseWhen: [
            'The value universe is small or compressible.',
            'The frequency or parity contract is exact.',
            'A hashable compact state helps the algorithm.'
          ],
          tradeOffs: [
            'Bit operations can obscure intent if not narrated.',
            'Large sparse universes need mapping or a set.',
            'Some tricks depend on exact duplicate counts.'
          ],
          alternativeOutcome:
            'Using a bit trick without the matching invariant returns elegant wrong answers.'
        },
        {
          id: 'rolling-hash',
          label: 'Rolling hash',
          bestFor: 'Repeated ordered substring equality, Rabin-Karp search, and pattern fingerprints.',
          chooseWhen: [
            'Order matters, so frequency maps are insufficient.',
            'Many equal-length substring comparisons are needed.',
            'Collision caveats can be handled by verification or double hashing.'
          ],
          tradeOffs: [
            'Collisions are possible with modular hashes.',
            'Index arithmetic is easy to get off by one.',
            'Direct comparison may be simpler for small inputs.'
          ],
          alternativeOutcome:
            'Frequency-window logic can accept anagrams when exact substring equality was required.'
        },
        {
          id: 'lru',
          label: 'LRU cache design',
          bestFor: 'Capacity-bounded caches where recent access predicts future access.',
          chooseWhen: [
            'get and put must be O(1).',
            'Reads refresh recency.',
            'Eviction removes the least recently touched key.'
          ],
          tradeOffs: [
            'Requires two structures kept consistent.',
            'Concurrency needs locking or sharding outside the single-threaded interview default.',
            'LFU or FIFO may fit different access patterns better.'
          ],
          alternativeOutcome:
            'A map alone cannot identify the least recently used key without scanning.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Defend a cache and substring utility under follow-up pressure',
      prompt:
        'An interview follow-up asks for fast substring checks, compact feature-set state, and a bounded local cache of recent answers.',
      steps: [
        {
          title: 'Choose masks for compact feature state',
          detail: 'Map each small feature to a bit position so membership and subset checks stay cheap and hashable.',
          whatIf: 'Using raw sets for tiny fixed universes can be fine, but it misses the compact-state DP angle.'
        },
        {
          title: 'Choose rolling hash for ordered substrings',
          detail: 'Use prefix hashes when many same-length substring equality checks are needed and verify on hash match if required.',
          whatIf: 'Frequency maps ignore order and can confuse anagrams with exact matches.'
        },
        {
          title: 'Choose LRU for recent answer reuse',
          detail: 'Use a map plus recency list and evict from the least-recent end when capacity is exceeded.',
          whatIf: 'A dictionary alone gives lookup but no O(1) eviction victim.'
        },
        {
          title: 'State policy and concurrency assumptions',
          detail: 'Clarify capacity, whether get refreshes recency, and that the interview solution assumes single-threaded mutation.',
          whatIf: 'Skipping assumptions invites follow-ups that sound like correctness bugs.'
        }
      ],
      metrics: ['state universe size', 'substring query count', 'cache capacity', 'read/write ratio']
    }),
    mermaid: {
      title: 'Low-level fluency choices',
      caption: 'The prompt contract decides whether bits, rolling hash, or cache design is central.',
      code: `flowchart LR
    Prompt[Interview prompt] --> State{Small fixed state?}
    State -->|yes| Bits[Bitmask / XOR / popcount]
    State -->|no| String{Ordered substring equality?}
    String -->|yes| Hash[Rolling hash]
    String -->|no| Cache{Capacity eviction?}
    Cache -->|yes| LRU[Map + recency list]
      `
    }
  }
};
