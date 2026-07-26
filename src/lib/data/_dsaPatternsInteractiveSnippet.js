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
export const dsaPatternsInteractive = {
  'dsa-patterns-lab/arrays-two-pointers-and-prefix-sums': {
    title: 'Array pattern selection lab',
    summary:
      'Choose between hash maps, sorting, two pointers, prefix sums, and difference arrays by identifying the repeated operation and the constraint that makes it expensive.',
    takeaways: [
      'Two pointers need ordered data or another monotonic reason for every pointer move.',
      'Prefix sums turn repeated range queries into subtraction between cumulative states.',
      'Difference arrays turn many offline range updates into endpoint marks plus one final scan.'
    ],
    examples: [
      {
        id: 'pair-sum-choice',
        label: 'Pair sum',
        title: 'Trade memory for linear lookup or sort to expose order',
        scenario:
          'An array has 300,000 integers and the interviewer asks for indices of two values that sum to a target.',
        decision: 'Use a one-pass hash map when original indices matter and O(n) extra space is acceptable.',
        why: [
          'The repeated operation is complement lookup.',
          'Expected O(1) dictionary lookup changes the dominant cost from pair enumeration to one scan.',
          'Sorting would require preserving original indices and adds O(n log n) time.'
        ],
        alternative:
          'Sort value-index pairs and use two pointers if memory is tighter or if ordered scans will be reused.',
        outcome:
          'The solution is not a memorized two-sum trick; it is a defended time-space decision.'
      },
      {
        id: 'range-update-batch',
        label: 'Range corrections',
        title: 'Use difference arrays when updates are known before reads',
        scenario:
          'A batch job applies thousands of inclusive score corrections to a leaderboard array before publishing the final table.',
        decision: 'Mark each update in a difference array, then materialize once with a prefix scan.',
        why: [
          'Each update becomes O(1) instead of touching every covered index.',
          'The final scan is linear in the leaderboard length.',
          'The job is offline, so intermediate materialized values are unnecessary.'
        ],
        alternative:
          'If reads happen between updates, use a Fenwick tree or segment tree rather than a plain difference array.',
        outcome:
          'Batch semantics reduce the work from update-count times range-length to updates plus one scan.'
      }
    ],
    decisionGuide: {
      prompt: 'Which array pattern should you reach for first?',
      options: [
        {
          id: 'hashing',
          label: 'Hash map or set',
          bestFor: 'Membership, counting, grouping, duplicate detection, and complement lookup.',
          chooseWhen: [
            'Order is not the core signal.',
            'Expected O(1) lookup removes repeated scanning.',
            'O(n) auxiliary memory is acceptable.'
          ],
          tradeOffs: [
            'Memory usage can dominate large inputs.',
            'Worst-case collisions are possible in theory.',
            'Ordering information may need to be preserved separately.'
          ],
          alternativeOutcome:
            'Skipping hashing can leave a clean but quadratic scan when constraints are large.'
        },
        {
          id: 'ordered-two-pointer',
          label: 'Sort plus two pointers',
          bestFor: 'Pair, interval, deduplication, and proximity problems where order discards many candidates.',
          chooseWhen: [
            'The input is already sorted or sorting is allowed.',
            'The pointer movement has a monotonic proof.',
            'Original order is irrelevant or indices can be carried.'
          ],
          tradeOffs: [
            'Sorting costs O(n log n).',
            'Mutation or copies may matter.',
            'Duplicate handling must be explicit.'
          ],
          alternativeOutcome:
            'Using two pointers without order creates a loop with no correctness proof.'
        },
        {
          id: 'range-preprocess',
          label: 'Prefix or difference array',
          bestFor: 'Many range queries or many offline range updates.',
          chooseWhen: [
            'The array is reused across queries or updates.',
            'Range endpoints are known and consistent.',
            'Preprocessing is cheaper than repeating range work.'
          ],
          tradeOffs: [
            'Prefix sums need rebuilds after mutation.',
            'Difference arrays answer final state, not arbitrary interleaved reads.',
            'Index convention mistakes are common.'
          ],
          alternativeOutcome:
            'Directly looping through every range often passes samples and fails scale.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Optimize a promotions analytics scan',
      prompt:
        'A promotions report receives immutable purchase values, thousands of range-sum reads, and a nightly batch of correction intervals.',
      steps: [
        {
          title: 'Separate read and correction phases',
          detail: 'Use prefix sums for daytime immutable range reads, then apply nightly corrections as a batch before rebuilding prefixes.',
          whatIf: 'Mixing the phases can make a static prefix array return stale answers after corrections.'
        },
        {
          title: 'Use difference marks for nightly updates',
          detail: 'Represent each correction with start and end markers so the batch cost is proportional to corrections plus array length.',
          whatIf: 'Updating every covered purchase row repeats range work thousands of times.'
        },
        {
          title: 'Rebuild query state once',
          detail: 'After materializing corrected values, rebuild the prefix array that powers the next read window.',
          whatIf: 'Trying to patch prefix sums per correction is more complex and easy to get wrong.'
        }
      ],
      metrics: ['range query count', 'correction interval count', 'array length', 'prefix rebuild time']
    }),
    mermaid: {
      title: 'Array pattern decision flow',
      caption: 'Name the repeated operation, then pick the structure that removes it.',
      code: `flowchart LR
    Operation[Repeated operation] --> Lookup{Lookup by value?}
    Lookup -->|yes| Hash[Hash map or set]
    Lookup -->|no| Ordered{Order helps discard?}
    Ordered -->|yes| Pointers[Sort / two pointers]
    Ordered -->|no| Range{Range reuse?}
    Range -->|queries| Prefix[Prefix sums]
    Range -->|updates| Difference[Difference array]
      `
    }
  },

  'dsa-patterns-lab/linked-lists-and-pointer-invariants': {
    title: 'Linked-list pointer invariant lab',
    summary:
      'Practice dummy nodes, slow-fast runners, reversal, merge, and cycle detection by naming what every pointer owns before mutating links.',
    takeaways: [
      'Dummy nodes remove head special cases by creating a stable predecessor.',
      'Reversal is a controlled transfer from unreversed suffix to reversed prefix.',
      'Floyd pointers separate cycle existence from cycle entry location.'
    ],
    examples: [
      {
        id: 'delete-head',
        label: 'Deletion',
        title: 'Use a dummy predecessor when the first real node may disappear',
        scenario:
          'Remove every node matching a target value from a singly linked list, including possible target values at the head.',
        decision: 'Create dummy.next = head and let prev always mean the last retained node.',
        why: [
          'The head is no longer a special mutation case.',
          'prev.next can skip the current node uniformly.',
          'Returning dummy.next captures any new head.'
        ],
        alternative:
          'Handling leading matches in a separate loop works but creates a second code path to test.',
        outcome:
          'Deletion becomes one invariant-driven pass.'
      },
      {
        id: 'cycle-entry',
        label: 'Cycle entry',
        title: 'Use two Floyd phases instead of a visited set when O(1) space is requested',
        scenario:
          'A linked list may contain a cycle, and the prompt asks for the node where the cycle begins.',
        decision: 'First meet slow and fast inside the cycle, then reset one pointer to head and walk both one step.',
        why: [
          'The first phase proves a cycle exists.',
          'The second phase uses distance alignment to find the entry.',
          'The algorithm keeps O(1) auxiliary space.'
        ],
        alternative:
          'A visited set is simpler to explain but uses O(n) memory and misses the pointer-pattern intent.',
        outcome:
          'The answer demonstrates both pointer reasoning and memory discipline.'
      }
    ],
    decisionGuide: {
      prompt: 'Which linked-list pointer pattern fits the mutation?',
      options: [
        {
          id: 'dummy-tail',
          label: 'Dummy and tail',
          bestFor: 'Building, filtering, partitioning, or merging a result list.',
          chooseWhen: [
            'The result head may not be known yet.',
            'The original head may be removed.',
            'Appending to a result should be uniform.'
          ],
          tradeOffs: [
            'The dummy must not be returned directly.',
            'Reusing nodes mutates inputs.',
            'tail must advance after each attachment.'
          ],
          alternativeOutcome:
            'Manual head special cases make edge cases more likely.'
        },
        {
          id: 'slow-fast',
          label: 'Slow and fast runners',
          bestFor: 'Middle, cycle, kth-from-end, and relative-distance problems.',
          chooseWhen: [
            'Two pointers moving at different speeds reveal structure.',
            'The loop guard can prove safe access.',
            'One-pass space-efficient traversal matters.'
          ],
          tradeOffs: [
            'Even-length middle semantics must be chosen.',
            'Pointer guards are easy to under-specify.',
            'Cycle-entry proof is less intuitive than visited sets.'
          ],
          alternativeOutcome:
            'Counting length first can be clearer but may require extra passes.'
        },
        {
          id: 'reverse-transfer',
          label: 'Three-pointer reversal',
          bestFor: 'Full reversal, partial reversal, palindrome checks, and reorder operations.',
          chooseWhen: [
            'Links must be reversed in place.',
            'The rest of the list can be saved before rewiring.',
            'The caller permits mutation.'
          ],
          tradeOffs: [
            'Losing next_node loses the suffix.',
            'Partial reversal has more reconnection points.',
            'Input mutation may need to be restored.'
          ],
          alternativeOutcome:
            'Copying values avoids pointer mutation but may violate the linked-list constraint.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Reorder a linked list in place',
      prompt:
        'Transform L0->L1->...->Ln into L0->Ln->L1->Ln-1... without allocating a second list of nodes.',
      steps: [
        {
          title: 'Find and split the middle',
          detail: 'Use slow and fast pointers, then terminate the first half so each half has a clear owner.',
          whatIf: 'If the split is not explicit, reversal can accidentally keep the original chain connected.'
        },
        {
          title: 'Reverse the second half',
          detail: 'Use prev, curr, and next_node to make the tail half available from last to middle.',
          whatIf: 'Overwriting curr.next before saving next_node loses the remaining nodes.'
        },
        {
          title: 'Weave two owned lists',
          detail: 'Alternate nodes from first and reversed second halves while saving both next links before reconnecting.',
          whatIf: 'Advancing after rewiring without saved links can create cycles or skip nodes.'
        }
      ],
      metrics: ['node count', 'pointer writes', 'extra node allocations', 'edge-case list lengths']
    }),
    mermaid: {
      title: 'Reorder ownership phases',
      caption: 'Each phase gives a pointer a precise segment to own.',
      code: `flowchart LR
    Head[Original list] --> Split[Slow/fast split]
    Split --> First[First half]
    Split --> Second[Second half]
    Second --> Reverse[Reverse second half]
    First --> Weave[Weave alternately]
    Reverse --> Weave
      `
    }
  },

  'dsa-patterns-lab/binary-search-on-answer-spaces': {
    title: 'Binary search invariant lab',
    summary:
      'Move from equality search to lower bounds and answer-space search by proving monotonic predicates and preserving candidate ranges.',
    takeaways: [
      'Lower bound is first true, not any matching element.',
      'Search-on-answer needs a feasible predicate that changes direction only once.',
      'Correct bounds and shrinking updates are the proof of termination.'
    ],
    examples: [
      {
        id: 'duplicate-range',
        label: 'Duplicates',
        title: 'Use lower and upper bounds to answer duplicate questions',
        scenario:
          'A sorted array contains many repeated timestamps, and the prompt asks how many events have timestamp t.',
        decision: 'Compute lower_bound(t) and upper_bound(t), then subtract.',
        why: [
          'An equality search can return any occurrence.',
          'Bounds provide the exact half-open duplicate range.',
          'The count is a direct arithmetic result.'
        ],
        alternative:
          'Scanning outward from an arbitrary match can degrade to O(n) when duplicates dominate.',
        outcome:
          'Duplicate handling becomes predictable and logarithmic.'
      },
      {
        id: 'capacity-answer',
        label: 'Capacity',
        title: 'Binary search the smallest feasible capacity',
        scenario:
          'Packages must be shipped in D days, and a proposed capacity either succeeds or fails.',
        decision: 'Use a greedy days_needed(capacity) predicate and lower-bound the first feasible capacity.',
        why: [
          'If capacity works, any larger capacity also works.',
          'The lower bound is at least the heaviest package.',
          'The upper bound can be the sum of all packages.'
        ],
        alternative:
          'Trying every capacity between bounds is correct but wastes the monotonic structure.',
        outcome:
          'The solution searches the answer space, not the input array.'
      }
    ],
    decisionGuide: {
      prompt: 'What kind of binary search is this?',
      options: [
        {
          id: 'equality',
          label: 'Classic equality search',
          bestFor: 'Finding whether a target value exists in sorted data.',
          chooseWhen: [
            'The input itself is sorted.',
            'Any matching index is acceptable.',
            'Duplicates do not require first or last position.'
          ],
          tradeOffs: [
            'It does not answer insertion point by itself.',
            'Duplicate-heavy prompts often need bounds instead.',
            'Closed-bound templates need careful hi updates.'
          ],
          alternativeOutcome:
            'Using equality search for first occurrence creates flaky duplicate behavior.'
        },
        {
          id: 'lower-bound',
          label: 'First true lower bound',
          bestFor: 'First bad, insertion point, first value meeting a threshold, or first feasible answer.',
          chooseWhen: [
            'A predicate is false before the answer and true at or after it.',
            'You need the leftmost acceptable position.',
            'Keeping mid when true preserves the candidate.'
          ],
          tradeOffs: [
            'No-true cases return the right boundary.',
            'The predicate must be monotonic.',
            'Off-by-one errors appear when hi is inclusive by accident.'
          ],
          alternativeOutcome:
            'Discarding mid on a true branch can skip the first feasible value.'
        },
        {
          id: 'continuous',
          label: 'Continuous bisection',
          bestFor: 'Approximate roots, distances, and rates with a tolerance.',
          chooseWhen: [
            'The search space is real-valued.',
            'A tolerance or fixed iteration count is acceptable.',
            'The answer remains bracketed.'
          ],
          tradeOffs: [
            'Exact equality is unreliable with floats.',
            'Precision requirements must be explicit.',
            'Integer templates do not transfer directly.'
          ],
          alternativeOutcome:
            'Waiting for float bounds to meet can loop forever.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Find the smallest feasible worker limit',
      prompt:
        'Split a sequence of jobs into k contiguous groups while minimizing the maximum group load.',
      steps: [
        {
          title: 'Bound the answer',
          detail: 'The limit must be at least the largest single job and at most the sum of all jobs.',
          whatIf: 'A lower bound below max(job) lets impossible candidates waste predicate calls.'
        },
        {
          title: 'Define feasibility',
          detail: 'Greedily form groups without exceeding a proposed limit and count how many groups are required.',
          whatIf: 'A predicate that tries all splits is correct but defeats the purpose of binary search.'
        },
        {
          title: 'Prove monotonicity',
          detail: 'If a limit works with at most k groups, any larger limit also works because it only relaxes constraints.',
          whatIf: 'Without monotonicity, discarding half the answer space is unjustified.'
        }
      ],
      metrics: ['lower bound', 'upper bound', 'predicate calls', 'group count per limit']
    }),
    mermaid: {
      title: 'Search-on-answer proof loop',
      caption: 'Bounds and monotonic feasibility turn optimization into lower bound search.',
      code: `flowchart LR
    Bounds[Choose bounds] --> Predicate[Feasibility predicate]
    Predicate --> Mono{Monotonic?}
    Mono -->|yes| Search[Lower-bound binary search]
    Search --> Proof[Branch proof]
    Proof --> Answer[First feasible answer]
      `
    }
  },

  'dsa-search-lab/sliding-window-and-substring-invariants': {
    title: 'Sliding-window invariant lab',
    summary:
      'Practice fixed windows, variable shrink rules, substring frequency maps, and at-most-K counting with explicit validity conditions.',
    takeaways: [
      'A variable window is valid only when shrinking from the left can repair violations.',
      'Frequency maps should make validity updates constant-time per move.',
      'Exact-K counting is often at_most(K) minus at_most(K - 1).'
    ],
    examples: [
      {
        id: 'unique-substring',
        label: 'Unique window',
        title: 'Shrink until the duplicated entering character is repaired',
        scenario:
          'Find the longest substring without repeated characters in a stream-like single pass.',
        decision: 'Maintain counts and move left while the entering character count exceeds one.',
        why: [
          'The right edge is the only new violation source.',
          'Removing from the left eventually removes the duplicate.',
          'Both pointers move forward at most n times.'
        ],
        alternative:
          'Checking every substring and building a set each time repeats O(n^2) or worse work.',
        outcome:
          'The invariant turns duplicate repair into a linear scan.'
      },
      {
        id: 'exact-k-distinct',
        label: 'Exact K',
        title: 'Count exact distinct windows by subtracting at-most counts',
        scenario:
          'Count subarrays containing exactly K distinct ids.',
        decision: 'Implement at_most(K) with a variable window, then subtract at_most(K - 1).',
        why: [
          'At-most distinct is monotonic under left shrinking.',
          'Every valid window ending at right contributes right - left + 1 starts.',
          'Exact distinct is the difference between two nested sets of windows.'
        ],
        alternative:
          'Trying to maintain exactly K directly often misses starts that remain valid after shrink steps.',
        outcome:
          'A hard exact-count prompt becomes two standard at-most scans.'
      }
    ],
    decisionGuide: {
      prompt: 'Which window shape matches the prompt?',
      options: [
        {
          id: 'fixed',
          label: 'Fixed size',
          bestFor: 'Maximum sum of length k, anagrams, and fixed-length rolling metrics.',
          chooseWhen: [
            'The window length is specified.',
            'The left edge is determined by right and k.',
            'Only entering and leaving elements change state.'
          ],
          tradeOffs: [
            'Answers before the first full window are invalid.',
            'Stale state must be removed exactly once.',
            'Variable constraints need a different template.'
          ],
          alternativeOutcome:
            'A while-shrink loop can obscure a simple fixed-size invariant.'
        },
        {
          id: 'variable-validity',
          label: 'Variable validity',
          bestFor: 'Longest valid, shortest covering, and bounded-resource windows.',
          chooseWhen: [
            'Expanding may violate a condition.',
            'Moving left can restore validity.',
            'The answer is recorded after validity is known.'
          ],
          tradeOffs: [
            'The shrink condition must be exact.',
            'Negative values can break sum monotonicity.',
            'Minimum and maximum objectives record at different times.'
          ],
          alternativeOutcome:
            'Using the same recording point for min and max windows often returns off-by-one answers.'
        },
        {
          id: 'at-most',
          label: 'At-most transform',
          bestFor: 'Counting exact K distinct values, binary subarray sums, and bounded categories.',
          chooseWhen: [
            'At-most K is easy to maintain.',
            'Exact K can be expressed as a difference.',
            'Each valid right edge contributes many starts.'
          ],
          tradeOffs: [
            'The at_most(-1) edge case must return zero.',
            'The values must support a monotonic shrink rule.',
            'Counting logic differs from longest-length logic.'
          ],
          alternativeOutcome:
            'Direct exact-K shrink loops are harder to prove and easy to undercount.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Detect bounded-risk chat windows',
      prompt:
        'A moderation tool scans messages for the shortest substring covering required signals and the longest substring with at most two risky categories.',
      steps: [
        {
          title: 'Split objectives',
          detail: 'Use minimum-cover logic for required signals and at-most-K logic for risky category bounds.',
          whatIf: 'One generic window loop will record answers at the wrong time for one objective.'
        },
        {
          title: 'Define validity counters',
          detail: 'Track missing required signal instances for cover and distinct risky categories for bounded windows.',
          whatIf: 'Comparing full maps per substring makes the scan unnecessarily expensive.'
        },
        {
          title: 'Prove shrink rules',
          detail: 'Removing from the left can reduce over-limit categories or eventually break coverage in a predictable way.',
          whatIf: 'Without a shrink proof, the window may skip valid substrings.'
        }
      ],
      metrics: ['left moves', 'right moves', 'missing count', 'distinct category count']
    }),
    mermaid: {
      title: 'Variable window cycle',
      caption: 'Expand, repair validity, then record according to the objective.',
      code: `flowchart LR
    Expand[Add right item] --> Invalid{Invariant valid?}
    Invalid -->|no| Shrink[Remove left item]
    Shrink --> Invalid
    Invalid -->|yes| Record[Record answer]
    Record --> Expand
      `
    }
  },

  'dsa-search-lab/heaps-topk-and-priority-queues': {
    title: 'Heap priority lab',
    summary:
      'Use heaps when the repeated operation is extracting the current extreme, not when the whole collection needs to be sorted or searched arbitrarily.',
    takeaways: [
      'A heap exposes the current min or max efficiently but is not a sorted array.',
      'Top-k streams keep only candidates that can still enter the answer.',
      'K-way merge and Dijkstra both expand the cheapest frontier candidate.'
    ],
    examples: [
      {
        id: 'stream-top-k',
        label: 'Streaming top-k',
        title: 'Keep a heap of winners instead of sorting every update',
        scenario:
          'A leaderboard receives millions of score updates and only needs the current top 20 scores.',
        decision: 'Maintain a min-heap of size 20 for the current largest scores.',
        why: [
          'The weakest winner is always at the root.',
          'New scores below the root cannot enter the answer.',
          'Each useful update costs O(log k), not O(log n).'
        ],
        alternative:
          'Sorting every score after each update is simple but wastes almost all work.',
        outcome:
          'The data structure matches the product question: current top few, not full order.'
      },
      {
        id: 'sorted-log-merge',
        label: 'K-way merge',
        title: 'Merge sorted logs by keeping one frontier row per source',
        scenario:
          'Several services export already sorted event logs that must be read in global timestamp order.',
        decision: 'Push the first event from each log, pop the earliest, then push the next event from that same log.',
        why: [
          'The heap size is bounded by the number of logs.',
          'The algorithm streams without flattening all events first.',
          'Each pop advances exactly one source.'
        ],
        alternative:
          'Flattening and sorting requires all events in memory and costs O(n log n).',
        outcome:
          'Sorted upstream work is preserved instead of discarded.'
      }
    ],
    decisionGuide: {
      prompt: 'Should this be a heap, a sort, or another structure?',
      options: [
        {
          id: 'heap',
          label: 'Heap priority queue',
          bestFor: 'Repeated min/max extraction, streaming top-k, scheduling, merge-k, and nonnegative shortest paths.',
          chooseWhen: [
            'Only the next priority item is needed at each step.',
            'The data arrives incrementally or k is small.',
            'Full ordering would be wasted work.'
          ],
          tradeOffs: [
            'Arbitrary lookup is not efficient.',
            'Priority updates need lazy deletion or indexed structures.',
            'Tie-breaking must be explicit.'
          ],
          alternativeOutcome:
            'Using sort repeatedly often multiplies work after every update.'
        },
        {
          id: 'sort',
          label: 'Full sort',
          bestFor: 'One-time full ordering, large k, deterministic ranked output, and simple batch problems.',
          chooseWhen: [
            'All data is available.',
            'The answer needs most or all elements ordered.',
            'Simplicity beats maintaining incremental state.'
          ],
          tradeOffs: [
            'Costs O(n log n) even for tiny k.',
            'Cannot naturally handle infinite streams.',
            'May require storing all inputs.'
          ],
          alternativeOutcome:
            'Avoiding sort can overcomplicate straightforward batch ranking.'
        },
        {
          id: 'hash-or-tree',
          label: 'Hash map or ordered tree',
          bestFor: 'Arbitrary lookup, membership, deletion by key, or ordered range queries.',
          chooseWhen: [
            'You need to find or update a known item.',
            'The priority is not the only access path.',
            'Range queries matter.'
          ],
          tradeOffs: [
            'Hash maps do not give min/max order.',
            'Balanced trees are not built into Python stdlib as a general map.',
            'Combining heap and map requires consistency handling.'
          ],
          alternativeOutcome:
            'A heap alone cannot answer "where is this task?" efficiently.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Build an incremental incident scheduler',
      prompt:
        'An on-call tool schedules incident tasks by urgency, supports priority changes, and always shows the next task to handle.',
      steps: [
        {
          title: 'Choose heap for next task',
          detail: 'A priority queue gives O(1) peek and O(log n) insertion for the next most urgent task.',
          whatIf: 'A sorted list makes arbitrary inserts expensive or forces frequent resorting.'
        },
        {
          title: 'Handle priority changes lazily',
          detail: 'Push a new entry for changed priority and keep a current-priority map so stale entries are skipped at pop time.',
          whatIf: 'Trying to edit heap entries in place is awkward without an indexed heap.'
        },
        {
          title: 'Define tie-breaking',
          detail: 'Include sequence number or creation time so equal priorities produce deterministic ordering.',
          whatIf: 'Unorderable task objects can crash tuple comparison during ties.'
        }
      ],
      metrics: ['heap size', 'stale entry ratio', 'priority changes', 'pop latency']
    }),
    mermaid: {
      title: 'Priority frontier expansion',
      caption: 'The heap stores frontier candidates; each pop may add the next candidate from the same source.',
      code: `flowchart LR
    Sources[Sorted sources / graph edges] --> Heap[Priority queue]
    Heap --> Pop[Pop best candidate]
    Pop --> Output[Emit or finalize]
    Pop --> Next[Push next frontier item]
    Next --> Heap
      `
    }
  },

  'dsa-search-lab/recursion-backtracking-and-pruning': {
    title: 'Backtracking search lab',
    summary:
      'Explore decision trees with choose-recurse-undo discipline, duplicate control, sound pruning, and memoization only when state overlap exists.',
    takeaways: [
      'A backtracking call represents partial choices plus the remaining search space.',
      'Undo steps preserve sibling-branch independence when shared state is mutated.',
      'Memoization belongs only when the future depends on a compact repeated state.'
    ],
    examples: [
      {
        id: 'combination-start',
        label: 'Combinations',
        title: 'Use start index to avoid generating reordered duplicates',
        scenario:
          'Generate every size-k group from a list where group order does not matter.',
        decision: 'Pass a start index and only choose later positions after each pick.',
        why: [
          'The path [1, 2] is generated, while [2, 1] is structurally impossible.',
          'Remaining-slot pruning becomes straightforward.',
          'The state is small: start plus current path.'
        ],
        alternative:
          'Generating permutations then deduplicating wastes factorial work.',
        outcome:
          'The search tree matches the mathematical object being generated.'
      },
      {
        id: 'target-memo',
        label: 'Memo boundary',
        title: 'Memoize target feasibility when paths reach the same state',
        scenario:
          'Determine whether a subset of numbers can make a target sum, not list every subset.',
        decision: 'Cache (index, remaining) because future feasibility depends only on those values.',
        why: [
          'Many include/exclude paths reach the same remaining target at the same index.',
          'The full path does not matter for a boolean feasibility answer.',
          'The cache changes repeated exponential work into bounded state exploration.'
        ],
        alternative:
          'For outputting all subsets, memoization is less direct because distinct paths must be returned.',
        outcome:
          'The algorithm crosses from pure backtracking into dynamic programming at the right boundary.'
      }
    ],
    decisionGuide: {
      prompt: 'How should a recursive search be structured?',
      options: [
        {
          id: 'generate',
          label: 'Generate all valid outputs',
          bestFor: 'Subsets, combinations, permutations, parentheses, and board placements.',
          chooseWhen: [
            'The prompt asks for all configurations.',
            'Path identity matters in the output.',
            'The search tree can be pruned but not collapsed entirely.'
          ],
          tradeOffs: [
            'Output size may be exponential.',
            'Results need copies of mutable paths.',
            'Ordering and duplicate rules must be explicit.'
          ],
          alternativeOutcome:
            'Returning only counts or booleans fails prompts that require concrete configurations.'
        },
        {
          id: 'optimize-prune',
          label: 'Optimize with pruning',
          bestFor: 'Assignment, partitioning, and branch-and-bound search.',
          chooseWhen: [
            'A current best answer gives a bound.',
            'Partial states can be proven unable to improve the best.',
            'Choices can be ordered to find strong candidates early.'
          ],
          tradeOffs: [
            'Unsound pruning breaks correctness.',
            'Worst-case complexity may remain exponential.',
            'The bound must be explained clearly.'
          ],
          alternativeOutcome:
            'Exploring every branch may be correct but impossible for interview constraints.'
        },
        {
          id: 'memoize',
          label: 'Memoized recursion',
          bestFor: 'Feasibility or counting problems with overlapping subproblems.',
          chooseWhen: [
            'Multiple paths reach the same future state.',
            'The state key captures all relevant history.',
            'The prompt does not require preserving every route separately.'
          ],
          tradeOffs: [
            'A missing state dimension gives wrong reuse.',
            'Cache memory can be large.',
            'Generation problems may need richer cached values.'
          ],
          alternativeOutcome:
            'Pure recursion can recompute the same state exponentially many times.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Assign jobs to minimize maximum worker load',
      prompt:
        'A scheduler must assign jobs to k workers and minimize the maximum load, with only a dozen jobs but many possible assignments.',
      steps: [
        {
          title: 'Order hard choices first',
          detail: 'Sort jobs descending so large jobs create constraints early and improve pruning.',
          whatIf: 'Small jobs first can fill many symmetric states before discovering impossible large placements.'
        },
        {
          title: 'Track mutable worker loads',
          detail: 'Choose a worker, add the job load, recurse, then subtract it before trying the next worker.',
          whatIf: 'Missing the undo leaks work into sibling assignments.'
        },
        {
          title: 'Prune by current best and symmetry',
          detail: 'Skip branches whose current max load already exceeds the best and avoid assigning the same job to equivalent empty workers repeatedly.',
          whatIf: 'Without sound pruning, the factorial-like assignment tree overwhelms the small input.'
        }
      ],
      metrics: ['job count', 'worker count', 'current best load', 'branches pruned']
    }),
    mermaid: {
      title: 'Backtracking state lifecycle',
      caption: 'Every branch must restore shared state before the next sibling branch begins.',
      code: `flowchart TD
    State[Partial state] --> Choice[Choose candidate]
    Choice --> Mutate[Mutate path / marks]
    Mutate --> Recurse[Recurse]
    Recurse --> Undo[Undo mutation]
    Undo --> Next[Try next candidate]
    Recurse --> Complete{Complete?}
    Complete -->|yes| Record[Record copy or answer]
      `
    }
  }
};
