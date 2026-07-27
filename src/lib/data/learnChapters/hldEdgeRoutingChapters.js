/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldEdgeRoutingChapters = {
  "edge-and-routing/dns": {
    title: "DNS fundamentals",
    readingTime: "75-95 min",
    premise:
      "Many high-level designs begin one hop too late. DNS is often the first control plane that shapes latency, failover, migration, and multi-region steering—before a load balancer ever sees a packet. This chapter builds operational intuition for DNS as an architecture tool, not just a name lookup.",
    parts: [
      {
        id: "resolution-path-and-records",
        heading: "What DNS actually does on the path",
        paragraphs: [
          "DNS maps human-readable names to routing targets, most commonly IP addresses. A stub resolver on the client asks a recursive resolver, which walks from root hints to TLD servers to the authoritative name servers for your zone. Answers are cached along that path according to TTL. Understanding delegation and caching is more important in system design than memorizing every record type.",
          "A and AAAA records map names to IPv4 and IPv6 addresses. CNAMEs alias one name to another and are common in front of managed load balancers or CDN hostnames. NS records delegate authority. MX and TXT serve mail and verification use cases that sometimes appear in onboarding flows. For interview designs, A/AAAA, CNAME, and TTL behavior cover most of the architectural leverage.",
          "TTL is a dial with real consequences. Low TTLs make cutovers and failover updates reach clients faster but increase query load on authoritative servers and recursive resolvers. High TTLs reduce lookup traffic and improve resilience to transient DNS control-plane issues, but they prolong the life of stale answers after an incident. There is no universally correct TTL; there is only a TTL matched to how quickly you must move traffic."
        ],
        keyTerms: [
          {
            term: "Authoritative server",
            definition: "The DNS server that holds the source-of-truth records for a zone and answers from that data."
          },
          {
            term: "Recursive resolver",
            definition: "A server that performs the multi-step lookup on behalf of clients and typically caches responses."
          },
          {
            term: "TTL",
            definition: "Time to live: how long a DNS answer may be cached before it should be refreshed."
          }
        ],
        callout: {
          tone: "tip",
          body: "When you draw \"users → service,\" remember that users often reach an IP chosen minutes earlier by a cached DNS answer."
        },
        checkYourself: [
          {
            prompt: "Why can two users in the same city receive different IPs for the same hostname during a rollout?",
            reveal:
              "Different resolvers may still cache prior answers with remaining TTL, and weighted or geo policies can also return different targets by design."
          }
        ]
      },
      {
        id: "traffic-steering-patterns",
        heading: "Traffic steering patterns at DNS layer",
        paragraphs: [
          "Managed DNS can steer traffic with more than a static A record. Weighted records shift a percentage of clients toward a new stack for canaries and migrations. Latency-based or geo-aware policies send users to nearer regions. Failover policies return a secondary target when health checks mark the primary unhealthy. These controls are powerful for coarse routing across regions and providers.",
          "Health-checked DNS failover sounds like magic until you remember caching. Even if your authoritative servers stop advertising a dead region immediately, recursive resolvers and clients may keep the old answer until TTL expiry—and some caches are sticky longer than they should be. DNS failover is therefore minutes-scale and probabilistic, not per-request instant failover.",
          "Steering works best when the application is region-aware. If a user lands in region A but their data authority lives in region B, you may improve DNS latency while creating chatty cross-region application paths. Pair DNS steering with regional data placement, local read replicas, or sticky session strategies that match the product's consistency needs."
        ],
        keyTerms: [
          {
            term: "Weighted DNS",
            definition: "A steering method that distributes resolutions across targets according to assigned weights for gradual shifts."
          },
          {
            term: "Geo-DNS",
            definition: "Routing policy that selects answers based on resolver or user geography to improve locality."
          },
          {
            term: "DNS health check",
            definition: "A probe used by managed DNS to decide whether a target should remain eligible in answers."
          }
        ],
        callout: {
          tone: "interview",
          body: "Use weighted DNS for coarse regional canaries; use L7 load balancing when each request must be routed by path, header, or auth context."
        },
        checkYourself: [
          {
            prompt: "When would you use weighted DNS instead of an L7 load balancer?",
            reveal:
              "When you need broad shifts across regions, providers, or major stacks and do not need per-request application-aware routing. DNS is coarse; L7 is fine-grained and live."
          }
        ]
      },
      {
        id: "cutovers-and-ttl-playbooks",
        heading: "Planned cutovers and TTL playbooks",
        paragraphs: [
          "Before a planned migration, operators often lower TTL days in advance so the eventual switch can propagate faster. After the cutover stabilizes, TTL may rise again to reduce lookup chatter. This playbook only helps if you actually wait for the old TTL to drain before flipping. Lowering TTL an hour before a change does little if yesterday's one-hour TTL answers are still cached.",
          "Blue-green and branded CNAME patterns are common. Clients keep using api.example.com as a CNAME to a provider hostname you can repoint. That indirection lets you move between load balancers or CDNs without teaching every client a new apex name. Apex domains have historically been awkward with CNAMEs; modern ALIAS/ANAME-style records and carefully chosen architectures address that, but you should mention the constraint if designing around bare domains.",
          "Rollback is part of the cutover design. Keep the previous target healthy long enough to reverse DNS weights if error rates spike. Because DNS is eventually consistent across caches, rollouts and rollbacks both have long tails of mixed traffic. Your application must tolerate two versions coexisting."
        ],
        workedExample: {
          title: "TTL drain before a region cutover",
          body: "Show why \"flip DNS now\" is not a complete plan.",
          code: "T-48h: set api TTL from 3600s -> 60s\nT-2h:  verify resolvers mostly honor ~60s (spot checks)\nT-0:   shift weight 10% -> new region; watch RPS/errors\nT+30m: increase weight if healthy\nT+24h: raise TTL back to 300-600s after traffic settled\nnote: some clients may still hit old IP for unpredictable longer",
          language: "text"
        },
        keyTerms: [
          {
            term: "TTL drain",
            definition: "Waiting long enough after lowering TTL that most caches expire old answers before a routing change."
          },
          {
            term: "CNAME indirection",
            definition: "Pointing a stable client-facing name at a movable provider hostname to simplify migrations."
          }
        ],
        callout: {
          tone: "warning",
          body: "Never assume instant TTL expiry. Plan for stale records during incidents and mixed-target traffic during migrations."
        },
        checkYourself: [
          {
            prompt: "How do TTL choices affect planned cutovers?",
            reveal:
              "Lower TTLs beforehand shorten the mixed-traffic window after a change, but propagation is still cache-driven and imperfect; raise TTLs again after stability to reduce DNS load."
          }
        ]
      },
      {
        id: "dns-limits-vs-balancers",
        heading: "What DNS should not own",
        paragraphs: [
          "DNS is a poor per-request load balancer. It cannot see HTTP paths, cookies, or slowly degrading instances inside a region with the same fidelity as a local load balancer. It also cannot drain connections gracefully. Treat DNS as coarse traffic steering across large targets: regions, providers, or big blue/green stacks.",
          "Combine DNS with regional load balancers for fine-grained control. A typical pattern is geo or latency DNS to a regional anycast or regional VIP, then L4/L7 balancing across healthy instances. The regional balancer handles rapid instance failure; DNS handles slower regional evacuation and migrations.",
          "Client behavior adds chaos. Mobile networks, corporate resolvers, and browsers all cache. Some happy-eyeballs and parallel connection behaviors complicate IPv4/IPv6 dual-stack rollouts. In designs, mention that edge and client diversity make DNS a probabilistic control knob."
        ],
        keyTerms: [
          {
            term: "Coarse steering",
            definition: "Routing decisions at region or provider granularity rather than per-request application logic."
          },
          {
            term: "Regional VIP",
            definition: "A stable virtual address in a region that front ends local load balancing and instance churn."
          }
        ],
        callout: {
          tone: "tip",
          body: "If one region fails while clients cache its record, some users keep hitting the dead endpoint until expiry—pair DNS with in-region health-aware balancers."
        },
        checkYourself: [
          {
            prompt: "What happens if one region fails but clients still cache its record?",
            reveal:
              "Those clients continue attempting the failed target until caches expire or they retry alternate logic, which is why DNS failover alone is never instant."
          }
        ]
      },
      {
        id: "dns-in-hld-answers",
        heading: "Putting DNS into HLD interview answers",
        paragraphs: [
          "Open global designs at the name. Say how users resolve api.example.com, whether answers are geo-steered, and what TTL implies for failover. Then descend into CDN, load balancers, and services. Candidates who skip DNS often cannot explain multi-region entry cleanly.",
          "Call out operational risks: registrar lock, DNSSEC if relevant to the company, dependency on a managed DNS vendor, and the blast radius of an accidental record delete. DNS outages take down everything downstream regardless of how elegant your microservices are.",
          "Close with a layered sentence: \"DNS steers users to a healthy region on a minutes-scale control loop; regional load balancers handle seconds-scale instance failover.\" That separation of timescales is the core architectural insight."
        ],
        keyTerms: [
          {
            term: "Control-plane timescale",
            definition: "How quickly a routing mechanism can change user traffic after a decision, shaped by caching and propagation."
          },
          {
            term: "Entry hierarchy",
            definition: "The ordered layers from DNS to CDN to load balancer to service that together form the public request path."
          }
        ],
        callout: {
          tone: "interview",
          body: "If multi-region matters, mention DNS steering explicitly. Silence here often means the design is accidentally single-region."
        },
        checkYourself: [
          {
            prompt: "Why is putting all application-level routing logic in DNS a pitfall?",
            reveal:
              "DNS cannot react per request with full application context, and cached answers make rapid, precise changes unreliable compared with L7 balancers and gateways."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "DNS resolution, caching, and TTL define how quickly routing changes become real for users.",
        "Use DNS for coarse geo, latency, weighted, and failover steering—not fine-grained request balancing.",
        "Plan cutovers with TTL drain and tolerate mixed targets during propagation.",
        "Pair DNS with regional load balancers to separate minutes-scale and seconds-scale failover."
      ],
      nextSteps: [
        "Sketch DNS plus regional LB entry for a three-region API.",
        "Write a TTL playbook for migrating off one CDN to another.",
        "Explain to a teammate why DNS failover is not instant."
      ]
    }
  },

  "edge-and-routing/cdn": {
    title: "Content delivery networks",
    readingTime: "80-100 min",
    premise:
      "A CDN places cacheable content near users and can absorb enormous read traffic before requests reach origin infrastructure. For global products, edge caching is often the fastest latency win and the cheapest origin offload—if you respect cache keys, TTLs, and personalization boundaries.",
    parts: [
      {
        id: "what-belongs-at-edge",
        heading: "What belongs at the edge",
        paragraphs: [
          "CDNs excel at static assets: JavaScript bundles, CSS, images, fonts, downloadable binaries, and video segments. They also help with whole-page or fragment caching when responses are shared across many users and declare clear freshness. Some APIs can be cached at the edge when responses are public, keyed correctly, and tolerant of brief staleness.",
          "Personalized, authenticated, payment, cart, and admin responses are dangerous to cache unless the cache key and privacy controls are extremely explicit. A single mistaken shared cache of a personalized page is a data leak. Default instinct: immutable public assets at the edge; personalized HTML and JSON from origin or from carefully isolated caches.",
          "Origin shielding and hierarchical caching reduce thundering herds when popular objects expire. Instead of every point of presence stampedes the origin, a shield layer collapses duplicate misses. TLS termination, bot filtering, and basic WAF rules often live at the CDN as well, making it both a performance and protection layer."
        ],
        keyTerms: [
          {
            term: "Point of presence (PoP)",
            definition: "An edge location where the CDN can terminate connections and serve cached content near users."
          },
          {
            term: "Origin",
            definition: "The source infrastructure the CDN fetches from on cache miss, such as object storage or an application tier."
          },
          {
            term: "Origin shield",
            definition: "An intermediate caching tier that collapses duplicate misses before they hit the true origin."
          }
        ],
        callout: {
          tone: "warning",
          body: "Never cache authenticated personalized responses at a shared edge without a rock-solid vary/key strategy. Privacy bugs outrank latency wins."
        },
        checkYourself: [
          {
            prompt: "What content would you intentionally avoid putting behind a shared CDN cache?",
            reveal:
              "Personalized, authenticated, payment, cart, admin, or otherwise sensitive responses unless cache keys and isolation are explicit and reviewed."
          }
        ]
      },
      {
        id: "cache-control-and-keys",
        heading: "Cache-Control, cache keys, and invalidation",
        paragraphs: [
          "HTTP caching semantics are the contract. Cache-Control directives express whether intermediaries may store a response, for how long, and whether stale content can be served while revalidating. ETag and Last-Modified support conditional requests that save bandwidth on revalidation. Surrogate-Control and vendor-specific headers sometimes speak to CDNs separately from browsers.",
          "The cache key defines what makes two requests the \"same\" object. Host, path, and query string matter; so can selected headers and cookies. Overly broad keys fragment the cache and destroy hit ratio. Overly narrow keys risk serving the wrong user's content. Designing keys is therefore both a performance and security task.",
          "Invalidation is the hard part of mutable content. Pure time-based TTL is simple but can serve staleness until expiry. Explicit purge APIs remove objects sooner but are easy to misuse and hard to make instant globally. Soft purge and stale-while-revalidate patterns keep users fast while origins refresh. Versioned URLs avoid many invalidation headaches for assets."
        ],
        keyTerms: [
          {
            term: "Cache key",
            definition: "The request attributes that uniquely identify a cached object at the edge."
          },
          {
            term: "Revalidation",
            definition: "Checking with origin whether a cached object is still fresh, often via conditional headers."
          },
          {
            term: "Purge",
            definition: "An explicit instruction to delete or mark stale cached objects before natural TTL expiry."
          }
        ],
        callout: {
          tone: "tip",
          body: "Fingerprinted filenames plus long-lived immutable caching beat emergency purges for JS/CSS rollouts."
        },
        checkYourself: [
          {
            prompt: "How would you roll out a new web bundle without stale asset bugs?",
            reveal:
              "Ship fingerprinted asset URLs with long immutable cache lifetimes, and keep the HTML shell short-lived or purged so clients discover new references quickly."
          }
        ]
      },
      {
        id: "push-vs-pull",
        heading: "Push vs. pull models and private content",
        paragraphs: [
          "Pull CDNs fetch from origin on demand and cache after the first request. They are the default for web products because publishing is as simple as deploying origin content with the right headers. Push CDNs pre-load objects into edge storage, which can help massive launches or rarely requested large objects that still need guaranteed presence, at the cost of publishing complexity.",
          "Pre-warming popular content before launches reduces the first-user penalty and protects origin on marketing spikes. Signed URLs or cookies protect private content by letting the CDN authorize access without making objects world-readable. Time-limited signatures are common for video, downloads, and document sharing.",
          "Dynamic site acceleration features—persistent origin connections, optimized routing, and TCP/TLS tuning—help even when content is not cacheable. Do not pretend everything is a static file; say which requests are cache hits versus accelerated proxies to origin."
        ],
        workedExample: {
          title: "Classifying responses for CDN policy",
          body: "Separate immutable, cacheable-shared, and never-cache classes.",
          code: "immutable: /static/app.9f3c.js   Cache-Control: public,max-age=31536000,immutable\nshared:    /blog/post/123        public, max-age=60, stale-while-revalidate=30\nprivate:   /api/me/cart          Cache-Control: private, no-store\nsigned:    /media/doc.pdf?token=...  CDN verifies signature, short TTL",
          language: "text"
        },
        keyTerms: [
          {
            term: "Pull CDN",
            definition: "A CDN that retrieves objects from origin on miss and caches them for subsequent requests."
          },
          {
            term: "Signed URL",
            definition: "A time-limited, cryptographically authorized URL that grants access to otherwise protected content."
          },
          {
            term: "Pre-warm",
            definition: "Proactively loading popular objects into edge caches before expected demand spikes."
          }
        ],
        callout: {
          tone: "interview",
          body: "Say how the CDN helps both latency and cost: nearer hits plus origin offload of bandwidth and repeated TLS work."
        },
        checkYourself: [
          {
            prompt: "Why can a CDN lower both latency and cost?",
            reveal:
              "Cache hits are served from nearby PoPs (latency) and avoid repeated origin bandwidth and compute (cost), especially for heavy static and media traffic."
          }
        ]
      },
      {
        id: "metrics-and-tradeoffs",
        heading: "Metrics, personalization, and origin planning",
        paragraphs: [
          "Track cache hit ratio, origin offload, egress cost, and regional latency. A pretty architecture with a 20% hit ratio on supposedly static assets usually means broken keys, over-varying headers, or accidental uncacheable cookies. Hit ratio without origin CPU and bandwidth context can also mislead if misses are tiny metadata requests.",
          "Personalized responses lower cacheability. Strategies include edge-side includes for shared shells with dynamic fragments, separate APIs for private data, and computing personalization in the client after fetching cacheable catalogs. Each approach has complexity; pick based on how much HTML must differ per user.",
          "A CDN does not remove origin capacity planning. Origins still need headroom for misses, purges, cold starts, and regional failures when a PoP cannot help. Shielding reduces but does not eliminate storms. Design origins for the miss path you will actually see on launch day."
        ],
        keyTerms: [
          {
            term: "Hit ratio",
            definition: "The fraction of requests served from cache without contacting origin."
          },
          {
            term: "Origin offload",
            definition: "The share of traffic or bandwidth absorbed by the CDN rather than origin infrastructure."
          },
          {
            term: "Edge-side include",
            definition: "A composition technique that stitches shared cached fragments with dynamic pieces at the edge."
          }
        ],
        callout: {
          tone: "warning",
          body: "Assuming the CDN removes the need for origin capacity planning is a classic outage generator on expiry storms and launches."
        },
        checkYourself: [
          {
            prompt: "Name two reasons a supposedly static asset site might show a poor CDN hit ratio.",
            reveal:
              "Cache keys varying on cookies or unused query params, missing immutable headers, or HTML referencing constantly changing unfingerprinted URLs."
          }
        ]
      },
      {
        id: "cdn-in-defense-depth",
        heading: "CDN as part of edge defense and global design",
        paragraphs: [
          "Modern CDNs often terminate TLS, enforce geo blocks, apply bot scores, and rate-limit abusive clients before origin. In interview designs, placing coarse protection at the CDN and finer quotas near expensive services is a strong layered story. Keep business logic out of CDN rewrite rules when possible; configuration sprawl becomes invisible technical debt.",
          "For multi-region active-active apps, CDNs may front both static and API hostnames with different policies. APIs might use dynamic acceleration without shared caching, while static hostnames are aggressively cached. Splitting hostnames by cache class clarifies headers and incident response.",
          "Close designs by naming invalidation ownership: who can purge, how emergencies work, and how you prevent a panic purge from wiping the entire edge. Operational clarity is part of the architecture."
        ],
        keyTerms: [
          {
            term: "Dynamic acceleration",
            definition: "CDN optimizations for uncached requests, such as better routing and connection reuse to origin."
          },
          {
            term: "Cache class split",
            definition: "Using separate hostnames or paths for immutable assets versus dynamic APIs to keep policies clear."
          }
        ],
        callout: {
          tone: "interview",
          body: "Good CDN answers mention cache keys, TTLs, invalidation, and the line between immutable assets and personalized data."
        },
        checkYourself: [
          {
            prompt: "Where should bot rate controls live relative to origin for a public marketing site?",
            reveal:
              "Coarse controls at the CDN/edge to drop obvious abuse early, with origin still protected by application limits for anything that gets through."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Put shared cacheable content at the edge; keep personalized and sensitive responses off shared caches by default.",
        "Design cache keys, TTLs, and invalidation as carefully as the origin data model.",
        "Prefer immutable versioned assets; use pull CDNs by default and pre-warm for launches.",
        "Measure hit ratio and origin offload, and still provision origin for misses and storms."
      ],
      nextSteps: [
        "Classify ten endpoints in an app into immutable, shared-cacheable, and no-store.",
        "Design a fingerprinted asset rollout with HTML freshness strategy.",
        "Sketch origin shielding for a viral video launch."
      ]
    }
  },

  "edge-and-routing/load-balancing": {
    title: "Load balancing",
    readingTime: "80-100 min",
    premise:
      "Load balancers distribute requests across healthy backends and form the main control point for availability, failover, and safe horizontal scaling at the service edge. Almost every stateless tier depends on them to survive instance death and deployments.",
    parts: [
      {
        id: "l4-vs-l7",
        heading: "L4 vs. L7 balancing",
        paragraphs: [
          "Layer 4 balancers route by transport metadata: IP, port, and connections. They are typically simple, fast, and excellent when you need raw throughput without inspecting HTTP. They shine for TCP services, TLS pass-through, and high connection rates where application semantics are unnecessary for routing.",
          "Layer 7 balancers understand HTTP and adjacent protocols. They can route by host, path, headers, and cookies; terminate TLS; implement sticky sessions; run application-aware health checks; and support canary weights per route. That power costs more CPU, more configuration surface, and more ways to misroute.",
          "Managed platforms often combine both: an L4 tier for connection distribution and an L7 tier for application routing. In interviews, choose explicitly. \"L4 to a pool of identical API servers\" is fine for a simple service. \"L7 by path to checkout versus catalog services\" is justified when routing logic is real."
        ],
        keyTerms: [
          {
            term: "L4 load balancing",
            definition: "Transport-level distribution of connections without inspecting application payload semantics."
          },
          {
            term: "L7 load balancing",
            definition: "Application-level routing that can use HTTP host, path, headers, and related attributes."
          },
          {
            term: "TLS termination",
            definition: "Decrypting TLS at the balancer or proxy so backends receive plaintext or re-encrypted internal traffic."
          }
        ],
        callout: {
          tone: "interview",
          body: "L7 is worth it when you need host/path/header routing, canaries, or app health checks. Otherwise prefer simpler L4."
        },
        checkYourself: [
          {
            prompt: "When does L7 routing justify the extra complexity?",
            reveal:
              "When decisions depend on HTTP details, or you need TLS termination, canaries, sticky cookies, or richer health checks that L4 cannot express."
          }
        ]
      },
      {
        id: "health-failover-draining",
        heading: "Healthy routing, failover, and connection draining",
        paragraphs: [
          "Balancers use health checks to stop sending traffic to dead or degraded instances. Checks can be shallow TCP connects or deep HTTP probes against a dependency-aware /health endpoint. Deep checks catch \"process up, database down\" failures but can also remove an entire pool if a shared dependency flakes, so design health carefully.",
          "Connection draining and deregistration delay make deployments safe. Remove an instance from rotation, wait for in-flight requests to finish, then kill the process. Without draining, deploys look like random 502 spikes. Rolling deploys plus health gates plus gradual traffic shifting are the standard safe pattern.",
          "Active-active pools improve utilization and failover speed across zones. Active-passive can simplify correctness-sensitive systems that should not take traffic in two places. Cross-zone balancing improves resilience but may add data transfer cost. State these trade-offs when drawing multi-AZ diagrams."
        ],
        keyTerms: [
          {
            term: "Health check",
            definition: "A periodic probe that determines whether a backend should remain eligible for new traffic."
          },
          {
            term: "Connection draining",
            definition: "Allowing in-flight requests to finish after an instance is taken out of rotation before shutdown."
          },
          {
            term: "Active-active",
            definition: "A topology where multiple zones or regions serve traffic concurrently."
          }
        ],
        workedExample: {
          title: "Safe rolling deploy behind a balancer",
          body: "Sequence matters more than tooling brand names.",
          code: "for instance in batch:\n  deregister from target group\n  wait drain_timeout for in-flight = 0\n  deploy new binary\n  wait health checks pass (N consecutive)\n  register instance\n  watch error rate / p99 before next batch",
          language: "text"
        },
        callout: {
          tone: "tip",
          body: "If every instance fails deep health checks because a shared dependency is down, you may empty the pool—consider partial health and fail-open policies carefully."
        },
        checkYourself: [
          {
            prompt: "How would you keep deploys safe behind a load balancer?",
            reveal:
              "Drain connections, deregister before shutdown, gate on health checks, roll in batches, and watch backend errors and latency before continuing."
          }
        ]
      },
      {
        id: "algorithms-and-affinity",
        heading: "Distribution algorithms and session affinity",
        paragraphs: [
          "Round-robin, least connections, and power-of-two-choices are common distribution strategies. Least connections helps when request costs vary. Consistent hashing can map keys or clients to backends for cache locality. The best algorithm still fails if backends are not roughly equivalent or if health data is stale.",
          "Session affinity (sticky sessions) sends the same client to the same instance, often via cookie. Affinity can ease migrations of stateful apps, WebSocket connection locality, or warm local caches. It also weakens elasticity: draining one node hurts a sticky subset of users, and uneven popularity skews load. Prefer externalizing session state and treating affinity as temporary.",
          "Keep backends as interchangeable as possible. Stateless application tiers behind balancers are the foundation of horizontal scale. If you need affinity, document why and what it would take to remove it."
        ],
        keyTerms: [
          {
            term: "Least connections",
            definition: "A balancing algorithm that prefers backends with fewer active connections."
          },
          {
            term: "Session affinity",
            definition: "Routing that attempts to send a given client to the same backend across requests."
          },
          {
            term: "Consistent hashing",
            definition: "A mapping strategy that keeps most key-to-node assignments stable when nodes are added or removed."
          }
        ],
        callout: {
          tone: "warning",
          body: "Sticky sessions as a default usually hide stateful coupling that will hurt failover and autoscaling later."
        },
        checkYourself: [
          {
            prompt: "Why is session affinity usually a temporary compromise?",
            reveal:
              "It conceals statefulness, reduces elasticity and clean failover, and should be replaced by shared session stores or truly stateless tokens when possible."
          }
        ]
      },
      {
        id: "operational-features",
        heading: "TLS, metrics, and balancers as failure domains",
        paragraphs: [
          "Modern balancers terminate TLS, manage certificates, emit access logs, apply coarse rate limits, and expose metrics such as connection count, queue depth, backend 5xx rate, and target response time. These signals often detect incidents earlier than instance CPU alone.",
          "Certificate rotation and protocol settings are operationally critical. A forgotten expiry at the edge is a total outage. Prefer automated certificate management and monitor days-to-expiry. HTTP/2 and HTTP/3 choices affect connection reuse and tail latency but also change debugging habits.",
          "Remember that load balancers are failure domains. A misconfigured listener rule or a control-plane outage can drop an entire region. Redundant balancers, multi-AZ deployment, and sometimes DNS-level diversification across entry points reduce that risk. Do not draw a single magical LB box as invincible."
        ],
        keyTerms: [
          {
            term: "Target response time",
            definition: "A balancer metric for how long backends take to respond, useful for spotting saturation."
          },
          {
            term: "Listener rule",
            definition: "L7 configuration that matches request attributes and selects a target pool or action."
          }
        ],
        callout: {
          tone: "interview",
          body: "Mention draining, health checks, and that the balancer itself needs multi-AZ redundancy—not only the app nodes."
        },
        checkYourself: [
          {
            prompt: "Name two balancer metrics you would watch during a traffic spike.",
            reveal:
              "Backend error rates and target latency/queue depth or surge queue size; connection counts and unhealthy host count are also strong signals."
          }
        ]
      },
      {
        id: "balancing-in-multi-tier-designs",
        heading: "Balancing across tiers and regions",
        paragraphs: [
          "Large systems use nested balancing: global traffic management or DNS to regions, regional L7 for services, and internal balancers or meshes for microservice east-west traffic. Each tier should have a clear job so you do not recreate the same policy five times with subtle inconsistencies.",
          "Internal load balancing for service-to-service calls may live in a service mesh sidecar, a shared proxy, or client-side libraries with discovery. The trade-offs shift toward latency overhead, consistency of retries, and operational complexity. Mention discovery interaction: balancers need a current set of healthy targets from a registry or cloud control plane.",
          "In HLD answers, explicitly say how unhealthy nodes are removed and how deploys interact with the balancer. That operational sentence separates memorized diagrams from workable designs."
        ],
        keyTerms: [
          {
            term: "East-west traffic",
            definition: "Service-to-service communication inside the system, as opposed to north-south client entry traffic."
          },
          {
            term: "Global traffic management",
            definition: "Coarse cross-region steering via DNS or anycast-like mechanisms above regional balancers."
          }
        ],
        callout: {
          tone: "tip",
          body: "Draw north-south and east-west balancing separately if both exist; collapsing them hides failure domains."
        },
        checkYourself: [
          {
            prompt: "What is the difference between DNS failover and load balancer failover?",
            reveal:
              "DNS failover is coarse and cache-delayed across regions or providers; load balancer failover removes unhealthy instances on a seconds-scale health loop within its scope."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Choose L4 for simple high-throughput transport routing and L7 when application-aware control is required.",
        "Health checks, draining, and gradual rolls make balancers the center of safe deploy and failover behavior.",
        "Prefer stateless backends; treat session affinity as an exception with an exit plan.",
        "Balancers need redundancy and metrics; they are not immortal single boxes."
      ],
      nextSteps: [
        "Write a rolling deploy sequence for a four-instance API pool.",
        "Compare sticky sessions versus Redis-backed sessions for a shopping cart.",
        "Sketch nested global DNS + regional L7 + internal balancing for one service."
      ]
    }
  },

  "edge-and-routing/reverse-proxies-and-gateways": {
    title: "Reverse proxies, gateways, and edge policy",
    readingTime: "75-95 min",
    premise:
      "Reverse proxies and API gateways sit in front of application servers to terminate TLS, normalize requests, enforce shared policy, and route to internal services. Used well, they keep backends focused. Used poorly, they become a second monolith and a single point of confusion.",
    parts: [
      {
        id: "reverse-proxy-role",
        heading: "The reverse proxy role",
        paragraphs: [
          "A reverse proxy accepts client requests and forwards them to one or more upstream servers, unlike a forward proxy that acts on behalf of clients egressing to the internet. Classic responsibilities include TLS termination, HTTP/2 or HTTP/3 to HTTP/1.1 translation, compression, header normalization, request size limits, and optional caching of shared responses.",
          "Proxies are a natural place for cross-cutting concerns that every service would otherwise reimplement inconsistently. Authentication token validation at the edge, request IDs, IP allowlists, and basic WAF rules often live here. The guiding principle is shared infrastructure policy versus product-specific business rules.",
          "Proxies also reshape observability. Access logs, latency histograms, and upstream status codes from the proxy tier give a single pane on north-south traffic. Propagating correlation IDs into backends connects that edge view to deep traces."
        ],
        keyTerms: [
          {
            term: "Reverse proxy",
            definition: "A server that receives client requests and forwards them to internal upstreams on the client's behalf from the system's perspective."
          },
          {
            term: "Upstream",
            definition: "The backend service or pool to which the proxy forwards a matched request."
          },
          {
            term: "TLS termination",
            definition: "Ending the client's encrypted session at the proxy so internal hops can be managed separately."
          }
        ],
        callout: {
          tone: "tip",
          body: "If every microservice reimplements the same JWT parsing and gzip logic, consider pushing that shared policy to the proxy or gateway."
        },
        checkYourself: [
          {
            prompt: "When should a reverse proxy cache responses?",
            reveal:
              "Only for shared, cacheable responses with explicit keys and TTLs—not personalized or sensitive payloads without careful key design."
          }
        ]
      },
      {
        id: "api-gateways",
        heading: "API gateways and service exposure",
        paragraphs: [
          "An API gateway is a reverse proxy specialized for exposing services to clients. It aggregates routing, authentication, authorization hooks, rate limiting, request shaping, and sometimes protocol translation. Clients see a stable public API while internal topology changes behind the gateway.",
          "Gateways are useful when many microservices should not be directly internet-facing, when mobile or partner clients need a curated facade, or when you must centralize quotas and API keys. They are less useful when a single modular monolith already has a clear HTTP edge and the gateway would only add hops.",
          "Keep gateway logic thin. If the gateway starts orchestrating multi-step business workflows, implementing domain validation, or owning product state, you have built a distributed monolith choke point. Prefer routing and policy at the gateway; keep workflows in application services."
        ],
        keyTerms: [
          {
            term: "API gateway",
            definition: "An edge component that exposes curated APIs and applies shared routing and policy in front of services."
          },
          {
            term: "Facade API",
            definition: "A client-facing API shape that hides internal service boundaries and evolution."
          },
          {
            term: "Request shaping",
            definition: "Edge controls such as body size limits, timeouts, and header allowlists that protect upstreams."
          }
        ],
        callout: {
          tone: "warning",
          body: "Stuffing product orchestration into the gateway creates a bottleneck team and a bottleneck runtime. Push workflows down into services."
        },
        checkYourself: [
          {
            prompt: "What belongs in an API gateway versus inside a service?",
            reveal:
              "Gateway: TLS, authn/z policy hooks, rate limits, routing, request shaping. Service: domain rules, workflows, persistence, product invariants."
          }
        ]
      },
      {
        id: "layer-responsibilities",
        heading: "CDN, load balancer, proxy, and gateway — who owns what",
        paragraphs: [
          "These boxes often blur in conversation. A clean mental model helps: CDN owns global edge caching and acceleration; load balancer owns healthy distribution across instances; reverse proxy/gateway owns policy, routing facades, and internal exposure control. One physical product may implement multiple roles, but your design explanation should still separate concerns.",
          "Example path: user hits CDN for static assets; API hostname resolves to a regional load balancer; the balancer forwards to a gateway/proxy tier that authenticates and routes to catalog or checkout services. Collapsing that into one vague \"LB\" box loses where caching, failover, and auth actually live.",
          "Split concerns when teams or scaling properties diverge. If CDN config is owned by web platform and service auth policy by API platform, separate entrypoints reduce accidental coupling. If one small team owns everything, a combined edge appliance may be fine for v1."
        ],
        workedExample: {
          title: "Responsibility matrix for a public API",
          body: "Assign each concern to one primary layer.",
          code: "immutable JS/CSS     -> CDN cache\nTLS certs for API     -> LB or gateway\ninstance health       -> load balancer\nJWT validation        -> gateway/proxy\nper-route quotas      -> gateway + service\ncheckout charge logic -> checkout service\nbot floods            -> CDN/WAF first, then gateway",
          language: "text"
        },
        keyTerms: [
          {
            term: "North-south edge",
            definition: "The public entry path from external clients into the system."
          },
          {
            term: "Concern separation",
            definition: "Assigning caching, balancing, and policy to layers with clear ownership instead of one overloaded box."
          }
        ],
        callout: {
          tone: "interview",
          body: "Differentiate reverse proxy, gateway, CDN, and load balancer in one sentence each if the prompt is multi-region and public."
        },
        checkYourself: [
          {
            prompt: "Why is calling every front-door component a load balancer a pitfall?",
            reveal:
              "It hides whether you are caching, authenticating, steering by path, or only distributing to healthy nodes—and those jobs fail differently."
          }
        ]
      },
      {
        id: "auth-rollout-and-headers",
        heading: "Auth propagation, headers, and safe policy rollout",
        paragraphs: [
          "When the edge authenticates, it must propagate identity cleanly to upstreams—often via signed internal headers or mutual TLS service identity. Upstream services should not blindly trust forgeable headers from the open internet. Network policy and header signing close that gap.",
          "Hop-by-hop headers, compression, and buffering settings cause subtle bugs. Compression CPU cost at the edge can be worth it for text responses and harmful for already-compressed media. Large uploads may need streaming rather than full buffering at the proxy. These details belong in serious designs for media or file products.",
          "Roll out new auth policies safely: shadow mode that logs would-deny decisions, dual acceptance of old and new tokens, canary enforcement per route, then global enforcement. Feature flags at the gateway are powerful and dangerous; treat policy changes like code deploys with metrics and rollback."
        ],
        keyTerms: [
          {
            term: "Identity propagation",
            definition: "Passing verified caller identity from the edge to internal services through trusted channels."
          },
          {
            term: "Shadow mode",
            definition: "Evaluating a new policy and recording its effect without enforcing it yet."
          },
          {
            term: "mTLS",
            definition: "Mutual TLS where both sides of a connection authenticate with certificates, common for service identity."
          }
        ],
        callout: {
          tone: "interview",
          body: "For a new auth policy: shadow, canary per route, then enforce—never flip globally on Friday without metrics."
        },
        checkYourself: [
          {
            prompt: "How would you roll out a new auth policy safely?",
            reveal:
              "Run shadow evaluation first, support dual tokens during migration, canary enforcement on a subset of routes or traffic, watch deny rates, then expand with a clear rollback."
          }
        ]
      },
      {
        id: "avoiding-gateway-monolith",
        heading: "Avoiding the gateway monolith",
        paragraphs: [
          "Gateway sprawl happens when every new cross-cutting idea lands at the edge: A/B assignment, pricing experiments, content personalization, and bespoke partner transforms. Some of these belong closer to product services. A thin gateway with well-owned plugins is sustainable; an unowned rule jungle is not.",
          "Team topology should inform the edge. If one platform team owns the gateway, its API should be self-service configuration with guardrails, not tickets for every path change. If every product team can edit global edge config freely, expect outages. Governance is part of the architecture.",
          "In interviews, say how you keep gateways thin, how policies are tested, and how backends remain reachable for internal callers without hairpinning all traffic through a public gateway unnecessarily."
        ],
        keyTerms: [
          {
            term: "Hairpinning",
            definition: "Forcing internal traffic out through the public edge and back in, adding latency and coupling."
          },
          {
            term: "Edge governance",
            definition: "Ownership and change-control practices that keep shared edge configuration safe and evolvable."
          }
        ],
        callout: {
          tone: "warning",
          body: "If orchestration grows complex in the gateway, move it into application services before the edge team becomes the bottleneck for every feature."
        },
        checkYourself: [
          {
            prompt: "Should internal service-to-service calls always go through the public API gateway?",
            reveal:
              "Usually no. Prefer internal discovery and mesh/LB paths; use the public gateway for external clients and partner entry to avoid hairpinning and overload."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Reverse proxies centralize TLS, normalization, shared caching, and north-south observability.",
        "API gateways expose curated APIs and shared policy; keep domain workflows out of them.",
        "Separate CDN, balancing, and gateway responsibilities even when one product implements several.",
        "Roll out edge auth and policy with shadow/canary discipline and trusted identity propagation."
      ],
      nextSteps: [
        "Draw an entry path labeling CDN vs LB vs gateway responsibilities.",
        "List five rules in a gateway and mark which should move into services.",
        "Design a shadow-mode rollout for a new JWT format."
      ]
    }
  },

  "edge-and-routing/rate-limiting-and-edge-protection": {
    title: "Rate limiting and edge protection",
    readingTime: "80-100 min",
    premise:
      "Abuse resistance is part of system design. A product that collapses under bots, credential stuffing, or accidental retry storms is not production ready. Rate limiting and edge protection convert that reality into concrete algorithms, placement choices, and client experience.",
    parts: [
      {
        id: "limiting-units",
        heading: "Choose the right limiting unit",
        paragraphs: [
          "Limits can apply per IP, user, API key, device, tenant, region, route, or combinations. IP limits catch coarse internet abuse but fail for NAT-heavy mobile carriers and for authenticated multi-tenant products where one IP represents many customers. User and API-key limits align better with product quotas. Tenant limits protect shared SaaS infrastructure from noisy neighbors and encode plan tiers.",
          "Different routes need different budgets. Login, password reset, and OTP endpoints need tight anti-abuse limits. Read-only catalog endpoints may allow more. Expensive search or report generation needs cost-based or concurrency limits, not only request counts. Designing one global QPS number for the whole API is usually too blunt.",
          "Identity uncertainty is the hard case. Before login you may only have IP, device fingerprints, and behavioral signals. After login you can limit by account and still keep IP anomaly detection. Credential-stuffing defense typically stacks per-IP and per-account limits with escalating challenges."
        ],
        keyTerms: [
          {
            term: "Noisy neighbor",
            definition: "A tenant or client whose load degrades shared infrastructure for others."
          },
          {
            term: "Quota",
            definition: "A product-level allowance, often billed or plan-based, enforced as a class of rate limit."
          },
          {
            term: "Cost-based limit",
            definition: "A throttle that accounts for expensive operations differently than cheap ones, sometimes via weighted tokens."
          }
        ],
        callout: {
          tone: "tip",
          body: "Ask \"who is being limited and why?\" before picking an algorithm. Unit choice matters more than token-bucket trivia."
        },
        checkYourself: [
          {
            prompt: "When would you rate-limit by tenant instead of by user?",
            reveal:
              "When plan quotas are contractual, when many users share a tenant's blast radius, or when noisy-neighbor isolation is required on shared infrastructure."
          }
        ]
      },
      {
        id: "algorithms",
        heading: "Algorithms: token bucket, leaky bucket, sliding window",
        paragraphs: [
          "Token bucket allows bursts up to a bucket capacity and refills tokens at a steady rate. It matches many API products where short bursts are fine but sustained overload is not. Leaky bucket smooths output to a constant drain rate, which is useful when downstream systems need steadier intake. Sliding window logs track precise request timestamps for accurate windows at higher storage and compute cost.",
          "Fixed windows are simple but suffer boundary bursts: a client can spend a full quota at the end of one window and again at the start of the next. Sliding windows or token buckets reduce that edge effect. In interviews, name the burst behavior you want and pick accordingly rather than reciting every algorithm.",
          "Distributed enforcement needs shared state or approximate local limits. Centralized Redis counters are common for accuracy across nodes; local limits are faster but allow N-times quota across N instances. Hybrid approaches use local limits for emergency protection and global counters for fair quotas. Consistency of the limiter under partition is itself a design choice."
        ],
        workedExample: {
          title: "Token bucket intuition for a public API",
          body: "Connect parameters to product language.",
          code: "bucket_size = 60          # allow short burst of 60 reqs\nrefill     = 1 token/sec  # sustained 60 req/min equivalent\n\non request:\n  if tokens >= 1: consume; allow\n  else: return 429 + Retry-After\n\nnote: 10 gateway nodes with only local buckets\n      => effective burst up to ~10x; use shared store for strict quotas",
          language: "text"
        },
        keyTerms: [
          {
            term: "Token bucket",
            definition: "A rate-limit algorithm that stores burst capacity as tokens refilled at a constant rate."
          },
          {
            term: "Leaky bucket",
            definition: "An algorithm that drains queued work at a fixed rate, smoothing bursts into steady outflow."
          },
          {
            term: "Fixed window",
            definition: "A counter strategy that resets each discrete interval, simple but prone to boundary bursting."
          }
        ],
        callout: {
          tone: "warning",
          body: "A single centralized limiter can become a bottleneck or SPOF. Design timeouts and fail policies for limiter outages."
        },
        checkYourself: [
          {
            prompt: "Why might local-only rate limits be insufficient for billing-grade quotas?",
            reveal:
              "Each instance enforces its own budget, so total accepted traffic scales with instance count and can far exceed the intended global quota."
          }
        ]
      },
      {
        id: "placement",
        heading: "Place enforcement carefully across the edge",
        paragraphs: [
          "Coarse limits at the CDN or gateway stop obvious floods early and protect origin CPU. Fine-grained per-tenant or per-operation limits deeper in the stack protect expensive resources with better identity context. Layering both is defense in depth, not duplication for its own sake.",
          "Combine rate limits with queue back pressure, concurrency caps, and circuit breakers. Limits reject or delay excess intake; back pressure slows producers; circuit breakers stop calling sick dependencies. Together they keep overload from cascading. Relying on only one mechanism usually fails a realistic incident.",
          "Login and account recovery deserve special placement. Put aggressive edge controls on authentication routes, add progressive challenges such as CAPTCHA after repeated failures, and alert on stuffing-shaped traffic. Do not treat login like a normal CRUD endpoint."
        ],
        keyTerms: [
          {
            term: "Edge enforcement",
            definition: "Applying coarse abuse controls at CDN/gateway before requests reach application origins."
          },
          {
            term: "Progressive challenge",
            definition: "Escalating proof requirements such as CAPTCHA after suspicious or repeated failed attempts."
          },
          {
            term: "Defense in depth",
            definition: "Multiple reinforcing controls at different layers so one failure does not expose the core."
          }
        ],
        callout: {
          tone: "interview",
          body: "For credential stuffing: per-IP + per-account limits, escalating challenges, and anomaly detection—not IP limits alone."
        },
        checkYourself: [
          {
            prompt: "How would you protect a login API from credential stuffing?",
            reveal:
              "Stack per-IP and per-account throttles, escalate to CAPTCHA or similar challenges, watch stuffing patterns, and keep the auth datastore protected with lockouts that do not create easy denial-of-service on a single account without care."
          }
        ]
      },
      {
        id: "client-experience",
        heading: "Plan the user and client experience",
        paragraphs: [
          "Good systems return clear 429 responses with machine-readable bodies and Retry-After guidance. Legitimate SDKs can back off; browsers can show coherent errors. Silent drops make debugging hell and amplify retries. Distinguish soft throttles for accidental bursts from hard blocks for abuse when product semantics allow.",
          "Internal customers and partner APIs often need warning thresholds and dashboards before hard enforcement. Quotas without observability create support storms. Publish usage metrics beside limits so clients can self-correct.",
          "False positives are a first-class risk. Carrier-grade NAT can put thousands of users behind one IP. Over-tight IP limits then punish innocents. Measure block rates alongside abuse signals and provide appeal or alternative identity paths where appropriate."
        ],
        keyTerms: [
          {
            term: "Retry-After",
            definition: "A response hint telling clients when they may reasonably retry after being throttled."
          },
          {
            term: "Soft limit",
            definition: "A threshold that warns or degrades service before hard rejection."
          },
          {
            term: "False positive block",
            definition: "Rejecting legitimate traffic because the limiting signal is too coarse or mis-tuned."
          }
        ],
        callout: {
          tone: "tip",
          body: "Watch 429 rate, retry storms, limiter latency, and origin load together to decide if limits are too strict or too weak."
        },
        checkYourself: [
          {
            prompt: "What metrics tell you the limiter is too strict or too weak?",
            reveal:
              "Too strict: high 429s with low abuse signals and rising support complaints. Too weak: rising origin overload or abuse with few blocks. Also watch limiter errors and latency."
          }
        ]
      },
      {
        id: "failure-modes-of-protection",
        heading: "Failure modes of the protection layer itself",
        paragraphs: [
          "Decide what happens when the rate-limit store is down. Fail open preserves availability but risks overload during an attack coincident with limiter failure. Fail closed protects origins but turns a Redis outage into a user-facing outage. Many systems fail open for read-heavy public GETs with local emergency caps, and fail closed for expensive or auth-sensitive routes.",
          "Limiters can amplify outages if every request synchronously blocks on a slow central store. Use timeouts, hedging local decisions, and caching of quota decisions for short intervals. Protection infrastructure needs SLOs just like product APIs.",
          "Close interview answers by naming the limiting unit, algorithm burst behavior, placement layers, client retry contract, and limiter failure policy. That checklist reads as production experience."
        ],
        keyTerms: [
          {
            term: "Fail-open limiter",
            definition: "A policy that allows traffic when the limiting system cannot be reached, prioritizing availability."
          },
          {
            term: "Fail-closed limiter",
            definition: "A policy that rejects traffic when limits cannot be evaluated, prioritizing protection."
          }
        ],
        callout: {
          tone: "warning",
          body: "IP-only limits for authenticated multi-tenant workloads are usually the wrong primary control—use them as a coarse supplement."
        },
        checkYourself: [
          {
            prompt: "Why can a rate limiter become a self-inflicted outage?",
            reveal:
              "If enforcement synchronously depends on a slow or down central store and fails closed globally, legitimate traffic dies even when origins are healthy."
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        "Pick limiting units that match identity, tenancy, and route cost—not one blunt global QPS.",
        "Choose algorithms for the burst behavior you want; plan distributed enforcement carefully.",
        "Enforce coarsely at the edge and finely near expensive services; special-case auth routes.",
        "Return clear retry semantics and define limiter failure policy before the incident."
      ],
      nextSteps: [
        "Design layered limits for login, search, and tenant export jobs.",
        "Compare fail-open vs fail-closed for a Redis-backed quota service.",
        "Draft a 429 response contract for an external partner API."
      ]
    }
  }
};
