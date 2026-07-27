const chapters = {
  "dsa-algorithms-lab/sorting-and-divide-and-conquer": {
    title: "Chapter: Sorting and divide and conquer",
    readingTime: "80-100 min",
    premise:
      "Sorting and divide-and-conquer share a habit: split work, solve pieces, combine answers, and read complexity from the recursion tree. This chapter covers merge sort, quickselect, inversions, and when comparison sorts stop being the right tool.",
    parts: [
      {
        id: "recurrence-shape",
        heading: "Derive cost from the recursion tree",
        paragraphs: [
          "Divide-and-conquer analysis starts with three questions: how many subproblems, how large, and how much combine work. Merge sort creates two halves and merges in O(n), so T(n) = 2T(n/2) + O(n). There are log n levels and each level processes n elements total, giving O(n log n). Binary search keeps one half with O(1) work: T(n) = T(n/2) + O(1) = O(log n).",
          "Changing one term changes the class. More subproblems raise the exponent. Overlapping subproblems without memoization explode. Do not say recursive means logarithmic or divide-and-conquer means n log n. Derive from work per level times number of levels.",
          "Interview narration should sketch the tree: width, depth, and cost across a level. That sketch is often enough to compare candidates before coding."
        ],
        keyTerms: [
          {
            term: "divide and conquer",
            definition:
              "An algorithmic pattern that splits a problem, solves parts, and combines results."
          },
          {
            term: "recurrence",
            definition:
              "An equation relating T(n) to costs of smaller instances plus combine work."
          },
          {
            term: "recursion tree",
            definition:
              "A visual accounting of subproblem sizes and work across levels."
          }
        ],
        workedExample: {
          title: "Merge sort with a stable merge",
          body:
            "Equal keys take from the left run first so relative order is preserved.",
          code:
            "def merge_sort(values):\n    if len(values) <= 1:\n        return values[:]\n    mid = len(values) // 2\n    left = merge_sort(values[:mid])\n    right = merge_sort(values[mid:])\n    return merge(left, right)\n\n\ndef merge(left, right):\n    i = j = 0\n    out = []\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            out.append(left[i])\n            i += 1\n        else:\n            out.append(right[j])\n            j += 1\n    out.extend(left[i:])\n    out.extend(right[j:])\n    return out\n\n\nprint(merge_sort([5, 2, 4, 1, 3]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why is merge sort O(n log n) and not O(n)?",
            reveal:
              "There are about log n split levels, and every level merges a total of n elements. Product of depth and per-level work is O(n log n)."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Write the recurrence before claiming the Big-O. The equation is the proof sketch."
        }
      },
      {
        id: "stability-memory",
        heading: "Stability and memory are sorting constraints",
        paragraphs: [
          "A stable sort preserves relative order of equal keys. Multi-key sorts rely on it: sort by name, then stably by department, and names stay ordered inside departments. Merge sort is naturally stable when ties take from the left. Classic quicksort and heapsort are not stable without extra care.",
          "Memory differs. Array merge sort typically needs O(n) auxiliary space. In-place quicksort uses O(log n) average stack space but can degrade. Heapsort is O(1) extra space and O(n log n) worst case but often has weaker cache behavior. Library sorts are hybrids tuned for real machines.",
          "Choose under constraints: need stability, need worst-case guarantees, need low memory, or need practical speed. There is no single champion for every prompt."
        ],
        keyTerms: [
          {
            term: "stable sort",
            definition:
              "A sort that keeps the original order of records with equal keys."
          },
          {
            term: "auxiliary space",
            definition:
              "Extra memory beyond the input array used by the sorting algorithm."
          },
          {
            term: "hybrid sort",
            definition:
              "A practical sort that switches strategies by size or pattern, as many standard libraries do."
          }
        ],
        workedExample: {
          title: "Sort-first interval merging",
          body:
            "Sorting by start time lets a single scan merge overlaps.",
          code:
            "def merge_intervals(intervals):\n    if not intervals:\n        return []\n    intervals = sorted(intervals)\n    merged = [intervals[0][:]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged\n\n\nprint(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why sort intervals before merging?",
            reveal:
              "After sorting by start, any overlap with the current merged interval must appear next in order. Unsorted intervals would require comparing every pair."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "If the follow-up asks for stability, explain merge's left-first tie rule in one sentence."
        }
      },
      {
        id: "quickselect",
        heading: "Quickselect finds order statistics without full sorting",
        paragraphs: [
          "Sometimes you need the kth smallest or largest, not a fully sorted array. Quickselect partitions around a pivot like quicksort but recurses into only one side. Average time is O(n); worst case is O(n^2) with adversarial pivots. Random pivots make the bad case unlikely.",
          "Partition invariants matter. After partitioning, the pivot sits in its final sorted index. If that index is k, you are done. If it is larger, search left; if smaller, search right with an adjusted k. Mishandling equals can stall indices.",
          "For interviews, mention average versus worst case and when a heap approach might be clearer: maintain a size-k heap in O(n log k). Full sort is O(n log n) and simplest when you already need order."
        ],
        keyTerms: [
          {
            term: "order statistic",
            definition:
              "The kth smallest or largest element in a collection."
          },
          {
            term: "partition",
            definition:
              "Rearranging so elements on one side of a pivot satisfy a comparison invariant."
          },
          {
            term: "quickselect",
            definition:
              "A select algorithm that partitions and recurses into one side only."
          }
        ],
        workedExample: {
          title: "Quickselect kth smallest with random pivots",
          body:
            "Only one partition side continues; average linear scans dominate.",
          code:
            "import random\n\n\ndef quickselect(values, k):\n    def select(lo, hi, k):\n        if lo == hi:\n            return values[lo]\n        pivot_index = random.randint(lo, hi)\n        values[lo], values[pivot_index] = values[pivot_index], values[lo]\n        pivot = values[lo]\n        mid = lo\n        for i in range(lo + 1, hi + 1):\n            if values[i] < pivot:\n                mid += 1\n                values[mid], values[i] = values[i], values[mid]\n        values[lo], values[mid] = values[mid], values[lo]\n        rank = mid - lo\n        if k == rank:\n            return values[mid]\n        if k < rank:\n            return select(lo, mid - 1, k)\n        return select(mid + 1, hi, k - rank - 1)\n\n    return select(0, len(values) - 1, k)\n\n\ndata = [9, 1, 5, 3, 7, 2]\nprint(quickselect(data[:], 0), quickselect(data[:], 3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "How does quickselect differ from quicksort asymptotically on average?",
            reveal:
              "Quicksort sorts both sides for O(n log n). Quickselect continues on one side only, so expected work is n + n/2 + n/4 + ... = O(n)."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Always discuss pivot strategy when claiming linear-time selection."
        }
      },
      {
        id: "inversions",
        heading: "Divide-and-conquer can count while sorting",
        paragraphs: [
          "Inversion counting asks how many pairs i < j have a[i] > a[j]. Brute force is O(n^2). Merge sort counts split inversions during merge: when an element is taken from the right run, it is smaller than all remaining left-run elements, adding that many inversions at once.",
          "This pattern—augment the combine step—appears in other problems: closest pair, certain range queries, and teachable variants of merge. The sort is a vehicle for the count.",
          "Be careful with indices and duplicate policies. Clarify whether equal pairs count. Keep the merge stable if later tie behavior matters."
        ],
        keyTerms: [
          {
            term: "inversion",
            definition:
              "A pair of positions that are out of sorted order relative to each other."
          },
          {
            term: "split inversion",
            definition:
              "An inversion with one element in the left half and one in the right half."
          },
          {
            term: "augmented merge",
            definition:
              "A merge step that computes extra statistics while combining sorted runs."
          }
        ],
        workedExample: {
          title: "Count inversions with merge sort",
          body:
            "Right-run selections add the count of remaining left-run elements.",
          code:
            "def sort_and_count(values):\n    if len(values) <= 1:\n        return values[:], 0\n    mid = len(values) // 2\n    left, left_count = sort_and_count(values[:mid])\n    right, right_count = sort_and_count(values[mid:])\n    merged, split = merge_count(left, right)\n    return merged, left_count + right_count + split\n\n\ndef merge_count(left, right):\n    i = j = 0\n    out = []\n    split = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            out.append(left[i])\n            i += 1\n        else:\n            out.append(right[j])\n            split += len(left) - i\n            j += 1\n    out.extend(left[i:])\n    out.extend(right[j:])\n    return out, split\n\n\nprint(sort_and_count([2, 4, 1, 3, 5])[1])",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can the merge step count many inversions at once?",
            reveal:
              "Both halves are sorted. When right[j] is smaller than left[i], it is also smaller than every remaining left element after i, so those pairs are all inversions."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "When a brute pairwise count is too slow, ask whether sorting can batch the comparisons."
        }
      },
      {
        id: "non-comparison",
        heading: "Non-comparison sorts escape the n log n barrier",
        paragraphs: [
          "Comparison sorts need Ω(n log n) in the worst case to distinguish n! permutations. Counting sort and radix sort beat that bound only when keys have structure: small integer ranges or fixed-length digits. Counting sort is O(n + k) for keys in 0..k. If k is huge, it wastes memory and time.",
          "Use these when constraints fit: exam scores 0..100, bytes in a radix pass, compact enums. Arbitrary objects, huge ranges, or general comparisons return to comparison sorts or library defaults.",
          "Interview strength is naming the assumption you are breaking. Lower bounds come with models. Change the model with bounded keys, and a new family opens."
        ],
        keyTerms: [
          {
            term: "comparison lower bound",
            definition:
              "The Ω(n log n) limit for sorting by pairwise comparisons in the algebraic decision-tree model."
          },
          {
            term: "counting sort",
            definition:
              "A non-comparison sort using counts for keys in a limited integer range."
          },
          {
            term: "radix sort",
            definition:
              "A digit-by-digit sort that repeatedly applies a stable counting pass."
          }
        ],
        workedExample: {
          title: "Counting sort for small integer keys",
          body:
            "Counts become prefix positions; one output pass places each key.",
          code:
            "def counting_sort(values, max_key):\n    counts = [0] * (max_key + 1)\n    for value in values:\n        counts[value] += 1\n    for key in range(1, len(counts)):\n        counts[key] += counts[key - 1]\n    out = [0] * len(values)\n    for value in reversed(values):\n        counts[value] -= 1\n        out[counts[value]] = value\n    return out\n\n\nprint(counting_sort([4, 1, 3, 4, 0, 1], 4))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When is counting sort a bad idea despite being linear in n?",
            reveal:
              "When the key range k is enormous compared with n, because time and memory scale with k as well as n."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Mention the comparison lower bound, then say which key structure lets you leave that model."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Recurrence trees justify divide-and-conquer complexity.",
        "Stability and memory constraints guide sorting choice.",
        "Quickselect finds order statistics in expected linear time.",
        "Augmented merges can count inversions while sorting.",
        "Non-comparison sorts require bounded key structure."
      ],
      nextSteps: [
        "Trace merge sort levels on an eight-element array and tally work.",
        "Implement quickselect and compare against sorted(values)[k].",
        "Explain when you would pick heapsort, mergesort, or counting sort."
      ]
    }
  },

  "dsa-algorithms-lab/shortest-paths-and-union-find": {
    title: "Chapter: Shortest paths and Union-Find",
    readingTime: "80-100 min",
    premise:
      "Path algorithms encode weight assumptions; Union-Find answers connectivity without navigation. This chapter connects BFS, Dijkstra, relaxation, DSU, and Kruskal-style cycle tests.",
    parts: [
      {
        id: "weight-assumptions",
        heading: "Choose the path algorithm from edge-weight assumptions",
        paragraphs: [
          "BFS finds fewest edges, which equals shortest path only when every edge has equal cost. Dijkstra handles non-negative weights by finalizing the unsettled vertex with smallest tentative distance. Negative edges break that proof. Bellman-Ford relaxes edges repeatedly and can detect negative cycles. DAG shortest paths use topological order and allow negative edges without cycles.",
          "Special cases matter. Unweighted grids want BFS. Weights in {0, 1} want deque 0-1 BFS. Sparse non-negative graphs want Dijkstra with a heap. Reachable negative cycles mean some distances are undefined.",
          "The first interview question is not which template to paste. It is what edge costs can be."
        ],
        keyTerms: [
          {
            term: "relaxation",
            definition:
              "Updating dist[v] when dist[u] + weight(u, v) improves it."
          },
          {
            term: "non-negative weights",
            definition:
              "Edge costs >= 0; required for classic Dijkstra finalization proofs."
          },
          {
            term: "0-1 BFS",
            definition:
              "Deque search pushing 0-cost edges to the front and 1-cost edges to the back."
          }
        ],
        workedExample: {
          title: "BFS versus Dijkstra on weighted edges",
          body:
            "Equal-weight BFS distance disagrees with true weighted distance when costs differ.",
          code:
            "from collections import deque\nimport heapq\n\n\ndef bfs_hops(graph, src):\n    dist = {src: 0}\n    queue = deque([src])\n    while queue:\n        u = queue.popleft()\n        for v, _w in graph[u]:\n            if v not in dist:\n                dist[v] = dist[u] + 1\n                queue.append(v)\n    return dist\n\n\ndef dijkstra(graph, src):\n    dist = {src: 0}\n    heap = [(0, src)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d != dist.get(u):\n            continue\n        for v, w in graph[u]:\n            nd = d + w\n            if nd < dist.get(v, float('inf')):\n                dist[v] = nd\n                heapq.heappush(heap, (nd, v))\n    return dist\n\n\ngraph = {0: [(1, 1), (2, 10)], 1: [(2, 1)], 2: []}\nprint('hops', bfs_hops(graph, 0))\nprint('weighted', dijkstra(graph, 0))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why can negative edges break Dijkstra?",
            reveal:
              "Dijkstra finalizes a node when it looks closest. A later negative edge could improve a finalized distance, violating the invariant."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "State weight assumptions before naming BFS, Dijkstra, or Bellman-Ford."
        }
      },
      {
        id: "dijkstra-heap",
        heading: "Dijkstra is a priority frontier with stale-entry skipping",
        paragraphs: [
          "Initialize dist[source] = 0 and others to infinity. Push (distance, vertex) into a min-heap. Pop the smallest tentative distance. If it does not match the current dist[u], it is stale—skip it. Otherwise relax neighbors and push improved distances.",
          "Multiple heap entries per vertex are normal in the lazy heap approach. They keep the code simple at the cost of extra log factors in practice. Decrease-key heaps are cleaner in theory but awkward in Python's heapq.",
          "Store parents on successful relaxations if you need the path. Complexity with a binary heap and adjacency lists is O((V + E) log V) with lazy pushes."
        ],
        keyTerms: [
          {
            term: "tentative distance",
            definition:
              "The best path cost found so far to a vertex, not necessarily final."
          },
          {
            term: "stale heap entry",
            definition:
              "An older (distance, vertex) pair whose distance is no longer optimal."
          },
          {
            term: "parent pointer",
            definition:
              "The predecessor used to reconstruct a shortest path tree."
          }
        ],
        workedExample: {
          title: "Dijkstra with path reconstruction",
          body:
            "Parents record the last improving edge; walk backward from the target.",
          code:
            "import heapq\nfrom collections import defaultdict\n\n\ndef dijkstra_path(n, edges, src, dst):\n    graph = defaultdict(list)\n    for u, v, w in edges:\n        graph[u].append((v, w))\n    dist = [float('inf')] * n\n    parent = [-1] * n\n    dist[src] = 0\n    heap = [(0, src)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d != dist[u]:\n            continue\n        for v, w in graph[u]:\n            nd = d + w\n            if nd < dist[v]:\n                dist[v] = nd\n                parent[v] = u\n                heapq.heappush(heap, (nd, v))\n    if dist[dst] == float('inf'):\n        return None, None\n    path = []\n    cur = dst\n    while cur != -1:\n        path.append(cur)\n        cur = parent[cur]\n    path.reverse()\n    return dist[dst], path\n\n\nprint(dijkstra_path(4, [(0, 1, 1), (1, 2, 2), (0, 2, 5), (2, 3, 1)], 0, 3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What does it mean when a popped heap distance exceeds dist[u]?",
            reveal:
              "A better path to u was found earlier, so this entry is obsolete and should be skipped."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Print dist after each successful pop while learning; the finalized prefix should only grow."
        }
      },
      {
        id: "union-find",
        heading: "Union-Find tracks components, not paths",
        paragraphs: [
          "Disjoint-set union (Union-Find) answers whether elements share a component. find(x) returns a representative; union(a, b) merges components. It shines for cycle detection when adding undirected edges, counting components, and equivalence-class problems like shared emails.",
          "It does not give the path between nodes, shortest distances, or easy deletions. Use it for connectivity, not navigation. Path compression flattens trees during find. Union by rank or size keeps trees shallow. Together, operations are effectively constant for practical sizes.",
          "Interview code should implement find with compression and union by rank. Explain alpha(n) only if asked; saying nearly O(1) amortized is usually enough."
        ],
        keyTerms: [
          {
            term: "disjoint-set union",
            definition:
              "A structure maintaining a partition of elements into connected components."
          },
          {
            term: "path compression",
            definition:
              "Pointing nodes directly at the root during find to flatten future queries."
          },
          {
            term: "union by rank",
            definition:
              "Attaching the shallower tree under the deeper one during merge."
          }
        ],
        workedExample: {
          title: "Union-Find with path compression and rank",
          body:
            "find flattens; union attaches by rank and counts merges.",
          code:
            "class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n        self.components = n\n\n    def find(self, x):\n        if self.parent[x] != x:\n            self.parent[x] = self.find(self.parent[x])\n        return self.parent[x]\n\n    def union(self, a, b):\n        ra, rb = self.find(a), self.find(b)\n        if ra == rb:\n            return False\n        if self.rank[ra] < self.rank[rb]:\n            ra, rb = rb, ra\n        self.parent[rb] = ra\n        if self.rank[ra] == self.rank[rb]:\n            self.rank[ra] += 1\n        self.components -= 1\n        return True\n\n\nuf = UnionFind(5)\nfor a, b in [(0, 1), (1, 2), (3, 4)]:\n    uf.union(a, b)\nprint(uf.components, uf.find(0) == uf.find(2), uf.find(0) == uf.find(3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What does union returning False usually mean in cycle detection?",
            reveal:
              "Both endpoints were already in the same component, so adding the undirected edge would create a cycle."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "Do not use Union-Find when the interviewer asks for the actual path or distances."
        }
      },
      {
        id: "kruskal",
        heading: "Kruskal uses Union-Find as a cycle test",
        paragraphs: [
          "Kruskal builds a minimum spanning tree by sorting edges by weight and adding an edge when it connects different components. Union-Find provides the test: same root means skip; different roots means union and take the edge. Sorting usually dominates at O(E log E).",
          "The cut property justifies greed: the cheapest edge crossing a cut is safe for some MST. Kruskal's components define those cuts as the algorithm proceeds.",
          "This pairing is a model interview story: algorithm need is connectivity under chosen edges; data structure is DSU; sort supplies order."
        ],
        keyTerms: [
          {
            term: "minimum spanning tree",
            definition:
              "A subset of edges connecting all vertices with minimum total weight and no cycles."
          },
          {
            term: "cut property",
            definition:
              "The lightest edge across a cut belongs to some MST."
          },
          {
            term: "Kruskal's algorithm",
            definition:
              "Sort edges and add if endpoints are in different DSU components."
          }
        ],
        workedExample: {
          title: "Kruskal MST total weight",
          body:
            "Accept edges that merge components until V - 1 edges are chosen.",
          code:
            "class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n\n    def find(self, x):\n        if self.parent[x] != x:\n            self.parent[x] = self.find(self.parent[x])\n        return self.parent[x]\n\n    def union(self, a, b):\n        ra, rb = self.find(a), self.find(b)\n        if ra == rb:\n            return False\n        if self.rank[ra] < self.rank[rb]:\n            ra, rb = rb, ra\n        self.parent[rb] = ra\n        if self.rank[ra] == self.rank[rb]:\n            self.rank[ra] += 1\n        return True\n\n\ndef mst_weight(n, edges):\n    uf = UnionFind(n)\n    total = 0\n    taken = 0\n    for w, u, v in sorted((w, u, v) for u, v, w in edges):\n        if uf.union(u, v):\n            total += w\n            taken += 1\n            if taken == n - 1:\n                break\n    return total if taken == n - 1 else None\n\n\nprint(mst_weight(4, [(0, 1, 1), (1, 2, 2), (0, 2, 4), (2, 3, 1), (1, 3, 5)]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why sort edges before union checks in Kruskal?",
            reveal:
              "Greedy MST correctness needs lighter edges considered before heavier ones so the cut property applies in order."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If the graph is disconnected, stop when you cannot take V - 1 edges and report no spanning tree."
        }
      },
      {
        id: "algorithm-selection",
        heading: "Selection checklist: BFS, Dijkstra, or Union-Find",
        paragraphs: [
          "Unweighted shortest path or fewest edges → BFS. Non-negative weighted shortest path → Dijkstra. Connectivity, cycle on undirected edge add, or component counts without paths → Union-Find. Negative weights → Bellman-Ford or DAG methods.",
          "Network-delay style prompts are Dijkstra: directed weighted edges, maximize distance from source among reachable nodes, or report -1 if some nodes unreachable. Component-count prompts are DSU or DFS.",
          "Say the decision criteria aloud before coding. Interviewers grade the branch choice as much as the implementation."
        ],
        keyTerms: [
          {
            term: "reachability",
            definition:
              "Whether a path exists, regardless of cost."
          },
          {
            term: "single-source shortest path",
            definition:
              "Best distances from one source to all other vertices."
          },
          {
            term: "component count",
            definition:
              "Number of disjoint connected pieces in an undirected graph."
          }
        ],
        workedExample: {
          title: "Network delay with Dijkstra",
          body:
            "The answer is the maximum finite distance from the source after Dijkstra.",
          code:
            "import heapq\nfrom collections import defaultdict\n\n\ndef network_delay_time(times, n, k):\n    graph = defaultdict(list)\n    for u, v, w in times:\n        graph[u].append((v, w))\n    dist = {k: 0}\n    heap = [(0, k)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d != dist.get(u):\n            continue\n        for v, w in graph[u]:\n            nd = d + w\n            if nd < dist.get(v, float('inf')):\n                dist[v] = nd\n                heapq.heappush(heap, (nd, v))\n    if len(dist) < n:\n        return -1\n    return max(dist.values())\n\n\nprint(network_delay_time([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "When would you pick Union-Find over DFS for components?",
            reveal:
              "When edges arrive online, you merge many times, or you only need connectivity queries and merges without traversing adjacency lists."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Keep a three-way fork in mind: hops, weighted distances, or connectivity-only."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Weight assumptions select among BFS, Dijkstra, and Bellman-Ford.",
        "Dijkstra relaxes through a priority frontier and skips stale heap entries.",
        "Union-Find answers component membership with nearly constant amortized ops.",
        "Kruskal pairs sorted edges with DSU cycle tests for MSTs.",
        "Choose structures from the question: path, distance, or connectivity."
      ],
      nextSteps: [
        "Implement Dijkstra and reconstruct a path on a four-node graph.",
        "Count components with DSU and with DFS; compare APIs.",
        "Trace Kruskal on a tiny edge list and mark rejected cycle edges."
      ]
    }
  },

  "dsa-algorithms-lab/dynamic-programming-cookbook": {
    title: "Chapter: Dynamic programming cookbook",
    readingTime: "85-100 min",
    premise:
      "DP starts with a state sentence, then base cases, transitions, and iteration order. This chapter builds a cookbook from climbing stairs through knapsacks, grids, LIS, coins, and LCS.",
    parts: [
      {
        id: "state-contract",
        heading: "Write a contract for every state",
        paragraphs: [
          "Dynamic programming fails when dp[i] is a vague slogan. Define a sentence: minimum cost to reach index i; number of ways to decode prefix s[0:i]; maximum money from houses up to i without adjacent picks. Different sentences share notation but not meaning.",
          "Once the contract exists, base cases and transitions become checkable. If dp[i][j] is edit distance between prefixes, insert/delete/replace fall out. If the sentence is fuzzy about whether i is included, bugs follow.",
          "Start interviews by writing the state in words. Code should mirror that sentence so every index has a reason."
        ],
        keyTerms: [
          {
            term: "state",
            definition:
              "A named subproblem with precise boundaries and meaning."
          },
          {
            term: "optimal substructure",
            definition:
              "Property that optimal solutions contain optimal solutions to subproblems."
          },
          {
            term: "overlapping subproblems",
            definition:
              "Property that recursion revisits the same subproblems many times."
          }
        ],
        workedExample: {
          title: "Climbing stairs and house robber stories",
          body:
            "Two classic one-dimensional transitions from clear state sentences.",
          code:
            "def climb_stairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\n\ndef house_robber(nums):\n    prev2 = prev1 = 0\n    for value in nums:\n        prev2, prev1 = prev1, max(prev1, prev2 + value)\n    return prev1\n\n\nprint(climb_stairs(5), house_robber([2, 7, 9, 3, 1]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "What state sentence fits house robber?",
            reveal:
              "dp[i] = maximum money from the first i houses (or up to index i), with the transition choosing to rob i plus dp[i-2] or skip i and take dp[i-1]."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "If you cannot say what dp[i] excludes and includes, do not code yet."
        }
      },
      {
        id: "memo-vs-tab",
        heading: "Memoization discovers order; tabulation enforces it",
        paragraphs: [
          "Memoized recursion computes states on demand and caches results. It is natural when the dependency graph is irregular or sparse. Tabulation iterates in an order that guarantees prerequisites exist—row-major grids, increasing LIS indices, increasing interval lengths.",
          "The math is the same: each state once after dependencies. Cyclic-looking recurrences usually mean missing state dimensions or a need for relaxation-style algorithms instead of classic DP.",
          "Choose memo for tree-shaped or sparse reachable states; choose tables when memory layout and iteration control matter, or when recursion depth is risky."
        ],
        keyTerms: [
          {
            term: "memoization",
            definition:
              "Caching recursive results so each state is computed once."
          },
          {
            term: "tabulation",
            definition:
              "Bottom-up filling of a DP table in dependency-safe order."
          },
          {
            term: "dependency order",
            definition:
              "An iteration sequence that computes prerequisite states first."
          }
        ],
        workedExample: {
          title: "0/1 knapsack with memoization",
          body:
            "State is (index, remaining capacity); each item is take or skip once.",
          code:
            "def knapsack(weights, values, capacity):\n    memo = {}\n\n    def dp(i, rest):\n        if i == len(weights) or rest == 0:\n            return 0\n        key = (i, rest)\n        if key in memo:\n            return memo[key]\n        best = dp(i + 1, rest)\n        if weights[i] <= rest:\n            best = max(best, values[i] + dp(i + 1, rest - weights[i]))\n        memo[key] = best\n        return best\n\n    return dp(0, capacity)\n\n\nprint(knapsack([2, 3, 4, 5], [3, 4, 5, 6], 5))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why must 0/1 knapsack move to i+1 after taking an item?",
            reveal:
              "Each item may be used at most once. Staying on i would allow unlimited reuse and become unbounded knapsack."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Name the transition graph: which states feed dp[i], and why your loop order is safe."
        }
      },
      {
        id: "base-cases",
        heading: "Base cases are answers to empty problems",
        paragraphs: [
          "Base cases are not decorative defaults. Edit distance dp[0][j] = j because building j characters from empty takes j insertions. Coin change sets dp[0] = 0 and unreachable amounts to infinity. Path counting gives the start cell one way if open.",
          "Impossible states need sentinels that match algebra: min with infinity, max with negative infinity, counts with zero, booleans with false. Mixing meanings—treating zero ways as zero cost—creates silent bugs.",
          "Derive bases from the state sentence applied to empty inputs. Special-case patches inside transitions often mean the bases are wrong."
        ],
        keyTerms: [
          {
            term: "base case",
            definition:
              "The answer to the smallest meaningful subproblem in the DP."
          },
          {
            term: "sentinel",
            definition:
              "A placeholder such as infinity used so min/max transitions stay well-defined."
          },
          {
            term: "unreachable state",
            definition:
              "A subproblem that cannot occur; encoded so transitions ignore it."
          }
        ],
        workedExample: {
          title: "Minimum coins with tabulation",
          body:
            "Unbounded knapsack-style update; infinity marks impossible amounts.",
          code:
            "def coin_change(coins, amount):\n    inf = amount + 1\n    dp = [0] + [inf] * amount\n    for a in range(1, amount + 1):\n        for coin in coins:\n            if coin <= a:\n                dp[a] = min(dp[a], dp[a - coin] + 1)\n    return dp[amount] if dp[amount] != inf else -1\n\n\nprint(coin_change([1, 2, 5], 11))\nprint(coin_change([2], 3))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why initialize dp[0] = 0 in coin change?",
            reveal:
              "Making amount 0 takes zero coins. That empty answer seeds every later transition that subtracts a coin."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "If every cell stays at the sentinel, check bases and whether transitions ever fire."
        }
      },
      {
        id: "grids-and-sequences",
        heading: "Grids and sequences share local transitions",
        paragraphs: [
          "Grid path problems usually depend on top and left (or similar neighbors). Row-major order works. Sequence problems like LIS depend on earlier indices with value constraints. LCS depends on shorter prefixes of both strings.",
          "Draw a tiny table. Fill the first row and column from bases. Check one interior cell by hand. That ritual catches off-by-one index mistakes before you trust code.",
          "When reconstruction is required, store choices or walk backward from the answer cell using the same recurrence inequalities."
        ],
        keyTerms: [
          {
            term: "grid DP",
            definition:
              "States indexed by cell coordinates with neighbor transitions."
          },
          {
            term: "LCS",
            definition:
              "Longest common subsequence of two sequences."
          },
          {
            term: "LIS",
            definition:
              "Longest increasing subsequence of one sequence."
          }
        ],
        workedExample: {
          title: "Grid minimum path sum and LCS length",
          body:
            "Local mins on a grid; prefix table for LCS.",
          code:
            "def min_path_sum(grid):\n    rows, cols = len(grid), len(grid[0])\n    dp = [row[:] for row in grid]\n    for r in range(1, rows):\n        dp[r][0] += dp[r - 1][0]\n    for c in range(1, cols):\n        dp[0][c] += dp[0][c - 1]\n    for r in range(1, rows):\n        for c in range(1, cols):\n            dp[r][c] += min(dp[r - 1][c], dp[r][c - 1])\n    return dp[-1][-1]\n\n\ndef lcs_length(a, b):\n    m, n = len(a), len(b)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if a[i - 1] == b[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    return dp[m][n]\n\n\nprint(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))\nprint(lcs_length('abcde', 'ace'))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "In LCS, when do you take the diagonal + 1?",
            reveal:
              "When the current characters match: a[i-1] == b[j-1]. Otherwise take the better of skipping either character."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Fill a 3x3 hand example before submitting grid DP in an interview."
        }
      },
      {
        id: "space-compression",
        heading: "Compress space only when dependencies allow",
        paragraphs: [
          "Fibonacci needs two previous values. Many grid DPs need only the previous row. 0/1 knapsack can use one dimension if capacity iterates downward so each item is used once. Iterating upward reuses the item and becomes unbounded.",
          "Before compressing, draw dependencies. If reconstruction of choices is required, compressed tables may erase history unless you store decisions separately. In interviews, ship the clear table first when risk is high, then explain the memory reduction.",
          "LIS has an O(n log n) patience-sorting variant using tails arrays. Know O(n^2) thoroughly first; mention the faster method as a follow-up."
        ],
        keyTerms: [
          {
            term: "space compression",
            definition:
              "Reducing DP memory by overwriting states that will never be read again."
          },
          {
            term: "rolling array",
            definition:
              "Keeping only the last one or two layers of a multi-dimensional DP."
          },
          {
            term: "patience sorting LIS",
            definition:
              "An O(n log n) method maintaining smallest tails of increasing subsequences."
          }
        ],
        workedExample: {
          title: "LIS in O(n^2) and compressed knapsack",
          body:
            "Quadratic LIS is the clear baseline; downward capacity updates keep 0/1 semantics.",
          code:
            "def lis_length(nums):\n    n = len(nums)\n    dp = [1] * n\n    for i in range(n):\n        for j in range(i):\n            if nums[j] < nums[i]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp) if dp else 0\n\n\ndef knapsack_compressed(weights, values, capacity):\n    dp = [0] * (capacity + 1)\n    for w, v in zip(weights, values):\n        for cap in range(capacity, w - 1, -1):\n            dp[cap] = max(dp[cap], dp[cap - w] + v)\n    return dp[capacity]\n\n\nprint(lis_length([10, 9, 2, 5, 3, 7, 101, 18]))\nprint(knapsack_compressed([2, 3, 4, 5], [3, 4, 5, 6], 5))",
          language: "python"
        },
        checkYourself: [
          {
            prompt: "Why iterate capacity downward in 0/1 knapsack compression?",
            reveal:
              "So dp[cap - w] still refers to the previous item's row. Upward iteration would reuse the current item in the same pass."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "Offer the full table, then the compressed version as an optimization with an explicit dependency argument."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "DP begins with a precise state sentence.",
        "Memoization and tabulation share math but differ in discovery versus enforced order.",
        "Base cases and sentinels must match transition algebra.",
        "Grids and sequence DPs are local dependency tables.",
        "Space compression is safe only when overwritten states are dead."
      ],
      nextSteps: [
        "Write state sentences for coin change, LCS, and house robber before coding.",
        "Convert a memoized knapsack into a downward one-dimensional table.",
        "Hand-fill an LCS table for two short strings."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaAlgorithmsLabChapters = JSON.parse(JSON.stringify(chapters));
