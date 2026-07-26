const paragraphs = (...items) => items.join('\n\n');

const codeExample = (title, code) => ({ title, code: code.trim() });

const codingExercise = (id, title, description, starterCode, solution, hints, expectedOutput, difficulty = 'intermediate') => ({
  id,
  title,
  difficulty,
  type: 'coding',
  description,
  starterCode: starterCode.trim(),
  solution: solution.trim(),
  hints,
  expectedOutput
});

const designExercise = (id, title, description, promptQuestions, difficulty = 'intermediate') => ({
  id,
  title,
  difficulty,
  type: 'design',
  description,
  promptQuestions
});

const section = (heading, firstParagraph, secondParagraph, bullets, title, code) => ({
  heading,
  body: paragraphs(firstParagraph, secondParagraph),
  bullets,
  codeExample: codeExample(title, code)
});

const lesson = ({
  slug,
  title,
  summary,
  duration,
  whyItMatters,
  sections,
  exercises,
  checklist,
  pitfalls,
  interviewPrompts,
  related
}) => ({
  slug,
  title,
  summary,
  duration,
  whyItMatters,
  sections,
  exercises,
  checklist,
  pitfalls,
  interviewPrompts,
  diagram: null,
  related
});

const promptFramingLesson = lesson({
  slug: 'lld-problem-framing',
  title: 'LLD prompt framing and scope control',
  summary:
    'Turn a vague object-design prompt into a bounded first version by spending the first 5-10 minutes on requirements, invariants, non-goals, and the first runnable happy path before you sketch classes.',
  duration: '50-70 min',
  whyItMatters:
    'Most weak LLD answers become messy because the candidate starts naming classes before deciding what the first version must actually do. Strong framing lets you spend 5-10 minutes clarifying the functional slice, separate LLD-relevant non-functional concerns from later scale talk, defend explicit non-goals, and avoid wandering into load balancers or deployment diagrams before the object model even exists.',
  sections: [
    section(
      'Frame the first version before naming classes',
      'In low-level interviews, the first mistake is treating the prompt like a hidden UML exam. Spend the first 5-10 minutes fixing the first shippable slice: who initiates the flow, which one happy path must complete, which failure path matters immediately, and which rule can never be broken. That framing tells you whether you even need separate entities, services, repositories, or strategy objects in the first place.',
      'Scope control is not stalling. It is how you keep the answer teachable. When you say that version one of a booking system supports creating, confirming, and cancelling a single reservation but not waitlists yet, every later class inherits a stable job. Interviewers usually reward that discipline because it prevents speculative abstractions, keeps you out of HLD digressions such as load balancers, and makes trade-offs visible early.',
      [
        'Time-box clarification to roughly 5-10 minutes before coding or class sketching.',
        'Name the actor, the main command, and the success condition first.',
        'State one or two explicit non-goals so the model stays narrow.',
        'Anchor the design in a single end-to-end flow before optional features.'
      ],
      'A tiny prompt frame object',
      `
from dataclasses import dataclass


@dataclass
class PromptFrame:
    actor: str
    core_flow: str
    invariant: str

    def describe(self):
        return f"{self.actor} -> {self.core_flow} [{self.invariant}]"


if __name__ == "__main__":
    frame = PromptFrame(
        actor="driver",
        core_flow="enter lot, get ticket, pay before exit",
        invariant="one active ticket per occupied spot",
    )
    print(frame.describe())
`
    ),
    section(
      'Turn nouns into responsibilities instead of class explosions',
      'Prompts contain many nouns, but not every noun deserves to become a top-level class. A ride request, a parking ticket, and a payment are often real domain objects because they have identity, state, or lifecycle. A discount percentage or delivery window may be better as a value object or validated field. The question is not whether the noun sounds important; it is whether it owns behavior or protects a rule.',
      'A good framing pass therefore translates features into responsibilities. Instead of listing Car, Gate, Spot, Ticket, Cashier, Receipt, and Sensor as peers, say which object owns allocation, which one records lifecycle state, and which one coordinates the workflow. That quickly reveals whether a design is too anemic, too procedural, or too fragmented for interview time.',
      [
        'Promote a concept to a class only when it owns state or behavior.',
        'Keep orchestration separate from descriptive data.',
        'Bundle closely related fields into value objects when they travel together.',
        'Challenge each proposed class by asking what rule would break without it.'
      ],
      'Mapping prompt nouns to owned behavior',
      `
class ResponsibilityMap:
    def __init__(self):
        self.roles = {}

    def add(self, name, responsibility):
        self.roles[name] = responsibility

    def explain(self):
        return ", ".join(f"{name}: {responsibility}" for name, responsibility in self.roles.items())


if __name__ == "__main__":
    mapping = ResponsibilityMap()
    mapping.add("ParkingTicket", "tracks issue, payment, and closure state")
    mapping.add("SpotAllocator", "chooses the next compatible spot")
    mapping.add("ParkingLotService", "orchestrates enter, pay, and exit")
    print(mapping.explain())
`
    ),
    section(
      'Name invariants and rejection paths early',
      'Prompt framing gets practical when you turn interview language into invariants. "Users cannot overbook inventory" becomes one active hold per unit. "A ticket must be paid before exit" becomes an illegal transition rule. "Rate limiting should be per customer and per minute" becomes a keying and time-window decision. Those statements do more design work than any pattern name because they determine which methods need guardrails.',
      'Rejection paths matter just as much as success paths. If the system cannot assign a spot, confirm a booking, or reserve capacity, the model needs a deliberate failure result instead of a silent partial update. Interviewers often ask follow-up questions about invalid input or exhausted capacity precisely to see whether the candidate designed the negative path as carefully as the happy path.',
      [
        'Translate vague requirements into enforceable invariants.',
        'Treat rejection as part of the API, not an afterthought.',
        'Identify the method that must reject each invalid action.',
        'Keep invariants close to the object whose state would become invalid.'
      ],
      'Guarding an invariant with one method',
      `
class Reservation:
    def __init__(self, unit_id):
        self.unit_id = unit_id
        self.active = False

    def confirm(self):
        if self.active:
            raise ValueError("reservation already active")
        self.active = True
        return f"confirmed {self.unit_id}"


if __name__ == "__main__":
    reservation = Reservation("room-101")
    print(reservation.confirm())
`
    ),
    section(
      'Use follow-up questions to reveal extension seams',
      'A strong prompt frame does not pretend to answer every future question, but it should leave obvious places for growth. If the interviewer later adds premium pricing, you want a rate policy seam. If they add email notifications, you want a notifier seam. If they add concurrency, you want to know which repository or aggregate owns the contested state. These are not fully built on minute one, but the design should hint where they would land.',
      'That is why good candidates call out likely follow-ups while keeping the first slice small. They do not build a plugin system for imaginary partners, yet they mention that pricing is likely to vary, or that persistence belongs behind an interface, or that the active ticket lookup may need locking. The answer sounds prepared for change without collapsing into pattern cargo culting.',
      [
        'Mention the next likely axis of change out loud.',
        'Reserve seams for variation, side effects, and persistence.',
        'Keep the baseline flow working before adding extension mechanics.',
        'Explain what you would abstract later and why.'
      ],
      'Recording likely follow-up seams',
      `
class FollowUpPlanner:
    def __init__(self):
        self.seams = []

    def add_seam(self, change, boundary):
        self.seams.append((change, boundary))

    def summary(self):
        return "; ".join(f"{change} -> {boundary}" for change, boundary in self.seams)


if __name__ == "__main__":
    planner = FollowUpPlanner()
    planner.add_seam("premium pricing", "PricingPolicy")
    planner.add_seam("email receipt", "ReceiptNotifier")
    planner.add_seam("concurrent entry", "SpotRepository lock")
    print(planner.summary())
`
    ),
    section(
      'Present the frame as a design contract with the interviewer',
      'The opening minute of an LLD interview is really a contract negotiation. You want the interviewer to agree on the first version, the critical invariants, the explicitly deferred follow-ups, and the few non-functional concerns that actually affect local object design before code appears. That gives your later class choices legitimacy. Without that contract, the interviewer can reinterpret the problem halfway through and every design decision starts looking arbitrary.',
      'A crisp framing summary often sounds like this: "I will model a single-user happy path first, enforce one active booking per resource, inject a clock because hold expiry matters, and defer multi-region scale or load balancers unless we later bridge into HLD." That is short, opinionated, and testable. It tells the interviewer what you are optimizing for while inviting follow-up discussion from a stable baseline instead of from chaos.',
      [
        'End framing with a short baseline design statement.',
        'Separate LLD-relevant concerns such as state, concurrency, and clocks from deferred scale topics.',
        'Make the first version concrete enough to code immediately.',
        'Invite follow-ups from a stable baseline instead of guessing ahead.'
      ],
      'A concise interview-ready design brief',
      `
class DesignBrief:
    def __init__(self, version_one, invariant, deferred):
        self.version_one = version_one
        self.invariant = invariant
        self.deferred = deferred

    def speak(self):
        return f"v1={self.version_one}; invariant={self.invariant}; defer={self.deferred}"


if __name__ == "__main__":
    brief = DesignBrief(
        "reserve, pay, and release one parking spot",
        "one active ticket per spot",
        "subscriptions and reservations",
    )
    print(brief.speak())
`
    )
  ],
  exercises: [
    codingExercise(
      'scope-brief-builder',
      'Build a prompt framing brief',
      'Implement a small DesignBrief class that captures version-one scope, invariants, and deferred follow-ups, then prints a one-line interview summary.',
      `
class DesignBrief:
    def __init__(self, version_one, invariants, deferred):
        self.version_one = version_one
        self.invariants = invariants
        self.deferred = deferred

    def summary(self):
        # TODO: return a string like
        # "v1=... | invariants=... | defer=..."
        raise NotImplementedError


brief = DesignBrief(
    "book one room and cancel it",
    ["one active booking per room", "cancel only active bookings"],
    ["waitlist"],
)
print(brief.summary())
`,
      `
class DesignBrief:
    def __init__(self, version_one, invariants, deferred):
        self.version_one = version_one
        self.invariants = invariants
        self.deferred = deferred

    def summary(self):
        invariant_text = ", ".join(self.invariants)
        deferred_text = ", ".join(self.deferred)
        return f"v1={self.version_one} | invariants={invariant_text} | defer={deferred_text}"


brief = DesignBrief(
    "book one room and cancel it",
    ["one active booking per room", "cancel only active bookings"],
    ["waitlist"],
)
print(brief.summary())
`,
      [
        'Join the invariant list into readable interview language.',
        'Keep the output on one line so it feels like a spoken summary.',
        'Treat deferred items as explicit non-goals, not missing features.'
      ],
      'v1=book one room and cancel it | invariants=one active booking per room, cancel only active bookings | defer=waitlist',
      'beginner'
    ),
    designExercise(
      'meeting-scheduler-framing',
      'Frame a meeting scheduler prompt',
      'Sketch the first two minutes of an interview answer for a meeting scheduler or calendar booking problem.',
      [
        'Which user action defines version one of the product?',
        'What invariant would break trust fastest if your design got it wrong?',
        'Which nouns deserve identity-bearing classes and which can stay as values?',
        'What follow-up feature would you defer but leave a seam for?'
      ]
    )
  ],
  checklist: [
    'Can spend 5-10 minutes clarifying version-one scope before listing classes.',
    'Can separate functional requirements from deferred scale or infrastructure follow-ups.',
    'Can translate requirements into a small set of invariants and explicit non-goals.',
    'Can name one likely follow-up seam without overbuilding it.'
  ],
  pitfalls: [
    'Turning every noun in the prompt into a top-level class before understanding the workflow.',
    'Starting with load balancers, deployment topology, or generic HLD talk before the local object model is clear.',
    'Skipping rejection paths and designing only the happy path.',
    'Over-abstracting for imagined future requirements instead of bounding version one.'
  ],
  interviewPrompts: [
    'How would you spend the first 5-10 minutes framing a parking lot prompt differently from a rate limiter prompt?',
    'Which functional requirements and invariants would you say out loud before drawing classes for a booking system?',
    'How do you defer scale topics or non-goals without sounding like you are ignoring them?'
  ],
  related: ['problem-framing', 'responsibilities-and-interfaces', 'machine-coding-skeleton-and-iteration']
});

