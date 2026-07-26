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

const creationalLesson = {
  slug: 'creational-patterns-in-practice',
  title: 'Creational patterns in practice',
  summary:
    'Learn Factory, Builder, and Singleton as practical object-creation tools, including when each improves clarity and when the simpler constructor is the better design.',
  duration: '55-70 min',
  whyItMatters:
    'Object creation is often where a design first becomes rigid. If every caller knows concrete classes, configuration flags, validation rules, and environment-specific wiring, future changes leak everywhere. Creational patterns give those decisions a home, but they also add indirection that must earn its place.',
  sections: [
    {
      heading: 'Start with the construction problem, not the pattern name',
      body: paragraphs(
        'Creational patterns are not badges to attach to every class. They solve specific construction pressure: choosing a concrete implementation, assembling a complex object safely, or controlling the lifecycle of a shared resource. The first question is always what object creation problem exists in the current design.',
        'A good smell test is duplication. If callers repeat the same constructor conditionals, pass long positional argument lists, or reach into global configuration to assemble dependencies, construction deserves a boundary. If creation is one clear constructor call with no policy, a pattern is ceremony and makes the design harder to explain.'
      ),
      bullets: [
        'Factory names the decision of which concrete object to create.',
        'Builder names the steps and invariants for assembling a complex object.',
        'Singleton names process-wide uniqueness, but often hides global state.',
        'Plain constructors remain best when construction has no branching or staged validation.'
      ],
      codeExample: codeExample(
        'Bad construction: checkout owns channel selection',
        `
class EmailReceipt:
    def __init__(self, address):
        self.address = address

    def send(self, order_id):
        print(f"email {self.address}: receipt for {order_id}")


class SmsReceipt:
    def __init__(self, phone):
        self.phone = phone

    def send(self, order_id):
        print(f"sms {self.phone}: receipt for {order_id}")


class CheckoutService:
    def checkout(self, order, user, settings):
        # Bad smell: checkout owns every constructor detail.
        if settings["receipt_channel"] == "email":
            sender = EmailReceipt(user["email"])
        elif settings["receipt_channel"] == "sms":
            sender = SmsReceipt(user["phone"])
        else:
            raise ValueError("unsupported receipt channel")
        sender.send(order["id"])


if __name__ == "__main__":
    CheckoutService().checkout(
        {"id": "ord-1"},
        {"email": "a@example.com", "phone": "+15550001"},
        {"receipt_channel": "email"},
    )
`
      )
    },
    {
      heading: 'Factory: isolate the concrete-class decision',
      body: paragraphs(
        'Factory is useful when callers should depend on a capability while the concrete class depends on configuration, request shape, tenant, feature flag, or environment. The factory becomes the one place where that selection logic is allowed to live.',
        'The factory should create or wire collaborators; it should not become the business workflow. If a factory starts charging orders, sending emails, and updating inventory, it has escaped its responsibility. Split it by product family or move workflow behavior back into application services.'
      ),
      bullets: [
        'Use Factory when object type varies for a reason the caller should not own.',
        'Return an interface-like object so callers stay stable.',
        'Fail loudly for unknown configuration keys.',
        'Avoid wrapping a single constructor with no decision behind it.'
      ],
      codeExample: codeExample(
        'Factory keeps checkout stable',
        `
from abc import ABC, abstractmethod


class ReceiptSender(ABC):
    @abstractmethod
    def send(self, order_id):
        raise NotImplementedError


class EmailReceiptSender(ReceiptSender):
    def __init__(self, address):
        self.address = address

    def send(self, order_id):
        print(f"email {self.address}: receipt for {order_id}")


class SmsReceiptSender(ReceiptSender):
    def __init__(self, phone):
        self.phone = phone

    def send(self, order_id):
        print(f"sms {self.phone}: receipt for {order_id}")


class ReceiptSenderFactory:
    def create(self, user, channel):
        if channel == "email":
            return EmailReceiptSender(user["email"])
        if channel == "sms":
            return SmsReceiptSender(user["phone"])
        raise ValueError(f"unsupported receipt channel: {channel}")


class CheckoutService:
    def __init__(self, receipt_factory):
        self.receipt_factory = receipt_factory

    def checkout(self, order, user, channel):
        sender = self.receipt_factory.create(user, channel)
        sender.send(order["id"])


if __name__ == "__main__":
    service = CheckoutService(ReceiptSenderFactory())
    service.checkout({"id": "ord-2"}, {"email": "b@example.com", "phone": "+15550002"}, "sms")
`
      )
    },
    {
      heading: 'Builder: protect multi-step construction',
      body: paragraphs(
        'Builder helps when an object has required fields, optional fields, defaults, and cross-field validation. The goal is not fluent syntax for its own sake; the goal is making invalid construction hard to express and making valid construction readable at the call site.',
        'Use a builder when constructors become long and ambiguous, when callers repeat default values, or when some fields only make sense with other fields. Do not use a builder to hide a vague model. If the object has three obvious fields, Python keyword arguments or a dataclass are usually clearer.'
      ),
      bullets: [
        'Hold partial state privately until build() validates it.',
        'Name optional choices through fluent methods.',
        'Return an immutable or hard-to-mutate object when possible.',
        'Prefer a plain dataclass when construction is already obvious.'
      ],
      codeExample: codeExample(
        'Builder for a deploy request',
        `
from dataclasses import dataclass, field


@dataclass(frozen=True)
class DeployRequest:
    service: str
    image: str
    environment: str
    replicas: int
    canary_percent: int = 0
    labels: dict = field(default_factory=dict)


class DeployRequestBuilder:
    def __init__(self):
        self._service = None
        self._image = None
        self._environment = "staging"
        self._replicas = 1
        self._canary_percent = 0
        self._labels = {}

    def service(self, name):
        self._service = name
        return self

    def image(self, image):
        self._image = image
        return self

    def production(self):
        self._environment = "production"
        return self

    def replicas(self, count):
        self._replicas = count
        return self

    def canary(self, percent):
        self._canary_percent = percent
        return self

    def label(self, key, value):
        self._labels[key] = value
        return self

    def build(self):
        if not self._service or not self._image:
            raise ValueError("service and image are required")
        if self._environment == "production" and self._replicas < 2:
            raise ValueError("production deploys need at least two replicas")
        if not 0 <= self._canary_percent <= 100:
            raise ValueError("canary percent must be between 0 and 100")
        return DeployRequest(
            self._service,
            self._image,
            self._environment,
            self._replicas,
            self._canary_percent,
            dict(self._labels),
        )


if __name__ == "__main__":
    request = (
        DeployRequestBuilder()
        .service("payments")
        .image("payments:v42")
        .production()
        .replicas(3)
        .canary(10)
        .label("owner", "platform")
        .build()
    )
    print(request)
`
      )
    },
    {
      heading: 'Singleton: constrain shared resources carefully',
      body: paragraphs(
        'Singleton restricts a class to one instance in a process. It can fit a true process-wide resource such as a registry, metrics sink, or expensive client whose lifecycle is owned by application startup. The risk is that Singleton turns dependency access into invisible global state, so in most current codebases it is a last resort rather than a default pattern.',
        'A production-minded design separates uniqueness from access. The object may be unique, but callers can still receive it explicitly through process-scoped dependency injection or a composition root. That makes tests able to pass fakes, makes lifecycle visible, and avoids request-specific or tenant-specific state leaking through a process-wide object.'
      ),
      bullets: [
        'Use Singleton sparingly for true process-wide invariants.',
        'Prefer process-scoped dependency injection for shared clients and configuration snapshots.',
        'Define test reset and shutdown behavior if a singleton mutates state.',
        'Never store request-specific data in a singleton.'
      ],
      codeExample: codeExample(
        'Singleton pitfall and injected alternative',
        `
class BadGlobalFlags:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.flags = {}
        return cls._instance


class PriceWithGlobal:
    def price(self, subtotal):
        if BadGlobalFlags().flags.get("holiday_sale"):
            return subtotal * 0.9
        return subtotal


class PriceCalculator:
    def __init__(self, flags):
        self.flags = flags

    def price(self, subtotal):
        if self.flags.get("holiday_sale"):
            return subtotal * 0.9
        return subtotal


if __name__ == "__main__":
    calculator = PriceCalculator({"holiday_sale": True})
    print(calculator.price(100))
`
      )
    },
    {
      heading: 'Production implications and interview trade-off language',
      body: paragraphs(
        'Creational patterns sit close to startup, configuration, and domain invariants. Factory failures often look like configuration drift. Builder failures often look like invalid objects entering workflows. Singleton failures often look like test order dependence, stale state, or concurrency bugs.',
        'In an interview, say the baseline first: start with a constructor, add Factory when concrete selection varies, add Builder when construction has staged invariants, and avoid Singleton unless uniqueness is a real runtime invariant. That answer shows pattern knowledge and restraint.'
      ),
      bullets: [
        'Test factories with known and unknown keys.',
        'Test builders with missing and contradictory fields.',
        'Log selected construction paths when configuration drives them.',
        'Explain why the pattern improves the current design, not only future dreams.'
      ]
    }
  ],
  exercises: [
    codingExercise(
      'receipt-factory-refactor',
      'Refactor receipt creation into a Factory',
      'Move channel-specific receipt construction out of CheckoutService while keeping checkout focused on workflow.',
      `
class EmailReceipt:
    def __init__(self, address):
        self.address = address

    def send(self, order_id):
        print(f"email {self.address}: {order_id}")


class SmsReceipt:
    def __init__(self, phone):
        self.phone = phone

    def send(self, order_id):
        print(f"sms {self.phone}: {order_id}")


class CheckoutService:
    def checkout(self, order_id, user, channel):
        # TODO: introduce ReceiptFactory and remove this conditional.
        if channel == "email":
            sender = EmailReceipt(user["email"])
        else:
            sender = SmsReceipt(user["phone"])
        sender.send(order_id)


CheckoutService().checkout("ord-1", {"email": "a@example.com", "phone": "+1555"}, "email")
`,
      `
class EmailReceipt:
    def __init__(self, address):
        self.address = address

    def send(self, order_id):
        print(f"email {self.address}: {order_id}")


class SmsReceipt:
    def __init__(self, phone):
        self.phone = phone

    def send(self, order_id):
        print(f"sms {self.phone}: {order_id}")


class ReceiptFactory:
    def create(self, user, channel):
        if channel == "email":
            return EmailReceipt(user["email"])
        if channel == "sms":
            return SmsReceipt(user["phone"])
        raise ValueError(f"unsupported channel: {channel}")


class CheckoutService:
    def __init__(self, factory):
        self.factory = factory

    def checkout(self, order_id, user, channel):
        self.factory.create(user, channel).send(order_id)


CheckoutService(ReceiptFactory()).checkout("ord-1", {"email": "a@example.com", "phone": "+1555"}, "email")
`,
      [
        'Create one class whose job is channel selection.',
        'Keep CheckoutService free of concrete receipt classes.',
        'Raise an error for unsupported channels.'
      ],
      'The checkout flow sends a receipt while construction lives in ReceiptFactory.',
      'beginner'
    ),
    designExercise(
      'singleton-review',
      'Review a proposed Singleton flag cache',
      'Evaluate whether a process-wide Singleton is appropriate for feature flags in a web app.',
      [
        'What invariant requires exactly one instance?',
        'Can callers receive the flag snapshot explicitly instead?',
        'How do tests reset or replace the cache?',
        'What happens when flags differ by tenant or request?',
        'Which lifecycle owns refresh and shutdown?'
      ]
    )
  ],
  checklist: [
    'Can explain the construction problem before naming Factory, Builder, or Singleton.',
    'Can choose Factory when callers should not know concrete implementation classes.',
    'Can use Builder to enforce required fields and cross-field invariants.',
    'Can explain why Singleton often harms tests and lifecycle management.',
    'Can compare each pattern with a plain constructor.',
    'Can describe production failure modes around configuration and hidden state.'
  ],
  pitfalls: [
    'Creating a factory for every class even when no construction decision exists.',
    'Letting a factory become a business workflow or god object.',
    'Using Builder syntax to hide an unclear model instead of enforcing invariants.',
    'Using Singleton as a shortcut for dependency access.',
    'Ignoring test reset and concurrency behavior for shared objects.'
  ],
  interviewPrompts: [
    'When is a Factory better than directly calling a constructor?',
    'How would you design a Builder that prevents invalid deploy requests?',
    'Why can Singleton make machine-coding solutions harder to test?',
    'What construction logic would you keep out of creational patterns?'
  ],
  diagram: null,
  related: ['responsibilities-and-interfaces', 'solid-principles', 'dependency-injection', 'parking-lot-design']
};

