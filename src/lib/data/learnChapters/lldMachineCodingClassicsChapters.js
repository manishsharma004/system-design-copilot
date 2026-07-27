/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const lldMachineCodingClassicsChapters = {
  'lld-machine-coding-classics/chess-or-game-system-lab': {
    title: 'Chess and board-game design lab',
    readingTime: '60-75 min',
    premise:
      'Board-game labs reward clean separation of board state, piece movement rules, turn control, and game outcomes. Chess is the usual prompt, but the same architecture serves checkers or simplified chess-like interviews: model the rules as data plus strategies, not as a tangle of conditionals in one GodGame class.',
    parts: [
      {
        id: 'game-requirements-cut',
        heading: 'Cut the game into state, rules, and turns',
        paragraphs: [
          'Confirm scope: full chess, miniature chess, or a smaller board game? Castling, en passant, and underpromotion are common scope trims. Agree on win conditions: checkmate, stalemate, resignation, or first capture for a toy game.',
          'Core use cases: start game, list legal moves for a square, apply a move, detect check/checkmate, switch turns. Spectators, timers, and network play are follow-ups.',
          'Domain sentence: "Game owns a Board and current Player side; MoveValidator uses Piece strategies to accept or reject a Move; applying a move updates Board and advances turn."'
        ],
        keyTerms: [
          {
            term: 'Board state',
            definition:
              'The placement of pieces and any side-to-move or castling rights needed to evaluate legality.'
          },
          {
            term: 'Legal move generation',
            definition:
              'The process of enumerating moves a side may make under the rules, including checks.'
          },
          {
            term: 'Turn control',
            definition:
              'The mechanism that ensures only the active side can move and that outcomes are evaluated after each ply.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Ask which advanced chess rules are in scope before coding bishops. Scope control is part of the grade.'
        },
        checkYourself: [
          {
            prompt: 'What is the smallest demo that still proves an architecture?',
            reveal:
              'Place a few pieces, list legal moves for one piece, apply a move, reject an illegal move, and switch turns.'
          }
        ]
      },
      {
        id: 'chess-class-diagram',
        heading: 'Class diagram in prose',
        paragraphs: [
          'Board stores an 8x8 grid or map of square to Piece. Piece has color and type, and delegates movement patterns to a MovementRule strategy. Move holds from, to, optional promotion. Game holds board, side to move, history, and status. CheckDetector queries board geometry for attacks. Command-style MoveApplication can support undo via history.',
          'Inheritance for piece types is fine if kept shallow; composition with movement strategies often scales better when pieces share sliding logic. Sliding pieces (bishop, rook, queen) share ray generation; knights and kings differ.',
          'Relationships: Game uses Board, uses rules services; Board has Pieces; MoveValidator uses Piece rules and CheckDetector. Keep UI/renderer outside Game.'
        ],
        keyTerms: [
          {
            term: 'Movement rule',
            definition:
              'A strategy that proposes candidate destination squares for a piece type ignoring or including blocking.'
          },
          {
            term: 'Attack map',
            definition:
              'The set of squares a side could capture on, used for check detection and castling rights.'
          },
          {
            term: 'Move history',
            definition:
              'An ordered list of applied moves enabling undo, replay, and threefold-repetition follow-ups.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Draw Board, Piece, Move, Game, and Validator. Mention sliding-ray reuse for bishop/rook/queen.'
        },
        checkYourself: [
          {
            prompt: 'Why not put all legality checks inside Piece subclasses only?',
            reveal:
              'Pieces do not know about absolute pins and check. Game-level validation must ensure the mover\'s king is safe after the move.'
          }
        ]
      },
      {
        id: 'move-pipeline',
        heading: 'The move pipeline and iteration strategy',
        paragraphs: [
          'Iterate: (1) board + place pieces, (2) generate pseudo-legal moves ignoring check, (3) apply moves with capture, (4) filter moves that leave king in check, (5) add special moves if in scope. This order keeps each demo valuable.',
          'Pseudo-legal versus legal is a key distinction. Pseudo-legal follows piece geometry and blocking. Legal also requires the moving side\'s king not be in check afterward. Implement by trying the move on a copy or with undo.',
          'Represent squares as (row, col) or algebraic strings consistently. Convert at the edges. Inconsistent square types create subtle bugs mid-interview.'
        ],
        workedExample: {
          title: 'Sliding ray generation for a rook',
          body: 'Candidate moves stop at board edge or after capturing an enemy; friendly occupation blocks without capture.',
          language: 'python',
          code: `from typing import Iterable, Optional


def in_bounds(r: int, c: int) -> bool:
    return 0 <= r < 8 and 0 <= c < 8


def rook_rays(board: list[list[Optional[str]]], r: int, c: int, me: str) -> list[tuple[int, int]]:
    """board cells hold None, 'W*', or 'B*' piece codes; me is 'W' or 'B'."""
    moves = []
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        while in_bounds(nr, nc):
            cell = board[nr][nc]
            if cell is None:
                moves.append((nr, nc))
            else:
                if cell[0] != me:
                    moves.append((nr, nc))
                break
            nr += dr
            nc += dc
    return moves


if __name__ == "__main__":
    board = [[None] * 8 for _ in range(8)]
    board[0][0] = "WR"
    board[0][3] = "BP"
    print(rook_rays(board, 0, 0, "W"))`
        },
        callout: {
          tone: 'tip',
          body:
            'Share ray helpers across rook and bishop; queen concatenates both direction sets.'
        },
        checkYourself: [
          {
            prompt: 'How do you validate that a move does not leave your king in check?',
            reveal:
              'Apply the move to a copy (or undoable board), generate opponent attack set or scan for king safety, reject if king is attacked, then revert if using undo.'
          }
        ]
      },
      {
        id: 'game-concurrency-and-integrity',
        heading: 'Concurrency, integrity, and multiplayer follow-ups',
        paragraphs: [
          'Local games are single-threaded, but online chess follow-ups appear. Serialize move attempts per game id so two players cannot apply concurrent moves. Idempotent move submission with ply numbers rejects stale moves.',
          'Integrity invariants: one piece per square, side to move alternates after successful moves, captured pieces leave the board, and game status becomes terminal exactly once.',
          'Clocks and draw offers are additional state machines. Keep them beside Game as collaborators rather than stuffing timers into Piece.'
        ],
        keyTerms: [
          {
            term: 'Ply',
            definition:
              'One side\'s move; useful as a version number for optimistic concurrency on a game.'
          },
          {
            term: 'Terminal status',
            definition:
              'A finished outcome such as checkmate, stalemate, draw, or resignation that rejects further moves.'
          },
          {
            term: 'Stale move',
            definition:
              'A submitted move that does not match the current ply or side to move.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Never mutate the board before legality checks without a clear undo path; failed moves must not leak state.'
        },
        checkYourself: [
          {
            prompt: 'What is a good concurrency key for an online chess service?',
            reveal:
              'Per-game lock or transactional compare on ply number so only one legal transition applies at a time.'
          }
        ]
      },
      {
        id: 'chess-edge-cases',
        heading: 'Edge cases interviewers probe',
        paragraphs: [
          'Pinned pieces, discovered check, castling through check, en passant capture squares, promotion choice, and insufficient material draws are classic. Even if out of scope, naming them shows chess literacy and risk awareness.',
          'For toy scopes, explicitly list unsupported rules in comments so the interviewer does not assume bugs.',
          'Testing: table-driven cases for each piece, plus a king-in-check filter case, plus an illegal out-of-turn move. FEN parsing is optional polish for loading positions quickly.'
        ],
        callout: {
          tone: 'interview',
          body:
            'If castling is out of scope, say so and spend time on check-safe legal move filtering—the harder design point.'
        },
        checkYourself: [
          {
            prompt: 'Why is generating moves that ignore pins incomplete?',
            reveal:
              'A pinned piece may have geometric moves that expose the king. Legal generation must filter those away.'
          }
        ]
      },
      {
        id: 'chess-closing',
        heading: 'Narrating the game architecture',
        paragraphs: [
          'Close with responsibilities: Board stores, Piece rules propose, Validator filters, Game applies and advances. Mention undo via history for analysis mode.',
          'Extensions: AI minimax on the same move generator, PGN export, multiplayer transport. Each consumes the same legal-move API.',
          'Strong finish: run a two-move demo that rejects an illegal king exposure.'
        ],
        callout: {
          tone: 'interview',
          body:
            'The legal-move API is your product surface. Design it carefully and everything else plugs in.'
        },
        checkYourself: [
          {
            prompt: 'What API method best centers the design?',
            reveal:
              'Something like legal_moves(square) / apply(move) on Game, backed by board + validators.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Separate board state, movement strategies, legality filtering, and turn control.',
        'Generate pseudo-legal moves first, then filter for king safety.',
        'Share sliding-ray logic; keep special rules explicitly in or out of scope.',
        'Serialize multiplayer move application by game and ply.'
      ],
      nextSteps: [
        'Implement rook/bishop rays and a knight L-shape helper.',
        'Add apply/undo and filter moves that leave the king attacked.',
        'Write tests for out-of-turn moves and a simple check scenario.'
      ]
    }
  },

  'lld-machine-coding-classics/atm-or-vending-machine-lab': {
    title: 'ATM and vending machine design lab',
    readingTime: '60-75 min',
    premise:
      'ATM and vending machine problems are state-machine labs with inventory and cash. Interviewers look for explicit states, guarded transitions, and careful handling of money and stock under failure—cancel mid-flow, insufficient cash, jammed dispensers.',
    parts: [
      {
        id: 'state-machine-first',
        heading: 'State machine first, hardware second',
        paragraphs: [
          'Agree on the device: ATM (card auth, PIN, withdraw/deposit/balance) or vending (select item, accept money, dispense, change). Both are modal: certain operations are legal only in certain states.',
          'Name states early: Idle, CardInserted, Authenticated, SelectionMade, Dispensing, OutOfService. Transitions happen on events: insert_card, enter_pin, choose_amount, cancel, take_cash.',
          'Domain sentence: "DeviceContext holds State; each State accepts events and returns the next State after updating CashInventory or ProductInventory through ports."'
        ],
        keyTerms: [
          {
            term: 'State machine',
            definition:
              'A model where behavior and allowed operations depend on an explicit current state and events.'
          },
          {
            term: 'Guarded transition',
            definition:
              'A state change allowed only when a condition holds, such as PIN match or sufficient balance.'
          },
          {
            term: 'Session',
            definition:
              'The transient ATM interaction bound to an inserted card until eject or timeout.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Draw the state bubble diagram before coding. It prevents a forest of boolean flags.'
        },
        checkYourself: [
          {
            prompt: 'Why are boolean flags like hasCard and isAuthenticated weaker than states?',
            reveal:
              'Flag combinations explode and allow impossible modes. Explicit states make illegal events obvious to reject.'
          }
        ]
      },
      {
        id: 'atm-vending-class-diagram',
        heading: 'Class diagram in prose',
        paragraphs: [
          'For ATM: AtmContext, State implementations, CardReader port, BankService port, CashDispenser, ReceiptPrinter. Session holds card token and auth status. Withdrawal command validates amount against bank and dispenser denominations.',
          'For vending: VendingMachine context, states, ProductCatalog, CoinBox/CashBox, Dispenser. Product has code, price, stock. CashBox tracks inserted amount and available change denominations.',
          'Shared idea: hardware ports are adapters; core state logic depends on ports. Inventory mutations sit behind methods with clear success/failure.'
        ],
        keyTerms: [
          {
            term: 'Cash inventory',
            definition:
              'Counts of bills or coins available for dispensing change or withdrawals.'
          },
          {
            term: 'Denomination planner',
            definition:
              'Algorithm that picks notes/coins to meet an amount under inventory constraints.'
          },
          {
            term: 'Hardware port',
            definition:
              'Interface for card reader, dispenser, or bank authorization, replaceable in tests.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Say: "States own transitions; dispenser and bank are ports. I can fake both."'
        },
        checkYourself: [
          {
            prompt: 'Where should PIN verification live?',
            reveal:
              'Behind a BankService or AuthService port called from an Authenticate state—not hard-coded inside the context with plaintext comparisons scattered around.'
          }
        ]
      },
      {
        id: 'money-and-inventory-flows',
        heading: 'Money and inventory flows',
        paragraphs: [
          'Iteration: idle→select→insert money→dispense for vending; or idle→card→pin→withdraw for ATM. Get one success path green, then add cancel and failure paths.',
          'Money needs integer cents, not floats. Change-making should be deterministic and fail if exact change cannot be made under policy. Decide whether the machine accepts the transaction without change or rejects.',
          'Transaction atomicity: do not dispense product before committing payment logic, and do not keep money if dispense fails. Sketch compensating steps: refund inserted cash, roll back stock decrement.'
        ],
        workedExample: {
          title: 'Vending selection with inserted cents',
          body: 'A compact context showing payment check, stock decrement, and change return using integer cents.',
          language: 'python',
          code: `from dataclasses import dataclass


@dataclass
class Product:
    code: str
    price_cents: int
    stock: int


class VendingMachine:
    def __init__(self, products: dict[str, Product]) -> None:
        self.products = products
        self.inserted = 0
        self.selected = None

    def insert(self, cents: int) -> None:
        if cents <= 0:
            raise ValueError("invalid coin")
        self.inserted += cents

    def select(self, code: str) -> None:
        product = self.products[code]
        if product.stock <= 0:
            raise RuntimeError("sold out")
        self.selected = code

    def confirm(self) -> int:
        if not self.selected:
            raise RuntimeError("no selection")
        product = self.products[self.selected]
        if self.inserted < product.price_cents:
            raise RuntimeError("insufficient funds")
        product.stock -= 1
        change = self.inserted - product.price_cents
        self.inserted = 0
        self.selected = None
        return change


if __name__ == "__main__":
    vm = VendingMachine({"A1": Product("A1", 125, 2)})
    vm.insert(100)
    vm.insert(50)
    vm.select("A1")
    print("change", vm.confirm())`
        },
        callout: {
          tone: 'warning',
          body:
            'If confirm decrements stock before verifying funds, failures leave inventory wrong. Order the checks.'
        },
        checkYourself: [
          {
            prompt: 'What should happen if dispense hardware fails after charging?',
            reveal:
              'Compensating action: refund or credit the user and restore stock. Mention a failure state and operator alert in the design.'
          }
        ]
      },
      {
        id: 'atm-concurrency',
        heading: 'Concurrency and shared vaults',
        paragraphs: [
          'A single machine is mostly session-serial: one card session at a time. Still protect cash inventory if maintenance threads reload cassettes concurrently.',
          'Bank authorization is remote—use idempotency keys on withdraw requests so retries do not double-post. The ATM should store a withdrawal request id for the session.',
          'Multi-ATM systems share accounts, not cassettes. Emphasize that machine cash and account balance are different ledgers that must both succeed or roll back logically.'
        ],
        keyTerms: [
          {
            term: 'Idempotency key',
            definition:
              'A client-generated token that lets the bank ignore duplicate withdrawal submissions.'
          },
          {
            term: 'Cassette',
            definition:
              'A physical cash container with denomination counts inside the dispenser inventory.'
          },
          {
            term: 'Session serialization',
            definition:
              'Allowing only one active customer session on a device to simplify state.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Separate device cash inventory from bank account balance—two resources, one user-facing withdrawal.'
        },
        checkYourself: [
          {
            prompt: 'Why can a successful bank debit plus failed dispense occur?',
            reveal:
              'They are separate systems. Design needs a reconciliation or auto-reversal path, not a single local transaction across the network.'
          }
        ]
      },
      {
        id: 'atm-vending-edges',
        heading: 'Edge cases and abuse paths',
        paragraphs: [
          'Cancel at every state, timeout ejecting cards, wrong PIN retries with lockout, oversize withdrawals, exact-change-only mode, invalid product codes, and power loss mid-dispense. Decide policies and encode them as transitions to SafeIdle or OutOfService.',
          'Vending: bill acceptors that jam, coin return empty, multiple selection changes before confirm. ATM: card forgotten, receipt printer paper out (often non-fatal).',
          'Tests should drive the state machine with event sequences, asserting state name and inventories after each sequence.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Table-drive event sequences: given Idle + insert_card => CardInserted. It is living documentation.'
        },
        checkYourself: [
          {
            prompt: 'How do you model PIN retry lockout?',
            reveal:
              'Count failures on the session or card profile; on threshold, transition to Locked and refuse auth until operator reset or cooldown.'
          }
        ]
      },
      {
        id: 'atm-vending-close',
        heading: 'Closing narrative',
        paragraphs: [
          'Restate states, ports, money as integers, and compensating actions on partial failure. Show cancel from mid-flow returning money and clearing selection.',
          'Extensions: admin restock mode, telemetry events, multilingual UI. They hang off the context without rewriting the machine.',
          'Pick ATM or vending and go deep; do not half-build both unless asked.'
        ],
        callout: {
          tone: 'interview',
          body:
            'A crisp state diagram plus one failure-path demo beats a feature-complete happy path only.'
        },
        checkYourself: [
          {
            prompt: 'What invariant matters most for vending?',
            reveal:
              'Stock and cash never go negative, and users either receive product+correct change or get their money back.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'ATM/vending labs are state machines with inventory and cash ports.',
        'Use integer money, guarded transitions, and compensating actions on partial failure.',
        'Serialize device sessions; idempotent bank calls protect against retries.',
        'Test with event-sequence tables across success, cancel, and failure paths.'
      ],
      nextSteps: [
        'Draw states for your chosen device and implement two transitions.',
        'Add insufficient funds and sold-out rejections.',
        'Simulate dispenser failure and a refund path.'
      ]
    }
  },

  'lld-machine-coding-classics/movie-ticket-or-splitwise-lab': {
    title: 'Movie booking and Splitwise design lab',
    readingTime: '60-75 min',
    premise:
      'Movie ticket booking and Splitwise-style expense sharing look different but share LLD muscles: consistent ledgers, conflict-safe updates, and clear aggregate boundaries. One allocates seats under time pressure; the other allocates balances among people with auditability.',
    parts: [
      {
        id: 'pick-flavor-and-invariants',
        heading: 'Pick a flavor and lock invariants',
        paragraphs: [
          'For movie booking invariants: a seat in a show is owned by at most one confirmed reservation; holds expire; payments confirm holds. For Splitwise: every expense\'s participant shares sum to the total; balances are derived from ledger entries; deletions are compensating entries, not silent erasures.',
          'Clarify actors and flows before classes. Booking: browse shows, hold seats, pay, cancel. Splitwise: create group, add expense, show balances, settle up.',
          'Domain sentences help. Booking: "ShowInventory reserves seats for a Hold that Payment may promote to Ticket." Splitwise: "Ledger records Expenses and Settlements that adjust Member balances inside a Group."'
        ],
        keyTerms: [
          {
            term: 'Aggregate boundary',
            definition:
              'The cluster of objects updated together for consistency, such as a show\'s seat map or a group ledger.'
          },
          {
            term: 'Derived balance',
            definition:
              'A member balance computed from ledger entries rather than edited as a free-floating number.'
          },
          {
            term: 'Settlement',
            definition:
              'A payment between members that reduces outstanding net balances.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'State the invariant in one sentence and keep pointing back to it when adding features.'
        },
        checkYourself: [
          {
            prompt: 'Why should Splitwise balances be derived?',
            reveal:
              'So edits and deletes can be audited through ledger entries. Hand-editing a balance invites drift from expense history.'
          }
        ]
      },
      {
        id: 'movie-splitwise-diagrams',
        heading: 'Class diagrams in prose for both flavors',
        paragraphs: [
          'Movie: Movie, Show (time, screen), Seat, Hold, Ticket, PaymentPort, BookingService. Seat status lives per show. BookingService owns conflict checks.',
          'Splitwise: User, Group, GroupMember, Expense (amount, payer, split rules), ExpenseShare, LedgerEntry, Settlement, BalanceQuery service. Split strategies: equal, exact, percent.',
          'Shared structural idea: a service orchestrates; strategies encapsulate variable policy (seat selection or split math); repositories or in-memory stores persist aggregates.'
        ],
        keyTerms: [
          {
            term: 'Split strategy',
            definition:
              'A policy that turns an expense total into per-member shares that sum exactly.'
          },
          {
            term: 'Hold',
            definition:
              'Temporary seat ownership before payment confirmation in booking systems.'
          },
          {
            term: 'Netting',
            definition:
              'Reducing pairwise debts into fewer settlement payments.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'For Splitwise, draw Expense → Shares → LedgerEntries → Balance view. For booking, draw Show → Seats → Hold → Ticket.'
        },
        checkYourself: [
          {
            prompt: 'Where does screen layout belong?',
            reveal:
              'With the Show or Screen inventory, not on Movie. The same movie screening in two theaters has different seats.'
          }
        ]
      },
      {
        id: 'algorithms-that-matter',
        heading: 'Algorithms that matter under the design',
        paragraphs: [
          'Booking algorithms: seat search under constraints, hold expiry sweeps, optional best-together seat suggestions. Keep them behind interfaces.',
          'Splitwise algorithms: validate shares sum, compute nets, simplify debts (greedy settle). Start with pairwise nets; simplification can be a follow-up strategy.',
          'Iteration: booking—hold/confirm first; Splitwise—add expense and balances first. Payments and fancy netting come next.'
        ],
        workedExample: {
          title: 'Equal split with remainder cents',
          body: 'Equal splits must allocate leftover cents deterministically so shares sum to the total.',
          language: 'python',
          code: `from dataclasses import dataclass


@dataclass(frozen=True)
class Share:
    user_id: str
    amount_cents: int


def equal_split(total_cents: int, user_ids: list[str]) -> list[Share]:
    if not user_ids:
        raise ValueError("no users")
    n = len(user_ids)
    base, rem = divmod(total_cents, n)
    shares = []
    for i, user_id in enumerate(user_ids):
        extra = 1 if i < rem else 0
        shares.append(Share(user_id, base + extra))
    assert sum(s.amount_cents for s in shares) == total_cents
    return shares


def nets(shares: list[Share], payer_id: str) -> dict[str, int]:
    """Positive means other user owes payer."""
    balance = {s.user_id: 0 for s in shares}
    for s in shares:
        balance[s.user_id] -= s.amount_cents
    balance[payer_id] += sum(s.amount_cents for s in shares)
    return balance


if __name__ == "__main__":
    shares = equal_split(100, ["a", "b", "c"])
    print(shares)
    print(nets(shares, payer_id="a"))`
        },
        callout: {
          tone: 'warning',
          body:
            'Never use floating money. Remainder cents in equal split are a classic off-by-one interview trap.'
        },
        checkYourself: [
          {
            prompt: 'How do you ensure percent splits remain consistent?',
            reveal:
              'Compute amounts in integer cents with a deterministic remainder rule and assert the sum equals the expense total before committing ledger entries.'
          }
        ]
      },
      {
        id: 'conflicts-and-concurrency-classics',
        heading: 'Conflicts and concurrency',
        paragraphs: [
          'Booking concurrency is seat double-hold. Use per-show locks or conditional updates on seat version/status. Expiry workers must compare reservation ids before release.',
          'Splitwise concurrency is concurrent expense edits in a group. Serialize per group ledger or use append-only entries with monotonic ids. Avoid updating a single mutable balance row without versioning.',
          'Idempotency: booking payment retries use hold id; Splitwise clients use expense UUID so duplicate posts do not double-charge friendships.'
        ],
        keyTerms: [
          {
            term: 'Append-only ledger',
            definition:
              'A log of balance-affecting events where corrections are new entries rather than in-place edits.'
          },
          {
            term: 'Conditional update',
            definition:
              'A write that succeeds only if inventory status still matches an expected prior value.'
          },
          {
            term: 'Group serialization',
            definition:
              'Processing ledger mutations for a group sequentially to preserve invariants.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Map booking races to seat status CAS; map Splitwise races to per-group ledger append serialization.'
        },
        checkYourself: [
          {
            prompt: 'How should expense deletion work in an append-only ledger?',
            reveal:
              'Write compensating entries that reverse the original shares, preserving history instead of removing the past.'
          }
        ]
      },
      {
        id: 'movie-splitwise-edges',
        heading: 'Edge cases across both prompts',
        paragraphs: [
          'Booking: wheelchair seats, adult-only shows, partial payment failure, overbooking prevention after clock skew on expiry, refund policies.',
          'Splitwise: users leaving with nonzero balance, multi-currency, shared expenses with excluded members, rounding disputes, settle-up that does not match simplified nets.',
          'Always inject Clock for holds and interest-free timeouts. Always validate invariants before commit and assert them in tests after commit.'
        ],
        callout: {
          tone: 'tip',
          body:
            'If the prompt allows either system, choose one, state invariants, and mention the other as a sibling ledger/inventory problem.'
        },
        checkYourself: [
          {
            prompt: 'What is a booking analogue to Splitwise compensating entries?',
            reveal:
              'Cancellation and refund records that reference the original ticket rather than silently deleting the ticket row.'
          }
        ]
      },
      {
        id: 'movie-splitwise-close',
        heading: 'Closing the classic lab well',
        paragraphs: [
          'Demo the invariant: conflicting seat hold fails; or shares sum and balances update. Show one failure path. Name the next extension you would add with more time.',
          'Connect to broader LLD: strategies for splits/pricing, state for holds/tickets, DI for payment and clock seams.',
          'Resist building social features or recommendation engines before the ledger/inventory core is trustworthy.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Invariants + one concurrency story + one test list is a complete closing for these classics.'
        },
        checkYourself: [
          {
            prompt: 'What tests prove Splitwise equal split?',
            reveal:
              'Sum of shares equals total for totals not divisible by n, and payer nets equal the sum of others\' debts.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Booking and Splitwise both need strong invariants and ledger/inventory discipline.',
        'Use strategies for seat policies or split math; keep orchestrators thin.',
        'Handle concurrency with CAS/locks on seats or serialized append-only group ledgers.',
        'Integer money and deterministic remainders are non-negotiable.'
      ],
      nextSteps: [
        'Implement equal_split with remainder distribution and tests.',
        'Build hold/confirm for a single show with a conflict test.',
        'Sketch compensating cancellation or expense reversal entries.'
      ]
    }
  }
};