const responsibilitiesLesson = lesson({
  slug: 'responsibilities-and-interfaces',
  title: 'Responsibilities, interfaces, and seams',
  summary:
    'Assign behavior to the right object, isolate volatile collaborators behind thin ports with concrete adapters, and keep the core workflow testable.',
  duration: '45-60 min',
  whyItMatters:
    'Interviewers trust a design more when every class has a sharp reason to exist and external dependencies are easy to replace. Responsibility and seam choices determine whether the solution stays clean under follow-up changes or collapses into one broad service, and modern codebases usually describe those seams as thin ports with concrete adapters rather than as interfaces for every class.',
  sections: [
    section(
      'Start by giving each class one reason to change',
      'Responsibility assignment is mostly about resisting the temptation to create a giant coordinator that knows everything. When a service validates requests, mutates entity state, chooses policies, persists data, and sends notifications in one method, every new requirement adds another branch. Good LLD answers instead split ownership so each object changes for one coherent business reason.',
      'That does not mean every method deserves a class. The goal is fewer, clearer boundaries, not more ceremony. Entities own lifecycle rules, services own orchestration, policies own variable decisions, and repositories own persistence-facing operations. If you can explain those sentences cleanly, the interviewer usually understands why your class diagram is shaped the way it is.',
      [
        'Assign invariants to entities or aggregate roots.',
        'Keep orchestration in application-level services.',
        'Move variable business rules into policy-like collaborators.',
        'Let repositories speak in use-case language instead of generic CRUD.'
      ],
      'A focused service collaborating with a focused entity',
      `
class Order:
    def __init__(self, order_id):
        self.order_id = order_id
        self.status = "draft"

    def mark_paid(self):
        if self.status != "draft":
            raise ValueError("order cannot be paid twice")
        self.status = "paid"


class CheckoutService:
    def checkout(self, order):
        order.mark_paid()
        return f"checked out {order.order_id}"


if __name__ == "__main__":
    print(CheckoutService().checkout(Order("ord-1")))
`
    ),
    section(
      'Introduce interfaces only where volatility or side effects justify them',
      'Interfaces earn their place when the caller depends on a capability but should not know the concrete implementation. In current production vocabulary, that usually means the core workflow owns a port such as Clock, PaymentGateway, Notifier, or ReservationRepository, while infrastructure code supplies an adapter behind it. The port stays thin because it is shaped from the caller perspective, not from the vendor SDK or database driver.',
      'Weak interface design happens when teams add abstractions everywhere out of habit. If a class has one implementation, no side effects, and no realistic variability, a direct collaborator is usually simpler. In interviews, the best explanation is specific: "I want a NotificationPort because delivery changes independently from order completion, and the adapter can hide email versus SMS details." That sounds like judgment, not memorization.',
      [
        'Abstract over capabilities, not over every concrete class.',
        'Define ports from the caller point of view and keep adapters on the outside.',
        'Keep contracts thin enough that a fake is trivial to write.',
        'Use seams around external effects and volatile policies.',
        'Prefer direct collaboration when no true variation exists.'
      ],
      'A narrow notification port',
      `
class NotificationPort:
    def send(self, message):
        raise NotImplementedError


class ConsoleNotifier(NotificationPort):
    def send(self, message):
        print(f"notify: {message}")


class OrderService:
    def __init__(self, notifier):
        self.notifier = notifier

    def complete(self, order_id):
        self.notifier.send(f"order {order_id} completed")


if __name__ == "__main__":
    OrderService(ConsoleNotifier()).complete("ord-7")
`
    ),
    section(
      'Design methods and parameter shapes to reveal legal usage',
      'The public API of an object is part of the design, not just a coding detail. Method names should match domain actions, parameter groups should travel together when they represent one concept, and return values should make success or failure unambiguous. A caller should not need hidden tribal knowledge to know which method to invoke or in what order.',
      'This becomes especially important in interviews because the interviewer reads your method names as a summary of your model. Methods like process() or handle() hide intent, whereas reserve(), confirm(), expire(), and refund() reveal a lifecycle immediately. Small value objects can also help by bundling fields that must stay consistent, such as money, date ranges, or booking requests.',
      [
        'Prefer domain verbs over framework-flavored generic names.',
        'Bundle related parameters into request or value objects when clarity improves.',
        'Return explicit results when rejection is part of normal flow.',
        'Make invalid method orderings hard to express.'
      ],
      'A tiny request object keeps the call readable',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class BookingRequest:
    customer_id: str
    room_id: str
    nights: int


class BookingService:
    def reserve(self, request):
        return f"{request.customer_id} reserved {request.room_id} for {request.nights} nights"


if __name__ == "__main__":
    print(BookingService().reserve(BookingRequest("c-1", "room-9", 2)))
`
    ),
    section(
      'Keep seams test-oriented without turning the model inside out',
      'A seam is valuable when it shortens the path to feedback. If the business rule depends on time, wrap a clock. If it sends email, wrap a notifier. If it saves data, wrap a repository. These seams should make the core rule easy to test with plain objects, but they should not force the design to orbit test machinery instead of the domain.',
      'Interview-safe seams are usually tiny. A fake repository might only need save() and get(). A fake clock might only need now(). That smallness matters because it shows you are isolating uncertainty, not scattering interfaces around the model. The resulting code stays readable while still proving that the main rules can be exercised without real infrastructure.',
      [
        'Wrap only the moving parts that block deterministic tests.',
        'Keep fake implementations extremely small.',
        'Do not leak test concerns into domain names.',
        'Use seams to verify business rules, not boilerplate getters.'
      ],
      'Testing a service with a fake repository',
      `
class FakeReservationRepository:
    def __init__(self):
        self.saved = []

    def save(self, reservation_id):
        self.saved.append(reservation_id)


class ReservationService:
    def __init__(self, repository):
        self.repository = repository

    def create(self, reservation_id):
        self.repository.save(reservation_id)
        return len(self.repository.saved)


if __name__ == "__main__":
    repo = FakeReservationRepository()
    print(ReservationService(repo).create("res-1"))
`
    ),
    section(
      'Describe seams in terms of future change, not pattern names',
      'A mature LLD explanation rarely says "I used dependency inversion" and stops there. Instead, it says that notification, pricing, and storage change independently from the core entity lifecycle, so those dependencies sit behind narrow contracts. The interviewer learns both the abstraction and the reason it exists. That reasoning is what separates an experienced design answer from a memorized catalog of SOLID vocabulary.',
      'When you narrate the design, make the dependency story concrete. Say which collaborator you would fake in a unit test, which one might get a second implementation after a follow-up, and which direct calls are intentionally left concrete because they are stable. This creates a balanced story: some seams are deliberate, others would be needless ceremony, and you can explain the difference.',
      [
        'Explain why each seam exists in terms of change pressure.',
        'Keep stable dependencies concrete when abstraction has no payoff.',
        'Connect testability and variability back to real product concerns.',
        'Treat pattern names as shorthand, not as the design argument itself.'
      ],
      'A service wired with only one justified seam',
      `
class PricingPolicy:
    def total(self, subtotal):
        raise NotImplementedError


class FlatTaxPolicy(PricingPolicy):
    def total(self, subtotal):
        return subtotal + 5


class InvoiceService:
    def __init__(self, pricing_policy):
        self.pricing_policy = pricing_policy

    def invoice(self, subtotal):
        return self.pricing_policy.total(subtotal)


if __name__ == "__main__":
    print(InvoiceService(FlatTaxPolicy()).invoice(20))
`
    )
  ],
  exercises: [
    codingExercise(
      'notifier-port-refactor',
      'Extract a notification seam',
      'Refactor an order completion flow so it depends on a NotificationPort instead of constructing a concrete email sender inside the service.',
      `
class EmailSender:
    def send(self, message):
        print(f"email: {message}")


class OrderService:
    def complete(self, order_id):
        # TODO: inject a NotificationPort-like dependency instead.
        EmailSender().send(f"order {order_id} completed")


OrderService().complete("ord-1")
`,
      `
class NotificationPort:
    def send(self, message):
        raise NotImplementedError


class EmailSender(NotificationPort):
    def send(self, message):
        print(f"email: {message}")


class OrderService:
    def __init__(self, notifier):
        self.notifier = notifier

    def complete(self, order_id):
        self.notifier.send(f"order {order_id} completed")


OrderService(EmailSender()).complete("ord-1")
`,
      [
        'The service should receive the dependency through its constructor.',
        'Define only the method the service actually needs.',
        'Keep the happy-path workflow shorter after the refactor, not longer.'
      ],
      'email: order ord-1 completed'
    ),
    designExercise(
      'checkout-responsibility-review',
      'Review responsibility boundaries in checkout',
      'Sketch how you would split responsibilities across entities, policies, and repositories in a checkout or booking workflow.',
      [
        'Which class owns lifecycle state transitions?',
        'Which collaborator is the best seam for persistence or side effects?',
        'Which dependencies stay concrete because they are stable?',
        'What would you fake first in a unit test?'
      ]
    )
  ],
  checklist: [
    'Can explain why each major class exists.',
    'Can justify which dependencies deserve thin ports and adapters.',
    'Can design method names and request shapes around domain actions.',
    'Can point to at least one seam that improves testing or evolution.'
  ],
  pitfalls: [
    'Putting validation, state mutation, persistence, and notifications into one wide service.',
    'Creating interfaces for every class instead of a few thin ports around volatility.',
    'Using vague method names that hide the underlying domain action.'
  ],
  interviewPrompts: [
    'When should a business rule live inside an entity instead of a service?',
    'How do you decide whether a dependency deserves a port-and-adapter seam in an interview answer?',
    'What makes a thin port feel domain-driven rather than framework-driven?'
  ],
  related: ['api-design', 'strategy-factory-and-builder', 'testing-seams-and-refactoring']
});

const validationStateLesson = lesson({
  slug: 'validation-errors-and-state',
  title: 'Validation, errors, and state transitions',
  summary:
    'Model legal transitions, expose failure clearly, and keep mutation boundaries strong enough that state stays coherent under change.',
  duration: '50-70 min',
  whyItMatters:
    'Object design quality shows up most clearly when callers try to do the wrong thing. If invalid transitions, partial updates, and confusing errors leak through the model, the class diagram was never truly safe.',
  sections: [
    section(
      'Model state as a lifecycle, not as a loose status field',
      'Many interview solutions store status as a string but leave every caller free to mutate it. That invites impossible combinations such as a cancelled booking that is also marked paid, or a refunded order that still ships. A better answer treats lifecycle as a first-class concept and routes changes through methods that understand which transitions are legal.',
      'Even when a full state pattern is unnecessary, you should still make the state machine explicit. Say which states exist, which commands move between them, and which attempts must fail. That clarity helps you place validation in the right object and makes follow-up questions around cancellation, expiration, or retries much easier to answer without hand-waving.',
      [
        'List legal states before writing mutation methods.',
        'Route transitions through verbs, not public field assignment.',
        'Fail loudly on illegal commands.',
        'Keep the state machine understandable enough to explain aloud.'
      ],
      'A small order lifecycle',
      `
class Order:
    def __init__(self):
        self.status = "created"

    def pay(self):
        if self.status != "created":
            raise ValueError("only created orders can be paid")
        self.status = "paid"


if __name__ == "__main__":
    order = Order()
    order.pay()
    print(order.status)
`
    ),
    section(
      'Validate at the boundary that owns the invariant',
      'Validation belongs closest to the state that would become inconsistent. If a booking must not overlap with itself, the aggregate or repository operation that confirms it should guard that rule. If a payment amount must be positive, the value object or command boundary that receives the amount should reject it. Sprinkling checks across controllers, services, and entities almost guarantees drift over time.',
      'This matters in interviews because follow-ups often add new call paths. A validation rule duplicated in three places is easy to forget in the fourth. A rule that lives in one obvious boundary stays safer when the system grows. When you explain where validation lives, tie it to ownership: "This object rejects the command because only it knows whether the transition is legal."',
      [
        'Keep validation close to the state it protects.',
        'Reject bad commands before emitting side effects.',
        'Prefer one authoritative check over scattered duplicates.',
        'Explain validation placement in terms of state ownership.'
      ],
      'A value object that rejects invalid data',
      `
class Money:
    def __init__(self, cents):
        if cents <= 0:
            raise ValueError("money must be positive")
        self.cents = cents

    def __repr__(self):
        return f"Money({self.cents})"


if __name__ == "__main__":
    print(Money(250))
`
    ),
    section(
      'Choose an error vocabulary callers can act on',
      'The point of error handling is not only to avoid crashes. It is to tell the caller whether a request can be corrected, retried, or abandoned. Domain errors such as seat unavailable, booking expired, or payment already captured are more useful than a generic invalid state exception because the caller can route them into user feedback or compensation logic.',
      'You do not need a huge exception hierarchy in a machine-coding round, but you should be consistent. Either raise meaningful exceptions, return a small result object, or use a boolean plus explanation string when the domain is tiny. What matters is that failure becomes part of the contract instead of a vague afterthought the interviewer must infer.',
      [
        'Use errors that match the domain, not only technical jargon.',
        'Pick one failure style and apply it consistently.',
        'Make retryable and non-retryable cases distinguishable.',
        'Treat common rejections as part of the public API.'
      ],
      'A result object for common rejections',
      `
from dataclasses import dataclass


@dataclass
class Result:
    ok: bool
    message: str


def cancel(status):
    if status != "active":
        return Result(False, "only active reservations can be cancelled")
    return Result(True, "cancelled")


if __name__ == "__main__":
    print(cancel("active"))
`
    ),
    section(
      'Keep mutations atomic enough to avoid half-finished state',
      'Validation and state design must also think about sequencing. If a method charges a card, flips a booking to confirmed, and sends an email, what happens if the email fails after the card succeeded? In a small in-memory design you may simply ensure local mutations happen together before any optional side effect. In a more realistic design you call out transactions, idempotency, or outbox-style follow-ups.',
      'The important interview move is to acknowledge that state safety is not only about the status field. It is also about method ordering and side-effect boundaries. Candidates who mention partial failure modes sound much more production-minded because they show they understand that correctness can break between objects, not only inside a single one.',
      [
        'Perform validation before irreversible side effects when possible.',
        'Keep core state changes grouped behind one method or transaction boundary.',
        'Mention compensation or retry for multi-step workflows.',
        'Separate optional side effects from critical state transitions.'
      ],
      'Commit state before optional notification',
      `
class Ticket:
    def __init__(self):
        self.status = "issued"

    def mark_paid(self):
        if self.status != "issued":
            raise ValueError("ticket cannot be paid now")
        self.status = "paid"
        return "paid"


if __name__ == "__main__":
    ticket = Ticket()
    print(ticket.mark_paid(), ticket.status)
`
    ),
    section(
      'Use transition language to defend the design in interviews',
      'The interviewer often cares less about the exact syntax and more about whether you can narrate the state model confidently. Saying that a reservation moves draft to active to cancelled or expired, and that only active reservations can be confirmed or cancelled, signals much deeper design maturity than simply saying there is a status field on Reservation.',
      'That narration also creates a natural path into later topics such as testing, concurrency, and scale. Once the state machine is clear, you can talk about which transitions need locking, which need persistence, and which are safe to replay idempotently. A clean transition story therefore becomes a bridge between local object design and broader system concerns.',
      [
        'Describe transitions with verbs, not only states.',
        'Explain which commands are legal in each state.',
        'Connect lifecycle rules to tests and concurrency follow-ups.',
        'Use state language to make the design sound deliberate and safe.'
      ],
      'Printing the allowed transition story',
      `
class BookingLifecycle:
    allowed = {
        "draft": ["confirm", "cancel"],
        "confirmed": ["cancel", "complete"],
        "cancelled": [],
        "completed": [],
    }

    def can_run(self, status, action):
        return action in self.allowed[status]


if __name__ == "__main__":
    lifecycle = BookingLifecycle()
    print(lifecycle.can_run("confirmed", "complete"))
`
    )
  ],
  exercises: [
    codingExercise(
      'booking-transition-guard',
      'Guard a booking lifecycle',
      'Implement methods so a booking moves draft -> confirmed -> completed and rejects invalid transitions.',
      `
class Booking:
    def __init__(self):
        self.status = "draft"

    def confirm(self):
        # TODO: allow only draft -> confirmed
        raise NotImplementedError

    def complete(self):
        # TODO: allow only confirmed -> completed
        raise NotImplementedError


booking = Booking()
booking.confirm()
booking.complete()
print(booking.status)
`,
      `
class Booking:
    def __init__(self):
        self.status = "draft"

    def confirm(self):
        if self.status != "draft":
            raise ValueError("only draft bookings can be confirmed")
        self.status = "confirmed"

    def complete(self):
        if self.status != "confirmed":
            raise ValueError("only confirmed bookings can be completed")
        self.status = "completed"


booking = Booking()
booking.confirm()
booking.complete()
print(booking.status)
`,
      [
        'Guard transitions with the current status value.',
        'Keep status mutation inside the methods instead of in caller code.',
        'Let invalid commands raise a domain-meaningful error.'
      ],
      'completed'
    ),
    designExercise(
      'payment-failure-state-review',
      'Review failure states around payment and confirmation',
      'Describe how a checkout or reservation model should handle failure between payment, confirmation, and notification steps.',
      [
        'Which state change is the source of truth for success?',
        'Which side effects are optional enough to retry later?',
        'How would you communicate a user-correctable failure versus a system failure?',
        'Where would idempotency or compensation enter the design?'
      ]
    )
  ],
  checklist: [
    'Can list legal states and transitions for the core entity.',
    'Can place validation at the boundary that owns the invariant.',
    'Can choose an error style callers can understand and handle.',
    'Can explain how the design avoids half-finished state changes.'
  ],
  pitfalls: [
    'Treating state as a public string that any caller can mutate freely.',
    'Duplicating the same validation rule across several unrelated classes.',
    'Ignoring partial-failure ordering when a workflow updates state and side effects together.'
  ],
  interviewPrompts: [
    'How would you model valid state changes for an order, booking, or support ticket?',
    'When is a result object cleaner than throwing an exception in LLD?',
    'How do you stop invariant checks from scattering across the codebase?'
  ],
  related: ['workflow-and-state-modeling', 'distributed-transactions', 'testing-seams-and-refactoring']
});

const entitiesLesson = lesson({
  slug: 'entities-value-objects-and-aggregates',
  title: 'Entities, value objects, and aggregates',
  summary:
    'Separate identity-bearing domain objects from descriptive values, then choose aggregate boundaries that protect consistency without bloating the model.',
  duration: '50-70 min',
  whyItMatters:
    'Many LLD prompts become simpler the moment you stop treating every concept the same way. Correctly identifying entities, values, and aggregate roots gives you cleaner APIs, safer invariants, and a more convincing story about consistency.',
  sections: [
    section(
      'Find which concepts truly need identity',
      'Entities are the objects you track over time even as attributes change. A booking, order, invoice, parking ticket, or support case typically needs identity because it has a lifecycle and is referenced by other actions later. Identity keeps comparisons stable and gives you a natural place to hang transitions such as confirm, cancel, close, or assign.',
      'This matters because developers often accidentally model every nested concept as a separate entity. That creates more references, repositories, and lifecycles than the problem needs. In interviews, a simple question helps: if two objects have the same fields today, would the business still care which exact one is which tomorrow? If yes, it is probably an entity. If no, it may be a value.',
      [
        'Use entities for concepts tracked across time.',
        'Base entity identity on stable identifiers, not mutable attributes.',
        'Attach lifecycle behavior to the entity that owns it.',
        'Avoid promoting descriptive data into entities without a real reason.'
      ],
      'An entity keeps identity while state changes',
      `
class Order:
    def __init__(self, order_id, status):
        self.order_id = order_id
        self.status = status

    def cancel(self):
        self.status = "cancelled"


if __name__ == "__main__":
    order = Order("ord-1", "created")
    order.cancel()
    print(order.order_id, order.status)
`
    ),
    section(
      'Use value objects for validated, descriptive concepts',
      'Value objects shine when a concept is descriptive rather than identity-bearing. Money, date ranges, coordinates, addresses, and discount rules often fit because callers care that the value is valid and comparable, not that it has its own lifecycle. Immutability helps here because you can trust that once created, the value still represents the same concept everywhere it travels.',
      'In interviews, value objects are a great way to make the model look thoughtful without adding unnecessary complexity. They localize small validation rules, improve method signatures, and reduce primitive obsession. A TimeRange that refuses inverted start and end values usually communicates more design maturity than three scattered checks against raw integers in caller code.',
      [
        'Use value objects for validated descriptive data.',
        'Prefer immutability so comparisons stay simple and safe.',
        'Bundle fields that always travel together conceptually.',
        'Use value objects to shrink primitive-heavy method signatures.'
      ],
      'An immutable time range value',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class TimeRange:
    start: int
    end: int

    def __post_init__(self):
        if self.start >= self.end:
            raise ValueError("start must be before end")


if __name__ == "__main__":
    print(TimeRange(10, 12))
`
    ),
    section(
      'Choose aggregates around consistency, not around folders in the codebase',
      'An aggregate is the boundary inside which you promise strong consistency. The root is the single entry point for mutating that cluster of state. For example, a Cart may own its line items because totals and quantities must stay consistent in one transaction, while inventory reservations might live elsewhere because they contend independently and can be coordinated later.',
      'The common interview failure is making the aggregate too large. If every action on a customer, order history, loyalty balance, and coupon set routes through one giant root, unrelated work now contends for the same lock or transaction boundary. Good boundaries protect the invariant you care about while leaving unrelated changes free to evolve separately.',
      [
        'Pick aggregate boundaries based on invariants that must hold together.',
        'Route mutating commands through the aggregate root.',
        'Keep aggregates small enough to update atomically.',
        'Accept that some cross-aggregate coordination will be eventual.'
      ],
      'A cart aggregate root owns item changes',
      `
class Cart:
    def __init__(self):
        self.items = {}

    def add_item(self, sku, quantity):
        self.items[sku] = self.items.get(sku, 0) + quantity

    def total_items(self):
        return sum(self.items.values())


if __name__ == "__main__":
    cart = Cart()
    cart.add_item("pen", 2)
    cart.add_item("pen", 1)
    print(cart.total_items())
`
    ),
    section(
      'Protect internal collections and derived data',
      'Once you choose an aggregate or entity, keep callers from reaching inside and bypassing the rules. Returning mutable collections directly, exposing public setters for lifecycle fields, or letting external code recalculate totals by hand makes the aggregate root mostly ceremonial. Encapsulation is what turns a group of fields into an actual consistency boundary.',
      'This is why many strong LLD answers provide intent-revealing methods such as add_line_item(), reserve_copy(), or assign_agent() instead of exposing the raw list or dictionary underneath. The interviewer can see exactly where validation would live, and tests naturally target business behavior rather than low-level data mutation.',
      [
        'Expose domain verbs instead of raw collection access.',
        'Keep derived data updated through one mutation path.',
        'Avoid setter-heavy models that bypass invariants.',
        'Use encapsulation to make the aggregate boundary real.'
      ],
      'Encapsulation around a private collection',
      `
class Team:
    def __init__(self):
        self._members = []

    def add_member(self, name):
        if name in self._members:
            raise ValueError("duplicate member")
        self._members.append(name)

    def size(self):
        return len(self._members)


if __name__ == "__main__":
    team = Team()
    team.add_member("Ava")
    print(team.size())
`
    ),
    section(
      'Explain consistency boundaries in plain interview language',
      'The most useful aggregate explanation is not theoretical. It is practical: "I keep seat selection and reservation status inside one aggregate so I can reject double booking in one place, but payment and notification remain outside because they evolve independently and may need retries." That answer tells the interviewer both what is consistent and what is intentionally coordinated later.',
      'When you can speak that language, you also gain a clean path into persistence and scale follow-ups. You can point to which root needs row-level locking, which value objects map neatly into storage records, and where eventual coordination begins. In other words, entity and aggregate choices become the backbone for later repository, concurrency, and distributed-system discussion.',
      [
        'Describe what stays strongly consistent inside the boundary.',
        'Name what coordination happens outside the boundary and why.',
        'Connect aggregate size to locking and transaction costs.',
        'Use consistency language to bridge into persistence follow-ups.'
      ],
      'Printing an aggregate consistency statement',
      `
class AggregateBoundary:
    def __init__(self, root, invariant):
        self.root = root
        self.invariant = invariant

    def explain(self):
        return f"{self.root} protects {self.invariant}"


if __name__ == "__main__":
    print(AggregateBoundary("Reservation", "one active booking per seat").explain())
`
    )
  ],
  exercises: [
    codingExercise(
      'money-value-object',
      'Create a Money value object',
      'Implement a small immutable Money value object that rejects negative cents and can add two Money instances together.',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Money:
    cents: int

    def __post_init__(self):
        # TODO: reject negative values
        pass

    def add(self, other):
        # TODO: return a new Money with summed cents
        raise NotImplementedError


print(Money(250).add(Money(50)))
`,
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Money:
    cents: int

    def __post_init__(self):
        if self.cents < 0:
            raise ValueError("money cannot be negative")

    def add(self, other):
        return Money(self.cents + other.cents)


print(Money(250).add(Money(50)))
`,
      [
        'Use frozen dataclass semantics so the value stays immutable.',
        'Validate the raw cents once in __post_init__.',
        'Return a new instance from add() instead of mutating the old one.'
      ],
      'Money(cents=300)'
    ),
    designExercise(
      'aggregate-boundary-review',
      'Choose an aggregate boundary for reservations',
      'Sketch the aggregate root and value objects for a reservation or order domain with scarce inventory.',
      [
        'Which concept owns the invariant that must be strongly consistent?',
        'Which descriptive fields belong in value objects rather than separate entities?',
        'Which internal collections should never be exposed directly?',
        'What coordination can happen outside the aggregate boundary?'
      ]
    )
  ],
  checklist: [
    'Can distinguish identity-bearing entities from descriptive value objects.',
    'Can explain which invariant justifies an aggregate boundary.',
    'Can keep internal collections behind intent-revealing methods.',
    'Can describe what stays strongly consistent versus eventual.'
  ],
  pitfalls: [
    'Treating every nested concept as a separate entity with its own lifecycle.',
    'Making one aggregate so large that unrelated updates contend with each other.',
    'Exposing raw mutable collections and undermining the aggregate boundary.'
  ],
  interviewPrompts: [
    'Which parts of a booking or commerce system are entities versus value objects?',
    'How do aggregate boundaries affect consistency and concurrency?',
    'When is a small value object worth introducing in an interview answer?'
  ],
  related: ['relational-data-modeling', 'workflow-and-state-modeling', 'validation-errors-and-state']
});

