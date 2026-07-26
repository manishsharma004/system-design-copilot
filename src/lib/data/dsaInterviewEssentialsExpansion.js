/**
 * Companion DSA interview essentials expansion module.
 *
 * These lessons focus on high-frequency implementation and design gaps that
 * still matter in 2025-2026 interviews, with runnable stdlib-only Python.
 */
const block = (value) => value.trim();

export const rawDsaInterviewEssentialsModules = [
  {
    slug: 'dsa-interview-essentials-lab',
    title: 'DSA interview essentials lab',
    summary:
      'Current 2025-2026 DSA prep is less about textbook-only theory and more about universal high-frequency patterns across Amazon, Google, Meta, and Microsoft screens: finishing OAs correct-first, narrating invariants in phone rounds, and defending follow-ups onsite. Company profiles differ - Amazon rewards breadth, Google often pushes predicate-search and graph depth, and Meta favors hash/window/design fluency - but this lab teaches the shared high-frequency gaps: tries, monotonic stacks/deques, bits, string hashing, and LRU-style design.',
    objectives: [
      'Implement and defend tries and prefix trees for autocomplete, prefix lookup, and board-search pruning',
      'Use monotonic stacks and deques for next-greater, histogram, temperature, and sliding-window maximum prompts',
      'Build fluency with bit tricks, string hashing, and LRU-style cache design tradeoffs'
    ],
    lessons: [
      {
        slug: 'tries-and-prefix-decision-trees',
        title: 'Tries and prefix decision trees',
        summary:
          'Prefix trees for autocomplete, Word Search II style DFS-on-trie, shared-prefix pruning, and design tradeoffs against prefix sets or sorted lists.',
        duration: '50-60 min',
        whyItMatters:
          'String-heavy rounds at Meta, Amazon, Microsoft, and Google still reward candidates who can move beyond repeated hashing. In an OA, a trie can be the difference between finishing correct-first and timing out on shared prefixes; in a phone screen, the interviewer wants to hear the prefix invariant; onsite follow-ups often ask when the trie is too much structure.',
        sections: [
          {
            heading: 'A trie turns shared prefixes into shared work',
            body: block(`
A trie stores words by characters along root-to-leaf paths. When many words share a prefix, the prefix is represented once instead of being rechecked independently for every word. That is the core reason tries beat repeated hashing in autocomplete, dictionary prefix checks, and board-search pruning. Hash sets can tell you whether a full word exists, but they do not naturally expose "all words that continue from this prefix" without building additional prefix data.

The interview invariant is concrete: after reading characters s[:i], the current node represents exactly that prefix if the path exists. If the next character edge is absent, every word with that prefix is impossible and the search branch can stop. This sounds simple, but saying it clearly separates a trie answer from a bag of nested dictionaries.
            `),
            bullets: [
              'Each node represents one prefix, not one full word.',
              'Missing child edge proves every word under that prefix is absent.',
              'End markers distinguish a complete word from a prefix of longer words.'
            ],
            codeExample: {
              title: 'Insert, search, and startsWith with dict children',
              language: 'python',
              code: block(`
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            node = node.children.setdefault(char, TrieNode())
        node.is_word = True

    def _walk(self, text):
        node = self.root
        for char in text:
            if char not in node.children:
                return None
            node = node.children[char]
        return node

    def search(self, word):
        node = self._walk(word)
        return bool(node and node.is_word)

    def starts_with(self, prefix):
        return self._walk(prefix) is not None


trie = Trie()
for word in ["tea", "team", "ten", "to"]:
    trie.insert(word)
print(trie.search("tea"))
print(trie.search("te"))
print(trie.starts_with("te"))
              `)
            }
          },
          {
            heading: 'Nested dictionaries are enough in Python interviews',
            body: block(`
You do not need a heavy class hierarchy to pass most trie interviews in Python. A nested dictionary with a sentinel key is compact, fast enough, and easy to write under pressure. The tradeoff is readability: a class with children and is_word fields is more explicit, while nested dicts reduce boilerplate. Choose the form you can explain and code without mistakes.

In 2025-2026 interviews, especially on shared editors, interviewers care that your structure preserves the prefix invariant and handles end-of-word correctly. The exact object model matters less than avoiding two common bugs: forgetting that a prefix is not automatically a word, and using a mutable default node incorrectly. Standard dictionaries and clear sentinel use are enough.
            `),
            bullets: [
              'Use a sentinel such as "#" only for complete words.',
              'Prefer setdefault for compact insertion, but keep it readable.',
              'Avoid default mutable arguments when constructing trie nodes.'
            ],
            codeExample: {
              title: 'Nested-dict trie with a sentinel',
              language: 'python',
              code: block(`
END = "#"


def build_trie(words):
    root = {}
    for word in words:
        node = root
        for char in word:
            node = node.setdefault(char, {})
        node[END] = True
    return root


def contains(root, word):
    node = root
    for char in word:
        if char not in node:
            return False
        node = node[char]
    return END in node


trie = build_trie(["app", "apple", "apply", "bat"])
print(contains(trie, "app"))
print(contains(trie, "appl"))
print(contains(trie, "bat"))
              `)
            }
          },
          {
            heading: 'Autocomplete is prefix walk plus bounded collection',
            body: block(`
Autocomplete asks two separate questions. First, can you walk to the node for the query prefix? Second, how do you collect suggestions below that node? A trie answers the first question in O(length of prefix). The second question depends on product constraints: return all words, return the first k lexical suggestions, return ranked suggestions, or return suggestions updated by popularity.

For a coding interview, a DFS from the prefix node is often enough. For a design follow-up, mention that production autocomplete often stores top-k suggestions or scores at nodes to avoid traversing a huge subtree on every request. That does not change the base trie invariant; it adds cached ranking metadata to meet latency goals.
            `),
            bullets: [
              'Separate locating the prefix from collecting completions.',
              'Plain DFS returns every completion under the prefix node.',
              'Top-k autocomplete may cache ranked suggestions per node.'
            ],
            codeExample: {
              title: 'Collect autocomplete suggestions',
              language: 'python',
              code: block(`
END = "#"


def build_trie(words):
    root = {}
    for word in words:
        node = root
        for char in word:
            node = node.setdefault(char, {})
        node[END] = word
    return root


def autocomplete(root, prefix, limit=5):
    node = root
    for char in prefix:
        if char not in node:
            return []
        node = node[char]

    results = []

    def dfs(current):
        if len(results) == limit:
            return
        if END in current:
            results.append(current[END])
        for char in sorted(key for key in current if key != END):
            dfs(current[char])

    dfs(node)
    return results


root = build_trie(["car", "card", "care", "cat", "dog"])
print(autocomplete(root, "ca", 3))
print(autocomplete(root, "do", 3))
              `)
            }
          },
          {
            heading: 'Word Search II is DFS on the board and the trie',
            body: block(`
Word Search II style prompts are where tries visibly save work. A brute-force approach starts a DFS for every word from every cell or checks every path against a word set after building strings. A trie-based approach walks the board and trie together. The moment a board path no longer exists as a trie prefix, the whole branch is pruned.

The mutation invariant matters. Mark the board cell as visited before exploring neighbors, then restore it before returning so sibling branches see the original board. If the trie node contains a word, record it. Removing or nulling the word after recording prevents duplicate output without changing prefix edges needed by longer words.
            `),
            bullets: [
              'DFS state is row, column, and current trie node.',
              'Board marking prevents reusing the same cell in one path.',
              'Prefix failure prunes all longer paths below that branch.'
            ],
            codeExample: {
              title: 'Board DFS with trie pruning',
              language: 'python',
              code: block(`
END = "#"


def build_trie(words):
    root = {}
    for word in words:
        node = root
        for char in word:
            node = node.setdefault(char, {})
        node[END] = word
    return root


def find_words(board, words):
    root = build_trie(words)
    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, node):
        char = board[r][c]
        if char not in node:
            return
        next_node = node[char]
        word = next_node.get(END)
        if word is not None:
            found.append(word)
            next_node[END] = None

        board[r][c] = "*"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "*":
                dfs(nr, nc, next_node)
        board[r][c] = char

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return sorted(found)


grid = [list("oath"), list("peaE".lower()), list("eatn"), list("rain")]
print(find_words(grid, ["oath", "pea", "eat", "rain", "tan"]))
              `)
            }
          },
          {
            heading: 'Trie versus prefix set versus sorted list',
            body: block(`
The design exercise is not always "use a trie." A hash set of all prefixes can prune DFS too, but it may store every prefix as a separate string and still needs a word set for terminal detection. A sorted list plus binary search can answer prefix range queries efficiently for static dictionaries, especially when memory must stay low and updates are rare. A trie shines when prefixes are shared, updates are incremental, or you need to continue traversal character by character.

Interviewers often ask this comparison after the code works. Give a constraint-driven answer. If the dictionary is static and autocomplete only returns lexicographic ranges, sorted words with binary search can be excellent. If the workload is board DFS or per-keystroke traversal with many shared prefixes, a trie avoids rebuilding prefix strings and discarding the same failed prefixes repeatedly.
            `),
            bullets: [
              'Trie: strong for shared prefixes, incremental traversal, and prefix pruning.',
              'Prefix hash set: simple pruning but can duplicate prefix storage.',
              'Sorted list: good for static dictionaries and binary-search prefix ranges.'
            ],
            codeExample: {
              title: 'Static prefix lookup with binary search',
              language: 'python',
              code: block(`
from bisect import bisect_left


def has_prefix(sorted_words, prefix):
    index = bisect_left(sorted_words, prefix)
    return index < len(sorted_words) and sorted_words[index].startswith(prefix)


words = sorted(["application", "apply", "banana", "band", "cat"])
print(has_prefix(words, "app"))
print(has_prefix(words, "ban"))
print(has_prefix(words, "can"))
              `)
            }
          },
          {
            heading: 'How to narrate trie tradeoffs under follow-ups',
            body: block(`
A strong trie answer ends with complexity and boundaries. Insertion and exact lookup are O(length of word). Prefix lookup is O(length of prefix). Space is proportional to the number of trie nodes, which is at most the total characters inserted but often less when prefixes are shared. DFS collection adds the number of visited output nodes or board paths that survive prefix pruning.

Under follow-ups, do not oversell the trie. Unicode normalization, case folding, memory overhead per dictionary node, ranked autocomplete, deletion cleanup, and concurrent updates are real product concerns. In a single-threaded interview, you can state the simplified assumptions and then explain what metadata or locking would be added if the workload moved closer to production.
            `),
            bullets: [
              'State length-based complexity instead of only saying O(1) or O(n).',
              'Mention memory overhead from many dictionary nodes.',
              'Tie follow-up answers to workload: static, dynamic, ranked, or board-search.'
            ]
          }
        ],
        checklist: [
          'Can implement insert, exact search, and prefix search with dict children or nested dictionaries.',
          'Can explain why a missing trie edge prunes every longer word with that prefix.',
          'Can write board DFS that marks and restores cells while walking trie nodes.',
          'Can compare trie, prefix hash set, and sorted list plus binary search from constraints.'
        ],
        pitfalls: [
          'Treating every prefix as a complete word because the path exists.',
          'Forgetting to restore a marked board cell after DFS returns.',
          'Building strings at every DFS step when the trie node already represents the prefix.',
          'Claiming tries are always better than sorted lists for static prefix queries.'
        ],
        interviewPrompts: [
          'Why can a trie beat repeated hashing when many words share prefixes?',
          'How would you prevent duplicate words in Word Search II output?',
          'When would a sorted list with binary search be preferable to a trie?',
          'What metadata would you add for top-k ranked autocomplete suggestions?'
        ],
        exercises: [
          {
            id: 'implement-prefix-trie',
            title: 'Implement a prefix trie',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Build a trie with insert, search, and starts_with. A prefix path alone should not count as a full word.',
            starterCode: block(`
class Trie:
    def __init__(self):
        # TODO: create a root node.
        pass

    def insert(self, word):
        # TODO: create child nodes for every character and mark the final node.
        pass

    def search(self, word):
        # TODO: return True only when the full word was inserted.
        return False

    def starts_with(self, prefix):
        # TODO: return True when the prefix path exists.
        return False


trie = Trie()
for word in ["interview", "internet", "interval"]:
    trie.insert(word)
print(trie.search("internet"))
print(trie.search("inter"))
print(trie.starts_with("inter"))
            `),
            solution: block(`
class Trie:
    def __init__(self):
        self.root = {"word": False, "children": {}}

    def insert(self, word):
        node = self.root
        for char in word:
            children = node["children"]
            if char not in children:
                children[char] = {"word": False, "children": {}}
            node = children[char]
        node["word"] = True

    def _walk(self, text):
        node = self.root
        for char in text:
            children = node["children"]
            if char not in children:
                return None
            node = children[char]
        return node

    def search(self, word):
        node = self._walk(word)
        return bool(node and node["word"])

    def starts_with(self, prefix):
        return self._walk(prefix) is not None


trie = Trie()
for word in ["interview", "internet", "interval"]:
    trie.insert(word)
print(trie.search("internet"))
print(trie.search("inter"))
print(trie.starts_with("inter"))
            `),
            hints: [
              'Store children separately from the end-of-word marker.',
              'A helper that walks a string can serve both search and starts_with.',
              'Only insert should mark the final node as a complete word.'
            ],
            expectedOutput: 'True, then False, then True.'
          },
          {
            id: 'word-search-trie-prune',
            title: 'Find board words with trie pruning',
            difficulty: 'advanced',
            type: 'coding',
            description:
              'Return all dictionary words that can be formed by adjacent board cells without reusing a cell in one word.',
            starterCode: block(`
def find_words(board, words):
    # TODO: build a trie containing each word.
    # TODO: DFS from every board cell while walking trie nodes.
    # TODO: mark and restore cells so sibling paths are independent.
    return []


board = [list("abce"), list("sfcs"), list("adee")]
print(sorted(find_words(board, ["see", "abcced", "abcb", "ade"])))
            `),
            solution: block(`
END = "#"


def find_words(board, words):
    root = {}
    for word in words:
        node = root
        for char in word:
            node = node.setdefault(char, {})
        node[END] = word

    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, node):
        char = board[r][c]
        if char not in node:
            return
        next_node = node[char]
        if END in next_node:
            found.append(next_node.pop(END))

        board[r][c] = "*"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "*":
                dfs(nr, nc, next_node)
        board[r][c] = char

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root)
    return found


board = [list("abce"), list("sfcs"), list("adee")]
print(sorted(find_words(board, ["see", "abcced", "abcb", "ade"])))
            `),
            hints: [
              'The trie node tells you whether the current board prefix can still lead to a word.',
              'Mark the current cell before visiting neighbors and restore it afterward.',
              'Remove a found word marker to avoid duplicate output from another path.'
            ],
            expectedOutput: "['abcced', 'ade', 'see']."
          },
          {
            id: 'trie-prefix-design-review',
            title: 'Choose trie, prefix set, or sorted words',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Design a prefix lookup layer for a product with static dictionaries for some languages, dynamic user dictionaries for others, and a board-search feature.',
            hints: [
              'Separate static prefix range queries from dynamic updates.',
              'Explain the storage duplication of a prefix hash set.',
              'Use the board-search workload to justify trie traversal and pruning.'
            ]
          }
        ],
        diagram: null,
        related: ['monotonic-stacks-and-next-greater', 'bits-strings-hashing-and-lru-design']
      },
      {
        slug: 'monotonic-stacks-and-next-greater',
        title: 'Monotonic stacks and next greater',
        summary:
          'Next greater element, daily temperatures, largest rectangle in histogram, and sliding-window maximum with explicit candidate-order invariants.',
        duration: '50-60 min',
        whyItMatters:
          'Monotonic stacks and deques are a 2024-2026 high-frequency gap: many candidates know ordinary stacks but miss the ordered-candidate invariant. OAs reward the linear template because it finishes under time; phone screens reward clear narration of why each popped item is obsolete; onsite follow-ups often ask whether a heap, deque, or stack is the right streaming structure.',
        sections: [
          {
            heading: 'Monotonic stacks store candidates, not history',
            body: block(`
An ordinary stack remembers the latest unresolved items. A monotonic stack remembers only unresolved items that can still become answers. The stack maintains an order, such as decreasing values for next greater element. When a new value is greater than the top, that top has found its answer and can be popped. If the new value is also greater than the next top, it resolves that item too.

The invariant is the interview answer: after processing index i, the stack contains indices whose next greater element has not yet appeared, and their values are in decreasing order from bottom to top. Any smaller value popped by the current value can never need a later greater value because the current value is already the nearest greater value to its right.
            `),
            bullets: [
              'Store indices when distance or positions matter.',
              'Pop when the incoming value proves the top candidate is resolved or obsolete.',
              'The stack order is the proof that total pops are linear.'
            ],
            codeExample: {
              title: 'Next greater value to the right',
              language: 'python',
              code: block(`
def next_greater(values):
    answer = [-1] * len(values)
    stack = []
    for i, value in enumerate(values):
        while stack and values[stack[-1]] < value:
            answer[stack.pop()] = value
        stack.append(i)
    return answer


print(next_greater([2, 1, 5, 3, 4]))
print(next_greater([6, 4, 2]))
              `)
            }
          },
          {
            heading: 'Daily temperatures is next greater distance',
            body: block(`
Daily Temperatures looks different because the answer is days waited, not the next warmer value. The data-structure invariant is the same. Keep indices of days that have not yet found a warmer future day. When today's temperature is warmer than the temperature at the stack top, today's index resolves that earlier day and the difference of indices is the wait.

This is a useful phone-screen prompt because it exposes whether you understand why indices matter. Storing only temperatures loses the distance needed for the answer and handles duplicates awkwardly. Storing indices lets you compare values and compute distances from the same candidate stack.
            `),
            bullets: [
              'Use indices because the output is a distance.',
              'Equal temperatures do not resolve a warmer-day prompt.',
              'Each day is pushed once and popped once.'
            ],
            codeExample: {
              title: 'Wait until a warmer day',
              language: 'python',
              code: block(`
def daily_temperatures(temperatures):
    waits = [0] * len(temperatures)
    stack = []
    for i, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            prev = stack.pop()
            waits[prev] = i - prev
        stack.append(i)
    return waits


print(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))
              `)
            }
          },
          {
            heading: 'Largest rectangle uses nearest smaller boundaries',
            body: block(`
Largest rectangle in a histogram is often the prompt that separates memorized stack use from invariant-driven stack use. For each bar, the maximal rectangle where that bar is the limiting height extends until a smaller bar appears on the left and right. A monotonic increasing stack keeps bars whose right smaller boundary has not yet been seen.

When the current height is lower than the stack top, the popped bar's right boundary is the current index, and its left boundary is the new stack top. The width is the open interval between those boundaries. Appending a sentinel zero height forces every remaining bar to pop, which avoids a second cleanup loop and makes termination explicit.
            `),
            bullets: [
              'Increasing stack means popped bars have just found their right smaller boundary.',
              'The new top after a pop is the left smaller boundary.',
              'A sentinel height can flush remaining candidates cleanly.'
            ],
            codeExample: {
              title: 'Largest rectangle in histogram',
              language: 'python',
              code: block(`
def largest_rectangle_area(heights):
    stack = []
    best = 0
    for i, height in enumerate(heights + [0]):
        while stack and heights[stack[-1]] > height:
            h = heights[stack.pop()]
            left_smaller = stack[-1] if stack else -1
            width = i - left_smaller - 1
            best = max(best, h * width)
        stack.append(i)
    return best


print(largest_rectangle_area([2, 1, 5, 6, 2, 3]))
print(largest_rectangle_area([2, 4]))
              `)
            }
          },
          {
            heading: 'A monotonic deque handles sliding-window maximum',
            body: block(`
Sliding-window maximum needs candidates from both ends. You remove indices from the front when they leave the window, and remove indices from the back when the new value makes them obsolete. That is why a deque, not a plain stack, is the correct structure. The deque stores indices in decreasing value order, so the front is always the maximum for the current window.

The most common bug is leaving stale indices at the front and returning a maximum that no longer belongs to the window. The second common bug is using a heap without lazy deletion and accidentally reading expired entries. A heap can work, but a monotonic deque is cleaner when the window moves one step at a time and the only query is the current maximum.
            `),
            bullets: [
              'Pop front for expired indices before recording the window maximum.',
              'Pop back while the incoming value is at least as strong as older candidates.',
              'The deque front is the current maximum because values decrease through the deque.'
            ],
            codeExample: {
              title: 'Sliding-window maximum with deque',
              language: 'python',
              code: block(`
from collections import deque


def sliding_window_max(values, k):
    candidates = deque()
    result = []
    for i, value in enumerate(values):
        while candidates and candidates[0] <= i - k:
            candidates.popleft()
        while candidates and values[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(i)
        if i >= k - 1:
            result.append(values[candidates[0]])
    return result


print(sliding_window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
              `)
            }
          },
          {
            heading: 'Choose stack, deque, or heap by update shape',
            body: block(`
The design follow-up is usually about access pattern. Use a monotonic stack when each item waits for a future item to resolve it and no item needs to be removed from the front by age. Use a monotonic deque when the active range slides and old candidates expire from the left. Use a heap when the active set changes less predictably, when priorities are not tied to a simple sliding window, or when you need repeated global extremes with lazy deletion.

This framing is practical in 2025-2026 interviews because many candidates force every maximum prompt into a heap. Heaps are powerful, but they do not remove stale window entries automatically and they cost O(log n). A deque gives O(1) amortized operations for a one-step sliding window because every index enters once and leaves once from either end.
            `),
            bullets: [
              'Stack: unresolved next-greater or boundary questions.',
              'Deque: sliding windows with left expiration and right domination.',
              'Heap: broader priority access with lazy cleanup or non-window lifetimes.'
            ],
            codeExample: {
              title: 'Streaming prefix maximum with a simple variable',
              language: 'python',
              code: block(`
def running_maximum(values):
    best = None
    result = []
    for value in values:
        best = value if best is None else max(best, value)
        result.append(best)
    return result


print(running_maximum([4, 1, 7, 3, 9, 2]))
              `)
            }
          },
          {
            heading: 'How to defend amortized O(n)',
            body: block(`
Monotonic structures look like nested loops, but the loops are amortized linear. Every index is pushed once. Once popped, it never returns. The inner while loop can run many times during one iteration, but across the whole input it performs at most n pops. This push-once-pop-once argument is often enough for a phone screen.

Also state equality behavior. In next greater, equal values usually do not resolve each other, so the pop condition is <. In sliding-window maximum, popping <= from the back keeps the newer equal value because it will expire later. Those small comparison choices affect duplicates and are exactly the kind of follow-up interviewers use to test whether the invariant is real.
            `),
            bullets: [
              'Use push-once-pop-once to justify amortized linear time.',
              'Choose strict or non-strict comparisons from the prompt wording.',
              'Explain duplicate handling before the interviewer has to ask.'
            ]
          }
        ],
        checklist: [
          'Can state the monotonic order stored by a stack or deque.',
          'Can solve next-greater and daily-temperature prompts by storing indices.',
          'Can derive histogram width from nearest smaller boundaries.',
          'Can choose stack, deque, or heap for streaming maximum follow-ups.'
        ],
        pitfalls: [
          'Using an ordinary stack without preserving increasing or decreasing order.',
          'Storing values when the answer requires index distance or expiration.',
          'Forgetting to remove expired indices before reading a sliding-window maximum.',
          'Using the wrong strictness for duplicates in next-greater or deque prompts.'
        ],
        interviewPrompts: [
          'What invariant does the stack maintain in next greater element?',
          'Why is daily temperatures the same pattern but with index distances?',
          'How does the histogram stack know the width of a popped bar?',
          'When would you choose a heap instead of a monotonic deque for maxima?'
        ],
        exercises: [
          {
            id: 'next-warmer-distance',
            title: 'Next warmer distance',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Return how many positions each value waits until a strictly larger value appears to its right.',
            starterCode: block(`
def next_larger_distance(values):
    # TODO: keep indices whose next larger value has not appeared.
    # TODO: when current value resolves the stack top, store i - previous_index.
    return []


print(next_larger_distance([30, 40, 35, 50, 45]))
            `),
            solution: block(`
def next_larger_distance(values):
    distances = [0] * len(values)
    stack = []
    for i, value in enumerate(values):
        while stack and values[stack[-1]] < value:
            prev = stack.pop()
            distances[prev] = i - prev
        stack.append(i)
    return distances


print(next_larger_distance([30, 40, 35, 50, 45]))
            `),
            hints: [
              'Store indices, not just values, because the answer is a distance.',
              'The stack should hold decreasing values from bottom to top.',
              'Unresolved indices keep distance zero.'
            ],
            expectedOutput: '[1, 2, 1, 0, 0].'
          },
          {
            id: 'window-maximum-deque',
            title: 'Sliding maximum with a monotonic deque',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Return the maximum of every contiguous window of size k in one pass.',
            starterCode: block(`
from collections import deque


def window_max(values, k):
    # TODO: remove expired indices from the front.
    # TODO: remove weaker candidates from the back.
    # TODO: record the front value once the first full window exists.
    return []


print(window_max([9, 3, 5, 1, 6, 2], 3))
            `),
            solution: block(`
from collections import deque


def window_max(values, k):
    candidates = deque()
    result = []
    for i, value in enumerate(values):
        while candidates and candidates[0] <= i - k:
            candidates.popleft()
        while candidates and values[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(i)
        if i >= k - 1:
            result.append(values[candidates[0]])
    return result


print(window_max([9, 3, 5, 1, 6, 2], 3))
            `),
            hints: [
              'The deque stores indices in decreasing value order.',
              'An index is expired when it is at most i - k.',
              'Use <= when popping from the back so newer equal values last longer.'
            ],
            expectedOutput: '[9, 5, 6, 6].'
          },
          {
            id: 'streaming-max-structure-review',
            title: 'Choose stack, deque, or heap for streaming maxima',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Design approaches for three dashboards: next spike after each metric, max over the last k events, and max-priority open incident with arbitrary close events.',
            hints: [
              'Map next-spike questions to a monotonic stack.',
              'Map last-k-window questions to a monotonic deque.',
              'Map arbitrary close/update questions to heap plus lazy deletion or another indexed structure.'
            ]
          }
        ],
        diagram: null,
        related: ['tries-and-prefix-decision-trees', 'bits-strings-hashing-and-lru-design']
      },
      {
        slug: 'bits-strings-hashing-and-lru-design',
        title: 'Bits, strings, hashing, and LRU design',
        summary:
          'Bit tricks, rolling hash mental models, substring equality, and LRU Cache design with hash map plus doubly linked list invariants.',
        duration: '50-60 min',
        whyItMatters:
          'Bits, string hashing, and LRU design keep showing up in 2025-2026 screens because they test fluency outside ordinary arrays. OAs reward quick XOR and bitmask recognition; phone rounds reward explaining collision and invariant boundaries; onsite follow-ups at Amazon and Meta often ask for cache behavior, capacity eviction, and the single-threaded interview default versus real concurrency.',
        sections: [
          {
            heading: 'XOR solves paired cancellation problems',
            body: block(`
XOR is still asked because it compresses a useful algebra into a tiny implementation. A value XOR itself is zero, and zero XOR a value is the value. If every number appears twice except one, XORing the whole list cancels all pairs and leaves the unique number. This is not magic; it is commutative cancellation over bits.

The interview risk is overusing it. XOR works when the pairing contract is exact. If numbers can appear three times, or multiple numbers are unique, the invariant changes and a different bit-counting or set-based approach may be needed. State the contract before coding so the interviewer hears why the trick is legal.
            `),
            bullets: [
              'x ^ x cancels to 0, and x ^ 0 returns x.',
              'Order does not matter because XOR is associative and commutative.',
              'The frequency contract decides whether XOR is valid.'
            ],
            codeExample: {
              title: 'Find the single unpaired number',
              language: 'python',
              code: block(`
def single_number(values):
    result = 0
    for value in values:
        result ^= value
    return result


print(single_number([4, 1, 2, 1, 2]))
print(single_number([9, 7, 9, 8, 7]))
              `)
            }
          },
          {
            heading: 'Bitmasks compact small subset state',
            body: block(`
Bitmasks are useful when a set is small enough to fit in machine-sized or Python integer bits. Interviewers use them for subsets, visited states, parity of character counts, and dynamic-programming state compression. A mask is not just a micro-optimization; it can make a state hashable, compact, and easy to combine with bit operations.

The practical framing is "small universe." If there are at most 20 features, letters, or nodes, a mask can represent inclusion. If the universe is unbounded or labels are sparse without compression, a set may be clearer. In phone rounds, call out the mapping from item to bit position because that mapping is part of the algorithm.
            `),
            bullets: [
              'Use 1 << i to represent item i.',
              'Use mask & bit to test membership and mask | bit to add.',
              'Small fixed universes make masks practical and easy to hash.'
            ],
            codeExample: {
              title: 'Track seen lowercase vowels with a mask',
              language: 'python',
              code: block(`
VOWEL_INDEX = {char: i for i, char in enumerate("aeiou")}


def vowel_mask(text):
    mask = 0
    for char in text:
        if char in VOWEL_INDEX:
            mask |= 1 << VOWEL_INDEX[char]
    return mask


def has_all_vowels(text):
    return vowel_mask(text) == (1 << 5) - 1


print(bin(vowel_mask("interview")))
print(has_all_vowels("education"))
print(has_all_vowels("system"))
              `)
            }
          },
          {
            heading: 'Popcount explains many bit follow-ups',
            body: block(`
Counting set bits appears in Hamming distance, subset size, masks for permissions, and DP transitions. Python gives you int.bit_count(), which is stdlib and interview-acceptable if the prompt is not asking you to implement popcount. If asked to implement it, repeatedly clearing the lowest set bit with x &= x - 1 runs once per set bit.

The reasoning is valuable beyond the code. x - 1 flips the lowest set bit to zero and turns lower zeros into ones; ANDing with the original clears exactly that lowest set bit. This makes complexity proportional to the number of set bits rather than the width of the integer.
            `),
            bullets: [
              'int.bit_count() is the clean Python stdlib answer for popcount.',
              'x & (x - 1) clears the lowest set bit.',
              'Hamming distance is popcount(a ^ b).'
            ],
            codeExample: {
              title: 'Hamming distance with bit_count',
              language: 'python',
              code: block(`
def hamming_distance(a, b):
    return (a ^ b).bit_count()


def popcount_manual(value):
    count = 0
    while value:
        value &= value - 1
        count += 1
    return count


print(hamming_distance(25, 30))
print(popcount_manual(30))
              `)
            }
          },
          {
            heading: 'Rolling hash compares substrings by reusable fingerprints',
            body: block(`
Sliding-window frequency maps are strong when equality means the same multiset of characters, such as anagrams. They are not enough when order matters and you need fast substring equality or repeated pattern checks. Rolling hash gives each substring a numeric fingerprint so equal-length substrings can be compared in O(1) after prefix preprocessing, with the caveat that collisions are possible.

The Rabin-Karp mental model is prefix arithmetic over characters. Store prefix hashes so hash(left, right) can be computed by subtracting the previous prefix multiplied by the proper power. In interviews, you can mention collision risk and choose a large modulus, double hashing, or direct verification after a hash match depending on the required guarantee.
            `),
            bullets: [
              'Frequency maps ignore order; rolling hashes preserve ordered character positions probabilistically.',
              'Prefix hashes make substring hash queries constant time after preprocessing.',
              'Hash matches may need verification if the prompt requires deterministic equality.'
            ],
            codeExample: {
              title: 'Rabin-Karp substring search with verification',
              language: 'python',
              code: block(`
def rabin_karp(text, pattern):
    if len(pattern) > len(text):
        return []
    base = 257
    mod = 1_000_000_007
    m = len(pattern)
    high = pow(base, m - 1, mod)

    pattern_hash = 0
    window_hash = 0
    for i in range(m):
        pattern_hash = (pattern_hash * base + ord(pattern[i])) % mod
        window_hash = (window_hash * base + ord(text[i])) % mod

    matches = []
    for start in range(len(text) - m + 1):
        if window_hash == pattern_hash and text[start:start + m] == pattern:
            matches.append(start)
        if start + m < len(text):
            left = ord(text[start])
            right = ord(text[start + m])
            window_hash = (window_hash - left * high) % mod
            window_hash = (window_hash * base + right) % mod
    return matches


print(rabin_karp("abracadabra", "abra"))
print(rabin_karp("aaaaa", "aa"))
              `)
            }
          },
          {
            heading: 'LRU Cache is map lookup plus recency ordering',
            body: block(`
LRU Cache appears across Amazon and Meta because it blends data-structure implementation with product semantics. The cache needs O(1) get and put. A hash map gives key-to-node lookup. A doubly linked list stores recency order so a node can be removed from the middle and moved to the front in O(1). When capacity is exceeded, the tail is the least recently used item and is evicted.

Python OrderedDict is a useful mental model and sometimes an acceptable implementation if the prompt allows stdlib helpers. For the classic design interview, be ready to implement the list yourself. State the single-threaded interview default. In real systems, concurrent get/put operations need locking or sharding because recency updates mutate shared state.
            `),
            bullets: [
              'Hash map maps keys to list nodes.',
              'Doubly linked list keeps most recent near the front and LRU near the back.',
              'get and put both refresh recency when the key exists.'
            ],
            codeExample: {
              title: 'LRU Cache with OrderedDict mental model',
              language: 'python',
              code: block(`
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        if key in self.items:
            self.items.move_to_end(key)
        self.items[key] = value
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)


cache = LRUCache(2)
cache.put("a", 1)
cache.put("b", 2)
print(cache.get("a"))
cache.put("c", 3)
print(cache.get("b"))
print(cache.get("c"))
              `)
            }
          },
          {
            heading: 'LRU, LFU, and FIFO answer different access patterns',
            body: block(`
LRU assumes recent access predicts near-future access. That is often reasonable for pages, sessions, and hot objects. LFU assumes frequently accessed items should survive even if they were not touched most recently. FIFO ignores access after insertion and evicts the oldest inserted item. None is universally correct; the access pattern and product objective choose the policy.

In design follow-ups, be precise about capacity, eviction trigger, whether reads update recency, what happens on updating an existing key, and whether the interview assumes one thread. A clean LRU invariant is "front is most recent, back is least recent, and every map entry points to exactly one node in that list." That invariant is what gives O(1) behavior.
            `),
            bullets: [
              'LRU favors recency, LFU favors frequency, FIFO favors insertion order.',
              'Updating an existing key should usually refresh LRU recency.',
              'Concurrency is out of scope for single-threaded interviews but important in production.'
            ],
            codeExample: {
              title: 'LRU Cache with explicit nodes',
              language: 'python',
              code: block(`
class Node:
    def __init__(self, key=None, value=None):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.nodes = {}
        self.head = Node()
        self.tail = Node()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.nodes:
            return -1
        node = self.nodes[key]
        self._remove(node)
        self._add_front(node)
        return node.value

    def put(self, key, value):
        if key in self.nodes:
            node = self.nodes[key]
            node.value = value
            self._remove(node)
            self._add_front(node)
            return
        node = Node(key, value)
        self.nodes[key] = node
        self._add_front(node)
        if len(self.nodes) > self.capacity:
            lru = self.tail.prev
            self._remove(lru)
            del self.nodes[lru.key]


cache = LRUCache(2)
cache.put(1, "one")
cache.put(2, "two")
print(cache.get(1))
cache.put(3, "three")
print(cache.get(2))
print(cache.get(3))
              `)
            }
          }
        ],
        checklist: [
          'Can use XOR cancellation and explain the exact frequency contract it requires.',
          'Can represent small subset or parity state with bitmasks and bit_count.',
          'Can explain rolling hash as ordered substring fingerprints with collision caveats.',
          'Can implement or describe LRU Cache with a hash map and doubly linked list.'
        ],
        pitfalls: [
          'Applying XOR when the duplicate-count contract does not match the prompt.',
          'Using bitmasks for large or unmapped universes without explaining compression.',
          'Treating rolling-hash equality as collision-free without verification or caveat.',
          'Building LRU with a list that requires O(n) middle removal.'
        ],
        interviewPrompts: [
          'Why does XOR find one unpaired number when every other number appears twice?',
          'When is a bitmask better than a Python set for representing state?',
          'How does Rabin-Karp differ from a sliding-window frequency map?',
          'Why does LRU need both a hash map and a doubly linked list for O(1) get and put?'
        ],
        exercises: [
          {
            id: 'xor-and-hamming-review',
            title: 'Unique number and Hamming distances',
            difficulty: 'beginner',
            type: 'coding',
            description:
              'Return the unique unpaired number and the pairwise Hamming distance between two integers.',
            starterCode: block(`
def single_number(values):
    # TODO: XOR all values together.
    return 0


def hamming_distance(a, b):
    # TODO: count set bits in a XOR b.
    return 0


print(single_number([6, 3, 6, 4, 3]))
print(hamming_distance(10, 4))
            `),
            solution: block(`
def single_number(values):
    result = 0
    for value in values:
        result ^= value
    return result


def hamming_distance(a, b):
    return (a ^ b).bit_count()


print(single_number([6, 3, 6, 4, 3]))
print(hamming_distance(10, 4))
            `),
            hints: [
              'A number XOR itself cancels to zero.',
              'Hamming distance counts bit positions where the two numbers differ.',
              'Python integers provide bit_count for set-bit counts.'
            ],
            expectedOutput: '4, then 3.'
          },
          {
            id: 'lru-cache-ordered-dict',
            title: 'Implement LRU with OrderedDict',
            difficulty: 'intermediate',
            type: 'coding',
            description:
              'Implement get and put for an LRU cache using Python stdlib OrderedDict as the recency list.',
            starterCode: block(`
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        # TODO: return -1 if missing, otherwise refresh recency and return value.
        return -1

    def put(self, key, value):
        # TODO: insert or update the key, refresh recency, and evict if over capacity.
        pass


cache = LRUCache(2)
cache.put("x", 10)
cache.put("y", 20)
print(cache.get("x"))
cache.put("z", 30)
print(cache.get("y"))
            `),
            solution: block(`
from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.items = OrderedDict()

    def get(self, key):
        if key not in self.items:
            return -1
        self.items.move_to_end(key)
        return self.items[key]

    def put(self, key, value):
        if key in self.items:
            self.items.move_to_end(key)
        self.items[key] = value
        if len(self.items) > self.capacity:
            self.items.popitem(last=False)


cache = LRUCache(2)
cache.put("x", 10)
cache.put("y", 20)
print(cache.get("x"))
cache.put("z", 30)
print(cache.get("y"))
            `),
            hints: [
              'OrderedDict keeps insertion order and can move keys to the newest end.',
              'Reads update LRU recency when the key exists.',
              'popitem(last=False) removes the oldest key.'
            ],
            expectedOutput: '10, then -1.'
          },
          {
            id: 'cache-policy-design-review',
            title: 'Choose LRU, LFU, or FIFO',
            difficulty: 'intermediate',
            type: 'design',
            description:
              'Choose an eviction policy for three workloads: session pages with locality, API tokens with one-time bursts, and a queue of oldest unprocessed jobs.',
            hints: [
              'Use LRU when recent access predicts near-future access.',
              'Use LFU when long-term frequency matters more than recency.',
              'Use FIFO when access after insertion should not affect eviction.'
            ]
          }
        ],
        diagram: null,
        related: ['tries-and-prefix-decision-trees', 'monotonic-stacks-and-next-greater']
      }
    ]
  }
];