const structuralLesson = {
  slug: 'structural-patterns-in-practice',
  title: 'Structural patterns in practice',
  summary:
    'Use Adapter, Decorator, Facade, and Composite to shape object relationships while keeping callers insulated from mismatched APIs, optional behavior, subsystem complexity, and object trees.',
  duration: '55-70 min',
  whyItMatters:
    'Most object designs fail because relationships between classes become painful. Structural patterns let you preserve stable caller-facing interfaces while legacy APIs, optional features, and nested models evolve behind them.',
  sections: [
    {
      heading: 'Structural patterns manage relationships',
      body: paragraphs(
        'Adapter handles interface mismatch, Decorator layers behavior, Facade simplifies a subsystem, and Composite gives trees a uniform interface. These patterns are about how objects fit together, not about replacing domain modeling.',
        'The smell test is relationship friction. If callers translate requests into a vendor shape, use Adapter. If subclasses explode for optional behavior, use Decorator. If a use case requires many subsystem calls in the right order, use Facade. If callers manually recurse through leaves and groups, use Composite.'
      ),
      bullets: [
        'Adapter changes the interface of a wrapped object.',
        'Decorator preserves an interface while adding behavior.',
        'Facade exposes a smaller operation over multiple collaborators.',
        'Composite lets leaves and containers share one operation.'
      ],
      codeExample: codeExample(
        'Bad integration: provider details leak into checkout',
        `
class StripeLikeGateway:
    def create_charge(self, cents, currency, source_token, capture_now):
        print(f"charging {cents} {currency} from {source_token}, capture={capture_now}")
        return {"id": "ch_123", "status": "succeeded"}


class CheckoutService:
    def __init__(self, gateway):
        self.gateway = gateway

    def pay(self, order):
        # Bad smell: checkout knows provider field names and units.
        result = self.gateway.create_charge(
            cents=order["total_dollars"] * 100,
            currency="USD",
            source_token=order["payment_token"],
            capture_now=True,
        )
        return result["id"]


if __name__ == "__main__":
    print(CheckoutService(StripeLikeGateway()).pay({"total_dollars": 25, "payment_token": "tok_visa"}))
`
      )
    },
    {
      heading: 'Adapter: own translation at the boundary',
      body: paragraphs(
        'Adapter converts one interface into the interface the client wants. It is strongest around third-party services, legacy classes, vendor migration, and tests. The rest of the domain speaks in its own language while the adapter absorbs provider-specific fields, response shapes, and exceptions.',
        'Do not use Adapter to hide internal conceptual chaos. If every internal class needs translation to talk to every other internal class, the real problem is inconsistent ownership. Adapter belongs at an intentional boundary.'
      ),
      bullets: [
        'Define the domain-facing interface first.',
        'Translate provider errors into domain-level failures.',
        'Keep provider-specific code out of high-level services.',
        'Avoid stacks of adapters when one boundary adapter is enough.'
      ],
      codeExample: codeExample(
        'Payment Adapter with a domain-facing port',
        `
from dataclasses import dataclass


@dataclass
class PaymentRequest:
    amount_dollars: int
    token: str


class PaymentPort:
    def charge(self, request):
        raise NotImplementedError


class StripeLikeGateway:
    def create_charge(self, cents, currency, source_token, capture_now):
        return {"id": "ch_123", "status": "succeeded"}


class StripePaymentAdapter(PaymentPort):
    def __init__(self, gateway):
        self.gateway = gateway

    def charge(self, request):
        result = self.gateway.create_charge(
            cents=request.amount_dollars * 100,
            currency="USD",
            source_token=request.token,
            capture_now=True,
        )
        if result["status"] != "succeeded":
            raise RuntimeError("payment failed")
        return result["id"]


if __name__ == "__main__":
    adapter = StripePaymentAdapter(StripeLikeGateway())
    print(adapter.charge(PaymentRequest(25, "tok_visa")))
`
      )
    },
    {
      heading: 'Decorator: layer optional behavior',
      body: paragraphs(
        'Decorator wraps an object with the same interface and adds behavior before, after, or around delegation. It is ideal for caching, metrics, logging, retries, authorization, rate limiting, and compression because those concerns can vary independently of the core object.',
        'The production implication is order. Retry outside metrics measures repeated attempts differently than metrics outside retry. Cache outside authorization can leak data if keys are wrong. Decorators are powerful because composition is flexible, and that flexibility requires tests and clear composition roots.'
      ),
      bullets: [
        'Use Decorator when optional behavior should compose around the same interface.',
        'Keep wrappers transparent to callers.',
        'Document order-sensitive stacks.',
        'Avoid deep wrapper chains that are hard to debug.'
      ],
      codeExample: codeExample(
        'Caching decorator around a catalog',
        `
class Catalog:
    def get_item(self, item_id):
        raise NotImplementedError


class DatabaseCatalog(Catalog):
    def get_item(self, item_id):
        print("database lookup")
        return {"id": item_id, "name": "Notebook"}


class CachedCatalog(Catalog):
    def __init__(self, inner):
        self.inner = inner
        self.cache = {}

    def get_item(self, item_id):
        if item_id not in self.cache:
            self.cache[item_id] = self.inner.get_item(item_id)
        return self.cache[item_id]


class MetricsCatalog(Catalog):
    def __init__(self, inner):
        self.inner = inner
        self.calls = 0

    def get_item(self, item_id):
        self.calls += 1
        item = self.inner.get_item(item_id)
        print(f"catalog calls={self.calls}")
        return item


if __name__ == "__main__":
    catalog = MetricsCatalog(CachedCatalog(DatabaseCatalog()))
    print(catalog.get_item("sku-1"))
    print(catalog.get_item("sku-1"))
`
      )
    },
    {
      heading: 'Facade: give a subsystem one stable front door',
      body: paragraphs(
        'Facade exposes a simpler operation over a set of classes. It is useful when clients need a cohesive use case such as place_order(), not five fragile subsystem calls in a specific sequence. The facade owns orchestration while lower-level services keep focused responsibilities.',
        'A facade becomes dangerous when it turns into a dumping ground for unrelated convenience methods. Keep it aligned with a use case or subsystem boundary. If it imports half the codebase and every method is unrelated, split it by workflow or move behavior back to the owning classes.'
      ),
      bullets: [
        'Expose cohesive operations, not every subsystem method.',
        'Keep underlying services independently testable.',
        'Use the facade to simplify clients, not centralize all domain behavior.',
        'Watch for vague names like Manager that hide unclear responsibility.'
      ],
      codeExample: codeExample(
        'Order Facade over focused services',
        `
class InventoryService:
    def reserve(self, sku, quantity):
        print(f"reserved {quantity} of {sku}")


class PaymentService:
    def charge(self, customer_id, amount):
        print(f"charged {customer_id} $ {amount}")
        return "payment-1"


class ShippingService:
    def create_label(self, address):
        print(f"label for {address}")
        return "label-1"


class OrderFacade:
    def __init__(self, inventory, payments, shipping):
        self.inventory = inventory
        self.payments = payments
        self.shipping = shipping

    def place_order(self, customer_id, sku, quantity, amount, address):
        self.inventory.reserve(sku, quantity)
        payment_id = self.payments.charge(customer_id, amount)
        label_id = self.shipping.create_label(address)
        return {"payment_id": payment_id, "label_id": label_id}


if __name__ == "__main__":
    facade = OrderFacade(InventoryService(), PaymentService(), ShippingService())
    print(facade.place_order("cust-1", "notebook", 2, 18, "101 Main"))
`
      )
    },
    {
      heading: 'Composite: model part-whole trees uniformly',
      body: paragraphs(
        'Composite lets clients treat a single object and a group of objects through the same interface. It fits folders and files, menu trees, organization charts, UI widgets, nested comments, task hierarchies, and rule trees.',
        'Do not force Composite onto flat data. It pays off when the hierarchy is part of the domain and operations naturally apply at every level. If leaves and containers have very different behavior, one shared interface may make invalid operations look valid.'
      ),
      bullets: [
        'Use when leaves and groups share a meaningful operation.',
        'Put traversal and aggregation inside the composite.',
        'Protect tree invariants such as no invalid parent-child types.',
        'Avoid when the model is not naturally hierarchical.'
      ],
      codeExample: codeExample(
        'Composite for nested project work',
        `
class WorkItem:
    def estimate_hours(self):
        raise NotImplementedError

    def describe(self, indent=0):
        raise NotImplementedError


class Task(WorkItem):
    def __init__(self, name, hours):
        self.name = name
        self.hours = hours

    def estimate_hours(self):
        return self.hours

    def describe(self, indent=0):
        print(" " * indent + f"- {self.name}: {self.hours}h")


class Epic(WorkItem):
    def __init__(self, name):
        self.name = name
        self.children = []

    def add(self, item):
        self.children.append(item)
        return self

    def estimate_hours(self):
        return sum(child.estimate_hours() for child in self.children)

    def describe(self, indent=0):
        print(" " * indent + f"+ {self.name}: {self.estimate_hours()}h")
        for child in self.children:
            child.describe(indent + 2)


if __name__ == "__main__":
    epic = Epic("Checkout redesign").add(Task("Payment adapter", 5)).add(Task("Receipt UI", 3))
    epic.describe()
`
      )
    }
  ],
  exercises: [
    codingExercise(
      'payment-adapter',
      'Wrap a third-party payment client',
      'Create a domain-facing PaymentPort so CheckoutService no longer knows provider-specific field names.',
      `
class VendorGateway:
    def create_charge(self, cents, source_token):
        return {"charge_id": "ch_1", "cents": cents, "token": source_token}


class CheckoutService:
    def __init__(self, gateway):
        self.gateway = gateway

    def pay(self, dollars, token):
        # TODO: depend on an adapter with charge(dollars, token).
        result = self.gateway.create_charge(dollars * 100, token)
        return result["charge_id"]


print(CheckoutService(VendorGateway()).pay(12, "tok_1"))
`,
      `
class VendorGateway:
    def create_charge(self, cents, source_token):
        return {"charge_id": "ch_1", "cents": cents, "token": source_token}


class PaymentPort:
    def charge(self, dollars, token):
        raise NotImplementedError


class VendorPaymentAdapter(PaymentPort):
    def __init__(self, gateway):
        self.gateway = gateway

    def charge(self, dollars, token):
        return self.gateway.create_charge(dollars * 100, token)["charge_id"]


class CheckoutService:
    def __init__(self, payments):
        self.payments = payments

    def pay(self, dollars, token):
        return self.payments.charge(dollars, token)


print(CheckoutService(VendorPaymentAdapter(VendorGateway())).pay(12, "tok_1"))
`,
      ['Define the interface CheckoutService wants.', 'Move cents conversion into the adapter.', 'Return a provider-neutral charge id.'],
      'CheckoutService calls charge() and prints the vendor charge id.'
    ),
    designExercise(
      'facade-boundary-review',
      'Design an order Facade boundary',
      'Sketch which methods belong on an OrderFacade and which should remain in lower-level services.',
      [
        'What cohesive use case does the facade represent?',
        'Which services does it coordinate?',
        'What should the facade return to callers?',
        'Which methods would make it too broad?',
        'How would you test orchestration without testing every service implementation?'
      ]
    )
  ],
  checklist: [
    'Can distinguish Adapter, Decorator, Facade, and Composite by the relationship problem each solves.',
    'Can adapt a third-party API behind a domain-facing interface.',
    'Can compose optional behavior with decorators while explaining order effects.',
    'Can design a facade that coordinates services without becoming a god object.',
    'Can model a tree with Composite only when leaves and groups share meaningful operations.',
    'Can explain when a structural pattern adds unnecessary indirection.'
  ],
  pitfalls: [
    'Using Adapter to paper over inconsistent internal concepts instead of fixing ownership.',
    'Stacking decorators until behavior depends on undocumented wrapper order.',
    'Turning a Facade into a broad manager that owns every workflow.',
    'Forcing Composite onto a model that is not naturally hierarchical.',
    'Letting callers depend on concrete wrappers instead of a stable interface.'
  ],
  interviewPrompts: [
    'Explain Adapter versus Facade with a payment example.',
    'How would you add caching and metrics without editing a repository class?',
    'When does Composite make a tree model simpler?',
    'What production bugs can decorator ordering create?'
  ],
  diagram: null,
  related: ['composition-over-inheritance', 'responsibilities-and-interfaces', 'solid-principles', 'library-management-system']
};