const compositionLesson = lesson({
  slug: 'composition-vs-inheritance',
  title: 'Composition, inheritance, and polymorphism',
  summary:
    'Prefer composition by default, reach for inheritance only when Liskov substitutability is genuinely true, and use polymorphism only when the behavior change justifies it.',
  duration: '45-60 min',
  whyItMatters:
    'Interview follow-ups often ask you to extend behavior without wrecking the original design. Modern style guides and production codebases usually prefer composition because it keeps variation local, while inheritance is trusted only when a true subtype relationship survives future changes and still passes the Liskov test.',
  sections: [
    section(
      'Prefer composition when behavior varies independently',
      'Composition is the default when a behavior might change without changing the owning object itself. Pricing policy, ranking logic, notification delivery, assignment strategy, and validation rules often vary independently from the entity or service that uses them. Pulling those into collaborators lets you swap the decision while keeping the surrounding workflow stable.',
      'This is especially useful in interviews because follow-ups frequently introduce exactly that kind of variation. A parking ticket should still be a parking ticket whether pricing is flat, hourly, or surge-based. A booking workflow should still confirm the same way whether notifications go by email or SMS. Composition makes those changes surgical instead of forcing a subclass explosion.',
      [
        'Use composition when one concern changes independently from another.',
        'Keep the owning workflow stable while collaborators vary.',
        'Model policy seams around concrete change pressure.',
        'Avoid subclassing just to save a little duplicated setup code.'
      ],
      'Composition with a replaceable pricing policy',
      `
class HourlyPricing:
    def total(self, minutes):
        return ((minutes + 59) // 60) * 4


class ParkingTicket:
    def __init__(self, pricing):
        self.pricing = pricing

    def fee(self, minutes):
        return self.pricing.total(minutes)


if __name__ == "__main__":
    print(ParkingTicket(HourlyPricing()).fee(61))
`
    ),
    section(
      'Use inheritance only for genuine substitutability',
      'Inheritance becomes useful when several subtypes share one stable contract and callers can treat them uniformly without knowing the exact concrete type. A report exporter hierarchy or a family of payment command objects can fit if each subtype honors the same behavioral promise and only specialized steps differ. The emphasis is on shared meaning, not shared fields, and the modern test for that honesty is Liskov substitutability.',
      'The risk is confusing "has some common code" with "is a subtype." A base class that exists only so siblings can inherit utility methods is often a signal that composition or a helper object would be clearer. In interviews, the easiest defense of inheritance is to name the caller expectation first and prove that every subtype still behaves correctly without special-case knowledge.',
      [
        'Use inheritance only for real semantic substitutability.',
        'Keep base-class contracts small and stable.',
        'Reject inheritance when the relationship is merely code reuse.',
        'Use LSP as the final go/no-go test before keeping a hierarchy.'
      ],
      'A small subtype family with one contract',
      `
class ReceiptSender:
    def send(self, order_id):
        raise NotImplementedError


class EmailReceiptSender(ReceiptSender):
    def send(self, order_id):
        return f"email receipt for {order_id}"


class SmsReceiptSender(ReceiptSender):
    def send(self, order_id):
        return f"sms receipt for {order_id}"


if __name__ == "__main__":
    print(EmailReceiptSender().send("ord-2"))
`
    ),
    section(
      'Use polymorphism when it removes branching that is truly spreading',
      'Polymorphism is not a prize for eliminating every if statement. It pays off when the branching logic keeps spreading across the codebase or when each branch has enough behavior to deserve a name. If one method contains a small, stable conditional, a simple branch may be clearer than a strategy hierarchy, factory, and test suite around two lines of logic.',
      'This restraint matters in interview settings because time is limited. Good candidates can say that the current branch is local and readable, so they would keep it simple until a second or third policy appears. That answer shows you understand polymorphism as a tool for managing behavioral growth, not as a compulsory aesthetic preference.',
      [
        'Use polymorphism when branch logic is meaningful and growing.',
        'Keep small local conditionals when they are easy to read.',
        'Name strategies or subtypes after business behavior, not implementation tricks.',
        'Treat polymorphism as a response to spread, not a default.'
      ],
      'A small branch that stays local',
      `
def shipping_fee(speed):
    if speed == "express":
        return 15
    return 7


if __name__ == "__main__":
    print(shipping_fee("express"))
`
    ),
    section(
      'Beware deep hierarchies and leaky base classes',
      'Deep inheritance trees make interviews harder to reason about because behavior spreads vertically. A base class with too many optional hooks or fields often forces subclasses to inherit behavior they do not want, override methods they should not understand, or carry around configuration unrelated to their core job. The design starts looking clever but fragile.',
      'Composition usually handles optional behavior better because collaborators can be added, removed, or replaced independently. You can layer logging around a repository, inject a pricing policy into a service, or swap an allocation strategy without forcing every subtype through the same inheritance chain. That modularity tends to survive follow-up questions much more gracefully.',
      [
        'Avoid deep trees that exist only to share implementation details.',
        'Keep base classes narrow if you must have them.',
        'Prefer collaborators for optional or orthogonal features.',
        'Watch for subclasses that ignore or violate base-class assumptions.'
      ],
      'Composition keeps optional behavior local',
      `
class Logger:
    def log(self, message):
        print(f"log: {message}")


class ReservationService:
    def __init__(self, logger):
        self.logger = logger

    def reserve(self, reservation_id):
        self.logger.log(f"reserved {reservation_id}")


if __name__ == "__main__":
    ReservationService(Logger()).reserve("res-9")
`
    ),
    section(
      'Explain the trade-off in terms of future change',
      'The best interview explanation is always about what kind of future change you are optimizing for. If the requirement suggests new pricing policies, use composition. If the requirement suggests a stable family of interchangeable handlers with one contract, inheritance may be fine. If neither pressure exists, keep the code simple and postpone abstraction until the follow-up makes it real.',
      'That framing helps the interviewer hear judgment rather than dogma. You are not saying composition is always better or inheritance is always bad. You are saying this design is trying to absorb a specific class of future change with the smallest reasonable mechanism. That is exactly the kind of reasoning low-level design rounds are meant to surface.',
      [
        'Tie the abstraction choice to one believable future change.',
        'Acknowledge the cost of extra indirection.',
        'Choose the smallest mechanism that preserves flexibility.',
        'Defend simplicity when abstraction would not yet pay off.'
      ],
      'A concise design choice explanation',
      `
class DesignChoice:
    def __init__(self, reason, tool):
        self.reason = reason
        self.tool = tool

    def explain(self):
        return f"use {self.tool} because {self.reason}"


if __name__ == "__main__":
    print(DesignChoice("pricing varies independently from checkout", "composition").explain())
`
    )
  ],
  exercises: [
    codingExercise(
      'pricing-policy-composition',
      'Extract pricing into composition',
      'Refactor a fee calculator so pricing is delegated to a collaborator instead of branching inside the ticket object.',
      `
class ParkingTicket:
    def fee(self, minutes, mode):
        # TODO: remove this conditional by introducing a pricing collaborator.
        if mode == "flat":
            return 10
        return ((minutes + 59) // 60) * 4


print(ParkingTicket().fee(61, "hourly"))
`,
      `
class HourlyPricing:
    def total(self, minutes):
        return ((minutes + 59) // 60) * 4


class ParkingTicket:
    def __init__(self, pricing):
        self.pricing = pricing

    def fee(self, minutes):
        return self.pricing.total(minutes)


print(ParkingTicket(HourlyPricing()).fee(61))
`,
      [
        'Move only the variable decision into the collaborator.',
        'Keep the ticket API smaller after the refactor.',
        'Pick collaborator names that describe business behavior.'
      ],
      '8'
    ),
    designExercise(
      'inheritance-or-composition-review',
      'Choose between inheritance and composition',
      'Review a proposed hierarchy and decide whether the variation is better modeled as subtypes or as injected collaborators.',
      [
        'Does each subtype honor one stable semantic contract?',
        'Is the variation orthogonal enough to compose instead?',
        'Would a deep base class force unrelated behavior onto some children?',
        'What future change are you explicitly optimizing for?'
      ]
    )
  ],
  checklist: [
    'Can explain why composition is the default for independently varying behavior.',
    'Can justify inheritance only when substitutability is real and LSP holds.',
    'Can keep small local conditionals when polymorphism would be overkill.',
    'Can explain the abstraction choice in terms of future change.'
  ],
  pitfalls: [
    'Building deep inheritance trees just to share a few helper methods.',
    'Choosing inheritance because it looks elegant even though composition would localize change better.',
    'Replacing every small conditional with a strategy hierarchy.',
    'Failing to explain what future variation the abstraction is buying.'
  ],
  interviewPrompts: [
    'How would you model different pricing or notification behaviors without subclass explosion?',
    'When is inheritance justified in a machine-coding or LLD round, and how would you apply the LSP test?',
    'What makes a polymorphic abstraction too heavy for the current problem?'
  ],
  related: ['storage-selection', 'strategy-factory-and-builder', 'observer-dependency-inversion-and-events']
});

