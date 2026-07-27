const chapters = {
  "dsa-interview-essentials-lab/tries-and-prefix-decision-trees": {
    title: "Chapter: Tries and prefix decision trees",
    readingTime: "75-95 min",
    premise:
      "Tries share prefixes so insert, search, and autocomplete reuse paths. This chapter builds dict-based tries, suggestion collection, board search pruning, and when sorted lists beat tries.",
    parts: [
      {
        id: "shared-prefixes",
        heading: "A trie turns shared prefixes into shared work",
        paragraphs: [
          "A trie (prefix tree) stores strings so common prefixes share nodes. Each edge is a character; a terminal mark ends a word. Searching walks character by character and fails early on missing edges. After construction, search cost is O(L) in the word length, largely independent of how many words share earlier prefixes.",
          "Tries shine when many queries ask about prefixes: autocomplete, spell prefixes, and dictionary pruning for board searches. They cost memory for nodes and pointers; sparse alphabets waste less if children are hash maps.",
          "Interview explanations should contrast tries with hash sets of whole words: sets answer exact membership quickly but do not share prefix structure for suggestions."
        ],
        keyTerms: [
          {
            term: "trie",
            definition:
              "A tree that stores strings by characters along edges, sharing common prefixes."
          },
          {
            term: "terminal mark",
            definition:
              "A flag or sentinel showing a node completes a stored word."
          },
          {
            term: "prefix path",
            definition:
              "The node sequence spelling a string prefix from the root."
          }
        ],
        workedExample: {
          title: "Insert, search, and startsWith",
          body:
            "Nested dict children plus a terminal boolean implement the three classic ops.",
          code:
            "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word):\n        node = self.root\n        for ch in word:\n            node = node.children.setdefault(ch, TrieNode())\n        node.is_word = True\n\n    def search(self, word):\n        node = self._walk(word)\n        return bool(node and node.is_word)\n\n    def starts_with(self, prefix):\n        return self._walk(prefix) is not None\n\n    def _walk(self, text):\n        node = self.root\n        for ch in text:\n            if ch not in node.children:\n                return None\n            node = node.children[ch]\n        return node\n\n\nt = Trie()\nfor word in ['apple', 'app', 'ape']:\n    t.insert(word)\nprint(t.search('app'), t.search('appl'), t.starts_with('ap'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can startsWith succeed when search fails?",
            reveal:
              "A node may exist for the character path without a terminal mark, meaning the string is only a prefix of some stored word."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Say O(L) per query after build, and mention memory grows with distinct prefixes."
        }
      },
      {
        id: "nested-dict",
        heading: "Nested dictionaries are enough in Python interviews",
        paragraphs: [
          "You do not need a formal class for every prompt. A nested dict with a sentinel key such as '#' for terminals is compact. insert creates missing maps; search checks the sentinel. This style is fast to write under time pressure.",
          "Clarity still matters. If methods multiply—erase, count, autocomplete—named nodes read better. For a single insert/search drill, nested dicts are fine.",
          "Avoid storing full words on every node unless needed; terminals plus path reconstruction usually suffice."
        ],
        keyTerms: [
          {
            term: "sentinel key",
            definition:
              "A reserved child key marking that the current node ends a word."
          },
          {
            term: "nested-dict trie",
            definition:
              "A trie represented as dictionaries of dictionaries without a custom class."
          },
          {
            term: "path reconstruction",
            definition:
              "Building the string from characters accumulated while walking."
          }
        ],
        workedExample: {
          title: "Nested-dict trie with a sentinel",
          body:
            "The '#' key marks terminals inside ordinary child maps.",
          code:
            "def insert(trie, word):\n    node = trie\n    for ch in word:\n        node = node.setdefault(ch, {})\n    node['#'] = True\n\n\ndef search(trie, word):\n    node = trie\n    for ch in word:\n        if ch not in node:\n            return False\n        node = node[ch]\n    return '#' in node\n\n\ntrie = {}\nfor word in ['to', 'tea', 'ten']:\n    insert(trie, word)\nprint(search(trie, 'tea'), search(trie, 'tex'), '#' in trie.get('t', {}).get('o', {}))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why choose a sentinel that cannot appear as a character?",
            reveal:
              "If the alphabet included the sentinel, a real child could collide with the terminal mark and corrupt meaning."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Offer class-based or nested-dict forms; pick one and stay consistent."
        }
      },
      {
        id: "autocomplete",
        heading: "Autocomplete is prefix walk plus bounded collection",
        paragraphs: [
          "Walk to the prefix node, then DFS or BFS the subtree to collect terminals. Bound the number of suggestions if the product asks for top few. Ordering may be lexicographic (DFS in sorted keys) or by frequency (store counts in terminals and heap the results).",
          "Without a trie, you might binary search a sorted word list for the prefix range. Tries win when inserts are frequent and prefixes are queried often; sorted arrays win when the dictionary is static.",
          "Discuss memory: dense alphabets with arrays of size 26 are cache-friendly; sparse languages prefer maps."
        ],
        keyTerms: [
          {
            term: "autocomplete",
            definition:
              "Returning words that continue a typed prefix."
          },
          {
            term: "subtree collection",
            definition:
              "Enumerating terminals under the node reached by a prefix."
          },
          {
            term: "bounded suggestions",
            definition:
              "Stopping after k results to keep response size small."
          }
        ],
        workedExample: {
          title: "Collect autocomplete suggestions",
          body:
            "After walking the prefix, DFS children in sorted order for lex suggestions.",
          code:
            "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.is_word = False\n\n\ndef insert(root, word):\n    node = root\n    for ch in word:\n        node = node.children.setdefault(ch, TrieNode())\n    node.is_word = True\n\n\ndef suggest(root, prefix, limit=5):\n    node = root\n    for ch in prefix:\n        if ch not in node.children:\n            return []\n        node = node.children[ch]\n    out = []\n\n    def dfs(cur, path):\n        if len(out) >= limit:\n            return\n        if cur.is_word:\n            out.append(path)\n        for ch in sorted(cur.children):\n            dfs(cur.children[ch], path + ch)\n\n    dfs(node, prefix)\n    return out\n\n\nroot = TrieNode()\nfor word in ['app', 'apple', 'apply', 'ape', 'banana']:\n    insert(root, word)\nprint(suggest(root, 'ap'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Where does lexicographic order come from in this collector?",
            reveal:
              "Children are visited in sorted character order, so DFS emits words in lexicographic order."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If frequencies matter, store counts at terminals and take a heap of size k instead of pure lex DFS."
        }
      },
      {
        id: "board-prune",
        heading: "Word Search II prunes DFS with the trie",
        paragraphs: [
          "On a board, DFS explores paths while walking the trie in lockstep. If the next cell character is absent from the current node's children, prune. When a terminal is reached, record the word and optionally unmark to avoid duplicates.",
          "Visited cells on the board must undo like any backtracking path. The trie pointer advances and retreats with recursion depth implicitly.",
          "This pairing—graph DFS plus trie—shows why prefix trees are decision trees for dictionaries."
        ],
        keyTerms: [
          {
            term: "lockstep walk",
            definition:
              "Advancing board position and trie node together on each character."
          },
          {
            term: "prefix prune",
            definition:
              "Stopping a board path when no dictionary word continues the prefix."
          },
          {
            term: "Word Search II",
            definition:
              "The classic find-all-words-on-board problem solved with trie pruning."
          }
        ],
        workedExample: {
          title: "Board DFS with trie pruning",
          body:
            "Only explore neighbors that continue a live trie branch.",
          code:
            "def find_words(board, words):\n    root = {}\n    for word in words:\n        node = root\n        for ch in word:\n            node = node.setdefault(ch, {})\n        node['#'] = word\n    rows, cols = len(board), len(board[0])\n    found = set()\n\n    def dfs(r, c, node):\n        ch = board[r][c]\n        nxt = node.get(ch)\n        if not nxt:\n            return\n        board[r][c] = '*'\n        if '#' in nxt:\n            found.add(nxt['#'])\n        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n            nr, nc = r + dr, c + dc\n            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '*':\n                dfs(nr, nc, nxt)\n        board[r][c] = ch\n\n    for r in range(rows):\n        for c in range(cols):\n            dfs(r, c, root)\n    return sorted(found)\n\n\nboard = [['o', 'a', 'a'], ['e', 't', 'a'], ['i', 'h', 'k']]\nprint(find_words(board, ['oath', 'eat', 'tea', 'peak']))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What does the trie prune that bare DFS over all words would waste?",
            reveal:
              "Paths whose prefix matches no dictionary word die immediately instead of continuing toward impossible cells."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Describe board DFS and trie DFS as one joint state: (cell, trie node, visited)."
        }
      },
      {
        id: "trie-tradeoffs",
        heading: "Choose trie, prefix set, or sorted words",
        paragraphs: [
          "Hash set of words: exact lookup, no prefix sharing. Hash set of all prefixes: startsWith in expected O(1) after O(total characters) memory—sometimes enough without a trie. Sorted list + binary search: great for static dictionaries and range queries by prefix.",
          "Tries win with mixed insert/query prefix workloads and pruning needs. They lose when the alphabet is huge and prefixes rarely share, or when a static sorted array is simpler.",
          "Follow-ups often ask to delete words or count prefix occurrences—extend nodes with counts or reference counters."
        ],
        keyTerms: [
          {
            term: "prefix set",
            definition:
              "A hash set storing every prefix of every word for fast startsWith."
          },
          {
            term: "static dictionary",
            definition:
              "A fixed word list that can be sorted once and binary searched."
          },
          {
            term: "prefix range",
            definition:
              "The contiguous sorted span of words sharing a prefix."
          }
        ],
        workedExample: {
          title: "Static prefix lookup with binary search",
          body:
            "Sorted words let lower-bound find the first candidate with the prefix.",
          code:
            "import bisect\n\n\ndef words_with_prefix(words, prefix):\n    words = sorted(words)\n    i = bisect.bisect_left(words, prefix)\n    out = []\n    while i < len(words) and words[i].startswith(prefix):\n        out.append(words[i])\n        i += 1\n    return out\n\n\nprint(words_with_prefix(['apple', 'app', 'banana', 'apply', 'ape'], 'ap'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When is a sorted list preferable to a trie?",
            reveal:
              "When the dictionary is static, memory is tight, and binary search over sorted words is enough for prefix range queries."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Compare trie vs prefix-set vs sorted list on insert cost, query cost, and memory before coding."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Tries share prefixes so prefix queries reuse paths.",
        "Nested dicts or node classes both work in interviews.",
        "Autocomplete walks a prefix then collects terminals.",
        "Board word search prunes when trie children are missing.",
        "Static sorted dictionaries can replace tries for some workloads."
      ],
      nextSteps: [
        "Implement insert/search/startsWith and test overlapping words like app/apple.",
        "Add frequency-ranked autocomplete with a size-k heap.",
        "Explain three structures for prefix queries in one minute."
      ]
    }
  },

  "dsa-interview-essentials-lab/monotonic-stacks-and-next-greater": {
    title: "Chapter: Monotonic stacks and next greater",
    readingTime: "75-95 min",
    premise:
      "Monotonic stacks keep candidates in sorted order so each element finds its next greater or smaller neighbor in amortized linear time. This chapter covers next greater, daily temperatures, histogram rectangles, and deques for window maxima.",
    parts: [
      {
        id: "candidates",
        heading: "Monotonic stacks store candidates, not history",
        paragraphs: [
          "A monotonic decreasing stack of indices stores values waiting for a greater element to the right. When a new value arrives, it pops smaller candidates and becomes their next greater. Each index pushes and pops at most once, so total work is O(n).",
          "The stack is not a full history; discarded elements already found their answers. Maintaining order is the invariant: top to bottom increases or decreases as chosen.",
          "Next smaller variants flip the comparison. Always state which neighbor you seek and which side."
        ],
        keyTerms: [
          {
            term: "monotonic stack",
            definition:
              "A stack whose values are monotone, used to find nearest greater/smaller neighbors."
          },
          {
            term: "next greater element",
            definition:
              "The first later element strictly larger than the current one."
          },
          {
            term: "amortized linear",
            definition:
              "O(n) total over the array because each index enters and leaves the stack once."
          }
        ],
        workedExample: {
          title: "Next greater value to the right",
          body:
            "Pop smaller indices when a larger value arrives; fill their answers.",
          code:
            "def next_greater(nums):\n    answer = [-1] * len(nums)\n    stack = []\n    for i, value in enumerate(nums):\n        while stack and nums[stack[-1]] < value:\n            answer[stack.pop()] = value\n        stack.append(i)\n    return answer\n\n\nprint(next_greater([2, 1, 2, 4, 3]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is the total runtime O(n) despite the inner while?",
            reveal:
              "Each index is pushed once and popped at most once, so the while body runs O(n) times overall."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Store indices when you need distances or later lookups into the array."
        }
      },
      {
        id: "temperatures",
        heading: "Daily temperatures is next greater distance",
        paragraphs: [
          "The classic warmer-day problem asks for the distance to the next greater temperature. Same stack pattern: pop colder days when a warmer day arrives and write index differences.",
          "Edge elements without a warmer day stay zero or -1 per prompt. Circular next-greater variants iterate the array twice with index modulo n—mention as a follow-up.",
          "Narrate the invariant: stack temperatures are strictly decreasing by value."
        ],
        keyTerms: [
          {
            term: "distance answer",
            definition:
              "Storing j - i instead of the greater value itself."
          },
          {
            term: "warmer day",
            definition:
              "The next index with a strictly higher temperature."
          },
          {
            term: "circular next greater",
            definition:
              "Searching as if the array wraps around once."
          }
        ],
        workedExample: {
          title: "Wait until a warmer day",
          body:
            "Differences of indices become waiting days.",
          code:
            "def daily_temperatures(temps):\n    answer = [0] * len(temps)\n    stack = []\n    for i, temp in enumerate(temps):\n        while stack and temps[stack[-1]] < temp:\n            j = stack.pop()\n            answer[j] = i - j\n        stack.append(i)\n    return answer\n\n\nprint(daily_temperatures([73, 74, 75, 71, 69, 72, 76, 73]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What remains in the stack at the end?",
            reveal:
              "Indices that never saw a warmer day; their answers stay 0 in this formulation."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Call it next-greater-distance before coding so the pattern is obvious."
        }
      },
      {
        id: "histogram",
        heading: "Largest rectangle uses nearest smaller boundaries",
        paragraphs: [
          "For histogram bars, the largest rectangle at height h[i] extends until a strictly smaller bar on left and right. Monotonic increasing stacks find previous and next smaller indices. Area is height times width between those bounds.",
          "Sentinel zeros at ends simplify emptying the stack. This problem is the showcase that monotonic stacks solve more than next greater—they compute contribution boundaries.",
          "Watch strict versus non-strict comparisons for equal heights to avoid double counting or zero widths."
        ],
        keyTerms: [
          {
            term: "nearest smaller",
            definition:
              "Closest index to the left/right with a smaller value."
          },
          {
            term: "contribution width",
            definition:
              "How far a bar's height can extend before hitting a shorter bar."
          },
          {
            term: "histogram rectangle",
            definition:
              "A contiguous bar range forming a rectangle under the skyline."
          }
        ],
        workedExample: {
          title: "Largest rectangle in histogram",
          body:
            "Increasing stack of indices; pops compute width using the new smaller bar as right bound.",
          code:
            "def largest_rectangle(heights):\n    heights = heights + [0]\n    stack = [-1]\n    best = 0\n    for i, h in enumerate(heights):\n        while stack[-1] != -1 and heights[stack[-1]] > h:\n            height = heights[stack.pop()]\n            width = i - stack[-1] - 1\n            best = max(best, height * width)\n        stack.append(i)\n    return best\n\n\nprint(largest_rectangle([2, 1, 5, 6, 2, 3]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why append a trailing 0 height?",
            reveal:
              "It forces every remaining bar to pop so rectangles that extend to the end are evaluated."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Draw one pop step: height from popped bar, right = i, left = new top."
        }
      },
      {
        id: "deque-window",
        heading: "A monotonic deque handles sliding-window maximum",
        paragraphs: [
          "For window maxima, a decreasing deque of indices keeps candidates. The front is the max. Pop smaller values from the back before appending; pop expired indices from the front when they leave the window.",
          "Each index enters and leaves once—O(n). A heap also works but needs lazy deletion and is slower. Prefer deque when the window slides contiguously.",
          "The same idea yields window minimums with an increasing deque."
        ],
        keyTerms: [
          {
            term: "monotonic deque",
            definition:
              "A double-ended queue kept monotone for window extremes."
          },
          {
            term: "sliding-window maximum",
            definition:
              "The max value in every contiguous window of length k."
          },
          {
            term: "expired index",
            definition:
              "A front candidate that falls outside the current window."
          }
        ],
        workedExample: {
          title: "Sliding-window maximum with deque",
          body:
            "Front holds the max index; back pops dominated smaller values.",
          code:
            "from collections import deque\n\n\ndef max_sliding_window(nums, k):\n    dq = deque()\n    out = []\n    for i, value in enumerate(nums):\n        while dq and dq[0] <= i - k:\n            dq.popleft()\n        while dq and nums[dq[-1]] <= value:\n            dq.pop()\n        dq.append(i)\n        if i >= k - 1:\n            out.append(nums[dq[0]])\n    return out\n\n\nprint(max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why pop from the back when the new value is larger?",
            reveal:
              "A larger newer value dominates older smaller ones for all future windows that include the new index."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Contrast O(n) deque versus heap with lazy deletes for window maxima."
        }
      },
      {
        id: "structure-choice",
        heading: "Choose stack, deque, or heap by update shape",
        paragraphs: [
          "Next greater/smaller on a static array: monotonic stack. Sliding window extreme: monotonic deque. Streaming maxima with arbitrary deletes: heap. Prefix maximum only: a single variable.",
          "Amortized O(n) arguments convince interviewers the nested loops are fine. State push/pop once per index explicitly.",
          "If updates change past values, monotonic structures may invalidate—say so and switch tools."
        ],
        keyTerms: [
          {
            term: "update shape",
            definition:
              "How values arrive, expire, or change over time."
          },
          {
            term: "prefix maximum",
            definition:
              "The max of the first i elements; maintainable in O(1) per step."
          },
          {
            term: "structure selection",
            definition:
              "Picking stack, deque, or heap from the access pattern."
          }
        ],
        workedExample: {
          title: "Streaming prefix maximum",
          body:
            "When only prefixes matter, a variable beats heavier structures.",
          code:
            "def prefix_maxima(nums):\n    out = []\n    best = float('-inf')\n    for value in nums:\n        best = max(best, value)\n        out.append(best)\n    return out\n\n\nprint(prefix_maxima([2, 1, 5, 3, 4]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When is a heap the wrong tool for window maximum?",
            reveal:
              "When windows slide by one and you can expire indices from a deque in amortized O(1), giving strict O(n) without heap logs."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Start answers by naming the neighbor relation or window extreme you need; the structure follows."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Monotonic stacks find next greater/smaller in amortized O(n).",
        "Daily temperatures is next-greater distance.",
        "Histogram rectangles use nearest smaller boundaries.",
        "Monotonic deques solve sliding-window maxima in O(n).",
        "Pick stack, deque, or heap from the update shape."
      ],
      nextSteps: [
        "Solve next greater and daily temperatures with one shared template.",
        "Trace the histogram stack on a six-bar example.",
        "Implement window minimum by flipping deque comparisons."
      ]
    }
  },

  "dsa-interview-essentials-lab/bits-strings-hashing-and-lru-design": {
    title: "Chapter: Bits, strings, hashing, and LRU design",
    readingTime: "80-100 min",
    premise:
      "Interview essentials mix bit tricks, rolling hashes, and cache design. This chapter covers XOR pairing, bitmasks, popcount, Rabin-Karp, and LRU with map-plus-list mechanics.",
    parts: [
      {
        id: "xor-pairing",
        heading: "XOR solves paired cancellation problems",
        paragraphs: [
          "XOR is associative, commutative, and its own inverse. XORing a number twice cancels it. Therefore XORing an array where every value appears twice except one leaves the unpaired value. This is O(n) time and O(1) space.",
          "Extensions find two unique numbers using a distinguishing bit of their XOR. Know the limits: XOR does not replace hashing when frequencies are arbitrary.",
          "Bit tricks should stay readable. Prefer clarity plus a one-line invariant over clever density."
        ],
        keyTerms: [
          {
            term: "XOR cancellation",
            definition:
              "Property that x ^ x = 0 and x ^ 0 = x, enabling pair removal."
          },
          {
            term: "unpaired element",
            definition:
              "The value left after all paired duplicates cancel under XOR."
          },
          {
            term: "distinguishing bit",
            definition:
              "A bit where two leftover values differ, used to partition XORs."
          }
        ],
        workedExample: {
          title: "Find the single unpaired number",
          body:
            "Accumulate XOR across the array; pairs vanish.",
          code:
            "def single_number(nums):\n    acc = 0\n    for value in nums:\n        acc ^= value\n    return acc\n\n\nprint(single_number([4, 1, 2, 1, 2]))\nprint(single_number([1]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why does order not matter for the XOR accumulation?",
            reveal:
              "XOR is commutative and associative, so any order yields the same cancellation result."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "State the invariant: after processing the prefix, acc is XOR of unpaired bits so far."
        }
      },
      {
        id: "bitmasks",
        heading: "Bitmasks compact small subset state",
        paragraphs: [
          "When a set is tiny—vowels, 26 letters, flags—an integer bitmask stores membership in bits. Set, clear, and test are shifts and masks. DP over subsets uses masks as indices when n ≤ about 20.",
          "Bitmasks trade readability for speed and memory. Document which bit means which element. Prefer sets when n is large or labels are not dense integers.",
          "Hamming distance counts differing bits—often via XOR then popcount."
        ],
        keyTerms: [
          {
            term: "bitmask",
            definition:
              "An integer whose bits encode membership or flags for a small universe."
          },
          {
            term: "popcount",
            definition:
              "The number of set bits in an integer; also called Hamming weight."
          },
          {
            term: "subset DP",
            definition:
              "Dynamic programming indexed by bitmasks of chosen elements."
          }
        ],
        workedExample: {
          title: "Vowel mask and Hamming distance",
          body:
            "Track seen vowels in bits; popcount XOR for Hamming distance.",
          code:
            "def seen_vowels_mask(text):\n    vowels = {ch: i for i, ch in enumerate('aeiou')}\n    mask = 0\n    for ch in text.lower():\n        if ch in vowels:\n            mask |= 1 << vowels[ch]\n    return mask\n\n\ndef hamming_distance(a, b):\n    return (a ^ b).bit_count()\n\n\nprint(bin(seen_vowels_mask('education')))\nprint(hamming_distance(1, 4))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "How does XOR help Hamming distance?",
            reveal:
              "Differing bits become 1 in a ^ b. Counting those ones is the distance."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "In Python 3.10+, int.bit_count() is the clear popcount; bin(x).count('1') also works."
        }
      },
      {
        id: "rolling-hash",
        heading: "Rolling hash compares substrings by fingerprints",
        paragraphs: [
          "Rabin-Karp maintains a sliding hash of a window so substring equality checks become integer compares, with verification on hits to guard collisions. Rolling updates subtract the leaving character and add the entering character in O(1).",
          "Choose bases and moduli carefully in production; in interviews, a single mod prime plus verification is usually enough. Mention collision risk honestly.",
          "String hashing also powers some substring DP and deduplication ideas. It does not replace true string algorithms when worst-case guarantees matter."
        ],
        keyTerms: [
          {
            term: "rolling hash",
            definition:
              "A hash of a sliding window updated in constant time per move."
          },
          {
            term: "Rabin-Karp",
            definition:
              "Substring search using rolling hashes plus verification."
          },
          {
            term: "collision",
            definition:
              "Distinct strings sharing a hash value; requires verification."
          }
        ],
        workedExample: {
          title: "Rabin-Karp with verification",
          body:
            "Window hash matches trigger a direct equality check before accepting.",
          code:
            "def rabin_karp(text, pattern):\n    if len(pattern) > len(text):\n        return []\n    base, mod = 256, 10**9 + 7\n    m = len(pattern)\n    power = pow(base, m - 1, mod)\n    target = 0\n    window = 0\n    for i in range(m):\n        target = (target * base + ord(pattern[i])) % mod\n        window = (window * base + ord(text[i])) % mod\n    hits = []\n    for i in range(len(text) - m + 1):\n        if window == target and text[i:i + m] == pattern:\n            hits.append(i)\n        if i + m < len(text):\n            window = (window - ord(text[i]) * power) % mod\n            window = (window * base + ord(text[i + m])) % mod\n    return hits\n\n\nprint(rabin_karp('abracadabra', 'abra'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why verify on hash equality?",
            reveal:
              "Different substrings can collide under a modulus. Verification ensures correctness when hashes match."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Never claim rolling hash equality is perfect without discussing collisions."
        }
      },
      {
        id: "lru-model",
        heading: "LRU is map lookup plus recency ordering",
        paragraphs: [
          "Least Recently Used caches need O(1) get and put: a hash map from key to node, plus a doubly linked list ordered by recency. On access, move the node to the front (most recent). On overflow, evict the tail (least recent).",
          "Python's OrderedDict offers move_to_end and popitem(last=False) as a compact model. Explicit nodes teach the structure interviewers expect you to describe.",
          "Clarify capacity edge cases: capacity 0, updating an existing key's value, and whether get on missing keys returns a sentinel."
        ],
        keyTerms: [
          {
            term: "LRU cache",
            definition:
              "A fixed-capacity cache that evicts the least recently used entry."
          },
          {
            term: "recency list",
            definition:
              "A doubly linked list ordered from most to least recently used."
          },
          {
            term: "OrderedDict",
            definition:
              "Python dict that remembers insertion order and supports move_to_end."
          }
        ],
        workedExample: {
          title: "LRU with OrderedDict",
          body:
            "move_to_end marks recency; popitem from the left evicts LRU.",
          code:
            "from collections import OrderedDict\n\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.data = OrderedDict()\n\n    def get(self, key):\n        if key not in self.data:\n            return -1\n        self.data.move_to_end(key)\n        return self.data[key]\n\n    def put(self, key, value):\n        if key in self.data:\n            self.data.move_to_end(key)\n        self.data[key] = value\n        if len(self.data) > self.capacity:\n            self.data.popitem(last=False)\n\n\ncache = LRUCache(2)\ncache.put(1, 1)\ncache.put(2, 2)\nprint(cache.get(1))\ncache.put(3, 3)\nprint(cache.get(2))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What must happen on both get hits and put updates?",
            reveal:
              "The key becomes most recently used—move it to the recency front (move_to_end in OrderedDict)."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Draw map plus doubly linked list before coding node pointers."
        }
      },
      {
        id: "cache-policies",
        heading: "LRU, LFU, and FIFO answer different access patterns",
        paragraphs: [
          "FIFO evicts the oldest insert regardless of reuse—simple but ignores hot keys. LRU evicts keys unused for the longest time—good for temporal locality. LFU evicts lowest frequency—good for stable popularity, trickier with ties and aging.",
          "Interview design questions ask which policy fits the workload. Scan-resistant caches may prefer LFU or ARC variants; session locality often likes LRU.",
          "Implement LRU solidly first. Mention LFU as a frequency map plus sets per count if the follow-up appears."
        ],
        keyTerms: [
          {
            term: "FIFO",
            definition:
              "Evict the earliest inserted item still in the cache."
          },
          {
            term: "LFU",
            definition:
              "Evict the item with the smallest access frequency."
          },
          {
            term: "temporal locality",
            definition:
              "Tendency for recently used items to be used again soon."
          }
        ],
        workedExample: {
          title: "LRU with explicit nodes",
          body:
            "Dummy head/tail simplify linking; map stores nodes for O(1) access.",
          code:
            "class Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.map = {}\n        self.head = Node()\n        self.tail = Node()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_front(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key):\n        if key not in self.map:\n            return -1\n        node = self.map[key]\n        self._remove(node)\n        self._add_front(node)\n        return node.val\n\n    def put(self, key, value):\n        if key in self.map:\n            node = self.map[key]\n            node.val = value\n            self._remove(node)\n            self._add_front(node)\n            return\n        node = Node(key, value)\n        self.map[key] = node\n        self._add_front(node)\n        if len(self.map) > self.capacity:\n            lru = self.tail.prev\n            self._remove(lru)\n            del self.map[lru.key]\n\n\ncache = LRUCache(2)\ncache.put(1, 1)\ncache.put(2, 2)\nprint(cache.get(1))\ncache.put(3, 3)\nprint(cache.get(2), cache.get(1))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why use dummy head and tail nodes?",
            reveal:
              "They remove null edge cases when adding to the front or removing the true LRU at the end."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Policy choice is a product decision: describe the access pattern, then name LRU/LFU/FIFO."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "XOR cancels pairs to find unpaired values in O(1) space.",
        "Bitmasks and popcount compact small-set state and Hamming checks.",
        "Rolling hashes slide windows quickly but need collision verification.",
        "LRU combines a hash map with a recency list for O(1) ops.",
        "Cache policies match different locality and frequency assumptions."
      ],
      nextSteps: [
        "Implement single-number and hamming-distance drills from scratch.",
        "Trace Rabin-Karp hash updates on a four-character window.",
        "Code LRU both with OrderedDict and with explicit nodes."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaInterviewEssentialsLabChapters = JSON.parse(JSON.stringify(chapters));
