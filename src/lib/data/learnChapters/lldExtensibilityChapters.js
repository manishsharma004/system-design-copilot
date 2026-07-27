/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldExtensibilityChapters = {
  "lld-extensibility/strategy-factory-and-builder": {
    "title": "Strategy, factory, and builder in interviews",
    "readingTime": "75-95 min",
    "premise": "Extensibility patterns earn their keep only when a real axis of change exists. This chapter teaches when Strategy, Factory, and Builder clarify an LLD answer\u2014and when a plain function, map, or constructor is the stronger design.",
    "parts": [
      {
        "id": "name-axis-first",
        "heading": "Name the axis of change before the pattern",
        "paragraphs": [
          "Strategy isolates runtime algorithm variation. Factories hide construction rules that would otherwise duplicate validation across callers. Builders tame objects with many optional, order-sensitive parts. Interviewers penalize pattern dumping\u2014justify each with a concrete follow-up such as a new pricing rule, storage backend, or complex ticket with add-ons.",
          "If a plain function or dictionary dispatch would work, say so. Patterns are vocabulary for a design decision, not a checklist to complete.",
          "Write the varying sentence first: \"pricing changes independently of checkout.\" Only then choose Strategy."
        ],
        "keyTerms": [
          {
            "term": "Strategy",
            "definition": "A replaceable algorithm or policy object invoked by a stable context."
          },
          {
            "term": "Factory",
            "definition": "A creation abstraction that encapsulates how valid instances are constructed."
          },
          {
            "term": "Builder",
            "definition": "A staged construction API for complex objects with optional parts and cross-field validation."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Lead with the follow-up that forces the pattern. If you cannot name one, you probably do not need it yet."
        },
        "checkYourself": [
          {
            "prompt": "What is pattern dumping?",
            "reveal": "Introducing Strategy, Factory, Builder, and Singleton by name before any axis of change or invariant has been established."
          }
        ]
      },
      {
        "id": "strategy-for-policies",
        "heading": "Strategy when policy changes independently",
        "paragraphs": [
          "Reach for Strategy when the workflow stays stable but a decision rule varies: pricing, ranking, fee calculation, assignment. The context depends on a tiny interface, usually one method.",
          "Keep strategy interfaces embarrassingly small. A kitchen-sink interface forces implementers to no-op unrelated operations and hides the real variation.",
          "Construction of the strategy can be simple injection in version one. A factory can choose strategies later if selection rules grow."
        ],
        "workedExample": {
          "title": "Fee strategy with a stable context",
          "body": "Checkout asks a FeePolicy for the fee. New policies do not edit Checkout.",
          "language": "python",
          "code": "from typing import Protocol\n\nclass FeePolicy(Protocol):\n    def fee_cents(self, subtotal: int) -> int: ...\n\nclass FlatFee:\n    def fee_cents(self, subtotal: int) -> int:\n        return 100\n\nclass PercentFee:\n    def __init__(self, bps: int):\n        self.bps = bps\n\n    def fee_cents(self, subtotal: int) -> int:\n        return subtotal * self.bps // 10_000\n\nclass Checkout:\n    def __init__(self, fees: FeePolicy):\n        self.fees = fees\n\n    def total(self, subtotal: int) -> int:\n        return subtotal + self.fees.fee_cents(subtotal)\n\nprint(Checkout(FlatFee()).total(2000))\nprint(Checkout(PercentFee(250)).total(2000))"
        },
        "callout": {
          "tone": "tip",
          "body": "One-method strategies are easier to explain live than abstract class hierarchies."
        },
        "checkYourself": [
          {
            "prompt": "When should selection of a strategy move into a factory?",
            "reveal": "When choosing among policies requires shared rules or configuration that callers should not duplicate."
          }
        ]
      },
      {
        "id": "factory-for-construction",
        "heading": "Factory when callers should not own construction",
        "paragraphs": [
          "Factories help when creating a valid object needs branching, validation, or hidden collaborators. Callers should receive something already in a legal initial state, not a half-configured shell.",
          "Factory method and simple factory functions are enough for most interviews. Abstract factory rarely earns its complexity in a forty-five minute round.",
          "Reject Singleton as a default. Prefer passing dependencies explicitly. Global mutable singletons make tests and concurrency follow-ups painful."
        ],
        "workedExample": {
          "title": "Factory returns a valid ticket",
          "body": "Callers never touch raw constructors that could omit required fields.",
          "language": "java",
          "code": "final class Ticket {\n    final String id;\n    final String spotId;\n    private Ticket(String id, String spotId) {\n        this.id = id;\n        this.spotId = spotId;\n    }\n}\n\nfinal class TicketFactory {\n    private int seq = 0;\n    Ticket issue(String spotId) {\n        if (spotId == null || spotId.isBlank()) {\n            throw new IllegalArgumentException(\"spot required\");\n        }\n        seq += 1;\n        return new Ticket(\"t-\" + seq, spotId);\n    }\n}\n\nvoid main() {\n    System.out.println(new TicketFactory().issue(\"P-12\").id);\n}"
        },
        "callout": {
          "tone": "warning",
          "body": "A factory that returns null on failure teaches callers to forget checks. Prefer exceptions or a result type."
        },
        "checkYourself": [
          {
            "prompt": "Why is Singleton often weaker than dependency injection in LLD?",
            "reveal": "It hides dependencies, complicates testing, and creates shared mutable state that concurrency follow-ups will attack."
          }
        ]
      },
      {
        "id": "builder-for-staged-setup",
        "heading": "Builder when staged setup matters",
        "paragraphs": [
          "Builders earn their keep when objects have many optional parts, order-sensitive assembly, or cross-field validation at the end. Fluent setters without a final build that validates are just mutable bags.",
          "Use builders for interview demos of complex configuration\u2014for example a report query or a ticket with optional add-ons\u2014not for every three-field entity.",
          "The build method should fail if required combinations are missing. That is the point."
        ],
        "keyTerms": [
          {
            "term": "Staged validation",
            "definition": "Checks that run when assembly completes, covering combinations individual setters cannot see."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If construction is two required fields, a constructor is clearer than a builder."
        },
        "checkYourself": [
          {
            "prompt": "What makes a builder better than a telescoping constructor?",
            "reveal": "Readable optional configuration and a final validation gate without an explosion of overloaded constructors."
          }
        ]
      },
      {
        "id": "keep-boundaries-narrow",
        "heading": "Keep pattern boundaries narrow enough to explain live",
        "paragraphs": [
          "Each pattern should add at most a handful of types. If your Strategy needs an abstract factory of builders of strategies, you have left the interview.",
          "Show the before/after: a conditional becomes a collaborator; duplicated construction becomes a factory; a messy constructor becomes a builder.",
          "Narrate trade-offs: more types, clearer variation, easier tests."
        ],
        "callout": {
          "tone": "interview",
          "body": "Invite the interviewer to pick the next policy. Swapping it live is a strong signal."
        },
        "checkYourself": [
          {
            "prompt": "How many new types should a strategy introduction usually add?",
            "reveal": "Typically the interface or protocol, one or two implementations, and maybe no new context type if an existing service already hosts the call."
          }
        ]
      },
      {
        "id": "say-no-to-patterns",
        "heading": "Say no when the simpler design is stronger",
        "paragraphs": [
          "Judgment is the senior skill. A map from string to function can be a perfectly honest strategy table. A static helper can be a perfectly honest factory for version one.",
          "Say what would make you upgrade: a third variant, cross-field construction rules, or a test seam requirement.",
          "Interviewers remember candidates who delete unnecessary abstraction more than candidates who recite catalogs."
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not implement Builder, Factory, and Strategy on the same tiny demo unless three distinct axes truly exist."
        },
        "checkYourself": [
          {
            "prompt": "Give a reason to postpone introducing Strategy.",
            "reveal": "Only one policy exists, the interviewer has not asked for variation, and a conditional remains localized and readable."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Justify Strategy, Factory, and Builder with explicit axes of change.",
        "Keep interfaces tiny and constructed objects valid.",
        "Prefer DI over Singleton for shared services.",
        "Choose simplicity when variation is not real yet."
      ],
      "nextSteps": [
        "Refactor a fee conditional into a one-method strategy.",
        "Write a factory that refuses invalid construction inputs.",
        "Practice declining Builder for a three-field entity."
      ]
    }
  },
  "lld-extensibility/observer-dependency-inversion-and-events": {
    "title": "Observer, dependency inversion, and events",
    "readingTime": "80-100 min",
    "premise": "Side effects and integrations should not tangle the core workflow. This chapter shows how to publish domain facts after successful state changes, invert dependencies through narrow ports, and keep observers idempotent without hiding the happy path.",
    "parts": [
      {
        "id": "publish-facts",
        "heading": "Publish facts after the core change succeeds",
        "paragraphs": [
          "After a successful state change, emit a domain event describing what happened\u2014OrderPlaced, SeatReserved\u2014rather than telling subscribers exactly what to do. The core stays focused on invariants while analytics, email, and search indexing subscribe independently.",
          "Publishing before commit invites false notifications. Publishing commands like SendEmail from deep inside entities couples the domain to delivery mechanics.",
          "Name events in past tense to emphasize facts."
        ],
        "keyTerms": [
          {
            "term": "Domain event",
            "definition": "An immutable record that something meaningful happened in the domain."
          },
          {
            "term": "Observer",
            "definition": "A subscriber notified of events so it can react without being invoked directly by core logic."
          }
        ],
        "workedExample": {
          "title": "In-process event after confirm",
          "body": "The service confirms first, then publishes. Listeners cannot veto the domain decision here.",
          "language": "python",
          "code": "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass BookingConfirmed:\n    booking_id: str\n\nclass Booking:\n    def __init__(self, booking_id: str):\n        self.booking_id = booking_id\n        self.status = \"held\"\n\n    def confirm(self) -> None:\n        if self.status != \"held\":\n            raise ValueError(\"invalid transition\")\n        self.status = \"confirmed\"\n\nclass EventBus:\n    def __init__(self):\n        self._subs = []\n\n    def subscribe(self, fn):\n        self._subs.append(fn)\n\n    def publish(self, event):\n        for fn in self._subs:\n            fn(event)\n\nbus = EventBus()\nbus.subscribe(lambda e: print(\"email\", e.booking_id))\nbooking = Booking(\"b-1\")\nbooking.confirm()\nbus.publish(BookingConfirmed(booking.booking_id))"
        },
        "callout": {
          "tone": "tip",
          "body": "Past-tense event names discourage treating observers as a second control flow inside the entity."
        },
        "checkYourself": [
          {
            "prompt": "Why publish after state change rather than before?",
            "reveal": "So failed guards never emit success facts, and listeners react to committed domain truth."
          }
        ]
      },
      {
        "id": "ports-from-caller",
        "heading": "Define ports from the caller perspective",
        "paragraphs": [
          "Dependency inversion means high-level workflow code depends on narrow abstractions\u2014Repository, Notifier, Clock\u2014not on SMTP clients or SQL drivers. Shape those abstractions from what the caller needs, not from what a vendor API offers.",
          "A Notifier.notify(event) is caller-shaped. An SmtpClient.sendMime(...) is provider-shaped and will leak into every use case.",
          "Inversion localizes volatility: new integrations become new adapters, not edits to the booking script."
        ],
        "keyTerms": [
          {
            "term": "Dependency inversion",
            "definition": "High-level modules depend on abstractions; low-level details conform to those abstractions."
          },
          {
            "term": "Port/adapter",
            "definition": "A caller-owned contract plus a technology-specific implementation."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Mention that the same port enabling a fake in tests enables a cloud adapter later."
        },
        "checkYourself": [
          {
            "prompt": "What makes a port feel domain-driven?",
            "reveal": "Method names and parameters speak in use-case language and hide vendor types, table shapes, and wire formats."
          }
        ]
      },
      {
        "id": "sync-vs-async",
        "heading": "Say whether observers run sync or async",
        "paragraphs": [
          "Synchronous observers are easy to reason about and fine for demos, but one slow listener blocks the use case. Asynchronous delivery scales side effects but needs durability, ordering, and failure policies.",
          "In interviews, pick explicitly. \"Version one notifies sync in-process; under load this port becomes a queue publisher\" is a credible bridge.",
          "Never leave delivery semantics unspoken\u2014follow-ups will ask what happens when email is down."
        ],
        "callout": {
          "tone": "warning",
          "body": "Async without idempotency is a duplicate-notification machine."
        },
        "checkYourself": [
          {
            "prompt": "What changes when observers become async?",
            "reveal": "You need a durable handoff, retry policy, and idempotent consumers; the domain event contract can stay the same."
          }
        ]
      },
      {
        "id": "idempotent-observers",
        "heading": "Make retryable observers idempotent",
        "paragraphs": [
          "Retries happen. Observers should tolerate duplicate delivery: use event ids, upsert semantics, or natural idempotency keys such as booking_id for a confirmation email record.",
          "At-least-once delivery is the usual practical default. Exactly-once is an infrastructure claim you should not hand-wave in LLD.",
          "Document what \"processing\" means: write a row, call a gateway, update a read model."
        ],
        "workedExample": {
          "title": "Idempotent projection update",
          "body": "A read-model updater ignores duplicates by booking id.",
          "language": "java",
          "code": "import java.util.HashSet;\nimport java.util.Set;\n\nrecord BookingConfirmed(String bookingId) {}\n\nfinal class ConfirmationProjection {\n    private final Set<String> confirmed = new HashSet<>();\n    void on(BookingConfirmed event) {\n        confirmed.add(event.bookingId()); // set add is idempotent\n    }\n    boolean isConfirmed(String bookingId) {\n        return confirmed.contains(bookingId);\n    }\n}\n\nvoid main() {\n    var projection = new ConfirmationProjection();\n    var event = new BookingConfirmed(\"b-9\");\n    projection.on(event);\n    projection.on(event);\n    System.out.println(projection.isConfirmed(\"b-9\"));\n}"
        },
        "callout": {
          "tone": "tip",
          "body": "If you cannot name the idempotency key, you are not ready for retries."
        },
        "checkYourself": [
          {
            "prompt": "Why are natural keys useful for idempotent listeners?",
            "reveal": "They let consumers recognize duplicates without requiring a perfect exactly-once bus, which most systems lack."
          }
        ]
      },
      {
        "id": "readable-happy-path",
        "heading": "Keep the happy path readable after decoupling",
        "paragraphs": [
          "Decoupling fails when the entry point disappears under broker of brokers. The confirm method should still read clearly: load, confirm, save, publish.",
          "Limit observer count in version one. Two listeners beat eight speculative ones.",
          "If debugging requires tracing six opaque callbacks to understand confirm, re-inline until the story is clear, then re-extract."
        ],
        "callout": {
          "tone": "interview",
          "body": "Offer to show the sequence diagram with one synchronous listener before discussing queues."
        },
        "checkYourself": [
          {
            "prompt": "How do you prevent observer sprawl in a timed round?",
            "reveal": "Implement only the listeners the prompt needs, keep publish at the end of the use case, and park additional integrations as future subscribers."
          }
        ]
      },
      {
        "id": "dip-without-ceremony",
        "heading": "Dependency inversion without ceremony",
        "paragraphs": [
          "You do not need a DI container in an interview. Constructor injection of interfaces is enough. Wire adapters in main.",
          "Avoid abstracting stable value objects or entities. Invert only volatile edges.",
          "The test is simple: can you replace the notifier without editing the use case?"
        ],
        "callout": {
          "tone": "tip",
          "body": "main() as composition root is a perfectly respectable interview architecture."
        },
        "checkYourself": [
          {
            "prompt": "Where should adapters be constructed?",
            "reveal": "At the composition root (main or a small wiring module), then passed into application services\u2014not inside domain entities."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Emit past-tense domain facts after successful mutations.",
        "Shape ports from caller needs and adapt technologies behind them.",
        "Declare sync versus async delivery and design for idempotent retries.",
        "Preserve a readable use-case script after decoupling."
      ],
      "nextSteps": [
        "Add an event bus with two listeners to a confirm flow.",
        "Rewrite a provider-shaped SMTP call into a Notifier port.",
        "Identify an idempotency key for a payment webhook handler."
      ]
    }
  },
  "lld-extensibility/repositories-caching-and-persistence-seams": {
    "title": "Repositories, caching, and persistence seams",
    "readingTime": "75-95 min",
    "premise": "Persistence should not dictate your object model, but it must remain honest. This chapter designs repository methods in use-case language, keeps mapping near adapters, places caches with clear freshness ownership, and uses fakes to keep domain rules cheap to test.",
    "parts": [
      {
        "id": "use-case-repositories",
        "heading": "Repository methods around use cases",
        "paragraphs": [
          "Methods like findAvailableSeatsForShow or saveBooking are clearer than generic save/getById when they encode domain intent and transaction scope. The repository is an anti-corruption layer between storage technology and your object graph.",
          "Generic CRUD interfaces often push query meaning back into services as filter soup. Prefer intention-revealing names even if the demo is an in-memory map.",
          "Return domain objects, not rows. Mapping belongs near the adapter."
        ],
        "keyTerms": [
          {
            "term": "Repository",
            "definition": "A persistence gateway that loads and stores aggregates in domain language."
          },
          {
            "term": "Anti-corruption layer",
            "definition": "A boundary that prevents storage schemas from leaking into domain types."
          }
        ],
        "workedExample": {
          "title": "Intention-revealing in-memory repository",
          "body": "The method name states the use case. Internals can be a dict today and SQL tomorrow.",
          "language": "python",
          "code": "class Booking:\n    def __init__(self, booking_id: str, show_id: str, seat_id: str):\n        self.booking_id = booking_id\n        self.show_id = show_id\n        self.seat_id = seat_id\n\nclass BookingRepository:\n    def __init__(self):\n        self._by_id = {}\n        self._taken = set()\n\n    def save_booking(self, booking: Booking) -> None:\n        key = (booking.show_id, booking.seat_id)\n        if key in self._taken:\n            raise ValueError(\"seat taken\")\n        self._taken.add(key)\n        self._by_id[booking.booking_id] = booking\n\n    def find_available_seat_ids(self, show_id: str, seats: list[str]) -> list[str]:\n        return [s for s in seats if (show_id, s) not in self._taken]\n\nrepo = BookingRepository()\nrepo.save_booking(Booking(\"b1\", \"show-1\", \"A1\"))\nprint(repo.find_available_seat_ids(\"show-1\", [\"A1\", \"A2\"]))"
        },
        "callout": {
          "tone": "tip",
          "body": "If a repository method needs ten filters, you may be missing a query object or a narrower use case."
        },
        "checkYourself": [
          {
            "prompt": "Why avoid leaking SQL shapes into services?",
            "reveal": "Services start depending on columns and joins, making the domain unreadable and locking you to one storage model."
          }
        ]
      },
      {
        "id": "mapping-near-adapter",
        "heading": "Keep mapping and storage detail near the adapter",
        "paragraphs": [
          "Entities should not know column names, cache keys, or ORM session APIs. Mappers convert between records and aggregates beside the repository implementation.",
          "In interviews, an InMemoryRepository without a mapper is fine. When you mention SQL, say the mapper lives with the adapter.",
          "Do not let cache key formats appear in application services."
        ],
        "callout": {
          "tone": "warning",
          "body": "An entity method named toRow() is a smell that persistence is invading the domain."
        },
        "checkYourself": [
          {
            "prompt": "Where should JSON serialization for storage live?",
            "reveal": "In the persistence adapter or mapper, not in domain entity methods used by business rules."
          }
        ]
      },
      {
        "id": "cache-ownership",
        "heading": "Caching with explicit freshness ownership",
        "paragraphs": [
          "Decide cache ownership before adding a cache. Often the cache is an implementation detail behind the repository. Callers must still understand staleness guarantees.",
          "Document whether reads may be eventually consistent and who invalidates on writes. A read-through cache behind findShow is clearer than map lookups sprinkled through business logic.",
          "In interviews, say what is cached, what is invalidated, and what is an acceptable stale window."
        ],
        "keyTerms": [
          {
            "term": "Read-through cache",
            "definition": "A cache that loads from storage on miss and returns cached values on hit, usually behind a repository."
          },
          {
            "term": "Cache invalidation",
            "definition": "The policy for removing or updating cache entries when writes occur."
          }
        ],
        "workedExample": {
          "title": "Read-through cache behind a repository port",
          "body": "The service still calls ShowRepository. Caching is an adapter concern.",
          "language": "java",
          "code": "import java.util.HashMap;\nimport java.util.Map;\n\ninterface ShowRepository {\n    String findTitle(String showId);\n}\n\nfinal class CachedShowRepository implements ShowRepository {\n    private final ShowRepository inner;\n    private final Map<String, String> cache = new HashMap<>();\n    CachedShowRepository(ShowRepository inner) { this.inner = inner; }\n    public String findTitle(String showId) {\n        return cache.computeIfAbsent(showId, inner::findTitle);\n    }\n    void invalidate(String showId) { cache.remove(showId); }\n}"
        },
        "callout": {
          "tone": "interview",
          "body": "\"Cache-aside behind the repository\" beats \"we will add Redis\" without ownership."
        },
        "checkYourself": [
          {
            "prompt": "Who should invalidate show title cache on rename?",
            "reveal": "The write path that updates the show\u2014typically the same repository adapter or an application service that knows both write and cache policy."
          }
        ]
      },
      {
        "id": "fake-repositories",
        "heading": "Fake repositories keep rules cheap to test",
        "paragraphs": [
          "An in-memory fake that honors the same port lets you prove sold-out and double-book paths without a database. That is one of the highest leverage seams in machine coding.",
          "Fakes should enforce the same invariants you care about, not be empty shells that always succeed.",
          "When scale arrives, the port stays; the adapter gains transactions and indexes."
        ],
        "callout": {
          "tone": "tip",
          "body": "Write the fake first if it clarifies the contract for both tests and the interviewer."
        },
        "checkYourself": [
          {
            "prompt": "What should an in-memory repository fake prove?",
            "reveal": "That domain and application rules hold for persistence interactions\u2014especially uniqueness and not-found paths\u2014without real I/O."
          }
        ]
      },
      {
        "id": "scale-changes-first",
        "heading": "What changes first when durability increases",
        "paragraphs": [
          "When interviewers ask about durable storage, list the delta: in-memory map becomes a DB adapter, save methods gain transactional boundaries, ids may become database-assigned, and cache invalidation becomes explicit.",
          "Do not throw away the domain model. Reuse aggregates and ports. Admit which process-local assumptions die\u2014such as a synchronized HashMap as the source of truth.",
          "Order the bridge: correctness of repository contract, then transactions, then caching, then sharding."
        ],
        "callout": {
          "tone": "interview",
          "body": "Speak in increments: \"same BookingRepository port; Postgres adapter; transaction around save_booking.\""
        },
        "checkYourself": [
          {
            "prompt": "What stays stable when swapping in-memory for SQL?",
            "reveal": "Domain entities, use-case services, and the repository port method signatures\u2014if you designed the seam well."
          }
        ]
      },
      {
        "id": "persistence-honesty",
        "heading": "Stay honest about consistency",
        "paragraphs": [
          "Do not claim ACID for an in-memory demo without locks. Do not claim a cache is always coherent if you only invalidate on one write path.",
          "State the version-one consistency story: single process, synchronized methods or per-key locks around the aggregate update.",
          "Honesty builds trust for later concurrency and scale follow-ups."
        ],
        "callout": {
          "tone": "warning",
          "body": "Overclaiming durability is worse than a simple in-memory caveat."
        },
        "checkYourself": [
          {
            "prompt": "How do you describe version-one persistence in one sentence?",
            "reveal": "For example: \"In-memory repository with per-show locking; same interface later backed by a transactional database.\""
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Name repository methods for use cases and return domain objects.",
        "Keep mapping, SQL, and cache keys in adapters.",
        "Place caches behind seams with explicit invalidation and staleness.",
        "Bridge to durable storage by swapping adapters, not rewriting the model."
      ],
      "nextSteps": [
        "Design a BookingRepository port with two intention-revealing methods.",
        "Wrap it with a read-through cache adapter on paper.",
        "List three assumptions that change when the fake becomes SQL."
      ]
    }
  }
};