const behavioralLesson = {
  slug: 'behavioral-patterns-in-practice',
  title: 'Behavioral patterns in practice',
  summary:
    'Apply Strategy, Observer, State, Command, and Template Method to organize decisions, events, lifecycles, actions, and reusable workflow skeletons.',
  duration: '60-75 min',
  whyItMatters:
    'Behavioral patterns are about where changing behavior lives. They help avoid giant conditionals, hidden side effects, invalid state transitions, and copy-pasted workflow order, but they are easy to overuse when a small local conditional would be clearer.',
  sections: [
    {
      heading: 'Separate what changes from what stays stable',
      body: paragraphs(
        'Strategy varies an algorithm. Observer varies who reacts to an event. State varies behavior by lifecycle stage. Command varies when and how an action is executed. Template Method keeps workflow order stable while allowing specific steps to vary.',
        'The smell test is repeated behavior branching. If pricing, routing, validation, or assignment rules appear in many services, Strategy may help. If status checks make every method fragile, State may help. If actions need retry, audit, queueing, or undo, Command may help. If the branch is local and stable, keep it simple.'
      ),
      bullets: [
        'Strategy is for interchangeable policies or algorithms.',
        'Observer is for event notification without hard-wired listeners.',
        'State is for lifecycle-dependent behavior.',
        'Command is for actions with identity and lifecycle.',
        'Template Method is for fixed workflow order with variable steps.'
      ],
      codeExample: codeExample(
        'Bad behavior branching inside workflow',
        `
class ShippingService:
    def quote(self, order, customer):
        # Bad smell: policy rules grow inside the workflow.
        if customer["tier"] == "vip":
            return 0
        if order["weight"] > 20:
            return 25
        if order["speed"] == "express":
            return 15
        return 7


if __name__ == "__main__":
    print(ShippingService().quote({"weight": 3, "speed": "express"}, {"tier": "standard"}))
`
      )
    },
    {
      heading: 'Strategy: move interchangeable policies behind one interface',
      body: paragraphs(
        'Strategy turns a variable decision into an object. The caller depends on a policy interface and can receive different implementations for pricing, ranking, routing, validation, assignment, or scheduling. This is useful when policies are selected by configuration, tenant, request type, or experiment.',
        'Do not extract every if statement into Strategy. It earns its keep when policies have names, business ownership, tests, and likely future variation. In an interview, explain why the policy changes independently from the workflow around it.'
      ),
      bullets: [
        'Use for algorithms selected at runtime.',
        'Keep strategies stateless unless state is part of the policy.',
        'Test each strategy independently.',
        'Avoid for small local conditionals unlikely to grow.'
      ],
      codeExample: codeExample(
        'Strategy for shipping quotes',
        `
class ShippingStrategy:
    def quote(self, order, customer):
        raise NotImplementedError


class StandardShipping(ShippingStrategy):
    def quote(self, order, customer):
        return 25 if order["weight"] > 20 else 7


class ExpressShipping(ShippingStrategy):
    def quote(self, order, customer):
        return 15 + (10 if order["weight"] > 20 else 0)


class VipShipping(ShippingStrategy):
    def quote(self, order, customer):
        return 0


class ShippingService:
    def __init__(self, strategy):
        self.strategy = strategy

    def quote(self, order, customer):
        return self.strategy.quote(order, customer)


def choose_strategy(order, customer):
    if customer["tier"] == "vip":
        return VipShipping()
    if order["speed"] == "express":
        return ExpressShipping()
    return StandardShipping()


if __name__ == "__main__":
    order = {"weight": 3, "speed": "express"}
    customer = {"tier": "standard"}
    print(ShippingService(choose_strategy(order, customer)).quote(order, customer))
`
      )
    },
    {
      heading: 'Observer: publish facts without hard-wiring reactions',
      body: paragraphs(
        'Observer lets interested objects react when something happens. It fits domain events, UI updates, cache invalidation, notifications, analytics, and indexing. The subject publishes a fact and does not need to know every downstream listener.',
        'The production risk is invisible side effects. Events need precise names, stable payloads, and delivery semantics. Decide whether listeners are synchronous or asynchronous, best-effort or required, and idempotent under retry. Avoid vague events like updated that force every listener to inspect everything.'
      ),
      bullets: [
        'Publish facts that already happened.',
        'Keep payloads stable and small.',
        'Define failure behavior for observers.',
        'Make retryable observers idempotent.'
      ],
      codeExample: codeExample(
        'Observer for reservation events',
        `
class EventBus:
    def __init__(self):
        self.subscribers = {}

    def subscribe(self, event_name, handler):
        self.subscribers.setdefault(event_name, []).append(handler)

    def publish(self, event_name, payload):
        for handler in self.subscribers.get(event_name, []):
            handler(payload)


class EmailNotifier:
    def reservation_created(self, event):
        print(f"email patron {event['patron_id']} reservation {event['reservation_id']}")


class AnalyticsTracker:
    def reservation_created(self, event):
        print(f"analytics item={event['item_id']}")


class ReservationService:
    def __init__(self, bus):
        self.bus = bus
        self.next_id = 1

    def reserve(self, patron_id, item_id):
        reservation_id = f"res-{self.next_id}"
        self.next_id += 1
        self.bus.publish("reservation.created", {
            "reservation_id": reservation_id,
            "patron_id": patron_id,
            "item_id": item_id,
        })
        return reservation_id


if __name__ == "__main__":
    bus = EventBus()
    bus.subscribe("reservation.created", EmailNotifier().reservation_created)
    bus.subscribe("reservation.created", AnalyticsTracker().reservation_created)
    print(ReservationService(bus).reserve("patron-1", "book-9"))
`
      )
    },
    {
      heading: 'State: put lifecycle rules next to legal transitions',
      body: paragraphs(
        'State models an object whose behavior changes as it moves through a lifecycle. A ticket in issued, paid, and closed states should accept different operations. A support case in new, assigned, and resolved states should reject invalid transitions.',
        'State is not just an enum. An enum names the current state; the pattern moves behavior and transition rules into methods or state objects that make illegal transitions hard to express. Use it when lifecycle complexity makes central conditionals brittle.'
      ),
      bullets: [
        'Use when allowed operations depend heavily on lifecycle state.',
        'Make illegal transitions fail loudly.',
        'Keep transition ownership clear.',
        'Avoid when an enum plus two guarded methods is enough.'
      ],
      codeExample: codeExample(
        'State objects for a support ticket',
        `
class TicketState:
    name = "unknown"

    def assign(self, ticket, agent):
        raise ValueError(f"cannot assign while {self.name}")

    def resolve(self, ticket):
        raise ValueError(f"cannot resolve while {self.name}")


class NewState(TicketState):
    name = "new"

    def assign(self, ticket, agent):
        ticket.agent = agent
        ticket.state = AssignedState()


class AssignedState(TicketState):
    name = "assigned"

    def resolve(self, ticket):
        ticket.state = ResolvedState()


class ResolvedState(TicketState):
    name = "resolved"


class SupportTicket:
    def __init__(self, ticket_id):
        self.ticket_id = ticket_id
        self.agent = None
        self.state = NewState()

    def assign(self, agent):
        self.state.assign(self, agent)

    def resolve(self):
        self.state.resolve(self)


if __name__ == "__main__":
    ticket = SupportTicket("t-1")
    ticket.assign("Ava")
    ticket.resolve()
    print(ticket.state.name)
`
      )
    },
    {
      heading: 'Command and Template Method: shape actions and workflow order',
      body: paragraphs(
        'Command packages an action as an object so it can be queued, retried, audited, authorized, scheduled, or undone. Template Method fixes the skeleton of an algorithm in a base class and lets subclasses implement narrow steps.',
        'Commands should be small and explicit, not a way to hide a giant workflow behind execute(). Template Method works when the sequence is stable; if steps need to mix and match independently, Strategy or composition is usually cleaner.'
      ),
      bullets: [
        'Use Command for retryable jobs, audit trails, queues, and undo.',
        'Use Template Method for stable workflow order.',
        'Keep command inputs serializable if they cross process boundaries.',
        'Prefer composition when subclasses would override too much.'
      ],
      codeExample: codeExample(
        'Command queue plus import Template Method',
        `
class Command:
    def execute(self):
        raise NotImplementedError


class SendEmailCommand(Command):
    def __init__(self, to, body):
        self.to = to
        self.body = body

    def execute(self):
        print(f"email to {self.to}: {self.body}")


class CommandQueue:
    def __init__(self):
        self.items = []

    def enqueue(self, command):
        self.items.append(command)

    def drain(self):
        while self.items:
            self.items.pop(0).execute()


class ImportJob:
    def run(self, source):
        rows = self.parse(source)
        valid = [row for row in rows if self.validate(row)]
        self.persist(valid)
        return len(valid)

    def parse(self, source):
        raise NotImplementedError

    def validate(self, row):
        return True

    def persist(self, rows):
        raise NotImplementedError


class CsvUserImport(ImportJob):
    def parse(self, source):
        return [line.split(",") for line in source.splitlines() if line]

    def validate(self, row):
        return len(row) == 2 and "@" in row[1]

    def persist(self, rows):
        print(f"persisted users: {rows}")


if __name__ == "__main__":
    queue = CommandQueue()
    queue.enqueue(SendEmailCommand("a@example.com", "welcome"))
    queue.drain()
    print(CsvUserImport().run("Ava,a@example.com\\nBrokenRow"))
`
      )
    }
  ],
  exercises: [
    codingExercise(
      'pricing-strategy',
      'Extract pricing into Strategy objects',
      'Move hourly and flat-fee pricing behind a common interface so the workflow does not branch on policy type.',
      `
class ParkingFeeCalculator:
    def fee(self, minutes, kind):
        # TODO: replace this conditional with pricing strategy classes.
        if kind == "flat":
            return 12
        hours = (minutes + 59) // 60
        return hours * 4


print(ParkingFeeCalculator().fee(75, "hourly"))
`,
      `
class PricingStrategy:
    def fee(self, minutes):
        raise NotImplementedError


class FlatFeePricing(PricingStrategy):
    def fee(self, minutes):
        return 12


class HourlyPricing(PricingStrategy):
    def fee(self, minutes):
        hours = (minutes + 59) // 60
        return hours * 4


class ParkingFeeCalculator:
    def __init__(self, strategy):
        self.strategy = strategy

    def fee(self, minutes):
        return self.strategy.fee(minutes)


print(ParkingFeeCalculator(HourlyPricing()).fee(75))
`,
      ['Create one common fee(minutes) interface.', 'Keep the workflow free of pricing branches.', 'Add more strategies without editing the calculator.'],
      'The hourly strategy prints 8 for a 75-minute stay.'
    ),
    designExercise(
      'observer-delivery-design',
      'Design reservation event delivery',
      'Describe how a reservation service should notify email, analytics, and indexing listeners.',
      [
        'Which event names and payload fields are stable?',
        'Which observers must be synchronous, if any?',
        'How will retries avoid duplicate side effects?',
        'What logs or metrics prove delivery health?',
        'What happens when one observer fails?'
      ]
    )
  ],
  checklist: [
    'Can identify which behavior changes independently from the surrounding workflow.',
    'Can use Strategy for interchangeable policies without over-extracting small conditionals.',
    'Can design Observer events with clear payloads and delivery expectations.',
    'Can model lifecycle behavior with State and reject illegal transitions.',
    'Can use Command for actions needing queueing, retry, audit, or undo.',
    'Can explain when Template Method is less flexible than composition.'
  ],
  pitfalls: [
    'Replacing every conditional with Strategy even when the branch is local and stable.',
    'Publishing vague Observer events that create hidden side effects.',
    'Using an enum called state while leaving lifecycle rules scattered across services.',
    'Building giant Command objects whose execute method hides a subsystem.',
    'Using Template Method inheritance when independent strategies would compose better.'
  ],
  interviewPrompts: [
    'Compare Strategy and State using a parking ticket or elevator car.',
    'When is Command better than directly calling a service method?',
    'How would you design Observer events without hidden side effects?',
    'What makes Template Method appropriate for an import workflow?'
  ],
  diagram: null,
  related: ['state-machines', 'composition-over-inheritance', 'parking-lot-design', 'elevator-system-design']
};

