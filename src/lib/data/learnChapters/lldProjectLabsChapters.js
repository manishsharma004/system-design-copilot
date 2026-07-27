/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldProjectLabsChapters = {
  'lld-project-labs/parking-lot-design-lab': {
    title: 'Parking lot design lab',
    readingTime: '60-75 min',
    premise:
      'Parking lot is the canonical object-design lab because it forces inventory, allocation policy, pricing, and concurrency into one story. A strong interview solution clarifies vehicle and spot types, keeps allocation replaceable, and makes entry/exit atomic with respect to spot occupancy.',
    parts: [
      {
        id: 'clarify-the-lot-contract',
        heading: 'Clarify the lot contract before drawing classes',
        paragraphs: [
          'Begin by locking requirements that change the model. How many floors? Do spots have sizes (motorcycle, compact, large)? Can a car take a large spot? Is parking first-come or nearest-to-entrance? Is pricing flat, hourly, or tiered by vehicle? Do electric spots need chargers? Write these as acceptance bullets the interviewer can confirm.',
          'Then list use cases: enter vehicle, issue ticket, find spot, exit and pay, query availability. Everything else is follow-up bait. Resist modeling payment providers and mobile apps until the core occupancy loop works.',
          'A crisp domain sentence helps: "A ParkingLot assigns an available Spot to a Vehicle, records a Ticket, and frees the Spot on exit after FeeCalculator prices the stay." That sentence already names the primary classes and collaborations.'
        ],
        keyTerms: [
          {
            term: 'Spot inventory',
            definition:
              'The collection of parkable spaces tracked by identity, size, floor, and occupancy.'
          },
          {
            term: 'Ticket',
            definition:
              'The record linking a vehicle, assigned spot, entry time, and later exit billing data.'
          },
          {
            term: 'Allocation policy',
            definition:
              'The rule that chooses which free spot a vehicle receives.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Confirm whether a larger spot may host a smaller vehicle. That single rule changes allocator and availability logic.'
        },
        checkYourself: [
          {
            prompt: 'What is the minimum happy-path loop you should demo first?',
            reveal:
              'Enter with a vehicle, receive a ticket tied to a spot, exit with payment based on duration, and show the spot free again.'
          }
        ]
      },
      {
        id: 'class-diagram-in-prose',
        heading: 'Class diagram in prose',
        paragraphs: [
          'Vehicle is a small type with id and size. Spot holds id, size, floor, and occupied flag or current vehicle id. Ticket stores ticket id, vehicle id, spot id, entry timestamp, and optional exit timestamp. ParkingLot owns spots and active tickets. Allocator selects a spot. FeeCalculator prices a closed ticket. Gate or ParkingService orchestrates enter/exit so the lot remains consistent.',
          'Prefer composition over deep inheritance. Motorcycle, Car, and Bus can be an enum size on Vehicle rather than three empty subclasses unless behavior truly diverges. SpotSize compatibility belongs in the allocator, not scattered across vehicle subclasses.',
          'Relationships: ParkingLot has many Spots, has many active Tickets, uses Allocator, uses FeeCalculator, and uses Clock for timestamps. Ticket references vehicle and spot identities rather than owning those objects if you want easier serialization later.'
        ],
        keyTerms: [
          {
            term: 'Compatibility rule',
            definition:
              'The mapping from vehicle size to allowable spot sizes used during allocation.'
          },
          {
            term: 'Active ticket',
            definition:
              'A ticket for a vehicle still in the lot; usually keyed for fast lookup on exit.'
          },
          {
            term: 'Orchestrator service',
            definition:
              'The entry point that sequences allocation, ticket creation, and occupancy updates.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'On the whiteboard: boxes for ParkingLot, Spot, Ticket, Allocator, FeeCalculator. Arrows for uses/has. Skip UI widgets.'
        },
        checkYourself: [
          {
            prompt: 'Why keep FeeCalculator outside ParkingLot methods?',
            reveal:
              'Pricing changes independently of occupancy. Isolating it lets you swap hourly, flat, or surge pricing without editing allocation.'
          }
        ]
      },
      {
        id: 'allocation-and-iteration',
        heading: 'Allocation strategy and iteration plan',
        paragraphs: [
          'Implement a naive allocator first: scan spots and pick the first compatible free one. Demo enter/exit. Next, add nearest-entrance ordering or floor preference via a strategy interface. Finally, index free spots by size in heaps or sets if the interviewer pushes scale.',
          'Keep enter() responsible for: validate no duplicate active vehicle, ask allocator, mark spot occupied, create ticket, return ticket. Keep exit() responsible for: find ticket, compute fee, mark spot free, close ticket. Do not mix display formatting into these methods.',
          'Data structures matter in follow-ups. A dict of spot id to Spot, a dict of vehicle id to ticket id, and per-size free-spot sets give O(1)-ish operations. Mention them when asked about thousands of spots, not before the first demo works.'
        ],
        workedExample: {
          title: 'Minimal lot with first-fit allocation',
          body: 'A compact model showing enter/exit orchestration, compatibility, and fee calculation seams.',
          language: 'python',
          code: `from dataclasses import dataclass
from enum import Enum
from typing import Dict, Optional


class Size(Enum):
    S = 1
    M = 2
    L = 3


@dataclass
class Spot:
    spot_id: str
    size: Size
    vehicle_id: Optional[str] = None

    @property
    def free(self) -> bool:
        return self.vehicle_id is None


@dataclass
class Ticket:
    ticket_id: str
    vehicle_id: str
    spot_id: str
    entry_hour: int
    exit_hour: Optional[int] = None


class FirstFitAllocator:
    def choose(self, spots: Dict[str, Spot], needed: Size) -> Spot:
        for spot in spots.values():
            if spot.free and spot.size.value >= needed.value:
                return spot
        raise RuntimeError("lot full for vehicle size")


class HourlyFee:
    def price(self, ticket: Ticket) -> int:
        assert ticket.exit_hour is not None
        hours = max(1, ticket.exit_hour - ticket.entry_hour)
        return hours * 10


class ParkingLot:
    def __init__(self, spots, allocator, fees, clock) -> None:
        self.spots = {s.spot_id: s for s in spots}
        self.allocator = allocator
        self.fees = fees
        self.clock = clock
        self.tickets: Dict[str, Ticket] = {}
        self.active: Dict[str, str] = {}
        self._n = 0

    def enter(self, vehicle_id: str, size: Size) -> Ticket:
        if vehicle_id in self.active:
            raise RuntimeError("vehicle already parked")
        spot = self.allocator.choose(self.spots, size)
        spot.vehicle_id = vehicle_id
        self._n += 1
        ticket = Ticket(f"t{self._n}", vehicle_id, spot.spot_id, self.clock())
        self.tickets[ticket.ticket_id] = ticket
        self.active[vehicle_id] = ticket.ticket_id
        return ticket

    def exit(self, vehicle_id: str) -> int:
        ticket_id = self.active.pop(vehicle_id)
        ticket = self.tickets[ticket_id]
        ticket.exit_hour = self.clock()
        self.spots[ticket.spot_id].vehicle_id = None
        return self.fees.price(ticket)


if __name__ == "__main__":
    hours = iter([8, 11]).__next__
    lot = ParkingLot(
        [Spot("a", Size.M), Spot("b", Size.L)],
        FirstFitAllocator(),
        HourlyFee(),
        hours,
    )
    print(lot.enter("car-1", Size.M))
    print("fee", lot.exit("car-1"))`
        },
        callout: {
          tone: 'tip',
          body:
            'Ship first-fit, then swap the allocator class. That demo proves OCP without a speech.'
        },
        checkYourself: [
          {
            prompt: 'What indexes would you add if free-spot scans become hot?',
            reveal:
              'Per-size free-spot sets or heaps keyed by distance, updated on enter and exit, so allocation avoids scanning occupied spots.'
          }
        ]
      },
      {
        id: 'concurrency-in-the-lot',
        heading: 'Concurrency: two cars, one last spot',
        paragraphs: [
          'The classic follow-up is concurrent entry. Two threads can both observe the same free spot if allocation and occupancy updates are not atomic. In a single-process interview solution, put a lock around the critical section in enter() that chooses and occupies a spot. exit() needs the same lock if it mutates shared indexes.',
          'Finer-grained designs lock per floor or use concurrent maps, but correctness first beats clever striping. Discuss what happens under lock failure, duplicate entry of the same vehicle id, and exit without an active ticket—these are edge cases interviewers love.',
          'If the problem moves distributed, you would need a transactional store or compare-and-swap on spot rows. Say that out loud as a scale bridge, then return to the in-memory lock story appropriate for machine coding.'
        ],
        keyTerms: [
          {
            term: 'Critical section',
            definition:
              'The code region that must appear atomic: select free spot and mark it occupied.'
          },
          {
            term: 'Double occupancy',
            definition:
              'A race where two tickets claim the same spot because updates interleaved.'
          },
          {
            term: 'Idempotent exit',
            definition:
              'A policy choice: second exit either errors clearly or no-ops after the first close.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Checking free then setting occupied in separate unlocked steps is the textbook parking-lot race.'
        },
        checkYourself: [
          {
            prompt: 'Why is locking only inside the allocator insufficient?',
            reveal:
              'Ticket creation and active-vehicle indexes also update. The orchestrator should own the transaction-like boundary across spot and ticket mutations.'
          }
        ]
      },
      {
        id: 'pricing-edges-and-extensions',
        heading: 'Pricing, edge cases, and extensions',
        paragraphs: [
          'Fee rules need explicit policies for zero-duration stays, grace periods, daily caps, and lost tickets. Represent time through a Clock port so tests inject hours without sleeping. Never call the real system clock deep inside pricing if you care about deterministic tests.',
          'Edge cases: entering when full, vehicle already parked, exiting unknown vehicle, spot size mismatch if allocator is bypassed, and electric-only spots. Each should raise a domain error the facade can map to a user message.',
          'Extensions often include reservations, multiple gates, and display boards for free counts per floor. Free counts can be maintained as counters updated on enter/exit, or computed by scanning if N is small. Choose based on the interviewer\'s scale hints.'
        ],
        callout: {
          tone: 'interview',
          body:
            'When asked about reserved spots, add a ReservationRegistry consulted before public allocation rather than stuffing flags everywhere.'
        },
        checkYourself: [
          {
            prompt: 'How do you unit-test a three-hour stay without waiting?',
            reveal:
              'Inject a Clock or pass entry/exit timestamps into FeeCalculator so tests set exact times.'
          }
        ]
      },
      {
        id: 'parking-wrap-narrative',
        heading: 'How to narrate the final design',
        paragraphs: [
          'Close the interview by restating responsibilities: lot owns inventory, allocator picks, calculator prices, service orchestrates, clock provides time. Mention the lock around enter/exit and how a new allocator plugs in.',
          'Show one test list: empty lot entry, full lot rejection, duplicate vehicle, fee for multi-hour stay, concurrent entry stress if time allows. Tests communicate maturity more than extra classes.',
          'If time remains, sketch a display board observer that listens to occupancy changes. That is a clean behavioral extension that does not disturb the core loop.'
        ],
        callout: {
          tone: 'tip',
          body:
            'A short spoken class diagram plus a working enter/exit demo beats an unfinished pattern festival.'
        },
        checkYourself: [
          {
            prompt: 'What is the one invariant the lot must never violate?',
            reveal:
              'A spot is never assigned to two active tickets at once, and every active vehicle maps to exactly one occupied spot.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Parking lot design centers on inventory, allocation, tickets, and fees.',
        'Keep allocator and pricing replaceable; keep enter/exit as the consistency boundary.',
        'Concurrency requires atomic select-and-occupy; edge cases need explicit domain errors.',
        'Iterate from first-fit demo to indexed allocation only when scale follow-ups arrive.'
      ],
      nextSteps: [
        'Implement enter/exit with an injected clock and hourly fees.',
        'Swap in a nearest-spot allocator without editing ParkingLot orchestration.',
        'Add a mutex around the occupancy critical section and explain the race it prevents.'
      ]
    }
  },

  'lld-project-labs/elevator-system-design-lab': {
    title: 'Elevator system design lab',
    readingTime: '60-75 min',
    premise:
      'Elevator system design tests event handling, scheduling strategy, and state. Interviewers watch whether you model halls and cars cleanly, keep dispatch replaceable, and explain what happens when multiple requests collide on moving cars.',
    parts: [
      {
        id: 'elevator-requirements-cut',
        heading: 'Cut requirements into cars, halls, and requests',
        paragraphs: [
          'Separate hall calls (floor + direction) from car calls (destination floors inside a car). Decide car count, floor range, whether cars have capacity, and whether the system is scan/elevator-algorithm based or simple nearest-car dispatch. Confirm if doors and dwell time matter or can be abstracted.',
          'Primary use cases: request up/down from a floor, select destination inside a car, step the simulation, and query car positions. Optional: emergency stop, maintenance mode, priority VIP cars. Park optional features behind flags until the scheduler works.',
          'Domain sentence: "ElevatorController receives HallRequest and CarRequest events, DispatchStrategy assigns a car, and each ElevatorCar moves under an ElevatorState while serving a stop set."'
        ],
        keyTerms: [
          {
            term: 'Hall request',
            definition:
              'A call placed on a floor for a direction, not yet tied to a destination.'
          },
          {
            term: 'Car request',
            definition:
              'A destination floor selected from inside a specific elevator car.'
          },
          {
            term: 'Dispatch strategy',
            definition:
              'The policy that chooses which car should serve an incoming hall request.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Ask whether this is a discrete simulation with tick() or an event-driven model. Your loop structure depends on that answer.'
        },
        checkYourself: [
          {
            prompt: 'Why separate hall and car requests in the model?',
            reveal:
              'They arrive from different actors and have different assignment rules. Hall requests need dispatch; car requests bind to an already chosen car.'
          }
        ]
      },
      {
        id: 'elevator-class-diagram',
        heading: 'Class diagram in prose',
        paragraphs: [
          'ElevatorCar has id, current floor, direction or state, and a set of pending stops. ElevatorState (Idle, MovingUp, MovingDown, DoorOpen) controls legal transitions. ElevatorController owns cars and the pending hall queue. DispatchStrategy picks a car for a hall request. Request objects are immutable facts: floor, direction, timestamp.',
          'Avoid a single god Elevator class that mixes hardware door motors, user UI, and scheduling. Door behavior can be a method on state transitions for interview scope. Sensors and button panels are adapters you can name without implementing.',
          'Relationships: Controller uses Strategy, Controller has many Cars, Car has State, Car has pending stops. Direction can be derived from state or stored carefully to avoid conflicting fields.'
        ],
        keyTerms: [
          {
            term: 'Pending stops',
            definition:
              'The set of floors a car still must visit, ordered by the active scheduling rule.'
          },
          {
            term: 'Scan algorithm',
            definition:
              'A scheduling approach that continues in one direction serving stops, then reverses, similar to disk scheduling.'
          },
          {
            term: 'Idle assignment',
            definition:
              'How the system chooses among stationary cars when a new hall call arrives.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Draw Controller at the center, Strategy beside it, Cars as a collection, State inside each car.'
        },
        checkYourself: [
          {
            prompt: 'Where should illegal "open door while moving" be rejected?',
            reveal:
              'In the car state transition logic, so the controller cannot accidentally command an illegal hardware-like action.'
          }
        ]
      },
      {
        id: 'dispatch-and-simulation-loop',
        heading: 'Dispatch, stops, and the simulation loop',
        paragraphs: [
          'Iteration plan: one car, manual destination stops, tick moves one floor toward the next stop. Then add hall requests with nearest-car dispatch. Then upgrade to scan scheduling that continues in direction. Finally discuss multi-car load balancing.',
          'On each tick, every car advances according to state: if moving, step one floor; if arriving at a stop, remove stop, open door; if idle with pending stops, choose direction. Keep tick deterministic for tests.',
          'Dispatch should estimate cost: distance, current direction compatibility, and load. A simple cost function beats a vague "smart AI" claim. Expose DispatchStrategy so tests can freeze assignment rules.'
        ],
        workedExample: {
          title: 'Single-car stop serving with ticks',
          body: 'A minimal car that accepts destinations and moves one floor per tick, illustrating the simulation spine. A plain set plus scan logic is enough—no third-party sorted containers required.',
          language: 'python',
          code: `class ElevatorCar:
    def __init__(self, car_id: str, floor: int = 0) -> None:
        self.car_id = car_id
        self.floor = floor
        self.direction = 0  # -1, 0, 1
        self.stops = set()

    def add_stop(self, floor: int) -> None:
        if floor != self.floor:
            self.stops.add(floor)
            if self.direction == 0:
                self.direction = 1 if floor > self.floor else -1

    def tick(self) -> None:
        if not self.stops:
            self.direction = 0
            return
        if self.floor in self.stops:
            self.stops.remove(self.floor)
            if not self.stops:
                self.direction = 0
            elif self.direction > 0 and not any(f > self.floor for f in self.stops):
                self.direction = -1
            elif self.direction < 0 and not any(f < self.floor for f in self.stops):
                self.direction = 1
            return
        self.floor += self.direction


if __name__ == "__main__":
    car = ElevatorCar("A", 0)
    car.add_stop(3)
    car.add_stop(1)
    for _ in range(6):
        car.tick()
        print(car.floor, car.direction, sorted(car.stops))`
        },
        callout: {
          tone: 'warning',
          body:
            'Keep the simulation dependency-free in interviews. A set plus explicit scan/reverse rules beats importing specialized collections.'
        },
        checkYourself: [
          {
            prompt: 'Why is a deterministic tick helpful in interviews?',
            reveal:
              'Tests can assert positions after N ticks without threads or sleeps, and the interviewer can step through scheduling decisions.'
          }
        ]
      },
      {
        id: 'elevator-concurrency',
        heading: 'Concurrency and conflicting requests',
        paragraphs: [
          'Even if the simulation is single-threaded, talk about concurrent button presses. The controller should serialize request intake onto a queue processed between ticks, or lock around pending-stop mutations. Two threads adding stops to the same set without synchronization is a real bug.',
          'Conflicting directions are not concurrency bugs; they are scheduling problems. A car moving up can accept a higher floor stop without reversing mid-travel if you follow scan rules. Document the rule so the interviewer sees intentional behavior.',
          'Distributed elevators in separate controllers need consensus on assignment to avoid two cars answering one hall call. For machine coding, a single controller assigning requests is the right scope; mention distributed assignment as a later bridge.'
        ],
        keyTerms: [
          {
            term: 'Request queue',
            definition:
              'A serialized intake structure that absorbs concurrent external events before the scheduler reads them.'
          },
          {
            term: 'Duplicate hall call',
            definition:
              'A repeated up/down press on the same floor; usually coalesced into one pending request.'
          },
          {
            term: 'Starvation',
            definition:
              'A floor request that waits indefinitely because dispatch always prefers other traffic.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Coalesce duplicate hall calls and mention starvation as a metric your dispatch cost could include.'
        },
        checkYourself: [
          {
            prompt: 'How do you prevent two cars from taking the same hall request?',
            reveal:
              'Assign inside the controller under one authority: mark the request assigned or remove it from the pending hall queue atomically with car selection.'
          }
        ]
      },
      {
        id: 'elevator-edges',
        heading: 'Edge cases and failure modes',
        paragraphs: [
          'Handle requests to the current floor, calls while doors are open, cars at capacity, out-of-range floors, and maintenance mode that removes a car from dispatch. Decide whether destination requests inside a full car are rejected or queued.',
          'Door timing can be abstracted as remaining_dwell ticks. That keeps the model honest without hardware detail. Emergency stop should clear pending stops or freeze motion according to an agreed policy—say the policy aloud.',
          'Testing strategy: assert that an up hall call is not assigned to a car committed downward past the floor unless policy allows pickup. Build a timeline table in comments for one scenario; it impresses interviewers.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Write one scenario script: floor events vs ticks vs expected car positions. Use it as your live demo narrative.'
        },
        checkYourself: [
          {
            prompt: 'What happens if a passenger presses the current floor button?',
            reveal:
              'Usually treat it as door-open / no-op rather than adding a stop. Explicit handling avoids weird state churn.'
          }
        ]
      },
      {
        id: 'elevator-narrative-close',
        heading: 'Narrating tradeoffs under time pressure',
        paragraphs: [
          'Emphasize that dispatch is a strategy and motion is state. Show how adding a second car only extends the controller collection and cost function. Admit what you simplified: continuous motion, weight sensors, VIP override.',
          'If asked to scale to fifty floors and twenty cars, discuss indexing hall requests by floor, fair aging of waits, and partitioning cars by zones. Return to the working tick demo as proof of correctness habits.',
          'End with invariants: each hall request assigned to at most one car, car floor always in range, and stops only change through controller/car APIs.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Invariants plus a tick-based demo are the elevator-lab signature of a strong candidate.'
        },
        checkYourself: [
          {
            prompt: 'Name one intentional simplification you should call out.',
            reveal:
              'Examples: instantaneous door open/close, no cabin capacity, or discrete floors without acceleration physics.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Model hall vs car requests, cars with state, and replaceable dispatch.',
        'A deterministic tick loop makes scheduling explainable and testable.',
        'Serialize request intake; coalesce duplicates; assign each hall call once.',
        'Discuss scan scheduling, starvation, and zoning as deliberate follow-ups.'
      ],
      nextSteps: [
        'Implement one car with add_stop and tick.',
        'Add a controller with nearest-car dispatch for hall requests.',
        'Script a multi-request scenario and assert positions after N ticks.'
      ]
    }
  },

  'lld-project-labs/library-or-booking-system-lab': {
    title: 'Library or booking system lab',
    readingTime: '60-75 min',
    premise:
      'Library and booking labs stress catalog identity, reservation lifecycle, and conflict policy. Whether the resource is a book copy or a seat, the interview skill is modeling availability over time and preventing double allocation under concurrent users.',
    parts: [
      {
        id: 'resource-vs-copy',
        heading: 'Separate catalog title from reservable copy',
        paragraphs: [
          'In a library, Book is the catalog work; BookCopy is the reservable item with a barcode. In movie booking, Movie and Show are catalog; Seat is the reservable inventory for a Show. Confusing catalog with inventory produces impossible designs where borrowing one abstract title removes every copy.',
          'Clarify flows: search catalog, reserve or checkout, renew, return, cancel hold, pay fines or ticket price. Decide whether holds queue when all copies are out. For seats, decide hold timeout before payment.',
          'Domain sentence: "BookingService reserves a ResourceUnit for a Patron under a Reservation policy, transitions it through held/confirmed/cancelled, and releases inventory on expiry or completion."'
        ],
        keyTerms: [
          {
            term: 'Catalog entity',
            definition:
              'The searchable work or event description, not itself the scarce inventory unit.'
          },
          {
            term: 'Resource unit',
            definition:
              'The concrete inventory item that can be exclusively allocated, such as a copy or seat.'
          },
          {
            term: 'Hold timeout',
            definition:
              'A limited window where a reservation blocks inventory before confirmation or payment.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'If you only remember one modeling rule: titles are many-to-one with copies; shows are many-to-one with seats.'
        },
        checkYourself: [
          {
            prompt: 'Why is booking a Movie object directly a design smell?',
            reveal:
              'Movies are catalog. Scarcity lives on Show seats. Booking the movie would not know which screening or seat was taken.'
          }
        ]
      },
      {
        id: 'booking-class-diagram',
        heading: 'Class diagram in prose',
        paragraphs: [
          'Patron/User has id and contact. Catalog items reference metadata. ResourceUnit has id, status (available, held, checked_out/sold), and optional current reservation id. Reservation has id, patron id, resource ids, status, created_at, expires_at. Policy objects handle loan length, fine rates, or seat selection rules. BookingService or LibraryService orchestrates.',
          'For Splitwise-like booking of expenses, the scarce resource is not a seat but consistency of balances: Expense, Group, Ledger entries, and settle-up operations. Still use explicit lifecycle states for expenses (open, edited, deleted) rather than mutating history silently.',
          'Relationships: Service uses InventoryRepository and ReservationRepository; Reservation references Patron and ResourceUnits; Inventory updates status through service methods only.'
        ],
        keyTerms: [
          {
            term: 'Reservation lifecycle',
            definition:
              'States such as held, confirmed, cancelled, expired, and completed that gate legal operations.'
          },
          {
            term: 'Inventory status',
            definition:
              'Availability flag on a resource unit that must stay consistent with reservation records.'
          },
          {
            term: 'Ledger entry',
            definition:
              'In expense-splitting variants, an immutable balance delta between participants.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Say: "Inventory status is updated only through reservation transitions, never from random helpers."'
        },
        checkYourself: [
          {
            prompt: 'Where do seat maps belong in the diagram?',
            reveal:
              'As inventory attached to a Show, not as global seats. Seat A1 in two shows are different resource units or a seat identity scoped by show.'
          }
        ]
      },
      {
        id: 'conflict-policy-and-iteration',
        heading: 'Conflict policy and iteration strategy',
        paragraphs: [
          'First implement single-resource checkout without holds. Second, add hold with expiry. Third, add waitlists or alternative seat suggestions. Fourth, discuss payments as a port. This order yields a demo quickly while leaving room for follow-ups.',
          'Conflict policy must be explicit: optimistic check of status then update, or pessimistic lock on the seat row. For in-memory labs, a mutex per show or a global booking lock around allocate-and-mark is acceptable if explained.',
          'Idempotency matters when clients retry pay. Use reservation ids as idempotency keys so double-click payment does not create two confirmations.'
        ],
        workedExample: {
          title: 'Seat hold with expiry and confirm',
          body: 'In-memory show inventory with hold timeout and confirmation, illustrating the conflict boundary.',
          language: 'python',
          code: `from dataclasses import dataclass
from typing import Dict, Optional, Set


@dataclass
class Seat:
    seat_id: str
    status: str = "available"  # available|held|sold
    reservation_id: Optional[str] = None


@dataclass
class Reservation:
    reservation_id: str
    show_id: str
    seat_ids: Set[str]
    status: str
    expires_at: int


class BookingService:
    def __init__(self, seats_by_show: Dict[str, Dict[str, Seat]], clock) -> None:
        self.seats_by_show = seats_by_show
        self.clock = clock
        self.reservations: Dict[str, Reservation] = {}
        self._n = 0

    def hold(self, show_id: str, seat_ids: Set[str], ttl: int) -> Reservation:
        seats = self.seats_by_show[show_id]
        for seat_id in seat_ids:
            seat = seats[seat_id]
            if seat.status != "available":
                raise RuntimeError(f"{seat_id} unavailable")
        self._n += 1
        reservation = Reservation(
            f"r{self._n}", show_id, set(seat_ids), "held", self.clock() + ttl
        )
        for seat_id in seat_ids:
            seat = seats[seat_id]
            seat.status = "held"
            seat.reservation_id = reservation.reservation_id
        self.reservations[reservation.reservation_id] = reservation
        return reservation

    def confirm(self, reservation_id: str) -> None:
        reservation = self.reservations[reservation_id]
        if reservation.status != "held":
            raise RuntimeError("not held")
        if self.clock() > reservation.expires_at:
            self._release(reservation)
            raise RuntimeError("expired")
        seats = self.seats_by_show[reservation.show_id]
        for seat_id in reservation.seat_ids:
            seats[seat_id].status = "sold"
        reservation.status = "confirmed"

    def _release(self, reservation: Reservation) -> None:
        seats = self.seats_by_show[reservation.show_id]
        for seat_id in reservation.seat_ids:
            seat = seats[seat_id]
            if seat.reservation_id == reservation.reservation_id:
                seat.status = "available"
                seat.reservation_id = None
        reservation.status = "expired"


if __name__ == "__main__":
    now = [10]
    svc = BookingService({"show1": {"A1": Seat("A1"), "A2": Seat("A2")}}, lambda: now[0])
    held = svc.hold("show1", {"A1"}, ttl=5)
    svc.confirm(held.reservation_id)
    print(svc.seats_by_show["show1"]["A1"].status)`
        },
        callout: {
          tone: 'warning',
          body:
            'Never mark seats sold before payment success unless the business explicitly allows unpaid confirmation.'
        },
        checkYourself: [
          {
            prompt: 'What should confirm do if the hold already expired?',
            reveal:
              'Release inventory if still marked held by this reservation, mark reservation expired, and fail confirmation clearly.'
          }
        ]
      },
      {
        id: 'booking-concurrency',
        heading: 'Concurrency: two patrons, one seat',
        paragraphs: [
          'The signature race is two holds on the same seat. Critical section: check available and mark held. Use a lock per show inventory in memory, or transactional updates in a database with row version checks.',
          'Expiry sweepers add concurrency complexity. A background task releasing expired holds must not release a seat that was confirmed microseconds earlier. Compare reservation ids on the seat before clearing, as the example does.',
          'For library waitlists, promote the next patron only when a copy returns, under the same inventory lock, to avoid promoting two patrons onto one copy.'
        ],
        keyTerms: [
          {
            term: 'Optimistic concurrency',
            definition:
              'Update inventory only if a version or status still matches the expected prior value.'
          },
          {
            term: 'Pessimistic lock',
            definition:
              'Hold a lock on inventory while deciding and writing the reservation.'
          },
          {
            term: 'Expiry sweeper',
            definition:
              'A process that finds timed-out holds and returns resource units to available.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Mention compare-and-swap on seat status as the DB equivalent of your in-memory lock story.'
        },
        checkYourself: [
          {
            prompt: 'Why check seat.reservation_id before expiry release?',
            reveal:
              'To avoid clearing a seat that has already moved to a newer reservation or sold state after the sweeper read the old reservation.'
          }
        ]
      },
      {
        id: 'library-booking-edges',
        heading: 'Edge cases across library and booking flavors',
        paragraphs: [
          'Library edges: renew beyond max renewals, return of unknown copy, fine calculation on holidays, lost book replacement, holds that expire when patron is unreachable. Booking edges: partial seat selection failures, payment capture failure after hold, wheelchair seats constraints, companion seats.',
          'Splitwise edges: deleting an expense after settlement, changing split ratios, users leaving groups with nonzero balances, currency conversion. Prefer append-only ledger corrections over rewriting history.',
          'Always inject Clock for expiry and fines. Always return domain errors instead of None for conflict paths so the UI/API layer can respond consistently.'
        ],
        callout: {
          tone: 'tip',
          body:
            'If the prompt allows either library or booking, pick one and map the other as "same inventory lifecycle, different catalog."'
        },
        checkYourself: [
          {
            prompt: 'How do you handle payment failure after a successful hold?',
            reveal:
              'Leave the reservation held until timeout or explicitly cancel and release seats; do not mark sold. Optionally retry payment against the same reservation id.'
          }
        ]
      },
      {
        id: 'booking-closing-story',
        heading: 'Closing story for the interviewer',
        paragraphs: [
          'Restate: catalog versus inventory, reservation states, single conflict boundary, timeout policy, and payment port. Show tests for double hold, expiry, confirm, and cancel.',
          'Extensions: waitlists, dynamic pricing, recommendation of alternate shows, or group expense settlement algorithms. Each should plug into existing ports rather than rewriting inventory.',
          'If time is nearly up, a correct hold/confirm with a lock beats half-built search facets and notification systems.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Lead with the invariant: a resource unit has at most one active holder at a time.'
        },
        checkYourself: [
          {
            prompt: 'What demo proves the design under time pressure?',
            reveal:
              'Hold two seats, attempt a conflicting hold that fails, confirm the first reservation, and show inventory statuses.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Separate catalog from scarce resource units.',
        'Reservation lifecycle and inventory status must update together.',
        'Holds need timeouts, idempotent confirmations, and a clear conflict boundary.',
        'Concurrency centers on atomic check-and-hold plus safe expiry.'
      ],
      nextSteps: [
        'Implement hold/confirm/cancel with an injected clock.',
        'Add a per-show lock and a conflicting-hold test.',
        'Sketch how a library waitlist uses the same inventory transition rules.'
      ]
    }
  }
};
