/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldDistributedSystemsLabChapters = {
  "distributed-systems-lab/partitioning-and-hot-key-control": {
    "title": "Workshop: Partitioning and hot-key control",
    "readingTime": "75-95 min",
    "premise": "Partitions scale throughput only when keys distribute work and locality of transactions. This lab designs partition keys, detects and tames hot keys, plans rebalancing, and connects partitioning to blast radius.",
    "parts": [
      {
        "id": "partition-goals",
        "heading": "State what partitioning must optimize",
        "paragraphs": [
          "Partitioning spreads load, localizes transactions, and limits failure domains. Those goals conflict: a key perfect for even load may split a transactional group; a key perfect for locality may create celebrity hotspots. Write the goals for your workload before picking a key.",
          "Ask which operations must be single-partition and which can be scatter-gather. Cross-partition transactions are expensive or approximate; design APIs that avoid them on the critical path when possible.",
          "Workshop: for a chat system, compare partitioning by user, by conversation, and by time bucket—name wins and losses for each."
        ],
        "keyTerms": [
          {
            "term": "Partition key",
            "definition": "The attribute that determines which shard owns a record."
          },
          {
            "term": "Scatter-gather",
            "definition": "A query that fans out across many partitions and merges results."
          },
          {
            "term": "Locality",
            "definition": "Keeping related data and operations on the same partition to avoid distributed coordination."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If you cannot name the primary operation you are localizing, you are not ready to choose a key."
        },
        "checkYourself": [
          {
            "prompt": "Why are cross-partition transactions a design smell on hot paths?",
            "reveal": "They require distributed coordination, increase latency and failure modes, and often indicate the key does not match the workload's natural boundaries."
          }
        ]
      },
      {
        "id": "hot-key-phenomena",
        "heading": "Recognize hot keys and skewed workloads",
        "paragraphs": [
          "Hot keys arise from celebrities, flash sales, viral posts, or coarse keys like a boolean status. One partition then owns disproportionate QPS, locks, or storage. Averages across the cluster look fine while that shard melts.",
          "Detect with per-partition QPS, lock wait, cache hit skew, and top-key metrics sampled carefully to avoid cardinality explosions. Load tests with uniform keys will miss the bug.",
          "Lab: invent a skewed key distribution (Zipf) and show how p99 diverges from average utilization."
        ],
        "workedExample": {
          "title": "Skew intuition with Zipf-like weights",
          "body": "Show how a tiny fraction of keys can dominate request volume.",
          "code": "import numpy as np\nn_keys = 10_000\n# Zipf-like: weight ~ 1/rank\nranks = np.arange(1, n_keys + 1)\nweights = 1.0 / ranks\nprobs = weights / weights.sum()\ntop10 = probs[:10].sum()\ntop100 = probs[:100].sum()\nprint(f\"top 10 keys traffic share: {top10:.1%}\")\nprint(f\"top 100 keys traffic share: {top100:.1%}\")\n# Uniform assumption would give each key 0.01% — wildly optimistic for viral keys\n",
          "language": "python"
        },
        "callout": {
          "tone": "warning",
          "body": "Uniform load tests greenwash hot-key failures."
        },
        "checkYourself": [
          {
            "prompt": "What metrics reveal a hot partition when cluster averages look healthy?",
            "reveal": "Per-partition QPS, CPU, lock waits, and queue depth—especially the hottest partition's p99 versus the median partition."
          }
        ]
      },
      {
        "id": "hot-key-controls",
        "heading": "Apply hot-key control techniques",
        "paragraphs": [
          "Techniques include key salting/sharding a logical key across N physical buckets, write buffering and aggregation for counters, caching popular reads, request coalescing, rate limits per key, and isolating celebrity tenants on dedicated partitions.",
          "Each technique changes consistency or UX: salted keys complicate range reads; eventual counters lag; caches need invalidation. Pick controls that match the user promise.",
          "Workshop: for a viral post like-counter, design a control set and state the consistency sentence users will see."
        ],
        "keyTerms": [
          {
            "term": "Salting / bucketing",
            "definition": "Splitting one logical key across multiple physical partitions to spread load."
          },
          {
            "term": "Write aggregation",
            "definition": "Batching or combining updates to reduce per-event write amplification on hot keys."
          },
          {
            "term": "Celebrity partition",
            "definition": "A dedicated shard for known ultra-hot entities."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Pair each hot-key fix with the query patterns it breaks."
        },
        "checkYourself": [
          {
            "prompt": "What does salting a hot key usually cost?",
            "reveal": "Reads and range queries may need scatter-gather across buckets, and transactions spanning the logical entity become harder."
          }
        ]
      },
      {
        "id": "rebalancing-without-pain",
        "heading": "Rebalance partitions without surprising users",
        "paragraphs": [
          "As data grows, splits and moves are inevitable. Use routing indirection, dual reads during moves, throttled backfills, and parity checks. Avoid designs where clients hardcode shard numbers.",
          "Plan for partial failure mid-move: idempotent copy steps, clear ownership epochs, and fencing so two shards do not both accept writes.",
          "Lab: outline moving one hot tenant to a dedicated cell with zero client API changes."
        ],
        "callout": {
          "tone": "tip",
          "body": "Routing tables and indirection are capacity features, not optional elegance."
        },
        "checkYourself": [
          {
            "prompt": "What happens if two shards accept writes for the same key during a move?",
            "reveal": "Split brain: divergent versions that require complex reconciliation and may violate user-visible invariants."
          }
        ]
      },
      {
        "id": "partitioning-and-blast-radius",
        "heading": "Connect partitions to blast radius",
        "paragraphs": [
          "Cells and partitions contain failures only if shared dependencies do not reunite them. A shared global cache or single Kafka cluster can reintroduce coupling. Draw the real failure domain, not the ideal box diagram.",
          "Noisy-neighbor tenants deserve quotas aligned with partition boundaries. Quotas without isolation still let one tenant heat a shared shard.",
          "Workshop: critique a design where ten cells share one Redis; propose isolation tiers."
        ],
        "callout": {
          "tone": "warning",
          "body": "Partitioning compute while sharing a single bottleneck store is cosplay isolation."
        },
        "checkYourself": [
          {
            "prompt": "How can shared dependencies defeat cell isolation?",
            "reveal": "If all cells rely on one global dependency, its failure or overload impacts every cell regardless of data partitioning."
          }
        ]
      },
      {
        "id": "partitioning-review",
        "heading": "Lab closeout: partitioning design review",
        "paragraphs": [
          "Present goals, key choice, hot-key detections and controls, rebalancing plan, and residual shared dependencies. Show a skewed load-test plan.",
          "Tie to SLOs: per-partition saturation alerts beat fleet averages.",
          "Success: you can explain what happens when one key goes 100× hotter overnight."
        ],
        "callout": {
          "tone": "interview",
          "body": "Walk the incident: viral key → hot shard → controls → user-visible consistency impact."
        },
        "checkYourself": [
          {
            "prompt": "What alert would you add after choosing a partition key?",
            "reveal": "Hot-partition saturation and top-key QPS skew alerts with runbooks for salting, caching, or tenant isolation."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Partition keys must state load, locality, and failure goals explicitly.",
        "Hot keys are expected; detect skew and test with realistic distributions.",
        "Controls like salting and aggregation trade query simplicity for spread.",
        "Rebalancing needs indirection, fencing, and parity.",
        "Shared dependencies can erase partition blast-radius gains."
      ],
      "nextSteps": [
        "Compare three partition keys for one workload with trade-offs.",
        "Design a hot-key control for a viral counter.",
        "Write a tenant move plan with routing indirection."
      ]
    }
  },
  "distributed-systems-lab/consensus-quorums-and-leadership": {
    "title": "Workshop: Consensus, quorums, and leadership",
    "readingTime": "80-100 min",
    "premise": "Coordination protocols exist to make disagreement impossible enough for your invariants. This lab builds intuition for quorums, leader election, fencing, and when to avoid consensus on the user critical path.",
    "parts": [
      {
        "id": "why-coordinate",
        "heading": "Name the invariant that needs coordination",
        "paragraphs": [
          "Consensus and leader election are tools for specific invariants: single writer for a shard, linearizable configuration, exclusive lock ownership, or agreeing on membership. If your workflow tolerates concurrent divergent writes with later merge, you may not need them on the hot path.",
          "Cost is latency, availability during partitions, and operational complexity. Use coordination narrowly around the smallest critical section.",
          "Workshop: list five operations in a collaborative editor and mark which need consensus-strength agreement versus CRDT-style merge."
        ],
        "keyTerms": [
          {
            "term": "Consensus",
            "definition": "Protocol for nodes to agree on a value despite failures."
          },
          {
            "term": "Quorum",
            "definition": "A subset size large enough that any two such subsets intersect, preventing split decisions."
          },
          {
            "term": "Leader",
            "definition": "A designated coordinator for a term that serializes decisions."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Start from the invariant, not from 'we should use Raft.'"
        },
        "checkYourself": [
          {
            "prompt": "When is leader election unnecessary?",
            "reveal": "When concurrent writes can be merged safely, or when a single primary already exists with clear failover owned elsewhere, or when the operation is read-only with acceptable staleness."
          }
        ]
      },
      {
        "id": "quorum-intersection",
        "heading": "Use quorum intersection as the core mental model",
        "paragraphs": [
          "If writes require W nodes and reads require R nodes in a cluster of N with W+R > N, read and write quorums intersect, so a read should see the latest durable write under common assumptions. Variants exist for latency and durability tradeoffs.",
          "During failures, missing quorum means blocking or degrading. That is the availability cost of stronger guarantees. Design client timeouts and backoff accordingly.",
          "Lab math: for N=5, compare (W=3,R=3) versus (W=5,R=1) for durability, read latency, and failure tolerance."
        ],
        "workedExample": {
          "title": "Quorum worksheet",
          "body": "Relate N, W, R to intersection and failure tolerance.",
          "code": "def ok(n, w, r):\n    return w + r > n\n\nconfigs = [\n    (5, 3, 3),  # typical majority\n    (5, 5, 1),  # durable write, cheap read, write fragile\n    (5, 1, 5),  # opposite\n    (3, 2, 2),\n]\nfor n, w, r in configs:\n    print(f\"N={n} W={w} R={r} intersect={ok(n,w,r)} \"\n          f\"write_tolerates={n-w} node loss before write blocks\")\n",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Draw two overlapping quorums and explain why intersection prevents silent divergence."
        },
        "checkYourself": [
          {
            "prompt": "Why does W+R > N matter?",
            "reveal": "It guarantees any read quorum shares at least one node with any write quorum, so the read can observe the latest write under the model's assumptions."
          }
        ]
      },
      {
        "id": "leadership-and-fencing",
        "heading": "Leaders need fencing, not just election",
        "paragraphs": [
          "Electing a leader is insufficient if a partitioned old leader continues to accept writes. Fencing tokens, epoch numbers, or lease mechanisms ensure storage and peers reject stale leaders.",
          "Leases need careful time assumptions; prefer designs where storage validates tokens on every write. Split-brain without fencing is a classic outage class.",
          "Workshop: sketch leader failover for a shard with a monotonically increasing epoch checked by the data plane."
        ],
        "keyTerms": [
          {
            "term": "Fencing token",
            "definition": "A monotonically increasing capability that invalidates old leaders."
          },
          {
            "term": "Lease",
            "definition": "Time-bounded leadership that must be renewed; sensitive to clock assumptions."
          },
          {
            "term": "Split brain",
            "definition": "Two nodes both believing they are primary and accepting writes."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A failover demo that never checks fencing has not proven safety."
        },
        "checkYourself": [
          {
            "prompt": "What should a datastore do when it sees a write with an old epoch?",
            "reveal": "Reject it so a demoted leader cannot corrupt state after a new leader has been chosen."
          }
        ]
      },
      {
        "id": "raft-intuition-without-mythology",
        "heading": "Build Raft/Paxos intuition without mythology",
        "paragraphs": [
          "Log replication protocols serialize client operations into an ordered log, replicate to a majority, then commit. Followers apply committed entries. Leadership changes carry terms to prevent stale authority.",
          "You rarely implement Raft in an interview system design; you choose systems that embed it (etcd, Consul, ZooKeeper, Spanner's coordination) and keep your app's critical section small.",
          "Lab: identify which of your metadata operations belong in a coordination service versus ordinary datastore writes."
        ],
        "callout": {
          "tone": "tip",
          "body": "Put cluster membership and config in consensus; keep high-QPS user data on partitioned stores with weaker or localized coordination."
        },
        "checkYourself": [
          {
            "prompt": "Why not put all user data through a single Raft group?",
            "reveal": "Throughput and latency hit a single serialized bottleneck; consensus groups do not scale like partitioned data stores."
          }
        ]
      },
      {
        "id": "partitions-and-cap-practicality",
        "heading": "Be practical about partitions and tradeoffs",
        "paragraphs": [
          "Network partitions force choices between serving possibly stale or conflicting answers and refusing requests. The useful design move is shrinking the blast radius needing strong agreement and offering degradation elsewhere.",
          "Client libraries need idempotent retries, backoff, and clear errors when quorum is lost—retries without fencing can worsen split scenarios.",
          "Workshop: write user-visible behavior for 'quorum lost on config service' versus 'replica lag high on read pool.'"
        ],
        "callout": {
          "tone": "interview",
          "body": "Avoid CAP slogans; describe the concrete user impact when a quorum cannot form."
        },
        "checkYourself": [
          {
            "prompt": "What should a client do when writes fail due to lost quorum?",
            "reveal": "Surface a retryable error with backoff, avoid inventing success, and do not fail over to a path that skips durability requirements for that invariant."
          }
        ]
      },
      {
        "id": "coordination-review",
        "heading": "Lab closeout: coordination design review",
        "paragraphs": [
          "Present invariants needing coordination, quorum settings, fencing design, placement of consensus-backed metadata, and degradation when quorum is lost.",
          "Connect to operations: measure leader election frequency, commit latency, and peer health—coordination storms are incidents.",
          "Success: you can justify where consensus is mandatory and where it would be expensive overkill."
        ],
        "callout": {
          "tone": "warning",
          "body": "Coordination services need their own capacity, SLOs, and change discipline—they are not magic free safety."
        },
        "checkYourself": [
          {
            "prompt": "What operational signal suggests coordination trouble?",
            "reveal": "Rising leader elections, commit latency, peer disconnects, or client timeouts talking to the coordination cluster."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Coordinate only where invariants truly require agreement.",
        "Quorum intersection is the core read/write safety intuition.",
        "Leadership without fencing risks split brain.",
        "Keep consensus off high-QPS data paths; use it for metadata and critical sections.",
        "Define user-visible behavior when quorums cannot form."
      ],
      "nextSteps": [
        "Mark operations that need consensus versus mergeable writes.",
        "Compute W/R options for a 5-node store and their tradeoffs.",
        "Sketch epoch fencing for shard leadership."
      ]
    }
  },
  "distributed-systems-lab/sagas-idempotency-and-workflows": {
    "title": "Workshop: Sagas, idempotency, and workflows",
    "readingTime": "75-95 min",
    "premise": "Distributed business processes fail in the middle. This lab designs saga steps and compensations, makes handlers idempotent, models workflows as durable state machines, and sketches failure drills for long-running work.",
    "parts": [
      {
        "id": "why-sagas",
        "heading": "Replace distributed transactions with explicit sagas",
        "paragraphs": [
          "Cross-service ACID transactions rarely exist at scale. Sagas break a business process into local transactions with compensations or forward recovery when a later step fails. The design centers on what 'undo' means for each step—and when undo is impossible, what human or deferred repair looks like.",
          "Prefer choreography when events are simple and ownership is clear; prefer orchestration when the process is complex, needs visibility, or must enforce ordering centrally. Either way, name the process ID that ties steps together.",
          "Workshop: turn 'place order' into steps across inventory, payment, and shipping with compensations."
        ],
        "keyTerms": [
          {
            "term": "Saga",
            "definition": "A sequence of local transactions with compensations or recovery for long-running business processes."
          },
          {
            "term": "Compensation",
            "definition": "A semantic undo for a completed step when a later step fails."
          },
          {
            "term": "Orchestration",
            "definition": "A central coordinator driving saga steps versus peer event choreography."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If compensation is 'email support,' say so—hidden human workflows are still part of the design."
        },
        "checkYourself": [
          {
            "prompt": "Why might payment authorization compensate differently than a charge?",
            "reveal": "Authorizations can often be voided; captured charges may need refunds with different timing, fees, and user messaging."
          }
        ]
      },
      {
        "id": "idempotency-keys",
        "heading": "Make every handler idempotent",
        "paragraphs": [
          "At-least-once delivery is the default in queues and retries. Handlers must treat duplicate messages as safe: store idempotency keys, use upserts, or check process state before side effects. Clients should send idempotency keys for POST-like operations.",
          "Idempotency is per logical operation, not per HTTP try. Define the key scope: user + action + resource. Expire keys carefully so replays after crash still work within a window.",
          "Lab: design idempotency for 'charge card' and for 'send receipt email'—note where exactly-once is approximated."
        ],
        "workedExample": {
          "title": "Idempotent charge handler sketch",
          "body": "Reject duplicate side effects using an idempotency record.",
          "code": "def charge(cmd):\n    # cmd.idempotency_key required from client\n    existing = db.find_idempotency(cmd.idempotency_key)\n    if existing:\n        return existing.response  # same status/body as first success\n    with db.transaction():\n        db.insert_idempotency(cmd.idempotency_key, status=\"in_progress\")\n        result = payments.capture(cmd.payment_intent)\n        db.save_payment(result)\n        db.complete_idempotency(cmd.idempotency_key, response=result)\n    return result\n# Retries with the same key return the stored result without double capture.\n",
          "language": "python"
        },
        "callout": {
          "tone": "warning",
          "body": "Retries without idempotency turn transient blips into double charges."
        },
        "checkYourself": [
          {
            "prompt": "What should a client do when a charge times out with unknown result?",
            "reveal": "Retry with the same idempotency key (not a new one) and reconcile against stored outcomes rather than assuming failure or success."
          }
        ]
      },
      {
        "id": "saga-sketch-lab",
        "heading": "Worked lab: saga sketch with failure matrix",
        "paragraphs": [
          "Draw the happy path and a failure matrix: after each step, what compensations run, what state the user sees, and what is retried forward instead of compensated.",
          "Include timeouts and out-of-order events. Shipping reserved before payment confirm must not silently ship.",
          "Deliverable: a sequence diagram plus a table of step outcomes."
        ],
        "workedExample": {
          "title": "Order saga sketch",
          "body": "Steps, compensations, and user-visible states.",
          "code": "process_id = order_id\nSteps:\n  1. ReserveInventory     compensate: ReleaseInventory\n  2. AuthorizePayment     compensate: VoidAuthorization\n  3. ConfirmOrder         compensate: MarkCancelled + notify\n  4. CapturePayment       compensate: RefundPayment (async OK)\n  5. ScheduleShipment     compensate: CancelShipmentRequest\n\nFailure after 2: run VoidAuthorization, ReleaseInventory; user sees failed checkout\nFailure after 4: refund path; user sees cancelled with refund pending\nDuplicate ScheduleShipment: idempotent on order_id+shipment_request_key\n\nStates: PENDING -> PAID -> FULFILLING -> SHIPPED | CANCELLED\n",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "Walk one mid-saga crash and narrate compensations in order without hand-waving."
        },
        "checkYourself": [
          {
            "prompt": "When is forward recovery better than compensation?",
            "reveal": "When the step can be retried safely to completion (idempotent) and undoing previous successful steps would be more harmful or expensive than finishing."
          }
        ]
      },
      {
        "id": "workflow-engines-as-state",
        "heading": "Model workflows as durable state machines",
        "paragraphs": [
          "Whether you use a workflow engine or homegrown tables, persist process state, step status, timers, and correlation IDs. Memory-only orchestration dies on deploy. Durable timers beat sleep loops in request threads.",
          "Visibility is a feature: operators need to see stuck processes, replay steps, and apply manual compensations with audit.",
          "Workshop: define entities `WorkflowInstance` and `WorkflowStep` with fields required for replay and audit."
        ],
        "keyTerms": [
          {
            "term": "Durable timer",
            "definition": "A persisted wakeup schedule that survives process restarts."
          },
          {
            "term": "Correlation ID",
            "definition": "An identifier joining messages to a workflow instance."
          },
          {
            "term": "Poison message",
            "definition": "A message that repeatedly fails processing and must be quarantined."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If you cannot list stuck workflows, you cannot operate sagas in production."
        },
        "checkYourself": [
          {
            "prompt": "Why are durable timers preferable to sleeping in a web request?",
            "reveal": "Request threads are ephemeral and do not survive deploys or crashes; durable timers resume the workflow correctly after restart."
          }
        ]
      },
      {
        "id": "exactly-once-illusion",
        "heading": "Treat exactly-once as an illusion to engineer around",
        "paragraphs": [
          "End-to-end exactly-once across independently failing systems is rarely literal. You engineer effective exactly-once via idempotent writes, dedupe stores, and transactional outbox patterns that keep event publication aligned with state changes.",
          "Outbox: write business row and outbound event in one local transaction; a publisher drains the outbox. Inbox: record processed event IDs before side effects. Together they reduce dual-write bugs.",
          "Lab: sketch outbox for 'order confirmed' publishing to search and email without dual-write races."
        ],
        "callout": {
          "tone": "interview",
          "body": "Say 'effectively once' and explain the idempotency and outbox mechanisms—avoid claiming magic."
        },
        "checkYourself": [
          {
            "prompt": "What dual-write problem does an outbox solve?",
            "reveal": "Updating a database and publishing a message separately can leave one done and the other not; outbox commits both intents locally then publishes reliably."
          }
        ]
      },
      {
        "id": "saga-ops-closeout",
        "heading": "Lab closeout: workflow operations drill",
        "paragraphs": [
          "Run a tabletop: payment captures but shipment scheduling fails twice; show state transitions, user emails, metrics, and manual operator actions. Verify idempotency under replay.",
          "Define SLIs for workflow success ratio and stuck-instance age. Long-running processes need reliability treatment like online paths.",
          "Success: you can design a new multi-step business process with keys, compensations, and stuck-state ops from a blank page."
        ],
        "callout": {
          "tone": "warning",
          "body": "A saga without stuck-instance alerts will fail silently until customers complain."
        },
        "checkYourself": [
          {
            "prompt": "What SLI helps operate sagas?",
            "reveal": "Fraction of workflow instances reaching a terminal success state within an SLO, plus age of non-terminal instances exceeding a threshold."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Sagas make multi-step failure explicit with compensations or forward recovery.",
        "Idempotency keys are mandatory under at-least-once delivery.",
        "Durable workflow state and timers beat in-memory orchestration.",
        "Outbox/inbox patterns approximate exactly-once effects.",
        "Operate workflows with stuck-instance visibility and drills."
      ],
      "nextSteps": [
        "Sketch an order saga with compensations and user-visible states.",
        "Implement an idempotency-key approach for one POST API.",
        "Design outbox publishing for one domain event."
      ]
    }
  }
};
