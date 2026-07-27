/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaCorePatternsChapters = {
  'dsa-core-patterns/sliding-window-prefix-and-interval-style-thinking': {
    title: 'Sliding windows, prefix thinking, and interval-style problems',
    readingTime: '80-100 min',
    premise:
      'Medium screens love live invariants: expand until the constraint breaks, shrink until it holds, or replace repeated range scans with prefix state. This chapter teaches how to define the window or prefix contract first, then practice updating it in a fixed order under time pressure.',
    parts: [
      {
        id: 'window-invariant-first',
        heading: 'Define the window invariant before moving boundaries',
        paragraphs: [
          'A sliding-window problem is a contiguous segment whose validity you can maintain incrementally. The interview move is to name what “valid” means—sum ≤ k, at most k distinct, covering all required characters—before touching pointers. That sentence is the proof that each step is O(1) amortized work.',
          'Variable windows expand right, then shrink left while invalid. Fixed windows slide both ends together. Do not mix the templates. Speak the update order: add right contribution, while invalid remove left contribution, then record the answer. Wrong order creates off-by-ones that pass samples.',
          'Not every substring prompt is a window. If the segment is not contiguous, or validity is not restorable by shrinking from the left, stop and reconsider DP, stacks, or binary search on answer.'
        ],
        keyTerms: [
          {
            term: 'window invariant',
            definition:
              'The property that must hold for the current [left, right] segment to be a candidate answer.'
          },
          {
            term: 'amortized linear scan',
            definition:
              'Each index enters and leaves the window at most once, yielding O(n) total pointer movement.'
          },
          {
            term: 'fixed vs variable window',
            definition:
              'Fixed length moves as a block; variable length expands and shrinks according to a constraint.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Say: “Right only adds; left only removes; I update counts before asking whether the window is valid.”'
        },
        checkYourself: [
          {
            prompt: 'What makes a problem a sliding window instead of brute-force substrings?',
            reveal:
              'A contiguous segment whose feasibility can be maintained with incremental add/remove so you never restart the scan from scratch for every left index.'
          }
        ]
      },
      {
        id: 'counts-and-shrink-rules',
        heading: 'Counts, shrink rules, and answer recording',
        paragraphs: [
          'Most window solutions track a small summary: running sum, frequency map, number of distinct, or how many constraints are satisfied. The shrink rule fires only when the invariant breaks. Record answers either when valid (maximum length) or when you have just restored validity (minimum length)—know which family you are in.',
          'Minimum-window and maximum-window differ in when you update the best. Maximum typically updates after a successful expand while still valid. Minimum typically expands until valid, then shrinks while valid, updating each time. Mixing those timings is a common medium-round failure.',
          'Practice narrating a dry run with a six-character string. If you cannot simulate counts by hand, do not trust the code.'
        ],
        workedExample: {
          title: 'Longest substring with at most k distinct characters',
          body: 'Expand right, shrink while distinct count exceeds k, track best length while valid.',
          code: `from collections import defaultdict

def longest_at_most_k(s, k):
    freq = defaultdict(int)
    left = best = 0
    for right, ch in enumerate(s):
        freq[ch] += 1
        while len(freq) > k:
            freq[s[left]] -= 1
            if freq[s[left]] == 0:
                del freq[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best

print(longest_at_most_k("eceba", 2))  # 3 ("ece")
print(longest_at_most_k("aa", 1))     # 2`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'Delete zero-count keys so “number of distinct” stays equal to len(map).'
        },
        checkYourself: [
          {
            prompt: 'When do you shrink versus expand?',
            reveal:
              'Always expand right each iteration; shrink left only while the invariant is broken (or, for minimum windows, while it remains satisfied and you want the tightest end).'
          }
        ]
      },
      {
        id: 'prefix-sums-and-difference',
        heading: 'Prefix sums and difference arrays for range thinking',
        paragraphs: [
          'Prefix sums turn range-sum queries into two lookups after an O(n) build. Difference arrays spread interval updates into O(1) range increments and a final reconstruct pass. These are not “windows”; they are aggregate-range tools. Choosing the wrong family wastes the round.',
          'Subarray-sum-equals-k style prompts combine prefix sums with a hash map of seen prefixes. That hybrid is a core medium pattern: live map of prefix values, not a sliding contiguous validity constraint.',
          'Narrate complexity carefully: building prefixes is O(n); each query O(1); map-enhanced variants are expected O(n) time and O(n) space.'
        ],
        keyTerms: [
          {
            term: 'prefix sum',
            definition:
              'Array P where P[i] is the sum of the first i elements, enabling range sums as P[r] − P[l].'
          },
          {
            term: 'difference array',
            definition:
              'An array of deltas such that reconstructing the prefix yields bulk-updated values.'
          },
          {
            term: 'prefix frequency map',
            definition:
              'A map from prefix value to count/index used to find complementary earlier prefixes.'
          }
        ],
        workedExample: {
          title: 'Subarray sum equals k via prefixes',
          body: 'Maintain how many prior prefixes equal current_prefix − k; each hit is a valid subarray ending now.',
          code: `from collections import defaultdict

def subarray_sum(nums, k):
    seen = defaultdict(int)
    seen[0] = 1
    prefix = ans = 0
    for x in nums:
        prefix += x
        ans += seen[prefix - k]
        seen[prefix] += 1
    return ans

print(subarray_sum([1, 1, 1], 2))  # 2
print(subarray_sum([1, 2, 3], 3))  # 2`,
          language: 'python'
        },
        callout: {
          tone: 'warning',
          body:
            'Initialize seen[0] = 1 so subarrays that start at index 0 are counted.'
        },
        checkYourself: [
          {
            prompt: 'When should you switch from window to prefix thinking?',
            reveal:
              'When the question asks about aggregate ranges or non-constraint-driven subarrays (sums, XOR, counts) rather than a live contiguous feasibility region you can shrink monotonically.'
          }
        ]
      },
      {
        id: 'intervals-merge-and-schedule',
        heading: 'Intervals: merge, overlap, and scheduling keys',
        paragraphs: [
          'Interval problems start by sorting. Merge overlaps by sorting on start and extending the current end. Scheduling maximum non-overlapping intervals usually sorts by end time—an exchange argument you should sketch in one sentence.',
          'Meeting-room style counts use a sweep line: +1 at starts, −1 at ends, sort events with careful tie-breaking. Sweep is interval thinking without a sliding string window.',
          'Practice stating the sort key and why. Wrong keys produce almost-right merges that fail one overlapping case.'
        ],
        workedExample: {
          title: 'Merge overlapping intervals',
          body: 'Sort by start; extend the last merged end while the next interval overlaps.',
          code: `def merge(intervals):
    intervals = sorted(intervals)
    out = []
    for start, end in intervals:
        if not out or start > out[-1][1]:
            out.append([start, end])
        else:
            out[-1][1] = max(out[-1][1], end)
    return out

print(merge([[1, 3], [2, 6], [8, 10], [15, 18]]))`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            'For maximum non-overlapping picks: “Sort by end; greedily take the next that starts after the last end.”'
        },
        checkYourself: [
          {
            prompt: 'Why sort by end time for maximum non-overlapping intervals?',
            reveal:
              'The earliest finish frees the timeline soonest; any conflicting choice can be swapped for this one without hurting the remaining count (exchange argument).'
          }
        ]
      },
      {
        id: 'follow-ups-and-constraint-changes',
        heading: 'Follow-ups that change constraints without restarting',
        paragraphs: [
          'Interviewers often tighten “at most k distinct” to “exactly k,” or ask for the minimum window covering a set. Reuse the same count machinery; change only the validity predicate and when you record answers. That reuse is the signal of pattern mastery.',
          'If streaming or memory limits appear, discuss one-pass requirements and what summary you can keep. Do not rewrite from scratch if the invariant still holds.',
          'Timebox practice: twenty-five minutes for a variable window, twenty for a prefix-map variant, twenty for interval merge/sweep. Narrate complexity each time.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Keep a sticky note of validity predicates you have coded. Follow-ups are usually predicate edits.'
        },
        checkYourself: [
          {
            prompt: 'How do you adapt an at-most-k window to exactly-k?',
            reveal:
              'Track the same frequencies; count windows where distinct == k, often by computing at-most-k minus at-most-(k−1), or by adjusting the shrink/record rule carefully.'
          }
        ]
      },
      {
        id: 'practice-transfer-windows',
        heading: 'Transfer into company and mock rounds',
        paragraphs: [
          'Meta-shaped and mixed big-tech sets lean heavily on windows and hashing. Amazon OAs often include one clean window. Google may ask you to prove the amortized bound. Practice saying “each index moves at most once” until it is automatic.',
          'Log failures separately: wrong family (prefix vs window), wrong record timing (min vs max), map hygiene (zero counts). Those three cover most misses.',
          'When windows feel boring, you are ready—boredom here is fluency. Move to backtracking next while keeping one window drill per week for maintenance.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Closing line: “Time O(n) because left and right each advance at most n times; space O(Σ) for the alphabet or distinct keys.”'
        },
        checkYourself: [
          {
            prompt: 'What three failure modes should you audit after a window miss?',
            reveal:
              'Chose the wrong family, recorded the answer at the wrong validity moment, or corrupted the summary structure (counts/map) on shrink.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Name the window invariant and update order before coding.',
        'Prefix maps solve aggregate subarray questions windows cannot.',
        'Interval problems live or die on the sort key and sweep rules.',
        'Follow-ups should edit predicates, not throw away the template.'
      ],
      nextSteps: [
        'Implement at-most-k distinct, subarray-sum-k, and merge-intervals from memory.',
        'Narrate an amortized O(n) proof on a whiteboard or paper.',
        'Convert one maximum-window solution into a minimum-window cousin.'
      ]
    }
  },

  'dsa-core-patterns/recursion-backtracking-and-search-trees': {
    title: 'Recursion, backtracking, and search trees',
    readingTime: '75-95 min',
    premise:
      'Backtracking rounds score structure: choose, explore, undo, prune. This chapter trains you to draw the decision tree, write base cases and undo steps first, and escalate to memoization only when overlapping states appear—then practice that discipline under interview timing.',
    parts: [
      {
        id: 'choose-explore-undo',
        heading: 'Choose, explore, undo—write undo before expanding',
        paragraphs: [
          'Backtracking is DFS over a decision tree with explicit mutation of a partial solution. The template is universal: choose a candidate, recurse, undo the choice so siblings see a clean state. Candidates who forget undo ship corrupted paths that look nondeterministic.',
          'Write the base case and the undo line before you flesh out the loop of choices. That order prevents painting yourself into a corner. Record answers as copies of the partial path; storing references to a mutated list is a classic bug.',
          'Speak the depth and branching factor when stating complexity. Exponential is acceptable when you show pruning and why the tree size is that large. Interviewers prefer honest O(*kⁿ*) with reasoning over fake polynomial claims.'
        ],
        keyTerms: [
          {
            term: 'partial solution',
            definition:
              'The in-progress path, subset, or board assignment being extended by recursion.'
          },
          {
            term: 'undo step',
            definition:
              'The restoration of state after a recursive call returns so the next choice starts clean.'
          },
          {
            term: 'pruning',
            definition:
              'Skipping branches that cannot beat the best or cannot reach a valid completion.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Say the triple aloud: “I append, recurse, pop.” Interviewers listen for the pop.'
        },
        checkYourself: [
          {
            prompt: 'How do you know a recursive choice should be undone?',
            reveal:
              'Whenever the partial structure is shared across sibling calls; without undo, later branches inherit mutations that are not part of their path.'
          }
        ]
      },
      {
        id: 'subsets-perms-and-ordering',
        heading: 'Subsets, permutations, and ordering constraints',
        paragraphs: [
          'Subsets decide include/exclude per index, or build by choosing the next index ≥ last to avoid duplicates. Permutations swap or mark used elements. Combination-sum variants reuse candidates with an index pointer. The decision tree shape changes; the undo discipline does not.',
          'Duplicate inputs need sorted order plus skip rules when the same value would start an identical branch. Draw why the skip is safe before coding it.',
          'Order choices so pruning fires early: try promising or constraining moves first. On boards, fail-fast checks (row/col/diag) beat deep searches into illegal prefixes.'
        ],
        workedExample: {
          title: 'Subsets with choose/explore/undo',
          body: 'At index i, either skip or take nums[i]. Copy path when recording. Undo with pop.',
          code: `def subsets(nums):
    ans = []
    path = []

    def dfs(i):
        if i == len(nums):
            ans.append(path.copy())
            return
        dfs(i + 1)          # skip
        path.append(nums[i])  # take
        dfs(i + 1)
        path.pop()            # undo

    dfs(0)
    return ans

print(sorted(subsets([1, 2]), key=lambda s: (len(s), s)))`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'Always path.copy() (or path[:]) when storing. The path list is mutable shared state.'
        },
        checkYourself: [
          {
            prompt: 'Why sort and skip duplicates in combination problems?',
            reveal:
              'Sorting clusters equal values; skipping an equal value at the same depth prevents generating identical multisets from different index sequences.'
          }
        ]
      },
      {
        id: 'boards-grids-and-visited',
        heading: 'Boards, grids, and visited-state hygiene',
        paragraphs: [
          'Word search and path-on-grid problems mark cells visited, recurse to neighbors, then unmark. In-place letter mutation or a visited set both work; undo must match. Forgetting to unmark under-counts reachable paths.',
          'State what is forbidden: revisiting a cell, leaving bounds, mismatching the next character. Put those checks at the top of DFS as base failures.',
          'When the grid is large, discuss complexity: worst-case exponential in path length. Prune with early mismatches. Memoization appears when the same cell+progress state repeats with identical futures—word break on a string is the cleaner memo cousin.'
        ],
        workedExample: {
          title: 'Grid path existence with mark/unmark',
          body: 'Search four directions for a target word; restore the cell after exploring.',
          code: `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, k):
        if k == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[k]:
            return False
        tmp, board[r][c] = board[r][c], "#"
        found = any(
            dfs(r + dr, c + dc, k + 1)
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1))
        )
        board[r][c] = tmp  # undo
        return found

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))

board = [["A", "B"], ["C", "D"]]
print(exist(board, "ABD"))  # True
print(exist(board, "ABC"))  # False`,
          language: 'python'
        },
        callout: {
          tone: 'warning',
          body:
            'If you mutate the board, every return path—including early False—must restore the cell.'
        },
        checkYourself: [
          {
            prompt: 'What pruning rule meaningfully shrinks a board search?',
            reveal:
              'Reject as soon as the current cell mismatches or is out of bounds/visited, before spawning four recursive calls.'
          }
        ]
      },
      {
        id: 'when-to-memoize',
        heading: 'When the search tree should become memoized',
        paragraphs: [
          'Escalate to memoization when overlapping states appear: the same (index, remaining), (position, mask), or (node, budget) recurs with the same future. Pure generation of all subsets usually should not memoize—the outputs differ even if indices repeat in shape.',
          'Memoized recursion is DP in disguise. Name the state key explicitly. If the key omits a dimension that affects the answer, you will cache wrong results.',
          'Practice converting a slow DFS count into memoized counting. Leave enumeration problems as backtracking; convert counting/optimization over overlapping states to memo or tables.'
        ],
        callout: {
          tone: 'interview',
          body:
            '“I enumerate when outputs are distinct paths; I memoize when I only need an aggregate over identical substates.”'
        },
        checkYourself: [
          {
            prompt: 'When should a recursion tree become memoized instead of enumerated?',
            reveal:
              'When subproblems repeat and you care about a value (count, min cost, reachability), not about listing every distinct construction path.'
          }
        ]
      },
      {
        id: 'timeboxing-backtracking',
        heading: 'Timeboxing and failure recovery in search rounds',
        paragraphs: [
          'Budget: three minutes to draw the decision tree and base cases, then code. If at minute ten the undo story is unclear, stop expanding features—fix the template on a two-element input.',
          'Failure recovery: print the path at each depth on a tiny case, or step through mentally. Do not add pruning until the unpruned version works on samples.',
          'Phone narration: announce depth goals (“at depth i I decide about element i”). Silent frantic coding looks worse than a slower correct tree.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Start every backtracking drill by writing def dfs(...): and the undo comment before the choice loop.'
        },
        checkYourself: [
          {
            prompt: 'What is the minimum dry-run you should speak before declaring a backtracking solution done?',
            reveal:
              'One successful path that records an answer and one failing branch that undoes correctly, plus a duplicate-skip case if the input can repeat values.'
          }
        ]
      },
      {
        id: 'bridge-to-graphs-dp',
        heading: 'Bridge to graphs, greedy, and harder DP',
        paragraphs: [
          'Graph DFS with recursion shares undo/visited patterns. Harder DP often starts as memoized search trees. Greedy appears when you can prove you need not search.',
          'Keep a personal catalog: subsets, permutations, combinations, grid path, partition-to-target. Those five cover a large fraction of medium backtracking screens.',
          'Maintenance: one backtracking problem per week after you move on, so undo discipline does not decay.'
        ],
        callout: {
          tone: 'interview',
          body:
            'If the interviewer asks for optimizations, offer pruning and memo keys before micro-tuning Python loops.'
        },
        checkYourself: [
          {
            prompt: 'How does backtracking practice transfer to harder DP?',
            reveal:
              'Memoized search is DP: the same choose/explore structure with a state key and cached return values instead of listing paths.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Write base case and undo before expanding choices.',
        'Copy mutable paths when recording answers.',
        'Prune early; memoize only when aggregated overlapping states appear.',
        'Draw the decision tree; complexity follows depth and branching.'
      ],
      nextSteps: [
        'Code subsets, combinations-with-duplicates, and grid word-search from memory.',
        'Convert one counting DFS into memoized DP and name the state key.',
        'Time a 25-minute backtracking prompt with full choose/explore/undo narration.'
      ]
    }
  },

  'dsa-core-patterns/graphs-greedy-and-harder-dp': {
    title: 'Graphs, greedy reasoning, and harder dynamic programming',
    readingTime: '85-100 min',
    premise:
      'Stronger rounds separate implementers from designers: model the graph or DP state first, pick BFS/Dijkstra/greedy/tabulation deliberately, and defend why a local choice or transition covers all valid futures. This chapter is practice for that defense under follow-ups.',
    parts: [
      {
        id: 'model-before-algorithm',
        heading: 'Model the graph or state before choosing an algorithm',
        paragraphs: [
          'Wrong graphs fail silently. Ask: directed or undirected? Weighted? Cyclic? Implicit (grid, word ladder) or explicit edges? Nodes might be positions, masks, or (node, leftover) pairs. Build the adjacency representation in words before code.',
          'Algorithm menu: unweighted shortest path → BFS; connectivity/cycles → DFS or Union-Find; non-negative weights → Dijkstra; DAGs → topo + relaxation; general DP over DAG of states → memo/table. Say the choice and the assumption aloud.',
          'Interviewers often change weights or add a constraint. If your model was clear, the algorithm swap is local. If you coded BFS by habit, follow-ups feel like starting over.'
        ],
        keyTerms: [
          {
            term: 'implicit graph',
            definition:
              'A graph whose edges are generated by rules (grid moves, word mutations) rather than given as a list.'
          },
          {
            term: 'state node',
            definition:
              'A vertex that includes algorithmically relevant context beyond a raw input id (e.g., position + fuel).'
          },
          {
            term: 'adjacency list',
            definition:
              'Sparse graph representation mapping each node to its neighbors (and weights if needed).'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Opening: “I will treat X as nodes and Y as edges because …; then BFS/Dijkstra/DP applies because …”'
        },
        checkYourself: [
          {
            prompt: 'How do you decide between BFS, Dijkstra, and DP over states?',
            reveal:
              'BFS for unweighted shortest; Dijkstra when non-negative edge weights matter; DP when overlapping subproblems on a DAG of states matter more than classic single-source distances.'
          }
        ]
      },
      {
        id: 'bfs-and-multi-source',
        heading: 'BFS, multi-source expansion, and 0-1 edges',
        paragraphs: [
          'BFS layers give distances in unweighted graphs. Multi-source BFS seeds the queue with all sources at distance 0—useful for rotting oranges, closest gates, and similar. Track visited carefully to avoid reprocessing.',
          '0-1 BFS (deque) appears when edges are only weight 0 or 1. Mention it as a follow-up upgrade from Dijkstra when applicable.',
          'Practice complexity: O(V + E) for BFS. On grids, V is cells and E is about 4V. State that cleanly.'
        ],
        workedExample: {
          title: 'Shortest path in an unweighted implicit graph',
          body: 'Word-ladder style: each string is a node; edges flip one character to another word in the set. BFS finds fewest edges.',
          code: `from collections import deque

def ladder_length(begin, end, words):
    bank = set(words)
    if end not in bank:
        return 0
    q = deque([(begin, 1)])
    seen = {begin}
    while q:
        word, dist = q.popleft()
        if word == end:
            return dist
        for i in range(len(word)):
            for c in "abcdefghijklmnopqrstuvwxyz":
                nxt = word[:i] + c + word[i + 1 :]
                if nxt in bank and nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, dist + 1))
    return 0

print(ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'For grids, encode visited in-place only when mutation is allowed; otherwise use a set of coordinates.'
        },
        checkYourself: [
          {
            prompt: 'When is multi-source BFS the right mental model?',
            reveal:
              'When many cells or nodes start “active” together and distance means steps from the nearest source, so seeding all sources at once matches the definition.'
          }
        ]
      },
      {
        id: 'greedy-with-proof',
        heading: 'Greedy needs more than intuition',
        paragraphs: [
          'Greedy is correct only when a local choice does not block a better global answer. Sketch an exchange argument or “stays ahead” argument in two sentences. Interval scheduling by end time, Huffman-style merges, and jump-game reachability are interview classics.',
          'If you cannot prove it, consider DP or search. Saying “I think greedy works” is weaker than “here is the swap argument.” Practice one proof sketch per greedy drill.',
          'Jump game is a good bridge: track farthest reachable; the greedy scan is really a reachability invariant. Narrate that invariant like a window.'
        ],
        workedExample: {
          title: 'Jump game reachability scan',
          body: 'Maintain farthest index reachable so far; if i passes farthest, fail; if farthest covers the end, succeed.',
          code: `def can_jump(nums):
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False
        farthest = max(farthest, i + jump)
        if farthest >= len(nums) - 1:
            return True
    return True

print(can_jump([2, 3, 1, 1, 4]))  # True
print(can_jump([3, 2, 1, 0, 4]))  # False`,
          language: 'python'
        },
        callout: {
          tone: 'warning',
          body:
            'If the interviewer challenges greedy, do not dig in. Offer DP as a fallback and compare complexities.'
        },
        checkYourself: [
          {
            prompt: 'What proof sketch makes a greedy interval choice believable?',
            reveal:
              'Show that any optimal solution can swap in your earliest-finishing choice without decreasing the number of intervals, so it is safe to commit locally.'
          }
        ]
      },
      {
        id: 'harder-dp-dimensions',
        heading: 'Harder DP: tighter state and transition counting',
        paragraphs: [
          'Harder DP adds dimensions: two sequences (LCS/edit distance), knapsack capacity, k transactions, bitmasks on n ≤ 20. First write the state meaning in English. Then write transitions. Only then allocate a table or memo.',
          'Count states × work per transition for the time bound before coding. If the product exceeds interview limits, look for monotonic queues, rolling arrays, or a greedy reduction.',
          'Bitmask DP is memoized search over subsets. Name mask bits clearly. Recursion with cache is often clearer under pressure than iterative subset loops.'
        ],
        workedExample: {
          title: '0/1 knapsack as 2D DP',
          body: 'dp[i][c] = best value using first i items with capacity c. Transition skip or take item i−1 if it fits.',
          code: `def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        w, v = weights[i - 1], values[i - 1]
        for c in range(capacity + 1):
            dp[i][c] = dp[i - 1][c]
            if w <= c:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)
    return dp[n][capacity]

print(knapsack([2, 3, 4], [3, 4, 5], 5))  # 7`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            'Before code: “States = …; each does … work; total time …; space can roll to …”.'
        },
        checkYourself: [
          {
            prompt: 'Which dimensions of state are essential before you build a DP table?',
            reveal:
              'Every parameter that changes what futures are possible—usually index into decisions plus remaining resources or matching progress—and nothing that can be derived from them.'
          }
        ]
      },
      {
        id: 'union-find-and-topo',
        heading: 'Union-Find and topological patterns as tools',
        paragraphs: [
          'Union-Find answers connectivity and cycle-on-undirected-edge-add questions quickly. Topological sort answers ordering under prerequisites and detects cycles in directed graphs via Kahn or DFS colors.',
          'Do not force these tools. Prefer BFS/DFS when path reconstruction or distances matter. Prefer Union-Find when merges and component queries dominate.',
          'Practice one Union-Find and one topo problem so the API (find, union, indegree queue) is muscle memory for mixed company rounds.'
        ],
        callout: {
          tone: 'tip',
          body:
            'For course-schedule style prompts, Kahn’s algorithm gives a natural “why not enough nodes popped ⇒ cycle” story.'
        },
        checkYourself: [
          {
            prompt: 'When is Union-Find a better fit than BFS?',
            reveal:
              'When you only need connected components or cycle detection under edge unions, not distances or layered expansion.'
          }
        ]
      },
      {
        id: 'practice-under-follow-ups',
        heading: 'Practice under deeper follow-ups',
        paragraphs: [
          'Drill format: solve once, then immediately invent a follow-up—add weights, add k, forbid revisits, shrink memory. Spend ten minutes adapting. That mimics Google/Meta onsite texture better than a second unrelated prompt.',
          'Failure recovery: if the state space is wrong, delete code and re-derive on n=3. Forcing a broken DP wastes the round. Partial correctness with a clear next transition beats a full wrong table.',
          'Closing ritual: model, algorithm, complexity, one alternate. Carry this into company and mock modules unchanged.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Leave time to compare a second approach even if you only sketch it. Comparison is a scored signal.'
        },
        checkYourself: [
          {
            prompt: 'What do you do when a hard DP state’s meaning feels fuzzy mid-code?',
            reveal:
              'Stop coding, redefine the state in one sentence on a tiny instance, and only resume when transitions match that sentence.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Model graph properties and DP states before picking algorithms.',
        'BFS/Dijkstra/Union-Find/topo each answer a different question.',
        'Greedy requires a proof sketch; otherwise keep DP in reserve.',
        'Harder DP is state design plus states × transition work.'
      ],
      nextSteps: [
        'Time one BFS implicit-graph, one greedy-with-proof, and one 2D DP problem.',
        'Practice a ten-minute follow-up mutation after each solve.',
        'Write exchange-argument and state-transition sentences until they feel automatic.'
      ]
    }
  }
};
