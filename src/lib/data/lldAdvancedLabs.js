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

const section = (heading, firstParagraph, secondParagraph, bullets, exampleTitle, exampleCode) => ({
  heading,
  body: paragraphs(firstParagraph, secondParagraph),
  bullets,
  codeExample: codeExample(exampleTitle, exampleCode)
});

const solidLesson = {
  slug: 'solid-principles-in-practice',
  title: 'SOLID principles in practice',
  summary:
    'Use SRP, OCP, LSP, ISP, and DIP as practical interview heuristics for splitting responsibilities, constraining extension points, and keeping object models readable under change.',
  duration: '55-75 min',
  whyItMatters:
    'Interviewers rarely care whether you can recite the SOLID acronym in order. They care whether you can spot a class that changes for too many reasons, a workflow that keeps editing the same conditional, or an abstraction that looks reusable but actually traps callers. In practice, SRP and OCP are the highest-frequency interview signals, while DIP matters most when you name thin ports and adapters for volatile dependencies. SOLID gives names to those design pressures so you can refactor deliberately instead of decorating a messy design with pattern vocabulary.',
  sections: [
    section(
      'Start with change pressure, not acronym recitation',
      'A strong SOLID answer begins by identifying what is unstable in the design. If payment rules, invoice formatting, persistence, and notification delivery all live in the same class, the real problem is not that the code forgot a principle poster on the wall. The real problem is that unrelated reasons to change have been bundled together, so every edit becomes riskier and every test must understand state that it does not actually care about.',
      'This matters in machine-coding rounds because candidates often create a large service to move faster. That can be acceptable for the first five minutes, but the next step should be extracting stable boundaries. When you describe SOLID as a way to isolate change pressure, you sound practical: the goal is not more classes, the goal is smaller blast radius, clearer tests, and easier extension when a new rule or collaborator appears.',
      [
        'Name the axis of change before proposing a class split.',
        'Prefer boundaries that make tests smaller, not only diagrams prettier.',
        'Allow a temporary coarse service early, then refactor once responsibilities appear.',
        'Explain SOLID in terms of maintenance cost and extension safety.'
      ],
      'A god class hides multiple reasons to change',
      `
class OrderProcessor:
    def checkout(self, cart, customer, db, notifier):
        subtotal = sum(item["price"] * item["qty"] for item in cart["items"])
        if customer["tier"] == "gold":
            subtotal *= 0.9
        invoice_text = f"invoice for {customer['name']}: {subtotal}"
        db["orders"].append({"customer_id": customer["id"], "total": subtotal})
        notifier.send(customer["email"], invoice_text)
        return subtotal


class PrintNotifier:
    def send(self, address, message):
        print(f"notify {address}: {message}")


if __name__ == "__main__":
    processor = OrderProcessor()
    total = processor.checkout(
        {"items": [{"price": 50, "qty": 2}]},
        {"id": "c1", "name": "Ava", "tier": "gold", "email": "ava@example.com"},
        {"orders": []},
        PrintNotifier(),
    )
    print("total", total)
`
    ),
    section(
      'SRP and OCP: separate workflow from policy variation',
      'Single Responsibility Principle is best explained as one primary reason to change, not one method or one field. A checkout workflow should coordinate steps such as pricing, persistence, and notification, but the detailed pricing rule should live in a pricing object because promotions change for business reasons while checkout ordering changes for workflow reasons. That split gives SRP. In many current LLD rounds, this SRP-plus-OCP pairing is the main signal interviewers are actually grading.',
      'Open Closed Principle is often abused as an argument against editing any file. In reality, some files should change. The point is that a stable high-level workflow should not be repeatedly edited every time a new pricing policy or tax rule appears. If the extension point matches real variability, a new implementation is easier to test and less likely to break the rest of the use case. If no real variability exists, adding an abstraction is premature ceremony.',
      [
        'SRP isolates one primary reason to change.',
        'OCP is valuable when policy variation is real and recurring.',
        'Stable workflows should depend on replaceable pricing or validation objects.',
        'Do not invent extension points with no expected variation.'
      ],
      'Pricing policy extracted from checkout flow',
      `
class PricingPolicy:
    def total(self, cart, customer):
        raise NotImplementedError


class StandardPricing(PricingPolicy):
    def total(self, cart, customer):
        return sum(item["price"] * item["qty"] for item in cart["items"])


class GoldPricing(PricingPolicy):
    def total(self, cart, customer):
        subtotal = sum(item["price"] * item["qty"] for item in cart["items"])
        return subtotal * 0.9


class CheckoutService:
    def __init__(self, pricing_policy):
        self.pricing_policy = pricing_policy

    def checkout(self, cart, customer):
        return self.pricing_policy.total(cart, customer)


if __name__ == "__main__":
    cart = {"items": [{"price": 30, "qty": 3}]}
    customer = {"tier": "gold"}
    service = CheckoutService(GoldPricing())
    print(service.checkout(cart, customer))
`
    ),
    section(
      'LSP and ISP: abstractions must stay honest',
      'Liskov Substitution Principle means callers should be able to rely on an abstraction without memorizing traps in specific implementations. In interviews, the easiest violation to explain is when a subtype silently narrows valid inputs, throws for behavior the base contract promised, or mutates state in a way that surprises the caller. That is usually a sign that the abstraction is too broad or that two concepts have been forced into the same hierarchy because they share a word rather than behavior.',
      'Interface Segregation Principle is the repair tool for many LSP problems. If one client needs scanning and another needs printing, a giant Machine interface invites fake methods or runtime errors. Smaller, role-specific interfaces keep dependencies honest and reduce mocking pain in tests. Interviewers appreciate this explanation because it connects abstract principles to a daily cost: broad interfaces make every client know too much and stub too much.',
      [
        'A subtype should not reject behavior the parent contract promises.',
        'Wide interfaces often force fake or unsupported methods.',
        'Split interfaces by client needs, not by nouns alone.',
        'Prefer composition when two behaviors vary independently.'
      ],
      'Segregated interfaces avoid dishonest implementations',
      `
class Printer:
    def print_document(self, text):
        raise NotImplementedError


class Scanner:
    def scan_document(self):
        raise NotImplementedError


class OfficePrinter(Printer, Scanner):
    def print_document(self, text):
        print(f"printing: {text}")

    def scan_document(self):
        return "scanned page"


class ReceiptPrinter(Printer):
    def print_document(self, text):
        print(f"receipt: {text}")


if __name__ == "__main__":
    printer = ReceiptPrinter()
    printer.print_document("paid")
    device = OfficePrinter()
    print(device.scan_document())
`
    ),
    section(
      'DIP: high-level policy should depend on seams',
      'Dependency Inversion Principle is most useful when a high-level workflow depends on details that change for environmental reasons. Databases, clocks, payment gateways, and message delivery channels should be injected so the workflow can be tested with small fakes and switched in production with one composition root. In modern wording, the use case depends on thin ports while infrastructure supplies adapters. The point is not that everything becomes an interface. The point is that volatile details stop reaching upward into policy code.',
      'A common machine-coding failure is hiding dependencies inside constructors or static helpers because it feels faster. That shortcut grows expensive immediately when you need deterministic tests or a second integration. Constructor injection makes collaborations visible, and visibility is what allows a reviewer to reason about behavior. In interviews, saying that DIP creates explicit port-and-adapter seams for tests and deployment choices is much stronger than saying it makes code loosely coupled in the abstract.',
      [
        'Inject volatile dependencies such as repos, clocks, and gateways.',
        'Keep composition at the edge of the system where wiring belongs.',
        'Use small fakes in tests to make workflows deterministic.',
        'Do not wrap stable domain objects behind needless interfaces.'
      ],
      'Injected seams keep policy code stable',
      `
class OrderRepository:
    def save(self, order):
        raise NotImplementedError


class Notifier:
    def send_receipt(self, address, total):
        raise NotImplementedError


class InMemoryOrderRepository(OrderRepository):
    def __init__(self):
        self.saved = []

    def save(self, order):
        self.saved.append(order)


class PrintNotifier(Notifier):
    def send_receipt(self, address, total):
        print(f"sent receipt to {address} for {total}")


class PlaceOrder:
    def __init__(self, repo, notifier):
        self.repo = repo
        self.notifier = notifier

    def execute(self, customer, total):
        order = {"customer_id": customer["id"], "total": total}
        self.repo.save(order)
        self.notifier.send_receipt(customer["email"], total)
        return order


if __name__ == "__main__":
    use_case = PlaceOrder(InMemoryOrderRepository(), PrintNotifier())
    print(use_case.execute({"id": "c1", "email": "ava@example.com"}, 120))
`
    ),
    section(
      'Refactor order: make the next change easy to explain',
      'The best interview use of SOLID is not turning a small script into a forest of classes. It is showing a sensible refactor order. Start with the one class that obviously changes for multiple reasons. Extract one policy or boundary at a time. Re-run the story through the updated object graph and show how a follow-up requirement lands in one place. That demonstrates judgment because you are proving the design earns its indirection.',
      'A good closing explanation sounds like this: the checkout workflow now coordinates, pricing implementations own discount variation, the repository owns persistence, and the notifier owns delivery. New discount rules do not force edits to the workflow, tests can replace infrastructure with fakes, and each abstraction has a reason to exist. Interviewers usually trust this answer because it ties every principle back to a concrete maintenance benefit instead of an academic slogan.',
      [
        'Refactor one pressure point at a time instead of introducing every principle at once.',
        'Demonstrate the next requirement and show where it lands.',
        'Use composition roots to keep wiring out of domain code.',
        'Defend every abstraction with a concrete change scenario.'
      ],
      'A composed checkout model is easier to extend',
      `
class PricingPolicy:
    def total(self, cart, customer):
        raise NotImplementedError


class TieredPricing(PricingPolicy):
    def total(self, cart, customer):
        subtotal = sum(item["price"] * item["qty"] for item in cart["items"])
        return subtotal * 0.9 if customer["tier"] == "gold" else subtotal


class ConsoleNotifier:
    def send_receipt(self, address, total):
        print(f"receipt to {address}: {total}")


class CheckoutApplication:
    def __init__(self, pricing, notifier):
        self.pricing = pricing
        self.notifier = notifier

    def run(self, cart, customer):
        total = self.pricing.total(cart, customer)
        self.notifier.send_receipt(customer["email"], total)
        return total


if __name__ == "__main__":
    app = CheckoutApplication(TieredPricing(), ConsoleNotifier())
    print(app.run({"items": [{"price": 20, "qty": 4}]}, {"tier": "standard", "email": "sam@example.com"}))
`
    )
  ],
  exercises: [
    codingExercise(
      'solid-refactor-god-class',
      'Refactor a checkout god class',
      'Split pricing, persistence, and notification responsibilities so the checkout workflow stops owning every detail.',
      `
class CheckoutManager:
    def checkout(self, cart, customer, db, notifier):
        subtotal = sum(item["price"] * item["qty"] for item in cart["items"])
        # TODO: move discount policy out of this method.
        if customer["tier"] == "gold":
            subtotal *= 0.9
        db["orders"].append({"customer_id": customer["id"], "total": subtotal})
        notifier.send(customer["email"], subtotal)
        return subtotal


class PrintNotifier:
    def send(self, address, total):
        print(f"{address}:{total}")


checkout = CheckoutManager()
print(checkout.checkout({"items": [{"price": 50, "qty": 2}]}, {"id": "c1", "tier": "gold", "email": "ava@example.com"}, {"orders": []}, PrintNotifier()))
`,
      `
class PricingPolicy:
    def total(self, cart, customer):
        raise NotImplementedError


class TieredPricing(PricingPolicy):
    def total(self, cart, customer):
        subtotal = sum(item["price"] * item["qty"] for item in cart["items"])
        return subtotal * 0.9 if customer["tier"] == "gold" else subtotal


class OrderRepository:
    def __init__(self):
        self.orders = []

    def save(self, order):
        self.orders.append(order)


class PrintNotifier:
    def send(self, address, total):
        print(f"{address}:{total}")


class CheckoutManager:
    def __init__(self, pricing, repo, notifier):
        self.pricing = pricing
        self.repo = repo
        self.notifier = notifier

    def checkout(self, cart, customer):
        total = self.pricing.total(cart, customer)
        self.repo.save({"customer_id": customer["id"], "total": total})
        self.notifier.send(customer["email"], total)
        return total


repo = OrderRepository()
checkout = CheckoutManager(TieredPricing(), repo, PrintNotifier())
print(checkout.checkout({"items": [{"price": 50, "qty": 2}]}, {"id": "c1", "tier": "gold", "email": "ava@example.com"}))
`,
      [
        'Extract the rule that varies for business reasons first.',
        'Keep the checkout method focused on workflow order.',
        'Inject the collaborators instead of constructing them inside checkout.'
      ],
      'The script prints the discounted total after CheckoutManager delegates pricing, saving, and notification.',
      'intermediate'
    ),
    designExercise(
      'solid-follow-up-requirements',
      'Review SOLID under follow-up requirements',
      'A checkout system now needs coupon policies, receipt channels, and audit storage. Describe how you would apply SOLID without over-engineering the first version.',
      [
        'Which responsibilities change for business reasons versus infrastructure reasons?',
        'Where does a new coupon rule belong so checkout does not keep changing?',
        'Which abstractions are real seams and which would be unnecessary ceremony today?',
        'How would you prove the design stays testable as new integrations arrive?'
      ]
    )
  ],
  checklist: [
    'Can explain SRP as one primary reason to change instead of one method per class.',
    'Can explain why SRP and OCP are the highest-frequency SOLID signals in interview code reviews.',
    'Can justify OCP only when a real policy extension point exists.',
    'Can use ISP to repair abstractions that force unsupported behavior.',
    'Can explain DIP as explicit ports and adapters for volatile dependencies and tests.'
  ],
  pitfalls: [
    'Turning a small interview solution into too many abstractions before any real variation appears.',
    'Using inheritance where composition or a smaller interface would produce a more honest contract.',
    'Claiming code follows SOLID while high-level workflows still construct concrete dependencies directly.'
  ],
  interviewPrompts: [
    'How would you refactor a checkout or booking god class using SOLID?',
    'When does OCP help, and when is a new abstraction just ceremony?',
    'Why does DIP usually improve testability in machine-coding rounds?'
  ],
  diagram: null,
  related: ['cohesion-coupling-and-grasp', 'dependency-injection-and-testability', 'parking-lot-design-lab']
};

