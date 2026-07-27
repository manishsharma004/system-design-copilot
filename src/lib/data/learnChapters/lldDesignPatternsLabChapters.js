/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldDesignPatternsLabChapters = {
  'lld-design-patterns-lab/creational-patterns-in-practice': {
    title: 'Creational patterns in practice',
    readingTime: '55-70 min',
    premise:
      'Creational patterns answer one interview question: who is allowed to construct objects, and what invariants must survive that construction. In machine-coding rounds you rarely need every GoF name. You need to keep constructors honest, isolate volatile creation, and make object graphs easy to assemble under changing requirements.',
    parts: [
      {
        id: 'creation-as-design-pressure',
        heading: 'Treat construction as a design pressure, not decoration',
        paragraphs: [
          'Machine-coding interviews reward candidates who notice when `new` has become a lie. A parking spot that can be instantiated without a size, a notification that can be built without a channel, or a payment that can exist without an amount are all construction bugs dressed as domain objects. Creational patterns exist to protect invariants at the moment an object enters the system.',
          'Start every design by listing the objects that must remain valid forever after construction. Those become constructor arguments or factory inputs. Everything else is optional configuration. When an interviewer asks which pattern you would use, translate the answer into: what must be valid, what varies, and who owns the recipe.',
          'A useful interview habit is to sketch a tiny object graph before coding. Name the root service, the collaborators it needs, and which of those collaborators are stable versus replaceable. If construction of a collaborator is complicated or branching, that is your first candidate for a factory or builder. If construction is trivial and stable, a plain constructor is better than a pattern.'
        ],
        keyTerms: [
          {
            term: 'Invariant',
            definition:
              'A condition that must remain true for every valid instance after construction and through later mutations.'
          },
          {
            term: 'Object graph',
            definition:
              'The set of collaborating instances wired together to satisfy a use case.'
          },
          {
            term: 'Creation seam',
            definition:
              'The place in the design where construction decisions are concentrated so callers stay simple.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'If you cannot state the invariant a factory protects, you probably do not need the factory yet.'
        },
        checkYourself: [
          {
            prompt: 'When is a plain constructor better than a creational pattern?',
            reveal:
              'When construction is simple, stable, and does not branch on configuration. Patterns earn their keep when creation is complicated, polymorphic, or must hide volatile details from callers.'
          }
        ]
      },
      {
        id: 'factory-method-and-abstract-factory',
        heading: 'Factory method and abstract factory for families of variants',
        paragraphs: [
          'Factory method is the creational pattern that appears most often in LLD rounds. A parser needs a tokenizer, a notification service needs a channel, a parking lot needs a spot allocator. The caller asks for a capability; the factory decides which concrete class satisfies it. The payoff is that adding a new variant does not force every call site to grow another conditional.',
          'Abstract factory appears when variants come in families. A UI theme that must produce matching buttons and dialogs, or a cloud provider adapter that must produce matching storage and queue clients, is a family. In interviews, say "family of products" only when products must be consistent with each other. Otherwise a single factory method is enough and clearer.',
          'The interview trap is using factories to hide bad domain modeling. If every object needs a factory, the model is probably over-abstracted. Prefer factories at boundaries: strategy selection, adapter selection, or configuration-driven product choice. Keep core domain entities constructible with ordinary constructors once their ingredients are known.'
        ],
        keyTerms: [
          {
            term: 'Factory method',
            definition:
              'A creation operation that returns an abstraction while deferring the concrete type decision to a subclass or selector.'
          },
          {
            term: 'Abstract factory',
            definition:
              'An interface that creates a consistent family of related products without exposing concrete classes.'
          },
          {
            term: 'Product family',
            definition:
              'A set of objects that must be compatible with one another, such as matching theme components or provider adapters.'
          }
        ],
        workedExample: {
          title: 'Notification channel factory',
          body: 'A notification service depends on a channel abstraction. Construction branches on config once, then the rest of the workflow stays free of channel conditionals.',
          language: 'python',
          code: `from abc import ABC, abstractmethod


class Channel(ABC):
    @abstractmethod
    def send(self, address: str, body: str) -> None:
        ...


class EmailChannel(Channel):
    def send(self, address: str, body: str) -> None:
        print(f"email -> {address}: {body}")


class SmsChannel(Channel):
    def send(self, address: str, body: str) -> None:
        print(f"sms -> {address}: {body}")


def channel_for(kind: str) -> Channel:
    factories = {
        "email": EmailChannel,
        "sms": SmsChannel,
    }
    try:
        return factories[kind]()
    except KeyError as exc:
        raise ValueError(f"unknown channel: {kind}") from exc


class Notifier:
    def __init__(self, channel: Channel) -> None:
        self._channel = channel

    def notify(self, address: str, body: str) -> None:
        self._channel.send(address, body)


if __name__ == "__main__":
    notifier = Notifier(channel_for("email"))
    notifier.notify("ava@example.com", "ticket confirmed")`
        },
        callout: {
          tone: 'interview',
          body:
            'Say: "I will create channels through a factory so the notifier never branches on transport." Then show the small interface.'
        },
        checkYourself: [
          {
            prompt: 'Why is a dict of constructors often enough instead of an abstract factory class hierarchy?',
            reveal:
              'Many interview problems have one product type with several variants, not a multi-product family. A selector map keeps creation centralized without inventing unused abstractions.'
          }
        ]
      },
      {
        id: 'builder-for-complex-assembly',
        heading: 'Builder when assembly has many optional pieces',
        paragraphs: [
          'Builder shines when an object has many optional fields, ordered construction steps, or validation that only makes sense after several pieces are present. HTTP requests, query objects, and report configurations are classic examples. In LLD labs, builders help when a domain aggregate would otherwise need a telescoping constructor full of nulls.',
          'A good builder distinguishes required from optional. Required fields belong in the builder constructor or in a final `build()` check that fails loudly. Optional fields get fluent setters. The built object should then be immutable or tightly controlled so callers cannot bypass the validation path.',
          'Avoid builders for every DTO. If an object has three required fields and no optionals, a constructor communicates intent better. Use builder language in interviews only when you can point at combinatorial construction pain or multi-step validation.'
        ],
        keyTerms: [
          {
            term: 'Telescoping constructor',
            definition:
              'A family of overloaded constructors that grows as optional parameters accumulate, usually a smell favoring a builder.'
          },
          {
            term: 'Fluent interface',
            definition:
              'A chaining API where setters return the builder, making assembly read as a sequence of configuration steps.'
          },
          {
            term: 'Build-time validation',
            definition:
              'Checks performed when the final object is produced, ensuring incomplete assemblies cannot escape.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'A builder that returns half-valid objects from intermediate steps is worse than no builder. Validate at `build()`.'
        },
        checkYourself: [
          {
            prompt: 'What should happen if a required field is missing when build() is called?',
            reveal:
              'Fail fast with a clear error. Silent defaults hide incomplete configuration and create later runtime bugs that are harder to diagnose in an interview demo.'
          }
        ]
      },
      {
        id: 'singleton-and-prototype-with-restraint',
        heading: 'Singleton and prototype used with restraint',
        paragraphs: [
          'Singleton is the most overused creational pattern in interviews. A true singleton is a process-wide single instance with controlled access. That can be legitimate for a configuration registry, a metrics sink, or a connection pool facade, but it creates hidden global state. Hidden state makes tests brittle and concurrency harder.',
          'In machine coding, prefer dependency injection of a shared instance over a hard singleton. Pass one cache, one clock, or one repository into the services that need it. You get the shared-behavior benefit without locking the design to a static accessor. If the interviewer asks about singleton, explain the tradeoff instead of reflexively applying it.',
          'Prototype is rarer but useful when cloning a configured template is cheaper or clearer than reconstructing from scratch. Game entity templates, document styles, and preconfigured request skeletons are examples. Clone carefully: decide whether nested objects are shared or deep-copied, and document that choice because aliasing bugs are common.'
        ],
        keyTerms: [
          {
            term: 'Singleton',
            definition:
              'A creation constraint that ensures one shared instance, usually accessed through a controlled entry point.'
          },
          {
            term: 'Prototype',
            definition:
              'A pattern that creates new objects by copying a configured template instance.'
          },
          {
            term: 'Shared instance via injection',
            definition:
              'Passing one collaborator into many services so sharing is explicit without static global access.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'If your design needs a singleton to make tests pass, the design is probably hiding a missing seam.'
        },
        checkYourself: [
          {
            prompt: 'How do you get a single shared cache without a classic singleton?',
            reveal:
              'Construct one cache in the composition root and inject it into every service that needs it. Sharing becomes an assembly decision, not a static global.'
          }
        ]
      },
      {
        id: 'composition-root-and-interview-flow',
        heading: 'Compose at the edge, iterate in the middle',
        paragraphs: [
          'A clean creational story ends at a composition root: the place that wires concrete classes for the current run. In a coding interview that is often `main`, a test harness, or a tiny bootstrap function. Domain classes should ask for dependencies, not construct the whole world.',
          'Iteration strategy matters as much as pattern choice. First implement the happy path with concrete classes and plain constructors. Second, extract interfaces where behavior branches. Third, introduce a factory or builder only when construction itself becomes noisy. This order keeps you shipping working demos while still ending with a design that can extend.',
          'When presenting, narrate construction decisions out loud: "ParkingLot receives an Allocator so tests can swap policies." That sentence shows creational judgment without forcing a pattern taxonomy quiz onto the interviewer.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Walk the interviewer from required invariants to composition root. Patterns are supporting cast, not the plot.'
        },
        checkYourself: [
          {
            prompt: 'What is a safe three-step iteration for introducing creational patterns in a timed round?',
            reveal:
              'Ship a working concrete graph first, extract abstractions where variation appears, then concentrate branching construction into a factory or builder at the edge.'
          }
        ]
      },
      {
        id: 'creational-edge-cases',
        heading: 'Edge cases interviewers probe',
        paragraphs: [
          'Expect follow-ups about invalid configuration, unknown product keys, concurrent first-time initialization, and whether created objects are immutable. Have answers ready: fail on unknown kinds, avoid double-checked locking theater unless asked, prefer immutable products after build, and keep factories pure when possible.',
          'Also expect a question about adding a new variant. Your design should make that a local change: one new class, one registration in the factory map, no edits to business workflows. If adding SMS requires editing Notifier, PricingService, and Persistence, creation was never truly isolated.',
          'Concurrency shows up as "what if two threads ask for the first instance." For interview scope, explain that lazy singletons need synchronization or eager initialization, then prefer injecting a pre-built shared instance to dodge the issue entirely.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Unknown product keys should raise immediately with the offending value. Silent fallbacks hide misconfiguration.'
        },
        checkYourself: [
          {
            prompt: 'What is the strongest signal that a factory is doing its job?',
            reveal:
              'Business workflows no longer branch on concrete types, and adding a new variant touches creation registration rather than every use case.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Creational patterns protect invariants and concentrate volatile construction decisions.',
        'Factory method covers most interview needs; abstract factory is for true product families.',
        'Builders help with optional-heavy assembly; singletons are usually replaced by injected shared instances.',
        'Compose concrete graphs at the edge and introduce patterns only after variation appears.'
      ],
      nextSteps: [
        'Refactor a service that constructs its own email client into constructor injection plus a channel factory.',
        'Write a builder with required-field validation at build time.',
        'Practice explaining why you rejected singleton in favor of a shared injected collaborator.'
      ]
    }
  },

  'lld-design-patterns-lab/structural-patterns-in-practice': {
    title: 'Structural patterns in practice',
    readingTime: '55-70 min',
    premise:
      'Structural patterns shape how objects fit together without forcing every collaborator to know every detail. In LLD interviews they help you wrap volatile APIs, present simplified facades, and compose behavior from small pieces while keeping class diagrams readable under time pressure.',
    parts: [
      {
        id: 'structure-is-about-boundaries',
        heading: 'Structure is about boundaries and translation',
        paragraphs: [
          'Structural patterns are useful when two parts of a system speak different languages or expose awkward surfaces. An adapter translates. A facade simplifies. A decorator adds behavior around an existing contract. A proxy controls access. A composite treats a tree of parts like one part. The common theme is reshaping collaboration without rewriting the core domain every time a dependency changes.',
          'In machine coding, draw the boundary first. Which class is stable? Which dependency is ugly, remote, legacy, or likely to change? Put a structural pattern on that seam. Do not wrap every class in an adapter "for flexibility." Flexibility without a real boundary is noise.',
          'Class-diagram prose for interviews can be short: "TicketService depends on PaymentGateway. StripeSdkAdapter implements PaymentGateway and translates our charge request into Stripe calls." That sentence already communicates adapter, dependency direction, and intent.'
        ],
        keyTerms: [
          {
            term: 'Boundary',
            definition:
              'A deliberate seam between a stable domain and a volatile or awkward collaborator.'
          },
          {
            term: 'Translation layer',
            definition:
              'Code that converts between your model and an external API, format, or protocol.'
          },
          {
            term: 'Stable contract',
            definition:
              'An interface your domain can depend on even when implementations change.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Name the awkward dependency before naming the pattern. The pattern should fall out of the boundary.'
        },
        checkYourself: [
          {
            prompt: 'Why is wrapping every repository in an adapter usually wrong in a timed LLD round?',
            reveal:
              'If the repository already matches your domain language, an adapter adds indirection without protecting a real boundary. Spend the time on volatile external APIs or awkward legacy surfaces.'
          }
        ]
      },
      {
        id: 'adapter-and-facade',
        heading: 'Adapter and facade for external and wide surfaces',
        paragraphs: [
          'Adapter converts one interface into another your code expects. It is the right answer when you must use a third-party SDK, a legacy class, or a differently shaped internal API without leaking that shape upward. Keep adapters thin: map inputs, call the foreign API, map outputs and errors. Business rules should not hide inside adapters.',
          'Facade presents a simple method surface over a cluster of collaborators. A booking facade might reserve inventory, charge payment, and emit a confirmation event through one `book()` call. Facades are excellent interview tools because they give the interviewer a readable entry point while the real work stays in smaller classes.',
          'Do not confuse facade with god class. A facade coordinates; it should not own every rule. If booking policy, tax math, and email templates all live in the facade, you built a service blob with a fashionable name.'
        ],
        keyTerms: [
          {
            term: 'Adapter',
            definition:
              'A wrapper that makes an existing class or API conform to a target interface your domain understands.'
          },
          {
            term: 'Facade',
            definition:
              'A simplified entry point that orchestrates several collaborators for a common use case.'
          },
          {
            term: 'Anti-corruption layer',
            definition:
              'A boundary that prevents external models from leaking into your core domain language.'
          }
        ],
        workedExample: {
          title: 'Payment adapter with a clean domain port',
          body: 'The domain charges through PaymentGateway. The adapter owns Stripe-shaped details and error translation.',
          language: 'python',
          code: `from dataclasses import dataclass


@dataclass(frozen=True)
class ChargeRequest:
    customer_id: str
    amount_cents: int
    currency: str = "USD"


@dataclass(frozen=True)
class ChargeResult:
    ok: bool
    reference: str
    message: str


class PaymentGateway:
    def charge(self, request: ChargeRequest) -> ChargeResult:
        raise NotImplementedError


class StripeSdk:
    def create_payment(self, customer, cents, currency):
        if cents <= 0:
            return {"status": "failed", "id": "", "error": "non-positive amount"}
        return {"status": "ok", "id": f"ch_{customer}_{cents}", "error": None}


class StripePaymentAdapter(PaymentGateway):
    def __init__(self, sdk: StripeSdk) -> None:
        self._sdk = sdk

    def charge(self, request: ChargeRequest) -> ChargeResult:
        raw = self._sdk.create_payment(
            request.customer_id, request.amount_cents, request.currency
        )
        if raw["status"] != "ok":
            return ChargeResult(False, "", raw["error"] or "charge failed")
        return ChargeResult(True, raw["id"], "approved")


class CheckoutFacade:
    def __init__(self, payments: PaymentGateway) -> None:
        self._payments = payments

    def checkout(self, customer_id: str, amount_cents: int) -> str:
        result = self._payments.charge(ChargeRequest(customer_id, amount_cents))
        if not result.ok:
            raise RuntimeError(result.message)
        return result.reference


if __name__ == "__main__":
    facade = CheckoutFacade(StripePaymentAdapter(StripeSdk()))
    print(facade.checkout("c1", 2500))`
        },
        callout: {
          tone: 'interview',
          body:
            'Draw PaymentGateway as the port and StripePaymentAdapter as the adapter box outside the domain hexagon.'
        },
        checkYourself: [
          {
            prompt: 'Where should Stripe error codes be translated into domain failures?',
            reveal:
              'Inside the adapter. Domain services should see ChargeResult or domain exceptions, not vendor enums and payload shapes.'
          }
        ]
      },
      {
        id: 'decorator-and-proxy',
        heading: 'Decorator and proxy for cross-cutting behavior',
        paragraphs: [
          'Decorator adds behavior around an object that already implements the needed interface. Logging, metrics, retries, and caching are frequent decorator jobs. The decorated object remains usable alone; the decorator preserves the contract and forwards calls after or before extra work.',
          'Proxy also stands in for another object, but the motivation is access control, lazy loading, or remote representation rather than open-ended stacking of behaviors. In interviews the distinction is less important than the shared idea: a stand-in with the same interface can mediate calls.',
          'A practical machine-coding move is to decorate repositories or gateways in tests and demos. A CountingGateway decorator can assert how many times charge was called without changing CheckoutFacade. That is structural design paying off as testability.'
        ],
        keyTerms: [
          {
            term: 'Decorator',
            definition:
              'A wrapper that implements the same interface as its delegate and adds behavior around each call.'
          },
          {
            term: 'Proxy',
            definition:
              'A surrogate that controls access to a real subject, often for laziness, auth, or remoting.'
          },
          {
            term: 'Cross-cutting concern',
            definition:
              'Behavior such as logging or retries that applies across many use cases rather than one domain rule.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Prefer decorating interfaces you own. Decorating concrete third-party classes often fights the SDK instead of clarifying your design.'
        },
        checkYourself: [
          {
            prompt: 'How can a decorator help in a concurrency follow-up?',
            reveal:
              'You can wrap a gateway with a locking or rate-limiting decorator without rewriting callers, keeping the concurrency policy localized.'
          }
        ]
      },
      {
        id: 'composite-and-bridge',
        heading: 'Composite and bridge for hierarchies and independent axes',
        paragraphs: [
          'Composite lets clients treat individual objects and groups uniformly. File trees, menu trees, and organization charts are textbook cases. In booking or rules engines, a composite rule can AND/OR child rules behind one `evaluate()` method. The interviewer wants to see that leaf and composite share a contract.',
          'Bridge separates an abstraction from its implementation so both can vary. A Notification abstraction with Email and Push implementations that each can target Mobile or Desktop channels is a bridge-shaped idea. In timed rounds, only reach for bridge when you truly have two independent axes of change; otherwise a single strategy hierarchy is simpler.',
          'Edge cases for composites include empty groups, cyclic references, and operations that only make sense on leaves. Decide early whether `delete()` on a folder deletes children, and whether a cycle in the tree is prevented by construction.'
        ],
        keyTerms: [
          {
            term: 'Composite',
            definition:
              'A tree structure where leaf and container nodes share an interface so clients can treat them uniformly.'
          },
          {
            term: 'Bridge',
            definition:
              'A structural split that lets an abstraction and its implementation evolve on independent axes.'
          },
          {
            term: 'Uniform interface',
            definition:
              'A shared method surface that hides whether the receiver is a single object or a group.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Composites need an explicit policy for empty collections and cycles. Silent no-ops surprise interviewers.'
        },
        checkYourself: [
          {
            prompt: 'When should you avoid bridge in a 45-minute round?',
            reveal:
              'When only one axis of variation is real. Two hierarchies look impressive but slow you down if implementations do not actually vary independently.'
          }
        ]
      },
      {
        id: 'structural-iteration-strategy',
        heading: 'Iteration strategy for structural clarity',
        paragraphs: [
          'Begin with the use-case facade and the minimum domain types. Introduce adapters the moment an external shape appears. Add decorators when cross-cutting needs show up in tests or follow-ups. Delay composites until a true hierarchy appears in requirements.',
          'Concurrency often arrives as a follow-up on structural designs: "make payment retries safe" or "cache catalog reads." Decorators and proxies are natural homes for those policies because they preserve caller code. Mention thread-safety of the decorator itself: a caching decorator needs a concurrent map or explicit locking.',
          'Keep the class diagram sparse. Boxes for facade, domain service, port interface, and one adapter beat a wallpaper of every DTO. Interviewers grade whether structure communicates boundaries, not whether every GoF box is present.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Narrate boundaries: "Facade coordinates, adapter translates, decorator observes." Three roles, three sentences.'
        },
        checkYourself: [
          {
            prompt: 'Where should retry logic live if CheckoutFacade must stay readable?',
            reveal:
              'In a RetryingPaymentGateway decorator around the real gateway, so checkout orchestration remains a straight-line story.'
          }
        ]
      },
      {
        id: 'structural-failure-modes',
        heading: 'Failure modes and edge cases',
        paragraphs: [
          'Adapters that leak vendor types upward defeat the pattern. Facades that absorb all rules become blobs. Decorators that change interface semantics break substitutability. Proxies that hide network failures as empty results create impossible debugging sessions.',
          'Test the seams. An adapter test should use a fake SDK and assert translation. A facade test should use a fake gateway and assert orchestration order. A decorator test should assert extra behavior while confirming the delegate still receives the call.',
          'When requirements add a second payment provider, your adapter boundary should absorb it. If CheckoutFacade gains `if provider == ...`, the structural design has regressed and needs a factory in front of the PaymentGateway port.'
        ],
        callout: {
          tone: 'warning',
          body:
            'If vendor DTOs appear in domain method signatures, the adapter boundary has already failed.'
        },
        checkYourself: [
          {
            prompt: 'What is a quick test that an adapter is thin enough?',
            reveal:
              'The adapter file mostly maps fields and errors; business decisions like discounts or eligibility live elsewhere.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Structural patterns reshape collaboration at real boundaries.',
        'Adapters protect the domain from foreign shapes; facades provide readable entry points.',
        'Decorators and proxies localize cross-cutting and access policies.',
        'Composites and bridges are powerful but only when hierarchy or dual axes are genuine.'
      ],
      nextSteps: [
        'Wrap a fake third-party SDK behind a domain port and facade.',
        'Add a logging decorator around a repository without changing callers.',
        'Sketch a class diagram with only facade, port, adapter, and one domain service.'
      ]
    }
  },

  'lld-design-patterns-lab/behavioral-patterns-in-practice': {
    title: 'Behavioral patterns in practice',
    readingTime: '60-75 min',
    premise:
      'Behavioral patterns organize how objects share responsibility at runtime: who decides, who reacts, who advances state, and who owns an algorithm skeleton. In machine-coding interviews they turn sprawling conditionals into replaceable policies and explicit workflows.',
    parts: [
      {
        id: 'behavior-is-runtime-collaboration',
        heading: 'Behavior is runtime collaboration, not class count',
        paragraphs: [
          'Behavioral patterns earn their place when control flow is the hard part. Strategy replaces branching policies. State replaces mode flags. Observer fans events to listeners. Command packages an action as an object. Template method fixes a workflow skeleton while letting steps vary. Chain of responsibility passes a request along handlers until one accepts it.',
          'Interview signal is not naming the catalog. It is noticing a conditional that will grow with every new business rule and extracting a behavioral seam before the demo collapses under `if/elif`. Start from the change axis: "pricing varies," "elevator motion has modes," "notifications have many listeners."',
          'Keep the first implementation concrete. Extract the pattern when the second variant appears or when a follow-up clearly demands it. Premature strategy hierarchies for a single policy waste time.'
        ],
        keyTerms: [
          {
            term: 'Policy object',
            definition:
              'A replaceable collaborator that encapsulates a decision rule behind a small interface.'
          },
          {
            term: 'Mode flag',
            definition:
              'A field such as status or phase that drives large conditionals and often wants a state object instead.'
          },
          {
            term: 'Workflow skeleton',
            definition:
              'A fixed sequence of steps where some steps are stable and others are meant to vary.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Ask: what decision changes most often? That decision is usually a strategy, state, or chain handler.'
        },
        checkYourself: [
          {
            prompt: 'Why extract a strategy only after a second variant appears?',
            reveal:
              'One concrete policy keeps the demo moving. The second variant proves the axis of change is real and justifies the interface.'
          }
        ]
      },
      {
        id: 'strategy-and-state',
        heading: 'Strategy and state for decisions and modes',
        paragraphs: [
          'Strategy is the workhorse of LLD labs. Pricing, allocation, sorting, eviction, and authentication methods are strategies. The context holds a strategy reference and delegates. Switching strategy should not require editing the context\'s core workflow.',
          'State looks similar but models an object whose legal operations depend on its current mode. An elevator that can only open doors when idle, or a ticket that can only be cancelled before payment capture, is state-shaped. Each state object implements transitions and rejects illegal operations explicitly.',
          'A crisp interview distinction: strategy chooses among algorithms that are valid in the same mode; state changes which operations are valid. You can combine them—an elevator in Moving state may use a DispatchStrategy—but do not merge the vocabulary.'
        ],
        keyTerms: [
          {
            term: 'Strategy',
            definition:
              'A family of interchangeable algorithms behind one interface, selected by the context.'
          },
          {
            term: 'State pattern',
            definition:
              'A design where behavior and allowed transitions depend on an explicit current-state object.'
          },
          {
            term: 'Illegal transition',
            definition:
              'An operation rejected because it is not valid from the current mode.'
          }
        ],
        workedExample: {
          title: 'Fare strategy with a small context',
          body: 'Ride pricing varies by rider tier. The ride context stays stable while policies remain replaceable and testable.',
          language: 'python',
          code: `from abc import ABC, abstractmethod
from dataclasses import dataclass


class FareStrategy(ABC):
    @abstractmethod
    def quote(self, distance_km: float) -> int:
        """Return fare in cents."""


class StandardFare(FareStrategy):
    def quote(self, distance_km: float) -> int:
        return int(250 + distance_km * 100)


class MemberFare(FareStrategy):
    def quote(self, distance_km: float) -> int:
        return int(150 + distance_km * 80)


@dataclass
class Ride:
    distance_km: float
    fare_strategy: FareStrategy

    def total_cents(self) -> int:
        return self.fare_strategy.quote(self.distance_km)


if __name__ == "__main__":
    print(Ride(10, StandardFare()).total_cents())
    print(Ride(10, MemberFare()).total_cents())`
        },
        callout: {
          tone: 'interview',
          body:
            'Say: "Fare rules change more often than ride lifecycle, so pricing is a strategy injected into Ride."'
        },
        checkYourself: [
          {
            prompt: 'Is order status best modeled as strategy or state?',
            reveal:
              'Usually state, because allowed operations depend on the current status. Pricing inside an order is more often a strategy.'
          }
        ]
      },
      {
        id: 'observer-command-template',
        heading: 'Observer, command, and template method',
        paragraphs: [
          'Observer helps when many modules must react to one event without the producer knowing all consumers. After a booking succeeds, inventory, email, and analytics may listen. Keep notifications synchronous and simple in interviews unless async is requested. Document whether listeners see events before or after persistence commits.',
          'Command turns a request into an object with `execute()`, optional `undo()`, and metadata. It helps with queues, macros, and audit logs. In ATM or remote-control style problems, commands keep the invoker ignorant of concrete actions.',
          'Template method fixes the order of steps in a base workflow while subclasses override hooks. It is ideal when the skeleton is stable—validate, reserve, pay, confirm—but one step differs by product line. Prefer composition with strategy if subclasses multiply too quickly.'
        ],
        keyTerms: [
          {
            term: 'Observer',
            definition:
              'A publish/subscribe collaboration where listeners register for events emitted by a subject.'
          },
          {
            term: 'Command',
            definition:
              'An object that encapsulates an action and its parameters, enabling queueing, logging, or undo.'
          },
          {
            term: 'Template method',
            definition:
              'A base-class algorithm that calls overridable steps while preserving overall order.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Observer listeners that mutate shared state without ordering rules create race-shaped bugs even in single-threaded demos.'
        },
        checkYourself: [
          {
            prompt: 'When is template method a poorer fit than strategy?',
            reveal:
              'When many steps vary independently. A deep inheritance tree of workflows becomes brittle; composed strategies stay flatter.'
          }
        ]
      },
      {
        id: 'chain-and-mediator',
        heading: 'Chain of responsibility and mediator',
        paragraphs: [
          'Chain of responsibility passes a request along handlers until one handles it. Auth filters, support ticket routing, and logging level filters fit. Each handler should either handle, forward, or reject with a clear rule. Infinite chains and unordered critical handlers are common failure modes.',
          'Mediator centralizes complicated many-to-many interactions. Instead of every UI widget knowing every other widget, they talk through a mediator. In backend LLD, a workflow coordinator can play a mild mediator role, but beware recreating a god class. Mediator is justified when peer-to-peer wiring becomes a hairball.',
          'For interviews, chain is more common than mediator. Implement a short list of handlers with an explicit order and a terminal failure handler that rejects unhandled requests.'
        ],
        keyTerms: [
          {
            term: 'Handler chain',
            definition:
              'An ordered sequence of processors where each may handle a request or pass it along.'
          },
          {
            term: 'Mediator',
            definition:
              'A coordinator that reduces direct coupling among a set of peer objects.'
          },
          {
            term: 'Terminal handler',
            definition:
              'The last link in a chain that defines behavior when no earlier handler accepts the request.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Make chain order visible in code or configuration. Hidden order is a frequent production incident cause.'
        },
        checkYourself: [
          {
            prompt: 'What should a chain do if no handler accepts a request?',
            reveal:
              'Fail explicitly via a terminal handler or exception. Swallowing the request makes systems look successful while dropping work.'
          }
        ]
      },
      {
        id: 'behavioral-concurrency-and-edges',
        heading: 'Concurrency, edge cases, and iteration',
        paragraphs: [
          'Behavioral patterns interact with concurrency at the points where state changes and events fan out. A state transition may need a lock. An observer list may need copy-on-write or a mutex if listeners register dynamically. A command queue may need thread-safe enqueue/dequeue.',
          'Edge cases to rehearse: null strategies, illegal state transitions, duplicate observer registration, commands executed twice, and chains with no terminal handler. Write one test for each before the interviewer asks.',
          'Iteration strategy: implement one concrete path, extract interfaces for the hottest decision, add a second implementation, then wire selection through config or a simple factory. End by narrating how a third variant would plug in without editing the workflow.'
        ],
        callout: {
          tone: 'interview',
          body:
            'For follow-ups, move concurrency into the smallest object that owns the mutable state—often the context or the event bus, not every strategy.'
        },
        checkYourself: [
          {
            prompt: 'Where do you put a lock for elevator state transitions?',
            reveal:
              'On the elevator context that owns current state, so strategies and state objects are not each inventing incompatible synchronization.'
          }
        ]
      },
      {
        id: 'choosing-among-behavioral-tools',
        heading: 'Choosing among behavioral tools under time pressure',
        paragraphs: [
          'Use a quick rubric. Varying algorithm, same lifecycle: strategy. Varying legal operations by mode: state. Many reactions to one fact: observer. Work packaged for queue or undo: command. Fixed skeleton with hooks: template method. Ordered processors: chain.',
          'If two patterns seem to fit, pick the one that shrinks the largest conditional and keeps the class diagram explainable in thirty seconds. Interviewers prefer a clear strategy plus honest constructors over a museum of patterns.',
          'Finally, connect patterns back to requirements language. "Members get different fares" is strategy. "Cannot cancel after capture" is state. "Email and analytics on booking" is observer. Mapping requirements to collaboration style is the actual skill being tested.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Close with: "These are the seams where requirements change, so I isolated them as behavioral collaborators."'
        },
        checkYourself: [
          {
            prompt: 'How do you justify skipping a pattern the interviewer named?',
            reveal:
              'Map the requirement to the collaboration need. If the named pattern does not address that need, propose the smaller fit and explain the change axis you optimized for.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Behavioral patterns tame runtime decisions, modes, reactions, and workflows.',
        'Strategy and state cover most machine-coding decision problems; know how they differ.',
        'Observer, command, template method, and chain solve specific collaboration shapes.',
        'Extract behavioral seams iteratively and keep concurrency next to owned mutable state.'
      ],
      nextSteps: [
        'Replace a pricing if/else ladder with two FareStrategy classes.',
        'Model a ticket lifecycle with explicit state objects and illegal-transition errors.',
        'Add an observer list to a booking service and test notification order.'
      ]
    }
  }
};
