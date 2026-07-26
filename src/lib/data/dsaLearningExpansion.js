/**
 * Pedagogical DSA learning expansion modules.
 *
 * These lessons are authored study material. They are intentionally complete
 * on-page so learners can study the concept, inspect runnable stdlib-only
 * Python implementations, and then practice from starter code.
 */
const block = (value) => value.trim();

export const rawDsaLearningModules = [
  {
    slug: 'dsa-concepts-lab',
    title: 'DSA concepts lab',
    summary:
      'Build durable mental models for algorithmic complexity, memory behavior, hashing, trees, graphs, and topological ordering before jumping into timed coding drills.',
    objectives: [
      'Explain Big-O with concrete Python operations and input-growth intuition',
      'Choose data structures based on access patterns, mutation cost, and memory locality',
      'Model tree and graph problems with representations, BFS/DFS, and topological order that match current interview prompts'
    ],
    lessons: [
      {
        slug: 'complexity-and-algorithmic-thinking',
        title: 'Complexity and algorithmic thinking',
        summary:
          'Big-O intuition, amortized analysis, and data-structure choice using Python examples you can reason about at interview speed.',
        duration: '45-55 min',
        whyItMatters:
          'Current coding screens still expect complexity judgment, but the bar is practical: read constraints, pick a structure whose Python costs you can defend, and know when OA finish-correct-first differs from phone narration or onsite follow-ups.',
        sections: [
          {
            heading: 'Intuition: count how work grows',
            body: block(`
Big-O is a story about what happens when the input becomes much larger. You do not need to count every CPU instruction; you need to identify the part of the algorithm that grows fastest as n grows. A loop over n items grows linearly, a nested pair loop grows quadratically, and repeated halving grows logarithmically.

The useful habit is to narrate the algorithm before coding: "I scan the list once", "for each item I scan the rest", or "each comparison cuts the search space in half." That narration is often enough to choose between two approaches in an interview.
            `),
            bullets: [
              'O(1) work stays bounded as input grows.',
              'O(log n) usually comes from repeated halving or doubling.',
              'O(n), O(n log n), and O(n^2) often map to one pass, divide-and-conquer levels, and pairwise nested work.'
            ],
            codeExample: {
              title: 'Operation counters for common growth shapes',
              language: 'python',
              code: block(`
def linear_scan(values, target):
    checks = 0
    for value in values:
        checks += 1
        if value == target:
            return True, checks
    return False, checks


def pair_count(values):
    checks = 0
    for i in range(len(values)):
        for j in range(i + 1, len(values)):
            checks += 1
    return checks


def binary_search_checks(values, target):
    checks = 0
    lo, hi = 0, len(values) - 1
    while lo <= hi:
        checks += 1
        mid = (lo + hi) // 2
        if values[mid] == target:
            return True, checks
        if values[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False, checks


for n in [8, 16, 32, 64]:
    data = list(range(n))
    print(
        n,
        "linear", linear_scan(data, -1)[1],
        "pairs", pair_count(data),
        "binary", binary_search_checks(data, -1)[1]
    )
              `)
            }
          },
          {
            heading: 'Formal idea: upper bounds, dominant terms, and inputs',
            body: block(`
Formal complexity analysis names an input size and then bounds the number of primitive operations as that size grows. If an algorithm does 3n + 20 operations, the n term is the part that keeps growing, so we call it O(n). If it does n^2 + n, the quadratic term eventually dominates, so we call it O(n^2).

The input size is not always just "the length of the list." For a graph it may be vertices plus edges. For a string algorithm it may be text length and pattern length. State the variables before you state the bound: "Let V be the number of vertices and E be the number of edges."
            `),
            bullets: [
              'Drop constants and lower-order terms only after identifying the real input variables.',
              'Use worst-case unless the prompt or data distribution makes average-case important.',
              'Space complexity counts auxiliary memory, not just the returned output.'
            ],
            codeExample: {
              title: 'Timing demo: growth trend beats constants',
              language: 'python',
              code: block(`
from time import perf_counter


def contains_with_scan(values, queries):
    found = 0
    for query in queries:
        for value in values:
            if value == query:
                found += 1
                break
    return found


def contains_with_set(values, queries):
    lookup = set(values)
    return sum(1 for query in queries if query in lookup)


for n in [500, 1000, 2000, 4000]:
    values = list(range(n))
    queries = list(range(n, 2 * n))

    start = perf_counter()
    contains_with_scan(values, queries)
    scan_time = perf_counter() - start

    start = perf_counter()
    contains_with_set(values, queries)
    set_time = perf_counter() - start

    print(f"n={n:4d} scan={scan_time:.5f}s set={set_time:.5f}s")
              `)
            }
          },
          {
            heading: 'Worked example: choose the hot operation first',
            body: block(`
Suppose the task is: "Given many queries, report whether each query appears in a list." A direct scan is simple and uses O(1) extra space, but it repeats O(n) work for every query. If there are q queries, that is O(nq).

Building a set costs O(n) extra space and O(n) preprocessing time, but each membership query becomes O(1) average-case. The full cost is O(n + q). The best solution is not decided by taste; it is decided by which operation happens often enough to justify preprocessing.
            `),
            bullets: [
              'Name the repeated operation: membership lookup, min extraction, range query, or neighbor traversal.',
              'Consider preprocessing when many later operations reuse the same structure.',
              'Be ready to explain the trade-off in time and memory.'
            ],
            codeExample: {
              title: 'Preprocessing for many membership queries',
              language: 'python',
              code: block(`
def answer_queries_scan(values, queries):
    answers = []
    for query in queries:
        answers.append(any(value == query for value in values))
    return answers


def answer_queries_set(values, queries):
    lookup = set(values)
    return [query in lookup for query in queries]


values = [17, 4, 9, 21, 4, 30]
queries = [4, 10, 21, 99]
print(answer_queries_scan(values, queries))
print(answer_queries_set(values, queries))
              `)
            }
          },
          {
            heading: 'Amortized analysis: occasional expensive work can still be cheap overall',
            body: block(`
Worst-case cost asks what one unlucky operation can cost. Amortized cost asks what a long sequence of operations costs on average when the data structure pays for occasional rebuilding. Python list append is the classic example: most appends write into spare capacity, while rare appends resize the backing array and copy existing values.

Across many appends, every resize buys room for many future appends. That is why we describe append as O(1) amortized even though a single resize can cost O(n). In interviews, this distinction shows that you understand both the sharp edge and the long-run guarantee.
            `),
            bullets: [
              'Amortized does not mean average over random inputs; it means averaged over a sequence of operations.',
              'Dynamic arrays, hash table resizing, and path compression all use amortized reasoning.',
              'If latency spikes matter, mention the worst-case operation even when amortized cost is low.'
            ],
            codeExample: {
              title: 'A tiny dynamic array model',
              language: 'python',
              code: block(`
class TinyDynamicArray:
    def __init__(self):
        self.capacity = 1
        self.size = 0
        self.copied_items = 0

    def append(self, value):
        if self.size == self.capacity:
            self.copied_items += self.size
            self.capacity *= 2
        self.size += 1


array = TinyDynamicArray()
for value in range(1, 18):
    before = array.copied_items
    array.append(value)
    copied_now = array.copied_items - before
    print(
        f"append={value:2d} size={array.size:2d} "
        f"capacity={array.capacity:2d} copied_now={copied_now:2d}"
    )
              `)
            }
          },
          {
            heading: 'Interview ops: Python costs, constraints, and round type',
            body: block(`
In modern interviews you are usually coding in a real language, not pseudocode. Interviewers expect you to know the practical costs of Python builtins: list append and pop from the end are amortized O(1), but list.pop(0) and x in list are O(n). dict and set average O(1) membership, deque gives O(1) pops from both ends, heapq gives O(log n) push/pop, and bisect gives O(log n) search over a sorted list without rewriting binary search from scratch.

Round type changes the policy. In an online assessment, finish a correct solution and cover the main tests before polishing. In a phone screen, narrate the invariant while coding so the interviewer can follow. In an onsite, expect follow-ups that change constraints: less memory, streaming input, or a harder bound. Do not over-optimize a quadratic solution when n is 100 and the interviewer is still waiting for a clear first pass.
            `),
            bullets: [
              'Read n, value bounds, mutability, and online-versus-offline queries before choosing a structure.',
              'Prefer deque over list when you need popleft; prefer Counter/defaultdict for counting and grouping.',
              'OA: correct + tested first. Phone: narrate. Onsite: survive follow-ups without rewriting from zero.'
            ],
            codeExample: {
              title: 'Python structure costs you should be ready to say aloud',
              language: 'python',
              code: block(`
from collections import Counter, defaultdict, deque
from time import perf_counter
import heapq


def demo_costs(n=20000):
    values = list(range(n))

    start = perf_counter()
    found = -1 in values
    scan = perf_counter() - start

    start = perf_counter()
    found_set = -1 in set(values)
    hashed = perf_counter() - start

    queue = deque(values)
    start = perf_counter()
    while queue:
        queue.popleft()
    deque_time = perf_counter() - start

    heap = []
    start = perf_counter()
    for value in values:
        heapq.heappush(heap, value)
    while heap:
        heapq.heappop(heap)
    heap_time = perf_counter() - start

    counts = Counter(values)
    groups = defaultdict(list)
    for value in values:
        groups[value % 10].append(value)

    print("scan", round(scan, 5), "set", round(hashed, 5), "deque", round(deque_time, 5), "heap", round(heap_time, 5))
    print("counter_unique", len(counts), "groups", len(groups), "found", found, found_set)


demo_costs()
              `)
            }
          },
          {
            heading: 'Common mistakes: analyze the code you actually wrote',
            body: block(`
Complexity mistakes usually come from analyzing the intended idea instead of the actual implementation. A Python slice inside recursion copies data. A list membership check inside a loop is another hidden loop. Sorting before a scan changes the cost from O(n) to O(n log n), even if the final scan is linear.

A reliable interview habit is to inspect each line that touches the input. Ask whether it loops, copies, sorts, hashes, or allocates. Then combine those costs from the inside out. This catches the common gap between "the algorithm is linear" and "my implementation accidentally became quadratic."
            `),
            bullets: [
              'Watch for list slicing, repeated string concatenation, and `x in list` inside loops.',
              'Separate algorithmic complexity from Python implementation overhead.',
              'Always state both time and auxiliary space.'
            ]
          }
        ],
        checklist: [
          'Can explain O(1), O(log n), O(n), O(n log n), and O(n^2) with concrete examples.',
          'Can distinguish worst-case, average-case, and amortized cost.',
          'Can name the dominant operation before choosing a data structure.',
          'Can analyze hidden costs such as slicing, sorting, hashing, and repeated membership checks.'
        ],
        pitfalls: [
          'Treating Big-O as memorized labels instead of a growth comparison.',
          'Forgetting to define input variables for graphs, grids, or two-input problems.',
          'Calling hash table operations always O(1) without saying average-case.',
          'Optimizing constants before confirming the asymptotic bottleneck.'
        ],
        interviewPrompts: [
          'Teach back why appending to a dynamic array is amortized O(1).',
          'Given frequent membership checks, what structure would you choose and why?',
          'When can O(n log n) sorting beat an O(n) hash-map approach in practice?',
          'Find the hidden complexity bug in code that uses list slicing inside recursion.'
        ],
        exercises: [
          {
            id: 'two-sum-with-index-map',
            title: 'Solve two-sum with a one-pass index map',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Implement a one-pass O(n) two-sum solution. Return the first pair of indices whose values add to the target, or None when no pair exists.',
            starterCode: block(`
def two_sum_indices(values, target):
    # TODO: keep a dictionary from value to earliest index.
    # TODO: for each value, check whether target - value was seen.
    return None


print(two_sum_indices([2, 7, 11, 15], 9))
print(two_sum_indices([3, 2, 4], 6))
print(two_sum_indices([1, 2, 3], 10))
            `),
            solution: block(`
def two_sum_indices(values, target):
    seen = {}
    for index, value in enumerate(values):
        complement = target - value
        if complement in seen:
            return (seen[complement], index)
        if value not in seen:
            seen[value] = index
    return None


print(two_sum_indices([2, 7, 11, 15], 9))
print(two_sum_indices([3, 2, 4], 6))
print(two_sum_indices([1, 2, 3], 10))
            `),
            hints: [
              'The hot operation is "have I seen the needed complement?"',
              'Store the index before moving on, but check the complement first to avoid using the same item twice.',
              'The time complexity should be O(n) average-case and the extra space O(n).'
            ],
            expectedOutput: '(0, 1), then (1, 2), then None.'
          },
          {
            id: 'first-unique-character',
            title: 'Find the first unique character efficiently',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Return the first character that appears exactly once in a string. Use counting instead of repeatedly scanning the string.',
            starterCode: block(`
def first_unique_char(text):
    # TODO: count each character.
    # TODO: scan the text again and return the first character with count 1.
    return None


print(first_unique_char("swiss"))
print(first_unique_char("aabbcc"))
print(first_unique_char("interview"))
            `),
            solution: block(`
def first_unique_char(text):
    counts = {}
    for char in text:
        counts[char] = counts.get(char, 0) + 1

    for char in text:
        if counts[char] == 1:
            return char
    return None


print(first_unique_char("swiss"))
print(first_unique_char("aabbcc"))
print(first_unique_char("interview"))
            `),
            hints: [
              'A count dictionary turns repeated membership work into one preprocessing pass.',
              'The second pass preserves "first" order without sorting.',
              'Think about the all-duplicates case.'
            ],
            expectedOutput: 'w, then None, then n.'
          },
          {
            id: 'complexity-tradeoff-narration',
            title: 'Defend a complexity trade-off aloud',
            difficulty: 'beginner',
            type: 'design',
            description:
              'Given a membership-query workload over a mutable list, explain when a linear scan, a sorted array plus binary search, and a hash set are each the best default. Include time, space, mutation cost, and what you would say first in an interview.',
            hints: [
              'Name the hot operation and how often it runs relative to updates.',
              'Call out amortized resize cost and worst-case collision caveats for hashing.',
              'State the input sizes where asymptotic ties break because of constants.'
            ]
          },
        ],
        diagram: null,
        related: ['hash-tables-and-memory-layout', 'sorting-and-divide-and-conquer']
      },
      {
        slug: 'hash-tables-and-memory-layout',
        title: 'Hash tables and memory layout',
        summary:
          'Hashing, collisions, load factor, and practical memory-layout trade-offs between arrays, linked structures, and hash tables.',
        duration: '45-55 min',
        whyItMatters:
          'Hash tables power many optimal interview solutions, but strong candidates can also explain why collisions, resizing, and memory locality affect real performance.',
        sections: [
          {
            heading: 'Intuition: a hash table is a labeled shelf system',
            body: block(`
A hash table stores keys by turning each key into a numeric hash and then mapping that hash to a bucket. Instead of scanning every stored key, the table jumps to the bucket where the key should live. That is the source of average-case O(1) lookup.

Collisions are unavoidable because many possible keys map into a smaller number of buckets. A correct table must handle collisions and must still compare keys for equality. Hash equality points to a candidate location; key equality proves the match.
            `),
            bullets: [
              'Hashing chooses a candidate bucket; equality checks confirm the key.',
              'Separate chaining stores colliding entries in per-bucket lists.',
              'Open addressing stores entries in the array and probes for another slot.'
            ],
            codeExample: {
              title: 'Visualize buckets and collisions',
              language: 'python',
              code: block(`
def simple_hash(key):
    total = 0
    for char in key:
        total = total * 31 + ord(char)
    return total


def bucket_index(key, bucket_count):
    return simple_hash(key) % bucket_count


keys = ["cat", "act", "tac", "dog", "god", "bird", "bride"]
buckets = [[] for _ in range(5)]

for key in keys:
    buckets[bucket_index(key, len(buckets))].append(key)

for index, bucket in enumerate(buckets):
    print(f"bucket {index}: {bucket}")
              `)
            }
          },
          {
            heading: 'Formal idea: load factor controls expected chain length',
            body: block(`
Load factor is the number of entries divided by the number of buckets. When load factor is low and the hash function distributes keys well, each bucket stays short and operations are close to constant time. As load factor rises, collisions rise and lookup begins to resemble a bucket scan.

Resizing is the usual fix. The table allocates more buckets and reinserts every existing key because bucket indexes depend on the bucket count. That rehash is expensive at the moment it happens, but spread over many insertions it is amortized efficient.
            `),
            bullets: [
              'Average-case dictionary and set operations assume good hash distribution.',
              'Lower load factor buys speed with memory.',
              'Resizing changes bucket indexes, so every entry must be rehashed.'
            ],
            codeExample: {
              title: 'Separate chaining hash map from scratch',
              language: 'python',
              code: block(`
class ChainedHashMap:
    def __init__(self, bucket_count=4):
        self.buckets = [[] for _ in range(bucket_count)]
        self.size = 0

    def _index(self, key):
        return hash(key) % len(self.buckets)

    def _resize_if_needed(self):
        if self.size / len(self.buckets) <= 0.75:
            return
        old_items = [(key, value) for bucket in self.buckets for key, value in bucket]
        self.buckets = [[] for _ in range(len(self.buckets) * 2)]
        self.size = 0
        for key, value in old_items:
            self[key] = value

    def __setitem__(self, key, value):
        bucket = self.buckets[self._index(key)]
        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                bucket[i] = (key, value)
                return
        bucket.append((key, value))
        self.size += 1
        self._resize_if_needed()

    def __getitem__(self, key):
        bucket = self.buckets[self._index(key)]
        for existing_key, value in bucket:
            if existing_key == key:
                return value
        raise KeyError(key)

    def __contains__(self, key):
        bucket = self.buckets[self._index(key)]
        return any(existing_key == key for existing_key, _ in bucket)


table = ChainedHashMap()
for word in ["apple", "banana", "apple", "date", "fig", "grape"]:
    table[word] = table[word] + 1 if word in table else 1

print(table["apple"])
print("buckets", len(table.buckets), "size", table.size)
              `)
            }
          },
          {
            heading: 'Worked example: counting and grouping with hashes',
            body: block(`
Hash maps shine when each item must be placed into a category that can be checked or updated quickly. Counting words, grouping anagrams, remembering the first index of a value, and de-duplicating records all follow the same pattern: compute a key, update a bucket of information for that key, then continue scanning.

For anagrams, the grouping key must be equal for words with the same letters. Sorting each word is simple and often good enough: "eat", "tea", and "ate" all produce "aet". A frequency tuple can avoid the per-word sort when the alphabet is known, but it is more specialized.
            `),
            bullets: [
              'Choose a key that captures exactly the equivalence relation you care about.',
              'Use `dict.get`, `setdefault`, or `defaultdict` to update groups cleanly.',
              'Remember that the grouping key may have its own cost, such as sorting each word.'
            ],
            codeExample: {
              title: 'Group anagrams with a computed key',
              language: 'python',
              code: block(`
from collections import defaultdict


def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))
        groups[key].append(word)
    return list(groups.values())


words = ["eat", "tea", "tan", "ate", "nat", "bat"]
for group in group_anagrams(words):
    print(group)
              `)
            }
          },
          {
            heading: 'Memory layout: arrays, nodes, and cache locality',
            body: block(`
Asymptotic complexity does not fully describe performance. Arrays store neighboring elements near each other, which gives CPU caches a chance to load useful nearby data. Linked structures store nodes separately and follow pointers, which is flexible but often less cache-friendly.

Python adds object overhead on top of these ideas, but the mental model still matters. A list scan can be fast because iteration is simple and local. A linked list may have O(1) insertion after a known node, but finding that node can dominate the work. A hash table spends extra memory on sparse buckets to buy fast lookup.
            `),
            bullets: [
              'Lists are strong for indexed access and sequential scans.',
              'Linked nodes are useful when stable references and local rewiring matter.',
              'Hash tables trade extra memory and unordered storage for lookup speed.'
            ],
            codeExample: {
              title: 'Array scan versus pointer chasing shape',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, value, next_node=None):
        self.value = value
        self.next = next_node


def build_linked_list(values):
    head = None
    for value in reversed(values):
        head = Node(value, head)
    return head


def sum_array(values):
    total = 0
    for value in values:
        total += value
    return total


def sum_linked_list(head):
    total = 0
    node = head
    while node is not None:
        total += node.value
        node = node.next
    return total


values = list(range(10))
head = build_linked_list(values)
print(sum_array(values))
print(sum_linked_list(head))
              `)
            }
          },
          {
            heading: 'Common mistakes: hashing is not magic',
            body: block(`
The most common hash-table mistake is saying "dictionary lookup is O(1)" as if that were an unconditional law. The more precise statement is average-case O(1), assuming a good hash function, controlled load factor, and equality comparisons that are not themselves expensive.

Another frequent mistake is ignoring ordering. A set can tell you whether a value exists, but it does not preserve the sorted relationship needed for range queries. A hash map can count items quickly, but if the problem asks for the next smaller key, a sorted structure or heap-like approach may be better.
            `),
            bullets: [
              'Do not use mutable objects as keys unless their hash and equality are stable.',
              'Do not replace every scan with a map when memory is constrained and the scan is cheap.',
              'Do not use a hash table when ordered neighbor queries are the core operation.'
            ]
          }
        ],
        checklist: [
          'Can describe how a key becomes a bucket index.',
          'Can explain collisions, equality checks, load factor, and resizing.',
          'Can implement a small separate-chaining hash map.',
          'Can compare cache-friendly arrays with pointer-heavy linked structures.'
        ],
        pitfalls: [
          'Saying dictionary operations are always O(1) without average-case assumptions.',
          'Ignoring memory cost when replacing scans with hash maps.',
          'Choosing linked lists for theoretical insertion speed when traversal dominates.',
          'Using a grouping key that loses information or includes irrelevant information.'
        ],
        interviewPrompts: [
          'What happens to a hash table as load factor increases?',
          'Why can an array outperform a linked list even when both perform one pass?',
          'How would you design a key for grouping anagrams?',
          'What makes a custom object safe or unsafe as a dictionary key?'
        ],
        exercises: [
          {
            id: 'tiny-frequency-map',
            title: 'Build a frequency map with explicit buckets',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Complete a tiny separate-chaining frequency map for strings. Increment counts and return 0 for missing keys.',
            starterCode: block(`
class TinyFrequencyMap:
    def __init__(self, bucket_count=8):
        self.buckets = [[] for _ in range(bucket_count)]

    def _index(self, key):
        return hash(key) % len(self.buckets)

    def increment(self, key):
        # TODO: find key in the target bucket and increment its count.
        # TODO: append (key, 1) if the key is new.
        pass

    def get(self, key):
        # TODO: return the stored count or 0 when missing.
        return 0


freq = TinyFrequencyMap()
for word in "hash maps make maps useful".split():
    freq.increment(word)

print(freq.get("maps"))
print(freq.get("hash"))
print(freq.get("missing"))
            `),
            solution: block(`
class TinyFrequencyMap:
    def __init__(self, bucket_count=8):
        self.buckets = [[] for _ in range(bucket_count)]

    def _index(self, key):
        return hash(key) % len(self.buckets)

    def increment(self, key):
        bucket = self.buckets[self._index(key)]
        for index, (existing_key, count) in enumerate(bucket):
            if existing_key == key:
                bucket[index] = (existing_key, count + 1)
                return
        bucket.append((key, 1))

    def get(self, key):
        bucket = self.buckets[self._index(key)]
        for existing_key, count in bucket:
            if existing_key == key:
                return count
        return 0


freq = TinyFrequencyMap()
for word in "hash maps make maps useful".split():
    freq.increment(word)

print(freq.get("maps"))
print(freq.get("hash"))
print(freq.get("missing"))
            `),
            hints: [
              'Only scan the bucket selected by `_index`.',
              'Store pairs as `(key, count)` and replace the pair when incrementing.',
              'A missing key should not raise an error for this exercise.'
            ],
            expectedOutput: '2, then 1, then 0.'
          },
          {
            id: 'group-anagrams-stdlib',
            title: 'Group anagrams using a hashable signature',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Group words that contain the same letters. Return groups as lists; preserve the order in which each group first appears.',
            starterCode: block(`
def group_anagrams(words):
    groups = {}
    order = []
    for word in words:
        # TODO: compute a hashable signature for the word.
        # TODO: create a new group on first sight, then append the word.
        pass
    return [groups[key] for key in order]


print(group_anagrams(["listen", "silent", "enlist", "google", "gogole", "rat"]))
            `),
            solution: block(`
def group_anagrams(words):
    groups = {}
    order = []
    for word in words:
        signature = tuple(sorted(word))
        if signature not in groups:
            groups[signature] = []
            order.append(signature)
        groups[signature].append(word)
    return [groups[key] for key in order]


print(group_anagrams(["listen", "silent", "enlist", "google", "gogole", "rat"]))
            `),
            hints: [
              'Lists are not hashable, but tuples are.',
              'Sorted letters form the same signature for anagrams.',
              'Keep a separate `order` list if you want output order to follow first appearance.'
            ],
            expectedOutput:
              '[["listen", "silent", "enlist"], ["google", "gogole"], ["rat"]] or the same grouping with Python tuple/list formatting.'
          },
          {
            id: 'hash-table-layout-tradeoff',
            title: 'Choose a hash-table layout under constraints',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'An interviewer asks you to store 50 million string keys with frequent lookups and occasional deletes. Compare separate chaining versus open addressing, then explain load factor, tombstones, and when you would rebuild the table.',
            hints: [
              'Separate chaining tolerates higher load; open addressing is more cache-friendly until clustering grows.',
              'Deletion semantics differ: chaining removes nodes, open addressing often needs tombstones.',
              'Say expected O(1) under a good hash and bounded load, worst case O(n) under pathological collisions.'
            ]
          },
        ],
        diagram: null,
        related: ['complexity-and-algorithmic-thinking', 'trees-graphs-mental-models']
      },
      {
        slug: 'trees-graphs-mental-models',
        title: 'Trees and graphs mental models',
        summary:
          'Represent trees and graphs clearly, choose adjacency lists or matrices, and rehearse BFS/DFS traversal templates in Python.',
        duration: '50-60 min',
        whyItMatters:
          'Many hard-looking problems become approachable once you model state as nodes and edges. Representation choice decides whether traversal is simple or awkward.',
        sections: [
          {
            heading: 'Intuition: nodes, edges, and promises',
            body: block(`
A tree is a graph with strong promises: it is connected and acyclic, and many interview trees also have a root that gives edges a parent-child direction. A general graph removes some of those promises. It may have cycles, disconnected components, directed edges, weighted edges, or all of those at once.

Those promises decide the traversal template. Tree recursion often does not need a visited set because there is only one path from parent to child. Graph traversal usually needs visited tracking because a cycle can send the search back to a node it has already seen.
            `),
            bullets: [
              'Trees are constrained graphs; graphs are the more general model.',
              'Directed edges model one-way relationships such as prerequisites.',
              'Weighted edges model costs such as distance, time, or risk.'
            ],
            codeExample: {
              title: 'Tree DFS that returns height and balance',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value
        self.left = left
        self.right = right


def height_and_balanced(root):
    if root is None:
        return 0, True

    left_height, left_ok = height_and_balanced(root.left)
    right_height, right_ok = height_and_balanced(root.right)
    height = 1 + max(left_height, right_height)
    balanced = left_ok and right_ok and abs(left_height - right_height) <= 1
    return height, balanced


tree = Node(1, Node(2, Node(4), Node(5)), Node(3))
print(height_and_balanced(tree))
              `)
            }
          },
          {
            heading: 'Formal idea: representation drives complexity',
            body: block(`
An adjacency list stores only existing edges: each node maps to its neighbors. It is usually best for sparse graphs because traversal touches O(V + E) total data. An adjacency matrix stores every possible pair, so it costs O(V^2) memory but answers "is there an edge from u to v?" in O(1).

Grids are graphs too. A cell is a node, and allowed moves define edges to neighboring cells. You usually do not materialize all grid edges; you generate valid neighbors on the fly from row and column offsets.
            `),
            bullets: [
              'Adjacency lists fit sparse graphs and traversal-heavy problems.',
              'Adjacency matrices fit dense graphs or repeated edge-existence checks.',
              'Grid graphs often use generated neighbors instead of a stored graph.'
            ],
            codeExample: {
              title: 'Build adjacency list and matrix',
              language: 'python',
              code: block(`
edges = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D")]
nodes = sorted({node for edge in edges for node in edge})

adj_list = {node: [] for node in nodes}
for source, target in edges:
    adj_list[source].append(target)

index = {node: i for i, node in enumerate(nodes)}
matrix = [[False] * len(nodes) for _ in nodes]
for source, target in edges:
    matrix[index[source]][index[target]] = True

print(adj_list)
print("A -> C?", matrix[index["A"]][index["C"]])
print("D -> A?", matrix[index["D"]][index["A"]])
              `)
            }
          },
          {
            heading: 'Worked example: BFS finds shortest paths in unweighted graphs',
            body: block(`
Breadth-first search explores in layers. It visits all nodes at distance 1 from the start before distance 2, all nodes at distance 2 before distance 3, and so on. That level-order property is exactly why BFS gives shortest path length in an unweighted graph.

To recover the path, store each node's parent the first time it is discovered. When the target is found, walk backward through parents and reverse the result. This is a complete interview template for word ladders, maze shortest paths, and minimum button-press problems.
            `),
            bullets: [
              'Use a queue for FIFO layer expansion.',
              'Mark nodes visited when enqueuing, not when dequeuing, to avoid duplicates.',
              'Store parents when the prompt asks for the actual path, not only the distance.'
            ],
            codeExample: {
              title: 'BFS shortest path with parent reconstruction',
              language: 'python',
              code: block(`
from collections import deque


def shortest_path(graph, start, target):
    queue = deque([start])
    parent = {start: None}

    while queue:
        node = queue.popleft()
        if node == target:
            path = []
            while node is not None:
                path.append(node)
                node = parent[node]
            return list(reversed(path))

        for neighbor in graph.get(node, []):
            if neighbor not in parent:
                parent[neighbor] = node
                queue.append(neighbor)

    return None


graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"]
}
print(shortest_path(graph, "A", "F"))
              `)
            }
          },
          {
            heading: 'DFS, components, and backtracking',
            body: block(`
Depth-first search explores one path as far as it can before backtracking. That makes it natural for connected components, cycle detection, topological sorting, and tree-style "return information from children" problems. Recursive DFS is concise; iterative DFS avoids recursion-depth limits.

For components, DFS starts from each unvisited node and marks everything reachable from it. Each start that discovers new nodes represents one component. The total traversal cost is O(V + E) for an adjacency list because each vertex and edge is processed a bounded number of times.
            `),
            bullets: [
              'Recursive DFS mirrors tree reasoning but can overflow on deep inputs.',
              'Iterative DFS uses an explicit stack and is often safer in Python.',
              'For undirected components, every edge appears twice in a typical adjacency list.'
            ],
            codeExample: {
              title: 'Connected components with iterative DFS',
              language: 'python',
              code: block(`
def connected_components(graph):
    seen = set()
    components = []

    for start in graph:
        if start in seen:
            continue
        stack = [start]
        seen.add(start)
        component = []

        while stack:
            node = stack.pop()
            component.append(node)
            for neighbor in graph[node]:
                if neighbor not in seen:
                    seen.add(neighbor)
                    stack.append(neighbor)

        components.append(component)

    return components


graph = {
    0: [1],
    1: [0, 2],
    2: [1],
    3: [4],
    4: [3],
    5: []
}
print(connected_components(graph))
              `)
            }
          },
          {
            heading: 'Interview staple: topological order and cycle detection',
            body: block(`
Course-schedule style prompts are still among the most common graph interview questions because they combine representation, BFS/DFS, and correctness under cycles. Topological order exists only for directed acyclic graphs. Kahn's algorithm repeatedly removes nodes with indegree zero. A DFS coloring algorithm marks nodes as visiting and visited; seeing a visiting neighbor means a cycle.

Say the interview sentence clearly: "I will build an adjacency list and indegrees, then BFS from zero-indegree nodes. If I process fewer than n nodes, a cycle blocks a valid order." That framing transfers to build systems, prerequisite graphs, alien-dictionary style ordering, and many hidden DAG prompts.
            `),
            bullets: [
              'Kahn BFS uses indegrees and a queue; processed count < n means cycle.',
              'DFS colors (unvisited / visiting / visited) detect back edges for cycle rejection.',
              'Return any valid order unless the prompt asks for lexicographically smallest.'
            ],
            codeExample: {
              title: 'Kahn topological order for course prerequisites',
              language: 'python',
              code: block(`
from collections import defaultdict, deque


def course_order(num_courses, prerequisites):
    graph = defaultdict(list)
    indegree = [0] * num_courses
    for course, need in prerequisites:
        graph[need].append(course)
        indegree[course] += 1

    queue = deque([node for node in range(num_courses) if indegree[node] == 0])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    return order if len(order) == num_courses else []


print(course_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]))
print(course_order(2, [[0, 1], [1, 0]]))
              `)
            }
          },
          {
            heading: 'Common mistakes: traversal order is a tool, not decoration',
            body: block(`
Choosing BFS or DFS because one feels familiar is a common source of bugs. If the prompt asks for shortest distance in an unweighted graph, BFS is usually the direct fit. If the prompt asks whether a region is connected or wants all valid configurations, DFS often reads more naturally.

Another mistake is forgetting what counts as a node. In a grid problem, the node is not the value in the cell; it is usually the coordinate. In a state-space search, the node may be a tuple such as "(position, remaining_keys)". If the state is incomplete, the visited set will incorrectly merge different situations.
            `),
            bullets: [
              'Use coordinates or full state tuples as visited keys when values are not unique.',
              'Do not use DFS for shortest path just because it eventually finds a path.',
              'Be explicit about directed versus undirected edge construction.'
            ]
          }
        ],
        checklist: [
          'Can tell when a prompt is tree-specific versus general graph traversal.',
          'Can choose adjacency list, matrix, or generated grid neighbors.',
          'Can write BFS shortest path and DFS component templates from memory.',
          'Can state graph traversal complexity as O(V + E) for adjacency lists.'
        ],
        pitfalls: [
          'Forgetting visited tracking on graphs with cycles.',
          'Using a matrix for sparse graphs and wasting O(V^2) memory.',
          'Choosing DFS for shortest path in an unweighted graph when BFS is simpler.',
          'Using cell values as visited keys when duplicate values exist.'
        ],
        interviewPrompts: [
          'Explain why a tree does not usually need a visited set but a graph does.',
          'When would an adjacency matrix be a good trade-off?',
          'Teach back the difference between BFS levels and DFS recursion depth.',
          'How would you model a lock-combination problem as a graph?'
        ],
        exercises: [
          {
            id: 'count-islands-grid-dfs',
            title: 'Count islands in a grid',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Count connected groups of 1s in a grid. Cells connect vertically and horizontally, not diagonally.',
            starterCode: block(`
def count_islands(grid):
    # TODO: iterate every cell.
    # TODO: when you find unseen land, run DFS/BFS to mark the whole island.
    return 0


grid = [
    [1, 1, 0, 0],
    [0, 1, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 0]
]
print(count_islands(grid))
            `),
            solution: block(`
def count_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()

    def neighbors(r, c):
        for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                yield nr, nc

    def flood_fill(start):
        stack = [start]
        seen.add(start)
        while stack:
            r, c = stack.pop()
            for nr, nc in neighbors(r, c):
                if grid[nr][nc] == 1 and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    stack.append((nr, nc))

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and (r, c) not in seen:
                islands += 1
                flood_fill((r, c))
    return islands


grid = [
    [1, 1, 0, 0],
    [0, 1, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 0]
]
print(count_islands(grid))
            `),
            hints: [
              'Use `(row, col)` tuples in the visited set.',
              'A new DFS/BFS start means a new island.',
              'Diagonal neighbors are not allowed for this prompt.'
            ],
            expectedOutput: '3'
          },
          {
            id: 'topological-course-order',
            title: 'Return a valid course order',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Given prerequisite pairs `(course, prerequisite)`, return one valid order using Kahn BFS topological sort.',
            starterCode: block(`
from collections import deque


def course_order(num_courses, prerequisites):
    # TODO: build adjacency from prerequisite -> course.
    # TODO: compute indegrees.
    # TODO: push all indegree-zero courses into a queue and process them.
    return []


print(course_order(4, [(1, 0), (2, 0), (3, 1), (3, 2)]))
print(course_order(2, [(0, 1), (1, 0)]))
            `),
            solution: block(`
from collections import deque


def course_order(num_courses, prerequisites):
    graph = {course: [] for course in range(num_courses)}
    indegree = [0] * num_courses

    for course, prerequisite in prerequisites:
        graph[prerequisite].append(course)
        indegree[course] += 1

    queue = deque(course for course in range(num_courses) if indegree[course] == 0)
    order = []

    while queue:
        course = queue.popleft()
        order.append(course)
        for next_course in graph[course]:
            indegree[next_course] -= 1
            if indegree[next_course] == 0:
                queue.append(next_course)

    return order if len(order) == num_courses else []


print(course_order(4, [(1, 0), (2, 0), (3, 1), (3, 2)]))
print(course_order(2, [(0, 1), (1, 0)]))
            `),
            hints: [
              'Indegree counts how many prerequisites remain.',
              'Courses with indegree 0 can be taken immediately.',
              'If the final order is short, the graph has a cycle.'
            ],
            expectedOutput: 'A valid order such as [0, 1, 2, 3], then [].'
          },
          {
            id: 'graph-representation-choice',
            title: 'Pick a graph representation for the prompt',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Walk through adjacency list versus matrix versus edge list for a sparse social graph, a dense board game graph, and a streaming edge feed. For each case, state the operations that become cheap or expensive and what traversal you would start with.',
            hints: [
              'Sparse graphs favor adjacency lists for O(V + E) traversal.',
              'Dense graphs or fast edge existence checks may favor matrices.',
              'Edge lists are natural for sorting edges in Kruskal-style algorithms.'
            ]
          },
        ],
        diagram: null,
        related: ['shortest-paths-and-union-find', 'dynamic-programming-cookbook']
      }
    ]
  },
  {
    slug: 'dsa-algorithms-lab',
    title: 'Algorithms lab',
    summary:
      'Practice the algorithm families that shape medium and hard interviews: sorting, divide-and-conquer, shortest paths, Union-Find, and dynamic programming.',
    objectives: [
      'Use recursion trees to reason about divide-and-conquer cost',
      'Choose Dijkstra or Union-Find for graph problems based on the operation being optimized',
      'Map dynamic-programming prompts to state, transition, and base cases'
    ],
    lessons: [
      {
        slug: 'sorting-and-divide-and-conquer',
        title: 'Sorting and divide and conquer',
        summary:
          'Merge sort, quickselect, recursion trees, and the moments where sorting first makes a problem easier to solve.',
        duration: '50-60 min',
        whyItMatters:
          'Sorting is both a tool and a signal. It can expose order, adjacency, and two-pointer structure that is hard to see in the raw input.',
        sections: [
          {
            heading: 'Intuition: sorting reveals neighboring structure',
            body: block(`
Sorting changes the view of the input. Duplicates become adjacent, intervals can be processed in start-time order, and two pointers can move inward with a clear invariant. Even when sorting is not the final goal, it often turns a global search into local checks.

The trade-off is that sorting costs O(n log n) and may destroy original order. If the prompt depends on original positions, preserve them as pairs or choose a hash-based approach instead. If the prompt cares about relative order as the answer, sorting may be invalid.
            `),
            bullets: [
              'Sort intervals before merging or overlap checks.',
              'Sort numbers before two-pointer scans when memory should stay small.',
              'Do not sort away order when index sequence or stability matters.'
            ],
            codeExample: {
              title: 'Sort-first interval merging',
              language: 'python',
              code: block(`
def merge_intervals(intervals):
    if not intervals:
        return []

    intervals = sorted(intervals)
    merged = [list(intervals[0])]

    for start, end in intervals[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = max(last[1], end)
        else:
            merged.append([start, end])

    return [tuple(interval) for interval in merged]


print(merge_intervals([(5, 7), (1, 3), (2, 6), (10, 12)]))
              `)
            }
          },
          {
            heading: 'Formal idea: divide, conquer, combine',
            body: block(`
Divide-and-conquer algorithms split a problem into smaller subproblems, solve each subproblem, and combine their answers. Merge sort is the cleanest model: split the list in half, recursively sort both halves, and merge two sorted lists in linear time.

The recursion tree explains the O(n log n) bound. There are O(log n) levels because the input is halved each time. Each level does O(n) total merge work across all subproblems. Multiplying levels by work per level gives O(n log n).
            `),
            bullets: [
              'Balanced splits usually lead to logarithmic recursion depth.',
              'The combine step determines whether the split was worth it.',
              'Merge sort is stable when the merge chooses from the left side on equal values.'
            ],
            codeExample: {
              title: 'Merge sort with a stable merge',
              language: 'python',
              code: block(`
def merge_sort(values):
    if len(values) <= 1:
        return values[:]

    mid = len(values) // 2
    left = merge_sort(values[:mid])
    right = merge_sort(values[mid:])
    return merge(left, right)


def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result


print(merge_sort([5, 2, 9, 1, 5, 6]))
              `)
            }
          },
          {
            heading: 'Worked example: quickselect only recurses into one side',
            body: block(`
Quicksort partitions around a pivot and recursively sorts both sides. Quickselect uses the same partition idea but only follows the side that contains the kth item. That is why its average time is O(n): each partition scans the current region, and good pivots shrink the region quickly.

The worst case is still O(n^2) if pivots repeatedly create extremely unbalanced partitions. Random pivots or median-ish pivot choices reduce that risk. In Python interviews, a clear three-list partition is often acceptable for explanation, while in-place partitioning is a useful follow-up.
            `),
            bullets: [
              'Partitioning is reusable beyond full sorting.',
              'Quickselect finds an order statistic without sorting everything.',
              'Randomized pivots protect against already sorted or adversarial input.'
            ],
            codeExample: {
              title: 'Quickselect kth smallest with random pivots',
              language: 'python',
              code: block(`
from random import Random


def quickselect(values, k):
    if not 0 <= k < len(values):
        raise IndexError("k out of range")

    rng = Random(7)
    items = list(values)

    while True:
        pivot = items[rng.randrange(len(items))]
        lows = [value for value in items if value < pivot]
        equals = [value for value in items if value == pivot]
        highs = [value for value in items if value > pivot]

        if k < len(lows):
            items = lows
        elif k < len(lows) + len(equals):
            return pivot
        else:
            k -= len(lows) + len(equals)
            items = highs


data = [9, 3, 7, 3, 2, 8, 5]
print(quickselect(data, 0))
print(quickselect(data, 3))
              `)
            }
          },
          {
            heading: 'Counting during combine: inversions as a pattern',
            body: block(`
Divide-and-conquer can do more than sort. During merge sort, when an item from the right half moves before remaining items in the left half, it forms inversions with all of those remaining left items. Counting that during merge gives an O(n log n) inversion counter.

This pattern appears whenever the sorted halves let you count many pair relationships at once. Instead of checking all O(n^2) pairs, you use the combine step to summarize cross-boundary information in bulk.
            `),
            bullets: [
              'The split handles pairs entirely inside each half recursively.',
              'The merge handles pairs that cross from left half to right half.',
              'Sorted order lets one comparison count many skipped pairs.'
            ],
            codeExample: {
              title: 'Count inversions with merge sort',
              language: 'python',
              code: block(`
def count_inversions(values):
    sorted_values, count = sort_and_count(values)
    return count


def sort_and_count(values):
    if len(values) <= 1:
        return values[:], 0

    mid = len(values) // 2
    left, left_count = sort_and_count(values[:mid])
    right, right_count = sort_and_count(values[mid:])
    merged, split_count = merge_and_count(left, right)
    return merged, left_count + right_count + split_count


def merge_and_count(left, right):
    merged = []
    inversions = 0
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            inversions += len(left) - i
            j += 1

    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged, inversions


print(count_inversions([2, 4, 1, 3, 5]))
              `)
            }
          },
          {
            heading: 'Common mistakes: recursion and ordering have costs',
            body: block(`
The easiest divide-and-conquer bug is an incorrect base case that never shrinks the problem. The second easiest bug is a combine step that silently loses duplicates or changes stability. For sorting, test empty input, one item, duplicates, already sorted input, and reverse sorted input.

Python slicing also deserves attention. The expression "values[:mid]" is readable but copies lists, so it adds memory overhead. That is acceptable for teaching and many interviews if you mention it. Production implementations often pass index ranges or use iterative algorithms to reduce allocations.
            `),
            bullets: [
              'Always prove the recursive call receives a smaller problem.',
              'Track whether duplicates should be preserved and whether stability matters.',
              'Mention slice-copy memory when using clean recursive Python.'
            ]
          }
        ],
        checklist: [
          'Can draw the recursion tree for merge sort and explain O(n log n).',
          'Can describe why quickselect has average O(n) and worst-case O(n^2).',
          'Can identify prompts where sorting reveals a simpler invariant.',
          'Can use divide-and-conquer combine logic to count cross-boundary relationships.'
        ],
        pitfalls: [
          'Sorting away information when original order matters.',
          'Claiming quicksort or quickselect are always optimal without worst-case context.',
          'Writing recursive slice-heavy code in Python without acknowledging extra memory.',
          'Forgetting duplicate handling in partition or merge logic.'
        ],
        interviewPrompts: [
          'Why does merge sort do O(n) work at each recursion level?',
          'How would you make quicksort less vulnerable to already sorted input?',
          'Give two examples where sorting first simplifies the rest of the algorithm.',
          'How does inversion counting avoid checking every pair?'
        ],
        exercises: [
          {
            id: 'merge-overlapping-intervals',
            title: 'Merge overlapping intervals',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Sort intervals by start and merge all overlaps. Return a new list of tuples.',
            starterCode: block(`
def merge_intervals(intervals):
    # TODO: handle empty input.
    # TODO: sort by start time.
    # TODO: merge into the previous interval when ranges overlap.
    return []


print(merge_intervals([(1, 4), (2, 5), (7, 9), (8, 10)]))
print(merge_intervals([]))
            `),
            solution: block(`
def merge_intervals(intervals):
    if not intervals:
        return []

    sorted_intervals = sorted(intervals)
    merged = [list(sorted_intervals[0])]

    for start, end in sorted_intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    return [tuple(interval) for interval in merged]


print(merge_intervals([(1, 4), (2, 5), (7, 9), (8, 10)]))
print(merge_intervals([]))
            `),
            hints: [
              'After sorting, only the previous merged interval can overlap the current interval.',
              'Use `max` to preserve the farthest end.',
              'Convert mutable working lists back to tuples if you want immutable results.'
            ],
            expectedOutput: '[(1, 5), (7, 10)], then [].'
          },
          {
            id: 'kth-largest-quickselect',
            title: 'Find kth largest with quickselect',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Return the kth largest value without fully sorting the input. Use partitioning around a pivot.',
            starterCode: block(`
def kth_largest(values, k):
    # TODO: convert kth largest into a zero-based kth smallest index.
    # TODO: partition around a pivot and recurse/iterate into one side.
    return None


print(kth_largest([3, 2, 1, 5, 6, 4], 2))
print(kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))
            `),
            solution: block(`
def kth_largest(values, k):
    target = len(values) - k
    items = list(values)

    while True:
        pivot = items[len(items) // 2]
        lows = [value for value in items if value < pivot]
        equals = [value for value in items if value == pivot]
        highs = [value for value in items if value > pivot]

        if target < len(lows):
            items = lows
        elif target < len(lows) + len(equals):
            return pivot
        else:
            target -= len(lows) + len(equals)
            items = highs


print(kth_largest([3, 2, 1, 5, 6, 4], 2))
print(kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))
            `),
            hints: [
              'The 2nd largest is index `len(values) - 2` in sorted ascending order.',
              'Duplicates belong in an `equals` partition.',
              'Only one partition can contain the target index.'
            ],
            expectedOutput: '5, then 4.'
          },
          {
            id: 'sort-algorithm-selection',
            title: 'Select a sorting strategy under constraints',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Compare mergesort, quicksort, heapsort, and counting/radix-style sorts for nearly sorted integers, huge external files, and objects with expensive comparisons. Defend stability, memory, and worst-case guarantees the way you would in an interview.',
            hints: [
              'Stability matters when secondary keys must preserve prior order.',
              'External or linked data often favors merge-style approaches.',
              'Integer keys with bounded range unlock linear-time counting/radix ideas.'
            ]
          },
        ],
        diagram: null,
        related: ['complexity-and-algorithmic-thinking', 'dynamic-programming-cookbook']
      },
      {
        slug: 'shortest-paths-and-union-find',
        title: 'Shortest paths and Union-Find',
        summary:
          'Dijkstra intuition for weighted shortest paths and Union-Find with path compression for connectivity and component merging.',
        duration: '55-65 min',
        whyItMatters:
          'Graph interviews often ask either "what is the cheapest route?" or "are these things connected?" Dijkstra and Union-Find answer different questions cleanly.',
        sections: [
          {
            heading: 'Intuition: shortest path versus connectivity',
            body: block(`
Not every graph question is a shortest-path question. If the prompt asks for the cheapest route from a source, you need distances and path relaxation. If it asks whether items belong to the same connected group as edges are added, you need component tracking.

Dijkstra and Union-Find are complementary. Dijkstra explores a weighted graph from a start node and computes minimum costs when all edge weights are non-negative. Union-Find maintains sets under merge operations and answers whether two nodes currently share a component.
            `),
            bullets: [
              'Use BFS for unweighted shortest paths.',
              'Use Dijkstra for non-negative weighted shortest paths from a source.',
              'Use Union-Find for dynamic connectivity, cycle detection, and Kruskal-style MST work.'
            ],
            codeExample: {
              title: 'BFS versus Dijkstra on weighted edges',
              language: 'python',
              code: block(`
from collections import deque
import heapq


def unweighted_bfs_distance(graph, start):
    distances = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in distances:
                distances[neighbor] = distances[node] + 1
                queue.append(neighbor)
    return distances


def weighted_dijkstra_distance(graph, start):
    distances = {node: float("inf") for node in graph}
    distances[start] = 0
    heap = [(0, start)]

    while heap:
        distance, node = heapq.heappop(heap)
        if distance != distances[node]:
            continue
        for neighbor, weight in graph[node]:
            candidate = distance + weight
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))
    return distances


print(unweighted_bfs_distance({"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}, "A"))
print(weighted_dijkstra_distance({"A": [("B", 5), ("C", 1)], "B": [("D", 1)], "C": [("B", 1), ("D", 10)], "D": []}, "A"))
              `)
            }
          },
          {
            heading: 'Formal idea: Dijkstra finalizes the cheapest frontier',
            body: block(`
Dijkstra keeps the best distance discovered so far for each node. A min-heap stores frontier candidates ordered by distance. Each time the algorithm pops the smallest candidate, that candidate is final if the graph has no negative edges: every alternative route would have to start with an equal or larger frontier cost and then add non-negative weight.

Python implementations usually allow stale heap entries. When a better distance is discovered, we push a new pair instead of editing the old heap entry. On pop, if the distance no longer matches the current best distance, we skip it.
            `),
            bullets: [
              'Relaxing an edge means trying to improve `dist[neighbor]` through the current node.',
              'The heap makes choosing the next cheapest frontier O(log V).',
              'The common complexity with adjacency lists is O((V + E) log V).'
            ],
            codeExample: {
              title: 'Dijkstra with heapq and stale-entry skipping',
              language: 'python',
              code: block(`
import heapq


def dijkstra(graph, start):
    distances = {node: float("inf") for node in graph}
    distances[start] = 0
    heap = [(0, start)]

    while heap:
        distance, node = heapq.heappop(heap)
        if distance != distances[node]:
            continue

        for neighbor, weight in graph[node]:
            candidate = distance + weight
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))

    return distances


graph = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1)],
    "C": [("B", 2), ("D", 5)],
    "D": []
}
print(dijkstra(graph, "A"))
              `)
            }
          },
          {
            heading: 'Worked example: recover the actual cheapest path',
            body: block(`
Distances answer "how much does it cost?" but many prompts ask for the route too. Store a predecessor whenever relaxing an edge improves a distance. After Dijkstra finishes, walk from the target backward through predecessors to reconstruct the path.

This pattern also makes debugging easier. If the distance looks wrong, the predecessor chain shows which relaxation decisions produced it. If the target has infinite distance, no path was discovered from the start.
            `),
            bullets: [
              'Keep `previous[neighbor] = node` when a relaxation improves the best distance.',
              'Reconstruct only after the algorithm finishes or after the target is finalized.',
              'Return `(inf, [])` or a similar sentinel for unreachable targets.'
            ],
            codeExample: {
              title: 'Dijkstra path reconstruction',
              language: 'python',
              code: block(`
import heapq


def shortest_path(graph, start, target):
    distances = {node: float("inf") for node in graph}
    previous = {node: None for node in graph}
    distances[start] = 0
    heap = [(0, start)]

    while heap:
        distance, node = heapq.heappop(heap)
        if distance != distances[node]:
            continue
        if node == target:
            break
        for neighbor, weight in graph[node]:
            candidate = distance + weight
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate
                previous[neighbor] = node
                heapq.heappush(heap, (candidate, neighbor))

    if distances[target] == float("inf"):
        return float("inf"), []

    path = []
    node = target
    while node is not None:
        path.append(node)
        node = previous[node]
    return distances[target], list(reversed(path))


graph = {
    "A": [("B", 4), ("C", 1)],
    "B": [("D", 1), ("E", 7)],
    "C": [("B", 2), ("D", 5)],
    "D": [("E", 3)],
    "E": []
}
print(shortest_path(graph, "A", "E"))
              `)
            }
          },
          {
            heading: 'Union-Find: components under repeated merges',
            body: block(`
Union-Find represents each component as a tree of parent pointers. "find(x)" follows parent pointers to the representative root. "union(a, b)" finds both roots and attaches one root under the other when the components differ.

Two optimizations make it fast. Path compression rewrites parent pointers during find so future finds jump closer to the root. Union by rank or size attaches the smaller or shallower tree under the larger one. Together, operations are effectively constant time for interview-scale reasoning.
            `),
            bullets: [
              'Union-Find answers connectivity, not shortest path length.',
              'A failed union in an undirected graph means the edge connects nodes already in one component.',
              'Path compression is an amortized optimization across many operations.'
            ],
            codeExample: {
              title: 'Union-Find with path compression and rank',
              language: 'python',
              code: block(`
class UnionFind:
    def __init__(self, values):
        self.parent = {value: value for value in values}
        self.rank = {value: 0 for value in values}

    def find(self, value):
        if self.parent[value] != value:
            self.parent[value] = self.find(self.parent[value])
        return self.parent[value]

    def union(self, a, b):
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a == root_b:
            return False

        if self.rank[root_a] < self.rank[root_b]:
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        if self.rank[root_a] == self.rank[root_b]:
            self.rank[root_a] += 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)


uf = UnionFind(range(5))
for edge in [(0, 1), (1, 2), (3, 4)]:
    uf.union(*edge)
print(uf.connected(0, 2))
print(uf.connected(0, 4))
              `)
            }
          },
          {
            heading: 'Current variants: 0-1 BFS and practical Union-Find uses',
            body: block(`
When every edge weight is 0 or 1, Dijkstra still works, but a deque is enough: appendleft for weight 0 and append for weight 1. That 0-1 BFS pattern shows up in grid problems with cheap/expensive moves and is a strong follow-up after ordinary BFS.

Union-Find interview uses are broader than Kruskal. Accounts-merge, redundant connection, and "number of provinces after unions" are more common phone/onsite prompts than building an MST from scratch. Keep the story practical: find with path compression, union by rank/size, and answer connectivity queries in nearly constant time. Mention inverse Ackermann only as "effectively constant for interview sizes," not as a chalkboard proof.
            `),
            bullets: [
              '0-1 BFS: deque, weight 0 to the front, weight 1 to the back.',
              'Union-Find shines for dynamic connectivity, cycle detection on undirected edges, and merge-style grouping.',
              'Prefer practical component problems over proving MST theorems unless the prompt asks for a minimum spanning structure.'
            ],
            codeExample: {
              title: '0-1 BFS distances and Union-Find components',
              language: 'python',
              code: block(`
from collections import deque


def zero_one_bfs(graph, start):
    distances = {start: 0}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor, weight in graph[node]:
            candidate = distances[node] + weight
            if neighbor not in distances or candidate < distances[neighbor]:
                distances[neighbor] = candidate
                if weight == 0:
                    queue.appendleft(neighbor)
                else:
                    queue.append(neighbor)
    return distances


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.components -= 1
        return True


graph = {
    0: [(1, 0), (2, 1)],
    1: [(3, 1)],
    2: [(3, 0)],
    3: []
}
print(zero_one_bfs(graph, 0))
uf = UnionFind(4)
for a, b in [(0, 1), (1, 2), (2, 3)]:
    uf.union(a, b)
print(uf.components, uf.find(0) == uf.find(3))
              `)
            }
          },
          {
            heading: 'Common mistakes: choose the question you are answering',
            body: block(`
The most important mistake is using the right-looking graph tool for the wrong question. Union-Find can tell you that two cities are connected after roads are added, but it cannot tell you the shortest route between them. Dijkstra can compute cheapest routes, but it is overkill for plain unweighted distance where BFS is simpler and faster.

Edge weights also matter. Dijkstra requires non-negative weights. If negative edges exist, the greedy finalization proof breaks and you need a different algorithm such as Bellman-Ford. If all weights are identical, ignore the weights and use BFS.
            `),
            bullets: [
              'Negative weights invalidate Dijkstra.',
              'Union-Find does not preserve path shape or path cost.',
              'For MST-style problems, sort edges by weight and union components.'
            ],
            codeExample: {
              title: 'Kruskal minimum spanning tree using Union-Find',
              language: 'python',
              code: block(`
class UnionFind:
    def __init__(self, values):
        self.parent = {value: value for value in values}
        self.size = {value: 1 for value in values}

    def find(self, value):
        while self.parent[value] != value:
            self.parent[value] = self.parent[self.parent[value]]
            value = self.parent[value]
        return value

    def union(self, a, b):
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a == root_b:
            return False
        if self.size[root_a] < self.size[root_b]:
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        self.size[root_a] += self.size[root_b]
        return True


def kruskal(nodes, edges):
    uf = UnionFind(nodes)
    total = 0
    chosen = []
    for weight, a, b in sorted(edges):
        if uf.union(a, b):
            total += weight
            chosen.append((a, b, weight))
    return total, chosen


nodes = ["A", "B", "C", "D"]
edges = [(1, "A", "B"), (4, "A", "C"), (2, "B", "C"), (3, "B", "D"), (5, "C", "D")]
print(kruskal(nodes, edges))
              `)
            }
          }
        ],
        checklist: [
          'Can explain why Dijkstra requires non-negative weights.',
          'Can implement Dijkstra with `heapq`, relaxation, and stale-entry skipping.',
          'Can implement Union-Find with path compression and union by rank or size.',
          'Can choose connectivity tracking versus shortest-path search.'
        ],
        pitfalls: [
          'Using Union-Find when path length or path cost matters.',
          'Using Dijkstra on graphs with negative edge weights.',
          'Forgetting to ignore stale heap entries in a Python Dijkstra implementation.',
          'Using Dijkstra for unweighted graphs where BFS is enough.'
        ],
        interviewPrompts: [
          'Why is BFS enough for unweighted shortest path but not weighted shortest path?',
          'Teach back path compression and why it speeds future finds.',
          'How would you detect whether adding an undirected edge creates a cycle?',
          'How does Dijkstra reconstruct the actual shortest path?'
        ],
        exercises: [
          {
            id: 'network-delay-dijkstra',
            title: 'Compute network delay time',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Given directed weighted edges `(source, target, time)`, return the time for a signal to reach every node from a start node, or -1 if any node is unreachable.',
            starterCode: block(`
import heapq


def network_delay_time(times, n, start):
    # TODO: build an adjacency list for nodes 1..n.
    # TODO: run Dijkstra from start.
    # TODO: return the maximum finite distance, or -1 if a node is unreachable.
    return -1


times = [(2, 1, 1), (2, 3, 1), (3, 4, 1)]
print(network_delay_time(times, 4, 2))
print(network_delay_time(times, 4, 1))
            `),
            solution: block(`
import heapq


def network_delay_time(times, n, start):
    graph = {node: [] for node in range(1, n + 1)}
    for source, target, time in times:
        graph[source].append((target, time))

    distances = {node: float("inf") for node in graph}
    distances[start] = 0
    heap = [(0, start)]

    while heap:
        distance, node = heapq.heappop(heap)
        if distance != distances[node]:
            continue
        for neighbor, weight in graph[node]:
            candidate = distance + weight
            if candidate < distances[neighbor]:
                distances[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))

    answer = max(distances.values())
    return -1 if answer == float("inf") else answer


times = [(2, 1, 1), (2, 3, 1), (3, 4, 1)]
print(network_delay_time(times, 4, 2))
print(network_delay_time(times, 4, 1))
            `),
            hints: [
              'This is a single-source shortest-path problem with non-negative weights.',
              'Initialize every node from 1 through n, even if it has no outgoing edges.',
              'The delay is the farthest shortest distance from the start.'
            ],
            expectedOutput: '2, then -1.'
          },
          {
            id: 'count-components-union-find',
            title: 'Count connected components with Union-Find',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Given n nodes labeled 0..n-1 and undirected edges, return the number of connected components.',
            starterCode: block(`
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.count = n

    def find(self, value):
        # TODO: add path compression.
        return value

    def union(self, a, b):
        # TODO: merge roots and decrement count only when roots differ.
        pass


def count_components(n, edges):
    uf = UnionFind(n)
    for a, b in edges:
        uf.union(a, b)
    return uf.count


print(count_components(5, [(0, 1), (1, 2), (3, 4)]))
print(count_components(5, []))
            `),
            solution: block(`
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.count = n

    def find(self, value):
        if self.parent[value] != value:
            self.parent[value] = self.find(self.parent[value])
        return self.parent[value]

    def union(self, a, b):
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a == root_b:
            return False
        if self.rank[root_a] < self.rank[root_b]:
            root_a, root_b = root_b, root_a
        self.parent[root_b] = root_a
        if self.rank[root_a] == self.rank[root_b]:
            self.rank[root_a] += 1
        self.count -= 1
        return True


def count_components(n, edges):
    uf = UnionFind(n)
    for a, b in edges:
        uf.union(a, b)
    return uf.count


print(count_components(5, [(0, 1), (1, 2), (3, 4)]))
print(count_components(5, []))
            `),
            hints: [
              'Every node starts as its own component.',
              'A successful union reduces the component count by one.',
              'If roots are already equal, do not decrement the count.'
            ],
            expectedOutput: '2, then 5.'
          },
          {
            id: 'path-algorithm-selection',
            title: 'Choose BFS, Dijkstra, or Union-Find',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Given three prompts — unweighted reachability, non-negative weighted shortest path, and dynamic connectivity with many union queries — explain which algorithm fits each, what state you maintain, and the complexity you would claim.',
            hints: [
              'Unweighted shortest path is BFS layers, not Dijkstra.',
              'Dijkstra needs a priority queue and non-negative weights.',
              'Union-Find answers connectivity without reconstructing explicit paths.'
            ]
          },
        ],
        diagram: null,
        related: ['trees-graphs-mental-models', 'dynamic-programming-cookbook']
      },
      {
        slug: 'dynamic-programming-cookbook',
        title: 'Dynamic programming cookbook',
        summary:
          'A pattern catalog for knapsack, LIS, grid paths, memoization, tabulation, and state design in Python.',
        duration: '60-70 min',
        whyItMatters:
          'Dynamic programming still appears in Google-heavy and harder onsite loops. Current interviews reward a spoken state sentence first — Climbing Stairs / House Robber style — before knapsack or LIS machinery.',
        sections: [
          {
            heading: 'Intuition: cache repeated questions',
            body: block(`
Dynamic programming is useful when a recursive search asks the same subquestion many times. Instead of recomputing that subquestion, store its answer and reuse it. The hard part is not the cache; the hard part is choosing a state that contains exactly the information needed for future decisions.

Lead with interview-shaped examples before abstract Fibonacci. Climbing Stairs is "ways(i) = ways(i-1) + ways(i-2)". House Robber is "best(i) = max(best(i-1), best(i-2) + nums[i])". A good DP explanation still has four parts: state, transition, base case, and answer. Say them aloud before coding.
            `),
            bullets: [
              'State names the subproblem in one sentence.',
              'Transition connects the current state to smaller states.',
              'Base cases provide known answers that stop recursion or fill the table.'
            ],
            codeExample: {
              title: 'Climbing Stairs and House Robber as first DP stories',
              language: 'python',
              code: block(`
from functools import lru_cache


def climb_stairs(n):
    @lru_cache(maxsize=None)
    def ways(i):
        if i <= 2:
            return i
        return ways(i - 1) + ways(i - 2)

    return ways(n)


def house_robber(nums):
    prev2 = prev1 = 0
    for value in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + value)
    return prev1


print(climb_stairs(5), climb_stairs(10))
print(house_robber([2, 7, 9, 3, 1]), house_robber([1, 2, 3, 1]))
              `)
            }
          },
          {
            heading: 'Formal idea: memoization starts from the question',
            body: block(`
Top-down memoization keeps the recursive problem statement close to the prompt. For 0/1 knapsack, each item can be skipped or taken once. The state is "(index, remaining_capacity)". The transition takes the max of skipping the item or taking it if it fits.

The complexity is the number of reachable states times the work per state. There are n * capacity states and O(1) transition work at each state, so the time and cache space are O(n * capacity). This is pseudo-polynomial because capacity is a numeric value, not just the length of the input list.
            `),
            bullets: [
              'Memoization is often the fastest way to discover and test a recurrence.',
              'Cache keys must include all information that affects future choices.',
              'Recursive depth can be a limitation in Python for very large inputs.'
            ],
            codeExample: {
              title: '0/1 knapsack with memoization',
              language: 'python',
              code: block(`
from functools import lru_cache


def knapsack_memo(weights, values, capacity):
    @lru_cache(maxsize=None)
    def best(index, remaining):
        if index == len(weights) or remaining == 0:
            return 0

        skip = best(index + 1, remaining)
        take = 0
        if weights[index] <= remaining:
            take = values[index] + best(index + 1, remaining - weights[index])
        return max(skip, take)

    return best(0, capacity)


print(knapsack_memo([2, 3, 4, 5], [3, 4, 5, 8], 8))
              `)
            }
          },
          {
            heading: 'Tabulation: make fill order explicit',
            body: block(`
Bottom-up tabulation fills a table so every dependency is ready before it is used. In knapsack, row i can represent considering the first i items, and column cap can represent capacity cap. Each cell chooses between skipping the current item and taking it.

Tabulation is useful when recursion overhead is high or when you want to compress memory. Once the full 2D table is correct, you can often reduce it to one dimension by iterating capacities in reverse so each item is only used once.
            `),
            bullets: [
              'Fill order follows dependency direction.',
              '2D tables are easier to verify before optimizing space.',
              'Reverse capacity iteration prevents reusing the same 0/1 item multiple times.'
            ],
            codeExample: {
              title: '0/1 knapsack with tabulation and space compression',
              language: 'python',
              code: block(`
def knapsack_tab(weights, values, capacity):
    dp = [0] * (capacity + 1)

    for weight, value in zip(weights, values):
        for cap in range(capacity, weight - 1, -1):
            dp[cap] = max(dp[cap], value + dp[cap - weight])

    return dp[capacity]


weights = [2, 3, 4, 5]
values = [3, 4, 5, 8]
print(knapsack_tab(weights, values, 8))
              `)
            }
          },
          {
            heading: 'Worked examples: grids and subsequences',
            body: block(`
Grid DP states usually use coordinates. For minimum path sum moving only down or right, "dp[r][c]" is the cheapest cost to reach cell "(r, c)". Its predecessors are the top cell and left cell, so the table fills from top-left toward bottom-right.

Subsequence DP states usually talk about positions. For LIS, "dp[i]" can mean the length of the best increasing subsequence ending exactly at index i. Every earlier index j with values[j] < values[i] can extend into i. That gives an O(n^2) solution and a stepping stone to the O(n log n) patience-sorting version.
            `),
            bullets: [
              'Grid DP often reads from top and left or from bottom and right.',
              'Subsequence DP often compares current position with earlier positions.',
              'The answer may be a table cell, a row/column max, or the max over all states.'
            ],
            codeExample: {
              title: 'Grid minimum path sum',
              language: 'python',
              code: block(`
def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]

    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[r][c]
            else:
                from_top = dp[r - 1][c] if r > 0 else float("inf")
                from_left = dp[r][c - 1] if c > 0 else float("inf")
                dp[r][c] = grid[r][c] + min(from_top, from_left)

    return dp[-1][-1]


print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
              `)
            }
          },
          {
            heading: 'Common mistakes: optimize only after the recurrence is true',
            body: block(`
Many DP bugs are state bugs. If the state leaves out information, different situations collapse into one cache entry and the answer becomes wrong. If the state includes unnecessary information, the table becomes too large. State design is a balance: enough information to decide the future, no extra history that no longer matters.

Another mistake is compressing space before understanding direction. In 0/1 knapsack, iterating capacity forward would reuse the same item multiple times. In unbounded knapsack, forward iteration may be exactly what you want. The loop direction is part of the recurrence, not a cosmetic detail.
            `),
            bullets: [
              'Write the state sentence before writing code.',
              'Check base cases on empty input and smallest non-empty input.',
              'Use the uncompressed table first when the fill order is not obvious.'
            ],
            codeExample: {
              title: 'LIS in O(n^2) and O(n log n)',
              language: 'python',
              code: block(`
from bisect import bisect_left


def lis_quadratic(values):
    if not values:
        return 0
    dp = [1] * len(values)
    for i in range(len(values)):
        for j in range(i):
            if values[j] < values[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)


def lis_patience(values):
    tails = []
    for value in values:
        index = bisect_left(tails, value)
        if index == len(tails):
            tails.append(value)
        else:
            tails[index] = value
    return len(tails)


data = [10, 9, 2, 5, 3, 7, 101, 18]
print(lis_quadratic(data))
print(lis_patience(data))
              `)
            }
          }
        ],
        checklist: [
          'Can state DP state, transition, base cases, and answer extraction.',
          'Can choose memoization for recurrence discovery and tabulation for fill-order control.',
          'Can recognize knapsack, LIS, grid-path, and sequence-alignment families.',
          'Can explain time as number of states times work per state.'
        ],
        pitfalls: [
          'Adding unnecessary dimensions to the state.',
          'Leaving necessary future-affecting information out of the state.',
          'Filling a table before proving the recurrence.',
          'Optimizing space before the uncompressed version is correct.'
        ],
        interviewPrompts: [
          'Teach back the difference between memoization and tabulation.',
          'How do you decide what belongs in a DP state?',
          'Why is LIS a dynamic-programming problem, and what does each `dp[i]` mean?',
          'Why does 0/1 knapsack iterate compressed capacity backward?'
        ],
        exercises: [
          {
            id: 'coin-change-min-coins',
            title: 'Minimum coins for an amount',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Return the minimum number of coins needed to make an amount, or -1 when it is impossible. Coins may be reused.',
            starterCode: block(`
def coin_change(coins, amount):
    # TODO: define dp[x] as the fewest coins needed to make amount x.
    # TODO: initialize dp[0] = 0 and fill amounts from 1..amount.
    return -1


print(coin_change([1, 2, 5], 11))
print(coin_change([2], 3))
            `),
            solution: block(`
def coin_change(coins, amount):
    dp = [float("inf")] * (amount + 1)
    dp[0] = 0

    for current in range(1, amount + 1):
        for coin in coins:
            if coin <= current:
                dp[current] = min(dp[current], 1 + dp[current - coin])

    return -1 if dp[amount] == float("inf") else dp[amount]


print(coin_change([1, 2, 5], 11))
print(coin_change([2], 3))
            `),
            hints: [
              'This is unbounded: each coin can be reused.',
              'Use infinity for amounts that are not reachable yet.',
              'For each amount, try every coin that could be the last coin.'
            ],
            expectedOutput: '3, then -1.'
          },
          {
            id: 'longest-common-subsequence',
            title: 'Longest common subsequence length',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Return the length of the longest sequence that appears in both strings in the same relative order, not necessarily contiguously.',
            starterCode: block(`
def lcs_length(a, b):
    # TODO: create a (len(a)+1) by (len(b)+1) table.
    # TODO: if characters match, extend the diagonal.
    # TODO: otherwise carry the best from top or left.
    return 0


print(lcs_length("abcde", "ace"))
print(lcs_length("abc", "def"))
            `),
            solution: block(`
def lcs_length(a, b):
    rows, cols = len(a) + 1, len(b) + 1
    dp = [[0] * cols for _ in range(rows)]

    for i in range(1, rows):
        for j in range(1, cols):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[-1][-1]


print(lcs_length("abcde", "ace"))
print(lcs_length("abc", "def"))
            `),
            hints: [
              '`dp[i][j]` can mean the LCS length for `a[:i]` and `b[:j]`.',
              'Matching characters consume both strings.',
              'Non-matching characters choose the better result from dropping one side.'
            ],
            expectedOutput: '3, then 0.'
          },
          {
            id: 'dp-state-design-drill',
            title: 'Design a DP state before coding',
            difficulty: 'advanced',
            type: 'design',
            description:
              'For a knapsack-like prompt and an LIS-like prompt, write the state definition, transition, base cases, answer extraction, and time/space bounds in plain language. Then say what you would memoize first versus tabulate first and why.',
            hints: [
              'State must capture every future-affecting decision.',
              'Time is usually number of states times work per transition.',
              'Memoization helps discover the recurrence; tabulation helps control fill order and space.'
            ]
          },
        ],
        diagram: null,
        related: ['sorting-and-divide-and-conquer', 'shortest-paths-and-union-find']
      }
    ]
  }
];