const cohesionLesson = {
  slug: 'cohesion-coupling-and-grasp',
  title: 'Cohesion, coupling, and GRASP heuristics',
  summary:
    'Use Information Expert, Creator, Controller, Low Coupling, and High Cohesion as responsibility-assignment heuristics when an object model feels muddy but the problem is still small enough to reason about directly.',
  duration: '55-75 min',
  whyItMatters:
    'Many interview designs fail before patterns even matter because responsibilities are assigned to the wrong objects. A service knows facts it should ask an entity for, an entity starts coordinating workflows it should not own, or a controller calculates totals because it already has the request object in hand. GRASP heuristics and cohesion-coupling language help you explain where knowledge should live and why that placement makes future changes safer.',
  sections: [
    section(
      'Responsibility assignment is the real design work',
      'When a design feels off, the issue is often not missing syntax or a missing pattern. It is that the wrong object owns the decision. Cohesion and coupling are the fastest vocabulary for that problem. High cohesion means a class has a tight, comprehensible job. Low coupling means it depends on as few unrelated details as possible. Together, they let you critique a design without pretending every interview system needs a pattern catalog.',
      'GRASP heuristics make this practical. Information Expert asks which object already knows the facts required for a decision. Creator asks which object is naturally positioned to build another. Controller asks which boundary object should receive a use case request. These are not rigid laws, but they are excellent review questions when a candidate has a large manager class and needs a disciplined way to break it apart.',
      [
        'High cohesion keeps a class focused and easier to explain.',
        'Low coupling limits how many concepts a class must know.',
        'GRASP gives concrete questions for assigning behavior.',
        'Responsibility placement usually matters more than pattern naming.'
      ],
      'A controller that knows too much becomes a dumping ground',
      `
class OrderController:
    def create_order(self, request):
        total = 0
        for item in request["items"]:
            total += item["price"] * item["qty"]
        shipping = 0 if total > 100 else 12
        invoice = f"invoice:{request['customer_id']}:{total + shipping}"
        return {
            "customer_id": request["customer_id"],
            "total": total + shipping,
            "invoice": invoice,
        }


if __name__ == "__main__":
    request = {"customer_id": "c1", "items": [{"price": 40, "qty": 2}]}
    print(OrderController().create_order(request))
`
    ),
    section(
      'Information Expert and Creator place behavior near data',
      'Information Expert does not mean every field should gain methods until entities become bloated. It means a calculation should usually live with the data it depends on when doing so keeps the concept local and understandable. A cart already knows its line items, so it is a natural expert on subtotal. A reservation already knows its expiration and seat, so it can answer whether it is active. Moving those answers into the entity reduces duplicated logic in services and handlers.',
      'Creator is useful when object construction has a natural owner. An Order can create OrderLine objects from validated inputs. A Board can create Squares or initialize pieces because it owns layout rules. This avoids scattered construction logic and keeps invariants closer to the object graph. In interviews, these heuristics help you defend why one class instantiates another without appealing to vague intuition.',
      [
        'Put local calculations near the data they require.',
        'Use Creator when one object aggregates or closely owns another.',
        'Do not force every rule into an entity if it depends on many collaborators.',
        'Prefer simple entity methods over repeated controller calculations.'
      ],
      'Cart owns subtotal because it already knows line items',
      `
class Cart:
    def __init__(self, items):
        self.items = items

    def subtotal(self):
        return sum(item["price"] * item["qty"] for item in self.items)

    def shipping_fee(self):
        return 0 if self.subtotal() > 100 else 12


class Order:
    def __init__(self, customer_id, cart):
        self.customer_id = customer_id
        self.cart = cart

    @classmethod
    def from_request(cls, request):
        return cls(request["customer_id"], Cart(request["items"]))


if __name__ == "__main__":
    order = Order.from_request({"customer_id": "c1", "items": [{"price": 40, "qty": 2}]})
    print(order.cart.subtotal(), order.cart.shipping_fee())
`
    ),
    section(
      'Controller should coordinate a use case, not absorb domain rules',
      'GRASP Controller points to the object that first handles a system event such as placeOrder, reserveSeat, or withdrawCash. The controller should coordinate the use case and delegate domain knowledge, not become a second domain model with a request-shaped API. When a controller owns totals, validation, seat state transitions, and repository rules, it becomes both high coupling and low cohesion at the same time: it knows every concept and has no single clear job.',
      'A clean controller receives the request, loads or creates the core domain objects, invokes a domain method or application service, and returns a response. That boundary makes testing easier because request mapping stays separate from domain behavior. In interviews, this distinction helps you answer follow-up questions about framework controllers versus application services without confusing transport details with business responsibilities.',
      [
        'Controllers handle use-case entry, not every domain decision.',
        'Keep request mapping and response shaping near the edge.',
        'Delegate calculations and state transitions to better experts.',
        'Application services can coordinate multiple entities without becoming controllers.'
      ],
      'A controller delegates to a cohesive application service',
      `
class Cart:
    def __init__(self, items):
        self.items = items

    def subtotal(self):
        return sum(item["price"] * item["qty"] for item in self.items)


class PricingService:
    def total(self, cart):
        subtotal = cart.subtotal()
        return subtotal if subtotal > 100 else subtotal + 12


class PlaceOrder:
    def __init__(self, pricing):
        self.pricing = pricing

    def execute(self, request):
        cart = Cart(request["items"])
        return {"customer_id": request["customer_id"], "total": self.pricing.total(cart)}


if __name__ == "__main__":
    controller = PlaceOrder(PricingService())
    print(controller.execute({"customer_id": "c1", "items": [{"price": 40, "qty": 2}]}))
`
    ),
    section(
      'Low coupling and high cohesion are trade-offs, not slogans',
      'It is possible to reduce coupling so aggressively that the design becomes harder to follow. If every method call travels through five microscopic abstractions, local reasoning gets worse even if no class knows very much. The goal is balanced coupling: each class should know the collaborators it genuinely needs, and those collaborators should represent stable concepts rather than incidental details. Cohesion provides the counterweight by asking whether the class still tells one understandable story.',
      'This trade-off appears in almost every machine-coding prompt. A board game service needs to know the board and turn policy; that is healthy coupling. A booking service probably should not know SQL columns, payment retries, and email templates directly; that is unhealthy coupling. When you explain coupling as necessary conceptual dependencies versus avoidable detail leakage, your design language sounds more like production review and less like memorized notes.',
      [
        'Some coupling is essential because workflows need collaborators.',
        'Avoid detail leakage from storage, transport, and formatting concerns.',
        'Use cohesion as a guardrail against over-fragmenting the design.',
        'Judge dependencies by whether they represent stable concepts.'
      ],
      'Coupling to concepts is healthier than coupling to details',
      `
class SeatInventory:
    def __init__(self, seats):
        self.seats = seats

    def available(self, seat_id):
        return self.seats.get(seat_id) == "open"

    def hold(self, seat_id):
        if not self.available(seat_id):
            raise ValueError("seat unavailable")
        self.seats[seat_id] = "held"


class BookingService:
    def __init__(self, inventory):
        self.inventory = inventory

    def reserve(self, seat_id):
        self.inventory.hold(seat_id)
        return {"seat_id": seat_id, "status": "held"}


if __name__ == "__main__":
    print(BookingService(SeatInventory({"A1": "open"})).reserve("A1"))
`
    ),
    section(
      'Use GRASP as an interview debugging checklist',
      'When you need to improve a design under time pressure, GRASP works well as a debugging sequence. Ask which class currently owns a decision. Ask which object already has the information required. Ask whether the chosen owner now depends on many unrelated concepts. Ask whether object creation is scattered or naturally owned. These questions lead to concrete edits that are easy to justify aloud, even if you never mention the GRASP acronym explicitly.',
      'A polished interview answer often ends by describing how the new layout handles a follow-up requirement. If shipping rules change, Cart and PricingService remain the main edit points. If persistence changes, the controller still does not care. If a new request format arrives, request mapping changes at the edge. That language shows that cohesion and coupling are not theoretical labels; they are tools for predicting where the next change will land.',
      [
        'Review responsibility decisions by walking one use case end to end.',
        'Ask where each rule would change under a realistic follow-up requirement.',
        'Prefer the smallest refactor that improves ownership clarity.',
        'Use GRASP terms as justification, not as decoration.'
      ],
      'A quick review harness for responsibility placement',
      `
def review_design(class_map):
    for class_name, notes in class_map.items():
        print(class_name)
        print("  reason to change:", notes["reason"])
        print("  depends on:", ", ".join(notes["depends_on"]))


if __name__ == "__main__":
    review_design({
        "Cart": {"reason": "line-item calculations", "depends_on": ["items"]},
        "PricingService": {"reason": "shipping and pricing rules", "depends_on": ["Cart"]},
        "PlaceOrder": {"reason": "workflow orchestration", "depends_on": ["Cart", "PricingService"]},
    })
`
    )
  ],
  exercises: [
    codingExercise(
      'grasp-reassign-responsibilities',
      'Move behavior to better experts',
      'Reassign subtotal and shipping logic away from the controller so local calculations live with the objects that already know the required data.',
      `
class OrderController:
    def create_order(self, request):
        total = 0
        for item in request["items"]:
            total += item["price"] * item["qty"]
        # TODO: move shipping and subtotal logic out of the controller.
        shipping = 0 if total > 100 else 12
        return total + shipping


print(OrderController().create_order({"items": [{"price": 40, "qty": 2}]}))
`,
      `
class Cart:
    def __init__(self, items):
        self.items = items

    def subtotal(self):
        return sum(item["price"] * item["qty"] for item in self.items)


class ShippingPolicy:
    def fee(self, cart):
        return 0 if cart.subtotal() > 100 else 12


class OrderController:
    def __init__(self, shipping):
        self.shipping = shipping

    def create_order(self, request):
        cart = Cart(request["items"])
        return cart.subtotal() + self.shipping.fee(cart)


print(OrderController(ShippingPolicy()).create_order({"items": [{"price": 40, "qty": 2}]}))
`,
      [
        'Look for logic that depends only on line items.',
        'Keep the controller focused on assembling the use case.',
        'A small policy object is fine when the rule changes for business reasons.'
      ],
      'The script prints the order total after the controller delegates subtotal and shipping decisions.',
      'intermediate'
    ),
    designExercise(
      'grasp-auction-responsibilities',
      'Assign responsibilities for an auction checkout',
      'Sketch how you would assign bidding, winner selection, and checkout responsibilities in a small auction system using GRASP and cohesion-coupling language.',
      [
        'Which object is the Information Expert for current highest bid and bid validity?',
        'What should the controller coordinate versus what should domain entities enforce?',
        'Where does object creation naturally belong for Bid and Invoice records?',
        'Which classes would become too coupled if you placed all rules in one manager?'
      ]
    )
  ],
  checklist: [
    'Can use Information Expert to place local calculations near the data they require.',
    'Can distinguish controller coordination from domain responsibility ownership.',
    'Can explain low coupling as limiting detail leakage rather than eliminating all dependencies.',
    'Can use high cohesion to argue against both god objects and over-fragmented abstractions.'
  ],
  pitfalls: [
    'Keeping every rule in a request-shaped controller because it already has the input data nearby.',
    'Forcing behavior into entities that are not true experts just to sound object oriented.',
    'Reducing coupling so aggressively that the design becomes a maze of tiny pass-through classes.'
  ],
  interviewPrompts: [
    'How do GRASP heuristics help when a design feels muddy but not obviously broken?',
    'What is the difference between healthy coupling and unhealthy detail leakage?',
    'How would you explain high cohesion using a booking or checkout example?'
  ],
  diagram: null,
  related: ['solid-principles-in-practice', 'dependency-injection-and-testability', 'movie-ticket-or-splitwise-lab']
};

