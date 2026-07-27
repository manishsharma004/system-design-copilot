/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldSecurityOperationsLabChapters = {
  "security-operations-lab/auth-threat-modeling-for-hld": {
    "title": "Workshop: Auth threat modeling for HLD",
    "readingTime": "75-95 min",
    "premise": "Authentication diagrams that ignore recovery, abuse, and operators are incomplete. This lab threat-models identity journeys end to end, places authn/authz on every hop, and designs controls that serve both security and availability.",
    "parts": [
      {
        "id": "scope-the-identity-surface",
        "heading": "Scope the full identity attack surface",
        "paragraphs": [
          "Primary login is only one path. Password reset, magic links, invite acceptance, email change, MFA enrollment, OAuth linking, and support impersonation are privileged workflows attackers prefer because they are often underdesigned. Threat-model them first for architectural leverage.",
          "Draw assets (sessions, tokens, recovery codes), actors (user, attacker, malicious insider, automated abuse), and entry points. Include mobile deep links and email as channels that can be intercepted or phished.",
          "Workshop: list ten identity-related endpoints and mark which can mint or elevate a session."
        ],
        "keyTerms": [
          {
            "term": "Threat model",
            "definition": "A structured enumeration of assets, actors, entry points, and mitigations."
          },
          {
            "term": "Session minting",
            "definition": "Any flow that creates authenticated credentials or tokens."
          },
          {
            "term": "Account recovery",
            "definition": "Flows that restore access when primary credentials are unavailable."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If a flow can change email or reset password, treat it as powerful as login."
        },
        "checkYourself": [
          {
            "prompt": "Why are recovery flows high-value targets?",
            "reveal": "They can bypass strong primary login controls and mint sessions if one-time tokens, rate limits, or binding checks are weak."
          }
        ]
      },
      {
        "id": "threat-model-workbook",
        "heading": "Worked lab: STRIDE-style workbook for HLD",
        "paragraphs": [
          "For each critical flow, walk spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege. Keep mitigations architectural: one-time semantics, audience-bound tokens, short TTL, step-up auth, audit trails—not only 'use HTTPS.'",
          "Prioritize by attacker effort versus impact. Credential stuffing on login and token replay on APIs often beat exotic crypto bugs in practice.",
          "Deliverable: a one-page threat model for password reset and for service-to-service calls."
        ],
        "workedExample": {
          "title": "Password-reset threat model sketch",
          "body": "Map threats to architectural mitigations.",
          "code": "Flow: password reset\nAsset: account takeover via session/password change\nThreats -> Mitigations\n  Spoofing user email channel -> notify old email; show reset request alerts\n  Token steal from inbox/logs -> high-entropy one-time token, short TTL,\n                                single-use, bind to user+request id\n  Enumeration of accounts -> constant-time responses; generic messages\n  Replay -> mark token consumed atomically; rotate session IDs on success\n  DoS / stuffing -> per-account and per-IP rate limits; backoff; captcha escalate\n  Insider misuse of support tools -> step-up, reason codes, immutable audit\n",
          "language": "text"
        },
        "callout": {
          "tone": "interview",
          "body": "Walk one flow from actor to mitigation without drowning in framework acronyms."
        },
        "checkYourself": [
          {
            "prompt": "What does single-use mean operationally for a reset token?",
            "reveal": "The server atomically marks the token consumed on first successful use (or attempted use policy), so replays fail even if the link leaks afterward."
          }
        ]
      },
      {
        "id": "zero-trust-hops",
        "heading": "Push authn and authz onto every hop",
        "paragraphs": [
          "Centralized token validation at a gateway confirms identity and coarse scopes, but fine authorization usually needs resource and tenant context known by the service. Workload identity continues the pattern inside the mesh instead of trusting the network fabric.",
          "Design explicit trust boundaries: browser → edge → service → data. Each hop authenticates the caller and authorizes the action. Service accounts get least privilege, not a shared superuser key.",
          "Lab: redraw a monolith-split payment path with user tokens at the edge and workload identity between services; mark where tenant checks must occur."
        ],
        "keyTerms": [
          {
            "term": "Authentication",
            "definition": "Proving who or what is calling."
          },
          {
            "term": "Authorization",
            "definition": "Deciding whether that caller may perform an action on a resource."
          },
          {
            "term": "Workload identity",
            "definition": "Credentials for services/machines distinct from human users."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "A valid token is not blanket permission—resource ownership checks still belong in the domain service."
        },
        "checkYourself": [
          {
            "prompt": "Why can gateway-only authz be insufficient?",
            "reveal": "The gateway often lacks object-level context (which invoice belongs to which tenant) that the owning service knows; without local checks, IDOR-style bugs follow."
          }
        ]
      },
      {
        "id": "abuse-meets-reliability",
        "heading": "Design for abuse as an availability threat",
        "paragraphs": [
          "Credential stuffing, OTP bombing, and enumeration are availability incidents as well as security incidents. Rate limits, deduplication, device reputation, and suspicious-activity telemetry serve both goals.",
          "Protect login and recovery with budgets that preserve legitimate users: per-account limits, IP/ASN limits, progressive challenges, and endpoint isolation so auth abuse cannot starve checkout.",
          "Workshop: write rate-limit classes for `/login`, `/reset`, and `/token` refresh with user-visible error behavior."
        ],
        "callout": {
          "tone": "tip",
          "body": "Put auth endpoints on isolated capacity so stuffing cannot take down the whole site."
        },
        "checkYourself": [
          {
            "prompt": "How does auth abuse become a reliability incident?",
            "reveal": "High-volume failed logins and resets can exhaust CPU, downstream email/SMS providers, and shared databases, causing legitimate users to fail."
          }
        ]
      },
      {
        "id": "operator-and-break-glass",
        "heading": "Model operator and break-glass paths",
        "paragraphs": [
          "Support tools and break-glass access deliberately bypass normal constraints. They are often the most dangerous paths. Require step-up authentication, ticket linkage, time-bounded elevation, dual control for sensitive actions, and immutable audit.",
          "Impersonation should be explicit in session metadata and visible in product audit logs for the affected customer where policy allows.",
          "Lab: design a support impersonation flow with controls and a detection signal for misuse."
        ],
        "callout": {
          "tone": "interview",
          "body": "Say that operator paths are first-class architecture, not embarrassing exceptions."
        },
        "checkYourself": [
          {
            "prompt": "What audit fields matter for support impersonation?",
            "reveal": "Operator identity, reason/ticket, target account, start/end time, actions performed, and whether step-up succeeded—stored immutably."
          }
        ]
      },
      {
        "id": "auth-review-closeout",
        "heading": "Lab closeout: auth architecture review",
        "paragraphs": [
          "Present identity surface, threat-model sheets, hop-by-hop trust, abuse controls, and operator paths. List residual risks accepted with product sign-off.",
          "Tie to SLOs: auth availability and latency matter; security controls that accidentally deny everyone are outages.",
          "Success: an interviewer can pick any session-minting flow and you can name top threats and mitigations without redrawing from scratch."
        ],
        "callout": {
          "tone": "warning",
          "body": "Security reviews that only inspect the happy-path login box miss the flows attackers actually use."
        },
        "checkYourself": [
          {
            "prompt": "What residual risk documentation should include?",
            "reveal": "The threat, why it is accepted for now, compensating detections, and a revisit date—not silence."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Threat-model all session-minting and recovery flows, not only login.",
        "Authn and authz belong on every hop with least privilege.",
        "Abuse controls are dual security and reliability features.",
        "Operator and break-glass paths need step-up, bounds, and audit.",
        "Document residual risks with owners and revisit dates."
      ],
      "nextSteps": [
        "Inventory session-minting endpoints for one product.",
        "Complete a reset-flow threat model with mitigations.",
        "Design rate limits and isolation for auth endpoints."
      ]
    }
  },
  "security-operations-lab/encryption-secrets-and-tenancy": {
    "title": "Workshop: Encryption, secrets, and tenancy",
    "readingTime": "70-90 min",
    "premise": "Crypto and tenancy fail as systems problems, not only algorithm choices. This lab places encryption in transit and at rest, designs secret lifecycles, and enforces tenant isolation as an architectural invariant with tests.",
    "parts": [
      {
        "id": "encryption-in-the-path",
        "heading": "Place encryption in transit and at rest",
        "paragraphs": [
          "TLS between clients and edge is necessary but incomplete. Service meshes or mTLS, database TLS, and encrypted disk/snapshots address different hops. Know what is protected against network eavesdroppers versus stolen disks versus curious operators.",
          "Application-level encryption of specific fields (PII, payment references) adds defense when storage access is broader than application access—but key access then becomes the crown jewel.",
          "Workshop: for a request path browser → API → DB → object storage, mark what encryption exists at each hop and what threat it counters."
        ],
        "keyTerms": [
          {
            "term": "Encryption in transit",
            "definition": "Protecting data while moving across a network."
          },
          {
            "term": "Encryption at rest",
            "definition": "Protecting stored bytes on disk, volume, or object storage."
          },
          {
            "term": "Envelope encryption",
            "definition": "Encrypting data keys with a master key to simplify rotation and scale."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Always pair 'we encrypt' with 'against which attacker and which hop.'"
        },
        "checkYourself": [
          {
            "prompt": "What does disk encryption not stop?",
            "reveal": "An attacker who gains application or database credentials and queries live data through normal interfaces."
          }
        ]
      },
      {
        "id": "secrets-lifecycle",
        "heading": "Design the secrets lifecycle",
        "paragraphs": [
          "Secrets need creation, distribution, storage, rotation, revocation, and audit. Hardcoded config and long-lived shared keys fail multiple lifecycle stages at once. Prefer short-lived credentials from a platform identity when possible.",
          "Rotation without downtime requires dual-accept windows: issuers mint new secrets while verifiers accept old and new until cutover. Document who can read each secret and why.",
          "Lab: sketch rotation for a database password and for a JWT signing key, including abort steps."
        ],
        "workedExample": {
          "title": "JWT signing-key rotation sketch",
          "body": "Dual-accept window for asymmetric signing keys.",
          "code": "1. Generate new key pair kid=2026-07-b in KMS/HSM\n2. Publish JWKS including both 2026-07-a and 2026-07-b\n3. Verifiers fetch JWKS; accept either kid\n4. Issuers switch to sign with 2026-07-b\n5. Wait max token TTL (+ clock skew)\n6. Remove 2026-07-a from JWKS; disable private key material\nAbort: if verification error rate rises, keep both keys and roll back issuer\n",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "A secret in logs, crash dumps, or CI artifacts is a secret you have already lost."
        },
        "checkYourself": [
          {
            "prompt": "Why publish both old and new verification keys during rotation?",
            "reveal": "So tokens minted before the issuer switch remain valid until they expire, avoiding a fleet-wide auth outage."
          }
        ]
      },
      {
        "id": "key-management-boundaries",
        "heading": "Draw key management and access boundaries",
        "paragraphs": [
          "Separate duties: key admins, application roles that decrypt, and operators who manage infrastructure without reading plaintext secrets. Hardware or managed KMS helps only if IAM policies and audit logs are strict.",
          "Envelope encryption lets you rotate master keys without re-encrypting all data immediately by rewrapping data keys. Plan rewrap jobs and failure modes.",
          "Workshop: write IAM-style rules for who can encrypt, decrypt, rotate, and administer keys for PII fields."
        ],
        "callout": {
          "tone": "interview",
          "body": "Explain envelope encryption as operational leverage for rotation and blast-radius control."
        },
        "checkYourself": [
          {
            "prompt": "What blast radius does a leaked data key create versus a leaked master key?",
            "reveal": "A data key usually unlocks one object or small set; a master key may unwrap many data keys—so master keys need stronger protection and narrower access."
          }
        ]
      },
      {
        "id": "tenancy-isolation-invariants",
        "heading": "Enforce tenancy as an invariant",
        "paragraphs": [
          "Multi-tenant systems fail spectacularly when queries omit tenant predicates or when object storage keys are guessable across tenants. Isolation can be row-level, schema-level, or cluster-level; choose based on compliance, noisy-neighbor, and cost constraints.",
          "Defense in depth: authenticate tenant context from trusted tokens (not client-supplied tenant IDs alone), enforce in data access layers, and add automated tests that attempt cross-tenant reads.",
          "Lab: design storage key layout and query helpers that make cross-tenant access hard to express by accident."
        ],
        "keyTerms": [
          {
            "term": "Tenant context",
            "definition": "The authenticated organization/customer scope attached to a request."
          },
          {
            "term": "IDOR",
            "definition": "Insecure direct object reference—accessing another user's object by guessing an ID."
          },
          {
            "term": "Noisy neighbor",
            "definition": "One tenant consuming shared resources to others' detriment."
          }
        ],
        "workedExample": {
          "title": "Cross-tenant test cases",
          "body": "Minimum automated checks for tenancy isolation.",
          "code": "# Pseudocode tests\nassert api.get(/orders/ORDER_B, auth=tenant_A) == 404_or_403\nassert db.query(orders).without_tenant_scope()  # lint/fail in CI\nassert s3_key.startswith(f\"tenants/{tenant_id}/\")\nassert search.query filters tenant_id from token, not body alone\nassert metrics/logs redact cross-tenant identifiers appropriately\n",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "UI hiding is not tenant isolation—APIs and data layers must enforce it."
        },
        "checkYourself": [
          {
            "prompt": "Why must tenant ID come from authenticated context rather than only the request body?",
            "reveal": "Attackers can change body fields; binding authorization to verified token claims prevents trivial cross-tenant access."
          }
        ]
      },
      {
        "id": "data-classification-and-retention",
        "heading": "Classify data and align retention",
        "paragraphs": [
          "Not all fields deserve the same encryption and retention. Classify secrets, PII, financial data, and public content. Retention and deletion pipelines must reach primary stores, backups, logs, and derived indexes—or deletion is theater.",
          "Logging systems often become accidental PII stores. Redact at source; treat debug captures as sensitive.",
          "Workshop: pick five log fields in an auth service and mark keep, hash, or drop."
        ],
        "callout": {
          "tone": "tip",
          "body": "Deletion SLOs matter as much as backup SLOs for sensitive data."
        },
        "checkYourself": [
          {
            "prompt": "Where does 'delete user' often fail in polyglot systems?",
            "reveal": "Backups, search indexes, analytics warehouses, caches, and logs that still hold copies after the primary row is gone."
          }
        ]
      },
      {
        "id": "secrets-tenancy-review",
        "heading": "Lab closeout: encryption and tenancy review",
        "paragraphs": [
          "Present hop encryption, secret lifecycle diagrams, key access boundaries, tenant isolation tests, and retention gaps. Accept residual risks explicitly.",
          "Connect to incidents: key compromise and cross-tenant bugs need runbooks as much as latency pages do.",
          "Success: you can explain how a stolen disk, a stolen DB credential, and a buggy query differ in blast radius and mitigation."
        ],
        "callout": {
          "tone": "interview",
          "body": "Compare three attacker capabilities and show which encryption layer stops each."
        },
        "checkYourself": [
          {
            "prompt": "What runbook step comes first on suspected key compromise?",
            "reveal": "Revoke/rotate the affected key material, invalidate dependent sessions/credentials, assess blast radius via audit logs, then re-issue—order depends on key type but speed of revocation is critical."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Name the hop and attacker each encryption layer addresses.",
        "Secrets need full lifecycle design including dual-accept rotation.",
        "Key access boundaries define real blast radius.",
        "Tenancy isolation requires trusted context and automated cross-tenant tests.",
        "Retention and deletion must span every store that holds copies."
      ],
      "nextSteps": [
        "Map encryption by hop for one critical path.",
        "Write a signing-key or DB password rotation plan.",
        "Add three automated cross-tenant negative tests."
      ]
    }
  },
  "security-operations-lab/safe-change-dr-and-degradation": {
    "title": "Workshop: Safe change, DR, and degradation",
    "readingTime": "80-100 min",
    "premise": "Most outages are change-driven, and many disasters are unrehearsed. This lab designs safe rollout controls, disaster-recovery objectives you can test, and degradation modes that keep core promises when the world shrinks.",
    "parts": [
      {
        "id": "safe-change-pipeline",
        "heading": "Make change a controlled system",
        "paragraphs": [
          "Safe change separates deploy from release: progressive delivery, health-gated ramps, automatic rollback, and change calendars for high risk. Batch size and blast radius matter more than ceremony theater.",
          "Classify changes: config, schema, code, capacity, and data backfills each need different gates. Schema and data changes often need expand-contract discipline from the systems lab.",
          "Workshop: write gate criteria for a checkout code push versus a datastore parameter change."
        ],
        "keyTerms": [
          {
            "term": "Progressive delivery",
            "definition": "Releasing to expanding cohorts while watching health signals."
          },
          {
            "term": "Automatic rollback",
            "definition": "Reverting a release when hard health gates fail without waiting for debate."
          },
          {
            "term": "Change blast radius",
            "definition": "How much traffic, data, or geography a change can affect."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "If rollback is untested, you do not have a rollback—you have a hope."
        },
        "checkYourself": [
          {
            "prompt": "Why gate ramps on SLO burn rather than only CPU?",
            "reveal": "CPU can look fine while user success ratio burns; SLO-aligned gates match the user promise."
          }
        ]
      },
      {
        "id": "dr-objectives-that-are-real",
        "heading": "Write RPO/RTO that can be rehearsed",
        "paragraphs": [
          "Recovery Point Objective is how much data loss is acceptable; Recovery Time Objective is how fast service must return. Fancy DR diagrams without tested RPO/RTO are fiction. Measure restore time from real backups, not brochure numbers.",
          "Tier dependencies: auth and payments may need tighter RTO than recommendation shelves. Align backups, multi-AZ/region topology, and runbooks to those tiers.",
          "Lab: set RPO/RTO for three services and name the last successful restore test date—or admit it is unknown."
        ],
        "workedExample": {
          "title": "DR objective card",
          "body": "Make objectives testable.",
          "code": "Service: checkout-api + payments-db\nRPO: <= 1 minute (sync or near-sync standby)\nRTO: <= 15 minutes to accept payments in failover region\nLast restore/failover rehearsal: 2026-06-12 (took 22m — GAP)\nGaps: client rediscovery TTL too long; runbook missing fencing step\nNext rehearsal: 2026-08-01 with success criteria RTO met twice\n",
          "language": "text"
        },
        "callout": {
          "tone": "warning",
          "body": "Untested backups fail at the worst possible time—often silently for months."
        },
        "checkYourself": [
          {
            "prompt": "What is the difference between RPO and RTO?",
            "reveal": "RPO bounds acceptable data loss; RTO bounds acceptable time until service is usable again."
          }
        ]
      },
      {
        "id": "degradation-modes",
        "heading": "Design degradation before disaster",
        "paragraphs": [
          "Degradation keeps core promises when dependencies fail: read-only mode, cached catalogs, delayed fulfillment messaging, disabled noncritical modules. Product and engineering must agree which features are optional under stress.",
          "Wire degradation to flags and bulkheads tested via failure injection. User messaging should be honest.",
          "Workshop: define what 'checkout degraded' means—what still works, what is paused, what users see."
        ],
        "callout": {
          "tone": "interview",
          "body": "List features you would shed first and how users learn about it."
        },
        "checkYourself": [
          {
            "prompt": "Why agree degradation with product ahead of time?",
            "reveal": "During incidents there is no time to negotiate which promises to break; pre-agreed modes prevent chaotic ad-hoc decisions."
          }
        ]
      },
      {
        "id": "data-plane-vs-control-plane",
        "heading": "Protect control planes and recovery paths",
        "paragraphs": [
          "DR fails when the tools needed to recover share fate with the outage: identity provider, DNS admin, deploy system, or runbook wiki in the same region. Separate control-plane dependencies and keep break-glass credentials offline-accessible under policy.",
          "Health checks should prove real readiness, not only process liveness, without becoming a self-DoS.",
          "Lab: list dependencies required to execute failover and mark which are co-located with the failure domain."
        ],
        "keyTerms": [
          {
            "term": "Control plane",
            "definition": "Systems used to configure, deploy, and recover the data plane."
          },
          {
            "term": "Data plane",
            "definition": "Systems that serve user traffic and store business data."
          },
          {
            "term": "Break-glass",
            "definition": "Emergency access procedure with extra audit for recovery operations."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If DNS and IdP are down with your region, your failover story may be stuck before it starts."
        },
        "checkYourself": [
          {
            "prompt": "Name a control-plane dependency that often shares fate with regional outages.",
            "reveal": "Regional deploy systems, console access, DNS management endpoints, or documentation hosted in the same region are common examples."
          }
        ]
      },
      {
        "id": "rehearsal-and-game-days",
        "heading": "Rehearse with game days",
        "paragraphs": [
          "Schedule restore tests and failover game days with success criteria, observers, and action items. Treat missed RTO as a defect. Alternate between announced drills and smaller surprise injections.",
          "Capture time to detect, time to decide, and time to mitigate. Improve runbooks until a cold on-call can execute them.",
          "Workshop: plan a two-hour game day agenda for database failover including communication drills."
        ],
        "callout": {
          "tone": "tip",
          "body": "The first rehearsal finds the missing runbook step; the second proves you fixed it."
        },
        "checkYourself": [
          {
            "prompt": "What artifact should a game day always produce?",
            "reveal": "A timeline, gaps versus RPO/RTO, and owned action items with verification—same discipline as a real incident review."
          }
        ]
      },
      {
        "id": "safe-change-dr-closeout",
        "heading": "Lab closeout: resilience operations package",
        "paragraphs": [
          "Combine progressive delivery gates, DR cards, degradation modes, control-plane dependencies, and rehearsal calendar into one package stakeholders can fund.",
          "Connect to error budgets: burn during changes should trigger tighter gates; healthy budgets allow faster ramps.",
          "Success: you can answer how a bad config, a region loss, and a dependency outage each degrade without total silence."
        ],
        "callout": {
          "tone": "interview",
          "body": "Tie change safety, DR, and degradation into one narrative about preserving user promises under stress."
        },
        "checkYourself": [
          {
            "prompt": "How do error budgets interact with change policy?",
            "reveal": "When budgets burn, progressive delivery should slow or freeze risky launches; when healthy, velocity can increase within agreed policy."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Safe change uses progressive delivery, health gates, and tested rollback.",
        "RPO/RTO are meaningful only with rehearsed restores and failovers.",
        "Degradation modes preserve core promises with honest UX.",
        "Control planes must not share fate with the failures they recover from.",
        "Game days turn DR diagrams into measured capability."
      ],
      "nextSteps": [
        "Write ramp/rollback gates for one critical service.",
        "Fill DR cards with last rehearsal dates and gaps.",
        "Define a named degradation mode with user messaging."
      ]
    }
  }
};
