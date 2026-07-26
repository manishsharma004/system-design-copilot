/** @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const lldDsaDeepKnowledge = {
  'lld-foundations/lld-problem-framing': {
    insights: [
      {
        heading: 'Scope as a design artifact, not a disclaimer',
        body: 'Strong LLD answers treat version-one scope as an explicit contract: actors, happy paths, and deferred features are written down before any class names appear. Interviewers reward candidates who can say what they are optimizing for (correctness, extensibility, or time-to-demo) because that choice drives every later trade-off. A bounded MVP also gives you a natural place to park follow-ups without letting the model sprawl.'
      },
      {
        heading: 'Invariants before implementation details',
        body: 'Translate requirements into enforceable rules—uniqueness, ordering, authorization, idempotency—rather than into a list of nouns. When you name invariants early, validation placement and state machines become obvious instead of improvised. This is the bridge between product language ("a user cannot book twice") and object design (illegal transitions rejected at the aggregate boundary).'
      }
    ],
    references: [
      {
        title: 'How to Approach a System Design Interview Question',
        url: 'https://www.educative.io/blog/system-design-interview-questions',
        source: 'Educative',
        note: 'Problem-framing habits from system design transfer directly to LLD scope control and requirement clarification.'
      },
      {
        title: 'Domain Model',
        url: 'https://martinfowler.com/eaaCatalog/domainModel.html',
        source: 'Martin Fowler',
        note: 'Fowler’s domain-model lens helps you decide which concepts deserve first-class types in version one.'
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        url: 'https://en.wikipedia.org/wiki/Design_Patterns',
        source: 'Gang of Four',
        note: 'Classic reference for why you should understand the problem before reaching for pattern names.'
      }
    ]
  },

  'lld-foundations/responsibilities-and-interfaces': {
    insights: [
      {
        heading: 'Single responsibility at the collaboration level',
        body: 'In interviews, SRP is less about tiny classes and more about obvious ownership: each type should have one reason to change that you can explain in one sentence. Orchestration, domain rules, and infrastructure side effects should not share the same mutation path. When ownership is clear, follow-up requirements land in predictable places instead of rippling through a god service.'
      },
      {
        heading: 'Interfaces as volatility seams, not ceremony',
        body: 'Introduce an interface when the dependency is likely to vary independently—storage, clocks, notification channels—not because every class “should” have one. Shape the contract from the caller’s needs: the smallest surface that preserves testability and swap-ability. Over-interfacing obscures the happy path; under-interfacing makes machine-coding rounds painful to extend live.'
      }
    ],
    references: [
      {
        title: 'SOLID Principles',
        url: 'https://en.wikipedia.org/wiki/SOLID',
        source: 'Wikipedia',
        note: 'Concise overview of responsibility, substitutability, and dependency direction—the vocabulary interviewers expect.'
      },
      {
        title: 'Dependency Inversion Principle',
        url: 'https://martinfowler.com/articles/injection.html',
        source: 'Martin Fowler',
        note: 'Explains why high-level modules should depend on abstractions, not concrete infrastructure.'
      },
      {
        title: 'Interface Segregation and Role Interfaces',
        url: 'https://refactoring.guru/design-patterns/bridge',
        source: 'Refactoring Guru',
        note: 'Useful when deciding whether a seam should be split into narrower collaborator contracts.'
      }
    ]
  },

  'lld-foundations/validation-errors-and-state': {
    insights: [
      {
        heading: 'Make illegal states unrepresentable where possible',
        body: 'Prefer constructors and transition methods that cannot produce inconsistent combinations over public setters that require external discipline. When full unrepresentability is too heavy for a timed round, centralize validation in one boundary method per aggregate. Interviewers notice whether invalid commands are rejected before side effects, not after partial mutation.'
      },
      {
        heading: 'Choose an error model and stick to it',
        body: 'Exceptions, result types, and domain error enums each signal different retry and recovery semantics to callers. Mixing styles within one workflow forces callers to guess how to handle failure. For LLD, articulate which failures are expected business outcomes (sold out, duplicate alias) versus programmer errors (null dependency).'
      }
    ],
    references: [
      {
        title: 'Replace Type Code with State/Strategy',
        url: 'https://refactoring.guru/replace-type-code-with-state-strategy',
        source: 'Refactoring Guru',
        note: 'Shows how explicit state objects keep transitions and validation from scattering across conditionals.'
      },
      {
        title: 'Value Object',
        url: 'https://martinfowler.com/bliki/ValueObject.html',
        source: 'Martin Fowler',
        note: 'Immutable value types are a practical way to validate invariants at construction time.'
      },
      {
        title: 'Effective Error Handling in Object-Oriented Systems',
        url: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/',
        source: 'Oracle Java Tutorials',
        note: 'Foundational guidance on when checked versus unchecked failures improve API clarity.'
      }
    ]
  },

  'lld-modeling/entities-value-objects-and-aggregates': {
    insights: [
      {
        heading: 'Identity versus description drives your type split',
        body: 'Entities are tracked over time by a stable identifier even when attributes change; value objects are compared by their data and replaced wholesale when updated. Mislabeling descriptive bundles (Money, Address, Seat) as entities creates accidental lifecycle complexity. In interviews, naming this distinction early often collapses an overgrown class diagram into a manageable model.'
      },
      {
        heading: 'Aggregate roots protect transactional invariants',
        body: 'An aggregate is the consistency boundary: external code mutates the cluster only through the root, and invariants inside the boundary are guaranteed atomically. Keep aggregates small enough that unrelated workflows do not contend on the same lock or transaction. Cross-aggregate rules are usually eventual—reference other roots by ID, not by direct object graph navigation.'
      }
    ],
    references: [
      {
        title: 'DDD Aggregate',
        url: 'https://martinfowler.com/bliki/DDD_Aggregate.html',
        source: 'Martin Fowler',
        note: 'Authoritative explanation of aggregate boundaries and why roots gate all mutations.'
      },
      {
        title: 'Value Object',
        url: 'https://martinfowler.com/bliki/ValueObject.html',
        source: 'Martin Fowler',
        note: 'Defines when immutability and value-based equality simplify validation and comparison.'
      },
      {
        title: 'Domain-Driven Design Reference',
        url: 'https://www.domainlanguage.com/ddd/reference/',
        source: 'Eric Evans / Domain Language',
        note: 'Canonical vocabulary for entities, value objects, and bounded contexts in object modeling.'
      }
    ]
  },

  'lld-modeling/composition-vs-inheritance': {
    insights: [
      {
        heading: 'Favor composition when behavior varies independently',
        body: 'Composition lets you combine policies (pricing, routing, notification) without freezing an inheritance hierarchy that new requirements will break. Strategy-style collaborators also make unit tests straightforward: swap a fake policy without subclassing production types. Reach for inheritance only when subtypes are true substitutes with the same semantic contract.'
      },
      {
        heading: 'Liskov substitutability is a behavioral test, not a syntax check',
        body: 'A subtype fails the contract when callers must know the concrete class to use it safely—classic examples include square/rectangle modeling mistakes or overrides that weaken preconditions. In LLD rounds, state the caller expectation first, then justify whether inheritance preserves it. If not, composition or a small interface usually ages better under follow-ups.'
      }
    ],
    references: [
      {
        title: 'Composition Over Inheritance',
        url: 'https://en.wikipedia.org/wiki/Composition_over_inheritance',
        source: 'Wikipedia',
        note: 'Summarizes when object assembly beats class hierarchies for evolving requirements.'
      },
      {
        title: 'Liskov Substitution Principle',
        url: 'https://en.wikipedia.org/wiki/Liskov_substitution_principle',
        source: 'Wikipedia',
        note: 'The substitutability bar every inheritance tree must pass in interview designs.'
      },
      {
        title: 'Strategy Pattern',
        url: 'https://refactoring.guru/design-patterns/strategy',
        source: 'Refactoring Guru',
        note: 'The usual composition-based alternative when algorithms or policies need to vary at runtime.'
      }
    ]
  },

  'lld-modeling/workflow-and-state-modeling': {
    insights: [
      {
        heading: 'Orchestration should read like a script, not a maze',
        body: 'Workflow services exist to sequence steps: validate, load state, apply domain command, persist, publish side effects. Each step should be visible in one place so interviewers can follow the story top to bottom. When orchestration logic hides inside entities, or entity rules leak into controllers, follow-up features like cancellation become rewrite projects.'
      },
      {
        heading: 'Domain objects own transitions; coordinators own timing',
        body: 'Let aggregates answer “is this transition legal?” while application services answer “when do we call which collaborator?” That split keeps state machines testable without mocking email gateways. It also prepares you for common follow-ups: retries and notifications attach at the orchestration edge without rewriting core invariants.'
      }
    ],
    references: [
      {
        title: 'Application Service',
        url: 'https://martinfowler.com/eaaCatalog/applicationService.html',
        source: 'Martin Fowler',
        note: 'Describes the coordinator role that sequences domain operations without owning business rules.'
      },
      {
        title: 'State Pattern',
        url: 'https://refactoring.guru/design-patterns/state',
        source: 'Refactoring Guru',
        note: 'Useful when lifecycle states multiply and transition rules deserve explicit types.'
      },
      {
        title: 'Saga Pattern Overview',
        url: 'https://microservices.io/patterns/data/saga.html',
        source: 'microservices.io',
        note: 'Bridges multi-step workflows to distributed consistency when LLD follow-ups scale out.'
      }
    ]
  },

  'lld-extensibility/strategy-factory-and-builder': {
    insights: [
      {
        heading: 'Name the axis of change before naming the pattern',
        body: 'Strategy isolates runtime algorithm variation; factories hide construction rules that would otherwise duplicate validation across callers; builders tame objects with many optional, order-sensitive parts. Interviewers penalize pattern dumping—justify each with a concrete follow-up (“new pricing rule”, “new storage backend”, “complex ticket with optional add-ons”). If a plain function or map would work, say so.'
      },
      {
        heading: 'Keep pattern interfaces embarrassingly small',
        body: 'A strategy with one method beats a kitchen-sink interface that forces implementers to no-op unrelated operations. Factories should return objects already in a valid initial state, not partially configured shells. Builders earn their keep when staged validation or readable assembly matters; otherwise they add navigation cost without clarity.'
      }
    ],
    references: [
      {
        title: 'Strategy Pattern',
        url: 'https://refactoring.guru/design-patterns/strategy',
        source: 'Refactoring Guru',
        note: 'Canonical treatment of swapping algorithms without changing the orchestrating client.'
      },
      {
        title: 'Factory Method Pattern',
        url: 'https://refactoring.guru/design-patterns/factory-method',
        source: 'Refactoring Guru',
        note: 'When creation logic should vary or stay decoupled from product types.'
      },
      {
        title: 'Builder Pattern',
        url: 'https://refactoring.guru/design-patterns/builder',
        source: 'Refactoring Guru',
        note: 'Stepwise construction for complex objects with optional components and validation gates.'
      }
    ]
  },

  'lld-extensibility/observer-dependency-inversion-and-events': {
    insights: [
      {
        heading: 'Publish facts, not commands, from the domain core',
        body: 'After a successful state change, emit a domain event describing what happened (OrderPlaced, SeatReserved) rather than telling subscribers exactly what to do. That keeps core logic focused on invariants while analytics, email, and search indexing subscribe independently. Strong answers specify sync versus async delivery and what happens when a subscriber fails.'
      },
      {
        heading: 'Dependency inversion protects readability under change',
        body: 'High-level workflow code should depend on narrow abstractions—Repository, Notifier, Clock—not on SMTP clients or SQL drivers. Inversion is not about indirection for its own sake; it localizes volatility so new integrations become new adapters. Mention test doubles here: the same seam that supports a fake repository supports a future cloud implementation.'
      }
    ],
    references: [
      {
        title: 'Observer Pattern',
        url: 'https://refactoring.guru/design-patterns/observer',
        source: 'Refactoring Guru',
        note: 'Foundation for decoupling core actions from reactive side effects.'
      },
      {
        title: 'Inversion of Control Containers and the Dependency Injection Pattern',
        url: 'https://martinfowler.com/articles/injection.html',
        source: 'Martin Fowler',
        note: 'Explains dependency inversion and injection as practical design tools, not framework magic.'
      },
      {
        title: 'Domain Events',
        url: 'https://martinfowler.com/eaaDev/DomainEvent.html',
        source: 'Martin Fowler',
        note: 'How event-style decoupling keeps domain models ignorant of downstream integrations.'
      }
    ]
  },

  'lld-extensibility/repositories-caching-and-persistence-seams': {
    insights: [
      {
        heading: 'Repositories speak use-case language, not table shapes',
        body: 'Methods like findAvailableSeatsForShow or saveBooking are clearer than generic save/getById when they encode domain intent and transaction scope. Leaking SQL shapes or cache key formats into services erodes the model’s readability. The repository is an anti-corruption layer between storage technology and your object graph.'
      },
      {
        heading: 'Decide cache ownership before adding a cache',
        body: 'Caches belong behind the same seam when they are an implementation detail of data access, but callers must understand staleness guarantees. Document whether reads may be eventually consistent and who invalidates on writes. In interviews, a well-placed “read-through cache behind the repository” beats sprinkling map lookups through business logic.'
      }
    ],
    references: [
      {
        title: 'Repository',
        url: 'https://martinfowler.com/eaaCatalog/repository.html',
        source: 'Martin Fowler',
        note: 'Defines the persistence gateway pattern in domain-friendly terms.'
      },
      {
        title: 'Patterns of Enterprise Application Architecture — Cache-Aside',
        url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside',
        source: 'Microsoft Azure Architecture Center',
        note: 'Operational guidance on placing caching next to persistence without muddying domain rules.'
      },
      {
        title: 'PoEAA: Data Mapper',
        url: 'https://martinfowler.com/eaaCatalog/dataMapper.html',
        source: 'Martin Fowler',
        note: 'Keeps mapping between storage records and domain objects out of entity methods.'
      }
    ]
  },

  'lld-machine-coding/machine-coding-skeleton-and-iteration': {
    insights: [
      {
        heading: 'Vertical slice first, abstraction second',
        body: 'Implement one end-to-end path—create, mutate, query—before factories, observers, or persistence adapters. This proves the model quickly and gives the interviewer a mental anchor for follow-ups. Narrate the roadmap aloud: “Next I would extract a strategy for pricing and stub the repository.” That signals senior judgment without burning clock on unused layers.'
      },
      {
        heading: 'Stable public API, evolving internals',
        body: 'Choose method names and entry points early so refactors stay behind a coherent façade. Small, well-named types beat a single Service class that accretes every requirement. Pause after each milestone to summarize trade-offs; interviewers often score communication as heavily as syntax.'
      }
    ],
    references: [
      {
        title: 'Vertical Slice Architecture',
        url: 'https://jimmybogard.com/vertical-slice-architecture/',
        source: 'Jimmy Bogard',
        note: 'Incremental delivery mindset that maps well to timed machine-coding rounds.'
      },
      {
        title: 'Refactoring: Improving the Design of Existing Code',
        url: 'https://refactoring.com/',
        source: 'Martin Fowler',
        note: 'Catalog of safe, small refactors to apply after the first working slice.'
      },
      {
        title: 'Clean Code — Chapter on Classes',
        url: 'https://www.oreilly.com/library/view/clean-code-a/9780136083238/',
        source: 'Robert C. Martin',
        note: 'Guidance on class cohesion and naming that keeps live-coded designs readable.'
      }
    ]
  },

  'lld-machine-coding/testing-seams-and-refactoring': {
    insights: [
      {
        heading: 'Test the rules that matter, not the boilerplate',
        body: 'Seams around time, randomness, IDs, and external gateways let you prove invariants with fast fakes. One focused test on “cannot cancel after departure” communicates more design quality than exhaustive getter coverage. In live rounds, describing the test you would write is often enough if time is tight.'
      },
      {
        heading: 'Refactor toward domain language, not utility soup',
        body: 'Extract when a method mixes decision logic with infrastructure, or when a policy will vary in the next follow-up. Avoid premature abstraction layers that obscure the happy path. State acceptable interview debt explicitly—hard-coded config or in-memory store—then name the first refactor you would do with another ten minutes.'
      }
    ],
    references: [
      {
        title: 'Test Double',
        url: 'https://martinfowler.com/bliki/TestDouble.html',
        source: 'Martin Fowler',
        note: 'Vocabulary for fakes, stubs, and spies at dependency seams in LLD code.'
      },
      {
        title: 'Extract Method',
        url: 'https://refactoring.guru/extract-method',
        source: 'Refactoring Guru',
        note: 'The safest live refactor when a method grows beyond one clear responsibility.'
      },
      {
        title: 'Working Effectively with Legacy Code',
        url: 'https://www.oreilly.com/library/view/working-effectively-with/0131177052/',
        source: 'Michael Feathers',
        note: 'Seam techniques for introducing tests without rewriting the whole design.'
      }
    ]
  },

  'lld-machine-coding/concurrency-followups-and-scale-bridges': {
    insights: [
      {
        heading: 'Name shared mutable hotspots explicitly',
        body: 'Thread-safety answers start by listing what concurrent actors touch: counters, caches, seat maps, singleton registries. Then pick a strategy—per-key locking, copy-on-write, atomic operations, or serializing through a single worker—that matches contention. Hand-waving “I would synchronize” without scope and deadlock awareness weakens otherwise solid designs.'
      },
      {
        heading: 'Bridge to scale without throwing away the model',
        body: 'When interviewers pivot to distributed scale, show what stays local object logic versus what becomes infrastructure: in-memory maps become databases, observer calls become queues, ID generation becomes a central service. Reuse abstractions where they still fit; admit when a process-local lock must become distributed coordination. The first scaling step matters more than a full cloud diagram.'
      }
    ],
    references: [
      {
        title: 'Java Concurrency in Practice',
        url: 'https://jcip.net/',
        source: 'Brian Goetz',
        note: 'Foundational guidance on locks, visibility, and safe publication for shared state.'
      },
      {
        title: 'Little’s Law and Practical Scalability',
        url: 'https://aws.amazon.com/builders-library/speed-as-a-habit/',
        source: 'Amazon Builders\' Library',
        note: 'Connects local design choices to throughput and latency when follow-ups turn operational.'
      },
      {
        title: 'Message Queue Pattern',
        url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling',
        source: 'Microsoft Azure Architecture Center',
        note: 'Typical bridge from synchronous observer callbacks to scaled-out asynchronous processing.'
      }
    ]
  },

  'dsa-foundations/arrays-hashmaps-and-two-pointers': {
    insights: [
      {
        heading: 'Hash maps trade space for O(1) lookups',
        body: 'Frequency counts, complement searches (target - x), and last-seen indices are the workhorses behind many array optimizations. State the brute force first, then show which lookup you are eliminating. Watch for hash collisions only when interviewers push on worst-case analysis; for most rounds, expected linear time with O(n) extra space is the target.'
      },
      {
        heading: 'Two pointers encode an invariant on sorted or paired walks',
        body: 'Left/right scans work when monotonic movement preserves correctness—sorted arrays, palindrome checks, container-with-most-water style greed. For unsorted inputs, sorting may be worth O(n log n) if it unlocks a two-pointer proof. Always narrate the invariant: “left only moves when …, right only moves when …”.'
      }
    ],
    references: [
      {
        title: 'Two Pointers Technique',
        url: 'https://cp-algorithms.com/others/two_pointers.html',
        source: 'CP-Algorithms',
        note: 'Formal treatment of when paired indices preserve correctness and complexity.'
      },
      {
        title: 'LeetCode Patterns — Arrays & Hashing',
        url: 'https://seanprashad.com/leetcode-patterns/',
        source: 'Sean Prashad',
        note: 'Curated pattern map connecting classic array/hash problems to template approaches.'
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
        source: 'MIT Press',
        note: 'Authoritative reference for hash table analysis and amortized bounds.'
      }
    ]
  },

  'dsa-foundations/linked-lists-binary-search-and-ordering': {
    insights: [
      {
        heading: 'Linked lists reward pointer discipline and dummy nodes',
        body: 'Reversal, merge, and cycle detection problems hinge on saving next pointers before rewiring and using sentinel nodes to simplify head-edge cases. State whether you mutate in place or allocate new nodes—interviewers often follow up on space. Fast/slow pointers detect cycles and midpoints in O(1) extra space.'
      },
      {
        heading: 'Binary search is about the predicate, not just sorted arrays',
        body: 'Binary search generalizes to any monotonic decision function: first true in [false*, true*], minimum feasible answer, rotated sorted arrays. Define the invariant on the search range each iteration. Off-by-one errors come from unclear whether mid is inclusive or exclusive—pick a template and stick to it.'
      }
    ],
    references: [
      {
        title: 'Binary Search',
        url: 'https://cp-algorithms.com/num_methods/binary_search.html',
        source: 'CP-Algorithms',
        note: 'Covers discrete binary search and boundary handling beyond vanilla sorted lookup.'
      },
      {
        title: 'NeetCode Roadmap — Linked List',
        url: 'https://neetcode.io/roadmap',
        source: 'NeetCode',
        note: 'Structured practice path for pointer manipulation and list classic problems.'
      },
      {
        title: 'MIT 6.006 — Binary Search Lecture Notes',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        source: 'MIT OpenCourseWare',
        note: 'University-level rigor on correctness proofs and loop invariants for search.'
      }
    ]
  },

  'dsa-foundations/trees-heaps-and-intro-dp': {
    insights: [
      {
        heading: 'Tree traversals are state machines over subtrees',
        body: 'DFS (pre/in/post) and BFS each imply different information availability at each node—choose based on whether you need ancestors, descendants, or level order. Recursion is natural when subtree answers compose; iterative stacks/queues avoid depth limits on skewed trees. Always state base case (null node) and what you return upward.'
      },
      {
        heading: 'Intro DP: optimal substructure plus overlapping subproblems',
        body: 'Before coding, identify the state (index, remaining capacity, node) and recurrence. Bottom-up tabulation often clarifies complexity; top-down memoization is faster to write under pressure. Heaps solve “best next” scheduling problems—know when a priority queue beats resorting a list each step.'
      }
    ],
    references: [
      {
        title: 'Binary Search Trees — CLRS Topic Overview',
        url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
        source: 'MIT Press / CLRS',
        note: 'Canonical reference for tree operations, balances, and amortized analyses.'
      },
      {
        title: 'Heap Data Structure',
        url: 'https://cp-algorithms.com/data_structures/binary_heap.html',
        source: 'CP-Algorithms',
        note: 'Explains heap operations underpinning top-k and merge-k-sorted-streams patterns.'
      },
      {
        title: 'Dynamic Programming — MIT 6.006',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-19-dynamic-programming-i/',
        source: 'MIT OpenCourseWare',
        note: 'Introduces state design and recurrence building for interview-grade DP.'
      }
    ]
  },

  'dsa-core-patterns/sliding-window-prefix-and-interval-style-thinking': {
    insights: [
      {
        heading: 'Sliding windows maintain a running feasible region',
        body: 'Expand the right edge until the constraint breaks, then shrink from the left until feasible again—track counts, sums, or distinct elements as you go. Fixed-size windows are a special case where only one pointer may need to move each step. State the window invariant aloud; it is the proof of linear time.'
      },
      {
        heading: 'Prefix sums and difference arrays answer range queries fast',
        body: 'Prefix sums turn range-sum queries into O(1) after O(n) preprocessing; difference arrays help bulk interval updates. For interval scheduling, sort by end time or start time depending on whether you maximize non-overlapping picks or merge overlaps. Many “hard” array problems are window or prefix problems in disguise.'
      }
    ],
    references: [
      {
        title: 'Sliding Window Pattern',
        url: 'https://leetcode.com/discuss/study-guide/1688904/sliding-window-for-beginners',
        source: 'LeetCode Discuss',
        note: 'Widely used study guide for fixed and variable window templates.'
      },
      {
        title: 'Prefix Sum Array',
        url: 'https://cp-algorithms.com/algebra/prefix-sums.html',
        source: 'CP-Algorithms',
        note: 'Formal prefix-sum and difference-array techniques for range queries and updates.'
      },
      {
        title: 'NeetCode — Sliding Window',
        url: 'https://neetcode.io/roadmap',
        source: 'NeetCode',
        note: 'Practice ordering for window problems from brute force to optimized scans.'
      }
    ]
  },

  'dsa-core-patterns/recursion-backtracking-and-search-trees': {
    insights: [
      {
        heading: 'Backtracking is DFS with explicit undo',
        body: 'Choose → explore → unchoose is the template for subsets, permutations, boards, and path finding. Prune early when partial states cannot lead to valid solutions—strong pruning often matters more than micro-optimizations. Track depth and branching factor when stating complexity; interviewers accept exponential bounds with clear reasoning.'
      },
      {
        heading: 'Decision trees clarify base cases and ordering constraints',
        body: 'Draw the implicit tree before coding: what decision happens at each level, what is forbidden (duplicates, diagonals), and when you record an answer versus continue. For search problems on grids or graphs, mark visited cells in-place or with a set and restore state on retreat to keep memory predictable.'
      }
    ],
    references: [
      {
        title: 'Backtracking Algorithms',
        url: 'https://cp-algorithms.com/combinatorics/generating_combinations.html',
        source: 'CP-Algorithms',
        note: 'Combinatorial generation and pruning strategies shared across backtracking families.'
      },
      {
        title: 'LeetCode Explore — Recursion I & II',
        url: 'https://leetcode.com/explore/learn/card/recursion-i/',
        source: 'LeetCode',
        note: 'Official structured path for recursion fluency before tackling open-ended search.'
      },
      {
        title: 'Depth-First Search (DFS)',
        url: 'https://cp-algorithms.com/graph/depth-first-search.html',
        source: 'CP-Algorithms',
        note: 'DFS mechanics that underpin backtracking on graphs and grids.'
      }
    ]
  },

  'dsa-core-patterns/graphs-greedy-and-harder-dp': {
    insights: [
      {
        heading: 'Graphs: pick BFS, DFS, or shortest-path tooling deliberately',
        body: 'Unweighted shortest path → BFS; connectivity/cycles → DFS or union-find; non-negative weights → Dijkstra; general weights → Bellman-Ford (rare in interviews). Represent adjacency lists for sparse graphs. State whether the graph is directed, weighted, and cyclic before choosing an algorithm—wrong assumptions fail silently.'
      },
      {
        heading: 'Greedy needs an exchange argument; harder DP needs tighter state',
        body: 'Greedy works when local optimal choices align with global optimum—prove by sorting key or interval structure. Harder DP often adds dimensions (bitmasks, k transactions, two sequences). If state explodes, look for monotonic structure, rolling arrays, or reduction to a known subproblem.'
      }
    ],
    references: [
      {
        title: 'Breadth-First Search',
        url: 'https://cp-algorithms.com/graph/breadth-first-search.html',
        source: 'CP-Algorithms',
        note: 'Layered expansion for unweighted shortest paths and multi-source BFS variants.'
      },
      {
        title: 'Dijkstra\'s Algorithm',
        url: 'https://cp-algorithms.com/graph/dijkstra.html',
        source: 'CP-Algorithms',
        note: 'Standard reference for weighted shortest paths with non-negative edges.'
      },
      {
        title: 'Introduction to Algorithms — Dynamic Programming',
        url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
        source: 'MIT Press / CLRS',
        note: 'Rigorous DP frameworks applicable when interview problems add constraints or dimensions.'
      }
    ]
  },

  'dsa-company-rounds/amazon-online-assessment-practice': {
    insights: [
      {
        heading: 'Amazon OA rewards correct, readable baseline solutions',
        body: 'Online assessments emphasize passing hidden tests within time limits more than exotic optimizations. Implement the straightforward pattern—hash map, two pointers, BFS—then verify edge cases: empty input, duplicates, integer bounds. Narrate complexity even when not prompted; it mirrors Amazon’s leadership-principle communication bar.'
      },
      {
        heading: 'Practice under OA-like constraints',
        body: 'Use a fixed timer, avoid external libraries beyond standard collections, and test with custom cases before submit. Many Amazon-tagged problems are medium array/string or tree prompts with one sharp invariant. Rehearse reading problem statements carefully—off-by-one and misunderstanding input format are common failure modes.'
      }
    ],
    references: [
      {
        title: 'Interviewing at Amazon',
        url: 'https://www.amazon.jobs/en/landing_pages/interviewing-at-amazon',
        source: 'Amazon Jobs',
        note: 'Official overview of Amazon’s interview process and behavioral + technical expectations.'
      },
      {
        title: 'Amazon Leadership Principles',
        url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
        source: 'Amazon Jobs',
        note: 'Context for how communication, ownership, and bias for action show up in assessments.'
      },
      {
        title: 'LeetCode Company Guide — Amazon',
        url: 'https://leetcode.com/company/amazon/',
        source: 'LeetCode',
        note: 'Frequently reported Amazon-tagged problems to prioritize in OA-style practice.'
      }
    ]
  },

  'dsa-company-rounds/google-phone-and-onsite-practice': {
    insights: [
      {
        heading: 'Google rounds stress proof and complexity articulation',
        body: 'Phone screens often pair one coding problem with tight follow-ups on optimization or trade-offs. Expect clean code, explicit invariants, and willingness to revise after hints. Graph, tree, and binary search variants appear frequently; brute force → optimize is a expected narrative arc.'
      },
      {
        heading: 'Onsite depth: multiple problems, collaborative debugging',
        body: 'Onsite loops may include harder DP/graph twists or open-ended “what if input does not fit in memory?” extensions. Think aloud while testing edge cases; Google interviewers value how you incorporate feedback. Practice writing bug-free loops under mild pressure more than memorizing obscure templates.'
      }
    ],
    references: [
      {
        title: 'How We Hire — Google Careers',
        url: 'https://careers.google.com/how-we-hire/',
        source: 'Google Careers',
        note: 'Official description of Google’s hiring stages and what interviewers evaluate.'
      },
      {
        title: 'Google Technical Development Guide',
        url: 'https://www.techdevguide.withgoogle.com/paths/data-structures-and-algorithms/',
        source: 'Google Tech Dev Guide',
        note: 'Google-published skill map for data structures and algorithms preparation.'
      },
      {
        title: 'LeetCode Company Guide — Google',
        url: 'https://leetcode.com/company/google/',
        source: 'LeetCode',
        note: 'Community-reported Google-tagged problems for phone and onsite rehearsal.'
      }
    ]
  },

  'dsa-company-rounds/mixed-big-tech-round-practice': {
    insights: [
      {
        heading: 'Pattern recognition beats company-specific trivia',
        body: 'Microsoft, Meta, Apple, and similar companies converge on medium array/string, tree, graph, and DP problems with company-flavored follow-ups. Master a small set of templates—window, monotonic stack, union-find, topological sort—and map new prompts to them quickly. Interviewers across firms reward clear reasoning over memorized solutions.'
      },
      {
        heading: 'Adapt communication to loop style',
        body: 'Some loops are pure coding; others are collaborative with partial implementations. Practice stating assumptions, writing tests, and refactoring after hints—these behaviors transfer across big-tech formats. Track which patterns recur in your mixed set and revisit weak areas instead of grinding random hard problems.'
      }
    ],
    references: [
      {
        title: 'LeetCode Patterns',
        url: 'https://seanprashad.com/leetcode-patterns/',
        source: 'Sean Prashad',
        note: 'Cross-company pattern grouping useful when practicing mixed big-tech sets.'
      },
      {
        title: 'NeetCode 150',
        url: 'https://neetcode.io/practice',
        source: 'NeetCode',
        note: 'Curated problem list covering the majority of recurring interview patterns.'
      },
      {
        title: 'Meta Careers — Interviewing',
        url: 'https://www.metacareers.com/life/preparing-for-your-interview',
        source: 'Meta Careers',
        note: 'Representative big-tech guidance on coding interview expectations and preparation.'
      }
    ]
  },

  'dsa-mock-loops/easy-warmup-round': {
    insights: [
      {
        heading: 'Warmups build interview rhythm, not just syntax',
        body: 'Easy problems are where you practice the full loop: clarify constraints, propose approach, code, test, state complexity—under five to ten minutes. Speed with zero careless errors matters more than clever tricks. Use warmups to lock in templates for hash maps, two pointers, and basic tree recursion before medium/hard sets.'
      },
      {
        heading: 'Verbalize the invariant even when the code is short',
        body: 'Interviewers infer seniority from explanation quality on “simple” tasks. Say why the solution is correct and which edge cases you checked (empty, single element, duplicates). Building this habit on easy rounds prevents sloppy reasoning when pressure rises later in the loop.'
      }
    ],
    references: [
      {
        title: 'LeetCode Explore — Array 101',
        url: 'https://leetcode.com/explore/learn/card/array-and-string/',
        source: 'LeetCode',
        note: 'Foundational array/string card deck aligned with easy warmup practice.'
      },
      {
        title: 'NeetCode Roadmap — Easy Foundations',
        url: 'https://neetcode.io/roadmap',
        source: 'NeetCode',
        note: 'Ordered easy problems to establish pattern vocabulary before timed mocks.'
      },
      {
        title: 'Big-O Cheat Sheet',
        url: 'https://www.bigocheatsheet.com/',
        source: 'bigocheatsheet.com',
        note: 'Quick complexity reference when closing easy problems with analysis.'
      }
    ]
  },

  'dsa-mock-loops/cross-company-medium-round': {
    insights: [
      {
        heading: 'Medium mocks test pattern selection under time pressure',
        body: 'Target 25–35 minutes per problem with one optimization pass. Medium company problems usually have a O(n²) trap and a O(n) or O(n log n) intended path—name both. If stuck after eight minutes, switch approaches deliberately rather than debugging a wrong invariant.'
      },
      {
        heading: 'Cross-company sets expose recurring twist types',
        body: 'Duplicates, negative numbers, implicit graphs, and stateful DP transitions appear across employers. After each mock, log the pattern you missed and one sentence on the invariant. Spaced repetition on weak patterns beats volume on already-solved categories.'
      }
    ],
    references: [
      {
        title: 'LeetCode Study Plan — Top Interview 150',
        url: 'https://leetcode.com/studyplan/top-interview-150/',
        source: 'LeetCode',
        note: 'Official medium-weight study plan mirroring cross-company mock difficulty.'
      },
      {
        title: 'CP-Algorithms — Algorithm Catalog',
        url: 'https://cp-algorithms.com/',
        source: 'CP-Algorithms',
        note: 'Deep reference when a medium mock requires formal graph, string, or math tooling.'
      },
      {
        title: 'Pramp — Technical Interview Practice',
        url: 'https://www.pramp.com/',
        source: 'Pramp',
        note: 'Peer mock interviews to practice medium-round communication and timing.'
      }
    ]
  },

  'dsa-mock-loops/hard-stretch-round': {
    insights: [
      {
        heading: 'Hard stretch rounds train decomposition, not full solves',
        body: 'It is normal not to finish every hard problem in a mock—success means identifying the right family (DP, graph, greedy proof) and making measurable progress. Write the brute force or small-state DP first; optimize only when the recurrence is correct. Interviewers at top companies often reward approach and trade-off discussion when time expires.'
      },
      {
        heading: 'Know when to pivot during a stretch session',
        body: 'If the state space is wrong, step back and re-derive rather than forcing code. Hard problems frequently reduce to a known subproblem with an extra constraint—search for sorting, monotonic structure, or bitmask size ≤ 20. End each stretch attempt with complexity bounds and what you would try next.'
      }
    ],
    references: [
      {
        title: 'LeetCode Discuss — Dynamic Programming Patterns',
        url: 'https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns',
        source: 'LeetCode Discuss',
        note: 'Community pattern catalog for the DP-heavy problems common in hard mocks.'
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/',
        source: 'MIT Press',
        note: 'Authoritative algorithms text for proving correctness on stretch-level problems.'
      },
      {
        title: 'Competitive Programmer\'s Handbook',
        url: 'https://cses.fi/book/book.pdf',
        source: 'CSES / Antti Laaksonen',
        note: 'Free reference with advanced techniques used in hard interview and contest problems.'
      }
    ]
  }
};
