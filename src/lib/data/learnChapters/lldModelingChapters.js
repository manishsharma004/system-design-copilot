/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldModelingChapters = {
  "lld-modeling/entities-value-objects-and-aggregates": {
    "title": "Entities, value objects, and aggregates",
    "readingTime": "80-100 min",
    "premise": "Many LLD prompts collapse once you stop treating every concept the same way. This chapter separates identity-bearing entities from descriptive values, then chooses aggregate boundaries that protect consistency without bloating the model.",
    "parts": [
      {
        "id": "identity-vs-description",
        "heading": "Which concepts truly need identity",
        "paragraphs": [
          "Entities are tracked over time even as attributes change. A booking, order, invoice, parking ticket, or support case needs identity because it has a lifecycle and is referenced later. Identity keeps comparisons stable when fields mutate.",
          "Developers often promote every nested concept into an entity. That creates extra repositories, lifecycles, and foreign keys the problem does not need. Ask: if two objects have the same fields today, would the business still care which exact one is which tomorrow? If yes, entity. If no, value.",
          "Attach lifecycle behavior to the entity that owns it. cancel belongs on Booking, not on a random BookingHelper that mutates public fields."
        ],
        "keyTerms": [
          {
            "term": "Entity",
            "definition": "A domain object with stable identity and a lifecycle that survives attribute changes."
          },
          {
            "term": "Identity",
            "definition": "A durable identifier used to recognize the same conceptual instance across time and operations."
          }
        ],
        "workedExample": {
          "title": "Identity survives state change",
          "body": "The order remains the same order after cancellation because identity, not status, defines it.",
          "language": "python",
          "code": "class Order:\n    def __init__(self, order_id: str, status: str):\n        self.order_id = order_id\n        self.status = status\n\n    def cancel(self) -> None:\n        if self.status == \"cancelled\":\n            raise ValueError(\"already cancelled\")\n        self.status = \"cancelled\"\n\norder = Order(\"ord-1\", \"created\")\norder.cancel()\nprint(order.order_id, order.status)"
        },
        "callout": {
          "tone": "tip",
          "body": "If you only ever compare two objects by field equality and never look them up later, they may not need identity."
        },
        "checkYourself": [
          {
            "prompt": "Is a seat row letter an entity?",
            "reveal": "Usually no. It is descriptive data. The reservation that claims a seat is more likely the entity; seat identity only matters if seats themselves have independent lifecycles."
          }
        ]
      },
      {
        "id": "value-objects",
        "heading": "Value objects for validated description",
        "paragraphs": [
          "Value objects shine for Money, date ranges, coordinates, addresses, and discount rules. Callers care that the value is valid and comparable, not that it has its own lifecycle. Immutability builds trust: once constructed, the value still means the same thing everywhere it travels.",
          "Value objects localize small validation rules and reduce primitive obsession. A TimeRange that refuses inverted bounds communicates more maturity than three scattered integer checks in callers.",
          "Replace a value by constructing a new one. Do not mutate money.amount in place. That habit keeps equality and hashing sane."
        ],
        "keyTerms": [
          {
            "term": "Value object",
            "definition": "An immutable descriptive object compared by its data rather than by identity."
          },
          {
            "term": "Primitive obsession",
            "definition": "Overuse of raw strings and numbers for concepts that deserve validated types."
          }
        ],
        "workedExample": {
          "title": "Money as a validated value",
          "body": "Construction refuses negatives. Arithmetic returns new values instead of mutating.",
          "language": "java",
          "code": "record Money(long cents, String currency) {\n    Money {\n        if (cents < 0) throw new IllegalArgumentException(\"money cannot be negative\");\n        if (currency == null || currency.isBlank()) {\n            throw new IllegalArgumentException(\"currency required\");\n        }\n    }\n    Money plus(Money other) {\n        if (!currency.equals(other.currency)) {\n            throw new IllegalArgumentException(\"currency mismatch\");\n        }\n        return new Money(cents + other.cents, currency);\n    }\n}\n\nvoid main() {\n    var total = new Money(500, \"USD\").plus(new Money(250, \"USD\"));\n    System.out.println(total);\n}"
        },
        "callout": {
          "tone": "interview",
          "body": "Introduce one or two high-leverage value objects. Do not boil the ocean with types for every field."
        },
        "checkYourself": [
          {
            "prompt": "When is a small value object worth introducing live?",
            "reveal": "When it concentrates validation, clarifies method signatures, or prevents illegal combinations that would otherwise scatter across callers."
          }
        ]
      },
      {
        "id": "aggregates-around-consistency",
        "heading": "Aggregates around consistency, not folders",
        "paragraphs": [
          "An aggregate is a consistency boundary. External code mutates the cluster only through the root, and invariants inside the boundary are guaranteed together. Keep aggregates small enough that unrelated workflows do not contend on the same lock or transaction.",
          "Folder structure is not a consistency story. Grouping every ticket-related class under tickets/ does not make them one aggregate. Ask which rules must hold after one command completes.",
          "Reference other aggregates by id rather than navigating a giant object graph. Cross-aggregate rules are usually eventual."
        ],
        "keyTerms": [
          {
            "term": "Aggregate",
            "definition": "A cluster of domain objects treated as one consistency unit, mutated through a root."
          },
          {
            "term": "Aggregate root",
            "definition": "The entry object that guards invariants and is the only external reference into the cluster."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Giant aggregates that own the whole company graph become distributed locks in disguise."
        },
        "checkYourself": [
          {
            "prompt": "Why reference another aggregate by id?",
            "reveal": "To avoid expanding the transactional boundary and to keep each aggregate independently consistent under its own commands."
          }
        ]
      },
      {
        "id": "protect-internals",
        "heading": "Protect internal collections and derived data",
        "paragraphs": [
          "If callers can append directly to order.lines, invariants about totals, discounts, and item limits evaporate. Expose commands like addLine that validate and update derived fields.",
          "Derived data such as totals should be updated inside the aggregate or computed from trusted internals. Do not let controllers recompute and write totals independently.",
          "Return defensive copies or unmodifiable views when you must expose collections for reading."
        ],
        "workedExample": {
          "title": "Aggregate root guards line items",
          "body": "Lines are private. add_item enforces a max and refreshes the total.",
          "language": "python",
          "code": "class Order:\n    def __init__(self, order_id: str):\n        self.order_id = order_id\n        self._lines: list[tuple[str, int]] = []\n        self.total_cents = 0\n\n    def add_item(self, sku: str, cents: int) -> None:\n        if cents <= 0:\n            raise ValueError(\"price must be positive\")\n        if len(self._lines) >= 20:\n            raise ValueError(\"too many lines\")\n        self._lines.append((sku, cents))\n        self.total_cents += cents\n\n    @property\n    def lines(self) -> tuple[tuple[str, int], ...]:\n        return tuple(self._lines)\n\norder = Order(\"ord-9\")\norder.add_item(\"sku-a\", 400)\nprint(order.total_cents, order.lines)"
        },
        "callout": {
          "tone": "tip",
          "body": "If a unit test can break an invariant by touching a public list, encapsulation failed."
        },
        "checkYourself": [
          {
            "prompt": "What goes wrong if totals are writable from outside the aggregate?",
            "reveal": "Callers can desynchronize totals from line items, and the aggregate no longer guarantees consistency after commands."
          }
        ]
      },
      {
        "id": "explain-boundaries-plainly",
        "heading": "Explain consistency boundaries in plain language",
        "paragraphs": [
          "Interviewers do not need DDD slogans. Say: \"Booking is the root. Seats held inside one booking stay consistent when we confirm. Payments are a separate concern referenced by id.\"",
          "Tie boundaries to commands. confirmBooking is one transaction of meaning even if the demo is in-memory. That prepares the later scale bridge without redesigning nouns.",
          "If unsure, prefer a smaller aggregate and an application service that coordinates. You can always widen later; shrinking a bloated root under live follow-ups is harder."
        ],
        "callout": {
          "tone": "interview",
          "body": "Translate aggregate to \"the set of things that must stay true together after this command.\""
        },
        "checkYourself": [
          {
            "prompt": "How do you defend a small aggregate when asked about cross-entity rules?",
            "reveal": "Explain which rules are immediate inside the root versus which are eventual across ids, and where the application service coordinates."
          }
        ]
      },
      {
        "id": "modeling-anti-patterns",
        "heading": "Modeling anti-patterns",
        "paragraphs": [
          "Anemic entities with only getters and setters push all rules into services until services become god objects. Rich enough behavior to protect invariants is the goal, not business logic in every getter.",
          "The opposite extreme\u2014entities that send email and write SQL\u2014mixes consistency with infrastructure. Keep persistence and messaging at ports.",
          "Watch for false entities: DiscountCodeConfig that never changes identity, or AddressHistoryEntry promoted without a lookup need."
        ],
        "callout": {
          "tone": "warning",
          "body": "If every noun is an entity and every verb is a service, you have two parallel models fighting."
        },
        "checkYourself": [
          {
            "prompt": "What is an anemic domain model symptom in interviews?",
            "reveal": "Entities that only store data while a single service contains all validation, transitions, and policy branching."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Use entities for identity and lifecycle; use values for validated description.",
        "Draw aggregate boundaries around invariants that must hold together.",
        "Protect internal collections and derived fields behind root commands.",
        "Explain boundaries in command language, not folder language."
      ],
      "nextSteps": [
        "Label each noun in a booking prompt as entity, value, or attribute.",
        "Implement one aggregate root with a private collection and a derived total.",
        "Practice a thirty-second oral defense of your consistency boundary."
      ]
    }
  },
  "lld-modeling/composition-vs-inheritance": {
    "title": "Composition, inheritance, and polymorphism",
    "readingTime": "70-90 min",
    "premise": "Interview follow-ups often ask you to extend behavior without wrecking the original design. Prefer composition by default, reach for inheritance only when Liskov substitutability is genuine, and use polymorphism only when it removes branching that is truly spreading.",
    "parts": [
      {
        "id": "composition-default",
        "heading": "Composition when behavior varies independently",
        "paragraphs": [
          "Composition is the default when a behavior might change without changing the owning object. Pricing policy, ranking logic, notification delivery, and assignment strategy often vary independently from the entity or service that uses them.",
          "A parking ticket should still be a parking ticket whether pricing is flat, hourly, or surge-based. Pulling pricing into a collaborator keeps the workflow stable while the decision swaps.",
          "Composition also makes tests easy: inject a fake policy without subclassing production types."
        ],
        "keyTerms": [
          {
            "term": "Composition",
            "definition": "Building behavior by combining objects that collaborate, rather than by extending a base class."
          },
          {
            "term": "Axis of change",
            "definition": "A dimension of requirements that varies independently and therefore deserves its own seam."
          }
        ],
        "workedExample": {
          "title": "Replaceable pricing via composition",
          "body": "Ticket total delegates to a pricing policy. New policies do not require new Ticket subclasses.",
          "language": "python",
          "code": "class HourlyPricing:\n    def total(self, minutes: int) -> int:\n        hours = (minutes + 59) // 60\n        return hours * 300\n\nclass FlatPricing:\n    def total(self, minutes: int) -> int:\n        return 500\n\nclass Ticket:\n    def __init__(self, minutes: int, pricing):\n        self.minutes = minutes\n        self.pricing = pricing\n\n    def amount_due(self) -> int:\n        return self.pricing.total(self.minutes)\n\nprint(Ticket(90, HourlyPricing()).amount_due())\nprint(Ticket(90, FlatPricing()).amount_due())"
        },
        "callout": {
          "tone": "tip",
          "body": "If a follow-up says \"now support another algorithm,\" reach for a collaborator before a subclass."
        },
        "checkYourself": [
          {
            "prompt": "Why does composition beat subclassing for notification channels?",
            "reveal": "Channels vary independently from the domain event. Subclassing OrderForEmail and OrderForSms explodes hierarchies and confuses identity."
          }
        ]
      },
      {
        "id": "inheritance-and-liskov",
        "heading": "Inheritance only for genuine substitutability",
        "paragraphs": [
          "Inheritance is trusted when a subtype is a true substitute with the same semantic contract. Callers should not need to know the concrete class to use it safely.",
          "Classic failures include square/rectangle modeling mistakes and overrides that weaken preconditions or throw unexpected exceptions. If callers must downcast or special-case, Liskov is already broken.",
          "In interviews, state the caller expectation first, then justify whether inheritance preserves it. If not, composition or a small interface ages better."
        ],
        "keyTerms": [
          {
            "term": "Liskov substitution",
            "definition": "The requirement that subtypes honor the behavioral contract expected by callers of the base type."
          },
          {
            "term": "Subtype",
            "definition": "A type that can stand in for another without breaking callers' assumptions."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Sharing code is not a sufficient reason to inherit. Shared helpers or composition can reuse without claiming substitutability."
        },
        "checkYourself": [
          {
            "prompt": "What is a behavioral Liskov failure?",
            "reveal": "A subtype that requires stronger preconditions, weaker postconditions, or surprises callers with exceptions the base type never suggested."
          }
        ]
      },
      {
        "id": "polymorphism-vs-branching",
        "heading": "Polymorphism when branching is truly spreading",
        "paragraphs": [
          "A switch on type or mode is fine when there are two stable cases. When the same switch repeats across modules, polymorphism or strategy collaborators remove duplication and centralize variation.",
          "Do not introduce interfaces for a single implementation just to look extensible. Wait for the second real variant or a clear follow-up axis.",
          "Prefer role interfaces with one or two methods over fat base classes that force empty overrides."
        ],
        "callout": {
          "tone": "interview",
          "body": "Say when you would keep a conditional. Judgment scores higher than always-patterns."
        },
        "checkYourself": [
          {
            "prompt": "When is a simple if better than a strategy hierarchy?",
            "reveal": "When variation is tiny, stable, and local to one method\u2014especially under interview time pressure."
          }
        ]
      },
      {
        "id": "deep-hierarchy-smells",
        "heading": "Deep hierarchies and leaky base classes",
        "paragraphs": [
          "Deep trees become brittle because each new requirement fights ancestor assumptions. Protected fields leak internals to subclasses and make invariants impossible to audit.",
          "Template methods can help when the algorithm skeleton is stable, but they punish you when subclasses need to reorder steps. Prefer composing smaller steps.",
          "If you need to override half the base class to make a subtype work, you probably wanted composition."
        ],
        "workedExample": {
          "title": "Role interface instead of a fat base",
          "body": "Notifiers implement one method. No abstract base forces unused hooks.",
          "language": "java",
          "code": "interface Notifier {\n    void notify(String message);\n}\n\nfinal class ConsoleNotifier implements Notifier {\n    public void notify(String message) {\n        System.out.println(message);\n    }\n}\n\nfinal class QuietNotifier implements Notifier {\n    public void notify(String message) {\n        // intentionally no-op for tests\n    }\n}\n\nvoid main() {\n    Notifier notifier = new ConsoleNotifier();\n    notifier.notify(\"seat reserved\");\n}"
        },
        "callout": {
          "tone": "tip",
          "body": "Count levels. More than two layers of domain inheritance is a smell in most LLD answers."
        },
        "checkYourself": [
          {
            "prompt": "What does a leaky base class look like?",
            "reveal": "Subclasses depend on protected mutable state or override hooks in ways that break the base class's undocumented assumptions."
          }
        ]
      },
      {
        "id": "tradeoff-in-future-change",
        "heading": "Explain the trade-off in terms of future change",
        "paragraphs": [
          "Frame the choice as change pressure: \"pricing will vary, ticket identity will not, so pricing is composed.\" That sentence is the interview artifact.",
          "Inheritance can still win for narrow UI widgets or closed taxonomies with shared immutable behavior. The point is deliberate choice, not dogma.",
          "When a follow-up arrives, show how composition absorbs it with a new collaborator while the entity stays put."
        ],
        "callout": {
          "tone": "interview",
          "body": "Never say \"composition is always better.\" Say why it is better for this axis of change."
        },
        "checkYourself": [
          {
            "prompt": "How do you narrate a composition choice in thirty seconds?",
            "reveal": "Name the stable owner, the varying policy, the interface method, and the follow-up that would swap the collaborator."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Default to composition for independently varying behavior.",
        "Use inheritance only when true substitutability holds.",
        "Reach for polymorphism when the same branch is spreading, not before.",
        "Explain choices as responses to future change."
      ],
      "nextSteps": [
        "Refactor a subclass tree of pricing into strategy collaborators.",
        "Find one Liskov violation in a sample hierarchy and fix it with composition.",
        "Practice saying no to inheritance when reuse is the only motive."
      ]
    }
  },
  "lld-modeling/workflow-and-state-modeling": {
    "title": "Workflow orchestration and state modeling",
    "readingTime": "75-95 min",
    "premise": "Readable LLD answers separate the script of a use case from the laws of domain state. This chapter shows how to choose clear entry points, let domain objects own transitions, sequence side effects deliberately, and absorb follow-ups without rewriting the core model.",
    "parts": [
      {
        "id": "one-entry-point",
        "heading": "One clear entry point per user action",
        "paragraphs": [
          "Each user action should have one application-facing method that reads like a script: validate inputs, load state, apply a domain command, persist, publish side effects. When that script is visible in one place, interviewers can follow the story top to bottom.",
          "Avoid multiple public doors that mutate the same aggregate differently. If both BookingController and AdminTools can confirm with different rules, invariants drift.",
          "Name entry points after the use case, not after the framework: confirmReservation beats handlePost."
        ],
        "keyTerms": [
          {
            "term": "Application service",
            "definition": "A coordinator that sequences a use case without owning domain invariants."
          },
          {
            "term": "Use-case entry point",
            "definition": "The single method callers use to initiate one user intention."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If you cannot outline the entry point in five bullets, the workflow is not ready to code."
        },
        "checkYourself": [
          {
            "prompt": "What belongs in an application service versus an entity?",
            "reveal": "The service sequences collaborators and transactions of meaning; the entity decides whether a transition is legal and applies it."
          }
        ]
      },
      {
        "id": "domain-owns-transitions",
        "heading": "Domain objects own legal transitions",
        "paragraphs": [
          "Aggregates answer \"is this transition legal?\" Coordinators answer \"when do we call which collaborator?\" That split keeps state machines testable without mocking email gateways.",
          "When orchestration logic hides inside entities, or entity rules leak into controllers, features like cancellation become rewrite projects.",
          "Keep transition methods free of I/O. Persistence and messaging are orchestration concerns."
        ],
        "workedExample": {
          "title": "Service sequences; entity decides",
          "body": "The booking owns confirm. The service loads, confirms, saves, and notifies.",
          "language": "python",
          "code": "class Booking:\n    def __init__(self, booking_id: str):\n        self.booking_id = booking_id\n        self.status = \"held\"\n\n    def confirm(self) -> None:\n        if self.status != \"held\":\n            raise ValueError(\"only held bookings confirm\")\n        self.status = \"confirmed\"\n\n\nclass BookingRepository:\n    def __init__(self):\n        self._data = {}\n\n    def get(self, booking_id: str) -> Booking:\n        return self._data[booking_id]\n\n    def save(self, booking: Booking) -> None:\n        self._data[booking.booking_id] = booking\n\n\nclass ConfirmBooking:\n    def __init__(self, repo: BookingRepository):\n        self.repo = repo\n\n    def run(self, booking_id: str) -> str:\n        booking = self.repo.get(booking_id)\n        booking.confirm()\n        self.repo.save(booking)\n        return booking.status\n\nrepo = BookingRepository()\nrepo.save(Booking(\"b1\"))\nprint(ConfirmBooking(repo).run(\"b1\"))"
        },
        "callout": {
          "tone": "interview",
          "body": "Point to the entity method when asked where the business rule lives."
        },
        "checkYourself": [
          {
            "prompt": "Why keep I/O out of transition methods?",
            "reveal": "So rules can be unit-tested without infrastructure, and so failed I/O does not blur whether the domain transition itself was legal."
          }
        ]
      },
      {
        "id": "sync-validation-vs-side-effects",
        "heading": "Separate synchronous validation from later side effects",
        "paragraphs": [
          "Synchronous validation protects the immediate invariant: capacity, authz, legal state. Later side effects\u2014email, analytics, search indexing\u2014should not be required for the domain fact to be true.",
          "Say whether observers run inline or asynchronously. Inline is simpler for demos; async needs idempotency and failure handling.",
          "A clean story: commit domain state, then emit a fact such as BookingConfirmed for listeners."
        ],
        "callout": {
          "tone": "warning",
          "body": "If sending email is inside the same try block as mutating state without a plan for partial failure, say so and improve the ordering."
        },
        "checkYourself": [
          {
            "prompt": "What should happen if notification fails after confirm succeeds?",
            "reveal": "The booking should remain confirmed; notification retries or compensation happen at the orchestration edge, not by rolling back a valid domain state blindly."
          }
        ]
      },
      {
        "id": "long-running-workflows",
        "heading": "Long-running workflows as explicit state plus coordination",
        "paragraphs": [
          "Some processes span time: hold expires, payment pending, approval chain. Model those as explicit states and timers or polling commands, not as a thread that sleeps in the service.",
          "The aggregate stores where the process is. A scheduler or application command advances it. That design survives process restarts and is easier to explain than hidden callbacks.",
          "For interview scope, one pending state and an expireHold command often beat a miniature workflow engine."
        ],
        "keyTerms": [
          {
            "term": "Long-running workflow",
            "definition": "A process that waits on time or external signals and therefore needs durable intermediate states."
          },
          {
            "term": "Coordination",
            "definition": "The orchestration of when to resume, retry, or compensate across steps."
          }
        ],
        "workedExample": {
          "title": "Hold expiry as an explicit command",
          "body": "Time is injected. Expiry is a domain decision driven by an orchestration call.",
          "language": "java",
          "code": "import java.time.Instant;\n\nfinal class SeatHold {\n    private final Instant expiresAt;\n    private String status = \"held\";\n    SeatHold(Instant expiresAt) { this.expiresAt = expiresAt; }\n    void expireIfNeeded(Instant now) {\n        if (\"held\".equals(status) && now.isAfter(expiresAt)) {\n            status = \"expired\";\n        }\n    }\n    String status() { return status; }\n}\n\nvoid main() {\n    var hold = new SeatHold(Instant.parse(\"2026-01-01T00:00:00Z\"));\n    hold.expireIfNeeded(Instant.parse(\"2026-01-01T00:05:00Z\"));\n    System.out.println(hold.status());\n}"
        },
        "callout": {
          "tone": "tip",
          "body": "Inject a clock. Sleeping or calling Instant.now() everywhere makes expiry tests painful."
        },
        "checkYourself": [
          {
            "prompt": "Why model expiry as a state transition command?",
            "reveal": "Because time passing is an event the domain must interpret; durable status beats hidden timers inside request threads."
          }
        ]
      },
      {
        "id": "absorb-followups",
        "heading": "Absorb follow-ups with workflow language",
        "paragraphs": [
          "When asked to add cancellation, retries, or admin overrides, locate the change in entry point, transition, or collaborator. Do not restart the class diagram.",
          "New side effects attach as listeners or ports. New rules attach as guards on the entity. New multi-step behavior may add states.",
          "Narrate the delta: \"same ConfirmBooking script; we add a CancelBooking entry point that calls booking.cancel and releases inventory.\""
        ],
        "callout": {
          "tone": "interview",
          "body": "Incremental answers beat heroic redesigns. Show what stays stable."
        },
        "checkYourself": [
          {
            "prompt": "Where does a new \"notify on cancel\" requirement land?",
            "reveal": "Usually as a side effect after a successful cancel transition in the cancel use-case entry point or as an event listener on BookingCancelled."
          }
        ]
      },
      {
        "id": "workflow-readability",
        "heading": "Keep the happy path readable after complexity",
        "paragraphs": [
          "As guards and listeners accumulate, periodically rewrite the entry point so the happy path is still ten lines you can read aloud. Helper methods are fine; hidden inheritance of workflow steps usually is not.",
          "Comment only the non-obvious ordering constraints, such as \"notify after save so we never email uncommitted state.\"",
          "If the script needs a diagram to understand, the responsibilities have blurred again."
        ],
        "callout": {
          "tone": "tip",
          "body": "Read the entry point to the interviewer. If you stumble, simplify before adding features."
        },
        "checkYourself": [
          {
            "prompt": "What is a sign that orchestration and domain rules are tangled?",
            "reveal": "You cannot test transitions without stubs for email and database, or you cannot explain confirm without describing SMTP."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Give each user action one readable application entry point.",
        "Let domain objects own transitions; let services own sequencing.",
        "Separate immediate validation from post-commit side effects.",
        "Model time-spanning work as explicit states plus commands."
      ],
      "nextSteps": [
        "Write a five-step script for confirm and cancel of a booking.",
        "Implement one expiry command with an injected clock.",
        "Practice answering a follow-up by pointing to entry point, guard, or port."
      ]
    }
  }
};