const parkingLotLesson = {
  slug: 'parking-lot-design-lab',
  title: 'Parking lot design lab',
  summary:
    'Walk through a complete parking lot design from requirements to entities, responsibilities, entry/payment/exit workflows, extensibility points, and production failure modes.',
  duration: '70-90 min',
  whyItMatters:
    'Parking lot is compact but rich. It tests entity modeling, state transitions, policy boundaries, and whether you can add extensibility without burying the simple enter-pay-exit workflow under unnecessary patterns.',
  sections: [
    {
      heading: 'Requirements: prove the core workflow first',
      body: paragraphs(
        'Start with the visible flow: a vehicle enters, receives a ticket, occupies a compatible spot, pays based on duration and policy, and exits after validation. Add constraints such as floors, spot types, gates, out-of-service spots, lost tickets, and concurrent entry.',
        'Good requirements prevent over-modeling. Reservations, monthly passes, EV charging, dynamic pricing, and plate recognition are valuable follow-ups, but the initial system should prove enter, pay, and exit with no double assignment. In current interviews, it is worth calling out that concurrent gate entry and lost-ticket or retry handling are expected follow-up questions, not version-one blockers.'
      ),
      bullets: [
        'Functional requirements: enter, assign spot, issue ticket, calculate fee, pay, release spot.',
        'Core invariant: one occupied spot has at most one active ticket.',
        'Concurrency concern: two gates must not assign the same spot.',
        'Initial non-goals: reservations, subscriptions, valet routing, and OCR.'
      ],
      codeExample: codeExample(
        'Acceptance checks for the first version',
        `
def assert_parking_lot_acceptance(lot):
    ticket = lot.enter(vehicle_id="CAR-1", vehicle_type="car", now=0)
    assert ticket.ticket_id.startswith("T-")
    assert ticket.status == "issued"
    amount = lot.pay(ticket.ticket_id, paid_at=125)
    assert amount > 0
    assert lot.exit(ticket.ticket_id) == "gate opened"


class FakeLotForSketch:
    def enter(self, vehicle_id, vehicle_type, now):
        return type("Ticket", (), {"ticket_id": "T-1", "status": "issued"})()

    def pay(self, ticket_id, paid_at):
        return 12

    def exit(self, ticket_id):
        return "gate opened"


if __name__ == "__main__":
    assert_parking_lot_acceptance(FakeLotForSketch())
    print("acceptance sketch passes")
`
      )
    },
    {
      heading: 'Entities and invariants: Vehicle, Spot, Ticket, Payment',
      body: paragraphs(
        'Entities own facts and local invariants. Vehicle has identity and type. ParkingSpot has type, floor, distance, and occupancy state. ParkingTicket links exactly one vehicle to exactly one spot during a visit. Payment records amount and time for audit.',
        'Keep policy out of entities when it changes independently. A spot can answer whether it fits a vehicle; it should not compute hourly pricing. A ticket can enforce issued to paid to closed; it should not choose a payment provider.'
      ),
      bullets: [
        'Spot state changes only through occupy() and release().',
        'Ticket state moves issued -> paid -> closed.',
        'Vehicle type and spot type define compatibility.',
        'Payment data is separate from ticket lifecycle for audit and refunds.'
      ],
      codeExample: codeExample(
        'Core entities with guarded transitions',
        `
from dataclasses import dataclass
from enum import Enum


class SpotStatus(Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    OUT_OF_SERVICE = "out_of_service"


class TicketStatus(Enum):
    ISSUED = "issued"
    PAID = "paid"
    CLOSED = "closed"


@dataclass(frozen=True)
class Vehicle:
    vehicle_id: str
    vehicle_type: str


class ParkingSpot:
    def __init__(self, spot_id, spot_type, distance_to_gate):
        self.spot_id = spot_id
        self.spot_type = spot_type
        self.distance_to_gate = distance_to_gate
        self.status = SpotStatus.AVAILABLE
        self.vehicle = None

    def can_fit(self, vehicle):
        return self.status == SpotStatus.AVAILABLE and self.spot_type in (vehicle.vehicle_type, "large")

    def occupy(self, vehicle):
        if not self.can_fit(vehicle):
            raise ValueError("spot is not available for this vehicle")
        self.vehicle = vehicle
        self.status = SpotStatus.OCCUPIED

    def release(self):
        if self.status != SpotStatus.OCCUPIED:
            raise ValueError("only occupied spots can be released")
        self.vehicle = None
        self.status = SpotStatus.AVAILABLE


class ParkingTicket:
    def __init__(self, ticket_id, vehicle, spot, issued_at):
        self.ticket_id = ticket_id
        self.vehicle = vehicle
        self.spot = spot
        self.issued_at = issued_at
        self.status = TicketStatus.ISSUED

    def mark_paid(self):
        if self.status != TicketStatus.ISSUED:
            raise ValueError("only issued tickets can be paid")
        self.status = TicketStatus.PAID

    def close(self):
        if self.status != TicketStatus.PAID:
            raise ValueError("pay before exit")
        self.status = TicketStatus.CLOSED
`
      )
    },
    {
      heading: 'Responsibilities: repositories, strategies, and service',
      body: paragraphs(
        'After entities are clear, name the collaborators. SpotRepository owns searching and locking available spots. TicketRepository stores active tickets. SpotAssignmentStrategy chooses among compatible spots. PricingStrategy calculates fees. ParkingLotService orchestrates entry, payment, and exit.',
        'This split keeps the service from becoming a god object. The service owns workflow order, repositories own persistence and concurrency boundaries, strategies own change-prone policies, and entities own invariants. These boundaries map cleanly to tests and transactions.'
      ),
      bullets: [
        'SpotRepository should make find-and-reserve atomic.',
        'Assignment strategy changes without rewriting entry.',
        'Pricing strategy changes without rewriting ticket lifecycle.',
        'ParkingLotService coordinates but does not own every rule.'
      ],
      codeExample: codeExample(
        'Coherent mini parking lot system',
        `
from dataclasses import dataclass


@dataclass(frozen=True)
class Vehicle:
    vehicle_id: str
    vehicle_type: str


class ParkingSpot:
    def __init__(self, spot_id, spot_type, distance_to_gate):
        self.spot_id = spot_id
        self.spot_type = spot_type
        self.distance_to_gate = distance_to_gate
        self.occupied = False
        self.vehicle = None

    def can_fit(self, vehicle):
        return not self.occupied and self.spot_type in (vehicle.vehicle_type, "large")

    def occupy(self, vehicle):
        if not self.can_fit(vehicle):
            raise ValueError("cannot occupy spot")
        self.vehicle = vehicle
        self.occupied = True

    def release(self):
        self.vehicle = None
        self.occupied = False


class Ticket:
    def __init__(self, ticket_id, vehicle, spot, issued_at):
        self.ticket_id = ticket_id
        self.vehicle = vehicle
        self.spot = spot
        self.issued_at = issued_at
        self.status = "issued"
        self.amount_paid = 0

    def mark_paid(self, amount):
        if self.status != "issued":
            raise ValueError("ticket is not payable")
        self.status = "paid"
        self.amount_paid = amount


class NearestSpotStrategy:
    def choose(self, spots, vehicle):
        if not spots:
            raise ValueError("lot full")
        return min(spots, key=lambda spot: spot.distance_to_gate)


class HourlyPricing:
    def __init__(self, hourly_rate):
        self.hourly_rate = hourly_rate

    def price(self, ticket, exit_time):
        minutes = max(1, exit_time - ticket.issued_at)
        return ((minutes + 59) // 60) * self.hourly_rate


class ParkingLotService:
    def __init__(self, spots, assignment, pricing):
        self.spots = spots
        self.assignment = assignment
        self.pricing = pricing
        self.tickets = {}

    def enter(self, vehicle_id, vehicle_type, now):
        vehicle = Vehicle(vehicle_id, vehicle_type)
        spot = self.assignment.choose([s for s in self.spots if s.can_fit(vehicle)], vehicle)
        spot.occupy(vehicle)
        ticket = Ticket(f"T-{len(self.tickets) + 1}", vehicle, spot, now)
        self.tickets[ticket.ticket_id] = ticket
        return ticket

    def pay(self, ticket_id, paid_at):
        ticket = self.tickets[ticket_id]
        amount = self.pricing.price(ticket, paid_at)
        ticket.mark_paid(amount)
        return amount

    def exit(self, ticket_id):
        ticket = self.tickets[ticket_id]
        if ticket.status != "paid":
            raise ValueError("pay before exit")
        ticket.status = "closed"
        ticket.spot.release()
        return "gate opened"


if __name__ == "__main__":
    lot = ParkingLotService([ParkingSpot("A1", "car", 10)], NearestSpotStrategy(), HourlyPricing(4))
    ticket = lot.enter("CAR-9", "car", 0)
    print(ticket.ticket_id, lot.pay(ticket.ticket_id, 75), lot.exit(ticket.ticket_id))
`
      )
    },
    {
      heading: 'Key methods and production failure handling',
      body: paragraphs(
        'enter() finds a compatible spot, occupies it, creates a ticket, and stores it. pay() calculates the fee, records payment, and marks the ticket paid. exit() validates payment, closes the ticket, and releases the spot. Each method should be short enough to explain aloud.',
        'Production failure handling matters. If payment succeeds but mark_paid fails, reconciliation needs the payment id. If ticket printing fails after a spot is occupied, the hold should expire or roll back. If the gate fails after ticket closure, operations need a manual override with an audit trail.'
      ),
      bullets: [
        'Make retryable transitions guarded or idempotent.',
        'Record payment ids separately from ticket status.',
        'Treat hardware failure as workflow failure.',
        'Expose admin operations carefully for lost tickets and manual releases.'
      ]
    },
    {
      heading: 'Concurrency and extensibility points',
      body: paragraphs(
        'The main race is double assignment. Two gates can observe the same available spot unless selection and occupation happen atomically. In a database-backed system this may be a transaction with row-level locking. In an in-memory sketch, name a lock around selection and reservation.',
        'Extensions attach to stable responsibilities: pricing strategy for events or lost tickets, assignment strategy for nearest or EV spots, spot capability for charging and accessibility, reservation holds before ticket issuance, and observer events for notifications.'
      ),
      bullets: [
        'Lock or transactionally reserve a spot during assignment.',
        'Add reservations as a separate hold lifecycle.',
        'Add EV and accessible spots as capabilities or spot types.',
        'Avoid rewriting ticket lifecycle for every extension.'
      ],
      codeExample: codeExample(
        'Thread-safe spot reservation boundary',
        `
from threading import Lock, Thread


class Spot:
    def __init__(self, spot_id):
        self.spot_id = spot_id
        self.occupied = False


class ThreadSafeSpotRepository:
    def __init__(self, spots):
        self.spots = spots
        self.lock = Lock()

    def reserve_first_available(self):
        with self.lock:
            for spot in self.spots:
                if not spot.occupied:
                    spot.occupied = True
                    return spot
            raise ValueError("lot full")


def gate(repo, name):
    try:
        print(f"{name} got {repo.reserve_first_available().spot_id}")
    except ValueError as exc:
        print(f"{name}: {exc}")


if __name__ == "__main__":
    repo = ThreadSafeSpotRepository([Spot("A1")])
    threads = [Thread(target=gate, args=(repo, "gate-1")), Thread(target=gate, args=(repo, "gate-2"))]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()
`
      )
    }
  ],
  exercises: [
    codingExercise(
      'parking-mini-system',
      'Complete enter/pay/exit',
      'Fill in the service methods so a vehicle receives a ticket, pays an hourly fee, exits, and releases the spot.',
      `
class Spot:
    def __init__(self, spot_id):
        self.spot_id = spot_id
        self.occupied = False


class Ticket:
    def __init__(self, ticket_id, spot, issued_at):
        self.ticket_id = ticket_id
        self.spot = spot
        self.issued_at = issued_at
        self.status = "issued"


class ParkingLot:
    def __init__(self):
        self.spots = [Spot("A1")]
        self.tickets = {}

    def enter(self, now):
        # TODO: find an open spot, occupy it, create and store a Ticket.
        raise NotImplementedError

    def pay(self, ticket_id, paid_at):
        # TODO: charge 4 per started hour and mark ticket paid.
        raise NotImplementedError

    def exit(self, ticket_id):
        # TODO: require paid status, close ticket, release spot.
        raise NotImplementedError


lot = ParkingLot()
ticket = lot.enter(0)
print(ticket.ticket_id, lot.pay(ticket.ticket_id, 61), lot.exit(ticket.ticket_id))
`,
      `
class Spot:
    def __init__(self, spot_id):
        self.spot_id = spot_id
        self.occupied = False


class Ticket:
    def __init__(self, ticket_id, spot, issued_at):
        self.ticket_id = ticket_id
        self.spot = spot
        self.issued_at = issued_at
        self.status = "issued"


class ParkingLot:
    def __init__(self):
        self.spots = [Spot("A1")]
        self.tickets = {}

    def enter(self, now):
        for spot in self.spots:
            if not spot.occupied:
                spot.occupied = True
                ticket = Ticket(f"T-{len(self.tickets) + 1}", spot, now)
                self.tickets[ticket.ticket_id] = ticket
                return ticket
        raise ValueError("lot full")

    def pay(self, ticket_id, paid_at):
        ticket = self.tickets[ticket_id]
        minutes = max(1, paid_at - ticket.issued_at)
        amount = ((minutes + 59) // 60) * 4
        ticket.status = "paid"
        return amount

    def exit(self, ticket_id):
        ticket = self.tickets[ticket_id]
        if ticket.status != "paid":
            raise ValueError("pay before exit")
        ticket.status = "closed"
        ticket.spot.occupied = False
        return "gate opened"


lot = ParkingLot()
ticket = lot.enter(0)
print(ticket.ticket_id, lot.pay(ticket.ticket_id, 61), lot.exit(ticket.ticket_id))
`,
      ['Protect each transition.', 'Release the same spot referenced by the ticket.', 'Use started-hour rounding for fees.'],
      'The script prints a ticket id, an 8 unit fee for 61 minutes, and gate opened.'
    ),
    designExercise(
      'parking-extension-plan',
      'Add reservations without breaking entry',
      'Design a reservation hold lifecycle that works with the existing ticket lifecycle.',
      [
        'What new entity represents a reservation or hold?',
        'When does a hold expire?',
        'How does enter() convert a reservation into a ticket?',
        'How do you prevent reserved spots from being assigned to drive-up traffic?',
        'Which existing classes remain unchanged?'
      ]
    )
  ],
  checklist: [
    'Can list requirements and non-goals before designing classes.',
    'Can model Vehicle, ParkingSpot, ParkingTicket, Payment, repositories, and policies.',
    'Can walk through enter, pay, and exit methods end to end.',
    'Can explain how assignment avoids double booking under concurrent gates.',
    'Can use strategies for pricing and assignment without bloating the service.',
    'Can describe reservations, EV charging, subscriptions, and lost tickets as extensions.'
  ],
  pitfalls: [
    'Designing optional parking features before the basic lifecycle works.',
    'Putting pricing, assignment, payment, and ticket transitions into one giant service.',
    'Ignoring concurrent entry and allowing two active tickets for one spot.',
    'Letting spot objects calculate fees or payment objects release spots.',
    'Adding pattern names without tying them to requirement changes.'
  ],
  interviewPrompts: [
    'Walk through the parking lot design from vehicle entry through exit.',
    'How do you prevent two gates from assigning the same spot?',
    'Where would you add reservations or monthly passes?',
    'Why are pricing and spot assignment good Strategy examples?'
  ],
  diagram: null,
  related: ['behavioral-patterns-in-practice', 'creational-patterns-in-practice', 'state-machines', 'solid-principles']
};

