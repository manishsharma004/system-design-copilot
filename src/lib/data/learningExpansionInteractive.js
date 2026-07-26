import { hldExhaustiveLabInteractive } from './hldExhaustiveLabInteractive.js';

function caseStudy({ title, prompt, steps, metrics }) {
  return {
    title,
    prompt,
    context: prompt,
    steps: steps.map((step, index) => ({
      title: step.title,
      detail: step.detail,
      phase: `${index + 1}. ${step.title}`,
      decision: step.title,
      why: step.detail,
      whatIf: step.whatIf ?? 'Skipping this step makes the design harder to defend because the trade-off stays implicit.'
    })),
    metrics: metrics ?? []
  };
}

/** @type {Record<string, any>} */
export const learningExpansionInteractive = {
  ...hldExhaustiveLabInteractive,
  'systems-fundamentals-lab/request-lifecycle-deep-dive': {
    title: 'Request lifecycle tracing lab',
    summary:
      'Walk a single user request from device tap to durable state change, then decide where latency, retries, queues, and observability belong.',
    takeaways: [
      'Every request has a control path, data path, and failure path.',
      'Latency budgets should be allocated per hop instead of guessed at the end.',
      'Retries need idempotency and deadlines or they turn partial failures into incidents.'
    ],
    examples: [
      {
        id: 'checkout-write',
        label: 'Checkout write',
        title: 'Trace the money-moving request before adding services',
        scenario:
          'A checkout API receives a mobile request, validates cart state, reserves inventory, creates a payment intent, and returns an order id.',
        decision: 'Keep synchronous work to validation, reservation, and payment intent creation; push receipts and analytics to an event path.',
        why: [
          'The user only needs confirmation that the order is accepted, not every downstream side effect.',
          'A clear deadline prevents the client, API gateway, and payment client from retrying independently forever.',
          'An idempotency key lets a retry return the same order instead of double-charging the user.'
        ],
        alternative:
          'Doing email, analytics, loyalty updates, and warehouse notifications inline makes the request fragile and ties checkout latency to colder systems.',
        outcome:
          'The API stays explainable: one durable write path, one asynchronous side-effect path, and explicit retry semantics.'
      },
      {
        id: 'feed-read',
        label: 'Feed read',
        title: 'Separate hot read assembly from slow personalization refresh',
        scenario:
          'A social feed request needs user session validation, cached candidate posts, ranking features, and media URLs under a 200 ms p95 target.',
        decision: 'Serve cached candidates synchronously and refresh ranking features out of band when they miss freshness targets.',
        why: [
          'The request can degrade to slightly stale ranking without failing the page load.',
          'Media and profile fan-out can be protected with cache lookups and bounded concurrency.',
          'Tracing shows which dependency consumes the latency budget before teams optimize blindly.'
        ],
        alternative:
          'Recomputing the full feed from source systems on every request creates tail latency spikes and makes one slow dependency stall the page.',
        outcome:
          'The read path is fast by default, with freshness treated as a measurable quality dimension instead of a blocking requirement.'
      }
    ],
    decisionGuide: {
      prompt: 'What should stay in the synchronous request path?',
      options: [
        {
          id: 'critical-only',
          label: 'Critical path only',
          bestFor: 'Writes where the user needs a definitive success or failure before moving on.',
          chooseWhen: [
            'The step protects money, inventory, authorization, or irreversible state.',
            'The dependency can honor the caller deadline and return a clear result.',
            'Retries can be made idempotent with stable request identifiers.'
          ],
          tradeOffs: [
            'Some user-visible details may appear after the initial response.',
            'You need durable events or jobs for deferred side effects.',
            'The team must define what counts as accepted versus fully completed.'
          ],
          alternativeOutcome:
            'Putting every side effect inline gives a simple diagram but poor latency isolation and more cascading failures.'
        },
        {
          id: 'async-side-effects',
          label: 'Async side effects',
          bestFor: 'Notifications, analytics, search indexing, enrichment, and other recoverable work.',
          chooseWhen: [
            'The user does not need the result to continue.',
            'The work can be retried from a durable event or job.',
            'Temporary delay is better than failing the primary request.'
          ],
          tradeOffs: [
            'The product must tolerate eventual consistency.',
            'Operators need dead-letter queues, replay, and lag alerts.',
            'Duplicate delivery must be handled by consumers.'
          ],
          alternativeOutcome:
            'If deferred work is not durable, failures become silent data loss rather than user-visible latency.'
        },
        {
          id: 'precompute',
          label: 'Precompute and cache',
          bestFor: 'Read-heavy pages with expensive assembly and acceptable staleness.',
          chooseWhen: [
            'The same data is read many times per write.',
            'Freshness can be expressed as a target instead of an absolute.',
            'Cache keys and invalidation rules are clear.'
          ],
          tradeOffs: [
            'Stale data becomes part of the product contract.',
            'Invalidation bugs can be harder to notice than request failures.',
            'Warm-up and stampede protection become operational concerns.'
          ],
          alternativeOutcome:
            'Computing everything on demand may work at low traffic, then fail first at the slowest fan-out dependency.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design a resilient order-submission request',
      prompt:
        'A mobile checkout request must finish under 600 ms p95, avoid duplicate charges, and still trigger receipts, search indexing, and warehouse notification.',
      steps: [
        {
          title: 'Name the user contract',
          detail: 'Return accepted only after cart validation, inventory reservation, order creation, and payment intent persistence succeed.',
          whatIf: 'If accepted only means the API received the request, users can see orders disappear after payment retries.'
        },
        {
          title: 'Set hop budgets and deadlines',
          detail: 'Allocate time to gateway, auth, order service, inventory, and payment, then pass a shorter deadline to each downstream call.',
          whatIf: 'Without deadlines, retries pile up behind already-slow dependencies and make the incident wider.'
        },
        {
          title: 'Make retries idempotent',
          detail: 'Require an idempotency key tied to the cart and user so duplicate submits return the same order and payment intent.',
          whatIf: 'Retrying without idempotency can double-reserve inventory or create multiple payment attempts.'
        },
        {
          title: 'Move recoverable work to events',
          detail: 'Publish an order-accepted event for email, analytics, search indexing, and warehouse workflows with replay support.',
          whatIf: 'Inline side effects make checkout availability depend on every downstream consumer.'
        }
      ],
      metrics: ['p95 request latency', 'retry rate by dependency', 'idempotency-key reuse', 'event lag', 'dead-letter count']
    }),
    mermaid: {
      title: 'Synchronous request with deferred side effects',
      caption: 'The accepted response depends on authoritative state; recoverable work moves through durable events.',
      code: `sequenceDiagram
    participant Client
    participant API
    participant Order
    participant Payment
    participant Bus
    Client->>API: Submit order with idempotency key
    API->>Order: Reserve inventory and create order
    Order->>Payment: Create payment intent
    Payment-->>Order: Intent persisted
    Order-->>API: Order accepted
    API-->>Client: 202 accepted with order id
    Order->>Bus: Publish order accepted event
      `
    }
  },
  'systems-fundamentals-lab/capacity-cost-and-utilization': {
    title: 'Capacity, cost, and utilization lab',
    summary:
      'Turn traffic assumptions into capacity plans, utilization targets, and cost trade-offs that survive both interview scrutiny and real launches.',
    takeaways: [
      'Capacity plans start from workload units, not instance counts.',
      'Utilization targets must leave room for spikes, deploys, and dependency failures.',
      'Cost work is strongest when it preserves the user-facing SLO.'
    ],
    examples: [
      {
        id: 'api-fleet',
        label: 'API fleet',
        title: 'Right-size an API fleet around p95 work, not average CPU alone',
        scenario:
          'A product API handles 25k requests per second at peak, with read requests costing 8 ms CPU and writes costing 35 ms CPU.',
        decision: 'Estimate CPU cores from weighted request cost, then add headroom for deploy overlap and zonal loss.',
        why: [
          'Weighted work captures the difference between cheap reads and expensive writes.',
          'A target like 55-65% steady CPU leaves room for burst and garbage collection.',
          'N+1 or zonal-loss planning avoids running at perfect utilization that fails during maintenance.'
        ],
        alternative:
          'Sizing only from average QPS hides expensive request classes and leads to saturation when traffic mix shifts.',
        outcome:
          'The capacity answer ties math to operating policy: traffic shape, headroom, autoscaling, and cost controls.'
      },
      {
        id: 'batch-gpu',
        label: 'Batch inference',
        title: 'Use queues to trade latency flexibility for GPU utilization',
        scenario:
          'A nightly embedding job can finish within four hours but GPUs are idle during the day and overloaded after midnight.',
        decision: 'Batch work through a queue with dynamic batch sizing and spot capacity where retry cost is acceptable.',
        why: [
          'Queue depth makes demand visible and gives autoscaling a better signal than instantaneous GPU load.',
          'Batching improves throughput when the product does not require immediate results.',
          'Retryable jobs can use cheaper interruptible capacity without harming interactive users.'
        ],
        alternative:
          'Provisioning all GPUs for the midnight peak wastes cost for most of the day and hides backlog until the deadline is missed.',
        outcome:
          'The workload uses slack time and cheaper capacity while still protecting the completion SLO.'
      }
    ],
    decisionGuide: {
      prompt: 'Which capacity strategy best fits the workload?',
      options: [
        {
          id: 'headroom-fleet',
          label: 'Provisioned fleet with headroom',
          bestFor: 'Latency-sensitive APIs with steady baseline traffic.',
          chooseWhen: [
            'Cold starts or queueing would harm the user experience.',
            'Traffic is predictable enough to reserve baseline capacity.',
            'The service must tolerate deploy overlap or zonal loss.'
          ],
          tradeOffs: [
            'You pay for idle headroom during normal traffic.',
            'Autoscaling still needs good request and saturation signals.',
            'Overprovisioning can mask inefficient code paths.'
          ],
          alternativeOutcome:
            'Running too close to 100% utilization lowers cost briefly but removes the safety margin needed for real incidents.'
        },
        {
          id: 'queue-elastic',
          label: 'Queue-backed elastic workers',
          bestFor: 'Async jobs, media processing, and batch inference with flexible latency.',
          chooseWhen: [
            'The product can express a completion deadline instead of immediate response.',
            'Jobs are retryable and can tolerate duplicate execution.',
            'Queue lag is an acceptable control metric.'
          ],
          tradeOffs: [
            'Users may need progress states or delayed availability.',
            'Backlog growth can surprise teams without clear alerts.',
            'Workers need idempotent outputs and poison-message handling.'
          ],
          alternativeOutcome:
            'Serving this work synchronously forces peak provisioning and couples user latency to expensive compute.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Plan launch capacity for a creator analytics API',
      prompt:
        'A creator dashboard launches to 2 million users, with 35k peak read RPS, expensive aggregation misses, and a promise of 300 ms p95.',
      steps: [
        {
          title: 'Convert traffic into work',
          detail: 'Split requests into cache hits, cache misses, and writes, then estimate CPU, memory, and downstream query cost for each class.',
          whatIf: 'If all requests are treated as equal, cache-miss bursts will overload the database before API CPU looks suspicious.'
        },
        {
          title: 'Pick utilization targets',
          detail: 'Run API nodes at moderate steady utilization and database pools lower, because storage dependencies usually have worse failure blast radius.',
          whatIf: 'A flat 90% utilization target across all tiers leaves no room for deploys, failover, or traffic mix changes.'
        },
        {
          title: 'Add cost controls',
          detail: 'Use pre-aggregation, cache TTLs, and reserved baseline capacity before adding more replicas.',
          whatIf: 'Buying more servers without reducing repeated work makes the bill scale faster than product value.'
        },
        {
          title: 'Define scaling signals',
          detail: 'Scale on request latency, queue lag, saturation, and cache-miss rate rather than CPU alone.',
          whatIf: 'CPU-only autoscaling reacts late when the true bottleneck is database wait or connection pool exhaustion.'
        }
      ],
      metrics: ['weighted RPS', 'CPU per request class', 'cache-miss rate', 'database wait time', 'cost per 1k requests']
    }),
    mermaid: {
      title: 'Capacity loop',
      caption: 'Translate demand into work, choose utilization targets, then tune cost without breaking SLOs.',
      code: `flowchart LR
    Demand[Traffic forecast] --> Work[Work units]
    Work --> Capacity[Baseline capacity]
    Capacity --> Headroom[Failure and deploy headroom]
    Headroom --> Cost[Cost controls]
    Cost --> Signals[Autoscaling signals]
    Signals --> Capacity
      `
    }
  },
  'systems-fundamentals-lab/designing-for-evolution': {
    title: 'Designing for evolution lab',
    summary:
      'Practice choosing extension points, migration plans, and compatibility boundaries so a design can grow without pretending the final architecture is known today.',
    takeaways: [
      'Good evolution plans isolate stable contracts from volatile internals.',
      'Schema and API changes need compatibility windows, not big-bang rewrites.',
      'The best abstraction is the one that removes a known change risk.'
    ],
    examples: [
      {
        id: 'payments-provider',
        label: 'Payment providers',
        title: 'Hide provider churn behind a narrow payment contract',
        scenario:
          'A startup launches with one payment processor but expects regional processors, fraud rules, and payment-method-specific flows.',
        decision: 'Define an internal payment-intent contract and adapter boundary before adding provider-specific features.',
        why: [
          'Order state should not depend on one vendor response shape.',
          'A stable intent lifecycle makes retries, webhooks, and reconciliation easier to reason about.',
          'Provider-specific code stays replaceable when the business expands to new regions.'
        ],
        alternative:
          'Threading vendor fields through every service ships faster for one provider but makes the second provider a risky rewrite.',
        outcome:
          'The design evolves by adding adapters and capabilities without changing the order domain every time.'
      },
      {
        id: 'profile-schema',
        label: 'Profile schema',
        title: 'Use expand-contract migrations for user profile changes',
        scenario:
          'A profile service must split a single displayName field into localized name parts while old mobile clients are still active.',
        decision: 'Add new fields, write both shapes, migrate reads, then remove the old field after client adoption.',
        why: [
          'Old clients keep working during the rollout window.',
          'Backfills can be retried and audited without blocking deploys.',
          'The migration has observable phases and rollback points.'
        ],
        alternative:
          'Changing the field in place forces every client and service to deploy at once, which rarely matches production reality.',
        outcome:
          'Compatibility becomes a planned sequence instead of an emergency after the first broken client report.'
      }
    ],
    decisionGuide: {
      prompt: 'Where should you invest in evolvability first?',
      options: [
        {
          id: 'stable-contract',
          label: 'Stable internal contract',
          bestFor: 'Domains with vendor churn, multiple clients, or frequent implementation swaps.',
          chooseWhen: [
            'Callers need a consistent lifecycle more than raw provider detail.',
            'You can name the likely variants without overgeneralizing everything.',
            'The contract maps to business concepts rather than infrastructure brands.'
          ],
          tradeOffs: [
            'The first version takes more thought than direct integration.',
            'A poorly chosen contract can freeze the wrong assumptions.',
            'Adapters need conformance tests to stay honest.'
          ],
          alternativeOutcome:
            'Direct integration is faster for a prototype but becomes expensive once many callers depend on provider-specific behavior.'
        },
        {
          id: 'migration-plan',
          label: 'Explicit migration plan',
          bestFor: 'Schema, API, and storage changes with existing users or persisted data.',
          chooseWhen: [
            'Old and new versions must coexist for days or weeks.',
            'Rollback is required if quality checks fail.',
            'Data backfills can be separated from application deploys.'
          ],
          tradeOffs: [
            'Temporary dual reads or writes add code that must be removed later.',
            'Metrics are needed to prove each phase is complete.',
            'Product teams must understand temporary mixed states.'
          ],
          alternativeOutcome:
            'Big-bang migration looks clean in a diagram but creates a high-risk deploy with few recovery options.'
        },
        {
          id: 'simple-now',
          label: 'Simple implementation with named escape hatch',
          bestFor: 'Early products where over-abstraction is a bigger risk than change.',
          chooseWhen: [
            'The likely future requirement is plausible but not yet funded.',
            'The current code can be replaced behind a small boundary.',
            'You record the trigger that would justify the next design step.'
          ],
          tradeOffs: [
            'Some future work is intentionally deferred.',
            'The team must remember to revisit the decision when triggers fire.',
            'The first migration may be more manual than a platformized answer.'
          ],
          alternativeOutcome:
            'Building a framework for every possible future slows the current product and may optimize for changes that never arrive.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Evolve a notification system without breaking clients',
      prompt:
        'A product starts with email notifications, then needs push, SMS, per-region providers, user preferences, and delivery analytics.',
      steps: [
        {
          title: 'Protect the domain event',
          detail: 'Model notification intent separately from provider delivery attempts so product services publish stable business events.',
          whatIf: 'If product services call providers directly, every new channel spreads provider behavior across the codebase.'
        },
        {
          title: 'Add channel adapters',
          detail: 'Create email, push, and SMS adapters behind a delivery contract with provider-specific retries and status mapping.',
          whatIf: 'Without adapters, regional provider changes require touching user preference and product event code.'
        },
        {
          title: 'Migrate preferences gradually',
          detail: 'Introduce channel-specific preferences with dual reads from the old global preference until clients update.',
          whatIf: 'Replacing the preference shape in one deploy breaks older settings screens and cached clients.'
        },
        {
          title: 'Measure removal readiness',
          detail: 'Track old-client reads, dual-write mismatches, and delivery status coverage before removing compatibility code.',
          whatIf: 'Leaving compatibility code forever creates hidden behavior that future engineers cannot reason about.'
        }
      ],
      metrics: ['old contract read rate', 'dual-write mismatch count', 'provider failure rate', 'delivery status coverage']
    }),
    mermaid: {
      title: 'Evolvable notification boundary',
      caption: 'Product events stay stable while channels, providers, and preferences evolve behind contracts.',
      code: `flowchart LR
    Product[Product event] --> Intent[Notification intent]
    Intent --> Preferences[Preference resolver]
    Preferences --> Router[Channel router]
    Router --> Email[Email adapter]
    Router --> Push[Push adapter]
    Router --> Sms[SMS adapter]
    Email --> Status[Delivery status]
    Push --> Status
    Sms --> Status
      `
    }
  },
  'reliability-observability-lab/sli-slo-error-budgets': {
    title: 'SLI, SLO, and error budget lab',
    summary:
      'Practice turning reliability into measurable promises, then use the remaining error budget to guide launches, rollback decisions, and engineering trade-offs.',
    takeaways: [
      'An SLI measures the user experience, not just server health.',
      'An SLO is useful only when it changes release and incident decisions.',
      'Error budgets let teams balance reliability work against feature speed.'
    ],
    examples: [
      {
        id: 'search-availability',
        label: 'Search API',
        title: 'Measure successful searches from the caller viewpoint',
        scenario:
          'A search API has healthy hosts but users complain because some requests return empty results after timeouts to the ranking service.',
        decision: 'Define the SLI as valid search responses under 400 ms, excluding bad client queries but including dependency failures.',
        why: [
          'Users care whether search returned useful results in time.',
          'Host uptime misses dependency failures and invalid fallbacks.',
          'The SLO can drive rollback when ranking changes burn too much budget.'
        ],
        alternative:
          'Using process uptime as the primary SLI makes dashboards green while customers experience failed searches.',
        outcome:
          'The team gets a reliability target connected to product experience and release decisions.'
      },
      {
        id: 'checkout-budget',
        label: 'Checkout budget',
        title: 'Spend error budget deliberately on risky launches',
        scenario:
          'Checkout has a 99.95% monthly success SLO and a new fraud model increases false declines and payment latency.',
        decision: 'Launch behind a ramp plan with budget burn alerts and stop conditions tied to successful checkout attempts.',
        why: [
          'A tiny failure percentage still represents many failed payments at scale.',
          'Budget burn rate catches fast regressions before the month is ruined.',
          'The product can trade some risk for fraud savings only while budget remains.'
        ],
        alternative:
          'Shipping because service CPU looks normal ignores the user-visible success rate and may exhaust the monthly budget in hours.',
        outcome:
          'Reliability becomes a launch gate with clear numbers instead of a vague concern.'
      }
    ],
    decisionGuide: {
      prompt: 'Which reliability target should lead the conversation?',
      options: [
        {
          id: 'request-sli',
          label: 'Request success and latency SLI',
          bestFor: 'Interactive APIs where users wait for a response.',
          chooseWhen: [
            'The product experience depends on timely successful responses.',
            'Failures can come from dependencies, fallbacks, or server errors.',
            'Release decisions need fast feedback.'
          ],
          tradeOffs: [
            'You must define valid requests and acceptable responses carefully.',
            'Instrumentation needs consistent status and latency semantics.',
            'Some background work may need separate SLIs.'
          ],
          alternativeOutcome:
            'Infrastructure-only SLIs can hide product failure modes and produce misleading reliability claims.'
        },
        {
          id: 'freshness-sli',
          label: 'Freshness or correctness SLI',
          bestFor: 'Pipelines, caches, recommendations, and analytics where stale output is the failure.',
          chooseWhen: [
            'The user may receive a response that is technically available but outdated or wrong.',
            'Lag, skew, or data quality matter more than HTTP status.',
            'The system has async stages with measurable completion targets.'
          ],
          tradeOffs: [
            'Freshness thresholds need product input.',
            'Backfills and partial outages complicate measurement.',
            'Dashboards must distinguish late from missing from incorrect.'
          ],
          alternativeOutcome:
            'Availability alone says nothing about stale dashboards or broken recommendation inputs.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Set an SLO for a ride-matching service',
      prompt:
        'Riders need a match decision quickly, drivers need accurate assignments, and leadership wants to know when launches should pause.',
      steps: [
        {
          title: 'Define the user journey',
          detail: 'Measure from rider request accepted to match confirmed, with separate accounting for invalid requests and user cancellations.',
          whatIf: 'If the SLI starts at an internal queue, it ignores gateway and auth failures that users still experience.'
        },
        {
          title: 'Pick SLIs that map to pain',
          detail: 'Track match success within 15 seconds, duplicate assignment rate, and stale-location match rate.',
          whatIf: 'A single uptime metric cannot catch slow matches or wrong driver assignments.'
        },
        {
          title: 'Choose SLOs and burn alerts',
          detail: 'Set monthly objectives and fast-burn alerts that page when a short window threatens the whole budget.',
          whatIf: 'Monthly reports without burn alerts detect the reliability miss after users have already left.'
        },
        {
          title: 'Connect budget to action',
          detail: 'Pause risky ramps, prioritize incident fixes, or relax launch velocity when budget burn crosses agreed thresholds.',
          whatIf: 'An SLO that does not change decisions becomes dashboard decoration.'
        }
      ],
      metrics: ['match success within 15s', 'duplicate assignments', 'stale-location matches', 'budget burn rate']
    }),
    mermaid: {
      title: 'Error budget decision loop',
      caption: 'User-centered SLIs feed SLOs, burn alerts, and concrete launch decisions.',
      code: `flowchart LR
    Journey[User journey] --> SLI[Service level indicator]
    SLI --> SLO[Service level objective]
    SLO --> Budget[Error budget]
    Budget --> Burn[Burn-rate alerts]
    Burn --> Action[Ship, pause, rollback, or harden]
    Action --> Journey
      `
    }
  },
  'reliability-observability-lab/tracing-metrics-and-logs': {
    title: 'Tracing, metrics, and logs lab',
    summary:
      'Decide which observability signal answers which question, then design instrumentation that lets operators move from symptom to cause quickly.',
    takeaways: [
      'Metrics show trends and alerts; traces show request paths; logs explain local facts.',
      'Correlation ids and consistent dimensions are more valuable than more dashboards.',
      'Observability should be designed around debugging questions, not tool names.'
    ],
    examples: [
      {
        id: 'slow-checkout',
        label: 'Slow checkout',
        title: 'Use metrics to detect, traces to localize, logs to explain',
        scenario:
          'Checkout p95 jumps from 320 ms to 900 ms after a deploy, but only for users paying with one wallet provider.',
        decision: 'Alert on checkout latency, inspect traces by payment method, then use structured logs around provider calls.',
        why: [
          'The metric confirms user impact and severity.',
          'Trace spans reveal the provider call as the slow hop without guessing.',
          'Logs with provider code and retry count explain why that hop slowed down.'
        ],
        alternative:
          'Searching unstructured logs first wastes time and may miss the cross-service timing pattern.',
        outcome:
          'The investigation follows the signal hierarchy and gets from symptom to root cause faster.'
      },
      {
        id: 'pipeline-lag',
        label: 'Pipeline lag',
        title: 'Observe async systems with lag and freshness, not request latency',
        scenario:
          'A recommendation feature pipeline returns successful job statuses while homepage recommendations are stale for new users.',
        decision: 'Measure event lag, feature freshness, dropped records, and trace representative events through transforms.',
        why: [
          'Async pipelines fail by getting late, losing records, or producing skewed values.',
          'Representative traces show which stage adds delay.',
          'Structured logs preserve row-level rejection reasons for repair.'
        ],
        alternative:
          'Only monitoring worker CPU and success exits misses data quality failures that still return zero exit codes.',
        outcome:
          'The team can distinguish delayed, missing, and incorrect features during incidents.'
      }
    ],
    decisionGuide: {
      prompt: 'Which observability signal should you reach for first?',
      options: [
        {
          id: 'metrics',
          label: 'Metrics',
          bestFor: 'Alerting, trends, SLOs, saturation, and aggregate comparisons.',
          chooseWhen: [
            'You need to know whether something is wrong and how widespread it is.',
            'The question can be answered with counts, rates, latency, or gauges.',
            'Low-cardinality dimensions can isolate the affected slice.'
          ],
          tradeOffs: [
            'Metrics usually do not explain a single request in detail.',
            'High cardinality can make them expensive or unusable.',
            'Bad aggregation can hide tail behavior.'
          ],
          alternativeOutcome:
            'Starting with logs for every alert often creates noisy investigations with no severity context.'
        },
        {
          id: 'traces',
          label: 'Distributed traces',
          bestFor: 'Request path debugging across services and dependencies.',
          chooseWhen: [
            'A user-visible request crosses multiple services.',
            'You need to know which hop consumed latency or returned an error.',
            'Sampling and propagation are configured end to end.'
          ],
          tradeOffs: [
            'Tracing requires consistent context propagation.',
            'Sampling can hide rare failures if not designed carefully.',
            'Traces identify where to inspect, not always why code behaved that way.'
          ],
          alternativeOutcome:
            'Without traces, teams infer call paths from memory and often blame the wrong service.'
        },
        {
          id: 'logs',
          label: 'Structured logs',
          bestFor: 'Local event detail, audit facts, and exception context.',
          chooseWhen: [
            'You already know the affected component or request id.',
            'The answer depends on parameters, decisions, or error payloads.',
            'Logs include stable fields rather than free-form strings only.'
          ],
          tradeOffs: [
            'Logs are high volume and need retention policy.',
            'Sensitive fields must be redacted at write time.',
            'They are weaker for aggregate alerting unless converted into metrics.'
          ],
          alternativeOutcome:
            'Unstructured logs without request ids force manual correlation during the highest-pressure moments.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Instrument a multi-service signup flow',
      prompt:
        'Signup calls identity, risk scoring, profile creation, email verification, and analytics. Users report intermittent delays after a release.',
      steps: [
        {
          title: 'Define the debugging questions',
          detail: 'List what operators must know: affected percent, slow hop, error class, deployment version, and user segment.',
          whatIf: 'If instrumentation starts from tool defaults, the dashboard may not answer the incident questions.'
        },
        {
          title: 'Add metrics for symptoms',
          detail: 'Emit success rate and latency by endpoint, version, region, and major dependency with bounded cardinality.',
          whatIf: 'Without aggregate metrics, the team cannot tell whether a complaint is isolated or a broad SLO burn.'
        },
        {
          title: 'Propagate trace context',
          detail: 'Carry a correlation id through identity, risk, profile, and email calls so one signup has a visible path.',
          whatIf: 'Missing context turns a distributed flow into separate service stories that are hard to align.'
        },
        {
          title: 'Log decisions structurally',
          detail: 'Log risk outcomes, provider response classes, retry counts, and sanitized error codes using stable fields.',
          whatIf: 'Free-form logs may be readable once but are hard to query during a live incident.'
        }
      ],
      metrics: ['signup success rate', 'p95 by dependency', 'trace sampling coverage', 'log parse error rate']
    }),
    mermaid: {
      title: 'Observability signal ladder',
      caption: 'Use metrics for symptoms, traces for path, and logs for local explanation.',
      code: `flowchart TD
    Alert[Metric alert] --> Slice[Slice by region and version]
    Slice --> Trace[Inspect slow traces]
    Trace --> Span[Find hot dependency span]
    Span --> Logs[Query structured logs by trace id]
    Logs --> Cause[Root cause and rollback decision]
      `
    }
  },
  'reliability-observability-lab/failure-injection-and-incidents': {
    title: 'Failure injection and incident lab',
    summary:
      'Practice designing controlled failures, incident response, and learning loops that improve reliability without turning experiments into outages.',
    takeaways: [
      'Failure injection needs a hypothesis, blast-radius limit, and stop condition.',
      'Incident roles reduce confusion when the system is already degraded.',
      'Post-incident action items should strengthen detection, mitigation, or prevention.'
    ],
    examples: [
      {
        id: 'cache-loss',
        label: 'Cache loss',
        title: 'Test cache failure before the cache becomes a hidden dependency',
        scenario:
          'A product page relies on Redis for catalog fragments, and the team claims the database can handle fallback reads.',
        decision: 'Inject cache timeouts in one region during low traffic and watch database load, latency, and fallback correctness.',
        why: [
          'The test validates the stated fallback under controlled conditions.',
          'A small blast radius prevents a learning exercise from becoming a global outage.',
          'Stop conditions protect the database if fallback traffic is too high.'
        ],
        alternative:
          'Waiting for a real cache outage means learning about database limits during customer impact.',
        outcome:
          'The team either proves the fallback or finds the capacity gap while rollback is easy.'
      },
      {
        id: 'provider-timeout',
        label: 'Provider timeout',
        title: 'Rehearse dependency failure with circuit breakers and runbooks',
        scenario:
          'A third-party identity provider occasionally stalls, causing login threads to fill and unrelated endpoints to slow.',
        decision: 'Inject provider latency, confirm circuit breaker behavior, and run the incident playbook with named roles.',
        why: [
          'Latency injection tests the failure mode that caused previous thread exhaustion.',
          'Circuit breakers should fail fast before shared resources saturate.',
          'A rehearsal checks whether humans know who communicates, mitigates, and records decisions.'
        ],
        alternative:
          'Only unit-testing the provider client misses pool exhaustion, alert routing, and role confusion.',
        outcome:
          'The incident response becomes practiced muscle memory rather than improvised chat messages.'
      }
    ],
    decisionGuide: {
      prompt: 'What kind of reliability exercise is appropriate now?',
      options: [
        {
          id: 'game-day',
          label: 'Game day rehearsal',
          bestFor: 'Known failure modes where the team needs operational practice.',
          chooseWhen: [
            'There is a runbook or mitigation path to validate.',
            'Humans need to practice roles, escalation, and communication.',
            'The scenario can run safely in a limited environment or slice.'
          ],
          tradeOffs: [
            'It takes coordination and may interrupt normal work.',
            'The exercise is only useful if findings become action items.',
            'Overly scripted drills can miss messy real-world behavior.'
          ],
          alternativeOutcome:
            'Skipping rehearsal leaves the first real incident as the training event.'
        },
        {
          id: 'chaos-experiment',
          label: 'Production chaos experiment',
          bestFor: 'Mature systems with strong observability, rollback, and blast-radius controls.',
          chooseWhen: [
            'You have a precise hypothesis to test.',
            'SLOs, alerts, and stop conditions are already reliable.',
            'The affected scope can be limited by region, cohort, or traffic percentage.'
          ],
          tradeOffs: [
            'Poorly bounded experiments can create real customer pain.',
            'Operators must be ready to stop the test immediately.',
            'The organization needs trust and communication around planned risk.'
          ],
          alternativeOutcome:
            'Running chaos before observability and rollback are ready mostly adds danger, not learning.'
        },
        {
          id: 'tabletop',
          label: 'Tabletop incident review',
          bestFor: 'Early teams or new systems that need to find process gaps cheaply.',
          chooseWhen: [
            'The team is not ready to inject real failures.',
            'The unknowns are ownership, escalation, and decision rights.',
            'You want to improve runbooks before touching production.'
          ],
          tradeOffs: [
            'It does not prove technical fallback behavior.',
            'Participants may assume ideal signals that real incidents lack.',
            'Follow-up experiments are still needed for system validation.'
          ],
          alternativeOutcome:
            'Technical tests without role clarity still produce slow, confused incidents.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Run a safe dependency-failure game day',
      prompt:
        'A checkout service depends on inventory, payment, email, and fraud providers. The team wants to test payment-provider latency handling.',
      steps: [
        {
          title: 'Write the hypothesis',
          detail: 'State that payment latency should trigger client deadlines, fail-fast behavior, and no duplicate payment intents.',
          whatIf: 'Without a hypothesis, the exercise becomes random breakage with unclear pass or fail criteria.'
        },
        {
          title: 'Limit blast radius',
          detail: 'Run in one region, one payment method, and a tiny traffic cohort with an immediate abort switch.',
          whatIf: 'A global experiment can spend the monthly error budget before the team learns anything.'
        },
        {
          title: 'Assign incident roles',
          detail: 'Name incident commander, communications lead, scribe, and mitigation owner before injection starts.',
          whatIf: 'When roles are implicit, multiple people chase the same lead while user communication is forgotten.'
        },
        {
          title: 'Turn findings into fixes',
          detail: 'Convert gaps into owner, due date, and validation method, such as new alert, timeout change, or replay test.',
          whatIf: 'A postmortem without owned actions turns the same failure into a recurring incident.'
        }
      ],
      metrics: ['abort time', 'error-budget burn', 'duplicate intent count', 'runbook step completion', 'action item closure']
    }),
    mermaid: {
      title: 'Controlled failure exercise',
      caption: 'A safe experiment moves from hypothesis to bounded injection to owned reliability improvements.',
      code: `flowchart LR
    Hypothesis[Hypothesis] --> Guardrails[Blast radius and stop rules]
    Guardrails --> Inject[Inject failure]
    Inject --> Observe[Observe SLOs and signals]
    Observe --> Mitigate[Run incident playbook]
    Mitigate --> Learn[Post-incident actions]
      `
    }
  },
  'lld-design-patterns-lab/creational-patterns-in-practice': {
    title: 'Creational patterns in practice lab',
    summary:
      'Choose object-creation patterns when construction varies, dependencies need control, or callers should not know concrete classes.',
    takeaways: [
      'Factories centralize choice; builders make complex construction readable.',
      'Singletons are usually about shared lifecycle, not global convenience.',
      'A creational pattern is justified by variation or invariants, not by pattern vocabulary.'
    ],
    examples: [
      {
        id: 'notification-factory',
        label: 'Notification factory',
        title: 'Use a factory when channel choice changes by configuration',
        scenario:
          'A notification service must create email, push, and SMS senders based on user preferences and regional provider settings.',
        decision: 'Use a factory that returns a sender implementing a shared interface for the selected channel and provider.',
        why: [
          'Callers do not need switch statements for every provider.',
          'New channels can be added behind the same sender contract.',
          'Tests can substitute fake senders without constructing real provider clients.'
        ],
        alternative:
          'Direct constructors in every caller spread provider knowledge and make adding a channel a cross-codebase edit.',
        outcome:
          'Creation logic has one home, and business code talks to a stable sending interface.'
      },
      {
        id: 'query-builder',
        label: 'Report builder',
        title: 'Use a builder for valid combinations of optional query parts',
        scenario:
          'A reporting module builds exports with optional filters, date ranges, grouping, sorting, and redaction policies.',
        decision: 'Use a builder that validates required fields and exposes named methods for optional choices.',
        why: [
          'Construction reads like a sequence of business choices.',
          'Invalid combinations can be rejected before execution.',
          'The final immutable query object is easier to test and cache.'
        ],
        alternative:
          'A constructor with many nullable parameters is hard to read and easy to call incorrectly.',
        outcome:
          'The API makes valid report construction obvious and invalid construction difficult.'
      }
    ],
    decisionGuide: {
      prompt: 'Which creational pattern should you use?',
      options: [
        {
          id: 'factory',
          label: 'Factory',
          bestFor: 'Choosing among concrete implementations behind a common interface.',
          chooseWhen: [
            'Creation depends on configuration, runtime input, or environment.',
            'Callers should not import concrete classes.',
            'The set of implementations is expected to grow.'
          ],
          tradeOffs: [
            'A large factory can become a hidden service locator.',
            'The shared interface must be meaningful, not forced.',
            'Registration and error handling need clear ownership.'
          ],
          alternativeOutcome:
            'Direct construction is fine until implementation choice starts leaking into every caller.'
        },
        {
          id: 'builder',
          label: 'Builder',
          bestFor: 'Complex objects with optional parts and validation rules.',
          chooseWhen: [
            'Constructors would have many parameters or invalid combinations.',
            'Construction benefits from readable, step-by-step calls.',
            'The final object should be immutable or validated.'
          ],
          tradeOffs: [
            'Builders add extra types and methods.',
            'They can hide required fields if the API is too loose.',
            'Small value objects rarely need them.'
          ],
          alternativeOutcome:
            'Overloaded constructors and config maps make errors appear later in execution.'
        },
        {
          id: 'singleton',
          label: 'Singleton or managed shared instance',
          bestFor: 'Process-wide resources with explicit lifecycle constraints.',
          chooseWhen: [
            'Only one instance should own a cache, connection pool, or registry.',
            'Initialization order and cleanup are controlled.',
            'Tests can reset or inject the shared dependency safely.'
          ],
          tradeOffs: [
            'Global state can make tests flaky.',
            'Hidden dependencies make code harder to reason about.',
            'Thread safety and lifecycle must be deliberate.'
          ],
          alternativeOutcome:
            'Using singleton as a shortcut for dependency access creates tight coupling and difficult tests.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Refactor payment client creation',
      prompt:
        'A billing service supports Stripe today, adds Adyen next quarter, and needs sandbox, retry, logging, and fraud hooks for each provider.',
      steps: [
        {
          title: 'Identify construction variation',
          detail: 'List provider, region, environment, credentials, timeout policy, and observability hooks as creation inputs.',
          whatIf: 'If these choices stay scattered, every caller becomes responsible for provider correctness.'
        },
        {
          title: 'Define the interface',
          detail: 'Create a PaymentProvider contract around authorize, capture, refund, and webhook verification.',
          whatIf: 'Without a contract, the factory only hides constructors while provider-specific methods still leak out.'
        },
        {
          title: 'Build through a factory',
          detail: 'Resolve provider configuration and return a fully instrumented implementation with shared retry policy.',
          whatIf: 'Constructing clients manually makes it easy to forget timeouts or logging in one path.'
        },
        {
          title: 'Test creation rules',
          detail: 'Add tests for provider selection, sandbox wiring, missing credentials, and fake provider injection.',
          whatIf: 'Pattern code without tests can become an impressive-looking source of runtime surprises.'
        }
      ],
      metrics: ['provider selection failures', 'missing timeout count', 'test fake coverage', 'constructor call sites removed']
    }),
    mermaid: {
      title: 'Payment provider factory',
      caption: 'Callers request a stable interface while construction policy stays centralized.',
      code: `flowchart LR
    Billing[Billing service] --> Factory[Payment provider factory]
    Config[Region and env config] --> Factory
    Factory --> Stripe[Stripe provider]
    Factory --> Adyen[Adyen provider]
    Factory --> Fake[Fake provider for tests]
    Stripe --> Contract[PaymentProvider interface]
    Adyen --> Contract
    Fake --> Contract
      `
    }
  },
  'lld-design-patterns-lab/structural-patterns-in-practice': {
    title: 'Structural patterns in practice lab',
    summary:
      'Use adapters, facades, decorators, and composites to shape object relationships without leaking awkward dependencies into the core design.',
    takeaways: [
      'Adapters translate incompatible interfaces at the boundary.',
      'Facades simplify a subsystem for common callers.',
      'Decorators add behavior without multiplying subclasses.'
    ],
    examples: [
      {
        id: 'shipping-adapter',
        label: 'Shipping adapter',
        title: 'Adapt third-party carriers to an internal shipping contract',
        scenario:
          'An order system integrates UPS, FedEx, and local couriers with different label, tracking, and rate APIs.',
        decision: 'Create carrier adapters that translate each provider into a common ShipmentGateway interface.',
        why: [
          'Order fulfillment code can request labels and tracking without provider-specific payloads.',
          'Provider quirks are isolated and testable.',
          'New carriers are added by implementing the adapter contract.'
        ],
        alternative:
          'Calling carrier SDKs directly from fulfillment spreads mapping code and makes provider replacement expensive.',
        outcome:
          'External inconsistency stays at the edge while the domain remains clean.'
      },
      {
        id: 'logging-decorator',
        label: 'Repository decorator',
        title: 'Decorate a repository for caching and metrics',
        scenario:
          'A catalog repository needs cache lookup, miss logging, and latency metrics without changing the database repository implementation.',
        decision: 'Wrap the repository with decorators for cache, metrics, and tracing around the same interface.',
        why: [
          'Behavior can be composed in tests and production differently.',
          'The database repository remains focused on persistence.',
          'Cross-cutting concerns do not require subclass combinations.'
        ],
        alternative:
          'Putting caching and metrics inside every repository method tangles persistence with operational policy.',
        outcome:
          'The design keeps the interface stable while adding operational behavior around it.'
      }
    ],
    decisionGuide: {
      prompt: 'Which structural pattern fits the design pressure?',
      options: [
        {
          id: 'adapter',
          label: 'Adapter',
          bestFor: 'Integrating external or legacy interfaces with a cleaner internal contract.',
          chooseWhen: [
            'The caller should not know the provider payload shape.',
            'Several implementations need to look alike internally.',
            'Translation and error mapping are meaningful responsibilities.'
          ],
          tradeOffs: [
            'Adapters can hide provider capabilities that matter.',
            'The internal contract must not become a lowest-common-denominator mess.',
            'Mapping errors need strong tests.'
          ],
          alternativeOutcome:
            'Skipping adapters lets external APIs leak into business logic and makes later provider changes painful.'
        },
        {
          id: 'facade',
          label: 'Facade',
          bestFor: 'Offering a simple API over a complex subsystem.',
          chooseWhen: [
            'Most callers need the same high-level workflow.',
            'Subsystem ordering and error handling should be centralized.',
            'Advanced callers can still use lower-level APIs when necessary.'
          ],
          tradeOffs: [
            'A facade can become a god object.',
            'Too much hiding may limit needed control.',
            'Versioning matters when many callers adopt it.'
          ],
          alternativeOutcome:
            'Without a facade, every caller reimplements orchestration and handles partial failures differently.'
        },
        {
          id: 'decorator',
          label: 'Decorator',
          bestFor: 'Adding optional behavior around an object without changing its interface.',
          chooseWhen: [
            'Caching, logging, metrics, authorization, or retries are cross-cutting.',
            'Behavior order can be composed explicitly.',
            'Subclasses would multiply combinations.'
          ],
          tradeOffs: [
            'Decorator stacks can be hard to follow if overused.',
            'Order matters and should be tested.',
            'Debugging may require naming each wrapper clearly.'
          ],
          alternativeOutcome:
            'Subclassing for every combination creates a rigid class tree and duplicated behavior.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Clean up a document-export subsystem',
      prompt:
        'A product exports invoices to PDF, CSV, and partner-specific XML, while callers also need audit logging and access checks.',
      steps: [
        {
          title: 'Define the internal export contract',
          detail: 'Create an Exporter interface with render, metadata, and supported format behavior.',
          whatIf: 'If each controller knows file format details, export changes ripple through user-facing code.'
        },
        {
          title: 'Adapt external libraries',
          detail: 'Wrap PDF and XML libraries in adapters that translate errors and output metadata consistently.',
          whatIf: 'Library-specific exceptions and settings will leak into business logic without a boundary.'
        },
        {
          title: 'Add a facade for common flows',
          detail: 'Expose an ExportService that checks permissions, chooses the exporter, stores the artifact, and returns a download token.',
          whatIf: 'Callers will otherwise copy orchestration and forget audit or storage steps.'
        },
        {
          title: 'Decorate cross-cutting behavior',
          detail: 'Wrap exporters with audit, metrics, and cache decorators where needed.',
          whatIf: 'Baking every operational concern into exporters makes the core rendering code difficult to test.'
        }
      ],
      metrics: ['provider-specific leaks', 'export failure rate by format', 'audit coverage', 'decorator order test coverage']
    }),
    mermaid: {
      title: 'Structural pattern layering',
      caption: 'Adapters normalize libraries, a facade orchestrates the flow, and decorators add operational behavior.',
      code: `flowchart LR
    Controller --> Facade[Export facade]
    Facade --> Decorator[Audit and metrics decorator]
    Decorator --> Interface[Exporter interface]
    Interface --> Pdf[PDF adapter]
    Interface --> Csv[CSV exporter]
    Interface --> Xml[Partner XML adapter]
      `
    }
  },
  'lld-design-patterns-lab/behavioral-patterns-in-practice': {
    title: 'Behavioral patterns in practice lab',
    summary:
      'Choose strategy, observer, command, and state patterns when behavior varies, events fan out, or workflows need explicit transitions.',
    takeaways: [
      'Strategy moves algorithm choice out of conditional-heavy callers.',
      'Observer helps fan out events while preserving publisher independence.',
      'State machines make lifecycle rules visible and testable.'
    ],
    examples: [
      {
        id: 'pricing-strategy',
        label: 'Pricing strategy',
        title: 'Use strategy when pricing rules vary by market',
        scenario:
          'A delivery app calculates fees differently for dense cities, suburbs, promotions, and enterprise contracts.',
        decision: 'Define a PricingStrategy interface and select the strategy from market, customer, and experiment context.',
        why: [
          'Fee algorithms can change independently without editing one giant if statement.',
          'Each strategy can be tested with focused fixtures.',
          'Experiments can route traffic to a new strategy safely.'
        ],
        alternative:
          'A monolithic pricing method becomes fragile as every market rule competes for order and precedence.',
        outcome:
          'The design makes behavior variation explicit and keeps pricing changes localized.'
      },
      {
        id: 'order-state',
        label: 'Order state',
        title: 'Use state transitions to protect order lifecycle invariants',
        scenario:
          'Orders move through created, paid, packed, shipped, delivered, canceled, and refunded with strict transition rules.',
        decision: 'Represent allowed transitions in a state machine with commands for business actions.',
        why: [
          'Invalid transitions can be rejected consistently.',
          'Auditing commands explains who attempted each lifecycle change.',
          'Tests can cover the transition matrix directly.'
        ],
        alternative:
          'Scattered status checks let rare paths cancel shipped orders or refund unpaid orders.',
        outcome:
          'Lifecycle behavior becomes a first-class model instead of incidental boolean logic.'
      }
    ],
    decisionGuide: {
      prompt: 'Which behavioral pattern should lead?',
      options: [
        {
          id: 'strategy',
          label: 'Strategy',
          bestFor: 'Interchangeable algorithms selected by context.',
          chooseWhen: [
            'The caller should not contain many branches for algorithm variants.',
            'Each variant has meaningful independent tests.',
            'Runtime selection is part of the product behavior.'
          ],
          tradeOffs: [
            'Too many tiny strategies can scatter simple logic.',
            'Selection rules still need a clear home.',
            'Shared data contracts must stay stable.'
          ],
          alternativeOutcome:
            'Keeping every variant inline creates brittle condition order and risky edits.'
        },
        {
          id: 'observer',
          label: 'Observer',
          bestFor: 'Event fan-out where publishers should not depend on all consumers.',
          chooseWhen: [
            'Several side effects should react to one domain event.',
            'Consumers can fail or evolve independently.',
            'Delivery semantics and ordering are acceptable for the use case.'
          ],
          tradeOffs: [
            'Debugging fan-out requires good event tracing.',
            'Consumer failures may be asynchronous.',
            'Event contracts need versioning.'
          ],
          alternativeOutcome:
            'Directly calling every consumer creates tight coupling and expands the publisher failure surface.'
        },
        {
          id: 'state',
          label: 'State machine',
          bestFor: 'Workflows with explicit lifecycle transitions and invariants.',
          chooseWhen: [
            'Invalid transitions are costly or likely.',
            'Different states allow different commands.',
            'Auditing and testability matter.'
          ],
          tradeOffs: [
            'The model can feel heavy for trivial status fields.',
            'Migration from loose states requires cleanup.',
            'Concurrent transitions need locking or version checks.'
          ],
          alternativeOutcome:
            'Ad hoc status updates often fail at rare edge transitions and concurrent operations.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Model returns and refunds behavior',
      prompt:
        'An e-commerce return flow has policies by item class, user tier, shipment status, fraud risk, and payment method.',
      steps: [
        {
          title: 'Separate policy variation',
          detail: 'Use strategies for return eligibility and refund amount calculation by item and user context.',
          whatIf: 'A single policy method will grow into nested branches that are hard to test and audit.'
        },
        {
          title: 'Represent lifecycle states',
          detail: 'Model requested, approved, label issued, received, refunded, rejected, and expired as explicit states.',
          whatIf: 'Loose status strings allow impossible paths such as refunding before receipt when policy forbids it.'
        },
        {
          title: 'Emit domain events',
          detail: 'Publish return-approved and refund-issued events for email, inventory, accounting, and analytics consumers.',
          whatIf: 'Calling every side effect inline makes the return service fragile and vendor-aware.'
        },
        {
          title: 'Command the mutations',
          detail: 'Use commands such as ApproveReturn and IssueRefund to validate actor, state, policy, and idempotency.',
          whatIf: 'Direct field mutation bypasses business rules and weakens audit trails.'
        }
      ],
      metrics: ['invalid transition attempts', 'policy test coverage', 'event delivery lag', 'refund duplicate prevention']
    }),
    mermaid: {
      title: 'Behavioral patterns in an order workflow',
      caption: 'Strategies choose policies, commands mutate state, and observers react to events.',
      code: `flowchart LR
    Command[Return command] --> State[Return state machine]
    Policy[Policy strategy] --> State
    State --> Event[Domain event]
    Event --> Email[Email observer]
    Event --> Inventory[Inventory observer]
    Event --> Accounting[Accounting observer]
      `
    }
  },
  'lld-project-labs/parking-lot-design-lab': {
    title: 'Parking lot design lab',
    summary:
      'Design a parking lot domain model with vehicle fit rules, ticket lifecycle, payment flow, and extensibility for multiple lots.',
    takeaways: [
      'Start with entities and invariants before classes and methods.',
      'Spot allocation is a policy that should be replaceable.',
      'Ticket and payment state need clear lifecycle transitions.'
    ],
    examples: [
      {
        id: 'spot-allocation',
        label: 'Spot allocation',
        title: 'Model allocation as a policy, not a pile of loops',
        scenario:
          'A lot has compact, regular, large, EV, and accessible spots across floors, and motorcycles can fit in more spots than trucks.',
        decision: 'Create an allocation policy that receives vehicle type, constraints, and spot availability indexes.',
        why: [
          'Vehicle fit rules are isolated from ticket creation.',
          'Nearest-entrance or EV-priority policies can replace first-fit later.',
          'Availability indexes prevent scanning every spot for every entry.'
        ],
        alternative:
          'Embedding spot search in the gate controller makes the controller hard to test and impossible to reuse across lots.',
        outcome:
          'The design can change allocation behavior without rewriting ticket or payment flows.'
      },
      {
        id: 'ticket-payment',
        label: 'Ticket payment',
        title: 'Keep ticket state and payment state coordinated',
        scenario:
          'Drivers may pay at a kiosk, by mobile app, or at exit; payment providers can timeout after the ticket is priced.',
        decision: 'Use ticket states and payment attempts with idempotent confirmation before opening the gate.',
        why: [
          'The gate should not open for unpaid or expired tickets.',
          'Payment retries should not create duplicate charges.',
          'Audit records help resolve disputes about entry, exit, and fees.'
        ],
        alternative:
          'A boolean paid flag cannot represent pending, failed, refunded, or expired payment attempts clearly.',
        outcome:
          'The lot can support multiple payment channels while protecting the exit invariant.'
      }
    ],
    decisionGuide: {
      prompt: 'What is the core design boundary?',
      options: [
        {
          id: 'domain-model',
          label: 'Domain model first',
          bestFor: 'Machine-coding interviews that evaluate class design and invariants.',
          chooseWhen: [
            'You need to explain entities such as Lot, Floor, Spot, Ticket, Vehicle, and Payment.',
            'State transitions and fit rules are central to correctness.',
            'You can keep UI and persistence secondary.'
          ],
          tradeOffs: [
            'The answer may not cover distributed concerns deeply.',
            'Over-modeling tiny details can waste time.',
            'Persistence mapping still needs a later pass.'
          ],
          alternativeOutcome:
            'Starting from tables or screens often misses the object behavior the interview is testing.'
        },
        {
          id: 'service-flow',
          label: 'Service flow first',
          bestFor: 'System-oriented prompts with gates, kiosks, sensors, and payment services.',
          chooseWhen: [
            'Concurrency, hardware integration, or multi-lot operation is emphasized.',
            'The interviewer asks about APIs and failure handling.',
            'The class model can be derived after the workflow.'
          ],
          tradeOffs: [
            'The domain model may become anemic if behavior is only in services.',
            'Hardware failure paths add complexity.',
            'You still need clear entities for maintainability.'
          ],
          alternativeOutcome:
            'Pure class diagrams may ignore real-world entry, exit, and payment failures.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design entry-to-exit behavior for a smart lot',
      prompt:
        'A garage has two entrances, three exits, mixed spot types, license plate recognition, kiosks, and mobile payment.',
      steps: [
        {
          title: 'Define entities and invariants',
          detail: 'Model vehicles, spots, floors, tickets, gates, payment attempts, and the invariant that one active ticket owns one occupied spot.',
          whatIf: 'Without this invariant, concurrent entrances can assign the same spot or lose occupancy.'
        },
        {
          title: 'Choose allocation strategy',
          detail: 'Pick a nearest-valid-spot policy backed by availability indexes per floor and spot type.',
          whatIf: 'Scanning all spots works in a toy example but fails once floors and preferences are added.'
        },
        {
          title: 'Handle ticket lifecycle',
          detail: 'Move tickets through issued, parked, priced, paid, exited, expired, and disputed with explicit transitions.',
          whatIf: 'A few booleans cannot represent payment retries, lost tickets, or exit grace periods safely.'
        },
        {
          title: 'Protect hardware flows',
          detail: 'Make gate commands idempotent, log sensor disagreement, and allow manual override with audit.',
          whatIf: 'Treating hardware as always reliable leaves no answer for stuck gates or failed plate reads.'
        }
      ],
      metrics: ['spot double-assignment count', 'gate open failures', 'payment retry success', 'occupancy accuracy']
    }),
    mermaid: {
      title: 'Parking lot domain flow',
      caption: 'Entry allocates a spot and ticket; exit verifies payment before releasing occupancy.',
      code: `flowchart LR
    Vehicle --> EntryGate[Entry gate]
    EntryGate --> Allocator[Spot allocation policy]
    Allocator --> Spot[Assigned spot]
    Allocator --> Ticket[Active ticket]
    Ticket --> Payment[Payment attempt]
    Payment --> ExitGate[Exit gate]
    ExitGate --> Release[Release spot]
      `
    }
  },
  'lld-project-labs/elevator-system-design-lab': {
    title: 'Elevator system design lab',
    summary:
      'Model elevator cars, requests, dispatch policies, state transitions, and safety constraints for a multi-elevator building.',
    takeaways: [
      'Separate request assignment from car movement.',
      'Elevator state must include direction, load, door state, and service mode.',
      'Safety rules outrank optimization policies.'
    ],
    examples: [
      {
        id: 'dispatch-policy',
        label: 'Dispatch policy',
        title: 'Dispatch requests with a policy that can evolve',
        scenario:
          'A building has six elevators, lobby rush in the morning, down-peak traffic at night, and VIP floors requiring access control.',
        decision: 'Use a dispatcher that scores candidate cars by direction, distance, load, stops, and access constraints.',
        why: [
          'Assignment can change without rewriting car movement logic.',
          'The scoring function can be tuned for peak traffic modes.',
          'Access restrictions are checked before a request is assigned.'
        ],
        alternative:
          'Sending every request to the nearest car ignores direction and can increase total wait time.',
        outcome:
          'The system has a clear place to optimize traffic behavior while cars enforce local safety.'
      },
      {
        id: 'door-safety',
        label: 'Door safety',
        title: 'Model doors and sensors as first-class state',
        scenario:
          'A car receives a close-door command while the obstruction sensor is active and an emergency stop is triggered.',
        decision: 'Represent door state, sensor state, and emergency mode in the car state machine.',
        why: [
          'Movement commands can be rejected when doors are not safely closed.',
          'Emergency mode can override normal dispatch.',
          'Safety behavior becomes testable instead of buried in device code.'
        ],
        alternative:
          'A simple floor and direction model cannot explain what happens during door faults or emergency stops.',
        outcome:
          'The design prioritizes safety and correctness before scheduling efficiency.'
      }
    ],
    decisionGuide: {
      prompt: 'What should own elevator request assignment?',
      options: [
        {
          id: 'central-dispatcher',
          label: 'Central dispatcher',
          bestFor: 'Buildings where global optimization and access policy matter.',
          chooseWhen: [
            'Multiple cars can serve the same hall request.',
            'The system needs peak traffic modes or floor access rules.',
            'Operators want one place to tune wait-time behavior.'
          ],
          tradeOffs: [
            'The dispatcher can become complex.',
            'It needs timely state from every car.',
            'Failure handling requires fallback mode.'
          ],
          alternativeOutcome:
            'Pure local car decisions may be simpler but can produce poor group behavior.'
        },
        {
          id: 'local-car-control',
          label: 'Local car controller',
          bestFor: 'Movement, doors, safety sensors, and car-specific state transitions.',
          chooseWhen: [
            'The decision depends on immediate device state.',
            'Safety rules must override scheduling.',
            'Commands need validation before motor movement.'
          ],
          tradeOffs: [
            'Local controllers need coordination to avoid duplicate assignments.',
            'Optimization is limited without global context.',
            'State synchronization must be robust.'
          ],
          alternativeOutcome:
            'A central scheduler that micromanages doors and motors mixes optimization with safety-critical control.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design a six-car office elevator bank',
      prompt:
        'An office tower has basement parking, security-controlled floors, morning lobby peaks, and occasional elevator maintenance.',
      steps: [
        {
          title: 'Model requests and permissions',
          detail: 'Represent hall calls, car calls, destination requests, and floor access constraints separately.',
          whatIf: 'If all requests are just floor numbers, access control and destination dispatch become bolted-on checks.'
        },
        {
          title: 'Track car state',
          detail: 'Keep current floor, direction, load, door state, assigned stops, service mode, and fault state for each car.',
          whatIf: 'A car with only floor and direction cannot reject unsafe movement or maintenance assignments.'
        },
        {
          title: 'Score assignments',
          detail: 'Dispatch by ETA, direction compatibility, load, number of stops, and peak-mode policy.',
          whatIf: 'Nearest-car dispatch can send a full downward car to an upward request just because it is physically close.'
        },
        {
          title: 'Handle faults and maintenance',
          detail: 'Remove faulty cars from assignment, drain their stops safely, and notify operators with reason codes.',
          whatIf: 'Ignoring service mode lets the dispatcher assign passengers to cars that should be offline.'
        }
      ],
      metrics: ['average wait time', 'p95 wait time', 'assignment rejection count', 'fault recovery time']
    }),
    mermaid: {
      title: 'Elevator dispatch and car control',
      caption: 'A dispatcher assigns requests while each car controller enforces movement and safety state.',
      code: `flowchart LR
    HallCall[Hall call] --> Dispatcher
    CarState[Car state updates] --> Dispatcher
    Dispatcher --> Assignment[Assigned car]
    Assignment --> Controller[Car controller]
    Controller --> Motor[Motor commands]
    Controller --> Door[Door commands]
    Sensors[Sensors] --> Controller
      `
    }
  },
  'lld-project-labs/library-or-booking-system-lab': {
    title: 'Library and booking system design lab',
    summary:
      'Design reservation, checkout, hold, and availability behavior for shared resources where time, copies, and conflicts matter.',
    takeaways: [
      'Inventory identity and availability windows are different concepts.',
      'Reservations need expiration and conflict rules.',
      'Borrowing or booking state should be auditable and recoverable.'
    ],
    examples: [
      {
        id: 'library-holds',
        label: 'Library holds',
        title: 'Separate title demand from copy-level checkout',
        scenario:
          'A library has five copies of one book, a hold queue, due dates, renewals, and users who may be suspended.',
        decision: 'Model BookTitle, BookCopy, HoldRequest, Loan, and PatronPolicy as separate entities.',
        why: [
          'A hold targets the title while a loan targets a physical copy.',
          'Patron policy can enforce suspension, renewal limits, and fines.',
          'Copy-level state handles lost, damaged, in-transit, and checked-out items.'
        ],
        alternative:
          'A single Book object cannot represent multiple copies or fair hold ordering cleanly.',
        outcome:
          'The design supports real library workflows without confusing catalog metadata with inventory.'
      },
      {
        id: 'room-booking',
        label: 'Room booking',
        title: 'Protect time-slot reservations with conflict checks',
        scenario:
          'A meeting-room system allows recurring bookings, cancellations, capacity filters, and admin overrides.',
        decision: 'Model resources, availability windows, reservations, recurrence rules, and conflict detection explicitly.',
        why: [
          'Conflict checks are core domain behavior, not a UI detail.',
          'Recurring reservations need expansion and exception handling.',
          'Admin overrides should leave an audit trail.'
        ],
        alternative:
          'Storing calendar events without resource constraints allows double bookings and ambiguous overrides.',
        outcome:
          'Availability can be queried and mutated consistently across one-time and recurring bookings.'
      }
    ],
    decisionGuide: {
      prompt: 'Which model best fits the prompt?',
      options: [
        {
          id: 'copy-loan',
          label: 'Copy and loan model',
          bestFor: 'Libraries and rental systems with physical inventory.',
          chooseWhen: [
            'Multiple copies share catalog metadata.',
            'Items can be damaged, lost, transferred, or checked out.',
            'Borrowing policies depend on user and item type.'
          ],
          tradeOffs: [
            'More entities than a simple catalog.',
            'Hold queues and copy assignment need clear rules.',
            'Physical operations introduce exception states.'
          ],
          alternativeOutcome:
            'A title-only model breaks as soon as copy availability differs.'
        },
        {
          id: 'resource-calendar',
          label: 'Resource calendar model',
          bestFor: 'Rooms, equipment, appointments, and time-window bookings.',
          chooseWhen: [
            'The same resource can be reserved over time.',
            'Conflict detection and cancellation rules are central.',
            'Recurring reservations or availability windows matter.'
          ],
          tradeOffs: [
            'Time-zone and recurrence logic can get complex.',
            'Concurrent booking attempts need locking or optimistic checks.',
            'Search indexes may be needed for availability queries.'
          ],
          alternativeOutcome:
            'Treating bookings as plain events misses resource constraints and double-booking protection.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Build a combined library reservation flow',
      prompt:
        'A library wants patrons to search titles, place holds, borrow available copies, renew loans, and receive notifications when a hold is ready.',
      steps: [
        {
          title: 'Separate catalog from inventory',
          detail: 'Use BookTitle for metadata and BookCopy for barcode, branch, status, and condition.',
          whatIf: 'If metadata and copies are merged, one damaged copy can make the whole title look unavailable.'
        },
        {
          title: 'Model hold queue rules',
          detail: 'Store hold requests by title with priority, expiration, pickup branch, and patron eligibility checks.',
          whatIf: 'Without queue rules, available copies may be assigned unfairly or held forever.'
        },
        {
          title: 'Track loan lifecycle',
          detail: 'Move loans through checked-out, renewed, overdue, returned, lost, and disputed states.',
          whatIf: 'A due date alone cannot explain renewal limits, overdue fines, or lost-item workflows.'
        },
        {
          title: 'Handle concurrency',
          detail: 'Use a transaction or version check when assigning a copy to a hold or checkout.',
          whatIf: 'Two desks can otherwise check out the same copy under peak traffic.'
        }
      ],
      metrics: ['double assignment attempts', 'hold expiration rate', 'overdue rate', 'copy status mismatch count']
    }),
    mermaid: {
      title: 'Library reservation model',
      caption: 'Catalog titles feed hold queues, while physical copies move through loan states.',
      code: `flowchart LR
    Patron --> Hold[Hold request]
    Hold --> Title[Book title]
    Title --> Copy[Book copy]
    Copy --> Loan[Loan]
    Loan --> Return[Return or renew]
    Hold --> Notification[Ready notification]
      `
    }
  },
  'dsa-concepts-lab/complexity-and-algorithmic-thinking': {
    title: 'Complexity and algorithmic thinking lab',
    summary:
      'Practice estimating time, space, bottlenecks, and algorithmic shape before writing code, then choose improvements that match input constraints.',
    takeaways: [
      'Big-O describes growth, but constants and data shape still matter.',
      'The right algorithm usually comes from constraints and operations.',
      'Space complexity includes auxiliary structures, recursion, and output rules.'
    ],
    examples: [
      {
        id: 'nested-loop',
        label: 'Pair search',
        title: 'Replace repeated scans when constraints make quadratic work too large',
        scenario:
          'You need to find whether any two numbers sum to a target in an array with up to 200,000 elements.',
        decision: 'Use a hash set to track complements in one pass.',
        why: [
          'The nested loop performs about 20 billion comparisons at the upper bound.',
          'A hash set trades O(n) extra space for expected O(n) time.',
          'The algorithm matches the operation: membership lookup by value.'
        ],
        alternative:
          'Sorting plus two pointers uses less auxiliary space but changes order and costs O(n log n).',
        outcome:
          'Constraint reading turns a brute-force idea into a defensible time-space trade-off.'
      },
      {
        id: 'recursive-tree',
        label: 'Tree recursion',
        title: 'Count recursion stack space in depth-dependent algorithms',
        scenario:
          'A DFS over a binary tree visits every node and stores only a running maximum path value.',
        decision: 'Report O(n) time and O(h) stack space, where h is tree height.',
        why: [
          'Every node is processed once.',
          'The call stack holds one root-to-leaf path at a time.',
          'A skewed tree makes h equal n, while a balanced tree makes h about log n.'
        ],
        alternative:
          'Saying O(1) space ignores stack frames; saying always O(log n) assumes balance the prompt may not guarantee.',
        outcome:
          'The complexity answer becomes precise enough to handle edge cases.'
      }
    ],
    decisionGuide: {
      prompt: 'How should you improve the first solution?',
      options: [
        {
          id: 'hashing',
          label: 'Hashing for membership',
          bestFor: 'Problems with lookup, duplicates, grouping, or complement checks.',
          chooseWhen: [
            'You repeatedly ask whether a value or key has appeared.',
            'Expected O(1) lookup changes the dominant cost.',
            'Extra memory is acceptable.'
          ],
          tradeOffs: [
            'Hash collisions and memory use are hidden constants.',
            'Ordering information may be lost.',
            'Mutable keys or poor hashing can break assumptions.'
          ],
          alternativeOutcome:
            'Keeping repeated scans is often the reason a correct solution times out.'
        },
        {
          id: 'sorting',
          label: 'Sorting to expose order',
          bestFor: 'Problems involving intervals, nearest values, ordering, or two pointers.',
          chooseWhen: [
            'Ordering simplifies many comparisons.',
            'O(n log n) is acceptable for the constraints.',
            'The problem does not require original order or you can preserve indices.'
          ],
          tradeOffs: [
            'Sorting may mutate input or require copies.',
            'It can be slower than linear hashing for pure lookup.',
            'Stable ordering and ties need care.'
          ],
          alternativeOutcome:
            'Without sorting, interval and proximity problems often need more complex data structures.'
        },
        {
          id: 'dynamic-programming',
          label: 'Memoization or dynamic programming',
          bestFor: 'Overlapping subproblems with optimal substructure.',
          chooseWhen: [
            'The same state is recomputed many times.',
            'A compact state definition captures all needed history.',
            'Transition cost and state count fit the constraints.'
          ],
          tradeOffs: [
            'State design is easy to overcomplicate.',
            'Memory can exceed time savings if dimensions explode.',
            'Bottom-up order must respect dependencies.'
          ],
          alternativeOutcome:
            'Pure recursion can be elegant but exponential when it revisits the same states.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Analyze a slow leaderboard query algorithm',
      prompt:
        'Given scores for up to one million events, return the top K users by total score after applying filters and deduplication.',
      steps: [
        {
          title: 'Name input sizes',
          detail: 'Define n events, u users, k requested results, and f filter cost so the analysis has variables.',
          whatIf: 'Without variables, complexity claims become vague and impossible to compare.'
        },
        {
          title: 'Find the repeated operation',
          detail: 'Group scores by user in a hash map so repeated user updates avoid scans.',
          whatIf: 'Searching the leaderboard list for every event creates O(nu) behavior.'
        },
        {
          title: 'Choose top-K extraction',
          detail: 'Use a min-heap of size K if K is much smaller than users, or sort totals if full ordering is needed.',
          whatIf: 'Sorting every user is simpler but may waste work when K is tiny.'
        },
        {
          title: 'Account for memory',
          detail: 'Report O(u) aggregation space plus O(k) heap space, and discuss streaming if u is too large.',
          whatIf: 'Ignoring memory can produce an algorithm that is fast enough but impossible to run.'
        }
      ],
      metrics: ['event count n', 'unique users u', 'heap size k', 'aggregation memory', 'dominant operation count']
    }),
    mermaid: {
      title: 'Algorithm design loop',
      caption: 'Constraints identify operations, operations suggest data structures, and complexity validates the choice.',
      code: `flowchart LR
    Constraints --> Operations[Repeated operations]
    Operations --> Structure[Data structure choice]
    Structure --> Algorithm
    Algorithm --> Complexity[Time and space analysis]
    Complexity --> Constraints
      `
    }
  },
  'dsa-concepts-lab/hash-tables-and-memory-layout': {
    title: 'Hash tables and memory layout lab',
    summary:
      'Explore how hashing, collisions, resizing, cache locality, and memory overhead shape real performance beyond simple O(1) claims.',
    takeaways: [
      'Hash table performance depends on hash quality, load factor, and collision strategy.',
      'Arrays often win on locality even when asymptotic complexity looks similar.',
      'Memory overhead can dominate when keys and buckets outnumber useful values.'
    ],
    examples: [
      {
        id: 'frequency-map',
        label: 'Frequency map',
        title: 'Use hash maps when key space is sparse or unknown',
        scenario:
          'A log processor counts events by arbitrary user id across millions of records.',
        decision: 'Use a hash map keyed by user id with capacity planning or streaming aggregation.',
        why: [
          'User ids are not dense enough for direct array indexing.',
          'Expected O(1) updates fit repeated counting.',
          'Capacity planning reduces resize overhead during large imports.'
        ],
        alternative:
          'Sorting events by user id can reduce memory but adds O(n log n) time and requires batch availability.',
        outcome:
          'The design is fast for online updates and honest about memory growth.'
      },
      {
        id: 'dense-counts',
        label: 'Dense counts',
        title: 'Prefer arrays when keys are small dense integers',
        scenario:
          'A histogram counts byte values from a large binary file, where keys are integers from 0 to 255.',
        decision: 'Use a fixed-size array of 256 counters.',
        why: [
          'Direct indexing gives predictable O(1) without hashing.',
          'The array is compact and cache-friendly.',
          'There is no collision or resize behavior to manage.'
        ],
        alternative:
          'A hash map works functionally but wastes memory and CPU on hashing tiny dense keys.',
        outcome:
          'Choosing memory layout from key shape produces a simpler and faster solution.'
      }
    ],
    decisionGuide: {
      prompt: 'Which storage layout should you choose?',
      options: [
        {
          id: 'hash-map',
          label: 'Hash map',
          bestFor: 'Sparse, dynamic, or non-integer keys with frequent lookup and update.',
          chooseWhen: [
            'The key range is huge or unknown.',
            'Ordering is not needed for the main operation.',
            'Expected constant-time lookup is worth memory overhead.'
          ],
          tradeOffs: [
            'Worst-case collisions can degrade performance.',
            'Buckets, entries, and pointers add memory overhead.',
            'Iteration order may be unstable.'
          ],
          alternativeOutcome:
            'For dense integer keys, a hash map can be slower and larger than an array.'
        },
        {
          id: 'array',
          label: 'Array or typed array',
          bestFor: 'Dense integer indexes, fixed ranges, and cache-friendly scans.',
          chooseWhen: [
            'The key range is small and known.',
            'Sequential access or direct indexing dominates.',
            'Memory can be allocated predictably.'
          ],
          tradeOffs: [
            'Sparse ranges waste memory.',
            'Insertion in the middle may be expensive.',
            'Resizing large arrays can copy data.'
          ],
          alternativeOutcome:
            'For arbitrary strings or sparse ids, arrays require awkward mapping and wasted space.'
        },
        {
          id: 'ordered-map',
          label: 'Tree or ordered map',
          bestFor: 'Lookups that also need ordering, ranges, predecessor, or successor.',
          chooseWhen: [
            'You need sorted iteration or range queries.',
            'O(log n) operations are acceptable.',
            'Hash order would lose necessary structure.'
          ],
          tradeOffs: [
            'Operations are slower than expected O(1) hashing.',
            'Pointer-heavy nodes hurt cache locality.',
            'Balancing logic is more complex.'
          ],
          alternativeOutcome:
            'A hash map plus sorting later may be better if ordering is rare.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Design a duplicate detector for a streaming import',
      prompt:
        'An import pipeline receives 50 million records with external ids, event timestamps, and occasional duplicate payloads.',
      steps: [
        {
          title: 'Classify key shape',
          detail: 'External ids are arbitrary strings, so use hashing rather than array indexing.',
          whatIf: 'Trying to map arbitrary ids into arrays creates a second lookup problem without reducing complexity.'
        },
        {
          title: 'Plan memory growth',
          detail: 'Estimate entry overhead and consider chunking, Bloom filters, or disk spill if unique ids exceed memory.',
          whatIf: 'O(n) space may still be unacceptable when n is tens of millions.'
        },
        {
          title: 'Handle collisions and equality',
          detail: 'Store the original id or fingerprint with collision checks so distinct ids are not merged incorrectly.',
          whatIf: 'Assuming hashes are unique can turn a performance optimization into data corruption.'
        },
        {
          title: 'Choose eviction or windowing',
          detail: 'If duplicates only matter within 24 hours, evict by time window to bound memory.',
          whatIf: 'Keeping every id forever makes memory grow with historical volume rather than active risk.'
        }
      ],
      metrics: ['load factor', 'unique id count', 'bytes per entry', 'collision count', 'eviction rate']
    }),
    mermaid: {
      title: 'Hash table performance factors',
      caption: 'Key shape and load factor determine whether hashing is the right memory layout.',
      code: `flowchart LR
    Keys[Key shape] --> Hash[Hash function]
    Hash --> Buckets[Buckets]
    Buckets --> Collisions[Collision handling]
    Buckets --> Load[Load factor]
    Load --> Resize[Resize policy]
    Collisions --> Lookup[Lookup cost]
    Resize --> Memory[Memory overhead]
      `
    }
  },
  'dsa-concepts-lab/trees-graphs-mental-models': {
    title: 'Trees and graphs mental models lab',
    summary:
      'Practice recognizing hierarchical, network, and dependency structures, then choose traversal and representation strategies that fit the problem.',
    takeaways: [
      'Trees are connected acyclic graphs with a chosen root; general graphs need visited tracking.',
      'Adjacency lists, matrices, and implicit neighbors each fit different constraints.',
      'Traversal order should match the question: reachability, shortest unweighted path, ordering, or components.'
    ],
    examples: [
      {
        id: 'org-tree',
        label: 'Org tree',
        title: 'Use tree DFS when each node has one parent and hierarchy matters',
        scenario:
          'A company hierarchy asks for total headcount and salary budget under each manager.',
        decision: 'Represent employees as a rooted tree and compute aggregate values with post-order DFS.',
        why: [
          'Each employee reports to one manager, so cycles are not part of the domain.',
          'Children must be processed before parent totals are finalized.',
          'The recursion stack follows the management chain depth.'
        ],
        alternative:
          'Using a generic graph algorithm works but adds unnecessary cycle handling unless matrix reporting is allowed.',
        outcome:
          'The model stays simple because the domain guarantees a tree.'
      },
      {
        id: 'course-prereq',
        label: 'Course prerequisites',
        title: 'Use directed graph reasoning for dependency order',
        scenario:
          'A university planner must detect prerequisite cycles and return an order to take courses.',
        decision: 'Build a directed adjacency list and use topological sorting with indegree or DFS coloring.',
        why: [
          'Prerequisites form directed edges from requirement to dependent course.',
          'Cycles mean no valid completion order exists.',
          'Topological order directly answers the scheduling question.'
        ],
        alternative:
          'Plain BFS from one course misses disconnected components and cannot detect all cycles by itself.',
        outcome:
          'The graph representation matches dependency semantics and produces an actionable order.'
      }
    ],
    decisionGuide: {
      prompt: 'Which traversal model matches the question?',
      options: [
        {
          id: 'dfs',
          label: 'DFS',
          bestFor: 'Exhaustive exploration, components, cycle detection, backtracking, and tree aggregation.',
          chooseWhen: [
            'You need to go deep before combining results.',
            'Recursive structure or post-order computation is natural.',
            'The graph size fits recursion or you can use an explicit stack.'
          ],
          tradeOffs: [
            'Recursive DFS can overflow on deep graphs.',
            'It does not guarantee shortest path in unweighted graphs.',
            'Visited-state handling must distinguish path from global state for cycle checks.'
          ],
          alternativeOutcome:
            'Using BFS for post-order tree aggregation forces extra bookkeeping.'
        },
        {
          id: 'bfs',
          label: 'BFS',
          bestFor: 'Shortest path in unweighted graphs, level order, and minimum number of steps.',
          chooseWhen: [
            'Each edge has equal cost.',
            'The answer depends on distance by layers.',
            'You can afford a queue holding the frontier.'
          ],
          tradeOffs: [
            'Memory can be high for wide graphs.',
            'Weighted paths need Dijkstra or another algorithm.',
            'BFS explores broadly even when one deep path is enough.'
          ],
          alternativeOutcome:
            'DFS may find a path but not the shortest path in edge count.'
        },
        {
          id: 'topological',
          label: 'Topological sort',
          bestFor: 'Directed acyclic dependency ordering.',
          chooseWhen: [
            'Tasks depend on earlier tasks.',
            'You need a valid order or proof that none exists.',
            'Cycle detection is part of correctness.'
          ],
          tradeOffs: [
            'Only applies to directed acyclic graphs for a complete order.',
            'Multiple valid orders may exist.',
            'Edge direction must be chosen consistently.'
          ],
          alternativeOutcome:
            'Treating dependencies as undirected loses prerequisite meaning.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Choose graph tools for a package installer',
      prompt:
        'A package manager installs packages with dependencies, optional plugins, version conflicts, and disconnected dependency groups.',
      steps: [
        {
          title: 'Define nodes and edge direction',
          detail: 'Use packages as nodes and edges from dependency to dependent so topological order installs prerequisites first.',
          whatIf: 'Reversing edges accidentally can produce an order that tries to install dependents before requirements.'
        },
        {
          title: 'Detect cycles',
          detail: 'Use DFS colors or indegree processing count to detect dependency cycles before installation.',
          whatIf: 'Without cycle detection, the installer may loop or fail late with a confusing missing dependency.'
        },
        {
          title: 'Handle disconnected components',
          detail: 'Run the algorithm across all packages, not only from the first requested node, when shared dependencies are discovered.',
          whatIf: 'Starting from one node can miss independent required packages in batch install mode.'
        },
        {
          title: 'Layer extra constraints',
          detail: 'Apply version conflict resolution before final ordering, because incompatible nodes cannot both appear in the DAG.',
          whatIf: 'Topological sorting an invalid graph gives a neat order for a set of packages that cannot coexist.'
        }
      ],
      metrics: ['node count', 'edge count', 'cycle count', 'max frontier size', 'conflict resolution failures']
    }),
    mermaid: {
      title: 'Graph recognition path',
      caption: 'Identify structure, choose representation, then select traversal by the question being asked.',
      code: `flowchart LR
    Problem --> Structure[Tree, DAG, or graph]
    Structure --> Representation[Adjacency list, matrix, or implicit]
    Representation --> Traversal[DFS, BFS, topological sort]
    Traversal --> Answer[Reachability, distance, order, or aggregate]
      `
    }
  },
  'dsa-algorithms-lab/sorting-and-divide-and-conquer': {
    title: 'Sorting and divide-and-conquer lab',
    summary:
      'Use ordering, partitioning, and recursive decomposition to simplify problems that are hard to solve in raw input order.',
    takeaways: [
      'Sorting often converts pairwise comparison into local neighbor checks.',
      'Divide-and-conquer works when subproblems can be solved and combined efficiently.',
      'Stability, in-place behavior, and worst-case guarantees matter in real choices.'
    ],
    examples: [
      {
        id: 'merge-intervals',
        label: 'Merge intervals',
        title: 'Sort by start time to make overlap local',
        scenario:
          'Given thousands of meeting intervals, return the minimal set of non-overlapping busy windows.',
        decision: 'Sort intervals by start time, then scan once and merge with the current window.',
        why: [
          'After sorting, any overlap with the current merged interval must appear next.',
          'The scan is linear after the O(n log n) sort.',
          'The algorithm is easy to prove with a maintained current interval invariant.'
        ],
        alternative:
          'Comparing every interval with every other interval is O(n^2) and hard to update correctly.',
        outcome:
          'Ordering transforms a global overlap problem into a local scan.'
      },
      {
        id: 'quickselect',
        label: 'Kth largest',
        title: 'Partition instead of fully sorting when only rank matters',
        scenario:
          'A service needs the kth largest score from a large unsorted list but does not need the full sorted order.',
        decision: 'Use quickselect or a heap depending on mutation allowance and worst-case concerns.',
        why: [
          'Quickselect can find a rank in expected linear time.',
          'A heap of size K is useful for streaming or when input should not be partitioned.',
          'Full sorting does more work than the output requires.'
        ],
        alternative:
          'Sorting all values is simpler but costs O(n log n) even when one ranked value is needed.',
        outcome:
          'The algorithm matches the exact output requirement instead of oversolving.'
      }
    ],
    decisionGuide: {
      prompt: 'Which ordering technique should you apply?',
      options: [
        {
          id: 'full-sort',
          label: 'Full sort plus scan',
          bestFor: 'Problems where global order enables a simple linear pass.',
          chooseWhen: [
            'You need sorted output or order makes conflicts local.',
            'O(n log n) fits the constraints.',
            'The comparator is clear and stable tie handling is defined.'
          ],
          tradeOffs: [
            'Sorting may do more work than necessary for top-K or membership problems.',
            'It can mutate input unless copied.',
            'Comparator mistakes create subtle bugs.'
          ],
          alternativeOutcome:
            'Avoiding sort can leave you with complicated O(n^2) logic.'
        },
        {
          id: 'divide-conquer',
          label: 'Divide and conquer',
          bestFor: 'Problems that split into independent halves with efficient merge.',
          chooseWhen: [
            'Subproblem answers combine without revisiting all pairs.',
            'Recursion depth and extra memory are acceptable.',
            'The combine step is the key insight.'
          ],
          tradeOffs: [
            'Poor split or expensive combine removes the benefit.',
            'Recursive implementations need base cases and memory awareness.',
            'Debugging can be harder than an iterative scan.'
          ],
          alternativeOutcome:
            'A brute-force global comparison may be easier to start but fails larger constraints.'
        },
        {
          id: 'selection',
          label: 'Selection or heap',
          bestFor: 'Kth, top-K, and partial-order outputs.',
          chooseWhen: [
            'Only a rank or small subset is needed.',
            'Input can be partitioned or streamed.',
            'Full sorted order is unnecessary.'
          ],
          tradeOffs: [
            'Quickselect has bad worst-case without safeguards.',
            'Heap solutions add O(k) memory.',
            'Tie handling and ordering of top-K output may require extra work.'
          ],
          alternativeOutcome:
            'Full sorting is robust but may exceed time limits when K is small.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Optimize a calendar availability engine',
      prompt:
        'Given busy intervals from many calendars, find merged busy time and available gaps for a requested day.',
      steps: [
        {
          title: 'Normalize intervals',
          detail: 'Convert all calendar events into comparable half-open intervals in one time zone.',
          whatIf: 'Sorting inconsistent time representations creates wrong overlap results before the algorithm starts.'
        },
        {
          title: 'Sort by start time',
          detail: 'Order intervals so overlap checks only compare with the current merged interval.',
          whatIf: 'Without sorting, each new event may need comparison with every existing merged window.'
        },
        {
          title: 'Scan and merge',
          detail: 'Maintain the current busy window and emit it when the next interval starts after it ends.',
          whatIf: 'Forgetting the invariant leads to duplicated or fragmented busy blocks.'
        },
        {
          title: 'Compute gaps',
          detail: 'Compare merged busy windows against working hours to produce available slots.',
          whatIf: 'Returning merged busy time alone does not answer the user-facing scheduling question.'
        }
      ],
      metrics: ['interval count', 'sort cost', 'merge scan time', 'timezone normalization failures']
    }),
    mermaid: {
      title: 'Sort then scan pattern',
      caption: 'Ordering turns scattered intervals into a single pass with a simple invariant.',
      code: `flowchart LR
    Raw[Raw intervals] --> Normalize
    Normalize --> Sort[Sort by start]
    Sort --> Scan[Linear merge scan]
    Scan --> Busy[Merged busy windows]
    Busy --> Gaps[Available gaps]
      `
    }
  },
  'dsa-algorithms-lab/shortest-paths-and-union-find': {
    title: 'Shortest paths and union-find lab',
    summary:
      'Choose BFS, Dijkstra, Bellman-Ford, or union-find by edge weights, connectivity questions, and update patterns.',
    takeaways: [
      'BFS is shortest path only when every edge has equal cost.',
      'Dijkstra needs non-negative weights; Bellman-Ford handles negative edges with higher cost.',
      'Union-find answers connectivity, not path reconstruction.'
    ],
    examples: [
      {
        id: 'word-ladder',
        label: 'Word ladder',
        title: 'Use BFS for minimum transformations with equal edge cost',
        scenario:
          'Find the minimum number of one-letter word changes from hit to cog using a dictionary.',
        decision: 'Treat words as nodes and one-letter transformations as unweighted edges, then run BFS.',
        why: [
          'Each transformation costs one step.',
          'BFS explores by distance layers and stops at the first target.',
          'Precomputed wildcard buckets avoid comparing every word pair.'
        ],
        alternative:
          'DFS can find a valid chain but not guarantee the shortest number of transformations.',
        outcome:
          'The graph model and traversal match the equal-cost shortest path requirement.'
      },
      {
        id: 'network-components',
        label: 'Network components',
        title: 'Use union-find for repeated connectivity checks',
        scenario:
          'A network monitor receives cable connections and needs to know whether two servers are in the same connected component.',
        decision: 'Use union-find with path compression and union by rank.',
        why: [
          'Union operations merge components as connections arrive.',
          'Find queries are nearly constant time amortized.',
          'The structure is simpler than rerunning graph search for every query.'
        ],
        alternative:
          'BFS per query is fine for one check but too expensive for many online checks.',
        outcome:
          'Connectivity answers become fast, but the design does not pretend to know the actual route.'
      }
    ],
    decisionGuide: {
      prompt: 'Which graph algorithm fits the problem?',
      options: [
        {
          id: 'bfs',
          label: 'BFS shortest path',
          bestFor: 'Minimum steps in unweighted graphs or grids.',
          chooseWhen: [
            'Every move has the same cost.',
            'You need shortest distance by number of edges.',
            'The graph can be generated or stored by neighbors.'
          ],
          tradeOffs: [
            'Weighted edges break the guarantee.',
            'Memory grows with frontier width.',
            'Path reconstruction needs parent tracking.'
          ],
          alternativeOutcome:
            'DFS may return a path that looks plausible but is not minimal.'
        },
        {
          id: 'dijkstra',
          label: 'Dijkstra',
          bestFor: 'Shortest paths with non-negative edge weights.',
          chooseWhen: [
            'Costs differ but are never negative.',
            'You need shortest distance from one source or to one target.',
            'A priority queue is acceptable.'
          ],
          tradeOffs: [
            'Negative weights make results invalid.',
            'Dense graphs may need different representations.',
            'Implementation details around stale heap entries matter.'
          ],
          alternativeOutcome:
            'Using BFS on weighted edges optimizes hop count, not total cost.'
        },
        {
          id: 'union-find',
          label: 'Union-find',
          bestFor: 'Connectivity, components, cycle checks in undirected graphs, and Kruskal-style merging.',
          chooseWhen: [
            'Queries ask whether two nodes are connected.',
            'Edges are added over time or processed in sorted order.',
            'You do not need the actual path.'
          ],
          tradeOffs: [
            'It cannot answer shortest path.',
            'Removing edges is not supported by basic union-find.',
            'Directed reachability needs other tools.'
          ],
          alternativeOutcome:
            'Running graph search for every repeated connectivity query wastes work.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Choose routing logic for a delivery map',
      prompt:
        'A delivery app models intersections, road segments, closures, tolls, and cheap connectivity checks for service areas.',
      steps: [
        {
          title: 'Classify edge costs',
          detail: 'Use BFS only for equal-cost moves; use Dijkstra when road time or distance differs and weights are non-negative.',
          whatIf: 'Treating every road as equal finds fewest turns, not fastest delivery.'
        },
        {
          title: 'Choose representation',
          detail: 'Store adjacency lists with neighbor id, travel time, closure flag, and road metadata.',
          whatIf: 'An adjacency matrix wastes memory for sparse road networks.'
        },
        {
          title: 'Separate connectivity checks',
          detail: 'Use union-find for offline service-area grouping when roads are added, but not for turn-by-turn paths.',
          whatIf: 'Union-find can tell two points connect but cannot tell which route to drive.'
        },
        {
          title: 'Handle dynamic closures',
          detail: 'Invalidate affected routes or rerun shortest path with closure filters when road status changes.',
          whatIf: 'Basic precomputed paths become unsafe when closures or weights change.'
        }
      ],
      metrics: ['edge count', 'priority queue operations', 'component count', 'route recomputation count']
    }),
    mermaid: {
      title: 'Graph algorithm chooser',
      caption: 'Weights and question type determine shortest path versus connectivity tooling.',
      code: `flowchart TD
    Question[Question] --> Path{Need shortest path?}
    Path -->|No, connectivity| UF[Union-find]
    Path -->|Yes| Weight{Weighted edges?}
    Weight -->|No| BFS[BFS]
    Weight -->|Non-negative| Dijkstra[Dijkstra]
    Weight -->|Negative possible| Bellman[Bellman-Ford]
      `
    }
  },
  'dsa-algorithms-lab/dynamic-programming-cookbook': {
    title: 'Dynamic programming cookbook lab',
    summary:
      'Learn to identify overlapping subproblems, define states, write transitions, and choose memoized or bottom-up implementations.',
    takeaways: [
      'DP starts with a state definition that contains exactly the needed history.',
      'The transition should reduce the problem to smaller known states.',
      'Space optimization is safe only when dependencies are understood.'
    ],
    examples: [
      {
        id: 'coin-change',
        label: 'Coin change',
        title: 'Define state by remaining amount or prefix and amount',
        scenario:
          'Given coin denominations and a target amount, compute the fewest coins needed.',
        decision: 'Use dp[amount] as the best answer for each smaller amount, initialized from zero.',
        why: [
          'The optimal answer for an amount depends on choosing one coin and solving a smaller amount.',
          'Each amount is reused across many branches of the naive recursion.',
          'The one-dimensional state is sufficient because coins can be reused.'
        ],
        alternative:
          'Plain recursion recomputes the same remaining amounts exponentially many times.',
        outcome:
          'The DP table turns repeated subproblems into a linear-by-denominations computation.'
      },
      {
        id: 'knapsack',
        label: 'Knapsack',
        title: 'Include item index when choices cannot be reused',
        scenario:
          'Given items with weight and value, choose a subset under a capacity limit.',
        decision: 'Use state by item index and remaining capacity, with take or skip transitions.',
        why: [
          'The index captures which items are still available.',
          'Remaining capacity captures the constraint needed for future choices.',
          'Take and skip transitions cover all valid subsets without duplication.'
        ],
        alternative:
          'Using only capacity loses which items have already been considered unless the loop order enforces it.',
        outcome:
          'The state definition prevents accidental item reuse and makes optimization possible.'
      }
    ],
    decisionGuide: {
      prompt: 'How should you structure the DP?',
      options: [
        {
          id: 'top-down',
          label: 'Top-down memoization',
          bestFor: 'Recursive problems where not all states may be reached.',
          chooseWhen: [
            'The recurrence is easier to express recursively.',
            'Pruning or constraints avoid many states.',
            'Call stack depth is safe or can be managed.'
          ],
          tradeOffs: [
            'Recursion overhead and stack limits may matter.',
            'Cache keys must include all state dimensions.',
            'Evaluation order is less explicit.'
          ],
          alternativeOutcome:
            'Bottom-up may be faster but harder to derive before the recurrence is clear.'
        },
        {
          id: 'bottom-up',
          label: 'Bottom-up tabulation',
          bestFor: 'Problems where state order and dependencies are clear.',
          chooseWhen: [
            'Most states will be computed anyway.',
            'You can fill base cases and iterate in dependency order.',
            'You want predictable memory and no recursion.'
          ],
          tradeOffs: [
            'It may compute unreachable states.',
            'Loop order bugs are common.',
            'The table can be large without optimization.'
          ],
          alternativeOutcome:
            'Top-down can be more intuitive but may hit recursion limits or hide memory growth.'
        },
        {
          id: 'space-optimized',
          label: 'Space-optimized DP',
          bestFor: 'Large tables where each state depends on only a small previous frontier.',
          chooseWhen: [
            'Dependencies are limited to previous row, previous column, or a fixed window.',
            'You can update in an order that does not overwrite needed values.',
            'Memory is the limiting constraint.'
          ],
          tradeOffs: [
            'It is harder to reconstruct choices.',
            'Wrong update direction silently changes recurrence semantics.',
            'Debugging compressed state is less transparent.'
          ],
          alternativeOutcome:
            'Keeping the full table is often better until correctness is proven.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Build a DP answer for edit distance',
      prompt:
        'Given two strings, compute the minimum number of insertions, deletions, and replacements needed to transform one into the other.',
      steps: [
        {
          title: 'Define the state',
          detail: 'Let dp[i][j] be the minimum edits to transform the first i characters of word A into the first j characters of word B.',
          whatIf: 'A state that omits one prefix length cannot represent both deletion and insertion choices.'
        },
        {
          title: 'Set base cases',
          detail: 'dp[i][0] equals i deletions and dp[0][j] equals j insertions.',
          whatIf: 'Missing base cases make the recurrence fail at empty prefixes.'
        },
        {
          title: 'Write transitions',
          detail: 'If characters match, copy dp[i-1][j-1]; otherwise take one plus replace, delete, or insert.',
          whatIf: 'Considering only replacement misses cases where shifting alignment through insertion or deletion is cheaper.'
        },
        {
          title: 'Choose implementation',
          detail: 'Use a full table for explanation and optional reconstruction, or two rows when only distance is needed.',
          whatIf: 'Space optimization too early can obscure the recurrence in an interview.'
        }
      ],
      metrics: ['state count', 'transition count per state', 'table memory', 'base-case coverage']
    }),
    mermaid: {
      title: 'DP construction recipe',
      caption: 'State, base cases, transitions, and iteration order form the repeatable DP checklist.',
      code: `flowchart LR
    Signal[Overlapping subproblems] --> State[Define state]
    State --> Base[Base cases]
    Base --> Transition[Transition]
    Transition --> Order[Evaluation order]
    Order --> Optimize[Optional space optimization]
      `
    }
  },
  'ml-interactive-lab/feature-engineering-playground': {
    title: 'Feature engineering playground',
    summary:
      'Design features that are predictive, available at serving time, robust to drift, and explainable enough for production review.',
    takeaways: [
      'A good feature is useful only if it is available when the model serves.',
      'Leakage often comes from timestamps and labels, not obvious target columns.',
      'Feature quality needs monitoring for freshness, nulls, drift, and skew.'
    ],
    examples: [
      {
        id: 'delivery-eta',
        label: 'Delivery ETA',
        title: 'Use features known before dispatch, not hindsight labels',
        scenario:
          'A food delivery model predicts arrival time before assigning a courier, using restaurant, route, weather, and historical prep data.',
        decision: 'Use current distance, weather, restaurant rolling prep time, courier availability, and time-of-day features.',
        why: [
          'Each feature is known at prediction time.',
          'Rolling aggregates can be computed from past orders only.',
          'The feature set separates controllable dispatch signals from future outcomes.'
        ],
        alternative:
          'Including actual pickup time or final courier route leaks information that is unavailable when the prediction is made.',
        outcome:
          'The model trains on signals it can actually use in production.'
      },
      {
        id: 'churn-features',
        label: 'Churn features',
        title: 'Aggregate behavior over windows that match the decision',
        scenario:
          'A subscription app predicts churn risk weekly to decide who should receive retention offers.',
        decision: 'Build recency, frequency, engagement trend, support contact, and billing-failure features over 7, 30, and 90 day windows.',
        why: [
          'Different windows capture short-term frustration and long-term habit.',
          'The weekly decision cadence matches feature refresh cadence.',
          'Trend features are often more predictive than raw lifetime totals.'
        ],
        alternative:
          'Lifetime totals alone can make loyal but recently inactive users look healthier than they are.',
        outcome:
          'Feature windows align with when the product can act.'
      }
    ],
    decisionGuide: {
      prompt: 'Which feature strategy is safest?',
      options: [
        {
          id: 'point-in-time',
          label: 'Point-in-time correct features',
          bestFor: 'Any supervised model where production prediction happens before the outcome.',
          chooseWhen: [
            'Training rows have event timestamps and labels.',
            'Historical aggregates must use only past data.',
            'Leakage would inflate offline metrics.'
          ],
          tradeOffs: [
            'Feature generation is more complex.',
            'Backfills must respect timestamps.',
            'Late-arriving events need defined handling.'
          ],
          alternativeOutcome:
            'Leaky features create impressive validation scores and disappointing production performance.'
        },
        {
          id: 'simple-robust',
          label: 'Simple robust features',
          bestFor: 'Early models where interpretability and reliability matter.',
          chooseWhen: [
            'The team needs to debug predictions and data issues quickly.',
            'Input sources are still changing.',
            'A baseline model must ship safely before feature explosion.'
          ],
          tradeOffs: [
            'May leave some predictive signal unused.',
            'Manual feature work can be slower than representation learning.',
            'Simple features still need monitoring.'
          ],
          alternativeOutcome:
            'A huge feature set can hide leakage, skew, and maintenance cost.'
        },
        {
          id: 'learned-representations',
          label: 'Learned representations',
          bestFor: 'High-cardinality text, images, sequences, or behavior embeddings.',
          chooseWhen: [
            'Manual features cannot capture the signal shape.',
            'Training data and compute are sufficient.',
            'Serving infrastructure can produce the representation reliably.'
          ],
          tradeOffs: [
            'Harder to explain and monitor.',
            'Embedding freshness and versioning matter.',
            'Serving cost can grow quickly.'
          ],
          alternativeOutcome:
            'Hand-built features may be more reliable when the dataset is small or governance is strict.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Engineer fraud-risk features for checkout',
      prompt:
        'A fraud model scores payment attempts in real time using account history, device signals, merchant risk, and transaction context.',
      steps: [
        {
          title: 'Draw the prediction timeline',
          detail: 'Mark exactly what is known before authorization versus after settlement or chargeback.',
          whatIf: 'Using post-authorization outcomes leaks the label and causes offline metrics to lie.'
        },
        {
          title: 'Build historical aggregates',
          detail: 'Compute prior failed attempts, device velocity, merchant chargeback rate, and account age from past events only.',
          whatIf: 'Aggregates that include the current or future window can look predictive because they contain the answer.'
        },
        {
          title: 'Handle missingness intentionally',
          detail: 'Encode new-device and unknown-merchant cases rather than silently filling everything with zero.',
          whatIf: 'Zero-fill can make unknown and genuinely zero-risk cases indistinguishable.'
        },
        {
          title: 'Monitor serving parity',
          detail: 'Compare offline and online feature values for sampled predictions and alert on freshness or null spikes.',
          whatIf: 'Training-serving skew can break production even when the feature idea is good.'
        }
      ],
      metrics: ['feature freshness', 'null rate', 'training-serving skew', 'leakage audit failures', 'drift distance']
    }),
    mermaid: {
      title: 'Feature engineering feedback loop',
      caption: 'Prediction time drives feature eligibility, monitoring, and later iteration.',
      code: `flowchart LR
    Timeline[Prediction timeline] --> Eligible[Eligible signals]
    Eligible --> Transform[Feature transforms]
    Transform --> Train[Training set]
    Transform --> Serve[Online serving]
    Serve --> Monitor[Freshness and skew monitoring]
    Monitor --> Eligible
      `
    }
  },
  'ml-interactive-lab/supervised-learning-workshop': {
    title: 'Supervised learning workshop',
    summary:
      'Frame labeled prediction problems, choose baseline models and metrics, then evaluate whether the model is ready for production use.',
    takeaways: [
      'The label definition is the product decision encoded as data.',
      'Baselines and splits matter as much as model choice.',
      'Evaluation metrics should reflect the cost of false positives and false negatives.'
    ],
    examples: [
      {
        id: 'support-routing',
        label: 'Support routing',
        title: 'Match the metric to operational cost',
        scenario:
          'A support classifier routes tickets to billing, technical, account, or fraud teams, and wrong fraud routing is especially costly.',
        decision: 'Train a supervised classifier with stratified validation and evaluate per-class precision, recall, and confusion costs.',
        why: [
          'Labels come from historical resolved ticket categories.',
          'Per-class metrics reveal whether a small class like fraud is being ignored.',
          'The routing decision has asymmetric costs that accuracy hides.'
        ],
        alternative:
          'Optimizing only overall accuracy may produce a model that performs well on common billing tickets and poorly on critical fraud cases.',
        outcome:
          'The evaluation tells operations whether automation helps or harms each queue.'
      },
      {
        id: 'loan-default',
        label: 'Loan default',
        title: 'Use time-based splits when the future differs from the past',
        scenario:
          'A lending model predicts default risk using borrower history, macroeconomic context, and application data.',
        decision: 'Train on older applications, validate on later periods, and calibrate probabilities for threshold decisions.',
        why: [
          'Random splits can mix economic conditions and overstate future performance.',
          'Calibration matters when scores drive approval thresholds.',
          'Time-based evaluation better resembles deployment.'
        ],
        alternative:
          'A random split may leak time trends and make the model look stable before a market shift.',
        outcome:
          'The model review focuses on future decision quality, not just leaderboard score.'
      }
    ],
    decisionGuide: {
      prompt: 'Which supervised-learning setup is most appropriate?',
      options: [
        {
          id: 'classification',
          label: 'Classification',
          bestFor: 'Predicting categories, flags, routing choices, or yes/no outcomes.',
          chooseWhen: [
            'The label is discrete.',
            'Decision thresholds can be tuned by business cost.',
            'Confusion between classes has measurable impact.'
          ],
          tradeOffs: [
            'Class imbalance can hide poor minority-class performance.',
            'Probabilities may need calibration.',
            'Labels can encode historical bias.'
          ],
          alternativeOutcome:
            'Treating categories as regression targets loses class semantics and metric clarity.'
        },
        {
          id: 'regression',
          label: 'Regression',
          bestFor: 'Predicting continuous quantities such as demand, price, duration, or risk score.',
          chooseWhen: [
            'The target is numeric and ordered.',
            'Error magnitude matters.',
            'The product can act on a predicted value or interval.'
          ],
          tradeOffs: [
            'Outliers can dominate loss.',
            'Average error may hide tail failures.',
            'Prediction intervals may be needed for decisions.'
          ],
          alternativeOutcome:
            'Forcing continuous outcomes into buckets can discard useful information.'
        },
        {
          id: 'ranking',
          label: 'Learning to rank',
          bestFor: 'Search, feeds, recommendations, and ordered candidate lists.',
          chooseWhen: [
            'The product cares about relative order, especially near the top.',
            'Labels come from clicks, purchases, ratings, or human judgments.',
            'Metrics like NDCG or MAP match the user experience.'
          ],
          tradeOffs: [
            'Position bias can corrupt labels.',
            'Offline ranking metrics need online validation.',
            'Candidate generation and ranking must be evaluated separately.'
          ],
          alternativeOutcome:
            'A plain classifier may predict relevance but fail to optimize list quality.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Build a supervised model for customer churn',
      prompt:
        'A subscription company wants to predict which accounts are likely to cancel next month and decide who receives retention offers.',
      steps: [
        {
          title: 'Define the label',
          detail: 'Label accounts as churned only if cancellation happens within the next 30 days after the scoring date.',
          whatIf: 'A vague churn label can mix cancellations, pauses, payment failures, and support migrations.'
        },
        {
          title: 'Create a baseline',
          detail: 'Compare against simple rules such as recent inactivity and failed billing before using complex models.',
          whatIf: 'Without a baseline, the team cannot tell whether ML adds value.'
        },
        {
          title: 'Choose split and metrics',
          detail: 'Use time-based validation and evaluate precision, recall, lift, and offer cost at proposed thresholds.',
          whatIf: 'Random splits and accuracy can make an imbalanced churn problem look solved.'
        },
        {
          title: 'Plan threshold action',
          detail: 'Pick thresholds based on retention budget and expected savings, then monitor outcomes after launch.',
          whatIf: 'A model score without an action policy does not improve the business process.'
        }
      ],
      metrics: ['precision at offer budget', 'recall of churners', 'lift over baseline', 'calibration error', 'offer ROI']
    }),
    mermaid: {
      title: 'Supervised learning lifecycle',
      caption: 'Labels, splits, metrics, and thresholds connect model training to product action.',
      code: `flowchart LR
    Label[Label definition] --> Data[Training data]
    Data --> Baseline
    Baseline --> Model
    Model --> Metrics[Validation metrics]
    Metrics --> Threshold[Decision threshold]
    Threshold --> Monitor[Production monitoring]
      `
    }
  },
  'ml-interactive-lab/unsupervised-learning-workshop': {
    title: 'Unsupervised learning workshop',
    summary:
      'Use clustering, dimensionality reduction, and anomaly detection when labels are missing but structure in the data can still guide product decisions.',
    takeaways: [
      'Unsupervised results need business interpretation, not just algorithm output.',
      'Scaling and distance metrics can dominate clustering behavior.',
      'Validation often combines internal scores, stability, and human review.'
    ],
    examples: [
      {
        id: 'customer-segments',
        label: 'Customer segments',
        title: 'Cluster behavior only after normalizing feature scales',
        scenario:
          'A marketplace wants customer segments from order count, spend, category diversity, discount use, and recency.',
        decision: 'Standardize numeric features, try a small range of cluster counts, and inspect segment profiles with domain experts.',
        why: [
          'Spend can dominate distance if features are not scaled.',
          'Multiple K values expose whether segments are stable or arbitrary.',
          'Domain review turns clusters into usable marketing or product actions.'
        ],
        alternative:
          'Running K-means on raw columns can create clusters that mostly reflect income or scale rather than behavior patterns.',
        outcome:
          'Segments become interpretable hypotheses that can be tested in campaigns.'
      },
      {
        id: 'anomaly-detection',
        label: 'Payment anomalies',
        title: 'Use anomaly detection as triage when labels are sparse',
        scenario:
          'A payment team has few confirmed fraud labels but wants to flag unusual merchant transaction patterns.',
        decision: 'Use robust statistical features and anomaly scoring, then route top anomalies for analyst review.',
        why: [
          'The approach can surface unusual behavior before enough labels exist.',
          'Human review provides feedback and future supervised labels.',
          'Thresholds can be tuned to analyst capacity.'
        ],
        alternative:
          'Treating anomaly score as proof of fraud creates false accusations and poor trust.',
        outcome:
          'Unsupervised learning supports investigation instead of pretending to be a final judge.'
      }
    ],
    decisionGuide: {
      prompt: 'Which unsupervised method fits the goal?',
      options: [
        {
          id: 'clustering',
          label: 'Clustering',
          bestFor: 'Finding groups of similar users, products, documents, or behaviors.',
          chooseWhen: [
            'The goal is segmentation or exploration.',
            'Features and distance meaning can be explained.',
            'Clusters can be validated by stability and domain review.'
          ],
          tradeOffs: [
            'Cluster count and scaling choices affect results.',
            'Clusters may not map to actionable groups.',
            'Outliers can distort centroids.'
          ],
          alternativeOutcome:
            'Using clustering as if it were classification overstates what unlabeled data can prove.'
        },
        {
          id: 'dimensionality',
          label: 'Dimensionality reduction',
          bestFor: 'Visualization, compression, denoising, and embeddings exploration.',
          chooseWhen: [
            'High-dimensional data needs a lower-dimensional view.',
            'The product needs similarity search or visual inspection.',
            'Some information loss is acceptable.'
          ],
          tradeOffs: [
            'Axes may be hard to interpret.',
            'Local and global structure can be distorted.',
            'Results depend on preprocessing and parameters.'
          ],
          alternativeOutcome:
            'Directly inspecting hundreds of raw dimensions is usually not actionable.'
        },
        {
          id: 'anomaly',
          label: 'Anomaly detection',
          bestFor: 'Rare, unusual, or suspicious patterns with limited labels.',
          chooseWhen: [
            'The team can review or triage flagged cases.',
            'Normal behavior is easier to model than every bad case.',
            'False positive cost is managed by threshold and workflow.'
          ],
          tradeOffs: [
            'Anomaly does not always mean bad.',
            'Concept drift changes what normal means.',
            'Evaluation requires feedback loops.'
          ],
          alternativeOutcome:
            'Waiting for labels may delay detection, but acting without review can harm users.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Segment users for a learning app',
      prompt:
        'A learning platform wants to understand study behavior using session frequency, lesson completion, quiz attempts, topic mix, and recency.',
      steps: [
        {
          title: 'Prepare features',
          detail: 'Create behavior features over consistent windows and scale them so high-count features do not dominate.',
          whatIf: 'Raw activity counts can cluster heavy users separately from everyone else without revealing learning style.'
        },
        {
          title: 'Try candidate methods',
          detail: 'Compare K-means, hierarchical clustering, and dimensionality reduction views for stability and interpretability.',
          whatIf: 'One algorithm output can look authoritative even when a small parameter change reshapes every segment.'
        },
        {
          title: 'Profile the clusters',
          detail: 'Summarize each segment by completion rate, preferred topics, return frequency, and likely product action.',
          whatIf: 'Clusters without profiles are math artifacts, not product insight.'
        },
        {
          title: 'Validate with experiments',
          detail: 'Use segments to personalize nudges or recommendations, then measure engagement against a control.',
          whatIf: 'Unsupervised learning is not proven useful until it improves a decision.'
        }
      ],
      metrics: ['silhouette score', 'cluster stability', 'segment size balance', 'experiment lift', 'human interpretability score']
    }),
    mermaid: {
      title: 'Unsupervised learning workflow',
      caption: 'Preprocessing and interpretation turn unlabeled structure into product hypotheses.',
      code: `flowchart LR
    Raw[Raw behavior data] --> Features
    Features --> Scale[Scale and clean]
    Scale --> Method[Cluster or reduce dimensions]
    Method --> Profile[Profile results]
    Profile --> Review[Domain review]
    Review --> Experiment[Product experiment]
      `
    }
  },
  'deep-learning-from-scratch/perceptron-and-mlp-numpy': {
    title: 'Perceptron and MLP from scratch lab',
    summary:
      'Build intuition for linear separators, activations, hidden layers, and NumPy tensor shapes before relying on deep-learning frameworks.',
    takeaways: [
      'A perceptron learns a linear decision boundary.',
      'Hidden layers plus nonlinear activations let MLPs model non-linear patterns.',
      'Shape discipline prevents most from-scratch neural-network bugs.'
    ],
    examples: [
      {
        id: 'and-gate',
        label: 'AND gate',
        title: 'Use a perceptron for linearly separable logic',
        scenario:
          'You want to classify AND gate inputs where only [1, 1] maps to 1.',
        decision: 'Train a perceptron with two weights and a bias because one line separates the positive point.',
        why: [
          'The target is linearly separable.',
          'The weighted sum plus threshold is sufficient.',
          'Updates move the boundary when a point is misclassified.'
        ],
        alternative:
          'Using an MLP works but hides the simpler geometric explanation.',
        outcome:
          'The perceptron demonstrates the core idea of learned weights and bias.'
      },
      {
        id: 'xor-mlp',
        label: 'XOR',
        title: 'Add a hidden layer when one line cannot separate the classes',
        scenario:
          'XOR returns 1 when exactly one input is 1, creating diagonal positive points.',
        decision: 'Use a small MLP with a nonlinear hidden layer to combine multiple learned boundaries.',
        why: [
          'No single linear separator solves XOR.',
          'Hidden units can represent intermediate regions.',
          'A nonlinear activation prevents the stacked layers from collapsing into one linear transform.'
        ],
        alternative:
          'A perceptron will keep oscillating or settle with unavoidable errors because the data is not linearly separable.',
        outcome:
          'The example explains why depth and activations matter.'
      }
    ],
    decisionGuide: {
      prompt: 'Which model should you build from scratch first?',
      options: [
        {
          id: 'perceptron',
          label: 'Perceptron or logistic unit',
          bestFor: 'Linear boundaries and teaching weights, bias, and simple updates.',
          chooseWhen: [
            'The data is linearly separable or a linear baseline is enough.',
            'You want to inspect every parameter.',
            'The focus is optimization intuition rather than representation learning.'
          ],
          tradeOffs: [
            'Cannot model non-linear decision boundaries alone.',
            'Feature scaling still matters.',
            'Threshold perceptrons do not produce calibrated probabilities.'
          ],
          alternativeOutcome:
            'Jumping straight to deep networks can obscure whether the data needs nonlinearity.'
        },
        {
          id: 'mlp',
          label: 'One-hidden-layer MLP',
          bestFor: 'Small non-linear problems and learning forward/backward passes.',
          chooseWhen: [
            'A linear model underfits obvious structure.',
            'You can keep tensor shapes small enough to debug.',
            'You need to practice activations and gradients.'
          ],
          tradeOffs: [
            'More parameters create overfitting risk.',
            'Initialization and learning rate become important.',
            'Manual backpropagation is easier to get wrong.'
          ],
          alternativeOutcome:
            'Using a framework first may produce outputs without understanding the math.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Build a NumPy MLP for toy classification',
      prompt:
        'A learner wants to classify two-dimensional points in a crescent-shaped dataset without using PyTorch or TensorFlow.',
      steps: [
        {
          title: 'Start with shapes',
          detail: 'Represent X as batch by features, W1 as features by hidden units, and logits as batch by classes.',
          whatIf: 'Shape mistakes can silently broadcast and train the wrong computation.'
        },
        {
          title: 'Implement forward pass',
          detail: 'Compute affine layer, activation, output logits, and loss with cached intermediate values.',
          whatIf: 'Without caches, backpropagation has no reliable record of the values gradients depend on.'
        },
        {
          title: 'Train a linear baseline',
          detail: 'Show that a perceptron or logistic classifier underfits the crescent before adding hidden units.',
          whatIf: 'Skipping the baseline makes it unclear why the MLP is needed.'
        },
        {
          title: 'Add hidden layer and monitor',
          detail: 'Train with small random initialization, tuned learning rate, and loss plus accuracy checks.',
          whatIf: 'A broken training loop can look like bad model capacity unless loss and gradients are inspected.'
        }
      ],
      metrics: ['loss curve', 'training accuracy', 'validation accuracy', 'gradient norm', 'shape assertion failures']
    }),
    mermaid: {
      title: 'MLP forward pass',
      caption: 'Input features pass through affine transforms and nonlinear activation to produce logits.',
      code: `flowchart LR
    X[Input batch] --> Z1[Affine W1 plus b1]
    Z1 --> A1[Nonlinear activation]
    A1 --> Z2[Affine W2 plus b2]
    Z2 --> Loss[Softmax or sigmoid loss]
    Loss --> Gradients[Backprop gradients]
      `
    }
  },
  'deep-learning-from-scratch/backpropagation-by-hand': {
    title: 'Backpropagation by hand lab',
    summary:
      'Trace gradients through a computation graph so the chain rule, cached values, and parameter updates become mechanical instead of mysterious.',
    takeaways: [
      'Backpropagation is reverse-mode automatic differentiation over a computation graph.',
      'Each local gradient multiplies the upstream gradient by the chain rule.',
      'Caching forward values makes backward passes correct and efficient.'
    ],
    examples: [
      {
        id: 'scalar-chain',
        label: 'Scalar chain',
        title: 'Propagate gradients one local derivative at a time',
        scenario:
          'A toy function computes loss = (w * x + b - y)^2 for one example.',
        decision: 'Cache prediction and error, then compute gradients for w and b by reverse traversal.',
        why: [
          'The squared loss derivative starts the upstream gradient at 2 * error.',
          'The affine node sends gradient to w through x and to b through 1.',
          'The same method extends to vectorized batches.'
        ],
        alternative:
          'Numerical gradients can check correctness but are too slow and imprecise for training.',
        outcome:
          'The learner sees backprop as repeated local chain-rule multiplication.'
      },
      {
        id: 'relu-branch',
        label: 'ReLU branch',
        title: 'Use cached activation masks for piecewise gradients',
        scenario:
          'A hidden layer uses ReLU before the output layer, and some pre-activation values are negative.',
        decision: 'Cache the pre-activation values and multiply upstream gradients by a mask where z > 0.',
        why: [
          'ReLU derivative is local and depends on the forward pre-activation.',
          'Negative units receive zero gradient for that example.',
          'The mask shape must match the hidden activation shape.'
        ],
        alternative:
          'Recomputing or guessing the mask can create gradient bugs that are hard to spot in loss alone.',
        outcome:
          'Piecewise activations become simple when forward caches are disciplined.'
      }
    ],
    decisionGuide: {
      prompt: 'How should you verify a hand-written backward pass?',
      options: [
        {
          id: 'shape-checks',
          label: 'Shape and cache checks',
          bestFor: 'Catching structural bugs before numerical comparison.',
          chooseWhen: [
            'You are implementing matrix gradients.',
            'Broadcasting or reduction is involved.',
            'Intermediate values are reused in backward pass.'
          ],
          tradeOffs: [
            'Shape correctness does not prove math correctness.',
            'Too many asserts can clutter teaching code.',
            'Some bugs produce correct shapes with wrong values.'
          ],
          alternativeOutcome:
            'Skipping shape checks can let NumPy broadcasting hide serious gradient errors.'
        },
        {
          id: 'gradient-check',
          label: 'Finite-difference gradient check',
          bestFor: 'Validating small networks and custom operations.',
          chooseWhen: [
            'The model and batch are tiny enough for repeated forward passes.',
            'You need confidence in a custom derivative.',
            'Random seeds and tolerances are controlled.'
          ],
          tradeOffs: [
            'It is computationally expensive.',
            'Numerical precision affects tolerance.',
            'It checks implementation at sampled points, not proof for every input.'
          ],
          alternativeOutcome:
            'Trusting a complex backward pass without checks can waste hours tuning a model that cannot learn.'
        },
        {
          id: 'training-sanity',
          label: 'Training sanity tests',
          bestFor: 'Confirming the gradients help optimization.',
          chooseWhen: [
            'You can overfit a tiny dataset.',
            'Loss should decrease on a simple known problem.',
            'Gradient norms can be monitored.'
          ],
          tradeOffs: [
            'A decreasing loss does not catch every subtle gradient error.',
            'Learning rate can mask or exaggerate issues.',
            'Sanity tests need simple data with known behavior.'
          ],
          alternativeOutcome:
            'Only checking formulas on paper may miss implementation mistakes.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Hand-derive backprop for a two-layer network',
      prompt:
        'A NumPy network computes X -> affine -> ReLU -> affine -> softmax loss, and you need to implement gradients by hand.',
      steps: [
        {
          title: 'Draw the computation graph',
          detail: 'List affine1, ReLU, affine2, softmax, and loss nodes with their inputs and cached outputs.',
          whatIf: 'Without a graph, it is easy to skip a dependency or apply gradients in the wrong order.'
        },
        {
          title: 'Start at the loss',
          detail: 'Compute the gradient of loss with respect to logits, including batch averaging.',
          whatIf: 'Forgetting batch normalization changes gradient scale and learning-rate behavior.'
        },
        {
          title: 'Walk backward through layers',
          detail: 'Compute dW2, db2, dHidden, ReLU mask, dW1, db1, and optionally dX in reverse order.',
          whatIf: 'Applying the ReLU mask after the wrong matrix multiply changes which units receive credit.'
        },
        {
          title: 'Verify numerically',
          detail: 'Run finite-difference checks on tiny tensors and overfit a small dataset after gradients match.',
          whatIf: 'A network that cannot overfit a tiny batch usually has a gradient, data, or optimization bug.'
        }
      ],
      metrics: ['gradient relative error', 'loss decrease', 'gradient norm', 'tiny-batch overfit accuracy']
    }),
    mermaid: {
      title: 'Reverse-mode backpropagation',
      caption: 'The backward pass walks the forward graph in reverse, multiplying local gradients by upstream gradients.',
      code: `flowchart LR
    X --> Affine1
    Affine1 --> ReLU
    ReLU --> Affine2
    Affine2 --> Loss
    Loss -. backward .-> Affine2
    Affine2 -. backward .-> ReLU
    ReLU -. backward .-> Affine1
    Affine1 -. backward .-> X
      `
    }
  },
  'deep-learning-from-scratch/cnn-building-blocks-numpy': {
    title: 'CNN building blocks in NumPy lab',
    summary:
      'Build intuition for convolution, padding, stride, pooling, channels, and parameter sharing by implementing small image operations from scratch.',
    takeaways: [
      'Convolutions reuse the same kernel across spatial positions.',
      'Padding and stride control output size and receptive field movement.',
      'Pooling reduces spatial resolution while preserving strong local signals.'
    ],
    examples: [
      {
        id: 'edge-filter',
        label: 'Edge filter',
        title: 'Apply one kernel across an image to detect local patterns',
        scenario:
          'A grayscale image needs a simple vertical edge detector implemented without a deep-learning framework.',
        decision: 'Slide a small kernel over padded image windows and compute dot products for each output position.',
        why: [
          'The same weights are shared across all positions.',
          'Local windows capture nearby pixel contrast.',
          'Manual loops reveal how output height and width are calculated.'
        ],
        alternative:
          'Flattening the image into one dense layer loses spatial locality and uses far more parameters.',
        outcome:
          'The learner sees convolution as structured matrix multiplication with shared weights.'
      },
      {
        id: 'pooling',
        label: 'Max pooling',
        title: 'Use pooling to downsample while keeping strongest activations',
        scenario:
          'A feature map has local responses to corners and edges, but the classifier does not need pixel-perfect location.',
        decision: 'Apply max pooling over non-overlapping windows to reduce width and height.',
        why: [
          'Pooling lowers computation in later layers.',
          'Max pooling keeps strong local evidence.',
          'Small translations become less disruptive to the representation.'
        ],
        alternative:
          'Keeping full resolution everywhere is more expensive and may overemphasize tiny position shifts.',
        outcome:
          'The network trades spatial precision for compact, robust features.'
      }
    ],
    decisionGuide: {
      prompt: 'Which CNN building block should you apply?',
      options: [
        {
          id: 'convolution',
          label: 'Convolution',
          bestFor: 'Learning local spatial patterns with shared parameters.',
          chooseWhen: [
            'Nearby pixels or tokens form meaningful local structure.',
            'The same pattern may appear in many positions.',
            'Parameter efficiency matters.'
          ],
          tradeOffs: [
            'Manual implementation can be slow without vectorization.',
            'Kernel size and padding choices affect output shape.',
            'Very global context needs deeper layers or other mechanisms.'
          ],
          alternativeOutcome:
            'Dense layers on flattened images ignore translation structure and grow parameter count quickly.'
        },
        {
          id: 'padding-stride',
          label: 'Padding and stride tuning',
          bestFor: 'Controlling output dimensions and receptive-field movement.',
          chooseWhen: [
            'You need to preserve spatial size or downsample deliberately.',
            'Boundary information matters.',
            'Compute cost must be balanced against resolution.'
          ],
          tradeOffs: [
            'Incorrect formulas create off-by-one output shapes.',
            'Large stride can skip useful detail.',
            'Padding introduces artificial border values.'
          ],
          alternativeOutcome:
            'Defaulting to valid convolution can shrink feature maps faster than intended.'
        },
        {
          id: 'pooling',
          label: 'Pooling',
          bestFor: 'Downsampling feature maps and adding local translation tolerance.',
          chooseWhen: [
            'Later layers do not need full spatial resolution.',
            'Strong local activation is more important than exact position.',
            'You want to reduce compute and memory.'
          ],
          tradeOffs: [
            'Pooling discards spatial detail.',
            'Window and stride choices affect invariance.',
            'Some modern CNNs use strided convolutions instead.'
          ],
          alternativeOutcome:
            'Skipping downsampling can make later dense or convolutional layers too expensive.'
        }
      ]
    },
    caseStudy: caseStudy({
      title: 'Implement a tiny CNN forward pass in NumPy',
      prompt:
        'A learner wants to classify 28 by 28 grayscale images with one convolution, ReLU, max pooling, and a final dense layer.',
      steps: [
        {
          title: 'Compute output shapes',
          detail: 'Use input size, kernel size, padding, and stride to calculate convolution and pooling dimensions before coding.',
          whatIf: 'Shape guesses lead to mismatched arrays at the dense layer.'
        },
        {
          title: 'Write convolution loops',
          detail: 'Iterate over batch, output channels, spatial positions, and input channels to sum window times kernel plus bias.',
          whatIf: 'Forgetting input channels works on grayscale examples but fails on color or deeper feature maps.'
        },
        {
          title: 'Add activation and pooling',
          detail: 'Apply ReLU elementwise, then pool each feature map with recorded max positions if backward pass is planned.',
          whatIf: 'Pooling without indices makes a from-scratch backward pass harder to implement.'
        },
        {
          title: 'Flatten deliberately',
          detail: 'Flatten only after spatial feature extraction and verify the dense input dimension from computed shapes.',
          whatIf: 'Flattening at the start throws away the CNN advantage and explodes parameter count.'
        }
      ],
      metrics: ['output height and width', 'parameter count', 'forward pass time', 'shape assertion failures']
    }),
    mermaid: {
      title: 'Tiny CNN forward path',
      caption: 'Convolution extracts local features, pooling compresses them, and dense layers classify.',
      code: `flowchart LR
    Image[Input image] --> Conv[Convolution]
    Conv --> Relu[ReLU]
    Relu --> Pool[Max pool]
    Pool --> Flatten
    Flatten --> Dense[Dense classifier]
    Dense --> Prob[Class scores]
      `
    }
  }
};
