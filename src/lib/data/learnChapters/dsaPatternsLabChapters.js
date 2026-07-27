const chapters = {
  "dsa-patterns-lab/arrays-two-pointers-and-prefix-sums": {
    title: "Chapter: Arrays, two pointers, and prefix sums",
    readingTime: "75-95 min",
    premise:
      "Array prompts reward naming the operation first: lookup, ordered meeting, range sum, or range update. This chapter builds two-pointer invariants, hash versus sort tradeoffs, prefix sums, and difference arrays.",
    parts: [
      {
        id: "operation-first",
        heading: "Start with the operation, not the container",
        paragraphs: [
          "Arrays are storage; the algorithm is the access pattern. Membership with indices often wants a hash map. Sorted value pairs want two pointers. Many range-sum queries want prefixes. Many range increments want a difference array. Choosing a pattern before naming the need produces cargo-cult solutions.",
          "Read constraints. n = 1e5 forbids careless O(n^2). Need for original indices blocks destructive sorts unless you store pairs. Mutation bans push you toward copies or hash structures.",
          "Interview narration should sound like: the hot operation is X, so I will use pattern Y, with this invariant."
        ],
        keyTerms: [
          {
            term: "access pattern",
            definition:
              "How the algorithm reads and updates array positions over time."
          },
          {
            term: "invariant",
            definition:
              "A condition that remains true as pointers or prefixes move."
          },
          {
            term: "index preservation",
            definition:
              "Keeping original positions available after sorting or filtering."
          }
        ],
        workedExample: {
          title: "One-pass complement lookup",
          body:
            "Store what you still need; indices come for free with enumeration.",
          code:
            "def two_sum_indices(nums, target):\n    need = {}\n    for i, value in enumerate(nums):\n        if value in need:\n            return [need[value], i]\n        need[target - value] = i\n    return []\n\n\nprint(two_sum_indices([2, 7, 11, 15], 9))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can a hash two-sum fail if you insert before checking?",
            reveal:
              "A value could pair with itself incorrectly when 2 * value == target and only one copy exists. Check for the complement before recording the current index."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Say the hot operation in one phrase before picking two pointers, prefixes, or hashing."
        }
      },
      {
        id: "two-pointers",
        heading: "Two pointers move for a reason",
        paragraphs: [
          "On a sorted array, left and right pointers seek a target sum by moving the side that repairs the invariant. Too small, increase left; too large, decrease right. Each move must have a justification tied to monotonicity. Random pointer jitter means the sorted assumption is unused.",
          "Other flavors exist: same-direction slow/fast for in-place filters, opposite ends for containers of water, partitioning around a pivot. The shared idea is progress with an invariant, not magic indices.",
          "Prove that each element is visited a constant number of times. That proof is the O(n) claim after the O(n log n) sort if sorting was required."
        ],
        keyTerms: [
          {
            term: "two pointers",
            definition:
              "An algorithm that advances indices through a sequence under an invariant."
          },
          {
            term: "monotonic repair",
            definition:
              "Moving a pointer in the only direction that can fix a sorted-sum or similar condition."
          },
          {
            term: "opposite ends",
            definition:
              "Pointers that start at both ends and move toward the center."
          }
        ],
        workedExample: {
          title: "Sorted two-sum values",
          body:
            "Monotone moves shrink the search window until the pair is found.",
          code:
            "def two_sum_sorted(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        total = nums[lo] + nums[hi]\n        if total == target:\n            return [nums[lo], nums[hi]]\n        if total < target:\n            lo += 1\n        else:\n            hi -= 1\n    return []\n\n\nprint(two_sum_sorted([1, 2, 3, 4, 6], 6))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What goes wrong if the array is unsorted for this method?",
            reveal:
              "The decision to move left or right assumes order. Without sorting, a move can discard the only valid partner."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "State the invariant: everything outside [lo, hi] is already ruled out for a valid pair."
        }
      },
      {
        id: "hash-vs-sort",
        heading: "Hash maps versus sorting is a real tradeoff",
        paragraphs: [
          "Hashing often wins expected linear time with linear extra memory and keeps indices naturally. Sorting plus two pointers uses O(n log n) time and little extra memory if mutation is allowed, but recovering indices needs (value, index) pairs.",
          "Duplicates, stability, and whether values or indices are required tip the scale. Explain both options; pick from constraints. Interviewers like hearing the alternative you rejected.",
          "When you sort, sort intentionally: by value, by index, by a composite key. Accidental sorts destroy information."
        ],
        keyTerms: [
          {
            term: "expected linear",
            definition:
              "O(n) average-case time under hashing assumptions."
          },
          {
            term: "index pair",
            definition:
              "A (value, index) record that survives sorting by value."
          },
          {
            term: "destructive sort",
            definition:
              "Sorting the input in place when the caller still needs the original order."
          }
        ],
        workedExample: {
          title: "Sorting while preserving indices",
          body:
            "Pairs keep positions available after ordering by value.",
          code:
            "def two_sum_sort_indices(nums, target):\n    pairs = sorted((value, i) for i, value in enumerate(nums))\n    lo, hi = 0, len(pairs) - 1\n    while lo < hi:\n        total = pairs[lo][0] + pairs[hi][0]\n        if total == target:\n            return sorted([pairs[lo][1], pairs[hi][1]])\n        if total < target:\n            lo += 1\n        else:\n            hi -= 1\n    return []\n\n\nprint(two_sum_sort_indices([2, 7, 11, 15], 9))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When is sorting preferable to hashing for pair sums?",
            reveal:
              "When memory is tight, hashing is distrusted, or you already need sorted order—and indices are either unnecessary or stored in pairs."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If the prompt returns indices, hashing is usually the cleaner first draft."
        }
      },
      {
        id: "prefix-sums",
        heading: "Prefix sums turn range sums into subtraction",
        paragraphs: [
          "A prefix array stores cumulative sums so range sum(l, r) becomes prefix[r+1] - prefix[l]. Building takes O(n); each query is O(1). Many subarray-sum counting problems combine prefixes with a hash map of seen prefix values.",
          "Off-by-one errors live at inclusive versus exclusive ends. Decide whether prefix[i] means sum of the first i elements and stick to it. Draw a four-element example before coding.",
          "Prefixes are for repeated range reads on a mostly static array. If the array mutates often with arbitrary updates, fenwick or segment trees appear—usually beyond this pattern lesson."
        ],
        keyTerms: [
          {
            term: "prefix sum",
            definition:
              "An array where each entry stores the sum of a prefix of the input."
          },
          {
            term: "range sum query",
            definition:
              "Request for the sum of elements between two indices."
          },
          {
            term: "prefix frequency map",
            definition:
              "A map from prefix sum values to how often they appeared, used in subarray counting."
          }
        ],
        workedExample: {
          title: "Count subarrays with a target sum",
          body:
            "Seen prefix counts explain how many prior starts complete the target.",
          code:
            "from collections import defaultdict\n\n\ndef count_subarrays_sum(nums, target):\n    seen = defaultdict(int)\n    seen[0] = 1\n    total = 0\n    answer = 0\n    for value in nums:\n        total += value\n        answer += seen[total - target]\n        seen[total] += 1\n    return answer\n\n\nprint(count_subarrays_sum([1, 1, 1], 2))\nprint(count_subarrays_sum([1, 2, 3], 3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why initialize seen[0] = 1?",
            reveal:
              "A prefix that itself equals the target corresponds to a subarray starting at index 0. The empty prefix sum 0 accounts for that case."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Prefix maps handle negative numbers; sliding windows usually need monotone non-negative structure."
        }
      },
      {
        id: "difference-arrays",
        heading: "Difference arrays make many range updates cheap",
        paragraphs: [
          "If you must add a value to many ranges [l, r], updating each cell per query is too slow. A difference array stores +val at l and -val at r+1. A final prefix reconstruction materializes the array in O(n).",
          "This pattern fits range-add then read-all workloads. It is the dual of prefix sums: prefixes accelerate queries; differences accelerate updates.",
          "Confirm inclusive bounds and sentinel room at n for the -val write. Interview clarity on the final reconstruction pass prevents off-by-one bugs."
        ],
        keyTerms: [
          {
            term: "difference array",
            definition:
              "An array of adjacent deltas that reconstructs values via prefix sums."
          },
          {
            term: "range update",
            definition:
              "Applying the same additive change across a contiguous index span."
          },
          {
            term: "materialize",
            definition:
              "Running the final prefix pass to obtain explicit values after deferred updates."
          }
        ],
        workedExample: {
          title: "Apply inclusive range increments",
          body:
            "Mark endpoints, then prefix to get the final coverage array.",
          code:
            "def range_adds(n, updates):\n    diff = [0] * (n + 1)\n    for left, right, val in updates:\n        diff[left] += val\n        diff[right + 1] -= val\n    out = [0] * n\n    running = 0\n    for i in range(n):\n        running += diff[i]\n        out[i] = running\n    return out\n\n\nprint(range_adds(5, [(1, 3, 2), (2, 4, 3), (0, 2, -2)]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why write -val at right + 1?",
            reveal:
              "The prefix sum should stop applying val after index right. The negative mark cancels the running total from right + 1 onward."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Describe difference arrays as deferred range adds with one O(n) reveal pass."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Pick array patterns from the hot operation and constraints.",
        "Two pointers need monotone invariants and justified moves.",
        "Hash versus sort trades time, memory, and index handling.",
        "Prefix sums answer range reads; maps of prefixes count subarrays.",
        "Difference arrays batch range writes before materializing."
      ],
      nextSteps: [
        "Solve the same pair-sum prompt with hashing and with sorted pointers.",
        "Hand-compute prefixes for a five-element array and a few range queries.",
        "Trace a difference array through two overlapping updates."
      ]
    }
  },

  "dsa-patterns-lab/linked-lists-and-pointer-invariants": {
    title: "Chapter: Linked lists and pointer invariants",
    readingTime: "75-95 min",
    premise:
      "Linked-list bugs are ownership bugs. This chapter trains dummy nodes, slow/fast metrics, in-place reversal, merges, and Floyd cycle detection using explicit pointer invariants.",
    parts: [
      {
        id: "dummy-nodes",
        heading: "Dummy nodes turn head mutation into ordinary mutation",
        paragraphs: [
          "Deleting or inserting at the head forces special cases. A dummy predecessor pointing at the real head makes every edit look like updating next of some node. Return dummy.next at the end.",
          "Dummy nodes cost constant memory and buy fewer branches. They are especially valuable when the first node might be removed, as in filtering values or removing the nth from end after alignment.",
          "Name pointers by role: pred, curr, nxt. Role names beat generic p1 and p2 when explaining invariants."
        ],
        keyTerms: [
          {
            term: "dummy node",
            definition:
              "A sentinel node placed before the head to unify edge edits."
          },
          {
            term: "predecessor",
            definition:
              "The node whose next pointer will be rewritten for an insert or delete."
          },
          {
            term: "ownership",
            definition:
              "Which pointer is responsible for keeping a node reachable."
          }
        ],
        workedExample: {
          title: "Filter a list with a dummy predecessor",
          body:
            "Skip nodes matching the target by rewiring pred.next.",
          code:
            "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef remove_elements(head, val):\n    dummy = ListNode(0, head)\n    pred = dummy\n    while pred.next:\n        if pred.next.val == val:\n            pred.next = pred.next.next\n        else:\n            pred = pred.next\n    return dummy.next\n\n\ndef to_list(head):\n    out = []\n    while head:\n        out.append(head.val)\n        head = head.next\n    return out\n\n\nhead = ListNode(1, ListNode(2, ListNode(6, ListNode(3, ListNode(6)))))\nprint(to_list(remove_elements(head, 6)))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why advance pred only when you do not delete?",
            reveal:
              "After a delete, pred.next is already the next candidate. Advancing would skip it without checking."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If the head might change, start the sketch with a dummy."
        }
      },
      {
        id: "slow-fast",
        heading: "Slow and fast pointers measure relative progress",
        paragraphs: [
          "Fast moving twice as fast as slow reaches the end when slow is at the middle. Off-by-one choices pick the first or second middle in even lengths—read the prompt. The same idea detects cycles: if fast meets slow, a loop exists.",
          "Relative speed arguments replace index arithmetic you do not have in lists. Keep null checks on fast and fast.next before strides.",
          "For remove-nth-from-end, a gap of n between two pointers converts length knowledge into one pass after an initial advance."
        ],
        keyTerms: [
          {
            term: "slow/fast pointers",
            definition:
              "Two runners at different speeds used for midpoints or cycles."
          },
          {
            term: "second middle",
            definition:
              "In an even-length list, the later of the two central nodes."
          },
          {
            term: "gap pointer",
            definition:
              "A leading pointer advanced n steps before a tandem walk."
          }
        ],
        workedExample: {
          title: "Find the second middle node",
          body:
            "Fast takes two steps while slow takes one; even length lands on the second mid.",
          code:
            "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef middle_node(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow\n\n\ndef build(values):\n    head = ListNode(values[0])\n    cur = head\n    for value in values[1:]:\n        cur.next = ListNode(value)\n        cur = cur.next\n    return head\n\n\nprint(middle_node(build([1, 2, 3, 4, 5])).val)\nprint(middle_node(build([1, 2, 3, 4, 5, 6])).val)",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What null checks does the fast pointer need?",
            reveal:
              "Before reading fast.next.next, both fast and fast.next must be non-null so the double step is safe."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Clarify which middle the interviewer wants before coding the even-length case."
        }
      },
      {
        id: "reversal",
        heading: "In-place reversal is a three-pointer transfer",
        paragraphs: [
          "Reversal rewires next pointers: hold nxt, point curr.next to prev, advance prev and curr. At the end prev is the new head. Losing nxt is the classic leak.",
          "Partial reverses for sublists use the same transfer between bounds, with saved endpoints to reconnect the outside. Draw three boxes and arrows each step until the motion is muscle memory.",
          "Recursive reverse is elegant but uses O(n) stack space; prefer iterative when constraints are tight."
        ],
        keyTerms: [
          {
            term: "in-place reverse",
            definition:
              "Reversing link direction using a constant number of pointers."
          },
          {
            term: "prev/curr/nxt",
            definition:
              "The standard triple for safely rewiring a singly linked list."
          },
          {
            term: "sublist reverse",
            definition:
              "Reversing only nodes between two positions and reconnecting ends."
          }
        ],
        workedExample: {
          title: "Reverse a linked list in place",
          body:
            "Each step steals curr from the forward chain onto the reversed chain.",
          code:
            "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev\n\n\ndef to_list(head):\n    out = []\n    while head:\n        out.append(head.val)\n        head = head.next\n    return out\n\n\nhead = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))\nprint(to_list(reverse_list(head)))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What happens if you skip saving nxt?",
            reveal:
              "After curr.next = prev, the rest of the list is unreachable, so the algorithm loses the unfinished suffix."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Talk through one iteration aloud: save nxt, rewire, advance. Silence here hides the bug."
        }
      },
      {
        id: "merge-lists",
        heading: "Merging sorted lists is repeated minimum selection",
        paragraphs: [
          "Two sorted lists merge by always taking the smaller head, like merge sort's combine. A dummy tail pointer appends chosen nodes. When one list empties, attach the remainder.",
          "Merging k lists can pairwise merge or use a heap of heads. Pairwise is simple; heap is O(N log k). Reuse nodes—do not allocate duplicates—unless values-only output is required.",
          "Stability among equal values is usually unimportant, but consistent comparison keeps behavior predictable."
        ],
        keyTerms: [
          {
            term: "merge",
            definition:
              "Combining two ordered lists into one ordered list by local comparisons."
          },
          {
            term: "tail pointer",
            definition:
              "A pointer to the last node of the output under construction."
          },
          {
            term: "pairwise merge",
            definition:
              "Reducing k lists by repeatedly merging pairs."
          }
        ],
        workedExample: {
          title: "Merge two sorted lists by reusing nodes",
          body:
            "Dummy tail appends the smaller head until both inputs are consumed.",
          code:
            "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef merge_two(l1, l2):\n    dummy = ListNode()\n    tail = dummy\n    while l1 and l2:\n        if l1.val <= l2.val:\n            tail.next = l1\n            l1 = l1.next\n        else:\n            tail.next = l2\n            l2 = l2.next\n        tail = tail.next\n    tail.next = l1 or l2\n    return dummy.next\n\n\ndef build(values):\n    dummy = ListNode()\n    cur = dummy\n    for value in values:\n        cur.next = ListNode(value)\n        cur = cur.next\n    return dummy.next\n\n\ndef to_list(head):\n    out = []\n    while head:\n        out.append(head.val)\n        head = head.next\n    return out\n\n\nprint(to_list(merge_two(build([1, 2, 4]), build([1, 3, 4]))))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why attach l1 or l2 at the end?",
            reveal:
              "One list may still have a sorted suffix. That suffix is already ordered and can be linked in constant time."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Reuse existing nodes unless the API forbids mutating inputs."
        }
      },
      {
        id: "cycles",
        heading: "Cycle detection has two questions: exists and entry",
        paragraphs: [
          "Floyd's algorithm: slow one step, fast two steps. Meeting proves a cycle. To find the entry, reset one pointer to head and advance both one step; their meeting is the entrance under standard proofs.",
          "Do not conflate the questions. Existence stops at the first meeting. Entry needs the second phase. Hashing node identities also works with O(n) memory if pointer tricks are disallowed.",
          "Interview explanations should mention constant memory as the reason for Floyd when that matters."
        ],
        keyTerms: [
          {
            term: "Floyd cycle detection",
            definition:
              "Slow/fast pointer method to detect cycles and find entrances."
          },
          {
            term: "cycle entry",
            definition:
              "The first node that lies on the loop when walking from the head."
          },
          {
            term: "meeting point",
            definition:
              "A node where slow and fast coincide inside a cycle."
          }
        ],
        workedExample: {
          title: "Detect a cycle with Floyd pointers",
          body:
            "Meeting implies a loop; no meeting by null means an acyclic list.",
          code:
            "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False\n\n\na = ListNode(1)\nb = ListNode(2)\nc = ListNode(3)\na.next, b.next, c.next = b, c, b\nprint(has_cycle(a))\nprint(has_cycle(ListNode(1, ListNode(2))))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "After slow and fast meet, how do you find the entrance?",
            reveal:
              "Put one pointer back at the head. Advance both one step at a time. Their next meeting is the cycle entrance."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Separate existence from entry in your plan; they share phase one but not phase two."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Dummy nodes unify head edge cases.",
        "Slow/fast pointers replace index arithmetic on lists.",
        "Reversal is a disciplined three-pointer transfer.",
        "Sorted merges reuse nodes via repeated minimum choice.",
        "Floyd answers cycle existence and, with a second phase, entry."
      ],
      nextSteps: [
        "Implement remove-nth-from-end with a gap pointer and dummy.",
        "Reverse a sublist between left and right indices.",
        "Draw Floyd's two phases on a six-node looped list."
      ]
    }
  },

  "dsa-patterns-lab/binary-search-on-answer-spaces": {
    title: "Chapter: Binary search on answer spaces",
    readingTime: "80-100 min",
    premise:
      "Binary search is more than finding a key in a sorted array. This chapter covers closed bounds, lower/upper bounds, and searching monotone answer spaces with feasibility predicates.",
    parts: [
      {
        id: "closed-bounds",
        heading: "Maintain a truthful candidate range",
        paragraphs: [
          "Classic search keeps a closed interval [lo, hi] of remaining candidates. Compare mid; discard the half that cannot contain the target. Loop while lo <= hi. Mistakes usually come from updating bounds incorrectly or using an open interval with closed-interval code.",
          "Midpoint overflow is rarely an issue in Python, but (lo + hi) // 2 is still the clear habit. Overflow-safe forms matter more in fixed-width integers.",
          "Always state what lo and hi mean after each update. That sentence is your invariant."
        ],
        keyTerms: [
          {
            term: "candidate range",
            definition:
              "The index interval that may still hold the answer."
          },
          {
            term: "closed interval",
            definition:
              "A range including both endpoints, often written [lo, hi]."
          },
          {
            term: "discard half",
            definition:
              "Narrowing search by proving one side cannot contain the target."
          }
        ],
        workedExample: {
          title: "Closed-bound binary search",
          body:
            "Return the index on hit; empty the range on miss.",
          code:
            "def binary_search(nums, target):\n    lo, hi = 0, len(nums) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n\n\nprint(binary_search([1, 3, 5, 7, 9], 7))\nprint(binary_search([1, 3, 5, 7, 9], 4))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why use lo <= hi rather than lo < hi here?",
            reveal:
              "With closed bounds, lo == hi is still a live candidate that must be tested. Stopping earlier can miss the last index."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Pick one bound style and keep updates consistent; mixing open and closed is the main bug source."
        }
      },
      {
        id: "lower-upper",
        heading: "Lower and upper bounds answer first-true positions",
        paragraphs: [
          "Lower bound finds the first index where value >= target. Upper bound finds the first index where value > target. Together they describe a duplicate run. These searches return insertion points even when the target is missing.",
          "Implementation often uses lo < hi with mid biased carefully, or keeps an answer variable while scanning. First-bad-version is lower bound on a boolean predicate.",
          "Name the predicate: first index where condition becomes true, and prove the condition is monotone."
        ],
        keyTerms: [
          {
            term: "lower bound",
            definition:
              "First position where the sequence is at least the target."
          },
          {
            term: "upper bound",
            definition:
              "First position where the sequence exceeds the target."
          },
          {
            term: "monotone predicate",
            definition:
              "A boolean function that flips from false to true only once as the answer grows."
          }
        ],
        workedExample: {
          title: "First value >= target and duplicate span",
          body:
            "Lower and upper bounds sandwich the equal range.",
          code:
            "def lower_bound(nums, target):\n    lo, hi = 0, len(nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n\n\ndef upper_bound(nums, target):\n    lo, hi = 0, len(nums)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if nums[mid] <= target:\n            lo = mid + 1\n        else:\n            hi = mid\n    return lo\n\n\nnums = [1, 2, 2, 2, 4, 5]\nprint(lower_bound(nums, 2), upper_bound(nums, 2))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "How do you count duplicates of target with bounds?",
            reveal:
              "upper_bound(target) - lower_bound(target) gives the count of equal elements."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Frame first-bad-version as lower bound on isBad, not as equality search."
        }
      },
      {
        id: "search-on-answer",
        heading: "Search the answer space with a feasibility check",
        paragraphs: [
          "Many optimization prompts hide a monotone boolean: can we finish within D days at capacity C? Is eating speed K enough? As the candidate answer grows, feasibility eventually becomes true and stays true. Binary search the answer; at mid, run a linear feasibility check.",
          "The array being searched is conceptual: possible capacities, speeds, or distances—not necessarily the input array. Complexity becomes O(n log R) where R is the numeric search range.",
          "Proof obligations: identify monotonicity, bound lo/hi tightly, and define what happens on feasible mid (search left for minimum) versus infeasible (search right)."
        ],
        keyTerms: [
          {
            term: "answer space",
            definition:
              "The ordered domain of candidate solutions such as capacities or speeds."
          },
          {
            term: "feasibility predicate",
            definition:
              "A function feasible(mid) that is monotone in mid."
          },
          {
            term: "minimize feasible",
            definition:
              "Binary search pattern that seeks the smallest mid where feasible is true."
          }
        ],
        workedExample: {
          title: "Minimum ship capacity within days",
          body:
            "Feasibility loads packages in order without exceeding capacity.",
          code:
            "def ship_within_days(weights, days):\n    def can_ship(capacity):\n        need = 1\n        load = 0\n        for w in weights:\n            if load + w > capacity:\n                need += 1\n                load = 0\n            load += w\n        return need <= days\n\n    lo, hi = max(weights), sum(weights)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if can_ship(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo\n\n\nprint(ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is lo initialized to max(weights)?",
            reveal:
              "A single package cannot be split, so capacity must be at least the heaviest package."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Write can(mid) first and test it on extremes before wiring binary search."
        }
      },
      {
        id: "real-answers",
        heading: "Real-valued answers need iteration discipline",
        paragraphs: [
          "Square-root style problems search reals. You cannot rely on lo <= hi with integer shrinking forever. Iterate a fixed number of times or until hi - lo is below epsilon. Understand whether the prompt wants integer flooring or floating precision.",
          "Integer answer spaces are safer in coding interviews. When floats appear, state termination criteria. Avoid equality checks on floats.",
          "Bisection inherits the same monotonicity requirement as discrete answer search."
        ],
        keyTerms: [
          {
            term: "bisection",
            definition:
              "Binary search on a continuous interval using a sign or error predicate."
          },
          {
            term: "epsilon",
            definition:
              "A precision threshold used to stop real-valued search."
          },
          {
            term: "iteration budget",
            definition:
              "A fixed number of bisection steps guaranteeing enough precision."
          }
        ],
        workedExample: {
          title: "Integer square root by bisection",
          body:
            "Search the largest mid whose square does not exceed x.",
          code:
            "def my_sqrt(x):\n    if x < 2:\n        return x\n    lo, hi = 1, x // 2\n    ans = 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        sq = mid * mid\n        if sq == x:\n            return mid\n        if sq < x:\n            ans = mid\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return ans\n\n\nprint(my_sqrt(8), my_sqrt(9), my_sqrt(1))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why keep an ans variable when sq < x?",
            reveal:
              "mid is feasible but maybe not maximal. Record it and search higher to find the largest feasible integer root."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "For floats, do not stop on mid equality; stop on width or iteration count."
        }
      },
      {
        id: "proof-habits",
        heading: "Proof habits before coding answer search",
        paragraphs: [
          "Checklist: Is there a monotone boolean on an ordered domain? Can I evaluate feasible(mid) fast enough? Are lo and hi correct extremes? Do I want minimum or maximum feasible? Which bound update matches that goal?",
          "If monotonicity fails, binary search on answer is invalid—even if the code runs. Example: non-monotone scoring functions need other methods.",
          "Eating-speed and capacity problems are twins: redefine units, keep the same skeleton. That transfer is the skill."
        ],
        keyTerms: [
          {
            term: "monotonicity proof",
            definition:
              "An argument that feasible(x) implies feasible(y) for all y > x (or the reverse)."
          },
          {
            term: "search skeleton",
            definition:
              "The shared binary-search-plus-predicate template reused across prompts."
          },
          {
            term: "bound initialization",
            definition:
              "Choosing the smallest and largest plausible answers before searching."
          }
        ],
        workedExample: {
          title: "Minimum eating speed",
          body:
            "Same minimize-feasible pattern with a hours predicate.",
          code:
            "import math\n\n\ndef min_eating_speed(piles, h):\n    def can_finish(speed):\n        return sum(math.ceil(pile / speed) for pile in piles) <= h\n\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if can_finish(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo\n\n\nprint(min_eating_speed([3, 6, 7, 11], 8))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What is the monotonicity claim for eating speed?",
            reveal:
              "If speed k finishes in time, any speed > k also finishes, because each pile takes fewer or equal hours."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Lead with monotonicity, then bounds, then the predicate, then the binary search loop."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Closed-bound search needs a consistent interval invariant.",
        "Lower/upper bounds locate first-true positions and duplicate spans.",
        "Answer-space search optimizes monotone feasibility predicates.",
        "Real-valued bisection needs epsilon or iteration budgets.",
        "Proof habits prevent applying binary search where monotonicity fails."
      ],
      nextSteps: [
        "Implement lower_bound and first-bad-version from the same template.",
        "Solve one capacity and one speed problem back-to-back.",
        "Break a fake predicate that is not monotone and watch search fail."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaPatternsLabChapters = JSON.parse(JSON.stringify(chapters));