const workflowLesson = lesson({
  slug: 'workflow-and-state-modeling',
  title: 'Workflow orchestration and state modeling',
  summary:
    'Keep the command path readable, let domain objects own their transitions, and design workflows that can accept retries, cancellation, and follow-up steps.',
  duration: '50-70 min',
  whyItMatters:
    'Many interview prompts start with a single method and then grow into a multi-step workflow. Candidates who separate orchestration from durable state can extend the design without hiding the happy path or scattering status logic everywhere.',
  sections: [
    section(
      'Choose one clear entry point for each user action',
      'A workflow becomes understandable when each user action enters through one obvious method. create_booking(), pay_ticket(), confirm_order(), or assign_driver() are much easier to reason about than a grab bag of low-level helper calls. The entry point lets you list validation, domain mutation, persistence, and follow-up side effects in a readable order.',
      'This is important because many poor LLD answers bury the real workflow inside several collaborators with no visible top-to-bottom narrative. Interviewers want to see that you can tell the story of one command from input to outcome. A crisp entry point makes that story explicit and gives you a natural place to discuss error handling, retries, and later async work.',
      [
        'Give each major user action one clear command method.',
        'Keep the top-level flow readable from validation to outcome.',
        'Use domain verbs so the entry point reflects business behavior.',
        'Treat helper methods as supporting detail, not the main narrative.'
      ],
      'One entry point narrates a booking flow',
      `
class BookingService:
    def create_booking(self, customer_id, room_id):
        return f"booking created for {customer_id} in {room_id}"


if __name__ == "__main__":
    print(BookingService().create_booking("c-1", "room-8"))
`
    ),
    section(
      'Let domain objects own legal transitions',
      'Orchestration code should ask domain objects to change state rather than directly mutating their fields. That means the workflow service may load a reservation and call confirm(), expire(), or cancel(), but it should not set reservation.status = "confirmed" from the outside. The object that owns the state should also own the rules for whether the move is legal.',
      'This split keeps workflows readable without making them fragile. The service remains a script over domain capabilities, while the domain object remains the source of truth for correctness. When follow-ups arrive, you update the transition rules in one place rather than trying to remember every orchestration branch that once assigned a raw status field directly.',
      [
        'Call domain verbs from the workflow instead of setting fields directly.',
        'Keep legal-transition knowledge inside the object that owns the state.',
        'Use services to coordinate, not to impersonate entities.',
        'Preserve one obvious source of truth for state legality.'
      ],
      'Workflow delegates the transition to the entity',
      `
class Reservation:
    def __init__(self):
        self.status = "draft"

    def confirm(self):
        if self.status != "draft":
            raise ValueError("reservation cannot be confirmed")
        self.status = "confirmed"


if __name__ == "__main__":
    reservation = Reservation()
    reservation.confirm()
    print(reservation.status)
`
    ),
    section(
      'Separate synchronous validation from later side effects',
      'Not every step in a workflow belongs in the same critical path. Validation and domain mutation often must happen synchronously because they determine whether the request succeeds. Notifications, analytics, search indexing, and some cache updates can usually happen after the core state change. Distinguishing these categories keeps the main method honest about what really defines success.',
      'Calling out that separation is an excellent interview move because it shows you understand latency and failure trade-offs even in an LLD round. You are saying that the workflow should return success once the authoritative state is safely updated, while optional reactions can be handled by observers, queues, or retries. That keeps the object model grounded in business truth rather than in incidental integrations.',
      [
        'Keep authoritative validation and mutation on the critical path.',
        'Move optional reactions out of the main success definition.',
        'Say which side effects can be retried independently later.',
        'Use this split to discuss reliability without overbuilding.'
      ],
      'Core mutation before optional event publication',
      `
class EventBus:
    def publish(self, name, payload):
        print(f"event {name}: {payload}")


class Order:
    def __init__(self, order_id):
        self.order_id = order_id
        self.status = "created"

    def mark_paid(self):
        self.status = "paid"


if __name__ == "__main__":
    order = Order("ord-4")
    order.mark_paid()
    EventBus().publish("order.paid", {"order_id": order.order_id})
`
    ),
    section(
      'Model long-running workflows as explicit state plus coordination',
      'Some workflows are larger than one request. Reservations expire, approvals escalate, rides progress through matching and pickup, and deployment jobs move through validation, execution, and rollback. In those cases you still want the same separation: domain objects own durable state, while services or schedulers coordinate the next command based on that state.',
      'This perspective keeps you from hiding everything inside one giant execute() method. It also helps you answer scheduling and retry follow-ups. If expiration is a command against a Reservation state machine rather than an ad hoc background script, the model stays consistent whether the transition comes from a user action, a timer, or an administrator.',
      [
        'Represent long-running workflow progress as durable state.',
        'Use services, timers, or handlers to issue the next command.',
        'Keep background transitions subject to the same legality rules.',
        'Make workflow progress explainable as a sequence of commands.'
      ],
      'A scheduled expiration still uses a domain method',
      `
class Hold:
    def __init__(self):
        self.status = "active"

    def expire(self):
        if self.status != "active":
            raise ValueError("only active holds can expire")
        self.status = "expired"


if __name__ == "__main__":
    hold = Hold()
    hold.expire()
    print(hold.status)
`
    ),
    section(
      'Use workflow language to absorb follow-ups gracefully',
      'When the interviewer adds cancellation, retries, audit logs, or async notifications, the workflow story should get longer, not totally different. You can say where the new step attaches, which command it introduces, and whether it changes the success definition. That sounds incremental and credible because the baseline flow already had clear entry points, state ownership, and side-effect boundaries.',
      'This is one of the cleanest bridges from LLD into HLD thinking. You can identify the local object method that remains stable while the surrounding coordination changes shape. A mature answer might say that the booking aggregate still confirms or cancels the same way, but the command now comes from a queue-backed worker or a timeout scheduler instead of a synchronous request handler.',
      [
        'Extend the existing workflow story instead of restarting the design.',
        'Name where a new command or observer step would attach.',
        'Keep core domain transitions stable while coordination evolves.',
        'Use workflow boundaries to bridge naturally into scale discussion.'
      ],
      'Printing a workflow step plan',
      `
class WorkflowPlan:
    def __init__(self, steps):
        self.steps = steps

    def describe(self):
        return " -> ".join(self.steps)


if __name__ == "__main__":
    print(WorkflowPlan(["validate", "confirm", "persist", "notify"]).describe())
`
    )
  ],
  exercises: [
    codingExercise(
      'hold-expiration-workflow',
      'Model a simple hold workflow',
      'Implement confirm() and expire() so a hold can move from active to confirmed or active to expired, but not transition twice.',
      `
class Hold:
    def __init__(self):
        self.status = "active"

    def confirm(self):
        # TODO: allow only active -> confirmed
        raise NotImplementedError

    def expire(self):
        # TODO: allow only active -> expired
        raise NotImplementedError


hold = Hold()
hold.confirm()
print(hold.status)
`,
      `
class Hold:
    def __init__(self):
        self.status = "active"

    def confirm(self):
        if self.status != "active":
            raise ValueError("only active holds can confirm")
        self.status = "confirmed"

    def expire(self):
        if self.status != "active":
            raise ValueError("only active holds can expire")
        self.status = "expired"


hold = Hold()
hold.confirm()
print(hold.status)
`,
      [
        'Treat both commands as domain transitions, not field assignment.',
        'Only the active state should accept either command.',
        'Keep the object usable from user-driven or scheduler-driven code.'
      ],
      'confirmed'
    ),
    designExercise(
      'checkout-workflow-followups',
      'Extend a checkout workflow with follow-ups',
      'Describe how you would grow a checkout or reservation workflow to handle cancellation, retries, and notifications without losing readability.',
      [
        'Which command methods form the initial workflow entry points?',
        'Which object still owns legal transitions when background jobs are added?',
        'Which side effects belong off the critical path?',
        'How would you narrate the follow-up without redesigning the entire model?'
      ]
    )
  ],
  checklist: [
    'Can choose one clear entry point for each major user action.',
    'Can let domain objects own their legal transitions.',
    'Can separate critical-path state mutation from optional side effects.',
    'Can extend the workflow story incrementally when follow-ups arrive.'
  ],
  pitfalls: [
    'Hiding the main business flow inside a web of helper methods and side effects.',
    'Mutating entity state directly from orchestration code instead of calling domain methods.',
    'Redefining success so broadly that optional notifications block the core workflow.'
  ],
  interviewPrompts: [
    'How would you structure a booking or checkout workflow so it stays readable under follow-ups?',
    'Where should orchestration stop and domain ownership begin?',
    'How do you add retries or cancellation without rewriting the baseline model?'
  ],
  related: ['distributed-transactions', 'validation-errors-and-state', 'observer-dependency-inversion-and-events']
});

