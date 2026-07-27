/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaFoundationsChapters = {
  'dsa-foundations/arrays-hashmaps-and-two-pointers': {
    title: 'Arrays, hash maps, and two pointers',
    readingTime: '75-95 min',
    premise:
      'Most coding screens open with arrays. The win is not memorizing problem titles; it is recognizing which hot operation the prompt needs—membership, ordered pairing, frequency, or monotonic discard—and practicing the interview loop that turns a brute-force sketch into a defended linear or near-linear pass.',
    parts: [
      {
        id: 'practice-loop-before-patterns',
        heading: 'Practice the interview loop before chasing patterns',
        paragraphs: [
          'Every array drill should rehearse the same cadence: restate inputs and outputs, name constraints, sketch brute force, propose the intended structure, code, test edge cases, then state complexity. Skipping the brute-force sentence is how candidates jump to the wrong template. Saying “pairwise check is O(n²); a map of complements is O(n) expected” proves you chose space deliberately.',
          'Warm practice is timed lightly—twelve to fifteen minutes for an easy/medium array prompt—because the goal is fluency of narration, not heroics. Speak invariants out loud even when alone. “Left never passes right” or “the map stores the last index of each value” becomes muscle memory that survives phone anxiety.',
          'Track failure modes separately from wrong answers. Misreading whether duplicates are allowed, forgetting the empty array, or mutating while iterating are process bugs. After each set, write one sentence: which operation was hot, which structure answered it, which edge case you almost missed. That log beats grinding twenty random titles.'
        ],
        keyTerms: [
          {
            term: 'hot operation',
            definition:
              'The recurring need in a prompt—lookup, count, ordered pair, range aggregate—that should drive data-structure choice.'
          },
          {
            term: 'brute-force baseline',
            definition:
              'The obvious correct approach stated first so the optimized idea can be compared on time, space, and clarity.'
          },
          {
            term: 'invariant',
            definition:
              'A property that remains true after every pointer move or map update; the spoken proof of correctness.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Open with constraints and brute force. Interviewers hear structure before they see syntax.'
        },
        checkYourself: [
          {
            prompt: 'What should you say before writing a hash-map solution in a screen?',
            reveal:
              'Restate the goal, name brute force (usually nested loops), then say which lookup or count the map eliminates and what space you are spending for that speed.'
          }
        ]
      },
      {
        id: 'hash-maps-as-trade-space',
        heading: 'Hash maps trade space for surviving unsorted order',
        paragraphs: [
          'A hash map earns its keep when indices, frequencies, or complements must survive unsorted order. Complement search (need target − x), anagram grouping, and “first unique” style scans all ask: given the current value, what have I already seen? Stating that question aloud prevents inventing a sort when a map is enough.',
          'Frequency maps are not only for counting characters. They track remaining needs in a multiset, last-seen indices for distance constraints, and group keys for bucketed answers. Update the map in a fixed order every iteration: read the current key, decide the action, then write. Ad-hoc updates create off-by-one bugs that pass the sample and fail hidden tests.',
          'In interviews, expected O(1) lookups are usually acceptable. If pressed on worst case, mention adversarial hashing and that production languages mitigate it; then return to the intended linear scan. Do not abandon a clear map solution for an obscure O(1)-space trick unless the interviewer asks for space optimization as a follow-up.'
        ],
        keyTerms: [
          {
            term: 'complement search',
            definition:
              'Looking up target − x (or a related partner) in a map instead of scanning the rest of the array.'
          },
          {
            term: 'frequency map',
            definition:
              'A dictionary from value to count (or remaining need) maintained as the scan progresses.'
          },
          {
            term: 'last-seen index',
            definition:
              'Storing the most recent position of a value to answer distance or uniqueness constraints in one pass.'
          }
        ],
        workedExample: {
          title: 'Two-sum via complement map',
          body: 'State brute force as checking all pairs. Then keep value → index while scanning; each step asks whether the complement already appeared.',
          code: `def two_sum(nums, target):
    """Return indices i < j with nums[i] + nums[j] == target."""
    seen = {}  # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    raise ValueError("no pair")

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))       # [1, 2]`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'If the array is unsorted and the hot operation is membership or pairing, prefer a map before sorting.'
        },
        checkYourself: [
          {
            prompt: 'When would you sort first instead of using a hash map?',
            reveal:
              'When a monotonic two-pointer or greedy discard needs order, and O(n log n) plus O(1) extra space beats O(n) space—or when the interviewer forbids hash tables as a follow-up.'
          }
        ]
      },
      {
        id: 'two-pointers-and-monotonic-discard',
        heading: 'Two pointers encode monotonic discard',
        paragraphs: [
          'Left/right pointers work when moving one side can only discard candidates that cannot improve the answer. Sorted pair sums, container-with-most-water style greed, and palindrome checks share that property. The interview skill is naming the invariant: “if the sum is too large, the right value cannot partner with anything left of left,” and so on.',
          'Unsorted inputs often need a sort first. That is a deliberate trade: pay O(n log n), then walk with two pointers in O(n). Compare that aloud to the map approach. If indices must be returned from the original array, sorting loses positions unless you carry indices along—another reason maps sometimes win.',
          'Duplicates and boundaries are where pointer solutions die. Decide whether equal values should advance one pointer or both, and what happens when left meets right. Draw a three-element example before coding. Tiny diagrams prevent infinite loops and skipped answers.'
        ],
        keyTerms: [
          {
            term: 'monotonic movement',
            definition:
              'A pointer only advances in one direction because moving the other way cannot improve the invariant.'
          },
          {
            term: 'paired walk',
            definition:
              'Left and right indices that cooperate under a sorted or mirrored structure.'
          },
          {
            term: 'boundary case',
            definition:
              'Inputs of size 0, 1, or 2, plus all-equal and duplicate-heavy arrays that stress pointer updates.'
          }
        ],
        workedExample: {
          title: 'Sorted two-sum with two pointers',
          body: 'After sorting, move the side that reduces the absolute error toward the target. Narrate why each move discards a whole class of pairs.',
          code: `def two_sum_sorted(nums, target):
    a = sorted(nums)
    left, right = 0, len(a) - 1
    while left < right:
        s = a[left] + a[right]
        if s == target:
            return (a[left], a[right])
        if s < target:
            left += 1  # any smaller partner with a[right] is worse
        else:
            right -= 1
    return None

print(two_sum_sorted([2, 7, 11, 15], 9))
print(two_sum_sorted([1, 1, 1, 5], 6))`,
          language: 'python'
        },
        callout: {
          tone: 'warning',
          body:
            'Never move both pointers “because it feels stuck.” Name which side the invariant forces you to advance.'
        },
        checkYourself: [
          {
            prompt: 'Why can sorting unlock a two-pointer proof that a map cannot give?',
            reveal:
              'Order creates a monotonic landscape: increasing one pointer and decreasing the other systematically explores the pair space without revisiting discarded regions.'
          }
        ]
      },
      {
        id: 'space-time-narration',
        heading: 'Narrate space–time trade-offs like a senior',
        paragraphs: [
          'Interviewers score how you choose, not only whether tests pass. Compare O(n) extra space for a map against O(n log n) time for sorting with O(1) extra space when the language sorts in place. Mention cache locality only if relevant; clarity beats micro-architecture theater.',
          'When constraints say n ≤ 10⁴, O(n²) may still be fine for a first pass—say so, then tighten. When n ≤ 10⁵ and the time budget is tight, jump earlier to linear. Tie Big-O to the stated limits so complexity feels like engineering, not ritual.',
          'Practice closing every drill with one sentence: time, space, and the edge cases you checked. That closing becomes automatic and buys points even when a follow-up interrupts mid-refactor.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Write the complexity sentence before you declare done. It forces you to notice hidden sorts and nested scans.'
        },
        checkYourself: [
          {
            prompt: 'How do you explain trading O(n) space for expected O(n) time?',
            reveal:
              'The map stores information that would otherwise be rediscovered by scanning; you spend memory proportional to distinct keys to remove an inner loop.'
          }
        ]
      },
      {
        id: 'edge-cases-and-failure-recovery',
        heading: 'Edge cases and failure recovery on array drills',
        paragraphs: [
          'Build a personal checklist: empty, single element, all equal, negatives, zeros, duplicates, and maximum-size stress. Speak two or three of them while testing. Interviewers notice candidates who invent cases instead of only replaying the sample.',
          'If your first pattern is wrong—map when you needed sort, or two pointers on unsorted data—stop, name the mistake, and pivot. “I assumed order; without sorting the invariant fails, so I will either sort or switch to a frequency map.” Recovery speech is a scored skill.',
          'Use this lesson’s practice IDE to time one map problem and one pointer problem back-to-back. Between them, reset: clear board, restate aloud, refuse to copy yesterday’s template blindly. Pattern recognition is matching the hot operation, not the last problem you solved.'
        ],
        callout: {
          tone: 'interview',
          body:
            'If stuck past eight minutes, restate the hot operation. Wrong structure after ten silent minutes is worse than a spoken pivot at minute six.'
        },
        checkYourself: [
          {
            prompt: 'Name three edge cases you should test on every array screen.',
            reveal:
              'Empty or length-one input, duplicate-heavy input, and a case that hits the numeric or index boundary the problem cares about (negatives, zeros, or last index).'
          }
        ]
      },
      {
        id: 'transfer-to-timed-prompts',
        heading: 'Transfer study labs into timed prompts',
        paragraphs: [
          'Study labs teach decision rules; this practice module spends them under a clock. Before each session, skim your one-line rules: membership → map; ordered pairing after sort → two pointers; range aggregates → prefix (later module). Then close the notes and solve.',
          'Score yourself on process, not only acceptance: restatement quality, invariant spoken, tests invented, complexity closed. A green test with mute coding is a failed rehearsal for phone screens.',
          'When you can finish two medium array prompts in under twenty-five minutes with clean narration, graduate to the linked-list and binary-search lesson. Foundations compound; rushing past arrays into graphs only hides weak invariants.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Keep a three-column log: prompt shape, structure chosen, edge case that almost bit you. Review it before company rounds.'
        },
        checkYourself: [
          {
            prompt: 'How do you know an array warm-up session “worked”?',
            reveal:
              'You selected structures from the hot operation without hesitation, spoke invariants, and closed with tests and complexity—not merely that solutions passed.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Name the hot operation before picking a hash map, sort, or two pointers.',
        'Speak the brute-force baseline so the optimized pass has a clear trade-off story.',
        'Two pointers need a monotonic invariant; maps need a surviving lookup or count.',
        'Edge-case checklists and spoken pivots are part of the scored performance.'
      ],
      nextSteps: [
        'Time one complement-map problem and one sorted two-pointer problem with full narration.',
        'Write your personal five-item array edge-case checklist and reuse it for a week.',
        'Log one space–time trade-off sentence after every drill.'
      ]
    }
  },

  'dsa-foundations/linked-lists-binary-search-and-ordering': {
    title: 'Linked lists, binary search, and ordering problems',
    readingTime: '80-100 min',
    premise:
      'Pointer mutation and search-space pruning look like different topics until you practice them as ordering problems: who owns the next reference, and which half of a monotonic region can be discarded. This chapter trains the diagrams, templates, and spoken proofs that keep both families correct under follow-ups.',
    parts: [
      {
        id: 'pointer-ownership-first',
        heading: 'Draw pointer ownership before mutating a list',
        paragraphs: [
          'Linked-list bugs are ownership bugs. Before rewiring, name the nodes you hold: prev, curr, next. Save next before changing curr.next. Speak the rewrite as a three-step dance so you never lose the rest of the chain. Dummy (sentinel) nodes remove special cases at the head—attach the real head as next, operate uniformly, return sentinel.next.',
          'Practice reversing, merging, and partitioning with the same discipline. Each problem is a small state machine over a few references. If you cannot draw the before/after of one step, you are not ready to type. Interviewers watch whether your hands match your mouth.',
          'Clarify space early: in-place mutation versus building a new list. Many follow-ups ask for O(1) extra space. Say what “extra” excludes (the output list itself) so the complexity sentence stays honest.'
        ],
        keyTerms: [
          {
            term: 'sentinel node',
            definition:
              'A dummy node placed before the real head so head deletion and insertion share the same code path.'
          },
          {
            term: 'pointer ownership',
            definition:
              'Explicit tracking of which references still reach remaining nodes during mutation.'
          },
          {
            term: 'in-place rewrite',
            definition:
              'Changing next pointers without allocating a parallel list structure.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'If you lose the next reference for even one step, the remainder of the list is gone. Save before you rewire.'
        },
        checkYourself: [
          {
            prompt: 'Why do sentinel nodes simplify list problems?',
            reveal:
              'They unify head and mid-list operations, so you do not branch on whether the node to change is the head.'
          }
        ]
      },
      {
        id: 'slow-fast-and-cycles',
        heading: 'Slow/fast pointers for midpoints and cycles',
        paragraphs: [
          'Floyd’s slow/fast walk finds midpoints and detects cycles with O(1) extra space. Slow advances one step, fast two; meeting implies a cycle, and resetting one pointer to the head finds the entrance with the classic second phase. Narrate why the meeting is guaranteed if a cycle exists—relative speed closes the gap.',
          'Midpoint finding feeds merge sort on lists and “reorder list” style problems. Decide whether you want the lower or upper middle on even length; state it before coding. Off-by-one here cascades into broken merges.',
          'When the prompt mixes lists with values, ask whether hashing node identities is allowed. Value maps are wrong for cycles; identity maps cost O(n) space and are a fine first answer if O(1) space is a follow-up.'
        ],
        workedExample: {
          title: 'Detect cycle with slow/fast pointers',
          body: 'Build a tiny cyclic list in Python, then run Floyd. Practice explaining the second phase for the entrance if asked.',
          code: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False

a, b, c = Node(1), Node(2), Node(3)
a.next, b.next, c.next = b, c, b  # cycle at b
print(has_cycle(a))  # True
print(has_cycle(Node(1, Node(2))))  # False`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            'For cycle entrance, say: after meeting, one pointer to head; both step once until they meet—the entrance.'
        },
        checkYourself: [
          {
            prompt: 'What does a slow/fast meeting prove?',
            reveal:
              'That fast lapped slow inside a cycle. Acyclic lists end when fast hits null before a meeting.'
          }
        ]
      },
      {
        id: 'binary-search-is-a-predicate',
        heading: 'Binary search is a predicate on a monotonic region',
        paragraphs: [
          'Binary search is not “find in a sorted array” alone. It is: maintain a range where a monotonic predicate goes from false to true (or vice versa), test mid, discard the half that cannot contain the answer. Indices, values, and answer-space searches (minimum capacity, first feasible day) share one template.',
          'Pick inclusive/exclusive bounds and stick to them. A reliable template: lo is the first feasible candidate, hi is one past the last; or lo/hi inclusive with careful mid bias. Off-by-ones come from mixing templates mid-problem. Write the loop invariant in a comment, then speak it.',
          'Name the search space size and the cost of the predicate. Time is O(P log R) where R is the range size and P is predicate cost. That sentence matters when the predicate is itself a linear scan over the array.'
        ],
        keyTerms: [
          {
            term: 'monotonic predicate',
            definition:
              'A yes/no test that flips at most once across the ordered search domain.'
          },
          {
            term: 'answer-space search',
            definition:
              'Binary searching the feasible numeric answer rather than an index into the input.'
          },
          {
            term: 'loop invariant',
            definition:
              'The property of [lo, hi) or [lo, hi] that remains true each iteration and implies correctness at termination.'
          }
        ],
        workedExample: {
          title: 'Lower bound (first index with value >= target)',
          body: 'Treat the predicate “a[mid] >= target” and keep discarding the side that cannot hold the first true.',
          code: `def lower_bound(a, target):
    lo, hi = 0, len(a)  # answer in [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo

a = [1, 3, 3, 7, 9]
print(lower_bound(a, 3))   # 1
print(lower_bound(a, 4))   # 3
print(lower_bound(a, 10))  # 5`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'Ask aloud: am I searching an index, a value, or a feasibility answer? The code shape follows that sentence.'
        },
        checkYourself: [
          {
            prompt: 'When is binary search on the answer better than scanning?',
            reveal:
              'When feasibility is monotonic in a numeric parameter and checking one candidate is cheaper than enumerating all, so log-factor probes beat a linear or quadratic sweep.'
          }
        ]
      },
      {
        id: 'ordering-and-partitioning',
        heading: 'Ordering, partitioning, and rotated searches',
        paragraphs: [
          'Rotated sorted arrays and “kth” style partition problems are ordering puzzles. For rotated search, identify which half is sorted, then decide whether the target lies inside that sorted half. The spoken proof is half the solution.',
          'Dutch-national-flag and quickselect-style partitions teach three-way pointer regions. Keep the invariant on the three zones explicit. These connect list partitioning to array ordering—same mental model, different storage.',
          'Practice size-0/1/2 ranges first. Binary search and list recursion both fail on tiny regions when mid updates are careless. Unit-test the template on those sizes before the fancy prompt.'
        ],
        callout: {
          tone: 'warning',
          body:
            'On rotated arrays, do not binary-search as if the whole range were sorted. First classify which side is contiguous.'
        },
        checkYourself: [
          {
            prompt: 'How do you decide which half to keep in a rotated sorted search?',
            reveal:
              'Determine which side of mid is sorted; if the target lies in that sorted segment’s value range, search there, otherwise search the other side.'
          }
        ]
      },
      {
        id: 'timeboxing-list-and-search',
        heading: 'Timeboxing list and search practice',
        paragraphs: [
          'List problems burn time on diagrams; search problems burn time on off-by-ones. Budget five minutes to draw or write the invariant before heavy coding. If the diagram is unclear at minute five, simplify the example rather than typing hope.',
          'For OA-style silent practice, still write the invariant in a comment. For phone practice, speak it. Same content, different channel—both need rehearsal.',
          'Failure recovery: if the list is corrupted mid-debug, rebuild the example from scratch. If binary search loops, print lo, hi, mid for three iterations on paper. Silent spinning is the failure mode these drills exist to kill.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Say why mid cannot loop forever: each step shrinks [lo, hi) by at least one index.'
        },
        checkYourself: [
          {
            prompt: 'What is a healthy first five minutes on a linked-list screen?',
            reveal:
              'Clarify mutate vs copy, draw one example with labeled pointers, and state the sentinel or slow/fast plan before writing the loop.'
          }
        ]
      },
      {
        id: 'bridge-to-trees',
        heading: 'Bridge into trees with return values',
        paragraphs: [
          'Lists teach local pointer state; trees extend that to return values from recursive calls. Notice the parallel: a list reverse returns a new head; a tree DFS returns a subtree summary. Practice naming what flows upward.',
          'Binary search’s predicate discipline foreshadows DP feasibility checks and greedy proofs. Keep asking “what is monotonic?” across modules.',
          'When this lesson’s prompts feel automatic—cycle, reverse, lower bound, rotated find—you are ready for trees, heaps, and intro DP without drowning in simultaneous new ideas.'
        ],
        callout: {
          tone: 'tip',
          body:
            'End each session by teaching one template to an empty chair: reverse, Floyd, lower bound. Teaching exposes gaps faster than another silent AC.'
        },
        checkYourself: [
          {
            prompt: 'What shared skill links list mutation and binary search?',
            reveal:
              'Maintaining an explicit invariant while state changes—pointer regions or search bounds—until a termination condition proves the answer.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Save next before rewiring; sentinels erase head special cases.',
        'Slow/fast pointers buy midpoints and cycles in O(1) extra space.',
        'Binary search targets a monotonic predicate over indices, values, or answers.',
        'Tiny ranges and spoken invariants prevent most off-by-ones.'
      ],
      nextSteps: [
        'Implement reverse, merge-two-lists, and lower bound from memory with narration.',
        'Solve one answer-space binary search (minimum feasible capacity style).',
        'Practice recovering from a broken pointer diagram by redrawing, not patching blindly.'
      ]
    }
  },

  'dsa-foundations/trees-heaps-and-intro-dp': {
    title: 'Trees, heaps, and intro dynamic programming',
    readingTime: '80-100 min',
    premise:
      'After arrays and ordering, screens ask whether you can preserve state across recursion, pick the next-best element with a heap, and turn overlapping subproblems into a memo or table. This chapter trains those three skills as one practice habit: name returns, name globals, name the recurrence.',
    parts: [
      {
        id: 'dfs-bfs-selection',
        heading: 'Choose DFS vs BFS from information needs',
        paragraphs: [
          'Tree prompts are information-timing problems. DFS (pre/in/post) exposes ancestor or subtree results at different moments; BFS exposes level order and shallowest first. Ask what you need at each node—children summaries, parent context, or depth—and pick the traversal that makes that information cheap.',
          'Recursion is natural when subtree answers compose. Iterative stacks avoid call-depth limits on skewed trees and show interviewers you can translate recursion. Always state the null base case and what you return upward. “Returns height” or “returns best path sum ending here” should be a single clear sentence.',
          'Practice drawing a three-node and a skewed five-node tree. If your recurrence only works on balanced shapes, the state is wrong. Foundations DP and tree DP both fail the same way: hidden assumptions about shape.'
        ],
        keyTerms: [
          {
            term: 'subtree return',
            definition:
              'The value a recursive call hands to its parent, summarizing everything needed from that subtree.'
          },
          {
            term: 'level-order traversal',
            definition:
              'BFS over tree nodes, processing depth by depth with a queue.'
          },
          {
            term: 'call-stack depth',
            definition:
              'Recursion depth bounded by tree height; skewed trees can be O(n) deep.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Say what is returned versus what is accumulated globally. Mixing them silently causes double-count bugs.'
        },
        checkYourself: [
          {
            prompt: 'When is BFS preferable to DFS on a tree interview problem?',
            reveal:
              'When the answer depends on shallowest depth, level groupings, or expanding frontier uniformly—information that a queue provides naturally.'
          }
        ]
      },
      {
        id: 'heaps-for-topk',
        heading: 'Heaps for repeated extract-min/max without full sorts',
        paragraphs: [
          'A heap shines when you need the next-best element repeatedly: top-k, merging k sorted streams, scheduling by urgency. Sorting everything is O(n log n) and fine when you need a total order; a size-k heap is O(n log k) when only k champions matter.',
          'State the heap invariant: parent is ordered relative to children. In Python, heapq is a min-heap; for max-heap behavior, negate keys or store tuples carefully. Narrate push/pop costs so complexity stays honest.',
          'Do not force heaps onto problems that need random access or arbitrary deletes without handles. Interviewers notice when a priority queue is fashion rather than need.'
        ],
        workedExample: {
          title: 'Top-k frequent with a size-k heap',
          body: 'Count frequencies, then keep a min-heap of size k keyed by count so the root is the weakest champion.',
          code: `from collections import Counter
import heapq

def top_k_frequent(nums, k):
    counts = Counter(nums)
    heap = []  # min-heap of (count, value)
    for value, count in counts.items():
        heapq.heappush(heap, (count, value))
        if len(heap) > k:
            heapq.heappop(heap)
    return [value for count, value in heap]

print(sorted(top_k_frequent([1, 1, 1, 2, 2, 3], 2)))  # [1, 2]`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'Compare aloud: full sort of unique keys vs heap of size k. Pick based on whether k << n.'
        },
        checkYourself: [
          {
            prompt: 'When is a heap cleaner than sorting the whole input?',
            reveal:
              'When you repeatedly need the current min/max or only the top-k, so you avoid paying for a total order you will not use.'
          }
        ]
      },
      {
        id: 'intro-dp-state-and-transition',
        heading: 'Intro DP: state, transition, overlapping work',
        paragraphs: [
          'Dynamic programming starts only after you can name the subproblem. Classic first states: index i in an array, remaining capacity, or a node in a DAG of decisions. The transition says how a state is built from smaller ones. Overlapping work is why memo or a table beats plain recursion.',
          'Top-down memoization is usually fastest to write under pressure: recurse, cache, return. Bottom-up clarifies complexity and dependency order. Practice both on the same recurrence (fib-style climbing stairs, house robber, grid paths) until the state sentence is automatic.',
          'Promote recursion to DP only when you see overlapping subproblems. Tree path problems sometimes need only post-order returns with no memo. Forcing a DP table onto a pure tree can obscure a simpler solution.'
        ],
        keyTerms: [
          {
            term: 'state',
            definition:
              'The minimal parameters that identify a subproblem uniquely (index, capacity, node, mask, …).'
          },
          {
            term: 'transition',
            definition:
              'The rule that builds a state’s answer from previously solved states.'
          },
          {
            term: 'memoization',
            definition:
              'Caching recursive results so overlapping subproblems are computed once.'
          }
        ],
        workedExample: {
          title: 'House robber as intro 1D DP',
          body: 'State dp[i] = best using the first i houses. Transition: skip i−1’s take, or take nums[i−1] plus dp[i−2].',
          code: `def rob(nums):
    prev2 = prev1 = 0  # dp[i-2], dp[i-1]
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1

print(rob([2, 7, 9, 3, 1]))  # 12
print(rob([1, 2, 3, 1]))     # 4`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            'Before code: “State is …, transition is …, base cases are …, time is states × work.”'
        },
        checkYourself: [
          {
            prompt: 'How do you know recursion should become memoized DP?',
            reveal:
              'When the same subproblem parameters recur and the naive tree re-solves them exponentially; caching collapses that overlap.'
          }
        ]
      },
      {
        id: 'compose-tree-returns',
        heading: 'Compose tree returns without double counting',
        paragraphs: [
          'Many medium tree problems are “return two numbers” problems: height and diameter contribution, gain with/without the node, cover vs not cover. Define a small struct or tuple return. Global answers update when a local combination is better.',
          'Path-sum style prompts teach careful definitions: path through node versus path ending at node. Mixing those definitions is the classic silent bug. Write the definition in one line before coding.',
          'Practice narrating a dry run on a four-node tree. If you cannot simulate returns by hand, the interviewer will not trust the code either.'
        ],
        callout: {
          tone: 'warning',
          body:
            'Updating a global best inside DFS is fine if the return value’s meaning stays stable. Do not overload one return to mean two different path types.'
        },
        checkYourself: [
          {
            prompt: 'What should a tree DFS return to its caller versus keep globally?',
            reveal:
              'Return the summary the parent needs to combine children; keep global only for answers that look across combinations the parent does not need as a single value.'
          }
        ]
      },
      {
        id: 'practice-cadence-trees-dp',
        heading: 'Practice cadence for trees, heaps, and intro DP',
        paragraphs: [
          'A solid session: one traversal/composition problem, one heap top-k, one 1D DP. Time each at twenty to twenty-five minutes with full narration. Stop polishing micro-syntax; spend leftover minutes on tests and complexity.',
          'Failure recovery for DP: if the table is wrong, shrink to n=3, fill by hand, and reconcile. For trees: print returns on a tiny example. For heaps: check size invariant after every push.',
          'Connect to later modules: sliding windows reuse “live state”; harder DP adds dimensions; graphs reuse BFS. Foundations here are vocabulary for those upgrades.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Keep a one-page cheat of base DP states you know cold: climb, rob, grid path, coin change unbounded. Expand only when those are automatic.'
        },
        checkYourself: [
          {
            prompt: 'What is a healthy mix for a foundations trees/DP practice day?',
            reveal:
              'One recursive tree composition, one heap selection problem, and one 1D DP recurrence—each with spoken state and tests.'
          }
        ]
      },
      {
        id: 'readiness-for-core-patterns',
        heading: 'Readiness gate for core patterns',
        paragraphs: [
          'You are ready for sliding windows and backtracking when tree returns feel routine, heap choice is obvious, and you can invent a 1D DP state without panicking. If not, stay here—core patterns assume this fluency.',
          'Revisit weak spots with spaced repetition rather than random hard trees. Diameter, LCA-style returns, and house-robber variants cover most of the foundation signal.',
          'Carry forward the closing ritual: state, transition or return meaning, tests, complexity. That ritual is the product of this whole foundations module.'
        ],
        callout: {
          tone: 'interview',
          body:
            'On a tree follow-up that adds constraints, re-derive the return tuple; do not patch a wrong definition.'
        },
        checkYourself: [
          {
            prompt: 'Name the three sentences you should speak before coding intro DP.',
            reveal:
              'What is the state, what is the transition with base cases, and what is the time as states times work per transition.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Pick DFS vs BFS from what information you need when.',
        'Heaps beat full sorts when only repeated best-k matters.',
        'DP begins with state, transition, and proof of overlapping work.',
        'Tree returns must mean one thing; globals capture cross-cutting bests.'
      ],
      nextSteps: [
        'Code diameter-of-binary-tree style returns and house robber from memory.',
        'Time a top-k heap problem and narrate O(n log k).',
        'Only then move into sliding-window and backtracking core patterns.'
      ]
    }
  }
};
