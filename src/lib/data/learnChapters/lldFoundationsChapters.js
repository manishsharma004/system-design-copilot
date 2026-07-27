/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldFoundationsChapters = {
  "lld-foundations/lld-problem-framing": {
    "title": "LLD prompt framing and scope control",
    "readingTime": "75-95 min",
    "premise": "Low-level design interviews reward candidates who turn a vague prompt into a bounded first version before they draw classes. This chapter teaches that framing habit: actors, happy paths, invariants, non-goals, and a first runnable slice that keeps you out of premature HLD digressions.",
    "parts": [
      {
        "id": "version-one-before-classes",
        "heading": "Version one before class names",
        "paragraphs": [
          "An LLD prompt is not a hidden UML exam. The first five to ten minutes should fix a shippable slice: who initiates the flow, which one happy path must complete, which failure path matters immediately, and which rule can never be broken. Only after that contract exists should nouns become types.",
          "Scope control is design work, not stalling. When you say that version one of a parking lot supports enter, pay, and exit for a single vehicle but not reservations or valet, every later class inherits a stable job. Interviewers usually reward that discipline because it prevents speculative abstractions and keeps load balancers, Kafka, and Kubernetes out of a local object conversation that does not need them yet.",
          "Practice narrating the frame aloud. A strong opening sounds like: actor, core command, success condition, one invariant, and one explicit non-goal. That sentence becomes the spine of your whiteboard, your code skeleton, and every follow-up answer that begins with \"in version two we would...\""
        ],
        "keyTerms": [
          {
            "term": "Version-one slice",
            "definition": "The smallest end-to-end behavior the design must make correct and demonstrable before optional features or scale talk."
          },
          {
            "term": "Non-goal",
            "definition": "An explicitly deferred capability that keeps the first object model narrow without pretending the topic does not exist."
          },
          {
            "term": "Happy path",
            "definition": "The primary successful workflow used to anchor class responsibilities and the first runnable demo."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Time-box clarification. If you are still inventing features at minute twelve, you are spending interview capital the code never gets to earn."
        },
        "checkYourself": [
          {
            "prompt": "Why can naming classes too early make an LLD answer worse?",
            "reveal": "Premature class names freeze speculative nouns into the design. Without a bounded slice, every new idea accretes another type, and you lose a clear story about what version one must actually do."
          }
        ]
      },
      {
        "id": "nouns-into-responsibilities",
        "heading": "Turn nouns into responsibilities",
        "paragraphs": [
          "Prompts are full of nouns: ticket, spot, payment, user, lot. Treating every noun as a first-class entity creates a class explosion and a graph nobody can explain in five minutes. Instead, ask what each noun does in the version-one flow. Some become entities with lifecycle. Some become value objects. Some remain attributes. Some belong to a service or policy, not a standalone type.",
          "A useful filter is change pressure. If two concepts always change together and share one invariant, they may belong in one aggregate. If a concept only appears as validated data with no independent lifecycle, prefer a value. If a concept is really a decision rule that will vary later, prefer a collaborator interface rather than a subclass tree.",
          "This habit also prevents god objects. A ParkingLot that validates tickets, prices stays, persists occupancy, and emails receipts is several reasons to change stuffed into one name. Framing responsibilities first makes that smell visible before you draw boxes."
        ],
        "workedExample": {
          "title": "A tiny prompt-frame contract",
          "body": "Capture the interview contract as data you can restate. The frame is not production architecture; it is a working agreement for the next forty minutes.",
          "language": "python",
          "code": "from dataclasses import dataclass\n\n@dataclass\nclass PromptFrame:\n    actor: str\n    core_flow: str\n    invariant: str\n    non_goals: tuple[str, ...]\n\n    def pitch(self) -> str:\n        deferred = \"; \".join(self.non_goals)\n        return (\n            f\"{self.actor} completes {self.core_flow}. \"\n            f\"Invariant: {self.invariant}. \"\n            f\"Deferred: {deferred}.\"\n        )\n\nframe = PromptFrame(\n    actor=\"driver\",\n    core_flow=\"enter lot, receive ticket, pay, exit\",\n    invariant=\"one active ticket per occupied spot\",\n    non_goals=(\"reservations\", \"multi-lot routing\", \"surge pricing\"),\n)\nprint(frame.pitch())"
        },
        "callout": {
          "tone": "tip",
          "body": "If you cannot say a type's one reason to change in a single sentence, the frame is still muddy."
        },
        "checkYourself": [
          {
            "prompt": "When should a prompt noun stay an attribute instead of becoming a class?",
            "reveal": "When it has no independent lifecycle, no invariant worth owning, and no separate axis of change in version one. Promoting every noun creates ceremony without clarity."
          }
        ]
      },
      {
        "id": "invariants-and-rejection-paths",
        "heading": "Name invariants and rejection paths early",
        "paragraphs": [
          "Requirements become design when you translate them into enforceable rules. Uniqueness, ordering, authorization, idempotency, capacity, and expiry are the usual suspects. Write them as sentences that a method can reject: \"a spot cannot hold two active tickets,\" \"payment must precede exit,\" \"cancelled bookings cannot be modified.\"",
          "Rejection paths matter as much as the happy path because interviewers probe them next. Decide which failures are expected business outcomes versus programmer mistakes. Sold-out inventory is a domain result. A null repository is a construction error. That distinction later shapes exceptions, result types, and test cases.",
          "Invariants also tell you where validation lives. The object that would become inconsistent owns the check. Do not sprinkle the same capacity rule across a controller, a service, and a repository helper. One boundary, one authoritative rejection, many callers that trust it."
        ],
        "keyTerms": [
          {
            "term": "Invariant",
            "definition": "A rule that must remain true after every successful command; illegal commands must fail before state mutates."
          },
          {
            "term": "Rejection path",
            "definition": "The explicit failure behavior for an illegal or impossible request in the version-one design."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name what must never happen, you do not yet know where to put validation."
        },
        "checkYourself": [
          {
            "prompt": "How do invariants bridge product language and object design?",
            "reveal": "They convert phrases like \"users cannot double-book\" into transition guards and aggregate boundaries, so classes exist to protect rules rather than to mirror vocabulary."
          }
        ]
      },
      {
        "id": "followups-reveal-seams",
        "heading": "Use follow-ups to reveal extension seams",
        "paragraphs": [
          "Good interviewers will ask what changes if pricing becomes dynamic, notifications become async, or inventory becomes concurrent. You do not need to implement those now, but you should point to the seam where they would land. Framing is incomplete if every follow-up forces a rewrite of the core flow.",
          "A seam is not a pattern name. It is a volatility boundary: pricing policy, clock, id generator, persistence port, notifier. Mentioning those seams during framing shows you can grow the design without pretending version one already needs Strategy, Observer, and Factory everywhere.",
          "Separate LLD-relevant non-functional concerns from true HLD digressions. Clock injection and per-spot locking are still local object design. Multi-region replication and CDN edge caching are later bridges. Say you will return to scale after the object model is coherent."
        ],
        "callout": {
          "tone": "tip",
          "body": "Park scale topics with a bridge sentence: \"locally we protect the invariant here; under distribution that seam becomes a transaction or a queue.\""
        },
        "checkYourself": [
          {
            "prompt": "What makes a follow-up seam useful during framing?",
            "reveal": "It names where a future change would attach without forcing you to build the change now, proving the core workflow can stay stable while policies or infrastructure vary."
          }
        ]
      },
      {
        "id": "present-the-contract",
        "heading": "Present the frame as a design contract",
        "paragraphs": [
          "Close the framing phase by restating the contract and inviting confirmation. Interviewers often course-correct if your non-goals exclude something they care about. That confirmation is cheaper than discovering the mismatch after you have twenty classes on the board.",
          "Then sketch only the types needed for the agreed slice. Prefer a thin vertical path: create, mutate, query. Leave optional collaborators as interfaces or comments until the happy path runs. This presentation style scores as communication, not as incomplete work.",
          "Revisit the frame whenever a follow-up threatens scope. Saying \"that expands version one; I would add it as a second slice after the current demo\" is mature. Redesigning from scratch for every prompt twist is not."
        ],
        "workedExample": {
          "title": "Interview checklist before the first class box",
          "body": "Use a short checklist as your spoken agenda. Each item should have a one-line answer before UML begins.",
          "language": "java",
          "code": "record FrameChecklist(\n    String actor,\n    String successCondition,\n    String primaryInvariant,\n    String firstFailurePath,\n    String deferredFeature\n) {\n    String confirmWithInterviewer() {\n        return \"\"\"\n            Actor: %s\n            Success: %s\n            Invariant: %s\n            First failure: %s\n            Deferred: %s\n            \"\"\".formatted(\n                actor, successCondition, primaryInvariant,\n                firstFailurePath, deferredFeature);\n    }\n}\n\nvoid main() {\n    var checklist = new FrameChecklist(\n        \"member\",\n        \"reserve one seat and receive confirmation\",\n        \"seat cannot be double-booked\",\n        \"reject when seat already held\",\n        \"waitlist and payment retries\"\n    );\n    System.out.println(checklist.confirmWithInterviewer());\n}"
        },
        "callout": {
          "tone": "interview",
          "body": "Ask for confirmation once. Then commit. Endless clarification without progress is its own failure mode."
        },
        "checkYourself": [
          {
            "prompt": "What should you do if a follow-up conflicts with your stated non-goals?",
            "reveal": "Acknowledge the conflict, renegotiate scope if the interviewer wants it in version one, otherwise park it as the next slice and keep the current demo coherent."
          }
        ]
      },
      {
        "id": "framing-anti-patterns",
        "heading": "Framing anti-patterns to avoid",
        "paragraphs": [
          "Three failure modes dominate weak openings. The first is pattern dumping: naming Singleton, Factory, and Observer before any invariant exists. The second is HLD tourism: drawing caches and message buses before a booking can be confirmed in memory. The third is infinite nouns: modeling every word in the prompt as a class with getters and setters and no behavior.",
          "A fourth quieter failure is silent assumptions. If you assume single-threaded access, in-memory storage, or synchronous payment without saying so, follow-ups feel like attacks instead of extensions. State assumptions as part of the frame so the interviewer can challenge them deliberately.",
          "The corrective habit is always the same: actor, flow, invariant, non-goal, first demo. Everything else is elaboration."
        ],
        "callout": {
          "tone": "warning",
          "body": "If your first diagram has more infrastructure boxes than domain verbs, you have left LLD."
        },
        "checkYourself": [
          {
            "prompt": "Name one assumption worth stating aloud during framing.",
            "reveal": "Examples include in-memory persistence for the demo, single-process execution, synchronous notifications, or a fixed pricing policy in version one."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Spend the first minutes locking actor, happy path, invariant, and non-goals before naming classes.",
        "Translate prompt nouns into responsibilities and change pressure, not into automatic types.",
        "Name rejection paths early so validation ownership is obvious.",
        "Point to extension seams without implementing every follow-up in version one."
      ],
      "nextSteps": [
        "Time yourself: frame a parking-lot or booking prompt in under eight minutes.",
        "Rewrite a muddy class list into five responsibility sentences.",
        "Practice a one-sentence bridge from a local invariant to a later scale concern."
      ]
    }
  },
  "lld-foundations/responsibilities-and-interfaces": {
    "title": "Responsibilities, interfaces, and seams",
    "readingTime": "70-90 min",
    "premise": "Interviewers trust a design when every type has a sharp reason to exist and volatile collaborators sit behind thin ports. This chapter shows how to assign ownership, introduce interfaces only where change pressure justifies them, and keep the core workflow readable and testable.",
    "parts": [
      {
        "id": "one-reason-to-change",
        "heading": "One reason to change per type",
        "paragraphs": [
          "Responsibility assignment is mostly resistance to the god coordinator. When a service validates input, mutates entity state, chooses pricing, writes to storage, and sends email in one method, every requirement adds another branch. Split ownership so each object changes for one coherent business reason.",
          "That does not mean every method deserves a class. The goal is fewer, clearer boundaries. Entities own lifecycle rules. Application services own orchestration. Policies own variable decisions. Repositories own persistence-facing operations. If you can explain those sentences, your class diagram usually makes sense.",
          "In interviews, SRP is judged at the collaboration level. Can a listener predict where a new requirement lands? If cancellation logic could appear in three places, ownership is still fuzzy."
        ],
        "keyTerms": [
          {
            "term": "Orchestration",
            "definition": "Sequencing of domain commands and collaborators without owning the business invariants themselves."
          },
          {
            "term": "Policy collaborator",
            "definition": "A replaceable object that encapsulates a decision that varies independently from the workflow."
          },
          {
            "term": "Reason to change",
            "definition": "The single coherent pressure that should cause a type to be edited."
          }
        ],
        "workedExample": {
          "title": "Focused entity plus thin service",
          "body": "The entity guards its transition. The service sequences the use case. Neither knows about email yet.",
          "language": "python",
          "code": "class Order:\n    def __init__(self, order_id: str):\n        self.order_id = order_id\n        self.status = \"draft\"\n\n    def mark_paid(self) -> None:\n        if self.status != \"draft\":\n            raise ValueError(\"order cannot be paid twice\")\n        self.status = \"paid\"\n\n\nclass CheckoutService:\n    def checkout(self, order: Order) -> str:\n        order.mark_paid()\n        return f\"checked out {order.order_id}\"\n\n\nprint(CheckoutService().checkout(Order(\"ord-1\")))"
        },
        "callout": {
          "tone": "tip",
          "body": "If you need \"and\" to describe a class's job, split the job before you split the file tree."
        },
        "checkYourself": [
          {
            "prompt": "Where should an order's \"cannot pay twice\" rule live?",
            "reveal": "On the order entity or aggregate that owns the status transition, not only in a controller that happens to call pay today."
          }
        ]
      },
      {
        "id": "interfaces-for-volatility",
        "heading": "Interfaces where volatility justifies them",
        "paragraphs": [
          "Introduce an interface when a dependency is likely to vary independently: storage, clocks, id generation, payment gateways, notification channels. Do not invent an interface for every class because a blog post said so. Over-interfacing hides the happy path under ceremony.",
          "Shape the contract from the caller's needs. The smallest surface that preserves swap-ability and testability wins. A Notifier with notify(event) beats a kitchen-sink MessagingFacade with twenty methods half of which no adapter implements honestly.",
          "Modern codebases often describe these seams as ports with concrete adapters. In an interview, that vocabulary is useful if you keep it light: the workflow depends on an abstraction; the adapter talks to SMTP or a console logger."
        ],
        "keyTerms": [
          {
            "term": "Port",
            "definition": "A narrow abstraction owned by the application side that describes what the workflow needs from the outside world."
          },
          {
            "term": "Adapter",
            "definition": "A concrete implementation that satisfies a port using a specific technology or fake."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "An interface with no second implementation and no test double is often premature abstraction."
        },
        "checkYourself": [
          {
            "prompt": "When is a concrete collaborator acceptable in version one?",
            "reveal": "When it is stable, in-process, and not an interview follow-up hotspot\u2014for example a simple in-memory map\u2014while still keeping true volatility behind ports."
          }
        ]
      },
      {
        "id": "method-shapes-reveal-usage",
        "heading": "Method shapes that reveal legal usage",
        "paragraphs": [
          "APIs teach callers what is legal. Prefer verbs that match domain commands: confirm, cancel, assign. Prefer parameters that are already validated values when possible. Avoid public setters that invite impossible combinations.",
          "Return types also teach. Returning the updated entity, a confirmation token, or a typed error communicates different contracts. Be consistent inside one workflow so callers are not guessing between null, exceptions, and magic strings.",
          "Parameter lists should not become dumping grounds. If a method needs eight unrelated fields, you may be missing a command object or an aggregate that already holds the data."
        ],
        "callout": {
          "tone": "interview",
          "body": "Read your public methods aloud as sentences. If they sound awkward, the responsibility split is probably awkward too."
        },
        "checkYourself": [
          {
            "prompt": "Why are domain verbs better than setStatus on entity APIs?",
            "reveal": "Verbs encode legal transitions and can enforce invariants. setStatus invites illegal combinations and pushes validation into every caller."
          }
        ]
      },
      {
        "id": "test-oriented-seams",
        "heading": "Keep seams test-oriented without inverting the model",
        "paragraphs": [
          "Seams exist so you can prove rules cheaply. Wrap time, randomness, ids, and I/O so tests can freeze a clock or inject a fake repository. That is not the same as making every private method public for coverage theater.",
          "Test through the same ports production uses. If CheckoutService depends on OrderRepository and Clock, a fake repository and fixed clock exercise the real orchestration. Reflective access and package-private hacks are last resorts, not design goals.",
          "Describe seams in terms of future change: \"when notifications become async, this Notifier port stays; the adapter changes.\" Pattern names are optional garnish."
        ],
        "workedExample": {
          "title": "A narrow port with a fake adapter",
          "body": "The service depends on Inventory, not on a SQL driver. The fake proves the sold-out path without a database.",
          "language": "java",
          "code": "interface Inventory {\n    boolean tryReserve(String seatId);\n}\n\nfinal class InMemoryInventory implements Inventory {\n    private final java.util.Set<String> reserved = new java.util.HashSet<>();\n    public boolean tryReserve(String seatId) {\n        return reserved.add(seatId);\n    }\n}\n\nfinal class BookingService {\n    private final Inventory inventory;\n    BookingService(Inventory inventory) { this.inventory = inventory; }\n    String book(String seatId) {\n        if (!inventory.tryReserve(seatId)) {\n            throw new IllegalStateException(\"seat unavailable\");\n        }\n        return \"booked:\" + seatId;\n    }\n}\n\nvoid main() {\n    var service = new BookingService(new InMemoryInventory());\n    System.out.println(service.book(\"A1\"));\n}"
        },
        "callout": {
          "tone": "tip",
          "body": "If a seam only exists to satisfy a mocking framework, simplify the design instead of adding more mocks."
        },
        "checkYourself": [
          {
            "prompt": "What should a test double prove in an LLD interview?",
            "reveal": "That a domain rule or workflow branch holds under controlled collaborators\u2014especially rejection paths\u2014without requiring real infrastructure."
          }
        ]
      },
      {
        "id": "describe-change-not-patterns",
        "heading": "Describe seams as change, not ceremony",
        "paragraphs": [
          "Interview language matters. Prefer \"pricing can vary independently, so it is a collaborator\" over \"I will apply Strategy pattern now.\" Prefer \"storage is a port so tests and later SQL share one contract\" over \"Repository pattern because SOLID.\"",
          "When a follow-up arrives, point to the existing seam and show the delta. That is how responsibility design pays off: new adapters, new policies, same orchestration script.",
          "If you cannot name the change a seam anticipates, delete the seam until the change is real."
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong answers sound like product and change pressure. Weak answers sound like pattern bingo."
        },
        "checkYourself": [
          {
            "prompt": "How do you justify an interface in one sentence?",
            "reveal": "Name the axis of change it isolates and the caller that must remain stable when that axis moves."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Give each type one coherent reason to change and keep orchestration separate from invariants.",
        "Introduce ports only for real volatility or side effects.",
        "Shape methods so legal usage is obvious and illegal states are hard to express.",
        "Use the same seams for tests and future adapters."
      ],
      "nextSteps": [
        "Refactor a god service into entity, policy, and repository collaborators on paper.",
        "Write one port and two adapters (real + fake) for a notifier or clock.",
        "Practice explaining a seam without naming a GoF pattern."
      ]
    }
  },
  "lld-foundations/validation-errors-and-state": {
    "title": "Validation, errors, and state transitions",
    "readingTime": "80-100 min",
    "premise": "Object design quality shows up when callers try the wrong thing. This chapter treats lifecycle as a first-class concept: legal transitions, validation at the owning boundary, a consistent error vocabulary, and mutations that never leave half-finished state.",
    "parts": [
      {
        "id": "lifecycle-not-loose-status",
        "heading": "Lifecycle instead of a loose status field",
        "paragraphs": [
          "Many weak solutions store status as a public string and hope callers are careful. That invites cancelled-and-paid or refunded-and-shipping combinations. Treat lifecycle as a concept: list states, list commands, and route changes through methods that understand legality.",
          "You do not always need the full State pattern. An explicit transition table plus guard clauses is enough for most interview designs. What matters is that illegal commands fail loudly and that the machine is simple enough to explain aloud.",
          "Draw the machine before coding if the domain is rich: created \u2192 paid \u2192 fulfilled \u2192 cancelled, with arrows only where business allows. That drawing becomes your test list."
        ],
        "keyTerms": [
          {
            "term": "State transition",
            "definition": "A named command that moves an entity from one legal lifecycle state to another."
          },
          {
            "term": "Guard",
            "definition": "A precondition checked before mutation; failure leaves prior state intact."
          }
        ],
        "workedExample": {
          "title": "Small order lifecycle with guards",
          "body": "Transitions are verbs. Illegal calls raise before status changes.",
          "language": "python",
          "code": "class Order:\n    def __init__(self):\n        self.status = \"created\"\n\n    def pay(self) -> None:\n        if self.status != \"created\":\n            raise ValueError(\"only created orders can be paid\")\n        self.status = \"paid\"\n\n    def cancel(self) -> None:\n        if self.status not in {\"created\", \"paid\"}:\n            raise ValueError(f\"cannot cancel from {self.status}\")\n        self.status = \"cancelled\"\n\norder = Order()\norder.pay()\nprint(order.status)\ntry:\n    order.pay()\nexcept ValueError as exc:\n    print(\"rejected:\", exc)"
        },
        "callout": {
          "tone": "tip",
          "body": "If you need a comment saying \"do not set status directly,\" make the field private and delete the setter."
        },
        "checkYourself": [
          {
            "prompt": "When is a full State pattern worth introducing in an interview?",
            "reveal": "When transition behavior diverges sharply per state and conditionals are spreading. Otherwise an explicit table and guarded methods are clearer under time pressure."
          }
        ]
      },
      {
        "id": "validate-at-owning-boundary",
        "heading": "Validate at the boundary that owns the invariant",
        "paragraphs": [
          "Validation belongs closest to the state that would become inconsistent. Overlapping bookings belong at the aggregate or repository operation that confirms capacity. Positive money amounts belong in the value object or command that receives money. Controllers can sanitize input shape, but they should not be the only place business rules live.",
          "Follow-ups add call paths. A rule duplicated in three places will be forgotten in the fourth. A rule that lives in one obvious boundary stays safer as the system grows.",
          "Say the ownership sentence in interviews: \"This object rejects the command because only it knows whether the transition is legal.\""
        ],
        "callout": {
          "tone": "warning",
          "body": "Input parsing validation and domain invariant validation are different layers. Do not conflate \"email looks like an email\" with \"seat is still available.\""
        },
        "checkYourself": [
          {
            "prompt": "Why is scattering the same check across controller and entity risky?",
            "reveal": "New entry points skip one of the copies, and the copies drift. Ownership at a single boundary keeps rejection consistent."
          }
        ]
      },
      {
        "id": "error-vocabulary",
        "heading": "Choose an error vocabulary callers can act on",
        "paragraphs": [
          "Exceptions, result types, and domain error enums each signal different recovery semantics. Mixing styles inside one workflow forces callers to guess. Pick a vocabulary for the design and stay consistent.",
          "Separate expected business failures from programmer errors. Sold out, duplicate alias, and expired hold are part of the domain conversation. Null collaborators and broken invariants in construction are bugs. Callers should retry or branch on the first category and crash loudly on the second.",
          "Error messages should name the rule broken, not the line of code that noticed. \"seat already reserved\" is actionable. \"invalid state\" is not."
        ],
        "keyTerms": [
          {
            "term": "Business failure",
            "definition": "An expected rejected command that valid callers must handle, such as insufficient stock."
          },
          {
            "term": "Programmer error",
            "definition": "A broken assumption in construction or wiring that should not be treated as normal control flow."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "State how callers detect failure before you debate checked exceptions versus result objects."
        },
        "checkYourself": [
          {
            "prompt": "Give one business failure and one programmer error for a booking API.",
            "reveal": "Business: seat already taken. Programmer: booking service constructed with a null inventory dependency."
          }
        ]
      },
      {
        "id": "atomic-mutations",
        "heading": "Keep mutations atomic enough to avoid half-finished state",
        "paragraphs": [
          "A command should leave the aggregate consistent or unchanged. If confirming a reservation reserves a seat and marks the booking confirmed, do not expose a window where the seat is taken but the booking is still draft because an exception fired mid-method.",
          "In single-process interview code, ordering and early returns often suffice: validate all preconditions, then mutate, then trigger side effects. Side effects after successful commit can still fail; decide whether they are synchronous must-succeed steps or post-commit notifications.",
          "When multiple aggregates are involved, say so. Cross-aggregate consistency is usually eventual. Version one may keep one aggregate and accept that limitation explicitly."
        ],
        "workedExample": {
          "title": "Validate then mutate then notify",
          "body": "Preconditions run first. State changes next. Notification is a separate step that cannot corrupt the booking if it fails.",
          "language": "java",
          "code": "final class Reservation {\n    private String status = \"held\";\n    void confirm() {\n        if (!\"held\".equals(status)) {\n            throw new IllegalStateException(\"only held reservations confirm\");\n        }\n        status = \"confirmed\";\n    }\n    String status() { return status; }\n}\n\ninterface Mailer { void send(String msg); }\n\nfinal class ConfirmReservation {\n    private final Mailer mailer;\n    ConfirmReservation(Mailer mailer) { this.mailer = mailer; }\n    void run(Reservation reservation) {\n        reservation.confirm();\n        mailer.send(\"reservation confirmed\");\n    }\n}"
        },
        "callout": {
          "tone": "tip",
          "body": "If a side effect must not run on failure, keep it after the domain mutation succeeds\u2014and say what you do if the side effect itself fails."
        },
        "checkYourself": [
          {
            "prompt": "Why should notifications usually follow successful state change?",
            "reveal": "So failed guards never emit \"success\" events, and the domain remains the source of truth even if messaging is flaky."
          }
        ]
      },
      {
        "id": "transition-language-in-interviews",
        "heading": "Defend the design with transition language",
        "paragraphs": [
          "When challenged, walk the state machine: command, guard, resulting state, error if illegal. That narration proves the model is intentional. Listing fields does not.",
          "Use the same language in tests and in speech. A test named cannot_cancel_after_fulfillment documents the design better than assertEquals on getters.",
          "If a follow-up adds a state, update the table first, then the methods. Resist sprinkling new ifs across unrelated services."
        ],
        "callout": {
          "tone": "interview",
          "body": "Offer to sketch the transition table on the board. Interviewers often relax once they see the machine."
        },
        "checkYourself": [
          {
            "prompt": "What is the first artifact to update when a new lifecycle state appears?",
            "reveal": "The explicit set of states and legal transitions, then the owning entity methods and tests\u2014before opportunistic conditionals elsewhere."
          }
        ]
      },
      {
        "id": "making-illegal-states-hard",
        "heading": "Make illegal states hard to represent",
        "paragraphs": [
          "Constructors and factories should refuse invalid values. A Money type with negative amount should not exist. A TimeRange with end before start should not exist. These small refusals remove entire classes of bugs from callers.",
          "Where full unrepresentability is too heavy for a timed round, centralize validation in one boundary method per aggregate and keep fields private. That is an honest interview compromise.",
          "Immutability helps for values. For entities, controlled mutation through verbs is the usual compromise between purity and practicality."
        ],
        "callout": {
          "tone": "warning",
          "body": "Public mutable fields plus scattered validation is the fastest way to an incoherent demo."
        },
        "checkYourself": [
          {
            "prompt": "How can a value object reduce validation scatter?",
            "reveal": "It validates once at construction and then travels as a trusted unit, so callers stop re-checking the same primitive constraints."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Model lifecycle explicitly and route changes through guarded verbs.",
        "Place validation at the boundary that owns the invariant.",
        "Use one error vocabulary that separates business failures from bugs.",
        "Mutate atomically relative to the aggregate, then handle side effects deliberately."
      ],
      "nextSteps": [
        "Draw a transition table for booking or order before writing code.",
        "Implement one value object that rejects illegal primitives.",
        "Write two tests: legal transition and rejected transition."
      ]
    }
  }
};
