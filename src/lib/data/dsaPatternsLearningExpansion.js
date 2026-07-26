/**
 * Pedagogical DSA pattern learning expansion modules.
 *
 * These lessons are authored study material. They are intentionally complete
 * on-page so learners can study the pattern, inspect runnable stdlib-only
 * Python implementations, and then practice from starter code.
 */
const block = (value) => value.trim();

export const rawDsaPatternsLearningModules = [
  {
    slug: 'dsa-patterns-lab',
    title: 'DSA core patterns lab',
    summary:
      'Practice the core array, pointer, linked-list, and binary-search patterns that appear across interview problems before layering on harder optimization techniques.',
    objectives: [
      'Choose between hash maps, sorting, two pointers, prefix sums, and difference arrays from constraints',
      'Maintain pointer invariants for linked-list mutation, reversal, merging, and cycle detection',
      'Turn sorted domains and monotonic predicates into correct binary-search templates'
    ],
    lessons: [
      {
        slug: 'arrays-two-pointers-and-prefix-sums',
        title: 'Arrays, two pointers, and prefix sums',
        summary:
          'Array pattern selection with hash-map tradeoffs, sorted two-pointer scans, prefix sums, and difference arrays for range updates.',
        duration: '50-60 min',
        whyItMatters:
          'A large share of interview problems begin as array scans. The difference between a passable brute force and a strong solution is often recognizing the repeated operation, then replacing it with order, memory, or preprocessing.',
        sections: [
          {
            heading: 'Start with the operation, not the container',
            body: block(`
Arrays are simple enough that candidates often rush directly into loops. A stronger habit is to name the operation being repeated: membership lookup, pair selection, range sum, interval overlap, nearest neighbor, or bulk update. The operation tells you whether plain scanning is enough or whether you should introduce hashing, sorting, prefix state, or two coordinated indices.

Hash maps are the right trade when the hot question is "have I seen this key before?" or "what is the count for this value?" Sorting is useful when relative order exposes a monotonic move, such as moving the smaller side of a pair sum. Prefix sums are useful when many range queries reuse the same cumulative information. Difference arrays are useful when many range updates would otherwise touch every element in every interval.
            `),
            bullets: [
              'Use a hash map for repeated lookup, counting, grouping, or complement checks.',
              'Use sorting or two pointers when order lets one comparison discard many pairs.',
              'Use prefix sums or difference arrays when ranges are asked about repeatedly.'
            ],
            codeExample: {
              title: 'One-pass complement lookup',
              language: 'python',
              code: block(`
def first_pair_with_sum(values, target):
    seen = {}
    for index, value in enumerate(values):
        need = target - value
        if need in seen:
            return seen[need], index
        if value not in seen:
            seen[value] = index
    return None


print(first_pair_with_sum([8, 2, 11, 7, 15], 9))
print(first_pair_with_sum([4, 4, 5], 8))
print(first_pair_with_sum([1, 2, 3], 10))
              `)
            }
          },
          {
            heading: 'Two pointers: preserve a reason for each movement',
            body: block(`
Two pointers are not just "one at the start and one at the end." They work when you can prove that a move discards candidates safely. In a sorted pair-sum problem, if the current sum is too small, decreasing the right pointer would only make the sum smaller, so the only useful move is increasing the left pointer. If the sum is too large, increasing the left pointer would only make it larger, so you decrease the right pointer.

That proof is the invariant. At every step, all pairs outside the current window have already been ruled out. Without a sorted array, nonnegative lengths, or another monotonic property, two pointers can become wishful thinking. Interviewers care less about the syntax than about whether every pointer move is justified by the data ordering.
            `),
            bullets: [
              'State what candidates remain between the pointers.',
              'Move exactly one pointer when one direction can no longer help.',
              'Check duplicates and equality cases before deciding how both pointers move.'
            ],
            codeExample: {
              title: 'Sorted two-sum values',
              language: 'python',
              code: block(`
def has_pair_sum_sorted(values, target):
    left, right = 0, len(values) - 1
    while left < right:
        total = values[left] + values[right]
        if total == target:
            return True
        if total < target:
            left += 1
        else:
            right -= 1
    return False


print(has_pair_sum_sorted([1, 2, 4, 6, 10], 8))
print(has_pair_sum_sorted([1, 2, 4, 6, 10], 17))
              `)
            }
          },
          {
            heading: 'Hash maps versus sorting is a real tradeoff',
            body: block(`
For two-sum, hashing gives expected O(n) time and O(n) extra memory while preserving the original indices. Sorting gives O(n log n) time and can use little auxiliary memory, but it changes order unless you carry original indices. Neither is universally better. The prompt constraints decide: memory limit, need for indices, input mutability, and whether the sorted order will be reused by later work.

In interviews, present both when they are plausible. "If I need the original indices and memory is fine, I use a hash map. If I need less memory or will do multiple ordered scans, I can sort pairs of value and index." This framing shows you are not memorizing a favorite answer; you are matching implementation to the contract.
            `),
            bullets: [
              'Hashing is linear expected time but stores extra keys.',
              'Sorting exposes order and duplicates but changes the cost profile.',
              'Carry original indices when sorting would otherwise lose the required answer.'
            ],
            codeExample: {
              title: 'Sorting while preserving indices',
              language: 'python',
              code: block(`
def two_sum_sorted_with_indices(values, target):
    pairs = sorted((value, index) for index, value in enumerate(values))
    left, right = 0, len(pairs) - 1
    while left < right:
        total = pairs[left][0] + pairs[right][0]
        if total == target:
            return tuple(sorted((pairs[left][1], pairs[right][1])))
        if total < target:
            left += 1
        else:
            right -= 1
    return None


print(two_sum_sorted_with_indices([3, 2, 4], 6))
print(two_sum_sorted_with_indices([9, 1, 5, 7], 8))
              `)
            }
          },
          {
            heading: 'Prefix sums convert repeated range work into subtraction',
            body: block(`
A prefix sum stores cumulative totals before each position. Once built, the sum of values from left through right is prefix[right + 1] - prefix[left]. The expensive work is paid once, then every query becomes constant time. This is ideal when the array is mostly read-only and the prompt asks many range-sum questions.

The mental model generalizes beyond sums. Prefix counts answer "how many vowels before index i?" Prefix parity can detect subarrays with even counts. Prefix remainders solve subarray sums divisible by k. The common idea is to convert a subarray property into a difference between two cumulative states.
            `),
            bullets: [
              'Use an initial zero so ranges starting at index 0 are natural.',
              'Define whether range endpoints are inclusive or half-open before coding.',
              'For subarray existence, store earlier prefix states in a map or set.'
            ],
            codeExample: {
              title: 'Range sums and prefix state',
              language: 'python',
              code: block(`
def build_prefix(values):
    prefix = [0]
    for value in values:
        prefix.append(prefix[-1] + value)
    return prefix


def range_sum(prefix, left, right):
    return prefix[right + 1] - prefix[left]


values = [5, -2, 7, 3, 4]
prefix = build_prefix(values)
print(prefix)
print(range_sum(prefix, 0, 2))
print(range_sum(prefix, 2, 4))
              `)
            }
          },
          {
            heading: 'Difference arrays make many range updates cheap',
            body: block(`
If prefix sums make many range queries cheap, difference arrays make many range updates cheap. Instead of adding x to every position from left to right immediately, mark +x at left and -x just after right. A final prefix pass materializes the resulting array. Each update costs O(1), and the final reconstruction costs O(n).

This pattern appears in booking capacity, meeting-room deltas, sweep-line event counts, and "apply many increments" prompts. The key is that you can delay materialization until after all updates are known. If queries must be answered between updates, a Fenwick tree or segment tree may be needed instead, but for offline batch updates the difference array is simpler and interview-friendly.
            `),
            bullets: [
              'Allocate one extra slot so the closing negative mark fits at right + 1.',
              'Use inclusive or half-open intervals consistently.',
              'Materialize once after all updates instead of touching every covered cell per update.'
            ],
            codeExample: {
              title: 'Apply inclusive range increments',
              language: 'python',
              code: block(`
def apply_range_updates(length, updates):
    diff = [0] * (length + 1)
    for left, right, delta in updates:
        diff[left] += delta
        if right + 1 < len(diff):
            diff[right + 1] -= delta

    result = []
    running = 0
    for i in range(length):
        running += diff[i]
        result.append(running)
    return result


print(apply_range_updates(6, [(1, 3, 2), (2, 5, 1), (0, 0, 4)]))
              `)
            }
          },
          {
            heading: 'Pattern selection checklist for array prompts',
            body: block(`
When a prompt is short, constraints are part of the statement. Ask whether the input is sorted, whether values are bounded, whether negative numbers exist, whether there are many queries, whether updates are online or offline, and whether the answer needs original positions. Those facts decide which pattern is legal.

A good interview narration starts with brute force, identifies the repeated cost, then proposes the smallest structure that removes it. "Brute force checks every subarray. Prefix sums let me compute each range quickly, but there are still many ranges. If I need an existence answer for target sum, I can track earlier prefixes in a hash set." That sequence gives the interviewer confidence in your reasoning even before the code is complete.
            `),
            bullets: [
              'Sorted input invites binary search or two pointers; unsorted input often invites hashing.',
              'Many read-only range queries invite prefix preprocessing.',
              'Many offline range updates invite a difference array.'
            ]
          }
        ],
        checklist: [
          'Can justify hash-map, sorting, two-pointer, prefix-sum, and difference-array choices from constraints.',
          'Can write a two-pointer loop with a clear invariant and termination condition.',
          'Can build prefix sums with an initial zero and answer inclusive range queries.',
          'Can apply offline range updates with a difference array and one reconstruction pass.'
        ],
        pitfalls: [
          'Using two pointers on unsorted data without a monotonic reason for each move.',
          'Forgetting that sorting may lose original indices or mutate input.',
          'Off-by-one errors in prefix arrays and difference-array closing marks.',
          'Claiming hash maps are always O(1) without mentioning expected-case behavior and memory.'
        ],
        interviewPrompts: [
          'Explain when you would choose sorting plus two pointers over a hash map for pair sum.',
          'Derive the prefix-sum formula for an inclusive range [left, right].',
          'How would many range increment operations change your approach?',
          'What constraints would make an O(n log n) sorted approach preferable to O(n) hashing?'
        ],
        exercises: [
          {
            id: 'count-target-subarrays',
            title: 'Count subarrays with a target sum',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Count how many contiguous subarrays sum to target. Values may be negative, so a sliding window is not valid.',
            starterCode: block(`
def count_subarrays_with_sum(values, target):
    # TODO: track how many times each prefix sum has appeared.
    # TODO: for each new prefix, add counts[prefix - target].
    return 0


print(count_subarrays_with_sum([1, 2, 3, -2, 5], 5))
print(count_subarrays_with_sum([1, -1, 1, -1], 0))
            `),
            solution: block(`
def count_subarrays_with_sum(values, target):
    counts = {0: 1}
    prefix = 0
    total = 0
    for value in values:
        prefix += value
        total += counts.get(prefix - target, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return total


print(count_subarrays_with_sum([1, 2, 3, -2, 5], 5))
print(count_subarrays_with_sum([1, -1, 1, -1], 0))
            `),
            hints: [
              'A subarray sum is the difference between two prefix sums.',
              'If current_prefix - old_prefix == target, then old_prefix == current_prefix - target.',
              'Seed prefix sum 0 so subarrays starting at index 0 are counted.'
            ],
            expectedOutput: '2, then 4.'
          },
          {
            id: 'range-add-queries',
            title: 'Materialize range additions',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Given an array length and inclusive range additions, return the final array after all updates.',
            starterCode: block(`
def materialize_updates(length, updates):
    # TODO: mark each update in a difference array.
    # TODO: run one prefix pass to build the final values.
    return []


print(materialize_updates(5, [(0, 2, 3), (1, 4, 2), (3, 3, -1)]))
            `),
            solution: block(`
def materialize_updates(length, updates):
    diff = [0] * (length + 1)
    for left, right, delta in updates:
        diff[left] += delta
        if right + 1 < len(diff):
            diff[right + 1] -= delta

    result = []
    running = 0
    for index in range(length):
        running += diff[index]
        result.append(running)
    return result


print(materialize_updates(5, [(0, 2, 3), (1, 4, 2), (3, 3, -1)]))
            `),
            hints: [
              'Do not loop across every covered index for every update.',
              'A closing mark at right + 1 cancels the increment after the range.',
              'The final prefix pass turns deltas into actual values.'
            ],
            expectedOutput: '[3, 5, 5, 1, 2].'
          },
          {
            id: 'array-pattern-selection-review',
            title: 'Choose patterns for range-heavy analytics',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Design an approach for an analytics tool that receives event values, many immutable range-sum queries, and a nightly batch of range corrections.',
            hints: [
              'Separate online queries from offline correction batches.',
              'Decide when prefix sums need to be rebuilt after corrections.',
              'Explain why negative values do not break prefix sums.'
            ]
          }
        ],
        diagram: null,
        related: ['linked-lists-and-pointer-invariants', 'binary-search-on-answer-spaces']
      },
      {
        slug: 'linked-lists-and-pointer-invariants',
        title: 'Linked lists and pointer invariants',
        summary:
          'Dummy nodes, slow/fast runners, in-place reversal, sorted merging, and cycle detection with explicit pointer invariants.',
        duration: '45-55 min',
        whyItMatters:
          'Linked-list interviews test whether you can mutate references without losing the rest of the structure. Correctness comes from invariants about ownership, progress, and reconnection.',
        sections: [
          {
            heading: 'Dummy nodes turn head mutation into ordinary mutation',
            body: block(`
Many linked-list bugs happen at the head. Removing the first node, inserting before the first node, or merging into an empty result all need special cases unless you create a dummy node. The dummy is not part of the answer; it is a stable predecessor that lets every real insertion attach after some node.

The invariant is simple: dummy.next always points at the head of the result built so far, and tail points at the last node in that result. Because tail always exists, appending a node is the same operation whether the result is empty or already long. This reduces edge cases and makes the code easier to narrate under time pressure.
            `),
            bullets: [
              'Use a dummy when the head may change or the result is built incrementally.',
              'Return dummy.next, not dummy.',
              'Keep a tail pointer when appending to avoid rescanning the result.'
            ],
            codeExample: {
              title: 'Filter a linked list with a dummy predecessor',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def from_list(values):
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head


def to_list(head):
    result = []
    while head:
        result.append(head.value)
        head = head.next
    return result


def remove_value(head, banned):
    dummy = Node(0, head)
    prev = dummy
    curr = head
    while curr:
        if curr.value == banned:
            prev.next = curr.next
        else:
            prev = curr
        curr = curr.next
    return dummy.next


print(to_list(remove_value(from_list([2, 1, 2, 3, 2]), 2)))
              `)
            }
          },
          {
            heading: 'Slow and fast pointers measure relative progress',
            body: block(`
The slow/fast pattern uses two runners moving at different speeds. For middle finding, fast moves two steps while slow moves one; when fast reaches the end, slow is at the midpoint. For cycle detection, fast eventually laps slow if a cycle exists because each iteration closes their distance inside the cycle by one node.

The difficult part is guarding pointer access. The loop condition must prove every dereference is valid before it happens. For a two-step fast move, require fast and fast.next. For operations involving fast.next.next, check both links. Clean guard conditions are not defensive clutter; they are the safety proof for pointer code.
            `),
            bullets: [
              'Use slow/fast when relative speed reveals middle, cycle, or kth-from-end structure.',
              'Write loop conditions around the furthest pointer access.',
              'Decide whether the first or second middle is desired for even-length lists.'
            ],
            codeExample: {
              title: 'Find the second middle node',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def from_list(values):
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head


def middle_value(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.value if slow else None


print(middle_value(from_list([1, 2, 3, 4, 5])))
print(middle_value(from_list([1, 2, 3, 4])))
              `)
            }
          },
          {
            heading: 'In-place reversal is a three-pointer transfer',
            body: block(`
Reversal feels tricky because every reassignment can disconnect the remaining list. The safe invariant is to maintain two lists: prev is the reversed prefix, and curr is the unreversed suffix. Before changing curr.next, save next_node. Then redirect curr.next to prev, advance prev to curr, and advance curr to next_node.

After each iteration, all nodes before curr have been reversed and are reachable from prev; all nodes from curr onward are still in original order and reachable from curr. That invariant prevents the common mistake of overwriting the only link to the rest of the list. At the end, curr is None and prev is the new head.
            `),
            bullets: [
              'Save next_node before redirecting curr.next.',
              'Think of moving one node at a time from the original suffix to the reversed prefix.',
              'Return prev after curr runs off the end.'
            ],
            codeExample: {
              title: 'Reverse a linked list in place',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def from_list(values):
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head


def to_list(head):
    result = []
    while head:
        result.append(head.value)
        head = head.next
    return result


def reverse(head):
    prev = None
    curr = head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev


print(to_list(reverse(from_list([1, 2, 3, 4]))))
              `)
            }
          },
          {
            heading: 'Merging sorted lists is repeated minimum selection',
            body: block(`
Merging two sorted linked lists is the linked-list version of the merge step in merge sort. Because both inputs are sorted, the smaller current head must be the next node in the result. A dummy and tail pointer keep result construction uniform. After choosing a node, advance only the list that supplied it.

You can either reuse nodes or allocate new nodes. Reusing nodes is common in interviews because it is O(1) auxiliary space, but it mutates the input lists. Allocating copies is safer when callers expect the original lists to remain intact. State the choice so the interviewer knows you understand the side effect.
            `),
            bullets: [
              'Compare current heads; append the smaller node to tail.',
              'Advance the source list and tail after every attachment.',
              'Attach the non-empty remainder once one list is exhausted.'
            ],
            codeExample: {
              title: 'Merge two sorted lists by reusing nodes',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def from_list(values):
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head


def to_list(head):
    result = []
    while head:
        result.append(head.value)
        head = head.next
    return result


def merge_sorted(a, b):
    dummy = Node(0)
    tail = dummy
    while a and b:
        if a.value <= b.value:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a if a else b
    return dummy.next


print(to_list(merge_sorted(from_list([1, 4, 7]), from_list([2, 3, 8]))))
              `)
            }
          },
          {
            heading: 'Cycle detection has two separate questions',
            body: block(`
Detecting whether a cycle exists is different from finding where the cycle begins. Floyd's algorithm first runs slow and fast pointers until they meet or fast reaches the end. If they meet, reset one pointer to the head and move both one step at a time; their next meeting point is the cycle entry. This works because the distance arithmetic aligns the head-to-entry path with the meeting-to-entry path modulo the cycle length.

In an interview, you do not need to derive the full proof unless asked, but you should explain the two phases. Phase one proves a cycle exists. Phase two locates the entry. Avoid using a visited set unless the prompt values simplicity over O(1) space; the set approach is valid but does not demonstrate the pointer pattern.
            `),
            bullets: [
              'Fast reaching None proves there is no cycle.',
              'Slow meeting fast proves a cycle exists.',
              'Reset one pointer to head to find the cycle entry in O(1) extra space.'
            ],
            codeExample: {
              title: 'Find cycle entry with Floyd pointers',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


def cycle_entry(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            seeker = head
            while seeker is not slow:
                seeker = seeker.next
                slow = slow.next
            return seeker
    return None


nodes = [Node(i) for i in range(5)]
for i in range(4):
    nodes[i].next = nodes[i + 1]
nodes[4].next = nodes[2]
print(cycle_entry(nodes[0]).value)
              `)
            }
          },
          {
            heading: 'Pointer code needs ownership language',
            body: block(`
Linked-list solutions are easiest to debug when you describe who owns each segment. In reversal, prev owns the reversed prefix and curr owns the unreversed suffix. In merging, tail owns the result prefix and a/b own the remaining inputs. In deletion, prev owns the last kept node and curr is the candidate being inspected.

This language prevents accidental loss. Before each reassignment, ask which nodes become unreachable if the line is wrong. After each reassignment, ask whether the loop still makes progress. Most linked-list bugs are not algorithmic mysteries; they are one broken ownership transition hidden inside a small loop.
            `),
            bullets: [
              'Name the meaning of each pointer before writing the loop.',
              'Save links before overwriting them.',
              'Verify progress so the loop cannot get stuck on the same node.'
            ]
          }
        ],
        checklist: [
          'Can use a dummy node to remove head special cases.',
          'Can write slow/fast pointer loops with safe guard conditions.',
          'Can reverse a list using prev, curr, and next_node without losing nodes.',
          'Can explain both detection and entry-location phases of Floyd cycle detection.'
        ],
        pitfalls: [
          'Returning the dummy node instead of dummy.next.',
          'Overwriting curr.next before saving the rest of the list.',
          'Using fast.next.next without proving fast and fast.next exist.',
          'Forgetting that reusing nodes mutates the input lists.'
        ],
        interviewPrompts: [
          'Why does a dummy node simplify deletion from the head?',
          'Walk through the invariant for iterative linked-list reversal.',
          'How do you find the second middle versus the first middle?',
          'Explain why Floyd cycle detection can locate the cycle entry without extra memory.'
        ],
        exercises: [
          {
            id: 'remove-nth-from-end',
            title: 'Remove the nth node from the end',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Remove the nth node from the end of a singly linked list and return the new head. Use one pass after positioning a lead pointer.',
            starterCode: block(`
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def remove_nth_from_end(head, n):
    # TODO: use a dummy node.
    # TODO: move a lead pointer n steps ahead, then move lead and follow together.
    return head
            `),
            solution: block(`
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def remove_nth_from_end(head, n):
    dummy = Node(0, head)
    lead = dummy
    for _ in range(n):
        lead = lead.next

    follow = dummy
    while lead.next:
        lead = lead.next
        follow = follow.next

    follow.next = follow.next.next
    return dummy.next
            `),
            hints: [
              'A dummy handles removing the original head.',
              'Keep exactly n nodes between lead and follow before the joint walk.',
              'Stop with follow just before the node to remove.'
            ],
            expectedOutput: 'For 1->2->3->4->5 and n=2, the list becomes 1->2->3->5.'
          },
          {
            id: 'merge-k-with-pairwise-merge',
            title: 'Merge k sorted lists by repeated pairing',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Merge a list of sorted linked lists by repeatedly merging pairs until one list remains.',
            starterCode: block(`
def merge_two(a, b):
    # TODO: merge two sorted linked lists.
    return None


def merge_k_lists(lists):
    # TODO: repeatedly merge pairs of lists until one remains.
    return None
            `),
            solution: block(`
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next


def merge_two(a, b):
    dummy = Node(0)
    tail = dummy
    while a and b:
        if a.value <= b.value:
            tail.next = a
            a = a.next
        else:
            tail.next = b
            b = b.next
        tail = tail.next
    tail.next = a if a else b
    return dummy.next


def merge_k_lists(lists):
    if not lists:
        return None
    active = lists[:]
    while len(active) > 1:
        merged = []
        for i in range(0, len(active), 2):
            first = active[i]
            second = active[i + 1] if i + 1 < len(active) else None
            merged.append(merge_two(first, second))
        active = merged
    return active[0]
            `),
            hints: [
              'Reuse the two-list merge as a building block.',
              'Pairwise merging keeps the merge tree balanced.',
              'An odd list count leaves one list to carry to the next round.'
            ],
            expectedOutput: 'A single sorted linked list containing all input values.'
          },
          {
            id: 'linked-list-pointer-review',
            title: 'Design pointer invariants for a reorder operation',
            difficulty: 'advanced',
            type: 'design',
            description:
              'Describe how you would reorder L0->L1->...->Ln into L0->Ln->L1->Ln-1... using middle finding, reversal, and merge-style weaving.',
            hints: [
              'Split the list at the middle before reversing the second half.',
              'State which pointer owns each half during weaving.',
              'Mention how odd-length and even-length lists terminate.'
            ]
          }
        ],
        diagram: null,
        related: ['arrays-two-pointers-and-prefix-sums', 'binary-search-on-answer-spaces']
      },
      {
        slug: 'binary-search-on-answer-spaces',
        title: 'Binary search on answer spaces',
        summary:
          'Classic binary search, lower and upper bounds, and search-on-answer patterns built around monotonic predicates.',
        duration: '50-60 min',
        whyItMatters:
          'Binary search is less about sorted arrays than about discarding half of a monotonic search space. Interviewers use it to test precision with invariants, bounds, and proof of feasibility.',
        sections: [
          {
            heading: 'Classic search: maintain the remaining candidate range',
            body: block(`
Classic binary search keeps a range of indices where the target could still be. With closed bounds, lo and hi are both candidates and the loop runs while lo <= hi. With half-open bounds, lo is included and hi is excluded, and the loop runs while lo < hi. Both styles are correct when used consistently.

The midpoint comparison must discard the half that cannot contain the target. If values[mid] is less than target in ascending order, every index at or below mid is too small, so lo becomes mid + 1. If values[mid] is greater, hi becomes mid - 1 in the closed form. The invariant is what prevents off-by-one patches from becoming random.
            `),
            bullets: [
              'Choose closed or half-open bounds and keep that contract throughout.',
              'Use mid = lo + (hi - lo) // 2 in languages with integer overflow risk.',
              'Every loop iteration must shrink the candidate range.'
            ],
            codeExample: {
              title: 'Closed-bound binary search',
              language: 'python',
              code: block(`
def binary_search(values, target):
    lo, hi = 0, len(values) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if values[mid] == target:
            return mid
        if values[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


print(binary_search([1, 4, 7, 9, 13], 9))
print(binary_search([1, 4, 7, 9, 13], 8))
              `)
            }
          },
          {
            heading: 'Lower bound answers the first true position',
            body: block(`
Many interview searches are not asking "where is target?" They ask for the first index where a condition becomes true: first value greater than or equal to target, first bad version, first feasible capacity, first day enough bouquets can be made. This is lower-bound search.

The half-open template is especially clean for lower bound. Search [lo, hi), where hi is one past the last possible index. If the predicate is true at mid, mid may be the answer, so keep it by assigning hi = mid. If false, discard mid and everything before it by assigning lo = mid + 1. When the loop ends, lo is the first true position or the insertion point.
            `),
            bullets: [
              'Lower bound finds the first index where predicate(index) is true.',
              'When mid is true, keep mid in the range.',
              'When no true value exists, the result is the right boundary.'
            ],
            codeExample: {
              title: 'First value greater than or equal to target',
              language: 'python',
              code: block(`
def lower_bound(values, target):
    lo, hi = 0, len(values)
    while lo < hi:
        mid = (lo + hi) // 2
        if values[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo


values = [1, 2, 2, 2, 5, 8]
print(lower_bound(values, 2))
print(lower_bound(values, 6))
print(lower_bound(values, 10))
              `)
            }
          },
          {
            heading: 'Upper bound and duplicate ranges',
            body: block(`
Upper bound finds the first index greater than target. Together, lower_bound(target) and upper_bound(target) identify the half-open range containing all duplicates of target. The count is upper - lower. This is cleaner than trying to branch outward from an arbitrary found match.

The predicate changes from values[mid] >= target to values[mid] > target. That small change is the whole difference. In interviews, duplicates are a frequent source of mistakes because a simple equality search can return any matching index. Bounds turn duplicates into a range problem with predictable behavior.
            `),
            bullets: [
              'Lower bound for target gives the first target position.',
              'Upper bound for target gives the first position after all targets.',
              'The target exists if lower < len(values) and values[lower] == target.'
            ],
            codeExample: {
              title: 'Count duplicates with bounds',
              language: 'python',
              code: block(`
def lower_bound(values, target):
    lo, hi = 0, len(values)
    while lo < hi:
        mid = (lo + hi) // 2
        if values[mid] >= target:
            hi = mid
        else:
            lo = mid + 1
    return lo


def upper_bound(values, target):
    lo, hi = 0, len(values)
    while lo < hi:
        mid = (lo + hi) // 2
        if values[mid] > target:
            hi = mid
        else:
            lo = mid + 1
    return lo


values = [1, 2, 2, 2, 5, 5, 8]
left = lower_bound(values, 2)
right = upper_bound(values, 2)
print(left, right, right - left)
              `)
            }
          },
          {
            heading: 'Search on answer uses feasibility instead of equality',
            body: block(`
Search-on-answer problems define a numeric answer space even when the input array is not sorted. The trick is to ask whether a proposed answer x is feasible. If feasibility is monotonic, binary search applies. For example, if a ship capacity can deliver packages within D days, any larger capacity can also deliver them. The predicate is false for capacities that are too small, then true for all large enough capacities.

The hard work is designing the predicate and proving monotonicity. Bounds come next. The lower bound should be the smallest possible answer, often max(item) or 0. The upper bound should be a definitely feasible answer, often sum(items) or max coordinate range. Then use lower-bound search to find the first feasible value.
            `),
            bullets: [
              'Define answer candidates as numbers or ordered states.',
              'Prove the predicate changes only once from false to true or true to false.',
              'Pick inclusive lower and exclusive upper bounds that contain the answer.'
            ],
            codeExample: {
              title: 'Minimum ship capacity within days',
              language: 'python',
              code: block(`
def days_needed(weights, capacity):
    days = 1
    load = 0
    for weight in weights:
        if load + weight > capacity:
            days += 1
            load = 0
        load += weight
    return days


def min_ship_capacity(weights, max_days):
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if days_needed(weights, mid) <= max_days:
            hi = mid
        else:
            lo = mid + 1
    return lo


print(min_ship_capacity([3, 2, 2, 4, 1, 4], 3))
              `)
            }
          },
          {
            heading: 'Binary search on real-valued answers needs iteration discipline',
            body: block(`
Some answer spaces are continuous, such as square roots, distances, or rates. You cannot wait for lo == hi with floating-point numbers. Instead, run a fixed number of iterations or stop when hi - lo is below a tolerance. The invariant is still the same: the answer remains inside the current interval.

For most coding interviews, integer answer spaces are preferred because exact boundaries are easier to test. When real values appear, clarify precision requirements. If the judge accepts an absolute or relative error, a fixed 50 to 80 iterations usually gives enough precision for double-precision floats. Do not mix integer loop conditions with floats.
            `),
            bullets: [
              'Use a tolerance or fixed iteration count for continuous spaces.',
              'Keep the answer bracketed between lo and hi.',
              'Clarify whether the required error is absolute or relative.'
            ],
            codeExample: {
              title: 'Approximate square root by bisection',
              language: 'python',
              code: block(`
def sqrt_binary(value, iterations=60):
    if value < 0:
        raise ValueError("square root input must be nonnegative")
    lo, hi = 0.0, max(1.0, value)
    for _ in range(iterations):
        mid = (lo + hi) / 2.0
        if mid * mid >= value:
            hi = mid
        else:
            lo = mid
    return hi


print(round(sqrt_binary(2), 6))
print(round(sqrt_binary(144), 6))
              `)
            }
          },
          {
            heading: 'Proof obligations for binary search',
            body: block(`
Binary search bugs usually come from skipping the proof. You need an ordered search space, a predicate or comparison that is monotonic in that space, bounds that contain the answer, and updates that preserve the answer while shrinking the range. If any one of those is missing, the loop may terminate with an off-by-one result or fail to terminate.

Before coding, say the invariant out loud: "The minimum feasible capacity is always in [lo, hi]." Then each branch is easy to justify. If mid is feasible, the answer is at most mid, so hi becomes mid. If mid is infeasible, the answer is greater than mid, so lo becomes mid + 1. This reasoning is the real solution; the code is just the template.
            `),
            bullets: [
              'State what lo and hi mean at every moment.',
              'Show why each branch preserves the true answer.',
              'Use tests for empty input, one element, all duplicates, and boundary targets.'
            ]
          }
        ],
        checklist: [
          'Can implement closed-bound equality search and half-open lower-bound search.',
          'Can use lower and upper bounds to count duplicates.',
          'Can design a monotonic feasibility predicate for search-on-answer problems.',
          'Can choose safe answer-space bounds and explain termination.'
        ],
        pitfalls: [
          'Mixing closed and half-open templates in the same loop.',
          'Dropping mid when it might still be the first feasible answer.',
          'Searching on an answer space without proving monotonicity.',
          'Using equality termination for floating-point binary search.'
        ],
        interviewPrompts: [
          'Explain the difference between finding any target and finding lower_bound(target).',
          'How do lower_bound and upper_bound handle duplicates?',
          'Design the predicate for minimum capacity to ship packages in D days.',
          'What bounds would you choose for binary searching a minimum eating speed?'
        ],
        exercises: [
          {
            id: 'first-bad-version-template',
            title: 'Find the first bad version',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Given n versions and an is_bad callback, return the first bad version. Assume at least one version is bad.',
            starterCode: block(`
def first_bad_version(n, is_bad):
    # TODO: binary search the first version where is_bad(version) is True.
    return -1


print(first_bad_version(10, lambda version: version >= 6))
            `),
            solution: block(`
def first_bad_version(n, is_bad):
    lo, hi = 1, n
    while lo < hi:
        mid = (lo + hi) // 2
        if is_bad(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


print(first_bad_version(10, lambda version: version >= 6))
            `),
            hints: [
              'This is lower_bound over versions 1 through n.',
              'If mid is bad, mid may still be the first bad version.',
              'If mid is good, discard mid and everything earlier.'
            ],
            expectedOutput: '6.'
          },
          {
            id: 'minimum-eating-speed',
            title: 'Minimum eating speed',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Find the minimum integer speed that finishes all piles within h hours. Each hour can work on one pile and consumes up to speed items.',
            starterCode: block(`
def min_eating_speed(piles, h):
    # TODO: define a feasible(speed) predicate.
    # TODO: binary search the smallest feasible speed.
    return 0


print(min_eating_speed([3, 6, 7, 11], 8))
            `),
            solution: block(`
def min_eating_speed(piles, h):
    def hours_needed(speed):
        return sum((pile + speed - 1) // speed for pile in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours_needed(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo


print(min_eating_speed([3, 6, 7, 11], 8))
            `),
            hints: [
              'As speed increases, required hours never increase.',
              'Ceiling division can be written as (pile + speed - 1) // speed.',
              'The answer is between 1 and max(piles).'
            ],
            expectedOutput: '4.'
          },
          {
            id: 'answer-space-proof-review',
            title: 'Design a search-on-answer proof',
            difficulty: 'advanced',
            type: 'design',
            description:
              'For a problem that asks for the minimum largest subarray sum when splitting an array into k non-empty parts, define bounds, feasibility, and monotonicity.',
            hints: [
              'The lower bound is at least the largest single value.',
              'The upper bound can be the sum of all values.',
              'A greedy feasibility pass counts how many groups are needed for a proposed limit.'
            ]
          }
        ],
        diagram: null,
        related: ['arrays-two-pointers-and-prefix-sums', 'linked-lists-and-pointer-invariants']
      }
    ]
  },
  {
    slug: 'dsa-search-lab',
    title: 'DSA search and optimization lab',
    summary:
      'Build interview-ready search patterns for windows, heaps, graph-like priority expansion, recursion, backtracking, pruning, and memoization boundaries.',
    objectives: [
      'Maintain fixed and variable sliding-window invariants for substring and subarray prompts',
      'Use heaps for incremental top-k, k-way merge, and shortest-path frontier selection',
      'Structure recursive search with decisions, undo steps, pruning, and memoization where appropriate'
    ],
    lessons: [
      {
        slug: 'sliding-window-and-substring-invariants',
        title: 'Sliding window and substring invariants',
        summary:
          'Fixed and variable windows, shrink rules, frequency maps, and at-most-K transformations for substring and subarray problems.',
        duration: '50-60 min',
        whyItMatters:
          'Sliding windows turn many nested-loop substring and subarray scans into linear passes, but only when the window invariant is explicit enough to update safely.',
        sections: [
          {
            heading: 'Fixed windows update by removing exactly what leaves',
            body: block(`
A fixed-size window keeps exactly k elements active. Move the right edge one step at a time, add the entering value, and once the window exceeds k, remove the leaving value at right - k. The invariant is the active aggregate describes exactly the last k elements. This works for sums, counts, maximum frequency with extra structures, and fixed-length substring checks.

Fixed windows are the easiest place to learn the pattern because the shrink rule is mechanical. The left edge is determined by right and k. If you write a while loop for a fixed window, check whether a direct removal formula would be clearer. The main mistakes are reporting before the first full window exists or forgetting to remove stale state.
            `),
            bullets: [
              'Add the entering item before evaluating whether the window is too large.',
              'Remove the item at index right - k when the window exceeds k.',
              'Record answers only after the window reaches size k.'
            ],
            codeExample: {
              title: 'Maximum sum of a fixed-length subarray',
              language: 'python',
              code: block(`
def max_fixed_window_sum(values, k):
    if k <= 0 or k > len(values):
        return None
    running = 0
    best = None
    for right, value in enumerate(values):
        running += value
        if right >= k:
            running -= values[right - k]
        if right >= k - 1:
            best = running if best is None else max(best, running)
    return best


print(max_fixed_window_sum([4, -1, 2, 10, -3, 5], 3))
              `)
            }
          },
          {
            heading: 'Variable windows shrink until the invariant is restored',
            body: block(`
Variable-size windows are useful when adding the right item can violate a condition and moving the left edge can repair it. The pattern is add right, update state, then while invalid, remove left and advance left. After the loop, the window is valid and can contribute to the answer.

The condition must be monotonic with respect to moving left. If a window sum with nonnegative values is too large, removing items from the left can only decrease it. If characters are duplicated, removing from the left can reduce counts. If values include negatives in a sum constraint, moving left may increase or decrease the sum unpredictably; the sliding-window proof breaks and prefix sums may be better.
            `),
            bullets: [
              'Use variable windows when expanding may break a condition and shrinking can repair it.',
              'Keep left as the smallest index that makes the current right valid when possible.',
              'Do not use sum-based sliding windows with negative values unless you have another monotonic proof.'
            ],
            codeExample: {
              title: 'Longest substring without repeated characters',
              language: 'python',
              code: block(`
def longest_unique_substring(text):
    counts = {}
    left = 0
    best = 0
    for right, char in enumerate(text):
        counts[char] = counts.get(char, 0) + 1
        while counts[char] > 1:
            left_char = text[left]
            counts[left_char] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best


print(longest_unique_substring("abcabcbb"))
print(longest_unique_substring("bbbbb"))
              `)
            }
          },
          {
            heading: 'Frequency maps turn substring validity into state updates',
            body: block(`
Substring problems often ask whether a window covers a target multiset: all characters in an anagram, all required letters in minimum window substring, or at most a certain number of replacements. A frequency map lets each step update only the entering and leaving characters instead of recounting the whole substring.

The important design choice is what state makes validity cheap. You might track counts exactly, a missing counter, a duplicate count, or the highest frequency inside the window. The best state avoids comparing entire dictionaries on every step. In an interview, identify the validity predicate first, then decide which counter changes when one character enters or leaves.
            `),
            bullets: [
              'Store only the counts needed to test the invariant cheaply.',
              'Update validity counters when a count crosses a meaningful threshold.',
              'Avoid rebuilding Counter objects for every substring.'
            ],
            codeExample: {
              title: 'Find anagram start indices',
              language: 'python',
              code: block(`
def find_anagrams(text, pattern):
    need = {}
    for char in pattern:
        need[char] = need.get(char, 0) + 1

    window = {}
    result = []
    k = len(pattern)
    for right, char in enumerate(text):
        window[char] = window.get(char, 0) + 1
        if right >= k:
            leaving = text[right - k]
            window[leaving] -= 1
            if window[leaving] == 0:
                del window[leaving]
        if right >= k - 1 and window == need:
            result.append(right - k + 1)
    return result


print(find_anagrams("cbaebabacd", "abc"))
              `)
            }
          },
          {
            heading: 'At-most-K transforms exact constraints into subtraction',
            body: block(`
Some exact-window questions are easier to answer by counting at most K and subtracting at most K - 1. For example, the number of subarrays with exactly K distinct values equals at_most(K) - at_most(K - 1). The at-most version is monotonic: if the window has too many distinct values, moving left can only remove or reduce distinct counts until it is valid.

The counting insight is that once a window [left, right] is valid for at most K, every subarray ending at right and starting between left and right is also valid. That contributes right - left + 1 subarrays in O(1) time for that right edge. This turns a nested enumeration into a linear scan.
            `),
            bullets: [
              'Use exact(K) = at_most(K) - at_most(K - 1) for many counting problems.',
              'When a valid window ends at right, count every start from left through right.',
              'Maintain distinct count by deleting keys when their frequency reaches zero.'
            ],
            codeExample: {
              title: 'Count subarrays with exactly K distinct values',
              language: 'python',
              code: block(`
def at_most_k_distinct(values, k):
    if k < 0:
        return 0
    counts = {}
    left = 0
    total = 0
    for right, value in enumerate(values):
        counts[value] = counts.get(value, 0) + 1
        while len(counts) > k:
            leaving = values[left]
            counts[leaving] -= 1
            if counts[leaving] == 0:
                del counts[leaving]
            left += 1
        total += right - left + 1
    return total


def exactly_k_distinct(values, k):
    return at_most_k_distinct(values, k) - at_most_k_distinct(values, k - 1)


print(exactly_k_distinct([1, 2, 1, 2, 3], 2))
              `)
            }
          },
          {
            heading: 'Minimum windows require recording after validity',
            body: block(`
Minimum-window problems invert the usual longest-valid structure. You expand right until the window becomes valid, then shrink left while it remains valid, recording the best candidate before each removal that might break validity. The invariant alternates between "not enough yet" and "valid, now minimize."

The state should track how many required character instances are still missing, not just how many unique keys match. If the target needs two A characters, one A is not enough. When a character enters, missing decreases only if the previous window count was below the required count. When a character leaves, missing increases only if the window count falls below the required count.
            `),
            bullets: [
              'Expand until all requirements are satisfied.',
              'Shrink while valid to find the shortest window for each right edge.',
              'Track missing instances, not just unique matched characters.'
            ],
            codeExample: {
              title: 'Minimum covering substring',
              language: 'python',
              code: block(`
def min_window(text, target):
    need = {}
    for char in target:
        need[char] = need.get(char, 0) + 1

    missing = len(target)
    left = 0
    best = None
    window = {}

    for right, char in enumerate(text):
        window[char] = window.get(char, 0) + 1
        if window[char] <= need.get(char, 0):
            missing -= 1

        while missing == 0:
            candidate = (left, right + 1)
            if best is None or candidate[1] - candidate[0] < best[1] - best[0]:
                best = candidate
            leaving = text[left]
            window[leaving] -= 1
            if window[leaving] < need.get(leaving, 0):
                missing += 1
            left += 1

    return "" if best is None else text[best[0]:best[1]]


print(min_window("ADOBECODEBANC", "ABC"))
              `)
            }
          },
          {
            heading: 'Know when a window is illegal',
            body: block(`
Sliding windows are linear because each pointer moves forward at most n times. That only holds when shrinking from the left is the right repair action. If removing from the left can make the condition better, worse, or unrelated depending on hidden future values, the proof collapses. Negative values in a target-sum problem are the classic example.

When a window seems tempting, test the monotonicity verbally. "If the sum is too large, can removing left ever make me miss a valid future window?" With nonnegative numbers, no. With negatives, yes, because a negative later could bring the sum down. That is when prefix sums with a hash map, binary search over prefix arrays, or dynamic programming may be the correct tool.
            `),
            bullets: [
              'Each pointer should move only forward for an O(n) window.',
              'Shrinking must reliably move the window toward validity.',
              'If values can be negative, re-check every sum-based window proof.'
            ]
          }
        ],
        checklist: [
          'Can implement fixed-size windows with exact entering and leaving updates.',
          'Can write variable-window shrink loops that restore a named invariant.',
          'Can use frequency maps for substring validity without recounting substrings.',
          'Can apply at-most-K subtraction to exact-K counting problems.'
        ],
        pitfalls: [
          'Recording an answer before the window is valid or after it has already been broken.',
          'Using sliding windows for negative-number sum constraints without monotonicity.',
          'Keeping zero-count keys and accidentally inflating distinct counts.',
          'Comparing full dictionaries inside every loop when a threshold counter would be cheaper.'
        ],
        interviewPrompts: [
          'Explain the shrink rule for longest substring without repeats.',
          'Why does exactly K distinct equal at_most(K) minus at_most(K - 1)?',
          'How do you update missing counts in minimum window substring?',
          'Give an example where sliding window fails because values can be negative.'
        ],
        exercises: [
          {
            id: 'longest-replacement-window',
            title: 'Longest repeating character replacement',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Return the longest substring length that can be made of one repeated character after replacing at most k characters.',
            starterCode: block(`
def character_replacement(text, k):
    # TODO: track window counts and the highest count seen in the active window.
    # TODO: shrink while replacements needed exceed k.
    return 0


print(character_replacement("AABABBA", 1))
            `),
            solution: block(`
def character_replacement(text, k):
    counts = {}
    left = 0
    max_count = 0
    best = 0
    for right, char in enumerate(text):
        counts[char] = counts.get(char, 0) + 1
        max_count = max(max_count, counts[char])
        while (right - left + 1) - max_count > k:
            leaving = text[left]
            counts[leaving] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best


print(character_replacement("AABABBA", 1))
            `),
            hints: [
              'A window of length L with max frequency M needs L - M replacements.',
              'A stale max_count is acceptable for this longest-length template because it never underestimates a possible best length.',
              'Shrink only when replacements needed exceed k.'
            ],
            expectedOutput: '4.'
          },
          {
            id: 'count-binary-subarrays-sum',
            title: 'Count binary subarrays with exact sum',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'For a binary array, count subarrays whose sum equals goal using at-most subtraction.',
            starterCode: block(`
def num_subarrays_with_sum(values, goal):
    # TODO: implement at_most(sum_limit) for binary values.
    # TODO: return at_most(goal) - at_most(goal - 1).
    return 0


print(num_subarrays_with_sum([1, 0, 1, 0, 1], 2))
            `),
            solution: block(`
def num_subarrays_with_sum(values, goal):
    def at_most(limit):
        if limit < 0:
            return 0
        left = 0
        running = 0
        total = 0
        for right, value in enumerate(values):
            running += value
            while running > limit:
                running -= values[left]
                left += 1
            total += right - left + 1
        return total

    return at_most(goal) - at_most(goal - 1)


print(num_subarrays_with_sum([1, 0, 1, 0, 1], 2))
            `),
            hints: [
              'Binary values make sum monotonic under shrinking.',
              'Count all valid starts for each right edge in at_most.',
              'The exact goal is the difference of two at-most counts.'
            ],
            expectedOutput: '4.'
          },
          {
            id: 'substring-window-design',
            title: 'Design a window invariant for fraud keywords',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Design an algorithm that scans chat text for the shortest substring containing all required keyword initials with multiplicity.',
            hints: [
              'Model initials as target counts, not a set.',
              'Define when the window becomes valid and when shrinking breaks validity.',
              'Describe what answer is recorded during the shrink phase.'
            ]
          }
        ],
        diagram: null,
        related: ['heaps-topk-and-priority-queues', 'recursion-backtracking-and-pruning']
      },
      {
        slug: 'heaps-topk-and-priority-queues',
        title: 'Heaps, top-k, and priority queues',
        summary:
          'Heap property, top-k streaming choices, merge-K mental models, Dijkstra hints, and when a heap beats full sorting.',
        duration: '45-55 min',
        whyItMatters:
          'Priority queues are the standard tool when the next item must be the current minimum or maximum, but fully sorting everything would waste work or require unavailable future data.',
        sections: [
          {
            heading: 'A heap gives fast access to one extreme, not full order',
            body: block(`
A binary heap maintains the heap property: each parent is no larger than its children in a min-heap. That guarantees the root is the minimum, but it does not mean the array is sorted. Pushing and popping restore the property in O(log n) time by moving along the tree height. Peeking at the root is O(1).

This distinction matters because heaps solve priority access, not arbitrary search. If you need the next smallest repeatedly, a heap is perfect. If you need to find whether an arbitrary value exists, a set is better. If you need the entire sorted order once, sorting may be simpler and faster in practice than pushing and popping every element.
            `),
            bullets: [
              'Use a heap when the next min or max is the repeated operation.',
              'Python heapq is a min-heap; use negative priorities or tuples for max-like behavior.',
              'Do not expect heap array iteration to produce sorted order.'
            ],
            codeExample: {
              title: 'Priority queue basics with heapq',
              language: 'python',
              code: block(`
import heapq


tasks = []
heapq.heappush(tasks, (3, "write tests"))
heapq.heappush(tasks, (1, "fix bug"))
heapq.heappush(tasks, (2, "review code"))

while tasks:
    priority, task = heapq.heappop(tasks)
    print(priority, task)
              `)
            }
          },
          {
            heading: 'Top-k: keep only the candidates that can still win',
            body: block(`
For top-k largest elements in a stream, a min-heap of size k keeps the current winners. The root is the smallest winner. When a new value arrives, it only matters if it is larger than that root; otherwise it cannot enter the top k. This makes the cost O(n log k), which is better than O(n log n) sorting when k is much smaller than n.

The invariant is that after processing each item, the heap contains the k largest values seen so far, or all values if fewer than k have arrived. This invariant is easy to prove: new values below the root are worse than every current winner, and new values above the root replace the weakest winner.
            `),
            bullets: [
              'Use a min-heap of size k for k largest values.',
              'Use a max-heap simulation for k smallest values, or invert the comparison.',
              'When k is close to n, full sorting may be simpler and competitive.'
            ],
            codeExample: {
              title: 'Largest k values from a stream',
              language: 'python',
              code: block(`
import heapq


def top_k_largest(values, k):
    heap = []
    for value in values:
        if len(heap) < k:
            heapq.heappush(heap, value)
        elif value > heap[0]:
            heapq.heapreplace(heap, value)
    return sorted(heap, reverse=True)


print(top_k_largest([5, 1, 9, 3, 12, 7, 8], 3))
              `)
            }
          },
          {
            heading: 'Merge K sorted lists by expanding the smallest frontier',
            body: block(`
The merge-K pattern keeps one active candidate from each sorted source in a heap. Pop the smallest candidate, append it to the result, then push the next item from the same source. This is the same mental model whether the sources are arrays, linked lists, log files, or iterators.

The heap size is at most k, the number of sources, so the cost is O(n log k) for n total items. A full flatten-and-sort approach costs O(n log n) and requires all data up front. Heap merge is especially valuable when sources are streaming or already sorted by an upstream system.
            `),
            bullets: [
              'Push the first item from each non-empty source.',
              'Store source id and index so you can advance only the source that produced the minimum.',
              'Heap size depends on number of sources, not total item count.'
            ],
            codeExample: {
              title: 'Merge K sorted arrays',
              language: 'python',
              code: block(`
import heapq


def merge_sorted_arrays(arrays):
    heap = []
    for source, array in enumerate(arrays):
        if array:
            heapq.heappush(heap, (array[0], source, 0))

    result = []
    while heap:
        value, source, index = heapq.heappop(heap)
        result.append(value)
        next_index = index + 1
        if next_index < len(arrays[source]):
            heapq.heappush(heap, (arrays[source][next_index], source, next_index))
    return result


print(merge_sorted_arrays([[1, 4, 9], [2, 6], [0, 7, 8]]))
              `)
            }
          },
          {
            heading: 'Dijkstra is a priority frontier with relaxation',
            body: block(`
Dijkstra's algorithm is the graph version of "always expand the currently cheapest candidate." The priority queue stores tentative distances. Pop the smallest distance; if it is stale, skip it. Otherwise, relax outgoing edges by offering improved distances to neighbors. Nonnegative edge weights are required because once the smallest frontier node is finalized, no later path can make it cheaper.

Interviewers may not ask for full Dijkstra in a heap lesson, but the hint matters. When a problem says "minimum cost path" with nonnegative weights and many possible frontier states, BFS no longer works unless all edges have equal cost. A heap lets the algorithm choose by accumulated cost rather than number of steps.
            `),
            bullets: [
              'Use BFS for unweighted shortest paths; use Dijkstra for nonnegative weighted paths.',
              'Skip stale heap entries whose distance is no longer current.',
              'Negative weights break Dijkstra because finalized nodes may later improve.'
            ],
            codeExample: {
              title: 'Small Dijkstra implementation',
              language: 'python',
              code: block(`
import heapq


def dijkstra(graph, start):
    distances = {start: 0}
    heap = [(0, start)]
    while heap:
        distance, node = heapq.heappop(heap)
        if distance != distances[node]:
            continue
        for neighbor, weight in graph.get(node, []):
            candidate = distance + weight
            if candidate < distances.get(neighbor, float("inf")):
                distances[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))
    return distances


graph = {
    "A": [("B", 4), ("C", 1)],
    "C": [("B", 2), ("D", 5)],
    "B": [("D", 1)],
}
print(dijkstra(graph, "A"))
              `)
            }
          },
          {
            heading: 'Heap versus sort depends on k, streaming, and reuse',
            body: block(`
Heaps beat sorting when you do not need a total order or cannot wait for all data. Top-k streaming, rolling leaderboards, scheduling next events, and k-way merge all benefit from incremental priority access. Sorting is often better when all data is present, k is large, or the final answer needs every item in sorted order.

A clear interview answer compares costs and product constraints. Top 10 out of 10 million values favors a heap. Top 9 million out of 10 million probably favors sorting or selection algorithms. If values arrive forever, sorting is impossible without a window; a heap can maintain the current top k. If priorities update frequently, a heap may need lazy deletion or an indexed heap, which Python's standard heapq does not provide directly.
            `),
            bullets: [
              'Heap top-k is O(n log k); full sorting is O(n log n).',
              'Sorting gives a complete order; a heap gives repeated extremes.',
              'Priority updates require extra bookkeeping or lazy invalidation.'
            ],
            codeExample: {
              title: 'Lazy deletion for changing priorities',
              language: 'python',
              code: block(`
import heapq


def latest_priorities(events):
    heap = []
    current = {}
    for task, priority in events:
        current[task] = priority
        heapq.heappush(heap, (priority, task))

    ordered = []
    while heap:
        priority, task = heapq.heappop(heap)
        if current.get(task) == priority:
            ordered.append((task, priority))
            del current[task]
    return ordered


events = [("build", 5), ("test", 3), ("build", 1), ("deploy", 4)]
print(latest_priorities(events))
              `)
            }
          },
          {
            heading: 'Tie-breaking and tuple priorities must be intentional',
            body: block(`
Python's heapq compares tuple elements from left to right. That is convenient for (priority, value) pairs but can fail when values are unorderable objects or when ties need stable behavior. Add a monotonically increasing sequence number to make ties deterministic and avoid comparing task objects.

This is not just a Python detail. Priority queues always need a total ordering for queued entries. If two candidates have the same cost in a graph search, any order may be correct, but deterministic order makes debugging easier. If recency, lexicographic order, or insertion order matters, include it explicitly in the priority tuple.
            `),
            bullets: [
              'Tuple priorities compare left to right.',
              'Add a sequence number for stable tie-breaking.',
              'Never rely on object comparison unless the object defines the intended order.'
            ]
          }
        ],
        checklist: [
          'Can explain the heap property and why heap iteration is not sorted.',
          'Can implement top-k largest with a min-heap of size k.',
          'Can merge k sorted sources with a heap containing one frontier item per source.',
          'Can recognize Dijkstra as a heap-driven shortest-path frontier for nonnegative weights.'
        ],
        pitfalls: [
          'Using a heap when a set or dictionary is needed for arbitrary lookup.',
          'Sorting all values when k is tiny and only top-k is required.',
          'Forgetting that Python heapq is a min-heap.',
          'Letting stale priority entries produce duplicate or outdated results.'
        ],
        interviewPrompts: [
          'When does O(n log k) top-k beat sorting?',
          'Explain the heap invariant after processing each stream value.',
          'How does merge K sorted arrays keep heap size bounded by K?',
          'Why does Dijkstra require nonnegative edge weights?'
        ],
        exercises: [
          {
            id: 'top-k-frequent-words',
            title: 'Return the top k frequent words',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Count words and return the k most frequent. Break ties lexicographically ascending.',
            starterCode: block(`
def top_k_frequent_words(words, k):
    # TODO: count words.
    # TODO: sort or use a heap with a tie-breaking strategy.
    return []


print(top_k_frequent_words(["i", "love", "leetcode", "i", "love", "coding"], 2))
            `),
            solution: block(`
def top_k_frequent_words(words, k):
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    ordered = sorted(counts, key=lambda word: (-counts[word], word))
    return ordered[:k]


print(top_k_frequent_words(["i", "love", "leetcode", "i", "love", "coding"], 2))
            `),
            hints: [
              'The tie rule is lexicographic ascending for equal frequencies.',
              'Sorting unique words is acceptable when the prompt does not require streaming.',
              'A heap solution needs careful tie handling because Python has a min-heap.'
            ],
            expectedOutput: "['i', 'love']."
          },
          {
            id: 'kth-largest-stream',
            title: 'Track the kth largest value in a stream',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Create a class that receives values one at a time and returns the kth largest value after each insertion.',
            starterCode: block(`
class KthLargest:
    def __init__(self, k, initial):
        # TODO: keep a min-heap of at most k values.
        pass

    def add(self, value):
        # TODO: add value and return the kth largest.
        return None
            `),
            solution: block(`
import heapq


class KthLargest:
    def __init__(self, k, initial):
        self.k = k
        self.heap = []
        for value in initial:
            self.add(value)

    def add(self, value):
        if len(self.heap) < self.k:
            heapq.heappush(self.heap, value)
        elif value > self.heap[0]:
            heapq.heapreplace(self.heap, value)
        return self.heap[0]


tracker = KthLargest(3, [4, 5, 8, 2])
print(tracker.add(3))
print(tracker.add(10))
print(tracker.add(9))
            `),
            hints: [
              'The heap root is the kth largest among values seen so far.',
              'Values smaller than the root cannot affect the kth largest once the heap has size k.',
              'Use heapreplace to pop and push in one operation.'
            ],
            expectedOutput: '4, then 5, then 8.'
          },
          {
            id: 'priority-frontier-design',
            title: 'Design a priority frontier for route costs',
            difficulty: 'advanced',
            type: 'design',
            description:
              'Describe an algorithm for finding the cheapest route in a directed graph with nonnegative tolls and many alternate paths.',
            hints: [
              'Use a heap keyed by current best known total cost.',
              'Keep a distance map and skip stale heap entries.',
              'Explain why BFS is insufficient when edge costs differ.'
            ]
          }
        ],
        diagram: null,
        related: ['sliding-window-and-substring-invariants', 'recursion-backtracking-and-pruning']
      },
      {
        slug: 'recursion-backtracking-and-pruning',
        title: 'Recursion, backtracking, and pruning',
        summary:
          'Decision trees, combinations, permutations, undo steps, pruning rules, and the boundary where memoization replaces pure backtracking.',
        duration: '50-60 min',
        whyItMatters:
          'Backtracking problems test whether you can explore a huge search space deliberately, maintain state without leaks, and prune impossible branches without losing valid answers.',
        sections: [
          {
            heading: 'Recursion mirrors a decision tree',
            body: block(`
A recursive search call represents a partial decision and the remaining choices. The base case records a complete answer or rejects an invalid path. The recursive cases choose one option, move to the next state, then return. This structure is easier to reason about when you draw the first two levels of the decision tree before coding.

Complexity usually follows the size of the tree. A binary include/exclude decision over n items has up to 2^n leaves. A permutation search has n! leaves. The code may be short, but the search space is large. Interviewers expect you to name that cost and then discuss pruning, ordering, or memoization if constraints demand it.
            `),
            bullets: [
              'Define what one recursive state means.',
              'Write base cases for complete, invalid, and exhausted states.',
              'Estimate complexity from branching factor and depth.'
            ],
            codeExample: {
              title: 'Generate subsets with include/exclude recursion',
              language: 'python',
              code: block(`
def subsets(values):
    result = []
    path = []

    def dfs(index):
        if index == len(values):
            result.append(path[:])
            return
        dfs(index + 1)
        path.append(values[index])
        dfs(index + 1)
        path.pop()

    dfs(0)
    return result


print(subsets([1, 2, 3]))
              `)
            }
          },
          {
            heading: 'Backtracking is choose, recurse, undo',
            body: block(`
Backtracking mutates shared state for efficiency, then undoes the mutation before exploring the next branch. The canonical rhythm is choose an option, mark it in path or used state, recurse, then undo exactly what you changed. Forgetting the undo step leaks decisions into sibling branches and creates missing or duplicated answers.

Copying state for every recursive call is simpler but can be expensive. Mutate-and-undo is common for permutations, boards, and combinations. The invariant is that when a call begins, path and helper structures describe exactly the decisions on the stack above that call. When the call returns, the caller's state is restored.
            `),
            bullets: [
              'Undo every mutation made before the recursive call.',
              'Copy only when recording an answer or when mutation cost is not worth the complexity.',
              'Keep path state aligned with recursion depth.'
            ],
            codeExample: {
              title: 'Permutations with used flags',
              language: 'python',
              code: block(`
def permutations(values):
    result = []
    path = []
    used = [False] * len(values)

    def dfs():
        if len(path) == len(values):
            result.append(path[:])
            return
        for i, value in enumerate(values):
            if used[i]:
                continue
            used[i] = True
            path.append(value)
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return result


print(permutations([1, 2, 3]))
              `)
            }
          },
          {
            heading: 'Combinations avoid duplicates by controlling start index',
            body: block(`
Combinations choose items without caring about order. The simplest way to prevent duplicate orderings is to pass a start index and only choose later items. Choosing 1 then 2 is allowed; choosing 2 then 1 is never generated because after choosing index 1, the search only moves forward.

This start-index invariant also makes pruning easy. If you need k items and there are not enough remaining values to fill the path, stop. If values are sorted and the remaining sum is already too large or too small, stop. The more specific your state, the more precise your pruning can be.
            `),
            bullets: [
              'Use a start index for combinations and subsets with ordered input positions.',
              'Advance to i + 1 after choosing index i.',
              'Prune when remaining slots exceed remaining items.'
            ],
            codeExample: {
              title: 'Choose k combinations',
              language: 'python',
              code: block(`
def combinations(values, k):
    result = []
    path = []

    def dfs(start):
        if len(path) == k:
            result.append(path[:])
            return
        slots = k - len(path)
        for i in range(start, len(values) - slots + 1):
            path.append(values[i])
            dfs(i + 1)
            path.pop()

    dfs(0)
    return result


print(combinations([1, 2, 3, 4], 2))
              `)
            }
          },
          {
            heading: 'Pruning must be sound, not hopeful',
            body: block(`
Pruning removes branches that cannot possibly lead to a valid or better answer. A sound prune is backed by a bound: remaining candidates cannot reach the target, the partial cost already exceeds the best solution, a sorted next value would overshoot a positive target, or a constraint is already violated. A hopeful prune removes branches that merely look unlikely; that can make the algorithm incorrect.

Sorting often enables pruning because it gives bounds on future choices. In combination sum with positive numbers, once the current sorted candidate exceeds the remaining target, all later candidates also exceed it. In branch-and-bound optimization, if a partial cost is already worse than the best complete answer, adding nonnegative costs cannot improve it. Say the proof when you add the prune.
            `),
            bullets: [
              'Prune only when you can prove no valid answer exists below that branch.',
              'Sorting can turn later choices into monotonic bounds.',
              'Branch-and-bound requires a current best answer and a lower or upper bound.'
            ],
            codeExample: {
              title: 'Combination sum with sorted pruning',
              language: 'python',
              code: block(`
def combination_sum_once(values, target):
    values = sorted(values)
    result = []
    path = []

    def dfs(start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        prev = None
        for i in range(start, len(values)):
            value = values[i]
            if value == prev:
                continue
            if value > remaining:
                break
            path.append(value)
            dfs(i + 1, remaining - value)
            path.pop()
            prev = value

    dfs(0, target)
    return result


print(combination_sum_once([10, 1, 2, 7, 6, 1, 5], 8))
              `)
            }
          },
          {
            heading: 'Memoization starts when states overlap',
            body: block(`
Pure backtracking explores different paths because the path itself matters. Memoization is appropriate when many paths reach the same state and the future answer depends only on that state, not on the full route used to get there. For example, "can I make sum S using items from index i onward?" can memoize (i, S). A permutation path cannot usually memoize just index because the used set matters.

The boundary is important. If you memoize an incomplete state key, you will reuse answers in contexts where they are not valid. If you include the entire path in the key, you may remove no duplication. Strong candidates define the minimal sufficient state: all information that affects future choices and no irrelevant history.
            `),
            bullets: [
              'Memoize when the same state is reached through multiple paths.',
              'The cache key must include every fact that affects future decisions.',
              'Do not memoize path-dependent generation unless the state fully captures the path constraints.'
            ],
            codeExample: {
              title: 'Memoized target sum feasibility',
              language: 'python',
              code: block(`
from functools import lru_cache


def can_make_sum(values, target):
    @lru_cache(maxsize=None)
    def dfs(index, remaining):
        if remaining == 0:
            return True
        if index == len(values) or remaining < 0:
            return False
        return dfs(index + 1, remaining) or dfs(index + 1, remaining - values[index])

    return dfs(0, target)


print(can_make_sum((3, 4, 7, 12), 11))
print(can_make_sum((3, 4, 7, 12), 2))
              `)
            }
          },
          {
            heading: 'Interview backtracking narration',
            body: block(`
A concise narration makes backtracking feel controlled: define the state, list choices, define validity, define completion, state undo, then estimate complexity. For a Sudoku-like board, state might be the next empty cell and board contents; choices are valid digits; completion is no empty cells; undo resets the cell. For combinations, state is start index and path; choices are later indices; undo pops path.

Testing should include empty input, single item, duplicate values, impossible targets, and the smallest successful case. For generated outputs, order may not matter, so normalize before comparing. For optimization searches, test a case where pruning actually happens and a case where the first found answer is not optimal. This keeps a polished template from hiding a wrong invariant.
            `),
            bullets: [
              'Narrate state, choices, validity, completion, and undo before coding.',
              'Normalize generated result order in tests when order is not part of the contract.',
              'Use pruning tests that would fail if a branch were incorrectly skipped.'
            ]
          }
        ],
        checklist: [
          'Can map recursive calls to a decision tree and estimate branching complexity.',
          'Can implement choose, recurse, undo without leaking mutable state.',
          'Can avoid duplicate combinations with a start index and duplicate-skip rule.',
          'Can distinguish pure backtracking from memoizable overlapping-state search.'
        ],
        pitfalls: [
          'Appending path directly to results instead of appending a copy.',
          'Forgetting to undo used flags, board cells, or path choices.',
          'Pruning without a proof that no valid answer is below the branch.',
          'Memoizing with a key that omits relevant state such as used values or remaining target.'
        ],
        interviewPrompts: [
          'Explain the state and choices for generating combinations of size k.',
          'Why does permutation generation need used flags or in-place swaps?',
          'Give a sound pruning rule for sorted positive combination sum.',
          'When does memoization turn recursive search into dynamic programming?'
        ],
        exercises: [
          {
            id: 'generate-balanced-parentheses',
            title: 'Generate balanced parentheses',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Generate all balanced parentheses strings containing n pairs using backtracking and validity pruning.',
            starterCode: block(`
def generate_parentheses(n):
    # TODO: track how many opens and closes have been placed.
    # TODO: never place more closes than opens.
    return []


print(generate_parentheses(3))
            `),
            solution: block(`
def generate_parentheses(n):
    result = []
    path = []

    def dfs(opened, closed):
        if len(path) == 2 * n:
            result.append("".join(path))
            return
        if opened < n:
            path.append("(")
            dfs(opened + 1, closed)
            path.pop()
        if closed < opened:
            path.append(")")
            dfs(opened, closed + 1)
            path.pop()

    dfs(0, 0)
    return result


print(generate_parentheses(3))
            `),
            hints: [
              'You can add an opening parenthesis while opened < n.',
              'You can add a closing parenthesis only while closed < opened.',
              'Copy or join the path only at complete length.'
            ],
            expectedOutput: "['((()))', '(()())', '(())()', '()(())', '()()()']."
          },
          {
            id: 'word-search-grid',
            title: 'Search a word in a grid',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Return whether a word can be formed by adjacent cells without reusing a cell in the same path.',
            starterCode: block(`
def exists(board, word):
    # TODO: DFS from each matching start cell.
    # TODO: mark a cell visited during a path, then undo it.
    return False


grid = [["A", "B", "C"], ["S", "F", "D"], ["A", "D", "E"]]
print(exists(grid, "ABFDE"))
            `),
            solution: block(`
def exists(board, word):
    rows, cols = len(board), len(board[0])
    visited = set()

    def dfs(r, c, index):
        if index == len(word):
            return True
        if (
            r < 0 or r >= rows or c < 0 or c >= cols or
            (r, c) in visited or board[r][c] != word[index]
        ):
            return False

        visited.add((r, c))
        found = (
            dfs(r + 1, c, index + 1) or
            dfs(r - 1, c, index + 1) or
            dfs(r, c + 1, index + 1) or
            dfs(r, c - 1, index + 1)
        )
        visited.remove((r, c))
        return found

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True
    return False


grid = [["A", "B", "C"], ["S", "F", "D"], ["A", "D", "E"]]
print(exists(grid, "ABFDE"))
            `),
            hints: [
              'Visited state is path-specific, so undo after exploring neighbors.',
              'The base case succeeds when index reaches len(word).',
              'Check bounds, visited, and character match before recursing deeper.'
            ],
            expectedOutput: 'True.'
          },
          {
            id: 'backtracking-pruning-design',
            title: 'Design pruning for task assignment',
            difficulty: 'advanced',
            type: 'design',
            description:
              'Design a backtracking solver that assigns jobs to workers while minimizing the maximum worker load.',
            hints: [
              'Sort jobs descending so large constraints appear early.',
              'Track current worker loads and the best maximum load found so far.',
              'Prune branches whose current maximum already exceeds the best known answer.'
            ]
          }
        ],
        diagram: null,
        related: ['sliding-window-and-substring-invariants', 'heaps-topk-and-priority-queues']
      }
    ]
  }
];
