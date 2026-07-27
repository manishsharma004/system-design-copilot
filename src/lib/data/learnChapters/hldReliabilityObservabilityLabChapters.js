/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldReliabilityObservabilityLabChapters = {
  "reliability-observability-lab/sli-slo-error-budgets": {
    "title": "Workshop: SLIs, SLOs, and error budgets",
    "readingTime": "75-95 min",
    "premise": "Reliability becomes negotiable engineering when it is measured as user promises, not host charts. This lab writes SLIs, turns them into SLOs with arithmetic error budgets, designs burn-rate alerts, and drafts a policy that changes release risk when budgets burn.",
    "parts": [
      {
        "id": "user-centered-sli-lab",
        "heading": "Write user-centered SLIs first",
        "paragraphs": [
          "An SLI measures a promise a user can feel. CPU, pod restarts, and queue depth are useful causes; they are rarely the promise. For checkout, prefer the fraction of valid checkout attempts that complete successfully within two seconds. For search, successful queries returning sufficiently fresh results within a latency bound. For streaming, minutes of playback without rebuffering.",
          "Define the population carefully. The denominator should include requests users reasonably expected to work: exclude malformed clients and synthetic noise if appropriate, but include server errors, timeouts, and dependency failures. Counting only successes makes latency look perfect because failures vanish.",
          "Workshop: for a checkout service, write three candidate SLIs in plain language before any query language. Pick one availability-style and one latency-style SLI, and justify the exclusions."
        ],
        "keyTerms": [
          {
            "term": "SLI",
            "definition": "A carefully defined quantitative measure of a user-facing service promise."
          },
          {
            "term": "Valid request population",
            "definition": "The denominator of requests that should have worked from the user's perspective."
          },
          {
            "term": "Symptom metric",
            "definition": "A user-visible signal such as success ratio or latency, as opposed to a low-level cause."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Write the SLI in one English sentence. If you cannot, the PromQL will not save you."
        },
        "checkYourself": [
          {
            "prompt": "Why can including bots in the SLI denominator hide damage?",
            "reveal": "High volumes of invalid or non-user traffic can dilute the failure rate of real user journeys, making the service look healthier than customers experience."
          }
        ]
      },
      {
        "id": "slo-and-budget-arithmetic",
        "heading": "Turn SLIs into SLOs and budget math",
        "paragraphs": [
          "An SLO sets a target on an SLI over a window, such as 99.9 percent successful checkouts over 30 days. The error budget is the allowed failure remainder: 0.1 percent. In request terms, that is about 1,000 bad events per million valid requests. In time terms for continuous unavailability, roughly 43 minutes per 30 days. An extra nine of reliability is expensive because it shrinks room for deploys, maintenance, and dependency faults.",
          "Choose tightness from user need and business leverage, not prestige. Internal admin exports rarely need payment-class SLOs. Over-tight targets burn people and freeze product velocity without improving outcomes users notice.",
          "Lab math: compute remaining budget after a two-hour incident at a known bad-event rate, and decide whether launches should slow."
        ],
        "workedExample": {
          "title": "99.9% monthly error budget worksheet",
          "body": "Compute allowed bad events and remaining budget after an incident.",
          "code": "slo = 0.999\nwindow_requests = 50_000_000  # valid checkouts / 30d\nbudget_bad = window_requests * (1 - slo)\n# Incident: 2 hours at 2% failure on 200 rps valid traffic\nincident_bad = 2 * 3600 * 200 * 0.02\nremaining = budget_bad - incident_bad\nprint(f\"monthly bad-event budget: {budget_bad:,.0f}\")\nprint(f\"incident bad events: {incident_bad:,.0f}\")\nprint(f\"remaining budget: {remaining:,.0f}\")\nprint(f\"budget consumed: {incident_bad / budget_bad:.1%}\")\n",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Convert nines into minutes or bad events aloud, then relate the number to release risk."
        },
        "checkYourself": [
          {
            "prompt": "What does a 99.99% monthly availability SLO allow roughly in downtime minutes?",
            "reveal": "About 4.3 minutes per 30 days if measured as pure downtime—ten times less budget than 99.9%."
          }
        ]
      },
      {
        "id": "burn-rate-alerting",
        "heading": "Design multi-window burn-rate alerts",
        "paragraphs": [
          "Alerting on raw error rate ignores how fast budget is disappearing. Burn rate compares current badness to the sustainable allowance. For a 99.9 percent SLO, allowed error rate is 0.1 percent. Failing 2 percent of valid requests burns at 20×; a 30-day budget vanishes in about 36 hours if unabated.",
          "Use multiple windows: a high burn over a few minutes catches disasters; a moderate burn over one or six hours catches slow leaks. Pairing windows reduces pages on one-minute blips while still catching sustained harm. Alerts should name the SLO, population, burn rate, and ownership path.",
          "Workshop: pick thresholds for page versus ticket for checkout availability, and write the alert description a human should read at 3 a.m."
        ],
        "workedExample": {
          "title": "Burn-rate check",
          "body": "Compare observed error rate to SLO allowance.",
          "code": "slo = 0.999\nallowed_error_rate = 1 - slo  # 0.001\nobserved_error_rate = 0.02\nburn = observed_error_rate / allowed_error_rate\nhours_to_exhaust_30d = (30 * 24) / burn\nprint(f\"burn rate: {burn:.0f}x\")\nprint(f\"hours to exhaust 30d budget at this burn: {hours_to_exhaust_30d:.1f}\")\n",
          "language": "python"
        },
        "callout": {
          "tone": "warning",
          "body": "Dashboards diagnose causes; SLO burn alerts decide whether humans must act now."
        },
        "checkYourself": [
          {
            "prompt": "Why use both short and long burn windows?",
            "reveal": "Short windows catch fast disasters; long windows catch slow budget leaks. Together they reduce noise from tiny blips while preserving sensitivity to sustained harm."
          }
        ]
      },
      {
        "id": "reliability-policy",
        "heading": "Draft a reliability policy that changes behavior",
        "paragraphs": [
          "An error budget is powerful only when it changes decisions. Example policy: if 14-day burn exceeds 50 percent, risky launches need service-owner approval; if burn exceeds 100 percent, freeze features except fixes; if budget is healthy, normal velocity continues. Agree ahead of time so reliability is not a last-minute argument.",
          "Clarify what does not count: planned maintenance expectations, bad client SDKs handled correctly, regional weighting by traffic. These details prevent gaming during incidents and keep the ledger trusted.",
          "Lab deliverable: a one-page policy for checkout with SLOs, burn thresholds, release consequences, and exclusion rules."
        ],
        "keyTerms": [
          {
            "term": "Error budget",
            "definition": "Allowed unreliability over a window derived from an SLO."
          },
          {
            "term": "Burn rate",
            "definition": "How fast the budget is being consumed relative to the sustainable rate."
          },
          {
            "term": "Reliability policy",
            "definition": "Pre-agreed rules linking budget health to release and operational risk."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "A policy nobody can recite under pressure is theater. Keep it short and linked from the alert."
        },
        "checkYourself": [
          {
            "prompt": "What is a healthy use of leftover error budget?",
            "reveal": "Taking calculated product and release risk—shipping faster—because users are not being harmed. Budget left unused forever may mean over-investment in reliability relative to user need."
          }
        ]
      },
      {
        "id": "slo-for-dependencies",
        "heading": "Compose SLOs across dependencies",
        "paragraphs": [
          "Your SLO depends on dependency SLOs plus your own failure modes. If checkout needs payments, inventory, and fraud, the combined availability ceiling is roughly the product of independent availabilities unless you add fallbacks, caching, or deferred work. Design either softer SLOs or stronger isolation and degradation.",
          "Map each dependency to whether it is hard-required, soft-required with fallback, or async. Soft dependencies should not burn the same budget as payment authorization when they fail.",
          "Workshop: redraw checkout with two soft dependencies and recompute a realistic SLO ceiling versus a naive fully-hard dependency graph."
        ],
        "callout": {
          "tone": "interview",
          "body": "Show how fallbacks and async boundaries convert hard dependency risk into softer user impact."
        },
        "checkYourself": [
          {
            "prompt": "How can a service honestly claim higher availability than a critical dependency?",
            "reveal": "Only with isolation and degradation: timeouts, fallbacks, cached data, or deferred paths so dependency failure does not equal user failure for that journey."
          }
        ]
      },
      {
        "id": "slo-review-closeout",
        "heading": "Lab closeout: SLO review package",
        "paragraphs": [
          "Package your work: SLI definitions, SLO targets, budget math, alert rules, policy, and dependency composition notes. Review with product and on-call owners together so the promises match both user expectations and operational reality.",
          "Schedule quarterly revisits. Traffic mix, client behavior, and dependency topology change; frozen SLOs become lies.",
          "Success criterion for the lab: someone else can page from your alert, know which user promise is burning, and know what release policy applies—without asking you."
        ],
        "callout": {
          "tone": "warning",
          "body": "An SLO without an owner and a policy is a vanity chart."
        },
        "checkYourself": [
          {
            "prompt": "Who should attend an SLO review?",
            "reveal": "Service owners, on-call representatives, and product stakeholders for the user journeys measured—because targets trade reliability against delivery speed."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "SLIs must measure user promises with honest denominators.",
        "Error budgets turn nines into actionable arithmetic for risk.",
        "Burn-rate alerts with multiple windows page on meaningful harm.",
        "Policies must change release behavior when budgets burn.",
        "Dependency composition and degradation determine realistic SLO ceilings."
      ],
      "nextSteps": [
        "Write plain-language SLIs for one critical journey.",
        "Compute monthly budget and a burn-rate alert sketch.",
        "Draft a one-page reliability policy with freeze thresholds."
      ]
    }
  },
  "reliability-observability-lab/tracing-metrics-and-logs": {
    "title": "Workshop: Tracing, metrics, and logs",
    "readingTime": "70-90 min",
    "premise": "Observability is a data model for questions under pressure. This lab assigns metrics, traces, and logs to the questions they answer, designs correlation and cardinality budgets, and builds a checkout incident dashboard that actually shortens MTTR.",
    "parts": [
      {
        "id": "signal-question-fit",
        "heading": "Match signals to debugging questions",
        "paragraphs": [
          "Metrics answer how many, how often, and how much: rate, error ratio, p95 latency, queue depth, hit ratio. Traces answer where time went for one request across services. Logs answer what happened at a point with rich context: decision reasons, exception classes, retry counts. Using one signal for every question creates either blindness or unsustainable cost.",
          "Start from the question. Is the whole site slow? Route latency metrics suffice. Why did one checkout take nine seconds? Need a trace. Why did fraud decline an order? Need structured decision logs. Mature observability collects targeted evidence, not everything.",
          "Workshop: list ten incident questions for checkout and assign each to metrics, traces, logs, or a combination."
        ],
        "keyTerms": [
          {
            "term": "Metric",
            "definition": "An aggregated numeric time series suited to rates, ratios, and percentiles."
          },
          {
            "term": "Trace",
            "definition": "A directed graph of spans showing where one request spent time across components."
          },
          {
            "term": "Structured log",
            "definition": "An event record with typed fields that can be filtered and joined."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If you cannot name the question a signal answers, do not collect it yet."
        },
        "checkYourself": [
          {
            "prompt": "When are metrics the wrong primary tool?",
            "reveal": "When you need per-request causal detail or rare decision context—those belong in traces and structured logs, optionally linked from metric exemplars."
          }
        ]
      },
      {
        "id": "correlation-identifiers",
        "heading": "Propagate correlation across sync and async boundaries",
        "paragraphs": [
          "A correlation or trace ID turns separate streams into one story. The edge creates or accepts a request ID, propagates headers, and attaches the ID to logs, spans, queue messages, and sometimes metric exemplars. Engineers move from a p99 chart to a trace sample to exact logs without timestamp guessing.",
          "Async boundaries are where correlation dies if you are careless. When an API enqueues payment work, copy trace context or causation IDs into the message. Batch jobs need job and item IDs without exploding cardinality on every metric.",
          "Keep IDs opaque for privacy—never raw emails or tokens. Lab: sketch header propagation for gateway → API → queue → worker → database span."
        ],
        "callout": {
          "tone": "warning",
          "body": "Logs without join keys are narratives you cannot assemble during an outage."
        },
        "checkYourself": [
          {
            "prompt": "What breaks if queue messages omit trace context?",
            "reveal": "Worker failures and latency become disconnected from the user action that caused them, forcing slow timestamp correlation under incident pressure."
          }
        ]
      },
      {
        "id": "cardinality-budgets",
        "heading": "Set cardinality budgets like data modeling",
        "paragraphs": [
          "Labels make metrics useful and expensive. Route, method, status class, region, and service are usually safe. User ID, request ID, full URL, SKU, or free-text errors can create millions of series and melt the metrics backend.",
          "Put aggregate dimensions in metrics; put per-entity detail in traces or logs with different sampling and retention. Normalize paths to `/orders/:id`. Bucket numeric sizes when exact values are unnecessary. Use exemplars to connect spikes to example traces.",
          "Workshop: review a proposed metric with labels `{route,user_id,status,region}` and rewrite it to a safe design."
        ],
        "workedExample": {
          "title": "Dashboard query sketch with safe labels",
          "body": "Aggregate checkout symptoms without high-cardinality labels.",
          "code": "# Pseudocode metric design\n# GOOD labels: route, method, status_class, region, service\n# BAD labels: user_id, order_id, raw_url, exception_message\n\nhttp_requests_total{route=\"/checkout/pay\", status_class=\"5xx\", region=\"us-east\"}\nhttp_request_duration_seconds_bucket{route=\"/checkout/pay\", region=\"us-east\"}\n\n# Exemplar attached to a trace_id for one slow sample\n# Logs/traces hold order_id and decision detail\n",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "Call cardinality a modeling cost: every label is an index you must afford."
        },
        "checkYourself": [
          {
            "prompt": "Where should order_id live if not on metrics?",
            "reveal": "On traces and structured logs (and occasionally exemplars), where per-entity detail is expected and retention/sampling can differ."
          }
        ]
      },
      {
        "id": "sampling-with-intent",
        "heading": "Sample traces and logs with intent",
        "paragraphs": [
          "Tracing every request at high QPS is often unnecessary. Head-based sampling decides at start (keep 1 percent). Tail-based sampling decides after outcomes (keep all errors, all slow requests, plus a small healthy sample). Tail sampling preserves interesting traces but needs more collector sophistication.",
          "Match sampling to risk: keep more for new releases, payment flows, low-volume admin actions, and active incidents; keep fewer for health checks. Security and financial transitions may require durable audit logs even when debug logs are gated.",
          "Lab: write a sampling policy table for checkout, catalog browse, and health checks."
        ],
        "keyTerms": [
          {
            "term": "Head-based sampling",
            "definition": "Keep-or-drop decision made at request start."
          },
          {
            "term": "Tail-based sampling",
            "definition": "Keep-or-drop decision after observing latency or errors."
          },
          {
            "term": "Exemplar",
            "definition": "A reference from an aggregate metric sample to a representative trace."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Aim for representative normals plus complete evidence for important abnormals."
        },
        "checkYourself": [
          {
            "prompt": "Why prefer tail sampling for rare checkout failures?",
            "reveal": "Head sampling may discard the rare failing traces you most need; tail sampling can retain all errors and slow requests by design."
          }
        ]
      },
      {
        "id": "checkout-dashboard-lab",
        "heading": "Worked lab: checkout incident dashboard",
        "paragraphs": [
          "Build a one-screen dashboard that answers: is checkout hurting users, where is time going, and which dependency is implicated? Top row: success ratio and latency SLIs with burn. Middle: saturation—queue depth, pool wait, CPU. Bottom: dependency error ratios and exemplar links into traces.",
          "Pair with a structured log event schema that includes trace ID, route, status, dependency, retry count, and a stable error class. Alert payloads should deep-link to the dashboard time range and a trace search.",
          "Practice an incident tabletop: inject a slow fraud dependency and confirm the dashboard lights the right panels without paging unrelated teams."
        ],
        "workedExample": {
          "title": "Correlated log event",
          "body": "A JSON log line that joins to traces and safe metrics.",
          "code": "{\n  \"ts\": \"2026-07-27T09:14:02.511Z\",\n  \"level\": \"ERROR\",\n  \"service\": \"checkout-api\",\n  \"trace_id\": \"4bf92f3577b34da6a3ce929d0e0e4736\",\n  \"route\": \"/checkout/pay\",\n  \"status\": 503,\n  \"error_class\": \"dependency_timeout\",\n  \"dependency\": \"fraud\",\n  \"retry_count\": 2,\n  \"latency_ms\": 2310,\n  \"region\": \"us-east\"\n}\n",
          "language": "json"
        },
        "callout": {
          "tone": "interview",
          "body": "Describe the path from alert → SLI panel → dependency row → trace → log fields in under a minute."
        },
        "checkYourself": [
          {
            "prompt": "What makes an alert payload on-call friendly?",
            "reveal": "It names the user promise burning, the population, links to the right dashboard window, and suggests the ownership path—not just a raw threshold breach."
          }
        ]
      },
      {
        "id": "observability-cost-and-governance",
        "heading": "Govern cost, retention, and ownership",
        "paragraphs": [
          "Observability systems fail operationally when nobody owns retention, sampling, and schema standards. Set budgets for metric series, trace volume, and log ingest. Review new high-cardinality proposals like schema changes.",
          "Align retention with purpose: short high-resolution metrics for paging, longer coarse metrics for trends, longer audit logs for security and finance, shorter debug logs.",
          "Closeout: assign owners for SLI metrics, trace pipeline, and log schema; schedule a monthly cardinality review."
        ],
        "callout": {
          "tone": "warning",
          "body": "Unlimited debug logging is a denial-of-wallet attack you run against yourself."
        },
        "checkYourself": [
          {
            "prompt": "Why separate audit log retention from debug log retention?",
            "reveal": "Audit events may be legally or financially durable requirements; debug volume is usually optional and should expire quickly to control cost."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Metrics, traces, and logs answer different questions—design accordingly.",
        "Correlation IDs must cross async boundaries to tell one story.",
        "Cardinality is a first-class cost; put entity detail in traces and logs.",
        "Sampling should preserve abnormals and representative normals.",
        "Dashboards and alert payloads should encode the path from symptom to cause."
      ],
      "nextSteps": [
        "Assign ten incident questions to signal types.",
        "Rewrite one high-cardinality metric to a safe label set.",
        "Sketch a one-screen checkout incident dashboard with exemplars."
      ]
    }
  },
  "reliability-observability-lab/failure-injection-and-incidents": {
    "title": "Workshop: Failure injection and incidents",
    "readingTime": "80-100 min",
    "premise": "Resilience claims are hypotheses until tested. This lab designs hypothesis-driven failure experiments, limits blast radius, reconstructs incident timelines, and writes action items that change system behavior—not blame.",
    "parts": [
      {
        "id": "hypothesis-driven-chaos",
        "heading": "Write failure experiments as hypotheses",
        "paragraphs": [
          "Useful failure injection tests a precise belief. Example: if recommendations time out for 30 seconds in one region, product pages still load within 500 ms with a fallback shelf, checkout stays unaffected, and payments are not paged. Name steady state, fault, blast radius, and expected protection.",
          "Control experiments like production changes: start in staging if representative, then one cell or tiny traffic slice. Set abort conditions on error-budget burn, queue growth, or user impact. Observe timeouts, retries, breakers, bulkheads, and fallbacks.",
          "Workshop: rewrite 'kill random pods' into three hypothesis-driven experiments with abort criteria."
        ],
        "keyTerms": [
          {
            "term": "Steady state",
            "definition": "The measurable user behavior that should hold during an experiment."
          },
          {
            "term": "Blast radius",
            "definition": "The intentional scope of impact for a fault or failure domain."
          },
          {
            "term": "Abort condition",
            "definition": "A threshold that stops an experiment to protect users."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If you cannot state the hypothesis, you are creating an outage, not an experiment."
        },
        "checkYourself": [
          {
            "prompt": "What distinguishes chaos engineering from breaking things randomly?",
            "reveal": "A stated steady-state hypothesis, controlled scope, observability of expected protections, and abort conditions tied to user harm."
          }
        ]
      },
      {
        "id": "blast-radius-and-bulkheads",
        "heading": "Design blast radius with bulkheads and cells",
        "paragraphs": [
          "Failure domains should be explicit. Cells limit a bad shard or tenant group from consuming shared dependencies. Bulkheads separate pools so slow analytics cannot starve login. Rate limits contain noisy clients. Separate queues for high- and low-priority work apply the same idea simply.",
          "Isolation costs utilization and complexity. Global pools are efficient but couple fate. Choose stronger isolation where harm is high: payments, auth, control planes, incident tooling.",
          "Lab: for a multi-tenant API, propose pool, queue, and cell boundaries and name the failure each boundary contains."
        ],
        "callout": {
          "tone": "interview",
          "body": "Ask aloud: what happens if this dependency is slow, this tenant is noisy, this region partitions, or this queue grows without bound?"
        },
        "checkYourself": [
          {
            "prompt": "Why isolate payment worker pools from email workers?",
            "reveal": "So a backlog or slow third-party email provider cannot exhaust threads or connections needed for payment-critical work."
          }
        ]
      },
      {
        "id": "injection-sketch-lab",
        "heading": "Worked lab: small-scope latency injection",
        "paragraphs": [
          "Sketch an experiment that adds 500 ms latency to a noncritical dependency for 1 percent of traffic in one region for fifteen minutes. Verify fallbacks, confirm critical paths unchanged, and watch burn rate.",
          "Include runbook steps: how to start, how to observe, how to abort, who is on point, and what success looks like. Experiments without runbooks become incidents with extra steps.",
          "Afterward, record whether reality matched the hypothesis. Mismatches are the learning product."
        ],
        "workedExample": {
          "title": "Latency injection experiment card",
          "body": "A compact experiment definition you could paste into a change ticket.",
          "code": "Experiment: recommendations_timeout_fallback\nHypothesis: If fraud? No — recommendations latency +500ms for 1% us-east\n  for 15m, then p95 product page <= 500ms with fallback shelf,\n  checkout success SLI unchanged, payments unpaged.\nSteady-state signals: product_page_p95, checkout_success_ratio, burn_rate\nFault: chaos middleware inject latency on dependency=recommendations\nScope: region=us-east, traffic=1%, exclude checkout routes\nAbort if: checkout burn > 5x for 5m OR error_ratio > 1%\nOwner: @product-api-oncall\nRollback: disable injection flag recommendations_chaos=off\n",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "Never inject on a dependency without knowing whether callers retry aggressively."
        },
        "checkYourself": [
          {
            "prompt": "What should you check about retries before injecting latency?",
            "reveal": "Whether retries multiply load, lack jitter, or ignore deadlines—injection can otherwise amplify into a self-inflicted overload."
          }
        ]
      },
      {
        "id": "incident-timeline",
        "heading": "Reconstruct timelines without blame",
        "paragraphs": [
          "Incident reviews reconstruct system behavior with timestamps: deploy, alert, metric shift, customer report, mitigation, recovery. Detection delay, diagnosis delay, and mitigation friction become visible.",
          "Separate facts from interpretation. Fact: checkout 5xx rose to 8 percent in us-east at 10:04. Interpretation: fraud pool exhaustion likely. Separation reduces blame and improves learning.",
          "Workshop: given a synthetic timeline, identify missing signals, misleading dashboards, unclear ownership, and the rollback that would have shortened impact."
        ],
        "keyTerms": [
          {
            "term": "Time to detect",
            "definition": "Delay from user impact start to reliable recognition."
          },
          {
            "term": "Time to mitigate",
            "definition": "Delay from recognition to effective user-impact reduction."
          },
          {
            "term": "Blameless review",
            "definition": "Analysis focused on systemic fixes rather than individual fault."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "A postmortem succeeds when future system behavior changes, not when a person is scolded."
        },
        "checkYourself": [
          {
            "prompt": "Why separate facts from interpretations in a timeline?",
            "reveal": "It keeps the record stable when early theories are wrong and focuses debate on evidence and systemic improvements."
          }
        ]
      },
      {
        "id": "action-items-that-bite",
        "heading": "Write action items that change outcomes",
        "paragraphs": [
          "Weak actions say 'be careful' or 'add monitoring.' Strong actions remove ambiguity or automate protection: add a 300 ms timeout and fallback; block rollouts when checkout burns above 5×; split worker pools; add a runbook command that drains a region safely. Each item needs owner, due date, verification, and a link to the failure mode.",
          "Prioritize by recurrence risk and impact. Track closure rates. Measure repeat incidents, detect/mitigate times, and manual steps removed.",
          "Lab: turn one timeline into three strong actions and one explicitly deferred item with rationale."
        ],
        "workedExample": {
          "title": "Postmortem action template",
          "body": "Convert learning into verifiable system changes.",
          "code": "Action: Add 300ms timeout + cached fallback around recommendations\nFailure mode: product page critical path blocked by optional dependency\nOwner: team-product-api\nDue: 2026-08-10\nVerify: failure-injection experiment card passes; p95 holds under +500ms fault\nRelated: incident INC-2147\n\nDeferred: multi-region active-active for recommendations\nWhy defer: optional dependency; timeout/fallback removes user harm cheaper first\n",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "Prefer actions that encode constraints into the system over actions that only train humans to remember."
        },
        "checkYourself": [
          {
            "prompt": "What makes an incident action item strong?",
            "reveal": "It is specific, owned, dated, tied to a failure mode, and verifiable—ideally by automation or a repeatable experiment."
          }
        ]
      },
      {
        "id": "degradation-and-status-comms",
        "heading": "Design degradation paths and status updates",
        "paragraphs": [
          "Failure injection should prove degradation paths: explicit partial responses, feature flags that disable noncritical modules, and user-visible honesty when freshness drops. A silent empty page is worse than a labeled fallback.",
          "Practice status updates that separate user impact, current mitigation, and next update time. Vague updates destroy trust; overly technical updates confuse.",
          "Closeout tabletop: inject queue backlog, execute runbook, send two status updates, and file actions."
        ],
        "callout": {
          "tone": "warning",
          "body": "A fallback that is never tested is fiction—and fiction fails during the real incident."
        },
        "checkYourself": [
          {
            "prompt": "What belongs in an external status update during degradation?",
            "reveal": "Who is affected, what works or does not, what mitigation is in progress, and when the next update will arrive—without speculative blame."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Failure injection needs hypotheses, scope, and abort conditions.",
        "Blast-radius design uses cells, bulkheads, and priority separation.",
        "Timelines separate facts from interpretations to enable learning.",
        "Strong actions automate protection and are verified, not aspirational.",
        "Degradation paths and status communication are part of resilience design."
      ],
      "nextSteps": [
        "Write one experiment card with abort conditions.",
        "Propose bulkhead boundaries for a noisy multi-tenant dependency.",
        "Convert a sample incident into three verifiable action items."
      ]
    }
  }
};
