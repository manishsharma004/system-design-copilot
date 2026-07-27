/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldMachineCodingChapters = {
  "lld-machine-coding/machine-coding-skeleton-and-iteration": {
    "title": "Machine-coding skeletons and incremental delivery",
    "readingTime": "80-100 min",
    "premise": "Timed machine-coding rounds reward a coherent running first slice more than polished scaffolding. This chapter rehearses vertical-slice delivery, dependency-ordered types, narrated seams, and reviewer-friendly iteration that stays explainable after every milestone.",
    "parts": [
      {
        "id": "vertical-slice-first",
        "heading": "Smallest end-to-end slice first",
        "paragraphs": [
          "Implement one path\u2014create, mutate, query\u2014before factories, observers, or fancy persistence. A running happy path is the main milestone in a forty-five to ninety minute round. A slightly messy working demo scores better than elegant scaffolding that never runs.",
          "Choose the slice from your framing contract. If the prompt is a parking lot, enter and issue ticket may be enough before pricing sophistication.",
          "Resist building a framework for hypothetical day-two features. Abstraction follows proven behavior."
        ],
        "keyTerms": [
          {
            "term": "Vertical slice",
            "definition": "An end-to-end path through the model that proves create/mutate/query for one use case."
          },
          {
            "term": "Milestone",
            "definition": "A demonstrable checkpoint you can run and narrate before taking the next design risk."
          }
        ],
        "workedExample": {
          "title": "Minimal runnable parking slice",
          "body": "One entity, one service, one in-memory store, and a main driver. No patterns yet.",
          "language": "python",
          "code": "class Ticket:\n    def __init__(self, ticket_id: str, spot_id: str):\n        self.ticket_id = ticket_id\n        self.spot_id = spot_id\n        self.open = True\n\nclass LotService:\n    def __init__(self):\n        self._spots = {\"A1\": None, \"A2\": None}\n        self._seq = 0\n\n    def enter(self) -> Ticket:\n        for spot_id, occupant in self._spots.items():\n            if occupant is None:\n                self._seq += 1\n                ticket = Ticket(f\"t{self._seq}\", spot_id)\n                self._spots[spot_id] = ticket.ticket_id\n                return ticket\n        raise ValueError(\"lot full\")\n\nif __name__ == \"__main__\":\n    print(LotService().enter().ticket_id)"
        },
        "callout": {
          "tone": "interview",
          "body": "Say when the first demo will run. Then hit that time. Credibility compounds."
        },
        "checkYourself": [
          {
            "prompt": "What should you defer until after the first running slice?",
            "reveal": "Optional patterns, secondary actors, polish refactors, and infrastructure that does not change the version-one happy path."
          }
        ]
      },
      {
        "id": "dependency-order",
        "heading": "Introduce classes in dependency order",
        "paragraphs": [
          "Build types so the story stays readable: values and entities first, repositories or stores next, services next, main last. Jumping to a mega-service before entities exist produces setters everywhere.",
          "A practical layout is models/, services/, ports or adapters/, plus a tiny main driver. Even in one file, order definitions that way.",
          "Name public methods early so later refactors keep a stable facade."
        ],
        "callout": {
          "tone": "tip",
          "body": "If main cannot call a clear enter() yet, you are inventing helpers in the wrong order."
        },
        "checkYourself": [
          {
            "prompt": "Why define the entity before the service in a live round?",
            "reveal": "The service needs a place to put invariants; without the entity, orchestration becomes a bag of primitives."
          }
        ]
      },
      {
        "id": "narrate-next-seam",
        "heading": "Narrate the next seam before you fully build it",
        "paragraphs": [
          "Before extracting a pricing strategy or notifier port, tell the interviewer what axis of change you are isolating. That communication often scores as highly as syntax.",
          "Leave a short comment or a stub interface if time is tight, then finish the happy path. Coming back with a working demo beats a half-built pattern.",
          "Ask whether the follow-up is in scope now. Sometimes the interviewer only wanted to hear the seam."
        ],
        "callout": {
          "tone": "interview",
          "body": "\"Next I would extract FeePolicy here\" is a complete answer if they move on."
        },
        "checkYourself": [
          {
            "prompt": "When is a stub interface enough?",
            "reveal": "When you have identified volatility, kept the call site clean, and need remaining time for a runnable core rather than multiple adapters."
          }
        ]
      },
      {
        "id": "refactor-after-working",
        "heading": "Refactor only after a working slice exists",
        "paragraphs": [
          "Refactoring before a green demo risks spending the round on structure that never proves behavior. Get enter working, then extract.",
          "Prefer small, reversible moves: extract method, extract collaborator, rename. Avoid sweeping package reorganizations live.",
          "Re-run main after each refactor. Broken demos erase trust quickly."
        ],
        "workedExample": {
          "title": "Extract after the demo works",
          "body": "Pricing starts inline, then becomes a collaborator once enter/exit runs.",
          "language": "java",
          "code": "interface Pricing { int feeCents(int minutes); }\n\nfinal class HourlyPricing implements Pricing {\n    public int feeCents(int minutes) {\n        return ((minutes + 59) / 60) * 300;\n    }\n}\n\nfinal class TicketService {\n    private final Pricing pricing;\n    TicketService(Pricing pricing) { this.pricing = pricing; }\n    int quote(int minutes) { return pricing.feeCents(minutes); }\n}\n\nvoid main() {\n    System.out.println(new TicketService(new HourlyPricing()).quote(90));\n}"
        },
        "callout": {
          "tone": "warning",
          "body": "Large renames mid-round without a driver script are how candidates lose the thread."
        },
        "checkYourself": [
          {
            "prompt": "What is the first thing to do after an extract?",
            "reveal": "Re-run the happy-path driver or tests to prove behavior still holds."
          }
        ]
      },
      {
        "id": "explainable-milestones",
        "heading": "Stay explainable after every milestone",
        "paragraphs": [
          "Pause briefly after each milestone: what works, what is deferred, what you will do next. Interviewers track narrative as much as code volume.",
          "Keep the public API small. A few intention-revealing methods beat twenty getters.",
          "If you get lost, return to the frame: actor, flow, invariant, next command."
        ],
        "keyTerms": [
          {
            "term": "Facade stability",
            "definition": "Keeping entry-point names stable while internals evolve behind them."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "A one-minute recap every fifteen minutes prevents silent rabbit holes."
        },
        "checkYourself": [
          {
            "prompt": "What should a milestone recap include?",
            "reveal": "The demonstrated behavior, known limitations or non-goals, and the next seam or feature you will tackle."
          }
        ]
      },
      {
        "id": "timeboxing-tactics",
        "heading": "Timeboxing tactics for live coding",
        "paragraphs": [
          "Allocate roughly: framing and API sketch, core slice, one failure path, one extension seam, buffer for bugs. Exact ratios vary, but buffer is non-negotiable.",
          "When behind, cut polish and secondary actors first\u2014not the invariant of the core slice.",
          "When ahead, add a rejection path test or extract a volatile collaborator rather than decorative patterns."
        ],
        "callout": {
          "tone": "interview",
          "body": "Say your time plan once. It signals control even if you later adjust."
        },
        "checkYourself": [
          {
            "prompt": "What do you cut first when time is short?",
            "reveal": "Secondary features and pattern polish, while protecting the runnable happy path and the primary invariant."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Ship a vertical slice before abstractions.",
        "Build types in dependency order with a stable facade.",
        "Narrate seams early; finish them when they earn their time.",
        "Refactor only against a working demo and re-run after changes."
      ],
      "nextSteps": [
        "Time a sixty-minute parking-lot or booking slice with a main driver.",
        "Practice a fifteen-second milestone recap.",
        "List your personal cut-order when the clock is red."
      ]
    }
  },
  "lld-machine-coding/testing-seams-and-refactoring": {
    "title": "Testing seams, refactoring, and interview-safe cleanup",
    "readingTime": "70-90 min",
    "premise": "Strong machine-coding answers prove the rules that matter through tiny seams, then refactor toward clearer responsibilities without rewriting mid-demo. This chapter focuses on business-rule tests, fake-friendly ports, safe cleanup moves, and honest talk about remaining polish.",
    "parts": [
      {
        "id": "test-the-rule",
        "heading": "Test the business rule, not the plumbing",
        "paragraphs": [
          "One focused test on cannot cancel after departure communicates more design quality than exhaustive getter coverage. Aim tests at invariants and rejection paths.",
          "In live rounds, describing the test you would write is often enough if time is tight. Still prefer one real automated check when the harness is cheap.",
          "Name tests after rules: rejects_double_booking, expires_hold_after_deadline."
        ],
        "keyTerms": [
          {
            "term": "Invariant test",
            "definition": "A check that a domain rule holds under a command, including illegal commands that must fail."
          },
          {
            "term": "Characterization test",
            "definition": "A test that locks current behavior before a refactor when coverage is thin."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If a test only asserts that a mock was called, ask whether a state assertion would prove more."
        },
        "checkYourself": [
          {
            "prompt": "Which is the higher-value first test for booking?",
            "reveal": "Rejecting a double-book of the same seat, because it encodes the core invariant rather than wiring details."
          }
        ]
      },
      {
        "id": "wrap-volatility",
        "heading": "Wrap time, ids, storage, and side effects",
        "paragraphs": [
          "Seams around clocks, id generators, repositories, and notifiers let you freeze the world in tests. Without them, flaky time and real I/O waste the round.",
          "Keep seams tiny. A Clock.now() port beats a sprawling SystemContext.",
          "Use the same seams production will use so tests are not a parallel design."
        ],
        "workedExample": {
          "title": "Fixed clock for expiry tests",
          "body": "Injecting time makes hold expiry deterministic.",
          "language": "python",
          "code": "from dataclasses import dataclass\nfrom datetime import datetime, timedelta\n\n@dataclass\nclass Hold:\n    expires_at: datetime\n    open: bool = True\n\n    def expire_if_needed(self, now: datetime) -> None:\n        if self.open and now >= self.expires_at:\n            self.open = False\n\nclass FixedClock:\n    def __init__(self, now: datetime):\n        self.now = now\n\nhold = Hold(expires_at=datetime(2026, 1, 1, 12, 0, 0))\nclock = FixedClock(datetime(2026, 1, 1, 12, 0, 1))\nhold.expire_if_needed(clock.now)\nprint(hold.open)"
        },
        "callout": {
          "tone": "interview",
          "body": "Mentioning Clock and IdGenerator seams early reassures interviewers you can test edge paths."
        },
        "checkYourself": [
          {
            "prompt": "Why is Instant.now() inside domain methods awkward?",
            "reveal": "It couples rules to wall time and makes expiry and business-day tests nondeterministic without invasive patching."
          }
        ]
      },
      {
        "id": "refactor-toward-responsibility",
        "heading": "Refactor toward clearer responsibility",
        "paragraphs": [
          "Extract when a method mixes decision logic with infrastructure, or when a policy will vary in the next follow-up. Avoid premature layers that obscure the happy path.",
          "Rename toward domain language. chargeCustomer is better than handleStuff.",
          "Keep diffs small and narrated: \"extracting pricing so checkout stays orchestration-only.\""
        ],
        "callout": {
          "tone": "warning",
          "body": "Refactoring toward \"cleaner architecture\" without a responsibility sentence often creates indirection soup."
        },
        "checkYourself": [
          {
            "prompt": "What is a good extract trigger mid-interview?",
            "reveal": "A method that both mutates domain state and talks to I/O, or a conditional policy that a follow-up just expanded."
          }
        ]
      },
      {
        "id": "interview-safe-cleanup",
        "heading": "Keep cleanup interview-safe",
        "paragraphs": [
          "Avoid big rewrites. Prefer extract method, move method, replace conditional with collaborator, introduce parameter object\u2014moves you can finish in minutes.",
          "Do not reformat the entire file or chase style nits while the interviewer waits on a missing failure path.",
          "Leave the demo green at every step. A broken intermediate state is costly."
        ],
        "workedExample": {
          "title": "Extract method without changing behavior",
          "body": "A pure helper clarifies pricing math while the service API stays stable.",
          "language": "java",
          "code": "final class FeeCalculator {\n    static int hourlyFee(int minutes, int ratePerHour) {\n        int hours = (minutes + 59) / 60;\n        return hours * ratePerHour;\n    }\n}\n\nfinal class Checkout {\n    int quote(int minutes) {\n        return FeeCalculator.hourlyFee(minutes, 300);\n    }\n}\n\nvoid main() {\n    System.out.println(new Checkout().quote(61));\n}"
        },
        "callout": {
          "tone": "tip",
          "body": "If a cleanup needs more than five minutes, park it and state it as future polish."
        },
        "checkYourself": [
          {
            "prompt": "Name one unsafe live refactor.",
            "reveal": "Changing persistence representation and public APIs simultaneously without a driver or tests."
          }
        ]
      },
      {
        "id": "talk-about-debt",
        "heading": "Talk openly about remaining polish",
        "paragraphs": [
          "State acceptable interview debt explicitly: hard-coded config, in-memory store, sync email. Then name the first refactor you would do with another ten minutes.",
          "This honesty reads as seniority. Pretending the demo is production-ready invites harsh follow-ups.",
          "Tie debt to seams you already introduced so the next steps feel incremental."
        ],
        "callout": {
          "tone": "interview",
          "body": "End with: \"If I had ten more minutes, I would...\" and pick one high-leverage item."
        },
        "checkYourself": [
          {
            "prompt": "What is a good ten-minute next step after a working slice?",
            "reveal": "Examples: add the primary rejection test, extract a volatile policy, or replace a sync listener with a Notifier port."
          }
        ]
      },
      {
        "id": "test-doubles-vocabulary",
        "heading": "Use precise test-double vocabulary",
        "paragraphs": [
          "Fakes carry working logic, such as an in-memory repository. Stubs return canned answers. Mocks verify interactions. Spies record calls. Using the right word prevents over-mocking.",
          "Prefer fakes for repositories and stubs for clocks. Mocking every collaborator makes tests brittle and design-blind.",
          "If you need a mock to assert five interactions, the unit under test may be doing too much."
        ],
        "keyTerms": [
          {
            "term": "Fake",
            "definition": "A lightweight working implementation suitable for tests, such as an in-memory repository."
          },
          {
            "term": "Stub",
            "definition": "A double that returns prepared values without real behavior."
          },
          {
            "term": "Mock",
            "definition": "A double that verifies how it was interacted with."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "In LLD, a good fake repository often replaces a pile of mocks."
        },
        "checkYourself": [
          {
            "prompt": "When is a fake better than a mock for storage?",
            "reveal": "When you need to assert resulting state across saves and reads, which a behavioral fake expresses more naturally than interaction mocks."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Prove core invariants and rejection paths first.",
        "Wrap time, ids, storage, and side effects behind tiny ports.",
        "Refactor in small, narrated moves toward clearer ownership.",
        "Name remaining debt and the next polish step explicitly."
      ],
      "nextSteps": [
        "Add FixedClock and prove one expiry rule.",
        "Replace a mocked repository with an in-memory fake.",
        "Practice a closing \"ten more minutes\" statement."
      ]
    }
  },
  "lld-machine-coding/concurrency-followups-and-scale-bridges": {
    "title": "Concurrency follow-ups and scale bridges",
    "readingTime": "80-100 min",
    "premise": "Concurrency and scale questions should extend your object model, not erase it. This chapter shows how to name shared mutable hotspots, protect the smallest critical section, choose locking or partitioning deliberately, and bridge local design into durable coordination without jumping straight to HLD tourism.",
    "parts": [
      {
        "id": "name-hotspots",
        "heading": "Identify shared mutable state first",
        "paragraphs": [
          "Thread-safety answers start by listing what concurrent actors touch: counters, caches, seat maps, singleton registries. Then pick a strategy\u2014per-key locking, copy-on-write, atomic operations, or serializing through a single worker\u2014that matches contention.",
          "Hand-waving \"I would synchronize\" without scope and deadlock awareness weakens otherwise solid designs.",
          "Draw the hotspot: which method mutates which structure under which key."
        ],
        "keyTerms": [
          {
            "term": "Shared mutable state",
            "definition": "Data that multiple threads or requests can read and write, creating race conditions if unprotected."
          },
          {
            "term": "Critical section",
            "definition": "The smallest code region that must run atomically to preserve an invariant."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "List the hotspots aloud before naming locks. Interviewers listen for that order."
        },
        "checkYourself": [
          {
            "prompt": "What is the hotspot in a seat booking service?",
            "reveal": "Usually the seat availability map or row for a show\u2014the structure that decides whether a seat can move from free to reserved."
          }
        ]
      },
      {
        "id": "smallest-critical-section",
        "heading": "Protect the smallest invariant-bearing section",
        "paragraphs": [
          "Lock only what the invariant needs. Holding a global lock across email send is how demos deadlock and stall.",
          "Prefer per-key locks when contention partitions naturally by show_id or account_id. Document lock ordering if multiple keys can be taken.",
          "Validate, then mutate under the lock; perform slow side effects after release when safe."
        ],
        "workedExample": {
          "title": "Per-seat reservation with a monitor",
          "body": "The lock covers check-and-set only. Notification happens outside.",
          "language": "java",
          "code": "import java.util.HashSet;\nimport java.util.Set;\n\nfinal class SeatMap {\n    private final Set<String> reserved = new HashSet<>();\n    synchronized boolean tryReserve(String seatId) {\n        if (reserved.contains(seatId)) return false;\n        reserved.add(seatId);\n        return true;\n    }\n}\n\nfinal class BookingService {\n    private final SeatMap seats = new SeatMap();\n    String book(String seatId) {\n        if (!seats.tryReserve(seatId)) {\n            throw new IllegalStateException(\"taken\");\n        }\n        return \"booked:\" + seatId; // notify after lock released\n    }\n}"
        },
        "callout": {
          "tone": "warning",
          "body": "A synchronized method that calls into unknown listeners invites deadlocks."
        },
        "checkYourself": [
          {
            "prompt": "Why is per-key locking often better than one global lock?",
            "reveal": "Independent keys do not contend, so throughput stays higher while each invariant is still atomically protected."
          }
        ]
      },
      {
        "id": "partition-or-immutable",
        "heading": "Partitioning and immutability alternatives",
        "paragraphs": [
          "Sometimes locking is the wrong default. Immutable snapshots, copy-on-write structures, atomic compare-and-swap on a single counter, or a single-threaded actor for a partition can be clearer.",
          "Choose based on contention and operation shape. High read, rare write may favor copy-on-write. Hot counters may favor atomics.",
          "Say why your choice matches the hotspot, not why a blog prefers a particular primitive."
        ],
        "callout": {
          "tone": "tip",
          "body": "If operations on different users never interact, partition by user and avoid cross locks."
        },
        "checkYourself": [
          {
            "prompt": "When is an actor-per-aggregate attractive?",
            "reveal": "When each aggregate's commands must be serial but different aggregates can proceed in parallel without shared memory races."
          }
        ]
      },
      {
        "id": "bridge-to-durable-coordination",
        "heading": "Bridge local design into durable coordination",
        "paragraphs": [
          "When interviewers pivot to distributed scale, show what stays local object logic versus what becomes infrastructure: in-memory maps become databases, observer calls become queues, process locks become transactions or conditional updates.",
          "Reuse abstractions where they still fit. Admit when a process-local lock must become distributed coordination such as row locks, optimistic version checks, or lease-based locks.",
          "For hot paths like rate limiting, mentioning Redis atomic counters can be reasonable\u2014only after you explain the process-local design and why the hotspot demands a bridge."
        ],
        "keyTerms": [
          {
            "term": "Optimistic concurrency",
            "definition": "Detecting conflicting updates with versions or compare-and-set rather than holding long locks."
          },
          {
            "term": "Scale bridge",
            "definition": "An incremental explanation of how a local seam becomes a distributed mechanism without rewriting the domain model."
          }
        ],
        "workedExample": {
          "title": "Same port, stronger adapter story",
          "body": "The service still calls try_reserve. The adapter description evolves from memory to conditional update.",
          "language": "python",
          "code": "class InventoryPort:\n    def try_reserve(self, seat_id: str) -> bool:\n        raise NotImplementedError\n\nclass InMemoryInventory(InventoryPort):\n    def __init__(self):\n        self._reserved = set()\n\n    def try_reserve(self, seat_id: str) -> bool:\n        if seat_id in self._reserved:\n            return False\n        self._reserved.add(seat_id)\n        return True\n\n# Later bridge (pseudocode in comments for interview talk):\n# class SqlInventory(InventoryPort):\n#     def try_reserve(self, seat_id):\n#         # UPDATE seats SET reserved=1 WHERE id=? AND reserved=0\n#         # return rowcount == 1\n\nprint(InMemoryInventory().try_reserve(\"A1\"))"
        },
        "callout": {
          "tone": "interview",
          "body": "Always give the local answer first, then the bridge. Jumping to Kafka before a lock looks like avoidance."
        },
        "checkYourself": [
          {
            "prompt": "What is a good SQL bridge for try_reserve?",
            "reveal": "A single conditional update that succeeds only when the seat is free, returning whether a row changed\u2014preserving the port's boolean semantics."
          }
        ]
      },
      {
        "id": "incremental-followups",
        "heading": "Answer follow-ups incrementally",
        "paragraphs": [
          "Do not redesign from scratch for each question. Extend: add a lock around the known hotspot, then transactions, then queues for side effects, then sharding by key.",
          "Keep referring to the same entities and ports. That continuity shows the model was sound.",
          "If a follow-up truly breaks an assumption, say which assumption dies and what type changes\u2014usually an adapter, not the domain verb."
        ],
        "callout": {
          "tone": "tip",
          "body": "Use the phrase \"same BookingService, stronger Inventory adapter\" as a template."
        },
        "checkYourself": [
          {
            "prompt": "How do you avoid HLD tourism in a concurrency follow-up?",
            "reveal": "Stay anchored on the invariant and the local critical section first; introduce distributed mechanisms only as bridges from that seam."
          }
        ]
      },
      {
        "id": "visibility-and-publication",
        "heading": "Visibility, publication, and deadlock basics",
        "paragraphs": [
          "Besides mutual exclusion, mention visibility: writes must be published so other threads see them. Language-level synchronized, locks, or concurrent collections handle this; a boolean flag without safe publication may not.",
          "Deadlocks arise from lock ordering cycles. If you take multiple locks, sort keys and acquire in a stable order.",
          "You do not need to recite the entire memory model. Naming exclusion, visibility, and ordering is enough for most LLD follow-ups."
        ],
        "callout": {
          "tone": "warning",
          "body": "A concurrent HashMap alone does not make check-then-act safe. Compound actions still need atomicity."
        },
        "checkYourself": [
          {
            "prompt": "Why is check-then-act on a concurrent map still racy?",
            "reveal": "Two threads can both observe absence and both insert; the map's individual operations are safe, but the compound decision is not atomic without extra coordination."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Name shared mutable hotspots before choosing synchronization tools.",
        "Keep critical sections small and side effects outside locks when safe.",
        "Consider partitioning and immutability when locks fit poorly.",
        "Bridge to scale by strengthening adapters while preserving domain ports."
      ],
      "nextSteps": [
        "Annotate a booking design with its mutable hotspots.",
        "Rewrite a global lock into a per-key lock with documented order.",
        "Practice a local-to-SQL conditional-update bridge in sixty seconds."
      ]
    }
  }
};
