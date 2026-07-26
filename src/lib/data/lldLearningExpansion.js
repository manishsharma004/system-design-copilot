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
    lessons: [
      {
        slug: 'creational-patterns-in-practice',
        title: 'Creational patterns in practice',
        summary:
          'Learn Factory, Builder, and Singleton through practical examples, including when each pattern is useful and when a plain constructor is better.',
        duration: '35-45 min',
        whyItMatters:
          'Creational patterns help when construction rules are complex, conditional, or shared across the codebase. Used carelessly, they hide simple code behind ceremony.',
        sections: [
          {
            heading: 'Factory: name the construction decision',
            body:
              'A Factory centralizes the choice of which concrete object to create. It is useful when callers should depend on a capability, not on a long conditional spread across the codebase.',
            bullets: [
              'Use a factory when the type depends on configuration, environment, request shape, or a registered plugin.',
              'Keep the factory small; it should choose collaborators, not become the business workflow.',
              'Avoid factories when the caller can clearly instantiate one class with no branching.'
            ],
            codeExample: {
              title: 'Factory for pricing strategies',
              code: `from abc import ABC, abstractmethod

class PricingStrategy(ABC):
    @abstractmethod
    def price(self, minutes):
        pass

class FlatRatePricing(PricingStrategy):
    def price(self, minutes):
        return 10

class HourlyPricing(PricingStrategy):
    def price(self, minutes):
        hours = (minutes + 59) // 60
        return hours * 4

class PricingFactory:
    @staticmethod
    def create(kind):
        if kind == "flat":
            return FlatRatePricing()
        if kind == "hourly":
            return HourlyPricing()
        raise ValueError(f"Unknown pricing kind: {kind}")`
            }
          },
          {
            heading: 'Builder: protect multi-step construction',
            body:
              'A Builder helps when an object has many optional fields, validation rules, or staged construction steps. The goal is to make invalid construction hard to express.',
            bullets: [
              'Use a builder for objects that need readable setup with required and optional parts.',
              'Put validation in the build step so partially assembled state does not leak.',
              'Prefer simple keyword arguments or small value objects when construction is already obvious.'
            ],
            codeExample: {
              title: 'Builder for a notification request',
              code: `class NotificationRequest:
    def __init__(self, channel, recipient, message, priority="normal"):
        self.channel = channel
        self.recipient = recipient
        self.message = message
        self.priority = priority

class NotificationBuilder:
    def __init__(self):
        self._channel = None
        self._recipient = None
        self._message = None
        self._priority = "normal"

    def channel(self, channel):
        self._channel = channel
        return self

    def recipient(self, recipient):
        self._recipient = recipient
        return self

    def message(self, message):
        self._message = message
        return self

    def high_priority(self):
        self._priority = "high"
        return self

    def build(self):
        if not self._channel or not self._recipient or not self._message:
            raise ValueError("channel, recipient, and message are required")
        return NotificationRequest(
            self._channel,
            self._recipient,
            self._message,
            self._priority,
        )`
            }
          },
          {
            heading: 'Singleton: constrain shared resources carefully',
            body:
              'Singleton restricts a class to one instance. It can be useful for process-wide resources, but it often creates hidden global state and makes tests harder.',
            bullets: [
              'Use Singleton sparingly for resources that truly must be unique in a process, such as a registry or shared configuration snapshot.',
              'Prefer dependency injection when callers can receive the shared object explicitly.',
              'Be cautious with concurrency, lifecycle, and tests; resetting global state is a common source of bugs.'
            ]
          }
        ],
        checklist: [
          'Choose a creational pattern only after naming the construction problem it solves.',
          'Keep construction logic separate from domain behavior.',
          'Explain why a plain constructor is or is not enough.',
          'Check how the pattern affects testing and future extension.'
        ],
        pitfalls: [
          'Creating factories for every class even when no construction decision exists.',
          'Using a builder to hide required fields instead of making object creation clearer.',
          'Introducing Singleton as a shortcut for dependency access, then fighting global state in tests.'
        ],
        interviewPrompts: [
          'Teach back when Factory is cleaner than calling a constructor directly.',
          'Explain aloud how Builder can enforce invariants during object creation.',
          'Walk through why Singleton can be harmful in a machine-coding solution.'
        ],
        diagram: null,
        related: [
          'responsibilities-and-interfaces',
          'solid-principles',
          'dependency-injection',
          'parking-lot-design'
        ]
      },
      {
        slug: 'structural-patterns-in-practice',
        title: 'Structural patterns in practice',
        summary:
          'Use Adapter, Decorator, Facade, and Composite to shape object relationships without making callers understand every internal detail.',
        duration: '35-45 min',
        whyItMatters:
          'Structural patterns help code evolve when interfaces do not line up, behavior needs layering, or a subsystem needs a simpler front door.',
        sections: [
          {
            heading: 'Adapter and Facade: make collaboration easier',
            body:
              'Adapter converts one interface into another expected by the client. Facade gives a simpler interface over a larger subsystem. Both reduce coupling, but at different boundaries.',
            bullets: [
              'Use Adapter when integrating a third-party API, legacy class, or alternate implementation with a mismatched shape.',
              'Use Facade when callers need a stable high-level operation instead of many subsystem calls.',
              'Do not let a facade become a dumping ground for every unrelated convenience method.'
            ],
            codeExample: {
              title: 'Adapter around a third-party email client',
              code: `class ThirdPartyEmailClient:
    def send_message(self, to_address, subject_line, html_body):
        print(f"Sending to {to_address}: {subject_line}")

class Notifier:
    def send(self, recipient, message):
        raise NotImplementedError

class EmailNotifierAdapter(Notifier):
    def __init__(self, email_client):
        self.email_client = email_client

    def send(self, recipient, message):
        self.email_client.send_message(
            to_address=recipient.email,
            subject_line=message.title,
            html_body=message.body,
        )`
            }
          },
          {
            heading: 'Decorator: layer behavior without subclass explosion',
            body:
              'Decorator wraps an object with another object that has the same interface. It is useful for optional behavior such as caching, retries, logging, authorization, or metrics.',
            bullets: [
              'Use decorators when behavior should be composed independently around a core object.',
              'Keep decorators transparent: callers should not need to know which wrappers are present.',
              'Avoid deep wrapper stacks that make order-dependent behavior hard to reason about.'
            ],
            codeExample: {
              title: 'Caching decorator for a catalog',
              code: `class Catalog:
    def get_item(self, item_id):
        raise NotImplementedError

class DatabaseCatalog(Catalog):
    def get_item(self, item_id):
        return {"id": item_id, "name": "Notebook"}

class CachedCatalog(Catalog):
    def __init__(self, inner):
        self.inner = inner
        self.cache = {}

    def get_item(self, item_id):
        if item_id not in self.cache:
            self.cache[item_id] = self.inner.get_item(item_id)
        return self.cache[item_id]`
            }
          },
          {
            heading: 'Composite: treat trees uniformly',
            body:
              'Composite lets clients work with a single object and a group of objects through the same interface. It fits menus, folders, organization charts, UI trees, and nested rules.',
            bullets: [
              'Use Composite when leaf and container objects should support the same operation.',
              'Put traversal logic in the composite so callers do not manually walk every child type.',
              'Avoid Composite when the model is not naturally hierarchical.'
            ],
            codeExample: {
              title: 'Composite for nested tasks',
              code: `class TaskNode:
    def estimate_hours(self):
        raise NotImplementedError

class Task(TaskNode):
    def __init__(self, hours):
        self.hours = hours

    def estimate_hours(self):
        return self.hours

class TaskGroup(TaskNode):
    def __init__(self, children):
        self.children = children

    def estimate_hours(self):
        return sum(child.estimate_hours() for child in self.children)`
            }
          }
        ],
        checklist: [
          'Name whether the structural problem is mismatch, wrapping, simplification, or hierarchy.',
          'Keep caller-facing interfaces stable and small.',
          'Check whether composition is clearer than inheritance.',
          'Explain the failure mode if wrappers or facades grow too broad.'
        ],
        pitfalls: [
          'Using Adapter when the real problem is unclear ownership of the integration boundary.',
          'Stacking decorators until behavior depends on hidden wrapper order.',
          'Turning a Facade into a god object that knows every subsystem detail.'
        ],
        interviewPrompts: [
          'Teach back the difference between Adapter and Facade with an example.',
          'Explain aloud how Decorator helps add caching without editing the core class.',
          'Walk through a Composite model for folders, menus, or nested comments.'
        ],
        diagram: null,
        related: [
          'composition-over-inheritance',
          'responsibilities-and-interfaces',
          'solid-principles',
          'library-management-system'
        ]
      },
      {
        slug: 'behavioral-patterns-in-practice',
        title: 'Behavioral patterns in practice',
        summary:
          'Apply Strategy, Observer, State, Command, and Template Method to organize decisions, notifications, state transitions, actions, and workflow skeletons.',
        duration: '40-50 min',
        whyItMatters:
          'Behavioral patterns are most valuable when rules change independently. They keep variation local so the rest of the design can stay readable.',
        sections: [
          {
            heading: 'Strategy and State: swap behavior deliberately',
            body:
              'Strategy selects an algorithm or policy at runtime. State moves behavior into objects that represent lifecycle states. They look similar, but Strategy varies a decision while State models transitions.',
            bullets: [
              'Use Strategy for pricing, routing, assignment, ranking, or validation policies.',
              'Use State when allowed operations depend on an object lifecycle such as draft, active, paused, or closed.',
              'Avoid either pattern when a small conditional is easier to read and unlikely to grow.'
            ],
            codeExample: {
              title: 'Strategy for spot assignment',
              code: `class SpotAssignmentStrategy:
    def choose_spot(self, available_spots, vehicle):
        raise NotImplementedError

class NearestSpotStrategy(SpotAssignmentStrategy):
    def choose_spot(self, available_spots, vehicle):
        return min(available_spots, key=lambda spot: spot.distance_to_gate)

class LargestFitStrategy(SpotAssignmentStrategy):
    def choose_spot(self, available_spots, vehicle):
        fitting = [spot for spot in available_spots if spot.can_fit(vehicle)]
        return min(fitting, key=lambda spot: spot.size_rank)`
            }
          },
          {
            heading: 'Observer and Command: decouple events and actions',
            body:
              'Observer lets interested objects react when something happens. Command packages an action as an object so it can be queued, retried, audited, undone, or scheduled.',
            bullets: [
              'Use Observer for domain events, UI updates, notifications, or cache invalidation.',
              'Use Command when actions need a lifecycle beyond a direct method call.',
              'Be explicit about delivery guarantees; observers can introduce hidden side effects if events are vague.'
            ],
            codeExample: {
              title: 'Command object for booking cancellation',
              code: `class CancelReservationCommand:
    def __init__(self, reservation_id, reservation_repo, payment_service):
        self.reservation_id = reservation_id
        self.reservation_repo = reservation_repo
        self.payment_service = payment_service

    def execute(self):
        reservation = self.reservation_repo.get(self.reservation_id)
        reservation.cancel()
        self.reservation_repo.save(reservation)
        self.payment_service.refund(reservation.payment_id)`
            }
          },
          {
            heading: 'Template Method: fix the skeleton, vary the steps',
            body:
              'Template Method defines the order of an algorithm in a base class while subclasses customize specific steps. It is useful when workflow order is stable but details differ.',
            bullets: [
              'Use it for import pipelines, report generation, validation workflows, or game turns with fixed phases.',
              'Keep hooks narrow so subclasses cannot break the algorithm contract.',
              'Prefer composition when the variable steps need to be mixed and matched independently.'
            ],
            codeExample: {
              title: 'Template Method for imports',
              code: `class ImportJob:
    def run(self, source):
        records = self.parse(source)
        valid_records = [record for record in records if self.validate(record)]
        self.persist(valid_records)
        self.after_import(valid_records)

    def parse(self, source):
        raise NotImplementedError

    def validate(self, record):
        return True

    def persist(self, records):
        raise NotImplementedError

    def after_import(self, records):
        pass`
            }
          }
        ],
        checklist: [
          'Identify which behavior changes independently from the rest of the model.',
          'Choose Strategy, State, Observer, Command, or Template Method based on the kind of variation.',
          'Define clear contracts for events, commands, and state transitions.',
          'Check that the pattern improves clarity compared with a direct method or small conditional.'
        ],
        pitfalls: [
          'Using Strategy for a conditional that has no real reason to vary.',
          'Publishing broad observer events that make side effects hard to trace.',
          'Using inheritance-heavy Template Method when composition would keep policies more flexible.'
        ],
        interviewPrompts: [
          'Teach back the difference between Strategy and State using a parking lot or elevator example.',
          'Explain aloud when Command is better than directly calling a service method.',
          'Walk through an Observer design for reservation notifications.'
        ],
        diagram: null,
        related: [
          'state-machines',
          'composition-over-inheritance',
          'parking-lot-design',
          'elevator-system-design'
        ]
      }
    ]
  },
  {
    slug: 'lld-project-labs',
    title: 'Object design project labs',
    summary:
      'Practice complete object-design case studies that connect entities, services, policies, state, and extension points into coherent systems.',
    objectives: [
      'Model real project prompts with clear entities, invariants, and workflows',
      'Introduce extensibility through strategies and policies only where requirements justify it',
      'Reason about concurrency, state transitions, and operational edge cases in object-oriented designs'
    ],
    lessons: [
      {
        slug: 'parking-lot-design-lab',
        title: 'Parking lot design lab',
        summary:
          'Walk through a parking lot design from core entities to pricing, spot assignment, ticket lifecycle, and future extension points.',
        duration: '45-60 min',
        whyItMatters:
          'Parking lot is a compact LLD prompt with useful depth: it tests entity modeling, state transitions, strategy selection, and how much abstraction is appropriate.',
        sections: [
          {
            heading: 'Model the core entities and invariants',
            body:
              'Start with the objects that own facts: vehicles, spots, tickets, gates, and the parking lot. Then name invariants the system must preserve.',
            bullets: [
              'A spot can be available, held, occupied, or out of service, but not two of those at once.',
              'A ticket links one vehicle to one assigned spot and has a lifecycle from issued to paid to exited.',
              'Vehicle type and spot type determine eligibility, but pricing should stay separate from spot assignment.'
            ],
            codeExample: {
              title: 'Entities with explicit ticket state',
              code: `from enum import Enum

class TicketStatus(Enum):
    ISSUED = "issued"
    PAID = "paid"
    CLOSED = "closed"

class ParkingTicket:
    def __init__(self, ticket_id, vehicle, spot, issued_at):
        self.ticket_id = ticket_id
        self.vehicle = vehicle
        self.spot = spot
        self.issued_at = issued_at
        self.paid_at = None
        self.status = TicketStatus.ISSUED

    def mark_paid(self, paid_at):
        if self.status != TicketStatus.ISSUED:
            raise ValueError("Only issued tickets can be paid")
        self.paid_at = paid_at
        self.status = TicketStatus.PAID

    def close(self):
        if self.status != TicketStatus.PAID:
            raise ValueError("Ticket must be paid before exit")
        self.status = TicketStatus.CLOSED`
            }
          },
          {
            heading: 'Add strategies where rules will change',
            body:
              'Pricing and spot assignment are likely follow-up areas, so they are good candidates for strategy interfaces. The rest of the design can remain direct.',
            bullets: [
              'Pricing may vary by vehicle type, time of day, event day, lost ticket, or membership.',
              'Spot assignment may prefer nearest spot, largest fitting spot, reserved zones, or EV charging needs.',
              'Keep gate orchestration thin: it should ask policies for decisions, not hard-code every rule.'
            ],
            codeExample: {
              title: 'Assignment and pricing strategies',
              code: `class ParkingLotService:
    def __init__(self, spot_repository, assignment_strategy, pricing_strategy):
        self.spots = spot_repository
        self.assignment_strategy = assignment_strategy
        self.pricing_strategy = pricing_strategy

    def enter(self, vehicle, now):
        available = self.spots.available_for(vehicle)
        spot = self.assignment_strategy.choose_spot(available, vehicle)
        spot.hold_for(vehicle)
        ticket = ParkingTicket(self.next_ticket_id(), vehicle, spot, now)
        spot.occupy(vehicle)
        return ticket

    def calculate_fee(self, ticket, exit_time):
        return self.pricing_strategy.price(ticket, exit_time)`
            }
          },
          {
            heading: 'Discuss extensibility and concurrency',
            body:
              'The interesting production concerns are preventing double assignment, handling abandoned tickets, and adding features without rewriting the core lifecycle.',
            bullets: [
              'Reserve or lock a spot while issuing a ticket so two gates cannot assign the same space.',
              'Expire held spots if payment, printing, or gate hardware fails during entry.',
              'Add reservations, subscriptions, EV charging, or multi-floor routing as policies around the core model.'
            ]
          }
        ],
        checklist: [
          'List entities, responsibilities, and invariants before naming patterns.',
          'Separate ticket lifecycle from pricing and assignment policies.',
          'Explain how the design prevents double-booking a spot.',
          'Name one extension that fits cleanly and one that would require a model change.'
        ],
        pitfalls: [
          'Modeling every lot feature before the core enter/pay/exit workflow works.',
          'Putting pricing, assignment, and ticket state transitions into one large service.',
          'Ignoring concurrency at gates and allowing two tickets for the same spot.'
        ],
        interviewPrompts: [
          'Teach back the parking lot design from vehicle entry through exit.',
          'Explain aloud why pricing and spot assignment make good Strategy examples.',
          'Walk through how you would add reservations without rewriting the ticket lifecycle.'
        ],
        diagram: null,
        related: [
          'behavioral-patterns-in-practice',
          'creational-patterns-in-practice',
          'state-machines',
          'solid-principles'
        ]
      },
      {
        slug: 'elevator-system-design-lab',
        title: 'Elevator system design lab',
        summary:
          'Design elevator cars, requests, scheduling, state machines, and multi-elevator coordination with clear responsibilities.',
        duration: '45-60 min',
        whyItMatters:
          'Elevator design forces you to separate local state from fleet-level coordination. It is a strong practice prompt for state machines and scheduling policies.',
        sections: [
          {
            heading: 'Separate car state from dispatch policy',
            body:
              'An elevator car owns its current floor, direction, door state, and assigned stops. A dispatcher chooses which car should handle a hall request.',
            bullets: [
              'Car-local logic should answer whether it can accept a stop and how it moves to the next stop.',
              'Fleet-level logic should compare cars using distance, direction, load, maintenance state, and fairness.',
              'Keep request objects explicit: hall calls and car-panel requests have different meanings.'
            ],
            codeExample: {
              title: 'Elevator car state and movement',
              code: `from enum import Enum

class Direction(Enum):
    UP = "up"
    DOWN = "down"
    IDLE = "idle"

class ElevatorCar:
    def __init__(self, car_id, current_floor=0):
        self.car_id = car_id
        self.current_floor = current_floor
        self.direction = Direction.IDLE
        self.stops = set()

    def assign_stop(self, floor):
        self.stops.add(floor)
        if self.direction == Direction.IDLE:
            self.direction = Direction.UP if floor > self.current_floor else Direction.DOWN

    def step(self):
        if not self.stops:
            self.direction = Direction.IDLE
            return
        self.current_floor += 1 if self.direction == Direction.UP else -1
        if self.current_floor in self.stops:
            self.stops.remove(self.current_floor)
            self.open_doors()`
            }
          },
          {
            heading: 'Design scheduling as a replaceable strategy',
            body:
              'Elevator scheduling can start simple and become sophisticated. A strategy interface lets you compare nearest-car, same-direction, zone-based, or destination-control policies.',
            bullets: [
              'Nearest-car is easy to explain but can perform poorly under directional traffic.',
              'Same-direction scheduling reduces reversals and improves passenger experience during rush patterns.',
              'Zone or destination-control scheduling becomes useful in tall buildings with many cars.'
            ],
            codeExample: {
              title: 'Dispatcher with scheduling strategy',
              code: `class DispatchStrategy:
    def choose_car(self, cars, request):
        raise NotImplementedError

class NearestAvailableStrategy(DispatchStrategy):
    def choose_car(self, cars, request):
        candidates = [car for car in cars if car.direction in (Direction.IDLE, request.direction)]
        return min(candidates, key=lambda car: abs(car.current_floor - request.floor))

class ElevatorController:
    def __init__(self, cars, strategy):
        self.cars = cars
        self.strategy = strategy

    def handle_hall_call(self, request):
        car = self.strategy.choose_car(self.cars, request)
        car.assign_stop(request.floor)
        return car.car_id`
            }
          },
          {
            heading: 'Handle coordination and edge cases',
            body:
              'A good design names what happens when cars fill up, go out of service, skip floors, or receive conflicting requests.',
            bullets: [
              'Represent maintenance and capacity as constraints the dispatcher must respect.',
              'Think about fairness so one floor or direction does not starve during heavy traffic.',
              'Use a state machine for doors and movement so illegal transitions are rejected.'
            ]
          }
        ],
        checklist: [
          'Define car state, request types, and dispatcher responsibilities separately.',
          'Choose an initial scheduling strategy and name its trade-offs.',
          'Describe how maintenance, capacity, and emergency modes affect dispatch.',
          'Explain how state transitions prevent impossible behavior.'
        ],
        pitfalls: [
          'Putting fleet scheduling and car movement into one class with tangled conditionals.',
          'Ignoring direction and creating inefficient reversal-heavy routes.',
          'Failing to model door, maintenance, or emergency states until late follow-ups.'
        ],
        interviewPrompts: [
          'Teach back the difference between an elevator car and an elevator controller.',
          'Explain aloud how a nearest-car scheduler can be improved for rush-hour traffic.',
          'Walk through a state machine for moving, stopping, door open, and maintenance states.'
        ],
        diagram: null,
        related: [
          'state-machines',
          'behavioral-patterns-in-practice',
          'composition-over-inheritance',
          'concurrency-in-lld'
        ]
      },
      {
        slug: 'library-or-booking-system-lab',
        title: 'Library or booking system lab',
        summary:
          'Design inventory, reservations, holds, checkout, overdue policies, and concurrency controls for a library or booking-style system.',
        duration: '45-60 min',
        whyItMatters:
          'Library and booking systems teach the same core lesson: inventory is finite, reservations race, policies change, and the object model must protect ownership over time.',
        sections: [
          {
            heading: 'Model inventory separately from catalog',
            body:
              'A book title, room type, or product listing is not the same as a physical copy or reservable unit. Separating catalog from inventory keeps availability rules honest.',
            bullets: [
              'Catalog objects describe searchable metadata such as title, author, room type, or amenities.',
              'Inventory units represent things that can be held, borrowed, booked, damaged, or removed.',
              'Reservations and loans should reference concrete inventory or an allocation rule, not just display metadata.'
            ],
            codeExample: {
              title: 'Catalog item and loanable copy',
              code: `from enum import Enum

class CopyStatus(Enum):
    AVAILABLE = "available"
    HELD = "held"
    CHECKED_OUT = "checked_out"
    LOST = "lost"

class BookTitle:
    def __init__(self, isbn, title, authors):
        self.isbn = isbn
        self.title = title
        self.authors = authors

class BookCopy:
    def __init__(self, barcode, title):
        self.barcode = barcode
        self.title = title
        self.status = CopyStatus.AVAILABLE

    def hold(self):
        if self.status != CopyStatus.AVAILABLE:
            raise ValueError("Only available copies can be held")
        self.status = CopyStatus.HELD`
            }
          },
          {
            heading: 'Protect reservations under concurrency',
            body:
              'The key risk is promising the same inventory to two users. The design should make the availability check and hold creation atomic at the right boundary.',
            bullets: [
              'Use a reservation service or repository method that checks availability and records the hold in one transaction.',
              'Give holds an expiration time so abandoned reservations return to inventory.',
              'Use idempotency keys for retries so duplicate client requests do not create duplicate holds.'
            ],
            codeExample: {
              title: 'Reservation service with atomic hold intent',
              code: `class ReservationService:
    def __init__(self, inventory_repository, clock):
        self.inventory = inventory_repository
        self.clock = clock

    def reserve_copy(self, patron_id, isbn, idempotency_key):
        existing = self.inventory.find_reservation_by_key(idempotency_key)
        if existing:
            return existing

        # Repository performs SELECT ... FOR UPDATE or equivalent locking.
        copy = self.inventory.lock_available_copy(isbn)
        if copy is None:
            raise ValueError("No copies available")

        copy.hold()
        reservation = Reservation(
            patron_id=patron_id,
            copy_barcode=copy.barcode,
            expires_at=self.clock.now_plus_minutes(15),
            idempotency_key=idempotency_key,
        )
        self.inventory.save(copy, reservation)
        return reservation`
            }
          },
          {
            heading: 'Keep policies replaceable',
            body:
              'Loan duration, renewal limits, overdue fees, cancellation rules, and priority queues are policies. Model them explicitly so the workflow stays stable as rules change.',
            bullets: [
              'A university library, public library, hotel, and equipment booking system have different policy rules over the same inventory pattern.',
              'Overdue policy may consider item type, patron status, grace periods, holidays, and maximum caps.',
              'Notification and escalation should react to policy outcomes instead of being hard-coded into inventory objects.'
            ],
            codeExample: {
              title: 'Overdue policy as a strategy',
              code: `class OverduePolicy:
    def fee_for(self, loan, as_of):
        raise NotImplementedError

class DailyCapOverduePolicy(OverduePolicy):
    def __init__(self, daily_fee, max_fee):
        self.daily_fee = daily_fee
        self.max_fee = max_fee

    def fee_for(self, loan, as_of):
        days_late = max(0, (as_of.date() - loan.due_at.date()).days)
        return min(days_late * self.daily_fee, self.max_fee)`
            }
          }
        ],
        checklist: [
          'Separate catalog metadata from reservable inventory units.',
          'Define reservation, checkout, renewal, return, and overdue workflows.',
          'Explain how the design prevents duplicate reservations under retries or concurrent users.',
          'Name which business rules belong in policies rather than entities.'
        ],
        pitfalls: [
          'Treating a title or listing as the inventory unit and losing track of individual availability.',
          'Checking availability and creating a reservation in separate non-atomic steps.',
          'Hard-coding overdue, renewal, and cancellation rules into entity classes.'
        ],
        interviewPrompts: [
          'Teach back why catalog and inventory should be modeled separately.',
          'Explain aloud how you would prevent two patrons from reserving the same copy.',
          'Walk through how overdue rules change if the same model becomes a room-booking system.'
        ],
        diagram: null,
        related: [
          'concurrency-in-lld',
          'behavioral-patterns-in-practice',
          'state-machines',
          'library-management-system'
        ]
      }
    ]
  }
];
