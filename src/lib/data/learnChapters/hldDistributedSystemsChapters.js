/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldDistributedSystemsChapters = {
  "distributed-systems/consistent-hashing-and-hot-keys": {
    "title": "Consistent hashing and hot-key management",
    "readingTime": "75-95 min",
    "premise": "Sharding is not just picking a hash function. It is a contract about how keys move when machines appear or disappear, how load concentrates under skew, and how caches and rebalance jobs behave during those moves. This chapter builds that contract from modulo failure modes through hash rings, virtual nodes, and the operational controls that keep hot keys from melting a shard.",
    "parts": [
      {
        "id": "why-modulo-sharding-hurts",
        "heading": "Why modulo sharding remaps almost everything",
        "paragraphs": [
          "A first sharding design often looks like shard = hash(key) % N. That formula is easy to code and works while N is frozen. The trouble begins the moment capacity changes. When N becomes N+1, nearly every key lands on a different remainder. Clients that cached shard affinity suddenly miss. Replicas that held warm working sets cool off. Compaction, replication lag, and disk IO spike together because the cluster is effectively reshuffling its entire keyspace.",
          "The fraction of keys remapped under modulo growth is roughly N/(N+1), which approaches 100% as clusters grow. Failures are just as disruptive: taking a node out of the modulo set is another N change. Operators then face an ugly choice between over-provisioning forever and accepting painful scale events. Interview answers that stop at \"we shard by hash\" without describing remapping cost are incomplete, because remapping cost is often the real constraint on elasticity.",
          "Consistent hashing exists to shrink the blast radius of membership change. Keys and nodes are placed on a shared circular hash space. A key belongs to the first node clockwise (or counterclockwise, by convention) from its hash position. Adding a node claims only the arc previously owned by its clockwise neighbor. Removing a node hands its arc to the next survivor. Most keys stay put. That locality of remapping is the property that makes capacity planning and failover tractable at scale."
        ],
        "keyTerms": [
          {
            "term": "Modulo sharding",
            "definition": "Assigning keys with hash(key) % N, which remaps most keys whenever N changes."
          },
          {
            "term": "Hash ring",
            "definition": "A circular hash space where both keys and nodes are placed so ownership is defined by angular neighborhoods."
          },
          {
            "term": "Remapping cost",
            "definition": "The fraction of keys, cache entries, and replication traffic that must move during a membership change."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Open with the remapping math: modulo moves nearly all keys; a ring moves only the keys on the affected arc. Then connect that math to cache churn and rebalance bandwidth."
        },
        "checkYourself": [
          {
            "prompt": "If a 100-node modulo cluster adds one node, roughly what fraction of keys remaps, and why does that matter operationally?",
            "reveal": "About 100/101 of keys remapped. Operationally that means near-global cache invalidation, a flood of cross-node copies, and elevated p99 latency during the scale event even if steady-state capacity was fine."
          }
        ]
      },
      {
        "id": "hash-rings-and-ownership",
        "heading": "Hash rings, ownership, and preference lists",
        "paragraphs": [
          "On a ring, each physical node owns the contiguous hash interval ending at its position and beginning just after the previous node. Lookups hash the key, walk clockwise, and stop at the first node. Writes follow the same ownership rule so readers and writers agree without a central directory for every key. Replication extends the idea: many systems continue walking the ring to build a preference list of the next R distinct nodes that should store copies.",
          "Ring membership itself must be consistent enough that clients do not send the same key to conflicting owners forever. Gossip, consensus configuration, or a control-plane service can distribute the membership view. Temporary disagreement still happens during partitions, which is why durable stores pair hashing with versioning, hinted handoff, or quorum reads. The partition map answers where data should live; consensus and conflict resolution answer what happens when views disagree.",
          "Token ranges are the operational face of the same idea. Cassandra-style tokens, DynamoDB partition keys, and many Redis Cluster slots are discrete manifestations of ring ownership. Thinking in tokens helps during incidents: you can ask which range is hot, which range is under-replicated, and which range is mid-migration, instead of treating the cluster as an opaque bag of nodes."
        ],
        "keyTerms": [
          {
            "term": "Preference list",
            "definition": "The ordered set of nodes responsible for storing replicas of a key, usually the next distinct ring owners."
          },
          {
            "term": "Token range",
            "definition": "A contiguous interval of the hash space owned by a node or vnode, used for routing and rebalancing."
          },
          {
            "term": "Membership view",
            "definition": "The set of live nodes and their ring positions known to a client or replica at a moment in time."
          }
        ],
        "workedExample": {
          "title": "Ring ownership with a tiny hash space",
          "body": "This sketch places three nodes and several keys on a 0..99 ring and shows owners plus a two-replica preference list. Production systems use large hash spaces, but the geometry is identical.",
          "code": "const RING = 100;\nconst nodes = [\n  { name: \"A\", pos: 10 },\n  { name: \"B\", pos: 40 },\n  { name: \"C\", pos: 75 }\n].sort((a, b) => a.pos - b.pos);\n\nfunction owner(keyHash) {\n  const h = ((keyHash % RING) + RING) % RING;\n  for (const n of nodes) if (n.pos >= h) return n.name;\n  return nodes[0].name; // wrap around\n}\n\nfunction prefer(keyHash, r = 2) {\n  const start = owner(keyHash);\n  const i = nodes.findIndex((n) => n.name === start);\n  const out = [];\n  for (let k = 0; k < nodes.length && out.length < r; k++) {\n    const n = nodes[(i + k) % nodes.length];\n    if (!out.includes(n.name)) out.push(n.name);\n  }\n  return out;\n}\n\nconsole.log(\"key 5 ->\", owner(5), \"replicas\", prefer(5));\nconsole.log(\"key 41 ->\", owner(41), \"replicas\", prefer(41));\nconsole.log(\"key 90 ->\", owner(90), \"replicas\", prefer(90));\n// Adding node D at position 20 only steals keys in (10, 20] from A.",
          "language": "javascript"
        },
        "callout": {
          "tone": "tip",
          "body": "Draw the ring in interviews. Label node positions, mark one key, walk clockwise for ownership, then walk further for replicas. Visual ownership beats memorized slogans."
        },
        "checkYourself": [
          {
            "prompt": "Why can two clients with slightly different membership views briefly disagree on a key's owner?",
            "reveal": "Membership propagation is not instantaneous. During joins, leaves, or network partitions, one client may still route to an old owner while another already routes to a new one. Durable systems therefore version data and reconcile rather than assuming a perfect global map."
          }
        ]
      },
      {
        "id": "virtual-nodes-and-balance",
        "heading": "Virtual nodes, heterogeneity, and balance",
        "paragraphs": [
          "A ring with one position per physical machine is fragile. Random placement of a few points leaves uneven arcs, so one node can own far more keyspace than another even before traffic skew. Virtual nodes (vnodes) fix this by giving each machine many positions on the ring. Ownership becomes the union of many small arcs, which statistically balances load and makes capacity changes smoother because a join steals many tiny fragments rather than one large range.",
          "Heterogeneous hardware is another reason for vnodes. A larger disk or higher CPU budget can be assigned more virtual positions so it absorbs a larger share of keys. Weighting must still respect failure domains: spreading a machine's vnodes around the ring improves balance, but replica placement should avoid putting multiple copies of the same key on the same rack or zone. Balance without failure isolation is only half a design.",
          "Rebalancing bandwidth is the hidden constraint. Even with consistent hashing, moving 5% of a multi-petabyte dataset can saturate network links for hours. Good designs throttle migrations, prioritize under-replicated ranges, and keep serving traffic on the old owner until the new owner is warm. Interviewers listen for this operational sequencing, not only for the geometric claim that \"only neighboring keys move.\""
        ],
        "keyTerms": [
          {
            "term": "Virtual node",
            "definition": "A logical ring position owned by a physical machine; many vnodes per machine improve balance and smooth migration."
          },
          {
            "term": "Weighted placement",
            "definition": "Assigning more ring positions to stronger machines so capacity tracks hardware heterogeneity."
          },
          {
            "term": "Migration throttle",
            "definition": "A limit on how fast key ranges copy to new owners so rebalancing does not crowd out user traffic."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Consistent hashing reduces remapping; it does not make remapping free. Always budget network, disk, and cache warmup for the keys that do move."
        },
        "checkYourself": [
          {
            "prompt": "How do vnodes change the shape of a scale-out event compared with one token per machine?",
            "reveal": "A new machine steals many small arcs from many peers instead of taking one large neighbor range. Load shifts more evenly, and no single donor is drained of a huge contiguous working set all at once."
          }
        ]
      },
      {
        "id": "hot-keys-and-skew",
        "heading": "Hot keys, celebrity partitions, and skew controls",
        "paragraphs": [
          "Hashing assumes that popularity is roughly proportional to keyspace ownership. Real products violate that assumption constantly. A celebrity account, a flash-sale SKU, a viral short URL, or a single tenant in a multi-tenant cluster can concentrate requests onto one partition regardless of how evenly the hash space was cut. Perfect rings still fail when one key is the product.",
          "Mitigations form a ladder. Application-level caching and request coalescing absorb repeated reads of the same hot object. Read replicas or follower reads spread read-heavy hot keys. Key splitting decomposes a logical entity into many physical keys—for example, sharding a counter into N buckets that are summed on read, or writing fan-out mailboxes per segment of followers. Write buffers and lease-based single-flight patterns protect primary stores from thundering herds after cache expiry.",
          "Detection belongs in the design, not in a postmortem. Per-key or per-partition QPS, lock wait, and CPU saturation metrics reveal hotspots before user-facing latency collapses. Some systems auto-split ranges when size or load crosses thresholds; others page humans with runbooks for celebrity events. In interviews, separate the partitioning algorithm from the skew plan: one distributes identity space, the other survives popularity."
        ],
        "keyTerms": [
          {
            "term": "Hot key",
            "definition": "A key whose request rate or payload size overwhelms the shard that owns it despite balanced hash placement."
          },
          {
            "term": "Key splitting",
            "definition": "Storing one logical entity across multiple physical keys to parallelize hot reads or writes."
          },
          {
            "term": "Request coalescing",
            "definition": "Collapsing concurrent identical lookups into one backend fetch so stampedes do not multiply load."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "If asked about a celebrity user, do not only say \"consistent hashing.\" Name caching, split keys, hybrid fan-out, and monitoring as first-class answers."
        },
        "checkYourself": [
          {
            "prompt": "Why can local caching fix some hot keys but not all?",
            "reveal": "Caches help repeated reads of the same value. They do not help write-heavy counters, uniqueness constraints that must serialize, or payloads that change on every request. Those need splitting, specialized stores, or explicit sequencing."
          }
        ]
      },
      {
        "id": "caching-locality-and-incidents",
        "heading": "Cache locality, failure isolation, and incident behavior",
        "paragraphs": [
          "Partition maps interact with caches at every layer. When keys remapped, edge caches, application caches, and store-local block caches all miss together. Designs that freeze vnode assignments longer, or that migrate with a dual-write/dual-read window, reduce synchronized cache cold-start. Sticky routing that follows the ring also preserves connection-level locality for protocols that benefit from persistent sessions.",
          "Failure isolation is another ring property. Contiguous ownership means a dead node takes a known fraction of keyspace offline until failover completes. Replication across zones converts that into degraded durability rather than total unavailability, but only if preference lists are zone-aware. A ring that places consecutive replicas in one rack creates correlated failure even when the hash looks random.",
          "During incidents, operators think in ranges: quarantine a bad token, restore a snapshot for one interval, or pause migrations while serving recovers. Candidates who can narrate that operational loop—detect hot range, shed load, restore replicas, resume rebalance—sound like they have run systems, not only drawn rings on whiteboards."
        ],
        "keyTerms": [
          {
            "term": "Zone-aware placement",
            "definition": "Choosing replica owners so copies of a key land in independent failure domains."
          },
          {
            "term": "Dual lookup window",
            "definition": "Temporarily reading or writing both old and new owners during migration to avoid lost updates."
          },
          {
            "term": "Range quarantine",
            "definition": "Isolating a damaged token interval while the rest of the cluster continues serving."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Tie every hashing choice to an operational question: what moves, what caches cold, what fails together, and how you pause the move."
        },
        "checkYourself": [
          {
            "prompt": "Name two reasons a rebalance can hurt p99 latency even when average CPU looks fine.",
            "reveal": "Migration traffic contends for disk and network on donor and receiver nodes, and remapped keys miss warm caches so each user request does more backend work. Averages hide the ranges under active copy."
          }
        ]
      },
      {
        "id": "interview-playbook-hashing",
        "heading": "Interview playbook for partitioning answers",
        "paragraphs": [
          "A crisp partitioning answer has four beats. First, state the identity that defines the shard key and why that identity matches access patterns. Second, choose a placement scheme—modulo only for fixed small sets, rings or slots for elastic clusters—and explain remapping. Third, describe replication and failure domains on top of placement. Fourth, call out skew: how you detect hot keys and which mitigation fits read-heavy versus write-heavy load.",
          "Be ready to reject a bad shard key. User-id sharding may create celebrity partitions; time-based sharding may create write hotspots on the newest interval; tenant-id sharding may strand noisy neighbors together. Sometimes a compound key or a random salt is required, with a secondary index for natural lookups. Showing that you can redesign the key is more senior than defending the first hash you named.",
          "Finally, connect partitioning to product SLOs. If the SLO is read latency, bias toward cacheable keys and stable ownership. If the SLO is write durability under failure, emphasize quorum placement and slow-but-safe rebalance. Partitioning is not an isolated algorithms trivia question; it is the skeleton of capacity, cost, and recovery."
        ],
        "callout": {
          "tone": "interview",
          "body": "Practice a two-minute version: remapping math, vnode balance, celebrity hot-key plan, and one monitoring signal. That sequence covers most follow-ups."
        },
        "checkYourself": [
          {
            "prompt": "Give an example where hashing alone cannot save the design, and name the missing piece.",
            "reveal": "A globally popular product page with write-rate spikes on inventory counters. Hashing places the key somewhere, but without counter splitting, caching of reads, or a specialized inventory service, that single partition still saturates."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Modulo sharding remaps nearly all keys on membership change; consistent hashing remaps only neighboring arcs.",
        "Virtual nodes improve balance and smooth migrations, but rebalance bandwidth and cache warmup still need budgets.",
        "Hot keys are a popularity problem, not a hash-uniformity problem, and need explicit mitigations.",
        "Zone-aware replicas, migration windows, and range-level operations turn ring theory into operable systems."
      ],
      "nextSteps": [
        "Compute owners and preference lists for a 0..99 ring with four nodes and explain what adding a fifth node steals.",
        "Sketch a hot-key runbook for a celebrity profile including cache, split keys, and metrics.",
        "Compare remapping cost for modulo versus consistent hashing when growing from 10 to 11 nodes."
      ]
    }
  },
  "distributed-systems/consensus-quorums-and-leader-election": {
    "title": "Consensus, quorums, and leader election",
    "readingTime": "80-100 min",
    "premise": "Replication copies bytes; consensus decides who may change them and when a change is durable. High-level design interviews probe that distinction hard: who owns writes, how replicas detect leader loss, what quorums buy you, and why putting Raft on every hot path is usually a mistake. This chapter builds from quorum arithmetic through leader leases, fencing, and the discipline of isolating coordination.",
    "parts": [
      {
        "id": "replication-is-not-consensus",
        "heading": "Replication copies; consensus decides",
        "paragraphs": [
          "A replica set can store the same bytes and still disagree about the latest value if writers can update different copies concurrently. Asynchronous replication favors availability and lag; synchronous replication favors freshness and latency. Neither alone tells you whether two clients can observe conflicting histories after a partition. Consensus protocols exist to force agreement on an ordered log of decisions despite crashes and message loss.",
          "Interview language should separate three layers. Placement decides which machines hold copies. Quorum policy decides how many copies must acknowledge a read or write. Consensus decides a single serial history for a control plane or for a strongly consistent shard. Many production systems mix them: Dynamo-style stores emphasize quorums and conflict resolution, while metadata services, configuration stores, and primary-election paths use Raft or Paxos.",
          "The cost curve matters. Agreement requires round trips among a majority in the worst case, and it serializes conflicting updates. That is why chatty user traffic usually stays on partitionable data paths, while leadership, schema versions, shard maps, and locks live in a smaller strongly consistent plane. A strong design names both planes and the APIs that cross them."
        ],
        "keyTerms": [
          {
            "term": "Consensus",
            "definition": "A protocol that drives replicas to agree on the same sequence of decisions despite failures."
          },
          {
            "term": "Replication",
            "definition": "Copying data to multiple nodes for durability and availability without necessarily agreeing on a single history."
          },
          {
            "term": "Control plane",
            "definition": "The smaller set of strongly consistent decisions—membership, leadership, configuration—that steer the data plane."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "When you say \"we replicate,\" immediately clarify whether conflicts are prevented by a leader/quorum or resolved after the fact."
        },
        "checkYourself": [
          {
            "prompt": "Why can three replicas still serve conflicting values after a network partition?",
            "reveal": "If clients can write to different sides without a majority intersection or a single leader, each side may accept updates. Replication kept the cluster available; it did not enforce one history."
          }
        ]
      },
      {
        "id": "quorum-arithmetic",
        "heading": "Quorum reads, writes, and the R + W > N rule",
        "paragraphs": [
          "In a leaderless model with N replicas, a write waits for W acknowledgments and a read waits for R responses. If R + W > N, the read set and write set must overlap in at least one replica, so a reader can see the latest successful write—assuming no Byzantine faults and assuming the overlapping replica is reachable. Classic defaults such as N=3, W=2, R=2 illustrate the trade: every operation pays majority latency for that overlap guarantee.",
          "Tuning quorums is a product decision. W=1, R=N favors fast writes and careful reads; W=N, R=1 favors fast reads after slow durable writes; W=1, R=1 maximizes availability and accepts stale or conflicting reads. Sloppy quorums and hinted handoff further loosen the rule during failures by writing to substitutes and repairing later. Candidates should say what inconsistency window they are buying when they drop below strict quorum.",
          "Quorums do not erase the need for versioning. Concurrent writers can still create divergent sibling values when W is satisfied on different subsets over time, or when clocks and network delays reorder deliveries. Vector clocks, version numbers, or last-writer-wins policies then decide merge behavior. Quorum math is necessary for overlap; it is not a complete story of semantic correctness."
        ],
        "keyTerms": [
          {
            "term": "N / W / R",
            "definition": "Replica count, write acknowledgment count, and read response count in a quorumed store."
          },
          {
            "term": "Sloppy quorum",
            "definition": "Temporarily accepting substitutes when preferred replicas are down, with later repair to the preference list."
          },
          {
            "term": "Read repair",
            "definition": "Fixing divergent replicas discovered during a quorum read by pushing newer versions to stale peers."
          }
        ],
        "workedExample": {
          "title": "Overlap check for quorum settings",
          "body": "Use the inequality to decide whether a configuration guarantees read-your-write overlap under the classic model.",
          "code": "function overlaps(N, W, R) {\n  return R + W > N;\n}\n\nconst configs = [\n  { N: 3, W: 2, R: 2 },\n  { N: 3, W: 1, R: 1 },\n  { N: 5, W: 3, R: 3 },\n  { N: 5, W: 1, R: 5 }\n];\n\nfor (const c of configs) {\n  console.log(c, \"overlap?\", overlaps(c.N, c.W, c.R));\n}\n// {N:3,W:2,R:2} true — majority read/write\n// {N:3,W:1,R:1} false — disjoint subsets possible\n// Latency rises with W and R; availability falls if too many must be up.",
          "language": "javascript"
        },
        "callout": {
          "tone": "interview",
          "body": "State N, W, and R explicitly, then say what fails when a zone drops below the quorum. Vague \"we use quorum\" answers get follow-up pressure."
        },
        "checkYourself": [
          {
            "prompt": "Does W=2, R=2 on N=3 guarantee you never read stale data after every write?",
            "reveal": "It guarantees overlap with a successful write under the classic model, but only for writes that completed W acks. In-flight writes, repaired hints, and concurrent conflicting writers can still produce surprises unless versions and client session rules are defined."
          }
        ]
      },
      {
        "id": "leaders-and-raft",
        "heading": "Leaders, Raft logs, and serialized writes",
        "paragraphs": [
          "A leader simplifies client semantics by becoming the single admitter of writes for a shard or for a metadata service. Followers replicate an ordered log; commits advance when a majority has stored the entry. Readers may be served by the leader for linearizability, or by followers with explicit staleness bounds. The leadership model trades the complexity of multi-primary conflict resolution for the complexity of electing and fencing a primary.",
          "Raft organizes time into terms, elects at most one leader per term via majority votes, and replicates a log with matching properties that prevent committed entries from being overwritten. Candidates must understand the heartbeat and election timeout relationship: too aggressive timeouts thrash leadership under slow networks; too passive timeouts extend unavailability after a crash. Production deployments also care about pre-vote, leader transfer, and learner/non-voting replicas for safe membership change.",
          "Not every subsystem needs Raft. A cache does not. A blob store often does not on the data path. A partition map, an election for a stateful worker, or a highly consistent configuration flag often does. The interview skill is naming the minimum surface that must be totally ordered, then keeping user data outside that surface whenever possible."
        ],
        "keyTerms": [
          {
            "term": "Leader",
            "definition": "The replica currently authorized to sequence writes for a shard or coordination domain."
          },
          {
            "term": "Raft term",
            "definition": "A logical epoch used to order elections and to reject stale leadership claims."
          },
          {
            "term": "Committed entry",
            "definition": "A log record acknowledged by a majority and safe to apply to state machines."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Putting user request bodies through a global consensus log creates a throughput ceiling and a blast radius. Prefer consensus for metadata and per-shard leadership for data."
        },
        "checkYourself": [
          {
            "prompt": "Why does a Raft leader typically wait for majority replication before telling the client the write is durable?",
            "reveal": "Minority acknowledgments can vanish if the leader crashes and a new majority elects without that entry. Majority commit makes the entry present on any future majority, so it survives leadership change."
          }
        ]
      },
      {
        "id": "leases-fencing-split-brain",
        "heading": "Leases, fencing tokens, and split-brain defense",
        "paragraphs": [
          "Split brain happens when two nodes both believe they are primary and both accept writes. Networks that delay heartbeats are enough to trigger false suspicions. Defense starts with majority election so two leaders cannot both hold a majority at once, then continues with fencing so a stale leader cannot commit after a newer leader exists.",
          "Fencing tokens are monotonic values issued at election time and checked by storage or by peers on every privileged operation. A disk epoch, a ZooKeeper zxid-style fence, or a generation number on a blob lease all serve the same purpose: reject writers whose authority is older than the current generation. Leases add a time bound so leadership expires unless renewed, but lease designs must handle clock uncertainty carefully or combine leases with fencing.",
          "Witnesses and quorum journals help when you want strong failover with fewer full replicas. A witness participates in voting without serving full data copies. The pattern still rests on majority math: availability requires enough voters online, and correctness requires that a demoted primary cannot write past the fence. Draw the timeline of suspicion, election, fence bump, and rejected stale write when explaining failover."
        ],
        "keyTerms": [
          {
            "term": "Split brain",
            "definition": "Two primaries accepting writes for the same shard, producing divergent durable state."
          },
          {
            "term": "Fencing token",
            "definition": "A monotonically increasing authority id that storage checks to reject stale leaders."
          },
          {
            "term": "Lease",
            "definition": "A time-bounded grant of leadership or lock ownership that must be renewed to remain valid."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Never end a failover story at \"we elect a new leader.\" Continue through fencing and what happens to in-flight writes from the old leader."
        },
        "checkYourself": [
          {
            "prompt": "How does a fencing token stop a slow old primary after a new election?",
            "reveal": "The new election issues a higher token. Storage or peers accept writes only with the latest token, so the old primary's delayed packets are rejected even if it still thinks it is leader."
          }
        ]
      },
      {
        "id": "use-coordination-sparingly",
        "heading": "Use coordination sparingly on the critical path",
        "paragraphs": [
          "Coordination latency compounds. A user request that takes a consensus round trip in one region already pays cross-zone cost; a request that chains several coordinated locks becomes an outage amplifier. Throughput is capped by the slowest majority. Designs therefore push agreement off the request path: batch commits, pipeline log entries, or decide once in the control plane and let millions of data-plane operations reuse that decision.",
          "Patterns that reduce coordination include commutative updates, CRDTs, sharded leaders, optimistic concurrency with retries, and idempotent asynchronous workflows. Patterns that require coordination include unique primary key allocation across regions, tightly synchronous inventory for a single SKU without reservation buffers, and cluster membership changes. Naming which category a requirement falls into is half the architecture.",
          "Operationally, coordination systems need their own SLOs, dashboards, and capacity plans. etcd, ZooKeeper, and similar stores are not infinite glue. Overloading them with per-request locks recreates a central database with worse multi-hop failure modes. Treat consensus clusters as scarce, highly available utilities—not as general-purpose application databases."
        ],
        "keyTerms": [
          {
            "term": "Data plane",
            "definition": "The high-volume path that serves user reads and writes, ideally without per-request global consensus."
          },
          {
            "term": "Sharded leadership",
            "definition": "Electing independent leaders per partition so coordination scales horizontally with shard count."
          },
          {
            "term": "Optimistic concurrency",
            "definition": "Committing an update only if a version matches, retrying on conflict instead of holding a distributed lock."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Ask \"can this decision be per-shard or eventually reconciled?\" before introducing a cluster-wide lock."
        },
        "checkYourself": [
          {
            "prompt": "Why is one Raft group for all user posts usually a bad HLD choice?",
            "reveal": "Every write serializes through one majority log, so throughput and availability collapse to that group's limits. Leadership should be per shard or avoided on the post body path entirely."
          }
        ]
      },
      {
        "id": "interview-playbook-consensus",
        "heading": "Interview playbook for consensus questions",
        "paragraphs": [
          "Start by classifying the requirement: durability under failure, single-writer semantics, linearizable reads, or mere high availability. Then pick a mechanism. Quorums without a leader fit multi-writer stores that can merge. A leader plus Raft fits metadata and per-shard primaries. Multi-region active-active usually needs conflict policy, not pretend global locking.",
          "Walk failure explicitly. Kill the leader mid-write. Partition a minority. Delay heartbeats. For each case, say whether clients see success, retry, or stale reads, and whether fencing prevents divergence. Interviewers are grading the failure story more than the happy-path diagram.",
          "Close with isolation. Show the small box that runs consensus and the large box that does not. That framing demonstrates taste: you know consensus is powerful, expensive, and easy to overuse."
        ],
        "callout": {
          "tone": "interview",
          "body": "A strong closer: \"Consensus for the shard map and leader election; quorumed replication for object data; no global lock on the read path.\""
        },
        "checkYourself": [
          {
            "prompt": "When would you choose leaderless quorums over a Raft primary for a key-value shard?",
            "reveal": "When write availability during partial failure matters more than simple single-copy semantics, and the value type can tolerate version vectors or application merges. Leader-based Raft is preferable when you need a single ordered history with simpler clients."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Replication alone does not prevent conflicting histories; quorums and consensus define agreement rules.",
        "R + W > N gives read/write overlap in classic quorum stores, at the cost of latency and availability tradeoffs.",
        "Leaders and Raft serialize writes; fencing tokens stop stale primaries after failover.",
        "Keep consensus off most user-request hot paths; shard leadership and isolate a small control plane."
      ],
      "nextSteps": [
        "For N=5, pick W and R pairs that do and do not guarantee overlap, and explain the latency impact.",
        "Narrate a leader failover with election, fencing token bump, and rejection of a delayed old write.",
        "Redraw a design so only membership and leadership use Raft while record bodies stay partitionable."
      ]
    }
  },
  "distributed-systems/distributed-transactions-and-sagas": {
    "title": "Distributed transactions, sagas, and idempotent workflows",
    "readingTime": "80-100 min",
    "premise": "Cross-service workflows fail in the middle. Payments capture, inventory decrements, and shipping labels do not share one ACID boundary, yet the business still needs a coherent outcome. This chapter contrasts two-phase commit with sagas, shows how outboxes make events reliable, and treats idempotency as the mechanism that makes retries safe rather than dangerous.",
    "parts": [
      {
        "id": "transaction-boundaries",
        "heading": "Local transactions versus cross-service wishes",
        "paragraphs": [
          "A database transaction gives atomicity, isolation, and durability inside one resource manager. That boundary is precious and small. The moment an HTTP call, a queue publish, or a second database participates, you leave that guarantee. Pretending microservices still have one global ACID transaction leads to brittle designs that hold locks across networks or that ignore partial failure.",
          "Healthy architectures name the local transaction for each step: insert order row, reserve inventory row, insert payment intent. Between those steps sit messages, retries, and timeouts. The design problem is preserving business intent across those seams—not inventing a distributed mutex that spans every service. Clear boundaries also clarify ownership: which service is source of truth for inventory, which for payment state, which for the customer-visible order status.",
          "Dual writes are a recurring bug pattern: update a database and then publish an event, or call two APIs in sequence without a recovery story. If the process crashes between them, the world is half-updated. Outbox patterns, transactional messaging, and saga state machines exist because dual writes are normal under failure even when they are rare in happy-path tests."
        ],
        "keyTerms": [
          {
            "term": "Local transaction",
            "definition": "An ACID unit confined to one database or resource manager."
          },
          {
            "term": "Dual write",
            "definition": "Updating two systems in sequence without a shared commit, creating partial-failure windows."
          },
          {
            "term": "Source of truth",
            "definition": "The system authoritative for a particular business fact, against which others reconcile."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If your sequence diagram has arrows to three services inside one \"transaction\" box, redraw it with local commits and an explicit recovery path."
        },
        "checkYourself": [
          {
            "prompt": "Why is \"call payment then inventory in one request handler\" not an ACID transaction?",
            "reveal": "Each remote call commits independently. A crash after payment success and before inventory success leaves durable money movement without a matching reservation, and the handler's memory of intent is gone."
          }
        ]
      },
      {
        "id": "two-phase-commit",
        "heading": "Two-phase commit: atomicity with a blocking cost",
        "paragraphs": [
          "Two-phase commit (2PC) asks participants to prepare—locks held, undo/redo ready—then has a coordinator broadcast commit or abort. If every participant votes yes and the coordinator decides commit, all install the effects. The protocol can provide atomicity across heterogeneous resources when it works, which is why XA-style transactions appear in older enterprise stacks.",
          "The failure mode is blocking and operational pain. If the coordinator crashes after prepare, participants may hold locks indefinitely until recovery. Network partitions extend uncertainty. Latency multiplies because prepare and commit are synchronized rounds. At internet scale, holding row locks while waiting on remote services destroys throughput and amplifies blast radius.",
          "Use 2PC sparingly: tightly coupled co-located resources, short critical sections, and operators who can run coordinator recovery. Prefer not to stretch 2PC across independently deployed microservices and multi-region links. In interviews, saying \"we avoid 2PC on the order path because prepare locks couple availability\" is a senior signal."
        ],
        "keyTerms": [
          {
            "term": "Two-phase commit",
            "definition": "A coordinated prepare-then-commit protocol that aims for atomic multi-resource commits."
          },
          {
            "term": "Coordinator",
            "definition": "The component that collects prepare votes and broadcasts the final commit or abort decision."
          },
          {
            "term": "Prepared state",
            "definition": "A participant state where locks are held and the node can commit or roll back on command."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Contrast 2PC with sagas in one sentence: 2PC blocks for atomicity; sagas progress with compensations and accept temporary inconsistency."
        },
        "checkYourself": [
          {
            "prompt": "What resource stays occupied while a 2PC participant is prepared and waiting?",
            "reveal": "Locks and related transactional resources on that participant, which can stall unrelated work touching the same rows or tables until commit or abort arrives."
          }
        ]
      },
      {
        "id": "sagas-model-intent",
        "heading": "Sagas model long-running business intent",
        "paragraphs": [
          "A saga decomposes a business workflow into a sequence of local transactions. Each step commits locally and publishes enough state for the next step. If a later step fails, earlier steps run compensating actions—release inventory, refund authorization, mark the order cancelled—rather than holding an open global transaction. The system may be temporarily inconsistent, yet it converges toward a defined terminal state.",
          "Orchestration uses a central workflow engine or orchestrator object that tells each service what to do and records progress. Choreography lets services react to each other's events without a central conductor. Orchestration offers visibility and easier timeouts; choreography reduces a single coordination hotspot but can obscure the overall graph. Choose based on complexity and the need for operator-visible state machines.",
          "Compensations are not magic undos. A shipped package cannot be unshipped with a database row; a sent email cannot be recalled reliably. Saga design therefore prefers reversible reservations early (hold funds, soft-allocate stock) and irreversible side effects late. Compensations themselves can fail and need retries, dead-letter handling, and human escalation paths."
        ],
        "keyTerms": [
          {
            "term": "Saga",
            "definition": "A sequence of local transactions with compensations that together implement a long-running business workflow."
          },
          {
            "term": "Compensation",
            "definition": "A local action that semantically undoes or mitigates a previous step when the saga aborts."
          },
          {
            "term": "Orchestration",
            "definition": "A saga style where a coordinator drives step execution and records workflow state."
          }
        ],
        "workedExample": {
          "title": "Order saga sketch with compensations",
          "body": "Pseudocode for an orchestrated checkout saga. Each step is locally transactional; failures trigger compensations in reverse order.",
          "code": "async function placeOrderSaga(ctx) {\n  const order = await orders.createPending(ctx); // local tx\n  try {\n    await payments.authorize(ctx, { orderId: order.id, idempotencyKey: ctx.key });\n    await inventory.reserve(ctx, { orderId: order.id, items: ctx.items });\n    await orders.markConfirmed(ctx, order.id);\n    await outbox.enqueue(ctx, { type: \"OrderConfirmed\", orderId: order.id });\n    return order;\n  } catch (err) {\n    await inventory.releaseIfHeld(ctx, order.id);   // compensation\n    await payments.voidAuthorization(ctx, order.id); // compensation\n    await orders.markFailed(ctx, order.id, String(err));\n    throw err;\n  }\n}\n// authorize/reserve/void must be idempotent under retries.",
          "language": "javascript"
        },
        "callout": {
          "tone": "tip",
          "body": "Put irreversible effects (capture funds, print label, notify user of final failure) after reversible holds succeed."
        },
        "checkYourself": [
          {
            "prompt": "Why might choreography become hard to operate for a ten-step checkout?",
            "reveal": "The control flow is implicit across many event handlers, so timeouts, partial failures, and \"where is this order stuck?\" questions require reconstructing state from scattered logs instead of one workflow record."
          }
        ]
      },
      {
        "id": "outbox-and-inbox",
        "heading": "Transactional outbox, inbox, and at-least-once reality",
        "paragraphs": [
          "The transactional outbox pattern writes business rows and an outbox event row in the same local transaction. A relay process publishes outbox rows to a message bus and marks them sent. Consumers never depend on a dual write between database and broker. If the process crashes after commit but before publish, the relay retries until the event leaves.",
          "Consumers face at-least-once delivery. The inbox or dedupe table records processed message ids so retries do not double-apply side effects. Exactly-once end-to-end is usually an illusion assembled from idempotent handlers, dedupe windows, and careful offsets. Design APIs as if duplicates are normal, because they are.",
          "Ordering guarantees are per partition or per key, not global. If order events for one orderId must stay ordered, publish with that key into a log partition. Do not assume a bus preserves order across unrelated keys. Replay and backfill tools should rebuild derived state from the durable log or from source-of-truth tables when handlers are fixed."
        ],
        "keyTerms": [
          {
            "term": "Transactional outbox",
            "definition": "Persisting events in the same local transaction as business state, then publishing asynchronously."
          },
          {
            "term": "Inbox / dedupe store",
            "definition": "Consumer-side storage of processed message ids used to ignore duplicates."
          },
          {
            "term": "At-least-once delivery",
            "definition": "A messaging guarantee that duplicates may occur; handlers must tolerate retries."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "\"Exactly once\" marketing usually means \"effectively once if your handler is idempotent.\" Say that out loud in interviews."
        },
        "checkYourself": [
          {
            "prompt": "How does an outbox prevent the \"DB committed, event lost\" dual-write failure?",
            "reveal": "The event row commits with the business row. A crash before broker publish leaves a durable outbox record for the relay to send later, so the event is not lost with process memory."
          }
        ]
      },
      {
        "id": "idempotency-keys",
        "heading": "Idempotency keys close the retry loop",
        "paragraphs": [
          "Clients retry when timers fire, mobile networks drop, and load balancers reset connections. Without idempotency, retries create double charges and double shipments. An idempotency key—client-generated or derived from a natural business key—names an intent so the server can return the original result on replay instead of executing a second side effect.",
          "Server implementation stores the key with request hash, response, and status. Concurrent retries for the same key must serialize: one execution proceeds while others wait or get a conflict. Keys need a retention window long enough to cover late retries, and they need conflict rules when the same key arrives with a different body. Payment processors and stock exchanges treat this machinery as mandatory, not optional polish.",
          "Idempotency pairs with reconciliation. Nightly jobs compare internal state to partner statements and repair drift that escaped online detection. Sagas, outboxes, and keys reduce the chance of divergence; reconciliation accepts that rare divergence still happens and must be operable. Interviews that mention both online idempotency and offline reconciliation sound production-ready."
        ],
        "keyTerms": [
          {
            "term": "Idempotency key",
            "definition": "A token that identifies an intent so duplicate submissions reuse the first outcome."
          },
          {
            "term": "Natural key",
            "definition": "A business identifier (order id + action) that can serve as an idempotency key without a random token."
          },
          {
            "term": "Reconciliation",
            "definition": "An offline comparison of ledgers or partner reports used to detect and repair residual drift."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "For any money or inventory mutation API, state where the idempotency key is stored, how long it lives, and what concurrent duplicates do."
        },
        "checkYourself": [
          {
            "prompt": "What should happen if two identical POSTs with the same idempotency key arrive at once?",
            "reveal": "One should execute while the other waits or reads the in-progress record; both should eventually observe the same final result without applying the side effect twice."
          }
        ]
      },
      {
        "id": "choosing-coordination-style",
        "heading": "Choosing 2PC, sagas, or single-writer aggregation",
        "paragraphs": [
          "Sometimes the best distributed transaction is not distributing the transaction. Collocate tightly coupled writes in one service and one database when consistency needs are strict and the domain fits. Reservation systems often keep seats or inventory in a single ownership service and emit events outward. That reduces saga complexity at the cost of a clearer bounded context.",
          "Choose 2PC only when participants are few, latency budgets allow, and blocking is acceptable. Choose sagas when services are independently deployed, steps are long-running, or irreversible effects must be staged. Choose choreography for simple event chains; choose orchestration when the graph needs visibility, timeouts, and compensations with many branches.",
          "End an interview design by listing terminal states and failure states: confirmed, cancelled, pending review, awaiting partner. Ambiguous \"processing\" without timeouts is how zombie orders accumulate. Workflows need clocks as much as they need queues."
        ],
        "callout": {
          "tone": "tip",
          "body": "Write the state machine before the sequence diagram. If you cannot name states and transitions, the saga is not designed yet."
        },
        "checkYourself": [
          {
            "prompt": "When is collapsing payment and order into one service better than a multi-service saga?",
            "reveal": "When the consistency requirements are strict, the team owns both concerns, and cross-service failure modes would dominate. A single local transaction may be simpler and safer than distributed compensation theater."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Cross-service calls leave ACID; design local commits plus recovery instead of pretending one global transaction exists.",
        "2PC can atomic-commit but blocks and couples availability; sagas trade temporary inconsistency for progress via compensations.",
        "Transactional outboxes and consumer dedupe make at-least-once messaging operable.",
        "Idempotency keys and reconciliation make retries and partner callbacks safe."
      ],
      "nextSteps": [
        "Draw an order saga with three steps, compensations, and terminal states.",
        "Explain how an outbox plus inbox prevents lost and duplicate effects.",
        "Specify idempotency-key storage and conflict behavior for a charge API."
      ]
    }
  },
  "distributed-systems/probabilistic-data-structures": {
    "title": "Probabilistic data structures and cardinality estimation",
    "readingTime": "70-90 min",
    "premise": "Exact sets and counters are honest and expensive. At large scale, many questions only need bounded error: have we probably seen this key, roughly how many distinct users appeared, which items are heavy hitters. Bloom filters, HyperLogLog, and count-min sketches trade tiny, explicit error for orders-of-magnitude less memory. This chapter teaches when that trade is rational and how to place approximate structures so they never silently become the source of truth.",
    "parts": [
      {
        "id": "when-approximation-wins",
        "heading": "When approximation is the right product choice",
        "paragraphs": [
          "Dashboards that show unique visitors, security filters that skip obvious non-members, and cache admission policies that avoid storing useless keys all tolerate small error. Exact answers would require storing every identity or scanning huge logs. Approximation moves those problems into RAM-sized summaries that update in constant or near-constant time per event.",
          "The discipline is naming the error. False positives, false negatives, relative cardinality error, and frequency overestimates each harm different downstream decisions. Billing and compliance usually forbid silent approximation. Analytics and defensive filtering often welcome it. Interview answers score higher when they quantify \"about 1% false positives\" and connect that number to extra database load or extra cache misses.",
          "Approximate structures are usually components, not products. They sit in front of exact stores, beside telemetry pipelines, or inside adaptive algorithms. Keep an exact path for confirmation whenever a false decision is costly. That layered view prevents the common mistake of treating a Bloom filter as a database."
        ],
        "keyTerms": [
          {
            "term": "Bounded error",
            "definition": "A documented statistical error limit that the structure is designed not to exceed with high probability."
          },
          {
            "term": "Summary / sketch",
            "definition": "A compact representation that supports approximate queries over a large stream or set."
          },
          {
            "term": "Exact fallback",
            "definition": "A definitive system consulted when an approximate answer is positive, uncertain, or high impact."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Start designs with the decision: what error is acceptable, and what happens on the wrong side of that error?"
        },
        "checkYourself": [
          {
            "prompt": "Why might unique-user analytics accept HyperLogLog while a ledger cannot?",
            "reveal": "Analytics optimize for cheap trend visibility where a small relative error is fine. Ledgers need exact money movements; approximate balances would break reconciliation and trust."
          }
        ]
      },
      {
        "id": "bloom-filters",
        "heading": "Bloom filters for membership screening",
        "paragraphs": [
          "A Bloom filter is a bit array plus several hash functions. Inserting an item sets k bits. Querying checks those bits: if any is zero, the item was definitely never inserted; if all are one, the item is probably present. There are no false negatives for the classic filter, which makes it ideal for \"definitely not here\" short circuits. False positives rise as the array fills, governed by bit count m, hash count k, and inserted element count n.",
          "Placement patterns are classic. A cache can ask a Bloom filter whether a key might be stored before doing a remote get, reducing load for misses. A database can keep a filter per SSTable to skip files that cannot contain a key. A CDN or API gateway can filter obviously invalid tokens before hitting origin. In each case the expensive exact check still happens on positives.",
          "Operational care includes sizing for expected n, rotating or rebuilding filters when saturation raises false-positive rates, and handling deletes. Classic Bloom filters cannot delete safely without counting or replacement structures such as cuckoo filters. Frozen filters for immutable datasets are simpler than filters that must track a rapidly churning set."
        ],
        "keyTerms": [
          {
            "term": "False positive",
            "definition": "The filter claims an item may be present when it was never inserted."
          },
          {
            "term": "False negative",
            "definition": "The filter claims absence for an item that was inserted; classic Bloom filters avoid these."
          },
          {
            "term": "Filter saturation",
            "definition": "Filling too many bits so false-positive probability climbs beyond the design budget."
          }
        ],
        "workedExample": {
          "title": "Bloom filter sizing and a tiny simulator",
          "body": "Rule of thumb: for target false-positive rate p with n items, m ≈ -n ln(p) / (ln 2)^2 bits and k ≈ (m/n) ln 2 hashes. The code shows how collisions create false positives on a toy filter.",
          "code": "function optimalSize(n, p) {\n  const m = Math.ceil(-(n * Math.log(p)) / (Math.LN2 ** 2));\n  const k = Math.max(1, Math.round((m / n) * Math.LN2));\n  return { m, k };\n}\n\nconsole.log(\"n=1e6 p=0.01\", optimalSize(1e6, 0.01));\n// ~9.6e6 bits (~1.2MB), k ~ 7\n\n// Toy Bloom to illustrate false positives\nclass TinyBloom {\n  constructor(m, k) {\n    this.bits = new Uint8Array(m);\n    this.m = m;\n    this.k = k;\n  }\n  _locs(x) {\n    const locs = [];\n    let h = 2166136261;\n    for (let i = 0; i < this.k; i++) {\n      h = Math.imul(h ^ (x + i * 97), 16777619) >>> 0;\n      locs.push(h % this.m);\n    }\n    return locs;\n  }\n  add(x) { for (const i of this._locs(x)) this.bits[i] = 1; }\n  mightContain(x) { return this._locs(x).every((i) => this.bits[i] === 1); }\n}\n\nconst b = new TinyBloom(64, 3);\nfor (let i = 0; i < 20; i++) b.add(i);\nlet fp = 0;\nfor (let i = 100; i < 200; i++) if (b.mightContain(i)) fp++;\nconsole.log(\"false positives in 100 unseen keys:\", fp);",
          "language": "javascript"
        },
        "callout": {
          "tone": "interview",
          "body": "Say \"no false negatives, tunable false positives\" and place the filter as a negative cache or SSTable skipper with an exact confirmation path."
        },
        "checkYourself": [
          {
            "prompt": "If a Bloom filter returns true for a key, what must your system still do when correctness matters?",
            "reveal": "Consult the exact store or authoritative index. True means \"probably present,\" not proof of presence."
          }
        ]
      },
      {
        "id": "hyperloglog",
        "heading": "HyperLogLog for cardinality",
        "paragraphs": [
          "HyperLogLog estimates the number of distinct elements in a stream using a tiny register array. It hashes each item, uses some bits to choose a register, and tracks the maximum run of leading zeros observed in the remaining bits. Larger maximum runs imply a larger unseen space, which translates into a cardinality estimate. Merging registers with element-wise maxima makes the structure friendly to distributed aggregation.",
          "Memory stays in kilobytes even when distinct counts reach billions, with typical relative error of a couple of percent depending on register count. That trade is perfect for \"unique visitors today,\" \"distinct IPs per prefix,\" or \"approximate group-by cardinality\" in telemetry. It is the wrong tool for exact billing tiers that charge per unique seat without tolerance.",
          "Practical deployments keep separate HLL keys per time window or dimension, expire windows aggressively, and document error in API responses or UI copy when stakeholders might mistake estimates for audits. Bias corrections and sparse representations improve accuracy for small cardinalities; know that production libraries already encode those details."
        ],
        "keyTerms": [
          {
            "term": "Cardinality",
            "definition": "The count of distinct elements in a multiset or stream."
          },
          {
            "term": "Register merge",
            "definition": "Combining HLLs by taking per-register maxima so partial counts fuse into one estimate."
          },
          {
            "term": "Relative error",
            "definition": "Error expressed as a fraction of the true count, typical for HLL quality discussions."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "When aggregating unique users across shards, merge HLLs; do not sum per-shard estimates, which double-count identities."
        },
        "checkYourself": [
          {
            "prompt": "Why is summing unique counts from each server wrong while merging HLLs can be right?",
            "reveal": "The same user may appear on multiple servers; summing double-counts. HLL merge uses register maxima to approximate the union without enumerating identities."
          }
        ]
      },
      {
        "id": "count-min-and-heavy-hitters",
        "heading": "Count-min sketches and heavy hitters",
        "paragraphs": [
          "Count-min sketch estimates item frequencies with a grid of counters updated by multiple hashes. Queries take the minimum counter across rows to limit overestimation from collisions. The structure can flag heavy hitters—keys whose counts exceed a threshold—without storing every key explicitly. That helps detect hot partitions, popular queries, and abusive IPs.",
          "Error is asymmetric: counts may be overestimated because collisions add noise, but they are not underestimated beyond the noise model in the basic sketch. Systems that need stricter guarantees combine sketches with exact top-k heaps, sampling, or occasional full scans. Space scales with desired error and failure probability, not with the number of distinct keys.",
          "In HLD interviews, connect heavy-hitter detection to mitigation: once a key is hot, apply the controls from partitioning and caching chapters. Sketches are the sensor; splitting and coalescing are the actuators."
        ],
        "keyTerms": [
          {
            "term": "Count-min sketch",
            "definition": "A probabilistic frequency table that overestimates counts due to hash collisions but uses little memory."
          },
          {
            "term": "Heavy hitter",
            "definition": "An item whose frequency exceeds a meaningful fraction of the stream."
          },
          {
            "term": "Overestimate bias",
            "definition": "The tendency of collision-based counters to report frequencies at least as large as truth."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not bill customers from raw count-min estimates. Collisions inflate counts; use exact accounting for money."
        },
        "checkYourself": [
          {
            "prompt": "How can a count-min sketch help a cache admission policy?",
            "reveal": "It estimates whether a key is frequently requested. Rare keys can be excluded from cache to save memory for true hot keys, accepting some estimation error."
          }
        ]
      },
      {
        "id": "placement-and-contracts",
        "heading": "Placement, API contracts, and operations",
        "paragraphs": [
          "Put approximate structures where their error is absorbed. A Bloom filter before a database converts some false positives into extra lookups—the database still returns truth. An HLL behind an analytics API should label results as estimates. A sketch in a security pipeline should escalate to exact inspection when scores cross thresholds.",
          "Memory and CPU budgets belong in capacity plans. Filters sized for last year's n will saturate. Rebuild jobs, scaled strips of filters, and per-shard summaries keep error within contract. Monitor false-positive proxies (extra origin load) and cardinality drift against periodic exact samples.",
          "Explain the trade in product language: \"We spend 1MB to avoid 99% of useless disk seeks, accepting 1% extra checks.\" That sentence is clearer than naming the inventor of the filter. Algorithms earn their place when operators and interviewers can see the saved resource and the residual risk."
        ],
        "keyTerms": [
          {
            "term": "Negative cache",
            "definition": "A structure that cheaply proves absence so the system can skip expensive lookups."
          },
          {
            "term": "Error budget (approx)",
            "definition": "The maximum false-positive or relative error the product accepts for a summary."
          },
          {
            "term": "Periodic exact sample",
            "definition": "A scheduled precise computation used to calibrate or audit approximate metrics."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Always pair the structure with what you save (RAM, disk seeks, network) and what error you accept."
        },
        "checkYourself": [
          {
            "prompt": "Where would you place a Bloom filter in a read-heavy architecture with a remote KV store?",
            "reveal": "Typically in the application or cache layer to skip remote gets for keys that are definitely absent, while still fetching on probable hits and handling false positives with the exact KV response."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Probabilistic structures buy memory and CPU savings with explicit, bounded error.",
        "Bloom filters offer no false negatives and tunable false positives—ideal for negative checks before exact stores.",
        "HyperLogLog estimates distinct counts compactly and merges cleanly across shards; count-min tracks frequencies and heavy hitters.",
        "Keep approximate answers as filters or telemetry, not silent replacements for billing-grade truth."
      ],
      "nextSteps": [
        "Size a Bloom filter for one million keys at 1% false positives and explain where it sits in a read path.",
        "Describe how to merge unique-user HLLs from two regions without double-counting.",
        "List three product metrics that must stay exact and three that may use sketches."
      ]
    }
  },
  "distributed-systems/batch-stream-and-mapreduce": {
    "title": "Batch processing, stream processing, and MapReduce",
    "readingTime": "75-95 min",
    "premise": "Not every computation belongs on the synchronous request path. Indexes, recommendations, billing aggregates, fraud features, and backfills are often built by pipelines that trade freshness for throughput and replayability. This chapter contrasts batch and stream processing, uses MapReduce as a durable mental model for data-parallel work, and covers the operational concerns—skew, checkpoints, lineage—that keep pipelines trustworthy.",
    "parts": [
      {
        "id": "separate-serving-from-compute",
        "heading": "Separate online serving from heavy compute",
        "paragraphs": [
          "User-facing APIs need predictable latency. Scanning a warehouse, joining thirty days of events, or retraining embeddings inside a request handler couples product availability to job runtime. Mature architectures serve from prepared views—caches, indexed documents, feature stores—while asynchronous pipelines refresh those views.",
          "The separation also clarifies ownership. Serving teams care about p99 and error budgets. Data platform teams care about completeness, late data, and cost per TB. Contracts between them are freshness SLAs and schema compatibility, not ad hoc queries from web tiers into raw lakes.",
          "Interviews often start with a product feature that seems online. Push yourself to ask which parts must be synchronous. Autocomplete needs low latency reads of a prepared structure; rebuilding that structure from click logs can be batch or stream. Naming both halves prevents overbuilding real-time systems for problems that tolerate hours of lag."
        ],
        "keyTerms": [
          {
            "term": "Serving path",
            "definition": "The low-latency request/response route that should avoid unbounded scans and heavy joins."
          },
          {
            "term": "Derived view",
            "definition": "A precomputed table, index, or feature set maintained for fast reads."
          },
          {
            "term": "Freshness SLA",
            "definition": "A product agreement for how stale a derived view may be under normal operation."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Ask \"what is the freshest answer the product actually needs?\" before choosing stream over batch."
        },
        "checkYourself": [
          {
            "prompt": "Why might a recommendations API read a feature store instead of joining raw events online?",
            "reveal": "Joining raw events is slow, expensive, and brittle under traffic spikes. A feature store holds prepared signals with a known freshness, keeping the API within latency SLOs."
          }
        ]
      },
      {
        "id": "batch-versus-stream",
        "heading": "Choosing batch versus stream",
        "paragraphs": [
          "Batch processing operates on bounded datasets: yesterday's logs, a full table snapshot, a backfill range. It maximizes throughput, simplifies exactly-once output via replace-on-success semantics, and fits capacities that scale with cluster size. Failures often retry the whole job or stage from clean inputs. Cost is usually lower per byte when latency of hours is acceptable.",
          "Stream processing operates on unbounded event sequences with low delay. It powers alerting, live dashboards, sessionization, and near-real-time personalization. The hard parts are state, late events, watermarks, and exactly-once sinks. Streams shine when the product value decays quickly with time; they cost more in continuous compute and operational complexity.",
          "Hybrid approaches are common. Lambda architectures run a batch layer for accurate historical rebuilds and a speed layer for recent increments, merging at query time. Kappa architectures treat the log as the system of record and recompute by replaying streams. Modern engines blur the line with micro-batches and unified APIs, but the product choice remains freshness versus cost and complexity."
        ],
        "keyTerms": [
          {
            "term": "Bounded dataset",
            "definition": "A finite input with a defined end, typical of batch jobs."
          },
          {
            "term": "Watermark",
            "definition": "A stream progress signal estimating when all events up to a time should have arrived."
          },
          {
            "term": "Lambda / Kappa",
            "definition": "Architectural patterns for combining or unifying batch and streaming reconstructions of derived data."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Pick batch or stream from freshness, cost, and correction needs—not from fashion. Mention late data explicitly if you choose streaming."
        },
        "checkYourself": [
          {
            "prompt": "When is a nightly batch better than a streaming pipeline?",
            "reveal": "When the product tolerates day-old data, inputs arrive as daily dumps, corrections are easier by full recompute, and continuous streaming cost is not justified."
          }
        ]
      },
      {
        "id": "mapreduce-mental-model",
        "heading": "MapReduce as a mental model for data-parallel work",
        "paragraphs": [
          "MapReduce popularized a simple pattern: map transforms records independently into key/value pairs, shuffle groups by key across the cluster, and reduce aggregates each group. Fault tolerance comes from re-running lost tasks on immutable inputs. The model taught a generation of engineers to ask whether a problem is embarrassingly parallel per record or needs a group-by shuffle.",
          "Many modern APIs still mirror that shape even when the engine is Spark, Flink, or a cloud dataflow service. Narrow transformations stay local; wide transformations shuffle. Understanding shuffle cost explains why repartitioning, joins, and global sorts dominate runtime. Speculative execution of straggler tasks is another MapReduce-era lesson that still appears when one partition is skewed.",
          "Not every job fits clean MapReduce. Iterative algorithms want in-memory residencies. Complex DAGs want multiple stages with shared lineage. Still, describing a pipeline as map, shuffle, reduce (or groupByKey, join, aggregate) remains a crisp interview language for large-scale processing."
        ],
        "keyTerms": [
          {
            "term": "Map",
            "definition": "A per-record parallel transform that emits intermediate key/value pairs."
          },
          {
            "term": "Shuffle",
            "definition": "The network redistribution that groups intermediate keys onto reducers."
          },
          {
            "term": "Straggler",
            "definition": "A slow task that delays the whole stage; often mitigated by speculative duplicates."
          }
        ],
        "workedExample": {
          "title": "Word-count style aggregation as MapReduce thinking",
          "body": "Even in a single process, the map/shuffle/reduce stages clarify distributed cost. In a cluster, the shuffle would cross the network.",
          "code": "const events = [\n  { user: \"a\", action: \"view\" },\n  { user: \"b\", action: \"view\" },\n  { user: \"a\", action: \"click\" },\n  { user: \"a\", action: \"view\" }\n];\n\n// Map: emit (user, 1) for views\nconst mapped = events\n  .filter((e) => e.action === \"view\")\n  .map((e) => [e.user, 1]);\n\n// Shuffle: group by key\nconst shuffled = new Map();\nfor (const [k, v] of mapped) {\n  if (!shuffled.has(k)) shuffled.set(k, []);\n  shuffled.get(k).push(v);\n}\n\n// Reduce: sum\nconst reduced = [...shuffled.entries()].map(([k, vals]) => [k, vals.reduce((a, b) => a + b, 0)]);\nconsole.log(Object.fromEntries(reduced)); // { a: 2, b: 1 }",
          "language": "javascript"
        },
        "callout": {
          "tone": "tip",
          "body": "When explaining a big-data job, point to the shuffle edges—that is usually where money and failure live."
        },
        "checkYourself": [
          {
            "prompt": "Why can a tiny fraction of hot keys dominate a MapReduce-style job runtime?",
            "reveal": "Those keys hash to the same reducer partition, creating skew. One task gets huge groups while others idle, so the stage waits on the straggler."
          }
        ]
      },
      {
        "id": "state-checkpoints-replay",
        "heading": "State, checkpoints, replay, and exactly-once sinks",
        "paragraphs": [
          "Streaming jobs keep state: session windows, running aggregates, join buffers. Checkpoints snapshot that state and source offsets so recovery can resume without starting from forever. The interval between checkpoints trades recovery time for overhead. Operators watch checkpoint duration as carefully as throughput.",
          "Replay is a feature. Immutable logs let you recompute derived tables after bugs, add columns, and backfill new consumers. Idempotent sinks or transactional writes prevent double-applied outputs when replay overlaps with retries. \"Effectively once\" usually means deterministic processing plus idempotent or transactional output, not mystical transport magic.",
          "Late data policy must be explicit. Drop, update side outputs, or retract previous results. Watermarks that advance too quickly finalize incomplete windows; watermarks that lag inflate state. Product owners should choose which wrong answer they prefer under delay: missing counts or revising dashboards."
        ],
        "keyTerms": [
          {
            "term": "Checkpoint",
            "definition": "A durable snapshot of stream state and input positions used for recovery."
          },
          {
            "term": "Idempotent sink",
            "definition": "An output writer that can accept retries without duplicating visible effects."
          },
          {
            "term": "Lineage",
            "definition": "Tracked provenance from source datasets through transforms to published outputs."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A pipeline without replay or lineage turns every bad deploy into irrecoverable derived data."
        },
        "checkYourself": [
          {
            "prompt": "What does a checkpoint need to capture besides in-memory aggregates?",
            "reveal": "The corresponding source offsets or log positions so replay does not skip or permanently duplicate input after restore."
          }
        ]
      },
      {
        "id": "skew-validation-ops",
        "heading": "Skew, validation, and operating pipelines",
        "paragraphs": [
          "Data skew appears as hot keys, uneven partitions, and monster joins. Mitigations include key salting, two-phase aggregation, broadcast joins for small dimensions, and isolating whale tenants. Measure partition size histograms, not only job averages. Serving systems taught you about celebrity keys; batch and stream jobs have them too.",
          "Validation gates protect consumers. Row counts, null rates, primary-key uniqueness, and distribution drift checks should block publishing a bad snapshot. Schema evolution needs compatibility rules so producers do not break readers. Dead-letter queues capture poison messages without stalling the whole stream.",
          "Cost governance closes the loop. Scan pruning, partition layout, compression, and warehouse clustering can dominate the bill more than algorithm choice. A design interview that mentions partitioning of the lake and incremental compute sounds more grounded than one that only names a streaming brand."
        ],
        "keyTerms": [
          {
            "term": "Key salting",
            "definition": "Appending a random or ranged suffix to hot keys so work spreads across partitions, then combining results."
          },
          {
            "term": "Poison message",
            "definition": "A record that repeatedly crashes a consumer until quarantined."
          },
          {
            "term": "Incremental compute",
            "definition": "Recomputing only changed partitions or windows instead of full historical rebuilds."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "For any pipeline, mention inputs, output contract, freshness, skew handling, and how you reprocess after a bug."
        },
        "checkYourself": [
          {
            "prompt": "How do you recover if a streaming aggregator had a logic bug for three hours?",
            "reveal": "Fix the code, replay the log or source from the bug start with idempotent sinks or a corrected output version, and invalidate or replace the tainted derived window."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Keep heavy computation off the synchronous serving path; refresh derived views asynchronously.",
        "Choose batch vs stream from freshness, cost, late data, and correction needs.",
        "MapReduce's map/shuffle/reduce model still explains parallel work and skew even on modern engines.",
        "Checkpoints, replay, lineage, and validation make pipelines operable and trustworthy."
      ],
      "nextSteps": [
        "Take a product metric and split it into an online read path and an offline or streaming refresh path.",
        "Explain one shuffle-heavy join and a strategy to reduce skew.",
        "Describe a replay plan after a bad aggregator ships."
      ]
    }
  }
};
