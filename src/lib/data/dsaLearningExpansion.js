/**
 * Pedagogical DSA learning expansion modules.
 *
 * These are concept-first lessons, not generated practice lessons. They are
 * shaped like the HLD/AI lesson data so they can be merged into a curriculum
 * flow without relying on question-bank practice builders.
 */
export const rawDsaLearningModules = [
  {
    slug: 'dsa-concepts-lab',
    title: 'DSA concepts lab',
    summary:
      'Build durable mental models for algorithmic complexity, memory behavior, hashing, trees, and graphs before jumping into timed coding drills.',
    objectives: [
      'Explain Big-O with concrete Python operations and input-growth intuition',
      'Choose data structures based on access patterns, mutation cost, and memory locality',
      'Model tree and graph problems with representations that make traversal simple'
    ],
    lessons: [
      {
        slug: 'complexity-and-algorithmic-thinking',
        title: 'Complexity and algorithmic thinking',
        summary:
          'Big-O intuition, amortized analysis, and data-structure choice using small Python examples you can reason about at interview speed.',
        duration: '30-40 min',
        whyItMatters:
          'Interviewers are testing whether you can predict how a solution grows before coding it. Complexity analysis turns implementation choices into a defendable trade-off instead of a guess.',
        sections: [
          {
            heading: 'Big-O as a growth story',
            body:
              'Big-O describes the dominant growth term as inputs get large. It ignores constants so you can compare algorithms by how many extra steps each new input item creates.',
            bullets: [
              'O(1) work stays bounded even as n grows.',
              'O(log n) repeatedly cuts the search space, as in binary search.',
              'O(n), O(n log n), and O(n^2) usually map to one scan, divide-and-conquer work per level, and nested pairwise work.'
            ],
            codeExample: {
              title: 'Counting operation growth',
              language: 'python',
              code: [
                'def linear_scan(values, target):',
                '    checks = 0',
                '    for value in values:',
                '        checks += 1',
                '        if value == target:',
                '            return True, checks',
                '    return False, checks',
                '',
                'def pair_scan(values):',
                '    checks = 0',
                '    pairs = []',
                '    for i in range(len(values)):',
                '        for j in range(i + 1, len(values)):',
                '            checks += 1',
                '            pairs.append((values[i], values[j]))',
                '    return pairs, checks',
                '',
                'for n in [4, 8, 16]:',
                '    data = list(range(n))',
                '    print(n, linear_scan(data, -1)[1], pair_scan(data)[1])'
              ].join('\n')
            }
          },
          {
            heading: 'Amortized analysis',
            body:
              'Amortized analysis spreads occasional expensive work over many cheap operations. Python lists usually append in O(1) amortized time because rare resizes buy capacity for future appends.',
            bullets: [
              'Worst-case append can copy the whole underlying array during resize.',
              'Across many appends, each item is copied only a small bounded number of times.',
              'Amortized guarantees are useful when latency spikes are acceptable but average throughput matters.'
            ],
            codeExample: {
              title: 'A tiny dynamic array model',
              language: 'python',
              code: [
                'class TinyArray:',
                '    def __init__(self):',
                '        self.capacity = 1',
                '        self.size = 0',
                '        self.moves = 0',
                '',
                '    def append(self):',
                '        if self.size == self.capacity:',
                '            self.moves += self.size',
                '            self.capacity *= 2',
                '        self.size += 1',
                '',
                'array = TinyArray()',
                'for _ in range(20):',
                '    array.append()',
                '    print(f"size={array.size:2d} capacity={array.capacity:2d} copied={array.moves}")'
              ].join('\n')
            }
          },
          {
            heading: 'Choosing the structure first',
            body:
              'Before coding, name the operations the prompt requires: lookup, ordered iteration, minimum extraction, neighbor traversal, or range query. The best data structure is usually the one that makes the hottest operation cheap.',
            bullets: [
              'Use dictionaries and sets for membership and counting.',
              'Use heaps when you repeatedly need the next smallest or largest item.',
              'Use arrays/lists when index access and cache-friendly scans dominate.'
            ]
          }
        ],
        checklist: [
          'Can explain O(1), O(log n), O(n), O(n log n), and O(n^2) with examples.',
          'Can distinguish worst-case from amortized cost.',
          'Can name the dominant operation before choosing a data structure.'
        ],
        pitfalls: [
          'Treating Big-O as memorized labels instead of a growth comparison.',
          'Forgetting that hash-based structures trade ordering for fast lookup.',
          'Optimizing constants before confirming the asymptotic bottleneck.'
        ],
        interviewPrompts: [
          'Teach back why appending to a dynamic array is amortized O(1).',
          'Given a prompt with frequent membership checks, what structure would you choose and why?',
          'When would an O(n log n) sort-first approach beat an O(n) hash-map approach in practice?'
        ],
        diagram: null,
        related: ['hash-tables-and-memory-layout', 'sorting-and-divide-and-conquer']
      },
      {
        slug: 'hash-tables-and-memory-layout',
        title: 'Hash tables and memory layout',
        summary:
          'Hashing, collisions, load factor, and the practical trade-off between cache-friendly arrays and pointer-heavy linked structures.',
        duration: '30-40 min',
        whyItMatters:
          'Hash tables power many optimal interview solutions, but strong candidates can also explain why collisions, resizing, and memory locality affect real performance.',
        sections: [
          {
            heading: 'Hashing and buckets',
            body:
              'A hash function maps a key to a numeric code, and the table maps that code into a bucket. Good hashing distributes keys evenly so lookup stays close to O(1).',
            bullets: [
              'Collisions happen when multiple keys land in the same bucket.',
              'Separate chaining stores colliding entries in a bucket list; open addressing probes for another slot.',
              'Correctness also requires equality checks because equal hash buckets do not imply equal keys.'
            ],
            codeExample: {
              title: 'Visualizing collisions',
              language: 'python',
              code: [
                'def bucket_index(key, bucket_count):',
                '    return sum(ord(ch) for ch in key) % bucket_count',
                '',
                'keys = ["cat", "act", "tac", "dog", "god", "bird"]',
                'buckets = [[] for _ in range(5)]',
                '',
                'for key in keys:',
                '    buckets[bucket_index(key, len(buckets))].append(key)',
                '',
                'for index, bucket in enumerate(buckets):',
                '    print(f"bucket {index}: {bucket}")'
              ].join('\n')
            }
          },
          {
            heading: 'Load factor and resizing',
            body:
              'Load factor is items divided by buckets. As it rises, collisions become more likely, so tables resize and rehash entries to restore space.',
            bullets: [
              'Lower load factor usually means faster lookups and more memory.',
              'Resizing is expensive in the moment but amortized across many inserts.',
              'Sets and dictionaries are ideal when order is irrelevant and equality lookup dominates.'
            ],
            codeExample: {
              title: 'Frequency map with direct lookup',
              language: 'python',
              code: [
                'def first_repeated_word(words):',
                '    seen = set()',
                '    for word in words:',
                '        if word in seen:',
                '            return word',
                '        seen.add(word)',
                '    return None',
                '',
                'sentence = "hash tables make repeated lookup cheap because lookup is the point"',
                'print(first_repeated_word(sentence.split()))'
              ].join('\n')
            }
          },
          {
            heading: 'Memory layout in practice',
            body:
              'Arrays keep neighboring values close in memory, which helps CPU caches. Linked structures make insertion and deletion flexible but add pointer chasing and per-node overhead.',
            bullets: [
              'A Python list scan often has excellent locality even when asymptotics match another approach.',
              'Linked lists shine when you already hold the node reference and need local rewiring.',
              'Hash tables use extra memory to buy fast average-case lookup.'
            ]
          }
        ],
        checklist: [
          'Can describe how a key becomes a bucket index.',
          'Can explain collisions and why equality checks still matter.',
          'Can compare cache locality in arrays with pointer chasing in linked structures.'
        ],
        pitfalls: [
          'Saying dictionary operations are always O(1) without mentioning average-case assumptions.',
          'Ignoring memory cost when replacing scans with hash maps.',
          'Choosing linked lists for theoretical insertion speed when traversal dominates.'
        ],
        interviewPrompts: [
          'What happens to a hash table as load factor increases?',
          'Why can an array outperform a linked list even when both perform one pass?',
          'How would you handle a custom object as a dictionary key?'
        ],
        diagram: null,
        related: ['complexity-and-algorithmic-thinking', 'trees-graphs-mental-models']
      },
      {
        slug: 'trees-graphs-mental-models',
        title: 'Trees and graphs mental models',
        summary:
          'Represent trees and graphs clearly, choose adjacency lists or matrices, and rehearse BFS/DFS traversal templates in Python.',
        duration: '35-45 min',
        whyItMatters:
          'Many hard-looking problems become approachable once you model state as nodes and edges. Representation choice decides whether traversal is simple or awkward.',
        sections: [
          {
            heading: 'Trees are constrained graphs',
            body:
              'A tree is connected and acyclic, often with parent-child direction. A graph may have cycles, multiple components, weighted edges, or directed relationships.',
            bullets: [
              'Tree DFS usually passes information up or down the call stack.',
              'Graph traversal usually needs a visited set to avoid cycles.',
              'DAGs unlock topological ordering because edges define prerequisites without cycles.'
            ],
            codeExample: {
              title: 'Tree DFS with returned state',
              language: 'python',
              code: [
                'class Node:',
                '    def __init__(self, value, left=None, right=None):',
                '        self.value = value',
                '        self.left = left',
                '        self.right = right',
                '',
                'def height(root):',
                '    if root is None:',
                '        return 0',
                '    return 1 + max(height(root.left), height(root.right))',
                '',
                'tree = Node(1, Node(2, Node(4), Node(5)), Node(3))',
                'print(height(tree))'
              ].join('\n')
            }
          },
          {
            heading: 'Adjacency list versus matrix',
            body:
              'An adjacency list stores only existing edges and is usually best for sparse graphs. An adjacency matrix makes edge existence checks O(1) but costs O(V^2) memory.',
            bullets: [
              'Use adjacency lists for social graphs, dependency graphs, and grids converted to neighbors.',
              'Use matrices when the graph is dense or constant-time edge lookup is central.',
              'Weighted graphs often store each neighbor as a pair: (neighbor, weight).'
            ],
            codeExample: {
              title: 'Build adjacency representations',
              language: 'python',
              code: [
                'edges = [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D")]',
                'nodes = sorted({node for edge in edges for node in edge})',
                '',
                'adj_list = {node: [] for node in nodes}',
                'for src, dst in edges:',
                '    adj_list[src].append(dst)',
                '',
                'index = {node: i for i, node in enumerate(nodes)}',
                'matrix = [[False] * len(nodes) for _ in nodes]',
                'for src, dst in edges:',
                '    matrix[index[src]][index[dst]] = True',
                '',
                'print(adj_list)',
                'print(matrix[index["A"]][index["C"]])'
              ].join('\n')
            }
          },
          {
            heading: 'BFS and DFS templates',
            body:
              'BFS explores by distance from the start node, while DFS explores one path deeply before backtracking. Pick based on the question: shortest unweighted path usually wants BFS; exhaustive search or component discovery often wants DFS.',
            bullets: [
              'BFS queue order naturally produces levels.',
              'DFS recursion is concise but can hit recursion limits on very deep graphs.',
              'Both need a visited set for cyclic graphs.'
            ],
            codeExample: {
              title: 'Traversal templates',
              language: 'python',
              code: [
                'from collections import deque',
                '',
                'graph = {',
                '    "A": ["B", "C"],',
                '    "B": ["D"],',
                '    "C": ["D"],',
                '    "D": []',
                '}',
                '',
                'def bfs(start):',
                '    seen = {start}',
                '    queue = deque([start])',
                '    order = []',
                '    while queue:',
                '        node = queue.popleft()',
                '        order.append(node)',
                '        for nxt in graph[node]:',
                '            if nxt not in seen:',
                '                seen.add(nxt)',
                '                queue.append(nxt)',
                '    return order',
                '',
                'def dfs(node, seen=None, order=None):',
                '    seen = seen or set()',
                '    order = order or []',
                '    seen.add(node)',
                '    order.append(node)',
                '    for nxt in graph[node]:',
                '        if nxt not in seen:',
                '            dfs(nxt, seen, order)',
                '    return order',
                '',
                'print("BFS", bfs("A"))',
                'print("DFS", dfs("A"))'
              ].join('\n')
            }
          }
        ],
        checklist: [
          'Can tell when a prompt is tree-specific versus general graph traversal.',
          'Can choose adjacency list or matrix from density and lookup requirements.',
          'Can write BFS and DFS templates from memory.'
        ],
        pitfalls: [
          'Forgetting visited tracking on graphs with cycles.',
          'Using a matrix for sparse graphs and wasting O(V^2) memory.',
          'Choosing DFS for shortest path in an unweighted graph when BFS is simpler.'
        ],
        interviewPrompts: [
          'Explain why a tree does not usually need a visited set but a graph does.',
          'When would an adjacency matrix be a good trade-off?',
          'Teach back the difference between BFS levels and DFS recursion depth.'
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
          'Merge sort, quicksort intuition, recursion trees, and the moments where sorting first makes a problem easier to solve.',
        duration: '35-45 min',
        whyItMatters:
          'Sorting is both a tool and a signal. It can expose order, adjacency, and two-pointer structure that is hard to see in the raw input.',
        sections: [
          {
            heading: 'Merge sort as balanced decomposition',
            body:
              'Merge sort splits the array in half, solves each half, and combines sorted halves in linear time. The recursion tree has log n levels and O(n) merge work per level.',
            bullets: [
              'Stable sorting preserves relative order of equal elements.',
              'The combine step is where most divide-and-conquer algorithms earn their efficiency.',
              'O(n log n) appears when each level touches all n items and there are log n levels.'
            ],
            codeExample: {
              title: 'Merge sort in Python',
              language: 'python',
              code: [
                'def merge_sort(values):',
                '    if len(values) <= 1:',
                '        return values[:]',
                '    mid = len(values) // 2',
                '    left = merge_sort(values[:mid])',
                '    right = merge_sort(values[mid:])',
                '    return merge(left, right)',
                '',
                'def merge(left, right):',
                '    result = []',
                '    i = j = 0',
                '    while i < len(left) and j < len(right):',
                '        if left[i] <= right[j]:',
                '            result.append(left[i])',
                '            i += 1',
                '        else:',
                '            result.append(right[j])',
                '            j += 1',
                '    return result + left[i:] + right[j:]',
                '',
                'print(merge_sort([5, 2, 9, 1, 5, 6]))'
              ].join('\n')
            }
          },
          {
            heading: 'Quicksort and partitioning',
            body:
              'Quicksort chooses a pivot and partitions values around it. Average performance is O(n log n), but poor pivot choices can create an O(n^2) recursion tree.',
            bullets: [
              'Partitioning is useful beyond sorting: quickselect finds the kth element without fully sorting.',
              'Randomized pivots reduce the chance of consistently bad splits.',
              'In-place partitioning saves memory but demands careful boundary handling.'
            ],
            codeExample: {
              title: 'Partition around a pivot',
              language: 'python',
              code: [
                'def partition(values, pivot):',
                '    lows, equals, highs = [], [], []',
                '    for value in values:',
                '        if value < pivot:',
                '            lows.append(value)',
                '        elif value > pivot:',
                '            highs.append(value)',
                '        else:',
                '            equals.append(value)',
                '    return lows, equals, highs',
                '',
                'data = [9, 3, 7, 3, 2, 8, 5]',
                'print(partition(data, pivot=5))'
              ].join('\n')
            }
          },
          {
            heading: 'When sort-first helps',
            body:
              'Sorting can turn a hard global search into local checks. Intervals become ordered by start time, duplicates become adjacent, and two-pointer scans become possible.',
            bullets: [
              'Sort intervals before merging or checking overlaps.',
              'Sort numeric arrays before two-sum variants when memory is constrained.',
              'Do not sort if original order is part of the required answer.'
            ]
          }
        ],
        checklist: [
          'Can draw the recursion tree for merge sort and explain O(n log n).',
          'Can describe why quicksort has average and worst-case differences.',
          'Can identify prompts where sorting reveals a simpler invariant.'
        ],
        pitfalls: [
          'Sorting away information when original order matters.',
          'Claiming quicksort is always O(n log n) without worst-case context.',
          'Writing recursive slice-heavy code in Python without acknowledging extra memory.'
        ],
        interviewPrompts: [
          'Why does merge sort do O(n) work at each recursion level?',
          'How would you make quicksort less vulnerable to already sorted input?',
          'Give two examples where sorting first simplifies the rest of the algorithm.'
        ],
        diagram: null,
        related: ['complexity-and-algorithmic-thinking', 'dynamic-programming-cookbook']
      },
      {
        slug: 'shortest-paths-and-union-find',
        title: 'Shortest paths and Union-Find',
        summary:
          'Dijkstra intuition for weighted shortest paths and Union-Find with path compression for connectivity and component merging.',
        duration: '40-50 min',
        whyItMatters:
          'Graph interviews often ask either "what is the cheapest route?" or "are these things connected?" Dijkstra and Union-Find answer different questions cleanly.',
        sections: [
          {
            heading: 'Dijkstra as best-first expansion',
            body:
              'Dijkstra repeatedly expands the currently cheapest known frontier node. With non-negative edge weights, once a node is popped from the min-heap, its shortest distance is final.',
            bullets: [
              'Use BFS for unweighted shortest paths; use Dijkstra when weights are non-negative.',
              'A min-heap keeps the next most promising node cheap to retrieve.',
              'Negative weights break the greedy finalization property.'
            ],
            codeExample: {
              title: 'Dijkstra with heapq',
              language: 'python',
              code: [
                'import heapq',
                '',
                'def dijkstra(graph, start):',
                '    distances = {node: float("inf") for node in graph}',
                '    distances[start] = 0',
                '    heap = [(0, start)]',
                '',
                '    while heap:',
                '        distance, node = heapq.heappop(heap)',
                '        if distance != distances[node]:',
                '            continue',
                '        for neighbor, weight in graph[node]:',
                '            candidate = distance + weight',
                '            if candidate < distances[neighbor]:',
                '                distances[neighbor] = candidate',
                '                heapq.heappush(heap, (candidate, neighbor))',
                '    return distances',
                '',
                'graph = {',
                '    "A": [("B", 4), ("C", 1)],',
                '    "B": [("D", 1)],',
                '    "C": [("B", 2), ("D", 5)],',
                '    "D": []',
                '}',
                'print(dijkstra(graph, "A"))'
              ].join('\n')
            }
          },
          {
            heading: 'Union-Find for connectivity',
            body:
              'Union-Find tracks components under merge operations. Path compression flattens parent pointers during find, and union by rank keeps trees shallow.',
            bullets: [
              'Use it for connected components, cycle detection in undirected graphs, and Kruskal-style MST reasoning.',
              'It answers connectivity quickly but does not produce shortest paths.',
              'Path compression makes repeated operations extremely close to constant time in practice.'
            ],
            codeExample: {
              title: 'Union-Find with path compression',
              language: 'python',
              code: [
                'class UnionFind:',
                '    def __init__(self, values):',
                '        self.parent = {value: value for value in values}',
                '        self.rank = {value: 0 for value in values}',
                '',
                '    def find(self, value):',
                '        if self.parent[value] != value:',
                '            self.parent[value] = self.find(self.parent[value])',
                '        return self.parent[value]',
                '',
                '    def union(self, a, b):',
                '        root_a = self.find(a)',
                '        root_b = self.find(b)',
                '        if root_a == root_b:',
                '            return False',
                '        if self.rank[root_a] < self.rank[root_b]:',
                '            root_a, root_b = root_b, root_a',
                '        self.parent[root_b] = root_a',
                '        if self.rank[root_a] == self.rank[root_b]:',
                '            self.rank[root_a] += 1',
                '        return True',
                '',
                'uf = UnionFind(range(5))',
                'for edge in [(0, 1), (1, 2), (3, 4)]:',
                '    uf.union(*edge)',
                'print(uf.find(0) == uf.find(2))',
                'print(uf.find(0) == uf.find(4))'
              ].join('\n')
            }
          },
          {
            heading: 'Choosing between them',
            body:
              'Ask what changes over time. If the problem adds edges and asks whether nodes are connected, Union-Find is a fit. If it asks for least total cost from a source through weighted edges, Dijkstra is the fit.',
            bullets: [
              'Dijkstra computes distances from a source.',
              'Union-Find maintains components across unions.',
              'Neither handles every graph problem; topological sort, Bellman-Ford, and Floyd-Warshall cover different constraints.'
            ]
          }
        ],
        checklist: [
          'Can explain why Dijkstra requires non-negative weights.',
          'Can implement Union-Find with path compression and union by rank.',
          'Can choose connectivity tracking versus shortest-path search.'
        ],
        pitfalls: [
          'Using Union-Find when path length or path cost matters.',
          'Using Dijkstra on graphs with negative edge weights.',
          'Forgetting to ignore stale heap entries in a Python Dijkstra implementation.'
        ],
        interviewPrompts: [
          'Why is BFS enough for unweighted shortest path but not weighted shortest path?',
          'Teach back path compression and why it speeds future finds.',
          'How would you detect whether adding an undirected edge creates a cycle?'
        ],
        diagram: null,
        related: ['trees-graphs-mental-models', 'dynamic-programming-cookbook']
      },
      {
        slug: 'dynamic-programming-cookbook',
        title: 'Dynamic programming cookbook',
        summary:
          'A pattern catalog for knapsack, LIS, and grid paths, with memoization and tabulation templates in Python.',
        duration: '45-55 min',
        whyItMatters:
          'Dynamic programming stops feeling mysterious when you consistently name the state, transition, base case, and fill order.',
        sections: [
          {
            heading: 'Memoization template',
            body:
              'Top-down memoization starts from the question you want answered and caches overlapping subproblems. It is often the fastest way to discover the recurrence.',
            bullets: [
              'State should contain exactly the information needed to determine future choices.',
              'Base cases stop recursion at known answers.',
              'The recurrence combines smaller states into the current answer.'
            ],
            codeExample: {
              title: '0/1 knapsack with memoization',
              language: 'python',
              code: [
                'from functools import lru_cache',
                '',
                'def knapsack(weights, values, capacity):',
                '    @lru_cache(maxsize=None)',
                '    def best(index, remaining):',
                '        if index == len(weights) or remaining == 0:',
                '            return 0',
                '        skip = best(index + 1, remaining)',
                '        take = 0',
                '        if weights[index] <= remaining:',
                '            take = values[index] + best(index + 1, remaining - weights[index])',
                '        return max(skip, take)',
                '',
                '    return best(0, capacity)',
                '',
                'print(knapsack([2, 3, 4], [4, 5, 6], 5))'
              ].join('\n')
            }
          },
          {
            heading: 'Tabulation template',
            body:
              'Bottom-up tabulation fills smaller states before larger ones. It makes memory and fill order explicit, which is useful when recursion depth or cache overhead is a concern.',
            bullets: [
              'Grid path DP often fills from top-left to bottom-right.',
              'One-dimensional DP can sometimes replace a two-dimensional table.',
              'State compression is a follow-up optimization after the full table is correct.'
            ],
            codeExample: {
              title: 'Grid paths with obstacles',
              language: 'python',
              code: [
                'def count_paths(grid):',
                '    rows, cols = len(grid), len(grid[0])',
                '    dp = [[0] * cols for _ in range(rows)]',
                '    dp[0][0] = 0 if grid[0][0] == 1 else 1',
                '',
                '    for r in range(rows):',
                '        for c in range(cols):',
                '            if grid[r][c] == 1 or (r == 0 and c == 0):',
                '                continue',
                '            from_top = dp[r - 1][c] if r > 0 else 0',
                '            from_left = dp[r][c - 1] if c > 0 else 0',
                '            dp[r][c] = from_top + from_left',
                '    return dp[-1][-1]',
                '',
                'print(count_paths([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))'
              ].join('\n')
            }
          },
          {
            heading: 'Pattern catalog',
            body:
              'Common DP families differ by what the state represents: remaining capacity, best subsequence ending here, grid coordinates, interval boundaries, or bitmask of chosen items.',
            bullets: [
              'Knapsack: choose or skip an item under a constraint.',
              'LIS: best increasing subsequence ending at each position, or patience sorting for O(n log n).',
              'Grid paths: ways or cost to reach a cell from allowed predecessors.'
            ],
            codeExample: {
              title: 'Longest increasing subsequence in O(n^2)',
              language: 'python',
              code: [
                'def lis_length(values):',
                '    if not values:',
                '        return 0',
                '    dp = [1] * len(values)',
                '    for i in range(len(values)):',
                '        for j in range(i):',
                '            if values[j] < values[i]:',
                '                dp[i] = max(dp[i], dp[j] + 1)',
                '    return max(dp)',
                '',
                'print(lis_length([10, 9, 2, 5, 3, 7, 101, 18]))'
              ].join('\n')
            }
          }
        ],
        checklist: [
          'Can state DP state, transition, base cases, and answer extraction.',
          'Can choose memoization for recurrence discovery and tabulation for fill-order control.',
          'Can recognize knapsack, LIS, and grid-path families.'
        ],
        pitfalls: [
          'Adding unnecessary dimensions to the state.',
          'Filling a table before proving the recurrence.',
          'Optimizing space before the uncompressed version is correct.'
        ],
        interviewPrompts: [
          'Teach back the difference between memoization and tabulation.',
          'How do you decide what belongs in a DP state?',
          'Why is LIS a dynamic-programming problem, and what does each dp[i] mean?'
        ],
        diagram: null,
        related: ['sorting-and-divide-and-conquer', 'shortest-paths-and-union-find']
      }
    ]
  }
];