const patternsLesson = lesson({
  slug: 'strategy-factory-and-builder',
  title: 'Strategy, factory, and builder patterns in interviews',
  summary:
    'Use the most interview-relevant patterns only when they solve a real change vector: Strategy for runtime behavior, Factory for object selection, Builder for staged setup, and a shared injected instance instead of Singleton most of the time.',
  duration: '50-70 min',
  whyItMatters:
    'These patterns appear often because they map to common interview pressures, but using them mechanically makes answers worse. In current rounds, Strategy, Factory, and Observer cover most pattern follow-ups, Builder appears when construction has stages, and Singleton should usually collapse into one shared instance owned by the composition root. The skill is knowing the concrete problem each pattern solves and defending when plain constructors or local conditionals are still better.',
  sections: [
    section(
      'Reach for Strategy when a policy changes independently from the workflow',
      'Strategy is strongest when the surrounding workflow stays stable while one decision varies by tenant, request type, SLA, feature flag, or product tier. Pricing, scoring, allocation, routing, and fraud checks are classic examples. The workflow calls one policy interface and stays readable instead of accumulating branches for every new variant.',
      'The pattern is not free, so justify it precisely. If the policy is tiny and unlikely to grow, a local conditional may still be the right answer. In interviews, Strategy sounds convincing when you can say what changes independently, who owns that variation, and why callers should not branch on concrete implementations themselves.',
      [
        'Use Strategy for named policies that truly vary at runtime.',
        'Keep shared workflow code outside the strategies.',
        'Test each strategy independently from orchestration.',
        'Do not extract tiny stable branches just to sound advanced.'
      ],
      'A shipping policy chosen at runtime',
      `
class ShippingPolicy:
    def fee(self, weight):
        raise NotImplementedError


class StandardShipping(ShippingPolicy):
    def fee(self, weight):
        return 7 if weight <= 20 else 25


if __name__ == "__main__":
    print(StandardShipping().fee(8))
`
    ),
    section(
      'Use Factory when callers should not own construction logic',
      'Factory helps when picking or wiring a concrete object depends on configuration, environment, validation, or partner-specific details the caller should not repeat. A checkout service should not know how to assemble every receipt sender, and a controller should not know which storage adapter a deployment mode requires. The factory makes that choice explicit and central.',
      'A common smell is wrapping a single constructor with no decision behind it. That adds indirection without clarifying anything. A factory earns its keep only when it removes duplicated construction logic or hides a branching decision that would otherwise leak across several callers. The best explanation focuses on ownership of the creation policy, not on the pattern name alone.',
      [
        'Use Factory when concrete selection or wiring should be centralized.',
        'Return a stable capability so callers stay insulated from detail.',
        'Fail loudly on unsupported configuration.',
        'Skip the pattern when one direct constructor call is already clear.'
      ],
      'Factory hides channel selection',
      `
class EmailSender:
    def send(self, message):
        return f"email {message}"


class SmsSender:
    def send(self, message):
        return f"sms {message}"


class SenderFactory:
    def create(self, channel):
        if channel == "email":
            return EmailSender()
        return SmsSender()


if __name__ == "__main__":
    print(SenderFactory().create("email").send("receipt"))
`
    ),
    section(
      'Use Builder when staged setup and cross-field validation matter',
      'Builder becomes useful when object construction has required fields, optional fields, defaults, and cross-field rules that a plain constructor would hide. The payoff is not fluent syntax by itself. The payoff is making invalid partially assembled objects harder to create and making valid setup steps easy to read in interview code.',
      'That said, do not overuse Builder for trivial objects. If a dataclass with named parameters is already obvious, adding builder methods only creates noise. The pattern is strongest when the setup has meaningful phases, like building a deployment request, report query, or search job where some options only make sense after earlier choices have been made.',
      [
        'Use Builder when construction has stages, defaults, or cross-field rules.',
        'Validate completeness in the final build() step.',
        'Keep partially built state private to the builder.',
        'Prefer plain named arguments when the object is already obvious.'
      ],
      'A builder protects a deploy request',
      `
class DeployRequestBuilder:
    def __init__(self):
        self.service = None
        self.replicas = 1

    def set_service(self, name):
        self.service = name
        return self

    def build(self):
        if not self.service:
            raise ValueError("service is required")
        return {"service": self.service, "replicas": self.replicas}


if __name__ == "__main__":
    print(DeployRequestBuilder().set_service("payments").build())
`
    ),
    section(
      'Keep pattern boundaries narrow enough to explain live',
      'Pattern-heavy answers get weaker when the abstraction count grows faster than the business story. If a Factory also validates, selects strategies, persists objects, and starts workflows, it is not really a factory anymore. If a Strategy knows too much about the rest of the workflow, it becomes a hidden service object. Keep each pattern boundary narrow so you can explain it in one sentence.',
      'This is crucial under interview time pressure. Narrow boundaries are easier to implement, easier to test, and easier to evolve when the interviewer changes one requirement mid-stream. The patterns should remove complexity from the main flow rather than shifting the same complexity into more classes with fancier names.',
      [
        'Explain each pattern in one crisp sentence of responsibility.',
        'Keep creation, policy, and staged setup concerns separate.',
        'Use patterns to simplify the happy path, not just relocate it.',
        'Refactor broad pattern objects when they become mini frameworks.'
      ],
      'A checkout service delegates only the varying decision',
      `
class PricingPolicy:
    def total(self, subtotal):
        return subtotal


class CheckoutService:
    def __init__(self, policy):
        self.policy = policy

    def checkout(self, subtotal):
        return self.policy.total(subtotal)


if __name__ == "__main__":
    print(CheckoutService(PricingPolicy()).checkout(25))
`
    ),
    section(
      'Say no to a pattern when the simpler design is stronger',
      'One of the most impressive things you can do in an LLD round is explicitly reject a pattern that does not yet earn its weight. Saying that a local conditional is clear enough for version one, or that a dataclass constructor is simpler than a builder right now, shows restraint. If a follow-up asks about Singleton, the modern answer is usually that the object may be process-scoped, but callers should still receive it through dependency injection rather than through hidden global access.',
      'The key is to reject the pattern for a principled reason. You are not saying the pattern is bad in general. You are saying this prompt does not yet have the construction complexity, runtime variation, or staged validation pressure that would justify it. That kind of answer shows you understand patterns as trade-offs instead of as trivia flashcards, and that you know a shared injected instance is often cleaner than a hard Singleton.',
      [
        'Defend simple code when the variation is not yet meaningful.',
        'Name the condition under which you would add the pattern later.',
        'Prefer a shared injected instance over Singleton-style global access.',
        'Treat patterns as tools that must earn their indirection.'
      ],
      'A simple branch that does not need a pattern yet',
      `
def plan_name(is_premium):
    if is_premium:
        return "premium"
    return "basic"


if __name__ == "__main__":
    print(plan_name(False))
`
    )
  ],
  exercises: [
    codingExercise(
      'factory-for-receipts',
      'Move receipt construction into a factory',
      'Refactor a checkout flow so channel-specific sender creation happens inside a SenderFactory instead of inside the checkout service.',
      `
class EmailSender:
    def send(self, order_id):
        print(f"email {order_id}")


class SmsSender:
    def send(self, order_id):
        print(f"sms {order_id}")


class CheckoutService:
    def checkout(self, order_id, channel):
        # TODO: introduce SenderFactory so this service stops choosing concrete senders.
        if channel == "email":
            EmailSender().send(order_id)
        else:
            SmsSender().send(order_id)


CheckoutService().checkout("ord-9", "email")
`,
      `
class EmailSender:
    def send(self, order_id):
        print(f"email {order_id}")


class SmsSender:
    def send(self, order_id):
        print(f"sms {order_id}")


class SenderFactory:
    def create(self, channel):
        if channel == "email":
            return EmailSender()
        if channel == "sms":
            return SmsSender()
        raise ValueError("unsupported channel")


class CheckoutService:
    def __init__(self, factory):
        self.factory = factory

    def checkout(self, order_id, channel):
        self.factory.create(channel).send(order_id)


CheckoutService(SenderFactory()).checkout("ord-9", "email")
`,
      [
        'Create exactly one object whose job is channel selection.',
        'Keep the checkout workflow focused on orchestration.',
        'Raise an error for unsupported channels so failures stay explicit.'
      ],
      'email ord-9'
    ),
    designExercise(
      'pattern-choice-review',
      'Choose the right pattern for a follow-up',
      'Review a follow-up such as premium pricing, multiple storage adapters, or staged request assembly and decide whether Strategy, Factory, Builder, or plain code fits best.',
      [
        'What concrete change pressure are you trying to isolate?',
        'Would a local conditional or named arguments already be clear enough?',
        'Which pattern keeps the main workflow shortest to explain?',
        'What one-sentence responsibility would you assign to the chosen pattern object?'
      ]
    )
  ],
  checklist: [
    'Can justify Strategy in terms of runtime policy variation.',
    'Can justify Factory in terms of centralized construction logic.',
    'Can justify Builder in terms of staged setup and validation.',
    'Can explain when simple code or an injected shared instance is stronger than adding a pattern.'
  ],
  pitfalls: [
    'Applying multiple patterns at once without distinct responsibilities.',
    'Using a factory or builder where a direct constructor call is already clear.',
    'Extracting strategies for tiny local branches that are unlikely to grow.',
    'Using Singleton as a shortcut for dependency access when composition root wiring would be clearer.'
  ],
  interviewPrompts: [
    'How would you justify Strategy in a pricing or allocation design?',
    'When does a Factory materially improve an interview solution?',
    'What is the simplest case where a Builder is still worth using, and when would you reject Singleton in favor of DI?'
  ],
  related: ['api-design', 'responsibilities-and-interfaces', 'composition-vs-inheritance']
});

const observerLesson = lesson({
  slug: 'observer-dependency-inversion-and-events',
  title: 'Observer, dependency inversion, and event-style decoupling',
  summary:
    'Decouple the core workflow from secondary reactions, define stable ports for infrastructure, and reason about event delivery trade-offs explicitly.',
  duration: '50-70 min',
  whyItMatters:
    'Many interview follow-ups ask how to add notifications, analytics, plugins, or integrations without rewriting the business path. Observer-style designs and dependency inversion are how you add those concerns cleanly while still talking honestly about ordering, retries, and debugging.',
  sections: [
    section(
      'Publish facts after the core state change succeeds',
      'Observer-style decoupling works best when the core domain action remains authoritative and downstream listeners react afterward. The booking becomes confirmed first, then analytics, notifications, and indexing hear about that fact. This keeps the main rule easy to reason about and prevents optional concerns from distorting the definition of success.',
      'The design becomes much weaker when observer callbacks are allowed to secretly mutate the same core state behind the workflow. That hides behavior and makes failure handling much harder. In interviews, emphasize that the event represents something that already happened, and that listeners should extend the system, not rewrite the outcome of the original command.',
      [
        'Publish events only after authoritative state changes succeed.',
        'Treat observers as reactions, not as hidden decision-makers.',
        'Keep the core workflow understandable without reading every listener.',
        'Name events as completed facts rather than vague actions.'
      ],
      'An event published after confirmation',
      `
class EventBus:
    def __init__(self):
        self.handlers = {}

    def subscribe(self, name, handler):
        self.handlers.setdefault(name, []).append(handler)

    def publish(self, name, payload):
        for handler in self.handlers.get(name, []):
            handler(payload)


if __name__ == "__main__":
    bus = EventBus()
    bus.subscribe("booking.confirmed", lambda event: print(f"notify {event['booking_id']}"))
    bus.publish("booking.confirmed", {"booking_id": "b-1"})
`
    ),
    section(
      'Define ports from the caller perspective, not the provider perspective',
      'Dependency inversion is practical when the core model depends on stable capabilities such as save reservation, send message, get time, or charge payment rather than on vendor-specific or framework-specific details. The port should be shaped by what the domain needs, not by the full interface of the external library or SDK sitting underneath.',
      'That keeps adapters thin and readable. Your domain service should not care whether an email comes from SES, SMTP, or a mock notifier in tests. It should care that there is a send() capability with domain-relevant inputs. When you explain the seam that way, you show the interviewer that the abstraction exists to protect the domain from external churn, not to pad the class diagram.',
      [
        'Design ports around domain-needed capabilities.',
        'Keep vendor- or framework-specific mapping inside adapters.',
        'Use the same port to support production and test implementations.',
        'Avoid leaking external SDK shapes into the core model.'
      ],
      'A notifier port with one adapter',
      `
class Notifier:
    def send(self, message):
        raise NotImplementedError


class ConsoleNotifier(Notifier):
    def send(self, message):
        print(f"console: {message}")


if __name__ == "__main__":
    ConsoleNotifier().send("booking confirmed")
`
    ),
    section(
      'Say whether observers run synchronously or asynchronously',
      'Events are not magically simple just because the word observer appears in the design. Delivery timing changes correctness, latency, and user experience. A synchronous observer may be appropriate for a required audit write or a derived state update that must happen before returning success. An asynchronous observer is often better for analytics, email, or enrichment that can lag slightly behind.',
      'Calling out that distinction elevates the answer immediately. You are demonstrating that decoupling introduces operational choices, not only code-level neatness. Even in a browser-sized or in-memory example, stating which listeners are best-effort versus required tells the interviewer you understand that event-driven designs must define delivery semantics, not merely broadcast objects into the void.',
      [
        'State which observers are required and which are best-effort.',
        'Use synchronous listeners sparingly when they affect correctness.',
        'Prefer async delivery for optional, retryable side effects.',
        'Treat delivery timing as part of the design contract.'
      ],
      'Two listeners with different importance',
      `
def audit_listener(event):
    print(f"audit {event['id']}")


def analytics_listener(event):
    print(f"analytics {event['id']}")


if __name__ == "__main__":
    event = {"id": "ord-8"}
    audit_listener(event)
    analytics_listener(event)
`
    ),
    section(
      'Make retryable observers idempotent',
      'As soon as an event or callback can be retried, observers need an idempotency story. An email sender might check whether a message key was already processed. A projection updater might skip work if the target view already reflects the event version. Without that discipline, duplicates become the hidden tax of every failure and retry path in the system.',
      'In interviews, idempotency is a strong follow-up answer because it shows you are thinking beyond the happy path. You do not need a full exactly-once messaging lecture. A simple statement that handlers record processed event ids or compute updates in an idempotent way is enough to show production awareness while keeping the LLD answer grounded.',
      [
        'Assume retries and duplicates can happen once delivery is decoupled.',
        'Record processed event ids or design updates to be naturally idempotent.',
        'Keep handler side effects safe to replay.',
        'Mention idempotency before the interviewer has to ask.'
      ],
      'An idempotent observer using event ids',
      `
class EmailHandler:
    def __init__(self):
        self.sent = set()

    def handle(self, event):
        if event["event_id"] in self.sent:
            return "skipped"
        self.sent.add(event["event_id"])
        return f"sent {event['booking_id']}"


if __name__ == "__main__":
    handler = EmailHandler()
    print(handler.handle({"event_id": "e-1", "booking_id": "b-1"}))
    print(handler.handle({"event_id": "e-1", "booking_id": "b-1"}))
`
    ),
    section(
      'Keep the happy path readable even after decoupling',
      'A great event-style design still lets a reviewer understand the primary flow in one pass. Reserve inventory, confirm the booking, save it, then publish booking.confirmed. If you need several pages of abstractions to explain that one sentence, the decoupling has likely gone too far for the interview setting. The whole point is to make new reactions easy to add without hiding the business path.',
      'That is why clear event names, small ports, and modest listener logic matter so much. They preserve the core narrative while leaving room for future integrations. When you present the design, focus first on the main domain transition and then list the attachable listeners. The interviewer should hear extensibility and restraint at the same time.',
      [
        'Keep the main flow explainable without traversing every listener.',
        'Use event names that describe facts in domain language.',
        'Keep handlers small and easy to reason about in isolation.',
        'Treat decoupling as a way to clarify the workflow, not obscure it.'
      ],
      'A short event-driven workflow summary',
      `
class WorkflowSummary:
    def __init__(self, steps):
        self.steps = steps

    def __str__(self):
        return " -> ".join(self.steps)


if __name__ == "__main__":
    print(WorkflowSummary(["confirm booking", "save booking", "publish booking.confirmed"]))
`
    )
  ],
  exercises: [
    codingExercise(
      'event-bus-listeners',
      'Add listeners to an event bus',
      'Implement publish() so a tiny EventBus invokes every subscribed handler for a named event.',
      `
class EventBus:
    def __init__(self):
        self.handlers = {}

    def subscribe(self, name, handler):
        self.handlers.setdefault(name, []).append(handler)

    def publish(self, name, payload):
        # TODO: call each subscribed handler with payload
        raise NotImplementedError


bus = EventBus()
bus.subscribe("order.created", lambda event: print(f"email {event['id']}"))
bus.subscribe("order.created", lambda event: print(f"analytics {event['id']}"))
bus.publish("order.created", {"id": "ord-3"})
`,
      `
class EventBus:
    def __init__(self):
        self.handlers = {}

    def subscribe(self, name, handler):
        self.handlers.setdefault(name, []).append(handler)

    def publish(self, name, payload):
        for handler in self.handlers.get(name, []):
            handler(payload)


bus = EventBus()
bus.subscribe("order.created", lambda event: print(f"email {event['id']}"))
bus.subscribe("order.created", lambda event: print(f"analytics {event['id']}"))
bus.publish("order.created", {"id": "ord-3"})
`,
      [
        'Use the event name as the lookup key into the subscriber map.',
        'Handlers should receive the payload exactly once per publish call.',
        'A missing event name should simply do nothing.'
      ],
      'email ord-3\nanalytics ord-3'
    ),
    designExercise(
      'booking-event-delivery',
      'Design booking event delivery',
      'Describe how a booking workflow should notify email, analytics, and search indexing listeners while keeping the core path understandable.',
      [
        'Which event names and payload fields would you make stable?',
        'Which listeners are required before the request can succeed?',
        'How would you make retryable listeners idempotent?',
        'Where would the port-and-adapter boundary sit for external systems?'
      ]
    )
  ],
  checklist: [
    'Can separate authoritative state changes from downstream reactions.',
    'Can define ports from the domain caller perspective.',
    'Can state synchronous versus asynchronous delivery expectations.',
    'Can mention idempotency and readability trade-offs in event-driven designs.'
  ],
  pitfalls: [
    'Letting observers secretly mutate the same core domain state behind the workflow.',
    'Using event vocabulary without saying anything about timing or failure behavior.',
    'Adding so many abstraction layers that the happy path becomes harder to explain.'
  ],
  interviewPrompts: [
    'How would you add notifications and analytics to a workflow without rewriting the core logic?',
    'When should an observer run synchronously instead of asynchronously?',
    'How does dependency inversion help keep LLD answers clean and testable?'
  ],
  related: ['message-queues', 'workflow-and-state-modeling', 'responsibilities-and-interfaces']
});

