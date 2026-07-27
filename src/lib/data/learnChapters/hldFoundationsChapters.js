/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldFoundationsChapters = {
  "foundations/problem-framing": {
    title: "Problem framing and requirements",
    readingTime: "75-95 min",
    premise:
      "System design interviews are won or lost in the first ten minutes. Before boxes appear on the whiteboard, you must turn a vague product prompt into a narrow set of actors, workflows, constraints, and success metrics. This chapter teaches that framing discipline as a repeatable craft.",
    parts: [
      {
        id: "open-with-the-user-journey",
        heading: "Open with the user journey, not the database",
        paragraphs: [
          "A strong framing starts with who uses the system and what they are trying to finish. Actors are not only end users. They include producers, consumers, operators, bots, partner APIs, and batch jobs. For a notifications product, the actors might be an application that emits events, a preference service that decides channel eligibility, a delivery worker, and a recipient who may open the message on mobile or email. Naming actors early prevents you from designing a storage layer for an imaginary workload.",
          "The most common request path is more important than an exhaustive feature list. Ask what happens one hundred times for every rare admin action. In a social feed, the hot path is usually reading a personalized timeline. In a payments product, the hot path may be authorize-and-capture with idempotent retries. In a URL shortener, redirects dominate writes. When you can narrate the happy path in one or two sentences, you already know which latency budget, consistency rule, and scaling lever matter first.",
          "Scope control is part of framing. Interview prompts often hide optional surfaces such as analytics dashboards, moderation tools, or multi-tenant admin consoles. Call those out, then park them. Say what the v1 must do, what can wait, and what you will deliberately leave as a future extension. Interviewers reward candidates who protect depth by refusing to boil the ocean."
        ],
        keyTerms: [
          {
            term: "Primary actors",
            definition: "The people or systems whose most frequent workflows must succeed for the product to be useful."
          },
          {
            term: "Hot path",
            definition: "The request or event flow that dominates traffic, latency risk, or cost and therefore anchors the first design."
          },
          {
            term: "v1 scope",
            definition: "The smallest coherent product surface that still satisfies the interview's core requirements."
          }
        ],
        callout: {
          tone: "interview",
          body: "Spend the opening minutes naming actors, the hottest path, and one explicit non-goal. Boxes come after that sentence is crisp."
        },
        checkYourself: [
          {
            prompt: "Why is jumping to Kafka or Cassandra before framing usually a weak start?",
            reveal:
              "Those choices encode assumptions about fan-out, durability, and access patterns that may not match the actual hot path. Framing first tells you whether you even need them."
          }
        ]
      },
      {
        id: "functional-vs-non-functional",
        heading: "Separate functional goals from non-functional budgets",
        paragraphs: [
          "Functional requirements describe what the system must do: create a short link, place an order, deliver a chat message, serve a video. Non-functional requirements describe how well it must do those things: latency percentiles, availability targets, consistency expectations, durability, privacy, cost ceilings, and abuse resistance. Mixing the two categories produces muddy designs where every feature silently inherits impossible guarantees.",
          "Translate business language into engineering budgets as soon as you can. \"Feels instant\" might mean p95 under 200 ms for reads from a nearby region. \"Never lose money\" means durable writes, idempotent payment intents, and audit logs. \"Works worldwide\" implies multi-region routing and edge caching, not merely a single VPC in one cloud region. Write the translation aloud so the interviewer can correct the assumptions before architecture hardens.",
          "Not every endpoint deserves the same budget. Login, checkout, and permission checks often need stricter correctness than feed ranking or recommendation cards. Analytics ingestion can tolerate delay that chat acknowledgements cannot. Framing is the moment to differentiate critical paths from best-effort paths. That differentiation later justifies queues, eventual consistency, and degraded modes without sounding like hand-waving."
        ],
        keyTerms: [
          {
            term: "Functional requirement",
            definition: "A capability the system must provide to complete a user or business workflow."
          },
          {
            term: "Non-functional requirement",
            definition: "A quality attribute such as latency, availability, durability, privacy, or cost that constrains how capabilities are delivered."
          },
          {
            term: "Critical path",
            definition: "An operation whose failure or delay has outsized product or revenue impact and therefore needs tighter guarantees."
          }
        ],
        callout: {
          tone: "tip",
          body: "When a stakeholder says \"reliable,\" ask whether they mean available, durable, consistent, or all three. Those words pull designs in different directions."
        },
        checkYourself: [
          {
            prompt: "Give one functional and one non-functional requirement for a ride-hailing matching service.",
            reveal:
              "Functional: match a rider request to a nearby available driver. Non-functional: return a candidate within a few seconds at peak city load, with location freshness tight enough that matches remain geographically valid."
          }
        ]
      },
      {
        id: "constraints-that-reshape-architecture",
        heading: "Constraints that reshape architecture early",
        paragraphs: [
          "Some requirements barely change the boxes. Others rewrite the whole diagram. Correctness constraints are especially powerful. If two users must never see conflicting account balances, you need an authoritative write path, careful concurrency control, and usually fail-closed behavior under partition. If a social like counter can be approximate, you can use caches, async fan-out, and eventual repair. Identify the constraints that force strong coordination before you invent clever topology.",
          "Traffic shape matters as much as traffic volume. Read-heavy systems invite caches and CDNs. Write-heavy systems push you toward sharding, append-only logs, and careful hotspot management. Spiky workloads need queues and admission control. Multi-tenant SaaS adds noisy-neighbor isolation. Geographic footprint decides whether a single-region design is honest or fantasy. Ask for peak QPS, growth assumptions, object sizes, and where users live, even if the numbers are rough.",
          "Operational and product constraints often hide in the prompt. Moderation, GDPR deletion, audit trails, content safety, and partner rate limits can dominate later architecture if ignored. Abuse prevention is not an afterthought for public APIs. Compliance can force data residency. Mobile clients with old app versions force API evolution discipline. Surface these early, then decide which belong in v1 versus a later phase."
        ],
        keyTerms: [
          {
            term: "Authoritative write path",
            definition: "The single logical place where a critical mutation becomes durable and accepted as source of truth."
          },
          {
            term: "Traffic shape",
            definition: "The mix of reads versus writes, burstiness, object sizes, and geographic distribution that characterizes the workload."
          },
          {
            term: "Fail-closed",
            definition: "A behavior that rejects or blocks an action when correct state cannot be verified, preferring safety over continued service."
          }
        ],
        workedExample: {
          title: "Framing a notifications service in five questions",
          body: "These questions convert a vague \"design notifications\" prompt into constraints that decide queues, fan-out, and delivery semantics.",
          code: "1. Who emits events and who receives them?\n   apps, users, devices, email/SMS/push providers\n2. What is the hottest delivery path?\n   e.g. mobile push for transactional alerts\n3. Delivery semantics?\n   best-effort vs at-least-once + dedupe + ordering per user\n4. Peak fan-out and geography?\n   50k QPS emit, bursts to 5M fan-out, multi-region\n5. What must still work in partial outage?\n   transactional alerts yes; marketing digests can delay",
          language: "text"
        },
        callout: {
          tone: "warning",
          body: "Do not treat consistency, durability, and availability as synonyms. A system can acknowledge writes that later vanish, or stay available while serving stale reads."
        },
        checkYourself: [
          {
            prompt: "Which requirement usually changes architecture more: shaving 20 ms of median latency or guaranteeing no duplicate charges?",
            reveal:
              "No duplicate charges. Idempotency, transactional boundaries, and authoritative ledgers reshape storage and workflow design far more than a modest median latency improvement."
          }
        ]
      },
      {
        id: "baseline-then-tradeoffs",
        heading: "State assumptions, draw a baseline, then explore trade-offs",
        paragraphs: [
          "After requirements are clear enough, announce assumptions explicitly. Example: 10 million DAU, average 20 reads and 2 writes per user per day, peak factor of 5, average payload 2 KB, single primary region for v1 with a warm standby. Wrong assumptions are fine if they are visible. Invisible assumptions cause designs that cannot be challenged productively.",
          "Draw one baseline architecture quickly: clients, edge, application tier, primary datastore, and any unavoidable async path. The baseline should be boring enough to explain in under a minute. Its job is not to impress. Its job is to create a concrete object you and the interviewer can stress. From there, identify the first likely bottleneck and the first scaling lever you would keep available, such as a partition key, cacheable response shape, or event log.",
          "Use the rest of the interview to deepen trade-offs rather than redrawing from scratch. Compare strong versus eventual consistency on specific operations. Compare sync fan-out versus async fan-out. Compare monolith modules versus extracted services only when a pressure signal appears. Framing succeeds when every later component can be justified as solving a named constraint from the opening."
        ],
        keyTerms: [
          {
            term: "Baseline architecture",
            definition: "A simple end-to-end design that satisfies v1 requirements and becomes the reference for later trade-off discussion."
          },
          {
            term: "Scaling lever",
            definition: "A design choice that preserves a low-friction way to add capacity later, such as stateless compute or a natural partition key."
          },
          {
            term: "Assumption ledger",
            definition: "The explicit list of traffic, consistency, and scope assumptions under which the design is valid."
          }
        ],
        callout: {
          tone: "tip",
          body: "If the interviewer has not corrected your assumptions after you state them, proceed. Revisit only when a later decision is sensitive to one of those numbers."
        },
        checkYourself: [
          {
            prompt: "What should you draw first after framing a URL shortener?",
            reveal:
              "A baseline with write API for create, datastore for mappings, and a read path for redirects—then estimate QPS and storage before introducing caches, shards, or analytics."
          }
        ]
      },
      {
        id: "framing-by-product-type",
        heading: "How framing changes by product type",
        paragraphs: [
          "Internal admin tools and global consumer apps share vocabulary but not priorities. An internal tool often biases toward correctness, auditability, simpler topology, and proximity to the source of truth. A global consumer app adds multi-region latency, CDN strategy, abuse controls, graceful degradation, and client diversity much earlier. Saying this distinction aloud shows product judgment, not just infrastructure fluency.",
          "Communications products emphasize fan-out, ordering, and delivery semantics. Marketplaces emphasize inventory races, search freshness, and payment integrity. Media products emphasize large objects, bandwidth, and cache hierarchy. Collaboration products emphasize concurrent edits and conflict resolution. When you recognize the product family, you can ask the high-leverage questions instead of a generic checklist.",
          "In interviews, practice a closing frame sentence: \"For v1 we will optimize X under constraints Y and Z, accepting degraded behavior W outside that envelope.\" That sentence is the spine of a senior answer. Everything after it—capacity math, CAP choices, queues, caches—should hang from that spine."
        ],
        keyTerms: [
          {
            term: "Graceful degradation",
            definition: "A planned reduction in features or freshness that keeps core workflows usable during overload or partial failure."
          },
          {
            term: "Delivery semantics",
            definition: "The promised behavior for message or event delivery, such as best-effort, at-least-once, or effectively-once with deduplication."
          },
          {
            term: "Product family",
            definition: "A category of systems that share recurring constraint patterns, such as feeds, payments, or collaborative editors."
          }
        ],
        callout: {
          tone: "interview",
          body: "Compare an internal admin tool to a global consumer app in one breath: correctness and simplicity versus latency, abuse, and multi-region degradation."
        },
        checkYourself: [
          {
            prompt: "Name two framing questions that matter more for a global chat app than for an internal inventory admin UI.",
            reveal:
              "Cross-region latency and offline/reconnect behavior, plus abuse and spam controls at the edge. The admin UI cares more about audit trails and strong consistency near the source of truth."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Frame actors, hot paths, and explicit non-goals before introducing components.",
        "Translate business language into latency, consistency, durability, and abuse budgets per critical operation.",
        "State numeric assumptions, draw a boring baseline, then deepen trade-offs against named constraints.",
        "Product type changes which questions are high leverage; do not run a generic script blindly."
      ],
      nextSteps: [
        "Practice a five-question framing for notifications, URL shortener, and ride matching.",
        "Write a one-sentence v1 spine for a payments flow that separates durability from best-effort notifications.",
        "List three requirements that would force you to redraw a baseline architecture rather than tune it."
      ]
    }
  },

  "foundations/capacity-estimation": {
    title: "Back-of-the-envelope estimation",
    readingTime: "80-100 min",
    premise:
      "Capacity estimation is not about fake precision. It is about order-of-magnitude arithmetic that connects product stories to QPS, storage growth, bandwidth, and the next architectural decision. Interviewers listen for directional honesty and design consequences, not calculator theater.",
    parts: [
      {
        id: "from-product-story-to-qps",
        heading: "From product story to QPS and storage growth",
        paragraphs: [
          "Start from a human-scale story: daily active users, actions per user, and average object size. Convert carefully. If 10 million DAU each perform 20 reads and 2 writes per day, average read QPS is about 10e6 * 20 / 86400 ≈ 2300, and write QPS is about 230. Peak is not average. For consumer apps, peaks of 2x to 5x are common; for event-driven spikes, 10x or more can appear. Always state the peak factor you are using.",
          "Storage estimates need primary bytes plus the invisible companions: indexes, replicas, backups, caches, and derived views. A 500-byte logical record can become multiple kilobytes once secondary indexes, replication factor three, and weekly backups enter the picture. Write amplification is the same idea on the path side: one user write may update a primary row, an index, a search document, a cache invalidation, and an analytics event.",
          "Bandwidth follows from QPS times payload size times fan-out. A feed read that gathers 50 items of 2 KB each is 100 KB before compression and protocol overhead. At thousands of QPS, that becomes gigabits quickly. Estimating bandwidth early tells you whether a CDN, pagination, or denser payloads are mandatory rather than optional polish."
        ],
        keyTerms: [
          {
            term: "Average QPS",
            definition: "Total requests in a period divided by seconds in that period; a steady-state reference, not a capacity plan by itself."
          },
          {
            term: "Peak factor",
            definition: "The multiplier from average load to busy-period load used for provisioning and bottleneck analysis."
          },
          {
            term: "Write amplification",
            definition: "Extra storage or network writes generated by indexes, replicas, logs, and derived data beyond the user's logical mutation."
          }
        ],
        callout: {
          tone: "tip",
          body: "Keep powers of ten handy: 1 day ≈ 10^5 seconds, so daily actions divided by 10^5 is a fast average-QPS estimate."
        },
        checkYourself: [
          {
            prompt: "Why is average QPS alone a dangerous sizing input?",
            reveal:
              "Bursts, diurnal peaks, and launch spikes drive saturation, queueing, and timeouts. Capacity must cover the busy period and failure-recovery load, not only the daily mean."
          }
        ]
      },
      {
        id: "mental-reference-numbers",
        heading: "Mental reference numbers that reject bad designs",
        paragraphs: [
          "Carry a small set of latency and size anchors. Memory access is nanoseconds to low microseconds. Same-datacenter network round trips are often hundreds of microseconds to low milliseconds. Cross-region round trips are tens to hundreds of milliseconds. Disk and object-store operations vary widely but are usually far slower than memory or local SSD caches. These anchors help you reject designs that put synchronous cross-region calls inside a 50 ms budget.",
          "Size anchors matter too. 1 KB ≈ 10^3 bytes, 1 MB ≈ 10^6, 1 GB ≈ 10^9, 1 TB ≈ 10^12. A million 1 KB objects are about a gigabyte before overhead. A billion rows at 300 bytes are hundreds of gigabytes for the primary copy alone. If your design assumes a single laptop disk holds all global history forever, the estimate should embarrass that assumption immediately.",
          "Infrastructure throughput anchors are coarser but useful. A single well-tuned database primary might handle thousands to tens of thousands of simple QPS depending on query shape. A cache can often serve orders of magnitude more. A CDN edge can absorb enormous static read volume. You do not need vendor datasheets in an interview; you need enough intuition to say when one box is implausible and sharding or caching becomes mandatory."
        ],
        keyTerms: [
          {
            term: "Latency hierarchy",
            definition: "The orders-of-magnitude gap between memory, local network, cross-region network, and cold storage access times."
          },
          {
            term: "Working set",
            definition: "The subset of data that is frequently accessed and therefore most relevant for cache and memory sizing."
          },
          {
            term: "Order-of-magnitude check",
            definition: "A quick estimate used to accept or reject a design choice without claiming exact forecasting precision."
          }
        ],
        callout: {
          tone: "warning",
          body: "If a synchronous dependency is across regions, treat that cost as part of the user-visible budget unless you have evidence it is rare or asynchronous."
        },
        checkYourself: [
          {
            prompt: "A design needs p95 under 100 ms and performs two sequential cross-region reads. What should you say?",
            reveal:
              "The latency budget is likely impossible under normal cross-region RTT. Collapse the reads into one region, cache, parallelize with care, or relax the SLO for that path."
          }
        ]
      },
      {
        id: "worked-url-shortener-storage",
        heading: "Worked example: URL shortener storage and traffic",
        paragraphs: [
          "Suppose 100 million new links per month. That is about 3.3 million writes per day and average write QPS around 40, with a peak perhaps a few hundred. Redirects are the real traffic: if each link is used 20 times per month on average, read volume is about 2 billion redirects per month, or roughly 800 average QPS, peaking perhaps at a few thousand. Those numbers already suggest a cache-friendly read path and a modest write path.",
          "For storage, assume each mapping stores an 8-byte id, a 100-byte long URL, timestamps, and owner metadata for a logical 200 to 300 bytes. At 1.2 billion links per year, primary data is on the order of a few hundred gigabytes. Add secondary indexes, replication factor three, and backups, and the operational footprint moves toward low terabytes. The estimate is not a purchase order; it tells you a single huge table is plausible early, while analytics copies and multi-region replicas change planning.",
          "The architectural consequences are the point. Reads dominate, so caching popular redirects and using a CDN or edge cache for hot aliases can matter more than exotic write stores. Writes are append-mostly mappings, so a simple keyed store with unique short-code allocation is enough for a long time. Estimates that do not change a design decision can stay coarse; estimates that sit near a cliff need refinement."
        ],
        workedExample: {
          title: "Rough yearly footprint for 100M new links/month",
          body: "Show assumptions, then multiply. Interviewers care about the trail of reasoning.",
          code: "new_links_year = 100e6 * 12 = 1.2e9\nbytes_per_row  ≈ 300  (url + metadata)\nprimary        ≈ 1.2e9 * 300 ≈ 360 GB\nRF=3 replicas  ≈ 1.1 TB\n+ indexes/backups/analytics → low single-digit TB class\n\nredirects_month ≈ 100e6 * 20 = 2e9\navg_redirect_qps ≈ 2e9 / 2.6e6 ≈ 770\npeak_qps ≈ 770 * 3..5 ≈ 2k-4k  (justify peak factor)",
          language: "text"
        },
        keyTerms: [
          {
            term: "Primary footprint",
            definition: "Bytes required to store the logical records themselves before replicas, indexes, and derived copies."
          },
          {
            term: "Operational footprint",
            definition: "Total storage and bandwidth needed to run the system safely, including redundancy and secondary data products."
          }
        ],
        callout: {
          tone: "interview",
          body: "Say the assumptions before the arithmetic. \"Assuming 300 bytes per row and RF=3...\" is stronger than a naked terabyte claim."
        },
        checkYourself: [
          {
            prompt: "How does a read-heavy social feed change cache estimation compared with a URL shortener?",
            reveal:
              "Feed caches are sized from the hot working set of active users and timeline objects per session, not from total historical posts. Popularity skew and TTLs dominate more than total corpus size."
          }
        ]
      },
      {
        id: "hot-keys-and-recovery-bandwidth",
        heading: "Hot keys, skew, and recovery bandwidth",
        paragraphs: [
          "Total volume can look fine while a few keys burn a hole in the design. Celebrity accounts, viral posts, popular short links, and \"global counter\" keys create hot partitions. Estimate not only average QPS per shard but the top-key rate. If one key attracts 5% of traffic, your sharding story must include caching, key salting, or hierarchical aggregation. Ignoring skew is one of the most common estimation failures.",
          "Recovery bandwidth is another hidden term. Rebuilding a replica, replaying a day of events, or restoring from backup can consume as much or more capacity than steady-state user traffic. If you cannot catch up faster than new data arrives, an incident becomes permanent lag. Ask whether your design has enough spare disk, network, and consumer capacity for repair, not only for sunny-day load.",
          "Growth changes the next step. An estimate that fits one primary today should include the trigger for sharding, tiering cold data, or splitting read replicas. Good interview answers narrate the staircase: what works at 1x, what breaks near 10x, and which lever you pull first. Estimation without a staircase is trivia."
        ],
        keyTerms: [
          {
            term: "Hot key",
            definition: "A disproportionately popular item or partition that concentrates load beyond what average-per-shard math predicts."
          },
          {
            term: "Recovery bandwidth",
            definition: "The spare throughput available to rebuild replicas, replay logs, or restore backups without starving live traffic."
          },
          {
            term: "Growth staircase",
            definition: "A sequence of capacity thresholds and architectural changes planned for successive order-of-magnitude increases."
          }
        ],
        callout: {
          tone: "warning",
          body: "If your shard math uses average load only, ask what happens when one partition takes 10x its fair share."
        },
        checkYourself: [
          {
            prompt: "When is a rough estimate enough, and when should you refine it?",
            reveal:
              "Rough estimates suffice to rule out impossible designs by order of magnitude. Refine when a decision sits near a cost, latency, or storage cliff where a 2x error would change the architecture."
          }
        ]
      },
      {
        id: "tie-numbers-to-choices",
        heading: "Tie every estimate to an architecture choice",
        paragraphs: [
          "Numbers earn their keep when they justify a component. High global static read volume justifies a CDN. Write QPS beyond one primary justifies partitioning. Burst fan-out justifies a queue. Large working sets with high reuse justify caches. Tiny QPS with strict correctness may justify a single strongly consistent database and almost nothing else. Make the sentence explicit: \"Because peak redirect QPS is a few thousand with heavy key skew, I would put a cache in front before sharding.\"",
          "Avoid ornamental precision. Calculating 847.3 QPS when your peak factor is a guess to within 2x is false rigor. Prefer ranges and sensitivity: \"If peak is 3x we stay on one primary; if 10x we shard by short-code prefix.\" That style shows engineering judgment under uncertainty, which is the real skill being tested.",
          "Close estimation by listing what you did not size yet. Maybe machine-learning features, media blobs, or audit archives are out of scope. Naming the omissions prevents the interviewer from thinking you forgot them. Capacity estimation is a conversation tool, not a final bill of materials."
        ],
        keyTerms: [
          {
            term: "Sensitivity range",
            definition: "An estimate expressed as a band under alternate assumptions, used to see whether a decision is robust."
          },
          {
            term: "Justification link",
            definition: "The explicit connection from a calculated quantity to a concrete design choice."
          }
        ],
        callout: {
          tone: "interview",
          body: "After each calculation, add one clause starting with \"so we should...\" If you cannot finish the clause, the number was decorative."
        },
        checkYourself: [
          {
            prompt: "What architectural choice does a multi-TB/year media upload estimate usually force you to discuss?",
            reveal:
              "Object storage for blobs, separate metadata indexes, CDN or edge delivery for reads, and lifecycle policies for cold tiers—not stuffing large binaries into the primary transactional database."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Convert DAU, actions, and object sizes into average and peak QPS, storage growth, and bandwidth with explicit assumptions.",
        "Include replicas, indexes, caches, write amplification, hot keys, and recovery traffic in the operational picture.",
        "Use latency and size reference numbers to reject designs that violate physics or budgets.",
        "Every estimate should justify a component, threshold, or deferred decision."
      ],
      nextSteps: [
        "Recompute the URL shortener example with your own object size and peak factor assumptions.",
        "Estimate cache footprint for a feed using active users, items per session, and TTL.",
        "Practice stating a growth staircase from 1x to 10x for one datastore."
      ]
    }
  },

  "foundations/performance-vs-scalability": {
    title: "Performance vs. scalability",
    readingTime: "70-90 min",
    premise:
      "Performance asks how fast and efficient the system is at today's scale. Scalability asks how the shape of the system changes as load, data, and organization grow. Confusing the two produces designs that look fast in a demo and collapse under success.",
    parts: [
      {
        id: "performance-now",
        heading: "Performance is about the current experience",
        paragraphs: [
          "Performance is measured on the paths users feel: request latency, time to first byte, render completeness, and the resources burned to get there. CPU, memory, lock contention, and chatty I/O are performance concerns when they inflate those paths today. A system can be highly performant on one box and still be a scalability trap if every request depends on a single global lock or a single writer.",
          "Always separate central tendency from tails. Median or p50 latency describes the typical experience. p95 and p99 describe the unhappy minority that often drives complaints, timeouts, and cascading retries. Optimizing only the average can hide a hot lock, a cold cache path, or a noisy neighbor that ruins tails. Performance work that ignores tails is incomplete for user-facing products.",
          "Performance tuning usually attacks the critical path or the hot key. Profiling, tracing, and targeted caching beat vague \"add more servers\" advice when the bottleneck is algorithmic or contended. In interviews, show that you can name the first performance bottleneck at current scale before inventing a distributed rewrite."
        ],
        keyTerms: [
          {
            term: "Performance",
            definition: "How efficiently the system serves the current workload, typically visible as latency, resource cost per request, and tail behavior."
          },
          {
            term: "Tail latency",
            definition: "High-percentile response times that capture the slowest successful or timed-out requests users still experience."
          },
          {
            term: "Critical path",
            definition: "The dependent sequence of work that determines end-to-end latency for a request."
          }
        ],
        callout: {
          tone: "tip",
          body: "Ask for p50 and p99 together. A pretty average with a ugly p99 is a production incident waiting for traffic."
        },
        checkYourself: [
          {
            prompt: "Can a design be fast and still scale poorly? Give an example.",
            reveal:
              "Yes. A single large relational primary can be very fast early, yet every growth step eventually collides with one writer, one failover domain, or one vertical ceiling."
          }
        ]
      },
      {
        id: "scalability-shape",
        heading: "Scalability is about shape under growth",
        paragraphs: [
          "Scalability is the ability to add capacity for traffic, data, or teams without latency, downtime, coordination cost, or operator effort rising at the same rate. Horizontal scalability usually depends on stateless compute, partitionable state, and asynchronous work where strict coupling is unnecessary. If every request needs a globally serialized counter, your scalability ceiling is social and physical, not just monetary.",
          "Look for coordination choke points. Global locks, single leaders on every path, chatty cross-shard transactions, and shared mutable tables across many services all convert growth into contention. Some leader-based designs are acceptable when the leadered scope is small and well bounded. The warning sign is a leader or lock on the hottest request path with no escape hatch.",
          "Operational scalability belongs in the same conversation. A design that requires a growing army of humans to shard manually, babysit failover, or understand a maze of hidden couplings is not scalable for the organization. Team ownership boundaries, deployment independence, and observability are part of the scalability shape, especially as companies grow beyond one squad."
        ],
        keyTerms: [
          {
            term: "Scalability",
            definition: "How gracefully capacity, latency, and operational cost behave as load, data volume, or organization size increase."
          },
          {
            term: "Horizontal scaling",
            definition: "Adding more machines or partitions to absorb load, typically requiring partitionable state and minimal per-request coordination."
          },
          {
            term: "Coordination choke point",
            definition: "A shared lock, leader, or synchronized step that serializes work and limits scale regardless of added hardware."
          }
        ],
        callout: {
          tone: "interview",
          body: "Define scalability to a non-infra stakeholder as: serving much more demand without pain, cost, and downtime growing just as fast."
        },
        checkYourself: [
          {
            prompt: "Why is \"we can add more servers\" not automatically proof of scalability?",
            reveal:
              "Extra servers help only if work can be split without proportional coordination. Contended locks, sticky state, or cross-shard transactions can waste the added machines."
          }
        ]
      },
      {
        id: "vertical-vs-horizontal",
        heading: "Vertical scaling, horizontal scaling, and when each wins",
        paragraphs: [
          "Vertical scaling means buying a bigger machine: more CPU, RAM, and faster disks. It is often the correct early answer. It preserves transactional simplicity, keeps debugging local, and avoids distributed failure modes. Many products should vertically scale a primary database until a concrete pressure appears. Premature sharding is a common self-inflicted wound.",
          "Horizontal approaches age better when a single machine's limits are near, when failure domains must shrink, or when workloads are uneven across features. Stateless application tiers almost always want horizontal scale behind a load balancer. State tiers need a partition key, careful rebalancing, and a plan for cross-partition queries. The interview skill is saying which tier you scale which way and why.",
          "Escape hatches matter more than slogans. Even while vertically scaling, you can choose a data model with a natural partition key, emit an event log, or keep sessions out of local memory. Those choices keep future horizontal moves incremental instead of forcing a rewrite under page. Performance work today should leave scalability options intact."
        ],
        keyTerms: [
          {
            term: "Vertical scaling",
            definition: "Increasing the resources of a single node to improve capacity or performance without distributing the workload."
          },
          {
            term: "Escape hatch",
            definition: "A design choice that preserves a future scaling path without forcing that path immediately."
          },
          {
            term: "Partition key",
            definition: "An attribute used to split data and traffic across shards so most operations stay local to one partition."
          }
        ],
        workedExample: {
          title: "Choosing the next 10x step for a checkout service",
          body: "Narrate phase-appropriate choices instead of jumping to microservices.",
          code: "now:  modular monolith + one primary DB (vertical headroom)\n+3x:  read replicas for catalogs; keep checkout writes on primary\n+10x: shard inventory by warehouse_id; keep payments ledger unsharded\navoid: extracting 12 services before deploy contention or scaling skew appears",
          language: "text"
        },
        callout: {
          tone: "tip",
          body: "Vertical scaling is right when the workload still fits, simplicity wins, and you are buying time—not when you pretend one box is infinite."
        },
        checkYourself: [
          {
            prompt: "When is vertical scaling the right interview answer?",
            reveal:
              "When you need quick headroom, the data and QPS still fit comfortably on one primary, and distributed coordination would cost more complexity than it buys."
          }
        ]
      },
      {
        id: "tradeoff-language",
        heading: "Use both ideas in trade-off language",
        paragraphs: [
          "Senior answers optimize the first real bottleneck, not a hypothetical future one. If today's pain is p99 latency from an N+1 query, fix the query and add a cache before redesigning the company around microservices. If today's pain is deploy contention across three teams in one binary, modularization or extraction may be the scalability move even while latency is fine.",
          "State which phase you are optimizing. \"For v1, I will favor a single primary for correctness and performance; the partition key on user_id keeps a horizontal path open when write QPS exits one-box comfort.\" That sentence shows you can hold both time horizons without overbuilding. Interviewers are allergic to architecture astronomy disconnected from the current constraint.",
          "Prefer incremental scalability over all-at-once rewrites. Introduce read replicas before full sharding. Extract one hot service before exploding into dozens. Add async pipelines for heavy side effects before making the entire write path distributed. Each increment should buy measurable capacity or organizational relief."
        ],
        keyTerms: [
          {
            term: "Phase-appropriate design",
            definition: "Choosing simplicity or distribution based on the current bottleneck and near-term growth, not fashion."
          },
          {
            term: "Incremental scalability",
            definition: "Adding capacity and isolation in steps that preserve operability and avoid big-bang migrations."
          }
        ],
        callout: {
          tone: "warning",
          body: "Calling a system scalable because it has high throughput today is incomplete unless you explain coordination costs at 10x."
        },
        checkYourself: [
          {
            prompt: "How would you explain the difference to a product manager in one sentence each?",
            reveal:
              "Performance: how snappy it feels right now. Scalability: how much harder life gets when we have ten times the users, data, or teams."
          }
        ]
      },
      {
        id: "org-and-failure-domains",
        heading: "Failure domains and organizational scale",
        paragraphs: [
          "Scalability also means shrinking blast radius. One oversized primary is a performance hero and a failure-domain villain. Replicas, zones, and regional isolation improve survival under growth and incidents. The same pattern applies to teams: a monolith module boundary that nobody respects becomes an organizational hotspot just like a contended row lock.",
          "Designs that scale technically but require perfect human coordination do not scale in practice. Shared mutable databases across many teams recreate distributed monoliths. Clear ownership, contracts, and limited synchronous coupling are scalability features. Mention them when interview prompts involve multiple squads or long-term evolution.",
          "Close by naming the first component that becomes the bottleneck and the next lever. That habit connects performance diagnosis to scalability planning and keeps the conversation concrete."
        ],
        keyTerms: [
          {
            term: "Blast radius",
            definition: "The portion of users, data, or features affected when a component fails or is overloaded."
          },
          {
            term: "Distributed monolith",
            definition: "A set of services that are deployed separately but remain tightly coupled through shared data or synchronous chains, inheriting the worst of both styles."
          }
        ],
        callout: {
          tone: "interview",
          body: "End with: first bottleneck, why it hurts, and the next 10x lever. That triad signals senior structure."
        },
        checkYourself: [
          {
            prompt: "Give an example where operational complexity, not CPU, is the scalability limit.",
            reveal:
              "Dozens of poorly observed microservices that cannot be tested locally, where every feature needs a distributed transaction and on-call cannot tell which hop failed."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Performance describes today's latency and efficiency; scalability describes growth behavior for load, data, and teams.",
        "Measure tails, find the current bottleneck, and avoid mistaking one fast box for an indefinite strategy.",
        "Vertical scaling is often right early; preserve partition keys and stateless tiers as escape hatches.",
        "Incremental, phase-appropriate changes beat fashionable distributed rewrites."
      ],
      nextSteps: [
        "Pick one system you know and name its first performance bottleneck versus its first scalability cliff.",
        "Practice explaining vertical versus horizontal choices for app tier and data tier separately.",
        "Write a 1x → 3x → 10x staircase for a checkout database."
      ]
    }
  },

  "foundations/latency-throughput-slos": {
    title: "Latency, throughput, and SLOs",
    readingTime: "80-100 min",
    premise:
      "Latency, throughput, and service level objectives are the shared language between product promises and engineering controls. Queues, caches, replicas, and admission control only make sense when tied to what users feel and what the system can sustain.",
    parts: [
      {
        id: "latency-budgets",
        heading: "Latency is the user-visible delay",
        paragraphs: [
          "Latency is the time from initiation to useful completion for a request or interaction. It accumulates from DNS, TLS, network hops, queues, serialization, authentication, business logic, locks, storage I/O, and retries. In fan-out architectures, the slowest dependency often dominates because the parent waits for the last child. That is why one bad microservice can ruin an otherwise healthy page.",
          "Percentiles beat averages for user experience. p50 captures the typical path. p95 and p99 capture tail pain from garbage collection, cache misses, noisy neighbors, and overloaded shards. Checkout, authentication, and trading flows usually optimize tails because the slowest successful requests abandon carts or trip timeouts. Dashboards that show only averages hide the incidents users report.",
          "Latency budgets make design honest. If the page SLO is 300 ms p95, you can allocate milliseconds to edge, app, and database, then reject synchronous cross-region calls that consume the whole budget. Budgets also reveal when work must become asynchronous: sending email, recomputing recommendations, or updating secondary indexes often should leave the user-critical path."
        ],
        keyTerms: [
          {
            term: "Latency",
            definition: "Elapsed time for a unit of work to complete from the requester's perspective."
          },
          {
            term: "Latency budget",
            definition: "An allocation of end-to-end delay across hops used to evaluate whether a design can meet its SLO."
          },
          {
            term: "Fan-out latency",
            definition: "End-to-end delay driven largely by waiting for multiple dependent downstream calls, often dominated by the slowest one."
          }
        ],
        callout: {
          tone: "tip",
          body: "When drawing sequence diagrams, annotate rough millisecond costs on each hop. Budgets become visible immediately."
        },
        checkYourself: [
          {
            prompt: "Why can one slow dependency dominate a request that fans out to ten services?",
            reveal:
              "If the parent waits for all children, end-to-end latency tracks the maximum child latency (plus local work), so a single straggler sets the tail."
          }
        ]
      },
      {
        id: "throughput-and-concurrency",
        heading: "Throughput is sustained work per unit time",
        paragraphs: [
          "Throughput measures how much work the system completes per second, minute, or day: requests, messages, bytes, or jobs. It depends on concurrency, parallelism, batching, and how much coordination each unit requires. A service can have free CPU and still be throughput-limited by lock contention, connection pool exhaustion, disk queues, or downstream rate limits.",
          "Little's Law is a useful intuition pump: concurrency ≈ throughput × latency. If you want higher throughput at the same latency, you need more parallel capacity. If latency rises under load, the same offered throughput consumes more in-flight work and can saturate memory, sockets, or thread pools. This relationship explains why latency and throughput degrade together near overload.",
          "Queues smooth bursts and can raise useful sustained throughput by decoupling producers from consumers. They do not magically improve user latency; waiting in a queue is still waiting. Batching increases throughput for workers and storage systems but adds delay. Back pressure protects the system by slowing or rejecting intake when downstream capacity is exceeded, trading acceptance rate for stability."
        ],
        keyTerms: [
          {
            term: "Throughput",
            definition: "The rate of successful work completion over time under a given workload mix."
          },
          {
            term: "Little's Law",
            definition: "The relationship that average in-flight work equals arrival rate times average time in system, useful for capacity intuition."
          },
          {
            term: "Back pressure",
            definition: "A control mechanism that limits intake when consumers or dependencies cannot keep up, preventing uncontrolled queue growth."
          }
        ],
        callout: {
          tone: "warning",
          body: "Throughput improvements that increase batching or queueing can worsen user-facing latency. Say which metric you are optimizing."
        },
        checkYourself: [
          {
            prompt: "How do queues change throughput without necessarily improving latency?",
            reveal:
              "They absorb bursts and keep workers utilized, raising sustained completions per second, but each message still spends time waiting, which adds end-to-end delay."
          }
        ]
      },
      {
        id: "slos-and-error-budgets",
        heading: "SLOs turn product promises into engineering controls",
        paragraphs: [
          "A service level objective is a target such as \"99.9% of checkout charges complete under 400 ms over 30 days.\" It is more actionable than \"the site should be fast.\" SLIs are the measured indicators beneath the objective: success ratio, percentile latency, freshness lag. SLAs are contractual consequences. In design interviews, SLOs are usually the useful middle layer.",
          "Error budgets explain how much unreliability you can spend on releases, experiments, and incidents before you must freeze risk. A 99.9% availability objective allows about 43 minutes of downtime per month. That budget informs whether you can push aggressively or must harden. Designing without an error budget mindset often over-promises five nines and under-delivers operationally.",
          "Not all endpoints share one SLO. Read timelines, search suggestions, and marketing pages can tolerate more failure or delay than money movement and access control. Separate user-facing SLOs from internal service targets. Internal APIs need objectives too, but cascading identical five-nine goals through every hop creates fragile, expensive systems."
        ],
        keyTerms: [
          {
            term: "SLI",
            definition: "A quantitative indicator of service health, such as success rate or p99 latency."
          },
          {
            term: "SLO",
            definition: "A target level for an SLI that the service aims to achieve over a time window."
          },
          {
            term: "Error budget",
            definition: "The allowed amount of unreliability derived from an SLO before risk-reducing actions are required."
          }
        ],
        workedExample: {
          title: "Mapping an SLO to design choices",
          body: "Show how a write latency SLO forces replica, cache, and fallback decisions.",
          code: "SLO: 99.9% of POST /orders under 200ms (regional)\n=> keep authorize path in-region\n=> synchronous write to local primary only\n=> email/inventory projection async via queue\n=> on dependency timeout: fail closed for payment,\n   not for recommendation widgets\n=> measure SLI at edge + synthetic checkout",
          language: "text"
        },
        callout: {
          tone: "interview",
          body: "State one SLO for the hottest user path and one weaker objective for a best-effort path. Differentiation signals maturity."
        },
        checkYourself: [
          {
            prompt: "Which percentile would you optimize for checkout and why?",
            reveal:
              "p95 or p99, because abandoned carts and payment timeouts are driven by slow tails, not by how fast the median happy path feels."
          }
        ]
      },
      {
        id: "retries-overload-admission",
        heading: "Retries, overload, and admission control",
        paragraphs: [
          "Retries improve availability for transient faults but multiply load and inflate latency. Without bounded attempts, jitter, and timeouts, retries turn a small outage into a self-inflicted thundering herd. Deadline propagation is essential: a parent with 200 ms left must not start a child call that needs 150 ms with two retries still enabled.",
          "Overload control protects SLOs when demand exceeds capacity. Shed non-critical traffic first. Apply concurrency limits per dependency. Use load shedding at the edge before deep queues form. Circuit breakers stop sending traffic to sick dependencies so the remainder of the system can survive. These mechanisms exist to keep latency and success rate from falling off a cliff together.",
          "Caching and replication can help both latency and throughput when reads dominate, but they introduce freshness trade-offs. Admit that explicitly in SLO design: a feed may allow slightly stale reads to preserve p99, while account balance reads may not. The SLO is where product semantics and mechanism meet."
        ],
        keyTerms: [
          {
            term: "Admission control",
            definition: "Policy that decides which requests may enter the system or a subsystem when capacity is constrained."
          },
          {
            term: "Thundering herd",
            definition: "A surge of synchronized retries or cache misses that overwhelms a recovering dependency."
          },
          {
            term: "Deadline propagation",
            definition: "Carrying remaining time budget through downstream calls so work stops before the user-visible timeout is wasted."
          }
        ],
        callout: {
          tone: "warning",
          body: "Retries without jitter and budgets can improve a lab demo and destroy a production dependency during partial failure."
        },
        checkYourself: [
          {
            prompt: "Why can adding retries improve availability but hurt latency?",
            reveal:
              "Failed attempts are retried and may eventually succeed, raising success rate, but each attempt adds waiting time and extra load that stretches tails and can worsen overload."
          }
        ]
      },
      {
        id: "detecting-slo-regressions",
        heading: "Detecting regressions and designing degraded modes",
        paragraphs: [
          "An SLO without measurement is a wish. Design answers should mention how you would detect regression: edge latency histograms, synthetic transactions, dependency error budgets, queue lag, and saturation metrics such as thread pool wait time. Alert on burn rate of the error budget, not only on raw red dashboards after users complain.",
          "Degraded modes are part of meeting objectives under stress. Serve cached catalog pages when the personalization service is down. Switch recommendations to a simpler baseline. Make search approximate rather than timing out empty. Document which degradations preserve the SLO's intent and which require fail-closed behavior.",
          "In interviews, connect the triad clearly: the latency users feel, the throughput the system can sustain, and the SLO that decides caches, queues, replicas, and admission control. If a component cannot be tied to that triad, question whether it belongs in the first diagram."
        ],
        keyTerms: [
          {
            term: "Error budget burn",
            definition: "The rate at which remaining allowed unreliability is consumed, used to trigger urgent response."
          },
          {
            term: "Degraded mode",
            definition: "A planned fallback experience that preserves core objectives when a dependency or capacity limit fails."
          }
        ],
        callout: {
          tone: "interview",
          body: "Mention one metric you would watch to know the SLO is failing before Twitter tells you."
        },
        checkYourself: [
          {
            prompt: "Name two signals that throughput is near a ceiling even if CPU is not at 100%.",
            reveal:
              "Connection or thread pool wait times rising, lock wait spikes, downstream rate-limit responses, or queue depth growing while CPU looks idle."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Latency is user-visible delay and must be discussed with percentiles and budgets, especially under fan-out.",
        "Throughput is sustained completion rate; queues and batching can help capacity while adding delay.",
        "SLOs and error budgets connect product promises to caches, replicas, retries, and admission control.",
        "Retries and overload controls must be designed carefully or they amplify the failures they aim to fix."
      ],
      nextSteps: [
        "Write latency budgets for a three-hop read path with a 300 ms p95 target.",
        "Explain Little's Law with a concrete QPS and p99 example.",
        "Define distinct SLOs for checkout versus recommendation widgets on the same site."
      ]
    }
  },

  "foundations/availability-consistency-cap": {
    title: "Availability, consistency, and CAP trade-offs",
    readingTime: "85-100 min",
    premise:
      "Distributed systems force uncomfortable choices when networks partition and nodes fail. Precise definitions of availability, consistency, and durability—and a careful reading of CAP—let you place each operation on the spectrum between strict correctness and graceful degradation.",
    parts: [
      {
        id: "precise-definitions",
        heading: "Use precise definitions before slogans",
        paragraphs: [
          "Availability, in the CAP sense, means every request to a non-failing node receives a non-error response in a reasonable time. It does not mean the response is the latest global truth. Consistency, when people say \"strong consistency,\" usually means readers observe the most recent successful write according to a chosen linearizability or sequential model. These words are overloaded in industry marketing, so define them operationally in an interview.",
          "Durability is separate. A write can be acknowledged and later lost if it was only in memory—available and even consistent among live nodes, yet not durable. Conversely, a durable write on a minority replica may be invisible to readers until failover completes. Never collapse durability, availability, and consistency into one vague \"reliability\" adjective.",
          "Real products rarely need one global setting. Account password changes and inventory reservations often need stronger guarantees than like counts or recommendation scores. Framing per operation is the skill. \"The feed is eventually consistent; block lists are strongly consistent\" is a better sentence than \"we are an AP system.\""
        ],
        keyTerms: [
          {
            term: "Availability",
            definition: "The ability of non-failed nodes to keep producing responses rather than erroring during failures or partitions."
          },
          {
            term: "Strong consistency",
            definition: "A read model where clients observe writes as if there were a single up-to-date copy, under a specified consistency formalization."
          },
          {
            term: "Durability",
            definition: "The guarantee that accepted writes survive failures because they were persisted to stable storage according to policy."
          }
        ],
        callout: {
          tone: "tip",
          body: "If you say \"consistent,\" immediately add \"for which operation, under which failure?\" Precision earns trust."
        },
        checkYourself: [
          {
            prompt: "Can a system be available and still lose data? Explain.",
            reveal:
              "Yes. Nodes may keep accepting writes that were never fsynced or were acknowledged by a minority that later disappears, producing availability without durability."
          }
        ]
      },
      {
        id: "read-cap-correctly",
        heading: "Read CAP correctly",
        paragraphs: [
          "CAP observes that during a network partition, a distributed system cannot simultaneously provide perfect availability and strong consistency for the same operation. You must choose whether to refuse or delay some requests to preserve one copy of truth, or to keep serving possibly divergent answers. Outside partitions, many systems provide both good availability and strong consistency; CAP is not a claim that you always pick two of three forever.",
          "CP-leaning designs refuse or block when they cannot be sure. Leader-based consensus stores, quorum writes with quorum reads, and fail-closed authorization checks often live here. AP-leaning designs continue serving from reachable replicas, accepting staleness or conflict, then repair. Caches, multi-master mobile sync, and DNS-style systems often lean this way. Most large products are mosaics of both.",
          "Quorums, leaders, and leases are tools for navigating the trade-off. A majority quorum prevents split-brain writes at the cost of needing enough reachable replicas. Leases help readers trust a leader for a bounded time. Timeouts convert uncertainty into either fail-closed or fail-open product behavior. The mechanism should follow the user consequence you are willing to accept."
        ],
        keyTerms: [
          {
            term: "Partition",
            definition: "A network or process communication failure that prevents some nodes from coordinating with others."
          },
          {
            term: "Quorum",
            definition: "A majority or otherwise sufficient subset of replicas whose agreement is required to commit or to serve a consistent read."
          },
          {
            term: "Split-brain",
            definition: "A failure mode where two sides of a partition both believe they can accept conflicting authoritative writes."
          }
        ],
        callout: {
          tone: "warning",
          body: "Do not label an entire company CP or AP. Label operations and failure modes. Interviewers notice the difference."
        },
        checkYourself: [
          {
            prompt: "Why is \"we choose CA\" usually a weak CAP answer for a distributed datastore?",
            reveal:
              "When a partition happens, you cannot fully keep both strong consistency and full availability. Claiming CA dodges the failure mode CAP cares about."
          }
        ]
      },
      {
        id: "consistency-models-spectrum",
        heading: "A practical spectrum of consistency models",
        paragraphs: [
          "Linearizability is the strict end many people mean by strong consistency: operations appear instantaneously at a single point in time in a global order compatible with real time. Sequential consistency and causal consistency relax aspects of that model while still providing meaningful guarantees. Eventual consistency promises that, absent new writes, replicas converge, but it says little about intermediate states unless you add more precise session guarantees.",
          "Session-level guarantees are often what product engineers actually need. Read-your-writes prevents users from missing their own updates. Monotonic reads prevent going back in time within a session. Sticky routing to a replica can provide these properties without global linearizability. Knowing these options lets you avoid overpaying for consensus on every read.",
          "Eventual consistency is not random chaos when engineered well. Version vectors, conflict-free replicated data types, last-writer-wins with careful clocks, and application-level merge functions define how divergence resolves. The mature question is not \"eventual or strong?\" but \"what conflicts are possible, who notices, and how do we repair?\""
        ],
        keyTerms: [
          {
            term: "Eventual consistency",
            definition: "A model where replicas may diverge temporarily but are expected to converge once updates propagate and conflicts resolve."
          },
          {
            term: "Read-your-writes",
            definition: "A session guarantee that a client sees the effects of its own successful writes in subsequent reads."
          },
          {
            term: "Conflict repair",
            definition: "The process of detecting divergent replicas and merging or reconciling them into a convergent state."
          }
        ],
        callout: {
          tone: "interview",
          body: "Offer read-your-writes for profile edits before jumping to cluster-wide linearizability. Show you can buy the right guarantee."
        },
        checkYourself: [
          {
            prompt: "Which parts of a social feed can be eventually consistent?",
            reveal:
              "Like counts, ranking features, recommendation cards, and fan-out copies usually can; auth, privacy, and block lists generally need fresher, stricter enforcement."
          }
        ]
      },
      {
        id: "user-impact-and-degraded-modes",
        heading: "Explain trade-offs through user impact",
        paragraphs: [
          "Trade-offs become convincing when tied to visible outcomes. Choosing availability for timelines may mean a user briefly sees a stale post ordering. Choosing consistency for payments may mean checkout returns a retriable error during a regional partition. Choosing availability for notifications may mean rare duplicates that must be deduplicated client-side. Name the degraded mode you accept.",
          "Order placement during a regional partition is a classic interview scenario. Keep one authoritative write path for orders, payments, and inventory reservations. Use idempotency keys so client retries do not double charge. Let email, analytics, and recommendation updates reconcile asynchronously. If the authoritative region is unreachable, fail closed on money movement rather than inventing a second ledger in the isolated region.",
          "After partitions heal, repair work begins. Anti-entropy, replay from logs, compensating transactions, and human workflows for irreconcilable conflicts are part of the design. Ignoring post-healing repair is how \"eventual consistency\" turns into permanent inconsistency in practice."
        ],
        workedExample: {
          title: "Per-operation choices for a marketplace",
          body: "Show a mosaic instead of a single CAP label.",
          code: "browse catalog        -> AP-leaning, cached, stale OK for minutes\nupdate shipping addr -> read-your-writes, fail if unsure\nreserve inventory    -> CP-leaning quorum / single authority\ncharge payment       -> strong, durable, idempotent, fail-closed\nemail receipt        -> async, at-least-once + dedupe\nrecs carousel        -> eventual, approximate",
          language: "text"
        },
        keyTerms: [
          {
            term: "Fail-open",
            definition: "Continuing a workflow with potentially weaker guarantees when coordination is unavailable, accepting risk for availability."
          },
          {
            term: "Compensating action",
            definition: "A later operation that undoes or corrects the business effect of a previous speculative or partial write."
          }
        ],
        callout: {
          tone: "warning",
          body: "Temporary unavailability beats stale reads when money, inventory, access control, or compliance would be violated by serving the wrong truth."
        },
        checkYourself: [
          {
            prompt: "When is temporary unavailability preferable to stale reads?",
            reveal:
              "When acting on stale data could move money incorrectly, oversell inventory, grant unauthorized access, or breach compliance rules."
          }
        ]
      },
      {
        id: "interview-patterns",
        heading: "Patterns that show CAP fluency in interviews",
        paragraphs: [
          "Lead with operation-specific requirements, then pick mechanisms. For each critical write, say whether you need linearizability-like behavior, session guarantees, or eventual convergence. For each read, say whether staleness is user-visible and for how long. Only then mention leader election, quorum sizes, caches, or CRDTs.",
          "Discuss multi-region explicitly. Synchronously replicating every write across continents buys strong reads everywhere at brutal latency cost. Asynchronous replication improves local latency and availability for reads while creating failover data-loss windows unless you add confirmations. State the RPO and RTO implications in plain language.",
          "Finish with observability: replication lag, quorum membership changes, conflict rates, and idempotency duplicate detections. CAP trade-offs are not only whiteboard philosophy; they are measurable production behaviors. Candidates who mention repair metrics sound like people who have operated systems."
        ],
        keyTerms: [
          {
            term: "RPO",
            definition: "Recovery point objective: how much recent data you can afford to lose after a failure."
          },
          {
            term: "RTO",
            definition: "Recovery time objective: how quickly service must be restored after a failure."
          },
          {
            term: "Replication lag",
            definition: "The delay between a write on a primary and its visibility on a replica, a key freshness metric."
          }
        ],
        callout: {
          tone: "interview",
          body: "A strong closing line: name the degraded mode, the user consequence, and the repair path after healing."
        },
        checkYourself: [
          {
            prompt: "How would you design order placement during a regional partition?",
            reveal:
              "Keep one authoritative region for orders and payments, require idempotent retries, fail closed if authority is unreachable, and reconcile non-critical side effects asynchronously after healing."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Define availability, consistency, and durability separately, and apply them per operation.",
        "CAP is about partition behavior; real products mix CP-leaning and AP-leaning choices.",
        "Session guarantees and repair mechanisms often deliver the product need without global linearizability everywhere.",
        "Always state user-visible degraded modes and post-partition reconciliation."
      ],
      nextSteps: [
        "Label five operations in a social app as strong, session, or eventual and justify each.",
        "Sketch failover for a primary-replica database including RPO/RTO assumptions.",
        "Practice explaining why \"the system is AP\" is too blunt for interview answers."
      ]
    }
  }
};