const elevatorLesson = {
  slug: 'elevator-system-design-lab',
  title: 'Elevator system design lab',
  summary:
    'Design elevator cars, hall calls, car-panel requests, dispatching, movement state, door state, scheduling policies, and operational edge cases for a multi-elevator building.',
  duration: '70-90 min',
  whyItMatters:
    'Elevator design forces you to separate local object state from fleet-level coordination. It is a strong prompt for state machines, scheduling strategies, command queues, and clear boundaries between hardware-like objects and controllers.',
  sections: [
    {
      heading: 'Requirements: separate passenger actions from system decisions',
      body: paragraphs(
        'Passengers make hall calls from a floor and choose destinations inside a car. The system assigns cars, moves them, opens doors at stops, and handles maintenance or emergency modes. The core version should support multiple cars, multiple floors, up/down hall requests, and car-panel destination requests.',
        'Do not begin with perfect real-world scheduling. First prove a car can accept stops, move one tick at a time, stop at requested floors, and that a dispatcher can assign a hall call to a reasonable car. Then discuss zoning, destination control, capacity, and peak traffic. In current rounds, it is also useful to mention follow-ups such as concurrent button presses, overloaded cars, and scheduler extensions without front-loading them into version one.'
      ),
      bullets: [
        'Functional requirements: hall call, car request, dispatch, move, open/close doors, maintenance mode.',
        'Core entities: ElevatorCar, HallCall, CarRequest, Controller, DispatchStrategy, Direction.',
        'Key constraint: unavailable or overloaded cars should not be assigned.',
        'Initial non-goals: predictive traffic, physical motor control, and perfect scheduling.'
      ],
      codeExample: codeExample(
        'Request objects for hall calls and car-panel stops',
        `
from dataclasses import dataclass
from enum import Enum


class Direction(Enum):
    UP = "up"
    DOWN = "down"
    IDLE = "idle"


@dataclass(frozen=True)
class HallCall:
    floor: int
    direction: Direction


@dataclass(frozen=True)
class CarRequest:
    car_id: str
    destination_floor: int


if __name__ == "__main__":
    print(HallCall(3, Direction.UP))
    print(CarRequest("car-a", 9))
`
      )
    },
    {
      heading: 'Entities and state: cars own movement and doors',
      body: paragraphs(
        'An ElevatorCar owns current floor, direction, stops, door state, capacity, and service mode. Door behavior matters because a car should not move with doors open. Service mode matters because a dispatcher should not assign maintenance cars.',
        'The car should not know the whole building. It can answer whether it can accept a stop, add stops, move one tick, and open doors when it reaches a requested floor. Fleet-level decisions belong to the controller and dispatch strategy.'
      ),
      bullets: [
        'Car-local state includes current_floor, direction, stops, door_open, and in_service.',
        'Movement should be deterministic enough to test one tick at a time.',
        'Door state prevents impossible transitions.',
        'Service mode removes cars from dispatch candidates.'
      ],
      codeExample: codeExample(
        'ElevatorCar with guarded movement state',
        `
from enum import Enum


class Direction(Enum):
    UP = 1
    DOWN = -1
    IDLE = 0


class ElevatorCar:
    def __init__(self, car_id, current_floor=0):
        self.car_id = car_id
        self.current_floor = current_floor
        self.direction = Direction.IDLE
        self.stops = set()
        self.door_open = False
        self.in_service = True

    def add_stop(self, floor):
        if not self.in_service or self.door_open:
            raise ValueError("car cannot accept stops now")
        self.stops.add(floor)
        if self.direction == Direction.IDLE and floor != self.current_floor:
            self.direction = Direction.UP if floor > self.current_floor else Direction.DOWN

    def step(self):
        if self.door_open:
            raise ValueError("cannot move with doors open")
        if not self.stops:
            self.direction = Direction.IDLE
            return
        self.current_floor += self.direction.value
        if self.current_floor in self.stops:
            self.stops.remove(self.current_floor)
            self.door_open = True


if __name__ == "__main__":
    car = ElevatorCar("A", 0)
    car.add_stop(2)
    car.step(); car.step()
    print(car.current_floor, car.door_open)
`
      )
    },
    {
      heading: 'Responsibilities: dispatcher chooses, car executes',
      body: paragraphs(
        'The dispatcher compares cars and chooses one for a hall call. The car executes local movement. This is the central separation in elevator design: local state and safety belong to ElevatorCar; fleet coordination belongs to ElevatorController and DispatchStrategy.',
        'A common mistake is putting every rule into ElevatorCar until each car inspects every other car. Another is putting movement details into Dispatcher until it becomes a simulator. Keep knowledge directional: controller sees the fleet; each car sees itself.'
      ),
      bullets: [
        'Controller receives requests and delegates assignment.',
        'DispatchStrategy scores cars using distance, direction, service mode, and load.',
        'ElevatorCar accepts stops and advances movement.',
        'Door state protects movement transitions.'
      ],
      codeExample: codeExample(
        'Dispatcher with replaceable scheduling strategy',
        `
from dataclasses import dataclass
from enum import Enum


class Direction(Enum):
    UP = 1
    DOWN = -1
    IDLE = 0


@dataclass(frozen=True)
class HallCall:
    floor: int
    direction: Direction


class ElevatorCar:
    def __init__(self, car_id, current_floor, direction=Direction.IDLE):
        self.car_id = car_id
        self.current_floor = current_floor
        self.direction = direction
        self.stops = set()
        self.in_service = True

    def add_stop(self, floor):
        self.stops.add(floor)
        if self.direction == Direction.IDLE and floor != self.current_floor:
            self.direction = Direction.UP if floor > self.current_floor else Direction.DOWN


class NearestCompatibleCar:
    def choose_car(self, cars, request):
        candidates = [
            car for car in cars
            if car.in_service and car.direction in (Direction.IDLE, request.direction)
        ]
        if not candidates:
            candidates = [car for car in cars if car.in_service]
        return min(candidates, key=lambda car: abs(car.current_floor - request.floor))


class ElevatorController:
    def __init__(self, cars, strategy):
        self.cars = cars
        self.strategy = strategy

    def handle_hall_call(self, request):
        car = self.strategy.choose_car(self.cars, request)
        car.add_stop(request.floor)
        return car.car_id


if __name__ == "__main__":
    cars = [ElevatorCar("A", 0), ElevatorCar("B", 7, Direction.DOWN)]
    print(ElevatorController(cars, NearestCompatibleCar()).handle_hall_call(HallCall(3, Direction.UP)))
`
      )
    },
    {
      heading: 'Key methods: hall calls, car requests, and ticks',
      body: paragraphs(
        'A clean mini-system has a small method set. handle_hall_call() assigns a pickup floor. handle_car_request() adds a destination to the chosen car. tick() advances every car by one movement step. These methods make the design executable and testable.',
        'For a first pass, a set of stops and a simple directional rule are enough. More advanced scheduling can use SCAN-like behavior, destination grouping, or zones. A better strategy should replace scheduling without rewriting door safety or request objects.'
      ),
      bullets: [
        'Use tick-based movement for simple simulations.',
        'Keep pickup and destination requests separate.',
        'Make service checks part of assignment.',
        'Let strategies evolve independently of car movement.'
      ]
    },
    {
      heading: 'Full mini-system and extensions',
      body: paragraphs(
        'A coherent answer can be demonstrated with a small simulation. The controller receives hall calls, assigns cars, accepts car-panel requests, and advances the fleet. Cars maintain their own stops and door state. A strategy chooses a car but does not move it.',
        'Extensions attach cleanly: capacity changes candidate filtering, maintenance changes availability, zoning and destination control replace dispatch strategy, and emergency mode becomes a controller command plus car-level transition rules.'
      ),
      bullets: [
        'Controller owns fleet request intake.',
        'Car owns movement and door transitions.',
        'Strategy owns assignment choices.',
        'Simulation ticks make behavior visible.'
      ],
      codeExample: codeExample(
        'Runnable mini elevator controller',
        `
from enum import Enum


class Direction(Enum):
    UP = 1
    DOWN = -1
    IDLE = 0


class ElevatorCar:
    def __init__(self, car_id, current_floor=0):
        self.car_id = car_id
        self.current_floor = current_floor
        self.direction = Direction.IDLE
        self.stops = set()
        self.door_open = False
        self.in_service = True

    def add_stop(self, floor):
        self.stops.add(floor)
        if self.direction == Direction.IDLE and floor != self.current_floor:
            self.direction = Direction.UP if floor > self.current_floor else Direction.DOWN

    def tick(self):
        if self.door_open:
            self.door_open = False
            return f"{self.car_id} closed doors at {self.current_floor}"
        if not self.stops:
            self.direction = Direction.IDLE
            return f"{self.car_id} idle at {self.current_floor}"
        target = min(self.stops) if self.direction == Direction.UP else max(self.stops)
        if target > self.current_floor:
            self.direction = Direction.UP
        elif target < self.current_floor:
            self.direction = Direction.DOWN
        self.current_floor += self.direction.value
        if self.current_floor in self.stops:
            self.stops.remove(self.current_floor)
            self.door_open = True
        return f"{self.car_id} at {self.current_floor}"


class NearestCarStrategy:
    def choose_car(self, cars, floor):
        return min([car for car in cars if car.in_service], key=lambda car: abs(car.current_floor - floor))


class ElevatorController:
    def __init__(self, cars, strategy):
        self.cars = {car.car_id: car for car in cars}
        self.strategy = strategy

    def hall_call(self, floor, direction):
        car = self.strategy.choose_car(list(self.cars.values()), floor)
        car.add_stop(floor)
        return car.car_id

    def car_request(self, car_id, destination):
        self.cars[car_id].add_stop(destination)

    def tick(self):
        return [car.tick() for car in self.cars.values()]


if __name__ == "__main__":
    controller = ElevatorController([ElevatorCar("A", 0), ElevatorCar("B", 5)], NearestCarStrategy())
    chosen = controller.hall_call(3, Direction.UP)
    controller.car_request(chosen, 7)
    for _ in range(6):
        print(controller.tick())
`
      )
    }
  ],
  exercises: [
    codingExercise(
      'elevator-tick',
      'Implement one elevator movement tick',
      'Complete tick() so the car moves toward stops, opens doors at requested floors, and becomes idle when no stops remain.',
      `
class ElevatorCar:
    def __init__(self, current_floor=0):
        self.current_floor = current_floor
        self.stops = set()
        self.direction = "idle"
        self.door_open = False

    def add_stop(self, floor):
        self.stops.add(floor)
        if self.direction == "idle":
            self.direction = "up" if floor > self.current_floor else "down"

    def tick(self):
        # TODO: close doors if open; idle if no stops; move one floor; open at stops.
        raise NotImplementedError


car = ElevatorCar(0)
car.add_stop(2)
for _ in range(4):
    print(car.tick(), car.current_floor, car.direction, car.door_open)
`,
      `
class ElevatorCar:
    def __init__(self, current_floor=0):
        self.current_floor = current_floor
        self.stops = set()
        self.direction = "idle"
        self.door_open = False

    def add_stop(self, floor):
        self.stops.add(floor)
        if self.direction == "idle" and floor != self.current_floor:
            self.direction = "up" if floor > self.current_floor else "down"

    def tick(self):
        if self.door_open:
            self.door_open = False
            return "closed doors"
        if not self.stops:
            self.direction = "idle"
            return "idle"
        self.current_floor += 1 if self.direction == "up" else -1
        if self.current_floor in self.stops:
            self.stops.remove(self.current_floor)
            self.door_open = True
            return "opened doors"
        return "moved"


car = ElevatorCar(0)
car.add_stop(2)
for _ in range(4):
    print(car.tick(), car.current_floor, car.direction, car.door_open)
`,
      ['Handle door closing before movement.', 'When stops is empty, set direction to idle.', 'Remove the stop when reached and open doors.'],
      'The car moves to floor 2, opens doors, closes them, then idles.'
    ),
    designExercise(
      'destination-control-design',
      'Add destination-control scheduling',
      'Describe how the model changes when passengers select destination floors before entering an elevator.',
      [
        'How does the request object change?',
        'Does a hall call still have only direction?',
        'Which strategy groups passengers by destination?',
        'How are assignments displayed to passengers?',
        'Which ElevatorCar methods remain unchanged?'
      ],
      'advanced'
    )
  ],
  checklist: [
    'Can distinguish hall calls from car-panel destination requests.',
    'Can model ElevatorCar state, door state, direction, stops, and service mode.',
    'Can separate dispatcher scheduling from car movement execution.',
    'Can implement or explain handle_hall_call, handle_car_request, and tick methods.',
    'Can compare nearest-car, same-direction, zone, and destination-control strategies.',
    'Can discuss capacity, maintenance, emergency, fairness, and starvation concerns.'
  ],
  pitfalls: [
    'Putting fleet dispatch policy inside each ElevatorCar.',
    'Letting the dispatcher simulate every movement and door transition.',
    'Ignoring door state, maintenance state, or capacity until late follow-ups.',
    'Using nearest-car scheduling without explaining direction trade-offs.',
    'Treating pickup and destination requests as the same object.'
  ],
  interviewPrompts: [
    'Walk through how a hall call becomes an assigned car and destination stop.',
    'How would you improve nearest-car scheduling during morning rush?',
    'Where do maintenance mode and emergency mode belong?',
    'How does the design prevent moving with doors open?'
  ],
  diagram: null,
  related: ['state-machines', 'behavioral-patterns-in-practice', 'composition-over-inheritance', 'concurrency-in-lld']
};