const repositoriesLesson = lesson({
  slug: 'repositories-caching-and-persistence-seams',
  title: 'Repositories, caching, and persistence seams',
  summary:
    'Design persistence boundaries around domain use cases, add caching without leaking storage detail, and keep the model testable while acknowledging real data constraints.',
  duration: '50-70 min',
  whyItMatters:
    'Persistence shapes object design even when interviews start in memory. Candidates who expose clean repository contracts and talk honestly about cache freshness, locking, and mapping show that their model could survive real storage requirements.',
  sections: [
    section(
      'Define repository methods around use cases, not generic CRUD',
      'A repository should expose operations the domain actually needs, such as get active booking by room, save reservation, reserve first compatible spot, or load invoice by id. Those methods preserve domain language and keep calling services from learning too much about storage layout. Generic CRUD methods often push filtering, consistency, and key knowledge back into business logic, which defeats the purpose of the boundary.',
      'This is especially visible in interviews when the happy path becomes noisy with persistence detail. A checkout service that calls findAll(), loops, filters, and then manually decides what to update is signaling that the repository abstraction is too weak. A stronger boundary keeps data access focused and lets the main workflow remain about business intent rather than about data plumbing.',
      [
        'Shape repository methods around real workflow needs.',
        'Keep data-access filtering logic out of business services when possible.',
        'Preserve domain language in repository method names.',
        'Do not hide important persistence constraints behind overly generic APIs.'
      ],
      'A use-case-shaped repository method',
      `
class ReservationRepository:
    def get_active_by_room(self, room_id):
        raise NotImplementedError


class InMemoryReservationRepository(ReservationRepository):
    def __init__(self):
        self.records = {"room-1": "res-1"}

    def get_active_by_room(self, room_id):
        return self.records.get(room_id)


if __name__ == "__main__":
    print(InMemoryReservationRepository().get_active_by_room("room-1"))
`
    ),
    section(
      'Keep mapping and storage detail near the adapter',
      'The domain should not need to know whether data lives in rows, documents, cache entries, or flat files. Mapping from domain concepts into those storage shapes belongs near the persistence adapter. That way the core model speaks in reservations, line items, and holds rather than in raw schema fragments and serialization quirks.',
      'This boundary is not about pretending persistence does not exist. It is about containing it. You can still discuss unique constraints, indexes, and row-level locking when relevant, but you do so from the repository edge instead of leaking those concerns into every service. The result is a model that stays readable while still sounding realistic about data-access costs and constraints.',
      [
        'Put serialization and schema-mapping logic near the adapter.',
        'Keep domain services free of low-level storage record shapes.',
        'Acknowledge real storage constraints without exposing them everywhere.',
        'Use repository boundaries to localize persistence churn.'
      ],
      'A tiny mapper at the persistence edge',
      `
class Reservation:
    def __init__(self, reservation_id, status):
        self.reservation_id = reservation_id
        self.status = status


def map_row_to_reservation(row):
    return Reservation(row["id"], row["status"])


if __name__ == "__main__":
    print(map_row_to_reservation({"id": "res-4", "status": "active"}).status)
`
    ),
    section(
      'Add caching where ownership of freshness stays explicit',
      'Caching can live behind a repository or a service boundary, but the important question is who owns freshness and invalidation. If callers think get_booking() always reflects the latest state while the repository quietly serves stale cache entries, the contract is lying. A strong answer names the trade-off: perhaps reads are allowed to be slightly stale, or perhaps writes must eagerly invalidate the entry for one key.',
      'In interviews, simple clarity beats advanced cache jargon. Saying that a read-heavy catalog can tolerate a short TTL while active seat inventory cannot is far more useful than dropping terms like write-back without tying them to the domain. Good cache design is really contract design: which reads may be stale, how invalidation happens, and whether callers need to know.',
      [
        'Name who owns cache invalidation and freshness guarantees.',
        'Use caching only where the access pattern justifies it.',
        'Do not make repository methods pretend stale reads are impossible if they are not.',
        'Differentiate between cacheable reference data and highly contested state.'
      ],
      'A cached repository decorator',
      `
class UserRepository:
    def get(self, user_id):
        raise NotImplementedError


class InMemoryUserRepository(UserRepository):
    def get(self, user_id):
        return {"id": user_id, "name": "Ava"}


class CachedUserRepository(UserRepository):
    def __init__(self, inner):
        self.inner = inner
        self.cache = {}

    def get(self, user_id):
        if user_id not in self.cache:
            self.cache[user_id] = self.inner.get(user_id)
        return self.cache[user_id]


if __name__ == "__main__":
    print(CachedUserRepository(InMemoryUserRepository()).get("u-1"))
`
    ),
    section(
      'Use fake repositories to keep core rules cheap to test',
      'One of the best signals that a repository boundary is clean is that you can replace it with a tiny in-memory fake for tests. The fake does not need to reproduce a whole database; it only needs to implement the use-case-shaped methods the workflow depends on. If building a fake is painful, the contract is probably leaking too much persistence detail or is too broad.',
      'This matters in machine coding because you often want one or two quick proof tests for the core rules. A fake repository lets you validate duplicate booking rejection, idempotent confirmation, or ticket lookup behavior without standing up real infrastructure. That keeps the feedback loop short and reinforces that the core model depends on capabilities, not on a specific database driver.',
      [
        'Design repository contracts small enough that fakes stay trivial.',
        'Use tests to validate business rules, not storage mechanics.',
        'Treat fake repositories as a sign that the seam is well-shaped.',
        'Avoid passing raw query fragments or storage-specific concepts through the boundary.'
      ],
      'A fake repository for one rule',
      `
class FakeOrderRepository:
    def __init__(self):
        self.saved = {}

    def save(self, order):
        self.saved[order["id"]] = order


if __name__ == "__main__":
    repo = FakeOrderRepository()
    repo.save({"id": "ord-5", "status": "created"})
    print(repo.saved["ord-5"]["status"])
`
    ),
    section(
      'Explain what changes first when scale or durability increases',
      'A thoughtful repository discussion becomes a bridge into future storage and scale questions. You can say that the in-memory repository becomes a durable adapter first, then contested operations gain transactions or locks, then read-heavy queries may get cached or projected differently. The domain method names survive even as the backing implementation evolves.',
      'That incremental story is stronger than pretending the initial model must already solve every distributed-data problem. It shows that you understand where persistence concerns enter the design and how the seam protects the rest of the object model from churn. The interviewer hears a pragmatic migration path instead of a fantasy abstraction that claims storage no longer matters.',
      [
        'Describe persistence evolution as adapter replacement, not full redesign.',
        'Point out which repository methods need transactions or locking first.',
        'Keep domain-facing contracts stable as storage changes underneath.',
        'Use repository seams as the bridge into scale follow-ups.'
      ],
      'A repository evolution note',
      `
class RepositoryPlan:
    def __init__(self, current, next_step):
        self.current = current
        self.next_step = next_step

    def describe(self):
        return f"{self.current} -> {self.next_step}"


if __name__ == "__main__":
    print(RepositoryPlan("in-memory repo", "durable transactional adapter").describe())
`
    )
  ],
  exercises: [
    codingExercise(
      'in-memory-repository',
      'Implement a tiny in-memory repository',
      'Complete save() and get() for an in-memory reservation repository so a service can persist and reload simple objects.',
      `
class ReservationRepository:
    def __init__(self):
        self.records = {}

    def save(self, reservation):
        # TODO: store by reservation["id"]
        raise NotImplementedError

    def get(self, reservation_id):
        # TODO: return the stored reservation
        raise NotImplementedError


repo = ReservationRepository()
repo.save({"id": "res-2", "status": "active"})
print(repo.get("res-2"))
`,
      `
class ReservationRepository:
    def __init__(self):
        self.records = {}

    def save(self, reservation):
        self.records[reservation["id"]] = reservation

    def get(self, reservation_id):
        return self.records[reservation_id]


repo = ReservationRepository()
repo.save({"id": "res-2", "status": "active"})
print(repo.get("res-2"))
`,
      [
        'Use the domain identifier as the key.',
        'Keep the interface use-case-shaped and small.',
        'Return the exact stored object for this simple exercise.'
      ],
      "{'id': 'res-2', 'status': 'active'}"
    ),
    designExercise(
      'cache-freshness-review',
      'Design cache freshness for a repository',
      'Describe where caching belongs for a read-heavy feature and how you would communicate freshness guarantees without lying to callers.',
      [
        'Which reads are safe to serve slightly stale?',
        'Who owns invalidation or TTL policy?',
        'Which high-contention operations should avoid cache-first behavior?',
        'How would the repository contract make freshness expectations clear?'
      ]
    )
  ],
  checklist: [
    'Can shape repository contracts around domain use cases.',
    'Can keep mapping and storage detail near adapters.',
    'Can discuss cache freshness and invalidation explicitly.',
    'Can explain how repository seams support tests and future persistence changes.'
  ],
  pitfalls: [
    'Using generic CRUD repositories that force business services to know storage too well.',
    'Hiding stale-read behavior behind method names that sound strongly consistent.',
    'Leaking cache keys, schema fragments, or query details into the core workflow.'
  ],
  interviewPrompts: [
    'How would you hide persistence detail in a reservation or ticketing design?',
    'Where should caching live in an LLD answer, and what contract should it preserve?',
    'What makes a repository seam clean rather than generic?'
  ],
  related: ['caching-layers', 'storage-selection', 'entities-value-objects-and-aggregates']
});

