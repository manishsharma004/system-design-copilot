const chapters = {
  "ai-agents/agent-fundamentals": {
    title: "Chapter: Agent fundamentals as production systems",
    readingTime: "65-80 min",
    premise:
      "A production AI agent is not a long prompt with ambition. It is a bounded system that combines a model policy, explicit state, typed tools, runtime budgets, traces, guardrails, and evaluation loops. This chapter teaches the core mental model used by mid-2026 agent teams: build the smallest autonomous controller that earns its complexity, instrument every step, and keep humans and deterministic workflows in the design when risk requires them.",
    parts: [
      {
        id: "agent-as-controller",
        heading: "An agent is a controller around a model, not the model itself",
        paragraphs: [
          "In production language, an agent is a control loop that observes a task state, asks a policy to choose the next action, executes that action through a constrained interface, records the result, and repeats until a stop condition fires. The policy is often an LLM, but the system includes much more than model weights: routing logic, tool catalogs, memory stores, budget counters, approval states, trace collection, and error handling. If those parts are invisible, the agent is not simpler; it is merely uncontrolled.",
          "This framing keeps autonomy proportional to the problem. A password reset flow with known steps should be a workflow with perhaps one LLM classification step, not a free-running agent that decides which account operations to perform. A procurement research task, a messy incident triage, or a support case that branches on many observations may benefit from agentic control because the next step depends on what was just learned. The engineering question is not whether agents are modern; it is whether runtime choice improves success enough to justify variance, cost, and audit burden.",
          "By 2026, mature teams describe agents as graphs or state machines before they write prompts. The state includes goal, user context, permissions, working notes, selected tools, observations, approvals, cost so far, and a stop reason. Each transition has a contract: what inputs the policy sees, what outputs are allowed, which tool executor validates them, and what happens on timeout or malformed arguments. This is the same discipline used for distributed systems, with the added complication that one component speaks probabilistically."
        ],
        keyTerms: [
          {
            term: "agent runtime",
            definition:
              "The orchestration layer that manages state, model calls, tool execution, budgets, traces, and termination."
          },
          {
            term: "policy",
            definition:
              "The decision function, often an LLM prompt plus model configuration, that selects the next action from the current state."
          },
          {
            term: "stop condition",
            definition:
              "A hard rule that ends the loop, such as task success, failure, human handoff, step limit, token budget, or wall-clock deadline."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Why is an agent better described as a stateful controller than as a single LLM prompt?",
            reveal:
              "Because production behavior depends on state, tool contracts, validation, approvals, budgets, and traces. The LLM chooses actions, but the runtime decides what actions are legal and when the task must stop."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "A strong interview answer starts with the control loop, then immediately names boundaries: tools, state, budgets, evals, and human escalation."
        }
      },
      {
        id: "state-and-memory",
        heading: "State and memory determine reliability",
        paragraphs: [
          "Agent state is the difference between deliberate progress and repeated guessing. Short-term state holds the active objective, recent model messages, tool outputs, intermediate artifacts, and budget counters. Long-term memory stores durable facts such as user preferences, prior decisions, or reusable documents. These stores need different controls. Working state can be verbose and temporary; durable memory must be sparse, consent-aware, searchable, correctable, and governed by retention policy.",
          "The hardest memory bugs are not missing memories; they are wrong memories that become future instructions. A malicious document can ask the agent to remember a false rule, a stale project summary can override current requirements, or a user preference can leak across tenants. Production agents therefore separate observations from instructions, mark retrieved content as untrusted unless promoted by policy, summarize before persistence, and expose deletion or correction paths. Memory is a product and privacy feature, not a convenience cache.",
          "State should also be replayable. When an agent makes a surprising decision, engineers need to reconstruct the run: initial request, policy version, model id, selected tools, arguments, observations, approvals, state mutations, and stop reason. Replayable state supports debugging, eval generation, incident response, and governance review. Without it, teams argue about transcripts; with it, they can add a regression case and prove that a fix changes the trajectory."
        ],
        keyTerms: [
          {
            term: "working state",
            definition:
              "Temporary task context used during a single run, including observations, intermediate artifacts, and budget counters."
          },
          {
            term: "durable memory",
            definition:
              "Persisted information reused across runs, controlled by write policies, retention, privacy rules, and correction workflows."
          },
          {
            term: "memory poisoning",
            definition:
              "An attack or defect where untrusted content is stored and later treated as reliable instruction or fact."
          }
        ],
        workedExample: {
          title: "Minimal state record for an agent run",
          body:
            "This is intentionally small: the point is to show the categories a runtime must preserve for replay and evaluation.",
          code:
            "run_state = {\n    \"goal\": \"summarize incident tickets\",\n    \"policy_version\": \"triage-agent-v8\",\n    \"budget\": {\"max_steps\": 6, \"steps_used\": 2},\n    \"observations\": [\n        {\"tool\": \"ticket_search\", \"ids\": [\"INC-42\", \"INC-43\"]}\n    ],\n    \"memory_writes\": [],\n    \"stop_reason\": None,\n}\n\nrun_state[\"observations\"].append({\"tool\": \"summarizer\", \"summary_id\": \"S-9\"})\nrun_state[\"budget\"][\"steps_used\"] += 1\nrun_state[\"stop_reason\"] = \"needs_human_review\"\nprint(run_state)",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Name two controls that make durable agent memory safer than simply appending every conversation.",
            reveal:
              "Use explicit write policies and retention rules, and treat stored text as untrusted data unless it has been validated or approved. Summarization, tenant isolation, correction flows, and memory-poisoning tests are also important."
          }
        ]
      },
      {
        id: "planning-patterns",
        heading: "Planning patterns are choices about control and observability",
        paragraphs: [
          "Common patterns include ReAct-style interleaving, plan-then-execute, reflection, workflow graphs with LLM nodes, and multi-agent role splits. ReAct is useful when the policy must alternate between reasoning and observation, such as searching, reading, and deciding what to inspect next. Plan-then-execute improves inspectability because the agent produces a proposed path before acting, but it can become brittle when the environment changes. Workflow graphs are often the production winner: deterministic edges own the control plane, while the model handles narrow judgment points.",
          "Multi-agent systems deserve special skepticism. Splitting planner, researcher, writer, critic, and executor roles can reduce single-model blind spots when the task benefits from independent review. It also creates coordination cost, inconsistent shared state, extra latency, more tokens, and harder incident reconstruction. In production, multi-agent designs should pass typed artifacts between roles, assign responsibility for each role's decisions, and measure whether the committee beats a simpler well-tooled agent in trajectory evals.",
          "The practical pattern is to start from a task graph, not from a framework. Mark the nodes that are deterministic, the nodes that require language judgment, the nodes with side effects, and the nodes that require approval. Add agentic loops only around the genuinely uncertain portions. This avoids the common anti-pattern where a model is asked to rediscover a fixed business process on every request while operations teams absorb the cost of nondeterminism."
        ],
        keyTerms: [
          {
            term: "ReAct loop",
            definition:
              "A pattern that alternates model reasoning, tool action, and observation so the next step can respond to new evidence."
          },
          {
            term: "workflow graph",
            definition:
              "A deterministic orchestration graph that can include model calls at specific decision nodes without giving the model full control."
          },
          {
            term: "typed artifact",
            definition:
              "A structured output, such as JSON or a task object, passed between agent roles instead of unbounded prose."
          }
        ],
        checkYourself: [
          {
            prompt:
              "When should a team prefer a workflow graph with LLM nodes over a free-form autonomous loop?",
            reveal:
              "When the main path and approval points are known. The graph gives deterministic control, easier auditing, and lower variance while still using the model where judgment is valuable."
          }
        ]
      },
      {
        id: "tool-contracts-and-privileges",
        heading: "Agents act through contracts and privileges",
        paragraphs: [
          "Tools are the agent's hands, so tool design is the security and reliability boundary. A useful tool contract has a stable name, a narrow purpose, typed arguments, validation rules, clear errors, structured outputs, timeout behavior, idempotency expectations, and an authorization model that does not trust model text. If a model calls `refund_customer`, the executor still checks the user, account, amount, policy, idempotency key, and approval state before money moves.",
          "MCP-style tool discovery and similar internal protocols made this discipline more visible by 2026. A host can discover tool names, schemas, resource capabilities, and server boundaries rather than hard-coding ad hoc adapters for every model. The protocol does not solve trust by itself. Tool servers still need scoped credentials, egress limits, output sanitation, versioning, audit logs, and independent contract tests. Standardization helps because it gives security and platform teams one place to enforce policy.",
          "Tool outputs must be treated as data, not as fresh instructions. A retrieved web page, email, PDF, or command output can contain indirect prompt injection that asks the agent to ignore prior rules or leak secrets. The runtime should label tool observations, strip or quarantine dangerous content when possible, and keep privileged instructions outside the text channel that untrusted documents can influence. Tool contracts are therefore both API design and prompt-injection defense."
        ],
        keyTerms: [
          {
            term: "tool contract",
            definition:
              "The schema, permissions, validation rules, output format, errors, and side-effect guarantees for a callable capability."
          },
          {
            term: "idempotency key",
            definition:
              "A unique request key that lets a mutating tool safely return the same result on retry instead of duplicating a side effect."
          },
          {
            term: "indirect prompt injection",
            definition:
              "Malicious instructions hidden in content returned by tools, retrieval, or browsing and then fed back to the model."
          }
        ],
        workedExample: {
          title: "Server-side validation before executing a mutating tool",
          body:
            "The model proposes arguments, but the executor owns authorization, approval, and idempotency.",
          code:
            "executed = {}\n\ndef issue_refund(args, caller, approvals, idem_key):\n    if idem_key in executed:\n        return executed[idem_key]\n    if caller.get(\"role\") != \"support_manager\":\n        raise PermissionError(\"caller cannot refund\")\n    if args.get(\"amount_cents\", 0) > 5000 and \"finance\" not in approvals:\n        raise PermissionError(\"large refund needs finance approval\")\n    if not isinstance(args.get(\"account_id\"), str):\n        raise ValueError(\"account_id required\")\n    result = {\"status\": \"queued\", \"account_id\": args[\"account_id\"]}\n    executed[idem_key] = result\n    return result\n\nprint(issue_refund({\"account_id\": \"A-7\", \"amount_cents\": 1200}, {\"role\": \"support_manager\"}, [], \"r1\"))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why is the model never the authorization boundary for a tool call?",
            reveal:
              "The model can be wrong, manipulated, or asked to impersonate authority. The tool executor must enforce identity, permission, approval, validation, and side-effect rules in code."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "If a side-effecting tool is not safe to expose as a normal internal API, it is not safe to expose to an agent."
        }
      },
      {
        id: "budgets-traces-and-operations",
        heading: "Budgets, traces, and operations make autonomy shippable",
        paragraphs: [
          "Every production agent needs budgets: maximum steps, tokens, tool calls, wall-clock time, parallel branches, spend per task, and sometimes risk score. Budgets should stop the runtime, not merely appear in a prompt. A model that is told to be concise can still loop; a runtime that refuses the seventh tool call cannot. Budget breaches should produce clear stop reasons, safe user messages, and monitoring events so operators can see whether failures cluster around certain intents or tools.",
          "Traces are the operational record of agent behavior. A useful trace captures spans for model calls, tool calls, retrieval, guardrail checks, approvals, retries, and memory writes. Attributes include model id, policy version, tool name, argument validation result, latency, token count, error class, cache hits, cost estimate, and stop reason. OpenTelemetry GenAI conventions and vendor trace tools have made this more consistent, but the principle is the same as microservices: you cannot debug what you did not observe.",
          "Operations also includes kill switches, degraded modes, runbooks, and incident learning. If a research agent loops on a vendor outage, disable the failing tool or switch to read-only mode. If a support agent tries to send unauthorized emails, block that tool class and add the trajectory to red-team evals. Agent incidents should produce new tests, tighter contracts, or different approval rules, not just a stronger sentence in the system prompt."
        ],
        keyTerms: [
          {
            term: "trajectory trace",
            definition:
              "A structured record of the model calls, tool calls, observations, guardrails, and stop reason for one agent run."
          },
          {
            term: "runtime budget",
            definition:
              "A hard execution limit enforced by the orchestrator, such as max steps, max tokens, or max spend."
          },
          {
            term: "degraded mode",
            definition:
              "A safer fallback behavior, such as read-only, retrieval-only, or human-only operation during incidents."
          }
        ],
        checkYourself: [
          {
            prompt:
              "List four trace attributes you would want when debugging a failed agent run.",
            reveal:
              "Examples include policy version, model id, tool names, validated arguments, tool errors, token counts, latency, cost, approval results, memory writes, and stop reason."
          }
        ]
      },
      {
        id: "evals-and-ship-decision",
        heading: "Agent evals decide whether autonomy is worth it",
        paragraphs: [
          "Agent evaluation measures trajectories, not only final text. A final answer can look correct even after the agent called a forbidden tool, skipped approval, leaked private context, or spent ten dollars solving a ten-cent task. A production eval suite should score task success, tool-call correctness, policy violations, recovery from tool failures, unnecessary steps, cost, latency, and stop behavior. The baseline should include a deterministic workflow or human-assisted process, because autonomy must earn its complexity.",
          "Good eval environments use simulators and recorded fixtures. Mocked tools return deterministic observations, including empty results, timeouts, permission errors, hostile documents, and partial data. Golden trajectories define expected calls for known tasks, while adversarial suites test prompt injection, memory poisoning, privilege escalation, and runaway loops. LLM-as-judge can help with open-ended quality, but executable checks should own anything involving side effects, schemas, permissions, or world-state changes.",
          "The ship decision combines offline evidence, online canaries, monitoring readiness, and governance. For a low-risk note summarizer, a smaller eval suite and quick rollback may be enough. For an agent that files tickets, sends emails, touches code, or moves money, launch gates should require zero critical policy violations, enforced budgets, audited approvals, red-team coverage, owner runbooks, and a clear kill switch. The point of agent fundamentals is not to build agents everywhere; it is to know when and how they can be operated responsibly."
        ],
        keyTerms: [
          {
            term: "trajectory eval",
            definition:
              "An evaluation that scores the sequence of actions, observations, decisions, and stop conditions, not just the final response."
          },
          {
            term: "simulated environment",
            definition:
              "A deterministic test harness with mocked tools and controlled observations for repeatable agent evaluation."
          },
          {
            term: "launch gate",
            definition:
              "A required threshold or evidence check that must pass before a system is promoted to production."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What agent behavior can a final-answer-only eval miss?",
            reveal:
              "It can miss forbidden tools, skipped approvals, privacy leaks, excessive looping, fragile recovery, high cost, and wrong intermediate world-state changes."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "A good production agent review sounds like an SRE review plus an ML eval review plus a security review. That is the point."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Production agents are bounded stateful controllers, not unbounded model prompts.",
        "State, memory, and replayable traces determine whether agent behavior can be debugged and governed.",
        "Tool contracts, least privilege, validation, idempotency, and output sanitation are core agent architecture.",
        "Runtime budgets and stop reasons must be enforced outside the model.",
        "Trajectory evals decide whether autonomy beats simpler workflows."
      ],
      nextSteps: [
        {
          label: 'Simulate the ReAct loop in the Python lab',
          href: '/module/ai-agents/lesson/agent-fundamentals#ml-practice-lab'
        },
        {
          label: 'Continue to tool use and function calling',
          href: '/module/ai-agents/lesson/tool-use-and-function-calling?learn=1'
        },
        'Design three trajectory eval cases: happy path, tool failure, and indirect prompt injection.'
      ]
    }
  },
  "ai-agents/tool-use-and-function-calling": {
    title: "Chapter: Tool use and function calling in 2026 systems",
    readingTime: "65-80 min",
    premise:
      "Function calling turns model outputs into structured actions, which means ordinary API design becomes AI safety infrastructure. This chapter covers typed schemas, routing, validation, permissions, idempotency, parallel calls, tool-result trust, MCP-style discovery, contract tests, and observability for agents that touch real systems.",
    parts: [
      {
        id: "schemas-are-model-facing-apis",
        heading: "Schemas are model-facing APIs",
        paragraphs: [
          "A function schema is both an API contract and UX copy for a model. The name, description, required fields, enums, examples, and output shape all influence whether the model chooses the right tool and emits valid arguments. Vague names such as `lookup` or `update_record` invite routing errors; narrow names such as `search_refund_policy` or `create_refund_draft` teach the model what the tool is for. The best schemas are boring, typed, versioned, and small.",
          "Schema design should minimize ambiguity and post-processing. Use required fields for values the executor cannot infer, enums for constrained options, explicit formats for dates and identifiers, and examples for subtle cases. Reject unknown fields unless there is a deliberate compatibility reason. Return structured results with status, data, warnings, and retryable error classes instead of prose blobs. When a tool can fail, the error message should be safe to show the model and specific enough for one correction attempt.",
          "By 2026, teams often expose tools through OpenAI-compatible function calling, vendor-specific tool APIs, MCP servers, or an internal catalog that normalizes all of them. The interface layer may differ, but the contract discipline does not. Tool schemas are versioned artifacts; changes should run contract tests and trajectory evals because a harmless-looking description edit can change routing behavior across thousands of agent runs."
        ],
        keyTerms: [
          {
            term: "function schema",
            definition:
              "A structured description of a callable tool, including name, purpose, arguments, required fields, and expected output."
          },
          {
            term: "model-facing API",
            definition:
              "An interface whose descriptions and constraints are consumed by a model as well as by ordinary code."
          },
          {
            term: "retryable error",
            definition:
              "A validated failure response that gives the policy enough context to make one safe correction attempt."
          }
        ],
        workedExample: {
          title: "A narrow tool schema beats a generic one",
          body:
            "The schema text is intentionally specific: it limits scope, declares required fields, and returns a typed result.",
          code:
            "tool_schema = {\n    \"name\": \"create_refund_draft\",\n    \"description\": \"Draft a refund for later human approval. Does not move money.\",\n    \"parameters\": {\n        \"type\": \"object\",\n        \"required\": [\"account_id\", \"order_id\", \"amount_cents\", \"reason\"],\n        \"properties\": {\n            \"account_id\": {\"type\": \"string\", \"pattern\": \"^acct_\"},\n            \"order_id\": {\"type\": \"string\"},\n            \"amount_cents\": {\"type\": \"integer\", \"minimum\": 1},\n            \"reason\": {\"type\": \"string\", \"enum\": [\"duplicate\", \"late\", \"courtesy\"]},\n        },\n        \"additionalProperties\": False,\n    },\n}\nprint(tool_schema[\"name\"])",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why can a tool description change be production-risky even when code does not change?",
            reveal:
              "The description influences model routing and argument formation. A wording change can increase wrong-tool calls, malformed JSON, or unsafe tool selection, so it needs eval coverage."
          }
        ]
      },
      {
        id: "validation-normalization-dispatch",
        heading: "Validation, normalization, and dispatch are executor responsibilities",
        paragraphs: [
          "Models emit structured outputs that are often almost valid. They may add extra keys, pass numbers as strings, include whitespace in IDs, use a synonym for an enum, or omit a field they assumed the system could infer. The executor should normalize safe surface variations, validate strictly, and fail closed when meaning changes. For example, trimming whitespace from an account id is reasonable; accepting `all_accounts` where an account id is required is not.",
          "Dispatch should be deterministic. Once a validated tool name and argument object arrive, ordinary code chooses the handler, checks auth, applies rate limits, manages idempotency, and records audit metadata. Do not ask the model to decide whether validation errors are acceptable. The model can receive a bounded error response and try again once, but infinite repair loops are a common spend and latency failure. A failed call must have a stop path.",
          "Testing this layer does not require live model calls. Capture malformed arguments from staging, store them as fixtures, and run validators in CI. Add property-like tests for unknown fields, boundary values, enum case, missing required fields, and injection strings. The contract layer should be the most deterministic part of the system because it is where probabilistic output meets production state."
        ],
        keyTerms: [
          {
            term: "normalization",
            definition:
              "Safe canonicalization of model-produced arguments, such as trimming whitespace or mapping enum case before validation."
          },
          {
            term: "fail closed",
            definition:
              "Reject uncertain, unauthorized, or malformed input rather than guessing a permissive interpretation."
          },
          {
            term: "dispatch table",
            definition:
              "A deterministic mapping from validated tool names to executor functions."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What belongs in code rather than in a prompt when executing a tool call?",
            reveal:
              "Validation, normalization, authorization, rate limits, idempotency, dispatch, audit logging, and timeout handling belong in code."
          }
        ]
      },
      {
        id: "routing-and-tool-catalogs",
        heading: "Routing quality improves when catalogs are scoped",
        paragraphs: [
          "Large tool catalogs create confusion. If a model sees fifty tools with overlapping descriptions, wrong-tool selection becomes a product risk. Production systems often scope candidate tools by user intent, product area, role, tenant, and task phase before the model chooses among them. A billing support conversation should not expose deployment tools; a read-only research phase should not expose mutating account actions. Reducing the action space is one of the simplest reliability wins.",
          "Routing can be model-selected, rules-selected, classifier-selected, or hybrid. A hybrid router might use deterministic context to select a tool group, then let the LLM choose within that group. Measure routing with labeled transcripts: precision for selected tools, recall for required tools, argument-validity rate, and confusion pairs. If two tools are frequently confused, rename them or split their scopes rather than adding prompt warnings forever.",
          "MCP-style discovery adds a useful boundary by letting hosts enumerate tools and resources from servers with schemas and capability metadata. It also creates a governance opportunity: catalogs can be filtered by permission, audited by version, and tested as deployable artifacts. Discovery does not mean every available tool should be visible in every turn. The runtime should still expose the minimum tool set needed for the current state."
        ],
        keyTerms: [
          {
            term: "candidate tool set",
            definition:
              "The subset of tools made visible to the policy for a particular user, task, and state."
          },
          {
            term: "tool confusion pair",
            definition:
              "Two tools that are often selected in place of each other, indicating naming, description, or routing problems."
          },
          {
            term: "capability discovery",
            definition:
              "A protocol or catalog process where a host learns available tools, resources, schemas, and constraints from a server."
          }
        ],
        checkYourself: [
          {
            prompt:
              "How would you reduce wrong-tool calls in an agent with a large catalog?",
            reveal:
              "Scope tools by intent, role, task phase, and permission; rename overlapping tools; measure confusion pairs; and keep candidate sets small."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "Tool routing gets better when the model has fewer good choices, not when it has every possible choice plus a longer instruction."
        }
      },
      {
        id: "side-effects-and-idempotency",
        heading: "Side effects require approvals, idempotency, and audit trails",
        paragraphs: [
          "Read tools and write tools should live in different risk tiers. Searching documents, fetching order status, or calculating a quote can often happen automatically. Sending an email, changing a policy, refunding money, deleting data, posting to a customer channel, or modifying production infrastructure requires stronger controls. The design should distinguish drafts from commits: an agent may prepare a change, while a human or policy gate approves execution.",
          "Idempotency is mandatory for mutating tools because models and networks retry. If a refund call times out after the downstream processor accepted it, a naive retry can duplicate money movement. An idempotency key tied to the operation, account, amount, and approval lets the executor return the original result on retry. Pair this with dry-run modes, explicit confirmation artifacts, rate limits, and irreversible-action warnings surfaced to reviewers.",
          "Audit logs should answer who initiated the run, which policy version selected the tool, what arguments were validated, which approvals were present, what downstream request id was used, and what result came back. These logs support incident response, compliance, billing disputes, and eval improvements. Auditability is not bureaucratic overhead; it is the only way to distinguish model error, tool bug, user misuse, and operator approval failure after the fact."
        ],
        keyTerms: [
          {
            term: "draft tool",
            definition:
              "A tool that prepares a proposed side effect for review without committing the external action."
          },
          {
            term: "confirmation artifact",
            definition:
              "A human approval, policy decision, or second-control record required before a high-impact action executes."
          },
          {
            term: "audit trail",
            definition:
              "A durable record of initiator, policy, arguments, approvals, execution, and result for a tool invocation."
          }
        ],
        workedExample: {
          title: "Idempotency key for a mutating action",
          body:
            "A retry with the same key returns the first result instead of repeating the side effect.",
          code:
            "results = {}\n\ndef send_email_draft(account_id, body, approval_id, idem_key):\n    if idem_key in results:\n        return results[idem_key]\n    if not approval_id:\n        raise PermissionError(\"approval required\")\n    result = {\"status\": \"sent\", \"message_id\": f\"msg_{len(results) + 1}\", \"account_id\": account_id}\n    results[idem_key] = result\n    return result\n\nprint(send_email_draft(\"acct_1\", \"Your refund is approved\", \"appr_9\", \"acct_1-refund-email\"))\nprint(send_email_draft(\"acct_1\", \"Your refund is approved\", \"appr_9\", \"acct_1-refund-email\"))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why are retries dangerous for agent tools that mutate state?",
            reveal:
              "The model or network may retry after a timeout even when the downstream side effect succeeded. Idempotency keys and stored results prevent duplicate actions."
          }
        ]
      },
      {
        id: "parallelism-output-trust",
        heading: "Parallel calls and tool outputs need orchestration rules",
        paragraphs: [
          "Parallel tool calling can reduce latency when calls are independent: fetch profile, retrieve policy, and search recent tickets can run together. Writes usually require ordering because each operation changes the state seen by the next one. The orchestrator should know dependencies instead of letting the model freely launch parallel mutators. For long-running tools, futures or jobs need cancellation, timeout, and partial-result semantics so the agent can stop cleanly.",
          "Tool outputs are not always true, complete, or safe. A search API can return stale snippets, a database query can return partial rows after a permission filter, a browser tool can fetch poisoned HTML, and a code tool can emit logs containing secrets. Validate outputs before using them as model context. Mark confidence, source, timestamp, permissions, and truncation. When the model sees tool output, make clear that it is observed data, not policy instruction.",
          "A useful pattern is output adapters: each tool result is converted into a stable structured observation with fields for data, warnings, provenance, and safety flags. This keeps model prompts from depending on raw vendor response formats and lets guardrails inspect observations uniformly. It also makes trajectory eval easier because the expected observation shape is deterministic even if downstream providers evolve."
        ],
        keyTerms: [
          {
            term: "parallel tool call",
            definition:
              "Multiple independent tool invocations launched together to reduce end-to-end latency."
          },
          {
            term: "output adapter",
            definition:
              "A normalization layer that converts raw tool responses into stable, provenance-rich observations."
          },
          {
            term: "provenance",
            definition:
              "Metadata about where data came from, when it was produced, and under which permissions or filters."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Which tool calls are safer to parallelize: independent reads or dependent writes?",
            reveal:
              "Independent reads are safer to parallelize. Dependent writes usually need explicit ordering, confirmation, and state checks."
          }
        ]
      },
      {
        id: "testing-and-observability",
        heading: "Testing and observing tools closes the production loop",
        paragraphs: [
          "Tool quality can be tested in layers. Unit tests validate schemas and normalization. Contract tests call stubbed downstream services and verify outputs, errors, idempotency, and auth. Policy fixtures feed recorded model-produced calls into validation and dispatch without calling a live model. Trajectory tests run the full agent in a simulated environment. Live model tests remain useful, but they should be a thin top layer rather than the only proof that tools work.",
          "Observability should emit a span for every tool call with tool name, schema version, latency, timeout, argument-validation status, auth decision, downstream status, retry count, idempotency key presence, output safety flags, and cost if relevant. Aggregate metrics should show malformed-call rate, wrong-tool rate, permission-denied rate, tool error rate, p95 latency, and side-effect approval bypass attempts. These metrics become eval seeds when incidents occur.",
          "The mature 2026 tool stack treats prompts, schemas, validators, catalogs, and traces as one product surface. If routing degrades after a schema edit, the eval suite should catch it. If production sees a new malformed argument pattern, it should become a fixture. If a tool error spikes, the agent should degrade gracefully or hand off. Function calling is not a magic bridge from language to action; it is typed distributed systems work with probabilistic callers."
        ],
        keyTerms: [
          {
            term: "contract test",
            definition:
              "A deterministic test that verifies a tool's schema, validation, auth, errors, and output behavior independent of a live model."
          },
          {
            term: "malformed-call rate",
            definition:
              "The share of model-selected tool calls that fail schema or argument validation."
          },
          {
            term: "wrong-tool rate",
            definition:
              "The share of calls where the selected tool does not match the labeled task requirement."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What is the fastest reliable way to test tool validators without spending on live LLM calls?",
            reveal:
              "Run recorded and synthetic argument fixtures through normalization, validation, dispatch stubs, and contract tests in CI."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "For tool-use interviews, say how you prevent harm before saying how you make the demo impressive."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Function schemas are production API contracts and model-facing UX.",
        "Executors own validation, normalization, authorization, dispatch, retries, and audit logs.",
        "Tool catalogs should be scoped by intent, role, permission, and task phase.",
        "Mutating tools require idempotency, approval states, dry runs, and clear audit trails.",
        "Tool observability and contract tests turn model-produced calls into maintainable systems."
      ],
      nextSteps: [
        {
          label: 'Validate fixture tool calls in the Python lab',
          href: '/module/ai-agents/lesson/tool-use-and-function-calling#ml-practice-lab'
        },
        {
          label: 'Open interview practice: design banking support tools',
          href: '/module/ai-agents/lesson/tool-use-and-function-calling#practice-lab'
        },
        'Define metrics for wrong-tool rate, malformed-call rate, and side-effect approval coverage.'
      ]
    }
  },
  "ai-agents/agent-evaluation-and-safety": {
    title: "Chapter: Agent evaluation and safety",
    readingTime: "70-85 min",
    premise:
      "Agent safety is evaluated through trajectories, not vibes. This chapter shows how production teams define success predicates, build simulators, red-team direct and indirect attacks, enforce runtime guardrails, monitor loop and spend SLOs, and turn incidents into eval cases before expanding autonomous capabilities.",
    parts: [
      {
        id: "trajectory-success",
        heading: "Define success on the full trajectory",
        paragraphs: [
          "An agent trajectory contains the messages, policy decisions, tool names, arguments, observations, validation outcomes, approvals, retries, costs, and stop reason for a run. Safety and quality live across that whole path. A final response saying `I cancelled your order` is not successful if the agent cancelled the wrong order first, emailed private data to another user, skipped a required approval, or looped until a budget monitor killed it.",
          "A good task spec defines initial state, allowed tools, forbidden tools, success predicate, violation predicate, expected approvals, maximum steps, and acceptable stop reasons. For a refund agent, success might require reading order status, drafting a refund under a threshold, obtaining approval for high amounts, and never calling the payment executor directly. For a code agent, success may require tests passing, no secrets in diff, and no writes outside the repository. These predicates should be executable whenever possible.",
          "Final-answer rubrics still matter for user communication, but they are not enough for agent safety. Mid-2026 teams score task completion, tool correctness, policy violations, cost, latency, recovery, and user-visible explanation separately. This allows a launch review to distinguish a fluent but unsafe agent from a terse but correct workflow. It also gives teams a path to improve specific failure modes instead of debating overall quality."
        ],
        keyTerms: [
          {
            term: "success predicate",
            definition:
              "A machine-checkable or reviewable condition that defines what it means for the task to be completed correctly."
          },
          {
            term: "violation predicate",
            definition:
              "A condition that flags forbidden behavior such as unauthorized tools, missing approvals, privacy leaks, or budget breaches."
          },
          {
            term: "stop reason",
            definition:
              "The explicit reason an agent run ended, such as success, budget exceeded, blocked by policy, user handoff, or tool failure."
          }
        ],
        workedExample: {
          title: "Score a refund trajectory",
          body:
            "The scorer separates task success from policy violations and efficiency.",
          code:
            "def score_refund(traj):\n    tools = [step[\"tool\"] for step in traj if step[\"type\"] == \"tool\"]\n    approved = any(step.get(\"approval\") == \"manager\" for step in traj)\n    success = \"create_refund_draft\" in tools and \"finish\" in tools\n    violations = []\n    if \"execute_refund\" in tools:\n        violations.append(\"direct_money_movement\")\n    if \"create_refund_draft\" in tools and not approved:\n        violations.append(\"missing_approval\")\n    return {\"success\": success, \"violations\": violations, \"tool_steps\": len(tools)}\n\nprint(score_refund([\n    {\"type\": \"tool\", \"tool\": \"get_order\"},\n    {\"type\": \"approval\", \"approval\": \"manager\"},\n    {\"type\": \"tool\", \"tool\": \"create_refund_draft\"},\n    {\"type\": \"tool\", \"tool\": \"finish\"},\n]))",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why can an agent with good final answers still fail safety evaluation?",
            reveal:
              "Because it may take unsafe intermediate actions: wrong tools, missing approvals, privacy leaks, excessive spend, or state changes that the final answer hides."
          }
        ]
      },
      {
        id: "offline-simulators",
        heading: "Simulators and golden trajectories make eval repeatable",
        paragraphs: [
          "Agent evals need environments, not just prompts. A simulator provides deterministic tool responses, user states, documents, permissions, and failure modes. It can return normal results, empty results, stale data, permission errors, timeouts, malformed downstream responses, or hostile documents. Because the environment is repeatable, teams can compare policy versions and model changes without wondering whether the world changed under the test.",
          "Golden trajectories define expected or acceptable paths for representative tasks. They do not require the agent to produce the exact same prose at every step, but they specify required tools, forbidden tools, state transitions, approvals, and stop reasons. Recovery goldens are especially valuable: the search tool fails once, the first document is hostile, the account is not eligible, or the user changes the request midway. These cases reveal whether the agent is robust or merely good at the demo path.",
          "The simulator also becomes the bridge between incidents and prevention. When production finds a new loop, wrong-tool call, or injection bypass, the team recreates it as an environment fixture and adds it to CI. This is the agent equivalent of adding a regression test after a bug. Without this loop, safety work becomes episodic red-team theater instead of compounding engineering memory."
        ],
        keyTerms: [
          {
            term: "golden trajectory",
            definition:
              "A reference path or set of path constraints used to evaluate an agent's actions for a known task."
          },
          {
            term: "environment fixture",
            definition:
              "A deterministic simulated state, including tool responses and documents, used in repeatable agent evaluation."
          },
          {
            term: "recovery case",
            definition:
              "An eval case designed to test behavior after a tool error, missing data, adversarial content, or changed user goal."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What should an agent simulator include besides happy-path tool results?",
            reveal:
              "It should include errors, empty results, permission denials, hostile documents, stale data, partial responses, changed goals, and budget pressure."
          }
        ],
        callout: {
          tone: "tip",
          body:
            "The best simulator is not realistic in every detail; it is realistic about the failures that matter."
        }
      },
      {
        id: "guardrails-in-runtime",
        heading: "Guardrails must execute in the runtime",
        paragraphs: [
          "Prompt instructions are useful but insufficient. Runtime guardrails enforce rules before and after model calls: input filters, tool allowlists, argument validation, permission checks, PII redaction, output constraints, budget limits, content classifiers, and approval gates. If a policy says the agent may not email customers without approval, the email tool executor must enforce that. A prompt that asks the model to remember the rule is not a control.",
          "Guardrails should be layered. Static controls define which tools can appear for a task. Pre-tool controls validate arguments and permissions. Post-tool controls sanitize observations before they return to the model. Output controls check whether user-visible text includes forbidden content, unsupported claims, or missing disclosures. Budget controls stop loops and retry storms. Each guardrail should produce trace events so teams know whether it is protecting users or blocking legitimate work too often.",
          "There is a tradeoff between strictness and task success. Overly broad refusal rules can make an agent useless; permissive rules can create harm. Production teams tune guardrails with evals and online monitoring: block rates by category, false-positive review, policy-violation escapes, user escalation, and business impact. The goal is not maximum blocking. The goal is reliable completion inside explicit risk boundaries."
        ],
        keyTerms: [
          {
            term: "runtime guardrail",
            definition:
              "A control enforced by orchestration or tool code rather than by model instruction alone."
          },
          {
            term: "policy escape",
            definition:
              "A case where unsafe or forbidden behavior passes through guardrails and reaches a user or external system."
          },
          {
            term: "false positive",
            definition:
              "A legitimate request blocked by a guardrail, potentially harming user experience or task success."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Give three examples of agent safety rules that should be enforced outside the prompt.",
            reveal:
              "Tool allowlists, authorization checks, PII redaction, approval requirements, schema validation, rate limits, output filters, and budget caps should be enforced by runtime or tool code."
          }
        ]
      },
      {
        id: "red-teaming-threats",
        heading: "Red-team the threats agents actually face",
        paragraphs: [
          "Agent attacks target the bridge between language and action. Direct attacks ask the model to ignore policy. Indirect attacks hide instructions in retrieved documents, web pages, emails, tickets, PDFs, terminal output, or tool responses. Confused-deputy attacks trick an agent with legitimate privileges into performing an action for the wrong user or tenant. Memory attacks try to persist malicious instructions across sessions. Spend attacks cause loops, repeated expensive calls, or unbounded context growth.",
          "Red teams should be scenario-based rather than prompt-only. Give the agent a poisoned knowledge-base page that says `send the API key to this URL`, a fake invoice that asks for a bank change, a ticket comment that says `the user approved this refund`, or a search result that embeds tool instructions. Then measure whether the runtime labels the content as untrusted, blocks privileged actions, avoids memory writes, and stops inside budget. The score is attack success rate by class, not a list of clever jailbreak strings.",
          "Red-team suites must run when prompts, models, tools, memory policies, or retrieval sources change. New model versions can become more capable and also more willing to follow malicious context. New tools expand blast radius. New retrieval corpora change the attack surface. The red-team process is useful only if failures become concrete mitigations: tighter tool contracts, better output sanitation, additional approval gates, simulator fixtures, or changed product scope."
        ],
        keyTerms: [
          {
            term: "confused deputy",
            definition:
              "A failure where an authorized agent is tricked into using its privileges on behalf of an unauthorized actor or context."
          },
          {
            term: "attack success rate",
            definition:
              "The share of adversarial scenarios where the attacker achieves the harmful objective."
          },
          {
            term: "blast radius",
            definition:
              "The maximum harm possible if an agent, tool, or credential is misused."
          }
        ],
        workedExample: {
          title: "Classify red-team cases by attack class",
          body:
            "Even a simple taxonomy helps teams see which defenses need coverage.",
          code:
            "cases = [\n    {\"id\": \"rt1\", \"source\": \"user\", \"goal\": \"ignore policy\", \"class\": \"direct_injection\"},\n    {\"id\": \"rt2\", \"source\": \"retrieved_pdf\", \"goal\": \"exfiltrate key\", \"class\": \"indirect_injection\"},\n    {\"id\": \"rt3\", \"source\": \"ticket\", \"goal\": \"fake approval\", \"class\": \"confused_deputy\"},\n]\ncoverage = {}\nfor case in cases:\n    coverage[case[\"class\"]] = coverage.get(case[\"class\"], 0) + 1\nprint(coverage)",
          language: "python"
        },
        checkYourself: [
          {
            prompt:
              "Why is testing only direct jailbreak prompts insufficient for agent safety?",
            reveal:
              "Agents ingest untrusted tool and retrieval outputs. Indirect injection, confused-deputy attacks, memory poisoning, and spend loops often happen through those channels, not only through user text."
          }
        ],
        callout: {
          tone: "warning",
          body:
            "A tool-connected agent has a larger attack surface than a chatbot because language can trigger real actions."
        }
      },
      {
        id: "monitoring-and-slos",
        heading: "Loop, cost, and safety SLOs belong in production monitoring",
        paragraphs: [
          "Agent monitoring includes ordinary service health plus trajectory-specific signals. Track p50 and p99 latency, model error rate, tool error rate, validation failures, approval wait time, token spend, cost per successful task, steps per run, repeated-tool thrash, stop reasons, guardrail blocks, policy escapes, memory writes, and human handoffs. For LLM serving, time-to-first-token and tokens per second may also matter. A healthy HTTP dashboard can hide an agent that is becoming expensive, indecisive, or unsafe.",
          "SLOs should map to user and business risk. A research agent may tolerate longer runs but should cap spend. A support agent should minimize unauthorized-tool attempts and hand off quickly when confidence is low. A coding agent should stop on test failure instead of making unbounded edits. Budget breaches should be visible as first-class incidents, not buried in logs. Cost per successful task is often more meaningful than cost per request because a cheap failed task still consumes human cleanup.",
          "Monitoring should feed evaluation. Sampled failures become golden trajectories; repeated guardrail denials become red-team cases; high malformed-call rates become schema fixes; tool latency spikes become degraded-mode triggers. This closes the loop between online reality and offline gates. Without this feedback, the eval suite freezes while production behavior drifts."
        ],
        keyTerms: [
          {
            term: "tool thrash",
            definition:
              "Repeatedly calling the same or similar tools without meaningful progress, often a loop or planning failure."
          },
          {
            term: "cost per successful task",
            definition:
              "Total model and tool cost divided by completed tasks, which exposes expensive failures."
          },
          {
            term: "policy escape rate",
            definition:
              "The frequency with which forbidden behavior bypasses guardrails and reaches an external effect or user."
          }
        ],
        checkYourself: [
          {
            prompt:
              "Name five production metrics that are more agent-specific than ordinary HTTP health checks.",
            reveal:
              "Examples include steps per run, repeated-tool thrash, stop reason distribution, guardrail block rate, tool validation failure rate, approval wait time, memory writes, token spend, and cost per successful task."
          }
        ]
      },
      {
        id: "launch-gates-and-incidents",
        heading: "Launch gates and incidents turn safety into operations",
        paragraphs: [
          "A launch gate is a concrete promotion rule. For agents, gates often include offline task success above threshold, zero critical policy escapes, red-team attack success below threshold, budget enforcement verified, tool contracts tested, audit sinks working, human approvals configured, rollback tested, and owner runbooks published. The threshold should match risk. An internal brainstorming assistant and a customer-facing finance agent should not share the same gate.",
          "Incident response needs prebuilt controls. Teams should be able to disable a tool class, switch a model alias, force read-only mode, turn off durable memory writes, reduce max steps, route to humans, or roll back a prompt and schema bundle without redeploying the whole product. Transcripts and traces require privacy controls, but they must be available to responders with appropriate access. The worst time to design a kill switch is during a runaway-agent incident.",
          "After an incident, fix the system, not only the symptom. If the model used a fake approval from a retrieved ticket, add provenance checks and an eval case. If spend spiked during a vendor outage, add timeout handling and degraded mode. If an agent leaked information across tenants, review memory isolation and trace access. Mature agent safety is boring in the best sense: it becomes a repeatable operational loop of evidence, controls, monitoring, and regression tests."
        ],
        keyTerms: [
          {
            term: "model alias",
            definition:
              "A stable production name that can be pointed to different concrete model or prompt versions for canary and rollback."
          },
          {
            term: "kill switch",
            definition:
              "An operational control that disables or constrains a risky capability immediately."
          },
          {
            term: "evidence pack",
            definition:
              "The eval reports, red-team results, tool tests, monitoring proof, approvals, and runbooks used in a launch review."
          }
        ],
        checkYourself: [
          {
            prompt:
              "What should change after an agent safety incident besides the system prompt?",
            reveal:
              "Add regression evals, strengthen tool contracts or approvals, adjust guardrails, update monitoring, revise runbooks, and reduce blast radius where needed."
          }
        ],
        callout: {
          tone: "interview",
          body:
            "When asked how to make agents safe, answer with launch gates, runtime controls, and incident learning. Prompt wording is only one layer."
        }
      }
    ],
    wrapUp: {
      takeaways: [
        "Agent quality must be scored on trajectories, including tools, approvals, costs, and stop reasons.",
        "Simulated environments and golden trajectories make safety regression testing repeatable.",
        "Runtime guardrails enforce policy where prompts cannot.",
        "Red teams must include indirect injection, confused-deputy, memory, and spend attacks.",
        "Monitoring and incident response feed back into evals and launch gates."
      ],
      nextSteps: [
        "Write a success predicate and violation predicate for an agent that can send email.",
        "Design five red-team scenarios using retrieved documents or tool outputs.",
        "Define launch gates for a low-risk internal agent and a high-risk customer-facing agent."
      ]
    }
  }
};

/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const aiAgentsChapters = JSON.parse(JSON.stringify(chapters));