const bookingLesson = {
  slug: 'library-or-booking-system-lab',
  title: 'Library or booking system lab',
  summary:
    'Design a library or booking-style inventory system with catalog items, reservable units, holds, loans, policies, concurrency control, and extensibility for fees and notifications.',
  duration: '70-90 min',
  whyItMatters:
    'Library and booking systems teach the same core lesson: searchable catalog data is not finite inventory. The system must protect scarce units over time while policies for holds, loans, cancellations, renewals, and fees keep changing.',
  sections: [
    {
      heading: 'Requirements: finite inventory over time',
      body: paragraphs(
        'The core workflow is search, reserve or hold, checkout or confirm booking, return or complete, and apply policies such as due dates, expiration, cancellation, and overdue fees. For a library, a title is searchable metadata while each physical copy has availability.',
        'A good first version supports catalog search, available copy lookup, hold creation with expiration, checkout, return, and overdue fee calculation. It should explicitly prevent promising the same copy, room, court, or device to two users.'
      ),
      bullets: [
        'Functional requirements: search, hold inventory, checkout/book, return/cancel, calculate policy outcomes.',
        'Core invariant: one active hold or loan per concrete inventory unit.',
        'Concurrency concern: availability check and hold creation must be atomic.',
        'Initial non-goals: recommendations, complex search ranking, and accounting integrations.'
      ],
      codeExample: codeExample(
        'Acceptance checks for finite inventory',
        `
def assert_booking_acceptance(service):
    reservation = service.reserve(patron_id="p1", isbn="isbn-1", now=0)
    assert reservation.copy_barcode == "copy-1"
    loan = service.checkout(reservation.reservation_id, now=5)
    assert loan.copy_barcode == reservation.copy_barcode
    assert service.return_copy(loan.loan_id, now=20) == "returned"


class FakeServiceForSketch:
    def reserve(self, patron_id, isbn, now):
        return type("Reservation", (), {"reservation_id": "r1", "copy_barcode": "copy-1"})()

    def checkout(self, reservation_id, now):
        return type("Loan", (), {"loan_id": "l1", "copy_barcode": "copy-1"})()

    def return_copy(self, loan_id, now):
        return "returned"


if __name__ == "__main__":
    assert_booking_acceptance(FakeServiceForSketch())
    print("inventory workflow sketch passes")
`
      )
    },
    {
      heading: 'Entities: catalog records are not inventory units',
      body: paragraphs(
        'Catalog records describe what something is: title, author, ISBN, room type, equipment model, or amenities. Inventory units describe what can be reserved: a physical book copy, a room-night allocation, a camera body, or a tennis court slot.',
        'Mixing these concepts is the most common failure in this prompt. Reservations and loans should reference concrete inventory or a clearly defined allocation. If a title has five copies, the system must know which copy is held or checked out.'
      ),
      bullets: [
        'BookTitle or Listing is searchable metadata.',
        'BookCopy or ReservableUnit is scarce inventory.',
        'Reservation/Hold protects inventory temporarily.',
        'Loan/Booking represents committed use over time.'
      ],
      codeExample: codeExample(
        'Catalog and copy entities with statuses',
        `
from dataclasses import dataclass
from enum import Enum


class CopyStatus(Enum):
    AVAILABLE = "available"
    HELD = "held"
    CHECKED_OUT = "checked_out"
    LOST = "lost"


@dataclass(frozen=True)
class BookTitle:
    isbn: str
    title: str
    authors: tuple


class BookCopy:
    def __init__(self, barcode, title):
        self.barcode = barcode
        self.title = title
        self.status = CopyStatus.AVAILABLE

    def hold(self):
        if self.status != CopyStatus.AVAILABLE:
            raise ValueError("copy is not available")
        self.status = CopyStatus.HELD

    def checkout(self):
        if self.status != CopyStatus.HELD:
            raise ValueError("copy must be held before checkout")
        self.status = CopyStatus.CHECKED_OUT

    def mark_returned(self):
        if self.status != CopyStatus.CHECKED_OUT:
            raise ValueError("only checked-out copies can be returned")
        self.status = CopyStatus.AVAILABLE


if __name__ == "__main__":
    title = BookTitle("isbn-1", "Design Patterns", ("Gamma", "Helm", "Johnson", "Vlissides"))
    copy = BookCopy("copy-1", title)
    copy.hold(); copy.checkout(); copy.mark_returned()
    print(copy.status.value)
`
      )
    },
    {
      heading: 'Responsibilities: inventory, reservations, loans, and policies',
      body: paragraphs(
        'InventoryRepository owns the atomic operation of finding and locking available inventory. ReservationService creates holds and handles expiration. LoanService converts holds into loans, processes returns, and asks policies for due dates and fees.',
        'This division adapts to public libraries, university libraries, equipment booking, hotel rooms, or coworking spaces. The workflow stays recognizable while policies and allocation rules vary. The repository boundary gives a clean answer to concurrency.'
      ),
      bullets: [
        'InventoryRepository protects scarce units with locks or transactions.',
        'ReservationService creates and expires temporary holds.',
        'LoanService or BookingService confirms use and handles returns.',
        'Policy objects calculate due dates, fees, renewal eligibility, and priority.'
      ],
      codeExample: codeExample(
        'Coherent mini library reservation system',
        `
from dataclasses import dataclass


@dataclass(frozen=True)
class BookTitle:
    isbn: str
    title: str


class BookCopy:
    def __init__(self, barcode, title):
        self.barcode = barcode
        self.title = title
        self.status = "available"

    def hold(self):
        if self.status != "available":
            raise ValueError("not available")
        self.status = "held"

    def checkout(self):
        if self.status != "held":
            raise ValueError("copy must be held")
        self.status = "checked_out"

    def return_copy(self):
        if self.status != "checked_out":
            raise ValueError("copy is not checked out")
        self.status = "available"


@dataclass
class Reservation:
    reservation_id: str
    patron_id: str
    copy_barcode: str
    expires_at: int
    active: bool = True


@dataclass
class Loan:
    loan_id: str
    patron_id: str
    copy_barcode: str
    checked_out_at: int
    due_at: int


class InventoryRepository:
    def __init__(self, copies):
        self.copies = {copy.barcode: copy for copy in copies}

    def hold_available_copy(self, isbn):
        for copy in self.copies.values():
            if copy.title.isbn == isbn and copy.status == "available":
                copy.hold()
                return copy
        raise ValueError("no copies available")

    def get_copy(self, barcode):
        return self.copies[barcode]


class FixedLoanPolicy:
    def __init__(self, loan_days):
        self.loan_days = loan_days

    def due_at(self, checkout_day):
        return checkout_day + self.loan_days

    def overdue_fee(self, loan, as_of):
        return max(0, as_of - loan.due_at)


class LibraryService:
    def __init__(self, inventory, policy):
        self.inventory = inventory
        self.policy = policy
        self.reservations = {}
        self.loans = {}

    def reserve(self, patron_id, isbn, now):
        copy = self.inventory.hold_available_copy(isbn)
        reservation = Reservation(f"R-{len(self.reservations) + 1}", patron_id, copy.barcode, now + 1)
        self.reservations[reservation.reservation_id] = reservation
        return reservation

    def checkout(self, reservation_id, now):
        reservation = self.reservations[reservation_id]
        if not reservation.active or reservation.expires_at < now:
            raise ValueError("reservation expired")
        copy = self.inventory.get_copy(reservation.copy_barcode)
        copy.checkout()
        reservation.active = False
        loan = Loan(f"L-{len(self.loans) + 1}", reservation.patron_id, copy.barcode, now, self.policy.due_at(now))
        self.loans[loan.loan_id] = loan
        return loan

    def return_copy(self, loan_id, now):
        loan = self.loans[loan_id]
        copy = self.inventory.get_copy(loan.copy_barcode)
        fee = self.policy.overdue_fee(loan, now)
        copy.return_copy()
        return fee


if __name__ == "__main__":
    title = BookTitle("isbn-1", "Design Patterns")
    service = LibraryService(InventoryRepository([BookCopy("copy-1", title)]), FixedLoanPolicy(14))
    reservation = service.reserve("patron-1", "isbn-1", now=0)
    loan = service.checkout(reservation.reservation_id, now=1)
    print(loan.loan_id, service.return_copy(loan.loan_id, now=20))
`
      )
    },
    {
      heading: 'Key methods: reserve, checkout, renew, return, cancel',
      body: paragraphs(
        'reserve() must atomically select available inventory and create a hold. checkout() verifies the hold is active, changes inventory state, and creates a loan or booking. renew() asks a policy whether renewal is allowed. return() frees inventory and calculates fees. cancel() releases a hold or booking according to policy.',
        'Write methods around state transitions rather than raw field assignment. A copy moves available -> held -> checked_out -> available. A booking might move held -> confirmed -> cancelled or completed. The exact statuses differ, but the principle is the same.'
      ),
      bullets: [
        'reserve() owns the availability race.',
        'checkout() or confirm() converts a hold into committed usage.',
        'return() or complete() releases inventory and records outcomes.',
        'renew() and cancel() should call policy objects.'
      ]
    },
    {
      heading: 'Concurrency, idempotency, and expiration',
      body: paragraphs(
        'The main production bug is double booking. Two users search, both see one available copy, and both click reserve. The fix is not a better UI; it is an atomic repository operation or transaction that locks candidate inventory while creating the hold.',
        'Retries create a second problem. If a client times out after creating a reservation, retrying should return the existing reservation instead of creating another. Idempotency keys solve this, and expiration jobs release abandoned holds so inventory does not stay stuck.'
      ),
      bullets: [
        'Combine availability check and hold creation in one transaction.',
        'Use idempotency keys for reservation-like operations.',
        'Expire abandoned holds through scheduled or lazy cleanup.',
        'Use uniqueness constraints for active allocations where possible.'
      ],
      codeExample: codeExample(
        'Idempotent reservation around atomic hold',
        `
class InMemoryInventory:
    def __init__(self, copies_by_isbn):
        self.copies_by_isbn = {isbn: list(copies) for isbn, copies in copies_by_isbn.items()}
        self.held = set()
        self.by_key = {}

    def reserve_once(self, patron_id, isbn, idempotency_key):
        if idempotency_key in self.by_key:
            return self.by_key[idempotency_key]
        for copy in self.copies_by_isbn.get(isbn, []):
            if copy not in self.held:
                self.held.add(copy)
                reservation = {
                    "reservation_id": f"R-{len(self.by_key) + 1}",
                    "patron_id": patron_id,
                    "copy": copy,
                }
                self.by_key[idempotency_key] = reservation
                return reservation
        raise ValueError("no inventory")


if __name__ == "__main__":
    inventory = InMemoryInventory({"isbn-1": ["copy-1"]})
    first = inventory.reserve_once("p1", "isbn-1", "request-123")
    retry = inventory.reserve_once("p1", "isbn-1", "request-123")
    print(first == retry, first)
`
      )
    }
  ],
  exercises: [
    codingExercise(
      'copy-hold-checkout-return',
      'Implement copy lifecycle transitions',
      'Complete the methods so a copy can only move through available -> held -> checked_out -> available.',
      `
class BookCopy:
    def __init__(self, barcode):
        self.barcode = barcode
        self.status = "available"

    def hold(self):
        # TODO: require available, then mark held.
        pass

    def checkout(self):
        # TODO: require held, then mark checked_out.
        pass

    def return_copy(self):
        # TODO: require checked_out, then mark available.
        pass


copy = BookCopy("copy-1")
copy.hold(); copy.checkout(); copy.return_copy()
print(copy.status)
`,
      `
class BookCopy:
    def __init__(self, barcode):
        self.barcode = barcode
        self.status = "available"

    def hold(self):
        if self.status != "available":
            raise ValueError("only available copies can be held")
        self.status = "held"

    def checkout(self):
        if self.status != "held":
            raise ValueError("copy must be held before checkout")
        self.status = "checked_out"

    def return_copy(self):
        if self.status != "checked_out":
            raise ValueError("only checked-out copies can be returned")
        self.status = "available"


copy = BookCopy("copy-1")
copy.hold(); copy.checkout(); copy.return_copy()
print(copy.status)
`,
      ['Guard every transition by current status.', 'Keep status mutation inside BookCopy.', 'Return should make the copy available again.'],
      'The script prints available after the full lifecycle.',
      'beginner'
    ),
    designExercise(
      'booking-date-range-extension',
      'Extend the design to hotel room booking',
      'Adapt the library inventory model to reserve room inventory across a date range.',
      [
        'What replaces BookCopy as the reservable unit?',
        'How do you represent date ranges and prevent overlap?',
        'Does checkout become confirm booking or check-in?',
        'Which policies change for cancellation and payment?',
        'What uniqueness constraint prevents double booking?'
      ],
      'advanced'
    )
  ],
  checklist: [
    'Can explain why catalog metadata and reservable inventory must be separate.',
    'Can model BookTitle, BookCopy, Reservation/Hold, Loan/Booking, InventoryRepository, and policies.',
    'Can walk through reserve, checkout/confirm, renew, return/cancel, and fee calculation.',
    'Can describe how atomic reservation prevents duplicate holds under concurrency.',
    'Can use idempotency keys and expiration for retries and abandoned holds.',
    'Can extend the design to waitlists, room booking, equipment rental, or notifications.'
  ],
  pitfalls: [
    'Treating a title, room type, or listing as the concrete inventory unit.',
    'Checking availability and creating a hold in separate non-atomic steps.',
    'Hard-coding overdue, renewal, and cancellation rules inside entity classes.',
    'Forgetting hold expiration and leaving inventory unavailable.',
    'Ignoring idempotency when clients retry reservation requests.'
  ],
  interviewPrompts: [
    'Why should catalog and inventory be separate in a library or booking system?',
    'How do you prevent two patrons from reserving the same copy?',
    'Where would you place overdue, renewal, and cancellation rules?',
    'How would the model change for hotel room booking by date range?'
  ],
  diagram: null,
  related: ['concurrency-in-lld', 'behavioral-patterns-in-practice', 'state-machines', 'library-management-system']
};

export const rawLldLearningModules = [
  {
    slug: 'lld-design-patterns-lab',
    title: 'Design patterns lab',
    summary:
      'Study common design patterns as practical tools for object design, with attention to when each pattern clarifies a model and when it adds needless machinery.',
    objectives: [
      'Use creational patterns to separate object construction from business behavior',
      'Use structural patterns to adapt, wrap, simplify, or compose object relationships',
      'Use behavioral patterns to move changing decisions and workflows behind clear interfaces'
    ],
    lessons: [creationalLesson, structuralLesson, behavioralLesson]
  },
  {
    slug: 'lld-project-labs',
    title: 'Object design project labs',
    summary:
      'Practice complete object-design case studies that connect requirements, entities, services, policies, state, and extension points into coherent systems.',
    objectives: [
      'Model real project prompts with clear entities, invariants, and workflows',
      'Introduce extensibility through strategies and policies only where requirements justify it',
      'Reason about concurrency, state transitions, and operational edge cases in object-oriented designs'
    ],
    lessons: [parkingLotLesson, elevatorLesson, bookingLesson]
  }
];
