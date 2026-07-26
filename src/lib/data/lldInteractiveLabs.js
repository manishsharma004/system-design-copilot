function caseStudy({ title, prompt, steps, metrics }) {
  return {
    title,
    prompt,
    context: prompt,
    steps: steps.map((step, index) => ({
      title: step.title,
      detail: step.detail,
      phase: `${index + 1}. ${step.title}`,
      decision: step.title,
      why: step.detail,
      whatIf: step.whatIf ?? 'Skipping this step makes the design harder to defend because the trade-off stays implicit.'
    })),
    metrics: metrics ?? []
  };
}

/** @type {Record<string, any>} */
export const lldCoreInteractive = {
  'lld-foundations/lld-problem-framing': {
    title: 'LLD prompt framing and scope control',
    summary:
      'Turn vague machine-coding prompts into bounded object designs by starting from the core use case, the invariants, and the first version you can defend clearly.',
    takeaways: [
      'Spend 5-10 minutes framing the first user flow before drawing classes.',
      'Write down invariants, deferred follow-ups, and explicit non-goals so object boundaries have a reason to exist.',
      'Keep LLD framing anchored on a runnable happy path instead of drifting into load balancers or speculative abstractions.'
    ],
    examples: [
      {
        id: 'meeting-scheduler',
        label: 'Meeting scheduler',
        title: 'Start with booking rules before sketching room and calendar types',
        scenario:
          'A scheduler must create one-off meetings, reject overlaps for a room, and allow basic cancel or reschedule operations.',
        decision: 'Anchor the discussion on the book-room flow, then list overlap, ownership, and time-range invariants before naming classes.',
        why: [
          'The booking rule explains why Meeting, TimeRange, and RoomCalendar deserve distinct responsibilities.',
          'Scope control keeps reminders, recurring meetings, and video links out of the first pass.',
          'Interviewers can follow the design because each class answers one explicit requirement.'
        ],
        alternative:
          'Jumping straight to a large UML-style diagram often creates classes for every noun without proving which ones own real behavior.',
        outcome:
          'The design begins with one defensible vertical slice and leaves obvious hooks for recurrence or notifications later.'
      },
      {
        id: 'wallet-transfer',
        label: 'Wallet transfer',
        title: 'List balance and idempotency rules before adding services',
        scenario:
          'A digital wallet must transfer funds between users, prevent negative balances, and avoid duplicate transfer creation from client retries.',
        decision: 'Name the money movement invariants first, then decide which objects own balance checks, transfer state, and retry identity.',
        why: [
          'Money movement is easier to model when the invariant is explicit: one transfer either commits once or fails cleanly.',
          'The prompt naturally reveals where a value object like Money reduces ambiguity.',
          'You avoid inventing notification or reporting classes before the transfer behavior is safe.'
        ],
        alternative:
          'Starting with repositories, controllers, and DTOs hides the real question of which object protects balance correctness.',
        outcome:
          'The resulting model stays centered on domain safety instead of framework ceremony.'
      }
    ],
    decisionGuide: {
      prompt: 'How should you frame the first few minutes of an LLD prompt?',
      options: [
        {
          id: 'user-flow',
          label: 'Time-box the core user flow first',
          bestFor: 'Prompts where one command or happy path clearly dominates the first version.',
          chooseWhen: [
            'The interviewer asks for a machine-coding skeleton or concrete APIs quickly.',
            'One primary action reveals most domain objects naturally.',
            'You want to prove progress fast without over-abstracting.'
          ],
          tradeOffs: [
            'You can miss hidden invariants if you only narrate screens or steps.',
            'Secondary workflows may look like afterthoughts unless you call them out explicitly.',
            'This style needs a quick checkpoint where you summarize postponed scope.'
          ],
          alternativeOutcome:
            'If you begin with generic class names instead, the design sounds abstract before it sounds useful.'
        },
        {
          id: 'invariants-first',
          label: 'Lead with invariants and failure rules',
          bestFor: 'Booking, payment, inventory, or workflow prompts where invalid state is the main risk.',
          chooseWhen: [
            'The prompt contains words like unique, cannot, once, or only when.',
            'Correctness matters more than UI surface area.',
            'You expect state modeling or validation follow-ups.'
          ],
          tradeOffs: [
            'It can feel slower if you do not tie the rules back to a visible user flow.',
            'Too many rules at once can overwhelm the whiteboard.',
            'You still need to show how the rules map onto methods and classes.'
          ],
          alternativeOutcome:
            'Ignoring invariants early often leads to a class diagram that must be reworked once edge cases appear.'
        },
        {
          id: 'followup-aware',
          label: 'State the first version and park follow-ups',
          bestFor: 'Broad prompts with many tempting extensions such as payments, notifications, and analytics.',
          chooseWhen: [
            'You need to show judgment about what is intentionally excluded.',
            'The prompt has many optional features that could explode the class count.',
            'The interviewer is likely to add new requirements incrementally.'
          ],
          tradeOffs: [
            'If overused, this can sound like you are dodging complexity.',
            'You must still explain one concrete extension seam.',
            'Parked items need to be named clearly or they sound forgotten.'
          ],
          alternativeOutcome:
            'Without explicit scope boundaries, the first pass often grows into a brittle half-built system.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Frame a locker-management machine-coding prompt',
      prompt:
        'You are asked to design a smart locker system that stores packages, assigns pickup codes, and supports pickup plus expiration handling.',
      steps: [
        {
          title: 'Choose the first user journey',
          detail: 'Start with store-package and pickup-package as the minimum end-to-end flows that justify the object model.',
          whatIf: 'If you treat admin dashboards and analytics as part of version one, the design gets busy before the core lifecycle is clear.'
        },
        {
          title: 'Write the non-negotiable invariants',
          detail: 'State that one locker can hold one active package, pickup codes must be validated, and expired packages cannot be collected normally.',
          whatIf: 'Without explicit invariants, every later method decides rules independently and the interview answer loses coherence.'
        },
        {
          title: 'Promote only behavior-rich concepts',
          detail: 'Model Locker, PackageAssignment, PickupCode, and LockerService first; keep future concerns like notification history outside the initial model.',
          whatIf: 'Turning every noun into a class makes the model wide but shallow.'
        },
        {
          title: 'Park likely follow-ups deliberately',
          detail: 'Call out where size-based allocation, resend-code notifications, or multiple locker banks would extend the design later.',
          whatIf: 'If follow-ups stay implicit, the interviewer may assume the design cannot absorb them.'
        }
      ],
      metrics: ['first-pass class count', 'unstated invariants discovered', 'follow-up seams identified', 'core flow implemented end to end']
    }),
    mermaid: {
      title: 'Prompt framing flow',
      caption: 'A strong first pass moves from user flow and invariants to a minimal object model instead of starting with speculative patterns.',
      code: `flowchart TD
    Prompt[Interview prompt] --> Flow[Name core user flow]
    Flow --> Rules[List invariants and failure rules]
    Rules --> Types[Choose behavior-rich objects]
    Types --> API[Sketch methods and responsibilities]
    API --> Parking[Park follow-up requirements]
      `
    }
  },
  'lld-foundations/responsibilities-and-interfaces': {
    title: 'Responsibilities, interfaces, and seams',
    summary:
      'Assign ownership to the right object, then introduce interfaces only where a collaboration is volatile, side-effecting, or essential for tests.',
    takeaways: [
      'Classes should own one coherent reason to change.',
      'Interfaces are seams around collaboration, not decoration for every type.',
      'Readable public APIs should reflect domain actions rather than technical plumbing.'
    ],
    examples: [
      {
        id: 'order-placement',
        label: 'Order placement',
        title: 'Keep order rules in the domain and side effects behind ports',
        scenario:
          'A food-delivery order flow validates a cart, applies a pricing policy, saves the order, and sends a confirmation message.',
        decision: 'Let Order and pricing policy own business rules, while repository and notifier interfaces isolate storage and outbound communication.',
        why: [
          'The model stays testable because order rules run without a real database or message vendor.',
          'A narrow notifier interface prevents the order service from learning transport details.',
          'Responsibilities stay legible: state transition in the domain, persistence and delivery in adapters.'
        ],
        alternative:
          'A single OrderService that validates, mutates, saves, and sends notifications grows into a god object quickly.',
        outcome:
          'The design supports focused tests and cleaner follow-up changes such as adding SMS or retry logic.'
      },
      {
        id: 'document-export',
        label: 'Document export',
        title: 'Use interfaces at the variability point, not around every helper',
        scenario:
          'A reporting tool exports documents as PDF today and may add CSV or HTML later while the report-building rules stay unchanged.',
        decision: 'Define one ExportRenderer interface and keep filtering, formatting, and template selection inside focused collaborators.',
        why: [
          'The export format is the true axis of change, so the seam belongs there.',
          'The report builder can depend on one contract instead of branching on file type.',
          'Test doubles for the renderer make the assembly logic easy to verify.'
        ],
        alternative:
          'Creating interfaces for every utility class makes the design harder to read without improving replaceability.',
        outcome:
          'The design stays simple today and still absorbs a new format cleanly.'
      }
    ],
    decisionGuide: {
      prompt: 'Where should a new responsibility live?',
      options: [
        {
          id: 'entity',
          label: 'Put it inside the entity or aggregate',
          bestFor: 'Rules that directly guard owned state and invariants.',
          chooseWhen: [
            'The behavior decides whether a state transition is legal.',
            'The method needs intimate knowledge of the object’s internal consistency.',
            'The rule would be duplicated if callers performed it externally.'
          ],
          tradeOffs: [
            'Entities can become heavy if they also orchestrate infrastructure.',
            'Pure calculation logic shared across aggregates may not belong here.',
            'You need good constructors or factory methods to keep the entity valid.'
          ],
          alternativeOutcome:
            'Leaving core invariant checks outside the entity usually creates duplicated guards and setter-driven bugs.'
        },
        {
          id: 'policy-service',
          label: 'Use a domain policy or service',
          bestFor: 'Rules that coordinate multiple objects or vary independently from one aggregate.',
          chooseWhen: [
            'The logic depends on several entities or value objects together.',
            'You expect multiple policy implementations such as pricing or allocation.',
            'Keeping the entity small improves readability.'
          ],
          tradeOffs: [
            'Overusing services can make the domain feel anemic.',
            'Ownership becomes fuzzy if the service starts mutating many objects directly.',
            'The service still needs clear input and output types.'
          ],
          alternativeOutcome:
            'Forcing all cross-object logic into one entity often produces awkward dependencies or broken encapsulation.'
        },
        {
          id: 'port',
          label: 'Hide it behind an interface or port',
          bestFor: 'Persistence, clock, ID generation, messaging, and other external side effects.',
          chooseWhen: [
            'The collaborator depends on infrastructure details that should not leak into the core model.',
            'Tests benefit from swapping in a fake or in-memory implementation.',
            'The adapter may change independently from the business rule.'
          ],
          tradeOffs: [
            'Too many ports can turn a small design into ceremony.',
            'Poorly named ports sound technical instead of domain-oriented.',
            'The composition root must still wire concrete implementations somewhere.'
          ],
          alternativeOutcome:
            'If the core workflow reaches into framework code directly, both tests and future migrations become harder.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Assign responsibilities in a return-processing feature',
      prompt:
        'A commerce app must request returns, validate eligibility, refund approved items, and send customer updates without turning the solution into one service class.',
      steps: [
        {
          title: 'Give the aggregate the invariant',
          detail: 'Let ReturnRequest own status changes such as requested, approved, rejected, and refunded.',
          whatIf: 'If callers mutate status fields directly, policy and lifecycle rules drift apart.'
        },
        {
          title: 'Extract variable policy',
          detail: 'Move eligibility and refund calculation into focused policy interfaces when rules vary by item class or customer tier.',
          whatIf: 'Hard-coding all policy branches in the aggregate makes extensions risky and obscures the lifecycle.'
        },
        {
          title: 'Isolate side effects behind ports',
          detail: 'Hide persistence, payment processing, and customer notification behind minimal interfaces shaped by the use case.',
          whatIf: 'When infrastructure code leaks into the domain workflow, tests become integration-heavy too early.'
        },
        {
          title: 'Name APIs in domain language',
          detail: 'Prefer methods such as requestReturn, approve, and issueRefund over generic verbs like process or handle.',
          whatIf: 'Generic method names make it hard to explain ownership and legal usage under interview pressure.'
        }
      ],
      metrics: ['classes with single clear reason to change', 'port count versus real variability points', 'unit tests without infrastructure', 'number of domain actions with explicit names']
    }),
    mermaid: {
      title: 'Responsibilities and seams',
      caption: 'The application flow coordinates the use case while the domain owns rules and ports isolate external effects.',
      code: `flowchart LR
    Caller[Caller] --> App[Use case service]
    App --> Aggregate[Domain aggregate]
    App --> Policy[Policy interface]
    App --> Repo[Repository port]
    App --> Notify[Notifier port]
    Policy --> Aggregate
      `
    }
  },
  'lld-foundations/validation-errors-and-state': {
    title: 'Validation, errors, and state transitions',
    summary:
      'Keep state changes safe by checking legal transitions up front, choosing one error style deliberately, and making partial success impossible unless it is modeled explicitly.',
    takeaways: [
      'Validation should live near the state it protects.',
      'Error handling needs a consistent story that callers can act on.',
      'Explicit states are easier to test than scattered booleans and setters.'
    ],
    examples: [
      {
        id: 'booking-lifecycle',
        label: 'Booking lifecycle',
        title: 'Use named transitions instead of mutable status strings',
        scenario:
          'A clinic appointment can be scheduled, checked in, completed, canceled, or marked no-show with different legal transitions.',
        decision: 'Represent the lifecycle explicitly and expose methods that validate transitions before mutating related fields.',
        why: [
          'A single transition point stops impossible moves such as canceling a completed visit.',
          'Related data like check-in time or cancellation reason changes together with the state.',
          'Tests can target the transition matrix instead of guessing at UI sequences.'
        ],
        alternative:
          'Public status setters and free-form flags let callers invent combinations the business would never allow.',
        outcome:
          'The lifecycle becomes a visible contract instead of a hidden convention.'
      },
      {
        id: 'coupon-redemption',
        label: 'Coupon redemption',
        title: 'Expose domain failures clearly when the caller can recover',
        scenario:
          'A checkout flow redeems coupons that may be expired, already used, minimum-basket restricted, or incompatible with other offers.',
        decision: 'Return domain-specific failure results for expected business rejections and reserve exceptions for broken assumptions or infrastructure faults.',
        why: [
          'The caller can show a useful message when the coupon fails a known business rule.',
          'Expected failures stay part of the API instead of being hidden in catch blocks.',
          'The design distinguishes user-correctable problems from programmer or system errors.'
        ],
        alternative:
          'Throwing the same exception shape for every rejection makes the checkout path harder to reason about and test.',
        outcome:
          'Validation logic remains explicit and callers know whether to retry, correct input, or abort.'
      }
    ],
    decisionGuide: {
      prompt: 'What validation and error strategy fits the rule?',
      options: [
        {
          id: 'result-object',
          label: 'Result object with domain failures',
          bestFor: 'Expected validation outcomes that the caller can present or recover from.',
          chooseWhen: [
            'Failure is part of normal business flow such as invalid coupon or illegal transition.',
            'The caller needs structured reasons, not just pass or fail.',
            'You want tests to assert outcomes without exception plumbing.'
          ],
          tradeOffs: [
            'APIs become noisier if every trivial helper returns a wrapper type.',
            'Callers must handle the result consistently instead of ignoring it.',
            'Nested results can be cumbersome if overapplied.'
          ],
          alternativeOutcome:
            'If expected rejections become exceptions, business rules look like crashes rather than deliberate outcomes.'
        },
        {
          id: 'domain-exception',
          label: 'Domain exception',
          bestFor: 'Cases where a command is fundamentally invalid and the caller should abort the current action immediately.',
          chooseWhen: [
            'The failure is rare and should short-circuit the workflow.',
            'The call stack would otherwise pass error plumbing through many layers.',
            'The team already has a disciplined exception-mapping strategy.'
          ],
          tradeOffs: [
            'Exceptions can hide expected control flow if used too broadly.',
            'Tests need to assert thrown behavior explicitly.',
            'Mixed exception and result styles become confusing quickly.'
          ],
          alternativeOutcome:
            'Using exceptions casually for business branches often turns happy-path code into nested rescue logic.'
        },
        {
          id: 'state-machine',
          label: 'Explicit state machine',
          bestFor: 'Objects with several lifecycle states and command-specific permissions.',
          chooseWhen: [
            'Different operations are legal in different states.',
            'The interviewer is likely to ask about transitions or edge cases.',
            'You want invalid movement to be impossible by construction.'
          ],
          tradeOffs: [
            'It can feel heavy for tiny two-state flags.',
            'Concurrent updates may still need version checks or locking.',
            'Transition tables require maintenance as states grow.'
          ],
          alternativeOutcome:
            'Scattered state checks across services and controllers usually rot into inconsistent behavior.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Model coupon redemption safely',
      prompt:
        'A coupon system must validate eligibility, prevent double use, and keep order totals consistent when a discount is applied or rejected.',
      steps: [
        {
          title: 'Name the legal states',
          detail: 'Model issued, reserved, redeemed, expired, and canceled explicitly so every command has a known starting point.',
          whatIf: 'If the coupon has only booleans such as used and active, illegal combinations appear quickly.'
        },
        {
          title: 'Validate before mutation',
          detail: 'Check expiration, basket minimum, compatibility, and ownership before changing totals or recording redemption.',
          whatIf: 'If totals update before validation completes, callers must repair inconsistent intermediate state.'
        },
        {
          title: 'Choose caller-visible failures',
          detail: 'Return structured reasons for expected rejections such as expired or already redeemed so checkout can respond clearly.',
          whatIf: 'If all failures collapse into a generic error, support and UX both lose useful context.'
        },
        {
          title: 'Group related updates',
          detail: 'Apply discount amount, redemption state, and audit metadata together through one aggregate method or transaction boundary.',
          whatIf: 'Split updates across unrelated setters and one field will eventually lag behind the others.'
        }
      ],
      metrics: ['invalid transition attempts', 'duplicate redemption prevention', 'caller-visible error specificity', 'state and total mismatch count']
    }),
    mermaid: {
      title: 'Validation before state mutation',
      caption: 'Commands should hit validation and transition guards before state is changed or failures are surfaced.',
      code: `flowchart TD
    Command[Command] --> Guard[Validate business rules]
    Guard -->|valid| Transition[Apply state transition]
    Guard -->|invalid| Failure[Return domain failure]
    Transition --> Persist[Persist updated object]
    Persist --> Success[Return success result]
      `
    }
  },
  'lld-modeling/entities-value-objects-and-aggregates': {
    title: 'Entities, value objects, and aggregates',
    summary:
      'Separate identity-bearing objects from descriptive values, then choose an aggregate boundary that protects the invariants that truly need atomic consistency.',
    takeaways: [
      'Identity belongs to objects tracked over time, not to every nested type.',
      'Immutable value objects sharpen validation and equality rules.',
      'Aggregate boundaries exist to defend invariants, not to mirror database tables.'
    ],
    examples: [
      {
        id: 'shopping-cart',
        label: 'Shopping cart',
        title: 'Treat Money and Quantity as values while Cart stays the aggregate root',
        scenario:
          'A shopping cart tracks line items, totals, discounts, and coupon application rules before checkout.',
        decision: 'Model Cart as the aggregate root, CartItem as part of its consistency boundary, and Money plus Quantity as validated value objects.',
        why: [
          'Cart identity matters across time while Money and Quantity are descriptive and comparable by value.',
          'Encapsulating line-item mutation inside Cart keeps totals and discount rules consistent.',
          'Value object validation stops invalid amounts or counts from spreading across methods.'
        ],
        alternative:
          'Treating every nested record as an entity leads to loose updates and confusing ownership of total recalculation.',
        outcome:
          'The model keeps arithmetic and invariants clean without inventing unnecessary IDs.'
      },
      {
        id: 'library-loan',
        label: 'Library loan',
        title: 'Use one aggregate where the checkout invariant truly lives',
        scenario:
          'A library system must ensure one physical copy cannot be loaned to multiple patrons at the same time.',
        decision: 'Let BookCopy own the availability invariant and create Loan as part of its controlled transition, while DueDate remains a value object.',
        why: [
          'The physical copy is the identity-bearing object whose state changes over time.',
          'A due date or fine amount is easier to validate and compare as a value.',
          'The aggregate boundary is motivated by one concrete consistency rule.'
        ],
        alternative:
          'If Loan and BookCopy mutate independently, the system can drift into copy-available and loan-active at the same time.',
        outcome:
          'The object model tells a clear story about who protects availability.'
      }
    ],
    decisionGuide: {
      prompt: 'How should this concept be modeled?',
      options: [
        {
          id: 'entity',
          label: 'Entity',
          bestFor: 'Concepts with stable identity, lifecycle, and behavior over time.',
          chooseWhen: [
            'Callers refer to the object across several operations.',
            'The object’s attributes may change while identity stays constant.',
            'Lifecycle state or audit history matters.'
          ],
          tradeOffs: [
            'Entities need clearer invariants and construction rules than passive data bags.',
            'Comparing entities by mutable fields is error-prone.',
            'Too many small entities can fracture ownership.'
          ],
          alternativeOutcome:
            'If you model an entity as plain mutable data, lifecycle rules often leak into surrounding services.'
        },
        {
          id: 'value-object',
          label: 'Value object',
          bestFor: 'Immutable validated concepts such as money, date ranges, coordinates, or addresses.',
          chooseWhen: [
            'Equality is based on content, not identity.',
            'The concept bundles a small set of fields that must stay valid together.',
            'Immutability simplifies reuse and testing.'
          ],
          tradeOffs: [
            'Too many tiny value objects can feel ceremonial for trivial data.',
            'Construction validation must remain lightweight and obvious.',
            'You still need a clear owner for when values change.'
          ],
          alternativeOutcome:
            'Leaving validated concepts as loose primitives invites duplication and inconsistent checks.'
        },
        {
          id: 'aggregate',
          label: 'Aggregate root and boundary',
          bestFor: 'State clusters that must change together to preserve a key invariant.',
          chooseWhen: [
            'One object should gate all mutating access to related internals.',
            'A business rule spans several nested parts that must remain consistent.',
            'You need a clear transactional boundary for commands.'
          ],
          tradeOffs: [
            'An oversized aggregate becomes a hotspot for unrelated updates.',
            'Nested internals need carefully limited exposure.',
            'Some cross-aggregate workflows still need coordination elsewhere.'
          ],
          alternativeOutcome:
            'If you skip the aggregate boundary, unrelated callers often start mutating child collections directly.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Model a library checkout domain',
      prompt:
        'A library must track patrons, physical book copies, loans, renewals, due dates, and fines while preventing double checkout of the same copy.',
      steps: [
        {
          title: 'Find the identities',
          detail: 'Keep Patron, BookCopy, and Loan as identity-bearing concepts because they persist and change over time.',
          whatIf: 'If every record is treated as anonymous data, lifecycle rules lose a stable home.'
        },
        {
          title: 'Promote descriptive values',
          detail: 'Use value objects such as DueDate, FineAmount, and maybe BookLocation to keep validation close to the fields.',
          whatIf: 'Primitive fields repeated everywhere encourage inconsistent comparisons and formatting.'
        },
        {
          title: 'Choose the checkout boundary',
          detail: 'Route checkout and return commands through the aggregate that protects copy availability and loan state together.',
          whatIf: 'If checkout updates are split across separate objects with no boundary, double-loan bugs become easier.'
        },
        {
          title: 'Expose read-only internals carefully',
          detail: 'Return snapshots or iterables instead of writable child collections so callers cannot bypass aggregate rules.',
          whatIf: 'Direct child mutation silently breaks total counts, statuses, or invariants.'
        }
      ],
      metrics: ['invalid nested mutation attempts', 'value-object validation reuse', 'aggregate size under mutation', 'copy availability mismatches']
    }),
    mermaid: {
      title: 'Aggregate with value objects',
      caption: 'The aggregate root owns state transitions while value objects keep descriptive concepts validated and immutable.',
      code: `flowchart LR
    Patron[Patron entity] --> Loan[Loan aggregate]
    Loan --> Copy[BookCopy entity]
    Loan --> Due[DueDate value]
    Loan --> Fine[FineAmount value]
    Loan --> Status[Loan status]
      `
    }
  },
  'lld-modeling/composition-vs-inheritance': {
    title: 'Composition, inheritance, and polymorphism',
    summary:
      'Reuse behavior intentionally by choosing composition for optional or independent variation, inheritance for real substitutability, and plain conditionals when abstraction would be heavier than the problem.',
    takeaways: [
      'Composition is the default when behavior varies independently.',
      'Inheritance only helps when subtypes honor the same behavioral contract.',
      'A small conditional is often cleaner than a premature abstraction.'
    ],
    examples: [
      {
        id: 'notifications',
        label: 'Notifications',
        title: 'Compose channel senders instead of growing a deep hierarchy',
        scenario:
          'A reminder system can send email, SMS, or push notifications and may later add user-specific retry or template strategies.',
        decision: 'Compose a notifier from a channel sender plus template and retry collaborators rather than building a deep BaseNotifier tree.',
        why: [
          'Channels, templates, and retry behavior vary on different timelines.',
          'Composition lets one policy change without disturbing the others.',
          'Tests can replace one collaborator at a time with a fake.'
        ],
        alternative:
          'A deep inheritance hierarchy hard-codes combinations such as RetryingSmsNotifier or LocalizedEmailNotifier and explodes as features multiply.',
        outcome:
          'The system extends by mixing focused collaborators instead of subclassing every feature combination.'
      },
      {
        id: 'game-pieces',
        label: 'Game pieces',
        title: 'Use inheritance only when callers can treat all pieces uniformly',
        scenario:
          'A board game engine stores pieces on a board and asks each piece for its legal moves based on position and board state.',
        decision: 'A base Piece abstraction with polymorphic legalMoves can work because each subtype honors the same semantic contract.',
        why: [
          'The board and move validator rely on one shared capability from every piece.',
          'Subtypes differ in move-generation behavior without changing the meaning of the API.',
          'This is true substitutability rather than convenience reuse.'
        ],
        alternative:
          'If subclasses start throwing unsupported-operation errors or need many special cases in callers, the inheritance contract is broken.',
        outcome:
          'Polymorphism clarifies behavior because the common contract is genuine.'
      }
    ],
    decisionGuide: {
      prompt: 'Which reuse technique best fits the variation?',
      options: [
        {
          id: 'composition',
          label: 'Composition',
          bestFor: 'Optional features, runtime policies, and behaviors that evolve independently.',
          chooseWhen: [
            'Different aspects of behavior can be mixed and matched.',
            'You want to swap one policy without replacing the whole object.',
            'Testability improves when collaborators are isolated.'
          ],
          tradeOffs: [
            'Too many tiny collaborators can make object construction noisy.',
            'The owning object still needs a clear orchestration role.',
            'Naming and dependency wiring matter more.'
          ],
          alternativeOutcome:
            'Using inheritance here usually creates brittle subclass combinations and hidden coupling.'
        },
        {
          id: 'inheritance',
          label: 'Inheritance',
          bestFor: 'Stable semantic contracts where subtypes can be used interchangeably by callers.',
          chooseWhen: [
            'Each subtype implements the same behavior meaningfully.',
            'The base abstraction is small, stable, and truly shared.',
            'Callers benefit from polymorphic dispatch instead of type checks.'
          ],
          tradeOffs: [
            'Base-class changes ripple to every subtype.',
            'Leaky hooks and protected fields can freeze the hierarchy.',
            'One bad subtype can violate the entire mental model.'
          ],
          alternativeOutcome:
            'If the hierarchy exists only to reuse a few methods, future changes become harder than a composed design.'
        },
        {
          id: 'conditional',
          label: 'Plain conditional or table',
          bestFor: 'Small closed sets of behavior where abstraction would add more ceremony than clarity.',
          chooseWhen: [
            'There are only one or two variants and they are unlikely to grow.',
            'The branching logic is short and easy to read in one place.',
            'No caller benefit exists from indirection or late binding.'
          ],
          tradeOffs: [
            'The branch can grow messy if new variants accumulate.',
            'Testing may become broader because all cases live in one method.',
            'A later transition to composition should be deliberate, not automatic.'
          ],
          alternativeOutcome:
            'Introducing strategy or inheritance too early can make the interview answer look memorized rather than judged.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Choose reuse for a coupon engine',
      prompt:
        'A checkout system supports flat discounts, percentage discounts, bundle offers, and an optional cap policy that may apply only in some regions.',
      steps: [
        {
          title: 'Separate the axes of change',
          detail: 'Distinguish discount calculation from optional caps, eligibility checks, and formatting so each concern can vary independently.',
          whatIf: 'If you treat all behavior as one hierarchy, a small policy change can force many subclasses.'
        },
        {
          title: 'Test the common contract',
          detail: 'Use inheritance only if every discount can answer the same calculation method without surprising callers.',
          whatIf: 'If one subtype needs caveats or unsupported paths, the base abstraction is probably wrong.'
        },
        {
          title: 'Prefer composition for optional policies',
          detail: 'Attach cap, eligibility, or rounding collaborators to the discount object instead of subclassing every combination.',
          whatIf: 'Combining features by subclass name quickly creates a combinatorial tree.'
        },
        {
          title: 'Admit when a branch is enough',
          detail: 'If the prompt only has two tiny discount variants, keep the implementation simple and explain when you would refactor later.',
          whatIf: 'Pattern cargo culting wastes time and hides the real business logic.'
        }
      ],
      metrics: ['subclass count', 'number of mixed feature combinations', 'caller type checks remaining', 'tests per variation point']
    }),
    mermaid: {
      title: 'Reuse choices',
      caption: 'Composition mixes policies, inheritance supports true polymorphism, and simple branches remain valid for tiny closed sets.',
      code: `flowchart TD
    Need[Need behavior reuse] --> Variable{Variation independent?}
    Variable -->|yes| Compose[Compose collaborators]
    Variable -->|no| Contract{Shared semantic contract?}
    Contract -->|yes| Inherit[Use inheritance carefully]
    Contract -->|no| Branch[Keep a simple conditional]
      `
    }
  },
  'lld-modeling/workflow-and-state-modeling': {
    title: 'Workflow orchestration and state modeling',
    summary:
      'Keep multi-step object behavior understandable by separating orchestration from domain ownership and making lifecycle transitions explicit.',
    takeaways: [
      'One clear entry point per command makes workflows explainable.',
      'Domain objects should still decide whether state changes are legal.',
      'Side effects attach more safely when the core lifecycle is explicit first.'
    ],
    examples: [
      {
        id: 'ride-request',
        label: 'Ride request',
        title: 'Use an orchestrator to coordinate the flow while the ride owns its state',
        scenario:
          'A ride-hailing flow creates a ride request, matches a driver, handles acceptance, cancellation, and trip completion.',
        decision: 'Let a RideService coordinate collaborators, but require the Ride aggregate to authorize transitions such as assignDriver, startTrip, and cancel.',
        why: [
          'The workflow stays readable from request to completion.',
          'Business legality stays with the aggregate instead of leaking into the service.',
          'Future side effects such as notifications or receipts can subscribe after state changes.'
        ],
        alternative:
          'If the service mutates ride internals directly, state rules become duplicated and drift apart from the model.',
        outcome:
          'The design keeps orchestration explicit without weakening domain ownership.'
      },
      {
        id: 'leave-approval',
        label: 'Leave approval',
        title: 'Use state modeling when approval rules depend on current stage',
        scenario:
          'An HR workflow handles requested, manager-approved, HR-approved, rejected, canceled, and expired leave requests.',
        decision: 'Represent the lifecycle as explicit states or transition rules instead of scattered boolean flags like approvedByManager.',
        why: [
          'Each command can check one well-defined current state.',
          'Auditing who changed the request and when becomes easier.',
          'The interviewer can see how escalation or cancellation hooks fit naturally.'
        ],
        alternative:
          'Boolean combinations such as approved and canceled and expired become impossible to reason about under follow-ups.',
        outcome:
          'The approval flow becomes a defendable state machine rather than a set of ad hoc checks.'
      }
    ],
    decisionGuide: {
      prompt: 'How should the workflow be structured?',
      options: [
        {
          id: 'aggregate-methods',
          label: 'Keep logic on aggregate methods',
          bestFor: 'Short workflows where one aggregate owns nearly all rules and side effects are minimal.',
          chooseWhen: [
            'One object clearly owns the lifecycle.',
            'The command touches only a small number of collaborators.',
            'The flow remains readable inside the aggregate boundary.'
          ],
          tradeOffs: [
            'The aggregate can become crowded if orchestration grows.',
            'Infrastructure concerns must stay out of the object carefully.',
            'Long-running or cross-object flows soon outgrow this style.'
          ],
          alternativeOutcome:
            'Moving all logic into services too early can make a simple aggregate feel anemic.'
        },
        {
          id: 'orchestrator',
          label: 'Use an application orchestrator',
          bestFor: 'Commands that coordinate validation, domain updates, persistence, and optional side effects.',
          chooseWhen: [
            'Several collaborators must participate in one readable sequence.',
            'The aggregate should still decide legal transitions but not wire infrastructure itself.',
            'You expect follow-up requirements such as notifications or audit logging.'
          ],
          tradeOffs: [
            'The orchestrator can become procedural if too much business logic leaks into it.',
            'You still need strong domain methods or the service turns into the real model.',
            'Naming the boundary between orchestration and domain policy takes discipline.'
          ],
          alternativeOutcome:
            'Without an orchestrator, multi-step workflows often scatter across controllers, entities, and repositories.'
        },
        {
          id: 'state-machine',
          label: 'Model an explicit state machine',
          bestFor: 'Lifecycles with many legal and illegal transitions or state-specific commands.',
          chooseWhen: [
            'The workflow spans several named stages.',
            'Different actors can do different actions in each state.',
            'Edge-case correctness matters more than minimal code.'
          ],
          tradeOffs: [
            'The model can feel formal for very small workflows.',
            'You still need orchestration around persistence and side effects.',
            'Transition maps need upkeep as features grow.'
          ],
          alternativeOutcome:
            'If you keep states implicit, future cancellation or retry rules usually force a redesign.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design a repair-ticket workflow',
      prompt:
        'A device-repair center accepts tickets, estimates work, starts repair, pauses for parts, completes, and hands devices back to customers.',
      steps: [
        {
          title: 'Pick the command entry points',
          detail: 'Define clear operations such as createTicket, startRepair, markWaitingForParts, completeRepair, and handOff.',
          whatIf: 'Without named commands, workflows dissolve into generic update methods that hide intent.'
        },
        {
          title: 'Make the ticket own its lifecycle',
          detail: 'Keep legal state transitions inside the RepairTicket model so no service can skip them casually.',
          whatIf: 'External mutation will eventually permit impossible jumps such as handoff before completion.'
        },
        {
          title: 'Use an orchestrator for coordination',
          detail: 'Let a use case service call pricing, inventory, and notification collaborators around the ticket transition sequence.',
          whatIf: 'If the ticket wires every adapter itself, the domain object becomes infrastructure-aware.'
        },
        {
          title: 'Attach follow-up seams after the state change',
          detail: 'Trigger callbacks or events only after the ticket transition succeeds so reminders and status updates stay consistent.',
          whatIf: 'If side effects run before a legal transition is confirmed, observers can publish the wrong story.'
        }
      ],
      metrics: ['illegal transition rejection rate', 'workflow steps with explicit commands', 'side effects triggered after successful transition', 'repair status mismatch count']
    }),
    mermaid: {
      title: 'Workflow with state ownership',
      caption: 'The use case coordinates the flow, while the aggregate guards the lifecycle and emits clean extension points.',
      code: `flowchart LR
    Command[User command] --> UseCase[Use case service]
    UseCase --> Ticket[RepairTicket aggregate]
    Ticket --> State[Lifecycle transition]
    State --> Repo[Repository save]
    Repo --> Effects[Observers or callbacks]
      `
    }
  },
  'lld-extensibility/strategy-factory-and-builder': {
    title: 'Strategy, factory, and builder patterns in interviews',
    summary:
      'Use patterns as targeted tools: strategy for runtime variation, factory for safe construction, and builder for readable staged assembly.',
    takeaways: [
      'A pattern should correspond to one concrete axis of change.',
      'Factories protect valid object creation when constructors are not enough.',
      'Builders help when many optional parts would otherwise bury intent.'
    ],
    examples: [
      {
        id: 'pricing-engine',
        label: 'Pricing engine',
        title: 'Use strategy when the algorithm varies at runtime',
        scenario:
          'A delivery platform computes fees differently for standard orders, subscription members, surge windows, and enterprise contracts.',
        decision: 'Define a PricingStrategy contract and select the implementation from order context rather than branching inside one giant method.',
        why: [
          'Each pricing policy can be tested and reasoned about independently.',
          'The caller uses one contract even as pricing rules evolve.',
          'New policy variants can land without editing a long chain of conditions.'
        ],
        alternative:
          'Keeping every pricing rule in one method makes condition ordering brittle and increases regression risk during experiments.',
        outcome:
          'The pricing behavior becomes extensible without obscuring the core checkout flow.'
      },
      {
        id: 'report-builder',
        label: 'Report builder',
        title: 'Use a builder when readable staged assembly matters',
        scenario:
          'A reporting request may include filters, sorting, paging, grouping, export format, and optional watermarking or locale settings.',
        decision: 'Use a builder to assemble the request gradually and validate required pieces at build time.',
        why: [
          'A long constructor with optional arguments hides intent and is easy to misuse.',
          'The build step can enforce that the request is complete and internally consistent.',
          'Call sites read like a checklist instead of a parameter puzzle.'
        ],
        alternative:
          'A builder is unnecessary when a small parameter object already keeps creation readable.',
        outcome:
          'Construction becomes safer and more legible without changing the business rules.'
      }
    ],
    decisionGuide: {
      prompt: 'Which creational or variation pattern is the best fit?',
      options: [
        {
          id: 'strategy',
          label: 'Strategy',
          bestFor: 'Interchangeable algorithms chosen from context at runtime.',
          chooseWhen: [
            'Behavior varies by market, tenant, feature flag, or item type.',
            'Callers should not know concrete policy classes.',
            'Each algorithm benefits from focused tests.'
          ],
          tradeOffs: [
            'Too many tiny strategies can scatter simple logic.',
            'Selection rules still need a clean home.',
            'Shared inputs must stay stable across implementations.'
          ],
          alternativeOutcome:
            'Using branches for many variants may be fine briefly, but it becomes painful once policies evolve independently.'
        },
        {
          id: 'factory',
          label: 'Factory',
          bestFor: 'Object creation that needs configuration, validation, or dependency-aware selection.',
          chooseWhen: [
            'Constructors would expose too much wiring or invalid partial states.',
            'The correct implementation depends on config or input shape.',
            'Callers should receive a ready-to-use object, not assemble one manually.'
          ],
          tradeOffs: [
            'A factory that wraps one trivial constructor adds little value.',
            'Too many factory layers can hide the concrete flow.',
            'You still need good names to communicate what is being created.'
          ],
          alternativeOutcome:
            'Skipping a useful factory can duplicate creation logic and validation across callers.'
        },
        {
          id: 'builder',
          label: 'Builder',
          bestFor: 'Readable staged setup with many optional or order-sensitive parts.',
          chooseWhen: [
            'Named chaining improves clarity over raw constructors.',
            'The object needs validation only after several fields are provided.',
            'Different presets share a common final type.'
          ],
          tradeOffs: [
            'Builders are overkill for small immutable data objects.',
            'Mutating builders need care if reused accidentally.',
            'A builder should not duplicate a factory without a distinct role.'
          ],
          alternativeOutcome:
            'Without a builder, telescoping constructors or large option bags often make invalid states easier to create.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Refactor a document-generation feature',
      prompt:
        'A back-office tool generates invoices, statements, and certificates with format-specific rendering plus a request object that has many optional filters and branding settings.',
      steps: [
        {
          title: 'Isolate runtime policy variation',
          detail: 'Use strategy for rendering differences that depend on the requested document type or tenant context.',
          whatIf: 'If rendering rules stay in one method, every new document type edits a fragile branch chain.'
        },
        {
          title: 'Hide creation rules behind a factory',
          detail: 'Create a factory when the correct renderer needs configuration, validation, and dependency wiring before it is safe to use.',
          whatIf: 'Without a factory, callers duplicate creation logic and instantiate incompatible objects.'
        },
        {
          title: 'Make large requests readable',
          detail: 'Introduce a builder for the generation request if required and optional fields would otherwise be hard to read correctly.',
          whatIf: 'Huge constructors or loose option objects make omissions and invalid combinations easy.'
        },
        {
          title: 'Explain why each pattern exists',
          detail: 'Tie every abstraction to one concrete source of change so the interviewer sees judgment rather than memorization.',
          whatIf: 'Stacking patterns without a change story makes the design feel ceremonial.'
        }
      ],
      metrics: ['branch count removed from callers', 'constructor arguments replaced by builder steps', 'duplicate creation logic eliminated', 'policy tests per strategy']
    }),
    mermaid: {
      title: 'Pattern roles in one feature',
      caption: 'Factories choose and assemble objects, strategies vary behavior, and builders keep large setup readable.',
      code: `flowchart LR
    Caller[Caller] --> Builder[Request builder]
    Builder --> Request[Validated request]
    Request --> Factory[Renderer factory]
    Factory --> Strategy[Render strategy]
    Strategy --> Output[Generated document]
      `
    }
  },
  'lld-extensibility/observer-dependency-inversion-and-events': {
    title: 'Observer, dependency inversion, and event-style decoupling',
    summary:
      'Keep core business logic independent from notifications, analytics, and plugin-style reactions by publishing clear events and depending on stable ports.',
    takeaways: [
      'Core domain actions should finish without knowing every side effect.',
      'Dependency inversion keeps infrastructure details out of the model.',
      'Observers are useful only when ordering, failure, and idempotency rules are clear.'
    ],
    examples: [
      {
        id: 'subscription-renewal',
        label: 'Subscription renewal',
        title: 'Publish a renewal event after the state change, not before',
        scenario:
          'A subscription renews successfully and several reactions may follow: email receipt, usage quota refresh, analytics, and audit logging.',
        decision: 'Complete the renewal in the core workflow, then emit a domain event that observers handle through isolated interfaces.',
        why: [
          'The subscription model stays focused on renewal rules rather than on every downstream concern.',
          'Observers can evolve independently as the product adds new reactions.',
          'Tests can verify the state change and the emitted event separately.'
        ],
        alternative:
          'Calling every integration inline from the renewal method makes failure handling and extension messy.',
        outcome:
          'The design remains open to new side effects without rewriting the renewal rule.'
      },
      {
        id: 'editor-plugins',
        label: 'Editor plugins',
        title: 'Use dependency inversion when optional plugins should not shape the core',
        scenario:
          'A document editor supports save hooks for spell check, autosave snapshots, and usage telemetry, but the editor core must stay usable without any plugin loaded.',
        decision: 'Define a small hook interface that the editor core calls, and let plugin adapters implement it externally.',
        why: [
          'The editor depends on a stable contract instead of concrete plugin classes.',
          'Optional behavior can be added or removed without changing the save algorithm.',
          'The domain stays readable because it speaks in hook semantics, not vendor APIs.'
        ],
        alternative:
          'Hard-coding plugin knowledge into the editor core makes every new integration a risky modification to the save path.',
        outcome:
          'The plugin system stays additive instead of invasive.'
      }
    ],
    decisionGuide: {
      prompt: 'How should the core workflow interact with secondary reactions?',
      options: [
        {
          id: 'direct-port',
          label: 'Direct call through a port',
          bestFor: 'Required side effects that are conceptually part of the same use case.',
          chooseWhen: [
            'The caller must know whether the side effect succeeded immediately.',
            'There are only one or two reactions and they are not optional.',
            'Ordering is strict and simple.'
          ],
          tradeOffs: [
            'The core workflow waits on the side effect and grows more coupled to its timing.',
            'Adding more reactions later often requires editing the same code path.',
            'Tests must account for collaborator outcomes in-line.'
          ],
          alternativeOutcome:
            'If every side effect is direct and synchronous, the core class becomes a coordinator for unrelated concerns.'
        },
        {
          id: 'observer',
          label: 'Observer or domain event',
          bestFor: 'Several optional reactions to one successful business action.',
          chooseWhen: [
            'Subscribers should evolve independently from the publisher.',
            'The main state change should remain the star of the workflow.',
            'You can name a stable event contract such as orderPlaced or documentSaved.'
          ],
          tradeOffs: [
            'Tracing and debugging fan-out requires better instrumentation or logs.',
            'Delivery order and retry semantics must be defined deliberately.',
            'Observers should avoid mutating core domain state silently.'
          ],
          alternativeOutcome:
            'Without an observer seam, each new subscriber expands the publisher and mixes concerns.'
        },
        {
          id: 'plugin-hook',
          label: 'Plugin hook with inversion of control',
          bestFor: 'Extensible product surfaces such as editor actions, validators, or report enrichers.',
          chooseWhen: [
            'The core product should run even when no extension is present.',
            'The extension point is stable but implementations vary.',
            'You want to test the core with fake hooks and the hook separately.'
          ],
          tradeOffs: [
            'Hook contracts need guardrails so plugins cannot corrupt core state.',
            'Lifecycle and ordering of hooks must be documented.',
            'Too many hooks can make execution order surprising.'
          ],
          alternativeOutcome:
            'If you skip inversion here, extension code ends up hard-coded in the core product classes.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Add side effects to a task-completion workflow',
      prompt:
        'A productivity app marks tasks complete, then may trigger streak updates, celebration UI, reminders cleanup, and analytics tracking without polluting the Task model.',
      steps: [
        {
          title: 'Finish the core state change first',
          detail: 'Make Task or TaskList own the completion invariant and mark completion before any optional reaction fires.',
          whatIf: 'If observers run before the state change is committed, reactions can publish stale or contradictory information.'
        },
        {
          title: 'Publish one clear event',
          detail: 'Emit a TaskCompleted domain event with the minimum data that subscribers need rather than exposing internal objects directly.',
          whatIf: 'Passing mutable domain internals to subscribers encourages back-door mutation.'
        },
        {
          title: 'Hide integrations behind stable ports',
          detail: 'Wrap analytics, reminders, and celebratory UI callbacks in contracts that fit the publisher’s needs, not the vendor API.',
          whatIf: 'If the domain depends on vendor-specific details, extension points become much harder to test or replace.'
        },
        {
          title: 'Describe failure and ordering',
          detail: 'State whether streak updates are required, whether analytics can fail independently, and whether observer order matters.',
          whatIf: 'Event vocabulary without delivery rules leaves the design underspecified.'
        }
      ],
      metrics: ['core workflow lines touching side effects', 'subscriber count added without core edits', 'observer retry safety', 'event contract stability']
    }),
    mermaid: {
      title: 'Decoupled side effects',
      caption: 'The core domain action emits one event, while observers and ports absorb optional reactions outside the model.',
      code: `flowchart LR
    Command[Complete task] --> Aggregate[Task aggregate]
    Aggregate --> Event[TaskCompleted event]
    Event --> Streak[Streak observer]
    Event --> Reminder[Reminder cleanup]
    Event --> Analytics[Analytics port]
    Event --> Audit[Audit log]
      `
    }
  },
  'lld-extensibility/repositories-caching-and-persistence-seams': {
    title: 'Repositories, caching, and persistence seams',
    summary:
      'Expose storage through use-case-shaped contracts, then add cache behavior intentionally so the domain stays readable and testable.',
    takeaways: [
      'Repository methods should speak in domain operations, not generic CRUD.',
      'Caching belongs behind an explicit ownership boundary for freshness.',
      'Mapping and storage details should stay near adapters, not inside the model.'
    ],
    examples: [
      {
        id: 'catalog-read',
        label: 'Catalog read',
        title: 'Hide cache behavior behind the same repository contract',
        scenario:
          'A product catalog frequently reads product cards by id and category while writes are much rarer and come from an admin console.',
        decision: 'Keep a ProductRepository contract for the use case and implement caching as a decorator or adapter detail behind it.',
        why: [
          'Callers read products without learning cache keys or fallback logic.',
          'Freshness policy remains explicit in one layer rather than scattered across services.',
          'An in-memory fake can satisfy tests without a real cache or database.'
        ],
        alternative:
          'When services talk directly to both cache and database, invalidation responsibilities quickly become ambiguous.',
        outcome:
          'The domain flow stays clean while reads still benefit from caching.'
      },
      {
        id: 'quiz-attempts',
        label: 'Quiz attempts',
        title: 'Shape repository methods around real workflow questions',
        scenario:
          'An assessment feature saves quiz attempts, fetches the latest unfinished attempt, and records a completed score for a learner.',
        decision: 'Define methods such as saveAttempt, findActiveAttempt, and recordCompletion instead of exposing generic get and update operations.',
        why: [
          'Use-case methods communicate intent directly to callers.',
          'The repository boundary becomes easier to fake in tests because the contract is small and purposeful.',
          'Storage-specific query details stay out of the quiz workflow.'
        ],
        alternative:
          'Generic repositories often force business services to know too much about data shape and persistence semantics.',
        outcome:
          'The design preserves a clear seam without pretending persistence does not matter.'
      }
    ],
    decisionGuide: {
      prompt: 'What persistence boundary makes the design cleaner?',
      options: [
        {
          id: 'repository',
          label: 'Repository with use-case methods',
          bestFor: 'Domains that need a storage seam for tests, migration, or multiple backing implementations.',
          chooseWhen: [
            'The workflow benefits from naming domain-specific persistence operations.',
            'You want adapters and mappers outside the core model.',
            'The backing store may evolve without changing use-case vocabulary.'
          ],
          tradeOffs: [
            'A vague repository can become a leaky CRUD wrapper.',
            'Over-abstracting tiny apps may add layers without clarity.',
            'Transactions or batching still need explicit modeling.'
          ],
          alternativeOutcome:
            'Skipping the seam can be fine briefly, but storage details will end up entangled with domain code faster than expected.'
        },
        {
          id: 'cache-decorator',
          label: 'Cache behind the repository',
          bestFor: 'Read-heavy access patterns where stale-read rules are acceptable and should stay centralized.',
          chooseWhen: [
            'The same read path repeats often enough to justify caching.',
            'Invalidation ownership can be stated clearly.',
            'Callers should not branch based on cache hits or misses.'
          ],
          tradeOffs: [
            'Freshness and invalidation bugs become part of the design risk.',
            'Metrics are needed to know whether the cache really helps.',
            'Write paths may need explicit bust or refresh behavior.'
          ],
          alternativeOutcome:
            'If caching leaks into every service, each caller invents a different freshness story.'
        },
        {
          id: 'direct-adapter',
          label: 'Direct adapter call',
          bestFor: 'Small features where a dedicated repository layer would only wrap one obvious operation.',
          chooseWhen: [
            'The storage interaction is tiny and unlikely to vary.',
            'The design stays clearer with one thin gateway rather than several layers.',
            'There is no meaningful domain vocabulary being lost.'
          ],
          tradeOffs: [
            'A later migration may require refactoring more call sites.',
            'Tests may need more setup if the adapter interface is too technical.',
            'It is easy to slide from thin gateway to infrastructure-heavy domain logic.'
          ],
          alternativeOutcome:
            'Adding a repository when it buys nothing can make a simple design look padded.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design persistence for a reading-list app',
      prompt:
        'A reading-list feature stores books, list membership, note snippets, and recent reads while the main performance concern is repeated list rendering.',
      steps: [
        {
          title: 'Name domain-shaped repository methods',
          detail: 'Prefer operations such as addBookToList, loadReadingList, and markRecentlyRead over generic CRUD calls.',
          whatIf: 'If persistence vocabulary is generic, business services must reconstruct intent from lower-level operations.'
        },
        {
          title: 'Choose who owns freshness',
          detail: 'If list rendering uses a cache, decide whether the repository or a dedicated decorator owns invalidation on note edits and membership changes.',
          whatIf: 'When ownership is unclear, stale reads become a blame game between layers.'
        },
        {
          title: 'Keep mapping near adapters',
          detail: 'Translate storage rows or documents into domain objects inside the persistence layer rather than in the use case code.',
          whatIf: 'Leaking mapping logic upward forces business services to learn schema details.'
        },
        {
          title: 'Preserve cheap tests',
          detail: 'Provide an in-memory implementation that exercises repository contracts and cache behavior without real infrastructure.',
          whatIf: 'If tests need a real database for every rule, feedback slows and refactors become riskier.'
        }
      ],
      metrics: ['repository methods tied to use cases', 'cache hit rate on hot reads', 'stale-read defects', 'tests using in-memory persistence']
    }),
    mermaid: {
      title: 'Persistence seam with cache decorator',
      caption: 'The use case talks to one repository contract while cache and storage adapters stay behind the seam.',
      code: `flowchart LR
    UseCase[Use case] --> Repo[Repository contract]
    Repo --> CacheRepo[Cache decorator]
    CacheRepo --> Cache[(Cache)]
    CacheRepo --> StoreRepo[Store adapter]
    StoreRepo --> Store[(Database or file)]
    StoreRepo --> Mapper[Domain mapper]
      `
    }
  },
  'lld-machine-coding/machine-coding-skeleton-and-iteration': {
    title: 'Machine-coding skeletons and incremental delivery',
    summary:
      'Win machine-coding rounds by shipping one small vertical slice first, then layering validation, policies, and extension seams only after the happy path is visible.',
    takeaways: [
      'A thin end-to-end slice with a running happy path communicates design judgment fastest.',
      'You can narrate future abstractions after the demo works instead of front-loading them.',
      'Readable naming, models/services/ports layout, and a tiny driver demo matter as much as class choice.'
    ],
    examples: [
      {
        id: 'parking-lot',
        label: 'Parking lot',
        title: 'Implement ticket creation and exit before advanced slot policies',
        scenario:
          'A parking lot prompt includes floors, spots, tickets, payments, and different vehicle sizes but only forty-five minutes are available.',
        decision: 'Code the minimal entry and exit flow first, then mention where allocation strategy and payment options will plug in.',
        why: [
          'A working happy path proves the class relationships quickly.',
          'The interviewer can see which abstractions are necessary versus speculative.',
          'Later refinements land on a visible foundation instead of on blank scaffolding.'
        ],
        alternative:
          'Starting with factories, observers, and persistence interfaces before a car can park often burns time without proving correctness.',
        outcome:
          'The design grows in the same order a reviewer would naturally read it.'
      },
      {
        id: 'todo-board',
        label: 'Task board',
        title: 'Introduce classes in dependency order so the story stays clear',
        scenario:
          'A Kanban-style task board supports create task, move task between columns, assign members, and basic validation.',
        decision: 'Create Task, Column, and Board operations first, then add assignment rules and repository seams only after the move flow works.',
        why: [
          'The interviewer sees domain ownership before infrastructure.',
          'You keep enough slack to refactor once real pressure points appear.',
          'Each added abstraction maps to a newly visible need.'
        ],
        alternative:
          'Writing placeholder interfaces for every future dependency makes the code look abstract but not functional.',
        outcome:
          'Incremental delivery keeps momentum without sacrificing extensibility.'
      }
    ],
    decisionGuide: {
      prompt: 'What should you code first in a time-boxed machine-coding round?',
      options: [
        {
          id: 'vertical-slice',
          label: 'One end-to-end vertical slice',
          bestFor: 'Most interview rounds where proving the core model matters more than handling every edge case immediately.',
          chooseWhen: [
            'The prompt has one obvious primary use case.',
            'You need quick feedback from running or mentally tracing the flow.',
            'The interviewer values visible progress.'
          ],
          tradeOffs: [
            'Some extension points remain only narrated at first.',
            'You need discipline not to prematurely polish supporting code.',
            'The first version may contain a small refactor target on purpose.'
          ],
          alternativeOutcome:
            'If you begin with all abstractions and no behavior, the interviewer cannot judge whether the model actually works.'
        },
        {
          id: 'policy-first',
          label: 'Implement the risky policy first',
          bestFor: 'Prompts where one complicated rule such as allocation or pricing dominates the design challenge.',
          chooseWhen: [
            'A single algorithm is the main source of interviewer interest.',
            'You can isolate the rule and still plug it into a later flow cleanly.',
            'A minimal skeleton already exists conceptually.'
          ],
          tradeOffs: [
            'Without a surrounding workflow, the policy can feel disconnected.',
            'You may delay proving object collaboration.',
            'It is easier to over-optimize the algorithm under time pressure.'
          ],
          alternativeOutcome:
            'Ignoring the hardest rule entirely can make the finished code look deceptively simple.'
        },
        {
          id: 'api-first',
          label: 'Public API and class shell first',
          bestFor: 'Rounds where you need to align with the interviewer on method signatures before implementation.',
          chooseWhen: [
            'The prompt is ambiguous and API shape itself is part of the discussion.',
            'A few signatures will clarify object responsibilities early.',
            'You plan to fill the most important method immediately afterward.'
          ],
          tradeOffs: [
            'Too much skeleton without behavior looks unfinished.',
            'Signatures may change once the happy path is implemented.',
            'It is easy to hide behind interfaces instead of coding.'
          ],
          alternativeOutcome:
            'If you stay at the API level too long, the round ends before you prove the design with behavior.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Sequence a machine-coding answer for a mini parking lot',
      prompt:
        'You must design a parking lot in forty-five minutes with entry, exit, spot assignment, and fee calculation while leaving room for future vehicle types.',
      steps: [
        {
          title: 'Pick the first runnable scenario',
          detail: 'Start with park vehicle and exit vehicle for one lot, one floor, and a few spot types.',
          whatIf: 'If the first scenario is too broad, you spend the round scaffolding instead of proving the model.'
        },
        {
          title: 'Introduce classes in dependency order',
          detail: 'Create Spot and Ticket before the lot orchestrator so constructors and responsibilities feel grounded.',
          whatIf: 'Top-down placeholder coding often leaves low-level types underspecified when time runs out.'
        },
        {
          title: 'Narrate upcoming seams',
          detail: 'Mention where an allocation strategy or payment calculator will plug in, but defer extraction until the core flow exists.',
          whatIf: 'If you fully abstract everything from the start, the code can become more ceremony than design.'
        },
        {
          title: 'Refactor only after the slice works',
          detail: 'Once entry and exit are clear, extract the first policy or interface that removes visible pressure from the code.',
          whatIf: 'Refactoring before behavior exists guesses at design pressure instead of responding to it.'
        }
      ],
      metrics: ['time to first working scenario', 'number of abstractions introduced after clear need', 'public API stability after first slice', 'happy-path coverage in the round']
    }),
    mermaid: {
      title: 'Incremental machine-coding path',
      caption: 'Code the smallest working path first, then layer policies, seams, and cleanup in response to visible pressure.',
      code: `flowchart TD
    Prompt[Prompt] --> Slice[Choose happy path]
    Slice --> Types[Add core domain types]
    Types --> Run[Implement one end-to-end flow]
    Run --> Extend[Add policy seams]
    Extend --> Cleanup[Refactor and summarize]
      `
    }
  },
  'lld-machine-coding/testing-seams-and-refactoring': {
    title: 'Testing seams, refactoring, and interview-safe cleanup',
    summary:
      'Use seams around unstable collaborators, write high-signal tests for core rules, and refactor only after visible behavior shows where the design is straining.',
    takeaways: [
      'The most valuable seams isolate time, IDs, storage, and external gateways.',
      'Tests should target invariants and policies, not boilerplate.',
      'Refactoring is strongest when it removes a specific source of design pressure.'
    ],
    examples: [
      {
        id: 'subscription-expiry',
        label: 'Subscription expiry',
        title: 'Inject time and IDs so lifecycle rules become deterministic',
        scenario:
          'A subscription can renew, expire, grace-period, or cancel, and tests must verify behavior across exact dates.',
        decision: 'Inject a clock and ID generator through small seams so tests can control time-based transitions precisely.',
        why: [
          'Deterministic tests describe lifecycle rules without waiting on real time.',
          'The core model stays focused on policy instead of system calls.',
          'Clock and ID seams are tiny but remove a large source of flakiness.'
        ],
        alternative:
          'Reading system time directly inside methods makes edge-case tests brittle and forces awkward sleeps or monkeypatches.',
        outcome:
          'The design becomes easier to verify and safer to refactor.'
      },
      {
        id: 'fare-calculator',
        label: 'Fare calculator',
        title: 'Refactor after you see the branching pressure in a working method',
        scenario:
          'A fare calculation method starts small but gains surge rules, coupons, tolls, minimum fares, and airport surcharges.',
        decision: 'Write tests around current pricing rules, then extract the first cohesive policy once the branching cost is obvious.',
        why: [
          'You preserve behavior while improving structure.',
          'The refactor is justified by a real reason to change, not aesthetics.',
          'Tests act as a safety net while the design evolves.'
        ],
        alternative:
          'Premature refactoring into many classes before the rules appear often guesses wrong about the real pressure point.',
        outcome:
          'The code gets cleaner exactly where it needs to, without losing momentum.'
      }
    ],
    decisionGuide: {
      prompt: 'Which seam or cleanup move is worth making next?',
      options: [
        {
          id: 'external-port',
          label: 'Extract an external port',
          bestFor: 'Storage, messaging, payment, clock, randomness, or ID generation.',
          chooseWhen: [
            'The collaborator causes nondeterminism or side effects in tests.',
            'The business rule should be exercisable without infrastructure.',
            'The adapter may change independently.'
          ],
          tradeOffs: [
            'Every seam adds constructor wiring and extra names to explain.',
            'A port should stay tiny or it becomes its own leaky abstraction.',
            'Some interview rounds do not need every possible seam coded.'
          ],
          alternativeOutcome:
            'Without the seam, tests drift toward slow integration setup or skip important edge cases entirely.'
        },
        {
          id: 'extract-policy',
          label: 'Extract a policy or helper after behavior is visible',
          bestFor: 'Methods that have grown many branches around one cohesive decision area.',
          chooseWhen: [
            'A method mixes several pricing, allocation, or validation decisions.',
            'One cluster of logic can be named cleanly in domain terms.',
            'Tests already describe the behavior you need to preserve.'
          ],
          tradeOffs: [
            'Over-extraction can create too many tiny files with weak names.',
            'Not every long method deserves a class; sometimes a function is enough.',
            'You must keep the caller’s narrative readable after extraction.'
          ],
          alternativeOutcome:
            'If you keep piling rules into one method, future changes become slower and riskier.'
        },
        {
          id: 'defer-cleanup',
          label: 'Defer cosmetic cleanup',
          bestFor: 'Situations where correctness or core functionality is not yet proven.',
          chooseWhen: [
            'The main flow is still incomplete or untested.',
            'The cleanup does not reduce a real bug or extension risk.',
            'Time pressure makes visible progress more valuable.'
          ],
          tradeOffs: [
            'You may leave small naming or style debt temporarily.',
            'The code still needs a clear note about the next improvement.',
            'Deferral works only if the current structure is still coherent.'
          ],
          alternativeOutcome:
            'Polishing formatting or naming too early can consume time better spent proving the design.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Add seams to a meeting-room booking feature',
      prompt:
        'A meeting-room scheduler now needs tests for overlap checks, booking IDs, and reminder scheduling, while the existing code uses current time and direct repository calls.',
      steps: [
        {
          title: 'Protect the highest-risk invariant first',
          detail: 'Write focused tests around overlap and cancellation rules before broader cleanup so you know what must stay true.',
          whatIf: 'If you refactor first without tests, it is easy to accidentally weaken the core booking rule.'
        },
        {
          title: 'Extract nondeterministic collaborators',
          detail: 'Inject time, ID generation, and reminder scheduling behind tiny ports that tests can fake.',
          whatIf: 'Leaving nondeterminism in place forces fragile tests or discourages coverage entirely.'
        },
        {
          title: 'Refactor one pressure point',
          detail: 'If the booking method mixes validation, slot search, and side effects, extract only the most cohesive piece first.',
          whatIf: 'A wide refactor under time pressure risks replacing one tangled method with several equally vague abstractions.'
        },
        {
          title: 'Summarize deferred cleanup honestly',
          detail: 'Call out what remains acceptable technical debt and which next refactor would follow if time allowed.',
          whatIf: 'Without an explicit defer plan, unfinished cleanup can look accidental rather than intentional.'
        }
      ],
      metrics: ['core rule tests added', 'nondeterministic dependencies isolated', 'refactor size per iteration', 'time spent after first green scenario']
    }),
    mermaid: {
      title: 'Testing seams around the core',
      caption: 'A small set of ports lets tests exercise domain rules while refactors stay grounded in existing behavior.',
      code: `flowchart LR
    Tests[Focused tests] --> Service[Booking use case]
    Service --> Domain[Booking domain]
    Service --> Clock[Clock port]
    Service --> Repo[Repository port]
    Service --> Reminder[Reminder port]
    Service --> Ids[ID generator]
      `
    }
  },
  'lld-machine-coding/concurrency-followups-and-scale-bridges': {
    title: 'Concurrency follow-ups and bridging into scale',
    summary:
      'Handle LLD follow-ups about races and shared state by naming the mutable hotspot, picking one coordination strategy, and showing how the object design can evolve without starting over.',
    takeaways: [
      'Thread-safety begins with identifying shared mutable state precisely.',
      'Locking or version checks should match the actual contention shape.',
      'Scaling follow-ups should extend the model, not discard it immediately.'
    ],
    examples: [
      {
        id: 'seat-hold',
        label: 'Seat hold',
        title: 'Protect one contested aggregate instead of locking the whole application',
        scenario:
          'A theater seat-hold service runs in one process and multiple requests may try to reserve the same seat concurrently.',
        decision: 'Treat the SeatInventory or Show aggregate as the contention boundary and use a narrow lock or version check around hold creation.',
        why: [
          'The mutable hotspot is a small set of seats, not every show in memory.',
          'A targeted coordination strategy preserves throughput for unrelated operations.',
          'The same aggregate semantics remain useful if persistence is introduced later.'
        ],
        alternative:
          'One giant application-wide lock is simple but punishes unrelated requests and hides the true contention boundary.',
        outcome:
          'The follow-up answer stays grounded in object ownership rather than generic concurrency vocabulary.'
      },
      {
        id: 'leaderboard-counter',
        label: 'Leaderboard counter',
        title: 'Prefer partitioned or serialized updates when shared mutation is hot',
        scenario:
          'A game leaderboard updates scores frequently and naive shared maps create races or excessive locking contention.',
        decision: 'Partition updates by player or bucket, or serialize updates through one owner per partition, while preserving the ScoreBoard API.',
        why: [
          'Hot mutable state often needs finer ownership than one shared object lock.',
          'The external API can stay stable while the implementation changes.',
          'This bridges naturally from local in-memory design to a more durable backend later.'
        ],
        alternative:
          'Sprinkling synchronized blocks around every method can hide races temporarily while creating contention and deadlock risks.',
        outcome:
          'The design evolves incrementally without abandoning its domain model.'
      }
    ],
    decisionGuide: {
      prompt: 'What concurrency strategy best matches the hotspot?',
      options: [
        {
          id: 'coarse-lock',
          label: 'Coarse lock',
          bestFor: 'Small interview implementations where contention is low and simplicity matters most.',
          chooseWhen: [
            'The shared mutable surface is tiny and easy to explain.',
            'Correctness is more important than throughput in the first version.',
            'You need the quickest safe answer under time pressure.'
          ],
          tradeOffs: [
            'Throughput suffers when unrelated operations block each other.',
            'The lock scope can grow accidentally as features are added.',
            'This answer needs a clear note on when it would stop scaling.'
          ],
          alternativeOutcome:
            'Pretending no lock is needed at all usually ignores the very follow-up the interviewer asked.'
        },
        {
          id: 'fine-grained',
          label: 'Per-entity lock or optimistic versioning',
          bestFor: 'Contention localized to one aggregate or key at a time.',
          chooseWhen: [
            'You can name the exact entity whose mutation must be serialized.',
            'Conflicts are rare enough that retries or short locks are acceptable.',
            'You want unrelated operations to proceed independently.'
          ],
          tradeOffs: [
            'You must manage lock identity or retry logic carefully.',
            'It is easier to miss multi-entity invariants.',
            'Tests need concurrent scenarios to prove the strategy.'
          ],
          alternativeOutcome:
            'Using one global lock where contention is local leaves performance on the table and obscures intent.'
        },
        {
          id: 'single-owner',
          label: 'Single owner per partition',
          bestFor: 'Very hot counters or queues where serialized ownership is simpler than many locks.',
          chooseWhen: [
            'Updates can be partitioned by key or bucket cleanly.',
            'Callers can tolerate queued processing within a partition.',
            'You want a clean bridge from in-memory design to a future persistent owner.'
          ],
          tradeOffs: [
            'Partitioning adds routing and rebalance concerns.',
            'Cross-partition invariants become harder.',
            'This is heavier than needed for low-contention designs.'
          ],
          alternativeOutcome:
            'If you keep one hot shared object under many fine locks, coordination can become harder to reason about than ownership.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Answer a seat-reservation race condition follow-up',
      prompt:
        'Your interview design for a seat reservation system now faces a follow-up: two users try to hold the same seat at nearly the same time, and the interviewer asks what changes first.',
      steps: [
        {
          title: 'Name the shared mutable hotspot',
          detail: 'Point to the seat inventory or show aggregate as the exact state that concurrent commands may race on.',
          whatIf: 'Saying only that concurrency is hard sounds generic and misses object-level ownership.'
        },
        {
          title: 'Choose one first-line coordination strategy',
          detail: 'Start with a narrow lock or optimistic version check around seat hold creation rather than redesigning the whole system.',
          whatIf: 'If you jump directly to a fully distributed answer, you stop showing how the existing model evolves.'
        },
        {
          title: 'Keep the API stable',
          detail: 'Preserve the reserveSeat command contract while changing the implementation details behind it.',
          whatIf: 'If concurrency changes force caller rewrites immediately, the seam between domain and infrastructure is too weak.'
        },
        {
          title: 'Bridge to the next scaling step',
          detail: 'Explain that persistence, distributed locks, or partition ownership would appear only once one-process coordination becomes the clear limit.',
          whatIf: 'Without a migration story, the follow-up answer sounds like a disconnected HLD tangent.'
        }
      ],
      metrics: ['double-booking prevention', 'lock scope size', 'retry success rate', 'API changes required across scale step']
    }),
    mermaid: {
      title: 'Concurrency at the aggregate boundary',
      caption: 'Requests converge on the mutable hotspot, coordination protects the aggregate, and the public command stays stable.',
      code: `flowchart LR
    ReqA[Reserve seat A] --> Guard[Lock or version check]
    ReqB[Reserve seat B] --> Guard
    Guard --> Inventory[Show or seat aggregate]
    Inventory --> Repo[Persistence seam]
    Repo --> Result[Success or conflict result]
      `
    }
  }
};

/** @type {Record<string, any>} */
export const lldAdvancedInteractive = {
  'lld-solid-principles-lab/solid-principles-in-practice': {
    title: 'SOLID principles in practice',
    summary:
      'Apply SOLID as a pressure test for real object designs: keep responsibilities focused, extension points meaningful, and dependencies pointed at stable abstractions.',
    takeaways: [
      'SOLID is useful when it explains a concrete design pressure, not as a checklist.',
      'Open for extension should not mean open for endless indirection.',
      'Dependency inversion is strongest when interfaces are owned by the caller’s needs.'
    ],
    examples: [
      {
        id: 'invoice-pipeline',
        label: 'Invoice pipeline',
        title: 'Use SRP and OCP to split invoice generation from delivery',
        scenario:
          'An invoicing feature calculates totals, renders invoice content, stores a record, and delivers it by email or download.',
        decision: 'Keep calculation, rendering, persistence, and delivery in separate focused roles so a new output channel extends the flow without rewriting the core rule.',
        why: [
          'Each concern changes for different reasons and at different times.',
          'Adding a new delivery option should not edit invoice math.',
          'Tests stay smaller because behavior is grouped by responsibility.'
        ],
        alternative:
          'A single InvoiceManager that calculates, renders, saves, and sends soon becomes hard to modify without collateral risk.',
        outcome:
          'The design uses SOLID to clarify ownership, not to create extra ceremony.'
      },
      {
        id: 'shape-lsp',
        label: 'Subtype contract',
        title: 'Respect substitutability before reaching for inheritance',
        scenario:
          'A geometry tool defines a base shape API and some candidates behave differently when resized or constrained.',
        decision: 'Use inheritance only for shapes that genuinely honor the same behavioral contract, and prefer composition or separate interfaces for constrained variants.',
        why: [
          'Liskov problems appear when callers expect one meaning and a subtype silently changes it.',
          'Interface segregation helps split capabilities such as resizable versus measurable.',
          'The resulting model is easier to reason about than a forced hierarchy.'
        ],
        alternative:
          'Forcing every related concept into one base class often creates methods that some subtypes cannot support honestly.',
        outcome:
          'SOLID becomes a way to detect bad abstractions before they harden.'
      }
    ],
    decisionGuide: {
      prompt: 'Which SOLID lens best addresses the current design smell?',
      options: [
        {
          id: 'srp-ocp',
          label: 'SRP and OCP',
          bestFor: 'Classes that change for several unrelated reasons or require editing for every new variation.',
          chooseWhen: [
            'One class mixes policy, formatting, persistence, or delivery concerns.',
            'New variants currently require modifying existing branching code.',
            'You can name a clear axis of extension.'
          ],
          tradeOffs: [
            'Splitting too eagerly can create many shallow classes.',
            'Extension points need real ownership or they become ceremony.',
            'You still need a readable orchestration flow.'
          ],
          alternativeOutcome:
            'Ignoring these smells keeps changes centralized in one growing god object.'
        },
        {
          id: 'lsp-isp',
          label: 'LSP and ISP',
          bestFor: 'Hierarchies or interfaces where some implementations cannot honor the full contract cleanly.',
          chooseWhen: [
            'Subtypes need special caveats or unsupported operations.',
            'Callers depend on methods they often do not need.',
            'Behavioral differences matter more than field overlap.'
          ],
          tradeOffs: [
            'Splitting interfaces can increase surface area.',
            'You may need to redesign callers to depend on smaller capabilities.',
            'The hierarchy can shrink or disappear entirely.'
          ],
          alternativeOutcome:
            'Without this lens, inheritance looks reusable while quietly breaking assumptions.'
        },
        {
          id: 'dip',
          label: 'Dependency inversion',
          bestFor: 'Core workflows coupled directly to frameworks or vendors.',
          chooseWhen: [
            'Tests are hard because the class reaches into external services directly.',
            'Infrastructure choices change faster than the domain rule.',
            'The caller can define a smaller, more stable contract.'
          ],
          tradeOffs: [
            'Not every helper deserves its own abstraction.',
            'Ports need names grounded in the use case, not implementation jargon.',
            'You must still wire concrete adapters somewhere.'
          ],
          alternativeOutcome:
            'Skipping inversion where it matters leaves the domain shaped by infrastructure instead of business rules.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Use SOLID to clean up a reward-redemption service',
      prompt:
        'A loyalty feature currently validates balances, calculates redeemable points, saves redemption history, and sends notifications from one large service class.',
      steps: [
        {
          title: 'Spot multiple reasons to change',
          detail: 'Separate balance and redemption rules from persistence and notification concerns so the class no longer changes for unrelated reasons.',
          whatIf: 'If one class owns everything, even a notification tweak risks the redemption workflow.'
        },
        {
          title: 'Find the extension axis',
          detail: 'If redemption calculation varies by membership tier or campaign, use a focused strategy rather than editing one method repeatedly.',
          whatIf: 'Without a real extension seam, every new program rule rewrites existing branches.'
        },
        {
          title: 'Check contract honesty',
          detail: 'Review interfaces and hierarchies to ensure every implementation can support the advertised behavior without caveats.',
          whatIf: 'Dishonest inheritance causes subtle caller bugs and vague documentation.'
        },
        {
          title: 'Invert infrastructure dependencies',
          detail: 'Hide history storage and message sending behind ports owned by the redemption workflow’s needs.',
          whatIf: 'If framework details leak inward, unit tests and future migrations both get heavier.'
        }
      ],
      metrics: ['reasons to change per class', 'existing code modified per new reward rule', 'unsupported operations removed from interfaces', 'core tests without infrastructure']
    }),
    mermaid: {
      title: 'SOLID applied to a use case',
      caption: 'Focused domain rules sit in the middle, extension points isolate variation, and ports keep infrastructure at the edges.',
      code: `flowchart LR
    Caller[Caller] --> UseCase[Redemption use case]
    UseCase --> Policy[Redemption strategy]
    UseCase --> Domain[Reward aggregate]
    UseCase --> Store[History port]
    UseCase --> Notify[Notification port]
      `
    }
  },
  'lld-solid-principles-lab/cohesion-coupling-and-grasp': {
    title: 'Cohesion, coupling, and GRASP',
    summary:
      'Use cohesion and GRASP to place behavior where information already lives, reduce unnecessary dependencies, and keep object collaborations easy to explain.',
    takeaways: [
      'High cohesion comes from grouping related behavior around the data and rules it needs.',
      'Low coupling does not mean no collaboration; it means purposeful collaboration.',
      'GRASP is practical when it helps answer who should do what right now.'
    ],
    examples: [
      {
        id: 'cart-totals',
        label: 'Cart totals',
        title: 'Let the information expert own total recalculation',
        scenario:
          'A shopping cart computes subtotal, discountable amount, shipping threshold, and final total from its line items.',
        decision: 'Keep total and line-item consistency logic in Cart instead of scattering it across controllers or helper utilities.',
        why: [
          'Cart already owns the items and their lifecycle changes.',
          'The recalculation rule stays close to the data it depends on.',
          'Callers do not need to remember to recompute totals after every mutation.'
        ],
        alternative:
          'If several services each compute totals differently, divergence appears quickly and becomes hard to debug.',
        outcome:
          'The cart remains cohesive and its public API reflects real domain actions.'
      },
      {
        id: 'ticket-pricing',
        label: 'Ticket pricing',
        title: 'Introduce indirection only where it reduces real coupling',
        scenario:
          'A ticketing system prices seats using zone, show time, promotions, and user tier while seat selection and payment flows evolve separately.',
        decision: 'Use a pricing policy collaborator for the volatile pricing rule, but keep seat selection and reservation ownership on the show model.',
        why: [
          'The show is the information expert for seat availability, not for every pricing formula.',
          'A small pricing collaborator reduces coupling where change is expected.',
          'The rest of the model stays cohesive because indirection is used sparingly.'
        ],
        alternative:
          'Extracting every calculation into helpers can destroy cohesion and make the object graph harder to follow.',
        outcome:
          'The design balances clear ownership with targeted decoupling.'
      }
    ],
    decisionGuide: {
      prompt: 'Which responsibility-assignment move best improves the model?',
      options: [
        {
          id: 'information-expert',
          label: 'Information expert',
          bestFor: 'Behavior that depends mainly on data already owned by one object.',
          chooseWhen: [
            'One object already has the fields needed to answer the question.',
            'Keeping the logic there improves encapsulation.',
            'Callers would otherwise duplicate the same calculation after each mutation.'
          ],
          tradeOffs: [
            'An object can become too heavy if every nearby rule gets stuffed into it.',
            'Cross-object coordination may still belong elsewhere.',
            'You must guard against infrastructure leaking into the expert.'
          ],
          alternativeOutcome:
            'Ignoring the information expert often creates controller or utility bloat.'
        },
        {
          id: 'controller',
          label: 'Use-case controller or orchestrator',
          bestFor: 'Coordinating several domain objects around one application action.',
          chooseWhen: [
            'The action spans validation, mutation, and optional side effects.',
            'No single entity naturally owns the sequencing logic.',
            'You want one readable entry point for the workflow.'
          ],
          tradeOffs: [
            'Controllers can become procedural if domain rules leak out of the model.',
            'Overly generic controllers add no clarity.',
            'They still need small, intention-revealing methods.'
          ],
          alternativeOutcome:
            'Skipping a coordinator can leave the workflow fragmented across callers and entities.'
        },
        {
          id: 'indirection',
          label: 'Indirection or pure fabrication',
          bestFor: 'Volatile policies or external concerns that would otherwise increase coupling.',
          chooseWhen: [
            'A rule changes independently from the owning entity’s core lifecycle.',
            'An adapter or service can meaningfully isolate infrastructure or algorithm variation.',
            'You can name the abstraction in domain terms.'
          ],
          tradeOffs: [
            'Too much indirection erodes the obviousness of the model.',
            'Fabrications with weak names feel like accidental utility classes.',
            'You still need a stable contract and clear caller.'
          ],
          alternativeOutcome:
            'Avoiding any indirection can glue unrelated change vectors into the same class.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Assign responsibilities in a grocery checkout domain',
      prompt:
        'A grocery checkout flow applies loyalty discounts, validates inventory, computes taxes, and generates a receipt while staying readable enough for a live interview.',
      steps: [
        {
          title: 'Give totals to the information expert',
          detail: 'Let Cart or Order own subtotal and line-item consistency because it already contains the relevant data.',
          whatIf: 'If totals live in controllers or helpers, each caller must remember when to recompute.'
        },
        {
          title: 'Extract volatile policies selectively',
          detail: 'Move tax or promotion strategies out only if they vary independently from cart lifecycle rules.',
          whatIf: 'Keeping every changing algorithm inside the aggregate eventually reduces cohesion.'
        },
        {
          title: 'Use one orchestrator for checkout',
          detail: 'Create a use case entry point that sequences validation, total finalization, persistence, and receipt generation.',
          whatIf: 'Without a coordinator, the checkout flow becomes spread across UI code and entities.'
        },
        {
          title: 'Check coupling after each move',
          detail: 'Ask whether a new class actually reduced a dependency or merely shifted it under a vague name.',
          whatIf: 'False decoupling produces more files without improving the collaboration story.'
        }
      ],
      metrics: ['rules owned by information expert', 'cross-class dependencies per use case', 'duplicate calculations removed', 'abstractions with clear domain names']
    }),
    mermaid: {
      title: 'GRASP responsibility flow',
      caption: 'Cohesive objects own the data-centric rules, while focused collaborators absorb independent variation.',
      code: `flowchart LR
    Checkout[Checkout command] --> Controller[Checkout controller]
    Controller --> Cart[Cart information expert]
    Controller --> Pricing[Pricing policy]
    Controller --> Receipt[Receipt builder]
    Cart --> Totals[Totals and invariants]
      `
    }
  },
  'lld-solid-principles-lab/dependency-injection-and-testability': {
    title: 'Dependency injection and testability',
    summary:
      'Inject collaborators where it improves clarity and determinism, keep composition at the edges, and avoid service-locator patterns that hide what a class really depends on.',
    takeaways: [
      'Constructor injection makes required dependencies and ports visible.',
      'A composition root centralizes wiring so hexagonal adapters stay at the edge and the domain stays framework-light.',
      'Testability improves most when injected seams remove nondeterminism or external effects without blocking a working-demo-first flow.'
    ],
    examples: [
      {
        id: 'password-reset',
        label: 'Password reset',
        title: 'Inject clock, token store, and notifier to make security rules testable',
        scenario:
          'A password-reset flow issues expiring tokens, stores them, and sends reset links while tests must cover expiry and one-time use.',
        decision: 'Use constructor-injected ports for token storage, time, and notification so the reset rule can be exercised deterministically.',
        why: [
          'Required dependencies are explicit in the class API.',
          'Tests can simulate expiration and resend behavior without external systems.',
          'The reset workflow no longer knows transport or storage details.'
        ],
        alternative:
          'Pulling dependencies from globals or a service locator hides the class contract and makes tests awkward to configure.',
        outcome:
          'The business logic becomes easy to test and easier to evolve.'
      },
      {
        id: 'payment-composer',
        label: 'Composition root',
        title: 'Keep object wiring at the edge instead of inside domain classes',
        scenario:
          'A checkout module needs a payment client, receipt renderer, inventory checker, and order repository wired together differently in tests and production.',
        decision: 'Create the concrete graph in one composition root and inject the resulting dependencies into the use case class.',
        why: [
          'Domain code stays focused on behavior rather than on constructing collaborators.',
          'Environment-specific wiring changes in one place.',
          'Tests can assemble small fake graphs without overriding global state.'
        ],
        alternative:
          'If classes new up their own dependencies, they lock in implementation choices and hide true coupling.',
        outcome:
          'The codebase becomes more modular without introducing a heavy framework story.'
      }
    ],
    decisionGuide: {
      prompt: 'What injection approach should lead the design?',
      options: [
        {
          id: 'constructor',
          label: 'Constructor injection',
          bestFor: 'Required dependencies that the class cannot function without.',
          chooseWhen: [
            'The collaborator is mandatory for every call.',
            'You want the dependency list visible to readers and tests.',
            'Immutable setup after construction is desirable.'
          ],
          tradeOffs: [
            'Constructors can become long if a class owns too much.',
            'Optional dependencies need a different expression.',
            'Verbose wiring may reveal a class that should be split.'
          ],
          alternativeOutcome:
            'Hiding required collaborators behind globals makes the dependency graph implicit and brittle.'
        },
        {
          id: 'composition-root',
          label: 'Composition root or factory wiring',
          bestFor: 'Keeping object graph assembly outside the domain layer.',
          chooseWhen: [
            'Several concrete adapters differ by environment.',
            'You want one place to understand how the feature is assembled.',
            'The domain should not know how to construct infrastructure.'
          ],
          tradeOffs: [
            'The wiring file can get busy if not organized by feature.',
            'You still need readable parameter objects or factories for large graphs.',
            'A composition root should not become a second business layer.'
          ],
          alternativeOutcome:
            'If assembly logic spreads across classes, changes become harder to audit and tests get repetitive.'
        },
        {
          id: 'service-locator-warning',
          label: 'Avoid hidden service location',
          bestFor: 'Calling out what not to do when a class looks testable but secretly pulls global state.',
          chooseWhen: [
            'Dependencies are being looked up implicitly at call time.',
            'Tests need complicated global registration to run one method.',
            'The real dependency graph is difficult to discover.'
          ],
          tradeOffs: [
            'Replacing service location may require a small signature refactor.',
            'Some frameworks encourage this pattern, so you must explain the trade-off clearly.',
            'Constructor surfaces can initially look larger after cleanup.'
          ],
          alternativeOutcome:
            'Leaving hidden lookups in place preserves convenience but keeps the class harder to reason about and verify.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Make a scheduling workflow testable',
      prompt:
        'A shift-scheduling feature now needs reliable unit tests for overlap rules, approval timeouts, and notification retries without booting the whole application.',
      steps: [
        {
          title: 'List nondeterministic collaborators',
          detail: 'Identify time, IDs, notification delivery, and persistence as dependencies that should not be hard-coded inside scheduling rules.',
          whatIf: 'If the domain pulls these directly, tests stay fragile and slow.'
        },
        {
          title: 'Inject required dependencies visibly',
          detail: 'Use constructor injection for the collaborators every scheduling command needs so the class contract is obvious.',
          whatIf: 'Hidden dependency lookups make debugging and test setup much harder.'
        },
        {
          title: 'Move wiring to the edge',
          detail: 'Create concrete adapters in one composition root or factory, then pass them into the scheduling use case.',
          whatIf: 'Scattered wiring duplicates environment knowledge and encourages inconsistent setup.'
        },
        {
          title: 'Test domain rules with fakes',
          detail: 'Use in-memory fakes for ports so overlap and timeout behavior can be exercised without external systems.',
          whatIf: 'If every test needs full infrastructure, developers skip coverage on the trickiest rules.'
        }
      ],
      metrics: ['tests running without app bootstrap', 'hidden dependency lookups removed', 'required collaborators exposed in constructors', 'deterministic time-based tests']
    }),
    mermaid: {
      title: 'Dependency injection and composition root',
      caption: 'Concrete wiring sits at the edge, while use cases depend on explicit ports that tests can replace easily.',
      code: `flowchart LR
    Root[Composition root] --> UseCase[Scheduling use case]
    Root --> RepoImpl[Repository adapter]
    Root --> ClockImpl[Clock adapter]
    Root --> NotifyImpl[Notification adapter]
    UseCase --> RepoPort[Repository port]
    UseCase --> ClockPort[Clock port]
    UseCase --> NotifyPort[Notification port]
      `
    }
  },
  'lld-machine-coding-classics/chess-or-game-system-lab': {
    title: 'Chess or game system lab',
    summary:
      'Model a turn-based game by separating board state, move validation, piece behavior, and session orchestration so rules stay explicit and extensible.',
    takeaways: [
      'Board and session state should be authoritative, not scattered across pieces.',
      'Piece-specific rules are a good fit for polymorphism when the contract is honest.',
      'Move history and validation logic deserve first-class modeling in classic game prompts.'
    ],
    examples: [
      {
        id: 'piece-moves',
        label: 'Move generation',
        title: 'Use piece polymorphism only for legal-move generation',
        scenario:
          'A chess-like game needs each piece to propose candidate moves based on its own movement pattern and the current board.',
        decision: 'Keep a shared Piece contract for candidate move generation while the board remains responsible for occupancy and collision checks.',
        why: [
          'Piece behavior varies naturally by type, which makes the polymorphic contract honest.',
          'The board still owns the state needed to judge legality in context.',
          'Move generation stays extensible for new piece types or variants.'
        ],
        alternative:
          'Putting all move rules in one board method creates a branch-heavy monolith that is hard to test per piece.',
        outcome:
          'The design uses polymorphism where it clarifies variation and central state where it clarifies authority.'
      },
      {
        id: 'turn-engine',
        label: 'Turn engine',
        title: 'Separate session orchestration from board mutation',
        scenario:
          'A multiplayer match enforces alternating turns, game-over detection, resign, undo policy, and move history.',
        decision: 'Use a GameSession or Match controller to sequence turns and history while Board plus Piece models handle legal move application.',
        why: [
          'Session state such as whose turn it is does not belong on every piece.',
          'Move history and rule checks remain readable because their roles are explicit.',
          'Undo or replay features gain a natural home.'
        ],
        alternative:
          'If the board owns everything from turns to timers to history, it becomes a dense god object.',
        outcome:
          'The system is easier to extend with timers, spectators, or variants later.'
      }
    ],
    decisionGuide: {
      prompt: 'How should a classic board-game design be partitioned?',
      options: [
        {
          id: 'board-centric',
          label: 'Board-centric state ownership',
          bestFor: 'Keeping piece locations, occupancy, and move application authoritative in one place.',
          chooseWhen: [
            'Global board state matters for every legal move.',
            'You need one source of truth for captures and occupancy.',
            'Context-dependent rules should not be duplicated across pieces.'
          ],
          tradeOffs: [
            'The board can become too smart if every rule is implemented there.',
            'Some piece-specific behavior may still need delegation.',
            'Session concerns like turn timers should stay elsewhere.'
          ],
          alternativeOutcome:
            'If pieces own too much board knowledge, move validation becomes fragmented.'
        },
        {
          id: 'piece-polymorphism',
          label: 'Piece polymorphism',
          bestFor: 'Per-piece move patterns or abilities that truly differ by subtype.',
          chooseWhen: [
            'Each piece can answer the same candidate move contract honestly.',
            'New piece types or rule variants may be added.',
            'Unit tests benefit from piece-focused behavior checks.'
          ],
          tradeOffs: [
            'Pieces should not bypass board authority or mutate global state alone.',
            'Shared helper logic may still need extraction.',
            'Too much hierarchy can emerge if abilities vary by composition instead.'
          ],
          alternativeOutcome:
            'Ignoring polymorphism entirely often centralizes too much branching in one place.'
        },
        {
          id: 'command-history',
          label: 'Move command and history',
          bestFor: 'Undo, replay, auditing, and turn orchestration features.',
          chooseWhen: [
            'The prompt includes move history or rollback behavior.',
            'A move object can carry enough data to replay or inspect decisions.',
            'You want session-level logic separated from board internals.'
          ],
          tradeOffs: [
            'A full command pattern may be heavier than needed for a tiny implementation.',
            'History storage must stay synchronized with state transitions.',
            'Not every round needs undo fully implemented.'
          ],
          alternativeOutcome:
            'Without explicit move history, later undo or audit requirements can force a messy redesign.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Sketch a chess-style system under interview time pressure',
      prompt:
        'Design a turn-based board game with pieces, legal moves, captures, turn order, and basic game-over rules while leaving room for move history and replay.',
      steps: [
        {
          title: 'Pick the authoritative state owner',
          detail: 'Let Board own piece placement and occupancy so move legality always has one reliable source of context.',
          whatIf: 'If each piece tracks too much location state independently, the board can drift out of sync.'
        },
        {
          title: 'Give pieces one honest polymorphic role',
          detail: 'Ask pieces for candidate movement patterns, but keep collision and check-like rules with the board or rule engine.',
          whatIf: 'If pieces both generate and fully validate moves alone, shared rule logic gets duplicated.'
        },
        {
          title: 'Separate session flow',
          detail: 'Use GameSession to alternate turns, track move history, and decide when the board should accept the next command.',
          whatIf: 'Combining turn logic with board mutation makes classic follow-ups harder to absorb.'
        },
        {
          title: 'State the next extension seam',
          detail: 'Call out where undo, timers, or variant rules would attach without rewriting the board core.',
          whatIf: 'If extension points remain implicit, the design sounds less reusable than it is.'
        }
      ],
      metrics: ['legal move rules centralized appropriately', 'piece-specific branches removed', 'session concerns separated from board', 'history support readiness']
    }),
    mermaid: {
      title: 'Board-game object model',
      caption: 'The session coordinates turns, the board owns state, and pieces supply only their variation in movement.',
      code: `flowchart LR
    Session[GameSession] --> Board[Board]
    Session --> History[Move history]
    Board --> Move[Move validator]
    Board --> Piece[Piece hierarchy]
    Piece --> Candidate[Candidate moves]
      `
    }
  },
  'lld-machine-coding-classics/atm-or-vending-machine-lab': {
    title: 'ATM or vending machine lab',
    summary:
      'Handle stateful machine prompts by separating session lifecycle, inventory or cash ownership, and variable dispense policies so the design remains easy to narrate live.',
    takeaways: [
      'Machine prompts usually need both session state and inventory state modeled explicitly.',
      'Cash or item stock should have a clear aggregate owner.',
      'Dispense or change-making rules often deserve a replaceable policy.'
    ],
    examples: [
      {
        id: 'atm-session',
        label: 'ATM session',
        title: 'Model card-session states explicitly before adding device adapters',
        scenario:
          'An ATM inserts card, authenticates PIN, selects operation, dispenses cash, prints receipt, and ejects card with failure handling.',
        decision: 'Use an ATMSession state model for inserted, authenticated, transaction-selected, dispensing, completed, and blocked flows.',
        why: [
          'Session state governs which commands are legal at each moment.',
          'PIN attempts, cancel behavior, and receipt timing are easier to reason about as transitions.',
          'The machine logic stays readable before device-level details are added.'
        ],
        alternative:
          'Flattening the session into flags like pinVerified and cashDispensed creates many illegal combinations quickly.',
        outcome:
          'The ATM answer reads like a defensible stateful workflow instead of a bag of if statements.'
      },
      {
        id: 'vending-inventory',
        label: 'Vending inventory',
        title: 'Let the machine own stock and use a policy for change or selection rules',
        scenario:
          'A vending machine sells snacks, tracks slot inventory, accepts coins, returns change, and may prefer exact change under low-cash conditions.',
        decision: 'Keep slot stock and cash cassettes inside the machine aggregate while a change-making or selection policy handles variable dispense logic.',
        why: [
          'Inventory and cash counts must remain consistent together after a purchase.',
          'Exact-change logic can vary independently from the transaction flow.',
          'The machine remains the authoritative owner of the mutable physical state.'
        ],
        alternative:
          'If selection, cash counts, and change logic are spread across utilities, stock and money updates can diverge.',
        outcome:
          'The design preserves machine invariants while leaving a clear seam for policy changes.'
      }
    ],
    decisionGuide: {
      prompt: 'What abstraction should lead a machine prompt?',
      options: [
        {
          id: 'state-machine',
          label: 'Session state machine',
          bestFor: 'ATMs and flows where command legality depends heavily on current stage.',
          chooseWhen: [
            'Operations such as authenticate, withdraw, cancel, or eject are stage-dependent.',
            'The interviewer is likely to ask about retries or invalid sequences.',
            'A small explicit lifecycle makes the design safer.'
          ],
          tradeOffs: [
            'It can feel formal for tiny flows with only one or two stages.',
            'You still need separate ownership for inventory or account state.',
            'Concurrent sessions require additional boundaries.'
          ],
          alternativeOutcome:
            'Skipping explicit session state often hides the trickiest behavior in machine prompts.'
        },
        {
          id: 'inventory-aggregate',
          label: 'Inventory or cassette aggregate',
          bestFor: 'Protecting stock, cash counts, and physical resource availability.',
          chooseWhen: [
            'Several mutations must stay in sync after a vend or withdrawal.',
            'The machine owns physical state that should not be updated piecemeal.',
            'You need a clear place for count and capacity invariants.'
          ],
          tradeOffs: [
            'The aggregate can grow if UI flow also leaks into it.',
            'External account rules still belong elsewhere.',
            'You must expose stock safely without writable internals.'
          ],
          alternativeOutcome:
            'If inventory counts are updated independently, reconciliation bugs appear quickly.'
        },
        {
          id: 'dispense-policy',
          label: 'Dispense or change policy',
          bestFor: 'Algorithms that choose notes, coins, or items under varying constraints.',
          chooseWhen: [
            'Selection rules vary by currency cassette, slot type, or low-stock mode.',
            'You expect follow-ups around optimization or fallback behavior.',
            'The policy can be tested independently from the main workflow.'
          ],
          tradeOffs: [
            'A policy layer is unnecessary if the algorithm is tiny and fixed.',
            'You still need the machine aggregate to validate results before mutating counts.',
            'Policy naming should stay close to the domain, not generic.'
          ],
          alternativeOutcome:
            'Keeping a volatile dispense algorithm inline often turns the session flow into a hard-to-read method.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design an ATM withdrawal flow',
      prompt:
        'An ATM must accept a card, verify PIN, choose an account, withdraw cash, print an optional receipt, and keep session plus cash state correct.',
      steps: [
        {
          title: 'Draw the session lifecycle',
          detail: 'Model the stages from card inserted through authenticated, transaction selected, dispensing, and completed or canceled.',
          whatIf: 'Without a lifecycle, illegal actions such as withdrawing before PIN verification become easy to miss.'
        },
        {
          title: 'Separate account state from machine state',
          detail: 'Keep bank account operations behind a port or domain boundary while the machine owns physical cash cassette counts and receipt flow.',
          whatIf: 'Mixing remote account logic directly into the machine aggregate makes responsibilities blurry.'
        },
        {
          title: 'Choose a dispense policy',
          detail: 'Use a focused algorithm for note selection when cassette composition matters, but validate the outcome before decrementing counts.',
          whatIf: 'If note selection is improvised inline, low-cash edge cases become difficult to defend.'
        },
        {
          title: 'Test the critical unhappy paths',
          detail: 'Cover bad PIN, insufficient funds, insufficient notes, cancel, and partial-failure handling with explicit session outcomes.',
          whatIf: 'Only testing the happy path hides the exact situations these prompts are designed to probe.'
        }
      ],
      metrics: ['illegal command rejections by session state', 'cash-count consistency after withdrawal', 'dispense policy test coverage', 'session completion without card-ejection bugs']
    }),
    mermaid: {
      title: 'ATM or vending machine structure',
      caption: 'Session flow, machine-owned inventory, and a focused dispense policy keep classic machine prompts understandable.',
      code: `flowchart LR
    User[User] --> Session[Machine session]
    Session --> Machine[Machine aggregate]
    Machine --> Inventory[Cash or item inventory]
    Machine --> Policy[Dispense policy]
    Session --> Account[Account port]
    Session --> Receipt[Receipt adapter]
      `
    }
  },
  'lld-machine-coding-classics/movie-ticket-or-splitwise-lab': {
    title: 'Movie ticket or Splitwise lab',
    summary:
      'Model booking or expense-sharing prompts by making the contested aggregate explicit, isolating variable settlement logic, and protecting lifecycle rules around confirmation.',
    takeaways: [
      'Show or expense group ownership matters more than superficial class count.',
      'Reservation and settlement prompts benefit from explicit workflow stages.',
      'Split policies should vary independently from the rest of the domain model.'
    ],
    examples: [
      {
        id: 'seat-locking',
        label: 'Movie ticket booking',
        title: 'Treat show seating as the aggregate that protects reservation invariants',
        scenario:
          'A movie-booking flow browses shows, selects seats, creates temporary holds, confirms payment, and releases expired holds.',
        decision: 'Let Show or SeatMap own seat availability and hold lifecycle while payment and notification remain side collaborators.',
        why: [
          'Seat availability is the core invariant that must stay authoritative.',
          'Temporary hold and confirmed booking are clearer as named states rather than separate loose records.',
          'The booking workflow can then add payment without weakening the seat model.'
        ],
        alternative:
          'If seat holds and bookings are independent ad hoc objects, double-booking and stale-release bugs become easier to create.',
        outcome:
          'The design communicates exactly where reservation safety lives.'
      },
      {
        id: 'split-strategy',
        label: 'Splitwise expense',
        title: 'Use split policies to vary math without rewriting group ownership',
        scenario:
          'An expense-sharing app supports equal, percentage, exact-amount, and share-based splits across one group balance ledger.',
        decision: 'Keep expense and group ledger ownership in the core model, while split calculation lives behind a policy interface.',
        why: [
          'Group balances and settlements have stable ownership even when split math varies.',
          'Each split rule can validate its own input cleanly.',
          'Adding a new split mode no longer rewrites the expense creation workflow.'
        ],
        alternative:
          'Putting every split rule inside one createExpense method turns the most variable part of the problem into the least maintainable code.',
        outcome:
          'The design stays extensible without obscuring the ledger invariants.'
      }
    ],
    decisionGuide: {
      prompt: 'Which modeling choice best protects the tricky part of the prompt?',
      options: [
        {
          id: 'reservation-aggregate',
          label: 'Reservation aggregate and hold lifecycle',
          bestFor: 'Ticket booking prompts with seat contention and confirmation stages.',
          chooseWhen: [
            'Temporary holds and confirmed bookings must not conflict.',
            'Seat availability is the main invariant under follow-up pressure.',
            'Expiration and release behavior need a clear owner.'
          ],
          tradeOffs: [
            'The aggregate may need careful handling if many seats change together.',
            'Payment must stay coordinated without taking over seat ownership.',
            'Concurrency follow-ups usually arrive quickly and need one hotspot named.'
          ],
          alternativeOutcome:
            'Without a reservation boundary, seat state often spreads across multiple half-authoritative objects.'
        },
        {
          id: 'split-policy',
          label: 'Split calculation strategy',
          bestFor: 'Expense-sharing prompts where the arithmetic varies more than the ledger lifecycle.',
          chooseWhen: [
            'Equal, exact, percentage, or ratio splits share one creation workflow.',
            'Validation differs per split type.',
            'The group ledger should not branch endlessly on split mode.'
          ],
          tradeOffs: [
            'A policy layer adds indirection for small demos with one split type.',
            'Shared output contracts must stay consistent.',
            'The strategy should not own ledger mutation itself.'
          ],
          alternativeOutcome:
            'If split math stays inline, each new mode edits the hottest workflow directly.'
        },
        {
          id: 'workflow-state',
          label: 'Explicit workflow states',
          bestFor: 'Either prompt when creation, confirmation, cancellation, or settlement stages matter.',
          chooseWhen: [
            'Commands are legal only in certain lifecycle stages.',
            'The interviewer is likely to ask about retries or expiration.',
            'You want illegal transitions to be visible and testable.'
          ],
          tradeOffs: [
            'Lifecycle models add structure that may feel heavy for tiny prototypes.',
            'You still need good aggregate boundaries alongside the states.',
            'Transition rules require focused tests.'
          ],
          alternativeOutcome:
            'Keeping lifecycle state implicit makes follow-up questions much harder to answer convincingly.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design a movie-ticket booking workflow',
      prompt:
        'A theater booking system lets users select seats, creates short-lived holds, confirms booking after payment, and releases unused holds automatically.',
      steps: [
        {
          title: 'Identify the invariant owner',
          detail: 'Treat Show or SeatMap as the aggregate that decides whether a seat can move from available to held to booked.',
          whatIf: 'If availability is spread across separate services or records, conflicting holds become difficult to prevent.'
        },
        {
          title: 'Model hold and booking states explicitly',
          detail: 'Use states such as available, held, booked, and released so expiration and confirmation rules are obvious.',
          whatIf: 'Without state names, temporary and confirmed reservations blur together.'
        },
        {
          title: 'Keep payment as a collaborator',
          detail: 'Let payment confirmation trigger the booking transition, but do not make payment logic the owner of seat state.',
          whatIf: 'If payment owns the lifecycle, seat-release and hold-expiry rules become tangled.'
        },
        {
          title: 'Call out the expense-sharing parallel',
          detail: 'Explain that Splitwise-style prompts use the same pattern: one owner for ledger invariants and one strategy seam for split math.',
          whatIf: 'If you miss the shared modeling principle, each classic prompt looks unrelated instead of transferable.'
        }
      ],
      metrics: ['double-booking prevention', 'expired hold cleanup accuracy', 'new split or booking mode changes touching core workflow', 'illegal transition test coverage']
    }),
    mermaid: {
      title: 'Reservation or settlement ownership',
      caption: 'The aggregate protects the core invariant, lifecycle states keep workflows explicit, and strategies vary the math where needed.',
      code: `flowchart LR
    User[User action] --> Flow[Booking or expense workflow]
    Flow --> Aggregate[Show or group aggregate]
    Aggregate --> State[Hold or settlement state]
    Flow --> Strategy[Split or pricing policy]
    Flow --> Payment[Payment or settlement adapter]
      `
    }
  },
  'lld-hot-path-labs/lru-cache-design-lab': {
    title: 'LRU cache design lab',
    summary:
      'Practice the classic cache prompt by defending O(1) ownership, recency transitions, and the point where a local cache should hand off to a distributed tier.',
    takeaways: [
      'An LRU cache needs one fast key index and one explicit recency owner.',
      'Correctness comes from map and list mutations staying in sync under every get and put.',
      'TTL, loaders, and cross-instance coordination are follow-ups layered on a stable local core.'
    ],
    examples: [
      {
        id: 'dll-map-core',
        label: 'Manual structure',
        title: 'Use a hash map plus doubly linked list when the interviewer wants explicit O(1) ownership',
        scenario:
          'You need `get` and `put` in O(1), with every hit moving a key to most recent position and overflow evicting the least recent item.',
        decision: 'Store `key -> node` in a hash map and maintain node order in a doubly linked list so lookups, detach, move-to-front, and tail eviction are all constant time.',
        why: [
          'The map answers where a key lives immediately.',
          'The list answers which key is coldest without scanning.',
          'Each operation can update value and recency inside one coherent method.'
        ],
        alternative:
          'A list without back pointers or a dictionary plus array usually leaks O(n) work into update or eviction paths.',
        outcome:
          'The cache can defend its O(1) claim step by step instead of relying on hand-waving.'
      },
      {
        id: 'ordered-dict-tradeoff',
        label: 'Python interview trade-off',
        title: 'Use OrderedDict when coding speed matters, but still explain the hidden invariant',
        scenario:
          'The interviewer accepts Python library support and cares more about policy clarity than node boilerplate.',
        decision: 'Implement the same recency semantics with OrderedDict while explicitly saying the library is standing in for the map-plus-order data structure.',
        why: [
          'It reduces live-coding noise and lets you spend more time on follow-ups.',
          'The public behavior is the same: hit moves to recent, overflow evicts the oldest.',
          'You can still describe how a manual node-based version would work if asked.'
        ],
        alternative:
          'Using a convenience library without explaining the invariant can make the design sound memorized rather than understood.',
        outcome:
          'You keep the interview focused on ownership, complexity, and extensions.'
      }
    ],
    decisionGuide: {
      prompt: 'Which LRU design move matters most for the current follow-up?',
      options: [
        {
          id: 'core-o1',
          label: 'Protect the O(1) local invariant',
          bestFor: 'Base prompts that focus on `get`, `put`, recency, and eviction correctness.',
          chooseWhen: [
            'The interviewer is still testing the data-structure core.',
            'You need to justify why lookups and eviction remain constant time.',
            'Recency updates and overwrite behavior are more important than extra features.'
          ],
          tradeOffs: [
            'Manual node bookkeeping is more verbose than OrderedDict.',
            'A very compact implementation can hide ownership unless narrated clearly.',
            'You still need tests for overwrite, hit, miss, and overflow cases.'
          ],
          alternativeOutcome:
            'If the base invariant is shaky, later TTL or concurrency discussions will not feel credible.'
        },
        {
          id: 'thread-safe-local',
          label: 'Make the local cache thread-safe',
          bestFor: 'Follow-ups about concurrent readers and writers inside one process.',
          chooseWhen: [
            'Multiple threads can hit the same cache instance.',
            'A read hit changes recency and therefore mutates shared state.',
            'Correctness under one process matters more than maximum throughput.'
          ],
          tradeOffs: [
            'A coarse lock is simple but can serialize hot keys.',
            'Finer-grained locking is harder to explain safely in a timed round.',
            'Thread safety still does not solve cross-instance invalidation.'
          ],
          alternativeOutcome:
            'Ignoring synchronization can let the map and recency list diverge under contention.'
        },
        {
          id: 'distributed-handoff',
          label: 'Bridge to TTL and distributed cache coordination',
          bestFor: 'Prompts that shift from local object design to production cache behavior.',
          chooseWhen: [
            'Multiple app instances must share freshness or invalidation.',
            'The interviewer asks about stampedes, null caching, or write-through behavior.',
            'The local cache is becoming an optimization in front of a shared data source.'
          ],
          tradeOffs: [
            'Distributed coordination adds operational complexity the local LLD should not own directly.',
            'TTL and loaders can obscure the simple recency invariant if introduced too early.',
            'You must define whether local and remote tiers can be stale independently.'
          ],
          alternativeOutcome:
            'Without a clean handoff point, the design either stays too toy-like or grows into an untestable mega-cache.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Defend an LRU cache under realistic follow-ups',
      prompt:
        'A service needs a local cache for hot reads, must evict the least recently used item at capacity, and may later add TTL plus a distributed cache in front of the database.',
      steps: [
        {
          title: 'Name the base invariant',
          detail: 'Keep key lookup and recency ownership explicit so get, put, overwrite, and eviction are coherent before any production extras arrive.',
          whatIf: 'If the O(1) invariant is fuzzy, every follow-up becomes a patch on top of confusion.'
        },
        {
          title: 'Choose the data structures',
          detail: 'Use a hash map and doubly linked list, or OrderedDict with an explicit explanation of how it stands in for the same contract.',
          whatIf: 'If one structure must scan or search for recency updates, the complexity claim fails.'
        },
        {
          title: 'Lock the mutation path',
          detail: 'Treat hit-driven recency updates as writes and protect map and list edits together when the interviewer asks about thread safety.',
          whatIf: 'If list and map mutations interleave unsafely, the cache can return values for nodes that no longer exist in order.'
        },
        {
          title: 'Call out the production bridge',
          detail: 'Explain that TTL, stampede suppression, null caching, and distributed invalidation are separate seams layered on top of the stable local cache.',
          whatIf: 'If you collapse local and distributed ownership too early, the answer loses both clarity and credibility.'
        }
      ],
      metrics: ['cache hit ratio', 'evictions per minute', 'p95 backend load on cache miss', 'duplicate loader calls for the same hot key']
    }),
    mermaid: {
      title: 'LRU cache ownership',
      caption: 'The cache keeps fast lookup and recency in sync locally, then hands off to optional loaders or distributed coordination only after the core invariant is stable.',
      code: `flowchart LR
    Request[Read or write request] --> Cache[Local LRU cache]
    Cache --> Map[Hash map key to node]
    Cache --> List[Doubly linked list recency]
    Cache --> Metrics[Hit and eviction metrics]
    Cache --> Remote[Optional loader or distributed cache]
      `
    }
  },
  'lld-hot-path-labs/rate-limiter-design-lab': {
    title: 'Rate limiter design lab',
    summary:
      'Compare token bucket and sliding window, keep time testable, and explain how a thread-safe local limiter becomes a distributed quota system when many instances share traffic.',
    takeaways: [
      'Keying and response semantics are part of the design, not afterthoughts.',
      'Token bucket and sliding window are strategy choices with different burst and smoothing behavior.',
      'A good local limiter exposes clean seams for clock, policy, and distributed backing state.'
    ],
    examples: [
      {
        id: 'per-user-burst',
        label: 'Per-user API limit',
        title: 'Use token bucket when the product allows short bursts but wants a steady average rate',
        scenario:
          'An authenticated API should let one user make a few quick requests while still preventing sustained overload.',
        decision: 'Give each user key a token bucket with explicit capacity and refill rate so burst allowance and sustained rate are controlled independently.',
        why: [
          'Capacity maps cleanly to allowed burst size.',
          'Refill rate maps cleanly to average sustained throughput.',
          'The state per key stays compact and easy to reason about.'
        ],
        alternative:
          'A single fixed-window counter can create noisy boundary spikes and hides the burst-versus-sustained distinction.',
        outcome:
          'The limiter behaves predictably for normal client bursts without abandoning long-term control.'
      },
      {
        id: 'abuse-sensitive-smoothing',
        label: 'Abuse-sensitive endpoint',
        title: 'Use sliding window when smoother pacing matters more than burst friendliness',
        scenario:
          'A password-reset or login endpoint needs stricter smoothing so attackers cannot cluster attempts near a window boundary.',
        decision: 'Store recent timestamps per key and deny when the last window already contains the allowed number of requests.',
        why: [
          'The decision depends on actual recent history rather than a rough bucket boundary.',
          'It is easier to explain tighter smoothing than with a fixed window counter.',
          'The algorithm fits nicely behind the same strategy interface as token bucket.'
        ],
        alternative:
          'Using the burst-friendly strategy everywhere can be too permissive for abuse-sensitive operations.',
        outcome:
          'The product gets stricter local protection where it matters most.'
      }
    ],
    decisionGuide: {
      prompt: 'Which rate-limiter move best matches the prompt?',
      options: [
        {
          id: 'token-bucket',
          label: 'Token bucket strategy',
          bestFor: 'Endpoints that should absorb small bursts while controlling average rate.',
          chooseWhen: [
            'You need to explain burst size and sustained rate separately.',
            'Compact per-key state is desirable.',
            'A refill model matches the product language naturally.'
          ],
          tradeOffs: [
            'The limiter may feel too permissive for sensitive endpoints.',
            'Retry timing may be approximate unless you track recovery carefully.',
            'Local correctness still needs atomic refill and spend per key.'
          ],
          alternativeOutcome:
            'Choosing a rougher counter can make burst behavior and fairness harder to defend.'
        },
        {
          id: 'sliding-window',
          label: 'Sliding window strategy',
          bestFor: 'Endpoints where smoother pacing matters more than burst tolerance.',
          chooseWhen: [
            'Window-boundary spikes are undesirable.',
            'The interviewer asks for stricter recent-history enforcement.',
            'Memory cost per active key is acceptable for the local design.'
          ],
          tradeOffs: [
            'Timestamp cleanup and storage are heavier than a simple bucket.',
            'Hot keys may need bounded memory discipline in production.',
            'Distributed implementations are trickier than a local deque demo.'
          ],
          alternativeOutcome:
            'If you ignore smoothing requirements, the limiter may pass bursts that still hurt the backend.'
        },
        {
          id: 'redis-bridge',
          label: 'Redis or distributed coordination bridge',
          bestFor: 'Follow-ups where multiple instances must share one quota.',
          chooseWhen: [
            'Traffic is spread across several application instances.',
            'A per-instance in-memory limiter would over-allow aggregate traffic.',
            'You need atomic shared updates for tokens or timestamps.'
          ],
          tradeOffs: [
            'Network latency and storage failures become part of the rate-limit story.',
            'You must decide fail-open or fail-closed behavior for coordinator outages.',
            'The local API should stay stable even as the backing state moves out of process.'
          ],
          alternativeOutcome:
            'Without a distributed bridge, each instance enforces only a partial and misleading quota.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design an interview-grade API rate limiter',
      prompt:
        'An API gateway must rate limit by API key, return HTTP 429 on denial, allow small bursts on normal endpoints, and later support a global quota across many instances.',
      steps: [
        {
          title: 'Pick the identity and contract',
          detail: 'Key the limiter by API key or another product identity and return a decision that maps cleanly to HTTP 429 plus optional Retry-After headers.',
          whatIf: 'If the identity is vague, you cannot explain fairness or isolation between callers.'
        },
        {
          title: 'Choose the right strategy',
          detail: 'Use token bucket for burst-tolerant paths, or sliding window for stricter smoothing, while keeping both behind one strategy interface.',
          whatIf: 'If the algorithm is hard-coded without traffic-shape reasoning, follow-up questions immediately expose the gap.'
        },
        {
          title: 'Inject time and synchronize updates',
          detail: 'Use an injected clock and keep refill or trim plus allow decision in one critical section so local tests and concurrent calls behave predictably.',
          whatIf: 'If current time and state mutation are implicit, edge cases and races become hard to reason about.'
        },
        {
          title: 'Name the distributed handoff',
          detail: 'When several instances share one quota, move shared state to Redis or another atomic coordinator while preserving the same limiter contract at the API edge.',
          whatIf: 'If you keep the same local-only state model across many nodes, the product silently over-allows traffic.'
        }
      ],
      metrics: ['allowed versus denied requests', '429 rate by endpoint', 'average burst size absorbed', 'coordinator latency or error rate']
    }),
    mermaid: {
      title: 'Rate limiter strategy and scale bridge',
      caption: 'Key resolution and response mapping stay stable while algorithm choice and backing state evolve from local memory to shared coordination.',
      code: `flowchart LR
    Request[Incoming request] --> Key[Key resolver]
    Key --> Limiter[Rate limiter service]
    Limiter --> Strategy[Token bucket or sliding window]
    Limiter --> Clock[Injected clock]
    Limiter --> Decision[Allow or 429 decision]
    Strategy --> Store[Local state or Redis]
      `
    }
  }
};

/** @type {Record<string, any>} */
export const lldInteractiveLabs = {
  ...lldCoreInteractive,
  ...lldAdvancedInteractive
};
