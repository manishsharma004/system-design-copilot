/** @type {(...paragraphs: string[]) => string} */
const teachingBody = (...paragraphs) => paragraphs.join('\n\n');

/** @type {Record<string, import('./lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const dsaPatternsDeepKnowledge = {
  'dsa-patterns-lab/arrays-two-pointers-and-prefix-sums': {
    insights: [
      {
        heading: 'Operation-first pattern selection',
        body: teachingBody(
          `Array interview problems are often disguised operation-selection exercises. A nested pair loop is not bad because it has two loops; it is bad because it repeatedly asks a question that could be made cheaper. If the question is membership by value, a hash set can replace a scan. If the question is ordered proximity, sorting and two pointers can discard many candidates at once. If the question is range aggregation, prefix state avoids recomputing the same partial sums.`,
          `This operation-first framing keeps candidates from overfitting to memorized problem names. Two-sum, three-sum, subarray sum, meeting rooms, car pooling, and range updates all begin with "what work is repeated?" Once that is clear, constraints choose the pattern: sorted input permits ordered movement, immutable repeated queries reward preprocessing, offline updates allow delayed materialization, and memory limits may push you away from hash-heavy answers.`
        )
      },
      {
        heading: 'Two-pointer monotonicity proof',
        body: teachingBody(
          `Two pointers are correct only when each movement is justified by a monotonic fact. In a sorted pair sum, if values[left] + values[right] is too small, every pair using the current left with an index below right is also too small, so left can advance. If the sum is too large, every pair using the current right with an index above left is too large, so right can retreat. The proof removes whole groups of pairs, not just one guess.`,
          `This is why applying the template to unsorted arrays is invalid. Without order, increasing left can make the sum larger, smaller, or unrelated. A strong answer states what candidate region remains after each move. That invariant also handles duplicates, equality, and termination: the search stops when no pair remains inside the region, not when a magic number of iterations has run.`
        )
      },
      {
        heading: 'Prefix state as algebra',
        body: teachingBody(
          `Prefix sums work because range information can be represented as the difference between two cumulative states. If prefix[i] is the sum before index i, then sum(left..right) is prefix[right + 1] - prefix[left]. The same algebra appears in prefix counts, parity masks, and prefix remainders. A subarray with sum target exists when two prefixes differ by target; a substring with even character counts can be found when two parity masks are equal.`,
          `The initial zero prefix is not a convenience detail; it is the identity element that makes ranges starting at the beginning behave like every other range. Many bugs come from building prefix arrays of length n instead of n + 1 and then special-casing index zero. Half-open prefix conventions reduce those branches and make proofs shorter.`
        )
      },
      {
        heading: 'Offline updates and delayed work',
        body: teachingBody(
          `Difference arrays are a form of lazy propagation for simple range increments. Instead of doing work across every element immediately, they record where the effect starts and where it stops. A final prefix scan applies all pending deltas in order. This is a powerful mental model because it separates update intent from materialized state.`,
          `The limitation is just as important as the trick. A plain difference array is excellent for offline batches where no one asks for the true value between updates. If queries and updates interleave, delayed materialization is no longer enough; Fenwick trees, segment trees, or ordered event sweeps may be required. Interviewers value this boundary because it shows you understand when the pattern stops applying.`
        )
      }
    ],
    references: [
      {
        title: 'Prefix sum',
        url: 'https://en.wikipedia.org/wiki/Prefix_sum',
        source: 'Wikipedia',
        note: 'Useful background on cumulative sums, scans, and range-query preprocessing.'
      },
      {
        title: 'TimeComplexity',
        url: 'https://wiki.python.org/moin/TimeComplexity',
        source: 'Python Wiki',
        note: 'Practical operation costs for Python lists, dictionaries, and sets used in pattern tradeoffs.'
      },
      {
        title: 'Introduction to Algorithms',
        url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
        source: 'MIT Press',
        note: 'Canonical reference for sorting, searching, and asymptotic algorithm reasoning.'
      }
    ]
  },

  'dsa-patterns-lab/linked-lists-and-pointer-invariants': {
    insights: [
      {
        heading: 'Head mutation as predecessor mutation',
        body: teachingBody(
          `A dummy node changes the problem from "what if the head changes?" to "which predecessor points to the next kept node?" That transformation is small but deep. Deleting the first real node, appending the first result node, and partitioning into an initially empty list all become ordinary pointer writes after a stable dummy predecessor exists.`,
          `The dummy also improves proof structure. You can define prev as the last node known to remain in the output, curr as the node under inspection, and dummy.next as the output head. The loop preserves those meanings across head deletion, middle deletion, and no deletion. Returning dummy.next expresses that the dummy was scaffolding, not data.`
        )
      },
      {
        heading: 'Reversal as ownership transfer',
        body: teachingBody(
          `Iterative reversal is safest when viewed as moving one node at a time from an unreversed suffix to a reversed prefix. prev owns the reversed prefix. curr owns the suffix not yet processed. next_node temporarily preserves the rest of the suffix while curr.next is redirected. After the redirect, curr becomes the new prefix head and next_node becomes the next suffix head.`,
          `This ownership language scales to partial reversal and list reordering. In reverse-between problems, there are additional owners: the node before the reversed segment and the original segment head that becomes the segment tail. The same rule applies: save all links you will need before overwriting any link, and reconnect owned segments only after their internal mutation is complete.`
        )
      },
      {
        heading: 'Runner distance invariants',
        body: teachingBody(
          `Slow/fast pointer algorithms work because distance between runners encodes information. In middle finding, fast covers two nodes per slow node, so slow reaches half the traversed length when fast reaches the end. In kth-from-end removal, a lead pointer starts k nodes ahead, so when lead reaches the tail, the follower is just before the removal target. These are distance invariants, not arbitrary pointer tricks.`,
          `Loop guards are part of the invariant. If fast moves two links, fast and fast.next must exist before the move. If you need the predecessor of a target, start from a dummy rather than the head so the target may be the original head. A clean distance statement usually produces a clean guard condition.`
        )
      },
      {
        heading: 'Cycle arithmetic without extra memory',
        body: teachingBody(
          `Floyd cycle detection relies on relative speed. Once slow and fast are inside the cycle, fast gains one node per iteration, so it must eventually meet slow modulo the cycle length. That meeting proves a cycle exists but does not by itself identify the entry. The second phase aligns distances: one pointer starts at head, the other at the meeting point, and both move one step until they meet at the cycle entry.`,
          `A visited set also detects cycles and is often easier to reason about, but it uses O(n) memory. The O(1) pointer version demonstrates that the structure of the list itself contains enough information. A strong interview explanation names both phases and explains that fast reaching null is the no-cycle proof.`
        )
      }
    ],
    references: [
      {
        title: 'Linked list',
        url: 'https://en.wikipedia.org/wiki/Linked_list',
        source: 'Wikipedia',
        note: 'Overview of linked-list structure, traversal, insertion, and deletion tradeoffs.'
      },
      {
        title: 'Cycle detection',
        url: 'https://en.wikipedia.org/wiki/Cycle_detection',
        source: 'Wikipedia',
        note: 'Background on Floyd tortoise-and-hare and related cycle-finding algorithms.'
      },
      {
        title: 'Python Data Structures',
        url: 'https://docs.python.org/3/tutorial/datastructures.html',
        source: 'Python Documentation',
        note: 'Useful contrast between Python lists and pointer-style linked structures implemented manually.'
      }
    ]
  },

  'dsa-patterns-lab/binary-search-on-answer-spaces': {
    insights: [
      {
        heading: 'Bounds are part of correctness',
        body: teachingBody(
          `Binary search correctness starts before the loop. You must define what lo and hi mean and prove the answer is inside that range. In a closed equality search, lo and hi are candidate indices. In a half-open lower-bound search, the answer is in [lo, hi], with hi often allowed to equal one past the last index. In answer-space search, lo and hi are candidate answer values, not positions in the input.`,
          `When bounds are vague, off-by-one fixes become guesswork. A lower-bound template can be justified in one sentence: the first true value is always in [lo, hi]. If mid is true, hi = mid keeps it; if mid is false, lo = mid + 1 discards values proven false. That sentence is the proof and the implementation guide.`
        )
      },
      {
        heading: 'Lower and upper bound as predicate search',
        body: teachingBody(
          `Lower bound is the first index where values[i] >= target. Upper bound is the first index where values[i] > target. Both are first-true searches over a monotonic boolean predicate. This predicate view is more reusable than memorizing separate duplicate-search code, because first bad version, first feasible capacity, and first day meeting a target all share the same shape.`,
          `The duplicate-count trick follows from half-open ranges. All target occurrences live in [lower_bound(target), upper_bound(target)). The count is the length of that interval. If lower equals upper, the target is absent. This approach avoids scanning outward from an arbitrary found element and keeps logarithmic behavior even when most of the array contains duplicates.`
        )
      },
      {
        heading: 'Feasibility predicates need monotonicity',
        body: teachingBody(
          `Search-on-answer transforms optimization into decision. Instead of directly finding the minimum capacity, ask whether capacity x is enough. Instead of directly minimizing the largest group sum, ask whether a proposed limit can split the array into at most k groups. The decision must be monotonic: once the answer is feasible, every larger relaxed answer remains feasible, or the reverse for maximum feasible searches.`,
          `The predicate should usually be cheaper than enumerating answers. A greedy pass for shipping capacity is O(n), and binary search calls it O(log range) times. If the predicate itself tries all possibilities exponentially, binary search may not help. Good predicates use the structure of the proposed limit to make a local greedy or counting decision.`
        )
      },
      {
        heading: 'Continuous bisection is not integer search',
        body: teachingBody(
          `Real-valued binary search keeps the bracketing idea but changes termination. Floating-point lo and hi may never become equal, and exact comparison to a root is unreliable. Use a fixed iteration count or stop when hi - lo is below the required tolerance. The invariant remains that the answer is bracketed and every update preserves the bracket.`,
          `Precision requirements decide the implementation. For typical double precision, 60 iterations are enough for many interview ranges because each iteration halves error. But the answer format matters: absolute error, relative error, and rounded decimal output are different contracts. Clarifying the contract is part of the algorithm.`
        )
      }
    ],
    references: [
      {
        title: 'Binary search algorithm',
        url: 'https://en.wikipedia.org/wiki/Binary_search_algorithm',
        source: 'Wikipedia',
        note: 'General reference on binary search, bounds, and variants.'
      },
      {
        title: 'bisect — Array bisection algorithm',
        url: 'https://docs.python.org/3/library/bisect.html',
        source: 'Python Documentation',
        note: 'Python standard library reference for lower-bound and upper-bound style insertion points.'
      },
      {
        title: 'Binary Search',
        url: 'https://cp-algorithms.com/num_methods/binary_search.html',
        source: 'CP-Algorithms',
        note: 'Detailed discussion of binary search on predicates and answer spaces.'
      }
    ]
  },

  'dsa-search-lab/sliding-window-and-substring-invariants': {
    insights: [
      {
        heading: 'Window validity as a maintained contract',
        body: teachingBody(
          `A sliding window is not just two indices. It is a contract about the substring or subarray between them. For fixed windows, the contract is size. For longest unique substring, the contract is no duplicate characters. For minimum cover, the contract is all required counts satisfied. The state variables exist only to maintain and test that contract cheaply as the window moves.`,
          `This contract determines when to record answers. Longest-valid windows record after shrinking restores validity. Minimum-cover windows record while valid before removing a left character that may break coverage. Counting windows add the number of valid starts after the invariant is restored. Many wrong solutions have the right pointers but record at the wrong moment.`
        )
      },
      {
        heading: 'Monotonic repair requirement',
        body: teachingBody(
          `Variable windows are linear because the left pointer only moves forward and each left move moves the state toward validity. If a sum of nonnegative numbers is too large, removing from the left cannot increase it. If there are too many distinct values, removing from the left can eventually delete a distinct key. If a character is duplicated, removing from the left can eventually remove one copy.`,
          `When this repair property fails, the sliding-window template is not justified. Negative values in a sum constraint are the common counterexample: removing a negative can increase the sum, and keeping it may be necessary for a later valid subarray. Prefix sums, balanced trees, or dynamic programming may be needed instead. A strong candidate explicitly checks this before committing to the window.`
        )
      },
      {
        heading: 'Frequency maps and threshold crossings',
        body: teachingBody(
          `Frequency maps are useful when validity changes only when a count crosses a threshold. In minimum window substring, missing decreases when an entering character count is still within the needed count, and missing increases when a leaving character count falls below needed. In distinct-count windows, the number of distinct keys changes only when a count goes from zero to one or one to zero.`,
          `Tracking threshold crossings is better than comparing whole maps after every move. Whole-map comparison can be acceptable for tiny alphabets or simple anagram examples, but the scalable habit is to maintain a small validity counter. This is the same incremental-update principle that makes the window linear: only the entering and leaving items can change validity.`
        )
      },
      {
        heading: 'At-most transforms count many windows at once',
        body: teachingBody(
          `The at-most-K counting pattern is powerful because it counts sets of windows without enumerating them. Once [left, right] is valid for at most K distinct values, every start from left through right also forms a valid ending-at-right window. That contributes right - left + 1 answers immediately. The exact-K answer is the difference between two nested at-most populations.`,
          `This transform works because "at most K" and "at most K - 1" are monotonic families. Every window with at most K - 1 distinct values is also in the at-most-K set; subtracting removes them and leaves exactly K. The same idea applies to binary subarray sums because binary nonnegative values make at-most-sum windows maintainable by left shrinking.`
        )
      }
    ],
    references: [
      {
        title: 'Sliding window protocol',
        url: 'https://en.wikipedia.org/wiki/Sliding_window_protocol',
        source: 'Wikipedia',
        note: 'Not an algorithmic substring reference, but useful terminology for moving bounded windows.'
      },
      {
        title: 'collections — Container datatypes',
        url: 'https://docs.python.org/3/library/collections.html',
        source: 'Python Documentation',
        note: 'Reference for Counter and defaultdict, common stdlib helpers for window frequency maps.'
      },
      {
        title: 'TimeComplexity',
        url: 'https://wiki.python.org/moin/TimeComplexity',
        source: 'Python Wiki',
        note: 'Operation-cost reference for dictionary updates and string/list indexing used in window loops.'
      }
    ]
  },

  'dsa-search-lab/heaps-topk-and-priority-queues': {
    insights: [
      {
        heading: 'Heap property versus sorted order',
        body: teachingBody(
          `A heap is a partial order. The root is the minimum in a min-heap, but siblings and cousins are not globally ordered. This is why heap peek is O(1), push and pop are O(log n), and iterating over the underlying array is not sorted. The data structure is optimized for repeatedly extracting one extreme, not for arbitrary rank queries.`,
          `Confusing heap order with sorted order causes both correctness and presentation bugs. If the prompt asks for sorted output, popping all elements or sorting the heap at the end is needed. If the prompt asks only for kth largest or next task, maintaining the heap is enough. The answer should match the output contract, not just use a fashionable data structure.`
        )
      },
      {
        heading: 'Top-k as a lossy summary',
        body: teachingBody(
          `A size-k heap for top-k largest values is a lossy summary with a precise invariant: after processing each item, it contains the k largest values seen so far. The root is the weakest current winner. A new value below the root can be discarded forever because it is worse than k existing values. A new value above the root replaces that weakest winner.`,
          `This summary is especially useful for streams, large files, and dashboards where full ordering is unavailable or unnecessary. The complexity O(n log k) reflects that each input pays only for maintaining the small winner set. When k approaches n or the final full ranking is needed, sorting can be simpler and sometimes faster due to optimized library implementations.`
        )
      },
      {
        heading: 'Frontier expansion unifies merge and shortest paths',
        body: teachingBody(
          `Merge-K sorted lists and Dijkstra's algorithm share a frontier idea. Keep the best currently known candidate in a priority queue, pop it, then reveal the next candidates that become available because of that pop. In merge-K, popping from one source reveals that source's next element. In Dijkstra, finalizing one node reveals relaxed neighbor distances.`,
          `The correctness arguments differ but rhyme. Merge-K relies on each source being sorted, so no hidden smaller item exists behind a larger source head. Dijkstra relies on nonnegative edge weights, so once the smallest tentative distance is popped, no future path through a longer frontier can make it smaller. In both cases, the heap is a disciplined frontier, not a bag of all possibilities.`
        )
      },
      {
        heading: 'Mutable priorities require consistency strategy',
        body: teachingBody(
          `Many practical priority queues need priority updates or deletion by key, but Python's heapq exposes only push and pop over an array. A common workaround is lazy deletion: push the new priority, keep a map of the current priority, and ignore stale popped entries. This preserves simple heap operations while moving consistency checks to pop time.`,
          `Lazy deletion trades memory for implementation simplicity. If updates are frequent and pops are rare, stale entries can accumulate. Production systems may use indexed heaps, balanced trees, or specialized queues to support decrease-key or deletion directly. In interviews, lazy deletion is often enough if you name the stale-entry behavior and show how the map prevents returning old priorities.`
        )
      }
    ],
    references: [
      {
        title: 'heapq — Heap queue algorithm',
        url: 'https://docs.python.org/3/library/heapq.html',
        source: 'Python Documentation',
        note: 'Python stdlib reference for heap operations, priority queues, and implementation notes.'
      },
      {
        title: 'Binary heap',
        url: 'https://en.wikipedia.org/wiki/Binary_heap',
        source: 'Wikipedia',
        note: 'Overview of the heap property, array layout, and operation costs.'
      },
      {
        title: 'Dijkstra algorithm',
        url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm',
        source: 'Wikipedia',
        note: 'Background on priority-queue shortest paths and nonnegative edge-weight requirements.'
      }
    ]
  },

  'dsa-search-lab/recursion-backtracking-and-pruning': {
    insights: [
      {
        heading: 'State definition controls the tree',
        body: teachingBody(
          `Every recursive search call should have a sentence meaning. "dfs(index) decides for values[index:]." "dfs(start) chooses later candidates for this combination." "dfs(row, col, i) tries to match word[i:] from this grid cell." Once that sentence is clear, base cases and choices follow naturally. Without it, recursion becomes a stack of side effects with unclear ownership.`,
          `The state also determines complexity. Include/exclude over n items creates a binary tree with up to 2^n leaves. Permutations branch n, then n - 1, then n - 2, producing n! leaves. Board searches branch by neighbors and depth. This complexity is not an implementation accident; it is the number of decisions the problem may require unless constraints allow pruning or memoization.`
        )
      },
      {
        heading: 'Undo discipline and path copies',
        body: teachingBody(
          `Backtracking often mutates shared structures because copying at every call is expensive. The discipline is choose, recurse, undo. If you append to path, pop it. If you mark a cell visited, unmark it. If you increment a count, decrement it. The invariant is that when a call returns, the caller's state is exactly as it was before that choice.`,
          `Recording answers is the exception: the result must receive a snapshot, not the live mutable path. Appending path directly stores a reference that later undo operations will mutate, often leaving many empty or identical answers. The same snapshot idea applies to boards and assignment arrays. Copy only at answer boundaries or when correctness is clearer and input size allows it.`
        )
      },
      {
        heading: 'Duplicate control is structural',
        body: teachingBody(
          `Duplicate outputs should usually be prevented by the search structure, not removed afterward with a set of serialized answers. For combinations, a start index prevents reordered duplicates. For duplicate candidate values, sorting plus "skip equal value at the same depth" prevents generating the same combination through identical choices. For permutations with duplicates, count maps or depth-level skip rules preserve uniqueness.`,
          `Structural duplicate control is more efficient and easier to prove. The rule should be tied to a meaning: skip this value because an identical value at the same depth has already represented this branch. Do not skip equal values across different depths blindly; that can remove valid answers such as choosing two equal numbers when both are available.`
        )
      },
      {
        heading: 'Pruning versus memoization boundary',
        body: teachingBody(
          `Pruning and memoization reduce search in different ways. Pruning proves a branch cannot lead to a useful answer and never explores it. Memoization explores a state once, remembers the result, and reuses it when another path reaches the same state. Pruning needs bounds; memoization needs overlapping subproblems and a complete state key.`,
          `The boundary is easiest to see in subset problems. If the prompt asks whether a target is possible, the future from (index, remaining) is independent of the path, so memoization is valid. If the prompt asks for all subsets that hit the target, distinct paths are the output, so caching only booleans is not enough. If sorted positive candidates exceed the remaining target, pruning is valid because later candidates are even larger.`
        )
      }
    ],
    references: [
      {
        title: 'Backtracking',
        url: 'https://en.wikipedia.org/wiki/Backtracking',
        source: 'Wikipedia',
        note: 'General reference on depth-first search, candidates, constraints, and backtracking structure.'
      },
      {
        title: 'functools — Higher-order functions and operations on callable objects',
        url: 'https://docs.python.org/3/library/functools.html',
        source: 'Python Documentation',
        note: 'Reference for lru_cache and cache decorators used in memoized recursion.'
      },
      {
        title: 'Combinatorial generation',
        url: 'https://en.wikipedia.org/wiki/Combinatorial_generation',
        source: 'Wikipedia',
        note: 'Further reading on generating combinations, permutations, and other discrete structures.'
      }
    ]
  }
};