const diLesson = {
  slug: 'dependency-injection-and-testability',
  title: 'Dependency injection and testability seams',
  summary:
    'Design constructor-injected ports around clocks, repositories, and notifiers so object models stay deterministic under tests, composition roots stay explicit, and infrastructure choices remain outside the domain workflow.',
  duration: '55-75 min',
  whyItMatters:
    'Many interview solutions look correct until you try to test them. Hidden calls to datetime.now, random UUID generation, direct database mutations, and in-method notification sends create non-deterministic behavior and force awkward setup. Dependency injection is the practical tool for exposing those moving parts so the workflow can be exercised with small fakes and production wiring can remain a separate concern. In 2025 codebases, that usually means hexagonal or ports-and-adapters language plus a clear composition root rather than ambient service location.',
  sections: [
    section(
      'Testability begins with explicit seams',
      'A seam is a place where you can vary behavior without rewriting the use case. Time, persistence, payment gateways, ID generation, and notification delivery are common seams because they differ between tests and production environments. If those details are constructed or looked up inside the workflow, every test must patch global state or accept non-determinism. When they are explicit constructor dependencies, the workflow becomes a pure story over collaborators that you can control.',
      'This is why testability is a design property, not a testing framework feature. Mock libraries can patch over bad ownership for a while, but the underlying issue remains that the object graph hides important choices. Interviewers often reward candidates who mention seams early because it shows they think about observability and maintenance, not only about getting one happy path to run in the REPL.',
      [
        'Seams mark volatile behavior such as time, storage, or external delivery.',
        'Constructor arguments make collaborations visible and replaceable.',
        'Deterministic tests usually start with explicit clocks and repositories.',
        'A seam should represent a real source of variation, not every helper function.'
      ],
      'Hidden globals make workflow tests unpredictable',
      `
from datetime import datetime


class TrialService:
    def __init__(self):
        self.users = {}

    def start_trial(self, user_id):
        started_at = datetime.utcnow()
        expires_at = started_at.replace(day=min(started_at.day + 7, 28))
        self.users[user_id] = {"started_at": started_at, "expires_at": expires_at}
        return self.users[user_id]


if __name__ == "__main__":
    print(TrialService().start_trial("u1"))
`
    ),
    section(
      'Constructor injection is the default for use-case dependencies',
      'Constructor injection is powerful because it makes the object contract honest. A class that needs a repository, a clock, and a notifier should say so up front. That visibility helps production code wire real implementations and helps tests pass focused fakes. It also clarifies ownership: the use case owns workflow order, while each injected dependency owns an infrastructure concern or a volatile policy.',
      'In interview settings, this is usually simpler than factories, service locators, or framework-specific injection magic. You can draw the object graph in plain language: the application creates the use case with a clock, repository port, and notifier port, then calls execute. That explanation stays readable even if the code later moves into a framework. The principle is the same: object creation lives at the edge, not inside core domain methods.',
      [
        'Prefer constructor injection for required collaborators.',
        'Keep dependency creation in a composition root or setup layer.',
        'Expose required seams in the class constructor rather than through globals.',
        'Only use method injection when a dependency varies per call.'
      ],
      'Injected collaborators make dependencies obvious',
      `
from datetime import timedelta


class FixedClock:
    def __init__(self, now):
        self._now = now

    def now(self):
        return self._now


class TrialService:
    def __init__(self, clock):
        self.clock = clock
        self.users = {}

    def start_trial(self, user_id):
        started_at = self.clock.now()
        expires_at = started_at + timedelta(days=7)
        self.users[user_id] = {"started_at": started_at, "expires_at": expires_at}
        return self.users[user_id]


if __name__ == "__main__":
    from datetime import datetime
    print(TrialService(FixedClock(datetime(2024, 1, 1, 9, 0, 0))).start_trial("u1"))
`
    ),
    section(
      'Fake clock, fake repo, fake notifier: small tests over real workflows',
      'Good fakes are tiny and honest. A fake clock returns a known instant. A fake repository stores values in memory. A fake notifier records sent messages. With these collaborators, the use case can run end to end without network calls, random timestamps, or irreversible side effects. That makes tests read like behavioral examples rather than intricate setup scripts, which is exactly the kind of clarity interviewers want to see in production-minded code.',
      'The advantage is not only speed. Fakes reveal whether the workflow boundary is coherent. If you cannot write a tiny fake for a dependency, the interface may be too broad or the use case may own too many responsibilities. This is a useful interview insight: difficult tests often point back to design smells, especially hidden dependencies, giant interfaces, or workflows that both decide policy and perform infrastructure operations.',
      [
        'Use small fakes that capture behavior relevant to the use case.',
        'Prefer recording interactions over mocking internals of the workflow.',
        'Let hard-to-fake dependencies reveal overly broad interfaces.',
        'Design tests around use-case outcomes and notable side effects.'
      ],
      'A fake-driven workflow test is simple and deterministic',
      `
from datetime import datetime, timedelta


class FixedClock:
    def now(self):
        return datetime(2024, 1, 1, 9, 0, 0)


class InMemoryRepo:
    def __init__(self):
        self.saved = {}

    def save(self, user_id, record):
        self.saved[user_id] = record


class RecordingNotifier:
    def __init__(self):
        self.messages = []

    def send(self, user_id, body):
        self.messages.append((user_id, body))


class StartTrial:
    def __init__(self, clock, repo, notifier):
        self.clock = clock
        self.repo = repo
        self.notifier = notifier

    def execute(self, user_id):
        started = self.clock.now()
        record = {"started_at": started, "expires_at": started + timedelta(days=7)}
        self.repo.save(user_id, record)
        self.notifier.send(user_id, f"trial expires {record['expires_at'].date()}")
        return record


if __name__ == "__main__":
    repo = InMemoryRepo()
    notifier = RecordingNotifier()
    print(StartTrial(FixedClock(), repo, notifier).execute("u1"))
    print(repo.saved["u1"])
    print(notifier.messages)
`
    ),
    section(
      'Composition roots keep frameworks from leaking inward',
      'A composition root is the place where concrete objects get assembled. In a script it may be the main block. In a web app it may be a handler or application startup. The important point is that core classes do not reach outward to build their own dependencies. That separation keeps frameworks, clients, and adapters near the system edge while domain workflows remain portable and easy to reason about, which is the heart of hexagonal architecture in production codebases.',
      'This also keeps follow-up requirements manageable. If the notifier changes from email to event publication, the composition root changes which implementation is injected. If the repository changes from memory to SQL, the use case still talks to the same seam. In interviews, this is a clean answer to the classic question of where object wiring belongs: as close to startup or request entry as possible, and away from domain rules.',
      [
        'Composition roots own concrete wiring decisions.',
        'Domain workflows should not import infrastructure constructors directly.',
        'Framework handlers can remain thin by delegating into injected use cases.',
        'Swapping adapters should not rewrite business workflow code.'
      ],
      'A composition root wires concrete adapters at the edge',
      `
class SqlUserRepo:
    def save(self, user_id, record):
        print(f"sql save {user_id}: {record}")


class EmailNotifier:
    def send(self, user_id, body):
        print(f"email {user_id}: {body}")


class SystemClock:
    def now(self):
        from datetime import datetime
        return datetime(2024, 1, 1, 9, 0, 0)


def build_trial_use_case():
    from datetime import timedelta

    class StartTrial:
        def __init__(self, clock, repo, notifier):
            self.clock = clock
            self.repo = repo
            self.notifier = notifier

        def execute(self, user_id):
            started = self.clock.now()
            record = {"started_at": started, "expires_at": started + timedelta(days=7)}
            self.repo.save(user_id, record)
            self.notifier.send(user_id, "trial started")
            return record

    return StartTrial(SystemClock(), SqlUserRepo(), EmailNotifier())


if __name__ == "__main__":
    print(build_trial_use_case().execute("u1"))
`
    ),
    section(
      'Use DI to defend trade-offs in machine-coding interviews',
      'Dependency injection should make a solution easier to explain, not more ceremonial. In a 45-minute round, you usually need only a handful of seams: repository, clock, notifier, strategy, or gateway. That is enough to demonstrate testability and maintainability without turning the exercise into a framework clone. The interview win comes from showing that you know which dependencies are volatile, how they map to ports and adapters, and which stable domain collaborators do not need wrappers.',
      'A practical closing line is that test seams allow you to verify expiration, retries, and side effects with deterministic data. If the interviewer asks how you would unit test the flow, you can point directly at the fake clock, fake repository, and recording notifier. That answer proves the design has not merely been coded; it has been shaped so change and verification can happen safely and still fits a working-demo-first machine-coding round.',
      [
        'Inject only the dependencies whose volatility matters to the workflow.',
        'Keep stable domain objects concrete unless abstraction buys clarity.',
        'Defend DI with deterministic tests and runtime flexibility.',
        'Use the smallest object graph that still exposes real seams.'
      ],
      'A tiny deterministic test harness proves the seam',
      `
from datetime import datetime, timedelta


class FixedClock:
    def __init__(self, current):
        self.current = current

    def now(self):
        return self.current


def compute_expiry(clock):
    return clock.now() + timedelta(days=7)


if __name__ == "__main__":
    expiry = compute_expiry(FixedClock(datetime(2024, 3, 1, 12, 0, 0)))
    print(expiry.isoformat())
`
    )
  ],
  exercises: [
    codingExercise(
      'inject-clock-for-trial-service',
      'Inject a clock and make the flow testable',
      'Remove the hidden time dependency so the trial-start workflow can be exercised with a fixed clock.',
      `
from datetime import datetime, timedelta


class TrialService:
    def start_trial(self, user_id):
        started_at = datetime.utcnow()
        # TODO: inject a clock so tests control time deterministically.
        return {"user_id": user_id, "expires_at": started_at + timedelta(days=7)}


print(TrialService().start_trial("u1"))
`,
      `
from datetime import datetime, timedelta


class FixedClock:
    def __init__(self, now):
        self._now = now

    def now(self):
        return self._now


class TrialService:
    def __init__(self, clock):
        self.clock = clock

    def start_trial(self, user_id):
        started_at = self.clock.now()
        return {"user_id": user_id, "expires_at": started_at + timedelta(days=7)}


service = TrialService(FixedClock(datetime(2024, 1, 1, 9, 0, 0)))
print(service.start_trial("u1"))
`,
      [
        'Time is a classic volatile dependency that should not be hidden.',
        'Use constructor injection for a required collaborator.',
        'A fixed clock makes the expected expiration instant easy to assert.'
      ],
      'The script prints a predictable expiration timestamp based on the injected fixed clock.',
      'intermediate'
    ),
    designExercise(
      'test-seams-for-notification-workflow',
      'Design test seams for a reminder workflow',
      'A reminder service reads due invoices, computes whether they are late, and notifies customers. Describe the seams you would inject and how you would test the workflow end to end with fakes.',
      [
        'Which collaborators should be injected because they vary by environment or time?',
        'What does a minimal fake repository or fake notifier need to record?',
        'Where should composition happen so the workflow stays framework-agnostic?',
        'Which dependencies are stable enough to stay concrete inside the domain model?'
      ]
    )
  ],
  checklist: [
    'Can identify clocks, repositories, gateways, and notifiers as common volatile seams.',
    'Can explain why constructor injection usually beats hidden globals in interview code.',
    'Can design small fakes that make a workflow deterministic end to end.',
    'Can describe a composition root that wires concrete adapters at the system edge.'
  ],
  pitfalls: [
    'Injecting every helper function and value object until the object graph is more confusing than the original workflow.',
    'Keeping hidden calls to current time or persistence while claiming the design is testable.',
    'Using a service locator or global container inside domain code, which hides dependencies again.'
  ],
  interviewPrompts: [
    'Which dependencies would you inject first in a booking or checkout use case, and why?',
    'How do fake clocks and fake repositories reveal whether a design is actually testable?',
    'Where should concrete wiring live in a machine-coding solution?'
  ],
  diagram: null,
  related: ['solid-principles-in-practice', 'cohesion-coupling-and-grasp', 'atm-or-vending-machine-lab']
};