const machineCodingLesson = lesson({
  slug: 'machine-coding-skeleton-and-iteration',
  title: 'Machine-coding skeletons and incremental delivery',
  summary:
    'Open with a thin vertical slice, get a runnable happy path on screen fast, then introduce only the abstractions the first scenario needs and evolve the implementation in steps the interviewer can follow.',
  duration: '45-60 min',
  whyItMatters:
    'Machine-coding rounds reward sequencing as much as final design. In a 45-60 minute LLD round or a 60-90 minute machine-coding round, a candidate who gets one coherent happy path running and narrates the next seams usually scores better than one who starts with a giant architecture and runs out of time before behavior appears. A slightly messy but working demo beats an elegant incomplete design almost every time.',
  sections: [
    section(
      'Start with the smallest end-to-end slice that proves the model',
      'The first coding milestone should demonstrate one complete user journey, not every anticipated extension. If the prompt is parking lot, show enter, pay, and exit for one ticket. If it is a task board, show create task and move task between two statuses. This first slice proves the object boundaries and gives the interviewer something concrete to react to, which is why a running happy path is the highest-value early milestone.',
      'That approach also gives you immediate leverage during follow-ups. Once the happy path exists, you can point to exactly where pricing, persistence, concurrency, or notifications would attach. By contrast, if you start by building abstract scaffolding before any behavior runs, the interviewer cannot tell whether the model is actually coherent or merely aspirational. Evaluators usually prefer runnable proof over unfinished elegance.',
      [
        'Implement one complete happy path before optional features.',
        'Optimize for code that compiles or runs early, even if one refactor remains.',
        'Prefer concrete behavior over early generalized scaffolding.',
        'Use the first slice to validate class boundaries quickly.'
      ],
      'A minimal runnable parking lot slice',
      `
class ParkingLot:
    def enter(self, vehicle_id):
        return f"ticket-{vehicle_id}"

    def pay(self, ticket_id):
        return f"paid {ticket_id}"


if __name__ == "__main__":
    lot = ParkingLot()
    ticket = lot.enter("car-1")
    print(ticket, lot.pay(ticket))
`
    ),
    section(
      'Introduce classes in dependency order so the story stays readable',
      'When typing live, the order of implementation affects how comprehensible the answer feels. Start with the core model or request object, then add the service that orchestrates it, then attach seams for repositories or policies only when the current scenario needs them. If you split files, a practical package layout is models, services, and ports or adapters. In a single file, the same idea still helps: define the domain types first, then the workflow, then the outer seams.',
      'The benefit is not merely aesthetic. A good order reduces rework because each new class appears when its responsibility is already justified by the running scenario. The interviewer sees you discovering the model deliberately rather than dumping names on the screen and hoping they eventually fit together. That pacing reads as engineering judgment under time pressure and helps avoid a god class.',
      [
        'Introduce domain objects before the seams that support them.',
        'Use a simple models/services/ports layout when the prompt grows beyond one file.',
        'Add dependencies only when the current flow needs them.',
        'Keep the implementation order aligned with the story you are telling.',
        'Use dependency order to reduce premature abstraction.'
      ],
      'A core entity appears before its service',
      `
class Task:
    def __init__(self, task_id):
        self.task_id = task_id
        self.status = "todo"


class TaskBoard:
    def move_to_done(self, task):
        task.status = "done"


if __name__ == "__main__":
    task = Task("t-1")
    TaskBoard().move_to_done(task)
    print(task.status)
`
    ),
    section(
      'Narrate the next seam before you fully build it',
      'Strong machine-coding answers often include short statements like "I am keeping pricing as a direct method for the first slice, but if the interviewer adds premium tiers I would extract a policy next." That kind of narration gives the reviewer confidence that the current simplicity is intentional, not accidental. It also saves time because you can defer abstractions until they have a reason to exist.',
      'This is especially helpful when you know a follow-up is likely but do not want to front-load its complexity. You can leave a constructor parameter, a comment-level seam, or a clearly named helper method that would later become an interface or strategy. The code stays small now, yet the design story already has an obvious place to grow.',
      [
        'Call out likely seams before overbuilding them.',
        'Use names and constructor shapes that can grow naturally later.',
        'Keep deferred abstractions visible but lightweight.',
        'Signal intent so simplicity looks deliberate rather than naive.'
      ],
      'A visible but lightweight seam',
      `
class FeeCalculator:
    def total(self, minutes):
        return ((minutes + 59) // 60) * 4


class TicketService:
    def __init__(self, fee_calculator=None):
        self.fee_calculator = fee_calculator or FeeCalculator()


if __name__ == "__main__":
    print(TicketService().fee_calculator.total(61))
`
    ),
    section(
      'Refactor only after a working slice exists',
      'Live refactoring is safest when the behavior is already visible and the reason for extraction is obvious. Once the first scenario works, you can move pricing into a policy, wrap a repository, or split a method that has grown too broad. That sequence reassures the interviewer that you are improving structure without gambling the existing functionality away.',
      'Refactoring before anything works, on the other hand, often looks like thrashing. The reviewer cannot tell whether you are simplifying or just moving complexity around. In interviews, a small proven flow plus one thoughtful refactor is usually a stronger signal than three layers of abstractions that never produced a single end-to-end result.',
      [
        'Get a visible scenario working before extracting abstractions.',
        'Name the reason for each refactor in business terms.',
        'Prefer one or two meaningful extractions over many speculative ones.',
        'Use working behavior as your safety net while cleaning structure.'
      ],
      'A broad method ready for later extraction',
      `
class BillingService:
    def checkout(self, subtotal):
        tax = 5
        total = subtotal + tax
        return total


if __name__ == "__main__":
    print(BillingService().checkout(20))
`
    ),
    section(
      'Keep the implementation explainable after every milestone',
      'The best machine-coding cadence alternates between typing and brief explanation. After the first slice works, run a tiny main() driver or acceptance check, then summarize the classes, the invariant they protect, and the next extension point. After a refactor, explain what got simpler. This keeps the interviewer oriented and makes it clear that the design remains coherent as the code evolves.',
      'That habit also protects you from getting lost in detail. If you cannot explain the current state of the design in a few sentences, the structure is probably drifting. A quick summary acts like a manual checkpoint: the workflow still makes sense, the seams are justified, the demo still runs, and the next step is obvious. That combination is exactly what interviewers want to see in a time-boxed coding round.',
      [
        'Pause after milestones to summarize what now works.',
        'Keep a tiny main() or acceptance driver alive as you iterate.',
        'Re-state the invariant and the main workflow in plain language.',
        'Use explanations as checkpoints against design drift.'
      ],
      'A milestone summary object',
      `
class Milestone:
    def __init__(self, done, next_step):
        self.done = done
        self.next_step = next_step

    def summary(self):
        return f"done: {self.done}; next: {self.next_step}"


if __name__ == "__main__":
    print(Milestone("ticket issue and payment", "extract pricing policy if needed").summary())
`
    )
  ],
  exercises: [
    codingExercise(
      'first-slice-ticket-flow',
      'Build a first-slice ticket flow',
      'Complete a tiny ParkingLot so it can issue a ticket and mark it paid in the smallest end-to-end workflow.',
      `
class ParkingLot:
    def enter(self, vehicle_id):
        # TODO: return a ticket id string using the vehicle id
        raise NotImplementedError

    def pay(self, ticket_id):
        # TODO: return a string that marks the ticket paid
        raise NotImplementedError


lot = ParkingLot()
ticket = lot.enter("car-3")
print(ticket, lot.pay(ticket))
`,
      `
class ParkingLot:
    def enter(self, vehicle_id):
        return f"ticket-{vehicle_id}"

    def pay(self, ticket_id):
        return f"paid {ticket_id}"


lot = ParkingLot()
ticket = lot.enter("car-3")
print(ticket, lot.pay(ticket))
`,
      [
        'Keep the first version extremely small and runnable.',
        'Return data that proves both steps happened end to end.',
        'Do not add extra abstractions until the simple flow works.'
      ],
      'ticket-car-3 paid ticket-car-3',
      'beginner'
    ),
    designExercise(
      'machine-coding-roadmap',
      'Plan the first 15 minutes of a machine-coding round',
      'Sketch the order in which you would implement classes, seams, and tests for a small interview prompt.',
      [
        'What is the first end-to-end scenario you would make work?',
        'Which classes appear first because other code depends on them?',
        'What seam would you mention but defer until a follow-up?',
        'When would you stop typing to summarize the current design?'
      ]
    )
  ],
  checklist: [
    'Can pick one thin vertical slice as the first implementation milestone.',
    'Can get a runnable happy path working early in a 45-60 or 60-90 minute round.',
    'Can introduce classes in an order that matches the design story and keeps the model free of a god class.',
    'Can defer seams deliberately without losing extensibility.',
    'Can explain the design clearly after each coding milestone.'
  ],
  pitfalls: [
    'Trying to code every predicted follow-up before one scenario works.',
    'Creating elaborate abstractions before any behavior is visible.',
    'Refactoring repeatedly without first proving the basic happy path.',
    'Ending with elegant scaffolding but no running demo of the main workflow.'
  ],
  interviewPrompts: [
    'What do you code first in a 45-minute LLD round versus a 90-minute machine-coding round?',
    'How do you show extensibility without burning time on abstractions before the happy path runs?',
    'What should live in models, services, and ports if the code grows past one file?'
  ],
  related: ['problem-framing', 'responsibilities-and-interfaces', 'testing-seams-and-refactoring']
});

const testingLesson = lesson({
  slug: 'testing-seams-and-refactoring',
  title: 'Testing seams, refactoring, and interview-safe cleanup',
  summary:
    'Carve out the smallest seams that enable deterministic tests, prefer cheap fakes over heavy mocks, refactor only after behavior is visible, and leave the code cleaner without derailing the round.',
  duration: '50-70 min',
  whyItMatters:
    'A machine-coding solution becomes credible when you can prove the important rules quickly and clean up the riskiest duplication without losing momentum. Testing seams and safe refactors show the interviewer that you can protect correctness while still improving structure under pressure, and in current interviews that usually means tiny fakes for clocks, ids, repositories, and side effects rather than elaborate mock setups.',
  sections: [
    section(
      'Test the business rule, not every line of plumbing',
      'The highest-value interview tests target the rule that would hurt most if it broke: duplicate reservation rejection, invalid state transition protection, pricing correctness, or ticket release after exit. Writing five tests for trivial getters wastes time and says little about design quality. Focus instead on the invariants that justify your object boundaries in the first place, and be willing to show those checks in main() if a full framework setup would waste the round.',
      'This selective testing strategy is also what makes a small seam worthwhile. If a fake repository or fake clock lets you test expiration logic in ten lines, the seam paid for itself. If your tests mostly restate that a constructor stores its fields, the design is probably leaning on tests as decoration rather than as evidence of correctness. Interviewers usually prefer a few explicit, runnable acceptance checks over sophisticated but low-signal mock expectations.',
      [
        'Write tests around invariants and transition rules first.',
        'Prefer high-signal examples over many low-value checks.',
        'Use seams only when they shorten the path to meaningful feedback.',
        'Treat tests as proof of design safety, not as ceremony.'
      ],
      'A simple assertion around a core rule',
      `
class Ticket:
    def __init__(self):
        self.status = "issued"

    def pay(self):
        self.status = "paid"


if __name__ == "__main__":
    ticket = Ticket()
    ticket.pay()
    print(ticket.status == "paid")
`
    ),
    section(
      'Wrap time, ids, storage, and side effects behind tiny seams',
      'Certain collaborators make deterministic testing awkward: clocks, id generators, repositories, email senders, payment clients, and random allocation helpers. Wrapping them behind tiny capabilities makes tests stable and keeps the core workflow free of hidden global state. The seam should stay as small as the business rule allows so that fakes remain obvious and cheap, and the first seams to reach for are usually clock, id, repository, and notifier.',
      'The word tiny is important. An interview-safe seam might expose now(), next_id(), send(), or save(). Once the interface starts mirroring an entire SDK or framework object, the abstraction is probably too broad. Small seams keep the design understandable and make the proof test look like an example of business logic, not a test harness for infrastructure plumbing. They also make fake implementations faster to write than configuring a heavy mock library.',
      [
        'Wrap only the collaborators that block deterministic feedback.',
        'Keep fake-friendly interfaces extremely small.',
        'Avoid global state when a seam can make behavior explicit.',
        'Use seam names that reflect capabilities, not frameworks.'
      ],
      'A clock seam for deterministic expiry tests',
      `
class FixedClock:
    def now(self):
        return 100


class Hold:
    def __init__(self, expires_at):
        self.expires_at = expires_at

    def expired(self, clock):
        return clock.now() >= self.expires_at


if __name__ == "__main__":
    print(Hold(90).expired(FixedClock()))
`
    ),
    section(
      'Refactor toward a clearer responsibility, not toward prettier code',
      'A live refactor is safest when you can name the exact responsibility that wants out of the current method. If checkout() both computes fees and updates order state, fee calculation wants its own policy or helper. If a repository method serializes too much domain knowledge, mapping wants to move to the adapter edge. The refactor should reduce conceptual load, not just rearrange lines.',
      'This is a powerful interview signal because it shows you see structure, not only syntax. You are improving the model in response to pressure revealed by working code. That story is much stronger than a generic "let me clean this up" moment, because the interviewer can connect the refactor directly to future extensibility or simpler tests.',
      [
        'Extract based on responsibility pressure, not cosmetic discomfort.',
        'Wait until the broad method proves what wants to separate.',
        'Name the extracted piece in domain language.',
        'Use the refactor to make future follow-ups cheaper.'
      ],
      'A fee rule extracted from a broad method',
      `
class FeePolicy:
    def total(self, minutes):
        return ((minutes + 59) // 60) * 4


if __name__ == "__main__":
    print(FeePolicy().total(61))
`
    ),
    section(
      'Keep cleanup interview-safe by avoiding big rewrites',
      'Interview cleanup should tighten the current design, not restart it. Renaming vague methods, extracting one policy, introducing a notifier seam, or turning a tuple into a value object are usually safe. Replacing the entire object model with a new hierarchy halfway through is rarely safe because it burns time, breaks the narrative, and resets reviewer confidence.',
      'Safe cleanup also means preserving behavior while you improve clarity. If you can point to the existing example or test and show it still passes after the refactor, the interviewer sees disciplined engineering rather than improvisation. That matters because many candidates know how to critique code but fewer can improve it in controlled, confidence-preserving steps.',
      [
        'Prefer one-step extractions and renames over architectural restarts.',
        'Use existing examples or tests as guardrails during cleanup.',
        'Preserve the visible happy path while structure improves.',
        'Stop refactoring once the design becomes clear enough to defend.'
      ],
      'A safe rename keeps behavior identical',
      `
class ReservationService:
    def reserve(self, reservation_id):
        return f"reserved {reservation_id}"


if __name__ == "__main__":
    print(ReservationService().reserve("res-5"))
`
    ),
    section(
      'Talk openly about what you would polish next if time allowed',
      'A mature interview answer admits that not every cleanup fits inside the round. You might say that you would next add a fake repository test, split a broad workflow into two commands, or introduce a result object for richer errors if more time remained. If the interviewer asks how you would prove the current code works, it is perfectly acceptable to show a tiny main() driver or acceptance harness that exercises the core path right now.',
      'The trick is to keep the current design defensible before mentioning future polish. If the present code is still shaky, talking about hypothetical cleanup feels evasive. But once the core path works and the main responsibilities are clear, a short note about next improvements signals good engineering instincts and an ability to prioritize under a time box.',
      [
        'Mention deferred cleanup only after the current design is solid.',
        'Tie future polish to a concrete pressure you already observed.',
        'Use deferred improvements to show prioritization, not apology.',
        'Keep the current code defensible even without the next refactor.'
      ],
      'A note about the next cleanup step',
      `
class CleanupPlan:
    def __init__(self, next_step):
        self.next_step = next_step

    def speak(self):
        return f"next cleanup: {self.next_step}"


if __name__ == "__main__":
    print(CleanupPlan("extract repository seam after the happy path is tested").speak())
`
    )
  ],
  exercises: [
    codingExercise(
      'fake-clock-expiry',
      'Test expiry with a fake clock',
      'Implement expired() so a Hold can be checked deterministically against an injected clock object.',
      `
class FixedClock:
    def __init__(self, now_value):
        self.now_value = now_value

    def now(self):
        return self.now_value


class Hold:
    def __init__(self, expires_at):
        self.expires_at = expires_at

    def expired(self, clock):
        # TODO: compare clock.now() with expires_at
        raise NotImplementedError


print(Hold(10).expired(FixedClock(12)))
`,
      `
class FixedClock:
    def __init__(self, now_value):
        self.now_value = now_value

    def now(self):
        return self.now_value


class Hold:
    def __init__(self, expires_at):
        self.expires_at = expires_at

    def expired(self, clock):
        return clock.now() >= self.expires_at


print(Hold(10).expired(FixedClock(12)))
`,
      [
        'The seam is the clock object, not global time.',
        'expired() should stay deterministic for tests.',
        'Return a boolean directly for this tiny rule.'
      ],
      'True'
    ),
    designExercise(
      'live-refactor-plan',
      'Plan a safe live refactor',
      'Describe one safe refactor you would perform after the first happy path works in a machine-coding round.',
      [
        'What design pressure has become obvious from the working code?',
        'Which smallest extraction or rename would reduce that pressure?',
        'How would you prove behavior still works after the refactor?',
        'What refactor would you explicitly avoid because it is too risky mid-round?'
      ]
    )
  ],
  checklist: [
    'Can target tests at the most important business rules first.',
    'Can create tiny seams for clocks, ids, repositories, and side effects.',
    'Can refactor in response to responsibility pressure after behavior is visible.',
    'Can prove the happy path with a tiny demo or acceptance check before polishing structure.'
  ],
  pitfalls: [
    'Writing many low-signal tests while leaving important invariants unproven.',
    'Creating wide interfaces that mirror infrastructure instead of exposing tiny capabilities.',
    'Relying on heavy mocks when a fake clock or fake repo would make the test simpler.',
    'Attempting a broad redesign during cleanup and losing the working flow.'
  ],
  interviewPrompts: [
    'Which seams matter most in a machine-coding interview, and why are clock/id/repo seams usually enough?',
    'What is a safe refactor to perform live once the first slice works?',
    'How would you prove the design with a tiny main() demo if formal tests are too heavy for the round?'
  ],
  related: ['responsibilities-and-interfaces', 'machine-coding-skeleton-and-iteration', 'repositories-caching-and-persistence-seams']
});

