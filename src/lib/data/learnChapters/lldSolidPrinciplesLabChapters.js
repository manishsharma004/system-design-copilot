/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldSolidPrinciplesLabChapters = {
  'lld-solid-principles-lab/solid-principles-in-practice': {
    title: 'SOLID principles in practice',
    readingTime: '55-70 min',
    premise:
      'SOLID is useful in machine-coding interviews when treated as change-management heuristics, not as a creed. The goal is smaller blast radius when requirements shift: split reasons to change, keep workflows closed against policy churn, honor substitutions, keep interfaces focused, and depend on stable ports.',
    parts: [
      {
        id: 'change-pressure-first',
        heading: 'Start from change pressure, not acronym order',
        paragraphs: [
          'Interviewers rarely score you for reciting SOLID in order. They score whether you notice a class that changes for pricing, persistence, and notifications at once. Name those axes aloud. Then propose splits that make each axis local.',
          'Early in a timed round, a slightly coarse service is fine. After the happy path works, refactor along the hottest change axis. That iteration story shows judgment: principles serve delivery, not the other way around.',
          'A practical prompt to yourself: "If the business adds one new rule tomorrow, which files must change?" If the answer is every file, SOLID thinking has work to do.'
        ],
        keyTerms: [
          {
            term: 'Axis of change',
            definition:
              'A reason the software might need to evolve, such as pricing rules or notification channels.'
          },
          {
            term: 'Blast radius',
            definition:
              'How many modules must be understood and risked when one requirement changes.'
          },
          {
            term: 'Coarse-first iteration',
            definition:
              'Shipping a working orchestrator early, then extracting boundaries as pressures appear.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Write the axis of change on the whiteboard before naming a principle. It keeps the discussion concrete.'
        },
        checkYourself: [
          {
            prompt: 'Why can a temporary god service be acceptable in the first five minutes?',
            reveal:
              'It unlocks a demo quickly. Principles matter when you then extract hot axes so later edits stay local.'
          }
        ]
      },
      {
        id: 'srp-and-ocp',
        heading: 'SRP and OCP: workflow versus policy',
        paragraphs: [
          'Single Responsibility means one primary reason to change, not "one method." Checkout may coordinate steps while PricingPolicy owns discount math. Those reasons diverge: workflow order versus commercial rules.',
          'Open Closed means stable workflows should not gain a new `elif` for every policy variant. Depend on an abstraction and add implementations. It is not a ban on editing files; it is a preference for extension at real variation points.',
          'Premature OCP invents strategy interfaces for rules that will never vary. Extract when the second variant arrives or when the interviewer explicitly adds one.'
        ],
        keyTerms: [
          {
            term: 'Single Responsibility Principle',
            definition:
              'A module should have one primary reason to change, concentrating related decisions together.'
          },
          {
            term: 'Open Closed Principle',
            definition:
              'Software entities should allow extension of behavior without repeatedly rewriting stable orchestration.'
          },
          {
            term: 'Policy object',
            definition:
              'A collaborator that encapsulates a replaceable business rule behind a narrow interface.'
          }
        ],
        workedExample: {
          title: 'Checkout workflow with replaceable pricing',
          body: 'Checkout coordinates; pricing policies vary. Adding MemberPricing does not edit Checkout.',
          language: 'python',
          code: `from abc import ABC, abstractmethod


class PricingPolicy(ABC):
    @abstractmethod
    def total(self, items: list[dict]) -> int:
        ...


class StandardPricing(PricingPolicy):
    def total(self, items: list[dict]) -> int:
        return sum(i["price"] * i["qty"] for i in items)


class MemberPricing(PricingPolicy):
    def total(self, items: list[dict]) -> int:
        return int(StandardPricing().total(items) * 0.9)


class Checkout:
    def __init__(self, pricing: PricingPolicy) -> None:
        self._pricing = pricing

    def pay(self, items: list[dict]) -> int:
        if not items:
            raise ValueError("empty cart")
        return self._pricing.total(items)


if __name__ == "__main__":
    cart = [{"price": 100, "qty": 2}]
    print(Checkout(StandardPricing()).pay(cart))
    print(Checkout(MemberPricing()).pay(cart))`
        },
        callout: {
          tone: 'interview',
          body:
            'Pair SRP and OCP in one sentence: "I separated policy from workflow so new prices extend pricing, not checkout."'
        },
        checkYourself: [
          {
            prompt: 'Does SRP mean Checkout may only have one method?',
            reveal:
              'No. Checkout may have several methods that serve the same workflow responsibility. The smell is mixing unrelated reasons to change into the same class.'
          }
        ]
      },
      {
        id: 'lsp-and-isp',
        heading: 'LSP and ISP: honest substitution and small interfaces',
        paragraphs: [
          'Liskov Substitution says subtypes must honor the contract callers rely on. A Square inheriting Rectangle that breaks area assumptions, or a ReadOnlyStore that throws on `save`, violates expectations. Prefer separate interfaces over surprising overrides.',
          'Interface Segregation says clients should not depend on methods they never call. A fat Worker interface with `work`, `eat`, and `fly` forces awkward stubs. Split into role interfaces aligned to callers.',
          'In Python interviews without formal interfaces, LSP/ISP still apply: duck-typed collaborators must accept the same inputs and meaning, and protocols should stay narrow.'
        ],
        keyTerms: [
          {
            term: 'Liskov Substitution Principle',
            definition:
              'Subtype instances must be usable wherever their supertype is expected without breaking caller assumptions.'
          },
          {
            term: 'Interface Segregation Principle',
            definition:
              'Prefer small, role-focused interfaces over fat contracts that force irrelevant dependencies.'
          },
          {
            term: 'Contract',
            definition:
              'The behavioral expectations around inputs, outputs, exceptions, and side effects a caller relies on.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'A subclass that silently no-ops a superclass method is often an LSP violation disguised as convenience.'
        },
        checkYourself: [
          {
            prompt: 'How do you fix a ReadOnlyStore that cannot implement save on a Store interface?',
            reveal:
              'Split into ReadableStore and WritableStore (or similar). Callers that only read depend only on the read role.'
          }
        ]
      },
      {
        id: 'dip-in-lld',
        heading: 'DIP: depend on ports you own',
        paragraphs: [
          'Dependency Inversion means high-level policy should not depend on low-level details. Checkout should depend on a Notifier port, not on SmtpClient. Concrete adapters implement the port at the composition root.',
          'DIP pairs with testing: fakes implement the same port. If you cannot fake it, you probably depend on a detail. Keep ports thin—one capability, clear types—so adapters stay small.',
          'Do not invert everything. Stable standard library types and simple value objects can be used directly. Invert volatile, awkward, or external boundaries.'
        ],
        keyTerms: [
          {
            term: 'Dependency Inversion Principle',
            definition:
              'High-level modules depend on abstractions; low-level details implement those abstractions.'
          },
          {
            term: 'Port',
            definition:
              'An interface owned by the domain that describes a capability it needs from the outside world.'
          },
          {
            term: 'Adapter',
            definition:
              'A concrete implementation that connects a port to an external technology or API.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Point at the composition root: "main wires SmtpNotifier into Checkout; Checkout never imports SMTP."'
        },
        checkYourself: [
          {
            prompt: 'What is a sign you inverted a dependency successfully?',
            reveal:
              'Domain code imports only your port types, and tests substitute a fake without monkeypatching private internals.'
          }
        ]
      },
      {
        id: 'solid-concurrency-edges',
        heading: 'Concurrency, edge cases, and over-application',
        paragraphs: [
          'SOLID does not remove concurrency concerns, but it localizes them. A thread-safe inventory adapter can protect mutations without infecting pricing policy objects. Keep locks next to shared mutable state owned by one module.',
          'Edge cases: empty carts, null policies, adapters throwing transport errors, and partial failure after payment. Decide which layer translates errors. Policies should throw domain-meaningful errors; adapters may wrap vendor exceptions.',
          'Over-application creates interface forests. If every class has an interface with one production implementation and no test fake, you paid ceremony without leverage. Extract abstractions where substitution is real.'
        ],
        callout: {
          tone: 'warning',
          body:
            'Five principles do not require five new interfaces on every exercise. Apply the one that shrinks the hottest conditional.'
        },
        checkYourself: [
          {
            prompt: 'Where should a mutex live in a SOLID-ish checkout design?',
            reveal:
              'Beside the shared mutable inventory or payment ledger, typically in the adapter or repository that owns that state—not inside pure pricing policies.'
          }
        ]
      },
      {
        id: 'solid-interview-narrative',
        heading: 'Narrating SOLID under time pressure',
        paragraphs: [
          'Tell a before/after story: one class did pricing and email; you extracted PricingPolicy and Notifier. Show the new variant plugging in. That narrative beats textbook definitions.',
          'Map interviewer follow-ups to principles: new discount → OCP/SRP, swap SMS → DIP, read-only analytics store → ISP/LSP. Using the names sparingly after the design is clear sounds senior.',
          'Close with what you intentionally left concrete. Honesty about non-inverted details builds trust.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Use principle names as labels on decisions you already made, not as a checklist to force structure.'
        },
        checkYourself: [
          {
            prompt: 'What is a strong one-minute SOLID summary?',
            reveal:
              'Identify change axes, isolate policies from workflows, keep substitutions honest, keep interfaces role-sized, and depend on ports at volatile edges.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'SOLID is a vocabulary for managing change pressure in object designs.',
        'SRP and OCP usually matter first: separate policy from workflow.',
        'LSP and ISP keep substitutions and interfaces honest; DIP protects high-level policy from details.',
        'Apply principles iteratively where variation is real; avoid interface theater.'
      ],
      nextSteps: [
        'Refactor a mixed checkout class into Checkout + PricingPolicy + Notifier port.',
        'Add a second pricing policy without editing Checkout.',
        'Replace a throwing read-only store with segregated read/write interfaces.'
      ]
    }
  },

  'lld-solid-principles-lab/cohesion-coupling-and-grasp': {
    title: 'Cohesion, coupling, and GRASP heuristics',
    readingTime: '55-70 min',
    premise:
      'Cohesion, coupling, and GRASP give you language for where to put methods and how tightly objects should know each other. In LLD interviews they explain responsibility assignment more precisely than "I made a service class."',
    parts: [
      {
        id: 'cohesion-and-coupling-basics',
        heading: 'High cohesion, low coupling as design pressure gauges',
        paragraphs: [
          'Cohesion asks whether a module\'s responsibilities belong together. A TicketPrinter that also charges cards is low cohesion. Coupling asks how much one module knows about another\'s internals. Reaching through objects to tweak private collections is tight coupling.',
          'The interview goal is not zero coupling—objects must collaborate—but coupling along stable abstractions with small surfaces. High cohesion makes names predictive: FeeCalculator calculates fees.',
          'When stuck placing a method, ask which data changes with it. Methods usually sit with the data they need most (information expert). That single GRASP idea prevents anemic models and accidental god services.'
        ],
        keyTerms: [
          {
            term: 'Cohesion',
            definition:
              'How strongly the responsibilities inside a module relate to a single purpose.'
          },
          {
            term: 'Coupling',
            definition:
              'How much one module depends on the knowledge or presence of another.'
          },
          {
            term: 'Information expert',
            definition:
              'GRASP guidance to assign a responsibility to the class with the information needed to fulfill it.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'If a class name needs "and" to describe its job, cohesion is probably weak.'
        },
        checkYourself: [
          {
            prompt: 'Is an ElevatorController coupled to ElevatorCar a problem by itself?',
            reveal:
              'No. Controllers must know cars. It becomes a problem when the controller digs into car private stop lists or duplicates car motion rules.'
          }
        ]
      },
      {
        id: 'grasp-catalog-that-matters',
        heading: 'GRASP heuristics that matter in timed rounds',
        paragraphs: [
          'Creator: assign creation to the class that aggregates or closely uses the new object. ParkingLot creating Ticket is natural; a random Util creating Tickets is not.',
          'Controller: a non-UI object that handles system events for a use case. BookingService acting on hold requests is a controller in GRASP terms. Keep it thin by delegating to experts.',
          'Low coupling / high cohesion, polymorphism, pure fabrication, indirection, and protected variations round out the set. Pure fabrication covers repositories and gateways that do not exist in the domain language but protect design quality. Protected variations is GRASP\'s cousin to OCP: wrap predicted variation points.'
        ],
        keyTerms: [
          {
            term: 'Creator',
            definition:
              'GRASP pattern for placing object construction with the aggregator or close collaborator.'
          },
          {
            term: 'Pure fabrication',
            definition:
              'A class invented for design convenience, such as a repository, not found as a domain noun.'
          },
          {
            term: 'Protected variations',
            definition:
              'Identify predicted change points and wrap them behind stable interfaces.'
          }
        ],
        workedExample: {
          title: 'Information expert vs anemic cart',
          body: 'Line total lives on CartLine; cart total lives on Cart. The service only coordinates persistence.',
          language: 'python',
          code: `from dataclasses import dataclass, field


@dataclass
class CartLine:
    sku: str
    unit_price: int
    qty: int

    def line_total(self) -> int:
        return self.unit_price * self.qty


@dataclass
class Cart:
    lines: list[CartLine] = field(default_factory=list)

    def add(self, sku: str, unit_price: int, qty: int) -> None:
        self.lines.append(CartLine(sku, unit_price, qty))

    def total(self) -> int:
        return sum(line.line_total() for line in self.lines)


class CartService:
    def __init__(self, store) -> None:
        self._store = store

    def checkout(self, cart: Cart) -> int:
        total = cart.total()
        self._store.save_total(total)
        return total


if __name__ == "__main__":
    cart = Cart()
    cart.add("sku-1", 500, 2)
    print(CartService(type("S", (), {"save_total": staticmethod(print)})()).checkout(cart))`
        },
        callout: {
          tone: 'interview',
          body:
            'Say: "Cart knows its lines, so it computes total—information expert—while the service handles the use-case edge."'
        },
        checkYourself: [
          {
            prompt: 'When is a pure fabrication justified?',
            reveal:
              'When putting a responsibility on a domain object would hurt cohesion or create awkward coupling—for example persistence protocols living in a repository rather than on Cart.'
          }
        ]
      },
      {
        id: 'responsibility-driven-design',
        heading: 'Responsibility-driven design in the interview loop',
        paragraphs: [
          'List responsibilities as short verb phrases: accept hall call, choose car, advance car, open door. Assign each to a class. If one class collects half the verbs, split.',
          'CRC-style thinking (class, responsibilities, collaborators) works verbally even without cards. For ElevatorCar: responsibilities—manage stops, move; collaborators—state, maybe motor port.',
          'Revisit assignments after the first demo. New requirements often reveal misplaced methods. Moving a method is cheaper than defending a wrong home.'
        ],
        keyTerms: [
          {
            term: 'Responsibility',
            definition:
              'A purposeful obligation a class has, usually expressible as a verb phrase.'
          },
          {
            term: 'Collaborator',
            definition:
              'Another object a class needs to fulfill its responsibilities.'
          },
          {
            term: 'Anemic model',
            definition:
              'Data holders with all behavior pushed into services, often weakening cohesion of domain concepts.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'If every decision sits in *Service classes, ask which domain expert is missing.'
        },
        checkYourself: [
          {
            prompt: 'Who should know how to compute whether a spot fits a vehicle?',
            reveal:
              'Often the allocator or a compatibility policy with access to sizes—not the UI controller and not a random helper with five unrelated methods.'
          }
        ]
      },
      {
        id: 'coupling-shapes',
        heading: 'Shapes of coupling and how to loosen them',
        paragraphs: [
          'Content coupling (one module edits another\'s internals) is the worst common form in interview code—sharing a raw list of seats and letting everyone mutate it. Prefer methods that encapsulate mutation.',
          'Feature envy appears when a method in A mostly uses data from B. Move the method toward B or introduce a better expert. Law of Demeter guidance—avoid `a.b().c().d()` trains—reduces brittle knowledge of deep graphs.',
          'Temporal coupling (must call methods in an undocumented order) is fixed by APIs that perform the sequence internally or by builders that validate completeness.'
        ],
        keyTerms: [
          {
            term: 'Feature envy',
            definition:
              'A method that seems more interested in another class\'s data than its own.'
          },
          {
            term: 'Law of Demeter',
            definition:
              'A guideline to talk mostly to immediate collaborators rather than dig through object chains.'
          },
          {
            term: 'Temporal coupling',
            definition:
              'Hidden requirement that methods be called in a specific order to work correctly.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Passing around mutable inventories without ownership rules creates content coupling and race conditions together.'
        },
        checkYourself: [
          {
            prompt: 'How do you reduce temporal coupling in reservation confirm?',
            reveal:
              'Expose confirm(reservation_id) that validates state, payment, and inventory internally rather than requiring callers to call validate(), charge(), markSold() in order.'
          }
        ]
      },
      {
        id: 'grasp-concurrency',
        heading: 'Concurrency through ownership',
        paragraphs: [
          'Coupling and concurrency meet at ownership. The object that owns mutable inventory should serialize access. If five classes hold references to the same mutable seat map, locks become impossible to reason about.',
          'GRASP controller objects are good places to define transaction-like boundaries for a use case, while experts remain mostly lock-free pure logic when given immutable snapshots or value inputs.',
          'Edge case: read-only queries can take snapshots under a brief lock and then compute outside it, reducing contention without scattering synchronization.'
        ],
        callout: {
          tone: 'interview',
          body:
            'State who owns the mutable structure. Ownership clarity is half of a concurrency answer.'
        },
        checkYourself: [
          {
            prompt: 'Why are pure pricing experts easier to concurrency-proof?',
            reveal:
              'They often need no shared mutable state—only inputs—so they can run lock-free while the inventory owner handles synchronization.'
          }
        ]
      },
      {
        id: 'grasp-closing',
        heading: 'Using GRASP language without sounding academic',
        paragraphs: [
          'Prefer plain explanations with optional GRASP labels: "ParkingLot creates tickets because it aggregates them—creator." Labels are seasoning.',
          'When interviewers ask why a method lives somewhere, answer with information expert or cohesion, not taste. That shows transferable judgment.',
          'Balance: not every fabrication is good, not every domain noun deserves a class. Heuristics guide tradeoffs; requirements and time decide.'
        ],
        callout: {
          tone: 'interview',
          body:
            'One well-placed "information expert" beats a laundry list of all nine GRASP names.'
        },
        checkYourself: [
          {
            prompt: 'How do cohesion and SRP relate?',
            reveal:
              'Both push toward focused modules. SRP emphasizes reasons to change; cohesion emphasizes relatedness of responsibilities. They usually agree.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'High cohesion and intentional coupling keep object designs explainable.',
        'GRASP heuristics—especially information expert, creator, controller, pure fabrication, protected variations—guide responsibility assignment.',
        'Watch for feature envy, content coupling, and temporal coupling.',
        'Ownership of mutable state clarifies both design and concurrency.'
      ],
      nextSteps: [
        'Rewrite an anemic total calculation onto Cart/CartLine experts.',
        'List verb-phrase responsibilities for a parking lot and assign them.',
        'Identify one pure fabrication in your last design and justify it.'
      ]
    }
  },

  'lld-solid-principles-lab/dependency-injection-and-testability': {
    title: 'Dependency injection and testability seams',
    readingTime: '55-70 min',
    premise:
      'Dependency injection turns collaboration into an explicit construction choice. In machine-coding interviews it is the fastest path to testable seams: swap clocks, payment gateways, and random sources without rewriting the system under test.',
    parts: [
      {
        id: 'seams-and-injection',
        heading: 'Seams: where behavior can be replaced',
        paragraphs: [
          'A seam is a place you can alter behavior without editing the target code. Constructor injection is the most reliable seam in LLD rounds: pass the collaborator in. Setter injection and service locators hide dependencies and make tests archaeological.',
          'Hard-coding `datetime.now()`, `smtp.send`, or `new StripeClient()` inside domain methods seals the seam shut. Extract a port and inject it. Even a simple callable clock is enough.',
          'Interview narrative: "These are my seams—Clock, Gateway, InventoryStore—wired in main and replaced in tests." That one sentence signals senior habits.'
        ],
        keyTerms: [
          {
            term: 'Seam',
            definition:
              'A boundary where a different implementation can be substituted without changing the caller.'
          },
          {
            term: 'Constructor injection',
            definition:
              'Providing collaborators through the constructor so dependencies are mandatory and visible.'
          },
          {
            term: 'Composition root',
            definition:
              'The entry point that builds the concrete object graph for an application or test.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'If you need monkeypatching to test business logic, you are missing a seam.'
        },
        checkYourself: [
          {
            prompt: 'Why is constructor injection preferred over a service locator in interviews?',
            reveal:
              'Dependencies are explicit in the signature, easier to mock, and fail fast when missing instead of failing deep inside a hidden lookup.'
          }
        ]
      },
      {
        id: 'ports-fakes-and-tests',
        heading: 'Ports, fakes, and the tests that matter',
        paragraphs: [
          'Define ports with the language of the domain: `charge(request)`, not `post_json(url)`. Fakes implement ports in memory. Spies record calls. Stub canned responses. Prefer fakes over mocks when state matters across steps.',
          'Test the use case through the public orchestrator with fakes. Avoid asserting on private methods. Private structure should be free to refactor while behaviors stay locked by tests.',
          'A good suite for machine coding: one happy path, one conflict/rejection path, one expiry/time path using a fake clock, and one idempotency or duplicate request path when relevant.'
        ],
        keyTerms: [
          {
            term: 'Fake',
            definition:
              'A working lightweight implementation of a port, often in-memory, suitable for tests.'
          },
          {
            term: 'Stub',
            definition:
              'A double that returns configured responses without real behavior.'
          },
          {
            term: 'Spy',
            definition:
              'A double that records how it was called so tests can assert interactions.'
          }
        ],
        workedExample: {
          title: 'Injected clock and notifier seams',
          body: 'HoldService depends on ports. Tests inject a controllable clock and a spy notifier.',
          language: 'python',
          code: `from dataclasses import dataclass


@dataclass
class Hold:
    hold_id: str
    expires_at: int
    active: bool = True


class HoldService:
    def __init__(self, clock, notifier) -> None:
        self._clock = clock
        self._notifier = notifier
        self._holds = {}

    def create(self, hold_id: str, ttl: int) -> Hold:
        hold = Hold(hold_id, self._clock() + ttl)
        self._holds[hold_id] = hold
        return hold

    def expire_due(self) -> int:
        now = self._clock()
        expired = 0
        for hold in self._holds.values():
            if hold.active and hold.expires_at <= now:
                hold.active = False
                self._notifier.send(hold.hold_id, "expired")
                expired += 1
        return expired


class SpyNotifier:
    def __init__(self) -> None:
        self.messages = []

    def send(self, hold_id: str, body: str) -> None:
        self.messages.append((hold_id, body))


if __name__ == "__main__":
    now = [100]
    spy = SpyNotifier()
    svc = HoldService(lambda: now[0], spy)
    svc.create("h1", ttl=5)
    now[0] = 106
    print(svc.expire_due(), spy.messages)`
        },
        callout: {
          tone: 'interview',
          body:
            'Show the fake clock advancing in a test. It proves you can reason about time without sleeps.'
        },
        checkYourself: [
          {
            prompt: 'What should a unit test of HoldService not do?',
            reveal:
              'It should not sleep for real TTLs or call real email APIs. Inject clock and notifier seams instead.'
          }
        ]
      },
      {
        id: 'wiring-without-frameworks',
        heading: 'Wiring without DI frameworks',
        paragraphs: [
          'You do not need a DI container in interviews. A `build_app(config)` function that returns the facade is enough. Keep wiring in one place so domain modules never import concrete adapters.',
          'Factories can help create families of adapters from config, but the composition root still owns the final graph. Avoid hidden singletons that tests cannot replace.',
          'For multi-test setups, small builder helpers that produce a service with default fakes and optional overrides keep tests readable.'
        ],
        keyTerms: [
          {
            term: 'Manual DI',
            definition:
              'Constructing and passing dependencies by hand in a composition root without a container framework.'
          },
          {
            term: 'Test builder',
            definition:
              'A helper that creates a system under test with sensible fake defaults and override hooks.'
          },
          {
            term: 'Config-driven wiring',
            definition:
              'Selecting concrete adapters from configuration at the edge while domain code stays unaware.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'A global `get_db()` used inside domain methods is not DI—it is a hidden locator.'
        },
        checkYourself: [
          {
            prompt: 'Where should `if config.provider == "stripe"` live?',
            reveal:
              'In the composition root or an adapter factory at the edge, not inside Checkout business methods.'
          }
        ]
      },
      {
        id: 'partial-fakes-and-contract-tests',
        heading: 'Partial failures, contract tests, and realism',
        paragraphs: [
          'Fakes should be able to simulate failure: payment declines, inventory conflicts, timeouts. A fake that only happy-paths trains false confidence.',
          'Contract tests verify that adapters honor the port: same inputs yield comparable outcomes for fake and real adapters in smoke form. In interviews, mention contract tests even if you only implement fakes.',
          'Do not over-fake pure logic. Pricing policies with no IO can be tested directly. Inject only at true boundaries.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Add a `fail_next_charge` switch on payment fakes. Conflict demos become one-liners.'
        },
        checkYourself: [
          {
            prompt: 'When is a mock assertion on call order useful?',
            reveal:
              'When orchestration order is part of the contract—for example charge only after inventory hold succeeds. Otherwise prefer state assertions on fakes.'
          }
        ]
      },
      {
        id: 'di-concurrency',
        heading: 'Injecting concurrency policies',
        paragraphs: [
          'Locks and executors are dependencies too. Injecting a Lock or a single-thread executor lets tests run deterministically while production uses real concurrency primitives.',
          'Alternatively, keep synchronization inside an adapter that owns shared state so the domain stays single-threaded in its mental model. Both approaches are valid; pick one and explain ownership.',
          'Edge case: injecting a shared mutable fake without clearing state between tests creates order-dependent failures. Reset fakes or build fresh graphs per test.'
        ],
        keyTerms: [
          {
            term: 'Deterministic test graph',
            definition:
              'An object graph wired with fakes and controllable clocks so behavior does not depend on wall time or real threads.'
          },
          {
            term: 'Owned synchronization',
            definition:
              'Keeping locks inside the module that owns the mutable resource rather than spreading them across callers.'
          },
          {
            term: 'Test isolation',
            definition:
              'Ensuring each test gets fresh state so order and leftover data cannot leak.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Offer both stories: domain with injected lock, or single-threaded domain behind a thread-safe adapter.'
        },
        checkYourself: [
          {
            prompt: 'Why build a fresh composition per test by default?',
            reveal:
              'Shared fakes accumulate state and make failures depend on test order, undermining trust in the suite.'
          }
        ]
      },
      {
        id: 'di-closing',
        heading: 'Closing the testability story',
        paragraphs: [
          'Summarize seams, composition root, and the small suite you would keep under time pressure. Mention what you would integration-test against a real adapter later.',
          'If the interviewer asks about frameworks, acknowledge they automate wiring but are unnecessary for the round. Manual DI shows you understand the design.',
          'Connect back to SOLID: DI is how DIP shows up in code and tests.'
        ],
        callout: {
          tone: 'interview',
          body:
            'End with: "Every volatile dependency enters through the constructor; tests prove behavior at those seams."'
        },
        checkYourself: [
          {
            prompt: 'Name three seams almost every LLD lab should have.',
            reveal:
              'Time (clock), persistence or inventory store, and an external side effect such as payment or notification.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Constructor injection creates explicit, testable seams.',
        'Ports plus fakes unlock deterministic tests for time, payment, and inventory.',
        'Manual composition roots are enough for interviews; avoid hidden locators.',
        'Simulate failures and keep tests isolated with fresh graphs.'
      ],
      nextSteps: [
        'Extract a clock and notifier from a service and rewire tests with fakes.',
        'Add a failing payment fake path and assert the domain error.',
        'Write a tiny build_app() composition root that selects adapters from config.'
      ]
    }
  }
};