const chessLesson = {
  slug: 'chess-or-game-system-lab',
  title: 'Chess and board-game design lab',
  summary:
    'Design a board-game engine around board state, pieces, move validation, and turn control while keeping room for special rules and follow-up questions.',
  duration: '70-90 min',
  whyItMatters:
    'Board-game prompts are classic machine-coding exercises because they expose whether you can model state-rich objects without collapsing everything into one controller. Chess is especially useful because the interviewer can start with a small playable subset, then push on move validation, turn transitions, captures, check detection, undo, or new game variants. A good design keeps the board authoritative, pieces local in their movement logic, and game state coherent under every move.',
  sections: [
    section(
      'Start with a narrow playable core',
      'Chess becomes overwhelming when you begin by listing every special rule. The better strategy is to define a playable core: a board with squares, pieces with color and symbol, turns that alternate, and a move object that describes from and to coordinates. Once that baseline exists, you can validate occupancy, ownership, and movement shape. This lets the interviewer see a running design early and gives you stable anchor points for extensions such as castling or en passant later.',
      'The important interview habit is naming non-goals explicitly. You can say the first version supports normal movement, captures, and turn order, but does not yet implement checkmate search or special pawn rules. That shows judgment rather than avoidance. A compact, honest core is easier to extend than a rushed attempt to model every rule in one pass with incomplete invariants and tangled conditionals.',
      [
        'Define board coordinates, piece ownership, and turn state first.',
        'Get one legal move path working before adding rare rules.',
        'Name non-goals so follow-up extensions have a clear home.',
        'Keep the board authoritative for occupancy and piece placement.'
      ],
      'A minimal board and move object create a stable foundation',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Position:
    row: int
    col: int


@dataclass(frozen=True)
class Move:
    start: Position
    end: Position


class Board:
    def __init__(self, size=8):
        self.size = size
        self.grid = {}

    def place(self, piece, position):
        self.grid[(position.row, position.col)] = piece


if __name__ == "__main__":
    board = Board()
    board.place("white king", Position(7, 4))
    print(board.grid)
`
    ),
    section(
      'Pieces can use inheritance for identity and composition for movement',
      'Many candidates jump straight to a deep class hierarchy because chess has named piece types. A practical answer is to separate what each piece is from how it moves. A piece can carry color and kind, while a movement rule object answers whether a proposed path shape is valid. This reduces duplication between bishops, rooks, and queens and keeps the piece entity from turning into a collection of long if statements.',
      'The trade-off is important to explain. A small hierarchy is still useful for piece identity or notation, but movement composition often makes extension easier for variants or testing. Interviewers generally respond well when you say you are using composition for change-prone rules and simple objects for stable identity. That shows you are not choosing inheritance by default just because the nouns line up neatly.',
      [
        'Keep piece identity simple: color, type, and maybe symbol.',
        'Move-shape validation can be a separate policy object.',
        'Composition reduces duplicated movement math across pieces.',
        'Use inheritance only where it clarifies stable identity or contract.'
      ],
      'Movement behavior can be composed instead of hard-coded everywhere',
      `
class MoveRule:
    def valid_shape(self, start, end):
        raise NotImplementedError


class RookRule(MoveRule):
    def valid_shape(self, start, end):
        return start.row == end.row or start.col == end.col


class BishopRule(MoveRule):
    def valid_shape(self, start, end):
        return abs(start.row - end.row) == abs(start.col - end.col)


class Piece:
    def __init__(self, color, name, rule):
        self.color = color
        self.name = name
        self.rule = rule


if __name__ == "__main__":
    rook = Piece("white", "rook", RookRule())
    print(rook.rule.valid_shape(type("P", (), {"row": 0, "col": 0})(), type("P", (), {"row": 0, "col": 5})()))
`
    ),
    section(
      'Move validation belongs to a service that combines board and piece rules',
      'A legal chess move depends on both local piece behavior and shared board state. The piece can answer whether the shape is correct for a rook or bishop, but the board must answer whether squares are occupied, whether a path is blocked, and whether the destination contains a friendly piece. That makes move validation a good collaboration between Board and a MoveValidator or Game service rather than something owned entirely by either object alone.',
      'This separation keeps responsibilities crisp. The board knows occupancy. The piece knows its movement rule. The validator or game service knows the workflow of checking turn, retrieving the piece, confirming legality, and then applying the move. When interviewers push on why a board method alone is insufficient, you can explain that legality is a cross-object concern that needs both board facts and turn state.',
      [
        'Piece rules answer movement shape, not whole-game legality.',
        'Board answers occupancy, destination ownership, and path blocking.',
        'A game or validator service coordinates full legality checks.',
        'Split movement validation from move application when possible.'
      ],
      'Move validation combines piece rules with board facts',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Position:
    row: int
    col: int


class Board:
    def __init__(self):
        self.grid = {}

    def piece_at(self, position):
        return self.grid.get((position.row, position.col))

    def place(self, piece, position):
        self.grid[(position.row, position.col)] = piece


class Game:
    def __init__(self, board):
        self.board = board
        self.turn = "white"

    def can_move(self, start, end):
        piece = self.board.piece_at(start)
        target = self.board.piece_at(end)
        if piece is None or piece.color != self.turn:
            return False
        if target is not None and target.color == piece.color:
            return False
        return piece.rule.valid_shape(start, end)


if __name__ == "__main__":
    from types import SimpleNamespace
    board = Board()
    board.place(SimpleNamespace(color="white", rule=SimpleNamespace(valid_shape=lambda s, e: s.row == e.row)), Position(0, 0))
    print(Game(board).can_move(Position(0, 0), Position(0, 5)))
`
    ),
    section(
      'Turn state and check detection are game-level invariants',
      'Turn ownership, check status, move history, and end conditions live above any single piece. This is where many designs become muddled because the candidate adds game-wide flags to the board or piece classes. A cleaner answer gives GameSession ownership of whose turn it is, whether a move is legal after considering self-check, and whether the game is ongoing, check, or mate. That boundary makes later questions about undo, timers, or repetition easier to place.',
      'For check detection in an interview, a simplified answer is usually enough: find the king position for the defending color, then ask whether any opposing piece has a legal attack shape toward that square with current board occupancy. You do not need a full search engine to show the idea. The key is acknowledging that check is a derived global invariant computed from board state and piece movement, not a field to toggle manually on the king.',
      [
        'Turn and game-status ownership should live above Board and Piece.',
        'Check is derived from attacks on the king, not stored as an arbitrary flag.',
        'Special rules can layer on top of a stable move-validation core.',
        'Game history belongs in session state if undo or repetition is discussed.'
      ],
      'Simplified check detection scans attacks on the king square',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Position:
    row: int
    col: int


class Piece:
    def __init__(self, color, name, attacks):
        self.color = color
        self.name = name
        self.attacks = attacks


def king_in_check(board, king_position, defending_color):
    for (_, _), piece in board.items():
        if piece.color != defending_color and piece.attacks(king_position):
            return True
    return False


if __name__ == "__main__":
    enemy_rook = Piece("black", "rook", lambda pos: pos.row == 0 or pos.col == 0)
    board = {(0, 7): enemy_rook}
    print(king_in_check(board, Position(0, 4), "white"))
`
    ),
    section(
      'Answer follow-up extensions with stable seams',
      'Chess interviews often pivot to variants and operations: add undo, add timers, persist move history, support custom board sizes, or adapt the engine to other board games. The reason to keep board state, movement rules, and session control separate is that each extension lands cleanly. Undo needs move history and reversible application in GameSession. Timers belong in match state, not inside pieces. Alternate pieces or board sizes fit better when movement rules are composable rather than trapped inside a monolithic switch statement.',
      'A strong close is to explain what you would test. You would verify movement rules by piece type, blocked-path behavior, turn alternation, captures, and simplified check detection. That test plan demonstrates the design is executable, not just diagrammable. In interviews, executable design thinking is often the real differentiator between a polished answer and a hand-wavy architecture story.',
      [
        'Place undo and timers in match-level state rather than piece classes.',
        'Reuse board and move primitives for other board-game variants.',
        'Test movement rules, occupancy checks, and turn transitions separately.',
        'Keep future rules additive by preserving clean seams now.'
      ],
      'A tiny game loop proves the object model is executable',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Position:
    row: int
    col: int


class Piece:
    def __init__(self, color, name):
        self.color = color
        self.name = name


class GameSession:
    def __init__(self):
        self.turn = "white"
        self.history = []

    def apply(self, start, end):
        self.history.append((start, end, self.turn))
        self.turn = "black" if self.turn == "white" else "white"


if __name__ == "__main__":
    game = GameSession()
    game.apply(Position(6, 4), Position(4, 4))
    game.apply(Position(1, 4), Position(3, 4))
    print(game.turn, game.history)
`
    )
  ],
  exercises: [
    codingExercise(
      'board-game-move-validation',
      'Validate rook-like moves on a small board',
      'Complete the move check so a piece can move only in straight lines and cannot capture its own color.',
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Position:
    row: int
    col: int


class Piece:
    def __init__(self, color):
        self.color = color


class Game:
    def __init__(self):
        self.board = {(0, 0): Piece("white"), (0, 3): Piece("black")}
        self.turn = "white"

    def can_move(self, start, end):
        piece = self.board.get((start.row, start.col))
        target = self.board.get((end.row, end.col))
        # TODO: require the moving piece to match self.turn, forbid friendly capture,
        # and allow only same-row or same-column movement.
        raise NotImplementedError


game = Game()
print(game.can_move(Position(0, 0), Position(0, 3)))
`,
      `
from dataclasses import dataclass


@dataclass(frozen=True)
class Position:
    row: int
    col: int


class Piece:
    def __init__(self, color):
        self.color = color


class Game:
    def __init__(self):
        self.board = {(0, 0): Piece("white"), (0, 3): Piece("black")}
        self.turn = "white"

    def can_move(self, start, end):
        piece = self.board.get((start.row, start.col))
        target = self.board.get((end.row, end.col))
        if piece is None or piece.color != self.turn:
            return False
        if target is not None and target.color == piece.color:
            return False
        return start.row == end.row or start.col == end.col


game = Game()
print(game.can_move(Position(0, 0), Position(0, 3)))
`,
      [
        'Legality depends on both turn state and board occupancy.',
        'Friendly captures should fail before movement-shape checks pass.',
        'Start with one piece type and one rule family before adding more.'
      ],
      'The script prints True for the straight-line capture attempt by the current player.',
      'intermediate'
    ),
    designExercise(
      'chess-follow-up-design',
      'Extend the game model for interview follow-ups',
      'Describe how you would extend the core design for timers, undo, and special rules such as castling without rewriting the entire move engine.',
      [
        'Which object should own turn timers and move history?',
        'How would special-move validation layer on top of normal move validation?',
        'What additional state is needed to support undo safely?',
        'Which parts of the design remain reusable for other board-game prompts?'
      ]
    )
  ],
  checklist: [
    'Can define a playable core around board state, pieces, moves, and turn order before rare rules.',
    'Can explain the split between piece movement logic, board occupancy, and game-level invariants.',
    'Can place turn state and check detection in a session or game object rather than on pieces.',
    'Can answer follow-up extensions such as undo or timers with stable seams.'
  ],
  pitfalls: [
    'Trying to implement every chess rule at once before the board, turn, and move primitives are coherent.',
    'Putting full move legality, turn management, and game status inside the Board until it becomes a god object.',
    'Using inheritance alone for every rule when composition would reduce duplicated movement logic.'
  ],
  interviewPrompts: [
    'How would you split responsibilities between Board, Piece, and GameSession in chess?',
    'Where should check detection live, and why is it a derived invariant?',
    'How would you adapt the design to support undo or another board game?'
  ],
  diagram: null,
  related: ['atm-or-vending-machine-lab', 'movie-ticket-or-splitwise-lab', 'solid-principles-in-practice']
};

const atmLesson = {
  slug: 'atm-or-vending-machine-lab',
  title: 'ATM and vending machine design lab',
  summary:
    'Model transactional machines around explicit state transitions, cash or inventory invariants, and failure handling that preserves correctness under partial progress.',
  duration: '70-90 min',
  whyItMatters:
    'ATM and vending prompts look simple until you trace what can go wrong between selection, validation, payment, dispensing, change return, receipt printing, and session reset. These systems reward candidates who think in terms of state machines, scarce resources, transaction records, and idempotent retries instead of one long method. A good answer keeps the state transition model obvious, protects cash or inventory from drifting out of sync with visible user actions, and is ready for the concurrency or retry follow-ups interviewers commonly ask now.',
  sections: [
    section(
      'Transactional machines revolve around explicit states',
      'The core modeling move for both ATMs and vending machines is to make state visible. An ATM might move through idle, card inserted, authenticated, selection entered, cash dispensing, and session complete. A vending machine might move through idle, item selected, payment pending, dispensing, and change return. When these states are implicit flags sprinkled through one class, invalid transitions become easy to miss and error handling becomes guesswork.',
      'An explicit state model helps in interviews because it gives you a clean narrative for both success and failure. You can say what is allowed in each state, which events cause transitions, and which invariants must hold before the system advances. That style sounds robust because it mirrors how real transactional devices defend against partial progress, retries, and interruptions from hardware or user behavior.',
      [
        'Start by naming states and legal transitions.',
        'Reject operations that do not make sense in the current state.',
        'Use state boundaries to describe error handling as well as the happy path.',
        'Keep state changes close to inventory or cash invariants.'
      ],
      'State constants make legal transitions easier to reason about',
      `
class AtmState:
    IDLE = "idle"
    CARD_INSERTED = "card_inserted"
    AUTHENTICATED = "authenticated"
    DISPENSING = "dispensing"


class ATM:
    def __init__(self):
        self.state = AtmState.IDLE

    def insert_card(self):
        if self.state != AtmState.IDLE:
            raise ValueError("card can only be inserted from idle")
        self.state = AtmState.CARD_INSERTED


if __name__ == "__main__":
    atm = ATM()
    atm.insert_card()
    print(atm.state)
`
    ),
    section(
      'ATM design: session workflow, account lookup, and cash inventory',
      'An ATM design normally needs Card, Account, BankService, CashBin, Transaction, and ATMSession or ATMController. The session owns card insertion, PIN validation, selected operation, and timeout or cancel behavior. Cash inventory is a separate concern because dispense logic must confirm that the requested amount can be satisfied with available denominations before the account is debited or the machine advances to the dispense state. That separation keeps money invariants explicit.',
      'A strong interview answer also mentions failure boundaries. If the bank approves withdrawal but cash jam occurs, the machine needs a transaction record and a reconciliation path. If PIN attempts exceed a limit, the session transitions to a retained-card or terminated state. This language demonstrates that your design is not only object oriented; it is operationally aware, which is exactly what many machine-coding interviewers are probing for.',
      [
        'Separate session state from account data and cash inventory.',
        'Validate denomination availability before finalizing a withdrawal.',
        'Record transactions so partial failures can be reconciled.',
        'Treat cancel, timeout, and hardware faults as explicit transitions.'
      ],
      'ATM withdrawal coordinates account approval and cash availability',
      `
class CashBin:
    def __init__(self, notes):
        self.notes = dict(notes)

    def can_dispense(self, amount):
        return amount % 20 == 0 and sum(k * v for k, v in self.notes.items()) >= amount


class Account:
    def __init__(self, balance):
        self.balance = balance

    def debit(self, amount):
        if amount > self.balance:
            raise ValueError("insufficient funds")
        self.balance -= amount


if __name__ == "__main__":
    cash_bin = CashBin({20: 10, 50: 2})
    account = Account(200)
    if cash_bin.can_dispense(60):
        account.debit(60)
    print(account.balance)
`
    ),
    section(
      'Vending design: selection, payment, dispense, and refund',
      'Vending machines share the same transactional shape but replace accounts with payment collection and product inventory. ProductSlot, CatalogItem, CashRegister or PaymentCollector, and VendingSession are useful building blocks. The session tracks the selected slot, accumulated payment, and whether the machine is ready to dispense. Product inventory is scarce, so selection and dispense logic must guard against selling an empty slot or decrementing stock without confirmed payment.',
      'Refund behavior is what makes the design interesting. If a user inserts coins and then cancels, the session should return the collected amount and reset to idle. If dispense fails after payment is accepted, the machine needs a compensating path: refund immediately if possible, or record a claim. Interviewers often ask for this because it exposes whether your object model accounts for failure as a first-class part of the workflow rather than an afterthought.',
      [
        'Track selected item, inserted amount, and stock explicitly in the session.',
        'Only decrement product inventory after payment conditions are satisfied.',
        'Model cancel and refund as normal parts of the workflow.',
        'Keep product state and payment state separate but coordinated.'
      ],
      'A vending session checks stock and collected payment before dispense',
      `
class ProductSlot:
    def __init__(self, code, price, quantity):
        self.code = code
        self.price = price
        self.quantity = quantity

    def can_dispense(self):
        return self.quantity > 0

    def dispense(self):
        if not self.can_dispense():
            raise ValueError("out of stock")
        self.quantity -= 1


class VendingSession:
    def __init__(self, slot):
        self.slot = slot
        self.inserted = 0

    def insert(self, amount):
        self.inserted += amount


if __name__ == "__main__":
    slot = ProductSlot("A1", 30, 2)
    session = VendingSession(slot)
    session.insert(20)
    session.insert(10)
    if session.inserted >= slot.price:
        slot.dispense()
    print(slot.quantity)
`
    ),
    section(
      'Shared ideas: repositories, strategies, and machine boundaries',
      'ATMs and vending machines both benefit from clear boundaries between workflow, resource stores, and external integrations. A machine controller or session coordinates the use case. CashBin or InventoryRepository owns scarce resource mutation. An external BankService or PaymentGateway adapter hides remote details. Pricing or denomination-selection strategies can remain replaceable if the prompt evolves. This split prevents the device controller from becoming a god object that knows every rule and every storage detail.',
      'The interviewer may ask whether a full State pattern is required. The right answer is that explicit state can begin as enums and guarded methods. If transitions and state-specific behavior grow, state objects may be worth it. That demonstrates restraint. You understand the state machine concept without over-engineering the first version before the transition complexity earns a heavier abstraction.',
      [
        'Keep controllers focused on transaction order and validation flow.',
        'Let inventory and cash stores own scarce-resource mutation.',
        'Hide bank or payment-provider details behind adapters or services.',
        'Start with simple guarded states before reaching for full State objects.'
      ],
      'A small machine object coordinates stable collaborators',
      `
class Inventory:
    def __init__(self, slots):
        self.slots = {slot.code: slot for slot in slots}

    def get(self, code):
        return self.slots[code]


class ProductSlot:
    def __init__(self, code, price, quantity):
        self.code = code
        self.price = price
        self.quantity = quantity


class VendingMachine:
    def __init__(self, inventory):
        self.inventory = inventory

    def select(self, code):
        slot = self.inventory.get(code)
        return {"code": slot.code, "price": slot.price, "in_stock": slot.quantity > 0}


if __name__ == "__main__":
    machine = VendingMachine(Inventory([ProductSlot("A1", 30, 2)]))
    print(machine.select("A1"))
`
    ),
    section(
      'Follow-up questions are about invariants and partial failure',
      'The most convincing close for these prompts is to talk through invariants and partial failures. For an ATM, account debit and cash dispense must not diverge silently. For a vending machine, paid amount, dispensed product, and returned change must remain reconcilable. Logging or transaction records therefore belong in the design even for a compact interview version, because they explain how the system recovers from jams, network failures, user cancellations, or retried commands.',
      'You should also mention what you would test and which follow-ups you expect. For ATM: invalid PIN, insufficient funds, unsupported denomination, cancel after authentication, cash depletion, and duplicate withdraw retries. For vending: out of stock, underpayment, exact change, refund on cancel, failed dispense, and two sessions competing for the last item. That testing language proves the state model is not decorative; it is the basis for verifying the machine behaves safely under edge cases.',
      [
        'Name invariants around cash, stock, and recorded transaction outcomes.',
        'Describe compensating actions for mid-flow failures.',
        'Use explicit tests to validate both the happy path and the rollback path.',
        'Treat hardware concerns as first-class workflow cases.'
      ],
      'A transaction record captures what the machine attempted',
      `
class TransactionLog:
    def __init__(self):
        self.entries = []

    def record(self, kind, status, details):
        self.entries.append({"kind": kind, "status": status, "details": details})


if __name__ == "__main__":
    log = TransactionLog()
    log.record("withdrawal", "approved", {"amount": 60})
    log.record("dispense", "failed", {"reason": "cash_jam"})
    print(log.entries)
`
    )
  ],
  exercises: [
    codingExercise(
      'vending-purchase-flow',
      'Complete a vending purchase flow',
      'Finish the purchase method so the machine checks stock, verifies payment, dispenses the item, and returns change.',
      `
class ProductSlot:
    def __init__(self, code, price, quantity):
        self.code = code
        self.price = price
        self.quantity = quantity


class VendingMachine:
    def __init__(self):
        self.slots = {"A1": ProductSlot("A1", 30, 2)}

    def purchase(self, code, amount):
        slot = self.slots[code]
        # TODO: require stock, require amount >= price, decrement quantity,
        # and return a dict with dispensed code and change.
        raise NotImplementedError


print(VendingMachine().purchase("A1", 50))
`,
      `
class ProductSlot:
    def __init__(self, code, price, quantity):
        self.code = code
        self.price = price
        self.quantity = quantity


class VendingMachine:
    def __init__(self):
        self.slots = {"A1": ProductSlot("A1", 30, 2)}

    def purchase(self, code, amount):
        slot = self.slots[code]
        if slot.quantity <= 0:
            raise ValueError("out of stock")
        if amount < slot.price:
            raise ValueError("insufficient payment")
        slot.quantity -= 1
        return {"dispensed": code, "change": amount - slot.price}


print(VendingMachine().purchase("A1", 50))
`,
      [
        'Guard stock and payment before mutating quantity.',
        'Return change as part of the transaction result.',
        'Keep the method small enough to narrate as a state transition.'
      ],
      'The script prints a purchase result with the dispensed slot code and the returned change amount.',
      'intermediate'
    ),
    designExercise(
      'atm-vending-follow-up-design',
      'Handle partial failures and refunds',
      'Describe how you would extend either the ATM or vending design to reconcile partial failures such as cash jams, failed dispense, or cancel after payment collection.',
      [
        'Which transaction states must be recorded for later reconciliation?',
        'Where do refund or reversal actions belong in the workflow?',
        'How would hardware failures surface without corrupting inventory or cash state?',
        'Which invariants must remain true even if the machine stops mid-transaction?'
      ]
    )
  ],
  checklist: [
    'Can model ATM or vending behavior as explicit states with guarded transitions.',
    'Can separate machine workflow from cash or product inventory mutation.',
    'Can describe transaction logs, idempotent retries, and compensating actions for partial failures.',
    'Can keep the first version simple while leaving room for concurrency or richer state objects if needed.'
  ],
  pitfalls: [
    'Writing one long purchase or withdrawal method that mutates cash, state, and logs with no clear transition boundaries.',
    'Ignoring cancel, timeout, or hardware-failure paths until after the core design is already tangled.',
    'Mixing account logic, inventory mutation, and user-interface concerns inside the same controller object.'
  ],
  interviewPrompts: [
    'How would you model an ATM or vending machine as a state machine without over-engineering it?',
    'Where should cash or product inventory invariants live in the design?',
    'What happens if payment succeeds but dispense fails?'
  ],
  diagram: null,
  related: ['dependency-injection-and-testability', 'chess-or-game-system-lab', 'movie-ticket-or-splitwise-lab']
};

const bookingSplitwiseLesson = {
  slug: 'movie-ticket-or-splitwise-lab',
  title: 'Movie booking and Splitwise design lab',
  summary:
    'Practice two classic multi-entity prompts: protecting scarce seats with holds and bookings, and tracking group expenses with balances and settlement logic.',
  duration: '70-90 min',
  whyItMatters:
    'Movie-booking and Splitwise prompts test whether you can model a system where one visible user action touches several related entities. Booking asks for inventory protection over time: shows, seats, holds, bookings, hold expiry, idempotent payment confirmation, and payment. Splitwise asks for durable group accounting: members, expenses, shares, balances, duplicate-submission protection, and settlement simplification. In both cases the object model succeeds only if you can keep cross-entity invariants obvious while still leaving room for the concurrency, expiry, and idempotency follow-ups interviewers commonly ask now.',
  sections: [
    section(
      'These prompts are really about multi-entity invariants',
      'Movie booking and expense sharing both punish shallow entity lists. The challenge is not merely naming Show, Seat, User, Group, or Expense. The challenge is preserving invariants across them. A seat cannot be simultaneously available and booked. A group balance must still net to zero after an expense is added. When you frame the prompt around those invariants, your design decisions become easier to justify because each class exists to protect some shared truth about the system.',
      'This is also why a pure CRUD answer usually feels weak. If booking is only a row insert and Splitwise is only appending expenses, the system ignores the real coordination problem. Interviewers are often checking whether you can identify the critical workflow boundary that must read, validate, mutate, and record several related objects together without losing coherence under retries or concurrent users.',
      [
        'List invariants before listing classes.',
        'Use workflows that coordinate related entities around one state change.',
        'Avoid shallow CRUD designs that ignore hold or balance semantics.',
        'Make concurrency or idempotency part of the story early.'
      ],
      'Small domain objects become meaningful once invariants are named',
      `
class Seat:
    def __init__(self, seat_id):
        self.seat_id = seat_id
        self.status = "available"


class BalanceSheet:
    def __init__(self):
        self.balances = {}

    def add(self, user_id, delta):
        self.balances[user_id] = self.balances.get(user_id, 0) + delta


if __name__ == "__main__":
    seat = Seat("A1")
    sheet = BalanceSheet()
    sheet.add("ava", 20)
    sheet.add("sam", -20)
    print(seat.status, sheet.balances)
`
    ),
    section(
      'Movie booking: show, seat, hold, booking, and expiry',
      'A good movie-booking model usually separates relatively static show metadata from scarce seat inventory. Theater and Screen describe layout. Show represents a specific movie-time combination. SeatInventory or ShowSeat tracks availability for one show. SeatHold temporarily protects seats for a user and expires if payment does not complete. Booking is the committed purchase. This split makes the core workflow clear: find available seats, create a hold atomically, collect payment, convert hold to booking, then mark the seats booked.',
      'The key detail is that availability is scoped to a show, not to the theater seat globally. A1 can be booked for the 7 pm show and still be open for the 10 pm show. Holds also introduce time as a first-class concept, which means your design should talk about expiration checks, cleanup, and what happens when a client retries after network timeout. That operational awareness is usually what lifts a booking answer above a simple entity diagram.',
      [
        'Model seat availability per show rather than per theater seat globally.',
        'Use holds to protect seats before payment completes.',
        'Convert a successful hold into a booking as a distinct state change.',
        'Handle expiration and retry behavior explicitly.'
      ],
      'Seat holds protect scarce inventory before booking',
      `
class SeatHold:
    def __init__(self, hold_id, seat_ids, user_id, expires_at):
        self.hold_id = hold_id
        self.seat_ids = list(seat_ids)
        self.user_id = user_id
        self.expires_at = expires_at
        self.status = "active"

    def expire(self, now):
        if now >= self.expires_at and self.status == "active":
            self.status = "expired"


if __name__ == "__main__":
    hold = SeatHold("H-1", ["A1", "A2"], "u1", expires_at=10)
    hold.expire(11)
    print(hold.status)
`
    ),
    section(
      'Splitwise: group membership, expense shares, and balances',
      'Splitwise-like systems work best when you separate immutable expense facts from derived balance summaries. Group holds membership. Expense records who paid, the total amount, and how the cost is split. BalanceSheet or GroupLedger tracks net owed amounts per member. This means the add-expense workflow can validate the participants and the share sum, persist the expense, then update the ledger in a deterministic way. The derived balances remain explainable because they are tied directly to expense events.',
      'A useful interview simplification is to start with equal or exact splits and defer percentage or weighted splits until the follow-up round. That keeps the base model honest and lets you emphasize invariants: the sum of shares equals the expense total, and the final net balances across the group sum to zero. If those invariants are explicit, extensions such as recurring expenses or settlement suggestions have a stable place to attach.',
      [
        'Separate expense facts from derived group balances.',
        'Validate that participant shares add up to the expense amount.',
        'Treat the ledger as a summary updated by expense events.',
        'Start with equal or exact splits before adding richer share types.'
      ],
      'A ledger update keeps group net balances coherent',
      `
class GroupLedger:
    def __init__(self):
        self.balances = {}

    def apply_expense(self, paid_by, shares):
        total = sum(shares.values())
        self.balances[paid_by] = self.balances.get(paid_by, 0) + total
        for member, share in shares.items():
            self.balances[member] = self.balances.get(member, 0) - share


if __name__ == "__main__":
    ledger = GroupLedger()
    ledger.apply_expense("ava", {"ava": 10, "sam": 20, "lee": 20})
    print(ledger.balances)
`
    ),
    section(
      'Service boundaries: booking concurrency and expense consistency',
      'Both prompts need an orchestration layer. In booking, a BookingService or ShowReservationService should atomically create holds, validate they are still active, and convert them into bookings. In Splitwise, an ExpenseService should validate members and shares, persist the expense, and update balances together. This is where repositories or transactional boundaries matter, because these workflows touch several records that must stay consistent if retried or interrupted.',
      'Concurrency is especially visible in booking: two users may try to hold the same seats at once. The repository boundary needs an atomic hold operation or lock keyed by show and seat ids. Expense sharing has a softer concurrency story, but idempotency still matters if a client resubmits the same expense after timeout. Mentioning these details signals that you understand the system as a workflow under imperfect conditions, not merely as a set of tables or classes.',
      [
        'Use services to coordinate multi-entity updates coherently.',
        'Protect seat holds with atomic operations keyed by show and seat.',
        'Use idempotency or duplicate detection for expense submissions.',
        'Keep derived balance updates tied to persisted expense records.'
      ],
      'A booking service converts active holds into bookings',
      `
class BookingService:
    def __init__(self):
        self.bookings = []

    def confirm(self, hold, now):
        if hold.status != "active" or now >= hold.expires_at:
            raise ValueError("hold is not bookable")
        hold.status = "consumed"
        booking = {"booking_id": f"B-{len(self.bookings) + 1}", "seats": hold.seat_ids}
        self.bookings.append(booking)
        return booking


if __name__ == "__main__":
    hold = type("Hold", (), {"status": "active", "expires_at": 10, "seat_ids": ["A1", "A2"]})()
    print(BookingService().confirm(hold, 5))
`
    ),
    section(
      'Close with extension points and simplified settlement logic',
      'The most useful follow-up language for these prompts is about where growth lands. Booking extensions include seat categories, payment status, cancellation policies, waitlists, multi-show search, hold expiry cleanup, and idempotent payment confirmation. Splitwise extensions include unequal shares, recurring expenses, currency handling, duplicate-expense suppression, and settlement suggestions. If the base design separates event facts from derived state and keeps the orchestrating service clear, these features become additive rather than destabilizing.',
      'For settlement, a compact answer is to compute debtors and creditors from net balances, then greedily match them. You do not need optimal graph minimization in the first version. The important part is that the ledger already exposes per-user net balances, so settlement is a derived service rather than a rewrite of the expense model. That shows the object model has left a useful seam for a likely interviewer follow-up, while the core booking flow remains ready for concurrency and retry questions.',
      [
        'Keep booking and expense facts durable so richer views can be derived later.',
        'Treat settlement suggestions as a service over net balances, not a ledger replacement.',
        'Use follow-ups to show stable seams rather than to add unrelated abstractions.',
        'Test expiry, duplicate requests, and zero-sum balance invariants explicitly.'
      ],
      'Net balances can drive a simple settlement suggestion',
      `
def simplify_balances(balances):
    creditors = [[user, amount] for user, amount in balances.items() if amount > 0]
    debtors = [[user, -amount] for user, amount in balances.items() if amount < 0]
    settlements = []
    i = j = 0
    while i < len(creditors) and j < len(debtors):
        amount = min(creditors[i][1], debtors[j][1])
        settlements.append((debtors[j][0], creditors[i][0], amount))
        creditors[i][1] -= amount
        debtors[j][1] -= amount
        if creditors[i][1] == 0:
            i += 1
        if debtors[j][1] == 0:
            j += 1
    return settlements


if __name__ == "__main__":
    print(simplify_balances({"ava": 40, "sam": -15, "lee": -25}))
`
    )
  ],
  exercises: [
    codingExercise(
      'seat-hold-and-booking-flow',
      'Implement a seat hold and booking flow',
      'Complete the methods so seats are held only if available and a valid hold can later be converted into a booking.',
      `
class SeatInventory:
    def __init__(self):
        self.seats = {"A1": "open", "A2": "open"}

    def hold(self, seat_ids):
        # TODO: ensure all requested seats are open, then mark them held.
        raise NotImplementedError


class BookingService:
    def book(self, inventory, seat_ids):
        # TODO: create a booking only after a successful hold.
        raise NotImplementedError


service = BookingService()
print(service.book(SeatInventory(), ["A1", "A2"]))
`,
      `
class SeatInventory:
    def __init__(self):
        self.seats = {"A1": "open", "A2": "open"}

    def hold(self, seat_ids):
        if not all(self.seats.get(seat_id) == "open" for seat_id in seat_ids):
            raise ValueError("seat unavailable")
        for seat_id in seat_ids:
            self.seats[seat_id] = "held"
        return {"seat_ids": seat_ids, "status": "held"}


class BookingService:
    def book(self, inventory, seat_ids):
        hold = inventory.hold(seat_ids)
        for seat_id in seat_ids:
            inventory.seats[seat_id] = "booked"
        return {"booking_status": "confirmed", "seat_ids": hold["seat_ids"]}


service = BookingService()
print(service.book(SeatInventory(), ["A1", "A2"]))
`,
      [
        'Protect all requested seats before confirming any booking.',
        'Model the hold as an intermediate state rather than booking directly.',
        'Keep seat-state transitions explicit so follow-up expiry logic has a place to live.'
      ],
      'The script prints a confirmed booking result for the held seats.',
      'intermediate'
    ),
    designExercise(
      'splitwise-group-ledger-design',
      'Design a Splitwise group ledger',
      'Describe how you would support exact splits, expense edits, and settlement suggestions while keeping the group ledger consistent and explainable.',
      [
        'Which entities are immutable expense facts and which represent derived balance summaries?',
        'How would you validate share totals before updating balances?',
        'What should happen if the same expense submission is retried?',
        'Where would a balance-simplification algorithm fit without distorting the source ledger?'
      ]
    )
  ],
  checklist: [
    'Can explain movie booking in terms of show-scoped seat inventory, holds, and bookings.',
    'Can explain Splitwise in terms of expense facts, share validation, and derived net balances.',
    'Can identify service boundaries where multi-entity updates need transactional, concurrent, or idempotent handling.',
    'Can answer common follow-ups such as hold expiry, cancellations, unequal splits, or settlement suggestions.'
  ],
  pitfalls: [
    'Treating seat availability as a global seat property instead of a per-show inventory fact.',
    'Updating group balances without validating that expense shares sum correctly or remain zero-sum overall.',
    'Skipping hold or idempotency modeling and assuming the happy path is enough for booking or expense submission.'
  ],
  interviewPrompts: [
    'Why do movie-ticket systems usually need seat holds before bookings?',
    'How would you keep a Splitwise ledger explainable while still generating simplified settlements?',
    'What repository or transaction boundary matters most in booking or expense sharing?'
  ],
  diagram: null,
  related: ['chess-or-game-system-lab', 'atm-or-vending-machine-lab', 'cohesion-coupling-and-grasp']
};

export const rawLldAdvancedModules = [
  {
    slug: 'lld-solid-principles-lab',
    title: 'SOLID and design principles lab',
    summary:
      'Study SOLID, cohesion/coupling, and dependency design as practical interview tools for maintainable object models.',
    objectives: [
      'Apply SOLID as a judgment framework for refactoring responsibilities and extension points',
      'Use cohesion, coupling, and GRASP heuristics to assign behavior to the right objects',
      'Design constructor-injected seams that improve dependency management and testability'
    ],
    lessons: [solidLesson, cohesionLesson, diLesson]
  },
  {
    slug: 'lld-machine-coding-classics',
    title: 'Machine-coding classics lab',
    summary:
      'Practice classic machine-coding prompts—board games, ATM/vending, and booking/expense systems—with full object models, invariants, and extension drills.',
    objectives: [
      'Model board-game state, move validation, and turn control with clear object boundaries',
      'Design transactional machines around state, inventory or cash invariants, and failure handling',
      'Reason about multi-entity booking and expense-sharing models with holds, balances, and consistency rules'
    ],
    lessons: [chessLesson, atmLesson, bookingSplitwiseLesson]
  }
];
