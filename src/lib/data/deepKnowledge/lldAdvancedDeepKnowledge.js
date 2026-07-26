/** @type {(...paragraphs: string[]) => string} */
const teachingBody = (...paragraphs) => paragraphs.join('\n\n');

/** @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const lldAdvancedDeepKnowledge = {
  'lld-solid-principles-lab/solid-principles-in-practice': {
    insights: [
      {
        heading: 'SRP as reasons to change, not class size',
        body: teachingBody(
          `Single Responsibility is often misread as “make every class tiny.” In machine-coding and LLD, the useful reading is: group code that changes for the same reason, and separate code that changes for different reasons. An InvoiceService that calculates totals, renders HTML, writes to a database, and sends email has four reasons to change—tax rules, template layout, persistence schema, and delivery channels. Each reason pulls the class in a different direction, so a small notification tweak risks the money math. Split along those axes: a calculator or aggregate for totals, a renderer for presentation, a repository port for storage, and a delivery port for channels.`,
          `After the split, keep one readable orchestrator that names the use case. The orchestrator should sequence validate → compute → persist → notify without re-owning each collaborator’s rules. That preserves a demo-friendly happy path while keeping each collaborator testable. In interviews, state the pressure out loud: “this class changes when X changes” for each type. If you cannot name a distinct reason, you may have over-split. SOLID earns its keep when it explains ownership under follow-ups, not when it maximizes file count.`
        )
      },
      {
        heading: 'OCP needs a real axis of variation',
        body: teachingBody(
          `Open/Closed is valuable when a variation you can name will keep arriving: new redemption tiers, fee formulas, notification channels, or payment methods. The design should let you add a new Strategy, Factory product, or Handler without editing the core workflow’s branching. For example, RedemptionUseCase depends on RedemptionPolicy.calculate(points, member), and CampaignRedemptionPolicy or TieredRedemptionPolicy plug in. The use case stays closed to modification along the pricing axis while remaining open to new policies, which is why SRP plus OCP is such a high-frequency interview signal.`,
          `Without a real axis, OCP becomes premature abstraction: interfaces with one implementation, Strategy classes that never vary, and factories that only construct one type. Prefer a clear conditional until the second or third variant appears, then extract. Also keep extension points owned—someone must decide which policy is selected and where wiring lives. An “open” system with no composition root or factory just scatters construction. In timed rounds, get the happy path running first, then show one seam that absorbs the next likely follow-up.`
        )
      },
      {
        heading: 'LSP and ISP as honesty checks on contracts',
        body: teachingBody(
          `Liskov Substitution asks whether a subtype can stand in for its parent without surprising callers. Classic failures include Square forced under Rectangle with independent width and height setters, or a ReadOnlyRepository that throws on save because the base promised mutation. If callers must know “do not call this on that subtype,” the hierarchy is dishonest. Prefer composition, narrower interfaces, or separate types: MeasurableShape versus ResizableShape, or QueryRepository versus WritableRepository. Behavioral compatibility matters more than shared field names.`,
          `Interface Segregation supports the same honesty. A fat Worker interface with work(), eat(), and sleep() forces Robot to stub eat. Split into Workable and Living so clients depend only on what they use. In LLD answers, call out unsupported operations as a smell: UnsupportedOperationException, empty overrides, or boolean canX() flags that callers must remember. Shrinking or deleting the hierarchy is a valid SOLID outcome. Interviewers reward the detection of a bad abstraction more than loyalty to an inheritance diagram you drew in the first five minutes.`
        )
      },
      {
        heading: 'DIP owned by the caller’s needs',
        body: teachingBody(
          `Dependency Inversion flips the usual direction: high-level policy should not depend on low-level frameworks; both should depend on abstractions shaped by the use case. A password-reset flow needs TokenStore, Clock, and Notifier—not JpaTokenEntity, Instant.now(), and SmtpClient hardcoded inside. In modern wording, those are ports named for domain intent: saveResetToken, isExpired, sendResetLink. Adapters implement the ports with SQL, system time, and email. Tests inject fakes and prove expiry and one-time-use rules without a mail server.`,
          `DIP fails when every concrete helper gets an interface “for purity,” or when ports leak vendor shapes (sendSendGridPayload). Own the abstraction at the boundary that needs stability. Wire concrete adapters in a composition root or factory at the edge of the app. In interviews, pair DIP with a concrete pressure: “I want to unit-test redemption without Postgres” or “SMS and email should swap without editing the use case.” That framing shows SOLID as engineering judgment under change, not a checklist recited after class names.`
        )
      }
    ],
    references: [
      {
        title: 'SOLID',
        url: 'https://en.wikipedia.org/wiki/SOLID',
        source: 'Wikipedia',
        note: 'Compact overview of the five principles and the vocabulary interviewers expect in LLD discussions.'
      },
      {
        title: 'SOLID Principles',
        url: 'https://refactoring.guru/design-patterns/solid',
        source: 'Refactoring Guru',
        note: 'Practical explanations of SRP, OCP, LSP, ISP, and DIP with object-design examples.'
      },
      {
        title: 'The Open-Closed Principle',
        url: 'https://blog.cleancoder.com/uncle-bob/2014/05/12/TheOpenClosedPrinciple.html',
        source: 'Uncle Bob / Clean Coder Blog',
        note: 'Deeper take on extending behavior through abstraction without treating OCP as endless indirection.'
      }
    ]
  },

  'lld-solid-principles-lab/cohesion-coupling-and-grasp': {
    insights: [
      {
        heading: 'Information expert over anemic helpers',
        body: teachingBody(
          `GRASP’s Information Expert says: put a responsibility on the object that already has the data needed to fulfill it. A Cart that owns line items should recalculate subtotal, discountable amount, and shipping threshold after add, remove, or quantity change. If a CartController or PricingUtils recomputes totals from leaked item lists, every mutation site must remember to call the helper, and two helpers will eventually disagree. Keeping recalculation on Cart raises cohesion: data and the rules that protect it live together, and the public API looks like domain actions rather than getters plus external math.`,
          `Expert is not an excuse for a god object. If Cart starts owning payment capture, tax jurisdiction tables, warehouse routing, and email templates, cohesion collapses even though “the cart was nearby.” Extract collaborators when a rule uses data the cart does not own or when the reason to change is independent—PricingPolicy for volatile promotions, TaxPort for jurisdiction. The test is narrative: can you explain in one sentence what Cart is an expert in? If the sentence needs “and also,” split.`
        )
      },
      {
        heading: 'Coupling that is purposeful, not absent',
        body: teachingBody(
          `Low coupling does not mean objects never collaborate. It means each dependency is intentional, narrow, and stable relative to the dependent. A Show that depends on a SeatMap it owns is tight but healthy coupling: they change together as one reservation boundary. A Show that imports a concrete StripeSdk, a Redis client, and a PDF renderer couples the domain to infrastructure volatility. Prefer depending on small ports (PaymentGateway.charge, SeatHoldStore.save) so the show model stays focused on availability and holds.`,
          `Indirection reduces coupling only when it isolates a real change axis. Introducing ICartTotalCalculator with one implementation and three layers of delegation can lower cohesion without helping evolution. In interviews, show one place where you accepted coupling (aggregate internals) and one place where you broke it (pricing policy, notification port). That balance reads as mature OO design: collaborations are visible, but not every calculation is banished to a utility graveyard.`
        )
      },
      {
        heading: 'Creator, controller, and pure fabrication',
        body: teachingBody(
          `GRASP Creator asks who should instantiate whom. Prefer creating an object in the type that aggregates it, closely uses it, or has the initializing data—Order creates OrderLine; Board places Piece; AtmSession may create a WithdrawalAttempt. Controllers (or use-case services) coordinate a workflow without becoming the expert for every rule: CheckoutService asks Cart for totals, PaymentPort to charge, and OrderRepository to save. Pure Fabrication covers objects invented for cohesion or reuse that are not domain nouns—a ChangeMakingPolicy or AuditLogger—when stuffing the behavior into an existing expert would overload it.`,
          `These patterns help under time pressure because they answer “who does what” without requiring a full pattern catalog. If the interviewer asks why PricingPolicy exists, say: fabrication to protect Show cohesion while pricing varies. If they ask why Cart creates LineItem, say: Creator plus Information Expert. Keep names concrete. A Manager or Helper that creates everything and knows everything is neither a good controller nor a good expert—it is a missing responsibility assignment.`
        )
      },
      {
        heading: 'Protected variations at the right boundary',
        body: teachingBody(
          `Protected Variations is GRASP’s cousin to OCP: identify predicted variation points and wrap them behind a stable interface. Ticket pricing that will gain zones, member tiers, and flash sales is a variation point; seat occupancy rules for a single show are less so. Put a PricingPolicy.quote(selection, context) seam in front of the volatile math, and keep seat hold/confirm logic on the Show aggregate. The rest of the model stays readable because indirection is localized where change is expected.`,
          `Overusing protected variations creates a fog of interfaces. Underusing them leaves every new rule editing the same method. Calibrate with the prompt and likely follow-ups. In a shopping cart lab, totals and inventory consistency are invariants; promo engines are variations. In a vending machine, session lifecycle and stock counts are stable ownership; change-making algorithms vary. State the prediction: “I expect pricing to change more than seat ownership, so I protected pricing.” That sentence is often stronger than naming GRASP letters alone.`
        )
      }
    ],
    references: [
      {
        title: 'GRASP (object-oriented design)',
        url: 'https://en.wikipedia.org/wiki/GRASP_(object-oriented_design)',
        source: 'Wikipedia',
        note: 'Summary of Information Expert, Creator, Controller, Low Coupling, High Cohesion, and related responsibility patterns.'
      },
      {
        title: 'Coupling and Cohesion',
        url: 'https://martinfowler.com/ieeeSoftware/coupling.pdf',
        source: 'Martin Fowler (IEEE Software)',
        note: 'Classic framing of how module dependencies and internal focus affect change cost.'
      },
      {
        title: 'Domain Model',
        url: 'https://martinfowler.com/eaaCatalog/domainModel.html',
        source: 'Martin Fowler',
        note: 'Useful lens for putting behavior with domain data instead of scattering rules across services.'
      }
    ]
  },

  'lld-solid-principles-lab/dependency-injection-and-testability': {
    insights: [
      {
        heading: 'Constructor injection as a readable contract',
        body: teachingBody(
          `Constructor injection makes required collaborators impossible to overlook. PasswordResetService(TokenStore tokens, Clock clock, Notifier notifier) advertises that expiry, persistence, and messaging are part of the design. Callers and tests see the graph without reading method bodies for ServiceLocator.get or new SmtpClient(). Prefer immutable final fields assigned once; optional collaborators can use null objects, default strategies, or separate narrower types rather than half-initialized setters that leave objects unusable.`,
          `A long constructor is a design signal, not only a DI inconvenience. If SchedulingService needs twelve ports, the class may own too many reasons to change—split use cases (ProposeShift, ApproveShift, NotifyLateWorker) or introduce a small facade for a cohesive subsystem. In interviews, say you inject what is nondeterministic or replaceable: clocks, IDs, IO, and volatile policies. Pure in-memory value objects and pure functions usually need no injection.`
        )
      },
      {
        heading: 'Composition root at the application edge',
        body: teachingBody(
          `A composition root is the place that builds the object graph: main(), a framework module, or a feature factory. It constructs SqlTokenStore, SystemClock, and SmtpNotifier, then passes them into PasswordResetService. Domain classes do not new up infrastructure and do not know whether they run in production or a test. This is the practical edge of hexagonal architecture: ports point inward from the use case, adapters stay outward at the composition root.`,
          `Keep the root from becoming a second business layer. It should wire, not validate membership tiers or compute fees. Organize wiring by feature if the file grows: createCheckoutGraph(), createSchedulingGraph(). Factories are fine when construction needs configuration, but avoid hidden service locators inside domain methods. In machine-coding rounds, the root can be a tiny main() driver that proves the happy path still runs while keeping assembly outside the core workflow.`
        )
      },
      {
        heading: 'Seams that remove nondeterminism',
        body: teachingBody(
          `Testability improves most when injected seams remove time, randomness, network, and shared mutable globals. For reset tokens, inject Clock so a test can set now to T, issue a token expiring at T+15m, advance to T+16m, and assert rejection. For IDs, inject an IdGenerator to get stable fixtures. For notifications, inject a RecordingNotifier and assert send was called with the expected address once. These tests run in milliseconds without sockets or sleeps, which is exactly the proof style that works well after you have already shown a running happy path.`,
          `Not every dependency needs a mock framework. Prefer simple fakes that implement the same port: an in-memory TokenStore with a Map, a FixedClock, a FakePaymentGateway that fails on demand. Over-mocking interactions (asserting call order on every collaborator) couples tests to structure. Assert outcomes and invariants: token consumed, balance unchanged, session moved to Blocked. Injection enables that style; it does not require a heavy mocking library in a machine-coding round.`
        )
      },
      {
        heading: 'Why service locators hide the real graph',
        body: teachingBody(
          `A service locator lets a class pull dependencies at call time from a global registry: Locator.resolve(Notifier.class). The code looks tidy until you try to test one method and discover you must register half the application, or until two tests mutate the registry and flake. The class’s true coupling is invisible in its signature, so readers underestimate cost of change. Locators also encourage optional, ambient dependencies that should have been explicit design choices.`,
          `If a framework pushes locator-style access, contain it at the edges and still inject ports into domain services. Explain the trade-off in interviews: convenience versus discoverability and test setup. Prefer constructor injection for required collaborators, composition root for wiring, and fakes for ports. When a teammate cannot instantiate your class in a unit test without a container, the dependency story has leaked into ambient context—and ambient context is where LLD answers usually lose points on testability follow-ups.`
        )
      }
    ],
    references: [
      {
        title: 'Inversion of Control Containers and the Dependency Injection pattern',
        url: 'https://martinfowler.com/articles/injection.html',
        source: 'Martin Fowler',
        note: 'Canonical explanation of constructor/setter injection, IoC, and how wiring stays outside domain logic.'
      },
      {
        title: 'Dependency Injection',
        url: 'https://en.wikipedia.org/wiki/Dependency_injection',
        source: 'Wikipedia',
        note: 'Overview of injection styles and how they improve modularity and testing.'
      },
      {
        title: 'Hexagonal Architecture',
        url: 'https://alistair.cockburn.us/hexagonal-architecture/',
        source: 'Alistair Cockburn',
        note: 'Ports-and-adapters framing that pairs naturally with injected seams and composition at the edges.'
      }
    ]
  },

  'lld-machine-coding-classics/chess-or-game-system-lab': {
    insights: [
      {
        heading: 'Board as authoritative occupancy',
        body: teachingBody(
          `In chess-like machine coding, one structure must own where pieces are. A Board (or Grid) maps squares to pieces, answers occupancy and path-blocking questions, and applies moves that update placement atomically. If each Piece stores its own coordinates without a single board index, two pieces can claim the same square after an incomplete update, and “is the path clear?” becomes a scavenger hunt across objects. Pieces may know their color and type; the board knows the position of record.`,
          `Authoritative board state also clarifies captures, undo, and serialization. A move application should remove a captured piece from the board map, place the mover on the destination, and record enough history to reverse the mutation. FEN-like snapshots and replay become straightforward when occupancy lives in one place. In an interview, draw Board at the center early, then hang Piece, Move, and GameSession around it—do not start with a deep Piece inheritance tree before state ownership is settled.`
        )
      },
      {
        heading: 'Honest polymorphism for move generation',
        body: teachingBody(
          `Piece subtypes earn their place when they share a contract they can all honor—typically generateCandidateMoves(board, from) or attacks(board, from). Bishop rays, knight jumps, and pawn pushes differ, so polymorphism removes a giant switch in Board. The contract must stay honest: pieces propose geometric candidates; they should not silently ignore check rules, castling rights, or en passant unless those rules are deliberately delegated. Shared constraints—cannot leave your king in check, cannot pass through blockers—belong in a MoveValidator or Board rules engine that all pieces use.`,
          `Avoid hierarchies that force unsupported operations (promote() on King) or that let pieces mutate the board privately. Composition helps for variants: a Piece has a MovementPattern rather than a deep subclass tree for every fairy piece. Unit-test move generation per piece on a fixed board fixture, then test full legality (pins, check) at the validator level. That split keeps piece tests small and keeps global rules consistent.`
        )
      },
      {
        heading: 'GameSession versus board mutation',
        body: teachingBody(
          `Turn order, timers, resign, draw offers, undo policy, and game-over detection are session concerns. GameSession (or Match) knows whose turn it is, whether the game is Active or Finished, and the move history list. It asks the board/validator whether a proposed move is legal, then commits history and flips the side to move. Putting “whiteToMove” flags and timer deadlines on every Piece or deep inside Board creates a god object that mixes physics of placement with match orchestration.`,
          `Session separation pays off on follow-ups: three-fold repetition needs history; undo needs reversible commands; multiplayer clocks need session state; spectators need read-only views. A Move value object carrying from, to, promotion choice, and captured piece supports replay and audit without exposing board internals. Keep the demo path short—session.tryMove(from, to)—while showing where richer rules attach.`
        )
      },
      {
        heading: 'Check, game-over, and special moves as layered rules',
        body: teachingBody(
          `Special rules are where chess designs collapse into conditionals if layered poorly. Model castling, en passant, and promotion as explicit move kinds or flags validated against rights and history, not as afterthoughts in each piece class. Check detection is a board-wide query: after a tentative move, does any opponent candidate attack the king’s square? Checkmate and stalemate scan whether the side to move has any legal move that leaves their king safe. These queries are expensive if naive, but for interview scope a clear O(candidates) scan is acceptable if explained.`,
          `Implement in layers: (1) pseudo-legal generation with blocking, (2) filter moves that leave own king in check, (3) session applies one legal move and evaluates end conditions. State the simplifications you are making—no underpromotion UI, no fifty-move rule—if time is short, and name the seam where they would plug in. Interviewers care that illegal states are rejected and that rule ownership is narratable more than that every FIDE edge case ships in forty minutes.`
        )
      }
    ],
    references: [
      {
        title: 'State',
        url: 'https://refactoring.guru/design-patterns/state',
        source: 'Refactoring Guru',
        note: 'Useful for match lifecycle states such as active, check, checkmate, resign, and draw.'
      },
      {
        title: 'Command',
        url: 'https://refactoring.guru/design-patterns/command',
        source: 'Refactoring Guru',
        note: 'Move-as-command modeling for undo, replay, and audited turn history.'
      },
      {
        title: 'Rules of chess',
        url: 'https://en.wikipedia.org/wiki/Rules_of_chess',
        source: 'Wikipedia',
        note: 'Reference for movement, special moves, and end conditions when scoping a chess LLD.'
      }
    ]
  },

  'lld-machine-coding-classics/atm-or-vending-machine-lab': {
    insights: [
      {
        heading: 'Session lifecycle before device adapters',
        body: teachingBody(
          `ATM and vending prompts are stateful workflows first. An AtmSession might move through NoCard → CardInserted → Authenticated → TransactionSelected → Dispensing → Completed, with Cancelled and Blocked as exits. Each state declares legal commands: enterPin is valid when CardInserted; withdraw is valid when Authenticated; ejectCard is almost always available except mid-dispense depending on product rules. Modeling this as an explicit state machine (or transition table) prevents flag soup like pinOk && !dispensed && cardInside with impossible combinations.`,
          `Device adapters—card reader, PIN pad, cash dispenser, receipt printer—plug into the session later. Do not start the design by listing hardware classes. Start by listing illegal sequences the interviewer will ask about: withdraw before PIN, cancel during dispense, third wrong PIN. Return domain errors and transition to safe states (retain card, eject card, return to idle). The narrative “commands are only legal in some states” is the core of a strong machine-coding answer.`
        )
      },
      {
        heading: 'Inventory and cash as one consistency boundary',
        body: teachingBody(
          `Physical resources need an aggregate owner. A VendingMachine or CashCassetteInventory should own slot counts and coin/note counts so a purchase that decrements stock and coin inventory cannot half-apply. For ATM withdrawal, the machine owns cassette denoms and counts; the bank account balance lives behind an AccountPort. The withdrawal transaction coordinates: authenticate session → check account funds via port → plan dispense → commit cassette mutation → confirm account debit (order depends on failure policy). Never update cassette counts in one helper and account balance in another without a defined commit/rollback story.`,
          `Invariants to state aloud: cassette counts never go negative; a slot cannot vend below zero stock; change given plus coins kept equals coins inserted for a successful vend; a failed vend restores money and stock. Encode these in the aggregate methods (vend, collectChange, dispense) rather than in UI controllers. Concurrent sessions on one machine usually serialize through the machine aggregate or a single-threaded command queue in interview designs.`
        )
      },
      {
        heading: 'Dispense and change-making as replaceable policy',
        body: teachingBody(
          `Note selection and coin change are algorithms that vary independently of session flow. A DispensePolicy might greedily prefer largest notes, minimize note count, or refuse when exact change cannot be made. A ChangeMaker can return an empty optional when cassettes cannot satisfy the residual amount, forcing the session into an ExactChangeOnly or TransactionFailed path. Keep the policy pure where possible: given cassette snapshot and amount, return a plan; the machine aggregate validates and applies the plan under its lock.`,
          `This Strategy seam is a classic follow-up magnet: “What if we add a new denomination?” “What if we prefer to empty nearly-full cassettes?” Swap the policy without rewriting PIN or card states. Test policies with table-driven fixtures—amount 180 with [100,50,20] counts—and test the machine separately for applying a plan or rejecting an infeasible one. Inline greedy change inside a 200-line vend method is how these designs become hard to defend live.`
        )
      },
      {
        heading: 'Failure modes and partial commit stories',
        body: teachingBody(
          `Machine prompts are graded on unhappy paths. Wrong PIN increments attempts and may Block the card/session. Insufficient funds rejects before cassette motion. Insufficient notes rejects after planning. Cancel returns to a safe idle and ejects the card. The hard case is partial failure: account debited but dispenser jam, or coins accepted then stock sensor fails. Decide a policy: compensate (credit account, transition to OutOfService), or dispense-first with debit confirmation, and say what operators see.`,
          `Make outcomes explicit types: WithdrawalResult.Success, FailedInsufficientCash, FailedAccount, Cancelled. Avoid boolean pairs. Persist enough session outcome for receipts and audits. In tests, cover at least bad PIN lockout, cancel after auth, infeasible dispense, and exact-change refusal. Interviewers often care less about printer APIs than whether your state machine and inventory aggregate still hold after these faults.`
        )
      }
    ],
    references: [
      {
        title: 'State',
        url: 'https://refactoring.guru/design-patterns/state',
        source: 'Refactoring Guru',
        note: 'Session lifecycles for card inserted, authenticated, dispensing, blocked, and idle.'
      },
      {
        title: 'Strategy',
        url: 'https://refactoring.guru/design-patterns/strategy',
        source: 'Refactoring Guru',
        note: 'Replaceable dispense and change-making policies under varying cassette constraints.'
      },
      {
        title: 'Finite-state machine',
        url: 'https://en.wikipedia.org/wiki/Finite-state_machine',
        source: 'Wikipedia',
        note: 'Background for modeling legal command sequences in ATM and vending flows.'
      }
    ]
  },

  'lld-machine-coding-classics/movie-ticket-or-splitwise-lab': {
    insights: [
      {
        heading: 'Seat map as the contested aggregate',
        body: teachingBody(
          `Movie booking is an inventory problem: two users must not confirm the same seat for the same show. Put that invariant on Show, Screening, or SeatMap—whatever owns the seat grid for one performance. Operations like hold(seats, user, expiresAt), confirm(holdId), and release(holdId) should be the only writers of seat availability. Search and catalog services can be stale; the reserve/confirm path cannot be a casual read-then-write across disconnected seat rows without a concurrency story (lock, version, transaction, or single-threaded aggregate).`,
          `Model seat status explicitly: Available, Held, Booked (and maybe Blocked). Holds carry owner, expiry, and seat set. Confirmation checks the hold is still active and owned by the payer, then transitions seats to Booked in one step. Do not treat Hold and Booking as unrelated tables updated by separate services with no owner. In interviews, point at the aggregate and say: “double-booking is impossible here, or we fail closed.” That sentence is the heart of the design.`
        )
      },
      {
        heading: 'Hold expiry and payment coordination',
        body: teachingBody(
          `Temporary holds let checkout finish without permanently taking inventory. A 10-minute hold should expire exactly once even if a sweeper runs twice or the user pays at the deadline. expireHold must be idempotent: if already confirmed or released, no-op; if Held and now past expiry, return seats to Available. confirmHold must re-check expiry with a consistent clock inside the same critical section as the state change. Background jobs help cleanup; they are not the only correctness mechanism.`,
          `Payment is a collaborator, not the seat owner. Flow: create hold → charge PaymentPort → confirm hold → emit ticket. Define failure: charge succeeds but confirm fails (refund/compensate); confirm should not run if hold expired. Pass Clock into domain methods for tests. Gracefully narrate race at last seat: one hold wins, the other gets Rejected. These details separate a booking LLD from a diagram of Movie, User, and Seat nouns.`
        )
      },
      {
        heading: 'Splitwise ledger ownership versus split math',
        body: teachingBody(
          `Expense-sharing designs need a stable ledger owner—usually Group or BalanceLedger—that records who owes whom after each expense and settlement. Creating an expense should validate participants, compute line shares, and update balances atomically from the ledger’s perspective. Settlements reverse or reduce balances with the same care. The ledger invariants matter more than the number of entity classes: balances should be consistent with the sum of accepted expenses and settlements, and a user should not see phantom debt from a partial update.`,
          `Split arithmetic varies: equal, exact amounts, percentages, shares. Put that variation behind SplitPolicy.split(total, participants, params) returning validated Share lines that sum to the total (within minor-unit rules). The expense creation workflow stays closed while new split modes appear. Validate inside each policy—percentages sum to 100, exact amounts sum to total—so createExpense does not become a nest of conditionals. Money as integer minor units avoids floating-point drift in “split $10 three ways” demos.`
        )
      },
      {
        heading: 'Settlement simplification as an optional policy',
        body: teachingBody(
          `Follow-ups often ask to minimize transactions: if A owes B 10 and B owes A 4, net to A owes B 6; multilaterally, simplify the debt graph. Keep simplification as a pure function or SettlementPolicy over a balance snapshot, not as scattered mutations inside UI handlers. The ledger can expose getBalances() and applySettlement(payer, payee, amount), while a simplifier suggests a minimal set of transfers the group may accept. Whether you auto-apply or only suggest is a product choice—say which one you implement in v1.`,
          `For interviews, implement clear balances and one split mode first, then show where equal/percentage policies and simplification attach. Avoid premature graph algorithms if time is short; show the data model and a correct netting example. Tie booking and Splitwise together pedagogically: both protect a contested resource (seats or balances) with an aggregate, and both isolate volatile calculation (pricing/holds vs split math) behind strategy-like seams. That parallel helps you reuse design instincts across classic prompts.`
        )
      }
    ],
    references: [
      {
        title: 'DDD Aggregate',
        url: 'https://martinfowler.com/bliki/DDD_Aggregate.html',
        source: 'Martin Fowler',
        note: 'Lens for choosing Show/SeatMap or Group/Ledger as the consistency boundary.'
      },
      {
        title: 'Strategy',
        url: 'https://refactoring.guru/design-patterns/strategy',
        source: 'Refactoring Guru',
        note: 'Split policies and settlement simplification as replaceable calculation strategies.'
      },
      {
        title: 'Value Object',
        url: 'https://martinfowler.com/bliki/ValueObject.html',
        source: 'Martin Fowler',
        note: 'Money, seat identifiers, and share lines as immutable values with validation.'
      }
    ]
  },

  'lld-hot-path-labs/lru-cache-design-lab': {
    insights: [
      {
        heading: 'O(1) requires two owners, not one overloaded structure',
        body: teachingBody(
          `An interview-quality LRU cache works because lookup and recency are separate concerns with separate data-structure support. The hash map owns fast key-to-node access. The doubly linked list owns the order from most recent to least recent. If one structure tries to do both jobs without strong guarantees, hidden linear work usually appears in overwrite, move-to-front, or eviction. Candidates often say “dictionary plus list” but then cannot explain how middle removal stays O(1). The missing ingredient is node identity with back pointers, or a library type such as OrderedDict that already bundles those guarantees.`,
          `The best explanation is operational: get(key) does a map lookup, then a constant-time node move; put(key, value) updates or inserts in constant time, and overflow evicts the tail-adjacent node. That walk-through is stronger than saying “hash map + DLL” as a memorized phrase. Interviewers want to hear who updates recency, who removes stale keys from the map, and why no step scans the cache.`
        )
      },
      {
        heading: 'Recency policy is a domain rule, not a side effect',
        body: teachingBody(
          `LRU is really a policy definition: “the next eviction target is the key whose successful access is oldest.” That means every hit and every overwrite must have a defined effect on recency. Some production caches distinguish read recency, write recency, refresh-after-write, or segmented admission policies, but the interview baseline should stay explicit and consistent. If you do not state whether overwrite refreshes a key, reviewers cannot tell whether your ordering semantics are intentional or accidental.`,
          `This is why a small cache object should own both map edits and list edits in one method. Otherwise a value update can succeed while recency stays stale, or eviction can remove a node that the map still points to. Keeping policy ownership central makes follow-up questions easier too: TTL adds expiry metadata, but does not change who owns recency; read-through adds a loader seam, but does not change who owns eviction.`
        )
      },
      {
        heading: 'Thread safety starts with protecting hit-driven mutation',
        body: teachingBody(
          `Engineers often underestimate LRU concurrency because “get” sounds read-only. In an LRU, a hit mutates the order. Two concurrent hits or a hit racing a put can corrupt the linked list if pointer edits interleave. The clean first answer is a coarse lock around get and put so recency updates, inserts, and evictions happen atomically relative to one another. That may not be the highest-throughput design, but it is the easiest one to defend correctly in a local machine-coding interview.`,
          `More advanced designs can shard by key space, use striped locks, or separate a read-through front cache from a write-serialized maintenance path, but those optimizations only make sense after the invariant is solid. The judgment signal in interviews is knowing not to jump to fancy lock-free claims when the prompt only needs a correct, thread-safe local cache.`
        )
      },
      {
        heading: 'Production cache questions are really about stampedes and ownership boundaries',
        body: teachingBody(
          `Once the local LRU works, production follow-ups usually shift to cache stampede prevention, negative-result caching, invalidation, and metrics. Stampede control needs a seam for single-flight loading or per-key in-flight coordination so a hot miss does not trigger many identical backend calls. Null or negative caching needs a way to distinguish “cached absence” from “key not present in cache.” Metrics such as hit ratio, miss cost, evictions, and loader latency tell you whether the cache is helping or hiding deeper problems.`,
          `A local LRU should also know when to stop. If several application instances need one shared freshness contract or shared quota of cached objects, the LLD hands off to a distributed cache or invalidation system. That handoff is part of a mature answer: the local cache still optimizes in-process reads, but Redis or another distributed layer becomes the shared coordination point.`
        )
      }
    ],
    references: [
      {
        title: 'Cache replacement policies',
        url: 'https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)',
        source: 'Wikipedia',
        note: 'Compact reference for LRU semantics and how recency-based eviction differs from other policies.'
      },
      {
        title: 'cachetools',
        url: 'https://cachetools.readthedocs.io/en/stable/',
        source: 'cachetools documentation',
        note: 'Useful production-oriented Python examples covering LRU, TTL caches, and decorator patterns around local caching.'
      },
      {
        title: 'Caching challenges and strategies',
        url: 'https://noise.getoto.net/tag/cache/',
        source: 'Cloudflare Engineering',
        note: 'Operational reading on cache behavior, hot objects, and why real cache deployments need more than a local data structure.'
      }
    ]
  },

  'lld-hot-path-labs/rate-limiter-design-lab': {
    insights: [
      {
        heading: 'Rate limiting is a policy contract before it is an algorithm choice',
        body: teachingBody(
          `Good rate-limiter answers start by naming the protected identity and the result contract. Limiting “requests” without saying whether the key is user, IP, API key, tenant, or route-plus-identity is incomplete because fairness and abuse isolation depend on that choice. Likewise, a bare boolean return omits important API behavior: production gateways often translate denials into HTTP 429 and may attach Retry-After when recovery time is known.`,
          `This framing is one reason the prompt remains popular in 2025 and 2026. It tests whether candidates think like product and platform engineers rather than only like algorithm memorizers. A clean local design says: given a key and current time, produce an allow or deny decision under one policy. Everything else builds from that contract.`
        )
      },
      {
        heading: 'Token bucket and sliding window encode different fairness stories',
        body: teachingBody(
          `Token bucket is ideal when you want to tolerate short bursts but bound long-run average rate. Capacity controls how much burst you allow; refill rate controls sustained throughput. Sliding window tells a different story: recent history matters more than burst allowance, so the limiter rejects clustered calls when the active window already contains too many events. Neither is “more correct” in the abstract. They answer different traffic-shape requirements.`,
          `The strongest LLD answer models this as a Strategy seam instead of a one-off if statement. The limiter service owns identity resolution, synchronization, and response mapping; the algorithm strategy owns the token math or timestamp trimming. That keeps the design interview-ready because you can compare policies without redrawing the whole object graph.`
        )
      },
      {
        heading: 'Injected clocks and atomic updates make tests and concurrency sane',
        body: teachingBody(
          `Time is the hidden dependency in every rate limiter. Injecting a Clock makes edge cases deterministic: a bucket refilling after exactly one second, a window dropping a boundary event, or a long idle period restoring burst capacity. In production, the clock should usually be monotonic rather than wall-clock based so leap adjustments do not create accidental refills or negative elapsed time. In tests, a fixed or manually advanced clock turns the algorithm into a predictable state machine.`,
          `Concurrency matters because refill or trim plus consume must be one atomic operation per key. If two threads both observe the same token balance or same window length before updating it, the limiter over-allows traffic. A coarse lock is often enough for the local interview version. More sophisticated sharding is a performance optimization, not the conceptual heart of the design.`
        )
      },
      {
        heading: 'Distributed rate limiting is a scale bridge, not a reason to skip local design',
        body: teachingBody(
          `A process-local limiter only protects the traffic that process sees. In horizontally scaled services, several instances can each allow their local quota and collectively exceed the intended global rate. That is the moment to bridge into distributed coordination: Redis counters, sorted sets, Lua scripts, or API-gateway-native quota systems. The design question becomes which state must be shared atomically per key and what to do if the coordinator is slow or unavailable.`,
          `This is also where fail-open versus fail-closed and idempotency enter the conversation. Abuse-sensitive endpoints may prefer fail-closed when the coordinator cannot confirm quota, while latency-sensitive read paths may prefer fail-open to preserve availability. Retried idempotent requests may need duplicate detection so the same logical request does not spend quota twice. A mature answer treats these as policy decisions layered on the same limiter contract.`
        )
      }
    ],
    references: [
      {
        title: 'Rate limiting',
        url: 'https://www.cloudflare.com/learning/bots/what-is-rate-limiting/',
        source: 'Cloudflare Learning Center',
        note: 'Practical explanation of why rate limiting exists and how burst and abuse scenarios shape policy choice.'
      },
      {
        title: 'Rate limiting pattern',
        url: 'https://redis.io/redis-best-practices/basic-rate-limiting/',
        source: 'Redis best practices',
        note: 'Shows how local rate-limit concepts map to distributed coordination with Redis.'
      },
      {
        title: '429 Too Many Requests',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
        source: 'MDN',
        note: 'Reference for the standard HTTP denial semantics and Retry-After behavior expected in API discussions.'
      }
    ]
  }
};
