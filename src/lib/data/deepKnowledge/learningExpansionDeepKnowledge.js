/** @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const learningExpansionDeepKnowledge = {
  'systems-fundamentals-lab/request-lifecycle-deep-dive': {
    insights: [
      {
        heading: 'Latency is a queueing story, not just a network story',
        body:
          'The visible request path includes DNS, TCP, TLS, edge routing, application work, dependency calls, storage, serialization, and response transfer. Under load, the largest jump often comes from waiting before work begins: connection pools, worker pools, locks, and saturated downstream queues. A good latency budget separates service time from queue time so the team can tell whether to optimize code, remove a hop, add capacity, or shed load.'
      },
      {
        heading: 'Connection reuse changes the shape of the critical path',
        body:
          'Cold requests pay for DNS lookup, TCP setup, and TLS negotiation before the first byte of application data moves. Warm HTTP connections, keep-alives, TLS session resumption, and HTTP/2 multiplexing amortize that setup over many requests. This is why chatty APIs can look acceptable in a local benchmark but fail on mobile networks where connection churn, packet loss, and radio wakeups dominate.'
      }
    ],
    references: [
      {
        title: 'An overview of HTTP',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
        source: 'MDN Web Docs',
        note: 'Grounds the browser-to-server request path in HTTP connection behavior, messages, and intermediaries.'
      },
      {
        title: 'What happens in a TLS handshake?',
        url: 'https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/',
        source: 'Cloudflare Learning Center',
        note: 'Explains the negotiation work that happens before encrypted application traffic can flow.'
      },
      {
        title: 'The Tail at Scale',
        url: 'https://research.google/pubs/pub40801/',
        source: 'Google Research',
        note: 'Shows why rare slow hops compound into user-visible tail latency in multi-service systems.'
      }
    ]
  },

  'systems-fundamentals-lab/capacity-cost-and-utilization': {
    insights: [
      {
        heading: 'Capacity estimates should end with a bottleneck claim',
        body:
          'A useful estimate does not stop at QPS or terabytes. It names the first resource likely to saturate: CPU for expensive transformations, memory for caches, disk I/O for storage engines, network egress for media, or human operations for noisy systems. That claim tells you whether the next design move is autoscaling, batching, caching, sharding, compression, retention changes, or product throttling.'
      },
      {
        heading: 'High utilization is only safe when variance is low',
        body:
          'A service running at 80 percent average CPU can be healthy if demand is smooth and work is independent, but dangerous if requests burst, fan out, or hold scarce locks. As utilization approaches saturation, small traffic spikes create disproportionate queueing delay. Good capacity plans include headroom, scaling lag, peak-to-average ratios, and retry amplification instead of treating average load as the real workload.'
      }
    ],
    references: [
      {
        title: 'Addressing Cascading Failures',
        url: 'https://sre.google/sre-book/addressing-cascading-failures/',
        source: 'Google SRE Book',
        note: 'Connects overload, resource saturation, retries, and capacity margins to real outage dynamics.'
      },
      {
        title: 'Cost Optimization Pillar',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
        source: 'AWS Well-Architected Framework',
        note: 'Frames capacity choices as ongoing trade-offs among demand, pricing models, and operational discipline.'
      },
      {
        title: 'The USE Method',
        url: 'https://www.brendangregg.com/usemethod.html',
        source: 'Brendan Gregg',
        note: 'A practical method for reasoning about utilization, saturation, and errors across system resources.'
      }
    ]
  },

  'systems-fundamentals-lab/designing-for-evolution': {
    insights: [
      {
        heading: 'Compatibility is a product promise',
        body:
          'APIs, schemas, events, and configuration files are contracts with clients that may upgrade slowly. Evolution-friendly systems prefer additive fields, tolerant readers, explicit deprecation windows, and versioned behavior only when semantics truly change. The deeper skill is preserving caller expectations while giving the server room to learn and improve.'
      },
      {
        heading: 'Migrations are safest when reads and writes move separately',
        body:
          'Big-bang rewrites fail because code, data, traffic, and clients rarely switch at the same time. Expand-and-contract migrations add the new shape first, backfill or dual-write, shift reads after validation, then remove the old shape. This pattern turns reversibility into a design requirement rather than a wish after the rollout starts.'
      }
    ],
    references: [
      {
        title: 'Evolutionary Database Design',
        url: 'https://martinfowler.com/articles/evodb.html',
        source: 'Martin Fowler',
        note: 'Explains incremental schema evolution, migration scripts, and continuous database change.'
      },
      {
        title: 'Strangler Fig Application',
        url: 'https://martinfowler.com/bliki/StranglerFigApplication.html',
        source: 'Martin Fowler',
        note: 'Canonical pattern for replacing legacy capabilities one route or workflow at a time.'
      },
      {
        title: 'Feature Toggles',
        url: 'https://martinfowler.com/articles/feature-toggles.html',
        source: 'Martin Fowler',
        note: 'Shows how rollout controls separate deployment from release and limit blast radius.'
      }
    ]
  },

  'reliability-observability-lab/sli-slo-error-budgets': {
    insights: [
      {
        heading: 'An SLI should measure a promise the user can feel',
        body:
          'CPU, memory, and pod health are useful diagnostics, but they are rarely the reliability promise. Better SLIs measure valid requests that complete successfully, checkout flows that finish, search results that are fresh enough, or streams that do not stall. User-centered SLIs prevent teams from declaring the service healthy while the critical journey is broken.'
      },
      {
        heading: 'Error budgets convert reliability into a decision system',
        body:
          'A 99.9 percent SLO gives a concrete amount of acceptable unreliability in a time window. Spending that budget quickly is a signal to slow launches and fix the failure mode causing user harm; having budget remaining allows measured product velocity. This replaces vague arguments about quality with a shared risk ledger.'
      }
    ],
    references: [
      {
        title: 'Service Level Objectives',
        url: 'https://sre.google/sre-book/service-level-objectives/',
        source: 'Google SRE Book',
        note: 'The core SRE treatment of SLIs, SLOs, error budgets, and reliability policy.'
      },
      {
        title: 'Alerting on SLOs',
        url: 'https://sre.google/workbook/alerting-on-slos/',
        source: 'Google SRE Workbook',
        note: 'Practical burn-rate alerting patterns that make error budgets operational.'
      },
      {
        title: 'Reliability Pillar',
        url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html',
        source: 'AWS Well-Architected Framework',
        note: 'Broader cloud reliability guidance for availability goals, recovery, and change management.'
      }
    ]
  },

  'reliability-observability-lab/tracing-metrics-and-logs': {
    insights: [
      {
        heading: 'Use each signal for the question it answers best',
        body:
          'Metrics answer how much and how often; traces answer where time went across a request; logs answer what happened at a specific point with rich context. Treating one signal as a replacement for the others creates blind spots. Mature observability starts with the debugging question, then chooses the cheapest signal that can answer it with enough fidelity.'
      },
      {
        heading: 'Correlation is more valuable than volume',
        body:
          'A trace ID that ties gateway logs, service spans, database timing, queue events, and metrics exemplars together can shorten an incident dramatically. More dashboards and more logs do not help if they cannot be joined around one user journey. High-cardinality labels and structured fields are powerful, but they must be designed intentionally to avoid cost explosions.'
      }
    ],
    references: [
      {
        title: 'Monitoring Distributed Systems',
        url: 'https://sre.google/sre-book/monitoring-distributed-systems/',
        source: 'Google SRE Book',
        note: 'Classic guidance on symptoms, causes, alerting, and monitoring design.'
      },
      {
        title: 'OpenTelemetry Signals',
        url: 'https://opentelemetry.io/docs/concepts/signals/',
        source: 'OpenTelemetry',
        note: 'Defines traces, metrics, logs, and baggage as interoperable observability signals.'
      },
      {
        title: 'Dapper, a Large-Scale Distributed Systems Tracing Infrastructure',
        url: 'https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/',
        source: 'Google Research',
        note: 'Foundational paper for request tracing across many services and dependencies.'
      }
    ]
  },

  'reliability-observability-lab/failure-injection-and-incidents': {
    insights: [
      {
        heading: 'Failure practice should validate a hypothesis',
        body:
          'Chaos work is not random breakage. A strong experiment states a steady-state expectation, injects one controlled fault, limits blast radius, and measures whether users remain protected. This turns resilience from documentation into evidence: retries, timeouts, circuit breakers, fallbacks, and runbooks either work under pressure or need repair.'
      },
      {
        heading: 'Incidents are data about the system, not proof of individual failure',
        body:
          'Blameless postmortems focus on contributing factors: missing signals, confusing ownership, unsafe defaults, overload behavior, rollback friction, and unclear decisions. The goal is not a perfect narrative but a set of learning actions that reduce recurrence. Good incident programs track whether those actions actually change system behavior.'
      }
    ],
    references: [
      {
        title: 'Principles of Chaos Engineering',
        url: 'https://principlesofchaos.org/',
        source: 'Chaos Engineering Community',
        note: 'Concise principles for controlled failure experiments and steady-state validation.'
      },
      {
        title: 'Postmortem Culture: Learning from Failure',
        url: 'https://sre.google/sre-book/postmortem-culture/',
        source: 'Google SRE Book',
        note: 'Defines blameless analysis and how incident learning should feed engineering work.'
      },
      {
        title: 'Implementing Health Checks',
        url: 'https://aws.amazon.com/builders-library/implementing-health-checks/',
        source: 'AWS Builders Library',
        note: 'Explains real failure modes around health checks, overload, and automated recovery.'
      }
    ]
  },

  'lld-design-patterns-lab/creational-patterns-in-practice': {
    insights: [
      {
        heading: 'Creational patterns name where construction decisions live',
        body:
          'Factory, Builder, Prototype, and Singleton are not decorations around constructors. They are answers to different construction pressures: choosing a concrete type, assembling a valid complex object, cloning configured state, or managing a truly unique resource. If no construction decision is volatile or error-prone, a direct constructor is clearer.'
      },
      {
        heading: 'A pattern should make invalid setup harder to express',
        body:
          'The strongest builders and factories encode required fields, defaults, validation, and collaborator selection in one obvious place. Weak versions hide simple object creation behind ceremony while still allowing partially valid objects to escape. In machine-coding rounds, the test is whether the pattern improves changeability and correctness under a follow-up requirement.'
      }
    ],
    references: [
      {
        title: 'Factory Method',
        url: 'https://refactoring.guru/design-patterns/factory-method',
        source: 'Refactoring Guru',
        note: 'Clear examples of deferring concrete product creation behind a stable creator interface.'
      },
      {
        title: 'Builder',
        url: 'https://refactoring.guru/design-patterns/builder',
        source: 'Refactoring Guru',
        note: 'Explains staged construction for objects with many parts or validation rules.'
      },
      {
        title: 'Singleton',
        url: 'https://refactoring.guru/design-patterns/singleton',
        source: 'Refactoring Guru',
        note: 'Useful for understanding both the intent and the global-state risks of Singleton.'
      }
    ]
  },

  'lld-design-patterns-lab/structural-patterns-in-practice': {
    insights: [
      {
        heading: 'Structural patterns manage shape mismatches',
        body:
          'Adapter changes an interface, Facade simplifies a subsystem, Decorator layers behavior, Composite models trees, and Proxy controls access. The shared theme is relationship design: callers should depend on the shape that matches their job, not on accidental details of another library, subsystem, or object graph.'
      },
      {
        heading: 'Composition clarity matters more than pattern vocabulary',
        body:
          'Structural patterns become harmful when wrappers stack invisibly, facades collect unrelated workflows, or composites force a hierarchy onto a flat model. Before naming a pattern, identify the pressure: integration mismatch, optional behavior, simplified orchestration, access control, or uniform tree traversal. The resulting object boundaries should be easier to test and explain.'
      }
    ],
    references: [
      {
        title: 'Adapter',
        url: 'https://refactoring.guru/design-patterns/adapter',
        source: 'Refactoring Guru',
        note: 'Useful for third-party or legacy interfaces that do not match caller needs.'
      },
      {
        title: 'Decorator',
        url: 'https://refactoring.guru/design-patterns/decorator',
        source: 'Refactoring Guru',
        note: 'Shows how behavior can be composed around an object without subclass explosion.'
      },
      {
        title: 'Facade',
        url: 'https://refactoring.guru/design-patterns/facade',
        source: 'Refactoring Guru',
        note: 'Explains how to give callers a simpler front door over a complex subsystem.'
      }
    ]
  },

  'lld-design-patterns-lab/behavioral-patterns-in-practice': {
    insights: [
      {
        heading: 'Behavioral patterns isolate decisions that change at runtime',
        body:
          'Strategy moves interchangeable algorithms behind one contract, State moves transition-specific behavior into state objects, Observer decouples event producers from consumers, and Command packages an action as data. These patterns are most valuable when they prevent conditionals from spreading across workflows as requirements evolve.'
      },
      {
        heading: 'The pattern boundary should match the business vocabulary',
        body:
          'A payment retry policy, parking fee rule, elevator dispatch rule, or notification subscriber is easier to change when the type name matches the decision being varied. Pattern-heavy code fails when it exposes generic managers and handlers without domain meaning. Good LLD uses the pattern as scaffolding for a clearer model, not as the model itself.'
      }
    ],
    references: [
      {
        title: 'Strategy',
        url: 'https://refactoring.guru/design-patterns/strategy',
        source: 'Refactoring Guru',
        note: 'The go-to pattern for interchangeable policies or algorithms.'
      },
      {
        title: 'State',
        url: 'https://refactoring.guru/design-patterns/state',
        source: 'Refactoring Guru',
        note: 'Helpful when object behavior depends heavily on lifecycle state and legal transitions.'
      },
      {
        title: 'Observer',
        url: 'https://refactoring.guru/design-patterns/observer',
        source: 'Refactoring Guru',
        note: 'Explains event subscription without hard-coding every consumer into the producer.'
      }
    ]
  },

  'lld-project-labs/parking-lot-design-lab': {
    insights: [
      {
        heading: 'Parking lots are allocation systems with invariants',
        body:
          'The core model is not just Vehicle, Spot, and Ticket. It is an allocation rule that must prevent two active tickets from owning one spot, prevent one vehicle from holding conflicting active sessions, and release capacity exactly once. Naming those invariants early makes pricing, reservations, entry gates, and multi-floor search much easier to place.'
      },
      {
        heading: 'Separate discovery, assignment, and pricing policies',
        body:
          'A flexible design keeps spot search, spot assignment, and fee calculation as replaceable policies. Compact cars, EV charging, disabled parking, prepaid reservations, and event pricing should not require rewriting the ticket lifecycle. The aggregate still owns state changes; policies only answer decision questions.'
      }
    ],
    references: [
      {
        title: 'State',
        url: 'https://refactoring.guru/design-patterns/state',
        source: 'Refactoring Guru',
        note: 'Maps cleanly to ticket and spot lifecycles such as available, occupied, reserved, and closed.'
      },
      {
        title: 'Strategy',
        url: 'https://refactoring.guru/design-patterns/strategy',
        source: 'Refactoring Guru',
        note: 'Useful for pricing, spot-selection, and eligibility policies that vary independently.'
      },
      {
        title: 'DDD Aggregate',
        url: 'https://martinfowler.com/bliki/DDD_Aggregate.html',
        source: 'Martin Fowler',
        note: 'A strong lens for deciding which object enforces parking allocation invariants.'
      }
    ]
  },

  'lld-project-labs/elevator-system-design-lab': {
    insights: [
      {
        heading: 'Elevator design is scheduling plus a physical state machine',
        body:
          'The dispatch problem chooses which car should serve which request; the car state machine enforces movement, doors, direction, load, and safety transitions. Mixing those responsibilities makes every new requirement dangerous. Keep global scheduling policies separate from per-elevator command execution and lifecycle rules.'
      },
      {
        heading: 'Fairness and efficiency compete in dispatch policy',
        body:
          'Nearest-car assignment can starve distant requests during asymmetric traffic, while strict FIFO can waste movement and increase average wait. Realistic dispatchers optimize a cost function over direction, distance, capacity, destination grouping, priority calls, and service zones. The interview goal is to expose that trade-off without overbuilding a simulator.'
      }
    ],
    references: [
      {
        title: 'Elevator Algorithm',
        url: 'https://en.wikipedia.org/wiki/Elevator_algorithm',
        source: 'Wikipedia',
        note: 'Introduces the scan-style scheduling idea behind many elevator and disk-head policies.'
      },
      {
        title: 'Command',
        url: 'https://refactoring.guru/design-patterns/command',
        source: 'Refactoring Guru',
        note: 'Helpful for modeling hall calls, car commands, and queued actions as first-class objects.'
      },
      {
        title: 'Finite-State Machine',
        url: 'https://en.wikipedia.org/wiki/Finite-state_machine',
        source: 'Wikipedia',
        note: 'A precise mental model for elevator movement, door, maintenance, and emergency states.'
      }
    ]
  },

  'lld-project-labs/library-or-booking-system-lab': {
    insights: [
      {
        heading: 'Bookings need a real consistency boundary',
        body:
          'Library copies, rooms, seats, and appointments all share the same central risk: two users competing for limited inventory. The design should identify the aggregate that owns availability and the operation that atomically reserves it. Search and recommendation can be eventually consistent, but the final hold or checkout cannot be a loose read-then-write.'
      },
      {
        heading: 'Time changes the model more than nouns do',
        body:
          'Due dates, holds, cancellations, renewals, grace periods, and no-show windows create lifecycle rules that a static class diagram hides. Model statuses and transitions explicitly, then attach policies for limits, fees, expiration, and notifications. This keeps "booking" from becoming one overloaded object with every rule in one method.'
      }
    ],
    references: [
      {
        title: 'Optimistic Offline Lock',
        url: 'https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html',
        source: 'Martin Fowler',
        note: 'Relevant for preventing conflicting updates when multiple users compete for availability.'
      },
      {
        title: 'Value Object',
        url: 'https://martinfowler.com/bliki/ValueObject.html',
        source: 'Martin Fowler',
        note: 'Useful for modeling ISBNs, date ranges, money, branch IDs, and other immutable concepts.'
      },
      {
        title: 'State',
        url: 'https://refactoring.guru/design-patterns/state',
        source: 'Refactoring Guru',
        note: 'Helps express holds, checked-out items, expired reservations, cancellations, and returns.'
      }
    ]
  },

  'dsa-concepts-lab/complexity-and-algorithmic-thinking': {
    insights: [
      {
        heading: 'Complexity describes growth under a cost model',
        body:
          'Big-O is only meaningful after you decide what counts as one operation: comparisons, hash lookups, edge relaxations, memory moves, or recursive states. Interview answers should name the input variables and dominant operation. This prevents mistakes like calling a graph algorithm O(n) when the real input is vertices plus edges.'
      },
      {
        heading: 'Amortized bounds explain why rare expensive steps are acceptable',
        body:
          'Dynamic arrays, hash-table resizing, and some union-find operations have occasional costly steps that buy many cheap future operations. Amortized analysis spreads that cost across a sequence rather than a single worst case. Knowing this distinction helps you discuss both throughput and latency spikes with precision.'
      }
    ],
    references: [
      {
        title: 'Introduction to Algorithms',
        url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
        source: 'MIT Press',
        note: 'Canonical CLRS reference for asymptotic notation, recurrence solving, and algorithm analysis.'
      },
      {
        title: 'TimeComplexity',
        url: 'https://wiki.python.org/moin/TimeComplexity',
        source: 'Python Wiki',
        note: 'Practical lookup table for Python list, dict, set, and deque operation costs.'
      },
      {
        title: 'Big O notation',
        url: 'https://en.wikipedia.org/wiki/Big_O_notation',
        source: 'Wikipedia',
        note: 'Concise formal background for upper bounds, dominant terms, and asymptotic comparisons.'
      }
    ]
  },

  'dsa-concepts-lab/hash-tables-and-memory-layout': {
    insights: [
      {
        heading: 'Expected O(1) depends on distribution and load',
        body:
          'Hash tables are fast because good hashing spreads keys across buckets and the table resizes before probes or chains get too long. The guarantee is average or expected, not magic. Collision strategy, load factor, equality cost, tombstones, and adversarial inputs all affect real performance.'
      },
      {
        heading: 'Memory locality can beat asymptotic equality',
        body:
          'Two approaches with the same Big-O can have very different constant factors because CPUs move memory in cache lines. Array scans often outperform pointer-heavy structures for moderate sizes because neighboring data is already fetched. This is why a sorted array plus binary search can be competitive when mutation is rare and cache locality is excellent.'
      }
    ],
    references: [
      {
        title: 'Hash Table',
        url: 'https://en.wikipedia.org/wiki/Hash_table',
        source: 'Wikipedia',
        note: 'Overview of hashing, collisions, open addressing, chaining, and load factor.'
      },
      {
        title: 'TimeComplexity',
        url: 'https://wiki.python.org/moin/TimeComplexity',
        source: 'Python Wiki',
        note: 'Shows the average-case assumptions behind Python dictionaries and sets.'
      },
      {
        title: 'What Every Programmer Should Know About Memory',
        url: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf',
        source: 'Ulrich Drepper',
        note: 'Deep background on cache hierarchies, locality, and why memory layout affects performance.'
      }
    ]
  },

  'dsa-concepts-lab/trees-graphs-mental-models': {
    insights: [
      {
        heading: 'Traversal state is the algorithm',
        body:
          'Tree and graph problems become easier when you name exactly what each traversal step carries: parent, depth, path cost, visited set, low-link value, accumulated answer, or candidate frontier. The representation should make that state cheap to update. Confusion often comes from trying to code traversal before deciding what information must move through the search.'
      },
      {
        heading: 'A tree is a graph with constraints you can exploit',
        body:
          'Trees are connected and acyclic, so many problems need no visited set and can combine child results through recursion. General graphs may have cycles, disconnected components, direction, weights, and multiple paths, so traversal must guard against revisits and define whether the goal is reachability, shortest path, ordering, or connectivity.'
      }
    ],
    references: [
      {
        title: 'Graph Traversal',
        url: 'https://en.wikipedia.org/wiki/Graph_traversal',
        source: 'Wikipedia',
        note: 'Summarizes BFS, DFS, and the core idea of visiting graph vertices systematically.'
      },
      {
        title: '6.006 Introduction to Algorithms',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        source: 'MIT OpenCourseWare',
        note: 'High-quality lectures and notes for trees, graphs, BFS, DFS, and shortest paths.'
      },
      {
        title: 'Graph Data Structure and Algorithms',
        url: 'https://visualgo.net/en/graphds',
        source: 'VisuAlgo',
        note: 'Interactive visualizations that reinforce adjacency representations and traversal behavior.'
      }
    ]
  },

  'dsa-algorithms-lab/sorting-and-divide-and-conquer': {
    insights: [
      {
        heading: 'Divide-and-conquer is about the recurrence, not the recursion',
        body:
          'The shape of a divide-and-conquer algorithm is captured by how many subproblems it creates, how much smaller they are, and how much combine work happens per level. Merge sort spends linear work merging at each of log n levels; binary search spends constant work after halving. That recurrence view helps you derive complexity instead of memorizing it.'
      },
      {
        heading: 'Sorting choice depends on constraints beyond O(n log n)',
        body:
          'Stability, memory usage, input distribution, worst-case guarantees, cache behavior, and whether data arrives online all affect the right sort. Quicksort is often fast in practice but needs partition care; merge sort is stable and predictable but uses extra memory; counting or radix sort can beat comparison lower bounds when keys are bounded.'
      }
    ],
    references: [
      {
        title: 'Merge Sort',
        url: 'https://en.wikipedia.org/wiki/Merge_sort',
        source: 'Wikipedia',
        note: 'Covers stable divide-and-conquer sorting, recurrence behavior, and memory trade-offs.'
      },
      {
        title: 'Quicksort',
        url: 'https://en.wikipedia.org/wiki/Quicksort',
        source: 'Wikipedia',
        note: 'Explains partitioning, average-case performance, and worst-case pitfalls.'
      },
      {
        title: '6.006 Introduction to Algorithms',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        source: 'MIT OpenCourseWare',
        note: 'Includes rigorous lectures on sorting, recurrences, and divide-and-conquer analysis.'
      }
    ]
  },

  'dsa-algorithms-lab/shortest-paths-and-union-find': {
    insights: [
      {
        heading: 'Shortest-path algorithms encode assumptions about edge weights',
        body:
          'BFS is shortest path only when every edge has equal cost. Dijkstra assumes non-negative weights, Bellman-Ford tolerates negative weights and detects negative cycles, and topological relaxation works on DAGs. Naming the graph constraints before choosing the algorithm is the fastest way to avoid an elegant wrong answer.'
      },
      {
        heading: 'Union-find answers connectivity, not path structure',
        body:
          'Disjoint-set union is excellent when edges arrive and you only need to know whether two nodes are in the same component or whether adding an edge creates a cycle. It cannot tell you the actual path, shortest distance, or dynamic deletions without additional machinery. Path compression and union by rank make repeated connectivity checks nearly constant in practice.'
      }
    ],
    references: [
      {
        title: 'Dijkstra\'s Algorithm',
        url: 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm',
        source: 'Wikipedia',
        note: 'Reference for single-source shortest paths with non-negative edge weights.'
      },
      {
        title: 'Disjoint Set Union',
        url: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html',
        source: 'CP-Algorithms',
        note: 'Clear implementation notes for path compression, union by size/rank, and applications.'
      },
      {
        title: 'Bellman-Ford Algorithm',
        url: 'https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm',
        source: 'Wikipedia',
        note: 'Contrasts with Dijkstra by handling negative weights and detecting negative cycles.'
      }
    ]
  },

  'dsa-algorithms-lab/dynamic-programming-cookbook': {
    insights: [
      {
        heading: 'DP starts with the state definition',
        body:
          'A dynamic program is only as clear as its state: what subproblem does dp[i], dp[i][j], or dp[mask] answer, and what choices transition into it? Once the state has a precise meaning, base cases and recurrence usually follow. Vague states lead to off-by-one bugs and tables that are hard to explain.'
      },
      {
        heading: 'Memoization and tabulation differ in control flow, not math',
        body:
          'Top-down memoization explores only states reachable from the query and often mirrors the recurrence. Bottom-up tabulation controls iteration order explicitly and can reduce memory when each state depends on a small frontier. Interviewers care that dependencies are computed before use and that you can explain the space optimization safely.'
      }
    ],
    references: [
      {
        title: 'Dynamic Programming',
        url: 'https://en.wikipedia.org/wiki/Dynamic_programming',
        source: 'Wikipedia',
        note: 'Introduces optimal substructure, overlapping subproblems, memoization, and tabulation.'
      },
      {
        title: 'Introduction to Dynamic Programming',
        url: 'https://cp-algorithms.com/dynamic_programming/intro-to-dp.html',
        source: 'CP-Algorithms',
        note: 'Practical competitive-programming framing with recurrence and implementation patterns.'
      },
      {
        title: '6.006 Introduction to Algorithms',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        source: 'MIT OpenCourseWare',
        note: 'Lectures and notes that develop DP from recurrences and dependency graphs.'
      }
    ]
  },

  'ml-interactive-lab/feature-engineering-playground': {
    insights: [
      {
        heading: 'Feature engineering is part of the model contract',
        body:
          'A scaler, imputer, encoder, tokenizer, or feature definition is not a preprocessing footnote. It determines what information the estimator can see and how production requests must be transformed. Treat transformations as versioned, testable model artifacts so training, validation, and serving do not silently diverge.'
      },
      {
        heading: 'Leakage often enters through innocent transformations',
        body:
          'Fitting an imputer, scaler, encoder, target statistic, or feature selector before splitting data lets validation folds learn from held-out examples. Time-based and user-grouped data add more traps: future aggregates and repeated users can make metrics look real while production fails. Pipelines protect against this by fitting transformations inside each training fold.'
      }
    ],
    references: [
      {
        title: 'Column Transformer with Mixed Types',
        url: 'https://scikit-learn.org/stable/auto_examples/compose/plot_column_transformer_mixed_types.html',
        source: 'scikit-learn',
        note: 'Concrete pattern for numeric and categorical preprocessing in one pipeline.'
      },
      {
        title: 'Pipeline and Composite Estimators',
        url: 'https://scikit-learn.org/stable/modules/compose.html',
        source: 'scikit-learn',
        note: 'Authoritative guide to composing transformers and estimators without leakage.'
      },
      {
        title: 'Common Pitfalls and Recommended Practices',
        url: 'https://scikit-learn.org/stable/common_pitfalls.html',
        source: 'scikit-learn',
        note: 'Directly covers inconsistent preprocessing and data leakage mistakes.'
      }
    ]
  },

  'ml-interactive-lab/supervised-learning-workshop': {
    insights: [
      {
        heading: 'A baseline is a measurement instrument',
        body:
          'Dummy classifiers, linear models, and small trees are not just starter models. They reveal class imbalance, leakage, signal strength, and metric sanity before expensive tuning. If a sophisticated model barely beats a simple baseline, the next improvement may be data quality, feature design, or label definition rather than model complexity.'
      },
      {
        heading: 'Thresholds are where model scores become product decisions',
        body:
          'A classifier often outputs scores or probabilities, but the business experiences actions: approve, block, escalate, notify, or ignore. Precision, recall, calibration, and cost curves matter because the threshold determines false-positive and false-negative trade-offs. Strong supervised workflows choose metrics and thresholds from the decision cost, not from default accuracy.'
      }
    ],
    references: [
      {
        title: 'Supervised Learning',
        url: 'https://scikit-learn.org/stable/supervised_learning.html',
        source: 'scikit-learn',
        note: 'Broad guide to supervised estimators, assumptions, and use cases.'
      },
      {
        title: 'Model Evaluation',
        url: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
        source: 'scikit-learn',
        note: 'Reference for classification metrics, scoring, and threshold-aware evaluation.'
      },
      {
        title: 'Cross-validation: Evaluating Estimator Performance',
        url: 'https://scikit-learn.org/stable/modules/cross_validation.html',
        source: 'scikit-learn',
        note: 'Explains how to estimate generalization while avoiding single-split overconfidence.'
      }
    ]
  },

  'ml-interactive-lab/unsupervised-learning-workshop': {
    insights: [
      {
        heading: 'Unsupervised structure is a hypothesis, not a label',
        body:
          'Clusters and embeddings reveal patterns under a chosen distance metric, scaling choice, and algorithmic bias. K-means prefers spherical equal-variance clusters; DBSCAN prefers density-separated regions; PCA finds linear variance directions. The output should be inspected as exploratory evidence, not treated as ground truth.'
      },
      {
        heading: 'Dimensionality reduction preserves some relationships and destroys others',
        body:
          'PCA preserves maximum linear variance, t-SNE emphasizes local neighborhoods, and UMAP balances local and global structure differently. A beautiful two-dimensional plot can exaggerate separation or invent apparent clusters. Good analysis pairs visualization with stability checks, domain review, and downstream validation.'
      }
    ],
    references: [
      {
        title: 'Clustering',
        url: 'https://scikit-learn.org/stable/modules/clustering.html',
        source: 'scikit-learn',
        note: 'Compares clustering algorithms, assumptions, parameters, and evaluation approaches.'
      },
      {
        title: 'Decomposing Signals in Components',
        url: 'https://scikit-learn.org/stable/modules/decomposition.html',
        source: 'scikit-learn',
        note: 'Covers PCA, matrix factorization, and dimensionality-reduction estimators.'
      },
      {
        title: 'How to Use t-SNE Effectively',
        url: 'https://distill.pub/2016/misread-tsne/',
        source: 'Distill',
        note: 'Excellent visual explanation of common t-SNE interpretation mistakes.'
      }
    ]
  },

  'deep-learning-from-scratch/perceptron-and-mlp-numpy': {
    insights: [
      {
        heading: 'An MLP is learned feature composition',
        body:
          'A single perceptron learns a linear decision boundary, while hidden layers compose nonlinear transformations that make richer boundaries possible. Activation functions are essential because stacked linear layers collapse into one linear map. Building an MLP in NumPy makes shape flow, broadcasting, initialization, and activation choice visible instead of hidden behind a framework.'
      },
      {
        heading: 'Initialization controls signal flow before learning starts',
        body:
          'If weights are too small, activations and gradients shrink; if too large, they explode or saturate. Xavier and He initialization scale weights according to fan-in and activation behavior so forward activations and backward gradients stay in useful ranges. This is a practical reason deep learning is numerical engineering, not just calculus.'
      }
    ],
    references: [
      {
        title: 'Deep Learning',
        url: 'https://www.deeplearningbook.org/',
        source: 'Goodfellow, Bengio, Courville',
        note: 'Canonical textbook for feedforward networks, activation functions, and initialization.'
      },
      {
        title: 'Neural Networks and Deep Learning',
        url: 'https://neuralnetworksanddeeplearning.com/',
        source: 'Michael Nielsen',
        note: 'Accessible online book that builds intuition for perceptrons, MLPs, and backpropagation.'
      },
      {
        title: 'But What Is a Neural Network?',
        url: 'https://www.3blue1brown.com/lessons/neural-networks',
        source: '3Blue1Brown',
        note: 'Visual explanation of layers, activations, and learned representations.'
      }
    ]
  },

  'deep-learning-from-scratch/backpropagation-by-hand': {
    insights: [
      {
        heading: 'Backpropagation is dynamic programming over the chain rule',
        body:
          'Naively differentiating every parameter independently repeats the same downstream derivative work many times. Backprop stores intermediate activations and propagates adjoints backward through the computation graph, reusing partial derivatives. The algorithm is efficient because each node contributes local derivatives once per forward/backward pass.'
      },
      {
        heading: 'Shape checks are the fastest way to debug gradients',
        body:
          'Every gradient should have the same shape as the parameter it updates, and every upstream gradient should match the activation it flows through. Many from-scratch bugs are transposes, missed batch averaging, or broadcasting that silently changes scale. Numerical gradient checks are slow but invaluable for validating the algebra on small examples.'
      }
    ],
    references: [
      {
        title: 'Calculus on Computational Graphs: Backpropagation',
        url: 'https://cs231n.github.io/optimization-2/',
        source: 'CS231n',
        note: 'Clear derivation of local gradients, chain rule flow, and implementation patterns.'
      },
      {
        title: 'Backpropagation',
        url: 'https://www.3blue1brown.com/lessons/backpropagation',
        source: '3Blue1Brown',
        note: 'Visual explanation of how error signals move backward through a neural network.'
      },
      {
        title: 'Neural Networks and Deep Learning - Backpropagation',
        url: 'https://neuralnetworksanddeeplearning.com/chap2.html',
        source: 'Michael Nielsen',
        note: 'Step-by-step derivation that connects equations to implementable matrix operations.'
      }
    ]
  },

  'deep-learning-from-scratch/cnn-building-blocks-numpy': {
    insights: [
      {
        heading: 'Convolution encodes locality and weight sharing',
        body:
          'A convolutional layer assumes nearby pixels are related and that the same feature detector can be useful across the image. This drastically reduces parameters compared with dense layers and gives translation equivariance: shifting an input shifts the feature map. Implementing convolution in NumPy exposes stride, padding, channels, and receptive-field growth directly.'
      },
      {
        heading: 'Pooling and stride trade detail for invariance and cost',
        body:
          'Downsampling reduces spatial resolution, memory, and compute while making representations less sensitive to small translations. The trade-off is lost detail, which matters for localization and small objects. Modern CNNs use combinations of strided convolutions, pooling, normalization, and residual blocks to control this information bottleneck.'
      }
    ],
    references: [
      {
        title: 'Convolutional Neural Networks',
        url: 'https://cs231n.github.io/convolutional-networks/',
        source: 'CS231n',
        note: 'Practical explanation of convolution, pooling, padding, stride, and layer shapes.'
      },
      {
        title: 'A Guide to Convolution Arithmetic for Deep Learning',
        url: 'https://arxiv.org/abs/1603.07285',
        source: 'arXiv',
        note: 'Precise reference for calculating convolution, padding, stride, and transposed-convolution shapes.'
      },
      {
        title: 'Feature Visualization',
        url: 'https://distill.pub/2017/feature-visualization/',
        source: 'Distill',
        note: 'Builds intuition for what convolutional networks learn in intermediate representations.'
      }
    ]
  }
};