const concurrencyLesson = lesson({
  slug: 'concurrency-followups-and-scale-bridges',
  title: 'Concurrency follow-ups and bridging into scale',
  summary:
    'Answer thread-safety and scale follow-ups by naming shared mutable state, protecting the smallest critical invariant with local coordination first, and showing how the local design evolves toward durable coordination only when the interviewer asks for the HLD bridge.',
  duration: '50-70 min',
  whyItMatters:
    'Strong LLD answers do not stop at the single-threaded happy path. Interviewers often pivot to races, hot state, durability, and distribution, and the best answers extend the current model incrementally instead of throwing it away. In a single-process design, the first answer is usually a local lock, atomic repository command, or transaction. Redis, distributed rate limiting, or shared caches belong in the next bridge only after the hotspot is clear.',
  sections: [
    section(
      'Identify the exact shared mutable state before naming a lock',
      'Concurrency answers get fuzzy when candidates say they would "make it thread-safe" without identifying what can race. The right first move is to name the hotspot precisely: the available-spot list, the active-seat map, the token bucket counter, or the next id sequence. Once the contested state is visible, the coordination strategy becomes much easier to justify.',
      'This precision matters because not all objects need protection and not all protection looks the same. Some state should be locked, some partitioned, some copied immutably, and some moved into a transactional database. Interviewers trust your answer more when the protection matches the actual race rather than sounding like a blanket call for synchronized everywhere.',
      [
        'Name the exact mutable structure that concurrent callers could corrupt.',
        'Choose protection that matches the shape of contention.',
        'Avoid claiming thread safety in the abstract.',
        'Treat hotspot identification as the first concurrency design step.'
      ],
      'A shared counter as the hotspot',
      `
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1
        return self.value


if __name__ == "__main__":
    counter = Counter()
    print(counter.increment())
`
    ),
    section(
      'Protect the smallest invariant-bearing critical section',
      'Locks should surround the smallest piece of code that must remain atomic for the invariant to hold. In a parking lot, that may be find-and-reserve-spot together. In a reservation system, it may be checking availability and inserting the active hold in one operation. Narrow critical sections reduce contention and make the intent of the coordination boundary much easier to explain.',
      'This also keeps the design closer to the original LLD story. You are not replacing the whole model with concurrency jargon. You are saying that one specific repository or aggregate command now needs atomicity because it protects one specific rule. That preserves the local object design while acknowledging the race that appears once multiple callers arrive at the same time.',
      [
        'Lock the invariant-bearing operation, not the whole subsystem by default.',
        'Keep the critical section narrow enough to explain clearly.',
        'Tie the lock or transaction directly to the protected rule.',
        'Prefer atomic repository or aggregate commands over scattered locks.'
      ],
      'Atomic reservation with a lock',
      `
from threading import Lock


class SpotPool:
    def __init__(self):
        self.available = ["A1"]
        self.lock = Lock()

    def reserve_one(self):
        with self.lock:
            if not self.available:
                raise ValueError("lot full")
            return self.available.pop(0)


if __name__ == "__main__":
    print(SpotPool().reserve_one())
`
    ),
    section(
      'Use partitioning or immutable data when locking is not the best fit',
      'Not every concurrency follow-up wants a single big lock. Counters may shard by user or resource id. Configuration data may become immutable snapshots. Append-only logs may serialize naturally without locking each read. Mentioning these alternatives shows that you understand concurrency as data-shape design, not only as mutex vocabulary.',
      'This is a useful interview bridge because it hints at how local object boundaries interact with throughput. If your rate limiter already keys counters by user, partitioning the state later becomes a natural extension. If your read-mostly metadata is already modeled as value objects, immutable snapshots become easy to reason about. Good object design often makes concurrency adaptation easier.',
      [
        'Consider partitioning when contention clusters by key.',
        'Use immutable snapshots for read-mostly shared data.',
        'Match the concurrency tactic to access patterns, not fashion.',
        'Connect concurrency choices back to earlier domain modeling decisions.'
      ],
      'A sharded counter by key',
      `
class ShardedCounter:
    def __init__(self):
        self.shards = {}

    def increment(self, key):
        self.shards[key] = self.shards.get(key, 0) + 1
        return self.shards[key]


if __name__ == "__main__":
    counter = ShardedCounter()
    print(counter.increment("user-1"))
`
    ),
    section(
      'Bridge local object design into durable coordination incrementally',
      'Scale follow-ups usually ask what changes when one process is no longer enough. A good answer keeps the domain model mostly intact and replaces the supporting boundaries: in-memory repositories become durable stores, local locks become database transactions or distributed coordination, and synchronous callbacks may become queues. The entity methods and use-case language often survive that migration.',
      'This incremental bridge is much stronger than jumping straight from class design to a full distributed architecture diagram. It demonstrates that you know which parts are still local business logic and which parts cross a process boundary once the system scales. For hot-path prompts such as rate limiting or shared seat inventory, say the local answer first, then name Redis atomic counters, a shared cache, or per-key distributed coordination only as the next HLD handoff.',
      [
        'Keep entity behavior stable while infrastructure boundaries evolve.',
        'Replace in-memory seams with durable adapters one step at a time.',
        'Name where transactions, queues, or distributed locks first become necessary.',
        'Use the current design as the foundation for the scale story.'
      ],
      'A scale bridge described as seam replacement',
      `
class ScaleBridge:
    def __init__(self, current, future):
        self.current = current
        self.future = future

    def explain(self):
        return f"{self.current} becomes {self.future}"


if __name__ == "__main__":
    print(ScaleBridge("in-memory reservation repo", "transactional database adapter").explain())
`
    ),
    section(
      'Answer follow-ups incrementally instead of redesigning from scratch',
      'The interviewer usually wants to see whether your original model has a believable next step, not whether you can abandon it dramatically. A strong concurrency answer says which method now needs atomicity, which state gets partitioned, or which side effect moves behind a queue. The design grows one seam at a time while preserving the baseline entity and workflow story.',
      'That incremental tone is persuasive because it mirrors real engineering. Systems rarely leap from a whiteboard object model to a perfect planet-scale architecture overnight. They evolve around hotspots. When your answer sounds like that reality, the interviewer is far more likely to believe that the class design you wrote is not just a toy but a reasonable starting point.',
      [
        'Extend the existing model at the hotspot instead of restarting from zero.',
        'Name the first scale or concurrency seam that changes.',
        'Preserve the original domain story while adapting coordination.',
        'Use hotspot-driven evolution as the organizing principle.'
      ],
      'A follow-up answer summarized in one line',
      `
class FollowUpAnswer:
    def __init__(self, hotspot, change):
        self.hotspot = hotspot
        self.change = change

    def speak(self):
        return f"protect {self.hotspot} by {self.change}"


if __name__ == "__main__":
    print(FollowUpAnswer("active seat allocation", "making reserve() transactional").speak())
`
    )
  ],
  exercises: [
    codingExercise(
      'thread-safe-counter',
      'Protect a shared counter with a lock',
      'Implement increment() so a Counter updates its value inside a lock-protected critical section.',
      `
from threading import Lock


class Counter:
    def __init__(self):
        self.value = 0
        self.lock = Lock()

    def increment(self):
        # TODO: protect the update with self.lock
        raise NotImplementedError


counter = Counter()
print(counter.increment())
`,
      `
from threading import Lock


class Counter:
    def __init__(self):
        self.value = 0
        self.lock = Lock()

    def increment(self):
        with self.lock:
            self.value += 1
            return self.value


counter = Counter()
print(counter.increment())
`,
      [
        'Use the lock only around the mutation that must be atomic.',
        'Return the new value from inside the critical section.',
        'Keep the example focused on one shared mutable field.'
      ],
      '1'
    ),
    designExercise(
      'reservation-race-followup',
      'Handle a double-booking race',
      'Describe how you would answer a follow-up about two users trying to reserve the same unit at the same time.',
      [
        'Which exact state or method becomes the contention hotspot?',
        'Would you protect it with a lock, transaction, partition, or something else?',
        'What changes first when the design moves from one process to many?',
        'How would you extend the current model instead of replacing it entirely?'
      ]
    )
  ],
  checklist: [
    'Can identify the exact shared mutable state behind a concurrency risk.',
    'Can protect the smallest critical section that preserves the invariant with a local lock or transaction first.',
    'Can discuss partitioning or immutability when locking is not ideal.',
    'Can bridge the object design incrementally into durable or distributed coordination without jumping straight into HLD.'
  ],
  pitfalls: [
    'Claiming thread safety without naming the contested state or invariant.',
    'Locking too broadly and obscuring which operation truly needs atomicity.',
    'Jumping straight to Redis, load balancers, or planet-scale diagrams without first solving the local race in the current model.'
  ],
  interviewPrompts: [
    'How would you answer a thread-safety follow-up on an in-memory reservation or parking design before talking about distributed systems?',
    'When would you mention Redis or a shared cache for a hot path such as rate limiting, and when is that still premature?',
    'How do you bridge a machine-coding answer into higher-level scale discussion?'
  ],
  related: ['consistent-hashing', 'message-queues', 'repositories-caching-and-persistence-seams']
});

export const rawLowLevelModules = [
  {
    slug: 'lld-foundations',
    title: 'LLD foundations and prompt framing',
    summary:
      'Learn how to spend the first 5-10 minutes framing an object-design prompt, assign clear ownership, and keep local object design separate from premature HLD digressions.',
    objectives: [
      'Clarify version-one scope, functional requirements, invariants, and explicit non-goals before drawing classes',
      'Assign responsibilities and interfaces so the core workflow stays readable and testable',
      'Model validation, errors, and state transitions as first-class parts of the design'
    ],
    lessons: [promptFramingLesson, responsibilitiesLesson, validationStateLesson]
  },
  {
    slug: 'lld-modeling',
    title: 'Object modeling and domain relationships',
    summary:
      'Practice distinguishing entities from values, choosing the right reuse mechanism, and separating state ownership from workflow coordination.',
    objectives: [
      'Separate identity-bearing entities from immutable descriptive values',
      'Choose composition, inheritance, or simple conditionals based on actual behavioral change',
      'Keep workflow orchestration explicit while domain objects own legal transitions'
    ],
    lessons: [entitiesLesson, compositionLesson, workflowLesson]
  },
  {
    slug: 'lld-extensibility',
    title: 'Extensibility and common LLD patterns',
    summary:
      'Use a small set of extensibility tools with judgment so new policies, integrations, and ports/adapters fit without hiding the happy path.',
    objectives: [
      'Apply Strategy, Factory, and Builder only when the design has a real axis of change, and reject Singleton when DI is cleaner',
      'Use observer-style decoupling and dependency inversion to isolate side effects behind thin ports and adapters',
      'Design repository and cache seams that preserve domain clarity while acknowledging persistence reality'
    ],
    lessons: [patternsLesson, observerLesson, repositoriesLesson]
  },
  {
    slug: 'lld-machine-coding',
    title: 'Machine coding, testing, and follow-up handling',
    summary:
      'Rehearse how to code a coherent running first slice quickly, prove important rules with small seams, and answer concurrency or scale follow-ups without restarting the design.',
    objectives: [
      'Deliver a thin vertical slice first, get the happy path running, and evolve it in a reviewer-friendly order',
      'Use tiny fake-friendly seams and safe refactors to protect correctness during live coding',
      'Extend the baseline object model into concurrency and scale discussions incrementally instead of jumping straight to HLD'
    ],
    lessons: [machineCodingLesson, testingLesson, concurrencyLesson]
  }
];
