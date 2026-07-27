const chapters = {
  "dsa-search-lab/sliding-window-and-substring-invariants": {
    title: "Chapter: Sliding window and substring invariants",
    readingTime: "80-100 min",
    premise:
      "Sliding windows work when a contiguous segment's validity can be maintained with local updates. This chapter covers fixed and variable windows, frequency maps, at-most-K transforms, and minimum covers.",
    parts: [
      {
        id: "fixed-window",
        heading: "Fixed windows update by swapping the edges",
        paragraphs: [
          "A fixed-length window of size k enters and leaves exactly one element per step after initialization. Maintain the sum or other aggregate by subtracting the outgoing value and adding the incoming value. That yields O(n) after the first window instead of O(nk) rescans.",
          "Fixed windows fit maximum average subarrays, k-length anagram checks, and other prompts where length is part of the input. If length varies, you need a different invariant.",
          "Initialize carefully for the first k elements, then slide. Off-by-one errors appear when the outgoing index is wrong."
        ],
        keyTerms: [
          {
            term: "fixed window",
            definition:
              "A contiguous segment whose length stays constant while it slides."
          },
          {
            term: "edge update",
            definition:
              "Adjusting aggregates by the single entering and leaving elements."
          },
          {
            term: "window aggregate",
            definition:
              "A maintained summary such as sum, max frequency, or deficit count."
          }
        ],
        workedExample: {
          title: "Maximum sum of a fixed-length subarray",
          body:
            "One subtract and one add advance the window in constant time.",
          code:
            "def max_sum_subarray(nums, k):\n    if k > len(nums) or k <= 0:\n        return 0\n    window = sum(nums[:k])\n    best = window\n    for i in range(k, len(nums)):\n        window += nums[i] - nums[i - k]\n        best = max(best, window)\n    return best\n\n\nprint(max_sum_subarray([2, 1, 5, 1, 3, 2], 3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What is the time complexity of the sliding sum?",
            reveal:
              "O(n): each index enters and leaves the window at most once after the O(k) initial sum."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If k is fixed, ask whether an O(1) edge update exists before writing nested loops."
        }
      },
      {
        id: "variable-window",
        heading: "Variable windows shrink until the invariant recovers",
        paragraphs: [
          "Variable windows grow the right pointer freely and shrink the left pointer while the window is invalid or while a better answer might exist. The invariant might be: at most one duplicate, at most K distinct, or all required characters covered.",
          "Each pointer only moves forward, so total movement is O(n) times the cost of updating state. Frequency maps make validity checks O(1) or O(alphabet).",
          "Know when a window is illegal. Shrinking without a clear stop condition either loops or yields wrong maxima/minima."
        ],
        keyTerms: [
          {
            term: "variable window",
            definition:
              "A segment whose left and right bounds both move based on validity."
          },
          {
            term: "grow/shrink",
            definition:
              "The two phases of expanding right and contracting left under an invariant."
          },
          {
            term: "two-pointer window",
            definition:
              "Using left and right indices to represent the current contiguous candidate."
          }
        ],
        workedExample: {
          title: "Longest substring without repeated characters",
          body:
            "Last-seen indices jump left forward past duplicates.",
          code:
            "def length_of_longest_substring(s):\n    last = {}\n    left = 0\n    best = 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\n\nprint(length_of_longest_substring('abcabcbb'))\nprint(length_of_longest_substring('bbbbb'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why check last[ch] >= left before moving left?",
            reveal:
              "An older occurrence outside the current window should not affect the invariant. Only duplicates inside [left, right] matter."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "State the invariant in words: the window always contains unique characters."
        }
      },
      {
        id: "frequency-maps",
        heading: "Frequency maps turn validity into counters",
        paragraphs: [
          "Anagram and coverage problems track how many counts match a target. Entering a character updates need or deficit; leaving reverses the update. A single missing counter can tell whether the window is currently valid.",
          "Find-all-anagrams uses a fixed window of pattern length with a frequency match counter. Minimum windows use variable length and record answers only when valid.",
          "Alphabet size often makes maps effectively O(1). For general hashable tokens, maps are O(1) expected per update."
        ],
        keyTerms: [
          {
            term: "need map",
            definition:
              "Target frequencies required inside a valid window."
          },
          {
            term: "deficit",
            definition:
              "How many required character occurrences are still missing."
          },
          {
            term: "match counter",
            definition:
              "A compact tally of how many character requirements are currently satisfied."
          }
        ],
        workedExample: {
          title: "Find anagram start indices",
          body:
            "A fixed window keeps a running balance against the pattern counts.",
          code:
            "from collections import Counter\n\n\ndef find_anagrams(s, p):\n    need = Counter(p)\n    window = Counter()\n    matches = 0\n    required = len(need)\n    out = []\n    left = 0\n    for right, ch in enumerate(s):\n        window[ch] += 1\n        if window[ch] == need[ch]:\n            matches += 1\n        if right - left + 1 > len(p):\n            left_ch = s[left]\n            if window[left_ch] == need[left_ch]:\n                matches -= 1\n            window[left_ch] -= 1\n            left += 1\n        if matches == required and right - left + 1 == len(p):\n            out.append(left)\n    return out\n\n\nprint(find_anagrams('cbaebabacd', 'abc'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When should matches increase?",
            reveal:
              "Only when a character's window count first becomes exactly equal to its needed count—not on every extra occurrence."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Symmetric updates on enter and leave prevent silent drift in match counters."
        }
      },
      {
        id: "at-most-k",
        heading: "At-most-K unlocks exact-K through subtraction",
        paragraphs: [
          "Counting subarrays with exactly K distinct values is awkward directly because expanding and shrinking both change the count in subtle ways. A standard transform counts at-most-K and at-most-(K-1); their difference is exact K.",
          "At-most windows shrink only when distinctness exceeds K. Every right endpoint contributes (right - left + 1) valid subarrays ending there.",
          "This trick appears in binary subarrays with sum K and other exact-constraint counts. Prefer it when exact windows do not move monotonically."
        ],
        keyTerms: [
          {
            term: "at-most-K",
            definition:
              "Windows satisfying a soft upper bound on a resource such as distinct count."
          },
          {
            term: "exact-by-difference",
            definition:
              "Computing exact K as atMost(K) - atMost(K-1)."
          },
          {
            term: "subarrays ending at right",
            definition:
              "The contiguous segments with a fixed right endpoint and left in [left, right]."
          }
        ],
        workedExample: {
          title: "Exactly K distinct via at-most counts",
          body:
            "Difference of two monotone window counters yields the exact answer.",
          code:
            "from collections import defaultdict\n\n\ndef at_most_k_distinct(nums, k):\n    if k < 0:\n        return 0\n    counts = defaultdict(int)\n    left = 0\n    distinct = 0\n    answer = 0\n    for right, value in enumerate(nums):\n        if counts[value] == 0:\n            distinct += 1\n        counts[value] += 1\n        while distinct > k:\n            counts[nums[left]] -= 1\n            if counts[nums[left]] == 0:\n                distinct -= 1\n            left += 1\n        answer += right - left + 1\n    return answer\n\n\ndef exactly_k_distinct(nums, k):\n    return at_most_k_distinct(nums, k) - at_most_k_distinct(nums, k - 1)\n\n\nprint(exactly_k_distinct([1, 2, 1, 2, 3], 2))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does right - left + 1 count subarrays for at-most-K?",
            reveal:
              "With right fixed and the window valid, every left' in [left, right] forms a valid subarray ending at right."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Mention the at-most transform early; it shows pattern maturity on exact-K prompts."
        }
      },
      {
        id: "minimum-cover",
        heading: "Minimum windows record only after validity",
        paragraphs: [
          "Minimum covering substring grows until all needs are met, then shrinks from the left while validity holds, recording best lengths. Updates must never claim a window is valid when deficit remains.",
          "This is the template behind many interview classics. The hard part is bookkeeping, not the idea. Keep need, have/deficit, and best bounds synchronized.",
          "If no valid window exists, return the empty sentinel the prompt specifies. Test sparse matches and duplicate-heavy patterns."
        ],
        keyTerms: [
          {
            term: "covering window",
            definition:
              "A substring that contains at least the required frequencies of needed characters."
          },
          {
            term: "minimum window",
            definition:
              "The shortest covering substring, ties broken by earliest start if required."
          },
          {
            term: "validity gate",
            definition:
              "The condition that must hold before recording or shrinking for optimality."
          }
        ],
        workedExample: {
          title: "Minimum covering substring",
          body:
            "Shrink while the window stays valid; track the best slice.",
          code:
            "from collections import Counter\n\n\ndef min_window(s, t):\n    need = Counter(t)\n    missing = len(t)\n    best = (0, float('inf'))\n    left = 0\n    for right, ch in enumerate(s):\n        if need[ch] > 0:\n            missing -= 1\n        need[ch] -= 1\n        while missing == 0:\n            if right - left < best[1] - best[0]:\n                best = (left, right + 1)\n            left_ch = s[left]\n            need[left_ch] += 1\n            if need[left_ch] > 0:\n                missing += 1\n            left += 1\n    return '' if best[1] == float('inf') else s[best[0]:best[1]]\n\n\nprint(min_window('ADOBECODEBANC', 'ABC'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What does need[ch] > 0 mean during the shrink phase?",
            reveal:
              "After restoring a character, a positive need means the window lost a required occurrence and is no longer covering."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Record the answer before the shrink step that breaks validity."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Fixed windows slide with constant-time edge updates.",
        "Variable windows grow and shrink under an explicit invariant.",
        "Frequency maps make validity an O(1)-style counter problem.",
        "Exact-K often equals atMost(K) - atMost(K-1).",
        "Minimum covers record only while the window remains valid."
      ],
      nextSteps: [
        "Implement longest repeating character replacement with a window max-frequency invariant.",
        "Count exact-sum binary subarrays using the at-most transform.",
        "Trace min_window on a short string with duplicate needs."
      ]
    }
  },

  "dsa-search-lab/heaps-topk-and-priority-queues": {
    title: "Chapter: Heaps, top-k, and priority queues",
    readingTime: "75-95 min",
    premise:
      "Heaps give fast access to one extreme without fully sorting. This chapter covers heapq mechanics, top-k patterns, multi-pointer merges, Dijkstra frontiers, and when to prefer sorting.",
    parts: [
      {
        id: "heap-basics",
        heading: "A heap exports one extreme, not full order",
        paragraphs: [
          "A binary heap supports push and pop-extreme in O(log n) and peek in O(1). It does not give sorted order of all elements cheaply—that still costs O(n log n). Python's heapq is a min-heap; simulate max-heap with negated keys or custom tuples.",
          "Use heaps when you repeatedly need the current minimum or maximum under inserts and deletes. If you need only one final sort, sorting may be simpler and faster in practice.",
          "Tuple priorities must put the compared fields first. Tie-breakers belong in later tuple slots intentionally."
        ],
        keyTerms: [
          {
            term: "binary heap",
            definition:
              "A complete binary tree satisfying the heap order property on keys."
          },
          {
            term: "priority queue",
            definition:
              "An ADT that serves the highest-priority pending element next."
          },
          {
            term: "heapq",
            definition:
              "Python's standard min-heap library operating on lists."
          }
        ],
        workedExample: {
          title: "Priority queue basics with heapq",
          body:
            "Smallest key surfaces first; push and pop reshuffle in log time.",
          code:
            "import heapq\n\nheap = []\nfor value in [5, 1, 4, 2]:\n    heapq.heappush(heap, value)\nwhile heap:\n    print(heapq.heappop(heap), end=' ')\nprint()",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Does iterating a heap list yield sorted order?",
            reveal:
              "No. The list satisfies heap order, not sorted order. Only repeated heappop yields sorted output."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "For a max-heap of numbers, push -x and remember to negate again on pop."
        }
      },
      {
        id: "top-k",
        heading: "Top-k keeps only candidates that can still win",
        paragraphs: [
          "To find the k largest, keep a min-heap of size k. The heap root is the smallest among current champions. When a new value beats the root, replace it. At the end the heap holds the k largest; the root is the kth largest.",
          "Streaming inputs favor heaps because you never store everything if only k winners matter—unless you need full history for other reasons. Frequency top-k often pairs a counter with a heap of size k.",
          "Sorting everything is O(n log n). Heap top-k is O(n log k). When k is near n, just sort."
        ],
        keyTerms: [
          {
            term: "top-k",
            definition:
              "Selecting the k best elements under an ordering without fully sorting when k << n."
          },
          {
            term: "size-k heap",
            definition:
              "A heap capped at k elements representing current winners."
          },
          {
            term: "kth extreme",
            definition:
              "The boundary winner sitting at the heap root in the size-k pattern."
          }
        ],
        workedExample: {
          title: "Largest k values from a stream",
          body:
            "A min-heap of size k stores champions; root is the kth largest.",
          code:
            "import heapq\n\n\ndef top_k(nums, k):\n    if k <= 0:\n        return []\n    heap = []\n    for value in nums:\n        if len(heap) < k:\n            heapq.heappush(heap, value)\n        elif value > heap[0]:\n            heapq.heapreplace(heap, value)\n    return sorted(heap, reverse=True)\n\n\nprint(top_k([3, 1, 5, 12, 2, 11], 3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is a min-heap used to find the k largest?",
            reveal:
              "The smallest champion is the one most eligible to be evicted when a better candidate arrives."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Compare O(n log k) heap versus O(n log n) sort and pick from k and memory."
        }
      },
      {
        id: "merge-k",
        heading: "Merge K sorted lists through a frontier of heads",
        paragraphs: [
          "Each list contributes its current head into a heap keyed by value. Pop the global minimum, append it, and push that list's next value. The heap size stays O(K) while total work is O(N log K).",
          "This is the multi-pointer generalization of merging two lists. It also models merging K sorted arrays and some external-memory ideas.",
          "Store (value, list_id, index) so ties and progression stay well-defined."
        ],
        keyTerms: [
          {
            term: "frontier of heads",
            definition:
              "The set of current candidate elements, one from each active list."
          },
          {
            term: "multi-way merge",
            definition:
              "Producing one sorted stream from K sorted inputs."
          },
          {
            term: "list identity",
            definition:
              "Metadata in the heap tuple that knows which input to advance."
          }
        ],
        workedExample: {
          title: "Merge K sorted arrays",
          body:
            "Heap entries carry array id and index to fetch the successor.",
          code:
            "import heapq\n\n\ndef merge_k(arrays):\n    heap = []\n    for i, arr in enumerate(arrays):\n        if arr:\n            heapq.heappush(heap, (arr[0], i, 0))\n    out = []\n    while heap:\n        value, i, j = heapq.heappop(heap)\n        out.append(value)\n        if j + 1 < len(arrays[i]):\n            heapq.heappush(heap, (arrays[i][j + 1], i, j + 1))\n    return out\n\n\nprint(merge_k([[1, 4, 7], [2, 5], [3, 6, 8]]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What is the heap size during multi-way merge?",
            reveal:
              "At most K entries—one current head per nonempty input—so each pop/push costs O(log K)."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If K is 2, a linear two-pointer merge is simpler than a heap."
        }
      },
      {
        id: "dijkstra-frontier",
        heading: "Dijkstra is a priority frontier with relaxation",
        paragraphs: [
          "Shortest paths with non-negative weights use a min-heap of tentative distances. Popping the smallest unsettled distance finalizes it; relaxing neighbors may push improved distances. Lazy heaps skip stale pops.",
          "Seeing Dijkstra as another heap consumer connects this lesson to graph algorithms. The heap is policy: always expand the closest frontier node.",
          "Tie-breaking rarely matters for distances but can matter for lexicographic path preferences—encode it in tuples if required."
        ],
        keyTerms: [
          {
            term: "priority frontier",
            definition:
              "A heap-ordered set of candidates waiting for expansion."
          },
          {
            term: "relaxation",
            definition:
              "Improving a neighbor distance through a popped node."
          },
          {
            term: "lazy deletion",
            definition:
              "Leaving obsolete heap entries and ignoring them when popped."
          }
        ],
        workedExample: {
          title: "Small Dijkstra with heapq",
          body:
            "Stale distances are skipped when they disagree with dist[].",
          code:
            "import heapq\nfrom collections import defaultdict\n\n\ndef dijkstra(n, edges, src):\n    graph = defaultdict(list)\n    for u, v, w in edges:\n        graph[u].append((v, w))\n    dist = [float('inf')] * n\n    dist[src] = 0\n    heap = [(0, src)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d != dist[u]:\n            continue\n        for v, w in graph[u]:\n            nd = d + w\n            if nd < dist[v]:\n                dist[v] = nd\n                heapq.heappush(heap, (nd, v))\n    return dist\n\n\nprint(dijkstra(3, [(0, 1, 2), (0, 2, 5), (1, 2, 1)], 0))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why might the same vertex appear multiple times in the heap?",
            reveal:
              "Each improvement pushes a new entry. Older larger distances remain until popped and skipped."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Connect heap top-k and Dijkstra: both repeatedly extract the current best candidate."
        }
      },
      {
        id: "heap-vs-sort",
        heading: "Choose heap, sort, or two heaps intentionally",
        paragraphs: [
          "Sort when you need full order or k is large. Heap when streaming or k is small. Two heaps can track medians online. For sliding-window maximum, a monotonic deque often beats a heap.",
          "Changing priorities is awkward in binary heaps; lazy deletion or rebuilds are common. If decrease-key is central and frequent, mention specialized structures as a systems follow-up.",
          "Narrate the update shape: static batch, streaming, many decrease-keys, or windowed maxima. The shape picks the tool."
        ],
        keyTerms: [
          {
            term: "streaming",
            definition:
              "Processing elements online without storing the entire history when possible."
          },
          {
            term: "dual heap",
            definition:
              "Two heaps cooperating, as in median maintenance."
          },
          {
            term: "update shape",
            definition:
              "The pattern of inserts, deletes, and priority changes in the workload."
          }
        ],
        workedExample: {
          title: "Kth largest in a stream",
          body:
            "A size-k min-heap tracks the kth largest after each add.",
          code:
            "import heapq\n\n\nclass KthLargest:\n    def __init__(self, k, nums):\n        self.k = k\n        self.heap = []\n        for value in nums:\n            self.add(value)\n\n    def add(self, val):\n        if len(self.heap) < self.k:\n            heapq.heappush(self.heap, val)\n        elif val > self.heap[0]:\n            heapq.heapreplace(self.heap, val)\n        return self.heap[0]\n\n\nstream = KthLargest(3, [4, 5, 8, 2])\nprint(stream.add(3), stream.add(5), stream.add(10), stream.add(9))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When is sorting better than a size-k heap?",
            reveal:
              "When k is comparable to n, when you need fully sorted output, or when a single batch sort is simpler and fast enough."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Do not use a heap for sliding-window maximum if a deque O(n) solution fits—know both."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Heaps expose one extreme efficiently without full sorts.",
        "Top-k patterns keep a size-k boundary heap.",
        "Multi-way merge stores K heads in a heap.",
        "Dijkstra reuses the same extract-min policy on distances.",
        "Update shape decides among heap, sort, and deque."
      ],
      nextSteps: [
        "Implement top-k frequent words with counts and a heap.",
        "Merge three sorted arrays and tally heap operations.",
        "Explain lazy deletion for a priority that can improve twice."
      ]
    }
  },

  "dsa-search-lab/recursion-backtracking-and-pruning": {
    title: "Chapter: Recursion, backtracking, and pruning",
    readingTime: "80-100 min",
    premise:
      "Backtracking searches a decision tree: choose, recurse, undo. This chapter covers subsets, permutations, combinations, sound pruning, and when memoization takes over.",
    parts: [
      {
        id: "decision-tree",
        heading: "Recursion mirrors a decision tree",
        paragraphs: [
          "Each recursive call represents a node in a tree of partial choices. Subsets decide include/exclude for each index. Permutations choose the next unused element. Combinations choose the next number with a nondecreasing start index to avoid duplicates.",
          "Drawing the tree for n = 3 clarifies complexity: 2^n subset leaves, n! permutation leaves. Interview narration should name the branching factor and depth before coding.",
          "Base cases harvest complete answers. Partial states live in a shared path buffer that grows and shrinks."
        ],
        keyTerms: [
          {
            term: "decision tree",
            definition:
              "The conceptual tree of partial assignments explored by recursion."
          },
          {
            term: "branching factor",
            definition:
              "How many choices expand from a typical node."
          },
          {
            term: "path buffer",
            definition:
              "The mutable list representing the current partial solution."
          }
        ],
        workedExample: {
          title: "Generate subsets with include/exclude",
          body:
            "At each index, explore both taking and skipping the element.",
          code:
            "def subsets(nums):\n    out = []\n    path = []\n\n    def dfs(i):\n        if i == len(nums):\n            out.append(path[:])\n            return\n        path.append(nums[i])\n        dfs(i + 1)\n        path.pop()\n        dfs(i + 1)\n\n    dfs(0)\n    return out\n\n\nprint(subsets([1, 2, 3]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why append path[:] instead of path?",
            reveal:
              "path is reused and mutated. Copying snapshots the current subset; storing the reference would alias later changes."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Estimate leaves before coding: if n! is huge under constraints, you need pruning or a different approach."
        }
      },
      {
        id: "choose-undo",
        heading: "Backtracking is choose, recurse, undo",
        paragraphs: [
          "The mechanical rhythm is append or mark, recurse, then pop or unmark. Forgetting undo corrupts sibling branches. Used arrays for permutations and boolean boards for grid paths follow the same rhythm.",
          "Immutably copying path on every call works but costs more. Prefer mutate-and-undo for interview speed with clear discipline.",
          "Order of choices affects output order but not the set of solutions if the tree is exhaustive and duplicate-free."
        ],
        keyTerms: [
          {
            term: "backtracking",
            definition:
              "Depth-first search of partial solutions with undo after exploring a branch."
          },
          {
            term: "used mark",
            definition:
              "A flag showing an element is already in the current permutation path."
          },
          {
            term: "undo",
            definition:
              "Reverting a choice so sibling branches see a clean state."
          }
        ],
        workedExample: {
          title: "Permutations with used flags",
          body:
            "Mark on choose, clear on undo; collect when path is full.",
          code:
            "def permute(nums):\n    out = []\n    path = []\n    used = [False] * len(nums)\n\n    def dfs():\n        if len(path) == len(nums):\n            out.append(path[:])\n            return\n        for i, value in enumerate(nums):\n            if used[i]:\n                continue\n            used[i] = True\n            path.append(value)\n            dfs()\n            path.pop()\n            used[i] = False\n\n    dfs()\n    return out\n\n\nprint(permute([1, 2, 3]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What happens if you forget used[i] = False?",
            reveal:
              "Later siblings think the element is still taken, so many permutations never generate."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Every choose must have a matching undo on the same control-flow path, including early continues."
        }
      },
      {
        id: "combinations",
        heading: "Combinations avoid duplicates with start indices",
        paragraphs: [
          "Combinations choose k elements where order does not matter. Passing start forces the next pick to be at least start, generating combinations in nondecreasing index order and preventing permutations of the same set.",
          "With duplicate values in the input, skip equal neighbors at the same depth after sorting. That prunes duplicate combination paths.",
          "Combination-sum variants reuse the same index when unlimited copies are allowed, or advance when each element is one-time."
        ],
        keyTerms: [
          {
            term: "combination",
            definition:
              "A selection of elements where order does not matter."
          },
          {
            term: "start index",
            definition:
              "The lower bound on the next index to pick, enforcing uniqueness of sets."
          },
          {
            term: "duplicate skipping",
            definition:
              "After sorting, skipping equal values at one depth to avoid identical paths."
          }
        ],
        workedExample: {
          title: "Choose k combinations",
          body:
            "DFS picks the next number from start..n without regard to order variants.",
          code:
            "def combine(n, k):\n    out = []\n    path = []\n\n    def dfs(start):\n        if len(path) == k:\n            out.append(path[:])\n            return\n        for value in range(start, n + 1):\n            path.append(value)\n            dfs(value + 1)\n            path.pop()\n\n    dfs(1)\n    return out\n\n\nprint(combine(4, 2))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why call dfs(value + 1) instead of dfs(start + 1)?",
            reveal:
              "You must advance past the value you just chose. Using start + 1 would ignore larger gaps and generate wrong sets."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Say whether order matters. That single sentence picks permutations versus combinations."
        }
      },
      {
        id: "pruning",
        heading: "Pruning must be sound, not hopeful",
        paragraphs: [
          "Pruning cuts a branch only when it cannot lead to a valid answer. Remaining capacity too small, path sum already exceeding target, or a partial board violating constraints are sound. Cutting because a branch looks ugly is unsound and can drop solutions.",
          "Constraint order matters: apply cheap filters before expensive recursion. Place the strongest cuts high in the tree when safe.",
          "N-queens, sudoku, and word search live on pruning quality. Explain why a cut is legal in one sentence."
        ],
        keyTerms: [
          {
            term: "pruning",
            definition:
              "Skipping branches that cannot produce a valid complete solution."
          },
          {
            term: "sound cut",
            definition:
              "A prune that never eliminates a feasible solution."
          },
          {
            term: "constraint propagation",
            definition:
              "Updating domain limits after a choice to enable earlier cuts."
          }
        ],
        workedExample: {
          title: "Combination sum with capacity pruning",
          body:
            "Sort candidates and stop when the next value exceeds remaining target.",
          code:
            "def combination_sum(candidates, target):\n    candidates = sorted(candidates)\n    out = []\n    path = []\n\n    def dfs(start, rest):\n        if rest == 0:\n            out.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            value = candidates[i]\n            if value > rest:\n                break\n            path.append(value)\n            dfs(i, rest - value)\n            path.pop()\n\n    dfs(0, target)\n    return out\n\n\nprint(combination_sum([2, 3, 6, 7], 7))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is breaking after value > rest safe once sorted?",
            reveal:
              "Later candidates are at least as large, so they also exceed rest and cannot complete the sum."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If asked how to speed backtracking, describe a sound prune with a correctness sentence."
        }
      },
      {
        id: "memo-handoff",
        heading: "Memoization starts when states overlap",
        paragraphs: [
          "Pure backtracking enumerates solutions. When you only need a count or optimal value and subproblems repeat, memoize on the state that matters—index plus remaining capacity, mask of used elements, position plus constraints.",
          "If the output is an exhaustive list of solutions, memoization rarely helps the enumeration itself. It helps decision problems and DP-flavored counts.",
          "Interview narration: start with the tree, add pruning, then say which overlapping state would turn this into DP if the prompt asked for a number instead of all lists."
        ],
        keyTerms: [
          {
            term: "overlapping state",
            definition:
              "A subproblem identity that recurs through multiple paths."
          },
          {
            term: "memoized DFS",
            definition:
              "Depth-first recursion caching return values by state key."
          },
          {
            term: "enumeration versus optimization",
            definition:
              "Listing all solutions versus computing a count or best score."
          }
        ],
        workedExample: {
          title: "Memoized count of combination sums",
          body:
            "State (start, rest) returns number of ways; unlimited reuse of the same coin index.",
          code:
            "def combination_sum_ways(candidates, target):\n    candidates = sorted(candidates)\n    memo = {}\n\n    def dfs(start, rest):\n        if rest == 0:\n            return 1\n        key = (start, rest)\n        if key in memo:\n            return memo[key]\n        ways = 0\n        for i in range(start, len(candidates)):\n            value = candidates[i]\n            if value > rest:\n                break\n            ways += dfs(i, rest - value)\n        memo[key] = ways\n        return ways\n\n    return dfs(0, target)\n\n\nprint(combination_sum_ways([2, 3, 6, 7], 7))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When should you not memoize a backtracking solution that lists all subsets?",
            reveal:
              "Because each path is a distinct output. Caching would not reduce the need to emit exponentially many lists."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "End backtracking talks by naming the DP state you would cache if the question flipped to counting."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Recursion explores a decision tree with measurable branching.",
        "Backtracking rhythm is choose, recurse, undo.",
        "Start indices and sorting prevent combination duplicates.",
        "Pruning must be proven sound.",
        "Memoization helps overlapping decision states, not raw enumeration."
      ],
      nextSteps: [
        "Generate subsets, permutations, and combinations for the same small input.",
        "Add duplicate-skipping to combination sum II style inputs.",
        "Convert a listing solution into a memoized ways counter."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaSearchLabChapters = JSON.parse(JSON.stringify(chapters));
